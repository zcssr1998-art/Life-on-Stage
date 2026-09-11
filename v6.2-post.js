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
  const old=A.asChild;
  if(typeof old==='function')A.asChild=child=>{
    const out=old(child);if(A.p){A.p.gender=child?.gender||pick(['男','女']);A.p.birthProfile={growth:'家族传承后的新环境',birthOrder:'下一代主角',familyClimate:'上一代留下的家庭余温'};A.v62EnsureCareer?.(A.p);A.save?.();A.render?.();}return out;
  };
})();