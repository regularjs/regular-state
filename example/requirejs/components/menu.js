define(["regularjs", "rgl!./menu.html"], function( Regular, tpl ){

  var Menu = Regular.extend({
    template: tpl,
    config: function(data){
      data.state.on("end", this.$update.bind(this))
    }
  })

  Regular.component("app-menu", Menu);

  return Menu;
})