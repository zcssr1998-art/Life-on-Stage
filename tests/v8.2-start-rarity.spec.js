import {test,expect} from '@playwright/test';
const waitForV7=async page=>{await page.waitForFunction(()=>!!window.__V7__?.runtime&&!!window.__V7__?.ui)};
const chooseFirst=async page=>{const b=page.locator('[data-action="choice"]').first();await expect(b).toBeVisible();await b.click();const r=page.locator('[data-action="response"]:not([disabled])');if(await r.count())await r.first().click();};

test('V8.2 a newly opened shared link always lands on the new-run screen without destroying the old save',async({page})=>{
  await page.goto('/?session=build-old-save');await waitForV7(page);
  await page.locator('[data-action="begin"]').click();await page.waitForTimeout(80);
  for(let i=0;i<5;i++){const alive=await page.evaluate(()=>window.__V7__.runtime.store.get().alive);if(!alive)break;await chooseFirst(page);}
  const oldAge=await page.evaluate(()=>window.__V7__.runtime.store.get().age);expect(oldAge).toBeGreaterThan(1);
  await page.goto('/?utm_source=shared-link');await waitForV7(page);
  await expect(page.locator('.start-hero')).toBeVisible();
  await expect(page.locator('[data-action="begin"]')).toBeVisible();
  await expect(page.locator('[data-continue-save]')).toBeVisible();
  expect(await page.evaluate(()=>window.__V7__.runtime.store.get().age)).toBe(1);
  await page.locator('[data-continue-save]').click();
  await expect(page.locator('.hud')).toBeVisible();
  expect(await page.evaluate(()=>window.__V7__.runtime.store.get().age)).toBe(oldAge);
});

test('V8.2 rarity cards have distinct backplates and only legendary mythic prismatic animate',async({page})=>{
  await page.goto('/');await waitForV7(page);
  const styles=await page.evaluate(()=>{
    const host=document.createElement('div');host.style.cssText='display:grid;grid-template-columns:repeat(6,160px);position:absolute;left:-9999px';
    host.innerHTML=['B','A','S','SS','SSS','P'].map(r=>`<article id="r-${r}" class="trait-card r-${r}"><span class="trait-rarity">${r}</span><strong>${r}</strong></article>`).join('');document.body.append(host);
    const out={};for(const r of ['B','A','S','SS','SSS','P']){const c=getComputedStyle(document.querySelector(`#r-${r}`));out[r]={background:c.backgroundImage,animation:c.animationName,duration:c.animationDuration,border:c.borderColor,shadow:c.boxShadow};}host.remove();return out;
  });
  expect(new Set(Object.values(styles).map(x=>x.background)).size).toBe(6);
  expect(styles.B.animation).toBe('none');expect(styles.A.animation).toBe('none');expect(styles.S.animation).toBe('none');
  expect(styles.SS.animation).toContain('legendaryBreath');expect(styles.SSS.animation).toContain('mythicBreath');expect(styles.P.animation).toContain('prismaticShift');
  const sec=x=>parseFloat(x);expect(sec(styles.SS.duration)).toBeGreaterThan(sec(styles.SSS.duration));expect(sec(styles.SSS.duration)).toBeGreaterThan(sec(styles.P.duration));
  expect(styles.P.shadow).not.toBe(styles.SSS.shadow);expect(styles.SSS.shadow).not.toBe(styles.SS.shadow);
});
