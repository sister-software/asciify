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

import { FrameBuffer, readFromImage } from './readers.mjs'
import {
  Canvas2dContextLike,
  CanvasLike,
  CharacterCoords,
  createCanvasLike,
  isCanvasLike,
  isWebGLRenderer,
  LookupTable,
  LuminanceCharacterCodeMap,
  pluck2dContext,
  TextureCache,
} from './utils.mjs'

import * as THREE from 'three'
import { AsciifyOptions, createDefaultOptions } from './configuration.mjs'

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
  //#region Public Properties

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
   * @throws `Error` if Asciify is used with an `OffscreenCanvas`
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

  /** @ignore */
  protected _offsetX = 0
  /** @internal */
  protected _offsetY = 0

  /**
   * The options used to initialize the Asciify instance.
   * @see {@linkcode Asciify.setOptions}
   * @see {@linkcode AsciifyOptions}
   */
  public options!: AsciifyOptions

  //#endregion

  //#region Protected Properties

  /**
   * The function used to draw the ASCII art to the canvas.
   * @ignore */
  protected _drawFn!: DrawFn

  /**
   * Computed character size in pixels.
   * @ignore */
  protected _characterSize!: number

  protected _luminanceCodeMap!: LuminanceCharacterCodeMap
  protected _textureCache!: TextureCache

  /**
   * The lookup table is used to map the RGBA values of each pixel to a character.
   * The frame buffer is used to store the RGBA values of the image.
   *
   * @see {@linkcode LookupTable}
   * @internal
   */
  protected _lookupTable!: LookupTable

  /**
   * The frame buffer is used to store the RGBA values of the image.
   *
   * @see {@linkcode FrameBuffer}
   * @internal
   */
  protected _frameBuffer!: FrameBuffer

  /**
   * @internal
   */
  protected _scratchFrameBuffer!: FrameBuffer

  /**
   * A scratch canvas used to rasterize images and videos.
   * This is not used when {@linkcode Asciify.rasterize} is called directly.
   * @ignore
   */
  protected _scratchCtx!: Canvas2dContextLike

  protected _threeRenderer!: THREE.WebGLRenderTarget

  //#endregion

  constructor(
    /**
     * The canvas where the ASCII art will be rendered to.
     * This can either be a canvas element or a canvas's 2D context.
     */
    outputCanvas: CanvasLike | Canvas2dContextLike = createCanvasLike('canvas'),
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

    this.setOptions(options)
  }

  //#region Public Methods

  /**
   * Returns the character that best matches the given brightness.
   */
  public getCharacterFromLuminance(
    /**
     * A number between 0 and 1.
     */
    luminance: number
  ) {
    const characterCode = this._luminanceCodeMap.get(luminance)!
    return String.fromCharCode(characterCode)
  }

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
    imageSource: CanvasLike | THREE.WebGLRenderer | THREE.WebGLRenderTarget = this._scratchCtx.canvas
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
  public resize(
    imageSource: CanvasLike | THREE.WebGLRenderer | THREE.WebGLRenderTarget = this._scratchCtx.canvas
  ): void {
    if (isWebGLRenderer(imageSource)) {
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
    this.options = createDefaultOptions(nextOptions)

    const {
      // -- Options --
      characterSet,
      mode,
      fontSize,
      fontFamily,
      characterSpacingRatio,
      pixelRatio,
      contrastRatio,
      backgroundColor,
      debug,
    } = this.options

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

    this._luminanceCodeMap = new LuminanceCharacterCodeMap(characterSet, contrastRatio)
    this._textureCache = new TextureCache(
      this._luminanceCodeMap,
      fontSize,
      fontFamily,
      pixelRatio,
      backgroundColor,
      debug
    )
    this._characterSize = fontSize * characterSpacingRatio

    this._scratchCtx = pluck2dContext(this.options.scratchCanvas, {
      willReadFrequently: true,
    })

    this._updateContextStyles()
    this.resize(this._scratchCtx.canvas)
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
  ): Promise<FrameBuffer> {
    const rgbaBuffer = await readFromImage(imageSource, this._scratchCtx)
    this.rasterize(rgbaBuffer, true)

    return rgbaBuffer
  }

  /**
   * Rasterizes the given Three.js renderer to the ASCII art canvas.
   *
   * @category Rasterization
   * @see {@linkcode Asciify.rasterize}
   * @see {@linkcode readFromWebGLRenderer}
   */
  public rasterizeWebGLRenderer(
    /**
     * The Three.js renderer to read pixel data from.
     */
    renderer: THREE.WebGLRenderer,
    /**
     * The WebGL context to read from. Defaults to the context of the renderer.
     * You should provide this if you'd like to cache the context once and reuse it.
     */
    ctx = renderer.getContext()
  ): void {
    ctx.readPixels(
      0,
      0,
      renderer.domElement.width,
      renderer.domElement.height,
      ctx.RGBA,
      ctx.UNSIGNED_BYTE,
      this._scratchFrameBuffer
    )

    this.rasterize(
      this._scratchFrameBuffer,
      false,
      this._lookupTable.pixelIndexFlippedY,
      this._lookupTable.coordsFlipped
    )
  }

  /**
   * Renders given RGBA buffer to the ASCII art canvas.
   *
   * This method may be used directly when performance is critical.
   * @category Rasterization
   *
   * @see {@linkcode Asciify.rasterizeWebGLRenderer}
   * @see {@linkcode Asciify.rasterizeImage}
   */
  public rasterize(
    /**
     * A buffer containing the RGBA values of the image.
     */
    nextFrameBuffer: FrameBuffer,

    /**
     * Whether to persist the canvas. Useful when composing multiple images.
     */
    resetFramebuffer = false,
    /**
     * An optional lookup table to use for the next frame.
     */
    pixelIndex: Uint32Array = this._lookupTable.pixelIndex,
    /**
     */
    coords: CharacterCoords = this._lookupTable.coords
  ): void {
    if (resetFramebuffer) {
      this._frameBuffer = new FrameBuffer(this.columnCount, this.rowCount)
    }

    for (let cursorIndex = 0; cursorIndex < pixelIndex.length; cursorIndex += 4) {
      const redIndex = pixelIndex[cursorIndex]
      const greenIndex = pixelIndex[cursorIndex + 1]
      const blueIndex = pixelIndex[cursorIndex + 2]
      const alphaIndex = pixelIndex[cursorIndex + 3]

      const red = nextFrameBuffer[redIndex]
      const green = nextFrameBuffer[greenIndex]
      const blue = nextFrameBuffer[blueIndex]
      const alpha = nextFrameBuffer[alphaIndex]

      const cellIsUnchanged =
        this._frameBuffer[redIndex] === red &&
        this._frameBuffer[greenIndex] === green &&
        this._frameBuffer[blueIndex] === blue &&
        this._frameBuffer[alphaIndex] === alpha

      if (cellIsUnchanged) {
        continue
      }

      // Approximate of luminance. See https://en.wikipedia.org/wiki/Relative_luminance
      // This gives us a number between 0 and 255.
      const luminance = (red * 299 + green * 587 + blue * 114) >> 10
      // Now, we need to find the character texture that best matches the luminance...
      const sourceTexture = this._textureCache.get(luminance)!

      const coord = coords.get(cursorIndex)!
      this._drawFn(coord[0], coord[1], red, green, blue, luminance, sourceTexture)
    }

    this._frameBuffer.set(nextFrameBuffer)
  }

  //#endregion

  //#region Protected Methods

  /** @ignore */
  protected _updateContextStyles(): void {
    const { fontSize, fontFamily, pixelRatio, backgroundColor } = this.options
    this.ctx.font = `${fontSize * pixelRatio}px ${fontFamily}`

    this.ctx.fillStyle = backgroundColor
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // The canvas is split into a grid of cells.
    // The width and height of each cell is determined by the font size and device pixel ratio.
    const trueColumnCount = this.canvas.width / (this._characterSize * pixelRatio)
    const trueRowCount = this.canvas.height / (this._characterSize * pixelRatio)

    this.columnCount = Math.floor(trueColumnCount)
    this.rowCount = Math.floor(trueRowCount)

    // Additionally, we need the sprites to sit at the center of the canvas.
    this._offsetX = (trueColumnCount - this.columnCount) * this._characterSize
    this._offsetY = (trueRowCount - this.rowCount) * this._characterSize

    this._lookupTable = new LookupTable(this.rowCount, this.columnCount, this._characterSize, pixelRatio)
    this._frameBuffer = new FrameBuffer(this.columnCount, this.rowCount)
    this._scratchFrameBuffer = new FrameBuffer(this.columnCount, this.rowCount)
  }

  /**
   * Draws a single ASCII character to the canvas in the given color.
   * @internal
   */
  protected _drawColor: DrawFn = (x, y, red, green, blue, _luminance, sourceTexture) => {
    const data = new Uint8ClampedArray(sourceTexture.data, 0, sourceTexture.data.length)

    // The & 0xff operation is used to extract the least significant 8 bits of the color values,
    // which correspond to the red, green, and blue color channels.
    // The & 0xff operation ensures that the resulting color values are within the range of 0 - 255,
    // which is the range of valid RGB values.
    for (let i = 0; i < data.length; i += 4) {
      data[i] = ((data[i] * (red & 255)) / 255) & 255
      data[i + 1] = ((data[i + 1] * (green & 255)) / 255) & 255
      data[i + 2] = ((data[i + 2] * (blue & 255)) / 255) & 255
    }

    this.ctx.putImageData(
      new ImageData(data, sourceTexture.width, sourceTexture.height, globalImageDataSettings),
      x + this._offsetX,
      y + this._offsetY,
      0,
      0,
      sourceTexture.width,
      sourceTexture.height
    )
  }

  /**
   * Draws a single ASCII character to the canvas in grayscale.
   * @internal
   */
  protected _drawGrayscale: DrawFn = (x, y, _red, _green, _blue, luminance, sourceTexture) => {
    const data = new Uint8ClampedArray(sourceTexture.data, 0, sourceTexture.data.length)

    this.ctx.putImageData(
      new ImageData(data, sourceTexture.width, sourceTexture.height, globalImageDataSettings),
      x + this._offsetX,
      y + this._offsetY,
      0,
      0,
      sourceTexture.width,
      sourceTexture.height
    )
  }

  /**
   * Draws a single block shape to the canvas.
   * @internal
   */
  protected _drawBlock: DrawFn = (x, y, red, green, blue) => {
    this.ctx.fillStyle = 'rgb(' + red + ' ' + green + ' ' + blue + ')'

    this.ctx.fillRect(x, y, this.options.fontSize, this.options.fontSize)
  }

  //#endregion
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
  sourceTexture: ImageData
) => void

/** @ignore */
const globalImageDataSettings: Readonly<ImageDataSettings> = { colorSpace: 'srgb' }
