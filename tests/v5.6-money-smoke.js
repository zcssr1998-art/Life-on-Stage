const fs=require('fs');
const vm=require('vm');
const path=require('path');
global.window=global;global.addEventListener=()=>{};global.document={getElementById:()=>null,querySelector:()=>null};global.navigator={};global.location={href:'https://example.test/'};global.confirm=()=>true;
class StorageMock{constructor(){this.m=new Map()}getItem(k){return this.m.has(k)?this.m.get(k):null}setItem(k,v){this.m.set(k,String(v))}removeItem(k){this.m.delete(k)}}global.localStorage=new StorageMock();
const files=['v3-core.js','ev1.js','ev2.js','ev3.js','ev4.js','ev5.js','ev6.js','ev7.js','ev8.js','v4-data.js','v5-data.js','v5-engine.js','v5-patch.js','v5.2-hotfix.js','v5.3-hotfix.js','v5.4-data.js','v5.4-hotfix.js','v5.4-balance.js','v5.5-events.js','v5.5-engine.js','v5.6-money.js'];
for(const f of files)vm.runInThisContext(fs.readFileSync(path.join(process.cwd(),f),'utf8'),{filename:f});
const A=global.APP,L=global.LIFE;A.render=()=>{};A.note=()=>{};

function person({career='engineer',age=35,wealth=200000,investor=false,entrepreneur=false}={}){
  const tags=['上班族'];if(investor)tags.push('投资者');if(entrepreneur)tags.push('创业者');
  return {id:'t',age,alive:true,wealth,wealthPeak:wealth,minWealth:wealth,traits:[],tags,blockedInvestment:!investor,career,salaryMul:1,world:{id:'normal',careerMul:1},spouse:null,children:[],history:[],seen:{},positive:0,negative:0,neutral:0,rareEvents:0,careerTierPeak:2,score:0,stats:{health:65,happiness:60,intelligence:70,social:55,luck:50,ambition:60,stability:65,discipline:65,risk:investor?65:50,family:60}};
}

// 1) 非金钱选择绝不能再被 dynamicOutcome 偷塞随机现金。
A.p=person();
for(let i=0;i<1000;i++){
  const z=A.dynamicOutcome({desc:'陪家人散步',effects:{happiness:3,family:2},special:{},fixed:false});
  if(z.special&&Object.prototype.hasOwnProperty.call(z.special,'wealth'))throw new Error('non-money event injected wealth');
}

// 2) 明确的金钱事件可以改变金额，但必须来自事件本身。
for(let i=0;i<200;i++){
  const z=A.dynamicOutcome({desc:'出售旧设备',effects:{},special:{wealth:10000},fixed:false});
  if(!Number.isFinite(z.special.wealth)||z.special.wealth<=0||z.special.wealth>12000)throw new Error(`explicit money event mutated irrationally: ${z.special.wealth}`);
}

// 3) 工薪年度账本必须严格可对账，且没有“意外之财/命运重击”这种后台随机项。
for(let i=0;i<200;i++){
  A.p=person({career:'engineer',age:35+i%20,wealth:200000+i*1000});
  const before=A.p.wealth,l=A.autoIncome(),sum=l.items.reduce((s,x)=>s+x.amount,0),delta=A.p.wealth-before;
  if(sum!==l.net||delta!==l.net||l.closing-l.opening!==l.net)throw new Error(`ledger mismatch: sum=${sum} net=${l.net} delta=${delta}`);
  const keys=new Set(l.items.map(x=>x.key));
  for(const k of keys)if(!['salary','living','housing','health','debt','investment','business'].includes(k))throw new Error(`unaccounted ledger key ${k}`);
  if(l.items.some(x=>/意外|命运|随机/.test(x.label+x.note)))throw new Error('hidden random cash shock still exists');
  if(!l.items.some(x=>x.key==='salary')||!l.items.some(x=>x.key==='living'))throw new Error('salary/living source missing');
}

// 4) 投资者每年有明确的仓位、行情与盈亏来源，不能只让总资产自己跳。
for(let i=0;i<100;i++){
  A.p=person({career:'engineer',age:42,wealth:800000,investor:true});
  const l=A.autoIncome(),inv=l.items.find(x=>x.key==='investment');
  if(!inv)throw new Error('investor year missing investment ledger');
  if(!/投入约/.test(inv.note)||!/仓位/.test(inv.note))throw new Error(`investment reason incomplete: ${inv.note}`);
}

// 5) 创业者经营结果必须以“经营净现金流/经营亏损”进入账本。
for(let i=0;i<100;i++){
  A.p=person({career:'founder',age:38,wealth:300000,entrepreneur:true});
  const l=A.autoIncome(),biz=l.items.find(x=>x.key==='business');
  if(!biz)throw new Error('entrepreneur year missing business ledger');
  if(!/经营/.test(biz.label+biz.note))throw new Error('business source not explained');
}

// 6) 最近年度账本必须可追溯，而不是只保留顶部一个净数字。
A.p=person({career:'developer',age:30,wealth:120000});
for(let y=0;y<5;y++){A.autoIncome();A.p.age++;}
if(!Array.isArray(A.p.financeHistory)||A.p.financeHistory.length!==5)throw new Error('finance history not retained');
if(A.p.financeHistory.some(x=>!Number.isFinite(x.opening)||!Number.isFinite(x.closing)||!Array.isArray(x.items)))throw new Error('finance history malformed');

console.log(`V5.6 money smoke passed | ledger years=${A.p.financeHistory.length} | latest net=${A.p.financeHistory[0].net}`);