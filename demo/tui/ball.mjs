/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 * @fileoverview
 * A checkered ball bouncing in the terminal, after the Amiga's Boing demo.
 *
 * Where `spiral.mjs` stresses the rasterizer with a frame that changes everywhere, this one is the damage diff's
 * showcase: the background never changes, so each frame's wire cost is roughly the ball's bounding box and its shadow —
 * a small fraction of the pane. Run it after `yarn compile`:
 *
 *   node demo/tui/ball.mjs
 */

import { AsciifyTerminal } from "../../out/tui/index.js"
import { createTerminalSession, parseDemoArguments } from "./common.mjs"

const { size: fixedSize } = parseDemoArguments()
const asciify = new AsciifyTerminal(process.stdout)

/**
 * The scene is drawn in subpixel space — one value per braille dot — and the static parts are prepared once. Each frame
 * copies the background wholesale (a memcpy) and repaints only the ball and shadow's bounding boxes.
 */
let frameBuffer = new Uint8ClampedArray(0)
let backgroundBuffer = new Uint8ClampedArray(0)

const BACKGROUND = [168, 168, 168]
const GRID_LINE = [148, 62, 188]
const BALL_RED = [222, 56, 48]
const BALL_WHITE = [250, 250, 250]

/**
 * Ball state, in subpixels. Initialized on (re)size.
 */
const ball = {
	x: 0,
	y: 0,
	velocityX: 0,
	velocityY: 0,
	radius: 0,
	spin: 0,
	floorY: 0,
	gravity: 0,
	bounceSpeed: 0,
}

const resize = () => {
	asciify.setSize(fixedSize?.columns, fixedSize?.rows)

	const { sourceWidth, sourceHeight } = asciify

	frameBuffer = new Uint8ClampedArray(sourceWidth * sourceHeight * 4)
	backgroundBuffer = new Uint8ClampedArray(sourceWidth * sourceHeight * 4)

	// The classic backdrop: a flat gray field ruled with a purple grid.
	const gridStep = 16

	let byteIndex = 0

	for (let y = 0; y < sourceHeight; y++) {
		for (let x = 0; x < sourceWidth; x++, byteIndex += 4) {
			const onGridLine = x % gridStep === 0 || y % gridStep === 0
			const [red, green, blue] = onGridLine ? GRID_LINE : BACKGROUND

			backgroundBuffer[byteIndex] = red
			backgroundBuffer[byteIndex + 1] = green
			backgroundBuffer[byteIndex + 2] = blue
			backgroundBuffer[byteIndex + 3] = 255
		}
	}

	// Scale the ball and its physics to the pane. Braille subcells are roughly square, so no aspect correction.
	ball.radius = Math.max(4, Math.min(sourceWidth, sourceHeight) * 0.22)
	ball.floorY = sourceHeight - ball.radius * 0.35
	ball.x = sourceWidth / 2
	ball.y = ball.radius * 1.2
	ball.velocityX = Math.max(0.5, sourceWidth * 0.004)
	ball.velocityY = 0
	ball.gravity = Math.max(0.02, sourceHeight * 0.0006)
	// The bounce always returns the ball to roughly the same height, Amiga-style: no energy loss.
	ball.bounceSpeed = Math.sqrt(2 * ball.gravity * (ball.floorY - ball.radius * 1.4))
}

/**
 * Steps the simulation one frame: gravity, floor bounce, wall bounce, spin.
 */
const step = () => {
	const { sourceWidth } = asciify

	ball.velocityY += ball.gravity
	ball.x += ball.velocityX
	ball.y += ball.velocityY

	if (ball.y + ball.radius >= ball.floorY) {
		ball.y = ball.floorY - ball.radius
		ball.velocityY = -ball.bounceSpeed
	}

	if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= sourceWidth - 1) {
		ball.velocityX = -ball.velocityX
		ball.x += ball.velocityX
	}

	// The ball rolls in its direction of travel.
	ball.spin += ball.velocityX * 0.02
}

/**
 * Paints the ball and its shadow over the copied background. Only their bounding boxes are visited — everything else is
 * untouched background, which the damage diff then skips entirely.
 */
const paint = () => {
	const { sourceWidth, sourceHeight } = asciify
	const { x: centerX, y: centerY, radius, spin, floorY } = ball

	frameBuffer.set(backgroundBuffer)

	// -- Shadow: a flattened ellipse on the floor, darkening whatever the background holds. ----
	const shadowRadiusX = radius * 0.9
	const shadowRadiusY = radius * 0.22
	const shadowX = centerX + radius * 0.35
	const shadowY = floorY

	const shadowTop = Math.max(0, Math.floor(shadowY - shadowRadiusY))
	const shadowBottom = Math.min(sourceHeight - 1, Math.ceil(shadowY + shadowRadiusY))
	const shadowLeft = Math.max(0, Math.floor(shadowX - shadowRadiusX))
	const shadowRight = Math.min(sourceWidth - 1, Math.ceil(shadowX + shadowRadiusX))

	for (let y = shadowTop; y <= shadowBottom; y++) {
		for (let x = shadowLeft; x <= shadowRight; x++) {
			const dx = (x - shadowX) / shadowRadiusX
			const dy = (y - shadowY) / shadowRadiusY

			if (dx * dx + dy * dy > 1) continue

			const byteIndex = (y * sourceWidth + x) * 4

			frameBuffer[byteIndex] = frameBuffer[byteIndex] * 0.5
			frameBuffer[byteIndex + 1] = frameBuffer[byteIndex + 1] * 0.5
			frameBuffer[byteIndex + 2] = frameBuffer[byteIndex + 2] * 0.5
		}
	}

	// -- Ball: a raycast sphere with an 8x8 checker in latitude and longitude. -----------------
	const top = Math.max(0, Math.floor(centerY - radius))
	const bottom = Math.min(sourceHeight - 1, Math.ceil(centerY + radius))
	const left = Math.max(0, Math.floor(centerX - radius))
	const right = Math.min(sourceWidth - 1, Math.ceil(centerX + radius))

	// Light arrives from the upper left, in front of the scene.
	const lightX = -0.45
	const lightY = -0.55
	const lightZ = 0.7

	for (let y = top; y <= bottom; y++) {
		for (let x = left; x <= right; x++) {
			const dx = (x - centerX) / radius
			const dy = (y - centerY) / radius
			const distanceSquared = dx * dx + dy * dy

			if (distanceSquared > 1) continue

			// The sphere's surface normal at this pixel is also its surface point on the unit sphere.
			const dz = Math.sqrt(1 - distanceSquared)

			// Checker cells: 8 bands of longitude spun by the roll, 8 bands of latitude.
			const longitude = Math.atan2(dz, dx) + spin
			const latitude = Math.asin(dy)

			const checker = (Math.floor((longitude / Math.PI) * 4) + Math.floor(((latitude + Math.PI / 2) / Math.PI) * 8)) & 1

			const [red, green, blue] = checker ? BALL_RED : BALL_WHITE

			// Lambertian shading with a floor, so the dark limb stays readable.
			const diffuse = Math.max(0, dx * lightX + dy * lightY + dz * lightZ)
			const shade = 0.3 + 0.7 * diffuse

			const byteIndex = (y * sourceWidth + x) * 4

			frameBuffer[byteIndex] = red * shade
			frameBuffer[byteIndex + 1] = green * shade
			frameBuffer[byteIndex + 2] = blue * shade
		}
	}
}

createTerminalSession({ onResize: resize })

resize()

const tick = () => {
	step()
	paint()
	asciify.rasterize(frameBuffer)

	setTimeout(tick, 16)
}

tick()
