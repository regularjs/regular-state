// app.js

const restate = require('regular-state/server');
const Regular = require('regularjs');

const App = Regular.extend({
   template: 
     `<div>
       <h2>主页</h2>
       <div r-view ></div>
      </div>
     `
 })
 const Blog = Regular.extend({
   template: `
      <h3>博客页</h3> 
      <div r-view ></div>
   `  
 })
 const Detail = Regular.extend({
   template: `
     <h4>详情:{name}</h4>
  `
 });


const routes = {
  'app': {
    view: App
  },
  'app.blog': {
    url: 'blog/:id',
    view: Blog
  },
  'app.blog.detail': {
    data(option, resolve){

      setTimeout(function(){
        resolve({
          name: 'leeluolee'
        })
      },50)
    },
    view: Detail
  }

}


const manager = restate( { routes: routes });

manager.run('/app/blog/1/detail').then( function( ret ){
  console.log(ret.html)
  console.log(ret.data)
})



