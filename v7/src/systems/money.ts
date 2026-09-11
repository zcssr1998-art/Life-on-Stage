import type {BaseContent} from '../types.js';
import {RNG,Store} from '../core.js';
import {aggregateBuildMods} from '../builds.js';
const clamp=(a:number,b:number,v:number)=>Math.max(a,Math.min(b,v));
export class MoneySystem{
  constructor(private store:Store,private base:BaseContent,private rng:RNG){}
  begin(){const s=this.store.get();this.store.dispatch({type:'RESET_YEAR',opening:s.wealth});}
  post(source:string,label:string,amount:number,note=''){this.store.dispatch({type:'MONEY',source,label,amount,note});}
  careerRoute(id:string|null){return this.base.CAREER_ROUTES.find(x=>x.id===id)||null}
  private afterTax(gross:number){const rate=gross<180000?.05:gross<400000?.10:gross<800000?.16:.22;return gross*(1-rate)}
  annual(){const s=this.store.get();if(s.age<18){this.store.dispatch({type:'FINALIZE_LEDGER'});return;}const mods=aggregateBuildMods(s);
    const route=this.careerRoute(s.careerRoute),retired=s.age>=67,student=s.age<22&&!s.careerRoute;let netLabor=0,pension=0,partnerContribution=0,familySupport=0;
    if(route&&s.careerLevel>0&&!retired){const gross=route.salaries[s.careerLevel-1]!*12;const worldMul=.82+s.world.jobs/300+s.world.economy/600;const buildMul=1+clamp(-.2,.45,mods.income??0);netLabor=this.afterTax(gross*worldMul*buildMul);this.post('salary','税后职业收入',netLabor,`${route.titles[s.careerLevel-1]} · 时代与构筑加成都已计入`);}
    if(student){familySupport=clamp(9000,42000,7000+s.familyResources*400);this.post('family_support','家庭 / 奖助支持',familySupport,'家庭资源属于家庭，不是你一岁时就持有的个人资产');}
    if(retired&&s.careerPeak>0){const peakMonthly=route?.salaries[Math.max(0,Math.min(4,s.careerPeak-1))]??0;pension=clamp(30000,220000,24000+peakMonthly*12*.30);this.post('retirement','退休保障',pension,`按职业生涯最高第 ${s.careerPeak} 阶和历史收入水平估算`);}
    const partner=s.relationships.find(x=>x.id===s.partnerId&&x.alive);if(partner){const pr=this.careerRoute(partner.careerRoute),monthly=pr?.salaries[Math.max(0,partner.careerLevel-1)]??0;if(monthly){const partnerNet=this.afterTax(monthly*12);partnerContribution=partnerNet*.30;this.post('partner','伴侣家庭贡献',partnerContribution,`${partner.name} 的收入扣除其个人支出后进入共同家庭的部分`);}}
    const householdIncome=netLabor+pension+partnerContribution+familySupport;let living=student?18000:s.age<25?28000:s.age<45?42000:s.age<65?50000:42000;if(!student&&householdIncome>0&&householdIncome<80000)living*=.66;if(s.wealth<0&&householdIncome<100000)living*=.88;living+=Math.max(0,householdIncome-120000)*(s.age<35?.30:s.age<55?.27:.22);living+=s.children.filter(c=>s.age-c.birthAge<20&&c.alive).length*10000;if(s.wealth>2_000_000)living+=14000;if(s.wealth>10_000_000)living+=36000;this.post('living','生活与家庭支出',-living,student?'求学阶段按宿舍/家庭共同生活计':'随家庭收入、子女与生活阶段变化');
    let housing:number;if(student)housing=6000;else if(s.tags.includes('有房'))housing=16000;else if(householdIncome>0&&householdIncome<90000)housing=15000;else housing=s.age>=22?26000:9000;this.post('housing',s.tags.includes('有房')?'住房持有成本':'居住成本',-housing,student?'求学阶段宿舍/与家人同住的边际成本':householdIncome<90000?'低收入阶段默认合租或低成本居住':'');
    if(s.wealth>500000)this.post('asset_cost','资产与长期责任维护',-Math.min(140000,s.wealth*.006),'资产越多，维护、保险与固定责任越多');const healthCost=(student?1500:s.age<45?2000:s.age<65?5500:s.age<80?10000:18000)+Math.max(0,55-s.stats.health)*180;this.post('health','医疗与保障',-healthCost);
    const openingDebt=Math.max(0,-(s.ledger?.opening??0));if(openingDebt)this.post('debt','负债利息',-openingDebt*.038,'只对年初存量债务计息；负债仍会产生真实成本');
    if(s.tags.includes('投资者')&&s.wealth>50000){const exposure=clamp(.1,.62,.18+(s.stats.risk-50)*.003+Math.max(0,mods.wealthOutcome??0)*.12);const cap=Math.max(0,s.wealth)*exposure;const tilt=clamp(-.1,.25,mods.wealthOutcome??0);const ret=this.rng.weighted([{r:-.35,w:.06},{r:-.16,w:.14},{r:-.05,w:.18},{r:.04,w:.22},{r:.10,w:.23},{r:.20,w:.12},{r:.38,w:.05}],x=>x.w*(x.r>0?1+(s.stats.luck-50)*.003+tilt:1+Math.max(0,-tilt)*.3));this.post('investment','投资账户盈亏',cap*ret.r,`投入约${Math.round(cap/10000)}万 · 年回报${Math.round(ret.r*100)}% · 构筑已计入`);}
    this.store.dispatch({type:'FINALIZE_LEDGER'});
  }
}
