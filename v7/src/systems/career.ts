import type {ActionChoice,BaseContent} from '../types.js';
import {RNG,Store} from '../core.js';
export class CareerSystem{
  constructor(private store:Store,private base:BaseContent,private rng:RNG){}
  route(id:string|null){return this.base.CAREER_ROUTES.find(x=>x.id===id)||null}
  resolveRoute(id:string){const alias:Record<string,string>={developer:'software',designer:'uxui',researcher:'scientist',technician:'manufacturing',freelancer:'3d_art',clerk:'civil_service',artist:'3d_art',creator:'influencer',medtech:'pharma',civil:'civil_service',captain:'police',partner:'consulting'};return this.route(id)?id:(alias[id]??id);}
  set(route:string,level=1){if(!this.route(route))return;this.store.dispatch({type:'CAREER_SET',route,level});}
  tick(){const s=this.store.get();if(!s.careerRoute||s.age>=70)return;this.store.dispatch({type:'CAREER_XP',amount:1});}
  promotionChoice():ActionChoice|null{const s=this.store.get(),r=this.route(s.careerRoute);if(!r||s.careerLevel>=5||s.careerYears<2)return null;const next=r.titles[s.careerLevel]!;return{id:`career:promo:${r.id}:${s.careerLevel}`,sourceEvent:'career_promotion',category:'职业',title:`争取晋升「${next}」`,desc:'把这几年积累的成果摆到桌面上。',hint:'成功率受能力、社交和时代就业影响',outcomes:[{weight:Math.max(2,5+(s.stats.discipline-50)/12+(s.world.jobs-50)/10),text:`你拿到了位置，正式成为${next}。`,tone:'good',ops:[{type:'careerSet',route:r.id,level:s.careerLevel+1},{type:'stat',key:'ambition',delta:3}]},{weight:4,text:'这次没轮到你，但你知道差距在哪里。',tone:'neutral',ops:[{type:'stat',key:'discipline',delta:2},{type:'stat',key:'happiness',delta:-2}]}]};}
}
