import {
  getRandomCharacter,
  getTryCount,
  markGameWon,
} from "../state/game-state.js";
import { formatWinsI18n } from "../utils/i18n.js";
import { fetchWinsToday, incrementWinsToday } from "../http.js";
import {
  buildXShareURL,
  getIntroEl,
  getThumbSrc,
  setupCountdown,
} from "./helpers.js";
import { formatHMS, getMsToNextDailyReset } from "../utils/date.js";
import { openWinPopup } from "./popup.js";
import { todayBrasiliaKey, getBrasiliaTime } from "../utils/date.js";

let _winsPollTimer = null;
let _lastWinsShown = null;
let _inlineCountdownTimer = null;

// ── Atualiza o elemento .intro-guess com a contagem ──────────────────────────

function _updateIntroWins(n) {
  const el = getIntroEl();
  if (!el) return;

  const strings = window.LOCALE ?? {};
  const plain = formatWinsI18n(Number(n) || 0, strings);
  const numStr = String(Number(n) || 0);
  const safeNum = numStr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  el.innerHTML = plain.replace(
    new RegExp(safeNum, "g"),
    `<span class="wins-badge">${numStr}</span>`,
  );

  // efeito “pulse” apenas quando o valor AUMENTAR (ex.: após vitória)
  const badge = el.querySelector(".wins-badge");
  if (
    badge &&
    (typeof _lastWinsShown !== "number" || Number(n) > _lastWinsShown)
  ) {
    badge.classList.remove("pulse");
    // força reflow pra reiniciar animação
    void badge.offsetWidth;
    badge.classList.add("pulse");
  }
  _lastWinsShown = Number(n) || 0;
}

// ── Polling + agendamento de virada de dia ────────────────────────────────────

export function startWinsPolling() {
  const T = 5 * 60 * 1000;
  const tick = async () => {
    try {
      _updateIntroWins(await fetchWinsToday());
    } catch (e) {
      console.warn("wins poll failed", e);
    }
  };
  tick();
  clearInterval(_winsPollTimer);
  _winsPollTimer = setInterval(tick, T);
}

export function scheduleMidnightRefresh() {
  const now = getBrasiliaTime();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  setTimeout(
    () => {
      startWinsPolling();
      scheduleMidnightRefresh();
    },
    Math.max(1000, midnight - now),
  );
}

export function showInlineWinSummary() {
  const wrapper = document.getElementById("inline-win-wrapper");
  const tries = document.getElementById("inline-tries");
  const cd = document.getElementById("inline-countdown");
  const nameEl = document.getElementById("inline-char-name");
  const thumbEl = document.getElementById("inline-char-thumb");
  const share = document.getElementById("inline-share");
  if (!wrapper || !tries || !cd || !nameEl || !thumbEl) return;

  const tryCount = getTryCount();
  const character = getRandomCharacter();
  const name = character?.name || "—";
  const thumb = getThumbSrc(character?.image || "");

  tries.textContent = String(tryCount);
  nameEl.textContent = name;
  if (thumb) {
    thumbEl.src = thumb;
    thumbEl.alt = name + " thumbnail";
  }
  if (share) share.href = buildXShareURL(tryCount);

  if (_inlineCountdownTimer) clearInterval(_inlineCountdownTimer);
  const tick = () => {
    cd.textContent = formatHMS(getMsToNextDailyReset());
  };
  tick();
  _inlineCountdownTimer = setInterval(tick, 1000);

  wrapper.classList.remove("hidden");
}

export function hideInlineWinSummary() {
  const wrapper = document.getElementById("inline-win-wrapper");
  if (wrapper) wrapper.classList.add("hidden");
  if (_inlineCountdownTimer) {
    clearInterval(_inlineCountdownTimer);
    _inlineCountdownTimer = null;
  }
}

// ── winGame ───────────────────────────────────────────────────────────────────

export function winGame() {
  const randomCharacter = getRandomCharacter();
  showInlineWinSummary();
  openWinPopup();

  const winGameContainer = document.getElementById("win-game");
  if (winGameContainer) {
    winGameContainer.addEventListener("animationend", () => {
      setTimeout(() => {
        const duration = 2 * 1000;
        const end = Date.now() + duration;
        (function confettiFrame() {
          if (typeof confetti === "function") {
            confetti({
              particleCount: 5,
              angle: 60,
              spread: 55,
              origin: { x: 0 },
            });
            confetti({
              particleCount: 5,
              angle: 120,
              spread: 55,
              origin: { x: 1 },
            });
          }
          if (Date.now() < end) requestAnimationFrame(confettiFrame);
        })();
      });
    });
  }

  document.getElementById("search").disabled = true;
  markGameWon();

  // === GTM: marcou que acertou o personagem do dia ===
  const tryCount = getTryCount();
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "dbz_win",
    character: randomCharacter?.name || "(desconhecido)",
    try_count: tryCount,
    date_key: todayBrasiliaKey(),
  });
  // === (opcional) atualiza o evento de chute mais recente como "correct:true"
  window.dataLayer.push({
    event: "dbz_guess_result",
    guess: randomCharacter?.name || "(desconhecido)",
    correct: true,
    date_key: todayBrasiliaKey(),
  });

  incrementWinsToday()
    .then(_updateIntroWins)
    .catch((e) => console.warn("increment failed", e));

  localStorage.setItem("lastResetDay", todayBrasiliaKey());
  localStorage.setItem("wonTab", "true");
  localStorage.setItem("clipCharacterMain", "true");
  setupCountdown();
}
