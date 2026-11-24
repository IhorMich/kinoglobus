/* Profile dashboard in the local Moven session. */
(() => {
  let profile = null;
  let sessionId = 0;
  let profileWrites = Promise.resolve();
  const avatarDefault = "assets/interface/profile-page-01.jpg";
  const demoBadges = new Set(["Канны 2024 (Аккредитация)","Венеция (Гость Биеннале)","Cineteca Bologna"]);
  const demoBio = "Синефил, собиратель редких плёночных копий, фанат французской новой волны и ночного азиатского нео-нуара.";
  const esc = value => String(value ?? "").replace(/[&<>"']/g, ch =>
    ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[ch]);
  const label = (key,params) => esc(uiText(key,params));
  const paths = {
    search:"m21 21-5-5m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z",
    favorite:"M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8Z",
    bookmark:"M6 3h12v19l-6-4-6 4V3Z",
    calendar:"M8 3v4m8-4v4M4 10h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z",
    calendarClock:"M7 3v4m8-4v4M3 10h16m0 1V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h7m11-3a5 5 0 1 1-10 0 5 5 0 0 1 10 0Zm-5-2v2l1 1",
    history:"M5 20V11m7 9V4m7 16v-6",
    bell:"M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12a2 2 0 0 0 4 0",
    tv:"M3 5h18v13H3zm5 16h8", movie:"M3 5h18v15H3zM3 9h18m-13-4 3 4m5-4 3 4",
    chevron:"m9 18 6-6-6-6", down:"m6 9 6 6 6-6", back:"M20 12H4m7-7-7 7 7 7",
    logout:"M12 4H5v16h7m2-8h8m-3-3 3 3-3 3", star:"m12 3 2.7 5.7 6.3.9-4.5 4.4 1 6.2-5.5-3-5.5 3 1-6.2L3 9.6l6.3-.9Z"
  };
  const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name]}"/></svg>`;
  const title = item => item.title || item.original || uiText("Без названия");
  const number = value => new Intl.NumberFormat(interfaceLanguage,{maximumFractionDigits:1}).format(value);
  const fromDate = value => new Date(value+"T12:00:00");
  const localDay = d => [d.getFullYear(),d.getMonth()+1,d.getDate()].map(v=>String(v).padStart(2,"0")).join("-");
  const formatDay = (date,options) => date.toLocaleDateString(interfaceLanguage,options);
  const quick = [
    ["favorites","favorite","Любимые"],
    ["bookmarks","bookmark","Закладки"],
    ["diary","movie","Кинодневник"],
    ["notes","star","Рецензии"],
    ["calendar","calendar","Мой календарь"],
    ["history","history","История просмотров"]
  ];
  const dialog = document.createElement("dialog");
  dialog.id = "kg-profile";
  dialog.setAttribute("aria-labelledby","kg-profile-title");
  dialog.innerHTML = `<div class="kg-pf-shell">
    <header class="kg-pf-header">
      <div class="kg-pf-heading">
        <button type="button" class="kg-pf-back" data-profile-back aria-label="${label("Назад")}">${icon("back")}</button>
        <h1 id="kg-profile-title">${label("Личный кабинет")}</h1>
      </div>
      <div class="kg-pf-head-actions">
        <button type="button" data-profile-action="search" aria-label="${label("Поиск")}">${icon("search")}</button>
      </div>
    </header>
    <main class="kg-pf-scroll">
      <p class="kg-pf-status" role="status"></p>
      <section class="kg-pf-identity">
        <div class="kg-pf-cover" data-profile-cover hidden><img alt=""></div>
        <div class="kg-pf-user">
          <img data-profile-avatar alt="" width="76" height="95">
          <div><h2 data-profile-name tabindex="-1"></h2><p data-profile-caption></p>
            <button type="button" class="kg-pf-nickname" data-profile-nickname hidden>${label("Добавить никнейм")}</button>
            <p data-profile-city></p><p class="kg-pf-user-status" data-profile-user-status></p>
            <div class="kg-pf-badges" data-profile-badges></div></div>
          <button type="button" data-profile-edit aria-label="${label("Настройки профиля")}"><span class="material-symbols-outlined" aria-hidden="true">settings</span></button>
        </div>
        <div class="kg-pf-stats">
          <div><strong data-profile-stat="reviews"></strong><span>${label("Рецензии")}</span></div>
          <div title="${label("Средний балл")}"><strong class="kg-pf-average"><span data-profile-stat="rating"></span>${icon("star")}</strong><span>${label("Ср. балл")}</span></div>
          <div title="${label("В приложении")}"><strong data-profile-stat="membership"></strong><span><span class="kg-pf-sr">${label("дней в приложении")}</span><span aria-hidden="true">${label("дн.")}</span></span></div>
        </div>
      </section>
      <div class="kg-pf-quick" data-active="notes">
        <span class="kg-pf-dock-indicator" aria-hidden="true"></span>
        ${quick.map(([route,symbol,name])=>`<button type="button" data-profile-action="${route}" ${route==="calendar"?"data-profile-calendar":""}
          aria-label="${label(name)}" title="${label(name)}" aria-describedby="kg-pf-count-${route}">
          <span class="kg-pf-quick-icon">${icon(symbol)}</span>
          <b id="kg-pf-count-${route}" data-profile-count="${route}"></b><span class="kg-pf-quick-label">${label(name) === "История просмотров" ? "История" : label(name) === "Viewing history" ? "History" : label(name)}</span></button>`).join("")}
      </div>
      <section class="kg-pf-section">
        <header>${icon("calendarClock")}<h2>${label("Календарь моих релизов")}</h2>
          <button type="button" data-profile-action="week">${label("На неделю")}</button>
          <button type="button" class="kg-pf-week-toggle" data-profile-action="toggle-week" aria-label="${label("Развернуть календарь")}" aria-controls="kg-pf-week" aria-expanded="false">${icon("down")}</button></header>
        <div class="kg-pf-week" id="kg-pf-week" inert>
          <div>
            <div data-profile-releases></div>
            <button type="button" class="kg-pf-full-calendar" data-profile-action="calendar">${label("Открыть полный календарь релизов")}${icon("chevron")}</button>
          </div>
        </div>
      </section>
      ${[["series","tv","Просмотренные сериалы","Все сериалы"],["movies","movie","Просмотренные фильмы","Все фильмы"]].map(([id,symbol,heading,all])=>`
        <section class="kg-pf-section" data-profile-history="${id}">
          <header>${icon(symbol)}<h2>${label(heading)}</h2><button type="button" data-profile-action="${id}-history">
            <b data-profile-total="${id}"></b><span>${label(all)}</span>${icon("chevron")}</button></header>
          <div class="kg-pf-rail" data-profile-rail="${id}"></div>
        </section>`).join("")}
      <footer class="kg-pf-footer">
        <button type="button" data-profile-logout>${icon("logout")}${label("Выйти из аккаунта")}</button>
      </footer>
    </main>
  </div>`;
  document.body.append(dialog);
  const scroll = dialog.querySelector(".kg-pf-scroll");
  const status = dialog.querySelector("[role=status]");
  const dock = dialog.querySelector(".kg-pf-quick");
  const week = dialog.querySelector("#kg-pf-week");
  let releaseRows = [], history = {movies:[],series:[]};

  function replaceRail(rail,html) {
    const left = rail.scrollLeft;
    rail.innerHTML = html;
    rail.scrollLeft = left;
  }

  function historyData() {
    const dated = (a,b) => String(b.watchedAt || "").localeCompare(String(a.watchedAt || ""));
    const episodeEntries = window.KGSeriesDetail?.diaryEntries() || [];
    const shows = new Map((window.KGSeries.watchedList() || []).map(item => [Number(item.id),item]));
    for (const {film,note} of [...episodeEntries].sort((a,b)=>String(a.note.date||"").localeCompare(String(b.note.date||"")))) {
      const log = film._episodeLog;
      const previous = shows.get(log.series.id);
      const watchedAt = note.date || previous?.watchedAt || "";
      if (!previous || watchedAt.slice(0,10) >= String(previous.watchedAt || "").slice(0,10)) {
        shows.set(log.series.id,{...previous,...log.series,watchedAt,_episodeLog:log});
      }
    }
    return {movies:[...watched].filter(item=>!window.KGSeries.isSeriesId(item.id)).sort(dated),
      series:[...shows.values()].sort(dated),episodeEntries};
  }

  function historyCard(item,index,kind) {
    const name = title(item), log = item._episodeLog;
    const poster = item.poster_path || item.poster;
    const art = /^\/[\w.-]+$/.test(poster || "") ? `https://image.tmdb.org/t/p/w342${poster}` : "";
    const rating = Number(item.vote_average ?? item.score);
    const year = String(item.release_date || item.first_air_date || item.year || "").slice(0,4);
    const runtime = log?.episode?.runtime || item.runtime;
    const watchedDate = /^\d{4}-\d{2}-\d{2}/.test(item.watchedAt || "") ?
      formatDay(fromDate(item.watchedAt.slice(0,10)),{day:"numeric",month:"short"}) : "";
    const summary = log ? `S${log.season} · E${log.episode.episode_number}${log.episode.name ? " · "+log.episode.name : ""}` :
      [year,runtime ? uiText("{minutes} мин",{minutes:runtime}) : ""].filter(Boolean).join(" · ");
    return `<button type="button" class="kg-pf-film" data-profile-card="${kind}:${index}" aria-label="${esc(name)}">
      <span class="kg-pf-poster"><span>${icon(kind==="series"?"tv":"movie")}</span>
      ${art?`<img src="${esc(art)}" alt="" loading="lazy" decoding="async">`:""}
      ${rating>0?`<small class="kg-pf-score">${icon("star")}${number(rating)}</small>`:""}
      <small class="kg-pf-medium">${log?`S${log.season} · E${log.episode.episode_number}`:label(kind==="series"?"Сериал":"Фильм")}</small>
      ${runtime?`<small class="kg-pf-runtime">${label("{minutes} мин",{minutes:runtime})}</small>`:""}</span>
      <strong>${esc(name)}</strong><span>${esc(summary)}</span>${watchedDate?`<small>${esc(watchedDate)}</small>`:""}</button>`;
  }

  function renderHistory() {
    history = historyData();
    for (const id of ["series","movies"]) {
      dialog.querySelector(`[data-profile-total="${id}"]`).textContent = number(history[id].length);
      replaceRail(dialog.querySelector(`[data-profile-rail="${id}"]`), history[id].length
        ? history[id].slice(0,10).map((item,index)=>historyCard(item,index,id)).join("")
        : `<p class="kg-pf-empty">${label(id==="series"?"Просмотренные сериалы появятся здесь.":"Просмотренные фильмы появятся здесь.")}</p>`);
    }
  }

  function renderStats() {
    const notes = [...Object.values(store.get("kgCinemaDiaryNotes",{}) || {}),
      ...history.episodeEntries.map(entry=>entry.note)].filter(note=>note && note.diary!==false);
    const reviews = window.KGReviews.entries().length;
    const rates = notes.map(note=>Number(note.rating)).filter(value=>value>0&&value<=5);
    const rating = rates.length ? number(rates.reduce((sum,v)=>sum+v,0)*2/rates.length) : "—";
    const values = {favorites:number(window.KGFavorites.list().length),bookmarks:number(kgBookmarkIds().length+window.KGSeries.bookmarkIds().length),
      diary:number(history.movies.length+history.series.length),notes:number(reviews),history:number(window.KGViewingHistory.count())};
    for (const [id,value] of Object.entries(values)) dialog.querySelector(`[data-profile-count="${id}"]`).textContent=value;
    dialog.querySelector('[data-profile-stat="reviews"]').textContent=number(reviews);
    dialog.querySelector('[data-profile-stat="rating"]').textContent=rating;
    dialog.querySelector(".kg-pf-average").classList.toggle("has-rating",rates.length>0);
    const daysInApp = Math.max(0,Math.floor((Date.now()-profile.joinedAt)/86400000));
    dialog.querySelector('[data-profile-stat="membership"]').textContent = number(daysInApp);
  }

  function renderReleases() {
    const now = new Date(), today = localDay(now);
    const weekEnd = localDay(new Date(now.getFullYear(),now.getMonth(),now.getDate()+6,12));
    const rows = window.KGPersonalCalendar.trackedRows().rows;
    releaseRows = rows.filter(row=>row.date>=today && row.date<=weekEnd).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,3);
    dialog.querySelector('[data-profile-count="calendar"]').textContent=number(window.KGReleaseFollow.calendarItems().length);
    dialog.querySelector("[data-profile-releases]").innerHTML = releaseRows.length ? releaseRows.map((row,i)=>{
      const date = fromDate(row.date);
      const meta = [row.service,row.episodeTitle].filter(Boolean).join(" · ");
      const name = `${title(row)}${row.number?` · S${row.season} · E${row.number}`:""}`;
      return `<article class="kg-pf-release">
        <button type="button" data-profile-release="${i}"><span><b>${esc(formatDay(date,{day:"numeric",month:"short"}))}</b>
        <small>${esc(formatDay(date,{weekday:"short"}))}</small></span><span><strong>${esc(name)}</strong><small>${esc(meta)}</small></span></button>
        <button type="button" data-profile-reminder="${i}" aria-label="${label("Напомнить")}">${icon("bell")}</button></article>`;
    }).join("") : `<p class="kg-pf-empty">${label("На ближайшую неделю релизов нет.")}</p>`;
  }

  function renderProfile() {
    dialog.querySelector("[data-profile-name]").textContent = profile.name;
    const avatar = dialog.querySelector("[data-profile-avatar]");
    const cover = dialog.querySelector("[data-profile-cover]");
    avatar.src = profile.avatar || avatarDefault;
    cover.hidden = !profile.banner;
    const coverImage = cover.querySelector("img");
    if (profile.banner) coverImage.src = profile.banner;
    else coverImage.removeAttribute("src");
    const nickname=String(profile.handle||"").trim().replace(/^@+/,"");
    dialog.querySelector("[data-profile-caption]").textContent = nickname ? "@"+nickname : "";
    dialog.querySelector("[data-profile-nickname]").hidden = !!nickname;
    dialog.querySelector("[data-profile-city]").textContent = profile.city || "";
    dialog.querySelector("[data-profile-user-status]").textContent = profile.status;
    dialog.querySelector("[data-profile-badges]").innerHTML = (profile.badgesVisible === false ? [] : (profile.badges || []).slice(0,2))
      .map(badge=>`<span>${label(badge)}</span>`).join("");
    renderHistory();
    renderStats();
    renderReleases();
  }

  function openProfile(message="") {
    if (!profile) return false;
    renderProfile();
    status.textContent = message;
    if (!dialog.open) {
      window.KGMountBottomNav(dialog,scroll.parentElement,"profile");
      dialog.showModal();
    }
    scroll.scrollTop = 0;
    window.KGReleaseFollow.refresh();
    return true;
  }

  const logout = () => {sessionId++;profile=null;dialog.close();};
  const settingsProfile = () => ({...profile,avatar:profile.avatar || avatarDefault});
  function saveProfile(changes,opening) {
    const write = profileWrites.catch(()=>{}).then(async ()=>{
      if (!profile || opening !== sessionId) throw new Error("Profile session closed");
      const updated = {...profile,...changes};
      await window.KGProfileStorage.write(updated);
      if (!profile || opening !== sessionId) throw new Error("Profile session closed");
      profile = updated;
      renderProfile();
      return settingsProfile();
    });
    profileWrites = write;
    return write;
  }
  function openDiary(options={}) {
    window.KGOpenCinemaDiary({avatar:profile.avatar||avatarDefault,closeParent:()=>dialog.close(),...options});
  }

  dialog.addEventListener("click",event=>{
    const button = event.target.closest("button");
    if (!button) return;
    if (button.hasAttribute("data-profile-nickname")) {
      const opening=sessionId;
      const page=window.KGOpenProfileNickname(settingsProfile(),changes=>saveProfile(changes,opening));
      page.addEventListener("close",()=>{
        if(dialog.open&&button.hidden)dialog.querySelector("[data-profile-name]").focus({preventScroll:true});
      },{once:true});
      return;
    }
    if (button.hasAttribute("data-profile-edit")) {
      const opening = sessionId;
      const update = changes => saveProfile(changes,opening);
      window.KGOpenProfileSettings(settingsProfile(),{
        update,
        diary(closeSettings){openDiary({closeParent:()=>{closeSettings();dialog.close();}});},
        logout
      });
      return;
    }
    if (button.hasAttribute("data-profile-back")) {dialog.close();return;}
    if (button.hasAttribute("data-profile-logout")) {logout();return;}
    const {profileCard,profileRelease,profileReminder,profileAction:action} = button.dataset;
    if (dock.contains(button)) {
      dock.dataset.active = action;
      dock.style.setProperty("--pf-active",quick.findIndex(([route])=>route===action));
    }
    if (profileCard) {
      const [group,index] = profileCard.split(":");
      const film = history[group][index];
      if (film?._episodeLog) {
        const log = film._episodeLog;
        window.KGEpisodePage.open(log.series,log.episode,log.season,{opener:button});
      } else if (film) window.KGFilmCard.openDialog(window.KGFilmCard.savedFilm(film),button);
      return;
    }
    if (profileRelease !== undefined) {
      window.KGReleaseFollow.openCalendar(releaseRows[profileRelease]?.date);
      return;
    }
    if (profileReminder !== undefined) {
      const row = releaseRows[profileReminder];
      const item = window.KGReleaseFollow.calendarItems().find(entry=>entry.key===row?.key);
      if (item) window.KGReleaseSettings.open(item,button,true);
      return;
    }
    if (action === "favorites") window.KGFavorites.open();
    else if (action === "bookmarks") window.KGOpenBookmarks();
    else if (action === "notes") window.KGOpenReviews();
    else if (action === "diary") openDiary();
    else if (action === "calendar") window.KGReleaseFollow.openCalendar();
    else if (action === "week") window.KGPersonalCalendar.open(undefined,{week:true});
    else if (action === "toggle-week") {
      const expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded",String(!expanded));
      button.setAttribute("aria-label",uiText(expanded ? "Развернуть календарь" : "Свернуть календарь"));
      week.inert = expanded;
    }
    else if (["history","movies-history","series-history"].includes(action)) {
      const filter = action === "movies-history" ? "film" : action === "series-history" ? "series" : "all";
      window.KGViewingHistory.open({filter,avatar:profile.avatar||avatarDefault,closeParent:()=>dialog.close()});
    }
    else if (action === "search") {
      dialog.close();
      document.querySelector("[data-kg-search-open]")?.click();
    }
  });
  dialog.addEventListener("error",event=>{
    if (event.target.matches(".kg-pf-poster img")) event.target.remove();
  },true);

  for (const event of ["kg:release-follows-change","kg:favorite-change","kg-bookmark-change","kg:watched-change","kg:diary-note-change","kg:episode-note-change","kg:review-change"]) {
    document.addEventListener(event,()=>{if(dialog.open && profile)renderProfile();});
  }
  window.KGOpenDemoProfile = () => openProfile();
  window.KGProfileNickname = () => profile?.handle || "";
  window.KGStartDemoSession = async (message,name="") => {
    const opening = ++sessionId;
    const displayName = name.trim();
    await profileWrites.catch(()=>{});
    const saved = await window.KGProfileStorage.read();
    if (opening !== sessionId) return;
    const sameProfile = typeof saved?.name === "string" &&
      (!displayName || [saved.name,saved.registrationName].includes(displayName));
    const bio = uiText(demoBio);
    profile = {
      name:displayName || uiText("Александр Воронов"),
      registrationName:displayName,
      handle:displayName ? "" : "@voronov_cinema",
      bio,status:"",privatePage:true,
      ...(sameProfile ? saved : {})
    };
    if ([demoBio,bio].includes(profile.status)) profile.status = "";
    if (profile.city === "Париж / Санкт-Петербург") profile.city = "";
    if (Array.isArray(profile.badges)) profile.badges = profile.badges.filter(badge=>!demoBadges.has(badge));
    if (!Number.isFinite(profile.joinedAt) || profile.joinedAt <= 0) {
      profile.joinedAt = Date.now();
      const firstProfile = profile;
      profileWrites = profileWrites.catch(()=>{}).then(()=>window.KGProfileStorage.write(firstProfile));
      await profileWrites.catch(()=>{});
      if (opening !== sessionId) return;
    }
    openProfile(message);
  };
})();
