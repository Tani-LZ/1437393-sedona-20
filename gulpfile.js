const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const less = require("gulp-less");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const sync = require("browser-sync").create();
const csso = require("gulp-csso");
const rename = require("gulp-rename");
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");
const svgstore = require("gulp-svgstore");
const del = require("del");
const { series, parallel } = require("gulp");
const posthtml = require("gulp-posthtml");
const include = require("posthtml-include");
const htmlmin = require("gulp-htmlmin");
const uglify = require("gulp-uglify");

// Styles

const styles = () => {
  return gulp.src("source/less/style.less")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(rename("styles.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
};

exports.styles = styles;

const html = () => {
  return gulp.src("source/*.html")
  .pipe(posthtml([include()]))
  .pipe(htmlmin({ collapseWhitespace: true }))
  .pipe(gulp.dest("build"))
  .pipe(sync.stream());
}

exports.html = html;

const js = () => {
  return gulp.src("source/js/*.js")
    .pipe(uglify())
    .pipe(gulp.dest("build/js"))
};

exports.js = js;

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
};

exports.server = server;

// Watcher

const watcher = () => {
  gulp.watch("source/less/**/*.less", gulp.series("styles"));
  gulp.watch("source/*.html", gulp.series("html"));
  gulp.watch("source/js/*.js", gulp.series("js"));
};

exports.default = (done) => series(
  build, server, watcher
)
(done);

const images = () => {
  return gulp.src("source/img/**/*.{jpg,png,svg}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.mozjpeg({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("source/img"))
};

exports.images = images;

const createWebp = () => {
  return gulp.src("source/img/**/*.{jpg,png}")
  .pipe(webp({quality: 90}))
  .pipe(gulp.dest("source/img"))
};

exports.webp = createWebp;

const sprite = () => {
  return gulp.src("source/img/**/icon-*.svg")
    .pipe(svgstore())
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"))
};

exports.sprite = sprite;

const clean = () => {
  return del("build");
};

exports.clean = clean;

const copy = () => {
  return gulp.src([
    "source/fonts/**/*.{woff,woff2}",
    "source/img/**",
    "source/js/**",
    "source/*.ico"
  ], {
    base: "source"
  })
  .pipe(gulp.dest("build"));
} ;

exports.copy = copy;

const build = (done) => series(
  clean,
  parallel(copy, styles, sprite, html, js)
)
(done);
exports.build = build;
