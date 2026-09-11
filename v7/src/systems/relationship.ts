import type {ActionChoice,BaseContent,EffectOp,Relationship,RelationRole} from '../types.js';
import {RNG,Store} from '../core.js';
import {aggregateBuildMods} from '../builds.js';
const clamp=(a:number,b:number,v:number)=>Math.max(a,Math.min(b,v));
const names=['林澈','沈宁','周野','顾遥','许岚','陈川','苏梨','陆森','夏霁','程砚','唐绫','江燃','宋屿','闻溪','秦昭','姜禾','谢临','温遥','叶川','乔宁'];
export class RelationshipSystem{
  constructor(private store:Store,private base:BaseContent,private rng:RNG){}
  newPerson(role:RelationRole='认识的人'):Relationship{const s=this.store.get();const route=this.rng.pick(this.base.CAREER_ROUTES);const gap=this.rng.int(-4,5);return{id:`rel_${s.seed}_${s.age}_${this.rng.int(1000,9999)}`,name:this.rng.pick(names),gender:this.rng.pick(['男','女']),avatar:this.rng.int(0,29),metAge:s.age,ageGap:gap,affinity:role==='伴侣'?72:this.rng.int(20,38),sharedEvents:role==='伴侣'?3:1,role,alive:true,careerRoute:route.id,careerLevel:clamp(1,4,1+Math.floor(Math.max(0,s.age-22)/12)+this.rng.int(-1,1)),history:[{age:s.age,text:'你们第一次真正认识。'}]};}
  romanceChoice(r:Relationship):ActionChoice{return{id:`social:romance:${r.id}`,sourceEvent:'social_romance',category:'重大关系',title:`你和 ${r.name} 的关系到了要命名的时候`,desc:'这已经不是一次普通见面，而是一个会改变之后很多年的节点。',hint:'重大人物事件才会进入主选择池。',rare:true,outcomes:[{weight:7,text:`你们确认了关系。${r.name}从此不再只是关系网里的一个名字。`,tone:'good',ops:[{type:'partnerSet',id:r.id},{type:'relationshipAffinity',id:r.id,delta:12,shared:1}]},{weight:3,text:'你们都没有往前迈那一步，关系停在了一个微妙位置。',tone:'neutral',ops:[{type:'relationshipAffinity',id:r.id,delta:-4,shared:1}]}]};}
  relationshipCrisisChoice(r:Relationship):ActionChoice{return{id:`social:crisis:${r.id}:${this.store.get().age}`,sourceEvent:'social_crisis',category:'重大关系',title:`你和 ${r.name} 终于把积累的问题摆上桌面`,desc:'这不是普通吵架。继续拖下去，关系会自己替你做决定。',hint:'可以修复，也可能正式分开。',rare:true,responses:[
    {label:'把问题说透',hint:'稳定、家庭关系越高，修复权重越高',outcomes:[{weight:6,text:'你们没有立刻变好，但至少重新开始说真话。',tone:'good',ops:[{type:'relationshipAffinity',id:r.id,delta:18,shared:1},{type:'stat',key:'family',delta:4}]},{weight:3,text:'谈话最后还是翻成了旧账，关系继续降温。',tone:'bad',ops:[{type:'relationshipAffinity',id:r.id,delta:-10,shared:1},{type:'stat',key:'happiness',delta:-4}]}]},
    {label:'结束这段关系',outcomes:[{weight:1,text:'你们正式结束了关系。很多共同生活留下的习惯还会持续一阵子。',tone:'bad',ops:[{type:'partnerSet',id:null},{type:'relationshipAffinity',id:r.id,delta:-30,shared:1}]}]}
  ],outcomes:[]};}
  majorChoice():ActionChoice|null{const s=this.store.get();if(s.age<18)return null;const living=s.relationships.filter(x=>x.alive);const mods=aggregateBuildMods(s);
    if(!s.partnerId){const candidate=living.filter(x=>x.affinity>=55&&x.sharedEvents>=2).sort((a,b)=>b.affinity-a.affinity)[0];if(candidate&&this.rng.next()<.14+(mods.spouse??0)*.15)return this.romanceChoice(candidate);}
    else{const p=living.find(x=>x.id===s.partnerId);if(p&&p.affinity<18&&this.rng.next()<.10)return this.relationshipCrisisChoice(p);}return null;
  }
  tick(){const s=this.store.get();if(s.age>=18&&s.relationships.filter(x=>x.alive).length<8&&this.rng.next()<.085){const npc=this.newPerson();this.store.dispatch({type:'REL_ADD',value:npc});this.store.dispatch({type:'HISTORY',entry:{age:s.age,title:`你认识了 ${npc.name}`,text:'一次普通的工作、饭局或生活交集，让这个人从背景里走了出来。',tone:'neutral',kind:'relationship',sourceId:'passive_meet'}});}
    const current=this.store.get();for(const r of current.relationships.filter(x=>x.alive)){
      if(this.rng.next()<.035+Math.max(0,current.age+r.ageGap-70)*.004){this.store.dispatch({type:'REL_DEATH',id:r.id,deathAge:Math.max(18,current.age-r.ageGap)});continue;}
      if(r.careerLevel<5&&this.rng.next()<.07)this.store.dispatch([{type:'REL_DELTA',id:r.id,history:'工作上往前走了一步。'},{type:'REL_CAREER',id:r.id,level:r.careerLevel+1}]);
      else if(this.rng.next()<.11){const positive=this.rng.next()<.72;this.store.dispatch({type:'REL_DELTA',id:r.id,affinity:positive?this.rng.int(3,8):this.rng.int(-5,-1),shared:1,history:positive?'你们这一年有过一次让关系更熟的交集。':'这一年你们联系少了一些。'});}
    }
    const alive=this.store.get().relationships.filter(x=>x.alive);if(alive.length>=2&&this.rng.next()<.08){const [a,b]=this.rng.shuffle(alive).slice(0,2);if(a&&b)this.store.dispatch({type:'SOCIAL_LINK',a:a.id,b:b.id,linkType:this.rng.next()<.82?'认识':'不对付'});}
  }
  materialize(_choice:ActionChoice,ops:EffectOp[]):EffectOp[]{return ops;}
  afterlives(){const s=this.store.get();return [...s.relationships].sort((a,b)=>((b.role==='伴侣'?1000:0)+b.affinity*6+b.sharedEvents*8)-((a.role==='伴侣'?1000:0)+a.affinity*6+a.sharedEvents*8)).slice(0,5).map(r=>{
      const job=this.base.CAREER_ROUTES.find(x=>x.id===r.careerRoute)?.titles[r.careerLevel-1]??'普通工作';
      if(!r.alive)return{...r,epilogue:`${r.name} 已经先你一步离开。你们共同经历的那些年份，后来仍被其他人偶尔提起。`};
      if(r.role==='伴侣'||r.id===s.partnerId)return{...r,epilogue:`你死后，${r.name}继续以${job}的身份生活。TA没有把你变成一句墓志铭，而是把共同生活留下的习惯带进了后来的很多年。`};
      if(r.affinity>=70)return{...r,epilogue:`${r.name}在你的葬礼上站了很久。后来TA继续做${job}，但提起真正改变过自己的人时，你始终排在很前面。`};
      if(r.affinity<0)return{...r,epilogue:`你死后，${r.name}没有突然把旧账一笔勾销。可几年以后再有人提起你，TA说得最多的反而不是恨，而是“那个人确实很难忘”。`};
      return{...r,epilogue:`${r.name}继续过自己的生活。你不是TA人生唯一的主角，但你们共同出现过的那几段年份没有彻底消失。`};});}
}
