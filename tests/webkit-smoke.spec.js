const { test, expect } = require('@playwright/test');

test('mobile WebKit survives long click sessions and renders death ending', async ({ page }) => {
  await page.goto('/?e2e=1', { waitUntil: 'networkidle' });
  await expect(page.locator('#startBtn')).toBeVisible();

  // Opening reroll must remain responsive.
  await page.locator('#rerollBtn').click();
  await expect(page.locator('#startBtn')).toBeVisible();
  await page.locator('#startBtn').click();

  // Zhou must be 5 choices drawn from the 15-choice library.
  await expect(page.locator('.action-card[data-i]')).toHaveCount(5);
  await page.locator('.action-card[data-i]').first().click();
  await page.waitForFunction(() => window.APP?.p?.age === 2 || !window.APP?.p?.alive);

  // Force endurance mode so the DOM gets rebuilt and rebound well over 100 times.
  await page.evaluate(() => { window.APP.deathCheck = () => false; });
  for (let i = 0; i < 105; i++) {
    if (await page.locator('.end-screen').count()) break;
    const before = await page.evaluate(() => window.APP.p.age);
    const enabled = page.locator('.action-card[data-i]:not([disabled])');
    await expect(enabled.first()).toBeVisible();
    const count = await enabled.count();
    if (!count) throw new Error(`No enabled action at age ${before}`);
    await enabled.first().click();
    await page.waitForFunction(age => !window.APP.p.alive || window.APP.p.age === age + 1, before);
    const state = await page.evaluate(() => ({age: window.APP.p.age, busy: window.APP.busy, alive: window.APP.p.alive}));
    expect(state.busy).toBeFalsy();
    if (state.alive) {
      const cards = await page.locator('.action-card[data-i]').count();
      // Normal years should expose four choices; fixed milestones are allowed to differ.
      if (![4,5,6,15].includes(cards)) throw new Error(`Unexpected option count ${cards} at age ${state.age}`);
    }
  }

  // Direct regression for the screenshot failure mode: death at old age must replace the old game UI.
  await page.evaluate(() => {
    window.APP.p.age = 94;
    window.APP.die('WebKit 回归测试');
  });
  await expect(page.locator('.end-screen')).toBeVisible();
  await expect(page.locator('.game-screen')).toHaveCount(0);
});
