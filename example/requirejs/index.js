
require.config({
    paths : {
        "rgl": '../bower_components/requirejs-regular/rgl',
        "regularjs": '../bower_components/regularjs/dist/regular',
        "restate": 'https://rawgit.com/regularjs/regular-state/master/restate',
        "stateman": '../bower_components/stateman/stateman'
    },
    rgl: {
      BEGIN: '{',
      END: '}'
    }
});


require([
  'restate',
  'regularjs',
  "./module/app.js",
  "./module/blog.js",
  "./module/chat.js",
  "rgl!./module/index.html",
  // "./module/blog.list.js",
  // "./module/blog.tag.js",
  // "./module/blog.category.js",
  // "./module/user.js",
], function(
    restate,
    Regular,
    Application,
    Blog,
    Chat,
    Index
    // BlogDetail,
    // BlogList,
    // BlogTag,
    // BlogCategory,
    // User
  ){

  var stateman = restate({view: document.getElementById("#app"), Component: Regular});


  stateman
    .state("app", Application, "")
    .state("app.index", Index, { url: ""})
    .state("app.blog", Blog)
    .state("app.chat", Chat)
    // .state("app.blog.detail", BlogDetail)
    // .state("app.blog.list", BlogList)
    // .state("app.blog.tag", BlogTag)
    // .state("app.blog.category", BlogCategory)
    // .state("app.user", User)
    .on("notfound", function(){
      this.go("app.index", {replace: true})
    })
    .start({ prefix: "!" })



});
