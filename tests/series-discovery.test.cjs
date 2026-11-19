const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');const path=require('node:path');
const file=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
function harness(){const storage=new Map();const window={KGSeries:{rawId:id=>Number(id)-1e12,normalize:f=>({...f,id:1e12+Number(f.id)}),isWatched:()=>false}},ctx={window,filmLocale:'ru-RU',uiText:(s,v={})=>s.replace(/\{(\w+)\}/g,(_,k)=>v[k]??''),pick:rows=>rows[0],shuffle:rows=>rows.slice(),localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)},movieCatalog:{allows:f=>f.adult===false},localizeFilmListItem:f=>f,Map,Set,Date,Math};vm.createContext(ctx);vm.runInContext(file('emmy-winners.js')+file('series-discovery.js'),ctx);return {api:window.KGSeriesDiscovery,ctx,window};}
const film=(v=200,r=7,p=2)=>({id:1e12+41,adult:false,vote_count:v,vote_average:r,popularity:p,origin_country:['JP'],genre_ids:[16]});
test('series top enforces 200 votes and rating 7 while preserving country and genre',()=>{const {api}=harness(),p=api.topParams({with_origin_country:'JP',with_genres:'16','vote_average.gte':8,'vote_average.lte':9});assert.equal(p['vote_count.gte'],200);assert.equal(p['vote_average.gte'],8);assert.equal(p.with_origin_country,'JP');assert.equal(p.with_genres,'16');assert.equal(p['vote_average.lte'],9);});
test('all series surprise levels require good ratings and exclude watched',()=>{const {api,window}=harness();for(const mode of ['light','find','wild']){assert.equal(api.qualifies(film(),mode),true);assert.equal(api.qualifies(film(200,6.9),mode),false);}assert.equal(api.qualifies(film(1,10),'light'),false);assert.equal(api.qualifies(film(29),'find'),false);assert.equal(api.qualifies(film(1501),'find'),false);assert.equal(api.qualifies(film(200,8,26),'find'),false);window.KGSeries.isWatched=()=>true;assert.equal(api.qualifies(film(),'light'),false);});
test('surprise pool rejects mismatched country, genre and low-vote provider rows',async()=>{const {api,window}=harness();window.KGSeries.discover=async()=>({total_pages:1,total_results:4,results:[film(),{...film(),id:1e12+42,origin_country:['US']},{...film(),id:1e12+43,genre_ids:[35]},{...film(1,10),id:1e12+44}]});const r=await api.surprisePool('JP',{g:'16',seriesSurprise:'light'});assert.equal(r.films.length,1);assert.equal(r.films[0].id,1e12+41);});
test('expanded Emmy registry contains distinct TV series, official winner evidence and safe snapshots',()=>{
 const {window}=harness(),data=window.KGEmmyWinners;
 assert.ok(data.entries.length>400);assert.equal(data.seriesCount,data.entries.length);
 assert.equal(new Set(data.entries.map(e=>e.id)).size,data.seriesCount);
 const awards=data.entries.flatMap(e=>e.awards);assert.equal(data.awardCount,awards.length);
 assert.equal(new Set(awards.map(a=>a.awardId)).size,awards.length);
 assert.deepEqual(Array.from(data.searchedYears),[1949,2026]);
 for(const e of data.entries){assert.equal(e.film.id,e.id);assert.equal(e.film.adult,false);assert.equal(e.film.media_type,'tv');assert.ok(e.film.release_date.startsWith(String(e.startYear)));assert.ok(e.film.title);assert.ok(e.film.title_en);assert.ok(e.awards.length);}
 for(const a of awards){assert.equal(a.isWinner,true);assert.ok(a.sourceCategory);assert.ok(a.awardId);assert.ok(a.source.startsWith('https://www.televisionacademy.com/'));}
 for(const category of ['drama','comedy','limited','animation','lead','supporting','guest','voice','directing','writing'])assert.ok(awards.some(a=>a.category===category),category);
});
test('Emmy catalogue loading makes no per-entry network requests and excludes restricted snapshots',async()=>{
 const {api,window,ctx}=harness();let calls=0;ctx.requestTmdb=async()=>{calls++;throw new Error('offline');};
 const count=window.KGEmmyWinners.entries.length;window.KGEmmyWinners.entries[0].film.adult=true;
 const rows=await api.emmySeries();assert.equal(calls,0);assert.equal(rows.length,count-1);assert.ok(rows.every(f=>f.id>1e12&&f._emmyAwards.length));
});
test('Emmy recency avoids watched/recent series and changes era when possible',()=>{
 const {api,window}=harness();const rows=[{id:1e12+1,release_date:'1960-01-01',genre_ids:[18]},{id:1e12+2,release_date:'2020-01-01',genre_ids:[35]},{id:1e12+3,release_date:'2021-01-01',genre_ids:[18]}];
 api.remember(rows[0].id);window.KGSeries.isWatched=id=>id===rows[2].id;
 const next=api.candidates(rows);assert.equal(next[0].id,rows[1].id);assert.ok(next.every(f=>f.id!==rows[0].id&&f.id!==rows[2].id));
});
test('Emmy category captions identify acting and writing awards without calling them best-series wins',()=>{
 const {api}=harness();const acting=api.awardText({id:1e12+999,_emmyAwards:[{category:'lead',year:2000}]});
 const writing=api.awardText({id:1e12+999,_emmyAwards:[{category:'writing',year:2001}]});
 assert.ok(acting.includes('главная роль'));assert.ok(writing.includes('сценарий'));
});
test('award caption preserves winning anthology season and award year',()=>{const {api}=harness();const text=api.awardText({id:1e12+64513});assert.ok(text.includes('2018'));assert.ok(text.includes('Сезон 2'));});
test('Emmy search refreshes only chosen candidates, retries a failed card and uses the shared presentation',async()=>{
 const {api,ctx,window}=harness(),all=await api.emmySeries(),allowed=all.slice(0,2),requested=[],shown=[];
 const nodes={go:{disabled:false},err:{textContent:''}};
 ctx.$=id=>nodes[id];ctx.apiKey='fixture';ctx.audio=()=>{};ctx.lockSpin=()=>{};ctx.reelStart=()=>{};ctx.reelAbort=()=>{};ctx.unlockSpin=()=>{};
 window.KGSeries.isWatched=id=>!allowed.some(f=>f.id===id);
 ctx.filmDetails=async id=>{requested.push(id);if(requested.length===1)throw new Error('offline');const f=allowed.find(f=>f.id===id);return {adult:false,title:f.title,originalTitle:f.original_title,release:f.release_date,posterPath:f.poster_path,votes:f.vote_count,average:f.vote_average};};
 ctx.presentFilmSearchResult=async(cc,pool,film)=>shown.push({cc,pool,film});
 await api.spinEmmy();assert.equal(requested.length,2);assert.equal(shown.length,1);assert.equal(shown[0].pool.emmy,true);assert.ok(shown[0].film.id>1e12);assert.equal(nodes.err.textContent,'');
});
