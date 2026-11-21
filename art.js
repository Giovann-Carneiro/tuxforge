/* =========================================================
   TUXFORGE — ilustrações das peças (SVG desenhado em código)
   Estilo: corpo escuro, ventoinhas com anel RGB, vidro ciano e cores vivas.
   Cada peça tem 3 versões: 1 = Bronze, 2 = Prata, 3 = Ouro.
   As mesmas ilustrações aparecem na loja, na lista e dentro do PC.
   Os gradientes (g1..g3, gPcb, gBody, gCyan, gGlass, gLiquid, rgbGrad) e o
   filtro "glow" ficam definidos no index.html.
   ========================================================= */
"use strict";

const TR = { 1: "#f0a066", 2: "#e3ebf5", 3: "#ffd54a" }; // cor do acabamento por tier
const RB = ["#ff3d6e", "#ff9a2e", "#ffe03a", "#3dff7a", "#35e0ff", "#4d7bff", "#b44dff", "#ff4dd2"]; // arco-íris
const BLUE = ["#3d8bff", "#5aa2ff", "#3d8bff", "#5aa2ff"];
const DUO = ["#35e0ff", "#35e0ff", "#ff4dd2", "#ff4dd2"];
const metal = (t) => `url(#g${t})`;

/* anel dividido em arcos coloridos */
function arcRing(cx, cy, r, w, cols) {
  const n = cols.length;
  return cols.map((c, i) => {
    const a0 = (i / n) * 2 * Math.PI, a1 = ((i + 1) / n) * 2 * Math.PI + 0.07;
    const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0), x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    return `<path d="M${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}" stroke="${c}" stroke-width="${w}" fill="none"/>`;
  }).join("");
}

/* ventoinha com anel RGB (a classe .fan faz girar) */
function rgbFan(cx, cy, r, cols) {
  const blade = `M0 0 C${r * 0.5} ${-r * 0.04} ${r * 0.78} ${-r * 0.42} ${r * 0.52} ${-r * 0.76} C${r * 0.34} ${-r * 0.46} ${r * 0.12} ${-r * 0.26} 0 0Z`;
  const blades = Array.from({ length: 9 }, (_, i) => `<path d="${blade}" transform="translate(${cx} ${cy}) rotate(${i * 40})" fill="#191529" stroke="#fff" stroke-opacity=".2" stroke-width=".4"/>`).join("");
  return `<g class="fan"><circle cx="${cx}" cy="${cy}" r="${r}" fill="#0b0814"/><g filter="url(#glow)">${arcRing(cx, cy, r * 0.9, r * 0.2, cols)}</g>${blades}<circle cx="${cx}" cy="${cy}" r="${r * 0.25}" fill="#1d1833" stroke="${cols[0]}" stroke-width=".8"/><circle cx="${cx}" cy="${cy}" r="${r * 0.1}" fill="${cols[Math.floor(cols.length / 2)]}"/></g>`;
}

/* brilho de vidro por cima de uma peça */
const gloss = (x, y, w, h, r = 3) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#gGlass)" opacity=".55"/>`;

/* tamanho nativo de cada desenho (largura, altura) */
const ART_SIZE = {
  case: [100, 120], mobo: [120, 156], cpu: [60, 60], ram: [12, 60],
  gpu: [160, 48], storage: [100, 50], psu: [160, 48], cooler: [100, 100],
};

const ART = {
  /* ---------- Gabinete (visto de frente) ---------- */
  case(t) {
    const tr = TR[t], glowC = t === 3 ? "#b44dff" : t === 2 ? "#35e0ff" : "#3d8bff";
    let s = `<ellipse cx="50" cy="117" rx="42" ry="3.2" fill="${glowC}" opacity=".5" filter="url(#glow)"/>`;
    s += `<rect x="8" y="6" width="84" height="107" rx="7" fill="url(#gBody)" ${t === 3 ? 'stroke="url(#rgbGrad)" stroke-width="2.4" class="rgbanim"' : `stroke="${tr}" stroke-width="1.6"`}/>`;
    s += `<rect x="13" y="10" width="74" height="6" rx="2.5" fill="#0b0814"/>`;
    for (let i = 0; i < 6; i++) s += `<rect x="${18 + i * 11}" y="12" width="7" height="1.8" rx=".9" fill="${tr}" opacity=".55"/>`;
    if (t === 1) {
      s += `<rect x="13" y="20" width="74" height="78" rx="4" fill="#0e0a19" stroke="${tr}" stroke-opacity=".5"/>`;
      for (let y = 25; y < 96; y += 5) for (let x = 18; x < 84; x += 5) s += `<circle cx="${x}" cy="${y}" r="1" fill="#7a7494" opacity=".55"/>`;
      s += rgbFan(50, 59, 23, BLUE);
    } else {
      s += `<rect x="13" y="20" width="74" height="78" rx="4" fill="#07050f"/>`;
      s += `<rect x="16" y="24" width="24" height="62" rx="2" fill="#1d1a38"/><rect x="19" y="28" width="9" height="9" rx="1.5" fill="#35e0ff" opacity=".7"/>`;
      s += `<path d="M40 42 C52 46 50 62 40 68" stroke="#ff4dd2" stroke-width="1.8" fill="none"/><path d="M40 48 C49 52 48 66 40 72" stroke="#35e0ff" stroke-width="1.8" fill="none"/><path d="M40 54 C46 57 46 68 40 76" stroke="#ffe03a" stroke-width="1.8" fill="none"/>`;
      if (t === 2) s += rgbFan(63, 42, 14.5, DUO) + rgbFan(63, 77, 14.5, DUO);
      else s += rgbFan(63, 34, 12, RB) + rgbFan(63, 59, 12, RB) + rgbFan(63, 84, 12, RB);
      s += `<rect x="13" y="20" width="74" height="78" rx="4" fill="url(#gCyan)"/>`;
      s += `<path d="M13 92 L80 20 H87 V36 L28 98 H17Z" fill="#fff" opacity=".1"/>`;
      s += `<rect x="13" y="20" width="74" height="78" rx="4" fill="none" stroke="#7df0ff" stroke-opacity=".8" stroke-width="1.1"/>`;
    }
    s += `<circle cx="50" cy="105" r="3.4" fill="#12091f" stroke="${glowC}" stroke-width="1.3" filter="url(#glow)"/><circle cx="50" cy="105" r="1" fill="${glowC}"/>`;
    s += `<rect x="16" y="113" width="14" height="4" rx="1.5" fill="#0b0814" stroke="${tr}" stroke-width=".6"/><rect x="70" y="113" width="14" height="4" rx="1.5" fill="#0b0814" stroke="${tr}" stroke-width=".6"/>`;
    return s;
  },

  /* ---------- Placa-mãe (vista de cima) ---------- */
  mobo(t) {
    const tr = TR[t];
    const pcb = t === 1 ? "#1d1836" : t === 2 ? "#15112c" : "#100c22";
    const ramC = t === 1 ? ["#272243", "#272243", "#272243", "#272243"] : t === 2 ? ["#35e0ff", "#35e0ff", "#35e0ff", "#35e0ff"] : [RB[0], RB[3], RB[4], RB[6]];
    let s = `<clipPath id="cpChip"><rect x="72" y="112" width="40" height="34" rx="4"/></clipPath>`;
    s += `<rect x="1" y="1" width="118" height="154" rx="5" fill="${pcb}" ${t === 3 ? 'stroke="url(#rgbGrad)" stroke-width="2" class="rgbanim"' : `stroke="${tr}" stroke-width="1.5"`}/>`;
    s += `<path d="M8 70 H28 V60 M8 90 H60 M110 60 V130 M100 64 V120 M30 150 H70 M6 110 H20 V132" stroke="#35e0ff" stroke-opacity=".32" fill="none"/>`;
    [[28, 60], [60, 90], [20, 132], [70, 150]].forEach(([x, y]) => { s += `<circle cx="${x}" cy="${y}" r="1.6" fill="#35e0ff" opacity=".8"/>`; });
    // soquete da CPU
    s += `<rect x="28" y="13" width="43" height="43" rx="3" fill="#07050f" stroke="${tr}" stroke-width="1.2"/><rect x="31" y="16" width="37" height="37" rx="2" fill="none" stroke="${tr}" stroke-opacity=".5" stroke-dasharray="2 2"/>`;
    for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) s += `<circle cx="${36 + i * 5.4}" cy="${21 + j * 5.4}" r=".85" fill="#ffd54a" fill-opacity=".6"/>`;
    // slots de RAM (acesos nas placas melhores)
    for (let i = 0; i < 4; i++) {
      const x = 80 + i * 8.5;
      s += `<rect x="${x}" y="9" width="5.4" height="50" rx="1" fill="#0b0814" stroke="${tr}" stroke-opacity=".7" stroke-width=".6"/><rect x="${x + 1.2}" y="11" width="3" height="46" rx="1" fill="${ramC[i]}" opacity="${t === 1 ? 1 : 0.8}"${t > 1 ? ' filter="url(#glow)"' : ""}/>`;
      s += `<rect x="${x}" y="7" width="5.4" height="3" rx="1" fill="${tr}" opacity=".85"/><rect x="${x}" y="58" width="5.4" height="3" rx="1" fill="${tr}" opacity=".85"/>`;
    }
    // PCIe, M.2 e SATA
    s += `<rect x="10" y="78" width="96" height="6" rx="1.5" fill="${t === 1 ? "#0b0814" : metal(2)}" stroke="${tr}" stroke-opacity=".9" stroke-width=".8"/><rect x="104" y="76.5" width="5" height="9" rx="1" fill="${tr}"/>`;
    s += `<rect x="10" y="100" width="60" height="5" rx="1.5" fill="${t === 1 ? "#0b0814" : metal(2)}" stroke="${tr}" stroke-opacity=".7" stroke-width=".6"/>`;
    s += `<rect x="12" y="122" width="40" height="7" rx="1.5" fill="#0b0814" stroke="${tr}" stroke-opacity=".7" stroke-width=".6"/>`;
    for (let i = 0; i < 4; i++) s += `<rect x="${12 + i * 9}" y="144" width="7" height="6" rx="1" fill="#0b0814" stroke="${tr}" stroke-opacity=".8" stroke-width=".6"/>`;
    s += `<rect x="110" y="64" width="8" height="42" rx="1.5" fill="#efe6ff" opacity=".9"/>`;
    for (let i = 0; i < 12; i++) s += `<rect x="112" y="${66 + i * 3.3}" width="4" height="1.6" fill="#1a0a33"/>`;
    for (let i = 0; i < 5; i++) s += `<circle cx="${12 + i * 5}" cy="30" r="2.2" fill="#3a3366" stroke="${tr}" stroke-opacity=".7" stroke-width=".5"/>`;
    // dissipadores
    if (t === 1) {
      for (let i = 0; i < 4; i++) s += `<rect x="6" y="${14 + i * 11}" width="14" height="7" rx="1.5" fill="#2a2548" stroke="${tr}" stroke-opacity=".7" stroke-width=".6"/>`;
      s += `<rect x="78" y="118" width="26" height="20" rx="2" fill="#2a2548" stroke="${tr}" stroke-width=".9"/>`;
      for (let i = 0; i < 5; i++) s += `<line x1="80" x2="102" y1="${122 + i * 3.4}" y2="${122 + i * 3.4}" stroke="#000" stroke-opacity=".4"/>`;
    } else {
      const vf = t === 2 ? metal(2) : "url(#gBody)";
      s += `<rect x="5" y="8" width="18" height="52" rx="3" fill="${vf}" stroke="${tr}" stroke-width=".8"/><rect x="28" y="3" width="46" height="9" rx="3" fill="${vf}" stroke="${tr}" stroke-width=".8"/>`;
      for (let y = 13; y < 58; y += 5) s += `<line x1="7" x2="21" y1="${y}" y2="${y}" stroke="#000" stroke-opacity=".4"/>`;
      s += `<rect x="5" y="30" width="18" height="4" fill="${t === 2 ? "#35e0ff" : "url(#rgbGrad)"}"${t === 3 ? ' class="rgbanim"' : ""} filter="url(#glow)"/>`;
      s += `<rect x="72" y="112" width="40" height="34" rx="4" fill="${t === 2 ? metal(2) : "url(#gBody)"}" stroke="${tr}" stroke-width=".9"/>`;
      for (let k = -3; k < 7; k++) s += `<path d="M${72 + k * 8} 146 L${72 + k * 8 + 34} 112" stroke="${t === 2 ? "#35e0ff" : "#ffd54a"}" stroke-width="3" opacity=".75" clip-path="url(#cpChip)"/>`;
      s += `<rect x="12" y="116" width="42" height="16" rx="3" fill="${vf}" stroke="${tr}" stroke-width=".8"/>`;
      for (let x = 17; x < 52; x += 5) s += `<line x1="${x}" x2="${x}" y1="118" y2="130" stroke="#000" stroke-opacity=".35"/>`;
    }
    s += `<text x="60" y="153" class="arttxt" style="font-size:5px;fill:${tr};opacity:.8;letter-spacing:.5px">${["", "ASROCK H610M", "ASUS TUF B760", "ROG MAXIMUS Z790"][t]}</text>`;
    return s;
  },

  /* ---------- CPU (vista de cima) ---------- */
  cpu(t) {
    const tr = TR[t];
    let s = `<rect x="1" y="1" width="58" height="58" rx="5" fill="#1f2c66" stroke="${tr}" stroke-width="1.4"/>`;
    for (let i = 0; i < 9; i++) {
      const p = 6 + i * 6;
      s += `<rect x="${p}" y="1.8" width="2.2" height="3" rx=".6" fill="#ffd54a"/><rect x="${p}" y="55.2" width="2.2" height="3" rx=".6" fill="#ffd54a"/>`;
      s += `<rect x="1.8" y="${p}" width="3" height="2.2" rx=".6" fill="#ffd54a"/><rect x="55.2" y="${p}" width="3" height="2.2" rx=".6" fill="#ffd54a"/>`;
    }
    s += `<rect x="9" y="9" width="42" height="42" rx="4.5" fill="${metal(t)}" stroke="#0009" stroke-width=".8"/><rect x="10.5" y="10.5" width="39" height="39" rx="3.5" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width=".8"/>`;
    s += `<rect x="13.5" y="13.5" width="33" height="33" rx="2.5" fill="#07050f" stroke="#35e0ff" stroke-width=".9" filter="url(#glow)"/>`;
    const core = (x, y, w, h, c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1" fill="${c}" stroke="#fff" stroke-opacity=".5" stroke-width=".5"/>`;
    if (t === 1) s += core(15.5, 17, 14, 26, "#35e0ff") + core(30.5, 17, 14, 26, "#35e0ff");
    if (t === 2) for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) s += core(15.5 + j * 15, 15.5 + i * 15, 14, 14, "#35e0ff");
    if (t === 3) for (let i = 0; i < 4; i++) for (let j = 0; j < 6; j++) s += core(15 + j * 5.2, 15 + i * 7.9, 4.4, 7, j < 2 ? "#ff4dd2" : "#35e0ff"); // núcleos P (rosa) e E (ciano)
    s += `<path d="M1 14 L14 1 H6 Q1 1 1 6Z" fill="#ffd54a"/>`;
    return s;
  },

  /* ---------- Memória RAM (um módulo, em pé) ---------- */
  ram(t) {
    if (t === 1) { // Kingston Fury Beast: preto com detalhe vermelho
      let s = `<rect x="0.5" y="0.5" width="11" height="59" rx="1.8" fill="#0c0a14" stroke="#ff3d3d" stroke-width=".9"/>`;
      s += `<rect x="1.4" y="2" width="9.2" height="52" rx="1.5" fill="url(#gBody)"/><rect x="1.4" y="2" width="9.2" height="3.4" rx="1.2" fill="#ff3d3d"/><path d="M1.4 22 L10.6 12" stroke="#ff3d3d" stroke-width="1.4"/><path d="M1.4 38 L10.6 28" stroke="#ff3d3d" stroke-width=".8" opacity=".7"/>`;
      s += `<rect x="1.4" y="2" width="2.6" height="52" rx="1.3" fill="#fff" opacity=".14"/>`;
      for (let i = 0; i < 6; i++) s += `<rect x="${1.2 + i * 1.7}" y="55.4" width="1" height="3.8" fill="#ffd54a"/>`;
      return s + `<rect x="5" y="57" width="2" height="3" fill="#0a0414"/>`;
    }
    if (t === 2) { // Corsair Vengeance RGB: barra de luz no topo
      let s = `<rect x="0.5" y="0.5" width="11" height="59" rx="1.8" fill="#0c0a14" stroke="#dbe4f0" stroke-width=".9"/>`;
      s += `<rect x="1.4" y="2" width="9.2" height="52" rx="1.5" fill="url(#gBody)"/>`;
      for (let y = 14; y < 52; y += 5) s += `<line x1="1.8" x2="10.2" y1="${y}" y2="${y}" stroke="#dbe4f0" stroke-opacity=".35" stroke-width=".6"/>`;
      s += `<rect x="2" y="3" width="8" height="6" rx="2" fill="url(#rgbGrad)" class="rgbanim" filter="url(#glow)"/>`;
      s += `<rect x="1.4" y="2" width="2.6" height="52" rx="1.3" fill="#fff" opacity=".14"/>`;
      for (let i = 0; i < 6; i++) s += `<rect x="${1.2 + i * 1.7}" y="55.4" width="1" height="3.8" fill="#ffd54a"/>`;
      return s + `<rect x="5" y="57" width="2" height="3" fill="#0a0414"/>`;
    }
    // RDIMM de servidor: placa verde cheia de chips
    let s = `<rect x="0.5" y="0.5" width="11" height="59" rx="1.8" fill="#1f8a4c" stroke="#0b3d22" stroke-width=".9"/>`;
    for (let i = 0; i < 7; i++) s += `<rect x="2" y="${2.6 + i * 6.6}" width="8" height="5.4" rx=".8" fill="#14121c" stroke="#555a66" stroke-width=".3"/><rect x="2.8" y="${3.2 + i * 6.6}" width="6.4" height="1.2" rx=".6" fill="#fff" opacity=".2"/>`;
    s += `<rect x="2" y="49" width="8" height="5" rx=".8" fill="#f4f7ff"/><path d="M3 51 H9" stroke="#2a58c8" stroke-width=".9"/>`;
    for (let i = 0; i < 6; i++) s += `<rect x="${1.2 + i * 1.7}" y="55.4" width="1" height="3.8" fill="#ffd54a"/>`;
    return s + `<rect x="5" y="57" width="2" height="3" fill="#0a0414"/>`;
  },

  /* ---------- Placa de vídeo ---------- */
  gpu(t) {
    const tr = TR[t];
    const cols = t === 1 ? BLUE : t === 2 ? DUO : RB;
    let s = `<rect x="6" y="6" width="152" height="35" rx="5" fill="url(#gBody)" stroke="${tr}" stroke-width="1.5"/>`;
    s += `<rect x="0" y="3" width="8" height="42" rx="2" fill="${metal(2)}" stroke="#0007" stroke-width=".5"/>`;
    ["#ff9a2e", "#35e0ff", "#3dff7a"].forEach((c, i) => { s += `<rect x="1.8" y="${8 + i * 10}" width="4.4" height="6" rx="1" fill="${c}" opacity=".9"/>`; });
    s += `<rect x="11" y="10" width="142" height="27" rx="4" fill="#0b0814" stroke="${tr}" stroke-opacity=".7"/>`;
    const r = t === 1 ? 11.5 : t === 2 ? 11 : 10;
    for (let i = 0; i < t; i++) s += rgbFan(11 + (142 / t) * (i + 0.5), 23.5, r, cols);
    s += `<rect x="13" y="10.6" width="138" height="2.4" rx="1.2" fill="${t === 1 ? "#3d8bff" : "url(#rgbGrad)"}" filter="url(#glow)"${t === 3 ? ' class="rgbanim"' : ""}/>`;
    for (let i = 0; i < 26; i++) s += `<rect x="${15 + i * 3.1}" y="41" width="1.9" height="6" fill="#ffd54a"/>`;
    for (let k = 0; k < (t === 3 ? 2 : 1); k++) {
      s += `<rect x="${118 - k * 34}" y="2" width="30" height="6" rx="1.2" fill="#0a0414" stroke="${tr}" stroke-width=".8"/>`;
      for (let i = 0; i < 8; i++) s += `<circle cx="${122 + i * 3.4 - k * 34}" cy="5" r=".9" fill="${tr}"/>`;
    }
    return s + gloss(11, 10, 142, 10, 4);
  },

  /* ---------- Armazenamento ---------- */
  storage(t) {
    if (t === 1) { // Seagate BarraCuda: HD com etiqueta azul
      let s = `<rect x="2" y="2" width="96" height="46" rx="5" fill="${metal(2)}" stroke="#0008" stroke-width=".8"/>`;
      s += `<rect x="4" y="4" width="92" height="42" rx="4" fill="none" stroke="#fff" stroke-opacity=".5"/>`;
      s += `<circle cx="32" cy="25" r="20" fill="#14121c" stroke="#0009"/><circle cx="32" cy="25" r="17" fill="${metal(2)}" opacity=".85"/><circle cx="32" cy="25" r="11" fill="none" stroke="#fff" stroke-opacity=".5"/><circle cx="32" cy="25" r="5" fill="#2a58c8"/><circle cx="32" cy="25" r="1.5" fill="#fff"/>`;
      s += `<path d="M20 14 A16 16 0 0 1 44 12" stroke="#fff" stroke-opacity=".7" stroke-width="2" fill="none" stroke-linecap="round"/>`;
      s += `<path d="M80 9 L42 22" stroke="${metal(2)}" stroke-width="3.2" stroke-linecap="round"/><circle cx="81" cy="9" r="3.6" fill="#ffd54a" stroke="#0007"/>`;
      s += `<rect x="58" y="28" width="35" height="15" rx="2" fill="#1e63ff"/><path d="M61 33 H88" stroke="#fff" stroke-width="1.6"/><text x="75.5" y="40" class="arttxt" style="font-size:4.4px;fill:#fff;letter-spacing:.3px">BARRACUDA</text>`;
      [[7, 7], [93, 7], [7, 43], [93, 43]].forEach(([x, y]) => { s += `<circle cx="${x}" cy="${y}" r="1.7" fill="#0006"/>`; });
      return s;
    }
    if (t === 2) { // Samsung 980 PRO: NVMe com etiqueta preta
      let s = `<rect x="5" y="12" width="92" height="26" rx="3.5" fill="#3b1a78" stroke="#dbe4f0" stroke-width="1.3"/>`;
      for (let i = 0; i < 12; i++) s += `<rect x="${7 + i * 2.2}" y="33" width="1.2" height="5" fill="#ffd54a"/>`;
      s += `<circle cx="92" cy="25" r="2.3" fill="#0a0414" stroke="#dbe4f0" stroke-width=".7"/>`;
      s += `<rect x="13" y="15" width="74" height="17" rx="2.5" fill="#0c0a14" stroke="#ff3d3d" stroke-width=".8"/><path d="M13 20 H87" stroke="#ff3d3d" stroke-width="1.6"/>`;
      s += `<text x="50" y="28.6" class="arttxt" style="font-size:7px;fill:#fff;letter-spacing:.4px">980 PRO</text>`;
      s += `<rect x="16" y="35.4" width="68" height="1.6" rx=".8" fill="#35e0ff" filter="url(#glow)"/>`;
      return s;
    }
    // Sabrent Rocket 4 Plus: dissipador dourado com luz
    let s = `<rect x="5" y="13" width="92" height="24" rx="3.5" fill="#3b1a78" stroke="#ffd54a" stroke-width="1.3"/>`;
    for (let i = 0; i < 12; i++) s += `<rect x="${7 + i * 2.2}" y="32" width="1.2" height="5" fill="#ffd54a"/>`;
    s += `<rect x="16" y="7" width="80" height="36" rx="4" fill="${metal(3)}" stroke="#0008" stroke-width=".7"/>`;
    for (let x = 22; x < 92; x += 5) s += `<line x1="${x}" x2="${x}" y1="12" y2="40" stroke="#000" stroke-opacity=".3"/>`;
    s += `<rect x="16" y="7" width="80" height="5" rx="2.5" fill="url(#rgbGrad)" class="rgbanim" filter="url(#glow)"/>`;
    s += `<rect x="32" y="19" width="48" height="14" rx="2" fill="#0c0a14"/><text x="56" y="29" class="arttxt" style="font-size:6px;fill:#ffd54a;letter-spacing:.3px">ROCKET 8 TB</text>`;
    return s;
  },

  /* ---------- Fonte ---------- */
  psu(t) {
    const tr = TR[t];
    const fanCols = t === 1 ? ["#9aa4b8", "#c7cfdd", "#9aa4b8", "#c7cfdd"] : t === 2 ? ["#ffd54a", "#ffb02e", "#ffd54a", "#ffb02e"] : RB;
    let s = `<rect x="1" y="1" width="158" height="46" rx="5" fill="url(#gBody)" ${t === 3 ? 'stroke="url(#rgbGrad)" stroke-width="2" class="rgbanim"' : `stroke="${tr}" stroke-width="1.5"`}/>`;
    s += `<circle cx="31" cy="24" r="19.5" fill="#0a0414" stroke="${tr}" stroke-opacity=".7"/>` + rgbFan(31, 24, 17, fanCols);
    for (let i = 0; i < 9; i++) s += `<rect x="${60 + i * 6}" y="7" width="3" height="34" rx="1.5" fill="#0a0414" stroke="${tr}" stroke-opacity=".5" stroke-width=".5"/>`;
    const label = t === 1 ? "#d6322e" : t === 2 ? "#f4f7ff" : "#0c0a14";
    s += `<rect x="115" y="7" width="38" height="34" rx="3" fill="${label}" stroke="${tr}" stroke-width=".8"/>`;
    const ink = t === 2 ? "#14121c" : "#fff";
    s += `<text x="134" y="19" class="arttxt" style="font-size:6.2px;fill:${ink};letter-spacing:.2px">${["", "CV550", "RM750e", "AX1600i"][t]}</text>`;
    s += `<text x="134" y="26" class="arttxt" style="font-size:4px;fill:${ink};opacity:.85;letter-spacing:.3px">${["", "80+ BRONZE", "80+ GOLD", "80+ TITANIUM"][t]}</text>`;
    if (t === 3) { s += `<rect x="120" y="29" width="28" height="8" rx="1.5" fill="#031a0c" stroke="#3dff7a" stroke-width=".6"/><text x="134" y="35.4" class="arttxt" style="font-size:5.5px;fill:#3dff7a">1600 W</text>`; }
    else for (let i = 0; i < 4; i++) s += `<circle cx="${122 + i * 7}" cy="34" r="1.8" fill="${i < 3 ? "#3dff7a" : "#2a2a36"}"/>`;
    return s;
  },

  /* ---------- Cooler ---------- */
  cooler(t) {
    if (t === 1) { // Hyper 212: torre com heatpipes de cobre
      let s = `<rect x="12" y="12" width="76" height="76" rx="7" fill="url(#gBody)" stroke="#f0a066" stroke-width="1.5"/>`;
      for (let i = 0; i < 10; i++) s += `<line x1="${17 + i * 7.6}" x2="${17 + i * 7.6}" y1="14" y2="86" stroke="#f0a066" stroke-opacity=".35"/>`;
      [[34, 34], [66, 34], [34, 66], [66, 66]].forEach(([x, y]) => { s += `<circle cx="${x}" cy="${y}" r="5" fill="${metal(1)}" stroke="#0007" stroke-width=".6"/>`; });
      s += rgbFan(50, 50, 28, BLUE);
      [[17, 17], [83, 17], [17, 83], [83, 83]].forEach(([x, y]) => { s += `<circle cx="${x}" cy="${y}" r="2.3" fill="${metal(2)}" stroke="#0007" stroke-width=".5"/>`; });
      return s;
    }
    if (t === 2) { // Corsair H150i Elite 360: radiador com 3 ventoinhas e bloco de anéis
      let s = `<rect x="4" y="2" width="92" height="22" rx="4" fill="url(#gBody)" stroke="#dbe4f0" stroke-width="1.4"/>`;
      s += rgbFan(20, 13, 8.5, RB) + rgbFan(50, 13, 8.5, RB) + rgbFan(80, 13, 8.5, RB);
      s += `<path d="M26 24 C26 40 40 44 42 56 M74 24 C74 40 60 44 58 56" stroke="#181426" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M26 24 C26 40 40 44 42 56 M74 24 C74 40 60 44 58 56" stroke="#dbe4f0" stroke-opacity=".5" stroke-width="1" fill="none" stroke-linecap="round" transform="translate(-1.8 0)"/>`;
      s += `<circle cx="50" cy="72" r="26" fill="url(#gBody)" stroke="#dbe4f0" stroke-width="1.6"/><g filter="url(#glow)">${arcRing(50, 72, 21, 3, RB)}</g><g filter="url(#glow)">${arcRing(50, 72, 15, 2, [...RB].reverse())}</g>`;
      s += `<circle cx="50" cy="72" r="9" fill="#0c0a14" stroke="#dbe4f0" stroke-opacity=".6"/><circle cx="50" cy="72" r="3" fill="#35e0ff"/>`;
      return s + gloss(26, 48, 48, 14, 7);
    }
    // loop custom EK: líquido neon, bloco RGB
    let s = `<rect x="75" y="4" width="18" height="50" rx="8" fill="rgba(180,77,255,.14)" stroke="#e6ccff" stroke-width="1.3"/><rect x="77.5" y="22" width="13" height="30" rx="6" fill="url(#gLiquid)" filter="url(#glow)"/><rect x="78.5" y="8" width="2.4" height="40" rx="1.2" fill="#fff" opacity=".5"/>`;
    s += `<rect x="78" y="1" width="12" height="4" rx="1.5" fill="${metal(3)}"/><rect x="78" y="53" width="12" height="4" rx="1.5" fill="${metal(3)}"/>`;
    const tube = "M84 57 C84 74 66 70 64 80 M16 44 C16 22 38 30 40 46";
    s += `<path d="${tube}" stroke="url(#gLiquid)" stroke-width="7" fill="none" stroke-linecap="round" filter="url(#glow)"/><path d="${tube}" stroke="#fff" stroke-opacity=".6" stroke-width="1.4" fill="none" stroke-linecap="round" transform="translate(-1.4 -1)"/>`;
    s += `<rect x="12" y="41" width="9" height="4" rx="1.5" fill="${metal(3)}"/><rect x="36" y="44" width="9" height="4" rx="1.5" fill="${metal(3)}"/>`;
    s += `<rect x="21" y="46" width="47" height="46" rx="8" fill="url(#gBody)" stroke="url(#rgbGrad)" stroke-width="2.6" class="rgbanim" filter="url(#glow)"/>`;
    s += `<circle cx="44.5" cy="69" r="17" fill="#0a0414" stroke="#ffd54a" stroke-width="1.2"/>` + rgbFan(44.5, 69, 12, RB);
    return s + gloss(21, 46, 47, 16, 8);
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
  let s = `<svg class="pc-svg" viewBox="0 0 260 304" role="img" aria-label="Seu computador montado">`;

  /* gabinete: corpo escuro com lateral de vidro ciano */
  const c = T("case");
  if (!c) {
    s += `<rect class="empty" x="8" y="6" width="244" height="288" rx="14"/>${lbl(130, 17, "GABINETE")}`;
  } else {
    const tr = TR[c], glowC = c === 3 ? "#b44dff" : c === 2 ? "#35e0ff" : "#3d8bff";
    s += `<ellipse cx="130" cy="299" rx="104" ry="5" fill="${glowC}" opacity=".5" filter="url(#glow)"/>`;
    s += `<g class="${P("case")}">`;
    s += `<rect x="8" y="6" width="244" height="288" rx="14" fill="#0b0814" ${c === 3 ? 'stroke="url(#rgbGrad)" stroke-width="2.8" class="rgbanim"' : `stroke="${tr}" stroke-width="2"`}/>`;
    s += `<rect x="8" y="6" width="244" height="288" rx="14" fill="url(#gBody)" opacity=".5"/>`;
    if (c >= 2) {
      s += `<path d="M190 6 H238 a14 14 0 0 1 14 14 V280 a14 14 0 0 1 -14 14 H190 Z" fill="url(#gCyan)"/>`;
      s += `<path d="M196 290 L250 120 V160 L214 290Z" fill="#fff" opacity=".07"/>`;
    }
    for (let i = 0; i < 6; i++) s += `<line x1="198" x2="240" y1="${40 + i * 10}" y2="${40 + i * 10}" stroke="${tr}" stroke-opacity=".4"/>`;
    // ventoinhas da lateral
    const cols = c === 3 ? RB : c === 2 ? DUO : BLUE;
    s += rgbFan(221, 128, 17, cols) + rgbFan(221, 176, 17, cols);
    if (c === 3) s += rgbFan(221, 224, 17, cols);
    s += `</g>`;
    // cabos coloridos atrás das peças
    s += `<path d="M150 236 C190 236 186 200 182 190" stroke="#ff4dd2" stroke-width="2.4" fill="none" opacity=".85"/><path d="M146 240 C184 244 180 206 176 192" stroke="#35e0ff" stroke-width="2.4" fill="none" opacity=".85"/><path d="M142 244 C178 252 174 212 170 194" stroke="#ffe03a" stroke-width="2.4" fill="none" opacity=".85"/>`;
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

/* =========================================================
   Logo: gatinho de olhos brilhantes (circuito nos bigodes)
   ========================================================= */
function logoSvg(cls = "logo-svg") {
  const spark = (x, y, k, f) => `<path transform="translate(${x} ${y}) scale(${k})" fill="${f}" d="M0 -8 C0 -2 2 0 8 0 C2 0 0 2 0 8 C0 2 -2 0 -8 0 C-2 0 0 -2 0 -8Z"/>`;
  const eye = (cx, cy) => `<g class="lg-eye"><circle cx="${cx}" cy="${cy}" r="15.5" fill="url(#lgEye)" filter="url(#lgGlow)"/><circle cx="${cx}" cy="${cy}" r="15.5" fill="none" stroke="#ffd0f4" stroke-opacity=".7" stroke-width="1"/><path transform="translate(${cx} ${cy + 1.5}) scale(.95)" fill="#fff3c9" d="M0 -3.4 C-3.2 -8 -10 -3 0 7 C10 -3 3.2 -8 0 -3.4Z"/><circle cx="${cx - 5.5}" cy="${cy - 6.5}" r="3.3" fill="#fff" opacity=".92"/><circle cx="${cx + 5.5}" cy="${cy + 5.5}" r="1.6" fill="#fff" opacity=".8"/></g>`;
  return `<svg class="${cls}" viewBox="0 0 120 112" role="img" aria-label="Logo TuxForge: gatinho de olhos brilhantes">
  <defs>
    <linearGradient id="lgFur" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#46197f"/><stop offset="1" stop-color="#150729"/></linearGradient>
    <radialGradient id="lgEye" cx=".5" cy=".45" r=".62"><stop offset="0" stop-color="#fff0fb"/><stop offset=".38" stop-color="#ff7ae6"/><stop offset="1" stop-color="#d11fb0"/></radialGradient>
    <filter id="lgGlow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <path d="M13 54 L9 13 Q9 6 16 10 L45 29Z" fill="url(#lgFur)" stroke="#c58bff" stroke-width="3" stroke-linejoin="round"/>
  <path d="M107 54 L111 13 Q111 6 104 10 L75 29Z" fill="url(#lgFur)" stroke="#c58bff" stroke-width="3" stroke-linejoin="round"/>
  <path d="M19 43 L17 21 L37 33Z" fill="#ff7ad9" opacity=".8"/><path d="M101 43 L103 21 L83 33Z" fill="#ff7ad9" opacity=".8"/>
  <path d="M60 23 C94 23 113 45 113 69 C113 93 91 106 60 106 C29 106 7 93 7 69 C7 45 26 23 60 23Z" fill="url(#lgFur)" stroke="#c58bff" stroke-width="3"/>
  <path d="M30 40 Q60 30 90 40" stroke="#fff" stroke-opacity=".14" stroke-width="3" fill="none" stroke-linecap="round"/>
  <rect x="53.5" y="30" width="13" height="10" rx="2.2" fill="#1a0a33" stroke="#ff7ad9" stroke-width="1.6"/><circle cx="60" cy="35" r="1.8" fill="#ff7ad9"/>
  <path d="M51 33 H47 M51 37 H46 M69 33 H73 M69 37 H74" stroke="#ff7ad9" stroke-width="1.2" stroke-linecap="round"/>
  <ellipse cx="22" cy="82" rx="7" ry="4" fill="#ff5bd6" opacity=".38"/><ellipse cx="98" cy="82" rx="7" ry="4" fill="#ff5bd6" opacity=".38"/>
  ${eye(40, 66)}${eye(80, 66)}
  <path d="M55.5 80.5 H64.5 L60 86Z" fill="#ff7ad9" stroke="#ff7ad9" stroke-width="1.6" stroke-linejoin="round"/>
  <path d="M60 86 Q56 93 50.5 89.5 M60 86 Q64 93 69.5 89.5" stroke="#c58bff" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M28 85 H12 M28 91 L16 97 M92 85 H108 M92 91 L104 97" stroke="#c58bff" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <circle cx="10" cy="85" r="2.3" fill="#ff7ad9"/><circle cx="14" cy="98" r="2.3" fill="#ff7ad9"/><circle cx="110" cy="85" r="2.3" fill="#ff7ad9"/><circle cx="106" cy="98" r="2.3" fill="#ff7ad9"/>
  ${spark(104, 12, 1.15, "#ff8ae6")}${spark(14, 17, 0.75, "#c58bff")}
</svg>`;
}
