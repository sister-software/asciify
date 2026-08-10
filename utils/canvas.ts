/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 * @fileoverview
 * This file contains utility functions for the @sister.software/asciify module.
 * @see {@link https://sister.software/asciify API documentation}
 * @module @sister.software/asciify
 */

/**
 * Either a canvas or an offscreen canvas. Note that the offscreen canvas support varies between browsers. Safari tends
 * to produce slight visual artifacts when using offscreen canvases.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas MDN on Offscreen Canvas}
 */
export type CanvasLike = OffscreenCanvas | HTMLCanvasElement

/**
 * Either a canvas 2D context or an offscreen canvas 2D context. Note that the offscreen canvas support varies between
 * browsers. Safari tends to produce slight visual artifacts when using offscreen canvases.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvasRenderingContext2D MDN on Offscreen Canvas 2D Context}
 */
export type Canvas2dContextLike = OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D

/**
 * The subset of a WebGL renderer that asciify actually uses.
 *
 * @remarks
 *   Asciify has no dependency on Three.js — this interface is structural, so a `THREE.WebGLRenderer` satisfies it
 *   without any import on either side. Anything else exposing the same three members works just as well.
 * @see {@link https://threejs.org/docs/#api/en/renderers/WebGLRenderer Three.js WebGLRenderer}
 */
export interface WebGLRendererLike {
	/**
	 * The canvas the renderer draws into. Its dimensions determine how many pixels are read back.
	 */
	domElement: HTMLCanvasElement

	/**
	 * Resizes the renderer's drawing buffer.
	 *
	 * @remarks
	 *   Asciify always passes `updateStyle: false` so the renderer's CSS size is left alone.
	 */
	setSize(width: number, height: number, updateStyle?: boolean): void

	/**
	 * Returns the underlying WebGL context, used to read pixels back from the drawing buffer.
	 */
	getContext(): WebGLRenderingContext | WebGL2RenderingContext
}

/**
 * Anything with mutable pixel dimensions, such as a canvas or a `THREE.WebGLRenderTarget`.
 *
 * @remarks
 *   Structural for the same reason as {@linkcode WebGLRendererLike} — no Three.js import required.
 */
export interface SizableLike {
	width: number
	height: number
}

/**
 * @ignore
 * @internal
 */
export const isWebGLRenderer = (object: unknown): object is WebGLRendererLike => {
	return typeof object === "object" && object !== null && "setSize" in object
}

/**
 * @ignore
 * @internal
 */
export const isCanvasLike = (object: CanvasLike | Canvas2dContextLike): object is CanvasLike => {
	return typeof object === "object" && object !== null && "getContext" in object
}

/**
 * Creates a canvas-like object given the environment.
 *
 * @ignore
 * @internal
 */
export function createCanvasLike(
	/**
	 * Force a specific canvas-like object to be created.
	 *
	 * @default "canvas" in the browser, 'offscreen' in Node.js and Workers
	 * @optional
	 */
	preferred?: "canvas" | "offscreen"
): CanvasLike {
	if (preferred === undefined) {
		if (typeof OffscreenCanvas !== "undefined") {
			// Given a Node.js or Worker environment, prefer an offscreen canvas...
			preferred = "offscreen"
		} else if (typeof document !== "undefined") {
			// Given a browser-like environment, prefer a canvas...
			preferred = "canvas"
		}
	}

	switch (preferred) {
		case "canvas":
			return document.createElement("canvas")
		case "offscreen":
			return new OffscreenCanvas(1, 1)
	}

	throw new Error("Environment does not appear to support canvas-like objects")
}

/**
 * Plucks a 2D context from a canvas-like object.
 *
 * @ignore
 * @internal
 */
export function pluck2dContext(
	canvasLike: CanvasLike | Canvas2dContextLike,
	options: CanvasRenderingContext2DSettings = {}
): Canvas2dContextLike {
	if (isCanvasLike(canvasLike)) {
		return canvasLike.getContext("2d", {
			alpha: false,
			desynchronized: true,
			...options,
		}) as CanvasRenderingContext2D
	}

	return canvasLike as CanvasRenderingContext2D
}

/**
 * Resolves any CSS color string to normalized RGBA components.
 *
 * @remarks
 *   The browser already has a complete CSS color parser, so we borrow it: fill one pixel and read it back. That accepts
 *   named colors, `hsl()`, `color()`, and anything else the platform grows, which a hand-rolled parser would not.
 * @ignore
 * @internal
 */
export function parseCssColor(color: string): [red: number, green: number, blue: number, alpha: number] {
	const canvas = createCanvasLike()
	canvas.width = 1
	canvas.height = 1

	const context = pluck2dContext(canvas, { alpha: true, willReadFrequently: true })

	context.clearRect(0, 0, 1, 1)
	context.fillStyle = color
	context.fillRect(0, 0, 1, 1)

	const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data

	return [red! / 255, green! / 255, blue! / 255, alpha! / 255]
}

/**
 * Tests if a canvas-like object is an elemental canvas. Note that this only works in the same browser frame as the
 * canvas was created.
 *
 * @ignore
 */
export function isHTMLCanvasElement(canvasLike: CanvasLike): canvasLike is HTMLCanvasElement {
	return canvasLike instanceof HTMLCanvasElement
}
