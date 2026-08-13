/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 * @fileoverview
 * ANSI escape sequences and color quantization for the terminal renderer.
 * @see {@link https://sister.software/asciify API documentation}
 * @module @sister.software/asciify
 */

/**
 * Resets all select-graphic-rendition state — color, weight, everything.
 *
 * @category Terminal
 */
export const SGR_RESET = "\u001B[0m"

/**
 * Begins a synchronized update (DEC private mode 2026).
 *
 * @remarks
 *   Everything written between this and {@linkcode SYNC_END} is presented as one atomic frame by emulators that support
 *   the mode, and ignored harmlessly by those that don't.
 * @category Terminal
 * @see {@link https://gist.github.com/christianparpart/d8a62cc1ab659194337d73e399004036 Synchronized output spec}
 */
export const SYNC_BEGIN = "\u001B[?2026h"

/**
 * Ends a synchronized update.
 *
 * @category Terminal
 * @see {@linkcode SYNC_BEGIN}
 */
export const SYNC_END = "\u001B[?2026l"

/**
 * Moves the cursor to the given cell.
 *
 * @remarks
 *   Takes 0-indexed coordinates and emits the 1-indexed form the terminal expects, so off-by-one stays in exactly one
 *   place.
 * @category Terminal
 */
export function cursorTo(column: number, row: number): string {
	return `\u001B[${row + 1};${column + 1}H`
}

/**
 * The xterm 256-color cube's six channel levels.
 *
 * @remarks
 *   Colors 16–231 form a 6x6x6 cube with these levels per channel; colors 232–255 are a 24-step gray ramp from 8 to
 *   238. Both are candidates during quantization, because near-gray colors round-trip far better through the ramp than
 *   through the cube.
 * @internal
 */
const CUBE_LEVELS = [0, 95, 135, 175, 215, 255] as const

/**
 * Returns the nearest cube index (0–5) for a channel value.
 *
 * @internal
 */
function cubeIndex(channel: number): number {
	// The cube's levels are irregular — 0 then 95, 135, … 255 — so the thresholds are midpoints, not a division.
	if (channel < 48) return 0

	if (channel < 115) return 1

	return Math.min(5, Math.floor((channel - 35) / 40))
}

/**
 * Quantizes 8-bit RGB channels to the nearest xterm 256-color index.
 *
 * @remarks
 *   Both the 6x6x6 color cube and the grayscale ramp are considered, and whichever lands closer in squared RGB distance
 *   wins. Beyond fitting old terminals, quantization is a bandwidth knob: collapsing similar colors means longer runs
 *   of cells sharing one escape, which is most of a frame's byte count over SSH.
 * @category Terminal
 */
export function quantizeToAnsi256(red: number, green: number, blue: number): number {
	const redIndex = cubeIndex(red)
	const greenIndex = cubeIndex(green)
	const blueIndex = cubeIndex(blue)

	// Construction guarantees the cube indices are 0–5, so the lookups cannot miss.
	const cubeRed = CUBE_LEVELS[redIndex]!
	const cubeGreen = CUBE_LEVELS[greenIndex]!
	const cubeBlue = CUBE_LEVELS[blueIndex]!

	const cubeDistance = (cubeRed - red) ** 2 + (cubeGreen - green) ** 2 + (cubeBlue - blue) ** 2

	// The gray candidate is anchored to the average, clamped to the ramp's 24 steps.
	const gray = Math.round((red + green + blue) / 3)
	const grayIndex = Math.min(23, Math.max(0, Math.round((gray - 8) / 10)))
	const grayLevel = 8 + grayIndex * 10

	const grayDistance = (grayLevel - red) ** 2 + (grayLevel - green) ** 2 + (grayLevel - blue) ** 2

	if (grayDistance < cubeDistance) {
		return 232 + grayIndex
	}

	return 16 + redIndex * 36 + greenIndex * 6 + blueIndex
}
