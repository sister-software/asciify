/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 */

import { type CanvasLike, createCanvasLike, pluck2dContext } from "./canvas.ts"
import type { LuminanceCharacterMap } from "./LuminanceCharacterMap.ts"
import type { TextureMetrics } from "./TextureCache.ts"

/**
 * Every distinct character of the set packed into a single horizontal strip, plus the table that maps a luminance to
 * its slot in that strip.
 *
 * @remarks
 *   This is the GPU-side counterpart to {@linkcode TextureCache}. Where the 2D renderer stamps one texture per cell, the
 *   WebGL renderer samples this strip inside a fragment shader, so the whole character set must live in one texture.
 *   {@linkcode luminanceToSlot} is uploaded as a 256x1 texture rather than being recomputed in GLSL. That keeps the
 *   contrast-ratio padding and any future changes to {@linkcode LuminanceCharacterMap} in exactly one place — the shader
 *   just reads whatever the CPU decided.
 * @category Utility
 * @internal
 */
export class GlyphAtlas {
	/**
	 * A strip of `slotCount` glyphs, each `TextureMetrics.width` wide, opaque where the glyph covers.
	 */
	public readonly canvas: CanvasLike

	/**
	 * The number of distinct glyphs in the strip.
	 */
	public readonly slotCount: number

	/**
	 * A 256-entry table mapping a luminance value to its horizontal slot in the strip.
	 */
	public readonly luminanceToSlot: Uint8Array

	constructor(
		luminanceCharacterMap: LuminanceCharacterMap,
		textureMetrics: TextureMetrics,
		fontFamily: string,
		debug = false
	) {
		const slotByCharacter = new Map<string, number>()
		const luminanceToSlot = new Uint8Array(256)

		for (const [luminance, character] of luminanceCharacterMap.entries()) {
			let slot = slotByCharacter.get(character)

			if (slot === undefined) {
				slot = slotByCharacter.size
				slotByCharacter.set(character, slot)
			}

			luminanceToSlot[luminance] = slot
		}

		const slotCount = Math.max(slotByCharacter.size, 1)
		const { width, height, renderedFontSize } = textureMetrics

		const canvas = createCanvasLike()
		canvas.width = width * slotCount
		canvas.height = height

		const context = pluck2dContext(canvas, { alpha: true })

		context.clearRect(0, 0, canvas.width, canvas.height)
		context.font = `${renderedFontSize}px ${fontFamily}`
		context.fontKerning = "none"
		context.textBaseline = "top"

		for (const [character, slot] of slotByCharacter) {
			const originX = slot * width

			if (debug) {
				// An outline makes the boundary of each character cell visible in the output.
				context.strokeStyle = "white"
				context.lineWidth = 1
				context.strokeRect(originX + 0.5, 0.5, width - 1, height - 1)
			}

			// Some characters like emoji are in color but we want to render them in black and white.
			context.filter = "grayscale(100%)"
			context.fillStyle = "white"

			const textMetrics = context.measureText(character)

			context.fillText(character, originX + (width - textMetrics.width) / 2, (height - renderedFontSize) / 2)

			context.filter = "none"
		}

		this.canvas = canvas
		this.slotCount = slotCount
		this.luminanceToSlot = luminanceToSlot
	}
}
