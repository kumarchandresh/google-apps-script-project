/* global process */
import esbuild from "esbuild";
import fs from "fs";
import path from "path";
import yargs from "yargs";

const libDir = path.join("build", "__lib__");

const { stringify } = yargs(process.argv.slice(1)).argv;

/** @type {((prefix:string) => void)[]} */
await Promise.all([
  // https://www.npmjs.com/package/lodash
  esbuild.build(withDefaults({
    globalName: "_",
    entryPoints: ["lodash"],
    outfile: path.join(libDir, "lodash.min.js"),
    banner: { js: getLicense("lodash/LICENSE") },
  })),
  // https://www.npmjs.com/package/lodash
  esbuild.build(withDefaults({
    globalName: "f",
    entryPoints: ["lodash/fp"],
    outfile: path.join(libDir, "lodash-fp.min.js"),
    banner: { js: getLicense("lodash/LICENSE") },
  })),
  // https://www.npmjs.com/package/ramda
  esbuild.build(withDefaults({
    globalName: "R",
    entryPoints: ["ramda"],
    outfile: path.join(libDir, "ramda.min.js"),
    banner: { js: getLicense("ramda/LICENSE.txt") },
  })),
  // https://www.npmjs.com/package/ms
  esbuild.build(withDefaults({
    globalName: "ms",
    entryPoints: ["ms"],
    outfile: path.join(libDir, "ms.min.js"),
    banner: { js: getLicense("ms/license.md") },
  })),
  // https://www.npmjs.com/package/luxon
  esbuild.build(withDefaults({
    globalName: "luxon",
    entryPoints: ["luxon"],
    outfile: path.join(libDir, "luxon.min.js"),
    banner: { js: getLicense("luxon/LICENSE.md") },
    footer: {
      js: `
var DateTime=luxon.DateTime
var Duration=luxon.Duration
` },
  })),
].concat(/pretty-format/i.test(stringify)
  // https://www.npmjs.com/package/pretty-format
  ? esbuild.build(withDefaults({
      globalName: "prettyFormat",
      entryPoints: ["pretty-format"],
      outfile: path.join(libDir, "pretty-format.min.js"),
      banner: { js: getLicense("pretty-format/LICENSE") },
      footer: {
        js: `
var stringify=prettyFormat.default
` },
    }))
  // https://www.npmjs.com/package/process
  : esbuild.build(withDefaults({
      write: false,
      globalName: "process",
      entryPoints: ["process"],
    })).then((result) => {
      const content = result.outputFiles.map(f => f.text).join("\n");
      // https://www.npmjs.com/package/util
      return esbuild.build(withDefaults({
        globalName: "util",
        entryPoints: ["util"],
        outfile: path.join(libDir, "util.min.js"),
        banner: {
          js: getLicense("util/LICENSE") + "\n" + content,
        },
        footer: {
          js: `
var stringify = util.inspect;
` },
      }));
    }),
).concat([
  // https://www.npmjs.com/package/flatted
  esbuild.build(withDefaults({
    globalName: "flatted",
    entryPoints: ["flatted"],
    outfile: path.join(libDir, "flatted.min.js"),
    banner: { js: getLicense("flatted/LICENSE") },
  })),
  // https://www.npmjs.com/package/callsites
  esbuild.build(withDefaults({
    globalName: "callsites",
    entryPoints: ["callsites"],
    outfile: path.join(libDir, "callsites.min.js"),
    banner: { js: getLicense("callsites/license") },
    footer: {
      js: `
var callsites=callsites.default
` },
  })),
  // https://www.npmjs.com/package/zod
  esbuild.build(withDefaults({
    globalName: "zod",
    entryPoints: ["zod"],
    outfile: path.join(libDir, "zod.min.js"),
    banner: { js: getLicense("zod/LICENSE") },
    footer: {
      js: `
var z=zod.z
` },
  })),
  // https://www.npmjs.com/package/htmlparser2
  esbuild.build(withDefaults({
    globalName: "htmlparser2",
    entryPoints: ["htmlparser2"],
    outfile: path.join(libDir, "htmlparser2.min.js"),
    banner: { js: getLicense("htmlparser2/LICENSE") },
  })),
  // https://www.npmjs.com/package/css-select
  esbuild.build(withDefaults({
    globalName: "cssSelect",
    entryPoints: ["css-select"],
    outfile: path.join(libDir, "css-select.min.js"),
    banner: { js: getLicense("css-select/LICENSE") },
  })),
  // https://www.npmjs.com/package/validator
  esbuild.build(withDefaults({
    globalName: "validator",
    entryPoints: ["validator"],
    outfile: path.join(libDir, "validator.min.js"),
    banner: { js: getLicense("validator/LICENSE") },
  })),
]));

/** @param {string} file */
function getLicense(file) {
  return `/*
${fs.readFileSync(path.join("node_modules", file)).toString()}
*/`.replace(/\n{2,}/g, "\n\n");
}

/** @param {import("esbuild").BuildOptions} options */
function withDefaults(options) {
  return Object.assign({
    bundle: true,
    minify: true,
    format: "iife",
  }, options);
}
