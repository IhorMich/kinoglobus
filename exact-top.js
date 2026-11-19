/* Exact winner for a fixed catalogue query, with provable weighted-score bounds. */
(() => {
  const M=800,C=6.6,EPS=1e-10,TTL=5*60*1000,cache=new Map();
  function score(f){const v=Number(f.vote_count),r=Number(f.vote_average);return (v*r+M*C)/(v+M);}
  // The weighted score grows with votes above C and falls with votes below C.
  function bound(r,lo,hi){return score({vote_average:r,vote_count:r>=C?hi:lo});}
  // Anything with fewer votes cannot beat best, even with the highest allowed rating.
  function proofVotes(best,maxRating){return best>C&&maxRating>best?Math.max(1,Math.floor(M*(best-C)/(maxRating-best))):1;}
  function failure(code='TOP_UNVERIFIED'){const error=new Error(code);error.code=code;return error;}
  function valid(f){return Number.isSafeInteger(Number(f?.id))&&Number.isInteger(Number(f.vote_count))&&Number(f.vote_count)>=1&&Number.isFinite(Number(f.vote_average))&&Number(f.vote_average)>=0&&Number(f.vote_average)<=10;}
  async function search({params,fetchPage,allows=()=>true,matches=()=>true,cacheKey='',onProgress=()=>{},timeoutMs=90000}){
    const cached=cache.get(cacheKey);
    if(cacheKey&&cached&&Date.now()-cached.time<TTL&&(!cached.value||cached.value.films.every(allows)))return cached.value?{...cached.value,films:cached.value.films.slice()}:null;
    const start=Date.now(),known=new Map(),leaders=new Map();let best=null,requests=0;
    const maxRating=Math.min(10,Number(params['vote_average.lte'])||10),base={...params,'vote_count.gte':1,include_adult:'false'};
    delete base['vote_count.lte'];
    function consider(rows){
      for(const f of rows){if(!valid(f)||!allows(f)||!matches(f))continue;
        const id=Number(f.id),signature=`${Number(f.vote_average)}:${Number(f.vote_count)}`;
        if(known.has(id)&&known.get(id)!==signature)throw failure('TOP_CATALOG_CHANGED');known.set(id,signature);
        if(!best||score(f)>score(best))best=f;
        leaders.set(id,f);if(leaders.size>20){const last=[...leaders.values()].sort((a,b)=>score(b)-score(a)).pop();leaders.delete(Number(last.id));}
      }
    }
    async function page(query,page,expected){
      if(Date.now()-start>timeoutMs)throw failure();
      const data=await fetchPage({...query,page},{fresh:true});requests++;
      if(Date.now()-start>timeoutMs)throw failure();
      const meta=data?._kgRankingPage;
      if(!meta||!Array.isArray(data.results)||Number(data.page)!==page||!Number.isInteger(data.total_pages)||!Number.isInteger(data.total_results)||data.total_results<0||data.total_pages<0)throw failure();
      if(data.total_results===0){if(page!==1||meta.count!==0)throw failure('TOP_CATALOG_CHANGED');return data;}
      if(!meta.valid||!meta.count||data.total_pages<page)throw failure('TOP_CATALOG_CHANGED');
      if(query.sort_by==='vote_count.desc'&&!meta.votesDescending||query.sort_by==='vote_average.desc'&&!meta.ratingDescending)throw failure('TOP_CATALOG_CHANGED');
      if(expected&&(expected.total_pages!==data.total_pages||expected.total_results!==data.total_results))throw failure('TOP_CATALOG_CHANGED');
      consider(data.results);onProgress({requests,checked:known.size});return data;
    }
    const seed=await page({...base,sort_by:'vote_count.desc'},1);
    if(seed.total_results===0){if(cacheKey)cache.set(cacheKey,{time:Date.now(),value:null});return null;}
    const maxVotes=seed._kgRankingPage.vMax;
    if(!Number.isInteger(maxVotes)||maxVotes<1)throw failure();
    const stack=[[1,maxVotes]];
    while(stack.length){
      let [lo,hi]=stack.pop();
      if(best){if(score(best)+EPS>=bound(maxRating,lo,hi))continue;lo=Math.max(lo,proofVotes(score(best),maxRating));}
      if(lo>hi)continue;
      const query={...base,'vote_count.gte':lo,'vote_count.lte':hi,sort_by:'vote_average.desc'};
      if(best&&score(best)>C)query['vote_average.gte']=Math.max(Number(base['vote_average.gte'])||0,Math.floor(score(best)*100)/100);
      const first=await page(query,1);if(!first.total_results)continue;
      let frontier=first._kgRankingPage.rMin;
      if(best&&score(best)+EPS>=bound(frontier,lo,hi))continue;
      // TMDB only exposes pages 1–500. Split a large query into disjoint vote-count bands.
      if(first.total_pages>500||first.total_results>10000){
        if(lo===hi)throw failure();
        const mid=lo+Math.floor((hi-lo)/2);
        if(maxRating>=C)stack.push([lo,mid],[mid+1,hi]);else stack.push([mid+1,hi],[lo,mid]);
        continue;
      }
      for(let p=2;p<=first.total_pages;p++){
        const next=await page(query,p,first),meta=next._kgRankingPage;
        if(meta.rMax>frontier+EPS)throw failure('TOP_CATALOG_CHANGED');frontier=meta.rMin;
        if(best&&score(best)+EPS>=bound(frontier,lo,hi))break;
      }
    }
    const value=best?{films:[...leaders.values()].sort((a,b)=>score(b)-score(a)),winner:best,votes:1,exact:true,checked:known.size,requests,weightedScore:score(best),calculatedAt:new Date().toISOString()}:null;
    if(cacheKey){cache.set(cacheKey,{time:Date.now(),value});if(cache.size>128)cache.delete(cache.keys().next().value);}
    return value?{...value,films:value.films.slice()}:null;
  }
  window.KGExactTop={search,score,bound,proofVotes};
})();
