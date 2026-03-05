export async function fetchWinsToday() {
  const ymd = todayBrasiliaKey();
  const url = `${WINS_API}?date=${encodeURIComponent(ymd)}&_=${Date.now()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("wins GET failed");
  const { wins = 0 } = await res.json();
  return wins | 0;
}
