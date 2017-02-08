if(!window.Promise){
  window.Promise = require('promise-polyfill') 
}
require('./spec/component.js');
require('./spec/lifecycle.js');