// Оформление страницы «Оскар» по макету. Подключать ПОСЛЕ oscar-page.js и ДО collections.js.
// oscar-page.js не меняется: этот файл оборачивает KGOscarPage.render и достраивает шапку, героя, пилюли и секции.
(function(){
  const KG=window.KGOscarPage;
  if(!KG||KG.__design)return;
  KG.__design=true;
  const $=id=>document.getElementById(id);
  const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

  // ---------- TMDB: поиск фильмов и людей (кэш в localStorage) ----------
  const LS="kgoDesignCache3",reg={};
  let disk={};try{disk=JSON.parse(localStorage.getItem(LS)||"{}");}catch(e){}
  const save=()=>{try{localStorage.setItem(LS,JSON.stringify(disk));}catch(e){}};
  if(!document.getElementById("kgo-design-style")){const st=document.createElement("style");st.id="kgo-design-style";st.textContent='[id^="oscar-kgo-detail-"]:not(:empty){margin-top:.5rem}';document.head.appendChild(st);}
  const hasKey=()=>typeof apiKey!=="undefined"&&!!apiKey;
  async function tmdb(path,params){
    const q=new URLSearchParams({api_key:apiKey,language:"ru-RU",include_adult:"false",...params});
    const r=await movieCatalog.request("https://api.themoviedb.org/3/"+path+"?"+q);
    if(!r.ok)throw new Error("TMDB "+r.status);
    return r.json();
  }
  async function findFilm(k){
    if(disk["f"+k])return disk["f"+k];
    const [query,year]=F[k];
    let r=((await tmdb("search/movie",{query,primary_release_year:year})).results||[])[0];
    if(!r)r=((await tmdb("search/movie",{query})).results||[])[0];
    if(!r)return null;
    const f={id:r.id,adult:r.adult,title:r.title,original_title:r.original_title,poster_path:r.poster_path,backdrop_path:r.backdrop_path,release_date:r.release_date,vote_average:r.vote_average,vote_count:r.vote_count,overview:r.overview,genre_ids:r.genre_ids||[],origin_country:r.origin_country||[]};
    disk["f"+k]=f;save();return f;
  }
  async function findPerson(k){
    if(disk["p"+k]!==undefined)return disk["p"+k];
    const r=((await tmdb("search/person",{query:PEOPLE[k]})).results||[])[0];
    disk["p"+k]=r?{id:r.id,profile_path:r.profile_path||"",name:r.name||PEOPLE[k]}:null;save();return disk["p"+k];
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
      }catch(e){console.warn("[Moven] oscar-design:",k,e);}
    }));
    await Promise.all([...root.querySelectorAll("[data-kgo-person]")].map(async el=>{
      try{
        const p=await findPerson(el.dataset.kgoPerson);
        if(p&&el.isConnected){
          const card=el.closest("[data-kgo-person-card]");if(card){card.dataset.kgPersonId=p.id;card.dataset.kgPersonName=p.name;card.dataset.kgPersonRole="Режиссёр";}
          const ph=el.querySelector("[data-kgo-ph]");if(ph)ph.remove();
          if(p.profile_path)el.insertAdjacentHTML("afterbegin",`<img class="w-full h-full object-cover" loading="lazy" alt="" src="https://image.tmdb.org/t/p/w185${p.profile_path}">`);
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
  // Category winners; awardYear is the ceremony year, not the release year.
  const FOREIGN_WINNERS = [
    ["mother", "All About My Mother", "Todo sobre mi madre", 1999, 2000, "ES", "Педро Альмодовар", "Всё о моей матери"],
    ["tiger", "Crouching Tiger, Hidden Dragon", "臥虎藏龍", 2000, 2001, "TW", "Энг Ли", "Крадущийся тигр, затаившийся дракон"],
    ["nomans", "No Man's Land", "Ničija zemlja", 2001, 2002, "BA", "Данис Танович", "Ничья земля"],
    ["africa", "Nowhere in Africa", "Nirgendwo in Afrika", 2001, 2003, "DE", "Каролина Линк", "Нигде в Африке"],
    ["barbarians", "The Barbarian Invasions", "Les Invasions barbares", 2003, 2004, "CA", "Дени Аркан", "Нашествия варваров"],
    ["sea", "The Sea Inside", "Mar adentro", 2004, 2005, "ES", "Алехандро Аменабар", "Море внутри"],
    ["tsotsi", "Tsotsi", "Tsotsi", 2005, 2006, "ZA", "Гэвин Худ", "Цоци"],
    ["lives", "The Lives of Others", "Das Leben der Anderen", 2006, 2007, "DE", "Флориан Хенкель фон Доннерсмарк", "Жизнь других"],
    ["counterfeiters", "The Counterfeiters", "Die Fälscher", 2007, 2008, "AT", "Штефан Рузовицки", "Фальшивомонетчики"],
    ["departures", "Departures", "おくりびと", 2008, 2009, "JP", "Ёдзиро Такита", "Ушедшие"],
    ["secret", "The Secret in Their Eyes", "El secreto de sus ojos", 2009, 2010, "AR", "Хуан Хосе Кампанелья", "Тайна в его глазах"],
    ["betterworld", "In a Better World", "Hævnen", 2010, 2011, "DK", "Сюзанна Бир", "Месть"],
    ["separation", "A Separation", "جدایی نادر از سیمین", 2011, 2012, "IR", "Асгар Фархади", "Развод Надера и Симин"],
    ["amour", "Amour", "Amour", 2012, 2013, "AT", "Михаэль Ханеке", "Любовь"],
    ["beauty", "The Great Beauty", "La grande bellezza", 2013, 2014, "IT", "Паоло Соррентино", "Великая красота"],
    ["ida", "Ida", "Ida", 2013, 2015, "PL", "Павел Павликовский", "Ида"],
    ["saul", "Son of Saul", "Saul fia", 2015, 2016, "HU", "Ласло Немеш", "Сын Саула"],
    ["salesman", "The Salesman", "فروشنده", 2016, 2017, "IR", "Асгар Фархади", "Коммивояжёр"],
    ["fantasticwoman", "A Fantastic Woman", "Una mujer fantástica", 2017, 2018, "CL", "Себастьян Лелио", "Фантастическая женщина"],
    ["roma", "Roma", "Roma", 2018, 2019, "MX", "Альфонсо Куарон", "Рома"],
    ["parasite", "Parasite", "기생충", 2019, 2020, "KR", "Пон Чжун Хо", "Паразиты"],
    ["anotherround", "Another Round", "Druk", 2020, 2021, "DK", "Томас Винтерберг", "Ещё по одной"],
    ["drivemycar", "Drive My Car", "ドライブ・マイ・カー", 2021, 2022, "JP", "Рюсукэ Хамагути", "Сядь за руль моей машины"],
    ["allquiet", "All Quiet on the Western Front", "Im Westen nichts Neues", 2022, 2023, "DE", "Эдвард Бергер", "На Западном фронте без перемен"],
    ["zone", "The Zone of Interest", "The Zone of Interest", 2023, 2024, "GB", "Джонатан Глейзер", "Зона интересов"],
    ["stillhere", "I'm Still Here", "Ainda Estou Aqui", 2024, 2025, "BR", "Вальтер Саллес", "Я всё ещё здесь"],
    ["sentimental", "Sentimental Value", "Affeksjonsverdi", 2025, 2026, "NO", "Йоаким Триер", "Сентиментальная ценность"],
    ["fanny", "Fanny and Alexander", "Fanny och Alexander", 1982, 1984, "SE", "Ингмар Бергман", "Фанни и Александр"],
    ["beautiful", "Life Is Beautiful", "La vita è bella", 1997, 1999, "IT", "Роберто Бениньи", "Жизнь прекрасна"],
    ["paradiso", "Cinema Paradiso", "Nuovo Cinema Paradiso", 1988, 1990, "IT", "Джузеппе Торнаторе", "Новый кинотеатр «Парадизо»"]
  ].map(([key,english,original,year,awardYear,country,director,title])=>({key,english,original,year,awardYear,country,director,title}));
  const FOREIGN_BATCH = 6;
  const foreignByKey = new Map(FOREIGN_WINNERS.map(film=>[film.key,film]));
  FOREIGN_WINNERS.forEach(film=>{F[film.key]=[film.english,film.year];});
  const PEOPLE={cuaron:"Alfonso Cuarón",inarritu:"Alejandro G. Iñárritu",nolan:"Christopher Nolan",pta:"Paul Thomas Anderson"};

  const featuredTitle=(key,russian,includeYear=false)=>{
    if(filmLanguage==="ru")return russian;
    const [title,year]=F[key];
    const english=key==="beauty"?"The Great Beauty":key==="fanny"?"Fanny and Alexander":title;
    const display=filmLanguage==="en"?english:(foreignByKey.get(key)?.original||title);
    return esc(includeYear?`${display} (${year})`:display);
  };

  // ---------- разметка ----------
  const fl=cc=>typeof flag==="function"?`<span class="kgf">${flag(cc,false)}</span>`:"";
  const slot=(k,cls,extra="")=>`<div data-kgo-poster="${k}" class="${cls} relative overflow-hidden bg-surface-container-highest flex items-center justify-center text-text-muted"><span data-kgo-ph class="material-symbols-outlined">movie</span>${extra}</div>`;
  const yr=(t,pos="bottom-1 left-1")=>`<span class="absolute ${pos} px-1.5 py-0.5 rounded bg-surface-container-lowest/90 font-micro-caption text-micro-caption text-primary font-bold">${t}</span>`;
  const open=(k,t)=>`data-kgo-open="${k}" data-kgo-target="oscar-kgo-detail-${t}"`;
  const box=(t,cls="")=>`<div id="oscar-kgo-detail-${t}" class="${cls}"></div>`;
  const head=(icon,title,sub)=>`<div class="flex items-center gap-2"><span class="material-symbols-outlined text-primary-container text-[20px]" style="font-variation-settings:'FILL' 1;">${icon}</span><div class="min-w-0"><h3 class="font-headline-sm text-headline-sm text-primary">${uiText(title)}</h3>${sub?`<p class="font-micro-caption text-micro-caption text-text-muted mt-0.5">${uiText(sub)}</p>`:""}</div></div>`;
  const sec=(id,inner)=>`<section id="kgo-${id}" style="scroll-margin-top:150px" class="px-gutter-mobile mt-space-xl flex flex-col gap-space-md">${inner}</section>`;
  const pill=t=>`<span class="px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container font-micro-caption text-micro-caption font-bold">${uiText(t)}</span>`;
  const pill2=t=>`<span class="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-micro-caption text-micro-caption font-bold">${uiText(t)}</span>`;

  function foreignCard0(k,cc,who,title,orig,text,chips,big){
    return `<div ${open(k,k)} class="bg-surface-panel rounded-xl p-3.5 shadow-md flex gap-3 cursor-pointer"><div class="${big?"w-24":"w-20"} shrink-0">${slot(k,"w-full aspect-[2/3] rounded-lg",yr(F[k][1]))}</div><div class="flex flex-col justify-between min-w-0 flex-1"><div><div class="flex items-center gap-1.5">${fl(cc)}<span class="font-micro-caption text-micro-caption text-text-muted truncate">${uiText(who)}</span></div><h4 class="font-headline-sm text-headline-sm ${big?"text-primary":"text-on-surface"} tracking-tight truncate mt-0.5">${featuredTitle(k,title)}</h4><span class="font-micro-caption text-micro-caption text-on-surface-variant italic">${orig}</span><p class="font-body-sm text-body-sm text-text-muted kg-clip2 mt-1">${uiText(text)}</p></div><div class="flex items-center gap-1.5 mt-2 flex-wrap">${chips}<span data-kgo-rate="${k}" class="font-micro-caption text-micro-caption text-text-muted"></span></div></div></div>`;
  }
  function gridCard(k,cc,who,title,text,badge){
    return `<div class="bg-surface-panel rounded-xl p-3 flex flex-col shadow-sm cursor-pointer" ${open(k,"foreign-grid")}>${slot(k,"w-full aspect-[3/4] rounded-lg mb-2",`<span class="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-surface-container-lowest/90 font-micro-caption text-micro-caption text-primary font-bold">${uiText(badge)}</span>`)}<div class="flex items-center gap-1">${fl(cc)}<span class="font-micro-caption text-micro-caption text-text-muted truncate">${uiText(who)}</span></div><h5 class="font-label-md text-label-md text-on-surface font-bold truncate mt-1">${featuredTitle(k,title)}</h5><p class="font-micro-caption text-micro-caption text-text-muted kg-clip2 mt-1">${uiText(text)}</p></div>`;
  }
  const foreignCard=(k,...a)=>`<div>${foreignCard0(k,...a)}${box(k)}</div>`;
  const animRow=(k,...a)=>`<div>${animRow0(k,...a)}${box(k)}</div>`;
  const clubRow=(k,...a)=>`<div>${clubRow0(k,...a)}${box(k)}</div>`;
  function shuffledForeign(previousFirst) {
    const order=[...FOREIGN_WINNERS];
    for(let i=order.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [order[i],order[j]]=[order[j],order[i]];
    }
    // A fresh visit must visibly change the first film, even by chance.
    if(order[0].key===previousFirst){
      const next=1+Math.floor(Math.random()*(order.length-1));
      [order[0],order[next]]=[order[next],order[0]];
    }
    return order;
  }
  function foreignWinnerCard(film,big=false) {
    return foreignCard(film.key,film.country,film.director,film.title,film.original,"",
      pill(uiText("Оскар {year}",{year:film.awardYear})),big);
  }
  function foreignBatchHtml(films,start=0) {
    const leading=start===0?films.slice(0,2):[];
    const tiles=start===0?films.slice(2):films;
    const target=`foreign-grid-${start}`;
    return leading.map((film,index)=>foreignWinnerCard(film,index===0)).join("")+
      `<div class="grid grid-cols-2 gap-space-sm">${tiles.map(film=>
        gridCard(film.key,film.country,film.director,film.title,"",uiText("Оскар {year}",{year:film.awardYear}))
          .replace('data-kgo-target="oscar-kgo-detail-foreign-grid"',`data-kgo-target="oscar-kgo-detail-${target}"`)
      ).join("")}${box(target,"col-span-2")}</div>`;
  }
  function foreignSection(order,shown=FOREIGN_BATCH) {
    return sec("foreign",
      `<div class="bg-surface-panel rounded-xl p-space-md shadow-md"><h3 class="text-primary font-headline-sm text-headline-sm">${uiText("Лучший фильм на иностранном языке")}</h3></div>`+
      `<div data-kgo-foreign-list class="flex flex-col gap-space-sm">${foreignBatchHtml(order.slice(0,shown))}</div>`+
      `<button type="button" data-kgo-foreign-more class="w-full py-3 rounded-xl bg-surface-panel text-primary font-label-sm text-label-sm" ${shown>=order.length?"hidden":""}>${uiText("Показать ещё")}</button>`);
  }
  function refreshForeign(root) {
    const section=root.querySelector("#kgo-foreign");if(!section)return;
    root._kgoDeps?.closeFilm("oscar");
    root._kgoForeignOrder=shuffledForeign(root._kgoForeignOrder?.[0]?.key);
    root._kgoForeignShown=FOREIGN_BATCH;
    section.outerHTML=foreignSection(root._kgoForeignOrder);
    hydrate(root.querySelector("#kgo-foreign"));
  }
  KG.refreshForeign=refreshForeign;

  function big5Card(k,title,who,cer){
    return `<div ${open(k,"big5")} class="bg-surface-panel rounded-xl p-2 flex flex-col shadow-md cursor-pointer">${slot(k,"w-full aspect-[3/4] rounded-lg mb-1.5",yr(F[k][1]).replace("bg-surface-container-lowest/90","bg-cinema-velvet-deep").replace("text-primary","text-secondary-fixed"))}<h5 class="font-label-sm text-label-sm text-on-surface font-bold truncate">${featuredTitle(k,title)}</h5><span class="font-micro-caption text-micro-caption text-primary-container font-semibold">${uiText("5 главных наград")}</span><span class="font-micro-caption text-micro-caption text-text-muted mt-0.5 truncate">${uiText(who)}</span><span class="font-micro-caption text-micro-caption text-text-muted truncate">${uiText("церемония {year}", {year: cer})}</span></div>`;
  }
  const big5=sec("big5",
    `<div class="flex items-center justify-between gap-2">${head("workspace_premium","«Большая пятёрка»","Фильм + режиссёр + актёр + актриса + сценарий. Всего 3 картины в истории")}<span class="px-2.5 py-1 rounded-full bg-secondary-container/50 text-secondary font-label-sm text-label-sm font-bold shrink-0">3 / 3</span></div>`+
    `<div class="grid grid-cols-3 gap-space-xs">${big5Card("night","Это случилось однажды ночью","Ф. Капра",1935)}${big5Card("cuckoo","Гнездо кукушки","М. Форман",1976)}${big5Card("lambs","Молчание ягнят","Дж. Демме",1992)}${box("big5","col-span-3")}</div>`);

  function animRow0(k,badge,studio,title,text){
    return `<div ${open(k,k)} class="bg-surface-panel rounded-xl p-3.5 shadow-md flex items-center justify-between gap-3 cursor-pointer">${slot(k,"w-16 h-20 rounded-lg shrink-0")}<div class="flex flex-col min-w-0 flex-1"><div class="flex items-center gap-1.5">${pill(badge)}<span class="font-micro-caption text-micro-caption text-text-muted truncate">${studio}</span></div><h4 class="font-label-lg text-label-lg text-on-surface font-bold truncate mt-1">${featuredTitle(k,title)}</h4><p class="font-micro-caption text-micro-caption text-on-surface-variant kg-clip2">${uiText(text)}</p></div><span class="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-primary shrink-0"><span class="material-symbols-outlined text-[18px]">play_circle</span></span></div>`;
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
    return `<div data-kgo-person-card role="button" tabindex="0" class="bg-surface-panel rounded-xl p-2.5 flex flex-col items-center text-center shadow-md w-[108px] shrink-0 cursor-pointer"><div data-kgo-person="${k}" class="w-14 h-14 rounded-full overflow-hidden bg-surface-container-highest mb-2 flex items-center justify-center text-text-muted"><span data-kgo-ph class="material-symbols-outlined">person</span></div><h5 class="font-label-sm text-label-sm text-on-surface font-bold leading-tight">${uiText(name)}</h5><span class="font-micro-caption text-micro-caption text-primary mt-1 font-bold">${uiText(badge)}</span><span class="font-micro-caption text-micro-caption text-text-muted">${uiText(films)}</span></div>`;
  }
  const dirs=sec("dir",
    head("movie_edit","Режиссёры-триумфаторы","Рекорд по «Оскарам» за режиссуру у Джона Форда: четыре статуэтки")+
    `<div class="flex gap-space-xs overflow-x-auto pb-1">${person("cuaron","А. Куарон","2 Оскара","Гравитация, Рома")}${person("inarritu","А. Иньярриту","2 подряд","Бёрдмэн, Выживший")}${person("nolan","К. Нолан","Оскар 2024","Оппенгеймер")}${person("pta","П. Т. Андерсон","Оскар 2026","One Battle After Another")}</div>`);

  function clubRow0(k,n,title,sub,score,full){
    return `<div ${open(k,k)} class="bg-surface-panel rounded-xl p-3 shadow-md flex items-center justify-between cursor-pointer"><div class="flex items-center gap-3 min-w-0"><div class="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center font-bold font-headline-sm text-primary shrink-0">${n}</div><div class="flex flex-col min-w-0"><h5 class="font-label-md text-label-md text-on-surface font-bold truncate">${featuredTitle(k,title,true)}</h5><span class="font-micro-caption text-micro-caption text-text-muted truncate">${uiText(sub)}</span></div></div><span class="px-2 py-1 rounded ${full?"bg-secondary-container/50 text-secondary":"bg-surface-container-high text-on-surface-variant"} font-micro-caption text-micro-caption font-bold shrink-0">${score}</span></div>`;
  }
  const club=sec("club",
    head("emoji_events","Клуб 11 Оскаров","Абсолютные рекордсмены по числу побед")+
    `<div class="flex flex-col gap-space-xs">${clubRow("rotk",11,"Властелин колец: Возвращение короля (2003)","11 номинаций, 11 побед","11/11",true)}${clubRow("titanic",11,"Титаник (1997)","Джеймс Кэмерон · рекорд 14 номинаций","11/14",false)}${clubRow("benhur",11,"Бен-Гур (1959)","Уильям Уайлер · исторический пеплум","11/12",false)}</div>`);

  const PILLS=[["Все номинации","stars","kgo-top"],["🌍 Иностранный фильм","","kgo-foreign"],["🏆 Лучшие фильмы","","kgo-list"],["Большая пятёрка","workspace_premium","kgo-big5"],["🎨 Анимация","","kgo-anim"],["🎬 Режиссёры","","kgo-dir"],["Клуб 11","emoji_events","kgo-club"]];
  const pOn="bg-primary-container text-on-primary-container shadow-[0_0_12px_rgb(var(--kg-primary-container)/0.3)]",pOff="bg-surface-panel text-text-muted hover:text-primary";
  const pillCls=on=>`shrink-0 h-[34px] px-3.5 rounded-full font-label-sm text-label-sm flex items-center gap-1.5 transition-transform active:scale-95 ${on?pOn:pOff}`;

  const HEAD=`<div id="kgo-top" class="relative z-30 bg-surface/85 backdrop-blur-xl shadow-[0_4px_24px_rgb(var(--kg-black)/0.65)]"><div class="h-14 px-gutter-mobile flex items-center justify-between gap-space-sm"><div class="flex items-center gap-space-sm min-w-0 flex-1"><button type="button" data-oscar-back aria-label="${uiText("Назад")}" class="w-11 h-11 -ml-1.5 flex items-center justify-center rounded-full text-on-surface hover:text-primary transition-colors"><span class="material-symbols-outlined text-[24px]">arrow_back</span></button><div class="flex flex-col min-w-0"><div class="flex items-center gap-1.5 min-w-0"><span class="material-symbols-outlined text-primary-container text-[20px] shrink-0">military_tech</span><h2 class="font-headline-sm text-headline-sm text-primary tracking-tight truncate">${uiText("Лауреаты «Оскара»")}</h2></div><span data-oscar-summary class="font-micro-caption text-micro-caption text-text-muted"></span></div></div><div class="flex items-center gap-space-xs shrink-0"><button type="button" data-kgo-tune aria-label="${uiText("Поиск и фильтры")}" class="w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-high/60 transition-colors"><span class="material-symbols-outlined text-[22px]">tune</span></button><button type="button" data-kgo-avatar aria-label="${uiText("Профиль")}" class="w-8 h-8 rounded-full bg-primary flex items-center justify-center ml-0.5"><span class="material-symbols-outlined text-on-primary text-[18px]">person</span></button></div></div></div>
<div id="kgo-pills" class="w-full overflow-x-auto pb-space-sm px-gutter-mobile mt-space-md flex items-center gap-2">${PILLS.map(([l,ic,t],i)=>`<button type="button" data-kgo-pill="${t}" class="${pillCls(i===0)}">${ic?`<span class="material-symbols-outlined text-[15px]">${ic}</span>`:""}${uiText(l)}</button>`).join("")}</div>`;

  function decorate(root,deps){
    root._kgoDeps=deps;window.__kgoDeps=deps;
    const wrap=root.firstElementChild;if(!wrap)return;
    const back=wrap.firstElementChild,hero=back&&back.nextElementSibling;
    if(!back||!hero)return;
    back.remove();wrap.classList.remove("overflow-hidden");
    const tmp=document.createElement("div");
    root._kgoForeignOrder=shuffledForeign(root._kgoForeignOrder?.[0]?.key);
    root._kgoForeignShown=FOREIGN_BATCH;
    tmp.innerHTML=HEAD+foreignSection(root._kgoForeignOrder)+big5+anim+dirs+club;
    while(tmp.firstChild)wrap.insertBefore(tmp.firstChild,hero);
    // Оставляем постер и название зала славы сразу под навигацией страницы.
    const pills=root.querySelector("#kgo-pills");
    if(pills&&hero)wrap.insertBefore(hero,pills.nextSibling);
    const list=$("oscar-list");const ls=list&&list.closest("section");if(ls)ls.id="kgo-list";
    if(!root._kgoBound){
      root._kgoBound=true;
      root.addEventListener("click",async e=>{
        const d=root._kgoDeps;
        const more=e.target.closest("[data-kgo-foreign-more]");
        if(more){
          const list=root.querySelector("[data-kgo-foreign-list]");
          const previous=root._kgoForeignShown;
          const additions=root._kgoForeignOrder.slice(previous,previous+FOREIGN_BATCH);
          const batch=document.createElement("div");
          batch.innerHTML=foreignBatchHtml(additions,previous);
          list.appendChild(batch);
          root._kgoForeignShown=previous+additions.length;
          more.hidden=root._kgoForeignShown>=root._kgoForeignOrder.length;
          hydrate(batch);
          return;
        }
        const p=e.target.closest("[data-kgo-pill]");
        if(p){
          root.querySelectorAll("[data-kgo-pill]").forEach(b=>b.className=pillCls(b===p));
          const bestFilter=root.querySelector('[data-oscar-filter="best"]');
          const isBestSection=p.dataset.kgoPill==="kgo-list";
          const isAllSection=p.dataset.kgoPill==="kgo-top";
          const bestIsOn=bestFilter&&bestFilter.getAttribute("aria-pressed")==="true";
          if(bestFilter&&((isBestSection&&!bestIsOn)||(isAllSection&&bestIsOn)))bestFilter.click();
          const t=p.dataset.kgoPill==="kgo-top"?null:$(p.dataset.kgoPill);
          if(t)t.scrollIntoView({behavior:"smooth",block:"start"});else window.scrollTo({top:0,behavior:"smooth"});
          return;
        }
        if(e.target.closest("[data-kgo-tune]")){
          const t=$("oscar-toolbar")||$("kgo-list");
          if(t)t.scrollIntoView({behavior:"smooth",block:"center"});return;
        }
        if(e.target.closest("[data-kgo-avatar]")){window.KGOpenAccountPage?.("register");return;}
        const o=e.target.closest("[data-kgo-open]");
        if(o&&d){
          const k=o.dataset.kgoOpen;
          try{
            const f=reg[k]||(hasKey()?await findFilm(k):null);
            if(f){reg[k]=f;d.openFilm(f,"oscar",o.dataset.kgoTarget,{opener:o});}
          }catch(err){console.warn("[Moven] oscar-design:",err);}
        }
      });
    }
    hydrate(root);
  }

  const baseRender=KG.render;
  KG.render=function(root,deps){
    baseRender.call(this,root,deps);
    decorate(root,deps);
  };
})();
