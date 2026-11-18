/* Country atlas and country passport, powered by the existing TMDB key/history. */
(() => {
  const app = window.KGCountryApp;
  const dialog = document.getElementById('journey');
  const shell = dialog?.querySelector('.kg-in');
  const map = document.getElementById('mapbox');
  if (!app || !dialog || !shell || !map) return;

  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt = value => new Intl.NumberFormat(interfaceLanguage).format(Number(value) || 0);
  const flag = code => `<span class="kgc-flag-mark" data-flag="${code}" aria-hidden="true">${app.countryFlag(code)}</span>`;
  const fabricPath = 'assets/flags/flag-fabric.jpg';
  const flagBackdrop = code => `
    <div class="kgc-flag-backdrop" data-flag="${code}" style="--kgc-flag-filter:url(#kgc-fabric-folds-${code})" aria-hidden="true">
      <svg class="kgc-flag-filter" width="0" height="0" focusable="false">
        <filter id="kgc-fabric-folds-${code}" x="0%" y="0%" width="100%" height="100%" color-interpolation-filters="sRGB">
          <feFlood flood-color="rgb(var(--kg-neutral-110))" result="neutral"/>
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
  const passportDetail = document.createElement('div');
  passportDetail.id = 'kgc-passport-detail';
  passportDetail.hidden = true;
  shell.append(passportDetail);
  let passportSection = '', passportScroll = 0, passportBucket = null;

  const fabric = new Image();
  fabric.onload = () => {
    // File URLs can restrict SVG filter access to a separate image.
    root.dataset.flagFabric = location.protocol === 'file:' ? 'overlay' : 'filter';
  };
  fabric.src = fabricPath;
  shell.querySelectorAll(':scope > :not(#kg-country-app)').forEach(el => el.classList.add('kg-country-legacy'));
  map.classList.remove('kg-country-legacy');
  passportDetail.classList.remove('kg-country-legacy');
  const parkedMap = document.createElement('div');
  parkedMap.className = 'kg-country-legacy';
  shell.append(parkedMap);
  function parkAtlasMap() {
    parkedMap.append(map);
  }
  parkAtlasMap();

  const style = document.createElement('style');
  style.textContent = `
    #journey.kg-dlg{width:100%;max-width:100%;height:100dvh;max-height:100dvh;border-radius:0;background:rgb(var(--kg-surface-container-lowest));border:0}
    #journey.kg-dlg[open]{display:flex;flex-direction:column;overflow:hidden}
    #journey .kg-in{flex:1;min-height:0;max-height:none;padding:0;gap:0;overflow:auto;scroll-behavior:smooth}
    #journey .kg-country-legacy{display:none!important}
    #kg-country-app{font-family:var(--kg-font-interface);color:rgb(var(--kg-on-surface));min-height:100%;background:radial-gradient(ellipse at 90% 14%,rgb(var(--kg-secondary-container)/.17),transparent 34%),rgb(var(--kg-surface-container-lowest))}
    .kgc-head{height:60px;padding:0 16px;display:flex;align-items:center;gap:12px;position:sticky;top:0;z-index:5;background:rgb(var(--kg-surface)/.92);backdrop-filter:blur(18px);border-bottom:1px solid rgb(var(--kg-primary)/.08)}
    .kgc-icon{border:0;background:transparent;color:rgb(var(--kg-primary));width:36px;height:40px;font-size:24px;cursor:pointer}.kgc-head-title{min-width:0;flex:1}.kgc-head-title b{font:600 17px var(--kg-font-heading);color:rgb(var(--kg-primary));display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kgc-head-title small,.kgc-muted{color:rgb(var(--kg-text-muted));font-size:11px}
    .kgc-pad{padding:16px}.kgc-panel{background:linear-gradient(145deg,rgb(var(--kg-surface-container)/.96),rgb(var(--kg-surface-panel)/.92));border:1px solid rgb(var(--kg-primary)/.09);border-radius:18px;padding:15px;box-shadow:0 14px 36px rgb(var(--kg-black)/.2)}
    .kgc-overview{position:relative;overflow:hidden;background:radial-gradient(ellipse at 95% 0,rgb(var(--kg-primary-container)/.14),transparent 42%),linear-gradient(135deg,rgb(var(--kg-surface-container)),rgb(var(--kg-surface)))}
    .kgc-kicker{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:rgb(var(--kg-primary));font-weight:700}.kgc-statbig{font:600 35px var(--kg-font-heading);color:rgb(var(--kg-primary));line-height:1.15}.kgc-title{font:600 22px/1.25 var(--kg-font-heading);color:rgb(var(--kg-neutral-129))}.kgc-section{display:flex;justify-content:space-between;align-items:center;gap:8px;margin:23px 16px 10px}.kgc-section h3{margin:0;font:600 18px var(--kg-font-heading);color:rgb(var(--kg-primary))}.kgc-grid3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.kgc-mini{background:rgb(var(--kg-surface-container-low));border-radius:14px;padding:12px;min-height:82px}.kgc-mini b{display:block;margin-top:9px;font:600 20px var(--kg-font-heading);color:rgb(var(--kg-primary))}.kgc-mini small{display:block;color:rgb(var(--kg-text-muted));font-size:11px;line-height:1.35;margin-top:2px}.kgc-progress{height:7px;background:rgb(var(--kg-surface-container-highest));border-radius:99px;overflow:hidden}.kgc-progress i{height:100%;display:block;background:linear-gradient(90deg,rgb(var(--kg-accent-strong)),rgb(var(--kg-primary)));border-radius:inherit}.kgc-btn{border:0;border-radius:999px;padding:11px 15px;background:linear-gradient(100deg,rgb(var(--kg-primary-container)),rgb(var(--kg-primary)));color:rgb(var(--kg-on-primary));font-weight:700;font-size:13px;display:inline-flex;justify-content:center;align-items:center;gap:8px;cursor:pointer}.kgc-btn.secondary{background:rgb(var(--kg-neutral-89));color:rgb(var(--kg-primary));border:1px solid rgb(var(--kg-primary)/.12)}.kgc-country-hero{position:relative;min-height:205px;overflow:hidden;border-radius:19px;display:flex;align-items:flex-end;background:linear-gradient(0deg,rgb(var(--kg-neutral-04)/.96),rgb(var(--kg-neutral-04)/.1)),linear-gradient(135deg,rgb(var(--kg-violet-surface-03)),rgb(var(--kg-neutral-43)))}.kgc-country-hero:after{content:'';position:absolute;inset:0;background:linear-gradient(0deg,rgb(var(--kg-canvas-obsidian)/.96),rgb(var(--kg-canvas-obsidian)/.02) 78%)}.kgc-hero-content{position:relative;z-index:1;padding:17px;width:100%}.kgc-chips{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:9px}.kgc-chip{border-radius:99px;padding:5px 9px;background:rgb(var(--kg-secondary-container)/.55);color:rgb(var(--kg-secondary-fixed));font-size:10px;font-weight:700}.kgc-chip.neutral{background:rgb(var(--kg-surface-panel)/.82);color:rgb(var(--kg-on-surface))}.kgc-country-name{font:600 30px/1.15 var(--kg-font-heading);color:rgb(var(--kg-primary));margin:0}.kgc-country-name em{font:italic 15px var(--kg-font-heading);color:rgb(var(--kg-on-surface-variant))}.kgc-blurb{font:italic 14px/1.5 var(--kg-font-interface);color:rgb(var(--kg-primary));margin:8px 0 14px;max-width:38em}.kgc-feature{display:grid;grid-template-columns:92px 1fr;gap:13px;align-items:start}.kgc-poster{width:92px;aspect-ratio:2/3;object-fit:cover;border-radius:9px;background:rgb(var(--kg-neutral-89));box-shadow:0 9px 24px rgb(var(--kg-black)/.34)}.kgc-latest-copy{display:flex;flex-direction:column;align-items:flex-start;min-width:0;overflow-wrap:anywhere}.kgc-filmname{font:600 18px/1.25 var(--kg-font-heading);color:rgb(var(--kg-neutral-129));margin:4px 0}.kgc-films-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;padding:0 16px}.kgc-filmcard{padding:0;overflow:hidden;text-align:left;background:rgb(var(--kg-surface-container-low));border:1px solid rgb(var(--kg-primary)/.08);border-radius:14px;color:rgb(var(--kg-on-surface));cursor:pointer}.kgc-filmcard img,.kgc-filmph{width:100%;aspect-ratio:2/3;object-fit:cover;background:rgb(var(--kg-surface-container-high));display:flex;align-items:center;justify-content:center;color:rgb(var(--kg-text-muted));text-align:center;padding:8px}.kgc-filmcopy{padding:9px}.kgc-filmcopy b{font:600 14px/1.35 var(--kg-font-heading);display:block;min-height:38px}.kgc-filmcopy small{display:block;color:rgb(var(--kg-text-muted));font-size:10px;margin-top:4px}.kgc-rating{color:rgb(var(--kg-primary))}.kgc-rowcards{display:flex;overflow:auto;gap:9px;padding:0 16px 5px}.kgc-person{flex:0 0 128px;text-align:center;padding:13px 9px;background:rgb(var(--kg-surface-container-low));border-radius:14px}.kgc-avatar{width:54px;height:54px;border-radius:50%;margin:0 auto 8px;background:linear-gradient(145deg,rgb(var(--kg-warm-surface-27)),rgb(var(--kg-neutral-66)));display:grid;place-items:center;color:rgb(var(--kg-primary));font:600 16px var(--kg-font-heading);border:1px solid rgb(var(--kg-primary)/.3)}.kgc-map{padding:12px}.kgc-map #mapbox{min-height:125px;max-height:165px}.kgc-map-controls{display:flex;align-items:center;gap:8px;padding-top:8px}.kgc-country-list{display:flex;flex-wrap:wrap;gap:7px}.kgc-country-pill{border:1px solid rgb(var(--kg-primary)/.1);border-radius:999px;background:rgb(var(--kg-surface-container));color:rgb(var(--kg-on-surface-variant));padding:7px 10px;font-size:11px;cursor:pointer}.kgc-country-pill.has{color:rgb(var(--kg-primary));border-color:rgb(var(--kg-primary-container)/.32)}.kgc-filter{display:flex;gap:7px;overflow:auto;padding:0 16px 10px}.kgc-filter button{white-space:nowrap;border:0;border-radius:999px;padding:7px 11px;background:rgb(var(--kg-surface-container));color:rgb(var(--kg-text-muted));font-size:11px;cursor:pointer}.kgc-filter button.active{background:rgb(var(--kg-primary-container));color:rgb(var(--kg-on-primary));font-weight:700}.kgc-empty{color:rgb(var(--kg-text-muted));background:rgb(var(--kg-surface-container-low));border-radius:14px;padding:14px;font-size:13px;line-height:1.5}.kgc-foot{padding:18px 16px calc(env(safe-area-inset-bottom,0px) + 18px)}
    .kgc-country-tabs{display:flex;gap:8px;overflow-x:auto;padding:10px 12px 8px;background:rgb(var(--kg-neutral-28));scrollbar-width:thin;scrollbar-color:rgb(var(--kg-violet-surface-07)) transparent}.kgc-country-tab{flex:none;display:flex;align-items:center;justify-content:center;gap:7px;min-height:44px;padding:5px 11px;border:1px solid rgb(var(--kg-violet-surface-06));border-radius:99px;background:linear-gradient(145deg,rgb(var(--kg-neutral-63)),rgb(var(--kg-neutral-40)));color:rgb(var(--kg-neutral-128));font:600 13px var(--kg-font-interface);white-space:nowrap;cursor:pointer}.kgc-flag-mark{position:relative;isolation:isolate;display:inline-grid;place-items:center;flex:none;width:32px;height:20px;overflow:hidden;border-radius:5px;background:rgb(var(--kg-neutral-64));box-shadow:0 1px 5px rgb(var(--kg-black)/0.53333)}.kgc-flag-mark :is(img,svg){display:block;width:100%;height:100%;object-fit:fill}.kgc-flag-mark:after{content:'';position:absolute;inset:0;pointer-events:none;border-radius:inherit;box-shadow:inset 0 1px 1px rgb(var(--kg-white)/0.4),inset 0 -3px 5px rgb(var(--kg-black)/0.26667);background:linear-gradient(130deg,rgb(var(--kg-white)/0.2),transparent 42%,rgb(var(--kg-black)/0.2) 92%)}.kgc-country-tab.active{border-color:rgb(var(--kg-accent-warm));background:linear-gradient(155deg,rgb(var(--kg-neutral-56)),rgb(var(--kg-warm-surface-18)));color:rgb(var(--kg-primary));box-shadow:inset 0 0 0 1px rgb(var(--kg-accent-warm)/0.4)}.kgc-hero-full{min-height:390px;margin:0 0 18px;display:flex;align-items:flex-end;position:relative;isolation:isolate;clip-path:inset(0);background:rgb(var(--kg-neutral-28))}.kgc-hero-full:after{content:'';position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,transparent 12%,rgb(var(--kg-neutral-28)/0.07059) 35%,rgb(var(--kg-neutral-28)/0.52157) 61%,rgb(var(--kg-neutral-28)) 95%)}.kgc-hero-copy{position:relative;z-index:1;width:100%;padding:20px 18px 18px;text-align:center}.kgc-hero-full .kgc-country-name{font-size:clamp(29px,8vw,45px);line-height:1.06;text-transform:uppercase;overflow-wrap:anywhere;text-shadow:0 3px 18px rgb(var(--kg-black)/0.66667)}.kgc-hero-full .kgc-blurb{margin:9px auto 16px;max-width:34ch;font-size:16px;line-height:1.4;text-shadow:0 2px 12px rgb(var(--kg-black))}.kgc-action-row{display:flex;gap:8px}.kgc-action-row .kgc-btn{height:52px;flex:1;font-size:14px;box-shadow:0 10px 28px rgb(var(--kg-primary-container)/.3)}.kgc-icon-action{width:48px;height:48px;border:0;border-radius:50%;background:rgb(var(--kg-neutral-89));color:rgb(var(--kg-primary));font-size:20px;cursor:pointer}.kgc-passport-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;padding:0 16px}.kgc-passport-tile{position:relative;min-height:112px;overflow:hidden;padding:12px;border-radius:15px;background:rgb(var(--kg-surface-container-low));display:flex;flex-direction:column;justify-content:space-between}.kgc-passport-tile:nth-child(4){background:linear-gradient(140deg,rgb(var(--kg-surface-container)),rgb(var(--kg-neutral-89)))}.kgc-passport-tile:after{content:attr(data-code);position:absolute;right:-3px;bottom:-18px;color:rgb(var(--kg-white)/0.03529);font:600 54px var(--kg-font-heading);pointer-events:none}.kgc-passport-label{display:flex;justify-content:space-between;gap:6px;color:rgb(var(--kg-text-muted));font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase}.kgc-passport-value{margin-top:13px;color:rgb(var(--kg-primary));font:600 24px/1.15 var(--kg-font-heading)}.kgc-passport-foot{margin-top:4px;color:rgb(var(--kg-text-muted));font-size:11px;line-height:1.4}.kgc-feature-card{margin:0 16px;background:rgb(var(--kg-surface-container-low));border-radius:18px;overflow:hidden;border:1px solid rgb(var(--kg-primary)/.16);box-shadow:0 15px 35px rgb(var(--kg-black)/0.33333);cursor:pointer}.kgc-feature-image{position:relative;height:clamp(185px,52vw,245px);position:relative;background-size:cover;background-position:center;background-color:rgb(var(--kg-neutral-89))}.kgc-feature-image:after{content:'';position:absolute;inset:0;background:linear-gradient(0deg,rgb(var(--kg-surface-container-low)),transparent 68%)}.kgc-feature-badge{position:absolute;z-index:1;top:11px;left:11px;padding:6px 9px;border-radius:99px;background:rgb(var(--kg-surface-container-lowest) / 0.867);color:rgb(var(--kg-primary));font-size:11px;font-weight:700}.kgc-feature-runtime{position:absolute;z-index:1;top:11px;right:11px;padding:6px 9px;border-radius:99px;background:rgb(var(--kg-surface-container-lowest) / 0.867);color:rgb(var(--kg-on-surface));font-size:10px}.kgc-feature-copy{padding:0 14px 15px;margin-top:-18px;position:relative;z-index:2}.kgc-feature-title{font:600 22px/1.25 var(--kg-font-heading);color:rgb(var(--kg-neutral-129))}.kgc-feature-original{font:italic 12px var(--kg-font-heading);color:rgb(var(--kg-text-muted));margin-top:3px}.kgc-feature-meta{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin:9px 0}.kgc-feature-genre-list{display:flex;gap:6px;flex-wrap:wrap}.kgc-feature-cast{margin-top:8px;color:rgb(var(--kg-on-surface-variant));font:12px/1.45 var(--kg-font-interface)}.kgc-account-icon{width:32px;height:32px!important;min-width:32px;border-radius:50%;background:rgb(var(--kg-primary));color:rgb(var(--kg-on-primary))}.kgc-head-title small.kgc-vip{display:inline-block;padding:3px 6px;border-radius:99px;background:rgb(var(--kg-secondary-container)/0.30196);color:rgb(var(--kg-secondary));font-size:9px;font-weight:700;letter-spacing:.08em}.kgc-live-dot{display:inline-block;width:6px;height:6px;margin-right:5px;border-radius:50%;background:rgb(var(--kg-secondary));box-shadow:0 0 8px rgb(var(--kg-secondary))}.kgc-section-icon{color:rgb(var(--kg-primary));font-size:19px}.kgc-section-icon.rose{color:rgb(var(--kg-secondary))}.kgc-person{flex-basis:224px;min-height:190px}.kgc-person .kgc-avatar{width:76px;height:76px;font-size:18px}.kgc-person img.kgc-avatar{object-fit:cover}.kgc-person b{font-size:14px!important}.kgc-person small{line-height:1.45;font-size:11px}.kgc-filmcard{min-width:0}.kgc-film-actions{display:flex;justify-content:space-between;align-items:center;gap:5px}.kgc-film-save{width:30px;height:30px;border:0;border-radius:50%;background:rgb(var(--kg-surface-container-lowest) / 0.800);color:rgb(var(--kg-primary));display:grid;place-items:center;cursor:pointer}.kgc-load-more{grid-column:1/-1;width:100%;margin:4px 0 0}.kgc-location-card{height:222px;position:relative;overflow:hidden;border-radius:18px;background:radial-gradient(ellipse at 50% 42%,rgb(var(--kg-warm-surface-23)),rgb(var(--kg-neutral-68)) 50%,rgb(var(--kg-neutral-26)));border:1px solid rgb(var(--kg-white)/0.07059)}.kgc-location-grid{position:absolute;inset:0;background-image:linear-gradient(rgb(var(--kg-primary)/0.06667) 1px,transparent 1px),linear-gradient(90deg,rgb(var(--kg-primary)/0.06667) 1px,transparent 1px);background-size:32px 32px;opacity:.42;transform:perspective(270px) rotateX(24deg) scale(1.35)}.kgc-location-ping{position:absolute;left:50%;top:40%;width:58px;height:58px;display:grid;place-items:center;border-radius:50%;background:rgb(var(--kg-primary-container));color:rgb(var(--kg-on-primary));font:700 13px var(--kg-font-interface);box-shadow:0 0 0 12px rgb(var(--kg-primary-container)/0.12549),0 0 32px rgb(var(--kg-primary-container)/0.53333);transform:translate(-50%,-50%)}.kgc-location-copy{position:absolute;inset:auto 12px 12px;padding:12px;border-radius:13px;background:rgb(var(--kg-surface-container-lowest) / 0.851);backdrop-filter:blur(12px)}.kgc-location-copy b{font:600 14px var(--kg-font-heading);color:rgb(var(--kg-primary))}.kgc-location-copy small{display:block;margin-top:4px;color:rgb(var(--kg-text-muted));font-size:11px;line-height:1.5}.kgc-back-profile{position:fixed;right:max(16px,calc((100vw - 520px)/2 + 16px));bottom:calc(env(safe-area-inset-bottom,0px) + 18px);z-index:4;border:0;border-radius:99px;padding:11px 15px;background:rgb(var(--kg-neutral-89));color:rgb(var(--kg-primary));box-shadow:0 8px 22px rgb(var(--kg-black)/0.53333);font-size:12px;font-weight:700;cursor:pointer}.kgc-icon .material-symbols-outlined,.kgc-icon-action .material-symbols-outlined,.kgc-btn .material-symbols-outlined{font-size:20px;line-height:1}
    .kgc-head-title-row{display:flex;align-items:center;gap:6px;min-width:0}.kgc-head-title-row b{flex:0 1 auto;min-width:0;font-size:15px}.kgc-vip{flex:none;padding:3px 6px;border-radius:99px;background:rgb(var(--kg-secondary-container)/0.30196);color:rgb(var(--kg-secondary));font:700 8px var(--kg-font-interface);letter-spacing:.06em}.kgc-section-icon{color:rgb(var(--kg-primary));font-size:20px}.kgc-section-icon.rose{color:rgb(var(--kg-secondary))}.kgc-feature-badge .material-symbols-outlined{font-size:13px;vertical-align:-2px}.kgc-cast-label{color:rgb(var(--kg-primary));font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}.kgc-inline-person{padding:0;border:0;background:transparent;color:rgb(var(--kg-primary));font:inherit;text-decoration:underline;text-decoration-color:rgb(var(--kg-primary-container)/0.4);text-underline-offset:2px;cursor:pointer}.kgc-inline-person:hover{color:rgb(var(--kg-accent-text))}.kgc-icon .material-symbols-outlined,.kgc-icon-action .material-symbols-outlined,.kgc-btn .material-symbols-outlined{font-size:20px;line-height:1}.kgc-account-icon{width:32px;height:32px!important;min-width:32px;border-radius:50%;background:rgb(var(--kg-primary));color:rgb(var(--kg-on-primary))}.kgc-feature-genre-list{display:flex;gap:6px;flex-wrap:wrap}.kgc-head-title-row .kgc-vip{font-size:8px}.kgc-person{flex:0 0 224px;min-height:225px;padding:16px 13px 12px;display:flex;flex-direction:column;align-items:center;border:1px solid rgb(var(--kg-white)/0.03922);box-shadow:0 8px 18px rgb(var(--kg-black)/0.13333)}.kgc-person-role{margin-top:3px;color:rgb(var(--kg-secondary));font-size:9px;letter-spacing:.08em;text-transform:uppercase}.kgc-person-films{display:-webkit-box;min-height:42px;overflow:hidden;-webkit-box-orient:vertical;-webkit-line-clamp:2;margin-top:7px;color:rgb(var(--kg-on-surface-variant))!important;font:italic 11px/1.45 var(--kg-font-heading)!important}.kgc-person-footer{width:100%;margin-top:auto;padding-top:10px;display:flex;justify-content:space-between;align-items:center;border-top:1px solid rgb(var(--kg-white)/0.04706);color:rgb(var(--kg-text-muted));font-size:10px}.kgc-person-footer .material-symbols-outlined{font-size:15px;color:rgb(var(--kg-primary))}.kgc-person-name{margin-top:0;font-size:13px!important;text-align:center}
    @media(max-width:390px){.kgc-pad{padding:13px}.kgc-country-name{font-size:27px}.kgc-grid3{gap:6px}.kgc-mini{padding:10px 8px}.kgc-mini b{font-size:18px}.kgc-section h3{font-size:17px}.kgc-feature-image{height:150px}.kgc-passport-tile{min-height:104px;padding:10px}.kgc-vip{font-size:7px}.kgc-head{gap:8px;padding:0 10px}.kgc-head .kgc-icon{width:32px}}
    .kgc-country-tab:focus-visible{outline:2px solid rgb(var(--kg-primary));outline-offset:2px}
    .kgc-country-tab .kgc-flag-mark{width:clamp(28px,8.5vw,38px);height:auto;aspect-ratio:1.68;border-radius:5px}
    .kgc-flag-mark[data-flag="NP"] img,.kgc-flag-mark[data-flag="CH"] img{object-fit:contain}
    .kgc-flag-backdrop{position:absolute;inset:0;clip-path:inset(0);isolation:isolate}
    .kgc-flag-filter{position:absolute}
    .kgc-flag-art{position:absolute;inset:-13% -8% -8%;display:grid;place-items:center}
    [data-flag-fabric="filter"] .kgc-flag-art{filter:var(--kgc-flag-filter)}
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
      mask-image:linear-gradient(rgb(var(--kg-black)) 56%,rgb(var(--kg-black)/0.8) 77%,transparent 100%);
    }
    .kgc-hero-full .kgc-flag-backdrop[data-flag="NP"] img{object-fit:contain}
    .kgc-hero-copy .kgc-passport-label{display:flex;align-items:center;justify-content:center;gap:10px;margin:8px 0 0;color:rgb(var(--kg-primary));letter-spacing:.12em}
    @media(max-width:420px){
      .kgc-head-title-row .kgc-vip{display:none}
      .kgc-country-tab{gap:6px;padding-inline:9px;font-size:12px}
      .kgc-country-tab .kgc-flag-mark{width:28px}
    }
    .kgc-hero-full .kgc-country-name{color:rgb(var(--kg-accent-warm));letter-spacing:.025em}
    .kgc-hero-copy .kgc-passport-label::before,.kgc-hero-copy .kgc-passport-label::after{
      content:'';width:clamp(20px,8vw,43px);height:1px;background:linear-gradient(90deg,transparent,rgb(var(--kg-accent-warm)),transparent)
    }
    .kgc-hero-full .kgc-blurb{font-family:var(--kg-font-interface);font-style:italic}
    #kg-watch-history .kgc-head h1{margin:0;font:700 19px var(--kg-font-heading);color:rgb(var(--kg-primary))}
    #kg-watch-history .kgc-diary-entry{width:100%;margin-bottom:12px}
    #kg-watch-history .note{grid-column:1/-1;color:rgb(var(--kg-on-surface-variant));font-size:13px}
    #kg-watch-history .jfilm{min-width:0;overflow-wrap:anywhere;cursor:pointer}
    #kg-watch-history .jfilm:focus-visible{outline:2px solid rgb(var(--kg-primary));outline-offset:2px}
    .kgc-catalog-link{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;margin:10px 0;padding:9px 10px;border:1px solid rgb(var(--kg-primary)/0.19608);border-radius:10px;background:rgb(var(--kg-surface-container-high));color:rgb(var(--kg-primary));text-align:left;font-weight:600;cursor:pointer}
    .kgc-catalog-link:hover{border-color:rgb(var(--kg-primary))}
    .kgc-poster-placeholder{display:grid;place-items:center;text-align:center;color:rgb(var(--kg-text-muted));font-size:11px}
    .kgc-mini[data-open-catalog],.kgc-mini[data-atlas-history]{border:1px solid transparent;text-align:center;cursor:pointer;color:inherit}
    .kgc-mini[data-open-catalog]:is(:hover,:focus-visible),.kgc-mini[data-atlas-history]:is(:hover,:focus-visible){border-color:rgb(var(--kg-primary))}
    .kgc-overview-open{position:absolute;inset:0;width:100%;height:100%;border:0;border-radius:inherit;background:transparent;cursor:pointer}
    .kgc-overview-open:focus-visible{outline:2px solid rgb(var(--kg-primary));outline-offset:-3px}
    .kgc-overview [data-atlas-scroll-map]{position:relative;z-index:1}
    .kgc-catalog-head{display:grid;grid-template-columns:76px 1fr 76px;gap:4px;background:rgb(var(--kg-surface) / 0.961)}
    .kgc-catalog-head h1{margin:0;text-align:center;font:700 20px var(--kg-font-heading);color:rgb(var(--kg-primary))}
    .kgc-catalog-head-actions{display:flex;align-items:center;justify-content:flex-end;gap:4px}
    .kgc-catalog-head .kgc-icon{display:grid;place-items:center}
    .kgc-catalog-head .kgc-icon .material-symbols-outlined{font-size:21px}
    .kgc-catalog-head .kgc-catalog-profile{width:32px;height:32px;border-radius:50%;background:rgb(var(--kg-primary));color:rgb(var(--kg-on-primary))}
    .kgc-catalog{padding:14px clamp(12px,4.5vw,20px) 24px;display:grid;gap:20px;color:rgb(var(--kg-on-surface-variant));background:radial-gradient(ellipse at 50% 0,rgb(var(--kg-primary-container)/0.07059),transparent 190px),rgb(var(--kg-surface));font:500 13px/1.4 var(--kg-font-interface)}
    .kgc-catalog-summary,.kgc-catalog-card,.kgc-catalog-bottom{min-width:0;border-radius:13px;background:rgb(var(--kg-surface-container));box-shadow:0 10px 20px rgb(var(--kg-surface-container-lowest) / 0.502)}
    .kgc-catalog-summary{display:grid;gap:12px;padding:16px}
    .kgc-catalog-summary-line,.kgc-catalog-metric{display:flex;align-items:center;justify-content:space-between;gap:8px}
    .kgc-catalog-summary-line strong,.kgc-catalog-metric strong{color:rgb(var(--kg-primary))}
    .kgc-catalog-summary-line strong{font-size:11px;letter-spacing:.07em;text-transform:uppercase}
    .kgc-catalog-summary-line span{border-radius:99px;background:rgb(var(--kg-surface-container-highest));color:rgb(var(--kg-primary));padding:4px 8px;font-size:10px;font-weight:700;text-align:center}
    .kgc-catalog-metric b{font-size:30px;color:rgb(var(--kg-primary))}
    .kgc-catalog-metric small{font-size:10px;text-align:right}
    .kgc-catalog-progress{height:8px;border-radius:8px;background:rgb(var(--kg-surface-container-highest));overflow:hidden}
    .kgc-catalog-progress span{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,rgb(var(--kg-primary-container)),rgb(var(--kg-primary)))}
    .kgc-catalog-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px}
    .kgc-catalog-stats div{display:grid;gap:1px;border-radius:8px;background:rgb(var(--kg-surface-container-high));padding:8px}
    .kgc-catalog-stats b{color:rgb(var(--kg-primary));font-size:15px}
    .kgc-catalog-stats div:nth-child(2) b{color:rgb(var(--kg-secondary))}
    .kgc-catalog-stats div:nth-child(3) b{color:rgb(var(--kg-on-surface))}
    .kgc-catalog-pills{display:flex;gap:5px;overflow-x:auto;scrollbar-width:thin;padding-block:3px}
    .kgc-catalog-pill,.kgc-catalog-view button{border:0;background:rgb(var(--kg-surface-container-high));color:rgb(var(--kg-on-surface-variant));cursor:pointer}
    .kgc-catalog-pill{flex:none;padding:5px 9px;border-radius:8px;font:700 11px/1.4 var(--kg-font-interface);white-space:nowrap}
    .kgc-catalog-summary .kgc-catalog-pill{border-radius:99px}
    .kgc-catalog-pill[aria-pressed="true"]{background:rgb(var(--kg-primary));color:rgb(var(--kg-on-primary))}
    .kgc-catalog-controls{display:grid;grid-template-columns:minmax(0,1fr);gap:7px;min-width:0}
    .kgc-catalog-search{display:flex;align-items:center;gap:8px;padding:0 12px;border-radius:12px;background:rgb(var(--kg-surface-container-low))}
    .kgc-catalog-search input{flex:1;min-width:0;width:100%;height:44px;padding:0;border:0;background:transparent;color:rgb(var(--kg-on-surface));font:inherit;box-shadow:none}
    .kgc-catalog-search input:focus{box-shadow:none;outline:0}
    .kgc-catalog-search:focus-within,.kgc-catalog button:focus-visible{outline:2px solid rgb(var(--kg-primary));outline-offset:2px}
    .kgc-catalog-search .material-symbols-outlined{font-size:19px}
    .kgc-catalog-toolbar{display:flex;align-items:center;gap:6px;min-width:0}
    .kgc-catalog-toolbar .kgc-catalog-pills{min-width:0;flex:1}
    .kgc-catalog-view{display:flex;flex:none;gap:3px;padding:4px;border-radius:8px;background:rgb(var(--kg-surface-container-low))}
    .kgc-catalog-view button{display:grid;place-items:center;padding:5px;border-radius:5px;background:transparent}
    .kgc-catalog-view button[aria-pressed="true"]{background:rgb(var(--kg-surface-container-high));color:rgb(var(--kg-primary))}
    .kgc-catalog-view .material-symbols-outlined{font-size:18px}
    .kgc-catalog-feed{display:grid;gap:16px}
    .kgc-catalog-feed[data-view="grid"]{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
    .kgc-catalog-card{overflow:hidden;cursor:pointer}
    .kgc-catalog-banner{position:relative;isolation:isolate;min-height:142px;display:grid;align-content:space-between;gap:20px;padding:12px}
    .kgc-catalog-banner .kgc-flag-backdrop{z-index:-2}
    .kgc-catalog-banner::after{content:'';position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,rgb(var(--kg-surface-container) / 0.333),rgb(var(--kg-surface-container) / 0.620) 45%,rgb(var(--kg-surface-container)))}
    .kgc-catalog-country-open{display:grid;gap:11px;width:100%;min-height:44px;color:inherit;text-decoration:none;cursor:pointer;border-radius:7px}
    .kgc-catalog-country-open.kgc-catalog-banner{min-height:142px;gap:20px;border-radius:0}
    .kgc-catalog-country-open:focus-visible{outline:2px solid rgb(var(--kg-primary));outline-offset:3px}
    .kgc-catalog-country-open:hover h2{color:rgb(var(--kg-primary))}
    .kgc-catalog-country-arrow{margin-left:auto;color:rgb(var(--kg-primary));font-size:20px}
    .kgc-catalog-country{display:flex;align-items:center;gap:8px;min-width:0}
    .kgc-catalog-country h2{margin:0;color:rgb(var(--kg-on-surface));font:700 17px/1.2 var(--kg-font-heading);overflow-wrap:anywhere}
    .kgc-catalog-banner h2{font-size:23px}
    .kgc-catalog-feed[data-view="grid"] .kgc-catalog-banner{padding:10px;min-height:170px}
    .kgc-catalog-feed[data-view="grid"] .kgc-catalog-country{flex-wrap:wrap;gap:5px}
    .kgc-catalog-feed[data-view="grid"] .kgc-catalog-country>div{flex:1;min-width:80px}
    .kgc-catalog-feed[data-view="grid"] .kgc-catalog-banner h2{font-size:18px}
    .kgc-catalog-feed[data-view="grid"] .kgc-catalog-country-arrow{display:none}

    .kgc-catalog-country small{font-size:11px;color:rgb(var(--kg-primary))}
    .kgc-catalog-card-body{display:grid;gap:11px;padding:12px}
    .kgc-catalog-badges{display:flex;flex-wrap:wrap;gap:5px;justify-content:space-between}
    .kgc-catalog-badge{padding:3px 7px;border-radius:99px;background:rgb(var(--kg-surface));color:rgb(var(--kg-primary));font-size:10px;font-weight:700}
    .kgc-catalog-badge.open{background:rgb(var(--kg-on-primary-fixed-variant))}
    .kgc-catalog-banner .kgc-catalog-badge.open{background:rgb(var(--kg-primary-container));color:rgb(var(--kg-on-primary))}
    .kgc-catalog-film{display:flex;align-items:center;gap:10px;width:100%;border:0;border-radius:9px;background:rgb(var(--kg-surface-container-high));padding:8px;text-align:left;color:rgb(var(--kg-on-surface-variant));cursor:pointer}
    .kgc-catalog-film img,.kgc-catalog-poster-placeholder{width:55px;aspect-ratio:2/3;border-radius:5px;background:rgb(var(--kg-surface-container-low));object-fit:cover;flex:none}
    .kgc-catalog-poster-placeholder{display:grid;place-items:center;color:rgb(var(--kg-primary))}
    .kgc-catalog-film b,.kgc-catalog-film small{display:block}
    .kgc-catalog-film b{color:rgb(var(--kg-on-surface));font-size:15px;line-height:1.25}
    .kgc-catalog-film small{font-size:11px}
    .kgc-catalog-actions{display:flex;align-items:center;flex-wrap:wrap;gap:6px}
    .kgc-catalog-action{display:inline-flex;align-items:center;justify-content:center;min-height:36px;gap:5px;padding:7px 10px;border:0;border-radius:8px;background:rgb(var(--kg-surface-container-high));color:rgb(var(--kg-primary));font:700 12px var(--kg-font-interface);cursor:pointer}
    .kgc-catalog-action.primary{background:linear-gradient(110deg,rgb(var(--kg-primary-container)),rgb(var(--kg-accent-strong)));color:rgb(var(--kg-on-primary));box-shadow:0 4px 12px rgb(var(--kg-primary-container)/0.25098)}
    .kgc-catalog-card p{margin:0}
    .kgc-catalog-bottom{display:grid;gap:10px;padding:16px;background:linear-gradient(rgb(var(--kg-surface-container-high)),rgb(var(--kg-surface-container)) 70%,rgb(var(--kg-neutral-50)))}
    .kgc-catalog-bottom h2{margin:0;color:rgb(var(--kg-on-surface));font:700 20px/1.2 var(--kg-font-heading)}
    .kgc-catalog-bottom p{margin:0}
    .kgc-catalog-bottom button{border-radius:99px;min-height:44px}
    .kgc-catalog-empty{grid-column:1/-1;padding:18px 0;text-align:center}
    .kgc-catalog [hidden]{display:none}
  `;
  style.textContent += `
    .kgc-country-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
    .kgc-open-country{display:flex;align-items:center;gap:9px;min-height:64px;min-width:0;padding:11px;border:1px solid rgb(var(--kg-primary-container)/.28);border-radius:14px;background:rgb(var(--kg-surface-panel));color:rgb(var(--kg-on-surface));text-align:left;cursor:pointer}
    .kgc-open-country>span:nth-child(2){flex:1;min-width:0}
    .kgc-open-country b{display:block;font-size:13px;overflow-wrap:anywhere}
    .kgc-open-country small{display:block;margin-top:4px;color:rgb(var(--kg-text-muted));font-size:11px}
    .kgc-open-country:hover{border-color:rgb(var(--kg-primary))}
    .kgc-map #mapbox{min-height:0;max-height:none;overflow:auto;overscroll-behavior:contain}
    .kgc-map #mapbox svg{max-width:none;height:auto}
    .kgc-map-zoom{display:flex;align-items:center;gap:6px;margin-top:10px}
    .kgc-map-zoom button{width:44px;height:44px;border:1px solid rgb(var(--kg-primary)/.2);border-radius:10px;background:rgb(var(--kg-surface-container));color:rgb(var(--kg-primary));font-size:22px;cursor:pointer}
    .kgc-map-zoom output{min-width:44px;text-align:center;color:rgb(var(--kg-text-muted));font-size:12px}
    .kgc-hero-full.kgc-hero-opened{min-height:210px}
    .kgc-hero-opened .kgc-hero-copy{padding:16px}
    .kgc-watched-list{display:flex;flex-direction:column;gap:8px;padding:0 16px}
    .kgc-watched-film{display:flex;align-items:center;gap:12px;min-height:80px;width:100%;padding:10px;border:1px solid rgb(var(--kg-primary)/.12);border-radius:13px;background:rgb(var(--kg-surface-panel));color:rgb(var(--kg-on-surface));text-align:left;cursor:pointer}
    .kgc-watched-film img,.kgc-watched-poster{width:44px;height:66px;flex:none;border-radius:6px;object-fit:cover;background:rgb(var(--kg-surface-container-high));display:grid;place-items:center}
    .kgc-watched-film>span:nth-child(2){flex:1;min-width:0}
    .kgc-watched-film b{display:block;font-size:14px;overflow-wrap:anywhere}
    .kgc-watched-film small{display:block;margin-top:5px;color:rgb(var(--kg-text-muted));font-size:12px}
`;
  style.textContent += `
    button.kgc-passport-tile{width:100%;border:1px solid rgb(var(--kg-primary)/.12);color:inherit;font:inherit;text-align:left;cursor:pointer}
    button.kgc-passport-tile:hover{border-color:rgb(var(--kg-primary)/.5)}
    button.kgc-passport-tile:focus-visible{outline:2px solid rgb(var(--kg-primary));outline-offset:3px}
    #kgc-passport-detail{min-height:100%;background:rgb(var(--kg-surface));color:rgb(var(--kg-on-surface));font-family:var(--kg-font-interface)}
    #kgc-passport-detail[hidden]{display:none}
    .kgc-stat-content{padding:20px 16px 30px;display:grid;gap:20px}
    .kgc-stat-summary{padding:20px;border:1px solid rgb(var(--kg-primary)/.15);border-radius:18px;background:rgb(var(--kg-surface-container))}
    .kgc-stat-number{display:block;margin:10px 0;font:700 clamp(30px,10.5vw,44px)/1.1 var(--kg-font-heading);color:rgb(var(--kg-primary))}
    .kgc-stat-chart{display:grid;gap:7px;margin-top:20px}
    .kgc-stat-bar{display:grid;grid-template-columns:58px minmax(0,1fr) 38px;gap:10px;align-items:center;min-height:34px;width:100%;border:0;border-radius:8px;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}
    .kgc-stat-epochs .kgc-stat-bar{grid-template-columns:90px minmax(0,1fr) 30px}
    .kgc-stat-epochs .kgc-stat-bar>span:first-child{white-space:nowrap;font-size:13px}
    .kgc-stat-bar[aria-pressed="true"]{background:rgb(var(--kg-primary)/.12)}
    .kgc-stat-bar:focus-visible{outline:2px solid rgb(var(--kg-primary))}
    .kgc-stat-track{height:9px;overflow:hidden;border-radius:99px;background:rgb(var(--kg-surface-container-highest))}
    .kgc-stat-fill{display:block;height:100%;border-radius:inherit;background:rgb(var(--kg-primary))}
    .kgc-stat-bar small{text-align:right;color:rgb(var(--kg-text-muted))}
    .kgc-stat-films{display:grid;gap:8px}
    .kgc-stat-film{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:14px;border:0;border-radius:12px;background:rgb(var(--kg-surface-container));color:inherit;font:inherit;text-align:left;cursor:pointer}
    .kgc-stat-film b{display:block;font-size:14px}.kgc-stat-film small{display:block;margin-top:4px;color:rgb(var(--kg-text-muted))}
    .kgc-stat-note{margin:8px 0 0;color:rgb(var(--kg-text-muted));font-size:12px;line-height:1.6}
    #kg-country-people.kg-cast-rail{gap:var(--kg-cast-gap)}
    .kgc-stat-content h2{margin:0;font:700 21px var(--kg-font-heading)}
  `;
  document.head.appendChild(style);

  const data = () => ({counts:app.counts(), watched:app.watched(), countries:app.countries()});
  const countsTotal = counts => Object.values(counts).reduce((n,v)=>n+(Number(v)||0),0);
  const sortedCountries = () => {
    const {counts,countries}=data();
    return countries.slice().sort((a,b)=>(counts[b]||0)-(counts[a]||0)||app.countryName(a).localeCompare(app.countryName(b),'ru'));
  };
  function openMovie(film, opener, autoplayTrailer = false) {
    if (!dialog.open) return;
    window.KGFilmCard.openDialog({...window.KGFilmCard.savedFilm(film), _kgGlobalRelated:true},opener,{autoplayTrailer});
  }

  async function loadLatestPoster(film, slot) {
    const image = new Image();
    image.className = 'kgc-poster';
    image.alt = '';
    const tried = new Set();

    async function show(path) {
      if (!slot.isConnected || !/^\/[a-z0-9_.-]+$/i.test(path || '') || tried.has(path)) return false;
      tried.add(path);
      image.src = poster({poster_path:path}, 'w185');
      try {
        await image.decode();
      } catch (_) {
        return false;
      }
      if (slot.isConnected) slot.replaceChildren(image);
      return true;
    }

    if (await show(film.poster || film.poster_path)) return;
    if (!slot.isConnected || !app.key()) return;
    const details = await app.getFilmDetails(film.id).catch(() => null);
    if (await show(details?.posterPath)) return;
    await show(details?.localizedPoster?.path);
  }

  let atlasMapScale=1;
  function applyAtlasMapScale(previous=atlasMapScale) {
    const svg=map.querySelector('svg');if(!svg)return;
    const width=map.clientWidth;
    const centerX=(map.scrollLeft+width/2)/previous;
    const centerY=(map.scrollTop+map.clientHeight/2)/previous;
    const parts=(svg.getAttribute('viewBox')||'0 0 1000 432').split(/\s+/).map(Number);
    if(width>0)map.style.height=`${width*parts[3]/parts[2]}px`;
    svg.style.width=`${atlasMapScale*100}%`;
    map.scrollLeft=Math.max(0,centerX*atlasMapScale-width/2);
    map.scrollTop=Math.max(0,centerY*atlasMapScale-map.clientHeight/2);
    const scale=root.querySelector('[data-atlas-map-scale]');if(scale)scale.textContent=`${atlasMapScale*100}%`;
    root.querySelectorAll('[data-atlas-map-zoom]').forEach(button=>{button.disabled=Number(button.dataset.atlasMapZoom)<0?atlasMapScale===1:atlasMapScale===3;});
  }
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
      <div class="kgc-head"><button class="kgc-icon" data-atlas-close aria-label="${uiText("Закрыть")}">←</button><div class="kgc-head-title"><b>${uiText("Страны")}</b><small>${uiText("{count} стран", {count: countries.length})}</small></div><span style="font-size:21px">🌍</span></div>
      <div class="kgc-pad"><section class="kgc-panel kgc-overview">
        <button type="button" class="kgc-overview-open" data-open-catalog="all" aria-label="${esc(uiText("Страны мирового кинематографа"))}"></button>
        <div style="display:flex;justify-content:space-between;gap:8px"><span class="kgc-kicker">${uiText("✦ Киноэкспедиция")} <span aria-hidden="true">→</span></span><span class="kgc-chip neutral">${opened?uiText("{opened} / {total} открыто", {opened, total: countries.length}):uiText("Начало пути")}</span></div>
        <div style="display:flex;align-items:center;gap:14px;margin:9px 0 4px"><div class="kgc-statbig">${opened}<span style="font-size:20px;color:rgb(var(--kg-on-surface-variant))"> / ${countries.length}</span></div><div style="margin-left:auto;text-align:center"><button class="kgc-btn secondary" data-atlas-scroll-map>${uiText("Карта")}</button></div></div>
        <div class="kgc-progress"><i style="width:${pct}%"></i></div><div style="display:flex;justify-content:space-between;margin-top:7px" class="kgc-muted"><span>${uiText("{count} просмотренных фильмов", {count: fmt(total)})}</span><span>${uiText("{count} не открыто", {count: countries.length - opened})}</span></div>
        <div style="display:flex;align-items:center;gap:8px;margin-top:15px;color:rgb(var(--kg-on-surface-variant));font:12px 'Noto Serif',serif"><span>☝</span><span>${uiText("Выберите страну на карте или в списке ниже")}</span></div>
      </section></div>
      <div class="kgc-pad" style="padding-top:0"><div class="kgc-grid3">
        <button type="button" class="kgc-mini" data-atlas-history><span aria-hidden="true">🎞</span><b>${fmt(watched.length)}</b><small>${uiText("Фильмов просмотрено")}</small></button>
        <button type="button" class="kgc-mini" data-open-catalog="opened"><span aria-hidden="true">🌐</span><b>${opened} / ${countries.length}</b><small>${uiText("Стран открыто")}</small></button>
        <button type="button" class="kgc-mini" data-open-catalog="screenings"><span aria-hidden="true">✦</span><b>${opened?`${(total/opened).toFixed(1)}`:'0'}</b><small>${uiText("Фильмов на страну")}</small></button>
      </div></div>
      <div class="kgc-section"><h3>${uiText("🏆 Чаще всего в зале")}</h3><span class="kgc-chip neutral">${uiText("Лидер кинопутешествия")}</span></div>
      ${leader?`<button class="kgc-pad" data-open-country="${leader}" style="display:block;width:100%;text-align:left;border:0;background:transparent;padding-top:0"><div class="kgc-panel kgc-country-hero">${flagBackdrop(leader)}<div class="kgc-hero-content"><div class="kgc-chips"><span class="kgc-chip">${flag(leader)} ${uiText("Сеансов: {count}", {count: fmt(counts[leader])})}</span><span class="kgc-chip neutral">${uiText("№ {rank} в ваших открытиях", {rank: String(ordered.indexOf(leader)+1).padStart(2,'0')})}</span></div><h2 class="kgc-country-name">${esc(app.countryName(leader))}</h2><p class="kgc-blurb">${uiText("Ваша личная кинематографическая карта этой страны. Откройте паспорт, чтобы увидеть отмеченные фильмы.")}</p></div></div></button>`:`<div class="kgc-pad" style="padding-top:0"><div class="kgc-panel"><div class="kgc-title">${uiText("Ваше первое кинооткрытие")}</div><p class="kgc-muted">${uiText("Отметьте просмотренный фильм — и страна его производства появится в атласе.")}</p><button class="kgc-btn secondary" data-open-map>${uiText("Перейти к глобусу　↗")}</button></div></div>`}
      <div class="kgc-section"><h3>${uiText("◎ Последнее открытие")}</h3><span class="kgc-muted">${latest?new Date(latest.watchedAt||Date.now()).toLocaleDateString(interfaceLanguage):uiText("История пока пуста")}</span></div>
      ${latest?`<div class="kg-bookmark-card"><button data-open-saved="${esc(latest.id)}" class="kgc-pad" style="display:block;width:100%;text-align:left;border:0;background:transparent;padding-top:0"><div class="kgc-panel kgc-feature"><span data-kgc-latest-poster><span class="kgc-poster kgc-poster-placeholder">${uiText("Нет постера")}</span></span><span class="kgc-latest-copy"><span class="kgc-chip">${uiText("Просмотрено")}</span><b class="kgc-filmname">${esc(latest.title||uiText("Фильм"))}</b><small class="kgc-muted">${esc([latest.year,latestCountry?app.countryName(latestCountry):''].filter(Boolean).join(' · '))}</small></span></div></button></div>`:`<div class="kgc-pad" style="padding-top:0"><div class="kgc-empty">${uiText("Здесь появится последний фильм, который вы отметили как просмотренный.")}</div></div>`}
      <div class="kgc-section"><h3>${uiText("🌐 Атлас кинолокаций")}</h3><span class="kgc-muted">${uiText("{count} отмечено", {count: opened})}</span></div>
      <div class="kgc-pad" style="padding-top:0"><div class="kgc-panel kgc-map"><div id="kg-country-map-host"></div><div class="kgc-map-zoom" role="group" aria-label="${uiText("Масштаб карты")}"><button type="button" data-atlas-map-zoom="-1" aria-label="${uiText("Уменьшить карту")}">−</button><output data-atlas-map-scale>100%</output><button type="button" data-atlas-map-zoom="1" aria-label="${uiText("Увеличить карту")}">+</button></div><div class="kgc-map-controls"><span class="kgc-muted" style="flex:1">${uiText("Нажмите на отмеченную страну")}</span><button class="kgc-btn secondary" data-open-globe>${uiText("Вернуться к 3D-глобусу")}</button></div></div></div>
      ${seenCountries.length?`<div class="kgc-section"><h3>${uiText("Открытые страны")}</h3><span class="kgc-muted">${seenCountries.length}</span></div><div class="kgc-pad" style="padding-top:0"><div class="kgc-country-list">${seenCountries.map(c=>`<button type="button" class="kgc-open-country" data-open-country="${c}" aria-label="${esc(uiText("Паспорт страны {country}",{country:app.countryName(c)}))}">${flag(c)}<span><b>${esc(app.countryName(c))}</b><small>${uiText("{count} просмотрено",{count:counts[c]})}</small></span><span aria-hidden="true">→</span></button>`).join('')}</div></div>`:''}
      <div class="kgc-pad" style="padding-top:0"><button type="button" class="kgc-catalog-link" data-open-catalog="all">${uiText("Все страны")} <span aria-hidden="true">→</span></button></div>
      <div class="kgc-foot"><button class="kgc-btn secondary" data-atlas-close style="width:100%">${uiText("Закрыть атлас")}</button></div>`;
    const mapHost=root.querySelector('#kg-country-map-host');
    if (mapHost) {mapHost.append(map);atlasMapScale=1;applyAtlasMapScale();}
    if (latest) loadLatestPoster(latest, root.querySelector('[data-kgc-latest-poster]'));
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
  const catalog = {status:null, region:'all', view:'cards', query:'', scroll:0, atlasScroll:0, atlasEntry:''};
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
      const response = await movieCatalog.request(url, {signal});
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

  const unavailableFeatures = new Set();

  function catalogCard(row, rank) {
    const {code, name, region, films} = row;
    const film = films[0];
    const heading = `<div class="kgc-catalog-country">${flag(code)}<div><h2>${esc(name)}</h2><small>${esc(uiText(region))}</small></div><span class="kgc-catalog-country-arrow" aria-hidden="true">→</span></div>`;
    const badges = `<div class="kgc-catalog-badges"><span class="kgc-catalog-badge${film ? ' open' : ''}">${film ? uiText("✓ Открыта · №{rank}", {rank: String(rank).padStart(2,'0')}) : uiText("Не исследована")}</span>${film ? `<span class="kgc-catalog-badge">${uiText("Сеансы · {count}", {count: fmt(films.length)})}</span>` : ''}</div>`;
    const countryLink = (content, banner = false) => `<a href="#country-${code}" class="kgc-catalog-country-open${banner ? ' kgc-catalog-banner' : ''}" data-open-country="${code}" aria-label="${esc(uiText("Паспорт страны {country}", {country: name}))}">${content}</a>`;
    const passport = `<button type="button" class="kgc-catalog-action primary" data-open-country="${code}" aria-label="${esc(uiText("Паспорт страны {country}", {country: name}))}">${uiText("Паспорт →")}</button>`;
    const canOpenFeature = film || (app.key() && !unavailableFeatures.has(code));
    const feature = canOpenFeature
      ? `<button type="button" class="kgc-catalog-action" data-catalog-feature="${code}" aria-label="${esc(uiText("Шедевр страны {country}", {country:name}))}">${uiText("Шедевр")}</button>`
      : '';
    const banner = countryLink(flagBackdrop(code)+badges+heading,true);
    if (catalog.view === 'grid') {
      return `<article class="kgc-catalog-card" data-catalog-country="${code}">${banner}<div class="kgc-catalog-card-body"><div class="kgc-catalog-actions">${passport}${feature}</div></div></article>`;
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
    return `<article class="kgc-catalog-card" data-catalog-country="${code}">
      ${banner}
      <div class="kgc-catalog-card-body">
        ${preview}
        <div class="kgc-catalog-actions">${passport}${watchButton}${kgBookmarkButton(film)}
          ${feature}
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
    feed.innerHTML = matches.length ? matches.map(({row,rank}) => catalogCard(row,rank)).join('')
      : search?.status === 'loading' ? ''
      : `<p class="kgc-catalog-empty">${uiText("Страны не найдены. Измените запрос или сбросьте фильтры.")}</p>`;
    root.querySelector('[data-catalog-reset]').hidden = matches.length > 0 || search?.status === 'loading';
  }

  function showCatalog(restoreScroll = false) {
    parkAtlasMap();
    root.dataset.page = 'catalog';
    delete root.dataset.code;
    const data = catalogData();
    catalog.status ??= 'all';
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
    const saved = pickCountryFeature(watchedFor(code).map(localSavedFilm));
    if (!app.key()) {
      if (saved) openMovie({...saved,_kgCountry:code},button);
      return;
    }
    button.disabled = true;
    button.textContent = uiText("Загрузка…");
    try {
      const response = await app.getCountryFilms(code,1);
      if (!button.isConnected || !dialog.open) return;
      const film = pickCountryFeature(response.results) || saved;
      if (!film) {
        unavailableFeatures.add(code);
        button.textContent = uiText("Фильмы не найдены");
        button.removeAttribute('data-catalog-feature');
        button.removeAttribute('aria-label');
        return;
      }
      openMovie({...film,_kgCountry:code},button);
      button.textContent = uiText("Шедевр");
      button.setAttribute('aria-label', uiText("Шедевр страны {country}", {country:app.countryName(code)}));
    } catch (error) {
      button.textContent = uiText("Повторить");
      button.removeAttribute('aria-label');
      console.warn('[Moven] Не удалось загрузить фильм страны:',error);
    } finally {
      button.disabled = !button.hasAttribute('data-catalog-feature');
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
    if (button.hasAttribute('data-atlas-history')) {
      openWatchHistory(true);
    } else if (button.hasAttribute('data-open-catalog')) {
      catalog.atlasScroll = shell.scrollTop;
      const entry = button.dataset.openCatalog || 'all';
      catalog.atlasEntry = entry;
      if (entry) {
        Object.assign(catalog, {status:entry === 'all' ? 'all' : 'opened', region:'all', query:''});
        if (entry === 'screenings') catalog.view = 'grid';
        if (entry === 'opened') catalog.view = 'cards';
      }
      showCatalog();
      root.querySelector('[data-catalog-exit]')?.focus({preventScroll:true});
    } else if (button.hasAttribute('data-catalog-exit')) {
      atlas();
      shell.scrollTo({top:catalog.atlasScroll || 0,behavior:'instant'});
      const opener = [...root.querySelectorAll('[data-open-catalog]')]
        .find(control => control.dataset.openCatalog === catalog.atlasEntry);
      opener?.focus({preventScroll:true});
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
        console.warn('[Moven] Не удалось снять отметку просмотра:',error);
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
  const localSavedFilm=f=>({...f,id:f.id,title:f.title,original_title:f.original||'',release_date:f.year?f.year+'-01-01':'',poster_path:f.poster||null,vote_average:f.score||0,vote_count:f.votes||0,overview:f.overview||'',origin_country:f.countries||[f.cc],_kgCountry:f.cc});
  const favorites=()=>{try{return JSON.parse(localStorage.getItem('kgCountryFavorites')||'[]')}catch(_){return[]}};
  const favoriteLabel = saved => uiText(saved ? "Убрать из избранного" : "Добавить в избранное");
  const unique=a=>[...new Set(a.filter(Boolean))];
  // Bayesian rating prevents a tiny number of perfect scores from dominating the country feature.
  const countryScore=f=>{const votes=Number(f?.vote_count)||0,rating=Number(f?.vote_average)||0,priorVotes=1000,priorRating=6.6;return (votes/(votes+priorVotes))*rating+(priorVotes/(votes+priorVotes))*priorRating;};
  const pickCountryFeature=films=>{
    if(!films?.length)return null;
    const established=films.filter(f=>(Number(f.vote_count)||0)>=50);
    return (established.length?established:films).slice().sort((a,b)=>countryScore(b)-countryScore(a)||(Number(b.popularity)||0)-(Number(a.popularity)||0))[0]||null;
  };

  function watchedCountrySection(marked) {
    if(!marked.length)return '';
    const films=marked.slice().sort((a,b)=>String(b.watchedAt||'').localeCompare(String(a.watchedAt||'')));
    return `<div class="kgc-section"><h3>${uiText("Просмотренные фильмы")}</h3><span class="kgc-muted">${films.length}</span></div><div class="kgc-watched-list">${films.map(f=>`<button type="button" class="kgc-watched-film" data-open-saved="${esc(f.id)}" aria-label="${esc(uiText("Открыть фильм {title}",{title:f.title||uiText("Фильм")}))}">${f.poster?`<img src="https://image.tmdb.org/t/p/w154${f.poster}" loading="lazy" alt="">`:'<span class="kgc-watched-poster material-symbols-outlined" aria-hidden="true">movie</span>'}<span><b>${esc(f.title||uiText("Фильм"))}</b><small>${esc(f.year||'')}${Number(f.score)>0?` · ★ ${Number(f.score).toFixed(1)}`:''}</small></span><span aria-hidden="true">→</span></button>`).join('')}</div>`;
  }
  let passportFromCatalog = false;
  async function country(code){
    if(!app.countries().includes(code))return atlas();
    closePassportSection();
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
      renderCountry(code,local,null,marked,false,uiText("Для каталога TMDB добавьте ключ в настройках. Ваши просмотренные фильмы уже доступны."));return;
    }
    try{
      const result=await app.getCountryFilms(code,1);if(state.code!==code)return;
      const films=(result.results||[]).map(f=>({...f,_kgCountry:code}));
      state.films=films;state.total=result.total_results||0;
      renderCountry(code,films,state.total,marked,false);
      loadCountryDirectors(films,code);
    }catch(error){
      if(state.code!==code)return;
      const local=marked.map(f=>({...localSavedFilm(f),_kgCountry:code}));
      renderCountry(code,local,null,marked,false,uiText("Не удалось загрузить каталог TMDB. Ниже показаны ваши отмеченные фильмы."));
    }
  }

  function countryStatistics(films) {
    const rated=films.filter(f=>Number.isFinite(Number(f.vote_average)) && Number(f.vote_average)>0 && Number(f.vote_average)<=10);
    const dated=films.filter(f=>/^\d{4}$/.test(String(f.release_date||'').slice(0,4)) && Number(String(f.release_date).slice(0,4))>1800);
    const ratings=Array.from({length:10},(_,i)=>({key:String(10-i),label:`${10-i} ★`,films:rated.filter(f=>Math.max(1,Math.round(Number(f.vote_average)))===10-i)}));
    const decades=[...new Set(dated.map(f=>Math.floor(Number(String(f.release_date).slice(0,4))/10)*10))].sort((a,b)=>b-a);
    const epochs=decades.map(d=>({key:String(d),label:`${d}–${d+9}`,films:dated.filter(f=>Math.floor(Number(String(f.release_date).slice(0,4))/10)*10===d)}));
    const years=dated.map(f=>Number(String(f.release_date).slice(0,4)));
    return {rated,dated,ratings,epochs,average:rated.length?rated.reduce((sum,f)=>sum+Number(f.vote_average),0)/rated.length:0,range:years.length?`${Math.min(...years)} — ${Math.max(...years)}`:'—'};
  }
  function closePassportSection() {
    passportSection='';passportBucket=null;passportDetail.hidden=true;root.hidden=false;
  }
  function openPassportSection(section) {
    passportScroll=shell.scrollTop;passportSection=section;passportBucket=null;
    root.hidden=true;historyView.hidden=true;passportDetail.hidden=false;
    if(section==='catalog'){state.filter='all';root.querySelectorAll('[data-country-filter]').forEach(b=>b.classList.toggle('active',b.dataset.countryFilter==='all'));paintFilms(state.films,'all');}
    renderPassportSection();shell.scrollTo({top:0,behavior:'instant'});
    passportDetail.querySelector('[data-passport-back]')?.focus({preventScroll:true});
  }
  function renderPassportSection() {
    if(!passportSection)return;
    const titles={catalog:'Каталог',rating:'Средний рейтинг',stamps:'Штампы',epochs:'Эпохи в выборке'};
    const title=uiText(titles[passportSection]),stats=countryStatistics(state.films);
    const sample=state.total==null ? uiText('Просмотренные фильмы, сохранённые на устройстве') : uiText('{loaded} из {total} фильмов каталога TMDB',{loaded:fmt(state.films.length),total:fmt(state.total)});
    passportDetail.innerHTML=`<header class="kgc-head"><button type="button" class="kgc-icon" data-passport-back aria-label="${uiText('Назад к паспорту страны')}">←</button><div class="kgc-head-title"><b>${esc(title)}</b><small>${esc(app.countryName(state.code))}</small></div></header>`;
    if(passportSection==='stamps')return;
    if(passportSection==='catalog'){
      passportDetail.insertAdjacentHTML('beforeend',`<div class="kgc-stat-content"><p class="kgc-stat-note">${esc(sample)}</p><div class="kgc-films-grid" data-passport-films></div></div>`);
      passportDetail.querySelector('[data-passport-films]').innerHTML=root.querySelector('#kg-country-films')?.innerHTML||'';
      return;
    }
    const rating=passportSection==='rating',rows=rating?stats.ratings:stats.epochs,total=rating?stats.rated.length:stats.dated.length;
    if(passportBucket!==null && !rows.some(row=>row.key===passportBucket))passportBucket=null;
    const selected=rows.find(row=>row.key===passportBucket),films=selected?selected.films:rating?stats.rated:stats.dated;
    const ordered=films.slice().sort(rating?(a,b)=>Number(b.vote_average)-Number(a.vote_average):(a,b)=>String(b.release_date).localeCompare(String(a.release_date)));
    const chart=rows.map(row=>`<button type="button" class="kgc-stat-bar" data-passport-bucket="${row.key}" aria-pressed="${passportBucket===row.key}" aria-label="${esc(uiText('{label}: {count} фильмов',{label:row.label,count:row.films.length}))}"><span>${esc(row.label)}</span><span class="kgc-stat-track" aria-hidden="true"><span class="kgc-stat-fill" style="width:${total?100*row.films.length/total:0}%"></span></span><small>${fmt(row.films.length)}</small></button>`).join('');
    passportDetail.insertAdjacentHTML('beforeend',`<main class="kgc-stat-content"><section class="kgc-stat-summary"><span class="kgc-kicker">${esc(sample)}</span><strong class="kgc-stat-number">${rating?(stats.average?stats.average.toFixed(1):'—'):stats.range}</strong><p class="kgc-stat-note">${esc(rating?uiText('Средняя оценка TMDB · шкала от 1 до 10'):uiText('Распределение по десятилетиям'))}</p><div class="kgc-stat-chart${rating ? '' : ' kgc-stat-epochs'}">${chart}</div><p class="kgc-stat-note">${esc(rating?uiText('По средней оценке TMDB каждого фильма, округлённой до целого. Без оценки: {count}.',{count:state.films.length-total}):uiText('По году выхода фильма. Без даты: {count}.',{count:state.films.length-total}))}</p></section><h2>${esc(selected?uiText('Фильмы: {label}',{label:selected.label}):uiText('Фильмы в выборке'))}</h2>${selected?`<button type="button" class="kgc-btn secondary" data-passport-clear>${uiText('Сбросить фильтр')}</button>`:''}<div class="kgc-stat-films">${ordered.map(f=>`<button type="button" class="kgc-stat-film" data-film-id="${f.id}"><span><b>${esc(f.title||uiText('Фильм'))}</b><small>${esc(year(f))}</small></span><span>★ ${Number(f.vote_average)>0?Number(f.vote_average).toFixed(1):'—'}</span></button>`).join('')||`<p class="kgc-empty">${uiText('Нет данных для этой выборки.')}</p>`}</div>${state.films.length<state.total && app.key()?`<button type="button" class="kgc-btn secondary" data-load-more>${uiText('Показать ещё фильмы')}</button>`:''}</main>`);
  }
  passportDetail.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button)return;
    if(button.hasAttribute('data-passport-back')){
      const section=passportSection,top=passportScroll;closePassportSection();shell.scrollTo({top,behavior:'instant'});
      root.querySelector(`[data-passport-section="${section}"]`)?.focus({preventScroll:true});
    }else if(button.hasAttribute('data-passport-bucket')){
      passportBucket=passportBucket===button.dataset.passportBucket?null:button.dataset.passportBucket;
      renderPassportSection();passportDetail.querySelector(`[data-passport-bucket="${button.dataset.passportBucket}"]`)?.focus({preventScroll:true});
    }else if(button.hasAttribute('data-passport-clear')){passportBucket=null;renderPassportSection();}
  });
  root.addEventListener('click',event=>{
    const tile=event.target.closest('[data-passport-section]');
    if(tile)openPassportSection(tile.dataset.passportSection);
  });

  function renderCountry(code,films,total,marked,loading=false,message=''){
    if(root.dataset.code!==code)return;
    state.code=code;state.films=films;state.total=total;state.marked=marked;
    const name=app.countryName(code),counts=app.counts(),nWatched=marked.length;
    const {average:avg,range}=countryStatistics(films);
    const featured=pickCountryFeature(films);
    const catalogCount = loading ? '…' : total == null ? '—' : fmt(total);
    const catalogFoot = total == null ? uiText("Нет данных") : uiText("фильмов в каталоге TMDB");
    const filmCount = total ?? films.length;
    const favoriteCountries = favorites();
    const saved = favoriteCountries.includes(code);
    const tabs=unique([code,...Object.keys(counts).sort((a,b)=>(counts[b]||0)-(counts[a]||0)),...favoriteCountries,...shortCountries]).filter(c=>app.countries().includes(c)).slice(0,7);
    const genres=unique(films.flatMap(f=>f._genres||[])).slice(0,3);
    const editorial={JP:'«От самурайского эпоса Акиры Куросавы до анимационной магии Studio Ghibli и медитативного неонуара».',FR:'«От поэтического реализма и новой волны до авторского кино, которое меняет язык экрана».',KR:'«От пронзительных семейных драм до смелых жанровых историй и нового корейского нуара».',IT:'«От неореализма послевоенных улиц до барочной красоты итальянского авторского кино».',AU:'«Большие пейзажи, независимый дух и истории, в которых чувствуется дыхание целого континента».',US:'«От золотого века Голливуда до независимого кино — большая история американского экрана».',GB:'«Классическая школа актёрского мастерства, остроумные драмы и смелое британское кино».',DE:'«От экспрессионистских теней до точных, бескомпромиссных историй современного немецкого кино».',IN:'«Музыка, масштабные семейные саги и десятки кинематографических традиций одной страны».',PL:'«Поэтическое авторское кино и истории, оставившие глубокий след в мировой культуре».'}[code]||uiText("«Откройте для себя кино {country}: заметные авторы, истории и фильмы разных эпох».", {country: name});
    const latest=marked.slice().sort((a,b)=>String(b.watchedAt||'').localeCompare(String(a.watchedAt||'')))[0];
    root.innerHTML=`
      <header class="kgc-head"><button class="kgc-icon" data-atlas-back aria-label="${passportFromCatalog ? uiText("Назад к каталогу") : uiText("Назад к атласу")}"><span class="material-symbols-outlined">arrow_back</span></button><div class="kgc-head-title"><div class="kgc-head-title-row"><b>${uiText("Путешествие")}</b></div></div><button class="kgc-icon" data-country-share="${code}" aria-label="${uiText("Поделиться")}"><span class="material-symbols-outlined">share</span></button><button class="kgc-icon" data-country-favorite="${code}" aria-label="${favoriteLabel(saved)}"><span class="material-symbols-outlined" aria-hidden="true">${saved ? 'bookmark_added' : 'bookmark_add'}</span></button><button class="kgc-icon kgc-account-icon" data-kga-account aria-label="${uiText("Профиль")}"><span class="material-symbols-outlined">person</span></button></header>
      <div class="kgc-country-tabs" role="group" aria-label="${uiText("Выбор страны для просмотра")}">${tabs.map(c=>`<button type="button" class="kgc-country-tab ${c===code?'active':''}" data-open-country="${c}" aria-pressed="${c===code}">${flag(c)}<span>${esc(app.countryName(c))}</span></button>`).join('')}</div>
      <section class="kgc-hero-full${nWatched?' kgc-hero-opened':''}">${flagBackdrop(code)}<div class="kgc-hero-copy"><h1 class="kgc-country-name">${esc(name)}</h1><span class="kgc-passport-label">${uiText("Кинопаспорт страны")}</span>${nWatched?'':`<p class="kgc-blurb">${esc(uiText(editorial))}</p>`}<div class="kgc-action-row"><button type="button" class="kgc-btn" data-country-search="${code}"><span class="material-symbols-outlined">casino</span>${uiText("Найти фильм этой страны")}</button></div></div></section>
      ${watchedCountrySection(marked)}
      ${message? `<p class="kgc-muted kgc-pad" style="margin:0;padding-top:0">${esc(message)}</p>` : ''}
      <div class="kgc-section" style="margin-top:7px"><div style="display:flex;align-items:center;gap:8px"><span class="material-symbols-outlined kgc-section-icon">badge</span><h3>${uiText("Синефильский паспорт")}</h3></div><span class="kgc-kicker">${nWatched?uiText("Статус: золотой"):uiText("Статус: новый")}</span></div>
      <section class="kgc-passport-grid"><button type="button" class="kgc-passport-tile" data-passport-section="catalog"><div class="kgc-passport-label"><span>${uiText("Каталог")}</span><span class="material-symbols-outlined">movie</span></div><div><div class="kgc-passport-value">${catalogCount}</div><div class="kgc-passport-foot">${catalogFoot}</div></div></button><button type="button" class="kgc-passport-tile" data-passport-section="rating"><div class="kgc-passport-label"><span>${uiText("Средний рейтинг")}</span><span class="kgc-rating">★ ${avg?avg.toFixed(1):'—'}</span></div><div><div class="kgc-passport-value">${avg?avg.toFixed(1):'—'}</div><div class="kgc-passport-foot">${uiText("средний балл загруженных фильмов")}</div></div></button><button type="button" class="kgc-passport-tile" data-passport-section="stamps"><div class="kgc-passport-label"><span>${uiText("Штампы")}</span><span class="material-symbols-outlined">verified</span></div><div class="kgc-passport-value">—</div><div class="kgc-passport-foot">${uiText("Система наград")}</div></button><button type="button" class="kgc-passport-tile" data-passport-section="epochs"><div class="kgc-passport-label"><span>${uiText("Эпохи в выборке")}</span><span class="material-symbols-outlined">history_edu</span></div><div><div class="kgc-passport-value" style="font-size:17px">${range}</div><div class="kgc-passport-foot">${uiText("годы загруженных фильмов")}</div></div></button></section>
      <div class="kgc-section"><div style="display:flex;align-items:center;gap:8px"><span class="material-symbols-outlined kgc-section-icon rose">military_tech</span><h3>${uiText("Рекомендуемый фильм")}</h3></div><span class="kgc-kicker">${featured?uiText("Выбор страны"):uiText("Каталог")}</span></div>
      ${featured?`<div class="kgc-films-grid" data-country-recommendation>${countryFilmCard(featured)}</div>`:`<div class="kgc-pad"><div class="kgc-empty">${esc(message||uiText("Каталог TMDB пока не вернул фильмы для этой страны."))}</div></div>`}
      <div class="kgc-section"><div style="display:flex;align-items:center;gap:8px"><span style="color:rgb(var(--kg-primary))">🎭</span><h3>${uiText("Мэтры кинематографа")}</h3></div><span class="kgc-kicker" data-master-count>TMDB</span></div><div class="kgc-rowcards kg-cast-rail" id="kg-country-people"><div class="kgc-empty">${loading ? uiText("Загружаем участников…") : total == null ? uiText("Нет данных") : uiText("Для этого списка TMDB пока не вернул режиссёров.")}</div></div>
      <div class="kgc-section"><div style="display:flex;align-items:center;gap:8px"><span style="color:rgb(var(--kg-primary))">▣</span><h3>${uiText("Коллекция картин")}</h3></div><span class="kgc-muted">${total == null && !films.length ? uiText("Нет данных") : uiText("{count} лент", {count: fmt(filmCount)})}</span></div><div class="kgc-filter">${[['all',total == null && !films.length ? uiText("Все ленты") : uiText("Все ленты ({count})", {count: fmt(filmCount)})],['classic',uiText("Золотая классика")],['newwave','1970–1999'],['modern','2000+']].map(([key,label])=>`<button class="${key==='all'?'active':''}" data-country-filter="${key}">${label}</button>`).join('')}</div><div class="kgc-films-grid" id="kg-country-films"></div>
      ${latest?`<div class="kgc-section"><h3>${uiText("Последняя отмеченная лента")}</h3></div><div class="kgc-pad" style="padding-top:0"><button class="kgc-country-pill has" data-open-saved="${esc(latest.id)}">${flag(code)} ${esc(latest.title||uiText("Фильм"))} · ${esc(latest.year||'')}</button></div>`:''}
      <div class="kgc-foot"><button class="kgc-btn secondary" data-atlas-back style="width:100%">${passportFromCatalog ? uiText("←　К каталогу стран") : uiText("←　К атласу открытий")}</button></div>`;
    paintFilms(films,state.filter);
    renderPassportSection();
  }

  async function loadCountryDirectors(films,code){
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
    if(people)people.innerHTML=directors.length?directors.map(p=>`<button type="button" class="kg-person-card flex flex-col items-center text-center py-1" data-kg-person-id="${p.id}" data-kg-person-profile="${esc(p.photo||'')}" data-kg-person-name="${esc(p.name)}" data-kg-person-role="Режиссёр"><span class="kg-cast-avatar rounded-full overflow-hidden mb-1 bg-surface-variant flex items-center justify-center">${p.photo?`<img class="w-full h-full object-cover" loading="lazy" src="https://image.tmdb.org/t/p/w185${esc(p.photo)}" alt="">`:'<span class="material-symbols-outlined text-text-muted" aria-hidden="true">person</span>'}</span><span class="kg-cast-name text-on-surface font-semibold">${esc(p.name)}</span><span class="font-micro-caption text-micro-caption text-text-muted">${uiText("Режиссёр")}</span></button>`).join(''):`<div class="kgc-empty">${uiText("TMDB не вернул режиссёров для первой страницы каталога.")}</div>`;
    const masterCount=root.querySelector('[data-master-count]');if(masterCount)masterCount.textContent=uiText("Все ({count})", {count: directors.length});
  }

  function matchesFilter(f,filter){
    const y=Number(year(f));
    return filter==='classic'?y&&y<1970:filter==='newwave'?y>=1970&&y<2000:filter==='modern'?y>=2000:true;
  }
  function countryFilmCard(f){
    return `<article class="kgc-filmcard" data-film-id="${f.id}"><div style="position:relative;display:block;aspect-ratio:2/3;background:rgb(var(--kg-surface-container-high));cursor:pointer" data-film-id="${f.id}" role="button" tabindex="0" aria-label="${esc(uiText("Открыть фильм {title}", {title: f.title}))}">${poster(f)?`<img loading="lazy" src="${poster(f)}" alt="${esc(uiText("Постер «{title}»", {title: f.title}))}" style="width:100%;height:100%;object-fit:cover">`:`<span class="kgc-filmph">${esc(f.title)}</span>`}<span class="kgc-feature-badge">★ ${Number(f.vote_average||0).toFixed(1)}</span><span class="kgc-feature-runtime" style="top:auto;right:7px;bottom:7px">${esc(year(f))}</span></div><div class="kgc-filmcopy" data-film-id="${f.id}" role="button" tabindex="0"><b>${esc(f.title||uiText("Фильм"))}</b><small>${esc(year(f))}${f.original_title&&f.original_title!==f.title?` · ${esc(f.original_title)}`:''}</small><span class="kgc-film-actions"><small>TMDB · ★ ${Number(f.vote_average||0).toFixed(1)}</small></span></div></article>`;
  }
  function paintFilms(films,filter){
    const box=root.querySelector('#kg-country-films');if(!box)return;
    const filtered=films.filter(f=>matchesFilter(f,filter));
    box.innerHTML=filtered.length?filtered.map(countryFilmCard).join(''):`<div class="kgc-empty" style="grid-column:1/-1">${uiText("В этой категории пока нет картин в загруженной части каталога.")}</div>`;
    if(films.length<state.total&&films.length>0)box.insertAdjacentHTML('beforeend',`<button class="kgc-btn secondary kgc-load-more" type="button" data-load-more>${state.loadingMore?uiText("Загружаем…"):uiText("Показать ещё фильмы")}</button>`);
    if(passportSection==='catalog') {const copy=passportDetail.querySelector('[data-passport-films]');if(copy)copy.innerHTML=box.innerHTML;}
    const summary=countryStatistics(films);
    const ratingTile=root.querySelector('[data-passport-section="rating"]');
    if(ratingTile){ratingTile.querySelector('.kgc-passport-value').textContent=summary.average?summary.average.toFixed(1):'—';ratingTile.querySelector('.kgc-rating').textContent='★ '+(summary.average?summary.average.toFixed(1):'—');}
    const epochValue=root.querySelector('[data-passport-section="epochs"] .kgc-passport-value');if(epochValue)epochValue.textContent=summary.range;

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

  let historyAtlasScroll = null;
  function openWatchHistory(fromAtlas = false) {
    closePassportSection();
    historyAtlasScroll = fromAtlas ? shell.scrollTop : null;
    historyView.querySelector('[data-atlas-close]').setAttribute('aria-label',
      uiText(fromAtlas ? "Назад к атласу" : "Закрыть историю"));
    parkAtlasMap();
    root.dataset.page = 'history';
    delete root.dataset.code;
    root.hidden = true;
    historyView.hidden = false;
    window.KGMountBottomNav?.(dialog, dialog, "history");
    window.KGRenderWatchedByCountry('');
    if (!dialog.open) {window.KGFilmCard?.stopTrailers();dialog.showModal();}
    shell.scrollTo({top:0,behavior:'instant'});
    historyView.querySelector('[data-atlas-close]').focus({preventScroll:true});
  }
  window.KGOpenWatchHistory = () => openWatchHistory();

  function showAtlas() {
    closePassportSection();
    root.hidden = false;
    historyView.hidden = true;
    window.KGMountBottomNav?.(dialog, dialog, "journey");
    atlas();
    shell.scrollTo({top:0,behavior:'instant'});
  }
  window.KGSelectWatchedCountry=country;
  window.KGOpenCountryPassport = code => {
    if (!app.countries().includes(code)) return;
    window.KGFilmCard.stopTrailers();
    [...document.querySelectorAll('dialog[open]')].reverse().forEach(open => {
      if (open !== dialog) open.close();
    });
    if (!dialog.open) dialog.showModal();
    showAtlas();
    return country(code);
  };
  const mapButton=document.getElementById('mapBtn');
  const originalMapClick=mapButton?.onclick;
  if(mapButton)mapButton.onclick=function(event){originalMapClick?.call(this,event);showAtlas();};
  document.addEventListener('click',event=>{
    const target=event.target.closest('[data-open-country],[data-atlas-back],[data-atlas-close],[data-country-search],[data-open-map],[data-open-globe],[data-atlas-scroll-map],[data-country-filter],[data-load-more],[data-country-favorite],[data-country-share],[data-kga-account],[data-film-id],[data-open-saved]');
    if(!target || !dialog.contains(target))return;
    if(target.dataset.openCountry){country(target.dataset.openCountry);return;}
    if(target.hasAttribute('data-atlas-back')){
      if(passportFromCatalog) showCatalog(true);
      else {atlas();shell.scrollTo({top:0,behavior:'instant'});}
      return;
    }
    if (target.hasAttribute('data-atlas-close')) {
      if (root.dataset.page === 'history' && historyAtlasScroll !== null) {
        const top = historyAtlasScroll;
        historyAtlasScroll = null;
        showAtlas();
        shell.scrollTo({top, behavior:'instant'});
        root.querySelector('[data-atlas-history]')?.focus({preventScroll:true});
      } else dialog.close?.();
      return;
    }
    if (target.dataset.countrySearch && !app.key()) {
      const settings = document.getElementById('settings');
      if (!settings) return;
      const code = target.dataset.countrySearch;
      settings.addEventListener('close', () => {
        if (dialog.open && root.dataset.code === code && app.key()) country(code);
      }, {once:true});
      document.getElementById('gear')?.click();
      settings.querySelector('#kgs-token')?.focus();
      return;
    }
    if(target.dataset.countrySearch){const code=target.dataset.countrySearch;target.disabled=true;target.dataset.originalLabel=target.innerHTML;target.innerHTML=`<span class="material-symbols-outlined">progress_activity</span>${uiText("Ищем фильм…")}`;Promise.resolve(app.searchCountry(code)).catch(error=>console.warn('[Moven] Country search failed:',error)).finally(()=>{if(target.isConnected){target.disabled=false;target.innerHTML=target.dataset.originalLabel;}});return;}
    if(target.hasAttribute('data-kga-account')){window.KGOpenAccountPage?.('register');return;}
    if (target.dataset.countryFavorite) {
      const code = target.dataset.countryFavorite;
      const list = favorites();
      const saved = !list.includes(code);
      const next = saved ? [...list, code] : list.filter(item => item !== code);
      localStorage.setItem('kgCountryFavorites', JSON.stringify(next));
      target.querySelector('.material-symbols-outlined').textContent = saved ? 'bookmark_added' : 'bookmark_add';
      target.setAttribute('aria-label', favoriteLabel(saved));
      return;
    }
    if(target.dataset.countryShare){const code=target.dataset.countryShare,url=location.href.split('#')[0]+'#country-'+encodeURIComponent(code);if(navigator.share)navigator.share({title:app.countryName(code)+' · '+uiText('Moven'),url}).catch(()=>{});else navigator.clipboard?.writeText(url).then(()=>{target.textContent='✓';setTimeout(()=>{if(target.isConnected)target.textContent='↗'},1200)}).catch(()=>{});return;}
    if(target.dataset.countryFilter){state.filter=target.dataset.countryFilter;root.querySelectorAll('[data-country-filter]').forEach(b=>b.classList.toggle('active',b===target));paintFilms(state.films,state.filter);return;}
    if(target.hasAttribute('data-load-more')){loadMore();return;}
    if(target.hasAttribute('data-atlas-scroll-map')){root.querySelector('.kgc-map')?.scrollIntoView({behavior:'smooth',block:'center'});return;}
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
    try{const result=await app.getCountryFilms(code,page);if(state.code!==code)return;const known=new Set(state.films.map(f=>String(f.id)));state.films.push(...(result.results||[]).filter(f=>!known.has(String(f.id))).map(f=>({...f,_kgCountry:code})));state.page=page;paintFilms(state.films,state.filter);loadCountryDirectors(state.films,code);}
    catch(_){const more=root.querySelector('[data-load-more]');if(more)more.textContent=uiText("Не удалось загрузить · повторить");}
    finally{state.loadingMore=false;paintFilms(state.films,state.filter);renderPassportSection();}
  }
  // Country routes belong to the native Journey dialog, including SVG targets.
  // Handle them before the document-level catalogue/film delegates.
  dialog.addEventListener('click',event=>{
    if(!dialog.open)return;
    const zoom=event.target.closest('[data-atlas-map-zoom]');
    if(zoom){
      event.preventDefault();event.stopPropagation();
      const previous=atlasMapScale;atlasMapScale=Math.max(1,Math.min(3,previous+Number(zoom.dataset.atlasMapZoom)));
      applyAtlasMapScale(previous);return;
    }
    const hit=event.target.closest('[data-open-country],#mapbox [data-c]');
    const card=event.target.closest('[data-catalog-country]');
    // The country card opens its passport; film and action controls keep their own routes.
    const cardClick=card && !event.target.closest('a,button,input,select,textarea,label,[role="button"]');
    const route=hit || (cardClick ? card : null);
    if(!route||!dialog.contains(route))return;
    const code=route.dataset.openCountry||route.dataset.c||route.dataset.catalogCountry;
    if(!app.countries().includes(code))return;
    event.preventDefault();event.stopPropagation();
    country(code).catch(error=>console.warn('[Moven] country passport:',error));
  },true);
  if(typeof window.renderJourney==='function'){
    const originalRender=window.renderJourney;
    window.renderJourney=function(){originalRender();showAtlas();};
  }
  dialog.addEventListener('close', () => {
    if (dialog.open) return;
    closePassportSection();
    root.dataset.page = '';
    root.hidden = false;
    historyView.hidden = true;
  });
  function openSharedPassport() {
    const code = /^#country-([a-z]{2})$/i.exec(location.hash)?.[1].toUpperCase();
    if (!code || !app.countries().includes(code)) return;
    if (!dialog.open) {window.KGFilmCard?.stopTrailers();dialog.showModal();}
    showAtlas();
    country(code);
  }
  window.addEventListener('hashchange', openSharedPassport);
  openSharedPassport();
  document.addEventListener('DOMContentLoaded', () => {
    if (dialog.open) window.KGMountBottomNav?.(dialog, dialog, historyView.hidden ? "journey" : "history");
  }, {once:true});

  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    if (!event.target.matches('[role="button"][data-film-id]')) return;
    event.preventDefault();
    event.target.click();
  });
})();
