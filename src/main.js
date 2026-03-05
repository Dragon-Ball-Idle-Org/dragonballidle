// ============================================================
// main.js
// Responsabilidade: inicialização — cola todas as camadas
//
// REGRA DE DEPENDÊNCIA (de baixo para cima, nunca ao contrário):
//   utils  →  sem imports internos
//   state  →  importa utils
//   ui     →  importa utils + state
//   main   →  importa tudo e inicializa
// ============================================================
import { initViewport } from "./ui/viewport.js";
import { initPopupListeners, openWinPopup, closeWinPopup } from "./ui/popup.js";
import {
  initSuggestionsListeners,
  openSuggestions,
  closeSuggestions,
  setActiveIndex,
} from "./ui/suggestions.js";
import {
  setupCountdown,
  waitForCharacters,
  getThumbSrc,
  fitAllTypeBoxes,
  scrollToLeftNow,
} from "./ui/helpers.js";
import { createGuessBox, handleGuess } from "./ui/guess-box.js";
import {
  ensureWinsBadgeCSS,
  startWinsPolling,
  scheduleMidnightRefresh,
  showInlineWinSummary,
} from "./ui/wins.js";
import { loadSagaOrderByCSV } from "./ui/saga.js";
import { initHoverTooltip } from "./ui/tooltip.js";
import {
  hardReloadClearCaches,
  startMidnightCheck,
  doDailyResetState,
  getDailyCharacter,
  getCharacterForDay,
  isGameWon,
  getSavedGuesses,
  getRandomCharacter,
} from "./state/game-state.js";
import { getCurrentLang } from "./utils/lang.js";
import { todayBrasiliaKey, getBrasiliaTime, formatYMD } from "./utils/date.js";
import { doDailyResetUi, ensureDailyResetOnBoot } from "./ui/reset.js";

// Breakpoint onde telas "pequenas" não devem rolar para a direita
const STICK_LEFT_BP = 768;

// ── Bootstrap de UI independente de dados ────────────────────────────────────
initViewport();

// ── Refs de DOM (resolvidos uma vez no topo) ──────────────────────────────────
const getInput = document.getElementById("search");
const getSubmitGuess = document.getElementById("submit-button");
const form = document.getElementById("guess-form");
const attributeContainer = document.getElementById("attribute-container");
const tryNumber = document.getElementById("nTry");

// ── Estado local de UI ────────────────────────────────────────────────────────
let tryCount = 1;
let activeIndex = -1;
let currentItems = [];
let usingMouse = false;

// ── Event listeners do input ─────────────────────────────────────────────────

/* Faz com que nao de reload na pagina ao clicar no botal de adivinhar */
form.addEventListener("submit", (e) => e.preventDefault());

getSubmitGuess.addEventListener("click", () => {
  const userInput = (getInput.value || "").trim();
  if (!userInput) {
    // <- bloqueia vazio
    closeSuggestions();
    return;
  }
  handleGuess(userInput, attributeContainer, tryNumber, (v) => {
    getInput.value = v;
  });
  closeSuggestions();
});

getInput.addEventListener("keydown", (e) => {
  const suggestions = document.getElementById("suggestions");
  if (!suggestions?.classList.contains("open") || !suggestions.children.length)
    return;
  // Impede a página ou o container rolarem com as setas
  if (["ArrowDown", "ArrowUp", "Enter", "Escape"].includes(e.key))
    e.preventDefault();

  if (e.key === "ArrowDown") {
    usingMouse = false;
    activeIndex = setActiveIndex(activeIndex + 1, activeIndex);
  } else if (e.key === "ArrowUp") {
    usingMouse = false;
    activeIndex = setActiveIndex(activeIndex - 1, activeIndex);
  } else if (e.key === "Enter") {
    if (activeIndex >= 0) {
      const li = suggestions.children[activeIndex];
      const name =
        li?.dataset?.name || li?.querySelector("span")?.textContent || "";
      if (name) {
        handleGuess(name, attributeContainer, tryNumber, (v) => {
          getInput.value = v;
        });
        closeSuggestions();
        getInput.value = "";
      }
    }
  } else if (e.key === "Escape") {
    closeSuggestions();
  }
});

getInput.addEventListener("input", async () => {
  const query = getInput.value.toLowerCase().trim();
  const suggestions = document.getElementById("suggestions");
  suggestions.innerHTML = "";
  activeIndex = -1;
  currentItems = [];

  if (!query) {
    closeSuggestions();
    return;
  }

  // garante que o banco existe antes de filtrar
  let pool = window.characters;
  if (!pool || !Array.isArray(pool)) {
    try {
      pool = await waitForCharacters(15000);
    } catch {
      closeSuggestions();
      return;
    }
  }

  const filtered = pool
    .filter((c) => (c.name || "").toLowerCase().includes(query))
    .sort((a, b) => {
      const nA = (a.name || "").toLowerCase();
      const nB = (b.name || "").toLowerCase();

      // Prioriza os que começam com a busca
      if (nA.startsWith(query) && !nB.startsWith(query)) return -1;
      if (!nA.startsWith(query) && nB.startsWith(query)) return 1;

      // Se ambos começam ou nenhum começa, ordena por nome
      return nA.localeCompare(nB);
    });

  if (!filtered.length) {
    closeSuggestions();
    return;
  }

  // Monta itens ...
  filtered.forEach((c, idx) => {
    const li = document.createElement("li");
    li.dataset.name = c.name;

    const img = document.createElement("img");
    img.src = getThumbSrc(c.image);
    img.width = 56;
    img.height = 56;
    img.className = "thumb";
    img.loading = "lazy";

    const span = document.createElement("span");
    span.textContent = c.name;

    li.appendChild(img);
    li.appendChild(span);

    li.addEventListener("mouseenter", () => {
      usingMouse = true;
      activeIndex = setActiveIndex(idx, activeIndex);
    });
    li.addEventListener("mousemove", () => {
      usingMouse = true;
    });
    li.addEventListener("click", () => {
      handleGuess(c.name, attributeContainer, tryNumber, (v) => {
        getInput.value = v;
      });
      closeSuggestions();
      getInput.value = "";
    });

    suggestions.appendChild(li);
  });

  openSuggestions();
  currentItems = Array.from(suggestions.querySelectorAll("li"));
});

// ── DOMContentLoaded principal ────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", async () => {
  try {
    window.characters = await waitForCharacters(5000);
  } catch (e) {
    console.error(e);
    return;
  }

  getDailyCharacter();
  ensureDailyResetOnBoot();
  initPopupListeners();
  initHoverTooltip();
  initSuggestionsListeners(getInput, form);

  // expõe globals de debug
  if (window.DBZ_DEBUG) {
    window.openWinPopup = openWinPopup;
    window.closeWinPopup = closeWinPopup;
    window.getDailyCharacter = getDailyCharacter;
    window.todayBrasiliaKey = todayBrasiliaKey;
    window.ensureDailyResetOnBoot = ensureDailyResetOnBoot;
    window.getBrasiliaTime = getBrasiliaTime;
    window.doDailyReset = () => {
      doDailyResetUi();
      doDailyResetState();
    };
    window.__getChar = () => getRandomCharacter();
    window.reseedDaily = (ymd) => {
      if (ymd && /^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
        window.DBZ_DEBUG.forceYMD = ymd;
        localStorage.setItem("forceYMD", ymd);
      }
      const char = getDailyCharacter();
      console.log(
        "Seed do dia:",
        todayBrasiliaKey(),
        "Personagem:",
        char?.name,
      );
    };
  }

  ensureWinsBadgeCSS();
  startWinsPolling();
  scheduleMidnightRefresh();

  // ── Personagem de ontem ─────────────────────────────────────────────────────
  try {
    const d = getBrasiliaTime();
    d.setDate(d.getDate() - 1);
    const yesterdayChar = getCharacterForDay(formatYMD(d));
    const yWrap = document.getElementById("yesterday-container");
    const yName = document.getElementById("yesterday-name");
    const yThumb = document.getElementById("yesterday-thumb");
    if (yWrap && yName && yThumb && yesterdayChar) {
      yName.textContent = yesterdayChar.name;
      yThumb.src = getThumbSrc(yesterdayChar.image);
      // yThumb.src =
      //   typeof getThumbSrc === "function"
      //     ? getThumbSrc(yesterdayChar.image)
      //     : "/thumbs/" +
      //       String(yesterdayChar.image || "")
      //         .split("/")
      //         .pop();
      yThumb.alt = yesterdayChar.name + " (yesterday)";
      yWrap.hidden = false;
    }
  } catch (e) {
    console.error("Erro ao carregar personagem de ontem:", e);
  }

  // ── Idioma + saga order ─────────────────────────────────────────────────────
  const lang = getCurrentLang(
    location.pathname,
    document.documentElement.getAttribute("lang"),
  );
  await loadSagaOrderByCSV(lang);

  // ── Detecta reload ──────────────────────────────────────────────────────────
  const navEntry = window.performance.getEntriesByType("navigation")[0];
  const legacyNav = window.performance.navigation || {};
  const isReload = navEntry?.type === "reload" || legacyNav.type === 1;

  // ── Restore de chutes salvos ────────────────────────────────────────────────
  const savedGuesses = getSavedGuesses();
  tryCount = Math.max(1, savedGuesses.length);
  if (tryNumber) tryNumber.innerHTML = tryCount;

  if (savedGuesses.length > 0) attributeContainer.classList.add("show-attrs");
  else attributeContainer.classList.remove("show-attrs");

  for (let i = 0; i < savedGuesses.length; i++) {
    const token = savedGuesses[i];
    let itemFound = window.characters.find((c) => (c.id || "") === token);
    if (!itemFound)
      itemFound = window.characters.find(
        (c) => (c.name || "").toLowerCase() === String(token).toLowerCase(),
      );
    if (itemFound) createGuessBox(itemFound);
  }

  fitAllTypeBoxes();

  if (savedGuesses.length) {
    const scroller = document.querySelector(".guess-container");
    if (scroller) {
      scroller.classList.add("scroll-on", "panel-active");
      if (window.innerWidth < STICK_LEFT_BP) scrollToLeftNow(scroller);
    }
  }

  // Se o usuário virar o celular/resize p/ menor, mantenha colado à esquerda
  window.addEventListener("resize", () => {
    if (window.innerWidth < STICK_LEFT_BP) {
      scrollToLeftNow(document.querySelector(".guess-container"));
    }
  });

  // ── Restaura UI de vitória após reload ─────────────────────────────────────
  if (isGameWon()) {
    getInput.disabled = true;
    const randomCharacter = getRandomCharacter();
    const clipCharacterImage = document.getElementById("clip-character-image");
    if (clipCharacterImage)
      clipCharacterImage.src = `${randomCharacter.image}`;
    const tryCountEl = document.getElementById("try-count");
    const charNameEl = document.getElementById("character-name");
    if (tryCountEl) tryCountEl.textContent = String(tryCount);
    if (charNameEl) charNameEl.textContent = randomCharacter.name;
    openWinPopup();
    showInlineWinSummary(tryCount);
    setupCountdown();
  }
});

document.addEventListener("midnightBrasilia", () => {
  doDailyResetState();
  doDailyResetUi();
  hardReloadClearCaches();
});

// ── Init ──────────────────────────────────────────────────────────────────────
window.DBZ_DEBUG = window.DBZ_DEBUG || {};
startMidnightCheck();
if (!localStorage.getItem("lastResetDay")) {
  localStorage.setItem("lastResetDay", todayBrasiliaKey());
}

// TODO: Verificar porque existe esse metodo sem ser usado
// Encontra o container real da grade de chutes, independente do id/classe
// function getGuessesHost() {
//   const el =
//     document.getElementById("guesses-container") || // que usei no patch anterior
//     document.getElementById("guesses") ||
//     document.getElementById("guessesGrid") ||
//     document.querySelector(".guesses-container") ||
//     document.querySelector("#guesses .rows") ||
//     document.querySelector("#grid .rows") ||
//     document.querySelector("#grid") ||
//     document.querySelector('[data-role="guesses"]');

//   if (!el) {
//     console.error(
//       "Guesses host not found — ajuste o seletor aqui para o seu HTML.",
//     );
//     throw new Error("Guesses host not found");
//   }
//   return el;
// }

/*teste personagem*/

/*const headers = document.getElementById("headers");
headers.innerHTML = randomCharacter.name;
headers.style.color = "white";*/
