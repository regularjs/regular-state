var Regular = require('regularjs');
var u = require('./util');
var extend = u.extend;

require('./extension');

function createRestate( Stateman ){

  function Restate( options ){
    if( !(this instanceof Restate)) return new Restate( options );
    extend(this, options);
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

      return u.normPromise( ret, option)
    },
    installView: function( option ){
      var  state = option.state ,Comp = state.view;
      // if(typeof Comp !== 'function') throw Error('view of [' + state.name + '] with wrong type')
      // Lazy load
      if( !(Comp.prototype instanceof Regular) ){
        Comp = Comp.call(this, option);
      }
      return u.normPromise( Comp, option );
    },
    install: function( option ){
      return Promise.all([this.installData( option ), this.installView( option)]).then(function(ret){
        console.log(ret[1])
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

