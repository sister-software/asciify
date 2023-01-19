# What is Asciify?

**Asciify** is a small library for converting images, videos, and 3D renders into _rasterized_ ASCII art.

[![npm (scoped)](https://img.shields.io/npm/v/@sister.software/asciify)](https://www.npmjs.com/package/@sister.software/asciify)
[![deno module](https://shield.deno.dev/x/asciify)](https://deno.land/x/asciify)
![npm](https://img.shields.io/npm/dm/@sister.software/asciify)

- [**Live Demo**](https://sister.software)
- [API Documentation](https://github.com/sister-software/asciify/wiki)
- [Source Code](https://github.com/sister-software/asciify)

## Why use Asciify?

### 🏃‍♀️ Fast

Asciify rasterizes directly to a canvas element, so it's much faster than other libraries that use the DOM to render text nodes. This comes at the cost of an actual textual representation, but if you're looking for a fast way to convert 3D animations to ASCII art, Asciify is a perfect fit.

### 🔍 Small

weighing in at less than 3.5kb minified and gzipped, Asciify is a single file with no dependencies.

### 🤸‍♀️ Flexible

Asciify can rasterize images, videos, and 3D scenes. Anything that can be rendered to a canvas can be converted to ASCII art.

## Installation

### NPM

```bash
yarn add @sister.software/asciify
# or
npm install --save @sister.software/asciify
```

### Deno

```ts
import { Asciify } from 'https://deno.land/x/asciify/mod.ts'
```

## Usage

```ts
import { Asciify, readFromThreeJS } from '@sister.software/asciify'

// Create an Asciify instance and attach it to a canvas...
const canvas = document.createElement('canvas')
const asciify = new Asciify(canvas)

const renderer = new THREE.WebGLRenderer()

asciify.setSize(window.innerWidth, window.innerHeight)
// Set the size of the 3D renderer so that each pixel of ASCII art
// corresponds to a single pixel in the 3D scene...
renderer.setSize(rasterizer.columnCount, rasterizer.rowCount)

// Render a 3D scene...
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
renderer.render(scene, camera)

// Extract the rendered pixels from the canvas...
const rgbaBuffer = readFromThreeJS(renderer)
// ...and convert them to ASCII art!
asciify.rasterize(rgbaBuffer)
```

## Alternatives

- [Three.js's ASCII Effect](https://threejs.org/examples/?q=ascii#webgl_effects_ascii) - A Three.js effect that converts a 3D scene into ASCII art. Significantly slower than Asciify, but more flexible if you're already using Three.js and need text output.
- [JSASCII](https://github.com/hassadee/jsascii) - A JavaScript library for converting images into text based ASCII art. Slow, but has a lot of flexibility.

# License

Asciify is licensed under the [MIT License](https://opensource.org/licenses/MIT). If you use Asciify in your project, let us know at [@SisterSoftware](https://twitter.com/SisterSoftware)! We would love to see what you're working on.
