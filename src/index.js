var Regular= require('regularjs');


var Restate;

if( !Regular.env.browser ){
  Restate = require('./server');
}else{
  Restate = require('./client');
}



module.exports = Restate;

