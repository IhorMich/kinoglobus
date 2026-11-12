// KinoGlobus settings, adapted from the Stitch settings screen.
(function () {
  const dialog = document.getElementById("settings");
  if (!dialog) return;
  const soundSelect = document.getElementById("snd");
  const appNav = document.querySelector('body > nav [data-view="home"]')?.closest("nav");
  dialog.className = "kgs-dialog text-on-surface";
  dialog.setAttribute("aria-labelledby", "kgs-title");
  dialog.innerHTML = `
<header class="w-full bg-surface-panel/85 shadow-[0_4px_24px_rgba(7,6,10,0.85)] border-b border-surface-border-subtle px-4 pt-3 pb-3 transition-colors duration-300" data-purpose="top-navigation">
<div class="flex items-center justify-between">
<button aria-label="Назад" data-kgs-close autofocus class="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container border border-surface-border-subtle active:scale-95 transition-all text-on-surface-variant hover:text-primary-container hover:border-primary-container/40" type="button">
<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
<path clip-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" fill-rule="evenodd"></path>
</svg>
</button>
<div class="text-center flex-1 px-3">
<div class="font-headline-sm text-base text-primary font-semibold leading-tight">
          Настройки приложения
        </div>
<p class="text-[11px] text-text-muted font-medium tracking-tight">Настройки КиноГлобуса</p>
</div>
<div class="flex items-center gap-2">
<div class="px-2.5 py-1 rounded-full bg-gradient-to-r from-primary-fixed-dim/20 to-primary-container/10 border border-primary-container/40 kgs-gold-shadow flex items-center gap-1">
<span class="text-[10px] font-headline-sm font-bold text-primary-container tracking-wider">✦ VIP</span>
</div>
<div class="w-7 h-7 rounded-full bg-surface-container border border-primary-container/30 flex items-center justify-center">
<div class="w-2.5 h-2.5 rounded-full bg-primary-container kgs-gold-shadow"></div>
</div>
</div>
</div>
</header>
<div class="kgs-scroll px-4 pt-4 space-y-6">
<section class="space-y-3" data-purpose="core-configuration">
<div class="flex items-center justify-between px-1">
<span class="text-[11px] font-bold tracking-widest text-primary-container uppercase font-micro-caption">
          КОНФИГУРАЦИЯ ЯДРА • V2.4.2 PRODUCTION
        </span>
</div>
<div class="space-y-1 px-1">
<h1 id="kgs-title" class="font-display-hero-mobile text-display-hero-mobile text-primary">Настройки приложения</h1>
<p class="text-xs text-text-muted font-light">КиноГлобус v2.4.2 · Движок кинематографической рулетки</p>
</div>
<div class="relative overflow-hidden rounded-2xl bg-gradient-to-b from-surface-container-high to-surface-panel border border-primary-container/25 p-[18px] shadow-xl transition-colors duration-300">
<div class="theme-ambient-light absolute -right-12 -top-12 w-32 h-32 bg-primary-container/5 rounded-full blur-2xl pointer-events-none"></div>
<div class="flex items-start gap-3.5">
<div class="w-11 h-11 rounded-xl bg-primary-container/10 border border-primary-container/30 flex items-center justify-center shrink-0 shadow-inner">
<span class="text-primary-container text-lg">▣</span>
</div>
<div class="space-y-1">
<div class="flex items-center gap-2">
<h2 class="font-headline-sm text-headline-sm text-primary">Кино-аккаунт синефила</h2>
<span class="px-1.5 py-0.5 rounded text-[9px] font-micro-caption font-bold bg-surface-container-high text-on-surface-variant border border-surface-border-subtle">SYNC · Скоро</span>
</div>
<p class="text-xs text-text-muted leading-snug">
              Формы регистрации и входа готовы. Авторизация и синхронизация — скоро.
            </p>
</div>
</div>
<div class="grid grid-cols-2 gap-2.5 mt-4">
<button class="py-2.5 px-3 rounded-xl bg-gradient-to-r from-primary-container to-primary-fixed-dim hover:from-primary hover:to-primary-container text-on-primary-fixed font-semibold text-xs tracking-wide kgs-gold-shadow active:scale-[0.98] transition-all flex items-center justify-center gap-1.5" type="button" data-kgs-auth-open="register">
<span>⚠</span>
<span>Регистрация</span>
</button>
<button class="py-2.5 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high border border-surface-border-subtle text-on-surface font-medium text-xs tracking-wide active:scale-[0.98] transition-all flex items-center justify-center gap-1.5" type="button" data-kgs-auth-open="login">
<span>→|</span>
<span>Войти</span>
</button>
</div>
</div>
<div class="grid grid-cols-2 gap-2.5">
<div class="rounded-xl bg-surface-panel border border-surface-border-subtle p-3 flex flex-col justify-center transition-colors duration-300">
<span class="text-[10px] text-text-muted font-micro-caption flex items-center gap-1.5">
<span class="text-text-muted">◉</span> TMDB v3
          </span>
<span class="text-xs font-semibold items-center gap-1.5 mt-0.5 kgs-key-status" data-kgs-status></span>
</div>
<div class="rounded-xl bg-surface-panel border border-surface-border-subtle p-3 flex flex-col justify-center transition-colors duration-300">
<span class="text-[10px] text-text-muted font-micro-caption flex items-center gap-1.5">
<span class="text-text-muted">■</span> Архив открытий
          </span>
<span class="text-xs font-semibold text-primary-container mt-0.5" data-kgs-count>
            1 / 104 стран
          </span>
</div>
</div>
</section>
<section class="rounded-2xl bg-surface-panel border border-surface-border-subtle p-4 space-y-4 transition-colors duration-300" data-purpose="language-and-regional-standards">
<div class="flex items-center justify-between">
<div class="flex items-center gap-2">
<span class="text-primary-container text-sm">文</span>
<h2 class="font-headline-sm text-headline-sm text-primary">Язык и региональные стандарты</h2>
</div>
<span class="text-[10px] uppercase font-micro-caption px-2 py-0.5 rounded-full bg-surface-container text-text-muted border border-surface-border-subtle">Скоро</span>
</div>
<div class="space-y-1.5">
<label for="kgs-language" class="text-[10px] font-bold uppercase tracking-wider text-text-muted font-micro-caption">ЯЗЫК ИНТЕРФЕЙСА</label>
<select id="kgs-language" class="kgs-select bg-surface-container-lowest border-surface-border-subtle w-full rounded-xl px-3.5 py-2.5 text-xs text-on-surface font-medium" disabled>
<option>Русский (Russian)</option>
</select>
</div>
<p class="text-[10px] text-text-muted font-micro-caption leading-relaxed uppercase">
        НАСТРОЙКИ ЯЗЫКА ОРИГИНАЛА, РЕГИОНА И СУБТИТРОВ БУДУТ ДОСТУПНЫ ПОЗЖЕ.
      </p>
<div class="space-y-2 pt-1 border-t border-surface-border-subtle">
<div class="flex items-center justify-between py-1.5">
<span class="text-xs font-medium text-primary-container uppercase tracking-tight font-micro-caption">ЯЗЫК НАЗВАНИЙ И СИНОПСИСОВ TMDB</span>
<span class="text-[9px] uppercase font-micro-caption px-1.5 py-0.5 rounded bg-surface-container text-text-muted border border-surface-border-subtle">СКОРО</span>
</div>
<div class="flex items-center justify-between py-1.5">
<span class="text-xs font-medium text-primary-container uppercase tracking-tight font-micro-caption">ЯЗЫК СУБТИТРОВ ТРЕЙЛЕРОВ</span>
<span class="text-[9px] uppercase font-micro-caption px-1.5 py-0.5 rounded bg-surface-container text-text-muted border border-surface-border-subtle">СКОРО</span>
</div>
</div>
</section>
<section class="rounded-2xl bg-surface-panel border border-primary-container/20 p-4 space-y-3.5 transition-colors duration-300" data-purpose="tmdb-integration">
<div class="flex items-center justify-between">
<div class="flex items-center gap-2">
<span class="text-primary-container text-sm">◉</span>
<h2 class="font-headline-sm text-headline-sm text-primary">Связь с фильмографией TMDB</h2>
</div>
<span class="text-[9px] font-micro-caption font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" data-kgs-api-badge>
          КЛЮЧ СОХРАНЁН
        </span>
</div>
<div class="space-y-1.5">
<div class="flex items-center justify-between text-[10px] font-micro-caption">
<span class="text-text-muted font-bold uppercase tracking-wider">BEARER TOKEN / V3 AUTH</span>
<span class="text-emerald-400 font-medium" data-kgs-lamp></span>
</div>
<div class="flex items-center gap-2">
<div class="relative flex-1">
<input class="w-full bg-surface-container-lowest border border-surface-border-subtle rounded-xl px-3.5 py-2.5 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container/50 pr-9" placeholder="Введите ключ TMDB" type="password" autocomplete="new-password" id="kgs-token" aria-label="Ключ TMDB"/>
<button aria-label="Показать введённый ключ" data-kgs-visibility class="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-on-surface" type="button">
<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
<path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
<path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
</svg>
</button>
</div>
<button class="px-3.5 py-2.5 rounded-xl bg-primary-container text-on-primary-fixed font-bold text-xs hover:bg-primary transition-colors kgs-gold-shadow" type="button" data-kgs-save>
            OK
          </button>
</div>
</div>
<p class="text-[10px] text-text-muted font-micro-caption leading-relaxed uppercase">
        API-КЛЮЧ TMDB НУЖЕН ДЛЯ ЗАГРУЗКИ ФИЛЬМОВ, ПОСТЕРОВ, ТРЕЙЛЕРОВ И МЕТАДАННЫХ СТРАН. КЛЮЧ НЕ ОТОБРАЖАЕТСЯ В ЭТОМ ПОЛЕ ПОСЛЕ СОХРАНЕНИЯ.
      </p>
<div class="grid grid-cols-2 gap-2.5 pt-1">
<button class="py-2.5 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high border border-surface-border-subtle text-xs font-semibold text-on-surface-variant transition-all" type="button" data-kgs-change>
          Изменить ключ
        </button>
<button class="py-2.5 px-3 rounded-xl bg-gradient-to-r from-primary-container to-primary-fixed-dim hover:from-primary hover:to-primary-container text-on-primary-fixed font-semibold text-xs tracking-wide kgs-gold-shadow transition-all" type="button" data-kgs-check>
          Проверить связь
        </button>
</div>
<p class="text-xs text-on-surface-variant empty:hidden" data-kgs-message aria-live="polite"></p>
</section>
<section class="rounded-2xl bg-surface-panel border border-surface-border-subtle p-4 space-y-4 transition-colors duration-300" data-purpose="theme-and-visual-style" >
<div class="flex items-center justify-between">
<div class="flex items-center gap-2">
<span class="text-primary-container text-sm">✦</span>
<h2 class="font-headline-sm text-headline-sm text-primary">Тема и визуальный стиль</h2>
</div>
<span class="text-[10px] uppercase font-micro-caption px-2 py-0.5 rounded-full bg-primary-container/10 text-primary-container border border-primary-container/30">3 темы</span>
</div>
<div class="grid grid-cols-3 gap-2">
<button class="theme-card theme-card-transition relative rounded-xl p-2.5 bg-gradient-to-b from-surface-container-high to-transparent border-2 border-primary-container flex flex-col items-center text-center justify-between min-h-[104px] kgs-gold-shadow active:scale-95 text-left w-full cursor-pointer focus:outline-none" type="button" disabled aria-label="Кинематографичная, текущий стиль">
<div class="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-primary-container text-on-primary-fixed flex items-center justify-center text-[9px] font-bold theme-check">✓</div>
<div class="text-primary-container mt-1 text-base">🎞</div>
<div class="w-full">
<div class="text-[10px] font-bold text-on-surface uppercase leading-tight font-headline-sm theme-title">КИНЕМАТОГРАФИЧНАЯ</div>
<div class="text-[8px] text-primary-container font-micro-caption mt-0.5 theme-sub font-semibold">ТЕКУЩИЙ СТИЛЬ</div>
</div>
</button>
<button class="theme-card theme-card-transition relative rounded-xl p-2.5 bg-surface-container-lowest border border-surface-border-subtle flex flex-col items-center text-center justify-between min-h-[104px] opacity-80 hover:opacity-100 active:scale-95 text-left w-full cursor-pointer focus:outline-none" type="button" disabled aria-disabled="true">
<div class="hidden absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-primary-container text-on-primary-fixed items-center justify-center text-[9px] font-bold theme-check">✓</div>
<div class="text-text-muted mt-1 text-base">■</div>
<div class="w-full">
<div class="text-[10px] font-semibold text-on-surface-variant uppercase leading-tight theme-title">OLED BLACK</div>
<div class="text-[8px] text-text-muted font-micro-caption mt-0.5 theme-sub">ГЛУБОКИЙ ЧЁРНЫЙ</div>
<span class="text-[7px] font-micro-caption px-1 py-0.2 rounded bg-surface-container text-primary-container/80 theme-tag">СКОРО</span>
</div>
</button>
<button class="theme-card theme-card-transition relative rounded-xl p-2.5 bg-surface-container border border-surface-border-subtle flex flex-col items-center text-center justify-between min-h-[104px] opacity-80 hover:opacity-100 active:scale-95 text-left w-full cursor-pointer focus:outline-none" type="button" disabled aria-disabled="true">
<div class="hidden absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-primary-container text-on-primary-fixed items-center justify-center text-[9px] font-bold theme-check">✓</div>
<div class="text-primary-container/80 mt-1 text-base">🏆</div>
<div class="w-full">
<div class="text-[10px] font-semibold text-on-surface-variant uppercase leading-tight theme-title">ЗОЛОТОЙ ВЕК</div>
<div class="text-[8px] text-text-muted font-micro-caption mt-0.5 theme-sub">КЛАССИЧЕСКИЙ ЗАЛ</div>
<span class="text-[7px] font-micro-caption px-1 py-0.2 rounded bg-surface-container text-primary-container/80 theme-tag">СКОРО</span>
</div>
</button>
</div>
<div class="pt-2 border-t border-surface-border-subtle flex items-center justify-between gap-3">
<div>
<div class="text-xs font-bold text-primary-container uppercase tracking-tight font-micro-caption">КИНЕМАТОГРАФИЧЕСКИЕ ПЕРЕХОДЫ</div>
<div class="text-[10px] text-text-muted font-micro-caption uppercase">ПЛАВНАЯ АНИМАЦИЯ ЭКРАНОВ И КАРТОЧЕК</div>
</div>
<span class="text-[9px] font-micro-caption font-bold px-2 py-0.5 rounded bg-surface-container-high text-primary-container border border-primary-container/30">
          АКТИВНО
        </span>
</div>
</section>
<section class="rounded-2xl bg-surface-panel border border-surface-border-subtle p-4 space-y-3.5 transition-colors duration-300" data-purpose="artifacts-and-markers">
<div class="flex items-center justify-between">
<div class="flex items-center gap-2">
<span class="text-primary-container text-sm">▥</span>
<h2 class="font-headline-sm text-headline-sm text-primary">Артефакты и маркеры рулетки</h2>
</div>
<span class="text-[10px] uppercase font-micro-caption px-2 py-0.5 rounded-full bg-surface-container text-text-muted border border-surface-border-subtle">смена плёнки</span>
</div>
<p class="text-[10px] text-text-muted font-micro-caption leading-relaxed uppercase">
        ВЫБЕРИТЕ ВИЗУАЛЬНЫЙ СТИЛЬ РУЛЕТКИ И НАСТРОЙТЕ ПОКАЗ КИНОЛЕНТЫ.
      </p>
<div class="space-y-2" role="radiogroup" aria-label="Вид рулетки">
<button type="button" role="radio" data-kgs-reel-style="35mm" aria-checked="false" class="kgs-reel-choice bg-surface-container-low w-full flex items-center justify-between gap-3 p-3 rounded-xl border border-surface-border-subtle text-left">
<div class="flex items-center gap-3 min-w-0">
<span aria-hidden="true" class="text-base">🎞</span>
<div class="min-w-0">
<div class="kgs-reel-title text-xs font-medium text-on-surface-variant uppercase">35мм киноплёнка</div>
<div class="text-[10px] text-text-muted font-micro-caption uppercase">Привычная лента постеров в рамке</div>
</div>
</div>
<span aria-hidden="true" class="kgs-reel-radio w-4 h-4 rounded-full border border-outline shrink-0"></span>
</button>
<div class="flex items-center justify-between gap-2 p-3 rounded-xl bg-surface-container border border-surface-border-subtle">
<div class="flex items-center gap-3 min-w-0"><span aria-hidden="true" class="text-base">📽</span><div><div class="text-xs font-medium text-on-surface-variant uppercase">70 мм IMAX формат</div><div class="text-[10px] text-text-muted font-micro-caption uppercase">Масштабный кадр высокой чёткости</div></div></div>
<span class="text-[9px] uppercase font-micro-caption px-1.5 py-0.5 rounded bg-surface-container text-text-muted">Скоро</span>
</div>
<button type="button" role="radio" data-kgs-reel-style="projection" aria-checked="false" class="kgs-reel-choice bg-surface-container-low w-full flex items-center justify-between gap-3 p-3 rounded-xl border border-surface-border-subtle text-left">
<div class="flex items-center gap-3 min-w-0">
<span aria-hidden="true" class="text-base">📼</span>
<div class="min-w-0">
<div class="kgs-reel-title text-xs font-medium text-on-surface-variant uppercase">Проекционный тракт 35 мм</div>
<div class="text-[10px] text-text-muted font-micro-caption uppercase">Механический шаг кадра с артефактами</div>
</div>
</div>
<span aria-hidden="true" class="kgs-reel-radio w-4 h-4 rounded-full border border-outline shrink-0"></span>
</button>
<button type="button" role="radio" data-kgs-reel-style="cassette" aria-checked="false" class="kgs-reel-choice bg-surface-container-low w-full flex items-center justify-between gap-3 p-3 rounded-xl border border-surface-border-subtle text-left">
<div class="flex items-center gap-3 min-w-0">
<span aria-hidden="true" class="text-base">🎴</span>
<div class="min-w-0">
<div class="kgs-reel-title text-xs font-medium text-on-surface-variant uppercase">Кассетная дека 3D Cover Flow</div>
<div class="text-[10px] text-text-muted font-micro-caption uppercase">Объёмная параллакс-карусель</div>
</div>
</div>
<span aria-hidden="true" class="kgs-reel-radio w-4 h-4 rounded-full border border-outline shrink-0"></span>
</button>
<button type="button" role="radio" data-kgs-reel-style="ticket" aria-checked="false" class="kgs-reel-choice bg-surface-container-low w-full flex items-center justify-between gap-3 p-3 rounded-xl border border-surface-border-subtle text-left">
<div class="flex items-center gap-3 min-w-0">
<span aria-hidden="true" class="text-base">🎟</span>
<div class="min-w-0">
<div class="kgs-reel-title text-xs font-medium text-on-surface-variant uppercase">Бумажные билеты</div>
<div class="text-[10px] text-text-muted font-micro-caption uppercase">Стопка билетов с постерами фильмов</div>
</div>
</div>
<span aria-hidden="true" class="kgs-reel-radio w-4 h-4 rounded-full border border-outline shrink-0"></span>
</button>
</div>
</section>
<section class="rounded-2xl bg-surface-panel border border-surface-border-subtle p-4 space-y-4 transition-colors duration-300" data-purpose="sound-and-haptics">
<div class="flex items-center gap-2">
<span class="text-primary-container text-sm">♬</span>
<h2 class="font-headline-sm text-headline-sm text-primary">Звуковой режиссёрский пульт</h2>
</div>
<div class="flex items-center justify-between gap-3">
<div>
<div class="text-xs font-bold text-on-surface uppercase tracking-tight">ЗВУК ВРАЩЕНИЯ КИНОГЛОБУСА</div>
<div class="text-[10px] text-text-muted font-micro-caption uppercase">СОПРОВОЖДЕНИЕ ВЫБОРА СТРАНЫ</div>
</div>
<span class="text-[9px] font-micro-caption font-bold px-2 py-0.5 rounded bg-surface-container-high text-primary-container border border-primary-container/30" data-kgs-globe-sound-status></span>
</div>
<div data-kgs-sound></div>
<div class="space-y-2 pt-2 border-t border-surface-border-subtle">
<div class="flex items-center justify-between">
<div class="text-xs font-bold text-on-surface uppercase tracking-tight">ЗВУК ПОИСКА ФИЛЬМА</div>
<span class="text-[9px] font-micro-caption font-bold px-2 py-0.5 rounded bg-surface-container-high text-primary-container border border-primary-container/30" data-kgs-reel-sound-status></span>
</div>
<p class="text-[10px] text-text-muted font-micro-caption uppercase">ПОДБЕРИТЕ ЗВУК ПОД ВИД РУЛЕТКИ</p>
<select class="kgs-select bg-surface-container-lowest border-surface-border-subtle w-full rounded-xl px-3 py-2.5 text-xs text-on-surface" data-kgs-reel-sound-select aria-label="Выбрать звук поиска фильма">
            <option value="auto">Авто · по виду рулетки</option>
            <optgroup label="Кинозвуки">
              <option value="projector35">Проектор 35 мм · щелчок и шелест</option>
              <option value="cassetteRewind">Кассета · мотор перемотки</option>
              <option value="paperTickets">Билеты · шорох бумаги</option>
            </optgroup>
            <optgroup label="Другие профили"><option value="projector">Проектор · щелчки</option><option value="imax">Кинозал · мягкий импульс</option><option value="camera">Кинокамера · механика</option><option value="tape">Магнитная плёнка</option><option value="premiere">Премьерный зал</option><option value="shutter">Кинокамера · затвор</option><option value="editbench">Монтажный стол · шаг кадра</option><option value="sixteenmm">16 мм · мягкая трещотка</option></optgroup><option value="off">Без звука</option></select>
<button class="w-full py-2 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high border border-primary-container/30 text-primary-container text-xs font-medium transition-all flex items-center justify-center gap-1.5" type="button" data-kgs-reel-preview>
<span>▶</span>
<span>Прослушать выбранный звук</span>
</button>
</div>
<div class="space-y-3 pt-2 border-t border-surface-border-subtle">
<div class="flex items-center justify-between">
<div>
<div class="text-xs font-bold text-primary-container uppercase tracking-tight">ТАКТИЛЬНЫЙ ОТКЛИК</div>
<div class="text-[10px] text-text-muted font-micro-caption uppercase">ВИБРАЦИЯ ПРИ ЗАПУСКЕ РУЛЕТКИ</div>
</div>
<button class="kgs-switch bg-surface-container-highest aria-checked:bg-primary-container" type="button" role="switch" aria-checked="false" aria-label="Тактильный отклик" data-kgs-fx><span aria-hidden="true"></span></button>
</div>
<div class="flex items-center justify-between gap-3 pt-1">
<button class="py-2 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high border border-surface-border-subtle text-xs text-on-surface font-medium flex items-center gap-1.5" type="button" data-kgs-preview aria-label="Тест звука глобуса">
<span>▶</span>
<span>Тест кинозвука</span>
</button>
<div class="flex items-center gap-2 flex-1 max-w-[170px]">
<span class="text-[9px] font-micro-caption text-text-muted uppercase">ГРОМКОСТЬ <span class="block">Скоро</span></span>
<input class="w-full h-1.5 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary-container" max="100" min="0" type="range" value="75" disabled aria-label="Громкость · скоро">
</div>
</div>
</div>
</section>
<section class="rounded-2xl bg-surface-panel border border-surface-border-subtle p-4 space-y-4 transition-colors duration-300" data-purpose="cinema-hall-atmosphere">
<div class="flex items-center gap-2">
<span class="text-primary-container text-sm">✦</span>
<h2 class="font-headline-sm text-headline-sm text-primary">Атмосфера кинозала и оптика</h2>
</div>
<div class="flex items-center justify-between gap-3">
<div>
<div class="text-xs font-semibold text-on-surface-variant uppercase">СВЕТОВОЙ КОНУС ПРОЕКТОРА</div>
<div class="text-[10px] text-text-muted font-micro-caption">ДИНАМИЧЕСКИЙ ЛУЧ НА ФОНЕ ГЛОБУСА · ГОТОВИТСЯ</div>
</div>
<div class="flex items-center gap-2">
<span class="text-[9px] font-micro-caption px-1.5 py-0.5 rounded bg-surface-container text-text-muted">СКОРО</span>
<div class="w-9 h-5 bg-surface-container-high rounded-full opacity-40"></div>
</div>
</div>
<div class="flex items-center justify-between gap-3">
<div>
<div class="text-xs font-semibold text-on-surface-variant uppercase">ПЛЁНОЧНОЕ ЗЕРНО KODAK 64</div>
<div class="text-[10px] text-text-muted font-micro-caption">ТОНКАЯ ТЕКСТУРА КИНОПЛЁНКИ · ГОТОВИТСЯ</div>
</div>
<div class="flex items-center gap-2">
<span class="text-[9px] font-micro-caption px-1.5 py-0.5 rounded bg-surface-container text-text-muted">СКОРО</span>
<div class="w-9 h-5 bg-surface-container-high rounded-full opacity-40"></div>
</div>
</div>
<div class="flex items-center justify-between gap-3">
<div>
<div class="text-xs font-semibold text-on-surface-variant uppercase">АНАМОРФОТНЫЕ БЛИКИ PANAVISION</div>
<div class="text-[10px] text-text-muted font-micro-caption">КИНЕМАТОГРАФИЧЕСКИЕ БЛИКИ ИНТЕРФЕЙСА · ГОТОВЯТСЯ</div>
</div>
<div class="flex items-center gap-2">
<span class="text-[9px] font-micro-caption px-1.5 py-0.5 rounded bg-surface-container text-text-muted">СКОРО</span>
<div class="w-9 h-5 bg-surface-container-high rounded-full opacity-40"></div>
</div>
</div>
<div class="flex items-center justify-between gap-3 pt-2 border-t border-surface-border-subtle">
<div>
<div class="text-xs font-bold text-on-surface uppercase">КОНТЕНТ ДЛЯ ВЗРОСЛЫХ (18+)</div>
<div class="text-[10px] text-text-muted font-micro-caption uppercase">ПОКАЗЫВАТЬ ЖАНР 18+ В ФИЛЬТРАХ</div>
</div>
<button class="kgs-switch bg-surface-container-highest aria-checked:bg-primary-container" type="button" role="switch" aria-checked="false" aria-label="Контент для взрослых" data-kgs-adult><span aria-hidden="true"></span></button>
</div>
<div class="space-y-2 pt-2 border-t border-surface-border-subtle">
<div class="text-xs font-bold text-primary-container uppercase tracking-tight font-micro-caption">
          РЕЖИМ РУЛЕТКИ ПО УМОЛЧАНИЮ
        </div>
<div class="grid grid-cols-2 p-1 bg-surface-container-lowest rounded-xl border border-surface-border-subtle gap-1">
<button class="py-2 rounded-lg text-xs font-semibold text-text-muted aria-pressed:bg-primary-container aria-pressed:text-on-primary-fixed flex items-center justify-center gap-1.5" type="button" data-kgs-mode="filters" aria-pressed="false">
<span>⌕</span>
<span>Свои фильтры</span>
</button>
<button class="py-2 rounded-lg text-xs font-semibold text-text-muted aria-pressed:bg-primary-container aria-pressed:text-on-primary-fixed flex items-center justify-center gap-1.5" type="button" data-kgs-mode="surprise" aria-pressed="false">
<span>⚄</span>
<span>Удиви меня</span>
</button>
</div>
<div class="grid grid-cols-4 gap-1.5 pt-1">
<button class="py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-surface-border-subtle text-[10px] font-medium text-on-surface-variant" type="button" disabled>
            Лёгкое
          </button>
<button class="py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-surface-border-subtle text-[10px] font-medium text-on-surface-variant" type="button" disabled>
            Открытие
          </button>
<button class="py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-surface-border-subtle text-[10px] font-medium text-on-surface-variant" type="button" disabled>
            Случайность
          </button>
<button class="py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-surface-border-subtle text-[10px] font-medium text-on-surface-variant" type="button" disabled>
            Хардкор
          </button>
</div>
<p class="text-[10px] text-text-muted font-micro-caption leading-relaxed uppercase">
          СКОРО · ВЫБОР СЦЕНАРИЯ РУЛЕТКИ ИЗ НАСТРОЕК.
        </p>
</div>
</section>
<section class="rounded-2xl bg-surface-panel border border-primary-container/25 p-4 space-y-3.5 transition-colors duration-300" data-purpose="expedition-atlas">
<div class="flex items-center gap-2">
<span class="text-primary-container text-sm">◎</span>
<h2 class="font-headline-sm text-headline-sm text-primary">Атлас экспедиции и журнал</h2>
</div>
<div class="space-y-1.5">
<div class="flex items-center justify-between text-xs">
<span class="font-bold text-on-surface uppercase font-micro-caption">ПРОГРЕСС ИССЛЕДОВАТЕЛЯ</span>
<span class="font-micro-caption font-bold text-primary-container" data-kgs-count>1 / 104 СТРАН</span>
</div>
<div class="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
<div class="h-full bg-gradient-to-r from-primary-fixed-dim to-primary-container rounded-full kgs-gold-shadow" data-kgs-progress></div>
</div>
<div class="flex items-center justify-between text-[10px] font-micro-caption text-text-muted">
<span data-kgs-progress-label></span>
<span data-kgs-left></span>
</div>
</div>
<button type="button" data-kgs-atlas class="w-full text-left p-3 rounded-xl bg-gradient-to-r from-primary-container/10 to-transparent border border-primary-container/30 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-transform">
<div class="flex items-center gap-3">
<div class="w-7 h-7 rounded-lg bg-primary-container/20 border border-primary-container/40 flex items-center justify-center text-primary-container text-xs">
            ■
          </div>
<div>
<div class="text-xs font-semibold text-on-surface">Карта открытий и просмотренных лент</div>
<div class="text-[10px] text-primary-container font-medium">Открыть атлас</div>
</div>
</div>
<span class="text-primary-container text-sm font-semibold">›</span>
</button>
<div class="space-y-2 pt-1">
<p class="text-[10px] text-error/80 font-micro-caption leading-relaxed uppercase" data-kgs-warning>
          ОЧИСТКА ИСТОРИИ СНИМЕТ ОТМЕТКИ СО ВСЕХ 1 ОТКРЫТЫХ СТРАН И ПРОСМОТРЕННЫХ ФИЛЬМОВ.
        </p>
<button class="w-full py-2.5 px-3 rounded-xl bg-error-container/10 hover:bg-error-container/20 border border-error-container/30 text-error font-semibold text-xs tracking-wide transition-all flex items-center justify-center gap-2" type="button" data-kgs-history>
<span>◷</span>
<span>Сбросить историю открытых стран и фильмов</span>
</button>
</div>
</section>
<section class="rounded-2xl bg-surface-panel border border-surface-border-subtle p-4 space-y-3 text-center transition-colors duration-300" data-purpose="system-administration">
<div class="flex items-center gap-2 text-left">
<span class="text-primary-container text-sm">⚙</span>
<h2 class="font-headline-sm text-headline-sm text-primary">Система и администрирование</h2>
</div>
<button class="w-full py-2.5 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high border border-surface-border-subtle text-xs text-on-surface-variant font-medium transition-all flex items-center justify-center gap-1.5" type="button" data-kgs-reset>
<span>↻</span>
<span>Сбросить все настройки по умолчанию</span>
</button>
<div class="pt-2 text-[11px] text-text-muted font-micro-caption flex items-center justify-center gap-3">
<a class="hover:text-primary-container transition-colors" href="https://github.com/IhorMich/kinoglobus" rel="noopener noreferrer" target="_blank">GitHub Repository</a>
<span>•</span>
<a class="hover:text-primary-container transition-colors" href="https://developer.themoviedb.org/docs" rel="noopener noreferrer" target="_blank">TMDB API Docs</a>
</div>
</section>
</div>
<div class="kgs-nav" data-kgs-nav></div>
  `;

  const $ = (selector) => dialog.querySelector(selector);
  const close = () => { if (dialog.open) dialog.close(); else dialog.removeAttribute("open"); };
  const switchState = (el, value) => el.setAttribute("aria-checked", String(!!value));
  const sync = () => {
    const hasKey = !!apiKey;
    $("[data-kgs-status]").textContent = hasKey ? "Ключ сохранён" : "Ключ не добавлен";
    $("[data-kgs-api-badge]").textContent = hasKey ? "КЛЮЧ СОХРАНЁН" : "НУЖЕН КЛЮЧ";
    $("[data-kgs-lamp]").textContent = hasKey ? "● ключ сохранён" : "● нет ключа";
    dialog.querySelectorAll("[data-kgs-status], [data-kgs-api-badge], [data-kgs-lamp]").forEach(node => {
      node.classList.toggle("kgs-missing-key", !hasKey);
    });
    $("#kgs-token").placeholder = hasKey ? "••••••••••••••••••••••••••••••••" : "Введите ключ TMDB";
    const opened = Object.keys(visited || {}).length, total = COUNTRIES.length;
    const count = `${opened} / ${total} стран`;
    dialog.querySelectorAll("[data-kgs-count]").forEach((node) => { node.textContent = count; });
    $("[data-kgs-progress-label]").textContent = `Открыто ${opened} стран`;
    $("[data-kgs-left]").textContent = `Осталось ${Math.max(0,total-opened)}`;
    $("[data-kgs-progress]").style.width = `${Math.round(opened/total*100)}%`;
    $("[data-kgs-warning]").textContent = `Очистка истории снимет отметки со всех ${opened} открытых стран и просмотренных фильмов.`;
    const globeMuted = snd === "off";
    $("[data-kgs-globe-sound-status]").textContent = globeMuted ? "Без звука" : "Активно";
    $("[data-kgs-preview]").disabled = globeMuted;
    switchState($("[data-kgs-fx]"), fx);
    switchState($("[data-kgs-adult]"), showAdult);
    dialog.querySelectorAll("[data-kgs-reel-style]").forEach((choice)=>{
      const selected=choice.dataset.kgsReelStyle===reelStyle;
      choice.setAttribute("aria-checked",String(selected));
    });
    const reelSoundSelect=$("[data-kgs-reel-sound-select]");
    reelSoundSelect.value = window.getCinemaReelSound();
    const reelMuted = reelSoundSelect.value === "off";
    $("[data-kgs-reel-sound-status]").textContent = reelMuted ? "Без звука" : "Активно";
    $("[data-kgs-reel-preview]").disabled = reelMuted;
    dialog.querySelectorAll("[data-kgs-mode]").forEach(button => {
      const active = button.dataset.kgsMode === playMode;
      button.setAttribute("aria-pressed",String(active));
    });
  };

  $("[data-kgs-close]").addEventListener("click", close);
  dialog.addEventListener("click", (event) => { if (event.target === dialog) close(); });
  document.getElementById("gear").onclick = () => {
    const scroll=$(".kgs-scroll");if(scroll)scroll.scrollTop=0;
    if (appNav) $("[data-kgs-nav]").replaceChildren(appNav.cloneNode(true));
    if (!dialog.open) dialog.showModal();
    sync();
  };

  const labels = {roulette:"Трещотка бобины",bells:"Колокольчики",arcade:"Аркада",casino:"Казино",marimba:"Маримба",space:"Космос",film:"Киноплёнка",orchestra:"Оркестр",jazz:"Джаз",synth:"Синтезатор",chimes:"Звон",off:"Без звука",imax:"Кинозал · низкий гул"};
  if (soundSelect) {
    [...soundSelect.options].forEach((option) => { option.textContent = labels[option.value] || option.textContent; });
    soundSelect.className = $("[data-kgs-reel-sound-select]").className;
    soundSelect.setAttribute("aria-label", "Звук вращения КиноГлобуса");
    const soundHost = $("[data-kgs-sound]");
    if (soundHost) soundHost.appendChild(soundSelect);
  }
  const reelSoundSelect=$("[data-kgs-reel-sound-select]");
  reelSoundSelect.addEventListener("change", () => {
    window.setCinemaReelSound(reelSoundSelect.value);
    sync();
  });
  $(`[data-kgs-reel-preview]`).addEventListener("click",()=>window.previewFilmReelSound?.());

  $("[data-kgs-visibility]").addEventListener("click", () => {
    const input = $("#kgs-token"); input.type = input.type === "password" ? "text" : "password";
    $("[data-kgs-visibility]").setAttribute("aria-label", input.type === "password" ? "Показать введённый ключ" : "Скрыть введённый ключ");
  });
  $("[data-kgs-change]").addEventListener("click", () => { $("#kgs-token").focus(); $("[data-kgs-message]").textContent = "Введите новый ключ и нажмите OK. Сохранённый ключ пока остаётся активным."; });
  $("[data-kgs-save]").addEventListener("click", () => {
    const value = $("#kgs-token").value.trim();
    if (!value) { $("[data-kgs-message]").textContent = "Введите новый ключ TMDB перед сохранением."; return; }
    document.getElementById("tmdb-key-input").value = value;
    document.getElementById("tmdb-key-save").click();
    $("#kgs-token").value = "";
    $("[data-kgs-message]").textContent = "Ключ сохранён. При желании проверьте соединение.";
    sync();
  });
  $("[data-kgs-check]").addEventListener("click", async () => {
    const message = $("[data-kgs-message]");
    if (!apiKey) { message.textContent = "Сначала добавьте ключ TMDB."; return; }
    message.textContent = "Проверяем соединение…";
    try {
      const response = await fetch(`https://api.themoviedb.org/3/configuration?api_key=${encodeURIComponent(apiKey)}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      message.textContent = "TMDB ответил успешно — соединение работает.";
    } catch (error) { message.textContent = `Не удалось проверить соединение: ${error.message}`; }
  });

  $("[data-kgs-fx]").addEventListener("click", () => { toggleVibration(); sync(); });
  dialog.querySelectorAll("[data-kgs-reel-style]").forEach((choice)=>{
    const select=()=>{window.setCinemaReelStyle(choice.dataset.kgsReelStyle);sync();};
    choice.addEventListener("click",select);
  });
  $("[data-kgs-adult]").addEventListener("click", () => { toggleAdultGenres(); sync(); });
  $("[data-kgs-mode=filters]").addEventListener("click", () => { document.getElementById("modeFilters").click(); sync(); });
  $("[data-kgs-mode=surprise]").addEventListener("click", () => { document.getElementById("modeSurprise").click(); sync(); });
  $("[data-kgs-preview]").addEventListener("click", () => { try { preview(); } catch (_) {} });

  $("[data-kgs-atlas]").addEventListener("click", () => { close(); document.getElementById("mapBtn").click(); });
  $("[data-kgs-history]").addEventListener("click", () => {
    if (confirm("Очистить историю просмотра и список открытых стран? Закладки сохранятся.")) {
      window.KGClearWatchHistory();
      sync();
    }
  });
  $("[data-kgs-reset]").addEventListener("click", () => {
    if (confirm("Вернуть настройки к значениям по умолчанию? История, закладки и ключ TMDB сохранятся.")) {
      window.KGResetSettings();
      sync();
    }
  });
  $("[data-kgs-nav]").addEventListener("click", event => {
    const link = event.target.closest("[data-view]");
    if (!link) return;
    event.preventDefault();
    close();
    appNav?.querySelector(`[data-view="${link.dataset.view}"]`)?.click();
  });
  soundSelect?.addEventListener("change", sync);
  sync();
})();
