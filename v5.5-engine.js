(() => {
  const A=window.APP,L=window.LIFE;
  L.VERSION='V5.5';

  const safe=(name,fn)=>{try{return fn()}catch(err){console.warn(`[Life-on-Stage] ${name} skipped`,err);return null}};
  const pick=(arr,salt=0)=>arr[Math.abs(((A.p?.seed||0)+(A.p?.score||0)*7+(A.p?.age||0)*31+salt*97))%arr.length];

  // 100 以后不再禁止成长，而是进入强边际递减。
  // 普通事件很难把单项推到 150+；高阶词条/稀有组合仍可直接提供更大的跳升。
  A.scaledStatDelta=(k,v)=>{
    if(!Number.isFinite(v)||v<=0)return v||0;
    const cur=A.p?.stats?.[k]??0;
    const factor=cur<100?1:cur<120?.72:cur<150?.50:cur<180?.30:.14;
    const eventCap=cur<100?12:cur<120?9:cur<150?6:cur<180?4:2;
    return Math.max(1,Math.round(Math.min(v,eventCap)*factor));
  };
  A.applyStatEffects=effects=>{
    const p=A.p;
    Object.entries(effects||{}).forEach(([k,v])=>{
      if(k in (p.stats||{}))p.stats[k]=L.clamp((p.stats[k]||0)+A.scaledStatDelta(k,v),0,200);
    });
  };

  // 主动选择的属性变化全部走软上限；词条 acquireTrait 保留原始强度，
  // 让 150/180+ 更依赖真正罕见的构筑而不是几十年重复点同一按钮。
  A.applyOutcome=(a,z)=>{
    const p=A.p;
    if(!z._replace){
      A.applyStatEffects(a.effects||{});
      (a.addTags||[]).forEach(t=>{if(t&&!p.tags.includes(t))p.tags.push(t)});
      A.special(a.special);
    }
    A.applyStatEffects(z.effects||{});
    (z.addTags||[]).forEach(t=>{if(t&&!p.tags.includes(t))p.tags.push(t)});
    A.special(z.special);
    if(a.special?.grantZhou){
      const candidates=a.special.grantZhou.map(A.traitByName).filter(Boolean),t=L.pick(candidates);
      if(t){A.acquireTrait(t);z._granted=t}
    }
    if(a.special?.graduated){
      if(!p.tags.includes('已毕业'))p.tags.push('已毕业');
      p.tags=p.tags.filter(x=>x!=='大学在读');
    }
    A.clampStats(p);
  };

  // 事件文本扩写：短文本自动补一段现场感，但不会每条都硬塞网络梗。
  A.enrichLifeText=h=>{
    let text=String(h?.text||'').trim();
    if(!text)return text;
    const tone=h.tone||'neutral',age=h.age??A.p?.age??0;
    const normal=[
      '这件事没有立刻改变人生，但它悄悄改了一点后面的概率。',
      '当时看只是普通一天，后来回头看，它其实留下了痕迹。',
      '你很快又去忙别的事，但这一段还是被人生轨迹记了下来。',
      '没有宏大转折，只是生活又往某个方向偏了一小格。'
    ];
    const good=[
      '这次正反馈来得很实在，你明显感觉事情开始顺起来了。',
      '它还远没到“人生开挂”，但至少这一年没有白过。',
      '你暂时吃到了一点顺风，后面的路因此宽了一些。',
      '这波不算天胡，不过确实值得在心里给自己加一分。'
    ];
    const bad=[
      '麻烦不至于把人生打穿，但它确实让这一年变得难看了一点。',
      '你只能一边处理烂摊子，一边接受“计划赶不上剧情”这件事。',
      '损失已经发生，接下来能做的只有别让它继续连锁反应。',
      '人生没有弹出撤销按钮，你只能把这次代价继续背着往前走。'
    ];
    const meme=[
      '你一度怀疑这是系统 Bug，后来确认只是人生的特色功能。',
      '不是哥们，这种支线任务也能精准刷到你头上。',
      '命运今天的产品经理显然没做用户调研。',
      '这波属于“本来没事，剧情硬要给你加点素材”。'
    ];
    if(text.length<28){
      const bank=tone==='good'?good:tone==='bad'?bad:normal;
      text+=` ${pick(bank,(h.title||'').length+age)}`;
    }else if((h.kind==='finance'||h.kind==='choice')&&Math.random()<.12){
      text+=` ${L.pick(meme)}`;
    }
    return text;
  };

  // 年度轨迹只展示 1-3 个“叙事事件”。如果同年后台触发更多财务细项，
  // 不隐形吞掉，而是合并进最后一个事件，保持一年的阅读密度稳定。
  const recordBase=A.record;
  A.record=h=>{
    if(!h)return;
    const entry={...h,text:A.enrichLifeText(h)};
    if(A._annualCapture&&entry.age===A._annualAge){
      const list=A._annualStories||(A._annualStories=[]),target=A._annualTarget||3;
      if(list.length<target){
        recordBase(entry);
        list.push(entry);
      }else if(list.length){
        const last=list[list.length-1];
        const addon=entry.text.length>70?entry.text.slice(0,70)+'…':entry.text;
        last.text=`${last.text} 同一年里还发生了另一件事：${addon}`;
        if(entry.changes&&entry.changes!=='无明显变化')last.changes=[last.changes,entry.changes].filter(Boolean).join(' · ');
        if(last.tone!==entry.tone)last.tone='neutral';
      }
      if(A.p?.history?.length>900)A.p.history.length=900;
      return;
    }
    recordBase(entry);
    if(A.p?.history?.length>900)A.p.history.length=900;
  };

  A.runMicroEvent=e=>{
    if(!e||!A.p)return null;
    const p=A.p,b={...p.stats},bw=p.wealth;
    A.applyStatEffects(e.effects||{});
    if(e.wealth){
      const [x,y]=e.wealth;
      p.wealth+=L.rand(Math.min(x,y),Math.max(x,y));
    }
    if(e.special)A.special(e.special);
    A.clampStats(p);
    const h={
      age:p.age,title:e.title,text:e.text,changes:A.delta(b,bw),tone:e.tone||A.toneFrom(b,bw),kind:e.chaos?'chaos':'incident',microId:e.id
    };
    A.record(h);
    return h;
  };

  // 重新构建每年 4 选 1：年龄不仅是硬过滤，还会改变类别权重。
  A.buildYear=()=>{
    const p=A.p;
    if(!p||!p.alive)return A.render?.();
    A.notice='';
    const fixed=A.fixedActions();
    if(fixed){A.year=fixed;return A.render?.()}
    let pool=L.EVENTS.filter(A.eventEligible),picked=[],used=new Set();
    while(picked.length<4&&pool.length){
      const e=A.weightPick(pool.map(x=>({...x,_w:(x.weight||1)*A.ageWeight(x)*(x.hidden?1+Math.max(0,p.stats.luck-50)/70:1)})));
      pool=pool.filter(x=>x.id!==e.id);
      const a=A.fromEvent(e);
      if(a&&!used.has(a.id)){picked.push(a);used.add(a.id)}
    }
    for(const f of A.fallbacks().sort(()=>Math.random()-.5)){
      if(picked.length>=4)break;
      if(!used.has(f.id)){picked.push(f);used.add(f.id)}
    }
    A.year=picked.slice(0,4);
    A.render?.();
  };

  // 被动成长不能把健康稳定刷到神仙区间。100 后，健身的被动 +1 只偶发到 120；
  // 高龄自然衰减仍然存在，因此“健康 150”需要真正离谱的词条组合。
  A.passiveYear=()=>{
    const p=A.p;if(!p)return;
    if(p.tags.includes('健身习惯')){
      if(p.stats.health<100)p.stats.health=L.clamp(p.stats.health+1,0,200);
      else if(p.stats.health<120&&Math.random()<.28)p.stats.health=L.clamp(p.stats.health+1,0,200);
    }
    if(p.age>=45)p.stats.health=L.clamp(p.stats.health-L.rand(0,2),0,200);
    if(p.age>=65)p.stats.health=L.clamp(p.stats.health-L.rand(0,2),0,200);
    if(p.age>=80)p.stats.health=L.clamp(p.stats.health-L.rand(0,2),0,200);
    if(p.stats.happiness<25)p.stats.stability=L.clamp(p.stats.stability-L.rand(0,2),0,200);
  };

  const targetEventCount=()=>{
    const r=Math.random();
    return r<.43?1:r<.82?2:3;
  };

  // V5.5 年度事务：一次点击仍然推进一年，但这一年可能发生 1-3 个事件。
  // 主选择永远是第一个；其后从财务、伴侣、子女、幸运与年龄匹配的小事件里补足。
  A.resolve=a=>{
    if(A.busy||!A.p?.alive||!A.pass(a?.requires||{}))return;
    const snapshot=JSON.stringify(A.p),lifeId=A.p.id,yearAge=A.p.age;
    A.busy=true;A._busySince=Date.now();
    const beforeYearStats={...A.p.stats},beforeYearWealth=A.p.wealth;
    A._annualCapture=true;A._annualAge=yearAge;A._annualTarget=targetEventCount();A._annualStories=[];
    try{
      const p=A.p,b={...p.stats},bw=p.wealth;
      const z=a.outcomes?.length?A.pickOutcome(a.outcomes):A.dynamicOutcome(a);
      A.applyOutcome(a,z);
      p.seen[a.sourceEvent||a.id]=p.age;
      p.wealthPeak=Math.max(p.wealthPeak,p.wealth);p.minWealth=Math.min(p.minWealth,p.wealth);
      const changes=A.delta(b,bw),tone=A.toneFrom(b,bw);
      let extra=z._granted?` · 获得强力词条【${z._granted.name}】`:'';
      A.record({age:p.age,title:a.title,text:(z.text||a.desc)+extra,changes,tone,kind:a.rare||a.hidden?'rare':'choice'});
      if(a.rare||a.hidden)p.rareEvents++;

      const drop=safe('trait drop',()=>A.maybeTraitDrop?.(tone));
      if(drop)extra+=` · 新词条【${drop.name}】`;
      A.lastResult={text:(z.text||a.desc)+extra,changes,tone};

      // 现金流必须每年结算；其产生的重大记录会占用年度事件槽。
      safe('income',()=>A.autoIncome?.());

      // 只有还有叙事槽位时才尝试家庭/幸运支线，避免一岁塞七八条流水账。
      if(A._annualStories.length<A._annualTarget)safe('birth',()=>A.maybeBirth?.());
      if(A._annualStories.length<A._annualTarget&&p.spouse)safe('spouse',()=>A.spouseStory?.());
      if(A._annualStories.length<A._annualTarget&&p.children?.length)safe('child',()=>A.childStory?.());
      if(A._annualStories.length<A._annualTarget)safe('luck',()=>A.luckEvent?.());

      // 若上述系统没有触发，就从年龄匹配的生活小事件库补足目标数量。
      let guard=0;
      while(A._annualStories.length<A._annualTarget&&guard++<5){
        const e=A.pickMicroEvent?.();
        if(!e)break;
        if(A._annualStories.some(x=>x.microId===e.id))continue;
        A.runMicroEvent(e);
      }

      safe('passive',()=>A.passiveYear?.());
      A.clampStats(p);
      p.wealthPeak=Math.max(p.wealthPeak,p.wealth);p.minWealth=Math.min(p.minWealth,p.wealth);
      p.score=A.score();
      safe('dynasty',()=>A.syncDynasty?.());

      // 给 UI 留下本年完整净变化和最多 3 条最新人生轨迹。
      const ds={};Object.keys(beforeYearStats).forEach(k=>ds[k]=(p.stats[k]??beforeYearStats[k])-beforeYearStats[k]);
      A._yearDeltaStats=ds;A._yearDeltaWealth=p.wealth-beforeYearWealth;A._deltaLifeId=lifeId;
      A._yearStories=(A._annualStories||[]).map(x=>({...x}));A._resultLifeId=lifeId;A._lastChoiceTitle=a.title||'本年选择';

      let died=false;
      try{died=A.deathCheck()}catch(err){console.error('[Life-on-Stage] deathCheck failed',err)}
      A._annualCapture=false;
      if(!died&&A.p?.alive){
        A.p.age++;
        A.save();
        A.busy=false;A._busySince=0;
        A.buildYear();
      }
    }catch(err){
      console.error('[Life-on-Stage] V5.5 yearly resolve rolled back',err);
      try{A.p=JSON.parse(snapshot)}catch{}
      A._annualCapture=false;A._annualStories=[];A.busy=false;A._busySince=0;
      A.note?.('这次事件处理异常，已自动回滚这一年。可以继续，不会卡档。','bad');
      try{A.buildYear()}catch{try{A.render?.()}catch{}}
    }finally{
      A._annualCapture=false;A.busy=false;A._busySince=0;
      if(A.p&&!A.p.alive){try{A.render?.()}catch(err){console.error(err)}}
    }
  };

  // 结局旁白：按实际人生状态拼成 5-7 段，不再只给一句模板。
  A.endingCommentary=()=>{
    const p=A.p;if(!p)return[];
    if(Array.isArray(p._v55Epilogue)&&p._v55Epilogue.length)return p._v55Epilogue;
    const stats=Object.entries(p.stats||{}).sort((a,b)=>b[1]-a[1]);
    const best=stats[0]||['health',0],worst=stats[stats.length-1]||['health',0];
    const bn=L.ATTR[best[0]]?.name||best[0],wn=L.ATTR[worst[0]]?.name||worst[0];
    const lines=[];
    lines.push(`你从「${p.background}」开局，走了 ${p.age} 年。最后的身份是 ${A.job(p.career).name}，人生最高财富到过 ${L.fmtMoney(p.wealthPeak)}。这不是一张只看终点的成绩单：真正决定这局味道的，是中间那些你当时觉得“也就这样”的选择。`);
    if(p.wealthPeak>=10000000)lines.push(`财富线曾经冲上千万级。钱在这局里已经不只是消费能力，而是选择权本身。${p.wealth<p.wealthPeak*.55?'不过你也完整体验了“巅峰资产只活在截图里”是什么感觉，山顶去过，回撤也没缺席。':'更难得的是，最后还留下了相当一部分，没有把所有高潮都还给市场或生活。'}`);
    else if(p.wealthPeak>=1000000)lines.push(`你没有变成夸张的资本神话，但确实攒出了七位数级别的选择权。对大多数人生来说，这已经足够让很多“必须忍”的事情变成“我可以不干”。`);
    else if(p.wealth<0)lines.push(`财富结局不太体面：最后还在负数区间。你这辈子最稳定的长期关系之一可能是账单——它几乎从不失约。不过负债并没有自动抹掉其它人生价值，只是说明这局的现金流战役打输了。`);
    else lines.push(`财富没有冲到传奇区间，更多时候是在收入、支出和突发事件之间来回拉扯。好处是这局没被一个数字彻底定义；坏处是钱包也确实没给你多少主角光环。`);
    lines.push(`你的最强属性是「${bn}」${best[1]} 点，属于“${A.statLevel(best[1])}”区间；最弱的是「${wn}」${worst[1]} 点。属性表不是平均主义，真正有辨识度的人生，本来就应该有几根柱子长得离谱、几根看着让人想扶额。`);
    if(p.spouse){
      lines.push(`感情线里，${p.spouse.name} 从 ${p.spouse.since||'某个'} 岁左右进入主画面。${p.stats.family>=110?'你没有把伴侣活成背景 NPC，家庭关系甚至成了这局最硬的一块底盘。':p.stats.family<45?'两个人同屏不代表一定同频，关系线留下了不少摩擦和消耗。':'这段关系既没有童话滤镜，也不是纯功能性搭伙，它真实地改变了你的很多年份。'}${p.children?.length?` 后来家庭里还有 ${p.children.length} 个孩子，人生的资源分配从此不再只围着自己转。`:''}`);
    }else lines.push(`这局没有长期配偶进入最终画面。它未必等于孤独，只是你把更多年份留给了自己、工作、朋友或别的东西。至少不用在结算页回答“纪念日到底是哪天”。`);
    const good=p.positive||0,bad=p.negative||0;
    if(bad>good*1.25)lines.push(`坏事件明显比好事件多。你的人生不像爽文，更像服务器一直有告警但就是没彻底宕机。能走到结局，本身就说明你没有被任何一次故障永久锁死。`);
    else if(good>bad*1.4)lines.push(`正反馈显著多于挫折，这局总体算顺风。顺风局的问题是容易让人误以为自己掌握了宇宙规律；好在结局统计会提醒你，运气也参与了不少投票。`);
    else lines.push(`好事和坏事基本互有来回。没有一路开挂，也没惨到系统针对，属于非常典型的“刚觉得稳了，生活又来敲一下门”。`);
    const jokes=[];
    if(p.stats.risk>=150)jokes.push('风险偏好已经不是“偏好”了，风险本人差不多都搬进你家住了。');
    if(p.stats.luck>=150)jokes.push('运气高到这个程度，概率论看到你可能会申请重新培训。');
    if(p.stats.health>=150)jokes.push('健康值离谱到体检报告都像在和年龄本人吵架。');
    if(p.stats.social>=150)jokes.push('社交值这么高，你不是认识很多人，是很多人都认识你。');
    if(p.stats.intelligence>=150)jokes.push('智力堆到这里以后，“想太多”已经从性格问题升级成算力资源。');
    if(p.wealthPeak>=10000000&&p.wealth<p.wealthPeak*.35)jokes.push('友情提示：历史最高财富不能拿去付款，截图也不能。');
    if(p.age>=95)jokes.push('能活到这个年龄，很多年轻时担心的长期问题最后都被你亲自熬成了短期问题。');
    if(p.age<45)jokes.push('这局退场得偏早，很多技能树还没点完。人生倒是很讲效率，连后半场都直接省了。');
    if(!jokes.length)jokes.push('这局最像真实人生的地方，是你始终没拿到完整攻略，却一路假装自己大概知道在干什么。');
    lines.push(`旁白吐槽：${pick(jokes,17)}`);
    p._v55Epilogue=lines;
    return lines;
  };
})();