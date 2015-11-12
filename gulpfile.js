'use strict';

var browserify = require('browserify');
var gulp       = require('gulp');
var source     = require('vinyl-source-stream');
var buffer     = require('vinyl-buffer');
var uglify     = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var util       = require('gulp-util');
var minify_css = require('gulp-minify-css');
var concat     = require('gulp-concat');
var jshint     = require('gulp-jshint');
var replace    = require('gulp-replace');
var rename     = require('gulp-rename');
var gulpif     = require('gulp-if');
var del        = require('del');
var fs         = require('fs');

// Set to true if run with --production flag, otherwise false.
var production = !! util.env.production;

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
        .pipe(source('bundle.min.js')) // This file doesn't exist (yet)
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(gulpif(production, uglify()))
        .on('error', util.log)
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./public/js/'));
});

gulp.task('styles', ['clean'], function() {
    return gulp.src(
        [
            'resources/css/bootstrap/bootstrap.min.css',
            'node_modules/nprogress/nprogress.css'
        ], { base: '.'})

        .pipe(gulpif(production, minify_css()))
        .pipe(concat('bundle.min.css'))
        .pipe(gulp.dest('public/css'));
});

// Only runs after js and styles have been generated
gulp.task('cache-bust', ['browserify', 'styles'], function() {
    if (! production) {
        fs.writeFileSync('.timestamp.php', "<?php $timestamp = '';");
        return;
    }

    var timestamp = new Date().getTime();

    gulp.src("./public/css/bundle.min.css")
        .pipe(rename("./public/css/bundle-" + timestamp + ".min.css"))
        .pipe(gulp.dest("."));

    gulp.src("./public/js/bundle.min.js")
        .pipe(rename("./public/js/bundle-" + timestamp + ".min.js"))
        .pipe(gulp.dest("."));

    fs.writeFileSync('.timestamp.php', "<?php $timestamp = '" + timestamp + "';");
});

gulp.task('lint', function() {
    return gulp.src('./resources/js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('watch', ['cache-bust'], function() {
    gulp.watch('./resources/js/**/*.js', ['cache-bust']);
});

gulp.task('default', ['cache-bust']);