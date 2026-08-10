/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 * @file `readPixels` hands back rows bottom-to-top. Getting the correction wrong is invisible on
 *   symmetric content, so these tests use deliberately asymmetric fixtures.
 */

import { describe, expect, it } from "vitest"

import type { AsciifyOptions } from "../options/common.ts"
import { BACKENDS, createStage, createTestRenderer, inkIn, readCanvas } from "./utils.ts"

const OPTIONS: Partial<AsciifyOptions> = { fontSize: 8, pixelRatio: 1, contrastRatio: 0, fontFamily: "monospace" }

const WIDTH = 240
const HEIGHT = 240

/**
 * Fills the four quadrants of the GL buffer with four distinct brightnesses. GL's scissor origin is bottom-left, so the
 * brightest quadrant lands at the bottom-left of the _screen_.
 */
function paintQuadrants(gl: WebGL2RenderingContext, columnCount: number, rowCount: number): void {
	const halfWidth = Math.floor(columnCount / 2)
	const halfHeight = Math.floor(rowCount / 2)

	gl.viewport(0, 0, columnCount, rowCount)
	gl.clearColor(0, 0, 0, 1)
	gl.clear(gl.COLOR_BUFFER_BIT)
	gl.enable(gl.SCISSOR_TEST)

	for (const [x, y, level] of [
		[0, 0, 1],
		[halfWidth, 0, 0.75],
		[0, halfHeight, 0.5],
		[halfWidth, halfHeight, 0.25],
	] as const) {
		gl.scissor(x, y, halfWidth, halfHeight)
		gl.clearColor(level, level, level, 1)
		gl.clear(gl.COLOR_BUFFER_BIT)
	}

	gl.disable(gl.SCISSOR_TEST)
}

describe.each(BACKENDS)("%s orientation", (_name, Renderer) => {
	it("maps the GL buffer bottom-up, without mirroring horizontally", () => {
		const stage = createStage(WIDTH, HEIGHT)
		const asciify = new Renderer(stage, OPTIONS)
		const renderer = createTestRenderer()

		asciify.setSize(WIDTH, HEIGHT, renderer)
		paintQuadrants(renderer.gl, asciify.columnCount, asciify.rowCount)
		asciify.rasterizeWebGLRenderer(renderer, renderer.gl)

		const pixels = readCanvas(stage)
		const { width, height } = stage
		const halfWidth = Math.floor(width / 2)
		const halfHeight = Math.floor(height / 2)

		const bottomLeft = inkIn(pixels, width, 0, halfHeight, halfWidth, halfHeight)
		const bottomRight = inkIn(pixels, width, halfWidth, halfHeight, halfWidth, halfHeight)
		const topLeft = inkIn(pixels, width, 0, 0, halfWidth, halfHeight)
		const topRight = inkIn(pixels, width, halfWidth, 0, halfWidth, halfHeight)

		// A vertical mirror alone would swap the top and bottom pairs; a horizontal mirror would
		// swap left and right. Only the correct mapping produces this exact ordering.
		expect(bottomLeft).toBeGreaterThan(bottomRight)
		expect(bottomRight).toBeGreaterThan(topLeft)
		expect(topLeft).toBeGreaterThan(topRight)
	})

	it("keeps the brightest quadrant bottom-left at a device pixel ratio above one", () => {
		const stage = createStage(WIDTH, HEIGHT)
		const asciify = new Renderer(stage, { ...OPTIONS, pixelRatio: 2 })
		const renderer = createTestRenderer()

		asciify.setSize(WIDTH, HEIGHT, renderer)
		paintQuadrants(renderer.gl, asciify.columnCount, asciify.rowCount)
		asciify.rasterizeWebGLRenderer(renderer, renderer.gl)

		const pixels = readCanvas(stage)
		const { width, height } = stage
		const halfWidth = Math.floor(width / 2)
		const halfHeight = Math.floor(height / 2)

		const quadrants = {
			bottomLeft: inkIn(pixels, width, 0, halfHeight, halfWidth, halfHeight),
			bottomRight: inkIn(pixels, width, halfWidth, halfHeight, halfWidth, halfHeight),
			topLeft: inkIn(pixels, width, 0, 0, halfWidth, halfHeight),
			topRight: inkIn(pixels, width, halfWidth, 0, halfWidth, halfHeight),
		}

		const brightest = Object.entries(quadrants).toSorted(([, a], [, b]) => b - a)[0]![0]

		expect(brightest).toBe("bottomLeft")
	})
})
