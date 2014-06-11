var gulp = require('gulp'),
    react = require('gulp-react'),
    browserify = require('gulp-browserify'),
    livereload = require('gulp-livereload'),
    uglify = require('gulp-uglify'),
    connect = require('gulp-connect'),
    replace = require('gulp-replace'),
    open = require('gulp-open'),
    plumber = require('gulp-plumber'),
    gulpif = require('gulp-if');

var flo = require('fb-flo'),
    fs = require('fs'),
    path = require('path'),
    exec = require('child_process').exec,
    psi = require('psi'),
    preprocess = require('gulp-preprocess')
    ;

var env = process.env.NODE_ENV || "dev";
var isProd = function() { return env === 'prod' };
var whenProd = function(act) { return gulpif(isProd(), act) };


/********************* MISC TASKS **********************/
gulp.task('psi', function (cb) {
   psi({
       nokey: 'true', // or use key: ‘YOUR_API_KEY’
       url: "http://localhost:8080",
       strategy: 'mobile',
   }, cb);
});
/*******************************************************/

function onError (error) {
  console.log(error);
}

gulp.task('scripts', function() {
    // Single entry point to browserify
    console.log("scripts with "+env)
    gulp.src('js/app.jsx')
        .pipe(plumber())
        .pipe(browserify({
          insertGlobals : true
        }))
        .pipe(react())
        .pipe(whenProd(uglify()))
        .pipe(gulpif(isProd(), gulp.dest('./dist/build/js'), gulp.dest('./build/js')))
        .pipe(connect.reload());
});

gulp.task('open', function() {
  var options = {
     url: "http://localhost:8080"
   };
   gulp.src("./index.html")
   .pipe(open("", options));
})

gulp.task('html', function() {
  gulp.src('./index.html')
    .pipe(replace('libs/react.js', '//cdnjs.cloudflare.com/ajax/libs/react/0.10.0/react.min.js'))
    .pipe(gulp.dest('./dist/'))
});


gulp.task('webserver', function() {
  connect.server({
    livereload: true
  });
});

gulp.task('watch', function() {
  gulp.watch(['./js/**/*.jsx', './css/**/*.css'], ['scripts'])
})

gulp.task('prodenv', function() {
  env = 'prod'
})

gulp.task('prod', ['prodenv','scripts', 'html'])

gulp.task('default', ['scripts', 'webserver', 'watch', 'open']);