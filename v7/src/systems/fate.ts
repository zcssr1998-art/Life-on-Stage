import type {ActionChoice,EffectOp} from '../types.js';
import type {Persistence} from '../core.js';
import {RNG,Store} from '../core.js';
export class FateSystem{
  constructor(private store:Store,private persist:Persistence,private rng:RNG){}
  isDue(){const s=this.store.get();return !s.fate.triggered&&s.age===s.fate.targetAge;}
  choices():ActionChoice[]{const s=this.store.get();const branches=[
    ['break','破局线','把稳定人生掀翻一次','高风险、高上限，职业和财富波动会被放大。',[{type:'stat',key:'ambition',delta:12},{type:'stat',key:'risk',delta:14},{type:'tag',tag:'投资者'}]],
    ['deep','深潜线','十年只做一件难事','把筹码押在长期能力与专业壁垒上。',[{type:'stat',key:'intelligence',delta:14},{type:'stat',key:'discipline',delta:12},{type:'stat',key:'social',delta:-4}]],
    ['bond','同盟线','让一个人真正进入你的生命','关系网权重上升，人生不再只围着自己。',[{type:'stat',key:'family',delta:14},{type:'stat',key:'social',delta:10},{type:'relationshipCreate',relation:'伴侣'}]],
    ['voyage','远航线','离开熟悉的一切','城市、人脉和职业事件池都被重新洗牌。',[{type:'tag',tag:'跨城迁移'},{type:'stat',key:'luck',delta:8},{type:'stat',key:'stability',delta:-8}]]
  ] as [string,string,string,string,EffectOp[]][];return branches.map(([id,title,desc,hint,ops])=>({id:`fate:${id}`,sourceEvent:'lachesis',category:'✦ 拉刻西斯节点',title,desc,hint,rare:true,outcomes:[{weight:1,text:`你选择了「${title}」。从这一刻起，另一种人生开始消失。`,tone:'neutral',ops}],meta:{fateBranch:id}}));}
  async capture(){const s=this.store.get(),key=`${s.id}:${s.age}:lachesis`;await this.persist.putSnapshot(key,this.store.snapshot());this.store.dispatch({type:'FATE_PATCH',patch:{snapshotKey:key}});}
  commit(branch:string){const s=this.store.snapshot();s.fate.triggered=true;s.fate.branch=branch;s.fate.worldline=Math.max(1,s.fate.worldline);this.store.replace(s);}
  async rewind(){const s=this.store.get(),key=s.fate.snapshotKey;if(!key)return false;const snap=await this.persist.getSnapshot(key);if(!snap)return false;snap.fate.snapshotKey=key;snap.fate.worldline=(s.fate.worldline||1)+1;snap.ui.view='game';snap.ui.busy=false;this.store.replace(snap);return true;}
}
