/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 * @fileoverview
 * The terminal asciify renderer.
 * @see {@link https://sister.software/asciify API documentation}
 * @module @sister.software/asciify
 */

import { LuminanceCharacterMap } from "../utils/LuminanceCharacterMap.ts"
import { cursorTo, quantizeToAnsi256, SGR_RESET, SYNC_BEGIN, SYNC_END } from "./ansi.ts"
import { BRAILLE_BLANK, BRAILLE_DOT_BITS } from "./braille.ts"
import {
	type AsciifyTerminalOptions,
	createDefaultTerminalOptions,
	type TerminalLike,
	type TerminalRendererLike,
	type TerminalSizableLike,
} from "./common.ts"

/**
 * A plain space: what `glyph` mode emits for luminance the character set maps to whitespace.
 *
 * @internal
 */
const SPACE = 0x20

/**
 * Sentinel meaning "no background set" for a cell.
 *
 * @remarks
 *   A canonical color occupies bits 0-23: `truecolor` packs 8-bit RGB into 24 bits, and `ansi256` never exceeds index
 *   255, so both fit comfortably under `0x01_00_00_00`. That makes 0 a legitimate color — black — so it cannot double
 *   as "absent": a cell explicitly painted black would be indistinguishable from a cell nobody ever touched. This
 *   sentinel sits one bit above the packed range, so no canonical color can ever collide with it.
 * @category Terminal
 */
export const NO_BACKGROUND = 0x01_00_00_00 as const

/**
 * A 4x4 Bayer ordered-dither matrix, pre-scaled to luminance thresholds (0–255) and indexed by `(y & 3) * 4 + (x & 3)`.
 *
 * @remarks
 *   Braille dots are binary, so continuous-tone sources must be dithered or midtones vanish into all-or-nothing.
 *   Ordered dithering keeps the hot loop branchless — one table lookup and a compare per subpixel — and, unlike error
 *   diffusion, is stateless across frames, so animation doesn't crawl.
 * @internal
 */
const BAYER_THRESHOLDS = new Uint8Array(
	// prettier-ignore
	[
		0, 8, 2, 10,
		12, 4, 14, 6,
		3, 11, 1, 9,
		15, 7, 13, 5,
	].map((cell) => Math.round(((cell + 0.5) / 16) * 255))
)

/**
 * When extending a damage span, rewriting up to this many unchanged cells is cheaper than the ~8-byte cursor move it
 * would take to skip past them.
 *
 * @internal
 */
const MAX_UNCHANGED_GAP = 4

/**
 * Converts RGBA frame buffers into ASCII art written to a terminal.
 *
 * @remarks
 *   This is a sibling of the canvas renderers rather than a fourth `AsciifyBase` subclass: the base's sizing contract
 *   is pixel-space to its bones (`setSize` in CSS pixels x `pixelRatio`), and none of that means anything in character
 *   space. The API matches where the meaning matches — `columnCount`/`rowCount`, `setOptions`, `applySizeTo`,
 *   `rasterize(buffer, flipY)` — and diverges where it would have to lie: {@linkcode setSize} here takes columns and
 *   rows. Like the canvas renderers, the source must be sized so the rasterizer never resamples: one source pixel per
 *   character cell in `glyph` mode, 2x4 per cell in `braille` mode. {@linkcode applySizeTo} applies the right
 *   dimensions for the current mode, and {@linkcode sourceWidth}/{@linkcode sourceHeight} expose them. Frames are
 *   damage-diffed before writing: each cell's character and color are compared against the previous frame, and only
 *   changed spans are emitted, cursor-addressed into the pane. This is the frame-to-frame diff the canvas renderers
 *   deliberately dropped — there, rebuilding the mask wholesale beat per-cell bookkeeping, but a terminal's budget is
 *   bytes down a possibly-remote wire, and there the diff wins by orders of magnitude on mostly-static content.
 *   Rasterizing writes characters and foregrounds only — a background painted via {@linkcode fillBackground} or
 *   {@linkcode setCell} persists across `rasterize` calls until something changes it, so a caller can paint a uniform
 *   sky or body of water once rather than every frame.
 *
 *   ```ts
 *   const asciify = new AsciifyTerminal(process.stdout)
 *   asciify.applySizeTo(source)
 *   asciify.rasterize(rgbaBuffer)
 *   ```
 *
 * @category Main
 * @category Terminal
 * @see {@link https://sister.software/asciify API documentation}
 */
export class AsciifyTerminal {
	//#region Public Properties

	/**
	 * The terminal-like output frames are written to, such as `process.stdout`.
	 */
	public output: TerminalLike

	/**
	 * The number of columns in the ASCII art.
	 */
	public columnCount = 0

	/**
	 * The number of rows in the ASCII art.
	 */
	public rowCount = 0

	/**
	 * The options used to initialize the renderer.
	 */
	public options: AsciifyTerminalOptions = {} as AsciifyTerminalOptions

	//#endregion

	//#region Protected Properties

	protected _luminanceCodeMap!: LuminanceCharacterMap

	/**
	 * Each luminance value's character as a codepoint, for `glyph` mode.
	 *
	 * @remarks
	 *   Precomputed so the hot loop never touches strings. Characters wider than one codepoint collapse to their first —
	 *   grapheme clusters aren't supported in the terminal renderer.
	 * @internal
	 */
	protected _glyphCodePoints!: Uint32Array

	/**
	 * Flags the luminance values that map to whitespace, mirroring `TextureCache.blank` on the canvas side.
	 *
	 * @internal
	 */
	protected _blank!: Uint8Array

	/**
	 * The current frame's cells: one codepoint and one canonical color per cell, indexed by `row * columnCount + column`.
	 *
	 * @internal
	 */
	protected _cellChars = new Uint32Array(0)
	protected _cellColors = new Uint32Array(0)

	/**
	 * The current frame's background per cell, indexed the same way as {@linkcode _cellChars}. {@linkcode NO_BACKGROUND}
	 * means no background is set, so the terminal's own background shows through.
	 *
	 * @remarks
	 *   Deliberately untouched by {@linkcode _computeBrailleCells} and {@linkcode _computeGlyphCells} — rasterizing
	 *   writes characters and foregrounds only, so a background set via {@linkcode fillBackground} or {@linkcode setCell}
	 *   persists across `rasterize` calls until something changes it.
	 * @internal
	 */
	protected _cellBackgrounds = new Uint32Array(0)

	/**
	 * The previously-emitted frame, for damage diffing. A revival of the `_frameBuffer` comparison the canvas renderers
	 * once had, back where skipping unchanged cells actually pays.
	 *
	 * @internal
	 */
	protected _previousChars = new Uint32Array(0)
	protected _previousColors = new Uint32Array(0)
	protected _previousBackgrounds = new Uint32Array(0)

	/**
	 * Forces the next frame to emit every cell, changed or not. Set on construction, resize, and option changes.
	 *
	 * @internal
	 */
	protected _repaintAll = true

	//#endregion

	constructor(
		/**
		 * The terminal-like output to write frames to. `process.stdout` satisfies this structurally.
		 */
		output: TerminalLike,
		/**
		 * Options to use when rendering the ASCII art.
		 *
		 * @optional
		 */
		options: Partial<AsciifyTerminalOptions> = {}
	) {
		this.output = output

		this.setOptions(options)
		this.setSize()
	}

	//#region Public Methods

	/**
	 * The width the source must be rendered at, in pixels: one pixel per braille dot or per glyph.
	 *
	 * @see {@linkcode applySizeTo}
	 */
	public get sourceWidth(): number {
		return this.columnCount * (this.options.mode === "braille" ? 2 : 1)
	}

	/**
	 * The height the source must be rendered at, in pixels.
	 *
	 * @see {@linkcode sourceWidth}
	 */
	public get sourceHeight(): number {
		return this.rowCount * (this.options.mode === "braille" ? 4 : 1)
	}

	/**
	 * Returns the character that best matches the given brightness, as used by `glyph` mode.
	 */
	public getCharacterFromLuminance(
		/**
		 * A number between 0 and 255.
		 */
		luminance: number
	): string {
		return this._luminanceCodeMap.get(luminance)!
	}

	/**
	 * Sets the size of the ASCII art in character cells, updating the number of columns and rows.
	 *
	 * @remarks
	 *   Unlike the canvas renderers' `setSize`, the arguments here are columns and rows — the terminal owns its own cell
	 *   geometry, so pixels never enter into it. When omitted, the size is read from the output (`process.stdout` reports
	 *   `columns`/`rows`); a pipe or file reports neither, and then explicit dimensions are required. The **source** must
	 *   be resized to match afterwards, which is what {@linkcode applySizeTo} is for.
	 */
	public setSize(columns = this.output.columns ?? this.columnCount, rows = this.output.rows ?? this.rowCount): void {
		this.columnCount = Math.max(0, Math.floor(columns))
		this.rowCount = Math.max(0, Math.floor(rows))

		const cellCount = this.columnCount * this.rowCount

		this._cellChars = new Uint32Array(cellCount)
		this._cellColors = new Uint32Array(cellCount)
		this._cellBackgrounds = new Uint32Array(cellCount).fill(NO_BACKGROUND)
		this._previousChars = new Uint32Array(cellCount)
		this._previousColors = new Uint32Array(cellCount)
		this._previousBackgrounds = new Uint32Array(cellCount).fill(NO_BACKGROUND)

		this._repaintAll = true
	}

	/**
	 * Resizes a given image source to fit the ASCII art grid.
	 *
	 * @remarks
	 *   The multiplier depends on the current mode, so call this again after switching between `braille` and `glyph`.
	 * @see {@linkcode AsciifyBase.applySizeTo}
	 */
	public applySizeTo(imageSource: TerminalSizableLike | TerminalRendererLike): void {
		if ("setSize" in imageSource) {
			imageSource.setSize(this.sourceWidth, this.sourceHeight, false)
		} else {
			imageSource.width = this.sourceWidth
			imageSource.height = this.sourceHeight
		}
	}

	/**
	 * Sets new options for the ASCII art. Useful for changing the renderer on the fly.
	 *
	 * @remarks
	 *   The character grid is unaffected — cells belong to the terminal — but switching modes changes
	 *   {@linkcode sourceWidth}/{@linkcode sourceHeight}, so re-apply {@linkcode applySizeTo} to the source afterwards.
	 */
	public setOptions(nextOptions: Partial<AsciifyTerminalOptions> = {}): void {
		this.options = createDefaultTerminalOptions({ ...this.options, ...nextOptions })

		const { characterSet, contrastRatio } = this.options

		this._luminanceCodeMap = new LuminanceCharacterMap(characterSet, contrastRatio)

		this._glyphCodePoints = new Uint32Array(256)
		this._blank = new Uint8Array(256)

		for (let luminance = 0; luminance < 256; luminance++) {
			// The map is constructed with an entry for every luminance value, so the lookup cannot miss.
			const character = this._luminanceCodeMap.get(luminance)!

			// Characters are never empty strings, so a first codepoint always exists.
			this._glyphCodePoints[luminance] = character.codePointAt(0)!
			this._blank[luminance] = character.trim() === "" ? 1 : 0
		}

		this._repaintAll = true
	}

	/**
	 * Renders a given RGBA buffer to the terminal.
	 *
	 * @remarks
	 *   The buffer must be {@linkcode sourceWidth} x {@linkcode sourceHeight} pixels. `flipY` reads source rows bottom-up,
	 *   which is what `readPixels` hands back — the same contract as the canvas renderers.
	 * @category Rasterization
	 */
	public rasterize(nextFrameBuffer: Uint8ClampedArray | Uint8Array, flipY = false): void {
		if (this.options.mode === "braille") {
			this._computeBrailleCells(nextFrameBuffer, flipY)
		} else {
			this._computeGlyphCells(nextFrameBuffer, flipY)
		}

		this.flush()
	}

	/**
	 * Places a single character directly into the current frame, bypassing rasterization.
	 *
	 * @remarks
	 *   This is the overlay path — labels, cursors, UI — for callers producing cells rather than pixels, à la mapscii's
	 *   `setChar`. The cell participates in damage diffing like any other, but note the next {@linkcode rasterize} call
	 *   recomputes every cell from the source, so overlays must be re-placed after each frame (between `rasterize` and
	 *   {@linkcode flush} in a subclass, or by calling this after `rasterize` and accepting one frame of overdraw —
	 *   `rasterize` flushes internally). Out-of-bounds coordinates are ignored rather than thrown: clipping is the
	 *   correct behavior for geometry that wanders off-pane.
	 * @category Rasterization
	 */
	public setCell(
		column: number,
		row: number,
		/**
		 * A single character, or a codepoint. Multi-codepoint grapheme clusters collapse to their first codepoint.
		 */
		character: string | number,
		/**
		 * RGB channels, 0–255 each. Omitted means white.
		 *
		 * @optional
		 */
		color?: readonly [red: number, green: number, blue: number],
		/**
		 * RGB channels, 0–255 each, for the cell's background. Omitted leaves the cell's existing background untouched —
		 * the same choice the rasterizers make — so a background set once via this parameter or {@linkcode fillBackground}
		 * survives further overlay calls.
		 *
		 * @optional
		 */
		background?: readonly [red: number, green: number, blue: number]
	): void {
		if (column < 0 || column >= this.columnCount || row < 0 || row >= this.rowCount) return

		const cellIndex = row * this.columnCount + column
		const codePoint = typeof character === "number" ? character : (character.codePointAt(0) ?? SPACE)

		this._cellChars[cellIndex] = codePoint

		const [red, green, blue] = color ?? [255, 255, 255]

		// Inkless cells are normalized just as the rasterizers do, so overlays don't fake damage. Background is not
		// normalized the same way: an inkless cell is exactly where a background is visible, so it must be honored.
		this._cellColors[cellIndex] =
			codePoint === SPACE || codePoint === BRAILLE_BLANK ? 0 : this._canonicalColor(red, green, blue)

		if (background) {
			this._cellBackgrounds[cellIndex] = this._canonicalColor(background[0], background[1], background[2])
		}
	}

	/**
	 * Sets a single cell's background without touching its character or foreground.
	 *
	 * @remarks
	 *   Unlike {@linkcode setCell}, which writes a character, this cannot destroy the glyphs already composited into a
	 *   frame — it is the per-cell primitive that fills that gap, and {@linkcode fillBackground}'s whole-grid counterpart.
	 *   A caller painting a sky above a waterline and a body of water below it composes both regions from this.
	 *   Out-of-bounds coordinates are ignored rather than thrown, the same clipping behavior as `setCell`.
	 * @category Rasterization
	 */
	public setCellBackground(
		column: number,
		row: number,
		/**
		 * RGB channels, 0–255 each. Pass {@linkcode NO_BACKGROUND} or `null` to clear this cell back to the terminal's own
		 * background.
		 */
		background: readonly [red: number, green: number, blue: number] | typeof NO_BACKGROUND | null
	): void {
		if (column < 0 || column >= this.columnCount || row < 0 || row >= this.rowCount) return

		this._cellBackgrounds[row * this.columnCount + column] = this._canonicalBackground(background)
	}

	/**
	 * Sets every cell's background in one call.
	 *
	 * @remarks
	 *   The common case: a caller painting a uniform sky or body of water per frame, without visiting every cell
	 *   individually through {@linkcode setCellBackground}. Canonicalized through the same {@linkcode _canonicalColor}
	 *   path as every other color, so `ansi256` quantization applies here too.
	 * @category Rasterization
	 */
	public fillBackground(
		/**
		 * RGB channels, 0–255 each. Pass {@linkcode NO_BACKGROUND} or `null` to clear every cell back to the terminal's own
		 * background.
		 */
		background: readonly [red: number, green: number, blue: number] | typeof NO_BACKGROUND | null
	): void {
		this._cellBackgrounds.fill(this._canonicalBackground(background))
	}

	/**
	 * Diffs the current frame against what was last written and writes the damage to the output.
	 *
	 * @remarks
	 *   {@linkcode rasterize} Calls this automatically; call it directly after mutating cells via {@linkcode setCell}. An
	 *   unchanged frame writes nothing at all.
	 * @category Rasterization
	 */
	public flush(): void {
		const payload = this._emitDamage()

		if (payload) {
			this.output.write(payload)
		}
	}

	/**
	 * Clears the pane, writing spaces over every cell.
	 */
	public clear(): void {
		if (!this.columnCount || !this.rowCount) return

		const { origin, synchronizedOutput } = this.options
		const blankRow = " ".repeat(this.columnCount)
		const pieces: string[] = [SGR_RESET]

		for (let rowIndex = 0; rowIndex < this.rowCount; rowIndex++) {
			pieces.push(cursorTo(origin.column, origin.row + rowIndex), blankRow)
		}

		let payload = pieces.join("")

		if (synchronizedOutput) {
			payload = SYNC_BEGIN + payload + SYNC_END
		}

		this.output.write(payload)

		// The pane now holds spaces on the terminal's own background, so the next frame diffs against exactly that.
		this._cellChars.fill(SPACE)
		this._cellColors.fill(0)
		this._cellBackgrounds.fill(NO_BACKGROUND)
		this._previousChars.fill(SPACE)
		this._previousColors.fill(0)
		this._previousBackgrounds.fill(NO_BACKGROUND)
		this._repaintAll = false
	}

	/**
	 * Marks the whole pane as damaged, forcing the next frame to emit every cell.
	 *
	 * @remarks
	 *   Use this when something else has drawn over the pane — the diff can only trust its own record of what's on
	 *   screen.
	 */
	public invalidate(): void {
		this._repaintAll = true
	}

	//#endregion

	//#region Protected Methods

	/**
	 * Fills the cell buffers from the source in `braille` mode: 2x4 source pixels per cell, dithered into a dot mask.
	 *
	 * @internal
	 */
	protected _computeBrailleCells(frame: Uint8ClampedArray | Uint8Array, flipY: boolean): void {
		const { columnCount, rowCount } = this
		const colorize = this.options.colorDepth !== "none"
		const sourceWidth = columnCount * 2
		const sourceHeight = rowCount * 4

		let cellIndex = 0

		for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
			for (let columnIndex = 0; columnIndex < columnCount; columnIndex++, cellIndex++) {
				let dotMask = 0
				let litCount = 0
				let redSum = 0
				let greenSum = 0
				let blueSum = 0

				for (let subY = 0; subY < 4; subY++) {
					const screenY = rowIndex * 4 + subY
					// Screen rows always run top-to-bottom; only the row we read from the buffer flips.
					const sourceY = flipY ? sourceHeight - 1 - screenY : screenY

					let byteIndex = (sourceY * sourceWidth + columnIndex * 2) * 4

					for (let subX = 0; subX < 2; subX++, byteIndex += 4) {
						// The buffer is sized to the subpixel grid by contract, so these reads cannot miss.
						const red = frame[byteIndex]!
						const green = frame[byteIndex + 1]!
						const blue = frame[byteIndex + 2]!

						// Approximate of luminance, identical to Asciify2D's. See https://en.wikipedia.org/wiki/Relative_luminance
						const luminance = (red + red + red + blue + green + green + green + green) >> 3

						// The threshold is indexed by *screen* position so the dither pattern stays put under flipY.
						if (luminance > BAYER_THRESHOLDS[(screenY & 3) * 4 + ((columnIndex * 2 + subX) & 3)]!) {
							// Each dot owns a distinct bit, so summing is equivalent to OR-ing them in.
							dotMask += BRAILLE_DOT_BITS[subY * 2 + subX]!

							litCount++
							redSum += red
							greenSum += green
							blueSum += blue
						}
					}
				}

				this._cellChars[cellIndex] = BRAILLE_BLANK + dotMask

				// The cell's color is the average of its *lit* dots — averaging all eight would pull every
				// edge toward the background. A dotless cell renders no ink, so its color is normalized to
				// zero rather than left to whatever the dark pixels averaged, which would show up as
				// spurious damage in the diff.
				this._cellColors[cellIndex] =
					dotMask && colorize
						? this._canonicalColor(
								Math.round(redSum / litCount),
								Math.round(greenSum / litCount),
								Math.round(blueSum / litCount)
							)
						: 0
			}
		}
	}

	/**
	 * Fills the cell buffers from the source in `glyph` mode: one source pixel per cell, mapped through the shared
	 * luminance-to-character table.
	 *
	 * @internal
	 */
	protected _computeGlyphCells(frame: Uint8ClampedArray | Uint8Array, flipY: boolean): void {
		const { columnCount, rowCount } = this
		const colorize = this.options.colorDepth !== "none"

		let cellIndex = 0

		for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
			const sourceRow = flipY ? rowCount - 1 - rowIndex : rowIndex

			let byteIndex = sourceRow * columnCount * 4

			for (let columnIndex = 0; columnIndex < columnCount; columnIndex++, byteIndex += 4, cellIndex++) {
				// The buffer is sized to the grid by contract, so these reads cannot miss.
				const red = frame[byteIndex]!
				const green = frame[byteIndex + 1]!
				const blue = frame[byteIndex + 2]!

				// Approximate of luminance, identical to Asciify2D's. See https://en.wikipedia.org/wiki/Relative_luminance
				const luminance = (red + red + red + blue + green + green + green + green) >> 3

				// Whitespace renders no ink, so its color is normalized for the diff — same as blank braille cells.
				if (this._blank[luminance]) {
					this._cellChars[cellIndex] = SPACE
					this._cellColors[cellIndex] = 0
				} else {
					// Both tables cover all 256 luminance values by construction.
					this._cellChars[cellIndex] = this._glyphCodePoints[luminance]!
					this._cellColors[cellIndex] = colorize ? this._canonicalColor(red, green, blue) : 0
				}
			}
		}
	}

	/**
	 * Canonicalizes a background input, folding the sentinel and `null` to {@linkcode NO_BACKGROUND} and everything else
	 * through {@linkcode _canonicalColor}. Shared by {@linkcode setCellBackground} and {@linkcode fillBackground} so
	 * "what counts as clearing" is decided in exactly one place.
	 *
	 * @internal
	 */
	protected _canonicalBackground(
		background: readonly [red: number, green: number, blue: number] | typeof NO_BACKGROUND | null
	): number {
		return background === null || background === NO_BACKGROUND
			? NO_BACKGROUND
			: this._canonicalColor(background[0], background[1], background[2])
	}

	/**
	 * Reduces RGB channels to one comparable number at the current color depth.
	 *
	 * @remarks
	 *   Canonicalizing _before_ the diff matters at `ansi256` depth: two colors that quantize to the same palette index
	 *   are the same color on screen, and treating them as different would emit damage for invisible changes.
	 * @internal
	 */
	protected _canonicalColor(red: number, green: number, blue: number): number {
		switch (this.options.colorDepth) {
			case "truecolor":
				return (red << 16) | (green << 8) | blue
			case "ansi256":
				return quantizeToAnsi256(red, green, blue)
			case "none":
				return 0
		}
	}

	/**
	 * Builds the escape that selects a canonical color as the foreground.
	 *
	 * @internal
	 */
	protected _colorEscape(canonicalColor: number): string {
		switch (this.options.colorDepth) {
			case "truecolor":
				return `\u001B[38;2;${(canonicalColor >> 16) & 0xff};${(canonicalColor >> 8) & 0xff};${canonicalColor & 0xff}m`
			case "ansi256":
				return `\u001B[38;5;${canonicalColor}m`
			case "none":
				return ""
		}
	}

	/**
	 * Builds the escape that selects a canonical color as the background, mirroring {@linkcode _colorEscape}.
	 *
	 * @remarks
	 *   Passing {@linkcode NO_BACKGROUND} emits `49` — SGR's own "default background" — so a region can hand control back
	 *   to the terminal's own background mid-frame, the same way {@linkcode SGR_RESET} does for a whole frame.
	 * @internal
	 */
	protected _backgroundEscape(canonicalBackground: number): string {
		switch (this.options.colorDepth) {
			case "truecolor":
				return canonicalBackground === NO_BACKGROUND
					? "\u001B[49m"
					: `\u001B[48;2;${(canonicalBackground >> 16) & 0xff};${(canonicalBackground >> 8) & 0xff};${canonicalBackground & 0xff}m`
			case "ansi256":
				return canonicalBackground === NO_BACKGROUND ? "\u001B[49m" : `\u001B[48;5;${canonicalBackground}m`
			case "none":
				return ""
		}
	}

	/**
	 * Diffs the current cells against the previously-emitted frame and builds the escape payload for what changed.
	 *
	 * @remarks
	 *   Changed cells are grouped into cursor-addressed spans per row, tolerating small unchanged gaps (rewriting a few
	 *   cells is cheaper than the cursor move to skip them — mapscii applies the same reasoning to color escapes). Color
	 *   escapes are emitted only when the color actually changes between emitted cells, and inkless cells (spaces, blank
	 *   braille) never touch color state at all. Background escapes follow the same change-only rule but, unlike
	 *   foreground, are emitted for inkless cells too — a background is exactly what makes an inkless cell visible.
	 *   Returns an empty string when nothing changed, in which case nothing should be written — the wire cost of an
	 *   unchanged frame is zero bytes.
	 * @internal
	 */
	protected _emitDamage(): string {
		const { columnCount, rowCount } = this

		if (!columnCount || !rowCount) return ""

		const { origin, synchronizedOutput, colorDepth } = this.options
		const chars = this._cellChars
		const colors = this._cellColors
		const backgrounds = this._cellBackgrounds
		const previousChars = this._previousChars
		const previousColors = this._previousColors
		const previousBackgrounds = this._previousBackgrounds
		const repaintAll = this._repaintAll

		const pieces: string[] = []

		// The terminal's color state persists across cursor moves, so one tracker spans the whole frame.
		// -1 is a sentinel no canonical color can take, forcing the first colored cell to emit an escape.
		let activeColor = -1
		// Each payload ends in SGR_RESET, so the terminal genuinely is at its default background when a frame
		// begins — starting here at the sentinel, rather than a value no background can take, means a consumer who
		// never sets a background gets byte-identical output to before backgrounds existed.
		let activeBackground: number = NO_BACKGROUND

		for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
			const rowOffset = rowIndex * columnCount

			let columnIndex = 0

			while (columnIndex < columnCount) {
				// Seek the next damaged cell. A full repaint treats every cell as damaged, so there is nothing to seek past.
				if (!repaintAll) {
					while (
						columnIndex < columnCount &&
						chars[rowOffset + columnIndex] === previousChars[rowOffset + columnIndex] &&
						colors[rowOffset + columnIndex] === previousColors[rowOffset + columnIndex] &&
						backgrounds[rowOffset + columnIndex] === previousBackgrounds[rowOffset + columnIndex]
					) {
						columnIndex++
					}
				}

				if (columnIndex === columnCount) break

				// Extend the span, tolerating unchanged gaps up to the cost of a cursor move.
				const spanStart = columnIndex
				let lastDamaged = columnIndex

				for (let scan = columnIndex + 1; scan < columnCount && scan - lastDamaged <= MAX_UNCHANGED_GAP; scan++) {
					if (
						repaintAll ||
						chars[rowOffset + scan] !== previousChars[rowOffset + scan] ||
						colors[rowOffset + scan] !== previousColors[rowOffset + scan] ||
						backgrounds[rowOffset + scan] !== previousBackgrounds[rowOffset + scan]
					) {
						lastDamaged = scan
					}
				}

				pieces.push(cursorTo(origin.column + spanStart, origin.row + rowIndex))

				for (let emitIndex = spanStart; emitIndex <= lastDamaged; emitIndex++) {
					// Span bounds stay within the row by construction, so these reads cannot miss.
					const char = chars[rowOffset + emitIndex]!
					const color = colors[rowOffset + emitIndex]!
					const background = backgrounds[rowOffset + emitIndex]!

					// Inkless cells render nothing, so they must not disturb color state.
					const inkless = char === SPACE || char === BRAILLE_BLANK

					// Unlike foreground, background is emitted regardless of inkiness: an inkless cell is exactly
					// where a background is visible, so it must not be skipped the way ink-only color is.
					if (colorDepth !== "none" && background !== activeBackground) {
						pieces.push(this._backgroundEscape(background))
						activeBackground = background
					}

					if (!inkless && colorDepth !== "none" && color !== activeColor) {
						pieces.push(this._colorEscape(color))
						activeColor = color
					}

					pieces.push(String.fromCodePoint(char))
				}

				columnIndex = lastDamaged + 1
			}
		}

		this._previousChars.set(chars)
		this._previousColors.set(colors)
		this._previousBackgrounds.set(backgrounds)
		this._repaintAll = false

		if (!pieces.length) return ""

		// The trailing reset keeps our color from leaking into whatever the host prints next.
		let payload = pieces.join("") + SGR_RESET

		if (synchronizedOutput) {
			payload = SYNC_BEGIN + payload + SYNC_END
		}

		return payload
	}

	//#endregion
}
