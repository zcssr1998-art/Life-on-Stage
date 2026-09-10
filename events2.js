events.push(...[
 {id:'startup',cat:'事业',min:23,max:45,w:6,cond:s=>(s.amb>60||s.tags.has('商业嗅觉'))&&!s.tags.has('创业者')&&s.money>30000,title:'一个创业机会摆在你面前',text:'朋友找你一起做一件可能很大的事，也可能只是烧掉几年青春。',choices:[
  ['辞职 All in','高风险，高上限',s=>{addTag(s,'创业者');let p=.16+s.int/500+s.social/500+s.luck/350+s.exp/600+s.world.startup+s.disc/900;if(chance(p)){let mult=2+R()*8;s.money*=mult;s.income*=2.5;s.amb+=12;addTag(s,'创业成功');return`公司活了下来，你的净资产扩大到 ${moneyFmt(s.money)}。`}s.money*=.35;s.health-=8;s.happy-=10;s.exp+=15;addTag(s,'创业失败');return'项目失败，但你获得了一段高密度经验。'}],
  ['兼职试水','降低爆发，也降低归零风险',s=>{let gain=chance(.46+s.disc/500)?s.money*(.1+R()*.5):-s.money*(.05+R()*.15);s.money+=gain;s.exp+=8;return gain>0?`副业跑通了，净赚 ${moneyFmt(gain)}。`:`项目没跑通，损失 ${moneyFmt(-gain)}。`}],
  ['拒绝','继续当前路线',s=>{s.stable+=4;return'你没有跳出当前轨道。'}]
 ]},
 {id:'secondStartup',cat:'事业',min:30,max:55,w:4,cond:s=>s.tags.has('创业失败')&&!s.tags.has('二次创业')&&s.money>40000,title:'曾经失败的创业者，又看到了一个窗口',text:'这次你更有经验，也更清楚失败具体有多疼。',choices:[
  ['再来一次','经验提高了胜率，但风险仍然存在',s=>{addTag(s,'二次创业');let p=.28+s.exp/450+s.int/600+s.luck/450+s.world.startup;if(chance(p)){s.money*=2.5+R()*5;s.income=Math.max(s.income,18000)*1.8;s.happy+=9;addTag(s,'二次创业成功');return'第二次你没有重犯第一次的错误，项目跑通了。'}s.money*=.55;s.happy-=7;s.health-=4;return'你又失败了一次，但损失控制得比上次更小。'}],
  ['不再创业','把失败经验转化成职业价值',s=>{s.income*=1.15;s.stable+=8;s.exp+=5;return'你决定不再用自己的资产承担公司风险。'}]
 ]},
 {id:'careerBreak',cat:'职业',min:28,max:58,w:6,cond:s=>s.tags.has('已工作'),title:'职业跃迁窗口',text:'更高的位置意味着更多钱、更多权力，也意味着更多消耗。',choices:[
  ['争取晋升','提高收入与压力',s=>{let ok=chance(.4+s.int/450+s.social/350+s.exp/500+s.disc/700);if(ok){s.income*=1.35;s.health-=5;s.amb+=4;s.exp+=8;addTag(s,'管理层');return'你成功上了一个台阶。'}s.happy-=5;s.exp+=4;return'这次没有轮到你。'}],
  ['保持舒服','收入增速慢一点',s=>{s.health+=3;s.happy+=5;s.stable+=4;return'你主动放弃了一部分上升空间。'}]
 ]},
 {id:'layoff',cat:'职业',min:27,max:55,w:5,repeat:true,cond:s=>s.tags.has('已工作')&&!s.tags.has('体制内'),title:'行业进入下行周期',text:'公司开始裁员，你的部门也不能幸免。',choices:[
  ['抢先跳槽','利用信息差换平台',s=>{let ok=chance(.5+s.social/300+s.exp/500-s.world.layoff);if(ok){s.income*=1.12;s.exp+=5;return'你提前离场，还拿到了一点涨薪。'}s.income*=.8;s.happy-=5;return'新工作不如预期，但至少没有失业太久。'}],
  ['等补偿','赌公司给一个体面的离场方案',s=>{if(chance(.58)){let sever=s.income*(3+Math.floor(R()*8));s.money+=sever;s.income=0;s.tags.delete('已工作');addTag(s,'待业');return`你拿到 ${moneyFmt(sever)} 补偿，进入待业。`}s.happy-=8;return'你留下来，但组织状态越来越差。'}]
 ]},
 {id:'reboot',cat:'职业',min:25,max:52,w:8,cond:s=>s.tags.has('待业'),title:'你站在人生转轨点',text:'继续找相似工作最容易，但你开始怀疑那是否值得。',choices:[
  ['转行','短期收入受损，长期获得新可能',s=>{s.tags.delete('待业');addTag(s,'已工作');addTag(s,'转行');s.job=pick(jobs);s.income=(5000+s.int*25+s.exp*15)*s.world.income;s.amb+=8;s.happy+=4;s.exp+=5;return`你转入了${s.job}。`}],
  ['继续老本行','恢复更快，轨道延续',s=>{s.tags.delete('待业');addTag(s,'已工作');s.income=(7000+s.exp*40)*s.world.income;s.stable+=5;return'你重新回到了熟悉的行业。'}],
  ['休息一年','用储蓄换时间',s=>{s.money-=Math.max(30000,s.income*8);s.health+=8;s.happy+=9;s.exp+=3;s.disc-=3;return'你第一次认真过了一段没有 KPI 的生活。'}]
 ]},
 {id:'sideProject',cat:'事业',min:22,max:46,w:5,cond:s=>(s.tags.has('已工作')||s.tags.has('自由职业'))&&!s.tags.has('副业跑通'),title:'一个副业开始有一点收入',text:'它还不足以辞职，但第一次证明你不只有一条收入曲线。',choices:[
  ['继续做大','牺牲休息换第二收入',s=>{s.health-=4;s.happy-=2;s.exp+=6;if(chance(.35+s.disc/300+s.luck/500)){s.income*=1.25;s.money+=20000+R()*50000;addTag(s,'副业跑通');return'副业开始形成稳定现金流。'}return'增长比想象中慢，但你积累了经验。'}],
  ['保持小而美','不让它吞掉生活',s=>{s.money+=5000+R()*15000;s.happy+=3;s.stable+=2;return'它成为了一笔不大的补充收入。'}]
 ]},
 {id:'windfall',cat:'财富',min:18,max:75,w:2,repeat:true,title:'意外之财',text:'一个你没预料到的钱包突然变厚了。',choices:[
  ['收下这份运气','命运偶尔就是不讲逻辑',s=>{let g=5000+R()*Math.max(20000,s.money*.35);s.money+=g;s.luck+=2;return`你意外获得 ${moneyFmt(g)}。`}]
 ]},
 {id:'scam',cat:'财富',min:20,max:70,w:3,cond:s=>s.money>30000,title:'有人向你推荐一个“几乎稳赚”的机会',text:'高收益、低风险、窗口很短——这些词组合在一起通常不是好信号。',choices:[
  ['试一把','贪婪和轻信会共同提高代价',s=>{let base=s.money*(.08+R()*.3);if(chance(.15+s.int/700)){s.money+=base*.5;return`你幸运退出，赚了 ${moneyFmt(base*.5)}。`}s.money-=base;s.happy-=6;addTag(s,'被骗经历');return`你损失 ${moneyFmt(base)}，终于知道“稳赚”意味着什么。`}],
  ['拒绝','没有收益，也没有损失',s=>{s.disc+=4;s.stable+=3;return'你没有把“不理解”包装成“机会”。'}]
 ]},
 {id:'property',cat:'资产',min:25,max:58,w:6,cond:s=>s.money>250000&&!s.tags.has('有房'),title:'买房机会出现了',text:'房子既是资产，也是把未来现金流提前绑定。',choices:[
  ['买','稳定提高，流动资金大幅下降',s=>{let down=Math.min(s.money*.55,600000);s.money-=down;addTag(s,'有房');s.stable+=14;s.family+=4;return`你拿出 ${moneyFmt(down)} 作为首付和费用。`}],
  ['继续租','保持流动性',s=>{s.stable-=2;s.amb+=3;return'你选择让资产保持更灵活。'}]
 ]},
 {id:'propertyCycle',cat:'资产',min:32,max:72,w:3,repeat:true,cond:s=>s.tags.has('有房'),title:'房地产进入明显的周期拐点',text:'你家的大额资产价格开始出现一轮明显变化。',choices:[
  ['继续持有','不因为短期价格改变居住决策',s=>{if(chance(.5+s.world.market)){let g=50000+R()*250000;s.wealthPeak+=g;return`账面价值上涨约 ${moneyFmt(g)}。`}s.happy-=2;return'账面价格回落，但你的生活没有变化。'}],
  ['卖掉变现','把不动产换回流动性',s=>{let g=150000+R()*500000;s.money+=g;s.tags.delete('有房');s.stable-=6;s.risk+=4;return`你卖出房产，释放约 ${moneyFmt(g)} 流动资金。`}]
 ]},
 {id:'illness',cat:'健康',min:30,max:78,w:5,repeat:true,title:'身体开始发出警告',text:'过去几年积累的生活方式，开始收利息。',choices:[
  ['认真处理','花钱和时间换健康',s=>{let cost=10000+R()*50000;s.money-=cost;s.health+=9;s.happy-=2;s.disc+=3;return`你花了 ${moneyFmt(cost)} 调整和治疗。`}],
  ['继续硬扛','短期省事，长期风险上升',s=>{s.health-=12;s.income*=1.03;addTag(s,'健康透支');return'你继续工作，代价暂时还没有完全显现。'}]
 ]},
 {id:'majorIllness',cat:'健康',min:42,max:85,w:2,cond:s=>s.health<55&&!s.tags.has('重大疾病史'),title:'一次真正的大病打断了原有节奏',text:'很多长期计划会在健康问题面前突然失去优先级。',choices:[
  ['全力治疗','显著消耗财富，但提高恢复概率',s=>{let cost=Math.min(Math.max(80000,s.money*.18),400000);s.money-=cost;addTag(s,'重大疾病史');if(chance(.68+s.health/300)){s.health+=16;s.happy-=4;return`你花费 ${moneyFmt(cost)}，最终恢复得不错。`}s.health-=12;return`你花费 ${moneyFmt(cost)}，但身体仍留下明显影响。`}],
  ['保守处理','降低开支，但承担更高后续风险',s=>{s.money-=30000;s.health-=15;addTag(s,'重大疾病史');addTag(s,'慢性病');return'病情被控制，但它成为了长期变量。'}]
 ]},
 {id:'fitness',cat:'健康',min:22,max:60,w:4,cond:s=>s.health<72&&!s.tags.has('运动习惯'),title:'你意识到体能正在下降',text:'这是少数能通过长期小投入改变几十年结果的变量。',choices:[
  ['开始规律运动','慢，但复利很长',s=>{s.health+=12;s.disc+=7;s.happy+=4;addTag(s,'运动习惯');return'运动逐渐成为固定习惯。'}],
  ['以后再说','今天什么都不用改变',s=>{s.health-=3;s.disc-=2;return'你把这件事继续往后推。'}]
 ]},
 {id:'parent',cat:'家庭',min:35,max:68,w:5,title:'父母开始明显变老',text:'你第一次真正意识到，上一代人的时间已经比想象中少。',choices:[
  ['投入更多时间','事业速度下降，但关系更完整',s=>{s.income*=.96;s.happy+=6;s.social+=3;s.family+=10;addTag(s,'照顾父母');return'你重新安排了生活优先级。'}],
  ['继续冲事业','把资源集中在自己的关键窗口',s=>{s.amb+=5;s.happy-=4;s.family-=8;return'你没有停下脚步。'}]
 ]}
]);