import {test,expect} from '@playwright/test';
import fixture from './hub-fixture.cjs';
const {configs,render,read,tags,posts,coveragePosts}=fixture;
for(const [name,fn,ids] of configs) for(const locale of ['ko','en']) {
 test(`${name} ${locale}: mobile SSR, enhancement, HTTP failure and history`,async({page})=>{
  const html='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+read('assets/built/screen.css')+'</style></head><body>'+render(name,locale)+'<script id="ayu-content-key" data-key="key"></script></body></html>';
  await page.setViewportSize({width:375,height:812});
  await page.route('https://fixture.test/**',route=>route.fulfill({contentType:'text/html; charset=utf-8',body:html}));
  await page.goto('https://fixture.test/'+name+'/');
  await expect(page.locator('a[href^="/tag/"]').filter({hasText:'Name 00'}).first()).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBeTruthy();
  const before=await page.locator('main').innerHTML();
  const js=['dom-utils','taxonomy','content-api','hub-ui',name+'-page'].map(p=>read('assets/js/lib/'+p+'.js')).join('\n');
  await page.addScriptTag({content:js});
  await page.route('**/ghost/api/content/**',route=>route.fulfill({status:403,body:'Forbidden'}));
  await page.evaluate(fn=>window[fn](),fn);
  await page.waitForTimeout(100);
  expect(await page.locator('main').innerHTML()).toBe(before);
  // New document prevents duplicate event listeners; a delayed response verifies SSR retention.
  await page.reload();await page.addScriptTag({content:js});
  let release;const gate=new Promise(r=>{release=r;});
  await page.route('**/ghost/api/content/**',async route=>{await gate;await route.fulfill({contentType:'application/json',body:JSON.stringify((()=>{const u=new URL(route.request().url()),key=u.pathname.includes('/tags/')?'tags':'posts',all=key==='tags'?[...tags].sort((a,b)=>u.searchParams.get('order')?.startsWith('name')?a.name.localeCompare(b.name)||a.slug.localeCompare(b.slug):b.count.posts-a.count.posts||a.name.localeCompare(b.name)||a.slug.localeCompare(b.slug)):u.searchParams.get('include')==='tags'?coveragePosts:posts,limit=Number(u.searchParams.get('limit'))||100,page=Number(u.searchParams.get('page'))||1,pages=Math.max(1,Math.ceil(all.length/limit));return {[key]:all.slice((page-1)*limit,page*limit),meta:{pagination:{page,limit,pages,total:all.length,next:page<pages?page+1:null,prev:page>1?page-1:null}}}})())});});
  await page.evaluate(fn=>window[fn](),fn);
  expect(await page.locator('main').innerHTML()).toBe(before);
  release();
  await expect.poll(()=>page.locator('main').innerHTML()).not.toBe(before);
  await expect(page.locator('#'+ids[0])).toContainText('Name 00');
  if(name==='categories'||name==='series') {
   await page.locator('#'+ids[2]+' [data-page="2"]').first().click();
   await expect(page).toHaveURL(/page=2/);
   await page.evaluate(()=>{history.pushState({},'', '?page=3');dispatchEvent(new PopStateEvent('popstate'));});
   await expect(page.locator('[aria-current="page"]')).toHaveText('3');
   await page.goBack();await expect(page.locator('[aria-current="page"]')).toHaveText('2');
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBeTruthy();
 });
 test(`${name} ${locale}: JavaScript disabled`,async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:375,height:812}});
  const page=await context.newPage();
  await page.setContent('<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+read('assets/built/screen.css')+'</style>'+render(name,locale));
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBeTruthy();
  const more=page.locator('details > summary').first();
  if(await more.count()) {
   await more.click();
   expect(await more.evaluate(el=>el.parentElement.open)).toBeTruthy();
  }
  expect(await page.locator('a[href^="/tag/"]').count()).toBeGreaterThan(0);
  if(name==='explore')await expect(page.locator('a[href="/post-1/"]')).toBeVisible();
  await context.close();
 });
}
