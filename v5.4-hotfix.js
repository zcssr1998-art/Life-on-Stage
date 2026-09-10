(() => {
  const A=window.APP,L=window.LIFE;
  L.VERSION='V5.4';
  const clamp=(lo,hi,v)=>Math.max(lo,Math.min(hi,v));

  // 每局隐藏 Roll 两个长期参数：寿命脆弱度与经济波动度。
  // 不展示给玩家，避免把人生随机性变成可精确计算的公式。
  const ensureLifeVariance=p=>{
    if(!p)return p;
    if(!Number.isFinite(p.mortalityFactor))p.mortalityFactor=.75+Math.random()*.90;
    if(!Number.isFinite(p.economicVolatility))p.economicVolatility=.78+Math.random()*.57;
    return p;
  };
  const newLifeBase=A.newLife;
  A.newLife=d=>{
    const out=newLifeBase(d);
    if(A.p){ensureLifeVariance(A.p);try{A.save?.()}catch{}}
    return out;
  };

  // 彩色词条保持极少数：开局整手约 5%；人生途中词条掉落约 4% 才会转成彩色。
  // 其余掉落继续使用幸运、当年结果和稀有度权重。
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

  // 现金流重做：工资不再等于“每年稳定给资产灌钱”。
  // 普通职业只积累真实可储蓄部分；退休/待业会烧现金；高资产存在维护成本与偶发冲击。
  A.autoIncome=()=>{
    const p=ensureLifeVariance(A.p),j=A.job(p.career),tm=A.traitMods(),sm=A.synergyMods();
    if(!p)return;
    const before=p.wealth;
    const age=p.age;
    const children=p.children?.length||0;
    const employed=Number(j.salary)>0;
    const entrepreneur=p.tags?.includes('创业者')||p.tags?.includes('创业成功');

    let laborFactor=age<60?1:age<65?.84:age<70?.54:age<75?.27:age<80?.08:0;
    if(entrepreneur)laborFactor=Math.max(laborFactor,age<75?.70:age<85?.30:.08);

    if(employed&&laborFactor>0){
      const saveRate=clamp(.025,.29,.055+p.stats.stability*.00125+p.stats.discipline*.00115-children*.016-(p.spouse?.id?.length?0:.005));
      const bonus=clamp(-.15,.70,(sm.income||0)+(tm.income||0));
      const annual=Math.round(j.salary*12*(p.salaryMul||1)*(p.world?.careerMul||1)*laborFactor*saveRate*(1+bonus));
      p.wealth+=annual;
    }else if(age>=18){
      // 没有劳动现金流时，生活本身会消耗资产；年龄与家庭负担会放大开支。
      const living=L.rand(14000,33000)*(1+children*.13)*(age>=65?1.25:1);
      p.wealth-=Math.round(living);
    }

    // 高资产不是无摩擦数字：住房、家庭、消费升级、维护与税费等形成轻微拖累。
    if(p.wealth>300000){
      let rate=p.wealth<1000000?.0025:p.wealth<5000000?.0055:p.wealth<15000000?.0085:.012;
      rate*=p.economicVolatility;
      p.wealth-=Math.round(p.wealth*rate);
    }
    // 负债具有利息和现金流压力，允许形成真正的破产/翻盘曲线。
    if(p.wealth<0)p.wealth-=Math.round(Math.abs(p.wealth)*(.045+.035*p.economicVolatility));

    // 投资只有玩家主动进入“投资者”路线后才存在。使用肥尾分布：大多数年份平淡，少数年份暴涨/暴跌。
    if(p.tags?.includes('投资者')&&!p.blockedInvestment&&p.wealth>25000){
      const table=[
        {r:-.65,w:.025,t:'黑天鹅把一大块本金抹掉了'},
        {r:-.40,w:.065,t:'市场急跌，你的持仓遭到重创'},
        {r:-.22,w:.105,t:'这一年投资明显回撤'},
        {r:-.08,w:.16,t:'账户小幅回撤'},
        {r:.02,w:.205,t:'市场几乎原地踏步'},
        {r:.10,w:.19,t:'投资组合取得普通正收益'},
        {r:.22,w:.13,t:'你吃到了一段不错的行情'},
        {r:.45,w:.07,t:'一轮强势行情显著抬高了资产'},
        {r:.90,w:.035,t:'你押中的方向进入疯狂主升浪'},
        {r:1.80,w:.015,t:'极少见的超级行情彻底改变了资产曲线'}
      ];
      const edge=clamp(-.22,.55,(p.stats.luck-50)*.004+(tm.wealthOutcome||0)*.42+(tm.badGuard||0)*.15);
      const picked=A.weightPick(table.map(x=>({...x,_w:x.w*(x.r>0?1+Math.max(-.18,edge):Math.max(.45,1-edge*.55))})));
      let invested=clamp(.12,.68,.25+(p.stats.risk-50)*.0055+(sm.extreme||0)*.18);
      const delta=Math.round(p.wealth*invested*picked.r*p.economicVolatility);
      p.wealth+=delta;
      if(Math.abs(delta)>=25000&&Math.abs(picked.r)>=.20){
        A.record({age,title:picked.r>0?'📈 投资大年':'📉 投资回撤',text:picked.t,changes:`财富${delta>0?'+':''}${L.fmtMoney(delta)}`,tone:delta>0?'good':'bad',kind:'finance'});
      }
    }

    // 创业路线拥有自己的经营波动；它能制造真正的超级赢家，也能把多年积累打回去。
    if(entrepreneur&&age>=20&&Math.random()<.27*p.economicVolatility){
      const table=[
        {r:-.48,w:.12,t:'业务踩中大坑，现金流严重失血'},
        {r:-.22,w:.20,t:'经营不及预期，利润和积蓄一起被吃掉'},
        {r:-.06,w:.20,t:'业务勉强维持，但这一年没留下什么'},
        {r:.12,w:.24,t:'业务稳步增长，终于有了一点经营杠杆'},
        {r:.45,w:.17,t:'产品突然跑通，利润跃升'},
        {r:1.15,w:.07,t:'业务爆发，规模在一年里跨了一个台阶'}
      ];
      const edge=clamp(-.15,.50,(p.stats.luck-50)*.0035+(tm.success||0)*.20+(p.stats.discipline-50)*.002);
      const picked=A.weightPick(table.map(x=>({...x,_w:x.w*(x.r>0?1+Math.max(-.15,edge):Math.max(.50,1-edge*.5))})));
      const base=clamp(60000,2500000,Math.max(60000,Math.abs(p.wealth)*.55));
      const delta=Math.round(base*picked.r*p.economicVolatility);
      p.wealth+=delta;
      if(Math.abs(delta)>=30000)A.record({age,title:picked.r>0?'🚀 生意爆发':'🧯 生意失血',text:picked.t,changes:`财富${delta>0?'+':''}${L.fmtMoney(delta)}`,tone:delta>0?'good':'bad',kind:'finance'});
    }

    // 所有人都会碰到非线性现金事件。负面略多于正面，避免“只要活久就自动发财”。
    if(age>=18&&Math.random()<.13*p.economicVolatility){
      const r=Math.random(),scale=clamp(.8,2.4,p.economicVolatility*(1+Math.max(0,age-55)*.008));
      let delta=0,text='',tone='bad';
      if(r<.26){delta=-L.rand(6000,52000)*scale;text=age>=60?'一次医疗与照护支出超出预期':'一笔突发生活支出打乱了现金流'}
      else if(r<.48){delta=-L.rand(8000,72000)*scale;text='家庭突然需要一笔不小的支出'}
      else if(r<.65){delta=-L.rand(5000,42000)*scale;text='设备、住房或交通工具出现了昂贵的问题'}
      else if(r<.78){const frac=clamp(0,Math.max(15000,p.wealth),Math.max(12000,p.wealth*L.rand(5,18)/100));delta=-frac*scale;text='一次判断失误让你付出了真金白银的代价'}
      else if(r<.93){delta=L.rand(8000,65000)*scale;text=employed?'奖金、项目分成或意外收入到账':'一个临时机会带来了一笔额外收入';tone='good'}
      else{delta=L.rand(30000,180000)*scale;text='一笔罕见的意外之财落到了你头上';tone='good'}
      delta=Math.round(delta);
      p.wealth+=delta;
      if(Math.abs(delta)>=18000)A.record({age,title:tone==='good'?'💰 意外进账':'💸 突发开支',text,changes:`财富${delta>0?'+':''}${L.fmtMoney(delta)}`,tone,kind:'finance'});
    }

    // 记录本模块净现金变化，供 UI 年度变化使用；不单独塞进轨迹避免流水账。
    p._lastAutoCash=(p.wealth-before)||0;
  };

  // 寿命重做：年龄基准风险更陡，同时每局的隐藏脆弱度使寿命真正分散。
  // 强力长寿词条仍然有效，但保护有下限，避免叠到“几乎不死”。
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
      const causes=age<18?['意外事故','突发疾病']:
        age<40?['交通意外','急性疾病','意外事故','运动意外']:
        age<65?['突发疾病','交通意外','工作相关意外','急症']:
        age<80?['心脑血管急症','突发疾病','意外跌倒','慢性疾病恶化']:
        ['自然衰老','心脑血管急症','突发疾病','意外跌倒'];
      A.die(L.pick(causes));return true;
    }
    return false;
  };

  // 旧存档进入 V5.4 时补齐隐藏参数。
  if(A.p)ensureLifeVariance(A.p);
})();
