/**
 * @file This file is part of the Keywork project.
 * @copyright Sister Software. All rights reserved.
 * @license MIT
 * @author Sister Software, et al.
 */

export const DEFAULT_CHAR_SET = `   ..,'":;-~=+*#&%@`.split('')
export const DEFAULT_BW_CHAR_LIST = '  .,:;i1tfLCG08@'.split('')
export const DEFAULT_COLOR_CHAR_LIST = '  CGO08@'.split('')

export type CanvasLike = OffscreenCanvas | HTMLCanvasElement
export type Canvas2dContextLike = OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D

export type ASCIIMode = 'bw' | 'color'

export interface AsciifyOptions {
  /**
   * The available characters to use for the ASCII art.
   * Characters should be in order of "brightness",
   * with a space being the least bright and the last character being the most bright.
   */
  characterSet: string[]

  /**
   * The font family to use for the ASCII art.
   * @default 'monospace'
   */
  fontFamily: string

  /**
   * The font size to use for the ASCII art.
   *
   * The larger the font size, the fewer characters will fit on the screen.
   * Make sure to use a known font size, otherwise Safari will choose an approximate size.
   * @default 10
   */
  fontSize: number

  /**
   * The line height to use for the ASCII art. This should be a multiple of the font size.
   * @default 1.5
   */
  lineHeight: number

  /**
   * The mode to use for the ASCII art.
   * @default 'bw'
   * @remarks
   * Can be one of the following:
   *
   * - `'bw'` Black and white
   * - `'color'` Color
   *
   * @default 'color'
   */
  mode: ASCIIMode

  /**
   * Whether to use block characters for the ASCII art.
   * Overrides the character set.
   * @default false
   */
  block: boolean

  /**
   * The background color of the canvas.
   */
  backgroundColor: string

  /**
   * The canvas context to use for the ASCII art.
   * This is an optional parameter, and if not provided, a new context will be created.
   */
  context?: CanvasRenderingContext2D
}

export const DefaultOptions: Readonly<AsciifyOptions> = {
  characterSet: DEFAULT_CHAR_SET,
  fontSize: 10,
  lineHeight: 1.5,
  fontFamily: 'monospace',
  backgroundColor: 'black',
  mode: 'color',
  block: false,
}

/**
 * Converts images, videos, and 3D renders into ASCII art.
 *
 * ```ts
 * const canvas = document.createElement('canvas')
 * const asciify = new ASCIIRasterizer(canvas)
 *
 * asciify.setSize(window.innerWidth, window.innerHeight)
 * asciify.rasterize(image)
 * ```
 */
export class Asciify {
  public canvas: CanvasLike
  public ctx: Canvas2dContextLike

  public columnCount = 0
  public rowCount = 0

  protected readonly _mode: ASCIIMode
  protected readonly _fillStyleFn: FillStyleFn
  protected readonly _block: boolean

  public backgroundColor: string

  public fontFamily: string
  public fontSize: number

  protected _computedLineHeight: number
  protected _characterCodeRadix: Uint8Array

  /**
   * Sets the size of the ASCII art canvas, updating the number of columns and rows.
   *
   * You should call this method whenever the size of the parent canvas changes.
   * If used with a Three.js renderer, you should resize the render after calling this method.
   *
   * ```ts
   * asciify.setSize(width, height)
   * renderer.setSize(asciify.columnCount, asciify.rowCount)
   * ```
   */
  public setSize(nextWidth: number, nextHeight: number, devicePixelRatio = window.devicePixelRatio): void {
    this.canvas.width = nextWidth
    this.canvas.height = nextHeight

    if (this.canvas instanceof HTMLCanvasElement) {
      const dipRect = this.canvas.getBoundingClientRect()

      this.canvas.width = Math.round(devicePixelRatio * dipRect.right) - Math.round(devicePixelRatio * dipRect.left)
      this.canvas.height = Math.round(devicePixelRatio * dipRect.bottom) - Math.round(devicePixelRatio * dipRect.top)
    } else {
      this.canvas.width = nextWidth
      this.canvas.height = nextHeight
    }

    // The canvas is split into a grid of cells.
    // The width and height of each cell is determined by the font size and device pixel ratio.
    this.columnCount = Math.round(this.canvas.width / this.fontSize)
    this.rowCount = Math.round(this.canvas.height / this.fontSize)

    this._updateStyles()
  }

  /**
   * Triggers an internal style update.
   * @internal
   */
  public _updateStyles(devicePixelRatio = window.devicePixelRatio): void {
    const fontSize = this.fontSize * devicePixelRatio

    this.ctx.fontKerning = 'none'
    this.ctx.textAlign = 'left'
    this.ctx.textBaseline = 'top'
    this.ctx.font = `${fontSize}px ${this.fontFamily}`
  }

  /**
   * Updates the character set used for the ASCII art.
   * This can be used to change the character set on the fly during an animation.
   *
   * @param characterSet The next character set to use for the ASCII art.
   */
  public updateCharacterSet(characterSet: string[]): void {
    this._characterCodeRadix = createCharacterCodeRadix(characterSet)
  }

  /**
   * Renders an image to the ASCII art canvas.
   *
   * @param rgbaBuffer A buffer containing the RGBA values of the image.
   * @param flipY Whether to flip the image vertically. Useful when rendering a Three.js scene.
   * @param persistCanvas Whether to persist the canvas. Useful when composing multiple images.
   * @see {readFromThreeJS}
   */
  public rasterize(rgbaBuffer: Uint8ClampedArray, flipY?: boolean, persistCanvas?: boolean): void {
    if (!persistCanvas) {
      this.ctx.fillStyle = this.backgroundColor
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    }

    for (let i = 0; i < rgbaBuffer.length; i += 4) {
      const alpha = rgbaBuffer[i + 3]

      if (alpha === 0) {
        continue
      }

      const red = rgbaBuffer[i]
      const green = rgbaBuffer[i + 1]
      const blue = rgbaBuffer[i + 2]

      // Approximate of luminance. See https://en.wikipedia.org/wiki/Relative_luminance
      // This gives us a number between 0 and 255.
      const luminance = (red * 299 + green * 587 + blue * 114) >> 10

      // Now, we need to find the character that best matches the luminance.
      const characterCode = this._characterCodeRadix[luminance]

      if (characterCode === 0) {
        // If the character code is 0, it means that the luminance is too low to
        // be represented by any of the characters in the character set.
        continue
      }

      // First, we need to calculate the x and y coordinates of the current pixel.
      // Each pixel is represented by a character, so we need to divide the
      // current index by 4 to get the correct pixel.
      const n = i / 4

      // The y coordinate is the current index divided by the number of columns,
      // floored, and scaled by the font size and device pixel ratio.
      let y = Math.round((n / this.columnCount) * this._computedLineHeight)

      // The x coordinate is the remainder of the current index divided by the
      // number of columns, scaled by the font size and device pixel ratio.
      const x = (n % this.columnCount) * this.fontSize

      // Now, flip the coordinates so they are right-side up.
      if (flipY) {
        y = this.canvas.height - y - this.fontSize
      }

      if (this._block) {
        this.ctx.fillRect(x, y, this.fontSize, this.fontSize)
      } else {
        this.ctx.fillStyle = this._fillStyleFn(red, green, blue, alpha, luminance)
        this.ctx.strokeStyle = this.ctx.fillStyle

        this.ctx.fillText(String.fromCharCode(characterCode), x, y)
      }
    }
  }

  /**
   * Returns the character that best matches the given brightness.
   * @param luminance A number between 0 and 1.
   */
  public getCharacterFromLuminance(luminance: number) {
    const characterCode = this._characterCodeRadix[luminance]
    return String.fromCharCode(characterCode)
  }

  constructor(canvas: HTMLCanvasElement, options: Partial<AsciifyOptions> = {}) {
    this._mode = options.mode ?? DefaultOptions.mode
    this._fillStyleFn = _fillStyleFunctions.get(this._mode)!

    const characterSetSource =
      options.characterSet ?? (options.mode === 'bw' ? DEFAULT_BW_CHAR_LIST : DEFAULT_COLOR_CHAR_LIST)
    this._characterCodeRadix = createCharacterCodeRadix(characterSetSource)

    this.backgroundColor = options.backgroundColor ?? DefaultOptions.backgroundColor
    this.fontFamily = options.fontFamily ?? DefaultOptions.fontFamily
    this.fontSize = options.fontSize ?? DefaultOptions.fontSize
    this._block = options.block ?? DefaultOptions.block

    this._computedLineHeight = this.fontSize * (options.lineHeight ?? DefaultOptions.lineHeight)
    this.canvas = canvas

    this.ctx =
      options.context ??
      this.canvas.getContext('2d', {
        alpha: false,
        desynchronized: true,
      })!

    this._updateStyles()
  }
}

/**
 * @internal
 */
export type FillStyleFn = (red: number, green: number, blue: number, alpha: number, brightness: number) => string

/**
 * @internal
 */
export const _fillStyleFunctions = new Map<ASCIIMode, FillStyleFn>([
  ['color', (red, green, blue) => `rgb(${red} ${green} ${blue})`],
  ['bw', (_red, _green, _blue, brightness) => `rgb(${brightness * 255} ${brightness * 255} ${brightness * 255})`],
])

/**
 * Read the pixel buffer from a ThreeJS WebGLRenderer
 * @returns A Uint8ClampedArray containing the RGBA pixel buffer
 */
export function readFromThreeJS(renderer: THREE.WebGLRenderer, ctx = renderer.getContext()): Uint8ClampedArray {
  const rgbaBuffer = new Uint8ClampedArray(ctx.drawingBufferWidth * ctx.drawingBufferHeight * 4)
  ctx.readPixels(0, 0, renderer.domElement.width, renderer.domElement.height, ctx.RGBA, ctx.UNSIGNED_BYTE, rgbaBuffer)

  return rgbaBuffer
}

/**
 * Given an array of 255 or less ASCII characters representing the brightness of each pixel,
 * returns something like a radix-sorted array of 255 characters that are evenly spaced.
 *
 * This helps us avoid expensive operations like Math.floor() when rendering the ASCII art.
 * @internal
 */
export function createCharacterCodeRadix(asciiCharacters: string[]): Uint8Array {
  const averagedCharacterSet = new Uint8Array(255)

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
