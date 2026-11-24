// Moven: Explore settings, adapted from the Stitch settings screen.
(function () {
  const dialog = document.getElementById("settings");
  if (!dialog) return;
  const soundSelect = document.getElementById("snd");
  const appNav = document.querySelector('body > nav [data-view="home"]')?.closest("nav");
  dialog.className = "kgs-dialog text-on-surface";
  dialog.setAttribute("aria-labelledby", "kgs-title");
  dialog.innerHTML = `
<header class="w-full bg-surface-panel/85 shadow-[0_4px_24px_rgb(var(--kg-canvas-obsidian)/0.85)] border-b border-surface-border-subtle px-4 pt-3 pb-3 transition-colors duration-300" data-purpose="top-navigation">
<div class="flex items-center justify-between">
<button aria-label="Назад" data-kgs-close autofocus class="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container border border-surface-border-subtle active:scale-95 transition-all text-on-surface-variant hover:text-primary-container hover:border-primary-container/40" type="button">
<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
<path clip-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" fill-rule="evenodd"></path>
</svg>
</button>
<div class="text-center flex-1 px-3">
<div id="kgs-title" class="font-headline-sm text-base text-primary font-semibold leading-tight">
          Настройки
        </div>
<p class="text-[11px] text-text-muted font-medium tracking-tight"><img class="kg-brand-mark" src="assets/branding/moven-icon-192.png" width="24" height="24" alt=""> Настройки Moven: Explore</p>
</div>
</div>
</header>
<div class="kgs-scroll px-4 pt-4 space-y-6">
<section class="space-y-3" data-purpose="core-configuration">
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
<span class="text-xs font-semibold text-primary-container mt-0.5" data-kgs-count></span>
</div>
</div>
</section>
<section class="rounded-2xl bg-surface-panel border border-surface-border-subtle p-4 space-y-4 transition-colors duration-300" data-purpose="language-and-regional-standards">
<div class="flex items-center justify-between">
<div class="flex items-center gap-2">
<span class="text-primary-container text-sm">文</span>
<h2 class="font-headline-sm text-headline-sm text-primary">Язык и региональные стандарты</h2>
</div>
</div>
<div class="space-y-1.5">
<label for="kgs-language" class="text-[10px] font-bold uppercase tracking-wider text-text-muted font-micro-caption">ЯЗЫК ИНТЕРФЕЙСА</label>
<select id="kgs-language" class="kgs-select bg-surface-container-lowest border-surface-border-subtle w-full rounded-xl px-3.5 py-2.5 text-xs text-on-surface font-medium" aria-describedby="kgs-language-note" data-interface-native-name></select>
<p id="kgs-language-note" class="text-xs text-text-muted">Часть экранов пока доступна на русском.</p>
</div>
<div class="space-y-2 pt-1 border-t border-surface-border-subtle">
<div class="space-y-1.5 py-1.5">
<label for="kgs-film-language" class="block text-xs font-medium text-primary-container uppercase tracking-tight font-micro-caption">Язык названий и описаний фильмов</label>
<select id="kgs-film-language" class="kgs-select bg-surface-container-lowest border-surface-border-subtle w-full rounded-xl px-3.5 py-2.5 text-xs text-on-surface font-medium" aria-describedby="kgs-film-language-note">
<option value="auto">Как в интерфейсе</option>
<option value="ru">Русский</option>
<option value="en">Английский</option>
<option value="original">Язык оригинала</option>
</select>
<p id="kgs-film-language-note" class="text-xs text-text-muted">После выбора страница обновится. Если нужного перевода нет, покажем доступный текст.</p>
</div>
<div class="space-y-1.5 py-1.5">
<label for="kgs-watch-region" class="block text-xs font-medium text-primary-container uppercase tracking-tight font-micro-caption">Регион просмотра</label>
<select id="kgs-watch-region" class="kgs-select bg-surface-container-lowest border-surface-border-subtle w-full rounded-xl px-3.5 py-2.5 text-xs text-on-surface font-medium" aria-describedby="kgs-watch-region-note">
<option value="auto">Автоматически</option>
</select>
<p id="kgs-watch-region-note" class="text-xs text-text-muted" aria-live="polite"></p>
</div>
<div class="space-y-1.5 py-1.5">
<label for="kgs-trailer-subtitles" class="block text-xs font-medium text-primary-container uppercase tracking-tight font-micro-caption">Субтитры трейлеров</label>
<select id="kgs-trailer-subtitles" class="kgs-select bg-surface-container-lowest border-surface-border-subtle w-full rounded-xl px-3.5 py-2.5 text-xs text-on-surface font-medium" aria-describedby="kgs-trailer-subtitles-note">
<option value="auto">Авто</option>
<option value="ru">Русский</option>
<option value="en">Английский</option>
<option value="off">Выключены</option>
</select>
<p id="kgs-trailer-subtitles-note" class="text-xs text-text-muted">Применяется при открытии трейлера. Доступные языки зависят от видео. Плеер может использовать своё сохранённое значение. Субтитры можно переключить кнопкой CC.</p>
</div>
</div>
</section>
<section class="rounded-2xl bg-surface-panel border border-primary-container/20 p-4 space-y-3.5 transition-colors duration-300" data-purpose="tmdb-integration">
<div class="flex items-center justify-between">
<div class="flex items-center gap-2">
<span class="text-primary-container text-sm">◉</span>
<h2 class="font-headline-sm text-headline-sm text-primary">Связь с фильмографией TMDB</h2>
</div>
<span class="text-[9px] font-micro-caption font-semibold px-2 py-0.5 rounded-full bg-success-strong/10 text-success border border-success-strong/20" data-kgs-api-badge>
          КЛЮЧ СОХРАНЁН
        </span>
</div>
<div class="space-y-1.5">
<div class="flex items-center justify-between text-[10px] font-micro-caption">
<span class="text-text-muted font-bold uppercase tracking-wider">BEARER TOKEN / V3 AUTH</span>
<span class="text-success font-medium" data-kgs-lamp></span>
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
<span class="text-[10px] uppercase font-micro-caption px-2 py-0.5 rounded-full bg-primary-container/10 text-primary-container border border-primary-container/30">6 тем доступно</span>
</div>
<div class="grid grid-cols-2 sm:grid-cols-6 gap-2" role="group" aria-label="Тема оформления">
<button class="theme-card relative rounded-xl p-2.5 bg-surface-container-lowest border border-surface-border-subtle flex flex-col items-center justify-between min-h-[104px] w-full" type="button" data-kgs-theme="midnight" aria-pressed="false">
<span aria-hidden="true" class="material-symbols-outlined text-primary mt-1">dark_mode</span>
<span class="text-[10px] font-semibold text-on-surface uppercase leading-tight theme-title">Синяя ночь</span>
<span class="text-[9px] text-primary-container" data-kgs-theme-current hidden>Выбрано</span>
</button>
<button class="theme-card relative rounded-xl p-2.5 bg-surface-container-lowest border border-surface-border-subtle flex flex-col items-center justify-between min-h-[104px] w-full" type="button" data-kgs-theme="steel" aria-pressed="false">
<span aria-hidden="true" class="material-symbols-outlined text-primary mt-1">auto_awesome</span>
<span class="text-[10px] font-semibold text-on-surface uppercase leading-tight theme-title">Холодная сталь</span>
<span class="text-[9px] text-primary-container" data-kgs-theme-current hidden>Выбрано</span>
</button>
<button class="theme-card relative rounded-xl p-2.5 bg-surface-container-lowest border border-surface-border-subtle flex flex-col items-center justify-between min-h-[104px] w-full" type="button" data-kgs-theme="cinematic" aria-pressed="false">
<span aria-hidden="true" class="text-primary-container mt-1 text-base">🎞</span>
<span class="text-[10px] font-semibold text-on-surface uppercase leading-tight theme-title">Кинематографичная</span>
<span class="text-[9px] text-primary-container" data-kgs-theme-current hidden>Выбрано</span>
</button>
<button class="theme-card relative rounded-xl p-2.5 bg-surface-container-lowest border border-surface-border-subtle flex flex-col items-center justify-between min-h-[104px] w-full" type="button" data-kgs-theme="oled" aria-pressed="false">
<span aria-hidden="true" class="text-text-muted mt-1 text-base">■</span>
<span class="text-[10px] font-semibold text-on-surface uppercase leading-tight theme-title">OLED Black</span>
<span class="text-[9px] text-primary-container" data-kgs-theme-current hidden>Выбрано</span>
</button>
<button class="theme-card relative rounded-xl p-2.5 bg-surface-container-lowest border border-surface-border-subtle flex flex-col items-center justify-between min-h-[104px] w-full" type="button" data-kgs-theme="golden-age" aria-pressed="false">
<span aria-hidden="true" class="text-primary-container mt-1 text-base">🏆</span>
<span class="text-[10px] font-semibold text-on-surface uppercase leading-tight theme-title">Золотой век</span>
<span class="text-[9px] text-primary-container" data-kgs-theme-current hidden>Выбрано</span>
</button>
<button class="theme-card relative rounded-xl p-2.5 bg-surface-container-lowest border border-surface-border-subtle flex flex-col items-center justify-between min-h-[104px] w-full" type="button" data-kgs-theme="cinema-amber" aria-pressed="false">
<span aria-hidden="true" class="text-primary-container mt-1 text-base">✦</span>
<span class="text-[10px] font-semibold text-on-surface uppercase leading-tight theme-title">Cinema Amber</span>
<span class="text-[9px] text-primary-container" data-kgs-theme-current hidden>Выбрано</span>
</button>
</div>
<p data-kgs-theme-accent class="font-label-sm text-label-sm text-on-surface" hidden>Синий акцент включён в тему</p>
<div data-kgs-accent-picker class="flex flex-wrap items-center justify-between gap-2" role="group" aria-label="Акцент приложения">
<span class="font-label-sm text-label-sm text-on-surface">Акцент приложения</span>
<div class="grid w-full grid-cols-2 gap-1 rounded-lg bg-surface-container-lowest p-1">
<button type="button" class="flex items-center gap-1.5 rounded-md px-2 py-1.5 font-label-sm text-label-sm text-on-surface aria-pressed:bg-surface-container-high" data-kgs-button-accent="blue" aria-pressed="false"><span class="w-3 h-3 shrink-0 rounded-full bg-[rgb(var(--kg-swatch-blue))]" aria-hidden="true"></span>Синий</button>
<button type="button" class="flex items-center gap-1.5 rounded-md px-2 py-1.5 font-label-sm text-label-sm text-on-surface aria-pressed:bg-surface-container-high" data-kgs-button-accent="cyan" aria-pressed="false"><span class="w-3 h-3 rounded-full bg-[rgb(var(--kg-swatch-cyan))]" aria-hidden="true"></span>Бирюза</button>
<button type="button" class="flex items-center gap-1.5 rounded-md px-2 py-1.5 font-label-sm text-label-sm text-on-surface aria-pressed:bg-surface-container-high" data-kgs-button-accent="gold" aria-pressed="false"><span class="w-3 h-3 rounded-full bg-[rgb(var(--kg-swatch-gold))]" aria-hidden="true"></span>Золото</button>
<button type="button" class="flex items-center gap-1.5 rounded-md px-2 py-1.5 font-label-sm text-label-sm text-on-surface aria-pressed:bg-surface-container-high" data-kgs-button-accent="lavender" aria-pressed="false"><span class="w-3 h-3 shrink-0 rounded-full bg-[rgb(var(--kg-swatch-lavender))]" aria-hidden="true"></span>Лаванда</button>
<button type="button" class="flex items-center gap-1.5 rounded-md px-2 py-1.5 font-label-sm text-label-sm text-on-surface aria-pressed:bg-surface-container-high" data-kgs-button-accent="coral" aria-pressed="false"><span class="w-3 h-3 shrink-0 rounded-full bg-[rgb(var(--kg-swatch-coral))]" aria-hidden="true"></span>Коралл</button>
</div></div>
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

<section class="rounded-2xl bg-surface-panel border border-surface-border-subtle p-4 space-y-3.5 transition-colors duration-300" data-purpose="graphics-performance">

  <div class="flex items-center gap-2">
    <span class="material-symbols-outlined text-primary-container" aria-hidden="true">language</span>
    <h2 class="font-headline-sm text-headline-sm text-primary">Графика и производительность</h2>
  </div>

  <p class="text-xs text-text-muted">
    Настройте качество отображения 3D-глобуса.
  </p>

  <div class="space-y-2" role="radiogroup" aria-label="Качество графики">

    <button type="button" role="radio" data-kgs-graphics="economy" aria-checked="false" class="kgs-reel-choice bg-surface-container-low w-full flex items-center justify-between gap-3 p-3 rounded-xl border border-surface-border-subtle text-left">
      <div class="flex items-center gap-3 min-w-0">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" class="text-primary-container shrink-0" style="flex-shrink:0" aria-hidden="true">
  <rect x="2" y="6" width="18" height="12" rx="2"/>
  <path d="M22 10v4"/>
  <path d="M11 8l-3 5h5l-2 3"/>
</svg>
        <div class="min-w-0">
          <div class="kgs-reel-title text-xs font-medium text-on-surface-variant uppercase">Экономичный</div>
          <div class="text-[10px] text-text-muted">2K · 30 FPS</div>
          <div class="text-[10px] text-text-muted">Сниженная нагрузка на устройство</div>
        </div>
      </div>
      <span aria-hidden="true" class="kgs-reel-radio w-4 h-4 rounded-full border border-outline shrink-0"></span>
    </button>

    <button type="button" role="radio" data-kgs-graphics="balanced" aria-checked="false" class="kgs-reel-choice bg-surface-container-low w-full flex items-center justify-between gap-3 p-3 rounded-xl border border-surface-border-subtle text-left">
      <div class="flex items-center gap-3 min-w-0">
        <span class="material-symbols-outlined text-primary-container" aria-hidden="true">tune</span>
        <div class="min-w-0">
          <div class="kgs-reel-title text-xs font-medium text-on-surface-variant uppercase">Сбалансированный</div>
          <div class="text-[10px] text-text-muted">2K · 30 FPS</div>
          <div class="text-[10px] text-text-muted">Динамические облака</div>
        </div>
      </div>
      <span aria-hidden="true" class="kgs-reel-radio w-4 h-4 rounded-full border border-outline shrink-0"></span>
    </button>

    <button type="button" role="radio" data-kgs-graphics="maximum" aria-checked="false" class="kgs-reel-choice bg-surface-container-low w-full flex items-center justify-between gap-3 p-3 rounded-xl border border-surface-border-subtle text-left">
      <div class="flex items-center gap-3 min-w-0">
        <span class="material-symbols-outlined text-primary-container" aria-hidden="true">auto_awesome</span>
        <div class="min-w-0">
          <div class="kgs-reel-title text-xs font-medium text-on-surface-variant uppercase">Максимальный</div>
          <div class="text-[10px] text-text-muted">4K · 60 FPS</div>
          <div class="text-[10px] text-text-muted">Максимальная детализация и эффекты</div>
        </div>
      </div>
      <span aria-hidden="true" class="kgs-reel-radio w-4 h-4 rounded-full border border-outline shrink-0"></span>
    </button>

  </div>

  <p class="text-[10px] text-text-muted">
    Настройки применяются автоматически и сохраняются на устройстве.
  </p>

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
</div>
</section>
<section class="rounded-2xl bg-surface-panel border border-surface-border-subtle p-4 space-y-4 transition-colors duration-300" data-purpose="sound-and-haptics">
<div class="flex items-center gap-2">
<span class="text-primary-container text-sm">♬</span>
<h2 class="font-headline-sm text-headline-sm text-primary">Звуковой режиссёрский пульт</h2>
</div>
<div class="flex items-center justify-between gap-3">
<div>
<div class="text-xs font-bold text-on-surface uppercase tracking-tight">ЗВУК ВРАЩЕНИЯ ГЛОБУСА</div>
<div class="text-[10px] text-text-muted font-micro-caption uppercase">СОПРОВОЖДЕНИЕ ВЫБОРА СТРАНЫ</div>
</div>
<span class="text-[9px] font-micro-caption font-bold px-2 py-0.5 rounded bg-surface-container-high text-primary-container border border-primary-container/30" data-kgs-globe-sound-status></span>
</div>
<div data-kgs-sound></div>
<button class="w-full py-2 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high border border-primary-container/30 text-primary-container text-xs font-medium transition-all flex items-center justify-center gap-1.5" type="button" data-kgs-preview>
<span aria-hidden="true">▶</span>
<span>Прослушать выбранный звук</span>
</button>
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
            <optgroup label="Свои звуки (mp3)"><option value="rsm-click">Мышь · щелчок</option><option value="rsm-swoosh">Быстрый свуш</option><option value="rsm-cape">Свуш · плащ</option><option value="rsm-motion">Свуш · движение</option><option value="rsm-fire">Свуш · пламя</option><option value="rsm-whistle">Свисток · писк</option><option value="rsm-proj2">Проектор · живая запись 1</option><option value="rsm-cine">Проектор · живая запись 2</option></optgroup>
            <optgroup label="Музыка (mp3)"><option value="rsm-m-menu">Музыка · Меню · смена</option><option value="rsm-m-ondabeat">Музыка · On Da Beat</option><option value="rsm-m-oblivion">Музыка · Oblivion Beat</option><option value="rsm-m-multiverse">Музыка · Multiverse</option><option value="rsm-m-moonwalker">Музыка · Moon Walker</option><option value="rsm-m-horror">Музыка · Horror Kick</option><option value="rsm-m-goldmetal">Музыка · Gold Metal</option><option value="rsm-m-heroes">Музыка · Drums of Heroes</option><option value="rsm-m-darkrolls">Музыка · Dark Rolls</option><option value="rsm-m-tension">Музыка · Cinematic Tension</option><option value="rsm-m-percussion">Музыка · Cinematic Percussion</option><option value="rsm-m-bassdrop">Музыка · Bass Drop</option><option value="rsm-m-addkick">Музыка · Add Kick</option></optgroup>
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
<div class="flex flex-col gap-1.5 flex-1 min-w-0">
<div class="flex justify-between gap-1 text-micro-caption">
<label for="kgs-volume" class="text-text-muted">Громкость</label>
<output for="kgs-volume" data-kgs-volume-value class="text-primary tabular-nums" aria-hidden="true"></output>
</div>
<input id="kgs-volume" class="w-full h-2 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary-container" min="0" max="100" step="1" type="range">
</div>
</div>
</div>
</section>
<section class="rounded-2xl bg-surface-panel border border-surface-border-subtle p-4 space-y-4 transition-colors duration-300" data-purpose="film-search-settings">
<h2 class="font-headline-sm text-headline-sm text-primary">Параметры поиска фильмов</h2>
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
<div class="grid grid-cols-3 gap-1.5 pt-1" role="group" aria-label="Сценарии «Удиви меня»">
${[["light","Лёгкое"],["find","Открытие"],["wild","Случайность"]].map(([id,label]) => `
<button class="min-h-9 px-2 rounded-lg bg-surface-container hover:bg-surface-container-high border border-surface-border-subtle text-xs font-medium text-on-surface-variant aria-pressed:bg-primary-container aria-pressed:text-on-primary-fixed" type="button" data-kgs-surprise="${id}" aria-pressed="false">${label}</button>
`).join("")}
</div>
<p class="text-body-sm text-text-muted" data-kgs-surprise-note></p>
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
<span class="font-micro-caption font-bold text-primary-container" data-kgs-count></span>
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
<a class="hover:text-primary-container transition-colors" href="https://developer.themoviedb.org/docs" rel="noopener noreferrer" target="_blank">TMDB API Docs</a>
</div>
<div class="pt-2 border-t border-surface-border-subtle/60 text-[10px] text-text-muted/80 font-micro-caption tracking-wide text-center" data-kgs-build-number>Сборка приложения: DEV-2026.11.18.01</div>
</section>
</div>
<div class="kgs-nav" data-kgs-nav></div>
  `;

  localizeInterfaceMarkup(dialog);
  const $ = (selector) => dialog.querySelector(selector);
  const close = () => { if (dialog.open) dialog.close(); else dialog.removeAttribute("open"); };
  const switchState = (el, value) => el.setAttribute("aria-checked", String(!!value));
  const interfaceLanguageSelect = $("#kgs-language");
  for (const [code, label] of Object.entries(interfaceLanguages)) {
    interfaceLanguageSelect.add(new Option(label, code));
  }
  interfaceLanguageSelect.value = interfaceLanguage;
  interfaceLanguageSelect.addEventListener("change", () => {
    store.set(interfaceLanguageKey, interfaceLanguageSelect.value);
    location.reload();
  });

  const filmLanguageSelect = $("#kgs-film-language");
  filmLanguageSelect.value = store.get("kgFilmLanguage", "auto");
  if (!filmLanguageSelect.value) filmLanguageSelect.value = "auto";
  filmLanguageSelect.addEventListener("change", () => {
    store.set("kgFilmLanguage", filmLanguageSelect.value);
    location.reload();
  });

  const watchRegionSelect = $("#kgs-watch-region");
  const watchProviders = window.KGLegalWatch;
  const localizedRegions = watchProviders.regionOptions
    .map(({code}) => ({code, name: interfaceRegionNames.of(code)}))
    .sort((a, b) => a.name.localeCompare(b.name, interfaceLanguage));
  for (const {code, name} of localizedRegions) {
    watchRegionSelect.add(new Option(name, code));
  }
  function syncWatchRegion() {
    const selected = watchProviders.getRegion();
    watchRegionSelect.value = selected;
    $("#kgs-watch-region-note").textContent = selected === "auto"
      ? uiText("Регион определяется автоматически по настройкам устройства.")
      : uiText("Регион для блока «Где смотреть»: {region}.", {region: interfaceRegionNames.of(watchProviders.getEffectiveRegion())});
  }
  watchRegionSelect.addEventListener("change", () => {
    watchProviders.setRegion(watchRegionSelect.value);
    syncWatchRegion();
  });

  const trailerSubtitlesSelect = $("#kgs-trailer-subtitles");
  trailerSubtitlesSelect.addEventListener("change", () => {
    store.set("kgTrailerSubtitles", trailerSubtitlesSelect.value);
  });

  const volumeSlider = $("#kgs-volume");
  const volumeValue = $("[data-kgs-volume-value]");
  const syncVolume = () => {
    volumeSlider.value = String(soundVolume);
    volumeSlider.setAttribute("aria-valuetext", soundVolume + "%");
    volumeValue.value = soundVolume + "%";
  };
  volumeSlider.addEventListener("input", () => {
    setSoundVolume(volumeSlider.valueAsNumber);
    syncVolume();
  });

  const themeButtons = dialog.querySelectorAll("[data-kgs-theme]");
  const buttonAccents = dialog.querySelectorAll("[data-kgs-button-accent]");
  function syncButtonAccent() {
    const current = document.documentElement.dataset.kgButtonAccent;
    buttonAccents.forEach(button => {
      button.setAttribute("aria-pressed", String(button.dataset.kgsButtonAccent === current));
    });
  }
  buttonAccents.forEach(button => {
    button.addEventListener("click", () => {
      setAppButtonAccent(button.dataset.kgsButtonAccent);
      syncButtonAccent();
    });
  });
  function syncTheme() {
    const theme = document.documentElement.dataset.kgTheme || DEFAULT_APP_THEME;
    const usesThemeAccent = appThemeHasFixedAccent(theme);
    const themeAccent = $("[data-kgs-theme-accent]");
    themeAccent.hidden = !usesThemeAccent;
    themeAccent.textContent = uiText(theme === "cinema-amber" ? "Янтарный акцент включён в тему" : theme === "steel" ? "Серебристый акцент включён в тему" : "Синий акцент включён в тему");
    $("[data-kgs-accent-picker]").hidden = usesThemeAccent;
    themeButtons.forEach(button => {
      const selected = button.dataset.kgsTheme === theme;
      button.setAttribute("aria-pressed", String(selected));
      button.querySelector("[data-kgs-theme-current]").hidden = !selected;
    });
  }

  themeButtons.forEach(button => {
    button.addEventListener("click", () => {
      setAppTheme(button.dataset.kgsTheme);
      syncButtonAccent();
      syncTheme();
    });
  });

  const syncSounds = () => {
    const globeMuted = snd === "off";
    $("[data-kgs-globe-sound-status]").textContent = globeMuted ? uiText("Без звука") : uiText("Активно");
    $("[data-kgs-preview]").disabled = globeMuted;
    const reelSoundSelect=$("[data-kgs-reel-sound-select]");
    reelSoundSelect.value = window.getCinemaReelSound();
    const reelMuted = reelSoundSelect.value === "off";
    $("[data-kgs-reel-sound-status]").textContent = reelMuted ? uiText("Без звука") : uiText("Активно");
    $("[data-kgs-reel-preview]").disabled = reelMuted;
  };

  const sync = () => {
    syncWatchRegion();
    trailerSubtitlesSelect.value = getTrailerSubtitles();
    syncVolume();
    syncTheme();
    syncButtonAccent();
    const hasKey = !!apiKey;
    $("[data-kgs-status]").textContent = hasKey ? uiText("Ключ сохранён") : uiText("Ключ не добавлен");
    $("[data-kgs-api-badge]").textContent = hasKey ? uiText("КЛЮЧ СОХРАНЁН") : uiText("НУЖЕН КЛЮЧ");
    $("[data-kgs-lamp]").textContent = hasKey ? uiText("● ключ сохранён") : uiText("● нет ключа");
    dialog.querySelectorAll("[data-kgs-status], [data-kgs-api-badge], [data-kgs-lamp]").forEach(node => {
      node.classList.toggle("kgs-missing-key", !hasKey);
    });
    $("#kgs-token").placeholder = hasKey ? "••••••••••••••••••••••••••••••••" : uiText("Введите ключ TMDB");
    const opened = countOpenedCountries(visited || {}), total = COUNTRIES.length;
    const count = uiText("{opened} / {total} стран", {opened, total});
    dialog.querySelectorAll("[data-kgs-count]").forEach((node) => { node.textContent = count; });
    $("[data-kgs-progress-label]").textContent = uiText("Открыто стран: {count}", {count: opened});
    $("[data-kgs-left]").textContent = uiText("Осталось {count}", {count: Math.max(0, total - opened)});
    $("[data-kgs-progress]").style.width = `${Math.round(opened/total*100)}%`;
    $("[data-kgs-warning]").textContent = uiText("Очистка истории снимет отметки со всех {count} открытых стран и просмотренных фильмов.", {count: Object.keys(visited || {}).length});
    syncSounds();
    switchState($("[data-kgs-fx]"), fx);
    dialog.querySelectorAll("[data-kgs-reel-style]").forEach((choice)=>{
      const selected=choice.dataset.kgsReelStyle===reelStyle;
      choice.setAttribute("aria-checked",String(selected));
    });
    dialog.querySelectorAll("[data-kgs-mode]").forEach(button => {
      const active = button.dataset.kgsMode === playMode;
      button.setAttribute("aria-pressed",String(active));
    });
    dialog.querySelectorAll("[data-kgs-surprise]").forEach(button => {
      button.setAttribute("aria-pressed", String(playMode === "surprise" && button.dataset.kgsSurprise === surprise));
    });
    $("[data-kgs-surprise-note]").textContent = playMode === "surprise"
      ? uiText(SURPRISE_NOTE[surprise])
      : uiText("Выберите сценарий, чтобы включить режим «Удиви меня».");
  };

  $("[data-kgs-close]").addEventListener("click", close);
  dialog.addEventListener("click", (event) => { if (event.target === dialog) close(); });
  window.KGOpenSettings = section => {
    const scroll = $(".kgs-scroll");
    scroll.scrollTop = 0;
    if (appNav) $("[data-kgs-nav]").replaceChildren(appNav.cloneNode(true));
    if (!dialog.open) dialog.showModal();
    sync();
    const target = section === "watch-region" ? $("#kgs-watch-region").parentElement
      : [...scroll.querySelectorAll("[data-purpose]")].find(panel => panel.dataset.purpose === section);
    target?.scrollIntoView({block:"start"});
  };
  document.getElementById("gear").onclick = () => window.KGOpenSettings();

  const labels = {roulette:"Трещотка бобины",bells:"Колокольчики",arcade:"Аркада",casino:"Казино",marimba:"Маримба",space:"Космос",film:"Киноплёнка",orchestra:"Оркестр",jazz:"Джаз",synth:"Синтезатор",chimes:"Звон","smp-ui14":"Сэмпл · UI 14","smp-ui02":"Сэмпл · UI 02","smp-ui73":"Сэмпл · UI 73","smp-build":"Сэмпл · Build finish","smp-confirm":"Сэмпл · Confirm","smp-impact":"Сэмпл · Impact","smp-blaster":"Сэмпл · Sci-fi blaster","smp-reveal":"Трещотка + финал Logo reveal","smp-m-menu":"Музыка · Меню · смена","smp-m-ondabeat":"Музыка · On Da Beat","smp-m-oblivion":"Музыка · Oblivion Beat","smp-m-multiverse":"Музыка · Multiverse","smp-m-moonwalker":"Музыка · Moon Walker","smp-m-horror":"Музыка · Horror Kick","smp-m-goldmetal":"Музыка · Gold Metal","smp-m-heroes":"Музыка · Drums of Heroes","smp-m-darkrolls":"Музыка · Dark Rolls","smp-m-tension":"Музыка · Cinematic Tension","smp-m-percussion":"Музыка · Cinematic Percussion","smp-m-bassdrop":"Музыка · Bass Drop","smp-m-addkick":"Музыка · Add Kick",off:"Без звука",imax:"Кинозал · низкий гул"};
  if (soundSelect) {
    [...soundSelect.options].forEach((option) => { option.textContent = uiText(labels[option.value] || option.textContent); });
    soundSelect.className = $("[data-kgs-reel-sound-select]").className;
    soundSelect.setAttribute("aria-label", uiText("Звук вращения глобуса"));
    const soundHost = $("[data-kgs-sound]");
    if (soundHost) soundHost.appendChild(soundSelect);
  }
  const reelSoundSelect=$("[data-kgs-reel-sound-select]");
  reelSoundSelect.addEventListener("change", () => {
    window.setCinemaReelSound(reelSoundSelect.value);
    syncSounds();
  });
  $(`[data-kgs-reel-preview]`).addEventListener("click",()=>window.previewFilmReelSound?.());

  $("[data-kgs-visibility]").addEventListener("click", () => {
    const input = $("#kgs-token"); input.type = input.type === "password" ? "text" : "password";
    $("[data-kgs-visibility]").setAttribute("aria-label", input.type === "password" ? uiText("Показать введённый ключ") : uiText("Скрыть введённый ключ"));
  });
  $("[data-kgs-change]").addEventListener("click", () => { $("#kgs-token").focus(); $("[data-kgs-message]").textContent = uiText("Введите новый ключ и нажмите OK. Сохранённый ключ пока остаётся активным."); });
  $("[data-kgs-save]").addEventListener("click", () => {
    const value = $("#kgs-token").value.trim();
    if (!value) { $("[data-kgs-message]").textContent = uiText("Введите новый ключ TMDB перед сохранением."); return; }
    document.getElementById("tmdb-key-input").value = value;
    document.getElementById("tmdb-key-save").click();
    $("#kgs-token").value = "";
    $("[data-kgs-message]").textContent = uiText("Ключ сохранён. При желании проверьте соединение.");
    sync();
  });
  $("[data-kgs-check]").addEventListener("click", async () => {
    const message = $("[data-kgs-message]");
    if (!apiKey) { message.textContent = uiText("Сначала добавьте ключ TMDB."); return; }
    message.textContent = uiText("Проверяем соединение…");
    try {
      const response = await movieCatalog.request(`https://api.themoviedb.org/3/configuration?api_key=${encodeURIComponent(apiKey)}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      message.textContent = uiText("TMDB ответил успешно — соединение работает.");
    } catch (error) { message.textContent = uiText("Не удалось проверить соединение: {error}", {error: error.message}); }
  });

  $("[data-kgs-fx]").addEventListener("click", () => { toggleVibration(); sync(); });
  dialog.querySelectorAll("[data-kgs-reel-style]").forEach((choice)=>{
    const select=()=>{window.setCinemaReelStyle(choice.dataset.kgsReelStyle);sync();};
    choice.addEventListener("click",select);
  });
  $("[data-kgs-mode=filters]").addEventListener("click", () => { document.getElementById("modeFilters").click(); sync(); });
  $("[data-kgs-mode=surprise]").addEventListener("click", () => { document.getElementById("modeSurprise").click(); sync(); });
  dialog.querySelectorAll("[data-kgs-surprise]").forEach(button => {
    button.addEventListener("click", () => {
      selectSurpriseScenario(button.dataset.kgsSurprise);
      sync();
    });
  });
  $("[data-kgs-preview]").addEventListener("click", preview);
  dialog.addEventListener("close", () => {
    stopGlobeSoundPreview();
    if (reelSoundPreviewFrame) stopFilmReelSound();
  });

  $("[data-kgs-atlas]").addEventListener("click", () => { close(); document.getElementById("mapBtn").click(); });
  $("[data-kgs-history]").addEventListener("click", () => {
    if (confirm(uiText("Очистить историю просмотра и список открытых стран? Закладки сохранятся."))) {
      window.KGClearWatchHistory();
      sync();
    }
  });
  $("[data-kgs-reset]").addEventListener("click", () => {
    if (confirm(uiText("Вернуть настройки к значениям по умолчанию? История, закладки и ключ TMDB сохранятся."))) {
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
  soundSelect?.addEventListener("change", syncSounds);
  sync();
})();


// Moven: globe graphics preferences
(function () {
  const dialog = document.getElementById("settings");
  if (!dialog) return;

  const buttons = [...dialog.querySelectorAll("[data-kgs-graphics]")];
  if (!buttons.length) return;

  const validModes = ["economy", "balanced", "maximum"];

  function getQuality() {
    if (window.KGGlobeGraphics) {
      return window.KGGlobeGraphics.getQuality();
    }

    try {
      const saved = localStorage.getItem("kgGlobeQuality");
      return validModes.includes(saved) ? saved : "maximum";
    } catch {
      return "maximum";
    }
  }

  function refreshGraphicsSettings() {
    const quality = getQuality();

    buttons.forEach(button => {
      const selected = button.dataset.kgsGraphics === quality;
      button.setAttribute("aria-checked", String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
  }

  buttons.forEach((button, index) => {
    button.addEventListener("click", () => {
      const quality = button.dataset.kgsGraphics;
      if (!validModes.includes(quality)) return;

      try {
        localStorage.setItem("kgGlobeQuality", quality);
      } catch {}

      window.KGGlobeGraphics?.setQuality(quality);

      refreshGraphicsSettings();
    });

    button.addEventListener("keydown", event => {
      const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"];
      if (!keys.includes(event.key)) return;

      event.preventDefault();

      const direction =
        event.key === "ArrowRight" || event.key === "ArrowDown"
          ? 1 : -1;

      const next = buttons[
        (index + direction + buttons.length) % buttons.length
      ];

      next.click();
      next.focus();
    });
  });

  new MutationObserver(refreshGraphicsSettings).observe(dialog, {
    attributes: true,
    attributeFilter: ["open"]
  });

  refreshGraphicsSettings();
})();
