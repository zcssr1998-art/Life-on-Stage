(() => {
  const A=window.APP,L=window.LIFE;
  L.VERSION='V5.7';
  const base=A.startView;
  if(typeof base==='function'){
    A.startView=()=>{
      base();
      const card=document.querySelector('.start-card p');
      if(card)card.textContent=card.textContent.replace(/^V5\.5/,'V5.7');
      const hint=document.querySelector('.opening-hint');
      if(hint)hint.textContent=hint.textContent.replace(/^V5\.5：/,'V5.7：');
    };
  }
})();
