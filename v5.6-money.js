(() => {
  const A=window.APP,L=window.LIFE;
  L.VERSION='V5.6';
  const clamp=(lo,hi,v)=>Math.max(lo,Math.min(hi,v));
  const money=n=>Math.round(Number(n)||0);

  // V5.6 原则：非金钱事件不能凭空加减钱。
  // 旧 dynamicOutcome 会给任何好/坏选择额外塞随机现金，这里彻底移除。
  A.dynamicOutcome=a=>{
    const base={effects:{...(a.effects||{})},special:{...(a.special||{})},addTags:[...(a.addTags||[])],text:a.desc,_replace:true};
    if(a.fixed)return base;
    const p=A.p,tm=A.traitMods(),sm=A.synergyMods();
    const r=Math.random();
    const goodChance=clamp(.12,.48,.26+(p.stats.luck-50)*.0025+tm.success*.12+sm.success*.10);
    const hasMoney=Number.isFinite(base.special.wealth)&&base.special.wealth!==0;
    if(r<goodChance){
      const effects=Object.fromEntries(Object.entries(base.effects).map(([k,v])=>[k,v>0?Math.round(v*1.45):Math.round(v*.6)]));
      const special={...base.special};
      if(hasMoney){
        const w=base.special.wealth;
        special.wealth=money(w>0?w*1.18:w*.65);
      }else delete special.wealth;
      return{...base,text:`${a.desc}。事情比预期顺利。`,effects,special,good:true};
    }
    if(r>.72){
      const effects=Object.fromEntries(Object.entries(base.effects).map(([k,v])=>[k,v>0?Math.round(v*.35):Math.round(v*1.35)]).concat([['happiness',-L.rand(2,7)]]));
      const special={...base.special};
      if(hasMoney){
        const w=base.special.wealth;
        special.wealth=money(w>0?w*.45:w*1.28);
      }else delete special.wealth;
      return{...base,text:`${a.desc}。这次选择出现了反噬。`,effects,special};
    }
    if(!hasMoney)delete base.special.wealth;
    return base;
  };

  const add=(ledger,key,label,amount,note='')=>{
    amount=money(amount);
    if(!amount)return;
    ledger.items.push({key,label,amount,note});
    ledger.net+=amount;
    A.p.wealth+=amount;
  };

  const taxRate=gross=>gross<=120000?.05:gross<=240000?.09:gross<=500000?.14:gross<=1000000?.20:.25;
  const laborFactor=(p,entrepreneur)=>{
    const a=p.age;
    if(entrepreneur)return a<65?1:a<75?.78:a<85?.38:.10;
    return a<60?1:a<65?.82:a<70?.48:a<75?.20:0;
  };

  const marketPick=p=>{
    const tm=A.traitMods(),sm=A.synergyMods(),world=p.world?.id||'normal';
    const states=[
      {r:-.46,w:.04,label:'市场重挫'},
      {r:-.24,w:.09,label:'明显回撤'},
      {r:-.10,w:.14,label:'小幅下跌'},
      {r:.01,w:.20,label:'基本横盘'},
      {r:.08,w:.22,label:'普通上涨'},
      {r:.16,w:.16,label:'表现不错'},
      {r:.28,w:.10,label:'强势行情'},
      {r:.52,w:.04,label:'大牛市'},
      {r:.90,w:.01,label:'极端牛市'}
    ];
    const luck=clamp(-.20,.30,(p.stats.luck-50)*.003+(tm.wealthOutcome||0)*.22+(tm.badGuard||0)*.08);
    return A.weightPick(states.map(x=>{
      let w=x.w;
      if(world==='boom'&&x.r>0)w*=1.18;
      if(world==='slow'&&x.r>0)w*=.88;
      if(world==='volatile'&&Math.abs(x.r)>=.24)w*=1.35;
      if(x.r>0)w*=1+Math.max(-.15,luck)+(sm.success||0)*.08;
      else w*=Math.max(.55,1-luck*.7);
      return{...x,_w:w};
    }));
  };

  const businessPick=p=>{
    const edge=clamp(-.15,.35,(p.stats.discipline-50)*.002+(p.stats.luck-50)*.0015+(A.traitMods().success||0)*.12);
    const states=[
      {r:-.38,w:.10,label:'经营踩坑'},
      {r:-.16,w:.18,label:'经营亏损'},
      {r:-.04,w:.18,label:'勉强维持'},
      {r:.10,w:.28,label:'正常盈利'},
      {r:.28,w:.18,label:'业务增长'},
      {r:.58,w:.07,label:'产品跑通'},
      {r:1.05,w:.01,label:'爆发式增长'}
    ];
    return A.weightPick(states.map(x=>({...x,_w:x.w*(x.r>0?1+edge:Math.max(.6,1-edge*.7))})));
  };

  // 年度财富结算。每一项都写进 ledger，不再存在“后台随机加钱”。
  A.autoIncome=()=>{
    const p=A.p,j=A.job(p.career),opening=p.wealth;
    const ledger={age:p.age,opening,items:[],net:0,closing:opening};
    const age=p.age;
    if(age<18){
      ledger.note='未成年阶段由家庭承担主要生活成本，本年不结算个人固定现金流。';
      p._lastAutoCash=0;A._yearFinance=ledger;
      p.financeHistory=p.financeHistory||[];p.financeHistory.unshift(ledger);if(p.financeHistory.length>120)p.financeHistory.length=120;
      return ledger;
    }

    const entrepreneur=p.tags?.includes('创业者')||p.tags?.includes('创业成功');
    const lf=laborFactor(p,entrepreneur);
    const tm=A.traitMods(),sm=A.synergyMods();

    if(entrepreneur&&lf>0){
      const base=Math.max(90000,(Number(j.salary)||15000)*12*(p.salaryMul||1)*(p.world?.careerMul||1)*lf);
      const state=businessPick(p),op=money(base*state.r);
      add(ledger,'business',state.r>=0?'经营净现金流':'经营亏损',op,`${state.label} · 经营基数 ${L.fmtMoney(base)}`);
    }else if(Number(j.salary)>0&&lf>0){
      const careerBonus=clamp(-.10,.55,(sm.income||0)+(tm.income||0));
      const gross=(Number(j.salary)||0)*12*(p.salaryMul||1)*(p.world?.careerMul||1)*lf*(1+careerBonus);
      const tax=gross*taxRate(gross);
      add(ledger,'salary','税后职业收入',gross-tax,`税前 ${L.fmtMoney(gross)} · 税费 ${L.fmtMoney(tax)}${careerBonus?` · 构筑加成 ${(careerBonus*100).toFixed(0)}%`:''}`);
    }

    // 生活成本由年龄、家庭结构、住房和健康决定，而不是随机抽一个数字。
    const student=p.tags?.includes('大学在读');
    let living=student?26000:age<25?40000:age<40?56000:age<60?66000:age<75?58000:50000;
    if(p.wealth>1000000)living+=12000;
    if(p.wealth>5000000)living+=26000;
    if(p.wealth>20000000)living+=50000;
    living+=Math.max(0,(p.children?.length||0))*15000;
    add(ledger,'living','生活与家庭支出',-living,`${student?'学生阶段':'当前年龄段'} · 子女 ${(p.children?.length||0)} 名`);

    const housing=p.tags?.includes('有房')?(age>=22?14000:0):(age>=22?30000:12000);
    if(housing)add(ledger,'housing',p.tags?.includes('有房')?'住房持有成本':'居住成本',-housing,p.tags?.includes('有房')?'物业、维修与固定支出':'房租与基础居住支出');

    let healthCost=age<45?2400:age<60?5000:age<75?9000:14000;
    healthCost+=Math.max(0,60-(p.stats.health||60))*350;
    add(ledger,'health','医疗与保障',-healthCost,`年龄 ${age} · 健康 ${p.stats.health}`);

    if(p.wealth<0){
      const debtBase=Math.abs(p.wealth),rate=.07+Math.max(0,(p.stats.risk||50)-60)*.0008;
      add(ledger,'debt','负债利息',-debtBase*rate,`负债余额 ${L.fmtMoney(-debtBase)} · 年化约 ${(rate*100).toFixed(1)}%`);
    }

    // 只有主动成为投资者后才有市场盈亏；仓位、年度行情、收益贡献全部展示。
    if(p.tags?.includes('投资者')&&!p.blockedInvestment&&p.wealth>30000){
      const exposure=clamp(.12,.68,.22+((p.stats.risk||50)-50)*.0048+(sm.extreme||0)*.12);
      const capital=Math.max(0,p.wealth)*exposure;
      const state=marketPick(p),delta=money(capital*state.r);
      add(ledger,'investment','投资账户盈亏',delta,`投入约 ${L.fmtMoney(capital)} · ${state.label} ${(state.r*100).toFixed(0)}% · 仓位 ${(exposure*100).toFixed(0)}%`);
    }

    ledger.closing=p.wealth;
    // 严格对账：净额必须等于 closing-opening。
    ledger.net=money(ledger.closing-ledger.opening);
    p._lastAutoCash=ledger.net;A._yearFinance=ledger;
    p.financeHistory=p.financeHistory||[];p.financeHistory.unshift(JSON.parse(JSON.stringify(ledger)));if(p.financeHistory.length>120)p.financeHistory.length=120;
    return ledger;
  };

  A.financeText=ledger=>{
    if(!ledger)return'本年尚未结算固定现金流';
    if(!ledger.items?.length)return ledger.note||'本年没有个人固定现金流';
    return ledger.items.map(x=>`${x.label}${x.amount>0?'+':''}${L.fmtMoney(x.amount)}`).join(' · ');
  };
})();