import esbuild from "esbuild"
import fs from "fs"
import * as glob from "glob"
import JSON5 from "json5"
import _ from "lodash"
import path from "path"

await Promise.all([
  fs.promises.readFile("tsconfig.json").then((buffer) => {
    const tsconfig = JSON5.parse(buffer.toString())
    return esbuild.build({
      entryPoints: glob.globSync("src/**/*.ts").filter(f => !f.endsWith(".d.ts")),
      target: tsconfig.compilerOptions.target,
      outdir: tsconfig.compilerOptions.outDir,
    })
  }),
  esbuild.build(bundle({
    entryPoints: ["lodash"],
    globalName: "_",
    banner: { js: getLicense("lodash/LICENSE") },
  })),
  esbuild.build(bundle({
    entryPoints: ["lodash/fp"],
    globalName: "fp",
    banner: { js: getLicense("lodash/LICENSE") },
  })),
  esbuild.build(bundle({
    entryPoints: ["ramda"],
    globalName: "R",
    banner: { js: getLicense("ramda/LICENSE.txt") },
  })),
  esbuild.build(bundle({
    entryPoints: ["luxon"],
    globalName: "luxon",
    banner: { js: getLicense("luxon/LICENSE.md") },
    footer: { js: "\n;var DateTime=luxon.DateTime" },
  })),
  esbuild.build(bundle({
    entryPoints: ["validator"],
    globalName: "validator",
    banner: { js: getLicense("validator/LICENSE") },
  })),
  esbuild.build(bundle({
    entryPoints: ["zod"],
    globalName: "Zod",
    banner: { js: getLicense("zod/LICENSE") },
    footer: { js: "\n;var z=Zod.z" },
  })),
  esbuild.build(bundle({
    entryPoints: ["htmlparser2"],
    globalName: "htmlparser2",
    banner: { js: getLicense("htmlparser2/LICENSE") },
  })),
  esbuild.build(bundle({
    entryPoints: ["css-select"],
    globalName: "cssSelect",
    banner: { js: getLicense("css-select/LICENSE") },
  })),
  esbuild.build(bundle({
    entryPoints: ["flatted"],
    globalName: "Flatted",
    banner: { js: getLicense("flatted/LICENSE") },
  })),
])

/** @param {string} file */
function getLicense(file) {
  return `/*
${fs.readFileSync(path.join("node_modules", file)).toString()}
*/`.replace(/\n{2,}/g, "\n\n")
}

function bundle(/** @type {import("esbuild").BuildOptions} */options) {
  const pkg = options.entryPoints[0]
  return _.merge(options, {
    bundle: true,
    minify: true,
    format: "iife",
    outfile: `build/__dist__/${pkg}.min.js`,
  })
}
