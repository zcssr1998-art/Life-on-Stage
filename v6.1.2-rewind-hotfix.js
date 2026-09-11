(() => {
  const A=window.APP;
  const root=document.getElementById('root');
  if(!A||!root)return;

  const resetRuntime=()=>{
    A.view='game';
    A.busy=false;
    A.lastResult=null;
    A._resultLifeId=null;
    A._deltaLifeId=null;
    A._lastChoiceTitle='';
    A._yearDeltaStats={};
    A._yearDeltaWealth=0;
    A._yearStories=[];
  };

  const showGameNav=()=>{
    const nav=document.getElementById('bottomNav');
    nav?.classList.remove('hidden');
    nav?.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.view==='game'));
  };

  const finishRewind=(ok,message)=>{
    if(!ok){
      A.note?.('回溯失败：这个时间点的快照已经不可用。','bad');
      return false;
    }
    resetRuntime();
    showGameNav();
    if(A.p?.alive){
      if(!Array.isArray(A.year)||!A.year.length)A.buildYear?.();
      else A.render?.();
      A.note?.(message,'good');
      return true;
    }
    A.note?.('回溯失败：人物状态没有恢复。','bad');
    return false;
  };

  const rewindSingularity=()=>{
    let age=A.p?.fate?.singularity?.age;
    let ok=false;
    try{ok=!!A.v61RewindSingularity?.();}
    catch(err){console.error('[V6.1.2] singularity rewind failed',err);}
    return finishRewind(ok,`已回到 ${age??'宿命'} 岁的拉刻西斯节点。换一个选择，世界线会从这里重新分叉。`);
  };

  const rewindFork=id=>{
    const item=A.v6ForkStore?.().find?.(x=>x.id===id);
    let ok=false;
    try{ok=!!A.v6RewindFork?.(id);}
    catch(err){console.error('[V6.1.2] legacy fork rewind failed',err);}
    return finishRewind(ok,`已回到 ${item?.age??'当年'} 岁的关键岔路。`);
  };

  // 死亡页不会执行常规 A.bind()，所以用 root 级事件代理永久接线。
  // 捕获阶段拦截旧版按钮上的 confirm/onClick，避免 WebKit/PWA 对原生确认框处理不一致。
  if(!A._rewindDelegationInstalled){
    root.addEventListener('click',e=>{
      const singularity=e.target?.closest?.('#v61RewindBtn');
      if(singularity){
        e.preventDefault();
        e.stopPropagation();
        rewindSingularity();
        return;
      }
      const fork=e.target?.closest?.('.v6-fork-btn[data-fork]');
      if(fork){
        e.preventDefault();
        e.stopPropagation();
        rewindFork(fork.dataset.fork);
      }
    },true);
    A._rewindDelegationInstalled=true;
  }

  // 额外保底：如果未来某版死亡页开始调用 A.bind()，也覆盖掉旧的 confirm 处理。
  const baseBind=A.bind;
  A.bind=()=>{
    baseBind?.();
    const s=document.getElementById('v61RewindBtn');
    if(s)s.onclick=e=>{e?.preventDefault?.();rewindSingularity();};
    document.querySelectorAll('.v6-fork-btn[data-fork]').forEach(b=>{
      b.onclick=e=>{e?.preventDefault?.();rewindFork(b.dataset.fork);};
    });
  };
})();
