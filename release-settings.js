/* Settings for a title's release and trailer follow. */
(() => {
  const esc = value => String(value ?? "").replace(/[&<>"']/g, ch =>
    ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[ch]);
  const label = (key,params) => esc(uiText(key,params));
  const paths = {
    close:"m6 6 12 12M18 6 6 18", bell:"M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12a2 2 0 0 0 4 0",
    info:"M12 11v5m0-8h.01M22 12A10 10 0 1 1 2 12a10 10 0 0 1 20 0Z",
    person:"M20 21H4a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4ZM16 9a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
    film:"M3 5h18v14H3zM3 9h18M7 5l3 4m4-4 3 4",
    tune:"M4 7h16M4 12h16M4 17h16M8 4v6m8-1v6m-5-1v6",
    clock:"M12 7v5l4 2m6-2a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z",
    sync:"M20 7v5h-5M4 17v-5h5m11 0A8 8 0 0 0 6 7m-2 5a8 8 0 0 0 14 5",
    calendar:"M8 3v4m8-4v4M4 10h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z",
    bookmark:"M6 3h12v19l-6-4-6 4V3Z", check:"m5 12 4 4L19 6",
    off:"M18 8a6 6 0 0 0-9-5M6 7c-1 6-1 8-3 10h13m-6 3a2 2 0 0 0 4 0M3 3l18 18",
    tv:"M3 5h18v13H3zm5 16h8"
  };
  const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name]}"/></svg>`;
  const image = path => /^\/[\w.-]+$/.test(path || "") ? `https://image.tmdb.org/t/p/w342${path}` : "";
  const dateLabel = date => new Date(date+"T12:00:00").toLocaleDateString(interfaceLanguage,{dateStyle:"medium"});
  const when = [
    ["В день релиза","В выбранное время"],
    ["За 2 часа","До выбранного времени"],
    ["За 1 день","Накануне релиза"],
    ["За 1 неделю","Для планирования"]
  ];
  let sheet;

  function switchRow(name,title,description,checked,symbol,disabled=false) {
    return `<label class="kg-rs-toggle">
      ${symbol ? icon(symbol) : ""}
      <span class="kg-rs-copy"><strong>${label(title)}</strong><small>${label(description)}</small></span>
      <input type="checkbox" name="${name}" ${checked?"checked":""} ${disabled?"disabled":""}><span class="kg-rs-switch" aria-hidden="true"></span>
    </label>`;
  }

  function open(item, opener, active) {
    if (sheet?.open) return;
    const follow = window.KGReleaseFollow, alerts = window.KGReleaseAlerts;
    const preferences = alerts.settings(item), film = follow.filmFor(item);
    const booked = !!window.kgIsBookmarked(film.id);
    const events = alerts.events({...item,settings:{...preferences,releases:true}});
    const date = item.kind === "series" ? events.map(e=>e.date).sort()[0] : item.date;
    const poster = image(item.poster);
    const avatarPath = document.querySelector("#kg-account-open img")?.getAttribute("src") || "assets/interface/index-01.jpg";
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const sub = [
      item.original && item.original!==item.title ? item.original : "",
      item.kind === "episode" ? item.episodeTitle || uiText("Эпизод {episode}",{episode:item.number})
        : item.season ? uiText("Сезон {season}",{season:item.season}) : ""
    ].filter(Boolean).join(" · ");
    const dialog = document.createElement("dialog");
    sheet = dialog;
    dialog.className = "kg-release-settings";
    dialog.setAttribute("aria-labelledby","kg-rs-title");
    dialog.innerHTML = `<div class="kg-rs-shell">
      <header class="kg-rs-header">
        <button type="button" data-rs-close aria-label="${label("Закрыть")}" autofocus>${icon("close")}</button>
        <h1 id="kg-rs-title">${label("Отслеживание релизов")}</h1>
        <button type="button" data-rs-info aria-label="${label("О напоминаниях")}">${icon("info")}</button>
        <button type="button" data-rs-profile aria-label="${label("Профиль")}" class="kg-rs-avatar"><img src="${esc(avatarPath)}" alt=""></button>
      </header>
      <form class="kg-rs-scroll">
        <p class="kg-rs-info" data-rs-help hidden>${label(alerts.native() ?
          "Напоминания приходят по известным датам выхода. Новые трейлеры проверяются при открытии приложения." :
          "Экспортируйте напоминание в календарь устройства. Новые трейлеры проверяются при открытии приложения.")}</p>
        <div class="kg-rs-state">
          <span class="kg-rs-state-icon">${icon("bell")}</span><span class="kg-rs-copy"><strong>${label(active?"Вы следите за проектом":"Отслеживание выключено")}</strong>
          <small>${label("Премьеры и трейлеры этого проекта")}</small></span>
          <button type="button" data-rs-edit>${label("Изменить")}</button>
        </div>
        <article class="kg-rs-project">
          <div class="kg-rs-poster">${poster ? `<img src="${esc(poster)}" alt="">` : icon("film")}</div>
          <div>
            <div class="kg-rs-meta"><span>${esc(date ? dateLabel(date) : uiText(item.ended?"Сериал завершён":"Ждём дату"))}</span>
              ${item.service?`<span>${icon("tv")}${esc(item.service)}</span>`:""}</div>
            <h2>${esc(item.title || uiText("Без названия"))}</h2>
            ${sub?`<p>${esc(sub)}</p>`:""}
            <div class="kg-rs-genres">${(item.genres||[]).map(g=>`<span>${label(g)}</span>`).join("")}
              ${item.episodeCount ? `<span>${label("Серий: {count}",{count:item.episodeCount})}</span>` : ""}</div>
          </div>
        </article>
        <section class="kg-rs-section" data-rs-channels>
          <header>${icon("tune")}<h2>${label("Что отслеживать")}</h2></header>
          ${switchRow("releases","Новые серии и премьеры","Напоминать о новых релизах",preferences.releases)}
          ${switchRow("trailers","Трейлеры и промоматериалы","Официальные трейлеры, тизеры и фичуретки",preferences.trailers)}
          <div data-rs-trailer hidden></div>
        </section>
        <fieldset class="kg-rs-section" data-rs-reminders>
          <legend>${icon("clock")}${label("Когда напоминать")}</legend>
          <div class="kg-rs-leads">${when.map(([title,hint],index)=>`<label><span><strong>${label(title)}</strong><small>${label(hint)}</small></span>
            <input type="radio" name="lead" value="${alerts.leadOptions[index]}" ${preferences.lead===alerts.leadOptions[index]?"checked":""}></label>`).join("")}</div>
          <label class="kg-rs-time"><span>${label("Ваше местное время")}<small>${esc(timezone)}</small></span>
            <input type="time" name="time" value="${esc(preferences.time)}" required></label>
          ${!alerts.native() && events.length ? `<button type="button" class="kg-rs-secondary" data-rs-export>${icon("calendar")}${label("Экспортировать напоминание")}</button>` : ""}
        </fieldset>
        <section class="kg-rs-section">
          <header>${icon("sync")}<h2>${label("Интеграция и списки")}</h2></header>
          <div class="kg-rs-integrations">
            ${switchRow("calendar","Добавить в «Мой календарь»","Показывать даты выхода в приложении",preferences.includeCalendar,"calendar")}
            ${switchRow("bookmark","Добавить в список «Хочу посмотреть»",booked?"Уже в закладках":"Сохранить проект в закладках",booked,"bookmark",booked)}
          </div>
          ${active && preferences.includeCalendar ? `<button type="button" class="kg-rs-secondary" data-rs-calendar>${icon("calendar")}${label("Перейти в календарь")}</button>` : ""}
        </section>
        <p class="kg-rs-error" role="status"></p>
        <button type="submit" class="kg-rs-save">${icon("check")}${label("Сохранить настройки")}</button>
        ${active ? `<button type="button" class="kg-rs-remove" data-rs-remove>${icon("off")}${label("Перестать следить")}</button>` : ""}
      </form>
    </div>`;

    const form = dialog.querySelector("form");
    const release = form.elements.releases;
    const status = dialog.querySelector(".kg-rs-error");
    const submit = form.querySelector("[type=submit]");
    const read = () => ({
      releases:release.checked,trailers:form.elements.trailers.checked,includeCalendar:form.elements.calendar.checked,
      lead:Number(form.elements.lead.value),time:form.elements.time.value
    });
    const update = () => {
      form.querySelector("[data-rs-reminders]").disabled = !release.checked;
      form.elements.calendar.disabled = !release.checked;
    };
    const presentTrailer = trailer => {
      if (!dialog.open || !trailer || !/^https:\/\/(?:www\.youtube\.com\/watch\?v=|vimeo\.com\/)[\w-]+$/.test(trailer.url || "")) return;
      const panel = dialog.querySelector("[data-rs-trailer]");
      panel.innerHTML = `<a target="_blank" rel="noopener noreferrer" href="${esc(trailer.url)}">${icon("film")}${label("Новый трейлер")}${trailer.title ? " · "+esc(trailer.title) : ""}</a>`;
      panel.hidden = false;
    };
    update();
    release.addEventListener("change",update);
    form.elements.trailers.addEventListener("change",()=>{dialog.querySelector("[data-rs-trailer]").hidden = !form.elements.trailers.checked || !item.trailer;});
    dialog.addEventListener("close",()=>{
      dialog.remove();
      if (sheet === dialog) sheet = null;
      if (opener.isConnected && !document.querySelector("#kg-personal-calendar[open]")) opener.focus({preventScroll:true});
    },{once:true});
    dialog.addEventListener("click",async event=>{
      const action = event.target.closest("button");
      if (action?.hasAttribute("data-rs-close") || event.target === dialog) dialog.close();
      if (action?.hasAttribute("data-rs-info")) {
        const help = dialog.querySelector("[data-rs-help]");
        help.hidden = !help.hidden;
        if (!help.hidden) help.scrollIntoView({block:"nearest"});
      }
      if (action?.hasAttribute("data-rs-profile")) { dialog.close(); window.KGOpenAccountPage("register"); }
      if (action?.hasAttribute("data-rs-edit")) form.querySelector("[data-rs-channels]").scrollIntoView({behavior:"smooth",block:"start"});
      if (action?.hasAttribute("data-rs-calendar")) { dialog.close(); follow.openCalendar(date); }
      if (action?.hasAttribute("data-rs-export")) {
        const options = read();
        try {
          await window.KGSeriesCalendar.exportReminders(alerts.events({...item,settings:options}),options.time,options.lead);
        } catch { status.textContent = uiText("Не удалось экспортировать напоминание."); }
      }
      if (action?.hasAttribute("data-rs-remove")) {
        try { follow.remove(item); dialog.close(); }
        catch { status.textContent = uiText("Не удалось сохранить подписку"); }
      }
    });
    form.addEventListener("submit",async event=>{
      event.preventDefault();
      if (submit.disabled) return;
      const options = read();
      if (!options.releases && !options.trailers) { status.textContent=uiText("Выберите, что отслеживать."); return; }
      if (!alerts.leadOptions.includes(options.lead) || !alerts.timePattern.test(options.time)) {
        status.textContent=uiText("Укажите время напоминания."); return;
      }
      status.textContent = "";
      submit.disabled = true;
      try {
        const result = await follow.applySettings(item,options,form.elements.bookmark.checked);
        dialog.close();
        const text = result.bookmarkFailed ? "Настройки сохранены. Не удалось добавить в закладки." :
          result.notificationsDisabled ? "Настройки сохранены. Разрешите уведомления в Android." : "Настройки отслеживания сохранены";
        follow.message(text,opener,result.previous ? undefined : ()=>{try { follow.remove(result.updated); } catch {}});
      } catch {
        status.textContent=uiText("Не удалось сохранить подписку");
        submit.disabled = false;
      }
    });
    document.body.append(dialog);
    dialog.showModal();
    if (active && preferences.trailers) {
      presentTrailer(item.trailer);
      follow.checkTrailer(item.key).then(presentTrailer);
    }
  }
  window.KGReleaseSettings = {open};
})();
