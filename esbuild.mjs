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
  build(withDefaults({
    entryPoints: ["validator"],
    outfile: __lib__("validator.bundle.js"),
    globalName: "validator",
  })),
  build(withDefaults({
    entryPoints: ["zod"],
    outfile: __lib__("zod.bundle.js"),
    globalName: "Zod",
    footer: { js: ";var z=Zod.z" },
  })),
  build(withDefaults({
    entryPoints: ["callsites"],
    outfile: __lib__("callsites.bundle.js"),
    globalName: "callsites",
    footer: { js: ";callsites=callsites.default" },
  })),
  build(withDefaults({
    entryPoints: ["flatted"],
    outfile: __lib__("flatted.bundle.js"),
    globalName: "Flatted",
  })),
  build(withDefaults({
    entryPoints: ["htmlparser2"],
    outfile: __lib__("htmlparser2.bundle.js"),
    globalName: "htmlparser2",
  })),
  build(withDefaults({
    entryPoints: ["css-select"],
    outfile: __lib__("css-select.bundle.js"),
    globalName: "cssSelect",
  })),
])
