var _ = require('./util');
var Regular = require('regularjs');

module.exports = function( stateman  ){

  Regular.directive({
    'r-view': {
      link: function(element){
        this.$viewport = element;
      },
      ssr: function( attr ){
        return 'r-view'
      }
    },
    'r-link': {
      nps: true,
      link: function(element, value){

        var parsedLinkExpr = _.extractState(value);
        if(parsedLinkExpr){
          this.$watch( parsedLinkExpr.param, function(param){
            Regular.dom.attr(element, 'href', stateman.encode(parsedLinkExpr.name, param))
          } , {deep: true} )
        }else{
          throw Error('invalid expr for r-link: ' + value);
        }
      },
      ssr: function( value, tag ){
        var parsedLinkExpr = _.extractState(value);

        if(parsedLinkExpr){
          var param = this.$get(parsedLinkExpr.param);
          return 'href="' + stateman.encode(parsedLinkExpr.name, param)+ '"' 
        }
      }
    }
  })
}


