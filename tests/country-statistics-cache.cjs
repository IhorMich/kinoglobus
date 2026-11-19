const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const window={},source=fs.readFileSync(path.join(__dirname,'../country-statistics.js'),'utf8');
let now=Date.now();class Clock extends Date {static now(){return now;}}
vm.runInNewContext(source,{window,setTimeout,Date:Clock,Map,Promise,Error});
const records=new Map(),storage={get:async(s,k)=>structuredClone(records.get(JSON.stringify([s,k]))),put:async(s,k,v)=>{records.set(JSON.stringify([s,k]),structuredClone(v));},prune:async()=>{}};
const make=()=>window.KGCountryStatistics.createLoader({storage,spacing:0,wait:async()=>{}});
const films=Array.from({length:240},(_,i)=>({id:i+1,title:'Film '+i,vote_average:i%10+1,vote_count:100,release_date:'1920-01-01',overview:'Discard this large field'}));
let calls=0,running=0,peak=0,failAt=0;
async function request(n){calls++;running++;peak=Math.max(peak,running);try{await new Promise(r=>setTimeout(r,2));if(n===failAt)throw Error('offline');return {total_results:240,total_pages:12,results:films.slice((n-1)*20,n*20)};}finally{running--;}}
(async()=>{
 const first=await make().load({key:'cache',request});assert.equal(first.length,240);assert.equal(calls,12);assert.ok(peak>3&&peak<=8);assert.equal(first[0].overview,undefined);
 let before=calls;const restored=await make().load({key:'cache',request});assert.equal(restored.length,240);assert.equal(calls,before,'fresh loader uses persistent cache without network');
 failAt=12;await assert.rejects(make().load({key:'resume',request}));await new Promise(r=>setTimeout(r,15));before=calls;failAt=0;const resumed=await make().load({key:'resume',request});assert.equal(resumed.length,240);assert.equal(calls-before,1,'restart downloads only missing checkpoint');
 now+=24*60*60*1000+1;before=calls;await make().load({key:'cache',request});assert.equal(calls-before,12,'expired catalogue is fully refreshed');
 console.log('PASS: persistent cache after restart, resumable checkpoints, 24h refresh, compact records and bounded 8-request concurrency');
})().catch(e=>{console.error(e);process.exitCode=1});
