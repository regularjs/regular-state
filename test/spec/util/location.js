
var Regular = require('regularjs');
// Backbone.js Trick for mock the location service
function loc(href){
  var a = document.createElement('a');
  return ({
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
    }
  }).replace(href)
}

module.exports = loc;