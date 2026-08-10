# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`@sister.software/asciify` — a zero-dependency browser library that converts images, videos, and 3D (Three.js) renders into ASCII art by **rasterizing character sprites onto a canvas**, not by emitting text nodes. Published to npm and deno.land/x; the demos are served from GitHub Pages (`asciify.sister.software`).

## Commands

```bash
yarn compile        # tsc -b: typecheck + emit to ./out
yarn check-types    # typecheck only
yarn clean          # tsc -b --clean
yarn lint           # oxlint, then oxfmt --check
yarn lint:fix       # oxlint --fix, then oxfmt
yarn test           # vitest run, in a real headless Chromium
yarn test:watch     # same, in watch mode
yarn demo           # http-server on :8081 — serves the repo root so demos can import /out/index.js
yarn release        # compile + release-it
```

### Tests

`test/` runs under **Vitest browser mode** with the Playwright provider — a real headless Chromium, because everything worth testing here depends on Canvas2D and WebGL2, neither of which jsdom provides. Tests import the TypeScript sources directly through Vite, so no build step is needed first.

- `test/parity.test.ts` — the important one. Renders identical input through `Asciify2D` and `AsciifyWebGL` and asserts **zero differing pixels**, across canvas sizes that do and don't divide evenly into cells, pinned animation ticks, and each option that changes geometry. Three real bugs have been caught here.
- `test/pass-parity.test.ts` — the same treatment for `AsciifyPass`, which reaches the pixels by a completely different route (sampling a framebuffer texture in the host's context), plus a check that it never resizes the host's canvas.
- `test/orientation.test.ts` — asymmetric four-quadrant fixtures that fail on a horizontal mirror, a vertical mirror, or an off-by-one row.
- `test/glyph-resources.test.ts` — unit coverage for `LookupTable`, `LuminanceCharacterMap`, `TextureCache` dedup, and `GlyphAtlas` slotting.
- `test/create-asciify.test.ts` — renderer selection, including a mocked WebGL2-less platform to prove the fallback fires rather than rendering nothing.
- `test/composer-pass.test.ts` — **runs against a real `EffectComposer`.** `AsciifyComposerPass` agrees with Three by duck-typing rather than by importing it, so nothing else would notice Three changing its `Pass` protocol or how it attaches render targets. This suite exists to fail when that happens. It also pixel-compares the composer path against hand-driving `AsciifyPass` over the same target, which isolates the adapter from colour-management differences.

Two things to know when writing tests here:

- **Test canvases need an explicit CSS size and must be attached to the document.** `setSize` derives the backing store from `getBoundingClientRect()`, so an unsized canvas feeds its own layout size back into itself and collapses to nothing. Use `createStage()`. A CSS border also skews it, since the rect includes it.
- **Read output back in the same task as the draw.** Neither renderer preserves its drawing buffer, and a WebGL output canvas has no 2D context of its own — `readCanvas()` routes through a scratch 2D canvas.

The demos remain the visual check: `yarn compile`, then `yarn demo`. Each demo takes `?renderer=webgl` to switch backends.

Yarn 4 (`packageManager: yarn@4.18.0`) with `nodeLinker: node-modules`. Node >= 24.

### Build system

`tsc -b` against `@sister.software/tsconfig/web` with three local overrides: `emitDeclarationOnly: false` (the shared base is declaration-only), `rewriteRelativeImportExtensions: true`, and `forceConsistentCasingInFileNames`.

Source files import each other with **explicit `.ts` specifiers** (`from "./canvas.ts"`). `rewriteRelativeImportExtensions` rewrites those to `.js` on emit, so `out/` contains `index.js` + `index.d.ts` with correct runtime specifiers. Keep that convention — dropping the extension from a specifier breaks the emit.

The shared base turns on `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, and `isolatedModules`. Consequences worth knowing before editing:

- Buffer and lookup-table indexing needs `!`. Every such assertion in the hot loop is justified by a construction invariant, and the adjacent comment says which one. Don't replace them with runtime guards — that's the branch the lookup tables exist to avoid.
- Type-only imports must say `type`. This matters most for anything Three.js-adjacent: a bare `import * as THREE from "three"` is **not** elided under `verbatimModuleSyntax` and would add a runtime dependency the package doesn't ship.

### Docs

There is no docs pipeline. typedoc was removed because it **cannot run on TypeScript 7** — TS 7 no longer ships the JavaScript compiler API typedoc reaches into, its `typescript` peer dependency caps at `6.0.x`, and no override fixes it (`resolutions` doesn't apply to peers, and the node-modules linker hoists the root copy over any nested pin). If docs come back, the working approach is an isolated `yarn dlx` tree with a pinned TS 5.9 or 6.

The sources still carry full TSDoc — `@category Main | Helper | Configuration | Utility`, plus `@internal`/`@ignore` — so keep annotating exports even though nothing renders them today.

## Architecture

`createAsciify()` is the entry point callers should use: it prefers `AsciifyWebGL`, falls back to `Asciify2D` when WebGL2 is unavailable _or_ when construction fails despite the probe passing (context limits, blocklisted drivers), and takes a `renderer: "auto" | "webgl" | "2d"` preference. `isWebGL2Available()` probes on a throwaway canvas, because asking a canvas for a WebGL context commits it permanently.

`Asciify` (`Asciify.ts`) is an **interface**, not a class. Three backends implement it, all extending `AsciifyBase`:

- **`Asciify2D`** — Canvas2D. Works anywhere a 2D context does, including `OffscreenCanvas`. Far and away the slowest; it exists for environments without WebGL2, not for throughput.
- **`AsciifyWebGL`** — owns a canvas and its own WebGL2 context, one draw call per frame. Throws if WebGL2 is unavailable, and taking the context claims the output canvas (no 2D context alongside it). The default choice.
- **`AsciifyPass`** — borrows a host's WebGL2 context and samples a texture the host already holds, so nothing crosses a context boundary. Roughly 2x `AsciifyWebGL` at 1080p, converging at 4K. Constructed from a context rather than a canvas, and driven by `rasterizeTexture()`. `AsciifyComposerPass` wraps it for Three.js `EffectComposer`.

**There is no source type for which `Asciify2D` is faster.** The rasterizer cost is backend-specific and the source preparation is shared, so WebGL wins for images, buffers, and 3D alike. Renderer choice is about the _output_ canvas — whether you need a 2D context on it — not about what you're feeding in. Don't add source-sniffing heuristics; there is nothing for them to decide.

The two GL backends share `utils/GlyphProgram.ts` — the shader, the atlas and luminance textures, and the single `drawArrays`. **Keep it that way**: the GLSL living in one place is a large part of why the backends stay pixel-identical.

`AsciifyPass` is the one renderer that does not own its surface, which changes two things. `setSize()` **ignores its arguments** and derives the grid from `gl.drawingBufferWidth/Height` — it must never resize a canvas the host owns, which is what the `_surfaceWidth`/`_surfaceHeight` hooks on `AsciifyBase` exist for. And applying `pixelRatio` to the drawing buffer becomes the host's job (`renderer.setPixelRatio` in Three.js); the option still scales glyphs, so the two must agree.

Callers sharing a context need to know the pass touches the bound program, vertex array, texture units 0–2, active texture unit, and viewport. It leaves blend, depth, and framebuffer bindings alone and draws into whatever framebuffer is bound. Three.js caches GL state, so it needs `renderer.resetState()` afterwards.

Three is a devDependency and the composer suite imports it. That is the only place Three appears outside the demos — library code stays free of it.

`AsciifyComposerPass` duck-types Three's `Pass` protocol (`enabled`/`needsSwap`/`clear`/`renderToScreen`/`setSize`/`render`) without importing Three. It recovers the read buffer's `WebGLTexture` via `getFramebufferTexture()` — bind the target, then ask the framebuffer what's attached — rather than the usual `renderer.properties.get(texture).__webglTexture`, which is a private field with no compatibility promise. Multisampled targets attach a renderbuffer instead of a texture and are rejected with a message saying so. The composer's buffers must be sized to the character grid, not the canvas, which is what `syncComposerSize()` is for.

`AsciifyBase` owns everything backend-agnostic: option normalization, the grid arithmetic, the scratch canvas, and the two convenience entry points. Subclasses implement `rasterize`, `clearCanvas`, and two hooks — `_onOptionsChanged` (build glyph resources) and `_onResize` (resize surfaces).

**Subclasses must call `setOptions()` at the end of their own constructor**, never from `AsciifyBase`'s. Class fields initialize after `super()` returns, so anything the base constructor built would be clobbered by the subclass's own field declarations.

All three backends are verified **byte-identical** — same pinned input, zero differing pixels. Keep it that way: a change to one is a change to all of them. Two things that broke parity and are easy to break again:

- **The colour layer must be upscaled onto the grid (`columnCount * cellSize`), not the canvas.** The canvas is rarely an exact multiple of the cell size; stretching to the full width shears colour against glyphs, by a whole cell at the far edge.
- **Reconstruct exact bytes before quantizing luminance in GLSL** (`floor(rgb * 255.0 + 0.5)`). A normalized texel multiplied straight back by 255 lands under the integer often enough to shift luminance by one, which picks a different _character_, not a slightly different shade.

Entry point `index.ts` re-exports all of the above plus `options/index.ts` and `utils/index.ts`.

The hot path is `Asciify.rasterize()`. Everything else exists to make that loop cheap, so changes there are performance-sensitive. The precomputed pieces:

- **`LuminanceCharacterMap`** (`utils/`) — `Map<0..255, character>`. The character set is padded at the low end with `contrastRatio` spaces, then spread across all 256 luminance values, so luminance → character is a map lookup with no `Math.floor` at render time.
- **`GlyphAtlas`** (`utils/`) — the WebGL counterpart to `TextureCache`: every distinct character packed into one horizontal strip, plus a 256-entry `luminanceToSlot` table uploaded as a 256x1 texture. The table is uploaded rather than recomputed in GLSL so the contrast-ratio padding lives in exactly one place.
- **`TextureCache`** (`utils/`) — an `Array` subclass indexed by luminance, holding a sprite that is **opaque where the glyph covers and transparent elsewhere**, so it works directly as a `destination-in` mask. Sprites are **deduplicated by character**: 256 luminance slots typically resolve to a dozen or so glyphs, and every slot sharing a character points at the same object. That dedup is worth ~1.4x, but only once the per-cell state changes are gone — on its own it measured as noise. `blank` flags the whitespace slots so the rasterizer can skip them entirely. Sprites upgrade to `ImageBitmap` asynchronously; `initializedBitmaps` resolves when done.
- **`LookupTable`** (`utils/`) — two `Uint16Array`s giving each cell's `x`/`y` on the output canvas, indexed by `row * columnCount + column`.

`Asciify2D.rasterize(buffer, flipY?)` runs two passes:

1. **Mask.** Walk the buffer, compute an integer luminance with bit shifts, and stamp the glyph into a full-size mask canvas. **Nothing in this loop touches context state** — that is the entire point. The previous implementation flipped `globalCompositeOperation` twice and assigned a `fillStyle` string per cell, and those state changes dominated the frame.
2. **Composite.** Paint the colour (one nearest-neighbour `drawImage` upscaling the `columnCount × rowCount` colour surface, so one source pixel becomes one flat cell), apply the mask with a single `destination-in`, then slide the background in underneath with `destination-over`.

The GL backends have no per-cell CPU work at all: get the source onto the GPU, set uniforms, one `drawArrays`. `AsciifyWebGL.rasterizeWebGLRenderer` skips the `readPixels` round trip the 2D renderer needs, uploading the source renderer's canvas straight into a texture — with `UNPACK_COLORSPACE_CONVERSION_WEBGL` set to `NONE`, since the browser's default colour management would otherwise shift values. `AsciifyPass.rasterizeTexture` skips even that, sampling a texture the host already holds.

### Measured cost

`requestAnimationFrame` timings are worthless here — rAF is vsync-bound and flattens everything to ~8 or ~16 ms regardless of real cost. `gl.finish()` is also **not** a reliable drain of Chrome's GPU process; it reported a 3840×2160 fragment pass at 0.027 ms/frame, which would be ~300 Gpixel/s. A 1×1 `readPixels` (or `getImageData` on a 2D context) is a genuine sync — use that.

Drained numbers, all three paths producing byte-identical output:

| output      | cell | grid    | cells  | `Asciify2D` | `AsciifyWebGL` | `AsciifyPass` |
| ----------- | ---- | ------- | ------ | ----------- | -------------- | ------------- |
| 3840 × 2160 | 24px | 160×90  | 14,400 | 22.0 ms     | 0.35 ms        | 0.31 ms       |
| 1920 × 1080 | 8px  | 240×135 | 32,400 | 45.7 ms     | 0.31 ms        | 0.15 ms       |
| 1280 × 720  | 8px  | 160×90  | 14,400 | 21.5 ms     | 0.31 ms        | 0.16 ms       |

Three things fall out of that table:

- **`Asciify2D` cannot hold 60 fps at a real output size.** It scales with cell count and pays full-frame compositing on top; 22–46 ms is 1.3–2.8 whole frames. The GL backends are 60–150× faster.
- **`AsciifyWebGL` is pinned near 0.31 ms regardless of resolution or cell count.** Its cost is not fragment work — it is the fixed per-frame cost of moving the source across a context boundary.
- **`AsciifyPass` removes exactly that fixed cost**, so it wins by ~0.16 ms at 1080p and below (2.1×) and converges with `AsciifyWebGL` at 4K, where fragment work finally dominates. In absolute terms 0.16 ms is under 1% of a 60 fps budget, so pick the pass for composition into an existing render graph as much as for the speed.

Beware when measuring any of this: a benchmark that lets the paths render at different surface sizes will produce confident nonsense. An earlier revision gave two paths a CSS size of W/4 and called `setSize()` with no arguments, which re-derived their backing stores from `getBoundingClientRect()` — one path ended up doing 16× the fragment work of the others, and the resulting conclusion ("zero copy is slower") was exactly backwards. The bench now asserts grid agreement across backends and pixel-diffs their output every run.

Two consequences worth knowing:

- **There is no frame-to-frame diff any more.** The old `_frameBuffer` comparison skipped unchanged cells; the mask is rebuilt wholesale each call instead. Reintroducing a skip needs a per-cell `clearRect` in the mask, which costs an op per dirty cell — measure before assuming it wins.
- **`flipY` is a pure vertical flip**, which is what `readPixels` (bottom-up rows) actually calls for. The old `coordsFlipped` additionally mirrored horizontally and, at `pixelRatio: 1`, pushed row 0 off-canvas. Both were bugs, masked because every demo runs at `pixelRatio: 2` on roughly symmetric content.

### Sizing contract

`setSize(width, height, imageSource?)` sizes the **output** canvas in CSS pixels × `pixelRatio`, derives `columnCount`/`rowCount` from `canvas.width / (fontSize * characterSpacingRatio * pixelRatio)`, and rebuilds the lookup table and frame buffers. The **source** must then be resized to `columnCount × rowCount` — one source pixel per ASCII character. `applySizeTo()` does this and branches on whether the argument is a renderer or something merely sizable. Passing the renderer as the third argument to `setSize` is the intended way to keep them in sync.

`setOptions()` rebuilds every derived structure and calls `setSize()`, so it is safe but not cheap — it's what the demo GUI calls on every slider change.

### Three.js is structural, not a dependency

`utils/canvas.ts` declares `WebGLRendererLike` (`domElement`, `setSize`, `getContext`) and `SizableLike` (`width`, `height`). The public API is typed against those, so a real `THREE.WebGLRenderer` / `WebGLRenderTarget` satisfies it structurally with no import on either side, and the published `.d.ts` references nothing the package doesn't ship. `isWebGLRenderer` duck-types the same shape at runtime.

`three` and `@types/three` are devDependencies used **only by the demos**. Don't add a Three.js import to library code — widen the structural interface instead.

### Environment abstraction

`utils/canvas.ts` keeps the library usable outside the DOM: `CanvasLike` = `HTMLCanvasElement | OffscreenCanvas`, `Canvas2dContextLike` covers both context types, and `createCanvasLike` / `pluck2dContext` / `isHTMLCanvasElement` guard the differences. Avoid reaching for `document` or `HTMLCanvasElement` directly in library code — use these helpers.

## Demos

`demo/{3d,image,spiral}/` are plain ES-module pages with no build step. Each imports asciify via a runtime hostname check — `/out/index.js` on localhost, the esm.sh CDN copy otherwise — so **run `yarn compile` before `yarn demo`** or the local import 404s. Third-party deps come from an import map plus `es-module-shims`; those pins are maintained by hand. `demo/common/gui.mjs` wires `dat.gui` to the options object.
