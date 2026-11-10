/* Kinoglobus settings screen. This file enhances the existing settings dialog. */
(() => {
  const dialog = document.getElementById("settings");
  if (!dialog) return;

  const style = document.createElement("style");
  style.id = "kg-settings-style";
  style.textContent = `
    #settings.kgs-dialog{--kgs-gold:#f5b942;--kgs-cream:#f4e4bd;--kgs-muted:#aaa0b2;--kgs-panel:#211c27;--kgs-panel2:#2a2431;position:fixed;inset:0;margin:0 auto;width:min(100%,520px);height:100dvh;max-height:100dvh;padding:0;border:0;border-radius:0;background:#100e13;color:var(--kgs-cream);overflow:hidden;box-shadow:0 0 50px #0009;font-family:inherit}
    #settings.kgs-dialog::backdrop{background:#050407eF}
    .kgs-shell{height:100%;display:flex;flex-direction:column;background:radial-gradient(ellipse at 50% -15%,#65451d35,transparent 46%),#100e13}
    .kgs-head{display:flex;align-items:center;gap:14px;padding:calc(env(safe-area-inset-top) + 16px) 18px 14px;border-bottom:1px solid #ffffff0c;background:#19151eeF;flex-shrink:0}
    .kgs-back{border:0;background:transparent;color:var(--kgs-cream);font-size:26px;width:34px;height:38px;cursor:pointer}
    .kgs-title{font-size:20px;font-weight:800;letter-spacing:.01em}.kgs-kicker{font-size:11px;color:var(--kgs-muted);margin-top:2px}
    .kgs-scroll{overflow:auto;overscroll-behavior:contain;padding:16px 16px calc(28px + env(safe-area-inset-bottom));scrollbar-width:thin}
    .kgs-hero{position:relative;overflow:hidden;border:1px solid #f5b94230;border-radius:22px;padding:19px;background:linear-gradient(135deg,#332313,#211a23 62%,#201b27);box-shadow:0 9px 32px #0004;margin-bottom:18px}
    .kgs-hero:after{content:'✦';position:absolute;right:17px;top:12px;color:#f5b94277;font-size:32px}
    .kgs-eyebrow{color:var(--kgs-gold);font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.15em}.kgs-hero h2{margin:8px 0 5px;font-size:22px}.kgs-hero p{margin:0;color:#c7b99e;font-size:13px;line-height:1.5}
    .kgs-status{display:inline-flex;align-items:center;gap:7px;margin-top:14px;padding:7px 10px;border-radius:99px;background:#130f17aa;font-size:12px;color:#ded1b7}.kgs-dot{width:8px;height:8px;border-radius:50%;background:#85808b}.kgs-dot.on{background:#74d69b;box-shadow:0 0 10px #74d69b77}
    .kgs-section{margin:20px 0}.kgs-section h3{display:flex;align-items:center;gap:9px;margin:0 2px 10px;font-size:15px}.kgs-icon{color:var(--kgs-gold);font-size:18px}.kgs-card{padding:14px;border:1px solid #ffffff0c;border-radius:18px;background:var(--kgs-panel);box-shadow:0 7px 20px #0002}
    .kgs-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 2px}.kgs-row+.kgs-row{border-top:1px solid #ffffff0c}.kgs-label{font-size:13px}.kgs-help{font-size:11px;color:var(--kgs-muted);line-height:1.45;margin-top:4px}
    .kgs-input{box-sizing:border-box;width:100%;margin:10px 0 8px;padding:12px 13px;border:1px solid #ffffff19;border-radius:12px;background:#151219;color:#fff;font:inherit;font-size:13px;outline:none}.kgs-input:focus{border-color:#f5b94288}
    .kgs-actions{display:flex;gap:8px;flex-wrap:wrap}.kgs-btn{border:1px solid #f5b94243;border-radius:12px;padding:10px 13px;background:#382b1b;color:#ffe0a0;font:inherit;font-size:12px;font-weight:700;cursor:pointer}.kgs-btn.secondary{border-color:#ffffff16;background:#302a35;color:#e4d9c9}.kgs-btn:active{transform:scale(.98)}
    .kgs-select{width:100%;padding:11px 12px;border:1px solid #ffffff18;border-radius:12px;background:#17131b;color:#f3e7d2;font:inherit;font-size:13px}
    .kgs-switch{position:relative;flex:none;width:43px;height:25px;border:0;border-radius:99px;background:#514b57;padding:3px;cursor:pointer;transition:background .2s}.kgs-switch:after{content:'';display:block;width:19px;height:19px;border-radius:50%;background:#ddd4c7;transition:transform .2s}.kgs-switch[aria-checked="true"]{background:#a97016}.kgs-switch[aria-checked="true"]:after{transform:translateX(18px);background:#fff2c9}
    .kgs-artifact{display:flex;align-items:center;gap:12px;padding:12px;border-radius:14px;background:#ffffff06}.kgs-reel{display:grid;place-items:center;width:42px;height:42px;border-radius:12px;background:#37291d;color:var(--kgs-gold);font-size:20px}.kgs-soon{margin-left:auto;border:1px solid #ffffff12;border-radius:99px;padding:4px 7px;color:#a9a0ae;font-size:9px;white-space:nowrap}
    .kgs-progress{height:7px;border-radius:99px;background:#ffffff12;overflow:hidden;margin-top:11px}.kgs-progress i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#e89d23,#ffe0a0)}
    .kgs-foot{color:#8d8492;font-size:10px;line-height:1.5;text-align:center;padding:14px 10px 0}
    @media(min-width:520px){#settings.kgs-dialog{height:min(900px,94dvh);top:3dvh;border:1px solid #f5b94228;border-radius:24px}.kgs-head{border-radius:24px 24px 0 0}}
    @media(prefers-reduced-motion:reduce){.kgs-switch,.kgs-switch:after{transition:none}}
  `;
  document.head.appendChild(style);

  dialog.className = "kgs-dialog";
  dialog.innerHTML = `
    <div class="kgs-shell">
      <header class="kgs-head"><button class="kgs-back" type="button" data-kgs-close aria-label="Назад">‹</button><div><div class="kgs-title">Настройки</div><div class="kgs-kicker">Персональная кинопроекция</div></div></header>
      <div class="kgs-scroll">
        <section class="kgs-hero"><div class="kgs-eyebrow">КиноГлобус · система</div><h2>Ваша киноэкспедиция</h2><p>Управляйте подключением, звуком и тем, как приложение открывает для вас фильмы.</p><div class="kgs-status"><i class="kgs-dot" data-kgs-dot></i><span data-kgs-status></span></div></section>
        <section class="kgs-section"><h3><span class="kgs-icon">◉</span> Подключение TMDB</h3><div class="kgs-card"><div class="kgs-label" data-kgs-key-status></div><div class="kgs-help">Ключ хранится в этом браузере и нужен для загрузки фильмов.</div><input class="kgs-input" data-kgs-key type="password" autocomplete="off" placeholder="Вставьте новый ключ TMDB" aria-label="Новый ключ TMDB"><div class="kgs-actions"><button class="kgs-btn" type="button" data-kgs-save>Сохранить ключ</button><button class="kgs-btn secondary" type="button" data-kgs-check>Проверить связь</button></div><div class="kgs-help" data-kgs-message aria-live="polite"></div></div></section>
        <section class="kgs-section"><h3><span class="kgs-icon">▧</span> Звуковая дорожка</h3><div class="kgs-card"><div class="kgs-label">Звук рулетки</div><div style="height:9px"></div><div data-kgs-sound></div><div class="kgs-help">Выбор сохраняется и используется при запуске рулетки.</div></div></section>
        <section class="kgs-section"><h3><span class="kgs-icon">✧</span> Эффекты и режим</h3><div class="kgs-card"><div class="kgs-row"><div><div class="kgs-label">Вибрация</div><div class="kgs-help">Тактильный отклик при запуске</div></div><button class="kgs-switch" type="button" role="switch" data-kgs-fx aria-label="Вибрация"></button></div><div class="kgs-row"><div><div class="kgs-label">Показывать жанр 18+</div><div class="kgs-help">Управляет видимостью соответствующего фильтра</div></div><button class="kgs-switch" type="button" role="switch" data-kgs-adult aria-label="Жанр 18+"></button></div><div class="kgs-row"><div><div class="kgs-label">Режим выбора</div><div class="kgs-help" data-kgs-mode-label></div></div><div class="kgs-actions"><button class="kgs-btn secondary" type="button" data-kgs-mode="filters">Фильтры</button><button class="kgs-btn secondary" type="button" data-kgs-mode="surprise">Сюрприз</button></div></div></div></section>
        <section class="kgs-section"><h3><span class="kgs-icon">▤</span> Артефакты рулетки</h3><div class="kgs-card"><div class="kgs-artifact"><div class="kgs-reel">▥</div><div><div class="kgs-label">35-мм кинолента</div><div class="kgs-help">Текущий стиль рулетки</div></div><span class="kgs-soon">АКТИВЕН</span></div><div style="height:8px"></div><div class="kgs-artifact"><div class="kgs-reel">✦</div><div><div class="kgs-label">Другие оформления</div><div class="kgs-help">Дополнительные визуальные темы появятся позже</div></div><span class="kgs-soon">СКОРО</span></div></div></section>
        <section class="kgs-section"><h3><span class="kgs-icon">◎</span> Путешествие</h3><div class="kgs-card"><div class="kgs-row"><div><div class="kgs-label">Исследовано стран</div><div class="kgs-help" data-kgs-progress-label></div></div><strong data-kgs-progress-count></strong></div><div class="kgs-progress"><i data-kgs-progress></i></div></div></section>
        <section class="kgs-section"><h3><span class="kgs-icon">⚙</span> Данные приложения</h3><div class="kgs-card"><div class="kgs-actions"><button class="kgs-btn secondary" type="button" data-kgs-history>Сбросить историю</button><button class="kgs-btn secondary" type="button" data-kgs-reset>Сбросить настройки</button></div><div class="kgs-help">Сбросы удаляют сохранённые данные этого приложения.</div></div></section>
        <div class="kgs-foot">КиноГлобус · настройки сохраняются на этом устройстве</div>
      </div>
    </div>`;

  const $ = (s) => dialog.querySelector(s);
  const close = () => { if (dialog.open) dialog.close(); else dialog.removeAttribute("open"); };
  const switchState = (el, on) => el.setAttribute("aria-checked", String(!!on));
  const sync = () => {
    const hasKey = !!apiKey;
    $("[data-kgs-status]").textContent = hasKey ? "Подключение настроено" : "Нужно добавить ключ TMDB";
    $("[data-kgs-dot]").classList.toggle("on", hasKey);
    $("[data-kgs-key-status]").textContent = hasKey ? "Ключ сохранён" : "Ключ пока не добавлен";
    switchState($("[data-kgs-fx]"), fx);
    switchState($("[data-kgs-adult]"), showAdult);
    $("[data-kgs-mode-label]").textContent = playMode === "surprise" ? "Случайная подборка" : "Подбор фильмов";
    const n = Object.keys(visited || {}).length, all = COUNTRIES.length;
    $("[data-kgs-progress-count]").textContent = `${n} / ${all}`;
    $("[data-kgs-progress-label]").textContent = `Открыто ${n} из ${all} стран`;
    $("[data-kgs-progress]").style.width = `${Math.round(n / all * 100)}%`;
  };

  $("[data-kgs-close]").addEventListener("click", close);
  dialog.addEventListener("click", (e) => { if (e.target === dialog) close(); });
  document.getElementById("gear").onclick = () => { sync(); if (dialog.showModal) dialog.showModal(); else dialog.setAttribute("open", ""); };

  const soundSlot = $("[data-kgs-sound]");
  const soundSelect = document.getElementById("snd");
  soundSelect.className = "kgs-select";
  soundSelect.setAttribute("aria-label", "Звук рулетки");
  soundSlot.appendChild(soundSelect);

  $("[data-kgs-fx]").addEventListener("click", () => { document.getElementById("fx").click(); sync(); });
  $("[data-kgs-adult]").addEventListener("click", () => { document.getElementById("adultVis").click(); sync(); });
  $("[data-kgs-mode=filters]").addEventListener("click", () => { document.getElementById("modeFilters").click(); sync(); });
  $("[data-kgs-mode=surprise]").addEventListener("click", () => { document.getElementById("modeSurprise").click(); sync(); });

  $("[data-kgs-save]").addEventListener("click", () => {
    const value = $("[data-kgs-key]").value.trim(), message = $("[data-kgs-message]");
    if (!value) { message.textContent = "Введите ключ, чтобы сохранить его."; return; }
    document.getElementById("tmdb-key-input").value = value;
    document.getElementById("tmdb-key-save").click();
    $("[data-kgs-key]").value = "";
    message.textContent = "Ключ сохранён.";
    sync();
  });
  $("[data-kgs-check]").addEventListener("click", async () => {
    const message = $("[data-kgs-message]");
    if (!apiKey) { message.textContent = "Сначала сохраните ключ TMDB."; return; }
    message.textContent = "Проверяем соединение…";
    try {
      const response = await fetch(`https://api.themoviedb.org/3/configuration?api_key=${encodeURIComponent(apiKey)}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      message.textContent = "Соединение с TMDB работает.";
    } catch (error) { message.textContent = `Не удалось подключиться: ${error.message}`; }
  });
  $("[data-kgs-history]").addEventListener("click", () => {
    if (confirm("Сбросить историю просмотров и путешествия?")) { document.getElementById("resetHist").click(); sync(); }
  });
  $("[data-kgs-reset]").addEventListener("click", () => {
    if (confirm("Вернуть настройки приложения к исходным?")) { document.getElementById("resetSettings").click(); sync(); }
  });
  soundSelect.addEventListener("change", sync);
  sync();
})();
