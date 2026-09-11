window.LIFE=window.LIFE||{};
(()=>{
  const L=window.LIFE,events=L.EVENTS||[];
  const fallback=(e)=>{
    const x=`${e.category} ${e.theme} ${e.title}`;
    if(/健康|医疗|身体|运动/.test(x))return{health:2,discipline:1};
    if(/学校|学习|成绩|研究|技术/.test(x))return{intelligence:2,discipline:1};
    if(/家庭|照护|关系|婚姻/.test(x))return{family:2,happiness:1};
    if(/社交|朋友|同伴|同龄/.test(x))return{social:2,happiness:1};
    if(/工作|职业|商业/.test(x))return{ambition:2,discipline:1};
    if(/财务|钱|投资|住房/.test(x))return{stability:2,discipline:1};
    return{stability:1,happiness:1};
  };
  for(const e of events.filter(x=>String(x.id||'').startsWith('v81_'))){
    for(const o of e.options||[]){
      const hasEffects=o.effects&&Object.keys(o.effects).length,hasTags=Array.isArray(o.addTags)&&o.addTags.length,hasSpecial=o.special&&Object.keys(o.special).length;
      if(!hasEffects&&!hasTags&&!hasSpecial)o.effects=fallback(e);
      // A child can learn saving/spending from pocket money without acquiring adult-scale personal wealth or debt.
      if((e.maxAge??120)<=15&&o.special&&Number.isFinite(o.special.wealth))delete o.special.wealth;
    }
  }
})();
