// Builds projects/h2o-connect.html. Copy rewritten from the Figma "Case Study · Portfolio"
// board (page 10): plainer, outcome led, no em dashes, six week timeline.
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
  .replace(/<meta name="description" content="[^"]*"/, '<meta name="description" content="H2o Connect: a retrofit water tank kit and app that shows what the pump is about to do, proves what it just did, and hands control straight back. Research, system design, design system and eight screens."')
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

const shead = (n, label, title, intro, side) => `
        <header class="h2-head h2-head--solo" id="s-${n}">
          <div>
            <div class="h2-chips"><span class="h2-chip-n">${n}</span></div>
            <h2 class="h2-title">${e(label)}</h2>
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
            <p class="h2-statement reveal" data-delay="2">A water monitoring system a household or industry can <span class="hl-lime">trust to run itself</span>. One that shows <span class="hl-water">what it is about to do</span>, proves <span class="hl-water">what it just did</span>, and <span class="hl-low">hands control straight back</span> the moment something looks wrong.</p>

            <div class="case-brief reveal" data-delay="3">
              <div class="case-brief-row">
                <h2 class="case-brief-key">Outcomes</h2>
                <div class="case-brief-val">
                  <ul class="case-outcomes">
                    <li>UX research</li>
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
          <div><dt>Scope</dt><dd>Research, system, hardware, 8 screens</dd></div>
          <div><dt>Team</dt><dd>Partnered with Dwaj&#8209;Tech</dd></div>
          <div><dt>Timeline</dt><dd>6 weeks, 2026</dd></div>
          <div><dt>Tools</dt><dd>Figma, HTML/CSS/JS prototype</dd></div>
        </dl>
      </div>
    </section>`;

// ---------- sections ----------
// v2: thirteen short chapters on flush bento panels. Visuals carry the story; copy is captions.
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

// 01 Context
S.push(sec(shead("01", "Context", "", "Piped water arrives for a few hours a day. Homes store it in a rooftop tank and pump it up by hand, with no gauge and no warning.") +
  bx([
    P("w6 h2 t12", pimg("overflow-splash.jpg", "Water gushing over the rim of an overfilled storage tank", 800, 450, "Every overflow is water the household already paid to pump."), "photo"),
    P("w3 t6", mono("source: MIT Tata Center") + num("<6", "hrs") + ps("of piped supply a day in many Indian cities")),
    P("w3 t6", mono("source: World Bank") + num("2", "hrs") + ps("what most town homes receive on a normal day"), "hatch"),
    P("w3 t6", mono("source: Jal Jeevan Mission, 2024") + num("73.9", "%") + ps("of rural homes now have a tap. The problem has moved indoors."), "lime"),
    P("w3 t6", pimg("overflow-rooftop.jpg", "A blue rooftop water tank overflowing from its top outlet", 433, 319, "No gauge, so the first sign of full is water down the side."), "photo"),
  ])));

// 02 Research
S.push(sec(shead("02", "Research", "", "Pump routines are hard to recall, so the research watched them happen: the switchboard, the climb, the guess.") +
  bx([
    P("w3 t6", mono("01 · home visits") + num("8") + ps("households in Roorkee and Delhi NCR, one full fill cycle watched in each")),
    P("w3 t6", mono("02 · shadowing") + num("4×") + ps("the pump keeper checked the tank in a single cycle")),
    P("w3 t6", mono("03 · trade interviews") + num("5") + ps("plumbers and electricians on what fails: dry runs, burnt motors, corroded floats")),
    P("w3 t6", mono("04 · teardown") + num("6") + ps("products on sale today, from float switches to app controllers")),
    P("w12", mono("key finding") + `<p class="p-xl">${e("The checking comes from a lack of proof, not carelessness. The product has to supply the proof.")}</p>`, "blue"),
  ]) + fine("Participant numbers and quotes on this page are illustrative, written from the brief rather than taken from field notes.")));

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
S.push(sec(shead("03", "People", "", "One person carries the job; everyone else notices only when it fails. The app has to make sense to the whole household.") +
  bx([
    P("w7 t12", stkSvg, "flat stk-p"),
    P("w5 t12", `${mono("three rings")}<ol class="stk-legend">${STK.map((t) => `<li style="--c:${t.col}"><p class="h2-k h2-k--${t.tone}">${t.ring}</p><h3 class="p-t">${e(t.title)}</h3><p class="p-s">${e(t.desc)}</p></li>`).join("")}</ol>`),
    persona("lime", "M", "Meera, 47", "The pump keeper", "“I know the sound it makes when it's nearly full. I don't trust anything else.”", "trust"),
    persona("water", "R", "Rohit, 29", "The optimiser", "“If it can't tell me why it did that, I'll switch it off.”", "interoperability"),
    persona("low", "S", "Suresh, 62", "The sceptic", "“The switch is downstairs. That's where I'll be.”", "accessibility"),
  ])));

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
S.push(sec(shead("04", "Empathy and journey", "", "Meera calls the routine simple, yet checks the tank four times a cycle. Two moments carry most of the pain: the wait and the climb.") + `
        <div class="h2-emap reveal" role="group" aria-label="Empathy map for Meera, the pump keeper">
          <div class="h2-emap-centre"><span class="h2-avatar" aria-hidden="true">M</span><b>Meera, 47</b><small>The pump keeper</small></div>` +
  eq("says", "says", "Says", ["“The tank's nearly full, I can hear it.”", "“Last time it ran dry, the motor burnt out.”"]) +
  eq("thinks", "thinks", "Thinks", ["If I forget now, there's no water at six.", "Automatic things break when nobody's watching."]) +
  eq("does", "does", "Does", ["Climbs to the terrace to look inside.", "Switches off early on purpose."]) +
  eq("feels", "feels", "Feels", ["Responsible by default.", "Wary of anything that takes the switch away."]) +
  `</div>` + snake));

// 05 The reframe
S.push(sec(shead("05", "The reframe", "", "Four observations led to one reframe, a need statement and four principles every screen is checked against.") +
  bx([
    P("w12", mono("reframe") + `<p class="p-xxl">Not a controller.<br /><span class="hl-blue">A witness that can act.</span></p>`),
    ...[
      ["Every home could run the pump. None could say what it had done.", "State and evidence first, controls below."],
      ["One runaway cycle sent a family back to the switch for good.", "Every automatic action has a stop and a receipt."],
      ["Nobody knew what a single fill costs.", "Units and rupees, attached to each fill."],
      ["A shared job, carried by one person.", "The top card needs no setup knowledge."],
    ].map(([o, d], i) => P("w3 t6", `${mono("observation 0" + (i + 1))}${pt(o)}<p class="p-s p-foot"><span class="p-arrow" aria-hidden="true">&rarr;</span> ${e(d)}</p>`)),
    P("w7 t12", mono("need statement") + `<p class="p-lg">${e("A household that stores its own water needs to know what the tank and pump are about to do, and to stop them in one tap.")}</p>`, "hatch"),
    P("w5 t12", mono("how might we") + `<p class="p-lg">${e("Help a household trust automation enough to stop checking, while staying in control?")}</p>`, "blue"),
  ]) +
  bx([
    ["State before controls", "a home screen that opens on a power button"],
    ["Every action leaves a receipt", "silent schedules and automation with no history"],
    ["Colour means something", "colour used only to fill space"],
    ["The wall switch always wins", "any flow that traps a household inside the app"],
  ].map(([t, r], i) => P("w3 t6", `<p class="p-idx">0${i + 1}</p>${pt(t)}${mono("rules out: " + r)}`, i === 3 ? "lime" : "")), "bx--principles")));

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
S.push(sec(shead("06", "Plan", "", "Six weeks, from the first home visit to a working prototype.") + `
        <div class="h2-scroll reveal"><div class="gantt" role="img" aria-label="Six week plan: research in weeks 1 and 2, structure in weeks 3 and 4, design and proof in weeks 5 and 6">
          ${G.map(([t, a, b, tone]) => `<p class="gantt-phase gantt-phase--${tone}" style="grid-column:${a} / ${b + 1}"><span>Phase ${G.findIndex((g) => g[0] === t) + 1}</span>${e(t)}</p>`).join("")}
          ${GW.map((_, i) => `<p class="gantt-wk" style="grid-column:${i + 1}">W${i + 1}</p>`).join("")}
          ${GW.map(([t, tone], i) => `<div class="gantt-cell" style="grid-column:${i + 1}"><span class="gantt-block gantt-block--${tone}${i === 3 ? " gantt-block--hatch" : ""}"></span><span class="gantt-label">${e(t)}</span></div>`).join("")}
        </div></div>` +
  bx([
    P("w7 t12", mono("in scope") + `<ul class="p-check">${["Automatic, Manual and Smart","8 screens and 2 alerts","Design system","Hardware architecture","Watch and smart home","HTML prototype"].map((i) => `<li>${e(i)}</li>`).join("")}</ul>`),
    P("w5 t12", mono("left out on purpose") + `<ul class="p-check p-check--out">${["First run pairing","Multiple properties","Billing","Hindi UI","Trained ML models"].map((i) => `<li>${e(i)}</li>`).join("")}</ul>`, "hatch"),
  ])));

// 07 Hardware
S.push(sec(shead("07", "Hardware", "", "A sonar sensor on the tank and a display unit beside the motor switch, built with Dwaj‑Tech. It works with the tank, pump and switch a home already has.") +
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
  ]))));

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
  ["history", "History", "Tab 4", ["Every fill", "Event log", "Leak records", "Export"], false, false],
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
S.push(sec(shead("08", "Structure", "", "Five destinations, one level deep, and three flows that carry the product.") +
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
    ["decision", "Decision", "Two equal choices", ["Close the inlet valve", "That was us"]],
    ["outcome", "Outcome", "Logged, and the pattern updates"],
  ]) +
  flow("03", "Taking it back", "Any mode", "One tap · under 200 ms", [
    ["trigger", "Trigger", "Any screen, any mode"],
    ["step", "", "One tap on Stop, no dialog"],
    ["step", "", "Relay responds in under 200 ms"],
    ["step", "", "“Manual until you switch back”"],
    ["outcome", "Outcome", "Automatic resumes only when asked"],
  ]) + `</div>`));

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
S.push(sec(shead("09", "Directions", "", "Greyscale wireframes fixed the hierarchy. Three visual directions were scored against the principles, and the final design merged the best of two.") +
  `<div class="reveal"><div class="h2-scroll"><figure class="h2-sheet"><img src="${A}wireframes.webp" alt="Six greyscale wireframes: Home, the whole state on one screen; Fill range, two levels on one screen; Modes, Smart as an equal, not an upgrade; Alert, evidence before the question; Motor, confirmed rather than assumed; History, who or what acted" width="2280" height="725" loading="lazy" decoding="async" /></figure></div>${scrollHint("sheet")}</div>` +
  `<div class="shots h2-gallery h2-gallery--explore reveal" data-shots style="--cols:3;margin:0"><div class="shots-track">` +
  exp("exp-a.jpg", "direction a", "Ambient dark", "Readable from across the room, but nothing could ever look urgent. Kept: the colour discipline.", "Direction A, ambient dark: a glowing blue tank at 78% with motor, eco and boost cards below", "water") +
  exp("exp-b.jpg", "direction b", "Bento", "Clear hierarchy, but colour was spent on decoration. Kept: the card structure.", "Direction B, bento: saturated blue and lime blocks for overview, tank level and weekly usage", "lime") +
  exp("exp-c.jpg", "direction c", "Platform native", "Nothing to learn, and nothing to remember. Kept: the plain labels.", "Direction C, platform native: a light iOS style settings layout with tank, motor toggle and automation rows", "water") +
  `</div></div>` +
  card(`${mono("scored against the four principles")}<div class="h2-scroll"><table class="h2-table h2-table--stack"><thead><tr><th scope="col">Principle</th>${cols.map((c) => `<th scope="col">${e(c)}</th>`).join("")}</tr></thead><tbody>${score.map(([p, ...m]) => `<tr><th scope="row">${e(p)}</th>${m.map((v, i) => `<td data-label="${e(cols[i])}"><span class="h2-mark h2-mark--${v}">${markTxt[v]}</span></td>`).join("")}</tr>`).join("")}</tbody></table></div>`, "reveal")));

// 10 Design system: palette blocks, type, components, icon
const PAL = [
  ["Lime · action", "#CBF848", "203, 248, 72", "16.2 : 1", "AAA", "pal--lime"],
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
S.push(sec(shead("10", "Design system", "", "Five colour roles, one typeface and six component sets, with contrast measured against the app background.") +
  `<div class="pal reveal" role="list" aria-label="Colour palette">${PAL.map(([n, h, rgb, r, g, cls]) => `<div class="pal-b ${cls}" role="listitem"><p class="pal-n">${e(n)}</p><dl class="pal-v"><div><dt>HEX</dt><dd>${h}</dd></div><div><dt>RGB</dt><dd>${rgb}</dd></div><div><dt>Contrast</dt><dd>${r} · ${e(g)}</dd></div></dl></div>`).join("")}</div>` +
  bx([
    P("w5 h2 t12", pimg("icon-mockup.jpg", "An iPhone home screen showing the H2o Connect app icon, a water drop inside a house on a blue squircle, labelled H2o Connect", 736, 736, "On the home screen"), "photo"),
    P("w7 t12", `${mono("type · archivo")}<dl class="h2-type">${ramp.map(([n, s, t, st]) => `<div><dt>${n}<small>${s}</small></dt><dd style="${st}">${e(t)}</dd></div>`).join("")}</dl>`),
    P("w7 t12", `${mono("app icon · ios, watchos, wear os")}<div class="h2-icon-row">${[["app-icon.svg", 120, "Home screen"], ["app-icon.svg", 60, "Spotlight"], ["app-icon-round.svg", 88, "Apple Watch"], ["app-icon-round.svg", 64, "Galaxy Watch"]].map(([f, s, l]) => `<figure><img src="${A}${f}" alt="" width="${s}" height="${s}" loading="lazy" /><figcaption>${l}</figcaption></figure>`).join("")}</div>${mono("system rules")}${chips(["48 px targets, 56 px for Stop", "28 px card radius", "800 ms level easing", "160 ms state change", "No colour only states", "No confirm on Stop"])}`),
    P("w12", `${mono("components · six sets, twenty variants")}<div class="h2-scroll"><figure class="h2-sheet h2-sheet--dark ds-sheet" style="--sheet-min:62rem"><img src="${A}ds-components.webp" alt="Component sheet. Tank: level drives colour and fill height, and only the critical state uses red. Button: action, neutral and stop. Toggle: on and off always labelled. Setting row: the building block of every settings screen. Tab bar: four destinations plus Fill now on top." width="2208" height="340" loading="lazy" decoding="async" /></figure></div>`),
  ])));

// 11 The product
const F = [
  ["Home", "The tank is the largest element and the only thing in blue.", "Home: tank at 78%, 1,560 of 2,000 litres, filling with 12 minutes left; motor running for 04:12; 1,240 litres this week", "water"],
  ["Fill range", "Two levels, set once, in litres as well as percent.", "Fill range: stop filling at 90% (1,800 L), start filling at 25% (500 L), dragged on the tank itself", "water"],
  ["Motor", "“Running” is confirmed by current draw. Stop never asks twice.", "Motor: running automatically, 04:12 of about 18 minutes, 22 L/min, 0.75 kW, dry run protection on, Stop motor", "lime"],
  ["Automation", "Three equal modes, one tap apart.", "Automation: Automatic selected, explaining that the motor starts at 25% and turns off at 90%, with eco mode, boost and quiet hours", "lime"],
  ["Low water alert", "Manual mode warns, but never acts.", "Low water alert in manual mode: tank at 22%, motor off, with Turn on motor now and Remind me in 15 minutes", "low"],
  ["Usage", "Litres and electricity, tied to each run.", "Usage: 1,240 litres and 8.4 units this week, a daily bar chart and recent motor runs marked auto or manual", "water"],
  ["Smart mode", "Every prediction shows its confidence.", "Smart mode: reaching 25% at 4:10 PM tomorrow, learned from 34 days at 92% confidence; tonight's plan fills 01:40 to 02:05 off peak, saving 38%", "lime"],
  ["Smart insight", "Evidence first, then two equal choices.", "Smart insight: possible leak, 42 litres lost overnight, expected versus actual chart, then Close the inlet valve or That was us", "crit"],
];
S.push(sec(shead("11", "The product", "", "Every screen answers “what's happening?” before it offers an action.") +
  `<div class="shots h2-gallery reveal" data-shots style="--cols:4;margin:0"><div class="shots-track">${F.map(([t, c, alt, tone], i) => `
            <figure class="shot-card">
              <div class="h2-stage h2-stage--${tone}">${phone("screen-f" + (i + 1) + ".jpg", alt, 720, 1558, ' loading="lazy"')}</div>
              <figcaption><h3 class="p-t">${e(t)}</h3><p class="p-s">${e(c)}</p></figcaption>
            </figure>`).join("")}
          </div>
          <div class="shots-bar"><p class="shots-hint">Click any screen to enlarge</p></div>
        </div>` +
  bx([
    P("w8 t12", mono("smart mode · a rule engine over 30 days of household data") + `<p class="p-xl">${e("If Smart can't explain why, it doesn't act. It asks.")}</p>`, "blue"),
    P("w4 t12", mono("why not a chatbot") + ps("The question is “when will it be full?”, and the ideal number of steps to answer it is zero."), "hatch"),
  ])));

// 12 Beyond the phone
const shot = (img, w, h, alt, title, cap, extra) => '<figure class="shot-card"><img src="' + A + img + '" alt="' + e(alt) + '" width="' + w + '" height="' + h + '" loading="lazy" decoding="async" /><figcaption><h3 class="p-t">' + e(title) + '</h3><p class="p-s">' + e(cap) + '</p>' + (extra || "") + '</figcaption></figure>';
const gallery = (cols, items, cls) => '<div class="shots h2-gallery h2-gallery--photos' + (cls ? " " + cls : "") + ' reveal" data-shots style="--cols:' + cols + ';margin:0"><div class="shots-track">' + items.join("") + '</div></div>';
S.push(sec(shead("12", "Beyond the phone", "", "The same rules on the wrist, the speaker and the kitchen display. Every surface can stop the pump.") +
  gallery(3, [
    shot("dev-aw-1.jpg", 420, 600, "Apple Watch showing H2o: tank at 78%, 1,560 litres, filling with 12 minutes left, and a Stop button", "Apple Watch · glance", "Level and time to full. Stop where the thumb lands."),
    shot("dev-aw-3.jpg", 420, 600, "Apple Watch alert from H2o Connect: possible leak, 42 litres lost overnight, with Close valve and That was us buttons", "Apple Watch · alert", "The evidence in one line, two equal choices."),
    shot("dev-aw-4.jpg", 420, 600, "Apple Watch face at 9:41 with an H2o complication: tank at 78%, motor on, full in 12 minutes", "Apple Watch · complication", "The level stays on the watch face all day."),
    shot("dev-galaxy-1.jpg", 800, 936, "Samsung Galaxy Watch showing H2o: an arc gauge around the round screen at 78%, filling with 12 minutes left, and a round Stop button", "Galaxy Watch · status", "An arc gauge suited to the round display."),
    shot("dev-galaxy-2.jpg", 800, 936, "Samsung Galaxy Watch showing an H2o low water alert: 22% with the motor off, and a Start button", "Galaxy Watch · low water", "The same words as the phone, one Start button."),
    shot("dev-aw-2.jpg", 420, 600, "Apple Watch showing H2o with the motor off: tank at 24%, 480 litres, and a Start motor button", "Apple Watch · start", "Low tank, motor off: Start is the only action."),
  ], "h2-gallery--watch") +
  gallery(3, [
    shot("dev-homepod.jpg", 986, 740, "Concept of a HomePod with a screen showing H2o: the overhead tank at 78% with Stop pump, tonight's off peak fill plan, and a Siri request to stop the pump", "HomePod with a screen · concept", "“Hey Siri, stop the pump.”", '<p class="h2-credit">Concept device render: 9to5Mac. Screen: H2o Connect.</p>'),
    shot("dev-echo.jpg", 880, 660, "Echo Show 5 showing H2o: the overhead tank at 78%, filling, with Stop pump and Details buttons and an Alexa request", "Echo Show · Alexa", "“Alexa, how full is the tank?”"),
    shot("dev-nest.jpg", 776, 582, "Nest Hub showing H2o: the overhead tank at 78% with the pump switched on, 3 runs today, and a suggested off peak routine", "Nest Hub · Google Home", "Status on the counter, with an off peak routine."),
  ]) + fine("Anyone at home can check the level and stop the pump from any surface. Safety settings only change in the app.")));

// 13 Validation
S.push(sec(shead("13", "Validation", "", "Accessibility targets, eleven designed edge states, four fixes from prototype walkthroughs, and the metrics a study would hold the product to.") +
  bx([
    ["48", "px", "minimum touch target"], ["56", "px", "for Stop, never confirmed"], ["200", "%", "text size without breaking"], ["0", "", "states shown by colour alone"],
  ].map(([n, u, t], i) => P("w3 t6", mono("accessibility") + num(n, u) + ps(t), i === 1 ? "lime" : ""))) +
  bx([
    ["Stop sat below the fold on small phones.", "A persistent 56 px Stop beside the tab bar."],
    ["“Automatic” didn't say what it would do.", "The card now spells out both levels."],
    ["Everyone converted percent into buckets.", "Litres at equal weight, time in minutes."],
    ["The leak alert asked before it proved.", "The evidence chart moved above the buttons."],
  ].map(([b, c], i) => P("w6 t12", `${mono("iteration 0" + (i + 1) + " · what broke")}${pt(b)}<p class="p-s p-foot"><span class="p-arrow" aria-hidden="true">&rarr;</span> ${e(c)}</p>`))) +
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
  ].map(([d, n, t], i) => P("w4 t6", mono("heart · " + d) + num(n) + ps(t), i === 4 ? "blue" : "")).concat([
    P("w4 t6", mono("planned study") + `<div class="p-strip">${[["8", "households"], ["6", "tasks"], ["2", "week diary"]].map(([n, t]) => `<div>${num(n)}${ps(t)}</div>`).join("")}</div>`),
  ])) + fine("None of these metrics have been measured yet. They are set before the study, so the results can't be picked after the fact. The 20 to 40% energy figure is an estimate.")));


// Closing
S.push(`
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
        </section>`);

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

// Walkthrough film: from the tap on the iPhone home screen, through the app, to the hardware,
// the watches and the smart displays. The timeline lives in assets/h2o/film.js.
const FILM_SCR = [["f1", "fade"], ["f3", "fade"], ["f4", "fade"], ["f7", "fade"], ["f6", "fade"], ["f2", "push"], ["f5", "sheet"], ["f8", "sheet"]];
const IOS_COLS = [15.5, 38.5, 61.5, 84.5], IOS_ROWS = [13, 23.5, 34, 44.5];
const IOS_TINTS = ["#ff9f43", "#54a0ff", "#10ac84", "#ee5253", "#feca57", "#5f27cd", "#48dbfb", "#ff6b81", "#1dd1a1", "#576574", "#2e86de", "#ff9ff3", "#00d2d3", "#8395a7", "#341f97"];
let iosApps = "", iosTint = 0;
IOS_ROWS.forEach((top, r) => IOS_COLS.forEach((c, col) => {
  const pos = `left:${c - 7.75}%;top:${top}%`;
  iosApps += r === 2 && col === 2
    ? `<span class="mo-app mo-icon" style="${pos}"><img src="${A}app-icon.svg" alt="" width="208" height="208" /><b>H2o Connect</b></span>`
    : `<span class="mo-app" style="${pos};--c:${IOS_TINTS[iosTint++ % IOS_TINTS.length]}"><i></i></span>`;
}));
const iosDock = IOS_COLS.map((c, i) => `<span class="mo-app mo-app--dock" style="left:${c - 7.75}%;--c:${["#1dd1a1", "#54a0ff", "#ff9f43", "#ee5253"][i]}"><i></i></span>`).join("");
const moBanner = (key, title, body) => `<div class="mo-banner" data-k="${key}"><img src="${A}app-icon.svg" alt="" width="208" height="208" /><div><p class="mo-banner-h"><span>H2O CONNECT</span><span>now</span></p><p class="mo-banner-t">${e(title)}</p><p class="mo-banner-b">${e(body)}</p></div></div>`;
const moImg = (img, w, h, attr) => `<img src="${A}${img}" alt="" width="${w}" height="${h}" loading="lazy" decoding="async"${attr || ""} />`;

const hwSvg = `<svg class="mo-hw-svg" viewBox="0 0 1000 1000" font-family="Archivo, system-ui, sans-serif">
                <defs><linearGradient id="moWater" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5b8bff"/><stop offset="1" stop-color="#1f47c8"/></linearGradient><clipPath id="moTank"><rect x="82" y="312" width="176" height="396" rx="18"/></clipPath></defs>
                <rect x="70" y="300" width="200" height="420" rx="28" fill="#1b1e24" stroke="rgba(249,249,249,0.2)" stroke-width="3"/>
                <g clip-path="url(#moTank)"><rect class="mo-water" x="82" y="312" width="176" height="396" fill="url(#moWater)"/></g>
                <g class="mo-ping"><path d="M138 330 Q170 350 202 330"/><path d="M138 330 Q170 350 202 330"/><path d="M138 330 Q170 350 202 330"/></g>
                <rect x="140" y="270" width="60" height="36" rx="9" fill="#0d0e11" stroke="#cbf848" stroke-width="3"/><circle cx="170" cy="288" r="6" fill="#cbf848"/>
                <text class="mo-t1" x="170" y="785" text-anchor="middle">Sonar sensor</text><text class="mo-t2" x="170" y="822" text-anchor="middle">On the tank lid</text>
                <line class="mo-flow" x1="284" y1="500" x2="348" y2="500"/>
                <rect x="360" y="380" width="240" height="240" rx="30" fill="#fdfdfd"/><image href="${A}prototype-unit.webp" x="372" y="392" width="216" height="216"/>
                <text class="mo-t1" x="480" y="680" text-anchor="middle">Display unit</text><text class="mo-t2" x="480" y="717" text-anchor="middle">By the motor switch</text>
                <line class="mo-flow" x1="612" y1="500" x2="708" y2="500"/><text class="mo-t3" x="660" y="476" text-anchor="middle">Wi&#8209;Fi</text>
                <text class="mo-t1" x="830" y="785" text-anchor="middle">H2o Connect</text><text class="mo-t2" x="830" y="822" text-anchor="middle">Live level and control</text>
              </svg>`;

const FILM_CH = [["Launch", 0, 3.8], ["App", 3.8, 35], ["Hardware", 35, 44.5], ["Wearables", 44.5, 53], ["Smart home", 53, 66.5]];
const film = `
        <header class="h2-head h2-head--solo" id="s-film">
          <div>
            <div class="h2-chips"><span class="h2-chip-n">Walkthrough</span></div>
            <h2 class="h2-title">See it in motion</h2>
            <p class="h2-intro">${e("From the first tap on the home screen to the watch on the wrist and the display in the kitchen. One minute, the whole product.")}</p>
          </div>
        </header>
        <div class="h2-card mo reveal" data-film data-scene="launch">
          <p class="sr-only">${e("Animated walkthrough. A tap on the H2o Connect icon opens the app on Home. The tour then shows the fill range, the motor screen, a low water alert, the three automation modes, the smart prediction, weekly usage and a possible leak alert that closes the inlet valve in one tap. It then shows the sonar sensor on the tank, the display unit by the motor switch and the app working together, a low water alert on Apple Watch and Galaxy Watch that starts the motor from the wrist, and the tank on Amazon Echo Show, Google Nest Hub and a concept HomePod with a screen.")}</p>
          <div class="mo-stage">
            <div class="mo-vis" aria-hidden="true">
              <div class="mo-layer mo-hw">${hwSvg}
                <div class="mo-stats"><span class="mo-pill mo-pill--lime">Zero contact sensing</span><span class="mo-pill mo-pill--water">20 to 40% lower energy bills, est.</span></div>
              </div>
              <div class="mo-layer mo-watch">
                <div class="mo-wcard mo-wcard--aw">${moImg("dev-aw-4.jpg", 420, 600, ' data-w="aw4"')}${moImg("dev-aw-2.jpg", 420, 600, ' data-w="aw2"')}${moImg("dev-aw-1.jpg", 420, 600, ' data-w="aw1"')}<span class="mo-hot"></span><span class="mo-tag">Apple Watch</span></div>
                <div class="mo-wcard mo-wcard--gw">${moImg("dev-galaxy-1.jpg", 800, 936, ' data-w="g1"')}${moImg("dev-galaxy-2.jpg", 800, 936, ' data-w="g2"')}<span class="mo-tag">Galaxy Watch</span></div>
                <span class="mo-ripple"></span><span class="mo-ripple"></span>
              </div>
              <div class="mo-layer mo-home">
                <div class="mo-hcard" data-k="echo">${moImg("dev-echo.jpg", 880, 660)}<span class="mo-tag">Echo Show</span></div>
                <div class="mo-hcard" data-k="nest">${moImg("dev-nest.jpg", 776, 582)}<span class="mo-tag">Nest Hub</span></div>
                <div class="mo-hcard" data-k="homepod">${moImg("dev-homepod.jpg", 986, 740)}<span class="mo-tag">HomePod with a screen &middot; concept</span></div>
              </div>
              <div class="mo-layer mo-end">
                <img src="${A}app-icon.svg" alt="" width="208" height="208" />
                <p class="mo-end-t">H2o Connect</p>
                <p class="mo-end-s">One tank. Every screen in the home.</p>
                <p class="mo-end-k">A product by Dwaj&#8209;Tech</p>
              </div>
              <div class="mo-phone iphone"><div class="iphone-bezel"><div class="iphone-screen mo-screen">
                <div class="mo-ios">
                  <p class="mo-sb"><span>9:41</span><svg viewBox="0 0 68 14" fill="#fff"><rect x="0" y="9" width="3.5" height="5" rx="1"/><rect x="5.5" y="6.5" width="3.5" height="7.5" rx="1"/><rect x="11" y="3.5" width="3.5" height="10.5" rx="1"/><rect x="16.5" y="0.5" width="3.5" height="13.5" rx="1"/><path d="M33 3.2c2.6 0 5 1 6.8 2.7l1.3-1.4C38.9 2.4 36 1.2 33 1.2s-5.9 1.2-8.1 3.3l1.3 1.4C28 4.2 30.4 3.2 33 3.2Zm0 4c1.5 0 2.9.6 3.9 1.5l1.4-1.4C36.900 6 35 5.2 33 5.2s-3.9.8-5.3 2.1l1.4 1.4c1-.9 2.4-1.5 3.9-1.5Zm0 4 2.2-2.2c-.6-.5-1.4-.8-2.2-.8s-1.600.3-2.2.8Z"/><rect x="45" y="1" width="20" height="12" rx="3.5" fill="none" stroke="#fff" stroke-opacity="0.45"/><rect x="47" y="3" width="16" height="8" rx="2"/><rect x="66" y="5" width="1.6" height="4" rx="0.8" fill-opacity="0.45"/></svg></p>
                  ${iosApps}
                  <span class="mo-dots"><i></i><i></i></span>
                  <div class="mo-dock">${iosDock}</div>
                </div>
                <div class="mo-launch"><img src="${A}app-icon.svg" alt="" width="208" height="208" /></div>
                ${FILM_SCR.map(([k, how]) => `<img class="mo-scr" data-k="${k}" data-enter="${how}" src="${A}screen-${k}.jpg" alt="" width="720" height="1558" loading="lazy" decoding="async" />`).join("")}
                ${moBanner("low", "Water is low", "Overhead tank at 22%. The motor is off.")}
                ${moBanner("leak", "Possible leak", "42 L lost overnight while every tap was closed.")}
                <p class="mo-toast"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>Inlet valve closed</p>
                <span class="mo-tap"></span>
              </div></div></div>
              <span class="mo-vtap"></span>
            </div>
            <div class="mo-cap">
              <p class="mo-cap-k">Launch</p>
              <h3 class="mo-cap-t">One tap from the home screen</h3>
              <p class="mo-cap-p">H2o Connect opens straight to the tank. No dashboard to decode and no menu to find.</p>
            </div>
          </div>
          <div class="mo-bar">
            <button class="mo-play" type="button" aria-label="Play walkthrough"><svg class="mo-i-play" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/></svg><svg class="mo-i-pause" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="14" y="3" width="5" height="18" rx="1"/><rect x="5" y="3" width="5" height="18" rx="1"/></svg></button>
            <div class="mo-chs">${FILM_CH.map(([l, a, b]) => `<button class="mo-ch" type="button" style="flex-grow:${(b - a).toFixed(1)}" aria-label="Jump to ${l}"><span class="mo-ch-track"><i></i></span><span class="mo-ch-l">${l}</span></button>`).join("")}</div>
          </div>
        </div>`;
const skip = `
        <div class="h2-skip-wrap reveal">
          <a class="h2-skip" href="#s-11" aria-describedby="h2-skip-note"><span class="h2-skip-label">Skip case study</span><span class="h2-skip-chev" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></span></a>
          <p class="h2-skip-note" id="h2-skip-note">Clicking here will take you directly to the design</p>
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
// Report any dash left in the visible copy of the main column.
const main = html.slice(html.indexOf("<main"), html.indexOf("</main>")).replace(/<[^>]+>/g, " ");
const dashes = (main.match(/[^\n]{0,30}[\u2014\u2013][^\n]{0,30}/g) || []);
console.log("wrote", html.length, "chars;", S.length, "blocks; dashes left:", dashes.length);
dashes.slice(0, 20).forEach((d) => console.log("  ", d.replace(/\s+/g, " ").trim()));
