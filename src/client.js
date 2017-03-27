



var Regular = require('regularjs');
var Stateman = require('stateman');
var _ = require('./util');
var dom =Regular.dom;

var createRestate = require('./base');

var Restate = createRestate( Stateman );
var so = Restate.prototype;


var oldStateFn = so.state;
var oldStart = so.start;


so.start = function(options, callback){
  var self = this;
  options = options || {};
  var ssr = options.ssr;
  var view = options.view;
  this.view = view;
  // prevent default stateman autoLink feature 
  options.autolink = false;
  if(ssr) {
    // wont fix .
    options.autofix = false;
    options.html5 = true;
  }
  // delete unused options of stateman
  delete options.ssr;
  delete options.view;
  if( options.html5 && window.history && "onpopstate" in window ){
    this.ssr = ssr;
    // dom.on( document.body, "click", function(ev){
    //   var target = ev.target, href;
    //   if(target.getAttribute('data-autolink') != null){
    //     ev.preventDefault();
    //     href = dom.attr(target, 'href');
    //     self.nav(href);
    //   }
    // });
  }
  oldStart.call(this, options, callback)
  return this;
}

so.state = function(name, config){
  var manager = this;
  var oldConfig;
  if( typeof name === 'string'){
    if(!config) return oldStateFn.call(this, name)
    oldConfig = config;

    // 不代理canEnter事件, 因为此时component还不存在
    // mount (if not installed, install first)
    
    // 1. .Null => a.b.c
    // canEnter a  -> canEnter a.b -> canEnter a.b.c -> 
    //  -> install a ->enter a -> mount a 
    //  -> install a.b -> enter a.b -> mount a.b 
    //  -> install a.b.c -> enter a.b.c -> mount a.b.c


    // 2. update a.b.c
    // -> install a -> mount a 
    // -> install a.b -> mount a.b 
    // -> install a.b.c -> mount a.b.c

    // 3. a.b.c -> a.b.d
    // canLeave c -> canEnter d -> leave c 
    //  -> install a -> mount a -> 
    //  -> install b -> mount b -> 
    //  -> install d -> enter d -> mount d

    function install( option , isEnter){
      var component = this.component;
      var parent = this.parent;
      var self = this;
      var ssr = option.ssr = isEnter && option.firstTime && manager.ssr && this.ssr !== false;

      if(component && component.$phase === 'destroyed' ){
        component = null;
      }

      var installOption = {
        ssr: ssr,
        state: this,
        param: option.param,
        component: component,
        originOption: option
      }
      var installPromise = manager.install( installOption ).then( function( installed ){

        var globalView = manager.view, view, ret;
        var Component = installed.Component;
        var needComponent = !component || component.constructor !== Component;

        if(parent.component){
          view = parent.component.$viewport;
        }else{
          view = globalView;
        }

        // if(!view) throw Error('need viewport for ' + self.name );

        if( needComponent ){
          // 这里需要给出提示
          if(component) component.destroy();
          var mountNode = ssr && view;

          component = self.component = new Component({
            mountNode: mountNode,
            data: _.extend({}, installed.data),
            $state: manager
          })
        }else{
          _.extend( component.data, installed.data, true)
        }
        if( (needComponent && !mountNode) || (!needComponent && isEnter) ) component.$inject(view);
        return component;
      })
      if(isEnter){
        installPromise = installPromise.then(function(){
          return _.proxyMethod(self.component, 'enter', option)
        })
      }
      return installPromise.then( self.mount.bind( self, option ) ).then(function(){
        self.component.$update(function(){
          self.component.$mute(false)
        });
      })
    }


    config = {
      component: null,
      install: install,
      mount: function( option ){
        return _.proxyMethod(this.component, 'mount', option)
      },
      canEnter: function(option){
        return _.proxyMethod(this, oldConfig.canEnter, option )
      },
      canLeave: function(option){
        return _.proxyMethod(this.component, 'canEnter', option)
      },
      update: function(option){
        return this.install(option, false);
      },
      enter: function(option){
        return this.install(option, true);
      },
      leave: function( option ){
        var component = this.component;
        if(!component) return;

        return Promise.resolve().then(function(){
          return _.proxyMethod(component, 'leave', option)
        }).then(function(){
          component.$inject(false);
          component.$mute(true);
        })
      }
    }
    _.extend(config, oldConfig, true)
    
  }
  return oldStateFn.call(this, name, config)    
}



module.exports = Restate;


