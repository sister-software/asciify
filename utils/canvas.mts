/**
 * @fileoverview
 * This file contains utility functions for the @sister.software/asciify module.
 *
 * @see {@link https://sister.software/asciify API documentation}
 * @module @sister.software/asciify
 * @copyright Sister Software. All rights reserved.
 * @license MIT
 * @author Teffen Ellis
 */

/**
 * Either a canvas or an offscreen canvas.
 * Note that the offscreen canvas support varies between browsers.
 * Safari tends to produce slight visual artifacts when using offscreen canvases.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas MDN on Offscreen Canvas}
 */
export type CanvasLike = OffscreenCanvas | HTMLCanvasElement

/**
 * Either a canvas 2D context or an offscreen canvas 2D context.
 * Note that the offscreen canvas support varies between browsers.
 * Safari tends to produce slight visual artifacts when using offscreen canvases.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvasRenderingContext2D MDN on Offscreen Canvas 2D Context}
 */
export type Canvas2dContextLike = OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D

/**
 * @ignore
 * @internal
 */
export const isWebGLRenderer = (object: unknown): object is THREE.WebGLRenderer => {
  return typeof object === 'object' && object !== null && 'setSize' in object
}

/**
 * @ignore
 * @internal
 */
export const isCanvasLike = (object: CanvasLike | Canvas2dContextLike): object is CanvasLike => {
  return typeof object === 'object' && object !== null && 'getContext' in object
}

/**
 * Creates a canvas-like object given the environment.
 * @ignore
 * @internal
 */
export function createCanvasLike(
  /**
   * Force a specific canvas-like object to be created.
   * @default 'canvas' in the browser, 'offscreen' in Node.js and Workers
   * @optional
   */
  preferred?: 'canvas' | 'offscreen'
): CanvasLike {
  if (typeof preferred === 'undefined') {
    if (typeof OffscreenCanvas !== 'undefined') {
      // Given a browser-like environment, prefer a canvas...
      preferred = 'canvas'
    } else if (typeof document !== 'undefined') {
      preferred = 'offscreen'
    }
  }

  switch (preferred) {
    case 'canvas':
      return document.createElement('canvas')
    case 'offscreen':
      return new OffscreenCanvas(1, 1)
  }

  throw new Error('Environment does not appear to support canvas-like objects')
}

/**
 * Plucks a 2D context from a canvas-like object.
 * @ignore
 * @internal
 */
export function pluck2dContext(
  canvasLike: CanvasLike | Canvas2dContextLike,
  options: CanvasRenderingContext2DSettings = {}
): Canvas2dContextLike {
  if (isCanvasLike(canvasLike)) {
    return canvasLike.getContext('2d', {
      alpha: false,
      desynchronized: true,
      ...options,
    }) as CanvasRenderingContext2D
  }

  return canvasLike as CanvasRenderingContext2D
}

/**
 * Tests if a canvas-like object is an elemental canvas.
 * Note that this only works in the same browser frame as the canvas was created.
 * @ignore
 */
export function isHTMLCanvasElement(canvasLike: CanvasLike): canvasLike is HTMLCanvasElement {
  return canvasLike instanceof HTMLCanvasElement
}
