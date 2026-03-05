import {
  getRandomCharacter,
  markGameWon,
} from "../state/game-state.js";
import { formatWinsI18n } from "../utils/i18n.js";
import { getCurrentLang } from "../utils/lang.js";
import { fetchWinsToday } from "../http.js";
import { buildXShareURL, getThumbSrc } from "./helpers.js";
import { formatHMS, getMsToNextDailyReset } from "../utils/date.js";
import { openWinPopup } from "./popup.js";
import { todayBrasiliaKey, getBrasiliaTime } from "../utils/date.js";

let _winsPollTimer = null;
let _lastWinsShown = null;

// ── CSS do badge (injetado uma vez) ──────────────────────────────────────────

export function ensureWinsBadgeCSS() {
  if (document.getElementById("wins-badge-style")) return;
  const css = `
  .intro-guess .wins-badge{
    display:inline-block;
    padding:0.15rem 0.55rem;
    border-radius:999px;
    background:linear-gradient(135deg, #32cd32, #228b22);
    color:#fff;
    font-weight:800;
    box-shadow:0 6px 18px rgba(255,61,0,.35);
    text-shadow:0 1px 0 rgba(0,0,0,.25);
    transform:translateZ(0);
  }
  .intro-guess .wins-badge.pulse{
    animation:winsPulse .6s ease-out;
  }
  @keyframes winsPulse{
    0%{ transform:scale(1); box-shadow:0 0 0 rgba(255,61,0,0); }
    40%{ transform:scale(1.08); box-shadow:0 10px 24px rgba(255,61,0,.45); }
    100%{ transform:scale(1); box-shadow:0 6px 18px rgba(255,61,0,.35); }
  }`;
  const style = document.createElement("style");
  style.id = "wins-badge-style";
  style.textContent = css;
  document.head.appendChild(style);
}

//TODO: Gerado por IA diferente do original, entender porque
// function ensureWinsBadgeCSS() {
//   if (document.getElementById("wins-badge-style")) return;
//   const style = document.createElement("style");
//   style.id = "wins-badge-style";
//   style.textContent = `
//     .wins-badge { display:inline-block; font-weight:bold; }
//     @keyframes pulse-badge { 0%,100%{transform:scale(1)} 50%{transform:scale(1.3)} }
//     .wins-badge.pulse { animation: pulse-badge .4s ease; }
//   `;
//   document.head.appendChild(style);
// }

// ── Atualiza o elemento .intro-guess com a contagem ──────────────────────────

function _updateIntroWins(n) {
  const el = getIntroEl();
  if (!el) return;
  ensureWinsBadgeCSS();

  const lang = getCurrentLang(
    location.pathname,
    document.documentElement.getAttribute("lang"),
  );
  const tpl = window.strings?.["wins.today"] || null;

  if (tpl) {
    el.innerHTML = tpl.replace(
      /\{n\}/g,
      `<span class="wins-badge">${Number(n) || 0}</span>`,
    );
  } else {
    const plain = formatWinsI18n(Number(n) || 0, lang, null);
    el.innerHTML = plain.replace(
      /\d[\d\.]*/,
      (m) => `<span class="wins-badge">${m}</span>`,
    );
  }

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

export function showInlineWinSummary(triesCount) {
  const wrapper = document.getElementById("inline-win-wrapper");
  const tries = document.getElementById("inline-tries");
  const cd = document.getElementById("inline-countdown");
  const nameEl = document.getElementById("inline-char-name");
  const thumbEl = document.getElementById("inline-char-thumb");
  const share = document.getElementById("inline-share");
  if (!wrapper || !tries || !cd || !nameEl || !thumbEl) return;

  const character = getRandomCharacter();
  const name = character?.name || "—";
  const thumb = getThumbSrc(character?.image || "");

  tries.textContent = String(triesCount);
  nameEl.textContent = name;
  if (thumb) {
    thumbEl.src = thumb;
    thumbEl.alt = name + " thumbnail";
  }
  if (share) share.href = buildXShareURL(triesCount);

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

export function winGame(tryCount) {
  const randomCharacter = getRandomCharacter();
  showInlineWinSummary(tryCount);

  const clipCharacterImage = document.getElementById("clip-character-image");
  if (clipCharacterImage)
    clipCharacterImage.src = `${CHAR_IMG_BASE}${randomCharacter.image}`;

  // // pegue o contador de tentativas da variável que você já usa
  // // (se a sua variável tiver outro nome, troque aqui):
  // TODO: Original
  // const tries =
  //   typeof tryCount !== "undefined"
  //     ? tryCount
  //     : parseInt(localStorage.getItem("tryCount") || "1", 10);
  // === preencher mensagem da vitória ===
  //TODO: Gerado por IA diferente do original, entender porque
  const tryCountEl = document.getElementById("try-count");
  const charNameEl = document.getElementById("character-name");
  if (tryCountEl) tryCountEl.textContent = String(tryCount);
  if (charNameEl) charNameEl.textContent = randomCharacter.name;

  const winLine = document.querySelector(".win-line");
  if (winLine) {
    const plural = tryCount === 1 ? "try" : "tries";
    winLine.innerHTML = `You guessed today’s Dragon Ball character in <strong id="try-count">${tryCount}</strong> ${plural}:`;
  }

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
