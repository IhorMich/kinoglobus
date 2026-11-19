/* Confirm a viewing log before creating the first watched mark. */
(() => {
  const toggle=window.KGToggleWatched,pending=new Map();
  function metadata(log,now=new Date().toISOString()){
    if(!log)return {watchedAt:now,addedAt:now};
    return {watchedAt:log.dateUnknown?null:log.completedAt||log.date||null,addedAt:now,watchDateUnknown:!!log.dateUnknown,watchDate:log.dateUnknown?'':log.date||'',watchTime:log.timeKnown?log.time||'':'',watchTimeKnown:!!log.timeKnown&&!log.dateUnknown};
  }
  window.KGToggleWatched=film=>{
    if(!film?.id||!movieCatalog.allows(film))return Promise.resolve(false);
    if(window.KGIsFilmWatched(film.id))return toggle(film);
    if(pending.has(film.id))return pending.get(film.id);
    let settle;const result=new Promise(resolve=>settle=resolve);pending.set(film.id,result);
    const complete=value=>{if(pending.get(film.id)===result){pending.delete(film.id);settle(value);}};
    try{
      const dialog=window.KGOpenCinemaDiaryNote(film,{watchAction:true,
        commit:async value=>{
          if(window.KGIsFilmWatched(film.id))return true;
          return toggle({...film,_watchLog:{date:value.date,dateUnknown:value.dateUnknown,time:value.time,timeKnown:value.timeKnown,completedAt:value.completedAt}});
        },
        onSaved:()=>complete(true),onClose:()=>complete(!!window.KGIsFilmWatched(film.id))
      });
      if(!dialog)complete(false);
    }catch{complete(false);}
    return result;
  };
  window.KGWatchEntry={metadata};
})();
