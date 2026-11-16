/* One content policy for TMDB data and saved film snapshots. */
const movieCatalog = (() => {
  const blockedIds = new Set();
  const explicitTitle = /\b(?:porn(?:o|ography|ographic)?|hardcore sex|xxx|sex tape compilation)\b|порно(?:фильм|графия|ролик)?/iu;
  const explicitKeyword = /^(?:porn(?:o|ography|ographic film)?|adult film|adult video|hardcore sex|explicit sex|sexploitation|hentai|softcore porn(?:ography)?)$/iu;

  function hasExplicitMetadata(item) {
    const keywords = item.keywords?.keywords || item.keywords?.results || [];
    return [item.title, item.original_title, item.original, item.name, item.original_name]
      .some(title => explicitTitle.test(String(title || '').normalize('NFKC'))) ||
      keywords.some(keyword => explicitKeyword.test(String(keyword.name || '').trim()));
  }

  function allows(item) {
    return item?.adult === false && !blockedIds.has(Number(item.id)) && !hasExplicitMetadata(item);
  }

  function allowsPerson(person) {
    return person?.adult === false && !hasExplicitMetadata(person);
  }

  function allowsTrailer(video) {
    const name = String(video.name || '').normalize('NFKC');
    return !explicitTitle.test(name) && !/\b(?:red[ -]band|uncensored|age[ -]restricted)\b|без цензуры/iu.test(name);
  }

  function savedFilm(record) {
    if (allows(record)) return record;
    if (!record || record.adult === true || hasExplicitMetadata(record) || blockedIds.has(Number(record.id))) return null;
    // Old snapshots did not record the classification. Keep the reference,
    // but do not show its title or artwork before a fresh lookup.
    const {id, cc, countries, productionCountries, watchedAt} = record;
    return {id, cc, countries, productionCountries, watchedAt};
  }

  function sanitize(data, endpoint) {
    if (!data || typeof data !== 'object') return data;
    const movie = /^movie\/\d+$/.test(endpoint);
    const person = /^person\/\d+$/.test(endpoint);
    if ((movie && !allows(data)) || (person && !allowsPerson(data))) {
      if (movie && data.id != null) blockedIds.add(Number(data.id));
      const error = new Error('Этот материал недоступен.');
      error.code = 'CATALOG_RESTRICTED';
      throw error;
    }
    function filterRows(rows, strict) {
      return rows.filter(row => strict ? (row?.media_type === "person" ? allowsPerson(row) : allows(row)) : row?.adult !== true).map(clean);
    }
    function clean(item) {
      if (!item || typeof item !== 'object') return item;
      const result = {...item};
      for (const key of ['known_for', 'items']) {
        if (Array.isArray(item[key])) result[key] = filterRows(item[key], true);
      }
      for (const key of ['movie_credits', 'combined_credits', 'credits']) {
        if (item[key]) result[key] = clean(item[key]);
      }
      if (Array.isArray(item.cast)) result.cast = filterRows(item.cast, personCredits);
      if (Array.isArray(item.crew)) result.crew = filterRows(item.crew, personCredits);
      return result;
    }
    const personCredits = person || /^person\/\d+\/(?:movie|combined)_credits$/.test(endpoint);
    const result = clean(data);
    const filmResults = /^(?:discover\/movie|search\/(?:movie|person|multi|tv)|movie\/\d+\/(?:recommendations|similar))$/.test(endpoint);
    if (Array.isArray(result.results) && filmResults) {
      result.results = endpoint === 'search/person'
        ? result.results.filter(allowsPerson).map(clean)
        : filterRows(result.results, true);
    }
    return result;
  }

  async function request(input, options) {
    const url = new URL(input);
    const endpoint = url.pathname.replace(/^\/3\//, '');
    if (/^(?:discover|search)\//.test(endpoint) || url.searchParams.has('include_adult')) {
      url.searchParams.set('include_adult', 'false');
    }
    if (/^movie\/\d+$/.test(endpoint)) {
      const parts = new Set((url.searchParams.get('append_to_response') || '').split(',').filter(Boolean));
      parts.add('keywords');
      url.searchParams.set('append_to_response', [...parts].join(','));
    }
    const response = await fetch(url, options);
    return {
      ok: response.ok,
      status: response.status,
      async json() {
        const data = await response.json();
        return response.ok ? sanitize(data, endpoint) : data;
      }
    };
  }

  return Object.freeze({request, allows, savedFilm, allowsTrailer});
})();
