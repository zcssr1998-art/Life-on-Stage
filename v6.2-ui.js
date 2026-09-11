(() => {
  const A=window.APP,L=window.LIFE;
  if(!A||!L)return;
  L.VERSION='V6.2';
  const R=document.getElementById('root'),N=document.getElementById('bottomNav');
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const tip=s=>esc(String(s||'').replace(/\n/g,' '));
  const traitObj=ref=>L.TRAITS.find(x=>x.id===ref.id)||ref;
  const traitPower=ref=>{const t=traitObj(ref),r=L.RARITY[t.rarity]?.rank||0,stat=Object.values(t.effects||{}).reduce((s,v)=>s+Math.max(0,v),0);return r*100+stat};
  const topTraits=()=>[...(A.p?.traits||[])].sort((a,b)=>traitPower(b)-traitPower(a)).slice(0,5);
  const av=n=>`<div class="portrait">${L.svgAvatar(L.AVATARS[n]||L.AVATARS[0])}</div>`;
  const trend=d=>d>0?'↗':d<0?'↘':'·';
  const tone=d=>d>0?'up':d<0?'down':'flat';
  const money=n=>L.fmtMoney?L.fmtMoney(n):`¥${Math.round(n||0)}`;

  const traitMini=ref=>{const t=traitObj(ref),r=L.RARITY[t.rarity]||{name:t.rarity};return `<button class="v62-trait r-${t.rarity}" onclick="__tip('${tip(`${t.name} · ${r.name}：${t.desc||'已获得词条'}`)}')"><span>${esc(t.name)}</span><em>${esc(r.name)}</em></button>`};

  A.v62SelfCard=()=>{
    const p=A.p,j=A.job(p.career,p),wd=A._deltaLifeId===p.id?(A._yearDeltaWealth||0):0;
    return `<section class="v62-self-card">
      <div class="v62-person-main">${av(p.avatar)}<div><div class="v62-person-title"><strong>${p.age} 岁</strong><span>${esc(p.gender||'未知')} · ${A.phase(p.age)}</span></div><b class="v62-job">${esc(j.icon||'🧳')} ${esc(j.name)}</b><small>${p.careerRoute?`职业线第 ${p.careerLevel||1}/5 阶`:'尚未进入稳定职业线'}</small></div></div>
      <div class="v62-money"><strong>${money(p.wealth)}</strong>${wd?`<i class="${wd>0?'up':'down'}">${wd>0?'+':''}${money(wd)}</i>`:''}<span>人生分 ${A.score()}</span></div>
      <div class="v62-toptraits">${topTraits().map(traitMini).join('')}</div>
    </section>`;
  };

  A.v62SpouseCard=()=>{
    const p=A.p,s=p.spouse;if(!s)return'';A.spouse?.();
    const age=A.v62SpouseAge?.()||p.age,j=A.v62SpouseJob?.(),last=s.history?.[0]?.text||'这一年还没有特别值得记下的变化。';
    return `<section class="v62-spouse-card">
      <div class="v62-spouse-head">${av(s.avatar)}<div><small>💞 伴侣</small><strong>${esc(s.name)} · ${esc(s.gender||'未知')} · ${age} 岁</strong><span>${esc(s.trait||'性格普通')}</span></div></div>
      <div class="v62-spouse-work"><b>${esc(j?.icon||'🧳')} ${esc(j?.name||'暂时待业')}</b><span>月收入约 ${money(j?.salary||0)}</span></div>
      <p><i>今年：</i>${esc(last)}</p>
    </section>`;
  };

  A.gameHud=()=>`<div class="v62-hudpack"><div class="v62-people ${A.p?.spouse?'coupled':''}">${A.v62SelfCard()}${A.v62SpouseCard()}</div>${A.financeStrip?.()||''}</div>`;

  // 属性彻底去掉“5 格等级条”。只保留现实感知 + 本年趋势，不再暗示一个固定档位系统。
  A.gameStats=()=>{
    const p=A.p,d=A._deltaLifeId===p.id?(A._yearDeltaStats||{}):{};
    return `<section class="v62-states"><div class="v62-state-head"><strong>身体与状态</strong><span>只显示体感，不公开后台刻度</span></div><div class="v62-state-grid">${Object.entries(p.stats).map(([k,v])=>{
      const dv=d[k]||0,band=A.v61StatBand?.(k,v)||'难以判断';
      return `<button class="v62-state" onclick="__tip('${tip(`${L.ATTR[k]?.name||k}：${L.ATTR[k]?.tip||'这项状态不会公开精确数值。'}`)}')"><span>${L.ATTR_ICONS?.[k]||'◆'} ${esc(L.ATTR[k]?.name||k)}</span><b>${esc(band)}</b><em class="${tone(dv)}">${trend(dv)}</em></button>`;
    }).join('')}</div></section>`;
  };

  // 1~3 件事永远放进同一个文本框，只做内部切割。
  A.latestImpact=()=>{
    const p=A.p,stories=A._deltaLifeId===p.id?(A._yearStories||[]):[];
    if(!stories.length)return `<section class="v62-latest empty"><div class="v62-latest-head"><strong>最新人生轨迹</strong><span>这一年还没落笔</span></div><p>你还没有做出今年的选择。结果只告诉你现实发生了什么，不会把后台概率掀开。</p></section>`;
    return `<section class="v62-latest"><div class="v62-latest-head"><strong>最新人生轨迹</strong><span>${stories[0]?.age??p.age-1} 岁 · ${stories.length} 件事</span></div><div class="v62-latest-box">${stories.slice(0,3).map((h,i)=>`<div class="v62-story ${h.tone||'neutral'}"><div><b>${i+1}</b><strong>${esc(h.title)}</strong>${h.kind==='chaos'?'<i>离谱支线</i>':''}</div><p>${esc(h.text)}</p><small>${esc(A.v61MaskChanges?.(h.changes)||h.changes||'没有明显变化')}</small></div>`).join('<hr>')}</div></section>`;
  };

  const categoryMeta=a=>{
    const t=`${a.category||''} ${a.title||''}`;
    if(/职业|工作|创业|副业|项目/.test(t))return ['事业','现金流','压力'];
    if(/家庭|伴侣|恋爱|关系/.test(t))return ['关系','时间','情绪'];
    if(/健康|运动|医疗/.test(t))return ['身体','时间','恢复'];
    if(/投资|财富|资产|买房/.test(t))return ['现金流','风险','机会'];
    if(/学习|成长|教育|技能/.test(t))return ['能力','时间','未来路线'];
    if(/社交|朋友|人脉/.test(t))return ['关系','机会','情绪'];
    return ['时间','情绪','未知后果'];
  };
  const cardContext=a=>{
    if(a?._v61Singularity)return '这不是普通选择。它会改变后半生的事件结构。';
    if(a?._v62Promotion)return '这次结果会决定你是否进入职业路线的下一阶。';
    if(a?.rare||a?.hidden)return '你隐约感觉，这件事可能比表面看起来更重要。';
    return '结果不是固定答案，会被你的经历、时代与运气共同改写。';
  };
  A.actionCard=(a,i)=>{
    const locked=!A.pass(a.requires||{}),req=locked?A.req(a.requires||{}):'',chips=categoryMeta(a);
    const cls=[a?._v61Singularity?'v61-singularity-card':'',String(a?.id||'').startsWith('v61_b_')?'v61-aftershock-card':'',a?._v62Promotion?'v62-promo':'',a?.rare||a?.hidden?'rare-action':'',locked?'locked':''].filter(Boolean).join(' ');
    return `<button class="action-card v62-action ${cls}" data-i="${i}" ${locked?'disabled':''}><div class="v62-action-top"><span>${esc(a.category||'事件')}</span>${a.rare||a.hidden?'<b>✦</b>':''}</div><strong>${esc(a.title)}</strong><p>${esc(a.desc||'')}</p><div class="v62-action-chips">${chips.map(x=>`<i>${esc(x)}</i>`).join('')}</div><small>${locked?`🔒 ${esc(req)}`:esc(cardContext(a))}</small></button>`;
  };

  A.v62CareerPanel=()=>{
    const p=A.p,route=A.v62EnsureCareer?.();if(!route)return `<div class="info-block v62-career"><div class="section-line"><strong>🧳 职业线</strong><span>尚未进入</span></div><p>你的职业身份还没有稳定下来。毕业、学徒、转行和机会事件会把你带进某条路线。</p></div>`;
    return `<div class="info-block v62-career"><div class="section-line"><strong>${esc(route.icon)} ${esc(route.group)}职业线</strong><span>${p.careerLevel||1}/5 阶</span></div><div class="v62-career-ladder">${route.titles.map((x,i)=>`<div class="${i+1===(p.careerLevel||1)?'now':i+1<(p.careerLevel||1)?'done':''}"><b>${i+1}</b><span>${esc(x)}</span><small>${money(route.salaries[i])}/月</small></div>`).join('')}</div></div>`;
  };

  const baseInfo=A.infoView;
  if(typeof baseInfo==='function')A.infoView=()=>{
    let html=baseInfo(),panel=A.v62CareerPanel();
    const needle='<div class="info-block v56-finance-history">';
    if(html.includes(needle))html=html.replace(needle,panel+needle);else html=html.replace('</section>',panel+'</section>');
    return html;
  };

  A.startView=()=>{
    const d=A.draft(),c=A.collection();A._draft=d;A._rollCount=(A._rollCount||0)+1;
    const discovered=(c.traits||[]).filter(id=>L.TRAITS.some(t=>t.id===id)).length;
    const world=d.w||{};
    const cash=d.wealth<30000?'起步紧绷':d.wealth<70000?'普通起步':'起步宽松';
    R.innerHTML=`<section class="screen start-screen v62-start">
      <div class="v62-start-hero">${av(d.avatar)}<div><h1>人生随机实验室</h1><p>V6.2 · 黑箱命运</p><span>${esc(d.gender)} · 第 ${A._rollCount} 次 Roll</span></div></div>
      <section class="v62-start-world"><div><small>🌐 时代</small><strong>${esc(world.name||'普通时代')}</strong><p>${esc(world.desc||'世界会在后台继续变化。')}</p></div><span>这一项只描述你出生时的宏观环境；后面的人生仍可能遇到经济、技术和社会周期反转。</span></section>
      <section class="v62-origin"><div class="section-line"><strong>出生档案</strong><span>不是属性表，是你出生时已经存在的现实</span></div><div class="v62-origin-grid">
        <article><small>🏠 家庭</small><strong>${esc(d.b?.[0]||'普通家庭')}</strong><span>${cash}</span></article>
        <article><small>🗺️ 成长环境</small><strong>${esc(d.v62Growth?.[0]||'普通社区')}</strong><span>${esc(d.v62Growth?.[1]||'')}</span></article>
        <article><small>👨‍👩‍👧 家庭位置</small><strong>${esc(d.v62Birth?.[0]||'独生子女')}</strong><span>它会悄悄改变你对责任和关系的习惯。</span></article>
        <article><small>🌡️ 家庭气候</small><strong>${esc(d.v62Climate?.[0]||'普通')}</strong><span>很多长期性格，其实比你记得更早形成。</span></article>
        <article><small>🧠 性格底色</small><strong>${esc(d.pe?.[0]||'普通')}</strong><span>它不会决定你，但会改变你更容易做出的选择。</span></article>
        <article><small>✨ 天赋</small><strong>${esc(d.ta?.[0]||'尚未显形')}</strong><span>优势会有用，但未必在你最需要时出现。</span></article>
        <article><small>🕳️ 短板</small><strong>${esc(d.f?.[0]||'尚未显形')}</strong><span>真正麻烦的往往不是短板本身，而是你什么时候才意识到。</span></article>
        <article><small>🎭 主角</small><strong>${esc(d.gender)} · 随机头像</strong><span>伴侣出现后也会有独立年龄、职业与人生轨迹。</span></article>
      </div></section>
      <section class="v62-start-traits"><div class="section-line"><strong>开局随机词条 ×5</strong><span>图鉴 ${discovered}/${L.TRAITS.length}</span></div><div class="start-traits">${d.traits.map(t=>A.traitChip(t)).join('')}</div><p>有些词条看起来只是习惯；同类倾向叠得足够深时，可能会发生你没被提前告知的变化。</p></section>
      <section class="v62-opening-rumor"><strong>✦ 命运传闻</strong><p>这局年轻时期存在一个只出现一次的重大分岔，但具体年龄、内容和真正影响都不会提前告诉你。</p></section>
      <div class="start-actions"><button class="reroll-button" id="rerollBtn">🎲 再 Roll 一次</button><button class="start-button" id="startBtn">就这把，开始 →</button></div>
      <small class="start-meta">头像随机 · 主角性别随机 · 开局允许反复 Roll · 本机已完成 ${c.runs||0} 局</small>
    </section>`;
    N.classList.add('hidden');
    document.getElementById('rerollBtn').onclick=()=>A.startView();
    document.getElementById('startBtn').onclick=()=>{const chosen=A._draft;A._draft=null;A._rollCount=0;A.lastResult=null;A._yearStories=[];A._deltaLifeId=null;A._resultLifeId=null;A.newLife(chosen);N.classList.remove('hidden')};
  };

  // 让 V6.1 的版本文案保持最新。
  const baseStart=A.startView;
  A.startView=()=>{baseStart();const brand=document.querySelector('.brand-mini');if(brand)brand.textContent='人生随机实验室 · V6.2';};
})();