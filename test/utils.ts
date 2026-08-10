/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 * @file Shared fixtures for the browser test suite.
 */

import type { Asciify } from "../Asciify.ts"
import { Asciify2D } from "../Asciify2D.ts"
import { AsciifyWebGL } from "../AsciifyWebGL.ts"
import type { AsciifyOptions } from "../options/common.ts"
import type { WebGLRendererLike } from "../utils/canvas.ts"

/**
 * Both renderer constructors, so parity suites can iterate over them.
 */
export const BACKENDS = [
	["Asciify2D", Asciify2D],
	["AsciifyWebGL", AsciifyWebGL],
] as const satisfies ReadonlyArray<
	readonly [string, new (canvas: HTMLCanvasElement, options?: Partial<AsciifyOptions>) => Asciify]
>

/**
 * Creates an output canvas with an explicit CSS size.
 *
 * @remarks
 *   `setSize` derives the backing store from `getBoundingClientRect()`, so a canvas with no CSS size feeds its own
 *   layout size back into itself and collapses. Every test canvas must be sized and attached.
 */
export function createStage(cssWidth: number, cssHeight: number): HTMLCanvasElement {
	const canvas = document.createElement("canvas")

	canvas.style.display = "block"
	canvas.style.width = `${cssWidth}px`
	canvas.style.height = `${cssHeight}px`
	// A border would be included in getBoundingClientRect and skew the backing store.
	canvas.style.border = "none"
	canvas.style.padding = "0"

	document.body.appendChild(canvas)

	return canvas
}

/**
 * A hand-driven WebGL source, structurally compatible with `THREE.WebGLRenderer`.
 *
 * @remarks
 *   `preserveDrawingBuffer` is on so the buffer survives long enough to be both read back and uploaded as a texture
 *   within a synchronous test.
 */
export interface TestRenderer extends WebGLRendererLike {
	gl: WebGL2RenderingContext
	/**
	 * Draws the fixture pattern. `time` feeds the shader's only uniform.
	 */
	render(time?: number): void
}

const VERTEX_SHADER = /* glsl */ `
	attribute vec2 position;
	varying vec2 vUv;
	void main() {
		vUv = position * 0.5 + 0.5;
		gl_Position = vec4(position, 0.0, 1.0);
	}`

/**
 * A deterministic, strongly asymmetric gradient. The high-frequency blue channel puts plenty of cells right on a glyph
 * boundary, which is where the two backends are most likely to disagree.
 */
export const GRADIENT_SHADER = /* glsl */ `
	precision highp float;
	varying vec2 vUv;
	uniform float time;
	void main() {
		float t = time * 0.001;
		gl_FragColor = vec4(vUv.x, vUv.y * 0.5 + sin(t) * 0.25 + 0.25, fract(vUv.x * 7.0 + t), 1.0);
	}`

/**
 * Creates a WebGL source that renders `fragmentShader` into its own canvas.
 */
export function createTestRenderer(fragmentShader: string = GRADIENT_SHADER): TestRenderer {
	const canvas = document.createElement("canvas")
	const gl = canvas.getContext("webgl2", { preserveDrawingBuffer: true, antialias: false })!

	const compile = (type: number, source: string): WebGLShader => {
		const shader = gl.createShader(type)!
		gl.shaderSource(shader, source)
		gl.compileShader(shader)

		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			throw new Error(`test shader failed to compile: ${gl.getShaderInfoLog(shader)}`)
		}

		return shader
	}

	const program = gl.createProgram()!
	gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX_SHADER))
	gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentShader))
	gl.linkProgram(program)

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		throw new Error(`test program failed to link: ${gl.getProgramInfoLog(program)}`)
	}

	gl.useProgram(program)

	const buffer = gl.createBuffer()
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)

	const positionLocation = gl.getAttribLocation(program, "position")
	gl.enableVertexAttribArray(positionLocation)
	gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

	const timeLocation = gl.getUniformLocation(program, "time")

	return {
		gl,
		domElement: canvas,
		setSize: (width, height) => {
			canvas.width = width
			canvas.height = height
		},
		getContext: () => gl,
		render(time = 0) {
			gl.viewport(0, 0, canvas.width, canvas.height)
			gl.useProgram(program)
			gl.uniform1f(timeLocation, time)
			gl.drawArrays(gl.TRIANGLES, 0, 3)
		},
	}
}

let readbackCanvas: HTMLCanvasElement | undefined

/**
 * Reads a canvas back as RGBA bytes.
 *
 * @remarks
 *   Goes through a 2D canvas because a WebGL output canvas has no 2D context of its own. Must run in the same task as
 *   the draw, since the renderers do not preserve their drawing buffer.
 */
export function readCanvas(canvas: HTMLCanvasElement): Uint8ClampedArray {
	readbackCanvas ??= document.createElement("canvas")
	readbackCanvas.width = canvas.width
	readbackCanvas.height = canvas.height

	const context = readbackCanvas.getContext("2d", { willReadFrequently: true })!

	context.clearRect(0, 0, canvas.width, canvas.height)
	context.drawImage(canvas, 0, 0)

	return context.getImageData(0, 0, canvas.width, canvas.height).data
}

/**
 * Compares two RGBA buffers, ignoring alpha.
 */
export function comparePixels(
	a: Uint8ClampedArray,
	b: Uint8ClampedArray
): { differing: number; worst: number; total: number } {
	let differing = 0
	let worst = 0

	for (let i = 0; i < a.length; i += 4) {
		const delta = Math.max(Math.abs(a[i]! - b[i]!), Math.abs(a[i + 1]! - b[i + 1]!), Math.abs(a[i + 2]! - b[i + 2]!))

		if (delta > 0) {
			differing++
		}

		if (delta > worst) {
			worst = delta
		}
	}

	return { differing, worst, total: a.length / 4 }
}

/**
 * Total ink in a rectangle, weighted by alpha. Used to locate content without asserting exact pixels.
 */
export function inkIn(pixels: Uint8ClampedArray, width: number, x: number, y: number, w: number, h: number): number {
	let sum = 0

	for (let row = y; row < y + h; row++) {
		for (let column = x; column < x + w; column++) {
			const i = (row * width + column) * 4
			sum += (pixels[i]! + pixels[i + 1]! + pixels[i + 2]!) * (pixels[i + 3]! / 255)
		}
	}

	return Math.round(sum / 1000)
}
