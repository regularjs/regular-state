
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['stateman'], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require('stateman'));
    } else {
        // Browser globals (root is window)
        root.restate = factory( root.StateMan);
    }
}(this, function (StateMan) {


  var _ = StateMan.util;


  // get all state match the pattern
  function getMatchStates(stateman, pattern){
    var current = stateman;
    var allStates = [];

    var currentStates = current._states;

    for(var i in currentStates){
      var state = currentStates[i];
      if(pattern.test(state.stateName)) allStates.push( state );
      if(state._states) allStates = allStates.concat(getMatchStates( state, pattern))
    }
    return allStates
  }


  function bindTo(stateman){


    stateman.notify = function(stateName, param){

      var pattern, eventObj, states;

      if(!stateName) return;

      if(~stateName.indexOf('*')){

        pattern = new RegExp(
          stateName
            .replace('.', '\\.')
            .replace(/\*\*|\*/, function(cap){
              if(cap === '**') return '.*';
              else return '[^.]*';
            })
        );

        states = getMatchStates(stateman, pattern);

      }else{
        states = [stateman.state(stateName)];
      }

      states.forEach(function(state){
        if(!state || !state.component ) return;
        state.component.$emit('notify', param);
      })
      return this;
    }

    return function(Component){
      if(!Component || Component.__stateman__) return Component;

      // 
      Component
        .filter({
          encode: function(value, param){
            return stateman.history.prefix + (stateman.encode(value, param || {}) || "");
          }
        })
        .directive({
          // <a href='app.blog({id: $param.id})'
          'r-href': function( element, value ){
            var pattern = /([\w-](\.[\w-])*)\s*\((.*)\)$/
            var test = pattern.exec(value);
          }
        })
        .implement({
          __stateman__: true,
          $notify: stateman.notify
        })
    }

  }

  var restate = function(option){

    option = option || {};

    var stateman = option.stateman || new StateMan(option);
    var preState = stateman.state;
    var BaseComponent = option.Component;
    var globalView = option.view || document.body;

    var linkToComponent = bindTo(stateman);

    linkToComponent(BaseComponent);


    stateman.state = function(name, Component, config){
      if(typeof config === "string"){
        config = {url: config};
      }

      config = config || {};

      // Use global option.rebuild if config.rebuild is not defined.
      if(config.rebuild === undefined) config.rebuild = option.rebuild;

      if(!Component) return preState.call(stateman, name);

      if(BaseComponent){
        // 1. regular template or parsed ast
        if(typeof Component === "string" || Array.isArray( Component )){
          Component = BaseComponent.extend({
            template: Component
          })
        }
        // 2. it an Object, but need regularify
        if(typeof Component === "object" && Component.regularify ){
          Component = BaseComponent.extend( Component );
        }
      }

      // 3. duck check is a Regular Component
      if( Component.extend && Component.__after__ ){

        linkToComponent(Component);

        var state = {
          component: null,

          // @TODO:
          canUpdate: function(){

            var canUpdate = this.component && this.component.canUpdate;

            if( canUpdate ) return this.component.canUpdate();
          },


          canLeave: function(){

            var canLeave = this.component && this.component.canLeave;

            if( canLeave ) return this.component.canLeave();

          },

          canEnter: function( option ){

            if(noComponent){

              component = this.component = new Component({

                data: data,

                $state: stateman,

                $stateName: name

              });

            }

            var canEnter = this.component && this.component.canEnter;

            if( canEnter ) return this.component.canEnter(option);

          },

          enter: function( option ){



            var data = { $param: option.param };
            var component = this.component;
            var parent = this.parent, view;

            if(!component) return;

            _.extend(component.data, data, true);

            if(parent.component){
              view = parent.component.$refs.view;
              if(!view) throw this.parent.name + " should have a element with [ref=view]";
            }else{
              view = globalView;
            }
            
            component.$inject(view);
            var result = component.enter && component.enter(option);

            component.$update(function(){
              component.$mute(false);
            })

            return result;
          },
          leave: function( option){
            var component = this.component;
            if(!component) return;

            component.leave && component.leave(option);
            if( config.rebuild){
              this.component = null;
              return component.destroy();
            } 
            component.$inject(false);
            component.$mute(true);
          },
          update: function(option){
            var component = this.component;
            if(!component) return;
            component.update && component.update(option);
            component.$update({
              $param: option.param
            })
          }
        }

        _.extend(state, config || {});

        preState.call(stateman, name, state);

      }else{
        preState.call(stateman, name, Component);
      }
      return this;
    }
    return stateman;
  }

  restate.StateMan = StateMan;

  return restate;

}));
