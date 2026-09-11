(() => {
  const A=window.APP,L=window.LIFE;if(!A||!L)return;
  const pick=x=>L.pick?L.pick(x):x[Math.floor(Math.random()*x.length)];
  const normalize=()=>{
    const p=A.p;if(!p)return;
    if(!p.gender)p.gender=pick(['男','女']);
    if(!p.birthProfile)p.birthProfile={growth:'旧存档：成长环境未记录',birthOrder:'旧存档：家庭位置未记录',familyClimate:'旧存档：家庭气候未记录'};
    A.v62EnsureCareer?.(p);if(p.spouse)A.spouse?.();
  };
  normalize();if(A.p?.alive){A.save?.();A.render?.();}

  // 新人生绝不能继承上一局的年度财富账本、变化箭头或最新轨迹。
  const oldNew=A.newLife;
  if(typeof oldNew==='function')A.newLife=d=>{
    A._yearFinance=null;A._yearDeltaWealth=0;A._yearDeltaStats={};A._yearStories=[];A._deltaLifeId=null;A._resultLifeId=null;A.lastResult=null;
    const out=oldNew(d);if(A.p){A.p.financeHistory=A.p.financeHistory||[];normalize();A.save?.();A.render?.();}return out;
  };

  const old=A.asChild;
  if(typeof old==='function')A.asChild=child=>{
    A._yearFinance=null;A._yearDeltaWealth=0;A._yearDeltaStats={};A._yearStories=[];A._deltaLifeId=null;A._resultLifeId=null;A.lastResult=null;
    const out=old(child);if(A.p){A.p.gender=child?.gender||pick(['男','女']);A.p.birthProfile={growth:'家族传承后的新环境',birthOrder:'下一代主角',familyClimate:'上一代留下的家庭余温'};A.p.financeHistory=A.p.financeHistory||[];A.v62EnsureCareer?.(A.p);A.save?.();A.render?.();}return out;
  };
})();