let hoverNameEl = null;

/**
 * Cria o elemento de tooltip no <body> e registra todos os
 * event listeners necessários. Deve ser chamado uma única vez
 * após o DOM estar pronto.
 */
export function initHoverTooltip() {
  hoverNameEl = document.createElement("div");
  hoverNameEl.className = "hover-name";
  document.body.appendChild(hoverNameEl);

  document.addEventListener("mouseover", (e) => {
    const cell = e.target.closest(".guess-image");
    if (cell)
      showHoverName(
        cell,
        cell.getAttribute("data-label") || cell.textContent.trim(),
      );
  });

  document.addEventListener("mousemove", (e) => {
    const cell = e.target.closest(".guess-image");
    if (!cell) return;
    const r = cell.getBoundingClientRect();
    hoverNameEl.style.left = `${r.left + r.width / 2}px`;
    hoverNameEl.style.top = `${r.bottom + 8}px`;
  });

  document.addEventListener("mouseout", (e) => {
    const fromCell = e.target.closest(".guess-image");
    const toCell = e.relatedTarget?.closest?.(".guess-image");
    if (fromCell && !toCell) hideHoverName();
  });

  window.addEventListener("scroll", hideHoverName, { passive: true });
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") hideHoverName();
  });
  document.addEventListener("click", (ev) => {
    if (!ev.target.closest(".guess-image")) hideHoverName();
  });
}

// ── Helpers internos ─────────────────────────────────────────────────────────

function showHoverName(targetEl, text) {
  if (!text || !hoverNameEl) return;
  hoverNameEl.textContent = text;
  const r = targetEl.getBoundingClientRect();
  hoverNameEl.style.left = `${r.left + r.width / 2}px`;
  hoverNameEl.style.top = `${r.bottom + 8}px`;
  hoverNameEl.style.opacity = "1";
  hoverNameEl.style.transform = "translate(-50%, 0)";
}

function hideHoverName() {
  if (!hoverNameEl) return;
  hoverNameEl.style.opacity = "0";
  hoverNameEl.style.transform = "translate(-50%, -4px)";
}
