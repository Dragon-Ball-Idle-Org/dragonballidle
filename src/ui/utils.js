import { isGameWon } from "../state/game-state.js";
import { getBrasiliaTime } from "../utils/date.js";

const BASE_CHAR_CDN_URL = import.meta.env.VITE_CDN_BASE_URL + "/characters";
const CHAR_IMG_BASE = `${BASE_CHAR_CDN_URL}/images/`;
const CHAR_IMG_BASE_THUMB = `${BASE_CHAR_CDN_URL}/thumbs/`;

export function getImageCdnCharacterPath(imagePath) {
  const filename = imagePath.split("/").pop();
  return `${CHAR_IMG_BASE}${filename}`;
}

export function getThumbCdnCharacterPath(imagePath) {
  const filename = imagePath.split("/").pop();
  return `${CHAR_IMG_BASE_THUMB}${filename}`;
}

export function buildXShareURL(tries) {
  const dict = window.LOCALE || {};
  const one =
    dict["share.tweet.one"] ||
    "I guessed today's DragonBallDle character in 1 try — try it too at {url}";
  const other =
    dict["share.tweet.other"] ||
    "I guessed today's DragonBallDle character in {tries} tries — try it too at {url}";
  const tpl = tries === 1 ? one : other;
  const text = tpl
    .replace("{tries}", String(tries))
    .replace("{url}", "https://dragonballdle.site/");
  return "https://twitter.com/intent/tweet?text=" + encodeURIComponent(text);
}

export function fitTextToBox(el, minPx = 8, step = 1) {
  const style = window.getComputedStyle(el);
  let size = parseFloat(style.fontSize) || 14;

  // diminui até caber ou chegar no mínimo
  while (el.scrollHeight > el.clientHeight && size > minPx) {
    size -= step;
    el.style.fontSize = size + "px";
    el.style.lineHeight = "1.05";
  }

  // só usa tooltip nativo em células NORMAIS (não na de imagem)
  if (!el.classList.contains("guess-image")) {
    if (!el.title) el.title = el.textContent.trim();
  } else {
    el.removeAttribute("title");
  }
}

export function fitAllTypeBoxes() {
  document.querySelectorAll(".typeBox").forEach(fitTextToBox);
}

// Rola imediatamente p/ a coluna 0, sem animação
export function scrollToLeftNow(el) {
  if (!el) return;
  const prev = el.style.scrollBehavior;
  el.style.scrollBehavior = "auto";
  el.scrollLeft = 0;
  el.style.scrollBehavior = prev || "";
}

/**
 * Inicia (ou garante que já existe) o countdown exibido no popup
 * de vitória (#countdown). Só age se o jogo já foi vencido.
 */
export function setupCountdown() {
  if (!isGameWon()) return;
  const countdownDiv = document.getElementById("countdown");
  if (!countdownDiv) return;

  function updateCountdown() {
    const now = getBrasiliaTime();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);
    const diff = nextMidnight - now;
    const hours = String(
      Math.max(0, Math.floor(diff / 1000 / 60 / 60)),
    ).padStart(2, "0");
    const minutes = String(
      Math.max(0, Math.floor((diff / 1000 / 60) % 60)),
    ).padStart(2, "0");
    const seconds = String(
      Math.max(0, Math.floor((diff / 1000) % 60)),
    ).padStart(2, "0");

    countdownDiv.textContent = `Next character in ${hours}:${minutes}:${seconds}`;
  }

  updateCountdown();
  if (!setupCountdown._timer) {
    setupCountdown._timer = setInterval(updateCountdown, 1000);
  }
}

// pega o span do herói onde estava o "Type any character..."
export function getIntroEl() {
  return document.querySelector(".intro-guess");
}
