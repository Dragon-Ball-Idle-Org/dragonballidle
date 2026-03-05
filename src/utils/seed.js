// === Seed & PRNG fortes para o "personagem do dia" ===
// Troque por um valor só seu; mantenha privado em produção:
// TODO:Importar do .env ou algo assim, para não expor no código-fonte público
const DAILY_SECRET = "mude-este-sal-secreto-🔥";
export const EPOCH_YMD = "2025-01-01"; // mantenha estável (fixa o calendário)

/**
 * cyrb128: hash 128-bit rápido e estável.
 * Mesma string → sempre os mesmos 4 números.
 */
export function cyrb128(str) {
  let h1 = 1779033703,
    h2 = 3144134277,
    h3 = 1013904242,
    h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  return [
    (h1 ^ h2 ^ h3 ^ h4) >>> 0,
    (h2 ^ h1) >>> 0,
    (h3 ^ h1) >>> 0,
    (h4 ^ h1) >>> 0,
  ];
}

/**
 * mulberry32: PRNG simples, rápido e com boa distribuição.
 * Retorna uma função que, a cada chamada, devolve um float [0, 1).
 */
export function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Gera um índice [0, N) de forma determinística:
 * mesmos ymd + attempt + N → sempre o mesmo índice.
 */
export function deterministicCandidate(ymd, attempt, N) {
  const seedStr = `${ymd}|${attempt}|${DAILY_SECRET}|soft-norepeat-v1`;
  const [s0] = cyrb128(seedStr);
  const rnd = mulberry32(s0);
  return Math.floor(rnd() * N);
}

/**
 * Permutação Fisher–Yates seeded.
 * Garante que o calendário não repita personagens por N dias.
 */
export function buildDeterministicPermutation(n, salt) {
  const arr = Array.from({ length: n }, (_, i) => i);
  const [s0] = cyrb128(String(salt || ""));
  const rand = mulberry32(s0);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
