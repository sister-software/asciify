/**
 * Given an array of 255 or less ASCII characters representing the brightness of each pixel,
 * returns something like a radix-sorted array of 255 characters that are evenly spaced.
 *
 * This helps us avoid expensive operations like Math.floor() when rendering the ASCII art.
 *
 * @category Utility
 * @internal
 */
export class LuminanceCharacterCodeMap extends Map<
  /** The luminance of the pixel. 0 to 255. */
  number,
  /** The character code of the character to render. */
  string
> {
  constructor(readonly characterSet: string | string[], contrastRatio: number) {
    const asciiCharacters = Array.from(characterSet)
    const averagedCharacterSet: Array<[number, string]> = []

    for (let i = 0; i < contrastRatio; i++) {
      asciiCharacters.unshift(' ')
    }

    if (asciiCharacters.length > 255) {
      console.warn('The character set is too large. Only first 255 characters will be used.')
    }

    for (let luminance = 0; luminance < 256; luminance++) {
      const index = Math.floor((luminance / 256) * asciiCharacters.length)
      const character = asciiCharacters[index]

      averagedCharacterSet.push([luminance, character])
    }

    super(averagedCharacterSet)
  }
}
