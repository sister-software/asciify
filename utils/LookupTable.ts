/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 */

/**
 * Precalculated canvas coordinates for every character cell in the grid.
 *
 * @remarks
 *   Cells are addressed by a flat index, `row * columnCount + column`, and the two arrays give the top-left corner of
 *   that cell on the output canvas. Precomputing them keeps the rasterization loop free of multiplication and, more
 *   importantly, free of per-cell allocation. Previous versions also carried an RGBA "pixel index" that mapped a cursor
 *   position to a byte offset in the frame buffer. That table only ever contained `table[i] === i`, so the indirection
 *   has been removed in favour of walking the buffer directly.
 * @category Utility
 * @internal
 */
export class LookupTable {
	/**
	 * The canvas x coordinate of each cell, indexed by flat cell index.
	 */
	public readonly xs: Uint16Array

	/**
	 * The canvas y coordinate of each cell, indexed by flat cell index.
	 */
	public readonly ys: Uint16Array

	/**
	 * The number of cells in the grid, i.e. `rowCount * columnCount`.
	 */
	public readonly cellCount: number

	public rowCount: number
	public columnCount: number

	constructor(rowCount: number, columnCount: number, characterSize: number, pixelRatio: number) {
		this.rowCount = rowCount
		this.columnCount = columnCount

		const cellCount = rowCount * columnCount
		const step = characterSize * pixelRatio

		const xs = new Uint16Array(cellCount)
		const ys = new Uint16Array(cellCount)

		for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
			const y = rowIndex * step

			for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
				const cellIndex = rowIndex * columnCount + columnIndex

				xs[cellIndex] = columnIndex * step
				ys[cellIndex] = y
			}
		}

		this.xs = xs
		this.ys = ys
		this.cellCount = cellCount
	}

	get length(): number {
		return this.cellCount
	}
}
