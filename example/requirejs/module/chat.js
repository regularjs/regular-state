define(function(require){
  var mock = require("../mock.js");
  return {
    regularify: true,
    template: require("rgl!./chat.html"),
    enter: function(option){
      var page = option.page || 1;
      this.data.messages = mock.messages;
    },
    post: function(text){
      this.data.messages.push({
        id: mock.random(1000, 99999),
        user: this.$state.user,
        content: text,
        time: +new Date
      })

      this.data.text = "";
    },
    remove: function(index){
      this.data.messages.splice(index, 1);
      return false;
    }

  }
})