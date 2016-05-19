var Regular = require('regularjs');
module.exports = {
  "blog": {
    dataProvider: {

      "app.index": function(option, resolve){
        return {
          title: 'Hello Index'
        }
      },
      "app.blog": function(){
        return {
          title: 'Hello Blog',
        }
      },
      "app.blog.detail": function(){
        return {
          content: 'Blog Content Here'
        }
      }
    },
    routes: {
      "login": {
        view: Regular.extend({
          template: '<div class="m-login"></div>'
        })
      },
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
              <h2 class="index">{title}</h2>\
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
      },
      'app.lazyload': {
        view: function(option){
          return new Promise(function(resolve){
            setTimeout(function(){
              resolve(
                Regular.extend({
                  template: "<div class='lazyload'>LazyLoad</div>"
                })
              )
            }, 100)
          })
        }
      },
      "app.onlybrowser": {
        view: function(){
          if(Regular.env.node){
            return null
          }else{
            return Regular.extend({
              template: "<div class='onlybrowser'>onlybrowser</div>"
            })
          } 
        }
      }
    }
  }
}