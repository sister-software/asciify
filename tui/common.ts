/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 * @fileoverview
 * Shared types and options for the terminal renderer.
 * @see {@link https://sister.software/asciify API documentation}
 * @module @sister.software/asciify
 */

import { DEFAULT_CHARACTER_SET, DEFAULT_CONTRAST_RATIO } from "../options/common.ts"

/**
 * Anything frames can be written to as a string, such as `process.stdout` or an xterm.js `Terminal`.
 *
 * @remarks
 *   Structural for the same reason as `WebGLRendererLike` on the canvas side: asciify has no dependency on Node.js, and
 *   this interface lets `process.stdout` satisfy it without `@types/node` appearing anywhere in the published types.
 * @category Terminal
 */
export interface TerminalWritableLike {
	write(chunk: string): unknown
}

/**
 * Anything that knows its own size in character cells.
 *
 * @remarks
 *   Both members are optional because not every writable knows its size — a pipe or a file has no dimensions. When
 *   absent, {@linkcode AsciifyTerminal.setSize} must be given explicit dimensions.
 * @category Terminal
 */
export interface TerminalGridLike {
	columns?: number
	rows?: number
}

/**
 * The full shape of a terminal-like output: writable, and optionally aware of its own size.
 *
 * @category Terminal
 */
export type TerminalLike = TerminalWritableLike & TerminalGridLike

/**
 * Anything with mutable pixel dimensions, such as a canvas or an `ImageData`-shaped buffer holder.
 *
 * @remarks
 *   This mirrors `SizableLike` from the canvas side without importing it, so the terminal renderer's declaration files
 *   stay free of DOM types.
 * @category Terminal
 */
export interface TerminalSizableLike {
	width: number
	height: number
}

/**
 * The subset of a WebGL renderer that {@linkcode AsciifyTerminal.applySizeTo} uses.
 *
 * @remarks
 *   A `THREE.WebGLRenderer` satisfies this structurally, with no import on either side.
 * @category Terminal
 */
export interface TerminalRendererLike {
	setSize(width: number, height: number, updateStyle?: boolean): void
}

/**
 * How source pixels become characters.
 *
 * - `braille` — each cell covers 2x4 source pixels, dithered into the Unicode braille block. Eight times the spatial
 *   resolution of a character, at the cost of tone living entirely in dot density.
 * - `glyph` — each cell covers one source pixel, mapped through the shared luminance-to-character table. The terminal
 *   equivalent of what the canvas renderers draw.
 *
 * @category Terminal
 */
export type TerminalRasterMode = "braille" | "glyph"

/**
 * How much color survives the trip to the terminal.
 *
 * - `truecolor` — 24-bit `38;2;r;g;b` escapes. Highest fidelity and the most bytes; some terminals lack support.
 * - `ansi256` — the xterm 256-color palette. Quantization also collapses similar colors into runs, which shrinks frames
 *   dramatically — the right choice over a slow SSH connection.
 * - `none` — characters only. The smallest frames by far.
 *
 * @category Terminal
 */
export type TerminalColorDepth = "truecolor" | "ansi256" | "none"

/**
 * Where the pane's top-left cell sits on the host terminal, in 0-indexed character cells.
 *
 * @category Terminal
 */
export interface TerminalPaneOrigin {
	column: number
	row: number
}

/**
 * The options used to configure terminal ASCII art.
 *
 * @remarks
 *   `characterSet` and `contrastRatio` carry the same meaning as {@linkcode AsciifyOptions} on the canvas side, and feed
 *   the same `LuminanceCharacterMap`. The rest is terminal-specific: there is no `fontSize` or `pixelRatio` here,
 *   because the terminal owns its own cell geometry.
 * @category Terminal
 * @category Configuration
 */
export interface AsciifyTerminalOptions {
	/**
	 * How source pixels become characters.
	 *
	 * @default "braille"
	 */
	mode: TerminalRasterMode

	/**
	 * The available characters, in order of "brightness". Only used by `glyph` mode.
	 *
	 * @default CharacterPresets.ascii
	 * @see {@linkcode AsciifyOptions.characterSet}
	 */
	characterSet: string | string[]

	/**
	 * Padding of the character set with empty space at the low end of the luminance range. Only used by `glyph` mode.
	 *
	 * @default 3
	 * @see {@linkcode AsciifyOptions.contrastRatio}
	 */
	contrastRatio: number

	/**
	 * How much color survives the trip to the terminal.
	 *
	 * @default "truecolor"
	 */
	colorDepth: TerminalColorDepth

	/**
	 * Whether to bracket each frame in DEC private mode 2026, which asks the emulator to present the frame atomically.
	 *
	 * @remarks
	 *   This is terminal vsync: without it, a frame arriving across several reads can be painted half-old, half-new.
	 *   Emulators that don't recognize the mode ignore it harmlessly, so the only reason to disable it is byte counting.
	 * @default true
	 */
	synchronizedOutput: boolean

	/**
	 * Where the pane's top-left cell sits on the host terminal.
	 *
	 * @remarks
	 *   Every emitted row is cursor-addressed relative to this origin, which is what lets the renderer draw into a region
	 *   it does not own — an Ink box, a status area, a split. The renderer never writes outside `origin + columnCount x
	 *   rowCount`.
	 * @default { column: 0, row: 0 }
	 */
	origin: TerminalPaneOrigin
}

/**
 * Creates a fully-populated options object from a partial one.
 *
 * @category Terminal
 * @category Configuration
 */
export function createDefaultTerminalOptions(
	partialOptions: Partial<AsciifyTerminalOptions> = {}
): AsciifyTerminalOptions {
	return {
		mode: "braille",
		characterSet: DEFAULT_CHARACTER_SET,
		contrastRatio: DEFAULT_CONTRAST_RATIO,
		colorDepth: "truecolor",
		synchronizedOutput: true,
		origin: { column: 0, row: 0 },
		...partialOptions,
	}
}
