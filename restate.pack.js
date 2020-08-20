(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("Regular"));
	else if(typeof define === 'function' && define.amd)
		define(["Regular"], factory);
	else if(typeof exports === 'object')
		exports["restate"] = factory(require("Regular"));
	else
		root["restate"] = factory(root["Regular"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_2__) {
return /******/ (function(modules) { // webpackBootstrap
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
/***/ (function(module, exports, __webpack_require__) {

	
	
	module.exports = __webpack_require__(1);
	


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	var Regular = __webpack_require__(2);
	var Stateman = __webpack_require__(3);
	var _ = __webpack_require__(11);
	var dom =Regular.dom;
	
	var createRestate = __webpack_require__(12);
	
	var Restate = createRestate( Stateman );
	var so = Restate.prototype;
	
	
	var oldStateFn = so.state;
	var oldStart = so.start;
	
	function destroyState(manager) {
	  manager.stop();
	  walkState(manager, (state) => {
	    if (state.component &&
	        typeof state.component.destroy === 'function' &&
	        state.component.$phase !== 'destroyed'
	    ) {
	      state.component.destroy();
	    }
	  });
	}
	
	function walkState(state, fn) {
	  let states = state._states;
	
	  if (state.hasNext) {
	    for (let i in states) {
	      if (states.hasOwnProperty(i)) {
	        walkState(states[i], fn);
	      }
	    }
	  }
	
	  fn(state);
	}
	
	so.destroy = function() {
	  destroyState(this);
	}
	
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
	    // dom.on( document.body, "click", function(ev){
	    //   var target = ev.target, href;
	    //   if(target.getAttribute('data-autolink') != null){
	    //     ev.preventDefault();
	    //     href = dom.attr(target, 'href');
	    //     self.nav(href);
	    //   }
	    // });
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
	
	      if(component && component.$phase === 'destroyed' ){
	        component = null;
	      }
	
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
	        }else{
	          view = globalView;
	        }
	
	        // if(!view) throw Error('need viewport for ' + self.name );
	
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
	        return _.proxyMethod(this.component, 'canLeave', option)
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


/***/ }),
/* 2 */
/***/ (function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	var stateman;
	
	if( typeof window === 'object' ){
	  stateman = __webpack_require__(4);
	  stateman.History = __webpack_require__(7);
	  stateman.util = __webpack_require__(6);
	  stateman.isServer = false;
	}else{
	  stateman = __webpack_require__(10);
	  stateman.isServer = true;
	}
	
	
	stateman.State = __webpack_require__(5);
	
	module.exports = stateman;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	
	var State = __webpack_require__(5),
	  History = __webpack_require__(7),
	  Base = __webpack_require__(9),
	  _ = __webpack_require__(6),
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


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(6);
	
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
	
	      var sec = param[capture]; 
	      var stype = typeof sec;
	      if(stype === 'boolean' || stype === 'number') sec = ''+sec;
	      sec = sec || '';
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


/***/ }),
/* 6 */
/***/ (function(module, exports) {

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


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

	
	// MIT
	// Thx Backbone.js 1.1.2  and https://github.com/cowboy/jquery-hashchange/blob/master/jquery.ba-hashchange.js
	// for iframe patches in old ie.
	
	var browser = __webpack_require__(8);
	var _ = __webpack_require__(6);
	
	
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


/***/ }),
/* 8 */
/***/ (function(module, exports) {

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


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

	
	var State = __webpack_require__(5),
	  _ = __webpack_require__(6),
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
	


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

	
	var _ = __webpack_require__(6);
	var Base = __webpack_require__(9);
	
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

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

	
	var Regular = __webpack_require__(2);
	
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

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

	var Regular = __webpack_require__(2);
	var u = __webpack_require__(11);
	var extend = u.extend;
	var win = typeof window !== 'undefined' && window;
	
	var extension = __webpack_require__(13);
	
	if(!Regular.isRegular){
	  Regular.isRegular = function( Comp ){
	    return  Comp.prototype instanceof Regular;
	  }
	}
	
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
	      var ret,  state = option.state;
	      var firstData = this.firstData;
	
	      if(option.ssr){ //证明首次服务端渲染后的初始化
	        var type = typeof firstData;
	
	        if( type === 'string' ){
	          ret = win[ firstData ][ state.name ];
	        }
	        if(type === 'function'){
	          ret = u.proxyMethod( this, 'firstData', option );
	        }
	      }
	
	      if( ret ) return u.normPromise( ret );
	
	      return u.proxyMethod(state, 'data', option)
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
	


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(11);
	var Regular = __webpack_require__(2);
	var dom = Regular.dom;
	
	
	function handleUrl(url, history){
	  return history.mode === 2? url : history.prefix + url
	}
	
	module.exports = function( stateman  ){
	
	  function getParam(name, context){
	    if(typeof name !== 'string' || name.toLowerCase().trim() === ''){
	      return null
	    }else{
	      return context.$get(name);
	    }
	  }
	
	  Regular.directive({
	    'r-view': {
	      link: function(element){
	        this.$root.$viewport = element;
	      },
	      ssr: function( attr ){
	        return 'r-view'
	      }
	    },
	    'r-link': {
	      nps: true,
	      link: function(element, value){
	
	        // use html5 history
	        var currentLink;
	        if(stateman.history.mode === 2){
	          dom.attr(element, 'data-autolink', 'data-autolink');
	          if(stateman.history.mode === 2){
	            dom.on(element, 'click', function(ev){
	              ev.preventDefault();
	              stateman.nav(currentLink)
	            })
	          }
	        }
	        //  r-link = {Expression}
	        if(value && value.type === 'expression'){
	          
	          this.$watch( value, function( val){
	            currentLink = val;
	            dom.attr(element, 'href', 
	              handleUrl(
	                val,
	                stateman.history
	              )
	            )
	          })
	          return;
	        }
	        // link='String'
	        var parsedLinkExpr = _.extractState(value);
	
	        if(parsedLinkExpr){ // r-link = 'app.blog(...arg)'
	
	          var param = parsedLinkExpr.param;
	          if(param.trim() === '' ){ //r-link = 'app.blog()'
	            value = stateman.encode(parsedLinkExpr.name)
	            currentLink = value;
	          }else{ // r-link = 'app.blog({name:1})'
	            this.$watch( parsedLinkExpr.param, function(param){
	              currentLink = stateman.encode(parsedLinkExpr.name, param);
	              dom.attr(element, 'href', 
	                handleUrl(
	                  currentLink,
	                  stateman.history
	                )
	              )
	            } , {deep: true} )
	            return ;
	          }
	        }else{
	          currentLink = value;
	        }
	
	        dom.attr(element, 'href', 
	          handleUrl(
	            value,
	            stateman.history
	          )
	        )
	      },
	      ssr: function( value, tag ){
	
	        if(value && value.type === 'expression'){
	          return 'href="' + Regular.util.escape(getParam(value,this)) +  '"' 
	        }
	        var parsedLinkExpr = _.extractState(value);
	
	        if(parsedLinkExpr){
	          var param = getParam(parsedLinkExpr.param, this);
	          return 'href="' + stateman.encode(parsedLinkExpr.name, param)+ '"' 
	        }else{
	        }
	      }
	    }
	  })
	}
	
	


/***/ })
/******/ ])
});
;
//# sourceMappingURL=restate.pack.js.map