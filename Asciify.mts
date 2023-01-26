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

import { readFromImage, readFromThree } from './readers.mjs'
import {
  Canvas2dContextLike,
  CanvasLike,
  createCanvasLike,
  createCharacterCodeRadix,
  createIndexLookupTable,
  IndexLookupTable,
  isCanvasLike,
  isSizable,
  pluck2dContext,
  Sizable,
} from './utils.mjs'

import { AsciifyOptions, createDefaultOptions, DEFAULT_BW_CHAR_LIST, DEFAULT_CHAR_SET } from './options.mjs'

/**
 * Converts images, videos, and 3D renders into ASCII art.
 *
 * ```ts
 * const outputCanvas = document.createElement('canvas')
 * const asciify = new Asciify(canvas)
 * const sourceCanvas = document.createElement('canvas')
 *
 * asciify.setSize(window.innerWidth, window.innerHeight, sourceCanvas)
 * asciify.rasterize(image)
 * ```
 *
 * @category Main
 * @see {@link https://sister.software/asciify API documentation}
 */
export class Asciify {
  /**
   * The canvas where ASCII art is rasterized to.
   *
   * @remarks
   * If rendering to the screen, make sure to mount the canvas to the DOM.
   * You can use this canvas to render the ASCII art to the screen.
   * @see {@linkcode Asciify.setSize}.
   */
  public canvas: CanvasLike

  /**
   * A type-friendly getter for the canvas element.
   * @throws {@linkcode Error} if Asciify is used with an {@linkcode OffscreenCanvas}
   */
  public get domElement(): HTMLCanvasElement {
    if (this.canvas instanceof HTMLCanvasElement) {
      return this.canvas
    }

    throw new Error('Canvas is not an HTMLCanvasElement')
  }

  /**
   * The canvas context where ASCII art is rasterized to.
   */
  public ctx: Canvas2dContextLike

  /**
   * The number of columns in the ASCII art.
   * This corresponds to the width of the source material.
   */
  public columnCount = 0
  /**
   * The number of rows in the ASCII art.
   * This corresponds to the height of the source material.
   * @see {@linkcode Asciify.setSize}
   */
  public rowCount = 0

  /**
   * A scratch canvas used to rasterize images and videos.
   * This is not used when {@linkcode Asciify.rasterize} is called directly.
   * @ignore
   */
  protected _scratchCtx: Canvas2dContextLike

  /**
   * The options used to initialize the Asciify instance.
   * @see {@linkcode Asciify.setOptions}
   * @see {@linkcode AsciifyOptions}
   */
  public options!: AsciifyOptions

  /** @ignore */
  protected _drawFn!: DrawFn

  /** @ignore */
  protected _computedCharacterSize!: number

  protected _characterCodeRadix!: Uint16Array

  /**
   * The lookup table used to map the RGBA buffer to the ASCII art canvas.
   * @see {@linkcode createIndexLookupTable}
   * @internal
   */
  protected _indexLookupTable!: IndexLookupTable

  /**
   * The lookup table used to map the RGBA buffer to the ASCII art canvas.
   * This is the same as {@linkcode _indexLookupTable}, but with the Y axis flipped for WebGL.
   * @see {@linkcode createIndexLookupTable}
   * @internal
   */
  protected _indexLookupTableFlippedY!: IndexLookupTable

  /**
   * Sets the size of the ASCII art canvas, updating the number of columns and rows.
   *
   * You should call this method whenever an instance of asciify changes dimensions.
   *
   * ```ts
   * asciify.setSize(width, height, renderer)
   * ```
   *
   * Alternatively, you can use use the `columnCount` and `rowCount`
   * properties to set separately the size of the source canvas.
   *
   * ```ts
   * asciify.setSize(width, height)
   * renderer.setSize(asciify.columnCount, asciify.rowCount)
   * ```
   */
  public setSize(
    /** The width of the ASCII art canvas. */
    nextWidth: number,
    /** The height of the ASCII art canvas. */
    nextHeight: number,
    /** An optional source canvas to pass to {@linkcode Asciify.resize} */
    imageSource: CanvasLike | Sizable = this._scratchCtx.canvas
  ): void {
    const { pixelRatio } = this.options
    if (this.canvas instanceof HTMLCanvasElement) {
      // First, trigger a resize event on the canvas to make sure it's dimensions are updated.
      this.canvas.width = nextWidth
      this.canvas.height = nextHeight
      const dipRect = this.canvas.getBoundingClientRect()

      // Then, update the canvas dimensions to match the device pixel ratio.
      this.canvas.width = Math.floor(pixelRatio * dipRect.right) - Math.floor(pixelRatio * dipRect.left)
      this.canvas.height = Math.floor(pixelRatio * dipRect.bottom) - Math.floor(pixelRatio * dipRect.top)
    } else {
      this.canvas.width = Math.floor(nextWidth * pixelRatio)
      this.canvas.height = Math.floor(nextHeight * pixelRatio)
    }

    this._updateContextStyles()

    this.resize(imageSource)
  }

  /**
   * Resizes a given image source to fit the ASCII art canvas.
   *
   * Note that this method does not resize the output canvas.
   *
   * This should be called whenever the size of the ASCII art canvas changes,
   * when the source canvas is resized, or when the asciify instance options are changed.
   *
   * @see {@linkcode Asciify.setSize}
   * @see {@linkcode Asciify.setOptions}
   */
  public resize(imageSource: CanvasLike | Sizable = this._scratchCtx.canvas): void {
    if (isSizable(imageSource)) {
      imageSource.setSize(this.columnCount, this.rowCount)
    } else {
      imageSource.width = this.columnCount
      imageSource.height = this.rowCount
    }
  }

  /**
   * Sets new options for the ASCII art.
   * Useful for changing the asciify instance on the fly.
   */
  public setOptions(nextOptions: Partial<AsciifyOptions> = {}): void {
    this.options = {
      ...(this.options || createDefaultOptions()),
      ...nextOptions,
    }

    const { characterSet, mode, fontSize, lineHeight } = this.options

    switch (mode) {
      case 'color':
        this._drawFn = this._drawColor
        break

      case 'grayscale':
        this._drawFn = this._drawGrayscale
        break
      case 'block':
        this._drawFn = this._drawBlock
    }

    const characterSetSource = characterSet ?? (mode === 'grayscale' ? DEFAULT_BW_CHAR_LIST : DEFAULT_CHAR_SET)
    this._characterCodeRadix = createCharacterCodeRadix(characterSetSource)
    this._computedCharacterSize = fontSize * lineHeight

    this._updateContextStyles()
  }

  /** @ignore */
  protected _updateContextStyles(): void {
    const { fontSize, fontFamily, pixelRatio, lineHeight } = this.options
    this.ctx.fontKerning = 'none'
    this.ctx.textAlign = 'left'
    this.ctx.textBaseline = 'top'
    this.ctx.font = `${fontSize * pixelRatio}px ${fontFamily}`

    // The canvas is split into a grid of cells.
    // The width and height of each cell is determined by the font size and device pixel ratio.
    this.columnCount = Math.floor(this.canvas.width / this._computedCharacterSize)
    this.rowCount = Math.floor(this.canvas.height / this._computedCharacterSize)

    const lookupTables = createIndexLookupTable(this.rowCount, this.columnCount, fontSize, lineHeight)
    this._indexLookupTable = lookupTables[0]
    this._indexLookupTableFlippedY = lookupTables[1]
  }

  /**
   * Updates the character set used for the ASCII art.
   * This can be used to change the character set on the fly during an animation.
   */
  public updateCharacterSet(
    /**
     * The next character set to use for the ASCII art.
     */
    characterSet: string[]
  ): void {
    this._characterCodeRadix = createCharacterCodeRadix(characterSet)
  }

  /**
   * Renders given RGBA buffer to the ASCII art canvas.
   *
   * This method may be used directly when performance is critical.
   * @category Rasterization
   *
   * @see {@linkcode Asciify.rasterizeThree}
   * @see {@linkcode Asciify.rasterizeImage}
   */
  public rasterize(
    /**
     * A buffer containing the RGBA values of the image.
     */
    rgbaBuffer: Uint8ClampedArray,
    /**
     * Useful when rendering a Three.js scene.
     */
    bufferIsUpsideDown?: boolean,
    /**
     * Whether to persist the canvas. Useful when composing multiple images.
     */
    persistCanvas?: boolean
  ): void {
    if (!persistCanvas) {
      this.ctx.fillStyle = this.options.backgroundColor
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    }

    const lookupTable = bufferIsUpsideDown ? this._indexLookupTableFlippedY : this._indexLookupTable

    for (let cursorIndex = 0; cursorIndex < lookupTable.length; cursorIndex += 6) {
      const x = lookupTable[cursorIndex]
      const y = lookupTable[cursorIndex + 1]

      const red = rgbaBuffer[lookupTable[cursorIndex + 2]]
      const green = rgbaBuffer[lookupTable[cursorIndex + 3]]
      const blue = rgbaBuffer[lookupTable[cursorIndex + 4]]
      const alpha = rgbaBuffer[lookupTable[cursorIndex + 5]]

      if (alpha === 0 || (red === 0 && green === 0 && blue === 0)) {
        continue
      }

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

      this._drawFn(x, y, red, green, blue, luminance, characterCode)
    }
  }

  /**
   * Draws a single ASCII character to the canvas in the given color.
   * @internal
   */
  protected _drawColor: DrawFn = (x, y, red, green, blue, _luminance, characterCode) => {
    this.ctx.fillStyle = 'rgb(' + red + ' ' + green + ' ' + blue + ')'

    this.ctx.fillText(String.fromCharCode(characterCode), x, y)
  }

  /**
   * Draws a single ASCII character to the canvas in grayscale.
   * @internal
   */
  protected _drawGrayscale: DrawFn = (x, y, _red, _green, _blue, luminance, characterCode) => {
    this.ctx.fillStyle = `rgb(${luminance * 255} ${luminance * 255} ${luminance * 255})`

    this.ctx.fillText(String.fromCharCode(characterCode), x, y)
  }

  /**
   * Draws a single block shape to the canvas.
   * @internal
   */
  protected _drawBlock: DrawFn = (x, y, red, green, blue) => {
    this.ctx.fillStyle = 'rgb(' + red + ' ' + green + ' ' + blue + ')'

    this.ctx.fillRect(x, y, this.options.fontSize, this.options.fontSize)
  }

  /**
   * Rasterizes the given image to the ASCII art canvas.
   *
   * @category Rasterization
   * @see {@linkcode Asciify.rasterize}
   * @see {@linkcode readFromImage}
   */
  public async rasterizeImage(
    /**
     * The image to read pixels from.
     * This will be resized to match the next given `canvas` argument.
     */
    imageSource: ImageBitmapSource
  ): Promise<void> {
    const rgbaBuffer = await readFromImage(imageSource, this._scratchCtx)
    this.rasterize(rgbaBuffer)
  }

  /**
   * Rasterizes the given Three.js renderer to the ASCII art canvas.
   *
   * @category Rasterization
   * @see {@linkcode Asciify.rasterize}
   * @see {@linkcode readFromImage}
   */
  public rasterizeThree(
    /**
     * The Three.js renderer to read from.
     */
    renderer: THREE.WebGLRenderer,
    /**
     * The WebGL context to read from. Defaults to the context of the renderer.
     * You should provide this if you'd like to cache the context once and reuse it.
     */
    ctx = renderer.getContext()
  ): void {
    const rgbaBuffer = readFromThree(renderer, ctx)
    this.rasterize(rgbaBuffer, true)
  }

  /**
   * Returns the character that best matches the given brightness.
   */
  public getCharacterFromLuminance(
    /**
     * A number between 0 and 1.
     */
    luminance: number
  ) {
    const characterCode = this._characterCodeRadix[luminance]
    return String.fromCharCode(characterCode)
  }

  constructor(
    /**
     * The canvas where the ASCII art will be rendered to.
     * This can either be a canvas element or a canvas's 2D context.
     */
    outputCanvas: CanvasLike | Canvas2dContextLike = createCanvasLike(),
    /**
     * Options to use when rendering the ASCII art.
     * @see {@linkcode AsciifyOptions} for more information.
     */
    options: Partial<AsciifyOptions> = {}
  ) {
    if (isCanvasLike(outputCanvas)) {
      // Canvas was provided, not a context.

      this.canvas = outputCanvas
      this.ctx = this.canvas.getContext('2d', {
        alpha: false,
        desynchronized: true,
      }) as CanvasRenderingContext2D
    } else {
      // Context was provided, not a canvas.
      this.ctx = outputCanvas
      this.canvas = this.ctx.canvas
    }

    this._scratchCtx = pluck2dContext(createCanvasLike('offscreen'))

    this.setOptions(options)
  }
}

/**
 * Signature for a draw function.
 *
 * @internal
 * @ignore
 */
export type DrawFn = (
  this: Asciify,
  x: number,
  y: number,
  red: number,
  green: number,
  blue: number,
  luminance: number,
  characterCode: number
) => void
