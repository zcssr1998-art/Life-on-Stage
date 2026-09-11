const { test, expect } = require('@playwright/test');

const BASE='http://127.0.0.1:4173/?e2e=1';
const UA='Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1';

async function openGame(page){
  await page.goto(BASE,{waitUntil:'networkidle'});
  await expect(page.locator('#startBtn')).toBeVisible();
  await page.locator('#startBtn').click();
  await page.evaluate(()=>{window.APP.deathCheck=()=>false});
  await expect(page.locator('.game-screen')).toBeVisible();
}

async function uiMetrics(page){
  return page.evaluate(()=>{
    const card=document.querySelector('.v62-action strong');
    const stat=document.querySelector('.v62-state span');
    const story=document.querySelector('.v62-latest-head strong');
    const screen=document.querySelector('.game-screen');
    if(!card||!stat||!story||!screen)throw new Error(`V6.2 UI node missing: card=${!!card} stat=${!!stat} story=${!!story} screen=${!!screen}`);
    const root=getComputedStyle(document.documentElement),screenStyle=getComputedStyle(screen);
    const kids=[...screen.children].filter(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return s.display!=='none'&&r.height>0}).map(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return{c:String(el.className),top:r.top,bottom:r.bottom,height:r.height,display:s.display,flex:s.flex}}).sort((a,b)=>a.top-b.top);
    let maxGap=0,gapPair='';for(let i=1;i<kids.length;i++){const g=kids[i].top-kids[i-1].bottom;if(g>maxGap){maxGap=g;gapPair=`${kids[i-1].c} -> ${kids[i].c}`}}
    const cards=[...document.querySelectorAll('.action-card[data-i]:not([disabled])')];
    const blocked=cards.filter(el=>{const r=el.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,hit=document.elementFromPoint(x,y);return !hit||!(hit===el||el.contains(hit));}).length;
    const actions=document.querySelector('.v55-actions')?.getBoundingClientRect();
    const firstCard=document.querySelector('.v55-actions .action-card')?.getBoundingClientRect();
    const latest=document.querySelector('.v62-latest')?.getBoundingClientRect();
    const latestHead=document.querySelector('.v62-latest-head')?.getBoundingClientRect();
    const latestBody=document.querySelector('.v62-latest-box,.v62-latest.empty>p')?.getBoundingClientRect();
    return {
      innerWidth:window.innerWidth,innerHeight:window.innerHeight,uiScale:document.documentElement.dataset.uiScale||'',
      card:parseFloat(getComputedStyle(card).fontSize),stat:parseFloat(getComputedStyle(stat).fontSize),story:parseFloat(getComputedStyle(story).fontSize),
      choiceVar:root.getPropertyValue('--v57-choice-title').trim(),overflow:screen.scrollHeight-screen.clientHeight,maxGap,gapPair,blocked,kids,
      display:screenStyle.display,rowGap:screenStyle.rowGap,
      actionInnerGap:actions&&firstCard?firstCard.top-actions.top:null,
      latestInnerGap:latest&&latestBody?latestBody.top-(latestHead?.bottom||latest.top):null,
      actionsHeight:actions?.height||0,latestHeight:latest?.height||0
    };
  });
}

test('V6.2 adaptive UI uses available room without giant blank rows',async({browser})=>{
  const smallCtx=await browser.newContext({viewport:{width:375,height:667},screen:{width:375,height:667},deviceScaleFactor:2,isMobile:true,hasTouch:true,userAgent:UA});
  const largeCtx=await browser.newContext({viewport:{width:430,height:932},screen:{width:430,height:932},deviceScaleFactor:3,isMobile:true,hasTouch:true,userAgent:UA});
  try{
    const small=await smallCtx.newPage(),large=await largeCtx.newPage();
    await openGame(small);await openGame(large);
    const a=await uiMetrics(small),b=await uiMetrics(large);
    console.log('SMALL_LAYOUT',JSON.stringify(a));console.log('LARGE_LAYOUT',JSON.stringify(b));
    expect(a.innerWidth).toBe(375);expect(b.innerWidth).toBe(430);expect(a.innerHeight).toBe(667);expect(b.innerHeight).toBe(932);
    expect(['compact','normal','large','xl']).toContain(a.uiScale);expect(['large','xl']).toContain(b.uiScale);
    expect(a.card).toBeGreaterThanOrEqual(9);expect(b.card).toBeGreaterThanOrEqual(a.card);
    expect(a.stat).toBeGreaterThanOrEqual(9);expect(b.stat).toBeGreaterThanOrEqual(a.stat);
    expect(a.story).toBeGreaterThanOrEqual(9);expect(b.story).toBeGreaterThanOrEqual(a.story);
    expect(a.overflow).toBeLessThanOrEqual(8);expect(b.overflow).toBeLessThanOrEqual(8);
    expect(a.maxGap).toBeLessThan(18);expect(b.maxGap).toBeLessThan(20);
    expect(a.actionInnerGap).toBeLessThan(12);expect(b.actionInnerGap).toBeLessThan(12);
    expect(a.blocked).toBe(0);expect(b.blocked).toBe(0);
    expect(a.kids.length).toBeGreaterThanOrEqual(6);expect(b.kids.length).toBeGreaterThanOrEqual(6);
  }finally{await smallCtx.close();await largeCtx.close();}
});

test('desktop V6.2 layout has no screenshot-scale empty bands',async({browser})=>{
  const ctx=await browser.newContext({viewport:{width:1440,height:1000}});
  try{
    const page=await ctx.newPage();await openGame(page);const m=await uiMetrics(page);console.log('DESKTOP_LAYOUT',JSON.stringify(m));
    expect(m.maxGap).toBeLessThan(24);expect(m.blocked).toBe(0);expect(m.overflow).toBeLessThanOrEqual(8);expect(m.actionInnerGap).toBeLessThan(12);
    const latestHeight=await page.locator('.v62-latest').evaluate(el=>el.getBoundingClientRect().height);expect(latestHeight).toBeLessThan(210);
    const worldHeight=await page.locator('.v6-world').evaluate(el=>el.getBoundingClientRect().height);expect(worldHeight).toBeLessThan(100);
    const actionRects=await page.locator('.v62-action').evaluateAll(xs=>xs.map(x=>{const r=x.getBoundingClientRect();return{w:r.width,h:r.height}}));
    expect(actionRects.length).toBe(5);expect(Math.min(...actionRects.map(x=>x.w))).toBeGreaterThan(300);expect(Math.min(...actionRects.map(x=>x.h))).toBeGreaterThan(45);
  }finally{await ctx.close();}
});

test('mobile WebKit survives V6.2 long sessions, spouse UI, black-box states, singularity and rewind', async ({ page }) => {
  const pageErrors=[];page.on('pageerror',e=>pageErrors.push(String(e)));page.on('dialog',d=>d.accept());
  await page.goto('/?e2e=1', { waitUntil: 'networkidle' });await expect(page.locator('#startBtn')).toBeVisible();
  const pool=await page.evaluate(()=>{const counts={};for(const t of window.LIFE.TRAITS)counts[t.rarity]=(counts[t.rarity]||0)+1;return{total:window.LIFE.TRAITS.length,counts,micro:window.LIFE.MICRO_EVENTS?.length||0,routes:window.LIFE.CAREER_ROUTES?.length||0}});
  expect(pool.total).toBe(200);expect(pool.counts).toEqual({SSS:20,SS:30,S:45,A:60,B:35,P:10});expect(pool.micro).toBeGreaterThanOrEqual(45);expect(pool.routes).toBe(50);
  const prismRate=await page.evaluate(()=>{let prism=0,n=3000;for(let i=0;i<n;i++)if(window.APP.rollTraits(5).some(t=>t.rarity==='P'))prism++;return prism/n});expect(prismRate).toBeGreaterThan(.03);expect(prismRate).toBeLessThan(.07);
  await expect(page.locator('.v62-origin-grid article')).toHaveCount(8);await expect(page.locator('.v62-start-world')).toBeVisible();await expect(page.locator('.start-traits .trait-chip')).toHaveCount(5);
  await page.locator('#rerollBtn').click();await page.locator('#startBtn').click();await page.evaluate(()=>{window.APP.deathCheck=()=>false});
  await expect(page.locator('.action-card[data-i]')).toHaveCount(5);await expect(page.locator('.v62-state')).toHaveCount(10);await expect(page.locator('.v62-trait')).toHaveCount(5);await expect(page.locator('.v62-spouse-card')).toHaveCount(0);await expect(page.locator('.v61-fogbar')).toHaveCount(0);
  const statVisual=await page.evaluate(()=>({bars:document.querySelectorAll('.v61-fogbar,.v55-bar').length,states:[...document.querySelectorAll('.v62-state b')].map(x=>x.textContent)}));expect(statVisual.bars).toBe(0);if(statVisual.states.some(x=>/\d/.test(x)))throw new Error(`exact stat leaked into UI: ${statVisual.states.join('|')}`);
  const initialLayout=await uiMetrics(page);console.log('MOBILE_INITIAL',JSON.stringify(initialLayout));expect(initialLayout.maxGap).toBeLessThan(20);expect(initialLayout.actionInnerGap).toBeLessThan(12);expect(initialLayout.blocked).toBe(0);
  await page.locator('.action-card[data-i]').first().click();await page.waitForFunction(()=>window.APP?.p?.age===2||!window.APP?.p?.alive);await expect(page.locator('.action-card[data-i]')).toHaveCount(4);
  await expect(page.locator('.v62-latest-box')).toHaveCount(1);const storyCount=await page.locator('.v62-latest-box .v62-story').count();expect(storyCount).toBeGreaterThanOrEqual(1);expect(storyCount).toBeLessThanOrEqual(3);if(storyCount>1)expect(await page.locator('.v62-latest-box hr').count()).toBe(storyCount-1);
  const storyText=await page.locator('.v62-story p').first().textContent();expect((storyText||'').length).toBeGreaterThan(18);
  const storyChanges=await page.locator('.v62-story small').allTextContents();if(storyChanges.some(x=>/(健康|幸福|智力|社交|运气|野心|稳定|自律|风险偏好|家庭关系)[+-]\d/.test(x)))throw new Error('exact stat delta leaked in latest story');
  const actionRichness=await page.locator('.v62-action').evaluateAll(xs=>xs.map(x=>({title:x.querySelector('strong')?.textContent?.trim()||'',desc:x.querySelector('p')?.textContent?.trim()||'',chips:x.querySelectorAll('.v62-action-chips i').length,hint:x.querySelector('small')?.textContent?.trim()||''})));if(actionRichness.some(x=>x.title.length<4||x.desc.length<2||x.chips<3))throw new Error(`thin action card: ${JSON.stringify(actionRichness)}`);
  const statScale=await page.evaluate(()=>{const A=window.APP;A.p.stats.health=137;A.clampStats(A.p);const a=A.p.stats.health;A.p.stats.health=999;A.clampStats(A.p);const b=A.p.stats.health;A.p.stats.health=88;A.render();return{a,b}});expect(statScale.a).toBe(137);expect(statScale.b).toBe(200);
  await page.evaluate(()=>{window.APP.spouse();window.APP.v62SpouseYear();window.APP.render()});await expect(page.locator('.v62-spouse-card')).toBeVisible();const spouseText=await page.locator('.v62-spouse-card').innerText();expect(spouseText).toMatch(/伴侣/);expect(spouseText).toMatch(/男|女/);expect(spouseText).toMatch(/岁/);expect(spouseText).toMatch(/月收入约/);expect(spouseText).toMatch(/今年：/);
  const spouseData=await page.evaluate(()=>({gender:APP.p.spouse.gender,age:APP.v62SpouseAge(),job:APP.v62SpouseJob()?.name,salary:APP.v62SpouseJob()?.salary,history:APP.p.spouse.history?.length||0}));expect(['男','女']).toContain(spouseData.gender);expect(spouseData.age).toBeGreaterThanOrEqual(18);expect(spouseData.job.length).toBeGreaterThan(1);expect(spouseData.salary).toBeGreaterThanOrEqual(0);expect(spouseData.history).toBeGreaterThan(0);
  await page.locator('.nav-btn[data-view="info"]').click();await expect(page.locator('.full-history')).toBeVisible();await expect(page.locator('.stats-grid')).toHaveCount(0);await page.locator('.nav-btn[data-view="game"]').click();
  const career=await page.evaluate(()=>{APP.setJob('software');const before=APP.job(APP.p.career).name;APP.v62Promote();APP.render();return{before,after:APP.job(APP.p.career).name,level:APP.p.careerLevel,routes:LIFE.CAREER_ROUTES.length}});expect(career.routes).toBe(50);expect(career.level).toBe(2);expect(career.after).not.toBe(career.before);
  const leaks=await page.evaluate(()=>{const A=window.APP;A.p.age=8;A.p.graduationAge=null;A.buildYear();const young=A.year.map(x=>`${x.title} ${x.desc}`).join('|');A.p.age=78;A.buildYear();const old=A.year.map(x=>`${x.title} ${x.desc}`).join('|');return{young,old}});expect(leaks.young).not.toMatch(/创业|融资|房贷|结婚|离婚|退休|杠杆/);expect(leaks.old).not.toMatch(/幼儿园|小学|班主任|同桌|作业|家长会|过家家|高考|中考/);
  const singularityAge=await page.evaluate(()=>{const A=window.APP,s=A.v61EnsureSingularity();A.p.age=s.age;A.p.graduationAge=null;A.buildYear();return s.age});expect(singularityAge).toBeGreaterThanOrEqual(17);expect(singularityAge).toBeLessThanOrEqual(31);await expect(page.locator('.v61-singularity-card')).toHaveCount(4);await expect(page.locator('.v61-singularity-head')).toContainText('拉刻西斯节点');
  const singLayout=await uiMetrics(page);console.log('SINGULARITY_LAYOUT',JSON.stringify(singLayout));expect(singLayout.maxGap).toBeLessThan(20);expect(singLayout.actionInnerGap).toBeLessThan(12);expect(singLayout.blocked).toBe(0);await page.locator('.v61-singularity-card').first().click();await page.waitForFunction(age=>window.APP?.p?.age===age+1,singularityAge);
  const singState=await page.evaluate(()=>({resolved:APP.p.fate.singularity.resolved,branch:APP.p.fate.singularity.branch,age:APP.p.fate.singularity.age}));expect(singState.resolved).toBeTruthy();expect(singState.branch).toBeTruthy();expect(singState.age).toBe(singularityAge);
  for(let i=0;i<85;i++){const state=await page.evaluate(()=>{const A=window.APP,before=A.p.age,buttons=[...document.querySelectorAll('.action-card[data-i]:not([disabled])')];if(!buttons.length)return{error:`No enabled action at age ${before}`};buttons[0].click();return{before,after:A.p.age,busy:A.busy,alive:A.p.alive,count:document.querySelectorAll('.action-card[data-i]').length,stories:(A._yearStories||[]).length}});if(state.error)throw new Error(state.error);expect(state.busy).toBeFalsy();if(state.alive&&state.after!==state.before+1)throw new Error(`Age did not advance: ${state.before}->${state.after}`);if(state.alive&&![4,5].includes(state.count))throw new Error(`Unexpected option count ${state.count} at age ${state.after}`);if(state.stories<1||state.stories>3)throw new Error(`Annual stories out of range: ${state.stories}`)}
  await page.evaluate(()=>{window.APP.die('WebKit V6.2 回归测试')});await expect(page.locator('.v55-end')).toBeVisible();await expect(page.locator('.game-screen')).toHaveCount(0);expect(await page.locator('.v55-verdict>p').count()).toBeGreaterThanOrEqual(5);await expect(page.locator('.v61-end-singularity')).toBeVisible();await expect(page.locator('#v61RewindBtn')).toBeVisible();await page.locator('#v61RewindBtn').click();await expect(page.locator('.game-screen')).toBeVisible();await expect(page.locator('.v61-singularity-card')).toHaveCount(4);
  const rewound=await page.evaluate(()=>({age:APP.p.age,line:APP.p.fate.branch,resolved:APP.p.fate.singularity.resolved}));expect(rewound.age).toBe(singularityAge);expect(rewound.line).toBeGreaterThan(1);expect(rewound.resolved).toBeFalsy();if(pageErrors.length)throw new Error(`WebKit page errors: ${pageErrors.join(' | ')}`);
});
