/* =========================================================
   TUXFORGE — ilustrações das peças
   Estilo "diagrama de montagem": peças em perspectiva isométrica,
   contorno grosso, cores cheias, ventoinhas com anel RGB e vidro ciano.
   Cada peça tem 3 versões: 1 = Bronze, 2 = Prata, 3 = Ouro.
   Os gradientes (gCyan, gGlass, gLiquid, rgbGrad) e o filtro "glow"
   ficam definidos no index.html.
   ========================================================= */
"use strict";

/* ---------- cores ---------- */
const OUT = "#0b0817"; // contorno
const RB = ["#ff3d6e", "#ff9a2e", "#ffe03a", "#3dff7a", "#35e0ff", "#4d7bff", "#b44dff", "#ff4dd2"]; // arco-íris
const BLUE = ["#3d8bff", "#5aa2ff", "#3d8bff", "#5aa2ff"];
const DUO = ["#35e0ff", "#35e0ff", "#ff4dd2", "#ff4dd2"];
const MAT = {
  1: { top: "#ffd2a4", left: "#e58d4e", right: "#a95b29" }, // bronze
  2: { top: "#f7fbff", left: "#c8d3e0", right: "#8896a8" }, // prata
  3: { top: "#fff3ab", left: "#ffd54a", right: "#d29512" }, // ouro
};
const DARK = { top: "#3b3559", left: "#221d3b", right: "#14102a" };
const BLACK = { top: "#2c2745", left: "#18142b", right: "#0e0b1d" };

/* ---------- geometria isométrica ----------
   x vai para a direita-baixo, y para a esquerda-baixo, z para cima. */
const K = 0.866;
const P = (x, y, z = 0) => [(x - y) * K, (x + y) * 0.5 - z];
const pts = (ps) => ps.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
/* contorno padrão só quando o desenho não define o seu */
const sk = (extra, w) => (/stroke=/.test(extra) ? "" : `stroke="${OUT}" `) + (/stroke-width=/.test(extra) ? "" : `stroke-width="${w}" `);
const poly = (ps, fill, sw = 1.4, extra = "") => `<polygon points="${pts(ps)}" fill="${fill}" ${sk(extra, sw)}stroke-linejoin="round" ${extra}/>`;

/* caixa: desenha a face da frente-esquerda, a da frente-direita e o topo */
function box(x, y, z, w, d, h, c, sw = 1.4) {
  const top = [P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)];
  const right = [P(x + w, y, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z), P(x + w, y, z)];
  const left = [P(x, y + d, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z), P(x, y + d, z)];
  return poly(left, c.left, sw) + poly(right, c.right, sw) + poly(top, c.top, sw);
}
const topPoly = (x, y, z, w, d) => [P(x, y, z), P(x + w, y, z), P(x + w, y + d, z), P(x, y + d, z)];

/* planos onde se desenha "chapado": topo (u ao longo de x, v ao longo de y), face esquerda e face direita */
const onTop = (x, y, z, inner) => { const [e, f] = P(x, y, z); return `<g transform="matrix(${K} 0.5 ${-K} 0.5 ${e.toFixed(2)} ${f.toFixed(2)})">${inner}</g>`; };
const onLeft = (x, y, z, inner) => { const [e, f] = P(x, y, z); return `<g transform="matrix(${K} 0.5 0 1 ${e.toFixed(2)} ${f.toFixed(2)})">${inner}</g>`; };
const onRight = (x, y, z, inner) => { const [e, f] = P(x, y, z); return `<g transform="matrix(${K} -0.5 0 1 ${e.toFixed(2)} ${f.toFixed(2)})">${inner}</g>`; };

/* formas planas (o contorno não deforma com a perspectiva) */
const ln = `stroke="${OUT}" stroke-width="1" vector-effect="non-scaling-stroke"`;
const R = (x, y, w, h, fill, rx = 0, extra = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${sk(extra, 1)}vector-effect="non-scaling-stroke" ${extra}/>`;
const C = (x, y, r, fill, extra = "") => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${sk(extra, 1)}vector-effect="non-scaling-stroke" ${extra}/>`;
const TX = (x, y, txt, size, fill, extra = "") => `<text x="${x}" y="${y}" font-size="${size}" font-weight="700" text-anchor="middle" fill="${fill}" font-family="Chakra Petch, Arial, sans-serif" ${extra}>${txt}</text>`;

/* retângulo envolvente (para centralizar o desenho) */
const bb = (x, y, z, w, d, h) => [(x - y - d) * K, (x + y) * 0.5 - (z + h), (x + w - y) * K, (x + w + y + d) * 0.5 - z];
const union = (...bs) => [Math.min(...bs.map((b) => b[0])), Math.min(...bs.map((b) => b[1])), Math.max(...bs.map((b) => b[2])), Math.max(...bs.map((b) => b[3]))];
function fit(W, H, b, body, pad = 5) {
  const bw = b[2] - b[0], bh = b[3] - b[1];
  const s = Math.min((W - pad * 2) / bw, (H - pad * 2) / bh);
  const tx = (W - bw * s) / 2 - b[0] * s, ty = (H - bh * s) / 2 - b[1] * s;
  return `<g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${s.toFixed(4)})">${body}</g>`;
}

/* cilindro em pé (coordenadas do mundo); extraTop desenha no plano do topo, centrado */
function cyl(cx, cy, z, r, h, side, top, extraTop = "") {
  const [X, Y] = P(cx, cy, z + h);
  const a = r * 1.2247, b = r * 0.7071;
  return `<path d="M${(X - a).toFixed(1)} ${Y.toFixed(1)} V${(Y + h).toFixed(1)} A${a.toFixed(1)} ${b.toFixed(1)} 0 0 0 ${(X + a).toFixed(1)} ${(Y + h).toFixed(1)} V${Y.toFixed(1)} Z" fill="${side}" stroke="${OUT}" stroke-width="1.4" stroke-linejoin="round"/><ellipse cx="${X.toFixed(1)}" cy="${Y.toFixed(1)}" rx="${a.toFixed(1)}" ry="${b.toFixed(1)}" fill="${top}" stroke="${OUT}" stroke-width="1.4"/>${extraTop ? `<g transform="translate(${X.toFixed(2)} ${Y.toFixed(2)}) matrix(${K} 0.5 ${-K} 0.5 0 0)">${extraTop}</g>` : ""}`;
}

/* ---------- ventoinha com anel RGB (plana; a classe .fan faz girar) ---------- */
function arcRing(cx, cy, r, w, cols) {
  const n = cols.length;
  return cols.map((c, i) => {
    const a0 = (i / n) * 2 * Math.PI, a1 = ((i + 1) / n) * 2 * Math.PI + 0.07;
    const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0), x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    return `<path d="M${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}" stroke="${c}" stroke-width="${w}" fill="none"/>`;
  }).join("");
}
function rgbFan(cx, cy, r, cols) {
  const blade = `M0 0 C${r * 0.5} ${-r * 0.04} ${r * 0.78} ${-r * 0.42} ${r * 0.52} ${-r * 0.76} C${r * 0.34} ${-r * 0.46} ${r * 0.12} ${-r * 0.26} 0 0Z`;
  const blades = Array.from({ length: 9 }, (_, i) => `<path d="${blade}" transform="translate(${cx} ${cy}) rotate(${i * 40})" fill="#241d40" stroke="#fff" stroke-opacity=".25" stroke-width=".4"/>`).join("");
  return `<g class="fan"><circle cx="${cx}" cy="${cy}" r="${r}" fill="#0b0814" ${ln}/><g filter="url(#glow)">${arcRing(cx, cy, r * 0.88, r * 0.2, cols)}</g>${blades}<circle cx="${cx}" cy="${cy}" r="${r * 0.26}" fill="#2a2347" stroke="${cols[0]}" stroke-width=".8"/><circle cx="${cx}" cy="${cy}" r="${r * 0.1}" fill="${cols[Math.floor(cols.length / 2)]}"/></g>`;
}

/* tamanho nativo de cada desenho (largura, altura) */
const ART_SIZE = {
  case: [90, 120], mobo: [130, 100], cpu: [90, 76], ram: [100, 100],
  gpu: [130, 76], storage: [120, 72], psu: [100, 90], cooler: [120, 110],
};

const ART = {
  /* ---------- Gabinete: lateral de vidro ciano com ventoinhas ---------- */
  case(t) {
    const X = 40, Y = 56, Z = 84;
    const accent = t === 3 ? "#b44dff" : t === 2 ? "#35e0ff" : "#3d8bff";
    const [gx, gy] = P(X / 2, Y / 2, 0);
    let s = `<ellipse cx="${gx.toFixed(1)}" cy="${(gy + 5).toFixed(1)}" rx="46" ry="13" fill="${accent}" opacity=".35" filter="url(#glow)"/>`;
    [[3, 3], [X - 10, 3], [3, Y - 10], [X - 10, Y - 10]].forEach(([fx, fy]) => { s += box(fx, fy, -4, 7, 7, 4, DARK, 1.1); });
    s += box(0, 0, 0, X, Y, Z, BLACK);
    // topo: grelha de ventilação
    s += onTop(0, 0, Z, R(5, 8, X - 10, Y - 16, "#0c0919", 2) + Array.from({ length: 7 }, (_, i) => `<line x1="8" x2="${X - 8}" y1="${14 + i * 5.2}" y2="${14 + i * 5.2}" stroke="#4a4470" stroke-width="1.2" vector-effect="non-scaling-stroke"/>`).join(""));
    // frente (face esquerda): botão de ligar e LEDs
    let front = R(0, 0, X, Z, "#1d1833") + R(3, 3, X - 6, 6, "#0c0919", 2) + C(X / 2, 17, 4.2, "#120d24", `stroke="${accent}"`) + C(X / 2, 17, 1.4, accent, 'stroke="none" filter="url(#glow)"');
    front += R(8, Z - 16, X - 16, 3, accent, 1.5, 'stroke="none" filter="url(#glow)"');
    if (t === 3) front += R(6, 30, 2.6, 36, "url(#rgbGrad)", 1, 'stroke="none" class="rgbanim"') + R(X - 8.6, 30, 2.6, 36, "url(#rgbGrad)", 1, 'stroke="none" class="rgbanim"');
    if (t === 1) for (let yy = 30; yy < 70; yy += 4.5) for (let xx = 8; xx < X - 6; xx += 4.5) front += `<circle cx="${xx}" cy="${yy}" r="1" fill="#5d5780"/>`;
    s += onLeft(0, Y, Z, front);
    // lateral (face direita): interior visível e ventoinhas
    let side = R(0, 0, Y, Z, "#1d1833");
    side += R(4, 5, Y - 8, Z - 10, "#08061a", 3);
    side += R(8, 12, 16, 52, "#1d1a3b", 2) + R(11, 17, 7, 7, "#35e0ff", 1, 'opacity=".8" stroke="none"');
    side += `<path d="M24 28 C34 32 32 46 24 52" stroke="#ff4dd2" stroke-width="2" fill="none" vector-effect="non-scaling-stroke"/><path d="M24 34 C31 38 30 50 24 56" stroke="#35e0ff" stroke-width="2" fill="none" vector-effect="non-scaling-stroke"/>`;
    if (t === 1) side += rgbFan(36, 42, 14, BLUE);
    else if (t === 2) side += rgbFan(38, 25, 11.5, DUO) + rgbFan(38, 58, 11.5, DUO);
    else side += rgbFan(38, 20, 9.5, RB) + rgbFan(38, 42, 9.5, RB) + rgbFan(38, 64, 9.5, RB);
    if (t >= 2) {
      side += R(4, 5, Y - 8, Z - 10, "url(#gCyan)", 3, 'stroke="#7df0ff" stroke-width="1.2"');
      side += `<path d="M4 66 L34 5 H52 V16 L14 79 H4Z" fill="#fff" opacity=".13"/>`;
    }
    s += onRight(X, Y, Z, side);
    return fit(...ART_SIZE.case, union(bb(0, 0, -4, X, Y, Z + 4), [-54, -84, 41, 60]), s);
  },

  /* ---------- Placa-mãe: perspectiva, soquete e slots acesos ---------- */
  mobo(t) {
    const S = 72;
    const board = t === 1 ? { top: "#2f9560", left: "#1f6e42", right: "#175633" } : t === 2 ? { top: "#2c3258", left: "#1b1f3b", right: "#12152b" } : { top: "#281f48", left: "#181330", right: "#0f0b20" };
    const sink = t === 1 ? { top: "#57527a", left: "#2d2848", right: "#1c1830" } : t === 2 ? MAT[2] : { top: "#34305a", left: "#1d1a38", right: "#120f26" };
    const ramC = t === 1 ? ["#3a3560", "#3a3560", "#3a3560", "#3a3560"] : t === 2 ? ["#35e0ff", "#35e0ff", "#35e0ff", "#35e0ff"] : [RB[0], RB[3], RB[4], RB[7]];
    const accent = t === 2 ? "#35e0ff" : "#ffd54a";
    let s = box(0, 0, 0, S, S, 3, board);
    let flat = `<path d="M3 62 H18 V52 M3 30 H10 M66 66 H48 V58" stroke="${accent}" stroke-opacity=".5" stroke-width="1" fill="none" vector-effect="non-scaling-stroke"/>`;
    flat += R(13, 13, 25, 25, "#0b0818", 2, `stroke="${accent}"`);                                   // soquete
    for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) flat += `<circle cx="${17 + i * 3.8}" cy="${17 + j * 3.8}" r=".7" fill="#ffd54a"/>`;
    for (let i = 0; i < 4; i++) flat += R(46 + i * 5, 5, 3.3, 34, "#0b0818", 1) + R(46.5 + i * 5, 6, 2.3, 32, ramC[i], 1, t > 1 ? 'stroke="none" filter="url(#glow)"' : 'stroke="none"');  // slots de RAM
    flat += R(8, 44, 52, 3.6, t === 1 ? "#0b0818" : "#c8d3e0", 1) + R(8, 51, 34, 3, t === 1 ? "#0b0818" : "#c8d3e0", 1); // PCIe
    for (let i = 0; i < 3; i++) flat += R(62, 49 + i * 5, 7, 3.6, "#0b0818", 1);                       // SATA
    s += onTop(0, 0, 3, flat);
    // peças altas, de trás para frente
    s += box(3, 3, 3, 7, 34, 7, sink) + box(11, 2, 3, 30, 6, 7, sink);
    if (t >= 2) s += onTop(11, 2, 10, R(2, 2, 26, 2, t === 3 ? "url(#rgbGrad)" : "#35e0ff", 1, t === 3 ? 'stroke="none" class="rgbanim"' : 'stroke="none"'));
    s += box(8, 56, 3, 28, 12, 4, sink);
    s += box(36, 52, 3, 22, 16, 7, t === 3 ? MAT[3] : sink);
    s += `<clipPath id="cpShield"><rect width="22" height="16"/></clipPath>` + onTop(36, 52, 10, Array.from({ length: 8 }, (_, k) => `<path d="M${k * 6 - 6} 16 L${k * 6 + 10} 0" stroke="${t === 2 ? "#35e0ff" : t === 3 ? "#0b0817" : "#ffd54a"}" stroke-width="2.4" opacity=".75" clip-path="url(#cpShield)"/>`).join(""));
    s += onTop(0, 0, 3, TX(30, 70, ["", "ASROCK H610M", "TUF B760", "ROG Z790"][t], 3.4, accent, 'opacity=".9"'));
    if (t === 3) s += poly(topPoly(0, 0, 3, S, S), "none", 2, 'stroke="url(#rgbGrad)" class="rgbanim"');
    return fit(...ART_SIZE.mobo, bb(0, 0, 0, S, S, 10), s);
  },

  /* ---------- CPU: chip com tampa metálica e o modelo gravado ---------- */
  cpu(t) {
    const S = 42;
    let s = box(0, 0, 0, S, S, 3, { top: "#2b3a9c", left: "#1b2566", right: "#121846" });
    let pads = "";
    for (let i = 0; i < 10; i++) pads += R(3 + i * 3.7, 1.2, 2, 2, "#ffd54a", 0.4, 'stroke="none"') + R(3 + i * 3.7, S - 3.2, 2, 2, "#ffd54a", 0.4, 'stroke="none"') + R(1.2, 3 + i * 3.7, 2, 2, "#ffd54a", 0.4, 'stroke="none"') + R(S - 3.2, 3 + i * 3.7, 2, 2, "#ffd54a", 0.4, 'stroke="none"');
    s += onTop(0, 0, 3, pads);
    s += box(5, 5, 3, S - 10, S - 10, 4, MAT[t === 1 ? 2 : t]);
    const lines = [["PENTIUM", "GOLD"], ["CORE", "i3"], ["CORE", "i9"]][t - 1];
    s += onTop(5, 5, 7, R(2, 2, S - 14, S - 14, "none", 2, 'stroke="#0b0817" stroke-opacity=".35"') + TX((S - 10) / 2, 13, lines[0], t === 1 ? 4.4 : 5.2, "#2a1d4a") + TX((S - 10) / 2, 22.5, lines[1], 7, "#2a1d4a") + `<path d="M0 0 L7 0 L0 7Z" fill="#ffd54a" ${ln}/>`);
    return fit(...ART_SIZE.cpu, bb(0, 0, 0, S, S, 7), s);
  },

  /* ---------- RAM: 1, 2 ou 4 pentes em pé ---------- */
  ram(t) {
    const n = { 1: 1, 2: 2, 3: 4 }[t];
    const w = 4.5, d = 34, h = 48, gap = t === 3 ? 10 : 15;
    let s = "";
    for (let i = 0; i < n; i++) {
      const ox = i * gap;
      if (t === 3) { // RDIMM de servidor: placa verde cheia de chips
        s += box(ox, 0, 0, w, d, h, { top: "#3aa866", left: "#26844a", right: "#1d6b3b" });
        let f = "";
        for (let c = 0; c < 8; c++) f += R(3, 3 + c * 4.8, 11, 4, "#17131f", 0.6, 'stroke-width=".6"') + R(17.5, 3 + c * 4.8, 11, 4, "#17131f", 0.6, 'stroke-width=".6"');
        for (let g = 0; g < 14; g++) f += R(2 + g * 2.1, h - 5, 1.2, 4.5, "#ffd54a", 0, 'stroke="none"');
        s += onRight(ox + w, d, h, f);
      } else {
        s += box(ox, 0, 0, w, d, h, t === 1 ? { top: "#4a4568", left: "#25203c", right: "#17132a" } : { top: "#5a5478", left: "#2a2544", right: "#1a1630" });
        let f = R(2, 3, d - 4, h - 12, t === 1 ? "#251f3c" : "#2c2646", 2);
        if (t === 1) f += `<path d="M2 28 L${d - 2} 12" stroke="#ff3d3d" stroke-width="3" vector-effect="non-scaling-stroke"/><path d="M2 38 L${d - 2} 22" stroke="#ff3d3d" stroke-width="1.2" opacity=".7" vector-effect="non-scaling-stroke"/>` + R(2, 3, d - 4, 4, "#ff3d3d", 1.5);
        else f += Array.from({ length: 6 }, (_, k) => `<line x1="4" x2="${d - 4}" y1="${14 + k * 5}" y2="${14 + k * 5}" stroke="#dbe4f0" stroke-opacity=".5" vector-effect="non-scaling-stroke"/>`).join("");
        for (let g = 0; g < 14; g++) f += R(2 + g * 2.1, h - 5, 1.2, 4.5, "#ffd54a", 0, 'stroke="none"');
        s += onRight(ox + w, d, h, f);
        if (t === 2) { // barra de luz RGB no topo do pente
          const bar = [P(ox, 2, h + 3.5), P(ox + w, 2, h + 3.5), P(ox + w, d - 2, h + 3.5), P(ox, d - 2, h + 3.5)];
          s += box(ox, 2, h, w, d - 4, 3.5, { top: "#8a63ff", left: "#6a43d8", right: "#4a2f9a" }, 1.1) + poly(bar, "url(#rgbGrad)", 1.1, 'class="rgbanim"');
        }
      }
    }
    const last = (n - 1) * gap;
    return fit(...ART_SIZE.ram, bb(0, 0, 0, last + w, d, h + 4), s);
  },

  /* ---------- Placa de vídeo: ventoinhas no topo e conectores dourados ---------- */
  gpu(t) {
    const L = 80, W = 26, H = 11;
    const shroud = t === 2 ? { top: "#eef2f8", left: "#b7c3d3", right: "#7d8b9f" } : t === 3 ? { top: "#38325a", left: "#1f1a38", right: "#120e24" } : { top: "#403a60", left: "#231e3a", right: "#15112a" };
    const cols = t === 1 ? BLUE : t === 2 ? DUO : RB;
    let s = box(0, 0, 0, L, W, H, shroud);
    let top = R(2, 2, L - 4, W - 4, "#0b0814", 3);
    for (let i = 0; i < t; i++) top += rgbFan((L / t) * (i + 0.5), W / 2, 10.5, cols);
    top += R(3, 1.2, L - 6, 1.8, t === 1 ? "#3d8bff" : "url(#rgbGrad)", 0.8, `stroke="none" filter="url(#glow)"${t === 3 ? ' class="rgbanim"' : ""}`);
    s += onTop(0, 0, H, top);
    s += box(52, 2, H, 20, 6, 4, BLACK);
    let fingers = "";
    for (let i = 0; i < 24; i++) fingers += R(6 + i * 2.7, 5.4, 1.7, 4.6, "#ffd54a", 0, 'stroke="none"');
    s += onLeft(0, W, H, fingers + `<line x1="0" x2="${L}" y1="0.5" y2="0.5" stroke="${t === 2 ? "#ffffff" : "#ffd54a"}" stroke-opacity=".6" vector-effect="non-scaling-stroke"/>`);
    s += box(L, 0, -2, 2.2, W, H + 4, MAT[2], 1.1);   // espelho com as saídas de vídeo
    s += onRight(L + 2.2, W, H + 2, R(2, 3, W - 4, 3.4, "#0b0818", 1) + R(2, 8, W - 4, 3.4, "#ff9a2e", 1) + R(2, 13, W - 4, 3.4, "#35e0ff", 1) + R(2.4, 18, 4, 3, "#3dff7a", 0.6));
    if (t === 3) s += poly(topPoly(0, 0, H, L, W), "none", 2, 'stroke="url(#rgbGrad)" class="rgbanim"');
    return fit(...ART_SIZE.gpu, bb(0, 0, -2, L + 2.2, W, H + 6), s);
  },

  /* ---------- Armazenamento ---------- */
  storage(t) {
    if (t === 1) { // HD com etiqueta azul
      const w = 40, d = 54, h = 10;
      let s = box(0, 0, 0, w, d, h, MAT[2]);
      let top = "";
      [[3, 3], [w - 3, 3], [3, d - 3], [w - 3, d - 3]].forEach(([x, y]) => { top += C(x, y, 1.4, "#6b7788"); });
      top += R(4, 17, w - 8, 30, "#1e63ff", 2) + R(6, 20, w - 12, 5, "#fff", 1) + TX(w / 2, 24, "BARRACUDA", 3.4, "#1e63ff") + R(6, 28, w - 12, 1.6, "#cfe0ff", 0.8, 'stroke="none"') + R(6, 32, w - 18, 1.6, "#cfe0ff", 0.8, 'stroke="none"') + C(w / 2, 9, 4.2, "#9aa7ba") + C(w / 2, 9, 1.6, "#3a4458");
      s += onTop(0, 0, h, top);
      let sata = "";
      for (let i = 0; i < 7; i++) sata += R(4 + i * 3.4, 2.5, 2.2, 5, "#ffd54a", 0.5, 'stroke-width=".6"');
      for (let i = 0; i < 15; i++) sata += R(32 + i * 1.8, 2.5, 1.2, 5, "#ffd54a", 0.4, 'stroke-width=".5"');
      s += onRight(w, d, h, sata);
      return fit(...ART_SIZE.storage, bb(0, 0, 0, w, d, h), s);
    }
    const w = 60, d = 20, h = 3;
    let s = box(0, 0, 0, w, d, h, { top: "#4a2fa8", left: "#2f1d70", right: "#1e1248" });
    let flat = "";
    for (let i = 0; i < 12; i++) flat += R(w - 1.8, 2 + i * 1.4, 1.6, 1, "#ffd54a", 0, 'stroke="none"');
    s += onTop(0, 0, h, flat + C(3, d / 2, 1.8, "#0b0814"));
    if (t === 2) { // Samsung 980 PRO: etiqueta preta com letras vermelhas
      s += onTop(0, 0, h, R(8, 2, 44, d - 4, "#0c0a14", 1.5, 'stroke="#ff3d3d"') + R(8, 2, 44, 3.4, "#ff3d3d", 1) + TX(30, 13.6, "980 PRO", 7, "#ffffff") + R(55, 6, 3, 8, "#17131f", 0.6));
      return fit(...ART_SIZE.storage, bb(0, 0, 0, w, d, h), s);
    }
    // Sabrent Rocket 4 Plus: dissipador dourado com luz
    s += box(8, 0, h, w - 12, d, 9, MAT[3]);
    let fins = "";
    for (let i = 0; i < 12; i++) fins += `<line x1="${3 + i * 3.6}" x2="${3 + i * 3.6}" y1="1" y2="${d - 1}" stroke="#7a5200" stroke-opacity=".5" vector-effect="non-scaling-stroke"/>`;
    s += onTop(8, 0, h + 9, fins + R(2, 2, w - 16, 3.2, "url(#rgbGrad)", 1.4, 'stroke="none" class="rgbanim" filter="url(#glow)"') + R(8, 8, w - 28, 8, "#0c0a14", 1.5) + TX((w - 12) / 2 - 1, 13.6, "ROCKET 8TB", 4.2, "#ffd54a"));
    return fit(...ART_SIZE.storage, bb(0, 0, 0, w, d, h + 9), s);
  },

  /* ---------- Fonte: ventoinha no topo, etiqueta e cabos ---------- */
  psu(t) {
    const w = 46, d = 52, h = 30;
    let s = box(0, 0, 0, w, d, h, BLACK);
    const fanCols = t === 1 ? ["#aab4c6", "#d3dae6", "#aab4c6", "#d3dae6"] : t === 2 ? ["#ffd54a", "#ffb02e", "#ffd54a", "#ffb02e"] : RB;
    let top = R(2, 2, w - 4, d - 4, "#0c0919", 3);
    for (let r = 20; r > 6; r -= 4.2) top += `<circle cx="${w / 2}" cy="${d / 2}" r="${r}" fill="none" stroke="#4a4470" stroke-width=".9" vector-effect="non-scaling-stroke"/>`;
    top += rgbFan(w / 2, d / 2, 16, fanCols);
    [[4, 4], [w - 4, 4], [4, d - 4], [w - 4, d - 4]].forEach(([x, y]) => { top += C(x, y, 1.2, "#6b6590"); });
    s += onTop(0, 0, h, top);
    const label = t === 1 ? "#d6322e" : t === 2 ? "#f4f7ff" : "#14102a";
    const ink = t === 2 ? "#14102a" : "#ffffff";
    let front = R(0, 0, w, h, "#1d1833") + R(4, 4, w - 8, h - 8, label, 2, t === 3 ? 'stroke="#ffd54a"' : "") + TX(w / 2, 14, ["", "CV550", "RM750e", "AX1600i"][t], 6.4, t === 3 ? "#ffd54a" : ink) + TX(w / 2, 21, ["", "80+ BRONZE", "80+ GOLD", "80+ TITANIUM"][t], 3.4, ink);
    if (t === 3) front += R(10, 22.4, w - 20, 4.6, "#021a0a", 1, 'stroke="#3dff7a"') + TX(w / 2, 26.4, "1600 W", 3.6, "#3dff7a");
    s += onLeft(0, d, h, front);
    let side = R(0, 0, d, h, "#161129");
    for (let i = 0; i < 5; i++) side += R(5 + i * 9, 5, 7, 9, "#0b0817", 1.5) + C(8.5 + i * 9, 9.5, 1.6, i < 3 ? "#3dff7a" : "#3a3560", i < 3 ? 'stroke="none" filter="url(#glow)"' : 'stroke="none"');
    side += R(d - 14, h - 11, 9, 6, "#0b0817", 1.5) + R(d - 12.5, h - 9.6, 6, 2.2, "#ff3d3d", 0.6, 'stroke="none"');
    s += onRight(w, d, h, side);
    const cab = t === 3 ? RB.slice(0, 5) : t === 2 ? ["#14102a", "#241f40", "#14102a"] : ["#14102a", "#241f40"];
    cab.forEach((c, i) => {
      const [x0, y0] = P(w, 8 + i * 9, 20), [x1, y1] = P(w + 14, 14 + i * 9, 6);
      const dd = `M${x0.toFixed(1)} ${y0.toFixed(1)} C${(x0 + 10).toFixed(1)} ${(y0 + 4).toFixed(1)} ${(x1 + 2).toFixed(1)} ${(y1 - 6).toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
      s += `<path d="${dd}" stroke="${OUT}" stroke-width="4.6" fill="none" stroke-linecap="round"/><path d="${dd}" stroke="${c}" stroke-width="2.8" fill="none" stroke-linecap="round"/>`;
    });
    return fit(...ART_SIZE.psu, union(bb(0, 0, 0, w, d, h), bb(w, 0, 0, 14, d, 6)), s);
  },

  /* ---------- Cooler ---------- */
  cooler(t) {
    const tube = (d, w = 5) => `<path d="${d}" fill="none" stroke="${OUT}" stroke-width="${w + 3}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#2d2748" stroke-width="${w}" stroke-linecap="round"/>`;
    if (t === 1) { // Hyper 212: torre de alumínio com ventoinha na frente
      const w = 16, d = 34, h = 40;
      let s = box(0, 0, 0, w, d, h, MAT[2]);
      let fl = "";
      for (let i = 0; i < 15; i++) fl += `<line x1="0" x2="${w}" y1="${3 + i * 2.5}" y2="${3 + i * 2.5}" stroke="#6f7f93" stroke-width="1.1" vector-effect="non-scaling-stroke"/>`;
      s += onLeft(0, d, h, fl);
      let tp = "";
      [[4, 6], [4, 17], [4, 28], [11, 11.5], [11, 22.5]].forEach(([x, y]) => { tp += C(x, y, 2.6, "#e58d4e") + C(x, y, 1, "#ffd2a4", 'stroke="none"'); });
      s += onTop(0, 0, h, tp);
      s += box(w, 0, 2, 6, d, h - 6, BLACK);
      s += onRight(w + 6, d, h - 4, R(0, 0, d, h - 6, "#1d1833", 2) + rgbFan(d / 2, (h - 6) / 2, 14.5, BLUE));
      return fit(...ART_SIZE.cooler, bb(0, 0, 0, w + 6, d, h), s);
    }
    if (t === 2) { // Corsair H150i: radiador com 3 ventoinhas e bloco com anéis
      const w = 20, d = 66, h = 9;
      let s = box(0, 0, 0, w, d, h, BLACK);
      s += onTop(0, 0, h, R(1.5, 1.5, w - 3, d - 3, "#0c0919", 2) + rgbFan(w / 2, 12, 8.6, RB) + rgbFan(w / 2, 33, 8.6, RB) + rgbFan(w / 2, 54, 8.6, RB));
      const [ax, ay] = P(w, 6, 5), [bx, by] = P(w, 60, 5), [cx, cy] = P(34, 62, 14);
      const curve = (x0, y0, x1, y1) => `M${x0.toFixed(1)} ${y0.toFixed(1)} C${(x0 + 22).toFixed(1)} ${(y0 + 12).toFixed(1)} ${(x1 - 10).toFixed(1)} ${(y1 - 14).toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
      s += tube(curve(ax, ay, cx - 8, cy), 4.6) + tube(curve(bx, by, cx + 8, cy), 4.6);
      s += cyl(34, 62, 0, 14, 12, "#1d1833", "#0f0b20", `<g filter="url(#glow)">${arcRing(0, 0, 10, 2.6, RB)}${arcRing(0, 0, 6, 1.8, [...RB].reverse())}</g><circle r="3" fill="#35e0ff"/>`);
      return fit(...ART_SIZE.cooler, union(bb(0, 0, 0, w, d, h), bb(20, 48, 0, 30, 30, 14)), s);
    }
    // loop custom EK: reservatório com líquido neon, bloco RGB e tubos
    let s = "";
    const liquid = (d) => `<path d="${d}" fill="none" stroke="${OUT}" stroke-width="8" stroke-linecap="round"/><path d="${d}" fill="none" stroke="url(#gLiquid)" stroke-width="5" stroke-linecap="round" filter="url(#glow)"/><path d="${d}" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1" stroke-linecap="round" transform="translate(-1 -1)"/>`;
    const a = P(14, 18, 6), b = P(30, 34, 8);
    s += liquid(`M${a[0].toFixed(1)} ${a[1].toFixed(1)} C${(a[0] + 4).toFixed(1)} ${(a[1] + 16).toFixed(1)} ${(b[0] - 22).toFixed(1)} ${(b[1] + 8).toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`);
    s += cyl(10, 12, 0, 8, 44, "rgba(180,77,255,.28)", "#e6ccff");
    s += cyl(10, 12, 0, 6, 26, "#ff4dd2", "#ffd0f4");
    s += box(30, 22, 0, 26, 26, 14, BLACK) + onTop(30, 22, 14, R(1.5, 1.5, 23, 23, "#0c0919", 3, 'stroke="url(#rgbGrad)" class="rgbanim"') + rgbFan(13, 13, 9.5, RB));
    s += poly(topPoly(30, 22, 14, 26, 26), "none", 2, 'stroke="url(#rgbGrad)" class="rgbanim"');
    return fit(...ART_SIZE.cooler, union(bb(2, 4, 0, 16, 16, 48), bb(30, 22, 0, 26, 26, 14)), s);
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
  return `<svg class="pc-svg art" viewBox="0 0 120 80" aria-hidden="true">${placeArt(slot, t, 6, 4, 108, 72)}</svg>`;
}

/* =========================================================
   O computador montado: gabinete isométrico aberto (em corte)
   Fundo escuro, placa-mãe na parede, peças instaladas dentro e vidro
   ciano na frente. O que ainda não foi comprado fica em "fantasma".
   ========================================================= */
const CS = { X: 60, Y: 76, Z: 96 }; // x: largura entre a parede e o vidro, y: profundidade, z: altura

/* onde cada peça fica dentro do gabinete (ponto do mundo) e o tamanho do desenho */
const ANCHOR = {
  psu: { at: [32, 17, 15], k: 0.5 },
  storage: { at: [14, 54, 14], k: 0.42 },
  ram: { at: [10, 25, 64], k: 0.6 },
  cooler: { at: [12, 52, 68], k: 0.55 },
  gpu: { at: [27, 40, 34], k: 0.6 },
  cpu: { at: [12, 52, 68], k: 0.5 }, // só aparece solto quando não há placa-mãe
};

function sprite(slot, t, ghost, pop) {
  const a = ANCHOR[slot], [W, H] = ART_SIZE[slot], [cx, cy] = P(...a.at);
  const inner = `<g transform="translate(${cx.toFixed(1)} ${cy.toFixed(1)}) scale(${a.k}) translate(${-W / 2} ${-H / 2})">${ART[slot](t)}</g>`;
  return ghost ? `<g class="ghost">${inner}</g>` : `<g class="${pop === slot ? "pop" : ""}">${inner}</g>`;
}

/* placa-mãe de frente, colada na parede de trás (plano x = 0) */
function moboWall(t, cpuT) {
  const board = t === 1 ? "#2f9560" : t === 2 ? "#2c3258" : "#281f48";
  const accent = t === 2 ? "#35e0ff" : "#ffd54a";
  const sink = t === 1 ? "#57527a" : t === 2 ? "#c8d3e0" : "#3d3866";
  const ramC = t === 1 ? ["#3a3560", "#3a3560", "#3a3560", "#3a3560"] : t === 2 ? ["#35e0ff", "#35e0ff", "#35e0ff", "#35e0ff"] : [RB[0], RB[3], RB[4], RB[7]];
  let f = R(0, 0, 64, 80, board, 3, `stroke="${accent}" stroke-width="1.4"`);
  f += `<path d="M3 50 H14 V44 M52 76 H40 V70 M3 30 H6" stroke="${accent}" stroke-opacity=".5" stroke-width="1" fill="none" vector-effect="non-scaling-stroke"/>`;
  f += R(8, 8, 25, 25, "#0b0818", 2, `stroke="${accent}"`);                                            // soquete
  if (cpuT) {
    const m = MAT[cpuT === 1 ? 2 : cpuT];
    f += R(11, 11, 19, 19, m.left, 2) + R(13, 13, 15, 15, m.top, 1.5, 'stroke="none"') + TX(20.5, 20, ["PENTIUM", "CORE", "CORE"][cpuT - 1], 3.6, "#2a1d4a") + TX(20.5, 26, ["GOLD", "i3", "i9"][cpuT - 1], 5.2, "#2a1d4a");
  } else {
    for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) f += `<circle cx="${12 + i * 4.2}" cy="${12 + j * 4.2}" r=".8" fill="#ffd54a"/>`;
  }
  for (let i = 0; i < 4; i++) f += R(40 + i * 5.2, 5, 3.6, 40, "#0b0818", 1) + R(40.5 + i * 5.2, 6, 2.6, 38, ramC[i], 1, t > 1 ? 'stroke="none" filter="url(#glow)"' : 'stroke="none"');  // slots de RAM
  f += R(2, 6, 4, 38, sink, 1) + R(10, 2, 26, 3.6, sink, 1);                                              // dissipadores do VRM
  if (t >= 2) f += R(11, 2.6, 24, 1.6, t === 3 ? "url(#rgbGrad)" : "#35e0ff", 0.8, t === 3 ? 'stroke="none" class="rgbanim"' : 'stroke="none"');
  f += R(6, 52, 46, 3.4, t === 1 ? "#0b0818" : "#c8d3e0", 1) + R(6, 61, 30, 3, t === 1 ? "#0b0818" : "#c8d3e0", 1); // PCIe
  f += `<clipPath id="cpWall"><rect x="42" y="58" width="18" height="14"/></clipPath>` + R(42, 58, 18, 14, t === 3 ? MAT[3].left : sink, 1.5);
  for (let k = 0; k < 6; k++) f += `<path d="M${40 + k * 5} 72 L${52 + k * 5} 58" stroke="${t === 2 ? "#35e0ff" : t === 3 ? "#0b0817" : "#ffd54a"}" stroke-width="2.2" opacity=".75" clip-path="url(#cpWall)"/>`;
  f += R(8, 68, 28, 6, sink, 1.2);
  f += TX(32, 78.4, ["", "ASROCK H610M", "TUF B760", "ROG Z790"][t], 3.4, accent, 'opacity=".9"');
  if (t === 3) f += R(0, 0, 64, 80, "none", 3, 'stroke="url(#rgbGrad)" stroke-width="2" class="rgbanim"');
  return onRight(0, 72, 90, f);
}

/* fundo do gabinete: brilho, pés, chão, paredes e ventoinhas do fundo */
function caseBack(t) {
  const { X, Y, Z } = CS, tt = t || 1;
  const accent = tt === 3 ? "#b44dff" : tt === 2 ? "#35e0ff" : "#3d8bff";
  const [gx, gy] = P(X / 2, Y / 2, 0);
  let s = `<ellipse cx="${gx.toFixed(1)}" cy="${(gy + 8).toFixed(1)}" rx="52" ry="15" fill="${accent}" opacity="0.4" filter="url(#glow)"/>`;
  [[2, 2], [X - 9, 2], [2, Y - 9], [X - 9, Y - 9]].forEach(([fx, fy]) => { s += box(fx, fy, -5, 7, 7, 5, DARK, 1.1); });
  s += poly(topPoly(0, 0, 0, X, Y), "#161029", 1.4);
  s += onTop(0, 0, 0, Array.from({ length: 6 }, (_, i) => `<line x1="0" x2="${X}" y1="${(i + 1) * 10.8}" y2="${(i + 1) * 10.8}" stroke="#3d3560" stroke-width="1" vector-effect="non-scaling-stroke"/>`).join(""));
  s += poly([P(0, 0, Z), P(0, Y, Z), P(0, Y, 0), P(0, 0, 0)], "#1c1636", 1.4);   // parede da placa-mãe
  s += poly([P(0, 0, Z), P(X, 0, Z), P(X, 0, 0), P(0, 0, 0)], "#140f2a", 1.4);   // parede do fundo
  const fans = tt === 1 ? rgbFan(40, 48, 14, BLUE) : tt === 2 ? rgbFan(40, 28, 12.5, DUO) + rgbFan(40, 68, 12.5, DUO) : rgbFan(40, 20, 10.5, RB) + rgbFan(40, 48, 10.5, RB) + rgbFan(40, 76, 10.5, RB);
  return s + onLeft(0, 0, Z, fans);
}

/* frente do gabinete: vidro ciano (lateral), painel frontal e moldura aberta no topo */
function caseFront(t) {
  const { X, Y, Z } = CS, tt = t || 1;
  const accent = tt === 3 ? "#b44dff" : tt === 2 ? "#35e0ff" : "#3d8bff";
  const edge = tt === 3 ? "url(#rgbGrad)" : tt === 2 ? "#dbe4f0" : "#f0a066";
  const anim = tt === 3 ? ' class="rgbanim"' : "";
  let s = poly([P(X, 0, Z), P(X, Y, Z), P(X, Y, 0), P(X, 0, 0)], tt >= 2 ? "url(#gCyan)" : "rgba(150,180,255,0.10)", 1.6, `stroke="${edge}"${anim}`);
  s += onRight(X, Y, Z, `<path d="M4 76 L38 4 H58 V18 L18 96 H4Z" fill="#fff" opacity=".1"/>`);
  s += poly([P(0, Y, Z), P(X, Y, Z), P(X, Y, 0), P(0, Y, 0)], "rgba(12,7,28,0.4)", 1.6, `stroke="${edge}"${anim}`);
  s += onLeft(0, Y, Z, R(3, 3, X - 6, 6, "#0c0919", 2) + C(X / 2, 17, 4.2, "#120d24", `stroke="${accent}"`) + C(X / 2, 17, 1.4, accent, 'stroke="none" filter="url(#glow)"') + R(8, Z - 14, X - 16, 3, accent, 1.5, 'stroke="none" filter="url(#glow)"'));
  if (tt === 3) s += onLeft(0, Y, Z, R(5, 30, 2.6, 44, "url(#rgbGrad)", 1, 'stroke="none" class="rgbanim"') + R(X - 7.6, 30, 2.6, 44, "url(#rgbGrad)", 1, 'stroke="none" class="rgbanim"'));
  return s + poly(topPoly(0, 0, Z, X, Y), "none", 2, `stroke="${edge}"${anim}`);
}

function pcSvg(inst = game.installed, pop = null) {
  const have = (s) => (inst[s] ? partById[inst[s]].tier : 0);
  const { X, Y, Z } = CS;
  const ct = have("case"), mt = have("mobo"), cpuT = have("cpu");
  let body = `<g class="${ct ? (pop === "case" ? "pop" : "") : "ghost-case"}">${caseBack(ct)}</g>`;
  body += mt
    ? `<g class="${pop === "mobo" || pop === "cpu" ? "pop" : ""}">${moboWall(mt, cpuT)}</g>`
    : `<g class="ghost-case">${onRight(0, 72, 90, R(0, 0, 64, 80, "none", 3, 'stroke="#8a6fb8" stroke-dasharray="4 3"') + TX(32, 42, "PLACA-MÃE", 5, "#8a6fb8"))}</g>`;
  if (cpuT && !mt) body += sprite("cpu", cpuT, false, pop);
  ["psu", "storage", "ram", "cooler", "gpu"].forEach((slot) => { const t = have(slot); body += sprite(slot, t || 1, !t, pop); });
  body += `<g class="${ct ? "" : "ghost-case"}">${caseFront(ct)}</g>`;
  const b = union(bb(0, 0, -5, X, Y, Z + 5), [-62, -98, 50, 72]);
  return `<svg class="pc-svg" viewBox="0 0 300 330" role="img" aria-label="Seu computador montado">${fit(300, 330, b, body, 6)}</svg>`;
}
