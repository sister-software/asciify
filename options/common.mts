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

import { Canvas2dContextLike, CanvasLike } from '../utils/canvas.mts'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { OptionPreset } from './presets.mts'

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
   * @default {CharacterPresets.ascii}
   * @see {@linkcode OptionPreset}
   * @see {@linkcode AsciifyOptions.contrastRatio}
   */
  characterSet: string | string[]

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
   * Whether to use color in the ASCII art.
   *
   * @default true
   */
  colorize: boolean

  /**
   * The background color of the character set.
   *
   * This may be set to any valid CSS color.
   * Note that this will only apply to the background of the ASCII characters.
   * The source image pixel data ultimately determines which character is used.
   *
   * @default '#000000'
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

export const DEFAULT_PIXEL_RATIO = typeof devicePixelRatio !== 'undefined' ? devicePixelRatio : 1
export const DEFAULT_FONT_SIZE = 12
export const DEFAULT_CONTRAST_RATIO = 3
export const DEFAULT_CHARACTER_SET = `..,'":;-~=+*#&%@`

/**
 * Type utility that allows number properties to be strings. Useful for accepting form inputs.
 */
export type WithStringlyNumbers<T> = {
  [P in keyof T]: T[P] extends number ? T[P] | string : T[P]
}

export function normalizeNumericOption(min: number, value: string | number, max: number): number {
  const normalizedValue = typeof value === 'string' ? parseInt(value, 10) : value

  return Math.max(Math.min(normalizedValue, max), min)
}
