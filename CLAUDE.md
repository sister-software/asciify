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
yarn demo           # http-server on :8081 — serves the repo root so demos can import /out/index.js
yarn release        # compile + release-it
```

There is no test suite and no test runner. Verification is visual: `yarn compile`, then `yarn demo` and open a demo page.

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

Entry point `index.ts` re-exports `Asciify.ts`, `options/index.ts`, and `utils/index.ts`.

The hot path is `Asciify.rasterize()`. Everything else exists to make that loop cheap, so changes there are performance-sensitive. The precomputed pieces:

- **`LuminanceCharacterMap`** (`utils/`) — `Map<0..255, character>`. The character set is padded at the low end with `contrastRatio` spaces, then spread across all 256 luminance values, so luminance → character is a map lookup with no `Math.floor` at render time.
- **`TextureCache`** (`utils/`) — an `Array` subclass indexed by luminance, holding a sprite that is **opaque where the glyph covers and transparent elsewhere**, so it works directly as a `destination-in` mask. Sprites are **deduplicated by character**: 256 luminance slots typically resolve to a dozen or so glyphs, and every slot sharing a character points at the same object. That dedup is worth ~1.4x, but only once the per-cell state changes are gone — on its own it measured as noise. `blank` flags the whitespace slots so the rasterizer can skip them entirely. Sprites upgrade to `ImageBitmap` asynchronously; `initializedBitmaps` resolves when done.
- **`LookupTable`** (`utils/`) — two `Uint16Array`s giving each cell's `x`/`y` on the output canvas, indexed by `row * columnCount + column`.

`rasterize(buffer, flipY?)` runs two passes:

1. **Mask.** Walk the buffer, compute an integer luminance with bit shifts, and stamp the glyph into a full-size mask canvas. **Nothing in this loop touches context state** — that is the entire point. The previous implementation flipped `globalCompositeOperation` twice and assigned a `fillStyle` string per cell, and those state changes dominated the frame.
2. **Composite.** Paint the colour (one nearest-neighbour `drawImage` upscaling the `columnCount × rowCount` colour surface, so one source pixel becomes one flat cell), apply the mask with a single `destination-in`, then slide the background in underneath with `destination-over`.

Measured against the old per-cell approach on a 160×90 grid at 3840×2160, all cells dirty: 25.4 → 11.5 ms/frame.

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
