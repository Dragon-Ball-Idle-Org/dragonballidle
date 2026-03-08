(function () {
  // === SUPPORTED deve bater com i18n.js ===
  var SUPPORTED = [
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
