(() => {
  const A=window.APP,L=window.LIFE;
  const clamp=(lo,hi,v)=>Math.max(lo,Math.min(hi,v));

  // V5.4 第二轮寿命平衡：完整人生模拟曾出现中位 84 岁、90+ 占比约三分之一，仍然过长。
  // 这里让 60 岁之后的风险更陡；健康/幸运/长寿词条依然有价值，但不能把人轻易堆成近似永生。
  A.deathCheck=()=>{
    const p=A.p;
    if(!p||!p.alive)return true;
    if(!Number.isFinite(p.mortalityFactor))p.mortalityFactor=.75+Math.random()*.90;
    if(p.stats.health<=0){A.die('健康崩溃');return true}
    const age=p.age;
    if(age>=110){A.die('自然衰老');return true}

    let base=age<10?.00035:
      age<18?.00055:
      age<30?.0010:
      age<40?.0016:
      age<50?.0028:
      age<60?.0060:
      age<65?.0120:
      age<70?.0220:
      age<75?.0360:
      age<80?.0600:
      age<85?.1000:
      age<90?.1700:
      age<95?.2800:
      age<100?.4200:.6500;
    if(age>=107)base=.90;

    const healthMul=clamp(.78,2.45,1+(55-p.stats.health)*.020);
    const riskMul=clamp(.88,1.72,1+(p.stats.risk-50)*.0090);
    const luckMul=clamp(.91,1.10,1-(p.stats.luck-50)*.0022);
    const tm=A.traitMods(),sm=A.synergyMods();
    const protection=Math.max(.48,(tm.death||1)*(sm.death||1));
    const chance=clamp(0,.97,base*p.mortalityFactor*healthMul*riskMul*luckMul*protection);

    if(Math.random()<chance){
      const causes=age<18?['意外事故','突发疾病']:
        age<40?['交通意外','急性疾病','意外事故','运动意外']:
        age<65?['突发疾病','交通意外','工作相关意外','急症']:
        age<80?['心脑血管急症','突发疾病','意外跌倒','慢性疾病恶化']:
        ['自然衰老','心脑血管急症','突发疾病','意外跌倒'];
      A.die(L.pick(causes));
      return true;
    }
    return false;
  };
})();
