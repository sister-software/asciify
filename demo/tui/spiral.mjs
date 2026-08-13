/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 * @fileoverview
 * The spiral demo, rendered to the terminal.
 *
 * This is the same fragment shader as `demo/spiral`, ported line-for-line from GLSL to JavaScript and evaluated on the
 * CPU — a shader is just a function of `(u, v, time)`, so it can be sampled at the terminal's braille subpixel grid as
 * readily as at a canvas's. Run it after `yarn compile`:
 *
 *   node demo/terminal/spiral.mjs
 *
 * The browser demos keep the shader on the GPU and are the honest performance story; this one trades that for running
 * anywhere Node runs, including over SSH.
 */

import { AsciifyTerminal } from "../../out/tui/index.js"
import { createTerminalSession, parseDemoArguments } from "./common.mjs"

const smoothstep = (edge0, edge1, x) => {
	const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1)

	return t * t * (3 - 2 * t)
}

// GLSL's `mod` is a floored modulo, unlike JavaScript's remainder operator.
const mod = (x, y) => x - y * Math.floor(x / y)

const clamp01 = (x) => (x < 0 ? 0 : Math.min(1, x))

/**
 * The spiral fragment shader. `u`, `v` are in [0, 1] with `v` up, matching `vUv`; `timeMs` matches the `time` uniform.
 * Writes the clamped RGB result into `out`, mirroring `gl_FragColor`'s clamp to the framebuffer's range.
 *
 * Compare against the GLSL in `demo/spiral/main.mjs` — the variable names and order match deliberately.
 */
function spiralShader(u, v, timeMs, out) {
	const screenCoordinateX = -1 + 2 * u
	const animationTime = (timeMs / 1000) * 40
	const scale = 1 / 40

	let xCoord = 380 * (screenCoordinateX * 0.5 + 0.5)
	let yCoord = 380 * ((-1 + 2 * v) * 0.5 + 0.5)

	// The browser demo drives this from page scroll; the terminal has no scroll, so the spiral stays tightly wound.
	const scrollProgress = 0
	const logScrollProgress = Math.log(1 + scrollProgress) / Math.log(15)
	const spiralPower = 1 - smoothstep(0, 1, logScrollProgress)

	let intensity = 200 + Math.sin(xCoord * scale + animationTime / 150) * 20
	let distance = 140 + Math.cos((yCoord * scale) / 2) * 18 + Math.cos(xCoord * scale) * 7

	const radius = Math.sqrt(
		Math.abs(intensity - xCoord) ** (spiralPower * 2) + Math.abs(distance - yCoord) ** (spiralPower * 2)
	)

	const angle = yCoord / radius

	xCoord = radius * Math.cos(angle) - animationTime / 2
	yCoord = radius * Math.sin(angle) - animationTime / 2

	distance = Math.sin(xCoord * scale) * 176 + Math.sin(xCoord * scale) * 164 + radius

	let height = (yCoord + distance + animationTime / 2) * scale

	intensity =
		Math.cos(height + (radius * screenCoordinateX) / 1.3) * (xCoord + xCoord + animationTime) +
		Math.cos(angle * scale * 6) * (radius + height / 3)

	height = Math.sin(yCoord * scale) * 144 - Math.sin(xCoord * scale) * 212 * screenCoordinateX

	height =
		(height + (yCoord - xCoord) * angle + Math.sin(radius - (animationTime + height) / 7) * 10 + intensity / 4) * scale

	intensity +=
		Math.cos(height * 2.3 * Math.sin(animationTime / 350 - angle)) *
			184 *
			Math.sin(angle - (radius * 4.3 + animationTime / 12) * scale) +
		Math.tan(radius * scale + height) * 184 * Math.cos(radius * scale + height)

	intensity = mod(intensity / 5.6, 256) / 64

	if (intensity < 0) {
		intensity += 4
	}

	if (intensity >= 2) {
		intensity = 4 - intensity
	}

	distance = radius / 350
	distance += Math.sin(distance * distance * 8) * 0.52

	yCoord = (Math.sin(animationTime * scale) + 1) / 2

	out[0] = clamp01(
		((yCoord * intensity) / 1.6) * distance * screenCoordinateX +
			(intensity / 1.3 + distance / 8) * distance * (1 - screenCoordinateX)
	)

	out[1] = clamp01(
		(intensity / 2 + distance / 13) * distance * screenCoordinateX +
			(intensity / 2 + distance / 18) * distance * (1 - screenCoordinateX)
	)

	out[2] = clamp01(intensity * distance * screenCoordinateX + intensity * distance * (1 - screenCoordinateX))
}

const { size: fixedSize } = parseDemoArguments()
const asciify = new AsciifyTerminal(process.stdout)

let frameBuffer = new Uint8ClampedArray(0)

const resize = () => {
	asciify.setSize(fixedSize?.columns, fixedSize?.rows)
	// The terminal source is a plain buffer, so `applySizeTo` has nothing to resize — allocation is our job.
	frameBuffer = new Uint8ClampedArray(asciify.sourceWidth * asciify.sourceHeight * 4)
}

/**
 * Evaluates the shader across the subpixel grid, exactly as the GPU would across a render target.
 */
const renderSource = (timeMs) => {
	const { sourceWidth, sourceHeight } = asciify
	const rgb = [0, 0, 0]

	let byteIndex = 0

	for (let y = 0; y < sourceHeight; y++) {
		// Terminal rows grow downward while `vUv` grows upward, the same inversion the canvas renderers handle via flipY.
		const v = 1 - y / (sourceHeight - 1)

		for (let x = 0; x < sourceWidth; x++, byteIndex += 4) {
			spiralShader(x / (sourceWidth - 1), v, timeMs, rgb)

			frameBuffer[byteIndex] = rgb[0] * 255
			frameBuffer[byteIndex + 1] = rgb[1] * 255
			frameBuffer[byteIndex + 2] = rgb[2] * 255
			frameBuffer[byteIndex + 3] = 255
		}
	}
}

createTerminalSession({ onResize: resize })

resize()

const startedAt = performance.now()

const tick = () => {
	// The offset winds the spiral into a visually interesting phase from the first frame.
	renderSource(performance.now() - startedAt + 20_000)
	asciify.rasterize(frameBuffer)

	setTimeout(tick, 16)
}

tick()
