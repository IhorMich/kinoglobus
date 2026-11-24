/* Analytics for the same personal records shown in viewing history. */
(() => {
  const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const label=(text,params)=>esc(uiText(text,params));
  const number=new Intl.NumberFormat(interfaceLanguage,{maximumFractionDigits:1});
  const month=new Intl.DateTimeFormat(interfaceLanguage,{month:"long",year:"numeric"});
  const weekday=new Intl.DateTimeFormat(interfaceLanguage,{weekday:"short",timeZone:"UTC"});
  const paths={back:"m12 5-7 7 7 7M5 12h14",share:"M12 15V3m-4 4 4-4 4 4M8 10H5v11h14V10h-3",trend:"m3 17 6-6 4 4 7-8m-5 0h5v5",clock:"M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",person:"M5 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2m-3-13a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"};
  const icon=name=>`<svg class="kg-vs-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="${paths[name]}"/></svg>`;
  const dialog=document.createElement("dialog");
  dialog.id="kg-viewing-statistics";
  dialog.setAttribute("aria-labelledby","kg-vs-title");
  dialog.innerHTML=`
    <header class="kg-vh-header">
      <button class="kg-vh-control" type="button" data-vs-close aria-label="${label("Назад")}">${icon("back")}</button>
      <h1 id="kg-vs-title">${label("Статистика просмотров")}</h1>
      <button class="kg-vh-control" type="button" data-vs-share aria-label="${label("Поделиться статистикой")}">${icon("share")}</button>
    </header>
    <main class="kg-vh-main kg-vs-main">
      <nav class="kg-vs-tabs" aria-label="${label("История просмотров")}">
        <button type="button" data-vs-close>${label("Хронология")}</button>
        <span aria-current="page">${label("Аналитика")}</span>
        <button type="button" data-vs-notes>${label("Заметки")}</button>
      </nav>
      <div class="kg-vs-intro"><h2>${label("Аналитика и статистика")}</h2><p data-vs-period-name></p></div>
      <div class="kg-vh-chips kg-vs-periods" role="group" aria-label="${label("Период")}"></div>
      <p class="kg-vs-status" role="status" hidden></p>
      <div data-vs-sections></div>
      <section class="kg-vs-panel" data-vs-people></section>
      <section class="kg-vs-panel" data-vs-ratings></section>
    </main>`;
  document.body.append(dialog);
  const statisticsStyle = document.createElement("style");
  statisticsStyle.textContent = `
/* Viewing statistics redesign */
#kg-viewing-statistics [data-vs-share],
#kg-viewing-statistics [data-vs-people] {
  display: none !important;
}

#kg-viewing-statistics .kg-vh-header {
  background: transparent;
  border: 0;
  box-shadow: none;
}

#kg-viewing-statistics .kg-vh-header h1 {
  font-size: 22px;
}

#kg-viewing-statistics .kg-vh-header [data-vs-close] {
  background: transparent;
  border: 0;
  box-shadow: none;
  color: rgb(var(--kg-primary));
}

#kg-viewing-statistics .kg-vs-tabs {
  border-radius: 12px;
  gap: 5px;
  padding: 4px;
}

#kg-viewing-statistics .kg-vs-tabs > * {
  border-radius: 8px;
  font-size: 13px;
  min-height: 38px;
}

#kg-viewing-statistics .kg-vs-intro h2 {
  font-size: 24px;
  line-height: 1.25;
}

#kg-viewing-statistics .kg-vs-panel {
  border: 0;
  border-radius: 14px;
  padding: 16px;
  box-shadow: none;
  background: rgb(var(--kg-surface-panel));
}

#kg-viewing-statistics .kg-vs-panel h2 {
  font-size: 20px;
  line-height: 1.3;
}

#kg-viewing-statistics .kg-vs-panel p {
  font-size: 14px;
  line-height: 1.5;
}

#kg-viewing-statistics .kg-vs-periods {
  display: grid;
  grid-template-columns: .8fr 1.6fr .8fr 1fr;
  gap: 4px;
  overflow: visible;
}

#kg-viewing-statistics .kg-vs-periods button {
  min-width: 0;
  min-height: 36px;
  padding: 4px;
  font-size: 12px;
  border-radius: 8px;
}

#kg-viewing-statistics .kg-vs-periods button[aria-pressed="true"] {
  background: rgb(var(--kg-primary-container) / .14);
  color: rgb(var(--kg-primary));
  box-shadow: inset 0 0 0 1px rgb(var(--kg-primary) / .35);
}

#kg-viewing-statistics .kg-vs-metrics small {
  font-size: 13px;
}

#kg-viewing-statistics .kg-vs-metrics strong {
  font-size: 20px;
  line-height: 1.3;
}
`;
  document.head.append(statisticsStyle);

  let period="all",source,notes,summary="",peopleLimit=4,peopleRequest=0;
  const personRequests=new Map();
  const runtime=rows=>rows.reduce((total,row)=>total+row.runtime,0);
  const personalRating=row=>{
    const rating=Number(row.note?.rating);
    return Number.isFinite(rating)&&rating>0&&rating<=5?rating*2:0;
  };
  const percent=(count,total)=>total?Math.round(count/total*100):0;
  const minutesText=value=>value>=60?(interfaceLanguage==="en"?number.format(value/60)+" h":uiText("{count} ч",{count:number.format(value/60)})):uiText("{minutes} мин",{minutes:number.format(value)});
  const duration=value=>value?esc(minutesText(value)):"—";
  function intervals(now){
    const year=now.getFullYear(),m=now.getMonth(),day=now.getDate();
    return {
      week:[uiText("7 дней"),new Date(year,m,day-6),new Date(year,m,day-13),new Date(year,m,day+1)],
      month:[month.format(now),new Date(year,m,1),new Date(year,m-1,1),new Date(year,m+1,1)],
      year:[String(year),new Date(year,0,1),new Date(year-1,0,1),new Date(year+1,0,1)],
      all:[uiText("Всё время")]
    };
  }
  function longestStreak(rows){
    const days=[...new Set(rows.filter(row=>row.date).map(({date})=>Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())/86400000))].sort((a,b)=>a-b);
    let best=0,streak=0,previous=-2;
    for(const day of days){
      streak=day===previous+1?streak+1:1;
      best=Math.max(best,streak);
      previous=day;
    }
    return best;
  }
  function bars(data){
    const max=Math.max(1,...data.map(entry=>entry.value));
    return `<ul class="kg-vs-bars" style="--bar-count:${data.length}">${data.map(({name,value,formatted})=>`<li title="${esc(name)}: ${esc(formatted)}">
      <small>${esc(formatted)}</small><span class="kg-vs-bar-track" aria-hidden="true"><i style="--height:${value/max*100}%"${value&&value===max?' class="kg-vs-peak"':""}></i></span><span>${esc(name)}</span>
    </li>`).join("")}</ul>`;
  }
  function activity(rows){
    const days=Array(7).fill(0),hours=Array(24).fill(0);
    const dated=rows.filter(row=>row.date);
    const hasRuntime=dated.some(row=>row.runtime);
    for(const row of dated){
      days[(row.date.getDay()+6)%7]+=hasRuntime?row.runtime:1;
      const time=row.note?.timeKnown?row.note.time:!row.episode&&row.film.watchTimeKnown?row.film.watchTime:"";
      if(/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time))hours[Number(time.slice(0,2))]++;
    }
    const peak=Math.max(...hours),hour=hours.indexOf(peak);
    const peakText=peak?`<div class="kg-vs-insight">${icon("clock")}<div><strong>${String(hour).padStart(2,"0")}:00–${String((hour+1)%24).padStart(2,"0")}:00</strong>
      <small>${label("Самый частый час завершения просмотров")}</small></div><b>${percent(peak,hours.reduce((a,b)=>a+b,0))}%</b></div>`:"";
    return `<section class="kg-vs-panel"><h2>${label("Активность просмотров")}</h2>
      <p>${label(hasRuntime?"Известный хронометраж по дням недели":"Отметки о просмотре по дням недели")}</p>
      ${dated.length?bars(days.map((value,index)=>({value,name:weekday.format(new Date(Date.UTC(2024,0,1+index))),formatted:hasRuntime?minutesText(value):number.format(value)}))):`<p class="kg-vs-empty">${label("Пока нет просмотров с датой.")}</p>`}${peakText}</section>`;
  }
  function genrePanel(rows){
    const genres=new Map();
    let total=0;
    for(const {film} of rows){
      const names=[...new Set(genreLine(film).split(", ").filter(Boolean).map(name=>uiText(name)))];
      for(const name of names)genres.set(name,(genres.get(name)||0)+1);
      total+=names.length;
    }
    const entries=[...genres].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],interfaceLanguage)).slice(0,4);
    const share=entries.length?percent(entries[0][1],total):0;
    return `<section class="kg-vs-panel"><h2>${label("Жанровый профиль")}</h2><p>${label("Жанры в истории просмотров")}</p>
      ${entries.length?`<div class="kg-vs-genres"><div class="kg-vs-donut" style="--share:${share}%"><span><strong>${share}%</strong><small>${esc(entries[0][0])}</small></span></div>
        <ul>${entries.map(([name,count])=>`<li><span>${esc(name)}</span><b>${percent(count,total)}%</b><progress value="${count}" max="${total}" aria-label="${esc(name)}"></progress></li>`).join("")}</ul></div>`:
        `<p class="kg-vs-empty">${label("В записях пока нет жанров.")}</p>`}</section>`;
  }
  function render(){
    const now=new Date(),periods=intervals(now),[title,start,previous,end]=periods[period];
    const all=source();
    const rows=start?all.filter(row=>row.date&&row.date>=start&&row.date<end):all;
    const minutes=runtime(rows);
    const before=previous?runtime(all.filter(row=>row.date&&row.date>=previous&&row.date<start)):0;
    const ratings=rows.map(personalRating).filter(Boolean);
    const average=ratings.length?number.format(ratings.reduce((a,b)=>a+b,0)/ratings.length):"—";
    const films=rows.filter(row=>row.kind==="film").length,episodes=rows.filter(row=>row.kind==="episode").length;
    const shows=rows.length-films-episodes;
    const breakdown=[films&&label("Фильмы: {count}",{count:number.format(films)}),episodes&&label("Эпизоды: {count}",{count:number.format(episodes)}),shows&&label("Сериалы: {count}",{count:number.format(shows)})].filter(Boolean).join(" · ");
    const delta=before?Math.round((minutes-before)/before*100):null;
    const streak=longestStreak(rows);
    dialog.querySelector("[data-vs-period-name]").textContent=title;
    dialog.querySelector(".kg-vs-periods").innerHTML=Object.entries(periods).map(([key,[name]])=>`<button type="button" data-vs-period="${key}" aria-pressed="${period===key}">${esc(name)}</button>`).join("");
    const metrics=[
      ["Известный хронометраж",duration(minutes),delta===null?"":label("{value}% к прошлому периоду",{value:(delta>0?"+":"")+delta})],
      ["Отметок о просмотре",number.format(rows.length),breakdown],
      ["Средний балл",average,ratings.length?label("Личные оценки: {count}",{count:number.format(ratings.length)}):""],
      ["Самая длинная серия",streak?label("Дней подряд: {count}",{count:number.format(streak)}):"—",""]
    ];
    dialog.querySelector("[data-vs-sections]").innerHTML=`<section class="kg-vs-panel"><h2 class="kg-vs-metrics-title">${icon("trend")}${label("Сводка просмотров")}</h2>
      <div class="kg-vs-metrics">${metrics.map(([name,value,detail])=>`<div><small>${label(name)}</small><strong>${value}</strong>${detail?`<span>${detail}</span>`:""}</div>`).join("")}</div></section>
      ${activity(rows)}${genrePanel(rows)}`;
    const buckets=Array(10).fill(0);
    for(const rating of ratings)buckets[Math.round(rating)-1]++;
    dialog.querySelector("[data-vs-ratings]").innerHTML=`<h2>${label("Кривая оценок")}</h2><p>${label("Распределение личных оценок от 1 до 10")}</p>
      ${ratings.length?bars(buckets.map((value,index)=>({value,name:String(index+1),formatted:number.format(value)}))):`<p class="kg-vs-empty">${label("Пока нет личных оценок.")}</p>`}`;
    summary=[title,uiText("Записей: {count}",{count:number.format(rows.length)}),minutes?minutesText(minutes):"",ratings.length?uiText("Средний балл")+" "+average:""].filter(Boolean).join(" · ");
  }
  async function favoritePerson(id){
    if(!apiKey)return null;
    if(!personRequests.has(id)){
      personRequests.set(id,requestTmdb("person/"+id,{language:interfaceLanguage==="en"?"en-US":"ru-RU"}).catch(()=>null));
    }
    const person=await personRequests.get(id);
    if(!person?.name)personRequests.delete(id);
    return person?.name?person:null;
  }
  async function renderPeople(){
    const token=++peopleRequest,host=dialog.querySelector("[data-vs-people]");
    if (getComputedStyle(host).display === "none") return;
    const favoriteIds=window.KGFavoritePersonIds();
    const ids=favoriteIds.slice(0,peopleLimit);
    host.innerHTML=`<header><h2>${label("Любимые персоны")}</h2>
      ${favoriteIds.length>ids.length?`<button type="button" data-vs-more-people>${label("Показать ещё")}</button>`:""}</header>`;
    if(!ids.length){host.insertAdjacentHTML("beforeend",`<p class="kg-vs-empty">${label("Здесь появятся люди, которых вы добавили в любимые.")}</p>`);return;}
    host.insertAdjacentHTML("beforeend",`<p class="kg-vs-empty" data-vs-people-loading>${label("Загружаем…")}</p>`);
    const people=(await Promise.all(ids.map(favoritePerson))).filter(Boolean);
    if(!dialog.open||token!==peopleRequest)return;
    const role={Acting:"Актёр",Directing:"Режиссёр",Production:"Продюсер",Writing:"Сценарист"};
    host.querySelector("[data-vs-people-loading]").remove();
    host.insertAdjacentHTML("beforeend",people.length?`<div class="kg-vs-people">${people.map(person=>`<button type="button" data-vs-person="${Number(person.id)}">
      <span class="kg-vs-portrait">${icon("person")}${/^\/[\w.-]+$/.test(person.profile_path||"")?`<img alt="" loading="lazy" src="https://image.tmdb.org/t/p/w185${esc(person.profile_path)}">`:""}</span>
      <span><strong>${esc(person.name)}</strong><small>${label(role[person.known_for_department]||"Кинематографист")}</small></span></button>`).join("")}</div>`:
      `<p class="kg-vs-empty">${label("Не удалось загрузить любимых персон.")}</p>`);
  }
  dialog.addEventListener("error",event=>{if(event.target.tagName==="IMG")event.target.remove();},true);
  dialog.addEventListener("click",async event=>{
    const button=event.target.closest("button");
    if(!button)return;
    const {vsPeriod,vsPerson}=button.dataset;
    if(button.hasAttribute("data-vs-close"))dialog.close();
    else if(button.hasAttribute("data-vs-notes")){dialog.close();notes();}
    else if(vsPeriod){period=vsPeriod;render();dialog.querySelector(`[data-vs-period="${vsPeriod}"]`).focus({preventScroll:true});}
    else if(button.hasAttribute("data-vs-more-people")){peopleLimit+=4;renderPeople();}
    else if(vsPerson)window.KGOpenPersonProfile(vsPerson,button.querySelector("strong").textContent,button.querySelector("small").textContent,button);
    else if(button.hasAttribute("data-vs-share")){
      const status=dialog.querySelector(".kg-vs-status");
      try{
        if(navigator.share)await navigator.share({title:uiText("Статистика просмотров"),text:summary});
        else{await navigator.clipboard.writeText(summary);status.textContent=uiText("Сводка скопирована.");status.hidden=false;}
      }catch(error){if(error.name!=="AbortError"){status.textContent=uiText("Не удалось поделиться историей.");status.hidden=false;}}
    }
  });
  for(const event of ["kg:watched-change","kg:episode-note-change","kg:diary-note-change"]){
    document.addEventListener(event,()=>{if(dialog.open)render();});
  }
  document.addEventListener("kg:favorite-person-change",()=>{if(dialog.open)renderPeople();});
  window.KGViewingStatistics={open({readRows,showNotes}){
    source=readRows;notes=showNotes;period="all";peopleLimit=4;
    dialog.querySelector(".kg-vs-status").hidden=true;
    render();
    if(!dialog.open)dialog.showModal();
    dialog.querySelector("main").scrollTop=0;
    renderPeople();
  }};
})();
