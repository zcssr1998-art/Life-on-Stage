const fs=require('fs');
const vm=require('vm');
const path=require('path');

global.window=global;
global.addEventListener=()=>{};
global.document={getElementById:()=>null,querySelector:()=>null};
global.navigator={};
global.location={href:'https://example.test/'};
global.confirm=()=>true;
class StorageMock{constructor(){this.m=new Map()}getItem(k){return this.m.has(k)?this.m.get(k):null}setItem(k,v){this.m.set(k,String(v))}removeItem(k){this.m.delete(k)}clear(){this.m.clear()}}
global.localStorage=new StorageMock();

const files=['v3-core.js','ev1.js','ev2.js','ev3.js','ev4.js','ev5.js','ev6.js','ev7.js','ev8.js','v4-data.js','v5-data.js','v5-engine.js','v5-patch.js','v5.2-hotfix.js','v5.3-hotfix.js','v5.4-data.js','v5.4-hotfix.js','v5.4-balance.js','v5.5-events.js','v5.5-engine.js'];
for(const f of files){const code=fs.readFileSync(path.join(process.cwd(),f),'utf8');vm.runInThisContext(code,{filename:f});}
const A=global.APP,L=global.LIFE;
A.render=()=>{};A.note=()=>{};

const quantile=(arr,q)=>{const a=[...arr].sort((x,y)=>x-y),i=Math.floor((a.length-1)*q);return a[i]};
function pickUnlocked(){const list=(A.year||[]).filter(a=>A.pass(a.requires||{}));if(!list.length)throw new Error(`No unlocked action at age ${A.p?.age}`);return list[Math.floor(Math.random()*list.length)];}
function clickOnce(){const before=A.p.age;const a=pickUnlocked();A.resolve(a);if(A.busy)throw new Error(`busy remained true after age ${before}`);if(A.p.alive&&A.p.age!==before+1)throw new Error(`age did not advance exactly once: ${before} -> ${A.p.age}`);if((A._yearStories||[]).length<1||(A._yearStories||[]).length>3)throw new Error(`annual story count out of range: ${(A._yearStories||[]).length}`);}
function fresh(){localStorage.removeItem(L.STORAGE_KEY);A.p=null;A.busy=false;A.newLife(A.draft());}

// 1) Trait pool contract from V5.4 remains intact.
if(L.TRAITS.length!==200)throw new Error(`trait pool should be 200, got ${L.TRAITS.length}`);
const rarityCounts={};for(const t of L.TRAITS)rarityCounts[t.rarity]=(rarityCounts[t.rarity]||0)+1;
if((rarityCounts.P||0)<8)throw new Error('prismatic pool unexpectedly small');
let prismHands=0,totalSlots=0,highSlots=0,bSlots=0;
for(let i=0;i<5000;i++){
  const d=A.draft();
  if(d.traits.length!==5||new Set(d.traits.map(x=>x.id)).size!==5)throw new Error('opening roll invalid');
  if(d.traits.some(x=>x.rarity==='P'))prismHands++;
  for(const t of d.traits){totalSlots++;if(['S','SS','SSS','P'].includes(t.rarity))highSlots++;if(t.rarity==='B')bSlots++;}
}
const prismRate=prismHands/5000,highRate=highSlots/totalSlots,bRate=bSlots/totalSlots;
if(prismRate<.035||prismRate>.065)throw new Error(`opening prismatic hand rate drifted: ${prismRate}`);
if(highRate<.48)throw new Error(`high-tier opening share too low: ${highRate}`);
if(bRate>.15)throw new Error(`low-tier opening share too high: ${bRate}`);

// 2) V5.5 attributes: 100 is no longer a cap; 200 is the rare hard ceiling.
fresh();
A.p.stats.health=137;A.clampStats(A.p);if(A.p.stats.health!==137)throw new Error('stat still clamped at 100');
A.p.stats.health=999;A.clampStats(A.p);if(A.p.stats.health!==200)throw new Error('200 point hard cap failed');
A.p.stats.intelligence=170;const scaled=A.scaledStatDelta('intelligence',12);if(scaled<1||scaled>4)throw new Error(`high-stat diminishing return failed: ${scaled}`);
if(A.statLevel(100)!=='厉害'||A.statLevel(150)!=='顶级'||A.statLevel(200)!=='封顶')throw new Error('stat level labels failed');

// 3) Flow: zhou is 5-of-15; regular years are 4-choice; each resolved year leaves 1-3 story events.
for(let i=0;i<120;i++){
  fresh();if(A.p.age!==1)throw new Error('fresh life did not start at age 1');
  if(A.year.length!==5)throw new Error(`zhou should show 5 choices, got ${A.year.length}`);
  const ids=A.year.map(x=>x.id);if(new Set(ids).size!==5)throw new Error('zhou choices are not unique');
  if(ids.some(id=>!String(id).startsWith('zhou15_')))throw new Error('zhou contains non-zhou action');
  clickOnce();if(A.p.alive&&A.p.age===2&&A.year.length!==4)throw new Error(`regular year should show 4 choices, got ${A.year.length}`);
}

// 4) Age semantic guard: child pools cannot leak adult careers; old-age pools cannot leak school-life choices.
fresh();A.p.age=8;A.buildYear();
const adultLeak=/创业|融资|房贷|结婚|离婚|退休|公司高管|管理层|重仓|杠杆/;
if(A.year.some(x=>adultLeak.test(`${x.title} ${x.desc}`)))throw new Error('adult event leaked into child pool');
fresh();A.p.age=78;A.p.graduationAge=null;A.buildYear();
const childLeak=/幼儿园|小学|班主任|同桌|校内|作业|家长会|零花钱|玩具|过家家|抓周|高考|中考|晚自习/;
if(A.year.some(x=>childLeak.test(`${x.title} ${x.desc}`)))throw new Error('child/school event leaked into old-age pool');

// 5) Narrative density: side incident library spans life stages and normal story text is no longer tiny.
if((L.MICRO_EVENTS||[]).length<45)throw new Error(`micro-event library too small: ${L.MICRO_EVENTS?.length}`);
for(const age of [6,10,16,22,38,58,72,84]){
  fresh();A.p.age=age;const e=A.pickMicroEvent();if(!e)throw new Error(`no micro event available at age ${age}`);
  if(String(e.text||'').length<20)throw new Error(`micro event too terse at age ${age}: ${e.id}`);
}

// 6) Natural full-game runs: 90+ must remain a minority after new side-event health effects.
const naturalAges=[];
for(let run=0;run<600;run++){
  fresh();let guard=0;while(A.p.alive&&guard++<125)clickOnce();
  if(guard>=125&&A.p.alive)throw new Error('natural run exceeded guard');
  naturalAges.push(A.p.age);
}
const naturalMedian=quantile(naturalAges,.5),natural90plus=naturalAges.filter(x=>x>=90).length/naturalAges.length,natural100plus=naturalAges.filter(x=>x>=100).length/naturalAges.length;
if(naturalMedian>84)throw new Error(`natural lifespan still too long: median ${naturalMedian}`);
if(natural90plus>.31)throw new Error(`too many natural lives reach 90+: ${natural90plus}`);
if(natural100plus>.08)throw new Error(`too many natural lives reach 100+: ${natural100plus}`);

// 7) Isolated mortality curve stays in target band.
const realDie=A.die,syntheticAges=[];
A.die=reason=>{A.p.alive=false;A.p.deathReason=reason};
for(let i=0;i<4000;i++){
  A.p={age:1,alive:true,traits:[],stats:{health:60,happiness:50,intelligence:50,social:50,luck:50,ambition:50,stability:50,discipline:50,risk:50,family:50},mortalityFactor:.75+Math.random()*.90};
  while(A.p.alive&&A.p.age<111){if(!A.deathCheck())A.p.age++}
  syntheticAges.push(A.p.age);
}
A.die=realDie;
const lifeMedian=quantile(syntheticAges,.5),life90=syntheticAges.filter(x=>x>=90).length/syntheticAges.length,life100=syntheticAges.filter(x=>x>=100).length/syntheticAges.length;
if(lifeMedian<70||lifeMedian>82)throw new Error(`mortality median out of target: ${lifeMedian}`);
if(life90<.04||life90>.22)throw new Error(`90+ mortality tail out of target: ${life90}`);
if(life100>.035)throw new Error(`100+ still too common: ${life100}`);

// 8) Wealth model remains nonlinear and ordinary work does not automatically become millions.
function economyPerson(investor=false){
  return {age:25,alive:true,wealth:20000,traits:[],tags:['上班族',...(investor?['投资者']:[])],blockedInvestment:!investor,career:'engineer',salaryMul:1,world:{careerMul:1},spouse:null,children:[],history:[],positive:0,negative:0,neutral:0,stats:{health:60,happiness:55,intelligence:60,social:50,luck:50,ambition:55,stability:60,discipline:60,risk:investor?62:50,family:55},economicVolatility:.78+Math.random()*.57,cashflowFactor:.45+Math.random()*.95};
}
const ordinary=[];for(let i=0;i<600;i++){A.p=economyPerson(false);for(let y=0;y<45;y++){A.autoIncome();A.p.age++}ordinary.push(A.p.wealth);}
const ordinaryMedian=quantile(ordinary,.5),ordinaryMillion=ordinary.filter(x=>x>=1000000).length/ordinary.length;
if(ordinaryMedian>1500000)throw new Error(`ordinary wealth still compounds too easily: median ${ordinaryMedian}`);
if(ordinaryMillion>.65)throw new Error(`too many ordinary careers auto-reach 1m: ${ordinaryMillion}`);
const investors=[];for(let i=0;i<600;i++){A.p=economyPerson(true);A.p.wealth=500000;for(let y=0;y<35;y++){A.autoIncome();A.p.age++}investors.push(A.p.wealth);}
const invSpread=quantile(investors,.9)-quantile(investors,.1);if(invSpread<500000)throw new Error(`investment outcomes are still too linear: p90-p10=${invSpread}`);

// 9) Ending commentary must be materially richer than the old one-line template and contain occasional commentary voice.
fresh();A.p.age=79;A.p.alive=false;A.p.deathReason='自然衰老';A.p.score=A.score();const ep=A.endingCommentary();
if(ep.length<5)throw new Error(`ending commentary too short: ${ep.length}`);
if(ep.join('').length<260)throw new Error('ending commentary prose still too terse');
if(!ep.some(x=>x.includes('旁白吐槽')))throw new Error('ending commentary lacks playful aside');

// 10) Endurance mode: thousands of cumulative clicks through 110+ must not busy-lock.
const realDeath=A.deathCheck;A.deathCheck=()=>false;
for(let run=0;run<35;run++){fresh();while(A.p.age<116)clickOnce();if(A.p.history.length>900)throw new Error(`history cap failed: ${A.p.history.length}`);}
A.deathCheck=realDeath;

// 11) Old-age freeze regression.
for(let i=0;i<140;i++){
  fresh();A.p.age=72+Math.floor(Math.random()*28);A.p.wealth=3000000;A.p.wealthPeak=3000000;A.p.career='expert';
  Object.keys(A.p.stats).forEach(k=>A.p.stats[k]=80);['上班族','技术专家'].forEach(t=>{if(!A.p.tags.includes(t))A.p.tags.push(t)});
  A.buildYear();const before=A.p.age;clickOnce();if(A.busy)throw new Error('old-age regression: busy lock');if(A.p.alive&&A.p.age!==before+1)throw new Error(`old-age regression: no advance ${before}->${A.p.age}`);
}

// 12) Death must commit even if normal ending renderer fails.
fresh();const oldRender=A.render;A.render=()=>{throw new Error('synthetic ending UI failure')};let deathThrew=false;
try{A.die('回归测试')}catch{deathThrew=true}
if(deathThrew)throw new Error('die propagated a renderer exception');if(A.p.alive)throw new Error('die did not commit dead state');A.render=oldRender;

console.log(`V5.5 smoke passed | traits=${L.TRAITS.length} | micro=${L.MICRO_EVENTS.length} | prism=${(prismRate*100).toFixed(2)}% | natural median=${naturalMedian}, 90+=${(natural90plus*100).toFixed(1)}%, 100+=${(natural100plus*100).toFixed(1)}% | synthetic median=${lifeMedian}, 90+=${(life90*100).toFixed(1)}% | ordinary wealth median=${Math.round(ordinaryMedian)} | investor spread=${Math.round(invSpread)}`);
