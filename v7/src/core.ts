import type {GameState,StatKey,YearLedger,HistoryEntry,ActionChoice} from './types.js';

export class RNG{
  private s:number;
  constructor(seed:number){this.s=(seed>>>0)||0x9e3779b9;}
  next(){let x=this.s;x^=x<<13;x^=x>>>17;x^=x<<5;this.s=x>>>0;return this.s/4294967296;}
  int(a:number,b:number){return Math.floor(this.next()*(b-a+1))+a;}
  pick<T>(a:T[]):T{return a[Math.floor(this.next()*a.length)]!;}
  weighted<T>(a:T[],weight:(x:T)=>number):T{let sum=a.reduce((s,x)=>s+Math.max(0,weight(x)),0),r=this.next()*sum;for(const x of a){r-=Math.max(0,weight(x));if(r<=0)return x;}return a[a.length-1]!;}
  shuffle<T>(a:T[]):T[]{const o=[...a];for(let i=o.length-1;i>0;i--){const j=this.int(0,i);[o[i],o[j]]=[o[j]!,o[i]!];}return o;}
}

export type Command=
 |{type:'STAT';key:StatKey;delta:number}
 |{type:'MONEY';source:string;label:string;amount:number;note?:string}
 |{type:'TAG';tag:string;mode?:'add'|'remove'}
 |{type:'CAREER_SET';route:string|null;level?:number}
 |{type:'CAREER_XP';amount:number}
 |{type:'REL_ADD';value:GameState['relationships'][number]}
 |{type:'REL_DELTA';id:string;affinity?:number;shared?:number;history?:string}
 |{type:'REL_ROLE';id:string;role:GameState['relationships'][number]['role']}
 |{type:'REL_CAREER';id:string;level:number}
 |{type:'REL_DEATH';id:string;deathAge:number}
 |{type:'PARTNER';id:string|null}
 |{type:'SOCIAL_LINK';a:string;b:string;linkType:string}
 |{type:'CHILD_ADD';name:string}
 |{type:'EDUCATION';value:string}
 |{type:'WORLD';patch:Partial<GameState['world']>}
 |{type:'HISTORY';entry:HistoryEntry}
 |{type:'SET_CHOICES';choices:ActionChoice[]}
 |{type:'ADVANCE_AGE'}
 |{type:'DIE';reason:string}
 |{type:'UI_VIEW';view:GameState['ui']['view']}
 |{type:'UI_BUSY';value:boolean}
 |{type:'UI_MESSAGE';value:string}
 |{type:'RESET_YEAR';opening:number}
 |{type:'SEEN';id:string;age:number}
 |{type:'FATE_PATCH';patch:Partial<GameState['fate']>}
 |{type:'FINALIZE_LEDGER'};

const statCap=(v:number)=>Math.max(0,Math.min(200,Math.round(v)));
export class Store{
  private state:GameState;private listeners=new Set<(s:GameState)=>void>();
  constructor(initial:GameState){this.state=structuredClone(initial);this.assert();}
  get():Readonly<GameState>{return this.state;}
  snapshot():GameState{return structuredClone(this.state);}
  replace(next:GameState){this.state=structuredClone(next);this.assert();this.emit();}
  subscribe(fn:(s:GameState)=>void){this.listeners.add(fn);return()=>this.listeners.delete(fn);}
  dispatch(cmd:Command|Command[]){for(const c of(Array.isArray(cmd)?cmd:[cmd]))this.apply(c);this.assert();this.emit();}
  transact(fn:()=>Command[]){const before=this.snapshot();try{this.dispatch(fn());}catch(e){this.state=before;this.emit();throw e;}}
  private emit(){for(const l of this.listeners)l(this.state);}
  private apply(c:Command){const s=this.state;switch(c.type){
    case'STAT':s.stats[c.key]=statCap(s.stats[c.key]+c.delta);break;
    case'MONEY':{if(!s.ledger)throw new Error('MONEY outside active ledger');const amt=Math.round(c.amount);if(!amt)break;s.wealth+=amt;s.wealthPeak=Math.max(s.wealthPeak,s.wealth);s.ledger.items.push({source:c.source,label:c.label,amount:amt,note:c.note});break;}
    case'TAG':if((c.mode??'add')==='add'){if(!s.tags.includes(c.tag))s.tags.push(c.tag);}else s.tags=s.tags.filter(x=>x!==c.tag);break;
    case'CAREER_SET':s.careerRoute=c.route;s.careerLevel=c.route?Math.max(1,Math.min(5,c.level??1)):0;s.careerYears=0;s.careerPeak=Math.max(s.careerPeak,s.careerLevel);break;
    case'CAREER_XP':s.careerYears+=c.amount;break;
    case'REL_ADD':if(!s.relationships.some(x=>x.id===c.value.id))s.relationships.push(structuredClone(c.value));break;
    case'REL_DELTA':{const r=s.relationships.find(x=>x.id===c.id);if(!r)break;r.affinity=Math.max(-100,Math.min(100,r.affinity+(c.affinity??0)));r.sharedEvents+=c.shared??0;if(c.history)r.history.unshift({age:s.age,text:c.history});r.history=r.history.slice(0,12);break;}
    case'REL_ROLE':{const r=s.relationships.find(x=>x.id===c.id);if(r)r.role=c.role;break;}
    case'REL_CAREER':{const r=s.relationships.find(x=>x.id===c.id);if(r)r.careerLevel=Math.max(1,Math.min(5,c.level));break;}
    case'REL_DEATH':{const r=s.relationships.find(x=>x.id===c.id);if(r){r.alive=false;r.deathAge=c.deathAge;if(s.partnerId===r.id)s.partnerId=null;}break;}
    case'PARTNER':s.partnerId=c.id;break;
    case'SOCIAL_LINK':if(!s.socialLinks.some(x=>((x.a===c.a&&x.b===c.b)||(x.a===c.b&&x.b===c.a))&&x.type===c.linkType))s.socialLinks.push({a:c.a,b:c.b,type:c.linkType,since:s.age});break;
    case'CHILD_ADD':s.children.push({id:`ch_${s.seed}_${s.age}_${s.children.length}`,name:c.name,birthAge:s.age,alive:true});break;
    case'EDUCATION':s.education=c.value;break;
    case'WORLD':Object.assign(s.world,c.patch);break;
    case'HISTORY':s.history.unshift(c.entry);s.history=s.history.slice(0,1200);s.yearStories.unshift(c.entry);s.yearStories=s.yearStories.slice(0,3);c.entry.tone==='good'?s.positive++:c.entry.tone==='bad'?s.negative++:s.neutral++;if(c.entry.kind==='rare')s.rareEvents++;break;
    case'SET_CHOICES':s.currentChoices=c.choices;break;
    case'ADVANCE_AGE':s.age++;s.yearStories=[];break;
    case'DIE':s.alive=false;s.deathReason=c.reason;s.ui.view='end';break;
    case'UI_VIEW':s.ui.view=c.view;break;
    case'UI_BUSY':s.ui.busy=c.value;break;
    case'UI_MESSAGE':s.ui.message=c.value;break;
    case'RESET_YEAR':s.ledger={age:s.age,opening:c.opening,closing:c.opening,net:0,items:[]};s.yearStories=[];break;
    case'SEEN':s.seen[c.id]=c.age;break;
    case'FATE_PATCH':Object.assign(s.fate,c.patch);break;
    case'FINALIZE_LEDGER':if(s.ledger){s.ledger.closing=s.wealth;s.ledger.net=s.ledger.closing-s.ledger.opening;s.financeHistory.unshift(structuredClone(s.ledger));s.financeHistory=s.financeHistory.slice(0,140);}break;
  }}
  private assert(){const s=this.state;if(!Number.isFinite(s.wealth))throw new Error('wealth is not finite');for(const[k,v]of Object.entries(s.stats))if(!Number.isFinite(v)||v<0||v>200)throw new Error(`bad stat ${k}:${v}`);if(s.partnerId&&!s.relationships.some(x=>x.id===s.partnerId&&x.alive))throw new Error('partnerId points to unavailable relationship');if(s.ledger){const sum=s.ledger.items.reduce((a,b)=>a+b.amount,0);const delta=s.wealth-s.ledger.opening;if(Math.abs(sum-delta)>1)throw new Error(`money audit mismatch ${sum} != ${delta}`);}}
}

export interface Persistence{save(state:GameState):Promise<void>;load():Promise<GameState|null>;putSnapshot(key:string,state:GameState):Promise<void>;getSnapshot(key:string):Promise<GameState|null>;}
export class MemoryPersistence implements Persistence{private saveState:GameState|null=null;private snaps=new Map<string,GameState>();async save(s:GameState){this.saveState=structuredClone(s)}async load(){return this.saveState?structuredClone(this.saveState):null}async putSnapshot(k:string,s:GameState){this.snaps.set(k,structuredClone(s))}async getSnapshot(k:string){const s=this.snaps.get(k);return s?structuredClone(s):null}}
export class BrowserPersistence implements Persistence{
  private fallback=new MemoryPersistence();private dbp:Promise<IDBDatabase|null>;
  constructor(){this.dbp=this.open();}
  private open(){if(typeof indexedDB==='undefined')return Promise.resolve(null);return new Promise<IDBDatabase|null>(res=>{const q=indexedDB.open('life-on-stage-v7',1);q.onupgradeneeded=()=>{const db=q.result;if(!db.objectStoreNames.contains('kv'))db.createObjectStore('kv')};q.onsuccess=()=>res(q.result);q.onerror=()=>res(null);});}
  private async put(k:string,v:unknown){const db=await this.dbp;if(!db){return false}return new Promise<boolean>(res=>{const tx=db.transaction('kv','readwrite');tx.objectStore('kv').put(v,k);tx.oncomplete=()=>res(true);tx.onerror=()=>res(false);});}
  private async get<T>(k:string){const db=await this.dbp;if(!db)return null;return new Promise<T|null>(res=>{const tx=db.transaction('kv','readonly'),q=tx.objectStore('kv').get(k);q.onsuccess=()=>res((q.result??null)as T|null);q.onerror=()=>res(null);});}
  async save(s:GameState){if(!(await this.put('save',s)))await this.fallback.save(s)}
  async load(){return await this.get<GameState>('save')??await this.fallback.load()}
  async putSnapshot(k:string,s:GameState){if(!(await this.put(`snap:${k}`,s)))await this.fallback.putSnapshot(k,s)}
  async getSnapshot(k:string){return await this.get<GameState>(`snap:${k}`)??await this.fallback.getSnapshot(k)}
}
