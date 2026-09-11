const fs=require('fs'),vm=require('vm'),path=require('path');
global.window=global;global.addEventListener=()=>{};
global.document={getElementById:()=>null,querySelector:()=>null,querySelectorAll:()=>[]};global.navigator={};global.location={href:'https://example.test/'};global.confirm=()=>true;
class StorageMock{constructor(){this.m=new Map()}getItem(k){return this.m.has(k)?this.m.get(k):null}setItem(k,v){this.m.set(k,String(v))}removeItem(k){this.m.delete(k)}}global.localStorage=new StorageMock();
const files=['v3-core.js','ev1.js','ev2.js','ev3.js','ev4.js','ev5.js','ev6.js','ev7.js','ev8.js','v4-data.js','v5-data.js','v5-engine.js','v5-patch.js','v5.2-hotfix.js','v5.3-hotfix.js','v5.4-data.js','v5.4-hotfix.js','v5.4-balance.js','v5.5-events.js','v5.5-engine.js','v5.6-money.js','v6-fate.js','v6.1-fate.js'];
for(const f of files)vm.runInThisContext(fs.readFileSync(path.join(process.cwd(),f),'utf8'),{filename:f});
const A=global.APP,L=global.LIFE;A.render=()=>{};A.note=()=>{};
const fresh=()=>{localStorage.clear?.();A.p=null;A.busy=false;A.newLife(A.draft());};

// 1) Every new life gets exactly one young-life Lachesis point.
for(let i=0;i<240;i++){
  fresh();const s=A.v61EnsureSingularity();
  if(!s||s.name!=='拉刻西斯节点')throw new Error('Lachesis point missing');
  if(s.age<17||s.age>31)throw new Error(`singularity outside young-life band: ${s.age}`);
  const again=A.v61EnsureSingularity();if(again!==s)throw new Error('singularity was regenerated instead of persisted');
}

// 2) At the destined age it fully replaces the ordinary year with four radically different branches.
fresh();const s=A.v61EnsureSingularity();A.p.age=s.age;A.p.graduationAge=null;A.buildYear();
if(A.year.length!==4)throw new Error(`singularity should be 4-way, got ${A.year.length}`);
if(!A.year.every(x=>x._v61Singularity))throw new Error('ordinary action leaked into singularity year');
const branches=new Set(A.year.map(x=>x._v61Branch));
for(const b of ['venture','scholar','bond','voyage'])if(!branches.has(b))throw new Error(`missing singularity branch ${b}`);

// 3) Resolving the point records one branch, advances one year, and never creates a second singularity.
const realDeath=A.deathCheck;A.deathCheck=()=>false;const age=s.age,life=A.p.id;A.resolve(A.year[0]);
if(A.p.id!==life||A.p.age!==age+1)throw new Error('singularity did not advance exactly one year');
if(!A.p.fate.singularity.resolved||!A.p.fate.singularity.branch)throw new Error('singularity result not persisted');
if(!A.p.tags.some(x=>String(x).startsWith('奇点·')))throw new Error('branch identity tag missing');
for(let i=0;i<25;i++){const before=A.p.age;const a=(A.year||[]).find(x=>A.pass(x.requires||{}));if(!a)throw new Error(`no action at ${before}`);A.resolve(a);if(A.p.age!==before+1)throw new Error(`post-singularity age failed ${before}`);if(A.p.fate.singularity.age!==age)throw new Error('a second singularity replaced the first');}
A.deathCheck=realDeath;

// 4) Rewind restores the exact flashpoint and increments world-line number.
A.p.alive=false;A.p.deathReason='测试结局';const oldBranch=A.p.fate.branch||1;
if(!A.v61RewindSingularity())throw new Error('singularity rewind failed');
if(A.p.age!==age||!A.p.alive)throw new Error(`rewind restored wrong age/state: ${A.p.age}`);
if((A.p.fate.branch||1)!==oldBranch+1)throw new Error('world-line number did not increment');
if(A.year.length!==4||!A.year.every(x=>x._v61Singularity))throw new Error('rewind did not restore original 4-way singularity');
if(A.p.fate.singularity.resolved)throw new Error('rewound singularity should await a new choice');

// 5) Different branches must materially diverge, not just change flavor text.
const snapshots={};
for(let i=0;i<4;i++){
  if(i>0){A.p.alive=false;A.v61RewindSingularity();}
  const action=A.year[i]||A.year.find(x=>x._v61Branch===['venture','scholar','bond','voyage'][i]);
  const branch=action._v61Branch;A.deathCheck=()=>false;A.resolve(action);snapshots[branch]={tags:[...A.p.tags],salary:A.p.salaryMul,spouse:!!A.p.spouse,vol:A.p.economicVolatility||1,investor:A.p.tags.includes('投资者')};
}
A.deathCheck=realDeath;
if(!snapshots.venture.investor)throw new Error('venture branch did not open investor path');
if(!(snapshots.scholar.salary>snapshots.bond.salary))throw new Error('scholar and bond branches are not economically distinct');
if(!snapshots.bond.spouse)throw new Error('bond branch did not bind a companion');
if(!(snapshots.voyage.vol>=1))throw new Error('voyage branch volatility state missing');

// 6) Player-facing stat masking helpers must not leak exact attribute numbers.
const masked=A.v61MaskChanges('健康+7 · 幸福-3 · 财富+¥2.0万 · 智力+4');
if(/健康\+7|幸福-3|智力\+4/.test(masked))throw new Error(`attribute delta leaked exact numbers: ${masked}`);
if(!masked.includes('财富'))throw new Error('money change should remain auditable');
for(const v of [10,45,82,117,151,181,199])if(/\d/.test(A.v61StatBand('health',v)))throw new Error('stat band leaked a number');

console.log(`V6.1 fate smoke passed | singularity=${age} | branch=${A.p.fate.singularity.branch||'rewound'} | worldline=${A.p.fate.branch}`);
