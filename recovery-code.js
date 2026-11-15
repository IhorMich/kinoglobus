/* Email verification and rejected-code preview based on the two Stitch screens. */
(() => {
  const styles = document.createElement("style");
  styles.textContent = `
    #kg-recovery-code {
      position:fixed;inset:0;margin:0 auto;width:min(100%,520px);max-width:none;
      height:100dvh;max-height:100dvh;overflow:hidden;padding:0;border:0;
      background:rgb(var(--kg-surface));color:rgb(var(--kg-on-surface));font:14px/1.45 'Noto Serif',serif;color-scheme:dark;
    }
    #kg-recovery-code::backdrop {background:rgb(var(--kg-surface-container-lowest)/0.90196);backdrop-filter:blur(8px)}
    #kg-recovery-code [hidden] {display:none}
    #kg-recovery-code .kg-recovery-header {grid-template-columns: minmax(36px,1fr) auto minmax(68px,1fr)}
    .kg-code-brand {letter-spacing:.14em;border-radius:5px}
    .kg-code-scroll {--accent:rgb(var(--kg-primary));--halo:rgb(var(--kg-primary-container)/0.15686)}
    .kg-code-scroll[data-rejected] {
      --accent:rgb(var(--kg-secondary));--halo:rgb(var(--kg-secondary-container)/0.32157);
      background:radial-gradient(ellipse 240px 100px at 50% 0,var(--halo),transparent);
    }
    .kg-code-intro {text-align:center;margin-bottom:20px}
    .kg-code-intro .kg-recovery-badge {color:var(--accent);box-shadow:0 5px 25px var(--halo)}
    [data-rejected] .kg-code-intro .kg-recovery-badge {background:rgb(var(--kg-violet-surface-04))}
    .kg-code-intro h1 {margin:18px 0 6px;font-size:clamp(25px,7.2vw,34px);font-weight:600;line-height:1.17;letter-spacing:-.025em}
    .kg-code-intro p {margin:auto;max-width:360px;color:rgb(var(--kg-on-surface-variant))}
    .kg-code-delivery {
      display:flex;align-items:center;gap:10px;min-width:0;
      padding:10px 12px;background:rgb(var(--kg-surface-container));border-radius:12px;
    }
    .kg-code-address {flex:1;min-width:0}
    .kg-code-address small {display:block;color:rgb(var(--kg-on-surface-variant));font-size:10px;letter-spacing:.08em;text-transform:uppercase;font-weight:700}
    .kg-code-address span {display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600}
    .kg-code-delivery button {display:flex;align-items:center;gap:4px;padding:8px 10px;border-radius:8px;background:rgb(var(--kg-surface-container-high));color:rgb(var(--kg-primary));font-weight:600}
    [data-rejected] .kg-code-delivery {width:fit-content;max-width:100%;margin:auto;border-radius:999px;padding:4px 10px;background:rgb(var(--kg-surface-container-high))}
    [data-rejected] .kg-code-delivery small,[data-rejected] .kg-code-delivery button .material-symbols-outlined {display:none}
    .kg-code-form {display:grid;gap:18px;margin-top:26px}
    .kg-code-entry {display:grid;gap:8px;text-align:center}
    .kg-code-digits {position:relative;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:clamp(8px,3.5vw,15px);cursor:text}
    .kg-code-digits input {position:absolute;inset:0;width:100%;height:100%;opacity:0}
    .kg-code-slot {
      position:relative;display:grid;place-items:center;aspect-ratio:4/5;
      border-radius:13px;background:rgb(var(--kg-surface-container-lowest));color:var(--accent);font-size:clamp(25px,8vw,34px);font-weight:700;
    }
    .kg-code-slot::before,.kg-code-slot::after {content:"";position:absolute;width:4px;height:4px;border-radius:50%;background:currentColor;opacity:.22;box-shadow:30px 0 currentColor;left:calc(50% - 17px)}
    .kg-code-slot::before {top:8px}
    .kg-code-slot::after {bottom:8px}
    .kg-code-slot[data-current] {background:rgb(var(--kg-surface-container-high));box-shadow:0 0 18px var(--halo)}
    .kg-code-slot[data-current]::before,.kg-code-slot[data-current]::after {color:rgb(var(--kg-primary-container));opacity:1}
    .kg-code-slot[data-current] span {width:9px;height:26px;border-radius:2px;background:rgb(var(--kg-primary-container))}
    .kg-code-digits:focus-within .kg-code-slot[data-current],
    .kg-code-digits:focus-within:not(:has([data-current])) .kg-code-slot:last-child {outline:2px solid rgb(var(--kg-primary));outline-offset:2px}
    [data-rejected] .kg-code-entry {justify-items:center}
    [data-rejected] .kg-code-digits {width:82%;gap:clamp(9px,3vw,14px)}
    [data-rejected] .kg-code-slot {aspect-ratio:7/8;border-top:2px solid rgb(var(--kg-secondary));background:rgb(var(--kg-surface-container-high));box-shadow:0 0 20px rgb(var(--kg-secondary)/0.13333)}
    [data-rejected] .kg-code-slot::before {display:none}
    [data-rejected] .kg-code-slot::after {left:calc(50% - 2px);opacity:1;box-shadow:none}
    .kg-code-status,.kg-code-resend,.kg-code-help {display:flex;align-items:center;justify-content:center;gap:7px}
    .kg-code-status {font-size:12px;color:rgb(var(--kg-on-surface-variant))}
    [data-rejected] .kg-code-status {padding:6px 10px;border-radius:5px;background:rgb(var(--kg-red-01));color:rgb(var(--kg-error));font-weight:700}
    .kg-code-resend {justify-content:space-between;padding:12px;border-radius:12px;background:rgb(var(--kg-neutral-60));color:rgb(var(--kg-on-surface-variant))}
    .kg-code-resend strong {color:rgb(var(--kg-primary))}
    .kg-code-pass {padding:14px;border-radius:12px;background:linear-gradient(105deg,rgb(var(--kg-surface-container-high)),rgb(var(--kg-neutral-91)));box-shadow:0 12px 25px rgb(var(--kg-black)/0.33333)}
    [data-rejected] .kg-code-pass {background:rgb(var(--kg-neutral-60))}
    .kg-code-pass-line {display:flex;align-items:center;justify-content:space-between;gap:8px}
    .kg-code-pass-title {display:flex;align-items:center;gap:8px;font-size:clamp(16px,5vw,21px)}
    .kg-code-pass-tag {padding:3px 8px;border-radius:5px;background:rgb(var(--kg-surface-container-lowest));color:var(--accent);font-size:10px;font-weight:700;text-transform:uppercase}
    [data-rejected] .kg-code-pass-tag {background:rgb(var(--kg-violet-surface-04))}
    .kg-code-pass p {margin-top:6px;color:rgb(var(--kg-on-surface-variant));font-size:12px}
    .kg-code-form .kg-recovery-submit {background:rgb(var(--kg-primary-container));text-transform:uppercase}
    .kg-code-form .kg-recovery-submit:disabled {cursor:default}
    .kg-code-keypad {display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;padding:9px;border-radius:16px;background:rgb(var(--kg-surface-container-lowest))}
    [data-rejected] .kg-code-keypad {background:transparent;padding:0;gap:10px}
    .kg-code-keypad button,.kg-code-keypad-decoration {
      display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:48px;
      border-radius:12px;background:rgb(var(--kg-surface-container));font-size:19px;font-weight:600;
    }
    [data-rejected] .kg-code-keypad button,[data-rejected] .kg-code-keypad-decoration {min-height:58px;background:rgb(var(--kg-neutral-60))}
    .kg-code-keypad button:active {background:rgb(var(--kg-surface-container-highest))}
    .kg-code-keypad-decoration {color:rgb(var(--kg-primary))}
    .kg-code-keypad small {font:700 10px/1.2 sans-serif;letter-spacing:.08em;color:rgb(var(--kg-warm-text-11))}
    [data-rejected] .kg-code-keypad [data-delete] {color:rgb(var(--kg-secondary))}
    .kg-code-footer {display:grid;justify-items:center;gap:8px;margin-top:20px;text-align:center;color:rgb(var(--kg-on-surface-variant));font-size:12px}
    .kg-code-footer button {min-height:36px;color:rgb(var(--kg-primary));font-weight:700}
    #kg-recovery-code button:focus-visible {outline:2px solid rgb(var(--kg-primary));outline-offset:2px}
  `;
  document.head.appendChild(styles);

  const icon = (name, size = 20) => `<span class="material-symbols-outlined" aria-hidden="true" style="font-size:${size}px">${name}</span>`;
  const keypadLetters = ["·", "ABC", "DEF", "GHI", "JKL", "MNO", "PQRS", "TUV", "WXYZ"];
  const digitButton = (digit, letters) => `<button type="button" data-digit="${digit}">${digit}<small aria-hidden="true" hidden>${letters}</small></button>`;
  const dialog = document.createElement("dialog");
  dialog.id = "kg-recovery-code";
  dialog.setAttribute("aria-labelledby", "kg-code-title");
  dialog.innerHTML = `
    <div class="kg-recovery-shell">
      <header class="kg-recovery-header">
        <button class="kg-recovery-back" type="button" aria-label="Назад" data-email autofocus>${icon("arrow_back_ios_new", 22)}</button>
        <span class="kg-recovery-brand kg-code-brand">${icon("local_movies", 18)}KINOGLOBUS</span>
        <div class="kg-recovery-header-right">
          <button type="button" aria-label="Помощь с кодом" data-help>${icon("verified_user")}</button>
          <span class="kg-recovery-avatar">${icon("person", 18)}</span>
        </div>
      </header>
      <div class="kg-recovery-scroll kg-code-scroll">
        <div class="kg-code-intro">
          <span class="kg-recovery-badge" data-normal>${icon("theater_comedy", 16)}<span>КИНО-ПРОПУСК ДОСТУПА</span></span>
          <span class="kg-recovery-badge" data-error hidden>${icon("lock_clock", 16)}<span>ОШИБКА АВТОРИЗАЦИИ СЕАНСА</span></span>
          <h1 id="kg-code-title"></h1>
          <p data-normal>Предпросмотр. Здесь вводится четырёхзначный код из письма.</p>
          <p data-error hidden>Пример ошибки проверки. Можно очистить поле и ввести код заново.</p>
        </div>
        <div class="kg-code-delivery">
          <span class="kg-recovery-tile">${icon("mail", 18)}</span>
          <div class="kg-code-address">
            <small>Канал доставки</small>
            <span data-address></span>
          </div>
          <button type="button" data-email><span>Сменить</span>${icon("edit", 15)}</button>
        </div>
        <form class="kg-code-form">
          <div class="kg-code-entry">
            <label class="kg-code-digits">
              <input type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="4" aria-label="Четырёхзначный код" aria-describedby="kg-code-status">
              ${Array.from({length:4}, () => '<span class="kg-code-slot" aria-hidden="true"><span></span></span>').join("")}
            </label>
            <p id="kg-code-status" class="kg-code-status" role="status"></p>
          </div>
          <div class="kg-code-resend" data-normal><span>Новый код по почте</span><strong>Скоро</strong></div>
          <div class="kg-code-pass">
            <div class="kg-code-pass-line">
              <div class="kg-code-pass-title">${icon("confirmation_number")}<strong data-normal>Screening Pass</strong><strong data-error hidden>Сеанс приостановлен</strong></div>
              <span class="kg-code-pass-tag">Предпросмотр</span>
            </div>
            <p data-normal>Зал «Тарковский VIP»</p>
            <p data-error hidden>Зал «Тарковский VIP» · Проверка кода</p>
          </div>
          <button type="submit" class="kg-recovery-submit"></button>
          <div class="kg-code-resend" data-error hidden><span>Новый код по почте</span><strong>Скоро</strong></div>
          <div class="kg-code-keypad" role="group" aria-label="Цифровая клавиатура">
            ${keypadLetters.map((letters, index) => digitButton(index + 1, letters)).join("")}
            <span class="kg-code-keypad-decoration" aria-hidden="true">${icon("fingerprint")}</span>
            ${digitButton(0, "+")}
            <button type="button" data-delete aria-label="Стереть цифру">${icon("backspace")}</button>
          </div>
        </form>
        <footer class="kg-code-footer">
          <p class="kg-code-help" tabindex="-1">${icon("support_agent", 16)}<span>Отправка и проверка кода скоро будут доступны.</span></p>
          <button type="button" data-email data-normal>Вернуться к выбору способа</button>
          <button type="button" data-login data-error hidden>Вернуться ко входу в личный кабинет</button>
        </footer>
      </div>
    </div>`;
  localizeInterfaceMarkup(dialog);
  document.body.appendChild(dialog);

  const scroll = dialog.querySelector(".kg-code-scroll");
  const form = dialog.querySelector("form");
  const input = form.querySelector("input");
  const slots = [...form.querySelectorAll(".kg-code-slot")];
  const submit = form.querySelector("[type=submit]");
  const status = form.querySelector("[role=status]");
  const address = dialog.querySelector("[data-address]");
  let rejected = false;

  function updateDigits() {
    const remaining = slots.length - input.value.length;
    slots.forEach((slot, index) => {
      slot.firstElementChild.textContent = input.value[index] ?? "";
      slot.toggleAttribute("data-current", !rejected && index === input.value.length);
    });
    status.textContent = rejected ? uiText("Код устарел или введён с опечаткой.")
      : remaining ? uiText("Осталось цифр: {count}", {count:remaining}) : uiText("Код введён");
    submit.disabled = !rejected && remaining > 0;
  }

  function setRejected(value) {
    rejected = value;
    scroll.toggleAttribute("data-rejected", value);
    dialog.querySelectorAll("[data-normal]").forEach(element => { element.hidden = value; });
    dialog.querySelectorAll("[data-error], .kg-code-keypad small").forEach(element => { element.hidden = !value; });
    dialog.querySelector("h1").textContent = uiText(value ? "Код недействителен" : "Введите кино-код");
    submit.innerHTML = value ? icon("refresh") : "";
    const label = document.createElement("span");
    label.textContent = uiText(value ? "Ввести код заново" : "Показать пример ошибки");
    submit.append(label);
    if (!value) submit.insertAdjacentHTML("beforeend", icon("arrow_forward"));
    input.readOnly = value;
    input.setAttribute("aria-invalid", String(value));
    updateDigits();
  }

  function returnToEmail() {
    const email = address.textContent;
    dialog.close();
    window.KGOpenPasswordRecovery(email);
  }

  function retryCode() {
    input.value = "";
    setRejected(false);
  }

  dialog.addEventListener("click", event => {
    if (event.target.closest("[data-email]")) returnToEmail();
    if (event.target.closest("[data-login]")) {
      dialog.close();
      window.KGOpenLoginPage();
    }
    if (event.target.closest("[data-help]")) dialog.querySelector(".kg-code-help").focus();
    const digit = event.target.closest("[data-digit]");
    const remove = event.target.closest("[data-delete]");
    if (!digit && !remove) return;
    if (rejected) retryCode();
    input.value = remove ? input.value.slice(0, -1) : (input.value + digit.dataset.digit).slice(0, slots.length);
    updateDigits();
  });
  dialog.addEventListener("cancel", event => {
    event.preventDefault();
    returnToEmail();
  });
  input.addEventListener("input", () => {
    input.value = input.value.replace(/[^0-9]/g, "").slice(0, slots.length);
    updateDigits();
  });
  form.addEventListener("submit", event => {
    event.preventDefault();
    if (!rejected && input.value.length !== slots.length) return;
    if (rejected) retryCode();
    else setRejected(true);
    scroll.scrollTop = 0;
  });
  dialog.addEventListener("close", () => {
    if (dialog.open) return;
    address.textContent = "";
    address.removeAttribute("title");
    input.value = "";
  });

  window.KGOpenRecoveryCodePreview = email => {
    address.textContent = email;
    address.title = email;
    input.value = "";
    setRejected(false);
    if (!dialog.open) dialog.showModal();
    scroll.scrollTop = 0;
  };
})();
