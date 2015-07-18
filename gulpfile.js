'use strict';

// TODO Run jshint on build

var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var gutil = require('gulp-util');

gulp.task('browserify', function() {
	// set up the browserify instance on a task basis
	var b = browserify({
		entries: './resources/js/app.js',
		debug: true
	});

    return b.bundle()
    	.pipe(source('bundle.min.js')) // this is a "pretend" filename that doesn't exist yet
    	.pipe(buffer())
    	.pipe(sourcemaps.init({loadMaps: true}))
	        // Add transformation tasks to the pipeline here.
	        .pipe(uglify())
	        .on('error', gutil.log)
    	.pipe(sourcemaps.write('./'))
    	.pipe(gulp.dest('./public/js/'));
});

gulp.task('default', ['browserify']);