define(["regularjs", "rgl!./blog.edit.html", "./blog.detail.js" ,"../mock.js"], function( Regular, tpl , BlogDetail , mock){
  return Regular.extend({
    template: tpl,
    submit: function( title, content, id){
      var data = this.data;
      var $state = this.$state, id= parseInt(id);
      if(id == "-1"){ //add
        mock.blogs.unshift({
          user: $state.user,
          time: +new Date,
          content: content,
          title: title,
          id: mock.random(20000,100000000)
        })
        alert("add success")
        this.$state.go("app.blog.list");
      }else{
        var blog = mock.find(id, mock.blogs)
        blog.title = title;
        blog.content = content;
        blog.time = +new Date;
        alert("edit success")
        this.$state.go("app.blog.detail", {param: {id: id}});
      }
    },
    config: function(data){
      data.tags = [];
    },
    enter: function(option){
      this.update(option);
    },
    update: function(option){
      var blog;
      var id = parseInt(option.param.id);
      if(option.param.id != "-1"){
        blog = mock.find( id , mock.blogs);
      }else{
        blog = {}
      }
      this.data.title = blog.title;
      this.data.content = blog.content;
    }
   
  }).component("blog-preview", BlogDetail)
  .filter('split', {
    get: function(value, split){
      return value.join(split || "-");
    },
    set: function(value, split){
      return  value.split(split || "-");
    }
  })
})