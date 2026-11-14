/* The personal cinema diary combines watched films with local viewing notes. */
(() => {
  const icon = name => `<span class="material-symbols-outlined" aria-hidden="true">${name}</span>`;
  const number = new Intl.NumberFormat(interfaceLanguage, {maximumFractionDigits:1});
  const dateLabel = new Intl.DateTimeFormat(interfaceLanguage, {day:"numeric",month:"long",year:"numeric"});
  const monthLabel = new Intl.DateTimeFormat(interfaceLanguage, {month:"long",year:"numeric"});
  const dayKey = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
  const readDate = value => {
    if (!value) return null;
    const date = new Date(value.length === 10 ? value + "T12:00:00" : value);
    return Number.isNaN(date.getTime()) ? null : date;
  };
  const countryName = code => interfaceRegionNames.of(code);
  const collections = [
    ["all","Все записи"],["notes","С рецензиями"],["masterpieces","5★ Шедевры"],
    ["festival","Фестивальные"],["rewatch","Повторные"]
  ];
  const navigation = [["home","public","Глобус"],["collections","collections_bookmark","Подборки"],
    ["history","history_edu","История"],["settings","tune","Настройки"]];
  let entries = [];
  let bookmarks = [];
  let source = "watched";
  let selectedFilm = "";
  let bookmarkLoad = 0;
  let month = "";
  let day = "";
  let filter = "all";
  let limitToMonth = false;
  let closeParent;
  const rhythmKey = "kgCinemaDiaryRhythmCollapsed";
  const draftKey = "kgCinemaDiaryDrafts";
  const vibes = ["Ночная меланхолия","Неоновый пульс","Экзистенциальный дождь",
    "Созерцательное спокойствие","Пьянящая романтика","Сюрреалистический трип","Ностальгия по 90-м"];
  const routeSelectors = {
    home: 'body > nav [data-view="home"]',
    collections: 'body > nav [data-view="collections"]',
    history: 'body > nav [data-view="history"]',
    journey: 'body > nav [data-view="journey"]',
    settings: "#gear",
    search: "[data-kg-search-open]"
  };

  const style = document.createElement("style");
  style.textContent = `
    #kg-diary,#kg-diary-note {background:rgb(var(--kg-surface));color:rgb(var(--kg-on-surface));border:0;color-scheme:dark;font:14px/1.5 'Noto Serif',serif}
    #kg-diary {position:fixed;inset:0;width:min(100%,520px);max-width:none;height:100dvh;max-height:100dvh;margin:auto;padding:0;overflow:hidden}
    #kg-diary::backdrop,#kg-diary-note::backdrop {background:rgb(var(--kg-canvas-obsidian) / .9)}
    #kg-diary [hidden] {display:none}
    #kg-diary button:focus-visible,#kg-diary-note :focus-visible {outline:2px solid rgb(var(--kg-primary));outline-offset:2px}
    .kg-diary-shell {display:flex;height:100%;flex-direction:column}
    .kg-diary-header,.kg-diary-nav {flex:none;display:flex;align-items:center;gap:10px;background:rgb(var(--kg-surface-panel))}
    .kg-diary-header {min-height:calc(58px + env(safe-area-inset-top,0px));padding:env(safe-area-inset-top,0px) 5% 0}
    .kg-diary-header strong {flex:1;color:rgb(var(--kg-primary));font-size:22px}
    .kg-diary-header button {min-width:32px;min-height:44px;color:rgb(var(--kg-primary))}
    .kg-diary-header img {width:32px;height:32px;border-radius:50%;object-fit:cover;border:1px solid rgb(var(--kg-primary))}
    .kg-diary-scroll {flex:1;min-height:0;overflow:auto;overscroll-behavior:contain;padding:16px 5% 30px}
    .kg-diary-scroll > * + * {margin-top:16px}
    .kg-diary-kicker {font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.11em;color:rgb(var(--kg-primary))}
    .kg-diary-intro h1 {font-size:clamp(23px,6.5vw,34px);line-height:1.2;margin:4px 0 6px;font-weight:700}
    .kg-diary-intro h1 span {color:rgb(var(--kg-primary))}
    .kg-diary-muted {color:rgb(var(--kg-on-surface-variant));font-size:12px}
    .kg-diary-stats {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
    .kg-diary-card,.kg-diary-stat {border-radius:12px;background:rgb(var(--kg-surface-container));padding:12px}
    .kg-diary-stat p {display:flex;justify-content:space-between;align-items:center;gap:5px}
    .kg-diary-stat strong {font-size:24px;font-weight:700}
    .kg-diary-stat .material-symbols-outlined {font-size:17px;color:rgb(var(--kg-primary))}
    .kg-diary-stat:nth-child(2n) .material-symbols-outlined {color:#c6d8ff}
    .kg-diary-actions,.kg-diary-row {display:flex;align-items:center;gap:8px}
    .kg-diary-actions button,.kg-diary-actions input,.kg-diary-edit,.kg-diary-route {border-radius:10px;background:rgb(var(--kg-surface-container-high));min-height:40px;padding:6px 10px}
    .kg-diary-actions .kg-diary-primary,.kg-diary-primary {background:rgb(var(--kg-primary));color:rgb(var(--kg-canvas-obsidian));font-weight:700}
    .kg-diary-actions .kg-diary-primary {flex:1;display:flex;align-items:center;justify-content:center;gap:5px}
    .kg-diary-actions input {width:44px;position:relative;color:transparent}
    .kg-diary-actions input::-webkit-calendar-picker-indicator {position:absolute;inset:0;width:auto;height:auto;margin:auto;cursor:pointer}
    .kg-diary-row {justify-content:space-between}
    .kg-diary-row h2 {font-size:17px;font-weight:700;overflow-wrap:anywhere}
    .kg-diary-count {font-size:11px;background:rgb(var(--kg-primary) / .14);color:rgb(var(--kg-primary));border-radius:99px;padding:3px 7px;text-align:center}
    .kg-diary-count[aria-pressed=true] {outline:1px solid rgb(var(--kg-primary))}
    .kg-diary-strip {display:grid;grid-template-columns:repeat(auto-fit,minmax(22px,1fr));gap:4px;padding:10px 7px;background:rgb(var(--kg-surface-container-lowest));border-radius:8px;margin-top:9px}
    .kg-diary-strip button {border-radius:4px;min-height:24px;background:rgb(var(--kg-surface-container-high));font-size:10px}
    .kg-diary-strip button[data-level="1"] {background:rgb(var(--kg-primary) / .31)}
    .kg-diary-strip button[data-level="2"] {background:rgb(var(--kg-primary));color:rgb(var(--kg-canvas-obsidian))}
    .kg-diary-strip button[aria-pressed=true] {outline:2px solid rgb(var(--kg-primary));outline-offset:1px}
    .kg-diary-legend,.kg-diary-tabs {display:flex;gap:7px}
    .kg-diary-legend {flex-wrap:wrap;margin-top:8px}
    .kg-diary-legend span::before {content:"";display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:4px;background:rgb(var(--kg-surface-container-high))}
    .kg-diary-legend span:nth-child(2)::before {background:rgb(var(--kg-primary) / .4)}
    .kg-diary-legend span:nth-child(3)::before {background:rgb(var(--kg-primary))}
    .kg-diary-sources {display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:4px;border-radius:12px;background:rgb(var(--kg-surface-container-lowest))}
    .kg-diary-sources button {min-height:40px;padding:5px;border-radius:8px;font-weight:700}
    .kg-diary-sources button[aria-pressed=true] {background:rgb(var(--kg-primary));color:rgb(var(--kg-canvas-obsidian))}
    .kg-diary-select-film {display:block;width:100%;text-align:start;border-radius:8px}
    .kg-diary-select-film .kg-diary-film {align-items:start}
    .kg-diary-film-name {font-size:16px;font-weight:700;overflow-wrap:anywhere}
    .kg-diary-film-action {margin-top:10px}
    .kg-diary-tabs {overflow:auto;padding:3px 2px 5px;scrollbar-width:none}
    .kg-diary-tabs button {white-space:nowrap;padding:6px 10px;border-radius:99px;background:rgb(var(--kg-surface-container-high));font-size:11px}
    .kg-diary-tabs button[aria-pressed=true] {background:rgb(var(--kg-primary));color:rgb(var(--kg-canvas-obsidian))}
    .kg-diary-group + .kg-diary-group {margin-top:18px}
    .kg-diary-group .kg-diary-card {margin-top:8px}
    .kg-diary-film {display:grid;grid-template-columns:clamp(58px,25%,100px) minmax(0,1fr);gap:10px}
    .kg-diary-poster {display:grid;place-items:center;aspect-ratio:2/3;background:rgb(var(--kg-surface-container-high));border-radius:8px;overflow:hidden;color:rgb(var(--kg-primary))}
    .kg-diary-poster img {width:100%;height:100%;object-fit:cover}
    .kg-diary-film h3 {font-size:16px;font-weight:700;overflow-wrap:anywhere}
    .kg-diary-stars {font-size:15px;color:rgb(var(--kg-primary));margin:5px 0}
    .kg-diary-edit {min-height:30px;font-size:11px;color:rgb(var(--kg-primary))}
    .kg-diary-note {padding:10px;margin-top:8px;border-radius:8px;background:rgb(var(--kg-surface-container-low));white-space:pre-wrap;overflow-wrap:anywhere}
    .kg-diary-geography {display:grid;gap:7px;margin:10px 0}
    .kg-diary-geography progress {width:100%;height:8px;accent-color:rgb(var(--kg-primary))}
    .kg-diary-route {width:100%;color:rgb(var(--kg-primary));font-size:12px}
    .kg-diary-nav {justify-content:space-around;padding:5px 2% calc(5px + env(safe-area-inset-bottom,0px))}
    .kg-diary-nav button {min-height:45px;display:grid;justify-items:center;align-content:center;gap:3px;font-size:11px;color:rgb(var(--kg-on-surface-variant))}
    #kg-diary-note {
      position:fixed;inset:0;width:min(100%,520px);max-width:none;height:100dvh;max-height:100dvh;
      margin:0 auto;padding:0;overflow:auto;
    }
    .kg-diary-note-content:not(:empty) > strong:not([hidden]),
    .kg-diary-note-content > details:not([hidden]),
    .kg-diary-note-content > p:not([hidden]) {display:block;margin-top:8px}
    #kg-diary-note form {display:grid;gap:16px;padding:0 5% 24px}
    .kg-diary-editor-head {position:sticky;top:0;z-index:1;display:grid;grid-template-columns:1fr 1.8fr 1fr;align-items:center;gap:6px;background:rgb(var(--kg-surface-panel));margin:0 -5.55%;padding:calc(10px + env(safe-area-inset-top,0px)) 5% 10px;text-align:center}
    #kg-diary-note .kg-diary-editor-head h2 {line-height:1.2}
    .kg-diary-editor-card {display:grid;gap:10px}
    .kg-diary-editor-card h3 {font-size:17px;font-weight:700}
    .kg-diary-preview {display:grid;grid-template-columns:70px minmax(0,1fr);gap:12px;align-items:start}
    .kg-diary-preview img {width:100%;height:100%;object-fit:cover}
    #kg-diary-note [hidden] {display:none}
    .kg-diary-editor-stars {display:flex;justify-content:center;gap:4px;color:rgb(var(--kg-primary))}
    #kg-diary-note .kg-diary-editor-stars button {font-size:clamp(21px,8vw,34px);padding:1px 4px}
    #kg-diary-note [data-vibe] {border-radius:99px;background:rgb(var(--kg-surface-container-high));padding:5px 9px;font-size:12px}
    #kg-diary-note [data-vibe][aria-pressed=true] {color:rgb(var(--kg-primary));box-shadow:inset 0 0 0 1px rgb(var(--kg-primary))}
    .kg-diary-vibes {display:flex;flex-wrap:wrap;gap:6px}
    #kg-diary-note input[type=range] {accent-color:rgb(var(--kg-primary));padding:0}
    .kg-diary-draft {background:rgb(var(--kg-surface-container-high))}
    .kg-diary-toggle {display:grid;place-items:center;min-width:36px;min-height:36px;border-radius:8px;background:rgb(var(--kg-surface-container-high));color:rgb(var(--kg-primary))}
    .kg-diary-toggle .material-symbols-outlined {transition:transform .18s ease}
    .kg-diary-toggle[aria-expanded=false] .material-symbols-outlined {transform:rotate(-90deg)}
    @media(prefers-reduced-motion:reduce) {.kg-diary-toggle .material-symbols-outlined {transition:none}}
    #kg-diary-note h2 {font-weight:700;font-size:20px}
    #kg-diary-note label:not(.kg-diary-check) {display:grid;gap:4px}
    #kg-diary-note :is(select,input:not([type=checkbox]),textarea) {width:100%;min-width:0;background:rgb(var(--kg-surface-container-high));padding:8px;border-radius:8px;font-size:16px}
    #kg-diary-note button {padding:9px;border-radius:9px}
  `;
  document.head.appendChild(style);

  const dialog = document.createElement("dialog");
  dialog.id = "kg-diary";
  dialog.setAttribute("aria-labelledby","kg-diary-title");
  const stats = [
    ["watched","Просмотрено","movie","Фильмов"],
    ["countries","Охват глобуса","public","Страны"],
    ["rating","Средний балл","star","/ 5.0"],
    ["notes","Эссе и заметки","stylus_note","Заметки"]
  ];
  dialog.innerHTML = `
    <div class="kg-diary-shell">
      <header class="kg-diary-header">
        <button type="button" data-back aria-label="Назад" autofocus>${icon("arrow_back_ios_new")}</button>
        <strong>Kinoglobus</strong>
        <button type="button" data-route="search" aria-label="Поиск">${icon("search")}</button>
        <img alt="" hidden>
      </header>
      <div class="kg-diary-scroll">
        <header class="kg-diary-intro">
          <p class="kg-diary-kicker">◆ Личный архив</p>
          <h1 id="kg-diary-title"><b>Кинодневник</b> <span>&amp;</span> <b>История</b></h1>
          <p class="kg-diary-muted">Хроника ваших кинематографических открытий, заметки и личная статистика путешествий по экранам мира.</p>
        </header>
        <div class="kg-diary-stats">${stats.map(([key,title,symbol,unit]) => `
          <section class="kg-diary-stat"><p class="kg-diary-kicker"><span>${title}</span>${icon(symbol)}</p>
          <strong data-stat="${key}"></strong> <span class="kg-diary-muted">${unit}</span></section>`).join("")}</div>
        <div class="kg-diary-actions">
          <button type="button" class="kg-diary-primary" data-add>${icon("add_circle")}<span>Добавить запись</span></button>
          <input type="month" aria-label="Выбрать месяц">
          <button type="button" data-copy aria-label="Поделиться дневником">${icon("ios_share")}</button>
        </div>
        <p class="kg-diary-muted" data-status role="status" hidden></p>
        <section class="kg-diary-card">
          <div class="kg-diary-row">
            <h2>Киноритм месяца</h2>
            <div class="kg-diary-actions" style="gap:5px">
              <button type="button" class="kg-diary-count" data-month-label aria-pressed="false"></button>
              <button type="button" class="kg-diary-toggle" aria-expanded="true" aria-controls="kg-diary-rhythm">${icon("expand_more")}</button>
            </div>
          </div>
          <div id="kg-diary-rhythm">
            <div class="kg-diary-strip" data-days></div>
            <div class="kg-diary-legend kg-diary-muted"><span>Без сеансов</span><span>1 фильм</span><span>Несколько фильмов</span></div>
          </div>
        </section>
        <div class="kg-diary-sources" role="group" aria-label="Списки фильмов">
          <button type="button" data-source="watched" aria-pressed="true" aria-controls="kg-diary-entries">Просмотренные</button>
          <button type="button" data-source="bookmarks" aria-pressed="false" aria-controls="kg-diary-entries">Закладки</button>
        </div>
        <div class="kg-diary-tabs" role="group" aria-label="Фильтры дневника"></div>
        <div id="kg-diary-entries" data-entries></div>
        <section class="kg-diary-card">
          <div class="kg-diary-row"><h2>Аналитика просмотров</h2><span class="kg-diary-count" data-analysis-month></span></div>
          <p class="kg-diary-muted">География просмотров</p>
          <div class="kg-diary-geography"></div>
          <button type="button" class="kg-diary-route" data-route="journey">Открыть карту кинопутешествий →</button>
        </section>
      </div>
      <nav class="kg-diary-nav" aria-label="Навигация">${navigation.map(([key,symbol,label]) =>
        `<button type="button" data-route="${key}">${icon(symbol)}<span>${label}</span></button>`).join("")}</nav>
    </div>`;
  localizeInterfaceMarkup(dialog);
  document.body.appendChild(dialog);

  const noteDialog = document.createElement("dialog");
  noteDialog.id = "kg-diary-note";
  noteDialog.setAttribute("aria-labelledby","kg-diary-note-title");
  const metrics = [
    ["intensity","Интенсивность вайба",100],
    ["visual","Визуальный восторг",100],
    ["emotion","Эмоциональный резонанс",100],
    ["curation","Кураторская ценность",10]
  ];
  const slider = ([key,title,max]) => `
    <label><span class="kg-diary-row"><b>${title}</b><output data-value="${key}"></output></span>
    <input name="${key}" type="range" min="0" max="${max}" value="0"></label>`;
  noteDialog.innerHTML = `<form>
    <header class="kg-diary-editor-head">
      <button type="button" data-cancel autofocus>Отмена</button>
      <div><h2 id="kg-diary-note-title">Запись в кинодневник</h2><p class="kg-diary-muted" data-draft-status role="status"></p></div>
      <button class="kg-diary-primary" type="submit">Готово</button>
    </header>
    <section class="kg-diary-card kg-diary-editor-card">
      <div class="kg-diary-preview">
        <div class="kg-diary-poster"><img alt="" hidden><span>${icon("movie")}</span></div>
        <div>
          <p class="kg-diary-kicker">Фильм</p>
          <h3 data-preview-title></h3><p class="kg-diary-muted" data-preview-meta></p>
          <label><span>Сменить фильм</span><select name="film" required></select></label>
        </div>
      </div>
      <label><span>Дата просмотра</span><input name="date" type="date" required></label>
    </section>
    <section class="kg-diary-card kg-diary-editor-card">
      <h3>Оценка архивиста</h3>
      <div class="kg-diary-editor-stars" role="group" aria-label="Личная оценка">
        ${[1,2,3,4,5].map(value => `<button type="button" data-rating="${value}" aria-label="${value} / 5" aria-pressed="false">☆</button>`).join("")}
      </div>
      <label><span>Личная оценка</span><select name="rating"></select></label>
      <label class="kg-diary-check"><input name="festival" type="checkbox"> <span>Фестивальный показ</span></label>
      <label class="kg-diary-check"><input name="rewatch" type="checkbox"> <span>Повторный просмотр</span></label>
    </section>
    <section class="kg-diary-card kg-diary-editor-card">
      <div class="kg-diary-row"><h3>Рецензия и заметки</h3><output class="kg-diary-muted" data-word-count></output></div>
      <label><span>Заголовок текста</span><input name="title" type="text" maxlength="100"></label>
      <label class="kg-diary-check"><input name="spoiler" type="checkbox"> <span>Спойлер</span></label>
      <label><span>Заметка</span><textarea name="text" rows="7" maxlength="1200"></textarea></label>
    </section>
    <section class="kg-diary-card kg-diary-editor-card">
      <h3>Настроение и вайб</h3>
      <div class="kg-diary-vibes">${vibes.map(vibe => `<button type="button" data-vibe="${vibe}" aria-pressed="false">${vibe}</button>`).join("")}</div>
      <label><span>Свой вайб</span><input name="customVibe" type="text" maxlength="48"></label>
      ${slider(metrics[0])}
    </section>
    <section class="kg-diary-card kg-diary-editor-card">
      <h3>Сенсорный паспорт</h3>
      <label><span>Теги через запятую</span><input name="tags" type="text" maxlength="160"></label>
      ${metrics.slice(1).map(slider).join("")}
    </section>
    <button class="kg-diary-primary" type="submit">Опубликовать в кинодневник</button>
    <button class="kg-diary-draft" type="button" data-save-draft>Сохранить как личный черновик</button>
  </form>`;
  localizeInterfaceMarkup(noteDialog);
  document.body.appendChild(noteDialog);

  const form = noteDialog.querySelector("form");
  const fields = form.elements;
  fields.rating.add(new Option(uiText("Без оценки"),""));
  for (let rating = 5; rating >= .5; rating -= .5) fields.rating.add(new Option(number.format(rating),String(rating)));
  const calendar = dialog.querySelector('input[type="month"]');
  const status = dialog.querySelector("[data-status]");
  const notesKey = "kgCinemaDiaryNotes";
  const rhythm = dialog.querySelector("#kg-diary-rhythm");
  const rhythmToggle = dialog.querySelector(".kg-diary-toggle");
  function setRhythmCollapsed(collapsed) {
    rhythm.hidden = collapsed;
    rhythmToggle.setAttribute("aria-expanded",String(!collapsed));
    rhythmToggle.setAttribute("aria-label",uiText(collapsed ? "Показать киноритм месяца" : "Скрыть киноритм месяца"));
  }
  rhythmToggle.addEventListener("click",() => {
    setRhythmCollapsed(!rhythm.hidden);
    store.set(rhythmKey,rhythm.hidden);
  });
  let notes = store.get(notesKey,{}) || {};

  function makeEntry(film) {
    const note = notes[String(film.id)] || {};
    const date = readDate(note.date || film.watchedAt);
    const code = film.countries?.[0] || film.cc || "";
    return {film,note,date,key:date ? dayKey(date) : "",code:/^[A-Z]{2}$/.test(code) ? code : ""};
  }

  function refreshEntries() {
    entries = watched.filter(film => Number.isSafeInteger(Number(film?.id)) && Number(film.id) > 0).map(makeEntry).sort((a,b) => b.key.localeCompare(a.key));
  }

  const filmName = film => film.title || film.original || uiText("Фильм №{id}",{id:film.id});
  const currentList = () => source === "bookmarks" ? bookmarks : entries;

  async function refreshBookmarks() {
    const load = ++bookmarkLoad;
    const saved = store.get("kgBookmarkFilms",{}) || {};
    const watchedById = new Map(entries.map(entry => [Number(entry.film.id),entry.film]));
    bookmarks = kgBookmarkIds().map(id => makeEntry(watchedById.get(id) || saved[id] || {id}));
    renderList();
    if (!apiKey) return;
    const missing = bookmarks.filter(entry => !entry.film.title || !entry.film.poster);
    for (let index=0; index<missing.length; index+=6) {
      await Promise.all(missing.slice(index,index+6).map(async entry => {
        try {
          const details = await filmDetails(entry.film.id);
          if (load !== bookmarkLoad || !details.title) return;
          Object.assign(entry, makeEntry({
            id:entry.film.id,title:details.title,original:details.originalTitle,year:details.release.slice(0,4),
            poster:details.localizedPoster?.path || entry.film.poster,cc:details.countries[0] || entry.code
          }));
          if (noteDialog.open) {
            const option = [...fields.film.options].find(item => item.value === String(entry.film.id));
            if (option) option.textContent = filmName(entry.film);
          }
        } catch { /* The bookmark remains selectable while its metadata is unavailable. */ }
      }));
      if (load !== bookmarkLoad || source !== "bookmarks" || !dialog.open) return;
      const active = document.activeElement;
      const focusedFilm = active?.dataset.filmSelect;
      const focusedEdit = active?.dataset.edit;
      if (!noteDialog.open) {
        renderList();
        if (focusedFilm || focusedEdit) {
          const selector = focusedFilm ? `[data-film-select="${focusedFilm}"]` : `[data-edit="${focusedEdit}"]`;
          dialog.querySelector(selector)?.focus({preventScroll:true});
        }
      }
    }
  }

  function showStatus(message = "") {
    status.textContent = uiText(message);
    status.hidden = !message;
  }

  function matches(entry, category) {
    return category === "all" || (category === "notes" && !!entry.note.text) ||
      (category === "masterpieces" && entry.note.rating === 5) ||
      (category === "festival" && entry.note.festival) || (category === "rewatch" && entry.note.rewatch);
  }

  function filmCard(entry) {
    const {film,note,date,code} = entry;
    const card = document.createElement("article");
    card.className = "kg-diary-card";
    card.innerHTML = `
      <div class="kg-bookmark-card"><button type="button" class="kg-diary-select-film" data-film-select>
      <span class="kg-diary-film">
        <span class="kg-diary-poster">${icon("movie")}</span>
        <span>
          <span class="kg-diary-muted block" data-date></span><strong class="kg-diary-film-name block"></strong><span class="kg-diary-muted block" data-meta></span>
          <span class="kg-diary-muted block" data-tags></span><span class="kg-diary-stars block" data-stars hidden></span>
        </span>
      </span>
      </button>${kgBookmarkButton(film, "edge")}</div>
      <div class="kg-diary-film-action" hidden><button type="button" class="kg-diary-edit" data-edit></button></div>
      <div class="kg-diary-note-content">
        <strong data-note-title hidden></strong>
        <blockquote class="kg-diary-note" hidden></blockquote>
        <details hidden><summary>${uiText("Показать спойлер")}</summary><p class="kg-diary-note"></p></details>
        <p class="kg-diary-muted" data-note-extra hidden></p>
      </div>`;
    if (/^\/[\w.-]+$/.test(film.poster || "")) {
      const image = document.createElement("img");
      image.alt = "";
      image.loading = "lazy";
      image.src = "https://image.tmdb.org/t/p/w342" + film.poster;
      const poster = card.querySelector(".kg-diary-poster");
      poster.replaceChildren(image);
      image.addEventListener("error", () => { poster.innerHTML = icon("movie"); }, {once:true});
    }
    const select = card.querySelector("[data-film-select]");
    const id = String(film.id);
    select.dataset.filmSelect = id;
    select.setAttribute("aria-expanded",String(id === selectedFilm));
    const action = card.querySelector(".kg-diary-film-action");
    action.id = "kg-diary-film-action-" + id;
    select.setAttribute("aria-controls",action.id);
    action.hidden = id !== selectedFilm;
    const edit = action.querySelector("button");
    edit.dataset.edit = id;
    edit.textContent = uiText(Object.hasOwn(notes,id) ? "Редактировать запись" : "Добавить запись");
    card.querySelector(".kg-diary-film-name").textContent = filmName(film);
    card.querySelector("[data-date]").textContent = date ? dateLabel.format(date) : source === "watched" ? uiText("Дата не указана") : "";
    card.querySelector("[data-meta]").textContent = [film.original,film.year,code && countryName(code)].filter(Boolean).join(" · ");
    card.querySelector("[data-tags]").textContent = [
      note.festival && uiText("Фестивальный показ"),note.rewatch && uiText("Повторный просмотр")
    ].filter(Boolean).join(" · ");
    if (Number.isFinite(note.rating) && note.rating > 0 && note.rating <= 5) {
      const stars = card.querySelector("[data-stars]");
      stars.hidden = false;
      stars.textContent = "★".repeat(Math.floor(note.rating)) + (note.rating % 1 ? "½" : "") + " · " + number.format(note.rating);
    }
    const quote = card.querySelector("blockquote");
    quote.hidden = !note.text || !!note.spoiler;
    quote.textContent = quote.hidden ? "" : note.text;
    const spoiler = card.querySelector("details");
    spoiler.hidden = !note.text || !note.spoiler;
    spoiler.querySelector("p").textContent = spoiler.hidden ? "" : note.text;
    const title = card.querySelector("[data-note-title]");
    title.hidden = !note.title;
    title.textContent = note.title || "";
    const extra = card.querySelector("[data-note-extra]");
    extra.textContent = [uiText(note.vibe || ""), ...(Array.isArray(note.tags) ? note.tags.map(tag => "#" + tag) : [])].filter(Boolean).join(" · ");
    extra.hidden = !extra.textContent;
    return card;
  }

  function render() {
    const counts = Object.create(null);
    const monthly = entries.filter(entry => entry.key.startsWith(month));
    const ratings = entries.map(entry => entry.note.rating).filter(rating => Number.isFinite(rating) && rating > 0 && rating <= 5);
    const totals = {
      watched:entries.length, countries:new Set(entries.map(entry => entry.code).filter(Boolean)).size,
      rating:ratings.length ? ratings.reduce((sum,rating) => sum + rating,0)/ratings.length : null,
      notes:entries.filter(entry => entry.note.text).length
    };
    for (const [key,value] of Object.entries(totals)) {
      dialog.querySelector(`[data-stat="${key}"]`).textContent = value === null ? "—" : number.format(value);
    }

    const monthDate = readDate(month + "-01");
    const label = monthLabel.format(monthDate);
    const monthButton = dialog.querySelector("[data-month-label]");
    monthButton.textContent = label + " · " + number.format(monthly.length);
    monthButton.setAttribute("aria-pressed",String(limitToMonth && !day));
    dialog.querySelector("[data-analysis-month]").textContent = label;
    monthly.forEach(entry => { counts[entry.key] = (counts[entry.key] || 0) + 1; });
    const days = new Date(monthDate.getFullYear(),monthDate.getMonth()+1,0).getDate();
    dialog.querySelector("[data-days]").innerHTML = Array.from({length:days},(_,index) => {
      const key = month + "-" + String(index+1).padStart(2,"0");
      const count = counts[key] || 0;
      return `<button type="button" data-day="${key}" data-level="${Math.min(2,count)}" aria-pressed="${key === day}" aria-label="${dateLabel.format(readDate(key))} · ${number.format(count)}">${index+1}</button>`;
    }).join("");

    renderList();

    const geography = dialog.querySelector(".kg-diary-geography");
    geography.replaceChildren();
    const countries = new Map();
    monthly.forEach(({code}) => { if (code) countries.set(code,(countries.get(code) || 0)+1); });
    for (const [code,count] of [...countries].sort((a,b) => b[1]-a[1]).slice(0,5)) {
      const row = document.createElement("div");
      row.innerHTML = '<div class="kg-diary-row kg-diary-muted"><span></span><b></b></div><progress></progress>';
      row.querySelector("span").textContent = countryName(code);
      row.querySelector("b").textContent = number.format(count);
      row.querySelector("progress").max = monthly.length;
      row.querySelector("progress").value = count;
      row.querySelector("progress").setAttribute("aria-label",countryName(code));
      geography.append(row);
    }
    if (!countries.size) geography.textContent = uiText("Данных за этот месяц пока нет.");
  }

  function showEmpty(list,message) {
    const empty = document.createElement("p");
    empty.className = "kg-diary-card kg-diary-muted";
    empty.textContent = uiText(message);
    list.append(empty);
  }

  function renderList() {
    calendar.hidden = source === "bookmarks";
    rhythm.closest("section").hidden = source === "bookmarks";
    const tabs = dialog.querySelector(".kg-diary-tabs");
    tabs.hidden = source === "bookmarks";
    tabs.innerHTML = collections.map(([key,title]) =>
      `<button type="button" data-filter="${key}" aria-pressed="${key === filter}">${uiText(title)} (${number.format(entries.filter(entry => matches(entry,key)).length)})</button>`).join("");

    const list = dialog.querySelector("[data-entries]");
    list.replaceChildren();
    if (source === "bookmarks") {
      if (bookmarks.length) {
        const section = document.createElement("section");
        section.className = "kg-diary-group";
        section.append(...bookmarks.map(filmCard));
        list.append(section);
      } else showEmpty(list,"В закладках пока нет фильмов.");
      return;
    }
    const groups = new Map();
    const period = limitToMonth ? entries.filter(entry => entry.key.startsWith(month)) : entries;
    period.filter(entry => (!day || entry.key === day) && matches(entry,filter)).forEach(entry => {
      const key = entry.key.slice(0,7);
      if (!groups.has(key)) groups.set(key,[]);
      groups.get(key).push(entry);
    });
    for (const [key,items] of groups) {
      const section = document.createElement("section");
      section.className = "kg-diary-group";
      section.innerHTML = '<div class="kg-diary-row"><h2></h2><span class="kg-diary-count"></span></div>';
      section.querySelector("h2").textContent = key ? monthLabel.format(readDate(key+"-01")) : uiText("Без даты");
      section.querySelector(".kg-diary-count").textContent = uiText("Сеансы: {count}",{count:number.format(items.length)});
      section.append(...items.map(filmCard));
      list.append(section);
    }
    if (!groups.size) {
      showEmpty(list,entries.length ? "За выбранный период или по фильтру записей нет." : "Отметьте фильм как просмотренный, чтобы он появился в кинодневнике.");
    }

  }

  function updateEditor() {
    const rating = Number(fields.rating.value);
    noteDialog.querySelectorAll("[data-rating]").forEach(button => {
      const value = Number(button.dataset.rating);
      button.textContent = rating >= value ? "★" : rating === value - .5 ? "◐" : "☆";
      button.setAttribute("aria-pressed",String(rating === value));
    });
    metrics.forEach(([key,,max]) => {
      noteDialog.querySelector(`[data-value="${key}"]`).textContent = max === 100
        ? number.format(Number(fields[key].value)) + "%" : fields[key].value + " / 10";
    });
    const words = fields.text.value.trim().split(/\s+/).filter(Boolean).length;
    noteDialog.querySelector("[data-word-count]").textContent = uiText("Слов: {count}",{count:number.format(words)});
  }

  function fillNote() {
    const entry = currentList().find(item => String(item.film.id) === fields.film.value);
    if (!entry) return;
    const draft = (store.get(draftKey,{}) || {})[fields.film.value];
    const note = draft || entry.note;
    const {film,code} = entry;
    const poster = noteDialog.querySelector(".kg-diary-preview img");
    const hasPoster = /^\/[\w.-]+$/.test(film.poster || "");
    poster.hidden = !hasPoster;
    poster.nextElementSibling.hidden = hasPoster;
    if (hasPoster) poster.src = "https://image.tmdb.org/t/p/w154" + film.poster;
    else poster.removeAttribute("src");
    noteDialog.querySelector("[data-preview-title]").textContent = filmName(film);
    noteDialog.querySelector("[data-preview-meta]").textContent = [film.original,film.year,code && countryName(code)].filter(Boolean).join(" · ");
    noteDialog.querySelector("[data-draft-status]").textContent = draft ? uiText("Личный черновик") : "";
    fields.date.value = note.date || entry.key || dayKey(new Date());
    fields.rating.value = note.rating || "";
    fields.title.value = note.title || "";
    fields.text.value = note.text || "";
    fields.tags.value = Array.isArray(note.tags) ? note.tags.join(", ") : "";
    fields.customVibe.value = vibes.includes(note.vibe) ? "" : note.vibe || "";
    noteDialog.querySelectorAll("[data-vibe]").forEach(button => button.setAttribute("aria-pressed",String(button.dataset.vibe === note.vibe)));
    for (const key of ["festival","rewatch","spoiler"]) fields[key].checked = !!note[key];
    for (const [key] of metrics) fields[key].value = note.metrics?.[key] ?? 0;
    updateEditor();
  }

  function entryValues() {
    return {
      date:fields.date.value,rating:Number(fields.rating.value),title:fields.title.value.trim(),
      text:fields.text.value.trim(),festival:fields.festival.checked,rewatch:fields.rewatch.checked,spoiler:fields.spoiler.checked,
      vibe:fields.customVibe.value.trim() || noteDialog.querySelector('[data-vibe][aria-pressed="true"]')?.dataset.vibe || "",
      tags:[...new Set(fields.tags.value.split(",").map(tag => tag.trim().replace(/^#+/,"")).filter(Boolean))],
      metrics:Object.fromEntries(metrics.map(([key]) => [key,Number(fields[key].value)]))
    };
  }

  function openNote(id = "") {
    const films = currentList();
    if (!films.length) {
      showStatus(source === "bookmarks" ? "Сначала добавьте фильм в закладки." : "Сначала отметьте фильм как просмотренный.");
      return;
    }
    fields.film.replaceChildren(...films.map(({film}) => new Option(filmName(film),film.id)));
    fields.film.value = id || String(films[0].film.id);
    fillNote();
    noteDialog.showModal();
    noteDialog.scrollTop = 0;
  }

  noteDialog.addEventListener("close",() => {
    if (!dialog.open || noteDialog.open || source !== "bookmarks") return;
    renderList();
    dialog.querySelector(`[data-edit="${selectedFilm}"]`)?.focus({preventScroll:true});
  });
  fields.film.addEventListener("change",fillNote);
  form.addEventListener("input",updateEditor);
  noteDialog.querySelector(".kg-diary-preview img").addEventListener("error",event => {
    event.target.hidden = true;
    event.target.nextElementSibling.hidden = false;
  });
  noteDialog.addEventListener("click",event => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.hasAttribute("data-cancel")) noteDialog.close();
    if (button.dataset.rating) {
      fields.rating.value = fields.rating.value === button.dataset.rating ? "" : button.dataset.rating;
      updateEditor();
    }
    if (button.dataset.vibe) {
      const next = button.getAttribute("aria-pressed") !== "true";
      fields.customVibe.value = "";
      noteDialog.querySelectorAll("[data-vibe]").forEach(chip => chip.setAttribute("aria-pressed",String(chip === button && next)));
    }
    if (button.hasAttribute("data-save-draft")) {
      const drafts = store.get(draftKey,{}) || {};
      try {
        localStorage.setItem(draftKey,JSON.stringify({...drafts,[fields.film.value]:entryValues()}));
        noteDialog.querySelector("[data-draft-status]").textContent = uiText("Черновик сохранён.");
      } catch {
        noteDialog.querySelector("[data-draft-status]").textContent = uiText("Не удалось сохранить черновик.");
      }
    }
  });
  form.addEventListener("submit",event => {
    event.preventDefault();
    const id = fields.film.value;
    const next = {...(store.get(notesKey,{}) || {}),[id]:entryValues()};
    try {
      localStorage.setItem(notesKey,JSON.stringify(next));
    } catch {
      noteDialog.querySelector("[data-draft-status]").textContent = uiText("Хранилище браузера недоступно. Запись не сохранена.");
      return;
    }
    const drafts = store.get(draftKey,{}) || {};
    if (Object.hasOwn(drafts,id)) {
      delete drafts[id];
      store.set(draftKey,drafts);
    }
    notes = next;
    const scroll = dialog.querySelector(".kg-diary-scroll");
    const scrollTop = scroll.scrollTop;
    selectedFilm = id;
    refreshEntries();
    bookmarks = bookmarks.map(entry => makeEntry(entry.film));
    filter = "all";
    day = "";
    month = fields.date.value.slice(0,7);
    calendar.value = month;
    render();
    noteDialog.close();
    scroll.scrollTop = scrollTop;
    dialog.querySelector(`[data-edit="${id}"]`)?.focus({preventScroll:true});
    showStatus("Запись сохранена.");
  });

  calendar.addEventListener("change",() => {
    if (!calendar.value || !readDate(calendar.value+"-01")) { calendar.value = month; return; }
    month = calendar.value;
    limitToMonth = true;
    day = "";
    render();
  });

  dialog.addEventListener("click",async event => {
    const button = event.target.closest("button");
    if (!button) return;
    const { edit, route, filter:nextFilter, day:nextDay, source:nextSource, filmSelect } = button.dataset;
    if (button.hasAttribute("data-back")) dialog.close();
    if (route) {
      const target = document.querySelector(routeSelectors[route]);
      if (!target) return;
      dialog.close();
      closeParent?.();
      target.click();
      return;
    }
    if (nextSource && nextSource !== source) {
      source = nextSource;
      selectedFilm = "";
      showStatus();
      dialog.querySelectorAll("[data-source]").forEach(tab => tab.setAttribute("aria-pressed",String(tab === button)));
      if (source === "bookmarks") refreshBookmarks();
      else {
        bookmarkLoad++;
        renderList();
      }
      return;
    }
    if (filmSelect) {
      selectedFilm = selectedFilm === filmSelect ? "" : filmSelect;
      dialog.querySelectorAll("[data-film-select]").forEach(card => {
        const expanded = card.dataset.filmSelect === selectedFilm;
        card.setAttribute("aria-expanded",String(expanded));
        document.getElementById(card.getAttribute("aria-controls")).hidden = !expanded;
      });
      return;
    }
    if (button.hasAttribute("data-add")) openNote(selectedFilm);
    if (edit) openNote(edit);
    if (button.hasAttribute("data-month-label")) {
      limitToMonth = !limitToMonth || !!day;
      day = "";
      render();
    }
    if (nextFilter || nextDay) {
      if (nextFilter) filter = nextFilter;
      if (nextDay) day = day === nextDay ? "" : nextDay;
      render();
      dialog.querySelector(nextFilter ? `[data-filter="${nextFilter}"]` : `[data-day="${nextDay}"]`)?.focus();
    }
    if (button.hasAttribute("data-copy")) {
      const summary = uiText("Кинодневник · Фильмов: {films} · Заметок: {notes}",{
        films:number.format(entries.length),notes:number.format(entries.filter(entry => entry.note.text).length)
      });
      try {
        if (navigator.share) await navigator.share({title:uiText("Кинодневник"),text:summary});
        else { await navigator.clipboard.writeText(summary); showStatus("Сводка скопирована."); }
      } catch (error) {
        if (error.name !== "AbortError") showStatus("Не удалось поделиться дневником.");
      }
    }
  });

  document.addEventListener("kg-bookmark-change",event => {
    if (!dialog.open || source !== "bookmarks") return;
    if (selectedFilm === String(event.detail.id) && !event.detail.enabled) selectedFilm = "";
    refreshBookmarks();
    // Removing the card also removes the focused button.
    dialog.querySelector('[data-source="bookmarks"]').focus({preventScroll:true});
  });

  window.KGOpenCinemaDiary = ({avatar, closeParent: onNavigate, initialSource} = {}) => {
    closeParent = onNavigate;
    bookmarkLoad++;
    source = initialSource === "bookmarks" ? "bookmarks" : "watched";
    selectedFilm = "";
    dialog.querySelectorAll("[data-source]").forEach(tab => tab.setAttribute("aria-pressed",String(tab.dataset.source === source)));
    notes = store.get(notesKey,{}) || {};
    limitToMonth = false;
    refreshEntries();
    setRhythmCollapsed(store.get(rhythmKey,false) === true);
    month = entries.find(entry => entry.key)?.key.slice(0,7) || dayKey(new Date()).slice(0,7);
    calendar.value = month;
    filter = "all";
    day = "";
    showStatus();
    const portrait = dialog.querySelector(".kg-diary-header img");
    portrait.hidden = !avatar;
    if (avatar) portrait.src = avatar;
    if (!dialog.open) dialog.showModal();
    render();
    if (source === "bookmarks") refreshBookmarks();
    dialog.querySelector(".kg-diary-scroll").scrollTop = 0;
  };
})();
