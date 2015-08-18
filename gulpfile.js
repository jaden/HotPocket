'use strict';

var browserify = require('browserify');
var gulp       = require('gulp');
var source     = require('vinyl-source-stream');
var buffer     = require('vinyl-buffer');
var uglify     = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var gutil      = require('gulp-util');
var minify_css = require('gulp-minify-css');
var concat     = require('gulp-concat');
var jshint     = require('gulp-jshint');
var replace    = require('gulp-replace');
var rename     = require('gulp-rename');
var del        = require('del');

gulp.task('clean', function(callback) {
	del([
  		'public/css/bundle-*.min.css',
  		'public/js/bundle-*.min.js',
  	], callback);
});

gulp.task('browserify', ['clean'], function() {

	var b = browserify({
		entries: './resources/js/app.js',
		debug: false
	});

    return b.bundle()
    	.pipe(source('bundle.min.js')) // This file won't exist (yet)
    	.pipe(buffer())
    	.pipe(sourcemaps.init({loadMaps: true}))
	        .pipe(uglify())
	        .on('error', gutil.log)
    	.pipe(sourcemaps.write('./'))
    	.pipe(gulp.dest('./public/js/'));
});

gulp.task('styles', ['clean'], function() {
	return gulp.src([
			'public/css/bootstrap/bootstrap.min.css',
			'node_modules/nprogress/nprogress.css'],
			{ base: '.'})

		.pipe(minify_css())
		.pipe(concat('bundle.min.css'))
		.pipe(gulp.dest('public/css'));
});

// Only runs after js and styles have been generated
gulp.task('cache-bust', ['browserify', 'styles'], function() {
	var timestamp = new Date().getTime();

	gulp.src("./public/css/bundle.min.css")
  		.pipe(rename("./public/css/bundle-" + timestamp + ".min.css"))
  		.pipe(gulp.dest("."));

	gulp.src("./public/js/bundle.min.js")
  		.pipe(rename("./public/js/bundle-" + timestamp + ".min.js"))
  		.pipe(gulp.dest("."));

	return gulp.src('resources/views/index.php',
		{ base: '.' }) // To overwrite the src file http://stackoverflow.com/questions/22418799/can-gulp-overwrite-all-src-files

		.pipe(replace(/href="\/css\/bundle-[0-9]+\.min\.css"/,
			'href="/css/bundle-' + timestamp + '.min.css"'))

		.pipe(replace(/src="\/js\/bundle-[0-9]+\.min\.js"/,
			'src="/js/bundle-' + timestamp + '.min.js"'))

		.pipe(gulp.dest('.')); // Replace the source file
});

gulp.task('default', ['cache-bust']);

gulp.task('lint', function() {
	return gulp.src('./resources/js/*.js')
	    .pipe(jshint())
	    .pipe(jshint.reporter('default'));
});

gulp.task('watch', ['cache-bust'], function() {
    gulp.watch('./resources/js/**/*.js', ['cache-bust']);
});