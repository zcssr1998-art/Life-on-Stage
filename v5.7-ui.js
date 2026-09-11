(() => {
  const A=window.APP,L=window.LIFE;
  L.VERSION='V5.7';

  // iOS in-app browsers / WKWebView can report CSS media-query dimensions differently
  // from the actually usable device area. We therefore publish an explicit density tier
  // based on the current viewport + screen and let the final stylesheet override legacy
  // fixed !important sizes deterministically.
  A.applyResponsiveUI=()=>{
    const iw=window.innerWidth||document.documentElement.clientWidth||390;
    const ih=window.innerHeight||document.documentElement.clientHeight||800;
    const sw=window.screen?.width||iw, sh=window.screen?.height||ih;
    const w=Math.round(Math.min(iw,sw)||iw);
    const h=Math.round(Math.max(ih,sh)||ih);
    let tier='normal';
    if(h<700||w<355)tier='compact';
    else if(w>=428||(w>=410&&h>=900))tier='xl';
    else if(w>=400||h>=840)tier='large';
    document.documentElement.dataset.uiScale=tier;
    document.documentElement.style.setProperty('--v57-screen-w',`${w}px`);
    document.documentElement.style.setProperty('--v57-screen-h',`${h}px`);
    return{w,h,tier};
  };

  A.applyResponsiveUI();
  requestAnimationFrame(()=>A.applyResponsiveUI());
  let rt=0;
  const onResize=()=>{clearTimeout(rt);rt=setTimeout(()=>A.applyResponsiveUI(),80)};
  window.addEventListener('resize',onResize,{passive:true});
  window.addEventListener('orientationchange',onResize,{passive:true});
  window.visualViewport?.addEventListener('resize',onResize,{passive:true});

  const base=A.startView;
  if(typeof base==='function'){
    A.startView=()=>{
      A.applyResponsiveUI();
      base();
      const card=document.querySelector('.start-card p');
      if(card)card.textContent=card.textContent.replace(/^V5\.5/,'V5.7');
      const hint=document.querySelector('.opening-hint');
      if(hint)hint.textContent=hint.textContent.replace(/^V5\.5：/,'V5.7：');
    };
  }
})();
