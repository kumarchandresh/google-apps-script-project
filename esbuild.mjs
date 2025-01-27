/* global process */
import esbuild from "esbuild";
import fs from "fs";
import * as glob from "glob";
import path from "path";
import * as prettier from "prettier";
import yargs from "yargs";

const srcDir = path.join("src", "__lib__");
const outDir = path.join("build", "__lib__");
const { argv } = yargs(process.argv.slice(1));
const all = argv.all ?? false;

const pkgs = {
  "lodash-fp": all,
  "ramda": all,
  "util": true,
  "pretty-format": all,
  "flatted": all,
  "zod": all,
  "htmlparser2": all,
  "cssSelect": all,
  "validator": all,
  ...argv,
};

const pkgBuilds = [
  // Clock goes first
  esbuild.build({
    entryPoints: [path.join(srcDir, "stopwatch.ts")],
    write: false,
  }),
  // https://www.npmjs.com/package/lodash
  esbuild.build(withDefaults({
    globalName: "_",
    entryPoints: ["lodash"],
  })),
];

if (pkgs["lodash-fp"]) {
  // https://www.npmjs.com/package/lodash
  pkgBuilds.push(esbuild.build(withDefaults({
    globalName: "f",
    entryPoints: ["lodash/fp"],
  })));
}

if (pkgs.ramda) {
  // https://www.npmjs.com/package/ramda
  pkgBuilds.push(esbuild.build(withDefaults({
    globalName: "R",
    entryPoints: ["ramda"],
  })));
}

// https://www.npmjs.com/package/ms
pkgBuilds.push(esbuild.build(withDefaults({
  globalName: "ms",
  entryPoints: ["ms"],
})));

// https://www.npmjs.com/package/luxon
pkgBuilds.push(esbuild.build(withDefaults({
  globalName: "luxon",
  entryPoints: ["luxon"],
  footer: {
    js: `
var DateTime=luxon.DateTime;
var Duration=luxon.Duration;
` },
})));

if (pkgs["pretty-format"] || !pkgs.util) {
  // https://www.npmjs.com/package/pretty-format
  pkgBuilds.push(esbuild.build(withDefaults({
    globalName: "pretty",
    entryPoints: ["pretty-format"],
    footer: {
      js: `
var stringify=pretty.format;
` },
  })));
}

if (pkgs.util) {
  // https://www.npmjs.com/package/util
  pkgBuilds.push(esbuild.build(withDefaults({
    globalName: "util",
    entryPoints: ["util"],
    banner: {
      // https://www.npmjs.com/package/process
      js: esbuild.buildSync(withDefaults({
        write: false,
        globalName: "process",
        entryPoints: ["process"],
      })).outputFiles.map(file => file.text).join("\n"),
    },
    footer: {
      js: `
var stringify=util.inspect;
` },
  })));
}

// https://www.npmjs.com/package/callsites
pkgBuilds.push(esbuild.build(withDefaults({
  globalName: "callsites",
  entryPoints: ["callsites"],
  footer: {
    js: `
var callsites=callsites.default;
` },
})));

if (pkgs.flatted) {
  // https://www.npmjs.com/package/flatted
  pkgBuilds.push(esbuild.build(withDefaults({
    globalName: "flatted",
    entryPoints: ["flatted"],
  })));
}

if (pkgs.zod) {
  // https://www.npmjs.com/package/zod
  pkgBuilds.push(esbuild.build(withDefaults({
    globalName: "zod",
    entryPoints: ["zod"],
    footer: {
      js: `
  var z=zod.z;
  ` },
  })));
}

if (pkgs.htmlparser2) {
  // https://www.npmjs.com/package/htmlparser2
  pkgBuilds.push(esbuild.build(withDefaults({
    globalName: "htmlparser2",
    entryPoints: ["htmlparser2"],
  })));
}

if (pkgs.cssSelect) {
  // https://www.npmjs.com/package/css-select
  pkgBuilds.push(esbuild.build(withDefaults({
    globalName: "cssSelect",
    entryPoints: ["css-select"],
  })));
}

if (pkgs.validator) {
  // https://www.npmjs.com/package/validator
  pkgBuilds.push(esbuild.build(withDefaults({
    globalName: "validator",
    entryPoints: ["validator"],
  })));
}

const libBuild = await esbuild.build({
  entryPoints: glob.globSync("src/**/*.ts")
    .filter(file => !file.endsWith(".d.ts"))
    .filter(file => file.includes(srcDir) && !file.includes(path.join(srcDir, "stopwatch.ts"))),
  outdir: ".tmp",
  write: false,
});

/** @param {import("esbuild").BuildOptions} options */
function withDefaults(options) {
  return Object.assign({
    write: false,
    bundle: true,
    minify: true,
    format: "iife",
  }, options);
}

const pkgBuild = await Promise.all(pkgBuilds);
const pkgContents = pkgBuild.map(result => result.outputFiles.map(f => f.text).join("\n")).join("\n");
const libContents = await prettier.format(libBuild.outputFiles.map(f => f.text).join("\n"), {
  parser: "babel",
  printWidth: 120,
});

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "bundle.min.js"), pkgContents, { encoding: "utf8" });
fs.writeFileSync(path.join(outDir, "framework.js"), libContents, { encoding: "utf8" });
