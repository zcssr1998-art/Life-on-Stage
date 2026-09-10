window.APP = window.APP || {};
(() => {
  const A = window.APP, L = window.LIFE;
  A.p = A.p || null;
  A.year = [];
  A.lastResult = null;
  A.notice = '';
  A.busy = false;

  A.wp = arr => {
    if(!arr || !arr.length) return null;
    let total = arr.reduce((s,x)=>s+Math.max(.01,x._weight ?? x.weight ?? 1),0), r=Math.random()*total;
    for(const x of arr){ r -= Math.max(.01,x._weight ?? x.weight ?? 1); if(r<=0) return x; }
    return arr[arr.length-1];
  };

  A.setJob = id => {
    const P=A.p;
    ['上班族','管理者','技术专家','创业者','创业成功'].forEach(t=>A.untag(P,t));
    P.career=id;
    A.job(id).tags.forEach(t=>A.tag(P,t));
  };

  A.poolJob = mode => {
    const P=A.p, cur=A.job(P.career);
    let ids=[];
    if(mode==='skill') ids=P.stats.intelligence>=72?['developer','engineer','designer','researcher','technician']:['designer','technician','freelancer','engineer'];
    else if(mode==='people') ids=P.stats.social>=72?['sales','product','finance','partner']:['sales','clerk','product'];
    else if(mode==='stable') ids=['teacher','clerk','nurse','civil','technician','police'];
    else if(mode==='upgrade') ids=L.PROFESSIONS.filter(j=>j.tier===Math.min(5,Math.max(1,cur.tier+1))).map(j=>j.id);
    else ids=L.PROFESSIONS.filter(j=>j.tier===Math.max(1,cur.tier)).map(j=>j.id);
    return L.pick(ids.length?ids:['clerk']);
  };

  A.spouse = () => {
    const P=A.p;
    if(P.spouse) return P.spouse;
    const av=L.pick(L.AVATARS.filter(x=>x.id!==P.avatar));
    const careers=['clerk','sales','teacher','nurse','developer','engineer','finance','doctor','creator','freelancer','civil','researcher'];
    P.spouse={
      id:A.id(),
      name:L.pick(['林澈','沈宁','周野','顾遥','许岚','陈川','苏梨','陆森','夏霁','程砚','唐绫','江燃','闻溪','秦昭','乔禾','宋屿']),
      avatar:av.id,
      trait:L.pick(['温和务实','野心勃勃','松弛乐观','理性克制','社交达人','独立敏锐','高风险玩家','顾家型','浪漫主义','事业脑']),
      career:L.pick(careers),
      loyalty:L.rand(25,95),
      chaos:L.rand(5,90),
      fortune:L.rand(15,90)
    };
    A.tag(P,'恋爱中');
    return P.spouse;
  };

  A.child = () => {
    const P=A.p,d=A.dynasty(),av=L.pick(L.AVATARS.filter(x=>x.id!==P.avatar)),cid=A.id(),n=P.children.length+1,s={};
    Object.keys(P.stats).forEach(k=>s[k]=L.clamp(Math.round(P.stats[k]*.68+L.rand(10,30)+(P.tags.includes('家族凝聚')?3:0))));
    const c={id:cid,name:L.pick(['小舟','小满','星禾','知夏','一川','青岚','向野','安宁','予澈','明川','听澜','南乔'])+(n>1?`·${n}`:''),avatar:av.id,generation:P.generation+1,stats:s,legacyCash:0,legacyBoost:0};
    P.children.push(c);
    d.members.push({id:cid,parentId:P.id,generation:c.generation,name:c.name,avatar:c.avatar,status:'子代',career:'尚未进入人生',wealth:0,age:0,children:[],inheritedStats:s,legacyCash:0,legacyBoost:0});
    const pm=d.members.find(x=>x.id===P.id); if(pm && !pm.children.includes(cid)) pm.children.push(cid);
    A.saveDyn(d); return c;
  };

  A.newLife = d => {
    A.p={
      id:A.id(),name:'你',avatar:d.avatar,age:1,seed:L.rand(100000000,999999999),world:d.w,
      background:d.b[0],personality:d.pe[0],talent:d.ta[0],flaw:d.f[0],stats:{...d.s},tags:[...d.tags],
      wealth:Math.max(0,Math.round(d.wealth*.25)),wealthPeak:Math.max(0,Math.round(d.wealth*.25)),career:'none',salaryMul:1,
      education:'未入学',graduationAge:null,maritalPlan:null,spouse:null,children:[],history:[],seen:{},blockedInvestment:false,
      generation:1,parentId:null,legacyBoost:0,alive:true,deathReason:'',score:0,rareEnding:null
    };
    A.lastResult=null; A.busy=false; A.sync(A.p); A.save(); A.prep();
  };

  A.special = (s={}) => {
    const P=A.p;
    if(!s) return;
    if(s.wealth) P.wealth += s.wealth;
    if(s.wealthFraction) P.wealth += Math.round(P.wealth*s.wealthFraction);
    if(s.salaryMul) P.salaryMul *= s.salaryMul;
    if(s.career) A.setJob(s.career);
    if(s.careerPool) A.setJob(A.poolJob(s.careerPool));
    if(s.education) P.education=s.education;
    if(s.graduationAge!=null) P.graduationAge=s.graduationAge;
    if(s.maritalPlan) P.maritalPlan=s.maritalPlan;
    if(s.createSpouse) A.spouse();
    if(s.marry){ A.spouse(); A.tag(P,'已婚'); A.untag(P,'恋爱中'); }
    if(s.clearSpouse){ P.spouse=null; A.untag(P,'恋爱中'); A.untag(P,'已婚'); }
    if(s.haveChild) A.child();
    if(s.addTag) A.tag(P,s.addTag);
    if(s.removeTag) A.untag(P,s.removeTag);
    if(s.blockInvestment){ P.blockedInvestment=true; A.untag(P,'投资者'); }
    if(s.legacyBoost) P.legacyBoost += s.legacyBoost===true?1:s.legacyBoost;
    if(s.legacyCash && P.children.length) P.children.forEach(c=>c.legacyCash=(c.legacyCash||0)+Math.floor(s.legacyCash/P.children.length));
  };

  A.skillFor = cat => {
    const s=A.p.stats;
    if(cat==='教育'||cat==='成长') return s.intelligence*.52+s.discipline*.48;
    if(cat==='职业'||cat==='事业') return s.discipline*.35+s.intelligence*.25+s.social*.25+s.ambition*.15;
    if(cat==='创业') return s.ambition*.3+s.discipline*.28+s.social*.22+s.intelligence*.2;
    if(cat==='投资'||cat==='财富') return s.intelligence*.3+s.discipline*.25+s.stability*.25+s.luck*.2;
    if(cat==='家庭'||cat==='关系') return s.family*.45+s.social*.3+s.stability*.25;
    if(cat==='社交') return s.social*.65+s.luck*.2+s.stability*.15;
    if(cat==='健康') return s.health*.65+s.discipline*.35;
    return (s.luck+s.stability+s.discipline)/3;
  };

  A.adjustedPick = (results,cat) => {
    const P=A.p, skill=A.skillFor(cat), luck=P.stats.luck;
    return A.wp(results.map(r=>{
      let w=r.weight||1;
      if(r.good) w*=.7+skill/100+luck/220;
      if(r.bad) w*=1.35-skill/180-luck/300;
      return {...r,_weight:Math.max(.08,w)};
    }));
  };

  A.scaledEffects = (effects={},factor=1) => {
    const out={};
    Object.entries(effects).forEach(([k,v])=>out[k]=Math.round(v*factor));
    return out;
  };

  A.genericOutcome = act => {
    const P=A.p,o=act.option||act,cat=act.category,baseEffects=o.effects||{},baseSpecial={...(o.special||{})};
    const startup=/创业|摆摊|生意|公司|项目/.test(`${act.title} ${act.actionLabel||''}`) && (cat==='创业'||cat==='职业'||cat==='财富');
    if(startup) return A.adjustedPick(L.STARTUP_OUTCOMES,'创业');

    const skill=A.skillFor(cat), luck=P.stats.luck;
    const profiles=[
      {id:'jackpot',weight:Math.max(3,5+luck/16+Math.max(0,skill-70)/6),good:true},
      {id:'good',weight:34+Math.max(0,skill-50)/5,good:true},
      {id:'side',weight:20},
      {id:'flat',weight:17},
      {id:'bad',weight:18+Math.max(0,55-skill)/5,bad:true},
      {id:'disaster',weight:Math.max(5,10-luck/25+Math.max(0,45-skill)/7),bad:true}
    ];
    const q=A.wp(profiles);
    const baseText=o.text||`你选择了“${act.actionLabel||act.title}”。`;
    let effects={},special={...baseSpecial},addTags=[...(o.addTags||[])],text=baseText;
    const positiveKeys=Object.keys(baseEffects);
    if(q.id==='jackpot'){
      effects=A.scaledEffects(baseEffects,1.65); text=`事情比预想顺利得多。${baseText}`;
      if(special.wealth) special.wealth=Math.round(Math.abs(special.wealth)*1.8+L.rand(3000,30000));
      else if(['财富','职业','创业'].includes(cat)) special.wealth=L.rand(12000,90000);
      effects.luck=(effects.luck||0)+2;
    } else if(q.id==='good'){
      effects=A.scaledEffects(baseEffects,1); text=baseText;
    } else if(q.id==='side'){
      effects=A.scaledEffects(baseEffects,.3); special=special.wealth?{wealth:Math.round(special.wealth*.15)}:{};
      const k=L.pick(['social','intelligence','stability','discipline','happiness']); effects[k]=(effects[k]||0)+L.rand(4,9);
      text=`原计划没有完全兑现，但你意外在别处有了收获：${cat==='关系'||cat==='社交'?'你认识了一个后来还会再见的人。':cat==='职业'?'你没拿到最想要的结果，却学会了一件真正能复用的东西。':'你没得到最直观的奖励，却留下了一项以后可能派上用场的经验。'}`;
    } else if(q.id==='flat'){
      effects={}; special={}; addTags=[]; text='这一年投入了不少，但最后基本没有改变什么。时间过去了，结果很普通。';
    } else if(q.id==='bad'){
      positiveKeys.forEach(k=>effects[k]=baseEffects[k]>0?-Math.max(1,Math.round(baseEffects[k]*.45)):Math.round(baseEffects[k]*1.2));
      const oldWealth=baseSpecial.wealth||0; special={};
      const harm=cat==='健康'?'health':cat==='家庭'||cat==='关系'?'family':cat==='职业'?'happiness':'stability'; effects[harm]=(effects[harm]||0)-L.rand(2,6);
      special.wealth=oldWealth?-Math.max(1000,Math.round(Math.abs(oldWealth)*.45)):(['财富','职业','投资'].includes(cat)?-L.rand(3000,28000):0);
      addTags=[]; text=`事情没有按计划发展。你付出了代价，也被迫重新评估这条路。`;
    } else {
      effects={happiness:-L.rand(5,11),stability:-L.rand(3,8)}; special={};
      if(cat==='健康'||P.stats.risk>72) effects.health=-L.rand(4,13);
      if(cat==='家庭'||cat==='关系') effects.family=-L.rand(7,16);
      if(cat==='职业'||cat==='财富'||cat==='投资') special.wealth=-L.rand(18000,120000);
      addTags=[]; text=`这次选择踩中了坏分支。你不但没拿到预期收益，还留下了后遗症。`;
    }
    return {text,effects,special,addTags,good:q.good,bad:q.bad};
  };

  A.resolveOutcome = act => {
    if(act.outcomes?.length) return A.adjustedPick(act.outcomes,act.category);
    const o=act.option||act;
    if(o.results?.length) return A.adjustedPick(o.results,act.category);
    if(act.fixed) return {text:act.desc,effects:act.effects||{},special:act.special||{},addTags:act.addTags||[]};
    return A.genericOutcome(act);
  };

  A.delta = (before,wealthBefore) => {
    const P=A.p,a=[];
    Object.entries(P.stats).forEach(([k,v])=>{const d=v-before[k];if(d)a.push(`${L.ATTR[k]?.name||k}${d>0?'+':''}${d}`)});
    const dw=P.wealth-wealthBefore; if(dw) a.push(`财富${dw>0?'+':''}${L.fmtMoney(dw)}`);
    return a.join(' · ')||'状态无明显变化';
  };
})();
