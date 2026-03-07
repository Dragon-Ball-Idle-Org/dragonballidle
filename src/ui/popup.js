import { getRandomCharacter, getTryCount } from "../state/game-state.js";
import { formatPopupLineI18n } from "../utils/i18n.js";

function getEls() {
  return {
    popup: document.getElementById("win-game"),
    crystal: document.getElementById("clip-character-popup"),
    closeX: document.getElementById("close-popup"),
    image: document.getElementById("clip-character-image"),
    tryCountEl: document.getElementById("try-count"),
    charNameEl: document.getElementById("character-name"),
    winLine: document.querySelector(".win-line"),
  };
}

export function openWinPopup() {
  const { popup, crystal, image, tryCountEl, charNameEl, winLine } = getEls();
  const character = getRandomCharacter();
  const tries = getTryCount();

  // preenche conteúdo
  if (image && character) image.src = `/${character.image}`;
  if (tryCountEl) tryCountEl.textContent = String(tries);
  if (charNameEl && character) charNameEl.textContent = character.name;
  if (winLine) {
    const strings = window.LOCALE ?? {};
    const tpl = formatPopupLineI18n(tries, strings);
    winLine.innerHTML = tpl.replace(
      /\{tries\}/g,
      `<strong id="try-count">${tries}</strong>`,
    );
  }

  // exibe com animação
  if (popup) {
    popup.style.display = "block";
    popup.classList.remove("show");
    void popup.offsetWidth; // força reflow para reiniciar CSS
    popup.classList.add("show");
  }

  if (crystal) {
    crystal.style.display = "block";
    crystal.classList.remove("show");
    void crystal.offsetWidth;
    requestAnimationFrame(() => crystal.classList.add("show"));
  }
}

export function closeWinPopup() {
  const { popup, crystal } = getEls();

  if (popup) {
    popup.style.display = "none";
    popup.classList.remove("show");
  }

  if (crystal) {
    crystal.style.display = "none";
    crystal.classList.remove("show");
  }
}

/** Registra listeners de fechamento (X, clique fora, ESC) */
export function initPopupListeners() {
  const { popup, closeX } = getEls();
  const card = popup?.querySelector(".win-card");

  // botão X
  closeX?.addEventListener("click", (e) => {
    e.preventDefault();
    closeWinPopup();
  });

  // clique fora do card
  document.addEventListener("mousedown", (ev) => {
    if (!popup?.classList.contains("show")) return;
    if (card && !card.contains(ev.target)) closeWinPopup();
  });

  // tecla ESC
  document.addEventListener("keydown", (ev) => {
    if (!popup?.classList.contains("show")) return;
    if (ev.key === "Escape") closeWinPopup();
  });

  // garante estado inicial oculto
  popup?.classList.remove("show");
  document.getElementById("clip-character-popup")?.classList.remove("show");
}
