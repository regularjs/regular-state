require('es6-promise').polyfill();

var server = require('../../src/server.js');
var client = require('../../src/client.js');
var Regular = require('regularjs');
var blogConfig = require('./util/routeConfig.js').blog;
var manager = server(blogConfig);


describe("Simple Test", function(){

  

  it("renderToString -> rerender", function( done){
    var container = document.createElement('div');
    manager.run('/blog/1/detail?rid=3').then(function(arg){
      container.innerHTML = arg.html
      expect(container.firstElementChild.tagName.toLowerCase()).to.equal('div')
      history.pushState({}, '标题', '/blog/1/detail?rid=3')
      blogConfig.view = container;
      blogConfig.ssr = true;
      client(blogConfig)
        .on('end', function(){
          expect(container.querySelector('.hook').innerHTML).to.equal('修改后的title');
          done()
        })
        .start({
        html5: true
      })
    }).catch(function(err){
      throw err;
    })
  })

  it("renderToString -> rerender with server Data", function( done){

    var container = document.createElement('div');
    manager.run('/blog/1/detail?rid=3').then(function(arg){
      container.innerHTML = arg.html
      expect(container.firstElementChild.tagName.toLowerCase()).to.equal('div')
      history.pushState({}, '标题', '/blog/1/detail?rid=3')
      var myConfig = Regular.util.extend({
        view:container,
        ssr: true,
        dataProvider: function(option){
          return arg.data[option.state.name]
        }
      }, blogConfig)
      client(myConfig)
        .on('end', function(){
          expect(container.querySelector('.hook').innerHTML).to.equal('修改后的title');
          done()
        })
        .start({
        html5: true
      })
    }).catch(function(err){
      throw err;
    })

  })
})