const fs = require('node:fs');
const H = require('handlebars').create();
const nql = require('@tryghost/nql');
const read = p => fs.readFileSync(p, 'utf8');
const tags = [];
for (const prefix of ['category-', 'series-', '']) {
  for (let i=0;i<24;i++) tags.push({id:'abcdef'+prefix+i,slug:prefix+'tag-'+i,name:`Name ${String(i).padStart(2,'0')} & <tag>`,visibility:'public',count:{posts:24-i},description:'Stored description',url:'/tag/'+prefix+'tag-'+i+'/'});
  tags.push({id:prefix+'zero',slug:prefix+'zero',name:'Zero',visibility:'public',count:{posts:0}});
  tags.push({id:prefix+'internal',slug:prefix+'internal',name:'Internal',visibility:'internal',count:{posts:999}});
}
const posts = [{slug:'post-1',title:'Stored post',url:'/post-1/',published_at:'2026-10-01'}];
H.registerHelper('match', function(a,b,c,d) { const o=d||c; return ((d ? b==='>' && a>c : a===b) ? o.fn(this) : o.inverse(this)); });
H.registerHelper('foreach', function(items,o) {
 const selected=items.slice(Number(o.hash.from||1)-1,o.hash.to?Number(o.hash.to):undefined);
 return selected.length ? selected.map((x,i)=>o.fn(x,{data:H.createFrame({...o.data,index:i,first:i===0})})).join('') : o.inverse(this);
});
H.registerHelper('asset', s=>'/assets/'+s);
H.registerHelper('url', function(){return this.url;});
H.registerHelper('img_url', s=>s);
H.registerHelper('date', ()=> '2026-10-01');
// Fixture adapter exercises real NQL parsing, HBS compilation and nested filter interpolation.
// It is intentionally not presented as a real Ghost renderer.
H.registerHelper('get', function(resource,o) {
 let data=resource==='tags'?tags:posts;
 const filter=(o.hash.filter||'').replace(/{{(id|excludedId)}}/g,(_,key)=>this[key]||'');
 if(filter) data=data.filter(x=>nql(filter).queryJSON(x));
 const order=o.hash.order||'';
 data=[...data].sort((a,b)=> {
  if(order.startsWith('count.posts') && b.count.posts!==a.count.posts) return b.count.posts-a.count.posts;
  return order.includes('name') ? a.name.localeCompare(b.name) : 0;
 });
 const limit=Number(o.hash.limit)||15, page=Number(o.hash.page)||1;
 const next=data.length>page*limit?page+1:null;
 data=data.slice((page-1)*limit,page*limit);
 return o.fn({[resource]:data,pagination:{next}});
});
for(const p of ['hub-tag-card','hub-topic-card','hub-explore-card','hub-category-pages','hub-series-pages','hub-topic-pages']) H.registerPartial(p,read('partials/'+p+'.hbs'));
const configs = [
 ['categories','renderPrimaryCategories',['primary-featured-grid','primary-list-grid','primary-list-pagination']],
 ['series','renderSeriesTags',['series-featured-grid','series-list-grid','series-list-pagination']],
 ['secondary-tags','renderSecondaryTags',['secondary-tags-featured','secondary-tags-grid']],
 ['explore','renderExplorePage',['explore-categories-grid','explore-series-list','explore-topics-grid','explore-recent-list','explore-categories-more','explore-series-more','explore-topics-more']]
];
function render(name,locale) { return H.compile(read('page-'+name+'.hbs'))({}, {data:{custom:{site_locale:locale},site:{url:'https://'+locale+'.example'}}}); }

module.exports = {H,tags,posts,configs,render,read};
