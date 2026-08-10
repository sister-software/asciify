/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 * @file `AsciifyPass` samples a texture in the host's own context rather than uploading one, which
 *   is a completely different route to the same pixels. These tests hold it to that.
 */

import { describe, expect, it } from "vitest"

import { Asciify2D } from "../Asciify2D.ts"
import { AsciifyPass } from "../AsciifyPass.ts"
import { AsciifyWebGL } from "../AsciifyWebGL.ts"
import type { AsciifyOptions } from "../options/common.ts"
import { comparePixels, createStage, createTestRenderer, readCanvas } from "./utils.ts"

const BASE_OPTIONS: Partial<AsciifyOptions> = {
	fontSize: 8,
	pixelRatio: 1,
	contrastRatio: 3,
	fontFamily: "monospace",
}

/**
 * Renders the fixture through `AsciifyPass`, hosting it in a context of our own and feeding it a texture rendered into
 * a framebuffer — exactly the arrangement Three.js produces with a `WebGLRenderTarget`.
 */
function renderViaPass(
	width: number,
	height: number,
	time: number,
	options: Partial<AsciifyOptions> = {}
): { pixels: Uint8ClampedArray; columnCount: number; rowCount: number } {
	const stage = createStage(width, height)
	// The host owns the canvas and its size, as it would in a Three.js app — including applying
	// the device pixel ratio, which is what `renderer.setPixelRatio` does there. AsciifyPass reads
	// the drawing buffer it is given and never resizes it.
	const pixelRatio = options.pixelRatio ?? BASE_OPTIONS.pixelRatio ?? 1
	stage.width = width * pixelRatio
	stage.height = height * pixelRatio

	const gl = stage.getContext("webgl2", { antialias: false, premultipliedAlpha: false })!
	const asciify = new AsciifyPass(gl, { ...BASE_OPTIONS, ...options })
	asciify.setSize()

	const { columnCount, rowCount } = asciify

	// Render the fixture into a texture inside this same context.
	const scene = createTestRenderer()
	scene.setSize(columnCount, rowCount)
	scene.render(time)

	const sourcePixels = new Uint8Array(columnCount * rowCount * 4)
	scene.gl.readPixels(0, 0, columnCount, rowCount, scene.gl.RGBA, scene.gl.UNSIGNED_BYTE, sourcePixels)

	const texture = gl.createTexture()!
	gl.activeTexture(gl.TEXTURE0)
	gl.bindTexture(gl.TEXTURE_2D, texture)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, columnCount, rowCount, 0, gl.RGBA, gl.UNSIGNED_BYTE, sourcePixels)

	// `readPixels` gave us bottom-up rows, which is also what a render target holds.
	asciify.rasterizeTexture(texture, true)

	return { pixels: readCanvas(stage), columnCount, rowCount }
}

/**
 * The same fixture through one of the canvas-owning renderers, for comparison.
 */
function renderViaRenderer(
	Renderer: typeof Asciify2D | typeof AsciifyWebGL,
	width: number,
	height: number,
	time: number,
	options: Partial<AsciifyOptions> = {}
): { pixels: Uint8ClampedArray; columnCount: number; rowCount: number } {
	const stage = createStage(width, height)
	const asciify = new Renderer(stage, { ...BASE_OPTIONS, ...options })
	const scene = createTestRenderer()

	asciify.setSize(width, height, scene)
	scene.render(time)
	asciify.rasterizeWebGLRenderer(scene, scene.gl)

	return { pixels: readCanvas(stage), columnCount: asciify.columnCount, rowCount: asciify.rowCount }
}

describe("AsciifyPass", () => {
	it("derives the same grid as the canvas-owning renderers", () => {
		const pass = renderViaPass(300, 200, 0)
		const webgl = renderViaRenderer(AsciifyWebGL, 300, 200, 0)

		expect([pass.columnCount, pass.rowCount]).toEqual([webgl.columnCount, webgl.rowCount])
	})

	describe.each([
		{ label: "grid fits the surface exactly", width: 296, height: 200 },
		{ label: "surface is wider than the grid", width: 300, height: 200 },
		{ label: "surface is wider and taller than the grid", width: 301, height: 201 },
	])("$label ($width x $height)", ({ width, height }) => {
		it("matches AsciifyWebGL pixel for pixel", () => {
			const pass = renderViaPass(width, height, 0)
			const webgl = renderViaRenderer(AsciifyWebGL, width, height, 0)

			const { differing, worst, total } = comparePixels(pass.pixels, webgl.pixels)

			expect({ differing, worst }, `${differing}/${total} px differ, worst ${worst}`).toEqual({
				differing: 0,
				worst: 0,
			})
		})

		it("matches Asciify2D pixel for pixel", () => {
			const pass = renderViaPass(width, height, 0)
			const twoD = renderViaRenderer(Asciify2D, width, height, 0)

			expect(comparePixels(pass.pixels, twoD.pixels).differing).toBe(0)
		})
	})

	it.each([0, 1000, 12_345])("agrees at a pinned animation tick (t=%i)", (time) => {
		const pass = renderViaPass(300, 200, time)
		const webgl = renderViaRenderer(AsciifyWebGL, 300, 200, time)

		expect(comparePixels(pass.pixels, webgl.pixels).differing).toBe(0)
	})

	it.each([
		{ label: "character spacing leaves gaps", options: { characterSpacingRatio: 1.5 } },
		{ label: "device pixel ratio above one", options: { pixelRatio: 2 } },
		{ label: "colorize disabled", options: { colorize: false } },
		{ label: "a non-default character set", options: { characterSet: "░▒▓█", contrastRatio: 0 } },
	])("agrees when $label", ({ options }) => {
		const pass = renderViaPass(300, 200, 0, options)
		const webgl = renderViaRenderer(AsciifyWebGL, 300, 200, 0, options)

		expect(comparePixels(pass.pixels, webgl.pixels).differing).toBe(0)
	})

	it("does not resize the host's canvas", () => {
		const stage = createStage(300, 200)
		stage.width = 640
		stage.height = 480

		const gl = stage.getContext("webgl2", { antialias: false })!
		const asciify = new AsciifyPass(gl, BASE_OPTIONS)

		// The host set 640x480; setSize must read it, not overwrite it from the CSS box.
		asciify.setSize(1234, 5678)

		expect([stage.width, stage.height]).toEqual([640, 480])
		expect(asciify.columnCount).toBe(Math.floor(640 / 8))
		expect(asciify.rowCount).toBe(Math.floor(480 / 8))
	})
})
