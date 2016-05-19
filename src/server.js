
var SSR = require('regularjs/src/render/server.js');
var Stateman = require('stateman/src/manager/server');
var u = require('./util');

var createRestate = require('./base');
var Restate = createRestate( Stateman );
var so = Restate.prototype;

so.run = function(path, option){
  option = option || {};
  var executed = this.exec(path);
  var self = this;
  if(!executed){
    return Promise.reject({
      code: 'notfound',
      message: 'NOT FOUND'
    });
  }
  var param = executed.param;
  var promises = executed.states.map(function(state){
    var installOption = {
      state: state,
      param: param
    }
    return self.install( installOption ).then( function(installed){
      var data = installed.data;
      var html = SSR.render( installed.Component, {
        data: u.extend({}, data), 
        $state: self 
      })
      return {
        name: state.name,
        html: html,
        data: data
      };
    })
  })

  return Promise.all( promises).then(function( rendereds ){

    var len = rendereds.length;

    if(!len) return null;
    var rendered = rendereds[0];
    var retView = rendered.html, data = {};

    data[rendered.name] = rendered.data; 

    for(var i = 1; i < len; i++ ){

      var nextRendered = rendereds[i];

      // <div rg-view >
      retView = retView.replace(/rg-view([^>]*\>)/, function(all ,capture){

        return capture + nextRendered.html;
      })

      data[nextRendered.name] = nextRendered.data
    }
    return { html: retView, data: data } 
  })
}

module.exports =  Restate;