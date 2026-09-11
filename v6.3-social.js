(() => {
  const A=window.APP,L=window.LIFE;if(!A||!L)return;
  L.VERSION='V6.3';
  const pick=x=>L.pick?L.pick(x):x[Math.floor(Math.random()*x.length)];
  const rand=(a,b)=>L.rand?L.rand(a,b):Math.floor(Math.random()*(b-a+1))+a;
  const clamp=(a,b,v)=>Math.max(a,Math.min(b,v));
  const namesM=['林砚','周屿','陈川','顾深','陆森','沈舟','许衡','江燃','程野','唐砚','苏沉','韩川','季临','闻野','谢川','秦越','白舟','贺景','宋屿','梁序'];
  const namesF=['林澈','沈宁','顾遥','许岚','苏梨','夏霁','唐绫','江晚','程知夏','周禾','陆宁','白露','秦岚','季遥','宋栀','梁夏','闻溪','贺宁','谢晚','韩霁'];
  const traits=['温和务实','野心勃勃','松弛乐观','理性克制','社交达人','独立敏锐','嘴硬心软','好胜直接','细腻慢热','幽默随性','原则很强','极度靠谱'];
  const routes=['teacher','nurse','software','sales','finance','civil_service','uxui','pharma','engineer','hospitality','writer','fitness','accounting','journalist','product','3d_art','game_ta','doctor','lawyer','mechanic'];
  const venues=['朋友的饭局','一次工作协作','兴趣活动','社区小店','长途旅行','线上兴趣群','朋友婚礼','同城活动','一次临时项目','健身房'];
  const deathReasons=['突发疾病','长期疾病','意外事故','自然衰老','一次来得很突然的身体恶化'];
  const ensure=()=>{const p=A.p;if(!p)return null;p.relationships=p.relationships||[];p.socialLinks=p.socialLinks||[];return p;};
  A.v63RelationAge=r=>{const p=A.p;return Math.max(18,(p?.age||18)-(r?.ageGap||0));};
  A.v63RelationBand=v=>v>=82?'至交':v>=62?'很亲近':v>=38?'熟悉':v>=15?'普通往来':v>-15?'有些疏远':v>-45?'关系紧张':'敌意明显';
  A.v63RelationRole=r=>{if(r.relation==='伴侣')return'伴侣';if(r.affinity<=-55)return'仇人';if(r.affinity<=-25)return'对头';if(r.affinity>=82)return'挚友';if(r.affinity>=58)return'好友';if(r.affinity>=28)return'朋友';return'认识的人';};
  A.v63RelationJob=r=>{const route=L.CAREER_ROUTE_MAP?.[r.careerRoute];if(!route)return{icon:'🧳',name:'工作不详',salary:0};const lv=clamp(1,5,r.careerLevel||1);return{icon:route.icon,name:route.titles[lv-1],salary:route.salaries[lv-1],level:lv};};
  A.v63CreateNPC=(opts={})=>{
    const p=ensure(),gender=opts.gender||pick(['男','女']),ageGap=Number.isFinite(opts.ageGap)?opts.ageGap:rand(-6,7),careerRoute=opts.careerRoute||pick(routes);
    const intro=(p.relationships||[]).filter(x=>x.alive!==false&&x.affinity>=35).sort((a,b)=>b.affinity-a.affinity)[0];
    const npc={id:opts.id||A.id(),name:opts.name||pick(gender==='男'?namesM:namesF),gender,avatar:Number.isFinite(opts.avatar)?opts.avatar:rand(0,L.AVATARS.length-1),trait:opts.trait||pick(traits),ageGap,careerRoute,careerLevel:clamp(1,4,opts.careerLevel||1+Math.floor(Math.max(0,(p.age||18)-22)/13)+rand(-1,1)),metAge:p.age||18,lastInteractAge:p.age||18,affinity:clamp(-100,100,opts.affinity??8),sharedEvents:opts.sharedEvents||0,relation:opts.relation||'认识的人',alive:opts.alive!==false,deathAge:null,deathReason:'',history:[]};
    if(intro&&Math.random()<.35){npc.introducedBy=intro.id;p.socialLinks.push({a:intro.id,b:npc.id,type:'认识',since:p.age});npc.history.unshift({age:A.v63RelationAge(npc),text:`通过 ${intro.name} 的圈子认识了你。`});}
    return npc;
  };
  A.v63FindRelation=id=>ensure()?.relationships.find(x=>x.id===id)||null;
  A.v63Touch=(id,delta=0,shared=1,note='',hint='')=>{
    const p=ensure(),r=A.v63FindRelation(id);if(!r)return null;
    r.affinity=clamp(-100,100,(r.affinity||0)+delta);r.sharedEvents=(r.sharedEvents||0)+shared;r.lastInteractAge=p.age;
    if(hint)r.relation=hint;else if(r.relation!=='伴侣')r.relation=A.v63RelationRole(r);
    if(note){r.history=r.history||[];r.history.unshift({age:A.v63RelationAge(r),text:note});if(r.history.length>8)r.history.length=8;}
    return r;
  };
  A.v63Meet=(npc,delta=18,note='')=>{
    const p=ensure();let r=A.v63FindRelation(npc.id);
    if(!r){r={...npc,history:[...(npc.history||[])]};p.relationships.push(r);}
    A.v63Touch(r.id,delta,1,note||`你们第一次真正聊了起来。`,delta<0?'对头':'');
    return r;
  };
  A.v63MakePartner=id=>{
    const p=ensure(),r=A.v63FindRelation(id);if(!r||r.alive===false)return null;
    if(p.spouse&&p.spouse.relId&&p.spouse.relId!==id){const old=A.v63FindRelation(p.spouse.relId);if(old&&old.alive!==false&&old.relation==='伴侣')old.relation=old.affinity>=58?'好友':'朋友';}
    r.relation='伴侣';r.affinity=Math.max(68,r.affinity||0);r.sharedEvents=(r.sharedEvents||0)+1;r.lastInteractAge=p.age;
    r.history=r.history||[];r.history.unshift({age:A.v63RelationAge(r),text:'你们决定不再只做普通朋友。'});
    p.spouse={id:r.id,relId:r.id,name:r.name,gender:r.gender,avatar:r.avatar,trait:r.trait,ageGap:r.ageGap,careerRoute:r.careerRoute,careerLevel:r.careerLevel||1,since:p.age,history:[],alive:true};
    p.tags=p.tags.filter(x=>x!=='丧偶');if(!p.tags.includes('恋爱中')&&!p.tags.includes('已婚'))p.tags.push('恋爱中');
    return p.spouse;
  };
  A.v63LivingPartnerRelation=()=>{const p=ensure(),s=p?.spouse;if(!s)return null;const r=A.v63FindRelation(s.relId||s.id);return r&&r.alive!==false?r:null;};

  // 所有旧版“凭空生成伴侣”的入口，现在优先从已经认识的人里选择；实在无人可选才补一个关系网角色。
  A.spouse=()=>{
    const p=ensure();if(!p)return null;
    const live=A.v63LivingPartnerRelation();if(live)return p.spouse;
    let r=[...p.relationships].filter(x=>x.alive!==false&&x.affinity>=35).sort((a,b)=>(b.affinity+b.sharedEvents*4)-(a.affinity+a.sharedEvents*4))[0];
    if(!r){r=A.v63CreateNPC({affinity:48,sharedEvents:2});p.relationships.push(r);}
    return A.v63MakePartner(r.id);
  };

  const oldSpecial=A.special;
  A.special=s=>{
    const out=oldSpecial?.(s);if(!s)return out;
    if(s.v63Meet){const cfg=s.v63Meet;A.v63Meet(cfg.npc||cfg,cfg.delta??18,cfg.note||'');}
    if(s.v63Relation){A.v63Touch(s.v63Relation.id,s.v63Relation.delta||0,s.v63Relation.shared??1,s.v63Relation.note||'',s.v63Relation.hint||'');}
    if(s.v63Partner)A.v63MakePartner(s.v63Partner);
    return out;
  };

  A.v63EncounterAction=()=>{
    const npc=A.v63CreateNPC(),venue=pick(venues);
    return {id:`v63_meet_${npc.id}`,sourceEvent:`v63_meet_${npc.id}`,category:'关系',title:`在${venue}偶遇 ${npc.name}`,desc:`${npc.gender} · ${npc.trait}。你们原本只是刚好坐得近，后来话题却越聊越多。`,fixed:false,rare:false,_v63Social:true,outcomes:[
      {weight:6,good:true,text:`你和 ${npc.name} 意外聊得很投缘。临走前你们互相留了联系方式。`,effects:{social:3,happiness:2},special:{v63Meet:{npc,delta:28,note:`在${venue}第一次聊了很久，关系开了个好头。`}}},
      {weight:3,text:`你和 ${npc.name} 算是认识了。没有戏剧性，但之后还有再见面的可能。`,effects:{social:1},special:{v63Meet:{npc,delta:15,note:`在${venue}认识，最初只是普通往来。`}}},
      {weight:1,text:`第一印象并不好。你们都觉得对方有点难相处。`,effects:{happiness:-1,social:1},special:{v63Meet:{npc,delta:-24,note:`第一次见面就互相有些不顺眼。`}}}
    ]};
  };
  A.v63InteractionAction=r=>{
    const role=A.v63RelationRole(r),negative=r.affinity<0;
    return {id:`v63_interact_${r.id}_${A.p.age}`,sourceEvent:`v63_interact_${r.id}_${A.p.age}`,category:'关系',title:negative?`又和 ${r.name} 撞上了`:`和 ${r.name} 认真见一面`,desc:negative?`你们的关系一直有刺。这次碰面可能继续恶化，也可能终于把话说开。`:`你们已经不是一次性的路人。关系要不要继续往前，得靠真正一起经历事情。`,fixed:false,rare:false,_v63Social:true,outcomes:[
      {weight:negative?3:6,good:true,text:negative?`这次你们反而把几件旧事说开了，敌意没那么重了。`:`你们又多了一段只属于彼此的共同记忆。`,effects:{happiness:2,social:2},special:{v63Relation:{id:r.id,delta:negative?24:18,shared:1,note:negative?'一次意外坦诚让关系缓和。':'又一起经历了一件值得记住的事。'}}},
      {weight:3,text:`这次见面没有发生大转折，但联系没有断。`,effects:{social:1},special:{v63Relation:{id:r.id,delta:6,shared:1,note:'关系维持着，没有突然靠近也没有真正走远。'}}},
      {weight:negative?4:1,text:`话赶话说重了。你们之间又多了一根刺。`,effects:{happiness:-3,stability:-1},special:{v63Relation:{id:r.id,delta:-22,shared:1,note:'一次争执让彼此明显疏远。',hint:'对头'}}}
    ]};
  };
  A.v63RomanceCandidate=()=>{
    if(A.v63LivingPartnerRelation())return null;
    return [...(ensure()?.relationships||[])].filter(r=>r.alive!==false&&r.affinity>=48&&(r.sharedEvents||0)>=2&&A.v63RelationAge(r)>=18).sort((a,b)=>(b.affinity+b.sharedEvents*5)-(a.affinity+a.sharedEvents*5))[0]||null;
  };
  A.v63RomanceAction=r=>({id:`v63_romance_${r.id}_${A.p.age}`,sourceEvent:`v63_romance_${r.id}_${A.p.age}`,category:'关系',title:`你和 ${r.name} 之间，好像不只是朋友了`,desc:`已经有 ${r.sharedEvents||2} 次真正交集。某些默契开始变得很难继续装作没看见。`,fixed:false,rare:true,_v63Social:true,outcomes:[
    {weight:7,good:true,text:`这一次你们都没有再绕开。${r.name} 正式进入了你的伴侣栏。`,effects:{happiness:6,family:6,social:2},special:{v63Relation:{id:r.id,delta:22,shared:1,note:'关系跨过了朋友那条线。'},v63Partner:r.id}},
    {weight:2,text:`你们都意识到了暧昧，但谁也没把最后一句话说出口。`,effects:{happiness:2},special:{v63Relation:{id:r.id,delta:10,shared:1,note:'关系停在暧昧里，还没有正式确认。',hint:'暧昧'}}},
    {weight:1,text:`你试着往前走了一步，但对方没有接住。关系短暂变得尴尬。`,effects:{happiness:-5},special:{v63Relation:{id:r.id,delta:-18,shared:1,note:'一次没有对上的心意让关系尴尬了一阵。'}}}
  ]});

  const oldBuild=A.buildYear;
  A.buildYear=()=>{
    const out=oldBuild?.(),p=ensure();if(!p?.alive||!Array.isArray(A.year)||A.year.length!==4||p.age<18)return out;
    if(A.year.some(x=>x.fixed||x._v61Singularity))return A.year;
    let action=null;const romance=A.v63RomanceCandidate();
    if(romance&&Math.random()<(p.age>=27?.78:.60))action=A.v63RomanceAction(romance);
    else{
      const living=p.relationships.filter(x=>x.alive!==false),close=[...living].sort((a,b)=>(b.affinity+b.sharedEvents*3)-(a.affinity+a.sharedEvents*3))[0];
      const meetChance=living.length<2?.74:living.length<6?.48:.24;
      if(p.age<=72&&Math.random()<meetChance)action=A.v63EncounterAction();
      else if(close&&Math.random()<.60)action=A.v63InteractionAction(close);
    }
    if(action){const idx=A.year.map((x,i)=>({x,i})).filter(o=>!o.x._v62Promotion).map(o=>o.i);const slot=idx.length?pick(idx):rand(0,3);A.year[slot]=action;A.render?.();}
    return A.year;
  };

  A.v63KillRelation=(r,reason='')=>{
    const p=ensure();if(!r||r.alive===false)return false;
    r.alive=false;r.deathAge=A.v63RelationAge(r);r.deathReason=reason||pick(deathReasons);r.history=r.history||[];r.history.unshift({age:r.deathAge,text:`在 ${r.deathAge} 岁时离世：${r.deathReason}。`});
    if(p.spouse&&(p.spouse.relId===r.id||p.spouse.id===r.id)){p.spouse.alive=false;p.spouse.deathAge=r.deathAge;p.spouse.deathReason=r.deathReason;p.tags=p.tags.filter(x=>x!=='已婚'&&x!=='恋爱中');if(!p.tags.includes('丧偶'))p.tags.push('丧偶');}
    if(r.affinity>=58&&A._annualCapture&&(A._annualStories||[]).length<(A._annualTarget||3))A.record?.({age:p.age,title:`${r.name} 离世`,text:`你收到 ${r.name} 去世的消息。${r.deathReason}。一个在你人生里出现过很多次的人，从此不会再刷新新的事件。`,changes:'关系网发生永久变化',tone:'bad',kind:'relationship'});
    return true;
  };
  A.v63TickRelationships=()=>{
    const p=ensure();if(!p)return;
    for(const r of p.relationships){
      if(r.alive===false)continue;
      const age=A.v63RelationAge(r);
      if(r.relation!=='伴侣'&&r.careerLevel<5&&age<66&&Math.random()<.035)r.careerLevel++;
      if(p.age-(r.lastInteractAge||p.age)>10&&r.relation!=='伴侣'&&r.affinity>20&&Math.random()<.34)r.affinity=Math.max(18,r.affinity-rand(1,4));
      const hazard=age<50?.0008:age<65?.003:age<75?.012:age<85?.038:age<95?.095:.20;
      if(Math.random()<hazard)A.v63KillRelation(r,age>=82?'自然衰老':pick(deathReasons.slice(0,3)));
    }
    const alive=p.relationships.filter(x=>x.alive!==false);
    if(alive.length>=2&&Math.random()<.07){const a=pick(alive),b=pick(alive.filter(x=>x.id!==a.id));if(b&&!p.socialLinks.some(x=>(x.a===a.id&&x.b===b.id)||(x.a===b.id&&x.b===a.id)))p.socialLinks.push({a:a.id,b:b.id,type:Math.random()<.18?'不对付':'认识',since:p.age});}
  };

  const oldSpouseYear=A.v62SpouseYear;
  A.v62SpouseYear=()=>{
    const r=A.v63LivingPartnerRelation();if(!r)return;
    const out=oldSpouseYear?.();const s=A.p?.spouse;if(s){r.careerLevel=s.careerLevel||r.careerLevel;r.history=r.history||[];const last=s.history?.[0]?.text;if(last){r.history.unshift({age:A.v63RelationAge(r),text:last});if(r.history.length>8)r.history.length=8;}}return out;
  };
  const oldPassive=A.passiveYear;
  A.passiveYear=()=>{const out=oldPassive?.();try{A.v63TickRelationships();}catch(e){console.warn('[V6.3] relationship tick',e)}return out;};

  const oldNew=A.newLife;
  A.newLife=d=>{const out=oldNew(d);if(A.p){A.p.relationships=[];A.p.socialLinks=[];A.p.spouse=null;A.save?.();}return out;};
  const oldChild=A.asChild;
  if(typeof oldChild==='function')A.asChild=child=>{const out=oldChild(child);if(A.p){A.p.relationships=[];A.p.socialLinks=[];A.p.spouse=null;A.save?.();}return out;};

  // 旧存档迁移：已有伴侣自动进入关系网，而不是丢失。
  const p=ensure();if(p?.spouse){let r=A.v63FindRelation(p.spouse.relId||p.spouse.id);if(!r){r={id:p.spouse.id||A.id(),name:p.spouse.name,gender:p.spouse.gender||pick(['男','女']),avatar:p.spouse.avatar||0,trait:p.spouse.trait||'相处多年',ageGap:p.spouse.ageGap||0,careerRoute:p.spouse.careerRoute||pick(routes),careerLevel:p.spouse.careerLevel||2,metAge:p.spouse.since||Math.max(18,p.age-5),lastInteractAge:p.age,affinity:78,sharedEvents:Math.max(3,p.age-(p.spouse.since||p.age)),relation:'伴侣',alive:p.spouse.alive!==false,deathAge:p.spouse.deathAge||null,deathReason:p.spouse.deathReason||'',history:[]};p.relationships.push(r);p.spouse.relId=r.id;} }
})();