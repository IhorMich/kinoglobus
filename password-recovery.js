/* KinoGlobus email recovery screen based on the supplied Stitch design. */
(() => {
  const styles = document.createElement("style");
  styles.textContent = `
    #kg-recovery {
      position:fixed;inset:0;margin:0 auto;width:min(100%,520px);max-width:none;
      height:100dvh;max-height:100dvh;padding:0;border:0;overflow:hidden;
      background:#151219;color:#e8e0ea;font:14px/1.45 'Noto Serif',serif;
      color-scheme:dark;
    }
    #kg-recovery::backdrop {background:#100d14e6;backdrop-filter:blur(8px)}
    .kg-recovery-shell {display:flex;flex-direction:column;height:100%}
    .kg-recovery-header {
      display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:8px;
      min-height:calc(64px + env(safe-area-inset-top,0px));
      padding:env(safe-area-inset-top,0px) clamp(12px,4.8vw,20px) 0;
      background:#151219;box-shadow:0 1px 8px #0002;z-index:1;
    }
    .kg-recovery-header button {min-height:44px}
    .kg-recovery-back {width:36px;display:grid;place-items:center;justify-self:start}
    .kg-recovery-brand,.kg-recovery-badge {display:inline-flex;align-items:center;gap:5px;border-radius:999px;color:#ffdca8}
    .kg-recovery-brand {padding:6px 10px;background:#2c2830b3;font-size:clamp(12px,3.5vw,18px);font-weight:600;letter-spacing:.03em}
    .kg-recovery-header-right {display:flex;justify-content:flex-end;align-items:center;gap:6px}
    .kg-recovery-header-right button {font-size:12px;color:#ffb1c5}
    .kg-recovery-avatar {width:32px;height:32px;display:grid;place-items:center;flex:none;border-radius:50%;background:#ffdca8;color:#432c00}
    .kg-recovery-scroll {
      flex:1;min-height:0;overflow:auto;overscroll-behavior:contain;
      padding:12px clamp(12px,4.8vw,20px) calc(20px + env(safe-area-inset-bottom,0px));
      background:radial-gradient(ellipse 165px 85px at 50% 0,#ffb8301e,transparent),
        radial-gradient(ellipse 120px 140px at 100% 155px,#861a4529,transparent);
    }
    .kg-recovery-intro {text-align:center}
    .kg-recovery-badge {
      background:#2c2830cc;padding:6px 12px;box-shadow:0 4px 20px -2px #ffb8302e;
      font-size:10px;font-weight:700;letter-spacing:.12em;
    }
    .kg-recovery-intro h1 {margin:12px 0 4px;font-size:clamp(21px,6.6vw,28px);line-height:1.22;font-weight:600;letter-spacing:-.01em}
    .kg-recovery-intro p {margin:auto;max-width:360px;color:#d5c4ad;line-height:1.6}
    .kg-recovery-atlas {
      display:flex;align-items:end;justify-content:space-between;gap:8px;
      min-height:112px;margin:12px 0 20px;padding:12px;border-radius:12px;
      background:linear-gradient(0deg,#1d1a21,#1d1a21a1 48%,transparent),
        linear-gradient(90deg,#100d14cc,transparent,#100d14cc),url('https://lh3.googleusercontent.com/aida-public/AB6AXuCDXEm1gmfdzdgAZucKCEpHCRDyayusIFBEYIKPawHrzghT_OghVz2zx4A76pRBnJoZ33Ja97MmDVj6sORveFZwtabFhG-uO0WAHAcP6Si1HPWTJ8OO41uLhVv23AhL84Nxc5jFA2v0ykurU7-egdcF6JLTfqNE6O6iWdaZjSzTeTp2DnBSc4SUUaJNVo3WiCZ3aDctR9qXbPd9hOKiN8l0HIE1huXRNW3KZShyzMyQ') center/cover #1d1a21;
      box-shadow:0 16px 36px -10px #861a454d;
    }
    .kg-recovery-atlas-info {display:flex;align-items:center;gap:8px}
    .kg-recovery-tile {display:grid;place-items:center;width:34px;height:34px;flex:none;border-radius:8px;background:#37333bcc;color:#ffdca8}
    .kg-recovery-atlas strong {font-size:12px}
    .kg-recovery-atlas-counts {margin-top:2px;color:#d5c4ad;font-size:11px}
    .kg-recovery-atlas-note {align-self:end;padding:4px 8px;border-radius:4px;background:#861a45cc;color:#ffd9e1;font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;text-align:center}
    .kg-recovery-method {padding:4px;border-radius:12px;background:#100d14}
    .kg-recovery-method p {display:flex;align-items:center;justify-content:center;gap:5px;min-height:38px;border-radius:8px;background:#2c2830;color:#ffdca8;font-size:12px;font-weight:600}
    .kg-recovery-form {display:grid;gap:12px;margin-top:20px}
    .kg-recovery-field label {display:flex;align-items:center;justify-content:space-between;gap:8px;margin:0 4px 6px;color:#d5c4ad;font-size:10px;font-weight:700;letter-spacing:.08em}
    .kg-recovery-field label small {color:#ffdca8;font-size:11px;font-weight:400;letter-spacing:0}
    .kg-recovery-input {display:flex;align-items:center;gap:10px;min-height:48px;padding:0 14px;background:#2c2830;border-radius:12px;color:#d5c4ad}
    #kg-recovery .kg-recovery-input input {min-width:0;flex:1;padding:12px 0;border:0;background:transparent;color:#e8e0ea;font:inherit;font-size:16px;box-shadow:none;outline:none}
    #kg-recovery .kg-recovery-input input::placeholder {color:#aa9a88}
    .kg-recovery-input:focus-within {outline:2px solid #ffdca8;outline-offset:2px}
    .kg-recovery-valid {color:#ffb830;font-variation-settings:'FILL' 1}
    .kg-recovery-valid[hidden] {display:none}
    .kg-recovery-advice {display:flex;align-items:flex-start;gap:8px;padding:12px;border-radius:12px;background:#221e26}
    .kg-recovery-advice .kg-recovery-tile {width:32px;height:32px}
    .kg-recovery-advice strong {font-size:12px}
    .kg-recovery-advice p {margin-top:2px;color:#d5c4ad;font-size:12px}
    .kg-recovery-submit {
      display:flex;align-items:center;justify-content:center;gap:6px;min-height:50px;margin-top:4px;padding:8px 12px;border-radius:999px;
      background:linear-gradient(90deg,#ffb830,#ffdca8,#ffb830);color:#432c00;
      font-weight:700;letter-spacing:.04em;box-shadow:0 12px 36px -6px #ffb83052;
    }
    .kg-recovery-submit:active {transform:scale(.98)}
    .kg-recovery-message {color:#ffb4ab;font-size:13px;text-align:center}
    .kg-recovery-message:empty {display:none}
    .kg-recovery-quote {display:grid;justify-items:center;gap:4px;margin-top:28px;padding:12px;border-radius:12px;background:#1d1a21;text-align:center}
    .kg-recovery-quote > .material-symbols-outlined {color:#ffdca859}
    .kg-recovery-quote blockquote {max-width:300px;font-size:18px;font-style:italic;line-height:1.33}
    .kg-recovery-quote p {margin-top:4px;color:#b7a894;font-size:10px;letter-spacing:.08em;text-transform:uppercase}
    .kg-recovery-footer {margin-top:20px;text-align:center;color:#d5c4ad}
    .kg-recovery-footer button {color:#ffdca8;font-weight:600;text-decoration:underline;text-underline-offset:3px}
    .kg-recovery-footer-note {display:flex;justify-content:center;align-items:center;gap:5px;margin-top:10px;color:#b7a894;font-size:12px}
    #kg-recovery button:focus-visible {outline:2px solid #ffdca8;outline-offset:2px}
    @media(max-width:360px) {.kg-recovery-avatar {width:24px;height:24px}.kg-recovery-header {gap:4px}}
  `;
  document.head.appendChild(styles);

  const icon = (name, size = 20) => `<span class="material-symbols-outlined" aria-hidden="true" style="font-size:${size}px">${name}</span>`;
  const dialog = document.createElement("dialog");
  dialog.id = "kg-recovery";
  dialog.setAttribute("aria-labelledby", "kg-recovery-title");
  dialog.innerHTML = `
    <div class="kg-recovery-shell">
      <header class="kg-recovery-header">
        <button class="kg-recovery-back" type="button" data-kg-recovery-login aria-label="Назад" autofocus>${icon("arrow_back_ios_new", 22)}</button>
        <span class="kg-recovery-brand">${icon("theater_comedy", 18)}KINOGLOBUS</span>
        <div class="kg-recovery-header-right">
          <button type="button" data-kg-recovery-register>Регистрация</button>
          <span class="kg-recovery-avatar">${icon("person", 18)}</span>
        </div>
      </header>
      <div class="kg-recovery-scroll">
        <div class="kg-recovery-intro">
          <span class="kg-recovery-badge">${icon("vpn_key", 16)}<span>КЛЮЧ ДОСТУПА В СИНЕМАТЕКУ</span></span>
          <h1 id="kg-recovery-title">Восстановление доступа</h1>
          <p>Укажите электронную почту, привязанную к вашему киноатласу и дневнику просмотров.</p>
        </div>
        <div class="kg-recovery-atlas">
          <div class="kg-recovery-atlas-info">
            <span class="kg-recovery-tile">${icon("public")}</span>
            <div>
              <strong>Личный 3D-киноатлас</strong>
              <p class="kg-recovery-atlas-counts" data-kg-recovery-counts></p>
            </div>
          </div>
          <span class="kg-recovery-atlas-note">Скоро</span>
        </div>
        <div class="kg-recovery-method"><p>${icon("mail", 18)}<span>По почте (Email)</span></p></div>
        <form class="kg-recovery-form" novalidate>
          <div class="kg-recovery-field">
            <label for="kg-recovery-email"><span>ЭЛЕКТРОННАЯ ПОЧТА</span><small>Киноман ID</small></label>
            <div class="kg-recovery-input">
              ${icon("alternate_email")}
              <input id="kg-recovery-email" name="email" type="email" autocomplete="email" autocapitalize="none" spellcheck="false" placeholder="tarkovsky@kinoglobus.app" required>
              <span class="kg-recovery-valid material-symbols-outlined" aria-hidden="true" hidden>verified</span>
            </div>
          </div>
          <div class="kg-recovery-advice">
            <span class="kg-recovery-tile">${icon("verified_user", 19)}</span>
            <div>
              <strong>Временный кино-пропуск</strong>
              <p>Отправка ссылки для сброса пароля станет доступна после подключения сервера аккаунтов.</p>
            </div>
          </div>
          <button type="submit" class="kg-recovery-submit"><span>ОТПРАВИТЬ ССЫЛКУ СБРОСА</span>${icon("arrow_forward")}</button>
          <p id="kg-recovery-message" class="kg-recovery-message" role="status"></p>
        </form>
        <div class="kg-recovery-quote">
          ${icon("format_quote", 32)}
          <blockquote>«В кинотеатре свет гаснет, чтобы открылась тайна.»</blockquote>
          <p>Палата редких плёнок</p>
        </div>
        <footer class="kg-recovery-footer">
          <span>Вспомнили пароль?</span>
          <button type="button" data-kg-recovery-login>Войти</button>
          <p class="kg-recovery-footer-note">${icon("lock", 14)}<span>Восстановление пароля скоро будет доступно.</span></p>
        </footer>
      </div>
    </div>`;
  localizeInterfaceMarkup(dialog);
  document.body.appendChild(dialog);

  const form = dialog.querySelector("form");
  const email = dialog.querySelector("#kg-recovery-email");
  const validationIcon = dialog.querySelector(".kg-recovery-valid");
  const message = dialog.querySelector("#kg-recovery-message");

  function updateEmailState() {
    validationIcon.hidden = !email.validity.valid;
    email.removeAttribute("aria-invalid");
    email.removeAttribute("aria-describedby");
    message.textContent = "";
  }

  function returnToLogin() {
    dialog.close();
    window.KGOpenLoginPage();
  }

  dialog.addEventListener("click", event => {
    if (event.target.closest("[data-kg-recovery-login]")) returnToLogin();
    if (event.target.closest("[data-kg-recovery-register]")) {
      dialog.close();
      window.KGOpenAccountPage("register");
    }
  });
  dialog.addEventListener("cancel", event => {
    event.preventDefault();
    returnToLogin();
  });

  email.addEventListener("input", updateEmailState);
  form.addEventListener("submit", event => {
    event.preventDefault();
    if (!email.validity.valid) {
      email.setAttribute("aria-invalid", "true");
      email.setAttribute("aria-describedby", message.id);
      message.textContent = uiText("Укажите действительный адрес электронной почты.");
      email.focus();
      return;
    }
    message.textContent = uiText("Отправка письма пока недоступна.");
  });
  dialog.addEventListener("close", () => {
    if (dialog.open) return;
    form.reset();
    updateEmailState();
  });

  window.KGOpenPasswordRecovery = (identifier = "") => {
    email.value = identifier.trim();
    if (!email.validity.valid) email.value = "";
    updateEmailState();
    const format = new Intl.NumberFormat(interfaceLanguage);
    const countries = Object.keys(window.KGWatchedCountryCounts()).length;
    dialog.querySelector("[data-kg-recovery-counts]").textContent = uiText("Страны: {countries} · Фильмы: {films}", {
      countries: format.format(countries),
      films: format.format(watched.length)
    });
    if (!dialog.open) dialog.showModal();
    dialog.querySelector(".kg-recovery-scroll").scrollTop = 0;
  };
})();
