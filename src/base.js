var Regular = require('regularjs');


Regular.directive('rg-view', {
  link: function(element){
    this.$viewport = element;
  },
  ssr: function(){
    return 'rg-view '; 
  }
})

