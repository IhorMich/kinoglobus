/* Единая история просмотра и страна, которую пользователь решил отметить на карте. */
(() => {
  const escHtml = value => String(value || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function productionCountries(film, details) {
    const fromFilm = Array.isArray(film.origin_country) ? film.origin_country : [];
    const fromDetails = details && Array.isArray(details.countries) ? details.countries : [];
    return [...new Set([...fromFilm, ...fromDetails].map(x => String(x || '').toUpperCase()).filter(x => /^[A-Z]{2}$/.test(x)))];
  }

  window.KGWatchedCountryCounts = () => watched.reduce((counts, item) => {
    (item.countries || []).forEach(code => { counts[code] = (counts[code] || 0) + 1; });
    return counts;
  }, {});
  window.KGIsFilmWatched = id => watched.some(item => Number(item.id) === Number(id));

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
    if (button) { button.innerHTML = '<span class="material-symbols-outlined text-[16px] text-primary-container">task_alt</span><span>Посмотрел</span>'; button.disabled = false; button.setAttribute('aria-pressed', 'false'); }
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
    // Prefer the country whose search produced this result; for global or
    // collection results, credit only the first production country from TMDB.
    const requestedCountry = String(film._cc || film.cc || '').toUpperCase();
    const creditedCountry = countries.includes(requestedCountry)
      ? requestedCountry
      : (countries[0] || ( /^[A-Z]{2}$/.test(requestedCountry) ? requestedCountry : ''));
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
