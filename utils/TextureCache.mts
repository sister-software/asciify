import { Canvas2dContextLike, CanvasLike, createCanvasLike, pluck2dContext } from './canvas.mjs'
import { LuminanceCharacterCodeMap } from './LuminanceCharacterCodeMap.mjs'

const whitespacePattern = /\s/

export class TextureCache extends Array<Canvas2dContextLike> {
  constructor(
    luminanceCodeMap: LuminanceCharacterCodeMap,
    textureMetrics: TextureMetrics,
    fontFamily: string,
    backgroundColor: string,
    debug = false
  ) {
    super(luminanceCodeMap.size)
    for (const [luminance, character] of luminanceCodeMap.entries()) {
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
      } else {
        // context.fillStyle = blue
        // context.fillRect(0, 0, canvas.width, canvas.height)
      }

      if (!whitespacePattern.test(character)) {
        context.fillStyle = 'white'

        const textMetrics = context.measureText(character)
        const x = (canvas.width - textMetrics.width) / 2
        const y = (canvas.height - textureMetrics.renderedFontSize) / 2

        context.fillText(character, x, y)
      }

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      // We need to convert the image data so the transparency data is inverted

      for (let i = 0; i < imageData.data.length; i += 4) {
        const a = imageData.data[i + 3]

        imageData.data[i + 3] = 255 - a
      }

      context.putImageData(imageData, 0, 0, 0, 0, canvas.width, canvas.height)

      // Some characters like emoji are in color but we want to render them in black and white.
      // texture.globalCompositeOperation = 'luminosity'

      // for (let i = 0; i < imageData.data.length; i += 4) {
      //   const r = imageData.data[i]
      //   const g = imageData.data[i + 1]
      //   const b = imageData.data[i + 2]
      //   // const a = imageData.data[i + 3]

      //   const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b

      //   imageData.data[i] = luminance
      //   imageData.data[i + 1] = luminance
      //   imageData.data[i + 2] = luminance
      //   // imageData.data[i + 3] = a
      // }

      this[luminance] = context
    }

    // super(texturePairs)
  }
}

export interface Texture {
  canvas: CanvasLike
  context: Canvas2dContextLike
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
