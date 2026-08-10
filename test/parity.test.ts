/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 * @file The two renderers must produce identical output for identical input. This is the suite that
 *   catches drift between the Canvas2D and WebGL2 implementations.
 */

import { describe, expect, it } from "vitest"

import { Asciify2D } from "../Asciify2D.ts"
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
 * Renders one frame of the fixture through a renderer and reads the output back.
 */
function renderFrame(
	Renderer: typeof Asciify2D | typeof AsciifyWebGL,
	width: number,
	height: number,
	time: number,
	options: Partial<AsciifyOptions> = {}
): { pixels: Uint8ClampedArray; columnCount: number; rowCount: number } {
	const stage = createStage(width, height)
	const asciify = new Renderer(stage, { ...BASE_OPTIONS, ...options })
	const renderer = createTestRenderer()

	asciify.setSize(width, height, renderer)
	renderer.render(time)
	asciify.rasterizeWebGLRenderer(renderer, renderer.gl)

	return { pixels: readCanvas(stage), columnCount: asciify.columnCount, rowCount: asciify.rowCount }
}

describe("renderer parity", () => {
	// 296x200 divides evenly into 8px cells; 300x200 and 301x201 deliberately do not.
	// The uneven sizes are the regression: upscaling the colour layer across the full canvas
	// rather than the grid sheared it against the glyphs, by a whole cell at the far edge.
	describe.each([
		{ label: "grid fits the canvas exactly", width: 296, height: 200 },
		{ label: "canvas is wider than the grid", width: 300, height: 200 },
		{ label: "canvas is wider and taller than the grid", width: 301, height: 201 },
	])("$label ($width x $height)", ({ width, height }) => {
		it("produces identical pixels from both backends", () => {
			const a = renderFrame(Asciify2D, width, height, 0)
			const b = renderFrame(AsciifyWebGL, width, height, 0)

			expect(b.columnCount).toBe(a.columnCount)
			expect(b.rowCount).toBe(a.rowCount)

			const { differing, worst, total } = comparePixels(a.pixels, b.pixels)

			expect({ differing, worst }, `${differing}/${total} pixels differ, worst channel delta ${worst}`).toEqual({
				differing: 0,
				worst: 0,
			})
		})
	})

	// A moving source is where phase differences would hide. Pinning the tick removes that excuse.
	it.each([0, 250, 1000, 5000, 12_345])("agrees at a pinned animation tick (t=%i)", (time) => {
		const a = renderFrame(Asciify2D, 300, 200, time)
		const b = renderFrame(AsciifyWebGL, 300, 200, time)

		expect(comparePixels(a.pixels, b.pixels).differing).toBe(0)
	})

	it("agrees when the character spacing ratio leaves gaps between glyphs", () => {
		// With characterSpacingRatio > 1 the cell is larger than the glyph. The 2D renderer draws
		// the glyph at its natural size in the cell's top-left; the shader must not stretch it.
		const options = { characterSpacingRatio: 1.5 }
		const a = renderFrame(Asciify2D, 300, 200, 0, options)
		const b = renderFrame(AsciifyWebGL, 300, 200, 0, options)

		expect(comparePixels(a.pixels, b.pixels).differing).toBe(0)
	})

	it("agrees at a device pixel ratio above one", () => {
		const options = { pixelRatio: 2 }
		const a = renderFrame(Asciify2D, 300, 200, 0, options)
		const b = renderFrame(AsciifyWebGL, 300, 200, 0, options)

		expect(comparePixels(a.pixels, b.pixels).differing).toBe(0)
	})

	it("agrees with colorize disabled", () => {
		const options = { colorize: false }
		const a = renderFrame(Asciify2D, 300, 200, 0, options)
		const b = renderFrame(AsciifyWebGL, 300, 200, 0, options)

		expect(comparePixels(a.pixels, b.pixels).differing).toBe(0)
	})

	it("agrees on a non-default character set", () => {
		const options = { characterSet: "░▒▓█", contrastRatio: 0 }
		const a = renderFrame(Asciify2D, 300, 200, 0, options)
		const b = renderFrame(AsciifyWebGL, 300, 200, 0, options)

		expect(comparePixels(a.pixels, b.pixels).differing).toBe(0)
	})
})
