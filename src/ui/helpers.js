import { isGameWon } from "../state/game-state.js";
import { getBrasiliaTime } from "../utils/date.js";

const CHAR_IMG_BASE_THUMB = "/thumbs/";

// --- Util para apontar para o thumb (public/thumb/<arquivo>.png) ---
export function getThumbSrc(imagePath) {
  // Ex.: "image/android_13.png" -> "android_13.png"
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

//TODO: caracters é uma séries de arquivos json
/**
 * Aguarda até maxMs ms que window.characters seja preenchido.
 * Suporta tanto window.characters quanto bindings léxicos de scripts
 * não-module (const characters = [...]).
 */
export async function waitForCharacters(maxMs = 7000) {
  const started = window.performance.now();
  while (true) {
    if (window.characters?.length) return window.characters;
    try {
      if (
        typeof characters !== "undefined" &&
        Array.isArray(characters) &&
        characters.length
      ) {
        window.characters = characters;
        return window.characters;
      }
    } catch (_) {}
    await new Promise((r) => setTimeout(r, 25));
    if (window.performance.now() - started > maxMs)
      throw new Error("characters not loaded");
  }
}

// pega o span do herói onde estava o "Type any character..."
export function getIntroEl() {
  return document.querySelector(".intro-guess");
}
