var dispatchMockEvent = (function(){

    var rMouseEvent = /^(?:click|dblclick|contextmenu|DOMMouseScroll|mouse(?:\w+))$/
    var rKeyEvent = /^key(?:\w+)$/
    function findEventType(type){
      if(rMouseEvent.test(type)) return 'MouseEvent';
      else if(rKeyEvent.test(type)) return 'KeyboardEvent';
      else return 'HTMLEvents'
    }
    return function(el, type){
      var EventType = findEventType(type), ev;

      if(document.createEvent){ // if support createEvent

        switch(EventType){

          case 'MouseEvent':
            ev = document.createEvent('MouseEvent');
            ev.initMouseEvent(type, true, true, null, 1, 0, 0, 0, 0, false, false, false, false, 0, null)
            break;

          case 'KeyboardEvent':
            ev = document.createEvent(EventType || 'MouseEvent'),
                initMethod = ev.initKeyboardEvent ? 'initKeyboardEvent': 'initKeyEvent';
            ev[initMethod]( type, true, true, null, false, false, false, false, 9, 0 )
            break;

          case 'HTMLEvents':
            ev = document.createEvent('HTMLEvents')
            ev.initEvent(type, true, true)
        }
        el.dispatchEvent(ev);
      }else{
        try{
          el[type]()
        }catch(e){
          // TODO...
        }
      }
    }
})();


if(typeof window!=='undefined'){
  window.dispatchMockEvent = dispatchMockEvent
}else if(typeof global !== 'undefined'){
  global.dispatchMockEvent = dispatchMockEvent;
}