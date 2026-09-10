(() => {
  const A=window.APP,L=window.LIFE;
  const R=document.getElementById('root'),N=document.getElementById('bottomNav');
  L.VERSION='V5.5';
  const tip=s=>String(s||'').replace(/'/g,'’').replace(/\n/g,' ');
  const traitObj=ref=>L.TRAITS.find(x=>x.id===ref.id)||ref;
  const power=ref=>{const t=traitObj(ref),r=L.RARITY[t.rarity]?.rank||0,stat=Object.values(t.effects||{}).reduce((s,v)=>s+Math.max(0,v),0);return r*100+stat};
  const top5=()=>[...(A.p?.traits||[])].sort((a,b)=>power(b)-power(a)).slice(0,5);
  const av=n=>`<div class="portrait">${L.svgAvatar(L.AVATARS[n]||L.AVATARS[0])}</div>`;

  const traitChipMini=ref=>{
    const t=traitObj(ref),r=L.RARITY[t.rarity]||{name:t.rarity};
    return `<button class="v55-top-trait r-${t.rarity}" onclick="__tip('${tip(`${t.name} · ${r.name}：${t.desc||'已获得词条'}`)}')"><span>${t.name}</span><em>${r.name}</em></button>`;
  };

  A.gameHud=()=>{
    const p=A.p,j=A.job(p.career),wd=A._deltaLifeId===p.id?(A._yearDeltaWealth||0):0;
    return `<div class="v55-hero ${p.spouse?'has-spouse':''}">
      <div class="v55-self">
        ${av(p.avatar)}
        <div class="v55-self-main">
          <div class="v55-title"><strong>${p.age} 岁</strong><span>${A.phase(p.age)}</span><span>${j.name}</span></div>
          <div class="v55-money"><b>${L.fmtMoney(p.wealth)}</b>${wd?`<i class="${wd>0?'up':'down'}">${wd>0?'+':''}${L.fmtMoney(wd)}</i>`:''}<span>人生分 ${A.score()}</span></div>
        </div>
        <div class="v55-top5">${top5().map(traitChipMini).join('')}</div>
      </div>
      ${p.spouse?`<div class="v55-spouse">
        ${av(p.spouse.avatar)}
        <div><small>💞 当前伴侣</small><strong>${p.spouse.name}</strong><span>${p.spouse.trait} · ${p.spouse.since||'?'} 岁相识</span></div>
        <em>家庭 ${p.stats.family}</em>
      </div>`:''}
    </div>`;
  };

  A.gameStats=()=>{
    const p=A.p,d=A._deltaLifeId===p.id?(A._yearDeltaStats||{}):{};
    return `<div class="v55-stats">${Object.entries(p.stats).map(([k,v])=>{
      const dv=d[k]||0,level=A.statLevel(v),pct=Math.max(1,Math.min(100,v/2));
      return `<button class="v55-stat" onclick="__tip('${tip(`${L.ATTR[k]?.name||k} ${v} · ${level}。${L.ATTR[k]?.tip||''}`)}')">
        <div class="v55-stat-head"><span>${L.ATTR_ICONS[k]||'◆'} ${L.ATTR[k]?.name||k}</span><b>${v}</b><em class="${dv>0?'up':dv<0?'down':'flat'}">${dv?`${dv>0?'+':''}${dv}`:'—'}</em></div>
        <div class="v55-bar"><i style="width:${pct}%"></i><u class="mark100"></u><u class="mark150"></u></div>
      </button>`;
    }).join('')}</div>`;
  };

  A.latestImpact=()=>{
    const p=A.p,stories=A._deltaLifeId===p.id?(A._yearStories||[]):[];
    if(!stories.length)return `<section class="v55-latest empty"><div class="v55-latest-head"><strong>最新人生轨迹</strong><span>这一年还没落笔</span></div><p>选一个事件。以后每一年可能留下 1～3 件事，不再只有一行短结果。</p></section>`;
    return `<section class="v55-latest">
      <div class="v55-latest-head"><strong>最新人生轨迹</strong><span>${stories[0]?.age??p.age-1} 岁 · ${stories.length} 件事</span></div>
      <div class="v55-story-list">${stories.slice(0,3).map((h,i)=>`<article class="v55-story ${h.tone||'neutral'}">
        <div><b>${i+1}</b><strong>${h.title}</strong>${h.kind==='chaos'?'<i>离谱支线</i>':''}</div>
        <p>${h.text}</p><small>${h.changes||'无明显数值变化'}</small>
      </article>`).join('')}</div>
    </section>`;
  };

  A.gameView=()=>{
    const p=A.p,zhou=p.age===1&&A.year.some(a=>String(a.id||'').startsWith('zhou15_'));
    const title=zhou?'抓周：选一个人生起手式':p.graduationAge===p.age&&!p.tags.includes('已毕业')?'毕业：第一份工作':p.age===12?'人生分流':p.age===18?'成年节点':p.age===28?'关系节点':'这一年，你把主要精力押在哪件事上？';
    return `<section class="screen game-screen v55-game ${p.spouse?'v55-coupled':''}">
      ${A.gameHud()}
      ${A.gameStats()}
      ${A.latestImpact()}
      <div class="choice-head"><strong>${title}</strong><span>${A.year.length} 选 1</span></div>
      <div class="actions v55-actions ${zhou?'v54-zhou':''}">${A.year.map(A.actionCard).join('')}</div>
    </section>`;
  };

  A.startView=()=>{
    const d=A.draft(),c=A.collection();A._draft=d;A._rollCount=(A._rollCount||0)+1;
    const top=[...d.traits].sort((a,b)=>power(b)-power(a))[0];
    const hand=top?.rarity==='P'?'彩色天选':top?.rarity==='SSS'?'神话开局':top?.rarity==='SS'?'传说开局':top?.rarity==='S'?'史诗开局':'随机开局';
    const discovered=(c.traits||[]).filter(id=>L.TRAITS.some(t=>t.id===id)).length;
    R.innerHTML=`<section class="screen start-screen">
      <div class="start-card"><div class="opening-avatar">${L.svgAvatar(L.AVATARS[d.avatar]||L.AVATARS[0])}</div><div><h1>人生随机实验室</h1><p>V5.5 · ${hand}</p></div></div>
      <div class="start-world"><strong>${d.w.name}</strong><span>${d.b[0]} · ${d.pe[0]} · ${d.ta[0]} · ${d.f[0]}</span></div>
      <div class="section-line"><strong>开局随机词条 ×5</strong><span>第 ${A._rollCount} 次 Roll · 图鉴 ${discovered}/${L.TRAITS.length}</span></div>
      <div class="start-traits">${d.traits.map(t=>A.traitChip(t)).join('')}</div>
      <div class="opening-hint">V5.5：属性上限扩到 200；100 只是强者起点。每年会发生 1～3 件事，事件池会严格跟着年龄变化。</div>
      <div class="start-actions"><button class="reroll-button" id="rerollBtn">🎲 再 Roll 一次</button><button class="start-button" id="startBtn">就这把，开始 →</button></div>
      <small class="start-meta">头像随机 · 开局允许反复 Roll · 本机已完成 ${c.runs||0} 局</small>
    </section>`;
    N.classList.add('hidden');
    document.getElementById('rerollBtn').onclick=()=>A.startView();
    document.getElementById('startBtn').onclick=()=>{
      const chosen=A._draft;A._draft=null;A._rollCount=0;A.lastResult=null;A._yearStories=[];A._deltaLifeId=null;A._resultLifeId=null;
      A.newLife(chosen);N.classList.remove('hidden');
    };
  };

  const highlightScore=h=>{
    let s=h.kind==='rare'?40:h.kind==='finance'?28:h.kind==='chaos'?24:h.kind==='spouse'||h.kind==='child'?22:10;
    if(h.tone==='bad'||h.tone==='good')s+=8;
    if(/财富|健康|配偶|孩子|毕业|创业|投资|结婚|离婚|事故|死亡/.test(`${h.title} ${h.text}`))s+=14;
    return s;
  };
  A.lifeHighlights=()=>{
    const list=[...(A.p?.history||[])].filter(h=>h.age>0&&h.kind!=='start').sort((a,b)=>highlightScore(b)-highlightScore(a));
    const picked=[];
    for(const h of list){if(picked.some(x=>Math.abs(x.age-h.age)<3)&&picked.length>=3)continue;picked.push(h);if(picked.length>=6)break;}
    return picked.sort((a,b)=>a.age-b.age);
  };

  A.deadView=()=>{
    const p=A.p,c=A.collection(),rank=A.rank?A.rank(p.score):'A',comment=A.endingCommentary(),high=A.lifeHighlights(),traits=top5(),badges=A.lifeBadges?A.lifeBadges():[],endings=p.endings||[];
    const discovered=(c.traits||[]).filter(id=>L.TRAITS.some(t=>t.id===id)).length;
    return `<section class="screen end-screen v55-end">
      <div class="v55-end-hero"><span class="rank rank-${rank}">${rank}</span><div><h1>${p.age} 岁 · ${p.deathReason}</h1><p>这局不是一句“你活完了”就打发掉。</p></div></div>
      <div class="v55-end-metrics">
        <div><span>人生综合分</span><strong>${p.score}</strong></div><div><span>财富峰值</span><strong>${L.fmtMoney(p.wealthPeak)}</strong></div>
        <div><span>最终财富</span><strong>${L.fmtMoney(p.wealth)}</strong></div><div><span>职业峰值</span><strong>${p.careerTierPeak} 阶</strong></div>
        <div><span>好 / 坏事件</span><strong>${p.positive} / ${p.negative}</strong></div><div><span>稀有事件</span><strong>${p.rareEvents}</strong></div>
      </div>

      <div class="v55-verdict"><div class="section-line"><strong>📜 人生判词</strong><span>${comment.length} 段</span></div>
        ${comment.map((x,i)=>`<p class="${i===comment.length-1?'joke':''}">${x}</p>`).join('')}
      </div>

      ${high.length?`<div class="v55-highlights"><div class="section-line"><strong>🎬 这一生的几个镜头</strong><span>${high.length} 个关键片段</span></div>
        ${high.map(h=>`<article class="${h.tone||'neutral'}"><b>${h.age} 岁 · ${h.title}</b><p>${h.text}</p><small>${h.changes||''}</small></article>`).join('')}
      </div>`:''}

      ${endings.length?`<div class="ending-unlocks"><div class="section-line"><strong>特殊结局</strong><span>${c.endings.length}/${L.ENDING_DEFS.length}</span></div>${endings.map(e=>`<div class="ending-card ${e.rarity}"><b>${e.rarity} · ${e.name}</b><span>${e.desc}</span></div>`).join('')}</div>`:''}

      <div class="end-grid"><div><div class="section-line"><strong>本局最强词条</strong><span>图鉴 ${discovered}/${L.TRAITS.length}</span></div><div class="traits-wrap">${traits.map(t=>A.traitChip(t)).join('')}</div></div>
      <div><div class="section-line"><strong>人生徽章</strong><span>${badges.length} 枚</span></div><div class="badge-wrap">${badges.length?badges.map(x=>`<span>🏅 ${x}</span>`).join(''):'<span>这局没有特别徽章</span>'}</div></div></div>
      <div class="collection-bar"><span>最高分 ${Math.max(c.bestScore||0,p.score)}</span><span>历史最高财富 ${L.fmtMoney(Math.max(c.bestWealth||0,p.wealthPeak))}</span><span>完成 ${c.runs||1} 局</span></div>
      <div class="end-actions">${p.children.length?`<button id="inheritBtn">继承 ${p.children[0].name} 开下一代</button>`:''}<button id="shareBtn2">分享这局</button><button class="primary" id="freshBtn">全新人生</button></div>
    </section>`;
  };

  A.lifeStory=()=>A.endingCommentary().join(' ');
})();