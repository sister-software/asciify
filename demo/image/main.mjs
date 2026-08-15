/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 */

import { AsciifyGUI } from "../common/gui.mjs"

const isLocal = ["localhost", "127.0.0.1"].includes(globalThis.location.hostname)

const asciifyModuleID = isLocal ? "/out/index.js" : "@sister.software/asciify"

console.debug(`Loading Asciify module from ${asciifyModuleID}`)

// The specifier is only known at runtime, so the module's type is asserted from the compiled declarations.
const { createAsciify, createDefaultOptions } = /** @type {typeof import("../../out/index.js")} */ (
	await import(asciifyModuleID)
)

// `createAsciify` prefers WebGL and falls back to Canvas2D on its own. `?renderer=2d` or
// `?renderer=webgl` forces the choice, which is handy for comparing the two on identical content.
const rendererPreference = /** @type {"auto" | "webgl" | "2d"} */ (
	new URLSearchParams(location.search).get("renderer") ?? "auto"
)

async function initialize() {
	const canvasContainer = /** @type {HTMLElement} */ (document.getElementById("canvas-container"))

	const imagePreviewerSource = /** @type {HTMLImageElement} */ (document.getElementById("image-previewer-source"))

	const canvas = document.createElement("canvas")

	canvas.style.maxHeight = `${canvasContainer.clientHeight}px`
	canvas.style.height = "100%"
	canvas.style.width = "100%"

	canvasContainer.appendChild(canvas)

	const asciiOptions = createDefaultOptions({
		// backgroundColor: '#00ff00',
		// pixelRatio: 1,
		// fontSize: 17,
	})

	console.debug("Default ASCII options:", asciiOptions)
	console.debug("Renderer preference:", rendererPreference)

	const asciify = createAsciify(canvas, {
		...asciiOptions,
		renderer: rendererPreference,
	})

	const filePicker = /** @type {HTMLInputElement} */ (document.getElementById("file-picker"))

	/** @type {File | URL | null} */
	let sourceRef = null

	/** @type {HTMLImageElement | null} */
	let imageElementRef = null

	let timeoutRef = -1

	/**
	 * @param {File | URL} fileOrURL
	 *
	 * @returns {Promise<HTMLImageElement>}
	 */
	function decodeImageFromFile(fileOrURL) {
		return new Promise((resolve, reject) => {
			// We use an image element to take advantage of the browser's built-in image
			// decoding and and orientation handling.
			const imageElement = new Image()
			imageElement.onerror = reject

			imageElement.onload = () => {
				console.debug("Image loaded, rasterizing...")

				resolve(imageElement)
			}

			const normalizedURL = fileOrURL instanceof URL ? fileOrURL.href : URL.createObjectURL(fileOrURL)

			imageElement.src = normalizedURL
			imagePreviewerSource.src = normalizedURL
		})
	}

	// Expose asciify to the window for debugging
	;/** @type {any} */ (globalThis).asciify = asciify

	asciify.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight)

	imagePreviewerSource.style.width = `${canvasContainer.clientWidth}px`

	/**
	 * @param {File | URL} nextSourceRef
	 */
	async function updateDemo(nextSourceRef) {
		sourceRef = nextSourceRef
		imageElementRef = await decodeImageFromFile(sourceRef)

		await asciify.rasterizeImage(imageElementRef)
	}

	const onOptionChange = () => {
		clearTimeout(timeoutRef)
		asciify.setOptions(asciiOptions)

		timeoutRef = setTimeout(() => {
			if (imageElementRef) {
				asciify.rasterizeImage(imageElementRef)
			}
		}, 100)
	}

	const gui = new AsciifyGUI(asciiOptions, onOptionChange)
	gui.domElement.classList.add("top", "right")

	const optionsFieldset = /** @type {HTMLElement} */ (document.getElementById("options-fieldset"))
	optionsFieldset.appendChild(gui.domElement)

	const onWindowResize = async () => {
		// Check for upward overscrolling...
		if (globalThis.document.documentElement.clientHeight !== window.innerHeight) return

		// Check for downward overscrolling...
		if (window.pageYOffset !== 0) return

		clearTimeout(timeoutRef)
		canvas.style.maxHeight = `${canvasContainer.clientHeight}px`

		asciify.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight)

		if (sourceRef) {
			updateDemo(sourceRef)
		}
	}

	window.addEventListener("resize", onWindowResize)

	filePicker.addEventListener("change", async () => {
		const file = filePicker.files?.[0]

		if (!file) return

		await updateDemo(new File([file], file.name, { type: file.type }))

		filePicker.value = ""
	})

	await updateDemo(new URL("/demo/common/test-pattern.svg", globalThis.location.origin))
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initialize)
} else {
	initialize()
}
