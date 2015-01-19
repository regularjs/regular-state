var through = require('through2');
var shell = require("gulp-shell");
var gulp = require('gulp');
var webpack = require('gulp-webpack');
var jshint = require('gulp-jshint');


var pkg = require("./package.json");  

    
var wpConfig = {

 output: {
    filename: "restate-full.js",
    library: "restate",
    libraryTarget: "umd"
  }
  
}


gulp.task('jshint', function(){
      // jshint
  gulp.src(['restate.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'))

})

 
gulp.task('build', ['jshint'], function() {
  gulp.src("restate.js")
    .pipe(gulp.dest('./example'))
    .pipe(webpack(wpConfig))
    .pipe(wrap(signatrue))
    .pipe(gulp.dest('./'))
    .on("error", function(err){
      throw err
    })
});

gulp.task("example:bower", shell.task([
  "cd example && bower install && cd .."
]))


gulp.task("example:requirejs", ["example:bower"], shell.task([
  "node ./example/requirejs/bundle.js"
]))

gulp.task("example:browserify" ,["example:bower"], function(){

})


gulp.task("example", [  "example:requirejs", "example:browserify"] )

gulp.task('watch', ["build", "example"], function(){
  gulp.watch(['restate.js'], ['build'])
})


gulp.task('default', [ 'watch']);


gulp.task('server', ['build', "example"], shell.task([
  "./node_modules/puer/bin/puer"
]))


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

function signatrue(file, enc, cb){
  var sign = '/**\n'+ '@author\t'+ pkg.author.name + '\n'+ '@version\t'+ pkg.version +
    '\n'+ '@homepage\t'+ pkg.homepage + '\n*/\n';
  file.contents =  Buffer.concat([new Buffer(sign), file.contents]);
  cb(null, file);
}

