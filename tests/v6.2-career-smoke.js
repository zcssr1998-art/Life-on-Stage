const fs=require('fs'),vm=require('vm'),path=require('path');
global.window=global;global.addEventListener=()=>{};global.requestAnimationFrame=f=>f();
global.document={getElementById:()=>null,querySelector:()=>null,querySelectorAll:()=>[],documentElement:{dataset:{},style:{setProperty(){}}}};global.navigator={};global.location={href:'https://example.test/'};global.confirm=()=>true;global.innerWidth=390;global.innerHeight=844;global.screen={width:390,height:844};
class StorageMock{constructor(){this.m=new Map()}getItem(k){return this.m.has(k)?this.m.get(k):null}setItem(k,v){this.m.set(k,String(v))}removeItem(k){this.m.delete(k)}clear(){this.m.clear()}}global.localStorage=new StorageMock();
const files=['v3-core.js','ev1.js','ev2.js','ev3.js','ev4.js','ev5.js','ev6.js','ev7.js','ev8.js','v4-data.js','v5-data.js','v5-engine.js','v5-patch.js','v5.2-hotfix.js','v5.3-hotfix.js','v5.4-data.js','v5.4-hotfix.js','v5.4-balance.js','v5.5-events.js','v5.5-engine.js','v5.6-money.js','v6-fate.js','v6.1-fate.js','v6.2-careers.js','v6.2-hotfix.js'];
for(const f of files)vm.runInThisContext(fs.readFileSync(path.join(process.cwd(),f),'utf8'),{filename:f});
const A=global.APP,L=global.LIFE;A.render=()=>{};A.note=()=>{};
if(L.CAREER_ROUTES.length!==50)throw new Error(`expected 50 career routes, got ${L.CAREER_ROUTES.length}`);
for(const r of L.CAREER_ROUTES){if(r.titles.length!==5||r.salaries.length!==5)throw new Error(`career ${r.id} is not 5-stage`);for(let i=1;i<5;i++)if(r.salaries[i]<r.salaries[i-1])throw new Error(`salary ladder regressed for ${r.id}`)}
const d=A.draft();if(!['男','女'].includes(d.gender))throw new Error('draft gender missing');
A.newLife(d);if(!['男','女'].includes(A.p.gender))throw new Error('player gender missing');
A.setJob('developer');if(A.p.careerRoute!=='software'||A.p.careerLevel!==1)throw new Error('legacy developer did not map to software route');
const first=A.job(A.p.career).name;for(let i=0;i<4;i++)if(!A.v62Promote())throw new Error(`promotion ${i+1} failed`);
if(A.p.careerLevel!==5||A.job(A.p.career).name===first)throw new Error('career ladder did not reach stage 5');
A.p.gender='男';A.p.age=31;A.p.spouse=null;A.spouse();const s=A.p.spouse;if(!s||s.gender!=='女'||!Number.isFinite(s.ageGap)||!s.careerRoute||!Array.isArray(s.history))throw new Error('spouse profile incomplete');
const sj=A.v62SpouseJob();if(!sj||!sj.name||!Number.isFinite(sj.salary))throw new Error('spouse career unavailable');A.v62SpouseYear();if(!s.history.length)throw new Error('spouse yearly mini-history missing');
A.p.tags=['数理工科'];const grad=A.graduationActions();if(grad.length!==5)throw new Error('graduation should show 5 routes');if(!grad.every(x=>x.special?.career&&L.CAREER_ROUTE_MAP[x.special.career]))throw new Error('graduation contains invalid career route');
console.log(`V6.2 career smoke passed | routes=${L.CAREER_ROUTES.length} | software=${A.job('software').name} | spouse=${sj.name}`);