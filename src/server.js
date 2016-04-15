

var stateman = require('stateman/src/manager/server');
var Regular = require('regularjs');
var SSR = require('regularjs/src/render/server.js');
var global = typeof window !== 'undefined'? window: global;





function isPromise(obj){
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}


function Server( options ){
  if( !(this instanceof Server)) return new Server(options)
  stateman.call(this, options);
  this.dataProvider = options.dataProvider;
}


var so = Server.prototype =  Object.create(stateman.prototype) 

so.install = function( option ){
  var type = typeof  this.dataProvider, ret,  
    state = option.state;
  option.server = true;
  if( type === 'function' ){
    ret = this.dataProvider( option );
  }
  if(type === 'object'){
    var dataProvider = this.dataProvider[state.name];
    ret = dataProvider && dataProvider(option);
  }
  ret =  this._normPromise(ret)
  return ret;
}

so._normPromise = function(ret){
  if( isPromise(ret) ){
    return ret
  }else{
    return Promise.resolve(ret);
  }
}

so.run = function(path){
  var executed = this.exec(path);
  var self = this;
  if(!executed){
    return Promise.reject();
  }else{
    var param = executed.param;
    var promises = executed.states.map(function(state){
      var Component = state.view;
      return new Promise(function( resolve, reject ){

        return self.install({
          state: state,
          param: param

        }).then(function( data ){
          var html = SSR.render( Component, {data: data, $state: self } )
          resolve( {
            name: state.name,
            html: html,
            data: data
          });
        })['catch'](reject)

      })
      // if( typeof Component === 'function' && !( Component instanceof Regular ) ){
      //   var delayComponent = Component({param: executed.param});
      //   delayComponent.then(function(Compo){

      //   })['catch'](function(){})
      // }
    })


    return Promise.all( promises).then(function( rendereds ){

      var retView,  data = {};
      for(var len = rendereds.length, i = 0; i < len-1; i++ ){

        var rendered = rendereds[i], nextRendered = rendereds[i + 1];

        if(i ===0){
          retView = rendereds[i].html;
          data[rendered.name] = rendered.data
        }
        // <rg-view/> 或者 <rg-view></rg-view> 
        retView = retView.replace(/rg-view([^>]*\>)/, function(all ,capture){

          return capture + nextRendered.html;
        } )
        data[nextRendered.name] = nextRendered.data
      }
      return Promise.resolve( {
        html: retView,
        data: data
      } )
    })
  }
}





module.exports =  Server;