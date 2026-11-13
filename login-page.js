/* KinoGlobus sign-in screen based on the supplied Stitch design. */
(() => {
  const styles = document.createElement("style");
  styles.textContent = `
    #kg-login {
      position:fixed; inset:0; margin:0 auto; width:min(100%,520px);
      height:100dvh; max-height:100dvh; padding:0; border:0;
      background:rgb(var(--kg-surface)); color:rgb(var(--kg-on-surface));
    }
    #kg-login::backdrop {background:rgb(var(--kg-canvas-obsidian) / .9);backdrop-filter:blur(8px)}
    .kg-login-shell {height:100%;display:flex;flex-direction:column}
    .kg-login-header {
      display:flex;align-items:center;justify-content:space-between;gap:8px;
      padding:calc(9px + env(safe-area-inset-top,0px)) 5% 9px;
    }
    .kg-login-brand {
      display:flex;align-items:center;gap:6px;padding:7px 10px;border-radius:99px;
      background:rgb(var(--kg-surface-container));color:rgb(var(--kg-primary));
      font:700 clamp(14px,4vw,23px)/1.2 'Noto Serif',serif;
    }
    .kg-login-scroll {flex:1;min-height:0;overflow:auto;padding:8px 5% calc(24px + env(safe-area-inset-bottom,0px))}
    .kg-login-intro {
      padding:clamp(16px,5vw,26px);border-radius:18px;
      background:radial-gradient(ellipse at top right,#ffb83016,transparent 65%),
        radial-gradient(ellipse at bottom left,#861a4529,transparent 62%),rgb(var(--kg-surface-container-low));
    }
    .kg-login-pill {
      display:inline-flex;align-items:center;gap:6px;padding:5px 9px;border-radius:99px;
      background:rgb(var(--kg-surface-container-high));font-size:12px;font-weight:700;
    }
    .kg-login-intro h1 {font:700 clamp(27px,7vw,43px)/1.17 'Noto Serif',serif;margin:15px 0 10px}
    .kg-login-intro p {font:400 clamp(14px,3.8vw,17px)/1.6 'Noto Serif',serif;color:rgb(var(--kg-on-surface-variant))}
    .kg-login-providers {display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:24px 0 14px}
    .kg-login-providers button {display:grid;justify-items:center;gap:5px;padding:11px 3px;border-radius:13px;background:rgb(var(--kg-surface-container));font-size:12px;font-weight:700}
    .kg-login-divider {display:flex;align-items:center;gap:10px;color:rgb(var(--kg-text-muted));font-size:11px;font-weight:700;text-transform:uppercase;text-align:center}
    .kg-login-divider::before,.kg-login-divider::after {content:"";height:1px;flex:1;background:rgb(var(--kg-surface-border))}
    .kg-login-form {display:grid;gap:16px;margin-top:21px}
    .kg-login-field {position:relative;display:flex;align-items:center;gap:8px;padding:0 12px;border-radius:13px;background:rgb(var(--kg-surface-container-low))}
    #kg-login .kg-login-field input {width:100%;min-width:0;padding:13px 0;background:transparent;border:0;box-shadow:none;color:inherit;font:inherit}
    #kg-login .kg-login-field input::placeholder {color:rgb(var(--kg-text-muted))}
    .kg-login-primary,.kg-login-biometrics {width:100%;display:flex;align-items:center;justify-content:center;gap:8px;min-height:49px;padding:8px 12px;border-radius:99px;font-weight:700}
    .kg-login-primary {background:linear-gradient(110deg,#ffbd40,#ffb32b);color:#281900;font-family:'Noto Serif',serif}
    .kg-login-biometrics {background:rgb(var(--kg-surface-container));color:rgb(var(--kg-on-surface))}
    #kg-login button:focus-visible,#kg-login input:focus-visible {outline:2px solid rgb(var(--kg-primary));outline-offset:2px}
  `;
  document.head.appendChild(styles);

  const dialog = document.createElement("dialog");
  dialog.id = "kg-login";
  dialog.setAttribute("aria-labelledby", "kg-login-title");
  const icon = name => `<span class="material-symbols-outlined text-[20px]" aria-hidden="true">${name}</span>`;
  dialog.innerHTML = `
    <div class="kg-login-shell">
      <header class="kg-login-header">
        <button type="button" data-kg-login-back aria-label="Назад" autofocus class="flex w-9 h-9 shrink-0 items-center justify-center">${icon("arrow_back_ios_new")}</button>
        <span class="kg-login-brand">${icon("theater_comedy")}KINOGLOBUS</span>
        <button type="button" data-kg-login-register class="text-secondary font-semibold text-xs sm:text-sm">Регистрация</button>
      </header>
      <div class="kg-login-scroll">
        <section class="kg-login-intro">
          <span class="kg-login-pill text-primary">${icon("stars")}<span>Клуб ценителей кино</span></span>
          <h1 id="kg-login-title">С возвращением в синематеку</h1>
          <p>Исследуйте мировой кинематограф, отмечайте страны на 3D-глобусе и пополняйте личный кинодневник.</p>
          <div class="flex flex-wrap gap-2 mt-4">
            <span class="kg-login-pill">${icon("public")}<span data-kg-login-countries></span></span>
            <span class="kg-login-pill">${icon("theaters")}<span data-kg-login-films></span></span>
          </div>
        </section>
        <div class="kg-login-providers">
          <button type="button" data-kg-login-soon="Apple">${icon("smartphone")}Apple</button>
          <button type="button" data-kg-login-soon="Google" class="text-primary">${icon("hub")}Google</button>
          <button type="button" data-kg-login-soon="Telegram" class="text-secondary">${icon("send")}Telegram</button>
        </div>
        <div class="kg-login-divider">Или войдите с электронной почтой</div>
        <form class="kg-login-form" novalidate autocomplete="off">
          <div class="grid gap-1.5">
            <label for="kg-login-id" class="font-label-sm text-label-sm text-primary">Электронная почта или псевдоним</label>
            <div class="kg-login-field">${icon("alternate_email")}<input id="kg-login-id" type="text" autocapitalize="none" spellcheck="false" placeholder="name@example.com" required></div>
          </div>
          <div class="grid gap-1.5">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <label for="kg-login-password" class="font-label-sm text-label-sm text-primary">Пароль</label>
              <button type="button" data-kg-login-recovery class="text-xs font-semibold text-secondary">Забыли пароль?</button>
            </div>
            <div class="kg-login-field">${icon("lock")}<input id="kg-login-password" type="password" placeholder="Введите пароль" required>
              <button type="button" data-kg-login-eye aria-label="Показать пароль" class="w-9 h-9 grid place-items-center shrink-0">${icon("visibility")}</button>
            </div>
          </div>
          <div class="flex flex-wrap justify-between items-center gap-2">
            <label class="flex items-center gap-2 text-sm text-text-muted"><input type="checkbox" class="rounded accent-primary-container" disabled><span>Запомнить меня</span><small>Скоро</small></label>
            <button type="button" data-kg-login-soon="Touch ID" class="kg-login-pill">${icon("fingerprint")}Touch ID</button>
          </div>
          <button type="submit" class="kg-login-primary"><span>Войти в синематеку</span>${icon("arrow_forward")}</button>
          <button type="button" data-kg-login-soon="Face ID" class="kg-login-biometrics">${icon("face")}<span>Быстрый вход через Face ID</span></button>
        </form>
        <p data-kg-login-message role="status" class="mt-3 text-sm text-secondary empty:hidden"></p>
        <p class="mt-4 text-center text-xs text-text-muted">Вход и синхронизация скоро будут доступны.</p>
        <div class="mt-3 text-sm text-center"><span>Ещё нет аккаунта?</span> <button type="button" data-kg-login-register class="font-semibold text-primary underline underline-offset-4">Зарегистрироваться</button></div>
      </div>
    </div>`;
  localizeInterfaceMarkup(dialog);
  document.body.appendChild(dialog);

  const form = dialog.querySelector("form");
  const identifier = dialog.querySelector("#kg-login-id");
  const password = dialog.querySelector("#kg-login-password");
  const eye = dialog.querySelector("[data-kg-login-eye]");
  const message = dialog.querySelector("[data-kg-login-message]");
  const setPasswordVisible = visible => {
    password.type = visible ? "text" : "password";
    eye.innerHTML = icon(visible ? "visibility_off" : "visibility");
    eye.setAttribute("aria-label", uiText(visible ? "Скрыть пароль" : "Показать пароль"));
  };

  dialog.addEventListener("click", event => {
    if (event.target === dialog || event.target.closest("[data-kg-login-back]")) dialog.close();
    if (event.target.closest("[data-kg-login-register]")) {
      dialog.close();
      window.KGOpenAccountPage("register");
    }
    if (event.target.closest("[data-kg-login-recovery]")) {
      const address = identifier.value;
      dialog.close();
      window.KGOpenPasswordRecovery(address);
      return;
    }
    const feature = event.target.closest("[data-kg-login-soon]")?.dataset.kgLoginSoon;
    if (feature) {
      message.textContent = uiText("Вход через {provider} станет доступен после подключения авторизации.", {provider:feature});
      message.scrollIntoView({block:"nearest"});
    }
  });

  eye.addEventListener("click", () => setPasswordVisible(password.type === "password"));
  form.addEventListener("submit", event => {
    event.preventDefault();
    const invalid = [identifier, password].find(input => !input.value.trim());
    message.textContent = uiText(invalid ? "Проверьте заполнение обязательных полей." : "Форма заполнена. Отправка пока отключена: сервер учётных записей не подключён, пароль не сохранён.");
    if (invalid) invalid.focus();
    else {
      password.value = "";
      setPasswordVisible(false);
      message.scrollIntoView({block:"nearest"});
    }
  });
  dialog.addEventListener("close", () => {
    form.reset();
    setPasswordVisible(false);
    message.textContent = "";
  });

  window.KGOpenLoginPage = () => {
    const format = new Intl.NumberFormat(interfaceLanguage);
    const countries = Object.keys(window.KGWatchedCountryCounts()).length;
    dialog.querySelector("[data-kg-login-countries]").textContent = uiText("Страны: {count}", {count:format.format(countries)});
    dialog.querySelector("[data-kg-login-films]").textContent = uiText("Фильмы: {count}", {count:format.format(watched.length)});
    if (!dialog.open) dialog.showModal();
    dialog.querySelector(".kg-login-scroll").scrollTop = 0;
  };
})();
