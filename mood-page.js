(function(){
  const moods=[
    {id:"wine",icon:"wine_bar",image:"https://lh3.googleusercontent.com/aida-public/AB6AXuAdfWUuDLcsXf_oLJQ30JmOfrhOT5QAN9pEpBskyXFGQJEUFQXC02jG9Vqv-9N-72VnkjvxbH8P7xEd-GtcEIOq1esTUcIl1XQfyXbrwaxxirhjCg4V1JDtx9QUNZ7ZBwB9UXlFmkAgxyuWmRhaOTmN6WUp_-BnV-MrIh6WOEydfvQeG2vI3lvdv0ENdlsGquKNq8Z3l-dBpQbtuabFcY4XKrWudFMPR1fGEZmJ2gbT",title:"«Для уютного вечера с бокалом»",tag:"#Уют #Эстетика",description:"Тёплый вечер, приглушённый свет, изящные диалоги и живописная эстетика европейских улиц.",countries:["FR","IT","ES","PT","AR"],genres:[18,10749],labels:["🇫🇷 Франция","🇮🇹 Италия","🇪🇸 Испания"],genreLabel:"Романтика · Драма"},
    {id:"mindfuck",icon:"neurology",image:"https://lh3.googleusercontent.com/aida-public/AB6AXuB4ILuNdkFnzFDIjU5qBUzg1JEkZuvRHOH2W5iabFs_sU_cqRFLZo_OdVoIRIpUZeI_hhq16iA8YXxJX6a1VAfEuhm0Y6gKbxdod0vQPvOweZMFwVTF79ujF0HnH0Ozz8BebLIefKo3DS268OBObNQn92YgxwY1tbfhtPuE8DZGp3a1QzIyFnOscPiopsuv7gLWijghc7nNGoSTHJ9zTRBPuziAsf4GS-LJWwnSUEhH",title:"«Взрыв мозга / Психоделика»",tag:"#ЛабиринтыРазума",description:"Запутанные сюжетные петли, сюрреализм, гипнотический саундтрек и глубокий экзистенциальный шок.",countries:["JP","KR","GB","US","FR"],genres:[53,9648,878],labels:["🇯🇵 Япония","🇬🇧 Великобритания","🇰🇷 Южная Корея"],genreLabel:"Неонуар · Триллер"},
    {id:"adrenaline",icon:"speed",image:"https://lh3.googleusercontent.com/aida-public/AB6AXuAGexbqdwECXg6zRJ7etUunjzyOH2R8ubQEFWvPcOAsmc7ejOHedM8c7Fjls5mankwI4SR3vN2n_-wNUkUxYrUqV9jAGftZgj3Gg2N-uGhST7stkrA5rQaopTtbl2hny8xamwFOeovigzkrwG_qRf9H5VnFZDMVEW6E7qnbW2b1yQE26a4F7sw9vP5SLOjgbBABznaTc_WjlZ1NMCrlV08kdGXAeqH2q2RAzzi5Sr5k",title:"«Динамичный вечер / Адреналин»",tag:"#Драйв #Неон",description:"Пульсирующий темп, филигранная хореография боёв, погони в неоновом дожде и чистый драйв.",countries:["HK","KR","ID","US"],genres:[28,80,53],labels:["🇭🇰 Гонконг","🇰🇷 Южная Корея","🇮🇩 Индонезия"],genreLabel:"Боевик · Криминал"},
    {id:"melancholy",icon:"rainy",image:"https://lh3.googleusercontent.com/aida-public/AB6AXuBdbnn0km5yORlwK-lA4XBnZbrfj6Zjy7H8X3Li6L_W8agCOcA0PnT9NaxOqWiA_4Abw1hIXItmmF7UBNl_WNG37qHFY-tK0Dfjq_Jml2UnL27wC9NDRJfMtv1elK9uEJrvrnGNeq3gcUSgEr0u3qqPgVXuYFyU-vR2Yukj7VFUorrI9rVoMdQu1fIgwoI8wBtyB8884X3wZqzk5p5oBxhBRY5mi3qVjoYriej05ked",title:"«Меланхолия и дождь»",tag:"#Скандинавия #СеверныйВетер",description:"Свинцовое северное небо, холодные фьорды, неспешный ритм и философское одиночество.",countries:["DK","SE","IS","NO","FI"],genres:[18,9648],labels:["🇩🇰 Дания","🇸🇪 Швеция","🇮🇸 Исландия"],genreLabel:"Скандинавский нуар"},
    {id:"sunshine",icon:"sunny",image:"https://lh3.googleusercontent.com/aida-public/AB6AXuDrchiN_U_2-RYz8LNAhfdl8PocnPg_AjAymq1xiMmFdw7OS9sOwXcKofrxN9nc0odb92QPkDdymRpRFTSMEhnMufyhg2yyE9RcDSX29nC6jnO00Bk2sdHP5dbu9XmVCsloCqMr_ekwGofGsyIpGb8xvgR4cVs1TOnED2l7cDWgnzqZDzSqhIhV8Svz6gqGW-N119QLBw8G45puxtmpk9XGEaHIN3k9mPScBtCZuaSk",title:"«Солнечный побег / Дофамин»",tag:"#Солнце #Энергия",description:"Искренний юмор, тёплое побережье, жизнеутверждающая драма без фальши.",countries:["MX","BR","AR","ES","IN"],genres:[35,12,10751],labels:["🇲🇽 Мексика","🇧🇷 Бразилия","🇦🇷 Аргентина"],genreLabel:"Комедия · Драма"},
    {id:"slow-evening",icon:"hotel_class",image:"https://lh3.googleusercontent.com/aida-public/AB6AXuA47IVxYOAVywP8vdWB_iRnjp1o_DvOcaeqQqGsnYL5X3rWNyCl-Z0WgLjGTKGdnq8sib5UfG_7hI18hyBFi28I63jZq5_0gC7IKfbvsq9y37e6QRjr-OSfR91-oF5ee_91BaNDub6Nj0na4xp3_0Upq5H9cAHpX_y4I_chH_Y8gUjIH1JEXROyeyji7krsyXIKe1KZshhfJWywiGDAB4MYMEoNLaFRKu5cnOLDAtL9",title:"«Тихий вечер»",tag:"#Уединение #Тепло",description:"Неспешные истории о близких людях, тихих переменах и маленьких радостях жизни.",countries:["JP","FR","GB","IT"],genres:[18,10749],labels:["🇯🇵 Япония","🇫🇷 Франция","🇮🇹 Италия"],genreLabel:"Драма · Романтика"},
    {id:"mystery",icon:"hotel_class",image:"https://lh3.googleusercontent.com/aida-public/AB6AXuD0er0jYtdzGz61j8Um3CFE-q_pdWehAddrFc5NX-3iUjtjqJxrQ8z-vCwpB8niJYSCgdDJvuqB1aiz7mPsF1HgBRcvWePuh-SsNO-gQDABd83z5czpnUcN1_UqLen3y_6K9hhFV-ywQXo3GUZJyUuC17HhOHrFkI7_lMb47EOHjq12EN1yaPiPhn7Cp6bLSKa5ayxdblXetBdmisGeCuX7ZBv4ylGYgWhnAKbvMEB1",title:"«Тайна до финальных титров»",tag:"#Загадка #Интрига",description:"Улики, подозреваемые и загадка, которую захочется разгадать раньше героев.",countries:["GB","US","KR","FR"],genres:[9648,53,80],labels:["🇬🇧 Великобритания","🇰🇷 Южная Корея","🇺🇸 США"],genreLabel:"Детектив · Триллер"},
    {id:"fantasy",icon:"auto_awesome",image:"https://lh3.googleusercontent.com/aida-public/AB6AXuDEhUTpXNYyH9V1RZhKQKF9_FgK9l2fDx-n3cAwoEnXU9TewodM61SVvL8vvjWCudTcPnY1RGEjtbUi_L5RDxWbcp7_dMLSSm4eq3Vlq5ZMaqNqdVB5qhUZJLYztkLn0iIj-3vQcQ5IUTX6OlJ2s16X6EFXLbsrinadSDBr8pL-FdqEqT__tUYK0oyjGLMfSXo9n4o1dkyHwZe1zukuRRfrHvhVP-8apgPQXTgybo5Q",title:"«В другой мир»",tag:"#Приключение #Магия",description:"Путешествие в необычные миры, где за горизонтом начинаются настоящие приключения.",countries:["NZ","GB","US","JP"],genres:[12,14,10751],labels:["🇳🇿 Новая Зеландия","🇬🇧 Великобритания","🇯🇵 Япония"],genreLabel:"Фэнтези · Приключения"},
    {id:"laughs",icon:"sentiment_satisfied",image:"https://lh3.googleusercontent.com/aida-public/AB6AXuDOVdK3UFCUn-xY7cFngnjIz0nPGELS0cUgRfO7am3EsHL_YhySn3Dme4dJseK-vuejRUKC-J9TF-2mSDvVTblvZZb1afcxRDlw7b1yBOmhd2fvR8uUxTtfJIZw-2KvFDJiIzqg5V7q5OcUrTFbYJVICLjOUyZqPbaNAQ-nshva5VBkPBgGJkL1VWN5zsRpGNT2JtG0d4YH7L3GfSMzcmMlNC7HCKwTo44y0h20myl6",title:"«Вечер без забот»",tag:"#Комедия #Лёгкость",description:"Остроумные диалоги и комичные ситуации, чтобы просто расслабиться и посмеяться.",countries:["FR","IT","US","GB"],genres:[35],labels:["🇫🇷 Франция","🇮🇹 Италия","🇺🇸 США"],genreLabel:"Комедия"},
    {id:"animation",icon:"palette",image:"https://lh3.googleusercontent.com/aida-public/AB6AXuA7XeKmR4NcdscQ5cY6uHSLGrqpmKK4puQns6A475PweY7SRLBMbpUc-ttlveea6uepgUzA7qfzwyY2ctZVVnM-ksU8ZuVCzILvdRkUg_Dpe1cHo7JuvlHCKS7fehVmYe_FpElITk9FvPJ7w8HGQsp-CLNqrmMoMotkiaHGLd2z0ow80TTqsEaOGKHu0yQVKMnoeRVQNFc-3bDS1OqyBQa0B-YMSjmgtf_10V8BEMuo",title:"«Красивые миры анимации»",tag:"#Анимация #Вдохновение",description:"Визуально яркие истории для любого возраста — от волшебных приключений до трогательных драм.",countries:["JP","US","FR","GB"],genres:[16,14,10751],labels:["🇯🇵 Япония","🇺🇸 США","🇫🇷 Франция"],genreLabel:"Анимация · Фэнтези"}
  ];
  const runtimes=[
    {id:"any",label:"Любой хронометраж",button:"любая длительность",icon:"all_inclusive",test:()=>true},
    {id:"classic",label:"90–120 минут",button:"90–120 мин",icon:"schedule",test:m=>m>=90&&m<=120},
    {id:"epic",label:"150+ минут",button:"150+ мин",icon:"movie",test:m=>m>=150},
    {id:"short",label:"До 90 минут",button:"до 90 мин",icon:"bolt",test:m=>m>0&&m<90}
  ];
  const esc=s=>String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const poster=(path,size="w185")=>path?`https://image.tmdb.org/t/p/${size}${path}`:"";
  const state={mood:"wine",runtime:"any",films:[],shown:4,loading:false,loadedKey:"",token:0,spinToken:0,spinFrame:0,spinning:false,skipSpin:false,page:0,totalPages:0};
  const reelStep=90,reelPadding=8,reelCellWidth=80;
  const prefersReducedMotion=()=>window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches||false;
  let boundRoot=null;
  const currentMood=()=>moods.find(m=>m.id===state.mood)||moods[0];
  const currentRuntime=()=>runtimes.find(r=>r.id===state.runtime)||runtimes[0];
  const activeCard=root=>root.querySelector(`.mood-card[data-mood-card="${state.mood}"]`);
  const activeElement=(root,selector)=>activeCard(root)?.querySelector(selector)||null;
  function filtered(){return state.films.filter(f=>currentRuntime().test(f.runtime||0));}
  function scrollToMoodResult(panel,moodId=state.mood){
    requestAnimationFrame(()=>{
      if(!panel.isConnected||moodId!==state.mood)return;
      const card=panel.closest(".mood-card")||panel;
      const top=window.scrollY+card.getBoundingClientRect().top-96;
      window.scrollTo({top:Math.max(0,top),behavior:"smooth"});
    });
  }
  function updateLaunchLabel(root){
    const launch=activeElement(root,"[data-mood-launch-label]");
    if(launch&&!state.spinning)launch.textContent=`Крутить этот вайб (${currentRuntime().button})`;
  }
  function renderFilms(root,deps){
    const box=activeElement(root,"[data-mood-films]");if(!box)return;
    const films=filtered();
    if(state.loading){box.replaceChildren();return;}
    if(!films.length){
      box.innerHTML='<p class="font-body-sm text-body-sm text-text-muted p-3 rounded-xl bg-surface-panel">Нет фильмов для выбранного настроения и хронометража. Выберите другой интервал или настроение.</p>';
      const emptyMore=activeElement(root,"[data-mood-more]");if(emptyMore)emptyMore.hidden=state.page>=state.totalPages;
      return;
    }
    box.innerHTML=films.slice(0,state.shown).map(f=>{
      const target=`mood-film-detail-${f.id}`,detail=f.detail||{},year=(f.release_date||"").slice(0,4);
      return `<article class="flex flex-col gap-2 p-3 rounded-xl bg-surface-panel shadow-md"><button type="button" class="flex items-center gap-3 text-left" data-mood-film="${f.id}" data-detail-target="${target}">
<span class="relative w-16 h-24 shrink-0 rounded-lg overflow-hidden bg-surface-container-lowest">${f.poster_path?`<img class="w-full h-full object-cover" loading="lazy" alt="Постер «${esc(f.title||f.original_title)}»" src="${poster(f.poster_path)}">`:'<span class="material-symbols-outlined w-full h-full flex items-center justify-center text-primary-container">movie</span>'}<span class="absolute bottom-1 left-1 px-1 rounded bg-canvas-obsidian/85 text-primary font-micro-caption text-micro-caption font-bold">★ ${Number(f.vote_average||0).toFixed(1)}</span></span>
<span class="min-w-0 flex-1"><span class="block font-micro-caption text-micro-caption text-text-muted">${year}${detail.runtime?` · ${detail.runtime} мин`:""}</span><span class="block font-headline-sm text-headline-sm text-on-surface font-semibold">${esc(f.title||f.original_title||"Фильм")}</span><span class="block font-body-sm text-body-sm text-text-muted line-clamp-2 mt-1">${esc(detail.overview||f.overview||"Описание пока недоступно.")}</span><span class="block font-micro-caption text-micro-caption text-primary-container mt-1">Трейлер и подробности</span></span></button><div id="${target}"></div></article>`;
    }).join("");
    const more=activeElement(root,"[data-mood-more]");
    if(more){
      more.hidden=films.length<=state.shown&&state.page>=state.totalPages;
      more.textContent=films.length>state.shown?"Показать ещё фильмы":state.page<state.totalPages?"Загрузить ещё фильмы":"Больше фильмов нет";
    }
    if(deps?.refreshFilm)deps.refreshFilm();
  }
  function render(root,deps){
    if(boundRoot===root)stopSpin(root);
    root.innerHTML=`
<div class="flex flex-col w-full pb-8">
<div class="flex items-center justify-between pt-2 pb-1"><button type="button" data-mood-back class="flex items-center gap-1.5 text-on-surface-variant hover:text-primary"><span class="material-symbols-outlined text-[20px]">arrow_back</span><span class="font-label-sm text-label-sm">Подборки</span></button><span class="font-micro-caption text-micro-caption text-primary/80 uppercase tracking-widest">Mood &amp; Vibe</span></div>
<div class="relative w-full rounded-2xl overflow-hidden bg-surface-container-low p-3.5 shadow-xl mb-2">
<div class="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-cinema-amber-glow blur-3xl pointer-events-none"></div><div class="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-cinema-velvet-glow blur-2xl pointer-events-none"></div>
<div class="relative z-10 flex flex-col gap-1.5"><div class="flex items-center gap-1.5 self-start px-2 py-0.5 rounded-full bg-primary-container/15 text-primary-fixed-dim"><span class="material-symbols-outlined text-[14px]">sensors</span><span class="font-micro-caption text-micro-caption tracking-widest uppercase">Эмоциональный навигатор</span></div>
<h1 class="font-headline-lg text-headline-lg text-primary tracking-tight">Кино под твоё настроение</h1><p class="font-body-sm text-body-sm text-text-muted leading-relaxed">Забудьте сухие жанры. Выбирайте атмосферу вечера, а Киноглобус подберёт шедевры мирового кино.</p></div></div>
<section class="flex flex-col mb-4"><div class="flex items-center justify-between mb-1 px-1"><div class="flex items-center gap-1.5 text-primary-fixed-dim"><span class="material-symbols-outlined text-[18px]">timelapse</span><span class="font-label-md text-label-md tracking-wide">Хронометраж сеанса</span></div></div>
<div class="flex items-center gap-2 overflow-x-auto py-1 -mx-gutter-mobile px-gutter-mobile">${runtimes.map((r,i)=>`<button class="mood-runtime shrink-0 flex items-center gap-2 px-3.5 py-2.5 rounded-full ${i===0?"bg-primary-container text-on-primary shadow-[0_0_18px_rgba(255,184,48,0.28)]":"bg-surface-container text-text-muted"} font-label-sm text-label-sm transition-all active:scale-95" data-runtime="${r.id}" type="button"><span class="material-symbols-outlined text-[16px]">${r.icon}</span><span>${r.label.replace("<","&lt;")}</span></button>`).join("")}</div>
<div class="mt-2 px-3 py-2 rounded-xl bg-surface-container-lowest/80 flex items-start gap-2"><span class="material-symbols-outlined text-primary-container text-[16px] mt-0.5">tips_and_updates</span><p class="font-micro-caption text-micro-caption text-text-muted italic">«Мало времени вечером? Никаких трёхчасовых драм — только кино под ваш ритм»</p></div></section>
<section class="flex flex-col gap-2 mb-6"><div class="flex items-center justify-between px-1"><div class="flex items-center gap-1.5 text-on-surface"><span class="material-symbols-outlined text-secondary text-[20px]">filter_vintage</span><span class="font-headline-sm text-headline-sm tracking-wide">Палитра вайбов</span></div><span class="font-micro-caption text-micro-caption text-text-muted uppercase tracking-wider">${moods.length} настроений</span></div>
<div class="flex flex-col gap-3" id="mood-cards">${moods.map((m,i)=>`<article class="mood-card relative flex flex-col overflow-hidden rounded-2xl ${i===0?"bg-surface-container-high shadow-lg shadow-black/40":"bg-surface-container shadow-md shadow-black/30"} transition-all duration-200" data-mood-card="${m.id}">
<div data-mood-glow class="absolute inset-0 rounded-2xl bg-gradient-to-r from-cinema-amber-glow to-transparent ${i===0?"opacity-20":"opacity-0"} pointer-events-none"></div>
<button type="button" data-mood-select data-mood-id="${m.id}" aria-pressed="${i===0}" class="relative z-10 w-full h-40 overflow-hidden text-left"><img class="absolute inset-0 w-full h-full object-cover" src="${m.image}" alt=""><span class="absolute inset-0 bg-gradient-to-t from-surface-container-high via-surface-container-high/35 to-transparent"></span><span class="absolute top-3 left-3 w-9 h-9 rounded-xl bg-surface-container-lowest/80 backdrop-blur-md flex items-center justify-center text-primary-container border border-surface-border-subtle"><span class="material-symbols-outlined text-[20px]">${m.icon}</span></span><span class="absolute bottom-3 left-4 right-12"><span class="mood-title block font-headline-sm text-headline-sm ${i===0?"text-primary":"text-on-surface"} leading-snug">${m.title}</span><span class="block font-micro-caption text-micro-caption text-text-muted mt-1">${m.tag}</span></span><span class="mood-radio absolute right-3 bottom-3 w-6 h-6 rounded-full ${i===0?"bg-primary-container text-on-primary shadow-md":"bg-surface-container-highest text-transparent"} flex items-center justify-center"><span class="material-symbols-outlined text-[16px]">check</span></span></button>
<p class="relative px-4 font-body-sm text-body-sm text-on-surface-variant mb-3 leading-snug">${m.description}</p>
<div class="relative px-4 flex flex-wrap items-center gap-1.5 pt-1">${m.labels.map(x=>`<span class="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-surface-container-low text-text-muted">${x}</span>`).join("")}<span class="font-micro-caption text-micro-caption px-2 py-1 rounded-full bg-surface-container-low text-on-surface-variant ml-auto">${m.genreLabel}</span></div>
<div data-mood-workbench ${i===0?"":"hidden"} class="relative z-10 mx-4 mt-4 mb-4 flex flex-col gap-3 border-t border-surface-border-subtle pt-3">
<div class="flex justify-end"><button class="flex items-center gap-1 text-on-surface-variant hover:text-primary" data-mood-surprise type="button"><span class="material-symbols-outlined text-[15px]">shuffle</span><span class="font-micro-caption text-micro-caption underline">Другой вайб</span></button></div>
<button class="w-full h-12 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(255,184,48,0.35)] active:scale-[0.98] transition-all" data-mood-spin type="button"><span class="material-symbols-outlined text-[20px]">casino</span><span data-mood-launch-label>Крутить этот вайб</span></button>
<p class="font-body-sm text-body-sm text-feedback-error" data-mood-error role="status" hidden></p><button class="self-start px-3 py-2 rounded-lg bg-surface-container-high text-primary font-label-sm text-label-sm" data-mood-retry type="button" hidden>Повторить загрузку</button>
<div data-mood-result></div><section class="flex flex-col gap-2"><button class="flex items-center justify-between gap-2 text-left" data-mood-films-toggle type="button" aria-expanded="false"><span class="font-label-md text-label-md text-on-surface">Фильмы в этом вайбе</span><span class="material-symbols-outlined text-primary-container" data-mood-films-icon>expand_more</span></button><div data-mood-films-panel hidden><div data-mood-films></div><button class="w-full py-2.5 rounded-xl bg-surface-container-high text-primary font-label-sm text-label-sm" data-mood-more type="button" hidden>Показать ещё фильмы</button></div></section></div></article>`).join("")}</div></section>
<button class="self-start mb-3 flex items-center gap-1 text-on-surface-variant hover:text-primary" id="mood-surprise" type="button"><span class="material-symbols-outlined text-[15px]">shuffle</span><span class="font-micro-caption text-micro-caption underline">Удиви меня</span></button></div>`;
    state.mood="wine";state.runtime="any";state.shown=4;state.films=[];state.loadedKey="";state.page=0;state.totalPages=0;
    updateLaunchLabel(root);
    collapseMoodFilms(root);
    if(boundRoot!==root){
      root.addEventListener("click",e=>handleClick(e,root,deps));
      boundRoot=root;
    }
    loadMood(root,deps);
    renderFilms(root,deps);
  }
  function paintSelection(root){
    root.querySelectorAll(".mood-card").forEach(card=>{
      const active=card.dataset.moodCard===state.mood;
      card.className=`mood-card relative flex flex-col overflow-hidden rounded-2xl ${active?"bg-surface-container-high shadow-lg shadow-black/40":"bg-surface-container shadow-md shadow-black/30"} transition-all duration-200 cursor-pointer`;
      const title=card.querySelector(".mood-title");title.className=`mood-title block font-headline-sm text-headline-sm ${active?"text-primary":"text-on-surface"} leading-snug`;
      const radio=card.querySelector(".mood-radio");radio.className=`mood-radio w-6 h-6 shrink-0 rounded-full ${active?"bg-primary-container text-on-primary shadow-md":"bg-surface-container-highest text-transparent"} flex items-center justify-center`;
      card.querySelector("[data-mood-glow]").classList.toggle("opacity-20",active);
      card.querySelector("[data-mood-glow]").classList.toggle("opacity-0",!active);
      const select=card.querySelector("[data-mood-select]");if(select)select.setAttribute("aria-pressed",String(active));
      const workbench=card.querySelector("[data-mood-workbench]");if(workbench)workbench.hidden=!active;
    });
  }
  function stopSpin(root){
    const wasSpinning=state.spinning;
    state.spinToken++;cancelAnimationFrame(state.spinFrame);state.spinning=false;state.skipSpin=false;
    const button=activeElement(root,"[data-mood-spin]"),label=activeElement(root,"[data-mood-launch-label]"),skip=activeElement(root,"[data-mood-skip]");
    if(button)button.disabled=false;
    if(label)label.textContent="Крутить этот вайб";
    if(skip)skip.hidden=true;
    if(wasSpinning&&typeof window.stopFilmReelSound==="function")window.stopFilmReelSound();
  }
  function collapseMoodFilms(root){
    root.querySelectorAll("[data-mood-films-panel]").forEach(panel=>{panel.hidden=true;});
    root.querySelectorAll("[data-mood-films-toggle]").forEach(button=>{
      button.setAttribute("aria-expanded","false");
      const icon=button.querySelector("[data-mood-films-icon]");
      if(icon)icon.textContent="expand_more";
    });
  }
  function selectMood(id,root,deps){
    if(!moods.some(m=>m.id===id))return;
    collapseMoodFilms(root);
    if(id===state.mood)return;
    stopSpin(root);deps.closeFilm("mood");activeElement(root,"[data-mood-result]")?.replaceChildren();
    state.mood=id;state.films=[];state.shown=4;state.loadedKey="";state.page=0;state.totalPages=0;
    paintSelection(root);loadMood(root,deps);renderFilms(root,deps);updateLaunchLabel(root);
  }
  async function loadMood(root,deps,targetCount=5){
    const token=++state.token,key=state.mood;
    state.loading=true;renderFilms(root,deps);
    const error=activeElement(root,"[data-mood-error]"),retry=activeElement(root,"[data-mood-retry]");if(error){error.hidden=true;error.textContent="";}if(retry)retry.hidden=true;
    if(!deps.hasKey()){state.loading=false;renderFilms(root,deps);if(error){error.textContent="Добавьте ключ TMDB на экране «Глобус», чтобы загружать подборки.";error.hidden=false;}return;}
    try{
      const mood=currentMood();
      const params={with_origin_country:mood.countries.join("|"),with_genres:mood.genres.join("|"),"vote_count.gte":30,"vote_average.gte":5.5,sort_by:"popularity.desc",include_adult:"false"};
      let detailFailures=0,attempted=0;
      while(state.page<Math.min(state.totalPages||3,3)&&filtered().length<targetCount){
        const page=state.page+1;
        const result=await deps.api({...params,page});
        if(token!==state.token||key!==state.mood)return;
        state.totalPages=Math.min(result.total_pages||1,3);
        const candidates=(result.results||[]).filter(f=>f.poster_path&&!state.films.some(item=>item.id===f.id));
        const details=[];
        await mapLimit(candidates,4,async f=>{
          try{details.push([f.id,await deps.details(f.id)]);}catch(_){detailFailures++;details.push([f.id,null]);}
        });
        if(token!==state.token||key!==state.mood)return;
        attempted+=candidates.length;
        const byId=new Map(details);
        state.films.push(...candidates.map(f=>{
        const d=byId.get(f.id)||null;
        const cc=(d&&d.countries||[]).find(c=>mood.countries.includes(c))||(d&&d.countries||[])[0]||mood.countries[0];
        return {...f,_cc:cc,runtime:(d||{}).runtime||0,detail:d};
      }).filter(f=>f.runtime>0));
        state.page=page;
        renderFilms(root,deps);
      }
      state.loadedKey=key;
      if(attempted&&!state.films.length&&detailFailures===attempted){
        throw new Error("Не удалось получить хронометраж из TMDB. Проверьте API-ключ и подключение.");
      }
      renderFilms(root,deps);
    }catch(e){
      if(token!==state.token)return;
      if(error){error.textContent=e.message||"Не удалось загрузить фильмы. Попробуйте ещё раз.";error.hidden=false;}if(retry)retry.hidden=false;
    }finally{
      if(token===state.token){state.loading=false;renderFilms(root,deps);}
    }
  }
  async function mapLimit(items,limit,fn){
    let next=0;
    await Promise.all(Array.from({length:Math.min(limit,items.length)},async()=>{
      while(next<items.length){const index=next++;await fn(items[index],index);}
    }));
  }
  function handleClick(e,root,deps){
    if(e.target.closest("[data-mood-back]")){deps.back();return;}
    if(e.target.closest('[data-act="close-film"]')){deps.closeFilm("mood");return;}
    const select=e.target.closest("[data-mood-select]");
    if(select){selectMood(select.dataset.moodId,root,deps);return;}
    const runtime=e.target.closest("[data-runtime]");
    if(runtime){
      stopSpin(root);
      deps.closeFilm("mood");
      activeElement(root,"[data-mood-result]")?.replaceChildren();
      state.runtime=runtime.dataset.runtime;
      root.querySelectorAll(".mood-runtime").forEach(b=>b.className=`mood-runtime shrink-0 flex items-center gap-2 px-3.5 py-2.5 rounded-full ${b===runtime?"bg-primary-container text-on-primary shadow-[0_0_18px_rgba(255,184,48,0.28)]":"bg-surface-container text-text-muted"} font-label-sm text-label-sm transition-all active:scale-95`);
      state.shown=4;renderFilms(root,deps);if(!filtered().length&&!state.loading&&state.page<state.totalPages)loadMood(root,deps);return;
    }
    if(e.target.closest("#mood-surprise,[data-mood-surprise]")){
      const m=moods[Math.floor(Math.random()*moods.length)];
      selectMood(m.id,root,deps);root.querySelector(`[data-mood-card="${m.id}"]`)?.scrollIntoView({behavior:"smooth",block:"center"});return;
    }
    if(e.target.closest("[data-mood-spin]")){launch(root,deps);return;}
    if(e.target.closest("[data-mood-skip]")){state.skipSpin=true;return;}
    if(e.target.closest("[data-mood-retry]")){loadMood(root,deps);return;}
    const filmToggle=e.target.closest("[data-mood-films-toggle]");
    if(filmToggle){
      const panel=activeElement(root,"[data-mood-films-panel]");
      if(panel){
        panel.hidden=!panel.hidden;
        filmToggle.setAttribute("aria-expanded",String(!panel.hidden));
        const icon=filmToggle.querySelector("[data-mood-films-icon]");
        if(icon)icon.textContent=panel.hidden?"expand_more":"expand_less";
        if(!panel.hidden)panel.scrollIntoView({behavior:"smooth",block:"nearest"});
      }
      return;
    }
    if(e.target.closest("[data-mood-more]")){
      state.shown+=4;
      if(filtered().length<state.shown&&state.page<state.totalPages)loadMood(root,deps,state.shown);
      else renderFilms(root,deps);
      return;
    }
    const film=e.target.closest("[data-mood-film]");
    if(film){
      const item=state.films.find(f=>String(f.id)===film.dataset.moodFilm);
      if(item)deps.openFilm(item,"mood",film.dataset.detailTarget||"mood-roulette-detail");
    }
  }
  function launch(root,deps){
    if(state.spinning)return;
    deps.closeFilm("mood");
    const error=activeElement(root,"[data-mood-error]"),pool=filtered();
    if(error){error.hidden=true;error.textContent="";}
    if(state.loading){if(error){error.textContent="Подборка ещё загружается.";error.hidden=false;}return;}
    if(!pool.length){if(error){error.textContent="В выбранном настроении и хронометраже фильмов не нашлось. Выберите другой хронометраж.";error.hidden=false;}return;}
    const moodId=state.mood,film=pool[Math.floor(Math.random()*pool.length)],winnerDetailId=`mood-roulette-winner-detail-${moodId}`;
    const token=++state.spinToken,winnerIndex=26,others=pool.filter(item=>item.id!==film.id),sequence=[];
    for(let i=0;i<winnerIndex;i++)sequence.push(others.length?others[Math.floor(Math.random()*others.length)]:film);
    sequence.push(film);
    for(let i=0;i<6;i++)sequence.push(others.length?others[Math.floor(Math.random()*others.length)]:film);
    const panel=activeElement(root,"[data-mood-result]");
    state.spinning=true;state.skipSpin=false;
    const launchButton=activeElement(root,"[data-mood-spin]"),launchLabel=activeElement(root,"[data-mood-launch-label]");
    if(launchButton)launchButton.disabled=true;
    if(launchLabel)launchLabel.textContent="Плёнка крутится…";
    if(!panel){state.spinning=false;return;}
    panel.innerHTML=`<div class="relative overflow-hidden rounded-2xl bg-surface-panel p-4 shadow-xl"><div class="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-cinema-amber-glow blur-3xl pointer-events-none"></div><h2 class="relative font-headline-sm text-headline-sm text-primary mb-3">Кинорулетка настроения</h2><div class="relative w-full rounded-xl bg-canvas-obsidian border border-primary-container/30 overflow-hidden shadow-[inset_0_2px_12px_rgba(0,0,0,0.95)] p-1"><div class="kgr-perf"><div>${"<i></i>".repeat(12)}</div><span>Kodak 35mm</span></div><div class="kgr-win select-none"><div class="kgr-track"><div class="kgr-run">${sequence.map(item=>`<div class="kgr-cell">${item.poster_path?`<img alt="${esc(item.title||item.original_title)}" draggable="false" src="${poster(item.poster_path)}">`:`<div class="nop">${esc(item.title||item.original_title)}</div>`}<span class="yr">${(item.release_date||"").slice(0,4)}</span></div>`).join("")}</div></div><div data-mood-reel-frame class="kgr-frame" aria-hidden="true"></div></div><div class="kgr-perf"><div>${"<i></i>".repeat(12)}</div><span>35mm nitrate</span></div></div><div class="flex items-center justify-between px-1"><span data-mood-frame-counter class="font-mono text-micro-caption text-primary-fixed font-semibold tracking-wide">Кадр -- / ${String(pool.length).padStart(2,"0")}</span><button type="button" data-mood-skip class="font-micro-caption text-micro-caption text-text-muted hover:text-primary underline">Пропустить</button></div><div id="${winnerDetailId}"></div></div>`;
    const run=panel.querySelector(".kgr-run"),cells=[...run.children],viewport=panel.querySelector(".kgr-win"),frame=panel.querySelector("[data-mood-reel-frame]"),skip=panel.querySelector("[data-mood-skip]");
    const offsetFor=index=>reelPadding+index*reelStep+reelCellWidth/2-viewport.clientWidth/2;
    const start=offsetFor(0),finish=offsetFor(winnerIndex),total=pool.length;
    const complete=()=>{
      if(token!==state.spinToken||!panel.isConnected)return;
      state.spinning=false;state.skipSpin=false;
      cells.forEach((cell,index)=>{cell.classList.remove("spin");cell.classList.toggle("chosen",index===winnerIndex);});
      run.style.transform=`translateX(${-finish}px)`;
      panel.querySelector("[data-mood-frame-counter]").textContent=`Кадр ${String(pool.indexOf(film)+1).padStart(2,"0")} / ${String(total).padStart(2,"0")}`;
      if(launchButton)launchButton.disabled=false;
      if(launchLabel)launchLabel.textContent=`Крутить ещё раз (${currentRuntime().button})`;
      if(skip)skip.hidden=true;
      frame.classList.remove("hit");void frame.offsetWidth;frame.classList.add("hit");
     // panel.querySelector("[data-mood-winner]").innerHTML=`<article class="flex items-center gap-3 p-3 rounded-xl bg-surface-container mt-3"><div class="w-16 h-24 shrink-0 rounded-lg overflow-hidden bg-surface-container-lowest">${film.poster_path?`<img class="w-full h-full object-cover" alt="Постер «${esc(film.title||film.original_title)}»" src="${poster(film.poster_path)}">`:'<span class="material-symbols-outlined w-full h-full flex items-center justify-center text-primary-container">movie</span>'}</div><div class="min-w-0"><span class="font-micro-caption text-micro-caption text-primary-container">Ваша находка · ${film.runtime} мин · ★ ${Number(film.vote_average||0).toFixed(1)}</span><h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold">${esc(film.title||film.original_title||"Фильм")}</h3><p class="font-body-sm text-body-sm text-text-muted line-clamp-3 mt-1">${esc(film.detail?.overview||film.overview||"Описание пока недоступно.")}</p></div></article>`;
      deps.openFilm(film,"mood",winnerDetailId);
      scrollToMoodResult(panel,moodId);
    };
    if(prefersReducedMotion()||!others.length){
      run.style.transform=`translateX(${-finish}px)`;complete();
    }else{
      cells.forEach(cell=>cell.classList.add("spin"));
      run.style.transform=`translateX(${-start}px)`;run.classList.add("fast");
      if(typeof window.startFilmReelSound==="function")window.startFilmReelSound();
      const startTime=performance.now(),duration=4600;
      const step=now=>{
        if(token!==state.spinToken||!panel.isConnected)return;
        const progress=state.skipSpin?1:Math.min(1,(now-startTime)/duration);
        const position=start+(finish-start)*(1-Math.pow(1-progress,4)),remaining=finish-position;
        run.style.transform=`translateX(${-position}px)`;
        if(progress>.4)run.classList.remove("fast");
        if(progress<1&&remaining>=.75){
          if(remaining<200&&typeof window.setFilmReelLevel==="function")window.setFilmReelLevel(remaining/200);
          state.spinFrame=requestAnimationFrame(step);return;
        }
        if(typeof window.stopFilmReelSound==="function")window.stopFilmReelSound();
        complete();
      };
      state.spinFrame=requestAnimationFrame(step);
    }
    scrollToMoodResult(panel,moodId);
  }
  function stop(root){stopSpin(root);}
  window.KGMoodPage={render,stop};
})();
