import {test,expect} from '@playwright/test';
import fixture from './hub-fixture.cjs';
const {H,render,read,tags,configs,coveragePosts}=fixture;
test.beforeEach(async({page})=>{await page.addInitScript(()=>{window.__errors=[];addEventListener('error',e=>{if(e.message)window.__errors.push(e.message)});addEventListener('unhandledrejection',e=>window.__errors.push(String(e.reason)))});});
test.afterEach(async({page})=>{expect(await page.evaluate(()=>window.__errors||[])).toEqual([]);});
const posts=Array.from({length:111},(_,i)=>({id:'post-'+i,slug:'post-'+i,title:'Boundary '+String(i+1).padStart(3,'0'),url:'/post-'+i+'/',excerpt:'Fixture excerpt',custom_excerpt:'',tags:[],authors:[]}));
const common=['dom-utils','taxonomy','content-api','hub-ui'].map(x=>read('assets/js/lib/'+x+'.js')).join('\n');
const css='<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+read('assets/built/screen.css')+'</style>';
function reply(key,items,page,limit){let pages=Math.max(1,Math.ceil(items.length/limit));return {[key]:items.slice((page-1)*limit,page*limit),meta:{pagination:{page,limit,pages,total:items.length,next:page<pages?page+1:null,prev:page>1?page-1:null}}};}
async function setup(page,name,locale,mode='ok',delay=0){
 const config=configs.find(c=>c[0]===name),fn=config?.[1]||'renderSearchPage';
 const body=name==='search'?H.compile(read('page-search.hbs'))({}, {data:{site:{url:'https://fixture.test'}}}):render(name,locale);
 const html='<!doctype html><html lang="'+locale+'"><head>'+css+'</head><body>'+body+'<script id="ayu-content-key" data-key="test-only"></script><script>'+common+'\n'+read('assets/js/lib/'+name+'-page.js')+'\ninjectPromoSlots=function(){};window.__p2SSR=document.querySelector("main").innerHTML;'+fn+'();</script></body></html>';
 await page.route('https://fixture.test/**',async route=>{
  const u=new URL(route.request().url());if(!u.pathname.includes('/ghost/api/content/'))return route.fulfill({contentType:'text/html; charset=utf-8',body:html});
  const key=u.pathname.includes('/tags/')?'tags':'posts',pageNo=Number(u.searchParams.get('page')||1),limit=Math.min(Number(u.searchParams.get('limit'))||100,key==='tags'?20:100);
  if(delay&&pageNo===2)await new Promise(r=>setTimeout(r,delay));
  if(mode==='page2'&&pageNo===2)return route.fulfill({status:500,body:'simulated failure'});
  if(['401','403','500'].includes(mode))return route.fulfill({status:Number(mode),body:'simulated failure'});
  if(mode==='offline')return route.abort('failed');
  if(mode==='timeout')return route.abort('timedout');
  if(mode==='blank')return route.fulfill({contentType:'application/json',body:''});
  let items=mode==='empty'?[]:key==='tags'?[...tags].sort((a,b)=>u.searchParams.get('order')?.startsWith('name')?a.name.localeCompare(b.name)||a.slug.localeCompare(b.slug):b.count.posts-a.count.posts||a.name.localeCompare(b.name)||a.slug.localeCompare(b.slug)):u.searchParams.get('include')==='tags'?coveragePosts:posts;
  let data=reply(key,items,pageNo,limit);
  if(mode==='object')data={};
  if(mode==='missing-meta')delete data.meta;
  if(mode==='incomplete')data[key].pop();
  await route.fulfill({contentType:'application/json',body:JSON.stringify(data)});
 });
 return html;
}
for(const locale of ['ko','en']){
 for(const [name] of configs)for(const mode of ['object','missing-meta','incomplete','page2','401','403','500','offline','timeout','blank','empty'])test(`${locale} ${name}: ${mode} preserves SSR or applies verified zero`,async({page})=>{
  await setup(page,name,locale,mode);const warnings=[];page.on('console',m=>{if(m.type()==='warning')warnings.push(m.text())});
  await page.goto('https://fixture.test/'+name+'/');
  if(mode==='empty'){await expect(page.locator('main')).toContainText(locale==='ko'?'없습니다':'No ');await expect(page.locator('main a[href*="/tag/"]')).toHaveCount(0);if(name==='explore')await expect(page.locator('#explore-recent-list a')).toHaveCount(0);}
  else {await expect.poll(()=>warnings.length).toBeGreaterThan(0);expect(await page.locator('main').innerHTML()).toBe(await page.evaluate(()=>window.__p2SSR));}
 });
 for(const name of ['categories','series'])test(`${locale} ${name}: real history, direct entry, bounds and rapid paging`,async({page})=>{
  await setup(page,name,locale);await page.goto('https://fixture.test/'+name+'/');const pager=page.locator('.ayu-pagination');await expect(pager.locator('[aria-current]')).toHaveText('1');
  const length=await page.evaluate(()=>history.length);await pager.locator('[data-page="2"]').first().click();await expect(page).toHaveURL(/page=2/);expect(await page.evaluate(()=>history.length)).toBe(length+1);
  await page.goBack();await expect(pager.locator('[aria-current]')).toHaveText('1');await page.goForward();await expect(pager.locator('[aria-current]')).toHaveText('2');
  await page.reload();await expect(pager.locator('[aria-current]')).toHaveText('2');
  await pager.locator('[data-page="3"]').first().click();await pager.locator('[data-page="1"]').first().click();await page.goBack();await expect(pager.locator('[aria-current]')).toHaveText('3');
  await page.goto('https://fixture.test/'+name+'/?page=9999&keep=yes');await expect(pager.locator('[aria-current]')).toHaveText('3');await expect(page).toHaveURL(/page=3&keep=yes/);
  await page.goto('https://fixture.test/'+name+'/?page=-1');await expect(pager.locator('[aria-current]')).toHaveText('1');await expect(page).toHaveURL(new RegExp('/'+name+'/$'));
 });
 test(`${locale} search: 111 posts, boundaries and query/page history`,async({page})=>{
  await setup(page,'search',locale);await page.goto('https://fixture.test/search/');
  for(const n of [1,100,101,111]){const q='Boundary '+String(n).padStart(3,'0');await page.locator('#search-input').fill(q);await page.locator('.search-submit').click();await expect(page.locator('#search-results .post-title-link')).toHaveText(q);}
  await page.locator('#search-input').fill('Boundary');await page.locator('.search-submit').click();await expect(page.locator('#search-state')).toContainText('111 results');
  await page.locator('[data-search-page="2"]').first().click();await expect(page).toHaveURL(/page=2/);await page.goBack();await expect(page.locator('[aria-current]')).toHaveText('1');await page.goForward();await expect(page.locator('[aria-current]')).toHaveText('2');
  await page.reload();await expect(page.locator('[aria-current]')).toHaveText('2');
  await page.locator('#search-input').fill('Boundary 101');await page.locator('.search-submit').click();await expect(page.locator('#search-results .post-title-link')).toHaveText('Boundary 101');
  await page.goBack();await expect(page.locator('#search-input')).toHaveValue('Boundary');await expect(page.locator('[aria-current]')).toHaveText('2');await page.goForward();await expect(page.locator('#search-input')).toHaveValue('Boundary 101');
  await page.goto('https://fixture.test/search/?q=Boundary&page=9999');await expect(page.locator('[aria-current]')).toHaveText('12');await expect(page.locator('#search-results .post-title-link')).toHaveText('Boundary 111');
  await page.locator('#search-input').fill('zzzz-unmatched');await page.locator('.search-submit').click();await expect(page.locator('#search-state')).toHaveText('No posts found.');
  await page.locator('#search-input').fill('');await page.locator('.search-submit').click();await expect(page).toHaveURL('https://fixture.test/search/');await expect(page.locator('#search-results .post-title-link')).toHaveCount(0);
 });
 test(`${locale} search: later API failure never returns partial first 100`,async({page})=>{await setup(page,'search',locale,'page2');await page.goto('https://fixture.test/search/?q=Boundary');await expect(page.locator('#search-state')).toHaveAttribute('data-state','error');await expect(page.locator('#search-results .post-title-link')).toHaveCount(0);});
 test(`${locale} search: late results cannot overwrite a newer query`,async({page})=>{await setup(page,'search',locale,'ok',150);await page.goto('https://fixture.test/search/?q=Boundary');await page.locator('#search-input').fill('Boundary 111');await page.locator('.search-submit').click();await expect(page.locator('#search-results .post-title-link')).toHaveText('Boundary 111');await page.waitForTimeout(250);await expect(page.locator('#search-results .post-title-link')).toHaveText('Boundary 111');});
}
