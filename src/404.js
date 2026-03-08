import { getLangFromPath } from "./i18n.js";

// Ajusta idioma e rótulos conforme a rota
export function init404Page() {
  const lang = getLangFromPath();

  const t = {
    "en-us": {
      title: "404 — Page not found",
      line: "Yamcha blew up and this page doesn't exist anymore.",
      home: "⛩️ Go to homepage",
      href: "/en-us/",
    },
    "pt-br": {
      title: "404 — Página não encontrada",
      line: "Gotenks errou a fusão — e esta página não existe.",
      home: "⛩️ Ir para a página inicial",
      href: "/pt-br/",
    },
    "es-es": {
      title: "404 — Página no encontrada",
      line: "Gotenks falló la fusión — y esta página no existe.",
      home: "⛩️ Ir a la página principal",
      href: "/es-es/",
    },
  }[lang] || {
    // Fallback genérico para as outras +-17 linguagens para não quebrar a página
    title: "404 — Page not found",
    line: "Yamcha blew up and this page doesn't exist anymore.",
    home: "⛩️ Go to homepage",
    href: `/${lang}/`,
  };

  const titleEl = document.getElementById("t-title");
  const lineEl = document.getElementById("t-line");
  const linkEl = document.getElementById("home-link");

  if (titleEl) titleEl.textContent = t.title;
  if (lineEl) lineEl.textContent = t.line;
  if (linkEl) {
    linkEl.textContent = t.home;
    linkEl.setAttribute("href", t.href);
  }
}

init404Page();
