/**
 * @fileoverview
 * This file contains options for the @sister.software/asciify module.
 *
 * @see {@link https://sister.software/asciify API documentation}
 * @module @sister.software/asciify
 * @copyright Sister Software. All rights reserved.
 * @license MIT
 * @author Teffen Ellis
 */

import { Canvas2dContextLike, CanvasLike, createCanvasLike } from './utils.mjs'

/**
 * A default character set to use for the ASCII art.
 * This looks good with both black and white and color output.
 *
 * @category Configuration
 */
export const DEFAULT_CHAR_SET = `..,'":;-~=+*#&%@`.split('')

/**
 * The fill style mode used to paint the canvas.
 * @category Configuration
 */
export type ASCIIMode = 'grayscale' | 'color' | 'block'

/**
 * The options used to configure the ASCII art.
 * @category Configuration
 */
export interface AsciifyOptions {
  /**
   * The available characters to use for the ASCII art.
   * Characters should be in order of "brightness",
   * with the first character being the least bright and the last being the most bright.
   *
   * @default DEFAULT_CHAR_SET
   * @see {@linkcode DEFAULT_CHAR_SET}
   * #see {@linkcode AsciifyOptions.contrastRatio}
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
   * The spacing ratio to use for the characters.
   *
   * This should be a multiple of the font size, usually between 0.8 and 2.
   * Larger ratios will result in more spacing between lines and a faster render time.
   * Smaller ratios will result in more characters fitting on the screen and a slower render time.
   *
   * A ratio less than 1 will result in the characters being squished closer together,
   * and when paired with small font sizes, will result in the characters being illegible.
   *
   * @default 1
   */
  characterSpacingRatio: number

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
   * The background color of the character set.
   *
   * This may be set to any valid CSS color.
   * Note that this will only apply to the background of the ASCII characters.
   * The source image pixel data ultimately determines which character is used.
   *
   * @default black
   */
  backgroundColor: string

  /**
   * The device pixel ratio to use for the ASCII art.
   * @default `devicePixelRatio` Browser
   * @default 1 Node.js and Workers
   */
  pixelRatio: number

  /**
   * The contrast ratio use to pad the character set across the luminance range.
   * This is a value between 0 and 255, with a usual range between 0 and 5.
   * A lower value will result in the character set being used more often and slower rendering.
   * A higher value will result in empty space being used more often and faster rendering.
   *
   * @default 3
   */
  contrastRatio: number

  /**
   * A cached canvas to use while performing operations.
   * Asciify will automatically cache a canvas internally if not provided.
   */
  scratchCanvas: CanvasLike | Canvas2dContextLike

  /**
   * Whether to flip the canvas vertically for Three.js
   *
   * @default true
   */
  flipY: boolean

  /**
   * Enables debugging behaviors.
   * @default false
   * @internal
   * @ignore
   */
  debug: boolean
}

/**
 * The default options for the ASCII art.
 * @internal
 * @ignore
 */
export function createDefaultOptions(options: Partial<AsciifyOptions>): AsciifyOptions {
  const mode = options.mode ?? 'color'
  const characterSpacingRatio = options.characterSpacingRatio ?? 1
  const characterSet = options.characterSet ?? DEFAULT_CHAR_SET
  const fontSize = options.fontSize ?? 10
  const fontFamily = options.fontFamily ?? 'monospace'
  const backgroundColor = options.backgroundColor ?? 'black'
  const pixelRatio = typeof devicePixelRatio !== 'undefined' ? devicePixelRatio : 1
  const flipY = options.flipY ?? true
  const contrastRatio = options.contrastRatio ?? 3
  const debug = options.debug ?? false
  const scratchCanvas = options.scratchCanvas ?? createCanvasLike('offscreen')

  const defaultOptions: AsciifyOptions = {
    characterSet,
    fontSize,
    fontFamily,
    backgroundColor,
    pixelRatio,
    mode,
    flipY,
    contrastRatio,
    characterSpacingRatio: characterSpacingRatio - (mode === 'block' ? 0.5 : 0),
    debug,
    scratchCanvas,
  }

  return defaultOptions
}
