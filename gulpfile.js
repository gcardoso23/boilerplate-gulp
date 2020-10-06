const { src, dest, watch, series, parallel } = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const babelify = require("babelify");
const browserify = require("browserify");
const source = require("vinyl-source-stream");
const buffer = require('vinyl-buffer');
const log = require('gulplog');

const paths = {
  input: {
    style: './assets/styles/index.scss',
    scripts: './assets/scripts/index.js'
  },
  output: {
    style: './dist/styles',
    scripts: './dist/scripts'
  },
  watchFiles: {
    style: './assets/styles/**/*.scss',
    scripts: './assets/scripts/**/*.js'
  }
}

function scss() {
  return src(paths.input.style)
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(sourcemaps.write('.'))
    .pipe(dest(paths.output.style)
  );
}

function scripts() {
  return (
    browserify({
      entries: paths.input.bundler,
      debug: true
    })
    .transform(babelify.configure({
      presets: ["@babel/preset-env"],
      plugins: ["@babel/plugin-transform-modules-commonjs", "@babel/plugin-transform-runtime"]
    }))
    .bundle()
    .pipe(source("bundle.js"))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(uglify())
    .on('error', log.error)
    .pipe(sourcemaps.write('./'))
    .pipe(dest(paths.output.scripts))
  );
}

function watchFiles() {
  watch([paths.watchFiles.style, paths.watchFiles.scripts],
    series(
      parallel(scss, scripts)
    )
  );
}

exports.deploy = series(parallel(scss, scripts));
exports.watch = series(parallel(scss, scripts), watchFiles);
