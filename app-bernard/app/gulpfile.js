var gulp = require('gulp'),
    less = require('gulp-less'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    livereload = require('gulp-livereload'),
    lr = require('tiny-lr'),
    server = lr();

var port = 35729;

gulp.task('styles', function() {
  return gulp.src('src/less/style.less')
    .pipe(less({ style: 'expanded', compass: true }))
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(minifycss({compatibility: 'ie9'}))
    .pipe(gulp.dest('src/'))
    .pipe(livereload(server))
    .pipe(notify({ message: 'Styles task complete' }));
});

gulp.task('html', function() {
    return gulp.src('*.html')
        .pipe(livereload(server))
        .pipe(notify({ message: 'HTML task complete' }));
});

gulp.task('watch', function() {
  livereload.listen();
  // Watch .scss files
  gulp.watch('src/less/**/*.less', ['styles']);
  gulp.watch('*.html', ['html']);
});

gulp.task('default', function() {
    gulp.start('styles');
});