import { GUI } from 'dat.gui'

const isLocal = !window.location.origin.includes('sister.software')
const asciifyModuleID = isLocal ? '/dist/mod.mjs' : '@sister.software/asciify'

const { OptionPresets } = await import(asciifyModuleID)

export class AsciifyGUI extends GUI {
  constructor(asciiOptions, onOptionChange, guiOptions = {}) {
    super({
      width: 400,
      autoPlace: false,
      closeOnTop: true,
      ...guiOptions,
    })

    this.add(asciiOptions, 'fontSize', 5, 30, 1).onChange(onOptionChange)
    this.add(asciiOptions, 'characterSet', Object.keys(OptionPresets)).onChange((value) => {
      Object.assign(asciiOptions, OptionPresets[value])
      this.updateDisplay()
      onOptionChange()
    })
    this.add(asciiOptions, 'characterSpacingRatio', 0, 3, 0.1).onChange(onOptionChange)
    this.add(asciiOptions, 'contrastRatio', 0, 5, 1).onChange(onOptionChange)
    this.add(asciiOptions, 'colorize').onChange(onOptionChange)
    this.addColor(asciiOptions, 'backgroundColor').onChange(onOptionChange)
    this.add(asciiOptions, 'pixelRatio', 1, 4, 1).onChange(onOptionChange)
    this.add(asciiOptions, 'debug').onChange((value) => {
      document.documentElement.classList.toggle('debug', value)
      onOptionChange()
    })
  }
}
