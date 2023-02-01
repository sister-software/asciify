/**
 * @fileoverview
 * This file contains utility functions for the @sister.software/asciify module.
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
    if (typeof OffscreenCanvas !== 'undefined') {
      // Given a browser-like environment, prefer a canvas...
      preferred = 'canvas'
    } else if (typeof document !== 'undefined') {
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
  canvasLike: CanvasLike | Canvas2dContextLike,
  options: CanvasRenderingContext2DSettings = {}
): Canvas2dContextLike {
  if (isCanvasLike(canvasLike)) {
    return canvasLike.getContext('2d', {
      alpha: false,
      desynchronized: true,
      ...options,
    }) as CanvasRenderingContext2D
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
export class LuminanceCharacterCodeMap extends Map<
  /** The luminance of the pixel. 0 to 255. */
  number,
  /** The character code of the character to render. */
  number
> {
  constructor(readonly characterSet: string[], contrastRatio: number) {
    const asciiCharacters = characterSet.slice()
    const averagedCharacterSet: Array<[number, number]> = []

    for (let i = 0; i < contrastRatio; i++) {
      asciiCharacters.unshift(' ')
    }

    if (asciiCharacters.length > 255) {
      console.warn('The character set is too large. Only first 255 characters will be used.')
    }

    for (let luminance = 0; luminance < 255; luminance++) {
      const index = Math.floor((luminance / 255) * asciiCharacters.length)
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

      averagedCharacterSet.push([luminance, characterCode])
    }

    super(averagedCharacterSet)
  }
}

// export type TextureCache = ImageData[]

export class TextureCache extends Map<number, ImageData> {
  constructor(
    luminanceCodeMap: LuminanceCharacterCodeMap,
    fontSize: number,
    fontFamily: string,
    pixelRatio: number,
    backgroundColor: string,
    debug = false
  ) {
    const canvas = createCanvasLike()
    const ctx = pluck2dContext(canvas, {
      willReadFrequently: true,
    })

    const renderedFontSize = fontSize * pixelRatio
    canvas.width = renderedFontSize
    canvas.height = renderedFontSize

    ctx.font = `${renderedFontSize * 1}px ${fontFamily}`
    ctx.fillStyle = 'black'
    ctx.fontKerning = 'none'
    ctx.textBaseline = 'top'
    ctx.save()

    const texturePairs: Array<[number, ImageData]> = []

    for (const [luminance, characterCode] of luminanceCodeMap.entries()) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (debug) {
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.fillStyle = 'black'
        // We use a circle to make it easier to see the edges of the individual characters.
        ctx.beginPath()
        ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, 2 * Math.PI)
        ctx.fill()
      } else {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      if (characterCode !== 0) {
        ctx.fillStyle = 'white'

        const text = String.fromCharCode(characterCode)
        const textMetrics = ctx.measureText(text)
        const x = (canvas.width - textMetrics.width) / 2
        const y = (canvas.height - renderedFontSize) / 2

        ctx.fillText(text, x, y)
      }

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

      ctx.restore()

      texturePairs.push([luminance, imageData])
    }

    super(texturePairs)
  }
}

export type CharacterCoords = Map<number, [number, number]>

/**
 * A precalculated lookup table to help us traverse the pixel buffer.
 * ```ts
 * [red1, green1, blue1, alpha1, redN, greenN, blueN, alphaN...]
 * ```
 *
 * @remarks
 *
 * By precalculating a frequent traversal through a pixel buffer,
 * we can avoid expensive and repetitive calculations while during rasterization.
 *
 * The pixel index contains groups of four values that represent the RGBA values of a pixel:
 *
 * - Red channel index
 * - Green channel index
 * - Blue channel index
 * - Alpha channel index
 *
 * The length of this array is equal to the area of the row and column counts.
 *
 * @category Utility
 * @internal
 */
export class LookupTable {
  /**
   * The lookup table used to map the RGBA buffer to the ASCII art canvas.
   */
  public readonly pixelIndex: Uint32Array
  /**
   * The lookup table used to map the RGBA buffer to the ASCII art canvas.
   * This is the same as {@linkcode pixelIndex}, but with the Y axis flipped for WebGL.
   */
  public readonly pixelIndexFlippedY: Uint32Array
  public readonly coords: CharacterCoords
  public readonly coordsFlipped: CharacterCoords

  constructor(public rowCount: number, public columnCount: number, characterHeight: number, pixelRatio: number) {
    const lookupTables = [
      new Uint32Array(rowCount * columnCount * 4),
      // We need a second buffer for the flipped Y axis.
      new Uint32Array(rowCount * columnCount * 4),
    ]

    const coordPairs: CharacterCoords[] = [new Map(), new Map()]

    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      const y = rowIndex * characterHeight * 2
      const flippedY = (rowCount - rowIndex - 2) * characterHeight * pixelRatio + characterHeight * pixelRatio

      for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
        const x = (columnCount - columnIndex - 1) * characterHeight * pixelRatio
        const xFlipped = columnIndex * characterHeight * pixelRatio

        // Times 4 because each pixel is represented by 4 grouped values in the buffer.
        const redIndex = (rowIndex * columnCount + columnIndex) * 4
        const greenIndex = redIndex + 1
        const blueIndex = redIndex + 2
        const alphaIndex = redIndex + 3

        for (const [tableIndex, lookupTable] of lookupTables.entries()) {
          const xVal = tableIndex === 0 ? xFlipped : x
          const yVal = tableIndex === 0 ? y : flippedY

          lookupTable[redIndex] = redIndex
          lookupTable[greenIndex] = greenIndex
          lookupTable[blueIndex] = blueIndex
          lookupTable[alphaIndex] = alphaIndex

          coordPairs[tableIndex].set(redIndex, [xVal, yVal])
        }
      }
    }

    this.pixelIndex = lookupTables[0]
    this.pixelIndexFlippedY = lookupTables[1]
    this.coords = coordPairs[0]
    this.coordsFlipped = coordPairs[1]
  }

  get length() {
    return this.coords.size
  }
}
