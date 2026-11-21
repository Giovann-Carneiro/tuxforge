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

/* ---------- estado ---------- */
const game = {
  mode: "recomendado", // "recomendado" (fácil → difícil) ou "dificil" (tudo no difícil)
  levelIndex: 0,
  money: ECONOMY.inicial,
  installed: {}, // slotId -> partId
  solvedTotal: 0,
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
  $("#specs").innerHTML = SLOTS.map((sl) => {
    const p = game.installed[sl.id] ? partById[game.installed[sl.id]] : null;
    const flash = game.justInstalled === sl.id ? " flash" : "";
    const thumb = p ? partThumb(sl.id, p.tier) : `<span class="ph">${sl.icone}</span>`;
    return `<li class="spec ${p ? "t" + p.tier : "empty"}${flash}" title="${sl.nome}: ${p ? p.nome : "vazio"}"><div class="sthumb">${thumb}</div><span class="sl">${sl.curto}</span></li>`;
  }).join("");
}

function updateWallet(bump = false) {
  $("#money").textContent = fmt(game.money);
  updateShopBadge();
  if (bump) {
    const w = $(".wallet");
    w.classList.remove("bump");
    void w.offsetWidth;
    w.classList.add("bump");
  }
}
function addMoney(n) { game.money += n; updateWallet(true); renderShop(); }

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
  const L = { def, words: [], cells: new Map(), wi: 0, dir: "H", cur: null, lastMark: performance.now(), solvedCount: 0, ended: false };

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
  $("#message").textContent = "";
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
    if (v) advance(cell);
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
    if (L.def.penalidade && w.sig !== guess) penalty += L.def.penalidade;
    w.sig = guess;
  });
  if (penalty) {
    const lost = Math.min(penalty, game.money);
    game.money -= lost;
    updateWallet();
    renderShop();
  }

  /* palavras certas: travam e entram na fila de recompensas */
  ok.forEach((w) => {
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
const skipLabel = () => (isLastLevel() ? "⏭ Pular para o final" : "⏭ Pular nível");

function askSkip() {
  if (game.paused) return;
  const wait = Math.ceil((game.skipUntil - performance.now()) / 1000);
  if (wait > 0) { toast(`Você errou o desafio. Tente de novo em ${wait} s.`, true); return; }
  const last = isLastLevel();
  const m = showModal(`
    <div class="modal-tag warn">Desafio</div>
    <h2>${last ? "Pular para o final?" : "Pular para o próximo nível?"}</h2>
    <p>Responda a <b>uma pergunta muito difícil</b>. Se acertar, ${last ? "o jogo termina e mostra o seu resultado" : "você vai direto para o próximo nível"}. As palavras que faltam aqui <b>não rendem dinheiro</b>.</p>
    <p>Se errar, você continua neste nível e só pode tentar de novo depois de <b>${SKIP.espera} s</b>.</p>
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
      $("#fb", m).innerHTML = `
        <div class="explain good"><b>Acertou! Desafio vencido.</b><br>${q.explain}</div>
        <button class="btn primary" id="go2" data-autofocus type="button">${last ? "Ver resultado final →" : "Ir para o próximo nível →"}</button>`;
      $("#go2", m).focus();
      $("#go2", m).addEventListener("click", () => (last ? showFinal() : startLevel(game.levelIndex + 1)));
    } else {
      game.skipUntil = performance.now() + SKIP.espera * 1000;
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
  const income = Math.round((ECONOMY.renda[tier] * mult) / 10) * 10;
  const bonus = Math.round((ECONOMY.bonusQuiz * mult) / 10) * 10;
  addMoney(income);
  const unlocked = tier > game.access;
  if (unlocked) { game.access = tier; game.newUnlock = true; updateShopBadge(); }

  const why = w.hint ? "usou dica" : `${Math.round(w.elapsed)} s`;
  let m = showModal(`
    <div class="modal-tag">✔ Palavra descoberta</div>
    <h2 class="reveal">${w.termo}</h2>
    <div class="tier-banner ${t.classe}">
      <span class="medal">${MEDAL[tier]}</span>
      <span class="grow"><span class="chip ${t.classe}">${t.nome}</span> ${why}${unlocked ? ` · 🔓 peças ${t.nome} liberadas na loja!` : ""}</span>
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
  if (right) addMoney(bonus);
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
  ["#shopBadge", "#pcShopBadge"].forEach((sel) => { const b = $(sel); b.hidden = !n; b.textContent = n; });
  ["#shopBtn", "#pcShopBtn"].forEach((sel) => $(sel).classList.toggle("glow", game.newUnlock));
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
        <p class="shop-note">A loja fica sempre aberta no botão 🛒 do topo. Seu dinheiro fica guardado até você decidir gastar.</p>
        <button class="btn primary" id="shopDone" data-autofocus type="button">${game.shopBought ? "Voltar ao jogo" : "Comprar depois"}</button>
      </div>
    </div>`;
  $(".shop-left", root).scrollTop = keepScroll;
}

function buyPart(id) {
  const p = partById[id];
  if (!canBuy(p)) return;
  game.money -= netCost(p);
  game.installed[p.slot] = p.id;
  game.shopBought = true;
  game.justInstalled = p.slot;
  game.shopMsg = `✅ Instalado: ${p.nome}`;
  updateWallet();
  renderPC();
  renderShop();
  game.justInstalled = null;
}

/* =========================================================
   Telas: boas-vindas, intro de nível, fim de nível e final
   ========================================================= */
function showLevelIntro() {
  const def = game.L.def;
  const first = game.levelIndex === 0 && game.solvedTotal === 0 && Object.keys(game.installed).length === 0;
  const rules = `
    <ul class="rules">
      <li>🛒 <span>A loja fica <b>sempre aberta</b>: compre quando quiser. Acertar rápido libera peças melhores</span></li>
      <li>💰 <span>Cada palavra paga de <b>${fmt(Math.round((ECONOMY.renda[1] * def.mult) / 10) * 10)}</b> (Bronze) a <b>${fmt(Math.round((ECONOMY.renda[3] * def.mult) / 10) * 10)}</b> (Ouro), mais <b>${fmt(Math.round((ECONOMY.bonusQuiz * def.mult) / 10) * 10)}</b> se acertar o quiz</span></li>
      <li>🥇 <span><b>Ouro:</b> até ${def.tempoRapido} s desde o último acerto, sem dica</span></li>
      <li>🥈 <span><b>Prata:</b> até ${def.tempoMedio} s</span></li>
      <li>🥉 <span><b>Bronze:</b> mais lento que isso, ou com dica</span></li>
      <li>💡 <span>Cada dica custa <b>${fmt(def.custoDica)}</b> e rebaixa a peça para Bronze</span></li>
      ${def.penalidade ? `<li>⚠️ <span>Palavra errada no Conferir: <b>−${fmt(def.penalidade)}</b></span></li>` : `<li>🟢 <span>Neste nível, errar no Conferir não custa dinheiro</span></li>`}
      <li>🔤 <span>${def.reveal === "first" ? "A primeira letra das palavras maiores já vem revelada" : "O tabuleiro começa vazio, sem letras de ajuda"}</span></li>
    </ul>`;
  const welcome = first ? `
    <p>Acerte as palavras da cruzadinha, leia a descrição, responda ao quiz e <b>monte o seu PC</b>. Quanto mais rápido você acerta, melhores as peças que pode escolher. Mas o dinheiro é limitado!</p>` : "";
  const m = showModal(`
    <div class="modal-tag q">Nível ${def.id} de ${LEVELS.length}</div>
    <h2>${def.nome} <span class="diff ${def.dificuldade}">${def.dificuldade}</span></h2>
    ${game.mode === "dificil" ? '<p style="color:var(--bad);margin:0 0 6px">🔥 Modo tudo no difícil: recompensas 50% maiores.</p>' : ""}
    <p style="color:var(--muted)">${def.sub}</p>
    ${welcome}${rules}
    <button class="btn primary" id="go" data-autofocus type="button">${first ? "Ligar o PC e começar" : "Começar nível"}</button>`);
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
  const m = showModal(`
    <div class="modal-tag">✔ Nível concluído</div>
    <h2 class="reveal">${L.def.nome}</h2>
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
  $("#total").textContent = `${game.solvedTotal} de ${TOTAL_WORDS}`;
  $("#skipBtn").textContent = skipLabel();
  $("#levelPill").textContent = `Nível ${L.def.id} · ${L.def.nome} · ${L.def.dificuldade}`;
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
  tt.textContent = TIERS[tier].nome;
  tt.className = "t" + tier;
  const wait = Math.ceil((game.skipUntil - performance.now()) / 1000);
  $("#skipBtn").disabled = wait > 0;
  $("#skipBtn").textContent = wait > 0 ? `⏭ Pular (${wait} s)` : skipLabel();
  $("#timerPay").textContent = "· +" + fmt(Math.round((ECONOMY.renda[tier] * (L.def.mult || 1)) / 10) * 10);
  $("#timerText").textContent = `${Math.floor(t)} s desde o último acerto${game.paused ? " (pausado)" : ""}`;
}

function init() {
  $("#checkBtn").addEventListener("click", conferir);
  $("#hintBtn").addEventListener("click", useHint);
  $("#resetBtn").addEventListener("click", askReset);
  $("#skipBtn").addEventListener("click", askSkip);
  $("#newGameBtn").addEventListener("click", askNewGame);
  $("#brandLogo").innerHTML = logoSvg("brand-svg");
  $("#startLogo").innerHTML = logoSvg("start-svg");
  document.querySelectorAll(".mode").forEach((btn) => btn.addEventListener("click", () => {
    document.querySelectorAll(".mode").forEach((x) => { x.classList.toggle("sel", x === btn); x.setAttribute("aria-checked", x === btn); });
  }));
  $("#startBtn").addEventListener("click", beginGame);
  $("#shopBtn").addEventListener("click", () => openShop(false));
  $("#pcShopBtn").addEventListener("click", () => openShop(false));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && game.shopOpen) closeShop(); });
  window.addEventListener("resize", updateCellSize);
  setInterval(tick, 250);
  showStart();
}

init();
