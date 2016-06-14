var Regular = require('regularjs');
var u = require('./util');
var extend = u.extend;

var extension = require('./extension');

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

