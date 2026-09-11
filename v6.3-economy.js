(() => {
  const A=window.APP,L=window.LIFE;if(!A||!L)return;
  L.VERSION='V6.3';
  const clamp=(a,b,v)=>Math.max(a,Math.min(b,v));
  const money=n=>Math.round(Number(n)||0);
  const taxRate=g=>g<=120000?.04:g<=240000?.08:g<=500000?.13:g<=1000000?.19:.24;
  const add=(ledger,key,label,amount,note='')=>{amount=money(amount);if(!amount)return;ledger.items.push({key,label,amount,note});ledger.net+=amount;A.p.wealth+=amount;};
  const laborFactor=(age,entrepreneur)=>{
    if(entrepreneur)return age<63?1:age<70?.72:age<76?.34:.08;
    return age<60?1:age<65?.88:age<70?.52:age<73?.24:0;
  };
  const marketPick=p=>{
    const tm=A.traitMods?.()||{},sm=A.synergyMods?.()||{},world=p.world?.id||'normal';
    const states=[
      {r:-.42,w:.035,label:'市场重挫'},{r:-.22,w:.085,label:'明显回撤'},{r:-.09,w:.15,label:'小幅下跌'},
      {r:.01,w:.21,label:'基本横盘'},{r:.075,w:.24,label:'普通上涨'},{r:.15,w:.16,label:'表现不错'},
      {r:.26,w:.085,label:'强势行情'},{r:.46,w:.03,label:'大牛市'},{r:.78,w:.005,label:'极端牛市'}
    ];
    const luck=clamp(-.18,.28,(p.stats.luck-50)*.0027+(tm.wealthOutcome||0)*.20+(tm.badGuard||0)*.07);
    return A.weightPick(states.map(x=>{let w=x.w;if(world==='boom'&&x.r>0)w*=1.16;if(world==='slow'&&x.r>0)w*=.90;if(world==='volatile'&&Math.abs(x.r)>=.22)w*=1.28;if(x.r>0)w*=1+Math.max(-.14,luck)+(sm.success||0)*.07;else w*=Math.max(.58,1-luck*.65);return{...x,_w:w};}));
  };
  const businessPick=p=>{
    const edge=clamp(-.12,.32,(p.stats.discipline-50)*.002+(p.stats.luck-50)*.0014+((A.traitMods?.().success)||0)*.11);
    const states=[{r:-.34,w:.08,label:'经营踩坑'},{r:-.14,w:.16,label:'经营亏损'},{r:-.03,w:.19,label:'勉强维持'},{r:.10,w:.31,label:'正常盈利'},{r:.26,w:.18,label:'业务增长'},{r:.52,w:.07,label:'产品跑通'},{r:.92,w:.01,label:'爆发式增长'}];
    return A.weightPick(states.map(x=>({...x,_w:x.w*(x.r>0?1+edge:Math.max(.64,1-edge*.65))})));
  };
  A.v63DependentChildren=()=>{
    const p=A.p;if(!p)return[];
    return (p.children||[]).filter(c=>{
      const age=Math.max(0,p.age-(c.birthAge??p.age));
      return age<=22;
    });
  };
  A.v63LivingPartner=()=>{
    const p=A.p,s=p?.spouse;if(!s)return null;
    const rel=(p.relationships||[]).find(x=>x.id===s.relId||x.id===s.id);
    if(rel&&rel.alive===false)return null;
    if(s.alive===false)return null;
    return s;
  };

  // V6.3 财富原则：
  // 1) 子女成年后不再永久计入抚养支出；2) 退休后存在养老金；3) 伴侣收入真正进入家庭现金流；
  // 4) 债务利息只对“年初已经存在的债务”计息，避免本年生活费刚发生就被立刻复利。
  A.autoIncome=()=>{
    const p=A.p,j=A.job(p.career,p),opening=p.wealth,age=p.age;
    const ledger={age,opening,items:[],net:0,closing:opening};
    p.financeHistory=p.financeHistory||[];
    if(age<18){
      ledger.note='未成年阶段由家庭承担主要生活成本，本年不结算个人固定现金流。';
      p._lastAutoCash=0;A._yearFinance=ledger;p.financeHistory.unshift(JSON.parse(JSON.stringify(ledger)));if(p.financeHistory.length>120)p.financeHistory.length=120;return ledger;
    }

    const entrepreneur=p.tags?.includes('创业者')||p.tags?.includes('创业成功')||p.careerRoute==='entrepreneur';
    const lf=laborFactor(age,entrepreneur),tm=A.traitMods?.()||{},sm=A.synergyMods?.()||{};
    let earned=0,pension=0,partnerContribution=0;

    if(entrepreneur&&lf>0){
      const base=Math.max(80000,(Number(j.salary)||14000)*12*(p.salaryMul||1)*(p.world?.careerMul||1)*lf);
      const state=businessPick(p),op=money(base*state.r);add(ledger,'business',state.r>=0?'经营净现金流':'经营亏损',op,`${state.label} · 经营基数 ${L.fmtMoney(base)}`);earned+=Math.max(0,op);
    }else if(Number(j.salary)>0&&lf>0){
      const careerBonus=clamp(-.08,.50,(sm.income||0)+(tm.income||0));
      const gross=(Number(j.salary)||0)*12*(p.salaryMul||1)*(p.world?.careerMul||1)*lf*(1+careerBonus);
      const net=gross*(1-taxRate(gross));add(ledger,'salary','税后职业收入',net,`税前 ${L.fmtMoney(gross)} · 当前劳动强度 ${(lf*100).toFixed(0)}%`);earned+=net;
    }

    const currentMonthly=Math.max(0,(Number(j.salary)||0)*(p.salaryMul||1)*(p.world?.careerMul||1));
    if(age<70&&currentMonthly>0)p.v63PensionSalaryPeak=Math.max(p.v63PensionSalaryPeak||0,currentMonthly);
    if(!entrepreneur&&age>=65&&(p.v63PensionSalaryPeak||currentMonthly)>0){
      const base=Math.max(p.v63PensionSalaryPeak||0,currentMonthly),level=clamp(1,5,p.careerLevel||j.tier||1);
      const replacement=.27+level*.032;
      pension=base*12*replacement*(age<70&&lf>0?.62:1);
      add(ledger,'pension','退休保障收入',pension,`按职业生涯收入峰值与职业阶位折算 · 替代率约 ${(replacement*100).toFixed(0)}%`);
    }

    const partner=A.v63LivingPartner();
    if(partner){
      const partnerAge=A.v62SpouseAge?.()??age,spouseJob=A.v62SpouseJob?.();
      if(spouseJob?.salary>0&&partnerAge<74){
        const work=partnerAge<62?1:partnerAge<67?.72:partnerAge<71?.35:.12;
        const gross=spouseJob.salary*12*work,net=gross*(1-taxRate(gross));
        const share=p.tags?.includes('已婚')?.36:.27;
        partnerContribution=net*share;
        add(ledger,'partner','伴侣共同承担',partnerContribution,`${partner.name||'伴侣'} · ${spouseJob.name} · 家庭可支配收入分担`);
      }else if(spouseJob?.salary>0&&partnerAge>=64){
        partnerContribution=spouseJob.salary*12*.16;
        add(ledger,'partner_pension','伴侣退休分担',partnerContribution,`${partner.name||'伴侣'} 的退休保障与家庭分担`);
      }
    }

    const dependents=A.v63DependentChildren();
    const householdIncome=Math.max(0,earned+pension+partnerContribution);
    const student=p.tags?.includes('大学在读');
    let living=student?22000:age<25?32000:age<40?48000:age<60?58000:age<75?50000:44000;
    if(householdIncome<80000&&p.wealth<250000)living*=.82;
    if(p.wealth>1500000)living+=10000;if(p.wealth>6000000)living+=22000;if(p.wealth>25000000)living+=42000;
    living+=dependents.length*12000;
    add(ledger,'living','生活与家庭支出',-living,`${student?'学生阶段':'当前年龄段'} · 未独立子女 ${dependents.length} 名`);

    const hasHouse=p.tags?.includes('有房');
    const housing=hasHouse?(age>=22?12000:0):(age<22?10000:age<25?14000:partner?21000:26000);
    if(housing)add(ledger,'housing',hasHouse?'住房持有成本':'居住成本',-housing,hasHouse?'物业、维修与固定支出':partner?'共同居住后的个人分摊':'房租与基础居住支出');

    let healthCost=age<45?2200:age<60?4500:age<75?8000:12500;
    healthCost+=Math.max(0,58-(p.stats.health||58))*280;
    add(ledger,'health','医疗与保障',-healthCost,`年龄 ${age} · 健康状态影响保障支出`);

    const debtBase=Math.max(0,-opening);
    if(debtBase>0){
      const rate=clamp(.045,.078,.048+Math.max(0,(p.stats.risk||50)-55)*.00035);
      const cap=Math.max(14000,householdIncome*.26);
      const interest=Math.min(debtBase*rate,cap);
      add(ledger,'debt','负债利息',-interest,`仅按年初负债 ${L.fmtMoney(-debtBase)} 计息 · 年化约 ${(rate*100).toFixed(1)}%`);
    }

    if(p.tags?.includes('投资者')&&!p.blockedInvestment&&p.wealth>50000){
      const exposure=clamp(.10,.62,.20+((p.stats.risk||50)-50)*.0042+(sm.extreme||0)*.10);
      const capital=Math.max(0,p.wealth)*exposure,state=marketPick(p),delta=money(capital*state.r);
      add(ledger,'investment','投资账户盈亏',delta,`投入约 ${L.fmtMoney(capital)} · ${state.label} ${(state.r*100).toFixed(0)}% · 仓位 ${(exposure*100).toFixed(0)}%`);
    }

    ledger.closing=p.wealth;ledger.net=money(ledger.closing-ledger.opening);p._lastAutoCash=ledger.net;A._yearFinance=ledger;
    p.financeHistory.unshift(JSON.parse(JSON.stringify(ledger)));if(p.financeHistory.length>120)p.financeHistory.length=120;
    return ledger;
  };
})();