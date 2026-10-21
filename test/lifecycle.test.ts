/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 * @file WebGL context lifecycle. Browsers cap live contexts and drop the oldest past the cap, so a context that outlives
 *   its use can blank someone else's canvas, and a renderer that ignores a lost context stays blank for good.
 */

import { afterEach, describe, expect, it, vi } from "vitest"

import { AsciifyWebGL } from "../AsciifyWebGL.ts"
import { isWebGL2Available } from "../createAsciify.ts"
import { comparePixels, createStage, createTestRenderer, readCanvas } from "./utils.ts"

const OPTIONS = { fontSize: 8, pixelRatio: 1, fontFamily: "monospace" }

function nextEvent(target: EventTarget, type: string): Promise<Event> {
	return new Promise((resolve) => {
		target.addEventListener(type, resolve, { once: true })
	})
}

afterEach(() => {
	vi.restoreAllMocks()
})

describe("context lifecycle", () => {
	it("releases the probe context once it has answered", () => {
		const original = OffscreenCanvas.prototype.getContext
		const probes: WebGL2RenderingContext[] = []

		vi.spyOn(OffscreenCanvas.prototype, "getContext").mockImplementation(function (
			this: OffscreenCanvas,
			...args: unknown[]
		) {
			const context = (original as (...args: unknown[]) => unknown).apply(this, args)

			if (args[0] === "webgl2" && context) {
				probes.push(context as WebGL2RenderingContext)
			}

			return context
		} as never)

		expect(isWebGL2Available()).toBe(true)
		expect(probes).toHaveLength(1)
		expect(probes[0]!.isContextLost()).toBe(true)
	})

	it("releases its context on dispose", () => {
		const asciify = new AsciifyWebGL(createStage(120, 80), OPTIONS)

		asciify.dispose()

		expect(asciify.gl.isContextLost()).toBe(true)
	})

	it("draws the same frame after a lost context is restored", async () => {
		const stage = createStage(296, 200)
		const asciify = new AsciifyWebGL(stage, OPTIONS)
		const renderer = createTestRenderer()

		asciify.setSize(296, 200, renderer)
		renderer.render(0)
		asciify.rasterizeWebGLRenderer(renderer, renderer.gl)

		const before = readCanvas(stage)
		// The extension has to be fetched while the context is alive.
		const extension = asciify.gl.getExtension("WEBGL_lose_context")!

		const lost = nextEvent(stage, "webglcontextlost")
		extension.loseContext()
		await lost
		// Chromium ignores a restore requested in the same task the loss was reported in.
		await new Promise((resolve) => {
			setTimeout(resolve, 50)
		})

		const restored = nextEvent(stage, "webglcontextrestored")
		extension.restoreContext()
		await restored

		renderer.render(0)
		asciify.rasterizeWebGLRenderer(renderer, renderer.gl)

		const after = readCanvas(stage)

		expect(comparePixels(before, after).differing).toBe(0)
		// Not a blank frame on both sides.
		expect(before.some((value, index) => index % 4 !== 3 && value !== 0)).toBe(true)
	})
})
