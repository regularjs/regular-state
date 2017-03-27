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
      client(blogConfig)
        .on('end', function(){
          expect(container.querySelector('.hook').innerHTML).to.equal('修改后的title');
          done()
        })
        .start({
          ssr: true,
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
          ssr: true,
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
  it("ssr will auto set html5=true", function(){
      var container = document.createElement('div');
      var myConfig = extend({ ssr:false }, blogConfig)

      var clientManager = client(myConfig).start({
        ssr: true
      })
      expect(clientManager.history.html5).to.equal(true);
  })
})

describe("Regular extension", function(){
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
            template: '<div class="blog" r-view></div>'
          })
        },
        'app.blog.edit': {
          url: ':id/edit',
          view: Regular.extend({
            template: '<div class="blog_edit"><a r-link="app.blog.detail({id: id})" ></a></div>'
          }),
          data: function(option){
            return {
              id: option.param.id
            }
          }
        },
        'app.blog.detail': {
          url: ':id',
          view: Regular.extend({
            template: '<div class="blog_detail"><a r-link="app.blog.edit({id: id})" ></a></div>'
          }),
          data: function(option){
            return {
              id: option.param.id
            }
          }
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

  it("r-link with nested dom", function(done){
    var container = document.createElement('div');


    var clientManager = client(extend({ },routeConfig))

    clientManager.state({
      'app.link': {
        url: 'link/:id',
        view: Regular.extend({
          config: function(){
            this.data.id = 0
          },
          template: '<a id="blog" r-link="app.link({id: id })"><h2 ref=h2>Hello</h2></a>'

        })
      }
    });





    clientManager.start({ 
      view: container,
      location: loc('/link/1'),
      html5: true 
    }, function(){
      var link =$('#blog h2', container);
      dispatchMockEvent(link, 'click');
      setTimeout(function(){
        expect(clientManager.history.location.pathname).to.equal('/link/0')
        done()
      },0)
    })
  })

  it("r-link with 0", function( done){

    var container = document.createElement('div');


    var clientManager = client(extend({ },routeConfig))

    clientManager.state({
      'app.link': {
        url: 'link/:id',
        view: Regular.extend({
          config: function(){
            this.data.id = 0
          },
          template: '<a id="blog" r-link="app.link({id: id })"></a>'

        })
      }
    });


      clientManager.start({ 
        view: container,
        location: loc('/link/1'),
        html5: true 
      }, function(){
        var link = container.querySelector('#blog')
        expect(link.pathname).to.equal(
          '/link/0'
        )
        clientManager.go('~', { param: {id: 4} }, function(){

          expect(link.pathname).to.equal(
            '/link/0'
          )
          done()
          
          
        })
      })

  })

  it("r-link should work when no param passed in", function( done){
    var container = document.createElement('div');
    var clientManager = client({
      routes: {
        'a': {
          view: Regular.extend({
            template: '<a r-link="a()"></a><a r-link="a({id: 1})"></a>'
          })
        } 
      }
    }).start({ 
        view: container,
        location: loc('#/a'),
        html5: false 
      }, function(){
        var links = $$('a', container);
        expect(Regular.dom.attr(links[0],'href')).to.equal(
          '#/a'
        )
        expect(Regular.dom.attr(links[1],'href')).to.equal(
          '#/a?id=1'
        )
        done()
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


describe("Lifecycle", function(){
  var Lazy1Comp = Regular.extend({
    template: '<div class="lazy1"></div>'

  })
  var Lazy2Comp = Regular.extend({
    template: '<div class="lazy2"></div>'
  })
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
          template: '<div class="blog" r-view></div>',
          canLeave: function(){
            return false
          }
        })
      },
      'app.chat': {
        // @TODO: canEnter wont be proxied
        canEnter: function(option){
          return false
        },
        view: Regular.extend({
          template: '<div class="chat" r-view></div>'
        })
      },
      'app.user': {
        view: Regular.extend({
          template: '<div class="user" r-view></div>'
        })
      },
      'app.lazystatic': {
        view: function(option){
          var type = option.param.type
          var state = option.state;
          var type = option.param.type
          return new Promise(function(resolve, reject){
            var Comp = type == '2'? Lazy2Comp: Lazy1Comp;
            state.view = Comp;
            resolve(state.view);
          })
        }
      },
      'app.lazydynamic': {
        view: function(option){
          var type = option.param.type
          return new Promise(function(resolve, reject){
            var Comp = type == '2'? Lazy2Comp: Lazy1Comp;
            resolve(Comp);
          })
        }
      }
    }
  }
  it("canLeave should work", function( done){

      var container = document.createElement('div');
      var manager = client(extend( {},routeConfig) ).start({
        view: container,
        location: loc('/blog'),
        html5: true
      }, function(){
        manager.nav('/chat', function(){
          expect(manager.is('app.blog')).to.equal(true);
          done();
        })
      })
  })
  it("canEnter should work", function( done){

      var container = document.createElement('div');
      var manager = client(extend( {},routeConfig) ).start({
        view: container,
        location: loc('/blog'),
        html5: true
      }, function(){
        manager.nav('/chat', function(){
          expect(manager.is('app.blog')).to.equal(true);
          done();
        })
      })
  })

  it("state can setting ssr = false to avoding server side rendering", function( done ){
    var selfConfig = extend({ }, routeConfig)

    selfConfig.routes = extend({
      'app.nossr': {
        ssr: false,
        view: Regular.extend({
          template: '<div class="nossr"></div>'
        })
      }
    }, selfConfig.routes );

    var container = document.createElement('div');

    server( selfConfig ).run( '/nossr' ).then(function(opt){

      container.innerHTML = opt.html;
      expect($('.app', container) == null).to.equal(false);
      expect($('.app .nossr') == null).to.equal(true);
      var manager =client(selfConfig).start({
        ssr: true,
        location: loc('/nossr'),
        view: container
      }, function(){
        expect($('.app .nossr', container) == null).to.equal(false);
        done();
      })

    })


  })
  it("you can this.view = Component to avoid refetch async Component", function( done){
    var container = document.createElement('div');
    var selfConfig = extend({ }, routeConfig);
    var manager =client(selfConfig).start({
      html5: true,
      location: loc('/lazystatic') ,
      view: container
    }, function(){
      expect($('.app .lazy1', container) != null).to.equal(true);
      manager.nav('/lazystatic?type=2', function(){
        expect($('.app .lazy1', container) != null).to.equal(true);
        done();
      })
    })
  })

  it("you can get dynamic Component ", function(done){
    var container = document.createElement('div');
    var selfConfig = extend({ }, routeConfig);
    var manager =client(selfConfig).start({
      html5: true,
      location: loc('/lazydynamic') ,
      view: container
    }, function(){
      expect($('.app .lazy1', container) != null).to.equal(true);
      manager.nav('/lazydynamic?type=2', function(){
        expect($('.app .lazy2', container) != null).to.equal(true);
        done();
      })
    })
 
    
  })
  it("mount should called after both enter and update", function( done ){
    var def = {
      config: function(data){
        data.mount = 0;
        data.enter = 0;
      },
      mount: function(){
        this.data.mount++;
      },
      enter: function(){
        this.data.enter++;
      }
    }
    var routeConfig = {
      routes: {
        'a': {
          view: Regular.extend(extend({
            template: "<div class='a'>{enter}:{mount}</div><div r-view></div>",
          }, def))
        },
        'a.b': {
          view: Regular.extend(extend({
            template: "<div class='b'>{enter}:{mount}</div>",
          }, def))
        },
        'a.c': {
          view: Regular.extend(extend({
            template: "<div class='c'>{enter}:{mount}</div>",
          }, def))
        }
      }
    }
    var container = document.createElement('div')
    var manager =client(routeConfig).start({
      html5: true,
      location: loc('/a/b') ,
      view: container
    }, function(){
      expect($('.a', container).innerHTML).to.equal('1:1');
      expect($('.b', container).innerHTML).to.equal('1:1');
      manager.nav('/a/b?type=2', function(){
        expect($('.a', container).innerHTML).to.equal('1:2');
        expect($('.b', container).innerHTML).to.equal('1:2');
        manager.nav('/a/c?type=2', function(){
          expect($('.a', container).innerHTML).to.equal('1:3');
          expect($('.b', container)).to.equal(null);
          expect($('.c', container).innerHTML).to.equal('1:1');
          done()
        })
      })
    })
    
  })


  it('destroy module at leave will rebuild module when enter', function(done){

    var App = Regular.extend({ })

    var allDone = false;
    var touched ={
      blog: 0,
      chat: 0
    }

     var Blog = Regular.extend({
      enter: function(){
        touched.blog++;
        if( touched.blog === 2){
          expect(this.name).to.equal('blog');
        }
        this.name = 'blog';
        
      }
     })

     var Chat = Regular.extend({
       enter(){
          touched.chat++;
          if( touched.chat === 2){
            expect(this.name).to.equal(undefined);
          }
          this.name = 'chat'
       },
       leave(){
        this.destroy();
       }  
     });


    var container = document.createElement('div')
    var manager = client()
      //注册路由
       .state({
          'app': {
              view: App
          },
          'app.blog':{
              view: Blog
          },
          'app.chat':{
              view: Chat
          }
       }).start({ // 启动路由
          html5: true,
          location: loc('/app/blog') ,
          view:container
       }, function(){
          manager.go('app.chat', function(){
            manager.go('app.blog', function(){
              manager.go('app.chat', function(){
                expect(touched).to.eql({blog:2, chat:2})
                done()
              })
            })
          })
       }); 

  })
  // it("实现感兴趣的参数", function(done){
  //   var manager =client().state({
  //     'a': {
  //       view: Regular.extend({
  //         config: function( data){
  //           data.num = 1
  //         },
  //         template: '<div class=a >{num}</div>',
  //         enter: function(){
  //           this.data.num ++;
  //         }
  //       })
  //     },
  //     'b':{
  //       param: ['id'],
  //       view: Regular.extend({
  //         config: function( data){
  //           data.num = 1
  //         },
  //         template: '<div class=b >{num}</div>'
  //       })
  //     }
  //   }).start({
  //     html5: true,
  //     location: loc('/a') ,
  //     view: container
  //   }, function(){
  //     expect($('.a', container).innerHTML).to.equal('2');
  //     manager.nav('/b', function(){
  //       expect($('.b', container).innerHTML).to.equal('1');
  //       manager.nav('/a', function(){
  //         expect($('.a', container).innerHTML).to.equal('3');
  //         done()
  //       })
  //     })
  //   })
  // })
  it("mute(false) 失效啊", function(done){
    var container = document.createElement('div')
    var manager =client().state({
      'a': {
        view: Regular.extend({
          config: function( data){
            data.num = 1
          },
          template: '<div class=a >{num}</div>',
          enter: function(){
            this.data.num ++;
          }
        })
      },
      'b':{
        view: Regular.extend({
          config: function( data){
            data.num = 1
          },
          template: '<div class=b >{num}</div>'
        })
      }
    }).start({
      html5: true,
      location: loc('/a') ,
      view: container
    }, function(){
      expect($('.a', container).innerHTML).to.equal('2');
      manager.nav('/b', function(){
        expect($('.b', container).innerHTML).to.equal('1');
        manager.nav('/a', function(){
          expect($('.a', container).innerHTML).to.equal('3');
          done()
        })
      })
    })
  })

  it("实现自定义State功能, 不传入View", function( done ){

    var a = 1;
    var routeConfig = {
      routes: {
        'a': {
          view: Regular.extend({
            template: "<div class='a'></div><div class='container' r-view></div>",
          })
        },
        'a.b': {
          enter: function(){
            a = 2;
          },
          leave: function(){
            a = 1;
          }
        },
        'a.c': {
          view: Regular.extend({
            template: "<div class='c'></div>",
          })
        },
      }
    }

    var container = document.createElement('div')
    var manager =client(routeConfig).start({
      html5: true,
      location: loc('/a/b') ,
      view: container
    }, function(){
      expect($('.container', container).innerHTML).to.equal('');
      expect(a).to.equal(2)
      manager.nav('/a/c?type=2', function(){
        expect($('.container .c', container).nodeType).to.equal(1);
        expect(a).to.equal(1)
        done()
      })
    })

  })
})


