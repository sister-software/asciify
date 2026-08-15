/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 * @fileoverview
 * Rewrites the asciify version pinned in the demo import maps to match package.json.
 *
 * The browser demos import asciify from esm.sh when served from GitHub Pages, so the pin must track the published
 * version. Release-it runs this after bumping package.json (see `.release-it.json`), which keeps the live demos on the
 * release being cut without anyone remembering to touch them.
 */

import { readFileSync, writeFileSync } from "node:fs"

const { version } = JSON.parse(readFileSync("package.json", "utf8"))

const demoPages = ["demo/3d/index.html", "demo/image/index.html", "demo/spiral/index.html"]

for (const page of demoPages) {
	const source = readFileSync(page, "utf8")
	const updated = source.replaceAll(/(@sister\.software\/asciify@)\d+\.\d+\.\d+/g, `$1${version}`)

	if (updated !== source) {
		writeFileSync(page, updated)

		console.log(`${page}: pinned asciify@${version}`)
	}
}
