/* HARD UNFREEZE PATCH — drop-in, no redesign */
(function(){
  try {
    /* 1) Make the UI ~30% smaller without transforms (safe for Safari) */
    var meta = document.querySelector('meta[name="viewport"]');
    var tag = 'width=device-width, initial-scale=0.7, maximum-scale=0.7, user-scalable=no';
    if (!meta){ meta = document.createElement('meta'); meta.name='viewport'; document.head.appendChild(meta); }
    meta.setAttribute('content', tag);

    /* 2) Kill body transforms (those break hit-testing) */
    var bs = getComputedStyle(document.body);
    if (bs.transform && bs.transform !== 'none'){
      document.body.style.transform = 'none';
      document.body.style.width = '';
      document.body.style.transformOrigin = '';
    }

    /* 3) If a fixed, full-screen overlay eats taps, make it non-blocking */
    Array.from(document.querySelectorAll('body *')).forEach(function(el){
      var cs;
      try { cs = getComputedStyle(el); } catch(e){ return; }
      if (!cs) return;
      var isFull = cs.position === 'fixed' && parseInt(cs.zIndex||'0') >= 10 &&
                   parseInt(cs.width||'0') >= window.innerWidth*0.9 &&
                   parseInt(cs.height||'0') >= window.innerHeight*0.9;
      if (isFull && cs.pointerEvents !== 'none'){
        el.style.pointerEvents = 'none';
      }
    });

    /* 4) Hard navigation delegate: click anywhere inside <a> navigates immediately */
    function hrefOf(node){
      var el = node;
      while (el && el !== document.body){
        if (el.tagName === 'A'){
          var h = el.getAttribute('href');
          if (h && h !== '#' && !/^javascript:/i.test(h)){ return h; }
        }
        el = el.parentElement;
      }
      return null;
    }
    function go(href){
      try { window.location.assign(href); } catch(e){ window.location.href = href; }
    }
    function onTap(ev){
      var href = hrefOf(ev.target);
      if(!href) return;
      ev.preventDefault(); ev.stopPropagation();
      if (typeof ev.stopImmediatePropagation === 'function') ev.stopImmediatePropagation();
      go(href);
    }
    window.addEventListener('click', onTap, {capture:true, passive:false});
    window.addEventListener('touchend', onTap, {capture:true, passive:false});

  } catch(e) {
    console && console.warn && console.warn('hard_unfreeze error', e);
  }
})();