/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 * @fileoverview
 * The backend-agnostic contract shared by every asciify renderer.
 * @see {@link https://sister.software/asciify API documentation}
 * @module @sister.software/asciify
 */

import type { AsciifyOptions } from "./options/common.ts"
import type { CanvasLike, SizableLike, WebGLRendererLike } from "./utils/canvas.ts"
import type { FrameBuffer } from "./utils/readers.ts"

/**
 * Converts images, videos, and 3D renders into ASCII art.
 *
 * @remarks
 *   This is the interface every renderer implements. Two are provided:
 *
 *   - {@linkcode Asciify2D} rasterizes with the Canvas2D API. It runs anywhere a 2D context does, including workers via
 *     `OffscreenCanvas`.
 *   - {@linkcode AsciifyWebGL} rasterizes the whole frame in a single draw call. It needs a WebGL2 context and gives up
 *     the 2D context on the output canvas in exchange. Both are constructed the same way and accept the same options,
 *     so switching backends is a one-word change.
 *
 *   ```ts
 *   const canvas = document.createElement("canvas")
 *   const asciify: Asciify = new Asciify2D(canvas)
 *   asciify.setSize(window.innerWidth, window.innerHeight)
 *   await asciify.rasterizeImage(image)
 *   ```
 *
 * @category Main
 * @see {@link https://sister.software/asciify API documentation}
 */
export interface Asciify {
	/**
	 * The canvas where ASCII art is rasterized to.
	 *
	 * @remarks
	 *   If rendering to the screen, make sure to mount the canvas to the DOM.
	 * @see {@linkcode Asciify.setSize}
	 */
	readonly canvas: CanvasLike

	/**
	 * A type-friendly getter for the canvas element.
	 *
	 * @throws `Error` if the renderer was given an `OffscreenCanvas`.
	 */
	readonly domElement: HTMLCanvasElement

	/**
	 * The number of columns in the ASCII art. This corresponds to the width of the source material.
	 */
	readonly columnCount: number

	/**
	 * The number of rows in the ASCII art. This corresponds to the height of the source material.
	 *
	 * @see {@linkcode Asciify.setSize}
	 */
	readonly rowCount: number

	/**
	 * The options used to initialize the renderer.
	 *
	 * @see {@linkcode Asciify.setOptions}
	 */
	readonly options: AsciifyOptions

	/**
	 * Returns the character that best matches the given brightness.
	 */
	getCharacterFromLuminance(luminance: number): string

	/**
	 * Sets the size of the ASCII art canvas, updating the number of columns and rows.
	 *
	 * You should call this method whenever the renderer changes dimensions.
	 *
	 * ```ts
	 * asciify.setSize(width, height, renderer)
	 * ```
	 *
	 * Alternatively, use the `columnCount` and `rowCount` properties to size the source separately.
	 *
	 * ```ts
	 * asciify.setSize(width, height)
	 * renderer.setSize(asciify.columnCount, asciify.rowCount)
	 * ```
	 */
	setSize(nextWidth?: number, nextHeight?: number, imageSource?: CanvasLike | WebGLRendererLike | SizableLike): void

	/**
	 * Resizes a given image source to fit the ASCII art canvas, i.e. one source pixel per character cell.
	 *
	 * Note that this method does not resize the output canvas.
	 *
	 * @see {@linkcode Asciify.setSize}
	 */
	applySizeTo(imageSource: CanvasLike | WebGLRendererLike | SizableLike): void

	/**
	 * Sets new options for the ASCII art. Useful for changing the renderer on the fly.
	 *
	 * @remarks
	 *   This rebuilds every derived resource — the luminance map, the glyph textures, the grid — so it is correct to call
	 *   at any time, but it is not cheap enough for a per-frame call.
	 */
	setOptions(nextOptions?: Partial<AsciifyOptions>): void

	/**
	 * Renders a given RGBA buffer to the ASCII art canvas.
	 *
	 * This method may be used directly when performance is critical.
	 *
	 * @category Rasterization
	 */
	rasterize(
		nextFrameBuffer: FrameBuffer,
		/**
		 * Whether the buffer's rows run bottom-to-top, as `WebGLRenderingContext.readPixels` returns them.
		 */
		flipY?: boolean
	): void

	/**
	 * Rasterizes the given image to the ASCII art canvas.
	 *
	 * @category Rasterization
	 */
	rasterizeImage(imageSource: CanvasImageSource): Promise<FrameBuffer>

	/**
	 * Rasterizes the given WebGL renderer — a Three.js `WebGLRenderer`, or anything structurally alike — to the ASCII art
	 * canvas.
	 *
	 * @category Rasterization
	 */
	rasterizeWebGLRenderer(
		renderer: WebGLRendererLike,
		ctx?: WebGLRenderingContext | WebGL2RenderingContext,
		clearCanvas?: boolean,
		resetFrameBuffers?: boolean
	): void

	/**
	 * Clears the canvas. Asciify will automatically handle this for you in most cases.
	 */
	clearCanvas(): void

	/**
	 * Clears the frame buffers. Asciify will automatically handle this for you in most cases.
	 */
	clearFrameBuffers(): void
}
