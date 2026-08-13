/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 * @fileoverview
 * The 3D demo, rendered to the terminal: a flat-shaded sphere bouncing over a gridded floor.
 *
 * This is a CPU raytrace of the same scene `demo/3d/main.mjs` builds in Three.js — same camera start, same bounce and
 * tumble, same palette, and the same faceted look, which is approximated by quantizing the sphere's surface normal to
 * the original `SphereGeometry(200, 20, 10)` segmentation before lighting. The orbit controls come along too, traded
 * from the mouse to the keyboard. Run it after `yarn compile`:
 *
 *   node demo/tui/3d.mjs
 *
 * Controls: arrow keys or WASD orbit, +/- zoom, q or Ctrl-C quits.
 */

import { AsciifyTerminal } from "../../out/tui/index.js"
import { createTerminalSession, parseDemoArguments } from "./common.mjs"

const { size: fixedSize, time: fixedTime } = parseDemoArguments()
const asciify = new AsciifyTerminal(process.stdout)

let frameBuffer = new Uint8ClampedArray(0)

// The original scene's palette. Lit surfaces shade in linear space, so their albedos are held linear — and the two
// arrive there by different routes, matching Three's color handling: `Color.setHSL` interprets its arguments in the
// *working* color space, so the sphere's `setHSL(0.9, 0.8, 0.8)` evaluates to linear RGB directly, while the ground's
// CSS string `hsl(200, 30%, 65%)` is sRGB and must be decoded. Conflating the two shifts the sphere's hue visibly.
const SPHERE_LINEAR = [0.96, 0.64, 0.832]
const GROUND_LINEAR = [139, 175, 193].map(srgbToLinear)
const SKY_COLOR = [0, 26, 137]
const GRID_CENTER_COLOR = [0, 0, 255]
const GRID_LINE_COLOR = [255, 0, 0]

// Scene constants, matching demo/3d: a radius-200 sphere over a 2000x2000 plane at y = -200 with a 20-division grid.
const SPHERE_RADIUS = 200
const GROUND_Y = -200
const GROUND_EXTENT = 1000
const GRID_STEP = 100
const GRID_OPACITY = 0.2

// The sphere geometry's segmentation, which flat shading makes visible as facets.
const SEGMENTS_U = 20
const SEGMENTS_V = 10

/**
 * The camera orbits the origin, exactly as OrbitControls does in the browser demo. The initial spherical coordinates
 * are derived from the original camera position (-600, 800, 250), and the zoom clamp matches
 * `minDistance`/`maxDistance`.
 */
const camera = {
	azimuth: Math.atan2(-600, 250),
	polar: Math.acos(800 / Math.hypot(600, 800, 250)),
	distance: Math.hypot(600, 800, 250),
}

const MIN_DISTANCE = 500
const MAX_DISTANCE = 2500
const FOV_Y = (60 * Math.PI) / 180

const resize = () => {
	asciify.setSize(fixedSize?.columns, fixedSize?.rows)
	frameBuffer = new Uint8ClampedArray(asciify.sourceWidth * asciify.sourceHeight * 4)
}

const onKey = (input) => {
	// Arrow keys arrive as CSI sequences; WASD works where those don't survive the trip.
	if (input.includes("[D") || input.includes("a")) {
		camera.azimuth -= 0.12
	}

	if (input.includes("[C") || input.includes("d")) {
		camera.azimuth += 0.12
	}

	if (input.includes("[A") || input.includes("w")) {
		camera.polar = Math.max(0.15, camera.polar - 0.08)
	}

	if (input.includes("[B") || input.includes("s")) {
		camera.polar = Math.min(1.45, camera.polar + 0.08)
	}

	if (input.includes("+") || input.includes("=")) {
		camera.distance = Math.max(MIN_DISTANCE, camera.distance - 100)
	}

	if (input.includes("-")) {
		camera.distance = Math.min(MAX_DISTANCE, camera.distance + 100)
	}
}

/**
 * Lighting mirrors the original's rig — key and rim directionals over hemisphere and ambient — and, like Three, shades
 * in **linear** space: albedo is decoded from sRGB, multiplied by the light, and encoded back per channel. Shading in
 * gamma space instead looks plausible in isolation but drifts against the GPU rendition exactly where it hurts —
 * midtones darken and hues desaturate — so the two demos would disagree about the same scene.
 */
const LIGHT_1 = normalize([50, 50, 50])
const LIGHT_2 = normalize([-100, -200, -200])

function normalize([x, y, z]) {
	const length = Math.hypot(x, y, z)

	return [x / length, y / length, z / length]
}

function srgbToLinear(channel) {
	const c = channel / 255

	return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function linearToSrgb(linear) {
	const c = Math.min(1, linear)

	return 255 * (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055)
}

/**
 * The scalar light arriving at a surface, in linear space. Directional terms use the legacy-equivalent coefficients
 * (`intensity * PI` in physical units divides back out through the Lambert BRDF), so only the ambient and hemisphere
 * levels are approximate.
 */
function shade(normal) {
	const hemisphere = 0.28 * (normal[1] * 0.5 + 0.5)
	const diffuse1 = Math.max(0, normal[0] * LIGHT_1[0] + normal[1] * LIGHT_1[1] + normal[2] * LIGHT_1[2]) * 0.5
	const diffuse2 = Math.max(0, normal[0] * LIGHT_2[0] + normal[1] * LIGHT_2[1] + normal[2] * LIGHT_2[2]) * 0.25

	return 0.05 + hemisphere + diffuse1 + diffuse2
}

// MeshPhongMaterial's defaults: specular 0x111111 (linear) under Three's normalized Blinn-Phong lobe.
const SPECULAR_STRENGTH = srgbToLinear(0x11) * (30 * 0.5 + 1)

/**
 * The white additive Blinn-Phong highlight, in linear space. Unlike the diffuse term this is independent of albedo —
 * which is visible on the pink sphere: the highlight lifts its dim green channel proportionally most.
 */
function specular(normal, ray) {
	let total = 0

	for (const [light, intensity] of [
		[LIGHT_1, 0.5],
		[LIGHT_2, 0.25],
	]) {
		// The half vector between the light and the viewer, who looks along the ray.
		const half = normalize([light[0] - ray[0], light[1] - ray[1], light[2] - ray[2]])
		const alignment = Math.max(0, normal[0] * half[0] + normal[1] * half[1] + normal[2] * half[2])

		total += intensity * SPECULAR_STRENGTH * alignment ** 30
	}

	return total
}

/**
 * Renders one frame by raycasting every braille subpixel: sphere first, ground plane behind it, sky otherwise.
 */
const render = (elapsed) => {
	const { sourceWidth, sourceHeight } = asciify

	if (!sourceWidth || !sourceHeight) return

	// The animation, verbatim from demo/3d.
	const sphereY = Math.abs(Math.sin(elapsed * 0.003)) * 250
	const rotationX = elapsed * 0.0009
	const rotationZ = elapsed * 0.0008

	const cosX = Math.cos(rotationX)
	const sinX = Math.sin(rotationX)
	const cosZ = Math.cos(rotationZ)
	const sinZ = Math.sin(rotationZ)

	// Camera basis: position from spherical coordinates, looking at the origin.
	const sinPolar = Math.sin(camera.polar)
	const eyeX = camera.distance * sinPolar * Math.sin(camera.azimuth)
	const eyeY = camera.distance * Math.cos(camera.polar)
	const eyeZ = camera.distance * sinPolar * Math.cos(camera.azimuth)

	const forward = normalize([-eyeX, -eyeY, -eyeZ])
	// Screen-right is forward x world-up — getting this cross product backwards renders the world upside down,
	// because the derived up vector inherits the sign.
	const right = normalize([-forward[2], 0, forward[0]])

	const up = [
		right[1] * forward[2] - right[2] * forward[1],
		right[2] * forward[0] - right[0] * forward[2],
		right[0] * forward[1] - right[1] * forward[0],
	]

	// Braille subpixels are roughly square, so the aspect ratio is just the subpixel grid's.
	const halfHeight = Math.tan(FOV_Y / 2)
	const halfWidth = halfHeight * (sourceWidth / sourceHeight)

	let byteIndex = 0

	for (let pixelY = 0; pixelY < sourceHeight; pixelY++) {
		const viewY = (1 - (2 * (pixelY + 0.5)) / sourceHeight) * halfHeight

		for (let pixelX = 0; pixelX < sourceWidth; pixelX++, byteIndex += 4) {
			const viewX = ((2 * (pixelX + 0.5)) / sourceWidth - 1) * halfWidth

			const ray = normalize([
				forward[0] + viewX * right[0] + viewY * up[0],
				forward[1] + viewX * right[1] + viewY * up[1],
				forward[2] + viewX * right[2] + viewY * up[2],
			])

			let red = SKY_COLOR[0]
			let green = SKY_COLOR[1]
			let blue = SKY_COLOR[2]

			// -- Sphere: analytic ray-sphere intersection against the bouncing center. -------------
			const toCenterX = eyeX
			const toCenterY = eyeY - sphereY
			const toCenterZ = eyeZ

			const b = toCenterX * ray[0] + toCenterY * ray[1] + toCenterZ * ray[2]
			const c = toCenterX * toCenterX + toCenterY * toCenterY + toCenterZ * toCenterZ - SPHERE_RADIUS * SPHERE_RADIUS
			const discriminant = b * b - c

			let hitSphere = false

			if (discriminant > 0) {
				const t = -b - Math.sqrt(discriminant)

				if (t > 0) {
					hitSphere = true

					// World-space normal at the hit point.
					const normalX = (eyeX + ray[0] * t) / SPHERE_RADIUS
					const normalY = (eyeY + ray[1] * t - sphereY) / SPHERE_RADIUS
					const normalZ = (eyeZ + ray[2] * t) / SPHERE_RADIUS

					// Undo the sphere's tumble (rotation order XYZ, Y unused) to reach object space...
					const untiltY = normalY * cosX + normalZ * sinX
					const untiltZ = -normalY * sinX + normalZ * cosX
					const objectX = normalX * cosZ + untiltY * sinZ
					const objectY = -normalX * sinZ + untiltY * cosZ
					const objectZ = untiltZ

					// ...quantize to the geometry's segments — this is what flat shading looks like from
					// the outside: one normal per facet...
					const longitudeStep = (2 * Math.PI) / SEGMENTS_U
					const latitudeStep = Math.PI / SEGMENTS_V
					const longitude = (Math.floor(Math.atan2(objectZ, objectX) / longitudeStep) + 0.5) * longitudeStep

					const latitude =
						(Math.floor(Math.acos(Math.max(-1, Math.min(1, objectY))) / latitudeStep) + 0.5) * latitudeStep

					const facetSin = Math.sin(latitude)
					const facetX = facetSin * Math.cos(longitude)
					const facetY = Math.cos(latitude)
					const facetZ = facetSin * Math.sin(longitude)

					// ...and rotate the facet normal back into the world for lighting.
					const retiltX = facetX * cosZ - facetY * sinZ
					const retiltY = facetX * sinZ + facetY * cosZ
					const worldNormal = [retiltX, retiltY * cosX - facetZ * sinX, retiltY * sinX + facetZ * cosX]
					const litShade = shade(worldNormal)
					const highlight = specular(worldNormal, ray)

					red = linearToSrgb(SPHERE_LINEAR[0] * litShade + highlight)
					green = linearToSrgb(SPHERE_LINEAR[1] * litShade + highlight)
					blue = linearToSrgb(SPHERE_LINEAR[2] * litShade + highlight)
				}
			}

			// -- Ground: the plane at y = -200, with the grid blended at its original opacity. ------
			if (!hitSphere && ray[1] < 0) {
				const t = (GROUND_Y - eyeY) / ray[1]
				const groundX = eyeX + ray[0] * t
				const groundZ = eyeZ + ray[2] * t

				if (Math.abs(groundX) <= GROUND_EXTENT && Math.abs(groundZ) <= GROUND_EXTENT) {
					const litShade = shade([0, 1, 0])

					red = linearToSrgb(GROUND_LINEAR[0] * litShade)
					green = linearToSrgb(GROUND_LINEAR[1] * litShade)
					blue = linearToSrgb(GROUND_LINEAR[2] * litShade)

					// The grid stays a gamma-space blend: GL alpha-blends against the already-encoded framebuffer.

					// Grid lines thicken with distance so they stay visible at a subpixel scale.
					const lineWidth = 2 + t * 0.004
					const distanceToLineX = Math.abs(groundX - Math.round(groundX / GRID_STEP) * GRID_STEP)
					const distanceToLineZ = Math.abs(groundZ - Math.round(groundZ / GRID_STEP) * GRID_STEP)

					if (distanceToLineX < lineWidth || distanceToLineZ < lineWidth) {
						const centerLine = Math.abs(groundX) < lineWidth || Math.abs(groundZ) < lineWidth
						const [lineRed, lineGreen, lineBlue] = centerLine ? GRID_CENTER_COLOR : GRID_LINE_COLOR

						red += (lineRed - red) * GRID_OPACITY
						green += (lineGreen - green) * GRID_OPACITY
						blue += (lineBlue - blue) * GRID_OPACITY
					}
				}
			}

			frameBuffer[byteIndex] = red
			frameBuffer[byteIndex + 1] = green
			frameBuffer[byteIndex + 2] = blue
			frameBuffer[byteIndex + 3] = 255
		}
	}
}

createTerminalSession({ onKey, onResize: resize })

resize()

const startedAt = performance.now()

const tick = () => {
	render(fixedTime ?? performance.now() - startedAt)
	asciify.rasterize(frameBuffer)

	setTimeout(tick, 16)
}

tick()
