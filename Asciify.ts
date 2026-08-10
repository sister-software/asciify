/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 * @fileoverview
 * This file is the entry point for the @sister.software/asciify module.
 * @see {@link https://sister.software/asciify API documentation}
 * @module @sister.software/asciify
 */

import type { AsciifyOptions } from "./options/common.ts"
import { createDefaultOptions } from "./options/index.ts"
import {
	type Canvas2dContextLike,
	type CanvasLike,
	createCanvasLike,
	isCanvasLike,
	isHTMLCanvasElement,
	isWebGLRenderer,
	pluck2dContext,
	type SizableLike,
	type WebGLRendererLike,
} from "./utils/canvas.ts"
import { LookupTable } from "./utils/LookupTable.ts"
import { LuminanceCharacterMap } from "./utils/LuminanceCharacterMap.ts"
import { FrameBuffer, readFromImage } from "./utils/readers.ts"
import { calculateTextureMetrics, TextureCache, type TextureMetrics } from "./utils/TextureCache.ts"

/**
 * Converts images, videos, and 3D renders into ASCII art.
 *
 * ```ts
 * const outputCanvas = document.createElement("canvas")
 * const asciify = new Asciify(canvas)
 * const sourceCanvas = document.createElement("canvas")
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
	 *   If rendering to the screen, make sure to mount the canvas to the DOM. You can use this canvas to render the ASCII
	 *   art to the screen.
	 * @see {@linkcode Asciify.setSize}.
	 */
	public canvas: CanvasLike

	/**
	 * A type-friendly getter for the canvas element.
	 *
	 * @throws `Error` if Asciify is used with an `OffscreenCanvas`
	 */
	public get domElement(): HTMLCanvasElement {
		if (this.canvas instanceof HTMLCanvasElement) {
			return this.canvas
		}

		throw new Error("Canvas is not an HTMLCanvasElement")
	}

	/**
	 * The canvas context where ASCII art is rasterized to.
	 */
	public ctx: Canvas2dContextLike

	/**
	 * The number of columns in the ASCII art. This corresponds to the width of the source material.
	 */
	public columnCount = 0
	/**
	 * The number of rows in the ASCII art. This corresponds to the height of the source material.
	 *
	 * @see {@linkcode Asciify.setSize}
	 */
	public rowCount = 0

	/**
	 * @ignore
	 */
	protected _offsetX = 0
	/**
	 * @internal
	 */
	protected _offsetY = 0

	/**
	 * The options used to initialize the Asciify instance.
	 *
	 * @see {@linkcode Asciify.setOptions}
	 * @see {@linkcode AsciifyOptions}
	 */
	public options: AsciifyOptions = {} as AsciifyOptions

	//#endregion

	//#region Protected Properties

	/**
	 * Computed character size in pixels.
	 *
	 * @internal
	 */
	protected _characterSize!: number

	protected _luminanceCodeMap!: LuminanceCharacterMap
	protected _textureMetrics!: TextureMetrics
	protected _textureCache!: TextureCache

	/**
	 * Precalculated canvas coordinates for every character cell.
	 *
	 * @internal
	 * @see {@linkcode LookupTable}
	 */
	protected _lookupTable!: LookupTable

	/**
	 * @internal
	 */
	protected _scratchFrameBuffer!: FrameBuffer

	/**
	 * A scratch canvas used to rasterize images and videos. This is not used when {@linkcode Asciify.rasterize} is called
	 * directly.
	 *
	 * @ignore
	 */
	protected _scratchCtx!: Canvas2dContextLike

	/**
	 * A full-size canvas holding the current frame's glyph coverage.
	 *
	 * @remarks
	 *   Every character cell is stamped here in a single pass with no context state changes, then applied to the output
	 *   in one `destination-in` composite.
	 * @internal
	 */
	protected _maskCtx!: Canvas2dContextLike

	/**
	 * A `columnCount` x `rowCount` canvas holding the current frame's pixel data.
	 *
	 * @remarks
	 *   Scaled up to the full canvas with smoothing disabled, one source pixel becomes one flat character cell — which
	 *   replaces a `fillStyle` assignment and a `fillRect` per cell with a single `drawImage`.
	 * @internal
	 */
	protected _colorCtx!: Canvas2dContextLike

	//#endregion

	constructor(
		/**
		 * The canvas where the ASCII art will be rendered to. This can either be a canvas element or a canvas's 2D context.
		 *
		 * @optional
		 */
		outputCanvas: CanvasLike | Canvas2dContextLike = createCanvasLike("canvas"),
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

			this.ctx = this.canvas.getContext("2d", {
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
	 * Alternatively, you can use use the `columnCount` and `rowCount` properties to set separately the size of the source
	 * canvas.
	 *
	 * ```ts
	 * asciify.setSize(width, height)
	 * renderer.setSize(asciify.columnCount, asciify.rowCount)
	 * ```
	 */
	public setSize(
		/**
		 * The width of the ASCII art canvas.
		 */
		nextWidth?: number,
		/**
		 * The height of the ASCII art canvas.
		 */
		nextHeight?: number,
		/**
		 * An optional source canvas to pass to {@linkcode Asciify.applySizeTo}
		 */
		imageSource?: CanvasLike | WebGLRendererLike | SizableLike
	): void {
		const { pixelRatio } = this.options

		// First, trigger a resize event on the canvas to make sure it's dimensions are updated.
		if (nextWidth !== undefined) {
			this.canvas.width = Math.floor(nextWidth * pixelRatio)
		}

		if (nextHeight !== undefined) {
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
	 * This should be called whenever the size of the ASCII art canvas changes, when the source canvas is resized, or when
	 * the asciify instance options are changed.
	 *
	 * @see {@linkcode Asciify.setSize}
	 * @see {@linkcode Asciify.setOptions}
	 */
	public applySizeTo(imageSource: CanvasLike | WebGLRendererLike | SizableLike): void {
		if (isWebGLRenderer(imageSource)) {
			imageSource.setSize(this.columnCount, this.rowCount, false)
		} else {
			imageSource.width = this.columnCount
			imageSource.height = this.rowCount
		}
	}

	/**
	 * Sets new options for the ASCII art. Useful for changing the asciify instance on the fly.
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

		// Both of these are internal compositing surfaces. The mask must keep its alpha channel, and
		// the colour surface is read back by `drawImage` rather than `getImageData`.
		this._maskCtx = pluck2dContext(createCanvasLike(), { alpha: true })
		this._colorCtx = pluck2dContext(createCanvasLike(), { alpha: true })

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
		 * The image to read pixels from. This will be resized to match the next given `canvas` argument.
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
		renderer: WebGLRendererLike,
		/**
		 * The WebGL context to read from. Defaults to the context of the renderer. You should provide this if you'd like to
		 * cache the context once and reuse it.
		 *
		 * @optional
		 */
		ctx = renderer.getContext(),
		/**
		 * Whether the canvas should be cleared before rasterizing the next frame. This option is useful when composing
		 * multiple render sources onto the same canvas.
		 *
		 * @optional
		 */
		clearCanvas?: boolean,
		/**
		 * Whether the frame buffer should be reset. This option is useful if you're handling frame buffer management
		 * yourself.
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

		// `readPixels` hands back rows bottom-to-top, so the rasterizer has to read them in reverse.
		this.rasterize(this._scratchFrameBuffer, true)
	}

	/**
	 * Renders given RGBA buffer to the ASCII art canvas.
	 *
	 * This method may be used directly when performance is critical.
	 *
	 * @category Rasterization
	 * @see {@linkcode Asciify.rasterizeWebGLRenderer}
	 * @see {@linkcode Asciify.rasterizeImage}
	 */
	public rasterize(
		/**
		 * A buffer containing the RGBA values of the image.
		 */
		nextFrameBuffer: FrameBuffer,
		/**
		 * Whether the buffer's rows run bottom-to-top, as `WebGLRenderingContext.readPixels` returns them.
		 *
		 * @optional
		 */
		flipY = false
	): void {
		const { columnCount, rowCount, ctx } = this
		const { xs, ys } = this._lookupTable
		const textures = this._textureCache
		const blank = this._textureCache.blank
		const textureWidth = this._textureMetrics.width
		const textureHeight = this._textureMetrics.height
		const canvasWidth = this.canvas.width
		const canvasHeight = this.canvas.height
		const maskCtx = this._maskCtx

		// -- Pass one: stamp every glyph into the mask. -----------------------------------------
		// Nothing in this loop touches context state, which is the whole point: the previous
		// implementation flipped `globalCompositeOperation` twice and assigned `fillStyle` once per
		// cell, and those state changes dominated the frame.
		maskCtx.clearRect(0, 0, canvasWidth, canvasHeight)

		for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
			// Screen rows always run top-to-bottom; only the row we read from the buffer flips.
			const sourceRow = flipY ? rowCount - 1 - rowIndex : rowIndex

			let byteIndex = sourceRow * columnCount * 4
			let cellIndex = rowIndex * columnCount

			for (let columnIndex = 0; columnIndex < columnCount; columnIndex++, byteIndex += 4, cellIndex++) {
				const red = nextFrameBuffer[byteIndex]!
				const green = nextFrameBuffer[byteIndex + 1]!
				const blue = nextFrameBuffer[byteIndex + 2]!

				// Approximate of luminance. See https://en.wikipedia.org/wiki/Relative_luminance
				// This gives us a number between 0 and 255.
				const luminance = (red + red + red + blue + green + green + green + green) >> 3

				// Whitespace contributes nothing to the mask, so skip the draw entirely.
				if (blank[luminance]) continue

				maskCtx.drawImage(textures[luminance]!, xs[cellIndex]!, ys[cellIndex]!, textureWidth, textureHeight)
			}
		}

		// -- Pass two: paint the colour, then punch the glyphs out of it. -----------------------
		if (this.options.colorize) {
			this._colorCtx.putImageData(new ImageData(nextFrameBuffer, columnCount, rowCount), 0, 0)

			// `copy` replaces the canvas outright, so the previous frame needs no separate clear.
			ctx.globalCompositeOperation = "copy"
			// Nearest-neighbour, so one source pixel becomes one flat character cell.
			ctx.imageSmoothingEnabled = false

			if (flipY) {
				ctx.setTransform(1, 0, 0, -1, 0, canvasHeight)
			}

			ctx.drawImage(this._colorCtx.canvas, 0, 0, columnCount, rowCount, 0, 0, canvasWidth, canvasHeight)

			if (flipY) {
				ctx.setTransform(1, 0, 0, 1, 0, 0)
			}
		} else {
			ctx.globalCompositeOperation = "copy"
			ctx.fillStyle = "white"
			ctx.fillRect(0, 0, canvasWidth, canvasHeight)
		}

		ctx.globalCompositeOperation = "destination-in"
		ctx.drawImage(maskCtx.canvas, 0, 0)

		// Finally, slide the background in underneath what survived.
		ctx.globalCompositeOperation = "destination-over"
		ctx.fillStyle = this.options.backgroundColor
		ctx.fillRect(0, 0, canvasWidth, canvasHeight)

		ctx.globalCompositeOperation = "source-over"
	}

	/**
	 * Clears the frame buffers. Asciify will automatically handle this for you in most cases.
	 */
	public clearFrameBuffers(): void {
		this._scratchFrameBuffer = new FrameBuffer(this.columnCount, this.rowCount)
	}

	/**
	 * Clears the canvas. Asciify will automatically handle this for you in most cases.
	 */
	public clearCanvas(): void {
		const { backgroundColor } = this.options
		this.ctx.globalCompositeOperation = "source-over"

		this.ctx.fillStyle = backgroundColor
		this._scratchCtx.fillStyle = backgroundColor

		this._scratchCtx.fillRect(0, 0, this._scratchCtx.canvas.width, this._scratchCtx.canvas.height)

		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

		this._maskCtx.clearRect(0, 0, this._maskCtx.canvas.width, this._maskCtx.canvas.height)

		if (isHTMLCanvasElement(this.canvas)) {
			// We apply a background color to the canvas element itself for a slight performance boost.
			this.canvas.style.background = backgroundColor
			// All containment rules are applied to the element to further improve performance.
			this.canvas.style.contain = "strict"
			// Applying a null transform on the canvas forces the browser to use the GPU for rendering.
			this.canvas.style.willChange = "transform"
			this.canvas.style.transform = "translate3d(0, 0, 0)"
		}

		this.ctx.fillStyle = "white"
		this.ctx.save()
	}

	//#endregion

	//#region Protected Methods

	/**
	 * @ignore
	 */
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

		// The mask is composited 1:1 over the output, so it tracks the output's dimensions.
		this._maskCtx.canvas.width = this.canvas.width
		this._maskCtx.canvas.height = this.canvas.height

		// The colour surface is one pixel per character cell, scaled up at composite time.
		this._colorCtx.canvas.width = this.columnCount
		this._colorCtx.canvas.height = this.rowCount

		this.clearFrameBuffers()
		this.clearCanvas()
	}
	//#endregion
}
