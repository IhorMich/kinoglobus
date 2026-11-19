const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
// Exercise the production pool builder without browser UI or live credentials.
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const source=html.slice(html.indexOf('async function takePool('),html.indexOf('function currentQuery('));
const film=(id,vote_count=200,vote_average=7)=>({id,vote_count,vote_average,adult:false});
function harness(rows,{ignoreVotes=false}={}){
 const calls=[],ctx={MIN_POOL:10,MAX_POOL:100,BIG:new Set(['US']),Math};
 ctx.rouletteApi=async q=>{calls.push(q);const eligible=rows.filter(f=>(ignoreVotes||f.vote_count>=q['vote_count.gte'])&&f.vote_average>=Number(q['vote_average.gte']||0));return {results:eligible.slice((q.page-1)*20,q.page*20),total_results:eligible.length,total_pages:Math.ceil(eligible.length/20)};};
 vm.createContext(ctx);vm.runInContext(source+';globalThis.build=buildPool',ctx);
 return {calls,build:ctx.build};
}
const light={light:true,rmin:'',rmax:''};
test('Nepal films with one vote never qualify and no one-vote fallback runs',async()=>{const h=harness(Array.from({length:15},(_,i)=>film(i+1,1,10)));assert.equal(await h.build('NP',light),null);assert.deepEqual(h.calls.map(q=>q['vote_count.gte']),[200]);});
test('ten eligible films are enough; need not relax thresholds to fill 100 slots',async()=>{const h=harness(Array.from({length:10},(_,i)=>film(i+1)));const r=await h.build('NP',light);assert.equal(r.films.length,10);assert.equal(r.votes,200);assert.equal(r.anyVotes,undefined);});
test('large countries can relax from 800 to 200, never below 200',async()=>{const h=harness(Array.from({length:10},(_,i)=>film(i+1,200)));const r=await h.build('US',light);assert.equal(r.votes,200);assert.deepEqual(h.calls.map(q=>q['vote_count.gte']),[800,200]);});
test('undersized eligible pool is rejected; rating below 6 is excluded',async()=>{const rows=[...Array.from({length:9},(_,i)=>film(i+1)),...Array.from({length:20},(_,i)=>film(i+10,1000,5.9))];assert.equal(await harness(rows).build('NP',light),null);});
test('local guard rejects provider rows that violate vote threshold',async()=>{const h=harness(Array.from({length:15},(_,i)=>film(i+1,1,10)),{ignoreVotes:true});assert.equal(await h.build('NP',light),null);});
test('ordinary search retains its existing fallback',async()=>{const h=harness(Array.from({length:15},(_,i)=>film(i+1,1,7)));const r=await h.build('NP',{rmin:6});assert.equal(r.anyVotes,true);assert.equal(r.votes,1);});
