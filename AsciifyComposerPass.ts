/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 * @fileoverview
 * Adapts the zero-copy renderer to Three.js's EffectComposer.
 * @see {@link https://sister.software/asciify API documentation}
 * @module @sister.software/asciify
 */

import { AsciifyPass } from "./AsciifyPass.ts"
import type { AsciifyOptions } from "./options/common.ts"
import { getFramebufferTexture } from "./utils/canvas.ts"

/**
 * The slice of Three.js's `WebGLRenderTarget` a composer pass actually touches.
 *
 * @remarks
 *   Structural, like every other Three.js type in this library, so that nothing here imports Three.
 * @category Configuration
 */
export interface RenderTargetLike {
	width: number
	height: number
	texture: unknown
}

/**
 * The slice of Three.js's `WebGLRenderer` a composer pass actually touches.
 *
 * @category Configuration
 */
export interface ComposerRendererLike {
	getContext(): WebGLRenderingContext | WebGL2RenderingContext
	setRenderTarget(renderTarget: RenderTargetLike | null): void
	resetState(): void
}

/**
 * Turns asciify into a Three.js `EffectComposer` pass.
 *
 * @remarks
 *   `EffectComposer` hands each pass a `readBuffer` holding the previous pass's output and a `writeBuffer` to render
 *   into, then swaps them. This class conforms to that protocol by duck-typing — it never imports Three, so the library
 *   stays dependency-free, and it satisfies `Pass` structurally rather than by inheritance. **The composer must be
 *   sized to the character grid, not the screen.** Asciify wants one source pixel per character cell, so the buffers
 *   flowing through the chain need to be `columnCount` x `rowCount`. That is the one genuinely awkward part of this
 *   integration, because a composer is normally sized to the canvas — see {@linkcode syncComposerSize}. Getting the
 *   read buffer's texture is the other subtlety. Custom passes usually dig it out of `renderer.properties`, which is
 *   private. This asks WebGL instead: bind the target, then query the framebuffer's colour attachment. Public API, same
 *   object, no version coupling.
 *
 *   ```ts
 *   const composer = new EffectComposer(renderer)
 *   composer.addPass(new RenderPass(scene, camera))
 *   const asciiPass = new AsciifyComposerPass(renderer, { fontSize: 12 })
 *   asciiPass.renderToScreen = true
 *   composer.addPass(asciiPass)
 *   // One source pixel per character cell, not one per screen pixel.
 *   asciiPass.syncComposerSize(composer)
 *   ```
 *
 * @category Main
 * @see {@link https://sister.software/asciify API documentation}
 */
export class AsciifyComposerPass {
	/**
	 * The renderer doing the asciifying. Exposed so options and grid dimensions stay reachable.
	 */
	public readonly asciify: AsciifyPass

	//#region The Pass protocol EffectComposer expects

	/**
	 * Whether the composer should run this pass at all.
	 */
	public enabled = true

	/**
	 * Whether the composer should swap its buffers after this pass.
	 *
	 * @remarks
	 *   True, because this pass reads one buffer and writes another rather than modifying in place.
	 */
	public needsSwap = true

	/**
	 * Whether the composer should clear before this pass.
	 */
	public clear = false

	/**
	 * Whether this pass draws to the canvas instead of into the write buffer. Usually true, since asciified output is
	 * rarely an input to anything else.
	 */
	public renderToScreen = false

	//#endregion

	protected _renderer: ComposerRendererLike
	protected _gl: WebGL2RenderingContext

	constructor(
		/**
		 * The Three.js `WebGLRenderer` driving the composer.
		 */
		renderer: ComposerRendererLike,
		/**
		 * Options to use when rendering the ASCII art.
		 *
		 * @optional
		 */
		options: Partial<AsciifyOptions> = {}
	) {
		const gl = renderer.getContext()

		// WebGL1 has no texelFetch, which the glyph shader depends on.
		if (!(typeof WebGL2RenderingContext !== "undefined" && gl instanceof WebGL2RenderingContext)) {
			throw new Error("Asciify: AsciifyComposerPass requires a WebGL2 renderer.")
		}

		this._renderer = renderer
		this._gl = gl
		this.asciify = new AsciifyPass(gl, options)
	}

	/**
	 * The number of character columns, once {@linkcode setSize} has run.
	 */
	public get columnCount(): number {
		return this.asciify.columnCount
	}

	/**
	 * The number of character rows, once {@linkcode setSize} has run.
	 */
	public get rowCount(): number {
		return this.asciify.rowCount
	}

	/**
	 * Called by `EffectComposer` whenever it resizes.
	 *
	 * @remarks
	 *   The arguments describe the composer's buffers, which we ignore — the grid comes from the drawing buffer we are
	 *   ultimately painting into. See {@linkcode syncComposerSize} for why the composer's own size then needs
	 *   correcting.
	 */
	public setSize(_width: number, _height: number): void {
		this.asciify.setSize()
	}

	/**
	 * Resizes a composer so its buffers carry one pixel per character cell.
	 *
	 * @remarks
	 *   Call this after adding the pass, and again whenever the canvas resizes. Without it the composer's buffers match
	 *   the canvas, every earlier pass renders at full resolution, and asciify samples only the top-left corner of the
	 *   result. Note the ordering trap: `composer.setSize()` calls `setSize` on every pass, including this one, which
	 *   recomputes the grid — so the grid must be up to date _before_ we can ask for it. Hence the two steps.
	 */
	public syncComposerSize(composer: { setSize(width: number, height: number): void }): void {
		this.asciify.setSize()

		composer.setSize(this.asciify.columnCount, this.asciify.rowCount)
	}

	/**
	 * Called by `EffectComposer` once per frame.
	 */
	public render(
		renderer: ComposerRendererLike,
		writeBuffer: RenderTargetLike | null,
		readBuffer: RenderTargetLike | null
	): void {
		const gl = this._gl

		// Bind the read buffer purely so we can ask WebGL what texture is attached to it.
		renderer.setRenderTarget(readBuffer)

		const sourceTexture = getFramebufferTexture(gl)

		if (!sourceTexture) {
			throw new Error(
				"Asciify: could not resolve the read buffer's texture. " +
					"Multisampled render targets attach a renderbuffer rather than a texture — " +
					"construct the EffectComposer with `samples: 0`."
			)
		}

		// Now point at wherever this pass's output belongs and draw over it.
		renderer.setRenderTarget(this.renderToScreen ? null : writeBuffer)

		// Render targets are framebuffers, so their rows run bottom-to-top.
		this.asciify.rasterizeTexture(sourceTexture, true)

		// Three caches GL state and we have just changed the program, VAO, texture bindings, and
		// viewport behind its back. Without this the next frame renders with stale assumptions.
		renderer.resetState()
	}

	/**
	 * Releases the GPU resources this pass created.
	 */
	public dispose(): void {
		this.asciify.dispose()
	}
}
