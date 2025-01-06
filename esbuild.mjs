import esbuild from "esbuild";
import fs from "fs";
import path from "path";

const libDir = path.join("build", "__lib__");

/** @type {((prefix:string) => void)[]} */
await Promise.all([
  // lodash
  esbuild.build(withDefaults({
    globalName: "_",
    entryPoints: ["lodash"],
    outfile: path.join(libDir, "lodash.min.js"),
    banner: { js: getLicense("lodash/LICENSE") },
  })),
  // lodash-fp
  esbuild.build(withDefaults({
    globalName: "fp",
    entryPoints: ["lodash/fp"],
    outfile: path.join(libDir, "lodash-fp.min.js"),
    banner: { js: getLicense("lodash/LICENSE") },
  })),
  // ramda
  esbuild.build(withDefaults({
    globalName: "R",
    entryPoints: ["ramda"],
    outfile: path.join(libDir, "ramda.min.js"),
    banner: { js: getLicense("ramda/LICENSE.txt") },
  })),
  // luxon
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
  // validator
  esbuild.build(withDefaults({
    globalName: "validator",
    entryPoints: ["validator"],
    outfile: path.join(libDir, "validator.min.js"),
    banner: { js: getLicense("validator/LICENSE") },
  })),
  // zod
  esbuild.build(withDefaults({
    globalName: "Zod",
    entryPoints: ["zod"],
    outfile: path.join(libDir, "zod.min.js"),
    banner: { js: getLicense("zod/LICENSE") },
    footer: {
      js: `
var z=Zod.z
` },
  })),
  // htmlparser2
  esbuild.build(withDefaults({
    globalName: "htmlparser2",
    entryPoints: ["htmlparser2"],
    outfile: path.join(libDir, "htmlparser2.min.js"),
    banner: { js: getLicense("htmlparser2/LICENSE") },
  })),
  // css-select
  esbuild.build(withDefaults({
    globalName: "cssSelect",
    entryPoints: ["css-select"],
    outfile: path.join(libDir, "css-select.min.js"),
    banner: { js: getLicense("css-select/LICENSE") },
  })),
  // flatted
  esbuild.build(withDefaults({
    globalName: "Flatted",
    entryPoints: ["flatted"],
    outfile: path.join(libDir, "flatted.min.js"),
    banner: { js: getLicense("flatted/LICENSE") },
  })),
  // callsites
  esbuild.build(withDefaults({
    globalName: "callsites",
    entryPoints: ["callsites"],
    outfile: path.join(libDir, "callsites.min.js"),
    banner: { js: getLicense("callsites/license") },
    footer: {
      js: `
callsites=callsites.default
` },
  })),
  // node:util (kind-of)
  esbuild.build(withDefaults({
    globalName: "util",
    entryPoints: ["util"],
    outfile: path.join(libDir, "util.min.js"),
    banner: { js: getLicense("util/LICENSE") },
  })),
  // node:process (shim)
  esbuild.build(withDefaults({
    globalName: "process",
    entryPoints: ["process"],
    outfile: path.join(libDir, "process.min.js"),
    banner: { js: getLicense("process/LICENSE") },
  })),
  // ms
  esbuild.build(withDefaults({
    globalName: "ms",
    entryPoints: ["ms"],
    outfile: path.join(libDir, "ms.min.js"),
    banner: { js: getLicense("ms/license.md") },
  })),
]);

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
