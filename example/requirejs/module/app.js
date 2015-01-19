define(["regularjs", "rgl!./app.html", "../components/menu.js"], function( Regular, tpl ){


  return Regular.extend({
    template: tpl,

    config: function(data){
      data.menus = [
        {url: '/',name: "Home", state: "app.index" },
        {url: '/blog', name: "Blog", state: 'app.blog'},
        {url: '/chat', name: "Chat", state: 'app.chat'}
      ]
    },
    login: function(username, password){
      this.$state.user = {
        name: username,
        id: -1,
        avatar: "https://avatars1.githubusercontent.com/u/731333?v=3&s=460"
      }

      try{
        localStorage.setItem("username", username);
      }catch(e){}
      

      return false;
    },
    logout: function(){

      this.$state.user = null;
      this.$state.go("app.index");
      try{
        localStorage.setItem("username", "");
      }catch(e){}
      return false;
    }
  })
})