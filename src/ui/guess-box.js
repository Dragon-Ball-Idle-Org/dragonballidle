import {
  getTryCount,
  guessAlreadyMade,
  saveGuessId,
} from "../state/game/guesses.state.js";
import { getRandomCharacter } from "../state/game/character.state.js";
import { compareValuesArray } from "../utils/array.js";
import { todayBrasiliaKey } from "../utils/date.js";
import {
  fitAllTypeBoxes,
  fitTextToBox,
  getThumbCdnCharacterPath,
  scrollToLeftNow,
} from "./utils.js";
import { drawSagaArrow } from "./saga.js";
import { winGame } from "./wins.js";

export function createGuessBox(itemFound) {
  // HOST: onde as linhas de chute vão
  let host = document.getElementById("guesses-container");
  if (!host) {
    const panel =
      document.querySelector(".guesses-container") ||
      document.querySelector(".guess-container") ||
      document.body;
    host = document.createElement("div");
    host.id = "guesses-container";
    panel.appendChild(host);
  }

  const row = document.createElement("div");
  row.className = "guessesBox-container";
  // insere NO TOPO (3º, 2º, 1º)
  if (host.firstChild) host.insertBefore(row, host.firstChild);
  else host.appendChild(row);

  // 1ª COLUNA: mini imagem (preenche 100%)
  const pic = document.createElement("div");
  pic.className = "typeBox guess-image";
  pic.style.position = "relative";
  pic.style.padding = "0";
  pic.style.overflow = "hidden";

  const img = document.createElement("img");
  img.src = getThumbCdnCharacterPath(itemFound.image);
  img.alt = itemFound.name;
  img.loading = "lazy";
  img.loading = "lazy";
  img.style.width = "100%";
  img.style.height = "100%";
  img.style.objectFit = "cover";
  img.style.display = "block";
  img.style.borderRadius = "10px";
  pic.appendChild(img);
  pic.setAttribute("data-label", itemFound.name);
  row.appendChild(pic);

  // DEMAIS COLUNAS (ordem do cabeçalho)
  const columns = [
    ["gender", "Gender"],
    ["race", "Race"],
    ["affiliation", "Affiliation"],
    ["transformation", "Transformation"],
    ["attribute", "Attribute"],
    ["series", "Series"],
    ["debutSaga", "Saga"],
  ];

  const randomCharacter = getRandomCharacter();

  columns.forEach(([key]) => {
    const cell = document.createElement("div");
    cell.className = "typeBox";
    cell.style.position = "relative";

    const content = document.createElement("div");
    content.className = "cell-content";
    content.style.position = "relative";
    content.style.zIndex = "1";
    const val = itemFound[key];
    content.textContent = Array.isArray(val) ? val.join(", ") : (val ?? "");
    cell.appendChild(content);

    const result = compareValuesArray(itemFound[key], randomCharacter[key]);
    if (result === "exact") cell.classList.add("bg-correct");
    else if (result === "partial") cell.classList.add("bg-partial");
    else cell.classList.add("bg-incorrect");

    // seta da SAGA (↑ / ↓)
    if (key === "debutSaga")
      drawSagaArrow(cell, itemFound.debutSaga, randomCharacter.debutSaga);

    row.appendChild(cell);
    fitTextToBox(cell);
  });

  // REVEAL: animação em “stagger”
  requestAnimationFrame(() => {
    const cells = Array.from(row.querySelectorAll(".typeBox"));
    cells.forEach((c, i) => {
      // só anima se AINDA não foi revelado (evita reanimar no restore)
      if (!c.classList.contains("revealed")) {
        c.style.animationDelay = `${i * 250}ms`;
        c.classList.add("revealed");
        // NÃO adicionamos .visible para não criar uma 2ª transição
      }
    });
    requestAnimationFrame(fitAllTypeBoxes);
  });
}

export function handleGuess(userInput) {
  const attributeContainer = document.getElementById("attribute-container");
  const guessInput = document.getElementById("search");
  const g = String(userInput || "").trim();
  if (!g) return;

  // garante que o banco está carregado
  if (!window.characters?.length) return;

  const eq = (a, b) =>
    String(a || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim() ===
    String(b || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const itemFound = window.characters.find((c) => eq(c.name, g));

  // se NÃO existir no dataset, não dispara guess do GTM
  if (!itemFound) {
    // (opcional) mande um evento separado só para debug/monitoramento:
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "dbz_guess_invalid",
      query: g,
      date_key: todayBrasiliaKey(),
    });
    return;
  }

  if (guessAlreadyMade(itemFound.id)) {
    return;
  }

  const randomCharacter = getRandomCharacter();
  const correct = eq(itemFound.name, randomCharacter?.name);

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "dbz_guess",
    guess: itemFound.name, // sempre o “nome canônico” do dataset
    correct,
    date_key: todayBrasiliaKey(),
  });

  // limpa input (qualquer caso)
  guessInput.value = "";
  attributeContainer.classList.add("show-attrs");
  document.querySelector(".guess-container")?.classList.add("scroll-on");

  saveGuessId(itemFound.id);

  // desenha linha
  createGuessBox(itemFound);
  const scroller = document.querySelector(".guess-container");
  scroller?.classList.add("panel-active", "scroll-on");
  scrollToLeftNow(scroller);

  // tira do pool desta sessão
  const idx = window.characters.indexOf(itemFound);
  if (idx !== -1) window.characters.splice(idx, 1);

  localStorage.setItem("attributeContainer", "true");
  const tryCount = getTryCount();
  if (correct) {
    winGame(tryCount);
  } else {
    const tryNumber = document.getElementById("nTry");
    if (tryNumber) tryNumber.innerHTML = tryCount;
  }
}

export function scrollGuessesToRight() {
  const scroller = document.querySelector(".guess-container");
  if (scroller)
    scroller.scrollTo({ left: scroller.scrollWidth, behavior: "smooth" });
}
