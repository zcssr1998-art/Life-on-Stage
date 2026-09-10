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

const files=['v3-core.js','ev1.js','ev2.js','ev3.js','ev4.js','ev5.js','ev6.js','ev7.js','ev8.js','v4-data.js','v5-data.js','v5-engine.js','v5-patch.js','v5.2-hotfix.js','v5.3-hotfix.js'];
for(const f of files){const code=fs.readFileSync(path.join(process.cwd(),f),'utf8');vm.runInThisContext(code,{filename:f});}
const A=global.APP,L=global.LIFE;
A.render=()=>{};A.note=()=>{};

function pickUnlocked(){const list=(A.year||[]).filter(a=>A.pass(a.requires||{}));if(!list.length)throw new Error(`No unlocked action at age ${A.p?.age}`);return list[Math.floor(Math.random()*list.length)];}
function clickOnce(){const before=A.p.age;const a=pickUnlocked();A.resolve(a);if(A.busy)throw new Error(`busy remained true after age ${before}`);if(A.p.alive&&A.p.age!==before+1)throw new Error(`age did not advance exactly once: ${before} -> ${A.p.age}`);}
function fresh(){localStorage.removeItem(L.STORAGE_KEY);A.p=null;A.busy=false;A.newLife(A.draft());}

// 1) New flow contract: zhou is 5-of-15, regular years are 4-choice.
for(let i=0;i<120;i++){
  fresh();
  if(A.p.age!==1)throw new Error('fresh life did not start at age 1');
  if(A.year.length!==5)throw new Error(`zhou should show 5 choices, got ${A.year.length}`);
  const ids=A.year.map(x=>x.id);
  if(new Set(ids).size!==5)throw new Error('zhou choices are not unique');
  if(ids.some(id=>!String(id).startsWith('zhou15_')))throw new Error('zhou contains non-zhou action');
  clickOnce();
  if(A.p.alive&&A.p.age===2&&A.year.length!==4)throw new Error(`regular year should show 4 choices, got ${A.year.length}`);
}

// 2) Natural mortality runs: catches state errors around death/endings/family systems.
for(let run=0;run<300;run++){
  fresh();let guard=0;
  while(A.p.alive&&guard++<140)clickOnce();
  if(guard>=140&&A.p.alive)throw new Error('natural run exceeded guard');
}

// 3) Endurance mode: push many thousands of cumulative clicks through 110+.
const realDeath=A.deathCheck;
A.deathCheck=()=>false;
for(let run=0;run<80;run++){
  fresh();
  while(A.p.age<116)clickOnce();
  if(A.p.history.length>900)throw new Error(`history cap failed: ${A.p.history.length}`);
}
A.deathCheck=realDeath;

// 4) Regress reported old-age freeze: repeatedly enter 72-100 age range.
for(let i=0;i<180;i++){
  fresh();
  A.p.age=72+Math.floor(Math.random()*28);
  A.p.wealth=3000000;A.p.wealthPeak=3000000;A.p.career='expert';
  Object.keys(A.p.stats).forEach(k=>A.p.stats[k]=80);
  ['上班族','技术专家'].forEach(t=>{if(!A.p.tags.includes(t))A.p.tags.push(t)});
  A.buildYear();
  const before=A.p.age;
  clickOnce();
  if(A.busy)throw new Error('old-age regression: busy lock');
  if(A.p.alive&&A.p.age!==before+1)throw new Error(`old-age regression: no advance ${before}->${A.p.age}`);
}

// 5) Death must not throw even if normal ending renderer fails.
fresh();
const oldRender=A.render;
A.render=()=>{throw new Error('synthetic ending UI failure')};
let deathThrew=false;
try{A.die('回归测试')}catch{deathThrew=true}
if(deathThrew)throw new Error('die propagated a renderer exception');
if(A.p.alive)throw new Error('die did not commit dead state');
A.render=oldRender;

// 6) Opening-roll distribution sanity: exactly 5 unique traits each time.
for(let i=0;i<700;i++){
  const d=A.draft();
  if(d.traits.length!==5||new Set(d.traits.map(x=>x.id)).size!==5)throw new Error('opening roll invalid');
}

console.log('V5.3 smoke passed: 5-of-15 zhou, 4-choice regular years, 300 natural lives, 80 endurance lives to 115+, 180 old-age regressions, death-render recovery, 700 opening rolls.');
