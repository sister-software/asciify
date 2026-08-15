/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 * @fileoverview
 * Shared terminal session plumbing for the TUI demos: alternate screen, cursor, input, arguments, and cleanup.
 */

// oxlint-disable no-restricted-imports

import { parseArgs } from "node:util"

export type ColorTuple = [r: number, g: number, b: number]

export interface DemoArguments {
	size?: { columns: number; rows: number } | null
	columns?: number
	rows?: number
	time?: number | null
}

export interface TerminalSessionOptions {
	onKey?: (input: string) => void
	onResize?: () => void
}

/**
 * Prepares the terminal for an animation and restores it on the way out.
 *
 * Quitting deserves a note: a `SIGINT` handler alone is not enough. When the hosting process already holds the terminal
 * in raw mode — tmux panes, IDE terminals, agent harnesses — Ctrl-C never becomes a signal; it arrives as a plain
 * `0x03` byte on stdin. So the demos take stdin in raw mode themselves and treat `0x03` and `q` as quit, with the
 * signal handlers kept as a fallback for plainer environments.
 */
export function createTerminalSession({ onKey, onResize }: TerminalSessionOptions = {}) {
	// The alternate screen keeps the animation out of the scrollback, and the cursor is hidden while frames paint.
	process.stdout.write("\u001B[?1049h\u001B[?25l")

	const restoreTerminal = () => {
		process.stdout.write("\u001B[0m\u001B[?25h\u001B[?1049l")
	}

	process.on("exit", restoreTerminal)
	process.on("SIGINT", () => process.exit(0))
	process.on("SIGTERM", () => process.exit(0))

	if (process.stdin.isTTY) {
		process.stdin.setRawMode(true)
		process.stdin.resume()

		process.stdin.on("data", (data) => {
			const input = data.toString("utf8")

			if (input.includes("\u0003") || input.toLowerCase().includes("q")) {
				process.exit(0)
			}

			onKey?.(input)
		})
	}

	if (onResize) {
		process.stdout.on("resize", onResize)
	}
}

/**
 * The command-line arguments every demo accepts.
 *
 * `--size <columns>x<rows>` fixes the grid explicitly, which frees a demo from needing a TTY at all — frames can be
 * piped to a file or another process. `--time <milliseconds>` pins the animation clock, making a frame fully
 * deterministic; combined, two demos rendering the same scene can be captured and compared cell for cell.
 *
 * @returns {DemoArguments}
 */
export function parseDemoArguments(args = process.argv.slice(2)) {
	const { values } = parseArgs({
		args,
		options: {
			size: { type: "string" },
			time: { type: "string" },
		},
		strict: false,
	})

	const size = typeof values.size === "string" ? values.size.match(/(\d+)x(\d+)/) : null

	return {
		size: size ? { columns: Number(size[1]), rows: Number(size[2]) } : null,
		time: typeof values.time === "string" ? Number(values.time) : null,
	}
}
