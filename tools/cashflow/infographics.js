// Diagrams for the Cash-Flow Gap case study, as inline SVG and HTML (no FigJam).
// Colours come from the case study's own tokens (cashflow.css), so dark and light both work.
const e = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "’");

/* ---------- Journey map: one persona, one scenario, current state vs with the app ---------- */
const PHASES = [
  {
    name: "Notice",
    action: "Checks the balance on the 29th",
    think: "Will rent clear before salary?",
    today: -1, // feeling, -3 … +3
    withApp: 1,
    pain: "Doing the maths across two apps",
    opp: "Surface the gap before she goes looking",
  },
  {
    name: "Worry",
    action: "Opens the bank SMS about NACH",
    think: "What does ‘return charges’ mean?",
    today: -3,
    withApp: 0,
    pain: "Decoding jargon under stress",
    opp: "Say it in one plain sentence",
    truth: true,
  },
  {
    name: "Decide",
    action: "Weighs savings, a loan app, asking a friend",
    think: "Which one costs me least?",
    today: -2,
    withApp: 1,
    pain: "Comparing costs nobody shows",
    opp: "Show every option’s cost before choosing",
  },
  {
    name: "Act",
    action: "Moves money, or calls the landlord",
    think: "Did it actually go through?",
    today: -1,
    withApp: 2,
    pain: "Waiting with no status",
    opp: "Specific time and steps, never a spinner",
  },
  {
    name: "Relief",
    action: "Rent clears on the 1st",
    think: "Will this happen again next month?",
    today: 0,
    withApp: 3,
    pain: "No memory of what worked",
    opp: "Close with the next date to watch",
    truth: true,
  },
];

function journeyMap() {
  const W = 1000;
  const colW = W / PHASES.length;
  const H = 150;
  const y = (v) => H / 2 - v * (H / 7.5);
  const pts = (k) => PHASES.map((p, i) => [colW * i + colW / 2, y(p[k])]);
  const path = (k) =>
    pts(k)
      .map(([x, yy], i, a) => {
        if (!i) return `M${x},${yy}`;
        const [px, py] = a[i - 1];
        const cx = (px + x) / 2;
        return `C${cx},${py} ${cx},${yy} ${x},${yy}`;
      })
      .join(" ");
  const curve = `<svg class="cf-jm-curve" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Feeling at each phase. Today it falls to its lowest at Worry and only recovers to neutral. With the app it stays at or above neutral and ends at its highest, relief.">
      <line x1="0" x2="${W}" y1="${H / 2}" y2="${H / 2}" class="cf-jm-zero" />
      <path d="${path("today")}" class="cf-jm-today" />
      <path d="${path("withApp")}" class="cf-jm-app" />
      ${pts("today").map(([x, yy]) => `<circle cx="${x}" cy="${yy}" r="6" class="cf-jm-dot-today" />`).join("")}
      ${pts("withApp").map(([x, yy]) => `<circle cx="${x}" cy="${yy}" r="7" class="cf-jm-dot-app" />`).join("")}
    </svg>`;
  const row = (k, label, cls) => `
    <div class="cf-jm-row ${cls}">
      <span class="cf-jm-label">${label}</span>
      ${PHASES.map((p) => `<span class="cf-jm-cell">${e(p[k])}</span>`).join("")}
    </div>`;
  return `<div class="cf-jm" role="group" aria-label="Journey map: Arjun, rent due two days before salary">
    <div class="cf-jm-row cf-jm-phases">
      <span class="cf-jm-label">Phase</span>
      ${PHASES.map((p) => `<span class="cf-jm-cell"><b>${e(p.name)}</b>${p.truth ? '<em class="cf-jm-truth">Moment of truth</em>' : ""}</span>`).join("")}
    </div>
    ${row("action", "Does", "")}
    ${row("think", "Thinks", "cf-jm-think")}
    <div class="cf-jm-row cf-jm-feel">
      <span class="cf-jm-label">Feels<span class="cf-jm-key"><i class="k-today"></i>Today<i class="k-app"></i>With the app</span></span>
      <div class="cf-jm-curve-wrap">${curve}</div>
    </div>
    ${row("pain", "Pain", "cf-jm-pain")}
    ${row("opp", "Opportunity", "cf-jm-opp")}
  </div>`;
}

/* ---------- Context → Guidance → Action ---------- */
function cga() {
  const step = (n, title, line, eg, hue) => `<li class="cf-cga-step" style="--hue: var(--hue-${hue})">
      <span class="cf-cga-n">${n}</span>
      <h4>${e(title)}</h4>
      <p>${e(line)}</p>
      <p class="cf-cga-eg">${e(eg)}</p>
    </li>`;
  return `<ol class="cf-cga">
    ${step("01", "Context", "What is happening, in one plain sentence, with the numbers.", "“Your rent leaves on 1 Nov, two days before your salary usually arrives.”", "sky")}
    ${step("02", "Guidance", "Why it matters and what the choices cost, before anything moves.", "Move ₹1,500 from savings · Pay rent on 3 Nov · Talk to a person", "lavender")}
    ${step("03", "Action", "One tap to act, a specific status, and a calm end with the next date.", "“Rent is covered. Next date to watch: 3 Nov.”", "mint")}
  </ol>`;
}

/* ---------- One core flow, four lenses ---------- */
function lenses() {
  const L = [
    ["Consumer", "A salaried member, rent due before payday", "Gap card · options · confirm · done", "coral"],
    ["AI assistant", "A member who asks Seth what to do", "Sure · unsure · can’t · hand off to a person", "lavender"],
    ["Business", "A bakery owner and her accountant", "Cash position · approval with two roles", "sun"],
    ["Developer", "A partner adding an action to the card", "Manifest · sandbox · guardrails", "sky"],
  ];
  return `<div class="cf-lenses">
    <div class="cf-lens-core"><b>One core flow</b><span>Turn a signal into a next step people trust</span></div>
    ${L.map(([n, who, what, hue]) => `<div class="cf-lens" style="--hue: var(--hue-${hue})"><h4>${e(n)}</h4><p class="cf-lens-who">${e(who)}</p><p class="cf-lens-what">${e(what)}</p></div>`).join("")}
  </div>`;
}

/* ---------- Member, bank, platform ---------- */
function b2b2c() {
  return `<svg class="cf-tri" viewBox="0 0 640 380" role="img" aria-label="Three parties. The member wants calm and control. The bank or co-operative wants fewer support calls and trust. The platform wants native partner actions and one design system. The member experience is what the bank judges the platform by.">
    <line x1="320" y1="70" x2="110" y2="300" class="cf-tri-edge" />
    <line x1="320" y1="70" x2="530" y2="300" class="cf-tri-edge" />
    <line x1="110" y1="300" x2="530" y2="300" class="cf-tri-edge" />
    <g class="cf-tri-node" style="--hue: var(--hue-mint)"><circle cx="320" cy="70" r="46" /><text x="320" y="66" text-anchor="middle">Member</text><text x="320" y="86" text-anchor="middle" class="cf-tri-sub">calm, control</text></g>
    <g class="cf-tri-node" style="--hue: var(--hue-lavender)"><circle cx="110" cy="300" r="46" /><text x="110" y="296" text-anchor="middle">Bank</text><text x="110" y="316" text-anchor="middle" class="cf-tri-sub">trust, fewer calls</text></g>
    <g class="cf-tri-node" style="--hue: var(--hue-sun)"><circle cx="530" cy="300" r="46" /><text x="530" y="296" text-anchor="middle">Platform</text><text x="530" y="316" text-anchor="middle" class="cf-tri-sub">native partners</text></g>
    <text x="320" y="210" text-anchor="middle" class="cf-tri-mid">The member’s experience</text>
    <text x="320" y="232" text-anchor="middle" class="cf-tri-mid">is how the bank judges the platform</text>
  </svg>`;
}

/* ---------- Account Aggregator consent flow ---------- */
function aaFlow() {
  const S = [
    ["Member", "Chooses Malabar Bank, reads the consent", "mint"],
    ["Deccan app", "Asks for balance and transactions, 12 months, daily, until 7 Nov 2027", "lavender"],
    ["Saathi AA", "Confirms by OTP; carries data it can’t read", "sun"],
    ["Malabar Bank", "Returns the accounts the member picks", "coral"],
  ];
  return `<ol class="cf-aa">
    ${S.map(([who, what, hue], i) => `<li style="--hue: var(--hue-${hue})"><span class="cf-aa-n">${i + 1}</span><b>${e(who)}</b><span>${e(what)}</span></li>`).join("")}
  </ol>`;
}

module.exports = { journeyMap, cga, lenses, b2b2c, aaFlow, PHASES };
