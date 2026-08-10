/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 * @fileoverview
 * The Canvas2D asciify renderer.
 * @see {@link https://sister.software/asciify API documentation}
 * @module @sister.software/asciify
 */

import type { Asciify } from "./Asciify.ts"
import { AsciifyBase } from "./AsciifyBase.ts"
import type { AsciifyOptions } from "./options/common.ts"
import {
	type Canvas2dContextLike,
	type CanvasLike,
	createCanvasLike,
	isCanvasLike,
	pluck2dContext,
} from "./utils/canvas.ts"
import { LookupTable } from "./utils/LookupTable.ts"
import type { FrameBuffer } from "./utils/readers.ts"
import { TextureCache } from "./utils/TextureCache.ts"

/**
 * Converts images, videos, and 3D renders into ASCII art using the Canvas2D API.
 *
 * @remarks
 *   Rasterization runs in two passes. The first stamps every character cell into a full-size mask canvas with **no
 *   context state changes at all** — that is the whole design, since flipping `globalCompositeOperation` or assigning
 *   `fillStyle` per cell costs far more than the draw itself. The second pass paints the colour as a single
 *   nearest-neighbour upscale of a `columnCount` x `rowCount` surface, applies the mask with one `destination-in`, and
 *   slides the background underneath with one `destination-over`. Prefer this renderer when you need a 2D context, an
 *   `OffscreenCanvas`, or the broadest possible support. Prefer {@linkcode AsciifyWebGL} when throughput matters more.
 *
 *   ```ts
 *   const outputCanvas = document.createElement("canvas")
 *   const asciify = new Asciify2D(outputCanvas)
 *   asciify.setSize(window.innerWidth, window.innerHeight)
 *   await asciify.rasterizeImage(image)
 *   ```
 *
 * @category Main
 * @see {@link https://sister.software/asciify API documentation}
 */
export class Asciify2D extends AsciifyBase implements Asciify {
	/**
	 * The canvas context where ASCII art is rasterized to.
	 */
	public ctx: Canvas2dContextLike

	protected _textureCache!: TextureCache

	/**
	 * Precalculated canvas coordinates for every character cell.
	 *
	 * @internal
	 */
	protected _lookupTable!: LookupTable

	/**
	 * A full-size canvas holding the current frame's glyph coverage.
	 *
	 * @internal
	 */
	protected _maskCtx!: Canvas2dContextLike

	/**
	 * A `columnCount` x `rowCount` canvas holding the current frame's pixel data, scaled up at composite time.
	 *
	 * @internal
	 */
	protected _colorCtx!: Canvas2dContextLike

	constructor(
		/**
		 * The canvas where the ASCII art will be rendered to. This can either be a canvas element or a canvas's 2D context.
		 *
		 * @optional
		 */
		outputCanvas: CanvasLike | Canvas2dContextLike = createCanvasLike("canvas"),
		/**
		 * Options to use when rendering the ASCII art.
		 *
		 * @optional
		 */
		options: Partial<AsciifyOptions> = {}
	) {
		super(AsciifyBase._resolveCanvas(outputCanvas))

		this.ctx = isCanvasLike(outputCanvas)
			? (outputCanvas.getContext("2d", { desynchronized: true }) as CanvasRenderingContext2D)
			: outputCanvas

		// Class fields are initialized by the time we reach here, so it is safe to build derived state.
		this.setOptions(options)
	}

	/**
	 * Renders a given RGBA buffer to the ASCII art canvas.
	 *
	 * @category Rasterization
	 */
	public rasterize(nextFrameBuffer: FrameBuffer, flipY = false): void {
		const { columnCount, rowCount, ctx } = this
		const { xs, ys } = this._lookupTable
		const textures = this._textureCache
		const blank = this._textureCache.blank
		const textureWidth = this._textureMetrics.width
		const textureHeight = this._textureMetrics.height
		const canvasWidth = this.canvas.width
		const canvasHeight = this.canvas.height
		const maskCtx = this._maskCtx

		// -- Pass one: stamp every glyph into the mask. -----------------------------------------
		// Nothing in this loop touches context state, which is the whole point.
		maskCtx.clearRect(0, 0, canvasWidth, canvasHeight)

		for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
			// Screen rows always run top-to-bottom; only the row we read from the buffer flips.
			const sourceRow = flipY ? rowCount - 1 - rowIndex : rowIndex

			let byteIndex = sourceRow * columnCount * 4
			let cellIndex = rowIndex * columnCount

			for (let columnIndex = 0; columnIndex < columnCount; columnIndex++, byteIndex += 4, cellIndex++) {
				const red = nextFrameBuffer[byteIndex]!
				const green = nextFrameBuffer[byteIndex + 1]!
				const blue = nextFrameBuffer[byteIndex + 2]!

				// Approximate of luminance. See https://en.wikipedia.org/wiki/Relative_luminance
				// This gives us a number between 0 and 255.
				const luminance = (red + red + red + blue + green + green + green + green) >> 3

				// Whitespace contributes nothing to the mask, so skip the draw entirely.
				if (blank[luminance]) continue

				maskCtx.drawImage(textures[luminance]!, xs[cellIndex]!, ys[cellIndex]!, textureWidth, textureHeight)
			}
		}

		// -- Pass two: paint the colour, then punch the glyphs out of it. -----------------------
		if (this.options.colorize) {
			this._colorCtx.putImageData(new ImageData(nextFrameBuffer, columnCount, rowCount), 0, 0)

			// The colour must be upscaled onto the *grid*, not the canvas. The canvas is rarely an
			// exact multiple of the cell size, and stretching `columnCount` pixels across the full
			// width shears the colour against the glyph grid — by a whole cell at the far edge,
			// which reads as every character wearing its neighbour's colour.
			const cellSize = this._characterSize * this.options.pixelRatio
			const gridWidth = columnCount * cellSize
			const gridHeight = rowCount * cellSize

			// `copy` replaces the canvas outright, so the previous frame needs no separate clear,
			// and the leftover strip past the grid is left transparent for the background.
			ctx.globalCompositeOperation = "copy"
			// Nearest-neighbour, so one source pixel becomes one flat character cell.
			ctx.imageSmoothingEnabled = false

			if (flipY) {
				// Anchored to the grid, not the canvas, for the same reason.
				ctx.setTransform(1, 0, 0, -1, 0, gridHeight)
			}

			ctx.drawImage(this._colorCtx.canvas, 0, 0, columnCount, rowCount, 0, 0, gridWidth, gridHeight)

			if (flipY) {
				ctx.setTransform(1, 0, 0, 1, 0, 0)
			}
		} else {
			ctx.globalCompositeOperation = "copy"
			ctx.fillStyle = "white"
			ctx.fillRect(0, 0, canvasWidth, canvasHeight)
		}

		ctx.globalCompositeOperation = "destination-in"
		ctx.drawImage(maskCtx.canvas, 0, 0)

		// Finally, slide the background in underneath what survived.
		ctx.globalCompositeOperation = "destination-over"
		ctx.fillStyle = this.options.backgroundColor
		ctx.fillRect(0, 0, canvasWidth, canvasHeight)

		ctx.globalCompositeOperation = "source-over"
	}

	/**
	 * Clears the canvas. Asciify will automatically handle this for you in most cases.
	 */
	public clearCanvas(): void {
		const { backgroundColor } = this.options

		this.ctx.globalCompositeOperation = "source-over"
		this.ctx.fillStyle = backgroundColor
		this._scratchCtx.fillStyle = backgroundColor

		this._scratchCtx.fillRect(0, 0, this._scratchCtx.canvas.width, this._scratchCtx.canvas.height)
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
		this._maskCtx.clearRect(0, 0, this._maskCtx.canvas.width, this._maskCtx.canvas.height)

		this._applyCanvasStyles()
	}

	/**
	 * @internal
	 */
	protected _onOptionsChanged(): void {
		const { fontFamily, debug } = this.options

		this._textureCache = new TextureCache(this._luminanceCodeMap, this._textureMetrics, fontFamily, debug)

		// Both of these are internal compositing surfaces. The mask must keep its alpha channel, and
		// the colour surface is read back by `drawImage` rather than `getImageData`.
		this._maskCtx ??= pluck2dContext(createCanvasLike(), { alpha: true })
		this._colorCtx ??= pluck2dContext(createCanvasLike(), { alpha: true })
	}

	/**
	 * @internal
	 */
	protected _onResize(): void {
		const { fontSize, fontFamily, pixelRatio } = this.options

		this.ctx.font = `${fontSize * pixelRatio}px ${fontFamily}`

		this._lookupTable = new LookupTable(this.rowCount, this.columnCount, this._characterSize, pixelRatio)

		// The mask is composited 1:1 over the output, so it tracks the output's dimensions.
		this._maskCtx.canvas.width = this.canvas.width
		this._maskCtx.canvas.height = this.canvas.height

		// The colour surface is one pixel per character cell, scaled up at composite time.
		this._colorCtx.canvas.width = this.columnCount
		this._colorCtx.canvas.height = this.rowCount
	}
}
