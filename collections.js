// ========== Bridge v7: «Подборки» (каталог + страница подборки + нижняя навигация) ==========
(function(){
const $=id=>document.getElementById(id);
const main=document.querySelector("main");
const home=main&&main.querySelector(":scope > div");
if(!home||typeof THEMES==="undefined"){console.error("[Kinoglobus] v7: движок не найден");return;}

/* ---------- стили ---------- */
const st=document.createElement("style");
st.textContent=".kgf{display:inline-flex;align-items:center;vertical-align:middle}.kgf img.flag-img{width:1.25em;height:.9em;object-fit:cover;border-radius:2px}.kgf svg{width:1.25em;height:.9em}.kgf .wave{width:auto;height:auto;flex:none}.kg-clip2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}";
document.head.appendChild(st);
const st2=document.createElement("style");
st2.textContent=`.kgr-win{position:relative;height:150px;overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 13%,#000 87%,transparent);mask-image:linear-gradient(90deg,transparent,#000 13%,#000 87%,transparent)}
.kgr-track{position:absolute;inset:0;overflow:hidden}
.kgr-run{position:absolute;left:0;top:0;height:100%;display:flex;align-items:center;gap:10px;padding-left:8px;will-change:transform}
.kgr-run.fast{filter:blur(1.4px) brightness(1.08)}
.kgr-cell{box-sizing:border-box;position:relative;flex:none;width:80px;height:112px;border-radius:6px;overflow:hidden;background:#221e26;border:1px solid #231f2e;opacity:.62;transition:opacity .45s,transform .45s,box-shadow .45s;color:#b3a79a;font-size:10px;line-height:1.2;pointer-events:none;user-select:none}
.kgr-cell img{width:100%;height:100%;object-fit:cover;display:block}
.kgr-cell .nop{width:100%;height:100%;display:flex;align-items:center;justify-content:center;text-align:center;padding:4px}
.kgr-cell.spin{opacity:.92}
.kgr-cell.chosen{opacity:1;transform:scale(1.07);box-shadow:0 0 22px rgba(255,184,48,.55)}
.kgr-cell .yr{position:absolute;left:0;right:0;bottom:0;background:rgba(0,0,0,.78);font:600 9px/1.4 ui-monospace,monospace;text-align:center;color:#b3a79a}
.kgr-frame{position:absolute;left:50%;top:50%;width:94px;height:128px;transform:translate(-50%,-50%);z-index:5;pointer-events:none;border:2px solid #ffb830;border-radius:10px;box-shadow:0 0 18px rgba(255,184,48,.5),inset 0 0 14px rgba(255,184,48,.22)}
.kgr-frame.hit{animation:kgrHit 1s cubic-bezier(.2,.8,.25,1)}
@keyframes kgrHit{0%{box-shadow:0 0 0 0 rgba(255,184,48,.8),inset 0 0 14px rgba(255,184,48,.22)}45%{box-shadow:0 0 38px 8px rgba(255,184,48,.75),inset 0 0 22px rgba(255,184,48,.4)}100%{box-shadow:0 0 18px rgba(255,184,48,.5),inset 0 0 14px rgba(255,184,48,.22)}}
.kgr-perf{display:flex;align-items:center;justify-content:space-between;padding:4px 8px;background:rgba(0,0,0,.6);overflow:hidden;user-select:none}
.kgr-perf div{display:flex;overflow:hidden}
.kgr-perf i{display:inline-block;width:10px;height:6px;border-radius:2px;background:#262626;border:1px solid #525252;margin-right:10px;flex:none}
.kgr-perf span{font:9px ui-monospace,monospace;letter-spacing:.1em;color:rgba(255,220,168,.4);text-transform:uppercase;white-space:nowrap;padding-left:8px}
.kgr-rise{animation:kgrRise .6s cubic-bezier(.2,.7,.2,1) both}
@keyframes kgrRise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.kg-clip3{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.kg-home-europe{scrollbar-width:none;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch}
.kg-home-europe::-webkit-scrollbar{display:none}
.kg-home-film{flex:0 0 9rem;scroll-snap-align:start}
.kg-detail-trailer{width:100%;height:auto;aspect-ratio:16/9;min-height:0;max-height:min(65vh,320px);flex:none}
@media(prefers-reduced-motion:reduce){.kgr-rise{animation:none}}`;
document.head.appendChild(st2);

/* ==========================================================================
   МАППИНГ ВСЕХ 44 АВТОРСКИХ КИНЕМАТОГРАФИЧНЫХ АРТ-ОБЛОЖЕК (16:9)
   Каждая подборка получает гарантированный кураторский визуал
   ========================================================================== */
const THEME_COVERS = {
  // 1. Азиатский блок
  kr: "assets /covers/kr.jpg",
  krdrama: "assets /covers/krdrama.jpg",
  jp: "assets /covers/jp.jpg",
  jhorror: "assets /covers/jhorror.jpg",
  jpauteur: "assets /covers/jpauteur.jpg",
  jpcrime: "assets /covers/jpcrime.jpg",
  jpscifi: "assets /covers/jpscifi.jpg",
  hk: "assets /covers/hk.jpg",
  cnfan: "assets /covers/cnfan.jpg",
  thhorror: "assets /covers/thhorror.jpg",
  idhorror: "assets /covers/idhorror.jpg",
  // 2. Индия и Ближний Восток
  inact: "assets /covers/inact.jpg",
  inromance: "assets /covers/inromance.jpg",
  inclassic: "assets /covers/inclassic.jpg",
  ir: "assets /covers/ir.jpg",
  tr: "assets /covers/tr.jpg",
  arabic: "assets /covers/arabic.jpg",
  // 3. Европейский блок
  nordic: "assets /covers/nordic.jpg",
  frnoir: "assets /covers/frnoir.jpg",
  frcom: "assets /covers/frcom.jpg",
  itcrime: "assets /covers/itcrime.jpg",
  itcom: "assets /covers/itcom.jpg",
  eshorror: "assets /covers/eshorror.jpg",
  esdrama: "assets /covers/esdrama.jpg",
  dedrama: "assets /covers/dedrama.jpg",
  gbdet: "assets /covers/gbdet.jpg",
  gbdrama: "assets /covers/gbdrama.jpg",
  pldrama: "assets /covers/pldrama.jpg",
  // 4. Постсоветский архив
  suwar: "assets /covers/suwar.jpg",
  sufi: "assets /covers/sufi.jpg",
  suanim: "assets /covers/suanim.jpg",
  uadrama: "assets /covers/uadrama.jpg",
  // 5. Америка и Латинская Америка
  uscrime: "assets /covers/uscrime.jpg",
  uswestern: "assets /covers/uswestern.jpg",
  uscomedy: "assets /covers/uscomedy.jpg",
  usdrama: "assets /covers/usdrama.jpg",
  ushorror: "assets /covers/ushorror.jpg",
  usscifi: "assets /covers/usscifi.jpg",
  usanimation: "assets /covers/usanimation.jpg",
  mxdrama: "assets /covers/mxdrama.jpg",
  latam: "assets /covers/latam.jpg",
  brazil: "assets /covers/brazil.jpg",
  // 6. Африка и Океания
  african: "assets /covers/african.jpg",
  auhorror: "assets /covers/auhorror.jpg"
};
function getThemeCover(id){
  return THEME_COVERS[id] || "";
}



/* ---------- данные подборок ---------- */
const CAT={noir:["Триллер и Нуар","NOIR • CRIME"],horror:["Ужасы и Мистика","HORROR • MYSTERY"],drama:["Драма и Авторское","DRAMA • AUTEUR"],action:["Экшен и Фэнтези","ACTION • FANTASY"],retro:["Историческое","RETRO • WAR"],comedy:["Комедия и Романтика","COMEDY • ROMANCE"],scifi:["Фантастика","SCI-FI • FUTURE"]};
// id: [категория, английское название, подпись в каталоге, описание]
const TM={
kr:["noir","Korean Thrillers","Шокирующие твисты, вендетта и запредельный саспенс","Шокирующие повороты, месть и психологический саспенс: корейское кино умеет держать в напряжении до последнего кадра."],
jp:["action","Japanese Animation","Философские шедевры Studio Ghibli, киберпанк и фэнтези","Философские истории студии Ghibli, киберпанк и фэнтези: рукотворные миры, в которые хочется возвращаться."],
jhorror:["horror","J-Horror","Кайданы, проклятия онрё и холодный ужас J-Horror","Тихий, медленный ужас: призраки-онрё, проклятые вещи и страх, живущий в самых обычных комнатах."],
eshorror:["horror","Spanish Horror","Готика, мокьюментари и мистические фамильные тайны","Готические приюты, мокьюментари и семейные тайны: испанский хоррор делает ставку на атмосферу."],
idhorror:["horror","Indonesian Horror","Оккультный фольклор, чёрная магия и бескомпромиссный шок","Деревенские легенды, чёрная магия и ритуалы: фольклорный ужас без компромиссов."],
nordic:["noir","Nordic Noir & Cold Thrillers","Ледяные загадки севера, меланхолия и глубокий реализм","Мрачные тайны северных фьордов, заснеженные пустоши, меланхоличные следователи и психологическая глубина классического скандинавского детектива."],
hk:["action","Hong Kong Action","Героическое кровопролитие, кунг-фу и золотая эра 80–90-х","Героическое кровопролитие, кунг-фу и перестрелки золотой эры гонконгского кино 80–90-х."],
ir:["drama","Iranian Cinema","Тонкий гуманизм, метафоры и триумфы Каннского фестиваля","Тонкий гуманизм, метафоры и бытовые драмы, отмеченные главными фестивалями мира."],
tr:["drama","Turkish Dramas","От медитативного артхауса до мощных фестивальных саг","От медитативного артхауса до мощных фестивальных саг о семье, долге и свободе."],
inact:["action","Indian Action","Масштабная масала, бешеная хореография и взрывной пафос","Масштабная масала: бешеная хореография, пафос и герои, которым подвластно всё."],
frnoir:["noir","French Noir","Классический полар Мельвиля и современный криминальный Париж","Полар Мельвиля и современный криминальный Париж: дождь, сигареты и неоднозначные герои."],
gbdet:["noir","British Detectives","Изящная логика, туманные поместья и виртуозный whodunit","Изящная логика, туманные поместья и классический whodunit в британском исполнении."],
itcrime:["noir","Italian Crime","Ярость полицаеско 70-х, неаполитанская мафия и закон чести","Полицаеско 70-х, неаполитанская мафия и закон чести: итальянский криминал без прикрас."],
thhorror:["horror","Thai Horror","Призраки мести, шаманизм и леденящие фотоплёнки","Призраки мести, шаманизм и холодный страх: тайский хоррор берёт традициями и атмосферой."],
auhorror:["horror","Australian Horror","Безжалостный аутбэк, клаустрофобия пустоты и чудовища","Безжалостный аутбэк, клаустрофобия пустоты и чудовища, которым негде спрятаться."],
suwar:["retro","Soviet War Cinema","«Иди и смотри», «Летят журавли», шедевры Бондарчука и Тарковского","Честные и пронзительные картины о войне: от «Летят журавли» до «Иди и смотри»."],
krdrama:["drama","Korean Dramas","Социальное расслоение, поэзия Ли Чхан Дона и глубокие чувства","Социальное расслоение, тихие трагедии и поэзия обыденности в корейском авторском кино."],
cnfan:["action","Chinese Fantasy","Полёты над бамбуковыми рощами, мифы уся и восточная магия","Полёты над бамбуковыми рощами, мифы уся и восточная магия."],
mxdrama:["drama","Mexican Dramas","Жар страстей, Иньярриту, Куарон и магический реализм","Жар страстей, Иньярриту, Куарон и магический реализм мексиканского кино."],
latam:["noir","Latin American Noir","Тайны фавел, коррупция мегаполисов и аргентинский саспенс","Тайны фавел, коррупция мегаполисов и аргентинский саспенс: латиноамериканский нуар."],
pldrama:["drama","Polish Cinema","Метафизика Кеслёвского, школа Вайды и тихая боль истории","Метафизические притчи Кеслёвского, польская кинематографическая школа и истории о памяти и выборе, снятые с редкой сдержанностью."],
dedrama:["drama","German Cinema","Новое немецкое кино, Херцог, Фассбиндер и тяжёлая память","От Нового немецкого кино Херцога и Фассбиндера до современных драм о памяти, вине и свободе."],
jpauteur:["drama","Japanese Auteur Cinema","Куросава, Одзу, Корээда: тишина, семья и человеческая хрупкость","Тихие семейные драмы Одзу, эпос Куросавы и тёплый гуманизм Корээды: японское кино, которое говорит паузами."],
gbdrama:["drama","British Drama","Социальный реализм, камерные истории и тонкая британская ирония","Социальный реализм, камерные истории и сдержанная ирония: британская драма о людях, которых редко замечают."],
esdrama:["drama","Spanish Drama","Страсти Альмодовара, память о войне и южное солнце","Страсти Альмодовара, память о гражданской войне и семейные драмы под южным солнцем."],
brazil:["drama","Brazilian Cinema","«Город Бога», улицы фавел и яркий социальный нерв","Бразильское кино: от уличной жестокости «Города Бога» до острых социальных драм и криминальных историй."],
uadrama:["drama","Ukrainian Cinema","Поэтическое кино, военные драмы и украинский взгляд на историю","От поэтического кино 1960-х до современных драм о войне и памяти: украинский взгляд на историю."],
frcom:["comedy","French Comedies","Остроумие, неловкие ситуации и лёгкость парижских улиц","От Луи де Фюнеса до современных хитов: французская комедия смешит остроумием и теплом."],
itcom:["comedy","Italian Comedies","Комедия по-итальянски: горькая ирония, семья и вечное солнце","Смех сквозь горечь, большие семьи и характеры, которые невозможно забыть: итальянская комедия."],
inromance:["comedy","Indian Romance","Песни, танцы, большие чувства и красочные свадьбы","Болливудская мелодрама: большие чувства, песни, танцы и любовь вопреки всему."],
sufi:["scifi","Soviet Sci-Fi","«Солярис», «Сталкер», «Кин-дза-дза!» и философия космоса","Философская и ироничная советская фантастика: космос, будущее и вопросы о том, что значит быть человеком."],
jpscifi:["scifi","Japanese Sci-Fi","Киберпанк, гигантские монстры и тревожное будущее","Японская фантастика: киберпанк, гигантские монстры и тревожные картины будущего."],
suanim:["retro","Soviet Animation","Рисованные сказки, кукольные шедевры и «Ёжик в тумане»","Рисованные и кукольные шедевры: тёплые сказки, философские притчи и мультфильмы, ставшие классикой."],
uswestern:["retro","Classic Western","Пыльные дороги, дуэли на рассвете и одинокие герои","Дуэли на рассвете, пыльные городки и одинокие герои: классический вестерн во всей красе."],
uscrime:["noir","American Crime & Thrillers","Голливудский нуар, громкие ограбления и напряжённые расследования","От нуарной классики до современных криминальных триллеров: роковые решения, ограбления и расследования по-американски."],
ushorror:["horror","American Horror","От классики Universal до слэшеров и современного хоррора","Монстры, слэшеры и психологический ужас: американское кино десятилетиями переизобретает жанр."],
usscifi:["scifi","American Science Fiction","Голливудские миры будущего, космические саги и научные загадки","Фантастика США — от масштабных космических историй до фильмов о технологиях, времени и будущем человечества."],
uscomedy:["comedy","American Comedies","Голливудские комедии — от классического фарса до современной сатиры","Романтические комедии, фарсы и сатира: лёгкий и разнообразный маршрут по американскому юмору."],
usdrama:["drama","American Drama","Большие семейные саги, независимое кино и сильные актёрские работы","Американская драма: от независимого кино и камерных историй до семейных саг и историй о переменах."],
usanimation:["action","American Animation","Золотой век анимации, студийные хиты и независимые мультфильмы","Американская анимация — от классических мультфильмов до авторских историй и современных студийных хитов."],
african:["drama","African Cinema","Кино ЮАР, Нигерии и Ганы: социальные истории и криминальные драмы","Африканское кино трех ярких индустрий — ЮАР, Нигерии и Ганы: социальные драмы и криминальные истории."],
arabic:["drama","Arab Cinema","Египет, Левант и Магриб: драмы и криминальные истории арабского мира","Подборка фильмов Египта, Ливана, Марокко, Туниса и Алжира: драмы и криминальные истории из разных уголков арабского мира."],
inclassic:["comedy","Indian Classics & Musicals","Золотой век Болливуда, музыкальные истории и большие чувства","Индийская классика и музыкальное кино: песни, танцы и истории любви, которые стали частью золотого века Болливуда."],
jpcrime:["noir","Japanese Crime Cinema","Якудза, полицейские расследования и мрачный японский нуар","Криминальное кино Японии: якудза, полицейские расследования и напряжённые истории о чести, власти и мести."]
};
const REG={nordic:["Скандинавия","NORD"],cnfan:["Китай, Гонконг","CN"],latam:["Латинская Америка","LATAM"],african:["Африка","AFR"],arabic:["Арабский мир","ARAB"]};
const ICON={nordic:"ac_unit"};
const T=Object.fromEntries(THEMES.map(t=>[t.id,t]));
const cat=t=>(TM[t.id]||["noir"])[0];

/* ---------- утилиты ---------- */
const fl=cc=>`<span class="kgf">${flag(cc,false)}</span>`;
const P=(p,s)=>p?`https://image.tmdb.org/t/p/${s||"w185"}${p}`:"";
const nf=n=>new Intl.NumberFormat("ru-RU").format(n);
const moneyFmt=new Intl.NumberFormat("ru-RU",{style:"currency",currency:"USD",maximumFractionDigits:0});
const moneyText=n=>Number(n)>0?moneyFmt.format(Number(n)):"Нет данных";
function fw(n){const m=n%100,k=n%10;return (k===1&&m!==11)?"фильм":(k>1&&k<5&&(m<12||m>14))?"фильма":"фильмов";}
const gnames=t=>t.g.split("|").map(x=>GENRES[x]).filter(Boolean);
const codeOf=t=>REG[t.id]?REG[t.id][1]:(t.cc[0]==="SU"?"СССР":t.cc[0]);
const where=t=>REG[t.id]?REG[t.id][0]:cname(t.cc[0]);
const flagsOf=t=>t.cc.slice(0,3).map(fl).join(" ");
const BOOK=new Set(store.get("kgBookmarks",[]));
function toast(msg,icon){
  let el=$("kg-toast");
  if(!el){el=document.createElement("div");el.id="kg-toast";el.className="fixed bottom-20 left-1/2 -translate-x-1/2 max-w-[90vw] z-50 pointer-events-none opacity-0 transition-opacity duration-300";document.body.appendChild(el);}
  el.innerHTML=`<div class="flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface-panel text-on-surface font-label-sm text-label-sm shadow-[0_8px_24px_rgba(0,0,0,0.9)]"><span class="material-symbols-outlined text-primary-container text-[18px]">${icon||"casino"}</span><span>${esc(msg)}</span></div>`;
  el.style.opacity="1";clearTimeout(el._t);el._t=setTimeout(()=>el.style.opacity="0",2200);
}

/* ---------- загрузка данных TMDB ---------- */
const floorOf=cc=>BIG.has(cc)?300:60;
const qs=(t,cc)=>({with_origin_country:cc,with_genres:t.g,"vote_count.gte":floorOf(cc),"vote_average.gte":"6.5"});
const russianText=text=>{
  if(!text)return "";
  const value=String(text),ru=(value.match(/[А-Яа-яЁё]/g)||[]).length,latin=(value.match(/[A-Za-z]/g)||[]).length;
  return ru>=3&&ru>latin?value:"";
};
const DAY_MS=24*60*60*1000;
const themeDataCache=new Map(),themeRetryAfter=new Map(),themeInflight=new Map(),metaRetryAfter=new Map(),metaInflight=new Map();
const themeDataKey=(t,pages)=>`${t.id}:${pages}:${playMode!=="surprise"&&(sel.has("adult")||sel.has("erotic"))?"adult":"all"}`;
async function loadTheme(t,pages,force=false){
  const key=themeDataKey(t,pages),cached=themeDataCache.get(key),now=Date.now();
  if(!force&&cached&&now-cached.ts<DAY_MS)return cached.data;
  if(!force&&(themeRetryAfter.get(key)||0)>now){
    if(cached)return {...cached.data,_stale:true};
    throw new Error("Подборка временно недоступна для обновления.");
  }
  const active=themeInflight.get(key);
  if(active){
    if(!force||active.fresh)return active.promise;
    try{await active.promise;}catch{}
    return loadTheme(t,pages,true);
  }
  const promise=(async()=>{
    const jobs=[];
    t.cc.forEach(cc=>{for(let p=1;p<=pages;p++)jobs.push(api({...qs(t,cc),page:p},{fresh:force}).then(r=>({cc,p,total:r.total_results||0,films:(r.results||[]).map(f=>({...f,_cc:cc}))})));});
    try{
      const parts=await Promise.all(jobs);
      const aggregate=selected=>{
        const totals={},ids=new Set();let films=[];
        selected.forEach(x=>{if(x.p===1)totals[x.cc]=x.total;films.push(...x.films.filter(f=>!ids.has(f.id)&&ids.add(f.id)));});
        const total=Object.values(totals).reduce((a,b)=>a+b,0);
        films.sort((a,b)=>weighed(b)-weighed(a));
        return {total,totals,films};
      };
      const data=aggregate(parts);
      const refreshedAt=Date.now(),date=localDateKey();
      themeDataCache.set(key,{data,ts:refreshedAt,date});themeRetryAfter.delete(key);
      if(pages>1)themeDataCache.set(themeDataKey(t,1),{data:aggregate(parts.filter(x=>x.p===1)),ts:refreshedAt,date});
      return data;
    }catch(error){
      themeRetryAfter.set(key,Date.now()+15*60*1000);
      if(cached){console.warn(`[Kinoglobus] Обновление подборки «${t.name}» не удалось; показываем сохранённые данные.`,error);return {...cached.data,_stale:true};}
      throw error;
    }
  })();
  const entry={promise,fresh:force};themeInflight.set(key,entry);
  try{return await promise;}finally{if(themeInflight.get(key)===entry)themeInflight.delete(key);}
}
const META=store.get("kgThemeMeta",{});
const FRESH=DAY_MS;
function saveThemeMeta(t,d){
  const top=d.films.slice(0,10);
  const r=top.length?top.reduce((s,f)=>s+Number(f.vote_average||0),0)/top.length:0;
  const meta={n:d.total,r:r?r.toFixed(1):"",p:(d.films.find(f=>f.poster_path)||{}).poster_path||"",b:(d.films.find(f=>f.backdrop_path)||{}).backdrop_path||"",ts:Date.now()};
  META[t.id]=meta;store.set("kgThemeMeta",META);return meta;
}
async function loadMeta(t,force=false){
  if(metaInflight.has(t.id))return metaInflight.get(t.id);
  const m=META[t.id];
  if(!force&&m&&Date.now()-m.ts<FRESH)return m;
  if((metaRetryAfter.get(t.id)||0)>Date.now()){if(m)return m;throw new Error("Метаданные подборки временно недоступны.");}
  const request=(async()=>{
    try{
      const d=await loadTheme(t,1,force);
      if(d._stale){if(m&&!force)return m;throw new Error("Метаданные подборки временно недоступны.");}
      const meta=saveThemeMeta(t,d);metaRetryAfter.delete(t.id);
      return meta;
    }catch(error){metaRetryAfter.set(t.id,Date.now()+15*60*1000);throw error;}
  })();
  metaInflight.set(t.id,request);
  try{return await request;}finally{metaInflight.delete(t.id);}
}

/* ---------- экраны и навигация ---------- */
const vc=document.createElement("div");vc.id="view-collections";
vc.className="flex flex-col w-full px-gutter-mobile gap-space-lg select-none";vc.style.display="none";
const vd=document.createElement("div");vd.id="view-collection";
vd.className="flex flex-col w-full px-margin-mobile gap-space-lg select-none pb-space-xl";vd.style.display="none";
const vm=document.createElement("div");vm.id="view-mood";
vm.className="flex flex-col w-full px-gutter-mobile select-none";vm.style.display="none";
const vo=document.createElement("div");vo.id="view-oscar";
vo.className="flex flex-col w-full select-none";vo.style.display="none";
const sectionNav=document.createElement("nav");
sectionNav.setAttribute("aria-label","Разделы подборок");
sectionNav.className="w-full px-gutter-mobile pt-2";
sectionNav.style.display="none";
sectionNav.innerHTML='<div class="grid grid-cols-3 gap-1.5 rounded-xl bg-surface-panel p-1.5">'+
[["collections","Коллекции"],["mood","Коллекция по настроению"],["oscar","Оскар"]]
.map(([route,label])=>`<button type="button" data-collection-route="${route}" aria-current="false" class="min-w-0 px-1.5 py-2 rounded-lg text-text-muted hover:text-primary font-micro-caption text-micro-caption leading-tight">${label}</button>`).join("")+
"</div>";
home.after(sectionNav);sectionNav.after(vc);vc.after(vd);vd.after(vm);vm.after(vo);

const NB="flex flex-col items-center justify-center gap-1 min-w-[64px] h-12 transition-all active:scale-95 ";
const NON="text-primary-container font-bold drop-shadow-[0_0_12px_rgba(255,184,48,0.45)]",NOFF="text-text-muted";
const nav=document.createElement("nav");
nav.className="fixed bottom-0 w-full z-50 pb-safe bg-surface-panel/90 backdrop-blur-xl shadow-[0_-4px_24px_rgba(7,6,10,0.9)]";
nav.innerHTML='<div class="flex justify-around items-center h-16 max-w-[520px] mx-auto px-gutter-mobile">'+
[["home","casino","Глобус"],["collections","movie_filter","Подборки"],["journey","travel_explore","Путешествие"],["journey","history_toggle_off","История"]]
.map(([v,i,l])=>`<a href="#" data-view="${v}" class="${NB}${NOFF}"><span class="material-symbols-outlined text-[22px]">${i}</span><span class="font-micro-caption text-micro-caption tracking-tight">${l}</span></a>`).join("")+"</div>";
document.body.appendChild(nav);

let view="home";
function showView(v){
  if(v!=="mood"&&window.KGMoodPage)window.KGMoodPage.stop(vm);
  if(v!=="oscar"&&window.KGOscarPage&&window.KGOscarPage.stop)window.KGOscarPage.stop(vo);
  view=v;
  if(v!=="collection")rStop();
  if(D.selected&&["mood","oscar"].includes(D.selected._placement)&&D.selected._placement!==v){
    const oldTarget=$(D.selected._detailTarget)||(D.selected._placement==="mood"?$("mood-film-detail"):$("oscar-film-detail"));
    if(oldTarget)oldTarget.replaceChildren();
    D.selected=null;
  }
  home.style.display=v==="home"?"":"none";
  sectionNav.style.display=["collections","collection","mood","oscar"].includes(v)?"":"none";
  vc.style.display=v==="collections"?"":"none";
  vd.style.display=v==="collection"?"":"none";
  vm.style.display=v==="mood"?"":"none";
  vo.style.display=v==="oscar"?"":"none";
  const act=["collection","mood","oscar"].includes(v)?"collections":v;
  nav.querySelectorAll("[data-view]").forEach(a=>{a.className=NB+(a.dataset.view===act&&a.dataset.view!=="journey"?NON:NOFF);});
  const section=v==="collection"?"collections":v;
  sectionNav.querySelectorAll("[data-collection-route]").forEach(button=>{
    const active=button.dataset.collectionRoute===section;
    button.className=`min-w-0 px-1.5 py-2 rounded-lg font-micro-caption text-micro-caption leading-tight ${active?"bg-primary-container text-on-primary-container font-semibold":"text-text-muted hover:text-primary"}`;
    button.setAttribute("aria-current",String(active));
  });
  const sub=document.querySelector("header .flex-col > p");
  if(sub) sub.textContent=v==="home"?"Случайная страна · Лучшие фильмы":v==="mood"?"Подборки · По настроению":v==="oscar"?"Подборки · Зал славы Оскара":"Киноглобус — Тематическая Подборка";
  scrollTo({top:0});
  if(v==="collections") initCatalog();
  if(v==="mood"&&(!vm.dataset.ready||vm.dataset.key!==apiKey)){window.KGMoodPage.render(vm,pageDeps);vm.dataset.ready="true";vm.dataset.key=apiKey;}
  if(v==="oscar"&&(!vo.dataset.ready||vo.dataset.key!==apiKey)){window.KGOscarPage.render(vo,pageDeps);vo.dataset.ready="true";vo.dataset.key=apiKey;}
}
nav.addEventListener("click",e=>{
  const a=e.target.closest("[data-view]");if(!a)return;e.preventDefault();
  if(a.dataset.view==="journey"){$("mapBtn").click();return;}
  showView(a.dataset.view);
});
sectionNav.addEventListener("click",e=>{
  const button=e.target.closest("[data-collection-route]");
  if(button)showView(button.dataset.collectionRoute);
});

/* ================= КАТАЛОГ ================= */
let catBuilt=false,activeCat="all",sortMode="curated";
function spotlightTheme(){return THEMES[Math.floor(Date.now()/6048e5)%THEMES.length];}

function cardHtml(t,i){
  const m=TM[t.id]||["noir","","",""],special=t.id==="suwar";
  const g0=gnames(t)[0]||"";
  const top=special?`<div class="flex items-center justify-between mb-2"><span class="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container/60 text-secondary font-micro-caption text-micro-caption font-bold"><span class="material-symbols-outlined text-[13px]">history_edu</span>АРХИВ ИСЧЕЗНУВШИХ ЭПОХ</span><span data-k="r" class="font-micro-caption text-micro-caption text-primary-container font-bold">★ …</span></div>`:"";
  const rate=special?"":`<span data-k="r" class="px-2 py-0.5 rounded-full bg-primary-container/15 text-primary-container font-micro-caption text-micro-caption font-bold flex-shrink-0">★ …</span>`;
  const btn=`<button type="button" aria-label="Крутить" data-act="spin" data-t="${t.id}" class="w-8 h-8 rounded-full bg-surface-container-high hover:bg-primary-container hover:text-on-primary-container text-primary flex items-center justify-center transition-all"><span class="material-symbols-outlined text-[18px]">casino</span></button>`;
  return `<article class="collection-card relative flex flex-col ${special?"p-4 bg-gradient-to-br from-cinema-velvet-deep/40 via-surface-panel to-surface-panel shadow-[0_6px_24px_rgba(0,0,0,0.6)]":"p-3.5 bg-surface-panel shadow-[0_4px_20px_rgba(0,0,0,0.45)]"} rounded-2xl transition-all active:scale-[0.99] cursor-pointer" data-t="${t.id}" data-cat="${m[0]}" data-i="${i}">
${top}<div class="flex items-start gap-3">
<div class="relative w-20 h-28 rounded-lg overflow-hidden shrink-0 bg-surface-container-high"><img data-k="img" alt="${esc(t.name)}" src="${getThemeCover(t.id)}" class="w-full h-full object-cover transition-opacity duration-500 ${special?"grayscale contrast-125":""} ${getThemeCover(t.id)?"":"opacity-0"}"><span class="absolute bottom-1 right-1 px-1.5 rounded bg-surface-container-lowest/80 text-[10px] font-bold text-primary">${esc(codeOf(t))}</span></div>
<div class="flex flex-col min-w-0 flex-1 justify-between h-28"><div>
<div class="flex items-center justify-between gap-1"><span class="font-micro-caption text-micro-caption text-text-muted flex items-center gap-1 truncate">${flagsOf(t)} ${esc(where(t))}</span>${rate}</div>
<h4 class="font-headline-sm text-headline-sm text-primary font-bold truncate mt-0.5">${i+1}. ${esc(t.name)}</h4>
<p class="font-micro-caption text-micro-caption text-on-surface-variant ${special?"kg-clip2":"truncate"} mt-0.5">${esc(m[2])}</p></div>
<div class="flex items-center justify-between pt-1"><span data-k="cnt" class="font-label-sm text-label-sm text-text-muted truncate">… · ${esc(g0)}</span>${btn}</div>
</div></div></article>`;
}

function spotlightHtml(t){
  const m=TM[t.id]||["noir","","",""];
  return `<section id="spot" data-t="${t.id}" tabindex="0" aria-label="Открыть подборку «${esc(t.name)}»" class="relative w-full rounded-2xl overflow-hidden bg-surface-panel shadow-[0_14px_34px_-10px_rgba(0,0,0,0.85)] cursor-pointer">
<div data-k="bg" style="background-image: url('${getThemeCover(t.id)}');" class="w-full h-56 bg-cover bg-center relative bg-surface-container-high"><div class="absolute inset-0 bg-gradient-to-t from-surface-panel via-surface-panel/60 to-transparent"></div>
<div class="absolute top-3 left-3 right-3 flex items-center justify-between"><div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cinema-velvet-deep text-secondary font-micro-caption text-micro-caption shadow-md"><span class="material-symbols-outlined text-[14px]">local_fire_department</span>ХИТ НЕДЕЛИ</div>
<div class="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-lowest/80 backdrop-blur-md text-primary font-label-sm text-label-sm"><span class="material-symbols-outlined text-[15px] text-primary-container" style="font-variation-settings:'FILL' 1;">star</span><span data-k="r">…</span></div></div>
<div class="absolute bottom-3 left-3.5 right-3.5 flex items-center gap-1.5"><span class="px-2 py-0.5 rounded-full bg-surface-container-high/90 backdrop-blur text-primary font-micro-caption text-micro-caption tracking-wider">${t.cc.map(fl).join(" ")}</span><span class="font-micro-caption text-micro-caption text-text-muted truncate">${esc(t.cc.map(cname).join(", "))}</span></div></div>
<div class="p-4 flex flex-col gap-2.5"><div class="flex items-baseline justify-between"><h3 class="font-headline-md text-headline-md text-primary font-bold">${esc(t.name)}</h3><span data-k="cnt" class="font-micro-caption text-micro-caption text-text-muted">…</span></div>
<p class="font-body-sm text-body-sm text-text-muted kg-clip2">${esc(m[3])}</p>
<div class="flex items-center gap-2 pt-1"><button type="button" data-act="spin" data-t="${t.id}" class="flex-1 h-11 px-4 rounded-xl bg-primary-container text-on-primary-container font-label-md text-label-md flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,184,48,0.32)] transition-transform active:scale-95"><span class="material-symbols-outlined text-[20px]">casino</span><span>Крутить рулетку</span></button>
<button type="button" aria-label="Подробнее" data-act="open" data-t="${t.id}" class="w-11 h-11 rounded-xl bg-surface-container-high text-primary flex items-center justify-center transition-colors hover:bg-surface-bright active:scale-95"><span class="material-symbols-outlined text-[20px]">arrow_forward</span></button></div></div></section>`;
}
function updateWeeklySpotlight(){
  const spot=$("spot"),selected=spotlightTheme();
  if(!spot||spot.dataset.t===selected.id)return;
  spot.outerHTML=spotlightHtml(selected);
  paintMeta(selected.id);
}

const CHON="bg-primary-container text-on-primary-container shadow-[0_0_14px_rgba(255,184,48,0.28)]",CHOFF="bg-surface-panel text-text-muted hover:text-on-surface";
function chipCls(on){return "filter-chip flex items-center gap-1.5 px-3.5 py-2 rounded-full font-label-sm text-label-sm shrink-0 transition-all active:scale-95 "+(on?CHON:CHOFF);}

function buildCatalog(){
  const counts={};THEMES.forEach(t=>counts[cat(t)]=(counts[cat(t)]||0)+1);
  vc.innerHTML=`
<section class="flex flex-col gap-space-xs mt-1">
<div class="flex items-center justify-between"><span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-primary-container font-label-sm text-label-sm shadow-[0_0_14px_rgba(255,184,48,0.18)]"><span class="material-symbols-outlined text-[15px]" style="font-variation-settings:'FILL' 1;">auto_awesome</span>Кураторский киногид</span>
<span class="font-micro-caption text-micro-caption text-text-muted flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>${THEMES.length} доступно</span></div>
<h2 class="font-headline-lg text-headline-lg text-primary tracking-tight">Тематические коллекции</h2>
<p class="font-body-sm text-body-sm text-text-muted leading-relaxed">${THEMES.length} авторских киномаршрутов: от азиатского саспенса и скандинавского холода до исторических эпох</p>
<div class="relative w-full mt-2"><div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted"><span class="material-symbols-outlined text-[20px]">search</span></div>
<input id="cat-search" type="search" placeholder="Найти подборку, страну или жанр..." class="w-full h-12 pl-11 pr-10 rounded-xl bg-surface-container-low text-on-surface placeholder:text-text-muted font-body-sm text-body-sm focus:outline-none focus:bg-surface-container transition-all shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
<div id="cat-clear" data-act="clear" style="display:none" class="absolute inset-y-0 right-0 pr-3 items-center cursor-pointer text-text-muted hover:text-primary"><span class="material-symbols-outlined text-[18px]">cancel</span></div></div>
</section>
<section id="cat-chips" class="flex gap-2 overflow-x-auto pb-1 -mx-gutter-mobile px-gutter-mobile">
<button type="button" data-f="all" class="${chipCls(true)}"><span>Все ${THEMES.length}</span></button>
${Object.keys(CAT).filter(k=>counts[k]).map(k=>`<button type="button" data-f="${k}" class="${chipCls(false)}"><span>${CAT[k][0]} (${counts[k]})</span></button>`).join("")}</section>
${spotlightHtml(spotlightTheme())}
<section class="flex items-center justify-between gap-2"><div class="flex items-center gap-1.5 bg-surface-panel px-3 py-1.5 rounded-xl"><span class="material-symbols-outlined text-[17px] text-text-muted">swap_vert</span>
<select id="cat-sort" class="bg-transparent text-text-muted font-label-sm text-label-sm focus:outline-none focus:text-primary cursor-pointer"><option class="bg-surface-panel text-on-surface" value="curated">По кураторскому списку</option><option class="bg-surface-panel text-on-surface" value="rating">По рейтингу (высокий)</option><option class="bg-surface-panel text-on-surface" value="count">По числу фильмов</option><option class="bg-surface-panel text-on-surface" value="title">По алфавиту</option></select></div>
<button type="button" data-act="random" class="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary-container text-on-secondary-container font-label-sm text-label-sm shadow-[0_0_14px_rgba(134,26,69,0.25)] transition-all active:scale-95"><span class="material-symbols-outlined text-[18px]">casino</span><span>Случайная</span></button></section>
<p id="cat-note" class="font-micro-caption text-micro-caption text-text-muted px-1" style="display:none"></p>
<section id="cat-grid" class="flex flex-col gap-3">${THEMES.map(cardHtml).join("")}</section>
<div id="cat-empty" style="display:none" class="flex-col items-center justify-center py-12 px-4 text-center rounded-2xl bg-surface-panel/50"><div class="w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center text-primary-container mb-3 shadow-[0_0_18px_rgba(255,184,48,0.2)]"><span class="material-symbols-outlined text-[28px]">movie_edit</span></div><h3 class="font-headline-sm text-headline-sm text-primary font-bold">Подборка не найдена</h3><p class="font-body-sm text-body-sm text-text-muted mt-1 max-w-xs">Попробуйте другое ключевое слово или выберите «Все ${THEMES.length}», чтобы сбросить фильтр.</p><button type="button" data-act="reset" class="mt-4 px-4 py-2 rounded-xl bg-primary-container text-on-primary-container font-label-sm text-label-sm font-bold shadow-[0_0_12px_rgba(255,184,48,0.25)]">Сбросить поиск</button></div>`;
  catBuilt=true;
}

function paintMeta(id){
  const m=META[id];if(!m)return;
  const customArt = getThemeCover(id);
  document.querySelectorAll(`#view-collections [data-t="${id}"]`).forEach(el=>{
    if(el.id==="spot"){
      const bg=el.querySelector('[data-k="bg"]');
      // Приоритет отдаётся авторской широкоформатной арт-обложке
      const src=customArt || (m.b?P(m.b,"w780"):P(m.p,"w500"));
      if(src) bg.style.backgroundImage=`url('${src}')`;
    }
    const r=el.querySelector('[data-k="r"]');
    if(r){const sp=el.id==="spot";r.textContent=sp?(m.r||"—"):(el.dataset.cat==="retro"&&el.classList.contains("collection-card")?"★ "+(m.r||"—"):"★ "+(m.r||"—"));}
    const c=el.querySelector('[data-k="cnt"]');
    if(c){const g=gnames(T[id])[0]||"";c.textContent=el.id==="spot"?`${nf(m.n)} ${fw(m.n)}`:`${nf(m.n)} ${fw(m.n)}${g?" · "+g:""}`;}
    const img=el.querySelector('[data-k="img"]');
    if(img){
      // Сохраняем авторскую кураторскую обложку вместо случайного первого постера
      if(customArt){
        img.src = customArt;
        img.classList.remove("opacity-0");
      } else if(m.p){
        img.onload=()=>img.classList.remove("opacity-0");
        img.src=P(m.p,"w185");
      }
    }
  });
}
function filterCatalog(){
  const q=($("cat-search").value||"").toLowerCase().trim();
  let vis=0;
  vc.querySelectorAll(".collection-card").forEach(c=>{
    const t=T[c.dataset.t],m=TM[t.id]||[];
    const hay=[t.name,m[1],m[2],t.cc.map(cname).join(" "),gnames(t).join(" ")].join(" ").toLowerCase();
    const ok=(activeCat==="all"||c.dataset.cat===activeCat)&&(!q||hay.includes(q));
    c.style.display=ok?"":"none";if(ok)vis++;
  });
  $("cat-empty").style.display=vis?"none":"flex";
}
function sortCatalog(){
  const grid=$("cat-grid");if(!grid)return;const cards=[...grid.children];
  cards.sort((a,b)=>{
    const ma=META[a.dataset.t]||{},mb=META[b.dataset.t]||{};
    if(sortMode==="rating")return (parseFloat(mb.r)||0)-(parseFloat(ma.r)||0);
    if(sortMode==="count")return (mb.n||0)-(ma.n||0);
    if(sortMode==="title")return T[a.dataset.t].name.localeCompare(T[b.dataset.t].name,"ru");
    return a.dataset.i-b.dataset.i;
  }).forEach(c=>grid.appendChild(c));
}
async function loadAllMeta(force=false){
  const note=$("cat-note");
  if(!apiKey){if(note){note.textContent="Введите ключ TMDB на экране «Глобус», чтобы увидеть число фильмов и рейтинги подборок.";note.style.display="";}return false;}
  if(note)note.style.display="none";
  const results=await Promise.allSettled(THEMES.map(t=>loadMeta(t,force).then(()=>{if(catBuilt)paintMeta(t.id);})));
  if(sortMode!=="curated")sortCatalog();
  return results.every(r=>r.status==="fulfilled");
}
function initCatalog(){
  if(!catBuilt)buildCatalog();
  updateWeeklySpotlight();
  THEMES.forEach(t=>paintMeta(t.id));
  if(!dailyRefreshPromise)loadAllMeta();
}
vc.addEventListener("input",e=>{
  if(e.target.id==="cat-search"){$("cat-clear").style.display=e.target.value?"flex":"none";filterCatalog();}
});
vc.addEventListener("change",e=>{if(e.target.id==="cat-sort"){sortMode=e.target.value;sortCatalog();}});
vc.addEventListener("click",e=>{
  const route=e.target.closest("[data-collection-route]");
  if(route){showView(route.dataset.collectionRoute);return;}
  const chip=e.target.closest("#cat-chips [data-f]");
  if(chip){activeCat=chip.dataset.f;vc.querySelectorAll("#cat-chips [data-f]").forEach(c=>c.className=chipCls(c===chip));filterCatalog();return;}
  const act=e.target.closest("[data-act]");
  if(act){
    const a=act.dataset.act;
    if(a==="spin"){e.stopPropagation();openCollection(act.dataset.t,{spin:true});return;}
    if(a==="open"){openCollection(act.dataset.t);return;}
    if(a==="clear"||a==="reset"){$("cat-search").value="";$("cat-clear").style.display="none";activeCat="all";vc.querySelectorAll("#cat-chips [data-f]").forEach(c=>c.className=chipCls(c.dataset.f==="all"));filterCatalog();return;}
    if(a==="random"){
      const vis=[...vc.querySelectorAll(".collection-card")].filter(c=>c.style.display!=="none");
      if(!vis.length)return;
      const c=pick(vis);c.scrollIntoView({behavior:"smooth",block:"center"});
      c.classList.add("ring-2","ring-primary-container");setTimeout(()=>c.classList.remove("ring-2","ring-primary-container"),1800);
      toast("Выбрано: «"+T[c.dataset.t].name+"»!");return;
    }
  }
  const spot=e.target.closest("#spot");
  if(spot&&!e.target.closest("[data-act]")){openCollection(spot.dataset.t);return;}
  const card=e.target.closest(".collection-card");
  if(card)openCollection(card.dataset.t);
});
vc.addEventListener("keydown",e=>{
  if(e.target.id!=="spot"||(e.key!=="Enter"&&e.key!==" "))return;
  e.preventDefault();openCollection(e.target.dataset.t);
});

/* ================= СТРАНИЦА ПОДБОРКИ ================= */
let D={t:null,all:[],total:0,totals:{},cc:"",sort:"rating",shown:5,selected:null,picked:null};
async function markPageWatched(film){
  const details=await filmDetails(film.id).catch(()=>null);
  const cc=(film.origin_country||[])[0]||(details&&details.countries||[])[0]||"";
  if(!seen.has(film.id)){
    seen.add(film.id);store.set("seen",[...seen]);
    if(cc){
      visited[cc]=(visited[cc]||0)+1;lastCC=cc;
      store.set("visited",visited);store.set("lastCC",lastCC);
    }
  }
  if(!watched.some(item=>item.id===film.id)){
    watched.unshift(filmRecord(cc,film));store.set("watched",watched);
  }
  updHist();
}
function closePageFilm(placement){
  const selected=D.selected&&D.selected._placement===placement?D.selected:null;
  if(selected)D.selected=null;
  const target=$(selected?._detailTarget)||(placement==="mood"?$("mood-film-detail"):$("oscar-film-detail"));
  if(target)target.replaceChildren();
}
const pageDeps={
  api:(params)=>api(params),
  details:id=>filmDetails(id),
  getFilms:()=>oscarFilms(),
  hasKey:()=>Boolean(apiKey),
  countryName:cc=>cname(cc),
  isWatched:id=>watched.some(item=>item.id===Number(id)),
  markWatched:film=>markPageWatched(film),
  openFilm:(film,placement,detailTarget)=>openFilm(film,placement,detailTarget),
  closeFilm:placement=>closePageFilm(placement),
  refreshFilm:()=>renderSelectedPanel(),
  back:()=>showView("collections")
};
const CCON="bg-primary-container text-on-primary shadow-[0_0_12px_rgba(255,184,48,0.28)] font-semibold",CCOFF="bg-surface-container text-text-muted hover:text-on-surface";
const SON="bg-surface-container-high text-primary-fixed font-semibold",SOFF="text-text-muted hover:text-on-surface";
const ccCls=on=>"h-[34px] px-3 rounded-full font-label-sm text-label-sm flex-shrink-0 transition-colors "+(on?CCON:CCOFF);
const sCls=on=>"px-2.5 py-1 rounded font-micro-caption text-micro-caption "+(on?SON:SOFF);

function derived(){
  const a=D.all.filter(f=>!D.cc||f._cc===D.cc);
  const best=a.slice().sort((x,y)=>weighed(y)-weighed(x))[0];
  const rest=a.filter(f=>f!==best);
  rest.sort((x,y)=>D.sort==="pop"?(y.popularity||0)-(x.popularity||0):D.sort==="new"?String(y.release_date||"").localeCompare(String(x.release_date||"")):Number(y.vote_average)-Number(x.vote_average));
  return {best,rest};
}
const totalFor=()=>D.cc?(D.totals[D.cc]||0):D.total;
const byId=id=>D.all.find(f=>String(f.id)===String(id));

function filmItem(f){
  const y=(f.release_date||"").slice(0,4),bm=BOOK.has(f.id);
  const gs=(f.genre_ids||[]).map(i=>GENRES[i]).filter(Boolean).slice(0,2);
  const selected=D.selected&&D.selected._placement==="list"&&String(D.selected.id)===String(f.id)?D.selected:null;
  return `<article class="flex flex-col gap-space-sm p-3 rounded-xl bg-surface-panel shadow-md hover:bg-surface-container-low transition-colors">
<div class="flex gap-space-sm cursor-pointer" data-act="open" data-id="${f.id}">
<div class="relative w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-surface-container-high">${f.poster_path?`<img class="w-full h-full object-cover" loading="lazy" alt="" src="${P(f.poster_path,"w185")}">`:`<div class="w-full h-full flex items-center justify-center text-text-muted"><span class="material-symbols-outlined">movie</span></div>`}
<span class="absolute top-1 left-1 px-1 py-0.5 rounded bg-surface-panel/90 text-primary-container font-micro-caption text-micro-caption font-bold">${Number(f.vote_average).toFixed(1)} ★</span></div>
<div class="flex flex-col justify-between flex-1 min-w-0"><div class="flex flex-col gap-0.5">
<div class="flex items-center justify-between"><span class="font-micro-caption text-micro-caption text-text-muted">${fl(f._cc)} ${esc(cname(f._cc))}${y?" • "+y:""}</span><span data-rt="${f.id}" class="font-micro-caption text-micro-caption px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant">— мин</span></div>
<h4 class="font-label-lg text-label-lg text-on-surface font-bold truncate">${esc(f.title)}</h4>
<p data-dir="${f.id}" class="font-micro-caption text-micro-caption text-text-muted truncate">&nbsp;</p>
<div class="flex items-center gap-1.5 pt-1">${gs.map(g=>`<span class="px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-micro-caption text-micro-caption">${esc(g)}</span>`).join("")}</div></div></div>
<div class="flex items-center justify-end gap-2 pt-2">
<button type="button" data-act="bm" data-id="${f.id}" title="В закладки" class="text-primary-container hover:text-primary transition-colors p-1"><span class="material-symbols-outlined text-[18px]">${bm?"bookmark_added":"bookmark_border"}</span></button></div>
${selected?selectedFilmHtml(selected,true):""}</article>`;
}
function pearlHtml(f,selected=null){
  const y=(f.release_date||"").slice(0,4),bm=BOOK.has(f.id);
  return `<div class="flex flex-col gap-space-xs"><div class="flex items-center gap-1.5 px-1"><span class="material-symbols-outlined text-[18px] text-primary-container">stars</span><h3 class="font-headline-sm text-headline-sm text-primary font-bold">Жемчужина коллекции</h3></div>
<div class="relative overflow-hidden rounded-xl bg-surface-panel p-space-md shadow-xl flex flex-col gap-space-md"><div class="flex gap-space-md cursor-pointer" data-act="open" data-id="${f.id}">
<div class="relative flex-shrink-0 w-28 h-40 rounded-lg overflow-hidden bg-surface-container-high shadow-md">${f.poster_path?`<img class="w-full h-full object-cover" alt="" src="${P(f.poster_path,"w342")}">`:""}
<div class="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-surface-panel/90 backdrop-blur-md text-primary-container font-label-sm text-label-sm font-bold flex items-center gap-0.5"><span class="material-symbols-outlined text-[13px]" style="font-variation-settings:'FILL' 1;">star</span>${Number(f.vote_average).toFixed(1)}</div></div>
<div class="flex flex-col justify-between flex-1 min-w-0"><div class="flex flex-col gap-1">
<div class="flex items-center gap-1.5"><span class="font-micro-caption text-micro-caption px-1.5 rounded bg-surface-container text-on-surface-variant">${fl(f._cc)} ${y}</span><span data-rt="${f.id}" class="font-micro-caption text-micro-caption text-text-muted">— мин</span></div>
<h4 class="font-headline-sm text-headline-sm text-on-surface font-bold leading-snug kg-clip2">${esc(f.title)}</h4>
<p class="font-micro-caption text-micro-caption text-text-muted italic truncate">${f.original_title&&f.original_title!==f.title?esc(f.original_title):"&nbsp;"}</p>
<p data-dir="${f.id}" class="font-micro-caption text-micro-caption text-on-surface-variant">&nbsp;</p></div>
<p class="font-body-sm text-body-sm text-text-muted kg-clip2 pt-1">${esc(f.overview||"Описания на русском пока нет.")}</p></div></div>
<div class="flex items-center justify-end pt-1"><button type="button" data-act="bm" data-id="${f.id}" aria-label="Сохранить" class="w-11 h-11 flex-shrink-0 rounded-lg bg-surface-container-high text-primary-container flex items-center justify-center transition-transform active:scale-95 shadow-sm"><span class="material-symbols-outlined text-[20px]" style="font-variation-settings:'FILL' 1;">${bm?"bookmark_added":"bookmark_border"}</span></button></div>
${selected?selectedFilmHtml(selected,true):""}</div></div>`;
}
function renderFilms(){
  const box=$("cl-films");if(!box)return;
  const {best,rest}=derived();
  const selectedInList=D.selected&&D.selected._placement==="list";
  if(!best){box.innerHTML=(selectedInList?selectedFilmHtml(D.selected):"")+'<p class="font-body-sm text-body-sm text-text-muted px-1">Подходящих фильмов не нашлось.</p>';return;}
  const list=rest.slice(0,D.shown);
  const pearl=pearlHtml(best,selectedInList&&String(D.selected.id)===String(best.id)?D.selected:null);
  box.innerHTML=pearl+
  `<div class="flex flex-col gap-space-sm"><div class="flex items-center justify-between px-1"><h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">Отобранные шедевры</h3><span class="font-micro-caption text-micro-caption text-text-muted">${list.length} из ${nf(Math.max(totalFor(),list.length+1))}</span></div>
  <div class="flex flex-col gap-space-sm">${list.map(f=>filmItem(f)).join("")}</div>
  ${rest.length>D.shown?`<button type="button" data-act="more" class="w-full py-3 rounded-xl bg-surface-panel hover:bg-surface-container-low text-primary text-center font-label-md text-label-md font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"><span class="material-symbols-outlined text-[18px]">expand_more</span><span>Показать ещё</span></button>`:""}</div>`;
  [best,...list].forEach(f=>filmDetails(f.id).then(d=>{
    const rt=vd.querySelectorAll(`[data-rt="${f.id}"]`),dr=vd.querySelectorAll(`[data-dir="${f.id}"]`);
    rt.forEach(e=>e.textContent=d.runtime?d.runtime+" мин":"");
    dr.forEach(e=>e.textContent=d.dirs.length?"Реж. "+d.dirs.slice(0,2).join(", "):"");
  }).catch(()=>{}));
}
function selectedFilmHtml(f,embedded=false){
  const year=(f.release_date||"").slice(0,4);
  const poster=f.poster_path?`<img class="w-full h-full object-cover" loading="lazy" alt="Постер фильма «${esc(f.title||"Фильм")}»" src="${P(f.poster_path,"w185")}">`:`<span class="material-symbols-outlined text-text-muted">movie</span>`;
  const cast=(f.castFull||[]).map(c=>`<div class="flex-shrink-0 w-28 flex flex-col items-center text-center p-2 rounded-xl bg-surface-container-high">
<div class="w-14 h-14 rounded-full overflow-hidden mb-2 bg-surface-variant shadow-md flex items-center justify-center">${c.photo?`<img class="w-full h-full object-cover" loading="lazy" alt="" src="${P(c.photo,"w185")}">`:'<span class="material-symbols-outlined text-text-muted">person</span>'}</div>
<span class="font-label-sm text-label-sm text-on-surface font-semibold truncate w-full">${esc(c.name)}</span><span class="font-micro-caption text-micro-caption text-text-muted truncate w-full">${esc(c.role)}</span></div>`).join("");
  const activeVideo=f._trailer||null;
  const trailerContent=f._trailerPlaying&&activeVideo
    ?`<iframe src="${embedSrc(activeVideo,true)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin" title="Трейлер ${esc(f.title)}" style="position:absolute;inset:0;width:100%;height:100%;border:0"></iframe>`
    :activeVideo
      ?`<button type="button" data-trailer-action="play" data-id="${f.id}" aria-label="Воспроизвести трейлер" class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-surface-container-high to-canvas-obsidian text-primary-container transition-colors hover:text-primary"><span class="material-symbols-outlined text-[48px]">play_arrow</span></button>`
      :`<div class="absolute inset-0 flex items-center justify-center text-text-muted font-body-sm text-body-sm">${f._trailerStatus==="missing"?"Трейлер не найден":"Ищем трейлер…"}</div>`;
  const oscar=f._placement==="oscar"&&window.KGOscarPage&&window.KGOscarPage.info?window.KGOscarPage.info(f):null;
  const awardsHtml=oscar?(f._oscarAwards===undefined
    ?'<p class="font-micro-caption text-micro-caption text-text-muted pt-1">Загружаем награды и номинации…</p>'
    :f._oscarAwards.length
      ?`<div class="flex flex-col gap-1 pt-2 mt-1 border-t border-primary-container/20"><span class="font-micro-caption text-micro-caption text-text-muted uppercase tracking-wider">Награды и номинации</span>${f._oscarAwards.map(a=>`<div class="flex items-start gap-1.5"><span class="material-symbols-outlined text-[16px] shrink-0 ${a.won?"text-primary-container":"text-text-muted"}" style="font-variation-settings:'FILL' ${a.won?1:0};">${a.won?"emoji_events":"circle"}</span><span class="font-body-sm text-body-sm ${a.won?"text-on-surface font-semibold":"text-text-muted"}">${esc(a.label)}${a.year?" · "+a.year:""}${a.won?"":" (номинация)"}</span></div>`).join("")}</div>`
      :""):"";
  const oscarBlock=oscar?`<div class="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-br from-cinema-velvet-deep/50 via-surface-container-high to-surface-container-high border border-primary-container/25"><span class="material-symbols-outlined text-primary-container text-[28px] shrink-0" style="font-variation-settings:'FILL' 1;">workspace_premium</span><div class="min-w-0 flex flex-col gap-0.5"><h4 class="font-label-md text-label-md text-primary-fixed font-semibold">${oscar.best?"Оскар · Лучший фильм":"Лауреат премии «Оскар»"}</h4>${oscar.best?`<p class="font-label-sm text-label-sm text-primary-container font-semibold">${oscar.n}-я церемония · ${oscar.year} год</p><p class="font-body-sm text-body-sm text-text-muted">Главная награда Американской киноакадемии. Статуэтку получает лучший фильм года; эта картина вышла в ${oscar.film} году.</p>`:`<p class="font-body-sm text-body-sm text-text-muted">Картина входит в список лауреатов Американской киноакадемии${oscar.film?` · фильм ${oscar.film} года`:""}.</p>`}${awardsHtml}</div></div>`:"";
  const tagline=f.tagline&&f.taglineLang===f.overviewLang?`<p class="font-body-sm text-body-sm text-primary-fixed italic">${esc(f.tagline)}</p>`:"";
  const shell=embedded?"div":"section",shellClass=embedded?"flex flex-col gap-space-sm pt-3 border-t border-surface-border-subtle scroll-mt-20":"flex flex-col gap-space-sm p-3.5 rounded-2xl bg-surface-panel border border-primary-container/30 shadow-xl scroll-mt-20";
  const header=embedded
    ?`<div class="flex items-center justify-between gap-2"><h4 class="font-label-md text-label-md text-primary-fixed font-semibold">Подробности о фильме</h4><button type="button" data-act="close-film" aria-label="Свернуть карточку" class="w-9 h-9 flex-shrink-0 rounded-full bg-surface-container-high text-text-muted hover:text-primary flex items-center justify-center"><span class="material-symbols-outlined">expand_less</span></button></div>`
    :`<div class="flex items-start gap-3"><div class="w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-surface-container-high flex items-center justify-center shadow-md">${poster}</div><div class="min-w-0 flex-1"><h3 class="font-headline-md text-headline-md text-primary font-bold">${esc(f.title||"Фильм")}</h3><p class="font-micro-caption text-micro-caption text-text-muted mt-1">${[f._cc?`${fl(f._cc)} ${esc(cname(f._cc))}`:"",year,f.runtime?f.runtime+" мин":""].filter(Boolean).join(" • ")}</p></div>
<button type="button" data-act="bm" data-id="${f.id}" aria-label="${BOOK.has(f.id)?"Убрать из закладок":"Сохранить в закладки"}" class="w-9 h-9 flex-shrink-0 rounded-full bg-surface-container-high text-primary-container flex items-center justify-center"><span class="material-symbols-outlined">${BOOK.has(f.id)?"bookmark_added":"bookmark_border"}</span></button>
<button type="button" data-act="close-film" aria-label="Закрыть описание" class="w-9 h-9 flex-shrink-0 rounded-full bg-surface-container-high text-text-muted hover:text-primary flex items-center justify-center"><span class="material-symbols-outlined">close</span></button></div>`;
  const director=f.dirs&&f.dirs.length?`<div class="flex flex-col gap-1"><h4 class="font-label-md text-label-md text-primary-fixed font-semibold">Режиссёр${f.dirs.length>1?"ы":""}</h4><p class="font-body-sm text-body-sm text-text-muted">${esc(f.dirs.join(", "))}</p></div>`:`<div class="flex flex-col gap-1"><h4 class="font-label-md text-label-md text-primary-fixed font-semibold">Режиссёр</h4><p class="font-body-sm text-body-sm text-text-muted">${f._detailsLoaded?"Сведения недоступны.":"Загружаем данные…"}</p></div>`;
  const boxOffice=`<div class="grid grid-cols-2 gap-2"><div class="p-2.5 rounded-xl bg-surface-container-high"><span class="block font-micro-caption text-micro-caption text-text-muted">Бюджет</span><span class="block font-label-md text-label-md text-on-surface mt-0.5">${f._detailsLoaded?moneyText(f.budget):"Загружаем…"}</span></div><div class="p-2.5 rounded-xl bg-surface-container-high"><span class="block font-micro-caption text-micro-caption text-text-muted">Сборы</span><span class="block font-label-md text-label-md text-on-surface mt-0.5">${f._detailsLoaded?moneyText(f.revenue):"Загружаем…"}</span></div></div>`;
  return `<${shell} class="${shellClass}" data-selected-film="${f.id}">
${header}
<div class="relative w-full kg-detail-trailer rounded-xl overflow-hidden bg-black border border-primary-container/30" id="cl-inline-trailer">${trailerContent}</div>
${activeVideo?`<a href="${watchUrl(activeVideo)}" target="_blank" rel="noopener noreferrer" class="font-micro-caption text-micro-caption text-primary underline">Не воспроизводится? Открыть на ${esc(activeVideo.site)}</a>`:""}
${tagline}${oscarBlock}<div class="flex flex-col gap-1"><h4 class="font-label-md text-label-md text-primary-fixed font-semibold">О фильме</h4><p class="font-body-sm text-body-sm text-text-muted leading-relaxed">${esc(f.overview||"Загружаем описание…")}</p></div>
${director}${boxOffice}
<div class="flex flex-col gap-2"><h4 class="font-label-md text-label-md text-primary-fixed font-semibold">Актёры</h4>${cast?`<div class="flex gap-2.5 overflow-x-auto py-1" style="-webkit-overflow-scrolling:touch">${cast}</div>`:`<p class="font-body-sm text-body-sm text-text-muted">${f._detailsLoaded?"Сведения об актёрах недоступны.":"Загружаем актёров…"}</p>`}</div></${shell}>`;
}
document.addEventListener("click",e=>{
  const bookmark=e.target.closest('[data-act="bm"]');
  if(bookmark&&D.selected&&["mood","oscar"].includes(D.selected._placement)&&String(D.selected.id)===bookmark.dataset.id){
    e.preventDefault();e.stopPropagation();
    const id=D.selected.id;
    BOOK.has(id)?BOOK.delete(id):BOOK.add(id);store.set("kgBookmarks",[...BOOK]);
    toast(BOOK.has(id)?"Добавлено в закладки":"Убрано из закладок","bookmark");
    renderSelectedPanel();
    return;
  }
  const action=e.target.closest("[data-trailer-action]");
  if(!action)return;
  const selected=D.selected;
  if(!selected||String(selected.id)!==String(action.dataset.id))return;
  e.preventDefault();
  if(action.dataset.trailerAction!=="play")return;
  selected._trailerPlaying=true;
  renderSelectedPanel();
});
function otherHtml(t){
  const m=META[t.id]||{};
  const artCover = getThemeCover(t.id);
  const imgMarkup = artCover 
    ? `<img class="w-full h-full object-cover" alt="${esc(t.name)}" src="${artCover}">`
    : (m.p ? `<img class="w-full h-full object-cover" alt="" src="${P(m.p,"w185")}">` : "");
  return `<a href="#" data-act="goto" data-t="${t.id}" class="flex flex-col gap-1.5 p-3 rounded-xl bg-surface-panel hover:bg-surface-container-low min-w-[140px] max-w-[140px] flex-shrink-0 transition-colors shadow-md"><div class="w-full h-20 rounded-lg overflow-hidden bg-surface-container-high" data-oi="${t.id}">${imgMarkup}</div><span class="font-label-sm text-label-sm text-on-surface font-bold truncate">${esc(t.name)} ${fl(t.cc[0])}</span><span data-oc="${t.id}" class="font-micro-caption text-micro-caption text-text-muted">${m.n?nf(m.n)+" "+fw(m.n):"…"}</span></a>`;
}

function renderCollection(){
  const t=D.t,m=TM[t.id]||["noir","","",""];
  const others=shuffle(THEMES.filter(x=>x.id!==t.id)).slice(0,5);
  vd.innerHTML=`
<div class="flex items-center justify-between gap-space-sm pt-space-xs"><button type="button" data-act="back" class="flex items-center gap-1.5 text-text-muted hover:text-primary transition-colors py-1"><span class="material-symbols-outlined text-[18px]">arrow_back</span><span class="font-label-sm text-label-sm">Все подборки</span></button>
<div class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-primary-fixed shadow-sm"><span class="material-symbols-outlined text-[14px] text-primary-container">${ICON[t.id]||"auto_awesome"}</span><span class="font-micro-caption text-micro-caption font-semibold tracking-wide uppercase">Кураторский выбор</span></div></div>
<div class="relative overflow-hidden rounded-xl bg-surface-panel p-space-md shadow-xl"><div class="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-cinema-velvet-glow blur-3xl pointer-events-none"></div><div class="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-cinema-amber-glow blur-2xl pointer-events-none"></div>
<div class="relative flex flex-col gap-space-sm z-10"><div class="flex items-center gap-2"><span class="px-2 py-0.5 rounded-full bg-cinema-velvet-deep text-secondary font-micro-caption text-micro-caption tracking-wider">${CAT[m[0]][1]}</span><span id="cl-count" class="text-text-muted font-micro-caption text-micro-caption">… картин</span></div>
<div class="flex flex-col"><h2 class="font-display-hero-mobile text-display-hero-mobile text-primary font-bold tracking-tight">${esc(t.name)}</h2><p class="font-label-sm text-label-sm text-on-surface-variant font-medium tracking-wide">${esc(m[1])}</p></div>
<div class="flex flex-wrap items-center gap-1.5 pt-0.5">${t.cc.map(cc=>`<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface font-micro-caption text-micro-caption shadow-sm">${fl(cc)} ${esc(cname(cc))}</span>`).join("")}</div>
<p class="font-body-sm text-body-sm text-text-muted leading-relaxed pt-1">${esc(m[3])}</p>
<div class="flex items-center gap-2 pt-1 flex-wrap">${gnames(t).map(g=>`<span class="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-micro-caption text-micro-caption">${esc(g)}</span>`).join("")}</div></div></div>
<div class="flex flex-col gap-space-sm bg-surface-panel p-space-md rounded-xl shadow-lg"><div class="flex items-center justify-between"><div class="flex items-center gap-2"><span class="material-symbols-outlined text-primary-container text-[20px]">casino</span><span class="font-headline-sm text-headline-sm text-on-surface font-semibold">Случайный выбор</span></div><span class="font-micro-caption text-micro-caption text-primary-fixed bg-surface-container-high px-2 py-0.5 rounded-full">Рейтинг ≥ 6.5</span></div>
<button type="button" id="cl-spin" data-act="spin" class="relative group w-full py-3.5 px-4 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(255,184,48,0.28)] transition-all active:scale-[0.98] overflow-hidden"><span id="cl-ricon" class="material-symbols-outlined text-[22px]">casino</span><span id="cl-rtext">Крутить рулетку</span><div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div></button>
<div id="cl-reel" style="display:none" class="flex flex-col gap-space-sm">
<div class="relative w-full rounded-xl bg-canvas-obsidian border border-primary-container/30 overflow-hidden shadow-[inset_0_2px_12px_rgba(0,0,0,0.95)] p-1">
<div class="kgr-perf"><div><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><span>Kodak 35mm</span></div>
<div class="kgr-win select-none"><div id="cl-track" class="kgr-track"></div><div id="cl-frame" class="kgr-frame" aria-hidden="true"></div></div>
<div class="kgr-perf"><div><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><span>35mm nitrate</span></div></div>
<div class="flex items-center justify-between px-1"><span id="cl-fc" class="font-mono text-micro-caption text-primary-fixed font-semibold tracking-wide">Кадр 00 / 00</span><button type="button" id="cl-skip" data-act="skip" style="display:none" class="font-micro-caption text-micro-caption text-text-muted hover:text-primary underline">Пропустить</button></div>
<div id="cl-result"></div></div>
${t.cc.length>1?`<div class="flex flex-col gap-1.5 pt-1"><span class="font-micro-caption text-micro-caption text-text-muted">Фильтр по стране:</span><div id="cl-cc" class="flex items-center gap-1.5 overflow-x-auto pb-1"><button type="button" data-act="cc" data-cc="" class="${ccCls(true)}">Все страны</button>${t.cc.map(cc=>`<button type="button" data-act="cc" data-cc="${cc}" class="${ccCls(false)}">${fl(cc)} ${esc(cname(cc))}</button>`).join("")}</div></div>`:""}
<div class="flex items-center justify-between pt-1"><span class="font-micro-caption text-micro-caption text-text-muted">Сортировка:</span><div id="cl-sort" class="flex items-center gap-1 bg-surface-container-low p-0.5 rounded-lg">${[["rating","По рейтингу"],["pop","Популярные"],["new","Свежие"]].map(([k,l])=>`<button type="button" data-act="sort" data-s="${k}" class="${sCls(k===D.sort)}">${l}</button>`).join("")}</div></div></div>
<div id="cl-films" class="flex flex-col gap-space-lg"><p class="font-body-sm text-body-sm text-text-muted px-1 animate-pulse">Загружаем подборку…</p></div>
<div class="flex flex-col gap-space-sm pt-space-xs"><div class="flex items-center justify-between px-1"><h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">Другие подборки</h3><a href="#" data-act="back" class="font-micro-caption text-micro-caption text-primary hover:underline">Все ${THEMES.length} →</a></div>
<div id="cl-others" class="flex gap-space-sm overflow-x-auto pb-2">${others.map(otherHtml).join("")}</div>
<a href="#" data-act="back" class="w-full py-3 rounded-xl bg-surface-panel hover:bg-surface-container-low text-primary text-center font-label-md text-label-md font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"><span class="material-symbols-outlined text-[18px]">apps</span><span>Все ${THEMES.length} подборок Киноглобуса</span></a></div>`;
  // постеры и счётчики «других подборок»
  others.forEach(o=>loadMeta(o).then(m=>{
    const a=vd.querySelector(`[data-oc="${o.id}"]`),i=vd.querySelector(`[data-oi="${o.id}"]`);
    if(a)a.textContent=nf(m.n)+" "+fw(m.n);
    if(i&&!i.firstChild){
      const art=getThemeCover(o.id);
      if(art) i.innerHTML=`<img class="w-full h-full object-cover" alt="" src="${art}">`;
      else if(m.p) i.innerHTML=`<img class="w-full h-full object-cover" alt="" src="${P(m.p,"w185")}">`;
    }
  }).catch(()=>{}));
}

async function openCollection(id,opt){
  const t=T[id];if(!t)return;
  rStop();
  const cached=themeDataCache.get(themeDataKey(t,2));
  const initial=cached&&cached.data;
  D={t,all:initial?initial.films:[],total:initial?initial.total:0,totals:initial?initial.totals:{},cc:"",sort:"rating",shown:5,selected:null,picked:null};
  renderCollection();showView("collection");
  if(!apiKey){$("cl-films").innerHTML='<p class="font-body-sm text-body-sm text-text-muted px-1">Введите ключ TMDB на экране «Глобус», чтобы загрузить фильмы подборки.</p>';return;}
  if(initial){
    $("cl-count").textContent=nf(D.total)+" "+(fw(D.total)==="фильм"?"картина":fw(D.total)==="фильма"?"картины":"картин");
    renderFilms();
  }
  try{
    const r=await loadTheme(t,2);
    if(D.t!==t)return;
    if(r._stale){$("cl-films").insertAdjacentHTML("afterbegin",`<p role="status" class="font-micro-caption text-micro-caption text-text-muted">Не удалось обновить данные; показана сохранённая подборка.</p>`);return;}
    D.all=r.films;D.total=r.total;D.totals=r.totals;
    $("cl-count").textContent=nf(r.total)+" "+(fw(r.total)==="фильм"?"картина":fw(r.total)==="фильма"?"картины":"картин");
    renderFilms();
    if(opt&&opt.spin)inPageRoulette();
  }catch(e){
    if(initial){
      $("cl-films").insertAdjacentHTML("afterbegin",`<p role="status" class="font-micro-caption text-micro-caption text-text-muted">Не удалось обновить данные; показана сохранённая подборка.</p>`);
      console.error("[Kinoglobus] Не удалось обновить подборку:",e);
    }else $("cl-films").innerHTML=`<p class="font-body-sm text-body-sm text-feedback-error px-1">${esc(e.message||"Не удалось загрузить подборку.")}</p>`;
  }
}

function renderSelectedPanel(){
  const selected=D.selected;if(!selected)return;
  if(selected._placement==="list"){renderFilms();return;}
  const inMoodList=selected._placement==="mood"&&String(selected._detailTarget||"").startsWith("mood-film-detail-");
  const inOscarList=selected._placement==="oscar"&&/^oscar-(list|feature|grid)-detail-/.test(String(selected._detailTarget||""));
  const html=selectedFilmHtml(selected,inMoodList||inOscarList);
  if(selected._placement==="mood"||selected._placement==="oscar"){
    const target=$(selected._detailTarget)||(selected._placement==="mood"?$("mood-film-detail"):$("oscar-film-detail"));
    if(target)target.innerHTML=html;
    return;
  }
  if(selected._placement==="home"){
    const film=homeEditorial.films.find(f=>String(f.id)===String(selected.id));
    if(film){
      homeEditorial.featureDetails={...homeEditorial.featureDetails,...selected};
      $("kg-home-feature").innerHTML=homeFeatureMarkup(film,homeEditorial.featureDetails,selected);
    }
    return;
  }
  if(selected._placement==="home-europe"){
    const detail=$("kg-home-europe-detail");
    if(detail){detail.innerHTML=html;detail.hidden=false;}
    return;
  }
  if(selected._placement==="roulette"){
    const result=$("cl-result");if(result)result.innerHTML=html;
    return;
  }
  renderFilms();
}
function openFilm(f,placement="list",detailTarget=null){
  if(D.selected&&D.selected._placement===placement&&String(D.selected.id)===String(f.id)&&D.selected._detailTarget===detailTarget){
    if(placement==="mood"||placement==="oscar")closePageFilm(placement);
    else{D.selected=null;if(placement==="list")renderFilms();}
    return;
  }
  if(D.selected&&D.selected._placement.startsWith("home")&&D.selected._placement!==placement){
    const oldDetail=$(D.selected._placement==="home"?"kg-home-film-detail":"kg-home-europe-detail");
      oldDetail?.replaceChildren();if(oldDetail)oldDetail.hidden=true;
    if(D.selected._placement==="home"){D.selected=null;renderHomeEditorial();}
  }
  if(placement==="list")$("cl-result").innerHTML="";
  if(placement==="home-europe")$("kg-home-europe-detail").hidden=false;
  if(D.selected&&D.selected._placement===placement&&D.selected._detailTarget&&D.selected._detailTarget!==detailTarget){
    $(D.selected._detailTarget)?.replaceChildren();
  }
  D.selected={...f,_cc:f._cc||(f.origin_country||[])[0]||"",_placement:placement,_detailTarget:detailTarget,overview:russianText(f.overview)||"Загружаем описание…",_trailerStatus:"loading"};;
  const selected=D.selected;
  if(placement==="roulette"||placement==="home"||placement==="home-europe"||placement==="mood"||placement==="oscar")renderSelectedPanel();else renderFilms();
  const panel=detailTarget?$(detailTarget):placement==="roulette"?$("cl-result")?.querySelector(`[data-selected-film="${f.id}"]`):placement==="home"?$("kg-home-feature")?.querySelector(`[data-selected-film="${f.id}"]`):placement==="home-europe"?$("kg-home-europe-detail")?.querySelector(`[data-selected-film="${f.id}"]`):placement==="mood"?$("mood-film-detail")?.querySelector(`[data-selected-film="${f.id}"]`):placement==="oscar"?$("oscar-film-detail")?.querySelector(`[data-selected-film="${f.id}"]`):vd.querySelector(`[data-selected-film="${f.id}"]`);
  panel?.scrollIntoView({behavior:"smooth",block:"nearest"});
  filmDetails(f.id).then(details=>{
    if(D.selected!==selected)return;
    selected.overview=details.overview||russianText(f.overview)||"Описания на русском и английском пока нет.";
    selected.overviewLang=details.overview?details.overviewLang:(russianText(f.overview)?"ru":"");
    selected.runtime=details.runtime;
    selected.dirs=details.dirs;
    selected.castFull=details.castFull;
    selected.budget=details.budget;
    selected.revenue=details.revenue;
    selected._cc=(f.origin_country||[])[0]||(details.countries||[])[0]||selected._cc||"";
    selected.tagline=details.tagline;
    selected.taglineLang=details.taglineLang;
    selected._detailsLoaded=true;
    if(placement==="home")homeEditorial.featureDetails={...homeEditorial.featureDetails,...selected};
    renderSelectedPanel();
  }).catch(error=>{
    if(D.selected!==selected)return;
    selected.overview=russianText(f.overview)||"Не удалось загрузить описание.";
    selected.overviewLang=russianText(f.overview)?"ru":"";
    selected._detailsLoaded=true;
    renderSelectedPanel();
    console.error("[Kinoglobus] Не удалось загрузить сведения о фильме:",error);
  });
  trailerFor(f).then(trailer=>{
    if(D.selected!==selected)return;
    selected._trailer=trailer;
    selected._trailerStatus=trailer?"ready":"missing";
    renderSelectedPanel();
  }).catch(e=>{
    if(D.selected!==selected)return;
    selected._trailerStatus="missing";
    renderSelectedPanel();
    console.error("[Kinoglobus] Не удалось загрузить трейлер:",e);
  });
  if(placement==="oscar"&&window.KGOscarPage&&window.KGOscarPage.awards){
    window.KGOscarPage.awards(f).then(list=>{selected._oscarAwards=list;if(D.selected===selected)renderSelectedPanel();})
      .catch(e=>{selected._oscarAwards=[];if(D.selected===selected)renderSelectedPanel();console.warn("[Kinoglobus] Награды Wikidata недоступны:",e);});
  }
}

/* ---------- рулетка с плёнкой прямо в подборке ---------- */
const R={busy:false,token:0,raf:0,skip:false};
const STEP=90,PAD=8,CELL=80;          // шаг ячейки, левый отступ, ширина постера
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const snd=fn=>{try{fn();}catch(e){}};
const p2=n=>(n<10?"0":"")+n;
const rW=()=>{const t=$("cl-track");return (t&&t.clientWidth)||320;};
const rX=i=>PAD+i*STEP+CELL/2-rW()/2;  // сдвиг ленты, при котором ячейка i стоит под рамкой
function rCell(f,i,cls){
  const t=f?esc(f.title):"",y=f&&f.release_date?f.release_date.slice(0,4):"";
  const inner=!f?'<div class="nop"><span class="material-symbols-outlined" style="font-size:22px;opacity:.35">movie</span></div>'
    :f.poster_path?`<img alt="${t}" draggable="false" src="${P(f.poster_path,"w185")}">`:`<div class="nop">${t}</div>`;
  return `<div class="kgr-cell ${cls||""}">${inner}${f&&y?`<span class="yr">${y}</span>`:""}</div>`;
}
function rMount(list,idx,cls){
  const tr=$("cl-track");if(!tr)return null;
  const run=document.createElement("div");run.className="kgr-run";
  run.innerHTML=list.map((f,i)=>rCell(f,i,i===idx?cls:"")).join("");
  tr.innerHTML="";tr.appendChild(run);
  run.style.transform=`translateX(${-rX(idx)}px)`;
  return run;
}
function setBtn(on){
  const ic=$("cl-ricon"),tx=$("cl-rtext"),b=$("cl-spin");
  if(!ic||!tx)return;
  ic.classList.toggle("animate-spin",on);
  tx.textContent=on?"Плёнка крутится…":(D.picked?"Крутить ещё раз":"Крутить рулетку");
  if(b){b.disabled=on;b.style.opacity=on?".75":"";}
  const sk=$("cl-skip");if(sk)sk.style.display=on?"":"none";
}
function rStop(){
  R.token++;cancelAnimationFrame(R.raf);R.busy=false;
  snd(()=>stopFilmReelSound());
  setBtn(false);
}
function finishPick(film,token){
  if(token!==R.token)return;
  R.busy=false;D.picked=film;setBtn(false);
  openFilm(film,"roulette");
}
async function inPageRoulette(){
  if(R.busy)return;
  if(!D.all.length){toast("Подборка ещё загружается","movie");return;}
  const inCc=f=>!D.cc||f._cc===D.cc;
  const pool=D.all.filter(f=>inCc(f)&&!seen.has(f.id));
  if(!pool.length){toast("Все фильмы из выборки уже в истории","history");return;}
  const film=pick(pool);
  const others=shuffle(D.all.filter(f=>inCc(f)&&f.id!==film.id&&f.poster_path));
  const token=++R.token;R.busy=true;R.skip=false;D.picked=null;D.selected=null;
  renderFilms();
  $("cl-reel").style.display="";$("cl-result").innerHTML="";
  setBtn(true);
  try{audio();}catch(e){}
  $("cl-reel").scrollIntoView({behavior:"smooth",block:"center"});
  if(!others.length||RM){                      // мало постеров или отключена анимация: сразу показываем кадр
    rMount([film],0,"chosen");$("cl-fc").textContent="Кадр 01 / 01";
    finishPick(film,token);return;
  }
  const NEED=26,T=4600,TAIL=6,seq=[];
  for(let i=0;i<NEED;i++)seq.push(others[i%others.length]);
  seq.push(film);
  for(let i=0;i<TAIL;i++)seq.push(others[(i+2)%others.length]);
  await Promise.race([Promise.all(seq.filter(f=>f.poster_path).map(f=>new Promise(r=>{const im=new Image();im.onload=im.onerror=r;im.src=P(f.poster_path,"w185");}))),wait(2500)]);
  if(token!==R.token)return;
  const run=rMount(seq,NEED,"");
  if(!run){R.busy=false;return;}
  [...run.children].forEach(c=>c.classList.add("spin"));
  const total=D.all.filter(inCc).length;
  $("cl-fc").textContent="Кадр -- / "+p2(total);
  snd(()=>startFilmReelSound());
  const x0=rX(0),x1=rX(NEED);
  run.style.transform=`translateX(${-x0}px)`;run.classList.add("fast");
  const t0=performance.now();
  const step=now=>{
    if(token!==R.token){snd(()=>stopFilmReelSound());return;}
    const t=R.skip?1:Math.min(1,(now-t0)/T);
    const x=x0+(x1-x0)*(1-Math.pow(1-t,4)),left=x1-x;
    run.style.transform=`translateX(${-x}px)`;
    if(t>.4)run.classList.remove("fast");
    if(!(t>=1||left<.75)){
      if(left<200)snd(()=>setFilmReelLevel(left/200));
      R.raf=requestAnimationFrame(step);return;
    }
    snd(()=>stopFilmReelSound());
    run.style.transform=`translateX(${-rX(NEED)}px)`;
    [...run.children].forEach((c,i)=>{c.classList.remove("spin");c.classList.toggle("chosen",i===NEED);});
    const fr=$("cl-frame");fr.classList.remove("hit");void fr.offsetWidth;fr.classList.add("hit");
    const all=D.all.filter(inCc),k=all.findIndex(f=>f.id===film.id);
    $("cl-fc").textContent=`Кадр ${p2((k<0?0:k)+1)} / ${p2(all.length)}`;
    snd(()=>sWin());snd(()=>buzz([25,50,60]));
    finishPick(film,token);
  };
  R.raf=requestAnimationFrame(step);
}
window.addEventListener("resize",()=>{
  const run=document.querySelector("#cl-track .kgr-run");if(!run||R.busy)return;
  const i=[...run.children].findIndex(c=>c.classList.contains("chosen"));
  if(i>=0)run.style.transform=`translateX(${-rX(i)}px)`;
});
vd.addEventListener("click",e=>{
  const el=e.target.closest("[data-act]");if(!el)return;
  const a=el.dataset.act;
  if(a==="close-film"){
    const placement=D.selected&&D.selected._placement;
    D.selected=null;
    if(placement==="roulette")$("cl-result").innerHTML="";
    else renderFilms();
    return;
  }
  if(a==="back"){e.preventDefault();showView("collections");return;}
  if(a==="goto"){e.preventDefault();openCollection(el.dataset.t);return;}
  if(a==="spin"){inPageRoulette();return;}
  if(a==="skip"){R.skip=true;return;}
  if(a==="cc"){
    D.cc=el.dataset.cc;D.shown=5;
    vd.querySelectorAll("#cl-cc [data-act=cc]").forEach(b=>b.className=ccCls(b===el));
    renderFilms();return;
  }
  if(a==="sort"){
    D.sort=el.dataset.s;D.shown=5;
    vd.querySelectorAll("#cl-sort [data-act=sort]").forEach(b=>b.className=sCls(b===el));
    renderFilms();return;
  }
  if(a==="more"){D.shown+=5;renderFilms();return;}
  const f=byId(el.dataset.id);if(!f)return;
  if(a==="trailer"){e.stopPropagation();openFilm(f);return;}
  if(a==="bm"){
    e.stopPropagation();
    BOOK.has(f.id)?BOOK.delete(f.id):BOOK.add(f.id);store.set("kgBookmarks",[...BOOK]);
    const ic=el.querySelector(".material-symbols-outlined");if(ic)ic.textContent=BOOK.has(f.id)?"bookmark_added":"bookmark_border";
    el.setAttribute("aria-label",BOOK.has(f.id)?"Убрать из закладок":"Сохранить в закладки");
    toast(BOOK.has(f.id)?"Добавлено в закладки":"Убрано из закладок","bookmark");return;
  }
  if(a==="open")openFilm(f);
});

// старая кнопка «Подборки» из bridge v6 теперь ведёт в каталог
document.querySelectorAll('[data-path="podborki-i-zhanry"]').forEach(a=>a.addEventListener("click",e=>{e.preventDefault();showView("collections");}));
// «Тематические коллекции» убраны с главного экрана: подборки теперь только в разделе «Подборки»
const themeAcc=[...document.querySelectorAll("details")].find(d=>{const m=d.querySelector("summary");return m&&m.textContent.includes("Тематические коллекции");})||document.querySelectorAll("details")[2];
if(themeAcc)themeAcc.style.display="none";
// ранее выбранная тема больше не должна незаметно фильтровать глобус
if(themeId){themeId="";store.set("theme","");try{paintThemes();paintGo();}catch(e){}}
// плёнка «Кинолента 35-мм» на главной скрыта, пока ей не пользуются: появляется, когда найден фильм
const reelCard=$("cinema-35mm-reel-section");
if(reelCard)reelCard.style.display="none";
const _showFilm=window.show;
if(typeof _showFilm==="function")window.show=function(){if(reelCard)reelCard.style.display="";return _showFilm.apply(this,arguments);};

/* ---------- Главная: редакционная карточка и европейская палитра ---------- */
const HOME_EUROPE=["FR","IT","ES","DE","GB","PL","SE","DK","NO","FI","PT","NL","BE","IE"];
const homeEditorial={films:[],details:new Set(),directorData:new Map(),loadedKey:"",token:0,loading:false,pending:null,observer:null,scrollAnchorId:null};
const homeEditorialRoot=$("kg-home-editorial");
function homeFilmYear(f){return (f.release_date||"").slice(0,4);}
function homeFeatureMarkup(f,d,expandedFilm=null){
  const title=esc(f.title||f.original_title||"Фильм");
  const year=homeFilmYear(f);
  const rating=Number(f.vote_average)||0;
  const synopsis=(d&&d.overview)||russianText(f.overview)||"Описание на русском и английском пока недоступно.";
  const poster=f.poster_path
    ?`<img class="w-full h-full object-cover" src="${P(f.poster_path,"w342")}" alt="Постер фильма «${title}»" loading="lazy">`
    :`<span class="material-symbols-outlined text-primary-container text-[32px]">movie</span>`;
  const isExpanded=expandedFilm&&String(expandedFilm.id)===String(f.id);
  return `<article data-home-act="open" data-id="${f.id}" class="w-full rounded-xl bg-surface-container-high shadow-xl p-3.5 cursor-pointer">
<p class="font-micro-caption text-micro-caption uppercase tracking-wider text-primary font-bold mb-2">Выбор дня · Программа № ${homeDayNumber()}</p>
<div class="flex gap-3.5 items-start">
<div class="relative w-28 h-40 shrink-0 rounded-lg overflow-hidden shadow-md bg-surface-container-lowest flex items-center justify-center">${poster}<span class="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-surface-container-lowest/90 text-primary-container font-label-sm text-label-sm font-bold shadow">★ ${rating.toFixed(1)}</span></div>
<div class="min-w-0 flex-1">
<h3 class="font-headline-sm text-headline-sm text-on-surface font-bold leading-snug">${title}</h3>
${year?`<p class="font-body-sm text-body-sm text-on-surface-variant mt-0.5">${year}</p>`:""}
<p class="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mt-2 kg-clip3">${esc(synopsis)}</p>
</div></div>
${isExpanded?selectedFilmHtml(expandedFilm,true):""}</article>`;
}
function homeDayNumber(){
  const now=new Date();
  return Math.floor((Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate())-Date.UTC(now.getUTCFullYear(),0,0))/86400000);
}
function homeFilmCard(f){
  const title=esc(f.title||f.original_title||"Фильм"),year=homeFilmYear(f);
  const details=homeEditorial.directorData.get(f.id);
  const credit=details&&details.dirs&&details.dirs.length?details.dirs[0]:cname(f._cc);
  const poster=f.poster_path?`<img class="w-full h-full object-cover" src="${P(f.poster_path,"w342")}" alt="Постер фильма «${title}»" loading="lazy">`:'<span class="material-symbols-outlined text-primary-container text-[32px]">movie</span>';
  return `<button type="button" data-home-act="open" data-home-meta="${f.id}" data-id="${f.id}" class="kg-home-film shrink-0 rounded-xl bg-surface-container-high p-2 shadow-md text-left">
<span class="relative w-full h-44 rounded-lg overflow-hidden mb-1.5 bg-surface-container-lowest flex items-center justify-center block">${poster}<span class="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-surface-container-lowest/90 font-micro-caption text-micro-caption text-primary-container font-bold">★ ${(Number(f.vote_average)||0).toFixed(1)}</span></span>
<span class="font-label-sm text-label-sm font-bold text-on-surface block truncate">${title}</span>
<span class="font-micro-caption text-micro-caption text-on-surface-variant block truncate" data-home-director="${f.id}">${esc(credit)}${year?" · "+year:""}</span></button>`;
}
function renderHomeEditorial(){
  if(!homeEditorialRoot)return;
  const feature=$("kg-home-feature"),carousel=$("kg-home-europe");
  const scrollLeft=carousel.scrollLeft,anchor=homeEditorial.scrollAnchorId&&carousel.querySelector(`[data-home-meta="${homeEditorial.scrollAnchorId}"]`),anchorTop=anchor?anchor.getBoundingClientRect().top:null;
  const films=homeEditorial.films;
  if(!films.length)return;
  const dayIndex=(homeDayNumber()-1)%films.length,featured=films[dayIndex];
  const selected=D.selected&&D.selected._placement==="home"&&String(D.selected.id)===String(featured.id)?D.selected:null;
  feature.innerHTML=homeFeatureMarkup(featured,homeEditorial.featureDetails||null,selected);
  carousel.innerHTML=films.map(homeFilmCard).join("");
  carousel.scrollLeft=scrollLeft;
  if(anchorTop!==null)requestAnimationFrame(()=>{
    const restored=carousel.querySelector(`[data-home-meta="${homeEditorial.scrollAnchorId}"]`);
    if(restored)window.scrollBy(0,restored.getBoundingClientRect().top-anchorTop);
  });
  homeEditorial.observer?.disconnect();
  if("IntersectionObserver"in window){
    [...carousel.querySelectorAll("[data-home-meta]")].slice(0,4).forEach(card=>loadHomeDirector(card.dataset.homeMeta));
    homeEditorial.observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      const card=entry.target;homeEditorial.observer.unobserve(card);
      loadHomeDirector(card.dataset.homeMeta);
    }),{root:carousel,rootMargin:"80px"});
    carousel.querySelectorAll("[data-home-meta]").forEach(card=>homeEditorial.observer.observe(card));
  }else{
    [...carousel.querySelectorAll("[data-home-meta]")].slice(0,4).forEach(card=>loadHomeDirector(card.dataset.homeMeta));
  }
  if(!homeEditorial.details.has(featured.id)){
    homeEditorial.details.add(featured.id);
    filmDetails(featured.id).then(d=>{
      if(!homeEditorial.films.length||homeEditorial.films[dayIndex].id!==featured.id)return;
      homeEditorial.featureDetails=d;homeEditorial.directorData.set(featured.id,d);
      const selected=D.selected&&D.selected._placement==="home"&&String(D.selected.id)===String(featured.id)?D.selected:null;
      feature.innerHTML=homeFeatureMarkup(featured,d,selected);
      const credit=document.querySelector(`[data-home-director="${featured.id}"]`);
      if(credit&&d.dirs.length)credit.textContent=[d.dirs[0],homeFilmYear(featured)].filter(Boolean).join(" · ");
    }).catch(e=>{homeEditorial.details.delete(featured.id);console.warn("[Kinoglobus] Не удалось загрузить данные фильма дня:",e);});
  }
}
async function loadHomeDirector(id){
  if(homeEditorial.details.has(Number(id)))return;
  homeEditorial.details.add(Number(id));
  const f=homeEditorial.films.find(x=>String(x.id)===String(id));
  if(!f)return;
  try{
    const d=await filmDetails(f.id),target=document.querySelector(`[data-home-director="${f.id}"]`);
    homeEditorial.directorData.set(f.id,d);
    if(target)target.textContent=[d.dirs[0],homeFilmYear(f)].filter(Boolean).join(" · ")||cname(f._cc);
    const featureIndex=(homeDayNumber()-1)%homeEditorial.films.length;
    if(homeEditorial.films[featureIndex]?.id===f.id){
      homeEditorial.featureDetails=d;
      const selected=D.selected&&D.selected._placement==="home"&&String(D.selected.id)===String(f.id)?D.selected:null;
      $("kg-home-feature").innerHTML=homeFeatureMarkup(f,d,selected);
    }
  }catch(e){
    homeEditorial.details.delete(f.id);
    const featureIndex=(homeDayNumber()-1)%homeEditorial.films.length;
    if(homeEditorial.films[featureIndex]?.id===f.id){
      const emptyDetails={dirs:[],genres:[],companies:[],runtime:0,tagline:"",overview:""};
      homeEditorial.featureDetails=emptyDetails;
      const selected=D.selected&&D.selected._placement==="home"&&String(D.selected.id)===String(f.id)?D.selected:null;
      $("kg-home-feature").innerHTML=homeFeatureMarkup(f,emptyDetails,selected);
    }
    console.warn("[Kinoglobus] Не удалось загрузить режиссёра:",e);
  }
}
function renderHomeEditorialMessage(message,action){
  $("kg-home-feature").innerHTML=`<p class="font-micro-caption text-micro-caption text-primary font-bold uppercase tracking-wider">Выбор дня</p><p role="status" class="font-body-sm text-body-sm text-text-muted mt-2">${esc(message)}</p>${action?`<button type="button" data-home-act="${action}" class="mt-3 px-3 py-2 rounded-lg bg-surface-container-highest text-primary-container font-label-sm text-label-sm font-semibold">${action==="set-key"?"Добавить ключ TMDB":"Повторить загрузку"}</button>`:""}`;
  $("kg-home-europe").innerHTML=`<p class="font-body-sm text-body-sm text-text-muted py-2">Фильмы появятся после загрузки данных.</p>`;
}
async function loadHomeEditorial(force=false){
  if(homeEditorial.loading)return homeEditorial.pending;
  if(!apiKey){if(!homeEditorial.films.length)renderHomeEditorialMessage("Добавьте ключ TMDB, чтобы загрузить фильм и подборку европейского кино.","set-key");return false;}
  if(!force&&homeEditorial.loadedKey===apiKey)return true;
  const token=++homeEditorial.token,oldByCountry=new Map(homeEditorial.films.map(f=>[f._cc,f]));
  homeEditorial.loading=true;
  if(!homeEditorial.films.length)renderHomeEditorialMessage("Загружаем фильмы и данные TMDB…");
  const pending=(async()=>{
    const results=await Promise.allSettled(HOME_EUROPE.map(async cc=>{
      let response=await api({with_origin_country:cc,sort_by:"popularity.desc","vote_count.gte":30,include_adult:"false",page:1},{fresh:force});
      let films=response.results||[];
      if(!films.length){
        response=await api({with_origin_country:cc,sort_by:"popularity.desc","vote_count.gte":1,include_adult:"false",page:1},{fresh:force});
        films=response.results||[];
      }
      return films.length?{...films[0],_cc:cc}:null;
    }));
    if(token!==homeEditorial.token)return false;
    results.forEach((result,i)=>{if(result.status==="rejected")console.warn(`[Kinoglobus] Не удалось загрузить фильмы ${HOME_EUROPE[i]}:`,result.reason);});
    const succeeded=results.some(result=>result.status==="fulfilled");
    const byCountry=new Map();
    results.forEach((result,i)=>{
      if(result.status==="fulfilled"){if(result.value)byCountry.set(HOME_EUROPE[i],result.value);}
      else if(oldByCountry.has(HOME_EUROPE[i]))byCountry.set(HOME_EUROPE[i],oldByCountry.get(HOME_EUROPE[i]));
    });
    const films=HOME_EUROPE.map(cc=>byCountry.get(cc)).filter(Boolean);
    if(!succeeded||!films.length){
      const error=results.find(result=>result.status==="rejected");
      if(!homeEditorial.films.length)renderHomeEditorialMessage(error&&error.reason&&error.reason.message||"Не удалось загрузить европейские фильмы.","retry");
      return false;
    }
    homeEditorial.films=films;
    homeEditorial.loadedKey=apiKey;
    homeEditorial.details.clear();homeEditorial.directorData.clear();homeEditorial.featureDetails=null;
    store.set("kgHomeEditorial",{films,ts:Date.now()});
    renderHomeEditorial();
    return results.every(result=>result.status==="fulfilled");
  })();
  homeEditorial.pending=pending;
  try{return await pending;}finally{
    if(homeEditorial.pending===pending){homeEditorial.pending=null;homeEditorial.loading=false;}
  }
}
homeEditorialRoot.addEventListener("click",async e=>{
  const detailAction=e.target.closest("#kg-home-feature [data-act],#kg-home-europe-detail [data-act]");
  if(detailAction){
    e.stopPropagation();
    if(detailAction.dataset.act==="close-film"){
      const placement=D.selected&&D.selected._placement;
      if(placement==="home"){
        D.selected=null;renderHomeEditorial();
      }else{
        if(placement&&placement.startsWith("home"))D.selected=null;
        const container=detailAction.closest("#kg-home-europe-detail");
        if(container){container.replaceChildren();container.hidden=true;}
      }
    }else if(detailAction.dataset.act==="bm"){
      const id=Number(detailAction.dataset.id);
      BOOK.has(id)?BOOK.delete(id):BOOK.add(id);
      store.set("kgBookmarks",[...BOOK]);
      if(D.selected&&D.selected._placement.startsWith("home")&&D.selected.id===id)renderSelectedPanel();
      toast(BOOK.has(id)?"Добавлено в закладки":"Убрано из закладок","bookmark");
    }
    return;
  }
  const button=e.target.closest("[data-home-act]");
  if(!button)return;
  e.stopPropagation();
  const action=button.dataset.homeAct;
  if(action==="set-key"){
    const banner=$("tmdb-key-banner");banner.classList.remove("hidden");banner.scrollIntoView({behavior:"smooth",block:"center"});$("tmdb-key-input").focus();return;
  }
  if(action==="retry"){homeEditorial.loadedKey="";loadHomeEditorial();return;}
  const film=homeEditorial.films.find(f=>String(f.id)===button.dataset.id);
  if(!film)return;
  if(action==="open"){
    if(button.dataset.homeMeta){homeEditorial.scrollAnchorId=String(film.id);openFilm(film,"home-europe");}
    else openFilm(film,"home");
    return;
  }
  if(action==="trailer"){
    openFilm(film,"home");
    return;
  }
  if(action==="bookmark"){
    BOOK.has(film.id)?BOOK.delete(film.id):BOOK.add(film.id);
    store.set("kgBookmarks",[...BOOK]);
    toast(BOOK.has(film.id)?"Добавлено в закладки":"Убрано из закладок","bookmark");
    renderHomeEditorial();return;
  }
  if(action==="share"){
    try{
      const info={title:film.title||film.original_title||"Фильм",text:"Посмотри этот фильм в Kinoglobus",url:`https://www.themoviedb.org/movie/${film.id}`};
      if(navigator.share)await navigator.share(info);
      else if(navigator.clipboard&&navigator.clipboard.writeText){await navigator.clipboard.writeText(info.url);toast("Ссылка скопирована","link");}
      else throw new Error("Поделиться из этого браузера не удалось.");
    }catch(error){
      if(error.name!=="AbortError"){console.error("[Kinoglobus] Не удалось поделиться фильмом:",error);toast("Не удалось поделиться фильмом","share");}
    }
  }
});
$("kg-home-europe-link").addEventListener("click",()=>{
  const carousel=$("kg-home-europe");carousel.scrollTo({left:carousel.scrollWidth,behavior:"smooth"});
});
async function settleWithLimit(items,limit,work){
  const results=new Array(items.length);let next=0;
  await Promise.all(Array.from({length:Math.min(limit,items.length)},async()=>{
    while(next<items.length){
      const index=next++;
      try{results[index]={status:"fulfilled",value:await work(items[index],index)};}
      catch(reason){results[index]={status:"rejected",reason};}
    }
  }));
  return results;
}
async function refreshAllCollections(forceAll=false){
  const results=await settleWithLimit(THEMES,4,async t=>{
    const cached=themeDataCache.get(themeDataKey(t,2));
    if(!forceAll&&cached&&cached.date===localDateKey()&&Date.now()-cached.ts<DAY_MS)return cached.data;
    const data=await loadTheme(t,2,true);
    if(data._stale)throw new Error("Сохранённые данные подборки не удалось обновить.");
    const firstPage=themeDataCache.get(themeDataKey(t,1))?.data;
    if(firstPage){saveThemeMeta(t,firstPage);if(catBuilt)paintMeta(t.id);}
    return data;
  });
  if(sortMode!=="curated")sortCatalog();
  const activeIndex=view==="collection"&&D.t?THEMES.findIndex(t=>t.id===D.t.id):-1;
  if(activeIndex>=0){
    const result=results[activeIndex];
    if(result.status==="fulfilled"){
      const t=D.t,r=result.value;
      D.all=r.films;D.total=r.total;D.totals=r.totals;
      $("cl-count").textContent=nf(r.total)+" "+(fw(r.total)==="фильм"?"картина":fw(r.total)==="фильма"?"картины":"картин");
      renderFilms();
    }
  }
  return results.every(r=>r.status==="fulfilled");
}
function localDateKey(date=new Date()){
  return [date.getFullYear(),String(date.getMonth()+1).padStart(2,"0"),String(date.getDate()).padStart(2,"0")].join("-");
}
function dailyRefreshDue(){
  const last=Number(store.get("kgDailyRefreshAt",0));
  return !last||Date.now()-last>=DAY_MS||store.get("kgDailyRefreshDate","")!==localDateKey();
}
let dailyRefreshPromise=null,dailyAttemptAt=0;
async function refreshDailyData(force=false,ignoreCooldown=false){
  if(!apiKey||(!force&&!dailyRefreshDue()))return false;
  if(dailyRefreshPromise)return dailyRefreshPromise;
  if(!ignoreCooldown&&Date.now()-dailyAttemptAt<15*60*1000)return false;
  dailyAttemptAt=Date.now();
  const pending=(async()=>{
    if(typeof window.invalidateFilmDataCaches==="function")window.invalidateFilmDataCaches();
    const results=await Promise.all([
      loadHomeEditorial(true),
      refreshAllCollections(force)
    ]);
    if(results.every(Boolean)){
      const now=Date.now();
      store.set("kgDailyRefreshAt",now);
      store.set("kgDailyRefreshDate",localDateKey());
      return true;
    }
    console.warn("[Kinoglobus] Ежедневное обновление выполнено частично; сохранённые данные оставлены.");
    setTimeout(()=>refreshDailyData(),15*60*1000);
    return false;
  })();
  dailyRefreshPromise=pending;
  try{return await pending;}finally{if(dailyRefreshPromise===pending)dailyRefreshPromise=null;}
}
function checkDailyRefresh(){updateWeeklySpotlight();if(dailyRefreshDue())refreshDailyData();}
function scheduleDailyRefresh(){
  const now=new Date(),next=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1,0,0,5);
  const weekBoundary=(Math.floor(Date.now()/6048e5)+1)*6048e5;
  setTimeout(()=>{checkDailyRefresh();scheduleDailyRefresh();},Math.max(1000,Math.min(next.getTime(),weekBoundary)-Date.now()));
}
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")checkDailyRefresh();});
window.addEventListener("pageshow",checkDailyRefresh);
window.addEventListener("focus",checkDailyRefresh);
const refreshForNewKey=()=>{
  homeEditorial.loadedKey="";
  if(view==="mood"){vm.dataset.key="";showView("mood");}
  if(view==="oscar"){vo.dataset.key="";showView("oscar");}
  refreshDailyData(true,true);
};
$("tmdb-key-save").addEventListener("click",refreshForNewKey);
$("saveKey").addEventListener("click",()=>setTimeout(refreshForNewKey,0));
const savedHome=store.get("kgHomeEditorial",null);
if(savedHome&&Array.isArray(savedHome.films)&&savedHome.films.length){
  homeEditorial.films=savedHome.films;
  homeEditorial.loadedKey=apiKey;
  renderHomeEditorial();
}
if(dailyRefreshDue())refreshDailyData();
else if(!homeEditorial.films.length)loadHomeEditorial();
scheduleDailyRefresh();
showView("home");
window.KINOGLOBUS_THEME_COVERS = THEME_COVERS;
console.info("[Kinoglobus] v8 collections ready + theme covers");
})();
