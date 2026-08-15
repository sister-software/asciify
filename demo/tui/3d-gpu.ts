/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 * @fileoverview
 * The 3D demo in the terminal, rendered by an actual GPU pipeline.
 *
 * Where `3d.mjs` re-implements the scene as a CPU raytrace, this demo runs `demo/3d`'s real Three.js scene — same
 * code path a browser would take — inside headless Chromium, which Playwright already provides as a devDependency for
 * the test suite. The page renders at the braille subpixel size, reads the pixels back in the same task as the draw
 * (the same rule the canvas renderers live by), and POSTs each frame to this process, which rasterizes it to the
 * terminal. The response to each POST carries the current camera and pane size back, so one request/response loop is
 * the frame clock, the control channel, and the resize protocol all at once.
 *
 * This is the library's own architecture writ small: the source is prepared wherever a GPU lives, and the terminal
 * renderer only ever sees an RGBA buffer — `rasterize(buffer, flipY)` neither knows nor cares that a browser produced
 * it. Note that headless Chromium may route WebGL through SwiftShader (a software GPU) depending on platform; the
 * pipeline is identical either way.
 *
 *   node demo/tui/3d-gpu.mjs
 *
 * Controls: arrow keys or WASD orbit, +/- zoom, q or Ctrl-C quits.
 */

import { readFile } from "node:fs/promises"
import { createServer } from "node:http"
import type { AddressInfo } from "node:net"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import { AsciifyTerminal } from "#tui"

import { createTerminalSession, parseDemoArguments } from "./common.ts"

const { size: fixedSize, time: fixedTime } = parseDemoArguments()

if (!process.stdout.isTTY && !fixedSize) {
	console.error("3d-gpu.mjs needs a real terminal to draw into, or an explicit --size=<columns>x<rows>.")

	process.exit(1)
}

// `three`'s exports map hides its build directory from bare specifiers, but `import.meta.resolve` follows the
// `import` condition to the real file on disk — and its sibling `three.core.js`, which the module build imports.
const threeBuildDirectory = dirname(fileURLToPath(import.meta.resolve("three")))

const asciify = new AsciifyTerminal(process.stdout)

/**
 * Shared state, mutated by the keyboard and read by every frame response. The camera starts where `demo/3d` puts it,
 * expressed as orbit coordinates, with the same 500–2500 zoom clamp as its OrbitControls.
 */
const camera = {
	azimuth: Math.atan2(-600, 250),
	polar: Math.acos(800 / Math.hypot(600, 800, 250)),
	distance: Math.hypot(600, 800, 250),
}

const onKey = (input: string) => {
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
		camera.distance = Math.max(500, camera.distance - 100)
	}

	if (input.includes("-")) {
		camera.distance = Math.min(2500, camera.distance + 100)
	}
}

/**
 * The page is the browser half of `demo/3d`, trimmed to essentials: same scene graph, same animation, no GUI. It
 * renders, reads pixels back, ships them, and applies whatever state comes back.
 */
const pageHtml = /* html */ `<!doctype html>
<html>
	<body>
		<script type="importmap">
			{ "imports": { "three": "/three.module.js" } }
		</script>
		<script type="module">
			import * as THREE from "three"

			const params = new URLSearchParams(location.search)

			let width = Number(params.get("width"))
			let height = Number(params.get("height"))

			// The scene, faithful to demo/3d/main.mjs.
			const camera = new THREE.PerspectiveCamera(60, width / height, 1, 4000)
			const scene = new THREE.Scene()
			scene.background = new THREE.Color("#001a89")

			// Key and rim must be directional: a point source this close to the origin spends most of the bounce
			// inside the radius-200 sphere, and physical falloff zeroes it at scene scale regardless. The PI
			// factor is the physical-units equivalent of the legacy intensities.
			const keyLight = new THREE.DirectionalLight(0xffffff, 0.5 * Math.PI)
			keyLight.position.set(50, 50, 50)
			scene.add(keyLight)

			const rimLight = new THREE.DirectionalLight(0xffffff, 0.25 * Math.PI)
			rimLight.position.set(-100, -200, -200)
			scene.add(rimLight)

			const hemiLight = new THREE.HemisphereLight(0xffffff, 0x222222, 1)
			hemiLight.position.set(0, 100, 0)
			scene.add(hemiLight)

			scene.add(new THREE.AmbientLight(0x404040))

			const sphere = new THREE.Mesh(
				new THREE.SphereGeometry(200, 20, 10),
				new THREE.MeshPhongMaterial({ flatShading: true })
			)
			sphere.material.color.setHSL(0.9, 0.8, 0.8)
			scene.add(sphere)

			const ground = new THREE.Mesh(
				new THREE.PlaneGeometry(2000, 2000),
				new THREE.MeshPhongMaterial({ color: "hsl(200, 30%, 65%)", depthWrite: false })
			)
			ground.position.y = -200
			ground.rotation.x = -Math.PI / 2
			scene.add(ground)

			const grid = new THREE.GridHelper(2000, 20, 0x0000ff, 0xff0000)
			grid.position.y = -199
			grid.material.opacity = 0.2
			grid.material.transparent = true
			scene.add(grid)

			const renderer = new THREE.WebGLRenderer({ powerPreference: "high-performance", precision: "lowp" })
			renderer.setSize(width, height, false)

			const gl = renderer.getContext()

			let pixels = new Uint8Array(width * height * 4)

			const startTime = Date.now()

			// A pinned clock renders the same frame forever, which is what makes captures comparable.
			const fixedTime = params.get("time")

			const applyCameraState = (state) => {
				const sinPolar = Math.sin(state.polar)

				camera.position.set(
					state.distance * sinPolar * Math.sin(state.azimuth),
					state.distance * Math.cos(state.polar),
					state.distance * sinPolar * Math.cos(state.azimuth)
				)
				camera.lookAt(scene.position)
				camera.updateProjectionMatrix()
			}

			// The camera must be posed before the first render — every frame ships, including the first.
			applyCameraState({
				azimuth: Number(params.get("azimuth")),
				polar: Number(params.get("polar")),
				distance: Number(params.get("distance")),
			})

			const frame = async () => {
				const frameStart = performance.now()
				const timer = fixedTime === null ? Date.now() - startTime : Number(fixedTime)

				sphere.position.y = Math.abs(Math.sin(timer * 0.003)) * 250
				sphere.rotation.x = timer * 0.0009
				sphere.rotation.z = timer * 0.0008

				renderer.render(scene, camera)

				// Read back in the same task as the draw — the drawing buffer is not preserved across tasks.
				gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)

				const response = await fetch("/frame", { method: "POST", body: pixels })
				const state = await response.json()

				if (state.width !== width || state.height !== height) {
					width = state.width
					height = state.height
					renderer.setSize(width, height, false)
					camera.aspect = width / height
					pixels = new Uint8Array(width * height * 4)
				}

				applyCameraState(state.camera)

				// Headless pages have no vsync to lean on, so the loop paces itself to ~60 fps — without this,
				// the round-trip runs unthrottled and floods the terminal with hundreds of frames a second.
				const frameCost = performance.now() - frameStart
				await new Promise((resolve) => setTimeout(resolve, Math.max(0, 16 - frameCost)))

				frame()
			}

			frame()
		</script>
	</body>
</html>`

/**
 * One tiny HTTP server: the page, the local copy of Three (a devDependency, like every other demo), and the frame
 * endpoint. Each POST body is a raw RGBA readback; each response is the state the page should render next.
 */
const server = createServer(async (request, response) => {
	if (request.method === "POST" && request.url === "/frame") {
		const chunks = []

		for await (const chunk of request) {
			chunks.push(chunk)
		}

		const body = Buffer.concat(chunks)

		// A resize mid-flight leaves one frame at the old dimensions; drop it rather than shear it.
		if (body.length === asciify.sourceWidth * asciify.sourceHeight * 4) {
			// readPixels hands rows back bottom-up, hence flipY — the same contract as rasterizeWebGLRenderer.
			asciify.rasterize(new Uint8ClampedArray(body.buffer, body.byteOffset, body.length), true)
		}

		response.setHeader("content-type", "application/json")

		response.end(
			JSON.stringify({
				width: asciify.sourceWidth,
				height: asciify.sourceHeight,
				camera,
			})
		)

		return
	}

	if (request.url === "/three.module.js" || request.url === "/three.core.js") {
		response.setHeader("content-type", "text/javascript")
		response.end(await readFile(join(threeBuildDirectory, request.url)))

		return
	}

	response.setHeader("content-type", "text/html")
	response.end(pageHtml)
})

createTerminalSession({ onKey, onResize: () => asciify.setSize() })

asciify.setSize(fixedSize?.columns, fixedSize?.rows)

server.listen(0, "127.0.0.1", async () => {
	const { port } = server.address() as AddressInfo

	// Playwright is loaded lazily so the import cost lands after the terminal is already prepared.
	const { chromium } = await import("playwright")
	const browser = await chromium.launch()
	const page = await browser.newPage()

	// The browser dies with this process (Playwright watches its parent), so no explicit teardown is needed beyond
	// what createTerminalSession already restores.
	const pageUrl = new URL(`http://127.0.0.1:${port}/`)

	pageUrl.searchParams.set("width", String(asciify.sourceWidth))
	pageUrl.searchParams.set("height", String(asciify.sourceHeight))
	pageUrl.searchParams.set("azimuth", String(camera.azimuth))
	pageUrl.searchParams.set("polar", String(camera.polar))
	pageUrl.searchParams.set("distance", String(camera.distance))

	if (fixedTime !== null) {
		pageUrl.searchParams.set("time", String(fixedTime))
	}

	await page.goto(pageUrl.href)
})
