const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname)

const asciifyModuleID = isLocal ? '/dist/mod.mjs' : '@sister.software/asciify'
console.debug(`Loading Asciify module from ${asciifyModuleID}`)
const { Asciify, createDefaultOptions } = await import(asciifyModuleID)

import Stats from 'stats-js'
import { AsciifyGUI } from '../common/gui.mjs'

import * as THREE from 'three'

/**
 * Identity function for GLSL template literals.
 */
const glsl = String.raw

/**
 * Identity function for fragment shader template literals.
 */
const frag = String.raw

const vertexShader = glsl`
varying vec2 vUv;

void main()	{
  vUv = uv;

  gl_Position = vec4( position, 1.0 );
}`

const fragmentShader = frag`
varying vec2 vUv;

uniform float time;
uniform float scrollProgress;
uniform float mouseX;
uniform float mouseY;

void main() {

  vec2 screenCoordinate = -1.0 + 2.0 * vUv;
  float animationTime = (time / 1000.0) * 40.0;
  float scale = 1.0 / 40.0;

  float xCoord = (380.0 * (screenCoordinate.x * 0.5 + 0.5));
  float yCoord = (380.0 * (screenCoordinate.y * 0.5 + 0.5));
  // The power of the spiral is inversely proportional to the scroll progress.
  // This means that the spiral will be less tightly wound as the user scrolls.
  // We use logScrollProgress because it is a better representation of the
  // scroll progress. It is a value between 0 and 1, and it is 0 when the user
  // is at the top of the page and 1 when the user is at the bottom of the page.
  float logScrollProgress = log(1.0 + scrollProgress) / log(15.0);
  float spiralPower = 1.0 - smoothstep(0.0, 1.0, logScrollProgress);

  float intensity = 200.0 + sin(xCoord * scale + animationTime / 150.0) * 20.0;
  float distance = 140.0 + cos(yCoord * scale / 2.0) * 18.0 + cos(xCoord * scale) * 7.0;

  float radius = sqrt(pow(abs(intensity - xCoord), spiralPower * 2.0) + pow(abs(distance - yCoord), spiralPower * 2.0));
  float angle = yCoord / radius;

  xCoord = (radius * cos(angle)) - animationTime / 2.0;
  yCoord = (radius * sin(angle)) - animationTime / 2.0;

  distance = sin(xCoord  * scale) * 176.0 + sin(xCoord * scale) * 164.0 + radius;

  float height = ((yCoord + distance) + animationTime / 2.0) * scale;

  intensity = cos(height + radius * screenCoordinate.x / 1.3) * (xCoord + xCoord + animationTime) + cos(angle * scale * 6.0) * (radius + height / 3.0);

  height = sin(yCoord * scale) * 144.0 - sin(xCoord * scale) * 212.0 * screenCoordinate.x;
  height = (height + (yCoord - xCoord) * angle + sin(radius - (animationTime + height) / 7.0) * 10.0 + intensity / 4.0) * scale;

  intensity += cos(height * 2.3 * sin(animationTime / 350.0 - angle))
  * 184.0
  * sin(angle - (radius * 4.3 + animationTime / 12.0) * scale)
  + tan(radius * scale + height)
  * 184.0
  * cos(radius * scale + height);
  intensity = mod(intensity / 5.6, 256.0) / 64.0;

  if(intensity < 0.0)
    intensity += 4.0;

  if(intensity >= 2.0)
    intensity = 4.0 - intensity;

  distance = radius / 350.0;
  distance += sin(distance * distance * 8.0) * 0.52;

  yCoord = (sin(animationTime * scale) + 1.0) / 2.0;
  gl_FragColor = vec4(
    vec3(
      yCoord * intensity / 1.6 ,
      intensity / 2.0 + distance / 13.0,
      intensity)
      * distance
      * screenCoordinate.x
      + vec3(
        intensity / 1.3 + distance / 8.0,
        intensity / 2.0 + distance / 18.0,
        intensity)
        * distance * (1.0 - screenCoordinate.x), 1.0);
}`

async function initialize() {
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  const scene = new THREE.Scene()

  const vortexGeo = new THREE.PlaneGeometry(2, 2)

  const uniforms = {
    time: { value: 1.0 },
    scrollProgress: {
      value: 0,
    },
  }

  const vortexMat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
  })

  const vortexMesh = new THREE.Mesh(vortexGeo, vortexMat)

  scene.add(vortexMesh)

  const renderer = new THREE.WebGLRenderer({
    stencil: false,
    precision: 'highp',
    depth: false,
    powerPreference: 'high-performance',
  })

  const rendererContext = renderer.getContext()

  const asciiOptions = createDefaultOptions()
  const canvas = document.getElementById('demo')
  const asciify = new Asciify(canvas, asciiOptions)

  // Expose asciify to the window for debugging
  window.asciify = asciify
  // document.body.appendChild(renderer.domElement)

  asciify.setSize(window.innerWidth, window.innerHeight, renderer)

  camera.aspect = canvas.clientWidth / canvas.clientHeight

  const onOptionChange = () => {
    cancelAnimationFrame(animationFrame)
    asciify.setOptions(asciiOptions)
    asciify.applySizeTo(renderer)

    animate()
  }

  const gui = new AsciifyGUI(asciiOptions, onOptionChange)
  gui.domElement.classList.add('fixed', 'top', 'right')

  const onWindowResize = () => {
    cancelAnimationFrame(animationFrame)
    asciify.setSize(window.innerWidth, window.innerHeight, renderer)

    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    animate()
  }

  window.addEventListener('resize', onWindowResize)

  const stats = new Stats()
  stats.dom.style.left = 'auto'
  stats.dom.style.top = 'auto'
  stats.dom.style.right = '0'
  stats.dom.style.bottom = '0'
  stats.showPanel(0)
  document.body.appendChild(stats.dom)

  // Animation
  let animationFrame = -1
  const animate = (now) => {
    stats.begin()

    vortexMat.uniforms.time.value = now

    renderer.render(scene, camera)
    asciify.rasterizeWebGLRenderer(renderer, rendererContext)
    stats.end()

    animationFrame = requestAnimationFrame(animate)
  }

  document.body.appendChild(gui.domElement)

  animate(performance.now())
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize)
} else {
  initialize()
}
