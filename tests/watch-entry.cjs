const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const marks=new Set(),opened=[],committed=[];let allowRemove=false,available=true;
const window={KGIsFilmWatched:id=>marks.has(id),KGToggleWatched:async film=>{if(marks.has(film.id)){if(allowRemove)marks.delete(film.id);return marks.has(film.id);}committed.push(film);marks.add(film.id);return true;},KGOpenCinemaDiaryNote:(film,options)=>{opened.push({film,options});return available?{}:undefined;}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../watch-entry.js'),'utf8'),{window,movieCatalog:{allows:f=>f?.adult===false},Date,Promise,Map});
(async()=>{
 const film={id:11,adult:false,title:'Movie'},pending=window.KGToggleWatched(film);assert.equal(marks.size,0,'opening the sheet must not mark watched');assert.equal(window.KGToggleWatched(film),pending,'double taps share one pending action');assert.equal(opened.length,1);
 const opts=opened[0].options;await opts.commit({date:'2000-01-01',dateUnknown:false,time:'',timeKnown:false,completedAt:null});opts.onSaved();opts.onClose();assert.equal(await pending,true);assert.equal(marks.has(11),true);assert.equal(committed[0]._watchLog.date,'2000-01-01');
 assert.equal(await window.KGToggleWatched(film),true,'cancelled removal preserves the mark');assert.equal(opened.length,1,'repeat watched goes to the existing removal confirmation');allowRemove=true;assert.equal(await window.KGToggleWatched(film),false);
 const cancelled=window.KGToggleWatched({id:12,adult:false});opened.at(-1).options.onClose();assert.equal(await cancelled,false);assert.equal(marks.has(12),false);
 const retry=window.KGToggleWatched({id:12,adult:false});assert.equal(opened.length,3);opened.at(-1).options.onClose();await retry;
 available=false;assert.equal(await window.KGToggleWatched({id:13,adult:false}),false);assert.equal(await window.KGToggleWatched({id:14,adult:true}),false);
 const meta=window.KGWatchEntry.metadata;assert.equal(meta({dateUnknown:true,timeKnown:false,date:'',completedAt:null}).watchedAt,null);assert.equal(meta({date:'2000-01-01',timeKnown:false}).watchedAt,'2000-01-01');assert.equal(meta({date:'2000-01-01',timeKnown:true,time:'21:45',completedAt:'2000-01-01T20:45:00.000Z'}).watchedAt,'2000-01-01T20:45:00.000Z');assert.equal(meta(null,'now').watchedAt,'now');
 console.log('PASS: first-view confirmation, no premature mark, duplicate taps, cancel/retry, removal confirmation, unavailable sheet and accurate watch dates');
})().catch(e=>{console.error(e);process.exitCode=1});
