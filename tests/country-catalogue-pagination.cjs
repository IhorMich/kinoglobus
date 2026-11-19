const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const window={};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../country-statistics.js'),'utf8'),{window,setTimeout:fn=>setTimeout(fn,0),Date,Map,Promise,Error});
const api=window.KGCountryStatistics;
(async()=>{
 const films=Array.from({length:30027},(_,i)=>({id:i+1,title:'Film '+i,vote_count:10+i%1000,vote_average:6,release_date:i<20?'2024-01-01':i<95?'1956-01-01':i<145?'1982-01-01':''}));
 const pools=new Map();let calls=0,maxPage=0,knownTotal=0;
 const loaded=await api.load({key:'capped',request:async(page,filters)=>{
   calls++;maxPage=Math.max(maxPage,page);const low=filters['vote_count.gte'],high=filters['vote_count.lte'];const key=low+':'+high;
   if(!pools.has(key))pools.set(key,films.filter(f=>f.vote_count>=low && (high==null||f.vote_count<=high)).sort((a,b)=>b.vote_count-a.vote_count));
   const pool=pools.get(key);return {total_results:Math.min(20000,pool.length),total_pages:Math.min(1000,Math.ceil(pool.length/20)),results:pool.slice((page-1)*20,page*20)};
 },onProgress:(count,total)=>{if(total!==null){assert.ok(count<=total,`${count} must not exceed ${total}`);knownTotal=total;}}});
 assert.equal(loaded.length,30027);assert.equal(knownTotal,30027);assert.ok(maxPage<=500);assert.ok(calls<1600,'loading terminates after the planned finite pages');
 const ordered=loaded.sort((a,b)=>a.id-b.id);
 assert.equal(api.cataloguePage(ordered,'all').films.length,20);
 let page=api.cataloguePage(ordered,'classic');assert.equal(page.total,75);assert.equal(page.films.length,20);assert.equal(page.films[0].id,21);assert.equal(page.hasMore,true);
 page=api.cataloguePage(ordered,'classic',40);assert.equal(page.films.length,40);assert.equal(page.films[39].id,60);
 page=api.cataloguePage(ordered,'classic',80);assert.equal(page.films.length,75);assert.equal(page.hasMore,false);
 assert.equal(api.cataloguePage(ordered,'newwave').total,50);assert.equal(api.cataloguePage(ordered,'modern').total,20);
 assert.equal(api.eraQuery('classic')['primary_release_date.lte'],'1969-12-31');assert.equal(api.eraQuery('newwave')['primary_release_date.gte'],'1970-01-01');
 const scores=[6.49,6.5,7,7.49,7.5,0,10].map((vote_average,i)=>({id:i+1,vote_average,release_date:i<3?'1989-12-31':'1990-01-01'}));
 assert.deepEqual(Array.from(api.cataloguePage(scores,'rating:7').films,f=>f.vote_average),[6.5,7,7.49]);
 assert.equal(api.cataloguePage(scores,'decade:1980').total,3);
 assert.equal(api.queryForFilter('rating:7')['vote_average.gte'],6.5);
 assert.equal(api.queryForFilter('decade:1980')['primary_release_date.lte'],'1989-12-31');
 console.log('PASS: capped 20,000 count loads all 30,027 films and stops; progress never exceeds total; global era selection and 20/40/final pagination');
})().catch(e=>{console.error(e);process.exitCode=1});
