/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 * @fileoverview
 * The Unicode braille block's dot geometry, shared by the terminal renderer and anything drawing braille directly.
 * @see {@link https://sister.software/asciify API documentation}
 * @module @sister.software/asciify
 */

/**
 * A braille cell is a 2x4 grid of dots, and the Unicode block is arranged so a cell's codepoint is
 * {@linkcode BRAILLE_BLANK} plus its dot bitmask. This table gives the bit for each dot, indexed by `subY * 2 + subX`.
 *
 * @remarks
 *   The layout is historical rather than row-major — dots 1–6 fill the top three rows column-by-column, then dots 7–8
 *   were appended as a fourth row — which is why the bottom row's bits (0x40, 0x80) don't follow the pattern above
 *   them. Keeping the table here means no other code needs to know that story. Inherited from mapscii's
 *   `BrailleBuffer`, which inherited it from node-drawille.
 * @category Terminal
 */
// prettier-ignore
export const BRAILLE_DOT_BITS = new Uint8Array([
	0x01, 0x08,
	0x02, 0x10,
	0x04, 0x20,
	0x40, 0x80,
])

/**
 * The first codepoint of the Unicode braille block: a cell with no dots raised.
 *
 * @category Terminal
 */
export const BRAILLE_BLANK = 0x28_00

/**
 * Returns the bit for the dot at the given position within a braille cell.
 *
 * @remarks
 *   `subX` is 0–1, `subY` is 0–3. OR the results together and add {@linkcode BRAILLE_BLANK} to obtain a codepoint —
 *   which is all a braille rasterizer is:
 *
 *   ```ts
 *   let mask = 0
 *   mask |= brailleDotBit(0, 0)
 *   const character = String.fromCodePoint(BRAILLE_BLANK + mask)
 *   ```
 *
 * @category Terminal
 */
export function brailleDotBit(subX: number, subY: number): number {
	// The table covers the full 2x4 cell, so in-range coordinates cannot miss.
	return BRAILLE_DOT_BITS[(subY & 3) * 2 + (subX & 1)]!
}
