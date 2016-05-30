
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