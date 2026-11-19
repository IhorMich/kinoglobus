/* One removal confirmation for watched films and bookmarks throughout the app. */
(() => {
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let activeDialog=null;
  window.KGConfirmRemoval=({kind,title})=>{
    if(activeDialog?.open)return Promise.resolve(false);
    const watched=kind==='watched',note=kind==='note',opener=document.activeElement;
    const heading=uiText(watched?'Снять отметку «Просмотрено»?':note?'Удалить заметку?':'Убрать из закладок?');
    const confirmLabel=uiText(watched?'Снять отметку':note?'Удалить':'Убрать');
    const dialog=document.createElement('dialog');
    dialog.className='kg-confirm-dialog';dialog.setAttribute('aria-labelledby','kg-removal-title');
    dialog.innerHTML=`<h2 id="kg-removal-title">${esc(heading)}</h2><p>${esc(title||uiText('Фильм'))}</p><div class="kg-confirm-actions"><button type="button" data-removal-cancel autofocus>${uiText('Отмена')}</button><button type="button" data-removal-confirm>${esc(confirmLabel)}</button></div>`;
    activeDialog=dialog;document.body.append(dialog);
    return new Promise(resolve=>{
      let approved=false;
      dialog.addEventListener('click',event=>{
        if(event.target.closest('[data-removal-confirm]')){approved=true;dialog.close();}
        else if(event.target.closest('[data-removal-cancel]'))dialog.close();
      });
      dialog.addEventListener('close',()=>{
        activeDialog=null;dialog.remove();
        if(opener?.isConnected)opener.focus({preventScroll:true});
        resolve(approved);
      },{once:true});
      dialog.showModal();
    });
  };
})();
