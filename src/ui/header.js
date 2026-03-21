import { getCurrentLang } from "../state/i18n.js";
import { persistLang } from "../state/i18n.js";
import { getLangFromPath } from "../utils/lang.js";
import { loadSVG } from "./utils.js";

export function initLangMenu() {
  const btn = document.getElementById("lang-fixed");
  const menu = document.getElementById("lang-menu");
  const flag = document.getElementById("current-flag");
  const itens = document.querySelectorAll(".lang-item");
  if (!btn || !menu || !flag || !itens) return;

  const FLAG_BY_LANG = {
    "pt-br": "/assets/flags/pt-br.svg",
    "en-us": "/assets/flags/en-us.svg",
    "es-es": "/assets/flags/es-es.svg",
    "fr-fr": "/assets/flags/fr-fr.svg",
    "it-it": "/assets/flags/it-it.svg",
    "de-de": "/assets/flags/de-de.svg",
    "ru-ru": "/assets/flags/ru-ru.svg",
    "tr-tr": "/assets/flags/tr-tr.svg",
    "uk-ua": "/assets/flags/uk-ua.svg",
    "ar-sa": "/assets/flags/ar-sa.svg",
    "ja-jp": "/assets/flags/ja-jp.svg",
    "ko-kr": "/assets/flags/ko-kr.svg",
    "hi-in": "/assets/flags/hi-in.svg",
    "th-th": "/assets/flags/th-th.svg",
    "vi-vn": "/assets/flags/vi-vn.svg",
    "id-id": "/assets/flags/id-id.svg",
    "zh-cn": "/assets/flags/zh-cn.svg",
    "zh-tw": "/assets/flags/zh-tw.svg",
    "fil-ph": "/assets/flags/fil-ph.svg",
    "ms-my": "/assets/flags/ms-my.svg",
  };

  let currentLang = getCurrentLang();
  if (!currentLang) {
    currentLang = getLangFromPath(window.location.pathname);
    persistLang(currentLang);
  }

  // Mostra a bandeira atual no botão
  flag.src = FLAG_BY_LANG[currentLang] || FLAG_BY_LANG["en-us"];
  flag.alt = currentLang.toUpperCase();

  function openMenu() {
    menu.hidden = false;
    btn.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    menu.hidden = true;
    btn.setAttribute("aria-expanded", "false");
  }

  function toggleMenu() {
    (menu.hidden ? openMenu : closeMenu)();
  }

  document.addEventListener("click", (e) => {
    if (menu.hidden) return;
    if (e.target === btn || menu.contains(e.target)) return;
    closeMenu();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  itens.forEach((item) => {
    item.addEventListener("click", (e) => {
      const pathname = new URL(item.href).pathname;
      const normalizedLang = getLangFromPath(pathname);
      persistLang(normalizedLang);
    });
  });

  const TOOLTIP = {
    "pt-br": "Mudar idioma",
    "en-us": "Change language",
    "es-es": "Cambiar idioma",
  };
  btn.title = TOOLTIP[currentLang] || TOOLTIP["en-us"];
}

export async function initBackButton() {
  const btn = document.getElementById("back-button");
  if (!btn) return;

  await loadSVG("/assets/arrow-fat-left.svg", btn);

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    if (
      document.referrer &&
      new URL(document.referrer).origin === window.location.origin
    ) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  });
}
