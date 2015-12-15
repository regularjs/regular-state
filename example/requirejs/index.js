
require.config({
    paths : {
        "rgl": '../bower_components/requirejs-regular/rgl',
        "regularjs": '../bower_components/regularjs/dist/regular',
        "restate": '../restate',
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


  var format = function(){
    function fix(str){
      str = "" + (str || "");
      return str.length <= 1? "0" + str : str;
    }
    var maps = {
      'yyyy': function(date){return date.getFullYear()},
      'MM': function(date){return fix(date.getMonth() + 1); },
      'dd': function(date){ return fix(date.getDate()) },
      'HH': function(date){ return fix(date.getHours()) },
      'mm': function(date){ return fix(date.getMinutes())}
    }

    var trunk = new RegExp(Object.keys(maps).join('|'),'g');
    return function(value, format){
      format = format || "yyyy-MM-dd HH:mm";
      value = new Date(value);

      return format.replace(trunk, function(capture){
        return maps[capture]? maps[capture](value): "";
      });
    }
  }();

  Regular.filter("format", format)



  // Start Stateman.

  var stateman = restate({
    view: document.getElementById("#app"), 
    Component: Regular
  });

  // store infomation in 
  try{
      var username = localStorage.getItem("username");
      if(username) stateman.user = {name: username, id: -1}
  }catch(e){}


  stateman
    // application core
    .state("app", Application, "")

    // home page
    .state("app.index", Index, { url: ""})

    // blog
    .state("app.blog", Blog)
    .state("app.blog.detail", BlogDetail, {url: ":id/detail", rebuild: true })
    .state("app.blog.list", BlogList, "")
    .state("app.blog.edit", BlogEdit, ":id/edit")

    //chat 
    .state("app.chat", Chat)

    // user
    .state("app.user", User, "user/:uid")

    // redirect when notfound
    .on("notfound", function(){
      this.go("app.index", {replace: true})
    })

    // authen, need login first
    .on("begin", function(option){
      if(option.current.name !== "app.index" && !this.user){
        option.stop();
        this.go("app.index", {replace: true})
        alert("You need Login first")
      } 
    })

    // start the routing
    .start({html5: false, prefix: "!"})


    window.Regular = Regular;


});
