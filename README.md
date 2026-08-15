<h1 align="center">Asciify</h1>

<p align="center"><strong>Converts images, videos, and 3D renders into rasterized ASCII art.</strong></p>

<p align="center">
  <a href="https://www.npmjs.com/package/@sister.software/asciify"><img alt="npm version" src="https://img.shields.io/npm/v/@sister.software/asciify"></a>
  <a href="https://deno.land/x/asciify"><img alt="deno module" src="https://shield.deno.dev/x/asciify"></a>
  <img alt="npm downloads" src="https://img.shields.io/npm/dm/@sister.software/asciify">
  <img alt="license" src="https://img.shields.io/github/license/sister-software/asciify">
</p>

<p align="center">
  <a href="https://asciify.sister.software/demo/spiral/"><strong>Spiral shader demo</strong></a> ·
  <a href="https://asciify.sister.software/demo/3d/">Bouncing ball demo</a> ·
  <a href="https://asciify.sister.software/demo/image/">Image upload demo</a>
</p>

Asciify draws character sprites onto a canvas rather than emitting text nodes, so a full frame costs one WebGL draw call: around 0.3 ms at 4K, with no per-character work on the CPU. Where WebGL2 is missing it falls back to a Canvas2D rasterizer automatically, and a separate terminal renderer rasterizes to ANSI escapes for Node. Zero dependencies; the browser renderers are about 8 kB gzipped and the terminal renderer about 3 kB.

Anything that reaches a canvas can be asciified: images, video frames, WebGL scenes, or raw RGBA buffers. Character sets, fonts, contrast, and color are all configurable. The API is documented inline; every export carries TSDoc, so your editor is the reference.

## Installation

```bash
yarn add @sister.software/asciify
# or
npm install --save @sister.software/asciify
```

Or with Deno:

```ts
import { createAsciify } from "https://deno.land/x/asciify/index.ts"
```

## Usage

`createAsciify` attaches a renderer to your output canvas, preferring WebGL and falling back to Canvas2D on its own:

```ts
import { createAsciify } from "@sister.software/asciify"

const canvas = document.createElement("canvas")
const asciify = createAsciify(canvas)

asciify.setSize(window.innerWidth, window.innerHeight)
await asciify.rasterizeImage(myImageElement)
```

For 3D content, size the source so one scene pixel becomes one character. Passing the renderer as the third argument to `setSize` keeps the two in sync:

```ts
const renderer = new THREE.WebGLRenderer({
	powerPreference: "high-performance",
	precision: "lowp",
})

asciify.setSize(window.innerWidth, window.innerHeight, renderer)

renderer.render(scene, camera)
asciify.rasterizeWebGLRenderer(renderer)
```

## Choosing a renderer

`createAsciify` handles this for you, but each renderer is exported if you want it directly.

| Renderer       | When                                                                                                                                                                         |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AsciifyWebGL` | The default. One draw call per frame; cost is independent of how many characters you're drawing.                                                                             |
| `Asciify2D`    | Automatic fallback when WebGL2 is missing. Also the one to pick if you need a 2D context on the output canvas yourself, since a WebGL context claims the canvas exclusively. |
| `AsciifyPass`  | You already have a WebGL2 context and want asciify to render inside it, sampling a texture you already hold. Skips the per-frame source upload.                              |

Pass a preference if you need to force one:

```ts
createAsciify(canvas, { renderer: "2d" }) // "auto" (default) | "webgl" | "2d"
```

All three produce byte-identical output; the test suite pixel-diffs them against each other on every run. Timings below use a 1×1 `readPixels` to drain the GPU, since `requestAnimationFrame` is vsync-bound and flattens every measurement to the frame interval:

| Output      | Grid    | `Asciify2D` | `AsciifyWebGL` | `AsciifyPass` |
| ----------- | ------- | ----------- | -------------- | ------------- |
| 3840 × 2160 | 160×90  | 22.0 ms     | 0.35 ms        | 0.31 ms       |
| 1920 × 1080 | 240×135 | 45.7 ms     | 0.31 ms        | 0.15 ms       |
| 1280 × 720  | 160×90  | 21.5 ms     | 0.31 ms        | 0.16 ms       |

Renderer choice is about the output canvas, never the source: there is no input type for which `Asciify2D` is faster.

### Three.js post-processing

If you're already running an `EffectComposer`, asciify can be the last pass in the chain. `AsciifyComposerPass` duck-types Three's `Pass` protocol, so nothing from Three is imported and the package stays dependency-free:

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

## In the terminal

`@sister.software/asciify/tui` is a separate entry point that rasterizes to ANSI escapes instead of a canvas. It ships DOM-free type declarations, so Node projects can use it without a `dom` lib.

```ts
import { AsciifyTerminal } from "@sister.software/asciify/tui"

const asciify = new AsciifyTerminal(process.stdout)

// The source renders at one pixel per braille dot: 2 wide and 4 tall per cell.
const frame = new Uint8ClampedArray(asciify.sourceWidth * asciify.sourceHeight * 4)

// ...fill the buffer with RGBA pixels, then:
asciify.rasterize(frame)
```

What you get:

- **Braille rendering.** Each character cell covers 2×4 source pixels, Bayer-dithered into the Unicode braille block, which multiplies the terminal's effective resolution by eight. A `glyph` mode maps one pixel per cell through the same luminance-to-character table the canvas renderers use.
- **Damage diffing.** Frames are diffed cell by cell against what was last written, and only changed spans go down the wire. An unchanged frame writes zero bytes, which matters over SSH. The `ansi256` color depth trades fidelity for even smaller frames; `truecolor` is the default.
- **Pane addressing.** Every write is cursor-addressed relative to a configurable origin, so the renderer can draw inside a region it doesn't own (an Ink box, a split) and never touches cells outside its grid. `setCell` and `flush` are public for placing labels and cursors directly.
- **Synchronized output.** Frames are bracketed in DEC mode 2026 so capable emulators present them atomically. Terminals that don't support it ignore the brackets.

The output target is structural (`{ columns, rows, write }`), so `process.stdout`, an xterm.js terminal, or a test sink all work. Anything that produces RGBA can feed it, including `readPixels` from a WebGL scene; `rasterize(buffer, true)` handles the row flip.

## Demos

The browser demos are live at [asciify.sister.software](https://asciify.sister.software): a [spiral fragment shader](https://asciify.sister.software/demo/spiral/), a [bouncing 3D ball](https://asciify.sister.software/demo/3d/), and an [image uploader](https://asciify.sister.software/demo/image/). Each takes `?renderer=webgl` or `?renderer=2d` to force a backend.

The terminal demos live in [`demo/tui`](./demo/tui/) and run from a clone (`yarn compile` first):

```bash
node demo/tui/spiral.mjs   # the spiral shader, ported to CPU JavaScript
node demo/tui/ball.mjs     # Amiga Boing homage; a showcase for the damage diff
node demo/tui/3d.mjs       # the bouncing ball scene as a CPU raytrace, with keyboard orbit
node demo/tui/3d-gpu.mjs   # the same scene rendered by Three.js in headless Chromium
```

## Alternatives

- [Three.js's ASCII Effect](https://threejs.org/examples/?q=ascii#webgl_effects_ascii) converts a 3D scene into ASCII text nodes. Slower than Asciify, but the right choice if you need selectable text output.
- [JSASCII](https://github.com/hassadee/jsascii) converts images into text-based ASCII art. Slow, but flexible.

## License

Asciify is licensed under the [MIT License](https://opensource.org/licenses/MIT). If you build something with it, let us know at [@SisterSoftware](https://twitter.com/SisterSoftware).
