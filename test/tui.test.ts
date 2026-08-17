/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 * @file Coverage for the terminal renderer: braille packing, dithering, damage diffing, and escape emission.
 */

import { describe, expect, it } from "vitest"

import { quantizeToAnsi256 } from "../tui/ansi.ts"
import { AsciifyTerminal, NO_BACKGROUND } from "../tui/AsciifyTerminal.ts"
import { BRAILLE_BLANK, brailleDotBit } from "../tui/braille.ts"
import type { AsciifyTerminalOptions, TerminalLike } from "../tui/common.ts"
import { LuminanceCharacterMap } from "../utils/LuminanceCharacterMap.ts"

/**
 * A terminal that records every write, for asserting on emitted escapes.
 */
class StringSink implements TerminalLike {
	written: string[] = []

	constructor(
		public columns?: number,
		public rows?: number
	) {}

	write(chunk: string): void {
		this.written.push(chunk)
	}

	get output(): string {
		return this.written.join("")
	}

	clear(): void {
		this.written = []
	}
}

/**
 * Builds a renderer over a recording sink with the noisy conveniences off, so assertions see bare escapes.
 */
function createHarness(columns: number, rows: number, options: Partial<AsciifyTerminalOptions> = {}) {
	const sink = new StringSink(columns, rows)
	const asciify = new AsciifyTerminal(sink, { synchronizedOutput: false, ...options })

	return { sink, asciify }
}

/**
 * An RGBA buffer sized to the renderer's source, filled per-pixel by the given function.
 */
function createSource(
	asciify: AsciifyTerminal,
	fill: (x: number, y: number) => [red: number, green: number, blue: number]
): Uint8ClampedArray {
	const { sourceWidth, sourceHeight } = asciify
	const buffer = new Uint8ClampedArray(sourceWidth * sourceHeight * 4)

	for (let y = 0; y < sourceHeight; y++) {
		for (let x = 0; x < sourceWidth; x++) {
			const [red, green, blue] = fill(x, y)
			const byteIndex = (y * sourceWidth + x) * 4

			buffer[byteIndex] = red
			buffer[byteIndex + 1] = green
			buffer[byteIndex + 2] = blue
			buffer[byteIndex + 3] = 255
		}
	}

	return buffer
}

/**
 * Every braille character in an emission, in order. Includes the dotless blank (0x2800).
 */
function brailleCharacters(emitted: string): number[] {
	return Array.from(emitted)
		.map((character) => character.codePointAt(0)!)
		.filter((codePoint) => codePoint >= 0x28_00 && codePoint <= 0x28_ff)
}

describe("AsciifyTerminal braille packing", () => {
	it("lights every dot on a white source and none on a black one", () => {
		const { sink, asciify } = createHarness(4, 3)

		asciify.rasterize(createSource(asciify, () => [255, 255, 255]))

		// 0x28FF is the full 8-dot cell.
		expect(brailleCharacters(sink.output)).toEqual(Array.from({ length: 12 }, () => 0x28_ff))

		sink.clear()
		asciify.invalidate()
		asciify.rasterize(createSource(asciify, () => [0, 0, 0]))

		expect(brailleCharacters(sink.output)).toEqual(Array.from({ length: 12 }, () => 0x28_00))
	})

	it("maps subpixel rows onto the historical dot layout", () => {
		const { sink, asciify } = createHarness(2, 1)

		// Light only the top two of the four subpixel rows.
		asciify.rasterize(createSource(asciify, (_x, y) => (y < 2 ? [255, 255, 255] : [0, 0, 0])))

		// Dots 1, 2 (left column) and 4, 5 (right column): 0x01 | 0x02 | 0x08 | 0x10.
		expect(brailleCharacters(sink.output)).toEqual([0x28_1b, 0x28_1b])
	})

	it("treats flipY as a pure vertical flip", () => {
		const { sink: flippedSink, asciify: flipped } = createHarness(2, 1)
		const { sink: uprightSink, asciify: upright } = createHarness(2, 1)

		// The bottom half of a flipped source is the top half of an upright one.
		flipped.rasterize(
			createSource(flipped, (_x, y) => (y >= 2 ? [255, 255, 255] : [0, 0, 0])),
			true
		)

		upright.rasterize(createSource(upright, (_x, y) => (y < 2 ? [255, 255, 255] : [0, 0, 0])))

		expect(brailleCharacters(flippedSink.output)).toEqual(brailleCharacters(uprightSink.output))
	})

	it("dithers midtones to roughly half coverage", () => {
		const { sink, asciify } = createHarness(16, 8)

		asciify.rasterize(createSource(asciify, () => [128, 128, 128]))

		let litDots = 0

		for (const codePoint of brailleCharacters(sink.output)) {
			for (let bits = codePoint - 0x28_00; bits; bits >>= 1) {
				litDots += bits & 1
			}
		}

		const totalDots = 16 * 8 * 8
		// An ordered dither of a flat 50% gray should light close to half the dots.
		expect(litDots / totalDots).toBeGreaterThan(0.4)
		expect(litDots / totalDots).toBeLessThan(0.6)
	})
})

describe("AsciifyTerminal damage diffing", () => {
	it("emits nothing for an unchanged frame", () => {
		const { sink, asciify } = createHarness(8, 4)
		const source = createSource(asciify, (x) => (x % 2 ? [255, 255, 255] : [0, 0, 0]))

		asciify.rasterize(source)
		expect(sink.output).not.toBe("")

		sink.clear()
		asciify.rasterize(source)

		// Zero bytes — not even a cursor move — is the entire point of the diff.
		expect(sink.output).toBe("")
	})

	it("addresses only the damaged span on a single-cell change", () => {
		const { sink, asciify } = createHarness(8, 4, { colorDepth: "none" })

		asciify.rasterize(createSource(asciify, () => [0, 0, 0]))
		sink.clear()

		// Light one cell: column 5, row 2 covers subpixels x 10-11, y 8-11.
		asciify.rasterize(
			createSource(asciify, (x, y) => (x >= 10 && x <= 11 && y >= 8 && y <= 11 ? [255, 255, 255] : [0, 0, 0]))
		)

		// One cursor move to (row 3, column 6 in the terminal's 1-indexed terms), one full cell.
		expect(sink.output).toBe("\u001B[3;6H⣿\u001B[0m")
	})

	it("repaints in full after invalidate", () => {
		const { sink, asciify } = createHarness(4, 2)
		const source = createSource(asciify, () => [255, 255, 255])

		asciify.rasterize(source)
		sink.clear()

		asciify.invalidate()
		asciify.rasterize(source)

		expect(brailleCharacters(sink.output)).toHaveLength(8)
	})
})

describe("AsciifyTerminal emission", () => {
	it("offsets every cursor address by the pane origin", () => {
		const { sink, asciify } = createHarness(4, 2, { origin: { column: 10, row: 5 } })

		asciify.rasterize(createSource(asciify, () => [255, 255, 255]))

		// 0-indexed origin (10, 5) is 1-indexed (11, 6).
		expect(sink.output.startsWith("\u001B[6;11H")).toBe(true)
		expect(sink.output).toContain("\u001B[7;11H")

		// Nothing may be addressed outside the pane: no row above 6, no column left of 11.
		const addressedRows = sink.output
			.split("\u001B[")
			.filter((piece) => piece.includes("H"))
			.map((piece) => Number.parseInt(piece, 10))
			.filter((row) => Number.isFinite(row))

		expect(Math.min(...addressedRows)).toBe(6)
	})

	it("brackets frames in synchronized output when enabled", () => {
		const { sink, asciify } = createHarness(2, 1, { synchronizedOutput: true })

		asciify.rasterize(createSource(asciify, () => [255, 255, 255]))

		expect(sink.output.startsWith("\u001B[?2026h")).toBe(true)
		expect(sink.output.endsWith("\u001B[?2026l")).toBe(true)
	})

	it("emits color escapes only when the color changes", () => {
		const { sink, asciify } = createHarness(4, 1)

		asciify.rasterize(createSource(asciify, () => [255, 0, 0]))

		// Four identical red cells: exactly one color escape.
		expect(sink.output.match(/38;2;255;0;0/g)).toHaveLength(1)
	})

	it("resets color state at the end of every non-empty frame", () => {
		const { sink, asciify } = createHarness(2, 1)

		asciify.rasterize(createSource(asciify, () => [255, 255, 255]))

		expect(sink.output.endsWith("\u001B[0m")).toBe(true)
	})
})

describe("AsciifyTerminal glyph mode", () => {
	it("maps luminance through the shared character map", () => {
		const { sink, asciify } = createHarness(4, 1, { mode: "glyph", colorDepth: "none", contrastRatio: 0 })

		asciify.rasterize(createSource(asciify, () => [255, 255, 255]))

		const expected = new LuminanceCharacterMap(asciify.options.characterSet, 0).get(255)!

		expect(sink.output).toBe(`\u001B[1;1H${expected.repeat(4)}\u001B[0m`)
	})

	it("emits spaces for luminance padded out by the contrast ratio", () => {
		const { sink, asciify } = createHarness(4, 1, { mode: "glyph", colorDepth: "none", contrastRatio: 3 })

		asciify.rasterize(createSource(asciify, () => [0, 0, 0]))

		expect(sink.output).toBe("\u001B[1;1H    \u001B[0m")
	})
})

describe("AsciifyTerminal sizing", () => {
	it("derives its grid from the output when sizes are omitted", () => {
		const { asciify } = createHarness(120, 40)

		expect(asciify.columnCount).toBe(120)
		expect(asciify.rowCount).toBe(40)
	})

	it("sizes sources at 2x4 per cell in braille mode and 1x1 in glyph mode", () => {
		const { asciify } = createHarness(80, 24)
		const target = { width: 0, height: 0 }

		asciify.applySizeTo(target)
		expect([target.width, target.height]).toEqual([160, 96])

		asciify.setOptions({ mode: "glyph" })
		asciify.applySizeTo(target)
		expect([target.width, target.height]).toEqual([80, 24])
	})

	it("prefers a renderer's setSize over direct dimension assignment", () => {
		const { asciify } = createHarness(10, 5)
		const calls: Array<[number, number, boolean | undefined]> = []

		asciify.applySizeTo({
			setSize: (width: number, height: number, updateStyle?: boolean) => {
				calls.push([width, height, updateStyle])
			},
		})

		expect(calls).toEqual([[20, 20, false]])
	})
})

describe("AsciifyTerminal cell overlay", () => {
	it("writes placed cells on flush and diffs them like any other", () => {
		const { sink, asciify } = createHarness(10, 3)

		asciify.rasterize(createSource(asciify, () => [0, 0, 0]))
		sink.clear()

		asciify.setCell(2, 1, "@", [255, 0, 0])
		asciify.flush()

		expect(sink.output).toBe("\u001B[2;3H\u001B[38;2;255;0;0m@\u001B[0m")

		// Flushing again with no further changes writes nothing.
		sink.clear()
		asciify.flush()

		expect(sink.output).toBe("")
	})

	it("clips out-of-bounds cells instead of throwing", () => {
		const { sink, asciify } = createHarness(4, 2)

		asciify.rasterize(createSource(asciify, () => [0, 0, 0]))
		sink.clear()

		asciify.setCell(-1, 0, "@")
		asciify.setCell(4, 0, "@")
		asciify.setCell(0, 2, "@")
		asciify.flush()

		expect(sink.output).toBe("")
	})
})

describe("braille geometry", () => {
	it("packs dot positions into the historical bit layout", () => {
		expect(brailleDotBit(0, 0)).toBe(0x01)
		expect(brailleDotBit(1, 0)).toBe(0x08)
		expect(brailleDotBit(0, 3)).toBe(0x40)
		expect(brailleDotBit(1, 3)).toBe(0x80)

		// The eight dot bits are disjoint, so summing them fills the cell.
		let mask = 0

		for (let subY = 0; subY < 4; subY++) {
			for (let subX = 0; subX < 2; subX++) {
				mask += brailleDotBit(subX, subY)
			}
		}

		expect(BRAILLE_BLANK + mask).toBe(0x28_ff)
	})
})

describe("quantizeToAnsi256", () => {
	it("hits the cube corners exactly", () => {
		expect(quantizeToAnsi256(0, 0, 0)).toBe(16)
		expect(quantizeToAnsi256(255, 255, 255)).toBe(231)
		expect(quantizeToAnsi256(255, 0, 0)).toBe(196)
		expect(quantizeToAnsi256(0, 255, 0)).toBe(46)
		expect(quantizeToAnsi256(0, 0, 255)).toBe(21)
	})

	it("prefers the gray ramp for near-grays between cube levels", () => {
		// 48/48/48 sits far from cube levels 0 and 95 but lands on gray index 4 exactly.
		expect(quantizeToAnsi256(48, 48, 48)).toBe(236)
	})

	it("collapses quantization-identical colors to zero damage", () => {
		const { sink, asciify } = createHarness(2, 1, { colorDepth: "ansi256" })

		asciify.rasterize(createSource(asciify, () => [100, 100, 100]))
		sink.clear()

		// 100 and 101 quantize to the same palette index, so nothing visibly changed.
		asciify.rasterize(createSource(asciify, () => [101, 101, 101]))

		expect(sink.output).toBe("")
	})
})

describe("AsciifyTerminal background", () => {
	it("produces byte-identical output to before backgrounds existed, when none are set", () => {
		// Same scene as the "addresses only the damaged span" case above, but at the default (truecolor) color
		// depth instead of "none" — the color-escape path is exactly where a stray background escape would leak in.
		const { sink, asciify } = createHarness(8, 4)

		asciify.rasterize(createSource(asciify, () => [0, 0, 0]))
		sink.clear()

		// Light one cell: column 5, row 2 covers subpixels x 10-11, y 8-11.
		asciify.rasterize(
			createSource(asciify, (x, y) => (x >= 10 && x <= 11 && y >= 8 && y <= 11 ? [255, 255, 255] : [0, 0, 0]))
		)

		expect(sink.output).toBe("\u001B[3;6H\u001B[38;2;255;255;255m⣿\u001B[0m")

		// Same scene as "emits spaces for luminance padded out by the contrast ratio", re-asserted here as a
		// background regression guard for the colorDepth: "none" path.
		const { sink: noneSink, asciify: noneAsciify } = createHarness(4, 1, {
			mode: "glyph",
			colorDepth: "none",
			contrastRatio: 3,
		})

		noneAsciify.rasterize(createSource(noneAsciify, () => [0, 0, 0]))

		expect(noneSink.output).toBe("\u001B[1;1H    \u001B[0m")
	})

	it("emits 48;2 for a background under truecolor", () => {
		const { sink, asciify } = createHarness(2, 1)

		asciify.rasterize(createSource(asciify, () => [0, 0, 0]))
		sink.clear()

		asciify.setCell(0, 0, "@", [255, 255, 255], [10, 20, 30])
		asciify.flush()

		expect(sink.output).toContain("\u001B[48;2;10;20;30m")
	})

	it("emits 48;5 for a background under ansi256", () => {
		const { sink, asciify } = createHarness(2, 1, { colorDepth: "ansi256" })

		asciify.rasterize(createSource(asciify, () => [0, 0, 0]))
		sink.clear()

		asciify.setCell(0, 0, "@", [255, 255, 255], [10, 20, 30])
		asciify.flush()

		expect(sink.output).toContain(`\u001B[48;5;${quantizeToAnsi256(10, 20, 30)}m`)
	})

	it("emits nothing for a background under colorDepth none", () => {
		const { sink, asciify } = createHarness(2, 1, { colorDepth: "none" })

		asciify.rasterize(createSource(asciify, () => [0, 0, 0]))
		sink.clear()

		asciify.setCell(0, 0, "@", [255, 255, 255], [10, 20, 30])
		asciify.flush()

		expect(sink.output).toBe("\u001B[1;1H@\u001B[0m")
	})

	it("paints the background of an inkless cell", () => {
		const { sink, asciify } = createHarness(2, 1)

		asciify.rasterize(createSource(asciify, () => [0, 0, 0]))
		sink.clear()

		// A space carries no ink, but its background must still show — that's the entire point of the feature.
		asciify.setCell(0, 0, " ", undefined, [10, 20, 30])
		asciify.flush()

		expect(sink.output).toBe("\u001B[1;1H\u001B[48;2;10;20;30m \u001B[0m")
	})

	it("repaints a cell whose only change between frames is its background", () => {
		const { sink, asciify } = createHarness(8, 1)

		for (let column = 0; column < 8; column++) {
			asciify.setCell(column, 0, "@", [10, 10, 10])
		}

		asciify.flush()
		sink.clear()

		// Same character, same foreground — only the background is new.
		asciify.setCell(3, 0, "@", [10, 10, 10], [0, 0, 255])
		asciify.flush()

		expect(sink.output).toBe("\u001B[1;4H\u001B[48;2;0;0;255m\u001B[38;2;10;10;10m@\u001B[0m")
	})

	it("emits 49 when a cell returns to the sentinel", () => {
		const { sink, asciify } = createHarness(2, 1)

		asciify.setCell(0, 0, "@", [255, 255, 255], [0, 0, 255])
		// No background argument: this cell's background was never set, so it stays at the sentinel while the
		// frame's active background tracker is mid-span at blue from the cell before it.
		asciify.setCell(1, 0, "@", [255, 255, 255])
		asciify.flush()

		expect(sink.output).toBe("\u001B[1;1H\u001B[48;2;0;0;255m\u001B[38;2;255;255;255m@\u001B[49m@\u001B[0m")
	})

	it("fillBackground paints every cell, and the sentinel clears it", () => {
		const { sink, asciify } = createHarness(3, 2)

		asciify.rasterize(createSource(asciify, () => [0, 0, 0]))
		sink.clear()

		asciify.fillBackground([50, 60, 70])
		asciify.flush()

		const backgroundEscape = "\u001B[48;2;50;60;70m"

		expect(sink.output).toContain(backgroundEscape)
		// Uniform across the whole 3x2 grid needs exactly one escape: the tracker spans every row.
		expect(sink.output.split(backgroundEscape)).toHaveLength(2)

		sink.clear()
		asciify.fillBackground(NO_BACKGROUND)
		asciify.flush()

		// The clear itself repaints (every cell's background genuinely changed)...
		expect(sink.output).not.toBe("")
		expect(sink.output).not.toContain(backgroundEscape)

		// ...and once applied, it sticks: a further flush with nothing new to say writes nothing.
		sink.clear()
		asciify.flush()

		expect(sink.output).toBe("")
	})

	it("clears via null the same way it clears via the sentinel", () => {
		const { sink, asciify } = createHarness(2, 1)

		asciify.setCell(0, 0, "@", [255, 255, 255], [1, 2, 3])
		asciify.setCell(1, 0, "@", [255, 255, 255], [1, 2, 3])
		asciify.flush()
		sink.clear()

		asciify.fillBackground(null)
		asciify.flush()

		expect(sink.output).not.toBe("")
		expect(sink.output).not.toContain("\u001B[48;2;1;2;3m")
	})

	it("keeps a background across a rasterize call, since the rasterizers do not touch it", () => {
		const { sink, asciify } = createHarness(4, 1)

		asciify.rasterize(createSource(asciify, () => [255, 255, 255]))
		sink.clear()

		asciify.fillBackground([50, 60, 70])
		asciify.flush()
		sink.clear()

		// A different pattern forces real char/color damage, with no further background call in between.
		asciify.rasterize(createSource(asciify, (x) => (x % 2 ? [0, 0, 0] : [255, 255, 255])))

		// The background from fillBackground is still in force, so it must reappear here even though nothing set
		// it again this frame — proof the rasterizer left `_cellBackgrounds` alone.
		expect(sink.output).toContain("\u001B[48;2;50;60;70m")
	})
})
