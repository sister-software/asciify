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

import { valid } from "semver"

const { version } = JSON.parse(readFileSync("package.json", "utf8")) as { version: string }

if (!valid(version)) {
	throw new Error(`package.json version ${JSON.stringify(version)} is not valid semver`)
}

/**
 * A pinned specifier in an import map URL, e.g. `@sister.software/asciify@4.2.0`. The pin runs to the next path segment
 * or closing quote, and is only rewritten when it parses as semver — a deliberate tag pin is left alone.
 */
const PIN_PATTERN = /(@sister\.software\/asciify@)([^/"]+)/g

const demoPages = ["demo/3d/index.html", "demo/image/index.html", "demo/spiral/index.html"]

for (const page of demoPages) {
	const source = readFileSync(page, "utf8")

	const updated = source.replaceAll(PIN_PATTERN, (match, prefix: string, pinned: string) =>
		valid(pinned) ? `${prefix}${version}` : match
	)

	if (updated !== source) {
		writeFileSync(page, updated)

		console.log(`${page}: pinned asciify@${version}`)
	}
}
