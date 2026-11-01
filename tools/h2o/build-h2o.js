// Builds projects/h2o-connect.html. Copy rewritten from the Figma "Case Study · Portfolio"
// board (page 10): plainer, outcome led, no em dashes, six week timeline.
// v5: visuals first. A design and decision journey (as in the Saaf Safar case study), the job,
// five decisions told in six parts (title, hook, before, decision, after, result), how the screens
// took shape, how it was built with AI, and the mess. Copy is one or two sentences per part;
// flows and the structure map sit inside the decisions they support.
// Research was desk research; the kit and app are installed in about 100 homes.
// Shell (nav, lightbox, footer, theme toggle) is lifted from pathang-mobility.html.
const fs = require("fs");
const path = require("path");
const SITE = path.resolve(__dirname, "../..");
const src = fs.readFileSync(SITE + "/projects/pathang-mobility.html", "utf8");

// Text escape. Straight apostrophes become typographic ones; quotation marks
// are written as “ ” in the copy itself.
const e = (s) => String(s)
  .replace(/&(?![a-z#0-9]+;)/gi, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/'/g, "\u2019");
const A = "../assets/h2o/";

// ---------- shell ----------
let head = src.slice(0, src.indexOf("<main"));
head = head
  .replace(/<title>[^<]*<\/title>/, "<title>H2o Connect — Domestic Water Management | Sthitapragna Kollepara</title>")
  .replace(/<meta name="description" content="[^"]*"/, '<meta name="description" content="H2o Connect: a retrofit water tank kit and app, installed in about 100 homes, that shows what the pump is about to do, proves what it just did, and hands control back in one tap. Told as a design and decision journey."')
  .replace("family=Inter:wght@400;500;600;700", "family=Archivo:wght@400;500;600;700;800");
const tail = src.slice(src.indexOf("  <!-- ===================== LIGHTBOX"));

// ---------- helpers ----------
const k = (t, tone) => `<p class="h2-k${tone ? " h2-k--" + tone : ""}">${e(t)}</p>`;
const list = (items, tone) => `<ul class="h2-list${tone ? " h2-list--" + tone : ""}">${items.map((i) => `<li>${e(i)}</li>`).join("")}</ul>`;
const card = (inner, cls = "") => `<div class="h2-card${cls ? " " + cls : ""}">${inner}</div>`;
const grid = (cards, min, cls) => `<div class="h2-grid${cls ? " h2-grid--" + cls : ""} reveal"${min ? ` style="--min:${min}"` : ""}>${cards.join("")}</div>`;
const sec = (inner) => `<section class="h2-block">${inner}</section>`;
const scrollHint = (what) => `<p class="h2-scroll-hint">Scroll sideways to see the whole ${what}.</p>`;
const phone = (img, alt, w, h, attrs = "", cls = "") => `<div class="iphone${cls ? " " + cls : ""}"><div class="iphone-bezel"><div class="iphone-screen"><img src="${A}${img}" alt="${e(alt)}" width="${w}" height="${h}" decoding="async"${attrs} /></div></div></div>`;

const photo = (img, alt, w, h, cap, cls = "") => `<figure class="h2-photo${cls ? " " + cls : ""}"><img src="${A}${img}" alt="${e(alt)}" width="${w}" height="${h}" loading="lazy" decoding="async" /><figcaption>${e(cap)}</figcaption></figure>`;

// Asides: the summary panel on the right of a section head.
const aside = {
  text: (label, text, tone) => card(`${k(label, tone)}<p class="h2-aside-big">${e(text)}</p>`, "h2-aside"),
  steps: (label, items) => card(`${k(label)}<ol>${items.map((i) => Array.isArray(i) ? `<li><span><b>${e(i[0])}</b>${e(i[1])}</span></li>` : `<li>${e(i)}</li>`).join("")}</ol>`, "h2-aside"),
  stats: (label, items) => card(`${k(label)}<dl class="h2-stats">${items.map(([n, t]) => `<div><dt>${e(n)}</dt><dd>${e(t)}</dd></div>`).join("")}</dl>`, "h2-aside"),
  rows: (label, items) => card(`${k(label)}<div class="h2-rows">${items.map(([a, b, tone]) => `<div${tone ? ` style="--tone-ink:var(--h2-${tone}-ink)"` : ""}><b>${e(a)}</b><span>${e(b)}</span></div>`).join("")}</div>`, "h2-aside"),
};

// Section head: the title as a sentence, the hook under it. (The second argument is unused.)
const shead = (id, chip, title, intro) => `
        <header class="h2-head h2-head--solo" id="${id}">
          <div>
            <h2 class="h2-title">${e(title)}</h2>
            ${intro ? `<p class="h2-intro">${e(intro)}</p>` : ""}
          </div>
        </header>`;
const sub = (kicker, title, para, facts) => `
        <div class="h2-subhead h2-head--solo">
          <div class="h2-sub"><h3>${title.split("<br />").join(" ")}</h3>${para ? `<p>${e(para)}</p>` : ""}</div>
        </div>`;

const icons = {
  tank: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="5" y="3" width="14" height="5" rx="1.5"/><path d="M9 12c1 .8 2 .8 3 0s2-.8 3 0M8 16c1.3 1 2.7 1 4 0s2.7-1 4 0M10 20h4"/></svg>',
  sump: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="6" y="3" width="12" height="5" rx="1.5"/><path d="M12 8v8"/><circle cx="12" cy="18" r="2.5"/></svg>',
  motor: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="4" y="6" width="16" height="13" rx="2.5"/><path d="M8 6V3.5M16 6V3.5"/><circle cx="12" cy="12.5" r="2.2" fill="currentColor" stroke="none"/></svg>',
  unit: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="4" width="18" height="16" rx="3"/><rect x="6" y="8" width="6" height="5" rx="1"/><circle cx="16.5" cy="9" r="1.2"/><circle cx="16.5" cy="15" r="1.6"/></svg>',
  valve: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="14" r="5.5"/><path d="M12 8.5V3M9 3h6"/></svg>',
  says: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/></svg>',
  thinks: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 15a4 4 0 0 1-.5-8A5 5 0 0 1 16 6a4 4 0 0 1 1 9z"/><circle cx="8" cy="19" r="1.3"/><circle cx="5" cy="21.5" r=".8"/></svg>',
  does: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11m0-1.5V4a1.5 1.5 0 0 1 3 0v6m0-4.5a1.5 1.5 0 0 1 3 0V12m0-3.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1.5a6 6 0 0 1-5-2.7L5 15.5a1.6 1.6 0 0 1 2.5-2z"/></svg>',
  feels: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
  sees: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  hears: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 9a6 6 0 1 1 12 0c0 3-2 4-3 5.5s-1 4.5-3.5 4.5A2.5 2.5 0 0 1 9 16.5"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0"/></svg>',
};

// ---------- hero ----------
const hero = `
    <section class="section case-head h2-hero">
      <div class="wrap">
        <a class="case-back" href="../index.html#work"><span aria-hidden="true">&larr;</span> All projects</a>
        <div class="h2-hero-grid">
          <div>
            <img class="h2-appicon reveal" src="${A}app-icon.svg" alt="H2o Connect app icon: a water drop inside a house, on a blue squircle" width="54" height="54" />
            <p class="eyebrow reveal">Home automation &middot; Product &middot; UI/UX</p>
            <h1 class="h2-hero-title reveal" data-delay="1">H<sub>2</sub>O Connect</h1>
            <p class="h2-statement reveal" data-delay="2">A retrofit kit and app for rooftop water tanks, now in about 100 homes. It shows what the pump is about to do, proves what it just did, and hands control back in one tap.</p>

            <div class="case-brief reveal" data-delay="3">
              <div class="case-brief-row">
                <h2 class="case-brief-key">Deliverables</h2>
                <div class="case-brief-val">
                  <ul class="case-outcomes">
                    <li>Desk research</li>
                    <li>Product ecosystem</li>
                    <li>Design system</li>
                    <li>Mobile app</li>
                    <li>Working prototype</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div class="h2-phones reveal" data-delay="2">
            ${phone("cover-smart.webp", "Smart mode: a prediction that the tank reaches 25% at 4:10 PM tomorrow, learned from 34 days at 92% confidence", 644, 1393, "", "ph-smart")}
            ${phone("cover-home.webp", "Home screen: the overhead tank at 78%, 1,560 of 2,000 litres, filling with 12 minutes left, motor running automatically", 789, 1707, ' fetchpriority="high"', "ph-home")}
            ${phone("cover-leak.webp", "Smart insight: a possible leak, 42 litres lost overnight, with the expected and actual curves shown before the two choices", 644, 1393, "", "ph-leak")}
          </div>
        </div>

        <dl class="case-meta reveal" data-delay="4">
          <div><dt>Role</dt><dd>End to end UX and UI, sole designer</dd></div>
          <div><dt>Scope</dt><dd>Desk research, system, app, 11 screens</dd></div>
          <div><dt>Team</dt><dd>Partnered with Dwaj&#8209;Tech</dd></div>
          <div><dt>Timeline</dt><dd>6 weeks, 2026</dd></div>
          <div><dt>In use</dt><dd>Installed in about 100 homes</dd></div>
        </dl>
      </div>
    </section>`;

// ---------- sections ----------
// v2: fourteen short chapters on flush bento panels. Visuals carry the story; copy is captions.
const S = [];

// Bento helpers. A panel's spec is "w6 h2 t12 m6": desktop columns (of 12), rows,
// tablet columns, phone columns. Mods: lime, blue, hatch, photo, light, flat.
const P = (spec, inner, mods = "") => {
  const v = { w: "--w", h: "--h", t: "--wt", m: "--wm" };
  const style = spec.split(" ").filter(Boolean).map((s) => `${v[s[0]]}:${s.slice(1)}`).join(";");
  const cls = mods.split(" ").filter(Boolean).map((m) => " p--" + m).join("");
  return `<div class="p${cls}" style="${style}">${inner}</div>`;
};
const bx = (panels, cls = "") => `<div class="bx reveal${cls ? " " + cls : ""}">${panels.join("")}</div>`;
const num = (n, u) => `<p class="p-n">${e(n)}${u ? `<small>${e(u)}</small>` : ""}</p>`;
const pt = (t) => `<h3 class="p-t">${e(t)}</h3>`;
const ps = (t) => `<p class="p-s">${e(t)}</p>`;
const fine = (t) => `<p class="h2-fine reveal">${e(t)}</p>`;
const pimg = (img, alt, w, h, cap) => `<img class="p-img" src="${A}${img}" alt="${e(alt)}" width="${w}" height="${h}" loading="lazy" decoding="async" />${cap ? `<p class="p-cap">${e(cap)}</p>` : ""}`;

// The problem, and how the work was done
// The five decisions told in full. The decision map below links to them.
const STORIES = [
  ["s-d1", "strategic", "Designing for fewer app opens"],
  ["s-d2", "strategic", "Stop gets one tap and no dialog"],
  ["s-d3", "micro", "The leak alert shows its evidence first"],
  ["s-d4", "micro", "Readings in litres and minutes"],
  ["s-d5", "strategic", "34 problems in my own app, and a redesign"],
];
// ---------- visualizations ----------
// Charts and diagrams carry the story; copy is a caption of one or two sentences.
// They sit on the dark panels, so their colours are the app's dark palette.
const V = { ink: "#f9f9f9", dim: "#a9abb0", faint: "#6c7079", water: "#2f6bff", lime: "#cbf848", low: "#ffa53d", crit: "#ff4d5e", line: "rgba(249,249,249,0.14)" };
const cap = (t) => `<p class="vz-cap">${e(t)}</p>`;

// A day of water: the two hours it arrives, and what the pump keeper does in them.
const dayChart = (() => {
  const W = 1000, x = (h) => 40 + (h / 24) * 920;
  const ticks = [0, 3, 6, 9, 12, 15, 18, 21, 24].map((h) => `<text x="${x(h)}" y="196" text-anchor="middle" font-size="15" fill="${V.dim}">${h === 0 || h === 24 ? "12 AM" : h === 12 ? "12 PM" : h < 12 ? h + " AM" : h - 12 + " PM"}</text><line x1="${x(h)}" y1="150" x2="${x(h)}" y2="164" stroke="${V.line}" stroke-width="2"/>`).join("");
  const ev = (h, y, text, col, anchor = "start") => `<line x1="${x(h)}" y1="${y + 8}" x2="${x(h)}" y2="118" stroke="${col}" stroke-width="2" stroke-dasharray="3 4"/><circle cx="${x(h)}" cy="118" r="6" fill="${col}"/><text x="${x(h) + (anchor === "start" ? 10 : -10)}" y="${y}" text-anchor="${anchor}" font-size="17" font-weight="600" fill="${V.ink}">${e(text)}</text>`;
  return `<svg class="vz-svg" viewBox="0 0 ${W} 210" role="img" aria-label="A typical day: piped water arrives for about two hours in the morning. In that window someone switches the pump on, climbs up to check the tank, and either it overflows or they switch off early. For the other 22 hours the tank is the only water." font-family="Archivo, system-ui, sans-serif">
    <rect x="${x(0)}" y="104" width="${x(24) - x(0)}" height="28" rx="14" fill="rgba(249,249,249,0.06)"/>
    <rect x="${x(6)}" y="104" width="${x(8) - x(6)}" height="28" rx="14" fill="${V.water}"/>
    <text x="${x(8) + 16}" y="124" font-size="16" fill="${V.dim}">The other 22 hours, the tank is all the water there is</text>
    ${ev(6, 30, "Pump on", V.ink)}${ev(6.7, 58, "Climbs up to check", V.ink)}${ev(7.9, 86, "Overflow, or off too early", V.low)}
    ${ticks}
  </svg>`;
})();

// Decision 1: what each option shows. Filled means it does.
const optionGrid = (() => {
  const rows = [["Shows the level", 0, 0, 1], ["Says what it will do", 0, 0, 1], ["Proves what it did", 0, 0, 1], ["Stops in one tap", 1, 0, 1]];
  const mark = (v) => `<i class="og-m${v ? " og-m--on" : ""}" aria-label="${v ? "Yes" : "No"}"></i>`;
  return `<div class="og" role="table" aria-label="What each option shows">
    <div class="og-r og-h" role="row"><span role="columnheader"></span><span role="columnheader">A remote</span><span role="columnheader">An automatic box</span><span role="columnheader" class="og-win">H2o</span></div>
    ${rows.map(([t, a, b, c]) => `<div class="og-r" role="row"><span role="rowheader">${t}</span><span role="cell">${mark(a)}</span><span role="cell">${mark(b)}</span><span role="cell" class="og-win">${mark(c)}</span></div>`).join("")}
  </div>`;
})();

// Decision 2: the actions between "that looks wrong" and the motor stopping.
const stopSteps = (() => {
  const step = (t, cls = "") => `<span class="ss-b${cls ? " " + cls : ""}">${e(t)}</span>`;
  const row = (name, steps, total, win) => `<div class="ss-r${win ? " ss-r--win" : ""}"><p class="ss-n">${e(name)}</p><div class="ss-t">${steps.join('<span class="ss-a" aria-hidden="true"></span>')}</div><p class="ss-x">${e(total)}</p></div>`;
  return `<div class="ss">${row("With a confirmation", [step("Tap Stop"), step("Read the dialog"), step("Tap Confirm"), step("Motor stops", "ss-b--end")], "3 actions")}${row("In H2o", [step("Tap Stop"), step("Motor stops in under 200 ms", "ss-b--end ss-b--lime")], "1 action", true)}</div>`;
})();
const SURF = [["Phone", "In the motor panel"], ["Dynamic Island", "Two taps from any app"], ["Watch", "Where the thumb lands"], ["Kitchen display", "“Alexa, stop the pump”"], ["The unit", "A button and a Manual switch"]];
const surfaces = `<ul class="sf">${SURF.map(([a, b]) => `<li><b>${e(a)}</b><span>${e(b)}</span></li>`).join("")}</ul>`;

// Decision 4: one reading, three ways, with the two levels.
const tankDiagram = (() => {
  const T = { x: 60, y: 20, w: 150, h: 360 }, lv = (p) => T.y + T.h * (1 - p / 100);
  const lead = (p, big, small, col) => `<line x1="${T.x + T.w + 8}" y1="${lv(p)}" x2="${T.x + T.w + 48}" y2="${lv(p)}" stroke="${col}" stroke-width="2"/><text x="${T.x + T.w + 58}" y="${lv(p) + 7}" font-size="22" font-weight="700" fill="${V.ink}">${big}</text><text x="${T.x + T.w + 58}" y="${lv(p) + 32}" font-size="16" fill="${V.dim}">${small}</text>`;
  return `<svg class="vz-svg vz-tank" viewBox="0 0 560 400" role="img" aria-label="A tank at 78 percent: 1,560 of 2,000 litres, full in 12 minutes. The motor stops at 90 percent, 1,800 litres, and starts at 25 percent, 500 litres." font-family="Archivo, system-ui, sans-serif">
    <defs><clipPath id="vzTank"><rect x="${T.x}" y="${T.y}" width="${T.w}" height="${T.h}" rx="30"/></clipPath></defs>
    <rect x="${T.x}" y="${T.y}" width="${T.w}" height="${T.h}" rx="30" fill="#1b1e24"/>
    <rect x="${T.x}" y="${lv(78)}" width="${T.w}" height="${T.y + T.h - lv(78)}" fill="${V.water}" clip-path="url(#vzTank)"/>
    <line x1="${T.x}" y1="${lv(90)}" x2="${T.x + T.w}" y2="${lv(90)}" stroke="${V.ink}" stroke-width="2" stroke-dasharray="6 6"/>
    <line x1="${T.x}" y1="${lv(25)}" x2="${T.x + T.w}" y2="${lv(25)}" stroke="${V.ink}" stroke-width="2" stroke-dasharray="6 6"/>
    ${lead(90, "Stops at 90%", "1,800 L", V.dim)}
    <line x1="${T.x + T.w + 8}" y1="${lv(78) + 4}" x2="${T.x + T.w + 48}" y2="${lv(78) + 4}" stroke="${V.water}" stroke-width="2"/>
    <text x="${T.x + T.w + 58}" y="${lv(78) + 52}" font-size="64" font-weight="700" fill="${V.ink}" letter-spacing="-2">78%</text>
    <text x="${T.x + T.w + 58}" y="${lv(78) + 84}" font-size="20" font-weight="600" fill="${V.ink}">1,560 of 2,000 L</text>
    <text x="${T.x + T.w + 58}" y="${lv(78) + 110}" font-size="18" fill="${V.dim}">Full in 12 min</text>
    ${lead(25, "Starts at 25%", "500 L", V.dim)}
  </svg>`;
})();

// Decision 5: what the review found, and what happened to it.
const issueBar = (() => {
  const segs = [["Major", 4, V.crit], ["Moderate", 17, V.low], ["Minor", 13, "#6c7079"]], total = 34;
  return `<div class="ib" role="img" aria-label="34 issues: 4 major, 17 moderate, 13 minor">
    <div class="ib-bar">${segs.map(([n, c, col]) => `<span style="flex:${c};background:${col}"></span>`).join("")}</div>
    <div class="ib-key">${segs.map(([n, c, col]) => `<p><i style="background:${col}"></i><b>${c}</b> ${n.toLowerCase()}</p>`).join("")}</div>
  </div>`;
})();
const stagesRow = (items) => `<ol class="st">${items.map(([n, t]) => `<li><b>${e(n)}</b><span>${e(t)}</span></li>`).join("")}</ol>`;

// How it was built: one source of screens, everything else rendered from it.
const pipeline = `<div class="pl" role="img" aria-label="build-screens.js holds the eleven screens as code. From it come the screenshots, the four light-mode previews, the hero covers, the component sheet and the walkthrough film. build-h2o.js puts them together into this page.">
  <div class="pl-src"><b>build-screens.js</b><span>The eleven screens, as code</span></div>
  <ul class="pl-out">${[["Screenshots", "11 screens"], ["Light mode", "4 previews"], ["Hero covers", "3 phones"], ["Component sheet", "Design system"], ["Walkthrough film", "Live screens"]].map(([a, b]) => `<li><b>${a}</b><span>${b}</span></li>`).join("")}</ul>
  <div class="pl-src pl-src--end"><b>build-h2o.js</b><span>Puts them into this page</span></div>
</div>`;

// The system: what lives where, and how fast it answers.
const archDiagram = `<div class="ar" role="img" aria-label="On the device: dry-run, overflow and thermal cut-offs, answering in under 200 milliseconds and needing no internet. On the phone: mode, levels, start and stop, in under a second over the home network. In the cloud: history and the pattern Smart learns, over 30 days or more; if it slows down, nothing fails.">
  ${[["On the device", "<200", "ms", "Cut-offs for dry run, overflow and heat. No internet needed.", "lime"], ["On the phone", "<1", "s", "Mode, levels, start and stop, over home Wi‑Fi.", "water"], ["In the cloud", "30+", "days", "History and the pattern Smart learns. Slow is fine.", "dim"]].map(([t, n, u, p, tone]) => `<div class="ar-n ar-n--${tone}"><h3>${t}</h3><p class="ar-v">${n}<small>${u}</small></p><p>${e(p)}</p></div>`).join('<span class="ar-a" aria-hidden="true"></span>')}
</div>`;

// The mess, as a status list.
const messList = (rows) => `<ul class="ms">${rows.map(([st, tone, t, p]) => `<li><span class="ms-s ms-s--${tone}">${e(st)}</span><div><h3>${e(t)}</h3><p>${e(p)}</p></div></li>`).join("")}</ul>`;

// Targets set before the study, none measured yet.
const heartBoard = (rows) => `<div class="hb">${rows.map(([d, n, t]) => `<div class="hb-r"><p class="hb-d">${e(d)}</p><p class="hb-n">${e(n)}</p><p class="hb-t">${e(t)}</p><span class="hb-m">Not measured</span></div>`).join("")}</div>`;

// The job and the forces on switching (assumptions from desk research).
const forces = (items) => `<div class="fo">${items.map(([dir, name, quote, answer]) => `<div class="fo-c fo-c--${dir}"><p class="fo-k"><i aria-hidden="true"></i>${e(name)}</p><p class="fo-q">${e(quote)}</p><p class="fo-a">${e(answer)}</p></div>`).join("")}</div>`;

// Dark and light, side by side.
const pairCard = (k, title, capText) => `
            <figure class="shot-card pair-card">
              <div class="h2-stage h2-stage--water pair-stage">${phone(`screen-${k}.jpg`, `${title} in dark mode`, 720, 1558, ' loading="lazy"')}${phone(`screen-${k}-light.jpg`, `${title} in light mode`, 720, 1558, ' loading="lazy"')}</div>
              <figcaption><h3 class="p-t">${e(title)}</h3><p class="p-s">${e(capText)}</p></figcaption>
            </figure>`;

// 07 Hardware
const secSystem = sec(shead("s-system", "System", "The kit it runs on", "A sonar sensor on the lid and a unit beside the motor switch, built with Dwaj‑Tech. It works with the tank, pump and switch a home already has.") +
  bx([
    P("w7 h2 t12", `<figure class="h2-proto-photo">
            <img src="${A}prototype-unit.webp" alt="Working prototype of the H2o Connect display and control unit: a white wall box with a small display reading level 75 percent, volume 748 litres and motor off, a Manual and Auto toggle switch, a red ON and OFF button, and Powered by Dwaj Tech" width="1024" height="1024" loading="lazy" decoding="async" />
            <span class="h2-pin" style="left:21.7%;top:50%">1</span>
            <span class="h2-pin" style="left:45.7%;top:40%">2</span>
            <span class="h2-pin" style="left:42%;top:60.5%">3</span>
            <span class="h2-pin" style="left:94%;top:69.5%">4</span>
          </figure>`, "light photo"),
    P("w5 t12", `${pt("The working prototype")}<ol class="h2-pins">
              <li><b>Display</b><span>Level, volume and motor state, without a phone.</span></li>
              <li><b>Manual and Auto switch</b><span>Manual always wins, in hardware.</span></li>
              <li><b>ON and OFF button</b><span>Works with the phone or router down.</span></li>
              <li><b>Wiring</b><span>Enters beside the existing switch.</span></li>
            </ol>`),
    P("w5 t12", `<div class="p-split"><div>${num("0", "corrosion")}${ps("Sonar reads the air gap. Nothing touches the water.")}</div><div>${num("20 to 40", "%")}${ps("lower energy bills, estimated for large facilities.")}</div></div>`, "blue"),
  ]) +
  archDiagram +
  bx([
    ["tank", "Tank sensor", "In use", "Sonar under the lid, magnetic mount."],
    ["unit", "Display unit", "In use", "Switches the motor, confirms it by current."],
    ["sump", "Sump sensor", "Planned", "A dry run guard on the sump."],
    ["valve", "Inlet valve", "Planned", "Lets Smart close the inlet on a leak."],
  ].map(([ic, t, st, p]) => P("w3 t6", `${pt(t)}${ps(p)}<p class="vz-src">${st}</p>`, st === "Planned" ? "hatch" : "")).concat([
    P("w12", `<div class="p-strip">${[["20", "min", "to install"], ["1", "step", "needs an electrician"], ["0", "", "drilling or rewiring"]].map(([n, u, t]) => `<div>${num(n, u)}${ps(t)}</div>`).join("")}<div>${pt("Joins the home over Matter")}${list(["Apple Home", "Alexa", "Google Home", "SmartThings"])}</div></div>`),
  ])));

// 08 Structure: IA tree + three flows
const iaIcons = {
  home: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5c-.4 0-.8.2-1 .6C9.6 5.3 6 10.9 6 14a6 6 0 0 0 12 0c0-3.1-3.6-8.7-5-10.9-.2-.4-.6-.6-1-.6z"/></svg>',
  motor: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="13" r="7"/><path d="M12 13l3-3M12 3v3" stroke-linecap="round"/></svg>',
  modes: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 8h10M18 8h2M4 16h2M10 16h10"/><circle cx="16" cy="8" r="2"/><circle cx="8" cy="16" r="2"/></svg>',
  history: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 20V11M12 20V5M18 20v-6"/></svg>',
  settings: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" stroke-linecap="round"/></svg>',
};
const IA = [
  ["home", "Home", "Tab 1", ["Level, litres, time to full", "Motor panel with Stop", "This week", "Active alert"], false, false],
  ["history", "Usage", "Tab 2", ["Every fill and its cost", "Event log", "Leak records", "Export"], false, false],
  ["motor", "Motor", "Tab 3", ["Start and stop", "Power, run time, cost", "Faults", "Bypass at the switch"], false, false],
  ["modes", "Modes", "Tab 4", ["Automatic", "Manual", "Smart", "Back to Manual"], false, false],
  ["settings", "Settings", "Tank menu", ["Tanks and sensors", "Members", "Matter link", "Text size, language"], false, true],
];
const flIcons = {
  trigger: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>',
  outcome: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  decision: '<span aria-hidden="true">?</span>',
};
const flow = (num_, title, mode, metric, nodes) => {
  let step = 0;
  return `
        <div class="h2-card fl reveal">
          <div class="fl-head">
            <div class="fl-title"><h3>${e(title)}</h3><p class="fl-sub">${e(mode)} · ${e(metric)}</p></div>
          </div>
          <div class="h2-scroll fl-scroll"><ol class="fl-track" style="--n:${nodes.length}">${nodes.map(([kind, label, text, opts]) => {
            const dot = kind === "step" ? "" : flIcons[kind];
            return `<li class="fl-step fl-step--${kind}"><span class="fl-dot"><span>${dot}</span></span>${kind === "step" ? "" : `<span class="fl-label">${e(label)}</span>`}<b>${e(text)}</b>${opts ? `<span class="fl-opts">${opts.map((o) => `<i>${e(o)}</i>`).join("")}</span>` : ""}</li>`;
          }).join("")}</ol></div>
        </div>`;
};
// The structure map and the three flows, used as evidence inside the decisions.
const iaMap = `<div class="reveal"><div class="h2-scroll ia-scroll"><div class="ia" role="group" aria-label="Information architecture: H2o Connect with four tabs and a tank menu">
          <div class="ia-root"><img src="${A}app-icon.svg" alt="" width="36" height="36" /><div><b>H2o Connect</b><small>Four tabs and a tank menu</small></div></div>
          <ol class="ia-l1">${IA.map(([ic, t, where, leaves, fab, deep]) => `
            <li class="ia-branch ia-branch--${ic}">
              <div class="ia-node"><span class="ia-ico">${iaIcons[ic]}</span><div><b>${t}</b><small>${where}</small></div></div>
              <ul class="ia-leaves${deep ? " ia-leaves--deep" : ""}">${leaves.map((l) => `<li><span>${e(l)}</span></li>`).join("")}</ul>
            </li>`).join("")}
          </ol>
          <div class="ia-legend" aria-hidden="true"><span><i class="ia-key ia-key--node"></i>Destination</span><span><i class="ia-key ia-key--leaf"></i>Content and actions</span><span><i class="ia-key ia-key--deep"></i>Opens a sub page</span></div>
        </div></div>${scrollHint("map")}</div>`;
const flowDaily = flow("01", "The daily fill, with nobody watching", "Automatic", "Zero taps", [
  ["trigger", "Trigger", "Level drops below 25%"],
  ["step", "", "Checks quiet hours and tariff"],
  ["step", "", "Motor starts, confirmed by current"],
  ["step", "", "Home shows level and time to full"],
  ["step", "", "Stops at 90%"],
  ["outcome", "Outcome", "Receipt: 440 L · 22 min · ₹2.10"],
]);
const flowLeak = flow("02", "Something the system can't explain", "Smart", "One decision", [
  ["trigger", "Trigger", "42 L lost overnight, taps closed"],
  ["step", "", "Compared with 34 days of history"],
  ["step", "", "One notification at 5:04 AM"],
  ["decision", "Evidence", "What Smart saw"],
  ["decision", "Decision", "Two choices", ["Pause automatic filling", "That was us"]],
  ["outcome", "Outcome", "Logged, and the pattern updates"],
]);
const flowStop = flow("03", "Taking it back", "Any mode", "One tap · under 200 ms", [
  ["trigger", "Trigger", "Any screen, any mode"],
  ["step", "", "One tap on Stop, no dialog"],
  ["step", "", "Relay responds in under 200 ms"],
  ["step", "", "“Manual until you switch back”"],
  ["outcome", "Outcome", "Automatic resumes only when asked"],
]);

// 10 Design system: palette blocks, type, components, icon
const PAL = [
  ["Lime · the running motor", "#CBF848", "203, 248, 72", "16.0 : 1", "AAA", "pal--lime"],
  ["Water", "#2F6BFF", "47, 107, 255", "4.4 : 1", "Large only", "pal--water"],
  ["Chalk · text and actions", "#F4F2EC", "244, 242, 236", "17.6 : 1", "AAA", "pal--white"],
  ["Alert · low or stale", "#FFA53D", "255, 165, 61", "10.0 : 1", "AAA", "pal--low"],
  ["Alert · critical", "#FF4D5E", "255, 77, 94", "6.1 : 1", "AA", "pal--crit"],
  ["Text · secondary", "#A3A8B0", "163, 168, 176", "8.2 : 1", "AAA", "pal--muted"],
  ["Text · inactive", "#80868F", "128, 134, 143", "5.4 : 1", "AA", "pal--faint"],
];
const ramp = [
  ["Number", "64 / 61 · Bold", "78%", "font-size:52px;font-weight:700;letter-spacing:-0.045em"],
  ["Title", "28 / 31 · Bold", "Possible leak", "font-size:28px;font-weight:700;letter-spacing:-0.02em"],
  ["Lead", "17 / 22 · SemiBold", "Tonight’s plan", "font-size:17px;font-weight:600"],
  ["Body", "15 / 22 · Regular", "1,560 of 2,000 L", "font-size:15px;font-weight:400"],
  ["Meta", "13 / 17 · Medium", "Live · updated 9:41", "font-size:13px;font-weight:500"],
];
const secDesign = sec(shead("s-design", "Design system", "Colour that means something", "Two surfaces and no outlines, one typeface in five sizes, and colour roles that each mean one thing, measured against the app background.") +
  `<div class="pal reveal" role="list" aria-label="Colour palette">${PAL.map(([n, h, rgb, r, g, cls]) => `<div class="pal-b ${cls}" role="listitem"><p class="pal-n">${e(n)}</p><dl class="pal-v"><div><dt>HEX</dt><dd>${h}</dd></div><div><dt>RGB</dt><dd>${rgb}</dd></div><div><dt>Contrast</dt><dd>${r} · ${e(g)}</dd></div></dl></div>`).join("")}</div>` +
  bx([
    P("w5 h2 t12", pimg("icon-mockup.jpg", "An iPhone home screen showing the H2o Connect app icon, a water drop inside a house on a blue squircle, labelled H2o Connect", 736, 736, "On the home screen"), "photo"),
    P("w7 t12", `${pt("Archivo, in five sizes")}<dl class="h2-type">${ramp.map(([n, s, t, st]) => `<div><dt>${n}<small>${s}</small></dt><dd style="${st}">${e(t)}</dd></div>`).join("")}</dl>`),
    P("w7 t12", `${pt("App icon")}<div class="h2-icon-row">${[["app-icon.svg", 120, "Home screen"], ["app-icon.svg", 60, "Spotlight"], ["app-icon-round.svg", 88, "Apple Watch"], ["app-icon-round.svg", 64, "Galaxy Watch"]].map(([f, s, l]) => `<figure><img src="${A}${f}" alt="" width="${s}" height="${s}" loading="lazy" /><figcaption>${l}</figcaption></figure>`).join("")}</div><h3 class="p-t" style="margin-top:1.1rem">Rules</h3>${list(["Two surfaces, no outlines", "Lime only while the motor runs", "48 px targets, 56 px for Stop", "24 px panel radius", "No colour only states", "No confirm on Stop"])}`),
    P("w12", `${pt("Components, built in code with the screens")}<div class="h2-scroll"><figure class="h2-sheet h2-sheet--dark ds-sheet" style="--sheet-min:62rem"><img src="${A}ds-components.webp" alt="Component sheet. Tank: water, low and stale. Buttons: main in chalk, secondary on the raised surface, and a text link. The motor panel: lime while the motor runs, with Stop inside it. Toggle on and off. The segmented control for modes. The tab bar: four plain tabs." width="2208" height="400" loading="lazy" decoding="async" /></figure></div>`),
  ]));

// 11 The product
const F = [
  ["Home", "The tank leads. The lime panel appears only while the motor runs, with Stop inside it.", "Home: the overhead tank at 78%, 1,560 of 2,000 litres, full in 12 minutes, live and updated 9:41; a lime panel saying the motor is running automatically for 04:12, with a Stop button; 1,240 litres used this week; four tabs", "water"],
  ["Fill range", "Both levels dragged on the tank, each labelled in percent and litres.", "Fill range: handles on the tank at stop 90% (1,800 L) and start 25% (500 L), labelled beside each handle, and Save range", "water"],
  ["Motor", "“Running” is confirmed by current draw. Stop never asks twice.", "Motor: a lime panel, running automatically, 04:12 of about 18 minutes with a progress bar and a full-width Stop motor button; 22 L/min, 0.75 kW, 3 runs today; dry-run protection on", "lime"],
  ["Modes", "Three equal modes, one tap apart. Quiet hours never clash with Smart.", "Modes: Automatic selected, keeping the tank between 25% and 90%, with eco mode on, boost off and quiet hours from 9 PM to 1 AM", "lime"],
  ["Low water alert", "Manual mode warns, but never acts.", "Low water alert in manual mode at 6:42 AM: an orange tank at 22%, the motor off, with Start motor, Remind me in 15 minutes, and Switch to Automatic", "low"],
  ["Usage", "Every run shows what it cost and what started it.", "Usage: 1,240 litres and 8.4 units of electricity this week, a daily bar chart, and recent runs with their minutes, litres, cost and cause, marked auto or manual", "water"],
  ["Smart mode", "Every prediction shows its confidence.", "Smart mode: reaching 25% at 4:10 PM tomorrow, learned from 34 days at 92% confidence; tonight's plan fills 01:40 to 02:05 off peak, after quiet hours, saving 38%", "lime"],
  ["Smart insight", "Evidence first, then only what the installed kit can do.", "Smart insight: possible leak noticed at 5:04 AM, 42 litres lost overnight while every tap was closed, an expected versus actual chart, then Pause automatic filling or That was us", "crit"],
  ["Sensor not reporting", "Automatic holds off until the sensor is back. The unit's cut-offs still protect the motor.", "Sensor not reporting: the tank greyed at its last reading 2 hours ago, a note that Automatic won't start the motor, with Check sensor and Start motor", "low"],
  ["No internet", "The unit keeps running on its own, and Stop still works on home Wi‑Fi.", "No internet: an offline bar, the tank greyed at its last update at 9:12 AM, a note that the unit runs on its own, and the lime motor panel with Stop still active", "water"],
  ["Settings", "Appearance follows the phone, or stays dark or light.", "Settings: Appearance set to System, Dark or Light; tanks and sensors, members, the Matter link, and language and text size", "water"],
];
// A final screen as a gallery card. Stories pass their own caption.
const screenCard = (i, cap) => {
  const [t, c, alt, tone] = F[i];
  return `
            <figure class="shot-card">
              <div class="h2-stage h2-stage--${tone}">${phone("screen-f" + (i + 1) + ".jpg", alt, 720, 1558, ' loading="lazy"')}</div>
              <figcaption><h3 class="p-t">${e(t)}</h3><p class="p-s">${e(cap || c)}</p></figcaption>
            </figure>`;
};
const screens = (cards, cols, bar, cls) => `<div class="shots h2-gallery${cls ? " " + cls : ""} reveal" data-shots style="--cols:${cols || cards.length};margin:0"><div class="shots-track">${cards.join("")}
          </div>${bar ? `
          <div class="shots-bar"><p class="shots-hint">Click any screen to enlarge</p></div>` : ""}
        </div>`;
const secProduct = sec(shead("s-product", "", "The eleven screens", "Each one says what's happening before it offers an action, including when the sensor or the internet drops.") +
  screens(F.map((_, i) => screenCard(i)), 5, true));

// 12 Dynamic Island
// The recorded prototype plays in a phone frame (its own island, so the frame's
// painted one is switched off). film.js plays it while on screen and honours
// reduced motion; the button pauses it.
const live = `<div class="iphone iphone--live"><div class="iphone-bezel"><div class="iphone-screen"><video data-island-video src="${A}dynamic-island-demo.mp4" poster="${A}dynamic-island-poster.jpg" width="780" height="1688" muted loop playsinline preload="metadata" aria-label="Demo of the H2o Connect Live Activity: leaving the app, expanding the Dynamic Island, switching to Manual, stopping and starting the motor, then a low water alert answered with Start motor"></video></div></div></div>
            <div class="h2-live-bar"><button class="h2-live-btn" type="button" data-island-toggle aria-pressed="false"><svg class="i-pause" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="14" y="3" width="5" height="18" rx="1"/><rect x="5" y="3" width="5" height="18" rx="1"/></svg><svg class="i-play" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/></svg><span>Pause</span></button><small>40 s · recorded from the prototype</small></div>`;
const alertCol = (tone, title, action) => `<div style="--tone:var(--h2-${tone})"><h3 class="p-t">${e(title)}</h3><p class="p-s">${e(action)}</p></div>`;
const secIsland = sec(shead("s-island", "Dynamic Island", "The tank leaves the app with you", "A Live Activity keeps the level and the countdown beside the camera, with the motor one tap away.") +
  bx([
    P("w4 h3 t6 m12", live, "flat h2-live"),
    P("w4 t6 m12", pt("Level and time left") + ps("A ring fills with the tank on one side of the camera and the countdown runs on the other. It turns orange when the tank runs low.")),
    P("w4 t6 m12", pt("Stop, start, switch mode") + ps("Auto, Manual and Smart sit beside the motor button. Each change confirms in the line under the timer, so the island never jumps away.")),
    P("w8 t6 m12", pt("Alerts grow out of the island") + `<div class="h2-alerts">${alertCol("low", "Water is low", "Start motor, or Later") + alertCol("lime", "Tank full", "Stopped at 90%, 1,800 L") + alertCol("crit", "Possible leak", "Close inlet, or That was us")}</div>`),
    P("w4 t6 m12", num("2", "taps") + ps("to stop the motor: the island, then Stop."), "lime"),
    P("w4 t6 m12", pt("Rules it keeps") + `<ol class="h2-rules">${["Only outside the app, as on iOS", "Auto on a low tank starts the motor", "Stop never asks twice"].map((r) => `<li>${e(r)}</li>`).join("")}</ol>`, "hatch"),
  ]) + fine("On an iPhone this is a Live Activity whose buttons run App Intents (iOS 17 and later). There a tap opens the app and a long press expands the island; the prototype expands on a tap so it works in a browser."));

// 13 Beyond the phone
const shot = (img, w, h, alt, title, cap, extra) => '<figure class="shot-card"><img src="' + A + img + '" alt="' + e(alt) + '" width="' + w + '" height="' + h + '" loading="lazy" decoding="async" /><figcaption><h3 class="p-t">' + e(title) + '</h3><p class="p-s">' + e(cap) + '</p>' + (extra || "") + '</figcaption></figure>';
const gallery = (cols, items, cls) => '<div class="shots h2-gallery h2-gallery--photos' + (cls ? " " + cls : "") + ' reveal" data-shots style="--cols:' + cols + ';margin:0"><div class="shots-track">' + items.join("") + '</div></div>';
const secDevices = sec(shead("s-devices", "Beyond the phone", "Every screen in the home can stop the pump", "The same rules on the wrist, the speaker and the kitchen display.") +
  gallery(3, [
    shot("dev-aw-1.jpg", 420, 600, "Apple Watch showing H2o: tank at 78%, 1,560 litres, filling with 12 minutes left, and a Stop button", "Apple Watch · glance", "Level and time to full. Stop where the thumb lands."),
    shot("dev-aw-3.jpg", 420, 600, "Apple Watch alert from H2o Connect: possible leak, 42 litres lost overnight, with Close valve and That was us buttons", "Apple Watch · alert", "The evidence in one line, then the two choices."),
    shot("dev-aw-4.jpg", 420, 600, "Apple Watch face at 9:41 with an H2o complication: tank at 78%, motor on, full in 12 minutes", "Apple Watch · complication", "The level stays on the watch face all day."),
    shot("dev-galaxy-1.jpg", 800, 936, "Samsung Galaxy Watch showing H2o: an arc gauge around the round screen at 78%, filling with 12 minutes left, and a round Stop button", "Galaxy Watch · status", "An arc gauge suited to the round display."),
    shot("dev-galaxy-2.jpg", 800, 936, "Samsung Galaxy Watch showing an H2o low water alert: 22% with the motor off, and a Start button", "Galaxy Watch · low water", "The same words as the phone, one Start button."),
    shot("dev-aw-2.jpg", 420, 600, "Apple Watch showing H2o with the motor off: tank at 24%, 480 litres, and a Start motor button", "Apple Watch · start", "Low tank, motor off: Start is the only action."),
  ], "h2-gallery--watch") +
  gallery(3, [
    shot("dev-homeview.jpg", 1200, 900, "Apple HomeView showing H2o on its 7 inch display: the overhead tank at 78%, 1,560 of 2,000 litres, filling and full in 12 minutes, a large Stop pump button, tonight's off peak fill from 01:40 to 02:05, and a Siri request to stop the pump", "Apple HomeView · Siri", "Reads from across the kitchen. “Siri, stop the pump.”", '<p class="h2-credit">Device: Apple HomeView, Apple Newsroom image. Screen: H2o Connect.</p>'),
    shot("dev-echo.jpg", 880, 660, "Echo Show 5 showing H2o: the overhead tank at 78%, filling, with Stop pump and Details buttons and an Alexa request", "Echo Show · Alexa", "“Alexa, how full is the tank?”"),
    shot("dev-nest.jpg", 776, 582, "Nest Hub showing H2o: the overhead tank at 78% with the pump switched on, 3 runs today, and a suggested off peak routine", "Nest Hub · Google Home", "Status on the counter, with an off peak routine."),
  ]) + fine("Anyone at home can check the level and stop the pump from any surface. Safety settings only change in the app."));

// ---------- the four decision stories ----------
// Each runs title, hook, before, decision, after, result. The "before" states are
// described in words: only the final screens exist as images.
const label = (t) => `<p class="h2-step reveal">${e(t)}</p>`;
const xl = (t) => `<p class="p-xl">${e(t)}</p>`;

// The design and decision journey: one line per phase, as on a transit map, as in the
// Saaf Safar case study. Each stop is the phase's main decision and links to where it's told.
const JOURNEY = [
  ["frame", "F", "Frame", "#s-job", "A witness that can act", "The job, the options I weighed, four rules"],
  ["kit", "K", "Kit", "#s-system", "Safety lives on the device", "Sonar on the lid, cut-offs in the unit"],
  ["design", "D", "Design", "#s-evolve", "Hierarchy first, colour last", "Wireframes, three directions, Stop, the leak alert"],
  ["install", "I", "Install", "#s-evolve", "Into about 100 homes", "Kit and app, tested with Dwaj‑Tech"],
  ["review", "R", "Review", "#s-d5", "34 problems, then a redesign", "One system, in dark and light"],
];
const secJourney = `
        <nav class="dj reveal" aria-labelledby="dj-h">
          <h2 class="dj-title" id="dj-h">The design and decision journey</h2>
          <ol class="dj-line">${JOURNEY.map(([k_, letter, phase, href, decision, what]) => `
            <li class="dj-stop dj-stop--${k_}">
              <a href="${href}">
                <span class="dj-dot" aria-hidden="true">${letter}</span>
                <span class="dj-phase">${phase}</span>
                <span class="dj-decision">${e(decision)}</span>
                <span class="dj-what">${e(what)}</span>
              </a>
            </li>`).join("")}
          </ol>
        </nav>`;

// How the screens took shape: the design journey, version by version.
const evStep = (k_, phase, title, text, media, wide) => `
          <li class="ev-step ev-step--${k_}${wide ? " ev-step--wide" : ""}">
            <div class="ev-text"><span class="dj-phase">${phase}</span><h3>${e(title)}</h3><p>${e(text)}</p></div>
            <div class="ev-media">${media}</div>
          </li>`;
const evPhone = (img, alt, capText) => `<figure class="ev-phone">${phone(img, alt, 720, 1558, ' loading="lazy"')}${capText ? `<figcaption>${e(capText)}</figcaption>` : ""}</figure>`;
const secEvolve = sec(shead("s-evolve", "", "How the screens took shape", "Each version kept something from the one before.") +
  `<ol class="ev reveal">` +
  evStep("design", "Design", "Hierarchy in grey", "Six wireframes before any colour. The tank leads every screen.",
    `<figure class="ev-sheet"><img src="${A}wireframes.webp" alt="Six greyscale wireframes: Home, Fill range, Modes, Alert, Motor and History" width="2280" height="725" loading="lazy" decoding="async" /></figure>`, true) +
  evStep("design", "Design", "Three directions, one idea from each", "None worked whole. I kept the colour discipline, the card structure and the plain labels.",
    `<div class="ev-row">${evPhone("exp-a.jpg", "Direction A, ambient dark: a glowing blue tank with motor, eco and boost cards", "Ambient: colour discipline")}${evPhone("exp-b.jpg", "Direction B, bento: saturated blue and lime blocks for overview, tank and weekly usage", "Bento: card structure")}${evPhone("exp-c.jpg", "Direction C, platform native: a light iOS-style settings layout", "Native: plain labels")}</div>`) +
  evStep("install", "Install", "The first app", "What went into about 100 homes. Icon-only tabs and a bare square for Stop.",
    `<div class="ev-row ev-row--one">${evPhone("v1-screen-f1.jpg", "The original Home screen: tank at 78%, a lime motor card with an unlabelled square stop button, and a tab bar of five icons with no labels")}</div>`) +
  evStep("review", "Review", "A first fix that kept the look", "Twelve fixes from my review. Labels arrived, but every screen still had three things shouting.",
    `<div class="ev-row ev-row--one">${evPhone("v2-screen-f1.jpg", "The patched Home screen: labelled tabs and Stop, a live line, but three large numbers inside outlined cards")}</div>`) +
  evStep("review", "Review", "One system, in dark and light", "Two surfaces, five type sizes, and lime only while the motor runs.",
    `<div class="ev-row ev-row--two">${evPhone("screen-f1.jpg", F[0][2], "Dark")}${evPhone("screen-f1-light.jpg", "Home in light mode", "Light")}</div>`) +
  `</ol>`);

// ---------- the story ----------
const secProblem = sec(shead("s-problem", "", "Water comes for two hours a day. Nobody can see the tank.", "Homes store it in a rooftop tank and pump it up by hand, with no gauge and no warning.") +
  bx([
    P("w12", `<div class="h2-scroll"><div class="vz-day">${dayChart}</div></div>` + cap("A typical day. The times are an example; the two-hour window is what most town homes get.")),
    P("w4 t6", num("2", "hrs") + ps("of piped water on a normal day in most town homes.") + `<p class="vz-src">World Bank</p>`),
    P("w4 t6", num("<6", "hrs") + ps("of supply a day in many Indian cities.") + `<p class="vz-src">MIT Tata Center</p>`),
    P("w4 t12", num("73.9", "%") + ps("of rural homes now have a tap, so the problem has moved indoors.") + `<p class="vz-src">Jal Jeevan Mission, 2024</p>`),
    P("w7 t12", pimg("overflow-splash.jpg", "Water gushing over the rim of an overfilled storage tank", 800, 450, "Every overflow is water the household already paid to pump."), "photo"),
    P("w5 t12", `<p class="p-xl">${e("People check the tank because nothing tells them what it's doing.")}</p>` + ps("I worked from desk research, then the kit went into about 100 homes with Dwaj‑Tech."), "blue"),
  ]));

const secJob = sec(shead("s-job", "", "What people are really trying to do", "When the water comes, they want the tank filled without overflowing or running the pump dry, so they can stop checking.") +
  forces([
    ["push", "Pushes away from the switch", "“Every overflow is water we already paid to pump.”", "Answered by: the motor stops at 90% on its own."],
    ["pull", "Pulls toward H2o", "“I want to know without climbing up there.”", "Answered by: the level, live, on Home."],
    ["anxiety", "Anxiety", "“What if it fails while nobody's watching?”", "Answered by: cut-offs on the device and two failure screens."],
    ["habit", "Habit", "“I know the sound it makes when it's nearly full.”", "Answered by: the wall switch always wins."],
  ]) + fine("These are assumptions from desk research, not interviews. People switch when the push and the pull beat the anxiety and the habit."));

// The four principles every screen is checked against. They come out of decision 1.
const principles = `<ol class="pr reveal">${[
  ["State before controls", "No home screen that opens on a power button."],
  ["Every action leaves a receipt", "No silent schedules."],
  ["Colour means something", "No colour used to fill space."],
  ["The wall switch always wins", "No flow that traps a household in the app."],
].map(([t, r]) => `<li><h3>${t}</h3><p>${r}</p></li>`).join("")}</ol>`;

// Each decision is told in six parts: title, hook (the section head), before, decision,
// after, result. The options I weighed are drawn, not written, wherever they can be.
const before = (t, p) => P("w5 t12", `<p class="st-k">Before</p>` + pt(t) + ps(p));
const decide = (big, p) => P("w7 t12", `<p class="st-k">Decision</p>` + xl(big) + ps(p), "blue");
const result = (t, p, tone) => bx([P("w12", `<p class="st-k">Result</p>` + pt(t) + ps(p), tone)]);

// How it works, in four steps a recruiter can follow without reading the rest.
const hwIco = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const HOW = [
  ["Sense", hwIco('<path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/>'), "A sonar sensor on the lid reads the level. It never touches the water."],
  ["Decide", hwIco('<rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2"/>'), "The unit by the switch starts the motor at 25% and stops it at 90%, off-peak when it can."],
  ["Protect", hwIco('<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>'), "If the sump runs dry or the motor overheats, it cuts power in under 200 ms, with or without internet."],
  ["Show", hwIco('<rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/>'), "The app shows the level live, keeps a receipt for every run, and stops the motor in one tap."],
];
const secHow = sec(shead("s-how", "", "How it works", "A kit that fits the tank, pump and switch a home already has, and an app that tells you what it's doing.") +
  `<div class="hw reveal">
    <ol class="hw-steps">${HOW.map(([t, ico, p]) => `<li><span class="hw-ico">${ico}</span><h3>${t}</h3><p>${e(p)}</p></li>`).join("")}</ol>
    <div class="hw-phone">${phone("screen-f1.jpg", F[0][2], 720, 1558, ' loading="lazy"')}</div>
  </div>`);

// What it saves. Design behaviour, in-app examples and one estimate, each labelled as such.
const secImpact = sec(shead("s-impact", "", "What it saves", "Water that used to run over the top, and power that used to run at the wrong hour.") +
  `<div class="im reveal">
    <div class="im-c im-c--water">
      <p class="im-k">${hwIco('<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>')}Water</p>
      <p class="im-n">Never past <b>90%</b></p>
      <p class="im-p">The motor stops at 1,800 of 2,000 litres, so the tank doesn't overflow.</p>
      <ul class="im-l">
        <li><b>42 L</b><span>lost overnight, flagged by the leak alert the next morning (the app's example)</span></li>
        <li><b>500 L</b><span>is where a refill starts, so the tank never sits empty waiting for someone</span></li>
      </ul>
    </div>
    <div class="im-c im-c--power">
      <p class="im-k">${hwIco('<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>')}Power</p>
      <p class="im-n"><b>20 to 40%</b> lower bills</p>
      <p class="im-p">Estimated for large facilities, from filling only as needed and at off-peak hours.</p>
      <ul class="im-l">
        <li><b>38%</b><span>cheaper for tonight's fill, moved to the off-peak tariff (the app's example)</span></li>
        <li><b>&lt;200 ms</b><span>to cut the motor on a dry run, before it burns out</span></li>
      </ul>
    </div>
  </div>` + fine("None of this is measured in the homes yet. The study will report real litres and units saved."));

const d1 = sec(shead(STORIES[0][0], "", STORIES[0][2], "Most apps want a daily open. This one works when the person who runs the pump stops climbing up to the roof.") +
  bx([
    before("A remote for the motor", "The controllers on sale could start and stop a pump. None could say what the tank would do next, or prove what it had done."),
    decide("A witness that can act.", "State and proof come first, controls second. It costs screen space a plain remote wouldn't need."),
    P("w12", optionGrid + cap("The three options I weighed. Only one shows the tank and proves what it did.")),
  ]) +
  label("Four rules hold every screen to that.") + principles +
  label("After: the tank first, the controls second.") +
  screens([
    screenCard(0, "Opens on the tank, with how fresh the reading is."),
    screenCard(5, "Every run has a cost and a cause."),
    screenCard(6, "Smart says what it plans tonight, and how sure it is."),
  ], 3, false, "h2-gallery--strip") +
  result("In about 100 homes", "My target is fewer than three app opens a week by week six, which would mean people stopped checking. Not measured yet.", "lime"));

const d2 = sec(shead(STORIES[1][0], "", STORIES[1][2], "People reach for Stop when something already looks wrong, so every second counts.") +
  bx([
    before("Below the fold, behind a dialog", "On small phones Stop needed a scroll, and it asked for confirmation like any destructive action."),
    decide("One tap, no dialog. The wall switch always wins.", "A stray tap can stop the motor. Restarting is one tap, and the app says why it stopped."),
    P("w12", stopSteps + cap("What stands between “that looks wrong” and a stopped motor.")),
  ]) +
  label("After: Stop is one tap on every surface.") + surfaces + flowStop +
  bx([
    P("w4 h2 t6 m12", phone("screen-f3.jpg", F[2][2], 720, 1558, ' loading="lazy"'), "flat h2-live tall"),
    P("w8 t6 m12", `<p class="st-k">Result</p>` + pt("Target: stopped in under 3 seconds") + ps("Measured as the median in a planned study. The unit's button and Manual switch work with the phone or router down."), "lime"),
    P("w8 t6 m12", pt("Why no undo") + ps("Restarting a pump isn't a neutral undo, and an undo bar would cover the reading.")),
  ]));

const d3 = sec(shead(STORIES[2][0], "", STORIES[2][2], "An alert that asks before it explains gets dismissed, or believed for no reason.") +
  bx([
    before("The question came first", "My first version led with two buttons and put the evidence underneath."),
    decide("If Smart can't explain why, it asks.", "The chart comes before the choices, so it takes one glance longer. A wrong shut-off at 5 AM costs far more."),
  ]) +
  label("After: what Smart saw, then two choices.") + flowLeak +
  bx([
    P("w4 h2 t6 m12", phone("screen-f8.jpg", F[7][2], 720, 1558, ' loading="lazy"'), "flat h2-live tall"),
    P("w8 t6 m12", pt("Only what the kit can do") + ps("The main choice pauses automatic filling, with Resume. The inlet valve is still planned, so “Close the valve” waits for it.")),
    P("w8 t6 m12", `<p class="st-k">Result</p>` + pt("Not measured yet") + ps("Every answer is logged, so a study can count how often households agree with Smart.")),
  ]));

const d4 = sec(shead(STORIES[3][0], "", STORIES[3][2], "Nobody fills a bucket in percent.") +
  bx([
    before("One big percentage", "Every reading needed a sum: how many buckets is that, and how long until it's full?"),
    decide("Percent, litres and minutes, read as one answer.", "Three numbers where there was one, so they sit together in one block."),
    P("w12", tankDiagram + cap("One reading three ways, with the two levels the motor works between.")),
  ]) +
  label("After: litres and minutes everywhere, down to the receipt for each fill.") + flowDaily +
  screens([
    screenCard(1, "Each level labelled in percent and litres, beside its handle."),
    screenCard(3, "Automatic says exactly when the motor starts and stops."),
  ]) +
  result("Nothing left to convert", "Every percentage sits beside litres and every wait is in minutes. Not measured in a study yet."));

const d5 = sec(shead(STORIES[4][0], "", STORIES[4][2], "After the installs I went back through every screen against Nielsen's heuristics and the Laws of UX. My first fix didn't go far enough.") +
  bx([
    before("Polished, with quiet contradictions", "Quiet hours banned night fills while Smart planned one at 1:40 AM. Tabs had no labels, and Stop was a bare square."),
    decide("One lead per screen, and colour that means one thing.", "The lime card every screen leaned on now shows only while the motor runs. People who knew the old app will need a moment."),
    P("w12", issueBar + stagesRow([["34", "issues found in the review"], ["12", "fixed in a first pass that kept the old look"], ["11", "screens redesigned on one system"]])),
  ]) +
  label("After: four tabs, one level deep. Settings sit behind the tank menu.") + iaMap +
  label("Two states the app never had: a silent sensor and no internet.") +
  screens([screenCard(8), screenCard(9)]) +
  result("Eleven screens on one system", "The failure screens answer the fear behind the product: automatic things break when nobody's watching. Not tested with households yet.", "lime"));

const secAI = sec(shead("s-ai", "", "How I built it with AI", "I made the calls; Claude Code wrote and rendered the code. Change a screen once and everything below follows.") +
  pipeline +
  bx([
    P("w6 t12", pt("I decided") + `<ul class="p-check">${["The principles, and every decision on the journey", "Which review findings to fix, and what to keep", "When a version wasn't good enough, my own included"].map((i) => `<li>${e(i)}</li>`).join("")}</ul>`),
    P("w6 t12", pt("The AI did") + `<ul class="p-check">${["Wrote the screens in HTML and CSS", "Audited them against heuristics and anti-slop rules", "Rendered every image and built the film"].map((i) => `<li>${e(i)}</li>`).join("")}</ul>`),
  ]));

const secMess = sec(shead("s-mess", "", "What went wrong", "Mistakes I caught late, compromises I kept, and what isn't finished.") +
  messList([
    ["Changed", "low", "I designed for a valve the kit doesn't have", "The first leak alert offered to close it. It now pauses automatic filling instead."],
    ["Redesigned", "low", "My first fix didn't fix the feel", "Twelve fixes later the screens still looked busy, so I rebuilt the system (decision 5)."],
    ["Kept", "dim", "Some numbers don't add up", "Flow, run times and energy come from different stages. I kept them rather than invent new ones."],
    ["Not measured", "dim", "No study yet", "Every result here is a target, set before the study."],
    ["Not built", "crit", "English and iPhone only", "The homes are in Andhra Pradesh and Telangana, where most phones run Android and many people read Telugu."],
  ]));

const secStatus = sec(shead("s-status", "", "Targets, set before the study", "So they can't be picked afterwards. The kit and app are in about 100 homes; none of this is measured yet.") +
  heartBoard([
    ["Happiness", "4 of 5", "would leave it running unattended by week 4"],
    ["Engagement", "<3 a week", "app opens by week 6. Meant to fall."],
    ["Adoption", "85%", "reach a first automatic fill within 24 hours"],
    ["Retention", "70%", "still on Automatic at day 60, after a fault"],
    ["Task success", "<3 s", "median time to stop the motor"],
  ]) +
  bx([
    ["48", "px", "smallest touch target"], ["56", "px", "for Stop, never confirmed"], ["200", "%", "text size without breaking"], ["0", "", "states shown by colour alone"],
  ].map(([n, u, t]) => P("w3 t6", num(n, u) + ps(t)))) +
  fine("The planned study: 8 households, 6 tasks and a two-week diary. The 20 to 40% energy saving is an estimate."));

const secThemes = sec(shead("s-themes", "", "Dark and light", "Picked in Settings › Appearance, or left to follow the phone. Lime, water blue and the Stop pill look the same in both.") +
  screens([
    pairCard("f1", "Home", "The tank and the motor panel."),
    pairCard("f3", "Motor", "Lime reads the same on either ground."),
    pairCard("f8", "Possible leak", "The chart keeps its contrast in daylight."),
    pairCard("f11", "Settings", "Where the choice lives."),
  ], 2));

// Closing
const secClose = `
        <section class="h2-close reveal">
          <div class="h2-close-grid">
            <div>
              <span class="h2-close-mark" aria-hidden="true">&#10003;</span>
              <p class="h2-close-line">${e("A tank that tells you what it's about to do.")}</p>
              <p class="h2-p">H2o Connect &middot; Domestic water management &middot; A product by Dwaj&#8209;Tech &middot; 2026</p>
              <dl class="case-meta">
                <div><dt>Role</dt><dd>End to end UX and UI, sole designer</dd></div>
                <div><dt>Built with</dt><dd>Figma &middot; HTML, CSS and JavaScript &middot; Claude Code</dd></div>
                <div><dt>Contact</dt><dd><a href="mailto:sthita.ksp2709@gmail.com">sthita.ksp2709@gmail.com</a></dd></div>
              </dl>
            </div>
            <figure class="h2-close-photo"><img src="../assets/h2o-connect.jpg" alt="H2o Connect running on a phone held in front of rooftop water tanks" width="1600" height="1000" loading="lazy" decoding="async" /></figure>
          </div>
        </section>`;

// Page order: the decision map and the film first, then the problem, the five decision
// stories, how it was built, the mess, and the product in full.
S.push(secProblem, secJob, secHow, secImpact, d1, d2, d3, d4, secEvolve, d5, secAI, secMess, secSystem, secProduct, secIsland, secDevices, secDesign, secThemes, secStatus, secClose);

// ---------- next project ----------
const next = `
    <section class="section case-next">
      <div class="wrap">
        <p class="eyebrow">Next project</p>
        <a class="next-project" href="atomic-design.html">
          <div class="next-project-media">
            <img src="../assets/atomic/card.jpg" alt="Atomic UI Design title board: the redesigned JetPhotos home page on lilac, peach and green iMacs" width="1600" height="1000" loading="lazy" decoding="async" />
          </div>
          <div class="next-project-body">
            <h2 class="display next-project-title">Atomic Design</h2>
            <p class="next-project-desc">A HUD-inspired design system for JetPhotos, built from atoms to pages, then rebuilt in four existing systems.</p>
            <span class="project-arrow" aria-hidden="true">
              <svg width="13" height="13" viewBox="3.43 3.43 17.14 17.14" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.29" aria-hidden="true"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>
            </span>
          </div>
        </a>
        <div class="case-next-actions">
          <a class="btn btn-primary" href="../index.html#work">
            <span class="dot" aria-hidden="true">
              <svg width="11" height="11" viewBox="3.43 3.43 17.14 17.14" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.29" aria-hidden="true"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>
            </span>
            All projects
          </a>
        </div>
      </div>
    </section>
  </main>

`;

// Walkthrough film: a product film of the real app. The ten screens from build-screens.js run
// live inside the phone (in a shadow root, so the page's styles stay out), headlines animate in
// beside it, and details lift out as callouts. assets/h2o/film.js computes every frame from
// the clock and drives the screens, the finger and the camera.
const SCREENS = require("./build-screens.js");
const appIcon = (h) => h.split(SCREENS.ICON).join(A + "app-icon.svg");
const FILM_APP_CSS = `
:host{position:absolute;inset:0;display:block;overflow:hidden;background:#09090b;font-family:Archivo,system-ui,sans-serif;color:#f4f6fa;-webkit-font-smoothing:antialiased}
.app{position:absolute;left:0;top:0;width:360px;height:779px;overflow:hidden;transform-origin:0 0;transform:scale(var(--k,1));background:#09090b}
.app>.scr{position:absolute;left:0;top:0;visibility:hidden;transform-origin:50% 50%}
.scr::after{content:"";position:absolute;inset:0;z-index:30;background:#000;opacity:var(--dim,0);pointer-events:none}
.seg{position:relative}.seg span{position:relative;z-index:1}.seg span.on{background:none}
.seg-k{position:absolute;top:4px;left:4px;height:44px;width:calc((100% - 16px)/3);border-radius:22px;background:#cbf848;transform:translateX(calc(var(--i,0) * (100% + 4px)))}
.spl{position:absolute;inset:0;z-index:1800;display:grid;place-items:center;background:#09090b}
.spl img{width:96px;height:96px;border-radius:22px}
.nb{position:absolute;left:10px;right:10px;top:50px;z-index:1500;display:flex;gap:12px;padding:12px 14px;border-radius:22px;background:#26282e;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08),0 12px 30px rgba(0,0,0,.5);visibility:hidden}
.nb img{flex:none;width:38px;height:38px;border-radius:9px}
.nb div{flex:1;min-width:0}
.nb-h{display:flex;justify-content:space-between;font:500 12px/1 Archivo;letter-spacing:.02em;color:#99a1ae}
.nb-t{margin-top:6px;font:600 15px/1.25 Archivo}
.nb-b{font:400 14px/1.3 Archivo;color:#c3c8d0}
.tst{position:absolute;left:50%;top:58px;z-index:1500;display:flex;align-items:center;gap:10px;height:46px;padding:0 16px 0 9px;border-radius:23px;background:#f4f6fa;color:#0d0e11;font:600 14px/1 Archivo;white-space:nowrap;box-shadow:0 12px 30px rgba(0,0,0,.5);visibility:hidden}
.tst i{display:grid;place-items:center;width:28px;height:28px;border-radius:50%;background:#cbf848}
.tst b{margin-left:6px;color:#1d4ed8}
.tch{position:absolute;left:0;top:0;z-index:2000;width:46px;height:46px;margin:-23px 0 0 -23px;pointer-events:none;opacity:0}
.tch i,.tch b{position:absolute;inset:0;border-radius:50%}
.tch i{background:rgba(255,255,255,.32);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.75),0 4px 14px rgba(0,0,0,.4)}
.tch b{box-shadow:inset 0 0 0 2px rgba(255,255,255,.8);opacity:0}
`;
const nb = (k, title, body) => `<div class="nb" data-k="${k}"><img src="${A}app-icon.svg" alt="" width="38" height="38" /><div><p class="nb-h"><span>H2O CONNECT</span><span>now</span></p><p class="nb-t">${title}</p><p class="nb-b">${body}</p></div></div>`;
const filmApp = `<template data-app><style>${SCREENS.css}${FILM_APP_CSS}</style><div class="app">
${SCREENS.ORDER.map((k) => `<div class="scr${SCREENS.S[k].cls ? " " + SCREENS.S[k].cls : ""}" data-k="${k}">${appIcon(SCREENS.S[k].body)}</div>`).join("\n")}
${nb("low", "Water is low", "Overhead tank at 22%. The motor is off.")}
${nb("leak", "Possible leak", "42 L lost overnight while every tap was closed.")}
<p class="tst"><i><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0d0e11" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></i>Automatic filling paused<b>Resume</b></p>
<div class="spl"><img src="${A}app-icon.svg" alt="" width="96" height="96" /></div>
<span class="tch"><i></i><b></b></span>
</div></template>`;

// Headlines, one per beat: [kicker, lines, sub]. Times live in film.js.
const BEATS = [
  ["H2o Connect", ["A tank you can see.", "A pump you can stop."], "The app for a retrofit kit on rooftop tanks, now in about 100 homes."],
  ["Decision 1 · Home", ["The tank comes", "before anything else."], "Level in percent and litres, how fresh the reading is, and what the motor is doing."],
  ["Decision 4 · Fill range", ["Two levels,", "set on the tank."], "Drag either handle. Every level reads in percent and in litres."],
  ["Decision 2 · Motor", ["Stop. One tap.", "No dialog."], "“Running” is confirmed by current draw, and Stop never asks twice."],
  ["Alerts", ["It asks", "before it acts."], "In Manual, a low tank gets a warning and an offer. The choice stays with you."],
  ["Modes", ["Three modes,", "one tap apart."], "Automatic fills between your two levels. Smart plans around tariffs and your quiet hours."],
  ["Usage", ["Every run", "leaves a receipt."], "Litres and electricity side by side, with what each run cost and what started it."],
  ["Decision 3 · Leak", ["Evidence first.", "Then a choice."], "The only alert that interrupts shows what Smart saw before it asks anything."],
  ["Decision 5 · Failsafes", ["Built for", "the bad day."], "Sensor silent: Automatic holds off. Internet down: the unit runs on its own, and Stop still works at home."],
  ["The whole app", ["Ten screens, one tank."], ""],
  ["A product by Dwaj‑Tech", ["H2o Connect"], "Shows what the pump is about to do, proves what it did, and hands control back in one tap."],
];
// Big outlined figures behind the phone, one per chapter; film.js counts them up.
const NUMS = 8;
const DROP = '<path d="M12 2.5c-.6 3-2.4 5.7-4.7 7.6C5.6 11.6 4.6 13.5 4.6 15.6a7.4 7.4 0 0 0 14.8 0c0-2.1-1-4-2.7-5.5C14.4 8.2 12.6 5.5 12 2.5z" fill="currentColor"/>';
const beat = ([k, lines, sub], i) => `<div class="mg-beat" data-b="${i}"><p class="mg-k">${e(k)}</p><p class="mg-h">${lines.map((l) => `<span class="mg-l">${l.split(" ").map((w) => `<span class="mg-w"><span>${e(w)}</span></span>`).join(" ")}</span>`).join("")}</p><p class="mg-p">${e(sub)}</p></div>`;
// Details that lift out of the phone: [kicker, title, sub].
const CALLOUTS = [
  ["Fresh reading", "Live · updated 9:41", "Every number says how old it is."],
  ["Both levels", "90% · 1,800 L", "25% · 500 L"],
  ["Stopped", "Under 200 ms", "The relay answers that fast. Manual until you switch back, and the wall switch always wins."],
  ["Smart", "Learned from 34 days", "92% confident. Tonight’s fill waits until after quiet hours."],
  ["Receipt", "18 min · 720 L · ₹1.80", "Started at 25%"],
  ["What Smart saw", "−42 L overnight", "Every tap was closed."],
];
const callout = ([k, t, s], i) => `<div class="mg-co" data-c="${i}"><i class="mg-co-line"></i><p class="mg-co-k">${e(k)}</p><p class="mg-co-t">${e(t)}</p><p class="mg-co-s">${e(s)}</p></div>`;

const ic = (d, cls) => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const I_VOL = '<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/>';
const FILM_CH = [["Home", 0, 9.5], ["Range", 9.5, 16], ["Stop", 16, 23.5], ["Alerts", 23.5, 28.5], ["Modes", 28.5, 35], ["Usage", 35, 41.5], ["Leak", 41.5, 50], ["Failsafes", 50, 57], ["The app", 57, 70]];
const film = `
        <header class="h2-head h2-head--solo" id="s-film">
          <div>
            <h2 class="h2-title">See it in motion</h2>
            <p class="h2-intro">${e("Seventy seconds of the app in use: the tank, the fill range, Stop, the alerts, the three modes, usage, the leak alert and the two failure states.")}</p>
          </div>
        </header>
        <div class="h2-card mo mg reveal" data-film>
          <p class="sr-only">${e("Animated walkthrough of the H2o Connect app on a phone. The app opens on Home and the tank fills to 78%, 1,560 of 2,000 litres, with a live reading. A tap on the tank opens the fill range, where both levels are dragged to 90% and 25%, shown in litres too. On the Motor tab, one tap on Stop stops the motor with no confirmation and the app says it stays in Manual. A low water notification opens the alert, which offers to start the motor and to switch to Automatic. In Modes, a tap on Smart shows its prediction, learned from 34 days, and tonight’s off-peak plan. Usage shows the week’s water and electricity and every motor run with its cost and what started it. A possible leak notification opens the alert: the chart of expected and actual levels comes first, then 42 litres lost overnight, then two choices, and pausing automatic filling shows a toast with Resume. Home then shows Sensor not reporting and No internet, and all ten screens turn together in an arc before the end card.")}</p>
          <div class="mo-stage">
            <div class="mg-vis" aria-hidden="true">
              <svg class="mg-water" preserveAspectRatio="none"><path class="mg-wave mg-wave--b" /><path class="mg-wave mg-wave--f" /></svg>
              ${Array.from({ length: NUMS }, (_, i) => `<p class="mg-num" data-n="${i}"></p>`).join("")}
              <svg class="mg-drop" viewBox="0 0 24 24">${DROP}</svg><i class="mg-rip"></i>
              <div class="mg-type">${BEATS.map(beat).join("")}</div>
              ${CALLOUTS.map(callout).join("")}
              <div class="mg-wall">${SCREENS.ORDER.map((k) => `<div class="mg-card"><img src="${A}screen-${k}.jpg" alt="" width="720" height="1558" loading="lazy" decoding="async" /></div>`).join("")}</div>
              <div class="mg-phone"><div class="mg-screen"><div class="mg-app"></div></div><i class="mg-island"></i></div>
            </div>
          </div>
          ${filmApp}
          <div class="mo-bar">
            <button class="mo-play" type="button" aria-label="Play walkthrough"><svg class="mo-i-play" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/></svg><svg class="mo-i-pause" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="14" y="3" width="5" height="18" rx="1"/><rect x="5" y="3" width="5" height="18" rx="1"/></svg></button>
            <div class="mo-chs">${FILM_CH.map(([l, a, b]) => `<button class="mo-ch" type="button" style="flex-grow:${(b - a).toFixed(1)}" aria-label="Jump to ${l}"><span class="mo-ch-track"><i></i></span><span class="mo-ch-l">${l}</span></button>`).join("")}</div>
            <button class="mo-snd" type="button" aria-pressed="false" aria-label="Turn sound on">${ic(I_VOL + '<path d="m22 9-6 6"/><path d="m16 9 6 6"/>', "mo-i-off")}${ic(I_VOL + '<path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/>', "mo-i-on")}</button>
          </div>
        </div>`;

const skip = `
        <div class="h2-skip-wrap reveal">
          <a class="h2-skip" href="#s-product" aria-describedby="h2-skip-note"><span class="h2-skip-label">Skip to the final design</span><span class="h2-skip-chev" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></span></a>
          <p class="h2-skip-note" id="h2-skip-note">Jumps past the decisions to the ten screens</p>
        </div>`;
S.unshift(sec(film + skip), sec(secJourney));

const html = head + `  <main id="top" class="case-h2o">` + hero + `

    <section class="section case-plates">
      <div class="wrap">
` + S.join("\n") + `
      </div>
    </section>
` + next + tail;

fs.writeFileSync(SITE + "/projects/h2o-connect.html", html.replace('<script src="../script.js"></script>', '<script src="../script.js"></script>\n  <script src="../assets/h2o/film.js" defer></script>'));
// Report any dash left in the visible copy of the main column (the film's app screens are UI, not copy).
const main = html.slice(html.indexOf("<main"), html.indexOf("</main>")).replace(/<template[\s\S]*?<\/template>/g, "").replace(/<[^>]+>/g, " ");
const dashes = (main.match(/[^\n]{0,30}[\u2014\u2013][^\n]{0,30}/g) || []);
console.log("wrote", html.length, "chars;", S.length, "blocks; dashes left:", dashes.length);
dashes.slice(0, 20).forEach((d) => console.log("  ", d.replace(/\s+/g, " ").trim()));
