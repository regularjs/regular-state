require('es6-promise').polyfill();

var server = require('../../src/server.js');
var client = require('../../src/client.js');
var Regular = require('regularjs');
var dom = Regular.dom;
var loc = require ('./util/location');
var blogConfig = require('./util/routeConfig.js').blog;
var manager = server(blogConfig);
var extend = Regular.util.extend;
var localPathname = location.pathname;
var $ = function(sl, container){
  return (container || document).querySelector(sl)
}
var $$ = function(sl, container){
  return (container || document).querySelectorAll(sl)
}


describe("Simple Test", function(){
  
  it("renderToString -> rerender", function( done){
    var container = document.createElement('div');
    manager.run('/blog/1/detail?rid=3').then(function(arg){
      container.innerHTML = arg.html
      expect(container.firstElementChild.tagName.toLowerCase()).to.equal('div')
      blogConfig.ssr = true;
      client(blogConfig)
        .on('end', function(){
          expect(container.querySelector('.hook').innerHTML).to.equal('修改后的title');
          done()
        })
        .start({
          view: container,
          location:  loc('/blog/1/detail?rid=3'),
          html5: true
      })
    }).catch(function(err){
      throw err;
    })
  })

  it("renderToString -> rerender with server Data", function( done){

    var container = document.createElement('div');
    manager.run('/blog/1/detail?rid=3').then(function(arg){
      container.innerHTML = arg.html
      expect(container.firstElementChild.tagName.toLowerCase()).to.equal('div')
      
      var myConfig = Regular.util.extend({
        ssr: true,
        dataProvider: function(option){
          return arg.data[option.state.name]
        }
      }, blogConfig)
      client(myConfig)
        .on('end', function(){
          expect(container.querySelector('.hook').innerHTML).to.equal('修改后的title');
          done()
        })
        .start({
          view: container,
          location: loc('/blog/1/detail?rid=3'),
          html5: true
      })
    }).catch(function(err){
      throw err;
    })

  })

  it("navigate should destory ", function( done){
    var container = document.createElement('div');
    var myConfig = extend({
      ssr:false
    }, blogConfig)

    var clientManager = client(myConfig)
      .start({ 
        view: container,
        location: loc('/blog/1/detail?rid=3'),
        html5: true 
      },function(){
        clientManager.nav('/index', function(){
          expect(container.querySelector('.hook')).to.equal(null)
          expect(container.querySelector('h2').innerHTML).to.equal('Hello Index')
          clientManager.nav('/blog/1/detail', function(){
            expect(container.querySelector('.hook').innerHTML).to.equal('修改后的title')
            expect(container.querySelectorAll('h2').length).to.equal(1)
            done();
          })
        })
      })



  })

  it("navigate to lazyload", function(done){

    var container = document.createElement('div');
    manager.run('/lazyload').then(function(arg){
      container.innerHTML = arg.html
      expect(container.firstElementChild.tagName.toLowerCase()).to.equal('div')
      var myConfig = Regular.util.extend({
        ssr: true
      }, blogConfig)

      client(myConfig)
        .on('end', function(){
          expect(container.querySelector('.lazyload').innerHTML).to.equal('LazyLoad');
          done()
        })
        .start({
          view: container,
          location: loc('/lazyload'),
          html5: true
        })
    })
  })
  it("navigate to onlybrowser", function(done){

    var container = document.createElement('div');
    Regular.env.node = true;
    manager.run('/onlybrowser').then(function(arg){
      Regular.env.node = false;
      container.innerHTML = arg.html
      expect(container.querySelectorAll('div').length).to.equal(1);
      var myConfig = Regular.util.extend({
        ssr: true
      }, blogConfig)

      client(myConfig)
        .on('end', function(){
          expect(container.querySelector('.onlybrowser').innerHTML).to.equal('onlybrowser');
          done()
        })
        .start({
          view: container,
          location: loc('/onlybrowser'),
          html5: true
        })
    })
  })

  it("update should update the data", function(done){
     var container = document.createElement('div');
    var myConfig = extend({
      ssr:false
    }, blogConfig)

    var clientManager = client(myConfig)
      .start({ 
        view: container,
        location: loc('/blog/1/detail?rid=3'),
        html5: true 
      }, function(){
        expect(container.querySelector('.detail').innerHTML).to.equal(
         'Blog Content Here3'
        )
        clientManager.go('~', { param: {rid: 4} }, function(){

          expect(container.querySelector('.detail').innerHTML).to.equal(
           'Blog Content Here4'
          )
          done()
          
          
        })
      })

  })
})

describe("Regular extension", function(){
    var routeConfig = {
      dataProvider: {
        "app.blog.edit": function(option){
          return {
            id: option.param.id
          }
        },
        "app.blog.detail": function(option){
          return {
            id: option.param.id
          }
        }
      },
      routes: {
        'app':{
          url: "",
          view: Regular.extend({
            template: '<div class="app" r-view></div>'
          })
         },
        'app.blog': {
          view: Regular.extend({
            template: '<div class="blog" r-view></div>'
          })
        },
        'app.blog.edit': {
          url: ':id/edit',
          view: Regular.extend({
            template: '<div class="blog_edit"><a r-link="app.blog.detail({id: id})" ></a></div>'
          })
        },
        'app.blog.detail': {
          url: ':id',
          view: Regular.extend({
            template: '<div class="blog_detail"><a r-link="app.blog.edit({id: id})" ></a></div>'
          })
        } 
      }
    }
  it("r-link should work as expect", function( done){

    var container = document.createElement('div');


    var clientManager = client(extend({},routeConfig))
      .start({ 
        view: container,
        location: loc('/blog/1'),
        html5: true 
      }, function(){
        var link = container.querySelector('.blog_detail a')
        expect(link.pathname).to.equal(
          '/blog/1/edit'
        )
        clientManager.go('~', { param: {id: 4} }, function(){

          expect(link.pathname).to.equal(
            '/blog/4/edit'
          )
          done()
          
          
        })
      })

  })
  it('r-link should work at server', function(done){
    var manager = server(extend( {ssr: true}, routeConfig)) 
    var container = document.createElement('div');

    manager.run('/blog/1').then(function(options){
      container.innerHTML = options.html;
      var link = container.querySelector('.blog_detail a')
      expect(Regular.dom.attr(link, 'href')).to.equal('/blog/1/edit')
      done();
    })

  })

  it('r-link should work at hash mode', function(done){

    var container = document.createElement('div');

    var clientManager = client(extend( {},routeConfig) )
      .start({ 
        view: container,
        location: loc('#/blog/1'),
        html5: false 
      }, function(){
        var link = container.querySelector('.blog_detail a')
        expect(link.hash).to.equal(
          '#/blog/1/edit'
        )
        clientManager.go('~', { param: {id: 4} }, function(){

          expect(link.hash).to.equal(
            '#/blog/4/edit'
          )
          done()
          
        })
      })
  })



  it("autolink should work with r-link", function(done){

    var container = document.createElement('div');

    var clientManager = client(extend( {},routeConfig) )
      .start({ 
        view: container,
        location: loc('/blog/1'),
        html5: true 
      }, function(){
        var link = container.querySelector('.blog_detail a')
        expect(link.pathname).to.equal(
          '/blog/1/edit'
        )
        expect(Regular.dom.attr(link, 'data-autolink') == null).to.equal(false);
        done();
      })
  })
  it("r-link should work with Expression", function(done){

    var routeConfig = {

      routes: {
        'app':{
          url: "",
          view: Regular.extend({
            template: '<div class="app" r-view></div>'
          })
         },
        'app.blog': {
          view: Regular.extend({
            template: '<a class="a1" r-link="/app/blog"></a><a class="a2" r-link={"/app/blog/" + id}></a>',
            enter: function(){
              this.data.id = 1
            }
          })

        }
      }
    }
    var container = document.createElement('div');

    var clientManager = client(extend( {},routeConfig) )
      .start({ 
        view: container,
        location: loc('#/blog'),
        html5: false 
      }, function(){
        expect(dom.attr($('.a1', container), 'href')).to.equal(
          '#/app/blog'
        )
        expect(dom.attr($('.a2', container), 'href')).to.equal(
          '#/app/blog/1'
        )

        clientManager.stop();

        container.innerHTML = '';

        client(extend( {},routeConfig) ).start({
          html5: true,
          view: container,
          location: loc('/blog')
        }, function(){
          expect(dom.attr($('.a1', container), 'href')).to.equal(
            '/app/blog'
          )
          expect(dom.attr($('.a2', container), 'href')).to.equal(
            '/app/blog/1'
          )

          done()
        })
      })
  })
})