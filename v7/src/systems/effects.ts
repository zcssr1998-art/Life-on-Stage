import type {ActionChoice,Outcome} from '../types.js';
import {Store} from '../core.js';
import {RelationshipSystem} from './relationship.js';
import {CareerSystem} from './career.js';
const childNames=['小舟','小满','星禾','知夏','一川','青岚','向野','安宁','予澈','明川'];
export const applyOutcomeOps=(store:Store,choice:ActionChoice,outcome:Outcome,relationships:RelationshipSystem,career?:CareerSystem)=>{
  let ops=relationships.materialize(choice,[...outcome.ops]);const s=store.get();for(const op of ops){switch(op.type){
    case'stat':{const cur=s.stats[op.key],factor=op.delta>0?(cur<100?1:cur<130?.65:cur<160?.38:.18):1;store.dispatch({type:'STAT',key:op.key,delta:Math.round(op.delta*factor)});break;}
    case'money':store.dispatch({type:'MONEY',source:op.source,label:op.label,amount:op.amount,note:op.note});break;
    case'tag':store.dispatch({type:'TAG',tag:op.tag,mode:op.mode});break;
    case'careerXp':store.dispatch({type:'CAREER_XP',amount:op.amount});break;
    case'careerSet':{const route=career?.resolveRoute(op.route)??op.route;store.dispatch({type:'CAREER_SET',route,level:op.level});break;}
    case'relationshipAffinity':{const id=op.id??store.get().partnerId??store.get().relationships.at(-1)?.id;if(id)store.dispatch({type:'REL_DELTA',id,affinity:op.delta,shared:op.shared??1});break;}
    case'relationshipCreate':{const npc=relationships.newPerson(op.relation??'认识的人');if(npc){store.dispatch({type:'REL_ADD',value:npc});if(op.relation==='伴侣')store.dispatch({type:'PARTNER',id:npc.id});}break;}
    case'partnerSet':store.dispatch({type:'PARTNER',id:op.id});if(op.id)store.dispatch({type:'REL_ROLE',id:op.id,role:'伴侣'});break;
    case'education':store.dispatch({type:'EDUCATION',value:op.value});break;
    case'childAdd':store.dispatch({type:'CHILD_ADD',name:childNames[(store.get().seed+store.get().age+store.get().children.length)%childNames.length]!});break;
  }}
};
