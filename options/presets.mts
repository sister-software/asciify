import { AsciifyOptions, DEFAULT_CHARACTER_SET } from './common.mts'

/**
 * @ignore
 */
export type OptionPreset = Partial<
  Pick<AsciifyOptions, 'characterSet' | 'fontSize' | 'fontFamily' | 'characterSpacingRatio' | 'contrastRatio'>
>

/**
 * A collection of ready-made character presets.
 * @category Configuration
 */
export const OptionPresets = {
  /**
   * A default character set to use for the ASCII art.
   * This looks good with both black and white and color output.
   */
  ascii: {
    characterSet: DEFAULT_CHARACTER_SET,
  },
  /**
   * A richer character set made of dithered blocks.
   */
  blocks: {
    characterSet: `░▒▓█`,
  },
  /**
   * A character set made of dithered stacks.
   */
  stacks: {
    characterSet: `▁▂▃▄▅▆▇█`,
  },
  /**
   * A character set made of thin blocks.
   */
  thin: {
    characterSet: `▖▗▘▙▝▞▟▀█`,
  },

  /**
   * A character set made of numerals.
   */
  numerals: {
    characterSet: `➀➁➂➃➄➅➆➇➈➉❶❷❸❹❺❻❼❽❾❿`,
    fontSize: 20,
    characterSpacingRatio: 1,
    contrastRatio: 0,
  },

  /**
   * A character set made of squares.
   */
  squares: {
    characterSet: `■□▢▣▤▥▦▧▨▩`,
  },

  /**
   * A character set made of circular shapes.
   */
  circles: {
    characterSet: `⬬⬭⬯⬮⬲⭑⭒⬤`,
    characterSpacingRatio: 1,
    contrastRatio: 2,
  },

  /**
   * A character set made of diamond shapes.
   */
  diamonds: {
    characterSet: `⬫⬪⬨⬧⬦⬥❖⭔⭓`,
    characterSpacingRatio: 1,
    contrastRatio: 2,
  },

  chess: {
    characterSet: `♙♘♗♖♕♔♟♞♝♜♛♚`,
    fontSize: 12,
    characterSpacingRatio: 1,
    contrastRatio: 0,
  },

  asterisks: {
    characterSet: `.✴✲✳✵✶✷✸✹✺✱✼✻✽✾✿`,
    fontSize: 8,
    characterSpacingRatio: 1.5,
    contrastRatio: 2,
  },

  hands: {
    characterSet: `✌🏻🫶👐👏👋✋✊`,
    fontFamily: `Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, Segoe UI Symbol, Noto Emoji, EmojiSymbols`,
    contrastRatio: 0,
  },

  faces: {
    characterSet: '🫥😶😑😐😏😵🤩',
    contrastRatio: 0,
  },
} satisfies Record<string, OptionPreset>
