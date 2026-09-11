import type {ActionChoice,ActionResponse,BaseContent,EffectOp,GameState,LegacyEvent,LegacyOption,Outcome,Requirement,StatKey} from './types.js';
import {RNG} from './core.js';

export interface ContentProvider{base():Promise<BaseContent>;events(age:number):Promise<LegacyEvent[]>;}
const stage=(age:number)=>age<=3?'toddler':age<=6?'preschool':age<=9?'primary':age<=12?'preteen':age<=15?'teenEarly':age<=18?'teenLate':age<=22?'college':age<=29?'twenties':age<=39?'thirties':age<=49?'forties':age<=59?'fifties':age<=69?'sixties':age<=84?'elder':'oldest';
export class BrowserContentProvider implements ContentProvider{
  private b?:BaseContent;private cache=new Map<string,LegacyEvent[]>();
  async base(){if(!this.b)this.b=await fetch(new URL('../generated/base.json',import.meta.url)).then(r=>r.json());return this.b!;}
  async events(age:number){const s=stage(age);if(!this.cache.has(s))this.cache.set(s,await fetch(new URL(`../generated/events-${s}.json`,import.meta.url)).then(r=>r.json()));return this.cache.get(s)!;}
}

export const requirement=(r:any={}):Requirement=>({
  minAge:r.minAge,maxAge:r.maxAge,statsMin:r.stats??r.statsMin,statsMax:r.statsMax,tagsAll:r.tagsAll,tagsAny:r.tagsAny,noTags:r.noTags,
  wealthMin:r.wealthMin,wealthMax:r.wealthMax,careerLevelMin:r.professionMin??r.careerLevelMin,hasRelationship:r.hasRelationship,
  traitsAll:r.traitsAll,synergiesAll:r.synergiesAll
});
export const passes=(s:Readonly<GameState>,r:Requirement={})=>{
  if(r.minAge!=null&&s.age<r.minAge)return false;if(r.maxAge!=null&&s.age>r.maxAge)return false;
  if(r.statsMin&&Object.entries(r.statsMin).some(([k,v])=>s.stats[k as StatKey]<(v??0)))return false;
  if(r.statsMax&&Object.entries(r.statsMax).some(([k,v])=>s.stats[k as StatKey]>(v??200)))return false;
  if(r.tagsAll?.some(t=>!s.tags.includes(t)))return false;if(r.tagsAny&&!r.tagsAny.some(t=>s.tags.includes(t)))return false;if(r.noTags?.some(t=>s.tags.includes(t)))return false;
  if(r.wealthMin!=null&&s.wealth<r.wealthMin)return false;if(r.wealthMax!=null&&s.wealth>r.wealthMax)return false;if(r.careerLevelMin!=null&&s.careerLevel<r.careerLevelMin)return false;
  if(r.hasRelationship!=null&&((s.relationships.some(x=>x.alive))!==r.hasRelationship))return false;
  if(r.traitsAll?.some(id=>!s.traits.some(t=>t.id===id)))return false;if(r.synergiesAll?.some(id=>!s.synergies.some(y=>y.id===id)))return false;
  return true;
};

const effectsOps=(effects:any={}):EffectOp[]=>Object.entries(effects).filter(([,v])=>Number.isFinite(v)).map(([k,v])=>({type:'stat',key:k as StatKey,delta:Number(v)}));
const specialOps=(sp:any={}):EffectOp[]=>{
  const out:EffectOp[]=[];
  if(Number.isFinite(sp.wealth)&&sp.wealth!==0)out.push({type:'money',source:'event',label:'事件现金流',amount:Number(sp.wealth)});
  if(sp.career)out.push({type:'careerSet',route:String(sp.career)});
  if(sp.addTag)out.push({type:'tag',tag:String(sp.addTag)});
  if(sp.removeTag)out.push({type:'tag',tag:String(sp.removeTag),mode:'remove'});
  if(sp.education)out.push({type:'education',value:String(sp.education)});
  if(sp.haveChild)out.push({type:'childAdd'});
  if(sp.createSpouse||sp.marry)out.push({type:'relationshipCreate',relation:'伴侣'});
  return out;
};
const optionOutcomes=(o:LegacyOption):Outcome[]=>{
  if(Array.isArray(o.results)&&o.results.length)return o.results.map((z:any)=>({
    weight:z.weight??1,text:z.text??o.text??o.label,tone:z.good?'good':z.bad?'bad':undefined,
    ops:[...effectsOps(z.effects),...(z.addTags??[]).map((tag:string)=>({type:'tag',tag} as EffectOp)),...specialOps(z.special)]
  }));
  return[{weight:1,text:o.text??o.label,tone:undefined,ops:[...effectsOps(o.effects),...(o.addTags??[]).map(tag=>({type:'tag',tag} as EffectOp)),...specialOps(o.special)]}];
};
const optionResponse=(o:LegacyOption):ActionResponse=>({label:o.label,desc:o.text,hint:o.hint,requires:requirement(o.requires),outcomes:optionOutcomes(o)});
export const inferEventTheme=(e:LegacyEvent)=>{
  if(e.theme)return e.theme;const x=`${e.category} ${e.title} ${e.desc}`;
  if(/考试|学校|学习|作业|课程|专业|大学|老师/.test(x))return'学业';if(/父母|家庭|孩子|子女|伴侣|家人|亲子/.test(x))return'家庭';
  if(/恋爱|婚姻|约会|分手|感情/.test(x))return'关系';if(/工作|职业|升职|公司|老板|同事|裁员|创业/.test(x))return'事业';
  if(/健康|医院|体检|疾病|运动|睡眠|医生/.test(x))return'健康';if(/投资|财富|钱|房|资产|债|基金|股票/.test(x))return'财务';
  if(/朋友|社交|聚会|圈子|同学/.test(x))return'社交';if(/迁移|旅行|城市|出国|搬家/.test(x))return'迁移';if(/AI|技术|代码|工程|研究|科技/.test(x))return'技术';
  if(/创作|作品|艺术|音乐|内容|写作|设计/.test(x))return'创作';return e.category||'生活';
};
export const eventToChoice=(e:LegacyEvent,s:Readonly<GameState>,_rng:RNG):ActionChoice|null=>{
  const responses=(e.options??[]).map(optionResponse);if(!responses.length||!responses.some(r=>passes(s,r.requires)))return null;
  return{id:e.id,sourceEvent:e.id,category:e.category,title:e.title,desc:e.desc||'这一年发生了一件需要你回应的事。',
    hint:e.hidden?'隐藏事件：某些构筑才会让它浮出水面。':'先选择事件，再决定你怎么回应。',rare:!!e.hidden,requires:requirement(e.requires),outcomes:[],responses,
    meta:{repeatable:e.repeatable,cooldown:e.cooldown,weight:e.weight??1,theme:inferEventTheme(e),stageTag:e.stageTag,minAge:e.minAge,maxAge:e.maxAge}};
};
