import { getRandomCharacter, getTryCount } from "../state/game-state.js";

const CHAR_IMG_BASE = "/public/";

// TODO: Método criado pela IA, validas se atende as necessidades do projeto
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

// TODO: Original
// export function openWinPopup() {
//   popup.classList.add("show"); // mostra o overlay + card
//   requestAnimationFrame(() => {
//     // dá 1 frame para layout assentar, então “foca” a bolinha
//     crystal.classList.add("show");
//   });
// }
// TODO: IA gerou um código diferente, validar porque
export function openWinPopup() {
  const { popup, crystal, image, tryCountEl, charNameEl, winLine } = getEls();
  const character = getRandomCharacter();
  const tries = getTryCount();

  // preenche conteúdo
  if (image && character) image.src = `${CHAR_IMG_BASE}${character.image}`;
  if (tryCountEl) tryCountEl.textContent = String(tries);
  if (charNameEl && character) charNameEl.textContent = character.name;
  if (winLine) {
    const plural = tries === 1 ? "try" : "tries";
    winLine.innerHTML = `You guessed today's Dragon Ball character in <strong id="try-count">${tries}</strong> ${plural}:`;
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

// TODO: Original
// export function closeWinPopup() {
//   const popup = document.getElementById("win-game");
//   if (!popup) return;
//   popup.style.display = "none";
//   popup.classList.remove("show");

//   const crystal = document.getElementById("clip-character-popup");
//   if (crystal) {
//     crystal.style.display = "none";
//     crystal.classList.remove("show");
//   }

//   const wonTab = document.getElementById("won-container");
//   if (wonTab) {
//     wonTab.style.display = "none";
//     wonTab.classList.remove("show");
//   }
// }
// TODO: IA gerou um código diferente, validar porque
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

  const wonTab = document.getElementById("won-container");
  if (wonTab) {
    wonTab.style.display = "none";
    wonTab.classList.remove("show");
  }
}

// TODO: Método criado pela IA, validas se atende as necessidades do projeto
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
