import childProcess from "child_process"
import * as cspell from "cspell"
import fs from "fs"
import gulp from "gulp"
import eslint from "gulp-eslint-new"
import typescript from "gulp-typescript"

export function spellCheck(done) {
  return cspell.lint(["src/**/*.ts", "*.mjs"], {
    progress: true,
    issues: true,
    relative: true,
    showContext: true,
  }).catch(done)
    .then((result) => {
      if (result.errors) done(`${result.errors} errors`)
      if (result.issues) done(`${result.issues} issues`)
    })
}

export function codeCheck() {
  return gulp.src(["src/**/*.ts", "*.mjs"])
    .pipe(eslint({ fix: true }))
    .pipe(eslint.fix())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
}

export function typeCheck() {
  return gulp.src("src/**/*.ts")
    .pipe(typescript.createProject("tsconfig.json")())
}

export function lint(done) {
  return gulp.series(spellCheck, codeCheck, typeCheck)(done)
}

export function clean(done) {
  fs.rm("build", { recursive: true, force: true }, done)
}

export function esbuild(done) {
  childProcess.spawn("node", ["esbuild.mjs"], { stdio: "inherit" }).on("close", done)
}

export function restore() {
  return gulp.src("appsscript.json")
    .pipe(gulp.dest("build"))
}

export function build(done) {
  return gulp.series(lint, clean, esbuild, restore)(done)
}
