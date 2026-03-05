/**
 * Normaliza uma string para comparação de valores de dados
 * (nomes de personagens, sagas, etc.).
 *
 * Passos aplicados:
 *  1. Converte para string e substitui null/undefined por ""
 *  2. Unicode NFD  → separa letras de seus diacríticos (ex.: "é" → "e" + "´")
 *  3. Remove os diacríticos isolados (acento, cedilha, til, etc.)
 *  4. Converte para minúsculas
 *  5. Remove espaços no início e no fim
 *
 * Preserva: espaços internos, hífens, números e demais caracteres.
 *
 * @example
 * norm("Gokū")         // → "goku"
 * norm("Célula")       // → "celula"
 * norm("  Vegeta  ")   // → "vegeta"
 * norm("Saga do Freeza") // → "saga do freeza"
 *
 * @param {*} s - valor a normalizar
 * @returns {string}
 */
export function norm(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Normaliza uma string para comparação de identificadores/cabeçalhos,
 * como nomes de colunas de CSV ou códigos de idioma.
 *
 * Passos aplicados:
 *  1. Converte para string e substitui null/undefined por ""
 *  2. Converte para minúsculas
 *  3. Remove espaços no início e no fim
 *  4. Unicode NFD  → separa letras de seus diacríticos
 *  5. Remove os diacríticos isolados
 *  6. Remove tudo que não é letra minúscula (a–z) —
 *     espaços internos, hífens, números, underscores, etc.
 *
 * O passo 6 é o que diferencia hnorm de norm: o resultado é uma
 * sequência pura de letras, sem nenhum separador. Isso permite
 * reconhecer "pt-br", "pt_br", "pt br" e "ptbr" como equivalentes.
 *
 * @example
 * hnorm("pt-br")   // → "ptbr"
 * hnorm("en-us")   // → "enus"
 * hnorm("en US")   // → "enus"
 * hnorm("English") // → "english"
 * hnorm("Español") // → "espanol"
 *
 * @param {*} s - valor a normalizar
 * @returns {string}
 */
export function hnorm(s) {
  return String(s || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/g, "");
}
