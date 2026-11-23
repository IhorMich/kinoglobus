/* Reviews and their drafts live independently of viewing marks. */
(() => {
  const key = "kgReviews.v1";
  const esc = value => String(value ?? "").replace(/[&<>"']/g, ch =>
    ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[ch]);
  const l = (key, params) => esc(uiText(key, params));
  const icon = name => `<span class="material-symbols-outlined" aria-hidden="true">${name}</span>`;
  const number = new Intl.NumberFormat(interfaceLanguage, {maximumFractionDigits:1});
  const tags = ["Визуальный восторг","Рекомендую всем","Гипнотический саундтрек","Только для синефилов"];
  const state = () => store.get(key,{}) || {};
  const targetKey = (film, log) => log ? `episode:${film.id}:${log.season}:${log.episode.episode_number}`
    : `${window.KGSeries.isSeriesId(film.id)?"series":"film"}:${film.id}`;
  const viewingNote = (film, log) => log
    ? window.KGSeriesDetail.readEpisodeNotes(film.id)[`${log.season}:${log.episode.episode_number}`]
    : (store.get("kgCinemaDiaryNotes",{}) || {})[film.id];
  const filmTitle = film => film.title || film.name || film.original_title || film.original || uiText("Без названия");
  const scopeLabel = (film, log) => log
    ? [uiText("Сезон {season}",{season:log.season}),uiText("Эпизод {episode}",{episode:log.episode.episode_number}),log.episode.name].filter(Boolean).join(" · ")
    : [uiText(window.KGSeries.isSeriesId(film.id)?"Сериал":"Фильм"),String(film.release_date||film.year||"").slice(0,4)].filter(Boolean).join(" · ");
  const hasText = note => Boolean(String(note?.text || "").trim());
  let active;

  function snapshot(film, log) {
    const record = window.KGFilmCard.savedFilm(film);
    const saved = {id:Number(record.id),adult:record.adult,title:filmTitle(record),original_title:record.original_title,
      release_date:record.release_date,backdrop_path:record.backdrop_path,poster_path:record.localizedPoster?.path||record.poster_path,
      vote_average:record.vote_average,overview:record.overview,_cc:record._cc,genre_ids:record.genre_ids,
      media_type:window.KGSeries.isSeriesId(record.id)?"tv":"movie"};
    if (log) {
      const {episode_number,name,still_path,air_date,runtime}=log.episode;
      saved._episodeLog={series:{...saved},episode:{episode_number,name,still_path,air_date,runtime},season:log.season};
    }
    return saved;
  }

  function entries(draft=false) {
    const saved = Object.values((draft ? state().drafts : state().reviews) || {});
    const legacy = draft ? [] : (window.KGReadDiaryNotes?.() || []).filter(row=>hasText(row.note));
    const merged = new Map(legacy.map(row=>[targetKey(row.film,row.film._episodeLog),row]));
    for (const row of saved) {
      if (!row?.film || !row.note) continue;
      const id=targetKey(row.film,row.film._episodeLog),date=new Date(row.updatedAt);
      merged.set(id,{...row,draft,date:Number.isNaN(+date)?null:date,key:row.updatedAt||""});
    }
    return [...merged.values()].filter(row=>movieCatalog.allows(row.film._episodeLog?.series||row.film))
      .sort((a,b)=>String(b.key||"").localeCompare(String(a.key||"")));
  }

  function actionLabel(film,log) {
    const data=state(),id=targetKey(film,log);
    return uiText(data.drafts?.[id]?"Продолжить черновик":
      data.reviews?.[id]||hasText(viewingNote(film,log))?"Редактировать рецензию":"Написать рецензию");
  }
  function paintAction(button,film,log,watched) {
    const text=actionLabel(film,log);
    button.querySelector("[data-review-label]").textContent=text;
    button.hidden=!watched&&text===uiText("Написать рецензию");
  }
  function button(film,log,watched) {
    const text=actionLabel(film,log);
    return `<button type="button" class="kg-review-action" data-review-action ${!watched&&text===uiText("Написать рецензию")?"hidden":""}>
      ${icon("edit_note")}<span data-review-label>${esc(text)}</span></button>`;
  }

  function open(film, {log,opener=document.activeElement}={}) {
    if (active?.open || !Number.isSafeInteger(Number(film?.id)) || Number(film.id)<=0 || !movieCatalog.allows(film) ||
        (log && (!Number.isInteger(log.season)||log.season<0||!Number.isInteger(log.episode?.episode_number)||log.episode.episode_number<1))) return;
    const id=targetKey(film,log),data=state(),saved=data.reviews?.[id]?.note;
    const history=viewingNote(film,log);
    const prior=data.drafts?.[id]?.note ?? saved ?? history ?? {};
    const initialRating=Math.min(10,Math.max(0,Number(prior.rating)*2||0));
    const initialTags=Array.isArray(prior.tags)?prior.tags:[];
    const art=film.localizedPoster?.path||film.poster_path||film.poster||log?.episode.still_path;
    const poster=/^\/[\w.-]+$/.test(art||"") ? `https://image.tmdb.org/t/p/w185${art}` : "";
    const editor=document.createElement("dialog");
    active=editor;
    editor.id="kg-review-editor";
    editor.setAttribute("aria-labelledby","kg-re-title");
    editor.innerHTML=`<form>
      <header class="kg-re-header">
        <button class="kg-rv-control" type="button" data-re-back autofocus aria-label="${l("Назад")}">${icon("arrow_back")}</button>
        <h1 id="kg-re-title">${l(saved||hasText(history)?"Редактировать рецензию":"Новая рецензия")}</h1>
        <button class="kg-rv-control kg-re-primary" type="submit">${l("Сохранить")}</button>
      </header>
      <main class="kg-re-main">
        <section class="kg-re-context">
          <span class="kg-rv-art">${icon(log||window.KGSeries.isSeriesId(film.id)?"tv":"movie")}${poster?`<img src="${esc(poster)}" alt="">`:""}</span>
          <div><strong>${esc(filmTitle(film))}</strong><small>${esc(scopeLabel(film,log))}</small></div>
        </section>
        <section class="kg-re-panel">
          <label class="kg-re-rating"><strong>${l("Ваша оценка")}</strong><output for="kg-re-rating"></output></label>
          <input id="kg-re-rating" name="rating" type="range" min="0" max="10" step="0.5" value="${initialRating}" aria-label="${l("Ваша оценка")}">
          <div class="kg-re-scale"><span>0</span><span>5</span><span>10</span></div>
          <div class="kg-re-tags">${tags.map(tag=>`<button class="kg-rv-control" type="button" data-re-tag="${esc(tag)}" aria-pressed="${initialTags.includes(tag)}">${l(tag)}</button>`).join("")}</div>
        </section>
        <section class="kg-re-panel kg-re-fields">
          <label for="kg-re-heading">${l("Заголовок текста")}</label>
          <input id="kg-re-heading" name="heading" maxlength="160" value="${esc(prior.title||"")}" placeholder="${l("Заголовок рецензии")}">
          <label class="kg-re-sr" for="kg-re-body">${l("Текст рецензии")}</label>
          <textarea id="kg-re-body" name="body" rows="8" maxlength="${Math.max(12000,String(prior.text||"").length)}" placeholder="${l("Что запомнилось и почему?")}">${esc(prior.text||"")}</textarea>
          <small data-re-length></small>
        </section>
        <label class="kg-re-panel kg-re-spoiler"><span>${l("Рецензия содержит спойлеры")}</span>
          <input name="spoiler" type="checkbox" role="switch" ${prior.spoiler?"checked":""}>
        </label>
        <p role="status" data-re-status hidden></p>
      </main>
      <footer class="kg-re-footer">
        <button type="submit" class="kg-rv-control kg-re-primary">${icon("check")}${l("Сохранить рецензию")}</button>
        <button type="button" class="kg-rv-control" data-re-draft>${icon("edit_note")}${l("Сохранить в черновики")}</button>
      </footer>
    </form>`;
    document.body.append(editor);
    const form=editor.querySelector("form"),fields=form.elements;
    const selected=new Set(initialTags);
    const values=()=>({title:fields.heading.value.trim(),text:fields.body.value.trim(),
      rating:Number(fields.rating.value)/2,spoiler:fields.spoiler.checked,tags:[...selected]});
    const original=JSON.stringify(values());
    const feedback=editor.querySelector("[data-re-status]");
    const update=()=>{
      const score=Number(fields.rating.value);
      editor.querySelector("output").textContent=score?`${number.format(score)} / 10`:"— / 10";
      editor.querySelector("[data-re-length]").textContent=uiText("Знаков: {count}",{count:number.format(fields.body.value.length)});
    };
    function persist(draft, value) {
      const records=state(),reviews=records.reviews||{},drafts=records.drafts||{};
      const record={film:snapshot(film,log),note:{...value,author:window.KGProfileNickname?.()||saved?.author||history?.author||""},
        updatedAt:new Date().toISOString()};
      if (draft) drafts[id]=record;
      else {reviews[id]=record;delete drafts[id];}
      localStorage.setItem(key,JSON.stringify({reviews,drafts}));
      document.dispatchEvent(new CustomEvent("kg:review-change",{detail:{id}}));
      editor.close();
    }
    function finish(mode) {
      const value=values();
      if (mode==="back" && JSON.stringify(value)===original) {editor.close();return;}
      if ((mode==="save" && !value.text) || (mode==="draft" && !value.title && !value.text)) {
        feedback.hidden=false;feedback.textContent=uiText("Добавьте текст рецензии.");
        fields.body.focus();return;
      }
      if (mode==="back" && !value.title && !value.text && !data.drafts?.[id]) {editor.close();return;}
      try {persist(mode!=="save",value);}
      catch {feedback.hidden=false;feedback.textContent=uiText("Не удалось сохранить рецензию.");}
    }
    form.addEventListener("input",update);
    form.addEventListener("submit",event=>{event.preventDefault();finish("save");});
    form.addEventListener("click",event=>{
      const button=event.target.closest("button");
      if (!button) return;
      if (button.hasAttribute("data-re-back")) finish("back");
      else if (button.hasAttribute("data-re-draft")) finish("draft");
      else if (button.dataset.reTag) {
        const tag=button.dataset.reTag;
        if (selected.has(tag)) selected.delete(tag); else selected.add(tag);
        button.setAttribute("aria-pressed",String(selected.has(tag)));
      }
    });
    editor.addEventListener("cancel",event=>{event.preventDefault();finish("back");});
    editor.addEventListener("error",event=>{if(event.target.tagName==="IMG")event.target.hidden=true;},true);
    editor.addEventListener("close",()=>{
      if(active===editor)active=null;
      editor.remove();
      if(opener?.isConnected)opener.focus({preventScroll:true});
    },{once:true});
    update();
    editor.showModal();
    return editor;
  }

  window.KGReviews={open,button,paintAction,entries,scopeLabel};
})();
