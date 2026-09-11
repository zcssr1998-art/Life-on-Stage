import type {ActionChoice,ActionResponse,BaseContent,EffectOp,GameState,LegacyEvent,LegacyOption,Outcome,Requirement,StatKey} from './types.js';
import {RNG} from './core.js';

export interface ContentProvider{base():Promise<BaseContent>;events(age:number):Promise<LegacyEvent[]>;}
const stage=(age:number)=>age<=12?'childhood':age<=22?'youth':age<=59?'adult':'senior';
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
export const eventToChoice=(e:LegacyEvent,s:Readonly<GameState>,_rng:RNG):ActionChoice|null=>{
  const responses=(e.options??[]).map(optionResponse);if(!responses.length||!responses.some(r=>passes(s,r.requires)))return null;
  return{id:e.id,sourceEvent:e.id,category:e.category,title:e.title,desc:e.desc||'这一年发生了一件需要你回应的事。',
    hint:e.hidden?'隐藏事件：某些构筑才会让它浮出水面。':'先选择事件，再决定你怎么回应。',rare:!!e.hidden,requires:requirement(e.requires),outcomes:[],responses,
    meta:{repeatable:e.repeatable,cooldown:e.cooldown,weight:e.weight??1}};
};
