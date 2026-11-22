(() => {
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char =>
    ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'})[char]);
  const label = (text, params) => escape(uiText(text, params));
  const icon = name => `<span class="material-symbols-outlined" aria-hidden="true">${name}</span>`;
  const key = date => [date.getFullYear(), date.getMonth()+1, date.getDate()]
    .map((part, index) => String(part).padStart(index ? 2 : 4, '0')).join('-');
  const dateFor = value => new Date(value+'T12:00:00');
  const dateAt = (month, offset, day) => new Date(month.getFullYear(), month.getMonth()+offset, day, 12);
  const format = (date, options) => date.toLocaleDateString(interfaceLanguage, options);
  const dateLabel = value => format(dateFor(value), {weekday:'long', day:'numeric', month:'long'});
  const image = (path, size) => /^\/[\w.-]+$/.test(path || '') ? `https://image.tmdb.org/t/p/${size}${path}` : '';
  const services = [
    ['Netflix', /netflix/i], ['Apple TV', /apple tv/i], ['HBO / Max', /hbo|^max$/i],
    ['Prime Video', /prime video|amazon/i], ['Disney+', /disney/i]
  ];
  const serviceFor = show => {
    const names = (show.networks || []).map(network => network.name);
    return services.find(([, pattern]) => names.some(name => pattern.test(name)))?.[0] || names[0] || '';
  };
  let root, month, selected, tracked = false, expanded = true, service = '', rows = [];
  const calendarFile = value => String(value).replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n').replace(/[;,]/g, char => '\\'+char);
  const stamp = () => new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  let phase = '', more = false, generation = 0;
  const details = new Map(), seasons = new Map();

  function render() {
    const focused = root.contains(document.activeElement) ? document.activeElement.dataset.calFocus : '';
    const today = key(new Date());
    const visible = rows.filter(({show}) => !service || serviceFor(show) === service);
    const days = new Set(visible.map(({episode}) => episode.air_date));
    const filters = [...new Set(rows.map(({show}) => serviceFor(show)).filter(Boolean))].sort();
    const monthTitle = format(month, {month:'long', year:'numeric'});
    const first = dateAt(month, 0, 1);
    const offset = (first.getDay()+6)%7;
    const total = Math.ceil((offset+dateAt(month, 1, 0).getDate())/7)*7;
    const weekdays = Array.from({length:7}, (_, index) => format(new Date(2024, 0, index+1), {weekday:'short'}));
    const shownDates = [...days].filter(date => date >= selected).sort();
    const groups = [selected, ...shownDates.filter(date => date !== selected)];
    root.innerHTML = `
      <header class="kg-cal-header"><button type="button" data-cal-back aria-label="${label('Все подборки')}">${icon('arrow_back')}</button>
      <h1>${label('Календарь сериалов')}</h1></header>
      <div class="kg-cal-segment" role="group" aria-label="${label('Сериалы')}">
        ${[['tracked','Отслеживаемые'], ['all','Все сериалы']].map(([mode, name]) => `
          <button type="button" data-cal-mode="${mode}" data-cal-focus="${mode}" aria-pressed="${tracked === (mode === 'tracked')}">${label(name)}</button>`).join('')}
      </div>
      <section class="kg-cal-month" aria-label="${label('Календарь сериалов')}">
        <div class="kg-cal-month-header"><h2>${escape(monthTitle)}</h2><div>
          <button type="button" data-cal-month="-1" data-cal-focus="previous" aria-label="${label('Предыдущий месяц')}">${icon('arrow_back')}</button>
          <button type="button" data-cal-month="1" data-cal-focus="next" aria-label="${label('Следующий месяц')}">${icon('chevron_right')}</button>
        </div></div>
        <div class="kg-cal-grid" id="kg-cal-grid" ${expanded ? '' : 'hidden'}>
          ${weekdays.map(day => `<span class="kg-cal-weekday">${escape(day)}</span>`).join('')}
          ${Array.from({length:total}, (_, index) => {
            const date = dateAt(month, 0, index+1-offset);
            const value = key(date);
            return `<button type="button" data-cal-date="${value}" data-cal-focus="${value}" aria-label="${escape(dateLabel(value))}" aria-pressed="${value === selected}" ${value === today ? 'aria-current="date"' : ''} ${date.getMonth() === month.getMonth() ? '' : 'disabled'}>${date.getDate()}<i ${days.has(value) ? '' : 'hidden'}></i></button>`;
          }).join('')}
        </div>
        <button type="button" class="kg-cal-collapse" data-cal-expand data-cal-focus="expand" aria-controls="kg-cal-grid" aria-expanded="${expanded}">${label(expanded?'Свернуть календарь':'Развернуть календарь')}${icon(expanded?'expand_less':'expand_more')}</button>
      </section>
      ${filters.length ? `<div class="kg-cal-filters" role="group" aria-label="${label('Сервисы')}">${['', ...filters].map((name, index) =>
        `<button type="button" data-cal-service="${escape(name)}" data-cal-focus="service-${index}" aria-pressed="${service === name}">${name ? escape(name) : label('Все сервисы')}</button>`).join('')}</div>` : ''}
      <div class="kg-cal-agenda" aria-busy="${phase === 'loading'}">
        ${groups.map((date, index) => {
          const episodes = visible.filter(row => row.episode.air_date === date);
          const heading = date === today ? label('Сегодня, {date}', {date:dateLabel(date)}) : escape(dateLabel(date));
          return `<section class="kg-cal-day"><h2>${heading}</h2>${episodes.map((row, position) => card(row, index === 0 && position === 0)).join('')}
            ${!episodes.length && !phase ? `<p class="kg-cal-status">${label('На этот день нет серий в расписании.')}</p>` : ''}</section>`;
        }).join('')}
      </div>
      ${phase ? `<p class="kg-cal-status" role="status">${label(phase === 'loading' ? 'Загружаем расписание…' : phase === 'key' ? 'Добавьте ключ TMDB, чтобы обновлять сериалы и расписание.' : 'Не удалось загрузить расписание.')}</p>` : ''}
      ${phase === 'error' ? `<button class="kg-cal-collapse" type="button" data-cal-retry>${label('Повторить')}</button>` : ''}
      ${more && !phase ? `<button class="kg-cal-collapse" type="button" data-cal-more>${label('Показать ещё сериалы')}</button>` : ''}`;
    if (focused) root.querySelector(`[data-cal-focus="${focused}"]`)?.focus({preventScroll:true});
  }

  function card(row, featured) {
    const {show, episode} = row;
    const poster = image(show.poster_path, 'w185');
    const backdrop = image(episode.still_path || show.backdrop_path, 'w780');
    const name = serviceFor(show);
    const episodeLabel = label('Сезон {season} · Эпизод {episode}', {season:episode.season_number, episode:episode.episode_number});
    return `<article class="kg-cal-card ${featured ? 'kg-cal-featured' : ''}">
      ${featured && backdrop ? `<img class="kg-cal-backdrop" src="${backdrop}" alt="" loading="lazy">` : ''}
      <div class="kg-cal-card-body">
        ${poster ? `<img src="${poster}" alt="" loading="lazy">` : ''}
        <button type="button" class="kg-cal-episode" data-cal-episode="${row.id}">
          <strong>${escape(show.title)}</strong><span>${episodeLabel}</span>
          ${episode.name ? `<span>${escape(episode.name)}</span>` : ''}
        </button>${kgBookmarkButton(show)}
      </div>
      <footer>${name ? `<span>${escape(name)}</span>` : '<span></span>'}
        ${episode.air_date >= key(new Date()) ? `<button type="button" data-cal-reminder="${row.id}">${icon('calendar_month')}${label('Напомнить')}</button>` : ''}
        <button type="button" data-cal-episode="${row.id}">${label('Подробнее')}${icon('chevron_right')}</button></footer>
    </article>`;
  }

  function detail(id) {
    const cacheKey = `${apiKey}:${filmLocale}:${id}`;
    if (!details.has(cacheKey)) {
      const promise = requestTmdb(`tv/${window.KGSeries.rawId(id)}`, {language:filmLocale})
        .then(window.KGSeries.normalize)
        .then(show => movieCatalog.allows(show) ? localizeFilmListItem(show) : null)
        .catch(error => {
          details.delete(cacheKey);
          if (error.code === 'CATALOG_RESTRICTED') return null;
          throw error;
        });
      details.set(cacheKey, promise);
    }
    return details.get(cacheKey);
  }

  function seasonFor(show, number) {
    const cacheKey = `${apiKey}:${filmLocale}:${show.id}:${number}`;
    if (!seasons.has(cacheKey)) {
      const promise = requestTmdb(`tv/${window.KGSeries.rawId(show.id)}/season/${number}`, {language:filmLocale})
        .then(data => Array.isArray(data.episodes) ? data.episodes : [])
        .catch(error => { seasons.delete(cacheKey); throw error; });
      seasons.set(cacheKey, promise);
    }
    return seasons.get(cacheKey);
  }

  async function monthEpisodes(show, start, end) {
    const known = [show.last_episode_to_air, show.next_episode_to_air].filter(Boolean);
    const listed = (show.seasons || []).filter(season => season.season_number > 0 && season.air_date)
      .sort((a,b) => a.air_date.localeCompare(b.air_date));
    const candidates = listed.filter((season, index) => season.air_date <= end &&
      (!listed[index+1] || listed[index+1].air_date >= start));
    const last = show.last_episode_to_air?.air_date;
    if (last && last < start && !known.some(episode => episode.air_date >= start)) return {episodes:known, failed:false};
    const matches = await Promise.allSettled(candidates.map(season => seasonFor(show,season.season_number)));
    return {
      episodes:[...matches.flatMap(item => item.status === 'fulfilled' ? item.value : []), ...known],
      failed:matches.some(item => item.status === 'rejected')
    };
  }

  async function exportCalendar(row, fullSeason, time, lead) {
    const {show,episode} = row;
    const listed = fullSeason ? await seasonFor(show,episode.season_number) : [];
    const today = key(new Date());
    const episodes = [...new Map([...listed,episode].filter(item =>
      /^\d{4}-\d{2}-\d{2}$/.test(item.air_date || '') && item.air_date >= today &&
      (!fullSeason || item.episode_number >= episode.episode_number)
    ).map(item => [item.episode_number,item])).values()];
    if (!episodes.length) throw new Error('No release dates');
    const events = episodes.map(item => ({
      id:`tv-${show.id}-${episode.season_number}-${item.episode_number}`,
      date:item.air_date, title:`${show.title} · S${episode.season_number}E${item.episode_number}`
    }));
    return exportReminders(events,time,Number(lead));
  }

  async function exportReminders(entries, time, lead) {
    const events = entries.flatMap(item => [
      'BEGIN:VEVENT', `UID:${calendarFile(item.id)}@moven`, `DTSTAMP:${stamp()}`,
      `DTSTART:${item.date.replace(/-/g,'')}T${time.replace(':','')}00`, `SUMMARY:${calendarFile(item.title)}`,
      'BEGIN:VALARM', `TRIGGER:${lead ? '-PT'+lead+'M' : 'PT0M'}`,
      'ACTION:DISPLAY', `DESCRIPTION:${calendarFile(item.title)}`, 'END:VALARM', 'END:VEVENT'
    ]);
    const content = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Moven//Series Calendar//EN','CALSCALE:GREGORIAN',
      ...events,'END:VCALENDAR',''].join('\r\n');
    if (window.Capacitor?.getPlatform() === 'android') {
      await window.Capacitor.Plugins.CalendarExport.share({content});
      return;
    }
    const url = URL.createObjectURL(new Blob([content], {type:'text/calendar;charset=utf-8'}));
    const link = document.createElement('a');
    link.href = url; link.download = 'Moven.ics'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function reminder(row, opener) {
    const dialog = document.createElement('dialog');
    dialog.className = 'kg-cal kg-cal-reminder';
    dialog.setAttribute('aria-labelledby','kg-cal-reminder-title');
    dialog.innerHTML = `<form class="kg-cal-reminder-form">
      <header class="kg-cal-header">${icon('calendar_month')}<h2 id="kg-cal-reminder-title">${label('Напомнить о релизе')}</h2>
        <button type="button" data-cal-dismiss aria-label="${label('Закрыть')}">${icon('close')}</button></header>
      <p><strong>${escape(row.show.title)}</strong><br>${label('Сезон {season} · Эпизод {episode}',{season:row.episode.season_number,episode:row.episode.episode_number})} · ${escape(dateLabel(row.episode.air_date))}</p>
      <div class="kg-cal-reminder-scope">
        <label><input type="radio" name="scope" value="episode" checked>${label('Только этот эпизод')}</label>
        <label><input type="radio" name="scope" value="season">${label('Оставшиеся серии сезона')}</label>
      </div>
      <label class="kg-cal-reminder-time">${label('Ваше местное время')} <input type="time" name="time" value="19:00" required></label>
      <fieldset><legend>${label('Когда уведомить')}</legend>
        <label><input type="radio" name="lead" value="15" checked>${label('За 15 минут')}</label>
        <label><input type="radio" name="lead" value="0">${label('В выбранное время')}</label>
      </fieldset>
      <p class="kg-cal-status" role="status"></p>
      <button class="kg-cal-collapse" type="submit">${icon('calendar_month')}${label('Добавить в календарь')}</button>
    </form>`;
    document.body.append(dialog);
    dialog.querySelector('[data-cal-dismiss]').onclick = () => dialog.close();
    dialog.addEventListener('close', () => { dialog.remove(); if (opener.isConnected) opener.focus(); }, {once:true});
    dialog.querySelector('form').addEventListener('submit', async event => {
      event.preventDefault();
      const form = new FormData(event.target);
      const submit = dialog.querySelector('[type="submit"]');
      submit.disabled = true;
      dialog.querySelector('[role="status"]').textContent = '';
      try {
        await exportCalendar(row,form.get('scope') === 'season',form.get('time'),form.get('lead'));
        dialog.close();
      } catch {
        dialog.querySelector('[role="status"]').textContent = uiText('Не удалось экспортировать напоминание.');
        submit.disabled = false;
      }
    });
    dialog.showModal();
  }

  let page = 0;
  async function load(append = false) {
    const token = ++generation;
    if (!append) { rows = []; page = 0; more = false; }
    phase = apiKey ? 'loading' : 'key';
    render();
    if (!apiKey) return;
    const start = key(dateAt(month, 0, 1));
    const end = key(dateAt(month, 1, 0));
    try {
      const next = page+1;
      const result = tracked ? null : await window.KGSeries.discover({
        'air_date.gte':start, 'air_date.lte':end, sort_by:'popularity.desc', page:next
      });
      if (token !== generation) return;
      const ids = tracked ? window.KGSeries.bookmarkIds() : result.results.filter(movieCatalog.allows).map(show => show.id);
      const incoming = new Map(rows.map(row => [row.id,row]));
      let failed = false;
      for (let index=0; index<ids.length && token === generation; index+=5) {
        const batch = await Promise.allSettled(ids.slice(index,index+5).map(async id => {
          const show = await detail(id);
          if (!show || token !== generation) return null;
          return {show, ...await monthEpisodes(show,start,end)};
        }));
        for (const item of batch) {
          if (item.status === 'rejected') { failed = true; continue; }
          if (!item.value) continue;
          const {show,episodes,failed:seasonFailed} = item.value;
          failed ||= seasonFailed;
          for (const episode of episodes) {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(episode?.air_date || '') || episode.air_date < start || episode.air_date > end) continue;
            const id = `${show.id}:${episode.season_number}:${episode.episode_number}`;
            incoming.set(id, {id, show, episode});
          }
        }
      }
      if (token !== generation) return;
      rows = [...incoming.values()].sort((a,b) => a.episode.air_date.localeCompare(b.episode.air_date) || a.show.title.localeCompare(b.show.title));
      if (!failed) page = next;
      more = !!result && next < Math.min(result.total_pages, 500);
      phase = failed ? 'error' : '';
    } catch {
      if (token !== generation) return;
      phase = 'error';
    }
    render();
  }

  function mount(panel, back) {
    root = panel;
    root.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button) return;
      const {calMode,calMonth,calDate,calService,calEpisode,calReminder} = button.dataset;
      if (button.hasAttribute('data-cal-back')) return back();
      if (calMode && tracked !== (calMode === 'tracked')) {
        tracked = calMode === 'tracked'; service = ''; load(); return;
      }
      if (calMonth) {
        month = dateAt(month, Number(calMonth), 1);
        selected = key(month); service = ''; load(); return;
      }
      if (calDate) { selected = calDate; render(); return; }
      if (calService !== undefined) { service = calService; render(); return; }
      if (button.hasAttribute('data-cal-expand')) { expanded = !expanded; render(); return; }
      if (button.hasAttribute('data-cal-more') || button.hasAttribute('data-cal-retry')) { load(true); return; }
      if (calReminder) reminder(rows.find(row => row.id === calReminder),button);
      if (calEpisode) {
        const {show,episode} = rows.find(row => row.id === calEpisode);
        window.KGEpisodePage.open(show, episode, episode.season_number, {opener:button});
      }
    });
    document.addEventListener('kg-bookmark-change', event => {
      if (!root.hidden && tracked && window.KGSeries.isSeriesId(event.detail?.id)) load();
    });
  }

  async function releases(start, end, page) {
    const result = await window.KGSeries.discover({
      'air_date.gte':start, 'air_date.lte':end, sort_by:'popularity.desc', page
    });
    const items = [];
    const shows = result.results.filter(movieCatalog.allows);
    for (let i=0; i<shows.length; i+=5) {
      const batch = await Promise.allSettled(shows.slice(i,i+5).map(async source => {
        const show = await detail(source.id);
        if (!show) return [];
        const {episodes} = await monthEpisodes(show,start,end);
        return episodes.filter(episode => episode.air_date >= start && episode.air_date <= end)
          .map(episode => ({show,episode,service:serviceFor(show)}));
      }));
      for (const item of batch) if (item.status === 'fulfilled') items.push(...item.value);
    }
    return {items,more:page < Math.min(500,result.total_pages || 0)};
  }

  function show() {
    if (!month) { month = new Date(); selected = key(month); }
    details.clear(); seasons.clear();
    load();
  }
  window.KGSeriesCalendar = {mount, show, releases, reminder, exportReminders, hide:() => { generation++; }};
})();
