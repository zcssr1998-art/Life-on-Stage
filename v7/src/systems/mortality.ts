import {RNG,Store} from '../core.js';
const clamp=(a:number,b:number,v:number)=>Math.max(a,Math.min(b,v));
export class MortalitySystem{
  constructor(private store:Store,private rng:RNG){}
  check(){const s=this.store.get();if(!s.alive)return true;if(s.stats.health<=0){this.store.dispatch({type:'DIE',reason:'健康崩溃'});return true}const age=s.age;if(age>=110){this.store.dispatch({type:'DIE',reason:'自然衰老'});return true}
    const base=age<10?.00035:age<18?.00055:age<30?.0010:age<40?.0016:age<50?.0028:age<60?.0060:age<65?.0120:age<70?.0220:age<75?.0360:age<80?.0600:age<85?.1000:age<90?.1700:age<95?.2800:age<100?.4200:.6500;
    const fragility=.75+((s.seed%997)/996)*.90;const healthMul=clamp(.78,2.45,1+(55-s.stats.health)*.020);const riskMul=clamp(.88,1.72,1+(s.stats.risk-50)*.009);const luckMul=clamp(.91,1.10,1-(s.stats.luck-50)*.0022);const chance=clamp(0,.97,base*fragility*healthMul*riskMul*luckMul);
    if(this.rng.next()<chance){const causes=age<18?['意外事故','突发疾病']:age<40?['交通意外','急性疾病','意外事故','运动意外']:age<65?['突发疾病','交通意外','工作相关意外','急症']:age<80?['心脑血管急症','突发疾病','意外跌倒','慢性疾病恶化']:['自然衰老','心脑血管急症','突发疾病','意外跌倒'];this.store.dispatch({type:'DIE',reason:this.rng.pick(causes)});return true;}return false;}
}
