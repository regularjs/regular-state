var Regular = require('regularjs');
var u = require('./util');
var extend = u.extend;
var win = typeof window !== 'undefined' && window;

var extension = require('./extension');

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

