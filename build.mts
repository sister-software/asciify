/**
 * @copyright Sister Software. All rights reserved.
 * @author Teffen Ellis, et al.
 * @license
 * See LICENSE file in the project root for full license information.
 */

import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  SimpleProgramConfig,
  TSPathTransformer,
  cleanTSBuildDirectory,
  createPrettierWriteFileCallback,
  createSimpleTSProgram,
  createSimpleTSProgramWithWatcher,
  readParsedTSConfig,
} from '@sister.software/typescript-esm-packager'

// ESM modules don't have __dirname, so we have to use import.meta.url...
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const programConfig: SimpleProgramConfig = {
  // Load the tsconfig.json file...
  // This function is just a wrapper around TypeScript's `ts.readConfigFile` function...
  tsConfig: readParsedTSConfig(path.join(__dirname, 'tsconfig.json')),
  // Create a transformer that...
  transformer: new TSPathTransformer({
    //...And rewrites '.mts' files to '.mjs' files:
    '.mjs': /\.m?tsx?$/gi,
  }),
  // Just for fun, we'll also format the output files with Prettier...
  writeFileCallback: await createPrettierWriteFileCallback(),
}

// Clear out any previous builds...
await cleanTSBuildDirectory(programConfig.tsConfig)

const watch = process.argv.includes('--watch')

if (watch) {
  // Create a program that watches for changes and re-emits the files...
  createSimpleTSProgramWithWatcher(programConfig)
} else {
  // Or, create a program that emits the files once...
  const program = createSimpleTSProgram(programConfig)

  program.emitWithTransformer()
}
