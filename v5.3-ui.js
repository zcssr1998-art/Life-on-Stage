(() => {
  const A=window.APP,L=window.LIFE;
  const R=document.getElementById('root'),N=document.getElementById('bottomNav');

  // 开局保留可 Roll 的爽点，但不再公开词条池内部配额。
  A.startView=()=>{
    const d=A.draft(),c=A.collection();
    A._draft=d;
    A._rollCount=(A._rollCount||0)+1;
    const top=[...d.traits].sort((a,b)=>(L.RARITY[b.rarity]?.rank||0)-(L.RARITY[a.rarity]?.rank||0))[0];
    const hand=top?.rarity==='SSS'?'神话开局':top?.rarity==='SS'?'传说开局':top?.rarity==='S'?'史诗开局':'随机开局';
    R.innerHTML=`<section class="screen start-screen">
      <div class="start-card"><div class="opening-avatar">${L.svgAvatar(L.AVATARS[d.avatar]||L.AVATARS[0])}</div><div><h1>人生随机实验室</h1><p>V5.3 · ${hand}</p></div></div>
      <div class="start-world"><strong>${d.w.name}</strong><span>${d.b[0]} · ${d.pe[0]} · ${d.ta[0]} · ${d.f[0]}</span></div>
      <div class="section-line"><strong>开局随机词条 ×5</strong><span>第 ${A._rollCount} 次 Roll · 图鉴 ${c.traits.length}/100</span></div>
      <div class="start-traits">${d.traits.map(t=>A.traitChip(t)).join('')}</div>
      <div class="opening-hint">提示：有些看起来相近的词条，叠得足够多以后可能会产生额外变化。</div>
      <div class="start-actions"><button class="reroll-button" id="rerollBtn">🎲 再 Roll 一次</button><button class="start-button" id="startBtn">就这把，开始 →</button></div>
      <small class="start-meta">头像随机 · 开局允许反复 Roll · 本机已完成 ${c.runs||0} 局</small>
    </section>`;
    N.classList.add('hidden');
    document.getElementById('rerollBtn').onclick=()=>A.startView();
    document.getElementById('startBtn').onclick=()=>{const pick=A._draft;A._draft=null;A._rollCount=0;A.newLife(pick);N.classList.remove('hidden')};
  };

  // 根节点事件代理：不再每年给新 DOM 重绑四五个 onclick。
  // 不做时间型 debounce。resolve 自己已经有 busy 状态锁；时间节流会误吞玩家连续点击，
  // 在 WebKit 上尤其容易表现成“按钮突然没反应”。
  if(!A._choiceDelegationInstalled){
    R.addEventListener('click',e=>{
      const b=e.target?.closest?.('.action-card[data-i]');
      if(!b||b.disabled)return;
      e.preventDefault();
      const i=Number(b.dataset.i),action=A.year?.[i];
      if(action)A.resolve(action);
    },true);
    A._choiceDelegationInstalled=true;
  }

  A.bind=()=>{
    const s=document.getElementById('saveBtn');if(s)s.onclick=()=>{A.save();A.note('已保存')};
    const l=document.getElementById('loadBtn');if(l)l.onclick=A.load;
    const t=document.getElementById('treeBtn');if(t)t.onclick=A.tree;
    const r=document.getElementById('restartBtn');if(r)r.onclick=()=>{if(confirm('重开当前人生？图鉴和族谱保留。')){A.p=null;A.startView()}};
  };

  // 根据当年实际选项数量动态铺满屏幕：普通年 4 格，抓周/特殊节点按实际数量。
  const renderBase=A.render;
  A.render=()=>{
    renderBase();
    if(A.p?.alive&&A.view==='game'){
      const box=R.querySelector('.actions');
      if(box){
        const n=Math.max(1,A.year?.length||1);
        box.style.gridTemplateRows=`repeat(${n},minmax(0,1fr))`;
      }
    }
  };
})();
