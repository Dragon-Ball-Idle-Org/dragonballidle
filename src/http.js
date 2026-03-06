import { todayBrasiliaKey } from "./utils/date";

const WINS_API = "/api/wins.php";

export async function fetchWinsToday() {
  const ymd = todayBrasiliaKey();
  const url = `${WINS_API}?date=${encodeURIComponent(ymd)}&_=${Date.now()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("wins GET failed");
  const { wins = 0 } = await res.json();
  return wins | 0;
}

export async function incrementWinsToday() {
  const ymd = todayBrasiliaKey();
  const res = await fetch(WINS_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify({ date: ymd, delta: 1 }),
  });
  if (!res.ok) throw new Error("wins POST failed");
  const { wins = 0 } = await res.json();
  return wins | 0;
}
