/* Complete country catalogue statistics, independent of visible catalogue pages. */
(() => {
  const cache=new Map(),ttl=6*60*60*1000;
  const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  async function load({key,request,active=()=>true,onProgress=()=>{}}) {
    let entry=cache.get(key);
    if(!entry || Date.now()-entry.time>ttl){entry={time:Date.now(),pages:new Map(),films:null};cache.set(key,entry);}
    if(entry.films)return entry.films;
    const films=new Map();let expected=0,failed=false;
    const check=()=>{if(failed || !active())throw new Error('cancelled');};
    async function page(low,high,n) {
      check();const id=`${low}:${high}:${n}`;
      if(entry.pages.has(id))return entry.pages.get(id);
      let result;
      for(let attempt=0;attempt<3;attempt++){
        try{result=await request(n,{'vote_count.gte':low,...(high===null?{}:{'vote_count.lte':high}),sort_by:'vote_count.desc'});break;}
        catch(error){check();if(attempt===2)throw error;await pause(500*2**attempt);}
      }
      check();entry.pages.set(id,result);return result;
    }
    function add(result){for(const film of result.results||[])films.set(String(film.id),film);onProgress(films.size,expected);}
    async function segment(low,high) {
      const first=await page(low,high,1);
      if(low===10 && high===null)expected=Number(first.total_results)||0;
      const pages=Number(first.total_pages)||0;
      // Discover permits at most 500 pages. Split by integer vote count,
      // retaining undated films and avoiding overlapping partitions.
      if(pages>500){
        const upper=high??Math.max(...(first.results||[]).map(f=>Number(f.vote_count)||0));
        if(upper<=low)throw new Error('Country catalogue cannot be partitioned completely');
        const middle=Math.floor((low+upper)/2);
        await segment(low,middle);await segment(middle+1,upper);return;
      }
      add(first);let next=2;
      await Promise.all(Array.from({length:Math.min(3,Math.max(0,pages-1))},async()=>{
        while(next<=pages){const n=next++;add(await page(low,high,n));await pause(80);check();}
      }));
    }
    try{await segment(10,null);check();}catch(error){failed=true;throw error;}
    entry.films=[...films.values()];entry.pages.clear();
    // Keep a bounded session cache; interrupted loads retain fetched pages for retry.
    while(cache.size>8)cache.delete(cache.keys().next().value);
    return entry.films;
  }
  window.KGCountryStatistics={load};
})();
