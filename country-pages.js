/* Country atlas and country passport, powered by the existing TMDB key/history. */
(() => {
  const app = window.KGCountryApp;
  const dialog = document.getElementById('journey');
  const shell = dialog?.querySelector('.kg-in');
  const map = document.getElementById('mapbox');
  const zin = document.getElementById('mzin');
  const zout = document.getElementById('mzout');
  if (!app || !dialog || !shell || !map) return;

  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt = value => new Intl.NumberFormat(interfaceLanguage).format(Number(value) || 0);
  const flag = code => `<span class="kgc-flag-mark" data-flag="${code}" aria-hidden="true">${app.countryFlag(code)}</span>`;
  const fabricPath = 'assets/flags/flag-fabric.jpg';
  const flagBackdrop = code => `
    <div class="kgc-flag-backdrop" data-flag="${code}" aria-hidden="true">
      <svg class="kgc-flag-filter" width="0" height="0" focusable="false">
        <filter id="kgc-fabric-folds" x="0%" y="0%" width="100%" height="100%" color-interpolation-filters="sRGB">
          <feFlood flood-color="#808080" result="neutral"/>
          <feImage href="${fabricPath}" preserveAspectRatio="xMidYMid slice" result="fabricPhoto"/>
          <feComposite in="fabricPhoto" in2="neutral" operator="over" result="fabric"/>
          <feGaussianBlur in="fabric" stdDeviation="6" edgeMode="duplicate" result="folds"/>
          <feComponentTransfer in="folds" result="surface">
            <feFuncR type="linear" slope=".72" intercept=".15"/>
            <feFuncG type="linear" slope=".72" intercept=".50"/>
          </feComponentTransfer>
          <feDisplacementMap in="SourceGraphic" in2="surface" scale="40" xChannelSelector="R" yChannelSelector="G" result="draped"/>
          <feComponentTransfer in="fabric" result="lighting">
            <feFuncR type="linear" slope=".83" intercept=".14"/>
            <feFuncG type="linear" slope=".80" intercept=".12"/>
            <feFuncB type="linear" slope=".80" intercept=".10"/>
          </feComponentTransfer>
          <feBlend in="lighting" in2="draped" mode="hard-light"/>
          <feComposite in2="draped" operator="in"/>
        </filter>
      </svg>
      <div class="kgc-flag-art">${app.countryFlag(code)}</div>
    </div>`;
  const year = film => String(film?.release_date || '').slice(0, 4) || uiText("Год неизвестен");
  const poster = (film, size='w342') => film?.poster_path ? `https://image.tmdb.org/t/p/${size}${film.poster_path}` : '';
  const root = document.createElement('div');
  root.id = 'kg-country-app';
  shell.prepend(root);
  const fabric = new Image();
  fabric.onload = () => {
    // File URLs can restrict SVG filter access to a separate image.
    root.dataset.flagFabric = location.protocol === 'file:' ? 'overlay' : 'filter';
  };
  fabric.src = fabricPath;
  shell.querySelectorAll(':scope > :not(#kg-country-app)').forEach(el => el.classList.add('kg-country-legacy'));
  map.classList.remove('kg-country-legacy');
  const parkedMap = document.createElement('div');
  parkedMap.className = 'kg-country-legacy';
  shell.append(parkedMap);
  const mapControls = document.createElement('div');
  mapControls.className = 'kgc-map-controls';
  if (zin && zout) mapControls.append(zout, zin);
  function parkAtlasMap() {
    parkedMap.append(map, mapControls);
  }
  parkAtlasMap();

  const style = document.createElement('style');
  style.textContent = `
    #journey.kg-dlg{width:min(100vw,520px);max-width:100vw;height:100dvh;max-height:100dvh;border-radius:0;background:rgb(var(--kg-surface-container-lowest));border-color:rgb(var(--kg-surface-border-subtle))}
    #journey .kg-in{padding:0;gap:0;height:100dvh;max-height:100dvh;overflow:auto;scroll-behavior:smooth}
    #journey .kg-country-legacy{display:none!important}
    #kg-country-film-dialog{width:min(100vw,520px);max-width:100vw;max-height:100dvh;margin:auto;overflow:auto;overscroll-behavior:contain}
    #kg-country-film-dialog .kgc-head{z-index:10}
    #kg-country-app{font-family:'Plus Jakarta Sans',sans-serif;color:#e8e0ea;min-height:100%;background:radial-gradient(ellipse at 90% 14%,rgba(134,26,69,.17),transparent 34%),rgb(var(--kg-surface-container-lowest))}
    .kgc-head{height:60px;padding:0 16px;display:flex;align-items:center;gap:12px;position:sticky;top:0;z-index:5;background:rgba(21,18,25,.92);backdrop-filter:blur(18px);border-bottom:1px solid rgba(255,220,168,.08)}
    .kgc-icon{border:0;background:transparent;color:#ffdca8;width:36px;height:40px;font-size:24px;cursor:pointer}.kgc-head-title{min-width:0;flex:1}.kgc-head-title b{font:600 17px 'Noto Serif',serif;color:#ffdca8;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kgc-head-title small,.kgc-muted{color:#b3a79a;font-size:11px}
    .kgc-pad{padding:16px}.kgc-panel{background:linear-gradient(145deg,rgba(34,30,38,.96),rgba(28,24,34,.92));border:1px solid rgba(255,220,168,.09);border-radius:18px;padding:15px;box-shadow:0 14px 36px rgba(0,0,0,.2)}
    .kgc-overview{position:relative;overflow:hidden;background:radial-gradient(ellipse at 95% 0,rgba(255,184,48,.14),transparent 42%),linear-gradient(135deg,rgb(var(--kg-surface-container)),rgb(var(--kg-surface)))}
    .kgc-kicker{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#ffdca8;font-weight:700}.kgc-statbig{font:600 35px 'Noto Serif',serif;color:#ffdca8;line-height:1.15}.kgc-title{font:600 22px/1.25 'Noto Serif',serif;color:#fdfbf7}.kgc-section{display:flex;justify-content:space-between;align-items:center;gap:8px;margin:23px 16px 10px}.kgc-section h3{margin:0;font:600 18px 'Noto Serif',serif;color:#f5e4cb}.kgc-grid3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.kgc-mini{background:rgb(var(--kg-surface-container-low));border-radius:14px;padding:12px;min-height:82px}.kgc-mini b{display:block;margin-top:9px;font:600 20px 'Noto Serif',serif;color:#ffdca8}.kgc-mini small{display:block;color:#b3a79a;font-size:11px;line-height:1.35;margin-top:2px}.kgc-progress{height:7px;background:rgb(var(--kg-surface-container-highest));border-radius:99px;overflow:hidden}.kgc-progress i{height:100%;display:block;background:linear-gradient(90deg,#d89120,#ffdca8);border-radius:inherit}.kgc-btn{border:0;border-radius:999px;padding:11px 15px;background:linear-gradient(100deg,#ffb830,#ffdaa0);color:#432c00;font-weight:700;font-size:13px;display:inline-flex;justify-content:center;align-items:center;gap:8px;cursor:pointer}.kgc-btn.secondary{background:#302a35;color:#ffdca8;border:1px solid rgba(255,220,168,.12)}.kgc-country-hero{position:relative;min-height:205px;overflow:hidden;border-radius:19px;display:flex;align-items:flex-end;background:linear-gradient(0deg,rgba(9,7,12,.96),rgba(9,7,12,.1)),linear-gradient(135deg,#332336,#17131d)}.kgc-country-hero:after{content:'';position:absolute;inset:0;background:linear-gradient(0deg,rgba(7,6,10,.96),rgba(7,6,10,.02) 78%)}.kgc-hero-content{position:relative;z-index:1;padding:17px;width:100%}.kgc-chips{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:9px}.kgc-chip{border-radius:99px;padding:5px 9px;background:rgba(134,26,69,.55);color:#ffd9e1;font-size:10px;font-weight:700}.kgc-chip.neutral{background:rgba(28,24,34,.82);color:#e8e0ea}.kgc-country-name{font:600 30px/1.15 'Noto Serif',serif;color:#ffdca8;margin:0}.kgc-country-name em{font:italic 15px 'Noto Serif',serif;color:#d5c4ad}.kgc-blurb{font:italic 14px/1.5 'Noto Serif',serif;color:#f3dfc1;margin:8px 0 14px;max-width:38em}.kgc-feature{display:grid;grid-template-columns:92px 1fr;gap:13px;align-items:start}.kgc-poster{width:92px;aspect-ratio:2/3;object-fit:cover;border-radius:9px;background:#302a35;box-shadow:0 9px 24px rgba(0,0,0,.34)}.kgc-filmname{font:600 18px/1.25 'Noto Serif',serif;color:#fdfbf7;margin:4px 0}.kgc-films-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;padding:0 16px}.kgc-filmcard{padding:0;overflow:hidden;text-align:left;background:rgb(var(--kg-surface-container-low));border:1px solid rgba(255,220,168,.08);border-radius:14px;color:#e8e0ea;cursor:pointer}.kgc-filmcard img,.kgc-filmph{width:100%;aspect-ratio:2/3;object-fit:cover;background:rgb(var(--kg-surface-container-high));display:flex;align-items:center;justify-content:center;color:#b3a79a;text-align:center;padding:8px}.kgc-filmcopy{padding:9px}.kgc-filmcopy b{font:600 14px/1.35 'Noto Serif',serif;display:block;min-height:38px}.kgc-filmcopy small{display:block;color:#b3a79a;font-size:10px;margin-top:4px}.kgc-rating{color:#ffdca8}.kgc-rowcards{display:flex;overflow:auto;gap:9px;padding:0 16px 5px}.kgc-person{flex:0 0 128px;text-align:center;padding:13px 9px;background:rgb(var(--kg-surface-container-low));border-radius:14px}.kgc-avatar{width:54px;height:54px;border-radius:50%;margin:0 auto 8px;background:linear-gradient(145deg,#6a3f24,#211b26);display:grid;place-items:center;color:#ffdca8;font:600 16px 'Noto Serif',serif;border:1px solid rgba(255,220,168,.3)}.kgc-map{padding:12px}.kgc-map #mapbox{min-height:125px;max-height:165px}.kgc-map #mapbox svg{width:100%!important}.kgc-map-controls{display:flex;align-items:center;gap:8px;padding-top:8px}.kgc-country-list{display:flex;flex-wrap:wrap;gap:7px}.kgc-country-pill{border:1px solid rgba(255,220,168,.1);border-radius:999px;background:rgb(var(--kg-surface-container));color:#d5c4ad;padding:7px 10px;font-size:11px;cursor:pointer}.kgc-country-pill.has{color:#ffdca8;border-color:rgba(255,184,48,.32)}.kgc-filter{display:flex;gap:7px;overflow:auto;padding:0 16px 10px}.kgc-filter button{white-space:nowrap;border:0;border-radius:999px;padding:7px 11px;background:rgb(var(--kg-surface-container));color:#b3a79a;font-size:11px;cursor:pointer}.kgc-filter button.active{background:#ffb830;color:#432c00;font-weight:700}.kgc-empty{color:#b3a79a;background:rgb(var(--kg-surface-container-low));border-radius:14px;padding:14px;font-size:13px;line-height:1.5}.kgc-foot{padding:18px 16px calc(env(safe-area-inset-bottom,0px) + 18px)}
    .kgc-country-tabs{display:flex;gap:8px;overflow-x:auto;padding:10px 12px 8px;background:#190e1b;scrollbar-width:thin;scrollbar-color:#6a485b transparent}.kgc-country-tab{flex:none;display:flex;align-items:center;justify-content:center;gap:7px;min-height:44px;padding:5px 11px;border:1px solid #523649;border-radius:99px;background:linear-gradient(145deg,#271725,#1a101e);color:#f5e8eb;font:600 13px 'Plus Jakarta Sans',sans-serif;white-space:nowrap;cursor:pointer}.kgc-flag-mark{position:relative;isolation:isolate;display:inline-grid;place-items:center;flex:none;width:32px;height:20px;overflow:hidden;border-radius:5px;background:#211b25;box-shadow:0 1px 5px #0008}.kgc-flag-mark :is(img,svg){display:block;width:100%;height:100%;object-fit:fill}.kgc-flag-mark:after{content:'';position:absolute;inset:0;pointer-events:none;border-radius:inherit;box-shadow:inset 0 1px 1px #fff6,inset 0 -3px 5px #0004;background:linear-gradient(130deg,#fff3,transparent 42%,#0003 92%)}.kgc-country-tab.active{border-color:#f4d386;background:linear-gradient(155deg,#251323,#443022);color:#ffe29d;box-shadow:inset 0 0 0 1px #f4d38666}.kgc-hero-full{min-height:390px;margin:0 0 18px;display:flex;align-items:flex-end;position:relative;isolation:isolate;clip-path:inset(0);background:#190e1b}.kgc-hero-full:after{content:'';position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,transparent 12%,#190e1b12 35%,#190e1b85 61%,#190e1b 95%)}.kgc-hero-copy{position:relative;z-index:1;width:100%;padding:20px 18px 18px;text-align:center}.kgc-hero-full .kgc-country-name{font-size:clamp(29px,8vw,45px);line-height:1.06;text-transform:uppercase;overflow-wrap:anywhere;text-shadow:0 3px 18px #000a}.kgc-hero-full .kgc-blurb{margin:9px auto 16px;max-width:34ch;font-size:16px;line-height:1.4;text-shadow:0 2px 12px #000}.kgc-action-row{display:flex;gap:8px}.kgc-action-row .kgc-btn{height:52px;flex:1;font-size:14px;box-shadow:0 10px 28px rgba(255,184,48,.3)}.kgc-icon-action{width:48px;height:48px;border:0;border-radius:50%;background:#302a35;color:#ffdca8;font-size:20px;cursor:pointer}.kgc-passport-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;padding:0 16px}.kgc-passport-tile{position:relative;min-height:112px;overflow:hidden;padding:12px;border-radius:15px;background:rgb(var(--kg-surface-container-low));display:flex;flex-direction:column;justify-content:space-between}.kgc-passport-tile:nth-child(4){background:linear-gradient(140deg,rgb(var(--kg-surface-container)),#302a35)}.kgc-passport-tile:after{content:attr(data-code);position:absolute;right:-3px;bottom:-18px;color:#ffffff09;font:600 54px 'Noto Serif',serif;pointer-events:none}.kgc-passport-label{display:flex;justify-content:space-between;gap:6px;color:#b3a79a;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase}.kgc-passport-value{margin-top:13px;color:#ffdca8;font:600 24px/1.15 'Noto Serif',serif}.kgc-passport-foot{margin-top:4px;color:#b3a79a;font-size:11px;line-height:1.4}.kgc-feature-card{margin:0 16px;background:rgb(var(--kg-surface-container-low));border-radius:18px;overflow:hidden;border:1px solid rgba(255,220,168,.16);box-shadow:0 15px 35px #0005;cursor:pointer}.kgc-feature-image{position:relative;height:clamp(185px,52vw,245px);position:relative;background-size:cover;background-position:center;background-color:#302a35}.kgc-feature-image:after{content:'';position:absolute;inset:0;background:linear-gradient(0deg,rgb(var(--kg-surface-container-low)),transparent 68%)}.kgc-feature-badge{position:absolute;z-index:1;top:11px;left:11px;padding:6px 9px;border-radius:99px;background:rgb(var(--kg-surface-container-lowest) / 0.867);color:#ffdca8;font-size:11px;font-weight:700}.kgc-feature-runtime{position:absolute;z-index:1;top:11px;right:11px;padding:6px 9px;border-radius:99px;background:rgb(var(--kg-surface-container-lowest) / 0.867);color:#e8e0ea;font-size:10px}.kgc-feature-copy{padding:0 14px 15px;margin-top:-18px;position:relative;z-index:2}.kgc-feature-title{font:600 22px/1.25 'Noto Serif',serif;color:#fdfbf7}.kgc-feature-original{font:italic 12px 'Noto Serif',serif;color:#b3a79a;margin-top:3px}.kgc-feature-meta{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin:9px 0}.kgc-feature-genre-list{display:flex;gap:6px;flex-wrap:wrap}.kgc-feature-cast{margin-top:8px;color:#d5c4ad;font:12px/1.45 'Plus Jakarta Sans',sans-serif}.kgc-account-icon{width:32px;height:32px!important;min-width:32px;border-radius:50%;background:#ffdfa4;color:#432c00}.kgc-head-title small.kgc-vip{display:inline-block;padding:3px 6px;border-radius:99px;background:#861a454d;color:#ffb1c5;font-size:9px;font-weight:700;letter-spacing:.08em}.kgc-live-dot{display:inline-block;width:6px;height:6px;margin-right:5px;border-radius:50%;background:#ffb1c5;box-shadow:0 0 8px #ffb1c5}.kgc-section-icon{color:#ffdca8;font-size:19px}.kgc-section-icon.rose{color:#ffb1c5}.kgc-person{flex-basis:224px;min-height:190px}.kgc-person .kgc-avatar{width:76px;height:76px;font-size:18px}.kgc-person img.kgc-avatar{object-fit:cover}.kgc-person b{font-size:14px!important}.kgc-person small{line-height:1.45;font-size:11px}.kgc-filmcard{min-width:0}.kgc-film-actions{display:flex;justify-content:space-between;align-items:center;gap:5px}.kgc-film-save{width:30px;height:30px;border:0;border-radius:50%;background:rgb(var(--kg-surface-container-lowest) / 0.800);color:#ffdca8;display:grid;place-items:center;cursor:pointer}.kgc-load-more{grid-column:1/-1;width:100%;margin:4px 0 0}.kgc-location-card{height:222px;position:relative;overflow:hidden;border-radius:18px;background:radial-gradient(ellipse at 50% 42%,#563f30,#211b27 50%,#111018);border:1px solid #ffffff12}.kgc-location-grid{position:absolute;inset:0;background-image:linear-gradient(#ffdca811 1px,transparent 1px),linear-gradient(90deg,#ffdca811 1px,transparent 1px);background-size:32px 32px;opacity:.42;transform:perspective(270px) rotateX(24deg) scale(1.35)}.kgc-location-ping{position:absolute;left:50%;top:40%;width:58px;height:58px;display:grid;place-items:center;border-radius:50%;background:#ffb830;color:#432c00;font:700 13px 'Plus Jakarta Sans',sans-serif;box-shadow:0 0 0 12px #ffb83020,0 0 32px #ffb83088;transform:translate(-50%,-50%)}.kgc-location-copy{position:absolute;inset:auto 12px 12px;padding:12px;border-radius:13px;background:rgb(var(--kg-surface-container-lowest) / 0.851);backdrop-filter:blur(12px)}.kgc-location-copy b{font:600 14px 'Noto Serif',serif;color:#f5e4cb}.kgc-location-copy small{display:block;margin-top:4px;color:#b3a79a;font-size:11px;line-height:1.5}.kgc-back-profile{position:fixed;right:max(16px,calc((100vw - 520px)/2 + 16px));bottom:calc(env(safe-area-inset-bottom,0px) + 18px);z-index:4;border:0;border-radius:99px;padding:11px 15px;background:#302a35;color:#ffdca8;box-shadow:0 8px 22px #0008;font-size:12px;font-weight:700;cursor:pointer}.kgc-icon .material-symbols-outlined,.kgc-icon-action .material-symbols-outlined,.kgc-btn .material-symbols-outlined{font-size:20px;line-height:1}
    .kgc-head-title-row{display:flex;align-items:center;gap:6px;min-width:0}.kgc-head-title-row b{flex:0 1 auto;min-width:0;font-size:15px}.kgc-vip{flex:none;padding:3px 6px;border-radius:99px;background:#861a454d;color:#ffb1c5;font:700 8px 'Plus Jakarta Sans',sans-serif;letter-spacing:.06em}.kgc-section-icon{color:#ffdca8;font-size:20px}.kgc-section-icon.rose{color:#ffb1c5}.kgc-feature-badge .material-symbols-outlined{font-size:13px;vertical-align:-2px}.kgc-cast-label{color:#ffdca8;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}.kgc-inline-person{padding:0;border:0;background:transparent;color:#ffdca8;font:inherit;text-decoration:underline;text-decoration-color:#ffb83066;text-underline-offset:2px;cursor:pointer}.kgc-inline-person:hover{color:#ffb830}.kgc-icon .material-symbols-outlined,.kgc-icon-action .material-symbols-outlined,.kgc-btn .material-symbols-outlined{font-size:20px;line-height:1}.kgc-account-icon{width:32px;height:32px!important;min-width:32px;border-radius:50%;background:#ffdfa4;color:#432c00}.kgc-feature-genre-list{display:flex;gap:6px;flex-wrap:wrap}.kgc-head-title-row .kgc-vip{font-size:8px}.kgc-person{flex:0 0 224px;min-height:225px;padding:16px 13px 12px;display:flex;flex-direction:column;align-items:center;border:1px solid #ffffff0a;box-shadow:0 8px 18px #0002}.kgc-person-role{margin-top:3px;color:#ffb1c5;font-size:9px;letter-spacing:.08em;text-transform:uppercase}.kgc-person-films{display:-webkit-box;min-height:42px;overflow:hidden;-webkit-box-orient:vertical;-webkit-line-clamp:2;margin-top:7px;color:#d5c4ad!important;font:italic 11px/1.45 'Noto Serif',serif!important}.kgc-person-footer{width:100%;margin-top:auto;padding-top:10px;display:flex;justify-content:space-between;align-items:center;border-top:1px solid #ffffff0c;color:#b3a79a;font-size:10px}.kgc-person-footer .material-symbols-outlined{font-size:15px;color:#ffdca8}.kgc-person-name{margin-top:0;font-size:13px!important;text-align:center}
    @media(max-width:390px){.kgc-pad{padding:13px}.kgc-country-name{font-size:27px}.kgc-grid3{gap:6px}.kgc-mini{padding:10px 8px}.kgc-mini b{font-size:18px}.kgc-section h3{font-size:17px}.kgc-feature-image{height:150px}.kgc-passport-tile{min-height:104px;padding:10px}.kgc-vip{font-size:7px}.kgc-head{gap:8px;padding:0 10px}.kgc-head .kgc-icon{width:32px}}
    .kgc-country-tab:focus-visible{outline:2px solid #ffe29d;outline-offset:2px}
    .kgc-country-tab .kgc-flag-mark{width:clamp(28px,8.5vw,38px);height:auto;aspect-ratio:1.68;border-radius:5px}
    .kgc-flag-mark[data-flag="NP"] img,.kgc-flag-mark[data-flag="CH"] img{object-fit:contain}
    .kgc-flag-backdrop{position:absolute;inset:0;clip-path:inset(0);isolation:isolate}
    .kgc-flag-filter{position:absolute}
    .kgc-flag-art{position:absolute;inset:-13% -8% -8%;display:grid;place-items:center}
    [data-flag-fabric="filter"] .kgc-flag-art{filter:url(#kgc-fabric-folds)}
    [data-flag-fabric="overlay"] .kgc-flag-backdrop::after{
      content:'';position:absolute;inset:0;pointer-events:none;
      background:url("${fabricPath}") center / cover;mix-blend-mode:hard-light;opacity:.78
    }
    [data-flag-fabric="overlay"] .kgc-flag-backdrop[data-flag="NP"]::after{display:none}
    .kgc-flag-art .flag-emoji{font-size:clamp(72px,28vw,160px);line-height:1}
    .kgc-flag-art :is(img,svg){position:absolute;inset:0;display:block;width:100%;height:100%;object-fit:cover;object-position:center}
    .kgc-flag-backdrop[data-flag="AU"] img,.kgc-flag-backdrop[data-flag="NZ"] img{object-fit:fill}
    .kgc-hero-full .kgc-flag-backdrop{
      z-index:-1;bottom:auto;height:auto;aspect-ratio:1.44;
      mask-image:linear-gradient(#000 56%,#000c 77%,transparent 100%);
    }
    .kgc-hero-full .kgc-flag-backdrop[data-flag="NP"] img{object-fit:contain}
    .kgc-hero-copy .kgc-passport-label{display:flex;align-items:center;justify-content:center;gap:10px;margin:8px 0 0;color:#ffe29d;letter-spacing:.12em}
    @media(max-width:420px){
      .kgc-head-title-row .kgc-vip{display:none}
      .kgc-country-tab{gap:6px;padding-inline:9px;font-size:12px}
      .kgc-country-tab .kgc-flag-mark{width:28px}
    }
    .kgc-hero-full .kgc-country-name{color:#f9d389;letter-spacing:.025em}
    .kgc-hero-copy .kgc-passport-label::before,.kgc-hero-copy .kgc-passport-label::after{
      content:'';width:clamp(20px,8vw,43px);height:1px;background:linear-gradient(90deg,transparent,#f9d389,transparent)
    }
    .kgc-hero-full .kgc-blurb{font-family:'Noto Serif',serif;font-style:italic}
    #kg-watch-history .kgc-head h1{margin:0;font:700 19px 'Noto Serif',serif;color:#ffdca8}
    #kg-watch-history .kgc-diary-entry{width:100%;margin-bottom:12px}
    #kg-watch-history .note{grid-column:1/-1;color:#d5c4ad;font-size:13px}
    #kg-watch-history .jfilm{min-width:0;overflow-wrap:anywhere;cursor:pointer}
    #kg-watch-history .jfilm:focus-visible{outline:2px solid #ffdca8;outline-offset:2px}
    .kgc-catalog-link{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;margin:10px 0;padding:9px 10px;border:1px solid #ffdca832;border-radius:10px;background:rgb(var(--kg-surface-container-high));color:#ffdca8;text-align:left;font-weight:600;cursor:pointer}
    .kgc-catalog-link:hover{border-color:#ffdca8}
    .kgc-catalog-head{display:grid;grid-template-columns:76px 1fr 76px;gap:4px;background:rgb(var(--kg-surface) / 0.961)}
    .kgc-catalog-head h1{margin:0;text-align:center;font:700 20px 'Noto Serif',serif;color:#ffdca8}
    .kgc-catalog-head-actions{display:flex;align-items:center;justify-content:flex-end;gap:4px}
    .kgc-catalog-head .kgc-icon{display:grid;place-items:center}
    .kgc-catalog-head .kgc-icon .material-symbols-outlined{font-size:21px}
    .kgc-catalog-head .kgc-catalog-profile{width:32px;height:32px;border-radius:50%;background:#ffdca8;color:#432c00}
    .kgc-catalog{padding:14px clamp(12px,4.5vw,20px) 24px;display:grid;gap:20px;color:#d5c4ad;background:radial-gradient(ellipse at 50% 0,#ffb83012,transparent 190px),rgb(var(--kg-surface));font:500 13px/1.4 'Noto Serif',serif}
    .kgc-catalog-summary,.kgc-catalog-card,.kgc-catalog-bottom{min-width:0;border-radius:13px;background:rgb(var(--kg-surface-container));box-shadow:0 10px 20px rgb(var(--kg-surface-container-lowest) / 0.502)}
    .kgc-catalog-summary{display:grid;gap:12px;padding:16px}
    .kgc-catalog-summary-line,.kgc-catalog-metric{display:flex;align-items:center;justify-content:space-between;gap:8px}
    .kgc-catalog-summary-line strong,.kgc-catalog-metric strong{color:#ffdca8}
    .kgc-catalog-summary-line strong{font-size:11px;letter-spacing:.07em;text-transform:uppercase}
    .kgc-catalog-summary-line span{border-radius:99px;background:rgb(var(--kg-surface-container-highest));color:#ffdca8;padding:4px 8px;font-size:10px;font-weight:700;text-align:center}
    .kgc-catalog-metric b{font-size:30px;color:#ffdca8}
    .kgc-catalog-metric small{font-size:10px;text-align:right}
    .kgc-catalog-progress{height:8px;border-radius:8px;background:rgb(var(--kg-surface-container-highest));overflow:hidden}
    .kgc-catalog-progress span{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#ffb830,#ffdca8)}
    .kgc-catalog-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px}
    .kgc-catalog-stats div{display:grid;gap:1px;border-radius:8px;background:rgb(var(--kg-surface-container-high));padding:8px}
    .kgc-catalog-stats b{color:#ffdca8;font-size:15px}
    .kgc-catalog-stats div:nth-child(2) b{color:#ffb1c5}
    .kgc-catalog-stats div:nth-child(3) b{color:#e8e0ea}
    .kgc-catalog-pills{display:flex;gap:5px;overflow-x:auto;scrollbar-width:thin;padding-block:3px}
    .kgc-catalog-pill,.kgc-catalog-view button{border:0;background:rgb(var(--kg-surface-container-high));color:#d5c4ad;cursor:pointer}
    .kgc-catalog-pill{flex:none;padding:5px 9px;border-radius:8px;font:700 11px/1.4 'Noto Serif',serif;white-space:nowrap}
    .kgc-catalog-summary .kgc-catalog-pill{border-radius:99px}
    .kgc-catalog-pill[aria-pressed="true"]{background:#ffdca8;color:#432c00}
    .kgc-catalog-controls{display:grid;grid-template-columns:minmax(0,1fr);gap:7px;min-width:0}
    .kgc-catalog-search{display:flex;align-items:center;gap:8px;padding:0 12px;border-radius:12px;background:rgb(var(--kg-surface-container-low))}
    .kgc-catalog-search input{flex:1;min-width:0;width:100%;height:44px;padding:0;border:0;background:transparent;color:#e8e0ea;font:inherit;box-shadow:none}
    .kgc-catalog-search input:focus{box-shadow:none;outline:0}
    .kgc-catalog-search:focus-within,.kgc-catalog button:focus-visible{outline:2px solid #ffdca8;outline-offset:2px}
    .kgc-catalog-search .material-symbols-outlined{font-size:19px}
    .kgc-catalog-toolbar{display:flex;align-items:center;gap:6px;min-width:0}
    .kgc-catalog-toolbar .kgc-catalog-pills{min-width:0;flex:1}
    .kgc-catalog-view{display:flex;flex:none;gap:3px;padding:4px;border-radius:8px;background:rgb(var(--kg-surface-container-low))}
    .kgc-catalog-view button{display:grid;place-items:center;padding:5px;border-radius:5px;background:transparent}
    .kgc-catalog-view button[aria-pressed="true"]{background:rgb(var(--kg-surface-container-high));color:#ffdca8}
    .kgc-catalog-view .material-symbols-outlined{font-size:18px}
    .kgc-catalog-feed{display:grid;gap:16px}
    .kgc-catalog-feed[data-view="grid"]{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
    .kgc-catalog-card{overflow:hidden}
    .kgc-catalog-banner{position:relative;isolation:isolate;min-height:142px;display:grid;align-content:space-between;gap:20px;padding:12px}
    .kgc-catalog-banner .kgc-flag-backdrop{z-index:-2}
    .kgc-catalog-banner::after{content:'';position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,rgb(var(--kg-surface-container) / 0.333),rgb(var(--kg-surface-container) / 0.620) 45%,rgb(var(--kg-surface-container)))}
    .kgc-catalog-country{display:flex;align-items:center;gap:8px;min-width:0}
    .kgc-catalog-country h2{margin:0;color:#e8e0ea;font:700 17px/1.2 'Noto Serif',serif;overflow-wrap:anywhere}
    .kgc-catalog-banner h2{font-size:23px}
    .kgc-catalog-country small{font-size:11px;color:#ffdca8}
    .kgc-catalog-card-body{display:grid;gap:11px;padding:12px}
    .kgc-catalog-badges{display:flex;flex-wrap:wrap;gap:5px;justify-content:space-between}
    .kgc-catalog-badge{padding:3px 7px;border-radius:99px;background:rgb(var(--kg-surface));color:#ffdca8;font-size:10px;font-weight:700}
    .kgc-catalog-badge.open{background:#6b4c27}
    .kgc-catalog-banner .kgc-catalog-badge.open{background:#ffb830;color:#432c00}
    .kgc-catalog-film{display:flex;align-items:center;gap:10px;width:100%;border:0;border-radius:9px;background:rgb(var(--kg-surface-container-high));padding:8px;text-align:left;color:#d5c4ad;cursor:pointer}
    .kgc-catalog-film img,.kgc-catalog-poster-placeholder{width:55px;aspect-ratio:2/3;border-radius:5px;background:rgb(var(--kg-surface-container-low));object-fit:cover;flex:none}
    .kgc-catalog-poster-placeholder{display:grid;place-items:center;color:#ffdca8}
    .kgc-catalog-film b,.kgc-catalog-film small{display:block}
    .kgc-catalog-film b{color:#e8e0ea;font-size:15px;line-height:1.25}
    .kgc-catalog-film small{font-size:11px}
    .kgc-catalog-actions{display:flex;align-items:center;flex-wrap:wrap;gap:6px}
    .kgc-catalog-action{display:inline-flex;align-items:center;justify-content:center;min-height:36px;gap:5px;padding:7px 10px;border:0;border-radius:8px;background:rgb(var(--kg-surface-container-high));color:#ffdca8;font:700 12px 'Noto Serif',serif;cursor:pointer}
    .kgc-catalog-action.primary{background:linear-gradient(110deg,#ffbf43,#f4a633);color:#432c00;box-shadow:0 4px 12px #ffb83040}
    .kgc-catalog-card p{margin:0}
    .kgc-catalog-bottom{display:grid;gap:10px;padding:16px;background:linear-gradient(rgb(var(--kg-surface-container-high)),rgb(var(--kg-surface-container)) 70%,#21141e)}
    .kgc-catalog-bottom h2{margin:0;color:#e8e0ea;font:700 20px/1.2 'Noto Serif',serif}
    .kgc-catalog-bottom p{margin:0}
    .kgc-catalog-bottom button{border-radius:99px;min-height:44px}
    .kgc-catalog-empty{grid-column:1/-1;padding:18px 0;text-align:center}
    .kgc-catalog [hidden]{display:none}
  `;
  document.head.appendChild(style);

  const data = () => ({counts:app.counts(), watched:app.watched(), countries:app.countries()});
  const countsTotal = counts => Object.values(counts).reduce((n,v)=>n+(Number(v)||0),0);
  const sortedCountries = () => {
    const {counts,countries}=data();
    return countries.slice().sort((a,b)=>(counts[b]||0)-(counts[a]||0)||app.countryName(a).localeCompare(app.countryName(b),'ru'));
  };
  const filmDialog = document.createElement('dialog');
  filmDialog.id = 'kg-country-film-dialog';
  filmDialog.className = 'kg-dlg';
  filmDialog.setAttribute('aria-labelledby', 'kg-country-film-heading');
  filmDialog.innerHTML = `
    <header class="kgc-head">
      <button type="button" class="kgc-icon" data-country-film-back aria-label="${uiText("Назад")}">
        <span class="material-symbols-outlined" aria-hidden="true">arrow_back</span>
      </button>
      <div class="kgc-head-title"><b id="kg-country-film-heading">${uiText("Фильм")}</b></div>
    </header>
    <div id="kg-country-film-detail" class="kgc-pad"></div>`;
  dialog.appendChild(filmDialog);
  const filmDetail = filmDialog.querySelector('#kg-country-film-detail');
  const filmBackButton = filmDialog.querySelector('[data-country-film-back]');
  let filmOpener = null;

  function openMovie(film, opener, autoplayTrailer = false) {
    if (!dialog.open || filmDialog.open || !window.KGOpenFilmFromRelated) return;
    filmOpener = opener;
    window.KGOpenFilmFromRelated({
      ...film,
      _cc: film.origin_country?.[0] || film._kgCountry || '',
      _kgGlobalRelated: true,
      originalTitle: film.original_title,
      average: film.vote_average,
      votes: film.vote_count
    }, 'related', filmDetail.id, {autoplayTrailer});
    filmDialog.showModal();
    filmDialog.scrollTop = 0;
    filmBackButton.focus({preventScroll:true});
  }

  filmDialog.addEventListener('click', event => {
    if (event.target === filmDialog || event.target.closest('[data-country-film-back]')) {
      filmDialog.close();
      return;
    }
    const closeButton = event.target.closest('[data-act="close-film"]');
    if (!closeButton) return;
    const related = closeButton.closest('[data-kg-related-detail]');
    if (related) window.KGCloseFilmFromRelated?.(related.id);
    else filmDialog.close();
  });
  filmDialog.addEventListener('close', () => {
    if (filmDialog.open) return;
    filmDetail.querySelectorAll('[data-kg-related-detail]').forEach(panel => window.KGCloseFilmFromRelated?.(panel.id));
    window.KGCloseFilmFromRelated?.(filmDetail.id);
    if (dialog.open && filmOpener?.isConnected) filmOpener.focus({preventScroll:true});
    filmOpener = null;
  });

  function atlas(){
    parkAtlasMap();
    root.dataset.page='atlas';
    delete root.dataset.code;
    const {counts,watched,countries}=data();
    const opened=countries.filter(c=>counts[c]>0).length;
    const total=countsTotal(counts), pct=Math.round(opened/Math.max(1,countries.length)*100);
    const ordered=sortedCountries(); const leader=ordered.find(c=>counts[c]);
    const latest=watched.slice().sort((a,b)=>String(b.watchedAt||'').localeCompare(String(a.watchedAt||'')))[0];
    const seenCountries=ordered.filter(c=>counts[c]);
    const latestCountry=latest?.cc || latest?.countries?.[0] || '';
    root.innerHTML=`
      <div class="kgc-head"><button class="kgc-icon" data-atlas-close aria-label="${uiText("Закрыть")}">←</button><div class="kgc-head-title"><b>${uiText("Атлас открытий")}</b><small>${uiText("Кинематограф мира · {count} стран", {count: countries.length})}</small></div><span style="font-size:21px">🌍</span></div>
      <div class="kgc-pad"><section class="kgc-panel kgc-overview">
        <div style="display:flex;justify-content:space-between;gap:8px"><span class="kgc-kicker">${uiText("✦ Киноэкспедиция")}</span><span class="kgc-chip neutral">${opened?uiText("{opened} / {total} открыто", {opened, total: countries.length}):uiText("Начало пути")}</span></div>
        <div style="display:flex;align-items:center;gap:14px;margin:9px 0 4px"><div class="kgc-statbig">${opened}<span style="font-size:20px;color:#d5c4ad"> / ${countries.length}</span></div><div style="margin-left:auto;text-align:center"><button class="kgc-btn secondary" data-map-zoom>${uiText("＋　Карта")}</button></div></div>
        <button type="button" class="kgc-catalog-link" data-open-catalog>${uiText("Страны мирового кинематографа")} <span aria-hidden="true">→</span></button>
        <div class="kgc-progress"><i style="width:${pct}%"></i></div><div style="display:flex;justify-content:space-between;margin-top:7px" class="kgc-muted"><span>${uiText("{count} просмотренных фильмов", {count: fmt(total)})}</span><span>${uiText("{count} не открыто", {count: countries.length - opened})}</span></div>
        <div style="display:flex;align-items:center;gap:8px;margin-top:15px;color:#d5c4ad;font:12px 'Noto Serif',serif"><span>☝</span><span>${uiText("Выберите страну на карте или в списке ниже")}</span></div>
      </section></div>
      <div class="kgc-pad" style="padding-top:0"><div class="kgc-grid3">
        <div class="kgc-mini"><span>🎞</span><b>${fmt(total)}</b><small>${uiText("Фильмов просмотрено")}</small></div>
        <div class="kgc-mini"><span>🌐</span><b>${opened} / ${countries.length}</b><small>${uiText("Стран открыто")}</small></div>
        <div class="kgc-mini"><span>✦</span><b>${opened?`${(total/Math.max(1,opened)).toFixed(1)}`:'0'}</b><small>${uiText("Фильмов на страну")}</small></div>
      </div></div>
      <div class="kgc-section"><h3>${uiText("🏆 Чаще всего в зале")}</h3><span class="kgc-chip neutral">${uiText("Лидер кинопутешествия")}</span></div>
      ${leader?`<button class="kgc-pad" data-open-country="${leader}" style="display:block;width:100%;text-align:left;border:0;background:transparent;padding-top:0"><div class="kgc-panel kgc-country-hero">${flagBackdrop(leader)}<div class="kgc-hero-content"><div class="kgc-chips"><span class="kgc-chip">${flag(leader)} ${uiText("Сеансов: {count}", {count: fmt(counts[leader])})}</span><span class="kgc-chip neutral">${uiText("№ {rank} в ваших открытиях", {rank: String(ordered.indexOf(leader)+1).padStart(2,'0')})}</span></div><h2 class="kgc-country-name">${esc(app.countryName(leader))}</h2><p class="kgc-blurb">${uiText("Ваша личная кинематографическая карта этой страны. Откройте паспорт, чтобы увидеть отмеченные фильмы.")}</p><span class="kgc-btn">${uiText("Открыть паспорт страны　↗")}</span></div></div></button>`:`<div class="kgc-pad" style="padding-top:0"><div class="kgc-panel"><div class="kgc-title">${uiText("Ваше первое кинооткрытие")}</div><p class="kgc-muted">${uiText("Отметьте просмотренный фильм — и страна его производства появится в атласе.")}</p><button class="kgc-btn secondary" data-open-map>${uiText("Перейти к глобусу　↗")}</button></div></div>`}
      <div class="kgc-section"><h3>${uiText("◎ Последнее открытие")}</h3><span class="kgc-muted">${latest?new Date(latest.watchedAt||Date.now()).toLocaleDateString(interfaceLanguage):uiText("История пока пуста")}</span></div>
      ${latest?`<div class="kg-bookmark-card"><button data-open-saved="${esc(latest.id)}" class="kgc-pad" style="display:block;width:100%;text-align:left;border:0;background:transparent;padding-top:0"><div class="kgc-panel kgc-feature">${poster(latest,'w185')?`<img class="kgc-poster" src="${poster(latest,'w185')}" alt="">`:'<div class="kgc-poster"></div>'}<span><span class="kgc-chip">${uiText("Просмотрено")}</span><b class="kgc-filmname">${esc(latest.title||uiText("Фильм"))}</b><small class="kgc-muted">${esc([latest.year,latestCountry?app.countryName(latestCountry):''].filter(Boolean).join(' · '))}</small></span></div></button>${kgBookmarkButton(latest,"hero")}</div>`:`<div class="kgc-pad" style="padding-top:0"><div class="kgc-empty">${uiText("Здесь появится последний фильм, который вы отметили как просмотренный.")}</div></div>`}
      <div class="kgc-section"><h3>${uiText("🌐 Атлас кинолокаций")}</h3><span class="kgc-muted">${uiText("{count} отмечено", {count: opened})}</span></div>
      <div class="kgc-pad" style="padding-top:0"><div class="kgc-panel kgc-map"><div id="kg-country-map-host"></div><div class="kgc-map-controls"><span class="kgc-muted" style="flex:1">${uiText("Нажмите на отмеченную страну")}</span><button class="kgc-btn secondary" data-open-globe>${uiText("Развернуть глобус")}</button></div></div></div>
      ${seenCountries.length?`<div class="kgc-section"><h3>${uiText("Открытые страны")}</h3><span class="kgc-muted">${seenCountries.length}</span></div><div class="kgc-pad" style="padding-top:0"><div class="kgc-country-list">${seenCountries.map(c=>`<button class="kgc-country-pill has" data-open-country="${c}">${flag(c)} ${esc(app.countryName(c))} · ${counts[c]}</button>`).join('')}</div></div>`:''}
      <div class="kgc-pad" style="padding-top:0"><button type="button" class="kgc-catalog-link" data-open-catalog="all">${uiText("Все страны")} <span aria-hidden="true">→</span></button></div>
      <div class="kgc-foot"><button class="kgc-btn secondary" data-atlas-close style="width:100%">${uiText("Закрыть атлас")}</button></div>`;
    const mapHost=root.querySelector('#kg-country-map-host');
    if (mapHost) mapHost.append(map, mapControls);
  }

  const catalogRegions = {
    'Азия': 'JP KR CN HK TW IN TR IR IL LB TH VN ID PH MY SG PK KZ GE AM AZ UZ IQ JO SA AE BD LK NP MN KH MM',
    'Америка': 'US CA MX BR AR CL CO PE CU UY VE EC BO PY CR DO',
    'Африка': 'EG MA NG ZA TN DZ SN KE GH ET BF ML CI',
    'Океания': 'AU NZ'
  };
  const countryRegion = new Map(Object.entries(catalogRegions)
    .flatMap(([region, codes]) => codes.split(' ').map(code => [code, region])));
  const regionFor = code => countryRegion.get(code) || 'Европа';
  const creditedCountries = film => film.countries?.length ? film.countries : [film.cc];
  const normalizeCatalogText = value => String(value ?? '').toLowerCase().normalize('NFC')
    .replaceAll('ё', 'е').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  const catalog = {status:null, region:'all', view:'cards', query:'', scroll:0, atlasScroll:0};
  const regionNames = ['ru', 'en'].map(locale => new Intl.DisplayNames([locale], {type:'region'}));
  const countryNames = new Map(app.countries().map(code => [code, [
    app.countryName(code), ...regionNames.map(names => names.of(code)),
    ...(HIST[code] ? [HIST[code], window.KGInterfaceDictionaries?.en?.[HIST[code]]] : [])
  ].map(normalizeCatalogText)]));
  let catalogSearch = null;
  let catalogSearchTimer;

  async function searchCatalogCountries(query, key, signal) {
    const request = async (path, params = {}) => {
      const url = new URL('https://api.themoviedb.org/3/' + path);
      url.search = new URLSearchParams({api_key:key, ...params});
      const response = await fetch(url, {signal});
      if (!response.ok) throw new Error('TMDB HTTP ' + response.status);
      return response.json();
    };
    const language = /\p{Script=Cyrillic}/u.test(query) ? 'ru-RU' : 'en-US';
    const params = {query, language, include_adult:'false'};
    let partial = false;
    const gather = async requests => {
      const results = await Promise.allSettled(requests);
      signal.throwIfAborted();
      if (results.some(result => result.status === 'rejected')) partial = true;
      return results.flatMap(result => result.status === 'fulfilled' ? [result.value] : []);
    };
    const [movies, directors] = await Promise.all([
      gather([request('search/movie', params)]),
      gather([request('search/person', params)])
    ]);
    const people = (directors[0]?.results || []).slice().sort((a, b) =>
      Number(b.known_for_department === 'Directing') - Number(a.known_for_department === 'Directing'));
    const credits = await gather(people.slice(0, 4).map(person => request('person/' + person.id + '/movie_credits')));
    const directed = credits.flatMap(credit => (credit.crew || [])
      .filter(film => film.job === 'Director' && !film.adult)
      .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0)).slice(0, 6));
    const candidates = [...(movies[0]?.results || []).slice(0, 6), ...directed];
    const ids = [...new Set(candidates.map(film => film.id))].slice(0, 24);
    const countries = new Set();
    for (let offset = 0; offset < ids.length; offset += 6) {
      const details = await gather(ids.slice(offset, offset + 6).map(id => request('movie/' + id)));
      for (const film of details) {
        if (film.adult) continue;
        const codes = [...(film.origin_country || []), ...(film.production_countries || []).map(country => country.iso_3166_1)];
        for (const code of codes) countries.add(code);
      }
    }
    return {countries, partial};
  }

  function scheduleCatalogSearch() {
    const query = catalog.query.trim();
    const normalized = normalizeCatalogText(query);
    const key = app.key();
    if (catalogSearch?.query === query && catalogSearch.key === key && catalogSearch.status !== 'error') return;
    clearTimeout(catalogSearchTimer);
    catalogSearch?.controller?.abort();
    catalogSearch = {query, key, countries:new Set(), status:''};
    if (normalized.length < 2 || [...countryNames].some(([code, names]) =>
      code.toLowerCase() === normalized || names.includes(normalized))) return;
    if (!key) {
      catalogSearch.status = 'key';
      return;
    }
    const search = catalogSearch;
    search.controller = new AbortController();
    search.status = 'loading';
    catalogSearchTimer = setTimeout(async () => {
      try {
        const {countries, partial} = await searchCatalogCountries(query, key, search.controller.signal);
        search.countries = countries;
        search.status = partial ? 'error' : '';
      } catch {
        search.status = 'error';
      }
      if (catalogSearch === search && dialog.open && root.dataset.page === 'catalog') paintCatalogFeed();
    }, 350);
  }

  function catalogData() {
    const watched = app.watched().slice().sort((a,b) => String(b.watchedAt || '').localeCompare(String(a.watchedAt || '')));
    const byCountry = new Map();
    for (const film of watched) {
      for (const code of new Set(creditedCountries(film))) {
        if (!byCountry.has(code)) byCountry.set(code, []);
        byCountry.get(code).push(film);
      }
    }
    const rows = app.countries().map(code => ({
      code, name:app.countryName(code), region:regionFor(code), films:byCountry.get(code) || []
    })).sort((a,b) => b.films.length - a.films.length || a.name.localeCompare(b.name,interfaceLanguage));
    const opened = rows.filter(row => row.films.length).length;
    return {rows, watched, opened, total:rows.length, closed:rows.length-opened};
  }

  function catalogPill(field, value, label) {
    return `<button type="button" class="kgc-catalog-pill" data-catalog-filter="${field}" data-value="${value}" aria-pressed="${catalog[field] === value}">${esc(label)}</button>`;
  }

  function catalogSummary({opened, total, closed, watched}) {
    let planned = 0;
    try {
      const saved = JSON.parse(localStorage.getItem('kgBookmarks') || '[]');
      if (Array.isArray(saved)) planned = new Set(saved.map(String)).size;
    } catch (_) {}
    const percent = total ? Math.round(100 * opened / total) : 0;
    const dates = watched.map(film => Date.parse(film.watchedAt)).filter(Number.isFinite);
    const days = dates.length ? Math.max(1, Math.floor((Date.now()-Math.min(...dates))/86400000)+1) : 0;
    const pace = days ? uiText("{rate} / день", {rate: (dates.length/days).toLocaleString(interfaceLanguage,{maximumFractionDigits:1})}) : '—';
    return `
      <div class="kgc-catalog-summary-line"><strong>${uiText("✦ Киноэкспедиция · {count} стран", {count: total})}</strong><span>${uiText("{opened} / {total} открыто", {opened, total})}</span></div>
      <div class="kgc-catalog-metric"><span>${uiText("{opened} / {total} стран", {opened: `<b>${opened}</b>`, total})} (${percent}%)</span><small>${uiText("{count} не исследовано", {count: closed})}</small></div>
      <div class="kgc-catalog-progress" role="progressbar" aria-label="${uiText("Открыто стран")}" aria-valuemin="0" aria-valuenow="${opened}" aria-valuemax="${total}"><span style="width:${percent}%"></span></div>
      <div class="kgc-catalog-stats"><div>${uiText("Сеансы")}<b>${fmt(watched.length)}</b></div><div>${uiText("В планах")}<b>${fmt(planned)}</b></div><div>${uiText("Темп")}<b>${pace}</b></div></div>
      <div class="kgc-catalog-pills" role="group" aria-label="${uiText("Статус стран")}">
        ${catalogPill('status','all',uiText("Все ({count})", {count: total}))}
        ${catalogPill('status','opened',uiText("Открытые ({count})", {count: opened}))}
        ${catalogPill('status','unopened',uiText("Неисследованные ({count})", {count: closed}))}
      </div>`;
  }

  function catalogCard(row, rank, hero) {
    const {code, name, region, films} = row;
    const film = films[0];
    const heading = `<div class="kgc-catalog-country">${flag(code)}<div><h2>${esc(name)}</h2><small>${esc(uiText(region))}</small></div></div>`;
    const badges = `<div class="kgc-catalog-badges"><span class="kgc-catalog-badge${film ? ' open' : ''}">${film ? uiText("✓ Открыта · №{rank}", {rank: String(rank).padStart(2,'0')}) : uiText("Не исследована")}</span>${film ? `<span class="kgc-catalog-badge">${uiText("Сеансы · {count}", {count: fmt(films.length)})}</span>` : ''}</div>`;
    const passport = `<button type="button" class="kgc-catalog-action${hero ? ' primary' : ''}" data-open-country="${code}" aria-label="${esc(uiText("Паспорт страны {country}", {country: name}))}">${uiText("Паспорт →")}</button>`;
    if (catalog.view === 'grid') {
      return `<article class="kgc-catalog-card"><div class="kgc-catalog-card-body">${heading}${badges}${passport}</div></article>`;
    }
    const directors = film && (film.director || (Array.isArray(film.dirs) ? film.dirs.join(', ') : film.dirs));
    const filmInfo = film ? [directors, film.year, film.score > 0 ? '★ '+film.score : '', film.runtime ? uiText("{minutes} мин", {minutes: film.runtime}) : ''].filter(Boolean).join(' · ') : '';
    const preview = film ? `<button type="button" class="kgc-catalog-film" data-open-saved="${esc(film.id)}">
        ${film.poster ? `<img loading="lazy" src="https://image.tmdb.org/t/p/w154${esc(film.poster)}" alt="">` : '<span class="kgc-catalog-poster-placeholder" aria-hidden="true">🎞</span>'}
        <span><small>${uiText("Последний сеанс")}</small><b>${esc(film.title || uiText("Фильм"))}</b><small>${esc(filmInfo)}</small></span>
      </button>` : '';
    const watchButton = film && window.KGWatchedButtonHtml
      ? window.KGWatchedButtonHtml(true, `data-catalog-unwatch="${Number(film.id)}"`)
      : '';
    return `<article class="kgc-catalog-card">
      ${hero ? `<div class="kgc-catalog-banner">${flagBackdrop(code)}${badges}${heading}</div>` : ''}
      <div class="kgc-catalog-card-body">
        ${hero ? '' : heading+badges}
        ${preview}
        <div class="kgc-catalog-actions">${passport}${watchButton}${kgBookmarkButton(film)}
          ${hero ? `<button type="button" class="kgc-catalog-action" data-catalog-feature="${code}">${uiText("Шедевр")}</button>` : ''}
        </div>
      </div>
    </article>`;
  }

  function paintCatalogFeed(data = catalogData()) {
    const feed = root.querySelector('#kgc-catalog-feed');
    if (!feed) return;
    const terms = normalizeCatalogText(catalog.query).split(' ').filter(Boolean);
    const search = catalogSearch;
    const status = {
      loading: "Ищем фильмы и режиссёров в TMDB…",
      key: "Для поиска по фильмам и режиссёрам добавьте ключ TMDB в настройках.",
      error: "Часть результатов TMDB недоступна. Попробуйте повторить поиск."
    }[search?.status];
    const feedback = root.querySelector('#kgc-catalog-search-status');
    feedback.hidden = !status;
    feedback.textContent = status ? uiText(status) : '';
    const matches = data.rows.map((row,index) => ({row, rank:index+1})).filter(({row}) => {
      if (catalog.region !== 'all' && row.region !== catalog.region) return false;
      if (catalog.status === 'opened' && !row.films.length) return false;
      if (catalog.status === 'unopened' && row.films.length) return false;
      const text = normalizeCatalogText([
        ...countryNames.get(row.code), row.code,
        ...row.films.flatMap(film => [film.title, film.original, film.director, film.dirs])
      ].join(' '));
      return terms.every(term => text.includes(term)) || search?.countries.has(row.code);
    });
    feed.dataset.view = catalog.view;
    feed.innerHTML = matches.length ? matches.map(({row,rank},index) => catalogCard(row,rank,index === 0)).join('')
      : search?.status === 'loading' ? ''
      : `<p class="kgc-catalog-empty">${uiText("Страны не найдены. Измените запрос или сбросьте фильтры.")}</p>`;
    root.querySelector('[data-catalog-reset]').hidden = matches.length > 0 || search?.status === 'loading';
  }

  function showCatalog(restoreScroll = false) {
    parkAtlasMap();
    root.dataset.page = 'catalog';
    delete root.dataset.code;
    const data = catalogData();
    catalog.status ??= data.opened ? 'opened' : 'all';
    const regions = ['Европа','Азия','Америка','Африка','Океания'];
    root.innerHTML = `
      <header class="kgc-head kgc-catalog-head">
        <button type="button" class="kgc-icon" data-catalog-exit aria-label="${uiText("Назад к атласу")}"><span class="material-symbols-outlined" aria-hidden="true">arrow_back</span></button>
        <h1>${uiText("Каталог стран")}</h1>
        <div class="kgc-catalog-head-actions">
          <button type="button" class="kgc-icon" data-catalog-focus aria-label="${uiText("Поиск и фильтры")}"><span class="material-symbols-outlined" aria-hidden="true">tune</span></button>
          <button type="button" class="kgc-icon kgc-catalog-profile" data-kga-account="true" aria-label="${uiText("Профиль")}"><span class="material-symbols-outlined" aria-hidden="true">person</span></button>
        </div>
      </header>
      <div class="kgc-catalog">
        <section class="kgc-catalog-summary" aria-label="${uiText("Прогресс путешествия")}">${catalogSummary(data)}</section>
        <div class="kgc-catalog-controls">
          <label class="kgc-catalog-search"><span class="material-symbols-outlined" aria-hidden="true">search</span><input id="kgc-catalog-search" type="search" aria-label="${uiText("Поиск по стране, режиссёру или фильму")}" placeholder="${uiText("Поиск по стране, режиссёру, фильму…")}" autocomplete="off" value="${esc(catalog.query)}"></label>
          <div class="kgc-catalog-toolbar">
            <div class="kgc-catalog-pills" role="group" aria-label="${uiText("Регионы")}">${catalogPill('region','all',uiText('Все регионы'))}
              ${regions.map(region => catalogPill('region',region,`${uiText(region)} (${data.rows.filter(row => row.region === region).length})`)).join('')}
            </div>
            <div class="kgc-catalog-view" role="group" aria-label="${uiText("Вид каталога")}">
              <button type="button" data-catalog-filter="view" data-value="cards" aria-label="${uiText("Карточки")}" aria-pressed="${catalog.view === 'cards'}"><span class="material-symbols-outlined" aria-hidden="true">view_agenda</span></button>
              <button type="button" data-catalog-filter="view" data-value="grid" aria-label="${uiText("Сетка")}" aria-pressed="${catalog.view === 'grid'}"><span class="material-symbols-outlined" aria-hidden="true">grid_view</span></button>
            </div>
          </div>
        </div>
        <p id="kgc-catalog-search-status" class="kgc-muted" role="status" hidden></p>
        <div id="kgc-catalog-feed" class="kgc-catalog-feed"></div>
        <button type="button" class="kgc-catalog-action" data-catalog-reset hidden>${uiText("Сбросить фильтры")}</button>
        <section class="kgc-catalog-bottom">
          <span class="kgc-kicker">${uiText("Глобальная навигация")}</span>
          <h2>${uiText("Мировая карта неисследованных территорий кино")}</h2>
          <p>${data.closed ? uiText("Стран без киносеансов в вашем паспорте · {count}", {count: data.closed}) : uiText("Вы открыли все страны каталога.")}</p>
          <button type="button" class="kgc-catalog-action primary" data-open-globe><span class="material-symbols-outlined" aria-hidden="true">public</span>${uiText("Вернуться к 3D-глобусу")}</button>
        </section>
      </div>`;
    scheduleCatalogSearch();
    paintCatalogFeed(data);
    shell.scrollTo({top:restoreScroll ? catalog.scroll : 0,behavior:'instant'});
  }

  async function openCatalogFeature(button) {
    const code = button.dataset.catalogFeature;
    if (!app.key()) {
      await app.searchCountry(code);
      return;
    }
    button.disabled = true;
    button.textContent = uiText("Загрузка…");
    try {
      const response = await app.getCountryFilms(code,1);
      if (!button.isConnected || !dialog.open) return;
      const film = pickCountryFeature(response.results);
      if (!film) {
        button.textContent = uiText("Фильмы не найдены");
        return;
      }
      openMovie({...film,_kgCountry:code},button);
      button.textContent = uiText("Шедевр");
    } catch (error) {
      button.textContent = uiText("Повторить");
      console.warn('[Kinoglobus] Не удалось загрузить фильм страны:',error);
    } finally {
      button.disabled = false;
    }
  }

  root.addEventListener('input', event => {
    if (event.target.id !== 'kgc-catalog-search') return;
    catalog.query = event.target.value;
    scheduleCatalogSearch();
    paintCatalogFeed();
  });

  root.addEventListener('click', async event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.hasAttribute('data-open-catalog')) {
      catalog.atlasScroll = shell.scrollTop;
      if (button.dataset.openCatalog === 'all') Object.assign(catalog,{status:'all',region:'all',query:''});
      showCatalog();
      root.querySelector('[data-catalog-exit]')?.focus({preventScroll:true});
    } else if (button.hasAttribute('data-catalog-exit')) {
      atlas();
      shell.scrollTo({top:catalog.atlasScroll || 0,behavior:'instant'});
      root.querySelector('[data-open-catalog]')?.focus({preventScroll:true});
    } else if (button.hasAttribute('data-catalog-focus')) {
      root.querySelector('#kgc-catalog-search')?.focus();
    } else if (button.dataset.catalogFilter) {
      const field = button.dataset.catalogFilter;
      catalog[field] = button.dataset.value;
      root.querySelectorAll(`[data-catalog-filter="${field}"]`).forEach(control => control.setAttribute('aria-pressed',String(control === button)));
      paintCatalogFeed();
    } else if (button.hasAttribute('data-catalog-reset')) {
      Object.assign(catalog,{status:'all',region:'all',query:''});
      showCatalog();
      root.querySelector('#kgc-catalog-search')?.focus();
    } else if (button.dataset.catalogFeature) {
      await openCatalogFeature(button);
    } else if (button.dataset.catalogUnwatch && window.KGUnmarkWatched) {
      button.disabled = true;
      try {
        await window.KGUnmarkWatched(button.dataset.catalogUnwatch);
      } catch (error) {
        console.warn('[Kinoglobus] Не удалось снять отметку просмотра:',error);
      } finally {
        button.disabled = false;
      }
    }
  });

  document.addEventListener('kg:watched-change', () => {
    if (root.dataset.page !== 'catalog') return;
    const data = catalogData();
    root.querySelector('.kgc-catalog-summary').innerHTML = catalogSummary(data);
    paintCatalogFeed(data);
    root.querySelector('.kgc-catalog-bottom p').textContent = data.closed
      ? uiText("Стран без киносеансов в вашем паспорте · {count}", {count: data.closed}) : uiText("Вы открыли все страны каталога.");
  });

  const state={code:'',films:[],total:0,page:1,filter:'all',marked:[],details:new Map(),loadingMore:false};
  const shortCountries=['JP','FR','KR','IT','AU','US'];
  const watchedFor=code=>app.watched().filter(f=>creditedCountries(f).includes(code));
  const localSavedFilm=f=>({id:f.id,title:f.title,original_title:f.original||'',release_date:f.year?f.year+'-01-01':'',poster_path:f.poster||null,vote_average:f.score||0,vote_count:f.votes||0,overview:f.overview||'',origin_country:f.countries||[f.cc],_kgCountry:f.cc});
  const favorites=()=>{try{return JSON.parse(localStorage.getItem('kgCountryFavorites')||'[]')}catch(_){return[]}};
  const isFavorite=code=>favorites().includes(code);
  const unique=a=>[...new Set(a.filter(Boolean))];
  // Bayesian rating prevents a tiny number of perfect scores from dominating the country feature.
  const countryScore=f=>{const votes=Number(f?.vote_count)||0,rating=Number(f?.vote_average)||0,priorVotes=1000,priorRating=6.6;return (votes/(votes+priorVotes))*rating+(priorVotes/(votes+priorVotes))*priorRating;};
  const pickCountryFeature=films=>{
    if(!films?.length)return null;
    const established=films.filter(f=>(Number(f.vote_count)||0)>=50);
    return (established.length?established:films).slice().sort((a,b)=>countryScore(b)-countryScore(a)||(Number(b.popularity)||0)-(Number(a.popularity)||0))[0]||null;
  };

  let passportFromCatalog = false;
  async function country(code){
    if(!app.countries().includes(code))return atlas();
    parkAtlasMap();
    if (root.dataset.page === 'catalog') catalog.scroll = shell.scrollTop;
    if (root.dataset.page !== 'country') passportFromCatalog = root.dataset.page === 'catalog';
    shell.scrollTo({top:0,behavior:"instant"});
    root.dataset.page='country';root.dataset.code=code;
    const marked=watchedFor(code);
    state.code=code;state.films=[];state.total=0;state.page=1;state.filter='all';state.marked=marked;state.details=new Map();
    renderCountry(code,[],0,marked,true);
    if(!app.key()){
      const local=marked.map(f=>({...localSavedFilm(f),_kgCountry:code}));
      renderCountry(code,local,local.length,marked,false,uiText("Для каталога TMDB добавьте ключ в настройках. Ваши просмотренные фильмы уже доступны."));return;
    }
    try{
      const result=await app.getCountryFilms(code,1);if(state.code!==code)return;
      const films=(result.results||[]).map(f=>({...f,_kgCountry:code}));
      state.films=films;state.total=result.total_results||0;
      renderCountry(code,films,state.total,marked,false);
      loadPeopleAndFeature(films,code);
    }catch(error){
      if(state.code!==code)return;
      const local=marked.map(f=>({...localSavedFilm(f),_kgCountry:code}));
      renderCountry(code,local,local.length,marked,false,uiText("Не удалось загрузить каталог TMDB. Ниже показаны ваши отмеченные фильмы."));
    }
  }

  function renderCountry(code,films,total,marked,loading=false,message=''){
    if(root.dataset.code!==code)return;
    state.code=code;state.films=films;state.total=total;state.marked=marked;
    const name=app.countryName(code),counts=app.counts(),nWatched=marked.length;
    const ratings=films.filter(f=>Number(f.vote_average)>0),avg=ratings.length?ratings.reduce((n,f)=>n+Number(f.vote_average),0)/ratings.length:0;
    const years=films.map(f=>Number(year(f))).filter(n=>n>1800),range=years.length?`${Math.min(...years)} — ${Math.max(...years)}`:'—';
    const featured=pickCountryFeature(films);
    const featureImage = featured?.backdrop_path ? `https://image.tmdb.org/t/p/w780${featured.backdrop_path}` : poster(featured,'w780');
    const tabs=unique([code,...Object.keys(counts).sort((a,b)=>(counts[b]||0)-(counts[a]||0)),...favorites(),...shortCountries]).filter(c=>app.countries().includes(c)).slice(0,7);
    const stamps=nWatched?Array.from({length:Math.min(3,nWatched)},(_,i)=>`<span class="w-7 h-7 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-bold inline-grid place-items-center">${i+1}</span>`).join(''):`<span class="kgc-muted">${uiText("Нет просмотренных лент")}</span>`;
    const genres=unique(films.flatMap(f=>f._genres||[])).slice(0,3);
    const editorial={JP:'«От самурайского эпоса Акиры Куросавы до анимационной магии Studio Ghibli и медитативного неонуара».',FR:'«От поэтического реализма и новой волны до авторского кино, которое меняет язык экрана».',KR:'«От пронзительных семейных драм до смелых жанровых историй и нового корейского нуара».',IT:'«От неореализма послевоенных улиц до барочной красоты итальянского авторского кино».',AU:'«Большие пейзажи, независимый дух и истории, в которых чувствуется дыхание целого континента».',US:'«От золотого века Голливуда до независимого кино — большая история американского экрана».',GB:'«Классическая школа актёрского мастерства, остроумные драмы и смелое британское кино».',DE:'«От экспрессионистских теней до точных, бескомпромиссных историй современного немецкого кино».',IN:'«Музыка, масштабные семейные саги и десятки кинематографических традиций одной страны».',PL:'«Поэтическое авторское кино и истории, оставившие глубокий след в мировой культуре».'}[code]||uiText("«Откройте для себя кино {country}: заметные авторы, истории и фильмы разных эпох».", {country: name});
    const latest=marked.slice().sort((a,b)=>String(b.watchedAt||'').localeCompare(String(a.watchedAt||'')))[0];
    root.innerHTML=`
      <header class="kgc-head"><button class="kgc-icon" data-atlas-back aria-label="${passportFromCatalog ? uiText("Назад к каталогу") : uiText("Назад к атласу")}"><span class="material-symbols-outlined">arrow_back</span></button><div class="kgc-head-title"><div class="kgc-head-title-row"><b>${uiText("Путешествие")}</b><span class="kgc-vip">${uiText("VIP СИНЕМАТЕКА")}</span></div></div><button class="kgc-icon" data-country-share="${code}" aria-label="${uiText("Поделиться")}"><span class="material-symbols-outlined">share</span></button><button class="kgc-icon" data-country-favorite="${code}" aria-label="${uiText("Добавить в избранное")}"><span class="material-symbols-outlined">${isFavorite(code)?'bookmark_added':'bookmark_add'}</span></button><button class="kgc-icon kgc-account-icon" data-kga-account aria-label="${uiText("Профиль")}"><span class="material-symbols-outlined">person</span></button></header>
      <div class="kgc-country-tabs" role="group" aria-label="${uiText("Выбор страны для просмотра")}">${tabs.map(c=>`<button type="button" class="kgc-country-tab ${c===code?'active':''}" data-open-country="${c}" aria-pressed="${c===code}">${flag(c)}<span>${esc(app.countryName(c))}</span></button>`).join('')}</div>
      <section class="kgc-hero-full">${flagBackdrop(code)}<div class="kgc-hero-copy"><h1 class="kgc-country-name">${esc(name)}</h1><span class="kgc-passport-label">${uiText("Кинопаспорт страны")}</span><p class="kgc-blurb">${esc(uiText(editorial))}</p><div class="kgc-action-row"><button type="button" class="kgc-btn" data-country-search="${code}"><span class="material-symbols-outlined">casino</span>${uiText("Найти фильм этой страны")}</button><button class="kgc-icon-action" data-country-scroll="locations" aria-label="${uiText("К атласу кинолокаций")}"><span class="material-symbols-outlined">auto_stories</span></button></div></div></section>
      ${message? `<p class="kgc-muted kgc-pad" style="margin:0;padding-top:0">${esc(message)}</p>` : ''}
      <div class="kgc-section" style="margin-top:7px"><div style="display:flex;align-items:center;gap:8px"><span class="material-symbols-outlined kgc-section-icon">badge</span><h3>${uiText("Синефильский паспорт")}</h3></div><span class="kgc-kicker">${nWatched?uiText("Статус: золотой"):uiText("Статус: новый")}</span></div>
      <section class="kgc-passport-grid"><article class="kgc-passport-tile" data-code="${esc(code)}"><div class="kgc-passport-label"><span>${uiText("Каталог")}</span><span class="material-symbols-outlined">movie</span></div><div><div class="kgc-passport-value">${loading?'…':fmt(total)}</div><div class="kgc-passport-foot">${uiText("фильмов в каталоге TMDB")}</div></div></article><article class="kgc-passport-tile"><div class="kgc-passport-label"><span>${uiText("Средний рейтинг")}</span><span class="kgc-rating">★ ${avg?avg.toFixed(1):'—'}</span></div><div><div class="kgc-passport-value">${avg?avg.toFixed(1):'—'}</div><div class="kgc-passport-foot">${uiText("средний балл первой страницы")}</div></div></article><article class="kgc-passport-tile"><div class="kgc-passport-label"><span>${uiText("Штампы")}</span><span class="material-symbols-outlined">verified</span></div><div style="display:flex;align-items:center;gap:5px;margin-top:12px">${stamps}${nWatched>3?`<span class="kgc-muted">+${nWatched-3}</span>`:''}</div><div class="kgc-passport-foot">${uiText("{count} просмотрено", {count: nWatched})}</div></article><article class="kgc-passport-tile"><div class="kgc-passport-label"><span>${uiText("Эпохи в выборке")}</span><span class="material-symbols-outlined">history_edu</span></div><div><div class="kgc-passport-value" style="font-size:17px">${range}</div><div class="kgc-passport-foot">${uiText("диапазон годов каталога")}</div></div></article></section>
      <div class="kgc-section"><div style="display:flex;align-items:center;gap:8px"><span class="material-symbols-outlined kgc-section-icon rose">military_tech</span><h3>${uiText("Рекомендуемый фильм")}</h3></div><span class="kgc-kicker">${featured?uiText("Выбор страны"):uiText("Каталог")}</span></div>
      ${featured?`<article class="kgc-feature-card" data-film-id="${featured.id}"><div class="kgc-feature-image" ${featureImage ? `style="background-image:url('${esc(featureImage)}')"` : ''}>${kgBookmarkButton(featured, "corner")}<span class="kgc-feature-badge"><span class="material-symbols-outlined">star</span> ${Number(featured.vote_average||0).toFixed(1)} / 10 · ${uiText("{count} оценок", {count: fmt(featured.vote_count || 0)})}</span><span class="kgc-feature-runtime" data-feature-runtime>${year(featured)}</span></div><div class="kgc-feature-copy"><div class="kgc-feature-title">${esc(featured.title||uiText("Фильм"))}</div><div class="kgc-feature-original">${esc(featured.original_title||'')}</div><div class="kgc-feature-original" data-feature-director>${uiText("Загружаем режиссёра…")}</div><div class="kgc-feature-meta"><span class="kgc-chip neutral">★ ${Number(featured.vote_average||0).toFixed(1)} · ${uiText("{count} оценок", {count: fmt(featured.vote_count || 0)})}</span><span class="kgc-chip neutral" data-feature-runtime-chip>${year(featured)}</span><span class="kgc-feature-genre-list" data-feature-genres></span></div><div class="kgc-feature-cast" data-feature-cast></div><p class="kgc-feature-desc">${esc((featured.overview||'').slice(0,260)||uiText("Описание пока недоступно в TMDB."))}</p><div class="kgc-feature-actions"><button type="button" class="kgc-btn velvet" data-film-id="${featured.id}" data-country-trailer><span class="material-symbols-outlined">play_arrow</span>${uiText("Трейлер")}</button><button type="button" class="kgc-btn secondary" data-film-id="${featured.id}">${uiText("О фильме")}　<span class="material-symbols-outlined">north_east</span></button></div></div></article>`:`<div class="kgc-pad"><div class="kgc-empty">${esc(message||uiText("Каталог TMDB пока не вернул фильмы для этой страны."))}</div></div>`}
      <div class="kgc-section"><div style="display:flex;align-items:center;gap:8px"><span style="color:#ffdca8">🎭</span><h3>${uiText("Мэтры кинематографа")}</h3></div><span class="kgc-kicker" data-master-count>TMDB</span></div><div class="kgc-rowcards" id="kg-country-people"><div class="kgc-empty">${loading?uiText("Загружаем участников…"):uiText("Для этого списка TMDB пока не вернул режиссёров.")}</div></div>
      <div class="kgc-section"><div style="display:flex;align-items:center;gap:8px"><span style="color:#ffdca8">▣</span><h3>${uiText("Коллекция картин")}</h3></div><span class="kgc-muted">${uiText("{count} лент", {count: fmt(total)})}</span></div><div class="kgc-filter">${[['all',uiText("Все ленты ({count})", {count: fmt(total)})],['classic',uiText("Золотая классика")],['newwave','1970–1999'],['modern','2000+']].map(([key,label])=>`<button class="${key==='all'?'active':''}" data-country-filter="${key}">${label}</button>`).join('')}</div><div class="kgc-films-grid" id="kg-country-films"></div>
      <section id="kg-country-locations"><div class="kgc-section"><div style="display:flex;align-items:center;gap:8px"><span style="color:#ffdca8">◎</span><h3>${uiText("Атлас кинолокаций")}</h3></div><span class="kgc-muted">${esc(code)}</span></div><div class="kgc-pad" style="padding-top:0"><div class="kgc-location-card"><div class="kgc-location-grid"></div><div class="kgc-location-ping">${esc(code)}</div><div class="kgc-location-copy"><b>${esc(uiText("{country} · Кинематограф", {country: name}))}</b><small>${uiText("TMDB не предоставляет координаты съёмок по этим фильмам. Откройте страну на глобусе и исследуйте отмеченные вами кинематографические открытия.")}</small><button type="button" class="kgc-btn secondary" data-country-globe="${code}" style="margin-top:9px;padding:8px 11px">${uiText("Показать на глобусе　↗")}</button></div></div></div></section>
      ${latest?`<div class="kgc-section"><h3>${uiText("Последняя отмеченная лента")}</h3></div><div class="kgc-pad" style="padding-top:0"><button class="kgc-country-pill has" data-open-saved="${esc(latest.id)}">${flag(code)} ${esc(latest.title||uiText("Фильм"))} · ${esc(latest.year||'')}</button></div>`:''}
      <div class="kgc-foot"><button class="kgc-btn secondary" data-atlas-back style="width:100%">${passportFromCatalog ? uiText("←　К каталогу стран") : uiText("←　К атласу открытий")}</button></div>`;
    paintFilms(films,state.filter);
  }

  async function loadPeopleAndFeature(films,code){
    const found=new Map();
    await Promise.all(films.slice(0,8).map(async film=>{
      try{
        const details=await app.getFilmDetails(film.id);if(state.code!==code)return;
        state.details.set(String(film.id),details);
        (details.dirsFull||[]).forEach(person=>{if(!person.id)return;if(!found.has(person.id))found.set(person.id,{...person,role:'Режиссёр',films:[]});const entry=found.get(person.id);if(film.title&&!entry.films.includes(film.title))entry.films.push(film.title);});
      }catch(_){ }
    }));
    if(state.code!==code)return;
    const people=root.querySelector('#kg-country-people');
    const directors=[...found.values()].slice(0,12);
    if(people)people.innerHTML=directors.length?directors.map(p=>`<button class="kgc-person" data-kg-person-id="${p.id}" data-kg-person-name="${esc(p.name)}" data-kg-person-role="Режиссёр">${p.photo?`<img class="kgc-avatar" src="https://image.tmdb.org/t/p/w185${p.photo}" alt="">`:`<span class="kgc-avatar">${esc(String(p.name||'К').split(/\s+/).map(x=>x[0]).slice(0,2).join(''))}</span>`}<b class="kgc-person-name">${esc(p.name)}</b><span class="kgc-person-role">${uiText("Режиссёр")}</span><small class="kgc-person-films">${(p.films||[]).slice(0,3).map(esc).join(' · ')||uiText("Фильмы в каталоге TMDB")}</small><span class="kgc-person-footer"><span>${uiText("Фильмов в выборке: {count}", {count: (p.films || []).length})}</span><span class="material-symbols-outlined">north_east</span></span></button>`).join(''):`<div class="kgc-empty">${uiText("TMDB не вернул режиссёров для первой страницы каталога.")}</div>`;
    const feature=pickCountryFeature(films);
    let details=feature&&state.details.get(String(feature.id));
    if(feature&&!details){try{details=await app.getFilmDetails(feature.id);state.details.set(String(feature.id),details)}catch(_){}}
    if(state.code!==code)return;
    if(details){
      const director=root.querySelector('[data-feature-director]');if(director)director.innerHTML=details.dirsFull?.length?`${uiText("Режиссёр ·")} ${details.dirsFull.slice(0,2).map(p=>`<button type="button" class="kgc-inline-person" data-kg-person-id="${p.id}" data-kg-person-name="${esc(p.name)}" data-kg-person-role="Режиссёр">${esc(p.name)}</button>`).join(', ')}`:uiText("Съёмочная группа не указана");
      const runtime=root.querySelector('[data-feature-runtime]');if(runtime)runtime.textContent=[details.runtime?uiText("{minutes} мин", {minutes: details.runtime}):'',year(feature)].filter(Boolean).join(' · ');
      const runtimeChip=root.querySelector('[data-feature-runtime-chip]');if(runtimeChip)runtimeChip.textContent=[details.runtime?uiText("{minutes} мин", {minutes: details.runtime}):'',year(feature)].filter(Boolean).join(' · ');
      const chips=root.querySelector('[data-feature-genres]');if(chips)chips.innerHTML=(details.genres||[]).slice(0,3).map(g=>`<span class="kgc-chip neutral">${esc(uiText(g))}</span>`).join('');
      const cast=root.querySelector('[data-feature-cast]');if(cast&&details.castFull?.length)cast.innerHTML=`<span class="kgc-cast-label">${uiText("В главных ролях")}</span> ${details.castFull.slice(0,5).map(p=>`<button type="button" class="kgc-inline-person" data-kg-person-id="${p.id}" data-kg-person-name="${esc(p.name)}" data-kg-person-role="Актёр">${esc(p.name)}</button>`).join(' · ')}`;
    }
    const masterCount=root.querySelector('[data-master-count]');if(masterCount)masterCount.textContent=uiText("Все ({count})", {count: directors.length});
  }

  function matchesFilter(f,filter){
    const y=Number(year(f));
    return filter==='classic'?y&&y<1970:filter==='newwave'?y>=1970&&y<2000:filter==='modern'?y>=2000:true;
  }
  function paintFilms(films,filter){
    const box=root.querySelector('#kg-country-films');if(!box)return;
    const filtered=films.filter(f=>matchesFilter(f,filter));
    box.innerHTML=filtered.length?filtered.map(f=>`<article class="kgc-filmcard" data-film-id="${f.id}"><div style="position:relative;display:block;aspect-ratio:2/3;background:rgb(var(--kg-surface-container-high));cursor:pointer" data-film-id="${f.id}" role="button" tabindex="0" aria-label="${esc(uiText("Открыть фильм {title}", {title: f.title}))}">${poster(f)?`<img loading="lazy" src="${poster(f)}" alt="${esc(uiText("Постер «{title}»", {title: f.title}))}" style="width:100%;height:100%;object-fit:cover">`:`<span class="kgc-filmph">${esc(f.title)}</span>`}<span class="kgc-feature-badge">★ ${Number(f.vote_average||0).toFixed(1)}</span>${kgBookmarkButton(f, "corner")}<span class="kgc-feature-runtime" style="top:auto;right:7px;bottom:7px">${esc(year(f))}</span></div><div class="kgc-filmcopy" data-film-id="${f.id}" role="button" tabindex="0"><b>${esc(f.title||uiText("Фильм"))}</b><small>${esc(year(f))}${f.original_title&&f.original_title!==f.title?` · ${esc(f.original_title)}`:''}</small><span class="kgc-film-actions"><small>TMDB · ★ ${Number(f.vote_average||0).toFixed(1)}</small></span></div></article>`).join(''):`<div class="kgc-empty" style="grid-column:1/-1">${uiText("В этой категории пока нет картин в загруженной части каталога.")}</div>`;
    if(films.length<state.total&&films.length>0)box.insertAdjacentHTML('beforeend',`<button class="kgc-btn secondary kgc-load-more" type="button" data-load-more>${state.loadingMore?uiText("Загружаем…"):uiText("Показать ещё фильмы")}</button>`);
  }

  const historyView = document.createElement('div');
  historyView.id = 'kg-watch-history';
  historyView.hidden = true;
  historyView.innerHTML = `
    <header class="kgc-head">
      <button type="button" class="kgc-icon" data-atlas-close aria-label="${uiText("Закрыть историю")}">←</button>
      <div class="kgc-head-title"><h1>${uiText("История просмотра")}</h1></div>
    </header>
    <div class="kgc-pad" data-kg-history-list>
      <button type="button" class="kgc-btn kgc-diary-entry" data-open-diary>
        <span class="material-symbols-outlined" aria-hidden="true">history_edu</span>
        <span>${uiText("Кинодневник")}</span>
      </button>
    </div>`;
  shell.append(historyView);
  historyView.querySelector('[data-open-diary]').addEventListener('click', () => {
    window.KGOpenCinemaDiary({closeParent: () => dialog.close()});
  });
  const historyList = document.getElementById('jfilms');
  historyList.classList.remove('kg-country-legacy');
  historyView.querySelector('[data-kg-history-list]').append(historyList);

  window.KGOpenWatchHistory = () => {
    parkAtlasMap();
    root.dataset.page = 'history';
    delete root.dataset.code;
    root.hidden = true;
    historyView.hidden = false;
    window.KGRenderWatchedByCountry('');
    if (!dialog.open) dialog.showModal();
    shell.scrollTo({top:0,behavior:'instant'});
    historyView.querySelector('button').focus({preventScroll:true});
  };

  function showAtlas() {
    root.hidden = false;
    historyView.hidden = true;
    atlas();
    shell.scrollTo({top:0,behavior:'instant'});
  }
  window.KGSelectWatchedCountry=country;
  const mapButton=document.getElementById('mapBtn');
  const originalMapClick=mapButton?.onclick;
  if(mapButton)mapButton.onclick=function(event){originalMapClick?.call(this,event);showAtlas();};
  document.addEventListener('click',event=>{
    const target=event.target.closest('[data-open-country],[data-atlas-back],[data-atlas-close],[data-country-search],[data-open-map],[data-open-globe],[data-map-zoom],[data-country-filter],[data-load-more],[data-country-scroll],[data-country-globe],[data-country-favorite],[data-country-share],[data-kga-account],[data-film-id],[data-open-saved]');
    if(!target || !dialog.contains(target) || filmDialog.contains(target))return;
    if(target.dataset.openCountry){country(target.dataset.openCountry);return;}
    if(target.hasAttribute('data-atlas-back')){
      if(passportFromCatalog) showCatalog(true);
      else {atlas();shell.scrollTo({top:0,behavior:'instant'});}
      return;
    }
    if(target.hasAttribute('data-atlas-close')){dialog.close?.();return;}
    if(target.dataset.countrySearch){const code=target.dataset.countrySearch;target.disabled=true;target.dataset.originalLabel=target.innerHTML;target.innerHTML=`<span class="material-symbols-outlined">progress_activity</span>${uiText("Ищем фильм…")}`;Promise.resolve(app.searchCountry(code)).catch(error=>console.warn('[Kinoglobus] Country search failed:',error)).finally(()=>{if(target.isConnected){target.disabled=false;target.innerHTML=target.dataset.originalLabel;}});return;}
    if(target.dataset.kgaAccount){window.KGOpenAccountPage?.('register');return;}
    if(target.dataset.countryFavorite){const code=target.dataset.countryFavorite,list=favorites(),next=list.includes(code)?list.filter(x=>x!==code):[...list,code];localStorage.setItem('kgCountryFavorites',JSON.stringify(next));target.innerHTML=`<span class="material-symbols-outlined">${next.includes(code)?'bookmark_added':'bookmark_add'}</span>`;target.setAttribute('aria-label',next.includes(code)?uiText("Убрать из избранного"):uiText("Добавить в избранное"));return;}
    if(target.dataset.countryShare){const code=target.dataset.countryShare,url=location.href.split('#')[0]+'#country-'+encodeURIComponent(code);if(navigator.share)navigator.share({title:app.countryName(code)+' · '+uiText('Киноглобус'),url}).catch(()=>{});else navigator.clipboard?.writeText(url).then(()=>{target.textContent='✓';setTimeout(()=>{if(target.isConnected)target.textContent='↗'},1200)}).catch(()=>{});return;}
    if(target.dataset.countryScroll){root.querySelector('#kg-country-'+target.dataset.countryScroll)?.scrollIntoView({behavior:'smooth',block:'start'});return;}
    if(target.dataset.countryGlobe){app.showCountryOnGlobe(target.dataset.countryGlobe);return;}
    if(target.dataset.countryFilter){state.filter=target.dataset.countryFilter;root.querySelectorAll('[data-country-filter]').forEach(b=>b.classList.toggle('active',b===target));paintFilms(state.films,state.filter);return;}
    if(target.hasAttribute('data-load-more')){loadMore();return;}
    if(target.hasAttribute('data-map-zoom')){root.querySelector('.kgc-map')?.scrollIntoView({behavior:'smooth',block:'center'});return;}
    if(target.hasAttribute('data-open-map')||target.hasAttribute('data-open-globe')){dialog.close?.();window.scrollTo({top:0,behavior:'smooth'});return;}
    if (target.dataset.filmId) {
      const film = state.films.find(item => String(item.id) === target.dataset.filmId);
      if (film) openMovie(film,target,target.hasAttribute('data-country-trailer'));
      return;
    }
    if (target.dataset.openSaved) {
      const film = app.watched().find(item => String(item.id) === target.dataset.openSaved);
      if (film) openMovie(localSavedFilm(film),target);
    }
  });
  async function loadMore(){
    if(state.loadingMore||state.films.length>=state.total||!app.key())return;
    state.loadingMore=true;paintFilms(state.films,state.filter);
    const code=state.code,page=state.page+1;
    try{const result=await app.getCountryFilms(code,page);if(state.code!==code)return;const known=new Set(state.films.map(f=>String(f.id)));state.films.push(...(result.results||[]).filter(f=>!known.has(String(f.id))).map(f=>({...f,_kgCountry:code})));state.page=page;paintFilms(state.films,state.filter);loadPeopleAndFeature(state.films,code);}
    catch(_){const more=root.querySelector('[data-load-more]');if(more)more.textContent=uiText("Не удалось загрузить · повторить");}
    finally{state.loadingMore=false;}
  }
  document.addEventListener('click',event=>{
    const hit=event.target.closest('#mapbox [data-c]');if(hit&&dialog.open){event.preventDefault();event.stopImmediatePropagation();country(hit.dataset.c);}
  },true);
  if(typeof window.renderJourney==='function'){
    const originalRender=window.renderJourney;
    window.renderJourney=function(){originalRender();showAtlas();};
  }
  dialog.addEventListener('close', () => {
    if (dialog.open) return;
    if (filmDialog.open) filmDialog.close();
    root.dataset.page = '';
    root.hidden = false;
    historyView.hidden = true;
  });
  function openSharedPassport() {
    const code = /^#country-([a-z]{2})$/i.exec(location.hash)?.[1].toUpperCase();
    if (!code || !app.countries().includes(code)) return;
    if (filmDialog.open) filmDialog.close();
    if (!dialog.open) dialog.showModal();
    showAtlas();
    country(code);
  }
  window.addEventListener('hashchange', openSharedPassport);
  openSharedPassport();

  root.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    if (!event.target.matches('[role="button"][data-film-id]')) return;
    event.preventDefault();
    event.target.click();
  });
})();
