import type {GameState,SynergyRef,TraitRef} from './types.js';

const hasTrait=(s:Readonly<GameState>,id:string)=>s.traits.some(t=>t.id===id);
const setCount=(s:Readonly<GameState>,set:string)=>s.traits.reduce((n,t)=>n+(t.sets?.includes(set)?1:0),0);
const synergy=(id:string,name:string,tier:number,desc:string,mods:Record<string,number>={}):SynergyRef=>({id,name,tier,desc,mods});

const SETS:Record<string,{name:string;desc:string;mods:Record<string,number>}>= {
  mind:{name:'思维回路',desc:'学习、研究与复杂判断开始互相增益。',mods:{success:.04}},
  body:{name:'生命底盘',desc:'健康与恢复形成更稳定的长期底盘。',mods:{death:.94,badGuard:.03}},
  social:{name:'关系磁场',desc:'人际、合作和关键关系更容易形成正循环。',mods:{spouse:.08,success:.025}},
  career:{name:'事业飞轮',desc:'职业积累开始产生复利。',mods:{income:.04,success:.03}},
  wealth:{name:'财富引擎',desc:'现金流、纪律与资产选择逐渐咬合。',mods:{income:.035,wealthOutcome:.06}},
  fortune:{name:'命运偏振',desc:'小概率好结果更容易进入你的世界线。',mods:{rare:.08,success:.02}},
  family:{name:'家族锚点',desc:'亲密关系和家庭支持更不容易在冲击中断裂。',mods:{spouse:.08,badGuard:.04}},
  risk:{name:'风险定价',desc:'你开始区分“敢赌”和“知道赔率”。',mods:{wealthOutcome:.05,badGuard:.025}},
  creative:{name:'创作共振',desc:'表达、审美与公众反馈开始形成独特风格。',mods:{rare:.06,success:.03}}
};

export const computeSynergies=(s:Readonly<GameState>):SynergyRef[]=>{
  const out:SynergyRef[]=[];
  for(const [id,def] of Object.entries(SETS)){
    const n=setCount(s,id);if(n<2)continue;const tier=n>=4?3:n===3?2:1;
    const scale=tier===3?2:tier===2?1.5:1;const mods=Object.fromEntries(Object.entries(def.mods).map(([k,v])=>[k,v*scale]));
    out.push(synergy(`set:${id}`,def.name,tier,`${def.desc} · ${n} 个相关命格`,mods));
  }
  if((hasTrait(s,'engineering_brain')&&hasTrait(s,'code_instinct'))||(setCount(s,'mind')>=3&&setCount(s,'career')>=2&&s.stats.intelligence>=82))
    out.push(synergy('tech_monster','技术怪物',2,'工程拆解、代码直觉和长期学习已经不再是三件事。',{success:.10,income:.06,rare:.05}));
  if((hasTrait(s,'compound_instinct')||hasTrait(s,'capital_boost'))&&setCount(s,'wealth')>=2&&s.stats.discipline>=68)
    out.push(synergy('compound_engine','复利发动机',2,'你开始把现金流、纪律和时间当成同一个系统。',{income:.08,wealthOutcome:.14,badGuard:.04}));
  if(setCount(s,'social')>=3&&s.stats.social>=78)
    out.push(synergy('social_flywheel','社交飞轮',2,'信息、贵人与合作开始反过来寻找你。',{spouse:.16,success:.07,rare:.05}));
  if(setCount(s,'family')>=2&&s.stats.family>=78)
    out.push(synergy('family_anchor','家族凝聚',2,'家庭不只是消耗项，也开始成为长期支持系统。',{badGuard:.08,spouse:.12}));
  if((hasTrait(s,'phoenix')||hasTrait(s,'comeback_body'))&&s.stats.stability>=78)
    out.push(synergy('phoenix_protocol','逆风协议',2,'坏事依旧会发生，但一次失败更难把整局直接打穿。',{badGuard:.12,death:.88,success:.04}));
  return out.sort((a,b)=>b.tier-a.tier||a.name.localeCompare(b.name));
};

export const aggregateBuildMods=(s:Readonly<GameState>)=>{
  const mods:Record<string,number>={death:1};
  const merge=(src:Record<string,number>={})=>{for(const [k,v0] of Object.entries(src)){const v=Number(v0||0);if(k==='death'){if(v>0)mods.death=(mods.death??1)*v;}else mods[k]=(mods[k]??0)+v;}};
  for(const t of s.traits)merge(t.mods??{});
  for(const y of s.synergies)merge(y.mods??{});
  return mods;
};

export const SYNERGY_CATALOG:Record<string,string>={
  'set:mind':'思维回路','set:body':'生命底盘','set:social':'关系磁场','set:career':'事业飞轮','set:wealth':'财富引擎','set:fortune':'命运偏振','set:family':'家族锚点','set:risk':'风险定价','set:creative':'创作共振',
  tech_monster:'技术怪物',compound_engine:'复利发动机',social_flywheel:'社交飞轮',family_anchor:'家族凝聚',phoenix_protocol:'逆风协议'
};
export const synergyName=(id:string)=>SYNERGY_CATALOG[id]??id.replace(/^set:/,'');

export interface HiddenRouteDef{id:string;title:string;desc:string;clue:string;}
export const HIDDEN_ROUTES:HiddenRouteDef[]=[
  {id:'solo_company',title:'一个人公司',desc:'把技术、产品与现金流压缩进一个人的执行系统。',clue:'技术型构筑 + 高自律 + 高野心'},
  {id:'capital_architect',title:'资本配置者',desc:'不再追单次暴利，而是建立一套可重复的风险定价系统。',clue:'财富构筑 + 投资者 + 稳定/自律'},
  {id:'signature_creator',title:'代表作路线',desc:'把审美、表达和长期投入收束成一件真正留下名字的作品。',clue:'创作构筑 + 高智力/社交'},
  {id:'family_dynasty',title:'家族掌舵者',desc:'让伴侣、子女、财富和长期责任形成一个共同体。',clue:'伴侣/子女 + 高家庭关系'},
  {id:'second_curve',title:'第二曲线',desc:'失败不是结束，而是下一条增长曲线的前置条件。',clue:'经历多次负面事件 + 高稳定/野心'},
  {id:'century_witness',title:'世纪见证者',desc:'你活得足够久，亲眼看着时代把长期问题一一改写。',clue:'高健康 + 高稳定 + 进入老年'}
];

export const computeHiddenRoutes=(s:Readonly<GameState>)=>{
  const syn=new Set(s.synergies.map(x=>x.id));const ids:string[]=[];
  if(s.age>=20&&(syn.has('tech_monster')||(setCount(s,'mind')>=3&&setCount(s,'career')>=2))&&s.stats.discipline>=72&&s.stats.ambition>=65)ids.push('solo_company');
  if(s.age>=22&&(syn.has('compound_engine')||setCount(s,'wealth')>=3)&&s.tags.includes('投资者')&&s.stats.stability>=65&&s.stats.discipline>=65)ids.push('capital_architect');
  if(s.age>=20&&setCount(s,'creative')>=2&&(s.stats.intelligence>=72||s.stats.social>=75))ids.push('signature_creator');
  if(s.partnerId&&s.children.length>0&&s.stats.family>=76)ids.push('family_dynasty');
  if(s.age>=32&&s.negative>=5&&s.stats.stability>=72&&s.stats.ambition>=62)ids.push('second_curve');
  if(s.age>=68&&s.stats.health>=82&&s.stats.stability>=72)ids.push('century_witness');
  return ids;
};

export const routeDef=(id:string)=>HIDDEN_ROUTES.find(x=>x.id===id);

const evolution=(id:string,s:Readonly<GameState>):{name:string;text:string}|null=>{
  switch(id){
    case'engineering_brain':return s.stats.intelligence>=92&&s.stats.discipline>=75?{name:'技术怪物',text:'你不再只是擅长拆问题，而是开始搭建别人依赖的系统。'}:null;
    case'code_instinct':return s.stats.intelligence>=96&&s.stats.discipline>=72?{name:'硅基直觉',text:'代码从工具变成了你理解世界的一种语言。'}:null;
    case'capital_boost':return s.wealthPeak>=1_000_000&&s.stats.stability>=70?{name:'资本飞轮',text:'赚钱不再依赖一次命中，而开始依赖系统。'}:null;
    case'compound_instinct':return s.wealthPeak>=2_000_000&&s.stats.discipline>=78?{name:'时间套利者',text:'你开始真正理解复利最稀缺的原料不是收益率，而是时间。'}:null;
    case'diligent':return s.stats.discipline>=94?{name:'长期主义者',text:'勤奋不再是意志力消耗，而变成了自动运行的习惯。'}:null;
    case'family_core':return s.stats.family>=92&&!!s.partnerId?{name:'家族锚点',text:'你开始成为一个家庭真正稳定的重心。'}:null;
    case'comeback_body':return s.negative>=7&&s.stats.stability>=88?{name:'不死鸟意志',text:'你已经不是第一次从低谷回来。失败开始失去威慑力。'}:null;
    case'aesthetic':return s.age>=28&&s.stats.intelligence>=82&&s.stats.happiness>=70?{name:'个人风格',text:'你终于不再只是“审美不错”，而拥有了别人一眼能认出的东西。'}:null;
    case'social_antenna':return s.stats.social>=92?{name:'人群雷达',text:'你越来越快地判断谁值得靠近、谁值得合作、谁该离远一点。'}:null;
    case'risk_radar':return s.tags.includes('投资者')&&s.stats.stability>=86?{name:'风险定价',text:'你不再问“会不会跌”，而是问“这个赔率值不值得承担”。'}:null;
    case'learning_machine':return s.stats.intelligence>=105&&s.stats.discipline>=82?{name:'自我迭代',text:'学习已经变成一套能持续升级自己的系统。'}:null;
    default:return null;
  }
};

export const findTraitEvolutions=(s:Readonly<GameState>)=>s.traits.flatMap(t=>{
  if((t.level??1)>=2)return[];const e=evolution(t.id,s);return e?[{id:t.id,...e}]:[];
});

export const endingFor=(s:Readonly<GameState>)=>{
  const routes=new Set(s.routesUnlocked);const syn=new Set(s.synergies.map(x=>x.id));
  if(s.wealthPeak>=20_000_000&&syn.has('compound_engine'))return{id:'compound_titan',title:'复利巨轮',desc:'你最终把时间、纪律和资本滚成了一个远大于起点的系统。'};
  if(routes.has('signature_creator')&&s.rareEvents>=5)return{id:'signature_work',title:'留下代表作的人',desc:'很多数字会被遗忘，但有人在多年后仍然记得你的作品。'};
  if(routes.has('family_dynasty')&&s.children.length>=1&&s.stats.family>=85)return{id:'family_anchor',title:'家族锚点',desc:'你没有独自赢下人生，而是把一群人的长期命运拧到了一起。'};
  if(s.age>=95)return{id:'century_witness',title:'世纪见证者',desc:'你活得足够久，看见无数所谓“永远不会变”的东西真的变了。'};
  if(routes.has('second_curve')&&s.positive>s.negative)return{id:'second_curve',title:'第二曲线',desc:'真正定义你的不是第一次起飞，而是跌下来以后又建立了另一条曲线。'};
  if(s.careerPeak>=5&&syn.has('tech_monster'))return{id:'system_builder',title:'系统建造者',desc:'你最后留下的不是一份职位，而是一套别人继续使用的系统。'};
  if(s.wealth<0)return{id:'unfinished_debt',title:'未结清的人生',desc:'账本最后仍是负数，但人生并没有因此只剩一个结论。'};
  return{id:'ordinary_epic',title:'普通人的史诗',desc:'没有神话结局，但几十年的选择仍然组成了一条只属于你的路径。'};
};

export const missedRouteHints=(s:Readonly<GameState>)=>HIDDEN_ROUTES.filter(r=>!s.routesUnlocked.includes(r.id)).slice(0,3).map(r=>r.clue);
export const traitDisplayName=(t:TraitRef)=>t.evolvedName??t.name;
