var webpack = require('gulp-webpack');
var jshint = require('gulp-jshint');
var Server = require("karma").Server;
var through = require('through2');
var shell = require("gulp-shell");
var gulp = require('gulp');
var istanbul = require('browserify-istanbul');






var pkg = require("./package.json");  

    
var karmaCommonConf = {
  browsers: ['PhantomJS'],
  frameworks: ['mocha', 'browserify'],
  files: [
    'test/runner/vendor/expect.js',
    'restate.js',
    'test/spec/*.js'
  ],
  client: {
    mocha: {ui: 'bdd'}
  },
  customLaunchers: {
    IE9: {
      base: 'IE',
      'x-ua-compatible': 'IE=EmulateIE9'
    },
    IE8: {
      base: 'IE',
      'x-ua-compatible': 'IE=EmulateIE8'
    },
    IE7: {
      base: 'IE',
      'x-ua-compatible': 'IE=EmulateIE7'
    }
  },

  preprocessors: {
     'restate.js': ['browserify' ],
     'test/spec/*.js': ['browserify']
 },
  browserify: {
      debug: true,
      transform: [istanbul({
        ignore: ['**/node_modules/**', '**/test/**'],
      })],
  },

  // coverage reporter generates the coverage
  reporters: ['coverage','progress'],

  // optionally, configure the reporter
  coverageReporter: { 
    type: 'html' 
  },
  singleRun: true
  
};



gulp.task('jshint', function(){
      // jshint
  gulp.src(['restate.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'))

})


 
gulp.task('build', ['jshint', 'buildtest'], function() {
  gulp.src("restate.js")
    .pipe(webpack({
       output: {
          filename: "restate.pack.js",
          library: "restate",
          libraryTarget: "umd"
        }
    }))
    .pipe(gulp.dest('./'))
    .on("error", function(err){
      throw err
    })
});



gulp.task('buildtest', function(){

  gulp.src("test/export.js")
    .pipe(webpack({
        output: {
          filename: "spec.pack.js"
        },
        devtool: 'source-map'
    }))
    .pipe(gulp.dest('./test/runner/'))
})


gulp.task('karma', ['build'] ,function (done) {
  var config =karmaCommonConf;
  var karma = new Server(config, done)
  config.coverageReporter = {type : 'text-summary'}
  karma.start();
});


gulp.task('watch', ["build"], function(){
  gulp.watch(['restate.js'], ['build'])
  gulp.watch(['test/spec/*.js', 'test/spec/export.js'], ['buildtest'])
})



gulp.task('default', [ 'watch']);
gulp.task('test', [ 'karma']);


var  deploy = require("gulp-gh-pages");

gulp.task('deploy', ['example'], function () {
  gulp.src("example/**/*.*")
    .pipe(deploy({
      remoteUrl: "git@github.com:regularjs/regular-state"
    }))
    .on("error", function(err){
      console.log(err)
    })
});

function wrap(fn){
  return through.obj(fn);
}


