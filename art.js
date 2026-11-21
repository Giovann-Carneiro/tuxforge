/* =========================================================
   TUXFORGE — ilustrações das peças (SVG desenhado em código)
   Cada peça tem 3 versões: 1 = Bronze, 2 = Prata, 3 = Ouro.
   As mesmas ilustrações aparecem na loja, na lista e dentro do PC.
   Os gradientes (g1..g3, gPcb, gDark, gGlass, gLiquid, rgbGrad) e o
   filtro "glow" ficam definidos no index.html.
   ========================================================= */
"use strict";

const ART_C = { 1: "#f0a066", 2: "#dbe4f0", 3: "#ffd54a" }; // cor do metal por tier
const ART_ACC = { 1: "#ff9a5c", 2: "#c58bff", 3: "#ff5bd6" }; // cor dos LEDs por tier
const metal = (t) => `url(#g${t})`;

/* patinha de gato (marca do jogo) */
function paw(cx, cy, s, fill, op = 1) {
  return `<g fill="${fill}" opacity="${op}" transform="translate(${cx} ${cy}) scale(${s})"><ellipse cx="0" cy="3" rx="5" ry="4.2"/><ellipse cx="-5.6" cy="-2.2" rx="2.1" ry="2.8"/><ellipse cx="-2" cy="-5.2" rx="2.1" ry="2.9"/><ellipse cx="2" cy="-5.2" rx="2.1" ry="2.9"/><ellipse cx="5.6" cy="-2.2" rx="2.1" ry="2.8"/></g>`;
}

/* brilho de vidro por cima de uma peça */
const gloss = (x, y, w, h, r = 3) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#gGlass)" opacity=".6"/>`;

/* ventoinha: 7 pás, aro com LED (usa a classe .fan, que gira) */
function artFan(cx, cy, r, c, rgb = false, led = null) {
  const blade = `M0 0 C${r * 0.55} ${-r * 0.05} ${r * 0.8} ${-r * 0.45} ${r * 0.55} ${-r * 0.8} C${r * 0.35} ${-r * 0.5} ${r * 0.12} ${-r * 0.28} 0 0Z`;
  const blades = Array.from({ length: 7 }, (_, i) => `<path d="${blade}" transform="translate(${cx} ${cy}) rotate(${(i * 360) / 7})" fill="${c}" fill-opacity=".5" stroke="${c}" stroke-width=".5" stroke-opacity=".85"/>`).join("");
  const ring = rgb
    ? `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#0a0414" stroke="url(#rgbGrad)" stroke-width="2.4" filter="url(#glow)"/>`
    : `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#0a0414" stroke="${led || c}" stroke-width="1.5"${led ? ' filter="url(#glow)"' : ""}/>`;
  return `<g class="fan">${ring}<circle cx="${cx}" cy="${cy}" r="${r * 0.88}" fill="none" stroke="${c}" stroke-opacity=".3" stroke-width=".6"/>${blades}<circle cx="${cx}" cy="${cy}" r="${r * 0.2}" fill="${metal(2)}"/><circle cx="${cx}" cy="${cy}" r="${r * 0.07}" fill="#0a0414"/></g>`;
}

/* tamanho nativo de cada desenho (largura, altura) */
const ART_SIZE = {
  case: [100, 120], mobo: [120, 156], cpu: [60, 60], ram: [12, 60],
  gpu: [160, 48], storage: [100, 50], psu: [160, 48], cooler: [100, 100],
};

const ART = {
  /* ---------- Gabinete (fechado, visto de frente) ---------- */
  case(t) {
    const c = ART_C[t], a = ART_ACC[t];
    const edge = t === 3 ? `stroke="url(#rgbGrad)" stroke-width="2.6" class="rgbanim"` : `stroke="${c}" stroke-width="1.8"`;
    let s = `<ellipse cx="50" cy="118" rx="42" ry="3" fill="${a}" opacity=".25" filter="url(#glow)"/>`;
    // orelhinhas de gato
    s += `<path d="M12 18 L15 2 Q16 0 18 1 L37 11Z" fill="url(#gDark)" stroke="${c}" stroke-width="1.6" stroke-linejoin="round"/>`;
    s += `<path d="M88 18 L85 2 Q84 0 82 1 L63 11Z" fill="url(#gDark)" stroke="${c}" stroke-width="1.6" stroke-linejoin="round"/>`;
    s += `<path d="M17 14 L18.5 6 L28 11Z" fill="#ff7ad9" opacity=".85"/><path d="M83 14 L81.5 6 L72 11Z" fill="#ff7ad9" opacity=".85"/>`;
    s += `<rect x="8" y="9" width="84" height="104" rx="8" fill="url(#gDark)" ${edge}/>`;
    for (let i = 0; i < 5; i++) s += `<rect x="${32 + i * 8}" y="12" width="5" height="1.8" rx=".9" fill="${c}" opacity=".55"/>`;
    if (t === 1) {
      for (let y = 21; y < 70; y += 5) for (let x = 17; x < 84; x += 5) s += `<circle cx="${x}" cy="${y}" r="1" fill="${c}" opacity=".38"/>`;
      s += artFan(50, 88, 15, c, false, a);
    } else {
      const h = t === 2 ? 72 : 82;
      s += `<rect x="14" y="18" width="72" height="${h}" rx="5" fill="#0a0414" stroke="${c}" stroke-opacity=".8"/>`;
      s += `<ellipse cx="50" cy="${18 + h / 2}" rx="30" ry="${h / 2 - 6}" fill="${a}" opacity=".13" filter="url(#glow)"/>`;
      if (t === 2) s += artFan(50, 38, 15, c, false, a) + artFan(50, 74, 15, c, false, a);
      else s += artFan(50, 33, 11.5, c, true) + artFan(50, 58, 11.5, c, true) + artFan(50, 83, 11.5, c, true);
      s += `<path d="M14 ${18 + h} L86 22 V36 L14 ${18 + h - 12}Z" fill="#fff" opacity=".07"/>`;
      s += gloss(14, 18, 72, h * 0.4, 5);
    }
    s += `<circle cx="50" cy="105" r="3.4" fill="#12071f" stroke="${a}" stroke-width="1.3" filter="url(#glow)"/><circle cx="50" cy="105" r="1" fill="${a}"/>`;
    s += `<rect x="16" y="113" width="14" height="4" rx="1.5" fill="${c}"/><rect x="70" y="113" width="14" height="4" rx="1.5" fill="${c}"/>`;
    return s;
  },

  /* ---------- Placa-mãe (vista de cima, ainda sem peças) ---------- */
  mobo(t) {
    const c = ART_C[t], a = ART_ACC[t];
    let s = `<rect x="1" y="1" width="118" height="154" rx="5" fill="url(#gPcb)" stroke="${c}" stroke-width="1.6"/>`;
    s += `<path d="M8 70 H28 V60 M8 90 H60 M110 60 V130 M100 64 V120 M30 150 H70 M6 110 H20 V132" stroke="${a}" stroke-opacity=".4" fill="none"/>`;
    [[28, 60], [60, 90], [20, 132], [70, 150]].forEach(([x, y]) => { s += `<circle cx="${x}" cy="${y}" r="1.5" fill="${a}" opacity=".8"/>`; });
    // soquete da CPU
    s += `<rect x="28" y="13" width="43" height="43" rx="3" fill="#0a0414" stroke="${c}" stroke-width="1.2"/><rect x="31" y="16" width="37" height="37" rx="2" fill="none" stroke="${c}" stroke-opacity=".4" stroke-dasharray="2 2"/>`;
    for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) s += `<circle cx="${36 + i * 5.4}" cy="${21 + j * 5.4}" r=".8" fill="${c}" fill-opacity=".55"/>`;
    // slots de RAM com travas
    for (let i = 0; i < 4; i++) {
      const x = 80 + i * 8.5;
      s += `<rect x="${x}" y="9" width="5.4" height="50" rx="1" fill="url(#gDark)" stroke="${c}" stroke-opacity=".75" stroke-width=".6"/><rect x="${x}" y="7" width="5.4" height="3" rx="1" fill="${a}" opacity=".8"/><rect x="${x}" y="58" width="5.4" height="3" rx="1" fill="${a}" opacity=".8"/>`;
    }
    // PCIe (longo e curto) com reforço
    s += `<rect x="10" y="78" width="96" height="6" rx="1.5" fill="url(#gDark)" stroke="${c}" stroke-opacity=".85" stroke-width=".8"/><rect x="104" y="76.5" width="5" height="9" rx="1" fill="${a}" opacity=".85"/>`;
    s += `<rect x="10" y="100" width="60" height="5" rx="1.5" fill="url(#gDark)" stroke="${c}" stroke-opacity=".65" stroke-width=".6"/>`;
    // M.2 e SATA
    s += `<rect x="12" y="122" width="40" height="7" rx="1.5" fill="url(#gDark)" stroke="${c}" stroke-opacity=".65" stroke-width=".6"/>`;
    for (let i = 0; i < 4; i++) s += `<rect x="${12 + i * 9}" y="144" width="7" height="6" rx="1" fill="#0a0414" stroke="${c}" stroke-opacity=".7" stroke-width=".6"/>`;
    // conector de energia 24 pinos
    s += `<rect x="110" y="64" width="8" height="42" rx="1.5" fill="#efe6ff" opacity=".85"/>`;
    for (let i = 0; i < 12; i++) s += `<rect x="112" y="${66 + i * 3.3}" width="4" height="1.6" fill="#1a0a33"/>`;
    // capacitores
    for (let i = 0; i < 5; i++) s += `<circle cx="${12 + i * 5}" cy="30" r="2.2" fill="#2a1850" stroke="${c}" stroke-opacity=".7" stroke-width=".5"/>`;
    if (t === 1) {
      s += `<rect x="78" y="118" width="26" height="20" rx="2" fill="url(#gDark)" stroke="${c}" stroke-width=".9"/>`;
      for (let i = 0; i < 4; i++) s += `<rect x="6" y="${14 + i * 11}" width="14" height="7" rx="1.5" fill="#1a0f2e" stroke="${c}" stroke-opacity=".6" stroke-width=".6"/>`;
    } else {
      s += `<rect x="5" y="8" width="18" height="52" rx="3" fill="${metal(t)}"/><rect x="28" y="3" width="46" height="9" rx="3" fill="${metal(t)}"/>`;
      for (let y = 13; y < 58; y += 5) s += `<line x1="7" x2="21" y1="${y}" y2="${y}" stroke="#000" stroke-opacity=".35"/>`;
      for (let x = 32; x < 72; x += 5) s += `<line x1="${x}" x2="${x}" y1="5" y2="11" stroke="#000" stroke-opacity=".35"/>`;
      s += `<rect x="72" y="112" width="40" height="34" rx="4" fill="${metal(t)}"/><path d="M78 122 H106 M78 130 H106" stroke="#000" stroke-opacity=".3"/>${paw(92, 137, 0.75, "#1a0a33", 0.6)}`;
      s += `<rect x="12" y="116" width="42" height="16" rx="3" fill="${metal(t)}" opacity=".9"/>`;
    }
    if (t === 3) s += `<rect x="2.5" y="2.5" width="115" height="151" rx="4.5" fill="none" stroke="url(#rgbGrad)" stroke-width="1.6" class="rgbanim" filter="url(#glow)"/>`;
    s += `<text x="60" y="152" class="arttxt" style="font-size:4.5px;fill:${c};opacity:.55;letter-spacing:.6px">TUXFORGE</text>`;
    return s;
  },

  /* ---------- CPU (vista de cima) ---------- */
  cpu(t) {
    const c = ART_C[t], a = ART_ACC[t];
    let s = `<rect x="1" y="1" width="58" height="58" rx="5" fill="url(#gPcb)" stroke="${c}" stroke-width="1.4"/>`;
    for (let i = 0; i < 9; i++) {
      const p = 6 + i * 6;
      s += `<rect x="${p}" y="1.8" width="2.2" height="3" rx=".6" fill="#ffd54a"/><rect x="${p}" y="55.2" width="2.2" height="3" rx=".6" fill="#ffd54a"/>`;
      s += `<rect x="1.8" y="${p}" width="3" height="2.2" rx=".6" fill="#ffd54a"/><rect x="55.2" y="${p}" width="3" height="2.2" rx=".6" fill="#ffd54a"/>`;
    }
    s += `<rect x="9" y="9" width="42" height="42" rx="4.5" fill="${metal(t)}" stroke="#0009" stroke-width=".8"/>`;
    s += `<rect x="10.5" y="10.5" width="39" height="39" rx="3.5" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width=".8"/>`;
    s += `<rect x="13.5" y="13.5" width="33" height="33" rx="2.5" fill="#0a0414" stroke="${a}" stroke-width=".8" filter="url(#glow)"/>`;
    const core = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1" fill="#3a1a6e" stroke="${a}" stroke-width=".7"/><rect x="${x + 0.8}" y="${y + 0.8}" width="${w - 1.6}" height="${Math.min(2.2, h / 3)}" rx=".6" fill="#fff" opacity=".18"/>`;
    if (t === 1) s += core(15.5, 17, 14, 26) + core(30.5, 17, 14, 26);
    if (t === 2) for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) s += core(15.5 + j * 15, 15.5 + i * 15, 14, 14);
    if (t === 3) for (let i = 0; i < 4; i++) for (let j = 0; j < 6; j++) s += core(15 + j * 5.2, 15 + i * 7.9, 4.4, 7);
    s += `<path d="M1 14 L14 1 H6 Q1 1 1 6Z" fill="#ffd54a"/>`;
    s += paw(44.5, 44, 0.42, "#1a0a33", 0.7);
    return s;
  },

  /* ---------- Memória RAM (um módulo, em pé) ---------- */
  ram(t) {
    const c = ART_C[t], a = ART_ACC[t];
    let s = `<rect x="0.5" y="0.5" width="11" height="59" rx="1.8" fill="url(#gPcb)" stroke="${c}" stroke-width=".9"/>`;
    for (let i = 0; i < 6; i++) s += `<rect x="${1.2 + i * 1.7}" y="55.4" width="1" height="3.8" fill="#ffd54a"/>`;
    s += `<rect x="5" y="57" width="2" height="3" fill="#0a0414"/>`;
    if (t === 1) {
      for (let i = 0; i < 4; i++) s += `<rect x="2" y="${5 + i * 12.5}" width="8" height="9.5" rx="1.2" fill="#0c0618" stroke="${c}" stroke-opacity=".6" stroke-width=".4"/><rect x="2.6" y="${5.6 + i * 12.5}" width="6.8" height="2" rx=".8" fill="#fff" opacity=".14"/>`;
    } else {
      s += `<rect x="1" y="2" width="10" height="50" rx="2" fill="${metal(t)}"/>`;
      for (let y = 9; y < 50; y += 5) s += `<line x1="1.5" x2="10.5" y1="${y}" y2="${y}" stroke="#000" stroke-opacity=".28" stroke-width=".6"/>`;
      s += `<rect x="1" y="2" width="3" height="50" rx="1.5" fill="#fff" opacity=".22"/>`;
      s += `<rect x="2" y="3" width="8" height="3.4" rx="1.7" fill="${t === 3 ? "url(#rgbGrad)" : a}"${t === 3 ? ' class="rgbanim"' : ""} filter="url(#glow)"/>`;
    }
    return s;
  },

  /* ---------- Placa de vídeo ---------- */
  gpu(t) {
    const c = ART_C[t], a = ART_ACC[t];
    let s = `<rect x="6" y="6" width="152" height="35" rx="5" fill="${t === 2 ? metal(2) : "url(#gDark)"}" stroke="${c}" stroke-width="1.5"/>`;
    s += `<rect x="0" y="3" width="8" height="42" rx="2" fill="${metal(2)}" stroke="#0007" stroke-width=".5"/>`;
    for (let i = 0; i < 3; i++) s += `<rect x="1.8" y="${8 + i * 10}" width="4.4" height="6" rx="1" fill="#120a22"/>`;
    s += `<rect x="11" y="10" width="142" height="27" rx="4" fill="${t === 2 ? "#1a0f2e" : "#0a0414"}" stroke="${c}" stroke-opacity=".6"/>`;
    const r = t === 1 ? 11.5 : t === 2 ? 11 : 10;
    for (let i = 0; i < t; i++) s += artFan(11 + (142 / t) * (i + 0.5), 23.5, r, c, t === 3, t === 2 ? a : null);
    if (t >= 2) s += `<line x1="13" x2="151" y1="11.6" y2="11.6" stroke="${t === 3 ? "url(#rgbGrad)" : a}" stroke-width="1.3" filter="url(#glow)"${t === 3 ? ' class="rgbanim"' : ""}/>`;
    s += paw(147, 31, 0.5, c, 0.75);
    for (let i = 0; i < 26; i++) s += `<rect x="${15 + i * 3.1}" y="41" width="1.9" height="6" fill="#ffd54a"/>`;
    for (let k = 0; k < (t === 3 ? 2 : 1); k++) {
      s += `<rect x="${118 - k * 34}" y="2" width="30" height="6" rx="1.2" fill="#0a0414" stroke="${c}" stroke-width=".8"/>`;
      for (let i = 0; i < 8; i++) s += `<circle cx="${122 + i * 3.4 - k * 34}" cy="5" r=".9" fill="${c}"/>`;
    }
    s += gloss(11, 10, 142, 11, 4);
    return s;
  },

  /* ---------- Armazenamento ---------- */
  storage(t) {
    const c = ART_C[t], a = ART_ACC[t];
    if (t === 1) { // HD
      let s = `<rect x="2" y="2" width="96" height="46" rx="5" fill="${metal(1)}" stroke="#0008" stroke-width=".8"/>`;
      s += `<rect x="4" y="4" width="92" height="42" rx="4" fill="none" stroke="#fff" stroke-opacity=".35"/>`;
      s += `<circle cx="32" cy="25" r="20" fill="url(#gDark)" stroke="#0009"/><circle cx="32" cy="25" r="17" fill="none" stroke="#fff" stroke-opacity=".18"/><circle cx="32" cy="25" r="11" fill="none" stroke="#fff" stroke-opacity=".12"/><path d="M20 14 A16 16 0 0 1 44 12" stroke="#fff" stroke-opacity=".4" stroke-width="2" fill="none" stroke-linecap="round"/>`;
      s += `<circle cx="32" cy="25" r="4.5" fill="${metal(2)}"/><circle cx="32" cy="25" r="1.4" fill="#0a0414"/>`;
      s += `<path d="M80 9 L42 22" stroke="${metal(2)}" stroke-width="3" stroke-linecap="round"/><circle cx="81" cy="9" r="3.4" fill="${metal(2)}" stroke="#0007"/>`;
      s += `<rect x="58" y="29" width="34" height="14" rx="2" fill="#f4eaff"/><path d="M62 34 H80 M62 38 H74" stroke="#7a4fb0" stroke-width="1.4"/>${paw(86, 36, 0.5, "#7a4fb0")}`;
      [[7, 7], [93, 7], [7, 43], [93, 43]].forEach(([x, y]) => { s += `<circle cx="${x}" cy="${y}" r="1.7" fill="#0006"/>`; });
      return s;
    }
    let s = `<rect x="5" y="13" width="92" height="24" rx="3.5" fill="url(#gPcb)" stroke="${c}" stroke-width="1.3"/>`;
    for (let i = 0; i < 12; i++) s += `<rect x="${7 + i * 2.2}" y="32" width="1.2" height="5" fill="#ffd54a"/>`;
    s += `<circle cx="92" cy="25" r="2.3" fill="#0a0414" stroke="${c}" stroke-width=".7"/>`;
    if (t === 2) {
      for (let i = 0; i < 3; i++) s += `<rect x="${34 + i * 15}" y="16" width="13" height="15" rx="1.8" fill="#0c0618" stroke="${c}" stroke-opacity=".7" stroke-width=".6"/><rect x="${35 + i * 15}" y="17" width="11" height="3" rx="1" fill="#fff" opacity=".15"/>`;
      s += `<rect x="12" y="18" width="18" height="11" rx="2" fill="#1a0f2e" stroke="${a}" stroke-width=".6"/>`;
      s += `<rect x="12" y="15" width="84" height="2" rx="1" fill="${a}" opacity=".9" filter="url(#glow)"/>`;
    } else {
      s += `<rect x="17" y="8" width="78" height="34" rx="3.5" fill="${metal(3)}" stroke="#0008" stroke-width=".7"/>`;
      for (let x = 23; x < 90; x += 5) s += `<line x1="${x}" x2="${x}" y1="12" y2="38" stroke="#000" stroke-opacity=".28"/>`;
      s += `<rect x="17" y="8" width="78" height="4.5" rx="2" fill="url(#rgbGrad)" class="rgbanim" filter="url(#glow)"/>`;
      s += `<text x="56" y="30" class="arttxt" style="font-size:9px;fill:#4a2f00;opacity:.8">8 TB</text>`;
    }
    return s;
  },

  /* ---------- Fonte ---------- */
  psu(t) {
    const c = ART_C[t], a = ART_ACC[t];
    const edge = t === 3 ? `stroke="url(#rgbGrad)" stroke-width="2" class="rgbanim"` : `stroke="${c}" stroke-width="1.5"`;
    let s = `<rect x="1" y="1" width="158" height="46" rx="5" fill="url(#gDark)" ${edge}/>`;
    s += `<circle cx="31" cy="24" r="19.5" fill="#0a0414" stroke="${c}" stroke-opacity=".6"/><circle cx="31" cy="24" r="14" fill="none" stroke="${c}" stroke-opacity=".3"/>`;
    s += artFan(31, 24, 17, c, false, a);
    for (let i = 0; i < 9; i++) s += `<rect x="${60 + i * 6}" y="7" width="3" height="34" rx="1.5" fill="#0a0414" stroke="${c}" stroke-opacity=".45" stroke-width=".5"/>`;
    s += `<rect x="117" y="7" width="36" height="34" rx="3" fill="${metal(t)}" stroke="#0007" stroke-width=".6"/>`;
    s += `<text x="135" y="23" class="arttxt" style="font-size:9.5px;fill:#1a0a33">${["", "300W", "650W", "1600W"][t]}</text>`;
    s += `<text x="135" y="31" class="arttxt" style="font-size:4px;fill:#1a0a33;opacity:.75;letter-spacing:.4px">80+ ${["", "BRONZE", "SILVER", "GOLD"][t]}</text>`;
    s += paw(135, 37, 0.38, "#1a0a33", 0.6);
    s += `<rect x="6" y="43.5" width="148" height="1.8" rx=".9" fill="${a}" opacity=".85" filter="url(#glow)"/>`;
    return s;
  },

  /* ---------- Cooler ---------- */
  cooler(t) {
    const c = ART_C[t], a = ART_ACC[t];
    if (t === 1) { // dissipador de torre com ventoinha
      let s = `<rect x="12" y="12" width="76" height="76" rx="7" fill="url(#gDark)" stroke="${c}" stroke-width="1.5"/>`;
      for (let i = 0; i < 10; i++) s += `<line x1="${17 + i * 7.6}" x2="${17 + i * 7.6}" y1="14" y2="86" stroke="${c}" stroke-opacity=".32"/>`;
      s += artFan(50, 50, 28, c, false, a);
      [[17, 17], [83, 17], [17, 83], [83, 83]].forEach(([x, y]) => { s += `<circle cx="${x}" cy="${y}" r="2.3" fill="${metal(1)}" stroke="#0007" stroke-width=".5"/>`; });
      return s;
    }
    if (t === 2) { // water cooler (AIO)
      let s = `<rect x="6" y="3" width="88" height="18" rx="3.5" fill="url(#gDark)" stroke="${c}" stroke-width="1.4"/>`;
      for (let i = 0; i < 14; i++) s += `<line x1="${11 + i * 6.2}" x2="${11 + i * 6.2}" y1="5" y2="19" stroke="${c}" stroke-opacity=".4"/>`;
      s += `<path d="M28 21 C28 38 40 42 42 54 M72 21 C72 38 60 42 58 54" stroke="#241345" stroke-width="6.5" fill="none" stroke-linecap="round"/><path d="M28 21 C28 38 40 42 42 54 M72 21 C72 38 60 42 58 54" stroke="${c}" stroke-opacity=".5" stroke-width="1.1" fill="none" stroke-linecap="round" transform="translate(-1.6 0)"/>`;
      s += `<circle cx="50" cy="69" r="25" fill="url(#gDark)" stroke="${c}" stroke-width="1.6"/><circle cx="50" cy="69" r="20" fill="none" stroke="${a}" stroke-width="2.2" filter="url(#glow)"/>`;
      s += `<circle cx="50" cy="69" r="14" fill="#12071f" stroke="${c}" stroke-opacity=".6"/>${paw(50, 70, 1.15, a)}`;
      s += gloss(26, 46, 48, 14, 7);
      return s;
    }
    // refrigeração líquida custom
    let s = `<rect x="75" y="4" width="18" height="50" rx="8" fill="rgba(197,139,255,.14)" stroke="#e6ccff" stroke-width="1.3"/><rect x="77.5" y="26" width="13" height="26" rx="6" fill="url(#gLiquid)" filter="url(#glow)"/><rect x="78.5" y="8" width="2.4" height="40" rx="1.2" fill="#fff" opacity=".4"/>`;
    s += `<rect x="78" y="1" width="12" height="4" rx="1.5" fill="${metal(3)}"/><rect x="78" y="53" width="12" height="4" rx="1.5" fill="${metal(3)}"/>`;
    const tube = "M84 57 C84 74 66 70 64 80 M16 44 C16 22 38 30 40 46";
    s += `<path d="${tube}" stroke="url(#gLiquid)" stroke-width="6.5" fill="none" stroke-linecap="round" filter="url(#glow)"/><path d="${tube}" stroke="#fff" stroke-opacity=".55" stroke-width="1.3" fill="none" stroke-linecap="round" transform="translate(-1.4 -1)"/>`;
    s += `<rect x="12" y="41" width="9" height="4" rx="1.5" fill="${metal(3)}"/><rect x="36" y="44" width="9" height="4" rx="1.5" fill="${metal(3)}"/>`;
    s += `<rect x="21" y="46" width="47" height="46" rx="8" fill="url(#gDark)" stroke="url(#rgbGrad)" stroke-width="2.4" class="rgbanim" filter="url(#glow)"/>`;
    s += `<circle cx="44.5" cy="69" r="16" fill="#0a0414" stroke="${c}" stroke-width="1.2"/>` + artFan(44.5, 69, 11, c, true);
    s += gloss(21, 46, 47, 16, 8);
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
  let s = `<svg class="pc-svg" viewBox="0 -18 260 322" role="img" aria-label="Seu computador montado">`;

  /* brilho no chão */
  const c = T("case");
  if (c) s += `<ellipse cx="130" cy="301" rx="104" ry="5" fill="${ART_ACC[c]}" opacity=".3" filter="url(#glow)"/>`;

  /* gabinete (aberto, só a moldura) com orelhinhas */
  if (!c) {
    s += `<path class="empty" d="M24 6 L30 -12 L58 6M202 6 L230 -12 L236 6"/><rect class="empty" x="8" y="6" width="244" height="288" rx="14"/>${lbl(130, 17, "GABINETE")}`;
  } else {
    const cc = ART_C[c];
    s += `<g class="${P("case")}">`;
    s += `<path d="M22 8 L30 -14 Q31.5 -17 34 -15 L62 8Z" fill="url(#gDark)" stroke="${cc}" stroke-width="2" stroke-linejoin="round"/><path d="M238 8 L230 -14 Q228.5 -17 226 -15 L198 8Z" fill="url(#gDark)" stroke="${cc}" stroke-width="2" stroke-linejoin="round"/>`;
    s += `<path d="M30 6 L33 -6 L48 6Z" fill="#ff7ad9" opacity=".85"/><path d="M230 6 L227 -6 L212 6Z" fill="#ff7ad9" opacity=".85"/>`;
    s += `<rect x="8" y="6" width="244" height="288" rx="14" fill="#0a0414" fill-opacity=".62" ${c === 3 ? 'stroke="url(#rgbGrad)" stroke-width="2.6" class="rgbanim"' : `stroke="${cc}" stroke-width="2"`}/>`;
    if (c >= 2) s += `<path class="glass" d="M150 6 H238 a14 14 0 0 1 14 14 V280 a14 14 0 0 1 -14 14 H70 Z"/>`;
    for (let i = 0; i < 6; i++) s += `<line stroke="${cc}" style="opacity:.4" x1="198" x2="240" y1="${40 + i * 10}" y2="${40 + i * 10}"/>`;
    s += `<g class="t${c}">`;
    if (c >= 2) s += `<g class="fan"><circle class="line" cx="222" cy="150" r="14"/><circle class="dot" cx="222" cy="150" r="2.4"/><path class="line" d="M222 150 q8 -2 6 -10 M222 150 q2 8 10 6 M222 150 q-8 2 -6 10 M222 150 q-2 -8 -10 -6"/></g>`;
    if (c === 3) s += `<g class="fan"><circle class="line" cx="222" cy="206" r="14"/><circle class="dot" cx="222" cy="206" r="2.4"/><path class="line" d="M222 206 q8 -2 6 -10 M222 206 q2 8 10 6 M222 206 q-8 2 -6 10 M222 206 q-2 -8 -10 -6"/></g>`;
    s += `</g></g>`;
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
