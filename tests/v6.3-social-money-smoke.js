const fs=require('fs'),vm=require('vm'),path=require('path');
global.window=global;global.addEventListener=()=>{};global.requestAnimationFrame=f=>f();
global.document={getElementById:()=>null,querySelector:()=>null,querySelectorAll:()=>[],documentElement:{dataset:{},style:{setProperty(){}}}};global.navigator={};global.location={href:'https://example.test/'};global.confirm=()=>true;global.innerWidth=390;global.innerHeight=844;global.screen={width:390,height:844};
class StorageMock{constructor(){this.m=new Map()}getItem(k){return this.m.has(k)?this.m.get(k):null}setItem(k,v){this.m.set(k,String(v))}removeItem(k){this.m.delete(k)}clear(){this.m.clear()}}global.localStorage=new StorageMock();
const files=['v3-core.js','ev1.js','ev2.js','ev3.js','ev4.js','ev5.js','ev6.js','ev7.js','ev8.js','v4-data.js','v5-data.js','v5-engine.js','v5-patch.js','v5.2-hotfix.js','v5.3-hotfix.js','v5.4-data.js','v5.4-hotfix.js','v5.4-balance.js','v5.5-events.js','v5.5-engine.js','v5.6-money.js','v6-fate.js','v6.1-fate.js','v6.2-careers.js','v6.2-hotfix.js','v6.2-post.js','v6.3-economy.js','v6.3-social.js','v6.3-ui.js'];
for(const f of files)vm.runInThisContext(fs.readFileSync(path.join(process.cwd(),f),'utf8'),{filename:f});
const A=global.APP,L=global.LIFE;A.render=()=>{};A.note=()=>{};
const fresh=()=>{localStorage.clear();A.p=null;A.newLife(A.draft());};
const choose=()=>{const xs=(A.year||[]).filter(x=>A.pass(x.requires||{}));if(!xs.length)throw new Error(`no action at ${A.p?.age}`);return xs[Math.floor(Math.random()*xs.length)]};

// 1) Adult children no longer create permanent retirement expenses.
fresh();A.p.age=87;A.setJob('3d_art');A.p.careerLevel=5;A.p.careerYears=12;A.p.v63PensionSalaryPeak=40000;A.p.wealth=0;A.p.children=[{id:'grown',birthAge:30},{id:'young',birthAge:70}];
if(A.v63DependentChildren().length!==1)throw new Error('adult child still counted as dependent');
const retired=A.autoIncome();if(!retired.items.some(x=>x.key==='pension'&&x.amount>0))throw new Error('retirement pension missing');if(retired.items.find(x=>x.key==='living')?.note.includes('2 名'))throw new Error('grown child leaked into living cost');
if(retired.net<=0)throw new Error(`stage-5 retiree should not structurally bleed cash every year: ${retired.net}`);

// 2) Debt interest uses opening debt and cannot instantly compound current-year expenses.
A.p.wealth=-1000000;A.p.stats.risk=60;const debt=A.autoIncome(),di=debt.items.find(x=>x.key==='debt');if(!di)throw new Error('debt interest missing');if(Math.abs(di.amount)>80000)throw new Error(`debt interest runaway: ${di.amount}`);if(!String(di.note).includes('年初负债'))throw new Error('debt basis is not transparent');

// 3) Partner career now has real household cashflow impact.
fresh();A.p.age=36;A.setJob('software');A.p.careerLevel=3;const npc=A.v63CreateNPC({careerRoute:'finance',careerLevel:3,affinity:70,sharedEvents:3});A.p.relationships.push(npc);A.v63MakePartner(npc.id);const family=A.autoIncome();if(!family.items.some(x=>x.key==='partner'&&x.amount>0))throw new Error('living partner contributes no household income');

// 4) Social cards appear from adulthood and repeated intersections can become a partner.
fresh();A.p.age=23;let socialHits=0;for(let i=0;i<80;i++){A.buildYear();if(A.year.some(x=>x._v63Social))socialHits++;}if(socialHits<30)throw new Error(`adult encounter frequency too low: ${socialHits}/80`);
const meet=A.v63EncounterAction(),goodMeet=meet.outcomes[0];A.applyOutcome(meet,goodMeet);let r=A.p.relationships[0];if(!r||r.sharedEvents<1)throw new Error('encounter did not persist person');
const interact=A.v63InteractionAction(r);A.applyOutcome(interact,interact.outcomes[0]);r=A.v63FindRelation(r.id);if(r.sharedEvents<2||r.affinity<40)throw new Error('relationship did not deepen');
const romance=A.v63RomanceAction(r);A.applyOutcome(romance,romance.outcomes[0]);if(!A.p.spouse||A.p.spouse.relId!==r.id||A.v63RelationRole(r)!=='伴侣')throw new Error('relationship could not become partner');

// 5) Friends/enemies have persistent alive/dead state and ending aftermath can name close people.
const friend=A.v63CreateNPC({name:'测试朋友',affinity:84,sharedEvents:8});A.p.relationships.push(friend);A.v63KillRelation(friend,'测试性离世');if(friend.alive!==false||!friend.deathAge||friend.deathReason!=='测试性离世')throw new Error('relationship death state missing');
A.p.alive=false;const after=A.v63Aftermath();if(!after.length||after.length>5||!after.some(x=>x.name==='测试朋友'))throw new Error('post-death relationship epilogue missing close people');

// 6) Random play should no longer end in debt for a clear majority of ordinary runs.
const realDeath=A.deathCheck;A.deathCheck=()=>false;let debtRuns=0,partnerRuns=0,total=180;
for(let run=0;run<total;run++){
  fresh();let guard=0;while(A.p.age<82&&guard++<90){A.resolve(choose())}
  if(A.p.wealth<0)debtRuns++;if(A.p.spouse)partnerRuns++;
}
A.deathCheck=realDeath;const debtRate=debtRuns/total,partnerRate=partnerRuns/total;
if(debtRate>.55)throw new Error(`too many random lives end negative: ${(debtRate*100).toFixed(1)}%`);
if(partnerRate<.45)throw new Error(`partner activation still too rare: ${(partnerRate*100).toFixed(1)}%`);
console.log(`V6.3 social-money smoke passed | debt=${(debtRate*100).toFixed(1)}% | partner=${(partnerRate*100).toFixed(1)}% | social=${socialHits}/80 | retiree net=${retired.net}`);