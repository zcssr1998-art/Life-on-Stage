(() => {
  const A=window.APP,L=window.LIFE;

  A.acquireTrait=(t,silent=false)=>{
    if(!t||A.p.traits.some(x=>x.id===t.id))return null;
    // 开局五词条初始化时不刷羁绊提示；抓周和后续掉落会正常触发。
    silent=silent||(A.p?.age===1&&Array.isArray(A.p?.history)&&A.p.history.length===0);
    const before={};
    if(!silent&&A.setCounts)Object.keys(L.SYNERGY_SETS).forEach(k=>before[k]=A.setTier(k));
    A.p.traits.push({id:t.id,name:t.name,rarity:t.rarity});
    Object.entries(t.effects||{}).forEach(([k,v])=>{if(k in A.p.stats)A.p.stats[k]+=v});
    A.clampStats(A.p);
    A.discoverTrait(t);
    if(!silent&&A.setCounts&&A.record){
      Object.keys(L.SYNERGY_SETS).forEach(k=>{
        const after=A.setTier(k);
        if(after>(before[k]||0)){
          const set=L.SYNERGY_SETS[k],need=set.tiers[after-1];
          A.record({age:A.p.age,title:`🔗 羁绊升级：${set.name}`,text:`叠到 ${need} 层，激活 ${set.desc[after-1]}`,changes:'构筑强化',tone:'good',kind:'synergy'});
        }
      });
    }
    return t;
  };

  A.zhouActions=()=>L.ZHOU_CHOICES.map((z,i)=>({
    id:'zhou15_'+i,category:'抓周',title:`${z[1]} ${z[0]}`,
    desc:`可能获得：${z[2].join(' / ')}`,effects:z[3],special:{grantZhou:z[2]},
    fixed:true,rare:false,previewTraits:z[2]
  }));

  A.applyOutcome=(a,z)=>{
    const p=A.p;
    if(!z._replace){
      Object.entries(a.effects||{}).forEach(([k,v])=>{if(k in p.stats)p.stats[k]+=v});
      (a.addTags||[]).forEach(t=>{if(t&&!p.tags.includes(t))p.tags.push(t)});
      A.special(a.special);
    }
    Object.entries(z.effects||{}).forEach(([k,v])=>{if(k in p.stats)p.stats[k]+=v});
    (z.addTags||[]).forEach(t=>{if(t&&!p.tags.includes(t))p.tags.push(t)});
    A.special(z.special);
    if(a.special?.grantZhou){
      let candidates=a.special.grantZhou.map(A.traitByName).filter(t=>t&&!p.traits.some(x=>x.id===t.id));
      if(!candidates.length)candidates=L.TRAITS.filter(t=>['SS','S'].includes(t.rarity)&&!p.traits.some(x=>x.id===t.id));
      const t=L.pick(candidates);
      if(t&&A.acquireTrait(t))z._granted=t;
    }
    if(a.special?.graduated){
      if(!p.tags.includes('已毕业'))p.tags.push('已毕业');
      p.tags=p.tags.filter(x=>x!=='大学在读');
    }
    A.clampStats(p);
  };

  A.maybeTraitDrop=tone=>{
    const p=A.p,tm=A.traitMods(),sm=A.synergyMods();
    let chance=.13+p.stats.luck*.0007+Math.min(.10,tm.rare*.12+sm.rare*.18);
    if(Math.random()>Math.min(.30,chance))return null;
    const pool=L.TRAITS.filter(t=>!p.traits.some(x=>x.id===t.id));
    if(!pool.length)return null;
    const luck=Math.max(-.4,Math.min(.8,(p.stats.luck-50)/50));
    const picked=A.weightPick(pool.map(t=>{
      const rank=L.RARITY[t.rarity].rank;
      let w=L.RARITY[t.rarity].weight;
      if(rank>=3)w*=Math.max(.5,1+luck*.8+(tone==='good'?.18:0));
      if(rank===1&&tone==='bad')w*=1.45;
      return {...t,_w:w};
    }));
    const t=L.TRAITS.find(x=>x.id===picked.id),before={...p.stats},bw=p.wealth;
    A.acquireTrait(t);
    const sum=Object.values(t.effects||{}).reduce((a,b)=>a+b,0),tone2=sum>2?'good':sum<0?'bad':'neutral';
    A.record({age:p.age,title:'🧬 新词条',text:`获得【${t.name}】· ${L.RARITY[t.rarity].name}`,changes:A.delta(before,bw),tone:tone2,kind:'trait'});
    return t;
  };

  A.resolve=a=>{
    if(A.busy||!A.p?.alive||!A.pass(a.requires||{}))return;
    A.busy=true;
    const p=A.p,b={...p.stats},bw=p.wealth;
    const z=a.outcomes?.length?A.pickOutcome(a.outcomes):A.dynamicOutcome(a);
    A.applyOutcome(a,z);
    p.seen[a.sourceEvent||a.id]=p.age;
    p.wealthPeak=Math.max(p.wealthPeak,p.wealth);
    p.minWealth=Math.min(p.minWealth,p.wealth);
    const changes=A.delta(b,bw),tone=A.toneFrom(b,bw);
    let extra=z._granted?` · 获得强力词条【${z._granted.name}】`:'';
    A.record({age:p.age,title:a.title,text:(z.text||a.desc)+extra,changes,tone,kind:a.rare||a.hidden?'rare':'choice'});
    if(a.rare||a.hidden)p.rareEvents++;
    const drop=A.maybeTraitDrop(tone);
    if(drop)extra+=` · 新词条【${drop.name}】`;
    A.lastResult={text:(z.text||a.desc)+extra,changes,tone};
    A.autoIncome();
    A.spouseStory();
    A.childStory();
    A.maybeBirth();
    A.luckEvent();
    A.passiveYear();
    p.wealthPeak=Math.max(p.wealthPeak,p.wealth);
    p.minWealth=Math.min(p.minWealth,p.wealth);
    p.score=A.score();
    A.syncDynasty();
    if(!A.deathCheck()){
      p.age++;
      A.save();
      A.busy=false;
      A.buildYear();
    }else A.busy=false;
  };
})();