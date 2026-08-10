/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 * @file Unit coverage for the pieces the renderers precompute.
 */

import { describe, expect, it } from "vitest"

import { GlyphAtlas } from "../utils/GlyphAtlas.ts"
import { LookupTable } from "../utils/LookupTable.ts"
import { LuminanceCharacterMap } from "../utils/LuminanceCharacterMap.ts"
import { calculateTextureMetrics, TextureCache } from "../utils/TextureCache.ts"

const CHARACTER_SET = `..,'":;-~=+*#&%@`

// Note the leading `.` appears twice, so the set is 16 characters but only 15 distinct glyphs.
// Deriving this rather than hardcoding it is the point: dedup is by character, not by position.
const DISTINCT_CHARACTERS = new Set(Array.from(CHARACTER_SET)).size

describe("LookupTable", () => {
	it("places cells on an exact grid", () => {
		const table = new LookupTable(3, 4, 10, 1)

		expect(table.cellCount).toBe(12)
		// Row-major: index = row * columnCount + column.
		expect([table.xs[0], table.ys[0]]).toEqual([0, 0])
		expect([table.xs[3], table.ys[3]]).toEqual([30, 0])
		expect([table.xs[4], table.ys[4]]).toEqual([0, 10])
		expect([table.xs[11], table.ys[11]]).toEqual([30, 20])
	})

	it("scales the step by the device pixel ratio", () => {
		const table = new LookupTable(2, 2, 10, 2)

		expect([table.xs[3], table.ys[3]]).toEqual([20, 20])
	})
})

describe("LuminanceCharacterMap", () => {
	it("covers the whole 0-255 luminance range", () => {
		const map = new LuminanceCharacterMap(CHARACTER_SET, 0)

		expect(map.size).toBe(256)
		expect(map.get(0)).toBeDefined()
		expect(map.get(255)).toBeDefined()
	})

	it("pads the dark end with whitespace in proportion to the contrast ratio", () => {
		const withoutPadding = new LuminanceCharacterMap(CHARACTER_SET, 0)
		const withPadding = new LuminanceCharacterMap(CHARACTER_SET, 3)

		const blankCount = (map: LuminanceCharacterMap) =>
			Array.from({ length: 256 }, (_, luminance) => map.get(luminance)!).filter((character) => /\s/.test(character))
				.length

		expect(blankCount(withoutPadding)).toBe(0)
		expect(blankCount(withPadding)).toBeGreaterThan(0)
		// Three spaces prepended to a 16 character set means roughly 3/19 of the range.
		expect(blankCount(withPadding)).toBeCloseTo((3 / 19) * 256, -1)
	})

	it("assigns the brightest character to the top of the range", () => {
		const map = new LuminanceCharacterMap(CHARACTER_SET, 0)

		expect(map.get(255)).toBe("@")
	})
})

describe("TextureCache", () => {
	const metrics = calculateTextureMetrics(8, 1)

	it("deduplicates textures by character rather than by luminance", () => {
		const map = new LuminanceCharacterMap(CHARACTER_SET, 0)
		const cache = new TextureCache(map, metrics, "monospace", false, false)

		const distinctCharacters = new Set(Array.from({ length: 256 }, (_, i) => map.get(i)!)).size
		const distinctTextures = new Set(Array.from({ length: 256 }, (_, i) => cache[i]).filter(Boolean)).size

		expect(distinctCharacters).toBe(DISTINCT_CHARACTERS)
		// One texture per character, not one per luminance value.
		expect(distinctTextures).toBe(distinctCharacters)
	})

	it("flags whitespace slots so the rasterizer can skip them", () => {
		const map = new LuminanceCharacterMap(CHARACTER_SET, 3)
		const cache = new TextureCache(map, metrics, "monospace", false, false)

		for (let luminance = 0; luminance < 256; luminance++) {
			const isWhitespace = /\s/.test(map.get(luminance)!)
			expect(Boolean(cache.blank[luminance]), `luminance ${luminance}`).toBe(isWhitespace)
		}
	})
})

describe("GlyphAtlas", () => {
	const metrics = calculateTextureMetrics(8, 1)

	it("packs one slot per distinct character", () => {
		const map = new LuminanceCharacterMap(CHARACTER_SET, 0)
		const atlas = new GlyphAtlas(map, metrics, "monospace")

		expect(atlas.slotCount).toBe(DISTINCT_CHARACTERS)
		expect(atlas.canvas.width).toBe(metrics.width * DISTINCT_CHARACTERS)
		expect(atlas.canvas.height).toBe(metrics.height)
	})

	it("maps every luminance onto a slot that exists", () => {
		const map = new LuminanceCharacterMap(CHARACTER_SET, 3)
		const atlas = new GlyphAtlas(map, metrics, "monospace")

		expect(atlas.luminanceToSlot).toHaveLength(256)

		for (let luminance = 0; luminance < 256; luminance++) {
			expect(atlas.luminanceToSlot[luminance]!).toBeLessThan(atlas.slotCount)
		}
	})

	it("gives the same character the same slot at every luminance", () => {
		const map = new LuminanceCharacterMap(CHARACTER_SET, 3)
		const atlas = new GlyphAtlas(map, metrics, "monospace")
		const slotByCharacter = new Map<string, number>()

		for (let luminance = 0; luminance < 256; luminance++) {
			const character = map.get(luminance)!
			const slot = atlas.luminanceToSlot[luminance]!
			const seen = slotByCharacter.get(character)

			if (seen === undefined) {
				slotByCharacter.set(character, slot)
			} else {
				expect(slot, `character ${JSON.stringify(character)}`).toBe(seen)
			}
		}
	})
})
