const fs=require('fs'),vm=require('vm'),path=require('path');
global.window=global;global.addEventListener=()=>{};
global.document={getElementById:()=>null,querySelector:()=>null,querySelectorAll:()=>[]};global.navigator={};global.location={href:'https://example.test/'};global.confirm=()=>true;
class StorageMock{constructor(){this.m=new Map()}getItem(k){return this.m.has(k)?this.m.get(k):null}setItem(k,v){this.m.set(k,String(v))}removeItem(k){this.m.delete(k)}}global.localStorage=new StorageMock();
const files=['v3-core.js','ev1.js','ev2.js','ev3.js','ev4.js','ev5.js','ev6.js','ev7.js','ev8.js','v4-data.js','v5-data.js','v5-engine.js','v5-patch.js','v5.2-hotfix.js','v5.3-hotfix.js','v5.4-data.js','v5.4-hotfix.js','v5.4-balance.js','v5.5-events.js','v5.5-engine.js','v5.6-money.js','v6-fate.js'];
for(const f of files)vm.runInThisContext(fs.readFileSync(path.join(process.cwd(),f),'utf8'),{filename:f});
const A=global.APP,L=global.LIFE;A.render=()=>{};A.note=()=>{};
const fresh=()=>{localStorage.removeItem(L.STORAGE_KEY);A.p=null;A.busy=false;A.newLife(A.draft());};
const pick=()=>{const xs=(A.year||[]).filter(x=>A.pass(x.requires||{}));if(!xs.length)throw new Error(`no action at ${A.p.age}`);return xs[0]};

// 1) Every life gets a persistent fate model and a bounded world state.
fresh();
if(!A.p.fate||!A.p.fate.world)throw new Error('fate/world state not initialized');
for(const k of ['economy','jobs','tech','market','medicine','conflict','housing'])if(A.p.fate.world[k]<5||A.p.fate.world[k]>95)throw new Error(`world state out of range: ${k}`);
if(!Number.isFinite(A.p.world.careerMul))throw new Error('world career multiplier missing');

// 2) A resolved choice must create a causal node and the graph must stay bounded.
let before=A.p.fate.nodes.length,age=A.p.age;A.resolve(pick());
if(A.p.alive&&A.p.age!==age+1)throw new Error('V6 resolve broke annual advance');
if(A.p.fate.nodes.length<=before)throw new Error('choice did not create causal node');
if(!A.p.fate.lastMajorNode)throw new Error('last major causal node missing');

// 3) Forced delayed consequence: old choice must visibly echo years later and cite its source.
fresh();
const src=A.v6AddNode({title:'年轻时拼命加班',kind:'choice',category:'职业',major:true});
A.v6Schedule({dueAge:A.p.age,title:'旧透支回来收利息',text:'测试延迟因果。',effects:{health:-7},tone:'bad',sourceId:src.id});
const h0=A.p.stats.health;A._annualCapture=false;const due=A.v6ResolveDue();
if(due.length!==1)throw new Error('delayed consequence did not resolve');
if(A.p.stats.health>=h0)throw new Error('delayed consequence did not apply effect');
if(!String(due[0].text).includes('可以追溯到'))throw new Error('delayed consequence lost causal explanation');
if(!A.p.fate.echoes.length)throw new Error('echo history missing');

// 4) Counterfactual checkpoint restores the same past and the same original choice set.
fresh();A.p.age=28;A.buildYear();
const forced={...pick(),fixed:true,title:'28岁关键岔路'};A.year=[forced,...A.year.filter(x=>x.id!==forced.id)].slice(0,4);
const savedAge=A.p.age;const f=A.v6SaveFork(forced);if(!f)throw new Error('counterfactual checkpoint not saved');
const originalIds=f.year.map(x=>x.id).join('|');A.p.age=40;A.p.wealth+=999999;A.p.alive=false;
if(!A.v6RewindFork(f.id))throw new Error('counterfactual rewind failed');
if(A.p.age!==savedAge||!A.p.alive)throw new Error('counterfactual did not restore past state');
if(A.year.map(x=>x.id).join('|')!==originalIds)throw new Error('counterfactual did not restore original choices');
if((A.p.fate.branch||1)<2)throw new Error('branch counter did not advance');

// 5) World model actually changes gameplay pressure and remains numerically sane over decades.
fresh();const startWorld=JSON.stringify(A.p.fate.world);for(let i=0;i<45;i++)A.v6EvolveWorld();
if(JSON.stringify(A.p.fate.world)===startWorld)throw new Error('world did not evolve');
if(A.p.world.careerMul<.72||A.p.world.careerMul>1.28)throw new Error(`careerMul out of range ${A.p.world.careerMul}`);
A.p.fate.world.jobs=90;A.p.fate.world.economy=85;const careerBias=A.v6WorldBias({category:'职业',title:'争取晋升'});if(careerBias<=0)throw new Error('strong job market should help career outcomes');
A.p.fate.world.market=15;A.p.fate.world.economy=25;const investBias=A.v6WorldBias({category:'投资',title:'扩大投资'});if(investBias>=0)throw new Error('weak market should hurt investment outcomes');

// 6) Long sessions cannot let fate data grow without bound or busy-lock.
fresh();const realDeath=A.deathCheck;A.deathCheck=()=>false;
for(let i=0;i<115;i++){const a=pick();const b=A.p.age;A.resolve(a);if(A.busy)throw new Error(`busy lock at ${b}`);if(A.p.age!==b+1)throw new Error(`age failed ${b}->${A.p.age}`);}
A.deathCheck=realDeath;
if(A.p.fate.nodes.length>220)throw new Error(`causal graph unbounded: ${A.p.fate.nodes.length}`);
if(A.p.fate.pending.length>24)throw new Error(`pending consequences unbounded: ${A.p.fate.pending.length}`);
if(A.v6Forks().length>10)throw new Error(`fork store unbounded: ${A.v6Forks().length}`);

console.log(`V6 fate smoke passed | age=${A.p.age} | nodes=${A.p.fate.nodes.length} | pending=${A.p.fate.pending.length} | forks=${A.v6Forks().length} | echoes=${A.p.fate.echoes.length}`);
