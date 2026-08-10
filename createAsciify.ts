/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 * @fileoverview
 * Picks a renderer for you, and degrades rather than failing.
 * @see {@link https://sister.software/asciify API documentation}
 * @module @sister.software/asciify
 */

import type { Asciify } from "./Asciify.ts"
import { Asciify2D } from "./Asciify2D.ts"
import { AsciifyWebGL } from "./AsciifyWebGL.ts"
import type { AsciifyOptions } from "./options/common.ts"
import { type Canvas2dContextLike, type CanvasLike, createCanvasLike, isCanvasLike } from "./utils/canvas.ts"

/**
 * Which rasterizer to use.
 *
 * @remarks
 *   - `"auto"` prefers WebGL2 and silently falls back to Canvas2D where it is unavailable. This is almost always what you
 *     want.
 *   - `"webgl"` demands {@linkcode AsciifyWebGL} and throws if the platform cannot provide it.
 *   - `"2d"` demands {@linkcode Asciify2D}. Pick this when you need a 2D context on the output canvas for something else
 *     — compositing your own overlay, say — since a WebGL context claims the canvas exclusively.
 *
 * @category Configuration
 */
export type AsciifyRendererPreference = "auto" | "webgl" | "2d"

/**
 * @category Configuration
 */
export interface CreateAsciifyOptions extends Partial<AsciifyOptions> {
	/**
	 * @default "auto"
	 */
	renderer?: AsciifyRendererPreference
}

/**
 * Reports whether this environment can give us a WebGL2 context at all.
 *
 * @remarks
 *   Probed on a throwaway 1x1 canvas so that asking the question does not answer it: requesting a WebGL context from a
 *   canvas claims that canvas permanently, and a canvas that has handed out a WebGL context can never hand out a 2D
 *   one. Asking on a scratch canvas keeps the real output canvas uncommitted until we have decided. A `true` here is
 *   not a promise. Browsers cap the number of live WebGL contexts — around 16 in Chrome — and creating the seventeenth
 *   returns null even though the platform clearly supports WebGL. {@linkcode createAsciify} therefore probes _and_
 *   catches.
 * @category Helper
 */
export function isWebGL2Available(): boolean {
	try {
		const canvas = createCanvasLike()
		canvas.width = 1
		canvas.height = 1

		return canvas.getContext("webgl2") !== null
	} catch {
		// Some environments throw rather than returning null. Either way, the answer is no.
		return false
	}
}

/**
 * Creates an asciify renderer, preferring the fastest one this platform can actually provide.
 *
 * @remarks
 *   **This is the entry point you want.** {@linkcode AsciifyWebGL} outperforms {@linkcode Asciify2D} by two orders of
 *   magnitude at realistic output sizes — 0.3ms against 22-46ms per frame — so the only reasons to choose the 2D
 *   renderer are that WebGL2 is unavailable, or that you need a 2D context on the output canvas yourself. Selection
 *   never leaves you with nothing. A platform without WebGL2 gets the 2D renderer, and so does a platform that claimed
 *   to have WebGL2 and then failed to deliver — a context limit, a blocklisted driver, a shader that would not compile.
 *   Only `renderer: "webgl"` turns those into an error, because at that point you have asked for something specific.
 *
 *   ```ts
 *   const canvas = document.createElement("canvas")
 *   const asciify = createAsciify(canvas)
 *   asciify.setSize(window.innerWidth, window.innerHeight)
 *   await asciify.rasterizeImage(image)
 *   ```
 *
 * @category Main
 * @see {@link https://sister.software/asciify API documentation}
 */
export function createAsciify(
	/**
	 * The canvas where the ASCII art will be rendered to.
	 *
	 * @optional
	 */
	outputCanvas: CanvasLike | Canvas2dContextLike = createCanvasLike("canvas"),
	/**
	 * Options to use when rendering the ASCII art, plus an optional {@linkcode renderer} preference.
	 *
	 * @optional
	 */
	options: CreateAsciifyOptions = {}
): Asciify {
	const { renderer = "auto", ...asciifyOptions } = options

	// A 2D context was handed to us directly, so the canvas is already committed and there is
	// nothing to decide. Honour it rather than throwing over a contradiction the caller did not
	// know they were making.
	if (!isCanvasLike(outputCanvas)) {
		if (renderer === "webgl") {
			throw new Error("Asciify: renderer 'webgl' cannot be used with a 2D context. Pass the canvas instead.")
		}

		return new Asciify2D(outputCanvas, asciifyOptions)
	}

	if (renderer === "2d") {
		return new Asciify2D(outputCanvas, asciifyOptions)
	}

	if (renderer === "webgl") {
		// Explicitly requested, so a failure is the caller's to hear about.
		return new AsciifyWebGL(outputCanvas, asciifyOptions)
	}

	if (!isWebGL2Available()) {
		return new Asciify2D(outputCanvas, asciifyOptions)
	}

	try {
		return new AsciifyWebGL(outputCanvas, asciifyOptions)
	} catch (webglError) {
		// The probe said yes and the real thing said no. That means either the context limit was
		// reached between the two calls, or the driver accepted a context and then refused to
		// compile the shader. Either way the output canvas may now be claimed by a WebGL context
		// that we cannot use, in which case the 2D fallback will fail too — so surface both causes
		// rather than the second one alone, which would be baffling on its own.
		try {
			return new Asciify2D(outputCanvas, asciifyOptions)
		} catch (fallbackError) {
			throw new Error(
				`Asciify: WebGL2 initialization failed (${(webglError as Error).message}), ` +
					`and falling back to Canvas2D also failed (${(fallbackError as Error).message}). ` +
					`This usually means the canvas was already claimed by another context.`,
				{ cause: webglError }
			)
		}
	}
}
