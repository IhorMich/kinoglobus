/* Visual feedback for the Steel theme, independent of each control's action. */
(() => {
  document.addEventListener("click", event => {
    if (document.documentElement.dataset.kgTheme !== "steel") return;

    const target = event.target;
    if (!(target instanceof Element)) return;

    const control = target.closest("[data-kg-steel-motion]");
    if (control && !control.matches(":disabled, [aria-disabled='true']")) {
      const motion = control.dataset.kgSteelMotion;
      if (motion === "primary" || motion === "quick") {
        control.toggleAttribute("data-kg-steel-selected");
      }
      if (motion === "primary") {
        const arrow = control.querySelector("#btn-spin-secondary-icon");
        if (arrow) {
          const angle = parseInt(arrow.style.getPropertyValue("--kg-steel-arrow-angle"), 10) || 0;
          arrow.style.setProperty("--kg-steel-arrow-angle", `${angle + 360}deg`);
        }
      }

      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        // A tap ends before the sweep can run. Keep it active until it finishes.
        control.removeAttribute("data-kg-steel-sweep");
        control.getBoundingClientRect();
        control.setAttribute("data-kg-steel-sweep", "");
      }
    }

    const card = target.closest('[data-release-action="film"], #kg-home-europe [data-home-act="open"]');
    if (card) card.toggleAttribute("data-kg-steel-selected");
  }, true);

  function finishSweep(event) {
    if (event.animationName === "kg-steel-sweep" && event.pseudoElement === "::after") {
      event.target.removeAttribute("data-kg-steel-sweep");
    }
  }

  document.addEventListener("animationend", finishSweep);
  window.addEventListener("kg-palette-change", () => {
    document.querySelectorAll("[data-kg-steel-sweep]").forEach(control => {
      control.removeAttribute("data-kg-steel-sweep");
    });
  });
})();
