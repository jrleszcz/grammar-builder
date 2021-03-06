var gulp         = require('gulp')
  , source       = require('vinyl-source-stream')
  , streamify    = require('gulp-streamify')
  , browserify   = require('browserify')
  , uglify       = require('gulp-uglify')
  , rename       = require('gulp-rename')
  , flatten      = require('gulp-flatten')
  , sass         = require('gulp-sass')
  , autoprefixer = require('gulp-autoprefixer')
  , eslint       = require('gulp-eslint')
  , browserSync  = require('browser-sync').create();

// using vinyl-source-stream:
gulp.task('browserify', function () {
  var bundleStream = browserify('./src/app').bundle();

  bundleStream
    .pipe(source('index.js'))
    .pipe(rename('bundle.js'))
    .pipe(gulp.dest('./dist/js'));
});

gulp.task('browserify-minify', function () {
  var bundleStream = browserify('./src/app').bundle();

  bundleStream
    .pipe(source('index.js'))
    .pipe(streamify(uglify()))
    .pipe(rename('bundle.js'))
    .pipe(gulp.dest('./dist/js'));
});

gulp.task('copy-html', function () {
  gulp.src('./src/index.html')
    .pipe(gulp.dest('dist'));
  gulp.src('./src/app/**/*.html')
    .pipe(flatten())
    .pipe(gulp.dest('./dist/partials'));
});

gulp.task('copy-images', function () {
  gulp.src('./src/assets/images/*')
    .pipe(gulp.dest('dist/assets/images'));
});

gulp.task('copy-data', function () {
  gulp.src('./src/assets/data/*')
    .pipe(gulp.dest('./dist/assets/data'));
  gulp.src('./src/assets/data/grammars/*.json')
    .pipe(gulp.dest('./dist/assets/data/grammars'));
});

gulp.task('styles', function () {
  gulp.src('src/assets/sass/main.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions']
    }))
    .pipe(rename('bundle.css'))
    .pipe(gulp.dest('./dist/css'));
});

gulp.task('browser-sync', function () {
  browserSync.init({
    server: {
      baseDir: './dist'
    }
  });
});

gulp.task('lint', function () {
  return gulp.src(['src/**/*.js','!node_modules/**'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

// build for distribution
gulp.task('build', ['copy-html', 'copy-images', 'copy-data', 'styles', 'lint', 'browserify-minify'], function () {
  gulp.src('dist/index.html')
    .pipe(gulp.dest('./dist'));
});

gulp.task('default', ['copy-html', 'copy-data', 'styles', 'lint', 'browserify'], function () {
  gulp.watch('src/assets/sass/**/*.scss', ['styles']);
  gulp.watch('src/**/*.js', ['lint', 'browserify']);
  gulp.watch('src/**/*.html', ['copy-html']);
  browserSync.init({
    server: {
      baseDir: './dist'
    }
  });
  gulp.watch('./dist/**')
    .on('change', browserSync.reload);
});
