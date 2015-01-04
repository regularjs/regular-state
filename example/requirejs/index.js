
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
  "./module/user.js",
  "./module/blog.detail.js",
  "./module/blog.list.js",
  "./module/blog.edit.js"
], function(
    restate,
    Regular,
    Application,
    Blog,
    Chat,
    Index,
    User,
    BlogDetail,
    BlogList,
    BlogEdit
  ){

  var stateman = restate({
    view: document.getElementById("#app"), 
    Component: Regular
  });


  stateman
    // application core
    .state("app", Application, "")

    // home page
    .state("app.index", Index, { url: ""})

    // blog
    .state("app.blog", Blog)
    .state("app.blog.detail", BlogDetail, ":id")
    .state("app.blog.list", BlogList, "")
    .state("app.blog.edit", BlogEdit)

    //chat module
    .state("app.chat", Chat)

    // user
    .state("app.user", User)
    // .state("app.user.list", UserList, "")
    // .state("app.user.detail", UserDetail, ":id")

    // redirect when notfound
    .on("notfound", function(){
      this.go("app.index", {replace: true})
    })

    // start the routing
    .start({html5:false, prefix: "!"})



});
