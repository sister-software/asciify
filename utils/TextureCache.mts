import { CanvasLike, createCanvasLike, pluck2dContext } from './canvas.mjs'
import { LuminanceCharacterMap } from './LuminanceCharacterMap.mjs'

const whitespacePattern = /\s/
const supportsCreateImageBitmap = typeof createImageBitmap !== 'undefined'

/**
 * A cache containing the pre-rendered image data of the character set.
 *
 * @remarks
 * The texture cache allows us to avoid re-rendering the character set for each frame.
 * And since there are a fixed amount of luminance values, we can pre-render the character set
 * associated with each value.
 *
 * Additionally, the cache will automatically upgrade the canvas
 * to a more performant {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/ImageBitmap ImageBitmap}
 * if the browser supports it.
 *
 * @internal
 */
export class TextureCache extends Array<CanvasLike | ImageBitmap> {
  /**
   * A promise that resolves when all of the bitmaps have been initialized.
   */
  public initializedBitmaps: Promise<void>

  constructor(
    luminanceCharacterMap: LuminanceCharacterMap,
    textureMetrics: TextureMetrics,
    fontFamily: string,
    debug = false,
    bitmapsEnabled = supportsCreateImageBitmap
  ) {
    super(luminanceCharacterMap.size)
    const bitmapPromises: Promise<void>[] = []

    for (const [luminance, character] of luminanceCharacterMap.entries()) {
      const canvas = createCanvasLike()
      const context = pluck2dContext(canvas, {
        alpha: true,
      })

      canvas.width = textureMetrics.width
      canvas.height = textureMetrics.height

      context.font = `${textureMetrics.renderedFontSize * 1}px ${fontFamily}`
      context.fillStyle = 'black'
      context.fontKerning = 'none'
      context.textBaseline = 'top'

      context.clearRect(0, 0, canvas.width, canvas.height)

      if (debug) {
        context.fillStyle = 'white'
        context.fillRect(0, 0, canvas.width, canvas.height)

        context.fillStyle = 'black'
        // We use a circle to make it easier to see the edges of the individual characters.
        context.beginPath()
        context.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, 2 * Math.PI)
        context.fill()
      }

      if (!whitespacePattern.test(character)) {
        // Some characters like emoji are in color but we want to render them in black and white.
        context.filter = 'grayscale(100%)'
        context.fillStyle = 'white'

        const textMetrics = context.measureText(character)
        const x = (canvas.width - textMetrics.width) / 2
        const y = (canvas.height - textureMetrics.renderedFontSize) / 2

        context.fillText(character, x, y)
        context.filter = 'none'
      }

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)

      // We need to convert the image data so the transparency values are inverted...
      for (let i = 0; i < imageData.data.length; i += 4) {
        const a = imageData.data[i + 3]

        imageData.data[i + 3] = 255 - a
      }

      context.putImageData(imageData, 0, 0, 0, 0, canvas.width, canvas.height)

      this[luminance] = canvas

      if (bitmapsEnabled) {
        bitmapPromises.push(
          createImageBitmap(canvas, 0, 0, canvas.width, canvas.height, {
            premultiplyAlpha: 'premultiply',
          }).then((imageBitmap) => {
            this[luminance] = imageBitmap
          })
        )
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    this.initializedBitmaps = Promise.all(bitmapPromises).then(() => {})
  }
}

export interface TextureMetrics {
  byteLength: number
  lineLength: number
  renderedFontSize: number
  width: number
  height: number
}

/**
 * @internel
 */
export function calculateTextureMetrics(fontSize: number, pixelRatio: number): TextureMetrics {
  const byteLength = 4
  const renderedFontSize = fontSize * pixelRatio
  const width = renderedFontSize
  const height = renderedFontSize
  const lineLength = width * byteLength

  return {
    byteLength,
    width,
    height,
    renderedFontSize,
    lineLength,
  }
}
