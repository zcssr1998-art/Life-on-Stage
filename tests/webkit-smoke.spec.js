const { test, expect } = require('@playwright/test');

test('mobile WebKit survives long sessions and validates V5.7 adaptive UI', async ({ page }) => {
  await page.goto('/?e2e=1', { waitUntil: 'networkidle' });
  await expect(page.locator('#startBtn')).toBeVisible();

  const pool = await page.evaluate(() => {
    const counts={};
    for(const t of window.LIFE.TRAITS)counts[t.rarity]=(counts[t.rarity]||0)+1;
    return {total:window.LIFE.TRAITS.length,counts,micro:window.LIFE.MICRO_EVENTS?.length||0};
  });
  expect(pool.total).toBe(200);
  expect(pool.counts).toEqual({SSS:20,SS:30,S:45,A:60,B:35,P:10});
  expect(pool.micro).toBeGreaterThanOrEqual(45);

  const prismRate = await page.evaluate(() => {
    let prism=0,n=3000;
    for(let i=0;i<n;i++)if(window.APP.rollTraits(5).some(t=>t.rarity==='P'))prism++;
    return prism/n;
  });
  expect(prismRate).toBeGreaterThan(0.03);
  expect(prismRate).toBeLessThan(0.07);

  await expect(page.locator('.start-traits .trait-chip')).toHaveCount(5);
  await page.locator('#rerollBtn').click();
  await page.locator('#startBtn').click();

  await page.evaluate(() => { window.APP.deathCheck = () => false; });

  await expect(page.locator('.action-card[data-i]')).toHaveCount(5);
  await expect(page.locator('.v55-stat')).toHaveCount(10);
  await expect(page.locator('.v55-top-trait')).toHaveCount(5);
  await expect(page.locator('.v55-spouse')).toHaveCount(0);
  expect(await page.locator('.v55-bar .mark100').count()).toBe(10);

  await page.setViewportSize({width:375,height:667});
  const compact = await page.evaluate(() => {
    const card=document.querySelector('.v55-actions .action-card strong');
    const stat=document.querySelector('.v55-stat-head span');
    const screen=document.querySelector('.game-screen');
    return {
      card:parseFloat(getComputedStyle(card).fontSize),
      stat:parseFloat(getComputedStyle(stat).fontSize),
      overflow:screen.scrollHeight-screen.clientHeight
    };
  });
  expect(compact.overflow).toBeLessThanOrEqual(5);

  await page.setViewportSize({width:430,height:932});
  const large = await page.evaluate(() => {
    const card=document.querySelector('.v55-actions .action-card strong');
    const stat=document.querySelector('.v55-stat-head span');
    const story=document.querySelector('.v55-latest-head strong');
    const screen=document.querySelector('.game-screen');
    return {
      card:parseFloat(getComputedStyle(card).fontSize),
      stat:parseFloat(getComputedStyle(stat).fontSize),
      story:parseFloat(getComputedStyle(story).fontSize),
      overflow:screen.scrollHeight-screen.clientHeight
    };
  });
  expect(large.card).toBeGreaterThanOrEqual(compact.card+2);
  expect(large.stat).toBeGreaterThanOrEqual(compact.stat+2);
  expect(large.story).toBeGreaterThanOrEqual(10);
  expect(large.overflow).toBeLessThanOrEqual(5);

  await page.setViewportSize({width:390,height:844});
  await page.locator('.action-card[data-i]').first().click();
  await page.waitForFunction(() => window.APP?.p?.age === 2 || !window.APP?.p?.alive);

  await expect(page.locator('.action-card[data-i]')).toHaveCount(4);
  const storyCount=await page.locator('.v55-story').count();
  expect(storyCount).toBeGreaterThanOrEqual(1);
  expect(storyCount).toBeLessThanOrEqual(3);
  const storyText=await page.locator('.v55-story p').first().textContent();
  expect((storyText||'').length).toBeGreaterThan(18);

  const statScale = await page.evaluate(() => {
    const A=window.APP;
    A.p.stats.health=137;A.clampStats(A.p);const a=A.p.stats.health;
    A.p.stats.health=999;A.clampStats(A.p);const b=A.p.stats.health;
    A.p.stats.health=88;A.render();
    return {a,b};
  });
  expect(statScale.a).toBe(137);
  expect(statScale.b).toBe(200);

  await page.evaluate(() => { window.APP.spouse(); window.APP.render(); });
  await expect(page.locator('.v55-spouse')).toBeVisible();
  await expect(page.locator('.v55-spouse')).toContainText('当前伴侣');

  await page.locator('.nav-btn[data-view="info"]').click();
  await expect(page.locator('.full-history')).toBeVisible();
  await expect(page.locator('.stats-grid')).toHaveCount(0);
  await page.locator('.nav-btn[data-view="game"]').click();

  const leaks=await page.evaluate(() => {
    const A=window.APP;
    A.p.age=8;A.p.graduationAge=null;A.buildYear();
    const young=A.year.map(x=>`${x.title} ${x.desc}`).join('|');
    A.p.age=78;A.buildYear();
    const old=A.year.map(x=>`${x.title} ${x.desc}`).join('|');
    return {young,old};
  });
  expect(leaks.young).not.toMatch(/创业|融资|房贷|结婚|离婚|退休|杠杆/);
  expect(leaks.old).not.toMatch(/幼儿园|小学|班主任|同桌|作业|家长会|过家家|高考|中考/);

  for (let i = 0; i < 100; i++) {
    const state = await page.evaluate(() => {
      const A=window.APP;
      const before=A.p.age;
      const buttons=[...document.querySelectorAll('.action-card[data-i]:not([disabled])')];
      if(!buttons.length)return {error:`No enabled action at age ${before}`};
      buttons[0].click();
      return {before,after:A.p.age,busy:A.busy,alive:A.p.alive,count:document.querySelectorAll('.action-card[data-i]').length,stories:(A._yearStories||[]).length};
    });
    if(state.error)throw new Error(state.error);
    expect(state.busy).toBeFalsy();
    if(state.alive&&state.after!==state.before+1)throw new Error(`Age did not advance: ${state.before}->${state.after}`);
    if(state.alive&&![4,5,6].includes(state.count))throw new Error(`Unexpected option count ${state.count} at age ${state.after}`);
    if(state.stories<1||state.stories>3)throw new Error(`Annual stories out of range: ${state.stories}`);
  }

  await page.evaluate(() => {
    window.APP.p.age = 94;
    window.APP.p.stats.luck=155;
    window.APP.die('WebKit 回归测试');
  });
  await expect(page.locator('.v55-end')).toBeVisible();
  await expect(page.locator('.game-screen')).toHaveCount(0);
  expect(await page.locator('.v55-verdict>p').count()).toBeGreaterThanOrEqual(5);
  await expect(page.locator('.v55-verdict')).toContainText('旁白吐槽');
});
