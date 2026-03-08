import { SUPPORTED } from "./utils/i18n";

(function () {
  var origin = window.location.origin;
  var p = window.location.pathname.replace(/\/+$/, "");
  var rx = new RegExp("/(" + SUPPORTED.join("|") + ")(/|$)", "i");
  var m = rx.exec(p);
  var lang = m ? m[1].toLowerCase() : "";

  // root "/" => canônica para /en-us/ e NOINDEX (evita duplicata)
  if (!lang) {
    document.getElementById("canon").href = origin + "/en-us/";
    var robots = document.getElementById("robotsTag");
    if (robots) robots.setAttribute("content", "noindex,follow");
  } else {
    // páginas de idioma => canônica é a própria
    document.getElementById("canon").href = origin + "/" + lang + "/";
  }

  // og:url alinhado com a canônica
  var og = document.getElementById("ogUrl");
  if (og) og.setAttribute("content", document.getElementById("canon").href);
})();

export function setupSeoMetaTags(lang, strings) {
  const TITLE_FALLBACKS = {
    "en-us": "DragonBallDle — Guess the Character of the Day",
    "pt-br": "DragonBallDle — Descubra o Personagem do Dia",
    "es-es": "DragonBallDle — Adivina el Personaje del Día",
    "fr-fr": "DragonBallDle — Devinez le personnage du jour",
    "it-it": "DragonBallDle — Indovina il personaggio del giorno",
    "de-de": "DragonBallDle — Errate den Charakter des Tages",
    "ru-ru": "DragonBallDle — Угадайте персонажа дня",
    "tr-tr": "DragonBallDle — Günün karakterini tahmin et",
    "uk-ua": "DragonBallDle — Вгадайте персонажа дня",
    "ar-sa": "DragonBallDle — خمّن شخصية اليوم",
    "ja-jp": "DragonBallDle — 今日のキャラクターを当てよう",
    "ko-kr": "DragonBallDle — 오늘의 캐릭터를 맞혀보세요",
    "hi-in": "DragonBallDle — आज के पात्र का अनुमान लगाएँ",
    "th-th": "DragonBallDle — ทายตัวละครประจำวัน",
    "vi-vn": "DragonBallDle — Đoán nhân vật trong ngày",
    "id-id": "DragonBallDle — Tebak Karakter Hari Ini",
    "zh-cn": "DragonBallDle — 猜今日角色",
    "zh-tw": "DragonBallDle — 猜今日角色",
    "fil-ph": "DragonBallDle — Hulaan ang Karakter ng Araw",
    "ms-my": "DragonBallDle — Teka Watak Hari Ini",
  };

  const fallbackDesc =
    lang === "pt-br"
      ? "Adivinhe o personagem de Dragon Ball de hoje. Desafio diário rápido e gratuito."
      : lang === "en-us"
        ? "Guess today’s Dragon Ball character. Fast, free daily challenge."
        : lang === "es-es"
          ? "Adivina el personaje de Dragon Ball de hoy. Reto diario rápido y gratuito."
          : lang === "fr-fr"
            ? "Devinez le personnage de Dragon Ball d’aujourd’hui. Défi quotidien rapide et gratuit."
            : lang === "it-it"
              ? "Indovina il personaggio di Dragon Ball di oggi. Sfida quotidiana veloce e gratuita."
              : lang === "de-de"
                ? "Errate den Dragon Ball-Charakter des Tages. Schnelle, kostenlose tägliche Herausforderung."
                : lang === "ru-ru"
                  ? "Угадайте сегодняшнего персонажа Dragon Ball. Быстрое и бесплатное ежедневное испытание."
                  : lang === "tr-tr"
                    ? "Bugünün Dragon Ball karakterini tahmin et. Hızlı ve ücretsiz günlük meydan okuma."
                    : lang === "uk-ua"
                      ? "Вгадай сьогоднішнього персонажа Dragon Ball. Швидке й безкоштовне щоденне випробування."
                      : lang === "ar-sa"
                        ? "خمن شخصية دراغون بول اليوم. تحدي يومي سريع ومجاني."
                        : lang === "ja-jp"
                          ? "今日のドラゴンボールのキャラクターを当てよう。早くて無料の毎日チャレンジ。"
                          : lang === "ko-kr"
                            ? "오늘의 드래곤볼 캐릭터를 맞혀보세요. 빠르고 무료인 일일 도전입니다."
                            : lang === "hi-in"
                              ? "आज के ड्रैगन बॉल चरित्र का अनुमान लगाएं। तेज़ और मुफ्त दैनिक चुनौती।"
                              : lang === "th-th"
                                ? "ทายตัวละครดราก้อนบอลประจำวันนี้ ท้าทายประจำวัน รวดเร็วและฟรี"
                                : lang === "vi-vn"
                                  ? "Đoán nhân vật Dragon Ball hôm nay. Thử thách hàng ngày nhanh và miễn phí."
                                  : lang === "id-id"
                                    ? "Tebak karakter Dragon Ball hari ini. Tantangan harian cepat dan gratis."
                                    : lang === "zh-cn"
                                      ? "猜猜今天的龙珠角色。快速且免费的每日挑战。"
                                      : lang === "zh-tw"
                                        ? "猜猜今天的七龍珠角色。快速又免費的每日挑戰。"
                                        : lang === "fil-ph"
                                          ? "Hulaan ang Dragon Ball character ngayon. Mabilis at libreng daily challenge."
                                          : lang === "ms-my"
                                            ? "Teka watak Dragon Ball hari ini. Cabaran harian pantas dan percuma."
                                            : "Guess today’s Dragon Ball character. Fast, free daily challenge.";

  const finalTitle = strings?.["meta.title"] || TITLE_FALLBACKS[lang] || TITLE_FALLBACKS["en-us"];
  document.title = finalTitle;
  const metaTitleEl = document.getElementById("meta-title");
  if (metaTitleEl) metaTitleEl.textContent = finalTitle;
  const ogTitle = document.getElementById("og-title");
  if (ogTitle) ogTitle.setAttribute("content", finalTitle);

  const finalDesc = strings?.["meta.description"] || fallbackDesc;
  const metaDesc = document.getElementById("meta-description");
  if (metaDesc) metaDesc.setAttribute("content", finalDesc);
  const ogDesc = document.getElementById("og-description");
  if (ogDesc) ogDesc.setAttribute("content", finalDesc);
}
