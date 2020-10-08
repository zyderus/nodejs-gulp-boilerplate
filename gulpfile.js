const { src, dest, watch, series, parallel } = require('gulp');
const nodemon = require('gulp-nodemon');
const browsersync = require('browser-sync').create();
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
// Autoprefixer 10.0.1 is incompatible with postcss 9.0.0. downgrade to postcss@9.8.6
const autoprefixer = require('autoprefixer');
const terser = require('gulp-terser');
const imagemin = require('gulp-imagemin');
const del = require('del');


// Transfer files
function transfer() {
  return src([
    '**/*',
    '**/.*',
    '!node_modules/**',
    '!public/img/unoptimized/**',
    '!.env'
    ])
    .pipe(dest('dist'));
}


// Reload page in browser
function browserSync(done){
  browsersync.init(null, {
    proxy: 'http://localhost:10500',   // match to server port in index.js
  }, done);
}

// Run nodemon
function nodemonStart(done) {
  stream = nodemon({
    ext: 'js json',
    script: 'index.js',       // app server path and file name
    // watch: false,
    ignore: [
      'node_modules/',
      'public/',
      'views/',
      'package-lock.json',
      'package.json',
    ],
    env: { 'NODE_ENV': 'development' },
  })
    .on('start', function() {
      browsersync.reload();
      done();
    })
    .on('crash', function() {
      console.error('Crashed\n');
      stream.emit('restart', 1);
      done();
    });
}

// Delete current DIST folder
function clean() {
  return del('dist');
}

// Process HTML files
function html(done) {
  browsersync.reload();
  done();
}

// Process SCSS files
function style() {
  return src('public/scss/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(concat('styles.min.css'))
    .pipe(sass({outputStyle: 'compressed'}))
    .on('error', sass.logError)
    .pipe(postcss([autoprefixer({
      overrideBrowserslist: ["last 5 versions"]
    })]))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('public/css/'))
    .pipe(browsersync.stream());
}

// Process JS files
function js() {
  return src('public/js/sources/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(concat('main.min.js'))
    .pipe(terser())
    .pipe(sourcemaps.write('.'))
    .pipe(dest('public/js/'))
    .pipe(browsersync.stream());
}

// Process Images
function images() {
  return src('public/img/unoptimized/**/*')
    .pipe(imagemin({
      optimizationLevel: 3   // 0 - 7
    }))
    .pipe(dest('public/img/'))
    .pipe(browsersync.stream());
}

// Watch files for changes
function watchFiles(done) {
  watch('views/**/*', html);
  watch('public/scss/**/*.scss', style);
  watch('public/js/sources/**/*.js', js);
  watch('public/img/unoptimized/**/*', images);
  done();
}


// exports.default = parallel(series(browserSync, nodemonStart), watchFiles);
exports.default = series(nodemonStart, browserSync, watchFiles);
exports.build = series(clean, transfer);


// exports.style = style;
// exports.js = js;
// exports.images = images;