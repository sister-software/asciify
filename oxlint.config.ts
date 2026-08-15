/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 * @file oxlint configuration for asciify.
 */

import { createOxlintConfig, DefaultIgnorePatterns } from "@sister.software/oxlint-config"

export default createOxlintConfig({
	copyrightHolder: "Sister Software",
	spdxLicenseIdentifier: "MIT",
	ignorePatterns: [...DefaultIgnorePatterns, "docs/**/*"],
})
