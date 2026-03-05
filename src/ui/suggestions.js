// ============================================================
// ui/suggestions.js
// Responsabilidade: abrir/fechar/posicionar o dropdown de sugestões
// Dependências externas: nenhuma (manipula apenas DOM)
// ============================================================

let suggestions = null;
let _portalActive = false;

function getSuggestions() {
  if (!suggestions) suggestions = document.getElementById("suggestions");
  return suggestions;
}

export function flipDropdownIfNeeded() {
  const el = getSuggestions();
  if (!el) return;

  const input = document.querySelector("#guess-form .guess-input");
  const button = document.getElementById("submit-button");
  if (!input || !button) return;

  const inputRect = input.getBoundingClientRect();
  const buttonRect = button.getBoundingClientRect();
  const gap = 10; // mesmo gap visual do CSS

  // largura do dropdown = espaço entre o início do input e o botão
  const left = inputRect.left;
  const width = Math.max(180, buttonRect.left - gap - left);

  const spaceBelow = window.innerHeight - inputRect.bottom;
  const spaceAbove = inputRect.top;
  // heurística: se não cabe 240px abaixo e acima tem mais espaço, abre pra cima
  const needUp = spaceBelow < 240 && spaceAbove > spaceBelow;

  // altura de um item (bate com o CSS: min-height: 80px)
  const ITEM_H = 80;
  // limite “5 itens” (cap superior), mas mínimo de 160px para não ficar curto demais
  const FIVE_CAP = ITEM_H * 5;
  const MIN_OPEN = 160; // ~2 itens

  if (needUp) {
    el.classList.add("drop-up");
    el.style.top = "";
    el.style.bottom = window.innerHeight - inputRect.top + 8 + "px";

    const available = Math.max(0, spaceAbove - 16);
    const target = Math.max(MIN_OPEN, available); // respeita mínimo
    el.style.maxHeight = Math.min(FIVE_CAP, target) + "px"; // **capa em 5**
  } else {
    el.classList.remove("drop-up");
    el.style.bottom = "";
    el.style.top = inputRect.bottom + 8 + "px";

    const available = Math.max(0, spaceBelow - 16);
    const target = Math.max(MIN_OPEN, available);
    el.style.maxHeight = Math.min(FIVE_CAP, target) + "px"; // **capa em 5**
  }

  el.style.left = left + "px";
  el.style.width = width + "px";
}

export function openSuggestions() {
  const el = getSuggestions();
  const host = document.getElementById("guess-form");
  if (!host || !el) return;

  el.classList.add("open");

  if (!_portalActive) {
    el.classList.add("portal");
    document.body.appendChild(el);
    _portalActive = true;
    window.addEventListener("scroll", flipDropdownIfNeeded, true);
    window.addEventListener("resize", flipDropdownIfNeeded);
  }

  // posiciona na próxima pintura (já com dimensões corretas)
  requestAnimationFrame(flipDropdownIfNeeded);
}

export function closeSuggestions() {
  const el = getSuggestions();
  if (!el) return;

  el.classList.remove("open", "drop-up");
  el.style.top = "";
  el.style.bottom = "";
  el.style.left = "";
  el.style.width = "";
  el.style.maxHeight = "";

  if (_portalActive) {
    const host = document.getElementById("guess-form");
    if (host) host.appendChild(el);
    el.classList.remove("portal");
    _portalActive = false;
    window.removeEventListener("scroll", flipDropdownIfNeeded, true);
    window.removeEventListener("resize", flipDropdownIfNeeded);
  }
}

/** Registra blur/focus/mousedown para fechar o dropdown */
export function initSuggestionsListeners(inputEl, formEl) {
  inputEl.addEventListener("blur", () => {
    setTimeout(() => closeSuggestions(), 150);
  });

  inputEl.addEventListener("focus", () => {
    const el = getSuggestions();
    if (inputEl.value.trim() && el?.children.length) openSuggestions();
  });

  document.addEventListener("mousedown", (ev) => {
    const el = getSuggestions();
    if (!formEl.contains(ev.target) && !el?.contains(ev.target)) {
      closeSuggestions();
    }
  });
}

/** Gerencia o item ativo via teclado */
export function setActiveIndex(i, activeIndexRef) {
  const el = getSuggestions();
  const items = el ? [...el.children] : [];
  if (!items.length) return activeIndexRef;

  const next = Math.max(0, Math.min(i, items.length - 1));
  items.forEach((li, idx) => li.classList.toggle("selected", idx === next));
  items[next].scrollIntoView({ block: "nearest" });
  return next;
}
