var webpack = require('gulp-webpack');
var jshint = require('gulp-jshint');
var exec = require('child_process').exec;
var path = require('path');
var fs = require('fs');
var karma = require("karma").server;
var through = require('through2');
var shell = require("gulp-shell");
var mocha = require('gulp-mocha');
var gulp = require('gulp');
var git = require('gulp-git');
var istanbul = require('browserify-istanbul');




var pkg = require("./package.json");  

    
var karmaCommonConf = {
  browsers: ['PhantomJS'],
  frameworks: ['mocha', 'browserify'],
  files: [
    'test/runner/vendor/expect.js',
    'src/index.js',
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
     'src/*.js': ['browserify' ],
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
  gulp.src(['./index.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'))

})


 
gulp.task('build', ['jshint', 'buildtest'], function() {
  gulp.src("src/index.js")
    .pipe(webpack(require('./webpack.config')))
    .pipe(gulp.dest('./'))
    .on("error", function(err){
      throw err
    })
});


var deleteFolderRecursive = function (path) { 
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

gulp.task('fetch', function(){

  deleteFolderRecursive('./node_modules/regularjs');
  deleteFolderRecursive('./node_modules/stateman');
    
  exec('git clone ' + path.join(__dirname, "../regular regularjs"), {
    cwd: path.join(__dirname, 'node_modules')
  }, function(err){
    if(err) throw err
    exec('cd node_modules/regularjs & git checkout ssr'/*command*/,{}/*options, [optiona]l*/, function(err, stdout, stderr){
      console.log('stdout: ' + stdout);
      console.log('stderr: ' + stderr);
      console.log('regular fetch done')
    })
  })
  exec('git clone ' + path.join(__dirname, "../../stateman"), {
    cwd: path.join(__dirname, 'node_modules')
  }, function(err){
    if(err) throw err
    exec('cd node_modules/stateman & git checkout ssr'/*command*/,{}/*options, [optiona]l*/, function(err, stdout, stderr){
      console.log('stdout: ' + stdout);
      console.log('stderr: ' + stderr);
      console.log('stateman fetch done')
    })
  })
})



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
  config.coverageReporter = {type : 'text-summary'}
 karma.start(config, done)
});


gulp.task('mocha', function(){

  return gulp.src(['test/spec/test-*.js'])

    .pipe(mocha({reporter: 'spec' }) )

    .on('error', function(err){
      console.log(err)
      console.log('\u0007');
    })
    .on('end', function(){
      // before_mocha.clean();
    });
})


gulp.task('watch', ["build"], function(){
  gulp.watch(['src/*.js'], ['build'])
  gulp.watch(['test/**/*.js'], ['buildtest'])
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


