/**
 * Retorna o código de idioma a partir dos valores fornecidos.
 * Quem chama é responsável por ler location/document e passar aqui.
 *
 * @param {string} pathname - ex.: location.pathname
 * @returns {string}        - ex.: "pt-br", "en-us"
 *
 */
export function getLangFromPath(pathname = "") {
  const pathLang = (pathname.split("/")[1] || "").toLowerCase();
  return pathLang;
}

/**
 * Retorna o código de idioma a partir dos valores fornecidos.
 * Quem chama é responsável por ler location/document e passar aqui.
 *
 * @param {string} htmlLang - ex.: document.documentElement.getAttribute("lang")
 * @returns {string}        - ex.: "pt-br", "en-us"
 *
 */
export function getLangFromDoc(htmlLang = "") {
  const docLang = htmlLang.toLowerCase();
  return docLang;
}
