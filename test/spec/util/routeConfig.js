var Regular = require('regularjs');
module.exports = {
  "blog": {
    dataProvider: {

      "app.index": function(){
        return {
          title: 'Hello Index'
        }
      },
      "app.blog": function(){
        return {
          title: 'Hello Blog'
        }
      },
      "app.blog.detail": function(){
        return {
          content: 'Blog Content Here'
        }
      }
    },
    routes: {
      'app': {
        url: '',
        view: Regular.extend({
          template: '<div rg-view ></div>'
        })
      },
      'app.index': {
        view: Regular.extend({
          template: 
            '<div>\
              <h2>{title}</h2>\
              <div rg-view ></div>\
            </div>'
        })

      },
      'app.blog': {
        view: Regular.extend({
          template: 
            '<div>\
              <h2 class="hook">{title}</h2>\
              <div rg-view ></div>\
            </div>' ,
            enter: function(){
              this.data.title='修改后的title'
            }
        })
      },
      'app.blog.detail': {
        url: ':id/detail',
        view: Regular.extend({
          template: 
            '<div>{content}</div>'
        })
      }
    }
  }
}