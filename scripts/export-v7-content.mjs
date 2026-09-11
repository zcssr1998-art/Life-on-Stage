import fs from 'node:fs';import vm from 'node:vm';import path from 'node:path';
const root=process.cwd();
const setGlobal=(k,v)=>{try{globalThis[k]=v}catch{Object.defineProperty(globalThis,k,{value:v,writable:true,configurable:true})}};
setGlobal('window',globalThis);setGlobal('addEventListener',()=>{});setGlobal('requestAnimationFrame',f=>f());setGlobal('document',{getElementById:()=>null,querySelector:()=>null,querySelectorAll:()=>[],documentElement:{dataset:{},style:{setProperty(){}}}});setGlobal('navigator',{});setGlobal('location',{href:'https://example.test/'});setGlobal('confirm',()=>true);setGlobal('innerWidth',390);setGlobal('innerHeight',844);setGlobal('screen',{width:390,height:844});
class StorageMock{constructor(){this.m=new Map()}getItem(k){return this.m.has(k)?this.m.get(k):null}setItem(k,v){this.m.set(k,String(v))}removeItem(k){this.m.delete(k)}clear(){this.m.clear()}}setGlobal('localStorage',new StorageMock());
const files=['v3-core.js','ev1.js','ev2.js','ev3.js','ev4.js','ev5.js','ev6.js','ev7.js','ev8.js','v4-data.js','v5-data.js','v5-engine.js','v5-patch.js','v5.2-hotfix.js','v5.3-hotfix.js','v5.4-data.js','v5.4-hotfix.js','v5.4-balance.js','v5.5-events.js','v5.5-engine.js','v5.6-money.js','v6-fate.js','v6.1-fate.js','v6.2-careers.js','v6.2-hotfix.js'];
for(const f of files){const p=path.join(root,f);if(fs.existsSync(p))vm.runInThisContext(fs.readFileSync(p,'utf8'),{filename:f});}
const L=globalThis.LIFE;if(!L)throw new Error('legacy LIFE namespace missing');
const base={ATTR:L.ATTR||{},WORLDS:L.WORLDS||[],BACKGROUNDS:L.BACKGROUNDS||[],PERSONALITIES:L.PERSONALITIES||[],TALENTS:L.TALENTS||[],FLAWS:L.FLAWS||[],TRAITS:L.TRAITS||[],RARITY:L.RARITY||{},ZHOU_CHOICES:L.ZHOU_CHOICES||[],CAREER_ROUTES:L.CAREER_ROUTES||[]};
const rejectFunctions=(key,value)=>{if(typeof value==='function')throw new Error(`non-data function at ${key}`);return value};
JSON.stringify(base,rejectFunctions);const events=L.EVENTS||[];JSON.stringify(events,rejectFunctions);
if(events.length<100)throw new Error(`legacy event export unexpectedly small: ${events.length}`);if(base.TRAITS.length<150)throw new Error(`trait export unexpectedly small: ${base.TRAITS.length}`);if(base.CAREER_ROUTES.length!==50)throw new Error(`career export expected 50, got ${base.CAREER_ROUTES.length}`);
fs.mkdirSync(path.join(root,'v7/generated'),{recursive:true});fs.writeFileSync(path.join(root,'v7/generated/base.json'),JSON.stringify(base));
const stages={childhood:[1,12],youth:[13,22],adult:[23,59],senior:[60,120]};for(const[name,[lo,hi]]of Object.entries(stages)){const list=events.filter(e=>(e.maxAge??120)>=lo&&(e.minAge??1)<=hi);fs.writeFileSync(path.join(root,`v7/generated/events-${name}.json`),JSON.stringify(list));}
console.log(`V7 content export: ${events.length} legacy events, ${base.TRAITS.length} traits, ${base.CAREER_ROUTES.length} careers`);
