var Regular = require('regularjs');
var Stateman = require('stateman');
var _ = require('./util');
var dom =Regular.dom;

var createRestate = require('./base');

var Restate = createRestate( Stateman );
var so = Restate.prototype;


var oldStateFn = so.state;
var oldStart = so.start;


so.start = function(options){
  this.view = options.view;
  options = options || {};
  // prevent default stateman autoLink feature 
  options.autoLink = false;
  if(this.ssr) options.autofix = false;
  var self = this;
  dom.on( document.body, "click", function(ev){
    var target = ev.target, href;
    if(target.getAttribute('data-autolink') != null){
      ev.preventDefault();
      href = dom.attr(target, 'href');
      self.nav(href);
    }
  });
  return oldStart.apply(this, arguments)
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

