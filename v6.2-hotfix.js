(() => {
  const A=window.APP,L=window.LIFE;if(!A||!L)return;
  const pick=x=>L.pick?L.pick(x):x[Math.floor(Math.random()*x.length)];
  const sample=(arr,n)=>{const p=[...new Set(arr)].filter(x=>L.CAREER_ROUTE_MAP?.[x]),out=[];while(p.length&&out.length<n)out.push(p.splice(Math.floor(Math.random()*p.length),1)[0]);return out};

  // 五十条路线真正进入毕业入口：每局只给 5 个，不把职业百科一次性拍在玩家脸上。
  A.graduationActions=()=>{
    const p=A.p,t=p?.tags||[];let pool=[];
    if(t.includes('医学专业'))pool=['doctor','nurse','pharma','biotech','scientist','professor'];
    else if(t.includes('警校路线'))pool=['police','firefighter','civil_service','lawyer','fitness'];
    else if(t.includes('数理工科'))pool=['software','ai_ml','data','cybersecurity','hardware','semiconductor','cloud','game_dev','game_ta','engineer','architect','biotech','scientist','product'];
    else if(t.includes('艺术传媒'))pool=['uxui','3d_art','animation_vfx','actor','singer','influencer','streamer','writer','journalist','advertising'];
    else if(t.includes('商科人文'))pool=['sales','consulting','finance','investment_banking','accounting','lawyer','product','advertising','civil_service','journalist'];
    else if(t.includes('职校路线')||t.includes('初中辍学'))pool=['manufacturing','electrician','mechanic','chef','construction','logistics','agriculture','fitness','influencer','entrepreneur'];
    else pool=['software','sales','teacher','civil_service','finance','engineer','product','hospitality','logistics','accounting','uxui','nurse','manufacturing','entrepreneur'];
    return sample(pool,5).map(id=>{const r=L.CAREER_ROUTE_MAP[id];return {id:`grad_${id}`,category:'毕业择业',title:`进入「${r.titles[0]}」`,desc:`从 ${r.titles[0]} 开始。这条路线后面还有 4 个明确阶段，不会一份职业干到退休。`,effects:{ambition:2,stability:1},special:{career:id,graduated:true},fixed:true,_v62CareerEntry:true};});
  };

  // 修复旧存档 / 随机伴侣可能拿到旧职业别名。
  const spouseBase=A.spouse;
  A.spouse=()=>{
    const s=spouseBase?.()||A.p?.spouse;if(!s)return s;
    const alias={designer:'uxui',developer:'software',researcher:'scientist',clerk:'civil_service',medtech:'pharma',creator:'influencer',freelancer:'3d_art'};
    if(alias[s.careerRoute])s.careerRoute=alias[s.careerRoute];
    if(!L.CAREER_ROUTE_MAP[s.careerRoute])s.careerRoute=pick(['teacher','nurse','software','sales','finance','civil_service','uxui','pharma','engineer','hospitality','writer','fitness','accounting','journalist','product']);
    return s;
  };
})();