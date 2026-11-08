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

/* ---------- данные подборок ---------- */
const CAT={noir:["Триллер и Нуар","NOIR • CRIME"],horror:["Ужасы и Мистика","HORROR • MYSTERY"],drama:["Драма и Авторское","DRAMA • AUTEUR"],action:["Экшен и Фэнтези","ACTION • FANTASY"],retro:["Историческое","RETRO • WAR"]};
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
latam:["noir","Latin American Noir","Тайны фавел, коррупция мегаполисов и аргентинский саспенс","Тайны фавел, коррупция мегаполисов и аргентинский саспенс: латиноамериканский нуар."]
};
const REG={nordic:["Скандинавия","NORD"],cnfan:["Китай, Гонконг","CN"],latam:["Латинская Америка","LATAM"]};
const ICON={nordic:"ac_unit"};
const T=Object.fromEntries(THEMES.map(t=>[t.id,t]));
const cat=t=>(TM[t.id]||["noir"])[0];

/* ---------- утилиты ---------- */
const fl=cc=>`<span class="kgf">${flag(cc,false)}</span>`;
const P=(p,s)=>p?`https://image.tmdb.org/t/p/${s||"w185"}${p}`:"";
const nf=n=>new Intl.NumberFormat("ru-RU").format(n);
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
async function loadTheme(t,pages){
  const jobs=[];
  t.cc.forEach(cc=>{for(let p=1;p<=pages;p++)jobs.push(api({...qs(t,cc),page:p}).then(r=>({cc,p,total:r.total_results||0,films:(r.results||[]).map(f=>({...f,_cc:cc}))})));});
  const parts=await Promise.all(jobs);
  const totals={},ids=new Set();let films=[];
  parts.forEach(x=>{if(x.p===1)totals[x.cc]=x.total;films.push(...x.films.filter(f=>!ids.has(f.id)&&ids.add(f.id)));});
  const total=Object.values(totals).reduce((a,b)=>a+b,0);
  films.sort((a,b)=>weighed(b)-weighed(a));
  return {total,totals,films};
}
const META=store.get("kgThemeMeta",{});
const FRESH=12*3600e3;
async function loadMeta(t){
  const m=META[t.id];
  if(m&&Date.now()-m.ts<FRESH) return m;
  const d=await loadTheme(t,1);
  const top=d.films.slice(0,10);
  const r=top.length?top.reduce((s,f)=>s+Number(f.vote_average||0),0)/top.length:0;
  const meta={n:d.total,r:r?r.toFixed(1):"",p:(d.films.find(f=>f.poster_path)||{}).poster_path||"",b:(d.films.find(f=>f.backdrop_path)||{}).backdrop_path||"",ts:Date.now()};
  META[t.id]=meta;store.set("kgThemeMeta",META);
  return meta;
}

/* ---------- экраны и навигация ---------- */
const vc=document.createElement("div");vc.id="view-collections";
vc.className="flex flex-col w-full px-gutter-mobile gap-space-lg select-none";vc.style.display="none";
const vd=document.createElement("div");vd.id="view-collection";
vd.className="flex flex-col w-full px-margin-mobile gap-space-lg select-none pb-space-xl";vd.style.display="none";
home.after(vc);vc.after(vd);

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
  view=v;
  home.style.display=v==="home"?"":"none";
  vc.style.display=v==="collections"?"":"none";
  vd.style.display=v==="collection"?"":"none";
  const act=v==="collection"?"collections":v;
  nav.querySelectorAll("[data-view]").forEach(a=>{a.className=NB+(a.dataset.view===act&&a.dataset.view!=="journey"?NON:NOFF);});
  const sub=document.querySelector("header .flex-col > p");
  if(sub) sub.textContent=v==="home"?"Случайная страна · Лучшие фильмы":"Киноглобус — Тематическая Подборка";
  scrollTo({top:0});
  if(v==="collections") initCatalog();
}
nav.addEventListener("click",e=>{
  const a=e.target.closest("[data-view]");if(!a)return;e.preventDefault();
  if(a.dataset.view==="journey"){$("mapBtn").click();return;}
  showView(a.dataset.view);
});

// запуск настоящего вращения глобуса по выбранной подборке
function spinTheme(id){
  playMode="filters";store.set("playMode",playMode);applyMode();
  themeId=id;store.set("theme",id);paintThemes();paintGo();
  showView("home");
  setTimeout(()=>$("btn-spin-roulette").click(),200);
}

/* ================= КАТАЛОГ ================= */
let catBuilt=false,activeCat="all",sortMode="curated";
function spotlightTheme(){return THEMES[Math.floor(Date.now()/6048e5)%THEMES.length];}

function cardHtml(t,i){
  const m=TM[t.id]||["noir","","",""],special=t.id==="suwar";
  const g0=gnames(t)[0]||"";
  const top=special?`<div class="flex items-center justify-between mb-2"><span class="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container/60 text-secondary font-micro-caption text-micro-caption font-bold"><span class="material-symbols-outlined text-[13px]">history_edu</span>АРХИВ ИСЧЕЗНУВШИХ ЭПОХ</span><span data-k="r" class="font-micro-caption text-micro-caption text-primary-container font-bold">★ …</span></div>`:"";
  const rate=special?"":`<span data-k="r" class="px-2 py-0.5 rounded-full bg-primary-container/15 text-primary-container font-micro-caption text-micro-caption font-bold flex-shrink-0">★ …</span>`;
  const btn=special
    ?`<button type="button" data-act="spin" data-t="${t.id}" class="px-2.5 py-1 rounded-lg bg-primary-container text-on-primary-container font-label-sm text-label-sm font-bold flex items-center gap-1 shadow-[0_0_12px_rgba(255,184,48,0.25)]"><span>Рулетка</span><span class="material-symbols-outlined text-[14px]">casino</span></button>`
    :`<button type="button" aria-label="Крутить" data-act="spin" data-t="${t.id}" class="w-8 h-8 rounded-full bg-surface-container-high hover:bg-primary-container hover:text-on-primary-container text-primary flex items-center justify-center transition-all"><span class="material-symbols-outlined text-[18px]">casino</span></button>`;
  return `<article class="collection-card relative flex flex-col ${special?"p-4 bg-gradient-to-br from-cinema-velvet-deep/40 via-surface-panel to-surface-panel shadow-[0_6px_24px_rgba(0,0,0,0.6)]":"p-3.5 bg-surface-panel shadow-[0_4px_20px_rgba(0,0,0,0.45)]"} rounded-2xl transition-all active:scale-[0.99] cursor-pointer" data-t="${t.id}" data-cat="${m[0]}" data-i="${i}">
${top}<div class="flex items-start gap-3">
<div class="relative w-20 h-28 rounded-lg overflow-hidden shrink-0 bg-surface-container-high"><img data-k="img" alt="" class="w-full h-full object-cover opacity-0 transition-opacity duration-500 ${special?"grayscale contrast-125":""}"><span class="absolute bottom-1 right-1 px-1.5 rounded bg-surface-container-lowest/80 text-[10px] font-bold text-primary">${esc(codeOf(t))}</span></div>
<div class="flex flex-col min-w-0 flex-1 justify-between h-28"><div>
<div class="flex items-center justify-between gap-1"><span class="font-micro-caption text-micro-caption text-text-muted flex items-center gap-1 truncate">${flagsOf(t)} ${esc(where(t))}</span>${rate}</div>
<h4 class="font-headline-sm text-headline-sm text-primary font-bold truncate mt-0.5">${i+1}. ${esc(t.name)}</h4>
<p class="font-micro-caption text-micro-caption text-on-surface-variant ${special?"kg-clip2":"truncate"} mt-0.5">${esc(m[2])}</p></div>
<div class="flex items-center justify-between pt-1"><span data-k="cnt" class="font-label-sm text-label-sm text-text-muted truncate">… · ${esc(g0)}</span>${btn}</div>
</div></div></article>`;
}

function spotlightHtml(t){
  const m=TM[t.id]||["noir","","",""];
  return `<section id="spot" data-t="${t.id}" class="relative w-full rounded-2xl overflow-hidden bg-surface-panel shadow-[0_14px_34px_-10px_rgba(0,0,0,0.85)]">
<div data-k="bg" class="w-full h-56 bg-cover bg-center relative bg-surface-container-high"><div class="absolute inset-0 bg-gradient-to-t from-surface-panel via-surface-panel/60 to-transparent"></div>
<div class="absolute top-3 left-3 right-3 flex items-center justify-between"><div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cinema-velvet-deep text-secondary font-micro-caption text-micro-caption shadow-md"><span class="material-symbols-outlined text-[14px]">local_fire_department</span>ХИТ НЕДЕЛИ</div>
<div class="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-lowest/80 backdrop-blur-md text-primary font-label-sm text-label-sm"><span class="material-symbols-outlined text-[15px] text-primary-container" style="font-variation-settings:'FILL' 1;">star</span><span data-k="r">…</span></div></div>
<div class="absolute bottom-3 left-3.5 right-3.5 flex items-center gap-1.5"><span class="px-2 py-0.5 rounded-full bg-surface-container-high/90 backdrop-blur text-primary font-micro-caption text-micro-caption tracking-wider">${t.cc.map(fl).join(" ")}</span><span class="font-micro-caption text-micro-caption text-text-muted truncate">${esc(t.cc.map(cname).join(", "))}</span></div></div>
<div class="p-4 flex flex-col gap-2.5"><div class="flex items-baseline justify-between"><h3 class="font-headline-md text-headline-md text-primary font-bold">${esc(t.name)}</h3><span data-k="cnt" class="font-micro-caption text-micro-caption text-text-muted">…</span></div>
<p class="font-body-sm text-body-sm text-text-muted kg-clip2">${esc(m[3])}</p>
<div class="flex items-center gap-2 pt-1"><button type="button" data-act="spin" data-t="${t.id}" class="flex-1 h-11 px-4 rounded-xl bg-primary-container text-on-primary-container font-label-md text-label-md flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,184,48,0.32)] transition-transform active:scale-95"><span class="material-symbols-outlined text-[20px]">casino</span><span>Крутить рулетку</span></button>
<button type="button" aria-label="Подробнее" data-act="open" data-t="${t.id}" class="w-11 h-11 rounded-xl bg-surface-container-high text-primary flex items-center justify-center transition-colors hover:bg-surface-bright active:scale-95"><span class="material-symbols-outlined text-[20px]">arrow_forward</span></button></div></div></section>`;
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
<div id="cat-clear" data-act="clear" style="display:none" class="absolute inset-y-0 right-0 pr-3 items-center cursor-pointer text-text-muted hover:text-primary"><span class="material-symbols-outlined text-[18px]">cancel</span></div></div></section>
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
  document.querySelectorAll(`#view-collections [data-t="${id}"]`).forEach(el=>{
    if(el.id==="spot"){
      const bg=el.querySelector('[data-k="bg"]');
      const src=m.b?P(m.b,"w780"):P(m.p,"w500");
      if(src) bg.style.backgroundImage=`url('${src}')`;
    }
    const r=el.querySelector('[data-k="r"]');
    if(r){const sp=el.id==="spot";r.textContent=sp?(m.r||"—"):(el.dataset.cat==="retro"&&el.classList.contains("collection-card")?"★ "+(m.r||"—"):"★ "+(m.r||"—"));}
    const c=el.querySelector('[data-k="cnt"]');
    if(c){const g=gnames(T[id])[0]||"";c.textContent=el.id==="spot"?`${nf(m.n)} ${fw(m.n)}`:`${nf(m.n)} ${fw(m.n)}${g?" · "+g:""}`;}
    const img=el.querySelector('[data-k="img"]');
    if(img&&m.p){img.onload=()=>img.classList.remove("opacity-0");img.src=P(m.p,"w185");}
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
  const grid=$("cat-grid"),cards=[...grid.children];
  cards.sort((a,b)=>{
    const ma=META[a.dataset.t]||{},mb=META[b.dataset.t]||{};
    if(sortMode==="rating")return (parseFloat(mb.r)||0)-(parseFloat(ma.r)||0);
    if(sortMode==="count")return (mb.n||0)-(ma.n||0);
    if(sortMode==="title")return T[a.dataset.t].name.localeCompare(T[b.dataset.t].name,"ru");
    return a.dataset.i-b.dataset.i;
  }).forEach(c=>grid.appendChild(c));
}
async function loadAllMeta(){
  const note=$("cat-note");
  if(!apiKey){note.textContent="Введите ключ TMDB на экране «Глобус», чтобы увидеть число фильмов и рейтинги подборок.";note.style.display="";return;}
  note.style.display="none";
  await Promise.all(THEMES.map(t=>loadMeta(t).then(()=>paintMeta(t.id)).catch(()=>{})));
  if(sortMode!=="curated")sortCatalog();
}
function initCatalog(){
  if(!catBuilt)buildCatalog();
  THEMES.forEach(t=>paintMeta(t.id));
  loadAllMeta();
}
vc.addEventListener("input",e=>{
  if(e.target.id==="cat-search"){$("cat-clear").style.display=e.target.value?"flex":"none";filterCatalog();}
});
vc.addEventListener("change",e=>{if(e.target.id==="cat-sort"){sortMode=e.target.value;sortCatalog();}});
vc.addEventListener("click",e=>{
  const chip=e.target.closest("#cat-chips [data-f]");
  if(chip){activeCat=chip.dataset.f;vc.querySelectorAll("#cat-chips [data-f]").forEach(c=>c.className=chipCls(c===chip));filterCatalog();return;}
  const act=e.target.closest("[data-act]");
  if(act){
    const a=act.dataset.act;
    if(a==="spin"){e.stopPropagation();spinTheme(act.dataset.t);return;}
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
  const card=e.target.closest(".collection-card");
  if(card)openCollection(card.dataset.t);
});

/* ================= СТРАНИЦА ПОДБОРКИ ================= */
let D={t:null,all:[],total:0,totals:{},cc:"",sort:"rating",shown:5};
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
  return `<div class="flex gap-space-sm p-3 rounded-xl bg-surface-panel shadow-md hover:bg-surface-container-low transition-colors cursor-pointer" data-act="open" data-id="${f.id}">
<div class="relative w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-surface-container-high">${f.poster_path?`<img class="w-full h-full object-cover" loading="lazy" alt="" src="${P(f.poster_path,"w185")}">`:`<div class="w-full h-full flex items-center justify-center text-text-muted"><span class="material-symbols-outlined">movie</span></div>`}
<span class="absolute top-1 left-1 px-1 py-0.5 rounded bg-surface-panel/90 text-primary-container font-micro-caption text-micro-caption font-bold">${Number(f.vote_average).toFixed(1)} ★</span></div>
<div class="flex flex-col justify-between flex-1 min-w-0"><div class="flex flex-col gap-0.5">
<div class="flex items-center justify-between"><span class="font-micro-caption text-micro-caption text-text-muted">${fl(f._cc)} ${esc(cname(f._cc))}${y?" • "+y:""}</span><span data-rt="${f.id}" class="font-micro-caption text-micro-caption px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant">— мин</span></div>
<h4 class="font-label-lg text-label-lg text-on-surface font-bold truncate">${esc(f.title)}</h4>
<p data-dir="${f.id}" class="font-micro-caption text-micro-caption text-text-muted truncate">&nbsp;</p>
<div class="flex items-center gap-1.5 pt-1">${gs.map(g=>`<span class="px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-micro-caption text-micro-caption">${esc(g)}</span>`).join("")}</div></div>
<div class="flex items-center justify-end gap-2 pt-2">
<button type="button" data-act="trailer" data-id="${f.id}" title="Трейлер" class="text-text-muted hover:text-primary transition-colors p-1"><span class="material-symbols-outlined text-[18px]">play_arrow</span></button>
<button type="button" data-act="bm" data-id="${f.id}" title="В закладки" class="text-primary-container hover:text-primary transition-colors p-1"><span class="material-symbols-outlined text-[18px]">${bm?"bookmark_added":"bookmark_border"}</span></button></div></div></div>`;
}
function pearlHtml(f){
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
<div class="flex items-center gap-space-sm pt-1"><button type="button" data-act="trailer" data-id="${f.id}" class="flex-1 py-2.5 px-3 rounded-lg bg-surface-container-high text-primary-fixed hover:bg-surface-bright font-label-md text-label-md font-semibold flex items-center justify-center gap-1.5 transition-colors"><span class="material-symbols-outlined text-[18px]">play_circle</span>Смотреть трейлер</button>
<button type="button" data-act="bm" data-id="${f.id}" aria-label="Сохранить" class="w-11 h-11 flex-shrink-0 rounded-lg bg-surface-container-high text-primary-container flex items-center justify-center transition-transform active:scale-95 shadow-sm"><span class="material-symbols-outlined text-[20px]" style="font-variation-settings:'FILL' 1;">${bm?"bookmark_added":"bookmark_border"}</span></button></div></div></div>`;
}
function renderFilms(){
  const box=$("cl-films");if(!box)return;
  const {best,rest}=derived();
  if(!best){box.innerHTML='<p class="font-body-sm text-body-sm text-text-muted px-1">Подходящих фильмов не нашлось.</p>';return;}
  const list=rest.slice(0,D.shown);
  box.innerHTML=pearlHtml(best)+
  `<div class="flex flex-col gap-space-sm"><div class="flex items-center justify-between px-1"><h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">Отобранные шедевры</h3><span class="font-micro-caption text-micro-caption text-text-muted">${list.length} из ${nf(Math.max(totalFor(),list.length+1))}</span></div>
  <div class="flex flex-col gap-space-sm">${list.map(filmItem).join("")}</div>
  ${rest.length>D.shown?`<button type="button" data-act="more" class="w-full py-3 rounded-xl bg-surface-panel hover:bg-surface-container-low text-primary text-center font-label-md text-label-md font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"><span class="material-symbols-outlined text-[18px]">expand_more</span><span>Показать ещё</span></button>`:""}</div>`;
  [best,...list].forEach(f=>filmDetails(f.id).then(d=>{
    const rt=vd.querySelectorAll(`[data-rt="${f.id}"]`),dr=vd.querySelectorAll(`[data-dir="${f.id}"]`);
    rt.forEach(e=>e.textContent=d.runtime?d.runtime+" мин":"");
    dr.forEach(e=>e.textContent=d.dirs.length?"Реж. "+d.dirs.slice(0,2).join(", "):"");
  }).catch(()=>{}));
}
function otherHtml(t){
  const m=META[t.id]||{};
  return `<a href="#" data-act="goto" data-t="${t.id}" class="flex flex-col gap-1.5 p-3 rounded-xl bg-surface-panel hover:bg-surface-container-low min-w-[140px] max-w-[140px] flex-shrink-0 transition-colors shadow-md"><div class="w-full h-20 rounded-lg overflow-hidden bg-surface-container-high" data-oi="${t.id}">${m.p?`<img class="w-full h-full object-cover" alt="" src="${P(m.p,"w185")}">`:""}</div><span class="font-label-sm text-label-sm text-on-surface font-bold truncate">${esc(t.name)} ${fl(t.cc[0])}</span><span data-oc="${t.id}" class="font-micro-caption text-micro-caption text-text-muted">${m.n?nf(m.n)+" "+fw(m.n):"…"}</span></a>`;
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
<button type="button" data-act="spin" class="relative group w-full py-3.5 px-4 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(255,184,48,0.28)] transition-all active:scale-[0.98] overflow-hidden"><span id="cl-ricon" class="material-symbols-outlined text-[22px]">casino</span><span id="cl-rtext">Крутить внутри подборки</span><div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div></button>
<div id="cl-toast" data-act="toast" style="display:none" class="items-center justify-between p-2.5 rounded-lg bg-surface-container-high text-primary-fixed transition-all cursor-pointer"><div class="flex items-center gap-2 min-w-0"><span class="material-symbols-outlined text-[18px] text-primary-container">done_all</span><span id="cl-ttitle" class="font-label-sm text-label-sm font-semibold truncate"></span></div><span id="cl-trate" class="font-micro-caption text-micro-caption text-text-muted flex-shrink-0"></span></div>
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
    if(i&&m.p&&!i.firstChild)i.innerHTML=`<img class="w-full h-full object-cover" alt="" src="${P(m.p,"w185")}">`;
  }).catch(()=>{}));
}

async function openCollection(id){
  const t=T[id];if(!t)return;
  D={t,all:[],total:0,totals:{},cc:"",sort:"rating",shown:5};
  renderCollection();showView("collection");
  if(!apiKey){$("cl-films").innerHTML='<p class="font-body-sm text-body-sm text-text-muted px-1">Введите ключ TMDB на экране «Глобус», чтобы загрузить фильмы подборки.</p>';return;}
  try{
    const r=await loadTheme(t,2);
    if(D.t!==t)return;
    D.all=r.films;D.total=r.total;D.totals=r.totals;
    $("cl-count").textContent=nf(r.total)+" "+(fw(r.total)==="фильм"?"картина":fw(r.total)==="фильма"?"картины":"картин");
    renderFilms();
  }catch(e){
    $("cl-films").innerHTML=`<p class="font-body-sm text-body-sm text-feedback-error px-1">${esc(e.message||"Не удалось загрузить подборку.")}</p>`;
  }
}

function openFilm(f){
  const byCountry={};D.all.forEach(x=>byCountry[x.id]=x._cc);
  const films=shuffle(D.all.filter(x=>x.id!==f.id&&x.poster_path)).slice(0,60);films.push(f);
  showView("home");
  show(f._cc,{films,votes:0,total:D.total,themeName:D.t.name,byRating:true,byCountry},f);
}
async function playTrailer(f){
  const w=window.open("","_blank");
  try{
    const k=await trailerFor(f);
    if(k&&w){w.location.href=watchUrl(k);}
    else{if(w)w.close();toast("Трейлера нет","movie");}
  }catch(e){if(w)w.close();toast("Не удалось найти трейлер","movie");}
}
function inPageRoulette(){
  const pool=D.all.filter(f=>(!D.cc||f._cc===D.cc)&&!seen.has(f.id));
  if(!pool.length){toast("Все фильмы из выборки уже в истории","history");return;}
  const ic=$("cl-ricon"),tx=$("cl-rtext"),tt=$("cl-toast");
  ic.classList.add("animate-spin");tx.textContent="Ищем в подборке...";
  try{audio();}catch(e){}
  setTimeout(()=>{
    const f=pick(pool);D.picked=f;
    $("cl-ttitle").textContent="Выпало: "+cname(f._cc)+" · "+f.title;
    $("cl-trate").textContent=Number(f.vote_average).toFixed(1)+" ★";
    tt.style.display="flex";
    ic.classList.remove("animate-spin");tx.textContent="Крутить ещё раз";
    try{sWin();}catch(e){}
  },650);
}
vd.addEventListener("click",e=>{
  const el=e.target.closest("[data-act]");if(!el)return;
  const a=el.dataset.act;
  if(a==="back"){e.preventDefault();showView("collections");return;}
  if(a==="goto"){e.preventDefault();openCollection(el.dataset.t);return;}
  if(a==="spin"){inPageRoulette();return;}
  if(a==="toast"){if(D.picked)openFilm(D.picked);return;}
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
  if(a==="trailer"){e.stopPropagation();playTrailer(f);return;}
  if(a==="bm"){
    e.stopPropagation();
    BOOK.has(f.id)?BOOK.delete(f.id):BOOK.add(f.id);store.set("kgBookmarks",[...BOOK]);
    const ic=el.querySelector(".material-symbols-outlined");if(ic)ic.textContent=BOOK.has(f.id)?"bookmark_added":"bookmark_border";
    toast(BOOK.has(f.id)?"Добавлено в закладки":"Убрано из закладок","bookmark");return;
  }
  if(a==="open")openFilm(f);
});

// старая кнопка «Подборки» из bridge v6 теперь ведёт в каталог
document.querySelectorAll('[data-path="podborki-i-zhanry"]').forEach(a=>a.addEventListener("click",e=>{e.preventDefault();showView("collections");}));
showView("home");
console.info("[Kinoglobus] v7 collections ready");
})();
