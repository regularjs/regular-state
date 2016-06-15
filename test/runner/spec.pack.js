/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1);
	__webpack_require__(2);

/***/ },
/* 1 */
/***/ function(module, exports) {



/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3).polyfill();
	
	var server = __webpack_require__(8);
	var client = __webpack_require__(47);
	var Regular = __webpack_require__(27);
	var dom = Regular.dom;
	var loc = __webpack_require__ (52);
	var blogConfig = __webpack_require__(53).blog;
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
	  it("实现感兴趣的参数", function(done){
	    throw new Error('you can this.view = Component to avoding Component')
	  })
	  it("自定义State，无法ssr, 并且考虑没有view的默认就是ssr:false", function(done){
	    
	  })
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
	
	


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var require;var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(process, global, module) {/*!
	 * @overview es6-promise - a tiny implementation of Promises/A+.
	 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
	 * @license   Licensed under MIT license
	 *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE
	 * @version   3.2.1
	 */
	
	(function() {
	    "use strict";
	    function lib$es6$promise$utils$$objectOrFunction(x) {
	      return typeof x === 'function' || (typeof x === 'object' && x !== null);
	    }
	
	    function lib$es6$promise$utils$$isFunction(x) {
	      return typeof x === 'function';
	    }
	
	    function lib$es6$promise$utils$$isMaybeThenable(x) {
	      return typeof x === 'object' && x !== null;
	    }
	
	    var lib$es6$promise$utils$$_isArray;
	    if (!Array.isArray) {
	      lib$es6$promise$utils$$_isArray = function (x) {
	        return Object.prototype.toString.call(x) === '[object Array]';
	      };
	    } else {
	      lib$es6$promise$utils$$_isArray = Array.isArray;
	    }
	
	    var lib$es6$promise$utils$$isArray = lib$es6$promise$utils$$_isArray;
	    var lib$es6$promise$asap$$len = 0;
	    var lib$es6$promise$asap$$vertxNext;
	    var lib$es6$promise$asap$$customSchedulerFn;
	
	    var lib$es6$promise$asap$$asap = function asap(callback, arg) {
	      lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len] = callback;
	      lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len + 1] = arg;
	      lib$es6$promise$asap$$len += 2;
	      if (lib$es6$promise$asap$$len === 2) {
	        // If len is 2, that means that we need to schedule an async flush.
	        // If additional callbacks are queued before the queue is flushed, they
	        // will be processed by this flush that we are scheduling.
	        if (lib$es6$promise$asap$$customSchedulerFn) {
	          lib$es6$promise$asap$$customSchedulerFn(lib$es6$promise$asap$$flush);
	        } else {
	          lib$es6$promise$asap$$scheduleFlush();
	        }
	      }
	    }
	
	    function lib$es6$promise$asap$$setScheduler(scheduleFn) {
	      lib$es6$promise$asap$$customSchedulerFn = scheduleFn;
	    }
	
	    function lib$es6$promise$asap$$setAsap(asapFn) {
	      lib$es6$promise$asap$$asap = asapFn;
	    }
	
	    var lib$es6$promise$asap$$browserWindow = (typeof window !== 'undefined') ? window : undefined;
	    var lib$es6$promise$asap$$browserGlobal = lib$es6$promise$asap$$browserWindow || {};
	    var lib$es6$promise$asap$$BrowserMutationObserver = lib$es6$promise$asap$$browserGlobal.MutationObserver || lib$es6$promise$asap$$browserGlobal.WebKitMutationObserver;
	    var lib$es6$promise$asap$$isNode = typeof self === 'undefined' && typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';
	
	    // test for web worker but not in IE10
	    var lib$es6$promise$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' &&
	      typeof importScripts !== 'undefined' &&
	      typeof MessageChannel !== 'undefined';
	
	    // node
	    function lib$es6$promise$asap$$useNextTick() {
	      // node version 0.10.x displays a deprecation warning when nextTick is used recursively
	      // see https://github.com/cujojs/when/issues/410 for details
	      return function() {
	        process.nextTick(lib$es6$promise$asap$$flush);
	      };
	    }
	
	    // vertx
	    function lib$es6$promise$asap$$useVertxTimer() {
	      return function() {
	        lib$es6$promise$asap$$vertxNext(lib$es6$promise$asap$$flush);
	      };
	    }
	
	    function lib$es6$promise$asap$$useMutationObserver() {
	      var iterations = 0;
	      var observer = new lib$es6$promise$asap$$BrowserMutationObserver(lib$es6$promise$asap$$flush);
	      var node = document.createTextNode('');
	      observer.observe(node, { characterData: true });
	
	      return function() {
	        node.data = (iterations = ++iterations % 2);
	      };
	    }
	
	    // web worker
	    function lib$es6$promise$asap$$useMessageChannel() {
	      var channel = new MessageChannel();
	      channel.port1.onmessage = lib$es6$promise$asap$$flush;
	      return function () {
	        channel.port2.postMessage(0);
	      };
	    }
	
	    function lib$es6$promise$asap$$useSetTimeout() {
	      return function() {
	        setTimeout(lib$es6$promise$asap$$flush, 1);
	      };
	    }
	
	    var lib$es6$promise$asap$$queue = new Array(1000);
	    function lib$es6$promise$asap$$flush() {
	      for (var i = 0; i < lib$es6$promise$asap$$len; i+=2) {
	        var callback = lib$es6$promise$asap$$queue[i];
	        var arg = lib$es6$promise$asap$$queue[i+1];
	
	        callback(arg);
	
	        lib$es6$promise$asap$$queue[i] = undefined;
	        lib$es6$promise$asap$$queue[i+1] = undefined;
	      }
	
	      lib$es6$promise$asap$$len = 0;
	    }
	
	    function lib$es6$promise$asap$$attemptVertx() {
	      try {
	        var r = require;
	        var vertx = __webpack_require__(6);
	        lib$es6$promise$asap$$vertxNext = vertx.runOnLoop || vertx.runOnContext;
	        return lib$es6$promise$asap$$useVertxTimer();
	      } catch(e) {
	        return lib$es6$promise$asap$$useSetTimeout();
	      }
	    }
	
	    var lib$es6$promise$asap$$scheduleFlush;
	    // Decide what async method to use to triggering processing of queued callbacks:
	    if (lib$es6$promise$asap$$isNode) {
	      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useNextTick();
	    } else if (lib$es6$promise$asap$$BrowserMutationObserver) {
	      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMutationObserver();
	    } else if (lib$es6$promise$asap$$isWorker) {
	      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMessageChannel();
	    } else if (lib$es6$promise$asap$$browserWindow === undefined && "function" === 'function') {
	      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$attemptVertx();
	    } else {
	      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useSetTimeout();
	    }
	    function lib$es6$promise$then$$then(onFulfillment, onRejection) {
	      var parent = this;
	
	      var child = new this.constructor(lib$es6$promise$$internal$$noop);
	
	      if (child[lib$es6$promise$$internal$$PROMISE_ID] === undefined) {
	        lib$es6$promise$$internal$$makePromise(child);
	      }
	
	      var state = parent._state;
	
	      if (state) {
	        var callback = arguments[state - 1];
	        lib$es6$promise$asap$$asap(function(){
	          lib$es6$promise$$internal$$invokeCallback(state, child, callback, parent._result);
	        });
	      } else {
	        lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection);
	      }
	
	      return child;
	    }
	    var lib$es6$promise$then$$default = lib$es6$promise$then$$then;
	    function lib$es6$promise$promise$resolve$$resolve(object) {
	      /*jshint validthis:true */
	      var Constructor = this;
	
	      if (object && typeof object === 'object' && object.constructor === Constructor) {
	        return object;
	      }
	
	      var promise = new Constructor(lib$es6$promise$$internal$$noop);
	      lib$es6$promise$$internal$$resolve(promise, object);
	      return promise;
	    }
	    var lib$es6$promise$promise$resolve$$default = lib$es6$promise$promise$resolve$$resolve;
	    var lib$es6$promise$$internal$$PROMISE_ID = Math.random().toString(36).substring(16);
	
	    function lib$es6$promise$$internal$$noop() {}
	
	    var lib$es6$promise$$internal$$PENDING   = void 0;
	    var lib$es6$promise$$internal$$FULFILLED = 1;
	    var lib$es6$promise$$internal$$REJECTED  = 2;
	
	    var lib$es6$promise$$internal$$GET_THEN_ERROR = new lib$es6$promise$$internal$$ErrorObject();
	
	    function lib$es6$promise$$internal$$selfFulfillment() {
	      return new TypeError("You cannot resolve a promise with itself");
	    }
	
	    function lib$es6$promise$$internal$$cannotReturnOwn() {
	      return new TypeError('A promises callback cannot return that same promise.');
	    }
	
	    function lib$es6$promise$$internal$$getThen(promise) {
	      try {
	        return promise.then;
	      } catch(error) {
	        lib$es6$promise$$internal$$GET_THEN_ERROR.error = error;
	        return lib$es6$promise$$internal$$GET_THEN_ERROR;
	      }
	    }
	
	    function lib$es6$promise$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
	      try {
	        then.call(value, fulfillmentHandler, rejectionHandler);
	      } catch(e) {
	        return e;
	      }
	    }
	
	    function lib$es6$promise$$internal$$handleForeignThenable(promise, thenable, then) {
	       lib$es6$promise$asap$$asap(function(promise) {
	        var sealed = false;
	        var error = lib$es6$promise$$internal$$tryThen(then, thenable, function(value) {
	          if (sealed) { return; }
	          sealed = true;
	          if (thenable !== value) {
	            lib$es6$promise$$internal$$resolve(promise, value);
	          } else {
	            lib$es6$promise$$internal$$fulfill(promise, value);
	          }
	        }, function(reason) {
	          if (sealed) { return; }
	          sealed = true;
	
	          lib$es6$promise$$internal$$reject(promise, reason);
	        }, 'Settle: ' + (promise._label || ' unknown promise'));
	
	        if (!sealed && error) {
	          sealed = true;
	          lib$es6$promise$$internal$$reject(promise, error);
	        }
	      }, promise);
	    }
	
	    function lib$es6$promise$$internal$$handleOwnThenable(promise, thenable) {
	      if (thenable._state === lib$es6$promise$$internal$$FULFILLED) {
	        lib$es6$promise$$internal$$fulfill(promise, thenable._result);
	      } else if (thenable._state === lib$es6$promise$$internal$$REJECTED) {
	        lib$es6$promise$$internal$$reject(promise, thenable._result);
	      } else {
	        lib$es6$promise$$internal$$subscribe(thenable, undefined, function(value) {
	          lib$es6$promise$$internal$$resolve(promise, value);
	        }, function(reason) {
	          lib$es6$promise$$internal$$reject(promise, reason);
	        });
	      }
	    }
	
	    function lib$es6$promise$$internal$$handleMaybeThenable(promise, maybeThenable, then) {
	      if (maybeThenable.constructor === promise.constructor &&
	          then === lib$es6$promise$then$$default &&
	          constructor.resolve === lib$es6$promise$promise$resolve$$default) {
	        lib$es6$promise$$internal$$handleOwnThenable(promise, maybeThenable);
	      } else {
	        if (then === lib$es6$promise$$internal$$GET_THEN_ERROR) {
	          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$GET_THEN_ERROR.error);
	        } else if (then === undefined) {
	          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
	        } else if (lib$es6$promise$utils$$isFunction(then)) {
	          lib$es6$promise$$internal$$handleForeignThenable(promise, maybeThenable, then);
	        } else {
	          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
	        }
	      }
	    }
	
	    function lib$es6$promise$$internal$$resolve(promise, value) {
	      if (promise === value) {
	        lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$selfFulfillment());
	      } else if (lib$es6$promise$utils$$objectOrFunction(value)) {
	        lib$es6$promise$$internal$$handleMaybeThenable(promise, value, lib$es6$promise$$internal$$getThen(value));
	      } else {
	        lib$es6$promise$$internal$$fulfill(promise, value);
	      }
	    }
	
	    function lib$es6$promise$$internal$$publishRejection(promise) {
	      if (promise._onerror) {
	        promise._onerror(promise._result);
	      }
	
	      lib$es6$promise$$internal$$publish(promise);
	    }
	
	    function lib$es6$promise$$internal$$fulfill(promise, value) {
	      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }
	
	      promise._result = value;
	      promise._state = lib$es6$promise$$internal$$FULFILLED;
	
	      if (promise._subscribers.length !== 0) {
	        lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, promise);
	      }
	    }
	
	    function lib$es6$promise$$internal$$reject(promise, reason) {
	      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }
	      promise._state = lib$es6$promise$$internal$$REJECTED;
	      promise._result = reason;
	
	      lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publishRejection, promise);
	    }
	
	    function lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
	      var subscribers = parent._subscribers;
	      var length = subscribers.length;
	
	      parent._onerror = null;
	
	      subscribers[length] = child;
	      subscribers[length + lib$es6$promise$$internal$$FULFILLED] = onFulfillment;
	      subscribers[length + lib$es6$promise$$internal$$REJECTED]  = onRejection;
	
	      if (length === 0 && parent._state) {
	        lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, parent);
	      }
	    }
	
	    function lib$es6$promise$$internal$$publish(promise) {
	      var subscribers = promise._subscribers;
	      var settled = promise._state;
	
	      if (subscribers.length === 0) { return; }
	
	      var child, callback, detail = promise._result;
	
	      for (var i = 0; i < subscribers.length; i += 3) {
	        child = subscribers[i];
	        callback = subscribers[i + settled];
	
	        if (child) {
	          lib$es6$promise$$internal$$invokeCallback(settled, child, callback, detail);
	        } else {
	          callback(detail);
	        }
	      }
	
	      promise._subscribers.length = 0;
	    }
	
	    function lib$es6$promise$$internal$$ErrorObject() {
	      this.error = null;
	    }
	
	    var lib$es6$promise$$internal$$TRY_CATCH_ERROR = new lib$es6$promise$$internal$$ErrorObject();
	
	    function lib$es6$promise$$internal$$tryCatch(callback, detail) {
	      try {
	        return callback(detail);
	      } catch(e) {
	        lib$es6$promise$$internal$$TRY_CATCH_ERROR.error = e;
	        return lib$es6$promise$$internal$$TRY_CATCH_ERROR;
	      }
	    }
	
	    function lib$es6$promise$$internal$$invokeCallback(settled, promise, callback, detail) {
	      var hasCallback = lib$es6$promise$utils$$isFunction(callback),
	          value, error, succeeded, failed;
	
	      if (hasCallback) {
	        value = lib$es6$promise$$internal$$tryCatch(callback, detail);
	
	        if (value === lib$es6$promise$$internal$$TRY_CATCH_ERROR) {
	          failed = true;
	          error = value.error;
	          value = null;
	        } else {
	          succeeded = true;
	        }
	
	        if (promise === value) {
	          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$cannotReturnOwn());
	          return;
	        }
	
	      } else {
	        value = detail;
	        succeeded = true;
	      }
	
	      if (promise._state !== lib$es6$promise$$internal$$PENDING) {
	        // noop
	      } else if (hasCallback && succeeded) {
	        lib$es6$promise$$internal$$resolve(promise, value);
	      } else if (failed) {
	        lib$es6$promise$$internal$$reject(promise, error);
	      } else if (settled === lib$es6$promise$$internal$$FULFILLED) {
	        lib$es6$promise$$internal$$fulfill(promise, value);
	      } else if (settled === lib$es6$promise$$internal$$REJECTED) {
	        lib$es6$promise$$internal$$reject(promise, value);
	      }
	    }
	
	    function lib$es6$promise$$internal$$initializePromise(promise, resolver) {
	      try {
	        resolver(function resolvePromise(value){
	          lib$es6$promise$$internal$$resolve(promise, value);
	        }, function rejectPromise(reason) {
	          lib$es6$promise$$internal$$reject(promise, reason);
	        });
	      } catch(e) {
	        lib$es6$promise$$internal$$reject(promise, e);
	      }
	    }
	
	    var lib$es6$promise$$internal$$id = 0;
	    function lib$es6$promise$$internal$$nextId() {
	      return lib$es6$promise$$internal$$id++;
	    }
	
	    function lib$es6$promise$$internal$$makePromise(promise) {
	      promise[lib$es6$promise$$internal$$PROMISE_ID] = lib$es6$promise$$internal$$id++;
	      promise._state = undefined;
	      promise._result = undefined;
	      promise._subscribers = [];
	    }
	
	    function lib$es6$promise$promise$all$$all(entries) {
	      return new lib$es6$promise$enumerator$$default(this, entries).promise;
	    }
	    var lib$es6$promise$promise$all$$default = lib$es6$promise$promise$all$$all;
	    function lib$es6$promise$promise$race$$race(entries) {
	      /*jshint validthis:true */
	      var Constructor = this;
	
	      if (!lib$es6$promise$utils$$isArray(entries)) {
	        return new Constructor(function(resolve, reject) {
	          reject(new TypeError('You must pass an array to race.'));
	        });
	      } else {
	        return new Constructor(function(resolve, reject) {
	          var length = entries.length;
	          for (var i = 0; i < length; i++) {
	            Constructor.resolve(entries[i]).then(resolve, reject);
	          }
	        });
	      }
	    }
	    var lib$es6$promise$promise$race$$default = lib$es6$promise$promise$race$$race;
	    function lib$es6$promise$promise$reject$$reject(reason) {
	      /*jshint validthis:true */
	      var Constructor = this;
	      var promise = new Constructor(lib$es6$promise$$internal$$noop);
	      lib$es6$promise$$internal$$reject(promise, reason);
	      return promise;
	    }
	    var lib$es6$promise$promise$reject$$default = lib$es6$promise$promise$reject$$reject;
	
	
	    function lib$es6$promise$promise$$needsResolver() {
	      throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
	    }
	
	    function lib$es6$promise$promise$$needsNew() {
	      throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
	    }
	
	    var lib$es6$promise$promise$$default = lib$es6$promise$promise$$Promise;
	    /**
	      Promise objects represent the eventual result of an asynchronous operation. The
	      primary way of interacting with a promise is through its `then` method, which
	      registers callbacks to receive either a promise's eventual value or the reason
	      why the promise cannot be fulfilled.
	
	      Terminology
	      -----------
	
	      - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
	      - `thenable` is an object or function that defines a `then` method.
	      - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
	      - `exception` is a value that is thrown using the throw statement.
	      - `reason` is a value that indicates why a promise was rejected.
	      - `settled` the final resting state of a promise, fulfilled or rejected.
	
	      A promise can be in one of three states: pending, fulfilled, or rejected.
	
	      Promises that are fulfilled have a fulfillment value and are in the fulfilled
	      state.  Promises that are rejected have a rejection reason and are in the
	      rejected state.  A fulfillment value is never a thenable.
	
	      Promises can also be said to *resolve* a value.  If this value is also a
	      promise, then the original promise's settled state will match the value's
	      settled state.  So a promise that *resolves* a promise that rejects will
	      itself reject, and a promise that *resolves* a promise that fulfills will
	      itself fulfill.
	
	
	      Basic Usage:
	      ------------
	
	      ```js
	      var promise = new Promise(function(resolve, reject) {
	        // on success
	        resolve(value);
	
	        // on failure
	        reject(reason);
	      });
	
	      promise.then(function(value) {
	        // on fulfillment
	      }, function(reason) {
	        // on rejection
	      });
	      ```
	
	      Advanced Usage:
	      ---------------
	
	      Promises shine when abstracting away asynchronous interactions such as
	      `XMLHttpRequest`s.
	
	      ```js
	      function getJSON(url) {
	        return new Promise(function(resolve, reject){
	          var xhr = new XMLHttpRequest();
	
	          xhr.open('GET', url);
	          xhr.onreadystatechange = handler;
	          xhr.responseType = 'json';
	          xhr.setRequestHeader('Accept', 'application/json');
	          xhr.send();
	
	          function handler() {
	            if (this.readyState === this.DONE) {
	              if (this.status === 200) {
	                resolve(this.response);
	              } else {
	                reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
	              }
	            }
	          };
	        });
	      }
	
	      getJSON('/posts.json').then(function(json) {
	        // on fulfillment
	      }, function(reason) {
	        // on rejection
	      });
	      ```
	
	      Unlike callbacks, promises are great composable primitives.
	
	      ```js
	      Promise.all([
	        getJSON('/posts'),
	        getJSON('/comments')
	      ]).then(function(values){
	        values[0] // => postsJSON
	        values[1] // => commentsJSON
	
	        return values;
	      });
	      ```
	
	      @class Promise
	      @param {function} resolver
	      Useful for tooling.
	      @constructor
	    */
	    function lib$es6$promise$promise$$Promise(resolver) {
	      this[lib$es6$promise$$internal$$PROMISE_ID] = lib$es6$promise$$internal$$nextId();
	      this._result = this._state = undefined;
	      this._subscribers = [];
	
	      if (lib$es6$promise$$internal$$noop !== resolver) {
	        typeof resolver !== 'function' && lib$es6$promise$promise$$needsResolver();
	        this instanceof lib$es6$promise$promise$$Promise ? lib$es6$promise$$internal$$initializePromise(this, resolver) : lib$es6$promise$promise$$needsNew();
	      }
	    }
	
	    lib$es6$promise$promise$$Promise.all = lib$es6$promise$promise$all$$default;
	    lib$es6$promise$promise$$Promise.race = lib$es6$promise$promise$race$$default;
	    lib$es6$promise$promise$$Promise.resolve = lib$es6$promise$promise$resolve$$default;
	    lib$es6$promise$promise$$Promise.reject = lib$es6$promise$promise$reject$$default;
	    lib$es6$promise$promise$$Promise._setScheduler = lib$es6$promise$asap$$setScheduler;
	    lib$es6$promise$promise$$Promise._setAsap = lib$es6$promise$asap$$setAsap;
	    lib$es6$promise$promise$$Promise._asap = lib$es6$promise$asap$$asap;
	
	    lib$es6$promise$promise$$Promise.prototype = {
	      constructor: lib$es6$promise$promise$$Promise,
	
	    /**
	      The primary way of interacting with a promise is through its `then` method,
	      which registers callbacks to receive either a promise's eventual value or the
	      reason why the promise cannot be fulfilled.
	
	      ```js
	      findUser().then(function(user){
	        // user is available
	      }, function(reason){
	        // user is unavailable, and you are given the reason why
	      });
	      ```
	
	      Chaining
	      --------
	
	      The return value of `then` is itself a promise.  This second, 'downstream'
	      promise is resolved with the return value of the first promise's fulfillment
	      or rejection handler, or rejected if the handler throws an exception.
	
	      ```js
	      findUser().then(function (user) {
	        return user.name;
	      }, function (reason) {
	        return 'default name';
	      }).then(function (userName) {
	        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
	        // will be `'default name'`
	      });
	
	      findUser().then(function (user) {
	        throw new Error('Found user, but still unhappy');
	      }, function (reason) {
	        throw new Error('`findUser` rejected and we're unhappy');
	      }).then(function (value) {
	        // never reached
	      }, function (reason) {
	        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
	        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
	      });
	      ```
	      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
	
	      ```js
	      findUser().then(function (user) {
	        throw new PedagogicalException('Upstream error');
	      }).then(function (value) {
	        // never reached
	      }).then(function (value) {
	        // never reached
	      }, function (reason) {
	        // The `PedgagocialException` is propagated all the way down to here
	      });
	      ```
	
	      Assimilation
	      ------------
	
	      Sometimes the value you want to propagate to a downstream promise can only be
	      retrieved asynchronously. This can be achieved by returning a promise in the
	      fulfillment or rejection handler. The downstream promise will then be pending
	      until the returned promise is settled. This is called *assimilation*.
	
	      ```js
	      findUser().then(function (user) {
	        return findCommentsByAuthor(user);
	      }).then(function (comments) {
	        // The user's comments are now available
	      });
	      ```
	
	      If the assimliated promise rejects, then the downstream promise will also reject.
	
	      ```js
	      findUser().then(function (user) {
	        return findCommentsByAuthor(user);
	      }).then(function (comments) {
	        // If `findCommentsByAuthor` fulfills, we'll have the value here
	      }, function (reason) {
	        // If `findCommentsByAuthor` rejects, we'll have the reason here
	      });
	      ```
	
	      Simple Example
	      --------------
	
	      Synchronous Example
	
	      ```javascript
	      var result;
	
	      try {
	        result = findResult();
	        // success
	      } catch(reason) {
	        // failure
	      }
	      ```
	
	      Errback Example
	
	      ```js
	      findResult(function(result, err){
	        if (err) {
	          // failure
	        } else {
	          // success
	        }
	      });
	      ```
	
	      Promise Example;
	
	      ```javascript
	      findResult().then(function(result){
	        // success
	      }, function(reason){
	        // failure
	      });
	      ```
	
	      Advanced Example
	      --------------
	
	      Synchronous Example
	
	      ```javascript
	      var author, books;
	
	      try {
	        author = findAuthor();
	        books  = findBooksByAuthor(author);
	        // success
	      } catch(reason) {
	        // failure
	      }
	      ```
	
	      Errback Example
	
	      ```js
	
	      function foundBooks(books) {
	
	      }
	
	      function failure(reason) {
	
	      }
	
	      findAuthor(function(author, err){
	        if (err) {
	          failure(err);
	          // failure
	        } else {
	          try {
	            findBoooksByAuthor(author, function(books, err) {
	              if (err) {
	                failure(err);
	              } else {
	                try {
	                  foundBooks(books);
	                } catch(reason) {
	                  failure(reason);
	                }
	              }
	            });
	          } catch(error) {
	            failure(err);
	          }
	          // success
	        }
	      });
	      ```
	
	      Promise Example;
	
	      ```javascript
	      findAuthor().
	        then(findBooksByAuthor).
	        then(function(books){
	          // found books
	      }).catch(function(reason){
	        // something went wrong
	      });
	      ```
	
	      @method then
	      @param {Function} onFulfilled
	      @param {Function} onRejected
	      Useful for tooling.
	      @return {Promise}
	    */
	      then: lib$es6$promise$then$$default,
	
	    /**
	      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
	      as the catch block of a try/catch statement.
	
	      ```js
	      function findAuthor(){
	        throw new Error('couldn't find that author');
	      }
	
	      // synchronous
	      try {
	        findAuthor();
	      } catch(reason) {
	        // something went wrong
	      }
	
	      // async with promises
	      findAuthor().catch(function(reason){
	        // something went wrong
	      });
	      ```
	
	      @method catch
	      @param {Function} onRejection
	      Useful for tooling.
	      @return {Promise}
	    */
	      'catch': function(onRejection) {
	        return this.then(null, onRejection);
	      }
	    };
	    var lib$es6$promise$enumerator$$default = lib$es6$promise$enumerator$$Enumerator;
	    function lib$es6$promise$enumerator$$Enumerator(Constructor, input) {
	      this._instanceConstructor = Constructor;
	      this.promise = new Constructor(lib$es6$promise$$internal$$noop);
	
	      if (!this.promise[lib$es6$promise$$internal$$PROMISE_ID]) {
	        lib$es6$promise$$internal$$makePromise(this.promise);
	      }
	
	      if (lib$es6$promise$utils$$isArray(input)) {
	        this._input     = input;
	        this.length     = input.length;
	        this._remaining = input.length;
	
	        this._result = new Array(this.length);
	
	        if (this.length === 0) {
	          lib$es6$promise$$internal$$fulfill(this.promise, this._result);
	        } else {
	          this.length = this.length || 0;
	          this._enumerate();
	          if (this._remaining === 0) {
	            lib$es6$promise$$internal$$fulfill(this.promise, this._result);
	          }
	        }
	      } else {
	        lib$es6$promise$$internal$$reject(this.promise, lib$es6$promise$enumerator$$validationError());
	      }
	    }
	
	    function lib$es6$promise$enumerator$$validationError() {
	      return new Error('Array Methods must be provided an Array');
	    }
	
	    lib$es6$promise$enumerator$$Enumerator.prototype._enumerate = function() {
	      var length  = this.length;
	      var input   = this._input;
	
	      for (var i = 0; this._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
	        this._eachEntry(input[i], i);
	      }
	    };
	
	    lib$es6$promise$enumerator$$Enumerator.prototype._eachEntry = function(entry, i) {
	      var c = this._instanceConstructor;
	      var resolve = c.resolve;
	
	      if (resolve === lib$es6$promise$promise$resolve$$default) {
	        var then = lib$es6$promise$$internal$$getThen(entry);
	
	        if (then === lib$es6$promise$then$$default &&
	            entry._state !== lib$es6$promise$$internal$$PENDING) {
	          this._settledAt(entry._state, i, entry._result);
	        } else if (typeof then !== 'function') {
	          this._remaining--;
	          this._result[i] = entry;
	        } else if (c === lib$es6$promise$promise$$default) {
	          var promise = new c(lib$es6$promise$$internal$$noop);
	          lib$es6$promise$$internal$$handleMaybeThenable(promise, entry, then);
	          this._willSettleAt(promise, i);
	        } else {
	          this._willSettleAt(new c(function(resolve) { resolve(entry); }), i);
	        }
	      } else {
	        this._willSettleAt(resolve(entry), i);
	      }
	    };
	
	    lib$es6$promise$enumerator$$Enumerator.prototype._settledAt = function(state, i, value) {
	      var promise = this.promise;
	
	      if (promise._state === lib$es6$promise$$internal$$PENDING) {
	        this._remaining--;
	
	        if (state === lib$es6$promise$$internal$$REJECTED) {
	          lib$es6$promise$$internal$$reject(promise, value);
	        } else {
	          this._result[i] = value;
	        }
	      }
	
	      if (this._remaining === 0) {
	        lib$es6$promise$$internal$$fulfill(promise, this._result);
	      }
	    };
	
	    lib$es6$promise$enumerator$$Enumerator.prototype._willSettleAt = function(promise, i) {
	      var enumerator = this;
	
	      lib$es6$promise$$internal$$subscribe(promise, undefined, function(value) {
	        enumerator._settledAt(lib$es6$promise$$internal$$FULFILLED, i, value);
	      }, function(reason) {
	        enumerator._settledAt(lib$es6$promise$$internal$$REJECTED, i, reason);
	      });
	    };
	    function lib$es6$promise$polyfill$$polyfill() {
	      var local;
	
	      if (typeof global !== 'undefined') {
	          local = global;
	      } else if (typeof self !== 'undefined') {
	          local = self;
	      } else {
	          try {
	              local = Function('return this')();
	          } catch (e) {
	              throw new Error('polyfill failed because global object is unavailable in this environment');
	          }
	      }
	
	      var P = local.Promise;
	
	      if (P && Object.prototype.toString.call(P.resolve()) === '[object Promise]' && !P.cast) {
	        return;
	      }
	
	      local.Promise = lib$es6$promise$promise$$default;
	    }
	    var lib$es6$promise$polyfill$$default = lib$es6$promise$polyfill$$polyfill;
	
	    var lib$es6$promise$umd$$ES6Promise = {
	      'Promise': lib$es6$promise$promise$$default,
	      'polyfill': lib$es6$promise$polyfill$$default
	    };
	
	    /* global define:true module:true window: true */
	    if ("function" === 'function' && __webpack_require__(7)['amd']) {
	      !(__WEBPACK_AMD_DEFINE_RESULT__ = function() { return lib$es6$promise$umd$$ES6Promise; }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    } else if (typeof module !== 'undefined' && module['exports']) {
	      module['exports'] = lib$es6$promise$umd$$ES6Promise;
	    } else if (typeof this !== 'undefined') {
	      this['ES6Promise'] = lib$es6$promise$umd$$ES6Promise;
	    }
	
	    lib$es6$promise$polyfill$$default();
	}).call(this);
	
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4), (function() { return this; }()), __webpack_require__(5)(module)))

/***/ },
/* 4 */
/***/ function(module, exports) {

	// shim for using process in browser
	
	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;
	
	function cleanUpNextTick() {
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}
	
	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;
	
	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}
	
	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};
	
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};
	
	function noop() {}
	
	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	
	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};
	
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 6 */
/***/ function(module, exports) {

	/* (ignored) */

/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = function() { throw new Error("define cannot be used indirect"); };


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	
	var SSR = __webpack_require__(9);
	var Stateman = __webpack_require__(22);
	var u = __webpack_require__(26);
	
	var createRestate = __webpack_require__(45);
	var Restate = createRestate( Stateman );
	var so = Restate.prototype;
	
	so.run = function(path, option){
	  option = option || {};
	  var executed = this.exec(path);
	  var self = this;
	  if(!executed){
	    return Promise.reject({
	      code: 'notfound',
	      message: 'NOT FOUND'
	    });
	  }
	  var param = executed.param;
	  var promises = executed.states.map(function(state){
	    var installOption = {
	      state: state,
	      param: param
	    }
	    return self.install( installOption ).then( function(installed){
	      var data = installed.data;
	      if(!installed.Component){
	        html = "";
	      }else{
	        var html = SSR.render( installed.Component, {
	          data: u.extend({}, data), 
	          $state: self 
	        })
	      }
	      return {
	        name: state.name,
	        html: html,
	        data: data
	      };
	    })
	  })
	
	  return Promise.all( promises).then(function( rendereds ){
	
	    var len = rendereds.length;
	
	    if(!len) return null;
	    var rendered = rendereds[0];
	    var retView = rendered.html, data = {};
	
	    data[rendered.name] = rendered.data; 
	
	    for(var i = 1; i < len; i++ ){
	
	      var nextRendered = rendereds[i];
	
	      // <div rg-view >
	      retView = retView.replace(/r-view([^>]*\>)/, function(all ,capture){
	
	        return capture + nextRendered.html;
	      })
	
	      data[nextRendered.name] = nextRendered.data
	    }
	    return { html: retView, data: data } 
	  })
	}
	
	Restate.render = SSR.render;
	
	module.exports =  Restate;

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	// server side rendering for regularjs
	
	
	var _ = __webpack_require__(10);
	var parser = __webpack_require__(15);
	var diffArray = __webpack_require__(20).diffArray;
	var shared = __webpack_require__(21);
	
	
	
	
	
	
	/**
	 * [compile description]
	 * @param  {[type]} ast     [description]
	 * @param  {[type]} options [description]
	 */
	
	function SSR (Component){
	
	  this.Component = Component;
	}
	
	
	var ssr = _.extend(SSR.prototype, {});
	
	
	ssr.render = function( definition){
	
	  definition = definition || {};
	
	  var context = this.context = Object.create(this.Component.prototype)
	
	  var template = shared.initDefinition(context, definition);
	
	  return this.compile(template);
	
	}
	
	ssr.compile = function(ast){
	
	  if(typeof ast === 'string'){
	    ast = parser.parse(ast);
	  }
	  return this.walk(ast)
	}
	
	
	ssr.walk = function(ast, options){
	
	  var type = ast.type; 
	
	  if(Array.isArray(ast)){
	
	    return ast.map(function(item){
	
	      return this.walk(item, options)
	
	    }.bind(this)).join('');
	
	  }
	
	  return this[ast.type](ast, options)
	
	}
	
	
	ssr.element = function(ast ){
	
	  var children = ast.children,
	    attrs = ast.attrs,
	    tag = ast.tag;
	
	  if( tag === 'r-component' ){
	    attrs.some(function(attr){
	      if(attr.name === 'is'){
	        tag = attr.value;
	        if( _.isExpr(attr.value)) tag = this.get(attr.value);
	        return true;
	      }
	    }.bind(this))
	  }
	
	  var Component = this.Component.component(tag);
	
	  if(ast.tag === 'r-component' && !Component){
	    throw Error('r-component with unregister component ' + tag)
	  }
	
	  if( Component ) return this.component( ast, { 
	    Component: Component 
	  } );
	
	
	  var tagObj = {
	    body: (children && children.length? this.compile(children): "")
	  }
	  var attrStr = this.walk(attrs, tagObj).trim();
	
	  return "<" + tag + (attrStr? " " + attrStr: ""  ) + ">" +  
	        tagObj.body +
	    "</" + tag + ">"
	
	}
	
	
	
	ssr.component = function(ast, options){
	
	  var children = ast.children,
	    attrs = ast.attrs,
	    data = {},
	    Component = options.Component, body;
	
	  if(children && children.length){
	    body = function(){
	      return this.compile(children)
	    }.bind(this)
	  }
	
	  attrs.forEach(function(attr){
	    if(!_.eventReg.test(attr.name)){
	      data[attr.name] = _.isExpr(attr.value)? this.get(attr.value): attr.value
	    }
	  }.bind(this))
	
	
	  return SSR.render(Component, {
	    $body: body,
	    data: data,
	    extra: this.extra
	  })
	}
	
	
	
	ssr.list = function(ast){
	
	  var 
	    alternate = ast.alternate,
	    variable = ast.variable,
	    indexName = variable + '_index',
	    keyName = variable + '_key',
	    body = ast.body,
	    context = this.context,
	    self = this,
	    prevExtra = context.extra;
	
	  var sequence = this.get(ast.sequence);
	  var keys, list; 
	
	  var type = _.typeOf(sequence);
	
	  if( type === 'object'){
	
	    keys = Object.keys(list);
	    list = keys.map(function(key){return sequence[key]})
	
	  }else{
	
	    list = sequence || [];
	
	  }
	
	  return list.map(function(item, item_index){
	
	    var sectionData = {};
	    sectionData[variable] = item;
	    sectionData[indexName] = item_index;
	    if(keys) sectionData[keyName] = sequence[item_index];
	    context.extra = _.extend(
	      prevExtra? Object.create(prevExtra): {}, sectionData );
	    var section =  this.compile( body );
	    context.extra = prevExtra;
	    return section;
	
	  }.bind(this)).join('');
	
	}
	
	
	
	
	// {#include } or {#inc template}
	ssr.template = function(ast, options){
	  var content = this.get(ast.content);
	  var type = typeof content;
	
	
	  if(!content) return '';
	  if(type === 'function' ){
	    return content();
	  }else{
	    return this.compile(type !== 'object'? String(content): content)
	  }
	
	};
	
	ssr.if = function(ast, options){
	  var test = this.get(ast.test);  
	  if(test){
	    if(ast.consequent){
	      return this.walk( ast.consequent, options );
	    }
	  }else{
	    if(ast.alternate){
	      return this.walk( ast.alternate, options );
	    }
	  }
	}
	
	
	ssr.expression = function(ast, options){
	  var str = this.get(ast);
	  return _.escape(str);
	}
	
	ssr.text = function(ast, options){
	  return _.escape(ast.text) 
	}
	
	
	
	ssr.attribute = function(attr, options){
	
	  var
	    Component = this.Component,
	    directive = Component.directive(attr.name);
	
	  
	  shared.prepareAttr(attr, directive);
	  
	  var name = attr.name, 
	    value = attr.value || "";
	
	  if( directive ){
	    if(directive.ssr){
	
	      // @TODO: 应该提供hook可以控制节点内部  ,比如r-html
	      return directive.ssr.call(this.context, _.isExpr(value)? this.get(value): value ,options);
	    }
	  }else{
	    // @TODO 对于boolean 值
	    if(_.isExpr(value)) value = this.get(value); 
	    if(_.isBooleanAttr(name) || value === undefined || value === null){
	      return name + " ";
	    }else{
	      return name + '="' + _.escape(value) + '" ';
	    }
	  }
	}
	
	ssr.get = function(expr){
	
	  var rawget, 
	    self = this,
	    context = this.context,
	    touched = {};
	
	  if(expr.get) return expr.get(context);
	  else {
	    var rawget = new Function(_.ctxName, _.extName , _.prefix+ "return (" + expr.body + ")")
	    expr.get = function(context){
	      return rawget(context, context.extra)
	    }
	    return expr.get(this.context)
	  }
	
	}
	
	SSR.render = function(Component, definition){
	
	  return new SSR(Component).render( definition );
	
	}
	
	SSR.escape = _.escape;
	
	module.exports = SSR;


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, setImmediate) {__webpack_require__(12)();
	
	
	
	var _  = module.exports;
	var entities = __webpack_require__(13);
	var slice = [].slice;
	var o2str = ({}).toString;
	var win = typeof window !=='undefined'? window: global;
	var config = __webpack_require__(14);
	
	
	_.noop = function(){};
	_.uid = (function(){
	  var _uid=0;
	  return function(){
	    return _uid++;
	  }
	})();
	
	_.extend = function( o1, o2, override ){
	  // if(_.typeOf(override) === 'array'){
	  //  for(var i = 0, len = override.length; i < len; i++ ){
	  //   var key = override[i];
	  //   o1[key] = o2[key];
	  //  } 
	  // }else{
	  for(var i in o2){
	    if( typeof o1[i] === "undefined" || override === true ){
	      o1[i] = o2[i]
	    }
	  }
	  // }
	  return o1;
	}
	
	_.keys = function(obj){
	  if(Object.keys) return Object.keys(obj);
	  var res = [];
	  for(var i in obj) if(obj.hasOwnProperty(i)){
	    res.push(i);
	  }
	  return res;
	}
	
	_.varName = 'd';
	_.setName = 'p_';
	_.ctxName = 'c';
	_.extName = 'e';
	
	_.rWord = /^[\$\w]+$/;
	_.rSimpleAccessor = /^[\$\w]+(\.[\$\w]+)*$/;
	
	_.nextTick = typeof setImmediate === 'function'? 
	  setImmediate.bind(win) : 
	  function(callback) {
	    setTimeout(callback, 0) 
	  }
	
	
	
	_.prefix = "var " + _.varName + "=" + _.ctxName + ".data;" +  _.extName  + "=" + _.extName + "||'';";
	
	
	_.slice = function(obj, start, end){
	  var res = [];
	  for(var i = start || 0, len = end || obj.length; i < len; i++){
	    var item = obj[i];
	    res.push(item)
	  }
	  return res;
	}
	
	_.typeOf = function (o) {
	  return o == null ? String(o) :o2str.call(o).slice(8, -1).toLowerCase();
	}
	
	
	_.makePredicate = function makePredicate(words, prefix) {
	    if (typeof words === "string") {
	        words = words.split(" ");
	    }
	    var f = "",
	    cats = [];
	    out: for (var i = 0; i < words.length; ++i) {
	        for (var j = 0; j < cats.length; ++j){
	          if (cats[j][0].length === words[i].length) {
	              cats[j].push(words[i]);
	              continue out;
	          }
	        }
	        cats.push([words[i]]);
	    }
	    function compareTo(arr) {
	        if (arr.length === 1) return f += "return str === '" + arr[0] + "';";
	        f += "switch(str){";
	        for (var i = 0; i < arr.length; ++i){
	           f += "case '" + arr[i] + "':";
	        }
	        f += "return true}return false;";
	    }
	
	    // When there are more than three length categories, an outer
	    // switch first dispatches on the lengths, to save on comparisons.
	    if (cats.length > 3) {
	        cats.sort(function(a, b) {
	            return b.length - a.length;
	        });
	        f += "switch(str.length){";
	        for (var i = 0; i < cats.length; ++i) {
	            var cat = cats[i];
	            f += "case " + cat[0].length + ":";
	            compareTo(cat);
	        }
	        f += "}";
	
	        // Otherwise, simply generate a flat `switch` statement.
	    } else {
	        compareTo(words);
	    }
	    return new Function("str", f);
	}
	
	
	_.trackErrorPos = (function (){
	  // linebreak
	  var lb = /\r\n|[\n\r\u2028\u2029]/g;
	  var minRange = 20, maxRange = 20;
	  function findLine(lines, pos){
	    var tmpLen = 0;
	    for(var i = 0,len = lines.length; i < len; i++){
	      var lineLen = (lines[i] || "").length;
	
	      if(tmpLen + lineLen > pos) {
	        return {num: i, line: lines[i], start: pos - i - tmpLen , prev:lines[i-1], next: lines[i+1] };
	      }
	      // 1 is for the linebreak
	      tmpLen = tmpLen + lineLen ;
	    }
	  }
	  function formatLine(str,  start, num, target){
	    var len = str.length;
	    var min = start - minRange;
	    if(min < 0) min = 0;
	    var max = start + maxRange;
	    if(max > len) max = len;
	
	    var remain = str.slice(min, max);
	    var prefix = "[" +(num+1) + "] " + (min > 0? ".." : "")
	    var postfix = max < len ? "..": "";
	    var res = prefix + remain + postfix;
	    if(target) res += "\n" + new Array(start-min + prefix.length + 1).join(" ") + "^^^";
	    return res;
	  }
	  return function(input, pos){
	    if(pos > input.length-1) pos = input.length-1;
	    lb.lastIndex = 0;
	    var lines = input.split(lb);
	    var line = findLine(lines,pos);
	    var start = line.start, num = line.num;
	
	    return (line.prev? formatLine(line.prev, start, num-1 ) + '\n': '' ) + 
	      formatLine(line.line, start, num, true) + '\n' + 
	      (line.next? formatLine(line.next, start, num+1 ) + '\n': '' );
	
	  }
	})();
	
	
	var ignoredRef = /\((\?\!|\?\:|\?\=)/g;
	_.findSubCapture = function (regStr) {
	  var left = 0,
	    right = 0,
	    len = regStr.length,
	    ignored = regStr.match(ignoredRef); // ignored uncapture
	  if(ignored) ignored = ignored.length
	  else ignored = 0;
	  for (; len--;) {
	    var letter = regStr.charAt(len);
	    if (len === 0 || regStr.charAt(len - 1) !== "\\" ) { 
	      if (letter === "(") left++;
	      if (letter === ")") right++;
	    }
	  }
	  if (left !== right) throw "RegExp: "+ regStr + "'s bracket is not marched";
	  else return left - ignored;
	};
	
	
	_.escapeRegExp = function( str){// Credit: XRegExp 0.6.1 (c) 2007-2008 Steven Levithan <http://stevenlevithan.com/regex/xregexp/> MIT License
	  return str.replace(/[-[\]{}()*+?.\\^$|,#\s]/g, function(match){
	    return '\\' + match;
	  });
	};
	
	
	var rEntity = new RegExp("&(?:(#x[0-9a-fA-F]+)|(#[0-9]+)|(" + _.keys(entities).join('|') + '));', 'gi');
	
	_.convertEntity = function(chr){
	
	  return ("" + chr).replace(rEntity, function(all, hex, dec, capture){
	    var charCode;
	    if( dec ) charCode = parseInt( dec.slice(1), 10 );
	    else if( hex ) charCode = parseInt( hex.slice(2), 16 );
	    else charCode = entities[capture]
	
	    return String.fromCharCode( charCode )
	  });
	
	}
	
	
	// simple get accessor
	
	_.createObject = function(o, props){
	    function Foo() {}
	    Foo.prototype = o;
	    var res = new Foo;
	    if(props) _.extend(res, props);
	    return res;
	}
	
	_.createProto = function(fn, o){
	    function Foo() { this.constructor = fn;}
	    Foo.prototype = o;
	    return (fn.prototype = new Foo());
	}
	
	
	
	/**
	clone
	*/
	_.clone = function clone(obj){
	    var type = _.typeOf(obj);
	    if(type === 'array'){
	      var cloned = [];
	      for(var i=0,len = obj.length; i< len;i++){
	        cloned[i] = obj[i]
	      }
	      return cloned;
	    }
	    if(type === 'object'){
	      var cloned = {};
	      for(var i in obj) if(obj.hasOwnProperty(i)){
	        cloned[i] = obj[i];
	      }
	      return cloned;
	    }
	    return obj;
	  }
	
	_.equals = function(now, old){
	  var type = typeof now;
	  if(type === 'number' && typeof old === 'number'&& isNaN(now) && isNaN(old)) return true
	  return now === old;
	}
	
	var dash = /-([a-z])/g;
	_.camelCase = function(str){
	  return str.replace(dash, function(all, capture){
	    return capture.toUpperCase();
	  })
	}
	
	
	
	_.throttle = function throttle(func, wait){
	  var wait = wait || 100;
	  var context, args, result;
	  var timeout = null;
	  var previous = 0;
	  var later = function() {
	    previous = +new Date;
	    timeout = null;
	    result = func.apply(context, args);
	    context = args = null;
	  };
	  return function() {
	    var now = + new Date;
	    var remaining = wait - (now - previous);
	    context = this;
	    args = arguments;
	    if (remaining <= 0 || remaining > wait) {
	      clearTimeout(timeout);
	      timeout = null;
	      previous = now;
	      result = func.apply(context, args);
	      context = args = null;
	    } else if (!timeout) {
	      timeout = setTimeout(later, remaining);
	    }
	    return result;
	  };
	};
	
	// hogan escape
	// ==============
	_.escape = (function(){
	  var rAmp = /&/g,
	      rLt = /</g,
	      rGt = />/g,
	      rApos = /\'/g,
	      rQuot = /\"/g,
	      hChars = /[&<>\"\']/;
	
	  return function(str) {
	    return hChars.test(str) ?
	      str
	        .replace(rAmp, '&amp;')
	        .replace(rLt, '&lt;')
	        .replace(rGt, '&gt;')
	        .replace(rApos, '&#39;')
	        .replace(rQuot, '&quot;') :
	      str;
	  }
	})();
	
	_.cache = function(max){
	  max = max || 1000;
	  var keys = [],
	      cache = {};
	  return {
	    set: function(key, value) {
	      if (keys.length > this.max) {
	        cache[keys.shift()] = undefined;
	      }
	      // 
	      if(cache[key] === undefined){
	        keys.push(key);
	      }
	      cache[key] = value;
	      return value;
	    },
	    get: function(key) {
	      if (key === undefined) return cache;
	      return cache[key];
	    },
	    max: max,
	    len:function(){
	      return keys.length;
	    }
	  };
	}
	
	// // setup the raw Expression
	// _.touchExpression = function(expr){
	//   if(expr.type === 'expression'){
	//   }
	//   return expr;
	// }
	
	
	// handle the same logic on component's `on-*` and element's `on-*`
	// return the fire object
	_.handleEvent = function(value, type ){
	  var self = this, evaluate;
	  if(value.type === 'expression'){ // if is expression, go evaluated way
	    evaluate = value.get;
	  }
	  if(evaluate){
	    return function fire(obj){
	      self.$update(function(){
	        var data = this.data;
	        data.$event = obj;
	        var res = evaluate(self);
	        if(res === false && obj && obj.preventDefault) obj.preventDefault();
	        data.$event = undefined;
	      })
	
	    }
	  }else{
	    return function fire(){
	      var args = slice.call(arguments)      
	      args.unshift(value);
	      self.$update(function(){
	        self.$emit.apply(self, args);
	      })
	    }
	  }
	}
	
	// only call once
	_.once = function(fn){
	  var time = 0;
	  return function(){
	    if( time++ === 0) fn.apply(this, arguments);
	  }
	}
	
	_.fixObjStr = function(str){
	  if(str.trim().indexOf('{') !== 0){
	    return '{' + str + '}';
	  }
	  return str;
	}
	
	
	_.map= function(array, callback){
	  var res = [];
	  for (var i = 0, len = array.length; i < len; i++) {
	    res.push(callback(array[i], i));
	  }
	  return res;
	}
	
	function log(msg, type){
	  if(typeof console !== "undefined")  console[type || "log"](msg);
	}
	
	_.log = log;
	
	
	
	
	//http://www.w3.org/html/wg/drafts/html/master/single-page.html#void-elements
	_.isVoidTag = _.makePredicate("area base br col embed hr img input keygen link menuitem meta param source track wbr r-content");
	_.isBooleanAttr = _.makePredicate('selected checked disabled readonly required open autofocus controls autoplay compact loop defer multiple');
	
	_.isFalse - function(){return false}
	_.isTrue - function(){return true}
	
	_.isExpr = function(expr){
	  return expr && expr.type === 'expression';
	}
	// @TODO: make it more strict
	_.isGroup = function(group){
	  return group.inject || group.$inject;
	}
	
	_.blankReg = /\s+/; 
	
	_.getCompileFn = function(source, ctx, options){
	  return function( passedOptions ){
	    if( passedOptions && options ) _.extend( passedOptions , options );
	    else passedOptions = options;
	    return ctx.$compile(source, passedOptions )
	  }
	  return ctx.$compile.bind(ctx,source, options)
	}
	
	_.eventReg = /^on-(\w[-\w]+)$/;
	
	_.toText = function(obj){
	  return obj == null ? "": "" + obj;
	}
	
	
	// hogan
	// https://github.com/twitter/hogan.js
	// MIT
	_.escape = (function(){
	  var rAmp = /&/g,
	      rLt = /</g,
	      rGt = />/g,
	      rApos = /\'/g,
	      rQuot = /\"/g,
	      hChars = /[&<>\"\']/;
	
	  function ignoreNullVal(val) {
	    return String((val === undefined || val == null) ? '' : val);
	  }
	
	  return function (str) {
	    str = ignoreNullVal(str);
	    return hChars.test(str) ?
	      str
	        .replace(rAmp, '&amp;')
	        .replace(rLt, '&lt;')
	        .replace(rGt, '&gt;')
	        .replace(rApos, '&#39;')
	        .replace(rQuot, '&quot;') :
	      str;
	  }
	
	})();
	
	
	
	
	
	
	
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(11).setImmediate))

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(setImmediate, clearImmediate) {var nextTick = __webpack_require__(4).nextTick;
	var apply = Function.prototype.apply;
	var slice = Array.prototype.slice;
	var immediateIds = {};
	var nextImmediateId = 0;
	
	// DOM APIs, for completeness
	
	exports.setTimeout = function() {
	  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
	};
	exports.setInterval = function() {
	  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
	};
	exports.clearTimeout =
	exports.clearInterval = function(timeout) { timeout.close(); };
	
	function Timeout(id, clearFn) {
	  this._id = id;
	  this._clearFn = clearFn;
	}
	Timeout.prototype.unref = Timeout.prototype.ref = function() {};
	Timeout.prototype.close = function() {
	  this._clearFn.call(window, this._id);
	};
	
	// Does not start the time, just sets up the members needed.
	exports.enroll = function(item, msecs) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = msecs;
	};
	
	exports.unenroll = function(item) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = -1;
	};
	
	exports._unrefActive = exports.active = function(item) {
	  clearTimeout(item._idleTimeoutId);
	
	  var msecs = item._idleTimeout;
	  if (msecs >= 0) {
	    item._idleTimeoutId = setTimeout(function onTimeout() {
	      if (item._onTimeout)
	        item._onTimeout();
	    }, msecs);
	  }
	};
	
	// That's not how node.js implements it but the exposed api is the same.
	exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
	  var id = nextImmediateId++;
	  var args = arguments.length < 2 ? false : slice.call(arguments, 1);
	
	  immediateIds[id] = true;
	
	  nextTick(function onNextTick() {
	    if (immediateIds[id]) {
	      // fn.call() is faster so we optimize for the common use-case
	      // @see http://jsperf.com/call-apply-segu
	      if (args) {
	        fn.apply(null, args);
	      } else {
	        fn.call(null);
	      }
	      // Prevent ids from leaking
	      exports.clearImmediate(id);
	    }
	  });
	
	  return id;
	};
	
	exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
	  delete immediateIds[id];
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(11).setImmediate, __webpack_require__(11).clearImmediate))

/***/ },
/* 12 */
/***/ function(module, exports) {

	// shim for es5
	var slice = [].slice;
	var tstr = ({}).toString;
	
	function extend(o1, o2 ){
	  for(var i in o2) if( o1[i] === undefined){
	    o1[i] = o2[i]
	  }
	  return o2;
	}
	
	
	module.exports = function(){
	  // String proto ;
	  extend(String.prototype, {
	    trim: function(){
	      return this.replace(/^\s+|\s+$/g, '');
	    }
	  });
	
	
	  // Array proto;
	  extend(Array.prototype, {
	    indexOf: function(obj, from){
	      from = from || 0;
	      for (var i = from, len = this.length; i < len; i++) {
	        if (this[i] === obj) return i;
	      }
	      return -1;
	    },
	    // polyfill from MDN 
	    // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
	    forEach: function(callback, ctx){
	      var k = 0;
	
	      // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
	      var O = Object(this);
	
	      var len = O.length >>> 0; 
	
	      if ( typeof callback !== "function" ) {
	        throw new TypeError( callback + " is not a function" );
	      }
	
	      // 7. Repeat, while k < len
	      while( k < len ) {
	
	        var kValue;
	
	        if ( k in O ) {
	
	          kValue = O[ k ];
	
	          callback.call( ctx, kValue, k, O );
	        }
	        k++;
	      }
	    },
	    // @deprecated
	    //  will be removed at 0.5.0
	    filter: function(fun, context){
	
	      var t = Object(this);
	      var len = t.length >>> 0;
	      if (typeof fun !== "function")
	        throw new TypeError();
	
	      var res = [];
	      for (var i = 0; i < len; i++)
	      {
	        if (i in t)
	        {
	          var val = t[i];
	          if (fun.call(context, val, i, t))
	            res.push(val);
	        }
	      }
	
	      return res;
	    }
	  });
	
	  // Function proto;
	  extend(Function.prototype, {
	    bind: function(context){
	      var fn = this;
	      var preArgs = slice.call(arguments, 1);
	      return function(){
	        var args = preArgs.concat(slice.call(arguments));
	        return fn.apply(context, args);
	      }
	    }
	  })
	  
	  // Array
	  extend(Array, {
	    isArray: function(arr){
	      return tstr.call(arr) === "[object Array]";
	    }
	  })
	}
	


/***/ },
/* 13 */
/***/ function(module, exports) {

	// http://stackoverflow.com/questions/1354064/how-to-convert-characters-to-html-entities-using-plain-javascript
	var entities = {
	  'quot':34, 
	  'amp':38, 
	  'apos':39, 
	  'lt':60, 
	  'gt':62, 
	  'nbsp':160, 
	  'iexcl':161, 
	  'cent':162, 
	  'pound':163, 
	  'curren':164, 
	  'yen':165, 
	  'brvbar':166, 
	  'sect':167, 
	  'uml':168, 
	  'copy':169, 
	  'ordf':170, 
	  'laquo':171, 
	  'not':172, 
	  'shy':173, 
	  'reg':174, 
	  'macr':175, 
	  'deg':176, 
	  'plusmn':177, 
	  'sup2':178, 
	  'sup3':179, 
	  'acute':180, 
	  'micro':181, 
	  'para':182, 
	  'middot':183, 
	  'cedil':184, 
	  'sup1':185, 
	  'ordm':186, 
	  'raquo':187, 
	  'frac14':188, 
	  'frac12':189, 
	  'frac34':190, 
	  'iquest':191, 
	  'Agrave':192, 
	  'Aacute':193, 
	  'Acirc':194, 
	  'Atilde':195, 
	  'Auml':196, 
	  'Aring':197, 
	  'AElig':198, 
	  'Ccedil':199, 
	  'Egrave':200, 
	  'Eacute':201, 
	  'Ecirc':202, 
	  'Euml':203, 
	  'Igrave':204, 
	  'Iacute':205, 
	  'Icirc':206, 
	  'Iuml':207, 
	  'ETH':208, 
	  'Ntilde':209, 
	  'Ograve':210, 
	  'Oacute':211, 
	  'Ocirc':212, 
	  'Otilde':213, 
	  'Ouml':214, 
	  'times':215, 
	  'Oslash':216, 
	  'Ugrave':217, 
	  'Uacute':218, 
	  'Ucirc':219, 
	  'Uuml':220, 
	  'Yacute':221, 
	  'THORN':222, 
	  'szlig':223, 
	  'agrave':224, 
	  'aacute':225, 
	  'acirc':226, 
	  'atilde':227, 
	  'auml':228, 
	  'aring':229, 
	  'aelig':230, 
	  'ccedil':231, 
	  'egrave':232, 
	  'eacute':233, 
	  'ecirc':234, 
	  'euml':235, 
	  'igrave':236, 
	  'iacute':237, 
	  'icirc':238, 
	  'iuml':239, 
	  'eth':240, 
	  'ntilde':241, 
	  'ograve':242, 
	  'oacute':243, 
	  'ocirc':244, 
	  'otilde':245, 
	  'ouml':246, 
	  'divide':247, 
	  'oslash':248, 
	  'ugrave':249, 
	  'uacute':250, 
	  'ucirc':251, 
	  'uuml':252, 
	  'yacute':253, 
	  'thorn':254, 
	  'yuml':255, 
	  'fnof':402, 
	  'Alpha':913, 
	  'Beta':914, 
	  'Gamma':915, 
	  'Delta':916, 
	  'Epsilon':917, 
	  'Zeta':918, 
	  'Eta':919, 
	  'Theta':920, 
	  'Iota':921, 
	  'Kappa':922, 
	  'Lambda':923, 
	  'Mu':924, 
	  'Nu':925, 
	  'Xi':926, 
	  'Omicron':927, 
	  'Pi':928, 
	  'Rho':929, 
	  'Sigma':931, 
	  'Tau':932, 
	  'Upsilon':933, 
	  'Phi':934, 
	  'Chi':935, 
	  'Psi':936, 
	  'Omega':937, 
	  'alpha':945, 
	  'beta':946, 
	  'gamma':947, 
	  'delta':948, 
	  'epsilon':949, 
	  'zeta':950, 
	  'eta':951, 
	  'theta':952, 
	  'iota':953, 
	  'kappa':954, 
	  'lambda':955, 
	  'mu':956, 
	  'nu':957, 
	  'xi':958, 
	  'omicron':959, 
	  'pi':960, 
	  'rho':961, 
	  'sigmaf':962, 
	  'sigma':963, 
	  'tau':964, 
	  'upsilon':965, 
	  'phi':966, 
	  'chi':967, 
	  'psi':968, 
	  'omega':969, 
	  'thetasym':977, 
	  'upsih':978, 
	  'piv':982, 
	  'bull':8226, 
	  'hellip':8230, 
	  'prime':8242, 
	  'Prime':8243, 
	  'oline':8254, 
	  'frasl':8260, 
	  'weierp':8472, 
	  'image':8465, 
	  'real':8476, 
	  'trade':8482, 
	  'alefsym':8501, 
	  'larr':8592, 
	  'uarr':8593, 
	  'rarr':8594, 
	  'darr':8595, 
	  'harr':8596, 
	  'crarr':8629, 
	  'lArr':8656, 
	  'uArr':8657, 
	  'rArr':8658, 
	  'dArr':8659, 
	  'hArr':8660, 
	  'forall':8704, 
	  'part':8706, 
	  'exist':8707, 
	  'empty':8709, 
	  'nabla':8711, 
	  'isin':8712, 
	  'notin':8713, 
	  'ni':8715, 
	  'prod':8719, 
	  'sum':8721, 
	  'minus':8722, 
	  'lowast':8727, 
	  'radic':8730, 
	  'prop':8733, 
	  'infin':8734, 
	  'ang':8736, 
	  'and':8743, 
	  'or':8744, 
	  'cap':8745, 
	  'cup':8746, 
	  'int':8747, 
	  'there4':8756, 
	  'sim':8764, 
	  'cong':8773, 
	  'asymp':8776, 
	  'ne':8800, 
	  'equiv':8801, 
	  'le':8804, 
	  'ge':8805, 
	  'sub':8834, 
	  'sup':8835, 
	  'nsub':8836, 
	  'sube':8838, 
	  'supe':8839, 
	  'oplus':8853, 
	  'otimes':8855, 
	  'perp':8869, 
	  'sdot':8901, 
	  'lceil':8968, 
	  'rceil':8969, 
	  'lfloor':8970, 
	  'rfloor':8971, 
	  'lang':9001, 
	  'rang':9002, 
	  'loz':9674, 
	  'spades':9824, 
	  'clubs':9827, 
	  'hearts':9829, 
	  'diams':9830, 
	  'OElig':338, 
	  'oelig':339, 
	  'Scaron':352, 
	  'scaron':353, 
	  'Yuml':376, 
	  'circ':710, 
	  'tilde':732, 
	  'ensp':8194, 
	  'emsp':8195, 
	  'thinsp':8201, 
	  'zwnj':8204, 
	  'zwj':8205, 
	  'lrm':8206, 
	  'rlm':8207, 
	  'ndash':8211, 
	  'mdash':8212, 
	  'lsquo':8216, 
	  'rsquo':8217, 
	  'sbquo':8218, 
	  'ldquo':8220, 
	  'rdquo':8221, 
	  'bdquo':8222, 
	  'dagger':8224, 
	  'Dagger':8225, 
	  'permil':8240, 
	  'lsaquo':8249, 
	  'rsaquo':8250, 
	  'euro':8364
	}
	
	
	
	module.exports  = entities;

/***/ },
/* 14 */
/***/ function(module, exports) {

	
	module.exports = {
	  'BEGIN': '{',
	  'END': '}',
	  'PRECOMPILE': false
	}

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var exprCache = __webpack_require__(16).exprCache;
	var _ = __webpack_require__(10);
	var Parser = __webpack_require__(17);
	module.exports = {
	  expression: function(expr, simple){
	    // @TODO cache
	    if( typeof expr === 'string' && ( expr = expr.trim() ) ){
	      expr = exprCache.get( expr ) || exprCache.set( expr, new Parser( expr, { mode: 2, expression: true } ).expression() )
	    }
	    if(expr) return expr;
	  },
	  parse: function(template){
	    return new Parser(template).parse();
	  }
	}
	


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {// some fixture test;
	// ---------------
	var _ = __webpack_require__(10);
	exports.svg = (function(){
	  return typeof document !== "undefined" && document.implementation.hasFeature( "http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1" );
	})();
	
	
	exports.browser = typeof document !== "undefined" && document.nodeType;
	// whether have component in initializing
	exports.exprCache = _.cache(1000);
	exports.node = typeof process !== "undefined" && ( '' + process ) === '[object process]';
	exports.isRunning = false;
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4)))

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(10);
	
	var config = __webpack_require__(14);
	var node = __webpack_require__(18);
	var Lexer = __webpack_require__(19);
	var varName = _.varName;
	var ctxName = _.ctxName;
	var extName = _.extName;
	var isPath = _.makePredicate("STRING IDENT NUMBER");
	var isKeyWord = _.makePredicate("true false undefined null this Array Date JSON Math NaN RegExp decodeURI decodeURIComponent encodeURI encodeURIComponent parseFloat parseInt Object");
	var isInvalidTag = _.makePredicate("script style");
	
	
	
	function Parser(input, opts){
	  opts = opts || {};
	
	  this.input = input;
	  this.tokens = new Lexer(input, opts).lex();
	  this.pos = 0;
	  this.length = this.tokens.length;
	}
	
	
	var op = Parser.prototype;
	
	
	op.parse = function(){
	  this.pos = 0;
	  var res= this.program();
	  if(this.ll().type === 'TAG_CLOSE'){
	    this.error("You may got a unclosed Tag")
	  }
	  return res;
	}
	
	op.ll =  function(k){
	  k = k || 1;
	  if(k < 0) k = k + 1;
	  var pos = this.pos + k - 1;
	  if(pos > this.length - 1){
	      return this.tokens[this.length-1];
	  }
	  return this.tokens[pos];
	}
	  // lookahead
	op.la = function(k){
	  return (this.ll(k) || '').type;
	}
	
	op.match = function(type, value){
	  var ll;
	  if(!(ll = this.eat(type, value))){
	    ll  = this.ll();
	    this.error('expect [' + type + (value == null? '':':'+ value) + ']" -> got "[' + ll.type + (value==null? '':':'+ll.value) + ']', ll.pos)
	  }else{
	    return ll;
	  }
	}
	
	op.error = function(msg, pos){
	  msg =  "\n【 parse failed 】 " + msg +  ':\n\n' + _.trackErrorPos(this.input, typeof pos === 'number'? pos: this.ll().pos||0);
	  throw new Error(msg);
	}
	
	op.next = function(k){
	  k = k || 1;
	  this.pos += k;
	}
	op.eat = function(type, value){
	  var ll = this.ll();
	  if(typeof type !== 'string'){
	    for(var len = type.length ; len--;){
	      if(ll.type === type[len]) {
	        this.next();
	        return ll;
	      }
	    }
	  }else{
	    if( ll.type === type && (typeof value === 'undefined' || ll.value === value) ){
	       this.next();
	       return ll;
	    }
	  }
	  return false;
	}
	
	// program
	//  :EOF
	//  | (statement)* EOF
	op.program = function(){
	  var statements = [],  ll = this.ll();
	  while(ll.type !== 'EOF' && ll.type !=='TAG_CLOSE'){
	
	    statements.push(this.statement());
	    ll = this.ll();
	  }
	  // if(ll.type === 'TAG_CLOSE') this.error("You may have unmatched Tag")
	  return statements;
	}
	
	// statement
	//  : xml
	//  | jst
	//  | text
	op.statement = function(){
	  var ll = this.ll();
	  switch(ll.type){
	    case 'NAME':
	    case 'TEXT':
	      var text = ll.value;
	      this.next();
	      while(ll = this.eat(['NAME', 'TEXT'])){
	        text += ll.value;
	      }
	      return node.text(text);
	    case 'TAG_OPEN':
	      return this.xml();
	    case 'OPEN': 
	      return this.directive();
	    case 'EXPR_OPEN':
	      return this.interplation();
	    default:
	      this.error('Unexpected token: '+ this.la())
	  }
	}
	
	// xml 
	// stag statement* TAG_CLOSE?(if self-closed tag)
	op.xml = function(){
	  var name, attrs, children, selfClosed;
	  name = this.match('TAG_OPEN').value;
	
	  if( isInvalidTag(name)){
	    this.error('Invalid Tag: ' + name);
	  }
	  attrs = this.attrs();
	  selfClosed = this.eat('/')
	  this.match('>');
	  if( !selfClosed && !_.isVoidTag(name) ){
	    children = this.program();
	    if(!this.eat('TAG_CLOSE', name)) this.error('expect </'+name+'> got'+ 'no matched closeTag')
	  }
	  return node.element(name, attrs, children);
	}
	
	// xentity
	//  -rule(wrap attribute)
	//  -attribute
	//
	// __example__
	//  name = 1 |  
	//  ng-hide |
	//  on-click={{}} | 
	//  {{#if name}}on-click={{xx}}{{#else}}on-tap={{}}{{/if}}
	
	op.xentity = function(ll){
	  var name = ll.value, value, modifier;
	  if(ll.type === 'NAME'){
	    //@ only for test
	    if(~name.indexOf('.')){
	      var tmp = name.split('.');
	      name = tmp[0];
	      modifier = tmp[1]
	
	    }
	    if( this.eat("=") ) value = this.attvalue(modifier);
	    return node.attribute( name, value, modifier );
	  }else{
	    if( name !== 'if') this.error("current version. ONLY RULE #if #else #elseif is valid in tag, the rule #" + name + ' is invalid');
	    return this['if'](true);
	  }
	
	}
	
	// stag     ::=    '<' Name (S attr)* S? '>'  
	// attr    ::=     Name Eq attvalue
	op.attrs = function(isAttribute){
	  var eat
	  if(!isAttribute){
	    eat = ["NAME", "OPEN"]
	  }else{
	    eat = ["NAME"]
	  }
	
	  var attrs = [], ll;
	  while (ll = this.eat(eat)){
	    attrs.push(this.xentity( ll ))
	  }
	  return attrs;
	}
	
	// attvalue
	//  : STRING  
	//  | NAME
	op.attvalue = function(mdf){
	  var ll = this.ll();
	  switch(ll.type){
	    case "NAME":
	    case "UNQ":
	    case "STRING":
	      this.next();
	      var value = ll.value;
	      return value;
	    case "EXPR_OPEN":
	      return this.interplation();
	    default:
	      this.error('Unexpected token: '+ this.la())
	  }
	}
	
	
	// {{#}}
	op.directive = function(){
	  var name = this.ll().value;
	  this.next();
	  if(typeof this[name] === 'function'){
	    return this[name]()
	  }else{
	    this.error('Undefined directive['+ name +']');
	  }
	}
	
	
	
	
	
	// {{}}
	op.interplation = function(){
	  this.match('EXPR_OPEN');
	  var res = this.expression(true);
	  this.match('END');
	  return res;
	}
	
	// {{~}}
	op.inc = op.include = function(){
	  var content = this.expression();
	  this.match('END');
	  return node.template(content);
	}
	
	// {{#if}}
	op["if"] = function(tag){
	  var test = this.expression();
	  var consequent = [], alternate=[];
	
	  var container = consequent;
	  var statement = !tag? "statement" : "attrs";
	
	  this.match('END');
	
	  var ll, close;
	  while( ! (close = this.eat('CLOSE')) ){
	    ll = this.ll();
	    if( ll.type === 'OPEN' ){
	      switch( ll.value ){
	        case 'else':
	          container = alternate;
	          this.next();
	          this.match( 'END' );
	          break;
	        case 'elseif':
	          this.next();
	          alternate.push( this["if"](tag) );
	          return node['if']( test, consequent, alternate );
	        default:
	          container.push( this[statement](true) );
	      }
	    }else{
	      container.push(this[statement](true));
	    }
	  }
	  // if statement not matched
	  if(close.value !== "if") this.error('Unmatched if directive')
	  return node["if"](test, consequent, alternate);
	}
	
	
	// @mark   mustache syntax have natrure dis, canot with expression
	// {{#list}}
	op.list = function(){
	  // sequence can be a list or hash
	  var sequence = this.expression(), variable, ll, track;
	  var consequent = [], alternate=[];
	  var container = consequent;
	
	  this.match('IDENT', 'as');
	
	  variable = this.match('IDENT').value;
	
	  if(this.eat('IDENT', 'by')){
	    if(this.eat('IDENT',variable + '_index')){
	      track = true;
	    }else{
	      track = this.expression();
	      if(track.constant){
	        // true is means constant, we handle it just like xxx_index.
	        track = true;
	      }
	    }
	  }
	
	  this.match('END');
	
	  while( !(ll = this.eat('CLOSE')) ){
	    if(this.eat('OPEN', 'else')){
	      container =  alternate;
	      this.match('END');
	    }else{
	      container.push(this.statement());
	    }
	  }
	  
	  if(ll.value !== 'list') this.error('expect ' + 'list got ' + '/' + ll.value + ' ', ll.pos );
	  return node.list(sequence, variable, consequent, alternate, track);
	}
	
	
	op.expression = function(){
	  var expression;
	  if(this.eat('@(')){ //once bind
	    expression = this.expr();
	    expression.once = true;
	    this.match(')')
	  }else{
	    expression = this.expr();
	  }
	  return expression;
	}
	
	op.expr = function(){
	  this.depend = [];
	
	  var buffer = this.filter()
	
	  var body = buffer.get || buffer;
	  var setbody = buffer.set;
	  return node.expression(body, setbody, !this.depend.length);
	}
	
	
	// filter
	// assign ('|' filtername[':' args]) * 
	op.filter = function(){
	  var left = this.assign();
	  var ll = this.eat('|');
	  var buffer = [], setBuffer, prefix,
	    attr = "t", 
	    set = left.set, get, 
	    tmp = "";
	
	  if(ll){
	    if(set) setBuffer = [];
	
	    prefix = "(function(" + attr + "){";
	
	    do{
	      tmp = attr + " = " + ctxName + "._f_('" + this.match('IDENT').value+ "' ).get.call( "+_.ctxName +"," + attr ;
	      if(this.eat(':')){
	        tmp +=", "+ this.arguments("|").join(",") + ");"
	      }else{
	        tmp += ');'
	      }
	      buffer.push(tmp);
	      setBuffer && setBuffer.unshift( tmp.replace(" ).get.call", " ).set.call") );
	
	    }while(ll = this.eat('|'));
	    buffer.push("return " + attr );
	    setBuffer && setBuffer.push("return " + attr);
	
	    get =  prefix + buffer.join("") + "})("+left.get+")";
	    // we call back to value.
	    if(setBuffer){
	      // change _ss__(name, _p_) to _s__(name, filterFn(_p_));
	      set = set.replace(_.setName, 
	        prefix + setBuffer.join("") + "})("+　_.setName　+")" );
	
	    }
	    // the set function is depend on the filter definition. if it have set method, the set will work
	    return this.getset(get, set);
	  }
	  return left;
	}
	
	// assign
	// left-hand-expr = condition
	op.assign = function(){
	  var left = this.condition(), ll;
	  if(ll = this.eat(['=', '+=', '-=', '*=', '/=', '%='])){
	    if(!left.set) this.error('invalid lefthand expression in assignment expression');
	    return this.getset( left.set.replace( "," + _.setName, "," + this.condition().get ).replace("'='", "'"+ll.type+"'"), left.set);
	    // return this.getset('(' + left.get + ll.type  + this.condition().get + ')', left.set);
	  }
	  return left;
	}
	
	// or
	// or ? assign : assign
	op.condition = function(){
	
	  var test = this.or();
	  if(this.eat('?')){
	    return this.getset([test.get + "?", 
	      this.assign().get, 
	      this.match(":").type, 
	      this.assign().get].join(""));
	  }
	
	  return test;
	}
	
	// and
	// and && or
	op.or = function(){
	
	  var left = this.and();
	
	  if(this.eat('||')){
	    return this.getset(left.get + '||' + this.or().get);
	  }
	
	  return left;
	}
	// equal
	// equal && and
	op.and = function(){
	
	  var left = this.equal();
	
	  if(this.eat('&&')){
	    return this.getset(left.get + '&&' + this.and().get);
	  }
	  return left;
	}
	// relation
	// 
	// equal == relation
	// equal != relation
	// equal === relation
	// equal !== relation
	op.equal = function(){
	  var left = this.relation(), ll;
	  // @perf;
	  if( ll = this.eat(['==','!=', '===', '!=='])){
	    return this.getset(left.get + ll.type + this.equal().get);
	  }
	  return left
	}
	// relation < additive
	// relation > additive
	// relation <= additive
	// relation >= additive
	// relation in additive
	op.relation = function(){
	  var left = this.additive(), ll;
	  // @perf
	  if(ll = (this.eat(['<', '>', '>=', '<=']) || this.eat('IDENT', 'in') )){
	    return this.getset(left.get + ll.value + this.relation().get);
	  }
	  return left
	}
	// additive :
	// multive
	// additive + multive
	// additive - multive
	op.additive = function(){
	  var left = this.multive() ,ll;
	  if(ll= this.eat(['+','-']) ){
	    return this.getset(left.get + ll.value + this.additive().get);
	  }
	  return left
	}
	// multive :
	// unary
	// multive * unary
	// multive / unary
	// multive % unary
	op.multive = function(){
	  var left = this.range() ,ll;
	  if( ll = this.eat(['*', '/' ,'%']) ){
	    return this.getset(left.get + ll.type + this.multive().get);
	  }
	  return left;
	}
	
	op.range = function(){
	  var left = this.unary(), ll, right;
	
	  if(ll = this.eat('..')){
	    right = this.unary();
	    var body = 
	      "(function(start,end){var res = [],step=end>start?1:-1; for(var i = start; end>start?i <= end: i>=end; i=i+step){res.push(i); } return res })("+left.get+","+right.get+")"
	    return this.getset(body);
	  }
	
	  return left;
	}
	
	
	
	// lefthand
	// + unary
	// - unary
	// ~ unary
	// ! unary
	op.unary = function(){
	  var ll;
	  if(ll = this.eat(['+','-','~', '!'])){
	    return this.getset('(' + ll.type + this.unary().get + ')') ;
	  }else{
	    return this.member()
	  }
	}
	
	// call[lefthand] :
	// member args
	// member [ expression ]
	// member . ident  
	
	op.member = function(base, last, pathes, prevBase){
	  var ll, path, extValue;
	
	
	  var onlySimpleAccessor = false;
	  if(!base){ //first
	    path = this.primary();
	    var type = typeof path;
	    if(type === 'string'){ 
	      pathes = [];
	      pathes.push( path );
	      last = path;
	      extValue = extName + "." + path
	      base = ctxName + "._sg_('" + path + "', " + varName + ", " + extName + ")";
	      onlySimpleAccessor = true;
	    }else{ //Primative Type
	      if(path.get === 'this'){
	        base = ctxName;
	        pathes = ['this'];
	      }else{
	        pathes = null;
	        base = path.get;
	      }
	    }
	  }else{ // not first enter
	    if(typeof last === 'string' && isPath( last) ){ // is valid path
	      pathes.push(last);
	    }else{
	      if(pathes && pathes.length) this.depend.push(pathes);
	      pathes = null;
	    }
	  }
	  if(ll = this.eat(['[', '.', '('])){
	    switch(ll.type){
	      case '.':
	          // member(object, property, computed)
	        var tmpName = this.match('IDENT').value;
	        prevBase = base;
	        if( this.la() !== "(" ){ 
	          base = ctxName + "._sg_('" + tmpName + "', " + base + ")";
	        }else{
	          base += "['" + tmpName + "']";
	        }
	        return this.member( base, tmpName, pathes,  prevBase);
	      case '[':
	          // member(object, property, computed)
	        path = this.assign();
	        prevBase = base;
	        if( this.la() !== "(" ){ 
	        // means function call, we need throw undefined error when call function
	        // and confirm that the function call wont lose its context
	          base = ctxName + "._sg_(" + path.get + ", " + base + ")";
	        }else{
	          base += "[" + path.get + "]";
	        }
	        this.match(']')
	        return this.member(base, path, pathes, prevBase);
	      case '(':
	        // call(callee, args)
	        var args = this.arguments().join(',');
	        base =  base+"(" + args +")";
	        this.match(')')
	        return this.member(base, null, pathes);
	    }
	  }
	  if( pathes && pathes.length ) this.depend.push( pathes );
	  var res =  {get: base};
	  if(last){
	    res.set = ctxName + "._ss_(" + 
	        (last.get? last.get : "'"+ last + "'") + 
	        ","+ _.setName + ","+ 
	        (prevBase?prevBase:_.varName) + 
	        ", '=', "+ ( onlySimpleAccessor? 1 : 0 ) + ")";
	  
	  }
	  return res;
	}
	
	/**
	 * 
	 */
	op.arguments = function(end){
	  end = end || ')'
	  var args = [];
	  do{
	    if(this.la() !== end){
	      args.push(this.assign().get)
	    }
	  }while( this.eat(','));
	  return args
	}
	
	
	// primary :
	// this 
	// ident
	// literal
	// array
	// object
	// ( expression )
	
	op.primary = function(){
	  var ll = this.ll();
	  switch(ll.type){
	    case "{":
	      return this.object();
	    case "[":
	      return this.array();
	    case "(":
	      return this.paren();
	    // literal or ident
	    case 'STRING':
	      this.next();
	      return this.getset("'" + ll.value + "'")
	    case 'NUMBER':
	      this.next();
	      return this.getset(""+ll.value);
	    case "IDENT":
	      this.next();
	      if(isKeyWord(ll.value)){
	        return this.getset( ll.value );
	      }
	      return ll.value;
	    default: 
	      this.error('Unexpected Token: ' + ll.type);
	  }
	}
	
	// object
	//  {propAssign [, propAssign] * [,]}
	
	// propAssign
	//  prop : assign
	
	// prop
	//  STRING
	//  IDENT
	//  NUMBER
	
	op.object = function(){
	  var code = [this.match('{').type];
	
	  var ll = this.eat( ['STRING', 'IDENT', 'NUMBER'] );
	  while(ll){
	    code.push("'" + ll.value + "'" + this.match(':').type);
	    var get = this.assign().get;
	    code.push(get);
	    ll = null;
	    if(this.eat(",") && (ll = this.eat(['STRING', 'IDENT', 'NUMBER'])) ) code.push(",");
	  }
	  code.push(this.match('}').type);
	  return {get: code.join("")}
	}
	
	// array
	// [ assign[,assign]*]
	op.array = function(){
	  var code = [this.match('[').type], item;
	  if( this.eat("]") ){
	
	     code.push("]");
	  } else {
	    while(item = this.assign()){
	      code.push(item.get);
	      if(this.eat(',')) code.push(",");
	      else break;
	    }
	    code.push(this.match(']').type);
	  }
	  return {get: code.join("")};
	}
	
	// '(' expression ')'
	op.paren = function(){
	  this.match('(');
	  var res = this.filter()
	  res.get = '(' + res.get + ')';
	  this.match(')');
	  return res;
	}
	
	op.getset = function(get, set){
	  return {
	    get: get,
	    set: set
	  }
	}
	
	
	
	module.exports = Parser;


/***/ },
/* 18 */
/***/ function(module, exports) {

	module.exports = {
	  element: function(name, attrs, children){
	    return {
	      type: 'element',
	      tag: name,
	      attrs: attrs,
	      children: children
	    }
	  },
	  attribute: function(name, value, mdf){
	    return {
	      type: 'attribute',
	      name: name,
	      value: value,
	      mdf: mdf
	    }
	  },
	  "if": function(test, consequent, alternate){
	    return {
	      type: 'if',
	      test: test,
	      consequent: consequent,
	      alternate: alternate
	    }
	  },
	  list: function(sequence, variable, body, alternate, track){
	    return {
	      type: 'list',
	      sequence: sequence,
	      alternate: alternate,
	      variable: variable,
	      body: body,
	      track: track
	    }
	  },
	  expression: function( body, setbody, constant ){
	    return {
	      type: "expression",
	      body: body,
	      constant: constant || false,
	      setbody: setbody || false
	    }
	  },
	  text: function(text){
	    return {
	      type: "text",
	      text: text
	    }
	  },
	  template: function(template){
	    return {
	      type: 'template',
	      content: template
	    }
	  }
	}


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(10);
	var config = __webpack_require__(14);
	
	// some custom tag  will conflict with the Lexer progress
	var conflictTag = {"}": "{", "]": "["}, map1, map2;
	// some macro for lexer
	var macro = {
	  'NAME': /(?:[:_A-Za-z][-\.:_0-9A-Za-z]*)/,
	  'IDENT': /[\$_A-Za-z][_0-9A-Za-z\$]*/,
	  'SPACE': /[\r\n\t\f ]/
	}
	
	
	var test = /a|(b)/.exec("a");
	var testSubCapure = test && test[1] === undefined? 
	  function(str){ return str !== undefined }
	  :function(str){return !!str};
	
	function wrapHander(handler){
	  return function(all){
	    return {type: handler, value: all }
	  }
	}
	
	function Lexer(input, opts){
	  if(conflictTag[config.END]){
	    this.markStart = conflictTag[config.END];
	    this.markEnd = config.END;
	  }
	
	  this.input = (input||"").trim();
	  this.opts = opts || {};
	  this.map = this.opts.mode !== 2?  map1: map2;
	  this.states = ["INIT"];
	  if(opts && opts.expression){
	     this.states.push("JST");
	     this.expression = true;
	  }
	}
	
	var lo = Lexer.prototype
	
	
	lo.lex = function(str){
	  str = (str || this.input).trim();
	  var tokens = [], split, test,mlen, token, state;
	  this.input = str, 
	  this.marks = 0;
	  // init the pos index
	  this.index=0;
	  var i = 0;
	  while(str){
	    i++
	    state = this.state();
	    split = this.map[state] 
	    test = split.TRUNK.exec(str);
	    if(!test){
	      this.error('Unrecoginized Token');
	    }
	    mlen = test[0].length;
	    str = str.slice(mlen)
	    token = this._process.call(this, test, split, str)
	    if(token) tokens.push(token)
	    this.index += mlen;
	    // if(state == 'TAG' || state == 'JST') str = this.skipspace(str);
	  }
	
	  tokens.push({type: 'EOF'});
	
	  return tokens;
	}
	
	lo.error = function(msg){
	  throw  Error("Parse Error: " + msg +  ':\n' + _.trackErrorPos(this.input, this.index));
	}
	
	lo._process = function(args, split,str){
	  // console.log(args.join(","), this.state())
	  var links = split.links, marched = false, token;
	
	  for(var len = links.length, i=0;i<len ;i++){
	    var link = links[i],
	      handler = link[2],
	      index = link[0];
	    // if(args[6] === '>' && index === 6) console.log('haha')
	    if(testSubCapure(args[index])) {
	      marched = true;
	      if(handler){
	        token = handler.apply(this, args.slice(index, index + link[1]))
	        if(token)  token.pos = this.index;
	      }
	      break;
	    }
	  }
	  if(!marched){ // in ie lt8 . sub capture is "" but ont 
	    switch(str.charAt(0)){
	      case "<":
	        this.enter("TAG");
	        break;
	      default:
	        this.enter("JST");
	        break;
	    }
	  }
	  return token;
	}
	lo.enter = function(state){
	  this.states.push(state)
	  return this;
	}
	
	lo.state = function(){
	  var states = this.states;
	  return states[states.length-1];
	}
	
	lo.leave = function(state){
	  var states = this.states;
	  if(!state || states[states.length-1] === state) states.pop()
	}
	
	
	Lexer.setup = function(){
	  macro.END = config.END;
	  macro.BEGIN = config.BEGIN;
	  
	  // living template lexer
	  map1 = genMap([
	    // INIT
	    rules.ENTER_JST,
	    rules.ENTER_TAG,
	    rules.TEXT,
	
	    //TAG
	    rules.TAG_NAME,
	    rules.TAG_OPEN,
	    rules.TAG_CLOSE,
	    rules.TAG_PUNCHOR,
	    rules.TAG_ENTER_JST,
	    rules.TAG_UNQ_VALUE,
	    rules.TAG_STRING,
	    rules.TAG_SPACE,
	    rules.TAG_COMMENT,
	
	    // JST
	    rules.JST_OPEN,
	    rules.JST_CLOSE,
	    rules.JST_COMMENT,
	    rules.JST_EXPR_OPEN,
	    rules.JST_IDENT,
	    rules.JST_SPACE,
	    rules.JST_LEAVE,
	    rules.JST_NUMBER,
	    rules.JST_PUNCHOR,
	    rules.JST_STRING,
	    rules.JST_COMMENT
	    ])
	
	  // ignored the tag-relative token
	  map2 = genMap([
	    // INIT no < restrict
	    rules.ENTER_JST2,
	    rules.TEXT,
	    // JST
	    rules.JST_COMMENT,
	    rules.JST_OPEN,
	    rules.JST_CLOSE,
	    rules.JST_EXPR_OPEN,
	    rules.JST_IDENT,
	    rules.JST_SPACE,
	    rules.JST_LEAVE,
	    rules.JST_NUMBER,
	    rules.JST_PUNCHOR,
	    rules.JST_STRING,
	    rules.JST_COMMENT
	    ])
	}
	
	
	function genMap(rules){
	  var rule, map = {}, sign;
	  for(var i = 0, len = rules.length; i < len ; i++){
	    rule = rules[i];
	    sign = rule[2] || 'INIT';
	    ( map[sign] || (map[sign] = {rules:[], links:[]}) ).rules.push(rule);
	  }
	  return setup(map);
	}
	
	function setup(map){
	  var split, rules, trunks, handler, reg, retain, rule;
	  function replaceFn(all, one){
	    return typeof macro[one] === 'string'? 
	      _.escapeRegExp(macro[one]) 
	      : String(macro[one]).slice(1,-1);
	  }
	
	  for(var i in map){
	
	    split = map[i];
	    split.curIndex = 1;
	    rules = split.rules;
	    trunks = [];
	
	    for(var j = 0,len = rules.length; j<len; j++){
	      rule = rules[j]; 
	      reg = rule[0];
	      handler = rule[1];
	
	      if(typeof handler === 'string'){
	        handler = wrapHander(handler);
	      }
	      if(_.typeOf(reg) === 'regexp') reg = reg.toString().slice(1, -1);
	
	      reg = reg.replace(/\{(\w+)\}/g, replaceFn)
	      retain = _.findSubCapture(reg) + 1; 
	      split.links.push([split.curIndex, retain, handler]); 
	      split.curIndex += retain;
	      trunks.push(reg);
	    }
	    split.TRUNK = new RegExp("^(?:(" + trunks.join(")|(") + "))")
	  }
	  return map;
	}
	
	var rules = {
	
	  // 1. INIT
	  // ---------------
	
	  // mode1's JST ENTER RULE
	  ENTER_JST: [/[^\x00<]*?(?={BEGIN})/, function(all){
	    this.enter('JST');
	    if(all) return {type: 'TEXT', value: all}
	  }],
	
	  // mode2's JST ENTER RULE
	  ENTER_JST2: [/[^\x00]*?(?={BEGIN})/, function(all){
	    this.enter('JST');
	    if(all) return {type: 'TEXT', value: all}
	  }],
	
	  ENTER_TAG: [/[^\x00]*?(?=<[\w\/\!])/, function(all){ 
	    this.enter('TAG');
	    if(all) return {type: 'TEXT', value: all}
	  }],
	
	  TEXT: [/[^\x00]+/, 'TEXT' ],
	
	  // 2. TAG
	  // --------------------
	  TAG_NAME: [/{NAME}/, 'NAME', 'TAG'],
	  TAG_UNQ_VALUE: [/[^\{}&"'=><`\r\n\f\t ]+/, 'UNQ', 'TAG'],
	
	  TAG_OPEN: [/<({NAME})\s*/, function(all, one){ //"
	    return {type: 'TAG_OPEN', value: one}
	  }, 'TAG'],
	  TAG_CLOSE: [/<\/({NAME})[\r\n\f\t ]*>/, function(all, one){
	    this.leave();
	    return {type: 'TAG_CLOSE', value: one }
	  }, 'TAG'],
	
	    // mode2's JST ENTER RULE
	  TAG_ENTER_JST: [/(?={BEGIN})/, function(){
	    this.enter('JST');
	  }, 'TAG'],
	
	
	  TAG_PUNCHOR: [/[\>\/=&]/, function(all){
	    if(all === '>') this.leave();
	    return {type: all, value: all }
	  }, 'TAG'],
	  TAG_STRING:  [ /'([^']*)'|"([^"]*)\"/, /*'*/  function(all, one, two){ 
	    var value = one || two || "";
	
	    return {type: 'STRING', value: value}
	  }, 'TAG'],
	
	  TAG_SPACE: [/{SPACE}+/, null, 'TAG'],
	  TAG_COMMENT: [/<\!--([^\x00]*?)--\>/, function(all){
	    this.leave()
	    // this.leave('TAG')
	  } ,'TAG'],
	
	  // 3. JST
	  // -------------------
	
	  JST_OPEN: ['{BEGIN}#{SPACE}*({IDENT})', function(all, name){
	    return {
	      type: 'OPEN',
	      value: name
	    }
	  }, 'JST'],
	  JST_LEAVE: [/{END}/, function(all){
	    if(this.markEnd === all && this.expression) return {type: this.markEnd, value: this.markEnd};
	    if(!this.markEnd || !this.marks ){
	      this.firstEnterStart = false;
	      this.leave('JST');
	      return {type: 'END'}
	    }else{
	      this.marks--;
	      return {type: this.markEnd, value: this.markEnd}
	    }
	  }, 'JST'],
	  JST_CLOSE: [/{BEGIN}\s*\/({IDENT})\s*{END}/, function(all, one){
	    this.leave('JST');
	    return {
	      type: 'CLOSE',
	      value: one
	    }
	  }, 'JST'],
	  JST_COMMENT: [/{BEGIN}\!([^\x00]*?)\!{END}/, function(){
	    this.leave();
	  }, 'JST'],
	  JST_EXPR_OPEN: ['{BEGIN}',function(all, one){
	    if(all === this.markStart){
	      if(this.expression) return { type: this.markStart, value: this.markStart };
	      if(this.firstEnterStart || this.marks){
	        this.marks++
	        this.firstEnterStart = false;
	        return { type: this.markStart, value: this.markStart };
	      }else{
	        this.firstEnterStart = true;
	      }
	    }
	    return {
	      type: 'EXPR_OPEN',
	      escape: false
	    }
	
	  }, 'JST'],
	  JST_IDENT: ['{IDENT}', 'IDENT', 'JST'],
	  JST_SPACE: [/[ \r\n\f]+/, null, 'JST'],
	  JST_PUNCHOR: [/[=!]?==|[-=><+*\/%\!]?\=|\|\||&&|\@\(|\.\.|[<\>\[\]\(\)\-\|\{}\+\*\/%?:\.!,]/, function(all){
	    return { type: all, value: all }
	  },'JST'],
	
	  JST_STRING:  [ /'([^']*)'|"([^"]*)"/, function(all, one, two){ //"'
	    return {type: 'STRING', value: one || two || ""}
	  }, 'JST'],
	  JST_NUMBER: [/(?:[0-9]*\.[0-9]+|[0-9]+)(e\d+)?/, function(all){
	    return {type: 'NUMBER', value: parseFloat(all, 10)};
	  }, 'JST']
	}
	
	
	// setup when first config
	Lexer.setup();
	
	
	
	module.exports = Lexer;


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(10);
	
	function simpleDiff(now, old){
	  var nlen = now.length;
	  var olen = old.length;
	  if(nlen !== olen){
	    return true;
	  }
	  for(var i = 0; i < nlen ; i++){
	    if(now[i] !== old[i]) return  true;
	  }
	  return false
	
	}
	
	function equals(a,b){
	  return a === b;
	}
	
	// array1 - old array
	// array2 - new array
	function ld(array1, array2, equalFn){
	  var n = array1.length;
	  var m = array2.length;
	  var equalFn = equalFn || equals;
	  var matrix = [];
	  for(var i = 0; i <= n; i++){
	    matrix.push([i]);
	  }
	  for(var j=1;j<=m;j++){
	    matrix[0][j]=j;
	  }
	  for(var i = 1; i <= n; i++){
	    for(var j = 1; j <= m; j++){
	      if(equalFn(array1[i-1], array2[j-1])){
	        matrix[i][j] = matrix[i-1][j-1];
	      }else{
	        matrix[i][j] = Math.min(
	          matrix[i-1][j]+1, //delete
	          matrix[i][j-1]+1//add
	          )
	      }
	    }
	  }
	  return matrix;
	}
	// arr2 - new array
	// arr1 - old array
	function diffArray(arr2, arr1, diff, diffFn) {
	  if(!diff) return simpleDiff(arr2, arr1);
	  var matrix = ld(arr1, arr2, diffFn)
	  var n = arr1.length;
	  var i = n;
	  var m = arr2.length;
	  var j = m;
	  var edits = [];
	  var current = matrix[i][j];
	  while(i>0 || j>0){
	  // the last line
	    if (i === 0) {
	      edits.unshift(3);
	      j--;
	      continue;
	    }
	    // the last col
	    if (j === 0) {
	      edits.unshift(2);
	      i--;
	      continue;
	    }
	    var northWest = matrix[i - 1][j - 1];
	    var west = matrix[i - 1][j];
	    var north = matrix[i][j - 1];
	
	    var min = Math.min(north, west, northWest);
	
	    if (min === west) {
	      edits.unshift(2); //delete
	      i--;
	      current = west;
	    } else if (min === northWest ) {
	      if (northWest === current) {
	        edits.unshift(0); //no change
	      } else {
	        edits.unshift(1); //update
	        current = northWest;
	      }
	      i--;
	      j--;
	    } else {
	      edits.unshift(3); //add
	      j--;
	      current = north;
	    }
	  }
	  var LEAVE = 0;
	  var ADD = 3;
	  var DELELE = 2;
	  var UPDATE = 1;
	  var n = 0;m=0;
	  var steps = [];
	  var step = {index: null, add:0, removed:[]};
	
	  for(var i=0;i<edits.length;i++){
	    if(edits[i] > 0 ){ // NOT LEAVE
	      if(step.index === null){
	        step.index = m;
	      }
	    } else { //LEAVE
	      if(step.index != null){
	        steps.push(step)
	        step = {index: null, add:0, removed:[]};
	      }
	    }
	    switch(edits[i]){
	      case LEAVE:
	        n++;
	        m++;
	        break;
	      case ADD:
	        step.add++;
	        m++;
	        break;
	      case DELELE:
	        step.removed.push(arr1[n])
	        n++;
	        break;
	      case UPDATE:
	        step.add++;
	        step.removed.push(arr1[n])
	        n++;
	        m++;
	        break;
	    }
	  }
	  if(step.index != null){
	    steps.push(step)
	  }
	  return steps
	}
	
	
	
	// diffObject
	// ----
	// test if obj1 deepEqual obj2
	function diffObject( now, last, diff ){
	
	
	  if(!diff){
	
	    for( var j in now ){
	      if( last[j] !== now[j] ) return true
	    }
	
	    for( var n in last ){
	      if(last[n] !== now[n]) return true;
	    }
	
	  }else{
	
	    var nKeys = _.keys(now);
	    var lKeys = _.keys(last);
	
	    /**
	     * [description]
	     * @param  {[type]} a    [description]
	     * @param  {[type]} b){                   return now[b] [description]
	     * @return {[type]}      [description]
	     */
	    return diffArray(nKeys, lKeys, diff, function(a, b){
	      return now[b] === last[a];
	    });
	
	  }
	
	  return false;
	
	
	}
	
	module.exports = {
	  diffArray: diffArray,
	  diffObject: diffObject
	}

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(10);
	var config = __webpack_require__(14);
	var parse = __webpack_require__(15);
	var node = __webpack_require__(18);
	
	
	function initDefinition(context, definition, beforeConfig){
	
	  var eventConfig, hasInstanceComputed = !!definition.computed, template;
	  var usePrototyeString = typeof context.template === 'string' && !definition.template;
	
	  if(definition.events || context.events){
	    eventConfig = _.extend(definition.events || {}, context.events);
	    if(definition.events) delete definition.events;
	  }
	
	
	  definition.data = definition.data || {};
	  definition.computed = definition.computed || {};
	  if(context.data) _.extend(definition.data, context.data);
	  if(context.computed) _.extend(definition.computed, context.computed);
	
	  var usePrototyeString = typeof context.template === 'string' && !definition.template;
	
	  _.extend(context, definition, true);
	
	  if ( eventConfig ) {
	    context.$on( eventConfig );
	  }
	
	  // we need add some logic at client.
	  beforeConfig && beforeConfig();
	
	  // only have instance computed, we need prepare the property
	  if( hasInstanceComputed ) context.computed = handleComputed(context.computed);
	
	  context.$emit( "$config", context.data );
	  context.config && context.config( context.data );
	  context.$emit( "$afterConfig", context.data );
	
	  template = context.template;
	
	 
	  if(typeof template === 'string') {
	    template = parse.parse(template);
	    if(usePrototyeString) {
	    // avoid multiply compile
	      context.constructor.prototype.template = template;
	    }else{
	      delete context.template;
	    }
	  }
	  return template;
	}
	
	var handleComputed = (function(){
	  // wrap the computed getter;
	  function wrapGet(get){
	    return function(context){
	      return get.call(context, context.data );
	    }
	  }
	  // wrap the computed setter;
	  function wrapSet(set){
	    return function(context, value){
	      set.call( context, value, context.data );
	      return value;
	    }
	  }
	
	  return function( computed ){
	    if(!computed) return;
	    var parsedComputed = {}, handle, pair, type;
	    for(var i in computed){
	      handle = computed[i]
	      type = typeof handle;
	
	      if(handle.type === 'expression'){
	        parsedComputed[i] = handle;
	        continue;
	      }
	      if( type === "string" ){
	        parsedComputed[i] = parse.expression(handle)
	      }else{
	        pair = parsedComputed[i] = {type: 'expression'};
	        if(type === "function" ){
	          pair.get = wrapGet(handle);
	        }else{
	          if(handle.get) pair.get = wrapGet(handle.get);
	          if(handle.set) pair.set = wrapSet(handle.set);
	        }
	      } 
	    }
	    return parsedComputed;
	  }
	})();
	
	
	function prepareAttr ( ast ,directive ){
	  if(ast.parsed ) return ast;
	  var value = ast.value;
	  var name=  ast.name, body, constant;
	  if(typeof value === 'string' && ~value.indexOf(config.BEGIN) && ~value.indexOf(config.END) ){
	    if( !directive || !directive.nps ) {
	      var parsed = parse.parse(value, { mode: 2 });
	      if(parsed.length === 1 && parsed[0].type === 'expression'){ 
	        body = parsed[0];
	      } else{
	        constant = true;
	        body = [];
	        parsed.forEach(function(item){
	          if(!item.constant) constant=false;
	          // silent the mutiple inteplation
	            body.push(item.body || "'" + item.text.replace(/'/g, "\\'") + "'");        
	        });
	        body = node.expression("[" + body.join(",") + "].join('')", null, constant);
	      }
	      ast.value = body;
	    }
	  }
	  ast.parsed = true;
	  return ast;
	}
	
	module.exports = {
	  // share logic between server and client
	  initDefinition: initDefinition,
	  handleComputed: handleComputed,
	  prepareAttr: prepareAttr
	}

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	
	var _ = __webpack_require__(23);
	var Base = __webpack_require__(24);
	
	function ServerManager( options ){
	  if(this instanceof ServerManager === false){ return new ServerManager(options); }
	  Base.apply( this, arguments );
	}
	
	var o =_.inherit( ServerManager, Base.prototype );
	
	_.extend(o , {
	  exec: function ( path ){
	    var found = this.decode(path);
	    if( !found ) return;
	    var param = found.param;
	
	    //@FIXIT: We NEED decodeURIComponent in server side!!
	
	    for(var i in param){
	      if(typeof param[i] === 'string') param[i] = decodeURIComponent(param[i]);
	    }
	    var states = [];
	    var state = found.state;
	    this.current = state;
	
	    while(state && !state.root){
	      states.unshift( state );
	      state = state.parent;
	    }
	
	    return {
	      states: states,
	      param: param
	    }
	  }
	})
	
	
	module.exports = ServerManager

/***/ },
/* 23 */
/***/ function(module, exports) {

	var _ = module.exports = {};
	var slice = [].slice, o2str = ({}).toString;
	
	// merge o2's properties to Object o1. 
	_.extend = function(o1, o2, override){
	  for(var i in o2) if(override || o1[i] === undefined){
	    o1[i] = o2[i];
	  }
	  return o1;
	};
	
	var rDot = /\./g;
	_.countDot = function(word){
	  var ret = word.match(rDot)
	  return ret? ret.length: 0;
	}
	
	_.values = function( o, key){
	  var keys = [];
	  for(var i in o) if( o.hasOwnProperty(i) ){
	    keys.push( key? i: o[i] );
	  }
	  return keys;
	};
	
	_.inherit = function( cstor, o ){
	  function Faker(){}
	  Faker.prototype = o;
	  cstor.prototype = new Faker();
	  cstor.prototype.constructor = cstor;
	  return o;
	}
	
	_.slice = function(arr, index){
	  return slice.call(arr, index);
	};
	
	_.typeOf = function typeOf (o) {
	  return o == null ? String(o) : o2str.call(o).slice(8, -1).toLowerCase();
	};
	
	//strict eql
	_.eql = function(o1, o2){
	  var t1 = _.typeOf(o1), t2 = _.typeOf(o2);
	  if( t1 !== t2) return false;
	  if(t1 === 'object'){
	    // only check the first's properties
	    for(var i in o1){
	      // Immediately return if a mismatch is found.
	      if( o1[i] !== o2[i] ) return false;
	    }
	    return true;
	  }
	  return o1 === o2;
	};
	
	// small emitter 
	_.emitable = (function(){
	  function norm(ev){
	    var eventAndNamespace = (ev||'').split(':');
	    return {event: eventAndNamespace[0], namespace: eventAndNamespace[1]};
	  }
	  var API = {
	    once: function(event, fn){
	      var callback = function(){
	        fn.apply(this, arguments);
	        this.off(event, callback);
	      };
	      return this.on(event, callback);
	    },
	    on: function(event, fn) {
	      if(typeof event === 'object'){
	        for (var i in event) {
	          this.on(i, event[i]);
	        }
	        return this;
	      }
	      var ne = norm(event);
	      event=ne.event;
	      if(event && typeof fn === 'function' ){
	        var handles = this._handles || (this._handles = {}),
	          calls = handles[event] || (handles[event] = []);
	        fn._ns = ne.namespace;
	        calls.push(fn);
	      }
	      return this;
	    },
	    off: function(event, fn) {
	      var ne = norm(event); event = ne.event;
	      if(!event || !this._handles) this._handles = {};
	
	      var handles = this._handles;
	      var calls = handles[event];
	
	      if (calls) {
	        if (!fn && !ne.namespace) {
	          handles[event] = [];
	        }else{
	          for (var i = 0, len = calls.length; i < len; i++) {
	            if ( (!fn || fn === calls[i]) && (!ne.namespace || calls[i]._ns === ne.namespace) ) {
	              calls.splice(i, 1);
	              return this;
	            }
	          }
	        }
	      }
	
	      return this;
	    },
	    emit: function(event){
	      var ne = norm(event); event = ne.event;
	
	      var args = _.slice(arguments, 1),
	        handles = this._handles, calls;
	
	      if (!handles || !(calls = handles[event])) return this;
	      for (var i = 0, len = calls.length; i < len; i++) {
	        var fn = calls[i];
	        if( !ne.namespace || fn._ns === ne.namespace ) fn.apply(this, args);
	      }
	      return this;
	    }
	  };
	  return function(obj){
	      obj = typeof obj == "function" ? obj.prototype : obj;
	      return _.extend(obj, API);
	  };
	})();
	
	_.bind = function(fn, context){
	  return function(){
	    return fn.apply(context, arguments);
	  };
	};
	
	var rDbSlash = /\/+/g, // double slash
	  rEndSlash = /\/$/;    // end slash
	
	_.cleanPath = function (path){
	  return ("/" + path).replace( rDbSlash,"/" ).replace( rEndSlash, "" ) || "/";
	};
	
	// normalize the path
	function normalizePath(path) {
	  // means is from 
	  // (?:\:([\w-]+))?(?:\(([^\/]+?)\))|(\*{2,})|(\*(?!\*)))/g
	  var preIndex = 0;
	  var keys = [];
	  var index = 0;
	  var matches = "";
	
	  path = _.cleanPath(path);
	
	  var regStr = path
	    //  :id(capture)? | (capture)   |  ** | * 
	    .replace(/\:([\w-]+)(?:\(([^\/]+?)\))?|(?:\(([^\/]+)\))|(\*{2,})|(\*(?!\*))/g, 
	      function(all, key, keyformat, capture, mwild, swild, startAt) {
	        // move the uncaptured fragment in the path
	        if(startAt > preIndex) matches += path.slice(preIndex, startAt);
	        preIndex = startAt + all.length;
	        if( key ){
	          matches += "(" + key + ")";
	          keys.push(key);
	          return "("+( keyformat || "[\\w-]+")+")";
	        }
	        matches += "(" + index + ")";
	
	        keys.push( index++ );
	
	        if( capture ){
	           // sub capture detect
	          return "(" + capture +  ")";
	        } 
	        if(mwild) return "(.*)";
	        if(swild) return "([^\\/]*)";
	    });
	
	  if(preIndex !== path.length) matches += path.slice(preIndex);
	
	  return {
	    regexp: new RegExp("^" + regStr +"/?$"),
	    keys: keys,
	    matches: matches || path
	  };
	}
	
	_.log = function(msg, type){
	  typeof console !== "undefined" && console[type || "log"](msg); //eslint-disable-line no-console
	};
	
	_.isPromise = function( obj ){
	
	  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
	
	};
	
	_.normalize = normalizePath;


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	
	var State = __webpack_require__(25),
	  _ = __webpack_require__(23),
	  stateFn = State.prototype.state;
	
	function BaseMan( options ){
	
	  options = options || {};
	
	  this._states = {};
	
	  this.strict = options.strict;
	  this.title = options.title;
	
	  if(options.routes) this.state(options.routes);
	
	}
	
	_.extend( _.emitable( BaseMan ), {
	    // keep blank
	    name: '',
	
	    root: true,
	
	
	    state: function(stateName){
	
	      var active = this.active;
	      var args = _.slice(arguments, 1);
	
	      if(typeof stateName === "string" && active){
	         stateName = stateName.replace("~", active.name);
	         if(active.parent) stateName = stateName.replace("^", active.parent.name || "");
	      }
	      // ^ represent current.parent
	      // ~ represent  current
	      // only 
	      args.unshift(stateName);
	      return stateFn.apply(this, args);
	
	    },
	
	    decode: function(path, needLocation){
	
	      var pathAndQuery = path.split("?");
	      var query = this._findQuery(pathAndQuery[1]);
	      path = pathAndQuery[0];
	      var found = this._findState(this, path);
	      if(found) _.extend(found.param, query);
	      return found;
	
	    },
	    encode: function(stateName, param, needLink){
	      var state = this.state(stateName);
	      var history = this.history;
	      if(!state) return;
	      var url  = state.encode(param);
	      
	      return needLink? (history.mode!==2? history.prefix + url : url ): url;
	    },
	    // notify specify state
	    // check the active statename whether to match the passed condition (stateName and param)
	    is: function(stateName, param, isStrict){
	      if(!stateName) return false;
	      stateName = (stateName.name || stateName);
	      var current = this.current, currentName = current.name;
	      var matchPath = isStrict? currentName === stateName : (currentName + ".").indexOf(stateName + ".")===0;
	      return matchPath && (!param || _.eql(param, this.param)); 
	    },
	
	
	    _wrapPromise: function( promise, next ){
	
	      return promise.then( next, function(){ next(false); }) ;
	
	    },
	
	    _findQuery: function(querystr){
	
	      var queries = querystr && querystr.split("&"), query= {};
	      if(queries){
	        var len = queries.length;
	        for(var i =0; i< len; i++){
	          var tmp = queries[i].split("=");
	          query[tmp[0]] = tmp[1];
	        }
	      }
	      return query;
	
	    },
	    _findState: function(state, path){
	      var states = state._states, found, param;
	
	      // leaf-state has the high priority upon branch-state
	      if(state.hasNext){
	
	        var stateList = _.values( states ).sort( this._sortState );
	        var len = stateList.length;
	
	        for(var i = 0; i < len; i++){
	
	          found = this._findState( stateList[i], path );
	          if( found ) return found;
	        }
	
	      }
	      // in strict mode only leaf can be touched
	      // if all children is don. will try it self
	      param = state.regexp && state.decode(path);
	      if(param){
	        return {
	          state: state,
	          param: param
	        }
	      }else{
	        return false;
	      }
	    },
	    _sortState: function( a, b ){
	      return ( b.priority || 0 ) - ( a.priority || 0 );
	    },
	    // find the same branch;
	    _findBase: function(now, before){
	
	      if(!now || !before || now == this || before == this) return this;
	      var np = now, bp = before, tmp;
	      while(np && bp){
	        tmp = bp;
	        while(tmp){
	          if(np === tmp) return tmp;
	          tmp = tmp.parent;
	        }
	        np = np.parent;
	      }
	    },
	
	}, true);
	
	module.exports = BaseMan;
	


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(23);
	
	function State(option){
	  this._states = {};
	  this._pending = false;
	  this.visited = false;
	  if(option) this.config(option);
	}
	
	
	//regexp cache
	State.rCache = {};
	
	_.extend( _.emitable( State ), {
	
	  getTitle: function(options){
	    var cur = this ,title;
	    while( cur ){
	      title = cur.title;
	      if(title) return typeof title === 'function'? cur.title(options): cur.title
	      cur = cur.parent;
	    }
	    return title;
	  },
	
	
	  state: function(stateName, config){
	    if(_.typeOf(stateName) === "object"){
	      var keys = _.values(stateName, true);
	      keys.sort(function(ka, kb){
	        return _.countDot(ka) - _.countDot(kb);
	      });
	
	      for(var i = 0, len = keys.length; i< len ;i++){
	        var key = keys[i];
	        this.state(key, stateName[key])
	      }
	      return this;
	    }
	    var current = this, next, nextName, states = this._states, i=0;
	
	    if( typeof stateName === "string" ) stateName = stateName.split(".");
	
	    var slen = stateName.length;
	    var stack = [];
	
	    do{
	      nextName = stateName[i];
	      next = states[nextName];
	      stack.push(nextName);
	      if(!next){
	        if(!config) return;
	        next = states[nextName] = new State();
	        _.extend(next, {
	          parent: current,
	          manager: current.manager || current,
	          name: stack.join("."),
	          currentName: nextName
	        });
	        current.hasNext = true;
	        next.configUrl();
	      }
	      current = next;
	      states = next._states;
	    }while((++i) < slen )
	
	    if(config){
	       next.config(config);
	       return this;
	    } else {
	      return current;
	    }
	  },
	
	  config: function(configure){
	
	    configure = this._getConfig(configure);
	
	    for(var i in configure){
	      var prop = configure[i];
	      switch(i){
	        case "url":
	          if(typeof prop === "string"){
	            this.url = prop;
	            this.configUrl();
	          }
	          break;
	        case "events":
	          this.on(prop);
	          break;
	        default:
	          this[i] = prop;
	      }
	    }
	  },
	
	  // children override
	  _getConfig: function(configure){
	    return typeof configure === "function"? {enter: configure} : configure;
	  },
	
	  //from url
	  configUrl: function(){
	    var url = "" , base = this;
	
	    while( base ){
	
	      url = (typeof base.url === "string" ? base.url: (base.currentName || "")) + "/" + url;
	
	      // means absolute;
	      if(url.indexOf("^/") === 0) {
	        url = url.slice(1);
	        break;
	      }
	      base = base.parent;
	    }
	    this.pattern = _.cleanPath("/" + url);
	    var pathAndQuery = this.pattern.split("?");
	    this.pattern = pathAndQuery[0];
	    // some Query we need watched
	
	    _.extend(this, _.normalize(this.pattern), true);
	  },
	  encode: function(param){
	    var state = this;
	    param = param || {};
	
	    var matched = "%";
	
	    var url = state.matches.replace(/\(([\w-]+)\)/g, function(all, capture){
	      var sec = param[capture] || "";
	      matched+= capture + "%";
	      return sec;
	    }) + "?";
	
	    // remained is the query, we need concat them after url as query
	    for(var i in param) {
	      if( matched.indexOf("%"+i+"%") === -1) url += i + "=" + param[i] + "&";
	    }
	    return _.cleanPath( url.replace(/(?:\?|&)$/,"") );
	  },
	  decode: function( path ){
	    var matched = this.regexp.exec(path),
	      keys = this.keys;
	
	    if(matched){
	
	      var param = {};
	      for(var i =0,len=keys.length;i<len;i++){
	        param[keys[i]] = matched[i+1];
	      }
	      return param;
	    }else{
	      return false;
	    }
	  },
	  // by default, all lifecycle is permitted
	
	  async: function(){
	    throw new Error( 'please use option.async instead');
	  }
	
	});
	
	module.exports = State;


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	
	var Regular = __webpack_require__(27);
	
	var util = {
	  isPromiseLike: function (obj){
	    return !!obj && 
	      (typeof obj === 'object' || typeof obj === 'function') 
	      && typeof obj.then === 'function';
	  },
	  normPromise: function ( ret ){
	    return util.isPromiseLike(ret) ? ret: Promise.resolve(ret)
	  },
	  // if your define second argument, we will automatic generate a promise for you
	  proxyMethod: function( context, method, option ){
	    if(!context) return;
	    var fn = typeof method === 'string'? context[ method ]: method;
	    if(typeof fn === 'function'){
	      if(fn.length >= 2){
	        return new Promise(function(resolve){
	          fn.call(context, option, resolve);
	        })
	      }else{
	        return fn.call(context, option)
	      }
	    }
	  },
	  extend: Regular.util.extend,
	  extractState: (function(){
	    var rStateLink = /^([\w-]+(?:\.[\w-]+)*)\((.*)\)$/;
	
	    // app.blog({id:3})
	    return function extractState( stateLinkExpr ){
	      stateLinkExpr = stateLinkExpr.replace(/\s+/g, '');
	      var parsed = rStateLink.exec(stateLinkExpr);
	      if(parsed){
	        return {
	          name: parsed[1],
	          param: parsed[2]
	        }
	      }
	    }
	  })()
	
	}
	
	
	
	
	module.exports = util;

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	var env =  __webpack_require__(16);
	var config = __webpack_require__(14); 
	var Regular = module.exports = __webpack_require__(28);
	var Parser = Regular.Parser;
	var Lexer = Regular.Lexer;
	
	// if(env.browser){
	    __webpack_require__(40);
	    __webpack_require__(43);
	    __webpack_require__(44);
	    Regular.dom = __webpack_require__(30);
	// }
	Regular.env = env;
	Regular.util = __webpack_require__(10);
	Regular.parse = function(str, options){
	  options = options || {};
	
	  if(options.BEGIN || options.END){
	    if(options.BEGIN) config.BEGIN = options.BEGIN;
	    if(options.END) config.END = options.END;
	    Lexer.setup();
	  }
	  var ast = new Parser(str).parse();
	  return !options.stringify? ast : JSON.stringify(ast);
	}
	Regular.Cursor =__webpack_require__(36) 
	
	Regular.isServer = env.node;
	Regular.isRegular = function( Comp ){
	  return  Comp.prototype instanceof Regular;
	}
	
	


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * render for component in browsers
	 */
	
	var env = __webpack_require__(16);
	var Lexer = __webpack_require__(19);
	var Parser = __webpack_require__(17);
	var config = __webpack_require__(14);
	var _ = __webpack_require__(10);
	var extend = __webpack_require__(29);
	var shared = __webpack_require__(21);
	var combine = {};
	if(env.browser){
	  var dom = __webpack_require__(30);
	  var walkers = __webpack_require__(32);
	  var Group = __webpack_require__(35);
	  var doc = dom.doc;
	  combine = __webpack_require__(33);
	}
	var events = __webpack_require__(37);
	var Watcher = __webpack_require__(38);
	var parse = __webpack_require__(15);
	var filter = __webpack_require__(39);
	var ERROR = __webpack_require__(31).ERROR;
	var nodeCursor = __webpack_require__(36);
	var shared = __webpack_require__(21);
	
	
	/**
	* `Regular` is regularjs's NameSpace and BaseClass. Every Component is inherited from it
	* 
	* @class Regular
	* @module Regular
	* @constructor
	* @param {Object} options specification of the component
	*/
	var Regular = function(definition, options){
	  var prevRunning = env.isRunning;
	  env.isRunning = true;
	  var node, template, cursor, context = this, body, mountNode;
	
	 // template is a string (len < 16). we will find it container first
	
	  options = options || {};
	  definition = definition || {};
	
	  var dtemplate = definition.template;
	
	  if(env.browser) {
	
	    if( node = tryGetSelector( dtemplate ) ){
	      dtemplate = node;
	    }
	    if( dtemplate && dtemplate.nodeType ){
	      definition.template = dtemplate.innerHTML
	    }
	    
	    mountNode = definition.mountNode;
	    if(typeof mountNode === 'string'){
	      mountNode = dom.find( mountNode );
	      if(!mountNode) throw Error('mountNode ' + mountNode + ' is not found')
	    } 
	
	    if(mountNode){
	      cursor = nodeCursor(mountNode.firstChild)
	      delete definition.mountNode
	    }else{
	      cursor = options.cursor
	    }
	  }
	
	
	  template = shared.initDefinition(context, definition)
	  
	
	  if(context.$parent){
	     context.$parent._append(context);
	  }
	  context._children = [];
	  context.$refs = {};
	
	  context.$root = context.$root || context;
	
	
	  if( body = context._body ){
	    context._body = null
	    if(body.ast && body.ast.length){
	      context.$body = _.getCompileFn(body.ast, body.ctx , {
	        outer: context,
	        namespace: options.namespace,
	        extra: options.extra,
	        record: true
	      })
	    }
	  }
	
	  // handle computed
	  if(template){
	    context.group = context.$compile(template, {
	      namespace: options.namespace,
	      cursor: cursor
	    });
	    combine.node(context);
	  }
	
	
	  // this is outest component
	  if( !context.$parent ) context.$update();
	  context.$ready = true;
	
	  context.$emit("$init");
	  if( context.init ) context.init( context.data );
	  context.$emit("$afterInit");
	
	  env.isRunning = prevRunning;
	
	}
	
	
	walkers && (walkers.Regular = Regular);
	
	
	// description
	// -------------------------
	// 1. Regular and derived Class use same filter
	_.extend(Regular, {
	  // private data stuff
	  _directives: { __regexp__:[] },
	  _plugins: {},
	  _protoInheritCache: [ 'directive', 'use'] ,
	  __after__: function(supr, o) {
	
	    var template;
	    this.__after__ = supr.__after__;
	
	    // use name make the component global.
	    if(o.name) Regular.component(o.name, this);
	    // this.prototype.template = dom.initTemplate(o)
	    if(template = o.template){
	      var node, name;
	      if( env.browser ){
	        if( node = tryGetSelector(template) ) template = node ;
	        if( template && template.nodeType ){
	
	          if(name = dom.attr(template, 'name')) Regular.component(name, this);
	
	          template = template.innerHTML;
	        } 
	      }
	
	      if(typeof template === 'string' ){
	        this.prototype.template = config.PRECOMPILE? new Parser(template).parse(): template;
	      }
	    }
	
	    if(o.computed) this.prototype.computed = shared.handleComputed(o.computed);
	    // inherit directive and other config from supr
	    Regular._inheritConfig(this, supr);
	
	  },
	  /**
	   * Define a directive
	   *
	   * @method directive
	   * @return {Object} Copy of ...
	   */  
	  directive: function(name, cfg){
	
	    if(_.typeOf(name) === "object"){
	      for(var k in name){
	        if(name.hasOwnProperty(k)) this.directive(k, name[k]);
	      }
	      return this;
	    }
	    var type = _.typeOf(name);
	    var directives = this._directives, directive;
	    if(cfg == null){
	      if( type === "string" && (directive = directives[name]) ) return directive;
	      else{
	        var regexp = directives.__regexp__;
	        for(var i = 0, len = regexp.length; i < len ; i++){
	          directive = regexp[i];
	          var test = directive.regexp.test(name);
	          if(test) return directive;
	        }
	      }
	      return undefined;
	    }
	    if(typeof cfg === 'function') cfg = { link: cfg } 
	    if(type === 'string') directives[name] = cfg;
	    else if(type === 'regexp'){
	      cfg.regexp = name;
	      directives.__regexp__.push(cfg)
	    }
	    return this
	  },
	  plugin: function(name, fn){
	    var plugins = this._plugins;
	    if(fn == null) return plugins[name];
	    plugins[name] = fn;
	    return this;
	  },
	  use: function(fn){
	    if(typeof fn === "string") fn = Regular.plugin(fn);
	    if(typeof fn !== "function") return this;
	    fn(this, Regular);
	    return this;
	  },
	  // config the Regularjs's global
	  config: function(name, value){
	    var needGenLexer = false;
	    if(typeof name === "object"){
	      for(var i in name){
	        // if you config
	        if( i ==="END" || i==='BEGIN' )  needGenLexer = true;
	        config[i] = name[i];
	      }
	    }
	    if(needGenLexer) Lexer.setup();
	  },
	  expression: parse.expression,
	  Parser: Parser,
	  Lexer: Lexer,
	  _addProtoInheritCache: function(name, transform){
	    if( Array.isArray( name ) ){
	      return name.forEach(Regular._addProtoInheritCache);
	    }
	    var cacheKey = "_" + name + "s"
	    Regular._protoInheritCache.push(name)
	    Regular[cacheKey] = {};
	    if(Regular[name]) return;
	    Regular[name] = function(key, cfg){
	      var cache = this[cacheKey];
	
	      if(typeof key === "object"){
	        for(var i in key){
	          if(key.hasOwnProperty(i)) this[name](i, key[i]);
	        }
	        return this;
	      }
	      if(cfg == null) return cache[key];
	      cache[key] = transform? transform(cfg) : cfg;
	      return this;
	    }
	  },
	  _inheritConfig: function(self, supr){
	
	    // prototype inherit some Regular property
	    // so every Component will have own container to serve directive, filter etc..
	    var defs = Regular._protoInheritCache;
	    var keys = _.slice(defs);
	    keys.forEach(function(key){
	      self[key] = supr[key];
	      var cacheKey = '_' + key + 's';
	      if(supr[cacheKey]) self[cacheKey] = _.createObject(supr[cacheKey]);
	    })
	    return self;
	  }
	
	});
	
	extend(Regular);
	
	Regular._addProtoInheritCache("component")
	
	Regular._addProtoInheritCache("filter", function(cfg){
	  return typeof cfg === "function"? {get: cfg}: cfg;
	})
	
	
	events.mixTo(Regular);
	Watcher.mixTo(Regular);
	
	Regular.implement({
	  init: function(){},
	  config: function(){},
	  destroy: function(){
	    // destroy event wont propgation;
	    this.$emit("$destroy");
	    this.group && this.group.destroy(true);
	    this.group = null;
	    this.parentNode = null;
	    this._watchers = null;
	    this._children = [];
	    var parent = this.$parent;
	    if(parent){
	      var index = parent._children.indexOf(this);
	      parent._children.splice(index,1);
	    }
	    this.$parent = null;
	    this.$root = null;
	    this._handles = null;
	    this.$refs = null;
	    this.$phase = "destroyed";
	  },
	
	  /**
	   * compile a block ast ; return a group;
	   * @param  {Array} parsed ast
	   * @param  {[type]} record
	   * @return {[type]}
	   */
	  $compile: function(ast, options){
	    options = options || {};
	    if(typeof ast === 'string'){
	      ast = new Parser(ast).parse()
	    }
	    var preExt = this.__ext__,
	      record = options.record, 
	      records;
	
	    if(options.extra) this.__ext__ = options.extra;
	
	
	    if(record) this._record();
	    var group = this._walk(ast, options);
	    if(record){
	      records = this._release();
	      var self = this;
	      if(records.length){
	        // auto destroy all wather;
	        group.ondestroy = function(){ self.$unwatch(records); }
	      }
	    }
	    if(options.extra) this.__ext__ = preExt;
	    return group;
	  },
	
	
	  /**
	   * create two-way binding with another component;
	   * *warn*: 
	   *   expr1 and expr2 must can operate set&get, for example: the 'a.b' or 'a[b + 1]' is set-able, but 'a.b + 1' is not, 
	   *   beacuse Regular dont know how to inverse set through the expression;
	   *   
	   *   if before $bind, two component's state is not sync, the component(passed param) will sync with the called component;
	   *
	   * *example: *
	   *
	   * ```javascript
	   * // in this example, we need to link two pager component
	   * var pager = new Pager({}) // pager compoennt
	   * var pager2 = new Pager({}) // another pager component
	   * pager.$bind(pager2, 'current'); // two way bind throw two component
	   * pager.$bind(pager2, 'total');   // 
	   * // or just
	   * pager.$bind(pager2, {"current": "current", "total": "total"}) 
	   * ```
	   * 
	   * @param  {Regular} component the
	   * @param  {String|Expression} expr1     required, self expr1 to operate binding
	   * @param  {String|Expression} expr2     optional, other component's expr to bind with, if not passed, the expr2 will use the expr1;
	   * @return          this;
	   */
	  $bind: function(component, expr1, expr2){
	    var type = _.typeOf(expr1);
	    if( expr1.type === 'expression' || type === 'string' ){
	      this._bind(component, expr1, expr2)
	    }else if( type === "array" ){ // multiply same path binding through array
	      for(var i = 0, len = expr1.length; i < len; i++){
	        this._bind(component, expr1[i]);
	      }
	    }else if(type === "object"){
	      for(var i in expr1) if(expr1.hasOwnProperty(i)){
	        this._bind(component, i, expr1[i]);
	      }
	    }
	    // digest
	    component.$update();
	    return this;
	  },
	  /**
	   * unbind one component( see $bind also)
	   *
	   * unbind will unbind all relation between two component
	   * 
	   * @param  {Regular} component [descriptionegular
	   * @return {This}    this
	   */
	  $unbind: function(){
	    // todo
	  },
	  $inject: combine.inject,
	  $mute: function(isMute){
	
	    isMute = !!isMute;
	
	    var needupdate = isMute === false && this._mute;
	
	    this._mute = !!isMute;
	
	    if(needupdate) this.$update();
	    return this;
	  },
	  // private bind logic
	  _bind: function(component, expr1, expr2){
	
	    var self = this;
	    // basic binding
	
	    if(!component || !(component instanceof Regular)) throw "$bind() should pass Regular component as first argument";
	    if(!expr1) throw "$bind() should  pass as least one expression to bind";
	
	    if(!expr2) expr2 = expr1;
	
	    expr1 = parse.expression( expr1 );
	    expr2 = parse.expression( expr2 );
	
	    // set is need to operate setting ;
	    if(expr2.set){
	      var wid1 = this.$watch( expr1, function(value){
	        component.$update(expr2, value)
	      });
	      component.$on('$destroy', function(){
	        self.$unwatch(wid1)
	      })
	    }
	    if(expr1.set){
	      var wid2 = component.$watch(expr2, function(value){
	        self.$update(expr1, value)
	      });
	      // when brother destroy, we unlink this watcher
	      this.$on('$destroy', component.$unwatch.bind(component,wid2))
	    }
	    // sync the component's state to called's state
	    expr2.set(component, expr1.get(this));
	  },
	  _walk: function(ast, options){
	    if( _.typeOf(ast) === 'array' ){
	      var res = [];
	
	      for(var i = 0, len = ast.length; i < len; i++){
	        var ret = this._walk(ast[i], options);
	        if(ret && ret.code === ERROR.UNMATCHED_AST){
	          ast.splice(i, 1);
	          i--;
	          len--;
	        }else res.push( ret );
	      }
	
	      return new Group(res);
	    }
	    if(typeof ast === 'string') return doc.createTextNode(ast)
	    return walkers[ast.type || "default"].call(this, ast, options);
	  },
	  _append: function(component){
	    this._children.push(component);
	    component.$parent = this;
	  },
	  _handleEvent: function(elem, type, value, attrs){
	    var Component = this.constructor,
	      fire = typeof value !== "function"? _.handleEvent.call( this, value, type ) : value,
	      handler = Component.event(type), destroy;
	
	    if ( handler ) {
	      destroy = handler.call(this, elem, fire, attrs);
	    } else {
	      dom.on(elem, type, fire);
	    }
	    return handler ? destroy : function() {
	      dom.off(elem, type, fire);
	    }
	  },
	  // 1. 用来处理exprBody -> Function
	  // 2. list里的循环
	  _touchExpr: function(expr){
	    var  rawget, ext = this.__ext__, touched = {};
	    if(expr.type !== 'expression' || expr.touched) return expr;
	    rawget = expr.get || (expr.get = new Function(_.ctxName, _.extName , _.prefix+ "return (" + expr.body + ")"));
	    touched.get = !ext? rawget: function(context){
	      return rawget(context, ext)
	    }
	
	    if(expr.setbody && !expr.set){
	      var setbody = expr.setbody;
	      expr.set = function(ctx, value, ext){
	        expr.set = new Function(_.ctxName, _.setName , _.extName, _.prefix + setbody);          
	        return expr.set(ctx, value, ext);
	      }
	      expr.setbody = null;
	    }
	    if(expr.set){
	      touched.set = !ext? expr.set : function(ctx, value){
	        return expr.set(ctx, value, ext);
	      }
	    }
	    _.extend(touched, {
	      type: 'expression',
	      touched: true,
	      once: expr.once || expr.constant
	    })
	    return touched
	  },
	  // find filter
	  _f_: function(name){
	    var Component = this.constructor;
	    var filter = Component.filter(name);
	    if(!filter) throw Error('filter ' + name + ' is undefined');
	    return filter;
	  },
	  // simple accessor get
	  _sg_:function(path, defaults, ext){
	    if(typeof ext !== 'undefined'){
	      // if(path === "demos")  debugger
	      var computed = this.computed,
	        computedProperty = computed[path];
	      if(computedProperty){
	        if(computedProperty.type==='expression' && !computedProperty.get) this._touchExpr(computedProperty);
	        if(computedProperty.get)  return computedProperty.get(this);
	        else _.log("the computed '" + path + "' don't define the get function,  get data."+path + " altnately", "warn")
	      }
	    }
	    if(typeof defaults === "undefined" || typeof path == "undefined" ){
	      return undefined;
	    }
	    return (ext && typeof ext[path] !== 'undefined')? ext[path]: defaults[path];
	
	  },
	  // simple accessor set
	  _ss_:function(path, value, data , op, computed){
	    var computed = this.computed,
	      op = op || "=", prev, 
	      computedProperty = computed? computed[path]:null;
	
	    if(op !== '='){
	      prev = computedProperty? computedProperty.get(this): data[path];
	      switch(op){
	        case "+=":
	          value = prev + value;
	          break;
	        case "-=":
	          value = prev - value;
	          break;
	        case "*=":
	          value = prev * value;
	          break;
	        case "/=":
	          value = prev / value;
	          break;
	        case "%=":
	          value = prev % value;
	          break;
	      }
	    }
	    if(computedProperty) {
	      if(computedProperty.set) return computedProperty.set(this, value);
	      else _.log("the computed '" + path + "' don't define the set function,  assign data."+path + " altnately", "warn" )
	    }
	    data[path] = value;
	    return value;
	  }
	});
	
	Regular.prototype.inject = function(){
	  _.log("use $inject instead of inject", "warn");
	  return this.$inject.apply(this, arguments);
	}
	
	
	// only one builtin filter
	
	Regular.filter(filter);
	
	module.exports = Regular;
	
	
	
	function tryGetSelector(tpl){
	  var node;
	  if( typeof tpl === 'string' && tpl.length < 16 && (node = dom.find( tpl )) ) {
	    _.log("pass selector as template has be deprecated, pass node or template string instead", 'warn')
	    return node
	  }
	}
	
	


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	// (c) 2010-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	// Backbone may be freely distributed under the MIT license.
	// For all details and documentation:
	// http://backbonejs.org
	
	// klass: a classical JS OOP façade
	// https://github.com/ded/klass
	// License MIT (c) Dustin Diaz 2014
	  
	// inspired by backbone's extend and klass
	var _ = __webpack_require__(10),
	  fnTest = /xy/.test(function(){"xy";}) ? /\bsupr\b/:/.*/,
	  isFn = function(o){return typeof o === "function"};
	
	
	function wrap(k, fn, supro) {
	  return function () {
	    var tmp = this.supr;
	    this.supr = supro[k];
	    var ret = fn.apply(this, arguments);
	    this.supr = tmp;
	    return ret;
	  }
	}
	
	function process( what, o, supro ) {
	  for ( var k in o ) {
	    if (o.hasOwnProperty(k)) {
	
	      what[k] = isFn( o[k] ) && isFn( supro[k] ) && 
	        fnTest.test( o[k] ) ? wrap(k, o[k], supro) : o[k];
	    }
	  }
	}
	
	// if the property is ["events", "data", "computed"] , we should merge them
	var merged = ["events", "data", "computed"], mlen = merged.length;
	module.exports = function extend(o){
	  o = o || {};
	  var supr = this, proto,
	    supro = supr && supr.prototype || {};
	
	  if(typeof o === 'function'){
	    proto = o.prototype;
	    o.implement = implement;
	    o.extend = extend;
	    return o;
	  } 
	  
	  function fn() {
	    supr.apply(this, arguments);
	  }
	
	  proto = _.createProto(fn, supro);
	
	  function implement(o){
	    // we need merge the merged property
	    var len = mlen;
	    for(;len--;){
	      var prop = merged[len];
	      if(o.hasOwnProperty(prop) && proto.hasOwnProperty(prop)){
	        _.extend(proto[prop], o[prop], true) 
	        delete o[prop];
	      }
	    }
	
	
	    process(proto, o, supro); 
	    return this;
	  }
	
	
	
	  fn.implement = implement
	  fn.implement(o)
	  if(supr.__after__) supr.__after__.call(fn, supr, o);
	  fn.extend = extend;
	  return fn;
	}
	


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	/*jshint -W082 */ 
	
	// thanks for angular && mootools for some concise&cross-platform  implemention
	// =====================================
	
	// The MIT License
	// Copyright (c) 2010-2014 Google, Inc. http://angularjs.org
	
	// ---
	// license: MIT-style license. http://mootools.net
	
	
	if(typeof window !== 'undefined'){
	  
	var dom = module.exports;
	var env = __webpack_require__(16);
	var _ = __webpack_require__(10);
	var consts = __webpack_require__(31);
	var tNode = document.createElement('div')
	var addEvent, removeEvent;
	var noop = function(){}
	
	var namespaces = consts.NAMESPACE;
	
	dom.body = document.body;
	dom.doc = document;
	dom.tNode = tNode;
	
	
	// camelCase
	var camelCase = function (str){
	  return ("" + str).replace(/-\D/g, function(match){
	    return match.charAt(1).toUpperCase();
	  });
	}
	
	
	
	if(tNode.addEventListener){
	  addEvent = function(node, type, fn) {
	    node.addEventListener(type, fn, false);
	  }
	  removeEvent = function(node, type, fn) {
	    node.removeEventListener(type, fn, false) 
	  }
	}else{
	  addEvent = function(node, type, fn) {
	    node.attachEvent('on' + type, fn);
	  }
	  removeEvent = function(node, type, fn) {
	    node.detachEvent('on' + type, fn); 
	  }
	}
	
	
	dom.msie = parseInt((/msie (\d+)/.exec(navigator.userAgent.toLowerCase()) || [])[1]);
	if (isNaN(dom.msie)) {
	  dom.msie = parseInt((/trident\/.*; rv:(\d+)/.exec(navigator.userAgent.toLowerCase()) || [])[1]);
	}
	
	dom.find = function(sl){
	  if(document.querySelector) {
	    try{
	      return document.querySelector(sl);
	    }catch(e){
	
	    }
	  }
	  if(sl.indexOf('#')!==-1) return document.getElementById( sl.slice(1) );
	}
	
	
	dom.inject = function(node, refer, position){
	
	  position = position || 'bottom';
	  if(!node) return ;
	  if(Array.isArray(node)){
	    var tmp = node;
	    node = dom.fragment();
	    for(var i = 0,len = tmp.length; i < len ;i++){
	      node.appendChild(tmp[i])
	    }
	  }
	
	  var firstChild, next;
	  switch(position){
	    case 'bottom':
	      refer.appendChild( node );
	      break;
	    case 'top':
	      if( firstChild = refer.firstChild ){
	        refer.insertBefore( node, refer.firstChild );
	      }else{
	        refer.appendChild( node );
	      }
	      break;
	    case 'after':
	      if( next = refer.nextSibling ){
	        next.parentNode.insertBefore( node, next );
	      }else{
	        refer.parentNode.appendChild( node );
	      }
	      break;
	    case 'before':
	      refer.parentNode.insertBefore( node, refer );
	  }
	}
	
	
	dom.id = function(id){
	  return document.getElementById(id);
	}
	
	// createElement 
	dom.create = function(type, ns){
	  if(ns === 'svg'){
	    if(!env.svg) throw Error('the env need svg support')
	    ns = namespaces.svg;
	  }
	  return !ns? document.createElement(type): document.createElementNS(ns, type);
	}
	
	// documentFragment
	dom.fragment = function(){
	  return document.createDocumentFragment();
	}
	
	
	
	
	var specialAttr = {
	  'class': function(node, value){
	     ('className' in node && (!node.namespaceURI || node.namespaceURI === namespaces.html  )) ? 
	      node.className = (value || '') : node.setAttribute('class', value);
	  },
	  'for': function(node, value){
	    ('htmlFor' in node) ? node.htmlFor = value : node.setAttribute('for', value);
	  },
	  'style': function(node, value){
	    (node.style) ? node.style.cssText = value : node.setAttribute('style', value);
	  },
	  'value': function(node, value){
	    node.value = (value != null) ? value : '';
	  }
	}
	
	
	// attribute Setter & Getter
	dom.attr = function(node, name, value){
	  if (_.isBooleanAttr(name)) {
	    if (typeof value !== 'undefined') {
	      if (!!value) {
	        node[name] = true;
	        node.setAttribute(name, name);
	        // lt ie7 . the javascript checked setting is in valid
	        //http://bytes.com/topic/javascript/insights/799167-browser-quirk-dynamically-appended-checked-checkbox-does-not-appear-checked-ie
	        if(dom.msie && dom.msie <=7 ) node.defaultChecked = true
	      } else {
	        node[name] = false;
	        node.removeAttribute(name);
	      }
	    } else {
	      return (node[name] ||
	               (node.attributes.getNamedItem(name)|| noop).specified) ? name : undefined;
	    }
	  } else if (typeof (value) !== 'undefined') {
	    // if in specialAttr;
	    if(specialAttr[name]) specialAttr[name](node, value);
	    else if(value === null) node.removeAttribute(name)
	    else node.setAttribute(name, value);
	  } else if (node.getAttribute) {
	    // the extra argument "2" is to get the right thing for a.href in IE, see jQuery code
	    // some elements (e.g. Document) don't have get attribute, so return undefined
	    var ret = node.getAttribute(name, 2);
	    // normalize non-existing attributes to undefined (as jQuery)
	    return ret === null ? undefined : ret;
	  }
	}
	
	
	dom.on = function(node, type, handler){
	  var types = type.split(' ');
	  handler.real = function(ev){
	    var $event = new Event(ev);
	    $event.origin = node;
	    handler.call(node, $event);
	  }
	  types.forEach(function(type){
	    type = fixEventName(node, type);
	    addEvent(node, type, handler.real);
	  });
	}
	dom.off = function(node, type, handler){
	  var types = type.split(' ');
	  handler = handler.real || handler;
	  types.forEach(function(type){
	    type = fixEventName(node, type);
	    removeEvent(node, type, handler);
	  })
	}
	
	
	dom.text = (function (){
	  var map = {};
	  if (dom.msie && dom.msie < 9) {
	    map[1] = 'innerText';    
	    map[3] = 'nodeValue';    
	  } else {
	    map[1] = map[3] = 'textContent';
	  }
	  
	  return function (node, value) {
	    var textProp = map[node.nodeType];
	    if (value == null) {
	      return textProp ? node[textProp] : '';
	    }
	    node[textProp] = value;
	  }
	})();
	
	
	dom.html = function( node, html ){
	  if(typeof html === "undefined"){
	    return node.innerHTML;
	  }else{
	    node.innerHTML = html;
	  }
	}
	
	dom.replace = function(node, replaced){
	  if(replaced.parentNode) replaced.parentNode.replaceChild(node, replaced);
	}
	
	dom.remove = function(node){
	  if(node.parentNode) node.parentNode.removeChild(node);
	}
	
	// css Settle & Getter from angular
	// =================================
	// it isnt computed style 
	dom.css = function(node, name, value){
	  if( _.typeOf(name) === "object" ){
	    for(var i in name){
	      if( name.hasOwnProperty(i) ){
	        dom.css( node, i, name[i] );
	      }
	    }
	    return;
	  }
	  if ( typeof value !== "undefined" ) {
	
	    name = camelCase(name);
	    if(name) node.style[name] = value;
	
	  } else {
	
	    var val;
	    if (dom.msie <= 8) {
	      // this is some IE specific weirdness that jQuery 1.6.4 does not sure why
	      val = node.currentStyle && node.currentStyle[name];
	      if (val === '') val = 'auto';
	    }
	    val = val || node.style[name];
	    if (dom.msie <= 8) {
	      val = val === '' ? undefined : val;
	    }
	    return  val;
	  }
	}
	
	dom.addClass = function(node, className){
	  var current = node.className || "";
	  if ((" " + current + " ").indexOf(" " + className + " ") === -1) {
	    node.className = current? ( current + " " + className ) : className;
	  }
	}
	
	dom.delClass = function(node, className){
	  var current = node.className || "";
	  node.className = (" " + current + " ").replace(" " + className + " ", " ").trim();
	}
	
	dom.hasClass = function(node, className){
	  var current = node.className || "";
	  return (" " + current + " ").indexOf(" " + className + " ") !== -1;
	}
	
	
	
	// simple Event wrap
	
	//http://stackoverflow.com/questions/11068196/ie8-ie7-onchange-event-is-emited-only-after-repeated-selection
	function fixEventName(elem, name){
	  return (name === 'change'  &&  dom.msie < 9 && 
	      (elem && elem.tagName && elem.tagName.toLowerCase()==='input' && 
	        (elem.type === 'checkbox' || elem.type === 'radio')
	      )
	    )? 'click': name;
	}
	
	var rMouseEvent = /^(?:click|dblclick|contextmenu|DOMMouseScroll|mouse(?:\w+))$/
	var doc = document;
	doc = (!doc.compatMode || doc.compatMode === 'CSS1Compat') ? doc.documentElement : doc.body;
	function Event(ev){
	  ev = ev || window.event;
	  if(ev._fixed) return ev;
	  this.event = ev;
	  this.target = ev.target || ev.srcElement;
	
	  var type = this.type = ev.type;
	  var button = this.button = ev.button;
	
	  // if is mouse event patch pageX
	  if(rMouseEvent.test(type)){ //fix pageX
	    this.pageX = (ev.pageX != null) ? ev.pageX : ev.clientX + doc.scrollLeft;
	    this.pageY = (ev.pageX != null) ? ev.pageY : ev.clientY + doc.scrollTop;
	    if (type === 'mouseover' || type === 'mouseout'){// fix relatedTarget
	      var related = ev.relatedTarget || ev[(type === 'mouseover' ? 'from' : 'to') + 'Element'];
	      while (related && related.nodeType === 3) related = related.parentNode;
	      this.relatedTarget = related;
	    }
	  }
	  // if is mousescroll
	  if (type === 'DOMMouseScroll' || type === 'mousewheel'){
	    // ff ev.detail: 3    other ev.wheelDelta: -120
	    this.wheelDelta = (ev.wheelDelta) ? ev.wheelDelta / 120 : -(ev.detail || 0) / 3;
	  }
	  
	  // fix which
	  this.which = ev.which || ev.keyCode;
	  if( !this.which && button !== undefined){
	    // http://api.jquery.com/event.which/ use which
	    this.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
	  }
	  this._fixed = true;
	}
	
	_.extend(Event.prototype, {
	  immediateStop: _.isFalse,
	  stop: function(){
	    this.preventDefault().stopPropagation();
	  },
	  preventDefault: function(){
	    if (this.event.preventDefault) this.event.preventDefault();
	    else this.event.returnValue = false;
	    return this;
	  },
	  stopPropagation: function(){
	    if (this.event.stopPropagation) this.event.stopPropagation();
	    else this.event.cancelBubble = true;
	    return this;
	  },
	  stopImmediatePropagation: function(){
	    if(this.event.stopImmediatePropagation) this.event.stopImmediatePropagation();
	  }
	})
	
	
	dom.nextFrame = (function(){
	    var request = window.requestAnimationFrame ||
	                  window.webkitRequestAnimationFrame ||
	                  window.mozRequestAnimationFrame|| 
	                  function(callback){
	                    setTimeout(callback, 16)
	                  }
	
	    var cancel = window.cancelAnimationFrame ||
	                 window.webkitCancelAnimationFrame ||
	                 window.mozCancelAnimationFrame ||
	                 window.webkitCancelRequestAnimationFrame ||
	                 function(tid){
	                    clearTimeout(tid)
	                 }
	  
	  return function(callback){
	    var id = request(callback);
	    return function(){ cancel(id); }
	  }
	})();
	
	// 3ks for angular's raf  service
	var k
	dom.nextReflow = dom.msie? function(callback){
	  return dom.nextFrame(function(){
	    k = document.body.offsetWidth;
	    callback();
	  })
	}: dom.nextFrame;
	
	}
	
	
	


/***/ },
/* 31 */
/***/ function(module, exports) {

	module.exports = {
	  'COMPONENT_TYPE': 1,
	  'ELEMENT_TYPE': 2,
	  'ERROR': {
	    'UNMATCHED_AST': 101
	  },
	  "MSG": {
	    101: "Unmatched ast and mountNode, report issue at https://github.com/regularjs/regular/issues"
	  },
	  'NAMESPACE': {
	    html: "http://www.w3.org/1999/xhtml",
	    svg: "http://www.w3.org/2000/svg"
	  }
	}


/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	var diffArray = __webpack_require__(20).diffArray;
	var combine = __webpack_require__(33);
	var animate = __webpack_require__(34);
	var Parser = __webpack_require__(17);
	var node = __webpack_require__(18);
	var Group = __webpack_require__(35);
	var dom = __webpack_require__(30);
	var _ = __webpack_require__(10);
	var consts =   __webpack_require__(31)
	var ERROR = consts.ERROR;
	var MSG = consts.MSG;
	var nodeCursor = __webpack_require__(36);
	var config = __webpack_require__(14)
	var shared = __webpack_require__(21);
	
	
	
	var walkers = module.exports = {};
	
	walkers.list = function(ast, options){
	
	  var Regular = walkers.Regular;  
	  var placeholder = document.createComment("Regular list"),
	    namespace = options.namespace,
	    extra = options.extra;
	
	  var self = this;
	  var group = new Group([placeholder]);
	  var indexName = ast.variable + '_index';
	  var keyName = ast.variable + '_key';
	  var variable = ast.variable;
	  var alternate = ast.alternate;
	  var track = ast.track, keyOf, extraObj;
	  var cursor = options.cursor;
	
	  if( track && track !== true ){
	    track = this._touchExpr(track);
	    extraObj = _.createObject(extra);
	    keyOf = function( item, index ){
	      extraObj[ variable ] = item;
	      extraObj[ indexName ] = index;
	      // @FIX keyName
	      return track.get( self, extraObj );
	    }
	  }
	
	  function removeRange(index, rlen){
	    for(var j = 0; j< rlen; j++){ //removed
	      var removed = group.children.splice( index + 1, 1)[0];
	      if(removed) removed.destroy(true);
	    }
	  }
	
	  function addRange(index, end, newList, rawNewValue){
	    for(var o = index; o < end; o++){ //add
	      // prototype inherit
	      var item = newList[o];
	      var data = {};
	      updateTarget(data, o, item, rawNewValue);
	
	      data = _.createObject(extra, data);
	      var curOptions = {
	        extra: data,
	        namespace:namespace,
	        record: true,
	        outer: options.outer,
	        cursor: cursor
	      }
	      var section = self.$compile(ast.body, curOptions);
	      section.data = data;
	      // autolink
	      var insert =  combine.last(group.get(o));
	      if(insert.parentNode && !(cursor && cursor.node) ){
	        animate.inject(combine.node(section),insert, 'after');
	      }
	      // insert.parentNode.insertBefore(combine.node(section), insert.nextSibling);
	      group.children.splice( o + 1 , 0, section);
	    }
	  }
	
	  function updateTarget(target, index, item, rawNewValue){
	
	      target[ indexName ] = index;
	      if( rawNewValue ){
	        target[ keyName ] = item;
	        target[ variable ] = rawNewValue[ item ];
	      }else{
	        target[ variable ] = item;
	        target[keyName] = null
	      }
	  }
	
	
	  function updateRange(start, end, newList, rawNewValue){
	    for(var k = start; k < end; k++){ // no change
	      var sect = group.get( k + 1 ), item = newList[ k ];
	      updateTarget(sect.data, k, item, rawNewValue);
	    }
	  }
	
	  function updateLD(newList, oldList, splices , rawNewValue ){
	
	    var cur = placeholder;
	    var m = 0, len = newList.length;
	
	    if(!splices && (len !==0 || oldList.length !==0)  ){
	      splices = diffArray(newList, oldList, true);
	    }
	
	    if(!splices || !splices.length) return;
	      
	    for(var i = 0; i < splices.length; i++){ //init
	      var splice = splices[i];
	      var index = splice.index; // beacuse we use a comment for placeholder
	      var removed = splice.removed;
	      var add = splice.add;
	      var rlen = removed.length;
	      // for track
	      if( track && rlen && add ){
	        var minar = Math.min(rlen, add);
	        var tIndex = 0;
	        while(tIndex < minar){
	          if( keyOf(newList[index], index) !== keyOf( removed[0], index ) ){
	            removeRange(index, 1)
	            addRange(index, index+1, newList, rawNewValue)
	          }
	          removed.shift();
	          add--;
	          index++;
	          tIndex++;
	        }
	        rlen = removed.length;
	      }
	      // update
	      updateRange(m, index, newList, rawNewValue);
	
	      removeRange( index ,rlen)
	
	      addRange(index, index+add, newList, rawNewValue)
	
	      m = index + add - rlen;
	      m  = m < 0? 0 : m;
	
	    }
	    if(m < len){
	      for(var i = m; i < len; i++){
	        var pair = group.get(i + 1);
	        pair.data[indexName] = i;
	        // @TODO fix keys
	      }
	    }
	  }
	
	  // if the track is constant test.
	  function updateSimple(newList, oldList, rawNewValue ){
	
	    var nlen = newList.length;
	    var olen = oldList.length;
	    var mlen = Math.min(nlen, olen);
	
	    updateRange(0, mlen, newList, rawNewValue)
	    if(nlen < olen){ //need add
	      removeRange(nlen, olen-nlen);
	    }else if(nlen > olen){
	      addRange(olen, nlen, newList, rawNewValue);
	    }
	  }
	
	  function update(newValue, oldValue, splices){
	
	    var nType = _.typeOf( newValue );
	    var oType = _.typeOf( oldValue );
	
	    var newList = getListFromValue( newValue, nType );
	    var oldList = getListFromValue( oldValue, oType );
	
	    var rawNewValue;
	
	
	    var nlen = newList && newList.length;
	    var olen = oldList && oldList.length;
	
	    // if previous list has , we need to remove the altnated section.
	    if( !olen && nlen && group.get(1) ){
	      var altGroup = group.children.pop();
	      if(altGroup.destroy)  altGroup.destroy(true);
	    }
	
	    if( nType === 'object' ) rawNewValue = newValue;
	
	    if(track === true){
	      updateSimple( newList, oldList,  rawNewValue );
	    }else{
	      updateLD( newList, oldList, splices, rawNewValue );
	    }
	
	    // @ {#list} {#else}
	    if( !nlen && alternate && alternate.length){
	      var section = self.$compile(alternate, {
	        extra: extra,
	        record: true,
	        outer: options.outer,
	        namespace: namespace
	      })
	      group.children.push(section);
	      if(placeholder.parentNode){
	        animate.inject(combine.node(section), placeholder, 'after');
	      }
	    }
	  }
	
	  this.$watch(ast.sequence, update, { 
	    init: true, 
	    diff: track !== true ,
	    deep: true
	  });
	  //@FIXIT, beacuse it is sync process, we can 
	  cursor = null;
	  return group;
	}
	
	
	
	
	// {#include } or {#inc template}
	walkers.template = function(ast, options){
	  var content = ast.content, compiled;
	  var placeholder = document.createComment('inlcude');
	  var compiled, namespace = options.namespace, extra = options.extra;
	  var group = new Group([placeholder]);
	  var cursor = options.cursor;
	
	  if(content){
	    var self = this;
	    this.$watch(content, function(value){
	      var removed = group.get(1), type= typeof value;
	      if( removed){
	        removed.destroy(true); 
	        group.children.pop();
	      }
	      if(!value) return;
	
	      group.push( compiled = type === 'function' ? value(cursor? {cursor: cursor}: null): self.$compile( type !== 'object'? String(value): value, {
	        record: true,
	        outer: options.outer,
	        namespace: namespace,
	        cursor: cursor,
	        extra: extra}) ); 
	      if(placeholder.parentNode) {
	        compiled.$inject(placeholder, 'before')
	      }
	    }, {
	      init: true
	    });
	  }
	  return group;
	};
	
	function getListFromValue(value, type){
	  return type === 'object'? _.keys(value): (
	      type === 'array'? value: []
	    )
	}
	
	
	// how to resolve this problem
	var ii = 0;
	walkers['if'] = function(ast, options){
	  var self = this, consequent, alternate, extra = options.extra;
	  if(options && options.element){ // attribute inteplation
	    var update = function(nvalue){
	      if(!!nvalue){
	        if(alternate) combine.destroy(alternate)
	        if(ast.consequent) consequent = self.$compile(ast.consequent, {
	          record: true, 
	          element: options.element , 
	          extra:extra
	        });
	      }else{
	        if( consequent ) combine.destroy(consequent)
	        if( ast.alternate ) alternate = self.$compile(ast.alternate, {record: true, element: options.element, extra: extra});
	      }
	    }
	    this.$watch(ast.test, update, { force: true });
	    return {
	      destroy: function(){
	        if(consequent) combine.destroy(consequent);
	        else if(alternate) combine.destroy(alternate);
	      }
	    }
	  }
	
	  var test, node;
	  var placeholder = document.createComment("Regular if" + ii++);
	  var group = new Group();
	  group.push(placeholder);
	  var preValue = null, namespace= options.namespace;
	  var cursor = options.cursor;
	  if(cursor && cursor.node){
	    dom.inject( placeholder , cursor.node,'before')
	  }
	
	
	  var update = function (nvalue, old){
	    var value = !!nvalue, compiledSection;
	    if(value === preValue) return;
	    preValue = value;
	    if(group.children[1]){
	      group.children[1].destroy(true);
	      group.children.pop();
	    }
	    var curOptions = {
	      record: true, 
	      outer: options.outer,
	      namespace: namespace, 
	      extra: extra,
	      cursor: cursor
	    }
	    if(value){ //true
	
	      if(ast.consequent && ast.consequent.length){ 
	        compiledSection = self.$compile( ast.consequent , curOptions );
	      }
	    }else{ //false
	      if(ast.alternate && ast.alternate.length){
	        compiledSection = self.$compile(ast.alternate, curOptions);
	      }
	    }
	    // placeholder.parentNode && placeholder.parentNode.insertBefore( node, placeholder );
	    if(compiledSection){
	      group.push(compiledSection);
	      if(placeholder.parentNode){
	        animate.inject(combine.node(compiledSection), placeholder, 'before');
	      }
	    }
	    cursor = null;
	    // after first mount , we need clear this flat;
	  }
	  this.$watch(ast.test, update, {force: true, init: true});
	
	  return group;
	}
	
	
	walkers._handleMountText = function(cursor, astText){
	    var node, mountNode = cursor.node;
	    // fix unused black in astText;
	    var nodeText = dom.text(mountNode);
	
	    if( nodeText === astText ){
	      node = mountNode;
	      cursor.next();
	    }else{
	      // maybe have some redundancy  blank
	      var index = nodeText.indexOf(astText);
	      if(~index){
	        node = document.createTextNode(astText);
	        dom.text( mountNode, nodeText.slice(index + astText.length) );
	      } else {
	        // if( _.blankReg.test( astText ) ){ }
	        throw Error( MSG[ERROR.UNMATCHED_AST]);
	      }
	    }
	
	    return node;
	}
	
	
	walkers.expression = function(ast, options){
	
	  var cursor = options.cursor, node,
	    mountNode = cursor && cursor.node;
	
	  if(mountNode){
	    //@BUG: if server render &gt; in Expression will cause error
	    var astText = _.toText( this.$get(ast) );
	
	    node = walkers._handleMountText(cursor, astText);
	
	  }else{
	    node = document.createTextNode("");
	  }
	
	  this.$watch(ast, function(newval){
	
	    dom.text(node, _.toText(newval) );
	
	  },{ init: true })
	
	  return node;
	
	}
	
	
	walkers.text = function(ast, options){
	  var cursor = options.cursor , node;
	  var astText = _.convertEntity( ast.text );
	
	  if(cursor && cursor.node) { 
	    var mountNode = cursor.node;
	    // maybe regularjs parser have some difference with html builtin parser when process  empty text
	    // @todo error report
	    if(mountNode.nodeType !== 3 ){
	
	      if( _.blankReg.test(astText) ) return {
	        code:  ERROR.UNMATCHED_AST
	      }
	
	    }else{
	      node = walkers._handleMountText( cursor, astText )
	    } 
	  }
	      
	
	  return node || document.createTextNode( astText );
	}
	
	
	
	
	/**
	 * walkers element (contains component)
	 */
	walkers.element = function(ast, options){
	
	  var attrs = ast.attrs, self = this,
	    Constructor = this.constructor,
	    children = ast.children,
	    namespace = options.namespace, 
	    extra = options.extra,
	    cursor = options.cursor,
	    tag = ast.tag,
	    Component = Constructor.component(tag),
	    ref, group, element, mountNode;
	
	  // if inititalized with mount mode, sometime, 
	  // browser will ignore the whitespace between node, and sometimes it won't
	  if(cursor){
	    // textCOntent with Empty text
	    if(cursor.node && cursor.node.nodeType === 3){
	      if(_.blankReg.test(dom.text(cursor.node) ) ) cursor.next();
	      else throw Error(MSG[ERROR.UNMATCHED_AST]);
	    }
	  }
	
	  if(cursor) mountNode = cursor.node;
	
	  if( tag === 'r-content' ){
	    _.log('r-content is deprecated, use {#inc this.$body} instead (`{#include}` as same)', 'warn');
	    return this.$body && this.$body(cursor? {cursor: cursor}: null);
	  } 
	
	  if(Component || tag === 'r-component'){
	    options.Component = Component;
	    return walkers.component.call(this, ast, options)
	  }
	
	  if(tag === 'svg') namespace = "svg";
	  // @Deprecated: may be removed in next version, use {#inc } instead
	  
	  if( children && children.length ){
	
	    var subMountNode = mountNode? mountNode.firstChild: null;
	    group = this.$compile(children, {
	      extra: extra ,
	      outer: options.outer,
	      namespace: namespace, 
	      cursor:  subMountNode? nodeCursor(subMountNode): null
	    });
	  }
	
	
	  if(mountNode){
	    element = mountNode
	    cursor.next();
	  }else{
	    element = dom.create( tag, namespace, attrs);
	  }
	  
	
	  if(group && !_.isVoidTag(tag) ){ // if not init with mount mode
	    animate.inject( combine.node(group) , element)
	  }
	
	  // sort before
	  if(!ast.touched){
	    attrs.sort(function(a1, a2){
	      var d1 = Constructor.directive(a1.name),
	        d2 = Constructor.directive(a2.name);
	      if( d1 && d2 ) return (d2.priority || 1) - (d1.priority || 1);
	      if(d1) return 1;
	      if(d2) return -1;
	      if(a2.name === "type") return 1;
	      return -1;
	    })
	    ast.touched = true;
	  }
	  // may distinct with if else
	  var destroies = walkAttributes.call(this, attrs, element, extra);
	
	  return {
	    type: "element",
	    group: group,
	    node: function(){
	      return element;
	    },
	    last: function(){
	      return element;
	    },
	    destroy: function(first){
	      if( first ){
	        animate.remove( element, group? group.destroy.bind( group ): _.noop );
	      }else if(group) {
	        group.destroy();
	      }
	      // destroy ref
	      if( destroies.length ) {
	        destroies.forEach(function( destroy ){
	          if( destroy ){
	            if( typeof destroy.destroy === 'function' ){
	              destroy.destroy()
	            }else{
	              destroy();
	            }
	          }
	        })
	      }
	    }
	  }
	}
	
	walkers.component = function(ast, options){
	  var attrs = ast.attrs, 
	    Component = options.Component,
	    cursor = options.cursor,
	    Constructor = this.constructor,
	    isolate, 
	    extra = options.extra,
	    namespace = options.namespace,
	    refDirective = walkers.Regular.directive('ref'),
	    ref, self = this, is;
	
	  var data = {}, events;
	
	  for(var i = 0, len = attrs.length; i < len; i++){
	    var attr = attrs[i];
	    // consider disabled   equlasto  disabled={true}
	
	    shared.prepareAttr( attr, attr.name === 'ref' && refDirective );
	
	    var value = this._touchExpr(attr.value === undefined? true: attr.value);
	    if(value.constant) value = attr.value = value.get(this);
	    if(attr.value && attr.value.constant === true){
	      value = value.get(this);
	    }
	    var name = attr.name;
	    if(!attr.event){
	      var etest = name.match(_.eventReg);
	      // event: 'nav'
	      if(etest) attr.event = etest[1];
	    }
	
	    // @compile modifier
	    if(attr.mdf === 'cmpl'){
	      value = _.getCompileFn(value, this, {
	        record: true, 
	        namespace:namespace, 
	        extra: extra, 
	        outer: options.outer
	      })
	    }
	    
	    // @if is r-component . we need to find the target Component
	    if(name === 'is' && !Component){
	      is = value;
	      var componentName = this.$get(value, true);
	      Component = Constructor.component(componentName)
	      if(typeof Component !== 'function') throw new Error("component " + componentName + " has not registed!");
	    }
	    // bind event proxy
	    var eventName;
	    if(eventName = attr.event){
	      events = events || {};
	      events[eventName] = _.handleEvent.call(this, value, eventName);
	      continue;
	    }else {
	      name = attr.name = _.camelCase(name);
	    }
	
	    if(!value || value.type !== 'expression'){
	      data[name] = value;
	    }else{
	      data[name] = value.get(self); 
	    }
	    if( name === 'ref'  && value != null){
	      ref = value
	    }
	    if( name === 'isolate'){
	      // 1: stop: composite -> parent
	      // 2. stop: composite <- parent
	      // 3. stop 1 and 2: composite <-> parent
	      // 0. stop nothing (defualt)
	      isolate = value.type === 'expression'? value.get(self): parseInt(value === true? 3: value, 10);
	      data.isolate = isolate;
	    }
	  }
	
	  var definition = { 
	    data: data, 
	    events: events, 
	    $parent: (isolate & 2)? null: this,
	    $root: this.$root,
	    $outer: options.outer,
	    _body: {
	      ctx: this,
	      ast: ast.children
	    }
	  }
	  var options = {
	    namespace: namespace, 
	    cursor: cursor,
	    extra: options.extra
	  }
	
	
	  var component = new Component(definition, options), reflink;
	
	
	  if(ref && this.$refs){
	    reflink = refDirective.link;
	    var refDestroy = reflink.call(this, component, ref);
	    component.$on('$destroy', refDestroy);
	  }
	  for(var i = 0, len = attrs.length; i < len; i++){
	    var attr = attrs[i];
	    var value = attr.value||true;
	    var name = attr.name;
	    // need compiled
	    if(value.type === 'expression' && !attr.event){
	      value = self._touchExpr(value);
	      // use bit operate to control scope
	      if( !(isolate & 2) ) 
	        this.$watch(value, (function(name, val){
	          this.data[name] = val;
	        }).bind(component, name), { sync: true })
	      if( value.set && !(isolate & 1 ) ) 
	        // sync the data. it force the component don't trigger attr.name's first dirty echeck
	        component.$watch(name, self.$update.bind(self, value), {init: true});
	    }
	  }
	  if(is && is.type === 'expression'  ){
	    var group = new Group();
	    group.push(component);
	    this.$watch(is, function(value){
	      // found the new component
	      var Component = Constructor.component(value);
	      if(!Component) throw new Error("component " + value + " has not registed!");
	      var ncomponent = new Component(definition);
	      var component = group.children.pop();
	      group.push(ncomponent);
	      ncomponent.$inject(combine.last(component), 'after')
	      component.destroy();
	      // @TODO  if component changed , we need update ref
	      if(ref){
	        self.$refs[ref] = ncomponent;
	      }
	    }, {sync: true})
	    return group;
	  }
	  return component;
	}
	
	function walkAttributes(attrs, element, extra){
	  var bindings = []
	  for(var i = 0, len = attrs.length; i < len; i++){
	    var binding = this._walk(attrs[i], {element: element, fromElement: true, attrs: attrs, extra: extra})
	    if(binding) bindings.push(binding);
	  }
	  return bindings;
	}
	
	
	walkers.attribute = function(ast ,options){
	
	  var attr = ast;
	  var Component = this.constructor;
	  var name = attr.name;
	  var directive = Component.directive(name);
	
	  shared.prepareAttr(ast, directive);
	
	  var value = attr.value || "";
	  var constant = value.constant;
	  var element = options.element;
	  var self = this;
	
	
	
	  value = this._touchExpr(value);
	
	  if(constant) value = value.get(this);
	
	  if(directive && directive.link){
	    var binding = directive.link.call(self, element, value, name, options.attrs);
	    if(typeof binding === 'function') binding = {destroy: binding}; 
	    return binding;
	  } else{
	    if(value.type === 'expression' ){
	      this.$watch(value, function(nvalue, old){
	        dom.attr(element, name, nvalue);
	      }, {init: true});
	    }else{
	      if(_.isBooleanAttr(name)){
	        dom.attr(element, name, true);
	      }else{
	        dom.attr(element, name, value);
	      }
	    }
	    if(!options.fromElement){
	      return {
	        destroy: function(){
	          dom.attr(element, name, null);
	        }
	      }
	    }
	  }
	
	}
	
	
	


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	// some nested  operation in ast 
	// --------------------------------
	
	var dom = __webpack_require__(30);
	var animate = __webpack_require__(34);
	
	var combine = module.exports = {
	
	  // get the initial dom in object
	  node: function(item){
	    var children,node, nodes;
	    if(!item) return;
	    if(item.element) return item.element;
	    if(typeof item.node === "function") return item.node();
	    if(typeof item.nodeType === "number") return item;
	    if(item.group) return combine.node(item.group)
	    if(children = item.children){
	      if(children.length === 1){
	        return combine.node(children[0]);
	      }
	      nodes = [];
	      for(var i = 0, len = children.length; i < len; i++ ){
	        node = combine.node(children[i]);
	        if(Array.isArray(node)){
	          nodes.push.apply(nodes, node)
	        }else if(node) {
	          nodes.push(node)
	        }
	      }
	      return nodes;
	    }
	  },
	  // @TODO remove _gragContainer
	  inject: function(node, pos ){
	    var group = this;
	    var fragment = combine.node(group.group || group);
	    if(node === false) {
	      animate.remove(fragment)
	      return group;
	    }else{
	      if(!fragment) return group;
	      if(typeof node === 'string') node = dom.find(node);
	      if(!node) throw Error('injected node is not found');
	      // use animate to animate firstchildren
	      animate.inject(fragment, node, pos);
	    }
	    // if it is a component
	    if(group.$emit) {
	      var preParent = group.parentNode;
	      var newParent = (pos ==='after' || pos === 'before')? node.parentNode : node;
	      group.parentNode = newParent;
	      group.$emit("$inject", node, pos, preParent);
	    }
	    return group;
	  },
	
	  // get the last dom in object(for insertion operation)
	  last: function(item){
	    var children = item.children;
	
	    if(typeof item.last === "function") return item.last();
	    if(typeof item.nodeType === "number") return item;
	
	    if(children && children.length) return combine.last(children[children.length - 1]);
	    if(item.group) return combine.last(item.group);
	
	  },
	
	  destroy: function(item, first){
	    if(!item) return;
	    if(Array.isArray(item)){
	      for(var i = 0, len = item.length; i < len; i++ ){
	        combine.destroy(item[i], first);
	      }
	    }
	    var children = item.children;
	    if(typeof item.destroy === "function") return item.destroy(first);
	    if(typeof item.nodeType === "number" && first)  dom.remove(item);
	    if(children && children.length){
	      combine.destroy(children, true);
	      item.children = null;
	    }
	  }
	
	}
	
	
	// @TODO: need move to dom.js
	dom.element = function( component, all ){
	  if(!component) return !all? null: [];
	  var nodes = combine.node( component );
	  if( nodes.nodeType === 1 ) return all? [nodes]: nodes;
	  var elements = [];
	  for(var i = 0; i<nodes.length ;i++){
	    var node = nodes[i];
	    if( node && node.nodeType === 1){
	      if(!all) return node;
	      elements.push(node);
	    } 
	  }
	  return !all? elements[0]: elements;
	}
	
	
	


/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(10);
	var dom  = __webpack_require__(30);
	var animate = {};
	var env = __webpack_require__(16);
	
	
	if(typeof window !== 'undefined'){
	var 
	  transitionEnd = 'transitionend', 
	  animationEnd = 'animationend', 
	  transitionProperty = 'transition', 
	  animationProperty = 'animation';
	
	if(!('ontransitionend' in window)){
	  if('onwebkittransitionend' in window) {
	    
	    // Chrome/Saf (+ Mobile Saf)/Android
	    transitionEnd += ' webkitTransitionEnd';
	    transitionProperty = 'webkitTransition'
	  } else if('onotransitionend' in dom.tNode || navigator.appName === 'Opera') {
	
	    // Opera
	    transitionEnd += ' oTransitionEnd';
	    transitionProperty = 'oTransition';
	  }
	}
	if(!('onanimationend' in window)){
	  if ('onwebkitanimationend' in window){
	    // Chrome/Saf (+ Mobile Saf)/Android
	    animationEnd += ' webkitAnimationEnd';
	    animationProperty = 'webkitAnimation';
	
	  }else if ('onoanimationend' in dom.tNode){
	    // Opera
	    animationEnd += ' oAnimationEnd';
	    animationProperty = 'oAnimation';
	  }
	}
	}
	
	/**
	 * inject node with animation
	 * @param  {[type]} node      [description]
	 * @param  {[type]} refer     [description]
	 * @param  {[type]} direction [description]
	 * @return {[type]}           [description]
	 */
	animate.inject = function( node, refer ,direction, callback ){
	  callback = callback || _.noop;
	  if( Array.isArray(node) ){
	    var fragment = dom.fragment();
	    var count=0;
	
	    for(var i = 0,len = node.length;i < len; i++ ){
	      fragment.appendChild(node[i]); 
	    }
	    dom.inject(fragment, refer, direction);
	
	    // if all nodes is done, we call the callback
	    var enterCallback = function (){
	      count++;
	      if( count === len ) callback();
	    }
	    if(len === count) callback();
	    for( i = 0; i < len; i++ ){
	      if(node[i].onenter){
	        node[i].onenter(enterCallback);
	      }else{
	        enterCallback();
	      }
	    }
	  }else{
	    if(!node) return;
	    dom.inject( node, refer, direction );
	    if(node.onenter){
	      node.onenter(callback)
	    }else{
	      callback();
	    }
	  }
	}
	
	/**
	 * remove node with animation
	 * @param  {[type]}   node     [description]
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	animate.remove = function(node, callback){
	  if(!node) return;
	  var count = 0;
	  function loop(){
	    count++;
	    if(count === len) callback && callback()
	  }
	  if(Array.isArray(node)){
	    for(var i = 0, len = node.length; i < len ; i++){
	      animate.remove(node[i], loop)
	    }
	    return node;
	  }
	  if(node.onleave){
	    node.onleave(function(){
	      removeDone(node, callback)
	    })
	  }else{
	    removeDone(node, callback)
	  }
	}
	
	var removeDone = function (node, callback){
	    dom.remove(node);
	    callback && callback();
	}
	
	
	
	animate.startClassAnimate = function ( node, className,  callback, mode ){
	  var activeClassName, timeout, tid, onceAnim;
	  if( (!animationEnd && !transitionEnd) || env.isRunning ){
	    return callback();
	  }
	
	  if(mode !== 4){
	    onceAnim = _.once(function onAnimateEnd(){
	      if(tid) clearTimeout(tid);
	
	      if(mode === 2) {
	        dom.delClass(node, activeClassName);
	      }
	      if(mode !== 3){ // mode hold the class
	        dom.delClass(node, className);
	      }
	      dom.off(node, animationEnd, onceAnim)
	      dom.off(node, transitionEnd, onceAnim)
	
	      callback();
	
	    });
	  }else{
	    onceAnim = _.once(function onAnimateEnd(){
	      if(tid) clearTimeout(tid);
	      callback();
	    });
	  }
	  if(mode === 2){ // auto removed
	    dom.addClass( node, className );
	
	    activeClassName = _.map(className.split(/\s+/), function(name){
	       return name + '-active';
	    }).join(" ");
	
	    dom.nextReflow(function(){
	      dom.addClass( node, activeClassName );
	      timeout = getMaxTimeout( node );
	      tid = setTimeout( onceAnim, timeout );
	    });
	
	  }else if(mode===4){
	    dom.nextReflow(function(){
	      dom.delClass( node, className );
	      timeout = getMaxTimeout( node );
	      tid = setTimeout( onceAnim, timeout );
	    });
	
	  }else{
	    dom.nextReflow(function(){
	      dom.addClass( node, className );
	      timeout = getMaxTimeout( node );
	      tid = setTimeout( onceAnim, timeout );
	    });
	  }
	
	
	
	  dom.on( node, animationEnd, onceAnim )
	  dom.on( node, transitionEnd, onceAnim )
	  return onceAnim;
	}
	
	
	animate.startStyleAnimate = function(node, styles, callback){
	  var timeout, onceAnim, tid;
	
	  dom.nextReflow(function(){
	    dom.css( node, styles );
	    timeout = getMaxTimeout( node );
	    tid = setTimeout( onceAnim, timeout );
	  });
	
	
	  onceAnim = _.once(function onAnimateEnd(){
	    if(tid) clearTimeout(tid);
	
	    dom.off(node, animationEnd, onceAnim)
	    dom.off(node, transitionEnd, onceAnim)
	
	    callback();
	
	  });
	
	  dom.on( node, animationEnd, onceAnim )
	  dom.on( node, transitionEnd, onceAnim )
	
	  return onceAnim;
	}
	
	
	/**
	 * get maxtimeout
	 * @param  {Node} node 
	 * @return {[type]}   [description]
	 */
	function getMaxTimeout(node){
	  var timeout = 0,
	    tDuration = 0,
	    tDelay = 0,
	    aDuration = 0,
	    aDelay = 0,
	    ratio = 5 / 3,
	    styles ;
	
	  if(window.getComputedStyle){
	
	    styles = window.getComputedStyle(node),
	    tDuration = getMaxTime( styles[transitionProperty + 'Duration']) || tDuration;
	    tDelay = getMaxTime( styles[transitionProperty + 'Delay']) || tDelay;
	    aDuration = getMaxTime( styles[animationProperty + 'Duration']) || aDuration;
	    aDelay = getMaxTime( styles[animationProperty + 'Delay']) || aDelay;
	    timeout = Math.max( tDuration+tDelay, aDuration + aDelay );
	
	  }
	  return timeout * 1000 * ratio;
	}
	
	function getMaxTime(str){
	
	  var maxTimeout = 0, time;
	
	  if(!str) return 0;
	
	  str.split(",").forEach(function(str){
	
	    time = parseFloat(str);
	    if( time > maxTimeout ) maxTimeout = time;
	
	  });
	
	  return maxTimeout;
	}
	
	module.exports = animate;

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(10);
	var combine = __webpack_require__(33)
	
	function Group(list){
	  this.children = list || [];
	}
	
	
	var o = _.extend(Group.prototype, {
	  destroy: function(first){
	    combine.destroy(this.children, first);
	    if(this.ondestroy) this.ondestroy();
	    this.children = null;
	  },
	  get: function(i){
	    return this.children[i]
	  },
	  push: function(item){
	    this.children.push( item );
	  }
	})
	o.inject = o.$inject = combine.inject
	
	
	
	module.exports = Group;
	
	


/***/ },
/* 36 */
/***/ function(module, exports) {

	function NodeCursor(node){
	  this.node = node;
	}
	
	
	var no = NodeCursor.prototype;
	
	no.next = function(){
	  this.node = this.node.nextSibling;
	  return this;
	}
	
	module.exports = function(n){ return new NodeCursor(n)}


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	// simplest event emitter 60 lines
	// ===============================
	var slice = [].slice, _ = __webpack_require__(10);
	var API = {
	  $on: function(event, fn) {
	    if(!event) return this;
	    if(typeof event === "object"){
	      for (var i in event) {
	        this.$on(i, event[i]);
	      }
	    }else{
	      // @patch: for list
	      var context = this;
	      var handles = context._handles || (context._handles = {}),
	        calls = handles[event] || (handles[event] = []);
	      calls.push(fn);
	    }
	    return this;
	  },
	  $off: function(event, fn) {
	    var context = this;
	    if(!context._handles) return;
	    if(!event) this._handles = {};
	    var handles = context._handles,
	      calls;
	
	    if (calls = handles[event]) {
	      if (!fn) {
	        handles[event] = [];
	        return context;
	      }
	      for (var i = 0, len = calls.length; i < len; i++) {
	        if (fn === calls[i]) {
	          calls.splice(i, 1);
	          return context;
	        }
	      }
	    }
	    return context;
	  },
	  // bubble event
	  $emit: function(event){
	    // @patch: for list
	    var context = this;
	    var handles = context._handles, calls, args, type;
	    if(!event) return;
	    var args = slice.call(arguments, 1);
	    var type = event;
	
	    if(!handles) return context;
	    if(calls = handles[type.slice(1)]){
	      for (var j = 0, len = calls.length; j < len; j++) {
	        calls[j].apply(context, args)
	      }
	    }
	    if (!(calls = handles[type])) return context;
	    for (var i = 0, len = calls.length; i < len; i++) {
	      calls[i].apply(context, args)
	    }
	    // if(calls.length) context.$update();
	    return context;
	  }
	}
	// container class
	function Event() {}
	_.extend(Event.prototype, API)
	
	Event.mixTo = function(obj){
	  obj = typeof obj === "function" ? obj.prototype : obj;
	  _.extend(obj, API)
	}
	module.exports = Event;

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(10);
	var parseExpression = __webpack_require__(15).expression;
	var diff = __webpack_require__(20);
	var diffArray = diff.diffArray;
	var diffObject = diff.diffObject;
	
	function Watcher(){}
	
	var methods = {
	  $watch: function(expr, fn, options){
	    var get, once, test, rlen, extra = this.__ext__; //records length
	    if(!this._watchers) this._watchers = [];
	
	    options = options || {};
	    if(options === true){
	       options = { deep: true }
	    }
	    var uid = _.uid('w_');
	    if(Array.isArray(expr)){
	      var tests = [];
	      for(var i = 0,len = expr.length; i < len; i++){
	          tests.push(this.$expression(expr[i]).get)
	      }
	      var prev = [];
	      test = function(context){
	        var equal = true;
	        for(var i =0, len = tests.length; i < len; i++){
	          var splice = tests[i](context, extra);
	          if(!_.equals(splice, prev[i])){
	             equal = false;
	             prev[i] = _.clone(splice);
	          }
	        }
	        return equal? false: prev;
	      }
	    }else{
	      if(typeof expr === 'function'){
	        get = expr.bind(this);      
	      }else{
	        expr = this._touchExpr( parseExpression(expr) );
	        get = expr.get;
	        once = expr.once;
	      }
	    }
	
	    var watcher = {
	      id: uid, 
	      get: get, 
	      fn: fn, 
	      once: once, 
	      force: options.force,
	      // don't use ld to resolve array diff
	      diff: options.diff,
	      test: test,
	      deep: options.deep,
	      last: options.sync? get(this): options.last
	    }
	    
	    this._watchers.push( watcher );
	
	    rlen = this._records && this._records.length;
	    if(rlen) this._records[rlen-1].push(uid)
	    // init state.
	    if(options.init === true){
	      var prephase = this.$phase;
	      this.$phase = 'digest';
	      this._checkSingleWatch( watcher, this._watchers.length-1 );
	      this.$phase = prephase;
	    }
	    return watcher;
	  },
	  $unwatch: function(uid){
	    uid = uid.id || uid;
	    if(!this._watchers) this._watchers = [];
	    if(Array.isArray(uid)){
	      for(var i =0, len = uid.length; i < len; i++){
	        this.$unwatch(uid[i]);
	      }
	    }else{
	      var watchers = this._watchers, watcher, wlen;
	      if(!uid || !watchers || !(wlen = watchers.length)) return;
	      for(;wlen--;){
	        watcher = watchers[wlen];
	        if(watcher && watcher.id === uid ){
	          watchers.splice(wlen, 1);
	        }
	      }
	    }
	  },
	  $expression: function(value){
	    return this._touchExpr(parseExpression(value))
	  },
	  /**
	   * the whole digest loop ,just like angular, it just a dirty-check loop;
	   * @param  {String} path  now regular process a pure dirty-check loop, but in parse phase, 
	   *                  Regular's parser extract the dependencies, in future maybe it will change to dirty-check combine with path-aware update;
	   * @return {Void}   
	   */
	
	  $digest: function(){
	    if(this.$phase === 'digest' || this._mute) return;
	    this.$phase = 'digest';
	    var dirty = false, n =0;
	    while(dirty = this._digest()){
	
	      if((++n) > 20){ // max loop
	        throw Error('there may a circular dependencies reaches')
	      }
	    }
	    if( n > 0 && this.$emit) this.$emit("$update");
	    this.$phase = null;
	  },
	  // private digest logic
	  _digest: function(){
	
	    var watchers = this._watchers;
	    var dirty = false, children, watcher, watcherDirty;
	    if(watchers && watchers.length){
	      for(var i = 0, len = watchers.length;i < len; i++){
	        watcher = watchers[i];
	        watcherDirty = this._checkSingleWatch(watcher, i);
	        if(watcherDirty) dirty = true;
	      }
	    }
	    // check children's dirty.
	    children = this._children;
	    if(children && children.length){
	      for(var m = 0, mlen = children.length; m < mlen; m++){
	        var child = children[m];
	        
	        if(child && child._digest()) dirty = true;
	      }
	    }
	    return dirty;
	  },
	  // check a single one watcher 
	  _checkSingleWatch: function(watcher, i){
	    var dirty = false;
	    if(!watcher) return;
	
	    var now, last, tlast, tnow,  eq, diff;
	
	    if(!watcher.test){
	
	      now = watcher.get(this);
	      last = watcher.last;
	      tlast = _.typeOf(last);
	      tnow = _.typeOf(now);
	      eq = true, diff;
	
	      // !Object
	      if( !(tnow === 'object' && tlast==='object' && watcher.deep) ){
	        // Array
	        if( tnow === 'array' && ( tlast=='undefined' || tlast === 'array') ){
	          diff = diffArray(now, watcher.last || [], watcher.diff)
	          if( tlast !== 'array' || diff === true || diff.length ) dirty = true;
	        }else{
	          eq = _.equals( now, last );
	          if( !eq || watcher.force ){
	            watcher.force = null;
	            dirty = true; 
	          }
	        }
	      }else{
	        diff =  diffObject( now, last, watcher.diff );
	        if( diff === true || diff.length ) dirty = true;
	      }
	    } else{
	      // @TODO 是否把多重改掉
	      var result = watcher.test(this);
	      if(result){
	        dirty = true;
	        watcher.fn.apply(this, result)
	      }
	    }
	    if(dirty && !watcher.test){
	      if(tnow === 'object' && watcher.deep || tnow === 'array'){
	        watcher.last = _.clone(now);
	      }else{
	        watcher.last = now;
	      }
	      watcher.fn.call(this, now, last, diff)
	      if(watcher.once) this._watchers.splice(i, 1);
	    }
	
	    return dirty;
	  },
	
	  /**
	   * **tips**: whatever param you passed in $update, after the function called, dirty-check(digest) phase will enter;
	   * 
	   * @param  {Function|String|Expression} path  
	   * @param  {Whatever} value optional, when path is Function, the value is ignored
	   * @return {this}     this 
	   */
	  $set: function(path, value){
	    if(path != null){
	      var type = _.typeOf(path);
	      if( type === 'string' || path.type === 'expression' ){
	        path = this.$expression(path);
	        path.set(this, value);
	      }else if(type === 'function'){
	        path.call(this, this.data);
	      }else{
	        for(var i in path) {
	          this.$set(i, path[i])
	        }
	      }
	    }
	  },
	  // 1. expr canbe string or a Expression
	  // 2. detect: if true, if expr is a string will directly return;
	  $get: function(expr, detect)  {
	    if(detect && typeof expr === 'string') return expr;
	    return this.$expression(expr).get(this);
	  },
	  $update: function(){
	    var rootParent = this;
	    do{
	      if(rootParent.data.isolate || !rootParent.$parent) break;
	      rootParent = rootParent.$parent;
	    } while(rootParent)
	
	    var prephase =rootParent.$phase;
	    rootParent.$phase = 'digest'
	
	    this.$set.apply(this, arguments);
	
	    rootParent.$phase = prephase
	
	    rootParent.$digest();
	    return this;
	  },
	  // auto collect watchers for logic-control.
	  _record: function(){
	    if(!this._records) this._records = [];
	    this._records.push([]);
	  },
	  _release: function(){
	    return this._records.pop();
	  }
	}
	
	
	_.extend(Watcher.prototype, methods)
	
	
	Watcher.mixTo = function(obj){
	  obj = typeof obj === "function" ? obj.prototype : obj;
	  return _.extend(obj, methods)
	}
	
	module.exports = Watcher;

/***/ },
/* 39 */
/***/ function(module, exports) {

	
	var f = module.exports = {};
	
	// json:  two way 
	//  - get: JSON.stringify
	//  - set: JSON.parse
	//  - example: `{ title|json }`
	f.json = {
	  get: function( value ){
	    return typeof JSON !== 'undefined'? JSON.stringify(value): value;
	  },
	  set: function( value ){
	    return typeof JSON !== 'undefined'? JSON.parse(value) : value;
	  }
	}
	
	// last: one-way
	//  - get: return the last item in list
	//  - example: `{ list|last }`
	f.last = function(arr){
	  return arr && arr[arr.length - 1];
	}
	
	// average: one-way
	//  - get: copute the average of the list
	//  - example: `{ list| average: "score" }`
	f.average = function(array, key){
	  array = array || [];
	  return array.length? f.total(array, key)/ array.length : 0;
	}
	
	
	// total: one-way
	//  - get: copute the total of the list
	//  - example: `{ list| total: "score" }`
	f.total = function(array, key){
	  var total = 0;
	  if(!array) return;
	  array.forEach(function( item ){
	    total += key? item[key] : item;
	  })
	  return total;
	}
	
	// var basicSortFn = function(a, b){return b - a}
	
	// f.sort = function(array, key, reverse){
	//   var type = typeof key, sortFn; 
	//   switch(type){
	//     case 'function': sortFn = key; break;
	//     case 'string': sortFn = function(a, b){};break;
	//     default:
	//       sortFn = basicSortFn;
	//   }
	//   // need other refernce.
	//   return array.slice().sort(function(a,b){
	//     return reverse? -sortFn(a, b): sortFn(a, b);
	//   })
	//   return array
	// }
	
	


/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	// Regular
	var _ = __webpack_require__(10);
	var dom = __webpack_require__(30);
	var animate = __webpack_require__(34);
	var Regular = __webpack_require__(28);
	var consts = __webpack_require__(31);
	var namespaces = consts.NAMESPACE;
	
	
	
	
	__webpack_require__(41);
	__webpack_require__(42);
	
	
	module.exports = {
	// **warn**: class inteplation will override this directive 
	  'r-class': function(elem, value){
	
	    if(typeof value=== 'string'){
	      value = _.fixObjStr(value)
	    }
	    var isNotHtml = elem.namespaceURI && elem.namespaceURI !== namespaces.html ;
	    this.$watch(value, function(nvalue){
	      var className = isNotHtml? elem.getAttribute('class'): elem.className;
	      className = ' '+ (className||'').replace(/\s+/g, ' ') +' ';
	      for(var i in nvalue) if(nvalue.hasOwnProperty(i)){
	        className = className.replace(' ' + i + ' ',' ');
	        if(nvalue[i] === true){
	          className += i+' ';
	        }
	      }
	      className = className.trim();
	      if(isNotHtml){
	        dom.attr(elem, 'class', className)
	      }else{
	        elem.className = className
	      }
	    },true);
	  },
	  // **warn**: style inteplation will override this directive 
	  'r-style': function(elem, value){
	    if(typeof value=== 'string'){
	      value = _.fixObjStr(value)
	    }
	    this.$watch(value, function(nvalue){
	      for(var i in nvalue) if(nvalue.hasOwnProperty(i)){
	        dom.css(elem, i, nvalue[i]);
	      }
	    },true);
	  },
	  // when expression is evaluate to true, the elem will add display:none
	  // Example: <div r-hide={{items.length > 0}}></div>
	  'r-hide': function(elem, value){
	    var preBool = null, compelete;
	    if( _.isExpr(value) || typeof value === "string"){
	      this.$watch(value, function(nvalue){
	        var bool = !!nvalue;
	        if(bool === preBool) return; 
	        preBool = bool;
	        if(bool){
	          if(elem.onleave){
	            compelete = elem.onleave(function(){
	              elem.style.display = "none"
	              compelete = null;
	            })
	          }else{
	            elem.style.display = "none"
	          }
	          
	        }else{
	          if(compelete) compelete();
	          elem.style.display = "";
	          if(elem.onenter){
	            elem.onenter();
	          }
	        }
	      });
	    }else if(!!value){
	      elem.style.display = "none";
	    }
	  },
	  'r-html': {
	    ssr: function(value, tag){
	      tag.body = value;
	      return "";
	    },
	    link: function(elem, value){
	      this.$watch(value, function(nvalue){
	        nvalue = nvalue || "";
	        dom.html(elem, nvalue)
	      }, {force: true});
	    }
	  },
	  'ref': {
	    accept: consts.COMPONENT_TYPE + consts.ELEMENT_TYPE,
	    link: function( elem, value ){
	      var refs = this.$refs || (this.$refs = {});
	      var cval;
	      if(_.isExpr(value)){
	        this.$watch(value, function(nval, oval){
	          cval = nval;
	          if(refs[oval] === elem) refs[oval] = null;
	          if(cval) refs[cval] = elem;
	        })
	      }else{
	        refs[cval = value] = elem;
	      }
	      return function(){
	        refs[cval] = null;
	      }
	    }
	  }
	}
	
	Regular.directive(module.exports);
	
	
	
	
	
	
	
	
	
	


/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * event directive  bundle
	 *
	 */
	var _ = __webpack_require__(10);
	var dom = __webpack_require__(30);
	var Regular = __webpack_require__(28);
	
	Regular._addProtoInheritCache("event");
	
	Regular.directive( /^on-\w+$/, function( elem, value, name , attrs) {
	  if ( !name || !value ) return;
	  var type = name.split("-")[1];
	  return this._handleEvent( elem, type, value, attrs );
	});
	// TODO.
	/**
	- $('dx').delegate()
	*/
	Regular.directive( /^(delegate|de)-\w+$/, function( elem, value, name ) {
	  var root = this.$root;
	  var _delegates = root._delegates || ( root._delegates = {} );
	  if ( !name || !value ) return;
	  var type = name.split("-")[1];
	  var fire = _.handleEvent.call(this, value, type);
	
	  function delegateEvent(ev){
	    matchParent(ev, _delegates[type], root.parentNode);
	  }
	
	  if( !_delegates[type] ){
	    _delegates[type] = [];
	
	    if(root.parentNode){
	      dom.on(root.parentNode, type, delegateEvent);
	    }else{
	      root.$on( "$inject", function( node, position, preParent ){
	        var newParent = this.parentNode;
	        if( preParent ){
	          dom.off(preParent, type, delegateEvent);
	        }
	        if(newParent) dom.on(this.parentNode, type, delegateEvent);
	      })
	    }
	    root.$on("$destroy", function(){
	      if(root.parentNode) dom.off(root.parentNode, type, delegateEvent)
	      _delegates[type] = null;
	    })
	  }
	  var delegate = {
	    element: elem,
	    fire: fire
	  }
	  _delegates[type].push( delegate );
	
	  return function(){
	    var delegates = _delegates[type];
	    if(!delegates || !delegates.length) return;
	    for( var i = 0, len = delegates.length; i < len; i++ ){
	      if( delegates[i] === delegate ) delegates.splice(i, 1);
	    }
	  }
	
	});
	
	
	function matchParent(ev , delegates, stop){
	  if(!stop) return;
	  var target = ev.target, pair;
	  while(target && target !== stop){
	    for( var i = 0, len = delegates.length; i < len; i++ ){
	      pair = delegates[i];
	      if(pair && pair.element === target){
	        pair.fire(ev)
	      }
	    }
	    target = target.parentNode;
	  }
	}

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	// Regular
	var _ = __webpack_require__(10);
	var dom = __webpack_require__(30);
	var Regular = __webpack_require__(28);
	
	var modelHandlers = {
	  "text": initText,
	  "select": initSelect,
	  "checkbox": initCheckBox,
	  "radio": initRadio
	}
	
	
	// @TODO
	
	
	// two-way binding with r-model
	// works on input, textarea, checkbox, radio, select
	
	Regular.directive("r-model", {
	  link: function(elem, value){
	    var tag = elem.tagName.toLowerCase();
	    var sign = tag;
	    if(sign === "input") sign = elem.type || "text";
	    else if(sign === "textarea") sign = "text";
	    if(typeof value === "string") value = this.$expression(value);
	
	    if( modelHandlers[sign] ) return modelHandlers[sign].call(this, elem, value);
	    else if(tag === "input"){
	      return modelHandlers.text.call(this, elem, value);
	    }
	  }
	  //@TODO
	  // ssr: function(name, value){
	  //   return value? "value=" + value: ""
	  // }
	});
	
	
	
	
	
	// binding <select>
	
	function initSelect( elem, parsed){
	  var self = this;
	  var wc =this.$watch(parsed, function(newValue){
	    var children = _.slice(elem.getElementsByTagName('option'))
	    children.forEach(function(node, index){
	      if(node.value == newValue){
	        elem.selectedIndex = index;
	      }
	    })
	  });
	
	  function handler(){
	    parsed.set(self, this.value);
	    wc.last = this.value;
	    self.$update();
	  }
	
	  dom.on(elem, "change", handler);
	  
	  if(parsed.get(self) === undefined && elem.value){
	     parsed.set(self, elem.value);
	  }
	  return function destroy(){
	    dom.off(elem, "change", handler);
	  }
	}
	
	// input,textarea binding
	
	function initText(elem, parsed){
	  var self = this;
	  var wc = this.$watch(parsed, function(newValue){
	    if(elem.value !== newValue) elem.value = newValue == null? "": "" + newValue;
	  });
	
	  // @TODO to fixed event
	  var handler = function (ev){
	    var that = this;
	    if(ev.type==='cut' || ev.type==='paste'){
	      _.nextTick(function(){
	        var value = that.value
	        parsed.set(self, value);
	        wc.last = value;
	        self.$update();
	      })
	    }else{
	        var value = that.value
	        parsed.set(self, value);
	        wc.last = value;
	        self.$update();
	    }
	  };
	
	  if(dom.msie !== 9 && "oninput" in dom.tNode ){
	    elem.addEventListener("input", handler );
	  }else{
	    dom.on(elem, "paste", handler)
	    dom.on(elem, "keyup", handler)
	    dom.on(elem, "cut", handler)
	    dom.on(elem, "change", handler)
	  }
	  if(parsed.get(self) === undefined && elem.value){
	     parsed.set(self, elem.value);
	  }
	  return function (){
	    if(dom.msie !== 9 && "oninput" in dom.tNode ){
	      elem.removeEventListener("input", handler );
	    }else{
	      dom.off(elem, "paste", handler)
	      dom.off(elem, "keyup", handler)
	      dom.off(elem, "cut", handler)
	      dom.off(elem, "change", handler)
	    }
	  }
	}
	
	
	// input:checkbox  binding
	
	function initCheckBox(elem, parsed){
	  var self = this;
	  var watcher = this.$watch(parsed, function(newValue){
	    dom.attr(elem, 'checked', !!newValue);
	  });
	
	  var handler = function handler(){
	    var value = this.checked;
	    parsed.set(self, value);
	    watcher.last = value;
	    self.$update();
	  }
	  if(parsed.set) dom.on(elem, "change", handler)
	
	  if(parsed.get(self) === undefined){
	    parsed.set(self, !!elem.checked);
	  }
	
	  return function destroy(){
	    if(parsed.set) dom.off(elem, "change", handler)
	  }
	}
	
	
	// input:radio binding
	
	function initRadio(elem, parsed){
	  var self = this;
	  var wc = this.$watch(parsed, function( newValue ){
	    if(newValue == elem.value) elem.checked = true;
	    else elem.checked = false;
	  });
	
	
	  var handler = function handler(){
	    var value = this.value;
	    parsed.set(self, value);
	    self.$update();
	  }
	  if(parsed.set) dom.on(elem, "change", handler)
	  // beacuse only after compile(init), the dom structrue is exsit. 
	  if(parsed.get(self) === undefined){
	    if(elem.checked) {
	      parsed.set(self, elem.value);
	    }
	  }
	
	  return function destroy(){
	    if(parsed.set) dom.off(elem, "change", handler)
	  }
	}


/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	var // packages
	  _ = __webpack_require__(10),
	 animate = __webpack_require__(34),
	 dom = __webpack_require__(30),
	 Regular = __webpack_require__(28);
	
	
	var // variables
	  rClassName = /^[-\w]+(\s[-\w]+)*$/,
	  rCommaSep = /[\r\n\f ]*,[\r\n\f ]*(?=\w+\:)/, //  dont split comma in  Expression
	  rStyles = /^\{.*\}$/, //  for Simpilfy
	  rSpace = /\s+/, //  for Simpilfy
	  WHEN_COMMAND = "when",
	  EVENT_COMMAND = "on",
	  THEN_COMMAND = "then";
	
	/**
	 * Animation Plugin
	 * @param {Component} Component 
	 */
	
	
	function createSeed(type){
	
	  var steps = [], current = 0, callback = _.noop;
	  var key;
	
	  var out = {
	    type: type,
	    start: function(cb){
	      key = _.uid();
	      if(typeof cb === "function") callback = cb;
	      if(current> 0 ){
	        current = 0 ;
	      }else{
	        out.step();
	      }
	      return out.compelete;
	    },
	    compelete: function(){
	      key = null;
	      callback && callback();
	      callback = _.noop;
	      current = 0;
	    },
	    step: function(){
	      if(steps[current]) steps[current ]( out.done.bind(out, key) );
	    },
	    done: function(pkey){
	      if(pkey !== key) return; // means the loop is down
	      if( current < steps.length - 1 ) {
	        current++;
	        out.step();
	      }else{
	        out.compelete();
	      }
	    },
	    push: function(step){
	      steps.push(step)
	    }
	  }
	
	  return out;
	}
	
	Regular._addProtoInheritCache("animation")
	
	
	// builtin animation
	Regular.animation({
	  "wait": function( step ){
	    var timeout = parseInt( step.param ) || 0
	    return function(done){
	      // _.log("delay " + timeout)
	      setTimeout( done, timeout );
	    }
	  },
	  "class": function(step){
	    var tmp = step.param.split(","),
	      className = tmp[0] || "",
	      mode = parseInt(tmp[1]) || 1;
	
	    return function(done){
	      // _.log(className)
	      animate.startClassAnimate( step.element, className , done, mode );
	    }
	  },
	  "call": function(step){
	    var fn = this.$expression(step.param).get, self = this;
	    return function(done){
	      // _.log(step.param, 'call')
	      fn(self);
	      self.$update();
	      done()
	    }
	  },
	  "emit": function(step){
	    var param = step.param;
	    var tmp = param.split(","),
	      evt = tmp[0] || "",
	      args = tmp[1]? this.$expression(tmp[1]).get: null;
	
	    if(!evt) throw Error("you shoud specified a eventname in emit command");
	
	    var self = this;
	    return function(done){
	      self.$emit(evt, args? args(self) : undefined);
	      done();
	    }
	  },
	  // style: left {10}px,
	  style: function(step){
	    var styles = {}, 
	      param = step.param,
	      pairs = param.split(","), valid;
	    pairs.forEach(function(pair){
	      pair = pair.trim();
	      if(pair){
	        var tmp = pair.split( rSpace ),
	          name = tmp.shift(),
	          value = tmp.join(" ");
	
	        if( !name || !value ) throw Error("invalid style in command: style");
	        styles[name] = value;
	        valid = true;
	      }
	    })
	
	    return function(done){
	      if(valid){
	        animate.startStyleAnimate(step.element, styles, done);
	      }else{
	        done();
	      }
	    }
	  }
	})
	
	
	
	// hancdle the r-animation directive
	// el : the element to process
	// value: the directive value
	function processAnimate( element, value ){
	  var Component = this.constructor;
	
	  if(_.isExpr(value)){
	    value = value.get(this);
	  }
	
	  value = value.trim();
	
	  var composites = value.split(";"), 
	    composite, context = this, seeds = [], seed, destroies = [], destroy,
	    command, param , current = 0, tmp, animator, self = this;
	
	  function reset( type ){
	    seed && seeds.push( seed )
	    seed = createSeed( type );
	  }
	
	  function whenCallback(start, value){
	    if( !!value ) start()
	  }
	
	  function animationDestroy(element){
	    return function(){
	      element.onenter = null;
	      element.onleave = null;
	    } 
	  }
	
	  for( var i = 0, len = composites.length; i < len; i++ ){
	
	    composite = composites[i];
	    tmp = composite.split(":");
	    command = tmp[0] && tmp[0].trim();
	    param = tmp[1] && tmp[1].trim();
	
	    if( !command ) continue;
	
	    if( command === WHEN_COMMAND ){
	      reset("when");
	      this.$watch(param, whenCallback.bind( this, seed.start ) );
	      continue;
	    }
	
	    if( command === EVENT_COMMAND){
	      reset(param);
	      if( param === "leave" ){
	        element.onleave = seed.start;
	        destroies.push( animationDestroy(element) );
	      }else if( param === "enter" ){
	        element.onenter = seed.start;
	        destroies.push( animationDestroy(element) );
	      }else{
	        if( ("on" + param) in element){ // if dom have the event , we use dom event
	          destroies.push(this._handleEvent( element, param, seed.start ));
	        }else{ // otherwise, we use component event
	          this.$on(param, seed.start);
	          destroies.push(this.$off.bind(this, param, seed.start));
	        }
	      }
	      continue;
	    }
	
	    var animator =  Component.animation(command) 
	    if( animator && seed ){
	      seed.push(
	        animator.call(this,{
	          element: element,
	          done: seed.done,
	          param: param 
	        })
	      )
	    }else{
	      throw Error( animator? "you should start with `on` or `event` in animation" : ("undefined animator 【" + command +"】" ));
	    }
	  }
	
	  if(destroies.length){
	    return function(){
	      destroies.forEach(function(destroy){
	        destroy();
	      })
	    }
	  }
	}
	
	
	Regular.directive( "r-animation", processAnimate)
	Regular.directive( "r-anim", processAnimate)
	


/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	var Regular = __webpack_require__(28);
	
	/**
	 * Timeout Module
	 * @param {Component} Component 
	 */
	function TimeoutModule(Component){
	
	  Component.implement({
	    /**
	     * just like setTimeout, but will enter digest automately
	     * @param  {Function} fn    
	     * @param  {Number}   delay 
	     * @return {Number}   timeoutid
	     */
	    $timeout: function(fn, delay){
	      delay = delay || 0;
	      return setTimeout(function(){
	        fn.call(this);
	        this.$update(); //enter digest
	      }.bind(this), delay);
	    },
	    /**
	     * just like setInterval, but will enter digest automately
	     * @param  {Function} fn    
	     * @param  {Number}   interval 
	     * @return {Number}   intervalid
	     */
	    $interval: function(fn, interval){
	      interval = interval || 1000/60;
	      return setInterval(function(){
	        fn.call(this);
	        this.$update(); //enter digest
	      }.bind(this), interval);
	    }
	  });
	}
	
	
	Regular.plugin('timeout', TimeoutModule);
	Regular.plugin('$timeout', TimeoutModule);

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	var Regular = __webpack_require__(27);
	var u = __webpack_require__(26);
	var extend = u.extend;
	
	var extension = __webpack_require__(46);
	
	function createRestate( Stateman ){
	
	  function Restate( options ){
	    options = options || {};
	    if( !(this instanceof Restate)) return new Restate( options );
	    extend(this, options);
	    extension( this);
	    Stateman.call(this, options);
	    
	  }
	
	  var so = Regular.util.createProto(Restate, Stateman.prototype)
	
	  extend(so, {
	    installData: function( option ){
	      var type = typeof  this.dataProvider, 
	        ret,  state = option.state;
	
	      if( type === 'function' ){
	        ret = u.proxyMethod(state, this.dataProvider, option);
	      }else if(type === 'object'){
	        var dataProvider = this.dataProvider[ state.name];
	        ret = u.proxyMethod(state, dataProvider, option)
	      }
	
	      return u.normPromise( ret )
	    },
	    installView: function( option ){
	      var  state = option.state ,Comp = state.view;
	      // if(typeof Comp !== 'function') throw Error('view of [' + state.name + '] with wrong type')
	      // Lazy load
	      if(state.ssr === false && Regular.env.node ) {
	        Comp = undefined;
	      } else if( !Regular.isRegular(Comp) ){
	        Comp = u.proxyMethod(state, Comp, option)
	      }
	      return u.normPromise( Comp );
	    },
	    install: function( option ){
	      return Promise.all([this.installData( option ), this.installView( option)]).then(function(ret){
	        return {
	          Component: ret[1],
	          data: ret[0]
	        }
	      })
	    }
	  })
	  return Restate;
	}
	
	
	
	
	module.exports = createRestate;
	


/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(26);
	var Regular = __webpack_require__(27);
	var dom = Regular.dom;
	
	
	function handleUrl(url, history){
	  return history.mode === 2? url : history.prefix + url
	}
	
	module.exports = function( stateman  ){
	
	  Regular.directive({
	    'r-view': {
	      link: function(element){
	        this.$viewport = element;
	      },
	      ssr: function( attr ){
	        return 'r-view'
	      }
	    },
	    'r-link': {
	      nps: true,
	      link: function(element, value){
	
	        // use html5 history
	        if(stateman.history.mode === 2){
	          dom.attr(element, 'data-autolink', 'data-autolink');
	        }
	        if(value && value.type === 'expression'){
	          
	          this.$watch( value, function( val){
	            dom.attr(element, 'href', 
	              handleUrl(
	                val,
	                stateman.history
	              )
	            )
	          })
	          return;
	        }
	        var parsedLinkExpr = _.extractState(value);
	        if(parsedLinkExpr){
	
	          this.$watch( parsedLinkExpr.param, function(param){
	            dom.attr(element, 'href', 
	              handleUrl(
	                stateman.encode(parsedLinkExpr.name, param),
	                stateman.history
	              )
	              
	            )
	          } , {deep: true} )
	        }else{
	
	          dom.attr(element, 'href', 
	            handleUrl(
	              value,
	              stateman.history
	            )
	          )
	
	          
	        }
	      },
	      ssr: function( value, tag ){
	
	        if(value && value.type === 'expression'){
	          return 'href="' + Regular.util.escape(this.$get(value)) +  '"' 
	        }
	        var parsedLinkExpr = _.extractState(value);
	
	        if(parsedLinkExpr){
	          var param = this.$get(parsedLinkExpr.param);
	          return 'href="' + stateman.encode(parsedLinkExpr.name, param)+ '"' 
	        }else{
	        }
	      }
	    }
	  })
	}
	
	


/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	
	
	
	
	var Regular = __webpack_require__(27);
	var Stateman = __webpack_require__(48);
	var _ = __webpack_require__(26);
	var dom =Regular.dom;
	
	var createRestate = __webpack_require__(45);
	
	var Restate = createRestate( Stateman );
	var so = Restate.prototype;
	
	
	var oldStateFn = so.state;
	var oldStart = so.start;
	
	
	so.start = function(options, callback){
	  var self = this;
	  options = options || {};
	  var ssr = options.ssr;
	  var view = options.view;
	  this.view = view;
	  // prevent default stateman autoLink feature 
	  options.autolink = false;
	  if(ssr) {
	    // wont fix .
	    options.autofix = false;
	    options.html5 = true;
	  }
	  // delete unused options of stateman
	  delete options.ssr;
	  delete options.view;
	  if( options.html5 && window.history && "onpopstate" in window ){
	    this.ssr = ssr;
	    dom.on( document.body, "click", function(ev){
	      var target = ev.target, href;
	      if(target.getAttribute('data-autolink') != null){
	        ev.preventDefault();
	        href = dom.attr(target, 'href');
	        self.nav(href);
	      }
	    });
	  }
	  oldStart.call(this, options, callback)
	  return this;
	}
	
	so.state = function(name, config){
	  var manager = this;
	  var oldConfig;
	  if( typeof name === 'string'){
	    if(!config) return oldStateFn.call(this, name)
	    oldConfig = config;
	
	    // 不代理canEnter事件, 因为此时component还不存在
	    // mount (if not installed, install first)
	    
	    // 1. .Null => a.b.c
	    // canEnter a  -> canEnter a.b -> canEnter a.b.c -> 
	    //  -> install a ->enter a -> mount a 
	    //  -> install a.b -> enter a.b -> mount a.b 
	    //  -> install a.b.c -> enter a.b.c -> mount a.b.c
	
	
	    // 2. update a.b.c
	    // -> install a -> mount a 
	    // -> install a.b -> mount a.b 
	    // -> install a.b.c -> mount a.b.c
	
	    // 3. a.b.c -> a.b.d
	    // canLeave c -> canEnter d -> leave c 
	    //  -> install a -> mount a -> 
	    //  -> install b -> mount b -> 
	    //  -> install d -> enter d -> mount d
	
	    function install( option , isEnter){
	      var component = this.component;
	      var parent = this.parent;
	      var self = this;
	      var ssr = option.ssr = isEnter && option.firstTime && manager.ssr && this.ssr !== false;
	
	      var installOption = {
	        ssr: ssr,
	        state: this,
	        param: option.param,
	        component: component,
	        originOption: option
	      }
	      var installPromise = manager.install( installOption ).then( function( installed ){
	
	        var globalView = manager.view, view, ret;
	        var Component = installed.Component;
	        var needComponent = !component || component.constructor !== Component;
	
	        if(parent.component){
	          view = parent.component.$viewport;
	          if(!view) throw Error(self.parent.name + " should have a element with [r-view]");
	        }else{
	          view = globalView;
	        }
	
	        if(!view) throw Error('need viewport for ' + self.name );
	
	        if( needComponent ){
	          // 这里需要给出提示
	          if(component) component.destroy();
	          var mountNode = ssr && view;
	
	          component = self.component = new Component({
	            mountNode: mountNode,
	            data: _.extend({}, installed.data),
	            $state: manager
	          })
	        }else{
	          _.extend( component.data, installed.data, true)
	        }
	        if( (needComponent && !mountNode) || (!needComponent && isEnter) ) component.$inject(view);
	        return component;
	      })
	      if(isEnter){
	        installPromise = installPromise.then(function(){
	          return _.proxyMethod(self.component, 'enter', option)
	        })
	      }
	      return installPromise.then( self.mount.bind( self, option ) ).then(function(){
	        self.component.$update(function(){
	          self.component.$mute(false)
	        });
	      })
	    }
	
	
	    config = {
	      component: null,
	      install: install,
	      mount: function( option ){
	        return _.proxyMethod(this.component, 'mount', option)
	      },
	      canEnter: function(option){
	        return _.proxyMethod(this, oldConfig.canEnter, option )
	      },
	      canLeave: function(option){
	        return _.proxyMethod(this.component, 'canEnter', option)
	      },
	      update: function(option){
	        return this.install(option, false);
	      },
	      enter: function(option){
	        return this.install(option, true);
	      },
	      leave: function( option ){
	        var component = this.component;
	        if(!component) return;
	
	        return Promise.resolve().then(function(){
	          return _.proxyMethod(component, 'leave', option)
	        }).then(function(){
	          component.$inject(false);
	          component.$mute(true);
	        })
	      }
	    }
	    _.extend(config, oldConfig, true)
	    
	  }
	  return oldStateFn.call(this, name, config)    
	}
	
	
	
	module.exports = Restate;
	
	


/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	var stateman;
	
	if( typeof window === 'object' ){
	  stateman = __webpack_require__(49);
	  stateman.History = __webpack_require__(50);
	  stateman.util = __webpack_require__(23);
	  stateman.isServer = false;
	}else{
	  stateman = __webpack_require__(22);
	  stateman.isServer = true;
	}
	
	
	stateman.State = __webpack_require__(25);
	
	module.exports = stateman;


/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	
	var State = __webpack_require__(25),
	  History = __webpack_require__(50),
	  Base = __webpack_require__(24),
	  _ = __webpack_require__(23),
	  baseTitle = document.title,
	  stateFn = State.prototype.state;
	
	function StateMan(options){
	
	  if(this instanceof StateMan === false){ return new StateMan(options); }
	  options = options || {};
	  Base.call(this, options);
	  if(options.history) this.history = options.history;
	  this._stashCallback = [];
	  this.current = this.active = this;
	  // auto update document.title, when navigation has been down
	  this.on("end", function( options ){
	    var cur = this.current;
	    document.title = cur.getTitle( options ) ||  baseTitle  ;
	  });
	}
	
	var o =_.inherit( StateMan, Base.prototype );
	
	_.extend(o , {
	
	    start: function(options, callback){
	
	      this._startCallback = callback;
	      if( !this.history ) this.history = new History(options); 
	      if( !this.history.isStart ){
	        this.history.on("change", _.bind(this._afterPathChange, this));
	        this.history.start();
	      } 
	      return this;
	
	    },
	    stop: function(){
	      this.history.stop();
	    },
	    // @TODO direct go the point state
	    go: function(state, option, callback){
	      option = option || {};
	      var statename;
	      if(typeof state === "string") {
	         statename = state;
	         state = this.state(state);
	      }
	
	      if(!state) return this._notfound({state:statename});
	
	      if(typeof option === "function"){
	        callback = option;
	        option = {};
	      }
	
	      if(option.encode !== false){
	        var url = state.encode(option.param);
	        option.path = url;
	        this.nav(url, {silent: true, replace: option.replace});
	      }
	
	      this._go(state, option, callback);
	
	      return this;
	    },
	    nav: function(url, options, callback){
	      if(typeof options === "function"){
	        callback = options;
	        options = {};
	      }
	      options = options || {};
	
	      options.path = url;
	
	      this.history.nav( url, _.extend({silent: true}, options));
	      if(!options.silent) this._afterPathChange( _.cleanPath(url) , options , callback);
	
	      return this;
	    },
	
	    // after pathchange changed
	    // @TODO: afterPathChange need based on decode
	    _afterPathChange: function(path, options ,callback){
	
	      this.emit("history:change", path);
	
	      var found = this.decode(path);
	
	      options = options || {};
	
	      options.path = path;
	
	      if(!found){
	        return this._notfound(options);
	      }
	
	      options.param = found.param;
	
	      if( options.firstTime && !callback){
	        callback =  this._startCallback;
	        delete this._startCallback;
	      }
	
	      this._go( found.state, options, callback );
	    },
	    _notfound: function(options){
	
	
	      return this.emit("notfound", options);
	    },
	    // goto the state with some option
	    _go: function(state, option, callback){
	
	      var over;
	
	  
	
	      if(state.hasNext && this.strict) return this._notfound({name: state.name});
	
	  
	      option.param = option.param || {};
	
	      var current = this.current,
	        baseState = this._findBase(current, state),
	        prepath = this.path,
	        self = this;
	
	
	      if( typeof callback === "function" ) this._stashCallback.push(callback);
	      // if we done the navigating when start
	      function done(success){
	        over = true;
	        if( success !== false ) self.emit("end", option);
	        self.pending = null;
	        self._popStash(option);
	      }
	      
	      option.previous = current;
	      option.current = state;
	
	      if(current !== state){
	        option.stop = function(){
	          done(false);
	          self.nav( prepath? prepath: "/", {silent:true});
	        };
	        self.emit("begin", option);
	
	      }
	      // if we stop it in 'begin' listener
	      if(over === true) return;
	
	      option.phase = 'permission';
	      this._walk(current, state, option, true , _.bind( function( notRejected ){
	
	        if( notRejected===false ){
	          // if reject in callForPermission, we will return to old 
	          prepath && this.nav( prepath, {silent: true});
	
	          done(false, 2);
	
	          return this.emit('abort', option);
	
	        } 
	
	        // stop previous pending.
	        if(this.pending) this.pending.stop();
	        this.pending = option;
	        this.path = option.path;
	        this.current = option.current;
	        this.param = option.param;
	        this.previous = option.previous;
	        option.phase = 'navigation';
	        this._walk(current, state, option, false, _.bind(function( notRejected ){
	
	          if( notRejected === false ){
	            this.current = this.active;
	            done(false);
	            return this.emit('abort', option);
	          }
	
	
	          this.active = option.current;
	
	          option.phase = 'completion';
	          return done();
	
	        }, this) );
	
	      }, this) );
	
	
	    },
	    _popStash: function(option){
	
	      var stash = this._stashCallback, len = stash.length;
	
	      this._stashCallback = [];
	
	      if(!len) return;
	
	      for(var i = 0; i < len; i++){
	        stash[i].call(this, option);
	      }
	    },
	
	    // the transition logic  Used in Both canLeave canEnter && leave enter LifeCycle
	
	    _walk: function(from, to, option, callForPermit , callback){
	      // if(from === to) return callback();
	
	      // nothing -> app.state
	      var parent = this._findBase(from , to);
	      var self = this;
	
	
	      option.backward = true;
	      this._transit( from, parent, option, callForPermit , function( notRejected ){
	
	        if( notRejected === false ) return callback( notRejected );
	
	        // only actual transiton need update base state;
	        option.backward = false;
	        self._walkUpdate(self, parent, option, callForPermit, function(notRejected){
	          if(notRejected === false) return callback(notRejected);
	
	          self._transit( parent, to, option, callForPermit,  callback);
	
	        });
	
	      });
	
	    },
	
	    _transit: function(from, to, option, callForPermit, callback){
	      //  touch the ending
	      if( from === to ) return callback();
	
	      var back = from.name.length > to.name.length;
	      var method = back? 'leave': 'enter';
	      var applied;
	
	      // use canEnter to detect permission
	      if( callForPermit) method = 'can' + method.replace(/^\w/, function(a){ return a.toUpperCase(); });
	
	      var loop = _.bind(function( notRejected ){
	
	
	        // stop transition or touch the end
	        if( applied === to || notRejected === false ) return callback(notRejected);
	
	        if( !applied ) {
	
	          applied = back? from : this._computeNext(from, to);
	
	        }else{
	
	          applied = this._computeNext(applied, to);
	        }
	
	        if( (back && applied === to) || !applied )return callback( notRejected );
	
	        this._moveOn( applied, method, option, loop );
	
	      }, this);
	
	      loop();
	    },
	
	    _moveOn: function( applied, method, option, callback){
	
	      var isDone = false;
	      var isPending = false;
	
	      option.async = function(){
	
	        isPending = true;
	
	        return done;
	      };
	
	      function done( notRejected ){
	        if( isDone ) return;
	        isPending = false;
	        isDone = true;
	        callback( notRejected );
	      }
	
	      option.stop = function(){
	        done( false );
	      };
	
	
	      this.active = applied;
	      var retValue = applied[method]? applied[method]( option ): true;
	
	      if(method === 'enter') applied.visited = true;
	      // promise
	      // need breadk , if we call option.stop first;
	
	      if( _.isPromise(retValue) ){
	
	        return this._wrapPromise(retValue, done); 
	
	      }
	
	      // if haven't call option.async yet
	      if( !isPending ) done( retValue );
	
	    },
	
	
	    _wrapPromise: function( promise, next ){
	
	      return promise.then( next, function(err){ 
	        //TODO: 万一promise中throw了Error如何处理？
	        if(err instanceof Error) throw err;
	        next(false); 
	      }) ;
	
	    },
	
	    _computeNext: function( from, to ){
	
	      var fname = from.name;
	      var tname = to.name;
	
	      var tsplit = tname.split('.');
	      var fsplit = fname.split('.');
	
	      var tlen = tsplit.length;
	      var flen = fsplit.length;
	
	      if(fname === '') flen = 0;
	      if(tname === '') tlen = 0;
	
	      if( flen < tlen ){
	        fsplit[flen] = tsplit[flen];
	      }else{
	        fsplit.pop();
	      }
	
	      return this.state(fsplit.join('.'));
	
	    },
	
	    _findQuery: function(querystr){
	
	      var queries = querystr && querystr.split("&"), query= {};
	      if(queries){
	        var len = queries.length;
	        for(var i =0; i< len; i++){
	          var tmp = queries[i].split("=");
	          query[tmp[0]] = tmp[1];
	        }
	      }
	      return query;
	
	    },
	
	    _sortState: function( a, b ){
	      return ( b.priority || 0 ) - ( a.priority || 0 );
	    },
	    // find the same branch;
	    _findBase: function(now, before){
	
	      if(!now || !before || now == this || before == this) return this;
	      var np = now, bp = before, tmp;
	      while(np && bp){
	        tmp = bp;
	        while(tmp){
	          if(np === tmp) return tmp;
	          tmp = tmp.parent;
	        }
	        np = np.parent;
	      }
	    },
	    // check the query and Param
	    _walkUpdate: function(baseState, to, options, callForPermit,  done){
	
	      var method = callForPermit? 'canUpdate': 'update';
	      var from = baseState;
	      var self = this;
	
	      var pathes = [], node = to;
	      while(node !== this){
	        pathes.push( node );
	        node = node.parent;
	      }
	
	      var loop = function( notRejected ){
	        if( notRejected === false ) return done( false );
	        if( !pathes.length ) return done();
	        from = pathes.pop();
	        self._moveOn( from, method, options, loop )
	      }
	
	      self._moveOn( from, method, options, loop )
	    }
	
	}, true);
	
	module.exports = StateMan;


/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	
	// MIT
	// Thx Backbone.js 1.1.2  and https://github.com/cowboy/jquery-hashchange/blob/master/jquery.ba-hashchange.js
	// for iframe patches in old ie.
	
	var browser = __webpack_require__(51);
	var _ = __webpack_require__(23);
	
	
	// the mode const
	var QUIRK = 3,
	  HASH = 1,
	  HISTORY = 2;
	
	// extract History for test
	// resolve the conficlt with the Native History
	function History(options){
	  options = options || {};
	
	  // Trick from backbone.history for anchor-faked testcase
	  this.location = options.location || browser.location;
	
	  // mode config, you can pass absolute mode (just for test);
	  this.html5 = options.html5;
	  this.mode = options.html5 && browser.history ? HISTORY: HASH;
	  if( !browser.hash ) this.mode = QUIRK;
	  if(options.mode) this.mode = options.mode;
	
	  // hash prefix , used for hash or quirk mode
	  this.prefix = "#" + (options.prefix || "") ;
	  this.rPrefix = new RegExp(this.prefix + '(.*)$');
	  this.interval = options.interval || 66;
	
	  // the root regexp for remove the root for the path. used in History mode
	  this.root = options.root ||  "/" ;
	  this.rRoot = new RegExp("^" +  this.root);
	
	
	  this.autolink = options.autolink!==false;
	  this.autofix = options.autofix!==false;
	
	  this.curPath = undefined;
	}
	
	_.extend( _.emitable(History), {
	  // check the
	  start: function(callback){
	    var path = this.getPath();
	    this._checkPath = _.bind(this.checkPath, this);
	
	    if( this.isStart ) return;
	    this.isStart = true;
	
	    if(this.mode === QUIRK){
	      this._fixHashProbelm(path);
	    }
	
	    switch ( this.mode ){
	      case HASH:
	        browser.on(window, "hashchange", this._checkPath);
	        break;
	      case HISTORY:
	        browser.on(window, "popstate", this._checkPath);
	        break;
	      case QUIRK:
	        this._checkLoop();
	    }
	    // event delegate
	    this.autolink && this._autolink();
	    this.autofix && this._fixInitState();
	
	    this.curPath = path;
	
	    this.emit("change", path, { firstTime: true});
	  },
	
	  // the history teardown
	  stop: function(){
	
	    browser.off(window, 'hashchange', this._checkPath);
	    browser.off(window, 'popstate', this._checkPath);
	    clearTimeout(this.tid);
	    this.isStart = false;
	    this._checkPath = null;
	  },
	
	  // get the path modify
	  checkPath: function(/*ev*/){
	
	    var path = this.getPath(), curPath = this.curPath;
	
	    //for oldIE hash history issue
	    if(path === curPath && this.iframe){
	      path = this.getPath(this.iframe.location);
	    }
	
	    if( path !== curPath ) {
	      this.iframe && this.nav(path, {silent: true});
	      this.curPath = path;
	      this.emit('change', path);
	    }
	  },
	
	  // get the current path
	  getPath: function(location){
	    location = location || this.location;
	    var tmp;
	
	    if( this.mode !== HISTORY ){
	      tmp = location.href.match(this.rPrefix);
	      return _.cleanPath(tmp && tmp[1]? tmp[1]: "");
	
	    }else{
	      return _.cleanPath(( location.pathname + location.search || "" ).replace( this.rRoot, "/" ));
	    }
	  },
	
	  nav: function(to, options ){
	
	    var iframe = this.iframe;
	
	    options = options || {};
	
	    to = _.cleanPath(to);
	
	    if(this.curPath == to) return;
	
	    // pushState wont trigger the checkPath
	    // but hashchange will
	    // so we need set curPath before to forbit the CheckPath
	    this.curPath = to;
	
	    // 3 or 1 is matched
	    if( this.mode !== HISTORY ){
	      this._setHash(this.location, to, options.replace);
	      if( iframe && this.getPath(iframe.location) !== to ){
	        if(!options.replace) iframe.document.open().close();
	        this._setHash(this.iframe.location, to, options.replace);
	      }
	    }else{
	      this._changeState(this.location, options.title||"", _.cleanPath( this.root + to ), options.replace )
	    }
	
	    if( !options.silent ) this.emit('change', to);
	  },
	  _autolink: function(){
	    if(this.mode!==HISTORY) return;
	    // only in html5 mode, the autolink is works
	    // if(this.mode !== 2) return;
	    var self = this;
	    browser.on( document.body, "click", function(ev){
	
	      var target = ev.target || ev.srcElement;
	      if( target.tagName.toLowerCase() !== "a" ) return;
	      var tmp = browser.isSameDomain(target.href)&&(browser.getHref(target)||"").match(self.rPrefix);
	
	      var hash = tmp && tmp[1]? tmp[1]: "";
	
	      if(!hash) return;
	
	      ev.preventDefault && ev.preventDefault();
	      self.nav( hash );
	      return (ev.returnValue = false);
	    } );
	  },
	  _setHash: function(location, path, replace){
	    var href = location.href.replace(/(javascript:|#).*$/, '');
	    if (replace){
	      location.replace(href + this.prefix+ path);
	    }
	    else location.hash = this.prefix+ path;
	  },
	  // for browser that not support onhashchange
	  _checkLoop: function(){
	    var self = this;
	    this.tid = setTimeout( function(){
	      self._checkPath();
	      self._checkLoop();
	    }, this.interval );
	  },
	  // if we use real url in hash env( browser no history popstate support)
	  // or we use hash in html5supoort mode (when paste url in other url)
	  // then , history should repara it
	  _fixInitState: function(){
	    var pathname = _.cleanPath(this.location.pathname), hash, hashInPathName;
	
	    // dont support history popstate but config the html5 mode
	    if( this.mode !== HISTORY && this.html5){
	
	      hashInPathName = pathname.replace(this.rRoot, "");
	      if(hashInPathName) this.location.replace(this.root + this.prefix + _.cleanPath(hashInPathName));
	
	    }else if( this.mode === HISTORY /* && pathname === this.root*/){
	
	      hash = this.location.hash.replace(this.prefix, "");
	      if(hash) this._changeState( this.location, document.title, _.cleanPath(this.root + hash));
	    }
	  },
	  // ONLY for test, forbid browser to update 
	  _changeState: function(location, title, path, replace){
	    var history = location.history || window.history;
	    return history[replace? 'replaceState': 'pushState']({}, title , path)
	  },
	  // Thanks for backbone.history and https://github.com/cowboy/jquery-hashchange/blob/master/jquery.ba-hashchange.js
	  // for helping stateman fixing the oldie hash history issues when with iframe hack
	  _fixHashProbelm: function(path){
	    var iframe = document.createElement('iframe'), body = document.body;
	    iframe.src = 'javascript:;';
	    iframe.style.display = 'none';
	    iframe.tabIndex = -1;
	    iframe.title = "";
	    this.iframe = body.insertBefore(iframe, body.firstChild).contentWindow;
	    this.iframe.document.open().close();
	    this.iframe.location.hash = '#' + path;
	  }
	
	});
	
	module.exports = History;


/***/ },
/* 51 */
/***/ function(module, exports) {

	var win = window,
	    doc = document;
	
	module.exports = {
	  hash: "onhashchange" in win && (!doc.documentMode || doc.documentMode > 7),
	  history: win.history && "onpopstate" in win,
	  location: win.location,
	  isSameDomain: function(url){
	    var matched = url.match(/^.*?:\/\/([^/]*)/);
	    if(matched){
	      return matched[0] == this.location.origin;
	    }
	    return true;
	  },
	  getHref: function(node){
	    return "href" in node ? node.getAttribute("href", 2) : node.getAttribute("href");
	  },
	  on: "addEventListener" in win ?  // IE10 attachEvent is not working when binding the onpopstate, so we need check addEventLister first
	      function(node,type,cb){return node.addEventListener( type, cb )}
	    : function(node,type,cb){return node.attachEvent( "on" + type, cb )},
	
	  off: "removeEventListener" in win ? 
	      function(node,type,cb){return node.removeEventListener( type, cb )}
	    : function(node,type,cb){return node.detachEvent( "on" + type, cb )}
	}


/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	
	var Regular = __webpack_require__(27);
	// Backbone.js Trick for mock the location service
	function loc(href){
	  var a = document.createElement('a');
	  return ({
	    replace: function(href) {
	      a.href = href;
	      Regular.util.extend(this, {
	        href: a.href,
	        hash: a.hash,
	        host: a.host,
	        fragment: a.fragment,
	        pathname: a.pathname,
	        search: a.search
	      }, true)
	      if (!/^\//.test(this.pathname)) this.pathname = '/' + this.pathname;
	      return this;
	    },
	    history: {
	      replaceState: function(obj, title, path){
	        a.href = path
	      },
	      pushState: function(obj, title, path){
	        a.href = path
	      }
	    }
	  }).replace(href)
	}
	
	module.exports = loc;

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	var Regular = __webpack_require__(27);
	module.exports = {
	  "blog": {
	    dataProvider: {
	
	      "app.index": function(option, resolve){
	        resolve({
	          title: 'Hello Index'
	        })
	      },
	      "app.blog": function(){
	        return {
	          title: 'Hello Blog',
	        }
	      },
	      "app.blog.detail": function(option){
	        var param = option.param;
	        return {
	          content: 'Blog Content Here'+param.rid
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
	          template: '<div r-view ></div>'
	        })
	      },
	      'app.index': {
	        view: Regular.extend({
	          template: 
	            '<div>\
	              <h2 class="index">{title}</h2>\
	              <div r-view ></div>\
	            </div>'
	        })
	
	      },
	      'app.blog': {
	        view: Regular.extend({
	          template: 
	            '<div>\
	              <h2 class="hook">{title}</h2>\
	              <div r-view ></div>\
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
	            '<div class="detail">{content}</div>'
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
	        ssr: false,
	        view: Regular.extend({
	          template: "<div class='onlybrowser'>onlybrowser</div>"
	        })
	      }
	    }
	  }
	}

/***/ }
/******/ ]);
//# sourceMappingURL=spec.pack.js.map