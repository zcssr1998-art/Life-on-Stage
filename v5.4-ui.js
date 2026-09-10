(() => {
  const A=window.APP,L=window.LIFE;
  const R=document.getElementById('root'),N=document.getElementById('bottomNav');
  L.VERSION='V5.4';

  const traitObj=ref=>L.TRAITS.find(x=>x.id===ref.id)||ref;
  const tip=s=>String(s||'').replace(/'/g,'’');
  const discoveredCount=()=>{
    const c=A.collection(),valid=new Set(L.TRAITS.map(t=>t.id));
    return (c.traits||[]).filter(id=>valid.has(id)).length;
  };
  const traitPower=ref=>{
    const t=traitObj(ref),r=L.RARITY[t.rarity]?.rank||0;
    const stat=Object.values(t.effects||{}).reduce((s,v)=>s+Math.max(0,v),0);
    const mods=Object.entries(t.mods||{}).reduce((s,[k,v])=>s+(k==='death'?(1-v)*80:Math.max(0,v)*45),0);
    return r*100+stat+mods;
  };
  A.topFiveTraits=()=>[...(A.p?.traits||[])].sort((a,b)=>traitPower(b)-traitPower(a)).slice(0,5);

  const topTraitChip=ref=>{
    const t=traitObj(ref),r=L.RARITY[t.rarity]||{name:t.rarity};
    return `<button class="v54-top-trait r-${t.rarity}" onclick="__tip('${tip(`${t.name} · ${r.name}：${t.desc||'已获得词条'}`)}')"><span>${t.name}</span><em>${r.name}</em></button>`;
  };

  A.gameHud=()=>{
    const p=A.p,j=A.job(p.career),top=A.topFiveTraits();
    const wd=A._deltaLifeId===p.id?(A._yearDeltaWealth||0):0;
    return `<div class="v54-game-hud">
      <div class="portrait">${L.svgAvatar(L.AVATARS[p.avatar]||L.AVATARS[0])}</div>
      <div class="v54-hud-main">
        <div class="v54-hud-line"><strong>${p.age} 岁</strong><span>${A.phase(p.age)}</span><span>${j.name}</span></div>
        <div class="v54-hud-sub"><b>${L.fmtMoney(p.wealth)}</b>${wd?`<i class="${wd>0?'up':'down'}">${wd>0?'+':''}${L.fmtMoney(wd)}</i>`:''}<span>分数 ${A.score()}</span></div>
      </div>
      <div class="v54-top5" aria-label="当前最强五个词条">${top.map(topTraitChip).join('')}</div>
    </div>`;
  };

  A.gameStats=()=>{
    const p=A.p,d=A._deltaLifeId===p.id?(A._yearDeltaStats||{}):{};
    return `<div class="v54-stats">${Object.entries(p.stats).map(([k,v])=>{
      const dv=d[k]||0,cls=dv>0?'up':dv<0?'down':'flat';
      return `<button class="v54-stat" onclick="__tip('${tip(`${L.ATTR[k]?.name||k}：${L.ATTR[k]?.tip||'人物基础属性'}`)}')">
        <span>${L.ATTR[k]?.name||k}</span><strong>${v}</strong><em class="${cls}">${dv?`${dv>0?'+':''}${dv}`:'—'}</em>
      </button>`;
    }).join('')}</div>`;
  };

  A.latestImpact=()=>{
    const p=A.p,valid=A.lastResult&&A._resultLifeId===p.id;
    if(!valid)return `<div class="v54-impact neutral"><b>本年结果</b><strong>还没有结果</strong><span>选一个事件后，这里只保留刚刚那一次选择产生的最新结果。</span></div>`;
    const r=A.lastResult;
    return `<div class="v54-impact ${r.tone||'neutral'}">
      <b>刚刚发生</b><strong>${A._lastChoiceTitle||'本年选择'}</strong><span>${r.text||''}</span><em>${r.changes||'无明显变化'}</em>
    </div>`;
  };

  A.gameView=()=>{
    const p=A.p;
    const zhou=p.age===1&&A.year.some(a=>String(a.id||'').startsWith('zhou15_'));
    const title=zhou?'抓周：选一个人生起手式':
      p.graduationAge===p.age&&!p.tags.includes('已毕业')?'毕业：第一份工作':
      p.age===12?'人生分流':p.age===18?'成年节点':p.age===28?'关系节点':'今年你要把时间押在哪件事上';
    return `<section class="screen game-screen v54-game">
      ${A.gameHud()}
      ${A.gameStats()}
      ${A.latestImpact()}
      <div class="choice-head"><strong>${title}</strong><span>${A.year.length} 选 1</span></div>
      <div class="actions v54-actions ${zhou?'v54-zhou':''}">${A.year.map(A.actionCard).join('')}</div>
    </section>`;
  };

  // 人物信息只保留长期信息：词条、共鸣、家庭/教育、完整人生轨迹。
  // 基础属性已经搬到“游戏进程”，避免玩家来回切页才能判断本年输赢。
  A.infoView=()=>{
    const p=A.p,traits=[...(p.traits||[])].sort((a,b)=>traitPower(b)-traitPower(a));
    return `<section class="screen info-screen v54-info">
      ${A.summaryHud()}
      <div class="info-scroll">
        <div class="info-block">
          <div class="section-line"><strong>词条</strong><span>${traits.length} 个 · 图鉴 ${discoveredCount()}/${L.TRAITS.length}</span></div>
          <div class="traits-wrap">${traits.map(t=>A.traitChip(t)).join('')}</div>
        </div>
        <div class="info-block">
          <div class="section-line"><strong>已发现的词条共鸣</strong><span>未触发的组合不会显示</span></div>
          <div class="synergy-grid">${A.synergyCards()}</div>
        </div>
        <div class="info-block two-col">
          <div><strong>世界</strong><p>${p.world.name}</p><small>${p.world.desc}</small></div>
          <div><strong>家庭</strong><p>${p.spouse?`配偶：${p.spouse.name} · ${p.spouse.trait}`:'暂无配偶'}</p><small>子女 ${p.children.length} · 家族第 ${p.generation} 代</small></div>
          <div><strong>教育</strong><p>${p.education||'未定'}</p><small>${p.tags.filter(x=>/专业|路线|毕业|辍学/.test(x)).join(' · ')||'暂无教育词条'}</small></div>
          <div><strong>开局</strong><p>${p.background}</p><small>${p.personality} · ${p.talent} · ${p.flaw}</small></div>
        </div>
        <div class="info-block v54-history-block">
          <div class="section-line"><strong>完整人生轨迹</strong><span>${p.history.length} 条</span></div>
          <div class="full-history">${p.history.map(A.historyRow).join('')}</div>
        </div>
        <div class="info-actions"><button id="saveBtn">保存</button><button id="loadBtn">读取</button><button id="treeBtn">族谱</button><button class="danger" id="restartBtn">重开</button></div>
      </div>
    </section>`;
  };

  A.startView=()=>{
    const d=A.draft(),c=A.collection();
    A._draft=d;
    A._rollCount=(A._rollCount||0)+1;
    const top=[...d.traits].sort((a,b)=>traitPower(b)-traitPower(a))[0];
    const hand=top?.rarity==='P'?'彩色天选':top?.rarity==='SSS'?'神话开局':top?.rarity==='SS'?'传说开局':top?.rarity==='S'?'史诗开局':'随机开局';
    R.innerHTML=`<section class="screen start-screen">
      <div class="start-card"><div class="opening-avatar">${L.svgAvatar(L.AVATARS[d.avatar]||L.AVATARS[0])}</div><div><h1>人生随机实验室</h1><p>V5.4 · ${hand}</p></div></div>
      <div class="start-world"><strong>${d.w.name}</strong><span>${d.b[0]} · ${d.pe[0]} · ${d.ta[0]} · ${d.f[0]}</span></div>
      <div class="section-line"><strong>开局随机词条 ×5</strong><span>第 ${A._rollCount} 次 Roll · 图鉴 ${discoveredCount()}/${L.TRAITS.length}</span></div>
      <div class="start-traits">${d.traits.map(t=>A.traitChip(t)).join('')}</div>
      <div class="opening-hint">提示：高阶词条明显变多了；极少数 Roll 会出现一枚完全不同的彩色词条。</div>
      <div class="start-actions"><button class="reroll-button" id="rerollBtn">🎲 再 Roll 一次</button><button class="start-button" id="startBtn">就这把，开始 →</button></div>
      <small class="start-meta">头像随机 · 开局允许反复 Roll · 本机已完成 ${c.runs||0} 局</small>
    </section>`;
    N.classList.add('hidden');
    document.getElementById('rerollBtn').onclick=()=>A.startView();
    document.getElementById('startBtn').onclick=()=>{
      const pick=A._draft;
      A._draft=null;A._rollCount=0;
      A.lastResult=null;A._resultLifeId=null;A._deltaLifeId=null;A._lastChoiceTitle='';
      A.newLife(pick);
      N.classList.remove('hidden');
    };
  };

  // 记录“整年净变化”：包括玩家选择、收入、配角/幸运事件和自然衰减。
  // 原有 latestResult 继续负责“刚刚点下去的选择本身”的结果，两者分工明确。
  const resolveBase=A.resolve;
  A.resolve=a=>{
    if(!A.p?.alive)return resolveBase(a);
    const p0=A.p,lifeId=p0.id,age=p0.age,before={...p0.stats},bw=p0.wealth,title=a?.title||'本年选择';
    const out=resolveBase(a);
    const p=A.p;
    if(p&&p.id===lifeId&&(p.age!==age||!p.alive)){
      const ds={};
      Object.keys(before).forEach(k=>ds[k]=(p.stats?.[k]??before[k])-before[k]);
      A._yearDeltaStats=ds;
      A._yearDeltaWealth=(p.wealth??bw)-bw;
      A._deltaLifeId=lifeId;
      A._resultLifeId=lifeId;
      A._lastChoiceTitle=title;
      if(p.alive&&A.view==='game')A.render?.();
    }
    return out;
  };

  const deadBase=A.deadView;
  A.deadView=()=>deadBase().replace(/图鉴\s+\d+\/100/g,`图鉴 ${discoveredCount()}/${L.TRAITS.length}`);

  const badgesBase=A.lifeBadges;
  A.lifeBadges=()=>{
    const b=badgesBase();
    if((A.p?.traits||[]).some(x=>x.rarity==='P')&&!b.includes('彩色天选'))b.unshift('彩色天选');
    return b.slice(0,8);
  };
})();
