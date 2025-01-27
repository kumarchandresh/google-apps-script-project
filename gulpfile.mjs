/* global process */
import childProcess from "child_process";
import * as cspell from "cspell";
import fs from "fs";
import * as glob from "glob";
import gulp from "gulp";
import esbuild from "gulp-esbuild";
import eslint from "gulp-eslint-new";
import prettier from "gulp-prettier";
import typescript from "gulp-typescript";
import JSON5 from "json5";
import path from "path";
import yargs from "yargs";

const srcDir = path.join("src", "__lib__");

export function spellCheck(done) {
  return cspell.lint(["src/**/*.ts", "*.mjs"], {
    progress: true,
    issues: true,
    relative: true,
    showContext: true,
  }).then((result) => {
    if (result.errors) done(`${result.errors} errors`);
    if (result.issues) done(`${result.issues} issues`);
  });
}

export function codeCheck() {
  return gulp.src(["src/**/*.ts", "*.mjs"])
    .pipe(eslint({ fix: true }))
    .pipe(eslint.fix())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
}

export function typeCheck() {
  return gulp.src("src/**/*.ts")
    .pipe(typescript.createProject("tsconfig.json")());
}

export function lint(done) {
  return gulp.series(spellCheck, codeCheck, typeCheck)(done);
}

export function clean() {
  return fs.promises.rm("build", { recursive: true, force: true });
}

export async function compile() {
  const buffer = await fs.promises.readFile("tsconfig.json");
  const tsconfig = await JSON5.parse(buffer.toString());
  return gulp.src(glob.globSync("src/**/*.ts").filter(file => !file.endsWith(".d.ts") && !file.includes(srcDir)))
    .pipe(esbuild({
      minifyWhitespace: true,
      target: tsconfig.compilerOptions.target,
    }))
    .pipe(prettier({ printWidth: 120 }))
    .pipe(gulp.dest("build"));
}

export function bundle(done) {
  const { argv } = yargs(process.argv.slice(1));
  const args = Object.entries(argv)
    .filter(([k]) => !/^(_|\$\d+)$/.test(k))
    .flatMap(([k, v]) => typeof v == "boolean" ? `--${v ? "" : "no-"}${k}` : [`--${k}`, v]);
  childProcess.spawn("node", ["esbuild.mjs", ...args], { stdio: "inherit" }).on("close", done);
}

export function restore() {
  return gulp.src("appsscript.json")
    .pipe(gulp.dest("build"));
}

export function build(done) {
  return gulp.series(clean, compile, bundle, restore)(done);
}

export default function (done) {
  gulp.series(lint, build)(done);
}
