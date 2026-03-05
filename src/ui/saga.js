import { norm, hnorm } from "../utils/string";

const SAGA_CSV_URL = "/public/data/debutSaga-tr.csv";

// ── Parser CSV simples (suporta aspas duplas) ─────────────────────────────────
function parseCSV(text) {
  const rows = [];
  let cur = "";
  let row = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i],
      n = text[i + 1];
    if (c === '"' && inQuotes && n === '"') {
      cur += '"';
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (c === "," && !inQuotes) {
      row.push(cur);
      cur = "";
      continue;
    }
    if ((c === "\n" || c === "\r") && !inQuotes) {
      if (cur.length || row.length) {
        row.push(cur);
        rows.push(row);
        row = [];
        cur = "";
      }
      continue;
    }
    cur += c;
  }
  if (cur.length || row.length) {
    row.push(cur);
    rows.push(row);
  }
  return rows;
}

// ── Carrega e monta window.sagaOrder ─────────────────────────────────────────

export async function loadSagaOrderByCSV(lang = "en-us") {
  if (window.sagaOrder) return window.sagaOrder; // já carregado

  const res = await fetch(SAGA_CSV_URL, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load debut saga CSV");

  const text = await res.text();
  const rows = parseCSV(text).filter((r) => r && r.length);

  if (!rows.length) throw new Error("Empty CSV");

  // detecta se a primeira linha é cabeçalho (contém pt|en|es em algum termo)
  const first = rows[0].map(hnorm);
  const looksHeader = first.some((h) =>
    /^(pt|ptbr|portugues|enus|english|eses|spanish|espanol|espanol)$/.test(h),
  );

  let dataStart = 0;
  let colId = 0,
    colPT = 1,
    colEN = 2,
    colES = 3;

  if (looksHeader) {
    // mapeia colunas por sinônimos
    const header = rows[0].map(hnorm);
    const idx = (names) => {
      for (const n of names) {
        const i = header.indexOf(n);
        if (i >= 0) return i;
      }
      return -1;
    };
    colId = idx(["id", "code", "codigo", "identificador"]);
    colPT = idx(["ptbr", "pt", "portugues", "portuguesa"]);
    colEN = idx(["enus", "en", "english"]);
    colES = idx(["eses", "es", "spanish", "espanol", "espanol"]);

    if (colId < 0 || colPT < 0 || colEN < 0 || colES < 0) {
      console.error("Header normalizado:", header);
      throw new Error(
        "CSV precisa conter colunas id + PT/EN/ES (ex.: id,pt-br,en-us,es-es) OU não ter cabeçalho (id,pt,en,es).",
      );
    }
    dataStart = 1;
  } else {
    // sem cabeçalho: assume [id, pt-br, en-us, es-es]
    dataStart = 0;
    colId = 0;
    colPT = 1;
    colEN = 2;
    colES = 3;
  }

  // === NOVO: aliases de idioma e init dinâmico ===
  const LANG_ALIAS = {
    // bases já existentes no CSV
    "pt-br": "pt-br",
    "en-us": "en-us",
    "es-es": "es-es",
    "fr-fr": "en-us",
    "it-it": "en-us",
    "de-de": "en-us",
    "ru-ru": "en-us",
    "tr-tr": "en-us",
    "uk-ua": "en-us",
    "ar-sa": "en-us",
    "ja-jp": "en-us",
    "ko-kr": "en-us",
    "hi-in": "en-us",
    "th-th": "en-us",
    "vi-vn": "en-us",
    "id-id": "en-us",
    "zh-cn": "en-us",
    "zh-tw": "en-us",
    "fil-ph": "en-us",
    "ms-my": "en-us",
  };

  const mapByLang = {};
  Object.keys(LANG_ALIAS).forEach((code) => {
    mapByLang[code] = {};
  });

  // índices (pela ordem das linhas) que NUNCA devem ter seta
  const skipIndex = new Set(); // movie / none

  let order = 0;
  for (let i = dataStart; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length < 4) continue;

    order += 1; // a ordem é a ordem das linhas

    const id = String(r[colId] || "").trim();
    const pt = r[colPT],
      en = r[colEN],
      es = r[colES];

    // escolhe qual coluna usar conforme a base do alias
    const getNameForBase = (base) => {
      if (base === "pt-br") return pt;
      if (base === "es-es") return es;
      return en; // fallback EN
    };

    // escreve para TODOS os locales suportados
    for (const code of Object.keys(LANG_ALIAS)) {
      const base = LANG_ALIAS[code];
      const name = getNameForBase(base);
      if (name) {
        mapByLang[code][norm(name)] = order;
      }
    }

    // nunca desenhar seta para "movie" e "none"
    if (id.toLowerCase() === "movie" || id.toLowerCase() === "none") {
      skipIndex.add(order);
    }
  }

  window.sagaOrder = {
    indexFor(name) {
      const key = norm(name);
      const code = LANG_ALIAS[lang] || "en-us"; // resolve o alias do locale atual
      return mapByLang[code]?.[key] ?? null;
    },
    isFilmByName(name) {
      const idx = this.indexFor(name);
      return idx != null && skipIndex.has(idx); // movie/none
    },
  };

  return window.sagaOrder;
}

// ── Desenha seta ↑/↓ na célula de Saga ───────────────────────────────────────

export function drawSagaArrow(targetEl, guessSaga, dailySaga) {
  const order = window.sagaOrder;
  if (!order) return;

  const gi = order.indexFor(guessSaga);
  const di = order.indexFor(dailySaga);

  if (
    gi == null ||
    di == null ||
    gi === di ||
    order.isFilmByName(guessSaga) ||
    order.isFilmByName(dailySaga)
  ) {
    return; // nada a desenhar
  }

  // evita duplicar
  const old = targetEl.querySelector(".saga-arrow");
  if (old) old.remove();

  // garante empilhamento controlado
  const cs = getComputedStyle(targetEl);
  if (cs.position === "static") targetEl.style.position = "relative";

  const wrapper = document.createElement("div");
  wrapper.className = "saga-arrow";
  wrapper.style.position = "absolute";
  wrapper.style.inset = "0";
  wrapper.style.display = "flex";
  wrapper.style.flexDirection = "column";
  wrapper.style.alignItems = "center";
  wrapper.style.justifyContent = "center";
  wrapper.style.pointerEvents = "none";
  wrapper.style.zIndex = "0"; // ← seta ATRÁS do texto

  const tri = document.createElement("div");
  const body = document.createElement("div");
  body.style.width = "30px";
  body.style.height = "40px";
  body.style.backgroundColor = "#300";

  if (gi < di) {
    // ↑
    tri.style.width = "0";
    tri.style.height = "0";
    tri.style.borderLeft = "30px solid transparent";
    tri.style.borderRight = "30px solid transparent";
    tri.style.borderBottom = "30px solid #300";
    wrapper.appendChild(tri);
    wrapper.appendChild(body);
  } else {
    // ↓
    tri.style.width = "0";
    tri.style.height = "0";
    tri.style.borderLeft = "30px solid transparent";
    tri.style.borderRight = "30px solid transparent";
    tri.style.borderTop = "30px solid #300";
    wrapper.appendChild(body);
    wrapper.appendChild(tri);
  }

  targetEl.appendChild(wrapper);
}
