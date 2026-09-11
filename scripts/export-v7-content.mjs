import fs from 'node:fs';import vm from 'node:vm';import path from 'node:path';
const root=process.cwd();
const setGlobal=(k,v)=>{try{globalThis[k]=v}catch{Object.defineProperty(globalThis,k,{value:v,writable:true,configurable:true})}};
setGlobal('window',globalThis);setGlobal('addEventListener',()=>{});setGlobal('requestAnimationFrame',f=>f());setGlobal('document',{getElementById:()=>null,querySelector:()=>null,querySelectorAll:()=>[],documentElement:{dataset:{},style:{setProperty(){}}}});setGlobal('navigator',{});setGlobal('location',{href:'https://example.test/'});setGlobal('confirm',()=>true);setGlobal('innerWidth',390);setGlobal('innerHeight',844);setGlobal('screen',{width:390,height:844});
class StorageMock{constructor(){this.m=new Map()}getItem(k){return this.m.has(k)?this.m.get(k):null}setItem(k,v){this.m.set(k,String(v))}removeItem(k){this.m.delete(k)}clear(){this.m.clear()}}setGlobal('localStorage',new StorageMock());
const files=['v3-core.js','ev1.js','ev2.js','ev3.js','ev4.js','ev5.js','ev6.js','ev7.js','ev8.js','v4-data.js','v5-data.js','v5-engine.js','v5-patch.js','v5.2-hotfix.js','v5.3-hotfix.js','v5.4-data.js','v5.4-hotfix.js','v5.4-balance.js','v5.5-events.js','v5.5-engine.js','v5.6-money.js','v6-fate.js','v6.1-fate.js','v6.2-careers.js','v6.2-hotfix.js','v8.1-content-expansion.js','v8.1-career-expansion.js','v8.1-elder-extra.js'];
for(const f of files){const p=path.join(root,f);if(fs.existsSync(p))vm.runInThisContext(fs.readFileSync(p,'utf8'),{filename:f});}
const L=globalThis.LIFE;if(!L)throw new Error('legacy LIFE namespace missing');
const base={ATTR:L.ATTR||{},WORLDS:L.WORLDS||[],BACKGROUNDS:L.BACKGROUNDS||[],PERSONALITIES:L.PERSONALITIES||[],TALENTS:L.TALENTS||[],FLAWS:L.FLAWS||[],TRAITS:L.TRAITS||[],RARITY:L.RARITY||{},ZHOU_CHOICES:L.ZHOU_CHOICES||[],CAREER_ROUTES:L.CAREER_ROUTES||[]};
const rejectFunctions=(key,value)=>{if(typeof value==='function')throw new Error(`non-data function at ${key}`);return value};
JSON.stringify(base,rejectFunctions);const events=L.EVENTS||[];JSON.stringify(events,rejectFunctions);
const floors={events:252,traits:400,careers:100,worlds:12,backgrounds:32,personalities:28,talents:40,flaws:40};
const actual={events:events.length,traits:base.TRAITS.length,careers:base.CAREER_ROUTES.length,worlds:base.WORLDS.length,backgrounds:base.BACKGROUNDS.length,personalities:base.PERSONALITIES.length,talents:base.TALENTS.length,flaws:base.FLAWS.length};
for(const [k,min] of Object.entries(floors))if(actual[k]<min)throw new Error(`V8.1 ${k} library expected >=${min}, got ${actual[k]}`);
if((base.RARITY.P?.rank??0)<=(base.RARITY.SSS?.rank??0))throw new Error('prismatic rarity must rank above mythic');
if((base.RARITY.P?.weight??99)>=(base.RARITY.SSS?.weight??0))throw new Error('prismatic must roll rarer than mythic');
fs.mkdirSync(path.join(root,'v7/generated'),{recursive:true});fs.writeFileSync(path.join(root,'v7/generated/base.json'),JSON.stringify(base));
const stages={infant:[1,2],preschool:[3,6],child:[7,12],teen:[13,17],young:[18,24],adult:[25,34],mid:[35,49],mature:[50,64],senior:[65,79],elder:[80,120]};
const stageCounts={};for(const[name,[lo,hi]]of Object.entries(stages)){const list=events.filter(e=>(e.maxAge??120)>=lo&&(e.minAge??1)<=hi);stageCounts[name]=list.length;if(list.length<15)throw new Error(`age pool ${name} too small: ${list.length}`);fs.writeFileSync(path.join(root,`v7/generated/events-${name}.json`),JSON.stringify(list));}
fs.writeFileSync(path.join(root,'v7/generated/content-report.json'),JSON.stringify({actual,stageCounts,rarity:base.RARITY},null,2));
console.log(`V8.1 content export: ${events.length} events, ${base.TRAITS.length} traits, ${base.CAREER_ROUTES.length} careers, ${base.WORLDS.length} worlds`);console.log('V8.1 age pools',stageCounts);
