import { build } from "esbuild"
import * as glob from "glob"
import _ from "lodash"
import { join } from "path"

const libDir = "build/__lib__"
const bundleConfig = {
  format: "iife",
  bundle: true,
  minify: true,
}

await Promise.all([
  build({
    entryPoints: _.filter(glob.sync("src/**/*.ts"), file => !file.endsWith(".d.ts")),
    tsconfig: "./tsconfig.json",
    outdir: "build",
    target: "ES2016",
  }),
  build(_.merge({
    entryPoints: ["lodash"],
    outfile: join(libDir, "lodash.bundle.js"),
    globalName: "_",
  }, bundleConfig)),
])
