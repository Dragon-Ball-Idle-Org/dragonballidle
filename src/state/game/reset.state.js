import { getBrasiliaTime, todayBrasiliaKey } from "../../utils/date";

export function doDailyResetState() {
  _tryCount = 1;

  localStorage.setItem("attributeContainer", "false");
  localStorage.setItem("gameWon", "false");
  localStorage.setItem("wonTab", "false");
  localStorage.setItem("clipCharacterMain", "false");
  localStorage.setItem("guesses", JSON.stringify([]));

  // marca o reset do dia (chave por data de Brasília)
  localStorage.setItem("lastResetDay", todayBrasiliaKey());
}

export async function hardReloadClearCaches() {
  try {
    if ("caches" in window) {
      const names = await caches.keys();
      await Promise.all(names.map((n) => caches.delete(n)));
    }
  } catch (e) {}
  try {
    const regs = await window.navigator.serviceWorker?.getRegistrations();
    await Promise.all(regs?.map((r) => r.unregister()) || []);
  } catch (e) {}
  try {
    localStorage.clear();
  } catch (e) {}
  try {
    sessionStorage.clear();
  } catch (e) {}
  try {
    const url = new URL(window.location.href);
    url.searchParams.set("cb", Date.now().toString());
    window.location.replace(url.toString());
  } catch (e) {
    window.location.reload();
  }
}

export function startMidnightCheck() {
  setInterval(() => {
    const now = getBrasiliaTime();
    const today = todayBrasiliaKey();
    const last = localStorage.getItem("midnightTriggeredDate");
    if (
      now.getHours() === 0 &&
      now.getMinutes() === 0 &&
      now.getSeconds() < 5
    ) {
      if (last !== today) {
        localStorage.setItem("midnightTriggeredDate", today);
        document.dispatchEvent(new Event("midnightBrasilia"));
      }
    }
  }, 1000);
}
