const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const source=html.slice(html.indexOf('async function spinTop(){'),html.indexOf('const OSCAR_LIST='));
function harness({winner=30,watched=false,fail=[],explicit=false}={}){
 const countries=Array.from({length:45},(_,i)=>'C'+i),nodes={go:{disabled:false},err:{textContent:''},year:{value:''},yearTo:{value:''}};
 const calls=[],shown=[],ctx={window:{KGSeries:{active:true},KGSeriesDiscovery:{topCountries:async(base,order)=>order}},$:id=>nodes[id],apiKey:'fixture',store:{set:()=>{}},audio:()=>{},topQuery:()=>({g:'',rmin:'6',rmax:'',y:'',yto:'',countries:explicit?countries:null}),countryFilters:new Set(explicit?countries:[]),lockSpin:()=>{},unlockSpin:()=>{},closePlayer:()=>{},reelStart:()=>{},reelAbort:()=>{},spinOrder:x=>x,COUNTRIES:countries,topYear:()=>({from:'',to:''}),poolBase:()=>({}),uiText:x=>x,shuffle:x=>x,discoverySeen:()=>watched};
 ctx.window.KGFrameSelectedCountry=()=>{};ctx.topOfCountry=async cc=>{calls.push(cc);if(fail.includes(cc))throw new Error('TMDB temporarily unavailable');return cc===countries[winner]?{films:[{id:1e12+7,adult:false}],exact:true,top1:true}:null;};
 ctx.presentFilmSearchResult=async(cc,pool,film)=>shown.push({cc,pool,film});vm.createContext(ctx);vm.runInContext(source+';globalThis.run=spinTop',ctx);return {ctx,calls,shown,nodes};
}
test('series Top-1 scans beyond the former 24-country limit',async()=>{const h=harness();await h.ctx.run();assert.equal(h.shown[0].cc,'C30');assert.ok(h.calls.length>24);});
test('watched country winner remains the true TV Top-1',async()=>{const h=harness({winner:0,watched:true});await h.ctx.run();assert.equal(h.shown[0].film.id,1e12+7);});
test('one failing country does not discard a valid winner in the same batch',async()=>{const h=harness({winner:1,fail:['C0']});await h.ctx.run();assert.equal(h.shown[0].cc,'C1');assert.equal(h.nodes.err.textContent,'');});
test('network failure is reported instead of a false no-results message',async()=>{const h=harness({winner:-1,fail:['C0']});await h.ctx.run();assert.equal(h.nodes.err.textContent,'TMDB temporarily unavailable');});
test('explicit TV country selections also have no arbitrary 40-country cut-off',async()=>{const h=harness({winner:44,explicit:true});await h.ctx.run();assert.equal(h.shown[0].cc,'C44');});
test('Top-1 progress does not replace the search button label',()=>{const section=html.slice(html.indexOf('async function topOfCountry'),html.indexOf('async function presentFilmSearchResult'));assert.ok(!section.includes('onProgress'));assert.ok(!section.includes('btn-spin-text'));});
