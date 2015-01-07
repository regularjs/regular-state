
define(["regularjs", "rgl!./blog.detail.html",'../mock.js'], function( Regular, tpl , mock){

  return Regular.extend({
    template: tpl,
    // when preview in edit page
    config: function(data){
      if(data.title){
        data.blog = {
          title: data.title,
          content: data.content
        }
        data.preview = true;
      }
    },
    enter: function(option){
      this.update(option);
    },
    update: function(option){
      var data = this.data;
      var id = parseInt(option.param.id);
      data.blog = mock.find( id, mock.blogs)
    }
  })
})