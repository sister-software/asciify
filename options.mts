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

import { Canvas2dContextLike, CanvasLike } from './utils.mjs'

/**
 * A default character set to use for the ASCII art.
 * More spaces will result in a more contrast ASCII art.
 * This looks good with both black and white and color output.
 *
 * @see {@linkcode DEFAULT_BW_CHAR_LIST}
 * @see {@linkcode DEFAULT_COLOR_CHAR_LIST}
 * @category Character Set
 */
export const DEFAULT_CHAR_SET = `   ..,'":;-~=+*#&%@`.split('')

/**
 * A default character set to use for the ASCII art.
 * Optimized for black and white output.
 * @category Character Set
 */
export const DEFAULT_BW_CHAR_LIST = '  .,:;i1tfLCG08@'.split('')

/**
 * A default character set to use for the ASCII art.
 * Optimized for richer color output.
 * @category Character Set
 */
export const DEFAULT_COLOR_CHAR_LIST = '  CGO08@'.split('')

/**
 * The fill style mode used to paint the canvas.
 */
export type ASCIIMode = 'grayscale' | 'color' | 'block'

export interface AsciifyOptions {
  /**
   * The available characters to use for the ASCII art.
   * Characters should be in order of "brightness",
   * with a space being the least bright and the last character being the most bright.
   */
  characterSet: string[]

  /**
   * The font family to use for the ASCII art.
   * @default 'monospace'
   */
  fontFamily: string

  /**
   * The font size to use for the ASCII art.
   *
   * The larger the font size, the fewer characters will fit on the screen.
   * Make sure to use a known font size, otherwise Safari will choose an approximate size.
   * @default 10
   */
  fontSize: number

  /**
   * The line height to use for the ASCII art. This should be a multiple of the font size.
   * @default 1.5
   */
  lineHeight: number

  /**
   * The mode to use for the ASCII art.
   *
   * Can be one of the following:
   *
   * - `'color'` Color
   * - `'grayscale'` Black and white
   * - `'block'` Color block characters
   *
   * @default 'color'
   */
  mode: ASCIIMode

  /**
   * Whether to use block characters for the ASCII art.
   * Overrides the character set.
   *
   * @default false
   */
  block: boolean

  /**
   * The background color of the canvas.
   * This can be any valid CSS color.
   *
   * @default black
   */
  backgroundColor: string

  /**
   * The device pixel ratio to use for the ASCII art.
   * @default window.devicePixelRatio Browser
   * @default 1 Node.js and Workers
   */
  pixelRatio: number

  /**
   * A cached canvas to use while performing operations.
   * This is an advanced option optional parameter.
   * Asciify will cache a canvas internally if not provided.
   */
  scratchCanvas?: CanvasLike | Canvas2dContextLike
}

/**
 * The default options for the ASCII art.
 * @internal
 * @ignore
 */
export function createDefaultOptions(): AsciifyOptions {
  return {
    characterSet: DEFAULT_CHAR_SET,
    fontSize: 10,
    lineHeight: 1.5,
    fontFamily: 'monospace',
    backgroundColor: 'black',
    mode: 'color',
    block: false,
    pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
  }
}
