#settings.kgs-dialog:not([open]) {
  display: none;
}

#settings.kgs-dialog[open] {
  position: fixed;
  inset: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  width: 100%;
  max-width: none;
  height: 100dvh;
  max-height: none;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 0;
  overflow: hidden;
  color-scheme: dark;
  background: #07060a;
  font-family: "Plus Jakarta Sans", sans-serif;
  -webkit-tap-highlight-color: transparent;
}

.kgs-scroll .font-micro-caption {
  font-family: inherit;
}

.kgs-dialog::backdrop {
  background: #07060a;
}

.kgs-dialog > header {
  padding-top: calc(.75rem + env(safe-area-inset-top));
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.kgs-scroll {
  overflow: auto;
  overscroll-behavior: contain;
  padding-inline: max(1rem, env(safe-area-inset-left)) max(1rem, env(safe-area-inset-right));
  padding-bottom: 4rem;
  scrollbar-width: thin;
  scrollbar-color: rgb(255 184 48 / .25) transparent;
}

.kgs-nav > nav {
  position: static;
}

.kgs-nav > nav > div {
  max-width: none;
}

.kgs-gold-shadow {
  box-shadow: 0 0 12px rgb(255 184 48 / .35);
}

.kgs-dialog .kgs-select :is(option, optgroup) {
  background-color: #221e26;
  color: #e8e0ea;
}

.kgs-dialog .kgs-key-status {
  display: flex;
  color: #34d399;
}

.kgs-key-status::before {
  content: "";
  width: .375rem;
  height: .375rem;
  flex: none;
  border-radius: 50%;
  background: currentColor;
}

.kgs-dialog .kgs-missing-key {
  color: #ffdca8;
}

.kgs-dialog [data-kgs-api-badge].kgs-missing-key {
  border-color: rgb(255 184 48 / .3);
  background-color: rgb(255 184 48 / .08);
}

.kgs-dialog .kgs-reel-choice[aria-checked="true"] {
  border-color: rgb(255 184 48 / .4);
  background: linear-gradient(to right, rgb(255 184 48 / .15), transparent);
}

.kgs-reel-choice[aria-checked="true"] .kgs-reel-title {
  color: #ffb830;
  font-family: "Noto Serif", serif;
  font-weight: 700;
  letter-spacing: .025em;
}

.kgs-reel-choice[aria-checked="true"] .kgs-reel-radio {
  border: 2px solid #ffb830;
  display: grid;
  place-items: center;
}

.kgs-reel-choice[aria-checked="true"] .kgs-reel-radio::after {
  content: "";
  width: .5rem;
  height: .5rem;
  border-radius: 50%;
  background: #ffb830;
}

.kgs-switch {
  flex: none;
  width: 2.75rem;
  height: 1.5rem;
  padding: .125rem;
  border-radius: 999px;
}

.kgs-switch > span {
  display: block;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  background: #d5c4ad;
  transition: transform .2s ease;
}

.kgs-switch[aria-checked="true"] {
  box-shadow: 0 0 12px rgb(255 184 48 / .35);
}

.kgs-switch[aria-checked="true"] > span {
  transform: translateX(1.25rem);
  background: #281900;
}

.kgs-dialog [data-kgs-mode][aria-pressed="true"] {
  box-shadow: 0 0 12px rgb(255 184 48 / .35);
}

.kgs-dialog :is(button, input, a, select):focus-visible {
  outline: 2px solid #ffb830;
  outline-offset: 2px;
}

.kgs-dialog :is(button, input):disabled {
  cursor: not-allowed;
}

.kgs-dialog [data-purpose="theme-and-visual-style"] .theme-title {
  overflow-wrap: anywhere;
}
