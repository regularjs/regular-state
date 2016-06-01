var Regular= require('regularjs');


var Restate;


if(  Regular.env.browser !== true ){
  Restate = require('./server'); 
}else{
  Restate = require('./client');
}



module.exports = Restate;

Restate.Regular= Regular;

