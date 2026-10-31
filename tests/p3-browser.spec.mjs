import {test, expect} from '@playwright/test';
import fixture from './hub-fixture.cjs';
const {read,render,tags,coveragePosts}=fixture;
const css=read('assets/built/screen.css');
const tableBody='<main class="gh-outer"><article class="gh-inner"><div class="gh-content"><p id="before">본문 / Article text</p><table id="short"><thead><tr><th>한글</th><th>English</th></tr></thead><tbody><tr><td>가</td><td>One</td></tr><tr><td>나</td><td>Two</td></tr></tbody></table><table id="wide"><thead><tr>'+Array.from({length:12},(_,i)=>'<th>Column '+i+'</th>').join('')+'</tr></thead><tbody><tr>'+Array.from({length:12},()=>'<td>긴 내용 Long content without wrapping</td>').join('')+'</tr></tbody></table><p id="after">본문 / Article text</p><div class="gist"><table><tr><td style="background-image:linear-gradient(red,blue)">Gist</td></tr></table></div></div></article></main>';
for(const theme of ['dark','light'])for(const width of [390,1440])test(`table ${theme} ${width}: no fades, full width, isolated horizontal scroll`,async({page})=>{
 await page.setViewportSize({width,height:844});await page.setContent(`<html data-theme="${theme}"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body class="post-template">${tableBody}</body></html>`);
 const result=await page.evaluate(()=>{
  const short=document.querySelector('#short'),wide=document.querySelector('#wide'),before=document.querySelector('#before'),after=document.querySelector('#after');
  wide.scrollLeft=200;
  return {fade:[...document.querySelectorAll('#short td,#wide td')].map(e=>getComputedStyle(e).backgroundImage),shortWidth:short.getBoundingClientRect().width,contentWidth:before.getBoundingClientRect().width,shortOverflow:short.scrollWidth>short.clientWidth,wideOverflow:wide.scrollWidth>wide.clientWidth,scrollLeft:wide.scrollLeft,bodyOverflow:document.documentElement.scrollWidth>innerWidth,before:[before.offsetLeft,before.offsetWidth],after:[after.offsetLeft,after.offsetWidth],gist:getComputedStyle(document.querySelector('.gist td')).backgroundImage,color:getComputedStyle(short.querySelector('td')).color,background:getComputedStyle(short).backgroundColor};
 });
 expect(result.fade.every(x=>x==='none')).toBeTruthy();expect(Math.abs(result.shortWidth-result.contentWidth)).toBeLessThan(2);expect(result.shortOverflow).toBeFalsy();expect(result.wideOverflow).toBeTruthy();expect(result.scrollLeft).toBeGreaterThan(0);expect(result.bodyOverflow).toBeFalsy();expect(result.after).toEqual(result.before);expect(result.gist).toContain('linear-gradient');expect(result.color).not.toBe(result.background);
 await page.screenshot({path:test.info().outputPath(`table-${theme}-${width}.png`)});
});
const common=['dom-utils','taxonomy','content-api','hub-ui'].map(n=>read('assets/js/lib/'+n+'.js')).join('\n');
for(const hub of ['categories','series'])for(const locale of ['ko','en'])for(const width of [390,1440])for(const mode of ['off','ok','failure'])test(`${hub} ${locale} ${width} ${mode}: classification badges survive`,async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:mode!=='off',viewport:{width,height:844}}),page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const fn=hub==='categories'?'renderPrimaryCategories':'renderSeriesTags',ready=hub==='categories'?'__ayuPrimaryCategoryList':'__ayuSeriesTagList';
 const body=render(hub,locale),code=common+'\n'+read('assets/js/lib/'+hub+'-page.js')+`;window.__warnings=[];logAyuWarning=(...args)=>window.__warnings.push(String(args[0]));injectPromoSlots=()=>{};window.__ssr=document.querySelector('main').innerHTML;${fn}();normalizePostTaxonomyTags(document);`;
 const html=`<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body>${body}<script id="ayu-content-key" data-key="test-only"></script><script>${code}</script></body></html>`;
 await page.route('https://fixture.test/**',async route=>{
  const url=new URL(route.request().url());if(!url.pathname.includes('/ghost/api/content/'))return route.fulfill({contentType:'text/html; charset=utf-8',body:html});
  if(mode==='failure')return route.fulfill({status:500,body:'Browser-only test failure'});
  const key=url.pathname.includes('/tags/')?'tags':'posts',items=key==='tags'?[...tags].sort((a,b)=>url.searchParams.get('order')?.startsWith('name')?a.name.localeCompare(b.name)||a.slug.localeCompare(b.slug):b.count.posts-a.count.posts||a.name.localeCompare(b.name)||a.slug.localeCompare(b.slug)):coveragePosts;
  const limit=key==='tags'?20:100,n=Number(url.searchParams.get('page')||1),pages=Math.ceil(items.length/limit);await route.fulfill({contentType:'application/json',body:JSON.stringify({[key]:items.slice((n-1)*limit,n*limit),meta:{pagination:{page:n,limit,pages,total:items.length,next:n<pages?n+1:null,prev:n>1?n-1:null}}})});
 });
 await page.goto('https://fixture.test/'+hub+'/');
 if(mode==='ok')await expect.poll(()=>page.evaluate(key=>Boolean(window[key]),ready)).toBeTruthy();
 if(mode==='failure')await expect.poll(()=>page.evaluate(()=>window.__warnings.length)).toBeGreaterThan(0);
 if(mode!=='off')await page.evaluate(()=>normalizePostTaxonomyTags(document));
 const label=locale==='ko'?(hub==='categories'?'카테고리':'시리즈'):(hub==='categories'?'Category':'Series');
 const badges=page.locator('main .post-meta .post-tag');expect(await badges.count()).toBe(mode==='ok'?11:24);await expect(badges.first()).toBeVisible();expect((await badges.allTextContents()).every(x=>x===label)).toBeTruthy();
 if(mode==='failure')expect(await page.locator('main').innerHTML()).toBe(await page.evaluate(()=>window.__ssr));
 expect(await page.locator('main .post-title-link').count()).toBe(mode==='ok'?11:24);expect(errors).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 await page.screenshot({path:test.info().outputPath(`badge-${hub}-${locale}-${width}-${mode}.png`)});await context.close();
});
test('tag normalization preserves labels but still removes explicit internal tags',async({page})=>{
 await page.setContent('<div class="post-meta"><span class="post-tag">Category</span><span class="post-tag" data-tag-visibility="internal">Hidden label</span><a class="post-tag" data-tag-visibility="internal" href="/tag/hash-private/">Internal</a><a class="post-tag" href="/tag/category-docs/">Docs</a></div>');
 await page.addScriptTag({content:read('assets/js/lib/taxonomy.js')});await page.evaluate(()=>{normalizePostTaxonomyTags(document);normalizePostTaxonomyTags(document)});
 await expect(page.locator('.post-tag')).toHaveCount(2);await expect(page.locator('span.post-tag')).toHaveText('Category');await expect(page.locator('a.post-tag')).toHaveAttribute('data-taxonomy-role','category');await expect(page.locator('a.post-tag')).toHaveAttribute('href','/tag/category-docs/');
});
