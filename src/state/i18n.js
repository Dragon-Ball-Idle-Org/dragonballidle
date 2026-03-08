import { DEFAULT_LANG, SUPPORTED } from "../utils/i18n.js";

export function persistLang(lang) {
  localStorage.setItem("lang", lang);
}

export function getLangFromPath(pathname = location.pathname) {
  const rx = new RegExp("^/(" + SUPPORTED.join("|") + ")(/|$)");
  const m = pathname.toLowerCase().match(rx);
  if (m) return m[1];
  return localStorage.getItem("lang") || DEFAULT_LANG;
}