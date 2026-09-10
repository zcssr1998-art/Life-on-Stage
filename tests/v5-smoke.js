const fs=require('fs');
const vm=require('vm');
const path=require('path');

// Minimal browser stubs: test the game state machine without rendering UI.
global.window=global;
global.document={getElementById:()=>null};
global.navigator={};
global.location={href:'https://example.test/'};
global.confirm=()=>true;
class StorageMock{constructor(){this.m=new Map()}getItem(k){return this.m.has(k)?this.m.get(k):null}setItem(k,v){this.m.set(k,String(v))}removeItem(k){this.m.delete(k)}clear(){this.m.clear()}}
global.localStorage=new StorageMock();

const files=['v3-core.js','ev1.js','ev2.js','ev3.js','ev4.js','ev5.js','ev6.js','ev7.js','ev8.js','v4-data.js','v5-data.js','v5-engine.js','v5-patch.js','v5.2-hotfix.js'];
for(const f of files){const code=fs.readFileSync(path.join(process.cwd(),f),'utf8');vm.runInThisContext(code,{filename:f});}
const A=global.APP,L=global.LIFE;
A.render=()=>{};A.note=()=>{};

function pickUnlocked(){const list=(A.year||[]).filter(a=>A.pass(a.requires||{}));if(!list.length)throw new Error(`No unlocked action at age ${A.p?.age}`);return list[Math.floor(Math.random()*list.length)];}
function clickOnce(){const before=A.p.age;const a=pickUnlocked();A.resolve(a);if(A.busy)throw new Error(`busy remained true after age ${before}`);if(A.p.alive&&A.p.age!==before+1)throw new Error(`age did not advance exactly once: ${before} -> ${A.p.age}`);}
function fresh(){localStorage.removeItem(L.STORAGE_KEY);A.p=null;A.busy=false;A.newLife(A.draft());}

// 1) Natural mortality runs: catches state errors around death/endings/family systems.
for(let run=0;run<220;run++){
  fresh();let guard=0;
  while(A.p.alive&&guard++<130)clickOnce();
  if(guard>=130&&A.p.alive)throw new Error('natural run exceeded guard');
}

// 2) Endurance mode: force every life through old age to catch cumulative-state bugs.
const realDeath=A.deathCheck;
A.deathCheck=()=>false;
for(let run=0;run<40;run++){
  fresh();
  while(A.p.age<111)clickOnce();
  if(A.p.history.length>900)throw new Error(`history cap failed: ${A.p.history.length}`);
}
A.deathCheck=realDeath;

// 3) Direct regression for the reported age-72 retirement event.
const retirement=L.EVENTS.find(e=>e.id==='retirement_offer');
if(!retirement)throw new Error('retirement_offer missing');
for(let i=0;i<80;i++){
  fresh();
  A.p.age=72;A.p.wealth=3000000;A.p.wealthPeak=3000000;A.p.career='expert';
  Object.keys(A.p.stats).forEach(k=>A.p.stats[k]=80);
  ['上班族','技术专家'].forEach(t=>{if(!A.p.tags.includes(t))A.p.tags.push(t)});
  A.buildYear();
  const action=A.fromEvent(retirement);
  if(!action)throw new Error('retirement action could not be built');
  const before=A.p.age;A.resolve(action);
  if(A.busy)throw new Error('age-72 regression: busy lock');
  if(A.p.alive&&A.p.age!==before+1)throw new Error(`age-72 regression: no advance ${before}->${A.p.age}`);
}

// 4) Opening-roll distribution sanity: every draft has exactly 5 unique traits.
for(let i=0;i<500;i++){
  const d=A.draft();
  if(d.traits.length!==5||new Set(d.traits.map(x=>x.id)).size!==5)throw new Error('opening roll invalid');
}

console.log('V5.2 smoke passed: 220 natural lives, 40 endurance lives to 110+, 80 age-72 regressions, 500 opening rolls.');
