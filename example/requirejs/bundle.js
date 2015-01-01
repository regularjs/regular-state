var requirejs = require('requirejs');

requirejs.optimize({
    //stubModules can be used to remove unneeded plugins after build
    stubModules : ['rgl'],
    mainConfigFile : __dirname + '/index.js',
    baseUrl : __dirname,
    name : 'index',
    optimize : 'none',
    out : __dirname + '/index-min.js'
}, function(msg){
    console.log(msg)
});
