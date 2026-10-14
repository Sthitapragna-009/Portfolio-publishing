// Generates the ASCII bee for projects/paraga-mitra.html.
// A profile bee built from simple shapes, shaded with a character ramp, with
// the body dissolving into yellow and black squares towards the right, after
// the dot-matrix bee on the project's moodboard.
//
//   node tools/parag/ascii-bee.js
//
// Writes the <pre> into projects/paraga-mitra.html, between the
// ASCII-BEE markers in the page header.

const COLS = 112;
const ROWS = 62;
// World space is 100 x 100. Monospace cells are ~0.6 as wide as they are tall.
const sx = 100 / COLS;
const sy = 100 / ROWS;

// Deterministic randomness, so the art is the same on every build.
let seed = 20261015;
const rnd = () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// Signed "inside-ness" of a rotated ellipse: <1 inside, 0 at centre.
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
    const px = ax + t * vx - x, py = ay + t * vy - y;
    best = Math.min(best, Math.hypot(px, py));
  }
  return best;
}

const RAMP = " .:-=+*#%@";
// k^0.6 pushes the body towards the dense end of the ramp, so it reads at small sizes.
const shade = (k) => RAMP[Math.max(1, Math.min(RAMP.length - 1, Math.round(Math.pow(Math.max(0, k), 0.6) * (RAMP.length - 1))))];
const SQUARES = "■□▪▫";

const legs = [
  [[38, 52], [31, 64], [33, 74]],
  [[45, 55], [45, 68], [49, 79]],
  [[52, 57], [57, 69], [56, 77]],
];
const antennae = [
  [[20, 30], [12, 22], [4, 19]],
  [[23, 29], [18, 18], [12, 12]],
];
const veins = [
  [[47, 33], [66, 20], [86, 13]],
  [[50, 35], [72, 28], [90, 24]],
  [[60, 26], [64, 33]],
  [[72, 20], [76, 29]],
];

// grid of [char, cls]
const grid = [];
for (let r = 0; r < ROWS; r++) {
  const row = [];
  for (let c = 0; c < COLS; c++) {
    const x = (c + 0.5) * sx, y = (r + 0.5) * sy;
    // How far into the dissolve this cell is: 0 on the left, 1 at the far right.
    const decay = Math.max(0, (x - 55) / 45) * 0.9 + Math.max(0, (y - 62) / 38) * 0.6;
    let ch = " ", cls = "";

    const head = ell(x, y, 24, 38, 9, 10, -10);
    const eye = ell(x, y, 20, 36, 4, 6.5, -10);
    const thorax = ell(x, y, 39, 42, 13.5, 13, -15);
    const abd = ell(x, y, 63, 59, 21, 14, 32);
    const wing1 = ell(x, y, 66, 22, 27, 9.5, -18);
    const wing2 = ell(x, y, 68, 32, 23, 7.5, -8);

    if (abd.d < 1) {
      // Bands along the long axis, broken up by the dissolve.
      const band = Math.floor((abd.u + 1) * 3.2) % 2 === 1;
      const k = 1 - abd.d * 0.7;
      ch = shade(k * (0.75 + rnd() * 0.25));
      cls = band ? "y" : "k";
      if (rnd() < decay * 0.55) { ch = rnd() < 0.5 ? "■" : "▪"; cls = rnd() < 0.6 ? "y" : "k"; }
    } else if (thorax.d < 1) {
      ch = shade((1 - thorax.d * 0.55) * (0.8 + rnd() * 0.2));
      // Yellow fuzz on the upper back.
      cls = thorax.v < -0.15 && rnd() < 0.55 ? "y" : "k";
    } else if (eye.d < 1) {
      ch = "@"; cls = "k";
    } else if (head.d < 1) {
      ch = shade((1 - head.d * 0.6) * (0.75 + rnd() * 0.25));
      cls = "k";
    } else if (segDist(x, y, veins[0]) < 0.7 || segDist(x, y, veins[1]) < 0.7 || segDist(x, y, veins[2]) < 0.6 || segDist(x, y, veins[3]) < 0.6) {
      if (wing1.d < 1 || wing2.d < 1) { ch = "+"; cls = "w"; }
    } else if (wing1.d < 1 || wing2.d < 1) {
      // Wings: a sparse lattice, denser near the edge.
      const edge = Math.max(wing1.d < 1 ? wing1.d : 0, wing2.d < 1 ? wing2.d : 0);
      if ((r + c) % 2 === 0 && rnd() < 0.55 + edge * 0.4) { ch = edge > 0.85 ? ":" : "."; cls = "w"; }
    }

    if (ch === " ") {
      if (legs.some((l) => segDist(x, y, l) < 0.85)) { ch = rnd() < 0.5 ? "%" : "#"; cls = "k"; }
      else if (antennae.some((l) => segDist(x, y, l) < 0.6)) { ch = rnd() < 0.6 ? ":" : "."; cls = "k"; }
    }

    // Debris: squares thrown off to the right and below, plus dotted drips.
    if (ch === " ") {
      const near = Math.exp(-((x - 66) ** 2 / 900 + (y - 50) ** 2 / 700));
      const p = near * (0.05 + decay * 0.18);
      if (rnd() < p) {
        const pick = rnd();
        ch = pick < 0.35 ? "■" : pick < 0.6 ? "□" : pick < 0.85 ? "▪" : "▫";
        cls = rnd() < 0.55 ? "y g" : "k g";
      } else if ((c === 60 || c === 61) && y > 66 && rnd() < 0.8) {
        ch = ":"; cls = "y";
      } else if ((c === 45 || c === 84 || c === 92) && y > 60 && y < 95 && rnd() < 0.45) {
        ch = "."; cls = "w";
      }
    }
    row.push([ch, cls]);
  }
  grid.push(row);
}

// Collapse runs of the same class into spans. Squares stay single: they come
// from a fallback font, so each is pinned to one cell width, and debris
// squares blink on their own delays.
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

const fs = require("fs");
const path = require("path");
const page = path.resolve(__dirname, "../../projects/paraga-mitra.html");
const html = fs.readFileSync(page, "utf8");
const pre = `<pre class="pg-ascii" aria-hidden="true">${out.replace(/\n+$/, "")}</pre>`;
if (!/<!-- ASCII-BEE -->[\s\S]*?<!-- \/ASCII-BEE -->/.test(html)) throw new Error("ASCII-BEE markers not found in " + page);
fs.writeFileSync(page, html.replace(/(<!-- ASCII-BEE -->)[\s\S]*?(<!-- \/ASCII-BEE -->)/, (_, a, b) => a + pre + b));
console.log(`ascii bee written: ${COLS}x${ROWS}`);
