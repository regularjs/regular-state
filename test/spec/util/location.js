
var Regular = require('regularjs');
// Backbone.js Trick for mock the location service
function loc(href){
  var a = document.createElement('a');
  var self = {
    replace: function(href) {
      a.href = href;
      Regular.util.extend(this, {
        href: a.href,
        hash: a.hash,
        host: a.host,
        fragment: a.fragment,
        pathname: a.pathname,
        search: a.search
      }, true)
      if (!/^\//.test(this.pathname)) this.pathname = '/' + this.pathname;
      return this;
    },
    history: {
      replaceState: function(obj, title, path){

        self.replace(path)
        // a.href = path
      },
      pushState: function(obj, title, path){
        self.replace(path)
      }
    }
  }
  return (self).replace(href)
}

module.exports = loc;