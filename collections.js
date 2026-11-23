// ========== Bridge v7: «Подборки» (каталог + страница подборки + нижняя навигация) ==========
(function(){
const $=id=>document.getElementById(id);
const main=document.querySelector("main");
const home=main&&main.querySelector(":scope > div");
if(!home||typeof THEMES==="undefined"){console.error("[Moven] v7: движок не найден");return;}

/* ---------- стили ---------- */
const st=document.createElement("style");
st.textContent=".kgf{display:inline-flex;align-items:center;vertical-align:middle}.kgf img.flag-img{width:1.25em;height:.9em;object-fit:cover;border-radius:2px}.kgf svg{width:1.25em;height:.9em}.kgf .wave{width:auto;height:auto;flex:none}.kg-clip2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}";
document.head.appendChild(st);
const st2=document.createElement("style");
st2.textContent=`.kgr-win{position:relative;height:150px;overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,rgb(var(--kg-black)) 13%,rgb(var(--kg-black)) 87%,transparent);mask-image:linear-gradient(90deg,transparent,rgb(var(--kg-black)) 13%,rgb(var(--kg-black)) 87%,transparent)}
#cat-search::-webkit-search-cancel-button{display:none}
#view-series-collections[hidden]{display:none}
[data-collection-controls]{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px;width:100%}
[data-collection-controls]>button{min-width:0;min-height:40px;padding-inline:4px;line-height:1.2}
[data-collection-controls]>button:disabled{opacity:.55}
.kgr-track{position:absolute;inset:0;overflow:hidden}
.kgr-run{position:absolute;left:0;top:0;height:100%;display:flex;align-items:center;gap:10px;padding-left:8px;will-change:transform}
.kgr-run.fast{filter:blur(1.4px) brightness(1.08)}
.kgr-cell{box-sizing:border-box;position:relative;flex:none;width:80px;height:112px;border-radius:6px;overflow:hidden;background:rgb(var(--kg-surface-container));border:1px solid rgb(var(--kg-surface-border));opacity:.62;transition:opacity .45s,transform .45s,box-shadow .45s;color:rgb(var(--kg-text-muted));font-size:10px;line-height:1.2;pointer-events:none;user-select:none}
.kgr-cell img{width:100%;height:100%;object-fit:cover;display:block}
.kgr-cell .nop{width:100%;height:100%;display:flex;align-items:center;justify-content:center;text-align:center;padding:4px}
.kgr-cell.spin{opacity:.92}
.kgr-cell.chosen{opacity:1;transform:scale(1.07);box-shadow:0 0 22px rgb(var(--kg-primary-container)/.55)}
.kgr-cell .yr{position:absolute;left:0;right:0;bottom:0;background:rgb(var(--kg-black)/.78);font:600 9px/1.4 ui-monospace,monospace;text-align:center;color:rgb(var(--kg-text-muted))}
.kgr-frame{position:absolute;left:50%;top:50%;width:94px;height:128px;transform:translate(-50%,-50%);z-index:5;pointer-events:none;border:2px solid rgb(var(--kg-primary-container));border-radius:10px;box-shadow:0 0 18px rgb(var(--kg-primary-container)/.5),inset 0 0 14px rgb(var(--kg-primary-container)/.22)}
.kgr-frame.hit{animation:kgrHit 1s cubic-bezier(.2,.8,.25,1)}
@keyframes kgrHit{0%{box-shadow:0 0 0 0 rgb(var(--kg-primary-container)/.8),inset 0 0 14px rgb(var(--kg-primary-container)/.22)}45%{box-shadow:0 0 38px 8px rgb(var(--kg-primary-container)/.75),inset 0 0 22px rgb(var(--kg-primary-container)/.4)}100%{box-shadow:0 0 18px rgb(var(--kg-primary-container)/.5),inset 0 0 14px rgb(var(--kg-primary-container)/.22)}}
.kgr-rise{animation:kgrRise .6s cubic-bezier(.2,.7,.2,1) both}
@keyframes kgrRise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.kg-clip3{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.kg-home-europe{scrollbar-width:none;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch}
.kg-home-europe::-webkit-scrollbar{display:none}
.kg-home-film-wrap{flex:0 0 10rem;width:10rem;min-width:0;scroll-snap-align:start}
.kg-home-film-poster{position:relative;display:grid;place-items:center;width:100%;aspect-ratio:2/3;overflow:hidden}
.kg-home-film-poster>img{position:absolute;inset:0;display:block;width:100%;height:100%;object-fit:cover}
#kg-home-feature .kg-day-poster{width:44%;max-width:192px;aspect-ratio:2/3}
.kg-three-columns{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.5rem;align-items:start}
.kg-film-grid-row{column-gap:clamp(10px,3.3vw,14px);padding-bottom:.55rem}
#view-collection .kg-film-grid-row{margin-inline:-4px}
.kg-film-grid-tile{box-sizing:border-box;display:block;width:100%;min-width:0;padding:0;text-align:left}
.kg-film-grid-tile:focus-visible{outline:2px solid rgb(var(--kg-primary));outline-offset:3px;border-radius:.5rem}
.kg-film-grid-poster{box-sizing:border-box;position:relative;display:block;width:100%;aspect-ratio:2/3;overflow:hidden;border-radius:clamp(10px,3vw,16px);background:rgb(var(--kg-surface-container-high));border:1px solid rgb(var(--kg-on-surface) / .10)}
.kg-film-grid-poster>img,:is(#cat-grid,[data-tv-grid]).kg-three-columns .kg-film-card-poster>img{position:absolute;inset:0;display:block;width:100%;height:100%;object-fit:cover}
.kg-film-grid-score{position:absolute;top:.45rem;right:.45rem;padding:.13rem .42rem;border-radius:.65rem;background:rgb(var(--kg-black)/.74);color:rgb(var(--kg-white));font-size:.78rem;font-weight:700;font-variant-numeric:tabular-nums;line-height:1.4}
.kg-film-grid-title{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;overflow-wrap:anywhere;min-height:2.7em;margin-top:.5rem;padding-inline:.125rem;color:rgb(var(--kg-on-surface));font-size:.875rem;font-weight:500;line-height:1.35}
.kg-film-grid-tile:hover .kg-film-grid-title{color:rgb(var(--kg-primary))}
#cl-films .kg-film-list-shell > [data-act="open"]:has(+ .kg-film-detail){display:none}
#cl-films .kg-film-grid-tile[aria-expanded="true"] .kg-film-grid-poster{visibility:hidden}
:is(#cat-grid,[data-tv-grid]).kg-three-columns{column-gap:clamp(10px,3.3vw,14px)}
:is(#cat-grid,[data-tv-grid]).kg-three-columns .collection-card{padding:0;border:0;min-width:0;background:none;box-shadow:none;gap:.4rem}
.kg-catalog-grid-cover{display:none;position:relative;aspect-ratio:2/3;overflow:hidden;border-radius:clamp(10px,3vw,16px);background:rgb(var(--kg-surface-container-high))}
.kg-catalog-grid-cover img{display:block;width:100%;height:100%;object-fit:cover}
.kg-three-columns .kg-catalog-grid-cover{display:block}
.kg-three-columns .kg-catalog-title{white-space:normal;overflow-wrap:anywhere;font-size:.82rem;line-height:1.25;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.5em}
.kg-three-columns :is(.kg-catalog-meta,.kg-catalog-summary,.kg-catalog-preview,.kg-catalog-actions),
:is(#view-collections,#view-series-collections):has(:is(#cat-grid,[data-tv-grid]).kg-three-columns) [data-collection-spot] [data-act="spin"]{display:none}
.kg-catalog-list,.kg-catalog-spot{margin-inline:-4px}
.kg-catalog-list{display:flex;flex-direction:column;gap:15px}
.collection-card{display:flex;flex-direction:column;gap:9px;min-width:0;padding:clamp(12px,3.5vw,18px);border:1px solid rgb(var(--kg-outline-variant)/.48);border-radius:22px;background:linear-gradient(145deg,rgb(var(--kg-surface-panel)),rgb(var(--kg-surface-container-low)));box-shadow:0 4px 17px rgb(var(--kg-black)/.24);cursor:pointer}
.collection-card:hover{border-color:rgb(var(--kg-primary)/.42)}
.kg-catalog-meta{display:flex;align-items:center;justify-content:space-between;gap:8px;color:rgb(var(--kg-text-muted))}
.kg-catalog-place{display:flex;align-items:center;gap:5px;min-width:0;flex-wrap:wrap}
.kg-catalog-place .kgf{flex:none}
.kg-catalog-rating{flex:none;padding:2px 8px;border-radius:999px;background:rgb(var(--kg-primary)/.11);color:rgb(var(--kg-primary));font-variant-numeric:tabular-nums;white-space:nowrap}
.kg-catalog-title{margin:0;color:rgb(var(--kg-on-surface));overflow-wrap:anywhere}
.kg-catalog-title button{text-align:start}
.kg-catalog-summary{margin:-5px 0 1px;color:rgb(var(--kg-primary))}
.kg-catalog-preview{display:flex;align-items:center;gap:12px;min-height:105px;min-width:0;padding:9px;border:1px solid rgb(var(--kg-outline-variant)/.32);border-radius:14px;background:rgb(var(--kg-surface-container-high)/.66)}
.kg-catalog-preview-art{position:relative;display:grid;flex:none;place-items:center;width:clamp(62px,20vw,76px);aspect-ratio:5/6;overflow:hidden;border-radius:10px;border:1px solid rgb(var(--kg-on-surface)/.16);background:rgb(var(--kg-surface-panel));color:rgb(var(--kg-text-muted))}
.kg-catalog-preview-art img{position:absolute;inset:0;display:block;width:100%;height:100%;object-fit:cover}
.kg-catalog-preview-copy{display:flex;flex-direction:column;gap:4px;flex:1;min-width:0;color:rgb(var(--kg-on-surface-variant));overflow-wrap:anywhere}
.kg-catalog-preview-copy>strong{color:rgb(var(--kg-on-surface))}
.kg-catalog-preview-copy ul{list-style:disc outside;padding-inline-start:1.1em;margin:0}
.kg-catalog-preview-copy li+li{margin-top:2px}
.kg-catalog-preview-copy [data-k="cnt"]{color:rgb(var(--kg-text-muted));margin-top:2px}
.kg-catalog-preview-copy [data-k="cnt"] strong{color:rgb(var(--kg-on-surface))}
.kg-catalog-actions{display:flex;align-items:center;gap:6px;padding-top:8px;border-top:1px solid rgb(var(--kg-outline-variant)/.35)}
.kg-catalog-progress{flex:1;min-width:0;display:grid;gap:4px;margin-inline-end:3px}
.kg-catalog-progress>span{display:flex;justify-content:space-between;gap:4px;color:rgb(var(--kg-text-muted))}
.kg-catalog-progress [data-k="watched"]{color:rgb(var(--kg-primary));white-space:nowrap;font-variant-numeric:tabular-nums}
.kg-catalog-progress progress{appearance:none;width:100%;height:5px;border:0;border-radius:999px;overflow:hidden;background:rgb(var(--kg-surface-container-high))}
.kg-catalog-progress progress::-webkit-progress-bar{background:rgb(var(--kg-outline-variant)/.53);border-radius:999px}
.kg-catalog-progress progress::-webkit-progress-value{background:rgb(var(--kg-primary));border-radius:999px}
.kg-catalog-progress progress::-moz-progress-bar{background:rgb(var(--kg-primary));border-radius:999px}
.kg-catalog-icon{display:grid;place-items:center;flex:none;width:36px;height:36px;border-radius:11px;background:rgb(var(--kg-surface-container-high));color:rgb(var(--kg-primary))}
.kg-catalog-icon:hover{background:rgb(var(--kg-surface-bright))}
.kg-catalog-spot{isolation:isolate;position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:flex-end;gap:7px;min-height:248px;padding:clamp(15px,4vw,22px);border:1px solid rgb(var(--kg-primary)/.4);border-radius:23px;box-shadow:0 0 18px rgb(var(--kg-primary)/.12);background:rgb(var(--kg-surface-panel));cursor:pointer}
.kg-catalog-spot[hidden]{display:none}
.kg-catalog-spot-art,.kg-catalog-spot::before{position:absolute;inset:0;z-index:-1}
.kg-catalog-spot-art{background-size:cover;background-position:center 37%;opacity:.55}
.kg-catalog-spot::before{content:"";z-index:-1;background:linear-gradient(0deg,rgb(var(--kg-surface-container-lowest)) 0%,rgb(var(--kg-surface-container-lowest)/.83) 46%,rgb(var(--kg-surface-container-lowest)/.24)),linear-gradient(90deg,rgb(var(--kg-surface-container-lowest)/.58),transparent)}
.kg-catalog-spot-art{z-index:-2}
.kg-catalog-spot .kg-catalog-meta{color:rgb(var(--kg-on-surface-variant))}
.kg-catalog-spot-tag,.kg-catalog-spot-open{display:inline-flex;align-items:center;gap:5px;padding:4px 9px;border-radius:999px;background:rgb(var(--kg-primary-container));color:rgb(var(--kg-on-primary-container))}
.kg-catalog-spot h3,.kg-catalog-spot p{margin:0}
.kg-catalog-spot-footer{display:flex;align-items:center;gap:6px;margin-top:4px;padding-top:9px;border-top:1px solid rgb(var(--kg-on-surface)/.16)}
.kg-catalog-spot-footer [data-k="cnt"]{flex:1;min-width:0}
.kg-catalog-spot-open{min-height:36px;padding-inline:11px;border-radius:11px;white-space:nowrap}
.kg-catalog-spot-open:hover{filter:brightness(1.12)}
#mood-cards.kg-three-columns .mood-card [data-mood-select]{height:auto;aspect-ratio:3/4;min-height:7rem}
#mood-cards.kg-three-columns .kg-mood-cover-copy{left:.4rem;right:.4rem;bottom:.4rem}
#mood-cards.kg-three-columns .mood-title{font-size:.82rem;line-height:1.2;overflow-wrap:anywhere}
#mood-cards.kg-three-columns .mood-radio,#mood-cards.kg-three-columns .kg-mood-secondary{display:none}
@media(prefers-reduced-motion:reduce){.kgr-rise{animation:none}}`;
document.head.appendChild(st2);

/* ==========================================================================
   МАППИНГ ВСЕХ 44 АВТОРСКИХ КИНЕМАТОГРАФИЧНЫХ АРТ-ОБЛОЖЕК (16:9)
   Каждая подборка получает гарантированный кураторский визуал
   ========================================================================== */
const curatedThemes = window.KGCuratedCollections;
const catalogThemes = [...THEMES, ...curatedThemes];
const THEME_COVERS = {
  ...Object.fromEntries(curatedThemes.map(t => [t.id, t.cover])),
  // 1. Азиатский блок
  kr: "assets/covers/kr.jpg",
  krdrama: "assets/covers/krdrama.jpg",
  jp: "assets/covers/jp.jpg",
  jhorror: "assets/covers/jhorror.jpg",
  jpauteur: "assets/covers/jpauteur.jpg",
  jpcrime: "assets/covers/jpcrime.jpg",
  jpscifi: "assets/covers/jpscifi.jpg",
  hk: "assets/covers/hk.jpg",
  cnfan: "assets/covers/cnfan.jpg",
  thhorror: "assets/covers/thhorror.jpg",
  idhorror: "assets/covers/idhorror.jpg",
  // 2. Индия и Ближний Восток
  inact: "assets/covers/inact.jpg",
  inromance: "assets/covers/inromance.jpg",
  inclassic: "assets/covers/inclassic.jpg",
  ir: "assets/covers/ir.jpg",
  tr: "assets/covers/tr.jpg",
  arabic: "assets/covers/arabic.jpg",
  // 3. Европейский блок
  nordic: "assets/covers/nordic.jpg",
  frnoir: "assets/covers/frnoir.jpg",
  frcom: "assets/covers/frcom.jpg",
  itcrime: "assets/covers/itcrime.jpg",
  itcom: "assets/covers/itcom.jpg",
  eshorror: "assets/covers/eshorror.jpg",
  esdrama: "assets/covers/esdrama.jpg",
  dedrama: "assets/covers/dedrama.jpg",
  gbdet: "assets/covers/gbdet.jpg",
  gbdrama: "assets/covers/gbdrama.jpg",
  pldrama: "assets/covers/pldrama.jpg",
  // 4. Постсоветский архив
  suwar: "assets/covers/suwar.jpg",
  sufi: "assets/covers/sufi.jpg",
  suanim: "assets/covers/suanim.jpg",
  uadrama: "assets/covers/uadrama.jpg",
  // 5. Америка и Латинская Америка
  uscrime: "assets/covers/uscrime.jpg",
  uswestern: "assets/covers/uswestern.jpg",
  uscomedy: "assets/covers/uscomedy.jpg",
  usdrama: "assets/covers/usdrama.jpg",
  ushorror: "assets/covers/ushorror.jpg",
  usscifi: "assets/covers/usscifi.jpg",
  usanimation: "assets/covers/usanimation.jpg",
  mxdrama: "assets/covers/mxdrama.jpg",
  latam: "assets/covers/latam.jpg",
  brazil: "assets/covers/brazil.jpg",
  // 6. Африка и Океания
  african: "assets/covers/african.jpg",
  auhorror: "assets/covers/auhorror.jpg"
};
function getThemeCover(id){
  return THEME_COVERS[id] || "";
}



/* ---------- данные подборок ---------- */
const CAT={curated:["Необычные подборки","АВТОРСКИЙ ОТБОР"],noir:["Триллер и Нуар","NOIR • CRIME"],horror:["Ужасы и Мистика","HORROR • MYSTERY"],drama:["Драма и Авторское","DRAMA • AUTEUR"],action:["Экшен и Фэнтези","ACTION • FANTASY"],retro:["Историческое","RETRO • WAR"],comedy:["Комедия и Романтика","COMEDY • ROMANCE"],scifi:["Фантастика","SCI-FI • FUTURE"]};
// id: [категория, английское название, подпись в каталоге, описание]
const TM={
...Object.fromEntries(curatedThemes.map(t => [t.id, ["curated", t.englishName, t.subtitle, t.description]])),
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
const ICON={nordic:"ac_unit", ...Object.fromEntries(curatedThemes.map(t => [t.id, t.icon]))};
const T=Object.fromEntries(catalogThemes.map(t=>[t.id,t]));
const cat=t=>(TM[t.id]||["noir"])[0];

/* ---------- утилиты ---------- */
const fl=cc=>`<span class="kgf">${flag(cc,false)}</span>`;
const P=(p,s)=>p?`https://image.tmdb.org/t/p/${s||"w185"}${p}`:"";
const nf=n=>new Intl.NumberFormat(interfaceLanguage).format(n);
const moneyFmt=new Intl.NumberFormat(interfaceLanguage,{style:"currency",currency:"USD",maximumFractionDigits:0});
const moneyText=n=>Number(n)>0?moneyFmt.format(Number(n)):uiText("Нет данных");
const kgPersonLink=(p,role)=>p&&p.id?`<button type="button" data-kg-person-id="${p.id}" data-kg-person-name="${esc(p.name)}" data-kg-person-role="${role||"Кинематографист"}" class="kg-person-link">${esc(p.name)}</button>`:esc(p&&p.name||"");
function fw(n){if(interfaceLanguage==="en")return n===1?"film":"films";const m=n%100,k=n%10;return (k===1&&m!==11)?"фильм":(k>1&&k<5&&(m<12||m>14))?"фильма":"фильмов";}
function collectionFilmCount(n){
  const word=fw(n);
  return nf(n)+" "+(interfaceLanguage==="ru"?({фильм:"картина",фильма:"картины",фильмов:"картин"})[word]:word);
}
const gnames=t=>t.g.split("|").map(x=>(t.series?window.KGSeries.genreLabels:GENRES)[x]).filter(Boolean).map(genre=>uiText(genre));
const where=t=>t.films?uiText("Разные страны"):REG[t.id]?uiText(REG[t.id][0]):cname(t.cc[0]);
const flagsOf=t=>t.cc.slice(0,3).map(fl).join(" ");
function toast(msg,icon){
  let el=$("kg-toast");
  if(!el){el=document.createElement("div");el.id="kg-toast";el.className="fixed bottom-20 left-1/2 -translate-x-1/2 max-w-[90vw] z-50 pointer-events-none opacity-0 transition-opacity duration-300";document.body.appendChild(el);}
  el.innerHTML=`<div class="flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface-panel text-on-surface font-label-sm text-label-sm shadow-[0_8px_24px_rgb(var(--kg-black)/0.9)]"><span class="material-symbols-outlined text-primary-container text-[18px]">${icon||"casino"}</span><span>${esc(uiText(msg))}</span></div>`;
  el.style.opacity="1";clearTimeout(el._t);el._t=setTimeout(()=>el.style.opacity="0",2200);
}

/* ---------- загрузка данных TMDB ---------- */
// Bayesian rating: avoids promoting films with very few votes.
function weighed(f){
  const v=Math.max(0,Number(f.vote_count)||0), r=Number(f.vote_average)||0;
  return (v*r+100*6.5)/(v+100);
}
const floorOf=cc=>BIG.has(cc)?300:60;
const qs=(t,cc)=>({with_origin_country:cc,with_genres:t.g,"vote_count.gte":floorOf(cc),"vote_average.gte":"6.5"});
const DAY_MS=24*60*60*1000;
const themeDataCache=new Map(),themeRetryAfter=new Map(),themeInflight=new Map(),metaRetryAfter=new Map(),metaInflight=new Map();
function curatedData(films) {
  const totals = {};
  for (const film of films) totals[film._cc] = (totals[film._cc] || 0) + 1;
  return {films, total: films.length, totals};
}

async function loadCuratedTheme(theme, force) {
  if (!apiKey) return curatedData(theme.films.map(localizeFilmListItem));
  const results = await Promise.allSettled(theme.films.map(film =>
    requestTmdb("movie/" + film.id, {language:filmLocale, append_to_response:"translations"}, {fresh:force})
  ));
  const films = theme.films.map((film, i) => {
    const result = results[i];
    if (result.reason?.code === "CATALOG_RESTRICTED") return null;
    if (result.status !== "fulfilled" || result.value.id !== film.id) return localizeFilmListItem(film);
    const {poster_path, backdrop_path, vote_average, vote_count, popularity} = result.value;
    const title = selectMovieText(result.value, "title").text;
    const overview = selectMovieText(result.value, "overview").text;
    return {...film, title:title || film.title, overview:overview || film.overview, poster_path:poster_path || film.poster_path, backdrop_path:backdrop_path || film.backdrop_path, vote_average, vote_count, popularity};
  });
  return curatedData(films.filter(Boolean));
}
const themeDataKey=(t,pages)=>t.series?`${t.id}:${pages}:${apiKey}:${filmLocale}`:t.films?t.id:`${t.id}:${pages}`;
const seriesThemePages=new Map();
async function seriesThemePage(theme,cc,page,force){
  const key=`${themeDataKey(theme,0)}:${cc}:${page}`;
  const cached=seriesThemePages.get(key);
  if(cached&&(cached.pending||(!force&&Date.now()-cached.ts<DAY_MS)))return cached.promise;
  const entry={pending:true};
  entry.promise=(async()=>{
    const params={...qs(theme,cc),without_genres:"10763,10764,10767"};
    const queries=theme.seriesQueries||[{}];
    const discover=(voteFloor,page,limits)=>Promise.all(queries.map((query,index)=>
      !limits||page<=limits[index]?
        window.KGSeries.discover({...params,...query,"vote_count.gte":voteFloor,page},{fresh:force}):
        null));
    let voteFloor=60,results;
    if(page===1){
      results=await discover(voteFloor,page);
      if(results.reduce((total,result)=>total+(result.total_results||0),0)<12){
        voteFloor=20;results=await discover(voteFloor,page);
      }
    }else{
      const first=await seriesThemePage(theme,cc,1,false);
      voteFloor=first.voteFloor;
      if(page>first.lastPage)return {cc,p:page,films:[]};
      results=await discover(voteFloor,page,first.queryLimits);
    }
    const films=results.flatMap(result=>result?.results||[]).filter(show=>movieCatalog.allows(show)&&show.origin_country?.includes(cc)&&
      Number(show.vote_count)>=voteFloor&&Number(show.vote_average)>=6.5).map(show=>({...show,_cc:cc}));
    const queryLimits=results.map(result=>Math.min(500,result?.total_pages||0));
    const total=results.reduce((sum,result)=>sum+(result?.total_results||0),0);
    return {cc,p:page,total,lastPage:Math.max(...queryLimits),queryLimits,voteFloor,films};
  })();
  seriesThemePages.set(key,entry);
  try{return await entry.promise;}
  catch(error){if(seriesThemePages.get(key)===entry)seriesThemePages.delete(key);throw error;}
  finally{entry.pending=false;entry.ts=Date.now();}
}
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
    if (t.films) {
      const data = await loadCuratedTheme(t, force);
      if (data.films.some(f => f.poster_path || f.vote_count)) {
        themeDataCache.set(key, {data, ts:Date.now(), date:localDateKey()});
      }
      return data;
    }
    const jobs=[];
    try{
      for(const cc of t.cc){
        for(let p=1;p<=pages;p++)jobs.push(()=>t.series?seriesThemePage(t,cc,p,force):
          api({...qs(t,cc),page:p},{fresh:force}).then(r=>({
            cc,p,total:r.total_results||0,films:(r.results||[]).map(f=>({...f,_cc:cc}))
          })));
      }
      const results=await settleWithLimit(jobs,3,job=>job());
      const parts=results.filter(r=>r.status==="fulfilled").map(r=>r.value);
      if(!parts.length)throw results[0]?.reason || new Error("Не удалось загрузить подборку.");
      const partial=parts.length!==jobs.length;
      const aggregate=selected=>{
        const totals={},pageLimits={},ids=new Set();let films=[];
        selected.forEach(x=>{if(x.p===1){totals[x.cc]=x.total;pageLimits[x.cc]=x.lastPage||0;}films.push(...x.films.filter(f=>!ids.has(f.id)&&ids.add(f.id)));});
        const total=Object.values(totals).reduce((a,b)=>a+b,0);
        films.sort((a,b)=>weighed(b)-weighed(a));
        return {total,totals,films,pageLimits};
      };
      const data=aggregate(parts);
      if(partial){
        if(cached)return {...cached.data,_stale:true};
        return {...data,_partial:true};
      }
      const refreshedAt=Date.now(),date=localDateKey();
      themeDataCache.set(key,{data,ts:refreshedAt,date});themeRetryAfter.delete(key);
      if(pages>1)themeDataCache.set(themeDataKey(t,1),{data:aggregate(parts.filter(x=>x.p===1)),ts:refreshedAt,date});
      return data;
    }catch(error){
      themeRetryAfter.set(key,Date.now()+15*60*1000);
      if(cached){console.warn(`[Moven] Обновление подборки «${t.name}» не удалось; показываем сохранённые данные.`,error);return {...cached.data,_stale:true};}
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
  const titles=d.films.filter(f=>f.title||f.original_title).slice(0,3).map(f=>({
    title:f.title||f.original_title,original_title:f.original_title||""
  }));
  const ids=d.films.map(f=>Number(f.id)).filter(Number.isSafeInteger);
  const meta={n:d.total,r:r?r.toFixed(1):"",p:(d.films.find(f=>f.poster_path)||{}).poster_path||"",b:(d.films.find(f=>f.backdrop_path)||{}).backdrop_path||"",titles,ids,previewLocale:filmLocale,ts:Date.now(),...(t.series?{seriesRules:3}:{})};
  META[t.id]=meta;store.set("kgThemeMeta",META);return meta;
}
async function loadMeta(t,force=false){
  if (t.films) {
    const cached=META[t.id];
    if (cached?.p && cached.n===t.films.length && !force && Date.now()-cached.ts<FRESH) return cached;
    if (!apiKey || !t.films.length) return {...(cached||{}),n:t.films.length};
    if(metaInflight.has(t.id))return metaInflight.get(t.id);
    const request=(async()=>{
      try{
        const result=await requestTmdb("movie/"+t.films[0].id,{language:filmLocale,append_to_response:"translations"},{fresh:force});
        if(result.id!==t.films[0].id)throw new Error("Постер подборки не найден.");
        const meta={...(cached||{}),n:t.films.length,r:result.vote_average?Number(result.vote_average).toFixed(1):"",p:result.poster_path||"",b:result.backdrop_path||"",ts:Date.now()};
        META[t.id]=meta;store.set("kgThemeMeta",META);metaRetryAfter.delete(t.id);return meta;
      }catch(error){
        metaRetryAfter.set(t.id,Date.now()+15*60*1000);
        return cached || {n:t.films.length};
      }
    })();
    metaInflight.set(t.id,request);
    try{return await request;}finally{metaInflight.delete(t.id);}
  }
  if(metaInflight.has(t.id))return metaInflight.get(t.id);
  const m=META[t.id];
  if(!force&&m?.previewLocale===filmLocale&&(!t.series||m.seriesRules===3)&&Date.now()-m.ts<FRESH)return m;
  if((metaRetryAfter.get(t.id)||0)>Date.now()){if(m)return m;throw new Error("Метаданные подборки временно недоступны.");}
  const request=(async()=>{
    try{
      const d=await loadTheme(t,1,force);
    if(d._stale||d._partial){if(m&&!force)return m;throw new Error("Метаданные подборки временно недоступны.");}
      const meta=saveThemeMeta(t,d);metaRetryAfter.delete(t.id);
      return meta;
    }catch(error){metaRetryAfter.set(t.id,Date.now()+15*60*1000);throw error;}
  })();
  metaInflight.set(t.id,request);
  try{return await request;}finally{metaInflight.delete(t.id);}
}

/* ---------- экраны и навигация ---------- */
const mediaSwitch=document.createElement("div");
mediaSwitch.className="kg-media-switch";mediaSwitch.setAttribute("role","tablist");mediaSwitch.setAttribute("aria-label",uiText("Тип контента"));
home.id="view-films";home.setAttribute("role","tabpanel");home.setAttribute("aria-labelledby","kg-mode-films");
const seriesPage=document.createElement("section");seriesPage.id="view-series";seriesPage.className="kg-series-page";seriesPage.hidden=true;
seriesPage.setAttribute("role","tabpanel");seriesPage.setAttribute("aria-labelledby","kg-mode-series");
seriesPage.innerHTML=`<h1 class="sr-only">${uiText("Сериалы")}</h1>`;
mediaSwitch.innerHTML=[["home","films","Кино"],["series","series","Сериалы"]].map(([route,id,label])=>`<button type="button" role="tab" id="kg-mode-${id}" data-media-view="${route}" aria-controls="view-${id}" aria-selected="${route==='home'}" tabindex="${route==='home'?0:-1}">${uiText(label)}</button>`).join("");
document.querySelector(".kg-main-header-actions").prepend(mediaSwitch);home.after(seriesPage);
window.KGSeries.mount(home,seriesPage);
mediaSwitch.addEventListener("click",event=>{const tab=event.target.closest('[data-media-view]');if(tab)showView(tab.dataset.mediaView);});
mediaSwitch.addEventListener("keydown",event=>{
  const tabs=[...mediaSwitch.querySelectorAll('[role="tab"]')],index=tabs.indexOf(event.target);
  if(index<0 || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();
  const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
  showView(tabs[next].dataset.mediaView);tabs[next].focus();
});

const seriesCalendar=document.createElement("section");
seriesCalendar.className="kg-cal";seriesCalendar.hidden=true;
seriesPage.after(seriesCalendar);
const seriesCollections=document.createElement("div");
seriesCollections.id="view-series-collections";
seriesCollections.className="flex flex-col w-full px-gutter-mobile gap-space-lg pb-space-xl";
seriesCollections.hidden=true;
seriesCalendar.before(seriesCollections);
window.KGSeriesCalendar.mount(seriesCalendar,()=>showView("series-collections"));
const seriesGold=document.createElement("section");
seriesGold.className="kg-gold";seriesGold.hidden=true;
seriesCalendar.after(seriesGold);
window.KGSeriesGold.mount(seriesGold,{onBack:()=>showView("series-collections"),onWinner:presentSeriesWinner});

const vc=document.createElement("div");vc.id="view-collections";
vc.className="flex flex-col w-full px-gutter-mobile gap-space-lg select-none";vc.style.display="none";
const vd=document.createElement("div");vd.id="view-collection";
vd.className="flex flex-col w-full px-margin-mobile gap-space-lg select-none pb-space-xl";vd.style.display="none";
const vm=document.createElement("div");vm.id="view-mood";
vm.className="flex flex-col w-full px-gutter-mobile select-none";vm.style.display="none";
const vo=document.createElement("div");vo.id="view-oscar";
vo.className="flex flex-col w-full select-none";vo.style.display="none";
const sectionNav=document.createElement("nav");
sectionNav.setAttribute("aria-label",uiText("Разделы подборок"));
sectionNav.className="w-full px-gutter-mobile pt-2";
sectionNav.style.display="none";
const collectionTabs=[["collections","Коллекции"],["mood","Коллекция по настроению"],["oscar","Оскар"]];
function renderCollectionTabs(tabs, media){
  sectionNav.dataset.media=media;
  sectionNav.innerHTML=`<div class="grid grid-cols-3 gap-1.5 rounded-xl bg-surface-panel p-1.5">`+
    tabs.map(([route,label])=>`<button type="button" data-collection-route="${route}" aria-current="false" class="min-w-0 px-1.5 py-2 rounded-lg text-text-muted hover:text-primary font-micro-caption text-micro-caption leading-tight">${uiText(label)}</button>`).join("")+
    "</div>";
}
renderCollectionTabs(collectionTabs,"movie");
home.after(sectionNav);sectionNav.after(vc);vc.after(vd);vd.after(vm);vm.after(vo);

const nav=document.createElement("nav");
nav.className="kg-bottom-nav fixed bottom-0 w-full z-50";
const hallNavIcon = '<svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m10-14a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm4 8a4 4 0 0 1 3 4v2M17 3a4 4 0 0 1 0 8"/></svg>';
const bottomNavLink = (view,icon,label) => `<a href="#" data-view="${view}" class="kg-bottom-nav-link" aria-label="${esc(uiText(label))}"${view==="calendar"?' aria-haspopup="dialog"':""}>${view==="hall"?hallNavIcon:`<span class="material-symbols-outlined text-[24px]" aria-hidden="true">${icon}</span>`}</a>`;
nav.innerHTML='<div class="kg-bottom-nav-grid">'+
[["home","casino","Глобус"],["collections","movie_filter","Подборки"],["journey","travel_explore","Путешествие"],["hall","groups","Зал славы"]]
.map(([view,icon,label])=>bottomNavLink(view,icon,label)).join("")+"</div>";
nav.setAttribute("aria-label",uiText("Навигация"));
document.body.appendChild(nav);

function paintBottomNav(panel, current) {
  panel.querySelectorAll("[data-view]").forEach(link => {
    const selected = link.dataset.view === current;
    if (selected) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

window.KGMountBottomNav = (dialog, container, current, close = () => dialog.close(), {calendar=false}={}) => {
  // Reuse the primary controls in the two full-screen dialog tabs.
  if (current === "journey" || current === "history") {
    let header = container.querySelector(":scope > .kg-dialog-top-nav");
    if (!header) {
      const source = document.querySelector("body > .kg-main-header .kg-main-header-actions");
      header = document.createElement("header");
      header.className = "kg-main-header kg-dialog-top-nav";
      const actions = document.createElement("nav");
      actions.className = "kg-main-header-actions kg-secondary-header-actions";
      actions.setAttribute("aria-label", source.getAttribute("aria-label"));
      const group = document.createElement("div");
      group.className = "kg-header-account-group";
      for (const [selector, action] of [[".kg-header-search", "search"], ["[data-path=nastrojki]", "settings"], ["#kg-account-open", "profile"]]) {
        const original = source.querySelector(selector);
        const control = original.cloneNode(true);
        control.removeAttribute("id");
        control.removeAttribute("data-path");
        control.removeAttribute("data-kg-search-open");
        control.addEventListener("click", event => {
          event.preventDefault();
          // Global search is outside the modal's top layer.
          if (action === "search") close();
          original.click();
        });
        (action === "search" ? actions : group).append(control);
      }
      actions.append(group);
      header.append(actions);
      container.prepend(header);
    }
    const avatar = document.querySelector("#kg-account-open img");
    const copy = header.querySelector(".kg-header-account-group img");
    if (avatar && copy) copy.src = avatar.src;
  }
  let footer = container.querySelector(":scope > .kg-dialog-bottom-nav");
  if (!footer) {
    footer = nav.cloneNode(true);
    footer.classList.remove("fixed", "bottom-0", "z-50");
    footer.classList.add("kg-dialog-bottom-nav");
    if (calendar) footer.querySelector('[data-view="collections"]').insertAdjacentHTML("afterend",bottomNavLink("calendar","calendar_month","Календарь"));
    container.appendChild(footer);
    footer.addEventListener("click", event => {
      const link = event.target.closest("[data-view]");
      if (!link) return;
      event.preventDefault();
      if (link.dataset.view === footer.dataset.currentView) return;
      if (link.dataset.view === "calendar") { window.KGReleaseFollow.openCalendar(); return; }
      close();
      nav.querySelector(`[data-view="${link.dataset.view}"]`)?.click();
    });
  }
  footer.dataset.currentView = current;
  paintBottomNav(footer, current);
};

let view="home";
const previousViews = [];

function rememberView(destination, collectionId = null) {
  const currentId = ["collection","series-collection"].includes(view) ? D.t?.id ?? null : null;
  if (destination === view && collectionId === currentId) return;
  // Top-level tabs replace the navigation trail rather than extending it.
  if (destination !== "collection" && destination !== "series-collection") {
    previousViews.length = 0;
    if (["series-calendar","series-mood","series-gold"].includes(destination)) {
      previousViews.push({view:"series", collectionId:null},{view:"series-collections", collectionId:null});
    } else if (destination !== "home") {
      previousViews.push({view:destination==="series-collections"?"series":"home", collectionId:null});
    }
    return;
  }
  const previous = previousViews.at(-1);
  if (previous?.view === destination && previous.collectionId === collectionId) previousViews.pop();
  else previousViews.push({view, collectionId:currentId});
}

function showView(v, remember = true){
  const seriesSelection=["series-collections","series-collection","series-calendar","series-mood","series-gold"].includes(v);
  const moodView=v==="mood"||v==="series-mood";
  if(!window.KGSeries.setMode(v==="series"||seriesSelection))return;
  if(v==="series-collections"&&(view!==v||!seriesCollections.firstChild)) renderTvCatalog();
  if(view==="series-calendar"&&v!==view)window.KGSeriesCalendar.hide();
  const enterCalendar=v==="series-calendar"&&v!==view;
  const enterGold=v==="series-gold"&&v!==view;
  if(view==="series-gold"&&v!==view)window.KGSeriesGold.hide();
  if (remember && v !== view) rememberView(v);
  if(v!==view) window.KGFilmCard.stopTrailers();
  if(v!==view&&["mood","series-mood"].includes(view)){
    window.KGMoodPage.stop(vm);
    window.KGMoodVibePage.reset(vm,moodDeps);
    delete vm.dataset.ready;
  }
  if(v!=="oscar"&&window.KGOscarPage&&window.KGOscarPage.stop)window.KGOscarPage.stop(vo);
  view=v;
  if(!["collection","series-collection"].includes(v))rStop();
  if(D.selected) closeInlineFilm(D.selected,false);
  if(vd.dataset.collectionMedia&&!(v==="series-collection"&&vd.dataset.collectionMedia==="tv")&&
    !(v==="collection"&&vd.dataset.collectionMedia==="movie")){
    vd.replaceChildren();delete vd.dataset.collectionMedia;
  }
  home.style.display=v==="home"?"":"none";
  seriesPage.hidden=v!=="series";
  seriesCalendar.hidden=v!=="series-calendar";
  seriesGold.hidden=v!=="series-gold";
  if(enterGold)window.KGSeriesGold.show();
  seriesCollections.hidden=v!=="series-collections";
  if(enterCalendar)window.KGSeriesCalendar.show();
  mediaSwitch.hidden=!["home","series"].includes(v);
  const headerActions=mediaSwitch.parentElement;
  const settings=headerActions.querySelector('[data-path="nastrojki"]');
  const profile=headerActions.querySelector('#kg-account-open');
  let accountGroup=headerActions.querySelector('.kg-header-account-group');
  if(mediaSwitch.hidden){
    headerActions.classList.add('kg-secondary-header-actions');
    if(!accountGroup){accountGroup=document.createElement('div');accountGroup.className='kg-header-account-group';headerActions.append(accountGroup);accountGroup.append(settings,profile);}
  }else{
    headerActions.classList.remove('kg-secondary-header-actions');
    if(accountGroup){headerActions.append(settings,profile);accountGroup.remove();}
  }

  mediaSwitch.querySelectorAll('[role="tab"]').forEach(tab=>{const selected=tab.dataset.mediaView===v;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;});
  sectionNav.style.display=seriesSelection||["collections","collection","mood","oscar"].includes(v)?"":"none";
  const sectionTabs=seriesSelection?[["series-collections","Коллекции"],["series-mood","Коллекция по настроению"],["series-gold","Золотой фонд"]]:collectionTabs;
  if(sectionNav.dataset.media!==(seriesSelection?"tv":"movie")) renderCollectionTabs(sectionTabs,seriesSelection?"tv":"movie");
  vc.style.display=v==="collections"?"":"none";
  vd.style.display=(v==="collection"&&vd.dataset.collectionMedia==="movie")||(v==="series-collection"&&vd.dataset.collectionMedia==="tv")?"":"none";
  vm.style.display=moodView?"":"none";
  vo.style.display=v==="oscar"?"":"none";
  const act=v==="series"?"home":(seriesSelection||["collection","mood","oscar"].includes(v))?"collections":v;
  paintBottomNav(nav, act);
  const section=v==="collection"?"collections":v==="series-collection"?"series-collections":v;
  sectionNav.querySelectorAll("[data-collection-route]").forEach(button=>{
    const active=button.dataset.collectionRoute===section;
    button.className=`min-w-0 px-1.5 py-2 rounded-lg font-micro-caption text-micro-caption leading-tight ${active?"bg-primary-container text-on-primary-container font-semibold":"text-text-muted hover:text-primary"}`;
    button.setAttribute("aria-current",String(active));
  });
  scrollTo({top:0});
  if(v==="collections") initCatalog();
  if(moodView&&(!vm.dataset.ready||vm.dataset.key!==apiKey)){
    window.KGMoodVibePage.reset(vm,moodDeps);
    window.KGMoodPage.render(vm,moodDeps);
    window.KGMoodVibePage.init(vm,moodDeps);
    vm.dataset.ready="true";vm.dataset.key=apiKey;
  }
  if(v==="oscar"){
    if(!vo.dataset.ready||vo.dataset.key!==apiKey){window.KGOscarPage.render(vo,pageDeps);vo.dataset.ready="true";vo.dataset.key=apiKey;}
    else window.KGOscarPage.refreshForeign?.(vo);
  }
}
nav.addEventListener("click",e=>{
  const a=e.target.closest("[data-view]");if(!a)return;e.preventDefault();
  if(a.dataset.view==="journey"){$("mapBtn").click();return;}
  if(a.dataset.view==="hall"){window.KGHallOfFame.open();return;}
  if(a.dataset.view==="home"&&window.KGSeries.active){showView("series");return;}
  if(a.dataset.view==="collections"&&window.KGSeries.active){showView("series-collections");return;}
  showView(a.dataset.view);
});
sectionNav.addEventListener("click",e=>{
  const button=e.target.closest("[data-collection-route]");
  if(button)showView(button.dataset.collectionRoute);
});

// Android sends Back here. Reuse each screen's own close/back action.
window.KGHandleBack = () => {
  const focusedDialog = document.activeElement?.closest("dialog[open]");
  const topDialog = focusedDialog || [...document.querySelectorAll("dialog[open]")].at(-1);
  const person = topDialog?.id === "kg-person-modal" ? topDialog : null;
  if (person) {
    person.querySelector("[data-kg-person-close]")?.click();
    return true;
  }
  if (topDialog) {
    const trailerClose = [...topDialog.querySelectorAll('[data-trailer-action="close"]:not([hidden])')].find(button=>button.getClientRects().length);
    if (trailerClose) { trailerClose.click(); return true; }
    if (topDialog.id === "journey") {
      if (window.KGHandleJourneyBack?.()) return true;
    }
    if (typeof topDialog.requestClose === "function") topDialog.requestClose();
    else if (topDialog.dispatchEvent(new Event("cancel", {cancelable:true}))) topDialog.close();
    return true;
  }
  const search = document.querySelector("#kg-global-search:not([hidden]) [data-kgs-close]");
  if (search) { search.click(); return true; }
  const trailerClose = [...document.querySelectorAll('[data-trailer-action="close"]:not([hidden])')]
    .find(button => button.getClientRects().length);
  if (trailerClose) { trailerClose.click(); return true; }
  if (D.selected) { closeInlineFilm(); return true; }
  if(["mood","series-mood"].includes(view)&&window.KGMoodVibePage.back(vm,moodDeps))return true;
  const previous = previousViews.pop();
  if (!previous) return false;
  if (["collection","series-collection"].includes(previous.view) && previous.collectionId) {
    openCollection(previous.collectionId, {returning:true,series:previous.view==="series-collection"});
  } else {
    showView(previous.view, false);
  }
  return true;
};

/* ================= КАТАЛОГ ================= */
let catBuilt=false,activeCat="all",sortMode="rating";
let catalogLayout="list",collectionFilmLayout="list";

function layoutSwitch(layout,scope){
  const modes=[["list","view_list","Списком"],["grid","grid_view","Сеткой"]];
  return `<div class="flex shrink-0 gap-1 rounded-full bg-surface-container p-0.5">${modes.map(([mode,icon,label])=>`<button type="button" data-kg-layout="${scope}" data-mode="${mode}" aria-label="${uiText(label)}" title="${uiText(label)}" aria-pressed="${mode===layout}" class="w-9 h-9 rounded-full flex items-center justify-center ${mode===layout?"bg-primary-container text-on-primary-container":"text-text-muted hover:text-primary"}"><span class="material-symbols-outlined text-[18px]" aria-hidden="true">${icon}</span></button>`).join("")}</div>`;
}
function syncLayout(root,layout,scope){
  root.querySelectorAll(`[data-kg-layout="${scope}"]`).forEach(button=>{
    const active=button.dataset.mode===layout;
    button.setAttribute("aria-pressed",String(active));
    ["bg-primary-container","text-on-primary-container"].forEach(name=>button.classList.toggle(name,active));
    ["text-text-muted","hover:text-primary"].forEach(name=>button.classList.toggle(name,!active));
  });
}
function collectionPoster(film, size) {
  const urls = [...new Set([
    P(film.localizedPoster?.path, size),
    P(film.poster_path, size),
    P(film.poster_path, size === "w342" ? "w185" : "w342"),
    P(film.backdrop_path, "w780")
  ].filter(Boolean))];
  const placeholder = '<span class="material-symbols-outlined w-full h-full flex items-center justify-center text-text-muted" aria-hidden="true">movie</span>';
  if (!urls.length) return placeholder;
  const [src, ...fallbacks] = urls;
  return `${placeholder}<img class="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" alt="" src="${esc(src)}" data-collection-poster="${esc(JSON.stringify(fallbacks))}">`;
}

window.KGCollectionPoster = collectionPoster;

document.addEventListener("error", event => {
  const image = event.target;
  if (!(image instanceof HTMLImageElement) || !image.hasAttribute("data-collection-poster")) return;
  const urls = JSON.parse(image.dataset.collectionPoster);
  const next = urls.shift();
  if (!next) {
    image.remove();
    return;
  }
  image.dataset.collectionPoster = JSON.stringify(urls);
  image.src = next;
}, true);

function posterTile(film,buttonAttributes,posterBadge=""){
  const title=esc(film.title||film.original_title||uiText("Фильм"));
  const score=Number(film.vote_average)||0;
  return `<button type="button" ${buttonAttributes} class="kg-film-grid-tile">
    <span class="kg-film-grid-poster">${collectionPoster(film,"w342")}
    ${posterBadge}${score?`<span class="kg-film-grid-score">${score.toFixed(1)}</span>`:""}</span>
    <span class="kg-film-grid-title">${title}</span>
  </button>`;
}
function filmGridRows(films,renderRow){
  let markup="";
  for(let start=0;start<films.length;start+=3)markup+=renderRow(films.slice(start,start+3));
  return markup;
}
function moodFilmGrid(films,scope){
  return filmGridRows(films,row=>{
    const host=`mood-film-detail-${scope}-${row[0].id}`;
    const cards=row.map(f=>posterTile(f,`data-${scope}-film="${f.id}" data-detail-target="${host}"`)).join("");
    return `<div class="kg-three-columns kg-film-grid-row">${cards}</div><div id="${host}" class="empty:hidden"></div>`;
  });
}
let catalogScores=new Map();

function dailySeed(){
  const d=new Date();
  return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();
}
function seededShuffle(arr,seed){
  const a=[...arr];
  let s=(seed>>>0)||1;
  const rnd=()=>{
    s=Math.imul(s^s>>>15,1|s)+(s|0)^(s>>>7);
    return ((s^s>>>14)>>>0)/4294967296;
  };
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(rnd()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

function spotlightTheme(){return catalogThemes[Math.floor(Date.now()/6048e5)%catalogThemes.length];}
function collectionGenres(t) {
  return gnames(t).join(" · ") || uiText(t.category || TM[t.id]?.[2] || "");
}
function collectionCover(t) {
  return t.series ? t.cover : getThemeCover(t.id);
}
function catalogCount(t,meta) {
  const count=t.films?.length ?? meta?.n;
  return count===undefined ? "—" : t.series ? seriesCollectionCount(count) : collectionFilmCount(count);
}
function collectionExampleNames(t,meta) {
  const source=t.films || (meta?.previewLocale===filmLocale ? meta.titles : null) || [];
  const live=source.slice(0,3).map(f=>filmLanguage==="original" ? f.original_title||f.title : localizeFilmListItem(f).title);
  const snapshot=window.KGCollectionExamples?.[t.id]?.[filmLanguage] || [];
  return [...new Set([...live,...snapshot].filter(Boolean))].slice(0,3);
}
function catalogTitleCount(t,count) {
  if(!t.series)return `${nf(count)} ${fw(count)}`;
  const plural=new Intl.PluralRules(interfaceLanguage).select(count);
  const word=interfaceLanguage==="en"?"series":({one:"сериал",few:"сериала",many:"сериалов",other:"сериалов"})[plural];
  return `${nf(count)} ${word}`;
}
function catalogPreview(t,meta) {
  const titles=collectionExampleNames(t,meta);
  const posters=[collectionCover(t),P(meta?.p,"w342")].filter(Boolean);
  const [cover,...fallbacks]=posters;
  const count=t.films?.length ?? meta?.n;
  return `<div class="kg-catalog-preview-art" aria-hidden="true">
      <span class="material-symbols-outlined">movie</span>
      ${cover?`<img alt="" src="${esc(cover)}" loading="lazy" decoding="async" data-collection-poster="${esc(JSON.stringify(fallbacks))}">`:""}
    </div>
    <div class="kg-catalog-preview-copy font-label-sm text-label-sm">
      ${titles.length?`<strong>${uiText("Флагманы подборки:")}</strong><ul>${titles.map(name=>`<li>${esc(name)}</li>`).join("")}</ul>`:
        `<span>${esc(uiText(t.series?t.category:TM[t.id]?.[2]||""))}</span>`}
      ${count===undefined?"":`<span data-k="cnt">${uiText("Всего:")} <strong>${esc(catalogTitleCount(t,count))}</strong></span>`}
    </div>`;
}
function catalogProgress(card,t,meta) {
  const ids=t.films?.map(f=>f.id) ?? meta?.ids ?? [];
  const progress=card.querySelector("progress");
  progress.hidden=!ids.length;
  if(ids.length){
    const seen=new Set((t.series?window.KGSeries.watchedList():watched).map(f=>Number(f.id)));
    progress.max=ids.length;
    progress.value=ids.filter(id=>seen.has(Number(id))).length;
  }
  card.querySelector('[data-k="watched"]').textContent=ids.length?`${nf(progress.value)} / ${nf(ids.length)}`:"—";
  const label=uiText(ids.length && ids.length < meta?.n ? "Среди загруженных" : "Прогресс просмотра");
  card.querySelector('[data-k="progress-label"]').textContent=label;
  progress.setAttribute("aria-label",label);
}
function catalogRating(meta) {
  return meta?.r ? `★ ${meta.r}` : "—";
}
function catalogGridCover(t,meta) {
  const poster=P(meta?.p,"w342");
  const cover=(t.films && poster) || collectionCover(t) || poster;
  return cover ? `<img alt="" src="${esc(cover)}" loading="lazy" decoding="async" data-collection-poster='[]'>` : "";
}
function cardHtml(t,i){
  const meta=META[t.id];
  const name=esc(uiText(t.name));
  const archive=t.id==="suwar"?` · ${esc(uiText("АРХИВ ИСЧЕЗНУВШИХ ЭПОХ"))}`:"";
  return `<article class="collection-card" data-t="${t.id}" data-cat="${t.series?t.category:cat(t)}" data-i="${i}">
    <div class="kg-catalog-grid-cover" aria-hidden="true">${catalogGridCover(t,meta)}</div>
    <div class="kg-catalog-meta font-micro-caption text-micro-caption">
      <span class="kg-catalog-place">${flagsOf(t)} ${esc(t.region||where(t))}${archive}</span>
      <strong class="kg-catalog-rating" data-k="r">${esc(catalogRating(meta))}</strong>
    </div>
    <h4 class="kg-catalog-title font-headline-sm text-headline-sm font-bold"><button type="button" data-act="open" data-t="${t.id}">${name}</button></h4>
    <p class="kg-catalog-summary font-body-sm text-body-sm">${esc(collectionGenres(t))}</p>
    <div class="kg-catalog-preview">${catalogPreview(t,meta)}</div>
    <div class="kg-catalog-actions">
      <div class="kg-catalog-progress font-label-sm text-label-sm">
        <span><span data-k="progress-label">${uiText("Прогресс просмотра")}</span><strong data-k="watched">—</strong></span>
        <progress hidden></progress>
      </div>
      ${catalogIcon(t,"spin","casino","Крутить")}
      ${catalogIcon(t,"open","arrow_forward","Подробнее")}
    </div>
  </article>`;
}
function catalogIcon(t,action,icon,label) {
  return `<button type="button" aria-label="${esc(uiText(label))}" data-act="${action}" data-t="${t.id}" class="kg-catalog-icon"><span class="material-symbols-outlined text-[18px]" aria-hidden="true">${icon}</span></button>`;
}
function paintCatalogCard(card,t,meta,updatePreview=false) {
  if(updatePreview){
    card.querySelector(".kg-catalog-preview").innerHTML=catalogPreview(t,meta);
    if(t.films || !collectionCover(t))card.querySelector(".kg-catalog-grid-cover").innerHTML=catalogGridCover(t,meta);
    card.querySelector('[data-k="r"]').textContent=catalogRating(meta);
  }
  catalogProgress(card,t,meta);
}
document.addEventListener("kg:watched-change",()=>{
  for(const card of document.querySelectorAll("#cat-grid .collection-card,[data-tv-grid] .collection-card")){
    const id=card.dataset.t;
    paintCatalogCard(card,T[id]||tvThemeFor(id),META[id]);
  }
});

function spotlightCover(t,meta){
  const art=t.series?t.cover:getThemeCover(t.id);
  const tmdb=P(meta?.b,"w780")||P(meta?.p,"w500");
  return t.films?tmdb||art:art||tmdb;
}
function spotlightHtml(t){
  const m=TM[t.id]||["noir","","",""];
  const meta=META[t.id],cover=spotlightCover(t,meta);
  return `<section ${t.series?"data-tv-spot":"id=\"spot\""} data-collection-spot data-t="${t.id}" tabindex="0" aria-label="${esc(uiText("Открыть подборку «{title}»",{title:uiText(t.name)}))}" class="kg-catalog-spot">
    <div class="kg-catalog-spot-art" data-k="bg" style="background-image:url('${esc(cover)}')" aria-hidden="true"></div>
    <div class="kg-catalog-meta font-label-sm text-label-sm">
      <strong class="kg-catalog-spot-tag"><span class="material-symbols-outlined text-[14px]" aria-hidden="true">local_fire_department</span>${uiText("ХИТ НЕДЕЛИ")}</strong>
      <strong class="kg-catalog-rating" data-k="r">${esc(catalogRating(meta))}</strong>
    </div>
    <div class="kg-catalog-place text-primary font-label-sm text-label-sm">${flagsOf(t)} ${esc(t.region||where(t))}</div>
    <h3 class="font-headline-md text-headline-md text-on-surface font-bold">${esc(uiText(t.name))}</h3>
    <p class="font-body-sm text-body-sm text-on-surface-variant kg-clip2">${esc(t.series?collectionGenres(t):uiText(m[3]))}</p>
    <div class="kg-catalog-spot-footer">
      <span data-k="cnt" class="font-label-sm text-label-sm text-on-surface-variant">${esc(catalogCount(t,meta))}</span>
      ${catalogIcon(t,"spin","casino","Крутить рулетку")}
      <button type="button" data-act="open" data-t="${t.id}" class="kg-catalog-spot-open font-label-sm text-label-sm font-bold">${uiText("Открыть")}<span class="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_forward</span></button>
    </div>
  </section>`;
}
function updateWeeklySpotlight(){
  const spot=$("spot"),selected=spotlightTheme();
  if(!spot||spot.dataset.t===selected.id)return;
  spot.outerHTML=spotlightHtml(selected);
  paintMeta(selected.id);
}

const CHON="bg-primary-container text-on-primary-container shadow-[0_0_14px_rgb(var(--kg-primary-container)/0.28)]",CHOFF="bg-surface-panel text-text-muted hover:text-on-surface";
function chipCls(on){return "filter-chip flex items-center gap-1.5 px-3.5 py-2 rounded-full font-label-sm text-label-sm shrink-0 transition-all active:scale-95 "+(on?CHON:CHOFF);}

function catalogSortControl(series,mode){
  return collectionControlRow([
    ["rating","По рейтингу"],["count",series?"По числу сериалов":"По числу фильмов"],["title","По алфавиту"]
  ],mode,"data-catalog-sort","random","Случайная подборка");
}
function orderCatalogCards(grid,mode,meta,themeFor,fallback){
  const cards=[...grid.children];
  cards.sort((a,b)=>{
    const ma=meta(a.dataset.t)||{},mb=meta(b.dataset.t)||{};
    if(mode==="rating")return (parseFloat(mb.r)||0)-(parseFloat(ma.r)||0);
    if(mode==="count")return (mb.n||0)-(ma.n||0);
    if(mode==="title")return uiText(themeFor(a.dataset.t).name).localeCompare(uiText(themeFor(b.dataset.t).name),interfaceLanguage);
    return fallback(a,b);
  });
  if(cards.some((card,i)=>card!==grid.children[i]))cards.forEach(card=>grid.appendChild(card));
}
function highlightRandomCollection(cards,themeFor){
  if(!cards.length)return;
  const card=pick(cards);card.scrollIntoView({behavior:"smooth",block:"center"});
  card.classList.add("ring-2","ring-primary-container");setTimeout(()=>card.classList.remove("ring-2","ring-primary-container"),1800);
  toast(uiText("Выбрано: «{title}»!",{title:uiText(themeFor(card.dataset.t).name)}));
}

function buildCatalog(){
  const counts={};catalogThemes.forEach(t=>counts[cat(t)]=(counts[cat(t)]||0)+1);
  vc.innerHTML=`
<section class="flex flex-col gap-space-xs mt-1">
<div class="flex items-center justify-between"><span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-primary-container font-label-sm text-label-sm shadow-[0_0_14px_rgb(var(--kg-primary-container)/0.18)]"><span class="material-symbols-outlined text-[15px]" style="font-variation-settings:'FILL' 1;">auto_awesome</span>${uiText("Кураторский киногид")}</span>
<span class="font-micro-caption text-micro-caption text-text-muted flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>${uiText("{count} доступно", {count: catalogThemes.length})}</span></div>
<h2 class="font-headline-lg text-headline-lg text-primary tracking-tight">${uiText("Тематические коллекции")}</h2>
<p class="font-body-sm text-body-sm text-text-muted leading-relaxed">${uiText("{count} авторских киномаршрутов: от азиатского саспенса и скандинавского холода до исторических эпох", {count: catalogThemes.length})}</p>
<div class="relative w-full mt-2"><div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted"><span class="material-symbols-outlined text-[20px]">search</span></div>
<input id="cat-search" type="search" aria-label="${uiText("Поиск по подборкам")}" aria-controls="cat-grid" enterkeyhint="search" autocomplete="off" placeholder="${uiText("Найти подборку, страну или жанр...")}" class="w-full h-12 pl-11 pr-12 rounded-xl bg-surface-container-low text-on-surface placeholder:text-text-muted font-body-sm text-body-sm focus:outline-none focus:bg-surface-container transition-all shadow-[0_4px_16px_rgb(var(--kg-black)/0.4)]">
<button type="button" id="cat-clear" data-act="clear" aria-label="${uiText("Сбросить поиск")}" style="display:none" class="absolute inset-y-0 right-0 w-12 items-center justify-center text-text-muted hover:text-primary"><span class="material-symbols-outlined text-[18px]" aria-hidden="true">cancel</span></button></div>
</section>
<section id="cat-chips" class="flex gap-2 overflow-x-auto pb-1 -mx-gutter-mobile px-gutter-mobile">
<button type="button" data-f="all" class="${chipCls(true)}"><span>${uiText("Все {count}", {count: catalogThemes.length})}</span></button>
${Object.keys(CAT).filter(k=>counts[k]).map(k=>`<button type="button" data-f="${k}" class="${chipCls(false)}"><span>${uiText(CAT[k][0])} (${counts[k]})</span></button>`).join("")}</section>
${spotlightHtml(spotlightTheme())}
${catalogSortControl(false,sortMode)}
<p id="cat-note" class="font-micro-caption text-micro-caption text-text-muted px-1" style="display:none"></p>
<div class="flex items-center justify-between gap-2"><p id="cat-search-status" role="status" class="font-label-sm text-label-sm text-text-muted px-1"></p>${layoutSwitch(catalogLayout,"catalog")}</div>
<section id="cat-grid" class="${catalogLayout==="grid"?"kg-three-columns":"kg-catalog-list"}">${seededShuffle(catalogThemes,dailySeed()).map((t,i)=>cardHtml(t,i)).join("")}</section>
<div id="cat-empty" style="display:none" class="flex-col items-center justify-center py-12 px-4 text-center rounded-2xl bg-surface-panel/50"><div class="w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center text-primary-container mb-3 shadow-[0_0_18px_rgb(var(--kg-primary-container)/0.2)]"><span class="material-symbols-outlined text-[28px]">movie_edit</span></div><h3 class="font-headline-sm text-headline-sm text-primary font-bold">${uiText("Подборка не найдена")}</h3><p class="font-body-sm text-body-sm text-text-muted mt-1 max-w-xs">${uiText("Попробуйте другое слово или выберите «Все», чтобы искать во всём каталоге.")}</p><button type="button" data-act="reset" class="mt-4 px-4 py-2 rounded-xl bg-primary-container text-on-primary-container font-label-sm text-label-sm font-bold shadow-[0_0_12px_rgb(var(--kg-primary-container)/0.25)]">${uiText("Сбросить поиск")}</button></div>`;
  $("cat-grid").querySelectorAll(".collection-card").forEach(card=>paintCatalogCard(card,T[card.dataset.t],META[card.dataset.t]));
  catBuilt=true;
}

function paintMeta(id){
  const t=T[id];if(!t)return;
  const m=t.films ? {...(META[id]||{}),n:t.films.length} : META[id];if(!m)return;
  const spot=$("spot");
  if(spot?.dataset.t===id)paintCatalogSpot(spot,t,m);
  const card=$("cat-grid")?.querySelector(`.collection-card[data-t="${id}"]`);
  if(card)paintCatalogCard(card,t,m,true);
}
function paintCatalogSpot(spot,t,meta) {
  const cover=spotlightCover(t,meta);
  if(cover)spot.querySelector('[data-k="bg"]').style.backgroundImage=`url("${cover}")`;
  spot.querySelector('[data-k="r"]').textContent=catalogRating(meta);
  spot.querySelector('[data-k="cnt"]').textContent=catalogCount(t,meta);
}
const catalogNormalize=value=>String(value||"").toLowerCase().normalize("NFD")
  .replace(/\p{M}/gu,"").replace(/[^\p{L}\p{N}]+/gu," ").trim();
const catalogRegionNames=["ru","en"].map(lang=>new Intl.DisplayNames([lang],{type:"region"}));
const catalogTitleAliases={jhorror:["Japanese Horror"]};
function catalogSearchEntry(t){
  const [,english,subtitle,description]=TM[t.id]||[];
  const category=CAT[cat(t)]||[],region=REG[t.id]?.[0];
  const genres=t.g.split(/[|,]/).map(id=>GENRES[id]).filter(Boolean);
  const countries=t.cc.flatMap(code=>[code,cname(code),...catalogRegionNames.map(names=>names.of(code))]);
  const films=(t.films||[]).flatMap(f=>[f.title,f.original_title]);
  return [
    [[t.name,uiText(t.name),english,...(catalogTitleAliases[t.id]||[])],100],
    [[...countries,...genres,...genres.map(g=>uiText(g)),region,region&&uiText(region)],55],
    [films,42],
    [[category[0],category[0]&&uiText(category[0]),category[1]],32],
    [[subtitle,description,subtitle&&uiText(subtitle),description&&uiText(description)],18]
  ].flatMap(([values,weight])=>[...new Set(values.map(catalogNormalize).filter(Boolean))]
    .map(value=>({value,weight,words:value.split(" ")})));
}
let catalogSearchIndex;

// A single insertion, deletion, substitution or transposition in a longer word.
function catalogOneTypo(a,b){
  if(a.length<5||Math.abs(a.length-b.length)>1)return false;
  if(a.length>b.length)[a,b]=[b,a];
  let i=0;
  while(i<a.length&&a[i]===b[i])i++;
  if(a.length!==b.length)return a.slice(i)===b.slice(i+1);
  return i<a.length&&(a.slice(i+1)===b.slice(i+1)||
    (a[i]===b[i+1]&&a[i+1]===b[i]&&a.slice(i+2)===b.slice(i+2)));
}
function catalogMatch(fields,query,terms){
  let phrase=0,total=0,approximate=false;
  for(const {value,weight} of fields){
    if(value===query)phrase=Math.max(phrase,weight*4);
    else if(` ${value} `.includes(` ${query} `))phrase=Math.max(phrase,weight*2);
    else if(value.startsWith(query))phrase=Math.max(phrase,weight);
  }
  for(const term of terms){
    let exact=0,fuzzy=0;
    for(const {weight,words} of fields){
      for(const word of words){
        if(word===term)exact=Math.max(exact,weight);
        else if(term.length>=2&&word.startsWith(term))exact=Math.max(exact,weight*.75);
        else if(!exact&&catalogOneTypo(term,word))fuzzy=Math.max(fuzzy,weight*.5);
      }
    }
    if(!exact&&!fuzzy)return null;
    approximate ||= !exact;
    total+=exact||fuzzy;
  }
  return {score:phrase+total,approximate};
}
function filterCatalog(){
  const input=$("cat-search"),q=catalogNormalize(input.value),cards=[...$("cat-grid").children];
  const terms=[...new Set(q.split(" "))];
  const eligible=cards.filter(c=>activeCat==="all"||c.dataset.cat===activeCat);
  if(q&&!catalogSearchIndex)catalogSearchIndex=new Map(catalogThemes.map(t=>[t.id,catalogSearchEntry(t)]));
  const matches=q?eligible.map(c=>[c.dataset.t,catalogMatch(catalogSearchIndex.get(c.dataset.t),q,terms)])
    .filter(([,match])=>match):[];
  const hasExact=matches.some(([,match])=>!match.approximate);
  catalogScores=new Map(matches.filter(([,match])=>!hasExact||!match.approximate).map(([id,match])=>[id,match.score]));
  const visible=new Set(q?catalogScores.keys():eligible.map(c=>c.dataset.t));
  for(const card of cards)card.style.display=visible.has(card.dataset.t)?"":"none";
  $("cat-clear").style.display=input.value?"flex":"none";
  $("spot").style.display=q?"none":"";
  $("cat-search-status").textContent=q?uiText(hasExact||!visible.size?"Подборок найдено: {count}":"Похожие совпадения: {count}",{count:nf(visible.size)}):"";
  $("cat-empty").style.display=visible.size?"none":"flex";
  vc.querySelector('[data-act="random"]').disabled=!visible.size;
  sortCatalog();
}
function sortCatalog(){
  const grid=$("cat-grid");if(!grid)return;
  orderCatalogCards(grid,sortMode,id=>META[id],id=>T[id],(a,b)=>(catalogScores.get(b.dataset.t)||0)-(catalogScores.get(a.dataset.t)||0)||a.dataset.i-b.dataset.i);
}
async function loadAllMeta(force=false){
  const note=$("cat-note");
  if(!apiKey){if(note){note.textContent=uiText("Введите ключ TMDB на экране «Глобус», чтобы увидеть число фильмов и рейтинги подборок.");note.style.display="";}return false;}
  if(note)note.style.display="none";
  const results=await settleWithLimit(catalogThemes,4,async t=>{await loadMeta(t,force);if(catBuilt)paintMeta(t.id);});
  sortCatalog();
  return results.every(r=>r.status==="fulfilled");
}
function initCatalog(){
  if(!catBuilt)buildCatalog();
  updateWeeklySpotlight();
  catalogThemes.forEach(t=>paintMeta(t.id));
  sortCatalog();
  loadAllMeta().catch(error=>console.warn("[Moven] Collection metadata failed",error));
}
vc.addEventListener("input",e=>{
  if(e.target.id==="cat-search")filterCatalog();
});
vc.addEventListener("click",e=>{
  const sort=e.target.closest("[data-catalog-sort]");
  if(sort){sortMode=sort.dataset.catalogSort;syncCollectionSort(vc,"data-catalog-sort",sortMode);sortCatalog();return;}
  const layout=e.target.closest('[data-kg-layout="catalog"]');
  if(layout){
    catalogLayout=layout.dataset.mode;
    $("cat-grid").className=catalogLayout==="grid"?"kg-three-columns":"kg-catalog-list";
    syncLayout(vc,catalogLayout,"catalog");
    return;
  }
  const route=e.target.closest("[data-collection-route]");
  if(route){showView(route.dataset.collectionRoute);return;}
  const chip=e.target.closest("#cat-chips [data-f]");
  if(chip){activeCat=chip.dataset.f;vc.querySelectorAll("#cat-chips [data-f]").forEach(c=>c.className=chipCls(c===chip));filterCatalog();return;}
  const act=e.target.closest("[data-act]");
  if(act){
    const a=act.dataset.act;
    if(a==="spin"){e.stopPropagation();audio();openCollection(act.dataset.t,{spin:true});return;}
    if(a==="open"){openCollection(act.dataset.t);return;}
    if(a==="clear"||a==="reset"){
      const input=$("cat-search");input.value="";
      if(a==="reset"){activeCat="all";vc.querySelectorAll("#cat-chips [data-f]").forEach(c=>c.className=chipCls(c.dataset.f==="all"));}
      filterCatalog();input.focus();return;
    }
    if(a==="random"){
      highlightRandomCollection([...vc.querySelectorAll(".collection-card")].filter(c=>c.style.display!=="none"),id=>T[id]);return;
    }
  }
  const spot=e.target.closest("#spot");
  if(spot&&!e.target.closest("[data-act]")){openCollection(spot.dataset.t);return;}
  const card=e.target.closest(".collection-card");
  if(card)openCollection(card.dataset.t);
});
vc.addEventListener("keydown",e=>{
  if(e.target.id==="cat-search"){
    if(e.isComposing||e.keyCode===229)return;
    if(e.key==="Escape"&&e.target.value){e.preventDefault();e.target.value="";filterCatalog();}
    if(e.key==="Enter"&&catalogScores.size){
      e.preventDefault();openCollection([...$("cat-grid").children].find(c=>catalogScores.has(c.dataset.t)).dataset.t);
    }
    return;
  }
  if(e.target.id!=="spot"||(e.key!=="Enter"&&e.key!==" "))return;
  e.preventDefault();openCollection(e.target.dataset.t);
});

/* ================= СТРАНИЦА ПОДБОРКИ ================= */
let D={t:null,all:[],total:0,totals:{},cc:"",sort:"rating",shown:5,selected:null,picked:null};
async function markPageWatched(film){
  if(window.KGToggleWatched) return window.KGIsFilmWatched(film.id)?true:window.KGToggleWatched(film);
  const details=await filmDetails(film.id).catch(()=>null);
  const cc=(film.origin_country||[])[0]||(details&&details.countries||[])[0]||"";
  if(!watched.some(item=>Number(item.id)===Number(film.id))){
    const record=filmRecord(cc,film);record.countries=cc?[cc]:[];record.productionCountries=(film.origin_country||details?.countries||[]);record.watchedAt=new Date().toISOString();
    watched.unshift(record);store.set("watched",watched);
  }
  seen.add(Number(film.id));store.set("seen",[...seen]);updHist();return true;
}
function closePageFilm(placement, restoreFocus = false){
  if(D.selected?._placement===placement) closeInlineFilm(D.selected,restoreFocus);
}
const pageDeps={
  layoutSwitch,
  syncLayout,
  moodFilmGrid,
  posterTile,
  filmGridRows,
  sortBar,
  syncFilmSort,
  sortCollectionFilms,
  api:(params)=>api(params),
  searchKeywords:query=>requestTmdb("search/keyword",{query}),
  details:id=>filmDetails(id),
  getFilms:()=>oscarFilms(),
  hasKey:()=>Boolean(apiKey),
  countryName:cc=>cname(cc),
  isWatched:id=>watched.some(item=>item.id===Number(id)),
  markWatched:film=>markPageWatched(film),
  openFilm:(film,placement,detailTarget,options)=>openFilm(film,placement,detailTarget,options),
  closeFilm:(placement,restoreFocus)=>closePageFilm(placement,restoreFocus),
  refreshFilm:()=>renderSelectedPanel(),
  back:()=>showView("collections")
};
const moodDeps={
  ...pageDeps,
  get series(){return view==="series-mood";},
  api:params=>view==="series-mood"?window.KGSeries.discover(params):api(params),
  back:()=>showView(view==="series-mood"?"series-collections":"collections"),
  openFilm(film,placement,target,options){
    if(!window.KGSeries.isSeriesId(film.id)){openFilm(film,placement,target,options);return;}
    if(target?.startsWith("mood-roulette-winner-detail-")){
      const host=$(target);
      if(host)presentSeriesWinner(host,film,()=>view==="series-mood"&&host.isConnected);
    }else window.KGSeriesHub.openSeries(film,options?.opener);
  }
};
const CCON="bg-primary-container text-on-primary shadow-[0_0_12px_rgb(var(--kg-primary-container)/0.28)] font-semibold",CCOFF="bg-surface-container text-text-muted hover:text-on-surface";
const ccCls=on=>"h-[34px] px-3 rounded-full font-label-sm text-label-sm flex-shrink-0 transition-colors "+(on?CCON:CCOFF);
const sCls=on=>"rounded-full font-label-sm text-label-sm transition-colors active:scale-95 "+(on?CCON:CCOFF);

function collectionControlRow(modes,selected,attribute,action,actionLabel){
  return `<div data-collection-controls role="group" aria-label="${uiText("Сортировка:")}">
    ${modes.map(([mode,label])=>`<button type="button" ${attribute}="${mode}" aria-pressed="${mode===selected}" class="${sCls(mode===selected)}">${uiText(label)}</button>`).join("")}
    <button type="button" ${action==="spin"?'id="cl-spin"':""} data-act="${action}" class="${sCls(false)}">${uiText(actionLabel)}</button></div>`;
}
function syncCollectionSort(root,attribute,sort){
  root.querySelectorAll(`[${attribute}]`).forEach(button=>{
    const active=button.getAttribute(attribute)===sort;
    button.className=sCls(active);
    button.setAttribute("aria-pressed",String(active));
  });
}
const SON="bg-surface-container-high text-primary-fixed font-semibold",SOFF="text-text-muted hover:text-on-surface";
const moodSortButtonClass=on=>"px-2.5 py-1 rounded font-micro-caption text-micro-caption "+(on?SON:SOFF);

const collectionSortModes=[["rating","По рейтингу"],["pop","Популярные"],["new","Свежие"]];
function sortBar(sort){
  return `<div class="flex flex-wrap items-center justify-between gap-1.5" data-kg-collection-sorting>
<span class="font-micro-caption text-micro-caption text-text-muted">${uiText("Сортировка:")}</span><div class="flex flex-wrap items-center gap-1 bg-surface-container-low p-0.5 rounded-lg" role="group" aria-label="${uiText("Сортировка:")}">${collectionSortModes.map(([mode,label])=>
    `<button type="button" data-kg-film-sort="${mode}" aria-pressed="${mode===sort}" class="${moodSortButtonClass(mode===sort)}">${uiText(label)}</button>`).join("")}</div></div>`;
}
function syncFilmSort(root,sort){
  root.querySelectorAll("[data-kg-film-sort]").forEach(button=>{
    const active=button.dataset.kgFilmSort===sort;
    button.className=moodSortButtonClass(active);
    button.setAttribute("aria-pressed",String(active));
  });
}
function sortCollectionFilms(films,sort){
  const compare={
    rating:(a,b)=>(Number(b.vote_average)||0)-(Number(a.vote_average)||0),
    pop:(a,b)=>(Number(b.popularity)||0)-(Number(a.popularity)||0),
    new:(a,b)=>String(b.release_date||"").localeCompare(String(a.release_date||""))
  };
  return [...films].sort(compare[sort]||compare.rating);
}

const inCollectionCountry=f=>!D.cc||(D.t.series?f.origin_country?.includes(D.cc):f._cc===D.cc);
function derived(){
  const a=D.all.filter(inCollectionCountry);
  const best=a.slice().sort((x,y)=>weighed(y)-weighed(x))[0];
  const rest=sortCollectionFilms(a.filter(f=>f!==best),D.sort);
  return {best,rest};
}
const totalFor=()=>D.cc?(D.totals[D.cc]||0):D.total;
const moreSeriesPages=()=>D.t.series&&(D.cc?(D.pageLimits[D.cc]||0)>D.pages:Object.values(D.pageLimits).some(max=>max>D.pages));
const byId=id=>D.all.find(f=>String(f.id)===String(id));

function filmItem(f){
  const series=window.KGSeries.isSeriesId(f.id);
  const y=(f.release_date||"").slice(0,4);
  const gs=(f.genre_ids||[]).map(i=>(series?window.KGSeries.genreLabels:GENRES)[i]).filter(Boolean).slice(0,2).map(genre=>uiText(genre));
  const selected=D.selected&&D.selected._placement==="list"&&String(D.selected.id)===String(f.id)?D.selected:null;
  return `<article class="kg-film-list-shell flex flex-col gap-space-sm p-3 rounded-xl bg-surface-panel shadow-md hover:bg-surface-container-low transition-colors">
<div class="flex gap-space-sm cursor-pointer" role="button" tabindex="0" data-act="open" data-id="${f.id}">
<div class="kg-film-card-poster relative flex-shrink-0 rounded-lg overflow-hidden bg-surface-container-high">${collectionPoster(f,"w185")}
<span class="absolute top-1 left-1 px-1 py-0.5 rounded bg-surface-panel/90 text-primary-container font-micro-caption text-micro-caption font-bold">${f.vote_average ? Number(f.vote_average).toFixed(1) : "—"} ★</span></div>
<div class="flex flex-col justify-between flex-1 min-w-0"><div class="flex flex-col gap-0.5">
<div class="flex items-center justify-between"><span class="font-micro-caption text-micro-caption text-text-muted">${fl(f._cc)} ${esc(cname(f._cc))}${y?" • "+y:""}</span><span data-rt="${f.id}" class="font-micro-caption text-micro-caption px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant">${series?(f.number_of_seasons?uiText("Сезонов: {count}",{count:f.number_of_seasons}):""):uiText("— мин")}</span></div>
<h4 class="font-label-lg text-label-lg text-on-surface font-bold truncate">${esc(f.title)}</h4>
<p data-dir="${f.id}" class="font-micro-caption text-micro-caption text-text-muted truncate">&nbsp;</p>
<div class="flex items-center gap-1.5 pt-1">${gs.map(g=>`<span class="px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-micro-caption text-micro-caption">${esc(g)}</span>`).join("")}</div></div></div></div>
${selected?selectedFilmHtml(selected):""}</article>`;
}
function pearlHtml(f,selected=null){
  const y=(f.release_date||"").slice(0,4);
  return `<div class="flex flex-col gap-space-xs"><div class="flex items-center gap-1.5 px-1"><span class="material-symbols-outlined text-[18px] text-primary-container">stars</span><h3 class="font-headline-sm text-headline-sm text-primary font-bold">${uiText("Жемчужина коллекции")}</h3></div>
<div class="kg-film-list-shell relative overflow-hidden rounded-xl bg-surface-panel p-space-md shadow-xl flex flex-col gap-space-md"><div class="flex gap-space-md cursor-pointer" role="button" tabindex="0" data-act="open" data-id="${f.id}">
<div class="relative flex-shrink-0 w-28 h-40 rounded-lg overflow-hidden bg-surface-container-high shadow-md">${collectionPoster(f,"w342")}
<div class="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-surface-panel/90 backdrop-blur-md text-primary-container font-label-sm text-label-sm font-bold flex items-center gap-0.5"><span class="material-symbols-outlined text-[13px]" style="font-variation-settings:'FILL' 1;">star</span>${f.vote_average ? Number(f.vote_average).toFixed(1) : "—"}</div></div>
<div class="flex flex-col justify-between flex-1 min-w-0"><div class="flex flex-col gap-1">
<div class="flex items-center gap-1.5"><span class="font-micro-caption text-micro-caption px-1.5 rounded bg-surface-container text-on-surface-variant">${fl(f._cc)} ${y}</span><span data-rt="${f.id}" class="font-micro-caption text-micro-caption text-text-muted">${uiText("— мин")}</span></div>
<h4 class="font-headline-sm text-headline-sm text-on-surface font-bold leading-snug kg-clip2">${esc(f.title)}</h4>
<p class="font-micro-caption text-micro-caption text-text-muted italic truncate">${f.original_title&&f.original_title!==f.title?esc(f.original_title):"&nbsp;"}</p>
<p data-dir="${f.id}" class="font-micro-caption text-micro-caption text-on-surface-variant">&nbsp;</p></div>
<p class="font-body-sm text-body-sm text-text-muted kg-clip2 pt-1">${esc(f.overview||uiText("Описания на русском пока нет."))}</p></div></div>
${selected?selectedFilmHtml(selected):""}</div></div>`;
}
function renderFilms(){
  const box=$("cl-films");if(!box)return;
  const {best,rest}=derived();
  const selectedInList=D.selected&&D.selected._placement==="list";
  let anchorId=null,anchorTop=0;
  {const els=[...box.querySelectorAll('[data-act="open"]')];
   const el=(selectedInList&&els.find(e=>String(e.dataset.id)===String(D.selected.id)))||els.find(e=>e.getBoundingClientRect().bottom>0);
   if(el){anchorId=el.dataset.id;anchorTop=el.getBoundingClientRect().top;}}
  const keepScroll=()=>{if(anchorId==null)return;
    const el=[...box.querySelectorAll('[data-act="open"]')].find(e=>String(e.dataset.id)===String(anchorId));
    if(el){const d=el.getBoundingClientRect().top-anchorTop;if(d)window.scrollBy(0,d);}};
  if(!best){box.innerHTML=`<p class="font-body-sm text-body-sm text-text-muted px-1">${uiText(D.t.series?"Подходящих сериалов не нашлось.":"Подходящих фильмов не нашлось.")}</p>`;return;}
  const list=rest.slice(0,D.shown);
  const grid=collectionFilmLayout==="grid";
  const listMarkup=grid?filmGridRows(list,row=>{
    const selected=selectedInList&&row.some(f=>String(D.selected.id)===String(f.id))?D.selected:null;
    return `<div class="kg-three-columns kg-film-grid-row" data-collection-grid-row>${row.map(f=>posterTile(f,`data-act="open" data-id="${f.id}" aria-expanded="${String(f.id) === String(selected?.id)}"`)).join("")}</div><div data-collection-grid-detail ${selected?"":"hidden"}>${selected?selectedFilmHtml(selected):""}</div>`;
  }):list.map(f=>filmItem(f)).join("");
  const pearl=pearlHtml(best,selectedInList&&String(D.selected.id)===String(best.id)?D.selected:null);
  box.innerHTML=pearl+
  `<div class="flex flex-col gap-space-sm"><div class="flex items-center justify-between gap-2 px-1"><div><h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">${uiText("Отобранные шедевры")}</h3><span class="font-micro-caption text-micro-caption text-text-muted">${uiText("{opened} из {total}", {opened: list.length, total: nf(Math.max(totalFor(),list.length+1))})}</span></div>${layoutSwitch(collectionFilmLayout,"collection")}</div>
  <div class="flex flex-col gap-space-sm">${listMarkup}</div>
  ${rest.length>D.shown||moreSeriesPages()?`<button type="button" data-act="more" ${D.loadingMore?"disabled aria-busy=\"true\"":""} class="w-full py-3 rounded-xl bg-surface-panel hover:bg-surface-container-low text-primary text-center font-label-md text-label-md font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"><span class="material-symbols-outlined text-[18px]">expand_more</span><span>${uiText(D.loadingMore?"Загружаем подборку…":"Показать ещё")}</span></button>`:""}</div>`;
  paintWatchedButtons(box);
  keepScroll();
  if (!apiKey) return;
  [best,...list].forEach(f=>filmDetails(f.id).then(d=>{
    const rt=vd.querySelectorAll(`[data-rt="${f.id}"]`),dr=vd.querySelectorAll(`[data-dir="${f.id}"]`);
    rt.forEach(e=>e.textContent=d.runtime?uiText("{minutes} мин", {minutes: d.runtime}):"");
    dr.forEach(e=>e.innerHTML=(d.dirsFull||[]).length?uiText("Реж.")+" "+d.dirsFull.slice(0,2).map(p=>kgPersonLink(p,"Режиссёр")).join(", "):"");
  }).catch(()=>{}));
}
function selectedFilmHtml(f) {
  return window.KGFilmCard.markup(f, {inline:true});
}

function inlineFilmCard(film) {
  const root = film._placement === "list" ? $("cl-films") : document;
  return root?.querySelector(`[data-kg-inline-film][data-selected-film="${Number(film.id)}"]`);
}
window.KGInlineFilmModel = card => D.selected && card.hasAttribute("data-kg-inline-film") &&
  card.dataset.selectedFilm === String(D.selected.id) ? D.selected : null;

function restoreFilmOpener(film) {
  if (film?._opener?.isConnected) film._opener.focus({preventScroll:true});
}

function otherHtml(t){
  const m=META[t.id]||{};
  const artCover = t.series?(P(m.p,"w185")||t.cover):getThemeCover(t.id);
  const imgMarkup = artCover 
    ? `<img class="w-full h-full object-cover" alt="${esc(uiText(t.name))}" src="${artCover}">`
    : (m.p ? `<img class="w-full h-full object-cover" alt="" src="${P(m.p,"w185")}">` : "");
  return `<a href="#" data-act="goto" data-t="${t.id}" class="flex flex-col gap-1.5 p-3 rounded-xl bg-surface-panel hover:bg-surface-container-low min-w-[140px] max-w-[140px] flex-shrink-0 transition-colors shadow-md"><div class="w-full h-20 rounded-lg overflow-hidden bg-surface-container-high" data-oi="${t.id}">${imgMarkup}</div><span class="font-label-sm text-label-sm text-on-surface font-bold truncate">${esc(uiText(t.name))} ${fl(t.cc[0])}</span><span data-oc="${t.id}" class="font-micro-caption text-micro-caption text-text-muted">${m.n?(t.series?seriesCollectionCount(m.n):nf(m.n)+" "+fw(m.n)):"…"}</span></a>`;
}

function renderCollection(){
  const t=D.t,m=TM[t.id]||["noir","","",""];
  const themes=t.series?tvThemes:catalogThemes.filter(theme=>!theme.series);
  const others=shuffle(themes.filter(x=>x.id!==t.id)).slice(0,5);
  vd.dataset.collectionMedia=t.series?"tv":"movie";
  vd.innerHTML=`
<div class="flex items-center justify-between gap-space-sm pt-space-xs"><button type="button" data-act="back" class="flex items-center gap-1.5 text-text-muted hover:text-primary transition-colors py-1"><span class="material-symbols-outlined text-[18px]">arrow_back</span><span class="font-label-sm text-label-sm">${uiText("Все подборки")}</span></button>
<div class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-primary-fixed shadow-sm"><span class="material-symbols-outlined text-[14px] text-primary-container">${ICON[t.id]||"auto_awesome"}</span><span class="font-micro-caption text-micro-caption font-semibold tracking-wide uppercase">${uiText("Кураторский выбор")}</span></div></div>
<div class="relative overflow-hidden rounded-xl bg-surface-panel p-space-md shadow-xl"><div class="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-cinema-velvet-glow blur-3xl pointer-events-none"></div><div class="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-cinema-amber-glow blur-2xl pointer-events-none"></div>
<div class="relative flex flex-col gap-space-sm z-10"><div class="flex items-center gap-2"><span class="px-2 py-0.5 rounded-full bg-cinema-velvet-deep text-secondary font-micro-caption text-micro-caption tracking-wider">${uiText(t.series?t.category:CAT[m[0]][1])}</span><span id="cl-count" class="text-text-muted font-micro-caption text-micro-caption">${t.series?"…":uiText("… картин")}</span></div>
<div class="flex flex-col"><h2 class="font-display-hero-mobile text-display-hero-mobile text-primary font-bold tracking-tight">${esc(uiText(t.name))}</h2><p class="font-label-sm text-label-sm text-on-surface-variant font-medium tracking-wide">${esc(uiText(m[1]))}</p></div>
<div class="flex flex-wrap items-center gap-1.5 pt-0.5">${t.cc.map(cc=>`<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface font-micro-caption text-micro-caption shadow-sm">${fl(cc)} ${esc(cname(cc))}</span>`).join("")}</div>
<p class="font-body-sm text-body-sm text-text-muted leading-relaxed pt-1">${esc(uiText(m[3]))}</p>
<div class="flex items-center gap-2 pt-1 flex-wrap">${gnames(t).map(g=>`<span class="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-micro-caption text-micro-caption">${esc(g)}</span>`).join("")}</div></div></div>
<div class="flex flex-col gap-space-sm" data-kg-collection-sorting>
${collectionControlRow([["rating","По рейтингу"],["pop","Популярные"],["new","Свежие"]],D.sort,"data-kg-film-sort","spin","Случайно")}
${t.cc.length>1?`<div class="flex flex-col gap-1.5 pt-1"><span class="font-micro-caption text-micro-caption text-text-muted">${uiText("Фильтр по стране:")}</span><div id="cl-cc" class="flex items-center gap-1.5 overflow-x-auto pb-1"><button type="button" data-act="cc" data-cc="" class="${ccCls(true)}">${uiText("Все страны")}</button>${t.cc.map(cc=>`<button type="button" data-act="cc" data-cc="${cc}" class="${ccCls(false)}">${fl(cc)} ${esc(cname(cc))}</button>`).join("")}</div></div>`:""}
</div>
<div id="cl-reel" style="display:none" class="flex flex-col gap-space-sm">
<div id="cl-reel-host"></div>
<div class="flex items-center justify-between px-1"><span id="cl-fc" class="font-mono text-micro-caption text-primary-fixed font-semibold tracking-wide">${uiText("Кадр 00 / 00")}</span><button type="button" id="cl-skip" data-act="skip" style="display:none" class="font-micro-caption text-micro-caption text-text-muted hover:text-primary underline">${uiText("Пропустить")}</button></div>
<div id="cl-result"></div></div>
<div id="cl-films" class="flex flex-col gap-space-lg"><p class="font-body-sm text-body-sm text-text-muted px-1 animate-pulse">${uiText("Загружаем подборку…")}</p></div>
<div class="flex flex-col gap-space-sm pt-space-xs"><div class="flex items-center justify-between px-1"><h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">${uiText("Другие подборки")}</h3><a href="#" data-act="back" class="font-micro-caption text-micro-caption text-primary hover:underline">${uiText("Все {count}", {count: themes.length})} →</a></div>
<div id="cl-others" class="flex gap-space-sm overflow-x-auto pb-2">${others.map(otherHtml).join("")}</div>
<a href="#" data-act="back" class="w-full py-3 rounded-xl bg-surface-panel hover:bg-surface-container-low text-primary text-center font-label-md text-label-md font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"><span class="material-symbols-outlined text-[18px]">apps</span><span>${uiText("Все {count} подборок Moven", {count: themes.length})}</span></a></div>`;
  // постеры и счётчики «других подборок»
  others.forEach(o=>loadMeta(o).then(m=>{
    const a=vd.querySelector(`[data-oc="${o.id}"]`),i=vd.querySelector(`[data-oi="${o.id}"]`);
    if(a)a.textContent=t.series?seriesCollectionCount(m.n):nf(m.n)+" "+fw(m.n);
    if(i&&!i.firstChild){
      const art=getThemeCover(o.id);
      if(art) i.innerHTML=`<img class="w-full h-full object-cover" alt="" src="${art}">`;
      else if(m.p) i.innerHTML=`<img class="w-full h-full object-cover" alt="" src="${P(m.p,"w185")}">`;
    }
  }).catch(()=>{}));
}

async function openCollection(id,opt){
  const t=(opt?.series??window.KGSeries.active)?tvThemeFor(id):T[id];
  if(!t)return;
  const destination=t.series?"series-collection":"collection";
  if (!opt?.returning) rememberView(destination, id);
  rStop();
  const cached=themeDataCache.get(themeDataKey(t,2));
  const initial=cached?.data || (t.films ? curatedData(t.films.map(localizeFilmListItem)) : null);
  D={t,all:initial?initial.films:[],total:initial?initial.total:0,totals:initial?initial.totals:{},pageLimits:initial?.pageLimits||{},pages:2,cc:"",sort:"rating",shown:5,selected:null,picked:null};
  const selection=D;
  renderCollection();showView(destination, false);
  if(initial){
    $("cl-count").textContent=t.series?seriesCollectionCount(D.total):collectionFilmCount(D.total);
    renderFilms();
  }
  if (!apiKey) {
    if (t.films && opt?.spin) inPageRoulette();
    if (!t.films) $("cl-films").innerHTML=`<p class="font-body-sm text-body-sm text-text-muted px-1">${uiText(t.series?"Добавьте ключ TMDB, чтобы загрузить сериалы подборки.":"Введите ключ TMDB на экране «Глобус», чтобы загрузить фильмы подборки.")}</p>`;
    return;
  }
  try{
    const r=await loadTheme(t,2,Boolean(opt?.retry));
    if(D!==selection||view!==destination)return;
    if(r._stale && initial){$("cl-films").insertAdjacentHTML("afterbegin",`<p role="status" class="font-micro-caption text-micro-caption text-text-muted">${uiText("Не удалось обновить данные; показана сохранённая подборка.")}</p>`);return;}
    D.all=r.films;D.total=r.total;D.totals=r.totals;D.pageLimits=r.pageLimits||{};
    if (!r._partial && !r._stale && (!t.films || r.films.some(f=>f.vote_count))) {
      const meta=saveThemeMeta(t,r);
      if(t.series){
        const card=seriesCollections.querySelector(`.collection-card[data-t="${t.id}"]`);
        if(card)paintCatalogCard(card,t,meta,true);
      }else paintMeta(t.id);
    }
    $("cl-count").textContent=t.series?seriesCollectionCount(r.total):collectionFilmCount(r.total);
    renderFilms();
    if(r._partial || r._stale) $("cl-films").insertAdjacentHTML("afterbegin",`<p role="status" class="font-micro-caption text-micro-caption text-text-muted">${uiText("Часть данных недоступна.")} <button type="button" data-act="retry" class="text-primary underline">${uiText("Повторить")}</button></p>`);
    if(opt&&opt.spin)inPageRoulette();
  }catch(e){
    if(D!==selection||view!==destination)return;
    if(initial){
      $("cl-films").insertAdjacentHTML("afterbegin",`<p role="status" class="font-micro-caption text-micro-caption text-text-muted">${uiText("Не удалось обновить данные; показана сохранённая подборка.")}</p>`);
      console.error("[Moven] Не удалось обновить подборку:",e);
    }else $("cl-films").innerHTML=`<p class="font-body-sm text-body-sm text-feedback-error px-1">${esc(uiText(e.message||"Не удалось загрузить подборку."))}</p>`;
  }
}

async function showMoreCollection(){
  if(D.loadingMore)return;
  if(!moreSeriesPages()||derived().rest.length>D.shown){
    D.shown+=5;renderFilms();return;
  }
  const selection=D,pages=Math.min(500,D.pages+2);
  D.loadingMore=true;renderFilms();
  try{
    const result=await loadTheme(D.t,pages);
    if(D!==selection||view!=="series-collection")return;
    if(result._partial||result._stale)throw new Error("Partial series collection");
    D.all=result.films;D.total=result.total;D.totals=result.totals;D.pageLimits=result.pageLimits;
    D.pages=pages;D.shown+=5;
    $("cl-count").textContent=seriesCollectionCount(D.total);
  }catch{
    if(D===selection&&view==="series-collection")toast("Часть данных недоступна.","info");
  }finally{
    selection.loadingMore=false;
    if(D===selection&&view==="series-collection")renderFilms();
  }
}

function placeListPanel(){
  const box=$("cl-films");if(!box)return false;
  const selected = D.selected?._placement === "list" ? D.selected : null;
  const previews = [...box.querySelectorAll('[data-act="open"]')];
  const preview = selected && previews.find(item => item.dataset.id === String(selected.id));
  for (const tile of previews) {
    if (tile.classList.contains("kg-film-grid-tile")) {
      tile.setAttribute("aria-expanded", String(tile === preview));
    }
  }
  const card = preview?.parentElement;
  const top = card?.getBoundingClientRect().top;
  const rowHost=preview?.closest("[data-collection-grid-row]")?.nextElementSibling;
  for (const host of box.querySelectorAll("[data-collection-grid-detail]:not([hidden])")) {
    if(host===rowHost)continue;
    host.replaceChildren();
    host.hidden=true;
  }

  const panels = box.querySelectorAll('[data-act="open"] + [data-selected-film]');
  for (const panel of panels) {
    if (panel.previousElementSibling !== preview) panel.remove();
  }

  if (!selected) return true;
  if (!card) return false;
  const html = selectedFilmHtml(selected, true);
  if(rowHost){
    rowHost.innerHTML=html;
    rowHost.hidden=false;
    paintWatchedButtons(rowHost);
  }else{
    const panel = preview.nextElementSibling;
    if (panel?.matches("[data-selected-film]")) panel.outerHTML = html;
    else preview.insertAdjacentHTML("afterend", html);
    paintWatchedButtons(preview.nextElementSibling);
  }
  const delta = card.getBoundingClientRect().top - top;
  if (delta) window.scrollBy(0, delta);
  return true;
}
function paintWatchedButtons(container){container?.querySelectorAll("[data-film-watched]").forEach(button=>{const id=button.dataset.filmWatched;window.KGPaintWatchedButton?.(button,!!window.KGIsFilmWatched?.(id));});}
function renderSelectedPanel(refresh = false){
  const selected=D.selected;if(!selected)return;
  const current=refresh && inlineFilmCard(selected);
  if(current){
    window.KGFilmCard.update(current,selected,{inline:true});
    window.KGSeriesDetail?.enhance(current,selected);
    return;
  }
  if(selected._placement==="list"){
    if(!placeListPanel())renderFilms();return;
  }
  const html=selectedFilmHtml(selected);
  const detailId = selected._placement === "home-europe" ? "kg-home-europe-detail" : selected._detailTarget;
  if (detailId) {
    const target = $(detailId) || (selected._placement === "mood" ? $("mood-film-detail") : $("oscar-film-detail"));
    if (target) {
      target.innerHTML = html;
      if (selected._placement === "home-europe" || target.hasAttribute("data-home-inline-film")) target.hidden = false;
      paintWatchedButtons(target);
    }
    return;
  }
  if(selected._placement==="home"){
    const film=homeEditorial.films.find(f=>String(f.id)===String(selected.id));
    if(film){
      homeEditorial.featureDetails={...homeEditorial.featureDetails,...selected};
      renderHomeFeature(film,homeEditorial.featureDetails,selected);
    }
    return;
  }
  if(selected._placement==="roulette"){
    const result=$("cl-result");if(result){result.innerHTML=html;paintWatchedButtons(result);}
    return;
  }
  renderFilms();
}
function openFilm(f,placement="list",detailTarget=null,{opener=document.activeElement,relatedNavigation=false}={}){
  const previous = D.selected;
  if (previous && previous._placement === placement && String(previous.id) === String(f.id) && previous._detailTarget === detailTarget) {
    closeInlineFilm(previous);
    return;
  }
  const listAnchor = placement === "list"
    ? opener?.closest("[data-collection-grid-row], .kg-film-list-shell")
    : null;
  const anchorTop = listAnchor?.getBoundingClientRect().top;
  window.KGFilmCard.stopTrailers();
  if (previous && !relatedNavigation) closeInlineFilm(previous, false);
  if(placement==="list")$("cl-result").replaceChildren();
  const relatedPool=f._kgGlobalRelated?null:Array.isArray(f._kgRelatedPool)?f._kgRelatedPool:(placement==="list"||placement==="roulette"?D.all:placement==="home-europe"?null:placement.startsWith("home")?homeEditorial.films:null);
  const relatedContext=relatedPool&&relatedPool.length?`${placement}:${D.t&&D.t.id||"all"}:${detailTarget||""}`:"";
  if(relatedContext&&window.KGFilmInteractions)window.KGFilmInteractions.registerPool(relatedContext,relatedPool);
  const selected = D.selected = window.KGFilmCard.createModel(f,{
    _placement:placement, _detailTarget:detailTarget, _opener:opener, _openerScroll:window.scrollY, _kgRelatedContext:relatedContext,
    _oscarContext:placement==="oscar"
  });
  if(relatedNavigation&&previous){selected._relatedPrevious=previous;selected._relatedScroll=previous._relatedScroll??window.scrollY;}
  renderSelectedPanel();
  if (listAnchor?.isConnected) {
    const shift = listAnchor.getBoundingClientRect().top - anchorTop;
    window.KGRestoreFilmScroll(window.scrollY + shift);
  }
  requestAnimationFrame(()=>{
    if (D.selected !== selected) return;
    const panel = inlineFilmCard(selected);
    if (!panel) return;
    if (relatedNavigation || placement === "home-europe") {
      window.KGScrollToFilmStart(panel, 620, {
        target: () => panel.querySelector("[data-kg-film-description]"),
        downOnly: true,
      });
    } else if (placement === "list") {
      window.KGScrollToFilmStart(panel, 620, {
        target: () => panel.querySelector("[data-kg-film-description]"),
        downOnly: true,
      });
    } else {
      window.KGScrollToFilmStart(panel);
    }
  });
  window.KGFilmCard.hydrate(selected,f,()=>renderSelectedPanel(true),()=>D.selected===selected);
}

function closeInlineFilm(film = D.selected, restoreFocus = true) {
  if (!film || film !== D.selected) return;
  const panel = inlineFilmCard(film);
  window.KGFilmCard.stopTrailers(panel?.parentElement || document);
  D.selected = null;
  if(film._relatedPrevious){
    const previous=film._relatedPrevious;
    D.selected=previous;
    renderSelectedPanel();
    requestAnimationFrame(()=>window.scrollTo({top:film._relatedScroll||0,behavior:"smooth"}));
    return;
  }
  if (film._placement === "home") {
    const featured = homeEditorial.films.find(item=>String(item.id)===String(film.id));
    if (featured) renderHomeFeature(featured,homeEditorial.featureDetails,null);
    const button = $("kg-home-feature").querySelector('[data-home-act="open"]');
    if (restoreFocus && button) {
      button.focus({preventScroll:true});
      if (panel) window.KGRestoreFilmScroll(film._openerScroll);
    }
    return;
  }
  if (film._placement === "list") { if (!placeListPanel()) renderFilms(); }
  else {
    const target = film._detailTarget ? $(film._detailTarget) :
      film._placement === "roulette" ? $("cl-result") : $("kg-home-europe-detail");
    target?.replaceChildren();
    if (target?.hasAttribute("data-home-inline-film")) target.hidden = true;
  }
  if (restoreFocus) {
    restoreFilmOpener(film);
    if (panel && film._opener?.isConnected && film._opener !== document.body) {
      window.KGRestoreFilmScroll(film._openerScroll);
    }
  }
}

window.KGOpenFilmFromRelated=(film,placement,detailTarget,options)=>openFilm(film,placement,detailTarget,options);
window.KGOpenInlineRelatedFilm=(film,current,opener)=>{
  if(D.selected===current&&current?._placement){
    current._relatedScroll=window.scrollY;
    openFilm(film,current._placement,current._detailTarget,{opener,relatedNavigation:true});
    return true;
  }
  return !!window.KGOpenGlobeRelatedFilm?.(film,current,opener);
};
window.KGCloseFilmFromRelated=(detailTarget,restoreFocus=false)=>{
  if (D.selected && D.selected._detailTarget===detailTarget) closeInlineFilm(D.selected,restoreFocus);
  else {
    const target = $(detailTarget);
    target?.replaceChildren();
    if (target?.hasAttribute("data-home-inline-film")) target.hidden = true;
  }
};

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
  const b=$("cl-spin");if(!b)return;
  b.className=sCls(on);
  b.setAttribute("aria-busy",String(on));
  b.disabled=on;
  const sk=$("cl-skip");if(sk)sk.style.display=on?"":"none";
}
function rStop(){
  R.token++;cancelAnimationFrame(R.raf);R.busy=false;
  snd(()=>stopFilmReelSound());
  setBtn(false);
}
function finishPick(film,token){
  if(token!==R.token||!R.busy)return;
  R.busy=false;D.picked=film;setBtn(false);
  snd(()=>playFilmFoundSound());
  window.KGCinemaReel?.presentTicket($("cl-reel"),film,{country:cname(film._cc||D.cc||D.t.cc[0])});
  window.KGCinemaReel?.updateIMAX(document.getElementById("kg-imax-stage"),film,{country:cname(film._cc||D.cc||D.t.cc[0]),state:"ФИЛЬМ В КАДРЕ"});
  if(!D.t.series){openFilm(film,"roulette");return;}
  const host=$("cl-result");
  presentSeriesWinner(host,film,()=>R.token===token&&D.picked===film&&host.isConnected);
}
function presentSeriesWinner(host,film,current){
  const model=window.KGFilmCard.createModel(film);
  const refresh=()=>{if(current())window.KGSeriesHub.mountDiscovery(host,model);};
  refresh();
  window.KGFilmCard.hydrate(model,film,refresh,current);
  requestAnimationFrame(()=>{
    if(current())window.KGScrollToFilmStart(host,620,{target:()=>host.firstElementChild});
  });
}
async function inPageRoulette(){
  if(R.busy)return;
  if(!D.all.length){toast("Подборка ещё загружается","movie");return;}
  const inCc=f=>inCollectionCountry(f);
  const pool=D.all.filter(f=>inCc(f)&&!seen.has(f.id));
  if(!pool.length){toast("Все фильмы из выборки уже в истории","history");return;}
  const film=pick(pool);
  const others=shuffle(D.all.filter(f=>inCc(f)&&f.id!==film.id&&(f.poster_path||D.t.films)));
  const token=++R.token;R.busy=true;R.skip=false;D.picked=null;D.selected=null;
  renderFilms();
  $("cl-reel").style.display="";$("cl-result").innerHTML="";
  $("cl-reel-host").innerHTML = window.KGCinemaReel.render({trackId:"cl-track",frameId:"cl-frame"});
  setBtn(true);
  try{audio();}catch(e){}
  $("cl-reel").scrollIntoView({behavior:"smooth",block:"center"});
  if(!others.length||RM){                      // мало постеров или отключена анимация: сразу показываем выбор
    if(window.KGCinemaReel?.isProjectionMode?.()){
      const landed=await window.KGCinemaReel.spinProjectionTrack($("cl-reel"),[film],film,{reducedMotion:true,cancelled:()=>token!==R.token,meta:{country:cname(film._cc||D.cc||D.t.cc[0])}});
      if(landed&&token===R.token){$("cl-fc").textContent=uiText("Фильм найден");finishPick(film,token);}return;
    }
  if(window.KGCinemaReel?.isCassetteMode?.()){
      const eligible=D.all.filter(inCc),landed=await window.KGCinemaReel.spinCassetteDeck($("cl-reel"),eligible,[film],film,{reducedMotion:true,cancelled:()=>token!==R.token,onOpen:f=>D.t.series?window.KGSeriesHub.openSeries(f,document.activeElement):openFilm(f,"roulette")});
      if(landed&&token===R.token){$("cl-fc").textContent=uiText("Фильм выбран");finishPick(film,token);}return;
    }
    if(window.KGCinemaReel?.isTicketMode?.()){
      const landed=await window.KGCinemaReel.animateTicketDeck($("cl-reel"),[film],film,{reducedMotion:true,meta:{country:cname(film._cc||D.cc||D.t.cc[0])},cancelled:()=>token!==R.token});
      if(landed&&token===R.token){$("cl-fc").textContent="Билет найден";finishPick(film,token);}return;
    }
    rMount([film],0,"chosen");$("cl-fc").textContent=uiText("Кадр 01 / 01");
    finishPick(film,token);return;
  }
  const NEED=26,T=window.KGCinemaReel.SEARCH_REEL_DURATION,TAIL=6,seq=[];
  for(let i=0;i<NEED;i++)seq.push(others[i%others.length]);
  seq.push(film);
  for(let i=0;i<TAIL;i++)seq.push(others[(i+2)%others.length]);
  await Promise.race([Promise.all(seq.filter(f=>f.poster_path).map(f=>new Promise(r=>{const im=new Image();im.onload=im.onerror=r;im.src=P(f.poster_path,"w185");}))),wait(2500)]);
  if(token!==R.token)return;
  if(window.KGCinemaReel?.isProjectionMode?.()){
    const total=D.all.filter(inCc).length;$("cl-fc").textContent=uiText("Проектор запускается…");snd(()=>startFilmReelSound());
    const landed=await window.KGCinemaReel.spinProjectionTrack($("cl-reel"),seq,film,{meta:{country:cname(film._cc||D.cc||D.t.cc[0])},cancelled:()=>token!==R.token,shouldSkip:()=>R.skip,onFrame:(_candidate,index)=>{if(token===R.token)$("cl-fc").textContent=uiText("Кадр {current} / {total}", {current: p2(index+1), total: p2(total)});}});
    if(token!==R.token)return;
    snd(()=>stopFilmReelSound());if(!landed)return;const all=D.all.filter(inCc),k=all.findIndex(f=>f.id===film.id);$("cl-fc").textContent=uiText("Фильм {current} / {total}", {current: p2((k<0?0:k)+1), total: p2(all.length||total)});snd(()=>buzz([25,50,60]));finishPick(film,token);return;
  }
  if(window.KGCinemaReel?.isCassetteMode?.()){
    const eligible=D.all.filter(inCc);$("cl-fc").textContent=uiText("Кассета перематывается…");snd(()=>startFilmReelSound());
    const landed=await window.KGCinemaReel.spinCassetteDeck($("cl-reel"),eligible,seq,film,{cancelled:()=>token!==R.token,shouldSkip:()=>R.skip,onOpen:f=>D.t.series?window.KGSeriesHub.openSeries(f,document.activeElement):openFilm(f,"roulette"),onFrame:(_f,index,total)=>{if(token===R.token)$("cl-fc").textContent=uiText("Фильм {current} / {total}", {current: p2(index+1), total: p2(total)});}});
    if(token!==R.token)return;
    snd(()=>stopFilmReelSound());if(!landed)return;const all=D.all.filter(inCc),k=all.findIndex(f=>f.id===film.id);$("cl-fc").textContent=uiText("Фильм {current} / {total}", {current: p2((k<0?0:k)+1), total: p2(all.length)});snd(()=>buzz([25,50,60]));finishPick(film,token);return;
  }
  if(window.KGCinemaReel?.isTicketMode?.()){
    const total=D.all.filter(inCc).length;$(`cl-fc`).textContent="Билеты перемешиваются…";
    snd(()=>startFilmReelSound());
    const landed=await window.KGCinemaReel.animateTicketDeck($("cl-reel"),seq,film,{duration:T,meta:{country:cname(film._cc||D.cc||D.t.cc[0])},cancelled:()=>token!==R.token,shouldSkip:()=>R.skip,onFrame:(_candidate,index,total)=>{if(token===R.token)$(`cl-fc`).textContent=`Билет ${p2(index+1)} / ${p2(total)}`;}});
    if(token!==R.token)return;
    snd(()=>stopFilmReelSound());if(!landed)return;
    const all=D.all.filter(inCc),k=all.findIndex(f=>f.id===film.id);$("cl-fc").textContent=`Билет ${p2((k<0?0:k)+1)} / ${p2(all.length||total)}`;
    snd(()=>buzz([25,50,60]));finishPick(film,token);return;
  }
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
    if(token!==R.token)return;
    const t=R.skip?1:Math.min(1,(now-t0)/T);
    const x=x0+(x1-x0)*window.KGCinemaReel.searchReelProgress(t);
    run.style.transform=`translateX(${-x}px)`;
    if(t>.4)run.classList.remove("fast");
    if(t<1){
      snd(()=>setFilmReelLevel(window.KGCinemaReel.searchReelSpeed(t),Math.abs(x-x0)/STEP));
      R.raf=requestAnimationFrame(step);return;
    }
    snd(()=>stopFilmReelSound());
    run.style.transform=`translateX(${-rX(NEED)}px)`;
    [...run.children].forEach((c,i)=>{c.classList.remove("spin");c.classList.toggle("chosen",i===NEED);});
    const fr=$("cl-frame");fr.classList.remove("hit");void fr.offsetWidth;fr.classList.add("hit");
    const all=D.all.filter(inCc),k=all.findIndex(f=>f.id===film.id);
    $("cl-fc").textContent=uiText("Кадр {current} / {total}", {current: p2((k<0?0:k)+1), total: p2(all.length)});
    snd(()=>buzz([25,50,60]));
    finishPick(film,token);
  };
  R.raf=requestAnimationFrame(step);
}
window.addEventListener("resize",()=>{
  const run=document.querySelector("#cl-track .kgr-run");if(!run||R.busy)return;
  const i=[...run.children].findIndex(c=>c.classList.contains("chosen"));
  if(i>=0)run.style.transform=`translateX(${-rX(i)}px)`;
});
vd.addEventListener("keydown",event=>{
  if ((event.key==="Enter" || event.key===" ") && event.target.matches('[role="button"][data-act="open"]')) {
    event.preventDefault();
    event.target.click();
  }
});
vd.addEventListener("click",e=>{
  const sort=e.target.closest("[data-kg-film-sort]");
  if(sort){
    if(D.sort===sort.dataset.kgFilmSort)return;
    D.sort=sort.dataset.kgFilmSort;
    syncCollectionSort(vd,"data-kg-film-sort",D.sort);
    renderFilms();
    return;
  }
  const layout=e.target.closest('[data-kg-layout="collection"]');
  if(layout){
    if(collectionFilmLayout===layout.dataset.mode)return;
    collectionFilmLayout=layout.dataset.mode;
    if(D.selected?._placement==="list") closeInlineFilm(D.selected,false);
    renderFilms();
    vd.querySelector(`[data-kg-layout="collection"][data-mode="${collectionFilmLayout}"]`)?.focus({preventScroll:true});
    return;
  }
  const el=e.target.closest("[data-act]");if(!el)return;
  const a=el.dataset.act;
  if(a==="retry"){openCollection(D.t.id,{returning:true,retry:true});return;}
  if(a==="close-film"){closeInlineFilm();return;}
  if(a==="back"){e.preventDefault();showView(D.t.series?"series-collections":"collections");return;}
  if(a==="goto"){e.preventDefault();openCollection(el.dataset.t,{series:D.t.series===true});return;}
  if(a==="spin"){inPageRoulette();return;}
  if(a==="skip"){R.skip=true;return;}
  if(a==="cc"){
    if (D.cc === el.dataset.cc) return;
    D.cc = el.dataset.cc;
    D.shown = 5;
    D.selected = null;
    D.picked = null;
    rStop();
    $("cl-reel").style.display = "none";
    $("cl-reel-host").replaceChildren();
    $("cl-result").replaceChildren();
    vd.querySelectorAll("#cl-cc [data-act=cc]").forEach(b=>b.className=ccCls(b===el));
    renderFilms();return;
  }
  if(a==="more"){showMoreCollection();return;}
  const f=byId(el.dataset.id);if(!f)return;
  if(a==="trailer"){e.stopPropagation();openFilm(f);return;}
  if(a==="open"){
    if(D.t.series)window.KGSeriesHub.openSeries(f,el);
    else openFilm(f,"list",null,{opener:el});
  }
});

// старая кнопка «Подборки» из bridge v6 теперь ведёт в каталог
document.querySelectorAll('[data-path="podborki-i-zhanry"]').forEach(a=>a.addEventListener("click",e=>{e.preventDefault();showView("collections");}));
// «Тематические коллекции» убраны с главного экрана: подборки теперь только в разделе «Подборки»
const themeAcc=[...document.querySelectorAll("details")].find(d=>{const m=d.querySelector("summary");return m&&m.textContent.includes(uiText("Тематические коллекции"));})||document.querySelectorAll("details")[2];
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
const homeEditorial={films:[],alternatives:new Map(),details:new Set(),directorData:new Map(),loadedKey:"",token:0,loading:false,pending:null,observer:null,scrollAnchorId:null};
const homePosterWarmCache=new Set();
const homeEditorialRoot=$("kg-home-editorial");
function uniqueHomeFilms(candidatesByCountry){
  const seen=new Set();
  const films=[];
  for(const cc of HOME_EUROPE){
    const film=(Array.isArray(candidatesByCountry.get(cc))?candidatesByCountry.get(cc):[]).find(f=>f?.id!=null&&!seen.has(String(f.id))&&movieCatalog.allows(f));
    if(!film)continue;
    seen.add(String(film.id));
    films.push({...film,_cc:cc});
  }
  return films;
}
function homePaletteFilms(films,featured,alternatives){
  const used=new Set(films.map(f=>String(f.id)));
  return films.flatMap(f=>{
    if(String(f.id)!==String(featured.id))return [f];
    const replacement=(Array.isArray(alternatives.get(f._cc))?alternatives.get(f._cc):[]).find(x=>x?.id!=null&&!used.has(String(x.id))&&movieCatalog.allows(x));
    return replacement?[{...replacement,_cc:f._cc}]:[];
  });
}
function currentHomePalette(){
  const films=homeEditorial.films;
  return films.length?homePaletteFilms(films,films[(homeDayNumber()-1)%films.length],homeEditorial.alternatives):[];
}
function findHomeFilm(id){
  return [...homeEditorial.films,...currentHomePalette()].find(f=>String(f.id)===String(id));
}
function homeFilmYear(f){return (f.release_date||"").slice(0,4);}
function homeFeatureMarkup(f,d,expandedFilm=null){
  const title=esc(d?.title||f.title||f.original_title||uiText("Фильм"));
  const year=homeFilmYear(f);
  const rating=Number(f.vote_average)||0;
  const synopsis=(d&&d.overview)||filmSynopsis(f.overview)||uiText("Описание пока недоступно.");
  const poster=filmPosterMarkup({...f, title:d?.title || f.title, localizedPoster:d?.localizedPoster});
  const isExpanded=expandedFilm&&String(expandedFilm.id)===String(f.id);
  const label = `<p class="font-micro-caption text-micro-caption uppercase tracking-wider text-primary font-bold mb-2">${uiText("Выбор дня · Программа № {number}", {number: homeDayNumber()})}</p>`;
  if (isExpanded) return label + selectedFilmHtml(expandedFilm);
  return `${label}
<div class="relative flex gap-3.5 items-start">
<div class="kg-day-poster relative shrink-0 rounded-lg overflow-hidden shadow-md bg-surface-container-lowest">${poster}<span class="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-surface-container-lowest/90 text-primary-container font-label-sm text-label-sm font-bold shadow">★ ${rating.toFixed(1)}</span></div>
<div class="min-w-0 flex-1">
<h3 class="font-headline-sm text-headline-sm text-on-surface font-bold leading-snug">${title}</h3>
${year?`<p class="font-body-sm text-body-sm text-on-surface-variant mt-0.5">${year}</p>`:""}
<p class="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mt-2 kg-clip3">${esc(synopsis)}</p>
</div>
<button type="button" data-home-act="open" data-id="${f.id}" aria-expanded="${Boolean(isExpanded)}" aria-label="${isExpanded?uiText("Свернуть карточку"):esc(uiText("Открыть фильм {title}", {title:d?.title||f.title||f.original_title||uiText("Фильм")}))}" class="absolute inset-0 z-[1] flex justify-end items-end rounded-lg cursor-pointer text-primary"><span class="material-symbols-outlined" aria-hidden="true">${isExpanded?"expand_less":"expand_more"}</span></button>
</div>`;
}
function renderHomeFeature(film,details,selected){
  const feature=$("kg-home-feature");
  const mounted = selected && feature.querySelector(`[data-selected-film="${selected.id}"]`);
  if(mounted){window.KGFilmCard.update(mounted,selected);return;}
  feature.innerHTML=homeFeatureMarkup(film,details,selected);
  if(selected)paintWatchedButtons(feature);
}
function closeHomeFeature(){
  if(D.selected?._placement==="home") closeInlineFilm();
}
function homeDayNumber(){
  const now=new Date();
  return Math.floor((Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate())-Date.UTC(now.getUTCFullYear(),0,0))/86400000);
}
function homeFilmCard(f){
  const title=esc(f.title||f.original_title||uiText("Фильм")),year=homeFilmYear(f);
  const details=homeEditorial.directorData.get(f.id);
  const credit=details&&details.dirs&&details.dirs.length?details.dirs[0]:cname(f._cc);
  const poster=f.poster_path?`<img class="w-full h-full object-cover" src="${P(f.poster_path,"w342")}" alt="${uiText("Постер фильма «{title}»", {title})}" loading="lazy">`:'<span class="material-symbols-outlined text-primary-container text-[32px]">movie</span>';
  return `<div class="relative kg-home-film-wrap"><button type="button" data-home-act="open" data-home-meta="${f.id}" data-id="${f.id}" class="block w-full min-w-0 text-left">
<span class="kg-home-film-poster rounded-xl mb-1.5 bg-surface-container-lowest">${poster}<span class="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-surface-container-lowest/90 font-micro-caption text-micro-caption text-primary-container font-bold">★ ${(Number(f.vote_average)||0).toFixed(1)}</span></span>
<span class="font-label-sm text-label-sm font-bold text-on-surface block truncate">${title}</span>
<span class="font-micro-caption text-micro-caption text-on-surface-variant block truncate" data-home-director="${f.id}">${esc(credit)}${year?" · "+year:""}</span></button></div>`;
}
function warmHomePosters(films){
  const connection=navigator.connection;
  if(!Array.isArray(films)||!films.length||!navigator.onLine||connection?.saveData||/^(slow-)?2g$/.test(connection?.effectiveType||""))return;
  const queue=films.slice(0,2).filter(f=>f.poster_path&&!homePosterWarmCache.has(f.poster_path));
  if(!queue.length)return;
  const warm=()=>queue.forEach(f=>{
    homePosterWarmCache.add(f.poster_path);
    const image=new Image();image.decoding="async";
    if("fetchPriority" in image)image.fetchPriority="low";
    image.src=P(f.poster_path,"w342");
  });
  if("requestIdleCallback" in window)window.requestIdleCallback(warm,{timeout:1400});
  else window.setTimeout(warm,650);
}
function renderHomeEditorial(){
  if(!homeEditorialRoot)return;
  const carousel=$("kg-home-europe");
  const scrollLeft=carousel.scrollLeft,anchor=homeEditorial.scrollAnchorId&&carousel.querySelector(`[data-home-meta="${homeEditorial.scrollAnchorId}"]`),anchorTop=anchor?anchor.getBoundingClientRect().top:null;
  const films=homeEditorial.films;
  if(!films.length)return;
  const dayIndex=(homeDayNumber()-1)%films.length,featured=films[dayIndex];
  const selected=D.selected&&D.selected._placement==="home"&&String(D.selected.id)===String(featured.id)?D.selected:null;
  renderHomeFeature(featured,homeEditorial.featureDetails||null,selected);
  const palette=currentHomePalette();
  carousel.innerHTML=palette.map(homeFilmCard).join("");
  warmHomePosters(palette);
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
    trailerFor(featured).catch(()=>{});
    filmDetails(featured.id).then(d=>{
      if(!homeEditorial.films.length||homeEditorial.films[dayIndex]?.id!==featured.id)return;
      homeEditorial.featureDetails=d;homeEditorial.directorData.set(featured.id,d);
      const selected=D.selected&&D.selected._placement==="home"&&String(D.selected.id)===String(featured.id)?D.selected:null;
      renderHomeFeature(featured,d,selected);
      const credit=document.querySelector(`[data-home-director="${featured.id}"]`);
      if(credit&&d.dirs.length)credit.innerHTML=[d.dirsFull&&d.dirsFull[0]?kgPersonLink(d.dirsFull[0],"Режиссёр"):esc(d.dirs[0]),homeFilmYear(featured)].filter(Boolean).join(" · ");
    }).catch(e=>{homeEditorial.details.delete(featured.id);console.warn("[Moven] Не удалось загрузить данные фильма дня:",e);});
  }
}
async function loadHomeDirector(id){
  if(homeEditorial.details.has(Number(id)))return;
  homeEditorial.details.add(Number(id));
  const f=findHomeFilm(id);
  if(!f)return;
  try{
    const d=await filmDetails(f.id),target=document.querySelector(`[data-home-director="${f.id}"]`);
    homeEditorial.directorData.set(f.id,d);
    if(target)target.innerHTML=[d.dirsFull&&d.dirsFull[0]?kgPersonLink(d.dirsFull[0],"Режиссёр"):esc(d.dirs[0]||cname(f._cc)),homeFilmYear(f)].filter(Boolean).join(" · ");
    const featureIndex=(homeDayNumber()-1)%homeEditorial.films.length;
    if(homeEditorial.films[featureIndex]?.id===f.id){
      homeEditorial.featureDetails=d;
      const selected=D.selected&&D.selected._placement==="home"&&String(D.selected.id)===String(f.id)?D.selected:null;
      renderHomeFeature(f,d,selected);
    }
  }catch(e){
    homeEditorial.details.delete(f.id);
    const featureIndex=(homeDayNumber()-1)%homeEditorial.films.length;
    if(homeEditorial.films[featureIndex]?.id===f.id){
      const emptyDetails={dirs:[],genres:[],companies:[],runtime:0,tagline:"",overview:""};
      homeEditorial.featureDetails=emptyDetails;
      const selected=D.selected&&D.selected._placement==="home"&&String(D.selected.id)===String(f.id)?D.selected:null;
      renderHomeFeature(f,emptyDetails,selected);
    }
    console.warn("[Moven] Не удалось загрузить режиссёра:",e);
  }
}
function renderHomeEditorialMessage(message,action){
  $("kg-home-feature").innerHTML=`<p class="font-micro-caption text-micro-caption text-primary font-bold uppercase tracking-wider">${uiText("Выбор дня")}</p><p role="status" class="font-body-sm text-body-sm text-text-muted mt-2">${esc(uiText(message))}</p>${action?`<button type="button" data-home-act="${action}" class="mt-3 px-3 py-2 rounded-lg bg-surface-container-highest text-primary-container font-label-sm text-label-sm font-semibold">${uiText(action==="set-key"?"Добавить ключ TMDB":"Повторить загрузку")}</button>`:""}`;
  $("kg-home-europe").innerHTML=`<p class="font-body-sm text-body-sm text-text-muted py-2">${uiText("Фильмы появятся после загрузки данных.")}</p>`;
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
      return films;
    }));
    if(token!==homeEditorial.token)return false;
    results.forEach((result,i)=>{if(result.status==="rejected")console.warn(`[Moven] Не удалось загрузить фильмы ${HOME_EUROPE[i]}:`,result.reason);});
    const succeeded=results.some(result=>result.status==="fulfilled");
    const byCountry=new Map();
    results.forEach((result,i)=>{
      if(result.status==="fulfilled"){byCountry.set(HOME_EUROPE[i],result.value);}
      else if(oldByCountry.has(HOME_EUROPE[i]))byCountry.set(HOME_EUROPE[i],[oldByCountry.get(HOME_EUROPE[i])]);
    });
    const films=uniqueHomeFilms(byCountry);
    if(!succeeded||!films.length){
      const error=results.find(result=>result.status==="rejected");
      if(!homeEditorial.films.length)renderHomeEditorialMessage(error&&error.reason&&error.reason.message||"Не удалось загрузить европейские фильмы.","retry");
      return false;
    }
    homeEditorial.films=films;
    homeEditorial.alternatives=byCountry;
    homeEditorial.loadedKey=apiKey;
    homeEditorial.details.clear();homeEditorial.directorData.clear();homeEditorial.featureDetails=null;
    store.set("kgHomeEditorial",{films,alternatives:[...byCountry],language:filmLanguage,ts:Date.now()});
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
    if(detailAction.dataset.act==="close-film") closeInlineFilm();
    return;
  }
  if(e.target.closest("[data-trailer-action]"))return;
  const button=e.target.closest("[data-home-act]");
  if(!button)return;
  e.stopPropagation();
  const action=button.dataset.homeAct;
  if(action==="set-key"){
    const banner=$("tmdb-key-banner");banner.classList.remove("hidden");banner.scrollIntoView({behavior:"smooth",block:"center"});$("tmdb-key-input").focus();return;
  }
  if(action==="retry"){homeEditorial.loadedKey="";loadHomeEditorial();return;}
  const film=findHomeFilm(button.dataset.id);
  if(!film)return;
  if(action==="open"){
    if(button.dataset.homeMeta){homeEditorial.scrollAnchorId=String(film.id);openFilm(film,"home-europe",null,{opener:button});}
    else if(D.selected?._placement==="home"&&String(D.selected.id)===String(film.id))closeHomeFeature();
    else openFilm(film,"home",null,{opener:button});
    return;
  }
  if(action==="trailer"){
    openFilm(film,"home");
    return;
  }
  if(action==="share"){
    try{
      const info={title:film.title||film.original_title||"Фильм",text:"Посмотри этот фильм в Moven",url:`https://www.themoviedb.org/movie/${film.id}`};
      if(navigator.share)await navigator.share(info);
      else if(navigator.clipboard&&navigator.clipboard.writeText){await navigator.clipboard.writeText(info.url);toast("Ссылка скопирована","link");}
      else throw new Error("Поделиться из этого браузера не удалось.");
    }catch(error){
      if(error.name!=="AbortError"){console.error("[Moven] Не удалось поделиться фильмом:",error);toast("Не удалось поделиться фильмом","share");}
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
  const results=await settleWithLimit(catalogThemes,4,async t=>{
    if (t.films) return themeDataCache.get(themeDataKey(t,2))?.data || curatedData(t.films.map(localizeFilmListItem));
    const cached=themeDataCache.get(themeDataKey(t,2));
    if(!forceAll&&cached&&cached.date===localDateKey()&&Date.now()-cached.ts<DAY_MS)return cached.data;
    const data=await loadTheme(t,2,true);
    if(data._stale||data._partial)throw new Error("Сохранённые данные подборки не удалось обновить.");
    const firstPage=themeDataCache.get(themeDataKey(t,1))?.data;
    if(firstPage){saveThemeMeta(t,firstPage);if(catBuilt)paintMeta(t.id);}
    return data;
  });
  sortCatalog();
  const activeIndex=view==="collection"&&D.t?catalogThemes.findIndex(t=>t.id===D.t.id):-1;
  if(activeIndex>=0){
    const result=results[activeIndex];
    if(result.status==="fulfilled"){
      const t=D.t,r=result.value;
      D.all=r.films;D.total=r.total;D.totals=r.totals;
      $("cl-count").textContent=collectionFilmCount(r.total);
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
    const results=await Promise.allSettled([
      loadHomeEditorial(true),
      refreshAllCollections(force)
    ]);
    if(results.every(r=>r.status==="fulfilled"&&r.value)){
      const now=Date.now();
      store.set("kgDailyRefreshAt",now);
      store.set("kgDailyRefreshDate",localDateKey());
      return true;
    }
    console.warn("[Moven] Ежедневное обновление выполнено частично; сохранённые данные оставлены.");
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
  if(view==="mood"||view==="series-mood"){vm.dataset.key="";showView(view);}
  if(view==="oscar"){vo.dataset.key="";showView("oscar");}
  if(view==="series-gold")window.KGSeriesGold.show();
  refreshDailyData(true,true);
};
$("tmdb-key-save").addEventListener("click",refreshForNewKey);
$("saveKey").addEventListener("click",()=>setTimeout(refreshForNewKey,0));

// Cached editorial data must never prevent the collections UI from starting.
try {
  const savedHome=store.get("kgHomeEditorial",null);
  if(savedHome&&(savedHome.language||"ru")===filmLanguage&&Array.isArray(savedHome.films)&&savedHome.films.length){
    homeEditorial.films=uniqueHomeFilms(new Map(savedHome.films.filter(f=>f&&HOME_EUROPE.includes(f._cc)).map(f=>[f._cc,[f]])));
    homeEditorial.alternatives=new Map(Array.isArray(savedHome.alternatives)?savedHome.alternatives.filter(e=>Array.isArray(e)&&HOME_EUROPE.includes(e[0])&&Array.isArray(e[1])):[]);
    homeEditorial.loadedKey=homeEditorial.films.length===savedHome.films.length&&homeEditorial.alternatives.size?apiKey:"";
    renderHomeEditorial();
  }
} catch(error) {
  console.warn("[Moven] Editorial cache recovery failed",error);
  homeEditorial.films=[];homeEditorial.alternatives=new Map();homeEditorial.loadedKey="";
}
if(dailyRefreshDue())refreshDailyData().catch(error=>console.warn("[Moven] Daily refresh failed",error));
else if(!homeEditorial.films.length||homeEditorial.loadedKey!==apiKey)loadHomeEditorial().catch(error=>console.warn("[Moven] Editorial refresh failed",error));
scheduleDailyRefresh();
/* TV collections share the catalog cards, layout controls and show details with Moven. */
const tvThemes=[
  ["kr", "Корейские криминальные сериалы", "80|9648"],
  ["krdrama", "Корейские дорамы", "18"],
  ["jp", "Японское аниме", "16"],
  ["cnfan", "Китайское фэнтези", "10765"],
  ["tr", "Турецкие драмы", "18"],
  ["nordic", "Скандинавский нуар", "80|9648"],
  ["gbdet", "Британские детективы", "80|9648"],
  ["frnoir", "Французский нуар", "80|9648"],
  ["itcrime", "Итальянский криминал", "80|9648"],
  ["esdrama", "Испанские драмы", "18"],
  ["dedrama", "Немецкие драматические сериалы", "18"],
  ["uscrime", "Американские криминальные сериалы", "80|9648"],
  ["usscifi", "Американская фантастика", "10765"],
  ["mxdrama", "Мексиканские драмы", "18"],
  ["uadrama", "Украинские драмы", "18"],
  ["pldrama", "Польские детективы", "80|9648", "noir"],
  ["latam", "Латиноамериканский нуар", "80|9648"],
  ["inact", "Индийские криминальные сериалы", "80|9648", "noir", {id:"tv-indian-crime"}],
  ["auhorror", "Австралийские детективы", "80|9648", "noir"],
  ["gbdrama", "Британские драмы", "18"],
  ["jpcrime", "Японские криминальные сериалы", "80|9648"],
  ["frcom", "Французские комедии", "35"],
  ["tr", "Турецкие мелодрамы", "10766|18|35", "drama", {id:"tv-tr-soap",seriesQueries:[
    {with_genres:"10766"},
    // Romance, love, love triangle, arranged marriage, soap opera, telenovela, romantic comedy, family drama and forbidden love.
    {with_genres:"18|35",without_genres:"10763,10764,10766,10767",with_keywords:"9840|9673|128|2692|291959|199262|389245|12279|3691"}
  ]}],
  ["gbdet", "Канадские детективы", "80|9648", "noir", {id:"tv-ca-mystery",cc:["CA"],cover:""}],
  ["brazil", "Бразильские криминальные сериалы", "80|9648", "noir"],
  ["thhorror", "Тайские драмы", "18", "drama", {id:"tv-th-drama",cover:""}],
  ["inromance", "Индийские драмы", "18", "drama"],
  ["jpauteur", "Японские драмы", "18"],
  ["esdrama", "Испанские криминальные сериалы", "80|9648", "noir", {id:"tv-es-crime"}],
  ["auhorror", "Австралийские драмы", "18", "drama", {id:"tv-au-drama",cover:""}],
  ["usanimation", "Американская анимация", "16"]
].map(([source,name,g,category,options])=>{
  const original=T[source];
  return {id:`tv-${source}`,name,g,cc:original.cc,region:options?.cc?.map(cname).join(", ")||where(original),category:CAT[category||cat(original)][0],series:true,...options,cover:`assets/covers/series/${options?.id||`tv-${source}`}.webp`};
});
let tvCountry="",tvQuery="",tvLayout="list",tvCatalogSort="rating";
const tvThemeFor=id=>tvThemes.find(theme=>theme.id===id);
const seriesCollectionCount=count=>uiText("Сериалов в подборке: {count}",{count:nf(count)});
function visibleTvThemes(){
  const query=tvQuery.trim().toLocaleLowerCase(interfaceLanguage);
  return tvThemes.filter(theme=>(!tvCountry||theme.cc.includes(tvCountry))&&
    [theme.name,theme.category,theme.region,...theme.cc.map(cname)].some(value=>uiText(value).toLocaleLowerCase(interfaceLanguage).includes(query)));
}

function sortTvCatalog(){
  const grid=seriesCollections.querySelector("[data-tv-grid]");
  if(grid)orderCatalogCards(grid,tvCatalogSort,id=>META[id],tvThemeFor,(a,b)=>a.dataset.i-b.dataset.i);
}

function renderTvCatalogCards(){
  const results=visibleTvThemes();
  const list=seriesCollections.querySelector("[data-tv-grid]");
  list.className=tvLayout==="grid"?"kg-three-columns":"kg-catalog-list";
  list.innerHTML=results.map(cardHtml).join("");
  [...list.children].forEach((card,index)=>paintCatalogCard(card,results[index],META[results[index].id]));
  sortTvCatalog();
  seriesCollections.querySelector("[data-tv-count]").textContent=results.length?uiText("{count} доступно",{count:results.length}):uiText("Подборка не найдена");
  seriesCollections.querySelector("[data-tv-spot]").hidden=!!(tvCountry||tvQuery.trim());
  seriesCollections.querySelector('[data-act="clear"]').style.display=tvQuery?"flex":"none";
  seriesCollections.querySelector('[data-act="random"]').disabled=!results.length;
}

function renderTvCatalog(){
  const featured=tvThemes[Math.floor(Date.now()/6048e5)%tvThemes.length];
  seriesCollections.innerHTML=`
    <section class="flex flex-col gap-space-xs mt-1">
      <h2 class="font-headline-lg text-headline-lg text-primary tracking-tight">${uiText("Тематические коллекции сериалов")}</h2>
      <p class="font-body-sm text-body-sm text-text-muted leading-relaxed">${uiText("Выберите страну, чтобы найти сериалы по жанрам и познакомиться с её телевидением.")}</p>
<div class="relative w-full mt-2"><div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted"><span class="material-symbols-outlined text-[20px]">search</span></div>
<input data-tv-query type="search" aria-label="${uiText("Поиск по подборкам")}" enterkeyhint="search" autocomplete="off" placeholder="${uiText("Найти подборку, страну или жанр...")}" class="w-full h-12 pl-11 pr-12 rounded-xl bg-surface-container-low text-on-surface placeholder:text-text-muted font-body-sm text-body-sm focus:outline-none focus:bg-surface-container transition-all shadow-[0_4px_16px_rgb(var(--kg-black)/0.4)]">
<button type="button" data-act="clear" aria-label="${uiText("Сбросить поиск")}" style="display:none" class="absolute inset-y-0 right-0 w-12 items-center justify-center text-text-muted hover:text-primary"><span class="material-symbols-outlined text-[18px]" aria-hidden="true">cancel</span></button></div>
    </section>
    <section class="flex gap-2 overflow-x-auto pb-1 -mx-gutter-mobile px-gutter-mobile" aria-label="${uiText("Все страны")}">
      ${["",...new Set(tvThemes.flatMap(theme=>theme.cc))].map(cc=>`<button type="button" data-tv-country="${cc}" aria-pressed="${tvCountry===cc}" class="${chipCls(tvCountry===cc)}">${cc?`${fl(cc)} ${esc(cname(cc))}`:uiText("Все {count}",{count:tvThemes.length})}</button>`).join("")}
    </section>
    ${spotlightHtml(featured)}
    ${catalogSortControl(true,tvCatalogSort)}
    <div class="flex items-center justify-between gap-2"><p data-tv-count role="status" class="font-label-sm text-label-sm text-text-muted"></p>${layoutSwitch(tvLayout,"tv-catalog")}</div>
    <section data-tv-grid></section>`;
  seriesCollections.querySelector("[data-tv-query]").value=tvQuery;
  renderTvCatalogCards();
  if(apiKey)settleWithLimit(tvThemes,3,async theme=>{
    const meta=await loadMeta(theme);
    sortTvCatalog();
    const card=seriesCollections.querySelector(`[data-tv-grid] .collection-card[data-t="${theme.id}"]`);
    if(card)paintCatalogCard(card,theme,meta,true);
    const spotlight=seriesCollections.querySelector("[data-tv-spot]");
    if(spotlight&&theme===featured)paintCatalogSpot(spotlight,theme,meta);
  });
}

seriesCollections.addEventListener("input",event=>{
  if(!event.target.matches("[data-tv-query]"))return;
  tvQuery=event.target.value;
  renderTvCatalogCards();
});
seriesCollections.addEventListener("click",event=>{
  const button=event.target.closest("button,[data-act='open'],[data-t]");
  if(!button)return;
  const {tvCountry:country,kgLayout:layout,mode,act,catalogSort:sort}=button.dataset;
  if(sort){tvCatalogSort=sort;syncCollectionSort(seriesCollections,"data-catalog-sort",sort);sortTvCatalog();}
  else if(act==="random"){
    highlightRandomCollection([...seriesCollections.querySelectorAll("[data-tv-grid] .collection-card")],tvThemeFor);
  }else if(country!==undefined){
    tvCountry=country;
    seriesCollections.querySelectorAll("[data-tv-country]").forEach(chip=>{
      const active=chip.dataset.tvCountry===country;
      chip.className=chipCls(active);chip.setAttribute("aria-pressed",String(active));
    });
    renderTvCatalogCards();
  }else if(layout==="tv-catalog"){
    tvLayout=mode;syncLayout(seriesCollections,mode,layout);renderTvCatalogCards();
  }else if(act==="clear"){
    const input=seriesCollections.querySelector("[data-tv-query]");
    input.value="";tvQuery="";renderTvCatalogCards();input.focus();
  }else{
    const theme=button.closest("[data-t]");
    if(!theme)return;
    if(act==="spin")audio();
    openCollection(theme.dataset.t,{series:true,spin:act==="spin"});
  }
});
seriesCollections.addEventListener("keydown",event=>{
  if(event.isComposing||event.keyCode===229)return;
  if(event.target.matches("[data-tv-query]")){
    if(event.key==="Escape"&&event.target.value){
      event.preventDefault();seriesCollections.querySelector('[data-act="clear"]').click();
    }
    if(event.key==="Enter"){
      const first=seriesCollections.querySelector("[data-tv-grid] h4 button");
      if(first){event.preventDefault();first.click();}
    }
  }else if(["Enter"," "].includes(event.key)&&event.target.matches("[data-tv-spot]")){
    event.preventDefault();event.target.click();
  }
});

showView("home");
window.MOVEN_THEME_COVERS = THEME_COVERS;
console.info("[Moven] v8 collections ready + theme covers");
})();
