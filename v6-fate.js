(() => {
  const A=window.APP,L=window.LIFE;
  if(!A||!L)return;
  L.VERSION='V6.0';
  L.V6_FORK_KEY='life_on_stage_v6_forks_v1';

  const clamp=(lo,hi,v)=>Math.max(lo,Math.min(hi,v));
  const r=(a,b)=>L.rand?L.rand(a,b):Math.floor(Math.random()*(b-a+1))+a;
  const deep=x=>JSON.parse(JSON.stringify(x));
  const now=()=>Date.now();
  const safe=(name,fn)=>{try{return fn()}catch(err){console.warn(`[V6] ${name}`,err);return null}};

  const WORLD_DEFAULT=()=>({
    economy:r(42,66), jobs:r(43,67), tech:r(36,62), market:r(38,64),
    medicine:r(35,58), conflict:r(18,42), housing:r(42,68),
    yearIndex:0, headline:'世界没有大新闻，但暗流一直存在。', shock:'', lastShockAge:-99
  });

  A.v6Ensure=()=>{
    const p=A.p;if(!p)return null;
    p.fate=p.fate||{};
    p.fate.version=1;
    p.fate.nodes=p.fate.nodes||[];
    p.fate.pending=p.fate.pending||[];
    p.fate.world=p.fate.world||WORLD_DEFAULT();
    p.fate.echoes=p.fate.echoes||[];
    p.fate.branch=p.fate.branch||1;
    p.fate.seq=p.fate.seq||0;
    p.fate.lastMajorNode=p.fate.lastMajorNode||null;
    p.fate.worldHistory=p.fate.worldHistory||[];
    p.world=p.world||{name:'普通世界',desc:''};
    if(!Number.isFinite(p.world.careerMul))p.world.careerMul=1;
    return p.fate;
  };

  A.v6WorldLabel=(v,kind='normal')=>{
    if(kind==='conflict')return v>=72?'高风险':v>=52?'紧张':v>=32?'有摩擦':'平静';
    return v>=76?'火热':v>=61?'景气':v>=43?'平稳':v>=28?'偏弱':'低迷';
  };

  A.v6WorldSummary=()=>{
    const f=A.v6Ensure(),w=f?.world;if(!w)return null;
    return {
      headline:w.headline,
      economy:A.v6WorldLabel(w.economy), jobs:A.v6WorldLabel(w.jobs),
      tech:A.v6WorldLabel(w.tech), market:A.v6WorldLabel(w.market),
      medicine:A.v6WorldLabel(w.medicine), conflict:A.v6WorldLabel(w.conflict,'conflict'),
      shock:w.shock||''
    };
  };

  A.v6EvolveWorld=()=>{
    const p=A.p,f=A.v6Ensure(),w=f?.world;if(!p||!w)return;
    const drift=(key,mean,spread)=>{w[key]=clamp(5,95,Math.round(w[key]+r(-spread,spread)+(mean-w[key])*.07));};
    drift('economy',52,5);drift('jobs',52,5);drift('market',52,8);drift('housing',52,4);
    drift('tech',68,4);drift('medicine',63,3);drift('conflict',30,4);
    w.tech=clamp(5,98,w.tech+(p.age>18?1:0));
    w.medicine=clamp(5,98,w.medicine+(p.age>30&&Math.random()<.55?1:0));
    w.shock='';

    const canShock=p.age-w.lastShockAge>=3;
    if(canShock&&Math.random()<.105){
      const shocks=[
        {id:'boom',title:'📈 经济扩张',text:'企业招聘和消费一起升温，很多原本卡住的机会突然开始流动。',apply:()=>{w.economy+=16;w.jobs+=14;w.market+=15;}},
        {id:'recession',title:'📉 经济衰退',text:'裁员、预算收缩和谨慎情绪同时出现，时代开始主动收紧每个人的选择。',apply:()=>{w.economy-=20;w.jobs-=18;w.market-=17;}},
        {id:'ai',title:'🤖 技术跃迁',text:'新一轮自动化浪潮爆发。有人被替代，也有人突然拥有了过去没有的杠杆。',apply:()=>{w.tech+=20;w.jobs-=7;w.economy+=4;}},
        {id:'medical',title:'🧬 医疗突破',text:'新的诊疗与药物技术进入普及期，过去只能拖着的疾病开始有了更多解法。',apply:()=>{w.medicine+=20;w.economy+=3;}},
        {id:'crisis',title:'🌍 地缘危机',text:'外部冲突升温，市场和就业预期同时变得摇摆，很多计划被迫重新计算。',apply:()=>{w.conflict+=24;w.market-=18;w.economy-=8;}},
        {id:'asset',title:'🏠 资产周期反转',text:'住房与资产价格突然改变方向，有人发现自己的安全垫其实是另一种风险。',apply:()=>{w.housing+=Math.random()<.5?-22:20;w.market+=r(-12,12);}},
        {id:'liquidity',title:'💧 流动性宽松',text:'资金价格下降，融资和风险偏好明显回暖，市场里重新出现“这次不一样”的声音。',apply:()=>{w.market+=20;w.economy+=10;w.jobs+=5;}},
        {id:'tight',title:'🏦 高利率时代',text:'借钱变贵、现金重新有了价格，扩张型行业开始感受到真正的压力。',apply:()=>{w.market-=14;w.economy-=11;w.housing-=13;}}
      ];
      const s=L.pick(shocks);s.apply();
      ['economy','jobs','tech','market','medicine','conflict','housing'].forEach(k=>w[k]=clamp(5,95,w[k]));
      w.shock=s.id;w.headline=`${s.title}：${s.text}`;w.lastShockAge=p.age;
      f.worldHistory.unshift({age:p.age,id:s.id,title:s.title,text:s.text});
      if(f.worldHistory.length>30)f.worldHistory.length=30;
    }else{
      const bank=[];
      if(w.tech>=72)bank.push('技术正在高速渗透，旧经验的保质期明显缩短。');
      if(w.economy<=34)bank.push('经济偏弱，很多“能力问题”其实混着时代问题。');
      if(w.jobs<=34)bank.push('就业市场偏冷，稳定本身正在变成一种稀缺品。');
      if(w.market>=72)bank.push('资产市场情绪火热，连平时不聊投资的人都开始讨论收益率。');
      if(w.market<=30)bank.push('市场风险偏好低迷，现金和确定性重新被高估。');
      if(w.medicine>=75)bank.push('医疗技术进入高景气阶段，寿命与健康的边界正在缓慢移动。');
      if(w.conflict>=62)bank.push('外部冲突持续升温，供应链与风险资产都变得更敏感。');
      w.headline=bank.length?L.pick(bank):'没有宏大新闻，但经济、技术和人心仍在缓慢移动。';
    }
    w.yearIndex++;
    p.world.careerMul=clamp(.72,1.28,.74+w.jobs*.005+w.economy*.002);
  };

  A.v6WorldBias=a=>{
    const w=A.v6Ensure()?.world;if(!w||!a)return 0;
    const text=`${a.category||''} ${a.title||''}`;
    let b=0;
    if(/职业|工作|副业|创业/.test(text))b+=(w.jobs-50)/170+(w.economy-50)/240;
    if(/投资|财富|资产|买房|创业/.test(text))b+=(w.market-50)/190+(w.economy-50)/260;
    if(/成长|学习|技能|技术|教育/.test(text))b+=(w.tech-50)/300;
    if(/健康|医疗|运动/.test(text))b+=(w.medicine-50)/330;
    if(w.conflict>65&&/旅行|投资|创业|职业/.test(text))b-=(w.conflict-65)/240;
    return clamp(-.28,.28,b);
  };

  A.v6AddNode=(data={})=>{
    const p=A.p,f=A.v6Ensure();if(!p||!f)return null;
    const id=`c${p.age}_${++f.seq}`;
    const parentIds=[...(data.parentIds||[])].filter(Boolean).slice(-3);
    const n={id,age:p.age,title:data.title||'无名节点',kind:data.kind||'choice',category:data.category||'',parentIds,text:data.text||'',worldShock:f.world?.shock||'',created:now()};
    f.nodes.push(n);if(f.nodes.length>220)f.nodes.splice(0,f.nodes.length-220);
    if(data.major!==false)f.lastMajorNode=id;
    return n;
  };

  A.v6Node=id=>A.v6Ensure()?.nodes?.find(x=>x.id===id)||null;

  A.v6Schedule=(spec={})=>{
    const p=A.p,f=A.v6Ensure();if(!p||!f)return null;
    const item={id:`d${p.age}_${++f.seq}`,createdAge:p.age,dueAge:spec.dueAge??p.age+r(2,8),sourceId:spec.sourceId||f.lastMajorNode||null,
      title:spec.title||'旧选择回来敲门',text:spec.text||'当年留下的东西没有消失，只是晚了一些才结算。',effects:spec.effects||{},tone:spec.tone||'neutral',kind:spec.kind||'echo'};
    f.pending.push(item);if(f.pending.length>24)f.pending.splice(0,f.pending.length-24);
    return item;
  };

  A.v6SeedDelayed=(a,node)=>{
    const p=A.p;if(!p||!a||a.fixed&&p.age<=1)return;
    const text=`${a.category||''} ${a.title||''} ${a.desc||''}`;
    const luck=(p.stats.luck||50),stability=(p.stats.stability||50);
    const chance=clamp(.10,.38,.21+(Math.abs((p.stats.risk||50)-50))/500+(a.rare?.06:0));
    if(Math.random()>chance)return;
    const due=p.age+r(2,Math.min(12,Math.max(3,Math.round(5+(p.age<30?4:1)))));
    let spec=null;
    if(/健康|运动|熬夜|休息|身体/.test(text)){
      const positive=/运动|休息|体检|健康/.test(text)&&! /熬夜|透支|硬扛/.test(text);
      spec=positive?{dueAge:due,title:'身体记住了当年的投入',text:'几年前开始的健康习惯没有立刻开奖，但身体把那笔账悄悄记成了复利。',effects:{health:r(3,8),stability:r(1,4)},tone:'good'}:
        {dueAge:due,title:'旧透支开始收利息',text:'当年觉得“扛一扛就过去”的消耗没有消失，现在它换了一种方式回来结算。',effects:{health:-r(4,10),happiness:-r(1,4)},tone:'bad'};
    }else if(/职业|工作|项目|创业|副业|加班/.test(text)){
      const good=luck+stability+r(-30,30)>105;
      spec=good?{dueAge:due,title:'旧项目带来了第二次回报',text:'你早些年的一段工作经历被人重新想起，机会不是凭空来的，只是延迟到账。',effects:{ambition:r(3,7),social:r(2,6),stability:r(1,4)},tone:'good'}:
        {dueAge:due,title:'职业旧账开始追你',text:'当年的高压选择没有立刻出事，但长期积累的疲惫和焦虑终于要求结算。',effects:{health:-r(3,8),happiness:-r(3,8),stability:-r(2,6)},tone:'bad'};
    }else if(/家庭|伴侣|恋爱|家人|孩子|朋友|社交/.test(text)){
      const good=(p.stats.family||50)+(p.stats.social||50)+r(-35,35)>105;
      spec=good?{dueAge:due,title:'一段关系在多年后回赠了你',text:'你当年花出去的时间没有收益率，但多年以后，它变成了一次真正有人站在你这边。',effects:{family:r(4,9),happiness:r(3,7),social:r(2,5)},tone:'good'}:
        {dueAge:due,title:'被忽略的关系开始反噬',text:'很多关系不是一次争吵毁掉的，而是无数次“下次再说”慢慢磨空的。',effects:{family:-r(4,10),happiness:-r(2,6)},tone:'bad'};
    }else if(/学习|技能|成长|专业|大学|教育/.test(text)){
      spec={dueAge:due,title:'旧知识突然派上了用场',text:'当年看起来没有回报的学习，在完全没预料到的场景里变成了你的筹码。',effects:{intelligence:r(3,8),discipline:r(1,5),ambition:r(1,4)},tone:'good'};
    }else if(/投资|财富|资产|风险/.test(text)){
      const good=luck+r(-30,30)>55;
      spec=good?{dueAge:due,title:'旧的风险经验救了你一次',text:'真正留下来的不是某次盈亏，而是你曾经交过学费后形成的风险直觉。',effects:{stability:r(3,7),discipline:r(2,5),luck:r(1,3)},tone:'good'}:
        {dueAge:due,title:'旧风险留下了心理后遗症',text:'那次选择早就结束了，但你对风险的判断方式被它悄悄改变，后来才看出代价。',effects:{stability:-r(2,6),happiness:-r(2,5)},tone:'bad'};
    }
    if(spec){spec.sourceId=node?.id;A.v6Schedule(spec);if(Math.random()<.18)A.note?.('这个选择似乎没有完全结束。以后也许还会回来找你。');}
  };

  A.v6ResolveDue=()=>{
    const p=A.p,f=A.v6Ensure();if(!p||!f)return[];
    const due=f.pending.filter(x=>x.dueAge<=p.age),keep=f.pending.filter(x=>x.dueAge>p.age);f.pending=keep;
    const out=[];
    for(const d of due.slice(0,2)){
      const source=A.v6Node(d.sourceId),before={...p.stats};
      A.applyStatEffects?A.applyStatEffects(d.effects||{}):Object.entries(d.effects||{}).forEach(([k,v])=>{if(k in p.stats)p.stats[k]=clamp(0,200,(p.stats[k]||0)+v)});
      A.clampStats?.(p);
      const node=A.v6AddNode({title:d.title,kind:'echo',category:'命运回响',parentIds:[d.sourceId],text:d.text,major:true});
      const changes=Object.entries(p.stats).map(([k,v])=>{const dv=v-(before[k]||0);return dv?`${L.ATTR[k]?.name||k}${dv>0?'+':''}${dv}`:''}).filter(Boolean).join(' · ')||'无明显数值变化';
      const h={age:p.age,title:`⏳ ${d.title}`,text:`${d.text}${source?` 这件事最早可以追溯到 ${source.age} 岁的「${source.title}」。`:''}`,changes,tone:d.tone,kind:'fate',v6CauseId:node?.id,v6ParentId:d.sourceId};
      A.record?.(h);f.echoes.unshift({age:p.age,sourceAge:source?.age,title:d.title,sourceTitle:source?.title||'未知节点',tone:d.tone});if(f.echoes.length>30)f.echoes.length=30;out.push(h);
    }
    return out;
  };

  A.v6ForkStore=()=>{try{return JSON.parse(localStorage.getItem(L.V6_FORK_KEY))||[]}catch{return[]}};
  A.v6WriteForks=xs=>safe('write forks',()=>localStorage.setItem(L.V6_FORK_KEY,JSON.stringify(xs)));
  A.v6ShouldFork=a=>{
    const p=A.p;if(!p||!a)return false;
    if(a.fixed||a.rare||a.hidden)return true;
    if([12,18,22,28,35,45,60].includes(p.age))return true;
    return /毕业|职业|创业|投资|关系|家庭|婚姻|教育|买房|迁移/.test(`${a.category||''} ${a.title||''}`)&&Math.random()<.28;
  };
  A.v6SaveFork=a=>{
    const p=A.p;if(!p||!a||!A.v6ShouldFork(a))return null;
    const f=A.v6Ensure();
    let snapshot=deep(p);snapshot.history=(snapshot.history||[]).slice(0,180);
    const item={id:`f_${p.id}_${p.age}_${now().toString(36)}`,lifeId:p.id,age:p.age,title:a.title||'人生岔路',category:a.category||'',sourceEvent:a.sourceEvent||a.id||'',branch:f.branch||1,created:now(),snapshot,year:deep(A.year||[])};
    let xs=A.v6ForkStore().filter(x=>x.lifeId===p.id);
    if(xs.some(x=>x.age===item.age&&x.title===item.title))return null;
    xs.push(item);xs.sort((a,b)=>a.age-b.age);if(xs.length>10)xs=xs.slice(-10);A.v6WriteForks(xs);return item;
  };

  A.v6Forks=()=>{const id=A.p?.id;return A.v6ForkStore().filter(x=>x.lifeId===id).sort((a,b)=>b.age-a.age)};
  A.v6RewindFork=id=>{
    const item=A.v6ForkStore().find(x=>x.id===id);if(!item)return false;
    const oldBranch=A.p?.fate?.branch||1;
    A.p=deep(item.snapshot);A.v6Ensure();A.p.alive=true;A.p.deathReason='';delete A.p.endings;
    A.p.fate.branch=Math.max(oldBranch+1,(item.branch||1)+1);
    A.p.fate.rewoundFrom={age:item.age,title:item.title,at:now()};
    A.p.history.unshift({age:item.age,title:'🪞 世界线分叉',text:`你回到了「${item.title}」之前。这不是重开人生，而是从同一个过去重新做一次选择。`,changes:`进入第 ${A.p.fate.branch} 条世界线`,tone:'rare',kind:'fate'});
    A.year=deep(item.year||[]);A.view='game';A.lastResult=null;A._yearStories=[];A._deltaLifeId=null;A.busy=false;
    safe('save rewind',()=>A.save?.());
    const nav=document.getElementById?.('bottomNav');nav?.classList.remove?.('hidden');
    if(A.year?.length)A.render?.();else A.buildYear?.();
    A.note?.(`已回到 ${item.age} 岁。换一个选项，看看另一条人生。`,'good');
    return true;
  };

  A.v6CausalHighlights=()=>{
    const f=A.v6Ensure();if(!f)return[];
    const echoes=[...(f.echoes||[])].slice(0,5).map(e=>({age:e.age,title:e.title,sourceAge:e.sourceAge,sourceTitle:e.sourceTitle,tone:e.tone}));
    if(echoes.length)return echoes;
    return [...(f.nodes||[])].filter(x=>x.parentIds?.length).slice(-5).reverse().map(n=>{const p=A.v6Node(n.parentIds[0]);return{age:n.age,title:n.title,sourceAge:p?.age,sourceTitle:p?.title,tone:'neutral'}});
  };

  // ---- wrappers ----
  const baseNewLife=A.newLife;
  if(typeof baseNewLife==='function')A.newLife=d=>{const out=baseNewLife(d);A.v6Ensure();A.v6EvolveWorld();A.save?.();A.buildYear?.();return out;};

  const baseBuild=A.buildYear;
  if(typeof baseBuild==='function')A.buildYear=()=>{A.v6Ensure();return baseBuild();};

  const baseAgeWeight=A.ageWeight;
  A.ageWeight=e=>{
    let w=typeof baseAgeWeight==='function'?baseAgeWeight(e):1;
    const b=A.v6WorldBias(e);
    if(b>0)w*=1+b*.75;else w*=1+b*.40;
    return Math.max(.18,w);
  };

  const basePick=A.pickOutcome;
  if(typeof basePick==='function')A.pickOutcome=outcomes=>{
    const bias=A.v6WorldBias(A._v6CurrentAction);
    if(!bias)return basePick(outcomes);
    const adjusted=(outcomes||[]).map(o=>{
      const score=A.outcomeScore?A.outcomeScore(o):0;let mul=1;
      if(score>2)mul*=1+bias;
      if(score<-2)mul*=1-bias*.70;
      return{...o,weight:(o.weight||1)*Math.max(.45,mul)};
    });
    return basePick(adjusted);
  };

  const baseIncome=A.autoIncome;
  if(typeof baseIncome==='function')A.autoIncome=()=>{
    const ledger=baseIncome();
    const f=A.v6Ensure(),w=f?.world;
    if(ledger&&w){
      const item=ledger.items?.find(x=>x.key==='salary'||x.key==='business');
      if(item)item.note=`${item.note||''}${item.note?' · ':''}时代就业系数 ${(A.p.world?.careerMul||1).toFixed(2)}x`;
      ledger.world={economy:w.economy,jobs:w.jobs,market:w.market,headline:w.headline};
    }
    return ledger;
  };

  const basePassive=A.passiveYear;
  A.passiveYear=()=>{
    const out=typeof basePassive==='function'?basePassive():undefined;
    safe('delayed consequence',()=>A.v6ResolveDue());
    safe('world evolve',()=>A.v6EvolveWorld());
    return out;
  };

  const baseResolve=A.resolve;
  if(typeof baseResolve==='function')A.resolve=a=>{
    if(A.busy||!A.p?.alive||!a)return;
    A.v6Ensure();
    safe('fork checkpoint',()=>A.v6SaveFork(a));
    const f=A.p.fate,parent=f.lastMajorNode?[f.lastMajorNode]:[];
    const node=A.v6AddNode({title:a.title||'本年选择',kind:'choice',category:a.category||'',parentIds:parent,text:a.desc||'',major:true});
    A._v6CurrentCause=node?.id||null;A._v6CurrentAction=a;
    safe('seed delayed',()=>A.v6SeedDelayed(a,node));
    try{return baseResolve(a)}finally{A._v6CurrentAction=null;A._v6CurrentCause=null;}
  };

  const baseRecord=A.record;
  if(typeof baseRecord==='function')A.record=h=>{
    if(h&&A._v6CurrentCause&&!h.v6CauseId)h={...h,v6CauseId:A._v6CurrentCause};
    return baseRecord(h);
  };

  const baseLoad=A.load;
  if(typeof baseLoad==='function')A.load=()=>{const out=baseLoad();A.v6Ensure();return out;};
})();
