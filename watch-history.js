/* Единая история просмотра и страна, которую пользователь решил отметить на карте. */
(() => {
  const picker = document.createElement('dialog');
  picker.className = 'kg-dlg';
  picker.setAttribute('aria-labelledby', 'kg-country-title');
  picker.innerHTML = '<div class="kg-in"><div class="kg-h" id="kg-country-title">Страна фильма</div><p class="kg-note">Фильм снят совместно несколькими странами. Выберите одну страну, которую добавить в ваше путешествие.</p><div id="kg-country-options" class="flex flex-col gap-2"></div><button type="button" class="kg-btn" data-cancel>Отмена</button></div>';
  document.body.appendChild(picker);
  const optionBox = picker.querySelector('#kg-country-options');
  const escHtml = value => String(value || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function chooseCountry(codes, film) {
    return new Promise(resolve => {
      optionBox.replaceChildren();
      const title = picker.querySelector('#kg-country-title');
      title.textContent = film.title ? `К какой стране отнести «${film.title}»?` : 'Выберите страну фильма';
      codes.forEach(code => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'kg-btn text-left';
        button.innerHTML = `${typeof flag === 'function' ? flag(code, false) : '🌍'} ${escHtml(typeof cname === 'function' ? cname(code) : code)} <span class="opacity-60">· ${escHtml(code)}</span>`;
        button.addEventListener('click', () => finish(code));
        optionBox.appendChild(button);
      });
      const cancel = picker.querySelector('[data-cancel]');
      const onCancel = event => { event?.preventDefault(); finish(null); };
      let settled = false;
      const finish = value => {
        if (settled) return;
        settled = true;
        picker.close();
        picker.removeEventListener('cancel', onCancel);
        resolve(value);
      };
      cancel.onclick = onCancel;
      picker.addEventListener('cancel', onCancel, { once: true });
      picker.showModal();
    });
  }

  function productionCountries(film, details) {
    const fromFilm = Array.isArray(film.origin_country) ? film.origin_country : [];
    const fromDetails = details && Array.isArray(details.countries) ? details.countries : [];
    return [...new Set([...fromFilm, ...fromDetails].map(x => String(x || '').toUpperCase()).filter(x => /^[A-Z]{2}$/.test(x)))];
  }

  window.KGWatchedCountryCounts = () => watched.reduce((counts, item) => {
    (item.countries || []).forEach(code => { counts[code] = (counts[code] || 0) + 1; });
    return counts;
  }, {});

  window.KGRenderWatchedByCountry = country => {
    const box = document.getElementById('jfilms');
    const heading = document.getElementById('jfilmsT');
    if (!box) return;
    const films = country ? watched.filter(item => (item.countries || []).includes(country)) : watched;
    if (heading) heading.textContent = country ? 'Фильмы из ' + (typeof cname === 'function' ? cname(country) : country) + ' · показать все' : 'Просмотренные фильмы';
    if (!films.length) {
      box.innerHTML = `<p class="note" style="margin:0">${country ? 'Вы ещё не отмечали просмотренные фильмы из этой страны.' : 'Постеры и страны появятся здесь после нажатия «Посмотрел».'}</p>`;
      return;
    }
    box.innerHTML = films.map(item => {
      const title = escHtml(item.title || 'Фильм');
      const poster = item.poster ? `<img src="https://image.tmdb.org/t/p/w154${item.poster}" alt="${title}" loading="lazy">` : `<span class="ph">${title}</span>`;
      const code = (item.countries || [])[0] || '';
      const place = code && typeof cname === 'function' ? cname(code) : '';
      const subtitle = escHtml([item.year, place].filter(Boolean).join(' · '));
      return `<button type="button" class="jfilm" data-id="${escHtml(item.id)}">${poster}<b>${title}</b><small>${subtitle}</small></button>`;
    }).join('');
  };

  window.KGSelectWatchedCountry = country => {
    const counts = window.KGWatchedCountryCounts();
    const count = counts[country] || 0;
    const info = document.getElementById('minfo');
    if (info) info.innerHTML = `${typeof flag === 'function' ? flag(country) : '🌍'} ${escHtml(typeof cname === 'function' ? cname(country) : country)}: ${count ? `просмотрено фильмов ${count}` : 'ещё нет отмеченных фильмов'}`;
    window.KGRenderWatchedByCountry(country);
  };

  window.KGRefreshWatchedMap = () => {
    if (typeof renderMap === 'function') renderMap();
    window.KGRenderWatchedByCountry('');
    const countryCount=Object.keys(window.KGWatchedCountryCounts()).length;
    const badge=document.querySelector('header a[data-path="moe-puteshestvie"] span:last-child');
    if(badge)badge.textContent=countryCount+'/'+COUNTRIES.length;
    const globe=window.KinoglobusGlobe;
    if (globe && globe.setWatchedCountryOutlines) globe.setWatchedCountryOutlines(Object.keys(window.KGWatchedCountryCounts()));
  };

  window.KGResetWatchedButton = () => {
    const button = document.getElementById('btn-watched');
    if (button) button.innerHTML = '<span class="material-symbols-outlined text-[16px] text-primary-container">task_alt</span><span>Посмотрел</span>';
  };

  document.addEventListener('click', event => {
    const countryButton = event.target.closest('#jopen [data-c]');
    if (countryButton) window.KGSelectWatchedCountry(countryButton.dataset.c);
  });

  document.addEventListener('DOMContentLoaded', () => {
    const heading = document.getElementById('jfilmsT');
    if (heading) { heading.style.cursor = 'pointer'; heading.title = 'Показать все просмотренные фильмы'; heading.addEventListener('click', () => window.KGRenderWatchedByCountry('')); }
  });

  window.KGMarkWatched = async film => {
    if (!film || !film.id) return false;
    let details = null;
    try { if (typeof filmDetails === 'function') details = await filmDetails(film.id); } catch (_) {}
    const countries = productionCountries(film, details);
    const id = Number(film.id);
    const prior = watched.find(item => Number(item.id) === id);
    if (prior && Array.isArray(prior.countries) && prior.countries.length) return true;
    let creditedCountry = countries.length === 1 ? countries[0] : '';
    if (countries.length > 1) {
      creditedCountry = await chooseCountry(countries, film);
      if (!creditedCountry) return false;
    }
    const record = typeof filmRecord === 'function' ? filmRecord(creditedCountry, film) : { id, title: film.title || '', poster: film.poster_path || '' };
    record.id = id;
    record.cc = creditedCountry;
    record.countries = creditedCountry ? [creditedCountry] : [];
    record.productionCountries = countries;
    record.watchedAt = new Date().toISOString();
    if (prior) watched = watched.map(item => Number(item.id) === id ? record : item);
    else watched.unshift(record);
    if (creditedCountry) {
      visited[creditedCountry] = (visited[creditedCountry] || 0) + 1;
      lastCC = creditedCountry;
      store.set('visited', visited);
      store.set('lastCC', lastCC);
    }
    store.set('watched', watched);
    seen.add(id);
    store.set('seen', [...seen]);
    if (typeof updHist === 'function') updHist();
    window.KGRefreshWatchedMap();
    return true;
  };

  window.KGRefreshWatchedMap();
})();
