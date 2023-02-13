export type CharacterCoords = Map<number, [number, number]>

export type PixelIndex = Uint32Array

/**
 * A precalculated lookup table to help us traverse the pixel buffer.
 * ```ts
 * [red1, green1, blue1, alpha1, redN, greenN, blueN, alphaN...]
 * ```
 *
 * @remarks
 *
 * By precalculating a frequent traversal through a pixel buffer,
 * we can avoid expensive and repetitive calculations while during rasterization.
 *
 * The pixel index contains groups of four values that represent the RGBA values of a pixel:
 *
 * - Red channel index
 * - Green channel index
 * - Blue channel index
 * - Alpha channel index
 *
 * The length of this array is equal to the area of the row and column counts.
 *
 * @category Utility
 * @internal
 */

export class LookupTable {
  /**
   * The lookup table used to map the RGBA buffer to the ASCII art canvas.
   */
  public readonly pixelIndex: PixelIndex
  /**
   * The lookup table used to map the RGBA buffer to the ASCII art canvas.
   * This is the same as {@linkcode pixelIndex}, but with the Y axis flipped for WebGL.
   */
  public readonly pixelIndexFlippedY: PixelIndex
  public readonly coords: CharacterCoords
  public readonly coordsFlipped: CharacterCoords

  constructor(public rowCount: number, public columnCount: number, characterHeight: number, pixelRatio: number) {
    const lookupTables = [
      new Uint32Array(rowCount * columnCount * 4),
      // We need a second buffer for the flipped Y axis.
      new Uint32Array(rowCount * columnCount * 4),
    ]

    const coordPairs: CharacterCoords[] = [new Map(), new Map()]

    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      const y = rowIndex * characterHeight * pixelRatio
      const flippedY = (rowCount - rowIndex - pixelRatio) * characterHeight * pixelRatio + characterHeight * pixelRatio

      for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
        const x = (columnCount - columnIndex - 1) * characterHeight * pixelRatio
        const xFlipped = columnIndex * characterHeight * pixelRatio

        // Times 4 because each pixel is represented by 4 grouped values in the buffer.
        const redIndex = (rowIndex * columnCount + columnIndex) * 4
        const greenIndex = redIndex + 1
        const blueIndex = redIndex + 2
        const alphaIndex = redIndex + 3

        for (const [tableIndex, lookupTable] of lookupTables.entries()) {
          const xVal = tableIndex === 0 ? xFlipped : x
          const yVal = tableIndex === 0 ? y : flippedY

          lookupTable[redIndex] = redIndex
          lookupTable[greenIndex] = greenIndex
          lookupTable[blueIndex] = blueIndex
          lookupTable[alphaIndex] = alphaIndex

          coordPairs[tableIndex].set(redIndex, [xVal, yVal])
        }
      }
    }

    this.pixelIndex = lookupTables[0]
    this.pixelIndexFlippedY = lookupTables[1]
    this.coords = coordPairs[0]
    this.coordsFlipped = coordPairs[1]
  }

  get length() {
    return this.coords.size
  }
}
