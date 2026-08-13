/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 */

import Stats from "stats-js"
import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"

import { AsciifyGUI } from "../common/gui.mjs"

const isLocal = ["localhost", "127.0.0.1"].includes(globalThis.location.hostname)

const asciifyModuleID = isLocal ? "/out/index.js" : "@sister.software/asciify"

console.debug(`Loading Asciify module from ${asciifyModuleID}`)

const { createAsciify, createDefaultOptions } = await import(asciifyModuleID)

// `createAsciify` prefers WebGL and falls back to Canvas2D on its own. `?renderer=2d` or
// `?renderer=webgl` forces the choice, which is handy for comparing the two on identical content.
const rendererPreference = new URLSearchParams(globalThis.location.search).get("renderer") ?? "auto"

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 4000)
camera.position.y = 800
camera.position.x = -600
camera.position.z = 250

const scene = new THREE.Scene()
scene.background = new THREE.Color("#001a89")

// Key and rim must be directional: a point source this close to the origin spends most of the bounce inside the
// radius-200 sphere, and physical falloff zeroes it at scene scale regardless. The PI factor is the physical-units
// equivalent of the legacy intensities.
const keyLight = new THREE.DirectionalLight(0xff_ff_ff, 0.5 * Math.PI)
keyLight.position.set(50, 50, 50)
scene.add(keyLight)

const rimLight = new THREE.DirectionalLight(0xff_ff_ff, 0.25 * Math.PI)
rimLight.position.set(-100, -200, -200)
scene.add(rimLight)

const hemiLight = new THREE.HemisphereLight(0xff_ff_ff, 0x22_22_22, 1)
hemiLight.position.set(0, 100, 0)
scene.add(hemiLight)

const ambientLight = new THREE.AmbientLight(0x40_40_40)
scene.add(ambientLight)

const sphere = new THREE.Mesh(new THREE.SphereGeometry(200, 20, 10), new THREE.MeshPhongMaterial({ flatShading: true }))

sphere.material.color.setHSL(0.9, 0.8, 0.8)
scene.add(sphere)

const ground = new THREE.Mesh(
	new THREE.PlaneGeometry(2000, 2000),
	new THREE.MeshPhongMaterial({ color: "hsl(200, 30%, 65%)", depthWrite: false })
)

ground.position.y = -200
ground.rotation.x = -Math.PI / 2

scene.add(ground)

const grid = new THREE.GridHelper(2000, 20, 0x00_00_ff, 0xff_00_00)
grid.position.y = -199
grid.material.opacity = 0.2
grid.material.transparent = true
scene.add(grid)

const startTime = Date.now()
const canvas = document.getElementById("demo")

const renderer = new THREE.WebGLRenderer({
	powerPreference: "high-performance",
	precision: "lowp",
})

const rendererContext = renderer.getContext()

camera.lookAt(sphere.position)

const asciiOptions = createDefaultOptions()
const asciify = createAsciify(canvas, { ...asciiOptions, renderer: rendererPreference })

// Expose asciify to the window for debugging
globalThis.asciify = asciify
// document.body.appendChild(renderer.domElement)

asciify.setSize(window.innerWidth, window.innerHeight, renderer)

camera.aspect = canvas.clientWidth / canvas.clientHeight

const controls = new OrbitControls(camera, asciify.domElement)
controls.minDistance = 500
controls.maxDistance = 2500

const onOptionChange = () => {
	cancelAnimationFrame(animationFrame)
	asciify.setOptions(asciiOptions)
	asciify.applySizeTo(renderer)

	animate()
}

const gui = new AsciifyGUI(asciiOptions, onOptionChange)
gui.domElement.classList.add("fixed", "top", "right")

const sceneOptions = {
	"Sphere Color": "#" + sphere.material.color.getHexString(),
	"Background Color": "#" + scene.background.getHexString(),
}

const sceneFolder = gui.addFolder("Scene")
sceneFolder.close()

sceneFolder.addColor(sceneOptions, "Sphere Color").onChange((hex) => {
	sphere.material.color.set(hex)
})

sceneFolder.addColor(sceneOptions, "Background Color").onChange((hex) => {
	scene.background.set(hex)
})

const onWindowResize = () => {
	cancelAnimationFrame(animationFrame)
	asciify.setSize(window.innerWidth, window.innerHeight, renderer)

	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()

	animate()
}

window.addEventListener("resize", onWindowResize)

const stats = new Stats()
stats.dom.style.left = "auto"
stats.dom.style.top = "auto"
stats.dom.style.right = "0"
stats.dom.style.bottom = "0"
stats.showPanel(0)
document.body.appendChild(stats.dom)

// Animation
let animationFrame = -1

const animate = () => {
	stats.begin()
	const timer = Date.now() - startTime

	sphere.position.y = Math.abs(Math.sin(timer * 0.003)) * 250
	sphere.rotation.x = timer * 0.0009
	sphere.rotation.z = timer * 0.0008

	controls.update()

	renderer.render(scene, camera)
	asciify.rasterizeWebGLRenderer(renderer, rendererContext)
	stats.end()

	animationFrame = requestAnimationFrame(animate)
}

document.body.appendChild(gui.domElement)

animate()
