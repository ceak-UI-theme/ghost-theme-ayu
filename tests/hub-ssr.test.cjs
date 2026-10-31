const {H,tags,posts,configs,render,read} = require('./hub-fixture.cjs');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function runtime(name,fn,ids,mode,locale='en',search='') {
 const elements=Object.fromEntries(ids.map(id=>[id,{innerHTML:'<a href="/ssr/">SSR</a>',hidden:false,events:{},addEventListener(n,f){this.events[n]=f;}}]));
 const events={}; const loc=new URL('https://example.com/'+name+'/'+search);
 const window={location:loc,history:{replaceState(a,b,path){ const u=new URL(path,loc);loc.href=u.href;}},addEventListener(n,f){events[n]=f;}};
 const ctx=vm.createContext({window,document:{getElementById:id=>elements[id],querySelector:selector=>selector==='[data-hub-locale]'?{getAttribute:()=>locale}:selector==='#ayu-content-key'?{getAttribute:()=>mode==='missing'?'':'key'}:null},URL,URLSearchParams,console,
 sessionStorage:{getItem(){return null;},setItem(){}},
 fetch:async input=> {
   if(mode==='network') throw new Error('offline');
   const url=new URL(input,'https://example.com');
   if(mode==='partial' && url.pathname.includes('/posts/')) throw new Error('partial failure');
   if(mode==='page2' && url.searchParams.get('page')==='2') throw new Error('page 2 failure');
   if(mode==='malformed') return {ok:true,json:async()=>{throw new Error('invalid JSON');}};
   const all=mode==='empty'?[]:url.pathname.includes('/tags/')?tags:posts;
   const page=Number(url.searchParams.get('page')||1), size=20;
   return {ok:['ok','empty','partial','page2'].includes(mode),status:Number(mode)||200,json:async()=>url.pathname.includes('/tags/')?{tags:all.slice((page-1)*size,page*size),meta:{pagination:{next:all.length>page*size?page+1:null}}}:{posts:all}};
 }});
 vm.runInContext(read('assets/js/lib/dom-utils.js')+'\n'+read('assets/js/lib/taxonomy.js')+'\n'+read('assets/js/lib/content-api.js')+'\n'+read('assets/js/lib/hub-ui.js')+'\n'+read('assets/js/lib/'+name+'-page.js'),ctx);
 ctx.logAyuWarning=()=>{};ctx.injectPromoSlots=()=>{};
 ctx[fn]();
 return {elements,events,window,ctx};
}
(async()=>{
 let checks=0;
 for(const [name,fn,ids] of configs) {
  for(const locale of ['ko','en']) {
   const html=render(name,locale);
   assert.match(html, /href="\/tag\//); assert.doesNotMatch(html,/\/zero\/|\/internal\//);
   assert.doesNotMatch(html,/rel="canonical"|property="og:/);
   assert.match(html,locale==='ko'?/카테고리|시리즈|주제/:/Categories|Series|Topics/);
   const titles=[...html.matchAll(/class="(?:post-title-link|secondary-tag-card|explore-topic-card)" href="([^"]+)"/g)].map(m=>m[1]);
   assert.equal(new Set(titles).size,titles.length);
   if(name!=='explore') assert.equal(titles.length,name==='secondary-tags'?23:24); // topic featured has a different class
   if(name==='categories') assert.doesNotMatch(html,/href="\/tag\/(?:series-|tag-)/);
   if(name==='series') assert.doesNotMatch(html,/href="\/tag\/(?:category-|tag-)/);
   if(name==='secondary-tags') assert.doesNotMatch(html,/href="\/tag\/(?:category-|series-)/);
   checks++;
  }
  for(const failure of ['missing','401','403','500','network','malformed','page2',...(name==='explore'?['partial']:[])]) {
   const r=runtime(name,fn,ids,failure); await new Promise(setImmediate);
   for(const e of Object.values(r.elements)) { assert.equal(e.innerHTML,'<a href="/ssr/">SSR</a>');assert.equal(e.hidden,false); }
   checks++;
  }
  for(const mode of ['ok','empty']) for(const locale of ['ko','en']) {
   const r=runtime(name,fn,ids,mode,locale,'?page=2&keep=yes'); await new Promise(setImmediate);
   assert.doesNotMatch(r.elements[ids[0]].innerHTML,/SSR/);
   if(mode==='ok') {
    const combined=ids.slice(0,name==='explore'?3:2).map(id=>r.elements[id].innerHTML).join('');
    assert.doesNotMatch(combined,/\/zero\/|\/internal\//);assert.match(combined,/Name 00 &amp; &lt;tag&gt;/);
    if(name==='categories'||name==='series') {
     assert.equal(r.window.location.search,'?page=2&keep=yes');
     const allList=r.window[name==='categories'?'__ayuPrimaryCategoryList':'__ayuSeriesTagList'];
     const ssr=[...render(name,locale).matchAll(/class="post-title-link" href="([^"]+)"/g)].map(m=>m[1]);
     assert.deepEqual(Array.from(allList,x=>'/tag/'+x.slug+'/'),ssr.slice(1));
     const pager=r.elements[ids[2]];
     pager.events.click({target:{closest:()=>({getAttribute:()=> '1'})}});
     assert.equal(r.window.location.search,'?keep=yes');
     r.window.location.search='?page=3&keep=yes'; r.events.popstate();
     assert.match(pager.innerHTML,/aria-current="page">3/);
     assert.doesNotMatch(r.elements[ids[1]].innerHTML,/\/tag\/(?:category-|series-)tag-0\//);
    }
   } else assert.match(r.elements[ids[0]].innerHTML,locale==='ko'?/없습니다/:/No /);
   checks++;
  }
 }
 for(let i=24;i<225;i++) tags.push({id:'abcdefcategory-'+i,slug:'category-tag-'+i,name:'Extra '+i,visibility:'public',count:{posts:1},url:'/tag/category-tag-'+i+'/'});
 const large=render('categories','en');
 assert.equal([...large.matchAll(/class="post-title-link" href=/g)].length,225);
 assert.match(large,/category-tag-224/);assert.match(large,/<details/);checks++;
 const savedTags=tags.splice(0), savedPosts=posts.splice(0);
 for(const [name] of configs) {
  const html=render(name,'ko');assert.doesNotMatch(html,/href="\/tag\//);assert.match(html,/없습니다/);checks++;
 }
 tags.push(...savedTags);posts.push(...savedPosts);
 // HBS syntax for every theme template, plus no temporary override wiring.
 for(const p of fs.readdirSync('.').filter(p=>p.endsWith('.hbs'))) H.precompile(read(p));
 assert.doesNotMatch(read('default.hbs'),/hub-ssr-override/);
 console.log(`PASS: ${checks} hub SSR/JS fixture scenarios; HBS syntax, real NQL, classification, escaping, fallback, query/pagination/popstate.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
