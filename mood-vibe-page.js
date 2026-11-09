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
  const extra={
    wine:{crumb:"Уют и тепло",pill:"ТЕПЛО И ДУША",badge:["local_fire_department","100% уют"],tags:["#Тепло","#ФранцияИталия","#Диалоги","#МедленноеКино"],heading:"Уют и бокал вина",hero:"Неспешные вечерние разговоры, мерцание свечей в парижских бистро, залитые золотым солнцем холмы Тосканы и искренние человеческие чувства. Фильмы, укутывающие словно кашемировый плед.",effect:["spa","Антистресс"],projector:"Винный кинопроектор",spin:"Крутить этот вайб (Случайный уютный фильм)",chips:[["chat_bubble","text-primary","Камерные диалоги"],["restaurant","text-secondary","Кулинария и вино"],["wb_sunny","text-primary-fixed-dim","Солнечный юг"],["hourglass_bottom","text-tertiary","Неспешный ритм"]],coll:"Коллекция согревающих картин",sub:"Отобрано с любовью для тихого вечера",short:"Уют",shortSub:"Тепло и вино",jewel:"Жемчужина вайба · Выбор куратора"},
    mindfuck:{crumb:"Лабиринты разума",pill:"ВЗРЫВ МОЗГА",badge:["psychology","Мозг на пределе"],tags:["#Психоделика","#Неонуар","#Загадки","#ПетлиСюжета"],heading:"Взрыв мозга и психоделика",hero:"Запутанные сюжетные петли, сюрреализм, гипнотический саундтрек и глубокий экзистенциальный шок. Фильмы, после которых хочется пересмотреть всё с начала.",effect:["psychology_alt","Переосмысление"],projector:"Психоделический кинопроектор",spin:"Крутить этот вайб (Случайный мозговзрыв)",chips:[["neurology","text-primary","Лабиринты разума"],["blur_on","text-secondary","Сюрреализм"],["troubleshoot","text-primary-fixed-dim","Неожиданные финалы"],["hourglass_bottom","text-tertiary","Глубокое погружение"]],coll:"Коллекция для взрыва мозга",sub:"Сюжеты, которые обсуждают после титров",short:"Взрыв мозга",shortSub:"Психоделика"},
    adrenaline:{crumb:"Драйв и темп",pill:"ДРАЙВ И НЕОН",badge:["bolt","100% драйв"],tags:["#Драйв","#Неон","#Погони","#Хореография"],heading:"Адреналин и неоновый дождь",hero:"Пульсирующий темп, филигранная хореография боёв, погони в неоновом дожде и чистый драйв. Фильмы, после которых невозможно сидеть спокойно.",effect:["bolt","Заряд энергии"],projector:"Неоновый кинопроектор",spin:"Крутить этот вайб (Случайный боевик)",chips:[["sports_martial_arts","text-primary","Хореография боёв"],["directions_car","text-secondary","Погони"],["flash_on","text-primary-fixed-dim","Высокий темп"],["location_city","text-tertiary","Неоновые города"]],coll:"Коллекция адреналина",sub:"Для вечера, когда хочется скорости",short:"Адреналин",shortSub:"Драйв и темп"},
    melancholy:{crumb:"Дождь и север",pill:"МЕЛАНХОЛИЯ",badge:["rainy","Северный ветер"],tags:["#Скандинавия","#СеверныйВетер","#Тишина","#Философия"],heading:"Меланхолия и дождь",hero:"Свинцовое северное небо, холодные фьорды, неспешный ритм и философское одиночество. Фильмы, которые хочется смотреть под шум дождя.",effect:["self_improvement","Катарсис"],projector:"Северный кинопроектор",spin:"Крутить этот вайб (Случайная северная драма)",chips:[["rainy","text-primary","Дождливая атмосфера"],["landscape","text-secondary","Фьорды и север"],["psychology_alt","text-primary-fixed-dim","Философия"],["hourglass_bottom","text-tertiary","Неспешный ритм"]],coll:"Коллекция северной меланхолии",sub:"Тихие истории для дождливого вечера",short:"Меланхолия",shortSub:"Дождь и север"},
    sunshine:{crumb:"Солнце и энергия",pill:"СОЛНЕЧНЫЙ ПОБЕГ",badge:["wb_sunny","100% дофамин"],tags:["#Солнце","#Энергия","#Юмор","#Побережье"],heading:"Солнечный побег",hero:"Искренний юмор, тёплое побережье, жизнеутверждающая драма без фальши. Фильмы, которые заряжают энергией на целую неделю.",effect:["mood","Дофамин"],projector:"Солнечный кинопроектор",spin:"Крутить этот вайб (Случайный солнечный фильм)",chips:[["sentiment_satisfied","text-primary","Искренний юмор"],["beach_access","text-secondary","Тёплое побережье"],["wb_sunny","text-primary-fixed-dim","Позитив"],["celebration","text-tertiary","Жизнелюбие"]],coll:"Коллекция солнечных картин",sub:"Заряд хорошего настроения",short:"Солнце",shortSub:"Дофамин"},
    "slow-evening":{crumb:"Тишина и тепло",pill:"ТИХИЙ ВЕЧЕР",badge:["bedtime","100% тишина"],tags:["#Уединение","#Тепло","#Близкие","#Нежность"],heading:"Тихий вечер",hero:"Неспешные истории о близких людях, тихих переменах и маленьких радостях жизни. Фильмы, которые согревают без лишних слов.",effect:["spa","Спокойствие"],projector:"Кинопроектор тихих вечеров",spin:"Крутить этот вайб (Случайный тихий фильм)",chips:[["favorite","text-primary","Близкие люди"],["coffee","text-secondary","Маленькие радости"],["chat_bubble","text-primary-fixed-dim","Тихие диалоги"],["hourglass_bottom","text-tertiary","Неспешный темп"]],coll:"Коллекция тихих историй",sub:"Для вечера без спешки",short:"Тихий вечер",shortSub:"Тишина и тепло"},
    mystery:{crumb:"Загадка и интрига",pill:"ТАЙНА ДО ТИТРОВ",badge:["visibility","100% интрига"],tags:["#Загадка","#Интрига","#Детектив","#Улики"],heading:"Тайна до финальных титров",hero:"Улики, подозреваемые и загадка, которую захочется разгадать раньше героев. Фильмы, где развязка всегда неожиданна.",effect:["search","Азарт"],projector:"Детективный кинопроектор",spin:"Крутить этот вайб (Случайный детектив)",chips:[["search","text-primary","Расследования"],["visibility","text-secondary","Улики и догадки"],["theater_comedy","text-primary-fixed-dim","Неожиданные финалы"],["hourglass_bottom","text-tertiary","Напряжение"]],coll:"Коллекция загадок",sub:"Разгадай раньше героев",short:"Тайна",shortSub:"До титров"},
    fantasy:{crumb:"Магия и приключения",pill:"В ДРУГОЙ МИР",badge:["auto_awesome","100% магия"],tags:["#Приключение","#Магия","#Миры","#Путешествие"],heading:"В другой мир",hero:"Путешествие в необычные миры, где за горизонтом начинаются настоящие приключения. Фильмы, в которые хочется переехать жить.",effect:["travel_explore","Побег"],projector:"Кинопроектор иных миров",spin:"Крутить этот вайб (Случайное приключение)",chips:[["castle","text-primary","Волшебные миры"],["explore","text-secondary","Путешествия"],["auto_awesome","text-primary-fixed-dim","Магия"],["pets","text-tertiary","Фантастические существа"]],coll:"Коллекция иных миров",sub:"Билет в сказку для взрослых",short:"В другой мир",shortSub:"Фэнтези"},
    laughs:{crumb:"Лёгкость и смех",pill:"ВЕЧЕР БЕЗ ЗАБОТ",badge:["sentiment_very_satisfied","100% смех"],tags:["#Комедия","#Лёгкость","#Остроумие","#Улыбка"],heading:"Вечер без забот",hero:"Остроумные диалоги и комичные ситуации, чтобы просто расслабиться и посмеяться. Фильмы, после которых улыбка не сходит с лица.",effect:["sentiment_satisfied","Улыбка"],projector:"Комедийный кинопроектор",spin:"Крутить этот вайб (Случайная комедия)",chips:[["chat_bubble","text-primary","Остроумные диалоги"],["theater_comedy","text-secondary","Комичные ситуации"],["celebration","text-primary-fixed-dim","Лёгкость"],["hourglass_bottom","text-tertiary","Без напряжения"]],coll:"Коллекция хорошего настроения",sub:"Чтобы просто посмеяться",short:"Без забот",shortSub:"Комедия"},
    animation:{crumb:"Мир анимации",pill:"МИРЫ АНИМАЦИИ",badge:["palette","100% краски"],tags:["#Анимация","#Вдохновение","#Краски","#Сказка"],heading:"Красивые миры анимации",hero:"Визуально яркие истории для любого возраста — от волшебных приключений до трогательных драм. Фильмы, нарисованные с любовью.",effect:["brush","Вдохновение"],projector:"Анимационный кинопроектор",spin:"Крутить этот вайб (Случайный мультфильм)",chips:[["palette","text-primary","Яркая картинка"],["auto_awesome","text-secondary","Волшебство"],["family_restroom","text-primary-fixed-dim","Для всех возрастов"],["favorite","text-tertiary","Трогательные сюжеты"]],coll:"Коллекция анимации",sub:"Нарисованные миры для вечера",short:"Анимация",shortSub:"Красивые миры"}
  };
  moods.forEach(m=>{m.x=extra[m.id];});
  const esc=s=>String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const poster=(path,size="w185")=>path?`https://image.tmdb.org/t/p/${size}${path}`:"";
  const flag=cc=>/^[A-Za-z]{2}$/.test(cc||"")?String.fromCodePoint(...[...cc.toUpperCase()].map(c=>127397+c.charCodeAt(0))):"";
  const plural=(n,f)=>{const a=Math.abs(n)%100,b=a%10;return a>10&&a<20?f[2]:b>1&&b<5?f[1]:b===1?f[0]:f[2];};
  const state={view:"list",mood:"wine",runtime:"any",country:"all",films:[],shown:4,loading:false,loadedKey:"",token:0,spinToken:0,spinFrame:0,spinning:false,skipSpin:false,page:0,totalPages:0,jobs:null,autoSpin:null};
  const reelStep=90,reelPadding=8,reelCellWidth=80;
  const prefersReducedMotion=()=>window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches||false;
  let host=null;
  const currentMood=()=>moods.find(m=>m.id===state.mood)||moods[0];
  const currentRuntime=()=>runtimes.find(r=>r.id===state.runtime)||runtimes[0];
  const activeCard=root=>root.querySelector(`.vibe-card[data-vibe-card="${state.mood}"]`);
  const activeElement=(root,selector)=>activeCard(root)?.querySelector(selector)||null;
  function filtered(){return state.films.filter(f=>currentRuntime().test(f.runtime||0)&&(state.country==="all"||f._cc===state.country));}
  function split(){
    const list=filtered();let best=null;
    list.forEach(f=>{if(!best||(f.vote_average||0)>(best.vote_average||0))best=f;});
    return {best,rest:list.filter(f=>f!==best),list};
  }
  function scrollToMoodResult(panel,moodId=state.mood){
    requestAnimationFrame(()=>{
      if(!panel.isConnected||moodId!==state.mood)return;
      const top=window.scrollY+panel.getBoundingClientRect().top-96;
      window.scrollTo({top:Math.max(0,top),behavior:"smooth"});
    });
  }
  function updateLaunchLabel(root){
    const launch=activeElement(root,"[data-vibe-launch-label]");
    if(launch&&!state.spinning)launch.textContent=currentMood().x.spin;
  }
  const switchTones=[["bg-error-container/40","text-error"],["bg-surface-container-highest","text-primary-fixed-dim"],["bg-secondary-container/40","text-secondary"]];
  function detailHtml(m){
    const x=m.x;
    const others=moods.filter(o=>o.id!==m.id).sort(()=>Math.random()-.5).slice(0,3);
    return `<div class="vibe-card flex flex-col w-full gap-space-lg pb-8" data-vibe-card="${m.id}">
<div class="flex items-center justify-between gap-space-sm"><button type="button" data-vibe-all class="h-11 px-space-xs flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors active:scale-95"><span class="material-symbols-outlined text-lg leading-none">arrow_back_ios_new</span><span class="font-label-md text-label-md tracking-tight">Все вайбы</span></button><div class="flex-1 min-w-0 flex items-center justify-center"><div class="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-surface-panel/90 shadow-[inset_0_1px_0_rgba(255,184,48,0.2)] max-w-full"><span class="w-1.5 h-1.5 rounded-full bg-primary-container shadow-[0_0_8px_rgba(255,184,48,0.9)] shrink-0"></span><span class="font-micro-caption text-micro-caption tracking-wider uppercase text-on-surface truncate">ВАЙБ НАСТРОЕНИЯ · ${esc(x.crumb.toUpperCase())}</span></div></div><div class="w-11 shrink-0"></div></div>
<section class="relative w-full rounded-2xl overflow-hidden bg-surface-container-low shadow-[0_20px_45px_rgba(7,6,10,0.7)]">
<div class="relative w-full h-[270px] bg-cover bg-center overflow-hidden" style="background-image: url('${m.image}')">
<div class="absolute inset-0 bg-gradient-to-t from-surface-container-low via-surface-container-low/60 to-transparent"></div>
<div class="absolute inset-0 bg-radial-at-c from-cinema-velvet-glow via-transparent to-black/40 mix-blend-multiply"></div>
<div class="absolute top-space-md left-space-md flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-surface-panel/90 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.6)]"><span class="material-symbols-outlined text-[16px] text-secondary">${m.icon}</span><span class="font-micro-caption text-micro-caption tracking-widest uppercase text-tertiary">${esc(x.pill)}</span></div>
<div class="absolute top-space-md right-space-md flex items-center gap-1 px-space-sm py-1 rounded-full bg-cinema-velvet-deep/80 backdrop-blur-md text-secondary"><span class="material-symbols-outlined text-[15px] text-primary-container" style="font-variation-settings: 'FILL' 1;">${x.badge[0]}</span><span class="font-label-sm text-label-sm text-on-surface">${esc(x.badge[1])}</span></div>
</div>
<div class="relative p-space-md -mt-16 flex flex-col gap-space-sm">
<div class="flex flex-col gap-1"><h1 class="font-display-hero-mobile text-display-hero-mobile text-primary tracking-tight">${esc(x.heading)}</h1><p class="font-body-md text-body-md text-on-surface-variant line-clamp-3 leading-relaxed">${esc(x.hero)}</p></div>
<div class="grid grid-cols-3 gap-space-xs mt-1 pt-space-xs">
<div class="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-surface-panel/80 shadow-[0_2px_8px_rgba(0,0,0,0.4)]"><span class="font-label-sm text-label-sm text-primary flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">${m.icon}</span><span data-mv-count>…</span></span><span class="font-micro-caption text-micro-caption text-text-muted mt-0.5">В каталоге</span></div>
<div class="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-surface-panel/80 shadow-[0_2px_8px_rgba(0,0,0,0.4)]"><span class="font-label-sm text-label-sm text-primary-container flex items-center gap-0.5"><span class="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 1;">star</span><span data-mv-avg>—</span></span><span class="font-micro-caption text-micro-caption text-text-muted mt-0.5">Средний балл</span></div>
<div class="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-surface-panel/80 shadow-[0_2px_8px_rgba(0,0,0,0.4)]"><span class="font-label-sm text-label-sm text-secondary flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">${x.effect[0]}</span> ${esc(x.effect[1])}</span><span class="font-micro-caption text-micro-caption text-text-muted mt-0.5">Эффект</span></div>
</div></div></section>
<section class="flex flex-col gap-space-sm p-space-md rounded-2xl bg-surface-panel shadow-[0_12px_32px_rgba(7,6,10,0.85)] relative overflow-hidden">
<button class="w-full h-12 rounded-xl bg-primary-container text-on-primary-fixed font-label-lg text-label-lg flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(255,184,48,0.35)] active:scale-[0.98] transition-all hover:brightness-105" data-vibe-spin type="button"><span class="material-symbols-outlined text-[20px]">casino</span><span data-vibe-launch-label>${esc(x.spin)}</span></button>
<p class="font-body-sm text-body-sm text-feedback-error" data-vibe-error role="status" hidden></p><button class="self-start px-3 py-2 rounded-lg bg-surface-container-high text-primary font-label-sm text-label-sm" data-vibe-retry type="button" hidden>Повторить загрузку</button>
<div data-vibe-result></div>
</section>
<section class="flex flex-col gap-space-sm">
<div class="flex items-center justify-between"><h2 class="font-headline-sm text-headline-sm text-primary">География и темп</h2><span class="font-label-sm text-label-sm text-on-surface-variant">${x.chips.length} подтемы</span></div>
<div class="flex gap-2 overflow-x-auto pb-1 -mx-margin-mobile px-margin-mobile" data-vibe-pills></div>
<div class="flex flex-wrap gap-2">${x.chips.map(c=>`<span class="px-3 py-1.5 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm flex items-center gap-1.5 shadow-sm"><span class="material-symbols-outlined text-[15px] ${c[1]}">${c[0]}</span> ${esc(c[2])}</span>`).join("")}</div>
</section>
<section class="flex flex-col gap-space-xs p-space-md rounded-2xl bg-gradient-to-b from-surface-panel to-surface-container-low shadow-[0_16px_36px_rgba(7,6,10,0.8)] relative overflow-hidden" data-vibe-jewel hidden></section>
<section class="flex flex-col gap-space-md">
<div class="flex items-center justify-between"><div class="flex flex-col"><h2 class="font-headline-md text-headline-md text-primary">${esc(x.coll)}</h2><span class="font-body-sm text-body-sm text-text-muted">${esc(x.sub)}</span></div><span class="flex items-center text-primary-container"><span class="material-symbols-outlined text-[18px]">tune</span></span></div>
<div class="flex flex-col gap-space-sm" data-vibe-films></div>
<button class="w-full py-3.5 rounded-xl bg-surface-panel hover:bg-surface-bright text-primary font-label-md text-label-md flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(7,6,10,0.6)] active:scale-95 transition-all" data-vibe-more type="button" hidden><span data-vibe-more-label>Показать ещё</span><span class="material-symbols-outlined text-[18px]">expand_more</span></button>
</section>
<section class="flex flex-col gap-space-sm pt-space-xs">
<div class="flex items-center justify-between"><h3 class="font-headline-sm text-headline-sm text-tertiary">Сменить настроение</h3><span class="font-label-sm text-label-sm text-text-muted">Другие вайбы</span></div>
<div class="grid grid-cols-3 gap-space-xs">${others.map((o,i)=>`<button type="button" data-vibe-goto="${o.id}" class="p-space-sm rounded-xl bg-surface-panel flex flex-col gap-2 items-center text-center active:scale-95 transition-transform shadow-md"><div class="w-10 h-10 rounded-full ${switchTones[i][0]} flex items-center justify-center ${switchTones[i][1]}"><span class="material-symbols-outlined text-[22px]">${o.icon}</span></div><div class="flex flex-col min-w-0 w-full"><span class="font-label-sm text-label-sm text-on-surface font-semibold truncate w-full">${esc(o.x.short)}</span><span class="font-micro-caption text-micro-caption text-text-muted truncate">${esc(o.x.shortSub)}</span></div></button>`).join("")}</div>
</section></div>`;
  }
  function filmCardHtml(f,deps){
    const d=f.detail||{},year=(f.release_date||"").slice(0,4),target=`mood-film-detail-v${f.id}`;
    const orig=f.original_title&&f.original_title!==f.title?`${esc(f.original_title)} · `:"";
    const country=f._cc?` · ${esc(deps.countryName(f._cc)||f._cc)}`:"";
    const dir=(d.dirs||[]).slice(0,2).join(", ");
    const genre=(d.genres||[])[0]||"";
    const booked=deps.isBooked?.(f.id);
    return `<div class="flex flex-col"><article data-vibe-film="${f.id}" data-detail-target="${target}" class="p-space-sm rounded-xl bg-surface-panel shadow-[0_6px_20px_rgba(7,6,10,0.5)] flex gap-space-sm active:bg-surface-container-high transition-colors cursor-pointer">
<div class="relative w-20 h-28 rounded-lg overflow-hidden bg-surface-container-high shrink-0">${f.poster_path?`<img class="w-full h-full object-cover" loading="lazy" alt="Постер «${esc(f.title||f.original_title)}»" src="${poster(f.poster_path)}">`:'<span class="material-symbols-outlined w-full h-full flex items-center justify-center text-primary-container">movie</span>'}<div class="absolute bottom-1 left-1 px-1 py-0.2 rounded bg-black/80 flex items-center gap-0.5 text-primary-container"><span class="material-symbols-outlined text-[10px]" style="font-variation-settings: 'FILL' 1;">star</span><span class="font-micro-caption text-micro-caption font-bold">${Number(f.vote_average||0).toFixed(1)}</span></div></div>
<div class="flex flex-col justify-between flex-1 min-w-0 py-0.5"><div class="flex flex-col"><div class="flex items-start justify-between gap-1"><h4 class="font-headline-sm text-headline-sm text-on-surface truncate">${esc(f.title||f.original_title||"Фильм")}</h4><button type="button" data-vibe-bm="${f.id}" aria-label="В закладки" class="text-text-muted hover:text-primary transition-colors"><span class="material-symbols-outlined text-[20px]">${booked?"bookmark_added":"bookmark_border"}</span></button></div>
<p class="font-micro-caption text-micro-caption text-text-muted truncate">${orig}${year}${country}</p>
<p class="font-body-sm text-body-sm text-tertiary-fixed-dim mt-1 truncate">${dir?`Реж. ${esc(dir)}`:"&nbsp;"}${d.runtime?` · ${d.runtime} мин`:""}</p></div>
<div class="flex items-center justify-between pt-1"><span class="px-2 py-0.5 rounded-full bg-surface-container-highest text-secondary font-label-sm text-label-sm truncate">${esc(genre||"Фильм")}</span><div class="flex items-center gap-1 text-primary-container font-label-sm text-label-sm"><span class="material-symbols-outlined text-[16px]">play_circle</span> Трейлер</div></div></div>
</article><div id="${target}"></div></div>`;
  }
  function jewelHtml(f,deps){
    const d=f.detail||{},year=(f.release_date||"").slice(0,4),target=`mood-film-detail-v${f.id}`;
    const dir=(d.dirs||[]).slice(0,2).join(", ");
    const orig=f.original_title&&f.original_title!==f.title?esc(f.original_title):"&nbsp;";
    const genres=(d.genres||[]).slice(0,2);
    const booked=deps.isBooked?.(f.id);
    return `<div class="flex items-center gap-1.5 text-secondary"><span class="material-symbols-outlined text-[18px]">verified</span><span class="font-label-sm text-label-sm uppercase tracking-wider font-semibold">${esc(currentMood().x.jewel||"Жемчужина вайба · Выбор куратора")}</span></div>
<div data-vibe-film="${f.id}" data-detail-target="${target}" class="grid grid-cols-[108px_1fr] gap-space-md mt-1 cursor-pointer">
<div class="relative w-full aspect-[2/3] rounded-xl overflow-hidden bg-surface-container-high shadow-lg">${f.poster_path?`<img class="w-full h-full object-cover" alt="Постер «${esc(f.title||f.original_title)}»" src="${poster(f.poster_path,"w342")}">`:""}<div class="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/75 backdrop-blur-md flex items-center gap-0.5 text-primary-container"><span class="material-symbols-outlined text-[12px]" style="font-variation-settings: 'FILL' 1;">star</span><span class="font-label-sm text-label-sm font-bold">${Number(f.vote_average||0).toFixed(1)}</span></div></div>
<div class="flex flex-col justify-between min-w-0"><div class="flex flex-col gap-1"><div class="flex items-start justify-between gap-1"><h3 class="font-headline-md text-headline-md text-primary truncate leading-tight">${esc(f.title||f.original_title||"Фильм")}</h3><span class="px-2 py-0.5 rounded-full bg-secondary-container/60 text-secondary font-label-sm text-label-sm shrink-0">${year}${f._cc?` · ${flag(f._cc)}`:""}</span></div>
<p class="font-micro-caption text-micro-caption text-text-muted">${orig}</p>
<p class="font-body-sm text-body-sm text-tertiary mt-0.5">${dir?`Реж. ${esc(dir)}`:""}${dir&&d.runtime?" · ":""}${d.runtime?`${d.runtime} мин`:""}</p>
<div class="flex flex-wrap gap-1 mt-1.5">${genres.map((g,i)=>`<span class="px-2 py-0.5 rounded ${i?"bg-secondary-container/30 text-secondary-fixed":"bg-surface-container-highest text-tertiary"} font-label-sm text-label-sm">${esc(g)}</span>`).join("")}</div></div>
<p class="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mt-2">${esc(d.overview||f.overview||"Описание пока недоступно.")}</p></div></div>
<div class="flex flex-col gap-2 mt-3 pt-3 bg-surface-container-lowest/40 rounded-xl p-2.5"><div class="flex items-center gap-2"><button type="button" data-vibe-film="${f.id}" data-detail-target="${target}" class="flex-1 h-10 rounded-lg bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center gap-1.5 active:scale-95 transition-transform shadow-md"><span class="material-symbols-outlined text-[18px]">play_arrow</span> Смотреть трейлер</button><button type="button" data-vibe-bm="${f.id}" aria-label="В закладки" class="h-10 px-3.5 rounded-lg bg-surface-bright text-on-surface font-label-md text-label-md flex items-center gap-1 active:scale-95 transition-transform"><span class="material-symbols-outlined text-[18px]">${booked?"bookmark_added":"bookmark_add"}</span></button></div></div>
<div id="${target}"></div>`;
  }
  function renderFilms(root,deps){
    const card=activeCard(root);if(!card)return;
    const m=currentMood(),{best,rest}=split(),all=state.films;
    const sel=s=>card.querySelector(s);
    const rtFiltered=all.filter(f=>currentRuntime().test(f.runtime||0));
    const count=sel("[data-mv-count]"),avg=sel("[data-mv-avg]");
    if(count)count.textContent=state.loading&&!all.length?"…":`${all.length} ${plural(all.length,["картина","картины","картин"])}`;
    if(avg)avg.textContent=all.length?(all.reduce((s,f)=>s+(Number(f.vote_average)||0),0)/all.length).toFixed(1):"—";
    const reel=sel("[data-vibe-reel]");
    if(reel&&!state.spinning){
      const cells=rtFiltered.slice(0,16);
      reel.innerHTML=cells.length?cells.map(f=>{const img=f.backdrop_path?poster(f.backdrop_path,"w300"):poster(f.poster_path,"w185");return `<div class="relative min-w-[124px] h-[78px] rounded-lg overflow-hidden bg-surface-container-high shrink-0 shadow-md"><div class="w-full h-full bg-cover bg-center" style="background-image: url('${img}')"></div><div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5"><span class="font-micro-caption text-micro-caption text-primary font-bold truncate">${esc(f.title||f.original_title)}</span></div></div>`;}).join(""):Array.from({length:4},()=>'<div class="min-w-[124px] h-[78px] rounded-lg bg-surface-container-high shrink-0 animate-pulse"></div>').join("");
    }
    const pills=sel("[data-vibe-pills]");
    if(pills){
      const counts={};rtFiltered.forEach(f=>{if(f._cc)counts[f._cc]=(counts[f._cc]||0)+1;});
      const top=Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,4).map(e=>e[0]);
      if(state.country!=="all"&&!top.includes(state.country))top.push(state.country);
      const pill=(cc,label,active)=>`<button type="button" data-vibe-country="${cc}" class="${active?"h-9 px-4 rounded-full bg-primary-container text-on-primary-fixed font-label-md text-label-md whitespace-nowrap shadow-[0_0_12px_rgba(255,184,48,0.3)] shrink-0":"h-9 px-3.5 rounded-full bg-surface-panel text-on-surface-variant hover:text-on-surface font-label-md text-label-md whitespace-nowrap shrink-0"}">${label}</button>`;
      pills.innerHTML=pill("all",`Все страны (${rtFiltered.length})`,state.country==="all")+top.map(cc=>pill(cc,`${esc(deps.countryName(cc)||cc)} ${flag(cc)} (${counts[cc]||0})`,state.country===cc)).join("");
    }
    const jewel=sel("[data-vibe-jewel]");
    if(jewel){
      if(best){jewel.innerHTML=jewelHtml(best,deps);jewel.hidden=false;}
      else{jewel.innerHTML="";jewel.hidden=true;}
    }
    const box=sel("[data-vibe-films]");
    if(box){
      if(state.loading&&!rest.length&&!best){
        box.innerHTML='<p class="font-body-sm text-body-sm text-text-muted p-3 rounded-xl bg-surface-panel">Загружаем фильмы…</p>';
      }else if(!best){
        box.innerHTML='<p class="font-body-sm text-body-sm text-text-muted p-3 rounded-xl bg-surface-panel">Нет фильмов для выбранного настроения. Выберите другую страну или настроение.</p>';
      }else{
        box.innerHTML=rest.slice(0,state.shown).map(f=>filmCardHtml(f,deps)).join("");
      }
    }
    const more=sel("[data-vibe-more]");
    if(more){
      const left=rest.length-state.shown;
      more.hidden=left<=0&&state.page>=state.totalPages;
      const label=sel("[data-vibe-more-label]");
      if(label)label.textContent=left>0?`Показать ещё ${left} ${plural(left,["фильм","фильма","фильмов"])}`:state.page<state.totalPages?"Загрузить ещё фильмы":"Больше фильмов нет";
    }
    if(deps?.refreshFilm)deps.refreshFilm();
  }
  function stopSpin(root){
    const wasSpinning=state.spinning;
    state.spinToken++;cancelAnimationFrame(state.spinFrame);state.spinning=false;state.skipSpin=false;
    const button=activeElement(root,"[data-vibe-spin]"),label=activeElement(root,"[data-vibe-launch-label]"),skip=activeElement(root,"[data-vibe-skip]");
    if(button)button.disabled=false;
    if(label)label.textContent=currentMood().x.spin;
    if(skip)skip.hidden=true;
    if(wasSpinning&&typeof window.stopFilmReelSound==="function")window.stopFilmReelSound();
  }
    async function loadMood(root,deps,targetCount=20){
    const token=++state.token,key=state.mood;
    state.loading=true;renderFilms(root,deps);
    const error=activeElement(root,"[data-vibe-error]"),retry=activeElement(root,"[data-vibe-retry]");if(error){error.hidden=true;error.textContent="";}if(retry)retry.hidden=true;
    if(!deps.hasKey()){state.loading=false;renderFilms(root,deps);if(error){error.textContent="Добавьте ключ TMDB на экране «Глобус», чтобы загружать подборки.";error.hidden=false;}return;}
    const mix=a=>{const r=[...a];for(let i=r.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[r[i],r[j]]=[r[j],r[i]];}return r;};
    try{
      const mood=currentMood();
      const base=cc=>({with_origin_country:cc,with_genres:mood.genres.join("|"),"vote_count.gte":30,"vote_average.gte":5.5,sort_by:"popularity.desc",include_adult:"false"});
      if(!state.jobs){
        const firsts=await Promise.allSettled(mood.countries.map(cc=>deps.api({...base(cc),page:1})));
        if(token!==state.token||key!==state.mood)return;
        const jobs=[];
        firsts.forEach((r,i)=>{
          if(r.status!=="fulfilled")return;
          const cc=mood.countries[i],pages=Math.min(r.value.total_pages||1,4);
          jobs.push({cc,page:1,data:r.value});
          for(let p=2;p<=pages;p++)jobs.push({cc,page:p,data:null});
        });
        if(!jobs.length){
          const bad=firsts.find(r=>r.status==="rejected");
          throw bad?bad.reason:new Error("Для этого настроения фильмов не нашлось.");
        }
        state.jobs=mix(jobs);state.totalPages=state.jobs.length;state.page=0;
      }
      let detailFailures=0,attempted=0;
      while(state.page<state.jobs.length&&filtered().length<targetCount){
        const job=state.jobs[state.page];
        const result=job.data||await deps.api({...base(job.cc),page:job.page});
        if(token!==state.token||key!==state.mood)return;
        job.data=null;
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
          const cc=(d&&d.countries||[]).find(c=>mood.countries.includes(c))||(d&&d.countries||[])[0]||job.cc;
          return {...f,_cc:cc,runtime:(d||{}).runtime||0,detail:d};
        }).filter(f=>f.runtime>0));
        state.page++;
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
      if(token===state.token){
        state.loading=false;renderFilms(root,deps);
        if(state.autoSpin===state.mood){state.autoSpin=null;launch(root,deps);}
      }
    }
  }
  async function mapLimit(items,limit,fn){
    let next=0;
    await Promise.all(Array.from({length:Math.min(limit,items.length)},async()=>{
      while(next<items.length){const index=next++;await fn(items[index],index);}
    }));
  }
  function launch(root,deps){
    if(state.spinning)return;
    deps.closeFilm("mood");
    const error=activeElement(root,"[data-vibe-error]"),pool=filtered();
    if(error){error.hidden=true;error.textContent="";}
    if(state.loading){state.autoSpin=state.mood;if(error){error.textContent="Подборка загружается — рулетка запустится сама.";error.hidden=false;}return;}
    if(!pool.length){if(error){error.textContent="В выбранном настроении и хронометраже фильмов не нашлось. Выберите другой хронометраж.";error.hidden=false;}return;}
    const moodId=state.mood,film=pool[Math.floor(Math.random()*pool.length)],winnerDetailId=`mood-roulette-winner-detail-v${moodId}`;
    const token=++state.spinToken,winnerIndex=26,others=pool.filter(item=>item.id!==film.id),sequence=[];
    for(let i=0;i<winnerIndex;i++)sequence.push(others.length?others[Math.floor(Math.random()*others.length)]:film);
    sequence.push(film);
    for(let i=0;i<6;i++)sequence.push(others.length?others[Math.floor(Math.random()*others.length)]:film);
    const panel=activeElement(root,"[data-vibe-result]");
    state.spinning=true;state.skipSpin=false;
    const launchButton=activeElement(root,"[data-vibe-spin]"),launchLabel=activeElement(root,"[data-vibe-launch-label]");
    if(launchButton)launchButton.disabled=true;
    if(launchLabel)launchLabel.textContent="Плёнка крутится…";
    if(!panel){state.spinning=false;return;}
    panel.innerHTML=`<div class="relative overflow-hidden rounded-2xl bg-surface-panel p-4 shadow-xl"><div class="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-cinema-amber-glow blur-3xl pointer-events-none"></div><h2 class="relative font-headline-sm text-headline-sm text-primary mb-3">Кинорулетка настроения</h2><div class="relative w-full rounded-xl bg-canvas-obsidian border border-primary-container/30 overflow-hidden shadow-[inset_0_2px_12px_rgba(0,0,0,0.95)] p-1"><div class="kgr-perf"><div>${"<i></i>".repeat(12)}</div><span>Kodak 35mm</span></div><div class="kgr-win select-none"><div class="kgr-track"><div class="kgr-run">${sequence.map(item=>`<div class="kgr-cell">${item.poster_path?`<img alt="${esc(item.title||item.original_title)}" draggable="false" src="${poster(item.poster_path)}">`:`<div class="nop">${esc(item.title||item.original_title)}</div>`}<span class="yr">${(item.release_date||"").slice(0,4)}</span></div>`).join("")}</div></div><div data-vibe-reel-frame class="kgr-frame" aria-hidden="true"></div></div><div class="kgr-perf"><div>${"<i></i>".repeat(12)}</div><span>35mm nitrate</span></div></div><div class="flex items-center justify-between px-1"><span data-vibe-frame-counter class="font-mono text-micro-caption text-primary-fixed font-semibold tracking-wide">Кадр -- / ${String(pool.length).padStart(2,"0")}</span><button type="button" data-vibe-skip class="font-micro-caption text-micro-caption text-text-muted hover:text-primary underline">Пропустить</button></div><div id="${winnerDetailId}"></div></div>`;
    const run=panel.querySelector(".kgr-run"),cells=[...run.children],viewport=panel.querySelector(".kgr-win"),frame=panel.querySelector("[data-vibe-reel-frame]"),skip=panel.querySelector("[data-vibe-skip]");
    const offsetFor=index=>reelPadding+index*reelStep+reelCellWidth/2-viewport.clientWidth/2;
    const start=offsetFor(0),finish=offsetFor(winnerIndex),total=pool.length;
    const complete=()=>{
      if(token!==state.spinToken||!panel.isConnected)return;
      state.spinning=false;state.skipSpin=false;
      cells.forEach((cell,index)=>{cell.classList.remove("spin");cell.classList.toggle("chosen",index===winnerIndex);});
      run.style.transform=`translateX(${-finish}px)`;
      panel.querySelector("[data-vibe-frame-counter]").textContent=`Кадр ${String(pool.indexOf(film)+1).padStart(2,"0")} / ${String(total).padStart(2,"0")}`;
      if(launchButton)launchButton.disabled=false;
      if(launchLabel)launchLabel.textContent=`Крутить ещё раз`;
      if(skip)skip.hidden=true;
      frame.classList.remove("hit");void frame.offsetWidth;frame.classList.add("hit");
      deps.openFilm(film,"mood",winnerDetailId);
      requestAnimationFrame(()=>{
        const d=document.getElementById(winnerDetailId);
        if(d&&moodId===state.mood)window.scrollTo({top:Math.max(0,window.scrollY+d.getBoundingClientRect().top-96),behavior:"smooth"});
      });
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
  function closeVibe(root,deps){
    stopSpin(root);state.token++;state.loading=false;state.autoSpin=null;
    deps.closeFilm("mood");
    if(host){host.remove();host=null;}
    [...root.children].forEach(el=>{if(el.dataset.vibeHidden){el.style.display=el.dataset.vibeHidden==="-"?"":el.dataset.vibeHidden;delete el.dataset.vibeHidden;}});
  }
  function openMood(id,root,deps){
    if(!moods.some(m=>m.id===id))return;
    if(!host||!host.isConnected){
      [...root.children].forEach(el=>{el.dataset.vibeHidden=el.style.display||"-";el.style.display="none";});
      host=document.createElement("div");host.id="mood-vibe-root";host.innerHTML="";
      host.addEventListener("click",e=>{handleClick(e,root,deps);});
      root.appendChild(host);
    }
    stopSpin(root);deps.closeFilm("mood");
    state.mood=id;state.runtime="any";state.country="all";state.films=[];state.shown=4;state.loadedKey="";state.page=0;state.totalPages=0;state.jobs=null;state.loading=false;state.autoSpin=null;
    host.innerHTML=`<style>#mood-vibe-root [hidden]{display:none!important}</style>`+detailHtml(currentMood());
    window.scrollTo({top:0});
    loadMood(host,deps);renderFilms(host,deps);
  }
  function handleClick(e,root,deps){
    if(e.target.closest("[data-vibe-all]")){closeVibe(root,deps);window.scrollTo({top:0});return;}
    if(e.target.closest('[data-act="close-film"]')){deps.closeFilm("mood");return;}
    const goto=e.target.closest("[data-vibe-goto]");
    if(goto){openMood(goto.dataset.vibeGoto,root,deps);return;}
    const country=e.target.closest("[data-vibe-country]");
    if(country){
      stopSpin(host);deps.closeFilm("mood");
      activeElement(host,"[data-vibe-result]")?.replaceChildren();
      state.country=country.dataset.vibeCountry;state.shown=4;
      renderFilms(host,deps);
      if(!filtered().length&&!state.loading&&state.page<state.totalPages)loadMood(host,deps);
      return;
    }
    if(e.target.closest("[data-vibe-spin]")){launch(host,deps);return;}
    if(e.target.closest("[data-vibe-skip]")){state.skipSpin=true;return;}
    if(e.target.closest("[data-vibe-retry]")){loadMood(host,deps);return;}
    if(e.target.closest("[data-vibe-more]")){
      state.shown+=4;
      if(split().rest.length<state.shown&&state.page<state.totalPages)loadMood(host,deps,state.shown+1);
      else renderFilms(host,deps);
      return;
    }
    const bm=e.target.closest("[data-vibe-bm]");
    if(bm){
      const id=Number(bm.dataset.vibeBm),on=deps.toggleBook?.(id);
      host.querySelectorAll(`[data-vibe-bm="${id}"] .material-symbols-outlined`).forEach(icon=>{icon.textContent=on?"bookmark_added":(icon.closest("[data-vibe-jewel]")?"bookmark_add":"bookmark_border");});
      return;
    }
    const film=e.target.closest("[data-vibe-film]");
    if(film){
      const item=state.films.find(f=>String(f.id)===film.dataset.vibeFilm);
      if(item)deps.openFilm(item,"mood",film.dataset.detailTarget);
    }
  }
  function stop(){if(host)stopSpin(host);}
  let bound=null;
  function init(root,deps){
    if(bound===root)return;
    bound=root;
    root.addEventListener("click",e=>{
      const pick=e.target.closest("[data-mood-select]");
      if(!pick||!pick.dataset.moodId||(host&&host.contains(pick)))return;
      e.stopImmediatePropagation();e.preventDefault();
      openMood(pick.dataset.moodId,root,deps);
    },true);
  }
  function reset(root,deps){if(host&&host.isConnected)closeVibe(root,deps);}
  window.KGMoodVibePage={init,reset,stop};
})();
