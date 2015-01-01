
require.config({
    paths : {
        "rgl": '../../bower_components/requirejs-regular/rgl',
        "regularjs": '../../bower_components/regularjs/dist/regular',
        "restate": '../../restate',
        "stateman": '../../bower_components/stateman/stateman'
    },
    rgl: {
      BEGIN: '{',
      END: '}'
    }
});


require([
  'restate',
  "./module/app.js",
  "./module/blog.js"
  // "./module/blog.detail.js",
  // "./module/blog.list.js",
  // "./module/blog.tag.js",
  // "./module/blog.category.js",
  // "./module/user.js",
], function(
    restate,
    Application,
    Blog
    // BlogDetail,
    // BlogList,
    // BlogTag,
    // BlogCategory,
    // User
  ){

  var stateman = restate({view: document.getElementById("#app")});

  stateman
    .state("app", Application)
    .state("app.blog", Blog)
    // .state("app.blog.detail", BlogDetail)
    // .state("app.blog.list", BlogList)
    // .state("app.blog.tag", BlogTag)
    // .state("app.blog.category", BlogCategory)
    // .state("app.user", User)
    .on("notfound", function(){
      this.go("app", {replace: true})
    })
    .start({ prefix: "!" })



});
