// Оформление страницы «Оскар» по макету. Подключать ПОСЛЕ oscar-page.js и ДО collections.js.
// oscar-page.js не меняется: этот файл оборачивает KGOscarPage.render и достраивает шапку, героя, пилюли и секции.
(function(){
  const KG=window.KGOscarPage;
  if(!KG||KG.__design)return;
  KG.__design=true;
  const $=id=>document.getElementById(id);
  const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const HERO_IMG="assets/oscar-hero.jpg";

  // 98-я церемония (2026): «One Battle After Another». В списке BEST_PICTURE из oscar-page.js её нет.
  const baseInfo=KG.info;
  KG.info=f=>{
    const r=baseInfo(f);
    if(r&&r.best)return r;
    const y=Number(String(f.release_date||"").slice(0,4))||0;
    const names=[f.original_title,f.title].map(x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g,""));
    if(names.includes("onebattleafteranother")&&Math.abs(y-2025)<=1)return {best:true,n:98,year:2026,film:y};
    return r;
  };

  // ---------- TMDB: поиск фильмов и людей (кэш в localStorage) ----------
  const LS="kgoDesignCache1",reg={};
  let disk={};try{disk=JSON.parse(localStorage.getItem(LS)||"{}");}catch(e){}
  const save=()=>{try{localStorage.setItem(LS,JSON.stringify(disk));}catch(e){}};
  if(!document.getElementById("kgo-design-style")){const st=document.createElement("style");st.id="kgo-design-style";st.textContent='[id^="oscar-kgo-detail-"]:not(:empty){margin-top:.5rem}';document.head.appendChild(st);}
  const hasKey=()=>typeof apiKey!=="undefined"&&!!apiKey;
  async function tmdb(path,params){
    const q=new URLSearchParams({api_key:apiKey,language:"ru-RU",include_adult:"false",...params});
    const r=await fetch("https://api.themoviedb.org/3/"+path+"?"+q);
    if(!r.ok)throw new Error("TMDB "+r.status);
    return r.json();
  }
  async function findFilm(k){
    if(disk["f"+k])return disk["f"+k];
    const [query,year]=F[k];
    let r=((await tmdb("search/movie",{query,primary_release_year:year})).results||[])[0];
    if(!r)r=((await tmdb("search/movie",{query})).results||[])[0];
    if(!r)return null;
    const f={id:r.id,title:r.title,original_title:r.original_title,poster_path:r.poster_path,backdrop_path:r.backdrop_path,release_date:r.release_date,vote_average:r.vote_average,vote_count:r.vote_count,overview:r.overview,genre_ids:r.genre_ids||[],origin_country:r.origin_country||[]};
    disk["f"+k]=f;save();return f;
  }
  async function findPerson(k){
    if(disk["p"+k]!==undefined)return disk["p"+k];
    const r=((await tmdb("search/person",{query:PEOPLE[k]})).results||[]).find(x=>x.profile_path);
    disk["p"+k]=r?r.profile_path:"";save();return disk["p"+k];
  }
  async function hydrate(root){
    if(!hasKey())return;
    await Promise.all([...root.querySelectorAll("[data-kgo-poster]")].map(async el=>{
      const k=el.dataset.kgoPoster;
      try{
        const f=await findFilm(k);
        if(!f||!el.isConnected)return;
        reg[k]=f;
        if(f.poster_path){
          const ph=el.querySelector("[data-kgo-ph]");if(ph)ph.remove();
          el.insertAdjacentHTML("afterbegin",`<img class="absolute inset-0 w-full h-full object-cover" loading="lazy" alt="" src="https://image.tmdb.org/t/p/w342${f.poster_path}">`);
        }
        const r=root.querySelector(`[data-kgo-rate="${k}"]`);
        if(r&&f.vote_average)r.textContent="★ "+Number(f.vote_average).toFixed(1)+" TMDB";
      }catch(e){console.warn("[Kinoglobus] oscar-design:",k,e);}
    }));
    await Promise.all([...root.querySelectorAll("[data-kgo-person]")].map(async el=>{
      try{
        const p=await findPerson(el.dataset.kgoPerson);
        if(p&&el.isConnected){
          const ph=el.querySelector("[data-kgo-ph]");if(ph)ph.remove();
          el.insertAdjacentHTML("afterbegin",`<img class="w-full h-full object-cover" loading="lazy" alt="" src="https://image.tmdb.org/t/p/w185${p}">`);
        }
      }catch(e){}
    }));
  }

  // ---------- данные ----------
  const F={
    parasite:["Parasite",2019],beauty:["La grande bellezza",2013],fanny:["Fanny och Alexander",1982],zone:["The Zone of Interest",2023],
    night:["It Happened One Night",1934],cuckoo:["One Flew Over the Cuckoo's Nest",1975],lambs:["The Silence of the Lambs",1991],
    spirited:["Spirited Away",2001],spider:["Spider-Man: Into the Spider-Verse",2018],pino:["Guillermo del Toro's Pinocchio",2022],heron:["The Boy and the Heron",2023],
    rotk:["The Lord of the Rings: The Return of the King",2003],titanic:["Titanic",1997],benhur:["Ben-Hur",1959]
  };
  const PEOPLE={cuaron:"Alfonso Cuarón",inarritu:"Alejandro G. Iñárritu",nolan:"Christopher Nolan",pta:"Paul Thomas Anderson"};

  // ---------- разметка ----------
  const fl=cc=>typeof flag==="function"?`<span class="kgf">${flag(cc,false)}</span>`:"";
  const slot=(k,cls,extra="")=>`<div data-kgo-poster="${k}" class="${cls} relative overflow-hidden bg-surface-container-highest flex items-center justify-center text-text-muted"><span data-kgo-ph class="material-symbols-outlined">movie</span>${extra}</div>`;
  const yr=(t,pos="bottom-1 left-1")=>`<span class="absolute ${pos} px-1.5 py-0.5 rounded bg-surface-container-lowest/90 font-micro-caption text-micro-caption text-primary font-bold">${t}</span>`;
  const open=(k,t)=>`data-kgo-open="${k}" data-kgo-target="oscar-kgo-detail-${t}"`;
  const box=(t,cls="")=>`<div id="oscar-kgo-detail-${t}" class="${cls}"></div>`;
  const head=(icon,title,sub)=>`<div class="flex items-center gap-2"><span class="material-symbols-outlined text-primary-container text-[20px]" style="font-variation-settings:'FILL' 1;">${icon}</span><div class="min-w-0"><h3 class="font-headline-sm text-headline-sm text-primary">${title}</h3>${sub?`<p class="font-micro-caption text-micro-caption text-text-muted mt-0.5">${sub}</p>`:""}</div></div>`;
  const sec=(id,inner)=>`<section id="kgo-${id}" style="scroll-margin-top:150px" class="px-gutter-mobile mt-space-xl flex flex-col gap-space-md">${inner}</section>`;
  const pill=t=>`<span class="px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container font-micro-caption text-micro-caption font-bold">${t}</span>`;
  const pill2=t=>`<span class="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-micro-caption text-micro-caption font-bold">${t}</span>`;

  function foreignCard0(k,cc,who,title,orig,text,chips,big){
    return `<div ${open(k,k)} class="bg-surface-panel rounded-xl p-3.5 shadow-md flex gap-3 cursor-pointer"><div class="${big?"w-24":"w-20"} shrink-0">${slot(k,"w-full aspect-[2/3] rounded-lg",yr(F[k][1]))}</div><div class="flex flex-col justify-between min-w-0 flex-1"><div><div class="flex items-center gap-1.5">${fl(cc)}<span class="font-micro-caption text-micro-caption text-text-muted truncate">${who}</span></div><h4 class="font-headline-sm text-headline-sm ${big?"text-primary":"text-on-surface"} tracking-tight truncate mt-0.5">${title}</h4><span class="font-micro-caption text-micro-caption text-on-surface-variant italic">${orig}</span><p class="font-body-sm text-body-sm text-text-muted kg-clip2 mt-1">${text}</p></div><div class="flex items-center gap-1.5 mt-2 flex-wrap">${chips}<span data-kgo-rate="${k}" class="font-micro-caption text-micro-caption text-text-muted"></span></div></div></div>`;
  }
  function gridCard(k,cc,who,title,text,badge){
    return `<div class="bg-surface-panel rounded-xl p-3 flex flex-col shadow-sm cursor-pointer" ${open(k,"foreign-grid")}>${slot(k,"w-full aspect-[3/4] rounded-lg mb-2",`<span class="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-surface-container-lowest/90 font-micro-caption text-micro-caption text-primary font-bold">${badge}</span>`)}<div class="flex items-center gap-1">${fl(cc)}<span class="font-micro-caption text-micro-caption text-text-muted truncate">${who}</span></div><h5 class="font-label-md text-label-md text-on-surface font-bold truncate mt-1">${title}</h5><p class="font-micro-caption text-micro-caption text-text-muted kg-clip2 mt-1">${text}</p></div>`;
  }
  const foreignCard=(k,...a)=>`<div>${foreignCard0(k,...a)}${box(k)}</div>`;
  const animRow=(k,...a)=>`<div>${animRow0(k,...a)}${box(k)}</div>`;
  const clubRow=(k,...a)=>`<div>${clubRow0(k,...a)}${box(k)}</div>`;
  const foreign=sec("foreign",
    `<div class="bg-surface-panel rounded-xl p-space-md shadow-md"><div class="flex items-center gap-2 text-primary font-headline-sm text-headline-sm"><span class="text-xl">🌍</span><h3>Лучший иностранный фильм</h3></div><p class="font-micro-caption text-micro-caption text-secondary mt-1 uppercase tracking-widest font-bold">Best International Feature Film</p><p class="font-body-sm text-body-sm text-text-muted mt-2 leading-relaxed">Вручается с 1956 года (до 2020-го называлась «Лучший фильм на иностранном языке»). Главная витрина мирового кино: каждая страна выдвигает по одному фильму.</p><div class="mt-3 bg-surface-container-lowest/80 px-3 py-2 rounded-lg flex items-center gap-2"><span class="material-symbols-outlined text-primary-container text-[16px] shrink-0">public</span><span class="font-micro-caption text-micro-caption text-on-surface">Свежий победитель, 98-я церемония: <strong class="text-primary font-bold">«Сентиментальная ценность»</strong> Йоакима Триера</span></div></div>`+
    `<div class="flex flex-col gap-space-sm">`+
    foreignCard("parasite","KR","Южная Корея • Пон Чжун Хо","Паразиты","Gisaengchung (기생충)","Четыре «Оскара», включая «Лучший фильм». Первый неанглоязычный фильм, победивший в главной номинации.",pill("4 Оскара")+pill2("Золотая пальмовая ветвь"),true)+
    foreignCard("beauty","IT","Италия • Паоло Соррентино","Великая красота","La grande bellezza","Римская сатира Соррентино: победитель 2014 года среди иностранных фильмов.",pill("Оскар")+pill2("BAFTA"),false)+
    `<div class="grid grid-cols-2 gap-space-sm">`+
    gridCard("fanny","SE","И. Бергман","Фанни и Александр","Семейная сага Бергмана: четыре «Оскара», включая «Лучший иностранный фильм».","4 Оскара")+
    gridCard("zone","GB","Дж. Глейзер","Зона интересов","Победитель 2024 года: «Международный фильм» и «Лучший звук».","2 Оскара")+box("foreign-grid","col-span-2")+
    `</div></div>`);

  function big5Card(k,title,who,cer){
    return `<div ${open(k,"big5")} class="bg-surface-panel rounded-xl p-2 flex flex-col shadow-md cursor-pointer">${slot(k,"w-full aspect-[3/4] rounded-lg mb-1.5",yr(F[k][1]).replace("bg-surface-container-lowest/90","bg-cinema-velvet-deep").replace("text-primary","text-secondary-fixed"))}<h5 class="font-label-sm text-label-sm text-on-surface font-bold truncate">${title}</h5><span class="font-micro-caption text-micro-caption text-primary-container font-semibold">5 главных наград</span><span class="font-micro-caption text-micro-caption text-text-muted mt-0.5 truncate">${who}</span><span class="font-micro-caption text-micro-caption text-text-muted truncate">церемония ${cer}</span></div>`;
  }
  const big5=sec("big5",
    `<div class="flex items-center justify-between gap-2">${head("workspace_premium","«Большая пятёрка»","Фильм + режиссёр + актёр + актриса + сценарий. Всего 3 картины в истории")}<span class="px-2.5 py-1 rounded-full bg-secondary-container/50 text-secondary font-label-sm text-label-sm font-bold shrink-0">3 / 3</span></div>`+
    `<div class="grid grid-cols-3 gap-space-xs">${big5Card("night","Это случилось однажды ночью","Ф. Капра",1935)}${big5Card("cuckoo","Гнездо кукушки","М. Форман",1976)}${big5Card("lambs","Молчание ягнят","Дж. Демме",1992)}${box("big5","col-span-3")}</div>`);

  function animRow0(k,badge,studio,title,text){
    return `<div ${open(k,k)} class="bg-surface-panel rounded-xl p-3.5 shadow-md flex items-center justify-between gap-3 cursor-pointer">${slot(k,"w-16 h-20 rounded-lg shrink-0")}<div class="flex flex-col min-w-0 flex-1"><div class="flex items-center gap-1.5">${pill(badge)}<span class="font-micro-caption text-micro-caption text-text-muted truncate">${studio}</span></div><h4 class="font-label-lg text-label-lg text-on-surface font-bold truncate mt-1">${title}</h4><p class="font-micro-caption text-micro-caption text-on-surface-variant kg-clip2">${text}</p></div><span class="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-primary shrink-0"><span class="material-symbols-outlined text-[18px]">play_circle</span></span></div>`;
  }
  const anim=sec("anim",
    head("palette","Полнометражная анимация","Категория появилась в 2001 году, первая церемония была в 2002-м. Избранные победители")+
    `<div class="flex flex-col gap-space-sm">`+
    animRow("spirited","Оскар 2003","Studio Ghibli","Унесённые призраками","Хаяо Миядзаки. Первая неанглоязычная картина, победившая в категории.")+
    animRow("spider","Оскар 2019","Sony Pictures Animation","Человек-паук: Через вселенные","Комикс-эстетика и CGI в одном стиле: визуальная революция.")+
    animRow("pino","Оскар 2023","Netflix","Пиноккио Гильермо дель Торо","Покадровая кукольная анимация и переосмысление классической сказки.")+
    animRow("heron","Оскар 2024","Studio Ghibli","Мальчик и птица","Новый фильм Миядзаки и второй «Оскар» Ghibli в этой категории.")+
    `</div>`);

  function person(k,name,badge,films){
    return `<div class="bg-surface-panel rounded-xl p-2.5 flex flex-col items-center text-center shadow-md w-[108px] shrink-0"><div data-kgo-person="${k}" class="w-14 h-14 rounded-full overflow-hidden bg-surface-container-highest mb-2 flex items-center justify-center text-text-muted"><span data-kgo-ph class="material-symbols-outlined">person</span></div><h5 class="font-label-sm text-label-sm text-on-surface font-bold leading-tight">${name}</h5><span class="font-micro-caption text-micro-caption text-primary mt-1 font-bold">${badge}</span><span class="font-micro-caption text-micro-caption text-text-muted">${films}</span></div>`;
  }
  const dirs=sec("dir",
    head("movie_edit","Режиссёры-триумфаторы","Рекорд по «Оскарам» за режиссуру у Джона Форда: четыре статуэтки")+
    `<div class="flex gap-space-xs overflow-x-auto pb-1">${person("cuaron","А. Куарон","2 Оскара","Гравитация, Рома")}${person("inarritu","А. Иньярриту","2 подряд","Бёрдмэн, Выживший")}${person("nolan","К. Нолан","Оскар 2024","Оппенгеймер")}${person("pta","П. Т. Андерсон","Оскар 2026","One Battle After Another")}</div>`);

  function clubRow0(k,n,title,sub,score,full){
    return `<div ${open(k,k)} class="bg-surface-panel rounded-xl p-3 shadow-md flex items-center justify-between cursor-pointer"><div class="flex items-center gap-3 min-w-0"><div class="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center font-bold font-headline-sm text-primary shrink-0">${n}</div><div class="flex flex-col min-w-0"><h5 class="font-label-md text-label-md text-on-surface font-bold truncate">${title}</h5><span class="font-micro-caption text-micro-caption text-text-muted truncate">${sub}</span></div></div><span class="px-2 py-1 rounded ${full?"bg-secondary-container/50 text-secondary":"bg-surface-container-high text-on-surface-variant"} font-micro-caption text-micro-caption font-bold shrink-0">${score}</span></div>`;
  }
  const club=sec("club",
    head("emoji_events","Клуб 11 Оскаров","Абсолютные рекордсмены по числу побед")+
    `<div class="flex flex-col gap-space-xs">${clubRow("rotk",11,"Властелин колец: Возвращение короля (2003)","11 номинаций, 11 побед","11/11",true)}${clubRow("titanic",11,"Титаник (1997)","Джеймс Кэмерон · рекорд 14 номинаций","11/14",false)}${clubRow("benhur",11,"Бен-Гур (1959)","Уильям Уайлер · исторический пеплум","11/12",false)}</div>`);

  const PILLS=[["Все номинации","stars","kgo-top"],["🌍 Иностранный фильм","","kgo-foreign"],["🏆 Лучший фильм","","kgo-list"],["Большая пятёрка","workspace_premium","kgo-big5"],["🎨 Анимация","","kgo-anim"],["🎬 Режиссёры","","kgo-dir"],["Клуб 11","emoji_events","kgo-club"]];
  const pOn="bg-primary-container text-on-primary-container shadow-[0_0_12px_rgba(255,184,48,0.3)]",pOff="bg-surface-panel text-text-muted hover:text-primary";
  const pillCls=on=>`shrink-0 h-[34px] px-3.5 rounded-full font-label-sm text-label-sm flex items-center gap-1.5 transition-transform active:scale-95 ${on?pOn:pOff}`;

  const HEAD=`<div id="kgo-top" class="sticky z-30 bg-surface/85 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.65)]" style="top:calc(80px + env(safe-area-inset-top,0px))"><div class="h-14 px-gutter-mobile flex items-center justify-between gap-space-sm"><div class="flex items-center gap-space-sm min-w-0 flex-1"><button type="button" data-oscar-back aria-label="Назад" class="w-11 h-11 -ml-1.5 flex items-center justify-center rounded-full text-on-surface hover:text-primary transition-colors"><span class="material-symbols-outlined text-[24px]">arrow_back</span></button><div class="flex flex-col min-w-0"><div class="flex items-center gap-1.5 min-w-0"><span class="material-symbols-outlined text-primary-container text-[20px] shrink-0">military_tech</span><h2 class="font-headline-sm text-headline-sm text-primary tracking-tight truncate">Oscar Winners</h2></div><span class="font-micro-caption text-micro-caption text-text-muted">98 лауреатов • 1929–2026</span></div></div><div class="flex items-center gap-space-xs shrink-0"><button type="button" data-kgo-tune aria-label="Поиск и фильтры" class="w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-high/60 transition-colors"><span class="material-symbols-outlined text-[22px]">tune</span></button><button type="button" data-kgo-avatar aria-label="Профиль" class="w-8 h-8 rounded-full bg-primary flex items-center justify-center ml-0.5"><span class="material-symbols-outlined text-on-primary text-[18px]">person</span></button></div></div></div>
<div class="px-gutter-mobile pt-space-md"><div class="relative rounded-xl overflow-hidden shadow-[0_14px_34px_-20px_rgba(0,0,0,0.65)] bg-surface-container-lowest border border-outline-variant/30" style="aspect-ratio:1376/768"><img alt="Золотая статуэтка «Оскар» на сцене" class="absolute inset-0 w-full h-full object-cover object-center" src="${HERO_IMG}" onerror="this.remove()"><div class="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-surface/60 to-transparent pointer-events-none"></div></div></div>
<div id="kgo-pills" class="w-full overflow-x-auto pb-space-sm px-gutter-mobile mt-space-md flex items-center gap-2">${PILLS.map(([l,ic,t],i)=>`<button type="button" data-kgo-pill="${t}" class="${pillCls(i===0)}">${ic?`<span class="material-symbols-outlined text-[15px]">${ic}</span>`:""}${l}</button>`).join("")}</div>`;

  function decorate(root,deps){
    root._kgoDeps=deps;window.__kgoDeps=deps;
    const wrap=root.firstElementChild;if(!wrap)return;
    const back=wrap.firstElementChild,roulette=back&&back.nextElementSibling;
    if(!back||!roulette)return;
    const title=roulette.querySelector("h1"),sub=title&&title.nextElementSibling;
    if(title)title.textContent="Случайный шедевр вечера";
    if(sub)sub.textContent="Выберите эпоху и запустите рулетку: плёнка выберет случайного лауреата «Оскара».";
    back.remove();wrap.classList.remove("overflow-hidden");
    const tmp=document.createElement("div");
    tmp.innerHTML=HEAD+foreign+big5+anim+dirs+club;
    while(tmp.firstChild)wrap.insertBefore(tmp.firstChild,roulette);
    const list=$("oscar-list");const ls=list&&list.closest("section");if(ls)ls.id="kgo-list";
    if(!root._kgoBound){
      root._kgoBound=true;
      root.addEventListener("click",e=>{
        const el=e.target.closest("[data-kgo-open],[data-oscar-open]");if(!el)return;
        const top=el.getBoundingClientRect().top,t0=performance.now();let stop=false;
        const halt=()=>{stop=true;};
        ["wheel","touchstart","keydown"].forEach(n=>window.addEventListener(n,halt,{once:true,passive:true}));
        const tick=()=>{if(stop||!el.isConnected)return;const d=el.getBoundingClientRect().top-top;if(d)window.scrollBy(0,d);if(performance.now()-t0<1500)requestAnimationFrame(tick);};
        requestAnimationFrame(tick);
      },true);
      root.addEventListener("click",async e=>{
        const d=root._kgoDeps;
        const p=e.target.closest("[data-kgo-pill]");
        if(p){
          root.querySelectorAll("[data-kgo-pill]").forEach(b=>b.className=pillCls(b===p));
          const t=p.dataset.kgoPill==="kgo-top"?null:$(p.dataset.kgoPill);
          if(t)t.scrollIntoView({behavior:"smooth",block:"start"});else window.scrollTo({top:0,behavior:"smooth"});
          return;
        }
        if(e.target.closest("[data-kgo-tune]")){
          const t=$("oscar-toolbar")||$("kgo-list");
          if(t)t.scrollIntoView({behavior:"smooth",block:"center"});return;
        }
        if(e.target.closest("[data-kgo-avatar]")){const m=$("mapBtn");if(m)m.click();return;}
        const w=e.target.closest("[data-kgo-watch]");
        if(w&&d){const f=cardFilm[w.dataset.kgoWatch];if(f){try{await d.markWatched(f);}catch(err){}d.refreshFilm();}return;}
        const sh=e.target.closest("[data-kgo-share]");
        if(sh){
          const url="https://www.themoviedb.org/movie/"+sh.dataset.kgoShare,lab=sh.querySelector("span:last-child"),old=lab.textContent;
          try{if(navigator.share)await navigator.share({title:sh.dataset.title,text:"Смотри в Киноглобусе: "+sh.dataset.title,url});else{await navigator.clipboard.writeText(url);lab.textContent="Ссылка скопирована";setTimeout(()=>{lab.textContent=old;},1800);}}catch(err){}
          return;
        }
        const o=e.target.closest("[data-kgo-open]");
        if(o&&d){
          const k=o.dataset.kgoOpen;
          try{
            const f=reg[k]||(hasKey()?await findFilm(k):null);
            if(f){reg[k]=f;d.openFilm(f,"oscar",o.dataset.kgoTarget);}
          }catch(err){console.warn("[Kinoglobus] oscar-design:",err);}
        }
      });
    }
    hydrate(root);
  }

  // ---------- карточка фильма для страницы «Оскар» (подключается одной строкой в collections.js) ----------
  const cardFilm={},prov={};
  const money=new Intl.NumberFormat("ru-RU",{style:"currency",currency:"USD",maximumFractionDigits:0});
  const plural=(n,a,b,c)=>{const m=n%100,k=n%10;return k===1&&m!==11?a:(k>1&&k<5&&(m<12||m>14))?b:c;};
  const isBP=a=>/(best picture|лучший фильм)\s*$/i.test(String(a.label).trim());
  function providers(f){
    if(prov[f.id]!==undefined)return prov[f.id];
    prov[f.id]=null;
    fetch(`https://api.themoviedb.org/3/movie/${f.id}/watch/providers?api_key=${apiKey}`).then(r=>r.json()).then(j=>{
      const all=j.results||{};let reg=((navigator.language||"en-US").split("-")[1]||"US").toUpperCase();
      let x=all[reg];
      if(!x||!(x.flatrate||x.rent||x.buy||x.free)){x=all.US;reg="US";}
      const rows=[],ids=new Set();
      [["flatrate","Подписка"],["free","Бесплатно"],["rent","Аренда"],["buy","Покупка"]].forEach(([k,l])=>((x&&x[k])||[]).forEach(p=>{if(ids.has(p.provider_id))return;ids.add(p.provider_id);rows.push({n:p.provider_name,l:p.logo_path,t:l});}));
      prov[f.id]={reg,rows:rows.slice(0,6)};
    }).catch(()=>{prov[f.id]={reg:"",rows:[]};}).finally(()=>{const d=window.__kgoDeps;if(d&&d.refreshFilm)d.refreshFilm();});
    return null;
  }
  window.KGOscarCard=function(f){
    const deps=window.__kgoDeps||{};
    cardFilm[f.id]=f;
    const info=KG.info(f)||{},aw=f._oscarAwards;
    const wins=aw?aw.filter(a=>a.won):[],noms=aw?aw.filter(a=>!a.won):[];
    const year=String(f.release_date||"").slice(0,4),title=esc(f.title||"Фильм");
    const bg=f.backdrop_path||f.poster_path;
    let booked=false;try{booked=(store.get("kgBookmarks",[])||[]).includes(f.id);}catch(e){}
    const watched=deps.isWatched?deps.isWatched(f.id):false;
    const rate=Number(f.average||f.vote_average)||0;
    const countries=(f.countries||[]).map(c=>cname(c)).filter(Boolean).slice(0,2).join(", ");
    const meta=[countries,year,f.runtime?f.runtime+" мин":""].filter(Boolean).join(" • ");
    const badge=(cls,t)=>`<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${cls} font-label-sm text-label-sm shadow-md">${t}</span>`;
    const tag=f.tagline&&f.taglineLang===f.overviewLang?`<p class="font-body-sm text-body-sm text-primary italic opacity-90">«${esc(f.tagline)}»</p>`:"";
    // трейлер
    const v=f._trailer;
    const thumb=v&&v.site==="YouTube"?`https://i.ytimg.com/vi/${encodeURIComponent(v.key)}/hqdefault.jpg`:(bg?`https://image.tmdb.org/t/p/w780${bg}`:"");
    const trailer=f._trailerPlaying&&v
      ?`<iframe src="${embedSrc(v,true)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin" title="Трейлер ${title}" style="position:absolute;inset:0;width:100%;height:100%;border:0"></iframe>`
      :v?`<button type="button" data-trailer-action="play" data-id="${f.id}" aria-label="Воспроизвести трейлер" class="absolute inset-0 flex items-center justify-center bg-surface-container-lowest">${thumb?`<img src="${thumb}" alt="" class="absolute inset-0 w-full h-full object-cover opacity-80" onerror="this.remove()">`:""}<span class="relative w-14 h-14 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shadow-[0_0_24px_rgba(255,184,48,0.5)]"><span class="material-symbols-outlined text-[32px] ml-1" style="font-variation-settings:'FILL' 1;">play_arrow</span></span></button>`
      :`<div class="absolute inset-0 flex items-center justify-center text-text-muted font-body-sm text-body-sm">${f._trailerStatus==="missing"?"Трейлер не найден":"Ищем трейлер…"}</div>`;
    // награды
    const winList=aw?wins.filter(a=>!(info.best&&isBP(a))):[];
    const winRow=a=>`<div class="flex items-center gap-3 p-2 rounded-lg bg-surface-container/60"><span class="material-symbols-outlined text-primary text-[20px]" style="font-variation-settings:'FILL' 1;">emoji_events</span><div class="flex flex-col min-w-0"><span class="font-label-sm text-label-sm text-on-surface font-semibold">${esc(a.label)}</span>${a.year?`<span class="font-micro-caption text-micro-caption text-text-muted">${a.year}</span>`:""}</div></div>`;
    const awardsBody=aw===undefined?'<p class="font-micro-caption text-micro-caption text-text-muted">Загружаем награды из Wikidata…</p>'
      :(winList.length?`<div class="grid grid-cols-1 gap-space-xs">${winList.map(winRow).join("")}</div>`:(!info.best?'<p class="font-micro-caption text-micro-caption text-text-muted">Подробности наград в Wikidata не найдены.</p>':""));
    const nomBody=noms.length?`<details class="rounded-lg bg-surface-container-lowest/60 px-3 py-2"><summary class="font-label-sm text-label-sm text-text-muted cursor-pointer">Номинации (${noms.length})</summary><div class="flex flex-col gap-1 pt-2">${noms.map(a=>`<span class="font-micro-caption text-micro-caption text-text-muted">• ${esc(a.label)}${a.year?" · "+a.year:""}</span>`).join("")}</div></details>`:"";
    const winsBadge=wins.length?`<span class="px-2 py-0.5 rounded-full bg-primary-container/20 text-primary-container font-label-sm text-label-sm font-bold shrink-0">${wins.length} ${plural(wins.length,"победа","победы","побед")}</span>`:"";
    const ribbon=info.best?`${info.n}-я церемония вручения`:"Лауреат премии «Оскар»";
    const ribbonSub=info.best?`Церемония ${info.year} года • фильм ${info.film||year} года`:(year?`Фильм ${year} года`:"");
    const bestBlock=info.best?`<div class="rounded-lg bg-surface-container-lowest/80 p-space-sm flex items-start gap-3"><div class="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0 shadow-md"><span class="material-symbols-outlined text-on-primary-container text-[22px]">trophy</span></div><div class="flex flex-col min-w-0"><span class="font-label-md text-label-md text-primary font-bold">Лучший фильм года</span><p class="font-body-sm text-body-sm text-text-muted mt-0.5">Главная награда Американской киноакадемии.</p></div></div>`:"";
    const oscar=`<div class="relative overflow-hidden rounded-xl bg-gradient-to-br from-cinema-velvet-deep via-surface-panel to-surface-container-high p-space-md shadow-xl"><div class="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-primary-container/15 blur-2xl pointer-events-none"></div><div class="relative z-10 flex flex-col gap-space-md"><div class="flex items-center justify-between gap-2"><div class="flex items-center gap-2 min-w-0"><span class="material-symbols-outlined text-primary-container text-[26px] shrink-0" style="font-variation-settings:'FILL' 1;">workspace_premium</span><div class="min-w-0"><span class="font-label-sm text-label-sm text-primary tracking-wider uppercase font-bold block">${ribbon}</span><span class="font-micro-caption text-micro-caption text-text-muted">${ribbonSub}</span></div></div>${winsBadge}</div>${bestBlock}${awardsBody}${nomBody}</div></div>`;
    // кнопки
    const watchBtn=`<button type="button" data-kgo-watch="${f.id}" class="w-full py-3.5 px-space-md rounded-xl ${watched?"bg-cinema-velvet-deep text-secondary-fixed":"bg-primary-container text-on-primary-container shadow-[0_4px_24px_rgba(255,184,48,0.25)]"} font-label-lg text-label-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all"><span class="material-symbols-outlined text-[22px]">${watched?"verified":"check_circle"}</span><span>${watched?"В вашем Зале славы ✓":"Отметить как просмотренный"}</span></button>`;
    const shareBtn=`<button type="button" data-kgo-share="${f.id}" data-title="${title}" class="w-full py-2.5 px-space-sm rounded-lg bg-surface-panel text-on-surface hover:text-primary font-label-sm text-label-sm flex items-center justify-center gap-1.5 transition-colors"><span class="material-symbols-outlined text-[18px]">share</span><span>Поделиться</span></button>`;
    // люди
    const dirs=(f.dirs||[]).length?`<div class="p-2.5 rounded-xl bg-surface-container-high flex flex-col"><span class="font-micro-caption text-micro-caption text-text-muted">${f.dirs.length>1?"Режиссёры":"Режиссёр"}</span><span class="font-label-md text-label-md text-primary mt-0.5">${esc(f.dirs.join(", "))}</span></div>`:"";
    const cast=(f.castFull||[]).map(c=>`<div class="flex flex-col items-center text-center w-24 shrink-0 gap-1.5"><div class="w-16 h-16 rounded-full overflow-hidden bg-surface-container shadow-md flex items-center justify-center">${c.photo?`<img class="w-full h-full object-cover" loading="lazy" alt="" src="https://image.tmdb.org/t/p/w185${c.photo}">`:'<span class="material-symbols-outlined text-text-muted">person</span>'}</div><span class="font-label-sm text-label-sm text-on-surface font-semibold line-clamp-1 w-full">${esc(c.name)}</span><span class="font-micro-caption text-micro-caption text-text-muted line-clamp-1 w-full">${esc(c.role)}</span></div>`).join("");
    const people=dirs||cast?`<div class="flex flex-col gap-space-sm"><h3 class="font-headline-sm text-headline-sm text-on-surface">Создатели и актёры</h3>${dirs}${cast?`<div class="flex gap-space-sm overflow-x-auto pb-1" style="-webkit-overflow-scrolling:touch">${cast}</div>`:""}</div>`:"";
    // где смотреть
    const pv=providers(f);
    const where=`<div class="flex flex-col gap-space-sm rounded-xl bg-surface-panel p-space-md"><div class="flex items-center justify-between"><div class="flex items-center gap-2"><span class="material-symbols-outlined text-primary text-[20px]">live_tv</span><h3 class="font-headline-sm text-headline-sm text-on-surface">Где смотреть онлайн</h3></div>${pv&&pv.reg?`<span class="font-micro-caption text-micro-caption text-text-muted">${pv.reg} · JustWatch</span>`:""}</div>${pv===null?'<span class="font-micro-caption text-micro-caption text-text-muted">Загружаем…</span>':pv.rows.length?`<div class="grid grid-cols-2 gap-space-xs">${pv.rows.map(r=>`<div class="flex items-center gap-2.5 p-2.5 rounded-lg bg-surface-container-high">${r.l?`<img class="w-7 h-7 rounded shadow-sm" alt="" src="https://image.tmdb.org/t/p/w92${r.l}">`:'<span class="w-7 h-7 rounded bg-surface-container"></span>'}<div class="flex flex-col min-w-0"><span class="font-label-sm text-label-sm text-on-surface font-semibold truncate">${esc(r.n)}</span><span class="font-micro-caption text-micro-caption text-primary">${r.t}</span></div></div>`).join("")}</div>`:'<span class="font-micro-caption text-micro-caption text-text-muted">Нет данных для вашего региона.</span>'}</div>`;
    // факты
    const when=f.release?new Date(f.release+"T00:00:00").toLocaleDateString("ru-RU",{day:"numeric",month:"long",year:"numeric"}):"";
    const fact=(l,v2)=>v2?`<div class="p-3 rounded-xl bg-surface-container flex flex-col gap-0.5"><span class="font-micro-caption text-micro-caption uppercase text-text-muted">${l}</span><span class="font-label-md text-label-md text-on-surface">${esc(v2)}</span></div>`:"";
    const facts=[fact("Выход",when),fact("Бюджет",f.budget>0?money.format(f.budget):""),fact("Сборы",f.revenue>0?money.format(f.revenue):""),fact("Страны",(f.countries||[]).map(c=>cname(c)).join(", "))].join("");
    return `<section data-selected-film="${f.id}" class="flex flex-col gap-space-md rounded-2xl overflow-hidden bg-surface border border-primary-container/20 shadow-xl pb-space-md scroll-mt-20">
<div class="relative w-full aspect-[16/11] bg-surface-container-lowest">${bg?`<div class="absolute inset-0 bg-cover bg-center" style="background-image:url('https://image.tmdb.org/t/p/w780${bg}')"></div>`:""}<div class="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent"></div>
<button type="button" data-act="close-film" aria-label="Свернуть карточку" class="absolute top-3 right-3 w-9 h-9 rounded-full bg-surface-panel/90 backdrop-blur-md text-text-muted hover:text-primary flex items-center justify-center z-10"><span class="material-symbols-outlined">close</span></button>
<div class="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-space-sm z-10"><div class="flex flex-col gap-1 min-w-0"><div class="flex items-center gap-1.5 flex-wrap">${wins.length?badge("bg-primary-container text-on-primary-container",`<span class="material-symbols-outlined text-[15px]" style="font-variation-settings:'FILL' 1;">military_tech</span>${wins.length} ${plural(wins.length,"ОСКАР","ОСКАРА","ОСКАРОВ")}`):""}${rate?badge("bg-surface-panel/90 backdrop-blur-md text-primary",`<span class="material-symbols-outlined text-[14px]" style="font-variation-settings:'FILL' 1;">star</span>${rate.toFixed(1)} TMDB`):""}${f.cert?badge("bg-secondary-container text-on-secondary-container",esc(f.cert)):""}</div>${meta?`<p class="font-micro-caption text-micro-caption text-on-surface-variant uppercase tracking-widest pt-1">${esc(meta)}</p>`:""}</div>
<button type="button" data-act="bm" data-id="${f.id}" aria-label="${booked?"Убрать из закладок":"Сохранить в закладки"}" class="w-11 h-11 rounded-full bg-surface-panel/90 backdrop-blur-md text-on-surface flex items-center justify-center shrink-0 shadow-lg active:scale-95 transition-transform"><span class="material-symbols-outlined text-[22px]" style="font-variation-settings:'FILL' ${booked?1:0};">${booked?"bookmark_added":"bookmark_add"}</span></button></div></div>
<div class="px-margin-mobile flex flex-col gap-space-md">
<div class="flex flex-col gap-1"><div class="flex items-baseline justify-between gap-2"><h3 class="font-display-hero-mobile text-display-hero-mobile text-on-surface font-bold tracking-tight">${title}</h3>${f.originalTitle&&f.originalTitle!==f.title?`<span class="font-body-sm text-body-sm text-text-muted text-right">${esc(f.originalTitle)}</span>`:""}</div>${tag}</div>
${oscar}
<div class="flex flex-col gap-space-xs">${watchBtn}${shareBtn}</div>
<div class="flex flex-col gap-space-xs"><div class="flex items-center gap-2"><span class="material-symbols-outlined text-primary text-[20px]">smart_display</span><h3 class="font-headline-sm text-headline-sm text-on-surface">Официальный трейлер</h3></div><div id="cl-inline-trailer" class="relative w-full kg-detail-trailer rounded-xl overflow-hidden bg-black shadow-md">${trailer}</div>${v?`<a href="${watchUrl(v)}" target="_blank" rel="noopener noreferrer" class="font-micro-caption text-micro-caption text-primary underline">Не воспроизводится? Открыть на ${esc(v.site)}</a>`:""}</div>
<div class="flex flex-col gap-2 rounded-xl bg-surface-panel p-space-md shadow-sm"><h3 class="font-headline-sm text-headline-sm text-primary">Сюжет картины</h3><p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">${esc(f.overview||"Загружаем описание…")}</p></div>
${people}${where}${facts?`<div class="grid grid-cols-2 gap-2.5">${facts}</div>`:""}
</div></section>`;
  };

  const baseRender=KG.render;
  KG.render=function(root,deps){
    baseRender.call(this,root,deps);
    decorate(root,deps);
  };
})();
