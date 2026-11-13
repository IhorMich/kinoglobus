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
  let month = "";
  let day = "";
  let filter = "all";
  let limitToMonth = false;
  let navigate;

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
    #kg-diary-note {position:fixed;inset:auto 0 0;width:min(100%,480px);max-width:none;max-height:88dvh;margin:0 auto;border-radius:20px 20px 0 0;padding:18px 5% calc(18px + env(safe-area-inset-bottom,0px))}
    #kg-diary-note form {display:grid;gap:10px}
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
          <div class="kg-diary-row"><h2>Киноритм месяца</h2><button type="button" class="kg-diary-count" data-month-label aria-pressed="false"></button></div>
          <div class="kg-diary-strip" data-days></div>
          <div class="kg-diary-legend kg-diary-muted"><span>Без сеансов</span><span>1 фильм</span><span>Несколько фильмов</span></div>
        </section>
        <div class="kg-diary-tabs" role="group" aria-label="Фильтры дневника"></div>
        <div data-entries></div>
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
  noteDialog.innerHTML = `<form>
    <h2 id="kg-diary-note-title">Запись в кинодневнике</h2>
    <label>Фильм<select name="film" required></select></label>
    <label>Дата просмотра<input name="date" type="date" required></label>
    <label>Личная оценка<select name="rating"></select></label>
    <label>Заметка<textarea name="text" rows="4" maxlength="1200"></textarea></label>
    <label class="kg-diary-check"><input name="festival" type="checkbox"> <span>Фестивальный показ</span></label>
    <label class="kg-diary-check"><input name="rewatch" type="checkbox"> <span>Повторный просмотр</span></label>
    <button class="kg-diary-primary" type="submit">Сохранить запись</button>
    <button type="button" data-cancel>Отмена</button>
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
  let notes = store.get(notesKey,{}) || {};

  function refreshEntries() {
    entries = watched.filter(film => film?.id).map(film => {
      const note = notes[String(film.id)] || {};
      const date = readDate(note.date || film.watchedAt);
      const code = (film.countries || [])[0] || film.cc || "";
      return {film,note,date,key:date ? dayKey(date) : "",code:/^[A-Z]{2}$/.test(code) ? code : ""};
    }).sort((a,b) => b.key.localeCompare(a.key));
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
      <div class="kg-diary-film">
        <div class="kg-diary-poster">${icon("movie")}</div>
        <div>
          <p class="kg-diary-muted" data-date></p><h3></h3><p class="kg-diary-muted" data-meta></p>
          <p class="kg-diary-muted" data-tags></p><p class="kg-diary-stars" data-stars hidden></p>
          <button type="button" class="kg-diary-edit" data-edit>${uiText("Редактировать заметку")}</button>
        </div>
      </div>
      <blockquote class="kg-diary-note" hidden></blockquote>`;
    if (/^\/[\w.-]+$/.test(film.poster || "")) {
      const image = document.createElement("img");
      image.alt = "";
      image.loading = "lazy";
      image.src = "https://image.tmdb.org/t/p/w342" + film.poster;
      const poster = card.querySelector(".kg-diary-poster");
      poster.replaceChildren(image);
      image.addEventListener("error", () => { poster.innerHTML = icon("movie"); }, {once:true});
    }
    card.querySelector("h3").textContent = film.title || film.original || uiText("Фильм");
    card.querySelector("[data-date]").textContent = date ? dateLabel.format(date) : uiText("Дата не указана");
    card.querySelector("[data-meta]").textContent = [film.original,film.year,code && countryName(code)].filter(Boolean).join(" · ");
    card.querySelector("[data-tags]").textContent = [
      note.festival && uiText("Фестивальный показ"),note.rewatch && uiText("Повторный просмотр")
    ].filter(Boolean).join(" · ");
    if (Number.isFinite(note.rating) && note.rating > 0 && note.rating <= 5) {
      const stars = card.querySelector("[data-stars]");
      stars.hidden = false;
      stars.textContent = "★".repeat(Math.floor(note.rating)) + (note.rating % 1 ? "½" : "") + " · " + number.format(note.rating);
    }
    card.querySelector("[data-edit]").dataset.edit = film.id;
    const quote = card.querySelector("blockquote");
    quote.hidden = !note.text;
    quote.textContent = note.text || "";
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

    dialog.querySelector(".kg-diary-tabs").innerHTML = collections.map(([key,title]) =>
      `<button type="button" data-filter="${key}" aria-pressed="${key === filter}">${uiText(title)} (${number.format(entries.filter(entry => matches(entry,key)).length)})</button>`).join("");

    const groups = new Map();
    const period = limitToMonth ? monthly : entries;
    period.filter(entry => (!day || entry.key === day) && matches(entry,filter)).forEach(entry => {
      const key = entry.key.slice(0,7);
      if (!groups.has(key)) groups.set(key,[]);
      groups.get(key).push(entry);
    });
    const list = dialog.querySelector("[data-entries]");
    list.replaceChildren();
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
      const empty = document.createElement("p");
      empty.className = "kg-diary-card kg-diary-muted";
      empty.textContent = uiText(entries.length ? "За выбранный период или по фильтру записей нет." : "Отметьте фильм как просмотренный, чтобы он появился в кинодневнике.");
      list.append(empty);
    }

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

  function fillNote() {
    const entry = entries.find(item => String(item.film.id) === fields.film.value);
    if (!entry) return;
    fields.date.value = entry.key || dayKey(new Date());
    fields.rating.value = entry.note.rating || "";
    fields.text.value = entry.note.text || "";
    fields.festival.checked = !!entry.note.festival;
    fields.rewatch.checked = !!entry.note.rewatch;
  }

  function openNote(id = "") {
    if (!entries.length) {
      showStatus("Сначала отметьте фильм как просмотренный.");
      return;
    }
    fields.film.replaceChildren(...entries.map(({film}) => new Option(film.title || film.original || uiText("Фильм"),film.id)));
    fields.film.value = id || String(entries[0].film.id);
    fillNote();
    noteDialog.showModal();
  }

  fields.film.addEventListener("change",fillNote);
  noteDialog.querySelector("[data-cancel]").addEventListener("click",() => noteDialog.close());
  form.addEventListener("submit",event => {
    event.preventDefault();
    const next = {...(store.get(notesKey,{}) || {}),[fields.film.value]:{
      date:fields.date.value,rating:Number(fields.rating.value),text:fields.text.value.trim(),
      festival:fields.festival.checked,rewatch:fields.rewatch.checked
    }};
    try {
      localStorage.setItem(notesKey,JSON.stringify(next));
    } catch {
      showStatus("Хранилище браузера недоступно. Запись не сохранена.");
      noteDialog.close();
      return;
    }
    notes = next;
    refreshEntries();
    filter = "all";
    day = "";
    month = fields.date.value.slice(0,7);
    calendar.value = month;
    render();
    noteDialog.close();
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
    const { edit, route, filter:nextFilter, day:nextDay } = button.dataset;
    if (button.hasAttribute("data-back")) dialog.close();
    if (route) navigate(route,() => dialog.close());
    if (button.hasAttribute("data-add")) openNote();
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

  window.KGOpenCinemaDiary = (avatar, openRoute) => {
    navigate = openRoute;
    notes = store.get(notesKey,{}) || {};
    limitToMonth = false;
    refreshEntries();
    month = entries.find(entry => entry.key)?.key.slice(0,7) || dayKey(new Date()).slice(0,7);
    calendar.value = month;
    filter = "all";
    day = "";
    showStatus();
    const portrait = dialog.querySelector(".kg-diary-header img");
    portrait.hidden = !avatar;
    if (avatar) portrait.src = avatar;
    render();
    if (!dialog.open) dialog.showModal();
    dialog.querySelector(".kg-diary-scroll").scrollTop = 0;
  };
})();
