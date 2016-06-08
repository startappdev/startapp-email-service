'use strict';

let gulp = require('gulp');
let gulpMocha = require('gulp-mocha');

gulp.task('test', () => {
    return gulp.src(['**/*.spec.js', '!node_modules/**', '!**/node_modules/**'], {read: false}).pipe(gulpMocha());
});

gulp.task('default', ['test']);
