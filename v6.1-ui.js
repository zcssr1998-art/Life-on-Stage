(() => {
  const A=window.APP,L=window.LIFE;
  if(!A||!L)return;
  L.VERSION='V6.1';
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const TIP={
    health:'身体状态会影响疾病、受伤、恢复和寿命，但你不会知道命运后台的精确概率。',
    happiness:'代表主观生活质量和心理韧性。它会改变低谷、关系与一些人生结局。',
    intelligence:'影响学习、专业判断和复杂路线。你只能感受到自己的大致水平，而不是一个考试分数。',
    social:'影响识人、贵人、恋爱、谈判与管理。关系的真实质量并不总会立刻暴露。',
    luck:'运气只改变概率，不承诺结果。系统不会告诉你到底加了多少成功率。',
    ambition:'影响你是否愿意进入竞争、创业、跃迁等路线。太高也会制造代价。',
    stability:'代表遭遇冲击后的恢复能力。稳定不是无事发生，而是不容易被一次事故打穿。',
    discipline:'影响长期习惯、学习、工作与执行。它更像复利能力，而不是一次性爆发。',
    risk:'影响你愿意承担多大的不确定性，也会改变极端事件出现的概率。',
    family:'代表家庭关系的整体温度。真正的裂痕和依赖往往比你看到的状态更复杂。'
  };

  const deltaWord=d=>d>0?'↗':d<0?'↘':'·';
  A.gameStats=()=>{
    const p=A.p,d=A._deltaLifeId===p.id?(A._yearDeltaStats||{}):{};
    return `<div class="v55-stats v61-fog-stats">${Object.entries(p.stats).map(([k,v])=>{
      const level=A.v61StatLevel?.(k,v)||3,band=A.v61StatBand?.(k,v)||'难以判断',dv=d[k]||0;
      return `<button class="v55-stat v61-fog-stat" onclick="__tip('${esc(`${L.ATTR[k]?.name||k}：${TIP[k]||'这项状态不会显示精确数值。'}`)}')">
        <div class="v55-stat-head"><span>${L.ATTR_ICONS?.[k]||'◆'} ${L.ATTR[k]?.name||k}</span><b>${esc(band)}</b><em class="${dv>0?'up':dv<0?'down':'flat'}">${deltaWord(dv)}</em></div>
        <div class="v61-fogbar" aria-label="${esc(band)}">${[1,2,3,4,5].map(i=>`<i class="${i<=level?'on':''}"></i>`).join('')}</div>
      </button>`;
    }).join('')}</div>`;
  };

  A.latestImpact=()=>{
    const p=A.p,stories=A._deltaLifeId===p.id?(A._yearStories||[]):[];
    if(!stories.length)return `<section class="v55-latest empty"><div class="v55-latest-head"><strong>最新人生轨迹</strong><span>这一年还没落笔</span></div><p>选一个事件。结果会告诉你发生了什么，但不会把后台概率和属性精确值全部掀给你看。</p></section>`;
    return `<section class="v55-latest"><div class="v55-latest-head"><strong>最新人生轨迹</strong><span>${stories[0]?.age??p.age-1} 岁 · ${stories.length} 件事</span></div>
      <div class="v55-story-list">${stories.slice(0,3).map((h,i)=>`<article class="v55-story ${h.tone||'neutral'}"><div><b>${i+1}</b><strong>${esc(h.title)}</strong>${h.kind==='chaos'?'<i>离谱支线</i>':''}${String(h.title).includes('拉刻西斯')?'<i>宿命奇点</i>':''}</div><p>${esc(h.text)}</p><small>${esc(A.v61MaskChanges?.(h.changes)||h.changes||'没有明显变化')}</small></article>`).join('')}</div>
    </section>`;
  };

  const baseReq=A.req;
  A.req=r=>{
    if(!r)return'';
    const a=[];
    const stats=r.stats||r.statsMin;if(stats)Object.keys(stats).forEach(k=>a.push(`${L.ATTR[k]?.name||k}还不够`));
    if(r.statsMax)Object.keys(r.statsMax).forEach(k=>a.push(`${L.ATTR[k]?.name||k}过高`));
    if(r.tagsAll)a.push('缺少必要经历');if(r.tagsAny)a.push('缺少相关经历');
    if(r.wealthMin!=null)a.push(`需要至少 ${L.fmtMoney(r.wealthMin)}`);if(r.wealthMax!=null)a.push('当前财富状态不符合');
    if(r.professionMin!=null)a.push('职业阶段还不够');
    return a.join(' · ')||(typeof baseReq==='function'?baseReq(r):'条件未满足');
  };

  const baseHistory=A.historyRow;
  A.historyRow=h=>{
    if(typeof baseHistory!=='function')return'';
    const copy={...h,changes:A.v61MaskChanges?.(h.changes)||h.changes};
    return baseHistory(copy);
  };

  const baseCard=A.actionCard;
  A.actionCard=(a,i)=>{
    let html=baseCard(a,i);
    if(a?._v61Singularity)html=html.replace('action-card','action-card v61-singularity-card');
    if(String(a?.id||'').startsWith('v61_b_'))html=html.replace('action-card','action-card v61-aftershock-card');
    return html;
  };

  A.v61SingularityInfo=()=>{
    const s=A.p?.fate?.singularity;if(!s||s.missed)return'';
    if(!s.resolved)return `<div class="info-block v61-singularity-info dormant"><div class="section-line"><strong>✦ 命运深处</strong><span>尚未显形</span></div><p>你的人生里似乎有一个还没有到来的分岔。具体时间和内容都被隐藏。</p></div>`;
    return `<div class="info-block v61-singularity-info"><div class="section-line"><strong>✦ ${esc(s.name||'拉刻西斯节点')}</strong><span>${s.age} 岁 · 已发生</span></div><p>你在这里选择了「${esc(s.choiceTitle||'未知')}」。从这一刻开始，后半生不再只是同一条路上的随机波动，而是进入了另一种结构。</p><small>其它可能性暂不展示。只有走到结局，你才能真正回看这个节点。</small></div>`;
  };

  const baseInfo=A.infoView;
  if(typeof baseInfo==='function')A.infoView=()=>{
    let html=baseInfo();const block=A.v61SingularityInfo();
    const needle='<div class="info-block v54-history-block">';
    if(html.includes(needle))html=html.replace(needle,block+needle);else html=html.replace('</section>',block+'</section>');
    return html;
  };

  A.v61EndBlock=()=>{
    const s=A.p?.fate?.singularity;if(!s?.resolved)return'';
    const branch={venture:'破局线',scholar:'深潜线',bond:'同盟线',voyage:'远航线'}[s.branch]||'未知世界线';
    return `<section class="v61-end-singularity"><div class="v61-singularity-symbol">✦</div><div class="section-line"><strong>${esc(s.name||'拉刻西斯节点')}</strong><span>${esc(s.subtitle||'宿命奇点')}</span></div><h2>${s.age} 岁，是这条人生真正开始偏航的地方。</h2><p>当时你选择了「${esc(s.choiceTitle||'未知选择')}」，此后进入 <b>${branch}</b>。结局不是说其它选择一定更好，而是告诉你：从这里开始，其它人生真的已经不再是同一条曲线。</p><button id="v61RewindBtn">↶ 回到 ${s.age} 岁，再走一次拉刻西斯节点</button><small>会保留本局图鉴与结算记录，并开启新的世界线编号。</small></section>`;
  };

  const baseDead=A.deadView;
  if(typeof baseDead==='function')A.deadView=()=>{
    let html=baseDead(),block=A.v61EndBlock();if(!block)return html;
    if(html.includes('<div class="end-actions">'))return html.replace('<div class="end-actions">',block+'<div class="end-actions">');
    return html.replace('</section>',block+'</section>');
  };

  const baseGame=A.gameView;
  if(typeof baseGame==='function')A.gameView=()=>{
    let html=baseGame();const s=A.p?.fate?.singularity;
    if(s&&!s.resolved&&A.p?.age===s.age){
      html=html.replace(/<div class="choice-head"><strong>.*?<\/strong><span>.*?<\/span><\/div>/,`<div class="choice-head v61-singularity-head"><strong>✦ ${esc(s.name)} · ${esc(s.subtitle)}</strong><span>4 条人生，只能选 1 条</span></div>`);
      html=html.replace('screen game-screen v55-game','screen game-screen v55-game v61-singularity-year');
    }
    return html;
  };

  const baseBind=A.bind;
  A.bind=()=>{
    baseBind?.();
    const b=document.getElementById('v61RewindBtn');if(b)b.onclick=()=>{
      if(confirm?.('确定回到拉刻西斯节点？当前结局会留在图鉴里，并开启一条新的世界线。'))A.v61RewindSingularity?.();
    };
  };

  const baseStart=A.startView;
  if(typeof baseStart==='function')A.startView=()=>{
    const out=baseStart();
    const sub=document.querySelector?.('.start-card p');if(sub)sub.textContent='V6.1 · 黑箱命运';
    const hint=document.querySelector?.('.opening-hint');if(hint)hint.textContent='V6.1：属性不再公开精确值。你只能观察状态、趋势与现实后果；年轻时期还潜伏着一个一生只出现一次的宿命奇点。';
    const brand=document.querySelector?.('.brand-mini');if(brand)brand.textContent='人生随机实验室 · V6.1';
    return out;
  };
})();
