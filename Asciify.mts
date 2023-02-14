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

import {
  Canvas2dContextLike,
  CanvasLike,
  createCanvasLike,
  isCanvasLike,
  isHTMLCanvasElement,
  isWebGLRenderer,
  pluck2dContext,
} from './utils/canvas.mjs'
import { CharacterCoords, LookupTable } from './utils/LookupTable.mjs'
import { LuminanceCharacterMap } from './utils/LuminanceCharacterMap.mjs'
import { FrameBuffer, readFromImage } from './utils/readers.mjs'
import { calculateTextureMetrics, TextureCache, TextureMetrics } from './utils/TextureCache.mjs'

import * as THREE from 'three'
import { AsciifyOptions } from './options/common.mjs'
import { createDefaultOptions } from './options/mod.mjs'

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
  public options: AsciifyOptions = {} as AsciifyOptions

  //#endregion

  //#region Protected Properties

  /**
   * Computed character size in pixels.
   * @internal
   */
  protected _characterSize!: number

  protected _luminanceCodeMap!: LuminanceCharacterMap
  protected _textureMetrics!: TextureMetrics
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
  protected _frameBuffer!: Uint8ClampedArray

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

  //#endregion

  constructor(
    /**
     * The canvas where the ASCII art will be rendered to.
     * This can either be a canvas element or a canvas's 2D context.
     *
     * @optional
     */
    outputCanvas: CanvasLike | Canvas2dContextLike = createCanvasLike('canvas'),
    /**
     * Options to use when rendering the ASCII art.
     *
     * @optional
     * @see {@linkcode AsciifyOptions} for more information.
     */
    options: Partial<AsciifyOptions> = {}
  ) {
    if (isCanvasLike(outputCanvas)) {
      // Canvas was provided, not a context.

      this.canvas = outputCanvas
      this.ctx = this.canvas.getContext('2d', {
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
    return this._luminanceCodeMap.get(luminance)!
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
    nextWidth?: number,
    /** The height of the ASCII art canvas. */
    nextHeight?: number,
    /** An optional source canvas to pass to {@linkcode Asciify.applySizeTo} */
    imageSource?: CanvasLike | THREE.WebGLRenderer | THREE.WebGLRenderTarget
  ): void {
    const { pixelRatio } = this.options

    // First, trigger a resize event on the canvas to make sure it's dimensions are updated.
    if (typeof nextWidth !== 'undefined') {
      this.canvas.width = Math.floor(nextWidth * pixelRatio)
    }

    if (typeof nextHeight !== 'undefined') {
      this.canvas.height = Math.floor(nextHeight * pixelRatio)
    }

    if (isHTMLCanvasElement(this.canvas)) {
      const dipRect = this.canvas.getBoundingClientRect()

      // Then, update the canvas dimensions to match the device pixel ratio.
      this.canvas.width = Math.floor(pixelRatio * dipRect.right) - Math.floor(pixelRatio * dipRect.left)
      this.canvas.height = Math.floor(pixelRatio * dipRect.bottom) - Math.floor(pixelRatio * dipRect.top)
    }

    this._updateContextStyles()

    // We always update the internal scratch canvas out of convenience for the user.
    this.applySizeTo(this._scratchCtx.canvas)

    if (imageSource) {
      this.applySizeTo(imageSource)
    }
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
  public applySizeTo(imageSource: CanvasLike | THREE.WebGLRenderer | THREE.WebGLRenderTarget): void {
    if (isWebGLRenderer(imageSource)) {
      imageSource.setSize(this.columnCount, this.rowCount, false)
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
    this.options = createDefaultOptions({ ...this.options, ...nextOptions })

    const {
      // -- Options --
      characterSet,
      fontSize,
      fontFamily,
      characterSpacingRatio,
      pixelRatio,
      contrastRatio,
      debug,
    } = this.options

    this._luminanceCodeMap = new LuminanceCharacterMap(characterSet, contrastRatio)
    this._textureMetrics = calculateTextureMetrics(fontSize, pixelRatio)

    this._textureCache = new TextureCache(this._luminanceCodeMap, this._textureMetrics, fontFamily, debug)

    this._characterSize = fontSize * characterSpacingRatio

    this._scratchCtx = pluck2dContext(this.options.scratchCanvas, {
      willReadFrequently: true,
      alpha: true,
    })

    this.setSize()
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
    imageSource: CanvasImageSource
  ): Promise<FrameBuffer> {
    this.clearFrameBuffers()
    this.clearCanvas()

    const rgbaBuffer = await readFromImage(imageSource, this._scratchCtx)
    this.rasterize(rgbaBuffer)

    return rgbaBuffer
  }

  /**
   * Rasterizes the given Three.js renderer to the ASCII art canvas.
   *
   * @category Rasterization
   * @see {@linkcode Asciify.rasterize}
   */
  public rasterizeWebGLRenderer(
    /**
     * The Three.js renderer to read pixel data from.
     */
    renderer: THREE.WebGLRenderer,
    /**
     * The WebGL context to read from. Defaults to the context of the renderer.
     * You should provide this if you'd like to cache the context once and reuse it.
     *
     * @optional
     */
    ctx = renderer.getContext(),
    /**
     * Whether the canvas should be cleared before rasterizing the next frame.
     * This option is useful when composing multiple render sources onto the same canvas.
     *
     * @optional
     */
    clearCanvas?: boolean,
    /**
     * Whether the frame buffer should be reset.
     * This option is useful if you're handling frame buffer management yourself.
     *
     * @optional
     */
    resetFrameBuffers?: boolean
  ): void {
    if (clearCanvas) {
      this.clearCanvas()
    }

    if (resetFrameBuffers) {
      this.clearFrameBuffers()
    }

    ctx.readPixels(
      0,
      0,
      renderer.domElement.width,
      renderer.domElement.height,
      ctx.RGBA,
      ctx.UNSIGNED_BYTE,
      this._scratchFrameBuffer
    )

    this.rasterize(this._scratchFrameBuffer, this._lookupTable.pixelIndexFlippedY, this._lookupTable.coordsFlipped)
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
     * Lookup table to use for the next frame.
     * @optional
     */
    pixelIndex: Uint32Array = this._lookupTable.pixelIndex,
    /**
     * Character coord map to use for the next frame.
     * @optional
     */
    coords: CharacterCoords = this._lookupTable.coords
  ): void {
    const textureWidth = this._textureMetrics.width
    const textureHeight = this._textureMetrics.height
    const colorize = this.options.colorize

    for (let cursorIndex = 0; cursorIndex < pixelIndex.length; cursorIndex += 4) {
      const redIndex = pixelIndex[cursorIndex]
      const greenIndex = pixelIndex[cursorIndex + 1]
      const blueIndex = pixelIndex[cursorIndex + 2]

      const red = nextFrameBuffer[redIndex]
      const green = nextFrameBuffer[greenIndex]
      const blue = nextFrameBuffer[blueIndex]

      if (
        this._frameBuffer[redIndex] === red &&
        this._frameBuffer[greenIndex] === green &&
        this._frameBuffer[blueIndex] === blue
      ) {
        continue
      }

      // Approximate of luminance. See https://en.wikipedia.org/wiki/Relative_luminance
      // This gives us a number between 0 and 255.
      const luminance = (red + red + red + blue + green + green + green + green) >> 3

      const [x, y] = coords.get(cursorIndex)!
      const texture = this._textureCache[luminance]!

      if (colorize) {
        this.ctx.fillStyle = 'rgb(' + red + ',' + green + ',' + blue + ')'
      }

      this.ctx.globalCompositeOperation = 'source-over'
      this.ctx.fillRect(x, y, textureWidth, textureHeight)
      this.ctx.globalCompositeOperation = 'xor'

      // We include the dirty rectangle to avoid clearing the entire canvas.
      this.ctx.drawImage(texture, 0, 0, textureWidth, textureHeight, x, y, textureWidth, textureHeight)
    }

    this._frameBuffer.set(nextFrameBuffer)
  }

  /**
   * Clears the frame buffers.
   * Asciify will automatically handle this for you in most cases.
   */
  public clearFrameBuffers(): void {
    this._frameBuffer = new FrameBuffer(this.columnCount, this.rowCount)
    this._scratchFrameBuffer = new FrameBuffer(this.columnCount, this.rowCount)
  }

  /**
   * Clears the canvas.
   * Asciify will automatically handle this for you in most cases.
   */
  public clearCanvas(): void {
    const { backgroundColor } = this.options
    this.ctx.globalCompositeOperation = 'source-over'

    this.ctx.fillStyle = backgroundColor
    this._scratchCtx.fillStyle = backgroundColor

    this._scratchCtx.fillRect(0, 0, this._scratchCtx.canvas.width, this._scratchCtx.canvas.height)
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    if (isHTMLCanvasElement(this.canvas)) {
      // We apply a background color to the canvas element itself for a slight performance boost.
      this.canvas.style.background = backgroundColor
      // All containment rules are applied to the element to further improve performance.
      this.canvas.style.contain = 'strict'
      // Applying a null transform on the canvas forces the browser to use the GPU for rendering.
      this.canvas.style.willChange = 'transform'
      this.canvas.style.transform = 'translate3d(0, 0, 0)'
    }

    this.ctx.fillStyle = 'white'
    this.ctx.save()
  }

  //#endregion

  //#region Protected Methods

  /** @ignore */
  protected _updateContextStyles(): void {
    const { fontSize, fontFamily, pixelRatio } = this.options

    this.ctx.font = `${fontSize * pixelRatio}px ${fontFamily}`

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

    this.clearFrameBuffers()
    this.clearCanvas()
  }
  //#endregion
}
