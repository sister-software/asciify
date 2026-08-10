/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 * @file Renderer selection. The point of the factory is that it never leaves a caller with nothing,
 *   so most of these tests are about what happens when the preferred path is unavailable.
 */

import { describe, expect, it, vi } from "vitest"

import { Asciify2D } from "../Asciify2D.ts"
import { AsciifyWebGL } from "../AsciifyWebGL.ts"
import { createAsciify, isWebGL2Available } from "../createAsciify.ts"
import { pluck2dContext } from "../utils/canvas.ts"
import { createStage } from "./utils.ts"

const OPTIONS = { fontSize: 8, pixelRatio: 1, fontFamily: "monospace" }

describe("isWebGL2Available", () => {
	it("reports true in a browser that supports WebGL2", () => {
		expect(isWebGL2Available()).toBe(true)
	})

	it("does not claim the caller's canvas while answering", () => {
		// The probe must run on a scratch canvas: asking a canvas for a WebGL context commits it,
		// and a committed canvas can never hand out a 2D context afterwards.
		const stage = createStage(64, 64)

		expect(isWebGL2Available()).toBe(true)
		expect(stage.getContext("2d")).not.toBeNull()
	})
})

describe("createAsciify", () => {
	it("prefers WebGL when it is available", () => {
		expect(createAsciify(createStage(300, 200), OPTIONS)).toBeInstanceOf(AsciifyWebGL)
	})

	it("honours an explicit 2d preference", () => {
		const asciify = createAsciify(createStage(300, 200), { ...OPTIONS, renderer: "2d" })

		expect(asciify).toBeInstanceOf(Asciify2D)
	})

	it("honours an explicit webgl preference", () => {
		const asciify = createAsciify(createStage(300, 200), { ...OPTIONS, renderer: "webgl" })

		expect(asciify).toBeInstanceOf(AsciifyWebGL)
	})

	it("uses the 2D renderer when handed a 2D context directly", () => {
		// The canvas is already committed, so there is nothing left to choose.
		const context = pluck2dContext(createStage(300, 200))

		expect(createAsciify(context, OPTIONS)).toBeInstanceOf(Asciify2D)
	})

	it("rejects a webgl preference paired with a 2D context", () => {
		const context = pluck2dContext(createStage(300, 200))

		expect(() => createAsciify(context, { ...OPTIONS, renderer: "webgl" })).toThrow(/cannot be used with a 2D context/)
	})

	it("falls back to the 2D renderer when WebGL2 is unavailable", () => {
		const stage = createStage(300, 200)
		// Capture the real implementation *before* spying, or delegating to it from inside the mock
		// just re-enters the mock and blows the stack.
		const original = HTMLCanvasElement.prototype.getContext

		// Stand in for a platform with no WebGL2 at all: the probe canvas and the real one both
		// refuse. Rendering nothing would be the wrong answer here.
		const spy = vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(function (
			this: HTMLCanvasElement,
			id: string,
			...rest: unknown[]
		) {
			if (id === "webgl2") return null

			return (original as (...args: unknown[]) => unknown).call(this, id, ...rest)
		} as never)

		try {
			const asciify = createAsciify(stage, OPTIONS)

			expect(asciify).toBeInstanceOf(Asciify2D)
			expect(asciify.columnCount).toBeGreaterThan(0)
		} finally {
			spy.mockRestore()
		}
	})

	it("produces a working renderer either way", () => {
		const webgl = createAsciify(createStage(300, 200), OPTIONS)
		const twoD = createAsciify(createStage(300, 200), { ...OPTIONS, renderer: "2d" })

		// Same grid arithmetic regardless of backend — the choice must be invisible to callers.
		expect([webgl.columnCount, webgl.rowCount]).toEqual([twoD.columnCount, twoD.rowCount])
		expect(webgl.getCharacterFromLuminance(255)).toBe(twoD.getCharacterFromLuminance(255))
	})
})
