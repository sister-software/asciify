/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 */

import { GUI } from "dat.gui"

const isLocal = !globalThis.location.origin.includes("sister.software")
const asciifyModuleID = isLocal ? "/out/index.js" : "@sister.software/asciify"

// The specifier is only known at runtime, so the module's type is asserted from the compiled declarations.
const { OptionPresets } = /** @type {typeof import("../../out/index.js")} */ (await import(asciifyModuleID))

export class AsciifyGUI extends GUI {
	/**
	 * @param {import("../../out/index.js").AsciifyOptions} asciiOptions
	 * @param {() => void} onOptionChange
	 * @param {import("dat.gui").GUIParams} [guiOptions]
	 */
	constructor(asciiOptions, onOptionChange, guiOptions = {}) {
		super({
			width: 400,
			autoPlace: false,
			closeOnTop: true,
			...guiOptions,
		})

		this.add(asciiOptions, "fontSize", 5, 30, 1).onChange(onOptionChange)

		this.add(asciiOptions, "characterSet", Object.keys(OptionPresets)).onChange((value) => {
			Object.assign(asciiOptions, OptionPresets[/** @type {keyof typeof OptionPresets} */ (value)])
			this.updateDisplay()
			onOptionChange()
		})

		this.add(asciiOptions, "characterSpacingRatio", 0, 3, 0.1).onChange(onOptionChange)

		this.add(asciiOptions, "contrastRatio", 0, 5, 1).onChange(onOptionChange)

		this.add(asciiOptions, "colorize").onChange(onOptionChange)

		this.addColor(asciiOptions, "backgroundColor").onChange(onOptionChange)

		this.add(asciiOptions, "pixelRatio", 1, 4, 1).onChange(onOptionChange)

		this.add(asciiOptions, "debug").onChange((value) => {
			document.documentElement.classList.toggle("debug", value)
			onOptionChange()
		})
	}
}
