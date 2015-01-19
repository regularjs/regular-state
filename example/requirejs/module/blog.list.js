define([
  "regularjs", 
  "rgl!./blog.list.html", 
  '../components/pager.js',
  '../mock.js'
  ], function( Regular, tpl ,Pager, mock ){

  return Regular.extend({
    template: tpl,
    enter: function(option){
      this.update(option);
    },
    update: function(option){
      this.refresh(option.param.page || 1);
    },
    refresh: function(page, redirect){
      if(redirect) return this.$state.go("~", {param: {page: page}})
      var data = this.data;
      page = parseInt(page, 10);
      data.total = Math.floor(mock.blogs.length / 10);
      data.blogs = mock.blogs.slice( (page-1) * 10, page * 10);
      data.current = page;
      return false;
    },
    remove: function( blog, index){
      var data = this.data;

      mock.remove(blog.id, mock.blogs); 

      data.blogs.splice(index,1);
      
      return false; 
    }

  }).component("pager", Pager);
  
})



