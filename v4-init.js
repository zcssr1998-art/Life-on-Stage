window.APP = window.APP || {};
(() => {
  const A=window.APP,L=window.LIFE,M=document.getElementById('modal');
  if(L.TAG_DEFS) L.TAG_DEFS['家族继承']={kind:'state',tip:'传承状态：你不是随机新开，而是上一代留下的子女。部分属性倾向和遗产会进入本局。'};

  A.load=()=>{
    try{
      const p=JSON.parse(localStorage.getItem(L.STORAGE_KEY));
      if(p&&p.alive){
        A.p=p;A.p.world=A.p.world||L.WORLDS[0];A.p.education=A.p.education||'未记录';A.p.children=A.p.children||[];A.p.tags=A.p.tags||[];A.p.seen=A.p.seen||{};
        A.lastResult=null;A.prep();A.note('已读取 V4 本地存档');return;
      }
    }catch{}
    A.note('没有可读取的 V4 存档');
  };

  A.asChild=cid=>{
    const d=A.dynasty(),m=d.members.find(x=>x.id===cid);if(!m)return;
    const base={health:58,happiness:55,intelligence:55,social:50,luck:50,ambition:50,stability:50,discipline:50,risk:50,family:68};
    Object.assign(base,m.inheritedStats||{});Object.keys(base).forEach(k=>base[k]=L.clamp(Math.round(base[k]*.88+L.rand(1,10)+(m.legacyBoost||0)*2)));
    const pe=L.pick(L.PERSONALITIES),ta=L.pick(L.TALENTS),fl=L.pick(L.FLAWS),w=L.pick(L.WORLDS);
    [pe[1],ta[1],fl[1]].forEach(mod=>Object.entries(mod).forEach(([k,v])=>base[k]=L.clamp((base[k]||50)+v)));
    A.p={id:m.id,name:m.name,avatar:m.avatar,age:1,seed:L.rand(100000000,999999999),world:w,background:`第${m.generation}代家族继承人`,personality:pe[0],talent:ta[0],flaw:fl[0],stats:base,tags:['家族继承'],wealth:(m.legacyCash||0),wealthPeak:(m.legacyCash||0),career:'none',salaryMul:1,education:'未入学',graduationAge:null,maritalPlan:null,spouse:null,children:[],history:[{age:1,title:'🌳 家族传承开局',text:`你作为第 ${m.generation} 代主角接棒。上一代的资源和部分属性倾向进入了这一局。`,changes:`继承资金 ${L.fmtMoney(m.legacyCash||0)}`,type:'synergy'}],seen:{},blockedInvestment:false,generation:m.generation,parentId:m.parentId,legacyBoost:m.legacyBoost||0,alive:true,deathReason:'',score:0,rareEnding:null};
    A.sync(A.p);A.save();A.close();A.lastResult=null;A.prep();
  };

  const g=document.getElementById('genealogyBtn'),s=document.getElementById('shareBtn');
  if(g)g.onclick=A.tree;
  if(s)s.onclick=async()=>{try{if(navigator.share)await navigator.share({title:'人生随机实验室 V4',text:'来 Roll 一把一键一年的肉鸽人生',url:location.href});else{await navigator.clipboard.writeText(location.href);A.note('分享链接已复制')}}catch{}};
  M.onclick=e=>{if(e.target===M)A.close()};
  try{const p=JSON.parse(localStorage.getItem(L.STORAGE_KEY));if(p&&p.alive){A.p=p;A.p.world=A.p.world||L.WORLDS[0];A.p.education=A.p.education||'未记录';A.p.children=A.p.children||[];A.p.tags=A.p.tags||[];A.p.seen=A.p.seen||{};A.prep();}else{A.d=A.draft();A.startView();}}catch{A.d=A.draft();A.startView();}
})();
