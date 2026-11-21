/* =========================================================
   TUXFORGE — ilustrações das peças (SVG desenhado em código)
   Cada peça tem 3 versões: 1 = Bronze, 2 = Prata, 3 = Ouro.
   As mesmas ilustrações aparecem na loja, na lista e dentro do PC.
   ========================================================= */
"use strict";

const ART_C = { 1: "#e08d4f", 2: "#cfdae6", 3: "#ffd54a" };
const metal = (t) => `url(#g${t})`;

/* ventoinha (usa a classe .fan, que gira) */
function artFan(cx, cy, r, c, rgb = false) {
  const blades = [0, 72, 144, 216, 288]
    .map((a) => `<path d="M${cx} ${cy} q${r * 0.55} ${-r * 0.1} ${r * 0.45} ${-r * 0.8}" transform="rotate(${a} ${cx} ${cy})" fill="${c}" fill-opacity=".38" stroke="${c}" stroke-width=".7"/>`)
    .join("");
  return `<g class="fan"><circle cx="${cx}" cy="${cy}" r="${r}" fill="#0c0613" stroke="${rgb ? "url(#rgbGrad)" : c}" stroke-width="${rgb ? 2 : 1.2}"/>${blades}<circle cx="${cx}" cy="${cy}" r="${Math.max(1.6, r * 0.2)}" fill="${c}"/></g>`;
}

/* tamanho nativo de cada desenho (largura, altura) */
const ART_SIZE = {
  case: [100, 120], mobo: [120, 156], cpu: [60, 60], ram: [12, 60],
  gpu: [160, 48], storage: [100, 50], psu: [160, 48], cooler: [100, 100],
};

const ART = {
  /* ---------- Gabinete (fechado, visto de frente) ---------- */
  case(t) {
    const c = ART_C[t];
    const rgbEdge = t === 3 ? `stroke="url(#rgbGrad)" stroke-width="2.6" class="rgbanim"` : `stroke="${c}" stroke-width="1.6"`;
    let s = `<rect x="6" y="2" width="88" height="112" rx="7" fill="#110b17" ${rgbEdge}/>`;
    if (t === 1) {
      for (let y = 14; y < 62; y += 5) s += `<line x1="16" x2="84" y1="${y}" y2="${y}" stroke="${c}" stroke-opacity=".4"/>`;
      s += artFan(50, 84, 15, c);
    } else if (t === 2) {
      s += `<rect x="14" y="12" width="72" height="92" rx="4" fill="rgba(150, 220, 255,.10)" stroke="${c}" stroke-opacity=".8"/>`;
      s += `<path d="M14 80 L86 20 V34 L14 94Z" fill="rgba(255, 255, 255,.08)"/>`;
      s += artFan(50, 36, 15, c) + artFan(50, 78, 15, c);
    } else {
      s += `<rect x="14" y="12" width="72" height="92" rx="4" fill="rgba(150, 220, 255,.07)" stroke="url(#rgbGrad)" stroke-opacity=".8"/>`;
      s += artFan(50, 28, 12, c, true) + artFan(50, 58, 12, c, true) + artFan(50, 88, 12, c, true);
    }
    s += `<circle cx="50" cy="108" r="2.6" fill="${c}"/>`;
    s += `<rect x="14" y="114" width="12" height="4" rx="1" fill="${c}"/><rect x="74" y="114" width="12" height="4" rx="1" fill="${c}"/>`;
    return s;
  },

  /* ---------- Placa-mãe (vista de cima, ainda sem peças) ---------- */
  mobo(t) {
    const c = ART_C[t];
    const pcb = t === 1 ? "#230f3a" : t === 2 ? "#10262e" : "#1a1a1f";
    let s = `<rect x="1" y="1" width="118" height="154" rx="4" fill="${pcb}" stroke="${c}" stroke-width="1.5"/>`;
    // trilhas decorativas
    s += `<path d="M8 70 H28 V60 M8 90 H60 M110 60 V130 M100 64 V120 M30 150 H70" stroke="${c}" stroke-opacity=".28" fill="none"/>`;
    // soquete da CPU
    s += `<rect x="30" y="15" width="39" height="39" rx="3" fill="#0d0615" stroke="${c}" stroke-width="1"/>`;
    for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) s += `<circle cx="${36 + i * 5.4}" cy="${21 + j * 5.4}" r=".8" fill="${c}" fill-opacity=".5"/>`;
    // slots de RAM
    for (let i = 0; i < 4; i++) s += `<rect x="${80 + i * 8.5}" y="9" width="5.4" height="50" rx="1" fill="#110a1a" stroke="${c}" stroke-opacity=".7" stroke-width=".6"/>`;
    // slots PCIe
    s += `<rect x="10" y="78" width="96" height="6" rx="1.5" fill="#110a1a" stroke="${c}" stroke-opacity=".8" stroke-width=".7"/>`;
    s += `<rect x="10" y="100" width="60" height="5" rx="1.5" fill="#110a1a" stroke="${c}" stroke-opacity=".6" stroke-width=".6"/>`;
    // slot M.2 e SATA
    s += `<rect x="12" y="122" width="40" height="7" rx="1.5" fill="#110a1a" stroke="${c}" stroke-opacity=".6" stroke-width=".6"/>`;
    for (let i = 0; i < 4; i++) s += `<rect x="${12 + i * 9}" y="144" width="7" height="6" rx="1" fill="#110a1a" stroke="${c}" stroke-opacity=".7" stroke-width=".6"/>`;
    // capacitores
    for (let i = 0; i < 5; i++) s += `<circle cx="${12 + i * 5}" cy="30" r="2" fill="#222" stroke="${c}" stroke-opacity=".6" stroke-width=".5"/>`;
    // dissipadores e blindagens (Prata e Ouro)
    if (t === 1) {
      s += `<rect x="78" y="118" width="26" height="20" rx="2" fill="#231335" stroke="${c}" stroke-width=".8"/>`;
    } else {
      s += `<rect x="5" y="8" width="18" height="52" rx="2" fill="${metal(t)}" fill-opacity=".85"/>`;
      s += `<rect x="28" y="4" width="46" height="8" rx="2" fill="${metal(t)}" fill-opacity=".85"/>`;
      for (let y = 14; y < 58; y += 5) s += `<line x1="7" x2="21" y1="${y}" y2="${y}" stroke="#000" stroke-opacity=".35"/>`;
    }
    if (t === 3) {
      s += `<rect x="72" y="112" width="40" height="34" rx="3" fill="${metal(3)}" fill-opacity=".9"/><path d="M78 122 H106 M78 130 H106 M78 138 H100" stroke="#000" stroke-opacity=".4"/>`;
      s += `<rect x="2" y="2" width="116" height="152" rx="4" fill="none" stroke="url(#rgbGrad)" stroke-width="1.2" class="rgbanim"/>`;
    }
    return s;
  },

  /* ---------- CPU (vista de cima) ---------- */
  cpu(t) {
    const c = ART_C[t];
    let s = `<rect x="1" y="1" width="58" height="58" rx="5" fill="#220e39" stroke="${c}" stroke-width="1.4"/>`;
    for (let i = 0; i < 9; i++) {
      const p = 6 + i * 6;
      s += `<rect x="${p}" y="1.6" width="2" height="3" fill="${c}" opacity=".75"/><rect x="${p}" y="55.4" width="2" height="3" fill="${c}" opacity=".75"/>`;
      s += `<rect x="1.6" y="${p}" width="3" height="2" fill="${c}" opacity=".75"/><rect x="55.4" y="${p}" width="3" height="2" fill="${c}" opacity=".75"/>`;
    }
    s += `<rect x="9" y="9" width="42" height="42" rx="4" fill="${metal(t)}" stroke="#0008" stroke-width=".8"/>`;
    s += `<rect x="13" y="13" width="34" height="34" rx="2.5" fill="#160b23" stroke="${c}" stroke-opacity=".6" stroke-width=".6"/>`;
    const core = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1" fill="#25113c" stroke="${c}" stroke-width=".7"/>`;
    if (t === 1) s += core(15.5, 17, 14, 26) + core(30.5, 17, 14, 26);
    if (t === 2) for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) s += core(15.5 + b * 15, 15.5 + a * 15, 14, 14);
    if (t === 3) for (let a = 0; a < 4; a++) for (let b = 0; b < 6; b++) s += core(14.8 + b * 5.3, 14.8 + a * 8.1, 4.5, 7.2);
    s += `<path d="M1 14 L14 1 H6 Q1 1 1 6Z" fill="${c}"/>`;
    return s;
  },

  /* ---------- Memória RAM (um módulo, em pé) ---------- */
  ram(t) {
    const c = ART_C[t];
    let s = `<rect x="0.5" y="0.5" width="11" height="59" rx="1.5" fill="#230f3a" stroke="${c}" stroke-width=".9"/>`;
    for (let i = 0; i < 6; i++) s += `<rect x="${1.2 + i * 1.7}" y="55.6" width="1" height="3.6" fill="#ffd54a"/>`;
    s += `<rect x="5" y="57" width="2" height="3" fill="#0a0311"/>`;
    if (t === 1) {
      for (let i = 0; i < 4; i++) s += `<rect x="2" y="${5 + i * 12.5}" width="8" height="9" rx="1" fill="#1a1520" stroke="#556" stroke-width=".4"/>`;
    } else {
      s += `<rect x="1" y="2" width="10" height="50" rx="1.5" fill="${metal(t)}"/>`;
      for (let y = 8; y < 50; y += 6) s += `<line x1="1.5" x2="10.5" y1="${y}" y2="${y}" stroke="#000" stroke-opacity=".3" stroke-width=".6"/>`;
    }
    if (t === 3) s += `<rect x="1" y="0.5" width="10" height="4" rx="1.5" fill="url(#rgbGrad)" class="rgbanim"/>`;
    return s;
  },

  /* ---------- Placa de vídeo ---------- */
  gpu(t) {
    const c = ART_C[t];
    let s = `<rect x="1" y="5" width="158" height="35" rx="4" fill="#130d1a" stroke="${c}" stroke-width="1.4"/>`;
    s += `<rect x="1" y="5" width="6" height="35" rx="2" fill="${metal(t)}"/>`;
    s += `<rect x="118" y="1" width="30" height="5" rx="1" fill="#222" stroke="${c}" stroke-width=".7"/>`; // conector de energia
    for (let i = 0; i < 24; i++) s += `<rect x="${12 + i * 3.1}" y="40" width="1.8" height="6" fill="#ffd54a"/>`; // contatos PCIe
    const r = t === 1 ? 12.5 : t === 2 ? 12 : 11;
    for (let i = 0; i < t; i++) s += artFan(7 + (152 / t) * (i + 0.5), 22.5, r, c, t === 3);
    if (t >= 2) s += `<line x1="9" x2="157" y1="8.5" y2="8.5" stroke="${t === 3 ? "url(#rgbGrad)" : c}" stroke-width="1.2" class="${t === 3 ? "rgbanim" : ""}"/>`;
    return s;
  },

  /* ---------- Armazenamento ---------- */
  storage(t) {
    const c = ART_C[t];
    if (t === 1) { // HD
      let s = `<rect x="2" y="2" width="96" height="46" rx="4" fill="#19161d" stroke="${c}" stroke-width="1.4"/>`;
      s += `<circle cx="32" cy="25" r="19" fill="#0e0b12" stroke="${c}" stroke-width="1"/><circle cx="32" cy="25" r="12" fill="none" stroke="${c}" stroke-opacity=".4"/><circle cx="32" cy="25" r="4" fill="${metal(1)}"/>`;
      s += `<path d="M78 10 L42 22" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/><circle cx="80" cy="9" r="3" fill="${metal(1)}"/>`;
      s += `<rect x="62" y="30" width="30" height="14" rx="2" fill="#230f3a" stroke="${c}" stroke-width=".6"/>`;
      s += `<circle cx="7" cy="7" r="1.5" fill="${c}"/><circle cx="93" cy="7" r="1.5" fill="${c}"/><circle cx="7" cy="43" r="1.5" fill="${c}"/><circle cx="93" cy="43" r="1.5" fill="${c}"/>`;
      return s;
    }
    // SSD NVMe (M.2)
    let s = `<rect x="6" y="13" width="90" height="24" rx="3" fill="#230f3a" stroke="${c}" stroke-width="1.3"/>`;
    for (let i = 0; i < 12; i++) s += `<rect x="${8 + i * 2.2}" y="33" width="1.2" height="4" fill="#ffd54a"/>`;
    s += `<circle cx="91" cy="25" r="2.2" fill="#0a0311" stroke="${c}" stroke-width=".6"/>`;
    if (t === 2) {
      for (let i = 0; i < 3; i++) s += `<rect x="${36 + i * 16}" y="16" width="13" height="15" rx="1.5" fill="#1a1520" stroke="${c}" stroke-width=".6"/>`;
      s += `<rect x="14" y="19" width="16" height="9" rx="1.5" fill="#233" stroke="${c}" stroke-width=".5"/>`;
    } else {
      s += `<rect x="14" y="9" width="76" height="32" rx="3" fill="${metal(3)}" stroke="#0008" stroke-width=".6"/>`;
      for (let x = 20; x < 88; x += 5) s += `<line x1="${x}" x2="${x}" y1="12" y2="38" stroke="#000" stroke-opacity=".3"/>`;
      s += `<rect x="14" y="9" width="76" height="3" rx="1.5" fill="url(#rgbGrad)" class="rgbanim"/>`;
    }
    return s;
  },

  /* ---------- Fonte ---------- */
  psu(t) {
    const c = ART_C[t];
    let s = `<rect x="1" y="1" width="158" height="46" rx="4" fill="#191220" stroke="${t === 3 ? "url(#rgbGrad)" : c}" stroke-width="${t === 3 ? 2 : 1.4}" ${t === 3 ? 'class="rgbanim"' : ""}/>`;
    s += artFan(31, 24, 18, c);
    for (let i = 0; i < 9; i++) s += `<line x1="${60 + i * 6}" x2="${60 + i * 6}" y1="7" y2="41" stroke="${c}" stroke-opacity=".5"/>`;
    s += `<rect x="116" y="8" width="38" height="32" rx="3" fill="${metal(t)}"/>`;
    s += `<text x="135" y="28" class="arttxt" style="fill:#110a1a;font-size:9px">${["", "300 W", "650 W", "1600 W"][t]}</text>`;
    if (t >= 2) for (let i = 0; i < t + 1; i++) s += `<rect x="${64 + i * 14}" y="43" width="9" height="5" rx="1" fill="${["#ff5d6c", "#ffd54a", "#ff5bd6", "#3df58a"][i]}"/>`;
    return s;
  },

  /* ---------- Cooler ---------- */
  cooler(t) {
    const c = ART_C[t];
    if (t === 1) { // dissipador com ventoinha
      let s = `<rect x="14" y="14" width="72" height="72" rx="6" fill="#1f1a24" stroke="${c}" stroke-width="1.4"/>`;
      for (let i = 0; i < 8; i++) s += `<line x1="${20 + i * 8.5}" x2="${20 + i * 8.5}" y1="16" y2="84" stroke="${c}" stroke-opacity=".3"/>`;
      s += artFan(50, 50, 26, c);
      [[18, 18], [82, 18], [18, 82], [82, 82]].forEach(([x, y]) => { s += `<circle cx="${x}" cy="${y}" r="2" fill="${c}"/>`; });
      return s;
    }
    if (t === 2) { // water cooler (AIO)
      let s = `<rect x="6" y="4" width="88" height="16" rx="3" fill="#1f1a24" stroke="${c}" stroke-width="1.3"/>`;
      for (let i = 0; i < 12; i++) s += `<line x1="${11 + i * 7}" x2="${11 + i * 7}" y1="6" y2="18" stroke="${c}" stroke-opacity=".4"/>`;
      s += `<path d="M30 20 C30 36 36 40 40 50 M70 20 C70 36 64 40 60 50" stroke="#27323a" stroke-width="5" fill="none" stroke-linecap="round"/>`;
      s += `<circle cx="50" cy="66" r="26" fill="#140e1b" stroke="${c}" stroke-width="1.5"/><circle cx="50" cy="66" r="19" fill="none" stroke="${c}" stroke-opacity=".5"/>`;
      s += artFan(50, 66, 14, c);
      return s;
    }
    // refrigeração líquida custom
    let s = `<rect x="76" y="6" width="16" height="44" rx="6" fill="rgba(197, 139, 255,.18)" stroke="#c58bff" stroke-width="1.2"/><rect x="78" y="24" width="12" height="24" rx="4" fill="#c58bff" fill-opacity=".55"/>`;
    s += `<path d="M84 50 C84 70 62 68 62 78 M18 40 C18 22 40 30 40 44" stroke="#c58bff" stroke-width="5.5" fill="none" stroke-linecap="round" opacity=".85"/>`;
    s += `<path d="M84 50 C84 70 62 68 62 78 M18 40 C18 22 40 30 40 44" stroke="#f3e0ff" stroke-width="1.4" fill="none" stroke-linecap="round" opacity=".9"/>`;
    s += `<rect x="22" y="44" width="46" height="46" rx="6" fill="#110a1a" stroke="url(#rgbGrad)" stroke-width="2.2" class="rgbanim"/>`;
    s += `<circle cx="45" cy="67" r="15" fill="none" stroke="${c}" stroke-width="1.2"/>` + artFan(45, 67, 10, c, true);
    return s;
  },
};

/* coloca um desenho dentro de uma caixa (x, y, w, h), centralizado e proporcional */
function placeArt(slot, t, x, y, w, h, cls = "") {
  const [W, H] = ART_SIZE[slot];
  const s = Math.min(w / W, h / H);
  const ox = x + (w - W * s) / 2, oy = y + (h - H * s) / 2;
  return `<g class="${cls}"><g transform="translate(${ox.toFixed(2)} ${oy.toFixed(2)}) scale(${s.toFixed(4)})">${ART[slot](t)}</g></g>`;
}

/* miniatura de uma peça (loja e lista) */
function partThumb(slot, t) {
  let inner;
  if (slot === "ram") {
    const n = { 1: 1, 2: 2, 3: 4 }[t];
    const w = 15, gap = 6, total = n * w + (n - 1) * gap;
    inner = "";
    for (let i = 0; i < n; i++) inner += placeArt("ram", t, (120 - total) / 2 + i * (w + gap), 4, w, 72);
  } else {
    inner = placeArt(slot, t, 6, 4, 108, 72);
  }
  return `<svg class="pc-svg art" viewBox="0 0 120 80" aria-hidden="true">${inner}</svg>`;
}

/* =========================================================
   O computador montado (usa as mesmas ilustrações)
   ========================================================= */
function pcSvg(inst = game.installed, pop = null) {
  const T = (s) => (inst[s] ? partById[inst[s]].tier : 0);
  const P = (s) => (pop === s ? "pop" : "");
  const lbl = (x, y, t) => `<text class="lbl" x="${x}" y="${y}">${t}</text>`;
  let s = `<svg class="pc-svg" viewBox="0 0 260 300" role="img" aria-label="Seu computador montado">`;

  /* gabinete (aberto, só a moldura) */
  const c = T("case");
  if (!c) {
    s += `<rect class="empty" x="8" y="6" width="244" height="288" rx="14"/>${lbl(130, 17, "GABINETE")}`;
  } else {
    s += `<g class="t${c} ${P("case")}"><rect class="solid" style="fill-opacity:.05" x="8" y="6" width="244" height="288" rx="14"/>`;
    if (c === 2) s += `<path class="glass" d="M150 6 H238 a14 14 0 0 1 14 14 V280 a14 14 0 0 1 -14 14 H70 Z"/>`;
    if (c === 3) s += `<rect class="rgb rgbanim" x="8" y="6" width="244" height="288" rx="14"/>`;
    for (let i = 0; i < 6; i++) s += `<line class="line" style="opacity:.45" x1="198" x2="240" y1="${40 + i * 10}" y2="${40 + i * 10}"/>`;
    // ventoinhas traseiras / laterais
    if (c >= 2) s += `<g class="fan"><circle class="line" cx="222" cy="150" r="14"/><circle class="dot" cx="222" cy="150" r="2.4"/><path class="line" d="M222 150 q8 -2 6 -10 M222 150 q2 8 10 6 M222 150 q-8 2 -6 10 M222 150 q-2 -8 -10 -6"/></g>`;
    if (c === 3) s += `<g class="fan"><circle class="line" cx="222" cy="206" r="14"/><circle class="dot" cx="222" cy="206" r="2.4"/><path class="line" d="M222 206 q8 -2 6 -10 M222 206 q2 8 10 6 M222 206 q-8 2 -6 10 M222 206 q-2 -8 -10 -6"/></g>`;
    s += `</g>`;
  }

  /* placa-mãe */
  const m = T("mobo");
  if (!m) s += `<rect class="empty" x="22" y="26" width="160" height="208" rx="6"/>${lbl(102, 226, "PLACA-MÃE")}`;
  else s += placeArt("mobo", m, 22, 26, 160, 208, P("mobo"));

  /* trilhas animadas */
  if (m) {
    if (T("cpu") && T("ram")) s += `<path class="trace" d="M100 72 H130"/>`;
    if (T("cpu") && T("gpu")) s += `<path class="trace" d="M88 100 V120"/>`;
    if (T("gpu") && T("storage")) s += `<path class="trace" d="M70 166 V176"/>`;
    if (T("psu")) s += `<path class="trace" d="M150 234 V244"/>`;
  }

  /* RAM (4 encaixes; módulos conforme o tier) */
  const ramN = { 0: 0, 1: 1, 2: 2, 3: 4 }[T("ram")];
  for (let i = 0; i < 4; i++) {
    const x = 129 + i * 12;
    if (i < ramN) s += placeArt("ram", T("ram"), x, 36, 10.5, 58, P("ram"));
    else if (!m) s += `<rect class="empty" x="${x}" y="36" width="10" height="58" rx="1.5"/>`;
  }
  if (!ramN && !m) s += lbl(158, 31, "RAM");

  /* cooler (atrás) e CPU (por cima, no centro) */
  const co = T("cooler");
  if (!co) s += `<circle class="empty" cx="88" cy="72" r="38"/>${lbl(88, 36, "COOLER")}`;
  else s += placeArt("cooler", co, 42, 22, 92, 92, P("cooler"));
  const cp = T("cpu");
  if (!cp) s += `<rect class="empty" x="64" y="48" width="48" height="48" rx="4"/>${lbl(88, 76, "CPU")}`;
  else s += placeArt("cpu", cp, co ? 68 : 62, co ? 52 : 46, co ? 40 : 52, co ? 40 : 52, P("cpu"));

  /* placa de vídeo */
  const g = T("gpu");
  if (!g) s += `<rect class="empty" x="30" y="120" width="150" height="44" rx="3"/>${lbl(105, 146, "PLACA DE VÍDEO")}`;
  else s += placeArt("gpu", g, 28, 120, 152, 46, P("gpu"));

  /* armazenamento */
  const st = T("storage");
  if (!st) s += `<rect class="empty" x="34" y="174" width="72" height="36" rx="3"/>${lbl(70, 196, "ARMAZENAMENTO")}`;
  else s += placeArt("storage", st, 34, 174, 72, 36, P("storage"));

  /* fonte */
  const ps = T("psu");
  if (!ps) s += `<rect class="empty" x="22" y="244" width="160" height="44" rx="5"/>${lbl(102, 270, "FONTE")}`;
  else s += placeArt("psu", ps, 22, 244, 160, 44, P("psu"));

  return s + `</svg>`;
}
