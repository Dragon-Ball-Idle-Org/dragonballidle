import { doDailyResetState } from "../state/game/reset.state";
import { todayBrasiliaKey } from "../utils/date";
import { hideInlineWinSummary } from "./wins";

export function ensureDailyResetOnBoot() {
  const today = todayBrasiliaKey();
  const last = localStorage.getItem("lastResetDay"); //TODO: migrar para state
  if (last !== today) {
    doDailyResetState();
    doDailyResetUi();
  }
}

export function doDailyResetUi() {
  hideInlineWinSummary();

  const tryNumber = document.getElementById("nTry");
  if (tryNumber) tryNumber.innerHTML = 0;

  const guessesContainer = document.getElementById("guesses-container");
  if (guessesContainer) guessesContainer.innerHTML = "";

  const attributeContainer = document.getElementById("attribute-container");
  attributeContainer?.classList.remove("show-attrs");

  const searchInput = document.getElementById("search");
  if (searchInput) searchInput.disabled = false;

  const winGameContainer = document.getElementById("win-game");
  if (winGameContainer) winGameContainer.style.display = "none";

  const clipCharacterPopup = document.getElementById("clip-character-popup");
  if (clipCharacterPopup) clipCharacterPopup.style.display = "none";

  const clipCharacterMain = document.getElementById("clip-character-main");
  if (clipCharacterMain) clipCharacterMain.style.display = "none";
}
