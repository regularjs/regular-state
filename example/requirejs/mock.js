define(function(){
  // for chat root



  var i = 0;

  var random = function(min, max){
    return Math.floor(Math.random() * ( max - min + 1 )) + min;
  }


  // for chat
  i = 0;
  var users = []
  while( (i++) < 100 ) {
    users.push({
      id: i,
      name: "user " + i,
      email: random(10, 30) + "@163.com" ,
      avatar: "http://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d10"
    })
  }

  i=0;
  var messages = []
  while( (i++) < 3 ) {
    messages.push({
      id: i,
      user: users[random(0, 99)],
      content: new Array(10).join(" message " + i + " content "),
      time: +new Date,
      reply:[]
    })
  }

  i = 0;
  var blogs = []
  while( (i++) < 100 ) {
    blogs.push({
      id: i,
      title: "post " + i,
      content: new Array(100).join(" post " + i + " content "),
      user: users[random(0, 99)],
      time: +new Date()
    })
  }


  var limit = 10;

  return {
    blogs: blogs,
    users: users,
    messages: messages,
    // help us to find specifed item in mock list.
    find: function(id, list){
      var len = list.length;
      for(;len--;){
        if(list[len].id == id) return list[len]
      }
    },
    remove: function(id, list){
      var len = list.length;
      for(;len--;){
        if(list[len].id == id) return list.splice(len,1);
      }
    },
    random: random
  }
})