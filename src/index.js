
var Regular = require('regularjs');


if( Regular.isServer ){
  module.exports = require('./server');
}else{
  module.exports = require('./client');
}

