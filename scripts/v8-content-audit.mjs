import fs from 'node:fs';import path from 'node:path';
const root=path.join(process.cwd(),'v7/generated');
const base=JSON.parse(fs.readFileSync(path.join(root,'base.json'),'utf8'));
const report=JSON.parse(fs.readFileSync(path.join(root,'content-report.json'),'utf8'));
const stages={infant:[1,2],preschool:[3,6],child:[7,12],teen:[13,17],young:[18,24],adult:[25,34],mid:[35,49],mature:[50,64],senior:[65,79],elder:[80,120]};
const events=[];for(const [name,[lo,hi]] of Object.entries(stages)){const list=JSON.parse(fs.readFileSync(path.join(root,`events-${name}.json`),'utf8'));if(list.length<15)throw new Error(`${name} pool underfilled: ${list.length}`);for(const e of list)if((e.minAge??1)>=lo&&(e.maxAge??120)<=hi)events.push(e);}
const allIds=new Set(),dupeIds=[];for(const e of events){if(allIds.has(e.id))dupeIds.push(e.id);allIds.add(e.id)}if(dupeIds.length)throw new Error(`duplicate event ids ${[...new Set(dupeIds)].slice(0,8).join(',')}`);
const newEvents=events.filter(e=>String(e.id).startsWith('x81_'));if(newEvents.length<150)throw new Error(`expected 150 V8.1 age-specific events, got ${newEvents.length}`);
const newTitles=new Set(newEvents.map(e=>e.title));if(newTitles.size!==newEvents.length)throw new Error(`V8.1 event title duplication ${newEvents.length-newTitles.size}`);
for(const e of newEvents){if((e.options?.length??0)<3)throw new Error(`${e.id} has too few responses`);const labels=e.options.map(o=>o.label);if(new Set(labels).size!==labels.length)throw new Error(`${e.id} repeats response labels`)}
const badYoung=/工资|房贷|买房|退休|养老现金流|猎头|领导|公司重组|伴侣职业|资产配置/;const badChild=/实习|offer|租房|信用消费|创业|结婚|养老|退休|买房|年终奖/;const badOld=/同桌|作业|升学|模拟考试|幼儿园|兴趣班|家长会|大学第一学期|实习面试/;
for(const e of events){const text=`${e.title} ${e.desc??''}`;if((e.maxAge??120)<=6&&badYoung.test(text))throw new Error(`adult concept in preschool event ${e.id}: ${e.title}`);if((e.maxAge??120)<=12&&badChild.test(text))throw new Error(`adult concept in child event ${e.id}: ${e.title}`);if((e.minAge??1)>=65&&badOld.test(text))throw new Error(`youth concept in senior event ${e.id}: ${e.title}`)}
const traits=base.TRAITS||[],traitIds=new Set();for(const t of traits){if(traitIds.has(t.id))throw new Error(`duplicate trait id ${t.id}`);traitIds.add(t.id)}if(traits.length<400)throw new Error(`trait pool ${traits.length} < 400`);
const newTraits=traits.filter(t=>String(t.id).startsWith('x81_'));if(newTraits.length<210)throw new Error(`V8.1 trait expansion too small ${newTraits.length}`);
const names=new Set(newTraits.map(t=>t.name));if(names.size!==newTraits.length)throw new Error('V8.1 trait names are not unique');
const rarity=base.RARITY;if(!(rarity.P.rank>rarity.SSS.rank&&rarity.P.weight<rarity.SSS.weight))throw new Error('P/彩色 must be mechanically rarer and higher than SSS/神话');
const counts=report.actual;if(counts.events<252||counts.traits<400||counts.careers<100||counts.worlds<12||counts.backgrounds<32||counts.personalities<28||counts.talents<40||counts.flaws<40)throw new Error(`doubling floor missed ${JSON.stringify(counts)}`);
const categoryCounts={};for(const e of newEvents)categoryCounts[e.category]=(categoryCounts[e.category]||0)+1;if(Object.keys(categoryCounts).length<8)throw new Error(`event categories too homogeneous: ${JSON.stringify(categoryCounts)}`);
console.log('V8.1 content audit passed',{counts,stageCounts:report.stageCounts,newEvents:newEvents.length,newTraits:newTraits.length,categories:categoryCounts,rarity:{prismatic:rarity.P,mythic:rarity.SSS}});
