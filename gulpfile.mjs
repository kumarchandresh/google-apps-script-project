import { exec } from "child_process"
import fs from "fs"
import gulp from "gulp"
import eslint from "gulp-eslint-new"
import prettier from "gulp-prettier"
import typescript from "gulp-typescript"
import path from "path"

export function checkStyle() {
  return gulp.src([
    "src/**/*.ts", // source files
    "*.mjs",       // config files
  ]).pipe(eslint({ fix: true }))
    .pipe(eslint.fix())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
}

export function checkTypes() {
  return gulp.src("src/**/*.ts")
    .pipe(typescript.createProject("tsconfig.json")())
    .pipe(prettier())
    .pipe(gulp.dest("build"))
}

export function lint(done) {
  return gulp.series(checkStyle, checkTypes)(done)
}

export function clean(cb) {
  fs.rm(path.join(import.meta.dirname, "build"), {
    recursive: true,
    force: true,
  }, cb)
}

export function esbuild(cb) {
  exec("node esbuild.mjs", cb)
}

export function restore() {
  return gulp.src("appsscript.json")
    .pipe(gulp.dest("build"))
}

export function build(done) {
  return gulp.series(lint, clean, esbuild, restore)(done)
}

export default build
