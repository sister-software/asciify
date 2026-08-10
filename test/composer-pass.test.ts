/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 * @file `AsciifyComposerPass` satisfies Three.js's `Pass` protocol by duck-typing, and recovers the
 *   read buffer's texture by querying the framebuffer rather than reading Three's internals. Both of
 *   those are agreements with a library we do not import and cannot see changing, so this suite runs
 *   against a real `EffectComposer` — it exists to fail when Three drifts out from under us.
 */

import * as THREE from "three"
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js"
import { RenderPass } from "three/addons/postprocessing/RenderPass.js"
import { afterEach, describe, expect, it } from "vitest"

import { AsciifyComposerPass } from "../AsciifyComposerPass.ts"
import { AsciifyPass } from "../AsciifyPass.ts"
import type { AsciifyOptions } from "../options/common.ts"
import { comparePixels, createStage, readCanvas } from "./utils.ts"

const OPTIONS: Partial<AsciifyOptions> = {
	fontSize: 8,
	pixelRatio: 1,
	contrastRatio: 3,
	fontFamily: "monospace",
}

const WIDTH = 320
const HEIGHT = 240

/**
 * WebGL contexts are a capped resource — browsers drop the oldest once you pass roughly sixteen — and this suite
 * creates a renderer per test. Disposing keeps later tests from being starved.
 */
const disposables: Array<{ dispose(): void }> = []

afterEach(() => {
	while (disposables.length) {
		disposables.pop()!.dispose()
	}
})

/**
 * A deliberately asymmetric scene: three differently coloured quads at different depths, so any flip, offset, or
 * sampling mistake shows up as a pixel difference rather than cancelling out.
 */
function createScene(): { scene: THREE.Scene; camera: THREE.Camera } {
	const scene = new THREE.Scene()
	scene.background = new THREE.Color(0x11_22_33)

	const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10)
	camera.position.z = 5

	const quads: Array<[number, number, number, number]> = [
		[-0.5, 0.35, 0.9, 0xff_44_22],
		[0.45, -0.2, 0.6, 0x22_ff_88],
		[-0.1, -0.6, 0.4, 0x44_66_ff],
	]

	for (const [x, y, size, color] of quads) {
		const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ color }))
		mesh.position.set(x, y, 0)
		scene.add(mesh)
	}

	return { scene, camera }
}

function createRenderer(canvas: HTMLCanvasElement): THREE.WebGLRenderer {
	const renderer = new THREE.WebGLRenderer({ canvas, antialias: false })
	renderer.setPixelRatio(1)
	renderer.setSize(WIDTH, HEIGHT, false)
	disposables.push(renderer)

	return renderer
}

describe("AsciifyComposerPass", () => {
	it("satisfies the Pass protocol EffectComposer relies on", () => {
		const renderer = createRenderer(createStage(WIDTH, HEIGHT))
		const pass = new AsciifyComposerPass(renderer, OPTIONS)

		// Not an exhaustive mirror of Three's Pass, just the members the composer actually reads.
		expect(pass.enabled).toBe(true)
		expect(pass.needsSwap).toBe(true)
		expect(typeof pass.setSize).toBe("function")
		expect(typeof pass.render).toBe("function")
		expect("renderToScreen" in pass).toBe(true)
	})

	it("renders a scene through a real EffectComposer", () => {
		const stage = createStage(WIDTH, HEIGHT)
		const renderer = createRenderer(stage)
		const { scene, camera } = createScene()

		// `samples: 0` keeps the read buffer backed by a texture rather than a renderbuffer.
		const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(1, 1, { samples: 0 }))
		composer.addPass(new RenderPass(scene, camera))

		const asciiPass = new AsciifyComposerPass(renderer, OPTIONS)
		asciiPass.renderToScreen = true
		composer.addPass(asciiPass)
		asciiPass.syncComposerSize(composer)

		expect(asciiPass.columnCount).toBeGreaterThan(0)
		expect(asciiPass.rowCount).toBeGreaterThan(0)

		composer.render()

		const pixels = readCanvas(stage)
		let ink = 0

		for (let i = 0; i < pixels.length; i += 4) {
			if (pixels[i]! + pixels[i + 1]! + pixels[i + 2]! > 40) {
				ink++
			}
		}

		// Something was drawn, and it is not a uniform field.
		expect(ink).toBeGreaterThan(0)
		expect(ink).toBeLessThan(pixels.length / 4)
	})

	it("resolves the read buffer's texture from the framebuffer", () => {
		// This is the load-bearing assumption. Three could change how it binds render targets, or
		// what it attaches to them, and the public query would start returning null.
		const renderer = createRenderer(createStage(WIDTH, HEIGHT))
		const { scene, camera } = createScene()

		const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(1, 1, { samples: 0 }))
		composer.addPass(new RenderPass(scene, camera))

		const asciiPass = new AsciifyComposerPass(renderer, OPTIONS)
		asciiPass.renderToScreen = true
		composer.addPass(asciiPass)
		asciiPass.syncComposerSize(composer)

		// A null texture makes `render` throw with a specific message; reaching the end means the
		// query found one.
		expect(() => composer.render()).not.toThrow()
	})

	it("sizes the composer's buffers to the character grid, not the canvas", () => {
		const renderer = createRenderer(createStage(WIDTH, HEIGHT))
		const { scene, camera } = createScene()

		const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(1, 1, { samples: 0 }))
		composer.addPass(new RenderPass(scene, camera))

		const asciiPass = new AsciifyComposerPass(renderer, OPTIONS)
		composer.addPass(asciiPass)
		asciiPass.syncComposerSize(composer)

		// One source pixel per character cell. Sized to the canvas instead, every earlier pass
		// would render at full resolution and asciify would sample only the top-left corner.
		expect(composer.readBuffer.width).toBe(asciiPass.columnCount)
		expect(composer.readBuffer.height).toBe(asciiPass.rowCount)
		expect(asciiPass.columnCount).toBe(Math.floor(WIDTH / 8))
	})

	it("matches driving AsciifyPass by hand over the same render target", () => {
		// Isolates the adapter. Both paths use Three to render the scene, so colour management and
		// tone mapping are identical either way; any difference is the composer plumbing's fault.
		const { scene, camera } = createScene()

		const composerStage = createStage(WIDTH, HEIGHT)
		const composerRenderer = createRenderer(composerStage)
		const composer = new EffectComposer(composerRenderer, new THREE.WebGLRenderTarget(1, 1, { samples: 0 }))
		composer.addPass(new RenderPass(scene, camera))

		const asciiPass = new AsciifyComposerPass(composerRenderer, OPTIONS)
		asciiPass.renderToScreen = true
		composer.addPass(asciiPass)
		asciiPass.syncComposerSize(composer)
		composer.render()

		const manualStage = createStage(WIDTH, HEIGHT)
		const manualRenderer = createRenderer(manualStage)
		const manualAsciify = new AsciifyPass(manualRenderer.getContext() as WebGL2RenderingContext, OPTIONS)
		manualAsciify.setSize()

		const target = new THREE.WebGLRenderTarget(manualAsciify.columnCount, manualAsciify.rowCount, { samples: 0 })

		manualRenderer.setRenderTarget(target)
		manualRenderer.render(scene, camera)

		// Recover the same texture the composer pass would have found, the same way.
		const gl = manualRenderer.getContext() as WebGL2RenderingContext

		const sourceTexture = gl.getFramebufferAttachmentParameter(
			gl.FRAMEBUFFER,
			gl.COLOR_ATTACHMENT0,
			gl.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME
		) as WebGLTexture

		manualRenderer.setRenderTarget(null)
		manualAsciify.rasterizeTexture(sourceTexture, true)
		manualRenderer.resetState()

		const composerPixels = readCanvas(composerStage)
		const manualPixels = readCanvas(manualStage)

		// Two blank canvases also differ by zero pixels. Establish there is something to compare
		// before reading anything into the comparison.
		let ink = 0

		for (let i = 0; i < composerPixels.length; i += 4) {
			if (composerPixels[i]! + composerPixels[i + 1]! + composerPixels[i + 2]! > 40) {
				ink++
			}
		}

		expect(ink, "composer output is blank, so the comparison proves nothing").toBeGreaterThan(
			composerPixels.length / 4 / 100
		)

		const { differing, worst, total } = comparePixels(composerPixels, manualPixels)

		expect({ differing, worst }, `${differing}/${total} px differ, worst ${worst}`).toEqual({
			differing: 0,
			worst: 0,
		})

		target.dispose()
	})

	it("explains itself when the read buffer is multisampled", () => {
		// A multisampled target attaches a renderbuffer, which has no texture to sample. The
		// failure is unavoidable; the message should say what to change.
		const renderer = createRenderer(createStage(WIDTH, HEIGHT))
		const { scene, camera } = createScene()

		const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(1, 1, { samples: 4 }))
		composer.addPass(new RenderPass(scene, camera))

		const asciiPass = new AsciifyComposerPass(renderer, OPTIONS)
		asciiPass.renderToScreen = true
		composer.addPass(asciiPass)
		asciiPass.syncComposerSize(composer)

		expect(() => composer.render()).toThrow(/samples: 0/)
	})
})
