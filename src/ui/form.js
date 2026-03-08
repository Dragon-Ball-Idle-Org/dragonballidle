import { getSavedGuesses } from "../state/game-state";
import { handleGuess } from "./guess-box";
import { getThumbSrc } from "./helpers";
import {
  closeSuggestions,
  openSuggestions,
  setActiveIndex,
} from "./suggestions";

let activeIndex = -1;
let currentItems = [];
let usingMouse = false;

export function initFormEventListeners() {
  _formPreventDefaultSubmitListenerInit();

  _submitButtonOnClickListenerInit();

  _guessInputListenerInit();
}

function _guessInputListenerInit() {
  _onChangeTextGuessInputListenerInit();
  _onMoveToSuggestionByKeyboardListenerInit();
}

function _onChangeTextGuessInputListenerInit() {
  const guessInput = document.getElementById("search");
  guessInput.addEventListener("input", async () => {
    const query = guessInput.value.toLowerCase().trim();
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

    const guesses = getSavedGuesses();
    const filtered = pool
      .filter(
        (c) =>
          !guesses.includes(c.id) &&
          (c.name || "").toLowerCase().includes(query),
      )
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
          guessInput.value = v;
        });
        closeSuggestions();
        guessInput.value = "";
      });

      suggestions.appendChild(li);
    });

    openSuggestions();
    currentItems = Array.from(suggestions.querySelectorAll("li"));
  });
}

function _onMoveToSuggestionByKeyboardListenerInit() {
  const guessInput = document.getElementById("search");
  guessInput.addEventListener("keydown", (e) => {
    const suggestions = document.getElementById("suggestions");
    if (
      !suggestions?.classList.contains("open") ||
      !suggestions.children.length
    )
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
          handleGuess(name);
          closeSuggestions();
        }
      }
    } else if (e.key === "Escape") {
      closeSuggestions();
    }
  });
}

function _formPreventDefaultSubmitListenerInit() {
  /* Faz com que nao de reload na pagina ao clicar no botao de adivinhar */
  const form = document.getElementById("guess-form");
  form.addEventListener("submit", (e) => e.preventDefault());
}

function _submitButtonOnClickListenerInit() {
  const getSubmitGuess = document.getElementById("submit-button");
  getSubmitGuess.addEventListener("click", () => {
    const guessInput = document.getElementById("search");
    const userInput = (guessInput.value || "").trim();
    if (!userInput) {
      // <- bloqueia vazio
      closeSuggestions();
      return;
    }
    handleGuess(userInput);
    closeSuggestions();
  });
}
