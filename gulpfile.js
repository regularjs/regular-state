var gulp = require("gulp"),
  deploy = require("gulp-gh-pages"),
  shell = require("gulp-shell");


gulp.task('build',  shell.task(['gitbook  build ./']));

gulp.task('deploy', ['build'], function () {
  return gulp.src("_book/**/*.*")
    .pipe(deploy({
      remoteUrl: "https://github.com/regularjs/regular-state"
    }))
    .on("error", function(err){
      console.log(err)
    })
});


gulp.task('publish')