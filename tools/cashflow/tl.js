// Timeline-style diagrams for the Khatiq case study, after the user's reference:
// a light panel, an eyebrow, a square-type title with a rule, dashed column guides,
// black rounded bars, small grey labels under them and round-dot lists below.
// One builder draws the project timeline, the journey map and the information architecture.
const e = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "’");

/** Panel header: eyebrow, title, rule, chapter number. */
const head = (eyebrow, title, num) => `<header class="kqt-head">
    <div><p class="kqt-eyebrow">${e(eyebrow)}</p><h3 class="kqt-title">${e(title)}</h3></div>
    ${num ? `<span class="kqt-num">${e(num)}</span>` : ""}
  </header>`;

/**
 * rows: [{ bars: [{ s, e, label, note }] } | { gap: '1.2rem' } | { labels: [{ c, text }] }
 *        | { lists: [{ c, span, items: [html] }] } | { strip: html }]
 * Columns are 1-based; e is exclusive, like CSS grid lines.
 */
function grid(cols, rows, label, minCol = 100) {
  const tracks = rows.map((r) => (r.gap ? r.gap : "auto")).join(" ");
  let cells = "";
  // dashed guides: one at every column line, running the full height
  for (let c = 1; c <= cols + 1; c++) cells += `<span class="kqt-guide${c === 1 || c === cols + 1 ? " is-edge" : ""}" style="grid-column:${Math.min(c, cols)};grid-row:1 / -1;${c === cols + 1 ? "justify-self:end" : ""}" aria-hidden="true"></span>`;
  rows.forEach((r, i) => {
    const row = i + 1;
    if (r.bars)
      r.bars.forEach((b) => {
        cells += `<div class="kqt-bar" style="grid-column:${b.s} / ${b.e};grid-row:${row}"><span>${e(b.label)}</span>${b.note ? `<small>${e(b.note)}</small>` : ""}</div>`;
      });
    if (r.labels) r.labels.forEach((l) => (cells += `<span class="kqt-date" style="grid-column:${l.c};grid-row:${row}">${e(l.text)}</span>`));
    if (r.lists)
      r.lists.forEach((l) => {
        cells += `<ul class="kqt-list" style="grid-column:${l.c} / span ${l.span || 1};grid-row:${row}">${l.items.map((it) => `<li>${it}</li>`).join("")}</ul>`;
      });
    if (r.strip) cells += `<div class="kqt-strip" style="grid-column:1 / -1;grid-row:${row}">${r.strip}</div>`;
  });
  return `<div class="kqt-scroll"><div class="kqt-grid" role="group" aria-label="${e(label)}" style="--cols:${cols};--min:${cols * minCol}px;grid-template-rows:${tracks}">${cells}</div></div>`;
}

/* ---------- 1. the week, as a project timeline ---------- */
function projectTimeline(num) {
  const days = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"];
  const L = (xs) => xs.map(e);
  return `<div class="kqt">${head("Seven days, solo", "Timeline", num)}${grid(
    7,
    [
      { bars: [{ s: 1, e: 2, label: "Research" }] },
      { bars: [{ s: 2, e: 3, label: "Define" }] },
      { bars: [{ s: 3, e: 4, label: "Ideate" }] },
      { bars: [{ s: 4, e: 8, label: "Design and build" }] },
      { bars: [{ s: 6, e: 8, label: "Review" }] },
      { gap: "1.4rem" },
      { labels: days.map((t, i) => ({ c: i + 1, text: t })) },
      {
        lists: [
          { c: 1, items: L(["Bank alerts today", "UPI autopay and NACH", "Published surveys", "Account Aggregator"]) },
          { c: 2, items: L(["Journey map", "Jobs to be done", "Emotion goals"]) },
          { c: 3, items: L(["Brainstorm", "Rough screens", "Information architecture"]) },
          { c: 4, span: 2, items: L(["Coded prototype", "Design system", "Folding phone, iPad, Watch"]) },
          { c: 6, span: 2, items: L(["Heuristic review", "Design critique", "Case study"]) },
        ],
      },
    ],
    "Project timeline over seven days: research on day 1, define on day 2, ideate on day 3, design and build from day 4 to 7, review on days 6 and 7.",
  )}</div>`;
}

/* ---------- 2. the journey map ---------- */
const PHASES = [
  { name: "Notice", when: "29 Oct", does: "Checks the balance", thinks: "Will rent clear before salary?", today: -1, app: 1, pain: "Doing the maths across two apps", opp: "Show the gap before anyone goes looking" },
  { name: "Worry", when: "1 Nov, 7 am", does: "Reads the bank’s SMS", thinks: "What does ‘return charges’ mean?", today: -3, app: 0, pain: "Decoding jargon under stress", opp: "Say it in one plain sentence", truth: true },
  { name: "Decide", when: "1 Nov", does: "Weighs savings, a loan app, a friend", thinks: "Which one costs me least?", today: -2, app: 1, pain: "Comparing costs nobody shows", opp: "Show every cost before choosing" },
  { name: "Act", when: "1–2 Nov", does: "Moves money or calls the landlord", thinks: "Did it actually go through?", today: -1, app: 2, pain: "Waiting with no status", opp: "Named steps and a time, never a spinner" },
  { name: "Relief", when: "3 Nov", does: "Salary lands, rent clears", thinks: "Will this happen next month?", today: 0, app: 3, pain: "No memory of what worked", opp: "End with the next date to watch", truth: true },
];

function feelStrip() {
  const W = 1000;
  const H = 120;
  const col = W / PHASES.length;
  const y = (v) => H / 2 - v * (H / 7.4);
  const pts = (k) => PHASES.map((p, i) => [col * i + col / 2, y(p[k])]);
  const path = (k) =>
    pts(k)
      .map(([x, yy], i, a) => {
        if (!i) return `M${x},${yy}`;
        const [px, py] = a[i - 1];
        const cx = (px + x) / 2;
        return `C${cx},${py} ${cx},${yy} ${x},${yy}`;
      })
      .join(" ");
  return `<div class="kqt-feel">
      <p class="kqt-feel-k"><span>Feels</span><span><i class="is-app"></i>With Khatiq</span><span><i class="is-today"></i>Today</span></p>
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
        <line x1="0" x2="${W}" y1="${H / 2}" y2="${H / 2}" class="kqt-feel-zero" />
        <path d="${path("today")}" class="kqt-feel-today" />
        <path d="${path("app")}" class="kqt-feel-app" />
        ${pts("today").map(([x, yy]) => `<circle cx="${x}" cy="${yy}" r="5" class="kqt-feel-dot-today" />`).join("")}
        ${pts("app").map(([x, yy]) => `<circle cx="${x}" cy="${yy}" r="6.5" class="kqt-feel-dot-app" />`).join("")}
      </svg>
    </div>`;
}

function journeyMap(num) {
  const item = (k, v) => `<small>${k}</small>${e(v)}`;
  return `<div class="kqt kqt--journey">${head("Arjun, Bengaluru · rent due two days before salary", "Journey map", num)}${grid(
    5,
    [
      ...PHASES.map((p, i) => ({ bars: [{ s: i + 1, e: i + 2, label: p.name, note: p.truth ? "Moment of truth" : "" }] })),
      { gap: "1.4rem" },
      { labels: PHASES.map((p, i) => ({ c: i + 1, text: p.when })) },
      { strip: feelStrip() },
      { lists: PHASES.map((p, i) => ({ c: i + 1, items: [item("Does", p.does), item("Thinks", `“${p.thinks}”`), item("Pain", p.pain), item("Opportunity", p.opp)] })) },
    ],
    "Journey map in five phases. Notice on 29 October: checks the balance, wonders if rent will clear; pain, doing the maths across two apps. Worry on 1 November, a moment of truth: reads the bank SMS about return charges; pain, decoding jargon. Decide: weighs savings, a loan app or a friend; pain, nobody shows the costs. Act on 1 to 2 November: moves money or calls the landlord; pain, waiting with no status. Relief on 3 November, a moment of truth: salary lands and rent clears; pain, no memory of what worked. Feeling today falls to its lowest at Worry; with Khatiq it stays at or above neutral and ends highest at Relief.",

  )}</div>`;
}

/* ---------- 3. information architecture ---------- */
function iaMap(num) {
  const T = [
    ["Home", "Tab", ["All your money", "A bank’s home", "Ways to cover rent", "Confirm, moving, done", "Bank words, explained", "Notifications"]],
    ["Accounts", "Tab", ["Accounts by bank", "An account", "Activity", "One payment", "Link a bank"]],
    ["Scan", "Centre button", ["Scan a QR", "Amount", "UPI PIN", "Paid"]],
    ["Pay", "Tab", ["People and bills", "Autopays", "The rent autopay"]],
    ["Insights", "Tab", ["Six months", "Worth a look", "Where it went", "Goals"]],
    ["Profile", "Avatar, top right", ["Cash-flow cards", "Autopays", "Linked banks and consents", "App PIN and fingerprint", "Language", "Talk to a person"]],
  ];
  return `<div class="kqt kqt--ia">${head("Where everything lives", "Information architecture", num)}${grid(
    6,
    [
      { bars: [{ s: 1, e: 7, label: "Onboarding", note: "Welcome · salary bank · mobile number · code · app PIN · notifications" }] },
      { gap: "0.9rem" },
      { bars: T.map(([n], i) => ({ s: i + 1, e: i + 2, label: n })) },
      { labels: T.map(([, k], i) => ({ c: i + 1, text: k })) },
      { lists: T.map(([, , items], i) => ({ c: i + 1, items: items.map(e) })) },
      { gap: "0.9rem" },
      { bars: [{ s: 1, e: 7, label: "From any card", note: "Why am I seeing this? · Ask Seth · Talk to a person" }] },
    ],
    "Information architecture. Onboarding leads into five tabs and a profile behind the avatar. Home: all your money, a bank's home, ways to cover rent, confirm, moving and done, bank words explained, notifications. Accounts: accounts by bank, an account, activity, one payment, link a bank. Scan, the centre button: scan a QR, amount, UPI PIN, paid. Pay: people and bills, autopays, the rent autopay. Insights: six months, worth a look, where it went, goals. Profile, from the avatar: cash-flow cards, autopays, linked banks and consents, app PIN and fingerprint, language, talk to a person. From any card: why am I seeing this, ask Seth, talk to a person.",

  )}</div>`;
}

module.exports = { projectTimeline, journeyMap, iaMap, head };
