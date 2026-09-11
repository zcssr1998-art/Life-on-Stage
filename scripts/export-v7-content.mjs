import fs from 'node:fs';import vm from 'node:vm';import path from 'node:path';
const root=process.cwd();
const setGlobal=(k,v)=>{try{globalThis[k]=v}catch{Object.defineProperty(globalThis,k,{value:v,writable:true,configurable:true})}};
setGlobal('window',globalThis);setGlobal('addEventListener',()=>{});setGlobal('requestAnimationFrame',f=>f());setGlobal('document',{getElementById:()=>null,querySelector:()=>null,querySelectorAll:()=>[],documentElement:{dataset:{},style:{setProperty(){}}}});setGlobal('navigator',{});setGlobal('location',{href:'https://example.test/'});setGlobal('confirm',()=>true);setGlobal('innerWidth',390);setGlobal('innerHeight',844);setGlobal('screen',{width:390,height:844});
class StorageMock{constructor(){this.m=new Map()}getItem(k){return this.m.has(k)?this.m.get(k):null}setItem(k,v){this.m.set(k,String(v))}removeItem(k){this.m.delete(k)}clear(){this.m.clear()}}setGlobal('localStorage',new StorageMock());
const files=['v3-core.js','ev1.js','ev2.js','ev3.js','ev4.js','ev5.js','ev6.js','ev7.js','ev8.js','v4-data.js','v5-data.js','v5-engine.js','v5-patch.js','v5.2-hotfix.js','v5.3-hotfix.js','v5.4-data.js','v5.4-hotfix.js','v5.4-balance.js','v5.5-events.js','v5.5-engine.js','v5.6-money.js','v6-fate.js','v6.1-fate.js','v6.2-careers.js','v6.2-hotfix.js','v8.1-content-expansion.js','v8.1-events-expansion.js'];
for(const f of files){const p=path.join(root,f);if(fs.existsSync(p))vm.runInThisContext(fs.readFileSync(p,'utf8'),{filename:f});}
const L=globalThis.LIFE;if(!L)throw new Error('legacy LIFE namespace missing');
const base={ATTR:L.ATTR||{},WORLDS:L.WORLDS||[],BACKGROUNDS:L.BACKGROUNDS||[],PERSONALITIES:L.PERSONALITIES||[],TALENTS:L.TALENTS||[],FLAWS:L.FLAWS||[],TRAITS:L.TRAITS||[],RARITY:L.RARITY||{},ZHOU_CHOICES:L.ZHOU_CHOICES||[],CAREER_ROUTES:L.CAREER_ROUTES||[],MICRO_STORIES:L.MICRO_STORIES||[]};
const rejectFunctions=(key,value)=>{if(typeof value==='function')throw new Error(`non-data function at ${key}`);return value};
JSON.stringify(base,rejectFunctions);const events=L.EVENTS||[];JSON.stringify(events,rejectFunctions);

const assert=(ok,msg)=>{if(!ok)throw new Error(msg)};
assert(events.length>=260,`V8.1 expected >=260 events after doubling, got ${events.length}`);
assert(base.TRAITS.length>=400,`V8.1 expected >=400 traits after doubling, got ${base.TRAITS.length}`);
assert(base.CAREER_ROUTES.length>=100,`V8.1 expected >=100 careers after doubling, got ${base.CAREER_ROUTES.length}`);
assert(base.WORLDS.length>=12,`world pool not doubled: ${base.WORLDS.length}`);
assert(base.BACKGROUNDS.length>=32,`background pool not doubled: ${base.BACKGROUNDS.length}`);
assert(base.PERSONALITIES.length>=28,`personality pool not doubled: ${base.PERSONALITIES.length}`);
assert(base.TALENTS.length>=40,`talent pool not doubled: ${base.TALENTS.length}`);
assert(base.FLAWS.length>=40,`flaw pool not doubled: ${base.FLAWS.length}`);
assert(base.ZHOU_CHOICES.length>=10,`zhou pool too small: ${base.ZHOU_CHOICES.length}`);
const traitRarities=new Set(['B','A','S','SS','SSS']);
assert(base.TRAITS.every(t=>traitRarities.has(t.rarity)),`trait rarity must be B/A/S/SS/SSS only; prismatic is an outcome rarity`);
assert(Object.keys(base.RARITY).every(r=>traitRarities.has(r)),`RARITY contains a non-trait tier: ${Object.keys(base.RARITY).join(',')}`);
const ids=a=>a.map(x=>x.id).filter(Boolean),unique=a=>new Set(a).size;
assert(unique(ids(events))===ids(events).length,'duplicate event ids detected');
assert(unique(ids(base.TRAITS))===ids(base.TRAITS).length,'duplicate trait ids detected');
assert(unique(ids(base.CAREER_ROUTES))===ids(base.CAREER_ROUTES).length,'duplicate career ids detected');
const normalizedTitle=s=>String(s||'').replace(/[\s·：:「」『』，。！？!?]/g,'').toLowerCase();
const titles=events.map(e=>normalizedTitle(e.title)).filter(Boolean);assert(unique(titles)>=Math.floor(titles.length*.88),`event title diversity too low: ${unique(titles)}/${titles.length}`);
const newEvents=events.filter(e=>String(e.id).startsWith('v81_'));
assert(newEvents.length>=140,`V8.1 authored event expansion unexpectedly small: ${newEvents.length}`);
assert(newEvents.every(e=>Array.isArray(e.options)&&e.options.length>=2),'every V8.1 event needs at least two real responses');
assert(newEvents.every(e=>e.theme&&e.stageTag),'every V8.1 event needs theme + stageTag metadata');
const forbiddenYoung=/工资|裁员|升职|房贷|结婚|退休|股票|创业|养老金|公司高管/;
for(const e of events.filter(e=>(e.maxAge??120)<=6)){const text=[e.title,e.desc,...(e.options||[]).flatMap(o=>[o.label,o.text])].join('');assert(!forbiddenYoung.test(text),`age-inappropriate young-child event: ${e.id}`);}
const forbiddenTeen=/退休|养老金|孙子|孙女|遗嘱|养老院/;for(const e of events.filter(e=>(e.maxAge??120)<=18)){const text=[e.title,e.desc].join('');assert(!forbiddenTeen.test(text),`age-inappropriate teen event: ${e.id}`);}

fs.mkdirSync(path.join(root,'v7/generated'),{recursive:true});fs.writeFileSync(path.join(root,'v7/generated/base.json'),JSON.stringify(base));
const stages={
  toddler:[1,3],preschool:[4,6],primary:[7,9],preteen:[10,12],teenEarly:[13,15],teenLate:[16,18],college:[19,22],twenties:[23,29],thirties:[30,39],forties:[40,49],fifties:[50,59],sixties:[60,69],elder:[70,84],oldest:[85,120]
};
const coverage={};for(const[name,[lo,hi]]of Object.entries(stages)){const list=events.filter(e=>(e.maxAge??120)>=lo&&(e.minAge??1)<=hi);coverage[name]=list.length;assert(list.length>=10,`age pool ${name} too small: ${list.length}`);fs.writeFileSync(path.join(root,`v7/generated/events-${name}.json`),JSON.stringify(list));}
console.log(`V8.1 content export: ${events.length} events, ${base.TRAITS.length} traits, ${base.CAREER_ROUTES.length} careers, ${base.MICRO_STORIES.length} micro stories`);console.log('V8.1 age-pool coverage',coverage);
