/* Profile view for the local Moven demo session. */
(() => {
  let profile = null;
  const artwork = [
    "assets/interface/profile-page-01.jpg",
    "assets/interface/profile-page-02.jpg",
    "assets/interface/profile-page-03.jpg",
    "assets/interface/profile-page-04.jpg",
    "assets/interface/profile-page-05.jpg",
    "assets/interface/profile-page-06.jpg",
    "assets/interface/profile-page-07.jpg",
    "assets/interface/profile-page-08.jpg",
    "assets/interface/profile-page-09.jpg",
    "assets/interface/profile-page-10.jpg",
    "assets/interface/profile-page-11.jpg"
  ];
  const icon = name => `<span class="material-symbols-outlined" aria-hidden="true">${name}</span>`;
  const still = (index, className = "") => `<img class="${className}" src="${artwork[index]}" alt="" loading="lazy" decoding="async">`;
  const sampleFilms = [
    ["Чунцинский экспресс", "1994", 1, "2.39:1"],
    ["Апокалипсис сегодня", "1979", 2, "2.35:1"],
    ["Падшие ангелы", "1995", 4, "1.85:1"],
    ["Любовное настроение", "2000", 3, "1.66:1"]
  ];
  const sampleCollections = [
    ["folder_special", "Ночной Гонконг 90-х", [4, 5, 3, 6], "8 фильмов", "Создана 2 недели назад", 34, 210],
    ["workspace_premium", "Золотая пальмовая ветвь 1970–1999", [7, 8, 2, 9], "24 фильма", "Создана месяц назад", 118, 890]
  ];
  const badges = [
    ["filter_vintage", "Плёночный алхимик", "50+ фильмов на 35mm"],
    ["military_tech", "Каннский марафонец", "Все лауреаты 90-х"],
    ["bedtime", "Полуночный зритель", "Сеансы после 02:00"]
  ];

  const styles = document.createElement("style");
  styles.textContent = `
    #kg-profile {
      position:fixed;inset:0;margin:0 auto;width:100%;max-width:none;
      height:100dvh;max-height:100dvh;padding:0;border:0;overflow:hidden;
      background:rgb(var(--kg-neutral-35));color:rgb(var(--kg-neutral-127));font:14px/1.45 var(--kg-font-interface);color-scheme:dark;
      --profile-gold:rgb(var(--kg-primary-fixed-dim));--profile-muted:rgb(var(--kg-warm-text-19));--profile-card:rgb(var(--kg-neutral-70));--profile-tile:rgb(var(--kg-neutral-86));
    }
    #kg-profile::backdrop {background:rgb(var(--kg-neutral-17)/0.93725)}
    #kg-profile [hidden] {display:none}
    .kg-profile-shell {display:flex;flex-direction:column;height:100%}
    .kg-profile-header {display:flex;align-items:center;gap:8px;background:rgb(var(--kg-neutral-35));flex:none}
    .kg-profile-header {padding:env(safe-area-inset-top,0px) 4% 0;min-height:calc(62px + env(safe-area-inset-top,0px))}
    .kg-profile-brand {flex:1;color:var(--profile-gold);font-size:21px;font-weight:600;line-height:1.1}
    .kg-profile-brand small {display:block;color:var(--profile-muted);font-size:9px;letter-spacing:.12em;text-transform:uppercase}
    .kg-profile-header button {min-width:32px;min-height:44px;color:var(--profile-muted)}
    .kg-profile-header img {width:32px;height:32px;border:1px solid rgb(var(--kg-accent-muted));border-radius:50%;object-fit:cover}
    .kg-profile-scroll {flex:1;min-height:0;overflow:auto;overscroll-behavior:contain;padding:8px 5% 36px}
    .kg-profile-scroll > section {margin-bottom:24px}
    .kg-profile-card {background:var(--profile-card);border-radius:14px;padding:14px}
    .kg-profile-hero {background:radial-gradient(ellipse at top right,rgb(var(--kg-warm-surface-26)/0.6),transparent 74%),linear-gradient(rgb(var(--kg-neutral-82)),rgb(var(--kg-neutral-62)))}
    .kg-profile-identity,.kg-profile-line {display:flex;align-items:center;gap:10px}
    .kg-profile-line.between {justify-content:space-between}
    .kg-profile-avatar {position:relative;width:clamp(58px,19vw,86px);aspect-ratio:1;flex:none}
    .kg-profile-avatar img {width:100%;height:100%;object-fit:cover;border-radius:50%;border:2px solid rgb(var(--kg-accent-strong));background:rgb(var(--kg-neutral-92))}
    .kg-profile-avatar span {position:absolute;bottom:-2px;left:50%;transform:translateX(-50%);border-radius:99px;padding:1px 7px;background:var(--profile-gold);color:rgb(var(--kg-warm-surface-06));font-size:10px;font-weight:700}
    .kg-profile-identity h1 {font-size:clamp(18px,5.3vw,25px);font-weight:600;line-height:1.2;overflow-wrap:anywhere}
    .kg-profile-handle {color:var(--profile-gold);font-size:12px;overflow-wrap:anywhere;margin-top:4px}
    .kg-profile-pills {display:flex;flex-wrap:wrap;gap:4px;margin-top:6px}
    .kg-profile-pill {padding:3px 8px;border-radius:99px;background:rgb(var(--kg-neutral-94));color:var(--profile-muted);font-size:11px}
    .kg-profile-copy {color:var(--profile-muted);font-size:13px;line-height:1.6;margin-top:12px;overflow-wrap:anywhere}
    .kg-profile-actions {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:14px}
    .kg-profile-button {display:flex;align-items:center;justify-content:center;gap:5px;padding:7px;min-height:40px;border-radius:9px;background:rgb(var(--kg-neutral-94));font-size:12px;font-weight:700}
    .kg-profile-button.gold,.kg-profile-tabs button[aria-pressed="true"] {background:var(--profile-gold);color:rgb(var(--kg-warm-surface-05))}
    #kg-profile button:focus-visible,#kg-profile a:focus-visible {outline:2px solid var(--profile-gold);outline-offset:2px}
    #kg-profile .material-symbols-outlined {font-size:18px}
    .kg-profile-status {color:var(--profile-gold);text-align:center;margin-bottom:10px}
    .kg-profile-status:empty {display:none}
    .kg-profile-head {display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px}
    .kg-profile-head h2 {font-size:17px;font-weight:700}
    .kg-profile-head small,.kg-profile-meta {color:var(--profile-muted);font-size:11px}
    .kg-profile-archive h2 {font-size:11px;letter-spacing:.055em;text-transform:uppercase;color:var(--profile-muted)}
    .kg-profile-grid {display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
    .kg-profile-stat {display:grid;place-items:center;text-align:center;padding:10px 2px;border-radius:12px;background:var(--profile-card);font-size:11px;color:var(--profile-muted)}
    .kg-profile-stat strong {font-size:21px;color:var(--profile-gold)}
    .kg-profile-stat:nth-child(3) strong {color:rgb(var(--kg-cool-highlight-01))}
    .kg-profile-spotlight {margin-top:10px;background:var(--profile-tile)}
    .kg-profile-spotlight strong {display:block;font-size:16px}
    .kg-profile-gold {color:var(--profile-gold)}
    .kg-profile-frame {position:relative;display:block;aspect-ratio:2/3;background:rgb(var(--kg-neutral-94));border-radius:7px;overflow:hidden}
    .kg-profile-frame img {width:100%;height:100%;object-fit:cover}
    .kg-profile-frame small {position:absolute;bottom:3px;right:4px;background:rgb(var(--kg-neutral-35)/0.90196);padding:0 4px;border-radius:3px;color:var(--profile-gold);font-size:9px}
    .kg-profile-film strong {display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;margin-top:5px}
    .kg-profile-tabs {display:flex;gap:8px;overflow:auto;margin-bottom:18px;padding:2px}
    .kg-profile-tabs button {white-space:nowrap;border-radius:99px;background:var(--profile-tile);padding:8px 12px;font-size:12px}
    .kg-profile-collection + .kg-profile-collection {margin-top:10px}
    .kg-profile-collection h3 {font-weight:700;font-size:15px}
    .kg-profile-collection .kg-profile-grid {margin:10px 0}
    .kg-profile-badges {display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;text-align:center}
    .kg-profile-badges .kg-profile-card {padding:10px 5px}
    .kg-profile-badges strong {display:block;font-size:11px;margin:6px 0 2px}
    .kg-profile-badge-icon {display:inline-grid;place-items:center;width:42px;height:42px;border-radius:50%;background:rgb(var(--kg-white)/0.04706);color:var(--profile-gold)}
    .kg-profile-activity img {width:58px;aspect-ratio:2/3;object-fit:cover;border-radius:7px}
    .kg-profile-activity blockquote {margin-top:12px;background:rgb(var(--kg-neutral-52));padding:10px;border-radius:8px;font-style:italic;color:var(--profile-muted)}
    .kg-profile-club {background:linear-gradient(120deg,rgb(var(--kg-on-primary-fixed-variant)),rgb(var(--kg-neutral-85)) 58%,rgb(var(--kg-warm-surface-19)))}
    .kg-profile-club h2 {font-size:17px;font-weight:700;color:var(--profile-gold)}
  `;
  document.head.appendChild(styles);

  const dialog = document.createElement("dialog");
  dialog.id = "kg-profile";
  dialog.setAttribute("aria-labelledby", "kg-profile-title");
  dialog.innerHTML = `
    <div class="kg-profile-shell">
      <header class="kg-profile-header">
        <button type="button" data-profile-back aria-label="Назад" autofocus>${icon("arrow_back_ios_new")}</button>
        <div class="kg-profile-brand"><img class="kg-brand-mark" src="assets/branding/moven-icon-192.png" width="24" height="24" alt=""> Moven<small>Личный кабинет</small></div>
        <button type="button" data-profile-action="search" aria-label="Поиск">${icon("search")}</button>
        <button type="button" data-profile-logout aria-label="Выйти">${icon("logout")}</button>
        ${still(0)}
      </header>
      <div class="kg-profile-scroll">
        <p class="kg-profile-status" role="status"></p>
        <section class="kg-profile-card kg-profile-hero">
          <div class="kg-profile-identity">
            <div class="kg-profile-avatar">${still(0)}<span>35mm</span></div>
            <div>
              <h1 id="kg-profile-title"></h1>
              <p class="kg-profile-handle" data-profile-handle></p>
              <div class="kg-profile-pills"><span class="kg-profile-pill">Демо-профиль</span><span class="kg-profile-pill" data-profile-club-badge>Moven Club</span><span data-profile-badges class="contents"></span></div>
            </div>
          </div>
          <p class="kg-profile-copy" data-profile-bio></p>
          <p class="kg-profile-meta" data-profile-city hidden></p>
          <div class="kg-profile-actions">
            <button type="button" class="kg-profile-button gold" data-profile-edit>${icon("edit_note")}<span>Редактировать</span></button>
            <button type="button" class="kg-profile-button" data-profile-share>${icon("share")}<span>Поделиться</span></button>
          </div>
          <div class="kg-profile-actions"><button type="button" class="kg-profile-button" data-profile-diary>${icon("history_edu")}<span>Кинодневник</span></button><button type="button" class="kg-profile-button" data-profile-diary="bookmarks">${icon("bookmark")}<span>Закладки</span></button><button type="button" class="kg-profile-button" data-profile-favorites aria-label="${uiText('Любимые')}">${window.KGFavorites.icon()}<span>Любимые</span><b data-profile-favorite-count aria-hidden="true">0</b></button></div>
        </section>
        <section class="kg-profile-archive">
          <div class="kg-profile-head"><h2>Кинематографический архив</h2><button type="button" class="kg-profile-gold" data-profile-action="history">История</button></div>
          <div class="kg-profile-grid">
            <div class="kg-profile-stat"><strong data-profile-film-count></strong><span>Фильмов</span></div>
            <div class="kg-profile-stat"><strong>—</strong><span>Рецензий</span></div>
            <div class="kg-profile-stat"><strong data-profile-country-count></strong><span>Страны</span></div>
            <div class="kg-profile-stat"><strong>—</strong><span>Часы</span></div>
          </div>
          <div class="kg-profile-card kg-profile-line between kg-profile-spotlight">
            <span class="kg-profile-gold">${icon("videocam")}</span>
            <div><small class="kg-profile-gold">Любимый режиссёр сезона</small><strong>Вонг Кар-вай</strong></div>
            <span class="kg-profile-pill">Пример</span>
          </div>
        </section>
        <section>
          <div class="kg-profile-head"><h2 class="kg-profile-line"><span class="kg-profile-gold">${icon("stars")}</span><span>Золотая полка</span></h2><small data-profile-shelf-label>Пример · Топ-4</small></div>
          <div class="kg-profile-grid" data-profile-shelf>
            ${sampleFilms.map(([title, year, index, ratio]) => `<div class="kg-profile-film"><span class="kg-profile-frame">${still(index)}<small>${ratio}</small></span><strong title="${title}">${title}</strong><small class="kg-profile-meta">${year}</small></div>`).join("")}
          </div>
        </section>
        <section>
          <div class="kg-profile-tabs" role="group" aria-label="Разделы профиля">
            <button type="button" data-profile-tab="collections" aria-pressed="true">Коллекции и полки</button>
            <button type="button" data-profile-tab="reviews" aria-pressed="false">Рецензии</button>
            <button type="button" data-profile-tab="watchlist" aria-pressed="false">Буду смотреть</button>
            <button type="button" data-profile-diary>Дневник</button>
          </div>
          <div data-profile-panel="collections">
            <div class="kg-profile-head"><h2>Авторские подборки</h2><small>Примеры</small></div>
            ${sampleCollections.map(([symbol, title, stills, count, date, likes, views]) => `
              <article class="kg-profile-card kg-profile-collection">
                <div class="kg-profile-line between"><h3 class="kg-profile-line"><span class="kg-profile-gold">${icon(symbol)}</span><span>${title}</span></h3><small class="kg-profile-pill">${count}</small></div>
                <div class="kg-profile-grid">${stills.map(index => `<span class="kg-profile-frame">${still(index)}</span>`).join("")}</div>
                <div class="kg-profile-line between kg-profile-meta"><span>${date}</span><span>♥ ${likes} · ${views}</span></div>
              </article>`).join("")}
          </div>
          <p class="kg-profile-card kg-profile-meta" data-profile-panel="reviews" hidden>Рецензии в профиле скоро появятся.</p>
          <p class="kg-profile-card kg-profile-meta" data-profile-panel="watchlist" hidden>Список «Буду смотреть» скоро появится.</p>
        </section>
        <section>
          <div class="kg-profile-head"><h2>Кураторские награды</h2><small>Примеры</small></div>
          <div class="kg-profile-badges">
            ${badges.map(([symbol, title, description]) => `<div class="kg-profile-card"><span class="kg-profile-badge-icon">${icon(symbol)}</span><strong>${title}</strong><small class="kg-profile-meta">${description}</small></div>`).join("")}
          </div>
        </section>
        <section>
          <div class="kg-profile-head"><h2>Последняя активность</h2><small>Пример</small></div>
          <article class="kg-profile-card kg-profile-activity">
            <div class="kg-profile-line">${still(10)}<div><h3>Чунцинский экспресс</h3><p class="kg-profile-meta">Реж. Вонг Кар-вай</p><p class="kg-profile-gold">★★★★★ · 5.0</p></div></div>
            <blockquote>«Эффект step-printing превращает бег по эскалаторам Гонконга в медитацию об ускользающем времени».</blockquote>
          </article>
        </section>
        <section class="kg-profile-card kg-profile-club" data-profile-club>
          <div class="kg-profile-head"><h2>Moven Club Gold</h2><span class="kg-profile-pill">Скоро</span></div>
          <p class="kg-profile-copy">Премиальный доступ к плёночным реставрациям</p>
          <div class="kg-profile-actions">
            <span class="kg-profile-button gold">Управление подпиской</span>
            <button type="button" class="kg-profile-button" data-profile-action="settings">${icon("settings")}<span>Настройки</span></button>
          </div>
        </section>
      </div>
    </div>`;
  localizeInterfaceMarkup(dialog);
  document.body.appendChild(dialog);

  const scroll = dialog.querySelector(".kg-profile-scroll");
  const status = dialog.querySelector("[role=status]");
  const tabs = [...dialog.querySelectorAll("[data-profile-tab]")];
  const panels = [...dialog.querySelectorAll("[data-profile-panel]")];
  const routes = {
    settings: "#gear",
    search: "[data-kg-search-open]"
  };

  function selectTab(tab) {
    tabs.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.profileTab === tab)));
    panels.forEach(panel => { panel.hidden = panel.dataset.profilePanel !== tab; });
  }

  const defaultShelf = dialog.querySelector("[data-profile-shelf]").innerHTML;
  const label = dialog.querySelector("[data-profile-shelf-label]");
  const shelfFilms = new Map();
  const defaultShelfLabel = label.textContent;

  function renderProfile() {
    const format = new Intl.NumberFormat(interfaceLanguage);
    dialog.querySelector("[data-profile-favorite-count]").textContent=String(window.KGFavorites.list().length);
    dialog.querySelector("h1").textContent = profile.name;
    dialog.querySelector("[data-profile-handle]").textContent = profile.handle;
    dialog.querySelector("[data-profile-bio]").textContent = profile.bio;
    const city = dialog.querySelector("[data-profile-city]");
    city.textContent = profile.city || "";
    city.hidden = !profile.city;
    dialog.querySelectorAll(".kg-profile-header img,.kg-profile-avatar img").forEach(image => { image.src = profile.avatar || artwork[0]; });
    const hero = dialog.querySelector(".kg-profile-hero");
    hero.style.backgroundImage = profile.banner
      ? `linear-gradient(rgb(var(--kg-neutral-57)/0.66667),rgb(var(--kg-neutral-62)) 87%),url("${profile.banner}")` : "";
    hero.style.backgroundSize = profile.banner ? "cover" : "";
    dialog.querySelector("[data-profile-club]").hidden = profile.goldVisible === false;
    dialog.querySelector("[data-profile-club-badge]").hidden = profile.goldVisible === false;
    const badges = dialog.querySelector("[data-profile-badges]");
    badges.replaceChildren();
    if (profile.badgesVisible !== false) {
      for (const name of profile.badges || []) {
        const badge = document.createElement("span");
        badge.className = "kg-profile-pill";
        badge.textContent = uiText(name);
        badges.append(badge);
      }
    }
    const shelf = dialog.querySelector("[data-profile-shelf]");
    shelfFilms.clear();
    shelf.innerHTML = profile.shelf ? "" : defaultShelf;
    label.textContent = profile.shelf ? uiText("Топ-4") : defaultShelfLabel;
    for (const storedFilm of profile.shelf || []) {
      const film = window.KGDisplayShelfFilm(storedFilm);
      const card = document.createElement("div");
      card.className = "kg-profile-film";
      card.innerHTML = '<span class="kg-profile-frame"><img alt="" loading="lazy"><small></small></span><strong></strong><small class="kg-profile-meta"></small>';
      const image = card.querySelector("img");
      if (film.image) image.src = film.image;
      else image.remove();
      card.querySelector(".kg-profile-frame small").textContent = film.ratio;
      card.querySelector("strong").textContent = uiText(film.title);
      card.querySelector(".kg-profile-meta").textContent = film.year;
      const savedFilm = watched.find(item => film.id ? Number(item.id)===Number(film.id) :
        item.title===film.title && String(item.year || "")===String(film.year || ""));
      const linkFilm = savedFilm || (film.id ? film : null);
      if (linkFilm) {
        shelfFilms.set(String(linkFilm.id),linkFilm);
        const opener=document.createElement("button");
        opener.type="button";
        opener.className="block w-full text-left";
        opener.dataset.profileFilm=String(linkFilm.id);
        opener.setAttribute("aria-label",uiText("Открыть фильм {title}",{title:film.title}));
        opener.append(...card.childNodes);
        card.append(opener);
        card.insertAdjacentHTML("beforeend",kgBookmarkButton(linkFilm));
      }
      shelf.append(card);
    }
    dialog.querySelector("[data-profile-film-count]").textContent = format.format(watched.length);
    dialog.querySelector("[data-profile-country-count]").textContent = format.format(Object.keys(window.KGWatchedCountryCounts()).length);
  }

  function openProfile(message = "") {
    if (!profile) return false;
    renderProfile();
    selectTab("collections");
    status.textContent = message;
    window.KGMountBottomNav?.(dialog, scroll.parentElement, "profile");
    if (!dialog.open) dialog.showModal();
    scroll.scrollTop = 0;
    return true;
  }

  dialog.addEventListener("click", async event => {
    const opener=event.target.closest("[data-profile-film]");
    const film=opener && shelfFilms.get(opener.dataset.profileFilm);
    if(film){window.KGFilmCard.openDialog(window.KGFilmCard.savedFilm(film),opener);return;}

    const action = event.target.closest("[data-profile-action]")?.dataset.profileAction;
    const tab = event.target.closest("[data-profile-tab]")?.dataset.profileTab;
    if (tab) selectTab(tab);
    if (action) {
      const destination = document.querySelector(routes[action]);
      if (destination) {
        dialog.close();
        destination.click();
      }
      return;
    }
    if (event.target.closest("[data-profile-back]")) dialog.close();
    if (event.target.closest("[data-profile-logout]")) {
      profile = null;
      dialog.close();
    }
    if(event.target.closest("[data-profile-favorites]")){window.KGFavorites.open();return;}
    const diaryButton = event.target.closest("[data-profile-diary]");
    if (diaryButton) {
      window.KGOpenCinemaDiary({
        avatar: profile.avatar || artwork[0],
        initialSource: diaryButton.dataset.profileDiary,
        closeParent: () => dialog.close()
      });
      return;
    }
    if (event.target.closest("[data-profile-edit]")) {
      window.KGOpenProfileEditor(profile,{
        save(changes) { profile = changes; renderProfile(); },
        logout() { profile = null; dialog.close(); },
        navigate(action, closeEditor) {
          const target = document.querySelector(routes[action]);
          if (!target) return;
          closeEditor();
          dialog.close();
          target.click();
        }
      });
    }
    if (event.target.closest("[data-profile-share]")) {
      const sharedProfile = profile;
      const text = [profile.name, profile.bio].filter(Boolean).join("\n");
      try {
        if (navigator.share) await navigator.share({ title: "Moven", text });
        else {
          await navigator.clipboard.writeText(text);
          if (profile !== sharedProfile || !dialog.open) return;
          status.textContent = uiText("Описание профиля скопировано.");
          status.scrollIntoView({block:"nearest"});
        }
      } catch (error) {
        if (error.name !== "AbortError" && profile === sharedProfile && dialog.open) {
          status.textContent = uiText("Не удалось поделиться профилем.");
          status.scrollIntoView({block:"nearest"});
        }
      }
    }
  });

  document.addEventListener("kg:favorite-change",()=>{dialog.querySelector("[data-profile-favorite-count]").textContent=String(window.KGFavorites.list().length);});
  window.KGOpenDemoProfile = () => openProfile();
  window.KGStartDemoSession = (message, name = "") => {
    const displayName = name.trim();
    profile = {
      name: displayName || uiText("Александр Воронов"),
      handle: displayName ? "" : "@voronov_cinema",
      bio: uiText("Синефил, собиратель редких плёночных копий, фанат французской новой волны и ночного азиатского нео-нуара.")
    };
    openProfile(message);
  };
})();
