import {test,expect} from '@playwright/test';
import fixture from './hub-fixture.cjs';
const {configs,render,read}=fixture;
const liveTags=Array.from({length:135},(_,i)=>({id:'live-'+i,slug:(i<45?'category-':i<90?'series-':'')+'live-'+i,name:'Live '+String(i).padStart(3,'0'),visibility:'public',count:{posts:1}}));
const livePosts=Array.from({length:112},(_,i)=>({id:'p-'+i,slug:'p-'+i,title:'Live Post '+i,url:'/p-'+i+'/',published_at:'2026-10-31T01:00:00Z',tags:liveTags.filter((t,n)=>n%112===i)}));
function data(key,all,page,limit,total=all.length){const pages=Math.max(1,Math.ceil(total/limit));return {[key]:all.slice((page-1)*limit,page*limit),meta:{pagination:{page,limit,pages,total,next:page<pages?page+1:null,prev:page>1?page-1:null}}};}
for(const locale of ['ko','en'])for(const [name,fn] of configs)for(const mode of ['mismatch','exact','missing','missing-exact','reference','count','relation','proof500','badJSON','next','changed','zero','deferred'])test(`${locale} ${name}: coverage ${mode}`,async({page})=>{
 const errors=[],warnings=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='warning')warnings.push(m.text())});
 await page.setViewportSize({width:390,height:844});let proofRequests=0,release;const gate=new Promise(r=>{release=r});
 const scripts=['dom-utils','taxonomy','content-api','hub-ui',name+'-page'].map(x=>read('assets/js/lib/'+x+'.js')).join('\n');
 const html='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+read('assets/built/screen.css')+'</style></head><body>'+render(name,locale)+'<script id="ayu-content-key" data-key="test-only"></script><script>'+scripts+'\ninjectPromoSlots=function(){};window.__before=document.querySelector("main").innerHTML;'+fn+'();</script></body></html>';
 await page.route('https://coverage.test/**',async route=>{
  const u=new URL(route.request().url());if(!u.pathname.includes('/ghost/api/content/'))return route.fulfill({contentType:'text/html; charset=utf-8',body:html});
  const key=u.pathname.includes('/tags/')?'tags':'posts',n=Number(u.searchParams.get('page')||1),limit=Number(u.searchParams.get('limit')||100),proof=key==='posts'&&u.searchParams.get('include')==='tags';
  if(proof){proofRequests++;if(mode==='deferred')await gate;if(mode==='proof500'&&n===2)return route.fulfill({status:500,body:'simulated failure'});if(mode==='badJSON')return route.fulfill({contentType:'application/json',body:'{}'});}
  let all=structuredClone(mode==='zero'?[]:key==='tags'?liveTags:livePosts);
  if(['missing','missing-exact'].includes(mode)&&key==='tags')all.splice(50,1);
  if(mode==='count'&&key==='tags')all[0].count.posts++;
  if(mode==='reference'&&proof)all[0].tags[0].slug='changed';
  if(mode==='relation'&&proof)delete all[0].tags;
  const d=data(key,all,n,limit,key==='tags'&&mode!=='zero'?(mode==='missing-exact'?all.length:mode==='exact'?135:locale==='ko'?151:148):all.length);
  if(mode==='next'&&key==='tags')d.meta.pagination.next=1;
  if(mode==='changed'&&key==='tags'&&n===2)d.meta.pagination.total++;
  return route.fulfill({contentType:'application/json',body:JSON.stringify(d)});
 });
 await page.goto('https://coverage.test/'+name+'/',{waitUntil:'domcontentloaded'});
 if(mode==='deferred'){await expect.poll(()=>proofRequests).toBeGreaterThan(0);expect(await page.locator('main').innerHTML()).toBe(await page.evaluate(()=>window.__before));release();}
 if(['mismatch','exact','deferred'].includes(mode)){
  await expect(page.locator('main')).toContainText('Live');
  const proof=await page.evaluate(()=>Object.values(AYU_CONTENT_API_COLLECTIONS).find(x=>x.proof)?.proof);
  expect(proof.posts).toBe(112);expect(proof.activePublicTags).toBe(135);expect(proofRequests).toBe(2);
  expect(await page.evaluate(()=>Object.keys(sessionStorage).filter(k=>{try{const u=new URL(k.replace('ayu-content-api-cache::',''));return u.searchParams.get('include')==='tags'&&u.searchParams.get('fields')==='id,title,slug,url'}catch(e){return false}}).length)).toBe(0);
 }else if(mode==='zero'){
  await expect(page.locator('main')).toContainText(locale==='ko'?'없습니다':'No ');await expect(page.locator('main a[href*="/tag/"]')).toHaveCount(0);
 }else{
  await expect.poll(()=>warnings.length).toBeGreaterThan(0);expect(await page.locator('main').innerHTML()).toBe(await page.evaluate(()=>window.__before));
 }
 expect(errors).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});
