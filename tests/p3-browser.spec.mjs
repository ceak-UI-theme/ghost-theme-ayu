import {test, expect} from '@playwright/test';
import fixture from './hub-fixture.cjs';
const {read,render,tags,coveragePosts}=fixture;
const css=read('assets/built/screen.css');
// Short headers fit four columns at 390px on both Linux and Windows fonts.
const shortTable=(n,heading=i=>`C${i}`)=>`<table class="short" id="short${n}"><thead><tr>${Array.from({length:n},(_,i)=>`<th style="text-align:${i%2?'right':'left'}">${heading(i)}</th>`).join('')}</tr></thead><tbody><tr>${Array.from({length:n},(_,i)=>`<td style="text-align:${i%2?'right':'left'}">${i}</td>`).join('')}</tr><tr><td colspan="${n-1}">Merged</td><td>End</td></tr></tbody></table>`;
const tableBody=`<main class="gh-outer"><article class="gh-inner"><div class="gh-content"><p id="before">Article</p>${[2,3,4].map(n=>shortTable(n)).join('')}${shortTable(4,i=>`Column ${i}`).replace('class="short" id="short4"','id="labelled"')}<table id="wide"><thead><tr>${Array.from({length:12},(_,i)=>`<th>Column ${i}</th>`).join('')}</tr></thead><tbody><tr>${Array.from({length:12},()=>'<td>Long content without wrapping</td>').join('')}</tr></tbody></table><p id="after">Article</p><div class="gist"><table><tr><td style="background-image:linear-gradient(red,blue)">Gist</td></tr></table></div></div></article></main><table id="outside"><tr><td>Outside</td><td>Table</td></tr></table>`;
for(const theme of ['dark','light'])for(const width of [390,1440])test(`table ${theme} ${width}: actual cells fill width with colspan and isolated scroll`,async({page})=>{
 await page.setViewportSize({width,height:844});
 await page.setContent(`<html data-theme="${theme}"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body class="post-template">${tableBody}</body></html>`);
 const inspect=()=>page.evaluate(()=>{
  const wide=document.querySelector('#wide');wide.scrollLeft=200;
  return {short:[...document.querySelectorAll('.short')].map(t=>({width:t.clientWidth,content:document.querySelector('#before').clientWidth,overflow:t.scrollWidth>t.clientWidth,gaps:[...t.rows].map(r=>Math.abs(t.getBoundingClientRect().right-r.cells[r.cells.length-1].getBoundingClientRect().right)),align:[...t.rows[1].cells].map(c=>getComputedStyle(c).textAlign)})),fade:[...document.querySelectorAll('.short td,#wide td')].map(e=>getComputedStyle(e).backgroundImage),wideOverflow:wide.scrollWidth>wide.clientWidth,scroll:wide.scrollLeft,bodyOverflow:document.documentElement.scrollWidth>innerWidth,gist:getComputedStyle(document.querySelector('.gist td')).backgroundImage,excluded:['.gist td','#outside td'].map(sel=>{const c=document.querySelector(sel);return [getComputedStyle(c).width,c.getBoundingClientRect().width]}),before:document.querySelector('#before').getBoundingClientRect().width,after:document.querySelector('#after').getBoundingClientRect().width,color:getComputedStyle(document.querySelector('.short td')).color,bg:getComputedStyle(document.querySelector('.short')).backgroundColor};
 });
 const r=await inspect();

 for(const t of r.short){expect(t.gaps.every(g=>g<=2)).toBeTruthy();expect(Math.abs(t.width-t.content)).toBeLessThanOrEqual(2);expect(t.overflow).toBeFalsy();expect(t.align).toEqual(t.align.map((_,i)=>i%2?'right':'left'));}
 // Longer headers can overflow on Linux mobile fonts: compare the last cell
 // with the scroll box only after reaching its right edge, including colspan rows.
 const labelled=await page.locator('#labelled').evaluate(t=>{
  const before=t.scrollLeft;t.scrollLeft=t.scrollWidth;
  return {clientWidth:t.clientWidth,scrollWidth:t.scrollWidth,before,after:t.scrollLeft,gaps:[...t.rows].map(row=>Math.abs(t.getBoundingClientRect().right-row.cells[row.cells.length-1].getBoundingClientRect().right))};
 });
 expect(labelled.gaps.every(g=>g<=2)).toBeTruthy();
 expect(labelled.after).toBe(Math.max(0,labelled.scrollWidth-labelled.clientWidth));
 expect(r.fade.every(x=>x==='none')).toBeTruthy();expect(r.wideOverflow).toBeTruthy();expect(r.scroll).toBeGreaterThan(0);expect(r.bodyOverflow).toBeFalsy();expect(r.gist).toContain('linear-gradient');expect(r.before).toBe(r.after);expect(r.color).not.toBe(r.bg);
 await page.screenshot({path:test.info().outputPath(`table-${theme}-${width}.png`)});
 // Excluded tables must retain precisely their baseline computed cell sizing.
 await page.addStyleTag({content:'.gh-content table:not(.gist table) :is(th,td){width:revert}'});
 expect((await inspect()).excluded).toEqual(r.excluded);

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
