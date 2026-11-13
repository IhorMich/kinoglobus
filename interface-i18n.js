// Russian source strings serve as the fallback for each interface translation.
const interfaceLanguages = Object.freeze({ru: "Русский", en: "English"});
const interfaceLanguageKey = "kgInterfaceLanguage";
const interfaceLanguage = (() => {
  try {
    const value = JSON.parse(localStorage.getItem(interfaceLanguageKey));
    if (Object.hasOwn(interfaceLanguages, value)) return value;
  } catch (_) {}
  return "ru";
})();
document.documentElement.lang = interfaceLanguage;
const interfaceRegionNames = new Intl.DisplayNames([interfaceLanguage], {type: "region"});

function uiText(source, values = {}) {
  const dictionary = window.KGInterfaceDictionaries?.[interfaceLanguage];
  const message = dictionary && Object.hasOwn(dictionary, source) ? dictionary[source] : source;
  return message.replace(/\{(\w+)\}/g, (token, name) =>
    Object.hasOwn(values, name) ? String(values[name]) : token
  );
}

// Run on static interface markup before a screen fills in film or user data.
function localizeInterfaceMarkup(root) {
  if (interfaceLanguage === "ru" || !root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.parentElement.closest("script, style, [data-interface-native-name]")) continue;
    const source = node.data.trim();
    if (source) node.data = node.data.replace(source, () => uiText(source.replace(/\s+/g, " ")));
  }
  const attributes = ["aria-label", "title", "placeholder", "alt", "label"];
  const selector = attributes.map(attribute => `[${attribute}]`).join(",");
  for (const node of [root, ...root.querySelectorAll(selector)]) {
    for (const attribute of attributes) {
      if (node.hasAttribute(attribute)) node.setAttribute(attribute, uiText(node.getAttribute(attribute)));
    }
  }
}
