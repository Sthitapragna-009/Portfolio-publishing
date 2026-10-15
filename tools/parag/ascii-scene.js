// Generates the ASCII header scene for projects/paraga-mitra.html: the
// dot-matrix bee from the moodboard (dense shading, yellow bands, its tail
// dissolving into squares) flying towards a blossom filled with digits.
//
// The page script (assets/parag/parag.js) reads the art back out of the
// <pre> and animates it: pollen floating up from the flower, more of it
// shaken loose under the cursor, and faint ripples where the cursor passes.
//
//   node tools/parag/ascii-scene.js
//
// Writes into the page between the ASCII-BEE markers in the header.

const fs = require("fs");
const path = require("path");

const COLS = 136;
const ROWS = 92;
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
// frame, placed top right, facing left towards the flower. ----
const BEE = { x: 44, y: -5, s: 0.9 };
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
  // How far into the dissolve: 0 at the head, 1 at the far right.
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

// ---- The blossom, filled with digits like a number drawing: bright rims
// and midribs, a fuller body, a darker heart. Bottom left. ----
const FL = { x: 42, y: 106, s: 0.72 };
// [centre x, centre y, length, width, angle, opacity], in the flower's frame.
const petals = [
  [34, -6, 31, 7.5, 8, 1],        // the long sweep to the right
  [22, 22, 31, 5.5, 48, 0.95],    // the thin one falling down right
  [-26, -9, 22, 12, 198, 1],      // the big petal curling left
  [-24, -31, 20, 10, 232, 0.8],   // upper left
  [-2, -31, 16, 22, 264, 0.7],    // the back petal, behind the stamens
  [22, -21, 17, 10, 330, 0.75],   // upper right
  [-22, 20, 22, 6.5, 142, 0.85],  // the sweep down left
  [-3, 31, 14, 22, 85, 0.6],      // the lower petal
];
const stamens = Array.from({ length: 24 }, (_, i) => {
  const a = ((-152 + (i / 23) * 124 + (rnd() - 0.5) * 8) * Math.PI) / 180;
  const len = 9 + rnd() * 8;
  return { a, len };
});
const flStem = [[-6, 18], [-10, 44], [-15, 62]];
const DIGITS = "0123456789";
const digit = () => DIGITS[Math.floor(rnd() * 10)];

function blossom(X, Y) {
  const fx = (X - FL.x) / FL.s, fy = (Y - FL.y) / FL.s;
  const rad = Math.hypot(fx, fy);
  if (rad > 72) return null;

  // Stamens: dotted filaments with a pollen-yellow anther at the tip.
  for (const s of stamens) {
    const tx = Math.cos(s.a) * s.len, ty = Math.sin(s.a) * s.len - 2;
    if (Math.hypot(fx - tx, fy - ty) < 1.3) return ["•", "y"];
    if (segDist(fx, fy, [[0, -1], [tx, ty]]) < 0.55 && rnd() < 0.75) return ["·", "k"];
  }

  let I = 0;
  for (const [cx, cy, rx, ry, a, op] of petals) {
    const e = ell(fx, fy, cx, cy, rx, ry, a);
    if (e.d >= 1) continue;
    const toEdge = (1 - e.d) * Math.min(rx, ry) * FL.s;
    let v = toEdge < 1.6 ? 1 : 0.62;
    if (Math.abs(e.v) * ry * FL.s < 0.9 && Math.abs(e.u) < 0.85) v = Math.max(v, 0.8 + 0.2 * (1 - Math.abs(e.u)));
    I = Math.max(I, v * op);
  }
  // The heart sits in shadow: present, but darker and sparser.
  const cup = ell(fx, fy, 0, 2, 12, 7.5, 8);
  if (cup.d < 1) {
    if (rnd() > 0.55 + 0.35 * cup.d) return null;
    return [digit(), cup.d > 0.8 ? "kd" : "w"];
  }
  const sd = segDist(fx, fy, flStem);
  if (sd < 1.6 && fy > 14) I = Math.max(I, 0.85 * Math.max(0, 1 - (fy - 14) / 60));

  if (I <= 0.05 || rnd() > Math.min(1, 0.3 + I * 0.75)) return null;
  return [digit(), I > 0.85 ? "k" : I > 0.5 ? "kd" : "w"];
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

// ---- The meadow, drawn faint behind everything else: a few small flowers
// on thin stems, then grass along an uneven ground line. Both only fill
// empty cells, so the bee and the blossom stay on top. ----
const put = (r, c, ch, cls) => {
  if (r >= 0 && r < ROWS && c >= 0 && c < COLS && grid[r][c][0] === " ") grid[r][c] = [ch, cls];
};
const ground = (c) => ROWS - 2 + Math.round(Math.sin(c * 0.09 + 1.3) * 0.9);
// "@" is the yellow centre; everything else is a faint petal.
const SPRITES = [
  [" o ", "o@o", " o "],
  [" * ", "*@*", " ' "],
  ["(@)"],
  [".o.", "(@)", "'o'"],
];
// [column, head row, sprite]
const smalls = [[6, 80, 1], [18, 84, 3], [48, 86, 2], [76, 83, 0], [88, 79, 3], [101, 85, 1], [114, 81, 0], [127, 86, 2]];
const blooms = [];
for (const [c, r, k] of smalls) {
  const sp = SPRITES[k], h = sp.length, w = sp[0].length;
  sp.forEach((line, i) => [...line].forEach((ch, j) => {
    if (ch !== " ") put(r - (h >> 1) + i, c - (w >> 1) + j, ch, ch === "@" ? "ym" : "m");
  }));
  const leaf = 2 + Math.floor(rnd() * 3), side = rnd() < 0.5 ? -1 : 1;
  for (let y = r - (h >> 1) + h; y <= ground(c); y++) {
    put(y, c, "|", "m");
    if (y === r + leaf) put(y, c + side, side < 0 ? "\\" : "/", "m");
  }
  blooms.push([c, r]);
}
// Grass: thicker and taller around the blossom, thinning towards the right
// edge. On the left it runs straight on: the page script carries the meadow
// past the art to the left edge of the header, on the same ground line.
for (let c = 0; c < COLS; c++) {
  const x = c + 0.5;
  const edge = Math.min(1, (COLS - x) / 14);
  const near = Math.exp(-(((x - FL.x) / 38) ** 2));
  if (rnd() > (0.3 + 0.5 * near) * edge) continue;
  const h = 1 + Math.floor(rnd() * (2 + 5 * near));
  const lean = rnd() * 2 - 1;
  const g = ground(c);
  for (let k = 0; k < h; k++) {
    const col = c + Math.round(lean * k * 0.45);
    const ch = k === h - 1 && h > 1 ? (lean > 0 ? "'" : ",") : lean > 0.35 ? "/" : lean < -0.35 ? "\\" : "|";
    put(g - k, col, ch, "m");
  }
  if (rnd() < 0.5 * edge) put(g + 1, c, ".", "m");
}

// A few specks of pollen already in the air above the flower.
for (let i = 0; i < 36; i++) {
  const x = FL.x - 20 + rnd() * 60, y = FL.y - 62 + rnd() * 44;
  const c = Math.round(x - 0.5), r = Math.round(y / ROW_H - 0.5);
  if (r >= 0 && r < ROWS && c >= 0 && c < COLS && grid[r][c][0] === " ") grid[r][c] = [rnd() < 0.25 ? "*" : rnd() < 0.5 ? "·" : ".", "y"];
}

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

// What the page script needs, in cells: the flower (for the pollen shake),
// where pollen leaves from, and the small flowers the little bees visit.
const cell = ([x, y]) => [+(x - 0.5).toFixed(1), +(y / ROW_H - 0.5).toFixed(1)];
const scene = {
  cols: COLS,
  rows: ROWS,
  rowH: +ROW_H.toFixed(4),
  flower: { at: cell([FL.x, FL.y]), r: 38 },
  anthers: cell([FL.x, FL.y - 9]),
  blooms,
};
const art = `<div class="pg-art" data-scene='${JSON.stringify(scene)}'><pre class="pg-ascii" aria-hidden="true">${out.replace(/\n+$/, "")}</pre><pre class="pg-ascii pg-dust" aria-hidden="true"></pre></div>`;

const page = path.resolve(__dirname, "../../projects/paraga-mitra.html");
const html = fs.readFileSync(page, "utf8");
if (!/<!-- ASCII-BEE -->[\s\S]*?<!-- \/ASCII-BEE -->/.test(html)) throw new Error("ASCII-BEE markers not found in " + page);
fs.writeFileSync(page, html.replace(/(<!-- ASCII-BEE -->)[\s\S]*?(<!-- \/ASCII-BEE -->)/, (_, a, b) => a + art + b));
console.log(`ascii scene written: ${COLS}x${ROWS}, ${COLS * ROWS} cells`);
