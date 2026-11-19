const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const values=new Map(),window={KGSeries:{rawId:id=>id-1e12},KGWatchedButtonHtml:()=>'<button data-film-watched>Watched</button>'};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../series-detail.js'),'utf8'),{window,document:{addEventListener(){}},localStorage:{getItem:k=>values.get(k)||null},Set,Map,WeakMap,Date,Number,interfaceLanguage:'ru',uiText:(s,p={})=>s.replace(/\{(\w+)\}/g,(_,k)=>p[k]??''),cname:s=>s,kgBookmarkButton:()=>'<button data-kg-bookmark>Bookmark</button>'});
const detail=window.KGSeriesDetail;
assert.equal(detail.initialSeason([{season_number:0,episode_count:2},{season_number:1,episode_count:9}]),1);
assert.equal(detail.initialSeason([{season_number:0,episode_count:2}]),0);
assert.equal(detail.initialSeason([]),null);
const episodes=[{episode_number:1},{episode_number:2},{episode_number:3}];
const marks=new Set(['1:1','1:3','2:2']);const p=detail.progress(episodes,marks,1);assert.equal(p.count,2);assert.equal(p.total,3);assert.equal(p.percent,67);
assert.equal(detail.progress([],marks,1).percent,0);assert.equal(detail.progress(episodes,marks,2).count,1);
values.set('kgSeries.episodes.v1.42',JSON.stringify(['1:1','1:2','not an episode',3]));assert.deepEqual(Array.from(detail.readMarks(1e12+42)),['1:1','1:2']);assert.equal(detail.readMarks(1e12+43).size,0);
values.set('kgSeries.episodes.v1.42','broken');assert.equal(detail.readMarks(1e12+42).size,0);
console.log('PASS: season selection, specials, exact watched episode progress, isolated series storage and malformed data');

const html=detail.markup({id:1e12+99,title:'<Series>',overview:'Test synopsis',adult:false,seasons:[{season_number:1,episode_count:2}],number_of_seasons:1,number_of_episodes:2,_trailer:null,_trailerStatus:'missing'});assert.ok(html.includes('&lt;Series&gt;'));assert.ok(html.includes('data-series-season="1"'));assert.ok(html.includes('data-series-trailer disabled'));assert.equal(html.includes('S1E1'),false);assert.equal(html.includes('4K'),false);assert.equal(html.includes('Кинопоиск'),false);assert.equal(html.includes('audio-track'),false);console.log('PASS: series layout has safe titles, actual season tabs and no invented streaming or playback metadata');
