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
