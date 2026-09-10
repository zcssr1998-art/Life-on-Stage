(() => {
  const A=window.APP,L=window.LIFE;
  L.VERSION='V5.4';
  const clamp=(lo,hi,v)=>Math.max(lo,Math.min(hi,v));

  // 每局隐藏 Roll 三个长期参数：寿命脆弱度、经济波动度、现金流效率。
  // 不展示给玩家，避免把人生随机性变成可精确计算的公式。
  const ensureLifeVariance=p=>{
    if(!p)return p;
    if(!Number.isFinite(p.mortalityFactor))p.mortalityFactor=.75+Math.random()*.90;
    if(!Number.isFinite(p.economicVolatility))p.economicVolatility=.78+Math.random()*.57;
    if(!Number.isFinite(p.cashflowFactor))p.cashflowFactor=.45+Math.random()*.95;
    return p;
  };
  const newLifeBase=A.newLife;
  A.newLife=d=>{
    const out=newLifeBase(d);
    if(A.p){ensureLifeVariance(A.p);try{A.save?.()}catch{}}
    return out;
  };

  // 彩色词条保持极少数：开局整手约 5%；人生途中词条掉落约 4% 才会转成彩色。
  A.maybeTraitDrop=tone=>{
    const p=A.p,tm=A.traitMods(),sm=A.synergyMods();
    let chance=.11+p.stats.luck*.0006+Math.min(.08,tm.rare*.10+sm.rare*.14);
    if(Math.random()>Math.min(.25,chance))return null;
    let pool=L.TRAITS.filter(t=>!p.traits.some(x=>x.id===t.id));
    if(!pool.length)return null;
    const prism=pool.filter(t=>t.rarity==='P');
    let t=null;
    if(prism.length&&Math.random()<.04){
      t=L.pick(prism);
    }else{
      pool=pool.filter(t=>t.rarity!=='P');
      const luck=clamp(-.4,.8,(p.stats.luck-50)/50);
      const picked=A.weightPick(pool.map(x=>{
        const rank=L.RARITY[x.rarity]?.rank||1;
        let w=L.RARITY[x.rarity]?.weight||1;
        if(rank>=3)w*=Math.max(.55,1+luck*.65+(tone==='good'?.14:0));
        if(rank===1&&tone==='bad')w*=1.18;
        return {...x,_w:w};
      }));
      t=L.TRAITS.find(x=>x.id===picked?.id);
    }
    if(!t)return null;
    const before={...p.stats},bw=p.wealth;
    A.acquireTrait(t);
    const sum=Object.values(t.effects||{}).reduce((a,b)=>a+b,0),tone2=sum>2?'good':sum<0?'bad':'neutral';
    A.record({age:p.age,title:t.rarity==='P'?'🌈 彩色词条':'🧬 新词条',text:`获得【${t.name}】· ${L.RARITY[t.rarity]?.name||t.rarity}`,changes:A.delta(before,bw),tone:tone2,kind:'trait'});
    return t;
  };

  // 现金流重做：职业收入只产生“可储蓄部分”，不再每活一年就稳定灌钱。
  A.autoIncome=()=>{
    const p=ensureLifeVariance(A.p),j=A.job(p.career),tm=A.traitMods(),sm=A.synergyMods();
    if(!p)return;
    const before=p.wealth,age=p.age,children=p.children?.length||0;
    const employed=Number(j.salary)>0;
    const entrepreneur=p.tags?.includes('创业者')||p.tags?.includes('创业成功');

    let laborFactor=age<60?1:age<65?.84:age<70?.54:age<75?.27:age<80?.08:0;
    if(entrepreneur)laborFactor=Math.max(laborFactor,age<75?.70:age<85?.30:.08);

    if(employed&&laborFactor>0){
      // 普通人的净积累率压到更现实的区间；同样职业也会因每局现金流效率产生巨大差异。
      const saveRate=clamp(.015,.22,.020+p.stats.stability*.00080+p.stats.discipline*.00080-children*.012-(p.spouse?0:.004));
      const bonus=clamp(-.15,.70,(sm.income||0)+(tm.income||0));
      const annual=Math.round(j.salary*12*(p.salaryMul||1)*(p.world?.careerMul||1)*laborFactor*saveRate*(1+bonus)*p.cashflowFactor);
      p.wealth+=annual;
    }else if(age>=18){
      const living=L.rand(15000,36000)*(1+children*.15)*(age>=65?1.30:1)*p.economicVolatility;
      p.wealth-=Math.round(living);
    }

    // 有钱之后也有资产维护、消费升级、家庭与税费摩擦；越富绝对金额越大。
    if(p.wealth>300000){
      let rate=p.wealth<1000000?.0035:p.wealth<5000000?.0065:p.wealth<15000000?.010:.014;
      p.wealth-=Math.round(p.wealth*rate*p.economicVolatility);
    }
    // 负债会滚利息，破产不再只是短暂地掉到负数下一年又自动爬回去。
    if(p.wealth<0)p.wealth-=Math.round(Math.abs(p.wealth)*(.05+.045*p.economicVolatility));

    // 投资只有主动成为“投资者”后才存在。收益是肥尾分布，不是线性复利按钮。
    if(p.tags?.includes('投资者')&&!p.blockedInvestment&&p.wealth>25000){
      const table=[
        {r:-.70,w:.025,t:'黑天鹅把一大块本金抹掉了'},
        {r:-.42,w:.065,t:'市场急跌，你的持仓遭到重创'},
        {r:-.24,w:.105,t:'这一年投资明显回撤'},
        {r:-.09,w:.16,t:'账户小幅回撤'},
        {r:.01,w:.205,t:'市场几乎原地踏步'},
        {r:.10,w:.19,t:'投资组合取得普通正收益'},
        {r:.23,w:.13,t:'你吃到了一段不错的行情'},
        {r:.48,w:.07,t:'一轮强势行情显著抬高了资产'},
        {r:.95,w:.035,t:'你押中的方向进入疯狂主升浪'},
        {r:1.90,w:.015,t:'极少见的超级行情彻底改变了资产曲线'}
      ];
      const edge=clamp(-.22,.55,(p.stats.luck-50)*.004+(tm.wealthOutcome||0)*.42+(tm.badGuard||0)*.15);
      const picked=A.weightPick(table.map(x=>({...x,_w:x.w*(x.r>0?1+Math.max(-.18,edge):Math.max(.45,1-edge*.55))})));
      const invested=clamp(.12,.72,.25+(p.stats.risk-50)*.0058+(sm.extreme||0)*.20);
      const delta=Math.round(p.wealth*invested*picked.r*p.economicVolatility);
      p.wealth+=delta;
      if(Math.abs(delta)>=25000&&Math.abs(picked.r)>=.20)A.record({age,title:picked.r>0?'📈 投资大年':'📉 投资回撤',text:picked.t,changes:`财富${delta>0?'+':''}${L.fmtMoney(delta)}`,tone:delta>0?'good':'bad',kind:'finance'});
    }

    // 创业者有独立的经营波动，允许一把起飞，也允许几年积累瞬间打回去。
    if(entrepreneur&&age>=20&&Math.random()<.28*p.economicVolatility){
      const table=[
        {r:-.52,w:.12,t:'业务踩中大坑，现金流严重失血'},
        {r:-.25,w:.20,t:'经营不及预期，利润和积蓄一起被吃掉'},
        {r:-.07,w:.20,t:'业务勉强维持，但这一年没留下什么'},
        {r:.12,w:.24,t:'业务稳步增长，终于有了一点经营杠杆'},
        {r:.48,w:.17,t:'产品突然跑通，利润跃升'},
        {r:1.25,w:.07,t:'业务爆发，规模在一年里跨了一个台阶'}
      ];
      const edge=clamp(-.15,.50,(p.stats.luck-50)*.0035+(tm.success||0)*.20+(p.stats.discipline-50)*.002);
      const picked=A.weightPick(table.map(x=>({...x,_w:x.w*(x.r>0?1+Math.max(-.15,edge):Math.max(.50,1-edge*.5))})));
      const base=clamp(60000,2600000,Math.max(60000,Math.abs(p.wealth)*.58));
      const delta=Math.round(base*picked.r*p.economicVolatility);
      p.wealth+=delta;
      if(Math.abs(delta)>=30000)A.record({age,title:picked.r>0?'🚀 生意爆发':'🧯 生意失血',text:picked.t,changes:`财富${delta>0?'+':''}${L.fmtMoney(delta)}`,tone:delta>0?'good':'bad',kind:'finance'});
    }

    // 普通现金冲击：负面略多于正面，防止“寿命=财富”。
    if(age>=18&&Math.random()<.15*p.economicVolatility){
      const r=Math.random(),scale=clamp(.8,2.4,p.economicVolatility*(1+Math.max(0,age-55)*.008));
      let delta=0,text='',tone='bad';
      if(r<.26){delta=-L.rand(6000,56000)*scale;text=age>=60?'一次医疗与照护支出超出预期':'一笔突发生活支出打乱了现金流'}
      else if(r<.48){delta=-L.rand(8000,76000)*scale;text='家庭突然需要一笔不小的支出'}
      else if(r<.65){delta=-L.rand(5000,46000)*scale;text='设备、住房或交通工具出现了昂贵的问题'}
      else if(r<.78){const loss=Math.max(12000,Math.max(0,p.wealth)*L.rand(5,20)/100);delta=-Math.min(Math.max(20000,Math.max(0,p.wealth)),loss)*scale;text='一次判断失误让你付出了真金白银的代价'}
      else if(r<.93){delta=L.rand(8000,68000)*scale;text=employed?'奖金、项目分成或意外收入到账':'一个临时机会带来了一笔额外收入';tone='good'}
      else{delta=L.rand(30000,190000)*scale;text='一笔罕见的意外之财落到了你头上';tone='good'}
      delta=Math.round(delta);p.wealth+=delta;
      if(Math.abs(delta)>=18000)A.record({age,title:tone==='good'?'💰 意外进账':'💸 突发开支',text,changes:`财富${delta>0?'+':''}${L.fmtMoney(delta)}`,tone,kind:'finance'});
    }

    // 命运级现金冲击：低频但足以改变整局曲线。它是财富分布的“肥尾”。
    if(age>=22&&Math.random()<.028*p.economicVolatility){
      const r=Math.random(),baseWealth=Math.max(0,p.wealth);let delta=0,text='',tone='bad';
      if(r<.30){delta=-Math.max(L.rand(45000,170000),baseWealth*(.20+Math.random()*.28));text='一次重大变故吞掉了多年积累'}
      else if(r<.52){delta=-Math.max(L.rand(30000,130000),baseWealth*(.10+Math.random()*.28));text='纠纷、错误决策或家庭责任造成了一次资产重创'}
      else if(r<.67){delta=-L.rand(25000,95000);text='职业与现金流突然中断，你被迫动用储蓄'}
      else if(r<.82){delta=L.rand(30000,160000);text='一个少见机会带来了一笔改变节奏的收入';tone='good'}
      else if(r<.95){delta=L.rand(100000,480000);text='一笔大额机会、分成或家庭资产落到了你名下';tone='good'}
      else{delta=L.rand(400000,1200000);text='极罕见的财富事件直接改写了你的人生资产曲线';tone='good'}
      delta=Math.round(delta*p.economicVolatility);p.wealth+=delta;
      A.record({age,title:tone==='good'?'✨ 命运进账':'⚠️ 命运重击',text,changes:`财富${delta>0?'+':''}${L.fmtMoney(delta)}`,tone,kind:'finance'});
    }

    p._lastAutoCash=(p.wealth-before)||0;
  };

  // 寿命重做：60 岁后风险明显变陡，同时每局脆弱度不同。
  // 长寿词条有效，但保护存在下限，避免组合后接近永生。
  A.deathCheck=()=>{
    const p=ensureLifeVariance(A.p);
    if(!p||!p.alive)return true;
    if(p.stats.health<=0){A.die('健康崩溃');return true}
    const age=p.age;
    if(age>=112){A.die('自然衰老');return true}
    let base=age<10?.00035:age<18?.00055:age<30?.0010:age<40?.0016:age<50?.0028:age<60?.0055:age<65?.0095:age<70?.016:age<75?.027:age<80?.045:age<85?.075:age<90?.12:age<95?.20:age<100?.31:.52;
    if(age>=108)base=.90;
    const healthMul=clamp(.68,2.35,1+(55-p.stats.health)*.018);
    const riskMul=clamp(.86,1.65,1+(p.stats.risk-50)*.0085);
    const luckMul=clamp(.86,1.12,1-(p.stats.luck-50)*.0028);
    const tm=A.traitMods(),sm=A.synergyMods();
    const protection=Math.max(.38,(tm.death||1)*(sm.death||1));
    const chance=clamp(0,.96,base*p.mortalityFactor*healthMul*riskMul*luckMul*protection);
    if(Math.random()<chance){
      const causes=age<18?['意外事故','突发疾病']:age<40?['交通意外','急性疾病','意外事故','运动意外']:age<65?['突发疾病','交通意外','工作相关意外','急症']:age<80?['心脑血管急症','突发疾病','意外跌倒','慢性疾病恶化']:['自然衰老','心脑血管急症','突发疾病','意外跌倒'];
      A.die(L.pick(causes));return true;
    }
    return false;
  };

  if(A.p)ensureLifeVariance(A.p);
})();
