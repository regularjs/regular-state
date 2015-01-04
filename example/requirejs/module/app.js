define(["regularjs", "rgl!./app.html", "../components/menu.js"], function( Regular, tpl ){

  return Regular.extend({
    template: tpl,
    name: function(){
      return "app"
    },
    config: function(data){
      data.menus = [
        {url: '/',name: "Home", state: "app.index" },
        {url: '/blog', name: "Blog", state: 'app.blog'},
        {url: '/chat', name: "Chat", state: 'app.chat'}
      ]
    },
    init: function(){
      Regular;
      this.$get("menus")
    },
    login: function(user, password){
      Regular;
      this.$state.username = user;
      this.$state.emit("login");
      return false;
    }
  })
})