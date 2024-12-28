import fs from "fs"
import path from "path"
import { URL } from "url"
import gulp from "gulp"
import eslint from "gulp-eslint-new"
import typescript from "gulp-typescript"
import prettier from "gulp-prettier"

const buildDir = path.join(path.dirname(new URL(import.meta.url).pathname), "build")

export function clean(cb) {
  fs.rm(buildDir, { recursive: true, force: true }, cb)
}

export function lint() {
  return gulp.src([
    "src/**/*.ts", // source files
    "*.mjs",       // config files
  ]).pipe(eslint({ fix: true }))
    .pipe(eslint.fix())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
}

export function transpile() {
  return gulp.src("src/**/*.ts")
    .pipe(typescript.createProject("tsconfig.json")())
    .pipe(prettier())
    .pipe(gulp.dest("build"))
}

export function restore() {
  return gulp.src("appsscript.json")
    .pipe(gulp.dest("build"))
}

export default gulp.series(
  lint,
  clean,
  transpile,
  restore,
)
