(() => {
  const A=window.APP,L=window.LIFE;if(!A||!L)return;
  L.VERSION='V6.3';
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const pick=x=>L.pick?L.pick(x):x[Math.floor(Math.random()*x.length)];
  const av=n=>`<div class="portrait">${L.svgAvatar(L.AVATARS[n]||L.AVATARS[0])}</div>`;
  const rels=()=>A.p?.relationships||[];
  const importance=r=>(r.relation==='伴侣'?1000:0)+(r.affinity||0)*6+(r.sharedEvents||0)*8+(r.alive===false?5:0);

  A.v63RelationshipPanel=()=>{
    const p=A.p;if(!p)return'';const list=[...rels()].sort((a,b)=>importance(b)-importance(a)).slice(0,14),alive=list.filter(x=>x.alive!==false).length,dead=list.filter(x=>x.alive===false).length;
    const cards=list.map(r=>{const age=r.alive===false?(r.deathAge||A.v63RelationAge(r)):A.v63RelationAge(r),job=A.v63RelationJob(r),role=A.v63RelationRole(r),last=r.history?.[0]?.text||'目前还没有值得单独记下的新轨迹。';return `<article class="v63-rel-card ${r.alive===false?'dead':''} ${role==='仇人'||role==='对头'?'hostile':''} ${role==='伴侣'?'partner':''}">
      <div class="v63-rel-head">${av(r.avatar)}<div><strong>${esc(r.name)}</strong><span>${esc(r.gender)} · ${r.alive===false?`享年 ${age} 岁`:`${age} 岁`}</span></div><b>${r.alive===false?'已故':role}</b></div>
      <div class="v63-rel-job">${esc(job.icon)} ${esc(job.name)}</div>
      <div class="v63-rel-meta"><span>${esc(A.v63RelationBand(r.affinity||0))}</span><span>相识于你 ${r.metAge||'?'} 岁</span><span>${r.sharedEvents||0} 次交集</span></div>
      <p>${esc(last)}</p>
    </article>`}).join('');
    const links=(p.socialLinks||[]).slice(-6).reverse().map(x=>{const a=A.v63FindRelation(x.a),b=A.v63FindRelation(x.b);return a&&b?`<span>${esc(a.name)} ↔ ${esc(b.name)} · ${esc(x.type)}</span>`:''}).filter(Boolean).join('');
    return `<div class="info-block v63-network"><div class="section-line"><strong>🕸️ 关系网</strong><span>在世 ${alive} · 已故 ${dead} · 圈内联系 ${(p.socialLinks||[]).length}</span></div>
      ${list.length?`<div class="v63-rel-grid">${cards}</div>${links?`<div class="v63-links">${links}</div>`:''}`:'<p class="v63-empty">18 岁以后，偶遇、共同经历、冲突和长期往来会把人逐渐写进这里。伴侣不再凭空刷新。</p>'}
    </div>`;
  };

  const baseInfo=A.infoView;
  if(typeof baseInfo==='function')A.infoView=()=>{
    let html=baseInfo(),panel=A.v63RelationshipPanel();
    const needle='<div class="info-block v62-career">';
    if(html.includes(needle))html=html.replace(needle,panel+needle);
    else html=html.replace('<div class="info-block"><div class="section-line"><strong>完整轨迹</strong>',panel+'<div class="info-block"><div class="section-line"><strong>完整轨迹</strong>');
    return html;
  };

  const baseSpouse=A.v62SpouseCard;
  if(typeof baseSpouse==='function')A.v62SpouseCard=()=>{
    const p=A.p,s=p?.spouse;if(!s)return'';const r=A.v63FindRelation?.(s.relId||s.id);
    if(!r||r.alive!==false)return baseSpouse();
    const job=A.v63RelationJob(r),last=r.history?.[0]?.text||'这段关系停在了这里。';
    return `<section class="v62-spouse-card v63-spouse-dead"><div class="v62-spouse-head">${av(r.avatar)}<div><small>🕯️ 伴侣 · 已故</small><strong>${esc(r.name)} · ${esc(r.gender)} · 享年 ${r.deathAge||A.v63RelationAge(r)} 岁</strong><span>${esc(r.trait||'')}</span></div></div><div class="v62-spouse-work"><b>${esc(job.icon)} 生前：${esc(job.name)}</b><span>${esc(r.deathReason||'')}</span></div><p><i>最后记录：</i>${esc(last)}</p></section>`;
  };

  A.v63Aftermath=()=>{
    const p=A.p;if(!p)return[];if(Array.isArray(p.v63Aftermath)&&p.v63Aftermath.length)return p.v63Aftermath;
    const top=[...rels()].filter(r=>(r.affinity||0)>5).sort((a,b)=>importance(b)-importance(a)).slice(0,5);
    const lines=top.map((r,i)=>{
      const role=A.v63RelationRole(r),job=A.v63RelationJob(r),age=A.v63RelationAge(r),bond=A.v63RelationBand(r.affinity||0);
      if(r.alive===false)return {name:r.name,role,status:`先于你离世 · 享年 ${r.deathAge||age} 岁`,text:`你死去时，${r.name} 已经不在了。${r.deathReason?`TA当年因${r.deathReason}离世。`:''}但你们之间那 ${r.sharedEvents||1} 次真正的交集，仍然留在别人讲起你的故事里。`};
      if(role==='伴侣'){
        const bank=[
          `${r.name} 把你留下的照片、聊天记录和旧物重新整理了一遍。很多年后，家里仍有人能准确说出你最爱讲的那几个故事。`,
          `${r.name} 在葬礼后很久都没有改掉某些和你一起养成的习惯。TA继续过自己的生活，但你的名字没有从那段生活里真正消失。`,
          `${r.name} 接手了你没来得及收尾的一部分家庭事务。后来别人提起你时，最完整的版本往往来自TA。`
        ];
        return {name:r.name,role,status:`在世 · ${age} 岁`,text:pick(bank)};
      }
      if(role==='挚友'||role==='好友'){
        const bank=[
          `${r.name} 在你的葬礼上站了很久。之后TA仍在「${job.name}」这条路上继续往前走，只是偶尔会把你们年轻时的旧事讲给后来认识的人听。`,
          `${r.name} 成了少数还会主动联系你家人的朋友。你死后，TA没有把你变成一个被纪念一次就结束的名字。`,
          `${r.name} 后来又认识了很多人，但提起真正的老朋友时，你仍然排在很前面。TA把你们的一段共同经历反复讲了很多年。`
        ];
        return {name:r.name,role,status:`在世 · ${age} 岁`,text:pick(bank)};
      }
      if(role==='仇人'||role==='对头')return {name:r.name,role,status:`在世 · ${age} 岁`,text:`你死后，${r.name} 很少公开谈起你。只在一次别人提到旧事时，TA承认你曾经是一个真正让TA认真对待过的人。敌意没有消失，但故事并没有因为你的死亡而被抹掉。`};
      return {name:r.name,role,status:`在世 · ${age} 岁`,text:`你去世后，${r.name} 继续过自己的生活。你们并不是彼此人生里最轰烈的角色，但这段关系真实存在过，也留下了 ${r.sharedEvents||1} 次交集。`};
    });
    p.v63Aftermath=lines;return lines;
  };

  const baseDead=A.deadView;
  if(typeof baseDead==='function')A.deadView=()=>{
    let html=baseDead(),after=A.v63Aftermath();if(!after.length)return html;
    const block=`<div class="v63-afterlife"><div class="section-line"><strong>🕯️ 你死之后，他们继续活着</strong><span>与你最深的 ${after.length} 段关系</span></div><div class="v63-afterlife-grid">${after.map((x,i)=>`<article><b>${i+1}. ${esc(x.name)} · ${esc(x.role)}</b><span>${esc(x.status)}</span><p>${esc(x.text)}</p></article>`).join('')}</div></div>`;
    const needle='<div class="end-grid">';return html.includes(needle)?html.replace(needle,block+needle):html.replace('<div class="end-actions">',block+'<div class="end-actions">');
  };

  // 加载本文件时可能首页已由 v5-init 渲染；已有存档立即刷新一次，确保关系网可见。
  if(A.p){try{A.render?.()}catch(e){console.warn('[V6.3] ui refresh',e)}}
})();