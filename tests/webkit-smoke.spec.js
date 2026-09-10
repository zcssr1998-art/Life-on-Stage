const { test, expect } = require('@playwright/test');

test('mobile WebKit survives long sessions and validates V5.4 HUD/traits', async ({ page }) => {
  await page.goto('/?e2e=1', { waitUntil: 'networkidle' });
  await expect(page.locator('#startBtn')).toBeVisible();

  // V5.4 trait-pool contract: 200 total, with the new prismatic tier and fewer B traits.
  const pool = await page.evaluate(() => {
    const counts={};
    for(const t of window.LIFE.TRAITS)counts[t.rarity]=(counts[t.rarity]||0)+1;
    return {total:window.LIFE.TRAITS.length,counts};
  });
  expect(pool.total).toBe(200);
  expect(pool.counts).toEqual({SSS:20,SS:30,S:45,A:60,B:35,P:10});

  // "5%" is intentionally defined per whole five-trait opening Roll, not per slot.
  // Sample enough rolls to catch accidental probability regressions without making the test flaky.
  const prismRate = await page.evaluate(() => {
    let prism=0,n=4000;
    for(let i=0;i<n;i++)if(window.APP.rollTraits(5).some(t=>t.rarity==='P'))prism++;
    return prism/n;
  });
  expect(prismRate).toBeGreaterThan(0.035);
  expect(prismRate).toBeLessThan(0.065);

  // Opening controls must be physically clickable in WebKit.
  await expect(page.locator('.start-traits .trait-chip')).toHaveCount(5);
  await page.locator('#rerollBtn').click();
  await expect(page.locator('#startBtn')).toBeVisible();
  await page.locator('#startBtn').click();

  // Prevent random early death while testing layout/interactions.
  await page.evaluate(() => { window.APP.deathCheck = () => false; });

  // Zhou is physically clicked once: this catches real hitbox overlap/interception.
  await expect(page.locator('.action-card[data-i]')).toHaveCount(5);
  await expect(page.locator('.v54-stat')).toHaveCount(10);
  await expect(page.locator('.v54-top-trait')).toHaveCount(5);
  await expect(page.locator('.timeline-compact')).toHaveCount(0);
  await page.locator('.action-card[data-i]').first().click();
  await page.waitForFunction(() => window.APP?.p?.age === 2 || !window.APP?.p?.alive);

  // Normal years are now 4-choice, with one strong latest-result strip and live stat deltas.
  await expect(page.locator('.action-card[data-i]')).toHaveCount(4);
  await expect(page.locator('.v54-impact')).toContainText('刚刚发生');
  const changedStats = await page.locator('.v54-stat em:not(.flat)').count();
  expect(changedStats).toBeGreaterThan(0);

  // Full history lives only in Character Info; base stats no longer duplicate there.
  await page.locator('.nav-btn[data-view="info"]').click();
  await expect(page.locator('.full-history')).toBeVisible();
  await expect(page.locator('.stats-grid')).toHaveCount(0);
  await page.locator('.nav-btn[data-view="game"]').click();

  // Exercise 120 DOM rebuilds quickly. Native element.click still traverses event delegation,
  // but avoids Playwright spending ~1s on hit-target stabilization for every simulated year.
  for (let i = 0; i < 120; i++) {
    const state = await page.evaluate(() => {
      const A=window.APP;
      const before=A.p.age;
      const buttons=[...document.querySelectorAll('.action-card[data-i]:not([disabled])')];
      if(!buttons.length)return {error:`No enabled action at age ${before}`};
      buttons[0].click();
      return {before,after:A.p.age,busy:A.busy,alive:A.p.alive,count:document.querySelectorAll('.action-card[data-i]').length};
    });
    if(state.error)throw new Error(state.error);
    expect(state.busy).toBeFalsy();
    if(state.alive&&state.after!==state.before+1)throw new Error(`Age did not advance: ${state.before}->${state.after}`);
    if(state.alive&&![4,5,6].includes(state.count))throw new Error(`Unexpected option count ${state.count} at age ${state.after}`);
  }

  // Direct regression for the prior screenshot failure mode: a death at old age must replace the old game UI.
  await page.evaluate(() => {
    window.APP.p.age = 94;
    window.APP.die('WebKit 回归测试');
  });
  await expect(page.locator('.end-screen')).toBeVisible();
  await expect(page.locator('.game-screen')).toHaveCount(0);
});
