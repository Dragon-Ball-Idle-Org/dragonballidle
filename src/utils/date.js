export function formatYMD(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// 1. Sync with Brasília's official time
// Hora atual de Brasília sem rede
export function getBrasiliaTime() {
  // se houver uma data forçada (query, LS ou objeto global), usa ela
  const forced =
    window.DBZ_DEBUG.forceYMD ||
    localStorage.getItem("forceYMD") ||
    new URLSearchParams(location.search).get("ymd");
  if (forced && /^\d{4}-\d{2}-\d{2}$/.test(forced)) {
    // fixa meio-dia de Brasília para evitar borda de horário
    return new Date(forced + "T12:00:00-03:00");
  }

  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
    .formatToParts(now)
    .reduce((a, p) => ((a[p.type] = p.value), a), {});
  return new Date(
    `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`,
  );
}

export function todayBrasiliaKey() {
  return formatYMD(getBrasiliaTime());
}

// Diferença de dias entre YYYY-MM-DD sem fuso
export function daysBetween(ymdFrom, ymdTo) {
  const a = new Date(ymdFrom + "T00:00:00Z");
  const b = new Date(ymdTo + "T00:00:00Z");
  return Math.floor((b - a) / 86400000);
}

// Converte índice de dias (k) -> YYYY-MM-DD, relativo ao EPOCH_YMD
export function ymdFromDayIndex(k) {
  const d = new Date(EPOCH_YMD + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + k);
  return d.toISOString().slice(0, 10);
}

function getMsToNextDailyReset() {
  const now = getBrasiliaTime();
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return Math.max(0, next - now);
}

export function formatHMS(ms) {
  const s = Math.floor(ms / 1000);
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${h}:${m}:${ss}`;
}
