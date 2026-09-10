const events=[];
events.push(...[
 {id:'collegeDebt',cat:'教育',min:18,max:24,w:5,cond:s=>s.edu>0&&!s.tags.has('教育负债'),title:'更好的教育需要一笔现实成本',text:'继续深造有可能提高上限，也可能只是把压力推迟几年。',choices:[
  ['继续读','用钱和时间换学历与认知',s=>{s.money-=60000;s.edu+=1;s.int+=5;s.disc+=4;addTag(s,'教育负债');return'你选择继续深造。'}],
  ['及时就业','更早积累现金流和经验',s=>{s.exp+=6;s.amb+=3;return'你决定先进入社会。'}]
 ]},
 {id:'firstjob',cat:'职业',min:18,max:25,w:10,cond:s=>!s.tags.has('已工作')&&!s.tags.has('自由职业'),title:'第一份正式工作',text:'它可能只是起点，也可能把你放进一个轨道很多年。',choices:[
  ['选稳定平台','工资一般，但履历更稳',s=>{addTag(s,'已工作');s.job=pick(jobs);s.income=(4500+s.edu*1800+s.int*20)*s.world.income;s.stable+=8;s.exp+=3;return`你成为了${s.job}。`}],
  ['选高压高薪','收入提高，但幸福和健康承压',s=>{addTag(s,'已工作');s.job=weighted([['销售',3],['程序员',3],['金融从业者',2],['产品经理',2],['游戏开发者',2],['工程师',2]]);s.income=(7000+s.edu*2200+s.int*28)*s.world.income;s.health-=5;s.amb+=5;s.risk+=4;return`你进入高压行业：${s.job}。`}],
  ['先自由职业','波动更大，上限也更开放',s=>{addTag(s,'自由职业');s.job='自由职业者';s.income=(2500+s.int*25+s.social*18)*s.world.income;s.luck+=3;s.stable-=7;s.risk+=5;return'你没有立刻进入标准职场。'}]
 ]},
 {id:'cert',cat:'成长',min:20,max:34,w:6,cond:s=>s.tags.has('已工作')||s.tags.has('自由职业'),title:'你发现技能开始决定收入差距',text:'同样工作几年，有人只积累工龄，有人积累可迁移能力。',choices:[
  ['系统学习一年','短期辛苦，长期提高职业弹性',s=>{s.money-=12000;s.happy-=4;s.int+=5;s.disc+=8;s.exp+=6;addTag(s,'持续学习');return'你建立了一项真正能带走的技能。'}],
  ['工作已经够累了','把时间留给生活',s=>{s.happy+=5;s.health+=2;return'你没有给自己再加一门课。'}]
 ]},
 {id:'love',cat:'关系',min:18,max:40,w:8,cond:s=>!s.tags.has('恋爱中')&&!s.tags.has('已婚'),title:'你遇到了一个很合拍的人',text:'这段关系看起来值得认真对待。',choices:[
  ['认真开始','关系可能成为长期支点',s=>{addTag(s,'恋爱中');s.happy+=10;s.money-=3000;s.social+=4;s.family+=6;return'你们开始交往。'}],
  ['保持距离','把精力继续留给自己',s=>{s.amb+=3;s.happy-=2;return'你错过了这段可能性。'}]
 ]},
 {id:'marry',cat:'关系',min:24,max:40,w:6,cond:s=>s.tags.has('恋爱中')&&!s.tags.has('已婚'),title:'你们开始讨论婚姻',text:'浪漫之外，现实问题全部摆到了桌面上。',choices:[
  ['结婚','稳定感提高，但支出和责任增加',s=>{s.tags.delete('恋爱中');addTag(s,'已婚');s.happy+=8;s.money-=60000;s.stable+=10;s.family+=12;return'你进入婚姻。'}],
  ['暂缓','保留关系，但不立刻绑定人生',s=>{s.happy-=3;s.stable-=2;return'你们决定再等等。'}],
  ['分开','结束关系，重新开始',s=>{s.tags.delete('恋爱中');s.happy-=12;s.amb+=4;s.family-=8;addTag(s,'分手经历');return'你们最终没走下去。'}]
 ]},
 {id:'marriageCrisis',cat:'关系',min:30,max:58,w:4,cond:s=>s.tags.has('已婚')&&s.family<58,title:'婚姻进入一段明显的低谷',text:'工作、钱、孩子和情绪把曾经简单的关系变复杂了。',choices:[
  ['认真修复','需要时间和妥协',s=>{s.money-=10000;s.family+=16;s.happy+=5;s.social+=2;return'你们重新开始谈真正的问题。'}],
  ['各过各的','短期避免冲突，关系继续降温',s=>{s.family-=12;s.happy-=6;addTag(s,'婚姻冷却');return'你们还在一起，但距离更远了。'}],
  ['结束婚姻','一次昂贵而彻底的重启',s=>{s.tags.delete('已婚');s.tags.delete('恋爱中');s.money*=.72;s.family-=10;s.happy-=10;s.stable-=10;addTag(s,'离婚经历');return'你们最终分开。'}]
 ]},
 {id:'child',cat:'家庭',min:26,max:44,w:5,cond:s=>s.tags.has('已婚')&&!s.tags.has('有孩子'),title:'家庭迎来一个新成员',text:'你的时间、钱和人生优先级都会重新排序。',choices:[
  ['迎接孩子','责任增加，但家庭结构更完整',s=>{addTag(s,'有孩子');s.money-=50000;s.happy+=9;s.stable+=8;s.amb-=3;s.family+=10;return'你成为了父母。'}],
  ['暂时不要','把资源继续留给当前生活',s=>{s.stable-=2;s.amb+=2;return'你们决定延后。'}]
 ]},
 {id:'childEducation',cat:'家庭',min:35,max:55,w:4,cond:s=>s.tags.has('有孩子'),title:'孩子的教育开始消耗大量资源',text:'你必须在钱、时间和自己的生活之间做重新分配。',choices:[
  ['大投入','牺牲现金流换教育资源',s=>{s.money-=Math.max(30000,s.income*4);s.family+=8;s.happy-=2;return'你把家庭资源明显向下一代倾斜。'}],
  ['量力而行','不给整个家庭过度加杠杆',s=>{s.stable+=5;s.family+=3;return'你选择可持续的投入。'}]
 ]},
 {id:'invest',cat:'财富',min:20,max:55,w:8,cond:s=>s.money>15000&&!s.tags.has('投资者'),title:'你第一次认真接触投资',text:'你意识到钱除了被花掉，还可以承担风险去换取未来。',choices:[
  ['小额学习','先交学费，不上杠杆',s=>{addTag(s,'投资者');s.money-=5000;s.investSkill+=10;s.amb+=2;s.risk+=3;return'你开始建立自己的投资框架。'}],
  ['重仓下注','收益和代价都会被放大',s=>{addTag(s,'投资者');addTag(s,'高风险偏好');s.risk+=14;let p=.34+s.luck/400+s.int/500+s.world.market;if(chance(p)){let gain=s.money*(.4+R()*1.4);s.money+=gain;s.investSkill+=12;s.amb+=8;return`这次押中了，你赚了 ${moneyFmt(gain)}。`}let loss=s.money*(.25+R()*.45);s.money-=loss;s.happy-=9;s.investSkill+=7;return`市场反杀，你亏掉 ${moneyFmt(loss)}。`}],
  ['完全不碰','财富路径更稳定，也更线性',s=>{s.stable+=6;s.risk-=5;addTag(s,'保守理财');return'你决定主要靠工作和储蓄。'}]
 ]},
 {id:'marketBoom',cat:'财富',min:24,max:70,w:4,repeat:true,cond:s=>s.tags.has('投资者'),title:'一轮疯狂牛市来了',text:'身边的人都开始赚钱，风险看起来像是不存在。',choices:[
  ['提高仓位','顺风时最容易把自己当成天才',s=>{let edge=.48+s.investSkill/300+s.luck/500+s.world.market;let base=Math.max(10000,s.money*.35);if(chance(edge)){let g=base*(.3+R()*1.2);s.money+=g;s.investSkill+=5;s.risk+=4;return`你吃到了行情，赚了 ${moneyFmt(g)}。`}let l=base*(.2+R()*.8);s.money-=l;s.happy-=7;return`你追在高位，回吐 ${moneyFmt(l)}。`}],
  ['维持纪律','少赚一点，避免情绪接管系统',s=>{let g=Math.max(3000,s.money*(.03+R()*.12));s.money+=g;s.investSkill+=3;s.disc+=3;return`你赚了 ${moneyFmt(g)}，但没有改变规则。`}]
 ]},
 {id:'marketCrash',cat:'财富',min:26,max:72,w:3,repeat:true,cond:s=>s.tags.has('投资者')&&s.money>30000,title:'市场突然进入深度回撤',text:'过去几年的收益在几个月里快速蒸发，所有人的风险偏好都被重新定价。',choices:[
  ['死扛并加仓','高风险，但可能获得周期反转收益',s=>{let exposure=.2+s.risk/130;if(chance(.42+s.investSkill/350+s.luck/600)){let g=s.money*(.18+R()*.55);s.money+=g;s.investSkill+=8;return`你扛过了回撤并等到反转，净增 ${moneyFmt(g)}。`}let l=s.money*Math.min(.65,exposure*(.25+R()*.45));s.money-=l;s.happy-=10;s.health-=3;return`下跌比你想得更久，你又损失了 ${moneyFmt(l)}。`}],
  ['主动降风险','承认不确定性，先保护本金',s=>{let l=s.money*(.04+R()*.12);s.money-=l;s.disc+=5;s.risk-=5;return`你止损/降仓，确认损失 ${moneyFmt(l)}，但保住了大部分本金。`}]
 ]},
 {id:'leverage',cat:'财富',min:24,max:55,w:3,cond:s=>s.tags.has('投资者')&&s.risk>68&&s.money>80000&&!s.tags.has('杠杆教训'),title:'你开始考虑使用杠杆',text:'它可以缩短时间，也可以缩短你留在牌桌上的时间。',choices:[
  ['加杠杆','把波动放大',s=>{let p=.43+s.investSkill/450+s.luck/650;if(chance(p)){let g=s.money*(.5+R()*1.5);s.money+=g;s.amb+=6;addTag(s,'杠杆幸存者');return`行情站在你这边，你赚了 ${moneyFmt(g)}。`}let l=s.money*(.45+R()*.5);s.money-=l;s.happy-=15;s.risk-=8;addTag(s,'杠杆教训');return`一次反向波动重创账户，你亏掉 ${moneyFmt(l)}。`}],
  ['拒绝杠杆','接受慢一点',s=>{s.disc+=8;s.stable+=5;return'你决定只承担自己能睡得着的风险。'}]
 ]}
]);