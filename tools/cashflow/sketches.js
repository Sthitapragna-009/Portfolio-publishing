// Rough brainstorm screens for the Khatiq case study: pencil wireframes of what was tried,
// with handwritten notes, red crosses on what was dropped and a circle on what survived.
// Redrawn from the week's real dead ends: the red banner, the takeover, the bill calendar,
// chat first, the bank-branded home with its big white button, the overloaded home.
const e = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "’");

// deterministic wobble, so every build draws the same "hand"
let seed = 7;
const rnd = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};
const j = (n = 1.6) => (rnd() - 0.5) * 2 * n;

/** A pencil line: drawn twice, each pass slightly off, with a bow in the middle. */
function line(x1, y1, x2, y2, cls = "kqs-ink", passes = 2) {
  let d = "";
  for (let p = 0; p < passes; p++) {
    const mx = (x1 + x2) / 2 + j(2.2);
    const my = (y1 + y2) / 2 + j(2.2);
    d += `M${(x1 + j()).toFixed(1)},${(y1 + j()).toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${(x2 + j()).toFixed(1)},${(y2 + j()).toFixed(1)} `;
  }
  return `<path class="${cls}" d="${d}"/>`;
}
const box = (x, y, w, h, cls = "kqs-ink") => line(x, y, x + w, y, cls) + line(x + w, y, x + w, y + h, cls) + line(x + w, y + h, x, y + h, cls) + line(x, y + h, x, y, cls);
/** Scribbled text: a few wavy strokes standing in for words. */
function text(x, y, w, rows = 1, gap = 9, cls = "kqs-soft") {
  let out = "";
  for (let r = 0; r < rows; r++) {
    const ww = r === rows - 1 && rows > 1 ? w * (0.45 + rnd() * 0.3) : w * (0.8 + rnd() * 0.2);
    let d = `M${x},${y + r * gap}`;
    for (let k = 1; k <= 6; k++) d += ` L${(x + (ww * k) / 6).toFixed(1)},${(y + r * gap + j(1.4)).toFixed(1)}`;
    out += `<path class="${cls}" d="${d}"/>`;
  }
  return out;
}
const fill = (x, y, w, h, cls) => {
  let out = "";
  for (let k = 0; k < h; k += 4) out += line(x + 2, y + k + 2, x + w - 2, y + k + 2, cls, 1);
  return out;
};
const circ = (cx, cy, r, cls = "kqs-ink") => {
  let d = "";
  for (let p = 0; p < 2; p++) {
    d += `M${cx + r + j()},${cy + j()} `;
    for (let a = 30; a <= 360; a += 30) {
      const t = (a * Math.PI) / 180;
      d += `L${(cx + (r + j(1.2)) * Math.cos(t)).toFixed(1)},${(cy + (r + j(1.2)) * Math.sin(t)).toFixed(1)} `;
    }
  }
  return `<path class="${cls}" d="${d}"/>`;
};

/** One phone on the page: frame, contents, title under it and a verdict. */
function phone(x, y, body, title, note, kept) {
  const W = 132;
  const H = 250;
  let s = box(x, y, W, H) + line(x + 50, y + 12, x + 82, y + 12, "kqs-soft", 1);
  s += body(x + 10, y + 26, W - 20);
  s += `<text class="kqs-title" x="${x}" y="${y + H + 30}">${e(title)}</text>`;
  if (kept) {
    s += circ(x + W / 2, y + H / 2, 92, "kqs-green");
    s += `<text class="kqs-note is-green" x="${x}" y="${y + H + 56}">${e(note)}</text>`;
  } else {
    s += line(x - 6, y - 6, x + W + 6, y + H + 6, "kqs-red") + line(x + W + 6, y - 6, x - 6, y + H + 6, "kqs-red");
    s += `<text class="kqs-note" x="${x}" y="${y + H + 56}">${e(note)}</text>`;
  }
  return s;
}

function sketches() {
  seed = 7;
  const frames = [
    [
      (x, y, w) => fill(x, y, w, 34, "kqs-red-soft") + box(x, y, w, 34, "kqs-red") + `<text class="kqs-hand is-red" x="${x + 6}" y="${y + 23}">RENT MAY BOUNCE!</text>` + text(x, y + 52, w, 3) + box(x, y + 90, w, 60) + text(x + 8, y + 108, w - 16, 3),
      "Red banner",
      "panic, not help",
      false,
    ],
    [
      (x, y, w) => text(x, y + 6, w, 2) + fill(x - 6, y + 30, w + 12, 150, "kqs-shade") + box(x + 4, y + 50, w - 8, 110) + `<text class="kqs-hand" x="${x + 12}" y="${y + 80}">Low balance</text>` + text(x + 12, y + 96, w - 30, 2) + box(x + 14, y + 128, w - 28, 20),
      "Full-screen takeover",
      "looks like a scam alert",
      false,
    ],
    [
      (x, y, w) => {
        let s = `<text class="kqs-hand" x="${x}" y="${y + 10}">November</text>`;
        for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) s += box(x + c * (w / 5), y + 22 + r * 24, w / 5, 24, "kqs-soft");
        s += circ(x + w / 5 + 12, y + 34, 5, "kqs-red") + circ(x + (3 * w) / 5 + 12, y + 34, 5, "kqs-ink");
        return s + text(x, y + 160, w, 2);
      },
      "Calendar of bills",
      "you still do the maths",
      false,
    ],
    [
      (x, y, w) => box(x + 30, y + 4, w - 30, 26) + text(x + 36, y + 17, w - 44, 1) + box(x, y + 40, w - 24, 44) + text(x + 6, y + 54, w - 36, 3) + box(x + 30, y + 94, w - 30, 26) + text(x + 36, y + 107, w - 44, 1) + box(x, y + 160, w, 22) + `<text class="kqs-hand is-small" x="${x + 6}" y="${y + 175}">Ask Seth…</text>`,
      "Chat first",
      "hides the answer",
      false,
    ],
    [
      (x, y, w) => fill(x - 6, y - 4, w + 12, 70, "kqs-shade") + `<text class="kqs-hand" x="${x}" y="${y + 18}">Deccan</text>` + text(x, y + 34, w * 0.6, 1) + fill(x, y + 92, w, 30, "kqs-solid") + `<text class="kqs-hand is-white" x="${x + 10}" y="${y + 112}">SEE 3 WAYS →</text>` + text(x, y + 140, w, 3),
      "One bank’s home, big button",
      "button shouts; only one bank",
      false,
    ],
    [
      (x, y, w) => {
        let s = "";
        for (let r = 0; r < 6; r++) s += box(x, y + r * 30, w / 2 - 3, 24, "kqs-soft") + box(x + w / 2 + 3, y + r * 30, w / 2 - 3, 24, "kqs-soft") + text(x + 4, y + r * 30 + 12, w / 2 - 12, 1) + text(x + w / 2 + 7, y + r * 30 + 12, w / 2 - 12, 1);
        return s;
      },
      "Everything on home",
      "49 bits of text",
      false,
    ],
    [
      (x, y, w) =>
        `<text class="kqs-hand" x="${x}" y="${y + 10}">₹88,720</text>` +
        line(x, y + 22, x + w, y + 22) +
        circ(x + 10, y + 44, 8) + circ(x + 38, y + 44, 8) + circ(x + 66, y + 44, 8) + circ(x + 94, y + 44, 8) +
        box(x, y + 70, w, 84) + text(x + 8, y + 88, w - 40, 2) + circ(x + w - 18, y + 92, 11, "kqs-red") + text(x + 8, y + 136, 40, 1, 9, "kqs-ink"),
      "All money, one calm card",
      "one sentence, three ways out",
      true,
    ],
    [
      (x, y, w) => {
        let s = box(x + 8, y + 24, w - 16, 130) + `<text class="kqs-hand" x="${x + 18}" y="${y + 58}">₹1,059</text>` + text(x + 18, y + 74, w - 50, 1) + box(x + 18, y + 104, w - 36, 22);
        return s + `<text class="kqs-hand is-small" x="${x + 28}" y="${y + 120}">Move ₹1,500</text>`;
      },
      "Watch: one number",
      "the shortest version wins",
      true,
    ],
  ];
  const colW = 1200 / 4;
  let body = "";
  frames.forEach(([draw, title, note, kept], i) => {
    const x = 60 + (i % 4) * colW;
    const y = 40 + Math.floor(i / 4) * 390;
    body += phone(x, y, draw, title, note, kept);
  });
  // the margin note that turned the week
  body += `<text class="kqs-hand is-margin" x="60" y="800">the crossed ones all said what happened. none said what to do.</text>`;
  return `<svg class="sk" viewBox="0 0 1200 820" role="img" aria-label="Rough sketches from the week. Crossed out: a red banner saying rent may bounce, which caused panic; a full-screen takeover that looked like a scam alert; a calendar of bills that still left the maths to you; chat first, which hid the answer behind a question; one bank's home with a big button that shouted; and a home with everything on it, 49 bits of text. Kept: an all-money home with one calm card, and a watch screen with just the number and one action. A margin note reads: all of these said what happened, none said what to do.">${body}</svg>`;
}

module.exports = { sketches };
