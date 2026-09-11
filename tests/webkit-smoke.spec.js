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
    const card=document.querySelector('.v55-actions .action-card strong');
    const stat=document.querySelector('.v55-stat-head span');
    const story=document.querySelector('.v55-latest-head strong');
    const screen=document.querySelector('.game-screen');
    const root=getComputedStyle(document.documentElement);
    const kids=[...screen.children].filter(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return s.display!=='none'&&r.height>0}).map(el=>({c:el.className,top:el.getBoundingClientRect().top,bottom:el.getBoundingClientRect().bottom,height:el.getBoundingClientRect().height})).sort((a,b)=>a.top-b.top);
    let maxGap=0;for(let i=1;i<kids.length;i++)maxGap=Math.max(maxGap,kids[i].top-kids[i-1].bottom);
    const cards=[...document.querySelectorAll('.action-card[data-i]:not([disabled])')];
    const blocked=cards.filter(el=>{const r=el.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,hit=document.elementFromPoint(x,y);return !hit||!(hit===el||el.contains(hit));}).length;
    return {
      innerWidth:window.innerWidth,innerHeight:window.innerHeight,
      card:parseFloat(getComputedStyle(card).fontSize),stat:parseFloat(getComputedStyle(stat).fontSize),story:parseFloat(getComputedStyle(story).fontSize),
      choiceVar:root.getPropertyValue('--v57-choice-title').trim(),overflow:screen.scrollHeight-screen.clientHeight,maxGap,blocked,kids
    };
  });
}

test('V6.1 adaptive UI uses room without giant blank rows',async({browser})=>{
  const smallCtx=await browser.newContext({viewport:{width:375,height:667},screen:{width:375,height:667},deviceScaleFactor:2,isMobile:true,hasTouch:true,userAgent:UA});
  const largeCtx=await browser.newContext({viewport:{width:430,height:932},screen:{width:430,height:932},deviceScaleFactor:3,isMobile:true,hasTouch:true,userAgent:UA});
  try{
    const small=await smallCtx.newPage(),large=await largeCtx.newPage();
    await openGame(small);await openGame(large);
    const a=await uiMetrics(small),b=await uiMetrics(large);
    expect(a.innerWidth).toBe(375);expect(b.innerWidth).toBe(430);expect(a.innerHeight).toBe(667);expect(b.innerHeight).toBe(932);
    expect(b.card).toBeGreaterThanOrEqual(a.card+2);expect(b.stat).toBeGreaterThanOrEqual(a.stat+2);expect(b.story).toBeGreaterThanOrEqual(a.story+2);
    expect(a.overflow).toBeLessThanOrEqual(5);expect(b.overflow).toBeLessThanOrEqual(5);
    expect(a.maxGap).toBeLessThan(18);expect(b.maxGap).toBeLessThan(20);
    expect(a.blocked).toBe(0);expect(b.blocked).toBe(0);
    expect(a.kids.length).toBeGreaterThanOrEqual(6);expect(b.kids.length).toBeGreaterThanOrEqual(6);
  }finally{await smallCtx.close();await largeCtx.close();}
});

test('desktop V6.1 layout has no screenshot-scale empty bands',async({browser})=>{
  const ctx=await browser.newContext({viewport:{width:1440,height:1000}});
  try{
    const page=await ctx.newPage();await openGame(page);const m=await uiMetrics(page);
    expect(m.maxGap).toBeLessThan(24);expect(m.blocked).toBe(0);expect(m.overflow).toBeLessThanOrEqual(5);
    const latestHeight=await page.locator('.v55-latest').evaluate(el=>el.getBoundingClientRect().height);
    expect(latestHeight).toBeLessThan(190);
    const worldHeight=await page.locator('.v6-world').evaluate(el=>el.getBoundingClientRect().height);
    expect(worldHeight).toBeLessThan(90);
  }finally{await ctx.close();}
});

test('mobile WebKit survives long sessions, black-box stats, singularity and rewind', async ({ page }) => {
  const pageErrors=[];page.on('pageerror',e=>pageErrors.push(String(e)));page.on('dialog',d=>d.accept());
  await page.goto('/?e2e=1', { waitUntil: 'networkidle' });
  await expect(page.locator('#startBtn')).toBeVisible();

  const pool = await page.evaluate(() => {
    const counts={};for(const t of window.LIFE.TRAITS)counts[t.rarity]=(counts[t.rarity]||0)+1;
    return {total:window.LIFE.TRAITS.length,counts,micro:window.LIFE.MICRO_EVENTS?.length||0};
  });
  expect(pool.total).toBe(200);expect(pool.counts).toEqual({SSS:20,SS:30,S:45,A:60,B:35,P:10});expect(pool.micro).toBeGreaterThanOrEqual(45);

  const prismRate = await page.evaluate(() => {let prism=0,n=3000;for(let i=0;i<n;i++)if(window.APP.rollTraits(5).some(t=>t.rarity==='P'))prism++;return prism/n;});
  expect(prismRate).toBeGreaterThan(0.03);expect(prismRate).toBeLessThan(0.07);

  await expect(page.locator('.start-traits .trait-chip')).toHaveCount(5);await page.locator('#rerollBtn').click();await page.locator('#startBtn').click();
  await page.evaluate(() => { window.APP.deathCheck = () => false; });

  await expect(page.locator('.action-card[data-i]')).toHaveCount(5);await expect(page.locator('.v55-stat')).toHaveCount(10);await expect(page.locator('.v55-top-trait')).toHaveCount(5);await expect(page.locator('.v55-spouse')).toHaveCount(0);
  await expect(page.locator('.v61-fogbar')).toHaveCount(10);
  const visibleStatWords=await page.locator('.v61-fog-stat .v55-stat-head b').allTextContents();
  if(visibleStatWords.some(x=>/\d/.test(x)))throw new Error(`exact stat leaked into UI: ${visibleStatWords.join('|')}`);
  const initialLayout=await uiMetrics(page);expect(initialLayout.maxGap).toBeLessThan(20);expect(initialLayout.blocked).toBe(0);

  await page.locator('.action-card[data-i]').first().click();await page.waitForFunction(() => window.APP?.p?.age === 2 || !window.APP?.p?.alive);
  await expect(page.locator('.action-card[data-i]')).toHaveCount(4);
  const storyCount=await page.locator('.v55-story').count();expect(storyCount).toBeGreaterThanOrEqual(1);expect(storyCount).toBeLessThanOrEqual(3);
  const storyText=await page.locator('.v55-story p').first().textContent();expect((storyText||'').length).toBeGreaterThan(18);
  const storyChanges=await page.locator('.v55-story small').allTextContents();if(storyChanges.some(x=>/(健康|幸福|智力|社交|运气|野心|稳定|自律|风险偏好|家庭关系)[+-]\d/.test(x)))throw new Error('exact stat delta leaked in latest story');

  const statScale = await page.evaluate(() => {const A=window.APP;A.p.stats.health=137;A.clampStats(A.p);const a=A.p.stats.health;A.p.stats.health=999;A.clampStats(A.p);const b=A.p.stats.health;A.p.stats.health=88;A.render();return {a,b};});
  expect(statScale.a).toBe(137);expect(statScale.b).toBe(200);

  await page.evaluate(() => { window.APP.spouse(); window.APP.render(); });await expect(page.locator('.v55-spouse')).toBeVisible();await expect(page.locator('.v55-spouse')).toContainText('当前伴侣');
  await page.locator('.nav-btn[data-view="info"]').click();await expect(page.locator('.full-history')).toBeVisible();await expect(page.locator('.stats-grid')).toHaveCount(0);await page.locator('.nav-btn[data-view="game"]').click();

  const leaks=await page.evaluate(() => {const A=window.APP;A.p.age=8;A.p.graduationAge=null;A.buildYear();const young=A.year.map(x=>`${x.title} ${x.desc}`).join('|');A.p.age=78;A.buildYear();const old=A.year.map(x=>`${x.title} ${x.desc}`).join('|');return {young,old};});
  expect(leaks.young).not.toMatch(/创业|融资|房贷|结婚|离婚|退休|杠杆/);expect(leaks.old).not.toMatch(/幼儿园|小学|班主任|同桌|作业|家长会|过家家|高考|中考/);

  const singularityAge=await page.evaluate(()=>{const A=window.APP,s=A.v61EnsureSingularity();A.p.age=s.age;A.p.graduationAge=null;A.buildYear();return s.age;});
  expect(singularityAge).toBeGreaterThanOrEqual(17);expect(singularityAge).toBeLessThanOrEqual(31);
  await expect(page.locator('.v61-singularity-card')).toHaveCount(4);await expect(page.locator('.v61-singularity-head')).toContainText('拉刻西斯节点');
  const singLayout=await uiMetrics(page);expect(singLayout.maxGap).toBeLessThan(20);expect(singLayout.blocked).toBe(0);
  await page.locator('.v61-singularity-card').first().click();await page.waitForFunction(age=>window.APP?.p?.age===age+1,singularityAge);
  const singState=await page.evaluate(()=>({resolved:APP.p.fate.singularity.resolved,branch:APP.p.fate.singularity.branch,age:APP.p.fate.singularity.age}));
  expect(singState.resolved).toBeTruthy();expect(singState.branch).toBeTruthy();expect(singState.age).toBe(singularityAge);

  for (let i = 0; i < 85; i++) {
    const state = await page.evaluate(() => {const A=window.APP,before=A.p.age,buttons=[...document.querySelectorAll('.action-card[data-i]:not([disabled])')];if(!buttons.length)return {error:`No enabled action at age ${before}`};buttons[0].click();return {before,after:A.p.age,busy:A.busy,alive:A.p.alive,count:document.querySelectorAll('.action-card[data-i]').length,stories:(A._yearStories||[]).length};});
    if(state.error)throw new Error(state.error);expect(state.busy).toBeFalsy();if(state.alive&&state.after!==state.before+1)throw new Error(`Age did not advance: ${state.before}->${state.after}`);if(state.alive&&![4,5].includes(state.count))throw new Error(`Unexpected option count ${state.count} at age ${state.after}`);if(state.stories<1||state.stories>3)throw new Error(`Annual stories out of range: ${state.stories}`);
  }

  await page.evaluate(() => { window.APP.die('WebKit V6.1 回归测试'); });
  await expect(page.locator('.v55-end')).toBeVisible();await expect(page.locator('.game-screen')).toHaveCount(0);expect(await page.locator('.v55-verdict>p').count()).toBeGreaterThanOrEqual(5);await expect(page.locator('.v61-end-singularity')).toBeVisible();await expect(page.locator('#v61RewindBtn')).toBeVisible();
  await page.locator('#v61RewindBtn').click();await expect(page.locator('.game-screen')).toBeVisible();await expect(page.locator('.v61-singularity-card')).toHaveCount(4);
  const rewound=await page.evaluate(()=>({age:APP.p.age,line:APP.p.fate.branch,resolved:APP.p.fate.singularity.resolved}));expect(rewound.age).toBe(singularityAge);expect(rewound.line).toBeGreaterThan(1);expect(rewound.resolved).toBeFalsy();

  if(pageErrors.length)throw new Error(`WebKit page errors: ${pageErrors.join(' | ')}`);
});
