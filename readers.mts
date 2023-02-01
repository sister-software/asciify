/**
 * @fileoverview
 * This file is the entry point for the @sister.software/asciify module.
 *
 * @see {@link https://sister.software/asciify API documentation}
 * @module @sister.software/asciify
 * @copyright Sister Software. All rights reserved.
 * @license MIT
 * @author Teffen Ellis
 */

import { Canvas2dContextLike, CanvasLike, createCanvasLike } from './utils.mjs'

/**
 * Read the pixel buffer from a ThreeJS WebGLRenderer.
 * This function is useful when you want to render a ThreeJS scene to ASCII art.
 *
 * @category Helper
 * @see {@linkcode Asciify.rasterizeThree}
 * @returns A Uint8ClampedArray containing the RGBA pixel buffer
 */
export function readFromThree(
  /**
   * The Three.js renderer to read from.
   */
  renderer: THREE.WebGLRenderer,
  /**
   * The WebGL context to read from. Defaults to the context of the renderer.
   * You should provide this if you'd like to cache the context once and reuse it.
   */
  ctx = renderer.getContext()
): Uint8ClampedArray {
  const rgbaBuffer = new Uint8ClampedArray(ctx.drawingBufferWidth * ctx.drawingBufferHeight * 4)
  ctx.readPixels(0, 0, renderer.domElement.width, renderer.domElement.height, ctx.RGBA, ctx.UNSIGNED_BYTE, rgbaBuffer)

  return rgbaBuffer
}

export class FrameBuffer extends Uint8ClampedArray {
  constructor(rowCount: number, columnCount: number) {
    super(rowCount * columnCount * 4)
  }
}

/**
 * Reads the pixel buffer from a canvas element.
 * This function is useful when you want to rasterize an existing canvas to ASCII art.
 *
 * @category Helper
 * @see {@linkcode Asciify.rasterize}
 * @see {@linkcode readFromThree}
 * @see {@linkcode readFromImage}
 */
export function readFromCanvas(
  /**
   * The 2D context to read from.
   *
   * Make sure to provide a canvas with the same dimensions as
   * the asciify instance you're using.
   *
   * @see {@linkcode Asciify.setSize}
   */
  ctx: Canvas2dContextLike
) {
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
  return imageData.data
}

/**
 * Reads the pixel buffer from an image element.
 * This function is useful when you want to rasterize an image to ASCII art.
 *
 * @category Helper
 * @see {@linkcode Asciify.rasterize}
 * @see {@linkcode readFromThree}
 * @see {@linkcode readFromCanvas}
 */
export async function readFromImage(
  /**
   * The image to read pixels from.
   * This will be resized to match the next given `canvas` argument.
   */
  sourceImage: ImageBitmapSource,
  /**
   * The 2D context to read from.
   *
   * Make sure to provide a canvas with the same dimensions as
   * the asciify instance you're using.
   *
   * @see {@linkcode Asciify.setSize}
   */
  ctx: Canvas2dContextLike
) {
  const resizeWidth = ctx.canvas.width
  const resizeHeight = ctx.canvas.height

  const bitmap = await createImageBitmap(sourceImage, {
    resizeWidth,
    resizeHeight,
    resizeQuality: 'high',
  })

  ctx.drawImage(bitmap, 0, 0, resizeWidth, resizeHeight)

  return readFromCanvas(ctx)
}

/**
 * Reads the pixel buffer from a video element.
 * This function is useful when you want to rasterize a video to ASCII art.
 *
 * @category Helper
 * @see {@linkcode Asciify.rasterize}
 * @see {@linkcode readFromThree}
 * @see {@linkcode readFromCanvas}
 * @returns A Uint8ClampedArray containing the RGBA pixel buffer
 */
export function readFromVideo(
  /**
   * The video to read pixels from.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement MDN on HTMLVideoElement }
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement MDN on HTMLMediaElement }
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/captureStream MDN on Media captureStream }
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/captureStream MDN on Canvas captureStream }
   */
  video: HTMLVideoElement,
  /**
   * A canvas to use for reading the video.
   * You should provide this parameter if you'd like to cache the canvas.
   */
  canvas: CanvasLike = createCanvasLike()
  /**
   * The 2D context to read from.
   * You should provide this parameter if you'd like to cache the context,
   * or provide a context optimized for your content.
   */
) {
  canvas.width = video.width
  canvas.height = video.height

  const ctx = canvas.getContext('2d', {
    desynchronized: true,
  })! as Canvas2dContextLike
  ctx.drawImage(video, 0, 0)

  return readFromCanvas(ctx)
}
