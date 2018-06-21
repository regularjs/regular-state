
var Regular = require('regularjs');

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