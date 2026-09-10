(() => {
  const A=window.APP,L=window.LIFE,R=document.getElementById('root'),N=document.getElementById('bottomNav');

  // 只有至少激活第一档后，才显示该组共鸣；未激活的组合完全隐藏。
  A.synergyCards=()=>{
    const c=A.setCounts();
    const active=Object.entries(L.SYNERGY_SETS).filter(([k])=>(c[k]||0)>=2);
    if(!active.length)return '<div class="secret-build-hint">同类型词条叠多了，可能会出现意想不到的效果。先玩，不剧透。</div>';
    return active.map(([k,s])=>{
      const n=c[k]||0,t=A.setTier(k,c);
      return `<div class="syn-card tier-${t}"><div><strong>${s.icon} ${s.name}</strong><span>${n} 层</span></div><div class="syn-pips">${s.tiers.map(x=>`<i class="${n>=x?'on':''}">${x}</i>`).join('')}</div><p>${t?`已触发：${s.desc[t-1]}`:'共鸣正在形成'}</p></div>`;
    }).join('');
  };

  const oldInfo=A.infoView;
  A.infoView=()=>oldInfo()
    .replace('羁绊叠层','已发现的词条共鸣')
    .replace('2 / 4 / 6 层升级','未触发的组合不会显示');

  A.startView=()=>{
    const d=A.draft(),c=A.collection();
    A._draft=d;
    A._rollCount=(A._rollCount||0)+1;
    const top=[...d.traits].sort((a,b)=>(L.RARITY[b.rarity]?.rank||0)-(L.RARITY[a.rarity]?.rank||0))[0];
    const hand=top?.rarity==='SSS'?'神话开局':top?.rarity==='SS'?'传说开局':top?.rarity==='S'?'史诗开局':'普通开局';
    R.innerHTML=`<section class="screen start-screen">
      <div class="start-card">${A.summaryHud?'<div class="opening-avatar">'+L.svgAvatar(L.AVATARS[d.avatar]||L.AVATARS[0])+'</div>':''}<div><h1>人生随机实验室</h1><p>V5.2 · ${hand}</p></div></div>
      <div class="start-world"><strong>${d.w.name}</strong><span>${d.b[0]} · ${d.pe[0]} · ${d.ta[0]} · ${d.f[0]}</span></div>
      <div class="section-line"><strong>开局随机词条 ×5</strong><span>第 ${A._rollCount} 次 Roll · 图鉴 ${c.traits.length}/100</span></div>
      <div class="start-traits">${d.traits.map(t=>A.traitChip(t)).join('')}</div>
      <div class="rarity-legend"><span class="r-SSS">神话 5</span><span class="r-SS">传说 10</span><span class="r-S">史诗 15</span><span class="r-A">稀有 30</span><span class="r-B">普通 40</span></div>
      <div class="opening-hint">提示：同类型词条如果不断叠起来，可能会发生意想不到的变化。</div>
      <div class="start-actions"><button class="reroll-button" id="rerollBtn">🎲 再 Roll 一次</button><button class="start-button" id="startBtn">就这把，开始 →</button></div>
      <small class="start-meta">头像随机 · 开局允许反复 Roll · 本机已完成 ${c.runs||0} 局</small>
    </section>`;
    N.classList.add('hidden');
    document.getElementById('rerollBtn').onclick=()=>A.startView();
    document.getElementById('startBtn').onclick=()=>{const pick=A._draft;A._draft=null;A._rollCount=0;A.newLife(pick);N.classList.remove('hidden')};
  };

  // 抓周 15 选 1 在手机上使用紧凑按钮，避免三行词条名称挤成金色横线。
  const oldActionCard=A.actionCard;
  A.actionCard=(a,i)=>{
    if(A.p?.age===1&&String(a.id||'').startsWith('zhou15_')){
      return `<button class="action-card zhou-choice" data-i="${i}"><strong>${a.title}</strong><p>选择一个童年倾向</p></button>`;
    }
    return oldActionCard(a,i);
  };
})();