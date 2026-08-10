# What is Asciify?

**Asciify** is a small library for converting images, videos, and 3D renders into _rasterized_ ASCII art.

[![npm (scoped)](https://img.shields.io/npm/v/@sister.software/asciify)](https://www.npmjs.com/package/@sister.software/asciify)
[![deno module](https://shield.deno.dev/x/asciify)](https://deno.land/x/asciify)
![npm](https://img.shields.io/npm/dm/@sister.software/asciify)
![GitHub](https://img.shields.io/github/license/sister-software/asciify)

- Demos 🙌✨
  - [**Three.js Spiral Shader**](https://asciify.sister.software/demo/spiral/)
  - [**Bouncing Ball Animation**](https://asciify.sister.software/demo/3d/)
  - [**Image Upload**](https://asciify.sister.software/demo/image/)
- [Source Code](https://github.com/sister-software/asciify)

The API is documented inline — every export carries TSDoc, so your editor is the reference.

## Why use Asciify?

### 🏃‍♀️ Fast

Asciify rasterizes directly to a canvas, so it's much faster than other libraries that use the DOM to render text nodes. This comes at the cost of an actual textual representation, but if you're looking for a fast way to convert 3D animations to ASCII art, Asciify is a perfect fit.

By default it rasterizes the whole frame in a **single WebGL draw call** — around 0.3ms for a 4K output, with no per-character work on the CPU at all. Where WebGL2 isn't available it falls back to a Canvas2D rasterizer automatically, so you always get a picture.

### 🔍 Small

Weighing in at less than 7kb when minified and gzipped, Asciify is small enough to be added to your project without worrying about bloat. And Asciify has zero dependencies, so it's easy to integrate with your existing codebase.

### 🤸‍♀️ Flexible

Asciify can rasterize images, videos, and 3D scenes. Anything that can be rendered to a canvas can be converted to ASCII art. Asciify also supports custom fonts and character sets, so you can use it to create text art for any purpose!

Asciify is also written in TypeScript and includes type definitions with full documentation.

## Installation

### NPM

```bash
yarn add @sister.software/asciify
# or
npm install --save @sister.software/asciify
```

### Deno

```ts
import { createAsciify } from "https://deno.land/x/asciify/index.ts"
```

## Usage

```ts
import { createAsciify } from "@sister.software/asciify"

// Create an Asciify renderer and attach it to a canvas. This picks WebGL where it can,
// and falls back to Canvas2D where it can't.
const canvas = document.createElement("canvas")
const asciify = createAsciify(canvas)

const renderer = new THREE.WebGLRenderer({
	powerPreference: "high-performance",
	precision: "lowp",
})

asciify.setSize(window.innerWidth, window.innerHeight)
// Size the 3D renderer so that each pixel of the scene becomes one ASCII character...
renderer.setSize(asciify.columnCount, asciify.rowCount)

// Render a 3D scene...
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
renderer.render(scene, camera)

// Rasterize the scene into ASCII art!
asciify.rasterizeWebGLRenderer(renderer)
```

Images work the same way:

```ts
const asciify = createAsciify(canvas)

asciify.setSize(640, 480)
await asciify.rasterizeImage(myImageElement)
```

## Choosing a renderer

`createAsciify` handles this for you, but the pieces are exported if you want them directly.

| renderer       | when                                                                                                                                                                           |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `AsciifyWebGL` | The default. One draw call per frame; cost is independent of how many characters you're drawing.                                                                               |
| `Asciify2D`    | Automatic fallback when WebGL2 is missing. Also the one to pick if you need a 2D context on the output canvas yourself — a WebGL context claims the canvas exclusively.        |
| `AsciifyPass`  | You already have a WebGL2 context and want asciify to render inside it, sampling a texture you already hold. Skips a per-frame upload; roughly 2× the WebGL renderer at 1080p. |

Pass a preference if you need to force one:

```ts
createAsciify(canvas, { renderer: "2d" }) // "auto" (default) | "webgl" | "2d"
```

### Three.js post-processing

If you're already running an `EffectComposer`, asciify can be the last pass in the chain:

```ts
import { AsciifyComposerPass } from "@sister.software/asciify"

const composer = new EffectComposer(renderer)
composer.addPass(new RenderPass(scene, camera))

const asciiPass = new AsciifyComposerPass(renderer, { fontSize: 12 })
asciiPass.renderToScreen = true
composer.addPass(asciiPass)

// Asciify wants one source pixel per character, so the composer's buffers
// are sized to the character grid rather than to the canvas.
asciiPass.syncComposerSize(composer)
```

Check out our [examples](https://github.com/sister-software/asciify/tree/main/demo) for more info on how Asciify can be used!

## Alternatives

- [Three.js's ASCII Effect](https://threejs.org/examples/?q=ascii#webgl_effects_ascii) - A Three.js effect that converts a 3D scene into ASCII art. Significantly slower than Asciify, but more flexible if you're already using Three.js and need text output.
- [JSASCII](https://github.com/hassadee/jsascii) - A JavaScript library for converting images into text based ASCII art. Slow, but has a lot of flexibility.

# License

Asciify is licensed under the [MIT License](https://opensource.org/licenses/MIT). If you use Asciify in your project, let us know at [@SisterSoftware](https://twitter.com/SisterSoftware)! We would love to see what you're working on.
