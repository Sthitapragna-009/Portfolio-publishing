// Generates the ASCII header scene for projects/paraga-mitra.html: the
// dot-matrix bee (dense shading, yellow bands, dissolving into squares) and a
// stippled blossom made only of dots, annotated like a specimen poster, with
// a faint trail of pollen between them. A second, empty <pre> sits on top for
// the live pollen that assets/parag/parag.js animates.
//
//   node tools/parag/ascii-scene.js
//
// Writes into the page between the ASCII-BEE markers in the header.

const fs = require("fs");
const path = require("path");

const COLS = 136;
const ROWS = 80;
// World units: one column wide. A monospace cell is ~0.6 as wide as it is
// tall, so one row is 1/0.6 units high. Circles stay circles.
const ROW_H = 1 / 0.6;

// Deterministic randomness, so the art is the same on every build.
let seed = 20261015;
const rnd = () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// Distance inside a rotated ellipse: <1 inside, 0 at the centre.
function ell(x, y, cx, cy, rx, ry, rotDeg = 0) {
  const a = (rotDeg * Math.PI) / 180;
  const dx = x - cx, dy = y - cy;
  const u = (dx * Math.cos(a) + dy * Math.sin(a)) / rx;
  const v = (-dx * Math.sin(a) + dy * Math.cos(a)) / ry;
  return { d: Math.sqrt(u * u + v * v), u, v };
}
// Distance from a point to a polyline.
function segDist(x, y, pts) {
  let best = Infinity;
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
    const vx = bx - ax, vy = by - ay;
    const t = Math.max(0, Math.min(1, ((x - ax) * vx + (y - ay) * vy) / (vx * vx + vy * vy)));
    best = Math.min(best, Math.hypot(ax + t * vx - x, ay + t * vy - y));
  }
  return best;
}

// ---- The bee: the dot-matrix bee from the moodboard, in its own 0-100
// frame, placed top left. Dense shading, yellow bands, and its tail end
// dissolving into squares. ----
const BEE = { x: 0, y: 2, s: 0.66 };
const BEE_RAMP = " .:-=+*#%@";
// k^0.6 pushes the body towards the dense end of the ramp, so it reads small.
const beeShade = (k) => BEE_RAMP[Math.max(1, Math.min(BEE_RAMP.length - 1, Math.round(Math.pow(Math.max(0, k), 0.6) * (BEE_RAMP.length - 1))))];
const beeLegs = [
  [[38, 52], [31, 64], [33, 74]],
  [[45, 55], [45, 68], [49, 79]],
  [[52, 57], [57, 69], [56, 77]],
];
const beeAntennae = [
  [[20, 30], [12, 22], [4, 19]],
  [[23, 29], [18, 18], [12, 12]],
];
const beeVeins = [
  [[47, 33], [66, 20], [86, 13]],
  [[50, 35], [72, 28], [90, 24]],
  [[60, 26], [64, 33]],
  [[72, 20], [76, 29]],
];
// Columns of the dotted drips below the body, in the bee's own frame.
const DRIP_Y = [54, 54.8];
const DRIP_W = [40, 75, 82];

function bee(X, Y, r, c) {
  const x = (X - BEE.x) / BEE.s, y = (Y - BEE.y) / BEE.s;
  if (x < -2 || x > 102 || y < -2 || y > 102) return null;
  const cellW = 1 / BEE.s;
  // How far into the dissolve: 0 on the left, 1 at the far right.
  const decay = Math.max(0, (x - 55) / 45) * 0.9 + Math.max(0, (y - 62) / 38) * 0.6;

  const head = ell(x, y, 24, 38, 9, 10, -10);
  const eye = ell(x, y, 20, 36, 4, 6.5, -10);
  const thorax = ell(x, y, 39, 42, 13.5, 13, -15);
  const abd = ell(x, y, 63, 59, 21, 14, 32);
  const wing1 = ell(x, y, 66, 22, 27, 9.5, -18);
  const wing2 = ell(x, y, 68, 32, 23, 7.5, -8);

  if (abd.d < 1) {
    const band = Math.floor((abd.u + 1) * 3.2) % 2 === 1;
    if (rnd() < decay * 0.55) return [rnd() < 0.5 ? "■" : "▪", rnd() < 0.6 ? "y" : "k"];
    return [beeShade((1 - abd.d * 0.7) * (0.75 + rnd() * 0.25)), band ? "y" : "k"];
  }
  if (thorax.d < 1) return [beeShade((1 - thorax.d * 0.55) * (0.8 + rnd() * 0.2)), thorax.v < -0.15 && rnd() < 0.55 ? "y" : "k"];
  if (eye.d < 1) return ["@", "k"];
  if (head.d < 1) return [beeShade((1 - head.d * 0.6) * (0.75 + rnd() * 0.25)), "k"];
  const inWing = wing1.d < 1 || wing2.d < 1;
  if (inWing && beeVeins.some((v) => segDist(x, y, v) < 0.7 * cellW)) return ["+", "w"];
  if (inWing) {
    const edge = Math.max(wing1.d < 1 ? wing1.d : 0, wing2.d < 1 ? wing2.d : 0);
    if ((r + c) % 2 === 0 && rnd() < 0.55 + edge * 0.4) return [edge > 0.85 ? ":" : ".", "w"];
    return null;
  }
  if (beeLegs.some((l) => segDist(x, y, l) < 0.85 * cellW)) return [rnd() < 0.5 ? "%" : "#", "k"];
  if (beeAntennae.some((l) => segDist(x, y, l) < 0.6 * cellW)) return [rnd() < 0.6 ? ":" : ".", "k"];

  // Debris: squares thrown off to the right and below, plus dotted drips.
  const near = Math.exp(-((x - 66) ** 2 / 900 + (y - 50) ** 2 / 700));
  if (rnd() < near * (0.05 + decay * 0.18)) {
    const pick = rnd();
    return [pick < 0.35 ? "■" : pick < 0.6 ? "□" : pick < 0.85 ? "▪" : "▫", rnd() < 0.55 ? "y g" : "k g"];
  }
  const onCol = (lx) => Math.abs(x - lx) < cellW / 2;
  if (DRIP_Y.some(onCol) && y > 66 && rnd() < 0.8) return [":", "y"];
  if (DRIP_W.some(onCol) && y > 60 && y < 95 && rnd() < 0.45) return [".", "w"];
  return null;
}

// ---- The blossom: stippled, after a dot-drawn flower. Made only of dots,
// densest along petal edges and midribs, sparse on the back petals. Three
// quarter view, bottom right. ----
const FL = { x: 96, y: 92, s: 0.74 };
// [centre x, centre y, length, width, angle, opacity], in the flower's frame.
const petals = [
  [-34, -6, 31, 7.5, 172, 1],     // the long sweep to the left
  [-22, 22, 31, 5.5, 132, 0.95],  // the thin one falling down left
  [26, -9, 22, 12, -18, 1],       // the big petal curling right
  [24, -31, 20, 10, -52, 0.7],    // upper right
  [2, -31, 16, 22, -84, 0.5],     // the back petal, behind the stamens
  [-22, -21, 17, 10, -150, 0.6],  // upper left
  [22, 20, 22, 6.5, 38, 0.8],     // the sweep down right
  [3, 31, 14, 22, 95, 0.42],      // the lower petal, mostly air
];
const stamens = Array.from({ length: 24 }, (_, i) => {
  const a = ((-152 + (i / 23) * 124 + (rnd() - 0.5) * 8) * Math.PI) / 180;
  const len = 9 + rnd() * 8;
  return { a, len };
});
const flStem = [[6, 18], [10, 44], [15, 62]];

function blossom(X, Y) {
  const fx = (X - FL.x) / FL.s, fy = (Y - FL.y) / FL.s;
  const rad = Math.hypot(fx, fy);
  if (rad > 72) return null;

  let I = 0;
  for (const [cx, cy, rx, ry, a, op] of petals) {
    const e = ell(fx, fy, cx, cy, rx, ry, a);
    if (e.d >= 1) continue;
    // Dots gather in a band along the rim, measured in cells so a thin
    // petal becomes one dotted stroke and a wide one keeps a sparse inside,
    // plus a midrib that fades to the tip.
    const toEdge = (1 - e.d) * Math.min(rx, ry) * FL.s;
    let v = toEdge < 1.7 ? 0.95 : 0.2;
    if (Math.abs(e.v) * ry * FL.s < 0.9 && Math.abs(e.u) < 0.85) v = Math.max(v, 0.55 + 0.4 * (1 - Math.abs(e.u)));
    I = Math.max(I, v * op) + 0.08 * v * op;
  }
  const cup = ell(fx, fy, 0, 2, 12, 7.5, -8);
  if (cup.d < 1) I = Math.max(I, 0.4 + 0.55 * (1 - cup.d));

  // Stamens: dotted filaments with a pollen-yellow anther at the tip.
  for (const s of stamens) {
    const tx = Math.cos(s.a) * s.len, ty = Math.sin(s.a) * s.len - 2;
    if (Math.hypot(fx - tx, fy - ty) < 1.3) return ["•", "y"];
    if (segDist(fx, fy, [[0, -1], [tx, ty]]) < 0.55 && rnd() < 0.7) return ["·", "k"];
  }

  // The stem, thinning to nothing.
  const sd = segDist(fx, fy, flStem);
  if (sd < 1.4 && fy > 14) I = Math.max(I, 0.7 * Math.max(0, 1 - (fy - 14) / 52));

  // Further out, the dots thin, as in a stipple drawing.
  I *= Math.max(0.35, 1 - Math.max(0, rad - 28) / 60);
  if (I <= 0.06 || rnd() > Math.min(1, I * 0.95)) return null;
  return [I > 0.8 ? "•" : I > 0.4 ? "·" : ".", "k"];
}

// ---- Build the grid ----
const grid = Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => [" ", ""]));
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    const X = c + 0.5, Y = (r + 0.5) * ROW_H;
    const hit = bee(X, Y, r, c) || blossom(X, Y);
    if (hit) grid[r][c] = hit;
  }
}

// A faint trail of pollen from the anthers towards the bee.
const B = { x: BEE.x + 39 * BEE.s, y: BEE.y + 42 * BEE.s };
const P0 = [FL.x - 2, FL.y - 10], P1 = [72, 50], P2 = [B.x + 14, B.y + 6];
for (let i = 0; i < 52; i++) {
  const t = 0.06 + (i / 52) * 0.88;
  const x = (1 - t) ** 2 * P0[0] + 2 * (1 - t) * t * P1[0] + t * t * P2[0] + (rnd() - 0.5) * 8;
  const y = (1 - t) ** 2 * P0[1] + 2 * (1 - t) * t * P1[1] + t * t * P2[1] + (rnd() - 0.5) * 10;
  const c = Math.round(x - 0.5), r = Math.round(y / ROW_H - 0.5);
  if (r >= 0 && r < ROWS && c >= 0 && c < COLS && grid[r][c][0] === " ") grid[r][c] = [rnd() < 0.25 ? "*" : rnd() < 0.5 ? "·" : ".", "y"];
}

// ---- Annotations, drawn over the art like a specimen poster ----
const put = (r, c, ch, cls = "a") => { if (r >= 0 && r < ROWS && c >= 0 && c < COLS) grid[r][c] = [ch, cls]; };
const text = (r, c, s, cls = "a") => [...s].forEach((ch, i) => put(r, c + i, ch, cls));
const box = (r0, c0, r1, c1) => {
  for (let c = c0 + 1; c < c1; c++) { put(r0, c, "─"); put(r1, c, "─"); }
  for (let r = r0 + 1; r < r1; r++) { put(r, c0, "│"); put(r, c1, "│"); }
  put(r0, c0, "┌"); put(r0, c1, "┐"); put(r1, c0, "└"); put(r1, c1, "┘");
};
const dotted = (r0, c0, r1, c1, every = 2) => {
  const n = Math.max(Math.abs(r1 - r0), Math.abs(c1 - c0));
  for (let i = 1; i < n; i += every) put(Math.round(r0 + ((r1 - r0) * i) / n), Math.round(c0 + ((c1 - c0) * i) / n), "·");
};

box(5, 1, 36, 66);
box(46, 84, 60, 108);
dotted(36, 66, 46, 84);
dotted(5, 66, 3, 69, 1);
text(2, 70, "object (1)");
text(5, 70, "bee.ascii");
text(6, 70, "carrying");
text(7, 70, "pollen");
dotted(53, 84, 53, 43, 1);
text(50, 28, "object (2)");
text(53, 28, "blossom.ascii");
text(54, 28, "the nectar");
text(55, 28, "is found");
text(72, 40, "pollen,");
text(73, 40, "in flight");

// ---- Serialise: runs of one class become one span. Squares come from a
// fallback font, so each is pinned to one cell width; debris squares also
// blink on their own delays. ----
const SQUARES = "■□▪▫";
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
let out = "";
let blink = 0;
for (const row of grid) {
  let line = "", run = "", runCls = null;
  const flush = () => {
    if (!run) return;
    line += runCls ? `<span class="${runCls}">${esc(run)}</span>` : esc(run);
    run = "";
  };
  for (const [ch, cls] of row) {
    if (SQUARES.includes(ch)) {
      flush(); runCls = null;
      const delay = cls.endsWith(" g") ? ` style="--d:${((blink++ * 0.37) % 4).toFixed(2)}s"` : "";
      line += `<span class="${cls} sq"${delay}>${ch}</span>`;
      continue;
    }
    const k = ch === " " ? null : cls;
    if (k !== runCls) { flush(); runCls = k; }
    run += ch;
  }
  flush();
  out += line.replace(/\s+$/, "") + "\n";
}

// The live pollen leaves from the anthers and heads for the bee's thorax.
const dust = [FL.x, (FL.y - 9) / ROW_H, B.x, B.y / ROW_H].map((n) => n.toFixed(1)).join(",");
const art = `<div class="pg-art" data-dust="${dust}" data-cols="${COLS}" data-rows="${ROWS}"><pre class="pg-ascii" aria-hidden="true">${out.replace(/\n+$/, "")}</pre><pre class="pg-ascii pg-dust" aria-hidden="true"></pre></div>`;

const page = path.resolve(__dirname, "../../projects/paraga-mitra.html");
const html = fs.readFileSync(page, "utf8");
if (!/<!-- ASCII-BEE -->[\s\S]*?<!-- \/ASCII-BEE -->/.test(html)) throw new Error("ASCII-BEE markers not found in " + page);
fs.writeFileSync(page, html.replace(/(<!-- ASCII-BEE -->)[\s\S]*?(<!-- \/ASCII-BEE -->)/, (_, a, b) => a + art + b));
console.log(`ascii scene written: ${COLS}x${ROWS}, ${COLS * ROWS} cells`);
