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
      age: random(10, 30)
    })
  }

  i=0;
  var messages = []
  while( (i++) < 10 ) {
    messages.push({
      id: i,
      user: users[random(0, 99)],
      content: new Array(10).join(" message " + i + " content "),
      reply:[]
    })
  }

  i = 0;
  var blogs = []
  while( (i++) < 100 ) {
    blogs.push({
      id: i,
      title: "post " + i,
      contetn: new Array(100).join(" post " + i + " content "),
      user: users[random(0, 99)]
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
        if(list[len].id === id) return list[len]
      }
    },
    getList: function(page, list){
      return list.slice( (page - 1) * limit, page * limit)
    }
  }
})