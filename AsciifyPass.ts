/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 * @fileoverview
 * A zero-copy asciify renderer that runs inside someone else's WebGL2 context.
 * @see {@link https://sister.software/asciify API documentation}
 * @module @sister.software/asciify
 */

import type { Asciify } from "./Asciify.ts"
import { AsciifyBase } from "./AsciifyBase.ts"
import type { AsciifyOptions } from "./options/common.ts"
import { type CanvasLike, parseCssColor, type SizableLike, type WebGLRendererLike } from "./utils/canvas.ts"
import { GlyphAtlas } from "./utils/GlyphAtlas.ts"
import { GlyphProgram } from "./utils/GlyphProgram.ts"
import type { FrameBuffer } from "./utils/readers.ts"

/**
 * Converts a WebGL texture into ASCII art without ever copying it off the GPU.
 *
 * @remarks
 *   Where {@linkcode AsciifyWebGL} owns a canvas and a context of its own, this renderer borrows both from its host.
 *   The source is a texture the host already has — a Three.js `WebGLRenderTarget`'s `.texture`, say — which the shader
 *   samples in place. Nothing crosses a context boundary and nothing round-trips through the CPU. That saves the fixed
 *   per-frame upload {@linkcode AsciifyWebGL} pays, worth roughly 0.15ms — which halves the renderer's cost at 1080p
 *   and below, and breaks even at 4K where fragment work dominates instead. The trade is coupling: the host owns the
 *   canvas, the context, and the render loop. **State.** The pass changes the bound program, vertex array, texture
 *   units 0-2, viewport, and the active texture unit. It does not touch blend, depth, or framebuffer bindings, and it
 *   draws into whatever framebuffer is bound when you call it. Libraries that cache GL state need telling afterwards —
 *   with Three.js, call `renderer.resetState()`. **Sizing.** {@linkcode setSize} does _not_ resize the host's canvas,
 *   because the host owns it. It reads the drawing buffer and recomputes the character grid from that. Call it whenever
 *   the host resizes. That also means **applying `pixelRatio` to the drawing buffer is the host's job** — with
 *   Three.js, `renderer.setPixelRatio(...)`. The `pixelRatio` option still scales the glyphs, so it must agree with
 *   whatever the host used, or the grid will not match the other renderers'.
 *
 *   ```ts
 *   const renderer = new THREE.WebGLRenderer()
 *   const target = new THREE.WebGLRenderTarget(1, 1)
 *   const asciify = new AsciifyPass(renderer.getContext())
 *   // One source pixel per character cell.
 *   asciify.setSize()
 *   target.setSize(asciify.columnCount, asciify.rowCount)
 *   function frame() {
 *   	renderer.setRenderTarget(target)
 *   	renderer.render(scene, camera)
 *   	renderer.setRenderTarget(null)
 *   	// A render target's rows run bottom-to-top.
 *   	asciify.rasterizeTexture(target.texture, true)
 *   	renderer.resetState()
 *   }
 *   ```
 *
 * @category Main
 * @see {@link https://sister.software/asciify API documentation}
 */
export class AsciifyPass extends AsciifyBase implements Asciify {
	/**
	 * The host's WebGL2 context. Not owned by this renderer.
	 */
	public gl: WebGL2RenderingContext

	protected _atlas!: GlyphAtlas
	protected _glyphProgram!: GlyphProgram

	/**
	 * A texture used only by {@linkcode rasterize}, for callers handing over CPU-side pixels rather than something already
	 * on the GPU. Allocated lazily, since the whole point of this renderer is to avoid needing it.
	 *
	 * @internal
	 */
	protected _uploadTexture: WebGLTexture | null = null
	protected _allocatedColumns = -1
	protected _allocatedRows = -1

	constructor(
		/**
		 * The WebGL2 context to draw into. Typically `threeRenderer.getContext()`.
		 */
		gl: WebGL2RenderingContext,
		/**
		 * Options to use when rendering the ASCII art.
		 *
		 * @optional
		 */
		options: Partial<AsciifyOptions> = {}
	) {
		super(gl.canvas as CanvasLike)

		this.gl = gl
		this._glyphProgram = new GlyphProgram(gl)

		// Class fields are initialized by the time we reach here, so it is safe to build derived state.
		this.setOptions(options)
	}

	/**
	 * Rasterizes a texture the host already holds on the GPU.
	 *
	 * @remarks
	 *   This is the entry point that makes this renderer worth using — the texture is sampled where it sits, with no
	 *   upload and no readback.
	 * @category Rasterization
	 */
	public rasterizeTexture(
		/**
		 * A `columnCount` x `rowCount` texture, one texel per character cell.
		 */
		texture: WebGLTexture,
		/**
		 * Whether the texture's rows run bottom-to-top. **True for anything rendered into a framebuffer**, including every
		 * Three.js `WebGLRenderTarget`; false for textures uploaded from a canvas or an image.
		 *
		 * @optional
		 */
		flipY = false
	): void {
		if (this.columnCount === 0 || this.rowCount === 0) return

		this._draw(texture, flipY)
	}

	/**
	 * Renders a given RGBA buffer to the host's drawing buffer.
	 *
	 * @remarks
	 *   Provided for interface parity. This uploads the buffer into a texture of its own, so it gives up the advantage
	 *   this renderer exists for — prefer {@linkcode rasterizeTexture}.
	 * @category Rasterization
	 */
	public rasterize(nextFrameBuffer: FrameBuffer, flipY = false): void {
		const { gl, columnCount, rowCount } = this

		if (columnCount === 0 || rowCount === 0) return

		this._uploadTexture ??= this._glyphProgram.createSourceTexture()

		gl.activeTexture(gl.TEXTURE0)
		gl.bindTexture(gl.TEXTURE_2D, this._uploadTexture)
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)

		if (columnCount !== this._allocatedColumns || rowCount !== this._allocatedRows) {
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, columnCount, rowCount, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
			this._allocatedColumns = columnCount
			this._allocatedRows = rowCount
		}

		gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, columnCount, rowCount, gl.RGBA, gl.UNSIGNED_BYTE, nextFrameBuffer)

		this._draw(this._uploadTexture, flipY)
	}

	/**
	 * Sizes the character grid to the host's drawing buffer.
	 *
	 * @remarks
	 *   Unlike every other renderer, this **does not resize anything** — the host owns the canvas. The width and height
	 *   arguments are ignored; the grid is derived from `gl.drawingBufferWidth` and `gl.drawingBufferHeight`. Call it
	 *   after the host resizes.
	 */
	public override setSize(
		_nextWidth?: number,
		_nextHeight?: number,
		imageSource?: CanvasLike | WebGLRendererLike | SizableLike
	): void {
		this._updateGrid()

		this.applySizeTo(this._scratchCtx.canvas)

		if (imageSource) {
			this.applySizeTo(imageSource)
		}
	}

	/**
	 * Clears the host's drawing buffer to the configured background color.
	 *
	 * @remarks
	 *   Rarely what you want — the pass paints every pixel of its viewport anyway, and the host usually has its own
	 *   opinion about clearing.
	 */
	public clearCanvas(): void {
		const { gl } = this
		const [red, green, blue, alpha] = parseCssColor(this.options.backgroundColor)

		gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
		gl.clearColor(red, green, blue, alpha)
		gl.clear(gl.COLOR_BUFFER_BIT)
	}

	/**
	 * Releases the GPU resources this renderer created. The host's context is left alone.
	 */
	public dispose(): void {
		if (this._uploadTexture) {
			this.gl.deleteTexture(this._uploadTexture)
			this._uploadTexture = null
		}

		this._glyphProgram.dispose()
	}

	//#region Protected Methods

	/**
	 * The host's drawing buffer, rather than the canvas backing store. They are usually the same, but the drawing buffer
	 * is the surface actually being drawn into.
	 *
	 * @ignore
	 */
	protected override get _surfaceWidth(): number {
		return this.gl.drawingBufferWidth
	}

	/**
	 * @ignore
	 */
	protected override get _surfaceHeight(): number {
		return this.gl.drawingBufferHeight
	}

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
		// Nothing to resize: the host owns the drawing buffer and the source texture.
	}

	/**
	 * @ignore
	 */
	protected _draw(sourceTexture: WebGLTexture, flipY: boolean): void {
		const { gl } = this
		const { pixelRatio, colorize, backgroundColor } = this.options

		this._glyphProgram.draw({
			sourceTexture,
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
