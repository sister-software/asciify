/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 * @file Vitest configuration. The suite runs in a real browser because every interesting
 *   behaviour in this library depends on Canvas2D and WebGL2, neither of which jsdom provides.
 */

/// <reference types="vitest/config" />

import { playwright } from "@vitest/browser-playwright"
import { defineConfig } from "vite"

export default defineConfig({
	test: {
		include: ["test/**/*.test.ts"],
		browser: {
			enabled: true,
			provider: playwright(),
			headless: true,
			instances: [{ browser: "chromium" }],
		},
	},
})
