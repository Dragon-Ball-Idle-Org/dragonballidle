// Cache da permutação por dataset
let __PERM_CACHE = null;
let __PERM_SIG = null;

// Cache da sequência já calculada (por índice k)
let __SEQ_CACHE_UP_TO = -1;
let __SEQ_CACHE = []; // guarda índices da lista canônica

// --- Janela de exclusão de repetição ---
export const WINDOW_DAYS = 30;
export const MAX_ATTEMPTS = 6; // nº de tentativas por dia antes do fallback

let _tryCount = 1;
let _randomCharacter = null;

export const getTryCount = () => _tryCount;
export const getRandomCharacter = () => _randomCharacter;

export function setTryCount(n) {
  _tryCount = n;
  localStorage.setItem("tryCount", String(n));
}

// ── Sorteio do personagem ─────────────────────────────────────────────────────

/** Quantos dias se passaram desde EPOCH_YMD */
function daysSinceEpoch(ymd) {
  const [y, m, d] = ymd.split("-").map(Number);
  const epoch = new Date(EPOCH_YMD);
  const target = new Date(y, m - 1, d);
  return Math.round((target - epoch) / 86400000);
}

export function getCharacterForDay(ymd) {
  const canon = getCanonicalList(window.characters || []);
  if (!canon.length) return null;

  const perm = getPermutationForCurrentDataset();
  const N = canon.length;
  const k = daysSinceEpoch(ymd);
  const slot = ((k % N) + N) % N;

  // tenta até MAX_ATTEMPTS evitar repetição na janela
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const raw = deterministicCandidate(ymd, attempt, N);
    const idx = perm[(slot + raw) % N];
    return canon[idx]; // por ora retorna na 1ª tentativa válida
  }

  // fallback absoluto: posição do slot na permutação
  return canon[perm[slot]];
}

/* Pega o personagem aleatório do dia com PRNG de seed (+ sal) */
export function getDailyCharacter() {
  const ymd = todayBrasiliaKey();
  _randomCharacter = getCharacterForDay(ymd);
  return _randomCharacter;
}

// ── Persistência de chutes ────────────────────────────────────────────────────
export function getSavedGuesses() {
  return JSON.parse(localStorage.getItem("guesses")) || [];
}

export function saveGuess(idOrName) {
  const guesses = getSavedGuesses();
  if (!guesses.includes(idOrName)) {
    guesses.push(idOrName);
    localStorage.setItem("guesses", JSON.stringify(guesses));
  }
}

export function isGameWon() {
  return localStorage.getItem("gameWon") === "true";
}

export function markGameWon() {
  localStorage.setItem("gameWon", "true");
}

// ── Reset diário ──────────────────────────────────────────────────────────────
export function doDailyReset() {
  _tryCount = 1;
  _randomCharacter = null;

  localStorage.setItem("attributeContainer", "false");
  localStorage.setItem("gameWon", "false");
  localStorage.setItem("wonTab", "false");
  localStorage.setItem("clipCharacterMain", "false");
  localStorage.setItem("guesses", JSON.stringify([]));
  localStorage.setItem("lastResetDay", todayBrasiliaKey());
}

export function ensureDailyResetOnBoot() {
  const today = todayBrasiliaKey();
  const last = localStorage.getItem("lastResetDay");
  if (last !== today) doDailyReset();
}

/**
 * Retorna o personagem sorteado para um determinado dia (ymd = "YYYY-MM-DD").
 *
 * Algoritmo:
 *  1. Tenta até MAX_ATTEMPTS candidatos que não apareceram nos últimos WINDOW_DAYS.
 *  2. Fallback: candidato com maior gap desde a última aparição.
 *  3. Armazena em __SEQ_CACHE para que dias futuros reutilizem o histórico.
 */
export function getCharacterForDay(ymd) {
  const canon = getCanonicalList(window.characters || []);
  const N = canon.length;
  if (!N) return null;

  const targetK = daysBetween(EPOCH_YMD, ymd);

  // calcula sequencialmente do último cache até o dia alvo
  for (let k = __SEQ_CACHE_UP_TO + 1; k <= targetK; k++) {
    const dayYMD = ymdFromDayIndex(k);
    const start = Math.max(0, k - WINDOW_DAYS);
    const recent = new Set();
    for (let i = start; i < k; i++) {
      const idx = __SEQ_CACHE[i];
      if (idx != null) recent.add(idx);
    }

    // Tenta candidatos determinísticos diferentes (attempt = 0..MAX_ATTEMPTS-1)
    let chosen = null;
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const cand = deterministicCandidate(dayYMD, attempt, N);
      if (!recent.has(cand)) {
        chosen = cand;
        break;
      }
    }

    // Fallback determinístico: escolhe o "menos recente" entre alguns candidatos
    if (chosen == null) {
      let bestIdx = null;
      let bestGap = -Infinity;
      for (let attempt = 0; attempt < Math.max(MAX_ATTEMPTS, 32); attempt++) {
        const cand = deterministicCandidate(dayYMD, attempt, N);
        let last = -Infinity;
        for (let i = k - 1; i >= start; i--) {
          if (__SEQ_CACHE[i] === cand) {
            last = i;
            break;
          }
        }
        const gap = last === -Infinity ? 1e9 : k - last;
        if (gap > bestGap) {
          bestGap = gap;
          bestIdx = cand;
        }
      }
      chosen = bestIdx ?? 0;
    }

    __SEQ_CACHE[k] = chosen;
    __SEQ_CACHE_UP_TO = k;
  }

  const canonIdx = __SEQ_CACHE[targetK];
  return canon[canonIdx];
}

/* Pega o personagem aleatório do dia com PRNG de seed (+ sal) */
export function getDailyCharacter() {
  _randomCharacter = getCharacterForDay(todayBrasiliaKey());
  return _randomCharacter;
}

/**
 * Retorna a permutação determinística para o dataset atual.
 * Recalcula apenas se o conjunto de personagens mudou.
 */
export function getPermutationForCurrentDataset() {
  const canon = getCanonicalList(window.characters || []);
  const sig = canon.map((c) => (c.id ? `#${c.id}` : c.name || "")).join("|");
  if (__PERM_CACHE && __PERM_SIG === sig) return __PERM_CACHE;

  // Use um segredo estável (reaproveita DAILY_SECRET que já existe no seu código)
  const PERM_SECRET = DAILY_SECRET + "|perm-v1";
  __PERM_CACHE = buildDeterministicPermutation(canon.length, PERM_SECRET);
  __PERM_SIG = sig;
  return __PERM_CACHE;
}
