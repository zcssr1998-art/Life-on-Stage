import type {BaseContent} from '../types.js';
import {RNG,Store} from '../core.js';
const clamp=(a:number,b:number,v:number)=>Math.max(a,Math.min(b,v));
export class MoneySystem{
  constructor(private store:Store,private base:BaseContent,private rng:RNG){}
  begin(){const s=this.store.get();this.store.dispatch({type:'RESET_YEAR',opening:s.wealth});}
  post(source:string,label:string,amount:number,note=''){this.store.dispatch({type:'MONEY',source,label,amount,note});}
  careerRoute(id:string|null){return this.base.CAREER_ROUTES.find(x=>x.id===id)||null}
  annual(){const s=this.store.get();if(s.age<18){this.store.dispatch({type:'FINALIZE_LEDGER'});return;}
    const route=this.careerRoute(s.careerRoute);const retired=s.age>=67;
    let netLabor=0;
    if(route&&s.careerLevel>0&&!retired){const gross=route.salaries[s.careerLevel-1]! *12;const worldMul=.82+s.world.jobs/300+s.world.economy/600;const adjusted=gross*worldMul;const tax=adjusted*(adjusted<180000?.05:adjusted<400000?.10:adjusted<800000?.16:.22);netLabor=adjusted-tax;this.post('salary','税后职业收入',netLabor,`${route.titles[s.careerLevel-1]} · 就业/经济环境已计入`);}
    if(retired&&s.careerPeak>0){const pension=18000+s.careerPeak*12000;this.post('retirement','退休保障',pension,'根据职业生涯阶段估算');}
    const partner=s.relationships.find(x=>x.id===s.partnerId&&x.alive);if(partner){const pr=this.careerRoute(partner.careerRoute),salary=pr?.salaries[partner.careerLevel-1]??0;if(salary)this.post('partner','伴侣家庭贡献',salary*12*.18,`${partner.name} 的家庭净贡献`);}
    let living=s.age<25?30000:s.age<45?48000:s.age<65?60000:52000;if(netLabor>0&&netLabor<100000)living*=.72;living+=Math.max(0,netLabor-90000)*(s.age<35?.55:s.age<55?.50:.45);living+=s.children.filter(c=>s.age-c.birthAge<20&&c.alive).length*12000;if(s.wealth>2_000_000)living+=18000;if(s.wealth>10_000_000)living+=45000;this.post('living','生活与家庭支出',-living,netLabor?'包含随收入变化的生活方式支出':'基础生活成本');
    const housing=s.tags.includes('有房')?18000:s.age>=22?(netLabor>0&&netLabor<100000?18000:30000):9000;this.post('housing',s.tags.includes('有房')?'住房持有成本':'居住成本',-housing,netLabor>0&&netLabor<100000&&!s.tags.includes('有房')?'低收入阶段默认合租/低成本居住':'');
    if(s.wealth>500000)this.post('asset_cost','资产与长期责任维护',-Math.min(180000,s.wealth*.010),'资产越多，维护、保险与固定责任越多');
    const healthCost=(s.age<45?2000:s.age<65?6000:s.age<80?12000:22000)+Math.max(0,55-s.stats.health)*220;this.post('health','医疗与保障',-healthCost);
    const openingDebt=Math.max(0,-(s.ledger?.opening??0));if(openingDebt)this.post('debt','负债利息',-openingDebt*.045,'只对年初存量债务计息');
    if(s.tags.includes('投资者')&&s.wealth>50000){const exposure=clamp(.1,.55,.18+(s.stats.risk-50)*.003);const cap=Math.max(0,s.wealth)*exposure;const ret=this.rng.weighted([{r:-.35,w:.06},{r:-.16,w:.14},{r:-.05,w:.18},{r:.04,w:.22},{r:.10,w:.23},{r:.20,w:.12},{r:.38,w:.05}],x=>x.w*(x.r>0?1+(s.stats.luck-50)*.003:1));this.post('investment','投资账户盈亏',cap*ret.r,`投入约${Math.round(cap/10000)}万 · 年回报${Math.round(ret.r*100)}%`);}
    this.store.dispatch({type:'FINALIZE_LEDGER'});
  }
}
