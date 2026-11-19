/* Complete country statistics with persistent, resumable catalogue caching. */
(() => {
  const ttl=24*60*60*1000;
  const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  function persistentStorage(){
    let connection;
    function database(){
      if(!connection)connection=new Promise(resolve=>{
        if(!window.indexedDB){resolve(null);return;}
        try{
          const request=window.indexedDB.open('moven-country-statistics',2);
          request.onupgradeneeded=event=>{for(const name of ['catalogues','pages','films'])if(!request.result.objectStoreNames.contains(name))request.result.createObjectStore(name);if(event.oldVersion===1){request.transaction.objectStore('catalogues').clear();request.transaction.objectStore('pages').clear();}};
          request.onsuccess=()=>resolve(request.result);request.onerror=request.onblocked=()=>resolve(null);
        }catch(_){resolve(null);}
      });
      return connection;
    }
    async function operation(store,key,value,write=false){
      const db=await database();if(!db)return;
      return new Promise(resolve=>{
        try{
          const tx=db.transaction(store,write?'readwrite':'readonly'),object=tx.objectStore(store);
          const request=write?object.put(value,key):object.get(key);
          tx.oncomplete=()=>resolve(request.result);tx.onerror=tx.onabort=()=>resolve();
        }catch(_){resolve();}
      });
    }
    async function prune(){
      const db=await database();if(!db)return;
      // Bound storage to 12 countries; remove expired and completed checkpoints.
      return new Promise(resolve=>{
        try{
          const tx=db.transaction(['catalogues','pages','films'],'readwrite'),catalogues=tx.objectStore('catalogues'),pages=tx.objectStore('pages'),films=tx.objectStore('films');
          const request=catalogues.getAll();request.onsuccess=()=>{
            const keep=new Set(request.result.filter(x=>Date.now()-x.time<ttl).sort((a,b)=>b.time-a.time).slice(0,12).map(x=>x.key));
            const completed=new Set(request.result.filter(x=>x.complete).map(x=>x.key));
            catalogues.openCursor().onsuccess=e=>{const c=e.target.result;if(c){if(!keep.has(c.key))c.delete();c.continue();}};
            films.openKeyCursor().onsuccess=e=>{const c=e.target.result;if(c){if(!keep.has(c.key))c.delete();c.continue();}};
            pages.openCursor().onsuccess=e=>{const c=e.target.result;if(c){if(!keep.has(c.value.key)||completed.has(c.value.key)||Date.now()-c.value.time>=ttl)c.delete();c.continue();}};
          };
          tx.oncomplete=tx.onerror=tx.onabort=()=>resolve();
        }catch(_){resolve();}
      });
    }
    return {get:(store,key)=>operation(store,key),put:(store,key,value)=>operation(store,key,value,true),prune};
  }
  // Store only fields needed for the charts, film list and opening a film card.
  function compact(f){return {id:f.id,title:f.title,original_title:f.original_title,release_date:f.release_date,vote_average:f.vote_average,vote_count:f.vote_count,poster_path:f.poster_path,origin_country:f.origin_country,popularity:f.popularity,adult:f.adult};}
  function createLoader({storage=persistentStorage(),concurrency=8,spacing=35,wait=pause}={}){
    const cache=new Map(),queue=[];let running=0,nextStart=0;
    function schedule(task,check){return new Promise((resolve,reject)=>{queue.push({task,check,resolve,reject});pump();});}
    function pump(){
      while(running<concurrency && queue.length){
        const job=queue.shift();running++;
        (async()=>{
          job.check();const delay=Math.max(0,nextStart-Date.now());nextStart=Math.max(nextStart,Date.now())+spacing;
          if(delay)await wait(delay);job.check();return job.task();
        })().then(job.resolve,job.reject).finally(()=>{running--;pump();});
      }
    }
    async function load({key,request,active=()=>true,onProgress=()=>{}}){
      let entry=cache.get(key);
      if(!entry || Date.now()-entry.time>=ttl){
        const saved=await storage.get('catalogues',key);
        const fresh=saved && Date.now()-saved.time<ttl;
        const storedFilms=fresh && saved.complete?await storage.get('films',key):null;
        entry=fresh?{...saved,films:storedFilms?.time===saved.time?storedFilms.films:null,pages:new Map()}:{key,time:Date.now(),pages:new Map(),films:null};
        cache.set(key,entry);
        if(!entry.films)await storage.put('catalogues',key,{key,time:entry.time});
      }
      if(!active())throw new Error('cancelled');
      if(entry.films)return entry.films;
      const films=new Map();let expected=0,failed=false;
      const check=()=>{if(failed || !active())throw new Error('cancelled');};
      async function page(low,high,n){
        check();const id=`${low}:${high}:${n}`;
        if(entry.pages.has(id))return entry.pages.get(id);
        const saved=await storage.get('pages',[key,id]);check();
        if(saved?.time===entry.time){entry.pages.set(id,saved.result);return saved.result;}
        let result;
        for(let attempt=0;attempt<3;attempt++){
          try{
            result=await schedule(()=>request(n,{'vote_count.gte':low,...(high===null?{}:{'vote_count.lte':high}),sort_by:'vote_count.desc'}),check);
            if(!Array.isArray(result?.results) || !Number.isFinite(Number(result.total_pages)))throw new Error('Invalid country catalogue response');
            break;
          }catch(error){check();if(attempt===2)throw error;await wait(500*2**attempt);}
        }
        check();result={total_results:result.total_results,total_pages:result.total_pages,results:result.results.map(compact)};
        entry.pages.set(id,result);await storage.put('pages',[key,id],{key,time:entry.time,result});check();return result;
      }
      function add(result){
        for(const film of result.results)films.set(String(film.id),film);
        onProgress(films.size,Math.max(expected,films.size));
      }
      const leaves=[];
      async function plan(low,high){
        const first=await page(low,high,1),pages=Number(first.total_pages)||0;
        if(pages>500 || Number(first.total_results)>10000){
          const upper=high??Math.max(...first.results.map(f=>Number(f.vote_count)||0));
          if(upper<=low)throw new Error('Country catalogue cannot be partitioned completely');
          const middle=Math.floor((low+upper)/2);
          await Promise.all([plan(low,middle),plan(middle+1,upper)]);return;
        }
        leaves.push({low,high,first,pages});
      }
      async function segment({low,high,first,pages}){
        add(first);let next=2;
        await Promise.all(Array.from({length:Math.min(concurrency,Math.max(0,pages-1))},async()=>{
          while(next<=pages){check();add(await page(low,high,next++));}
        }));
      }
      try{
        onProgress(0,null);await plan(10,null);check();
        // The broad discover count may be capped. Only disjoint, accessible
        // leaf queries can supply the denominator for the full catalogue.
        expected=leaves.reduce((sum,leaf)=>sum+(Number(leaf.first.total_results)||0),0);
        await Promise.all(leaves.map(segment));check();onProgress(films.size,films.size);
      }catch(error){failed=true;throw error;}
      entry.films=[...films.values()];entry.pages.clear();entry.time=Date.now();
      await storage.put('films',key,{time:entry.time,films:entry.films});
      await storage.put('catalogues',key,{key,time:entry.time,complete:true});
      void storage.prune();while(cache.size>8)cache.delete(cache.keys().next().value);
      return entry.films;
    }
    return {load};
  }
  const eraQueries={
    all:{},classic:{'primary_release_date.gte':'1801-01-01','primary_release_date.lte':'1969-12-31'},
    newwave:{'primary_release_date.gte':'1970-01-01','primary_release_date.lte':'1999-12-31'},
    modern:{'primary_release_date.gte':'2000-01-01'}
  };
  function matchesEra(f,filter){
    const text=String(f.release_date||'').slice(0,4),year=/^\d{4}$/.test(text)?Number(text):0;
    return filter==='classic'?year>1800 && year<1970:filter==='newwave'?year>=1970 && year<2000:filter==='modern'?year>=2000:true;
  }
  function cataloguePage(films,filter='all',limit=20){
    const matching=films.filter(f=>matchesEra(f,filter)),visible=Math.max(20,limit);
    return {films:matching.slice(0,visible),total:matching.length,hasMore:matching.length>visible};
  }
  window.KGCountryStatistics={...createLoader(),createLoader,matchesEra,cataloguePage,eraQuery:filter=>({...eraQueries[filter]||{}})};
})();
