/* Profile editor adapted from the Stitch export. */
(() => {
  const icon = name => `<span class="material-symbols-outlined" aria-hidden="true">${name}</span>`;
  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]);
  const genres = ["Нео-нуар", "Авторское кино / Артхаус", "Французская Новая Волна", "Психологический триллер", "Магический реализм", "Джалло", "Сай-фай / Киберпанк", "Поэтический реализм", "Слоу-синема", "Классический вестерн"];
  const sampleShelf = [
  {
    "title": "Чунцинский экспресс",
    "year": "1994",
    "ratio": "2.39:1",
    "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuB3Qdqul5D9BwFXfDFpgVMAJb4z6qtAkF8kt-NniyqHzDDzfXMEpqmNta_Vsek-Y03aRC3CSZsFuigY3E3yjAhl5UZc7YLVmBrTjGSEOsLTjAffMiGkSAr0iotVWw43KjUeyERRRWqd2Gb-UomuoYO5p2rshd9SwP_NhSqyc4bvks1bfrmLDdzProf57fAwAbsUzYx8xByX_pIcC3Rq1zFdX6rYB-yk4ALJcsXVHdk"
  },
  {
    "title": "Апокалипсис сегодня",
    "year": "1979",
    "ratio": "70mm",
    "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuBb3x54lre8GvUi1mTOfOcvoq-st4m6PQ1trMtmflTmiq7KE5PrcGmlmmlZlvcKYt76k21GkokHManf2obFFXiqAI8GuyHGC7CJorrCKH_3_-xLWNK7ZcbIq6GT30VHL4unipuFIa2wRBCW9TcJSeD_J9beWgBgCACA9-w4MXdsgeW9exdkg70IyXE69ox9uFB6n_Nh5joTM-_h-0FC86pj50_-nJoHHQ3x2uQ78KE"
  },
  {
    "title": "Персона",
    "year": "1966",
    "ratio": "1.37:1",
    "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuB_7CrBG2NynsmNJqflAYQ8s4Mlkp9K0JSzfcOzhlVxHS5gMytvCUtzFHv598hNwNr52lw2PgHlGmqQ4KDwOtBKbQ6x_qWGL67OKYpOjdOYMzKxaeKW6C4H6mfUzcU598ws5X5TIy77aa1SFYzRF2XHwToOqba8aG5o1_2Yo1pGH3zyn7IyksgXVO5nxKDIewQferIHjX1G6e-S1zu98Ywvky4XHN8-OXx49TYAlVs"
  },
  {
    "title": "Любовное настроение",
    "year": "2000",
    "ratio": "1.66:1",
    "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuBdPJh286WbSRCHQZXzzL58Yn--5GmgZqrYyP5c93nC14Bey4JbvtY4uKHv-YcZp8M9DeoFW20l_37VeTiSafLBQTcRdIGJ3m8xjzET61ts1UOPxP_9nogwXG7GE5rw46-oDRKFZf7g9UuT3H9me4EmqkFqfyg7AG5kQDQDWXIcQ3yIYs9TgW1swQcPsuYkhRBExxdOb5pucDvcusi35SzvHPJYEAJ6SpB0YlHwOmo"
  }
];
  const styles = document.createElement("style");
  styles.textContent = `
    #kg-profile-editor {
      position:fixed;inset:0;margin:0 auto;width:min(100%,520px);max-width:none;
      height:100dvh;max-height:100dvh;overflow:hidden;border:0;padding:0;
      background:rgb(var(--kg-surface));color:rgb(var(--kg-on-surface));
      font:14px/1.5 'Noto Serif',serif;color-scheme:dark;
    }
    #kg-profile-editor::backdrop {background:rgb(var(--kg-canvas-obsidian) / .92)}
    #kg-profile-editor [hidden] {display:none}
    .kg-edit-shell {height:100%;display:flex;flex-direction:column}
    .kg-edit-header,.kg-edit-toolbar,.kg-edit-nav {
      display:flex;align-items:center;justify-content:space-between;gap:8px;
      flex:none;background:rgb(var(--kg-surface));color:rgb(var(--kg-primary));
    }
    .kg-edit-header {min-height:calc(56px + env(safe-area-inset-top,0px));padding:env(safe-area-inset-top,0px) 4% 0}
    .kg-edit-header strong {font-size:22px;line-height:1}
    .kg-edit-header small {display:block;font-size:9px;letter-spacing:.1em;text-transform:uppercase}
    .kg-edit-header img {width:32px;height:32px;border-radius:50%;border:1px solid rgb(var(--kg-primary));object-fit:cover}
    .kg-edit-header button,.kg-edit-nav button {min-width:44px;min-height:44px}
    .kg-edit-toolbar {display:grid;grid-template-columns:1fr minmax(0,1.6fr) 1fr;text-align:center;border-top:1px solid rgb(var(--kg-surface-border))}
    .kg-edit-toolbar button:last-child {justify-self:end}
    .kg-edit-toolbar h1 {line-height:1.15}
    .kg-edit-scroll {min-height:0;flex:1;overflow:auto;overscroll-behavior:contain}
    .kg-edit-form {display:flex;flex-direction:column;min-height:0;flex:1}
    .kg-edit-nav {justify-content:space-around;padding:5px 2% calc(5px + env(safe-area-inset-bottom,0px));box-shadow:0 -6px 24px #0005}
    .kg-edit-nav button {display:grid;justify-items:center;align-content:center;gap:3px;font-size:11px;color:rgb(var(--kg-on-surface-variant))}
    #kg-profile-editor button:focus-visible,#kg-profile-editor input:focus-visible,#kg-profile-editor textarea:focus-visible {
      outline:2px solid rgb(var(--kg-primary));outline-offset:2px;
    }
    #kg-profile-editor input[type=text],#kg-profile-editor textarea {min-width:0;font-size:16px}
    #kg-edit-name {padding-inline-end:36px}
    #kg-edit-sheet {
      color:inherit;background:rgb(var(--kg-surface-panel));position:fixed;inset:auto 0 0;
      margin:0 auto;width:min(100%,430px);max-width:none;max-height:85dvh;overflow:auto;
      border:0;border-top:1px solid rgb(var(--kg-primary) / .35);border-radius:24px 24px 0 0;
      padding:12px 22px calc(22px + env(safe-area-inset-bottom,0px));
      animation:kgEditSheetIn .3s ease-out both;
    }
    #kg-edit-sheet::backdrop {background:#000b;backdrop-filter:blur(8px);animation:kgEditBackdrop .3s ease-out both}
    #kg-edit-sheet[data-closing] {animation:kgEditSheetOut .3s ease-in both}
    #kg-edit-sheet[data-closing]::backdrop {animation:kgEditBackdropOut .3s ease-in both}
    @keyframes kgEditSheetIn {from {transform:translateY(100%)} to {transform:translateY(0)}}
    @keyframes kgEditBackdrop {from {opacity:0} to {opacity:1}}
    @keyframes kgEditSheetOut {to {transform:translateY(100%)}}
    @keyframes kgEditBackdropOut {to {opacity:0}}
    .kg-edit-sheet-handle {width:48px;height:5px;border-radius:20px;background:rgb(var(--kg-text-muted) / .35);margin:0 auto 12px}
    .kg-edit-sheet-head {display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}
    .kg-edit-sheet-head h2 {font-size:20px;font-weight:700}
    .kg-edit-sheet-head button {width:32px;height:32px}
    .kg-edit-panel,.kg-edit-panel form {display:grid;gap:10px}
    .kg-edit-panel p {color:rgb(var(--kg-on-surface-variant))}
    .kg-edit-panel button,.kg-edit-panel input {padding:9px;border-radius:9px;background:rgb(var(--kg-surface-container-high));color:rgb(var(--kg-primary))}
    .kg-edit-panel .kg-edit-discard {background:#561c29;color:#ffd9df}
    .kg-edit-panel button:disabled {opacity:.35}
    .kg-edit-shelf-row {display:flex;align-items:center;gap:8px}
    .kg-edit-shelf-row b {flex:1}
    .kg-edit-poster {position:relative;aspect-ratio:2/3;overflow:hidden;border-radius:6px;background:rgb(var(--kg-surface-container-highest));display:grid;place-items:center}
    .kg-edit-poster img {width:100%;height:100%;object-fit:cover}
    .kg-edit-poster > span:first-of-type:not(.material-symbols-outlined) {position:absolute;top:5px;left:5px;background:#110e16c9;padding:0 4px;border-radius:4px;color:rgb(var(--kg-primary))}
    .kg-edit-poster button {position:absolute;top:5px;right:5px;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:#93000a;color:#ffd9db}
    .kg-edit-poster button .material-symbols-outlined,.kg-edit-chip .material-symbols-outlined {font-size:16px}
    .kg-edit-chips {display:flex;flex-wrap:wrap;gap:7px}
    .kg-edit-chip {display:inline-flex;align-items:center;gap:5px;padding:5px 9px;border-radius:99px;background:rgb(var(--kg-surface-container-low));color:rgb(var(--kg-on-surface-variant));font-size:12px;transition:background-color .2s,color .2s}
    .kg-edit-chip[aria-pressed=true] {background:rgb(var(--kg-primary));color:#432c00}
    .kg-edit-switch {appearance:none;flex:none;width:44px;height:24px;border-radius:99px;border:0;background:rgb(var(--kg-surface-container-highest));padding:3px;cursor:pointer;transition:background-color .2s}
    .kg-edit-switch::before {content:"";display:block;width:18px;height:18px;border-radius:50%;background:rgb(var(--kg-on-surface));transition:transform .2s}
    .kg-edit-switch:checked {background:rgb(var(--kg-primary))}
    .kg-edit-switch:checked::before {transform:translateX(20px);background:#432c00}
    .kg-edit-toast {
      position:absolute;z-index:2;top:calc(66px + env(safe-area-inset-top,0px));left:5%;width:90%;
      pointer-events:none;display:flex;align-items:center;gap:10px;padding:12px;border-radius:12px;
      background:rgb(var(--kg-surface-container-high));border:1px solid rgb(var(--kg-primary) / .4);
      color:rgb(var(--kg-primary));box-shadow:0 10px 35px #0009;opacity:0;
      transform:translateY(-24px) scale(.95);transition:opacity .5s ease-out,transform .5s ease-out;
    }
    .kg-edit-toast[data-show] {opacity:1;transform:none}
    .kg-edit-toast small {display:block;color:rgb(var(--kg-on-surface-variant))}
    #kg-profile-editor #btnStateSaving,#kg-profile-editor #btnStateSuccess {display:none}
    #kg-profile-editor #saveChangesBtn[data-phase] #btnStateIdle {display:none}
    #kg-profile-editor #saveChangesBtn[data-phase="saving"] #btnStateSaving,
    #kg-profile-editor #saveChangesBtn[data-phase="saved"] #btnStateSuccess {display:flex}
    #kg-profile-editor #saveChangesBtn[data-phase=saving] {animation:kgEditGlow 1.2s ease-in-out infinite}
    #kg-profile-editor #saveChangesBtn[data-phase=saved] {background:linear-gradient(100deg,#0e4429,#107038 58%,rgb(var(--kg-primary-container)));color:white}
    .kg-edit-reel {animation:kgEditSpin .9s cubic-bezier(.4,0,.2,1) infinite}
    .kg-edit-check {animation:kgEditCheck .35s cubic-bezier(.175,.885,.32,1.275) both}
    .kg-edit-dot {animation:kgEditDot 2s ease-in-out infinite}
    @keyframes kgEditDot {50% {opacity:.5}}
    @keyframes kgEditSpin {to {transform:rotate(360deg)}}
    @keyframes kgEditGlow {
      0%,100% {box-shadow:0 0 15px rgb(var(--kg-primary) / .4),0 0 35px rgb(var(--kg-primary) / .2)}
      50% {box-shadow:0 0 28px rgb(var(--kg-primary) / .7),0 0 55px rgb(var(--kg-primary) / .35)}
    }
    @keyframes kgEditCheck {
      0% {transform:scale(.6) rotate(-20deg);opacity:0}
      70% {transform:scale(1.15) rotate(5deg);opacity:1}
      100% {transform:scale(1);opacity:1}
    }
    @media(prefers-reduced-motion:reduce) {
      #kg-profile-editor *,#kg-profile-editor *::before,#kg-edit-sheet::backdrop {
        animation-duration:.001ms!important;transition-duration:.001ms!important;
      }
    }
  `;
  document.head.appendChild(styles);

  const editor = document.createElement("dialog");
  editor.id = "kg-profile-editor";
  editor.setAttribute("aria-labelledby","kg-edit-title");
  const nav = [["home","public","Глобус"],["collections","collections_bookmark","Подборки"],["history","history","История"],["settings","tune","Настройки"]];
  editor.innerHTML = `
    <div class="kg-edit-shell">
      <header class="kg-edit-header">
        ${icon("local_movies")}
        <div class="flex-1"><strong>Kinoglobus</strong><small>Настройки</small></div>
        <button type="button" data-nav="search" aria-label="Поиск">${icon("search")}</button>
        <img data-header-avatar alt="">
      </header>
      <form class="kg-edit-form">
        <div class="kg-edit-toolbar bg-surface/90 backdrop-blur-md px-margin-mobile py-space-sm flex items-center justify-between shadow-sm">
<button class="flex items-center gap-space-xs text-on-surface-variant hover:text-primary transition-colors min-h-[44px] cursor-pointer" id="topCancelBtn" type="button" autofocus>
<span class="material-symbols-outlined text-[20px]">arrow_back_ios_new</span>
<span class="font-label-lg text-label-lg">Отмена</span>
</button>
<div class="flex flex-col items-center">
<h1 id="kg-edit-title" class="font-headline-sm text-headline-sm text-on-surface">Профиль синефила</h1>
<span class="font-label-sm text-label-sm text-primary uppercase tracking-widest">Правка досье</span>
</div>
<button class="bg-primary text-on-primary px-space-md py-1.5 rounded-full font-label-lg text-label-lg shadow-[0_0_12px_rgb(var(--kg-primary)/0.25)] hover:bg-primary-container transition-colors min-h-[36px] flex items-center justify-center cursor-pointer" id="topDoneBtn" type="submit">
      Готово
    </button>
</div>

        <div class="kg-edit-scroll"><div class="px-margin-mobile py-space-md flex flex-col gap-space-lg">
<div class="relative w-full rounded-xl overflow-hidden bg-surface-container-low shadow-md"><div class="relative w-full h-36 bg-surface-container-highest overflow-hidden"><div data-banner class="w-full h-full bg-cover bg-center" data-alt="A moody, atmospheric wide cinematic still from Wong Kar-wai Chungking Express style, blurry neon lights in Hong Kong night, deep green and amber chromatic glow, 35mm film grain, anamorphic flare." style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuDz15QSF1ymTSVkWZGNUbAoZeT3KOAibtJuGKh_IivGqqlLKsOCrPwfyOVGVCiHtRuzYeut3roWbq06ACGJldZOcaKn-IuaosCMqMTHs44hQEoNzfBpgRNqbaG2I5Iak724_o2r1Sz97H7g3_re6L0BBzOgfMq9w_9dpBQrh8ifrkkweVL2cLIHqpyxr2fzswy3_-9hnx-yvhdP4IcI6Dtg8FpnxflpjJxu9vUSr0E')"></div><div class="absolute inset-0 bg-gradient-to-t from-surface-container-low via-surface-container-low/40 to-black/60"></div><div class="absolute top-space-sm left-space-sm bg-surface-container-lowest/80 backdrop-blur-md text-on-surface-variant text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 border border-outline-variant/30"><span class="material-symbols-outlined text-[12px] text-primary">movie</span><span>2.39:1 Anamorphic • Гонконг</span></div><button data-media="banner" class="absolute top-space-sm right-space-sm bg-surface-container-lowest/80 backdrop-blur-md text-primary font-label-sm text-label-sm px-space-sm py-1 rounded-full flex items-center gap-1.5 shadow-sm hover:bg-surface-container-high transition-colors" type="button"><span class="material-symbols-outlined text-[16px]">movie_filter</span><span>Сменить кинокадр</span></button></div><div class="px-space-md pb-space-md flex flex-col items-center -mt-12 relative z-10"><div class="relative group cursor-pointer"><div class="w-24 h-24 rounded-full p-[2px] bg-gradient-to-tr from-primary via-primary-container to-surface-container-lowest shadow-xl"><img alt="" data-avatar class="w-full h-full rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEH9aDHtuzW0Y0GW1V7G6HJzedsFqVeEdvXqt1Emn-USiOmmT-YxtqKxSVX7MVBvzfTmkh23V8c7IqqoY0uEbfUlZpu1B-aac4b83Ze-M11H5fC-10Yy9QPVqBJnLT4swbj9mD0F4iu8AjBFQpfxEyjwRxARoZ99JTLit4XLn9KZbrcHkLiPithkfTLIsTAgE7iYRh6I61ff6m2HObv4gIOTaEPSMyoTwvJFf7X_M"/></div><button class="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg transition-transform group-hover:scale-110" data-media="avatar" aria-label="Изменить портрет" title="Изменить портрет" type="button"><span class="material-symbols-outlined text-[18px]">photo_camera</span></button></div><div class="mt-space-xs text-center flex flex-col items-center w-full"><div class="flex items-center gap-space-xs"><span class="font-headline-sm text-headline-sm text-on-surface" data-display-name></span><span data-badges-visible class="material-symbols-outlined text-primary text-[18px]" aria-hidden="true">workspace_premium</span></div><div class="flex flex-wrap items-center gap-2 mt-1"><span class="font-label-md text-label-md text-on-surface-variant">35mm Archivist • Curateur Cinéma</span><div class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-[11px] font-medium"><span class="material-symbols-outlined text-[13px]" style="font-variation-settings: 'FILL' 1;">workspace_premium</span><span>Kinoglobus Gold · Демо</span></div></div><div class="grid grid-cols-3 gap-2 w-full mt-3 pt-3 border-t border-outline-variant/30 text-center"><div class="bg-surface-container/60 rounded-lg py-1.5 px-2"><div class="font-headline-sm text-headline-sm text-primary leading-tight font-bold">4</div><div class="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">В ТОПЕ</div></div><div class="bg-surface-container/60 rounded-lg py-1.5 px-2"><div class="font-headline-sm text-headline-sm text-primary leading-tight font-bold" data-films></div><div class="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">ПРОСМОТРЫ</div></div><div class="bg-surface-container/60 rounded-lg py-1.5 px-2"><div class="font-headline-sm text-headline-sm text-primary leading-tight font-bold" data-countries></div><div class="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">СТРАНЫ</div></div></div></div></div></div>
<div class="bg-surface-container rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm"><div class="flex items-center justify-between"><div class="flex items-center gap-2"><span class="material-symbols-outlined text-primary text-[20px]">movie_filter</span><div><h3 class="font-headline-sm text-headline-sm text-on-surface">Любимые киножанры</h3><p class="font-body-sm text-body-sm text-on-surface-variant">До шести любимых жанров</p></div></div><span class="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full font-label-sm text-label-sm" data-genre-count></span></div><div class="kg-edit-chips" data-genres></div></div>
<div class="bg-surface-container rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-primary text-[20px]">badge</span>
<h3 class="font-headline-sm text-headline-sm text-on-surface">Основные данные</h3>
</div>
<div class="flex flex-col gap-1.5">
<label for="kg-edit-name" class="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Имя и фамилия в титрах</label>
<div class="relative flex items-center">
<input class="w-full bg-surface-container-low text-on-surface px-space-md py-3 rounded-lg font-body-md text-body-md focus:bg-surface-container-highest focus:outline-none focus:ring-0 shadow-inner" type="text" id="kg-edit-name" name="displayName" maxlength="40" required/>
<span class="material-symbols-outlined absolute right-space-md text-on-surface-variant text-[20px]">edit</span>
</div>
</div>
<div class="flex flex-col gap-1.5">
<label for="kg-edit-handle" class="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Синефильский хэндл</label>
<div class="flex items-center bg-surface-container-low rounded-lg px-space-md py-3 shadow-inner">
<span class="text-primary font-label-lg text-label-lg mr-1">@</span>
<input class="w-full bg-transparent text-on-surface font-body-md text-body-md focus:outline-none" type="text" id="kg-edit-handle" name="handle" readonly/>
<span class="material-symbols-outlined text-on-surface-variant text-[18px]">lock</span>
</div>
<p class="font-body-sm text-body-sm text-on-surface-variant">Псевдоним в тестовом профиле</p>
</div>
<div class="flex flex-col gap-1.5">
<label for="kg-edit-city" class="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Кинополис / Локация показов</label>
<div class="flex items-center bg-surface-container-low rounded-lg px-space-md py-3 shadow-inner">
<span class="material-symbols-outlined text-primary text-[20px] mr-2">public</span>
<input class="w-full bg-transparent text-on-surface font-body-md text-body-md focus:outline-none" type="text" id="kg-edit-city" name="city" maxlength="80"/>
</div>
</div>
<div class="flex flex-col gap-1.5">
<div class="flex items-center justify-between">
<label for="kg-edit-bio" class="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Манифест / О себе</label>
<span class="font-label-sm text-label-sm text-primary" id="bioCounter">112 / 250</span>
</div>
<textarea class="w-full bg-surface-container-low text-on-surface px-space-md py-2.5 rounded-lg font-body-md text-body-md focus:bg-surface-container-highest focus:outline-none shadow-inner leading-relaxed resize-none" rows="3" id="kg-edit-bio" name="bio" maxlength="250"></textarea>
</div>
</div>
<div class="bg-surface-container rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
<div class="flex items-center justify-between">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-primary text-[20px]">stars</span>
<div>
<h3 class="font-headline-sm text-headline-sm text-on-surface">Золотая полка</h3>
<p class="font-body-sm text-body-sm text-on-surface-variant">4 определяющих шедевра вашего вкуса</p>
</div>
</div>
<span class="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full font-label-sm text-label-sm">4 / 4</span>
</div>
<div class="grid grid-cols-2 gap-2" data-shelf></div>
<button data-reorder class="w-full py-2.5 rounded-lg bg-surface-container-high text-primary hover:bg-surface-container-highest transition-colors font-label-md text-label-md flex items-center justify-center gap-2" type="button">
<span class="material-symbols-outlined text-[18px]">library_add</span>
<span>Изменить или переставить шедевры</span>
</button>
</div>
<div class="bg-surface-container rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
<div class="flex items-center justify-between">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-primary text-[20px]">military_tech</span>
<div>
<h3 class="font-headline-sm text-headline-sm text-on-surface">Фестивальные бейджи &amp; Награды</h3>
<p class="font-body-sm text-body-sm text-on-surface-variant">Бейджи тестового профиля</p>
</div>
</div>
<button data-add-badge class="px-space-sm py-1 rounded-full bg-surface-container-high text-primary hover:bg-surface-container-highest transition-colors font-label-sm text-label-sm flex items-center gap-1" type="button">
<span class="material-symbols-outlined text-[16px]">add</span>
<span>Добавить</span>
</button>
</div>
<div class="kg-edit-chips" data-badges></div><div class="flex items-center justify-between pt-2 border-t border-outline-variant/20">
<div class="flex flex-col pr-space-md">
<span class="font-label-lg text-label-lg text-on-surface">Отображать бейджи в шапке профиля</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">Показывать бейджи рядом с именем</span>
</div>
<input type="checkbox" role="switch" class="kg-edit-switch" name="badgesVisible" aria-label="Отображать бейджи в шапке профиля">
</div>
</div>
<div class="bg-surface-container rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-primary text-[20px]">visibility</span>
<h3 class="font-headline-sm text-headline-sm text-on-surface">Приватность и клуб</h3>
</div>
<div class="flex items-center justify-between py-1">
<div class="flex flex-col pr-space-md">
<span class="font-label-lg text-label-lg text-on-surface">Статус Kinoglobus Club Gold</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">Показывать карточку клуба в тестовом профиле</span>
</div>
<input type="checkbox" role="switch" class="kg-edit-switch" name="goldVisible" aria-label="Статус Kinoglobus Club Gold">
</div>
<div class="flex items-center justify-between py-1">
<div class="flex flex-col pr-space-md">
<span class="font-label-lg text-label-lg text-on-surface">Публичный кинодневник</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">Публикация дневника скоро появится</span>
</div>
<input type="checkbox" role="switch" class="kg-edit-switch" name="diaryVisible" aria-label="Публичный кинодневник">
</div>
<div class="flex items-center justify-between py-1">
<div class="flex flex-col pr-space-md">
<span class="font-label-lg text-label-lg text-on-surface">Отметки на кинофестивалях</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">Публикация отметок скоро появится</span>
</div>
<input type="checkbox" role="switch" class="kg-edit-switch" name="festivalsVisible" aria-label="Отметки на кинофестивалях">
</div>
</div>
<div class="flex flex-col gap-space-sm pt-space-xs pb-space-lg">
<div class="flex items-center justify-center gap-1.5 py-1 text-on-surface-variant text-[11px]">
<span class="w-2 h-2 rounded-full bg-[#00e054] kg-edit-dot transition-all duration-300" id="syncDot"></span>
<span id="syncText">Тестовый профиль · Изменения хранятся в этой сессии</span>
</div>
<button class="relative overflow-hidden w-full py-3.5 rounded-full bg-primary text-on-primary font-label-lg text-label-lg flex items-center justify-center gap-2 shadow-[0_4px_24px_rgb(var(--kg-primary)/0.3)] hover:bg-primary-container active:scale-95 transition-all duration-300 cursor-pointer select-none" id="saveChangesBtn" type="submit">
<span class="flex items-center justify-center gap-2 transition-opacity duration-300" id="btnStateIdle">
<span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">save</span>
<span>Сохранить изменения</span>
</span>
<span class="hidden items-center justify-center gap-2.5 transition-opacity duration-300" id="btnStateSaving">
<span class="material-symbols-outlined kg-edit-reel" aria-hidden="true">motion_photos_on</span>
<span class="font-medium tracking-wide">Сохранение…</span>
</span>
<span class="hidden items-center justify-center gap-2 text-white transition-opacity duration-300" id="btnStateSuccess">
<span class="material-symbols-outlined text-[22px] kg-edit-check" style="font-variation-settings: 'FILL' 1;">check_circle</span>
<span class="font-semibold tracking-wide">Изменения сохранены!</span>
</span>
</button>
<button class="w-full py-3 rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-md text-label-md transition-colors flex items-center justify-center gap-2 cursor-pointer" id="resetDefaultBtn" type="button"><span class="material-symbols-outlined text-[18px]">restore</span><span>Сбросить к исходным данным</span></button>
<div class="pt-space-sm text-center"><button data-edit-logout class="font-body-sm text-body-sm text-error/80 hover:text-error transition-colors inline-flex items-center gap-1 cursor-pointer" type="button"><span class="material-symbols-outlined text-[16px]">logout</span><span>Выйти из учетной записи синефила</span></button></div>
</div>
</div></div>
      </form>
      <nav class="kg-edit-nav" aria-label="Навигация">
        ${nav.map(([key,symbol,label]) => `<button type="button" data-nav="${key}">${icon(symbol)}<span>${label}</span></button>`).join("")}
      </nav>
      <input type="file" accept="image/png,image/jpeg,image/webp,image/avif,image/gif" hidden>
      <div class="kg-edit-toast" role="status">${icon("movie")}<div><strong></strong><small></small></div></div>
    </div>
    <dialog id="kg-edit-sheet" aria-labelledby="kg-edit-sheet-title">
      <div class="kg-edit-sheet-handle" aria-hidden="true"></div>
      <div class="kg-edit-sheet-head"><h2 id="kg-edit-sheet-title"></h2><button type="button" data-panel-close aria-label="Закрыть шторку">${icon("close")}</button></div>
      <div class="kg-edit-panel" data-panel-content></div>
    </dialog>`;

  localizeInterfaceMarkup(editor);
  document.body.appendChild(editor);
  const form = editor.querySelector("form");
  const fields = form.elements;
  const scroll = editor.querySelector(".kg-edit-scroll");
  const save = editor.querySelector("#saveChangesBtn");
  const done = editor.querySelector("#topDoneBtn");
  const toast = editor.querySelector("[role=status]");
  const panel = editor.querySelector("dialog");
  const panelContent = panel.querySelector("[data-panel-content]");
  const file = editor.querySelector("[type=file]");
  const defaultAvatar = editor.querySelector("[data-avatar]").src;
  const defaultBanner = editor.querySelector("[data-banner]").style.backgroundImage;
  const switches = ["badgesVisible","goldVisible","diaryVisible","festivalsVisible"];
  let session;
  let draft;
  let original;
  let media;
  let mediaRequest = 0;
  let busy = false;
  let toastTimer;
  let panelClosing = false;
  let leaveEditor;

  function updatePreview() {
    editor.querySelector("[data-display-name]").textContent = fields.displayName.value;
    editor.querySelector("[data-avatar]").src = draft.avatar || defaultAvatar;
    editor.querySelector("[data-header-avatar]").src = draft.avatar || defaultAvatar;
    editor.querySelector("[data-banner]").style.backgroundImage = draft.banner ? `url("${draft.banner}")` : defaultBanner;
    editor.querySelector("#bioCounter").textContent = `${fields.bio.value.length} / 250`;
    editor.querySelector("[data-genre-count]").textContent = `${draft.genres.length} / 6`;
    editor.querySelector("[data-badges-visible]").hidden = !fields.badgesVisible.checked || !draft.badges.length;
  }

  function chip(text, symbol, action, index, pressed) {
    return `<button type="button" class="kg-edit-chip" data-${action}="${index}" ${pressed === undefined ? "" : `aria-pressed="${pressed}"`}>${icon(symbol)}<span>${escapeHtml(text)}</span></button>`;
  }

  function renderChoices() {
    editor.querySelector("[data-genres]").innerHTML = [...new Set([...genres,...draft.genres])].map((genre,index) => {
      const active = draft.genres.includes(genre);
      return chip(uiText(genre),active ? "check" : "add","genre",index,active);
    }).join("") + chip(uiText("Добавить жанр"),"add_circle","add-genre",0);
    editor.querySelector("[data-badges]").innerHTML = draft.badges.map((badge,index) => chip(uiText(badge),"close","remove-badge",index)).join("");
    editor.querySelector("[data-shelf]").innerHTML = draft.shelf.map((film,index) => `
      <article class="rounded-lg bg-surface-container-low p-2">
        <div class="kg-edit-poster">
          ${film.image ? `<img src="${escapeHtml(film.image)}" alt="">` : icon("movie")}
          <span>#${index+1}</span>
          <button type="button" data-replace="${index}" aria-label="${uiText("Заменить")} ${index+1}">${icon("swap_horiz")}</button>
        </div>
        <strong class="block truncate mt-1">${escapeHtml(uiText(film.title))}</strong>
        <div class="flex justify-between text-xs text-on-surface-variant"><span>${escapeHtml(film.year)}</span><span class="text-primary">${escapeHtml(film.ratio)}</span></div>
      </article>`).join("");
    updatePreview();
  }

  function load(data) {
    draft = structuredClone(data);
    fields.displayName.value = draft.name;
    fields.handle.value = draft.handle.replace(/^@/,"");
    fields.city.value = draft.city;
    fields.bio.value = draft.bio;
    switches.forEach(key => { fields[key].checked = draft[key]; });
    renderChoices();
  }

  function values() {
    return {...draft, name:fields.displayName.value.trim(), city:fields.city.value.trim(), bio:fields.bio.value.trim(),
      ...Object.fromEntries(switches.map(key => [key, fields[key].checked]))};
  }

  function showToast(title, description) {
    clearTimeout(toastTimer);
    toast.querySelector("strong").textContent = uiText(title);
    toast.querySelector("small").textContent = uiText(description);
    toast.dataset.show = "";
    toastTimer = setTimeout(() => { delete toast.dataset.show; },3200);
  }

  function showPanel(title, text) {
    panel.querySelector("h2").textContent = uiText(title);
    panelContent.innerHTML = text;
    if (!panel.open) panel.showModal();
  }

  function closePanel(next) {
    if (panelClosing || !panel.open) return;
    panelClosing = true;
    panel.dataset.closing = "";
    setTimeout(() => {
      panel.close();
      delete panel.dataset.closing;
      panelClosing = false;
      next?.();
    }, reducedMotion.matches ? 0 : 300);
  }

  function confirmLeave(action = "exit", leave = () => editor.close()) {
    if (busy) return;
    leaveEditor = leave;
    if (action === "exit" && JSON.stringify(values()) === JSON.stringify(original)) {
      leave();
      return;
    }
    showPanel("Несохранённые изменения", `
      <p>${uiText("Сбросить несохранённые правки?")}</p>
      <button class="kg-edit-discard" type="button" data-discard="${action}">${icon("restart_alt")} ${uiText(action === "exit" ? "Сбросить и выйти" : "Сбросить правки")}</button>
      <button type="button" data-panel-close>${icon("edit_note")} ${uiText("Продолжить редактирование")}</button>`);
  }

  function showShelf(slot) {
    const choices = watched.map(film => ({
      title:film.title || film.original || "", year:String(film.year || ""), ratio:"",
      image: /^\/[\w.-]+$/.test(film.poster || "") ? `https://image.tmdb.org/t/p/w342${film.poster}` : ""
    })).filter(film => film.title);
    const relevantFilms = [...draft.shelf, ...choices];
    showPanel(slot === undefined ? "Изменить или переставить шедевры" : "Заменить фильм",
      slot === undefined
        ? draft.shelf.map((film,index) => `<div class="kg-edit-shelf-row"><b>${index+1}. ${escapeHtml(uiText(film.title))}</b><button type="button" data-panel-replace="${index}">${uiText("Заменить")}</button><button type="button" data-move="${index}" ${index===0 ? "disabled" : ""} aria-label="${uiText("Выше")}">↑</button></div>`).join("")
        : relevantFilms.map((film,index) => `<button type="button" data-pick="${index}">${escapeHtml(uiText(film.title))} · ${escapeHtml(film.year)}</button>`).join(""));
    panel.onpick = index => {
      const selection = relevantFilms[index];
      const previousSlot = draft.shelf.findIndex(film => film.title === selection.title && film.year === selection.year);
      if (previousSlot >= 0) draft.shelf[previousSlot] = draft.shelf[slot];
      draft.shelf[slot] = selection;
      renderChoices();
      closePanel();
    };
  }

  function addItem(kind) {
    showPanel(kind === "genre" ? "Добавить жанр" : "Добавить бейдж",
      `<form data-add="${kind}"><input name="label" aria-label="${uiText("Название")}" required maxlength="48"><button type="submit">${uiText("Добавить")}</button></form>`);
  }

  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const delay = duration => new Promise(resolve => setTimeout(resolve,reducedMotion.matches ? 0 : duration));

  form.addEventListener("input", updatePreview);
  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (busy) return;
    const changes = values();
    if (!changes.name) {
      fields.displayName.value = "";
      fields.displayName.reportValidity();
      return;
    }
    busy = true;
    scroll.inert = true;
    save.disabled = done.disabled = true;
    save.dataset.phase = "saving";
    if (event.submitter === done) save.scrollIntoView({block:"nearest",behavior:reducedMotion.matches ? "instant" : "smooth"});
    await delay(1200);
    session.save(changes);
    original = structuredClone(changes);
    save.dataset.phase = "saved";
    editor.querySelector("#syncText").textContent = uiText("Сохранено в тестовом профиле");
    showToast("Досье синефила обновлено","Изменения сохранены в тестовом профиле");
    await delay(2500);
    delete save.dataset.phase;
    save.disabled = done.disabled = false;
    scroll.inert = false;
    busy = false;
    if (event.submitter === done) editor.close();
    else save.focus({preventScroll:true});
  });

  editor.addEventListener("cancel", event => {
    event.preventDefault();
    confirmLeave();
  });
  panel.addEventListener("cancel", event => {
    event.preventDefault();
    closePanel();
  });
  panel.addEventListener("touchstart",event => { panel.startY = event.touches[0].clientY; },{passive:true});
  panel.addEventListener("touchend",event => {
    if (event.changedTouches[0].clientY - panel.startY > 60) closePanel();
  },{passive:true});
  panel.addEventListener("input", event => event.target.setCustomValidity?.(""));
  panel.addEventListener("submit",event => {
    event.preventDefault();
    const field = event.target.elements.label;
    const text = field.value.trim();
    const items = event.target.dataset.add === "genre" ? draft.genres : draft.badges;
    if (!text || items.includes(text) || items.length >= 6) {
      field.setCustomValidity(uiText(!text ? "Введите название." : "Такое название уже добавлено."));
      field.reportValidity();
      return;
    }
    items.push(text);
    renderChoices();
    closePanel();
  });
  panel.addEventListener("click",event => {
    const button = event.target.closest("button");
    if (event.target === panel || button?.hasAttribute("data-panel-close")) closePanel();
    if (!button) return;
    const { discard, pick, move, panelReplace } = button.dataset;
    if (discard) closePanel(() => {
      if (discard === "exit") leaveEditor();
      else {
        load(original);
        showToast("Правки сброшены","Восстановлены сохранённые данные профиля");
      }
    });
    if (pick !== undefined) panel.onpick(Number(pick));
    if (panelReplace !== undefined) showShelf(Number(panelReplace));
    if (move !== undefined) {
      const index = Number(move);
      [draft.shelf[index-1],draft.shelf[index]] = [draft.shelf[index],draft.shelf[index-1]];
      renderChoices();
      showShelf();
      panel.querySelector(`[data-move="${index>1 ? index-1 : index}"]`)?.focus();
    }
  });

  editor.addEventListener("click",event => {
    if (panel.contains(event.target) || busy) return;
    const button = event.target.closest("button");
    if (!button) return;
    const { genre, removeBadge, replace, nav, media: nextMedia } = button.dataset;
    if (button.id === "topCancelBtn") confirmLeave();
    if (button.id === "resetDefaultBtn") confirmLeave("reset");
    if (button.hasAttribute("data-edit-logout")) confirmLeave("exit", () => { editor.close(); session.logout(); });
    if (button.hasAttribute("data-add-genre") && draft.genres.length < 6) addItem("genre");
    if (button.hasAttribute("data-add-badge") && draft.badges.length < 6) addItem("badge");
    if (genre !== undefined) {
      const label = [...new Set([...genres,...draft.genres])][Number(genre)];
      if (draft.genres.includes(label)) draft.genres = draft.genres.filter(item => item !== label);
      else if (draft.genres.length < 6) draft.genres.push(label);
      renderChoices();
    }
    if (removeBadge !== undefined) { draft.badges.splice(Number(removeBadge),1); renderChoices(); }
    if (replace !== undefined) showShelf(Number(replace));
    if (button.hasAttribute("data-reorder")) showShelf();
    if (nextMedia) { media = nextMedia; file.value = ""; file.click(); }
    if (nav) confirmLeave("exit", () => session.navigate(nav, () => editor.close()));
  });

  file.addEventListener("change", () => {
    const selected = file.files[0];
    if (!selected) return;
    if (!["image/png","image/jpeg","image/webp","image/avif","image/gif"].includes(selected.type) || selected.size > 8*1024*1024) {
      showToast("Не удалось загрузить изображение","Выберите изображение размером до 8 МБ.");
      return;
    }
    const opening = session;
    const field = media;
    const request = ++mediaRequest;
    const reader = new FileReader();
    reader.onload = () => {
      if (session !== opening || request !== mediaRequest || !editor.open || busy) return;
      draft[field] = reader.result;
      updatePreview();
    };
    reader.onerror = () => {
      if (session === opening && editor.open) showToast("Не удалось загрузить изображение","Выберите другой файл.");
    };
    reader.readAsDataURL(selected);
  });
  editor.addEventListener("close", () => {
    if (editor.open) return;
    clearTimeout(toastTimer);
    delete toast.dataset.show;
    file.value = "";
    draft = original = session = null;
  });

  window.KGOpenProfileEditor = (profile, actions) => {
    session = actions;
    original = structuredClone({
      city:"Париж / Санкт-Петербург", avatar:"", banner:"",
      genres:genres.slice(0,4), badges:["Канны 2024 (Аккредитация)","Венеция (Гость Биеннале)","Cineteca Bologna"],
      shelf:sampleShelf, badgesVisible:true, goldVisible:true, diaryVisible:true, festivalsVisible:true,
      ...profile
    });
    load(original);
    const format = new Intl.NumberFormat(interfaceLanguage);
    editor.querySelector("[data-films]").textContent = format.format(watched.length);
    editor.querySelector("[data-countries]").textContent = format.format(Object.keys(window.KGWatchedCountryCounts()).length);
    editor.querySelector("#syncText").textContent = uiText("Тестовый профиль · Изменения хранятся в этой сессии");
    if (!editor.open) editor.showModal();
    scroll.scrollTop = 0;
  };
})();
