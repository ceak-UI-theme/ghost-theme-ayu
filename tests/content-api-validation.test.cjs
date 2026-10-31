const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const source=fs.readFileSync('assets/js/lib/content-api.js','utf8');
const posts=Array.from({length:111},(_,i)=>({id:'id-'+i,slug:'post-'+i,title:'Needle '+i,url:'/post-'+i+'/'}));
function page(items,n=1,size=100,total=items.length){const pages=Math.max(1,Math.ceil(total/size));return {posts:items.slice((n-1)*size,n*size),meta:{pagination:{page:n,limit:size,total,pages,next:n<pages?n+1:null,prev:n>1?n-1:null}}};}
function runtime(reply){const calls=[],store=new Map();const ctx=vm.createContext({window:{location:{href:'https://fixture.test/search/'}},document:{querySelector:()=>null},URL,URLSearchParams,sessionStorage:{getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)},fetch:async url=>{calls.push(url);const data=await reply(new URL(url),calls.length);return {ok:true,json:async()=>data}}});vm.runInContext(source,ctx);return {ctx,calls,store};}
(async()=>{let checks=0;
let x=runtime(u=>page(posts,Number(u.searchParams.get('page'))));assert.equal((await x.ctx.fetchAyuContentApiCollection('/ghost/api/content/posts/?page=99&limit=all','posts')).length,111);assert.equal(x.calls.length,2);for(const u of x.calls)assert.equal(new URL(u).searchParams.getAll('page').length,1);checks++;
x=runtime(()=>page([]));assert.equal((await x.ctx.fetchAyuContentApiCollection('/ghost/api/content/posts/','posts')).length,0);checks++;
x=runtime(()=>{const d=page([]);d.meta.pagination.pages=0;return d});assert.equal((await x.ctx.fetchAyuContentApiCollection('/ghost/api/content/posts/','posts')).length,0);checks++;
for(const alter of [()=>({}),d=>({...d,posts:null}),d=>({...d,meta:{}}),d=>{d.posts.pop();return d},d=>{d.meta.pagination.next=1;return d},d=>{delete d.meta.pagination.prev;return d},d=>{d.meta.pagination.total='111';return d},d=>{d.meta.pagination.page=2;return d},d=>{d.posts[0]={};return d},d=>{d.posts[1]=d.posts[0];return d},d=>{d.meta.pagination.pages=999;return d}]){
 x=runtime(()=>alter(page(structuredClone(posts))));await assert.rejects(x.ctx.fetchAyuContentApiCollection('/ghost/api/content/posts/','posts'));checks++;
}
for(const failure of ['network','partial','changed','duplicate']){
 x=runtime(u=>{let n=Number(u.searchParams.get('page'));if(n===2){if(failure==='network')throw Error('offline');if(failure==='partial')return {...page(posts,n),posts:[]};if(failure==='changed')return page(posts,n,100,110);if(failure==='duplicate'){let d=page(posts,n);d.posts[0]=posts[0];return d;}}return page(posts,n)});await assert.rejects(x.ctx.fetchAyuContentApiCollection('/ghost/api/content/posts/','posts'));checks++;
}
x=runtime(u=>page(posts,Number(u.searchParams.get('page'))));await assert.rejects(x.ctx.fetchAyuContentApiCollection('/ghost/api/content/posts/','posts',{maxPages:1}));assert.equal(x.calls.length,1);checks++;
x=runtime((u,n)=>n===1?{}:page([]));await assert.rejects(x.ctx.fetchAyuContentApiCollection('/ghost/api/content/posts/','posts'));assert.equal((await x.ctx.fetchAyuContentApiCollection('/ghost/api/content/posts/','posts')).length,0);checks++;
x=runtime(u=>{const n=Number(u.searchParams.get('page'));return page(posts,n,100,n===2?110:111)});await assert.rejects(x.ctx.fetchAyuContentApiCollection('/ghost/api/content/posts/','posts'));assert.equal(x.store.size,0);checks++;
console.log('PASS:',checks,'Content API completeness/schema/zero/cap/cache recovery scenarios');
})().catch(e=>{console.error(e);process.exitCode=1});
