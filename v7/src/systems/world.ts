import {RNG,Store} from '../core.js';
const clamp=(a:number,b:number,v:number)=>Math.max(a,Math.min(b,v));
export class WorldSystem{
  constructor(private store:Store,private rng:RNG){}
  tick(){const s=this.store.get(),w=s.world;const mean=(x:number)=>clamp(5,95,x+(50-x)*.08+this.rng.int(-5,5));const next={economy:mean(w.economy),jobs:mean(w.jobs),tech:clamp(5,100,w.tech+this.rng.int(0,3)),market:mean(w.market),medicine:clamp(5,100,w.medicine+this.rng.int(0,2)),conflict:mean(w.conflict),housing:mean(w.housing),headline:w.headline};const shocks=[['经济突然转冷','economy',-18],['招聘市场回暖','jobs',16],['AI 技术跃迁','tech',14],['资产价格大回撤','market',-20],['医疗出现突破','medicine',13],['地缘摩擦升级','conflict',18],['住房成本回落','housing',-15]] as const;if(this.rng.next()<.18){const [h,k,d]=this.rng.pick([...shocks]);(next as any)[k]=clamp(0,100,(next as any)[k]+d);next.headline=h;}else next.headline='没有宏大新闻，但时代仍在缓慢移动。';this.store.dispatch({type:'WORLD',patch:next});}
}
