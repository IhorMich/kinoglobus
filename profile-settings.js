/* Settings reached from the personal cabinet. */
(() => {
  const subscriptionVisible = false;
  const defaultBanner = "assets/vibes/after-midnight.jpg";
  const label = source => uiText(source).replace(/[&<>"']/g, ch =>
    ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[ch]);
  const icon = name => `<span class="material-symbols-outlined" aria-hidden="true">${name}</span>`;
  const entries = {
    diary:["movie_filter","Кинодневник и трекинг","Записи, оценки и даты просмотра"],
    services:["tv","Стриминговые сервисы","Регион для раздела «Где смотреть»"],
    language:["translate","Аудиодорожки и локализация","Язык, регион и субтитры трейлеров"],
    subscription:["stars","Подписка Moven Black Pro","Управление подпиской"],
    security:["shield","Безопасность и вход","Электронная почта и пароль"],
    notifications:["calendar_month","Уведомления и радар премьер","Релизы и напоминания"],
    export:["sync","Экспорт и резервные копии","Экспорт данных и синхронизация"],
    appearance:["palette","Внешний вид и тема","Темы и цвет кнопок"]
  };
  const row = id => {
    const [symbol,name,description] = entries[id];
    const hidden = id === "subscription" && !subscriptionVisible;
    return `<button type="button" class="kg-ps-row" data-ps-route="${id}" ${hidden ? "hidden" : ""}>
      <span class="kg-ps-row-icon">${icon(symbol)}</span>
      <span class="kg-ps-row-text"><strong>${label(name)}</strong><small>${label(description)}</small></span>
      ${icon(id === "subscription" ? "arrow_forward" : "chevron_right")}
    </button>`;
  };
  const group = (name,routes) => `<section class="kg-ps-group"><h2>${label(name)}</h2>
    <div class="kg-ps-list">${routes.map(row).join("")}</div>
  </section>`;

  const hub = document.createElement("dialog");
  hub.id = "kg-profile-settings";
  hub.className = "kg-ps-dialog";
  hub.setAttribute("aria-labelledby","kg-ps-title");
  hub.innerHTML = `<header class="kg-ps-header">
    <button type="button" class="kg-ps-round kg-ps-control" data-ps-back autofocus aria-label="${label("Назад")}">${icon("arrow_back")}</button>
    <h1 id="kg-ps-title">${label("Настройки")}</h1>
    <button type="button" class="kg-ps-round kg-ps-control" data-ps-edit="profile" aria-label="${label("Редактировать профиль")}"><img data-ps-avatar alt="" width="36" height="36"></button>
  </header>
  <main class="kg-ps-scroll">
    <section class="kg-ps-hero">
      <div class="kg-ps-cover"><img alt="" data-ps-cover>
        <button type="button" class="kg-ps-control kg-ps-change" data-ps-edit="banner">${icon("image")}${label("Сменить фон")}</button>
      </div>
      <div class="kg-ps-identity">
        <div class="kg-ps-portrait">
          <img data-ps-avatar alt="" width="72" height="72">
          <button type="button" class="kg-ps-round kg-ps-control" data-ps-edit="avatar" aria-label="${label("Изменить портрет")}">${icon("photo_camera")}</button>
        </div>
        <div class="kg-ps-person"><h2 data-ps-name></h2><p data-ps-handle></p></div>
        <div class="kg-ps-edit">
          <span class="kg-ps-chip" ${subscriptionVisible ? "" : "hidden"}><i></i>Black Pro</span>
          <button type="button" data-ps-edit="profile">${label("Изменить")}${icon("arrow_forward")}</button>
        </div>
      </div>
      <button type="button" class="kg-ps-status kg-ps-control" data-ps-edit="bio" aria-label="${label("Изменить статус")}">
        <i></i><span data-ps-bio></span>${icon("edit")}
      </button>
    </section>

    <section class="kg-ps-spotlight">
      <button type="button" class="kg-ps-metric kg-ps-control" data-ps-spoilers aria-pressed="true">
        <span class="kg-ps-metric-top"><span data-ps-spoiler-icon></span><span class="kg-ps-chip"><i></i><b data-ps-spoiler-badge></b></span></span>
        <span class="kg-ps-metric-text"><small>${label("Спойлеры")}</small>
          <strong data-ps-spoiler-value></strong><span data-ps-spoiler-description></span></span>
      </button>
      <div class="kg-ps-metric">
        <span class="kg-ps-metric-top">${icon("star")}<small>TMDb</small></span>
        <span class="kg-ps-metric-text"><small>${label("Шкала оценок")}</small><strong>10 / 10.0</strong></span>
      </div>
    </section>

    <div class="kg-ps-groups">
      ${group("Кино и трекинг",["diary","services","language"])}
      ${group(subscriptionVisible ? "Подписка и аккаунт" : "Аккаунт",["subscription","security"])}
      ${group("Приложение и данные",["notifications","export","appearance"])}
    </div>
    <footer class="kg-ps-footer">
      <button type="button" class="kg-ps-control" data-ps-logout>${icon("logout")}${label("Выйти из аккаунта")}</button>
      <div class="kg-ps-brand"><span>${icon("theater_comedy")} MOVEN</span><small>${label("Сделано для синефилов")}</small></div>
    </footer>
  </main>`;
  document.body.append(hub);
  const scroll = hub.querySelector("main");
  const spoilers = hub.querySelector("[data-ps-spoilers]");
  let session;

  function renderSpoilers() {
    const hidden = window.KGCinemaDiarySpoilers.get();
    spoilers.setAttribute("aria-pressed", String(hidden));
    spoilers.querySelector("[data-ps-spoiler-icon]").innerHTML = icon(hidden ? "visibility_off" : "visibility");
    spoilers.querySelector("[data-ps-spoiler-badge]").textContent = uiText(hidden ? "Активно" : "Выключено");
    spoilers.querySelector("[data-ps-spoiler-value]").textContent = uiText(hidden ? "Скрыты" : "Показаны");
    spoilers.querySelector("[data-ps-spoiler-description]").textContent = uiText(hidden ? "Безопасный режим" : "Показывать спойлеры");
  }

  function render(profile) {
    for (const photo of hub.querySelectorAll("[data-ps-avatar]")) photo.src = profile.avatar;
    hub.querySelector("[data-ps-cover]").src = profile.banner || defaultBanner;
    hub.querySelector("[data-ps-name]").textContent = profile.name;
    hub.querySelector("[data-ps-handle]").textContent = profile.handle || "";
    hub.querySelector("[data-ps-bio]").textContent = profile.bio || uiText("Добавить статус");
    renderSpoilers();
  }

  function openBlank(route) {
    const page = document.createElement("dialog");
    page.className = "kg-ps-dialog kg-ps-blank";
    page.dataset.profileSettingsPage = route;
    page.setAttribute("aria-labelledby","kg-ps-page-title");
    page.innerHTML = `<header class="kg-ps-header">
      <button type="button" class="kg-ps-round kg-ps-control" autofocus aria-label="${label("Назад")}">${icon("arrow_back")}</button>
      <h1 id="kg-ps-page-title">${label(entries[route][1])}</h1>
    </header>`;
    page.querySelector("button").addEventListener("click",()=>page.close());
    page.addEventListener("close",()=>page.remove(),{once:true});
    document.body.append(page);
    page.showModal();
  }

  hub.addEventListener("click",event=>{
    const button = event.target.closest("button");
    if (!button) return;
    if (button.hasAttribute("data-ps-back")) { hub.close(); return; }
    if (button.hasAttribute("data-ps-logout")) { hub.close(); session.logout(); return; }
    if (button === spoilers) {
      window.KGCinemaDiarySpoilers.set(spoilers.getAttribute("aria-pressed") !== "true");
      renderSpoilers();
      return;
    }
    const {psEdit,psRoute} = button.dataset;
    if (psEdit) { session.edit(psEdit, () => hub.close(), render); return; }
    switch (psRoute) {
      case "diary": session.diary(() => hub.close()); break;
      case "services": window.KGOpenSettings("watch-region"); break;
      case "language": window.KGOpenSettings("language-and-regional-standards"); break;
      case "notifications": window.KGReleaseFollow.openCalendar(); break;
      case "appearance": window.KGOpenSettings("theme-and-visual-style"); break;
      case "security":
      case "export": openBlank(psRoute); break;
      case "subscription": if (subscriptionVisible) openBlank(psRoute); break;
    }
  });
  hub.addEventListener("close",()=>{ if (!hub.open) session = null; });
  window.KGOpenProfileSettings = (profile,actions) => {
    session = actions;
    render(profile);
    if (!hub.open) hub.showModal();
    scroll.scrollTop = 0;
  };
})();
