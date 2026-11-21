/* =========================================================
   TUXFORGE — lógica do jogo
   Cruzadinha + descrição + quiz + montagem do PC.
   ========================================================= */
"use strict";

/* ---------- utilidades ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const fmt = (n) => "R$ " + Math.round(n).toLocaleString("pt-BR");
const slotById = Object.fromEntries(SLOTS.map((s) => [s.id, s]));
const partById = Object.fromEntries(PARTS.map((p) => [p.id, p]));
const TOTAL_WORDS = LEVELS.reduce((a, l) => a + l.words.length, 0);
const TIP = "Digite nas casas e clique em Conferir. Quanto mais rápido, mais você ganha.";
const MEDAL = { 3: "🥇", 2: "🥈", 1: "🥉" };
const cellKey = (r, c) => r + "," + c;
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const normalizeLetter = (s) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/[^A-Z]/g, "");

/* ---------- sons: gerados no navegador, sem arquivos ---------- */
const sfx = (() => {
  let ctx = null, on = true;
  try { on = localStorage.getItem("tuxforge.sound") !== "off"; } catch (e) { /* sem armazenamento: segue ligado */ }
  const ensure = () => {
    if (!on) return null;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === "suspended") ctx.resume();
      return ctx;
    } catch (e) { return null; }
  };
  const tone = (f, at, dur, type = "sine", vol = 0.1, to = null) => {
    const c = ensure();
    if (!c) return;
    const t0 = c.currentTime + at, o = c.createOscillator(), g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t0);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t0); o.stop(t0 + dur + 0.03);
  };
  const arp = (notes, step = 0.08, dur = 0.16, type = "triangle", vol = 0.1) => notes.forEach((n, i) => tone(n, i * step, dur, type, vol));
  const S = {
    click: () => tone(760, 0, 0.05, "square", 0.035),
    key: () => tone(480 + Math.random() * 120, 0, 0.04, "triangle", 0.05),
    correct: () => arp([523, 659, 784, 1047], 0.07, 0.18),
    wrong: () => { tone(230, 0, 0.2, "sawtooth", 0.07, 120); tone(170, 0.13, 0.26, "sawtooth", 0.07, 80); },
    coin: () => { tone(988, 0, 0.07, "square", 0.05); tone(1319, 0.07, 0.18, "square", 0.05); },
    buy: () => { tone(300, 0, 0.18, "sawtooth", 0.05, 900); arp([659, 880, 1175], 0.08, 0.2, "triangle", 0.09); },
    unlock: () => arp([392, 523, 659, 784, 1047], 0.09, 0.26, "triangle", 0.1),
    level: () => arp([523, 659, 784, 1047, 784, 1047, 1319], 0.1, 0.3, "triangle", 0.11),
    open: () => tone(300, 0, 0.18, "sine", 0.07, 700),
    hint: () => { tone(880, 0, 0.1, "sine", 0.07); tone(660, 0.09, 0.14, "sine", 0.06); },
    tierdown: () => tone(520, 0, 0.18, "triangle", 0.05, 330),
    boot: () => { tone(110, 0, 0.5, "sawtooth", 0.05, 440); arp([440, 554, 659, 880], 0.1, 0.22, "square", 0.05); },
    ach: () => arp([784, 988, 1175, 1568], 0.08, 0.22, "sine", 0.1),
  };
  return {
    get on() { return on; },
    play(name) { try { if (on && S[name]) S[name](); } catch (e) { /* o som é opcional */ } },
    toggle() {
      on = !on;
      try { localStorage.setItem("tuxforge.sound", on ? "on" : "off"); } catch (e) { /* ignorar */ }
      if (on) { ensure(); S.click(); }
      return on;
    },
  };
})();

/* ---------- conquistas (ficam salvas no navegador) ---------- */
const ach = (() => {
  let got = new Set();
  try { got = new Set(JSON.parse(localStorage.getItem("tuxforge.ach") || "[]")); } catch (e) { /* começa vazio */ }
  return {
    has: (id) => got.has(id),
    count: () => got.size,
    give(id) {
      const a = ACHIEVEMENTS.find((x) => x.id === id);
      if (!a || got.has(id)) return;
      got.add(id);
      try { localStorage.setItem("tuxforge.ach", JSON.stringify([...got])); } catch (e) { /* ignorar */ }
      sfx.play("ach");
      const el = document.createElement("div");
      el.className = "achievement";
      el.innerHTML = `<span class="ic">${a.icone}</span><span><b>Conquista desbloqueada!</b><br>${a.nome}</span>`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 3800);
    },
  };
})();

/* ---------- efeitos visuais ---------- */
const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/* texto que sobe e some perto do saldo (+R$ / −R$) */
function floatText(text, cls) {
  const w = document.querySelector(".wallet");
  if (!w || reduceMotion()) return;
  const r = w.getBoundingClientRect();
  const el = document.createElement("div");
  el.className = "floaty " + cls;
  el.textContent = text;
  el.style.left = Math.round(r.left + r.width / 2) + "px";
  el.style.top = Math.round(r.bottom + 4) + "px";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1400);
}

/* chuva de confete */
function confetti(n = 60) {
  if (reduceMotion()) return;
  const box = document.createElement("div");
  box.className = "confetti";
  const cols = ["#ff3d6e", "#ff9a2e", "#ffe03a", "#3dff7a", "#35e0ff", "#b44dff", "#ff4dd2"];
  for (let i = 0; i < n; i++) {
    const p = document.createElement("i");
    p.style.left = Math.random() * 100 + "%";
    p.style.background = cols[i % cols.length];
    p.style.animationDelay = Math.random() * 0.5 + "s";
    p.style.animationDuration = 1.8 + Math.random() * 1.6 + "s";
    p.style.setProperty("--dx", Math.round(Math.random() * 160 - 80) + "px");
    p.style.setProperty("--rot", Math.round(Math.random() * 720 - 360) + "deg");
    box.appendChild(p);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 4000);
}

/* o saldo "rola" até o novo valor */
let moneyShown = null, moneyRaf = 0;
function paintMoney() {
  const el = document.querySelector("#money"), target = game.money;
  cancelAnimationFrame(moneyRaf);
  if (moneyShown === null || reduceMotion()) { moneyShown = target; el.textContent = fmt(target); return; }
  const from = moneyShown, t0 = performance.now();
  const step = (now) => {
    const k = Math.min(1, (now - t0) / 600);
    moneyShown = Math.round(from + (target - from) * (1 - Math.pow(1 - k, 3)));
    el.textContent = fmt(moneyShown);
    if (k < 1) moneyRaf = requestAnimationFrame(step);
  };
  moneyRaf = requestAnimationFrame(step);
}

/* ---------- estado ---------- */
const game = {
  mode: "recomendado", // "recomendado" (fácil → difícil) ou "dificil" (tudo no difícil)
  levelIndex: 0,
  money: ECONOMY.inicial,
  installed: {}, // slotId -> partId
  solvedTotal: 0,
  streak: 0, // acertos limpos seguidos (combo)
  quizStreak: 0, // acertos seguidos no quiz
  lastTier: 0,
  skipUsed: [], // perguntas difíceis já sorteadas
  skipUntil: 0, // até quando o botão de pular fica bloqueado (depois de errar)
  access: 1, // maior tier de peças liberado na loja (1 Bronze, 2 Prata, 3 Ouro): fica para sempre
  newUnlock: false, // liberou um tier novo e ainda não abriu a loja
  shopThen: null, // o que fazer ao fechar a loja (ex.: voltar à tela de fim de nível)
  snapshot: null, // estado no início do nível (usado pelo Reiniciar)
  L: null, // nível em andamento
  shopSlot: "cpu",
  paused: false,
  pauseAt: 0,
  justInstalled: null,
  shopOpen: false, // janela da loja aberta
  shopFresh: false, // aberta logo depois de um acerto
  shopBought: false, // comprou algo nesta visita
  shopMsg: "",
};

/* =========================================================
   PC (SVG), pontuação e carteira
   ========================================================= */
const tierOf = (slot) => (game.installed[slot] ? partById[game.installed[slot]].tier : 0);

function computeScore(installed = game.installed) {
  return Object.values(installed).reduce((a, id) => a + partById[id].power, 0);
}
function rankFor(score) {
  let r = RANKS[0];
  for (const x of RANKS) if (score >= x.min) r = x;
  return r;
}

function renderPC() {
  $("#pcView").innerHTML = pcSvg(game.installed, game.justInstalled);
  const score = computeScore();
  const rank = rankFor(score);
  $("#score").textContent = score;
  $("#rankName").textContent = `${rank.emoji} ${rank.nome}`;
  const next = RANKS.find((r) => r.min > score);
  $("#rankNext").textContent = next ? `faltam ${next.min - score} pts para ${next.emoji} ${next.nome}` : "título máximo!";
  $("#rankFill").style.width = (next ? Math.round(((score - rank.min) / (next.min - rank.min)) * 100) : 100) + "%";
  $("#specs").innerHTML = SLOTS.map((sl) => {
    const p = game.installed[sl.id] ? partById[game.installed[sl.id]] : null;
    const flash = game.justInstalled === sl.id ? " flash" : "";
    const thumb = p ? partThumb(sl.id, p.tier) : `<span class="ph">${sl.icone}</span>`;
    return `<li class="spec ${p ? "t" + p.tier : "empty"}${flash}" title="${sl.nome}: ${p ? p.nome : "vazio"}"><div class="sthumb">${thumb}</div></li>`;
  }).join("");
}

function updateWallet(bump = false) {
  paintMoney();
  updateShopBadge();
  if (bump) {
    const w = $(".wallet");
    w.classList.remove("bump");
    void w.offsetWidth;
    w.classList.add("bump");
  }
}
function addMoney(n) {
  game.money += n;
  if (n > 0) { floatText("+" + fmt(n), "gain"); sfx.play("coin"); }
  updateWallet(true);
  renderShop();
}

/* =========================================================
   Modal e toast
   ========================================================= */
function showModal(html, cls = "") {
  const ov = $("#overlay");
  if (!game.paused) { game.paused = true; game.pauseAt = performance.now(); }
  ov.innerHTML = `<div class="modal ${cls}" role="dialog" aria-modal="true">${html}</div>`;
  ov.hidden = false;
  document.body.classList.add("modal-open");
  const first = ov.querySelector("[data-autofocus]");
  if (first) first.focus();
  ov.scrollTop = 0;
  return ov.firstElementChild;
}
/* resetClock = true zera o relógio da velocidade; false desconta o tempo de pausa */
function hideModal(resetClock = false) {
  const ov = $("#overlay");
  ov.hidden = true;
  ov.innerHTML = "";
  document.body.classList.remove("modal-open");
  if (game.L && game.paused) {
    const now = performance.now();
    game.L.lastMark = resetClock ? now : game.L.lastMark + (now - game.pauseAt);
  }
  game.paused = false;
}
const clickOnce = (root, sel) => new Promise((res) => $(sel, root).addEventListener("click", res, { once: true }));

let toastTimer;
function toast(msg, bad = false) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.toggle("bad", bad);
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
}

/* =========================================================
   Nível: montagem do tabuleiro
   ========================================================= */
function snapshotNow() {
  return { money: game.money, installed: { ...game.installed }, solvedTotal: game.solvedTotal, access: game.access };
}

function startLevel(i) {
  game.snapshot = snapshotNow();
  loadLevel(i);
  showLevelIntro();
}

/* regras do nível conforme o modo escolhido na tela inicial */
function levelDef(i) {
  return game.mode === "dificil" ? { ...LEVELS[i], ...HARD } : { ...LEVELS[i] };
}

function loadLevel(i) {
  const def = levelDef(i);
  game.levelIndex = i;
  const L = { def, words: [], cells: new Map(), wi: 0, dir: "H", cur: null, lastMark: performance.now(), solvedCount: 0, ended: false, mistakes: 0, hints: 0 };

  def.words.forEach((w, idx) => {
    const cells = [];
    for (let k = 0; k < w.answer.length; k++) cells.push([w.row + (w.dir === "V" ? k : 0), w.col + (w.dir === "H" ? k : 0)]);
    L.words.push({ ...WORDS[w.id], ...w, idx, cells, solved: false, matched: false, elapsed: null, hint: false, sig: null, num: 0 });
  });

  L.words.forEach((w) => w.cells.forEach(([r, c], k) => {
    const key = cellKey(r, c);
    let cell = L.cells.get(key);
    if (!cell) {
      cell = { key, r, c, ans: w.answer[k], words: [], value: "", given: false, hinted: false, locked: false, el: null, input: null };
      L.cells.set(key, cell);
    }
    cell.words.push(w.idx);
  }));

  // numeração: por ordem de leitura das casas iniciais
  const starts = [...new Map(L.words.map((w) => [w.cells[0].join(","), w.cells[0]])).values()].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  starts.forEach(([r, c], n) => L.words.forEach((w) => { if (w.cells[0][0] === r && w.cells[0][1] === c) w.num = n + 1; }));

  // nível fácil: revela a primeira letra das palavras com 3+ letras
  if (def.reveal === "first") {
    L.words.forEach((w) => {
      if (w.answer.length < 3) return;
      const cell = L.cells.get(cellKey(...w.cells[0]));
      cell.value = cell.ans;
      cell.given = true;
    });
  }

  game.L = L;
  L.cur = L.words[0].cells[0].join(",");
  renderBoard();
  renderClues();
  paintSelection();
  renderAll();
  $("#message").textContent = TIP;
}

function renderBoard() {
  const L = game.L;
  const board = $("#board");
  board.innerHTML = "";
  board.style.gridTemplateColumns = `repeat(${L.def.cols}, var(--cell))`;
  board.style.gridTemplateRows = `repeat(${L.def.rows}, var(--cell))`;

  const numAt = {};
  L.words.forEach((w) => { numAt[w.cells[0].join(",")] = w.num; });

  L.cells.forEach((cell) => {
    const el = document.createElement("div");
    el.className = "cell" + (cell.given ? " given" : "");
    el.style.animationDelay = cell.r * 35 + cell.c * 25 + "ms";
    el.style.gridRow = cell.r + 1;
    el.style.gridColumn = cell.c + 1;
    if (numAt[cell.key]) el.insertAdjacentHTML("beforeend", `<span class="num">${numAt[cell.key]}</span>`);
    const input = document.createElement("input");
    input.type = "text";
    input.autocomplete = "off";
    input.autocapitalize = "characters";
    input.spellcheck = false;
    input.setAttribute("inputmode", "text");
    input.setAttribute("aria-label", `Linha ${cell.r + 1}, coluna ${cell.c + 1}`);
    input.value = cell.value;
    input.readOnly = cell.given;
    el.appendChild(input);
    board.appendChild(el);
    cell.el = el;
    cell.input = input;
    bindCell(cell);
  });
  updateCellSize();
}

function updateCellSize() {
  const L = game.L;
  if (!L) return;
  const wrap = $("#boardWrap");
  const fit = (avail, n) => Math.floor((avail - (n - 1) * 3) / n);
  const byW = fit(wrap.clientWidth - 24, L.def.cols);
  // em telas grandes o painel tem altura fixa: as casas também precisam caber na altura
  const byH = matchMedia("(min-width: 901px)").matches ? fit(wrap.clientHeight - 24, L.def.rows) : 99;
  document.documentElement.style.setProperty("--cell", Math.max(22, Math.min(60, byW, byH)) + "px");
}

function renderClues() {
  const L = game.L;
  const H = $("#cluesH"), V = $("#cluesV");
  H.innerHTML = V.innerHTML = "";
  [...L.words].sort((a, b) => a.num - b.num).forEach((w) => {
    const li = document.createElement("li");
    li.dataset.wi = w.idx;
    li.tabIndex = 0;
    li.setAttribute("role", "button");
    li.innerHTML = `<span class="n">${w.num}</span><span><span class="txt">${w.clue}</span> <span class="len">(${w.answer.length} letras)</span><span class="ans"></span></span>`;
    const go = () => { if (!game.paused) focusWord(w); };
    li.addEventListener("click", go);
    li.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
    (w.dir === "H" ? H : V).appendChild(li);
    w.li = li;
  });
}

/* =========================================================
   Seleção e digitação
   ========================================================= */
const cellOf = (r, c) => game.L.cells.get(cellKey(r, c));
const wordCells = (w) => w.cells.map(([r, c]) => cellOf(r, c));
const editable = (cell) => !cell.locked && !cell.given && !cell.hinted;

function wordForCell(cell, dirPref) {
  const ws = cell.words.map((i) => game.L.words[i]);
  return ws.find((w) => w.dir === dirPref && !w.solved) || ws.find((w) => !w.solved) || ws.find((w) => w.dir === dirPref) || ws[0];
}

function paintSelection() {
  const L = game.L;
  const w = L.words[L.wi];
  L.cells.forEach((cell) => cell.el.classList.remove("hl", "cur"));
  wordCells(w).forEach((cell) => cell.el.classList.add("hl"));
  const cur = L.cells.get(L.cur);
  if (cur) cur.el.classList.add("cur");
  L.words.forEach((x) => x.li && x.li.classList.toggle("active", x === w));
  if (w.li && matchMedia("(min-width: 901px)").matches) w.li.scrollIntoView({ block: "nearest" });
  $("#activeClue").innerHTML = `<b>${w.num} ${w.dir === "H" ? "→" : "↓"}</b><span>${w.clue}</span>`;
}

function focusCell(cell) { cell.input.focus(); }

function focusWord(w) {
  const L = game.L;
  const cells = wordCells(w);
  const target = cells.find((c) => !c.value) || cells.find(editable) || cells[0];
  L.wi = w.idx;
  L.dir = w.dir;
  L.cur = target.key;
  paintSelection();
  focusCell(target);
}

function bindCell(cell) {
  const L = game.L;
  const { input } = cell;

  input.addEventListener("mousedown", () => { input._was = document.activeElement === input; });
  input.addEventListener("focus", () => {
    const cur = L.words[L.wi];
    let w = cur && !cur.solved && cell.words.includes(cur.idx) ? cur : wordForCell(cell, L.dir);
    L.wi = w.idx;
    L.dir = w.dir;
    L.cur = cell.key;
    paintSelection();
    try { input.select(); } catch (e) { /* ignorar */ }
  });
  input.addEventListener("click", () => {
    if (input._was && cell.words.length > 1) {
      const other = cell.words.map((i) => L.words[i]).find((w) => w.idx !== L.wi);
      if (other) { L.wi = other.idx; L.dir = other.dir; paintSelection(); }
    }
    input._was = false;
  });

  input.addEventListener("input", (e) => {
    if (!editable(cell)) { input.value = cell.value; return; }
    // várias letras de uma vez (colar, digitação por deslize): espalha pela palavra ativa
    const burst = normalizeLetter(e.data || "");
    if (burst.length > 1) { input.value = cell.value; spreadLetters(cell, burst); return; }
    const v = normalizeLetter(input.value).slice(-1);
    setCellValue(cell, v);
    if (v) { sfx.play("key"); advance(cell); }
  });

  input.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key;
    const move = { ArrowRight: [0, 1, "H"], ArrowLeft: [0, -1, "H"], ArrowDown: [1, 0, "V"], ArrowUp: [-1, 0, "V"] }[k];
    if (move) {
      e.preventDefault();
      const next = L.cells.get(cellKey(cell.r + move[0], cell.c + move[1]));
      if (next) { L.dir = move[2]; focusCell(next); }
    } else if (k === "Backspace" || k === "Delete") {
      e.preventDefault();
      if (editable(cell) && cell.value) { setCellValue(cell, ""); return; }
      if (k === "Backspace") {
        const w = L.words[L.wi];
        const cells = wordCells(w);
        for (let j = cells.indexOf(cell) - 1; j >= 0; j--) {
          focusCell(cells[j]);
          if (editable(cells[j])) { setCellValue(cells[j], ""); break; }
        }
      }
    } else if (k === "Enter") {
      e.preventDefault();
      conferir();
    } else if (k === " ") {
      e.preventDefault();
      if (cell.words.length > 1) input.click();
    } else if (k === "Tab") {
      e.preventDefault();
      gotoWord(e.shiftKey ? -1 : 1);
    }
  });
}

function setCellValue(cell, v) {
  const L = game.L;
  cell.value = v;
  cell.input.value = v;
  cell.el.classList.remove("wrong");
  cell.words.forEach((i) => { L.words[i].li.classList.remove("wrong"); });
  onCellChanged(cell);
}

/* registra (em silêncio) o instante em que a palavra ficou correta: é o que mede a velocidade */
function onCellChanged(cell) {
  const L = game.L;
  cell.words.forEach((i) => {
    const w = L.words[i];
    if (w.solved) return;
    const full = wordCells(w).every((x) => x.value === x.ans);
    if (full && !w.matched) {
      w.matched = true;
      if (w.elapsed === null) {
        const now = performance.now();
        w.elapsed = (now - L.lastMark) / 1000;
        L.lastMark = now;
      }
    } else if (!full) {
      w.matched = false;
    }
  });
}

function spreadLetters(cell, letters) {
  const cells = wordCells(game.L.words[game.L.wi]);
  let last = cell;
  const targets = cells.slice(Math.max(0, cells.indexOf(cell))).filter(editable);
  for (let i = 0; i < letters.length && i < targets.length; i++) {
    setCellValue(targets[i], letters[i]);
    last = targets[i];
  }
  focusCell(last);
  advance(last);
}

function advance(cell) {
  const w = game.L.words[game.L.wi];
  const cells = wordCells(w);
  for (let j = cells.indexOf(cell) + 1; j < cells.length; j++) {
    if (editable(cells[j])) { focusCell(cells[j]); return; }
  }
}

function gotoWord(offset) {
  const L = game.L;
  const open = L.words.filter((w) => !w.solved);
  if (!open.length) return;
  const curPos = open.findIndex((w) => w.idx === L.wi);
  const next = open[(curPos + offset + open.length) % open.length] || open[0];
  focusWord(next);
}

/* =========================================================
   Conferir · Dica · Reiniciar
   ========================================================= */
async function conferir() {
  if (game.paused) return;
  const L = game.L;
  const ok = [], bad = [], inc = [];
  L.words.forEach((w) => {
    if (w.solved) return;
    const letters = wordCells(w).map((c) => c.value);
    if (letters.some((x) => !x)) { inc.push(w); return; }
    const guess = letters.join("");
    if (guess === w.answer) ok.push(w); else bad.push({ w, guess });
  });

  if (!ok.length && !bad.length) {
    $("#message").innerHTML = `<span class="inc">Preencha pelo menos uma palavra inteira para conferir.</span>`;
    return;
  }

  /* palavras erradas: marca em vermelho e aplica a penalidade (uma vez por tentativa diferente) */
  let penalty = 0;
  bad.forEach(({ w, guess }) => {
    wordCells(w).forEach((c) => { if (!c.locked) { c.el.classList.remove("wrong"); void c.el.offsetWidth; c.el.classList.add("wrong"); } });
    w.li.classList.add("wrong");
    if (w.sig !== guess) L.mistakes++;
    game.streak = 0;
    if (L.def.penalidade && w.sig !== guess) penalty += L.def.penalidade;
    w.sig = guess;
  });
  if (penalty) {
    const lost = Math.min(penalty, game.money);
    game.money -= lost;
    floatText("−" + fmt(lost), "loss");
    updateWallet();
    renderShop();
  }

  /* palavras certas: travam e entram na fila de recompensas */
  ok.forEach((w) => {
    w.clean = !w.hint && w.sig === null;
    w.solved = true;
    L.solvedCount++;
    game.solvedTotal++;
    wordCells(w).forEach((c) => {
      c.locked = true;
      c.input.readOnly = true;
      c.el.classList.remove("wrong", "hinted");
      c.el.classList.add("solved", "pop");
    });
    w.li.classList.remove("wrong");
    w.li.classList.add("solved");
    $(".ans", w.li).textContent = "✔ " + w.termo;
  });
  updateHud();

  const parts = [];
  if (ok.length) parts.push(`<span class="ok">✔ ${ok.length} ${ok.length > 1 ? "certas" : "certa"}</span>`);
  if (bad.length) parts.push(`<span class="bad">✖ ${bad.length} ${bad.length > 1 ? "erradas" : "errada"}${penalty ? ` (−${fmt(penalty)})` : ""}</span>`);
  if (inc.length) parts.push(`<span class="inc">… ${inc.length} incompleta${inc.length > 1 ? "s" : ""}</span>`);
  $("#message").innerHTML = parts.join(" &nbsp;·&nbsp; ");
  if (ok.length) sfx.play("correct"); else if (bad.length) sfx.play("wrong");
  updateHud();
  if (bad.length) toast(penalty ? `Palavra errada! −${fmt(penalty)}` : "Tem palavra errada. Revise as casas em vermelho.", true);

  if (ok.length) {
    let goShop = false;
    for (let i = 0; i < ok.length; i++) goShop = await runWordFlow(ok[i], i < ok.length - 1);
    if (goShop) openShop(true);
    else { hideModal(true); afterModal(); }
  }
}

/* devolve o foco ao tabuleiro e vê se o nível terminou */
function afterModal() {
  const L = game.L;
  const w = L.words[L.wi];
  const rest = L.words.find((x) => !x.solved);
  if (rest) {
    if (w.solved) focusWord(rest);
    else { const c = L.cells.get(L.cur); if (c) focusCell(c); }
  }
  checkLevelEnd();
}

function useHint() {
  if (game.paused) return;
  const L = game.L;
  const w = L.words[L.wi];
  if (!w || w.solved) { toast("Selecione uma palavra ainda não resolvida."); return; }
  const cost = L.def.custoDica;
  if (game.money < cost) { toast(`Saldo insuficiente para a dica (${fmt(cost)}).`, true); return; }
  const target = wordCells(w).find((c) => c.value !== c.ans && !c.locked);
  if (!target) { toast("Esta palavra já está toda preenchida corretamente."); return; }
  game.money -= cost;
  L.hints++;
  game.streak = 0;
  updateHud();
  floatText("−" + fmt(cost), "loss");
  sfx.play("hint");
  target.value = target.ans;
  target.input.value = target.ans;
  target.hinted = true;
  target.input.readOnly = true;
  target.el.classList.remove("wrong");
  target.el.classList.add("hinted");
  target.words.forEach((i) => { L.words[i].hint = true; L.words[i].li.classList.remove("wrong"); });
  onCellChanged(target);
  updateWallet();
  renderShop();
  toast(`Dica usada (−${fmt(cost)}): esta palavra só rende peça Bronze.`);
}

function askReset() {
  if (game.paused) return;
  const m = showModal(`
    <div class="modal-tag warn">Atenção</div>
    <h2>Reiniciar este nível?</h2>
    <p>O tabuleiro será limpo e o seu saldo e as suas peças voltam ao que eram no <b>início do nível</b>.</p>
    <div class="btn-row">
      <button class="btn ghost" id="no" data-autofocus type="button">Cancelar</button>
      <button class="btn danger" id="yes" type="button">Reiniciar</button>
    </div>`);
  $("#no", m).addEventListener("click", () => hideModal(false));
  $("#yes", m).addEventListener("click", () => {
    restoreSnapshot();
    loadLevel(game.levelIndex);
    hideModal(true);
    toast("Nível reiniciado.");
  });
}

/* =========================================================
   Pular de nível: só vale se acertar uma pergunta muito difícil
   ========================================================= */
const isLastLevel = () => game.levelIndex === LEVELS.length - 1;
/* prêmio do pulo: uma fração do valor Prata de cada palavra que faltava */
function skipPrize() {
  const def = game.L.def;
  const faltam = game.L.words.filter((w) => !w.solved).length;
  const cada = Math.round((ECONOMY.renda[2] * (def.mult || 1) * SKIP.premio) / 10) * 10;
  return cada * faltam;
}
const skipLabel = () => (isLastLevel() ? "⏭ Pular para o final" : "⏭ Pular nível");

function askSkip() {
  if (game.paused) return;
  const wait = Math.ceil((game.skipUntil - performance.now()) / 1000);
  if (wait > 0) { toast(`Você errou o desafio. Tente de novo em ${wait} s.`, true); return; }
  const last = isLastLevel();
  const prize = skipPrize();
  const m = showModal(`
    <div class="modal-tag warn">Desafio</div>
    <h2>${last ? "Pular para o final?" : "Pular para o próximo nível?"}</h2>
    <p>Responda a <b>uma pergunta muito difícil</b>. Se acertar, ${last ? "o jogo termina" : "você vai direto para o próximo nível"} e ganha <b>${fmt(prize)}</b>, uma parte do que as palavras que faltam pagariam.</p>
    <p>Se errar, continua aqui e só tenta de novo depois de <b>${SKIP.espera} s</b>.</p>
    <div class="btn-row">
      <button class="btn ghost" id="no" data-autofocus type="button">Cancelar</button>
      <button class="btn primary" id="yes" type="button">Aceitar o desafio</button>
    </div>`);
  $("#no", m).addEventListener("click", () => { hideModal(false); afterModal(); });
  $("#yes", m).addEventListener("click", showSkipQuestion);
}

function showSkipQuestion() {
  let pool = HARD_QUESTIONS.map((_, i) => i).filter((i) => !game.skipUsed.includes(i));
  if (!pool.length) { game.skipUsed = []; pool = HARD_QUESTIONS.map((_, i) => i); }
  const idx = pool[Math.floor(Math.random() * pool.length)];
  game.skipUsed.push(idx); // a pergunta sorteada não volta tão cedo
  const q = HARD_QUESTIONS[idx];
  const opts = shuffle(q.options.map((text, i) => ({ text, right: i === q.correct })));
  const last = isLastLevel();
  const prize = skipPrize();
  const m = showModal(`
    <div class="modal-tag warn">🔥 Desafio muito difícil</div>
    <h2 style="font-size:1.2rem">${q.q}</h2>
    <div class="opts">${opts.map((o, i) => `<button class="opt" data-i="${i}" type="button">${o.text}</button>`).join("")}</div>
    <div id="fb"></div>`);
  m.querySelectorAll(".opt").forEach((b) => b.addEventListener("click", () => {
    const right = opts[Number(b.dataset.i)].right;
    m.querySelectorAll(".opt").forEach((x, i) => {
      x.disabled = true;
      if (opts[i].right) x.classList.add("right");
      else if (x === b) x.classList.add("wrongopt");
    });
    if (right) {
      addMoney(prize);
      ach.give("skip_win");
      confetti(40);
      sfx.play("level");
      $("#fb", m).innerHTML = `
        <div class="explain good"><b>Acertou! Desafio vencido: +${fmt(prize)}.</b><br>${q.explain}</div>
        <button class="btn primary" id="go2" data-autofocus type="button">${last ? "Ver resultado final →" : "Ir para o próximo nível →"}</button>`;
      $("#go2", m).focus();
      $("#go2", m).addEventListener("click", () => (last ? showFinal() : startLevel(game.levelIndex + 1)));
    } else {
      game.skipUntil = performance.now() + SKIP.espera * 1000;
      sfx.play("wrong");
      $("#fb", m).innerHTML = `
        <div class="explain bad"><b>Errou. Você continua neste nível.</b> Dá para tentar de novo em ${SKIP.espera} s.<br>${q.explain}</div>
        <button class="btn primary" id="back" data-autofocus type="button">Voltar ao jogo</button>`;
      $("#back", m).focus();
      $("#back", m).addEventListener("click", () => { hideModal(false); afterModal(); });
    }
  }, { once: true }));
}

function restoreSnapshot() {
  const s = game.snapshot;
  game.money = s.money;
  game.installed = { ...s.installed };
  game.solvedTotal = s.solvedTotal;
  game.access = s.access;
}

function askNewGame() {
  if (game.paused) return;
  const m = showModal(`
    <div class="modal-tag warn">Atenção</div>
    <h2>Voltar para o início?</h2>
    <p>Você perde todo o progresso (níveis, dinheiro e peças) e escolhe o modo de novo.</p>
    <div class="btn-row">
      <button class="btn ghost" id="no" data-autofocus type="button">Cancelar</button>
      <button class="btn danger" id="yes" type="button">Voltar ao início</button>
    </div>`);
  $("#no", m).addEventListener("click", () => hideModal(false));
  $("#yes", m).addEventListener("click", () => { hideModal(false); showStart(); });
}

/* ---------- tela inicial: escolha do modo ---------- */
function showStart() {
  game.shopOpen = false;
  $("#start").hidden = false;
  document.body.classList.add("modal-open");
  $(".mode.sel").focus();
}

function beginGame() {
  sfx.play("boot");
  game.mode = $(".mode.sel").dataset.mode;
  $("#start").hidden = true;
  document.body.classList.remove("modal-open");
  newGame();
}

function newGame() {
  game.money = ECONOMY.inicial;
  game.installed = {};
  game.solvedTotal = 0;
  game.access = 1;
  game.newUnlock = false;
  game.skipUsed = [];
  game.skipUntil = 0;
  game.streak = 0;
  game.quizStreak = 0;
  game.shopSlot = "cpu";
  startLevel(0);
}

/* =========================================================
   Fluxo de cada palavra: descrição → quiz → recompensa
   ========================================================= */
async function runWordFlow(w, hasNext) {
  const def = game.L.def;
  const tier = w.hint ? 1 : w.elapsed <= def.tempoRapido ? 3 : w.elapsed <= def.tempoMedio ? 2 : 1;
  const t = TIERS[tier];
  const mult = def.mult || 1;
  game.streak = w.clean ? game.streak + 1 : 0;
  const comboPct = Math.min(Math.max(game.streak - 1, 0), 5) * 10; // +10% por acerto limpo seguido, até +50%
  const base = Math.round((ECONOMY.renda[tier] * mult) / 10) * 10;
  const income = Math.round((base * (1 + comboPct / 100)) / 10) * 10;
  const bonus = Math.round((ECONOMY.bonusQuiz * mult) / 10) * 10;
  addMoney(income);
  updateHud();
  if (game.streak >= 5) ach.give("combo5");
  if (!w.hint && w.elapsed <= 10) ach.give("lightning");
  const unlocked = tier > game.access;
  if (unlocked) { game.access = tier; game.newUnlock = true; updateShopBadge(); sfx.play("unlock"); confetti(36); }

  const why = w.hint ? "usou dica" : `${Math.round(w.elapsed)} s`;
  let m = showModal(`
    <div class="modal-tag">✔ Palavra descoberta</div>
    <h2 class="reveal">${w.termo}</h2>
    <div class="tier-banner ${t.classe}">
      <span class="medal">${MEDAL[tier]}</span>
      <span class="grow"><span class="chip ${t.classe}">${t.nome}</span> ${why}${comboPct ? ` · 🔥 combo ×${game.streak} (+${comboPct}%)` : ""}${unlocked ? ` · 🔓 peças ${t.nome} liberadas na loja!` : ""}</span>
      <span class="money">+${fmt(income)}</span>
    </div>
    <p>${w.desc}</p>
    <button class="btn primary" id="go" data-autofocus type="button">Responder à pergunta →</button>`);
  await clickOnce(m, "#go");

  const q = w.quiz;
  const opts = shuffle(q.options.map((text, i) => ({ text, right: i === q.correct })));
  m = showModal(`
    <div class="modal-tag q">Pergunta · ${w.termo}</div>
    <h2 style="font-size:1.25rem">${q.q}</h2>
    <div class="opts">${opts.map((o, i) => `<button class="opt" data-i="${i}" type="button">${o.text}</button>`).join("")}</div>
    <div id="fb"></div>`);
  const chosen = await new Promise((res) => {
    m.querySelectorAll(".opt").forEach((b) => b.addEventListener("click", () => res(Number(b.dataset.i)), { once: true }));
  });
  const right = opts[chosen].right;
  m.querySelectorAll(".opt").forEach((b, i) => {
    b.disabled = true;
    if (opts[i].right) b.classList.add("right");
    else if (i === chosen) b.classList.add("wrongopt");
  });
  if (right) { addMoney(bonus); game.quizStreak++; sfx.play("correct"); if (game.quizStreak >= 5) ach.give("quiz5"); } else { game.quizStreak = 0; sfx.play("wrong"); }
  $("#fb", m).innerHTML = `
    <div class="explain ${right ? "good" : "bad"}"><b>${right ? "Correto! +" + fmt(bonus) + " de bônus." : "Não foi dessa vez, sem bônus."}</b><br>${q.explain}</div>
    ${hasNext
      ? `<button class="btn primary" id="next" data-autofocus type="button">Próxima palavra →</button>`
      : `<div class="btn-row"><button class="btn ghost" id="later" type="button">Continuar jogando</button><button class="btn primary" id="next" data-autofocus type="button">🛒 Ir para a loja</button></div>`}`;
  $("#next", m).focus();
  // true = o jogador quer abrir a loja agora; ninguém é obrigado a comprar neste momento
  return new Promise((res) => {
    $("#next", m).addEventListener("click", () => res(!hasNext), { once: true });
    const later = $("#later", m);
    if (later) later.addEventListener("click", () => res(false), { once: true });
  });
}

/* =========================================================
   Loja: sempre aberta, em janela por cima do jogo (o tempo fica parado)
   Acertar rápido libera peças melhores (nível de acesso, que fica para sempre).
   Depois disso, o jogador compra quando e o que quiser, limitado só pelo dinheiro.
   ========================================================= */

/* peça atual de um encaixe e custo de trocar por p (devolvendo parte da antiga) */
const currentPart = (slot) => (game.installed[slot] ? partById[game.installed[slot]] : null);
function netCost(p) {
  const cur = currentPart(p.slot);
  return p.price - (cur ? Math.floor(cur.price * ECONOMY.revenda) : 0);
}
function canBuy(p) {
  const cur = currentPart(p.slot);
  return p.tier <= game.access && !(cur && cur.tier >= p.tier) && netCost(p) <= game.money;
}
const upgradableSlots = () => SLOTS.filter((s) => PARTS.some((p) => p.slot === s.id && canBuy(p)));

/* aba que a loja mostra ao abrir: a primeira em que dá para melhorar agora */
function bestSlotToUpgrade() {
  const ok = upgradableSlots();
  if (ok.length) return ok[0].id;
  let best = SLOTS[0].id, low = 99;
  SLOTS.forEach((s) => { const t = tierOf(s.id); if (t < low) { low = t; best = s.id; } });
  return best;
}

/* o número no botão é quantos encaixes você pode melhorar com o saldo de agora */
function updateShopBadge() {
  const n = upgradableSlots().length;
  const badge = $("#shopBadge");
  badge.hidden = !n;
  badge.textContent = n;
  $("#shopBtn").classList.toggle("glow", game.newUnlock);
}

/* atualiza o selo da loja e, se a janela estiver aberta, o conteúdo dela */
function renderShop() {
  updateShopBadge();
  if (game.shopOpen) renderShopModal();
}

function openShop(fresh = false, then = null) {
  if (game.paused && !fresh) return; // outra janela já está aberta
  game.shopOpen = true;
  game.shopFresh = fresh; // aberta logo depois de um acerto: o relógio da velocidade recomeça ao sair
  game.shopThen = then;
  game.shopBought = false;
  game.shopMsg = "";
  game.newUnlock = false;
  sfx.play("open");
  game.shopSlot = bestSlotToUpgrade();
  const m = showModal(`<div id="shopRoot"></div>`, "shop-modal");
  m.addEventListener("click", shopClick);
  renderShopModal();
  updateShopBadge();
}

function closeShop() {
  if (!game.shopOpen) return;
  game.shopOpen = false;
  hideModal(game.shopFresh); // abrir a loja não zera nem congela o cronômetro: o tempo parado não conta
  const then = game.shopThen;
  game.shopThen = null;
  if (then) then(); else afterModal();
}

function shopClick(e) {
  const tab = e.target.closest("[data-slot]");
  if (tab) { game.shopSlot = tab.dataset.slot; renderShopModal(); return; }
  const buy = e.target.closest("[data-buy]");
  if (buy) { buyPart(buy.dataset.buy); return; }
  if (e.target.closest("#shopClose") || e.target.closest("#shopDone")) closeShop();
}

/* o que falta para liberar o próximo nível de peças */
function unlockTip() {
  const def = game.L ? game.L.def : LEVELS[0];
  if (game.access >= 3) return "Todas as peças liberadas.";
  if (game.access === 2) return `Responda em até ${def.tempoRapido} s, sem dica, para liberar as peças Ouro.`;
  return `Responda em até ${def.tempoMedio} s para liberar as Prata, ou em até ${def.tempoRapido} s para liberar as Ouro.`;
}

function renderShopModal() {
  const root = $("#shopRoot");
  if (!root) return;
  const keepScroll = $(".shop-left", root) ? $(".shop-left", root).scrollTop : 0;
  const score = computeScore();
  const rank = rankFor(score);
  const acc = TIERS[game.access];

  const sub = game.shopMsg
    ? `<span class="shop-msg">${game.shopMsg}</span>`
    : `<span class="chip ${acc.classe}">${MEDAL[game.access]} Acesso ${acc.nome}</span> ${unlockTip()}`;

  const tabs = SLOTS.map((s) => `<button class="tab t${tierOf(s.id)}${s.id === game.shopSlot ? " sel" : ""}" data-slot="${s.id}" type="button"><span class="ic">${s.icone}</span>${s.nome}</button>`).join("");

  const cur = currentPart(game.shopSlot);
  const refund = cur ? Math.floor(cur.price * ECONOMY.revenda) : 0;
  const cards = PARTS.filter((p) => p.slot === game.shopSlot).map((p) => {
    const net = netCost(p);
    let note = "", label = fmt(net), disabled = true, bad = false, dim = false;
    if (cur && cur.id === p.id) { note = "Instalada no seu PC."; label = "Instalada"; }
    else if (cur && cur.tier >= p.tier) { note = "Você já tem uma peça melhor ou igual."; label = "—"; dim = true; }
    else if (p.tier > game.access) { note = `🔒 Responda mais rápido para liberar as peças ${TIERS[p.tier].nome}.`; label = "Bloqueada"; dim = true; }
    else if (net > game.money) { note = `Faltam ${fmt(net - game.money)}. Junte dinheiro e volte quando quiser.`; bad = true; label = "Sem saldo"; }
    else { disabled = false; if (cur) note = `Troca por ${cur.nome} (devolve ${fmt(refund)}).`; }
    return `<div class="part t${p.tier}${dim ? " dim" : ""}">
      <div class="thumb">${partThumb(p.slot, p.tier)}</div>
      <div><div class="pname">${p.nome}</div>
        <div class="pmeta"><span class="chip ${TIERS[p.tier].classe}">${TIERS[p.tier].nome}</span><span>${fmt(p.price)}</span><span>+${p.power} pts</span></div></div>
      <button class="btn small buy ${disabled ? "" : "primary"}" data-buy="${p.id}" ${disabled ? "disabled" : ""} type="button">${label}</button>
      ${note ? `<div class="note ${bad ? "bad" : ""}">${note}</div>` : ""}
    </div>`;
  }).join("");

  root.innerHTML = `
    <div class="shop-top">
      <div class="shop-title">
        <div class="modal-tag q">Loja de peças</div>
        <div class="shop-sub">${sub}</div>
      </div>
      <div class="shop-wallet"><span>Saldo</span><strong>${fmt(game.money)}</strong></div>
      <button class="icon-btn" id="shopClose" type="button" aria-label="Fechar a loja">✕</button>
    </div>
    <div class="shop-body">
      <div class="shop-left">
        <div class="shop-tabs">${tabs}</div>
        <div class="parts">${cards}</div>
      </div>
      <div class="shop-right">
        <div class="shop-pc">${pcSvg(game.installed, game.justInstalled)}</div>
        <div class="shop-rank"><b>${rank.emoji} ${rank.nome}</b><span>${score} pts</span></div>
        <p class="shop-note">Seu dinheiro fica guardado até você decidir gastar.</p>
        <button class="btn primary" id="shopDone" data-autofocus type="button">${game.shopBought ? "Voltar ao jogo" : "Comprar depois"}</button>
      </div>
    </div>`;
  $(".shop-left", root).scrollTop = keepScroll;
}

function buyPart(id) {
  const p = partById[id];
  if (!canBuy(p)) return;
  const gasto = netCost(p);
  game.money -= gasto;
  floatText("−" + fmt(gasto), "loss");
  sfx.play("buy");
  game.installed[p.slot] = p.id;
  game.shopBought = true;
  game.justInstalled = p.slot;
  game.shopMsg = `✅ Instalado: ${p.nome}`;
  updateWallet();
  renderPC();
  renderShop();
  game.justInstalled = null;
  ach.give("first_part");
  const tiers = Object.values(game.installed).map((id) => partById[id].tier);
  if (tiers.length === SLOTS.length) ach.give("full_pc");
  if (tiers.filter((x) => x === 3).length >= 3) ach.give("gold3");
}

/* =========================================================
   Telas: boas-vindas, intro de nível, fim de nível e final
   ========================================================= */
function showLevelIntro() {
  const def = game.L.def;
  const first = game.levelIndex === 0 && game.solvedTotal === 0 && Object.keys(game.installed).length === 0;
  const pay = (n) => fmt(Math.round((n * def.mult) / 10) * 10);
  const rules = `
    <ul class="rules">
      <li>💰 <span>Cada palavra paga de <b>${pay(ECONOMY.renda[1])}</b> a <b>${pay(ECONOMY.renda[3])}</b>, mais <b>${pay(ECONOMY.bonusQuiz)}</b> se acertar o quiz</span></li>
      <li>⏱ <span>🥇 Ouro até <b>${def.tempoRapido} s</b> · 🥈 Prata até <b>${def.tempoMedio} s</b> · 🥉 Bronze: mais lento ou com dica</span></li>
      <li>💡 <span>Dica <b>${fmt(def.custoDica)}</b> · ${def.penalidade ? `erro no Conferir <b>−${fmt(def.penalidade)}</b>` : "errar no Conferir não custa nada"}</span></li>
      <li>🛒 <span>A loja fica sempre aberta. Acertar rápido libera peças melhores</span></li>
    </ul>`;
  const m = showModal(`
    <div class="modal-tag q">Nível ${def.id} de ${LEVELS.length}</div>
    <h2>${def.nome} <span class="diff ${def.dificuldade}">${def.dificuldade}</span></h2>
    ${game.mode === "dificil" ? '<p style="color:var(--bad);margin:0 0 6px">🔥 Modo tudo no difícil: recompensas 50% maiores.</p>' : ""}
    <p style="color:var(--muted)">${def.sub}</p>
    ${rules}
    <button class="btn primary" id="go" data-autofocus type="button">Começar</button>`);
  $("#go", m).addEventListener("click", () => {
    hideModal(true);
    focusWord(game.L.words[0]);
  });
}

function checkLevelEnd() {
  const L = game.L;
  if (game.paused || L.ended) return;
  if (L.solvedCount === L.words.length) {
    L.ended = true;
    setTimeout(showLevelComplete, 450);
  }
}

function showLevelComplete() {
  const L = game.L;
  const last = game.levelIndex === LEVELS.length - 1;
  const score = computeScore();
  const fails = L.mistakes + L.hints;
  const stars = fails === 0 ? 3 : fails <= 2 ? 2 : 1;
  if (!L.celebrated) { L.celebrated = true; confetti(70); sfx.play("level"); if (fails === 0) ach.give("clean_level"); }
  const m = showModal(`
    <div class="modal-tag">✔ Nível concluído</div>
    <h2 class="reveal">${L.def.nome}</h2>
    <div class="stars" aria-label="${stars} de 3 estrelas">${[1, 2, 3].map((i) => `<span class="star${i <= stars ? " on" : ""}" style="animation-delay:${0.2 + i * 0.25}s">★</span>`).join("")}</div>
    <div class="stats">
      <div class="stat"><b>${L.solvedCount}/${L.words.length}</b><small>Palavras</small></div>
      <div class="stat"><b>${fmt(game.money)}</b><small>Saldo</small></div>
      <div class="stat"><b>${score}</b><small>Pontos do PC</small></div>
    </div>
    <div class="final-pc">${pcSvg()}</div>
    <div class="btn-row"><button class="btn ghost" id="spend" type="button">🛒 Gastar dinheiro</button><button class="btn primary" id="go" data-autofocus type="button">${last ? "Ver resultado final →" : "Próximo nível →"}</button></div>`);
  $("#spend", m).addEventListener("click", () => openShop(true, showLevelComplete));
  $("#go", m).addEventListener("click", () => (last ? showFinal() : startLevel(game.levelIndex + 1)));
}

function showFinal() {
  const score = computeScore();
  const rank = rankFor(score);
  let best = 0;
  try {
    best = Number(localStorage.getItem("tuxforge.best") || 0);
    if (score > best) { best = score; localStorage.setItem("tuxforge.best", String(score)); }
  } catch (e) { best = Math.max(best, score); }
  confetti(90);
  sfx.play("level");
  if (score >= RANKS[RANKS.length - 1].min) ach.give("super");
  const m = showModal(`
    <div class="modal-tag">🏁 PC forjado</div>
    <div class="rank-big"><span class="em">${rank.emoji}</span>${rank.nome}</div>
    <div class="final-pc">${pcSvg()}</div>
    <div class="stats">
      <div class="stat"><b>${game.solvedTotal}/${TOTAL_WORDS}</b><small>Palavras</small></div>
      <div class="stat"><b>${score}</b><small>Pontos</small></div>
      <div class="stat"><b>${best}</b><small>Recorde</small></div>
    </div>
    <p style="text-align:center;color:var(--muted)">Você terminou com ${fmt(game.money)} no bolso. Dá para montar um PC ainda melhor?</p>
    <button class="btn primary" id="again" data-autofocus type="button">Jogar de novo</button>`);
  $("#again", m).addEventListener("click", () => { hideModal(false); showStart(); });
}

/* =========================================================
   HUD, timer e inicialização
   ========================================================= */
function updateHud() {
  const L = game.L;
  $("#counter").textContent = `${L.solvedCount} de ${L.words.length} palavras`;
  $("#skipBtn").textContent = skipLabel();
  const cb = $("#combo");
  cb.hidden = game.streak < 2;
  cb.textContent = `🔥 combo ×${game.streak}`;
  $("#levelPill").textContent = `Nível ${L.def.id}/${LEVELS.length} · ${L.def.dificuldade}`;
}

function renderAll() {
  updateHud();
  updateWallet();
  renderPC();
  renderShop();
}

function tick() {
  const L = game.L;
  if (!L) return;
  const now = game.paused ? game.pauseAt : performance.now();
  const t = Math.max(0, (now - L.lastMark) / 1000);
  const { tempoRapido: fast, tempoMedio: mid } = L.def;
  const tier = t <= fast ? 3 : t <= mid ? 2 : 1;
  const pct = t <= mid ? 100 - (t / mid) * 100 : 6;
  const fill = $("#timerFill");
  fill.style.width = pct + "%";
  fill.className = "meter-fill t" + tier;
  const tt = $("#timerTier");
  const dropped = game.lastTier && tier < game.lastTier && !game.paused;
  game.lastTier = tier;
  tt.textContent = TIERS[tier].nome;
  tt.className = "t" + tier;
  if (dropped) { tt.classList.add("flash"); sfx.play("tierdown"); }
  const wait = Math.ceil((game.skipUntil - performance.now()) / 1000);
  $("#skipBtn").disabled = wait > 0;
  $("#skipBtn").textContent = wait > 0 ? `⏭ Pular (${wait} s)` : skipLabel();
  $("#timerPay").textContent = "· +" + fmt(Math.round((ECONOMY.renda[tier] * (L.def.mult || 1)) / 10) * 10);
  $("#timerText").textContent = `${Math.floor(t)} s${game.paused ? " ⏸" : ""}`;
}

/* =========================================================
   Guia dos termos: explicação, como identificar, dicas e conquistas
   ========================================================= */
const letrasDe = Object.fromEntries(LEVELS.flatMap((l) => l.words).map((w) => [w.id, w.answer.length]));

function openGuide() {
  if (game.paused && !document.querySelector(".guide")) return; // outra janela já está aberta
  ach.give("guide");
  const st = { tab: "termos", cat: "Todos" };
  const cats = ["Todos", ...new Set(GUIDE.map((g) => g.cat))];
  const m = showModal(`<div class="guide"></div>`, "guide-modal");

  const draw = () => {
    let body = "";
    if (st.tab === "termos") {
      body = `<div class="chips">${cats.map((c) => `<button class="gchip${c === st.cat ? " sel" : ""}" data-cat="${c}" type="button">${c}</button>`).join("")}</div>
        <div class="terms">${GUIDE.filter((g) => st.cat === "Todos" || g.cat === st.cat).map((g) => `
          <article class="term">
            <header><b>${WORDS[g.id].termo}</b><span class="letters">${letrasDe[g.id]} letras</span><span class="cat">${g.cat}</span></header>
            <p>${g.resumo}</p>
            <div class="sinais"><span>🔎 Como identificar</span><ul>${g.sinais.map((s) => `<li>${s}</li>`).join("")}</ul></div>
            <p class="nao"><span>⚖️ Não confunda:</span> ${g.nao}</p>
          </article>`).join("")}</div>`;
    } else if (st.tab === "dicas") {
      body = `<div class="tips">${TIPS.map((t, i) => `<div class="tip"><span class="n">${i + 1}</span><div><b>${t.t}</b><p>${t.d}</p></div></div>`).join("")}</div>`;
    } else {
      body = `<div class="achs">${ACHIEVEMENTS.map((a) => `<div class="ach${ach.has(a.id) ? " on" : ""}"><span class="ic">${ach.has(a.id) ? a.icone : "🔒"}</span><div><b>${a.nome}</b><p>${a.desc}</p></div></div>`).join("")}</div>`;
    }
    const tab = (id, label) => `<button class="gtab${st.tab === id ? " sel" : ""}" data-tab="${id}" type="button">${label}</button>`;
    $(".guide", m).innerHTML = `
      <div class="guide-top"><div><div class="modal-tag q">Guia</div><h2>Guia dos termos</h2></div><button class="icon-btn" id="guideClose" type="button" aria-label="Fechar o guia">✕</button></div>
      <div class="gtabs">${tab("termos", "📚 Termos")}${tab("dicas", "🧭 Como atacar")}${tab("conquistas", `🏆 Conquistas ${ach.count()}/${ACHIEVEMENTS.length}`)}</div>
      <div class="guide-body">${body}</div>`;
  };
  draw();
  m.addEventListener("click", (e) => {
    const tab = e.target.closest("[data-tab]");
    if (tab) { st.tab = tab.dataset.tab; draw(); return; }
    const cat = e.target.closest("[data-cat]");
    if (cat) { st.cat = cat.dataset.cat; draw(); return; }
    if (e.target.closest("#guideClose")) closeGuide();
  });
}

function closeGuide() {
  if (!document.querySelector(".guide")) return;
  hideModal(false);
  if (game.L && $("#start").hidden) afterModal();
}

/* =========================================================
   Tela de carregamento (barra, mensagens e pré-carga das imagens)
   ========================================================= */
function runBoot() {
  const boot = $("#boot");
  if (!boot) return;
  const msgs = ["Ligando a CPU…", "Carregando a RAM…", "Montando o gabinete…", "Acendendo as ventoinhas RGB…", "Tudo pronto!"];
  const total = reduceMotion() ? 400 : 1900, t0 = performance.now();
  const imgs = ["img/logo-gato.png", "img/logo-gato-pequeno.png"].map((src) => new Promise((r) => { const i = new Image(); i.onload = i.onerror = r; i.src = src; }));
  let loaded = false, finished = false;
  Promise.all([...imgs, document.fonts ? document.fonts.ready : Promise.resolve()]).then(() => { loaded = true; });
  const done = () => {
    if (finished) return;
    finished = true;
    $("#bootFill").style.width = "100%";
    $("#bootMsg").textContent = msgs[msgs.length - 1];
    boot.classList.add("done");
    setTimeout(() => boot.remove(), 650);
  };
  boot.addEventListener("click", done);
  setTimeout(done, total + 3500); // garantia: nunca trava na carga
  const step = (now) => {
    if (finished) return;
    const k = Math.min(1, (now - t0) / total);
    $("#bootFill").style.width = Math.round(k * (loaded ? 100 : 92)) + "%";
    $("#bootMsg").textContent = msgs[Math.min(msgs.length - 2, Math.floor(k * (msgs.length - 1)))];
    if (k >= 1 && loaded) done(); else requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function init() {
  $("#checkBtn").addEventListener("click", conferir);
  $("#hintBtn").addEventListener("click", useHint);
  $("#resetBtn").addEventListener("click", askReset);
  $("#skipBtn").addEventListener("click", askSkip);
  $("#newGameBtn").addEventListener("click", askNewGame);
  document.querySelectorAll(".mode").forEach((btn) => btn.addEventListener("click", () => {
    document.querySelectorAll(".mode").forEach((x) => { x.classList.toggle("sel", x === btn); x.setAttribute("aria-checked", x === btn); });
  }));
  $("#startBtn").addEventListener("click", beginGame);
  $("#shopBtn").addEventListener("click", () => openShop(false));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { if (game.shopOpen) closeShop(); else closeGuide(); } });
  window.addEventListener("resize", updateCellSize);
  setInterval(tick, 250);
  document.addEventListener("click", (e) => { if (e.target.closest("button:not(#muteBtn)")) sfx.play("click"); }, true);
  const mb = $("#muteBtn");
  const paintMute = () => { mb.textContent = sfx.on ? "🔊" : "🔇"; mb.setAttribute("aria-pressed", String(!sfx.on)); };
  paintMute();
  mb.addEventListener("click", () => { sfx.toggle(); paintMute(); });
  $("#guideBtn").addEventListener("click", openGuide);
  $("#startGuide").addEventListener("click", openGuide);
  showStart();
  runBoot();
}

init();
