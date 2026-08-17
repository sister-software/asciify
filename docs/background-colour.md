# Per-cell background colour in `AsciifyTerminal`

`tui/AsciifyTerminal.ts` previously emitted foreground escapes only (`38;2` / `38;5`), so a consumer had no
way to paint a cell that carried no ink — which is exactly the cell where a background matters most (sky,
water, an empty status region). This adds a fourth per-cell channel: background colour.

## Design

**A fourth cell buffer.** `_cellBackgrounds` and `_previousBackgrounds` are `Uint32Array`s allocated
alongside `_cellChars`/`_cellColors` and `_previousChars`/`_previousColors` in `setSize()`, and reset the
same way in `clear()`.

**The sentinel.** A packed canonical colour occupies bits 0–23 (`truecolor` packs 8-bit RGB into 24 bits;
`ansi256` never exceeds index 255), so `0` is a legitimate colour — black — and can't double as "no
background set": a cell explicitly painted black would be indistinguishable from a cell nobody ever
touched. `NO_BACKGROUND = 0x01_00_00_00` sits one bit above the packed range, so no canonical colour can
ever collide with it. It's exported (documented with the rationale above) so consumers can pass it to
`fillBackground()` to clear.

**`setCell()` gained an optional fifth parameter**, `background?: readonly [r, g, b]`, appended after the
existing `color` parameter — the old four-argument call shape still works unchanged. It's canonicalised
through the same `_canonicalColor()` path as the foreground, so `ansi256` quantisation applies to both.
Unlike `color` (which defaults to white when omitted), omitting `background` **leaves the cell's existing
background untouched** rather than writing a default — the same choice the rasterizers make, so a
background set once persists through later overlay calls that don't mention it.

**`fillBackground(background)`** sets every cell's background in one call — the common case of painting a
uniform sky or body of water once rather than per frame. It accepts an RGB tuple, `NO_BACKGROUND`, or
`null` (the latter two are equivalent and clear every cell).

**`setCellBackground(column, row, background)`** was added in a follow-up round, once designing an actual
consumer (a sky above a waterline, water below it) surfaced the gap: `setCell()` writes a character, so it
can't be used to paint a region's background over an already-composited frame without destroying the
glyphs in it, and `fillBackground()` is whole-grid. This is the per-cell primitive that composes into
either region — the natural companion to `setCell` at the same granularity. It mirrors `setCell`'s
conventions exactly: the same bounds check that silently clips out-of-range coordinates, and the same
`_canonicalColor` path so `ansi256` quantisation applies. Its parameter type matches `fillBackground`'s —
`readonly [r, g, b] | typeof NO_BACKGROUND | null` — rather than inventing a third shape, so it's also the
answer to the single-cell-clear gap noted below: passing `NO_BACKGROUND` or `null` clears exactly one cell,
which nothing could do before. The sentinel-folding logic itself (`null`/`NO_BACKGROUND` → `NO_BACKGROUND`,
otherwise canonicalise) is factored into one shared `_canonicalBackground()` helper that both
`setCellBackground` and `fillBackground` call, so "what counts as clearing" is decided in exactly one place.

**The rasterizers don't touch backgrounds.** `_computeBrailleCells` and `_computeGlyphCells` still write
only `_cellChars`/`_cellColors`. This is documented on the `_cellBackgrounds` field and in the class-level
remarks: a background set via `fillBackground`/`setCell` survives every subsequent `rasterize()` call until
something explicitly changes it.

**`clear()`** now fills `_cellBackgrounds` and `_previousBackgrounds` with `NO_BACKGROUND`, consistent with
how it already resets chars to `SPACE` and colours to `0`.

## The emitter (`_emitDamage`)

Three changes, all in `_emitDamage`:

1. **Damage detection now compares backgrounds too** — both the seek `while` loop and the span-extension
   `for` loop check `backgrounds[i] !== previousBackgrounds[i]` alongside chars and colours. Without this,
   a cell whose only change is its background is invisible to the diff and never repaints.
2. **Background is emitted regardless of inkiness.** The existing `inkless` check (`char === SPACE ||
char === BRAILLE_BLANK`) still guards the _foreground_ escape, but the new background escape is gated
   only on `colorDepth !== "none"` and `background !== activeBackground` — an inkless cell is exactly where
   a background is visible.
3. **`activeBackground`** tracks the background SGR state the way `activeColor` tracks foreground, but
   initialises to `NO_BACKGROUND` rather than `-1`. Every payload already ends in `SGR_RESET`, so the
   terminal genuinely is back at its default background when a new frame begins — starting the tracker at
   the sentinel means a consumer who never sets a background gets byte-identical output to before this
   change, because the background branch's condition (`background !== activeBackground`) is `NO_BACKGROUND
!== NO_BACKGROUND`, always false, for every cell, forever.

**`_backgroundEscape(canonicalBackground)`** mirrors `_colorEscape`: `48;2;r;g;b` for truecolor, `48;5;n`
for ansi256, nothing under `colorDepth: "none"`, and `NO_BACKGROUND` emits `49` (SGR's own "default
background") so a region can hand control back to the terminal's own background mid-frame.

## Tests

Nine tests in a `describe("AsciifyTerminal background", …)` block, plus four more in a follow-up
`describe("AsciifyTerminal setCellBackground", …)` block, both in `test/tui.test.ts`, following the
existing harness/`StringSink` conventions. All 36 tests in that file pass, and the full suite is 92/92.

- **Byte-identical regression** (the one that matters most): reruns the existing "addresses only the
  damaged span on a single-cell change" scene at the _default_ (truecolor) colour depth instead of `none`
  — deliberately the path where a stray background escape would most likely leak in — and asserts the
  exact literal `"\u001B[3;6H\u001B[38;2;255;255;255m⣿\u001B[0m"`, hand-traced from the unmodified
  algorithm, not generated by calling the new code. It also re-asserts the existing glyph/contrast-ratio
  scene's exact literal under `colorDepth: "none"` as a second deterministic case.
- `48;2` under truecolor, `48;5` under ansi256 (computed via the existing `quantizeToAnsi256` helper, not
  duplicated by hand), nothing under `none`.
- A space (`" "`, inkless) given a background paints it: `"\u001B[1;1H\u001B[48;2;10;20;30m \u001B[0m"`.
- A cell whose only change between frames is its background does repaint (hand-traced literal).
- Returning a cell to the sentinel mid-span emits `49` (a two-cell case where the first cell sets a real
  background and the second, left unset, must hand control back).
- `fillBackground` paints every cell in one escape (the tracker spans the whole frame, not per row) and
  the sentinel — via both `NO_BACKGROUND` and `null` — clears it, with a follow-up unchanged-frame flush
  proving the clear stuck (writes zero bytes).
- A background survives an intervening `rasterize()` call with no further background call, proving the
  rasterizers really do leave `_cellBackgrounds` alone.

`setCellBackground` gets its own four, added in the follow-up round:

- Setting a background doesn't disturb an existing character or foreground: paint a cell with `setCell`,
  flush, then call `setCellBackground` alone and assert the exact literal — the `@` and its foreground
  colour from the earlier `setCell` call are still in the output untouched.
- Clearing a single cell back to the terminal default via both `NO_BACKGROUND` and `null` in the same test,
  each on its own cell, asserting both net out identical to a third, never-touched cell.
- Clipping out-of-range coordinates (negative column, column at/past `columnCount`, row past `rowCount`)
  instead of throwing, mirroring `setCell`'s own clipping test exactly.
- A cell changed only via `setCellBackground` repaints on the next flush.

### Discriminating-mutation evidence

Per the task, I broke each safeguard in turn, confirmed the relevant test(s) went red, then reverted from a
saved golden copy of the file (verified byte-identical via `diff` after each revert).

**Mutation 1 — dropped `backgrounds`/`previousBackgrounds` from both the seek and span-extension
comparisons in `_emitDamage`** (reverting just those two comparisons to chars+colours only, leaving
tracking/emission intact):

```
❯ repaints a cell whose only change between frames is its background
  AssertionError: expected '' to be '\u001B[1;4H\u001B[48;2;0;0;255m\u001B…'
❯ fillBackground paints every cell, and the sentinel clears it
  AssertionError: expected '' to contain '\u001B[48;2;50;60;70m'
❯ clears via null the same way it clears via the sentinel
  AssertionError: expected '' not to be ''
```

3 failed / 7 passed / 22 skipped — a background-only change now silently produces zero bytes, exactly the
failure mode the spec warned about.

**Mutation 2 — restored the inkless skip over the background emission guard**
(`if (!inkless && colorDepth !== "none" && background !== activeBackground)`):

```
❯ paints the background of an inkless cell
  Expected: "\u001B[1;1H\u001B[48;2;10;20;30m \u001B[0m"
  Received: "\u001B[1;1H \u001B[0m"
❯ fillBackground paints every cell, and the sentinel clears it
  AssertionError: expected '...⠀⠀⠀\u001B[2;1H⠀⠀⠀\u001B[0m' to contain '\u001B[48;2;50;60;70m'
```

2 failed / 8 passed / 22 skipped — the space silently stopped painting its background, confirming the
inkless guard must stay scoped to foreground only.

Both mutations reverted; `tui/AsciifyTerminal.ts` diffed byte-identical against the golden copy afterward,
and the full suite (`yarn test`) was back to 88/88 (the count from that round; see below for the follow-up
round's counts).

**Mutation 3 (follow-up round) — made `setCellBackground` also overwrite the cell's character**
(`this._cellChars[cellIndex] = SPACE` added alongside the background write, to prove the "does not disturb"
test actually discriminates):

```
❯ sets a background without disturbing an existing character or foreground
  Expected: "\u001B[1;1H\u001B[48;2;10;20;30m\u001B[38;2;200;201;202m@\u001B[0m"
  Received: "\u001B[1;1H\u001B[48;2;10;20;30m \u001B[0m"
❯ clears a single cell back to the terminal default via NO_BACKGROUND or null
  Expected: "\u001B[1;1H\u001B[38;2;255;255;255m@@@\u001B[0m"
  Received: "\u001B[1;1H  \u001B[38;2;255;255;255m@\u001B[0m"
```

2 failed / 2 passed / 32 skipped — the `@` silently turned into a space, confirming the "does not disturb"
test (and, as a bonus, the "clears" test too, since it also depends on the character surviving) catches a
regression that writes through the character buffer. Reverted from a saved golden copy; `diff` confirmed a
byte-identical restore. Full suite back to 92/92, and the byte-identical no-background regression test was
re-run in isolation afterward and still passes.

## Concerns for a consumer upgrading from 4.2.2

- **API is additive and backward compatible.** `setCell()`'s new `background` parameter is appended after
  the existing four, so every existing call site compiles and behaves identically. `fillBackground()` and
  `NO_BACKGROUND` are new exports; nothing existing changes shape.
- **`setCell(..., background)` omission still means "leave unchanged," not "clear"** — that part of the
  original design is unchanged. But the gap this created (no way to clear, or otherwise touch, a single
  cell's background without also rewriting its character) is now closed by `setCellBackground(column, row,
background)`, added in this follow-up round: pass `NO_BACKGROUND` or `null` to clear exactly one cell.
- **`setSize()` (and therefore any resize) wipes backgrounds back to the sentinel**, the same way it
  already wipes chars/colours. A resize-driven repaint means backgrounds must be re-applied afterward, same
  as before for foreground colours.
- **The background SGR tracker resets every frame** (matching the existing foreground tracker's `-1`
  reset), not just when the value differs from the previous frame's _content_. This is correct — each
  payload ends in `SGR_RESET`, so the terminal really is back at default — but it does mean the first
  background-bearing cell of every frame always costs an escape, even if it's identical to what was
  visually on screen a moment ago.
