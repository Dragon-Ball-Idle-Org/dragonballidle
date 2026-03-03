let characters;        // será preenchido após injetar o script por idioma
let randomCharacter;   // será definido depois que characters ficar pronto
const getInput = document.getElementById("search");
let suggestions = document.getElementById("suggestions");
const getSubmitGuess = document.getElementById("submit-button");
const form = document.getElementById("guess-form");
const attributeContainer = document.getElementById("attribute-container");
const closePopup = document.getElementById("close-popup");
const tryNumber = document.getElementById("nTry");
const CHAR_IMG_BASE = "/public/"; // <-- isto é essencial
const CHAR_IMG_BASE_THUMB = "/public/thumbs/";


// ===== CONTADOR DE VITÓRIAS (do dia) =====
const WINS_API = '/api/wins.php';

// injeta CSS do badge só uma vez
function ensureWinsBadgeCSS() {
  if (document.getElementById('wins-badge-style')) return;
  const css = `
  .intro-guess .wins-badge{
    display:inline-block;
    padding:0.15rem 0.55rem;
    border-radius:999px;
    background:linear-gradient(135deg, #32cd32, #228b22);
    color:#fff;
    font-weight:800;
    box-shadow:0 6px 18px rgba(255,61,0,.35);
    text-shadow:0 1px 0 rgba(0,0,0,.25);
    transform:translateZ(0);
  }
  .intro-guess .wins-badge.pulse{
    animation:winsPulse .6s ease-out;
  }
  @keyframes winsPulse{
    0%{ transform:scale(1); box-shadow:0 0 0 rgba(255,61,0,0); }
    40%{ transform:scale(1.08); box-shadow:0 10px 24px rgba(255,61,0,.45); }
    100%{ transform:scale(1); box-shadow:0 6px 18px rgba(255,61,0,.35); }
  }`;
  const style = document.createElement('style');
  style.id = 'wins-badge-style';
  style.textContent = css;
  document.head.appendChild(style);
}


// idioma atual (segue a mesma lógica usada no seu boot)
function getCurrentLang() {
  const pathLang = (location.pathname.split('/')[1] || '').toLowerCase();
  const htmlLang = (document.documentElement.getAttribute('lang') || '').toLowerCase();
  return pathLang || htmlLang || 'en-us';
}

// pega o span do herói onde estava o "Type any character..."
function getIntroEl() {
  return document.querySelector('.intro-guess');
}

// formata a mensagem com base nos locales (usa window.strings se existir; senão fallbacks leves)
function formatWinsI18n(n) {
  const s = (window.strings && window.strings["wins.today"]) || null;
  if (s) return s.replace(/\{n\}/g, n);

    // fallbacks mínimos por idioma comum; se quiser, remova ao confirmar que strings["wins.today"] está OK
    switch (getCurrentLang()) {
      case 'pt-br': return `${n} ${n === 1 ? 'pessoa já acertou' : 'pessoas já acertaram'} o personagem de hoje!`;
      case 'en-us': return `${n} ${n === 1 ? 'person has already guessed' : 'people have already guessed'} today's character!`;
      case 'es-es': return `¡${n} ${n === 1 ? 'persona ya adivinó' : 'personas ya adivinaron'} el personaje de hoy!`;
      case 'fr-fr': return `${n} ${n === 1 ? 'personne a déjà deviné' : 'personnes ont déjà deviné'} le personnage d’aujourd’hui !`;
      case 'it-it': return `${n} ${n === 1 ? 'persona ha già indovinato' : 'persone hanno già indovinato'} il personaggio di oggi!`;
      case 'de-de': return `${n} ${n === 1 ? 'Person hat' : 'Personen haben'} die heutige Figur bereits erraten!`;
      case 'ru-ru': return `Уже ${n} ${n === 1 ? 'человек угадал' : 'человек угадали'} сегодняшнего персонажа!`;
      case 'tr-tr': return `${n} ${n === 1 ? 'kişi bugünün karakterini bildi' : 'kişi bugünün karakterini bildi'}!`;
      case 'uk-ua': return `${n} ${n === 1 ? 'людина вже відгадала' : 'людей уже відгадали'} сьогоднішнього персонажа!`;
      case 'ar-sa': return `لقد خمن ${n} ${n === 1 ? 'شخص' : 'شخصًا'} شخصية اليوم بالفعل!`;
      case 'ja-jp': return `本日のキャラクターをすでに${n}人が正解！`;
      case 'ko-kr': return `오늘의 캐릭터를 이미 ${n}명이 맞췄어요!`;
      case 'hi-in': return `आज के किरदार को ${n} ${n === 1 ? 'व्यक्ति ने' : 'लोगों ने'} पहले ही पहचान लिया है!`;
      case 'th-th': return `${n} ${n === 1 ? 'คนเดาได้ถูกต้องแล้ว' : 'คนเดาได้ถูกต้องแล้วสำหรับตัวละครของวันนี้'}!`;
      case 'vi-vn': return `Đã có ${n} ${n === 1 ? 'người' : 'người'} đoán đúng nhân vật hôm nay!`;
      case 'id-id': return `${n} ${n === 1 ? 'orang sudah menebak' : 'orang sudah menebak'} karakter hari ini!`;
      case 'zh-cn': return `已有 ${n} 人猜对了今天的角色！`;
      case 'zh-tw': return `已有 ${n} 人猜對了今天的角色！`;
      case 'fil-ph': return `${n} ${n === 1 ? 'tao na' : 'tao na ang'} nakahula ng karakter ngayon!`;
      case 'ms-my': return `${n} ${n === 1 ? 'orang sudah meneka' : 'orang sudah meneka'} watak hari ini!`;
      default:       return `${n} people have already guessed today's character!`;
    }
}

// mantém o último valor mostrado pra sabermos se deve “pulsar”
let _lastWinsShown = null;

function updateIntroWins(n) {
  const el = getIntroEl();
  if (!el) return;

  // garante CSS do badge
  ensureWinsBadgeCSS();

  // 1) se tiver locale "wins.today", injeta <span class="wins-badge">{n}</span>
  const tpl = (window.strings && window.strings["wins.today"]) || null;
  if (tpl) {
    const html = tpl.replace(/\{n\}/g, `<span class="wins-badge">${Number(n)||0}</span>`);
    el.innerHTML = html;
  } else {
    // 2) senão, usa os fallbacks do formatWinsI18n mas com badge
    const plain = formatWinsI18n(Number(n)||0);
    // só troca o número inicial pela versão com span (pega o primeiro número contínuo)
    const html = plain.replace(/\d[\d\.]*/,(m)=>`<span class="wins-badge">${m}</span>`);
    el.innerHTML = html;
  }

  // efeito “pulse” apenas quando o valor AUMENTAR (ex.: após vitória)
  const badge = el.querySelector('.wins-badge');
  if (badge && (typeof _lastWinsShown !== 'number' || Number(n) > _lastWinsShown)) {
    badge.classList.remove('pulse');
    // força reflow pra reiniciar animação
    void badge.offsetWidth;
    badge.classList.add('pulse');
  }
  _lastWinsShown = Number(n)||0;
}


// === chamadas à API PHP ===
async function fetchWinsToday() {
  const ymd = todayBrasiliaKey(); // usa sua função existente
  const url = `${WINS_API}?date=${encodeURIComponent(ymd)}&_=${Date.now()}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('wins GET failed');
  const { wins = 0 } = await res.json();
  return wins | 0;
}

async function incrementWinsToday() {
  const ymd = todayBrasiliaKey();
  const res = await fetch(WINS_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify({ date: ymd, delta: 1 })
  });
  if (!res.ok) throw new Error('wins POST failed');
  const { wins = 0 } = await res.json();
  return wins | 0;
}

// polling leve + virada do dia
let winsPollTimer = null;
function startWinsPolling() {
  const T = 5 * 60 * 1000; // 5 min
  const tick = async () => {
    try { updateIntroWins(await fetchWinsToday()); }
    catch (e) { console.warn('wins poll failed', e); }
  };
  tick();
  clearInterval(winsPollTimer);
  winsPollTimer = setInterval(tick, T);
}

function scheduleMidnightRefresh() {
  const now = getBrasiliaTime(); // sua função existente
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const ms = midnight - now;
  setTimeout(() => { startWinsPolling(); scheduleMidnightRefresh(); }, Math.max(1000, ms));
}



// --- Estado do dropdown (teclado) ---
let activeIndex = -1;
let currentItems = [];
let usingMouse = false; // se o mouse mexeu por último

function setActiveIndex(i) {
  const items = [...suggestions.children];
  if (!items.length) return;

  activeIndex = Math.max(0, Math.min(i, items.length - 1));
  items.forEach((li, idx) => li.classList.toggle('selected', idx === activeIndex));

  // rola junto quando necessário
  items[activeIndex].scrollIntoView({ block: 'nearest' });
}

function flipDropdownIfNeeded() {
  if (!suggestions) return;

  const input  = document.querySelector('#guess-form .guess-input');
  const button = document.getElementById('submit-button');
  if (!input || !button) return;

  const inputRect  = input.getBoundingClientRect();
  const buttonRect = button.getBoundingClientRect();
  const gap = 10; // mesmo gap visual do CSS

  // largura do dropdown = espaço entre o início do input e o botão
  const left  = inputRect.left;
  const width = Math.max(180, (buttonRect.left - gap) - left);

  const spaceBelow = window.innerHeight - inputRect.bottom;
  const spaceAbove = inputRect.top;

  // heurística: se não cabe 240px abaixo e acima tem mais espaço, abre pra cima
  const needUp = spaceBelow < 240 && spaceAbove > spaceBelow;

    // altura de um item (bate com o CSS: min-height: 80px)
    const ITEM_H    = 80;
    // limite “5 itens” (cap superior), mas mínimo de 160px para não ficar curto demais
    const FIVE_CAP  = ITEM_H * 5;
    const MIN_OPEN  = 160; // ~2 itens
    
    if (needUp) {
      suggestions.classList.add('drop-up');
      suggestions.style.top = '';
      suggestions.style.bottom = (window.innerHeight - inputRect.top + 8) + 'px';
    
      const available = Math.max(0, spaceAbove - 16);           // espaço real acima
      const target    = Math.max(MIN_OPEN, available);           // respeita mínimo
      suggestions.style.maxHeight = Math.min(FIVE_CAP, target) + 'px'; // **capa em 5**
    } else {
      suggestions.classList.remove('drop-up');
      suggestions.style.bottom = '';
      suggestions.style.top = (inputRect.bottom + 8) + 'px';
    
      const available = Math.max(0, spaceBelow - 16);            // espaço real abaixo
      const target    = Math.max(MIN_OPEN, available);
      suggestions.style.maxHeight = Math.min(FIVE_CAP, target) + 'px'; // **capa em 5**
    }


  // posicionamento horizontal/tamanho
  suggestions.style.left  = left + 'px';
  suggestions.style.width = width + 'px';
}



let _portalActive = false;

function openSuggestions() {
  if (!suggestions) suggestions = document.getElementById('suggestions');
  const host = document.getElementById('guess-form');
  if (!host || !suggestions) return;

  // abre visualmente
  suggestions.classList.add('open');

  // === PORTAL: move para o <body> e liga listeners de reposicionamento ===
  if (!_portalActive) {
    suggestions.classList.add('portal');          // ativa CSS de portal (position: fixed)
    document.body.appendChild(suggestions);       // tira do form
    _portalActive = true;
    window.addEventListener('scroll', flipDropdownIfNeeded, true);
    window.addEventListener('resize', flipDropdownIfNeeded);
  }

  // posiciona na próxima pintura (já com dimensões corretas)
  requestAnimationFrame(() => { flipDropdownIfNeeded(); });
}


function closeSuggestions() {
  if (!suggestions) return;

  suggestions.classList.remove('open', 'drop-up');
  suggestions.style.top = '';
  suggestions.style.bottom = '';
  suggestions.style.left = '';
  suggestions.style.width = '';
  suggestions.style.maxHeight = '';

  // desmonta o portal (volta para dentro do form)
  if (_portalActive) {
    const host = document.getElementById('guess-form');
    if (host) host.appendChild(suggestions);
    suggestions.classList.remove('portal');
    _portalActive = false;
    window.removeEventListener('scroll', flipDropdownIfNeeded, true);
    window.removeEventListener('resize', flipDropdownIfNeeded);
  }
}




// --- Util para apontar para o thumb (public/thumb/<arquivo>.png) ---
function getThumbSrc(imagePath) {
  // Ex.: "image/android_13.png" -> "android_13.png"
  const filename = imagePath.split("/").pop();
  return `${CHAR_IMG_BASE_THUMB}${filename}`;
}


// === debut saga order (multi-idioma via CSV) =================================
const SAGA_CSV_URL = "/public/data/debutSaga-tr.csv";

// CSV simples (com aspas)
function parseCSV(text) {
  const rows = [];
  let cur = "", row = [], inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i], n = text[i + 1];
    if (c === '"' && inQuotes && n === '"') { cur += '"'; i++; continue; }
    if (c === '"') { inQuotes = !inQuotes; continue; }
    if (c === ',' && !inQuotes) { row.push(cur); cur = ""; continue; }
    if ((c === '\n' || c === '\r') && !inQuotes) {
      if (cur.length || row.length) { row.push(cur); rows.push(row); row = []; cur = ""; }
      continue;
    }
    cur += c;
  }
  if (cur.length || row.length) { row.push(cur); rows.push(row); }
  return rows;
}

// normaliza string para comparar (minúsculas, sem acento, sem espaços extras)
function norm(s) {
  return String(s || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().trim();
}

async function loadSagaOrderByCSV(lang = "en-us") {
  if (window.sagaOrder) return window.sagaOrder; // já carregado

  const res = await fetch(SAGA_CSV_URL, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load debut saga CSV");

  const text = await res.text();
  const rows = parseCSV(text).filter(r => r && r.length);

  if (!rows.length) throw new Error("Empty CSV");

  // normaliza para comparar chaves
  const hnorm = (s) => String(s || "").toLowerCase().trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]/g, "");

  // detecta se a primeira linha é cabeçalho (contém pt|en|es em algum termo)
  const first = rows[0].map(hnorm);
  const looksHeader = first.some(h => /^(pt|ptbr|portugues|enus|english|eses|spanish|espanol|espanol)$/.test(h));

  let dataStart = 0;
  let colId = 0, colPT = 1, colEN = 2, colES = 3;

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
    colId = idx(["id","code","codigo","identificador"]);
    colPT = idx(["ptbr","pt","portugues","portuguesa"]);
    colEN = idx(["enus","en","english"]);
    colES = idx(["eses","es","spanish","espanol","espanol"]);

    if (colId < 0 || colPT < 0 || colEN < 0 || colES < 0) {
      console.error("Header normalizado:", header);
      throw new Error("CSV precisa conter colunas id + PT/EN/ES (ex.: id,pt-br,en-us,es-es) OU não ter cabeçalho (id,pt,en,es).");
    }
    dataStart = 1;
  } else {
    // sem cabeçalho: assume [id, pt-br, en-us, es-es]
    dataStart = 0;
    colId = 0; colPT = 1; colEN = 2; colES = 3;
  }

  const norm = (s) => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

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

    // idioma atual -> (nome normalizado -> índice)
    const mapByLang = {};
    Object.keys(LANG_ALIAS).forEach(code => { mapByLang[code] = {}; });



  // índices (pela ordem das linhas) que NUNCA devem ter seta
  const skipIndex = new Set(); // movie / none

  let order = 0;
  for (let i = dataStart; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length < 4) continue;

    order += 1; // a ordem é a ordem das linhas

    const id = String(r[colId] || "").trim();
    const pt = r[colPT], en = r[colEN], es = r[colES];

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
    }
  };

  return window.sagaOrder;
}


// Desenha a seta ↑/↓ na célula de Saga, usando o mapa canônico (window.sagaOrder)
function drawSagaArrow(targetEl, guessSaga, dailySaga) {
  const order = window.sagaOrder;
  if (!order) return;

  const gi = order.indexFor(guessSaga);
  const di = order.indexFor(dailySaga);

  if (
    gi == null || di == null || gi === di ||
    order.isFilmByName(guessSaga) || order.isFilmByName(dailySaga)
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
  wrapper.style.zIndex = "0";       // ← seta ATRÁS do texto

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



/* Pega o personagem aleatório do dia com PRNG de seed (+ sal) */
const getDailyCharacter = () => {
  const today = formatYMD(getBrasiliaTime()); // já existe no seu código
  return getCharacterForDay(today);
};

// expõe no escopo global p/ usar no Console
window.getDailyCharacter = getDailyCharacter;
// ======= Calendário determinístico sem repetição (<N dias) =======
// Garante no mínimo N dias sem repetição (N = nº de personagens).
// Se N >= 90, você cumpre a regra de 90 dias sem repetir.

const EPOCH_YMD = "2025-01-01"; // mantenha estável (fixa o calendário)

// Lista canônica estável (minimiza alterações se a ordem original mudar)
function getCanonicalList() {
  const list = (window.characters || characters || []);
  return list.slice().sort((a, b) => {
    const aKey = (a.id ? String(a.id) : String(a.name || "")).toLowerCase();
    const bKey = (b.id ? String(b.id) : String(b.name || "")).toLowerCase();
    return aKey.localeCompare(bKey);
  });
}

// Permutação Fisher–Yates com PRNG seeded (usa cyrb128 + mulberry32 existentes)
function buildDeterministicPermutation(n, salt) {
  const arr = Array.from({ length: n }, (_, i) => i);
  const [s0] = cyrb128(String(salt || ""));
  const rand = mulberry32(s0);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Cache da permutação por dataset
let __PERM_CACHE = null;
let __PERM_SIG = null;

function getPermutationForCurrentDataset() {
  const canon = getCanonicalList();
  const sig = canon.map(c => (c.id ? `#${c.id}` : c.name || "")).join("|");
  if (__PERM_CACHE && __PERM_SIG === sig) return __PERM_CACHE;

  // Use um segredo estável (reaproveita DAILY_SECRET que já existe no seu código)
  const PERM_SECRET = DAILY_SECRET + "|perm-v1";
  __PERM_CACHE = buildDeterministicPermutation(canon.length, PERM_SECRET);
  __PERM_SIG   = sig;
  return __PERM_CACHE;
}

// Diferença de dias entre YYYY-MM-DD sem fuso
function daysBetween(ymdFrom, ymdTo) {
  const a = new Date(ymdFrom + "T00:00:00Z");
  const b = new Date(ymdTo   + "T00:00:00Z");
  return Math.floor((b - a) / 86400000);
}

// --- Janela de exclusão de repetição ---
const WINDOW_DAYS = 30;        // <- troque aqui se quiser 30, 45, etc.
const MAX_ATTEMPTS = 6;       // nº de tentativas por dia antes do fallback

// Converte índice de dias (k) -> YYYY-MM-DD, relativo ao EPOCH_YMD
function ymdFromDayIndex(k) {
  const d = new Date(EPOCH_YMD + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + k);
  return d.toISOString().slice(0,10);
}

// Cache da sequência já calculada (por índice k)
let __SEQ_CACHE_UP_TO = -1;
let __SEQ_CACHE = []; // guarda índices da lista canônica

// Sorteia um candidato determinístico (0..N-1) a partir de data e nº da tentativa
function deterministicCandidate(ymd, attempt, N) {
  const seedStr = `${ymd}|${attempt}|${DAILY_SECRET}|soft-norepeat-v1`;
  const [s0] = cyrb128(seedStr);
  const rnd = mulberry32(s0);
  return Math.floor(rnd() * N);
}


function getCharacterForDay(ymd) {
  const canon = getCanonicalList();
  const N = canon.length;
  if (!N) return null;

  const targetK = daysBetween(EPOCH_YMD, ymd);

  // calcula sequencialmente do último cache até o dia alvo
  for (let k = __SEQ_CACHE_UP_TO + 1; k <= targetK; k++) {
    const dayYMD = ymdFromDayIndex(k);

    // Coleta últimos WINDOW_DAYS escolhidos (índices canônicos)
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
      if (!recent.has(cand)) { chosen = cand; break; }
    }

    // Fallback determinístico: escolhe o "menos recente" entre alguns candidatos
    if (chosen == null) {
      let bestIdx = null;
      let bestGap = -Infinity;
      for (let attempt = 0; attempt < Math.max(MAX_ATTEMPTS, 32); attempt++) {
        const cand = deterministicCandidate(dayYMD, attempt, N);
        // quando foi a última vez que saiu?
        let last = -Infinity;
        for (let i = k - 1; i >= start; i--) {
          if (__SEQ_CACHE[i] === cand) { last = i; break; }
        }
        const gap = (last === -Infinity) ? 1e9 : (k - last); // quanto mais longe, melhor
        if (gap > bestGap) { bestGap = gap; bestIdx = cand; }
      }
      chosen = bestIdx ?? 0;
    }

    __SEQ_CACHE[k] = chosen;
    __SEQ_CACHE_UP_TO = k;
  }

  const canonIdx = __SEQ_CACHE[targetK];
  return canon[canonIdx];
}



// expõe no escopo global p/ usar no Console
window.getCharacterForDay = getCharacterForDay;


////////////////////////////////////

/* Faz com que nao de reload na pagina ao clicar no botal de adivinhar */
form.addEventListener("submit", function (event) {
  event.preventDefault();
});

let tryCount = 1;

// Função para garantir que o valor é array
function toArray(val) {
  if (Array.isArray(val)) return val;
  if (typeof val === "string" && val.includes(",")) {
    return val.split(",").map((v) => v.trim());
  }
  return [val];
}

// Função para comparar arrays
function compareValuesArray(val1, val2) {
  const arr1 = toArray(val1);
  const arr2 = toArray(val2);

  // Exatamente iguais (mesmo tamanho, mesmos valores, mesma ordem)
  if (arr1.length === arr2.length && arr1.every((v, i) => v === arr2[i])) {
    return "exact";
  }

  // Parcial: pelo menos um valor igual
  if (arr1.some((v) => arr2.includes(v))) {
    return "partial";
  }

  // Nenhuma interseção
  return "none";
}

////// CRIA OS CHUTES

function fitTextToBox(el, minPx = 8, step = 1) {
  const style = window.getComputedStyle(el);
  let size = parseFloat(style.fontSize) || 14;

  // diminui até caber ou chegar no mínimo
  while (el.scrollHeight > el.clientHeight && size > minPx) {
    size -= step;
    el.style.fontSize = size + "px";
    el.style.lineHeight = "1.05";
  }

  // só usa tooltip nativo em células NORMAIS (não na de imagem)
  if (!el.classList.contains('guess-image')) {
    if (!el.title) el.title = el.textContent.trim();
  } else {
    el.removeAttribute('title');
  }
}



function fitAllTypeBoxes() {
  document.querySelectorAll(".typeBox").forEach(fitTextToBox);
}

getInput.addEventListener("keydown", (e) => {
  // Se o dropdown não está aberto, ignore
  if (!suggestions.classList.contains("open") || !suggestions.children.length) return;

  // Impede a página ou o container rolarem com as setas
  if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === "Escape") {
    e.preventDefault();
  }

  if (e.key === "ArrowDown") {
    usingMouse = false;
    setActiveIndex(activeIndex + 1);        // vai para o próximo
  } else if (e.key === "ArrowUp") {
    usingMouse = false;
    setActiveIndex(activeIndex - 1);        // vai para o anterior
  } else if (e.key === "Enter") {
    // Enter envia o item selecionado (se houver)
    if (activeIndex >= 0) {
      const li = suggestions.children[activeIndex];
      const name = li?.dataset?.name || li?.querySelector("span")?.textContent || "";
      if (name) {
        handleGuess(name);
        closeSuggestions();
        getInput.value = "";
      }
    }
  } else if (e.key === "Escape") {
    closeSuggestions();
  }
});

// Encontra o container real da grade de chutes, independente do id/classe
function getGuessesHost() {
  const el =
    document.getElementById("guesses-container") ||   // que usei no patch anterior
    document.getElementById("guesses") ||
    document.getElementById("guessesGrid") ||
    document.querySelector(".guesses-container") ||
    document.querySelector("#guesses .rows") ||
    document.querySelector("#grid .rows") ||
    document.querySelector("#grid") ||
    document.querySelector('[data-role="guesses"]');

  if (!el) {
    console.error("Guesses host not found — ajuste o seletor aqui para o seu HTML.");
    throw new Error("Guesses host not found");
  }
  return el;
}


function createGuessBox(itemFound) {
  // HOST: onde as linhas de chute vão
  let host = document.getElementById("guesses-container");
  if (!host) {
    const panel =
      document.querySelector(".guesses-container") ||
      document.querySelector(".guess-container") ||
      document.body;
    host = document.createElement("div");
    host.id = "guesses-container";
    panel.appendChild(host);
  }

  // LINHA (usa o grid do CSS .guessesBox-container)
  const row = document.createElement("div");
  row.className = "guessesBox-container";

  // insere NO TOPO (3º, 2º, 1º)
  if (host.firstChild) host.insertBefore(row, host.firstChild);
  else host.appendChild(row);

  // 1ª COLUNA: mini imagem (preenche 100%)
  const pic = document.createElement("div");
  pic.className = "typeBox guess-image";
  pic.style.position = "relative";
  pic.style.padding = "0";
  pic.style.overflow = "hidden";

  const img = document.createElement("img");
  img.src = getThumbSrc(itemFound.image);
  img.alt = itemFound.name;
  img.loading = "lazy";
  img.style.width = "100%";
  img.style.height = "100%";
  img.style.objectFit = "cover";
  img.style.display = "block";
  img.style.borderRadius = "10px";

  pic.appendChild(img);
  pic.setAttribute("data-label", itemFound.name);
  row.appendChild(pic);

  // DEMAIS COLUNAS (ordem do cabeçalho)
  const columns = [
    ["gender", "Gender"],
    ["race", "Race"],
    ["affiliation", "Affiliation"],
    ["transformation", "Transformation"],
    ["attribute", "Attribute"],
    ["series", "Series"],
    ["debutSaga", "Saga"],
  ];

  columns.forEach(([key]) => {
    const cell = document.createElement("div");
    cell.className = "typeBox";
    cell.style.position = "relative";

    const val = itemFound[key];
    const content = document.createElement("div");
    content.className = "cell-content";
    content.style.position = "relative";
    content.style.zIndex = "1";
    content.textContent = Array.isArray(val) ? val.join(", ") : (val ?? "");

    cell.appendChild(content);

    // cor conforme regra
    const result = compareValuesArray(itemFound[key], randomCharacter[key]);
    if (result === "exact") {
      cell.style.backgroundColor = "rgb(0,180,0)";         // verde
    } else if (result === "partial") {
      cell.style.backgroundColor = "rgba(236,138,10,1)";   // laranja
    } else {
      cell.style.backgroundColor = "rgb(255,0,0)";         // vermelho
    }

    // seta da SAGA (↑ / ↓)
    if (key === "debutSaga") {
      drawSagaArrow(cell, itemFound.debutSaga, randomCharacter.debutSaga);
    }

    row.appendChild(cell);
    if (typeof fitTextToBox === "function") fitTextToBox(cell);
  });

    // REVEAL: animação em “stagger”
    requestAnimationFrame(() => {
      const cells = Array.from(row.querySelectorAll(".typeBox"));
      cells.forEach((c, i) => {
        // só anima se AINDA não foi revelado (evita reanimar no restore)
        if (!c.classList.contains("revealed")) {
          c.style.animationDelay = `${i * 250}ms`;   // 0ms, 70ms, 140ms, ...
          c.classList.add("revealed");
          // NÃO adicionamos .visible para não criar uma 2ª transição
        }
      });
      if (typeof fitAllTypeBoxes === "function") {
        requestAnimationFrame(() => fitAllTypeBoxes());
      }
    });

}


////////////////////////////////
// --- rola o trilho horizontal até o fim (usa o CSS novo de overflow-x) ---
function scrollGuessesToRight() {
  const scroller = document.querySelector(".guess-container");
  if (scroller) {
    scroller.scrollTo({ left: scroller.scrollWidth, behavior: "smooth" });
  }
}

// Breakpoint onde telas "pequenas" não devem rolar para a direita
const STICK_LEFT_BP = 768;

// Rola imediatamente p/ a coluna 0, sem animação
function scrollToLeftNow(el) {
  if (!el) return;
  // desliga smooth momentaneamente
  const prev = el.style.scrollBehavior;
  el.style.scrollBehavior = 'auto';
  el.scrollLeft = 0;
  el.style.scrollBehavior = prev || '';
}

function handleGuess(userInput) {
  // 0) normaliza entrada e bloqueia vazios
  const g = String(userInput || "").trim();
  if (!g) return;

  // 1) garante que o banco está carregado
  if (!window.characters || !Array.isArray(window.characters) || !window.characters.length) {
    return; // sem banco, não processa
  }

  // 2) busca personagem válido (case/acentos-insensível)
  const eq = (a, b) =>
    String(a || "")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase().trim()
    ===
    String(b || "")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase().trim();

  const itemFound = characters.find(c => eq(c.name, g));

  // 3) se NÃO existir no dataset, não dispara guess do GTM
  if (!itemFound) {
    // (opcional) mande um evento separado só para debug/monitoramento:
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'dbz_guess_invalid', query: g, date_key: todayBrasiliaKey() });
    return;
  }

  // 4) agora sim: evento de guess VÁLIDO (com flag 'correct')
  const correct = eq(itemFound.name, randomCharacter?.name);
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'dbz_guess',
    guess: itemFound.name,       // sempre o “nome canônico” do dataset
    correct,
    date_key: todayBrasiliaKey()
  });

  // 5) limpa input (qualquer caso)
  getInput.value = "";

  // 6) se acertou, finaliza; se não, segue o fluxo normal
  // === (fluxo padrão já existente) ===
  attributeContainer.classList.add("show-attrs");
  document.querySelector(".guess-container")?.classList.add("scroll-on");

  // contador + persistência (só incrementa se NÃO for acerto)
    if (!correct) {
      tryCount++;
      if (tryNumber) tryNumber.innerHTML = tryCount;
    }
    localStorage.setItem("tryCount", String(tryCount));

    // salva chute pelo ID (dedupe)
    const idToSave = itemFound.id;
    let savedGuesses = JSON.parse(localStorage.getItem("guesses")) || [];
    if (!savedGuesses.includes(idToSave)) {
      savedGuesses.push(idToSave);
      localStorage.setItem("guesses", JSON.stringify(savedGuesses));
    }
    
    
  // desenha linha
  createGuessBox(itemFound);
  const scroller = document.querySelector(".guess-container");
  scroller?.classList.add("panel-active", "scroll-on");
  scrollToLeftNow(scroller);

  // tira do pool desta sessão (opcional)
  const idx = characters.indexOf(itemFound);
  if (idx !== -1) characters.splice(idx, 1);

  localStorage.setItem("attributeContainer", "true");
      if (correct) {
      winGame();
    }
}



/*teste personagem*/

/*const headers = document.getElementById("headers");
headers.innerHTML = randomCharacter.name;
headers.style.color = "white";*/

//////////////////////
/*Event listeners*/

getSubmitGuess.addEventListener("click", function () {
  const userInput = (getInput.value || "").trim();
  if (!userInput) {           // <- bloqueia vazio
    closeSuggestions();
    return;
  }
  handleGuess(userInput);
  closeSuggestions();
});


getInput.addEventListener("input", async () => {
  const query = getInput.value.toLowerCase().trim();
  suggestions.innerHTML = "";
  activeIndex = -1;
  currentItems = [];

  if (!query) {
    closeSuggestions();
    return;
  }

  // garante que o banco existe antes de filtrar
  let pool = window.characters;
  if (!pool || !Array.isArray(pool)) {
    try { pool = await waitForCharacters(15000); }   // aumenta o timeout aqui se quiser
    catch {
      closeSuggestions();
      return;
    }
  }

  // Filtra e limita a 5 itens
    const filtered = pool
      .filter(c => (c.name || "").toLowerCase().includes(query))
      .sort((a, b) => {
        const nameA = (a.name || "").toLowerCase();
        const nameB = (b.name || "").toLowerCase();
        const startsA = nameA.startsWith(query);
        const startsB = nameB.startsWith(query);
    
        // Prioriza os que começam com a busca
        if (startsA && !startsB) return -1;
        if (!startsA && startsB) return 1;
    
        // Se ambos começam ou nenhum começa, ordena por nome
        return nameA.localeCompare(nameB);
      });

  if (!filtered.length) {
    closeSuggestions();
    return;
  }

  // Monta itens ...
  filtered.forEach((c, idx) => {
    const li = document.createElement("li");
    li.dataset.name = c.name;

    const img = document.createElement("img");
    img.src = getThumbSrc(c.image);
    img.width = 56; img.height = 56;
    img.className = "thumb";
    img.loading = "lazy";
    li.appendChild(img);

    const span = document.createElement("span");
    span.textContent = c.name;
    li.appendChild(span);

    li.addEventListener("mouseenter", () => { usingMouse = true; setActiveIndex(idx); });
    li.addEventListener("mousemove", () => { usingMouse = true; });
    li.addEventListener("click", () => { handleGuess(c.name); closeSuggestions(); getInput.value = ""; });

    suggestions.appendChild(li);
  });

  openSuggestions();
  currentItems = Array.from(suggestions.querySelectorAll("li"));
});

//////////////\/\/\//\/\/\/\ ACIMA EVENT LISTENERS

////////////
/*Ganhar o jogo*/

const winGame = () => {
  const wonTab = document.getElementById("won-container");
  // mostra o resumo pequeno abaixo do indicador de cores
  showInlineWinSummary(tryCount);
  
  const clipCharacterPopup = document.getElementById("clip-character-popup");   // o CONTÊINER (DIV)
  const clipCharacterImage = document.getElementById("clip-character-image");   // a IMG interna
  if (clipCharacterImage) {
      clipCharacterImage.src = `${CHAR_IMG_BASE}${randomCharacter.image}`;
    }
  
      // === preencher mensagem da vitória ===
    const tryCountEl = document.getElementById("try-count");
    const charNameEl = document.getElementById("character-name");
    
    // pegue o contador de tentativas da variável que você já usa
    // (se a sua variável tiver outro nome, troque aqui):
    const tries = typeof tryCount !== "undefined"
      ? tryCount
      : parseInt(localStorage.getItem("tryCount") || "1", 10);
    
    if (tryCountEl) tryCountEl.textContent = tries;
    if (charNameEl) charNameEl.textContent = randomCharacter.name;
    
    // (opcional) singular/plural "try/tries"
    const winLine = document.querySelector(".win-line");
    if (winLine) {
      const plural = tries === 1 ? "try" : "tries";
      winLine.innerHTML = `You guessed today’s Dragon Ball character in <strong id="try-count">${tries}</strong> ${plural}:`;
    }
    
      
      
      if (clipCharacterPopup) {
          clipCharacterPopup.style.display = "block";
          clipCharacterPopup.classList.remove("show");
          void clipCharacterPopup.offsetWidth; // força reflow
          clipCharacterPopup.classList.add("show");
        }

    const winGameContainer = document.getElementById("win-game");
    if (winGameContainer) {
      winGameContainer.style.display = "block";
      winGameContainer.classList.remove("show");
      void winGameContainer.offsetWidth;
      winGameContainer.classList.add("show");
    
      winGameContainer.addEventListener("animationend", () => {
        setTimeout(() => {
          const duration = 2 * 1000;
          const end = Date.now() + duration;
          (function confettiFrame() {
            if (typeof confetti === "function") {
              confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 } });
              confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 } });
            }
            if (Date.now() < end) requestAnimationFrame(confettiFrame);
          })();
        });
      });
    }

  document.getElementById("search").disabled = true;
  localStorage.setItem("gameWon", "true");
  
    // === GTM: marcou que acertou o personagem do dia ===
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'dbz_win',
      character: randomCharacter?.name || '(desconhecido)',
      try_count: tryCount,
      date_key: todayBrasiliaKey()
    });
    
    
    // incrementa no servidor e já reflete na UI
    incrementWinsToday()
      .then(updateIntroWins)
      .catch(err => console.warn('increment failed', err));
    
    // === (opcional) atualiza o evento de chute mais recente como "correct:true"
    window.dataLayer.push({
      event: 'dbz_guess_result',
      guess: randomCharacter?.name || '(desconhecido)',
      correct: true,
      date_key: todayBrasiliaKey()
    });  

  localStorage.setItem("lastResetDay", todayBrasiliaKey());
  localStorage.setItem("wonTab", "true");
  localStorage.setItem("clipCharacterMain", "true");
  setupCountdown();
};

// === mede o form fixo e ajusta o padding-top do painel ===
// === mede o form fixo + dropdown e ajusta o padding-top do painel ===

async function waitForCharacters(maxMs = 7000) {
  const started = performance.now();
  while (true) {
    // 1) já carregou via window?
    if (window.characters && Array.isArray(window.characters) && window.characters.length) {
      return window.characters;
    }
    // 2) carregou como binding global léxico (const/let) do script?
    //    Em scripts não "module", 'const characters = [...]' NÃO vira window.characters,
    //    mas a binding 'characters' existe e pode ser lida aqui.
    try {
      // eslint-disable-next-line no-undef
      if (typeof characters !== "undefined" && Array.isArray(characters) && characters.length) {
        // exponha para o resto do app
        // eslint-disable-next-line no-undef
        window.characters = characters;
        return window.characters;
      }
    } catch (_) {
      // ReferenceError: characters is not defined -> ignore e segue aguardando
    }

    await new Promise(r => setTimeout(r, 25));
    if (performance.now() - started > maxMs) {
      throw new Error("characters not loaded");
    }
  }
}

// >>> anexa o listener de redimensionamento (fora de qualquer função)
//////////////////////\/\/\/\/\/\ ACIMA WIN GAME

//////////// DOM Content Load

document.addEventListener("DOMContentLoaded", async () => {
  try {
    characters = await waitForCharacters(5000);   // << carrega banco da rota
    randomCharacter = getDailyCharacter();    // << só agora podemos usar
    ensureWinsBadgeCSS();
    startWinsPolling();
    scheduleMidnightRefresh();

    
        // === BLOCO DO PERSONAGEM DE ONTEM ===
    try {
      // calcula ontem com base no horário de Brasília já usado pelo app
      const d = getBrasiliaTime();
      d.setDate(d.getDate() - 1);
      const ymdYesterday = formatYMD(d);
    
      // reaproveita o mesmo algoritmo de sorteio, mas com a data de ontem
      const yesterdayChar = getCharacterForDay(ymdYesterday);
    
      // pega elementos do HTML
      const yWrap  = document.getElementById("yesterday-container");
      const yName  = document.getElementById("yesterday-name");
      const yThumb = document.getElementById("yesterday-thumb");
    
      // preenche se existir personagem
      if (yWrap && yName && yThumb && yesterdayChar) {
        yName.textContent = yesterdayChar.name;
        // gera a URL do thumbnail (usa função original, se existir)
        yThumb.src = (typeof getThumbSrc === "function")
          ? getThumbSrc(yesterdayChar.image)
          : ("/public/thumbs/" + String(yesterdayChar.image || "").split("/").pop());
        yThumb.alt = yesterdayChar.name + " (yesterday)";
        yWrap.hidden = false;
      }
    } catch(e) {
      console.error("Erro ao carregar Personagem de ontem:", e);
    }
    // === FIM BLOCO DO PERSONAGEM DE ONTEM ===

    // idioma atual pela rota ("/en-us", "/pt-br", "/es-es")
    const lang = (location.pathname.split("/")[1] || "en-us").toLowerCase();
    // carrega a ordem de sagas para o idioma
    await loadSagaOrderByCSV(lang);
  } catch (e) {
    console.error(e);
    return;
  }  // detecta reload (Ctrl+F5/F5/botão recarregar)
  const navEntry = performance.getEntriesByType("navigation")[0];
  const legacyNav = performance.navigation || {};
  const isReload = (navEntry && navEntry.type === "reload") || legacyNav.type === 1;


      // decide se mostra o cabeçalho
      ensureDailyResetOnBoot();
      const savedGuesses = JSON.parse(localStorage.getItem("guesses")) || [];
    
      if (savedGuesses.length > 0) {
        attributeContainer.classList.add("show-attrs");  // cabeçalho visível
      } else {
        attributeContainer.classList.remove("show-attrs"); // começa oculto
      }
    
      // === RESTORE: recria as linhas sem recontar errado ===
      tryCount = Math.max(1, savedGuesses.length);                 // nº de chutes já feitos
      if (tryNumber) tryNumber.innerHTML = tryCount;
    
      // recria do mais antigo -> mais novo, pois createGuessBox faz PREPEND
      // Isso garante que o último chute (mais recente) fique no TOPO.
      for (let i = 0; i < savedGuesses.length; i++) {
          const token = savedGuesses[i];
        
          // 1º tenta por ID (novo formato)
          let itemFound = characters.find((c) => (c.id || "") === token);
        
          // fallback: se não achou por id, tenta por name (dados antigos)
          if (!itemFound) {
            itemFound = characters.find(
              (c) => (c.name || "").toLowerCase() === String(token).toLowerCase()
            );
          }
        
          if (itemFound) {
            createGuessBox(itemFound);
          }
        }

    
      fitAllTypeBoxes();

        if (savedGuesses.length) {
          const scroller = document.querySelector(".guess-container");
          if (scroller) {
            // liga o overflow-x do CSS e o estado “ativo”
            scroller.classList.add("scroll-on", "panel-active");
        
            // posiciona o trilho
            if (window.innerWidth < STICK_LEFT_BP) {
              scrollToLeftNow(scroller); // telas pequenas colado à esquerda
            } else {
              // se preferir, pode manter colado à esquerda aqui também:
              // scrollToLeftNow(scroller);
            }
          }
        }

    // Se o usuário virar o celular/resize p/ menor, mantenha colado à esquerda
    window.addEventListener('resize', () => {
      if (window.innerWidth < STICK_LEFT_BP) {
        const sc = document.querySelector(".guess-container");
        scrollToLeftNow(sc);
      }
    });
    
  const searchInput = document.getElementById("search");
  const won = localStorage.getItem("gameWon") === "true";
    if (won) {
      searchInput.disabled = true;
    }
    // === Restaurar UI de vitória após reload (sem confete) ===
    if (won) {
      // Preenche imagem e textos novamente
      const clipCharacterImage = document.getElementById("clip-character-image");
      if (clipCharacterImage) {
        clipCharacterImage.src = `${CHAR_IMG_BASE}${randomCharacter.image}`;
      }
      const tryCountEl = document.getElementById("try-count");
      const charNameEl = document.getElementById("character-name");
      if (tryCountEl) tryCountEl.textContent = String(tryCount);
      if (charNameEl)  charNameEl.textContent = randomCharacter.name;
    
      // Mostra os overlays
      const popup   = document.getElementById("win-game");
      const crystal = document.getElementById("clip-character-popup");
      if (popup)   { popup.style.display = "block";  popup.classList.add("show"); }
      if (crystal) { crystal.style.display = "block"; crystal.classList.add("show"); }
    
      // Linha-resumo + contagem regressiva até o próximo personagem
      showInlineWinSummary(tryCount);
      setupCountdown();
    }


  const wonBox =
    !isReload &&
    localStorage.getItem("wonTab") &&
    localStorage.getItem("clipCharacterMain") === "true";
  
      // === handlers para fechar popup ===
    const popup   = document.getElementById("win-game");
    const card    = popup ? popup.querySelector(".win-card") : null;
    const closeX  = document.getElementById("close-popup");
    const crystal = document.getElementById("clip-character-popup");
    
    function closeWinPopup() {
      const popup = document.getElementById("win-game");
      if (!popup) return;
      popup.style.display = "none";
      popup.classList.remove("show");
    
      const crystal = document.getElementById("clip-character-popup");
      if (crystal) {
        crystal.style.display = "none";
        crystal.classList.remove("show");
      }
    
      const wonTab = document.getElementById("won-container");
      if (wonTab) {
        wonTab.style.display = "none";
        wonTab.classList.remove("show");
      }
    }

    
    // botão X
    if (closeX) {
      closeX.addEventListener("click", (e) => {
        e.preventDefault();
        closeWinPopup();
      });
    }
    
    // clique fora do card
    document.addEventListener("mousedown", (ev) => {
      if (!popup || !popup.classList.contains("show")) return;
      if (card && !card.contains(ev.target)) closeWinPopup();
    });
    
    // tecla ESC
    document.addEventListener("keydown", (ev) => {
      if (!popup || !popup.classList.contains("show")) return;
      if (ev.key === "Escape") closeWinPopup();
    });

});



///////////////////////////\/\/\/\/\/\/\ ACIMA DOM CONTENT LOAD

///////////////// RESET GAME

let timeOffset = 0;

// DEBUG HOOK (opcional, só para testes)
window.DBZ_DEBUG = window.DBZ_DEBUG || {};

// 1. Sync with Brasília's official time
// Hora atual de Brasília sem rede
function getBrasiliaTime() {
  // se houver uma data forçada (query, LS ou objeto global), usa ela
  const forced =
    window.DBZ_DEBUG.forceYMD ||
    localStorage.getItem("forceYMD") ||
    new URLSearchParams(location.search).get("ymd");
  if (forced && /^\d{4}-\d{2}-\d{2}$/.test(forced)) {
    // fixa meio-dia de Brasília para evitar borda de horário
    return new Date(forced + "T12:00:00-03:00");
  }

  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(now).reduce((a, p) => (a[p.type] = p.value, a), {});
  return new Date(`${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`);
}

// Formata Date -> 'YYYY-MM-DD'
function formatYMD(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Chave de "hoje" em Brasília
function todayBrasiliaKey() {
  return formatYMD(getBrasiliaTime());
}
window.todayBrasiliaKey = todayBrasiliaKey;


function doDailyReset({hard = false} = {}) {
  // esconde/limpa UI
  hideInlineWinSummary?.();

  const guessesContainer = document.getElementById("guesses-container");
  if (guessesContainer) guessesContainer.innerHTML = "";

  attributeContainer?.classList.remove("show-attrs");

  const searchInput = document.getElementById("search");
  if (searchInput) searchInput.disabled = false;

  const winGameContainer = document.getElementById("win-game");
  if (winGameContainer) winGameContainer.style.display = "none";

  const clipCharacterPopup = document.getElementById("clip-character-popup");
  if (clipCharacterPopup) clipCharacterPopup.style.display = "none";

  const clipCharacterMain = document.getElementById("clip-character-main");
  if (clipCharacterMain) clipCharacterMain.style.display = "none";

  const wonTab = document.getElementById("won-container");
  if (wonTab) wonTab.style.display = "none";

  // estado do jogo
  tryCount = 1;
  if (tryNumber) tryNumber.innerHTML = tryCount;

  localStorage.setItem("attributeContainer", "false");
  localStorage.setItem("gameWon", "false");
  localStorage.setItem("wonTab", "false");
  localStorage.setItem("clipCharacterMain", "false");
  localStorage.setItem("guesses", JSON.stringify([]));

  // marca o reset do dia (chave por data de Brasília)
  localStorage.setItem("lastResetDay", todayBrasiliaKey());

  if (hard) {
    hardReloadClearCaches();
  }
}

function ensureDailyResetOnBoot() {
  const today = todayBrasiliaKey();
  const last = localStorage.getItem("lastResetDay");
  if (last !== today) {
    doDailyReset({ hard: false });
  }
}

window.ensureDailyResetOnBoot = ensureDailyResetOnBoot;


// 4. Starts the interval to check every second for midnight
function startMidnightCheck() {
  setInterval(() => {
    const now = getBrasiliaTime();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const today = todayBrasiliaKey();
    const lastTriggerDate = localStorage.getItem("midnightTriggeredDate");

    if (hours === 0 && minutes === 0 && seconds < 5) {
      if (lastTriggerDate !== today) {
        localStorage.setItem("midnightTriggeredDate", today);
        document.dispatchEvent(new Event("midnightBrasilia"));
      }
    }
  }, 1000);
}

// Hard-reload limpando Cache Storage, Service Workers e storages
async function hardReloadClearCaches() {
  try {
    if ('caches' in window) {
      const names = await caches.keys();
      await Promise.all(names.map(n => caches.delete(n)));
    }
  } catch (e) {}

  try {
    if (navigator.serviceWorker?.getRegistrations) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
    }
  } catch (e) {}

  try { localStorage.clear(); } catch (e) {}
  try { sessionStorage.clear(); } catch (e) {}

  try {
    const url = new URL(window.location.href);
    url.searchParams.set('cb', Date.now().toString()); // cache-busting
    window.location.replace(url.toString());
  } catch (e) {
    window.location.reload();
  }
}


// 5. Event logic triggered at midnight
document.addEventListener("midnightBrasilia", () => {
  doDailyReset({ hard: true });
});


// 6) Initialization
startMidnightCheck();   // a checagem de meia-noite já é suficiente
if (!localStorage.getItem("lastResetDay")) {
  localStorage.setItem("lastResetDay", todayBrasiliaKey());
}

// === Seed & PRNG fortes para o "personagem do dia" ===
// Troque por um valor só seu; mantenha privado em produção:
const DAILY_SECRET = "mude-este-sal-secreto-🔥";

// cyrb128: hash 128-bit rápido e estável
function cyrb128(str) {
  let h1 = 1779033703, h2 = 3144134277,
      h3 = 1013904242, h4 = 2773480762;
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
  return [(h1 ^ h2 ^ h3 ^ h4) >>> 0, (h2 ^ h1) >>> 0, (h3 ^ h1) >>> 0, (h4 ^ h1) >>> 0];
}

// mulberry32: PRNG simples, rápido e com boa distribuição
function mulberry32(a) {
  return function() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Helpers de debug (apenas para testes locais)
window.__getChar = () => (typeof randomCharacter === "object" ? randomCharacter : null);

// Expor helpers ao console:
window.todayBrasiliaKey = todayBrasiliaKey;
window.ensureDailyResetOnBoot = ensureDailyResetOnBoot;
window.doDailyReset = doDailyReset;
window.getBrasiliaTime = getBrasiliaTime;
window.getDailyCharacter = getDailyCharacter;


window.reseedDaily = (ymd) => {
  if (ymd && /^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
    window.DBZ_DEBUG.forceYMD = ymd;
    localStorage.setItem("forceYMD", ymd); // persiste entre reloads
  }
  // recalcula personagem do dia com a data (real ou forçada)
  randomCharacter = getDailyCharacter();
  console.log("Seed do dia:", todayBrasiliaKey(), "Personagem:", randomCharacter?.name);
};

function setupCountdown() {
  // só mostra se já venceu
  if (localStorage.getItem("gameWon") !== "true") return;

  const countdownDiv = document.getElementById("countdown");
  if (!countdownDiv) return;

  function updateCountdown() {
    // pegue a data/hora de Brasília do seu helper (ou use new Date())
    const now = typeof getBrasiliaTime === "function" ? getBrasiliaTime() : new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);

    const diff = nextMidnight - now;
    const hours   = String(Math.max(0, Math.floor(diff / 1000 / 60 / 60))).padStart(2, "0");
    const minutes = String(Math.max(0, Math.floor((diff / 1000 / 60) % 60))).padStart(2, "0");
    const seconds = String(Math.max(0, Math.floor((diff / 1000) % 60))).padStart(2, "0");

    countdownDiv.textContent = `Next character in ${hours}:${minutes}:${seconds}`;
  }

  updateCountdown();
  if (!setupCountdown._timer) {
    setupCountdown._timer = setInterval(updateCountdown, 1000);
  }
}


  function setVH() {
    document.documentElement.style.setProperty('--vh', (window.innerHeight * 0.01) + 'px');
  }
  setVH(); window.addEventListener('resize', setVH);

document.addEventListener('DOMContentLoaded', () => {
  const popup   = document.getElementById('win-game');
  const crystal = document.getElementById("clip-character-popup"); // é o CONTÊINER, não a IMG
  const close   = document.getElementById('close-popup');

  // Garante estado inicial SEMPRE escondido (caso o CSS tenha sido sobrescrito)
  popup?.classList.remove('show');
  crystal?.classList.remove('show');

  // Fecha no X
  close?.addEventListener('click', () => {
    popup.classList.remove('show');
    crystal.classList.remove('show');
  });

  // Exemplo de função segura para abrir (chame só quando realmente venceu)
  window.openWinPopup = function openWinPopup() {
    popup.classList.add('show');         // mostra o overlay + card
    requestAnimationFrame(() => {
      // dá 1 frame para layout assentar, então “foca” a bolinha
      crystal.classList.add('show');
    });
  };
});


getInput.addEventListener("blur", () => {
  // dá tempo do mousedown no <li> ser processado (click no item)
  setTimeout(() => closeSuggestions(), 150);
});

getInput.addEventListener("focus", () => {
  if (getInput.value.trim() && suggestions.children.length) {
    openSuggestions();
  }
});

document.addEventListener("mousedown", (ev) => {
  if (!form.contains(ev.target) && !suggestions.contains(ev.target)) {
    closeSuggestions();
  }
});


// ===== Tooltip flutuante do nome (um único elemento no <body>)
const hoverNameEl = document.createElement('div');
hoverNameEl.className = 'hover-name';
document.body.appendChild(hoverNameEl);

function showHoverName(targetEl, text) {
  if (!text) return;
  hoverNameEl.textContent = text;

  // centraliza na miniatura, abaixo dela
  const r = targetEl.getBoundingClientRect();
  const centerX = r.left + r.width / 2;
  const topY    = r.bottom + 8;

  hoverNameEl.style.left = `${centerX}px`;
  hoverNameEl.style.top  = `${topY}px`;
  hoverNameEl.style.opacity = '1';
  hoverNameEl.style.transform = 'translate(-50%, 0)';
}

function hideHoverName() {
  hoverNameEl.style.opacity = '0';
  hoverNameEl.style.transform = 'translate(-50%, -4px)';
}

// ===== Hover do nome (delegação global – funciona mesmo se o container ainda não existe)
document.addEventListener('mouseover', (e) => {
  const cell = e.target.closest('.guess-image');
  if (!cell) return;
  const label = cell.getAttribute('data-label') || cell.textContent.trim();
  showHoverName(cell, label);
});

document.addEventListener('mousemove', (e) => {
  const cell = e.target.closest('.guess-image');
  if (!cell) return;
  const r = cell.getBoundingClientRect();
  const centerX = r.left + r.width / 2;
  const topY    = r.bottom + 8;
  hoverNameEl.style.left = `${centerX}px`;
  hoverNameEl.style.top  = `${topY}px`;
});

document.addEventListener('mouseout', (e) => {
  const fromCell = e.target.closest('.guess-image');
  const toCell   = e.relatedTarget && e.relatedTarget.closest?.('.guess-image');
  if (fromCell && !toCell) hideHoverName();
});

// segurança extra
window.addEventListener('scroll', hideHoverName, { passive: true });
document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') hideHoverName(); });
document.addEventListener('click', (ev) => {
  if (!ev.target.closest('.guess-image')) hideHoverName();
});




// === Inline Win Summary helpers ===
let _inlineCountdownTimer = null;

function getMsToNextDailyReset() {
  const now = (typeof getBrasiliaTime === "function") ? getBrasiliaTime() : new Date();
  const next = new Date(now);
  next.setHours(24,0,0,0);
  return Math.max(0, next - now);
}
function formatHMS(ms){
  const s = Math.floor(ms/1000);
  const h = String(Math.floor(s/3600)).padStart(2,'0');
  const m = String(Math.floor((s%3600)/60)).padStart(2,'0');
  const ss= String(s%60).toString().padStart(2,'0');
  return `${h}:${m}:${ss}`;
}
function buildXShareURL(tries){
  const dict = window.LOCALE || {};
  const one   = dict["share.tweet.one"]   || "I guessed today's DragonBallDle character in 1 try — try it too at {url}";
  const other = dict["share.tweet.other"] || "I guessed today's DragonBallDle character in {tries} tries — try it too at {url}";
  const tpl   = tries === 1 ? one : other;
  const text  = tpl.replace("{tries}", String(tries)).replace("{url}", "https://dragonballdle.site/");
  return "https://twitter.com/intent/tweet?text=" + encodeURIComponent(text);
}

function showInlineWinSummary(triesCount){
  const wrapper = document.getElementById('inline-win-wrapper');
  const tries   = document.getElementById('inline-tries');
  const cd      = document.getElementById('inline-countdown');
  const nameEl  = document.getElementById('inline-char-name');
  const thumbEl = document.getElementById('inline-char-thumb');
  const share   = document.getElementById('inline-share');
  if(!wrapper || !tries || !cd || !nameEl || !thumbEl) return;

  // personagem do dia
  const name = randomCharacter?.name || "—";
  const thumb = getThumbSrc(randomCharacter?.image || "");

  // preenche
  tries.textContent = String(triesCount);
  nameEl.textContent = name;
  if (thumb) {
    thumbEl.src = thumb;
    thumbEl.alt = name + " thumbnail";
  }

  // share
  if (share) share.href = buildXShareURL(triesCount, name);

  // countdown
  if (_inlineCountdownTimer) clearInterval(_inlineCountdownTimer);
  const tick = () => { cd.textContent = formatHMS(getMsToNextDailyReset()); };
  tick();
  _inlineCountdownTimer = setInterval(tick, 1000);

  // mostra
  wrapper.classList.remove('hidden');
}
function hideInlineWinSummary(){
  const wrapper = document.getElementById('inline-win-wrapper');
  if (wrapper) wrapper.classList.add('hidden');
  if (_inlineCountdownTimer){
    clearInterval(_inlineCountdownTimer);
    _inlineCountdownTimer = null;
  }
}

