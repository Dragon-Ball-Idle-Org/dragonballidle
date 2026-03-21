import { getCurrentLang } from "../state/i18n";

export function initFooter() {
  const yearEl = document.getElementById("currentYear");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const legalInfoEl = document.getElementById("legal-info-anchor");
  if (legalInfoEl) {
    const lang = getCurrentLang();
    const threatedLang = lang
      .split("-")
      .map((p, i) => (i === 1 ? p.toUpperCase() : p))
      .join("-");
    legalInfoEl.href = `https://dragonaballdle.site/${threatedLang}/legal`;
  }
}
