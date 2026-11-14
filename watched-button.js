(() => {
  const translate = typeof uiText === "function" ? uiText : (text => text);
  const markLabel = translate("Отметить как просмотренный");
  const removeLabel = translate("Снять отметку о просмотре");

  function content(watched) {
    const ring = watched
      ? '<path d="M21 12a9 9 0 1 1-5.5-8.3"/>'
      : '<circle cx="12" cy="12" r="9"/>';
    const check = watched ? "m8 11 4 4 9-9" : "m8 12 3 3 5-6";
    return `<svg class="kg-watched-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ring}<path d="${check}"/></svg><span>${translate(watched ? "Просмотрено ✓" : "Посмотрел")}</span>`;
  }

  window.KGWatchedButtonHtml = (watched, attributes) => {
    const label = watched ? removeLabel : markLabel;
    return `<button type="button" class="kg-watched-button" ${attributes} aria-pressed="${!!watched}" aria-label="${label}" title="${label}">${content(watched)}</button>`;
  };

  window.KGPaintWatchedButton = (button, watched) => {
    if (!button) return;
    const label = watched ? removeLabel : markLabel;
    button.setAttribute("aria-pressed", String(!!watched));
    button.setAttribute("aria-label", label);
    button.title = label;
    button.innerHTML = content(watched);
    button.disabled = false;
  };
})();
