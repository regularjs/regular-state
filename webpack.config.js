var path = require('path');
var webpack = require('webpack');

var config =  {

    output: {
        filename: "restate.pack.js",
        library: "restate",
        libraryTarget: "umd"
    },
    module: {
        rules: [{
          test: /\.js$/,
          exclude: /(node_modules)/,
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            presets: [
              ["es2015", { "modules": false }]
            ],
          }
        }]
    },
    plugins: [ ],
    devtool:'source-map'
};





module.exports = config;