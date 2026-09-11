import {test,expect} from '@playwright/test';

test('V7 mobile long-session, money audit and fate rewind',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  await expect(page.getByText('V7 · Engine Rewrite')).toBeVisible();
  await page.evaluate(async()=>{await window.__V7__.runtime.reroll(763211);window.__V7__.ui.setStart(true)});
  await page.locator('[data-action="begin"]').click();
  await expect(page.locator('[data-action="choice"]')).toHaveCount(5);
  await page.locator('[data-action="choice"]').first().click();
  await expect(page.locator('[data-action="choice"]')).toHaveCount(4);
  const size=await page.evaluate(()=>({h:document.documentElement.scrollHeight,v:innerHeight}));
  expect(size.h).toBeLessThanOrEqual(size.v+8);
  const target=await page.evaluate(()=>window.__V7__.runtime.store.get().fate.targetAge);
  for(let guard=0;guard<45;guard++){
    const st=await page.evaluate(()=>{const s=window.__V7__.runtime.store.get();return{age:s.age,alive:s.alive}});
    if(!st.alive||st.age>=target)break;
    await page.locator('[data-action="choice"]').first().click();
  }
  await expect(page.getByText('✦ 拉刻西斯节点 · 宿命奇点')).toBeVisible();
  await expect(page.locator('[data-action="choice"]')).toHaveCount(4);
  await page.locator('[data-action="choice"]').first().click();
  const audit=await page.evaluate(()=>{const l=window.__V7__.runtime.store.get().ledger;if(!l)return null;return{net:l.net,sum:l.items.reduce((a,b)=>a+b.amount,0)}});
  if(audit)expect(Math.abs(audit.net-audit.sum)).toBeLessThanOrEqual(1);
  await page.evaluate(()=>{window.__V7__.runtime.store.dispatch({type:'DIE',reason:'WebKit回归测试'});window.__V7__.ui.render()});
  await expect(page.locator('[data-action="rewind"]')).toBeVisible();
  await page.locator('[data-action="rewind"]').click();
  await expect(page.locator('[data-action="choice"]')).toHaveCount(4);
  expect(await page.evaluate(()=>window.__V7__.runtime.store.get().age)).toBe(target);
  const saved=await page.evaluate(async()=>{await window.__V7__.runtime.persist.save(window.__V7__.runtime.store.snapshot());const s=await window.__V7__.runtime.persist.load();return!!s&&s.version==='V7'});
  expect(saved).toBeTruthy();
});

test('V7 stale busy save recovers after refresh and remains playable',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/');
  await page.evaluate(async()=>{await window.__V7__.runtime.reroll(884422);window.__V7__.ui.setStart(true)});
  await page.locator('[data-action="begin"]').click();
  await page.locator('[data-action="choice"]').first().click();
  await expect(page.locator('[data-action="choice"]').first()).toBeEnabled();

  for(let i=0;i<8;i++){
    const alive=await page.evaluate(()=>window.__V7__.runtime.store.get().alive);
    if(!alive)break;
    await page.locator('[data-action="choice"]').first().click();
  }

  const before=await page.evaluate(async()=>{
    const runtime=window.__V7__.runtime;
    const snap=runtime.store.snapshot();
    snap.ui.busy=true;
    await runtime.persist.save(snap);
    return{age:snap.age,alive:snap.alive,choices:snap.currentChoices.length};
  });
  expect(before.alive).toBeTruthy();
  expect(before.choices).toBeGreaterThan(0);

  await page.reload();
  await expect(page.locator('[data-action="choice"]')).toHaveCount(before.choices);
  await expect(page.locator('[data-action="choice"]').first()).toBeEnabled();
  expect(await page.evaluate(()=>window.__V7__.runtime.store.get().ui.busy)).toBeFalsy();

  await page.locator('[data-action="choice"]').first().click();
  expect(await page.evaluate(()=>window.__V7__.runtime.store.get().age)).toBeGreaterThan(before.age);
});

test('V7 Pro Max layout scales without dead zones',async({browser})=>{
  const ctx=await browser.newContext({viewport:{width:430,height:932},isMobile:true,hasTouch:true});
  const page=await ctx.newPage();
  await page.goto('/');
  await page.locator('[data-action="begin"]').click();
  await page.locator('[data-action="choice"]').first().click();
  const r=await page.evaluate(()=>({scroll:document.documentElement.scrollHeight,inner:innerHeight,choices:[...document.querySelectorAll('[data-action="choice"]')].map(x=>{const b=x.getBoundingClientRect();return b.width*b.height})}));
  expect(r.scroll).toBeLessThanOrEqual(r.inner+8);
  expect(Math.min(...r.choices)).toBeGreaterThan(3000);
  await ctx.close();
});
