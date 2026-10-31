const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const source=fs.readFileSync('assets/js/lib/content-api.js','utf8');
function fixture(){const tags=Array.from({length:135},(_,i)=>({id:'tag-'+i,slug:'topic-'+i,name:'Topic '+i,visibility:'public',count:{posts:1}}));const posts=Array.from({length:112},(_,i)=>({id:'post-'+i,slug:'post-'+i,title:'Post '+i,url:'/post-'+i+'/',tags:tags.filter((t,n)=>n%112===i).map(t=>({...t}))}));return {tags,posts};}
function response(items,page,total=items.length){return {items:items.slice((page-1)*100,page*100),meta:{pagination:{page,limit:100,total,pages:Math.max(1,Math.ceil(total/100)),next:page<Math.ceil(total/100)?page+1:null,prev:page>1?page-1:null}}};}
function runtime(f=fixture(),total=f.tags.length,mutate=()=>{},delay=0,session){const store=session||new Map(),calls=[];let fail;
 const ctx=vm.createContext({window:{location:{href:'https://fixture.test/explore/'}},document:{querySelector:()=>null},URL,URLSearchParams,sessionStorage:{getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)},fetch:async raw=>{const u=new URL(raw);calls.push(u);if(delay)await new Promise(r=>setTimeout(r,delay));const key=u.pathname.includes('/tags/')?'tags':'posts',page=Number(u.searchParams.get('page')||1);if(fail)throw Error('offline');const r=response(f[key],page,key==='tags'?total:f.posts.length),data={[key]:structuredClone(r.items),meta:r.meta};await mutate(data,key,page,u);return {ok:true,json:async()=>data}}});vm.runInContext(source,ctx);return {ctx,calls,store,setOffline(v){fail=v},load(url='/ghost/api/content/tags/?order=name%20asc'){return ctx.fetchAyuContentApiCollection(url,'tags')}};}
(async()=>{let checks=0;
 for(const total of [135,151,148]){const r=runtime(fixture(),total),tags=await r.load();assert.equal(tags.length,135);assert.equal(r.calls.length,4);const proof=Object.values(r.ctx.AYU_CONTENT_API_COLLECTIONS).find(x=>x.proof).proof;assert.equal(proof.posts,112);assert.equal(proof.activePublicTags,135);assert([...r.store.keys()].every(k=>!k.includes('/posts/')));checks++;}
 for(const total of [0,3]){const r=runtime({tags:[],posts:[]},total);assert.equal((await r.load()).length,0);checks++;}
 {const f=fixture();f.tags=[];f.posts.forEach(p=>p.tags=[]);assert.equal((await runtime(f,3).load()).length,0);checks++;}
 {const f=fixture();f.tags.push({id:'zero',slug:'zero',name:'Zero',visibility:'public',count:{posts:0}},{id:'internal',slug:'hash-internal',name:'#Internal',visibility:'internal',count:{posts:99}});f.posts[0].tags.push({...f.tags.at(-1)});assert.equal((await runtime(f,153).load()).length,137);checks++;}
 const bad=[
 ['missing active',f=>f.tags.splice(50,1)],
 ['duplicate tag',f=>f.tags[134]={...f.tags[0]}],
 ['public reference absent',f=>f.posts[0].tags.push({id:'missing',slug:'missing',name:'Missing',visibility:'public'})],
 ['slug mismatch',f=>f.posts[0].tags[0].slug='changed'],
 ['name mismatch',f=>f.posts[0].tags[0].name='changed'],
 ['count mismatch',f=>f.tags[0].count.posts=2],
 ['missing relation',f=>delete f.posts[0].tags],
 ['null relation',f=>f.posts[0].tags=null],
 ['bad reference id',f=>delete f.posts[0].tags[0].id],
 ['bad reference visibility',f=>f.posts[0].tags[0].visibility='unknown'],
 ['duplicate relation',f=>f.posts[0].tags.push({...f.posts[0].tags[0]})],
 ['inconsistent post slug',f=>f.posts[1].tags.push({...f.posts[0].tags[0],slug:'different'})],
 ['tag schema',f=>f.tags[0].count.posts='1'],
 ['post schema',f=>delete f.posts[0].url],
 ['zero tag with active refs',f=>f.tags[0].count.posts=0],
 ['all active missing',f=>f.tags=[]],
 ['stale positive tag',f=>f.posts.forEach(p=>p.tags=p.tags.filter(t=>t.id!=='tag-0'))]
 ];
 for(const [name,alter] of bad){const f=fixture();alter(f);const r=runtime(f,151);await assert.rejects(r.load(),undefined,name);assert.equal(Object.keys(r.ctx.AYU_CONTENT_API_COLLECTIONS).length,0,name);checks++;}
 for(const [name,mutate] of [
  ['bad JSON',(d,k)=>{if(k==='tags'){delete d.tags;delete d.meta}}],
  ['tag page failure',(d,k,p)=>{if(k==='tags'&&p===2)throw Error('500')}],
  ['post page failure',(d,k,p)=>{if(k==='posts'&&p===2)throw Error('500')}],
  ['post incomplete',(d,k,p)=>{if(k==='posts'&&p===2)d.posts.pop()}],
  ['next cycle',(d,k)=>{if(k==='tags')d.meta.pagination.next=1}],
  ['total changed',(d,k,p)=>{if(k==='tags'&&p===2)d.meta.pagination.total++}],
  ['post total changed',(d,k,p)=>{if(k==='posts'&&p===2)d.meta.pagination.total++}],
  ['post duplicate',(d,k,p)=>{if(k==='posts'&&p===2)d.posts[0]={...fixture().posts[0]}}]
 ]){const r=runtime(fixture(),151,mutate);await assert.rejects(r.load(),undefined,name);assert.equal(Object.keys(r.ctx.AYU_CONTENT_API_COLLECTIONS).length,0);checks++;}
 {const r=runtime(fixture(),151,()=>{},5);await Promise.all([r.load(),r.load(),r.load()]);assert.equal(r.calls.length,4);await r.load();assert.equal(r.calls.length,4);checks++;}
 {const r=runtime(fixture(),151,()=>{},5);await Promise.all([r.load('/ghost/api/content/tags/?order=name%20asc'),r.load('/ghost/api/content/tags/?order=count.posts%20desc')]);assert.equal(r.calls.filter(u=>u.pathname.includes('/posts/')).length,2);assert.equal(r.calls.length,6);checks++;}
 {let corrupt=true;const r=runtime(fixture(),151,(d,k)=>{if(k==='posts'&&corrupt)delete d.posts[0].tags});await assert.rejects(r.load());assert.equal(r.store.size,0);corrupt=false;assert.equal((await r.load()).length,135);checks++;}
 {const r=runtime(fixture(),151);r.setOffline(true);await assert.rejects(Promise.all([r.load(),r.load()]));r.setOffline(false);assert.equal((await r.load()).length,135);checks++;}
 {const r=runtime(fixture(),151);await r.load();Object.values(r.ctx.AYU_CONTENT_API_COLLECTIONS).forEach(x=>x.expiresAt=0);r.setOffline(true);assert.equal((await r.load()).length,135);assert.equal(r.calls.length,4);checks++;}
 {const r=runtime(fixture(),151);await assert.rejects(r.ctx.fetchAyuContentApiCollection('/ghost/api/content/tags/','tags',{maxPages:1}));assert.equal(r.calls.length,1);checks++;}
 {const r=runtime(fixture(),151);await assert.rejects(r.load('/ghost/api/content/tags/?filter=slug:one'));assert.equal(r.calls.length,0);checks++;}
 {const f=fixture();f.tags=f.tags.slice(0,1);f.tags[0].count.posts=112;f.posts.forEach(p=>p.tags=[{...f.tags[0]}]);const r=runtime(f,1);await assert.rejects(r.ctx.fetchAyuContentApiCollection('/ghost/api/content/tags/','tags',{maxPages:1}));assert.equal(r.calls.length,2);checks++;}
 {const r=runtime(fixture(),151,()=>{},5);await Promise.all([r.load('/ghost/api/content/tags/?include=count.posts&order=name%20asc'),r.load('/ghost/api/content/tags/?order=name%20asc&include=count.posts')]);assert.equal(r.calls.length,4);checks++;}
 {const url='/ghost/api/content/tags/?key=test-only&order=name%20asc';const first=runtime(fixture(),151);await first.load(url);const next=runtime(fixture(),151,()=>{},0,first.store);await next.load(url);assert.equal(next.calls.length,2);assert(next.calls.every(u=>u.pathname.includes('/posts/')));checks++;}
 {const f=fixture();f.tags.splice(50,1);const r=runtime(f,134);await assert.rejects(r.load());checks++;}
 {const f=fixture();f.tags=[];const r=runtime(f,0);await assert.rejects(r.load());checks++;}
 console.log('PASS:',checks,'new tag coverage, strict posts, mismatch, cache, sharing and recovery scenarios');
})().catch(e=>{console.error(e);process.exitCode=1});
