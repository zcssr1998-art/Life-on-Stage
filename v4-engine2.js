window.APP = window.APP || {};
(() => {
  const A = window.APP, L = window.LIFE;
  A.applyResult = (act,res) => {
    const P=A.p,b={...P.stats},w=P.wealth;
    const effects=res.effects ?? act.effects ?? {};
    Object.entries(effects).forEach(([k,v])=>{ if(k in P.stats) P.stats[k]=L.clamp(P.stats[k]+v); });
    (act.addTags||[]).forEach(t=>A.tag(P,t));
    (res.addTags||[]).forEach(t=>A.tag(P,t));
    A.special(act.special); A.special(res.special);
    if(P.wealth<0) A.tag(P,'负债'); else if(P.wealth>50000) A.untag(P,'负债');
    if(P.stats.family>=62) A.untag(P,'家庭裂痕');
    P.wealthPeak=Math.max(P.wealthPeak,P.wealth);
    const source=act.sourceEvent;
    if(source) P.seen[source.id]=P.age;
    const changes=A.delta(b,w), text=res.text||act.desc||'这一年过去了。';
    P.history.unshift({age:P.age,title:act.title,text,changes,type:act.hidden?'hidden':'main'});
    A.lastResult={age:P.age,title:act.title,text,changes,extras:[]};
  };

  A.eligibleEvent = e => {
    const P=A.p;
    if(P.age<e.minAge||P.age>e.maxAge||!A.pass(e.requires||{})) return false;
    if(e.category==='投资' && (P.blockedInvestment || (e.id!=='start_investing'&&!P.tags.includes('投资者')))) return false;
    if(!e.repeatable && P.seen[e.id]!=null) return false;
    if(e.repeatable && P.seen[e.id]!=null && P.age-P.seen[e.id]<(e.cooldown||5)) return false;
    return e.options?.some(o=>A.pass(o.requires||{})) ?? true;
  };

  A.eventAction = e => {
    const opts=(e.options||[]).filter(o=>A.pass(o.requires||{}));
    if(!opts.length) return null;
    const o=L.pick(opts);
    return {
      id:`${e.id}::${e.options.indexOf(o)}`, category:e.category, title:e.title, desc:e.desc,
      actionLabel:o.label, hint:o.hint||'', requires:o.requires||{}, option:o, sourceEvent:e,
      hidden:!!e.hidden, weight:e.weight||1
    };
  };

  A.earlyActions = () => [
    L.action('early_play_'+A.p.age,'童年','疯玩一整年','玩耍也会塑造性格。',{outcomes:[{weight:55,text:'你在玩耍里认识了很多小伙伴。',effects:{happiness:7,social:5,health:3}},{weight:25,text:'你玩得太野，磕磕碰碰没少受伤。',effects:{happiness:5,health:-5,risk:3}},{weight:20,text:'这一年没发生什么特别的事，只留下模糊的快乐。',effects:{happiness:4}}]}),
    L.action('early_read_'+A.p.age,'童年','缠着大人讲故事','你对故事里的世界产生了兴趣。',{outcomes:[{weight:60,text:'你很早就开始自己认字和找书。',effects:{intelligence:6,discipline:2}},{weight:25,text:'你只喜欢听，不太喜欢自己看。',effects:{happiness:4,social:2}},{weight:15,text:'大人没什么耐心，你反而更早学会自己找答案。',effects:{intelligence:4,family:-3,stability:3}}]}),
    L.action('early_family_'+A.p.age,'家庭','黏着家里人','小时候，陪伴本身就是一件大事。',{outcomes:[{weight:60,text:'这几年家庭给了你很强的安全感。',effects:{family:7,happiness:5,stability:3}},{weight:25,text:'家里很忙，你经常自己玩。',effects:{stability:3,family:-2}},{weight:15,text:'一次激烈争吵让你第一次害怕“家会散掉”。',effects:{family:-10,happiness:-6},addTags:['家庭裂痕']}]}),
    L.action('early_make_'+A.p.age,'成长','拆东西 / 画东西','你总想把眼前的东西重新弄一遍。',{outcomes:[{weight:55,text:'你显露出很强的动手或表达欲。',effects:{intelligence:5,discipline:3}},{weight:25,text:'作品很糟，但你乐在其中。',effects:{happiness:6,intelligence:2}},{weight:20,text:'你拆坏了家里一件东西，被狠狠训了一顿。',effects:{intelligence:3,family:-4,happiness:-4}}]}),
    L.action('early_out_'+A.p.age,'成长','跟着大人到处跑','你比同龄人更早接触陌生环境。',{outcomes:[{weight:50,text:'你越来越不怕陌生人和陌生地方。',effects:{social:6,luck:2}},{weight:30,text:'你更喜欢观察而不是说话。',effects:{intelligence:4,stability:3}},{weight:20,text:'一次走丢把全家吓坏了。',effects:{family:-2,stability:-3,luck:-2}}]})
  ];

  A.dynamicActions = () => {
    const P=A.p, out=[];
    if(P.career!=='none' && P.age>=20 && P.age<=60){
      out.push(L.action('dyn_promo_'+P.age,'职业','主动争取晋升',`你在 ${A.job(P.career).name} 这条线上往上够一格。`,{requires:{stats:{discipline:50}},outcomes:[
        {weight:30,good:true,text:'这次争取踩中了窗口，你真的升了一级。',effects:{ambition:5,stability:4},special:{careerPool:'upgrade',salaryMul:1.12},addTags:['职业上升期']},
        {weight:35,text:'没升职，但上级开始把更重要的事交给你。',effects:{discipline:5,social:3},special:{salaryMul:1.04}},
        {weight:20,text:'你卷得太明显，团队关系开始变微妙。',effects:{social:-5,happiness:-4,ambition:3}},
        {weight:15,bad:true,text:'站队失败，你不但没升，还被边缘化了一阵。',effects:{happiness:-8,stability:-5,social:-4},special:{salaryMul:.94}}
      ]}));
      out.push(L.action('dyn_jump_'+P.age,'职业','看看外面的工作机会','跳槽可能是升级，也可能只是换个地方受罪。',{outcomes:[
        {weight:28,good:true,text:'你拿到明显更好的 offer，收入和平台一起抬升。',effects:{happiness:6,ambition:5},special:{careerPool:'upgrade',salaryMul:1.18}},
        {weight:34,text:'薪资涨了一点，工作本质没变。',effects:{stability:2},special:{salaryMul:1.06}},
        {weight:20,text:'新公司画的饼比旧公司更圆。',effects:{happiness:-6,stability:-3},special:{salaryMul:.96}},
        {weight:18,bad:true,text:'你裸辞后迟迟没找到合适工作。',effects:{happiness:-9,stability:-8},special:{career:'none',wealth:-35000}}
      ]}));
    }
    if(P.age>=18 && P.age<=55){
      out.push(L.action('dyn_side_'+P.age,'副业','试着做一条副业','也许多一条现金流，也许只是多一个坑。',{outcomes:[
        {weight:18,good:true,text:'副业突然跑通，开始自己长现金流。',effects:{ambition:6,discipline:5},special:{wealth:45000},addTags:['副业跑通']},
        {weight:30,text:'收入不大，但你发现了一个可长期迭代的方向。',effects:{intelligence:4,discipline:4},special:{wealth:6000}},
        {weight:22,text:'钱没赚到，却认识了几个很有意思的人。',effects:{social:8,happiness:3}},
        {weight:20,text:'忙了一圈，时间被吃掉，收益几乎为零。',effects:{health:-3,happiness:-4,discipline:2}},
        {weight:10,bad:true,text:'你踩了坑，赔钱又耽误主业。',effects:{happiness:-7,stability:-5},special:{wealth:-25000}}
      ]}));
    }
    if(!P.spouse && !P.tags.includes('不婚主义') && P.age>=20 && P.age<=45){
      out.push(L.action('dyn_love_'+P.age,'关系','主动扩大约会圈','你决定给关系这条线一次机会。',{outcomes:[
        {weight:32,good:true,text:'你遇到一个真正愿意继续见面的人。',effects:{happiness:7,social:4},special:{createSpouse:true}},
        {weight:35,text:'见了几个人，没有火花，但社交没白练。',effects:{social:5}},
        {weight:20,text:'短暂心动后很快结束，你有点失落。',effects:{happiness:-5,stability:3}},
        {weight:13,bad:true,text:'一段关系给你留下了很差的体验。',effects:{happiness:-9,social:-3,stability:-3}}
      ]}));
    }
    if(P.spouse && !P.tags.includes('已婚') && !P.tags.includes('不婚主义') && P.age>=23){
      out.push(L.action('dyn_marry_'+P.age,'关系','认真谈一次结婚','把模糊关系推到现实问题上。',{outcomes:[
        {weight:48,good:true,text:'你们谈得比想象成熟，决定结婚。',effects:{family:8,happiness:6,stability:5},special:{marry:true}},
        {weight:30,text:'暂时没有共识，但至少把问题说开了。',effects:{social:4,stability:3}},
        {weight:22,bad:true,text:'这次谈话暴露了根本分歧，关系结束。',effects:{happiness:-10,stability:4},special:{clearSpouse:true}}
      ]}));
    }
    if(P.tags.includes('已婚') && !P.tags.includes('丁克') && !P.tags.includes('想要孩子') && P.age>=25 && P.age<=39){
      out.push(L.action('dyn_childplan_'+P.age,'家庭','讨论要不要孩子','这会改变后面很多年的资源分配。',{outcomes:[
        {weight:45,text:'你们决定尝试要孩子。',effects:{family:5,stability:3},addTags:['想要孩子'],special:{maritalPlan:'children'}},
        {weight:35,text:'你们决定先不生，把生活留给两个人。',effects:{happiness:4,stability:4},addTags:['丁克'],special:{maritalPlan:'dink'}},
        {weight:20,text:'谁也说服不了谁，这个问题暂时搁置。',effects:{family:-4,stability:-2}}
      ]}));
    }
    return out;
  };

  A.graduationActions = P => {
    let pool=[];
    if(P.tags.includes('医学专业')) pool=[['住院医生','doctor'],['医疗技术岗','medtech'],['医学研究','researcher'],['医药销售','sales'],['公共卫生部门','civil']];
    else if(P.tags.includes('警校路线')) pool=[['一线警务','police'],['公共部门','civil'],['警务技术','technician'],['企业安全岗','clerk'],['转行销售','sales']];
    else if(P.tags.includes('数理工科')) pool=[['软件开发','developer'],['工程师','engineer'],['研究员','researcher'],['技术销售','sales'],['自由职业','freelancer']];
    else if(P.tags.includes('艺术传媒')) pool=[['设计/艺术','artist'],['内容创作','creator'],['自由职业','freelancer'],['产品岗位','product'],['销售/商务','sales']];
    else pool=[['金融','finance'],['销售','sales'],['产品','product'],['行政文职','clerk'],['公共部门','civil']];
    return pool.map(([name,id],i)=>L.action(`graduate_${id}_${P.age}`,'毕业节点',`第一份工作：${name}`,`把专业背景换成第一张职业名片。`,{outcomes:[
      {weight:55,text:`你顺利拿到 ${name} 的入场券。`,effects:{stability:4,ambition:3},special:{career:id,education:(P.education||'大学')+' · 已毕业',removeTag:'大学在读'},addTags:['已毕业']},
      {weight:25,text:`你进了 ${name}，但现实和想象差距很大。`,effects:{happiness:-5,discipline:4},special:{career:id,education:(P.education||'大学')+' · 已毕业',removeTag:'大学在读'},addTags:['已毕业']},
      {weight:20,text:'第一轮求职不顺，你先空窗了一阵。',effects:{happiness:-6,stability:-3},special:{career:'none',education:(P.education||'大学')+' · 已毕业',removeTag:'大学在读'},addTags:['已毕业']}
    ]}));
  };
})();
