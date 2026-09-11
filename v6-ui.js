(() => {
  const A=window.APP,L=window.LIFE;
  if(!A||!L)return;
  L.VERSION='V6.0';
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  A.v6WorldStrip=()=>{
    const s=A.v6WorldSummary?.();if(!s)return'';
    return `<section class="v6-world ${s.shock?'shock':''}">
      <div class="v6-world-head"><strong>🌐 时代风向</strong><span>${s.shock?'世界事件正在发生':'世界仍在后台运行'}</span></div>
      <p>${esc(s.headline)}</p>
      <div class="v6-world-pills"><i>经济 ${s.economy}</i><i>就业 ${s.jobs}</i><i>科技 ${s.tech}</i><i>市场 ${s.market}</i><i>医疗 ${s.medicine}</i><i>冲突 ${s.conflict}</i></div>
    </section>`;
  };

  A.v6CausalBlock=()=>{
    const list=A.v6CausalHighlights?.()||[];
    const pending=A.p?.fate?.pending?.length||0;
    if(!list.length)return `<div class="info-block v6-causal"><div class="section-line"><strong>🧬 命运因果</strong><span>尚未显形</span></div><p class="v6-causal-empty">有些选择不会立刻结算。真正的因果，可能几年后才回来找你。</p>${pending?`<small>你隐约感觉还有 ${pending} 件事没有完全结束。</small>`:''}</div>`;
    return `<div class="info-block v6-causal"><div class="section-line"><strong>🧬 命运因果</strong><span>${list.length} 条已显形回响</span></div><div class="v6-chain-list">${list.map(x=>`<div class="v6-chain ${x.tone||'neutral'}"><b>${x.sourceAge??'?'} 岁</b><span>「${esc(x.sourceTitle||'某个选择')}」</span><em>→</em><b>${x.age} 岁</b><span>「${esc(x.title)}」</span></div>`).join('')}</div>${pending?`<small>另外还有一些因果尚未结算。</small>`:''}</div>`;
  };

  A.v6ForkBlock=()=>{
    const forks=A.v6Forks?.()||[];
    if(!forks.length)return'';
    const show=forks.slice(0,4);
    return `<div class="v6-counterfactual">
      <div class="section-line"><strong>🪞 如果当年……</strong><span>反事实人生</span></div>
      <p>不是重新 Roll 一个陌生人，而是回到同一个过去，从关键岔路换一个选择。之前的人生全部保留。</p>
      <div class="v6-fork-grid">${show.map(f=>`<button class="v6-fork-btn" data-fork="${esc(f.id)}"><small>${f.age} 岁 · 第 ${f.branch||1} 条世界线</small><strong>${esc(f.title)}</strong><span>回到这个选择之前 →</span></button>`).join('')}</div>
    </div>`;
  };

  A.v6EndCausality=()=>{
    const list=A.v6CausalHighlights?.()||[];
    if(!list.length)return'';
    return `<div class="v6-end-chain"><div class="section-line"><strong>🔗 这一生真正的因果链</strong><span>结果不是凭空来的</span></div>${list.slice(0,5).map(x=>`<article class="${x.tone||'neutral'}"><b>${x.sourceAge??'?'} 岁的「${esc(x.sourceTitle||'某个选择')}」</b><em>多年后</em><strong>${x.age} 岁的「${esc(x.title)}」</strong></article>`).join('')}</div>`;
  };

  const baseGame=A.gameView;
  if(typeof baseGame==='function')A.gameView=()=>{
    let html=baseGame();
    const strip=A.v6WorldStrip();
    if(strip){
      const marker='<section class="v55-latest';
      if(html.includes(marker))html=html.replace(marker,strip+marker);
      else html=html.replace('<div class="choice-head">',strip+'<div class="choice-head">');
    }
    if((A.p?.fate?.branch||1)>1){
      html=html.replace('<div class="v55-money">',`<div class="v6-branch">世界线 ${A.p.fate.branch}</div><div class="v55-money">`);
    }
    return html;
  };

  const baseInfo=A.infoView;
  if(typeof baseInfo==='function')A.infoView=()=>{
    let html=baseInfo();
    const block=A.v6CausalBlock();
    const world=A.v6WorldStrip();
    if(html.includes('<div class="full-history">')){
      const needle='<div class="info-block"><div class="section-line"><strong>完整轨迹</strong>';
      html=html.replace(needle,world+block+needle);
    }else html=html.replace('</section>',world+block+'</section>');
    return html;
  };

  const baseDead=A.deadView;
  if(typeof baseDead==='function')A.deadView=()=>{
    let html=baseDead();
    const causal=A.v6EndCausality(),forks=A.v6ForkBlock();
    const insert=causal+forks;
    if(!insert)return html;
    if(html.includes('<div class="end-actions">'))return html.replace('<div class="end-actions">',insert+'<div class="end-actions">');
    return html.replace('</section>',insert+'</section>');
  };

  const baseStart=A.startView;
  if(typeof baseStart==='function')A.startView=()=>{
    const out=baseStart();
    const sub=document.querySelector?.('.start-card p');if(sub)sub.textContent='V6 · 命运系统';
    const hint=document.querySelector?.('.opening-hint');if(hint)hint.textContent='V6：世界会自己运行；有些选择不会立刻结算；死亡后可以回到关键岔路，看看另一条世界线。';
    const brand=document.querySelector?.('.brand-mini');if(brand)brand.textContent='人生随机实验室 · V6';
    return out;
  };

  const baseBind=A.bind;
  A.bind=()=>{
    if(typeof baseBind==='function')baseBind();
    document.querySelectorAll?.('.v6-fork-btn').forEach(btn=>{
      btn.onclick=()=>{
        if(confirm?.(`回到 ${btn.querySelector('small')?.textContent||'这个人生岔路'}？当前死亡结局会保留在图鉴中。`))A.v6RewindFork?.(btn.dataset.fork);
      };
    });
  };

  // 在结局判词末尾补一段“命运解释”，让 V6 的因果系统真正进入总结。
  const baseComment=A.endingCommentary;
  if(typeof baseComment==='function')A.endingCommentary=()=>{
    const lines=[...baseComment()];
    const echoes=A.p?.fate?.echoes||[];
    if(echoes.length){
      const e=echoes[0];
      const line=`命运回看：${e.sourceAge??'更早'} 岁的「${e.sourceTitle||'某个选择'}」，最后在 ${e.age} 岁以「${e.title}」的形式回来找你。这局最像人生的地方，可能不是你做了什么，而是你根本不知道它什么时候才会结算。`;
      if(!lines.includes(line))lines.splice(Math.max(1,lines.length-1),0,line);
    }
    if((A.p?.fate?.branch||1)>1){
      const line=`你最终活在第 ${A.p.fate.branch} 条世界线上。你亲手证明了一件很烦人的事：同一个人、同一个过去，只改一个决定，后面真的可能完全不像同一部剧。`;
      if(!lines.includes(line))lines.splice(Math.max(1,lines.length-1),0,line);
    }
    return lines;
  };
})();
