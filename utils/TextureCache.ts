/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 */

import { type CanvasLike, createCanvasLike, pluck2dContext } from "./canvas.ts"
import type { LuminanceCharacterMap } from "./LuminanceCharacterMap.ts"

const whitespacePattern = /\s/
const supportsCreateImageBitmap = typeof createImageBitmap !== "undefined"

/**
 * Renders a single character into its own canvas, opaque where the glyph covers and transparent everywhere else.
 *
 * @internal
 */
function drawGlyphTexture(
	character: string,
	textureMetrics: TextureMetrics,
	fontFamily: string,
	debug: boolean
): CanvasLike {
	const canvas = createCanvasLike()

	const context = pluck2dContext(canvas, {
		alpha: true,
	})

	canvas.width = textureMetrics.width
	canvas.height = textureMetrics.height

	context.font = `${textureMetrics.renderedFontSize}px ${fontFamily}`
	context.fontKerning = "none"
	context.textBaseline = "top"

	context.clearRect(0, 0, canvas.width, canvas.height)

	if (debug) {
		// An outline makes the boundary of each character cell visible in the composited output.
		context.strokeStyle = "white"
		context.lineWidth = 1
		context.strokeRect(0.5, 0.5, canvas.width - 1, canvas.height - 1)
	}

	if (!whitespacePattern.test(character)) {
		// Some characters like emoji are in color but we want to render them in black and white.
		context.filter = "grayscale(100%)"
		context.fillStyle = "white"

		const textMetrics = context.measureText(character)
		const x = (canvas.width - textMetrics.width) / 2
		const y = (canvas.height - textureMetrics.renderedFontSize) / 2

		context.fillText(character, x, y)
		context.filter = "none"
	}

	return canvas
}

/**
 * A cache containing the pre-rendered image data of the character set, indexed by luminance.
 *
 * @remarks
 *   The texture cache lets us avoid re-rendering the character set for each frame. Since there are a fixed number of
 *   luminance values, we pre-render the character associated with each one. Textures are **deduplicated by character**.
 *   A luminance range of 256 values typically maps onto a character set of a dozen or so glyphs, so the cache holds one
 *   texture per distinct character and points every luminance that resolves to that character at the same object. Fewer
 *   distinct textures means far better texture cache locality while compositing, which measurably outweighs the
 *   bookkeeping. Each texture is opaque where the glyph covers and transparent elsewhere, so it can be used directly as
 *   a `destination-in` mask. Additionally, the cache will automatically upgrade the canvas to a more performant
 *   {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/ImageBitmap ImageBitmap} if the browser supports it.
 * @internal
 */
export class TextureCache extends Array<CanvasLike | ImageBitmap> {
	/**
	 * A promise that resolves when all of the bitmaps have been initialized.
	 */
	public initializedBitmaps: Promise<void>

	/**
	 * Per-luminance flag, set when the character for that luminance is whitespace.
	 *
	 * @remarks
	 *   Drawing a whitespace glyph contributes nothing to the mask, so the rasterizer skips those cells outright rather
	 *   than paying for a `drawImage` that renders nothing. With the default contrast ratio this elides a meaningful
	 *   slice of the luminance range, and considerably more of the cells on a dark source.
	 */
	public readonly blank: Uint8Array

	constructor(
		luminanceCharacterMap: LuminanceCharacterMap,
		textureMetrics: TextureMetrics,
		fontFamily: string,
		debug = false,
		bitmapsEnabled = supportsCreateImageBitmap
	) {
		super(luminanceCharacterMap.size)

		const blank = new Uint8Array(luminanceCharacterMap.size)
		// Which luminance slots resolve to each distinct character.
		const slotsByCharacter = new Map<string, number[]>()

		for (const [luminance, character] of luminanceCharacterMap.entries()) {
			// In debug mode every cell draws an outline, so even whitespace has something to render.
			if (!debug && whitespacePattern.test(character)) {
				blank[luminance] = 1

				continue
			}

			let slots = slotsByCharacter.get(character)

			if (!slots) {
				slots = []
				slotsByCharacter.set(character, slots)
			}

			slots.push(luminance)
		}

		const bitmapPromises: Promise<ImageBitmap>[] = []

		for (const [character, slots] of slotsByCharacter) {
			const canvas = drawGlyphTexture(character, textureMetrics, fontFamily, debug)

			for (const slot of slots) {
				this[slot] = canvas
			}

			if (bitmapsEnabled) {
				bitmapPromises.push(
					createImageBitmap(canvas, 0, 0, canvas.width, canvas.height, {
						premultiplyAlpha: "premultiply",
					}).then((imageBitmap) => {
						for (const slot of slots) {
							this[slot] = imageBitmap
						}

						return imageBitmap
					})
				)
			}
		}

		this.blank = blank
		// Collapsed to `void` so callers await readiness without holding onto every bitmap.
		this.initializedBitmaps = Promise.all(bitmapPromises).then(() => undefined)
	}
}

export interface TextureMetrics {
	byteLength: number
	lineLength: number
	renderedFontSize: number
	width: number
	height: number
}

/**
 * @internal
 */
export function calculateTextureMetrics(fontSize: number, pixelRatio: number): TextureMetrics {
	const byteLength = 4
	const renderedFontSize = fontSize * pixelRatio
	const width = renderedFontSize
	const height = renderedFontSize
	const lineLength = width * byteLength

	return {
		byteLength,
		width,
		height,
		renderedFontSize,
		lineLength,
	}
}
