import { build } from "esbuild"
import * as glob from "glob"
import _ from "lodash"
import { join } from "path"
import * as R from "ramda"

const __lib__ = R.curryN(2, join)("build/__lib__")
const withDefaults = R.mergeRight({
  format: "iife",
  bundle: true,
  minify: true,
})

await Promise.all([
  build({
    entryPoints: _.filter(glob.sync("src/**/*.ts"), file => !file.endsWith(".d.ts")),
    tsconfig: "./tsconfig.json",
    outdir: "build",
    target: "ES2016",
  }),
  build(withDefaults({
    entryPoints: ["lodash"],
    outfile: __lib__("lodash.bundle.js"),
    globalName: "_",
  })),
  build(withDefaults({
    entryPoints: ["ramda"],
    outfile: __lib__("ramda.bundle.js"),
    globalName: "R",
  })),
  build(withDefaults({
    entryPoints: ["luxon"],
    outfile: __lib__("luxon.bundle.js"),
    globalName: "luxon",
    footer: { js: ";var DateTime=luxon.DateTime" },
  })),
])
