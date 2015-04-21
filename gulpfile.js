var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");
var ngAnnotate = require('gulp-ng-annotate');
var replace = require('gulp-replace');

var pkg = require('./package.json');

gulp.task('default', function() {
    return gulp.src('src/*.js')
        .pipe(replace(/##_version_##/g, pkg.version))
        .pipe(ngAnnotate())
        .pipe(gulp.dest('release'))
        .pipe(uglify())
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(gulp.dest('release'));

});

gulp.task('bower', function() {
    return gulp.src('bowerTemplate.json')
        .pipe(replace(/##_version_##/g, pkg.version))
        .pipe(rename('bower.json'))
        .pipe(gulp.dest('.'));
});
