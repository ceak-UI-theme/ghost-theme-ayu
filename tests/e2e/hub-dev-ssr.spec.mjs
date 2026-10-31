import {test,expect} from '@playwright/test';
const routes=[
 {name:'categories',grids:['primary-featured-grid','primary-list-grid'],ready:'__ayuPrimaryCategoryList'},
 {name:'series',grids:['series-featured-grid','series-list-grid'],ready:'__ayuSeriesTagList'},
 {name:'secondary-tags',grids:['secondary-tags-featured','secondary-tags-grid']},
 {name:'explore',grids:['explore-categories-grid','explore-series-list','explore-topics-grid','explore-recent-list']}
];
const links=page=>page.locator('main a[href*="/tag/"]').evaluateAll(els=>els.map(e=>e.getAttribute('href')));
for(const route of routes) {
 test(`${route.name}: real Ghost SSR without JavaScript`,async({browser,baseURL})=>{
  const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:375,height:812}});
  const page=await context.newPage();const response=await page.goto(baseURL+'/'+route.name+'/');
  expect(response.status()).toBe(200);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
  expect((await links(page)).length).toBeGreaterThan(0);
  const title=page.locator('main a[href*="/tag/"]').filter({hasText:/\S/}).first();await expect(title).toBeVisible();
  for(const id of route.grids)expect(await page.locator('#'+id+' a').count()).toBeGreaterThan(0);
  if(route.name==='secondary-tags') {
   const summary=page.locator('details summary').first();
   if(await summary.count()){await summary.click();expect(await summary.evaluate(e=>e.parentElement.open)).toBeTruthy();}
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  await context.close();
 });
 for(const mode of ['missing','401','403','500','offline'])test(`${route.name}: SSR survives ${mode}`,async({page,request,baseURL})=>{
  const raw=await request.get(baseURL+'/'+route.name+'/');expect(raw.status()).toBe(200);
  // Read the same server HTML in a separate script-disabled browser context for comparison.
  const baseline=await page.context().browser().newContext({javaScriptEnabled:false});
  const baselinePage=await baseline.newPage();await baselinePage.goto(baseURL+'/'+route.name+'/');
  const before=await links(baselinePage);await baseline.close();
  let requests=0;
  if(mode==='missing')await page.route('**/assets/built/main.min.js*',async r=>{
   const res=await r.fetch();await r.fulfill({response:res,body:"document.querySelectorAll('script[data-key]').forEach(function(s){s.setAttribute('data-key','');});\n"+await res.text()});
  });
  await page.route('**/ghost/api/content/**',async r=>{requests++;if(mode==='offline')await r.abort('internetdisconnected');else await r.fulfill({status:Number(mode)||401,body:'Blocked by development regression test'});});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(baseURL+'/'+route.name+'/');
  await expect.poll(()=>page.evaluate(()=>window.__ayuRuntimeFlags?.bootstrapped)).toBeTruthy();
  if(mode!=='missing')await expect.poll(()=>requests).toBeGreaterThan(0);
  await page.waitForTimeout(250);
  expect(await links(page)).toEqual(before);
  expect(errors).toEqual([]);
  for(const id of route.grids)expect(await page.locator('#'+id+' .term-skeleton-grid, #'+id+' .term-loading').count()).toBe(0);
 });
 test(`${route.name}: real API enhancement on mobile`,async({page,baseURL})=>{
  await page.setViewportSize({width:375,height:812});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const response=await page.goto(baseURL+'/'+route.name+'/');expect(response.status()).toBe(200);
  if(route.ready)await expect.poll(()=>page.evaluate(key=>Boolean(window[key]),route.ready)).toBeTruthy();
  else if(route.name==='explore')await expect.poll(()=>page.locator('#explore-categories-grid img').first().getAttribute('loading')).toBeNull();
  else await expect.poll(()=>page.locator('#secondary-tags-grid .explore-topic-count').count()).toBe(0);
  expect((await links(page)).length).toBeGreaterThan(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  expect(errors).toEqual([]);
  // Each tag card is unique; image and title anchors within a card may share the same URL.
  const cardLinks=await page.locator('main .post-title-link, main .secondary-tag-card, main .explore-card-title a, main .explore-topic-card').evaluateAll(els=>els.map(e=>e.getAttribute('href')));
  expect(new Set(cardLinks).size).toBe(cardLinks.length);
 });
}
