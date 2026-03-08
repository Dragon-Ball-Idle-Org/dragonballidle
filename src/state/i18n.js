import { DEFAULT_LANG } from "../utils/i18n.js";

let currentLang = null;

export function persistLang(lang) {
  localStorage.setItem("lang", lang);
  currentLang = lang;
}

export function getCurrentLang() {
  if (!currentLang) {
    currentLang = localStorage.getItem("lang");
  }

  return currentLang;
}
