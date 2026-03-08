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
import { initFormEventListeners } from "./ui/form.js";
import { initDetailsTagBehaviorsListener } from "./ui/details.js";

// Breakpoint onde telas "pequenas" não devem rolar para a direita
const STICK_LEFT_BP = 768;

// ── Bootstrap de UI independente de dados ────────────────────────────────────
initViewport();

const guessInput = document.getElementById("search");

document.addEventListener("DOMContentLoaded", async () => {
  try {
    window.characters = await waitForCharacters(5000);
  } catch (e) {
    console.error(e);
    return;
  }

  getDailyCharacter();
  ensureDailyResetOnBoot();
  initFormEventListeners();
  initPopupListeners();
  initHoverTooltip();
  initSuggestionsListeners();
  initDetailsTagBehaviorsListener();

  // expõe globals de debug
  if (import.meta.env.DEV) {
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
        import.meta.env.VITE_FORCE_YMD = ymd;
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
      yThumb.alt = yesterdayChar.name + " (yesterday)";
      yWrap.hidden = false;
    }
  } catch (e) {
    console.error("Erro ao carregar personagem de ontem:", e);
  }

  const lang = getCurrentLang(
    location.pathname,
    document.documentElement.getAttribute("lang"),
  );
  await loadSagaOrderByCSV(lang);

  const savedGuesses = getSavedGuesses();
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

  if (isGameWon()) {
    guessInput.disabled = true;
    openWinPopup();
    showInlineWinSummary();
    setupCountdown();
  }
});

document.addEventListener("midnightBrasilia", () => {
  doDailyResetState();
  doDailyResetUi();
  hardReloadClearCaches();
});

// ── Init ──────────────────────────────────────────────────────────────────────
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
