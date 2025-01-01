import { build } from "esbuild"
import * as glob from "glob"
import _ from "lodash"
import { join } from "path"
import * as R from "ramda"

const _bundles = R.curryN(2, join)("build/_bundles")
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
    outfile: _bundles("lodash.bundle.js"),
    globalName: "_",
  })),
  build(withDefaults({
    entryPoints: ["ramda"],
    outfile: _bundles("ramda.bundle.js"),
    globalName: "R",
  })),
  build(withDefaults({
    entryPoints: ["luxon"],
    outfile: _bundles("luxon.bundle.js"),
    globalName: "luxon",
    footer: { js: ";var DateTime=luxon.DateTime" },
  })),
  build(withDefaults({
    entryPoints: ["validator"],
    outfile: _bundles("validator.bundle.js"),
    globalName: "validator",
  })),
  build(withDefaults({
    entryPoints: ["zod"],
    outfile: _bundles("zod.bundle.js"),
    globalName: "Zod",
    footer: { js: ";var z=Zod.z" },
  })),
  build(withDefaults({
    entryPoints: ["callsites"],
    outfile: _bundles("callsites.bundle.js"),
    globalName: "callsites",
    footer: { js: ";callsites=callsites.default" },
  })),
  build(withDefaults({
    entryPoints: ["flatted"],
    outfile: _bundles("flatted.bundle.js"),
    globalName: "Flatted",
  })),
  build(withDefaults({
    entryPoints: ["htmlparser2"],
    outfile: _bundles("htmlparser2.bundle.js"),
    globalName: "htmlparser2",
  })),
  build(withDefaults({
    entryPoints: ["css-select"],
    outfile: _bundles("css-select.bundle.js"),
    globalName: "cssSelect",
  })),
  build(withDefaults({
    entryPoints: ["ms"],
    outfile: _bundles("ms.bundle.js"),
    globalName: "ms",
  })),
])
