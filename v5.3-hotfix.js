(() => {
  const A=window.APP,L=window.LIFE;
  L.VERSION='V5.3';

  const sample=(arr,n)=>{
    const a=[...arr];
    for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}
    return a.slice(0,n);
  };

  // 抓周：15 个候选库，每一局固定抽出 5 个供玩家 5 选 1。
  // 抽样结果写进人物存档，刷新页面也不会重新洗牌。
  A.zhouActions=()=>{
    const p=A.p;
    if(!Array.isArray(p.zhouPool)||p.zhouPool.length!==5){
      p.zhouPool=sample(L.ZHOU_CHOICES.map((_,i)=>i),5);
      try{A.save?.()}catch{}
    }
    return p.zhouPool.map(i=>{
      const z=L.ZHOU_CHOICES[i];
      return {
        id:'zhou15_'+i,
        category:'抓周',
        title:`${z[1]} ${z[0]}`,
        desc:'凭直觉选一个。它会影响你后面的人生倾向。',
        effects:z[3],
        special:{grantZhou:z[2]},
        fixed:true,
        rare:false
      };
    });
  };

  // 普通年份改为 4 选 1。固定人生节点保留各自设计数量。
  A.buildYear=()=>{
    const p=A.p;
    if(!p||!p.alive)return A.render?.();
    A.notice='';
    const fixed=A.fixedActions();
    if(fixed){A.year=fixed;return A.render?.()}

    let pool=L.EVENTS.filter(A.eventEligible),picked=[],used=new Set();
    while(picked.length<4&&pool.length){
      const e=A.weightPick(pool.map(x=>({...x,_w:(x.weight||1)*(x.hidden?1+Math.max(0,p.stats.luck-50)/70:1)})));
      pool=pool.filter(x=>x.id!==e.id);
      const a=A.fromEvent(e);
      if(a&&!used.has(a.id)){picked.push(a);used.add(a.id)}
    }
    for(const f of A.fallbacks().sort(()=>Math.random()-.5)){
      if(picked.length>=4)break;
      if(!used.has(f.id)){picked.push(f);used.add(f.id)}
    }
    A.year=picked.slice(0,4);
    A.render?.();
  };

  // 死亡结算必须是“不可失败”的状态迁移。
  // 之前高龄卡住最可疑的路径：人物已被标成死亡，但结算 UI/图鉴某一步异常，旧游戏画面留在屏幕上；
  // 此时按钮仍看得见，但 resolve 会因为 alive=false 直接返回，于是表现成永久没反应。
  const emergencyEnding=()=>{
    try{
      const root=document.getElementById('root');
      if(!root||!A.p)return;
      root.innerHTML=`<section class="screen end-screen"><div class="end-hero"><div><h1>${A.p.age} 岁 · ${A.p.deathReason||'人生落幕'}</h1><p>人生综合分 ${A.p.score||A.score?.()||0}</p></div></div><div class="end-summary"><p>这一生已经结束。结算页遇到兼容性异常，但人物状态和本局结果已安全保存。</p></div><div class="end-actions"><button class="primary" id="emergencyFresh">全新人生</button></div></section>`;
      const b=document.getElementById('emergencyFresh');
      if(b)b.onclick=()=>{A.p=null;A.startView?.()};
    }catch(err){console.error('[Life-on-Stage] emergency ending render failed',err)}
  };

  A.die=reason=>{
    const p=A.p;
    if(!p)return;
    p.alive=false;
    p.deathReason=reason||'人生落幕';
    try{p.score=A.score()}catch{p.score=p.score||0}
    if(p.age===27&&p.score>=650&&!p.tags.includes('27俱乐部'))p.tags.push('27俱乐部');
    if(p.age<=35&&p.stats.intelligence>=90&&p.score>=850&&!p.tags.includes('天才早逝'))p.tags.push('天才早逝');
    p.wealthPeak=Math.max(p.wealthPeak||0,p.wealth||0);
    try{A.finishRun()}catch(err){console.error('[Life-on-Stage] finishRun failed',err);p.endings=p.endings||[]}
    try{localStorage.removeItem(L.STORAGE_KEY)}catch{}
    try{A.syncDynasty?.()}catch(err){console.warn('[Life-on-Stage] dynasty final save skipped',err)}
    try{A.render?.()}catch(err){console.error('[Life-on-Stage] ending render failed',err);emergencyEnding()}
  };

  // 对 resolve 再加一层外部看门狗：即使未来某个新模块忘记释放 busy，也不允许永久锁档。
  const resolveV52=A.resolve;
  A.resolve=a=>{
    const now=Date.now();
    if(A.busy){
      if(!A._busySince||now-A._busySince>1200){
        console.warn('[Life-on-Stage] stale busy lock recovered');
        A.busy=false;
      }else return;
    }
    if(!A.p?.alive){
      try{A.render?.()}catch{emergencyEnding()}
      return;
    }
    A._busySince=now;
    try{
      resolveV52(a);
    }catch(err){
      console.error('[Life-on-Stage] outer resolve recovery',err);
      A.busy=false;
      try{A.buildYear?.()}catch{try{A.render?.()}catch{}}
      A.note?.('刚才出现兼容性异常，已自动解锁，可以继续。','bad');
    }finally{
      A.busy=false;
      A._busySince=0;
      if(A.p&&!A.p.alive){
        const end=document.querySelector?.('.end-screen');
        if(!end){try{A.render?.()}catch{emergencyEnding()}}
      }
    }
  };

  // 页面级兜底：在 iOS/WKWebView 这类长时间运行环境里，任何未捕获错误都不能留下永久点击锁。
  const recover=()=>{
    A.busy=false;A._busySince=0;
    if(A.p&&!A.p.alive){try{A.render?.()}catch{emergencyEnding()}}
  };
  window.addEventListener?.('error',recover);
  window.addEventListener?.('unhandledrejection',recover);
})();
