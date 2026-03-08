export const DEFAULT_LANG = "en-us";
export const SUPPORTED = [
  "pt-br",
  "en-us",
  "es-es",
  "fr-fr",
  "it-it",
  "de-de",
  "ru-ru",
  "tr-tr",
  "uk-ua",
  "ar-sa",
  "ja-jp",
  "ko-kr",
  "hi-in",
  "th-th",
  "vi-vn",
  "id-id",
  "zh-cn",
  "zh-tw",
  "fil-ph",
  "ms-my",
];


export function langToCharsFile(lang = DEFAULT_LANG) {
  const code = String(lang || DEFAULT_LANG).toLowerCase();
  return `characters-${code.replace("-", "_")}.js`;
}

/**
 * Retorna a mensagem de "N pessoas já acertaram" no idioma atual.
 * Função pura: não depende de globals; o chamador deve passar o dict de locale.
 *
 * @param {number} n                - quantidade de acertos
 * @param {Record<string,string>} [strings] - dict de locale (chaves: wins.today, wins.today.one)
 *
 * Chaves esperadas em strings:
 *   - wins.today    - template plural (ex.: "{n} pessoas já acertaram...")
 *   - wins.today.one - template singular, opcional (ex.: "{n} pessoa já acertou...")
 *
 * Fallback: se strings for vazio ou não tiver wins.today, retorna mensagem em inglês.
 */
export function formatWinsI18n(n, strings = {}) {
  const dict = strings ?? {};
  const tpl =
    n === 1 && dict["wins.today.one"]
      ? dict["wins.today.one"]
      : dict["wins.today"];

  if (tpl && typeof tpl === "string") {
    return tpl.replace(/\{n\}/g, String(n));
  }

  return `${n} people have already guessed today's character!`;
}

/**
 * Retorna a linha do popup de vitória no formato "[before] {tries} [after]".
 * Função pura: recebe tries e strings; o chamador substitui {tries} pelo HTML do badge.
 *
 * Chaves em strings: popup.line.before, popup.line.after, popup.line.after.one (opcional)
 */
export function formatPopupLineI18n(tries, strings = {}) {
  const dict = strings ?? {};
  const before =
    dict["popup.line.before"] ?? "You guessed today's Dragon Ball character in";
  const after =
    tries === 1 && dict["popup.line.after.one"]
      ? dict["popup.line.after.one"]
      : (dict["popup.line.after"] ?? (tries === 1 ? "try:" : "tries:"));
  return `${before} {tries} ${after}`;
}
