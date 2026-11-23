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
  const hasText = note => Boolean(String(note?.text || "").trim() || note?.fragments?.some?.(Boolean));
  const dateValue = value => /^\d{4}-\d{2}-\d{2}$/.test(value || "") ? value : "";
  const scoreText = score => score >= 9.5 ? "Выдающаяся работа" : score >= 8 ? "Отлично" :
    score >= 6 ? "Хорошо" : score >= 4 ? "Средне" : "Слабо";
  const starPath = "M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8l-6.2 3.3L7 14.2 2 9.3l6.9-1z";
  const star = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${starPath}"/><svg width="24" height="24"><path d="${starPath}"/></svg></svg>`;
  const tool = (action,label,content) =>
    `<button type="button" data-re-tool="${action}" aria-label="${l(label)}" title="${l(label)}">${content}</button>`;
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
  function renderBody(note) {
    const body=esc(note.text);
    if(!note.formatted)return body;
    return body.replace(/\*\*([^*\n]+)\*\*/g,"<b>$1</b>")
      .replace(/_([^_\n]+)_/g,"<i>$1</i>")
      .replace(/^&gt; ([^\n]+)/gm,"<q class=\"kg-re-quote\">$1</q>");
  }
  function diaryEntries() {
    return entries().filter(row=>row.updatedAt&&row.note.diary).map(row=>{
      const log=row.film._episodeLog;
      const film={...row.film,poster:row.film.poster_path,year:String(row.film.release_date||"").slice(0,4),
        ...(log?{_diaryKey:`${row.film.id}:${log.season}:${log.episode.episode_number}`}: {})};
      return {...row,film,review:true,code:""};
    });
  }
  async function shareCard(film,note) {
    const canvas=document.createElement("canvas");
    canvas.width=840;canvas.height=1060;
    const ctx=canvas.getContext("2d");
    const style=getComputedStyle(document.documentElement);
    const color=name=>`rgb(${style.getPropertyValue(name)})`;
    ctx.fillStyle=color("--kg-surface-container-lowest");ctx.fillRect(0,0,840,1060);
    ctx.fillStyle=color("--kg-primary");ctx.fillRect(60,70,76,5);
    ctx.font="600 24px Inter, sans-serif";ctx.fillText("MOVEN",60,116);
    function block(text,y,font,lineHeight,maxLines,ink) {
      ctx.font=font;ctx.fillStyle=ink;
      const lines=[];let line="";
      for(const word of String(text).split(/\s+/)){
        const candidate=line?line+" "+word:word;
        if(line && ctx.measureText(candidate).width>720){lines.push(line);line=word;}
        else line=candidate;
      }
      if(line)lines.push(line);
      for(const [i,row] of lines.slice(0,maxLines).entries())
        ctx.fillText(row+(i===maxLines-1&&lines.length>maxLines?"…":""),60,y+i*lineHeight,720);
      return y+lineHeight*Math.min(maxLines,lines.length);
    }
    const ink=color("--kg-on-surface"),muted=color("--kg-on-surface-variant");
    const titleY=block(filmTitle(film),214,"700 54px Inter, sans-serif",65,3,ink);
    const scoreY=note.rating?block(`★ ${number.format(note.rating*2)} / 10`,titleY+24,"600 28px Inter, sans-serif",38,1,color("--kg-primary")):titleY;
    if(!note.spoiler){
      const headingY=block(note.title,scoreY+24,"600 32px Inter, sans-serif",42,3,ink);
      block(String(note.text).replace(/[\*_]/g,""),headingY+15,"400 26px Inter, sans-serif",37,8,muted);
    } else block(uiText("Со спойлерами"),scoreY+24,"600 28px Inter, sans-serif",38,1,muted);
    if(note.author)block(note.author,974,"600 24px Inter, sans-serif",31,1,muted);
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,"image/png"));
    if(!blob)return;
    const file=new File([blob],"moven-review.png",{type:"image/png"});
    if(navigator.canShare?.({files:[file]})){
      try {await navigator.share({files:[file],title:filmTitle(film)});return;}
      catch(error){if(error.name==="AbortError")return;}
    }
    const url=URL.createObjectURL(blob);
    const link=document.createElement("a");
    link.href=url;link.download=file.name;link.click();
    setTimeout(()=>URL.revokeObjectURL(url),5000);
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
    const initialTags=Array.isArray(prior.tags)?prior.tags.filter(tag=>typeof tag==="string"):[];
    const fragments=Array.isArray(prior.fragments)?prior.fragments.filter(fragment=>typeof fragment==="string"):[];
    const viewingDate=dateValue(prior.viewingDate??history?.date??String(film.watchedAt||"").slice(0,10));
    const genreNames=(Array.isArray(film.genres)?film.genres.filter(genre=>typeof genre==="string"):[]).concat(
      (Array.isArray(film.genre_ids)?film.genre_ids:[]).map(id=>(window.KGSeries.isSeriesId(film.id)?window.KGSeries.genreLabels:GENRES)[id]).filter(Boolean));
    const genres=[...new Set(genreNames)].slice(0,3);
    const art=film.localizedPoster?.path||film.poster_path||film.poster||log?.episode.still_path;
    const poster=/^\/[\w.-]+$/.test(art||"") ? `https://image.tmdb.org/t/p/w185${art}` : "";
    const editor=document.createElement("dialog");
    active=editor;
    editor.id="kg-review-editor";
    editor.setAttribute("aria-labelledby","kg-re-title");
    editor.innerHTML=`<form>
      <header class="kg-re-header">
        <button class="kg-rv-control" type="button" data-re-back autofocus aria-label="${l("Закрыть")}">${icon("close")}</button>
        <h1 id="kg-re-title">${l(saved||hasText(history)?"Редактировать рецензию":"Новая рецензия")}</h1>
        <button class="kg-rv-control kg-re-primary" type="submit">${l("Сохранить")}</button>
      </header>
      <main class="kg-re-main">
        <section class="kg-re-context">
          <span class="kg-rv-art">${icon(log||window.KGSeries.isSeriesId(film.id)?"tv":"movie")}${poster?`<img src="${esc(poster)}" alt="">`:""}
            ${log?`<b>S${log.season} · E${log.episode.episode_number}</b>`:""}</span>
          <div class="kg-re-film-info">
            <div><small>${l(log?"Серия":window.KGSeries.isSeriesId(film.id)?"Сериал":"Фильм")} ${esc(String(film.release_date||film.year||"").slice(0,4))}</small>
              <button type="button" class="kg-rv-control" data-re-change>${l("Сменить")}</button></div>
            <strong>${esc(filmTitle(film))}</strong><small>${esc(scopeLabel(film,log))}</small>
            ${genres.length?`<div class="kg-re-genres">${genres.map(genre=>`<span>${l(genre)}</span>`).join("")}</div>`:""}
          </div>
        </section>
        <section class="kg-re-panel">
          <div class="kg-re-rating"><strong class="kg-re-label">${l("Ваша оценка")}</strong><output for="kg-re-rating"></output></div>
          <div class="kg-re-stars">
            <div aria-hidden="true">${Array.from({length:10},()=>star).join("")}</div>
            <input id="kg-re-rating" name="rating" type="range" min="0" max="10" step="0.5" value="${initialRating}" aria-label="${l("Ваша оценка")}">
          </div>
          <p class="kg-re-rating-caption" data-re-rating-caption hidden></p>
          <div class="kg-re-tags">${tags.map(tag=>`<button class="kg-rv-control" type="button" data-re-tag="${esc(tag)}" aria-pressed="${initialTags.includes(tag)}">${l(tag)}</button>`).join("")}</div>
        </section>
        <section class="kg-re-panel kg-re-heading-field">
          <label class="kg-re-label" for="kg-re-heading">${l("Заголовок текста")}</label>
          <input id="kg-re-heading" name="heading" maxlength="160" value="${esc(prior.title||"")}" placeholder="${l("Заголовок рецензии")}">
        </section>
        <section class="kg-re-panel kg-re-fields">
          <div class="kg-re-toolbar">
            <div role="group" aria-label="${l("Форматирование")}">
              ${tool("bold","Жирный","<b>B</b>")}${tool("italic","Курсив","<i>I</i>")}
              ${tool("quote","Цитата",icon("format_quote"))}
              ${tool("spoiler","Скрытый спойлер",icon("visibility_off"))}
              ${tool("time","Таймкод сцены",icon("schedule"))}
            </div>
            <small data-re-auto role="status"></small>
          </div>
          <div class="kg-re-time" data-re-time hidden>
            <input name="timecode" aria-label="${l("Таймкод сцены")}" placeholder="00:00" inputmode="text" maxlength="10">
            <button type="button" class="kg-rv-control" data-re-insert-time>${l("Вставить")}</button>
          </div>
          <label class="kg-re-sr" for="kg-re-body">${l("Текст рецензии")}</label>
          <textarea id="kg-re-body" name="body" rows="8" maxlength="${Math.max(12000,String(prior.text||"").length)}" placeholder="${l("Что запомнилось и почему?")}">${esc(prior.text||"")}</textarea>
          <div data-re-fragments></div>
          <div class="kg-re-counters"><small data-re-length></small><small data-re-reading></small></div>
        </section>
        <label class="kg-re-panel kg-re-spoiler">${icon("warning")}<span><strong>${l("Рецензия содержит спойлеры")}</strong>
          <small>${l("Текст будет скрыт до раскрытия спойлера.")}</small></span>
          <input name="spoiler" type="checkbox" role="switch" ${prior.spoiler?"checked":""}>
        </label>
        <section class="kg-re-options">
          <div class="kg-re-option-head"><h2 class="kg-re-label">${l("Вайбы и кино-теги")}</h2><small data-re-tag-count></small></div>
          <div class="kg-re-tags" data-re-custom-tags></div>
          <div class="kg-re-inline">
            <input name="tag" aria-label="${l("Новый тег")}" maxlength="32" placeholder="${l("Новый тег")}">
            <button type="button" class="kg-rv-control" data-re-add-tag>${l("Добавить тег")}</button>
          </div>
        </section>
        <section class="kg-re-options">
          <h2 class="kg-re-label">${l("Условия просмотра")}</h2>
          <div class="kg-re-view-meta">
            <label>${icon("tv")}<span>${l("Формат")}<input name="viewFormat" maxlength="48" value="${esc(prior.viewFormat||"")}" placeholder="${l("Указать")}"></span></label>
            <label>${icon("subtitles")}<span>${l("Звуковая дорожка")}<input name="audio" maxlength="48" value="${esc(prior.audio||"")}" placeholder="${l("Указать")}"></span></label>
            <label>${icon("calendar_month")}<span>${l("Дата просмотра")}<input type="date" name="viewingDate" value="${esc(viewingDate)}"></span></label>
          </div>
        </section>
        <section class="kg-re-panel kg-re-destinations">
          <h2 class="kg-re-label">${l("Синхронизация и ленты")}</h2>
          <label>${icon("public")}<span>${l("Публичная лента Moven")}<small>${l("Скоро")}</small></span><input type="checkbox" disabled></label>
          <label>${icon("bookmarks")}<span>${l("Личный кинодневник")}<small>${l("Показать рецензию в заметках дневника.")}</small></span><input type="checkbox" name="diary" ${prior.diary===false?"":"checked"}></label>
          <label>${icon("send")}<span>${l("Создать карточку для Telegram / Stories")}<small>${l("Поделиться карточкой после сохранения.")}</small></span><input type="checkbox" name="shareCard" ${prior.shareCard?"checked":""}></label>
        </section>
        <p role="status" data-re-status hidden></p>
        <footer class="kg-re-footer">
          <button type="submit" class="kg-rv-control kg-re-primary">${icon("auto_awesome")}${l("Сохранить рецензию")}</button>
          <button type="button" class="kg-rv-control" data-re-draft>${icon("bookmark")}${l("Сохранить в черновики")}</button>
          <small data-re-save-note></small>
        </footer>
      </main>
    </form>`;
    document.body.append(editor);
    const form=editor.querySelector("form"),fields=form.elements;
    const selected=new Set(initialTags);
    const body=fields.body,auto=editor.querySelector("[data-re-auto]"),saveNote=editor.querySelector("[data-re-save-note]");
    const timePanel=editor.querySelector("[data-re-time]");
    let formatted=Boolean(prior.formatted),selection=null,timer,autosaved=false,switching=false;
    const values=()=>({title:fields.heading.value.trim(),text:body.value.trim(),
      rating:Number(fields.rating.value)/2,spoiler:fields.spoiler.checked,tags:[...selected],formatted,fragments:[...fragments],
      viewingDate:dateValue(fields.viewingDate.value),viewFormat:fields.viewFormat.value.trim(),audio:fields.audio.value.trim(),
      diary:fields.diary.checked,shareCard:fields.shareCard.checked});
    const original=JSON.stringify(values());
    const feedback=editor.querySelector("[data-re-status]");
    const update=()=>{
      const score=Number(fields.rating.value);
      editor.querySelector("output").textContent=score?`★ ${number.format(score)} / 10`:"— / 10";
      [...editor.querySelector(".kg-re-stars > div").children].forEach((svg,i)=>{
        const fill=svg.querySelector("svg");
        fill.setAttribute("width",String(24*Math.min(1,Math.max(0,score-i))));
      });
      const caption=editor.querySelector("[data-re-rating-caption]");
      caption.hidden=!score;caption.textContent=score?`${number.format(score)} — ${uiText(scoreText(score))}`:"";
      const text=[body.value,...fragments].join(" ").trim(),words=text?text.split(/\s+/u).length:0;
      editor.querySelector("[data-re-length]").textContent=uiText("{chars} зн. · {words} слов",{chars:number.format(text.length),words:number.format(words)});
      editor.querySelector("[data-re-reading]").textContent=words?uiText("≈ {minutes} мин чтения",{minutes:Math.max(1,Math.ceil(words/220))}):"";
      editor.querySelector("[data-re-tag-count]").textContent=uiText("Выбрано: {count}",{count:selected.size});
    };
    function paintExtras() {
      editor.querySelector("[data-re-custom-tags]").innerHTML=[...selected].map(tag=>
        `<button class="kg-rv-control" type="button" data-re-remove-tag="${esc(tag)}">#${l(tag)} <span aria-hidden="true">×</span></button>`).join("");
      editor.querySelector("[data-re-fragments]").innerHTML=fragments.map((text,index)=>
        `<details class="kg-re-fragment"><summary>${l("Скрытый фрагмент")}</summary><p>${esc(text)}</p>
          <button type="button" class="kg-rv-control" data-re-restore="${index}">${l("Вернуть в текст")}</button></details>`).join("");
      for(const button of editor.querySelectorAll("[data-re-tag]"))button.setAttribute("aria-pressed",String(selected.has(button.dataset.reTag)));
      update();
    }
    function persist(draft, value) {
      const records=state(),reviews=records.reviews||{},drafts=records.drafts||{};
      const record={film:snapshot(film,log),note:{...value,author:window.KGProfileNickname?.()||saved?.author||history?.author||""},
        updatedAt:new Date().toISOString()};
      if (draft) drafts[id]=record;
      else {reviews[id]=record;delete drafts[id];}
      localStorage.setItem(key,JSON.stringify({reviews,drafts}));
      return record.note;
    }
    function closeEditor() {
      document.dispatchEvent(new CustomEvent("kg:review-change",{detail:{id}}));
      editor.close();
    }
    function autosave() {
      const value=values();
      if((!hasText(value)&&!value.title)||JSON.stringify(value)===original)return;
      try {
        persist(true,value);autosaved=true;
        auto.textContent=uiText("Автосохранено");saveNote.textContent=uiText("Черновик сохранён на устройстве");
      }catch {auto.textContent=uiText("Не удалось сохранить черновик.");}
    }
    function changed() {
      update();clearTimeout(timer);
      if(JSON.stringify(values())!==original)auto.textContent="";
      timer=setTimeout(autosave,700);
    }
    function finish(mode) {
      const value=values();
      const leaving=mode==="back"||mode==="change";
      if ((mode==="save" && !hasText(value)) || (mode==="draft" && !value.title && !hasText(value))) {
        feedback.hidden=false;feedback.textContent=uiText("Добавьте текст рецензии.");
        body.focus();return;
      }
      clearTimeout(timer);
      try {
        if(leaving && (JSON.stringify(value)===original || (!value.title&&!hasText(value)))){
          // Clear an autosaved intermediate edit if the form is back at its original state.
          if(autosaved){
            const records=state();
            if(data.drafts?.[id])records.drafts[id]=data.drafts[id];else delete records.drafts[id];
            localStorage.setItem(key,JSON.stringify(records));
          }
        } else {
          const note=persist(mode!=="save",value);
          if(mode==="save"&&note.shareCard)shareCard(film,note).catch(()=>{});
        }
        switching=mode==="change";closeEditor();
      }
      catch {feedback.hidden=false;feedback.textContent=uiText("Не удалось сохранить рецензию.");}
    }
    function editBody(action) {
      const [start,end]=selection||[body.selectionStart,body.selectionEnd];
      const text=body.value.slice(start,end);
      if(action==="time"){
        timePanel.hidden=false;fields.timecode.focus();return;
      }
      if(!text.trim()&&action==="spoiler"){
        feedback.hidden=false;feedback.textContent=uiText("Выделите текст скрытого фрагмента.");body.focus();return;
      }
      if(action==="spoiler")fragments.push(text.trim());
      const before=action==="bold"?"**":action==="italic"?"_":"";
      formatted||=action!=="spoiler";
      const next=action==="spoiler"?"":action==="quote"?`\n> ${text.replaceAll("\n","\n> ")}\n`:`${before}${text}${before}`;
      body.focus();body.setRangeText(next,start,end,"end");
      if(!text&&before)body.setSelectionRange(start+before.length,start+before.length);
      selection=null;feedback.hidden=true;paintExtras();changed();
    }
    form.addEventListener("input",changed);
    form.addEventListener("pointerdown",event=>{
      if(event.target.closest("[data-re-tool]"))selection=[body.selectionStart,body.selectionEnd];
    });
    form.addEventListener("submit",event=>{event.preventDefault();finish("save");});
    form.addEventListener("click",event=>{
      const button=event.target.closest("button");
      if (!button) return;
      if (button.hasAttribute("data-re-back")) finish("back");
      else if (button.hasAttribute("data-re-change")) finish("change");
      else if (button.hasAttribute("data-re-draft")) finish("draft");
      else if (button.dataset.reTool) editBody(button.dataset.reTool);
      else if (button.hasAttribute("data-re-insert-time")) {
        const time=fields.timecode.value.trim();
        if(!/^(?:\d+:)?\d{1,2}:[0-5]\d$/.test(time)){fields.timecode.focus();return;}
        const [start,end]=selection||[body.selectionStart,body.selectionEnd];
        body.focus();body.setRangeText(`[${time}] `,start,end,"end");selection=null;timePanel.hidden=true;changed();
      } else if (button.dataset.reRestore!==undefined) {
        const [text]=fragments.splice(Number(button.dataset.reRestore),1);
        body.value=[body.value,text].filter(Boolean).join("\n\n");
        paintExtras();changed();
      } else if (button.hasAttribute("data-re-add-tag")) {
        const tag=fields.tag.value.trim().replace(/^#+/,"").trim();
        if(tag&&selected.size<12){selected.add(tag);fields.tag.value="";paintExtras();changed();}
      } else if(button.dataset.reRemoveTag) {
        selected.delete(button.dataset.reRemoveTag);paintExtras();changed();
      } else if (button.dataset.reTag) {
        const tag=button.dataset.reTag;
        if (selected.has(tag)) selected.delete(tag); else selected.add(tag);
        paintExtras();changed();
      }
    });
    editor.addEventListener("cancel",event=>{event.preventDefault();finish("back");});
    editor.addEventListener("error",event=>{if(event.target.tagName==="IMG")event.target.hidden=true;},true);
    editor.addEventListener("close",()=>{
      clearTimeout(timer);
      if(active===editor)active=null;
      editor.remove();
      if(switching)window.KGOpenReviewPicker?.(opener);
      else if(opener?.isConnected)opener.focus({preventScroll:true});
    },{once:true});
    if(data.drafts?.[id]){auto.textContent=uiText("Автосохранено");saveNote.textContent=uiText("Черновик сохранён на устройстве");}
    paintExtras();
    editor.showModal();
    return editor;
  }

  window.KGReviews={open,button,paintAction,entries,scopeLabel,renderBody,diaryEntries};
})();
