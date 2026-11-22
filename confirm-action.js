/* Shared confirmations for removing saved actions. */
(() => {
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let activeDialog=null;
  window.KGConfirmRemoval=({kind,title,onSettings})=>{
    if(activeDialog?.open)return Promise.resolve(false);
    const watched=kind==='watched',note=kind==='note',follow=kind==='follow',opener=document.activeElement;
    const heading=uiText(watched?'Снять отметку «Просмотрено»?':note?'Удалить заметку?':follow?'Перестать следить?':'Убрать из закладок?');
    const confirmLabel=uiText(watched?'Снять отметку':note?'Удалить':follow?'Перестать следить':'Убрать');
    const dialog=document.createElement('dialog');
    dialog.className='kg-confirm-dialog';dialog.setAttribute('aria-labelledby','kg-removal-title');
    dialog.innerHTML=`<h2 id="kg-removal-title">${esc(heading)}</h2><p>${esc(title||uiText('Фильм'))}</p><div class="kg-confirm-actions"><button type="button" data-removal-cancel autofocus>${uiText('Отмена')}</button><button type="button" data-removal-confirm>${esc(confirmLabel)}</button>${onSettings?`<button type="button" data-removal-settings>${esc(uiText("Настройки"))}</button>`:""}</div>`;
    activeDialog=dialog;document.body.append(dialog);
    return new Promise(resolve=>{
      let finished=false;
      const finish=(approved=false,showSettings=false)=>{
        if(finished)return;
        finished=true;
        if(dialog.open)dialog.close();
        activeDialog=null;
        dialog.remove();
        if(opener?.isConnected)opener.focus({preventScroll:true});
        resolve(approved);
        if(showSettings)onSettings?.();
      };
      dialog.addEventListener('click',event=>{
        if(event.target.closest('[data-removal-confirm]'))finish(true);
        else if(event.target.closest('[data-removal-settings]'))finish(false,true);
        else if(event.target.closest('[data-removal-cancel]'))finish();
      });
      dialog.addEventListener('close',()=>finish(),{once:true});
      dialog.showModal();
    });
  };
})();
