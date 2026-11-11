/* Settings screen styled after the supplied Stitch design. */
(() => {
  const dialog = document.getElementById("settings");
  if (!dialog) return;

  const style = document.createElement("style");
  style.id = "kg-settings-style";
  style.textContent = `
    /* A dialog is hidden by the browser until it is opened. The explicit display
       on the component must preserve that behavior, otherwise settings cover
       the home screen on every first visit. */
    #settings.kgs-dialog:not([open]){display:none!important}
    #settings.kgs-dialog[open]{--gold:#ffb830;--gold2:#ffdca8;--ink:#09070d;--panel:#18141e;--panel2:#211b29;--muted:#a79bad;display:flex;position:fixed;inset:0;margin:0 auto;width:min(100%,520px);height:100dvh;max-height:100dvh;padding:0;border:0;border-radius:0;background:var(--ink);color:#f0e7f1;overflow:hidden;box-shadow:0 0 55px #000b;font-family:inherit}
    #settings.kgs-dialog::backdrop{background:#030205ed}
    .kgs-shell{height:100%;display:flex;flex-direction:column;background:radial-gradient(ellipse at 50% -10%,#3e263f42,transparent 43%),var(--ink)}
    .kgs-head{height:58px;box-sizing:border-box;display:flex;align-items:center;gap:9px;padding:0 16px;flex:none;background:#17131c;border-bottom:1px solid #ffffff0b;box-shadow:0 5px 18px #0005}
    .kgs-back{display:grid;place-items:center;width:28px;height:34px;border:0;background:none;color:#f3eaf5;font-family:inherit;font-size:24px;line-height:1;cursor:pointer}.kgs-title{font-family:inherit;font-size:14px;line-height:1.2;font-weight:700}.kgs-title small{display:block;margin-top:3px;color:var(--muted);font-size:10px;font-weight:500}
    .kgs-scroll{min-height:0;flex:1;overflow:auto;overscroll-behavior:contain;padding:12px 13px 18px;scrollbar-width:thin;scrollbar-color:#50445b transparent}
    .kgs-summary{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px}.kgs-stat{min-width:0;padding:9px 10px;border:1px solid #ffffff0c;border-radius:12px;background:linear-gradient(135deg,#1d1923,#211a29)}.kgs-stat-top{display:flex;align-items:center;gap:6px;color:var(--muted);font-size:9px}.kgs-stat strong{display:block;margin-top:5px;color:#e9deed;font-size:11px;font-weight:700}.kgs-state{color:#68d49b!important}.kgs-state:before{content:'●';color:#5bdd9b;margin-right:5px}
    .kgs-hero{margin:4px 0 12px}.kgs-kicker{color:#e0a633;font-size:8px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.kgs-hero h1{margin:5px 0 2px;font-family:Georgia,serif;font-size:24px;line-height:1.12;color:#f2e8f3}.kgs-hero p{margin:0;color:#a99eae;font-size:10px;line-height:1.45}.kgs-account{display:grid;grid-template-columns:38px 1fr;gap:8px;padding:10px;border:1px solid #78551e66;border-radius:12px;background:linear-gradient(125deg,#28211f,#241b27);margin:10px 0 12px}.kgs-account-icon{display:grid;place-items:center;width:34px;height:34px;border:1px solid #b67a2866;border-radius:10px;background:#4a341b;color:#ffc14b;font-size:17px}.kgs-account-copy{min-width:0}.kgs-account-title{font-size:11px;font-weight:750}.kgs-account-sub{margin-top:3px;color:#a99eae;font-size:8px;line-height:1.4}.kgs-account-actions{grid-column:1/3;display:grid;grid-template-columns:1fr 1fr;gap:6px}.kgs-account-actions .kgs-btn{min-height:29px}.kgs-placeholder{opacity:.82}.kgs-themes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}.kgs-theme{min-height:66px;padding:7px 5px;border:1px solid #ffffff10;border-radius:9px;background:#17131c;text-align:center;color:#d8cede}.kgs-theme b{display:block;margin:3px 0;font-size:8px}.kgs-theme small{display:block;color:#a095a7;font-size:7px;line-height:1.3}.kgs-theme.current{border-color:#d89a3d88;background:#30271f}.kgs-soon{display:inline-block;margin-top:4px;color:#e3ad50;font-size:7px}
    .kgs-section{margin:14px 0}.kgs-h{display:flex;align-items:center;gap:7px;margin:0 2px 7px;color:#f1e9f3;font-size:10px;font-weight:800;letter-spacing:.045em;text-transform:uppercase}.kgs-h .i{font-size:14px;color:var(--gold)}.kgs-card{padding:10px;border:1px solid #ffffff0c;border-radius:14px;background:linear-gradient(145deg,#1d1923,#1b1721);box-shadow:0 6px 17px #0003}
    .kgs-note{margin:6px 2px 0;color:#9c91a2;font-size:9px;line-height:1.45}.kgs-label{font-size:10px;color:#d8ccdc}.kgs-sub{font-size:9px;line-height:1.4;color:#9f94a6;margin-top:3px}.kgs-row{display:flex;align-items:center;gap:8px;min-height:39px;padding:6px 2px}.kgs-row+.kgs-row{border-top:1px solid #ffffff09}.kgs-rowcopy{min-width:0;flex:1}.kgs-rowtitle{font-size:10px;font-weight:650;line-height:1.3}.kgs-meta{color:#96899e;font-size:8px;margin-top:2px;line-height:1.3}.kgs-badge{margin-left:auto;padding:3px 6px;border-radius:99px;background:#49341b;color:#ffc45b;font-size:8px;white-space:nowrap}.kgs-badge.gray{background:#302a38;color:#a89db0}.kgs-badge.pink{background:#452137;color:#ffb1c5}
    .kgs-apihead{display:flex;align-items:center;justify-content:space-between;margin-bottom:7px}.kgs-lamp{font-size:8px;color:#ffbe50}.kgs-lamp.on{color:#73dda4}.kgs-keywrap{display:flex;align-items:center;gap:5px}.kgs-input{box-sizing:border-box;min-width:0;flex:1;height:34px;padding:0 10px;border:1px solid #413649;border-radius:9px;background:#100d14;color:#eee6f2;font-family:inherit;font-size:10px;outline:none}.kgs-input:focus{border-color:#d9912a}.kgs-iconbtn,.kgs-ok{height:31px;display:grid;place-items:center;border:0;border-radius:8px;cursor:pointer}.kgs-iconbtn{width:31px;background:#302a37;color:#ddd0e5}.kgs-ok{width:36px;background:#c58a27;color:#171016;font-size:10px;font-weight:800}.kgs-actions{display:flex;gap:6px;margin-top:8px}.kgs-btn{min-height:30px;flex:1;padding:6px 8px;border:1px solid #ffffff10;border-radius:9px;background:#2a2332;color:#e7deeb;font-family:inherit;font-size:9px;font-weight:600;cursor:pointer}.kgs-btn.primary{border-color:#ffba3040;background:linear-gradient(100deg,#d98f12,#ffc35a);color:#21150b}.kgs-btn.danger{border-color:#a3495866;background:#40222e;color:#ffc1c6}.kgs-btn:disabled{opacity:.42;cursor:not-allowed}
    .kgs-choice{position:relative;display:grid;grid-template-columns:28px minmax(0,1fr) auto 12px;align-items:center;gap:7px;min-height:39px;margin:4px 0;padding:5px 7px;border:1px solid #ffffff0b;border-radius:10px;background:#ffffff04}.kgs-choice[data-kgs-reel-style]{cursor:pointer;transition:border-color .16s,background .16s}.kgs-choice[data-kgs-reel-style]:hover{border-color:#d29a4966;background:#29221e}.kgs-choice[data-kgs-reel-style]:focus-visible{outline:2px solid var(--gold);outline-offset:2px}.kgs-choice.selected{border-color:#d29a493d;background:#29221e}.kgs-reel{display:grid;place-items:center;width:27px;height:27px;border-radius:7px;background:#332a37;color:#e6c68a;font-size:14px}.kgs-choice.selected .kgs-reel{background:#49331c;color:#ffd372}.kgs-radio{width:10px;height:10px;border:1px solid #776b7f;border-radius:50%}.kgs-choice.selected .kgs-radio{border:3px solid var(--gold);background:#fff1c6}.kgs-sel{padding:2px 5px;border-radius:4px;background:#684721;color:#ffd58a;font-size:7px}.kgs-disabled{opacity:.64}
    .kgs-select{width:100%;height:33px;padding:0 9px;border:1px solid #3b3242;border-radius:8px;background:#120f16;color:#eee5f2;font-family:inherit;font-size:10px}.kgs-audio{display:grid;grid-template-columns:1fr auto;align-items:center;gap:8px;padding:6px 2px}.kgs-audio+.kgs-audio{border-top:1px solid #ffffff09}.kgs-audio .kgs-select{grid-column:1/3}.kgs-play{height:28px;padding:0 8px;border:1px solid #59452b;border-radius:8px;background:#30251b;color:#ffcf74;font-size:9px;cursor:pointer}.kgs-range{width:72px;accent-color:#ffb830}.kgs-inline{display:flex;align-items:center;gap:5px}
    .kgs-switch{position:relative;flex:none;width:34px;height:19px;padding:2px;border:0;border-radius:99px;background:#49434e;cursor:pointer}.kgs-switch:after{content:'';display:block;width:15px;height:15px;border-radius:50%;background:#d9d1dd;transition:transform .18s}.kgs-switch[aria-checked="true"]{background:#d98e11}.kgs-switch[aria-checked="true"]:after{transform:translateX(15px);background:#fff0c2}.kgs-switch:disabled{opacity:.35;cursor:not-allowed}
    .kgs-mode{display:grid;grid-template-columns:1fr 1fr;gap:4px;padding:4px;border-radius:9px;background:#141018}.kgs-mode button{min-height:28px;border:0;border-radius:7px;background:transparent;color:#a89caf;font-size:9px;cursor:pointer}.kgs-mode button.active{background:#d89015;color:#1d140a;font-weight:800;box-shadow:0 2px 9px #d8901530}.kgs-chips{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-top:7px}.kgs-chip{padding:5px 2px;border:1px solid #ffffff0d;border-radius:6px;background:#201b27;color:#a99eaf;font-size:8px}.kgs-chip:disabled{opacity:.58}
    .kgs-progresshead{display:flex;justify-content:space-between;align-items:center;font-size:9px;color:#d9ccdf}.kgs-track{height:5px;margin:7px 0;border-radius:9px;background:#342c39;overflow:hidden}.kgs-track i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#e18b12,#ffd06e)}.kgs-progressmeta{display:flex;justify-content:space-between;color:#92879b;font-size:8px}.kgs-map{display:flex;align-items:center;gap:9px;width:100%;margin-top:9px;padding:8px;border:1px solid #4c3d2c;border-radius:9px;background:#29221d;color:#f1d9aa;text-align:left;cursor:pointer}.kgs-map .i{color:#ffc24e;font-size:16px}.kgs-map span:nth-child(2){flex:1}.kgs-warning{padding:7px;border-radius:8px;background:#38222a;color:#d6aab1;font-size:8px;line-height:1.4;margin:7px 0}.kgs-foot{padding:9px 5px 2px;text-align:center;color:#7e7487;font-size:8px;line-height:1.6}.kgs-github{color:#d0bfdf;text-decoration:underline;text-underline-offset:2px}
    .kgs-bottom{display:grid;grid-template-columns:repeat(4,1fr);flex:none;padding:7px 8px calc(7px + env(safe-area-inset-bottom));background:#19151e;border-top:1px solid #ffffff0b;box-shadow:0 -5px 16px #0005}.kgs-tab{display:grid;justify-items:center;gap:3px;border:0;background:transparent;color:#958b9c;font-size:8px;cursor:pointer}.kgs-tab .i{font-size:16px}.kgs-tab.active{color:#ffc044}
    @media(min-width:520px){#settings.kgs-dialog[open]{height:min(930px,96dvh);top:2dvh;border:1px solid #40364a;border-radius:20px}.kgs-head{border-radius:20px 20px 0 0}.kgs-bottom{border-radius:0 0 20px 20px}}
    @media(prefers-reduced-motion:reduce){.kgs-switch:after{transition:none}}
    /* Match the app's normal 14px body text and serif section headings. */
    .kgs-title{font-size:16px}.kgs-title small{font-size:12px}
    .kgs-hero{margin:8px 0 14px}.kgs-kicker{font-size:10px}.kgs-hero h1{font-family:'Noto Serif',Georgia,serif;font-size:25px;line-height:1.2}.kgs-hero p{font-size:13px;line-height:1.5}
    .kgs-account-title{font-size:14px}.kgs-account-sub{font-size:12px;line-height:1.45}.kgs-account-actions .kgs-btn{font-size:13px}
    .kgs-stat-top{font-size:12px}.kgs-stat strong{font-size:14px}.kgs-h{font-family:'Noto Serif',Georgia,serif;font-size:17px;letter-spacing:0;text-transform:none}.kgs-card{padding:12px}
    .kgs-note{font-size:12px;line-height:1.5}.kgs-label{font-size:13px}.kgs-sub{font-size:12px;line-height:1.45}.kgs-row{min-height:46px}.kgs-rowtitle{font-size:14px;line-height:1.4}.kgs-meta{font-size:11px;line-height:1.4}.kgs-badge{font-size:10px;padding:4px 7px}
    .kgs-input,.kgs-select{height:40px;font-size:14px}.kgs-ok{font-size:13px}.kgs-btn{min-height:38px;font-size:13px}.kgs-choice{min-height:50px;gap:9px;padding:7px 9px}.kgs-choice .kgs-rowtitle{font-size:14px}.kgs-choice .kgs-meta{font-size:11px}.kgs-sel{font-size:9px}.kgs-reel{width:32px;height:32px;font-size:17px}
    .kgs-play{height:36px;font-size:12px}.kgs-mode button{min-height:36px;font-size:12px}.kgs-chip{padding:7px 3px;font-size:10px}.kgs-progresshead{font-size:12px}.kgs-progressmeta{font-size:10px}.kgs-map{padding:11px}.kgs-warning{padding:9px;font-size:11px}.kgs-foot{font-size:10px}
    .kgs-theme{min-height:78px}.kgs-theme b{font-size:10px}.kgs-theme small{font-size:9px}.kgs-soon{font-size:9px}.kgs-tab{font-size:10px}.kgs-tab .i{font-size:18px}
  `;
  document.head.appendChild(style);

  dialog.className = "kgs-dialog";
  dialog.innerHTML = `
    <div class="kgs-shell">
      <header class="kgs-head"><button class="kgs-back" type="button" data-kgs-close aria-label="Назад">←</button><div class="kgs-title">Настройки приложения <small>Настройки КиноГлобуса</small></div><span class="kgs-badge" style="margin-left:auto">✦ VIP</span><span style="color:#ffcf7a;font-size:17px">◉</span></header>
      <div class="kgs-scroll">
        <div class="kgs-hero"><div class="kgs-kicker">Конфигурация ядра <span class="kgs-badge gray" style="margin-left:6px">● v2.4.2 Production</span></div><h1>Настройки приложения</h1><p>КиноГлобус v2.4.2 · Движок кинематографической рулетки</p></div>
        <section class="kgs-account"><div class="kgs-account-icon">▣</div><div class="kgs-account-copy"><div class="kgs-account-title">Кино-аккаунт синефила <span class="kgs-badge gray">SYNC</span></div><div class="kgs-account-sub">Экран регистрации готов; синхронизация между устройствами подключается отдельно</div></div><div class="kgs-account-actions"><button class="kgs-btn primary" type="button" data-kgs-auth-open="register">♙ Регистрация</button><button class="kgs-btn" type="button" data-kgs-auth-open="login">⇥ Войти</button></div></section>
        <div class="kgs-summary">
          <div class="kgs-stat"><div class="kgs-stat-top">◉ TMDB v3</div><strong class="kgs-state" data-kgs-status></strong></div>
          <div class="kgs-stat"><div class="kgs-stat-top">▤ Архив открытий</div><strong data-kgs-count></strong></div>
        </div>

        <section class="kgs-section"><h2 class="kgs-h"><span class="i">文</span> Язык и региональные стандарты <span class="kgs-badge gray">Скоро</span></h2><div class="kgs-card"><label class="kgs-label" for="kgs-language">Язык интерфейса</label><select id="kgs-language" class="kgs-select" disabled aria-label="Язык интерфейса появится позже"><option>Русский (Russian)</option></select><p class="kgs-note">Настройки языка оригинала, региона и субтитров будут доступны позже.</p><div class="kgs-row kgs-placeholder"><div class="kgs-rowcopy"><div class="kgs-rowtitle">Язык названий и синопсисов TMDB</div></div><span class="kgs-badge gray">Скоро</span></div><div class="kgs-row kgs-placeholder"><div class="kgs-rowcopy"><div class="kgs-rowtitle">Язык субтитров трейлеров</div></div><span class="kgs-badge gray">Скоро</span></div></div></section>

        <section class="kgs-section"><h2 class="kgs-h"><span class="i">◉</span> Связь с фильмографией TMDB <span class="kgs-badge gray" data-kgs-api-badge></span></h2><div class="kgs-card">
          <div class="kgs-apihead"><label class="kgs-label" for="kgs-token">Bearer Token / v3 Auth</label><span class="kgs-lamp" data-kgs-lamp>● нет ключа</span></div>
          <div class="kgs-keywrap"><input id="kgs-token" class="kgs-input" type="password" autocomplete="new-password" placeholder="Введите ключ TMDB" aria-label="Ключ TMDB"><button class="kgs-iconbtn" type="button" data-kgs-visibility aria-label="Показать введённый ключ">◉</button><button class="kgs-ok" type="button" data-kgs-save aria-label="Сохранить ключ">OK</button></div>
          <p class="kgs-note">API-ключ TMDB нужен для загрузки фильмов, постеров, трейлеров и метаданных стран. Ключ не отображается в этом поле после сохранения.</p>
          <div class="kgs-actions"><button class="kgs-btn" type="button" data-kgs-change>Изменить ключ</button><button class="kgs-btn primary" type="button" data-kgs-check>Проверить связь</button></div><p class="kgs-note" data-kgs-message aria-live="polite"></p>
        </div></section>

        <section class="kgs-section"><h2 class="kgs-h"><span class="i">✧</span> Тема и визуальный стиль <span class="kgs-badge gray">Скоро</span></h2><div class="kgs-card"><div class="kgs-themes"><div class="kgs-theme current"><span>🎞️</span><b>Кинематографичная</b><small>Текущий стиль</small></div><div class="kgs-theme"><span>◼</span><b>OLED Black</b><small>Глубокий чёрный</small><span class="kgs-soon">Скоро</span></div><div class="kgs-theme"><span>🏆</span><b>Золотой век</b><small>Классический зал</small><span class="kgs-soon">Скоро</span></div></div><div class="kgs-row" style="margin-top:6px"><div class="kgs-rowcopy"><div class="kgs-rowtitle">Кинематографические переходы</div><div class="kgs-meta">Плавная анимация экранов и карточек</div></div><span class="kgs-badge gray">Активно</span></div></div></section>

        <section class="kgs-section"><h2 class="kgs-h"><span class="i">▥</span> Артефакты и маркеры рулетки <span class="kgs-badge gray">смена плёнки</span></h2><div class="kgs-card">
          <p class="kgs-note" style="margin:0 1px 7px">Выберите визуальный стиль рулетки и настройте показ киноленты.</p>
          <div class="kgs-choice" data-kgs-reel-style="35mm" role="radio" aria-checked="false" tabindex="0"><span class="kgs-reel">▥</span><div class="kgs-rowcopy"><div class="kgs-rowtitle">35мм киноплёнка</div><div class="kgs-meta">Привычная лента постеров в рамке</div></div><span class="kgs-sel" data-choice-selected hidden>ВЫБРАНО</span><i class="kgs-radio"></i></div>
          <div class="kgs-choice" data-kgs-reel-style="projection" role="radio" aria-checked="false" tabindex="0"><span class="kgs-reel">▤</span><div class="kgs-rowcopy"><div class="kgs-rowtitle">Проекционный тракт · 35 мм</div><div class="kgs-meta">Кадры вертикальной киноплёнки прокручиваются при поиске и останавливаются на найденном фильме</div></div><span class="kgs-sel" data-choice-selected hidden>ВЫБРАНО</span><i class="kgs-radio"></i></div>
          <div class="kgs-choice" data-kgs-reel-style="cassette" role="radio" aria-checked="false" tabindex="0"><span class="kgs-reel">▰</span><div class="kgs-rowcopy"><div class="kgs-rowtitle">Кассетная дека · 3D Cover Flow</div><div class="kgs-meta">Карусель постеров со свайпом, перемоткой и случайным выбором</div></div><span class="kgs-sel" data-choice-selected hidden>ВЫБРАНО</span><i class="kgs-radio"></i></div>
        </div></section>

        <section class="kgs-section"><h2 class="kgs-h"><span class="i">♫</span> Звуковой режиссёрский пульт </h2><div class="kgs-card">
          <div class="kgs-audio"><div><div class="kgs-label">Звук вращения КиноГлобуса</div><div class="kgs-sub">Сопровождение выбора страны</div></div><span class="kgs-badge gray">Активно</span><div data-kgs-sound></div></div>
          <div class="kgs-audio"><div><div class="kgs-label">Звук поиска фильма</div><div class="kgs-sub">Восемь кинематографичных профилей на выбор</div></div><span class="kgs-badge">Активно</span><select class="kgs-select" data-kgs-reel-sound-select aria-label="Выбрать звук поиска фильма"><option value="projector">Проектор · щелчки</option><option value="imax">Кинозал · мягкий импульс</option><option value="camera">Кинокамера · механика</option><option value="tape">Магнитная плёнка</option><option value="premiere">Премьерный зал</option><option value="shutter">Кинокамера · затвор</option><option value="editbench">Монтажный стол · шаг кадра</option><option value="sixteenmm">16 мм · мягкая трещотка</option><option value="off">Без звука</option></select><button class="kgs-play" type="button" data-kgs-reel-preview style="grid-column:1/3">▶ Прослушать выбранный звук</button></div>
          <div class="kgs-row"><div class="kgs-rowcopy"><div class="kgs-rowtitle">Тактильный отклик</div><div class="kgs-meta">Вибрация при запуске рулетки</div></div><button class="kgs-switch" type="button" role="switch" data-kgs-fx aria-label="Тактильный отклик"></button></div>
          <div class="kgs-inline" style="justify-content:space-between;margin-top:4px"><button class="kgs-play" type="button" data-kgs-preview>▶ Тест кинозвука</button><label class="kgs-inline"><span class="kgs-sub">Громкость</span><input class="kgs-range" type="range" min="0" max="100" disabled aria-label="Регулятор громкости появится позже"></label></div>
        </div></section>

        <section class="kgs-section"><h2 class="kgs-h"><span class="i">✧</span> Атмосфера кинозала и оптика</h2><div class="kgs-card">
          <div class="kgs-row"><div class="kgs-rowcopy"><div class="kgs-rowtitle">Световой конус проектора</div><div class="kgs-meta">Динамический луч на фоне глобуса · готовится</div></div><span class="kgs-badge gray">Скоро</span><button class="kgs-switch" type="button" disabled aria-label="Световой конус пока недоступен"></button></div>
          <div class="kgs-row"><div class="kgs-rowcopy"><div class="kgs-rowtitle">Плёночное зерно Kodak 64</div><div class="kgs-meta">Тонкая текстура киноплёнки · готовится</div></div><span class="kgs-badge gray">Скоро</span><button class="kgs-switch" type="button" disabled aria-label="Плёночное зерно пока недоступно"></button></div>
          <div class="kgs-row"><div class="kgs-rowcopy"><div class="kgs-rowtitle">Анаморфотные блики Panavision</div><div class="kgs-meta">Кинематографические блики интерфейса · готовятся</div></div><span class="kgs-badge gray">Скоро</span><button class="kgs-switch" type="button" disabled aria-label="Блики пока недоступны"></button></div>
          <div class="kgs-row"><div class="kgs-rowcopy"><div class="kgs-rowtitle">Контент для взрослых (18+)</div><div class="kgs-meta">Показывать жанр 18+ в фильтрах</div></div><button class="kgs-switch" type="button" role="switch" data-kgs-adult aria-label="Жанр 18+"></button></div>
          <div class="kgs-row" style="display:block"><div class="kgs-rowtitle" style="margin:0 0 6px">Режим рулетки по умолчанию</div><div class="kgs-mode"><button type="button" data-kgs-mode="filters">⌕ Свои фильтры</button><button type="button" data-kgs-mode="surprise">⚄ Удиви меня</button></div><div class="kgs-chips"><button class="kgs-chip" type="button" disabled>Лёгкое</button><button class="kgs-chip" type="button" disabled>Открытие</button><button class="kgs-chip" type="button" disabled>Случайность</button><button class="kgs-chip" type="button" disabled>Хардкор</button></div><p class="kgs-note">Дополнительные сценарии рулетки будут добавлены позже.</p></div>
        </div></section>

        <section class="kgs-section"><h2 class="kgs-h"><span class="i">◎</span> Атлас экспедиции и журнал</h2><div class="kgs-card">
          <div class="kgs-progresshead"><span>Прогресс исследователя</span><strong data-kgs-count></strong></div><div class="kgs-track"><i data-kgs-progress></i></div><div class="kgs-progressmeta"><span data-kgs-progress-label></span><span data-kgs-left></span></div>
          <button class="kgs-map" type="button" data-kgs-atlas><span class="i">▣</span><span><strong>Карта открытий и просмотренных лент</strong><small class="kgs-sub" style="display:block">Открыть атлас</small></span><span>›</span></button>
          <div class="kgs-warning" data-kgs-warning></div>
          <button class="kgs-btn danger" type="button" style="width:100%" data-kgs-history>◷ &nbsp;Сбросить историю открытых стран и фильмов</button>
        </div></section>

        <section class="kgs-section"><h2 class="kgs-h"><span class="i">⚙</span> Система и администрирование</h2><div class="kgs-card">
          <div class="kgs-row"><div class="kgs-rowcopy"><div class="kgs-rowtitle">КиноГлобус</div><div class="kgs-meta">Веб-приложение · данные TMDB</div></div><span class="kgs-badge gray">Активно</span></div>
          <a class="kgs-row" style="text-decoration:none;color:inherit" href="https://github.com/IhorMich/kinoglobus" target="_blank" rel="noopener noreferrer"><span class="kgs-reel">⌘</span><div class="kgs-rowcopy"><div class="kgs-rowtitle">Исходный код на GitHub</div><div class="kgs-meta">Репозиторий проекта</div></div><span>↗</span></a>
          <button class="kgs-btn" type="button" style="width:100%;margin-top:6px" data-kgs-reset>↻ &nbsp;Сбросить все настройки по умолчанию</button>
        </div></section>
        <div class="kgs-foot">КиноГлобус · информация о фильмах предоставляется <a class="kgs-github" href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">TMDB</a></div>
      </div>
      <nav class="kgs-bottom" aria-label="Навигация"><button class="kgs-tab" type="button" data-kgs-tab="globe"><span class="i">◎</span>Глобус</button><button class="kgs-tab" type="button" data-kgs-tab="collections"><span class="i">▣</span>Подборки</button><button class="kgs-tab" type="button" data-kgs-tab="journey"><span class="i">◉</span>Путешествие</button><button class="kgs-tab" type="button" data-kgs-tab="history"><span class="i">◷</span>История</button></nav>
    </div>`;

  const $ = (selector) => dialog.querySelector(selector);
  const close = () => { if (dialog.open) dialog.close(); else dialog.removeAttribute("open"); };
  const switchState = (el, value) => el.setAttribute("aria-checked", String(!!value));
  const sync = () => {
    const hasKey = !!apiKey;
    $("[data-kgs-status]").textContent = hasKey ? "Ключ сохранён" : "Ключ не добавлен";
    $("[data-kgs-api-badge]").textContent = hasKey ? "КЛЮЧ СОХРАНЁН" : "НУЖЕН КЛЮЧ";
    $("[data-kgs-lamp]").textContent = hasKey ? "● ключ сохранён" : "● нет ключа";
    $("[data-kgs-lamp]").classList.toggle("on", hasKey);
    const opened = Object.keys(visited || {}).length, total = COUNTRIES.length;
    const count = `${opened} / ${total} стран`;
    dialog.querySelectorAll("[data-kgs-count]").forEach((node) => { node.textContent = count; });
    $("[data-kgs-progress-label]").textContent = `Открыто ${opened} стран`;
    $("[data-kgs-left]").textContent = `Осталось ${Math.max(0,total-opened)}`;
    $("[data-kgs-progress]").style.width = `${Math.round(opened/total*100)}%`;
    $("[data-kgs-warning]").textContent = `Очистка истории снимет отметки со всех ${opened} открытых стран и просмотренных фильмов.`;
    switchState($("[data-kgs-fx]"), fx);
    switchState($("[data-kgs-adult]"), showAdult);
    dialog.querySelectorAll("[data-kgs-reel-style]").forEach((choice)=>{
      const selected=choice.dataset.kgsReelStyle===reelStyle;
      choice.classList.toggle("selected",selected);
      choice.setAttribute("aria-checked",String(selected));
      const badge=choice.querySelector("[data-choice-selected]");if(badge)badge.hidden=!selected;
    });
    const reelSoundSelect=$("[data-kgs-reel-sound-select]");
    if(reelSoundSelect)reelSoundSelect.value=window.getCinemaReelSound?.()||"projector";
    $("[data-kgs-mode=filters]").classList.toggle("active", playMode !== "surprise");
    $("[data-kgs-mode=surprise]").classList.toggle("active", playMode === "surprise");
  };

  $("[data-kgs-close]").addEventListener("click", close);
  dialog.addEventListener("click", (event) => { if (event.target === dialog) close(); });
  document.getElementById("gear").onclick = () => {
    const scroll=$(".kgs-scroll");if(scroll)scroll.scrollTop=0;
    if(!dialog.open){if(dialog.showModal)dialog.showModal();else dialog.setAttribute("open","");}
    sync();
  };

  const soundSelect = document.getElementById("snd");
  const labels = {roulette:"Трещотка бобины",bells:"Колокольчики",arcade:"Аркада",casino:"Казино",marimba:"Маримба",space:"Космос",film:"Киноплёнка",orchestra:"Оркестр",jazz:"Джаз",synth:"Синтезатор",chimes:"Звон",off:"Без звука",imax:"Кинозал · низкий гул"};
  if (soundSelect) {
    [...soundSelect.options].forEach((option) => { option.textContent = labels[option.value] || option.textContent; });
    soundSelect.className = "kgs-select";
    soundSelect.setAttribute("aria-label", "Звук вращения КиноГлобуса");
    const soundHost = $("[data-kgs-sound]");
    if (soundHost) soundHost.appendChild(soundSelect);
  }
  const reelSoundSelect=$("[data-kgs-reel-sound-select]");
  if(reelSoundSelect){
    reelSoundSelect.value=window.getCinemaReelSound?.()||"projector";
    reelSoundSelect.addEventListener("change",()=>window.setCinemaReelSound?.(reelSoundSelect.value));
  }
  $(`[data-kgs-reel-preview]`).addEventListener("click",()=>window.previewFilmReelSound?.());

  $("[data-kgs-visibility]").addEventListener("click", () => {
    const input = $("#kgs-token"); input.type = input.type === "password" ? "text" : "password";
    $("[data-kgs-visibility]").setAttribute("aria-label", input.type === "password" ? "Показать введённый ключ" : "Скрыть введённый ключ");
  });
  $("[data-kgs-change]").addEventListener("click", () => { $("#kgs-token").focus(); $("[data-kgs-message]").textContent = "Введите новый ключ и нажмите OK. Сохранённый ключ пока остаётся активным."; });
  $("[data-kgs-save]").addEventListener("click", () => {
    const value = $("#kgs-token").value.trim();
    if (!value) { $("[data-kgs-message]").textContent = "Введите новый ключ TMDB перед сохранением."; return; }
    document.getElementById("tmdb-key-input").value = value;
    document.getElementById("tmdb-key-save").click();
    $("#kgs-token").value = "";
    $("[data-kgs-message]").textContent = "Ключ сохранён. При желании проверьте соединение.";
    sync();
  });
  $("[data-kgs-check]").addEventListener("click", async () => {
    const message = $("[data-kgs-message]");
    if (!apiKey) { message.textContent = "Сначала добавьте ключ TMDB."; return; }
    message.textContent = "Проверяем соединение…";
    try {
      const response = await fetch(`https://api.themoviedb.org/3/configuration?api_key=${encodeURIComponent(apiKey)}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      message.textContent = "TMDB ответил успешно — соединение работает.";
    } catch (error) { message.textContent = `Не удалось проверить соединение: ${error.message}`; }
  });

  $("[data-kgs-fx]").addEventListener("click", () => { document.getElementById("fx").click(); sync(); });
  dialog.querySelectorAll("[data-kgs-reel-style]").forEach((choice)=>{
    const select=()=>{window.setCinemaReelStyle(choice.dataset.kgsReelStyle);sync();};
    choice.addEventListener("click",select);
    choice.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();select();}});
  });
  $("[data-kgs-adult]").addEventListener("click", () => { document.getElementById("adultVis").click(); sync(); });
  $("[data-kgs-mode=filters]").addEventListener("click", () => { document.getElementById("modeFilters").click(); sync(); });
  $("[data-kgs-mode=surprise]").addEventListener("click", () => { document.getElementById("modeSurprise").click(); sync(); });
  $("[data-kgs-preview]").addEventListener("click", () => { try { preview(); } catch (_) {} });

  $("[data-kgs-atlas]").addEventListener("click", () => { close(); document.getElementById("mapBtn").click(); });
  $("[data-kgs-history]").addEventListener("click", () => {
    if (confirm("Сбросить историю открытых стран и просмотренных фильмов?")) { document.getElementById("resetHist").click(); sync(); }
  });
  $("[data-kgs-reset]").addEventListener("click", () => {
    if (confirm("Сбросить все настройки приложения к значениям по умолчанию?")) { document.getElementById("resetSettings").click(); sync(); }
  });
  $("[data-kgs-tab=globe]").addEventListener("click", () => { close(); window.scrollTo({top:0,behavior:"smooth"}); });
  $("[data-kgs-tab=collections]").addEventListener("click", () => { close(); const link=document.querySelector('[data-path="podborki-i-zhanry"]'); if(link)link.click(); });
  $("[data-kgs-tab=journey]").addEventListener("click", () => { close(); document.getElementById("mapBtn").click(); });
  $("[data-kgs-tab=history]").addEventListener("click", () => { close(); document.getElementById("mapBtn").click(); });
  soundSelect?.addEventListener("change", sync);
  sync();
})();
