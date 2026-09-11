(() => {
  const A=window.APP,L=window.LIFE;
  if(!A||!L)return;
  L.VERSION='V6.1';
  const deep=x=>JSON.parse(JSON.stringify(x));
  const clamp=(a,b,v)=>Math.max(a,Math.min(b,v));
  const AGES=[17,19,20,21,23,24,25,26,27,29,30,31];
  const NAME='拉刻西斯节点';
  const SUB='宿命奇点';

  const SCENARIOS=[
    {id:'midnight_call',title:'凌晨两点，那通电话真的打来了',text:'一个你以为只存在于“如果”里的机会突然变成现实。它要求你在天亮前回答，而且四条路彼此几乎不能兼容。',choices:{
      venture:['把筹码押上去','你决定主动进入高波动人生：机会会更多，代价也会更真实。'],
      scholar:['先去把自己变得更强','你放弃眼前捷径，换一条慢得多、但会改变能力结构的路。'],
      bond:['为了重要的人留下','你第一次明确承认：人生不是只有效率和收益率。'],
      voyage:['带着一个箱子去陌生城市','你把熟悉环境整个清空，后面的人脉、关系和机会池都会重新洗牌。']
    }},
    {id:'last_train',title:'末班车停在你面前，但目的地不在计划里',text:'你原本只是准备回家。站台广播响起时，你突然意识到：有些门只开一次，而且不会告诉你门后是什么。',choices:{
      venture:['上车去见那个创业团队','你把确定性留在站台，选择一条可能暴起也可能摔得很重的路线。'],
      scholar:['不上车，去争取那个深造名额','你把短期机会换成长期能力，未来职业池会被重新改写。'],
      bond:['转身去见那个一直等你的人','你把关系第一次放到主线位置，家庭和伴侣会更早进入你的命运。'],
      voyage:['随便买一张最远的票','你主动切断惯性，让陌生城市和陌生人重新决定你的下一阶段。']
    }},
    {id:'sealed_offer',title:'桌上有四份文件，只允许你签一份',text:'一份给钱，一份给知识，一份给关系，一份给远方。你第一次清楚地看见：所谓选择，本质上是在主动放弃另外三种人生。',choices:{
      venture:['签下高风险合伙协议','你进入更剧烈的财富与事业分布，普通稳定路线开始离你变远。'],
      scholar:['签下长期培养计划','未来几年你会更慢，但知识与专业路线会显著加深。'],
      bond:['签下共同生活的决定','你把另一个人的人生正式写进自己的主线。'],
      voyage:['签下异地调动与迁移','城市、人脉和后续事件池会发生大幅改变。']
    }},
    {id:'rain_crossroad',title:'那场暴雨把所有原计划都冲没了',text:'交通停摆、电话不断、所有安排同时失效。奇怪的是，你反而第一次有机会不按原计划活。',choices:{
      venture:['去赴那个临时改到地下室的局','一个高风险合作从混乱里冒出来，你决定赌一次。'],
      scholar:['回去把那份申请重新提交','你选择继续积累，而不是追眼前最热闹的机会。'],
      bond:['去接那个最需要你的人','你选择让关系成为这段人生的重力中心。'],
      voyage:['直接改签，去另一座城市','你把这场意外当作重新洗牌的许可。']
    }},
    {id:'one_sentence',title:'有人只对你说了一句话，后面的人生却开始偏航',text:'那句话本身并不伟大，真正可怕的是你当时刚好听进去了。你必须决定自己到底相信哪一种未来。',choices:{
      venture:['“别等准备好。”','你开始主动追逐非线性机会，人生会更极端。'],
      scholar:['“先让自己不可替代。”','你把深度能力放到优先级最高的位置。'],
      bond:['“别把最重要的人排到最后。”','你开始把关系和家庭当作真正资源，而不是背景。'],
      voyage:['“换个地方，你会变成另一个人。”','你主动离开熟悉环境，把未来交给新的坐标。']
    }}
  ];

  const statBand=(k,v)=>{
    if(k==='luck')return v<35?'似乎不太顺':v<70?'吉凶难辨':v<105?'偶有顺风':v<145?'明显走运':v<175?'像被命运偏爱':'概率论看不懂你';
    if(k==='risk')return v<35?'极度克制':v<70?'偏谨慎':v<105?'敢于尝试':v<145?'明显激进':v<175?'近乎豪赌':'把风险当室友';
    if(k==='family')return v<30?'明显疏离':v<65?'有些距离':v<100?'关系尚可':v<135?'彼此亲近':v<170?'非常紧密':'几乎不可分割';
    return v<25?'岌岌可危':v<50?'偏弱':v<75?'普通':v<100?'不错':v<125?'很强':v<150?'出众':v<175?'极强':v<195?'近乎传奇':'不可思议';
  };
  A.v61StatBand=statBand;
  A.v61StatLevel=(k,v)=>Math.max(1,Math.min(5,v<40?1:v<75?2:v<110?3:v<150?4:5));
  A.v61MaskChanges=s=>{
    if(!s)return'没有明显变化';
    return String(s).split(' · ').map(x=>{
      if(/^财富[+-]/.test(x))return x;
      const m=x.match(/^([^+-]+)([+-])(\d+)/);if(!m)return x;
      return `${m[1]}${m[2]==='+'?'有所提升':'有所下降'}`;
    }).join(' · ');
  };

  A.v61EnsureSingularity=()=>{
    const p=A.p;if(!p)return null;
    const f=A.v6Ensure?.()||(p.fate=p.fate||{});
    if(f.singularity)return f.singularity;
    if(p.age>35){f.singularity={name:NAME,subtitle:SUB,missed:true,resolved:false};return f.singularity;}
    const seed=Math.abs(Number(p.seed)||Date.now());
    const age=AGES[seed%AGES.length],scenario=SCENARIOS[(Math.floor(seed/17))%SCENARIOS.length];
    f.singularity={name:NAME,subtitle:SUB,age,scenarioId:scenario.id,resolved:false,branch:null,choiceTitle:'',snapshot:null,year:null,replays:0};
    return f.singularity;
  };

  A.v61Scenario=s=>SCENARIOS.find(x=>x.id===s?.scenarioId)||SCENARIOS[0];
  const branchDefs={
    venture:{tag:'奇点·破局',effects:{ambition:16,risk:15,stability:-8,discipline:6},desc:'从此以后，你的人生更容易出现创业、投资、跃迁和断崖式回撤。'},
    scholar:{tag:'奇点·深潜',effects:{intelligence:18,discipline:14,ambition:5,risk:-6},desc:'你把即时反馈换成长期能力，专业与高门槛路线会逐渐变厚。'},
    bond:{tag:'奇点·同盟',effects:{family:20,happiness:13,social:10,ambition:-7},desc:'另一个人的人生更早与你绑定，家庭与关系会真正改变后半程。'},
    voyage:{tag:'奇点·远航',effects:{social:17,luck:10,intelligence:8,family:-8,stability:-6},desc:'你离开熟悉坐标，后面的贵人、关系、职业和城市事件会明显换一套牌。'}
  };

  A.v61SingularityActions=()=>{
    const s=A.v61EnsureSingularity(),sc=A.v61Scenario(s);
    return Object.entries(sc.choices).map(([branch,[title,desc]])=>({
      id:`v61_sing_${s.scenarioId}_${branch}`,category:`✦ ${SUB}`,title,desc,
      effects:{...branchDefs[branch].effects},addTags:[branchDefs[branch].tag],fixed:true,rare:true,_v61Singularity:true,_v61Branch:branch
    }));
  };

  const branchFollowup=()=>{
    const p=A.p,s=p?.fate?.singularity;if(!s?.resolved||!s.branch||p.age<=s.age+2)return null;
    if((p.age-s.age)%5!==0&&Math.random()>.20)return null;
    const bank={
      venture:{id:'v61_b_venture',category:'奇点余波',title:'当年的豪赌又带来一次放大机会',desc:'你已经不是第一次面对这种局面。机会更大，代价也更真。',effects:{ambition:7,risk:4,stability:-3}},
      scholar:{id:'v61_b_scholar',category:'奇点余波',title:'多年前埋下的专业深度终于形成壁垒',desc:'别人临时抱佛脚时，你发现自己已经在这条路上走了很多年。',effects:{intelligence:7,discipline:5,ambition:2}},
      bond:{id:'v61_b_bond',category:'奇点余波',title:'那段关系再次改变了你的现实选择',desc:'这一次不是浪漫桥段，而是两个人共同承担真正的生活后果。',effects:{family:8,happiness:4,stability:3}},
      voyage:{id:'v61_b_voyage',category:'奇点余波',title:'旧城市之外的人脉再次把门推开',desc:'当年离开的决定还在继续制造新的坐标和新的人。',effects:{social:7,luck:3,intelligence:2}}
    };
    return {...bank[s.branch],sourceEvent:bank[s.branch].id,rare:true};
  };

  const baseBuild=A.buildYear;
  A.buildYear=()=>{
    const p=A.p;if(!p)return baseBuild?.();
    const s=A.v61EnsureSingularity();
    if(s&&!s.missed&&!s.resolved&&p.age===s.age){
      A.notice=`✦ ${NAME}显形：这不是普通年份。`;A.year=A.v61SingularityActions();A.render?.();return A.year;
    }
    const out=baseBuild?.();
    if(p.alive&&s?.resolved&&!A.fixedActions?.()){
      const f=branchFollowup();
      if(f&&Array.isArray(A.year)&&A.year.length===4&&!A.year.some(x=>String(x.id).startsWith('v61_b_')))A.year[A.year.length-1]=f;
    }
    return out;
  };

  const applyBranchState=(p,branch)=>{
    if(!p||!branch)return;
    if(branch==='venture'){
      if(!p.tags.includes('投资者'))p.tags.push('投资者');p.blockedInvestment=false;p.economicVolatility=clamp(.75,1.8,(p.economicVolatility||1)*1.25);
    }else if(branch==='scholar'){
      p.salaryMul=(p.salaryMul||1)*1.18;p.education=p.education==='未定'?'长期深造':p.education;
    }else if(branch==='bond'){
      A.spouse?.();p.salaryMul=(p.salaryMul||1)*.96;
    }else if(branch==='voyage'){
      p.salaryMul=(p.salaryMul||1)*1.06;p.economicVolatility=clamp(.7,1.65,(p.economicVolatility||1)*1.08);
    }
  };

  const baseResolve=A.resolve;
  A.resolve=a=>{
    if(!a?._v61Singularity)return baseResolve(a);
    const p=A.p,s=A.v61EnsureSingularity();if(!p||!s||s.resolved)return;
    const snap=deep(p),year=deep(A.year||[]),age=p.age,lifeId=p.id,branch=a._v61Branch;
    s.resolved=true;s.branch=branch;s.choiceTitle=a.title;s.choiceDesc=a.desc;s.resolvedAge=age;s.snapshot=snap;s.year=year;
    const out=baseResolve(a);
    if(A.p?.id===lifeId){
      const cur=A.v61EnsureSingularity();cur.resolved=true;cur.branch=branch;cur.choiceTitle=a.title;cur.choiceDesc=a.desc;cur.resolvedAge=age;cur.snapshot=snap;cur.year=year;
      applyBranchState(A.p,branch);
      A.record?.({age,title:`✦ ${NAME}`,text:`你选择了「${a.title}」。从这里开始，后半生的事件池、关系和风险结构都发生了偏转。${branchDefs[branch].desc}`,changes:'命运分支已改写',tone:'neutral',kind:'rare'});
      A.save?.();if(A.p.alive)A.buildYear?.();else A.render?.();
    }
    return out;
  };

  A.v61RewindSingularity=()=>{
    const cur=A.p,s=cur?.fate?.singularity;if(!s?.snapshot||!s?.year)return false;
    const oldBranch=cur.fate?.branch||1,origin=deep(s.snapshot),year=deep(s.year);
    A.p=origin;A.v6Ensure?.();
    const ns=A.p.fate.singularity||{};
    ns.name=NAME;ns.subtitle=SUB;ns.age=s.age;ns.scenarioId=s.scenarioId;ns.resolved=false;ns.branch=null;ns.choiceTitle='';ns.choiceDesc='';ns.snapshot=deep(origin);ns.year=year;ns.replays=(s.replays||0)+1;
    A.p.fate.singularity=ns;A.p.fate.branch=oldBranch+1;A.p.fate.rewoundFrom={age:s.age,title:NAME,at:Date.now()};
    A.p.alive=true;A.p.deathReason='';delete A.p.endings;A.year=year;A.view='game';A.busy=false;A.lastResult=null;A._yearStories=[];
    document.getElementById?.('bottomNav')?.classList.remove('hidden');A.save?.();A.render?.();return true;
  };

  const baseComment=A.endingCommentary;
  if(typeof baseComment==='function')A.endingCommentary=()=>baseComment().map(x=>String(x)
    .replace(/「([^」]+)」\s*(\d+)\s*点/g,(m,n,v)=>`「${n}」处于“${statBand('',Number(v))}”状态`)
    .replace(/最强属性是「([^」]+)」(\d+) 点/g,(m,n,v)=>`最强属性是「${n}」，已经到了“${statBand('',Number(v))}”的程度`)
    .replace(/最弱的是「([^」]+)」(\d+) 点/g,(m,n,v)=>`最弱的是「${n}」，大致处于“${statBand('',Number(v))}”`));
})();
