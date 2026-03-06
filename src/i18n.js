// src/i18n.js
const SUPPORTED = [
  "pt-br",
  "en-us",
  "es-es", // os 3 que já existiam
  "fr-fr",
  "it-it",
  "de-de",
  "ru-ru",
  "tr-tr",
  "uk-ua",
  "ar-sa",
  "ja-jp",
  "ko-kr",
  "hi-in",
  "th-th",
  "vi-vn",
  "id-id",
  "zh-cn",
  "zh-tw",
  "fil-ph",
  "ms-my", // os 16 novos
];
const DEFAULT_LANG = "en-us";

export function getLangFromPath(pathname = location.pathname) {
  const rx = new RegExp("^/(" + SUPPORTED.join("|") + ")(/|$)");
  const m = pathname.toLowerCase().match(rx);
  if (m) return m[1];
  return localStorage.getItem("lang") || DEFAULT_LANG;
}

// characters-[lang].js onde o hífen vira para "_"
// pt-br -> characters-pt_br.js | en-us -> characters-en_us.js | fr-fr -> characters-fr_fr.js
export function langToCharsFile(lang = DEFAULT_LANG) {
  const code = String(lang || DEFAULT_LANG).toLowerCase();
  return `characters-${code.replace("-", "_")}.js`;
}

export function applyStrings(dict) {
  // exemplo de binding por data-i18n
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) el.textContent = dict[key];
  });
  // placeholders
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (dict[key]) el.setAttribute("placeholder", dict[key]);
  });
}

export function setDocumentLang(lang) {
  document.documentElement.lang = lang; // <html lang="...">
}

export function persistLang(lang) {
  localStorage.setItem("lang", lang);
}

export async function loadLocaleStrings(lang) {
  const url = `/locales/${lang}.json`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load locale " + lang);
  const dict = await res.json();
  window.LOCALE = dict; // deixa disponível para outras funções
  return dict;
}
