var path = require('path');
var webpack = require('webpack');

var config =  {

    output: {
        filename: "restate.pack.js",
        library: "restate",
        libraryTarget: "umd"
    },
    externals: {
        // require("jquery") 是引用自外部模块的
        // 对应全局变量 jQuery
        "regularjs": "Regular"
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