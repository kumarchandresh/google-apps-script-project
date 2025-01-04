import esbuild from "esbuild"
import fs from "fs"
import * as glob from "glob"
import JSON5 from "json5"

await fs.promises.readFile("tsconfig.json").then((buffer) => {
  /** @type {{compilerOptions: import("typescript").CompilerOptions}} */
  const tsconfig = JSON5.parse(buffer.toString())
  return esbuild.build({
    entryPoints: glob.globSync("src/**/*.ts"),
    target: tsconfig.compilerOptions.target,
    outdir: tsconfig.compilerOptions.outDir,
  })
})
