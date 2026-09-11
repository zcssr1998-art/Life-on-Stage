export type StatKey='health'|'happiness'|'intelligence'|'social'|'luck'|'ambition'|'stability'|'discipline'|'risk'|'family';
export type Stats=Record<StatKey,number>;
export type Tone='good'|'bad'|'neutral';
export type Gender='男'|'女';
export type RelationRole='认识的人'|'朋友'|'好友'|'挚友'|'对头'|'仇人'|'伴侣';
export type ResultRarity='normal'|'notable'|'prismatic';

export interface TraitRef{
  id:string;name:string;rarity:string;desc?:string;effects?:Partial<Stats>;sets?:string[];mods?:Record<string,number>;
  level?:number;evolvedName?:string;evolutionText?:string;
}
export interface SynergyRef{id:string;name:string;tier:number;desc:string;mods?:Record<string,number>;}
export interface CareerRoute{id:string;icon:string;group:string;titles:string[];salaries:number[];tags:string[];}
export interface Relationship{
  id:string;name:string;gender:Gender;avatar:number;metAge:number;ageGap:number;affinity:number;sharedEvents:number;
  role:RelationRole;alive:boolean;deathAge?:number;careerRoute:string;careerLevel:number;history:{age:number;text:string}[];
}
export interface SocialLink{a:string;b:string;type:string;since:number;}
export interface WorldState{economy:number;jobs:number;tech:number;market:number;medicine:number;conflict:number;housing:number;headline:string;}
export interface LedgerItem{source:string;label:string;amount:number;note?:string;}
export interface YearLedger{age:number;opening:number;closing:number;net:number;items:LedgerItem[];}
export interface HistoryEntry{age:number;title:string;text:string;tone:Tone;kind:string;changes?:string;sourceId?:string;rarity?:ResultRarity;}
export interface FateState{targetAge:number;triggered:boolean;branch?:string;snapshotKey?:string;worldline:number;}
export interface MetaProgress{
  version:1;runs:number;discoveredTraits:string[];discoveredSynergies:string[];discoveredRoutes:string[];endings:string[];echoes:string[];
}
export interface RunFlags{
  echo?:string;zhouResult?:ResultRarity;endingId?:string;endingTitle?:string;metaFinalized?:boolean;
}
export interface GameState{
  version:'V7';id:string;seed:number;name:string;gender:Gender;avatar:number;age:number;alive:boolean;deathReason:string;
  background:string;worldName:string;familyResources:number;stats:Stats;traits:TraitRef[];synergies:SynergyRef[];routesUnlocked:string[];
  tags:string[];wealth:number;wealthPeak:number;careerRoute:string|null;careerLevel:number;careerYears:number;careerPeak:number;education:string;
  relationships:Relationship[];socialLinks:SocialLink[];partnerId:string|null;children:{id:string;name:string;birthAge:number;alive:boolean}[];
  world:WorldState;history:HistoryEntry[];yearStories:HistoryEntry[];ledger:YearLedger|null;financeHistory:YearLedger[];
  seen:Record<string,number>;fate:FateState;positive:number;negative:number;neutral:number;rareEvents:number;score:number;runFlags:RunFlags;
  currentChoices:ActionChoice[];ui:{view:'game'|'info'|'collection'|'end';busy:boolean;message:string;fast:boolean};
}
export interface Requirement{
  minAge?:number;maxAge?:number;statsMin?:Partial<Stats>;statsMax?:Partial<Stats>;tagsAll?:string[];tagsAny?:string[];noTags?:string[];
  wealthMin?:number;wealthMax?:number;careerLevelMin?:number;hasRelationship?:boolean;traitsAll?:string[];synergiesAll?:string[];
}
export type EffectOp=
 |{type:'stat';key:StatKey;delta:number}
 |{type:'money';source:string;label:string;amount:number;note?:string}
 |{type:'tag';tag:string;mode?:'add'|'remove'}
 |{type:'careerXp';amount:number}
 |{type:'careerSet';route:string;level?:number}
 |{type:'relationshipAffinity';id?:string;delta:number;shared?:number}
 |{type:'relationshipCreate';relation?:RelationRole}
 |{type:'partnerSet';id:string|null}
 |{type:'education';value:string}
 |{type:'childAdd'}
 |{type:'traitAdd';id:string}
 |{type:'traitEvolve';id:string;name:string;text?:string};
export interface Outcome{weight:number;text:string;tone?:Tone;ops:EffectOp[];rarity?:ResultRarity;}
export interface ActionResponse{label:string;desc?:string;hint?:string;requires?:Requirement;outcomes:Outcome[];}
export interface ActionChoice{
  id:string;sourceEvent:string;category:string;title:string;desc:string;hint?:string;rare?:boolean;requires?:Requirement;
  outcomes:Outcome[];responses?:ActionResponse[];meta?:Record<string,unknown>;
}
export interface LegacyOption{label:string;hint?:string;text?:string;effects?:Partial<Stats>;addTags?:string[];requires?:any;special?:Record<string,any>;results?:any[];}
export interface LegacyEvent{id:string;category:string;minAge:number;maxAge:number;title:string;desc:string;options:LegacyOption[];requires?:any;weight?:number;hidden?:boolean;repeatable?:boolean;cooldown?:number;}
export interface BaseContent{ATTR:Record<string,{name:string;tip:string}>;WORLDS:any[];BACKGROUNDS:any[];PERSONALITIES:any[];TALENTS:any[];FLAWS:any[];TRAITS:any[];RARITY:Record<string,any>;ZHOU_CHOICES:any[];CAREER_ROUTES:CareerRoute[];}
