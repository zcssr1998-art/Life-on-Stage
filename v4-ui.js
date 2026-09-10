window.APP = window.APP || {};
(() => {
  const A=window.APP,L=window.LIFE,R=document.getElementById('root'),M=document.getElementById('modal');
  const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const av=n=>`<div class="portrait">${L.svgAvatar(L.AVATARS[n]||L.AVATARS[0])}</div>`;
  A.stat=(k,v)=>{const a=L.ATTR[k]||{name:k,tip:''};return`<button class="stat-row" data-tip="${esc(a.tip)}" onclick="__tip('${a.name}：${String(a.tip).replace(/'/g,'’')}')"><div class="stat-top"><span>${a.name}</span><b>${v}</b></div><div class="bar"><div class="fill" style="width:${v}%"></div></div></button>`};
  A.tg=t=>{const d=A.trait(t),i=d.kind==='synergy'?'🧬 ':d.kind==='achievement'?'🏆 ':d.kind==='hidden-tag'?'◈ ':'';return`<span class="tag ${d.kind}" data-tip="${esc(d.tip)}" onclick="__tip('${String(t).replace(/'/g,'’')}：${String(d.tip).replace(/'/g,'’')}')">${i}${esc(t)}</span>`};
  window.__tip=A.note;

  A.startView=()=>{
    if(!A.d)A.d=A.draft();const D=A.d;
    R.innerHTML=`<section class="start-screen v4-start">
      <div class="start-title"><div><h2>从 1 岁开始 Roll 一局人生</h2><p>头像你选；出生条件随机。1 岁第一件事就是抓周，之后每年默认只点一次。</p></div><div class="flow-pill">V4 · 一键一年</div></div>
      <div class="start-grid">
        <div class="roll-card"><h3>🎲 本局出生条件</h3>
          <div class="roll-lines"><div class="roll-line">家庭<br><b>${D.b[0]}</b></div><div class="roll-line">世界<br><b>${D.w.name}</b></div><div class="roll-line">人格<br><b>${D.pe[0]}</b></div><div class="roll-line">天赋<br><b>${D.ta[0]}</b></div><div class="roll-line">缺陷<br><b>${D.f[0]}</b></div><div class="roll-line">家庭关系<br><b>${D.s.family}</b></div></div>
          <div class="section-title">基础属性 · 每个数字都会参与门槛 / 概率 / 隐藏机制</div>${Object.entries(D.s).map(([k,v])=>A.stat(k,v)).join('')}
          <div class="legacy-note">同一个选择不会固定结局。属性只是在“偷偷推概率”，高属性也可能翻车，低属性也可能走狗屎运。</div>
        </div>
        <div class="avatar-section"><h3>🪪 选择头像 · 30 个完全不同的角色原型</h3>
          <div class="avatar-grid avatar-grid-v4">${L.AVATARS.map(a=>`<button class="avatar-card avatar-v4 ${D.avatar===a.id?'active':''}" data-id="${a.id}">${L.svgAvatar(a)}<span>${a.name}</span></button>`).join('')}</div>
          <div class="start-actions"><button class="ghost" id="reroll">🎲 重 Roll 出生条件</button><button class="primary" id="start">从 1 岁开始</button></div>
        </div>
      </div></section>`;
    R.querySelectorAll('.avatar-card').forEach(b=>b.onclick=()=>{D.avatar=+b.dataset.id;A.startView()});
    document.getElementById('reroll').onclick=()=>{const old=D.avatar;A.d=A.draft();A.d.avatar=old;A.startView()};
    document.getElementById('start').onclick=()=>{const d=A.d;A.d=null;A.newLife(d)};
    document.getElementById('seedBox').textContent='SEED —';
  };

  A.actionCard=(x,i)=>{
    const ok=A.pass(x.requires||{}), req=x.requires&&Object.keys(x.requires).length?A.req(x.requires):'';
    const uncertainty=x.fixed?'固定节点 Buff':'🎲 结果未知 · 同一选择可走不同分支';
    return `<button class="event-card v4-action ${x.hidden?'hidden-event':''} ${ok?'':'locked'}" data-i="${i}" ${ok?'':'disabled'}>
      <div class="event-topline"><span class="cat">${x.hidden?'🔓 隐藏':esc(x.category)}</span><span class="uncertain">${uncertainty}</span></div>
      <h4>${esc(x.title)}</h4>
      ${x.actionLabel?`<div class="action-label">你打算：${esc(x.actionLabel)}</div>`:''}
      <p>${esc(x.desc||x.hint||'')}</p>
      ${x.hint?`<div class="hintline">${esc(x.hint)}</div>`:''}
      ${req?`<div class="reqline ${ok?'met':'unmet'}">${ok?'✓ 已满足':'🔒 需要'}：${esc(req)}</div>`:''}
    </button>`;
  };

  A.lastCard=()=>{
    const r=A.lastResult;if(!r)return'';
    return `<div class="last-result"><div class="last-head"><span>${r.age} 岁 · 上一年结果</span><b>${esc(r.title)}</b></div><div class="last-text">${esc(r.text)}</div><div class="delta">${esc(r.changes)}</div>
      ${r.extras?.length?`<div class="side-stories">${r.extras.map(e=>`<div class="side-story"><strong>${esc(e.title)}</strong><span>${esc(e.text)}</span><em>${esc(e.changes||'')}</em></div>`).join('')}</div>`:''}
    </div>`;
  };

  A.game=()=>{
    const P=A.p;P.score=A.score();const j=A.job(P.career),tags=[...P.tags].sort((a,b)=>({'synergy':0,'hidden-tag':1,'achievement':2,'state':3}[A.trait(a).kind]??4)-({'synergy':0,'hidden-tag':1,'achievement':2,'state':3}[A.trait(b).kind]??4));
    const spouse=P.spouse?`${av(P.spouse.avatar)}<div><b>${esc(P.spouse.name)}</b> · ${esc(P.spouse.trait)}<br><span class="subtle">${esc(A.job(P.spouse.career).name)} · TA 的人生由系统自己跑</span></div>`:'<div>💍 暂无伴侣</div>';
    R.innerHTML=`<div class="game-grid v4-game"><aside class="sidebar">
      <div class="identity">${av(P.avatar)}<div><h2>${esc(P.name)} · ${esc(P.personality)}</h2><div class="subtle">${esc(P.background)} · 天赋 ${esc(P.talent)} · 缺陷 ${esc(P.flaw)}</div></div></div>
      <div class="world-pill">${P.world.name}<br><span class="subtle">${P.world.desc}</span></div><div class="wealth">${L.fmtMoney(P.wealth)}</div>
      <div class="section-title">属性 · 点击可看它到底控制什么</div>${Object.entries(P.stats).map(([k,v])=>A.stat(k,v)).join('')}
      <div class="section-title">人生状态</div><div class="career-box"><div class="family-member"><b>🎓 ${esc(P.education||'未记录')}</b><br><span class="subtle">当前阶段：${L.STAGE(P.age)}</span></div><div class="family-member"><b>💼 ${esc(j.name)}</b><br><span class="subtle">月收入基准 ${L.fmtMoney(Math.round(j.salary*P.salaryMul))} · 职级 ${j.tier}</span></div></div>
      <div class="section-title">家庭</div><div class="family-box"><div class="family-member spouse-line">${spouse}</div><div class="family-member">👶 子女 ${P.children.length} 名${P.children.length?' · '+P.children.map(c=>esc(c.name)).join('、'):''}</div><div class="family-member">🌳 家族第 ${P.generation} 代</div></div>
      <div class="section-title">标签 / 成就 / 构筑</div><div class="tag-wrap">${tags.map(A.tg).join('')}</div>
      <div class="sidebar-actions"><button class="ghost" id="save">保存</button><button class="ghost" id="load">读取</button><button class="danger" id="restart">重开</button></div>
    </aside><section class="main-panel">
      <div class="year-head"><div><div class="age">${P.age}<small>岁</small></div><div class="phase">${L.STAGE(P.age)} · 财富峰值 ${L.fmtMoney(P.wealthPeak)} · 已记录 ${P.history.length} 条人生轨迹</div></div><div class="score"><strong>${P.score}</strong><span>人生综合分</span></div></div>
      ${A.lastCard()}${A.notice?`<div class="mechanic-banner">${esc(A.notice)}</div>`:''}
      <div class="year-zone v4-year"><div class="year-zone-title"><div><h3>这一年，你从 5 条路里选 1 条</h3><p>点一次就直接结算并进入下一年。没有第二级菜单，也没有“再点下一年”。</p></div><span class="one-click">1 CLICK = 1 YEAR</span></div>
        <div class="event-grid event-grid-five">${A.year.map(A.actionCard).join('')}</div>
      </div>
      <div class="history"><h3>人生轨迹 <span class="subtle">· 配偶/孩子的插曲会自动写进来，不打断操作</span></h3><div class="history-list">${P.history.slice(0,120).map(h=>`<div class="history-item ${h.type==='hidden'?'hidden-history':h.type==='synergy'?'synergy-history':h.type==='side'?'side-history':''}"><div class="h-age">${h.age} 岁</div><div><strong>${esc(h.title)}</strong>：${esc(h.text)}<div class="changes">${esc(h.changes||'')}</div></div></div>`).join('')}</div></div>
    </section></div>`;
    document.getElementById('save').onclick=()=>{A.save();A.note('已保存到当前浏览器')};document.getElementById('load').onclick=A.load;
    document.getElementById('restart').onclick=()=>{if(confirm('确定重开？族谱保留。')){localStorage.removeItem(L.STORAGE_KEY);A.p=null;A.year=[];A.lastResult=null;A.d=A.draft();A.startView()}};
    R.querySelectorAll('.v4-action[data-i]').forEach(b=>b.onclick=()=>{if(b.disabled)return;b.disabled=true;b.classList.add('resolving');A.choose(+b.dataset.i)});
  };

  A.dead=()=>{
    const P=A.p,e=P.rareEnding||A.ending(),ks=P.children||[];
    const rareClass=e.rarity==='SSR'?'ssr':e.rarity==='SR'?'sr':e.rarity==='R'?'r':'';
    R.innerHTML=`<section class="start-screen ending-screen"><div class="ending-hero ${rareClass}"><div><span class="rarity">${e.rarity} ENDING</span><h2>${esc(e.title)}</h2><p>${esc(e.summary)}</p></div><div class="ending-age"><b>${P.age}</b><span>岁</span></div></div>
      <div class="ending-grid"><div class="roll-card"><h3>这一局留下了什么</h3><div class="roll-lines"><div class="roll-line">最终职业<br><b>${esc(A.job(P.career).name)}</b></div><div class="roll-line">财富峰值<br><b>${L.fmtMoney(P.wealthPeak)}</b></div><div class="roll-line">人生综合分<br><b>${P.score}</b></div><div class="roll-line">子女<br><b>${ks.length}</b></div><div class="roll-line">家族代数<br><b>${P.generation}</b></div><div class="roll-line">死因<br><b>${esc(P.deathReason)}</b></div></div>
      <div class="section-title">特殊成果</div><div class="tag-wrap">${[...new Set([...(e.synergies||[]),...(e.achievements||[]),...(P.tags.filter(t=>['27俱乐部','天才早逝','白手起家'].includes(t)))])].map(A.tg).join('')||'<span class="subtle">没有稀有构筑，但这仍是一条完整人生。</span>'}</div></div>
      <div class="roll-card"><h3>🌳 是否把这局接到下一代</h3>${ks.length?`<p class="subtle">子女继承部分属性倾向、家族资源和传承加成。主角仍然只有一个。</p><div class="child-actions">${ks.map(c=>`<button class="primary inherit" data-id="${c.id}">继承 ${esc(c.name)} · 第${c.generation}代</button>`).join('')}</div>`:'<p class="subtle">本局没有直接继承人，族谱会保留这一代记录。</p>'}<div class="start-actions"><button class="ghost" id="tree2">🌳 查看族谱</button><button class="danger" id="fresh">开启全新人生</button></div></div></div>
      <div class="history ending-history"><h3>这辈子的关键轨迹</h3><div class="history-list">${P.history.slice(0,80).map(h=>`<div class="history-item"><div class="h-age">${h.age} 岁</div><div><strong>${esc(h.title)}</strong>：${esc(h.text)}<div class="changes">${esc(h.changes||'')}</div></div></div>`).join('')}</div></div></section>`;
    R.querySelectorAll('.inherit').forEach(b=>b.onclick=()=>A.asChild(b.dataset.id));document.getElementById('tree2').onclick=A.tree;document.getElementById('fresh').onclick=()=>{A.p=null;A.lastResult=null;A.d=A.draft();A.startView()};
  };

  A.render=()=>{if(!A.p)return A.startView();document.getElementById('seedBox').textContent='SEED '+A.p.seed;if(!A.p.alive)return A.dead();A.game()};

  A.tree=()=>{const ms=[...A.dynasty().members].sort((a,b)=>a.generation-b.generation);M.classList.remove('hidden');M.innerHTML=`<div class="modal"><button class="ghost modal-close" id="x">关闭</button><h2>🌳 家族谱</h2><p class="subtle">每一代只控制一个主角。配偶是配角，孩子是低频龙套；死亡后才可把其中一个孩子升格成下一代主角。</p><div class="tree">${ms.length?ms.map(m=>`<div class="tree-node ${A.p&&m.id===A.p.id?'current':''}"><div class="generation">第 ${m.generation} 代</div><div style="display:flex;gap:10px;align-items:center">${av(m.avatar)}<div><b>${esc(m.name)}</b> · ${esc(m.status)}<br><span class="subtle">${esc(m.career||'—')} · ${m.age||0}岁 · ${L.fmtMoney(m.wealth||0)}</span></div></div></div>`).join(''):'<div class="tree-node">族谱还是空的。</div>'}</div></div>`;document.getElementById('x').onclick=A.close};
  A.close=()=>{M.classList.add('hidden');M.innerHTML=''};
})();
