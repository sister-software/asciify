/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 * @fileoverview
 * The self-contained WebGL2 asciify renderer.
 * @see {@link https://sister.software/asciify API documentation}
 * @module @sister.software/asciify
 */

import type { Asciify } from "./Asciify.ts"
import { AsciifyBase } from "./AsciifyBase.ts"
import type { AsciifyOptions } from "./options/common.ts"
import { type CanvasLike, createCanvasLike, parseCssColor, type WebGLRendererLike } from "./utils/canvas.ts"
import { GlyphAtlas } from "./utils/GlyphAtlas.ts"
import { GlyphProgram } from "./utils/GlyphProgram.ts"
import type { FrameBuffer } from "./utils/readers.ts"

/**
 * Converts images, videos, and 3D renders into ASCII art using a single WebGL2 draw call.
 *
 * @remarks
 *   The entire frame is one fullscreen triangle. A fragment shader works out which character cell it belongs to, reads
 *   that cell's colour from a `columnCount` x `rowCount` source texture, derives the luminance, looks the glyph up in a
 *   packed atlas, and composites. There is no per-cell work on the CPU at all, which is the point — the 2D renderer's
 *   cost scales with cell count, and this does not. {@linkcode rasterizeWebGLRenderer} additionally skips the
 *   `readPixels` round trip that the 2D renderer needs, uploading the source renderer's canvas straight into a texture.
 *   This renderer owns its output canvas and creates its own context, which costs one cross-context upload per frame —
 *   a fixed ~0.15ms regardless of resolution. {@linkcode AsciifyPass} eliminates that by running inside the source
 *   renderer's context instead, at the cost of coupling. Note that taking a WebGL2 context claims the output canvas —
 *   you cannot also get a 2D context from it — and that the constructor throws where WebGL2 is unavailable. Use
 *   {@linkcode Asciify2D} in that case.
 *
 *   ```ts
 *   const outputCanvas = document.createElement("canvas")
 *   const asciify = new AsciifyWebGL(outputCanvas)
 *   asciify.setSize(window.innerWidth, window.innerHeight, threeRenderer)
 *   asciify.rasterizeWebGLRenderer(threeRenderer)
 *   ```
 *
 * @category Main
 * @see {@link https://sister.software/asciify API documentation}
 */
export class AsciifyWebGL extends AsciifyBase implements Asciify {
	/**
	 * The WebGL2 context owned by this renderer.
	 */
	public gl: WebGL2RenderingContext

	protected _atlas!: GlyphAtlas
	protected _glyphProgram!: GlyphProgram
	protected _sourceTexture!: WebGLTexture

	/**
	 * The grid dimensions the source texture was last allocated for.
	 *
	 * @internal
	 */
	protected _allocatedColumns = -1
	protected _allocatedRows = -1

	constructor(
		/**
		 * The canvas where the ASCII art will be rendered to.
		 *
		 * @optional
		 */
		outputCanvas: CanvasLike = createCanvasLike("canvas"),
		/**
		 * Options to use when rendering the ASCII art.
		 *
		 * @optional
		 */
		options: Partial<AsciifyOptions> = {}
	) {
		super(outputCanvas)

		const gl = outputCanvas.getContext("webgl2", {
			alpha: true,
			antialias: false,
			depth: false,
			stencil: false,
			desynchronized: true,
			premultipliedAlpha: false,
			preserveDrawingBuffer: false,
		}) as WebGL2RenderingContext | null

		if (!gl) {
			throw new Error("Asciify: WebGL2 is unavailable. Use Asciify2D instead.")
		}

		this.gl = gl
		this._glyphProgram = new GlyphProgram(gl)
		this._sourceTexture = this._glyphProgram.createSourceTexture()

		// Class fields are initialized by the time we reach here, so it is safe to build derived state.
		this.setOptions(options)
	}

	/**
	 * Renders a given RGBA buffer to the ASCII art canvas.
	 *
	 * @category Rasterization
	 */
	public rasterize(nextFrameBuffer: FrameBuffer, flipY = false): void {
		const { gl, columnCount, rowCount } = this

		if (columnCount === 0 || rowCount === 0) return

		gl.activeTexture(gl.TEXTURE0)
		gl.bindTexture(gl.TEXTURE_2D, this._sourceTexture)
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
		gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, columnCount, rowCount, gl.RGBA, gl.UNSIGNED_BYTE, nextFrameBuffer)

		this._draw(flipY)
	}

	/**
	 * Rasterizes the given WebGL renderer to the ASCII art canvas.
	 *
	 * @remarks
	 *   Unlike the 2D renderer, this uploads the source canvas directly as a texture rather than pulling its pixels back
	 *   to the CPU with `readPixels`. The source renderer must not have cleared its drawing buffer yet, which is the same
	 *   constraint `readPixels` carries — call this immediately after rendering.
	 * @category Rasterization
	 */
	public override rasterizeWebGLRenderer(
		renderer: WebGLRendererLike,
		_ctx?: WebGLRenderingContext | WebGL2RenderingContext,
		clearCanvas?: boolean,
		resetFrameBuffers?: boolean
	): void {
		const { gl } = this

		if (clearCanvas) {
			this.clearCanvas()
		}

		if (resetFrameBuffers) {
			this.clearFrameBuffers()
		}

		if (this.columnCount === 0 || this.rowCount === 0) return

		gl.activeTexture(gl.TEXTURE0)
		gl.bindTexture(gl.TEXTURE_2D, this._sourceTexture)
		// A canvas upload already arrives top-down, so no flip is needed on either side.
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
		// Uploading from a canvas otherwise runs the browser's default colour management and
		// alpha handling over the pixels. Both shift values by a step or two, which is enough to
		// push cells across a glyph boundary and pick a visibly different character — so the
		// output would drift from the 2D renderer's for no reason. Take the bytes as they are.
		gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE)
		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, renderer.domElement)

		this._draw(false)
	}

	/**
	 * Clears the canvas to the configured background color.
	 */
	public clearCanvas(): void {
		const { gl } = this
		const [red, green, blue, alpha] = parseCssColor(this.options.backgroundColor)

		gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
		gl.clearColor(red, green, blue, alpha)
		gl.clear(gl.COLOR_BUFFER_BIT)

		this._applyCanvasStyles()
	}

	/**
	 * Releases every GPU resource this renderer owns.
	 */
	public dispose(): void {
		this.gl.deleteTexture(this._sourceTexture)
		this._glyphProgram.dispose()
	}

	//#region Protected Methods

	/**
	 * @internal
	 */
	protected _onOptionsChanged(): void {
		const { fontFamily, debug } = this.options

		this._atlas = new GlyphAtlas(this._luminanceCodeMap, this._textureMetrics, fontFamily, debug)
		this._glyphProgram.setAtlas(this._atlas)
	}

	/**
	 * @internal
	 */
	protected _onResize(): void {
		const { gl, columnCount, rowCount } = this

		gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)

		if (columnCount === 0 || rowCount === 0) return

		// Reallocating the source texture is only necessary when the grid itself changed shape.
		if (columnCount !== this._allocatedColumns || rowCount !== this._allocatedRows) {
			gl.activeTexture(gl.TEXTURE0)
			gl.bindTexture(gl.TEXTURE_2D, this._sourceTexture)
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, columnCount, rowCount, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)

			this._allocatedColumns = columnCount
			this._allocatedRows = rowCount
		}
	}

	/**
	 * @ignore
	 */
	protected _draw(flipY: boolean): void {
		const { gl } = this
		const { pixelRatio, colorize, backgroundColor } = this.options

		this._glyphProgram.draw({
			sourceTexture: this._sourceTexture,
			columnCount: this.columnCount,
			rowCount: this.rowCount,
			cellSize: this._characterSize * pixelRatio,
			textureSize: this._textureMetrics.width,
			drawingBufferWidth: gl.drawingBufferWidth,
			drawingBufferHeight: gl.drawingBufferHeight,
			background: parseCssColor(backgroundColor),
			colorize,
			flipY,
		})
	}

	//#endregion
}
