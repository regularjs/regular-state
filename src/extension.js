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
        var currentLink;
        if(stateman.history.mode === 2){
          dom.attr(element, 'data-autolink', 'data-autolink');
          if(stateman.history.mode === 2){
            dom.on(element, 'click', function(ev){
              ev.preventDefault();
              stateman.nav(currentLink)
            })
          }
        }
        //  r-link = {Expression}
        if(value && value.type === 'expression'){
          
          this.$watch( value, function( val){
            currentLink = val;
            dom.attr(element, 'href', 
              handleUrl(
                val,
                stateman.history
              )
            )
          })
          return;
        }
        // link='String'
        var parsedLinkExpr = _.extractState(value);

        if(parsedLinkExpr){ // r-link = 'app.blog(...arg)'

          var param = parsedLinkExpr.param;
          if(param.trim() === '' ){ //r-link = 'app.blog()'
            value = stateman.encode(parsedLinkExpr.name)
            currentLink = value;
          }else{ // r-link = 'app.blog({name:1})'
            this.$watch( parsedLinkExpr.param, function(param){
              currentLink = stateman.encode(parsedLinkExpr.name, param);
              dom.attr(element, 'href', 
                handleUrl(
                  currentLink,
                  stateman.history
                )
              )
            } , {deep: true} )
            return ;
          }
        }else{
          currentLink = value;
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


