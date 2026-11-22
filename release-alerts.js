/* Synchronize the persisted follow preferences with Android alarms and newly published trailers. */
(() => {
  const releaseHour = 9;
  const releaseTime = "09:00";
  const leadOptions = [0,120,1440,10080];
  const native = () => window.Capacitor?.isPluginAvailable?.("ReleaseAlerts") ? window.Capacitor.Plugins.ReleaseAlerts : null;
  let queue = Promise.resolve(), last = "";
  const defaultSettings = Object.freeze({releases:true,trailers:false,includeCalendar:true,lead:0});
  const settings = item => {
    const {releases,trailers,includeCalendar,lead} = {...defaultSettings,...item.settings};
    return {releases,trailers,includeCalendar,lead:leadOptions.includes(lead)?lead:0};
  };

  function localReminder(date, lead=0) {
    const [year,month,day] = date.split("-").map(Number);
    return +new Date(year,month-1,day,releaseHour,-lead);
  }

  function events(item) {
    const options = settings(item);
    if (!options.releases) return [];
    const unique = new Map();
    for (const row of item.kind === "series" ? item.dates || [] : [item]) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(row.date || "")) continue;
      const starts = localReminder(row.date);
      if (!Number.isFinite(starts) || starts <= Date.now()) continue;
      const number = item.kind === "series" ? row.number : item.number;
      const season = item.kind === "series" ? row.season : item.season;
      const id = number ? `episode:${item.id}:${season}:${number}` : item.key;
      const episode = number ? uiText("Сезон {season} · Эпизод {episode}",{season,episode:number}) : "";
      const at = localReminder(row.date,options.lead);
      unique.set(id, {id,date:row.date,title:item.title,body:episode || uiText("Премьера фильма"),at,lead:options.lead});
    }
    return [...unique.values()];
  }

  function synchronize(items, force=false) {
    const plugin = native();
    if (!plugin) return Promise.resolve(null);
    const next = new Map();
    for (const item of items.filter(item=>item.settings)) {
      for (const event of events(item)) {
        if (event.at <= Date.now()) continue;
        const key = `${event.id}:${event.date}:${event.lead}`;
        next.set(key,{...event,id:key,hour:releaseHour});
      }
    }
    const alarms = [...next.values()].sort((a,b)=>a.at-b.at).slice(0,250);
    const snapshot = JSON.stringify(alarms);
    const sync = queue.then(async()=>{
      if (!force && last === snapshot) return null;
      const result = await plugin.synchronize({events:alarms});
      last = snapshot;
      return result;
    });
    queue = sync.catch(()=>null);
    return sync;
  }

  async function checkTrailer(item) {
    if (!apiKey || !item.settings?.trailers || !item.trailerSince) return null;
    const path = `${item.kind === "movie" ? "movie" : "tv"}/${item.id}/videos`;
    const response = await requestTmdb(path,{include_video_language:"ru,en,null"},{fresh:true});
    const recent = (response.results || []).filter(video =>
      video.official === true && ["Trailer","Teaser","Featurette"].includes(video.type) &&
      Date.parse(video.published_at) >= item.trailerSince && movieCatalog.allowsTrailer(video) &&
      ["YouTube","Vimeo"].includes(video.site) && /^[a-zA-Z0-9_-]+$/.test(video.key || ""));
    const video = recent.sort((a,b)=>Date.parse(b.published_at)-Date.parse(a.published_at))[0];
    return video ? {id:`${video.site}:${video.key}`,title:String(video.name || "").slice(0,200),
      url:(video.site === "Vimeo" ? "https://vimeo.com/" : "https://www.youtube.com/watch?v=")+video.key} : null;
  }

  window.KGReleaseAlerts = {native,settings,events,synchronize,checkTrailer,leadOptions,releaseTime};
})();
