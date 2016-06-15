var _ = require('./util');
var Regular = require('regularjs');
var dom = Regular.dom;


function handleUrl(url, history){
  return history.mode === 2? url : history.prefix + url
}

module.exports = function( stateman  ){

  function getParam(name, context){
    if(typeof name !== 'string' || name.toLowerCase().trim() === ''){
      return null
    }else{
      return context.$get(name);
    }
  }

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

        // use html5 history
        if(stateman.history.mode === 2){
          dom.attr(element, 'data-autolink', 'data-autolink');
        }
        if(value && value.type === 'expression'){
          
          this.$watch( value, function( val){
            dom.attr(element, 'href', 
              handleUrl(
                val,
                stateman.history
              )
            )
          })
          return;
        }
        var parsedLinkExpr = _.extractState(value);

        if(parsedLinkExpr){

          var param = parsedLinkExpr.param;
          if(param.trim() === '' ){
            value = stateman.encode(parsedLinkExpr.name)
          }else{
            return this.$watch( parsedLinkExpr.param, function(param){
              dom.attr(element, 'href', 
                handleUrl(
                  stateman.encode(parsedLinkExpr.name, param),
                  stateman.history
                )
                
              )
            } , {deep: true} )
          }
        }

        dom.attr(element, 'href', 
          handleUrl(
            value,
            stateman.history
          )
        )

          
      },
      ssr: function( value, tag ){

        if(value && value.type === 'expression'){
          return 'href="' + Regular.util.escape(getParam(value,this)) +  '"' 
        }
        var parsedLinkExpr = _.extractState(value);

        if(parsedLinkExpr){
          var param = getParam(parsedLinkExpr.param, this);
          return 'href="' + stateman.encode(parsedLinkExpr.name, param)+ '"' 
        }else{
        }
      }
    }
  })
}


