(() => {
  const A=window.APP,L=window.LIFE;
  L.VERSION='V5.2';

  // 抓周只提示方向，不提前公布具体掉落词条。
  A.zhouActions=()=>L.ZHOU_CHOICES.map((z,i)=>({
    id:'zhou15_'+i,
    category:'抓周',
    title:`${z[1]} ${z[0]}`,
    desc:'会获得一个与这个倾向相符的强力起手词条。',
    effects:z[3],
    special:{grantZhou:z[2]},
    fixed:true,
    rare:false
  }));

  // 控制历史体积，避免移动端 WebView 长局存档异常。
  const oldRecord=A.record;
  A.record=h=>{
    oldRecord(h);
    if(A.p?.history?.length>900) A.p.history.length=900;
  };

  // 本地存储失败不应该锁死整局。
  const safeSet=(key,value)=>{
    try{localStorage.setItem(key,value);return true}
    catch(err){console.warn('[Life-on-Stage] localStorage write failed',err);return false}
  };
  A.saveCollection=c=>safeSet(L.COLLECTION_KEY,JSON.stringify(c));
  A.saveDyn=d=>safeSet(L.DYNASTY_KEY,JSON.stringify(d));
  A.save=()=>{
    if(!A.p?.alive)return;
    if(!safeSet(L.STORAGE_KEY,JSON.stringify(A.p))){
      // 极端情况下再压一次历史记录，只影响过旧文本，不影响当前状态。
      if(A.p.history?.length>360)A.p.history.length=360;
      safeSet(L.STORAGE_KEY,JSON.stringify(A.p));
    }
  };

  // 任意配角/幸运系统出错，只跳过该系统，绝不阻塞主年龄推进。
  const side=(name,fn)=>{
    try{return fn()}
    catch(err){console.warn(`[Life-on-Stage] ${name} skipped`,err);return null}
  };

  // 关键修复：resolve 全流程事务化。任何异常都会回滚本次点击并自动解除 busy。
  A.resolve=a=>{
    if(A.busy||!A.p?.alive||!A.pass(a?.requires||{}))return;
    const snapshot=JSON.stringify(A.p);
    A.busy=true;
    try{
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

      const drop=side('trait drop',()=>A.maybeTraitDrop?.(tone));
      if(drop)extra+=` · 新词条【${drop.name}】`;
      A.lastResult={text:(z.text||a.desc)+extra,changes,tone};

      side('income',()=>A.autoIncome?.());
      side('spouse',()=>A.spouseStory?.());
      side('child',()=>A.childStory?.());
      side('birth',()=>A.maybeBirth?.());
      side('luck',()=>A.luckEvent?.());
      side('passive',()=>A.passiveYear?.());

      p.wealthPeak=Math.max(p.wealthPeak,p.wealth);
      p.minWealth=Math.min(p.minWealth,p.wealth);
      p.score=A.score();
      side('dynasty',()=>A.syncDynasty?.());

      let died=false;
      try{died=A.deathCheck()}catch(err){console.error('[Life-on-Stage] deathCheck failed',err)}
      if(!died&&A.p?.alive){
        A.p.age++;
        A.save();
        A.busy=false;
        A.buildYear();
      }
    }catch(err){
      console.error('[Life-on-Stage] yearly resolve rolled back',err);
      try{A.p=JSON.parse(snapshot)}catch{}
      A.busy=false;
      A.note?.('这次事件处理异常，系统已自动恢复。可以继续点，不会卡档。','bad');
      try{A.buildYear()}catch(renderErr){console.error(renderErr);A.render?.()}
    }finally{
      // 防止任何未覆盖异常把按钮永久锁住。
      A.busy=false;
    }
  };
})();