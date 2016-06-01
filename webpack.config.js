var path = require('path');
var webpack = require('webpack');

var config =  {

    output: {
        filename: "restate.pack.js",
        library: "restate",
        libraryTarget: "umd"
    },
    externals: {
        "regularjs": "Regular"
    },
    plugins: [ ],
    devtool:'source-map'
};



module.exports = config;