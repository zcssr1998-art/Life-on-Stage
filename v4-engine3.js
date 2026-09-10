window.APP = window.APP || {};
(() => {
  const A = window.APP, L = window.LIFE;
  A.prep = () => {
    const P=A.p;
    if(!P || !P.alive) return A.render();
    A.busy=false; A.notice='';
    let actions=null;
    if(P.graduationAge && P.age===P.graduationAge && P.tags.includes('大学在读')){
      actions=A.graduationActions(P); A.notice='🎓 固定人生节点：毕业择业。选一个方向，这一年只需要点一次。';
    } else if(L.MILESTONES[P.age]) {
      actions=L.MILESTONES[P.age](P);
      if(actions) A.notice=`📍 ${P.age} 岁人生节点：这里的选择会改写后续事件池。`;
    }
    if(!actions){
      if(P.age<=6) actions=A.earlyActions();
      else {
        const eligible=L.EVENTS.filter(A.eligibleEvent);
        const hidden=eligible.filter(e=>e.hidden), normal=eligible.filter(e=>!e.hidden);
        const picked=[];
        if(hidden.length){
          const h=A.wp(hidden.map(e=>({...e,_weight:(e.weight||1)*2.2}))); const a=A.eventAction(h);
          if(a){picked.push(a); A.notice=`🔓 隐藏机制进入候选：${h.title.replace('隐藏机制：','')}。这是你此前属性 / 标签叠出来的。`;}
        }
        const dyn=A.dynamicActions();
        const source=[...normal.map(e=>({kind:'event',item:e,weight:e.weight||1})),...dyn.map(x=>({kind:'dyn',item:x,weight:1.25}))];
        const used=new Set(picked.map(x=>x.sourceEvent?.id||x.id));
        while(picked.length<5 && source.length){
          const q=A.wp(source.map(x=>({...x,_weight:x.weight}))); const idx=source.findIndex(x=>x.kind===q.kind&&x.item.id===q.item.id); if(idx>=0)source.splice(idx,1);
          let a=q.kind==='event'?A.eventAction(q.item):q.item; if(!a)continue;
          const key=a.sourceEvent?.id||a.id; if(used.has(key))continue; used.add(key); picked.push(a);
        }
        actions=picked;
      }
    }
    const fillers=A.dynamicActions().concat(A.earlyActions());
    let fi=0; while(actions.length<5 && fi<fillers.length){ if(!actions.some(x=>x.id===fillers[fi].id)) actions.push(fillers[fi]); fi++; }
    A.year=actions.slice(0,5);
    A.render();
  };

  A.applyAnnualEconomy = () => {
    const P=A.p,j=A.job(P.career); let wealthDelta=0, notes=[];
    if(j.salary>0 && P.age>=16){
      const save=L.clamp(12+P.stats.discipline*.18+P.stats.stability*.08-P.children.length*3,8,44)/100;
      const income=Math.round(j.salary*12*P.salaryMul*P.world.careerMul);
      wealthDelta += Math.round(income*save);
      if(P.tags.includes('职业上升期') && Math.random()<.18){P.salaryMul*=1.04;notes.push('主业收入小幅增长');}
    }
    if(P.spouse && P.tags.includes('已婚')){
      const sj=A.job(P.spouse.career); if(sj.salary>0) wealthDelta+=Math.round(sj.salary*12*.08);
    }
    if(P.children.length) wealthDelta-=P.children.length*L.rand(3000,12000);
    const shockRoll=Math.random();
    if(P.age>=22 && shockRoll<.10){const cost=L.rand(3000,28000);wealthDelta-=cost;notes.push(`生活杂支 ${L.fmtMoney(-cost)}`);} 
    P.wealth+=wealthDelta;
    if(P.tags.includes('现金流机器')) P.wealth+=L.rand(25000,65000);
    if(P.tags.includes('投资者')&&!P.blockedInvestment&&P.wealth>50000){
      const exposure=Math.max(10000,P.wealth*.20), discipline=P.tags.includes('复利发动机');
      const ret=(discipline?-.10:-.22)+Math.random()*(discipline?.30:.42);
      const d=Math.round(exposure*ret);P.wealth+=d;notes.push(`投资浮动 ${L.fmtMoney(d)}`);
    }
    return {wealthDelta,notes};
  };

  A.passiveDrift = () => {
    const P=A.p,s=P.stats;
    s.happiness=L.clamp(s.happiness+L.rand(-3,2));
    s.stability=L.clamp(s.stability+L.rand(-2,2));
    if(P.age>=35)s.health=L.clamp(s.health-L.rand(0,2));
    if(P.age>=55)s.health=L.clamp(s.health-L.rand(0,3));
    if(P.tags.includes('健身习惯'))s.health=L.clamp(s.health+1);
    if(P.tags.includes('长寿体质'))s.health=L.clamp(s.health+1);
    if(P.stats.family<=35 && P.tags.includes('家庭裂痕') && Math.random()<.12){
      const t='家庭的旧裂痕又被翻了出来，几位亲属真的开始长期不再往来。';
      s.family=L.clamp(s.family-8); s.happiness=L.clamp(s.happiness-5); A.tag(P,'家族支柱');
      A.lastResult?.extras.push({title:'🔓 隐藏机制：家庭分崩',text:t,changes:'家庭关系-8 · 幸福-5'});
      P.history.unshift({age:P.age,title:'🔓 隐藏机制：家庭分崩',text:t,changes:'家庭关系-8 · 幸福-5',type:'hidden'});
    }
  };

  A.spouseStory = () => {
    const P=A.p,s=P.spouse; if(!s||!P.tags.includes('已婚')||Math.random()>.22)return;
    let pool=L.SPOUSE_STORIES.map(x=>({...x,_weight:x.weight}));
    if(s.loyalty<42) pool=pool.map(x=>x.id==='sp_affair'?{...x,_weight:x.weight*3.4}:x);
    if(s.chaos>70) pool=pool.map(x=>['sp_burn','sp_scam','sp_quit'].includes(x.id)?{...x,_weight:x.weight*2}:x);
    if(s.fortune>75) pool=pool.map(x=>['sp_raise','sp_boom','sp_inherit'].includes(x.id)?{...x,_weight:x.weight*1.7}:x);
    const q=A.wp(pool),b={...P.stats},w=P.wealth;
    Object.entries(q.effects||{}).forEach(([k,v])=>P.stats[k]=L.clamp(P.stats[k]+v));
    if(q.wealth){const d=L.rand(Math.min(...q.wealth),Math.max(...q.wealth));P.wealth+=d;}
    if(q.fraction)P.wealth+=Math.round(P.wealth*q.fraction);
    if(q.tag)A.tag(P,q.tag);
    const txt=q.text(s);
    if(q.divorce){A.tag(P,'已离婚');A.untag(P,'已婚');A.untag(P,'恋爱中');P.spouse=null;}
    const changes=A.delta(b,w); P.history.unshift({age:P.age,title:'💍 配偶线',text:txt,changes,type:'side'});
    A.lastResult?.extras.push({title:'💍 配偶线',text:txt,changes});
  };

  A.childStory = () => {
    const P=A.p;if(!P.children.length||Math.random()>.09)return;
    const c=L.pick(P.children),pool=L.CHILD_STORIES.filter(x=>!x.minParentAge||P.age>=x.minParentAge),q=A.wp(pool),b={...P.stats},w=P.wealth;
    Object.entries(q.effects||{}).forEach(([k,v])=>P.stats[k]=L.clamp(P.stats[k]+v));
    if(q.wealth){const d=L.rand(Math.min(...q.wealth),Math.max(...q.wealth));P.wealth+=d;}
    const txt=q.text(c),changes=A.delta(b,w); P.history.unshift({age:P.age,title:'👶 子女插曲',text:txt,changes,type:'side'});
    A.lastResult?.extras.push({title:'👶 子女插曲',text:txt,changes});
  };

  A.maybeBirth = () => {
    const P=A.p;if(!P.tags.includes('已婚')||!P.tags.includes('想要孩子')||P.tags.includes('丁克')||P.children.length>=2||P.age<25||P.age>42)return;
    const chance=P.children.length?.055:.095;
    if(Math.random()<chance){const c=A.child();P.stats.family=L.clamp(P.stats.family+7);P.stats.happiness=L.clamp(P.stats.happiness+4);const txt=`${c.name} 出生了。没有额外菜单，TA 从这一刻开始作为你人生里的龙套角色存在。`;P.history.unshift({age:P.age,title:'👶 家庭新增成员',text:txt,changes:'家庭关系+7 · 幸福+4',type:'side'});A.lastResult?.extras.push({title:'👶 家庭新增成员',text:txt,changes:'家庭关系+7 · 幸福+4'});}
  };

  A.synergy = () => {
    const P=A.p,got=[];
    L.SYNERGIES.forEach(s=>{if(!P.tags.includes(s.tag)&&s.when(P)){A.tag(P,s.tag);got.push(s.tag);P.history.unshift({age:P.age,title:`🧬 构筑完成：${s.tag}`,text:L.TAG_DEFS[s.tag]?.tip||'特殊构筑完成。',changes:'天胡组合已激活',type:'synergy'});A.lastResult?.extras.push({title:`🧬 构筑完成：${s.tag}`,text:L.TAG_DEFS[s.tag]?.tip||'',changes:'构筑已激活'});}});
    if(got.length) A.note('🧬 天胡构筑：'+got.join('、'),'synergy');
  };

  A.deathChance = () => {
    const P=A.p,s=P.stats; let c;
    if(P.age<=5)c=.0012; else if(P.age<=12)c=.00035; else if(P.age<=18)c=.00055; else if(P.age<=25)c=.0009; else if(P.age<=35)c=.0015; else if(P.age<=45)c=.0024; else if(P.age<=55)c=.0045; else if(P.age<=65)c=.009; else if(P.age<=75)c=.024; else if(P.age<=85)c=.065; else if(P.age<=92)c=.15; else c=.32;
    c*=1+Math.max(0,55-s.health)/45;
    c*=1+Math.max(0,s.risk-70)/75;
    if(s.health<25)c*=2.2;if(s.health<10)c*=3;
    if(P.tags.includes('长寿体质'))c*=.55;
    if(P.tags.includes('健身习惯'))c*=.88;
    if(P.age===27 && (P.career==='creator'||P.career==='artist'||P.tags.includes('内容创作者')||P.stats.ambition>85))c+=.006;
    if(P.age>=100)c=Math.max(c,.72);
    return Math.min(.98,c);
  };

  A.deathReason = () => {
    const P=A.p,s=P.stats;
    if(s.health<=0)return '长期健康问题最终压垮了身体';
    if(P.age<18)return L.pick(['罕见疾病','交通意外','一次无法预料的事故']);
    if(P.age<40)return P.stats.risk>75?L.pick(['高风险活动中的意外','交通事故','突发性疾病']):L.pick(['突发疾病','交通意外','极低概率的猝发事件']);
    if(P.age<65)return L.pick(['突发心脑血管事件','疾病恶化','意外事故','长期透支后的身体崩溃']);
    return L.pick(['自然衰老','慢性疾病恶化','突发心脑血管事件','一次感染后的并发症']);
  };

  A.ending = () => {
    const P=A.p,ach=P.tags.filter(t=>A.trait(t).kind==='achievement'),syn=P.tags.filter(t=>A.trait(t).kind==='synergy');
    let title='普通人的完整一局',rarity='N';
    if(P.age===27 && (P.career==='creator'||P.career==='artist'||P.tags.includes('内容创作者')||P.stats.ambition>=85)){title='27俱乐部';rarity='SSR';A.tag(P,'27俱乐部');}
    else if(P.age<35 && P.stats.intelligence>=90){title='天才早逝';rarity='SSR';A.tag(P,'天才早逝');}
    else if((P.background.includes('农村')||P.background.includes('县城')||P.tags.includes('少年穷困'))&&P.wealthPeak>=5000000){title='白手起家传奇';rarity='SSR';A.tag(P,'白手起家');}
    else if(P.wealthPeak>=20000000){title='财富帝国';rarity='SSR';}
    else if(P.age>=100){title='百岁见证者';rarity='SSR';}
    else if(syn.length>=3){title='天胡构筑大师';rarity='SR';}
    else if(P.tags.includes('创业成功')&&P.wealthPeak>=3000000){title='创业者的兑现';rarity='SR';}
    else if(P.tags.includes('不婚主义')&&P.stats.happiness>=75){title='自由而完整';rarity='R';}
    else if(P.tags.includes('家族凝聚')&&P.children.length>=1){title='家族主心骨';rarity='R';}
    else if(P.stats.happiness>=80&&P.stats.family>=75){title='把日子过明白的人';rarity='R';}
    const spouse=P.spouse?`你最后仍与 ${P.spouse.name} 共同生活。`:P.tags.includes('已离婚')?'你的亲密关系经历过一次真正的破裂。':P.tags.includes('不婚主义')?'你主动把婚姻从人生必答题里划掉。':'婚姻没有成为这局人生的主线。';
    const kids=P.children.length?`你留下 ${P.children.length} 个子女，家族可以从下一代继续。`:'你没有留下可继承本局的子女线。';
    const build=syn.length?`这一生完成了 ${syn.length} 套构筑：${syn.slice(0,4).join('、')}。`:'这局没有凑出完整天胡构筑，但很多选择仍改变了事件池。';
    const education=P.education||'未记录';
    const summary=`你从「${P.background}」出发，活到 ${P.age} 岁，最终职业是「${A.job(P.career).name}」，教育轨迹停在「${education}」。财富最高到过 ${L.fmtMoney(P.wealthPeak)}，结束时为 ${L.fmtMoney(P.wealth)}。${spouse}${kids}${build} 最终因为${P.deathReason}结束了这一局。`;
    return {title,rarity,summary,achievements:ach,synergies:syn};
  };

  A.score = () => {
    const P=A.p;
    return Math.round(P.age*4+Math.log10(Math.max(1,P.wealthPeak)+10)*85+P.stats.happiness*1.2+P.stats.health+P.stats.family+P.tags.filter(t=>A.trait(t).kind==='achievement').length*28+P.tags.filter(t=>A.trait(t).kind==='synergy').length*75+P.generation*25);
  };

  A.die = reason => {
    const P=A.p;P.alive=false;P.deathReason=reason||A.deathReason();P.score=A.score();P.rareEnding=A.ending();
    const d=A.dynasty(),m=d.members.find(x=>x.id===P.id);if(m)Object.assign(m,{status:'已故',age:P.age,wealth:P.wealth,career:A.job(P.career).name});
    if(P.children.length){const cash=Math.floor(Math.max(0,P.wealth)*.22/P.children.length);P.children.forEach(ch=>{const cm=d.members.find(x=>x.id===ch.id);if(cm)Object.assign(cm,{legacyCash:(ch.legacyCash||0)+cash,inheritedStats:ch.stats,legacyBoost:(ch.legacyBoost||0)+P.legacyBoost});});}
    A.saveDyn(d);localStorage.removeItem(L.STORAGE_KEY);A.sync(P);A.render();
  };

  A.advance = () => {
    const P=A.p;
    const eco=A.applyAnnualEconomy();if(eco.notes.length)A.lastResult.extras.push({title:'💰 年度现金流',text:eco.notes.join('；'),changes:eco.wealthDelta?`净储蓄 ${L.fmtMoney(eco.wealthDelta)}`:'现金流基本持平'});
    A.passiveDrift();A.maybeBirth();A.spouseStory();A.childStory();A.synergy();
    P.wealthPeak=Math.max(P.wealthPeak,P.wealth);if(P.age>=42)A.tag(P,'父母年迈');
    if(P.stats.health<=0 || Math.random()<A.deathChance()){A.die();return;}
    P.age++;P.score=A.score();A.sync(P);A.save();A.prep();
  };

  A.choose = idx => {
    if(A.busy||!A.p?.alive)return;
    const act=A.year[idx];if(!act||!A.pass(act.requires||{}))return;
    A.busy=true;
    const res=A.resolveOutcome(act);A.applyResult(act,res);A.advance();
  };
})();
