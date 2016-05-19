
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
  extend: Regular.util.extend
}



module.exports = util;