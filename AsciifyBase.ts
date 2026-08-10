/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 * @fileoverview
 * Backend-agnostic machinery shared by every asciify renderer.
 * @see {@link https://sister.software/asciify API documentation}
 * @module @sister.software/asciify
 */

import type { Asciify } from "./Asciify.ts"
import type { AsciifyOptions } from "./options/common.ts"
import { createDefaultOptions } from "./options/index.ts"
import {
	type Canvas2dContextLike,
	type CanvasLike,
	isCanvasLike,
	isHTMLCanvasElement,
	isWebGLRenderer,
	pluck2dContext,
	type SizableLike,
	type WebGLRendererLike,
} from "./utils/canvas.ts"
import { LuminanceCharacterMap } from "./utils/LuminanceCharacterMap.ts"
import { FrameBuffer, readFromImage } from "./utils/readers.ts"
import { calculateTextureMetrics, type TextureMetrics } from "./utils/TextureCache.ts"

/**
 * Shared implementation for asciify renderers.
 *
 * @remarks
 *   Everything that does not depend on how pixels reach the screen lives here: option normalization, the grid
 *   arithmetic that derives {@linkcode columnCount} and {@linkcode rowCount}, the scratch canvas, and the two
 *   convenience entry points that funnel into {@linkcode rasterize}. Subclasses own their drawing context and implement
 *   three hooks — {@linkcode _onOptionsChanged} to build glyph resources, {@linkcode _onResize} to resize backend
 *   surfaces, and {@linkcode rasterize} itself. **Subclasses must call {@linkcode setOptions} at the end of their own
 *   constructor**, never from here. Class fields initialize after `super()` returns, so anything this constructor set
 *   up would be overwritten by the subclass's own field declarations.
 * @category Main
 * @internal
 */
export abstract class AsciifyBase implements Asciify {
	//#region Public Properties

	/**
	 * The canvas where ASCII art is rasterized to.
	 *
	 * @see {@linkcode Asciify.canvas}
	 */
	public canvas: CanvasLike

	/**
	 * A type-friendly getter for the canvas element.
	 *
	 * @throws `Error` if the renderer was given an `OffscreenCanvas`.
	 */
	public get domElement(): HTMLCanvasElement {
		if (this.canvas instanceof HTMLCanvasElement) {
			return this.canvas
		}

		throw new Error("Canvas is not an HTMLCanvasElement")
	}

	/**
	 * The number of columns in the ASCII art.
	 */
	public columnCount = 0

	/**
	 * The number of rows in the ASCII art.
	 */
	public rowCount = 0

	/**
	 * The options used to initialize the renderer.
	 */
	public options: AsciifyOptions = {} as AsciifyOptions

	//#endregion

	//#region Protected Properties

	/**
	 * Computed character size in pixels, before the device pixel ratio is applied.
	 *
	 * @internal
	 */
	protected _characterSize!: number

	protected _luminanceCodeMap!: LuminanceCharacterMap
	protected _textureMetrics!: TextureMetrics

	/**
	 * @internal
	 */
	protected _scratchFrameBuffer!: FrameBuffer

	/**
	 * A scratch canvas used to rasterize images and videos. This is not used when {@linkcode rasterize} is called
	 * directly.
	 *
	 * @ignore
	 */
	protected _scratchCtx!: Canvas2dContextLike

	//#endregion

	constructor(canvas: CanvasLike) {
		this.canvas = canvas
	}

	//#region Public Methods

	/**
	 * Returns the character that best matches the given brightness.
	 */
	public getCharacterFromLuminance(
		/**
		 * A number between 0 and 255.
		 */
		luminance: number
	): string {
		return this._luminanceCodeMap.get(luminance)!
	}

	/**
	 * Sets the size of the ASCII art canvas, updating the number of columns and rows.
	 *
	 * @see {@linkcode Asciify.setSize}
	 */
	public setSize(
		nextWidth?: number,
		nextHeight?: number,
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

		this._updateGrid()

		// We always update the internal scratch canvas out of convenience for the user.
		this.applySizeTo(this._scratchCtx.canvas)

		if (imageSource) {
			this.applySizeTo(imageSource)
		}
	}

	/**
	 * Resizes a given image source to fit the ASCII art canvas.
	 *
	 * @see {@linkcode Asciify.applySizeTo}
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
	 * Sets new options for the ASCII art. Useful for changing the renderer on the fly.
	 */
	public setOptions(nextOptions: Partial<AsciifyOptions> = {}): void {
		this.options = createDefaultOptions({ ...this.options, ...nextOptions })

		const { characterSet, fontSize, characterSpacingRatio, pixelRatio, contrastRatio } = this.options

		this._luminanceCodeMap = new LuminanceCharacterMap(characterSet, contrastRatio)
		this._textureMetrics = calculateTextureMetrics(fontSize, pixelRatio)
		this._characterSize = fontSize * characterSpacingRatio

		this._scratchCtx = pluck2dContext(this.options.scratchCanvas, {
			willReadFrequently: true,
			alpha: true,
		})

		this._onOptionsChanged()

		this.setSize()
	}

	/**
	 * Rasterizes the given image to the ASCII art canvas.
	 *
	 * @category Rasterization
	 * @see {@linkcode readFromImage}
	 */
	public async rasterizeImage(imageSource: CanvasImageSource): Promise<FrameBuffer> {
		this.clearFrameBuffers()
		this.clearCanvas()

		const rgbaBuffer = await readFromImage(imageSource, this._scratchCtx)

		this.rasterize(rgbaBuffer as FrameBuffer)

		return rgbaBuffer as FrameBuffer
	}

	/**
	 * Rasterizes the given WebGL renderer to the ASCII art canvas.
	 *
	 * @category Rasterization
	 */
	public rasterizeWebGLRenderer(
		renderer: WebGLRendererLike,
		ctx: WebGLRenderingContext | WebGL2RenderingContext = renderer.getContext(),
		clearCanvas?: boolean,
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
	 * Clears the frame buffers. Asciify will automatically handle this for you in most cases.
	 */
	public clearFrameBuffers(): void {
		this._scratchFrameBuffer = new FrameBuffer(this.columnCount, this.rowCount)
	}

	public abstract rasterize(nextFrameBuffer: FrameBuffer, flipY?: boolean): void

	public abstract clearCanvas(): void

	//#endregion

	//#region Protected Methods

	/**
	 * Called whenever options change, before the grid is recomputed. Subclasses rebuild their glyph resources here.
	 *
	 * @internal
	 */
	protected abstract _onOptionsChanged(): void

	/**
	 * Called whenever the grid dimensions change. Subclasses resize their backing surfaces here.
	 *
	 * @internal
	 */
	protected abstract _onResize(): void

	/**
	 * Derives the character grid from the canvas dimensions and hands off to the backend.
	 *
	 * @ignore
	 */
	protected _updateGrid(): void {
		const { pixelRatio } = this.options

		// The surface is split into a grid of cells.
		// The width and height of each cell is determined by the font size and device pixel ratio.
		const trueColumnCount = this._surfaceWidth / (this._characterSize * pixelRatio)
		const trueRowCount = this._surfaceHeight / (this._characterSize * pixelRatio)

		this.columnCount = Math.floor(trueColumnCount)
		this.rowCount = Math.floor(trueRowCount)

		this._onResize()

		this.clearFrameBuffers()
		this.clearCanvas()
	}

	/**
	 * The width of the surface being rasterized into, in device pixels.
	 *
	 * @remarks
	 *   Normally the output canvas's backing store. A renderer that borrows someone else's context overrides this to read
	 *   the drawing buffer instead, since it must not resize a canvas it does not own.
	 * @ignore
	 */
	protected get _surfaceWidth(): number {
		return this.canvas.width
	}

	/**
	 * @ignore
	 * @see {@linkcode _surfaceWidth}
	 */
	protected get _surfaceHeight(): number {
		return this.canvas.height
	}

	/**
	 * Applies the compositing hints that keep the output canvas cheap for the browser to present.
	 *
	 * @ignore
	 */
	protected _applyCanvasStyles(): void {
		if (!isHTMLCanvasElement(this.canvas)) return

		const { backgroundColor } = this.options

		// We apply a background color to the canvas element itself for a slight performance boost.
		this.canvas.style.background = backgroundColor
		// All containment rules are applied to the element to further improve performance.
		this.canvas.style.contain = "strict"
		// Applying a null transform on the canvas forces the browser to use the GPU for rendering.
		this.canvas.style.willChange = "transform"
		this.canvas.style.transform = "translate3d(0, 0, 0)"
	}

	/**
	 * Narrows a constructor argument that may be either a canvas or a 2D context.
	 *
	 * @ignore
	 */
	protected static _resolveCanvas(outputCanvas: CanvasLike | Canvas2dContextLike): CanvasLike {
		return isCanvasLike(outputCanvas) ? outputCanvas : outputCanvas.canvas
	}

	//#endregion
}
