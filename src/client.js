

var stateman = require('stateman');
var _ = stateman.util;

require('./base');


function Client( options ){
  if( !(this instanceof Client)) return new Client(options)
  _.extend(this, options);
  stateman.call(this, options);
}


var so = Client.prototype =  Object.create(stateman.prototype) 

var oldStateFn = so.state;

so.state = function(name, config){
  var manager = this;
  var oldConfig, Component;
  var globalView = this.view;
  if( typeof name === 'string'){

    if(!config) return oldStateFn.call(this, name)
    oldConfig = config;
    Component = oldConfig.view;



    config = {
      component: null,
      enter: function( option ){
        var component = this.component;
        var parent = this.parent, view;
        var self = this;
        var noComponent = !component || component.$phase === 'destroyed';
        var ssr = option.ssr = option.firstTime && manager.ssr;

        return new Promise(function(resolve, reject){
          manager.install({
            ssr: ssr,
            state: self,
            param: option.param,
            data: component && component.data
          }).then(function(data){
            if(parent.component){
              view = parent.component.$viewport;
              if(!view) throw self.parent.name + " should have a element with [rg-view]";
            }else{
              view = globalView;
            }

            if( noComponent ){
              // 这里需要给出提示
              var mountNode = ssr && view;
              component = self.component = new Component({
                mountNode: mountNode,
                data: data,
                $state: manager,
                $stateName: name
              })

            }else{
              _.extend( component.data, data, true)
            }

            if(!mountNode) component.$inject(view);

            var result = component.enter && component.enter(option);

            component.$update(function(){
              component.$mute(false);
            })

            resolve(result)
          }).catch(function(err){
            console.log(err)
            throw err
          })
        })
      },
      update: function( option ){

        var component = this.component;
        if(!component) return;

        manager.install({
          state: this,
          param: option.param
        }).then(function(data){

          _.extend( component.data, data , true )
          
          return component.update && component.update(option);

        }).then(function(){
          component.$update();
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

so.install = function(option){
  var type = typeof  this.dataProvider, ret, state = option.state; 
  if( type === 'function' ){
    ret = this.dataProvider( option );
  }
  if(type === 'object'){
    var dataProvider = this.dataProvider[state.name];
    ret = dataProvider && dataProvider.call(this, option );
  }
  ret =  this._normPromise(ret)
  return ret;
}

so._normPromise = function(ret){
  if( isPromise(ret) ){
    return ret
  } else {
    return Promise.resolve(ret);
  }
}


function isPromise(obj){
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}
 


module.exports = Client;

