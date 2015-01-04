define(function(require){
  var mock = require("../mock.js");
  return {
    regularify: true,
    template: require("rgl!./chat.html"),
    enter: function(option){
      var page = option.page || 1;
      this.data.messages = mock.messages;
    }
  }
})