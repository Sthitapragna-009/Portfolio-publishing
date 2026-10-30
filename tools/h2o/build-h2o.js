// Builds projects/h2o-connect.html. Copy rewritten from the Figma "Case Study · Portfolio"
// board (page 10): plainer, outcome led, no em dashes, six week timeline.
// v3: told as four decision stories (title, hook, before, decision, after, result).
// Research was desk research; the kit and app are installed in about 100 homes.
// Personas, journey, plan, structure and the directions scorecard sit in an appendix.
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
  .replace(/<meta name="description" content="[^"]*"/, '<meta name="description" content="H2o Connect: a retrofit water tank kit and app, installed in about 100 homes, that shows what the pump is about to do, proves what it just did, and hands control back in one tap. Told as four design decisions."')
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

// Section head: a chip naming the part, the title as a sentence, the hook under it.
const shead = (id, chip, title, intro) => `
        <header class="h2-head h2-head--solo" id="${id}">
          <div>
            <div class="h2-chips"><span class="h2-chip-n">${e(chip)}</span></div>
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
          <div><dt>Scope</dt><dd>Desk research, system, app, 8 screens</dd></div>
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
const mono = (t) => `<p class="p-k">${e(t)}</p>`;
const num = (n, u) => `<p class="p-n">${e(n)}${u ? `<small>${e(u)}</small>` : ""}</p>`;
const pt = (t) => `<h3 class="p-t">${e(t)}</h3>`;
const ps = (t) => `<p class="p-s">${e(t)}</p>`;
const fine = (t) => `<p class="h2-fine reveal">${e(t)}</p>`;
const pimg = (img, alt, w, h, cap) => `<img class="p-img" src="${A}${img}" alt="${e(alt)}" width="${w}" height="${h}" loading="lazy" decoding="async" />${cap ? `<p class="p-cap">${e(cap)}</p>` : ""}`;
const chips = (items, tone) => `<ul class="p-pills${tone ? " p-pills--" + tone : ""}">${items.map((i) => `<li>${e(i)}</li>`).join("")}</ul>`;

// The problem, and how the work was done
const secProblem = sec(shead("s-problem", "The problem", "Water comes for a few hours. Nobody can see the tank.", "Piped water arrives for a few hours a day. Homes store it in a rooftop tank and pump it up by hand, with no gauge and no warning.") +
  bx([
    P("w6 h2 t12", pimg("overflow-splash.jpg", "Water gushing over the rim of an overfilled storage tank", 800, 450, "Every overflow is water the household already paid to pump."), "photo"),
    P("w3 t6", mono("source: MIT Tata Center") + num("<6", "hrs") + ps("of piped supply a day in many Indian cities")),
    P("w3 t6", mono("source: World Bank") + num("2", "hrs") + ps("what most town homes receive on a normal day"), "hatch"),
    P("w3 t6", mono("source: Jal Jeevan Mission, 2024") + num("73.9", "%") + ps("of rural homes now have a tap. The problem has moved indoors."), "lime"),
    P("w3 t6", pimg("overflow-rooftop.jpg", "A blue rooftop water tank overflowing from its top outlet", 433, 319, "No gauge, so the first sign of full is water down the side."), "photo"),
    P("w7 t12", mono("the gap") + `<p class="p-xl">${e("People check the tank because nothing proves what it is doing. The product has to supply the proof.")}</p>`, "blue"),
    P("w5 t12", mono("how I worked") + ps("Desk research into piped supply and the float switches and app controllers on sale. No formal interviews or usability study: the design changes in the stories below came from my own reviews.") + ps("The kit and app were then installed and tested with Dwaj‑Tech in about 100 homes in Visakhapatnam, Narsapuram and Hyderabad. After that I reviewed my own screens and rebuilt them (decision 5).")),
  ]));

// The four stories, listed up front so a reader can jump to one.
const STORIES = [
  ["s-d1", "Decision 1 · strategic · weeks 1 and 2", "Why I designed an app people should open less"],
  ["s-d2", "Decision 2 · strategic · weeks 3 and 4", "Why Stop never asks “Are you sure?”"],
  ["s-d3", "Decision 3 · micro · week 4", "Why the leak alert proves before it asks"],
  ["s-d4", "Decision 4 · micro · week 5", "Why the tank speaks in litres, not just percent"],
  ["s-d5", "Decision 5 · iteration · after the installs", "How reviewing my own app found 34 problems, and why I fixed twelve"],
];
const secToc = sec(shead("s-decisions", "Decision log", "Five decisions, in the order I made them", "Each one runs the same way: what was there before, the options I weighed, what I chose and gave up, and what changed. The last one is me going back through my own work.") +
  bx(STORIES.map(([id, kick, t], i) => P(i < 3 ? "w4 t6" : i === 3 ? "w6 t6" : "w6 t12", mono(kick) + `<h3 class="p-t p-t--link"><a href="#${id}">${e(t)}</a></h3>`))));

// 03 People: radial stakeholders + three personas
const STK = [
  { tone: "lime", col: "#cbf848", r0: 62, r1: 155, ring: "Primary", title: "The pump keeper", desc: "Runs the motor and takes the blame.", nodes: [["Pump keeper", -90]] },
  { tone: "water", col: "#5b8bff", r0: 155, r1: 250, ring: "Secondary", title: "Everyone else at home", desc: "Find the problem at the tap, not the tank.", nodes: [["Family", -150], ["Kids", -30], ["Tenants", 30], ["House help", 150]] },
  { tone: "low", col: "#ffa53d", r0: 250, r1: 350, ring: "Tertiary", title: "Trades, RWA, power company", desc: "Decide what can be installed and what power costs.", nodes: [["Plumber", -120], ["Electrician", -60], ["RWA", 60], ["Power company", 120]] },
];
const stkSvg = (() => {
  const C = 360, Pt = (r, a) => [C + r * Math.cos(a * Math.PI / 180), C + r * Math.sin(a * Math.PI / 180)];
  let rings = "", spokes = "", nodes = "", labels = "";
  [...STK].reverse().forEach((t) => {
    rings += `<circle cx="${C}" cy="${C}" r="${t.r1}" fill="${t.col}" fill-opacity="0.07" stroke="${t.col}" stroke-opacity="0.45" stroke-width="1.5"/>`;
  });
  STK.forEach((t) => {
    const rm = (t.r0 + t.r1) / 2;
    t.nodes.forEach(([name, a]) => {
      const [x, y] = Pt(rm, a), [sx, sy] = Pt(62, a);
      spokes += `<line x1="${sx.toFixed(1)}" y1="${sy.toFixed(1)}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${t.col}" stroke-opacity="0.55" stroke-width="1.5" stroke-dasharray="3 4"/>`;
      const w = Math.round(name.length * 12.2 + 50);
      nodes += `<g><rect x="${(x - w / 2).toFixed(1)}" y="${(y - 22).toFixed(1)}" width="${w}" height="44" rx="22" fill="#131519" stroke="${t.col}" stroke-width="1.5"/><circle cx="${(x - w / 2 + 21).toFixed(1)}" cy="${y.toFixed(1)}" r="6" fill="${t.col}"/><text x="${(x - w / 2 + 36).toFixed(1)}" y="${(y + 7).toFixed(1)}" font-size="20" font-weight="600" fill="#f4f6fa">${e(name)}</text></g>`;
    });
    labels += `<text x="${C}" y="${(C + rm + 6).toFixed(1)}" text-anchor="middle" font-size="16" font-weight="700" letter-spacing="0.08em" fill="${t.col}">${t.ring.toUpperCase()}</text>`;
  });
  const centre = `<circle cx="${C}" cy="${C}" r="62" fill="#0d0e11" stroke="rgba(249,249,249,0.18)" stroke-width="1.5"/><image href="${A}app-icon.svg" x="${C - 21}" y="${C - 40}" width="42" height="42"/><text x="${C}" y="${C + 26}" text-anchor="middle" font-size="18" font-weight="700" fill="#f9f9f9">H2o Connect</text>`;
  return `<svg class="stk-svg" viewBox="0 0 720 720" role="img" aria-label="Stakeholder map: H2o Connect at the centre; the pump keeper in the primary ring; family, kids, tenants and house help in the secondary ring; plumber, electrician, RWA and power company in the tertiary ring" font-family="Archivo, system-ui, sans-serif">${rings}${spokes}${labels}${centre}${nodes}</svg>`;
})();
const persona = (tone, L, name, role, quote, tests) => P("w4 t12", `<div class="pp"><span class="h2-avatar h2-avatar--${tone}" aria-hidden="true">${L}</span><div><b>${name}</b><small>${e(role)}</small></div></div><p class="pp-q">${e(quote)}</p>${mono("tests · " + tests)}`);
const appPeople = sec(shead("s-people", "People", "Who the product has to serve", "One person carries the job; everyone else notices only when it fails. The personas and their quotes are assumptions built from desk research, not people I interviewed.") +
  bx([
    P("w7 t12", stkSvg, "flat stk-p"),
    P("w5 t12", `${mono("three rings")}<ol class="stk-legend">${STK.map((t) => `<li style="--c:${t.col}"><p class="h2-k h2-k--${t.tone}">${t.ring}</p><h3 class="p-t">${e(t.title)}</h3><p class="p-s">${e(t.desc)}</p></li>`).join("")}</ol>`),
    persona("lime", "M", "Meera, 47", "The pump keeper", "“I know the sound it makes when it's nearly full. I don't trust anything else.”", "trust"),
    persona("water", "R", "Rohit, 29", "The optimiser", "“If it can't tell me why it did that, I'll switch it off.”", "interoperability"),
    persona("low", "S", "Suresh, 62", "The sceptic", "“The switch is downstairs. That's where I'll be.”", "accessibility"),
  ]));

// 04 Empathy and journey
const eq = (cls, ico, title, notes) => `
            <div class="h2-eq h2-eq--${cls}">
              <div class="h2-eq-head"><span class="h2-eq-ico" aria-hidden="true">${icons[ico]}</span><div><b>${title}</b></div></div>
              ${notes.map((n) => `<p class="h2-note-chip">${e(n)}</p>`).join("")}
            </div>`;
const J = [
  ["Supply arrives", "06:30", "“Is it a supply day?”", "good"],
  ["Notices it", "0 to 40 min", "“Did someone switch it on?”", "bad"],
  ["Walks to the switch", "+1 min", "“How long has it run?”", "mid"],
  ["Motor on", "+0 min", "“Twenty minutes should do.”", "good"],
  ["Waits and guesses", "5 to 20 min", "“Is that our pump or the neighbour's?”", "bad", "The wait"],
  ["Climbs to check", "+15 min", "“Better to look than flood the terrace.”", "bad", "The climb"],
  ["Switches off early", "+22 min", "“Full is a guess.”", "mid"],
  ["Lives with it", "Next morning", "“Tomorrow I'll start earlier.”", "bad"],
];
const snake = `<div class="snake-card reveal"><ol class="snake" aria-label="Current journey for one refill, in eight stages">${[0, 1, 2, 3].map((r) => `
          <li class="snake-row${r % 2 ? " snake-row--rtl" : ""}">${[0, 1].map((c) => {
            const i = r * 2 + c, [name, time, quote, tone, pain] = J[i];
            return `<div class="snake-stop snake-stop--${tone}"><span class="snake-dot" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span><div class="snake-txt"><p class="p-k">${e(time)}${pain ? ` · <b>pain point</b>` : ""}</p><b>${e(name)}</b><span>${e(quote)}</span></div></div>`;
          }).join("")}</li>`).join("")}
        </ol></div>`;
const appJourney = sec(shead("s-journey", "Journey", "One refill, as it happens today", "An assumed pump keeper, Meera, built from desk research. Of the eight stages in a refill, two carry most of the pain: the wait and the climb.") + `
        <div class="h2-emap reveal" role="group" aria-label="Empathy map for Meera, the pump keeper">
          <div class="h2-emap-centre"><span class="h2-avatar" aria-hidden="true">M</span><b>Meera, 47</b><small>The pump keeper</small></div>` +
  eq("says", "says", "Says", ["“The tank's nearly full, I can hear it.”", "“Last time it ran dry, the motor burnt out.”"]) +
  eq("thinks", "thinks", "Thinks", ["If I forget now, there's no water at six.", "Automatic things break when nobody's watching."]) +
  eq("does", "does", "Does", ["Climbs to the terrace to look inside.", "Switches off early on purpose."]) +
  eq("feels", "feels", "Feels", ["Responsible by default.", "Wary of anything that takes the switch away."]) +
  `</div>` + snake);

// The four principles every screen is checked against. They come out of decision 1.
const principles = bx([
  ["State before controls", "a home screen that opens on a power button"],
  ["Every action leaves a receipt", "silent schedules and automation with no history"],
  ["Colour means something", "colour used only to fill space"],
  ["The wall switch always wins", "any flow that traps a household inside the app"],
].map(([t, r], i) => P("w3 t6", `${pt(t)}${mono("rules out: " + r)}`, i === 3 ? "lime" : "")), "bx--principles");

// 06 Plan: six-week phase chart
const G = [
  ["Research", 1, 2, "low"],
  ["Structure", 3, 4, "water"],
  ["Design and prove", 5, 6, "lime"],
];
const GW = [
  ["Home visits and shadowing", "low"], ["Personas, journey, insights", "low"], ["Ecosystem, IA and flows", "water"],
  ["Three directions, scored", "water"], ["System and eight screens", "lime"], ["Prototype and study plan", "lime"],
];
const appPlan = sec(shead("s-plan", "Plan", "Six weeks, start to prototype", "From desk research to a working prototype, before the installs began.") + `
        <div class="h2-scroll reveal"><div class="gantt" role="img" aria-label="Six week plan: research in weeks 1 and 2, structure in weeks 3 and 4, design and proof in weeks 5 and 6">
          ${G.map(([t, a, b, tone]) => `<p class="gantt-phase gantt-phase--${tone}" style="grid-column:${a} / ${b + 1}"><span>Phase ${G.findIndex((g) => g[0] === t) + 1}</span>${e(t)}</p>`).join("")}
          ${GW.map((_, i) => `<p class="gantt-wk" style="grid-column:${i + 1}">W${i + 1}</p>`).join("")}
          ${GW.map(([t, tone], i) => `<div class="gantt-cell" style="grid-column:${i + 1}"><span class="gantt-block gantt-block--${tone}${i === 3 ? " gantt-block--hatch" : ""}"></span><span class="gantt-label">${e(t)}</span></div>`).join("")}
        </div></div>` +
  bx([
    P("w7 t12", mono("in scope") + `<ul class="p-check">${["Automatic, Manual and Smart","8 screens and 2 alerts","Design system","Hardware architecture","Watch and smart home","HTML prototype"].map((i) => `<li>${e(i)}</li>`).join("")}</ul>`),
    P("w5 t12", mono("left out on purpose") + `<ul class="p-check p-check--out">${["First run pairing","Multiple properties","Billing","Hindi UI","Trained ML models"].map((i) => `<li>${e(i)}</li>`).join("")}</ul>`, "hatch"),
  ]));

// 07 Hardware
const secSystem = sec(shead("s-system", "System", "The kit it runs on", "A sonar sensor on the tank and a display unit beside the motor switch, built with Dwaj‑Tech and installed in about 100 homes. It works with the tank, pump and switch a home already has.") +
  bx([
    P("w7 h2 t12", `<figure class="h2-proto-photo">
            <img src="${A}prototype-unit.webp" alt="Working prototype of the H2o Connect display and control unit: a white wall box with a small display reading level 75 percent, volume 748 litres and motor off, a Manual and Auto toggle switch, a red ON and OFF button, and Powered by Dwaj Tech" width="1024" height="1024" loading="lazy" decoding="async" />
            <span class="h2-pin" style="left:21.7%;top:50%">1</span>
            <span class="h2-pin" style="left:45.7%;top:40%">2</span>
            <span class="h2-pin" style="left:42%;top:60.5%">3</span>
            <span class="h2-pin" style="left:94%;top:69.5%">4</span>
          </figure>`, "light photo"),
    P("w5 t12", `${mono("working prototype · final design in progress")}<ol class="h2-pins">
              <li><b>Display</b><span>Level, volume and motor state, without a phone.</span></li>
              <li><b>Manual and Auto switch</b><span>Manual always wins, in hardware.</span></li>
              <li><b>ON and OFF button</b><span>Works with the phone or router down.</span></li>
              <li><b>Wiring</b><span>Enters beside the existing switch.</span></li>
            </ol>`),
    P("w5 t12", `<div class="p-split"><div>${mono("zero contact sensing")}${num("0", "corrosion")}${ps("Sonar reads the air gap. Nothing touches the water.")}</div><div>${mono("automated motor control")}${num("20 to 40", "%")}${ps("lower energy bills, estimated for large facilities.")}</div></div>`, "blue"),
  ]) +
  bx([
    ["safety · on the device", "<200", "ms", "Dry run, overflow and thermal cut offs. Needs no internet.", "lime"],
    ["control · on the phone", "<1", "s", "Mode, levels, start and stop over the home network.", ""],
    ["memory · in the cloud", "30+", "days", "History and the pattern Smart learns. Slows down, never fails.", "hatch"],
  ].map(([k_, n, u, p, m]) => P("w4 t12", mono(k_) + num(n, u) + ps(p), m))) +
  bx([
    ["tank", "Tank sensor", "In use", "Sonar under the lid, magnetic mount."],
    ["unit", "Display unit", "In use", "Switches the motor, confirms it by current."],
    ["sump", "Sump sensor", "Planned", "A dry run guard on the sump."],
    ["valve", "Inlet valve", "Planned", "Lets Smart close the inlet on a leak."],
  ].map(([ic, t, st, p]) => P("w3 t6", `<span class="p-glyph" aria-hidden="true">${icons[ic]}</span>${pt(t)}${ps(p)}<p class="p-tag${st === "Planned" ? " p-tag--mute" : ""}">${st}</p>`, st === "Planned" ? "hatch" : "")).concat([
    P("w12", `<div class="p-strip">${[["20", "min", "to install"], ["1", "step", "needs an electrician"], ["0", "", "drilling or rewiring"]].map(([n, u, t]) => `<div>${num(n, u)}${ps(t)}</div>`).join("")}<div>${mono("joins the home over Matter")}${chips(["Apple Home", "Alexa", "Google Home", "SmartThings"])}</div></div>`),
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
  ["home", "Home", "Tab 1", ["Level, litres, time to full", "Motor status", "This week", "Active alert"], true, false],
  ["motor", "Motor", "Tab 2", ["Start and stop", "Power, run time, cost", "Faults", "Bypass at the switch"], true, false],
  ["modes", "Modes", "Tab 3", ["Automatic", "Manual", "Smart", "Back to Manual"], false, false],
  ["history", "Usage", "Tab 4", ["Every fill and its cost", "Event log", "Leak records", "Export"], false, false],
  ["settings", "Settings", "Top bar", ["Tanks and sensors", "Members", "Matter link", "Text size, language"], false, true],
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
            <span class="fl-num">${num_}</span>
            <div class="fl-title"><h3>${e(title)}</h3></div>
            <div class="fl-tags"><span class="fl-mode">${e(mode)}</span><span class="fl-metric">${e(metric)}</span></div>
          </div>
          <div class="h2-scroll fl-scroll"><ol class="fl-track" style="--n:${nodes.length}">${nodes.map(([kind, label, text, opts]) => {
            const dot = kind === "step" ? String(++step) : flIcons[kind];
            return `<li class="fl-step fl-step--${kind}"><span class="fl-dot"><span>${dot}</span></span><span class="fl-label">${e(kind === "step" ? "Step " + step : label)}</span><b>${e(text)}</b>${opts ? `<span class="fl-opts">${opts.map((o) => `<i>${e(o)}</i>`).join("")}</span>` : ""}</li>`;
          }).join("")}</ol></div>
        </div>`;
};
const appStructure = sec(shead("s-structure", "Structure", "Five destinations, one level deep", "The information architecture, and the three flows that carry the product.") +
  `<div class="reveal"><div class="h2-scroll ia-scroll"><div class="ia" role="group" aria-label="Information architecture: H2o Connect with five destinations">
          <div class="ia-root"><img src="${A}app-icon.svg" alt="" width="36" height="36" /><div><b>H2o Connect</b><small>Five destinations, one level deep</small></div></div>
          <ol class="ia-l1">${IA.map(([ic, t, where, leaves, fab, deep]) => `
            <li class="ia-branch ia-branch--${ic}">
              <div class="ia-node"><span class="ia-ico">${iaIcons[ic]}</span><div><b>${t}</b><small>${where}</small></div>${fab ? '<span class="ia-fab">Fill now</span>' : ""}</div>
              <ul class="ia-leaves${deep ? " ia-leaves--deep" : ""}">${leaves.map((l) => `<li><span>${e(l)}</span></li>`).join("")}</ul>
            </li>`).join("")}
          </ol>
          <div class="ia-legend" aria-hidden="true"><span><i class="ia-key ia-key--node"></i>Destination</span><span><i class="ia-key ia-key--leaf"></i>Content and actions</span><span><i class="ia-key ia-key--deep"></i>Opens a sub page</span><span><i class="ia-key ia-key--fab"></i>Fill now, a floating action</span></div>
        </div></div>${scrollHint("map")}</div>` +
  `<div class="h2-block" style="gap:clamp(0.9rem,2vw,1.25rem)">` +
  flow("01", "The daily fill, with nobody watching", "Automatic", "Zero taps", [
    ["trigger", "Trigger", "Level drops below 25%"],
    ["step", "", "Checks quiet hours and tariff"],
    ["step", "", "Motor starts, confirmed by current"],
    ["step", "", "Home shows level and time to full"],
    ["step", "", "Stops at 90%"],
    ["outcome", "Outcome", "Receipt: 440 L · 22 min · ₹2.10"],
  ]) +
  flow("02", "Something the system can't explain", "Smart", "One decision", [
    ["trigger", "Trigger", "42 L lost overnight, taps closed"],
    ["step", "", "Compared with 34 days of history"],
    ["step", "", "One notification at 5:04 AM"],
    ["decision", "Evidence", "What Smart saw"],
    ["decision", "Decision", "Two choices", ["Pause automatic filling", "That was us"]],
    ["outcome", "Outcome", "Logged, and the pattern updates"],
  ]) +
  flow("03", "Taking it back", "Any mode", "One tap · under 200 ms", [
    ["trigger", "Trigger", "Any screen, any mode"],
    ["step", "", "One tap on Stop, no dialog"],
    ["step", "", "Relay responds in under 200 ms"],
    ["step", "", "“Manual until you switch back”"],
    ["outcome", "Outcome", "Automatic resumes only when asked"],
  ]) + `</div>`);

// 09 Directions: wireframes, three explorations, the scorecard
const exp = (img, dir, name, verdict, alt, tone) => `
            <figure class="shot-card">
              <div class="h2-stage h2-stage--${tone}">${phone(img, alt, 720, 1558, ' loading="lazy"')}</div>
              <figcaption>${mono(dir)}<h3 class="p-t">${e(name)}</h3><p class="p-s">${e(verdict)}</p></figcaption>
            </figure>`;
const score = [
  ["State before controls", "hold", "hold", "break", "hold"],
  ["Every action leaves a receipt", "break", "break", "hold", "hold"],
  ["Colour means something", "hold", "break", "none", "hold"],
  ["The wall switch always wins", "break", "break", "hold", "hold"],
];
const markTxt = { hold: "Holds", break: "Breaks", none: "Not attempted" };
const cols = ["A · Ambient dark", "B · Bento", "C · Platform native", "Final"];
const explorations = `<div class="shots h2-gallery h2-gallery--explore reveal" data-shots style="--cols:3;margin:0"><div class="shots-track">` +
  exp("exp-a.jpg", "direction a", "Ambient dark", "Readable from across the room, but nothing could ever look urgent. Kept: the colour discipline.", "Direction A, ambient dark: a glowing blue tank at 78% with motor, eco and boost cards below", "water") +
  exp("exp-b.jpg", "direction b", "Bento", "Clear hierarchy, but colour was spent on decoration. Kept: the card structure.", "Direction B, bento: saturated blue and lime blocks for overview, tank level and weekly usage", "lime") +
  exp("exp-c.jpg", "direction c", "Platform native", "Nothing to learn, and nothing to remember. Kept: the plain labels.", "Direction C, platform native: a light iOS style settings layout with tank, motor toggle and automation rows", "water") +
  `</div></div>`;
const appDirections = sec(shead("s-directions", "Directions", "Wireframes and the scorecard", "Greyscale wireframes fixed the hierarchy before any colour. The three visual directions in decision 1 were scored against the four principles like this.") +
  `<div class="reveal"><div class="h2-scroll"><figure class="h2-sheet"><img src="${A}wireframes.webp" alt="Six greyscale wireframes: Home, the whole state on one screen; Fill range, two levels on one screen; Modes, Smart as an equal, not an upgrade; Alert, evidence before the question; Motor, confirmed rather than assumed; History, who or what acted" width="2280" height="725" loading="lazy" decoding="async" /></figure></div>${scrollHint("sheet")}</div>` +
  card(`${mono("scored against the four principles")}<div class="h2-scroll"><table class="h2-table h2-table--stack"><thead><tr><th scope="col">Principle</th>${cols.map((c) => `<th scope="col">${e(c)}</th>`).join("")}</tr></thead><tbody>${score.map(([p, ...m]) => `<tr><th scope="row">${e(p)}</th>${m.map((v, i) => `<td data-label="${e(cols[i])}"><span class="h2-mark h2-mark--${v}">${markTxt[v]}</span></td>`).join("")}</tr>`).join("")}</tbody></table></div>`, "reveal"));

// 10 Design system: palette blocks, type, components, icon
const PAL = [
  ["Lime · the motor", "#CBF848", "203, 248, 72", "16.2 : 1", "AAA", "pal--lime"],
  ["Water", "#2F6BFF", "47, 107, 255", "4.4 : 1", "Large only", "pal--water"],
  ["Text", "#FFFFFF", "255, 255, 255", "19.9 : 1", "AAA", "pal--white"],
  ["Alert · low", "#FFA53D", "255, 165, 61", "10.2 : 1", "AAA", "pal--low"],
  ["Alert · critical", "#FF4D5E", "255, 77, 94", "6.1 : 1", "AA", "pal--crit"],
  ["Text · muted", "#99A1AE", "153, 161, 174", "7.6 : 1", "AAA", "pal--muted"],
  ["Text · faint", "#626A77", "98, 106, 119", "3.6 : 1", "Restricted", "pal--faint"],
];
const ramp = [
  ["F/Hero", "52 / 56 · Bold", "78%", "font-size:52px;font-weight:700;letter-spacing:-0.03em"],
  ["F/Number", "34 / 38 · Bold", "04:12", "font-size:34px;font-weight:700"],
  ["F/Headline", "26 / 32 · SemiBold", "Possible leak", "font-size:26px;font-weight:600"],
  ["F/Title", "18 / 24 · SemiBold", "Tonight's plan", "font-size:18px;font-weight:600"],
  ["F/Body", "14 / 20 · Regular", "1,560 of 2,000 litres", "font-size:14px;font-weight:400"],
  ["F/Label", "12 / 16 · Medium", "Filling · 12 min left", "font-size:12px;font-weight:500"],
];
const secDesign = sec(shead("s-design", "Design system", "Colour that means something", "Five colour roles, one typeface and six component sets, with contrast measured against the app background.") +
  `<div class="pal reveal" role="list" aria-label="Colour palette">${PAL.map(([n, h, rgb, r, g, cls]) => `<div class="pal-b ${cls}" role="listitem"><p class="pal-n">${e(n)}</p><dl class="pal-v"><div><dt>HEX</dt><dd>${h}</dd></div><div><dt>RGB</dt><dd>${rgb}</dd></div><div><dt>Contrast</dt><dd>${r} · ${e(g)}</dd></div></dl></div>`).join("")}</div>` +
  bx([
    P("w5 h2 t12", pimg("icon-mockup.jpg", "An iPhone home screen showing the H2o Connect app icon, a water drop inside a house on a blue squircle, labelled H2o Connect", 736, 736, "On the home screen"), "photo"),
    P("w7 t12", `${mono("type · archivo")}<dl class="h2-type">${ramp.map(([n, s, t, st]) => `<div><dt>${n}<small>${s}</small></dt><dd style="${st}">${e(t)}</dd></div>`).join("")}</dl>`),
    P("w7 t12", `${mono("app icon · ios, watchos, wear os")}<div class="h2-icon-row">${[["app-icon.svg", 120, "Home screen"], ["app-icon.svg", 60, "Spotlight"], ["app-icon-round.svg", 88, "Apple Watch"], ["app-icon-round.svg", 64, "Galaxy Watch"]].map(([f, s, l]) => `<figure><img src="${A}${f}" alt="" width="${s}" height="${s}" loading="lazy" /><figcaption>${l}</figcaption></figure>`).join("")}</div>${mono("system rules")}${chips(["48 px targets, 56 px for Stop", "28 px card radius", "800 ms level easing", "160 ms state change", "No colour only states", "No confirm on Stop"])}`),
    P("w12", `${mono("components · six sets, twenty variants")}<div class="h2-scroll"><figure class="h2-sheet h2-sheet--dark ds-sheet" style="--sheet-min:62rem"><img src="${A}ds-components.webp" alt="Component sheet. Tank: level drives colour and fill height, and only the critical state uses red. Button: action, neutral and stop. Toggle: on and off always labelled. Setting row: the building block of every settings screen. Tab bar: four destinations plus Fill now on top." width="2208" height="340" loading="lazy" decoding="async" /></figure></div>`),
  ]));

// 11 The product
const F = [
  ["Home", "The tank is the largest element and the only thing in blue. A live line says how fresh the reading is.", "Home: tank at 78%, 1,560 of 2,000 litres, live and updated 9:41, filling with 12 minutes left; motor running automatically for 04:12 with a labelled Stop button; 1,240 litres this week; labelled tabs, with Fill now dimmed while the tank fills", "water"],
  ["Fill range", "Two levels, set once, in litres as well as percent.", "Fill range: stop filling at 90% (1,800 L), start filling at 25% (500 L), dragged on the tank itself", "water"],
  ["Motor", "“Running” is confirmed by current draw. Stop never asks twice.", "Motor: running automatically, 04:12 of about 18 minutes, 22 L/min, 0.75 kW, dry run protection on, and a Stop motor button", "lime"],
  ["Modes", "Three equal modes, one tap apart. Quiet hours never clash with Smart.", "Modes: Automatic selected, explaining that the motor starts at 25% and turns off at 90%, with eco mode, boost and quiet hours from 9 PM to 1 AM", "lime"],
  ["Low water alert", "Manual mode warns, but never acts.", "Low water alert in manual mode: tank at 22%, motor off, with Start motor and Remind me in 15 minutes", "low"],
  ["Usage", "Every run shows what it cost and what started it.", "Usage: 1,240 litres and 8.4 units this week, a daily bar chart, and recent motor runs with their cost and cause, marked auto or manual", "water"],
  ["Smart mode", "Every prediction shows its confidence.", "Smart mode: reaching 25% at 4:10 PM tomorrow, learned from 34 days at 92% confidence; tonight's plan fills 01:40 to 02:05 off peak, after quiet hours, saving 38%", "lime"],
  ["Smart insight", "Evidence first, then only what the installed kit can do.", "Smart insight: possible leak, 42 litres lost overnight, expected versus actual chart, then Pause automatic filling or That was us", "crit"],
  ["Sensor not reporting", "Automatic holds off until the sensor is back. The unit's cut-offs still protect the motor.", "Sensor not reporting: the tank greyed at its last reading from 2 hours ago, with Check sensor and Start motor", "low"],
  ["No internet", "The unit keeps running on its own, and Stop still works on home Wi‑Fi.", "No internet: an offline bar, the tank greyed at its last update at 9:12 AM, a note that the unit runs on its own, and the motor card with Stop still active", "water"],
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
const secProduct = sec(shead("s-product", "Product", "The ten screens", "Every screen answers “what's happening?” before it offers an action, including when the sensor or the internet drops out.") +
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
    P("w4 t6 m12", mono("compact · beside the camera") + pt("Level and time left") + ps("A ring fills with the tank on one side of the camera and the countdown runs on the other. It turns orange when the tank runs low.")),
    P("w4 t6 m12", mono("expanded · one tap") + pt("Stop, start, switch mode") + ps("Auto, Manual and Smart sit beside the motor button. Each change confirms in the line under the timer, so the island never jumps away.")),
    P("w8 t6 m12", mono("alerts · grow out of the island, then fold back") + `<div class="h2-alerts">${alertCol("low", "Water is low", "Start motor, or Later") + alertCol("lime", "Tank full", "Stopped at 90%, 1,800 L") + alertCol("crit", "Possible leak", "Close inlet, or That was us")}</div>`),
    P("w4 t6 m12", mono("from any app") + num("2", "taps") + ps("to stop the motor: the island, then Stop."), "lime"),
    P("w4 t6 m12", mono("rules it keeps") + `<ol class="h2-rules">${["Only outside the app, as on iOS", "Auto on a low tank starts the motor", "Stop never asks twice"].map((r) => `<li>${e(r)}</li>`).join("")}</ol>`, "hatch"),
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

// Status: what is real, what is designed, and what a study would measure
const secStatus = sec(shead("s-status", "Status", "What's real, and what's next", "The kit and app are in about 100 homes, but nothing here has been measured in a study yet. The numbers below are targets, set before the study so they can't be chosen afterwards.") +
  bx([
    P("w6 t12", mono("in homes now") + num("~100", "homes") + ps("Kit and app installed and tested with Dwaj‑Tech in Visakhapatnam, Narsapuram and Hyderabad."), "lime"),
    P("w6 t12", mono("not done yet") + `<ul class="p-check p-check--out">${["A usability study with households", "Measured results from the installs", "The sump sensor and the inlet valve", "Telugu and Android versions, for where the kit is installed"].map((i) => `<li>${e(i)}</li>`).join("")}</ul>`, "hatch"),
  ]) +
  bx([
    ["48", "px", "minimum touch target"], ["56", "px", "for Stop, never confirmed"], ["200", "%", "text size without breaking"], ["0", "", "states shown by colour alone"],
  ].map(([n, u, t]) => P("w3 t6", mono("accessibility") + num(n, u) + ps(t)))) +
  bx([
    P("w4 t12", mono("edge states designed") + num("11") + ps("What the app shows, and what the system does, when something goes wrong."), "hatch"),
    P("w8 t12", `<ol class="p-states">${[["Sensor silent","warn"],["Battery low","warn"],["Power cut mid fill","cut"],["Running, not filling","cut"],["Two people act at once","info"],["Smart still learning","info"],["Tank drained on purpose","info"],["Water in quiet hours","info"],["No internet","warn"],["Motor overheats","cut"],["Phone replaced","info"]].map(([t, s], i) => `<li class="sev--${s}"><p class="p-k">${String(i + 1).padStart(2, "0")}</p>${e(t)}</li>`).join("")}</ol><ul class="p-legend"><li class="sev--cut">cuts power on the device</li><li class="sev--warn">warns and waits</li><li class="sev--info">informs, nothing stops</li></ul>`),
  ]) +
  bx([
    ["happiness", "4 of 5", "would leave it running unattended by week 4"],
    ["engagement", "<3", "app opens a week by week 6. Designed to fall."],
    ["adoption", "85%", "reach a first automatic fill within 24 hours"],
    ["retention", "70%", "still automatic at day 60, after a fault"],
    ["task success", "<3 s", "median time to stop the motor"],
  ].map(([d, n, t], i) => P("w4 t6", mono("target · " + d) + num(n) + ps(t), i === 4 ? "blue" : "")).concat([
    P("w4 t6", mono("planned study") + `<div class="p-strip">${[["8", "households"], ["6", "tasks"], ["2", "week diary"]].map(([n, t]) => `<div>${num(n)}${ps(t)}</div>`).join("")}</div>`),
  ])) + fine("None of these targets have been measured yet. The 20 to 40% energy figure is an estimate."));

// ---------- the four decision stories ----------
// Each runs title, hook, before, decision, after, result. The "before" states are
// described in words: only the final screens exist as images.
const label = (t) => `<p class="h2-step reveal">${e(t)}</p>`;
const xl = (t) => `<p class="p-xl">${e(t)}</p>`;

// The options weighed for a decision: name, then why it lost (or "Chosen").
const opts = (rows) => P("w6 t12", mono("options I weighed") + `<dl class="p-dl">${rows.map(([a, b]) => `<div><dt>${e(a)}</dt><dd>${e(b)}</dd></div>`).join("")}</dl>`);
const tradeoff = (t, p) => P("w4 t12", mono("trade-off") + pt(t) + ps(p));
const decision = (big, p) => P("w8 t12", mono("decision") + xl(big) + ps(p), "blue");

const d1 = sec(shead(STORIES[0][0], STORIES[0][1], STORIES[0][2], "Most apps want a daily open. This one works when the person who runs the pump stops climbing up to check the tank.") +
  bx([
    P("w6 t12", mono("before") + pt("A remote control for the motor") + ps("The float switches and app controllers on sale could start and stop a pump. None could say what the tank was about to do, or prove what it had just done. So people kept checking by hand: listening for the overflow, climbing to the roof, switching off early.")),
    opts([
      ["A remote for the motor", "What the products on sale already do. It saves the walk to the switch, not the climb to the roof."],
      ["A fully automatic black box", "Nothing to learn and nothing to trust. The first silent failure sends people back to checking."],
      ["A witness that can act", "Chosen. It shows what it is about to do, proves what it did, and stops in one tap."],
    ]),
    decision("Not a controller. A witness that can act.", "State and evidence come first, controls second. Every automatic action leaves a receipt, and one tap takes control back. Four principles hold every screen to that."),
    tradeoff("More to show, less magic", "Every automatic action now needs evidence and a receipt on screen. That costs space and design time a plain remote would not."),
  ]) +
  principles +
  label("Three visual directions were scored against the principles. None held all four, so the final design keeps one thing from each.") +
  explorations +
  label("After: the tank first, the controls second.") +
  screens([
    screenCard(0, "Opens on the tank: level, litres, time to full, and how fresh the reading is. The motor card says what it is doing."),
    screenCard(5, "Every run is logged with what it cost and what started it."),
    screenCard(6, "Smart says what it plans to do tonight, and how sure it is."),
  ], 3, false, "h2-gallery--strip") +
  bx([P("w12", mono("result") + pt("In about 100 homes, with the app") + ps("Installed and tested with Dwaj‑Tech. The target is fewer than three app opens a week by week six, which would mean people have stopped checking. It has not been measured yet."), "lime")]));

const d2 = sec(shead(STORIES[1][0], STORIES[1][1], STORIES[1][2], "Stop is the button people reach for when something already looks wrong. A confirmation dialog there costs seconds, and trust.") +
  bx([
    P("w6 t12", mono("before") + pt("Stop sat below the fold") + ps("In my own review of the first layout, Stop needed a scroll on small phones, and it followed the usual pattern of confirming a destructive action. For a motor that may be running dry, both are a delay.")),
    opts([
      ["Confirm before stopping", "The standard for destructive actions. It costs seconds when the motor may be running dry."],
      ["Stop, then offer undo", "Kinder to mis-taps, but restarting a pump is not a neutral undo, and the bar covers the reading."],
      ["One tap, no dialog, and the wall switch wins", "Chosen. A mis-tap costs one restart; a slow stop can cost a motor."],
    ]),
    decision("One tap, no dialog, and the wall switch always wins.", "Stop sits in the motor card on Home and runs full width on the Motor screen, labelled, in one style. The relay answers in under 200 ms, the app says “Manual until you switch back”, and the Manual switch on the unit overrides the app in hardware."),
    tradeoff("Accidental stops can happen", "A stray tap stops the motor and switches to Manual. I accepted that: restarting is one tap, and the app says why it stopped."),
    P("w4 h2 t6 m12", phone("screen-f3.jpg", F[2][2], 720, 1558, ' loading="lazy"'), "flat h2-live tall"),
    P("w8 t6 m12", mono("after · stop from every surface") + `<dl class="p-dl">${[
      ["Phone", "In the motor card on Home, full width on the Motor screen"],
      ["Dynamic Island", "Two taps from any app"],
      ["Watch", "Where the thumb lands"],
      ["Kitchen display", "“Alexa, stop the pump”"],
      ["The unit", "A red ON and OFF button, and a Manual switch that overrides the app"],
    ].map(([a, b]) => `<div><dt>${e(a)}</dt><dd>${e(b)}</dd></div>`).join("")}</dl>`),
    P("w8 t6 m12", mono("result") + pt("Target: under 3 seconds to stop") + ps("The median time to stop the motor in a planned study, not measured yet. On the unit itself, the ON and OFF button and the Manual switch work with the phone or router down."), "lime"),
  ]));

const d3 = sec(shead(STORIES[2][0], STORIES[2][1], STORIES[2][2], "An alert that asks “Close the valve?” before it shows why gets dismissed, or believed without a reason.") +
  bx([
    P("w6 t12", mono("before") + pt("The question came first") + ps("My first version led with the two buttons and put the evidence underneath. Reviewing it, I was asking people to act on a claim the app had not shown yet.")),
    opts([
      ["Ask first, explain below", "My first version. Quick to act on, but it asks for trust before it earns it."],
      ["Act on its own", "Shut off water without asking. Fast, but a false alarm at 5 AM leaves the family with no water."],
      ["Evidence first, then two choices", "Chosen. Slower by one glance, and every answer teaches Smart."],
    ]),
    decision("If Smart can't explain why, it doesn't act. It asks.", "The chart of expected against actual comes first, then two choices. “That was us” is a full answer: it logs the event and teaches Smart the household's pattern. Smart is a rule engine over 30 days of the home's own data, not a chatbot or a trained model."),
    tradeoff("Slower by one glance", "The chart takes a moment to read before the buttons. For a possible leak, a few seconds matter less than a wrong shut-off."),
    P("w4 h2 t6 m12", phone("screen-f8.jpg", F[7][2], 720, 1558, ' loading="lazy"'), "flat h2-live tall"),
    P("w8 t6 m12", mono("the mess · a part that isn't built") + pt("I designed for a valve the kit doesn't have") + ps("The first alert's main button was “Close the inlet valve”. The valve is still planned hardware, so in the homes where the kit is installed that button could never work. The alert now offers what the kit can do, pause automatic filling, with an undo. Homes with a valve will get “Close the inlet valve”."), "hatch"),
    P("w8 t6 m12", mono("result") + pt("Not measured yet") + ps("Every answer is logged, so a study can count how often households agree with what Smart saw.")),
  ]));

const d4 = sec(shead(STORIES[3][0], STORIES[3][1], STORIES[3][2], "“78%” means little at the tap. “1,560 of 2,000 litres, full in 12 minutes” answers the question people actually ask.") +
  bx([
    P("w6 t12", mono("before") + pt("One big percentage") + ps("Early screens led with a single percentage. In my own review, every reading needed a conversion: how many buckets is that, and how long until it's full? The Automatic card had the same gap: it said “Automatic” without saying what it would do.")),
    opts([
      ["Percent only", "Compact, and what most tank apps show. But nobody fills a bucket in percent."],
      ["Litres only", "Concrete, but meaningless without knowing the size of the tank."],
      ["Both, with time to full", "Chosen. Percent for the shape of the tank, litres and minutes for the question at the tap."],
    ]),
    decision("Litres and minutes at equal weight, and settings that say what they will do.", "Home shows litres beside the percentage and time to full in minutes. The fill range is set on the tank itself, and the Automatic card spells out both levels."),
    tradeoff("More numbers on Home", "Three readings where there was one. I keep them in one block so they read as a single answer."),
  ]) +
  screens([
    screenCard(1, "Both levels dragged on the tank, in percent and litres, with a line on what the choice costs."),
    screenCard(3, "The Automatic card spells out both levels: the motor starts at 25% and stops at 90%."),
  ]) +
  bx([P("w12", mono("result") + pt("Nothing left to convert") + ps("On Home and Fill range every percentage sits beside litres, and every wait is in minutes. Not measured in a study yet."))]));

// Decision 5 is the journey back through my own work: the original screens against the rebuilt ones.
const vCard = (img, tag, title, cap, alt, tone) => `
            <figure class="shot-card">
              <div class="h2-stage h2-stage--${tone}">${phone(img, alt, 720, 1558, ' loading="lazy"')}</div>
              <figcaption>${mono(tag)}<h3 class="p-t">${e(title)}</h3><p class="p-s">${e(cap)}</p></figcaption>
            </figure>`;
const d5 = sec(shead(STORIES[4][0], STORIES[4][1], STORIES[4][2], "With the kit in about 100 homes, I went back through every screen against Nielsen's ten heuristics and the Laws of UX. The polish was hiding problems.") +
  bx([
    P("w6 t12", mono("before") + pt("A polished app with quiet contradictions") + ps("Quiet hours banned the motor at night while Smart planned a 1:40 AM fill. The tabs were icons with no labels. Stop on Home was a bare square. The leak alert offered a valve the kit doesn't have, and nothing showed whether the reading was live.")),
    opts([
      ["Rebuild to the letter of the review", "Fix all 34, including the lime colour and every number. Weeks of work, and the app would lose the look households already know."],
      ["Leave it", "It works in homes today. But these contradictions are exactly what erodes trust."],
      ["Fix what breaks trust, keep the signature", "Chosen. Twelve fixes, two new screens, three things kept on purpose."],
    ]),
    decision("Fix what breaks trust. Keep what people already recognise.", "Labels on every tab, a labelled Stop in one style, a live line on the reading, a cost and a cause on every run, a leak action the kit can actually do, and quiet hours that Smart never breaks."),
    tradeoff("Three things I kept", "The lime running card, Stop inside it, and the existing numbers. Lime now means “the motor”, not “press this”, and the numbers still don't fully reconcile across screens. Both are on my list."),
  ]) +
  label("Before and after: the original screens, then the rebuilt ones.") +
  screens([
    vCard("v1-screen-f1.jpg", "before", "Home", "Icon-only tabs, a bare square for Stop, and no sign of whether 78% was live.", "The original Home screen: tank at 78%, a lime motor card with an unlabelled square stop button, and a tab bar of five icons with no labels", "water"),
    vCard("screen-f1.jpg", "after", "Home", "Labelled tabs, a labelled Stop, a live line, and Fill now dimmed while the tank fills.", F[0][2], "water"),
    vCard("v1-screen-f8.jpg", "before", "Possible leak", "The main button closed a valve the installed kit doesn't have.", "The original leak alert, with Close the inlet valve and That was us, ignore it", "crit"),
    vCard("screen-f8.jpg", "after", "Possible leak", "Pause automatic filling, which the kit can do, and a shorter second choice.", F[7][2], "crit"),
  ], 4) +
  label("And two states the app never had: when the sensor goes quiet, and when the internet drops.") +
  screens([screenCard(8), screenCard(9)]) +
  bx([P("w12", mono("result") + pt("34 issues found, 4 of them major. 12 fixes built.") + ps("The two new screens answer the fear behind the whole product: automatic things break when nobody's watching. Not tested with households yet."), "lime")]));

// ---------- appendix ----------
const appendix = `
        <details class="h2-appx reveal" id="s-appendix">
          <summary><span class="h2-chip-n">Appendix</span><span class="h2-appx-t">Process: people, journey, plan, structure and directions</span><span class="h2-appx-chev" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></span></summary>
          <div class="h2-appx-body">${appPeople}${appJourney}${appPlan}${appStructure}${appDirections}</div>
        </details>`;


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
                <div><dt>Built with</dt><dd>Figma &middot; HTML, CSS and JavaScript prototype</dd></div>
                <div><dt>Contact</dt><dd><a href="mailto:sthita.ksp2709@gmail.com">sthita.ksp2709@gmail.com</a></dd></div>
              </dl>
            </div>
            <figure class="h2-close-photo"><img src="../assets/h2o-connect.jpg" alt="H2o Connect running on a phone held in front of rooftop water tanks" width="1600" height="1000" loading="lazy" decoding="async" /></figure>
          </div>
        </section>`;

// Page order: the problem, the four decisions, then the product in full, and
// the process last, folded away.
S.push(secProblem, secToc, d1, d2, d3, d4, d5, secSystem, secProduct, secIsland, secDevices, secDesign, secStatus, appendix, secClose);

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
  ["A product by Dwaj‑Tech", ["H2o Connect"], "Shows what the pump is about to do, proves what it did, and hands control back in one tap."],
];
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
const FILM_CH = [["Home", 0, 9.5], ["Range", 9.5, 16], ["Stop", 16, 23.5], ["Alerts", 23.5, 28.5], ["Modes", 28.5, 35], ["Usage", 35, 41.5], ["Leak", 41.5, 50], ["Failsafes", 50, 62]];
const film = `
        <header class="h2-head h2-head--solo" id="s-film">
          <div>
            <div class="h2-chips"><span class="h2-chip-n">Walkthrough</span></div>
            <h2 class="h2-title">See it in motion</h2>
            <p class="h2-intro">${e("One minute of the app in use: the tank, the fill range, Stop, the alerts, the three modes, usage, the leak alert and the two failure states.")}</p>
          </div>
        </header>
        <div class="h2-card mo mg reveal" data-film>
          <p class="sr-only">${e("Animated walkthrough of the H2o Connect app on a phone. The app opens on Home and the tank fills to 78%, 1,560 of 2,000 litres, with a live reading. A tap on the tank opens the fill range, where both levels are dragged to 90% and 25%, shown in litres too. On the Motor tab, one tap on Stop stops the motor with no confirmation and the app says it stays in Manual. A low water notification opens the alert, which offers to start the motor and to switch to Automatic. In Modes, a tap on Smart shows its prediction, learned from 34 days, and tonight’s off-peak plan. Usage shows the week’s water and electricity and every motor run with its cost and what started it. A possible leak notification opens the alert: the chart of expected and actual levels comes first, then 42 litres lost overnight, then two choices, and pausing automatic filling shows a toast with Resume. Finally Home shows Sensor not reporting and then No internet.")}</p>
          <div class="mo-stage">
            <div class="mg-vis" aria-hidden="true">
              <div class="mg-panel"></div>
              <div class="mg-type">${BEATS.map(beat).join("")}</div>
              ${CALLOUTS.map(callout).join("")}
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
S.unshift(sec(film + skip));

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
