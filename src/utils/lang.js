/**
 * Retorna o código de idioma a partir dos valores fornecidos.
 * Quem chama é responsável por ler location/document e passar aqui.
 *
 * @param {string} pathname - ex.: location.pathname
 * @param {string} htmlLang - ex.: document.documentElement.getAttribute("lang")
 * @returns {string}        - ex.: "pt-br", "en-us"
 *
 * Exemplo de uso em main.js:
 *   getCurrentLang(location.pathname, document.documentElement.getAttribute("lang"))
 */
export function getCurrentLang(pathname = "", htmlLang = "") {
  const pathLang = (pathname.split("/")[1] || "").toLowerCase();
  const docLang = htmlLang.toLowerCase();
  return pathLang || docLang || "en-us";
}
