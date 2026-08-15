/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 * @fileoverview
 * Minimal declarations for the demo dependencies that ship no types of their own. Only the members the demos touch are
 * declared. Note that `stats-js` is a distinct npm package from `stats.js`, so `@types/stats.js` does not cover it.
 */

declare module "dat.gui" {
	export interface GUIParams {
		width?: number
		autoPlace?: boolean
		closeOnTop?: boolean
	}

	export class GUIController {
		onChange(handler: (value: any) => void): this
	}

	export class GUI {
		constructor(params?: GUIParams)

		domElement: HTMLElement

		add(target: object, propertyName: string, ...options: unknown[]): GUIController
		addColor(target: object, propertyName: string): GUIController
		addFolder(name: string): GUI
		close(): void
		updateDisplay(): void
	}
}

declare module "stats-js" {
	export default class Stats {
		dom: HTMLDivElement

		showPanel(panelIndex: number): void
		begin(): void
		end(): void
	}
}
