/**
 * Retorna a mensagem de "N pessoas já acertaram" no idioma atual.
 *
 * @param {number} n          - quantidade de acertos
 * @param {string} lang       - código do idioma (ex.: "pt-br") — injetado pelo chamador
 * @param {string|null} tpl   - template de window.strings["wins.today"], ou null
 *
 * Exemplo de uso em main.js:
 *   formatWinsI18n(42, getCurrentLang(location.pathname, ...), window.strings?.["wins.today"])
 */
export function formatWinsI18n(n, lang, tpl = null) {
  if (tpl) return tpl.replace(/\{n\}/g, n);

  switch (lang) {
    case "pt-br":  return `${n} ${n === 1 ? "pessoa já acertou" : "pessoas já acertaram"} o personagem de hoje!`;
    case "en-us":  return `${n} ${n === 1 ? "person has already guessed" : "people have already guessed"} today's character!`;
    case "es-es":  return `¡${n} ${n === 1 ? "persona ya adivinó" : "personas ya adivinaron"} el personaje de hoy!`;
    case "fr-fr":  return `${n} ${n === 1 ? "personne a déjà deviné" : "personnes ont déjà deviné"} le personnage d'aujourd'hui !`;
    case "it-it":  return `${n} ${n === 1 ? "persona ha già indovinato" : "persone hanno già indovinato"} il personaggio di oggi!`;
    case "de-de":  return `${n} ${n === 1 ? "Person hat" : "Personen haben"} die heutige Figur bereits erraten!`;
    case "ru-ru":  return `Уже ${n} ${n === 1 ? "человек угадал" : "человек угадали"} сегодняшнего персонажа!`;
    case "tr-tr":  return `${n} kişi bugünün karakterini bildi!`;
    case "uk-ua":  return `${n} ${n === 1 ? "людина вже відгадала" : "людей уже відгадали"} сьогоднішнього персонажа!`;
    case "ar-sa":  return `لقد خمن ${n} ${n === 1 ? "شخص" : "شخصًا"} شخصية اليوم بالفعل!`;
    case "ja-jp":  return `本日のキャラクターをすでに${n}人が正解！`;
    case "ko-kr":  return `오늘의 캐릭터를 이미 ${n}명이 맞췄어요!`;
    case "hi-in":  return `आज के किरदार को ${n} ${n === 1 ? "व्यक्ति ने" : "लोगों ने"} पहले ही पहचान लिया है!`;
    case "th-th":  return `${n} คนเดาได้ถูกต้องแล้ว!`;
    case "vi-vn":  return `Đã có ${n} người đoán đúng nhân vật hôm nay!`;
    case "id-id":  return `${n} orang sudah menebak karakter hari ini!`;
    case "zh-cn":  return `已有 ${n} 人猜对了今天的角色！`;
    case "zh-tw":  return `已有 ${n} 人猜對了今天的角色！`;
    case "fil-ph": return `${n} ${n === 1 ? "tao na" : "tao na ang"} nakahula ng karakter ngayon!`;
    case "ms-my":  return `${n} orang sudah meneka watak hari ini!`;
    default:       return `${n} people have already guessed today's character!`;
  }
}
