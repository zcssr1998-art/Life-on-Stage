(() => {
  const A=window.APP,L=window.LIFE;
  if(!A||!L)return;
  L.VERSION='V6.2';
  const pick=x=>L.pick?L.pick(x):x[Math.floor(Math.random()*x.length)];
  const rand=(a,b)=>L.rand?L.rand(a,b):Math.floor(Math.random()*(b-a+1))+a;
  const clamp=(a,b,v)=>Math.max(a,Math.min(b,v));

  // 50 条职业路线，每条 5 个成长阶段。旧事件仍可用原职业 id，通过别名接入。
  const R=(id,icon,group,titles,salaries,tags=[])=>({id,icon,group,titles,salaries,tags});
  L.CAREER_ROUTES=[
    R('software','💻','科技',['软件实习生','初级软件工程师','中级软件工程师','高级软件工程师','资深专家工程师'],[5000,10000,18000,30000,48000],['上班族','技能型']),
    R('game_dev','🎮','游戏',['游戏开发实习生','初级游戏程序','中级游戏程序','高级游戏程序','主程 / 技术负责人'],[4500,9000,16000,26000,42000],['上班族','技能型']),
    R('ai_ml','🤖','科技',['AI研究实习生','机器学习工程师','高级算法工程师','AI技术负责人','首席AI科学家'],[6500,14000,26000,42000,70000],['上班族','技能型','技术专家']),
    R('data','📊','科技',['数据实习生','数据分析师','高级数据分析师','数据科学家','数据平台主管'],[4500,9000,16000,26000,43000],['上班族','技能型']),
    R('cybersecurity','🛡️','科技',['安全实习生','安全工程师','高级安全工程师','安全架构师','首席安全专家'],[5500,12000,21000,34000,56000],['上班族','技能型']),
    R('hardware','🧩','科技',['硬件实习生','硬件工程师','高级硬件工程师','系统架构师','硬件技术总监'],[5000,10000,18000,30000,50000],['上班族','技能型']),
    R('semiconductor','🧠','科技',['芯片实习生','芯片设计工程师','高级芯片工程师','芯片架构师','首席芯片专家'],[6500,14000,24000,40000,68000],['上班族','技能型','技术专家']),
    R('cloud','☁️','科技',['运维实习生','云平台工程师','高级云工程师','云架构师','平台技术负责人'],[5000,11000,19000,32000,52000],['上班族','技能型']),
    R('product','🧭','互联网',['产品助理','产品经理','高级产品经理','产品负责人','产品副总裁'],[5500,11000,20000,33000,55000],['上班族']),
    R('uxui','🎨','创意',['设计实习生','UI/UX设计师','高级设计师','设计负责人','设计总监'],[4500,9000,16000,26000,42000],['上班族','技能型']),
    R('3d_art','🗿','游戏',['3D美术实习生','角色/场景美术师','高级3D美术师','主美 / Lead Artist','美术总监'],[4000,8500,15000,25000,40000],['上班族','技能型']),
    R('game_ta','⚙️','游戏',['TA助理','初级技术美术','中级技术美术','高级技术美术','TA负责人 / 管线架构师'],[5500,11000,19000,32000,52000],['上班族','技能型','技术专家']),
    R('animation_vfx','✨','创意',['动画/VFX实习生','动画/VFX艺术家','高级动画/VFX艺术家','视效主管','视效总监'],[4000,8500,15000,26000,43000],['上班族','技能型']),
    R('actor','🎬','演艺',['跑龙套演员','十八线小演员','二三线演员','一线明星','顶流明星'],[2500,7000,18000,70000,260000],['内容创作者']),
    R('singer','🎤','演艺',['酒吧驻唱 / 练习生','独立歌手','小有名气歌手','一线歌手','国民级歌手'],[2500,7000,18000,65000,220000],['内容创作者']),
    R('influencer','📱','内容',['素人创作者','小网红','中腰部博主','头部博主','超级网红 / IP主理人'],[1000,6000,18000,60000,180000],['内容创作者']),
    R('streamer','📺','内容',['新人主播','小主播','稳定主播','头部主播','平台顶流主播'],[1500,6500,20000,70000,200000],['内容创作者']),
    R('esports','🕹️','竞技',['青训选手','职业替补','职业首发','明星选手','传奇选手 / 教练'],[3000,10000,25000,80000,180000],['技能型']),
    R('writer','✍️','创意',['自由撰稿人','签约作者','畅销作者','知名作家','国民级作家'],[2500,7000,18000,50000,120000],['内容创作者']),
    R('journalist','📰','传媒',['记者实习生','记者','资深记者','栏目主编','媒体总编辑'],[3500,7500,13000,22000,38000],['上班族']),
    R('advertising','📣','商业',['广告实习生','广告策划','资深策划','创意总监','广告公司合伙人'],[4000,8500,15000,28000,52000],['上班族']),
    R('sales','🤝','商业',['销售新人','销售顾问','高级销售','销售经理','销售总监'],[4500,9000,18000,32000,60000],['上班族']),
    R('consulting','🧳','商业',['咨询实习生','咨询顾问','高级顾问','项目经理','咨询合伙人'],[6500,13000,23000,40000,80000],['上班族']),
    R('finance','💹','金融',['金融实习生','金融分析师','高级分析师','投资经理','投资总监'],[6500,13000,24000,43000,85000],['上班族']),
    R('investment_banking','🏦','金融',['投行实习生','投行分析师','投行经理','执行董事','投行合伙人'],[8000,18000,35000,70000,150000],['上班族']),
    R('accounting','🧾','金融',['审计实习生','会计 / 审计员','高级审计员','财务经理','财务总监'],[4000,8000,14000,26000,48000],['上班族']),
    R('lawyer','⚖️','专业服务',['律所实习生','初级律师','主办律师','高级律师','律所合伙人'],[4500,10000,20000,40000,90000],['上班族']),
    R('civil_service','🏛️','公共',['基层办事员','科员','业务骨干','部门负责人','高级管理岗位'],[5000,7500,10500,15000,22000],['上班族']),
    R('police','👮','公共',['见习警员','警员','业务骨干','警务主管','高级警务管理岗'],[5500,8500,12000,18000,26000],['上班族']),
    R('firefighter','🚒','公共',['消防新人','消防员','班组骨干','消防指挥员','高级指挥员'],[5000,8000,11500,17000,24000],['上班族']),
    R('teacher','🧑‍🏫','教育',['见习教师','教师','骨干教师','年级 / 学科负责人','名师 / 校级管理'],[4500,7500,11000,16000,24000],['上班族']),
    R('professor','🎓','教育',['科研助理','讲师','副教授','教授','学术带头人'],[5000,9000,15000,23000,38000],['上班族','技术专家']),
    R('doctor','🩺','医疗',['住院医师','主治医师','副主任医师','主任医师','学科带头人'],[7000,13000,22000,35000,55000],['上班族','技术专家']),
    R('nurse','💉','医疗',['见习护士','护士','主管护师','护士长','护理部负责人'],[4500,7500,10500,15000,22000],['上班族']),
    R('pharma','💊','医疗',['医药实习生','医药专员','高级医药专员','区域负责人','医药事业部负责人'],[4500,9000,16000,28000,50000],['上班族']),
    R('biotech','🧬','科研',['生物实验助理','生物工程师','高级生物工程师','项目科学家','生物技术平台主管'],[5000,10000,18000,30000,50000],['上班族','技能型']),
    R('scientist','🔬','科研',['科研助理','研究员','高级研究员','研究组负责人','首席科学家'],[5000,10000,18000,30000,52000],['上班族','技术专家']),
    R('engineer','🛠️','工程',['工程实习生','初级工程师','中级工程师','高级工程师','首席工程专家'],[4500,9500,16000,26000,43000],['上班族','技能型']),
    R('architect','🏗️','工程',['建筑实习生','建筑设计师','高级建筑师','项目建筑师','设计院负责人'],[4500,9000,16000,28000,48000],['上班族','技能型']),
    R('construction','👷','工程',['施工学徒','施工技术员','项目工程师','项目经理','工程总负责人'],[4000,8000,13000,22000,38000],['上班族','技能型']),
    R('chef','👨‍🍳','服务',['厨房学徒','厨师','主厨','行政总厨','餐饮主理人'],[3000,6500,11000,18000,35000],['技能型']),
    R('hospitality','🏨','服务',['酒店实习生','前厅 / 运营专员','主管','酒店经理','区域酒店负责人'],[3500,6500,10000,16000,30000],['上班族']),
    R('pilot','✈️','交通',['飞行学员','副驾驶','资深副驾驶','机长','教员机长'],[8000,18000,30000,50000,80000],['上班族','技能型']),
    R('logistics','🚚','交通',['物流专员','调度 / 运营','高级运营','物流经理','供应链总监'],[4000,7500,13000,23000,42000],['上班族']),
    R('manufacturing','🏭','制造',['产线技术员','工艺工程师','高级工艺工程师','生产经理','制造平台主管'],[4000,7500,13000,22000,38000],['上班族','技能型']),
    R('electrician','⚡','技能',['电工学徒','电工','高级电工','技师','高级技师 / 工程负责人'],[3500,7000,11000,17000,26000],['技能型']),
    R('mechanic','🔧','技能',['维修学徒','维修技师','高级技师','维修主管','技术店主 / 区域负责人'],[3500,7000,11000,18000,30000],['技能型']),
    R('fitness','🏋️','服务',['健身助教','健身教练','资深教练','明星教练','健身品牌主理人'],[3000,7000,13000,25000,50000],['技能型']),
    R('agriculture','🌾','实体',['农业学徒','农场经营者','规模化经营者','农业企业负责人','农业产业主理人'],[3000,6500,12000,22000,42000],['技能型']),
    R('entrepreneur','🚀','创业',['创业筹备者','小微创业者','稳定经营者','成长型企业创始人','成熟企业掌舵人'],[0,6000,18000,50000,140000],['创业者'])
  ];
  L.CAREER_ROUTE_MAP=Object.fromEntries(L.CAREER_ROUTES.map(x=>[x.id,x]));
  const ALIAS={
    developer:['software',1],designer:['uxui',1],researcher:['scientist',1],technician:['manufacturing',1],freelancer:['3d_art',2],
    clerk:['civil_service',1],sales:['sales',1],teacher:['teacher',1],nurse:['nurse',1],doctor:['doctor',1],finance:['finance',1],lawyer:['lawyer',1],product:['product',1],
    police:['police',1],captain:['police',4],engineer:['engineer',1],artist:['3d_art',1],medtech:['pharma',1],civil:['civil_service',1],scientist:['scientist',3],partner:['consulting',5],creator:['influencer',2]
  };
  const oldJob=A.job;
  A.v62Route=id=>{
    if(L.CAREER_ROUTE_MAP[id])return {route:L.CAREER_ROUTE_MAP[id],level:null};
    const a=ALIAS[id];return a?{route:L.CAREER_ROUTE_MAP[a[0]],level:a[1]}:null;
  };
  A.v62EnsureCareer=(p=A.p)=>{
    if(!p)return null;
    if(!p.career||p.career==='none'){p.careerRoute=null;p.careerLevel=0;p.careerYears=0;return null;}
    const hit=A.v62Route(p.careerRoute||p.career);
    if(!hit)return null;
    p.careerRoute=hit.route.id;
    if(!Number.isFinite(p.careerLevel)||p.careerLevel<1)p.careerLevel=hit.level||1;
    p.careerLevel=clamp(1,5,p.careerLevel);
    if(!Number.isFinite(p.careerYears))p.careerYears=0;
    return hit.route;
  };
  A.job=(id,p=A.p)=>{
    if(id==='none'||!id)return oldJob?.('none')||{id:'none',name:'待业',salary:0,tier:0,tags:[]};
    const hit=A.v62Route(id||p?.careerRoute||p?.career);
    if(!hit)return oldJob?.(id)||{id,name:String(id),salary:0,tier:0,tags:[]};
    const route=hit.route,level=clamp(1,5,(p&&((p.careerRoute===route.id)||(p.career===id)))?(p.careerLevel||hit.level||1):(hit.level||1));
    return {id:route.id,name:route.titles[level-1],salary:route.salaries[level-1],tier:level,tags:[...route.tags],route:route.id,level,group:route.group,icon:route.icon};
  };

  const oldSetJob=A.setJob;
  A.setJob=id=>{
    const p=A.p,hit=A.v62Route(id);
    if(!p||!hit)return oldSetJob?.(id);
    ['上班族','管理者','技术专家','创业者','技能型','内容创作者'].forEach(t=>p.tags=p.tags.filter(x=>x!==t));
    const same=p.careerRoute===hit.route.id;
    p.career=hit.route.id;p.careerRoute=hit.route.id;p.careerLevel=same?(p.careerLevel||hit.level||1):(hit.level||1);p.careerYears=0;
    const j=A.job(p.career,p);j.tags.forEach(t=>{if(!p.tags.includes(t))p.tags.push(t)});
    if(p.careerLevel>=4&&!p.tags.includes('管理者')&&['商业','金融','公共','教育','服务','交通','制造','工程'].includes(hit.route.group))p.tags.push('管理者');
    p.careerTierPeak=Math.max(p.careerTierPeak||0,p.careerLevel);
  };

  A.v62Promote=()=>{
    const p=A.p,route=A.v62EnsureCareer();if(!p||!route||p.careerLevel>=5)return false;
    const from=route.titles[p.careerLevel-1];p.careerLevel++;p.careerYears=0;p.careerTierPeak=Math.max(p.careerTierPeak||0,p.careerLevel);
    if(p.careerLevel>=4&&!p.tags.includes('管理者')&&['商业','金融','公共','教育','服务','交通','制造','工程'].includes(route.group))p.tags.push('管理者');
    p._v62Promotion={from,to:route.titles[p.careerLevel-1],age:p.age};return true;
  };

  const oldSpecial=A.special;
  A.special=s=>{const out=oldSpecial?.(s);if(s?.v62Promote)A.v62Promote();return out;};

  A.v62PromotionAction=()=>{
    const p=A.p,route=A.v62EnsureCareer();if(!p||!route||p.careerLevel>=5||p.careerYears<1)return null;
    const cur=route.titles[p.careerLevel-1],next=route.titles[p.careerLevel];
    return {id:`v62_promote_${route.id}_${p.careerLevel}`,sourceEvent:`v62_promote_${route.id}_${p.careerLevel}`,category:'职业',title:`争取从「${cur}」走到下一阶`,desc:`${next}不是自动解锁。你需要拿出过去一段时间积累的成果，去争一次位置。`,outcomes:[
      {weight:7,good:true,text:`这次机会落到了你手里。你正式成为「${next}」。`,effects:{happiness:3,ambition:4,discipline:2},special:{v62Promote:true}},
      {weight:3,text:'这次没有升上去，但你知道差距具体在哪里了。',effects:{happiness:-2,discipline:2,stability:1}}
    ],fixed:false,rare:false,_v62Promotion:true};
  };

  const oldBuild=A.buildYear;
  A.buildYear=()=>{
    const out=oldBuild?.();
    const p=A.p;if(!p?.alive||!Array.isArray(A.year)||!A.year.length)return out;
    A.v62EnsureCareer(p);
    const isSpecial=A.year.some(x=>x.fixed||x._v61Singularity);
    if(!isSpecial&&A.year.length===4&&p.careerRoute&&Math.random()<.42){
      const promo=A.v62PromotionAction();
      if(promo&&!A.year.some(x=>x._v62Promotion)){A.year[rand(0,A.year.length-1)]=promo;A.render?.();}
    }
    return A.year;
  };

  const spouseCareerPool=['teacher','nurse','software','sales','finance','civil_service','designer','pharma','engineer','hospitality','writer','fitness','accounting','journalist','product'];
  const oldSpouse=A.spouse;
  A.spouse=()=>{
    oldSpouse?.();const p=A.p,s=p?.spouse;if(!s)return null;
    if(!s.gender)s.gender=p.gender==='男'?'女':p.gender==='女'?'男':pick(['男','女']);
    if(!Number.isFinite(s.ageGap))s.ageGap=rand(-4,5);
    if(!s.careerRoute)s.careerRoute=pick(spouseCareerPool);
    if(!Number.isFinite(s.careerLevel))s.careerLevel=clamp(1,4,1+Math.floor(Math.max(0,p.age-22)/12)+rand(-1,1));
    if(!Array.isArray(s.history))s.history=[];
    return s;
  };
  A.v62SpouseAge=()=>A.p?.spouse?Math.max(18,A.p.age-(A.p.spouse.ageGap||0)):null;
  A.v62SpouseJob=()=>{
    const s=A.p?.spouse;if(!s)return null;const r=L.CAREER_ROUTE_MAP[s.careerRoute];if(!r)return null;
    const level=clamp(1,5,s.careerLevel||1);return {name:r.titles[level-1],salary:r.salaries[level-1],level,icon:r.icon,route:r.id};
  };
  A.v62SpouseYear=()=>{
    const p=A.p,s=p?.spouse;if(!s)return;
    A.spouse();
    const j=A.v62SpouseJob();if(!j)return;
    let text=pick(['工作还算平稳，没有大新闻。','忙了一整年，但好在节奏还能撑住。','换了一个项目，情绪比去年复杂一些。','这一年更多精力放在了生活而不是工作。']);
    if(s.careerLevel<5&&Math.random()<.16){s.careerLevel++;const nj=A.v62SpouseJob();text=`职业往前走了一步，升到了「${nj.name}」。`;}
    else if(Math.random()<.07){text='工作遇到明显低谷，收入和状态都受了点影响。';s.careerLevel=Math.max(1,s.careerLevel-1);}
    s.history.unshift({age:A.v62SpouseAge(),text});if(s.history.length>8)s.history.length=8;
  };

  const oldPassive=A.passiveYear;
  A.passiveYear=()=>{
    const p=A.p;if(p){A.v62EnsureCareer(p);if(p.careerRoute)p.careerYears=(p.careerYears||0)+1;}
    const out=oldPassive?.();
    try{A.v62SpouseYear();}catch(e){console.warn('[V6.2] spouse year',e)}
    return out;
  };

  const oldDraft=A.draft;
  A.draft=()=>{
    const d=oldDraft();d.gender=pick(['男','女']);
    const growth=[
      ['老城区','邻里熟、资源普通，很多消息靠熟人流动。',{social:2,family:2}],
      ['城郊新区','变化快、陌生人多，机会和不确定性一起长大。',{risk:2,ambition:2}],
      ['县城老街','生活半径不大，但人情关系格外密。',{family:3,social:1}],
      ['产业新城','从小就能看到大量务工、制造和新行业流动。',{ambition:3,stability:-1}],
      ['大学城附近','知识、年轻人和新鲜观点出现得更早。',{intelligence:3}],
      ['小镇 / 乡村','生活节奏慢，资源少一些，但自由活动空间更大。',{health:2,ambition:1}]
    ];
    const birth=[['独生子女',{family:1}],['家中老大',{discipline:2,family:-1}],['家中老二',{social:2}],['家里最小',{happiness:2,discipline:-1}]];
    const climate=[['规矩很多',{discipline:3,happiness:-1}],['比较松弛',{happiness:3,discipline:-1}],['重视教育',{intelligence:3}],['生意气很重',{ambition:3,risk:1}],['经常搬家',{social:2,stability:-2}],['情绪浓度很高',{family:-2,happiness:-1,social:2}]];
    d.v62Growth=pick(growth);d.v62Birth=pick(birth);d.v62Climate=pick(climate);
    [d.v62Growth[2],d.v62Birth[1],d.v62Climate[1]].forEach(e=>Object.entries(e).forEach(([k,v])=>{if(k in d.stats)d.stats[k]=clamp(0,200,(d.stats[k]||50)+v)}));
    return d;
  };

  const oldNew=A.newLife;
  A.newLife=d=>{
    const out=oldNew(d);const p=A.p;if(!p)return out;
    p.gender=d?.gender||pick(['男','女']);
    p.birthProfile={growth:d?.v62Growth?.[0]||'普通社区',birthOrder:d?.v62Birth?.[0]||'独生子女',familyClimate:d?.v62Climate?.[0]||'普通家庭氛围'};
    p.careerLevel=p.careerLevel||0;p.careerYears=p.careerYears||0;A.save?.();A.render?.();return out;
  };

  // 旧存档兼容。
  if(A.p){if(!A.p.gender)A.p.gender=pick(['男','女']);A.v62EnsureCareer(A.p);if(A.p.spouse)A.spouse();}
})();