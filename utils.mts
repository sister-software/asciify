/**
 * @fileoverview
 * This file is the entry point for the @sister.software/asciify module.
 *
 * @see {@link https://sister.software/asciify API documentation}
 * @module @sister.software/asciify
 * @copyright Sister Software. All rights reserved.
 * @license MIT
 * @author Teffen Ellis
 */

/**
 * Either a canvas or an offscreen canvas.
 * Note that the offscreen canvas support varies between browsers.
 * Safari tends to produce slight visual artifacts when using offscreen canvases.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas MDN on Offscreen Canvas}
 */
export type CanvasLike = OffscreenCanvas | HTMLCanvasElement

/**
 * Either a canvas 2D context or an offscreen canvas 2D context.
 * Note that the offscreen canvas support varies between browsers.
 * Safari tends to produce slight visual artifacts when using offscreen canvases.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvasRenderingContext2D MDN on Offscreen Canvas 2D Context}
 */
export type Canvas2dContextLike = OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D

/**
 * @ignore
 * @internal
 */
export const isWebGLRenderer = (object: unknown): object is THREE.WebGLRenderer => {
  return typeof object === 'object' && object !== null && 'setSize' in object
}

/**
 * @ignore
 * @internal
 */
export const isCanvasLike = (object: CanvasLike | Canvas2dContextLike): object is CanvasLike => {
  return typeof object === 'object' && object !== null && 'getContext' in object
}

/**
 * Creates a canvas-like object given the environment.
 * @ignore
 * @internal
 */
export function createCanvasLike(
  /**
   * Force a specific canvas-like object to be created.
   * @default 'canvas' in the browser, 'offscreen' in Node.js and Workers
   */
  preferred?: 'canvas' | 'offscreen'
): CanvasLike {
  if (typeof preferred === 'undefined') {
    if (typeof document !== 'undefined') {
      // Given a browser-like environment, prefer a canvas...
      preferred = 'canvas'
    } else if (typeof OffscreenCanvas !== 'undefined') {
      preferred = 'offscreen'
    }
  }

  switch (preferred) {
    case 'canvas':
      return document.createElement('canvas')
    case 'offscreen':
      return new OffscreenCanvas(1, 1)
  }

  throw new Error('Environment does not appear to support canvas-like objects')
}

/**
 * Plucks a 2D context from a canvas-like object.
 * @ignore
 * @internal
 */
export function pluck2dContext(
  canvasLike: CanvasLike,
  options: CanvasRenderingContext2DSettings = {
    alpha: false,
    willReadFrequently: true,
    desynchronized: true,
  }
): Canvas2dContextLike {
  if (isCanvasLike(canvasLike)) {
    return canvasLike.getContext('2d', options) as CanvasRenderingContext2D
  }

  return canvasLike as CanvasRenderingContext2D
}

/**
 * Given an array of 255 or less ASCII characters representing the brightness of each pixel,
 * returns something like a radix-sorted array of 255 characters that are evenly spaced.
 *
 * This helps us avoid expensive operations like Math.floor() when rendering the ASCII art.
 *
 * @category Utility
 * @internal
 * @see {@linkcode https://github.com/v8/v8/blob/b584c57/src/compiler/typed-optimization.cc#L471 TypedOptimization::TryBuildCharacterCodeRadix}
 */
export function createCharacterCodeRadix(asciiCharacters: string[]): Uint16Array {
  const averagedCharacterSet = new Uint16Array(255)

  // We need at least one space to represent an empty pixel.
  if (asciiCharacters[0] !== ' ') {
    asciiCharacters = [' ', ...asciiCharacters]
  }

  if (asciiCharacters.length > 255) {
    console.warn('The character set is too large. Only first 255 characters will be used.')
  }

  for (let i = 0; i < 255; i++) {
    const index = Math.floor((i / 255) * asciiCharacters.length)
    let characterCode = asciiCharacters[index].charCodeAt(0)

    if (!(characterCode >= 0 && characterCode <= 127)) {
      console.warn(`Character "${asciiCharacters[index]}" is not in the ASCII range.`)
      characterCode = 0
    }
    if (characterCode >= 0 && characterCode <= 31) {
      console.warn(`Character "${asciiCharacters[index]}" is a control character.`)
      characterCode = 0
    }

    if (characterCode === 32) {
      // Spaces are labeled as 0 so we can skip them.
      characterCode = 0
    }

    averagedCharacterSet[i] = characterCode
  }

  return averagedCharacterSet
}

/**
 * A precomputed lookup table to help us traverse the pixel buffer.
 *
 * Each character cell is represented by six values:
 * ```ts
 * [x1, y1, red1, green1, blue1, alpha1, xN, yN, redN, greenN, blueN, alphaN...]
 * ```
 *
 * The length of this array is equal to the area of the row and column counts.
 */
export class IndexLookupTable extends Uint32Array {
  constructor(rowCount: number, columnCount: number) {
    super(rowCount * columnCount * 6)
  }
}

/**
 * Creates a precomputed lookup table for a given pixel buffer.
 *
 * This is used to avoid expensive and repetitive calculations when rendering the ASCII art.
 * The lookup table is a Uint16Array containing pairs of six values:
 *
 * - The x coordinate of the character cell
 * - The y coordinate of the character cell
 * - The index of the red channel from the pixel buffer
 * - The index of the green channel from the pixel buffer
 * - The index of the blue channel from the pixel buffer
 * - The index of the alpha channel from the pixel buffer
 *
 * @category Utility
 * @internal
 */
export function createIndexLookupTable(rowCount: number, columnCount: number, fontSize: number, lineHeight: number) {
  const lookupTables = [
    new IndexLookupTable(rowCount, columnCount),
    // We need a second buffer for the flipped Y axis.
    new IndexLookupTable(rowCount, columnCount),
  ]

  const characterSize = fontSize * lineHeight

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const y = rowIndex * characterSize
    const flippedY = (rowCount - rowIndex) * characterSize

    for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
      const x = columnIndex * characterSize
      const i = (rowIndex * columnCount + columnIndex) * 6
      // Times 4 because each pixel is represented by 4 values in the buffer.
      const redIndex = (rowIndex * columnCount + columnIndex) * 4

      for (const [tableIndex, lookupTable] of lookupTables.entries()) {
        lookupTable[i] = x
        lookupTable[i + 1] = tableIndex === 0 ? y : flippedY
        lookupTable[i + 2] = redIndex // Red channel
        lookupTable[i + 3] = redIndex + 1 // Green channel
        lookupTable[i + 4] = redIndex + 2 // Blue channel
        lookupTable[i + 5] = redIndex + 3 // Alpha channel
      }
    }
  }

  return lookupTables
}
