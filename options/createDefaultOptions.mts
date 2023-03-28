import { createCanvasLike } from '../utils/canvas.mts'
import {
  AsciifyOptions,
  DEFAULT_CHARACTER_SET,
  DEFAULT_CONTRAST_RATIO,
  DEFAULT_FONT_SIZE,
  DEFAULT_PIXEL_RATIO,
  normalizeNumericOption,
  WithStringlyNumbers,
} from './common.mts'

/**
 * The default options for the ASCII art.
 * @internal
 * @ignore
 */

export function createDefaultOptions(overrides: Partial<WithStringlyNumbers<AsciifyOptions>> = {}): AsciifyOptions {
  const pixelRatio = normalizeNumericOption(1, overrides.pixelRatio ?? DEFAULT_PIXEL_RATIO, 10)

  const colorize = overrides.colorize ?? true

  const characterSpacingRatio = normalizeNumericOption(0, overrides.characterSpacingRatio ?? 1, 10)
  const characterSet =
    overrides.characterSet && overrides.characterSet.length ? overrides.characterSet : DEFAULT_CHARACTER_SET
  const fontSize = normalizeNumericOption(1, overrides.fontSize ?? DEFAULT_FONT_SIZE, 100)

  const fontFamily = overrides.fontFamily ?? 'monospace'
  const backgroundColor = overrides.backgroundColor ?? '#000000'
  const flipY = overrides.flipY ?? true
  const contrastRatio = normalizeNumericOption(0, overrides.contrastRatio ?? DEFAULT_CONTRAST_RATIO, 255)
  const debug = overrides.debug ?? false
  const scratchCanvas = overrides.scratchCanvas ?? createCanvasLike('offscreen')

  const defaultOptions: AsciifyOptions = {
    characterSet,
    fontSize,
    fontFamily,
    backgroundColor,
    pixelRatio,
    colorize,
    flipY,
    contrastRatio,
    characterSpacingRatio,
    debug,
    scratchCanvas,
  }

  return defaultOptions
}
