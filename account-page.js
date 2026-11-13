/* Registration/sign-in screen based on the supplied Stitch account design. */
(() => {
  const style = document.createElement('style');
  style.textContent = `
    .kg-account-avatar{width:36px;height:36px;display:grid;place-items:center;padding:0;border:0;border-radius:50%;background:transparent;cursor:pointer;transition:transform .18s,filter .18s}.kg-account-avatar:hover{filter:brightness(1.15);transform:scale(1.05)}
    #kg-account-dialog{position:fixed;inset:0;margin:0 auto;width:min(100%,520px);height:100dvh;max-height:100dvh;padding:0;border:0;border-radius:0;background:rgb(var(--kg-surface-container-lowest));color:#e8e0ea;overflow:hidden;font-family:'Plus Jakarta Sans',sans-serif}
    #kg-account-dialog::backdrop{background:rgb(var(--kg-canvas-obsidian) / 0.933);backdrop-filter:blur(8px)}
    .kga-shell{height:100%;display:flex;flex-direction:column;background:radial-gradient(ellipse at 52% -12%,rgba(255,184,48,.12),transparent 37%),radial-gradient(ellipse at 95% 45%,rgba(134,26,69,.11),transparent 38%),rgb(var(--kg-surface-container-lowest))}
    .kga-head{height:64px;flex:none;display:flex;align-items:center;justify-content:space-between;padding:0 18px;border-bottom:1px solid #ffffff0c;background:rgb(var(--kg-surface) / 0.800);backdrop-filter:blur(14px)}
    .kga-back,.kga-mode{border:0;background:none;color:#ffdca8;cursor:pointer}.kga-back{width:40px;height:40px;border-radius:50%;background:rgb(var(--kg-surface-container-low));font-size:25px}.kga-brand{font:600 20px 'Noto Serif',serif;letter-spacing:.02em;color:#ffdca8}.kga-mode{font-size:14px;font-weight:700}.kga-scroll{min-height:0;flex:1;overflow:auto;overscroll-behavior:contain;padding:25px 22px calc(env(safe-area-inset-bottom,0px) + 26px);scrollbar-width:thin;scrollbar-color:#514534 transparent}
    .kga-intro{text-align:center}.kga-club{display:inline-flex;align-items:center;gap:7px;padding:7px 13px;border-radius:99px;background:#3d2800;color:#ffdca8;font:700 10px 'Noto Serif',serif;letter-spacing:.08em;text-transform:uppercase}.kga-intro h1{margin:18px 0 10px;font:600 clamp(29px,8vw,39px)/1.16 'Noto Serif',serif;letter-spacing:-.02em;color:#f7e8d5}.kga-intro p{max-width:390px;margin:0 auto;color:#d5c4ad;font:16px/1.55 'Noto Serif',serif}.kga-perks{display:flex;justify-content:center;flex-wrap:wrap;gap:7px;margin:17px 0 21px}.kga-perks span{padding:8px 11px;border-radius:99px;background:rgb(var(--kg-surface-container-low));color:#d5c4ad;font:13px 'Noto Serif',serif}.kga-social{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.kga-social button{min-height:52px;border:1px solid #ffffff08;border-radius:15px;background:rgb(var(--kg-surface-container-low));color:#e8e0ea;font-size:13px;font-weight:600;cursor:pointer}.kga-divider{display:flex;align-items:center;gap:10px;margin:19px 0;color:#d5c4ad;font:700 11px 'Noto Serif',serif;letter-spacing:.07em}.kga-divider:before,.kga-divider:after{content:'';height:1px;flex:1;background:#ffffff20}.kga-form{display:flex;flex-direction:column;gap:14px}.kga-field label{display:flex;justify-content:space-between;gap:8px;margin-bottom:7px;color:#d5c4ad;font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase}.kga-field label small{color:#9e8e7a;font-size:10px;font-weight:500;text-transform:none;letter-spacing:0}.kga-input{width:100%;height:58px;box-sizing:border-box;padding:0 15px;border:1px solid #ffffff08;border-radius:15px;background:rgb(var(--kg-surface-container-low));color:#fdfbf7;font:15px 'Plus Jakarta Sans',sans-serif;outline:none}.kga-input:focus{border-color:#ffb830;box-shadow:0 0 0 3px #ffb8301c}.kga-password{position:relative}.kga-password .kga-input{padding-right:52px}.kga-eye{position:absolute;right:9px;top:9px;width:40px;height:40px;border:0;border-radius:50%;background:transparent;color:#d5c4ad;font-size:19px;cursor:pointer}.kga-strength{display:flex;gap:6px;margin:9px 3px 5px}.kga-strength i{height:5px;flex:1;border-radius:99px;background:rgb(var(--kg-surface-container-highest))}.kga-strength i.on{background:linear-gradient(90deg,#ffb830,#ffdca8);box-shadow:0 0 8px #ffb83055}.kga-strength-label{display:flex;justify-content:space-between;color:#b3a79a;font-size:11px}.kga-check{display:flex;align-items:flex-start;gap:11px;padding:13px;border-radius:14px;background:rgb(var(--kg-surface-container-low));color:#e8e0ea;font-size:13px;line-height:1.45;cursor:pointer}.kga-check input{width:19px;height:19px;accent-color:#ffb830;flex:none}.kga-check.secondary{padding:4px 2px;background:none;color:#d5c4ad;font-size:12px}.kga-submit{position:relative;width:100%;min-height:60px;margin-top:3px;border:0;border-radius:99px;background:linear-gradient(110deg,#ff4e20,#ff8c00 48%,#ffc107);box-shadow:0 9px 28px #ff8c0038;color:#160e06;font:700 15px 'Noto Serif',serif;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;transition:transform .16s,filter .16s}.kga-submit:hover{filter:brightness(1.08)}.kga-submit:active{transform:scale(.985)}.kga-message{min-height:18px;margin:0;color:#ffcf7a;text-align:center;font-size:12px;line-height:1.5}.kga-message.error{color:#ff9d9d}.kga-foot{text-align:center;color:#b3a79a;font-size:13px}.kga-foot button{padding:4px;border:0;background:none;color:#ffdca8;font:700 15px 'Noto Serif',serif;cursor:pointer}.kga-note{margin:14px 2px 0;color:#9e8e7a;text-align:center;font-size:11px;line-height:1.5}.kga-hidden{display:none!important}
    @media(max-width:390px){.kga-scroll{padding:20px 17px calc(env(safe-area-inset-bottom,0px) + 22px)}.kga-intro p{font-size:14px}.kga-social button{font-size:12px}.kga-brand{font-size:18px}}
  `;
  document.head.appendChild(style);

  const dialog = document.createElement('dialog');
  dialog.id = 'kg-account-dialog';
  dialog.setAttribute('aria-labelledby','kga-title');
  dialog.innerHTML = `<div class="kga-shell"><header class="kga-head"><button type="button" class="kga-back" data-kga-close aria-label="Назад">‹</button><span class="kga-brand">◉ Kinoglobus</span><button type="button" class="kga-mode" data-kga-mode>Войти</button></header><div class="kga-scroll"><section class="kga-intro"><span class="kga-club">✦ Клуб ценителей кино</span><h1 id="kga-title">Откройте мировой кинематограф</h1><p>Отмечайте просмотренные страны на 3D-глобусе, исследуйте редкие шедевры и ведите личный кинодневник.</p><div class="kga-perks"><span>◉ 104 страны</span><span>▣ Синхронизация TMDB</span><span>▤ Кинодневник</span></div></section><div class="kga-social"><button type="button" data-kga-provider="Google">🌐　Google</button><button type="button" data-kga-provider="Apple">●　Apple</button><button type="button" data-kga-provider="Telegram">➤　Telegram</button></div><div class="kga-divider"><span data-kga-divider>ИЛИ ПРОДОЛЖИТЕ С EMAIL</span></div><form class="kga-form" novalidate><div class="kga-field" data-kga-name><label for="kga-name"><span>Имя или псевдоним</span><small>для кинопрофиля</small></label><input class="kga-input" id="kga-name" name="name" autocomplete="name" placeholder="Например, Франсуа Трюффо" maxlength="40"></div><div class="kga-field"><label for="kga-email"><span>Электронная почта или тестовое слово</span><small>Тестовый режим</small></label><input class="kga-input" id="kga-email" name="email" type="text" autocomplete="off" placeholder="name@example.com" required></div><div class="kga-field"><label for="kga-password"><span>Пароль</span></label><div class="kga-password"><input class="kga-input" id="kga-password" name="password" type="password" autocomplete="off" placeholder="Введите пароль" required><button type="button" class="kga-eye" data-kga-eye aria-label="Показать пароль">◉</button></div><div class="kga-strength" aria-hidden="true"><i></i><i></i><i></i></div><div class="kga-strength-label"><span>Надёжность пароля</span><b data-kga-strength>Введите пароль</b></div></div><label class="kga-check" data-kga-recommend><input type="checkbox" name="recommendations" checked><span>Персональные рекомендации<br><small style="color:#b3a79a">Подборки, премьеры и авторское кино</small></span></label><button class="kga-submit" type="submit"><span data-kga-submit>Создать аккаунт　→</span></button><p class="kga-message" aria-live="polite"></p></form><p class="kga-note">Тестовая регистрация. Введите любые слова в поля почты и пароля.</p><div class="kga-foot" style="margin-top:18px"><span data-kga-foot-label>Уже есть аккаунт?</span> <button type="button" data-kga-toggle>Войти</button></div></div></div>`;
  localizeInterfaceMarkup(dialog);
  document.body.appendChild(dialog);

  const form = dialog.querySelector('form');
  const identifier = dialog.querySelector('#kga-email');
  const password = dialog.querySelector('#kga-password');
  const message = dialog.querySelector('.kga-message');
  const open = modeName => {
    if (window.KGOpenDemoProfile()) return;
    if (modeName === 'login') {
      if (dialog.open) dialog.close();
      window.KGOpenLoginPage();
      return;
    }
    if (!dialog.open) dialog.showModal();
    requestAnimationFrame(() => dialog.querySelector('#kga-email').focus({preventScroll:true}));
  };
  window.KGOpenAccountPage = open;
  document.getElementById('kg-account-open')?.addEventListener('click',()=>open('register'));
  document.addEventListener('click',event=>{
    if(event.target.closest('[data-kga-close]'))dialog.close();
    if(event.target.closest('[data-kga-toggle]'))open('login');
    if(event.target.closest('[data-kgs-auth-open]')){event.preventDefault();open(event.target.closest('[data-kgs-auth-open]').dataset.kgsAuthOpen||'register');}
    const provider=event.target.closest('[data-kga-provider]');
    if(provider){message.textContent=uiText("Вход через {provider} станет доступен после подключения авторизации.", {provider: provider.dataset.kgaProvider});message.classList.remove('error');}
  });
  dialog.querySelector('[data-kga-mode]').addEventListener('click',()=>open('login'));
  dialog.querySelector('[data-kga-eye]').addEventListener('click',event=>{
    const visible=password.type==='password';password.type=visible?'text':'password';event.currentTarget.textContent=visible?'◉̸':'◉';event.currentTarget.setAttribute('aria-label',uiText(visible?'Скрыть пароль':'Показать пароль'));
  });
  password.addEventListener('input',()=>{
    const value=password.value;const score=[value.length>=8,/[A-ZА-Я]/.test(value)&&/[a-zа-я]/.test(value),/\d/.test(value),/[^A-Za-zА-Яа-я0-9]/.test(value)].filter(Boolean).length;
    const bars=dialog.querySelectorAll('.kga-strength i');bars.forEach((bar,i)=>bar.classList.toggle('on',i<Math.min(3,score)));
    const words=['Введите пароль','Слабый пароль','Средний пароль','Надёжный пароль','Надёжный пароль'];dialog.querySelector('[data-kga-strength]').textContent=uiText(words[score]);
  });
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const invalid = [identifier, password].find(input => !input.value.trim());
    if (invalid) {
      message.textContent = uiText("Проверьте заполнение обязательных полей.");
      message.classList.add("error");
      invalid.focus();
      return;
    }
    dialog.close();
    window.KGStartDemoSession(uiText("Регистрация завершена"), form.elements.name.value);
  });
  dialog.addEventListener('close', () => {
    form.reset();
    password.type = 'password';
    const eye = dialog.querySelector('[data-kga-eye]');
    eye.textContent = '◉';
    eye.setAttribute('aria-label', uiText('Показать пароль'));
    password.dispatchEvent(new Event('input'));
    message.textContent = '';
    message.classList.remove('error');
  });
  dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
})();
