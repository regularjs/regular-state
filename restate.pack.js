(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("Regular"));
	else if(typeof define === 'function' && define.amd)
		define(["Regular"], factory);
	else if(typeof exports === 'object')
		exports["restate"] = factory(require("Regular"));
	else
		root["restate"] = factory(root["Regular"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__) {
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
/***/ function(module, exports, __webpack_require__) {

	var Regular= __webpack_require__(1);
	
	
	var Restate;
	
	
	if(  Regular.env.browser !== true ){
	  Restate = __webpack_require__(2); 
	}else{
	  Restate = __webpack_require__(24);
	}
	
	
	
	module.exports = Restate;
	
	Restate.Regular= Regular;
	


/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	
	var SSR = __webpack_require__(3);
	var Stateman = __webpack_require__(17);
	var u = __webpack_require__(21);
	
	var createRestate = __webpack_require__(22);
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
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	// server side rendering for regularjs
	
	
	var _ = __webpack_require__(4);
	var parser = __webpack_require__(10);
	var diffArray = __webpack_require__(15).diffArray;
	var shared = __webpack_require__(16);
	
	
	
	
	
	
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
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, setImmediate) {__webpack_require__(7)();
	
	
	
	var _  = module.exports;
	var entities = __webpack_require__(8);
	var slice = [].slice;
	var o2str = ({}).toString;
	var win = typeof window !=='undefined'? window: global;
	var config = __webpack_require__(9);
	
	
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
	
	
	
	
	
	
	
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(5).setImmediate))

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(setImmediate, clearImmediate) {var nextTick = __webpack_require__(6).nextTick;
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
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5).setImmediate, __webpack_require__(5).clearImmediate))

/***/ },
/* 6 */
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
/* 7 */
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
/* 8 */
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
/* 9 */
/***/ function(module, exports) {

	
	module.exports = {
	  'BEGIN': '{',
	  'END': '}',
	  'PRECOMPILE': false
	}

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var exprCache = __webpack_require__(11).exprCache;
	var _ = __webpack_require__(4);
	var Parser = __webpack_require__(12);
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
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {// some fixture test;
	// ---------------
	var _ = __webpack_require__(4);
	exports.svg = (function(){
	  return typeof document !== "undefined" && document.implementation.hasFeature( "http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1" );
	})();
	
	
	exports.browser = typeof document !== "undefined" && document.nodeType;
	// whether have component in initializing
	exports.exprCache = _.cache(1000);
	exports.node = typeof process !== "undefined" && ( '' + process ) === '[object process]';
	exports.isRunning = false;
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6)))

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(4);
	
	var config = __webpack_require__(9);
	var node = __webpack_require__(13);
	var Lexer = __webpack_require__(14);
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
/* 13 */
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
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(4);
	var config = __webpack_require__(9);
	
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
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(4);
	
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
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(4);
	var config = __webpack_require__(9);
	var parse = __webpack_require__(10);
	var node = __webpack_require__(13);
	
	
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
	
	
	function prepareAttr ( ast ,directive){
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
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	
	var _ = __webpack_require__(18);
	var Base = __webpack_require__(19);
	
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
/* 18 */
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
	
	_.values = function( o){
	  var keys = [];
	  for(var i in o) if( o.hasOwnProperty(i) ){
	    keys.push( o[i] );
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
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	
	var State = __webpack_require__(20),
	  _ = __webpack_require__(18),
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
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(18);
	
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
	      for(var j in stateName){
	        this.state(j, stateName[j]);
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
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	
	var Regular = __webpack_require__(1);
	
	var util = {
	  isPromiseLike: function (obj){
	    return !!obj && 
	      (typeof obj === 'object' || typeof obj === 'function') 
	      && typeof obj.then === 'function';
	  },
	  normPromise: function ( ret ){
	    return util.isPromiseLike(ret) ? ret: Promise.resolve(ret)
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
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var Regular = __webpack_require__(1);
	var u = __webpack_require__(21);
	var extend = u.extend;
	
	var extension = __webpack_require__(23);
	
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
	
	      option.server = !Regular.env.browser;
	
	      if( type === 'function' ){
	        ret = this.dataProvider( option );
	      }else if(type === 'object'){
	        var dataProvider = this.dataProvider[ state.name];
	        ret = dataProvider && dataProvider.call(this, option);
	      }
	
	      return u.normPromise( ret )
	    },
	    installView: function( option ){
	      var  state = option.state ,Comp = state.view;
	      // if(typeof Comp !== 'function') throw Error('view of [' + state.name + '] with wrong type')
	      // Lazy load
	      if(state.ssr === false && Regular.env.node ) {
	        Comp = undefined;
	      } else if( !(Comp.prototype instanceof Regular) ){
	        Comp = Comp.call(this, option);
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
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(21);
	var Regular = __webpack_require__(1);
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
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	var Regular = __webpack_require__(1);
	var Stateman = __webpack_require__(25);
	var _ = __webpack_require__(21);
	var dom =Regular.dom;
	
	var createRestate = __webpack_require__(22);
	
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
	  if( ssr && window.history && "onpopstate" in window ){
	    this.ssr = true;
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
	  var oldConfig, Component;
	  if( typeof name === 'string'){
	    if(!config) return oldStateFn.call(this, name)
	    oldConfig = config;
	    Component = oldConfig.view;
	
	    config = {
	      component: null,
	      enter: function( option ){
	        var globalView = manager.view;
	        var component = this.component;
	        var parent = this.parent, view;
	        var self = this;
	        var noComponent = !component || component.$phase === 'destroyed';
	        var ssr = option.ssr = option.firstTime && manager.ssr && this.ssr !== false;
	
	        var installOption = {
	          state: this,
	          ssr: ssr,
	          param: option.param,
	          component: component
	        }
	
	        return manager.install( installOption ).then( function( installed ){
	
	          Component = installed.Component;
	          if(parent.component){
	            view = parent.component.$viewport;
	            if(!view) throw self.parent.name + " should have a element with [r-view]";
	          }else{
	            view = globalView;
	          }
	
	          if( noComponent ){
	            // 这里需要给出提示
	            var mountNode = ssr && view;
	            component = self.component = new Component({
	              mountNode: mountNode,
	              data: _.extend({}, installed.data),
	              $state: manager
	            })
	          }else{
	            _.extend( component.data, installed.data, true)
	          }
	
	          if( !mountNode ) component.$inject(view);
	
	          var result = component.enter && component.enter(option);
	
	
	          return result;
	        }).then(function(){
	          component.$update(function(){
	            component.$mute(false);
	          })
	          return true;
	        })
	
	
	      
	      },
	      update: function( option ){
	
	        var component = this.component;
	        if(!component) return;
	
	        return manager.install({
	          component: component,
	          state: this,
	          param: option.param
	        }).then(function(data){
	
	          _.extend( component.data, data.data , true )
	          
	          return component.update && component.update(option);
	
	        }).then(function( ret){
	          component.$update();
	          return ret;
	        })
	
	      },
	      leave: function( option ){
	        var component = this.component;
	        if(!component) return;
	
	        var result = component.leave && component.leave(option);
	
	        component.$inject(false);
	        component.$mute(true);
	
	        return result;
	
	      }
	    }
	    _.extend(config, oldConfig)
	    return oldStateFn.call(this, name, config)    
	  }else{
	    for(var i in name){
	      this.state(i, name[i])
	    }
	    return this;
	  }
	}
	
	
	
	module.exports = Restate;
	


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	var stateman;
	
	if( typeof window === 'object' ){
	  stateman = __webpack_require__(26);
	  stateman.History = __webpack_require__(27);
	  stateman.util = __webpack_require__(18);
	  stateman.isServer = false;
	}else{
	  stateman = __webpack_require__(17);
	  stateman.isServer = true;
	}
	
	
	stateman.State = __webpack_require__(20);
	
	module.exports = stateman;


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	
	var State = __webpack_require__(20),
	  History = __webpack_require__(27),
	  Base = __webpack_require__(19),
	  _ = __webpack_require__(18),
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
	        self._walkUpdate(parent, option, callForPermit, function(notRejected){
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
	    _walkUpdate: function(baseState, options, callForPermit,  done){
	
	      var method = callForPermit? 'canUpdate': 'update';
	      var from = baseState;
	      var self = this;
	
	      if(from === this) return done();
	
	      var loop = function(notRejected){
	        if(notRejected === false) return done(false);
	        from = from.parent;
	        if(from === self) return done();
	        self._moveOn(from, method, options, loop)
	      }
	
	      self._moveOn(from, method, options, loop)
	    }
	
	}, true);
	
	module.exports = StateMan;


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	
	// MIT
	// Thx Backbone.js 1.1.2  and https://github.com/cowboy/jquery-hashchange/blob/master/jquery.ba-hashchange.js
	// for iframe patches in old ie.
	
	var browser = __webpack_require__(28);
	var _ = __webpack_require__(18);
	
	
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
/* 28 */
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


/***/ }
/******/ ])
});
;
//# sourceMappingURL=restate.pack.js.map