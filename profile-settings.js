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
    nickname:["person","Никнейм","Подпись к рецензиям"],
    public:["public","Публичная страница","Предпросмотр и приватность"],
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
    <button type="button" class="kg-ps-round kg-ps-control" data-ps-photo-action="avatar" aria-label="${label("Изменить портрет")}"><img data-ps-avatar alt="" width="36" height="36"></button>
  </header>
  <main class="kg-ps-scroll">
    <section class="kg-ps-hero">
      <div class="kg-ps-cover"><img alt="" data-ps-cover>
        <button type="button" class="kg-ps-control kg-ps-change" data-ps-photo-action="banner">${icon("image")}${label("Сменить фон")}</button>
      </div>
      <div class="kg-ps-identity">
        <div class="kg-ps-portrait">
          <img data-ps-avatar alt="" width="72" height="72">
          <button type="button" class="kg-ps-round kg-ps-control" data-ps-photo-action="avatar" aria-label="${label("Изменить портрет")}">${icon("photo_camera")}</button>
        </div>
        <div class="kg-ps-person"><h2 data-ps-name></h2><p data-ps-handle></p></div>
        <span class="kg-ps-chip kg-ps-plan" ${subscriptionVisible ? "" : "hidden"}><i></i>Black Pro</span>
      </div>
      ${["banner","avatar"].map(key=>`<input type="file" data-ps-photo="${key}" accept="image/png,image/jpeg,image/webp,image/avif,image/gif" hidden>`).join("")}
      <button type="button" class="kg-ps-status kg-ps-control" data-ps-edit-status aria-label="${label("Изменить статус")}">
        <i></i><span data-ps-status></span>${icon("edit")}
      </button>
      <p class="kg-ps-message kg-ps-cover-message" data-ps-photo-message role="status" hidden></p>
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
      ${group(subscriptionVisible ? "Подписка и аккаунт" : "Аккаунт",["subscription","nickname","public","security"])}
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
  const photoPickers = hub.querySelectorAll("[data-ps-photo]");
  const photoFeedback = hub.querySelector("[data-ps-photo-message]");
  let session, currentProfile;

  function renderSpoilers() {
    const hidden = window.KGCinemaDiarySpoilers.get();
    spoilers.setAttribute("aria-pressed", String(hidden));
    spoilers.querySelector("[data-ps-spoiler-icon]").innerHTML = icon(hidden ? "visibility_off" : "visibility");
    spoilers.querySelector("[data-ps-spoiler-badge]").textContent = uiText(hidden ? "Активно" : "Выключено");
    spoilers.querySelector("[data-ps-spoiler-value]").textContent = uiText(hidden ? "Скрыты" : "Показаны");
    spoilers.querySelector("[data-ps-spoiler-description]").textContent = uiText(hidden ? "Безопасный режим" : "Показывать спойлеры");
  }

  function render(profile) {
    currentProfile = profile;
    for (const photo of hub.querySelectorAll("[data-ps-avatar]")) photo.src = profile.avatar;
    hub.querySelector("[data-ps-cover]").src = profile.banner || defaultBanner;
    hub.querySelector("[data-ps-name]").textContent = profile.name;
    hub.querySelector("[data-ps-handle]").textContent = profile.handle || "";
    hub.querySelector("[data-ps-status]").textContent = profile.status || uiText("Добавить статус");
    const nickname = hub.querySelector('[data-ps-route="nickname"] small');
    nickname.textContent = profile.handle || uiText("Подпись к рецензиям");
    const publicPage = hub.querySelector('[data-ps-route="public"] small');
    publicPage.textContent = uiText(profile.privatePage ? "Приватная" : "Открытая");
    renderSpoilers();
  }

  function openSubpage(route,title,content="") {
    const page = document.createElement("dialog");
    page.className = "kg-ps-dialog";
    page.dataset.profileSettingsPage = route;
    page.setAttribute("aria-labelledby","kg-ps-page-title");
    page.innerHTML = `<header class="kg-ps-header">
      <button type="button" class="kg-ps-round kg-ps-control" autofocus aria-label="${label("Назад")}">${icon("arrow_back")}</button>
      <h1 id="kg-ps-page-title">${label(title)}</h1>
    </header>${content ? `<main class="kg-ps-scroll kg-ps-subpage">${content}</main>` : ""}`;
    page.querySelector("header button").addEventListener("click",()=>page.close());
    page.addEventListener("close",()=>page.remove(),{once:true});
    document.body.append(page);
    page.showModal();
    return page;
  }

  function message(element,text="") {
    element.textContent = text ? uiText(text) : "";
    element.hidden = !text;
  }

  function editField(field) {
    const nickname = field === "handle";
    const title = nickname ? "Никнейм" : "Статус";
    const input = nickname
      ? '<input id="kg-ps-field" type="text" name="value" maxlength="25" autocomplete="off" spellcheck="false" autocapitalize="off">'
      : '<textarea id="kg-ps-field" name="value" rows="3" maxlength="140"></textarea>';
    const page = openSubpage(field,title,`<form class="kg-ps-form">
      <label for="kg-ps-field">${label(title)}</label>${input}
      <p>${label(nickname ? "Никнейм будет виден рядом с рецензией." : "Статус отображается рядом с именем.")}</p>
      <p class="kg-ps-message" role="status" hidden></p>
      <button class="kg-ps-control kg-ps-save" type="submit">${label("Сохранить")}</button>
    </form>`);
    const form = page.querySelector("form");
    const value = form.elements.value;
    const feedback = form.querySelector("[role=status]");
    const save = form.querySelector("[type=submit]");
    const update = session.update;
    value.value = currentProfile[field] || "";
    value.focus();
    form.addEventListener("submit",async event=>{
      event.preventDefault();
      const text = value.value.trim();
      const plain = nickname ? text.replace(/^@/,"") : text;
      if (nickname && text && !/^[\p{L}\p{N}_.-]{1,24}$/u.test(plain)) {
        message(feedback,"До 24 символов: буквы, цифры, точка, дефис или подчёркивание.");
        return;
      }
      save.disabled = value.disabled = true;
      message(feedback);
      try {
        render(await update({[field]:nickname && plain ? "@"+plain : plain}));
        page.close();
      } catch {
        message(feedback,"Изменения не сохранены");
        save.disabled = value.disabled = false;
      }
    });
  }

  function openPublicPage() {
    const page = openSubpage("public",entries.public[1],`
      <button class="kg-ps-control kg-ps-privacy" type="button" data-ps-privacy aria-pressed="true">
        ${icon("lock")}<span>${label("Приватная страница")}</span><b></b>
      </button>
      <p class="kg-ps-preview-note">${label("Предпросмотр на этом устройстве")}</p>
      <p class="kg-ps-private-message" data-ps-private-message>${label("Профиль скрыт")}</p>
      <section class="kg-ps-hero kg-ps-public-preview" data-ps-public-preview hidden>
        <div class="kg-ps-cover"><img alt="" data-public-cover></div>
        <div class="kg-ps-identity"><div class="kg-ps-portrait"><img alt="" data-public-avatar></div>
          <div class="kg-ps-person"><h2 data-public-name></h2><p data-public-handle></p></div></div>
        <p class="kg-ps-public-status" data-public-status></p>
      </section>
      <p class="kg-ps-message" role="status" hidden></p>`);
    const toggle = page.querySelector("[data-ps-privacy]");
    const preview = page.querySelector("[data-ps-public-preview]");
    const locked = page.querySelector("[data-ps-private-message]");
    const feedback = page.querySelector("[role=status]");
    const update = session.update;
    function paint() {
      const privatePage = currentProfile.privatePage;
      toggle.setAttribute("aria-pressed",String(privatePage));
      toggle.querySelector("b").textContent = uiText(privatePage ? "Включена" : "Выключена");
      preview.hidden = privatePage;
      locked.hidden = !privatePage;
      for (const key of ["cover","avatar","name","handle","status"]) {
        const element = preview.querySelector(`[data-public-${key}]`);
        const data = privatePage ? "" : key === "cover" ? currentProfile.banner || defaultBanner : currentProfile[key] || "";
        if (element.tagName === "IMG") {
          if (data) element.src = data;
          else element.removeAttribute("src");
        } else element.textContent = data;
      }
    }
    paint();
    toggle.addEventListener("click",async ()=>{
      toggle.disabled = true;
      message(feedback);
      try {
        render(await update({privatePage:!currentProfile.privatePage}));
        paint();
      } catch {message(feedback,"Изменения не сохранены");}
      finally {toggle.disabled = false;}
    });
  }

  for (const picker of photoPickers) {
    const field = picker.dataset.psPhoto;
    const buttons = hub.querySelectorAll(`[data-ps-photo-action="${field}"]`);
    picker.addEventListener("change",async ()=>{
      const [file] = picker.files;
      picker.value = "";
      if (!file || !session) return;
      if (!/^image\/(png|jpeg|webp|avif|gif)$/.test(file.type) || file.size > 8 * 1024 * 1024) {
        message(photoFeedback,"Выберите PNG, JPG, WebP, AVIF или GIF до 8 МБ.");
        return;
      }
      const update = session.update;
      buttons.forEach(button=>button.disabled=true);
      message(photoFeedback);
      try {
        const photo = await new Promise((resolve,reject)=>{
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        });
        render(await update({[field]:photo}));
      } catch {message(photoFeedback,"Не удалось загрузить изображение");}
      finally {buttons.forEach(button=>button.disabled=false);}
    });
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
    if (button.hasAttribute("data-ps-edit-status")) {editField("status");return;}
    const {psPhotoAction,psRoute} = button.dataset;
    if (psPhotoAction) {
      hub.querySelector(`[data-ps-photo="${psPhotoAction}"]`).click();
      return;
    }
    switch (psRoute) {
      case "diary": session.diary(() => hub.close()); break;
      case "services": window.KGOpenSettings("watch-region"); break;
      case "language": window.KGOpenSettings("language-and-regional-standards"); break;
      case "notifications": window.KGReleaseFollow.openCalendar(); break;
      case "appearance": window.KGOpenSettings("theme-and-visual-style"); break;
      case "nickname": editField("handle"); break;
      case "public": openPublicPage(); break;
      case "security":
      case "export": openSubpage(psRoute,entries[psRoute][1]); break;
      case "subscription": if (subscriptionVisible) openSubpage(psRoute,entries[psRoute][1]); break;
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
