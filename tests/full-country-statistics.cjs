const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const repo=require('path').resolve(__dirname,'..')+'/';
const window={};vm.runInNewContext(fs.readFileSync(repo+'country-statistics.js','utf8'),{window,setTimeout:fn=>setTimeout(fn,0),Date,Map,Promise,Error});
const stats=vm.runInNewContext(fs.readFileSync(repo+'country-pages.js','utf8').split('  function countryStatistics(')[1].split('  function refreshStatistics(')[0].replace(/^/,'function countryStatistics(')+';countryStatistics');
(async()=>{
 const all=Array.from({length:10027},(_,i)=>({id:i+1,vote_count:10+(i%500),vote_average:i<20?10:5,release_date:i<20?'2020-01-01':i===21?'':'1920-01-01'}));
 let calls=0,maxPage=0;
 const request=async(page,f)=>{calls++;maxPage=Math.max(maxPage,page);const pool=all.filter(x=>x.vote_count>=f['vote_count.gte'] && (f['vote_count.lte']==null||x.vote_count<=f['vote_count.lte'])).sort((a,b)=>b.vote_count-a.vote_count);return {total_results:pool.length,total_pages:Math.ceil(pool.length/20),results:pool.slice((page-1)*20,page*20)};};
 const result=await window.KGCountryStatistics.load({key:'large',request});
 assert.equal(result.length,10027);assert.ok(maxPage<=500);assert.equal(new Set(result.map(x=>x.id)).size,10027);
 const summary=stats(result);assert.equal(summary.range,'1920 — 2020');assert.equal(summary.dated.length,10026);assert.ok(summary.average<5.02);assert.equal(summary.epochs.find(x=>x.key==='1920').films.length,10006);
 const before=calls;await window.KGCountryStatistics.load({key:'large',request});assert.equal(calls,before);
 let allow=true;await assert.rejects(window.KGCountryStatistics.load({key:'cancel',active:()=>allow,request:async()=>{allow=false;return {total_pages:2,results:all.slice(0,20)};}}));
 let broken=true,count=0;
 const retry=async(p)=>{count++;if(p===2&&broken)throw Error('offline');return {total_pages:2,total_results:40,results:all.slice((p-1)*20,p*20)};};
 await assert.rejects(window.KGCountryStatistics.load({key:'retry',request:retry}));broken=false;const recovered=await window.KGCountryStatistics.load({key:'retry',request:retry});assert.equal(recovered.length,40);assert.equal(count,5);
 console.log('PASS: all 10,027 films, >500-page partitioning, undated films, complete average/eras, cache, cancellation and retry');
})().catch(e=>{console.error(e);process.exitCode=1});
