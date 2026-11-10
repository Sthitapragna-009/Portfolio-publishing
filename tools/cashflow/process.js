// Process diagrams for the Khatiq case study, in the Easy CMS style: line work on a quiet canvas,
// one accent for the moment that matters, filled nodes for what was built and dashed ones for what was parked.
const e = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "’");

/** Today's loop: what happens every month the dates don't line up. */
function loop() {
  const cx = 560;
  const cy = 300;
  const r = 190;
  const nodes = [
    ["Rent autopay is set", "for the 1st of every month", ""],
    ["Salary lands on the 3rd", "two days later", ""],
    ["The autopay bounces", "on the 1st, before anyone notices", "is-hot"],
    ["An SMS arrives", "“NACH mandate returned unpaid”", ""],
    ["Bank charges, a late fee", "and a call to the landlord", "is-hot"],
    ["Next month, same dates", "nothing has changed", ""],
  ];
  const at = (i) => {
    const a = ((-90 + i * 60) * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a), Math.cos(a)];
  };
  const arcs = nodes
    .map((_, i) => {
      const a0 = ((-90 + i * 60 + 11) * Math.PI) / 180;
      const a1 = ((-90 + (i + 1) * 60 - 11) * Math.PI) / 180;
      const p = (a) => `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
      return `<path class="kq-loop-arc" d="M${p(a0)} A${r},${r} 0 0 1 ${p(a1)}" marker-end="url(#kq-arrow)" />`;
    })
    .join("");
  const marks = nodes
    .map(([t, s, cls], i) => {
      const [x, y, c] = at(i);
      const side = Math.abs(c) < 0.2 ? "middle" : c > 0 ? "start" : "end";
      const tx = side === "middle" ? x : x + (c > 0 ? 34 : -34);
      const ty = side === "middle" ? (y < cy ? y - 44 : y + 52) : y - 4;
      return `<g class="kq-loop-node ${cls}"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="20" /><text class="kq-loop-n" x="${x.toFixed(1)}" y="${(y + 5).toFixed(1)}">${i + 1}</text>
        <text class="kq-loop-t" x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" text-anchor="${side}">${e(t)}</text>
        <text class="kq-loop-s" x="${tx.toFixed(1)}" y="${(ty + 22).toFixed(1)}" text-anchor="${side}">${e(s)}</text></g>`;
    })
    .join("");
  return `<svg class="kq-loop" viewBox="0 0 1120 600" role="img" aria-label="Today's loop, every month the dates don't line up: rent autopay is set for the 1st; salary lands on the 3rd; the autopay bounces; an SMS arrives about a NACH mandate returned unpaid; bank charges and a late fee follow; next month the same dates repeat.">
    <defs><marker id="kq-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="kq-loop-head" /></marker></defs>
    ${arcs}
    <text class="kq-loop-big" x="${cx}" y="${cy + 6}">2 days</text>
    <text class="kq-loop-sub" x="${cx}" y="${cy + 36}">short, every month</text>
    ${marks}
  </svg>`;
}

/** Brainstorm: one idea, six directions. Filled leaves are in the prototype; dashed ones were parked or rejected. */
function mindMap() {
  const branches = [
    ["Warn early", "left", 90, [["3 days before", 1], ["One plain sentence", 1], ["Why am I seeing this?", 1]]],
    ["Offer ways out", "left", 270, [["Move from savings pot", 1], ["Pay on salary day", 1], ["Talk to a person", 1], ["Salary advance from a partner", 0]]],
    ["Keep trust", "left", 450, [["Passkey above ₹25,000", 1], ["Undo after a move", 1], ["Never a link or an OTP", 1]]],
    ["Across banks", "right", 90, [["Account Aggregator", 1], ["All-money home", 1], ["Each bank in its colours", 1]]],
    ["Everywhere", "right", 270, [["iPhone Duo rail", 1], ["iPad split view", 1], ["Watch complications", 1], ["Lock-screen widget", 0]]],
    ["An assistant", "right", 450, [["Answers with sources", 1], ["Never moves money alone", 1], ["Streaks and rewards", 0]]],
  ];
  const W = 1120;
  const cx = W / 2;
  const cy = 270;
  let svg = "";
  for (const [name, side, by, leaves] of branches) {
    const left = side === "left";
    const bx = left ? 360 : W - 360;
    const bw = 150;
    const nodeX = left ? bx - bw : bx;
    svg += `<path class="kq-mm-trunk" d="M${cx + (left ? -90 : 90)},${cy} C${(cx + bx) / 2},${cy} ${(cx + bx) / 2},${by} ${bx},${by}" />`;
    svg += `<rect class="kq-mm-branch" x="${nodeX}" y="${by - 20}" width="${bw}" height="40" rx="10" /><text class="kq-mm-bt" x="${nodeX + bw / 2}" y="${by + 6}">${e(name)}</text>`;
    const n = leaves.length;
    leaves.forEach(([t, on], i) => {
      const ly = by + (i - (n - 1) / 2) * 30;
      const lx = left ? nodeX - 44 : nodeX + bw + 44;
      svg += `<path class="kq-mm-twig" d="M${left ? nodeX : nodeX + bw},${by} C${left ? nodeX - 22 : nodeX + bw + 22},${by} ${left ? nodeX - 22 : nodeX + bw + 22},${ly} ${lx},${ly}" />`;
      svg += `<circle class="kq-mm-dot ${on ? "" : "is-parked"}" cx="${lx}" cy="${ly}" r="4" /><text class="kq-mm-leaf ${on ? "" : "is-parked"}" x="${left ? lx - 12 : lx + 12}" y="${ly + 5}" text-anchor="${left ? "end" : "start"}">${e(t)}</text>`;
    });
  }
  svg += `<rect class="kq-mm-core" x="${cx - 110}" y="${cy - 32}" width="220" height="64" rx="14" /><text class="kq-mm-ct" x="${cx}" y="${cy - 3}">Know early,</text><text class="kq-mm-ct" x="${cx}" y="${cy + 21}">act calmly</text>`;
  return `<svg class="kq-mm" viewBox="-110 0 ${W + 220} 560" role="img" aria-label="Brainstorm around know early, act calmly. Built: warn 3 days before in one plain sentence with why; ways out by moving from the savings pot, paying on salary day or talking to a person; trust through a passkey above ₹25,000, undo, and never a link or OTP; across banks through the Account Aggregator, an all-money home and each bank's colours; everywhere on iPhone Duo, iPad and Apple Watch; an assistant that answers with sources and never moves money alone. Parked: a partner salary advance and a lock-screen widget. Rejected: streaks and rewards.">${svg}</svg>
  <p class="kq-key"><span class="is-on"></span>In the prototype <span class="is-parked"></span>Parked or rejected</p>`;
}

/** Decisions on a day-by-day line. */
/** Decisions as a journey of colour tiles: soft fill, deeper Day label, same family as Konkan lavender. */
const TL_TONES = [
  ["#dcd8ff", "#4b3fc4"],
  ["#cfe5ff", "#1f5fa8"],
  ["#ffd9c9", "#a84a26"],
  ["#c9f0df", "#1b7a55"],
  ["#ffeaa8", "#7d5b00"],
];
function timeline(rows) {
  return `<ol class="kq-tl">${rows
    .map(
      ([day, was, now, why], i) => `<li style="--tile:${TL_TONES[i % TL_TONES.length][0]};--tile-deep:${TL_TONES[i % TL_TONES.length][1]}">
      <span class="kq-tl-day">${e(day)}</span>
      <span class="kq-tl-dot" aria-hidden="true"></span>
      <p class="kq-tl-was"><s>${e(was)}</s></p>
      <p class="kq-tl-now">${e(now)}</p>
      <p class="kq-tl-why">${e(why)}</p>
    </li>`,
    )
    .join("")}</ol>`;
}

module.exports = { loop, mindMap, timeline };
