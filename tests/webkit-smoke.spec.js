const { test, expect } = require('@playwright/test');

test('mobile WebKit survives long sessions and renders death ending', async ({ page }) => {
  await page.goto('/?e2e=1', { waitUntil: 'networkidle' });
  await expect(page.locator('#startBtn')).toBeVisible();

  // Opening controls must be physically clickable in WebKit.
  await page.locator('#rerollBtn').click();
  await expect(page.locator('#startBtn')).toBeVisible();
  await page.locator('#startBtn').click();

  // Zhou is physically clicked once: this catches real hitbox overlap/interception.
  await expect(page.locator('.action-card[data-i]')).toHaveCount(5);
  await page.locator('.action-card[data-i]').first().click();
  await page.waitForFunction(() => window.APP?.p?.age === 2 || !window.APP?.p?.alive);

  // Then exercise 120 DOM rebuilds quickly. Native element.click still traverses our event delegation,
  // but avoids Playwright spending ~1s on hit-target stabilization for every simulated year.
  await page.evaluate(() => { window.APP.deathCheck = () => false; });
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

  // Direct regression for the screenshot failure mode: a death at old age must replace the old game UI.
  await page.evaluate(() => {
    window.APP.p.age = 94;
    window.APP.die('WebKit 回归测试');
  });
  await expect(page.locator('.end-screen')).toBeVisible();
  await expect(page.locator('.game-screen')).toHaveCount(0);
});
