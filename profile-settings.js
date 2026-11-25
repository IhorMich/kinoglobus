/* Settings reached from the personal cabinet. */
(() => {
  const subscriptionVisible = false;
  const defaultBanner = "assets/vibes/after-midnight.jpg";
  const label = source => uiText(source).replace(/[&<>"']/g, ch =>
    ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[ch]);
  const backupIcons = {
    backup: '<path d="M4 4h16v16H4z M8 4v6h8V4 M8 20v-6h8v6"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
    upload: '<path d="M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5"/>',
    menu_book: '<path d="M12 6v15M12 6C9 3 5 3 2 5v15c4-2 7-1 10 1 3-2 6-3 10-1V5c-3-2-7-2-10 1Z"/>',
    shield: '<path d="M12 2 21 6v6c0 5-4 8-9 10-5-2-9-5-9-10V6Z M8 12l3 3 5-6"/>'
  };

  const icon = name => backupIcons[name]
    ? `<svg class="kg-bk-svg" viewBox="0 0 24 24"
        fill="none" stroke="currentColor"
        stroke-width="1.7" stroke-linecap="round"
        stroke-linejoin="round" aria-hidden="true">
        ${backupIcons[name]}
      </svg>`
    : `<span class="material-symbols-outlined" aria-hidden="true">${name}</span>`;
  const entries = {
    diary:["movie_filter","Кинодневник и трекинг","Записи, оценки и даты просмотра"],
    services:["tv","Стриминговые сервисы","Регион для раздела «Где смотреть»"],
    language:["translate","Аудиодорожки и локализация","Язык, регион и субтитры трейлеров"],
    subscription:["stars","Подписка Moven Black Pro","Управление подпиской"],
    nickname:["person","Никнейм","Подпись к рецензиям"],
    edit:["edit","Редактировать профиль","Имя, никнейм и личные данные"],
    public:["public","Публичная страница","Предпросмотр и приватность"],
    security:["shield","Безопасность и вход","Электронная почта и пароль"],
    notifications:["calendar_month","Уведомления и радар премьер","Релизы и напоминания"],
    export:["backup","Резервные копии","Сохранение и восстановление данных"],
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

    <section class="kg-ps-group">
      <h2>${label("Спойлеры")}</h2>
      <div class="kg-ps-list">
        <button type="button" class="kg-ps-row kg-ps-spoiler-row"
          data-ps-spoilers role="switch" aria-checked="true">
          <span class="kg-ps-row-icon" data-ps-spoiler-icon></span>
          <span class="kg-ps-row-text">
            <strong>${label("Скрывать спойлеры")}</strong>
            <small>${label("Рецензии, заметки и описания эпизодов")}</small>
          </span>
          <span class="kg-ps-toggle" aria-hidden="true"></span>
        </button>
      </div>
    </section>


    <section class="kg-ps-group">
      <h2>${label("Просмотренные фильмы")}</h2>
      <div class="kg-ps-list">
        ${[
          ["recommendations","auto_awesome",
            "Скрывать в рекомендациях",
            "Выбор дня и похожие фильмы"],
          ["collections","collections_bookmark",
            "Скрывать в подборках",
            "Тематические коллекции и Вайб"],
          ["roulette","shuffle",
            "Скрывать в рулетке",
            "Случайный поиск фильмов"]
        ].map(([scope,symbol,title,description])=>`
          <button type="button"
            class="kg-ps-row kg-ps-spoiler-row"
            data-ps-viewing="${scope}"
            role="switch" aria-checked="false">
            <span class="kg-ps-row-icon">${icon(symbol)}</span>
            <span class="kg-ps-row-text">
              <strong>${label(title)}</strong>
              <small>${label(description)}</small>
            </span>
            <span class="kg-ps-toggle" aria-hidden="true"></span>
          </button>
        `).join("")}
      </div>
    </section>

    <div class="kg-ps-groups">
      ${group("Личные данные",["edit"])}
      ${group("Управление данными",["export"])}
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

  function renderViewingPreferences() {
    hub.querySelectorAll("[data-ps-viewing]").forEach(button=>{
      const enabled = window.KGViewingPreferences.get(
        button.dataset.psViewing
      );
      button.setAttribute("aria-checked", String(enabled));
    });
  }

  function renderSpoilers() {
    const hidden = window.KGCinemaDiarySpoilers.get();
    spoilers.setAttribute("aria-checked", String(hidden));
    spoilers.querySelector("[data-ps-spoiler-icon]").innerHTML =
      icon(hidden ? "visibility_off" : "visibility");
  }

  function render(profile) {
    currentProfile = profile;
    for (const photo of hub.querySelectorAll("[data-ps-avatar]")) photo.src = profile.avatar || "assets/interface/default-avatar.svg";
    hub.querySelector("[data-ps-cover]").src = profile.banner || defaultBanner;
    hub.querySelector("[data-ps-name]").textContent = profile.name;
    hub.querySelector("[data-ps-handle]").textContent = profile.handle || "";
    hub.querySelector("[data-ps-status]").textContent = profile.status || uiText("Добавить статус");
    const nickname = hub.querySelector('[data-ps-route="nickname"] small');
    if (nickname) nickname.textContent = profile.handle || uiText("Подпись к рецензиям");
    const publicPage = hub.querySelector('[data-ps-route="public"] small');
    if (publicPage) publicPage.textContent = uiText(profile.privatePage ? "Приватная" : "Открытая");
    renderSpoilers();
    renderViewingPreferences();
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

  function editField(field, {profile=currentProfile,update=session.update,onSaved=render}={}) {
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
    value.value = profile[field] || "";
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
        const saved = await update({[field]:nickname && plain ? "@"+plain : plain});
        onSaved?.(saved);
        page.close();
      } catch {
        message(feedback,"Изменения не сохранены");
        save.disabled = value.disabled = false;
      }
    });
    return page;
  }


  function confirmBackupRestore(downloadInfo) {
    return new Promise(resolve => {
      const modal = document.createElement("dialog");
      modal.className = "kg-bk-confirm";
      modal.setAttribute("aria-labelledby", "kg-bk-confirm-title");

      const size = downloadInfo.bytes >= 1024 * 1024
        ? (downloadInfo.bytes / (1024 * 1024)).toFixed(2) + " МБ"
        : (downloadInfo.bytes / 1024).toFixed(1) + " КБ";

      modal.innerHTML = `
        <div class="kg-bk-confirm-content">
          <div class="kg-bk-confirm-emblem">
            ${icon("shield")}
          </div>

          <h2 id="kg-bk-confirm-title">
            ${label("Восстановление данных")}
          </h2>

          <p class="kg-bk-confirm-description">
            ${label("Страховочная копия создана. Убедитесь, что файл сохранён на вашем устройстве.")}
          </p>

          <div class="kg-bk-confirm-file">
            ${icon("backup")}
            <div>
              <strong>${label("Страховочная копия")}</strong>
              <small>JSON · ${size}</small>
            </div>
          </div>

          <div class="kg-bk-confirm-warning">
            <span class="kg-bk-warning-symbol">!</span>
            <p>${label("Текущие данные будут заменены. После восстановления приложение перезапустится.")}</p>
          </div>

          <label class="kg-bk-confirm-check">
            <input type="checkbox" data-bk-saved>
            <span>${label("Я сохранил страховочную копию")}</span>
          </label>

          <div class="kg-bk-actions">
            <button type="button"
              class="kg-bk-button kg-bk-primary"
              data-bk-confirm disabled>
              ${label("Восстановить данные")}
            </button>

            <button type="button"
              class="kg-bk-button kg-ps-control"
              data-bk-decline>
              ${label("Отмена")}
            </button>
          </div>
        </div>
      `;

      const checkbox = modal.querySelector("[data-bk-saved]");
      const confirm = modal.querySelector("[data-bk-confirm]");
      const decline = modal.querySelector("[data-bk-decline]");

      let accepted = false;

      checkbox.addEventListener("change", () => {
        confirm.disabled = !checkbox.checked;
      });

      confirm.addEventListener("click", () => {
        if (!checkbox.checked) return;
        accepted = true;
        modal.close();
      });

      decline.addEventListener("click", () => {
        modal.close();
      });

      modal.addEventListener("close", () => {
        modal.remove();
        resolve(accepted);
      }, {once:true});

      document.body.append(modal);

      try {
        modal.showModal();
      } catch (error) {
        modal.remove();
        resolve(false);
        console.error("Backup confirmation failed:", error);
      }
    });
  }

  function openBackupPage() {
    const items = [
      ["person","Личный профиль"],
      ["favorite","Любимые фильмы и персоны"],
      ["bookmark","Закладки"],
      ["history","История просмотров"],
      ["tv","Просмотренные эпизоды"],
      ["star","Оценки и рецензии"],
      ["menu_book","Кинодневник"],
      ["settings","Настройки приложения"]
    ];

    const page = openSubpage(
      "export",
      "Резервные копии",
      `
      <section class="kg-bk-hero">
        <div class="kg-bk-emblem">
          ${icon("shield")}
        </div>
        <h2>${label("Ваши данные под контролем")}</h2>
        <p>${label("Сохраните свою киноисторию или перенесите её на другое устройство.")}</p>
      </section>

      <section class="kg-bk-section">
        <h2>${label("Что сохраняется")}</h2>

        <div class="kg-bk-list">
          ${items.map(([symbol,title])=>`
            <div class="kg-bk-row">
              ${icon(symbol)}
              <span>${label(title)}</span>
              ${icon("check")}
            </div>
          `).join("")}
        </div>
      </section>

      <div class="kg-bk-actions">
        <button type="button"
          class="kg-bk-button kg-bk-primary"
          data-bk-export>
          ${icon("download")}
          ${label("Создать резервную копию")}
        </button>

        <button type="button"
          class="kg-bk-button kg-ps-control"
          data-bk-import>
          ${icon("upload")}
          ${label("Восстановить из файла")}
        </button>
      </div>

      <section class="kg-bk-preview" data-bk-preview hidden>
        <div class="kg-bk-preview-card">
          <div class="kg-bk-preview-heading">
            ${icon("shield")}
            <div>
              <h2>${label("Резервная копия проверена")}</h2>
              <p>${label("Файл готов к восстановлению")}</p>
            </div>
          </div>

          <div class="kg-bk-preview-details">
            <div>
              <span>${label("Дата создания")}</span>
              <strong data-bk-date></strong>
            </div>
            <div>
              <span>${label("Версия формата")}</span>
              <strong data-bk-version></strong>
            </div>
            <div>
              <span>${label("Ключи данных")}</span>
              <strong data-bk-keys></strong>
            </div>
            <div>
              <span>${label("Личный профиль")}</span>
              <strong data-bk-profile></strong>
            </div>
          </div>
        </div>

        <section class="kg-bk-section">
          <h2>${label("Изменения в данных")}</h2>

          <div class="kg-bk-preview-card kg-bk-changes">
            <div class="kg-bk-change" data-kind="added">
              <span class="kg-bk-change-symbol">+</span>
              <span>${label("Будет добавлено")}</span>
              <strong data-bk-added></strong>
            </div>
            <div class="kg-bk-change" data-kind="replaced">
              <span class="kg-bk-change-symbol">↻</span>
              <span>${label("Будет заменено")}</span>
              <strong data-bk-replaced></strong>
            </div>
            <div class="kg-bk-change" data-kind="removed">
              <span class="kg-bk-change-symbol">−</span>
              <span>${label("Будет удалено")}</span>
              <strong data-bk-removed></strong>
            </div>
            <div class="kg-bk-change" data-kind="unchanged">
              <span class="kg-bk-change-symbol">✓</span>
              <span>${label("Без изменений")}</span>
              <strong data-bk-unchanged></strong>
            </div>
          </div>
        </section>

        <div class="kg-bk-warning">
          <span class="kg-bk-warning-symbol">!</span>
          <div>
            <strong>${label("Полное восстановление")}</strong>
            <p>${label("Текущие данные будут заменены содержимым файла. Перед восстановлением будет создана страховочная копия.")}</p>
            <p data-bk-profile-action></p>
          </div>
        </div>

        <div class="kg-bk-actions">
          <button type="button"
            class="kg-bk-button kg-bk-primary"
            data-bk-continue disabled>
            ${label("Продолжить восстановление")}
          </button>

          <button type="button"
            class="kg-bk-button kg-ps-control"
            data-bk-cancel>
            ${label("Отмена")}
          </button>
        </div>
      </section>

      <div class="kg-bk-privacy">
        ${icon("lock")}
        <p>${label("Ваши данные хранятся локально. Резервные копии не отправляются на сервер. API-ключи не включаются в файл.")}</p>
      </div>

      <p class="kg-bk-feedback"
        data-bk-feedback role="status" hidden></p>
      `
    );

    const importButton = page.querySelector("[data-bk-import]");

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json,application/json";
    fileInput.hidden = true;
    page.append(fileInput);

    const exportButton = page.querySelector("[data-bk-export]");
    const feedback = page.querySelector("[data-bk-feedback]");
    const previewPanel = page.querySelector("[data-bk-preview]");
    const cancelButton = page.querySelector("[data-bk-cancel]");
    const continueButton = page.querySelector("[data-bk-continue]");

    let pendingBackup = null;
    let pendingSafetyBackup = null;

    continueButton.addEventListener("click", async () => {
      if (!pendingBackup) return;

      continueButton.disabled = true;
      cancelButton.disabled = true;
      importButton.disabled = true;
      exportButton.disabled = true;
      feedback.hidden = true;
      pendingSafetyBackup = null;

      try {
        await window.KGWaitForProfileWrites();

        const result =
          await window.KGBackupStorage.createSafetyBackup();

        pendingSafetyBackup = result.backup;

        feedback.dataset.state = "success";
        feedback.textContent = uiText(
          "Страховочная копия создана. Сохраните скачанный файл."
        );

        console.log("Safety backup:", {
          keys: result.downloadInfo.keys,
          bytes: result.downloadInfo.bytes,
          hasProfile: result.downloadInfo.hasProfile
        });

        const confirmed = await confirmBackupRestore(
          result.downloadInfo
        );

        if (!confirmed) {
          pendingSafetyBackup = null;

          feedback.textContent = uiText(
            "Восстановление отменено. Данные не изменены."
          );

          return;
        }

        console.log("Restore confirmation: accepted");

        await window.KGWaitForProfileWrites();

        if (!page.isConnected || !page.open) {
          throw new Error("Страница восстановления закрыта");
        }

        const restored =
          await window.KGBackupStorage.restoreCombined(
            localStorage,
            window.KGProfileStorage,
            pendingBackup,
            pendingSafetyBackup
          );

        console.log("Backup restore result:", restored);

        pendingBackup = null;
        pendingSafetyBackup = null;

        feedback.dataset.state = "success";
        feedback.textContent = uiText(
          "Данные успешно восстановлены. Перезапуск приложения."
        );

        feedback.hidden = false;

        window.location.reload();

      } catch (error) {
        pendingSafetyBackup = null;

        feedback.dataset.state = "error";
        feedback.textContent = uiText(
          "Не удалось выполнить восстановление."
        );

        console.error("Restore preparation failed:", error);

      } finally {
        feedback.hidden = false;
        continueButton.disabled = !pendingBackup;
        cancelButton.disabled = false;
        importButton.disabled = false;
        exportButton.disabled = false;
      }
    });

    function hideBackupPreview() {
      previewPanel.hidden = true;
      pendingBackup = null;
      pendingSafetyBackup = null;
      continueButton.disabled = true;
    }

    function renderBackupPreview(summary, preview) {
      const set = (field, value) => {
        previewPanel.querySelector(
          "[data-bk-" + field + "]"
        ).textContent = String(value);
      };

      set("date", new Date(summary.createdAt).toLocaleDateString(
        document.documentElement.lang || "ru-RU"
      ));

      set("version", summary.version);
      set("keys", summary.keys);
      set("profile", uiText(
        summary.hasProfile ? "Включён" : "Отсутствует"
      ));

      set("added", preview.added.length);
      set("replaced", preview.replaced.length);
      set("removed", preview.removed.length);
      set("unchanged", preview.unchanged.length);

      const profileActions = {
        preserve: "Текущий личный профиль будет сохранён.",
        create: "Личный профиль будет создан из резервной копии.",
        replace: "Личный профиль будет восстановлен из файла."
      };

      set("profile-action", uiText(
        profileActions[preview.profileAction] || ""
      ));

      previewPanel.hidden = false;

      previewPanel.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }

    cancelButton.addEventListener("click", () => {
      hideBackupPreview();
      feedback.hidden = true;
      fileInput.value = "";
    });

    exportButton.addEventListener("click", async () => {
      exportButton.disabled = true;
      importButton.disabled = true;
      feedback.hidden = true;

      try {
        const result = await window.KGBackupStorage.download();

        const size = result.bytes >= 1024 * 1024
          ? (result.bytes / (1024 * 1024)).toFixed(2) + " МБ"
          : (result.bytes / 1024).toFixed(1) + " КБ";

        feedback.dataset.state = "success";
        feedback.textContent =
          uiText("Резервная копия создана. Скачивание запущено.") +
          " (" + size + ")";

      } catch (error) {
        feedback.dataset.state = "error";
        feedback.textContent =
          uiText("Не удалось создать резервную копию.");

        console.error("Backup export failed:", error);

      } finally {
        feedback.hidden = false;
        exportButton.disabled = false;
        importButton.disabled = false;
      }
    });

    importButton.addEventListener("click", () => {
      fileInput.value = "";
      fileInput.click();
    });

    fileInput.addEventListener("change", async () => {
      const file = fileInput.files?.[0];

      if (!file) return;

      hideBackupPreview();

      importButton.disabled = true;
      exportButton.disabled = true;
      feedback.hidden = true;

      try {
        const {backup, summary} =
          await window.KGBackupStorage.readFile(file);

        const preview =
          await window.KGBackupStorage.previewRestore(backup);

        feedback.dataset.state = "success";
        feedback.textContent =
          uiText("Резервная копия успешно проверена.") +
          " " + uiText("Записей:") +
          " " + summary.keys + ".";

        pendingBackup = backup;
        pendingSafetyBackup = null;

        renderBackupPreview(summary, preview);

        continueButton.disabled = false;

        console.log("Backup validation:", summary);
        console.log("Backup preview:", preview);

      } catch (error) {
        feedback.dataset.state = "error";
        feedback.textContent =
          uiText("Не удалось прочитать резервную копию.") +
          " " + (error.message || "");

        console.error("Backup import failed:", error);

      } finally {
        feedback.hidden = false;
        importButton.disabled = false;
        exportButton.disabled = false;
        fileInput.value = "";
      }
    });

    return page;
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
    if (button.hasAttribute("data-ps-viewing")) {
      const scope = button.dataset.psViewing;
      const preferences = window.KGViewingPreferences;

      try {
        preferences.set(scope, !preferences.get(scope));
        renderViewingPreferences();
      } catch (error) {
        console.error("[Moven] Viewing preferences:", error);
      }

      return;
    }
    if (button === spoilers) {
      window.KGCinemaDiarySpoilers.set(spoilers.getAttribute("aria-checked") !== "true");
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
      case "edit":
        window.KGOpenProfileEditor(currentProfile,{
          save: async changes => {
            const saved = await session.update(changes);
            render(saved);
            return saved;
          },
          logout: () => session.logout()
        });
        break;
      case "nickname": editField("handle"); break;
      case "public": openPublicPage(); break;
      case "security": openSubpage(psRoute,entries[psRoute][1]); break;
      case "export": openBackupPage(); break;
      case "subscription": if (subscriptionVisible) openSubpage(psRoute,entries[psRoute][1]); break;
    }
  });
  hub.addEventListener("close",()=>{ if (!hub.open) session = null; });
  window.KGOpenProfileNickname = (profile,update) => editField("handle",{profile,update,onSaved:null});
  window.KGOpenProfileSettings = (profile,actions) => {
    session = actions;
    render(profile);
    if (!hub.open) hub.showModal();
    scroll.scrollTop = 0;
  };
})();
