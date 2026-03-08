export function setDocumentLang(lang) {
  document.documentElement.lang = lang;
}

export function applyStrings(dict) {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) el.textContent = dict[key];
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (dict[key]) el.setAttribute("placeholder", dict[key]);
  });
}

export async function loadLocaleStrings(lang) {
  const url = `/locales/${lang}.json`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load locale " + lang);
  const dict = await res.json();
  window.LOCALE = dict;
  return dict;
}
