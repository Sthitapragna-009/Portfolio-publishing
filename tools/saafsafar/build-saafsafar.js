// Builds projects/saaf-safar.html, the Saaf Safar case study. Same pipeline as Easy CMS:
// shell lifted from paraga-mitra.html; screens are real captures (tools/saafsafar/capture.js);
// diagrams from tools/saafsafar/infographics.js; every number is computed here from the
// prototype's own simulation, so the page cannot drift from the app. Edit this file, not the HTML.
// Live prototype: prototypes/saaf-safar (npm run build:portfolio in "Actual Portfolio/Airport Sanitation  dashboard").
// UI icons: Solar (480 Design, CC BY 4.0). Pictograms: the app's own set (pictos.json, npm run pictos there).
const fs = require("fs");
const path = require("path");
const ig = require("./infographics.js");
const SITE = path.resolve(__dirname, "../..");
const APP = path.resolve(SITE, "../Airport Sanitation  dashboard");
const A = "../assets/saafsafar/";
const src = fs.readFileSync(SITE + "/projects/paraga-mitra.html", "utf8");
const solar = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../easycms/solar.json"), "utf8"));
const pictos = JSON.parse(fs.readFileSync(__dirname + "/pictos.json", "utf8"));

// ---------- the numbers, from the simulation itself ----------
const { buildHistory } = require(APP + "/src/sim/history.ts");
const { departuresByHour, dateOf } = require(APP + "/src/sim/timetable.ts");
const h = buildHistory();
const fri = departuresByHour(h.binDay.day);
const friByHour = fri.A.map((_, i) => fri.A[i] + fri.B[i] + fri.C[i]);
const pct = (x) => `${Math.round(x * 100)}%`;
const weekday = (d) => dateOf(d).toLocaleDateString("en-GB", { weekday: "long" });
const binCode = h.binDay.unitId.replace(/^N/, "Bin ");
const top = h.stock.reduce((a, b) => (b.tissuePer100 > a.tissuePer100 ? b : a));
const low = h.stock.reduce((a, b) => (b.tissuePer100 < a.tissuePer100 ? b : a));

// Text escape. Straight apostrophes become typographic ones.
const e = (s) => String(s)
  .replace(/&(?![a-z#0-9]+;)/gi, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/'/g, "’");

// ---------- shell ----------
let head = src.slice(0, src.indexOf("<main"));
const spriteStart = head.indexOf("  <!-- Icon set:");
const spriteEnd = head.indexOf("</svg>", spriteStart) + "</svg>".length;
head = head.slice(0, spriteStart) + "__SPRITE__" + head.slice(spriteEnd);
head = head
  .replace('data-page="parag"', 'data-page="saafsafar"')
  .replace(/<title>[^<]*<\/title>/, "<title>Saaf Safar — Airport washrooms that call for help | Sthitapragna Kollepara</title>")
  .replace(/<meta name="description" content="[^"]*"/, '<meta name="description" content="Saaf Safar: sensors tell airport housekeeping which washroom or bin needs them right now, modelled on Delhi T3. A cart iPad in pictures and spoken Hindi, zone and terminal dashboards with escalation, a data story and an Observable notebook, built on a simulated week. Research plan, service design and a working prototype."')
  .replace("family=Noto+Sans+Devanagari:wght@500;600;700&display=swap", "family=Noto+Sans+Devanagari:wght@500;600;700&family=Inter+Tight:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;600&display=swap")
  .replace('<link rel="stylesheet" href="../styles.css" />', '<link rel="stylesheet" href="../styles.css" />\n  <link rel="stylesheet" href="../assets/saafsafar/saafsafar.css" />\n  <link rel="stylesheet" href="../assets/saafsafar/saafsafar-v2.css" />\n  <link rel="stylesheet" href="../assets/saafsafar/saafsafar-transit.css" />');
let tail = src.slice(src.indexOf("  <!-- ===================== LIGHTBOX"));
tail = tail.replace('<script src="../assets/parag/parag.js"></script>', '<script src="../assets/saafsafar/saafsafar.js"></script>');

// ---------- icons and pictograms ----------
const sprite = `  <!-- Icons: Solar by 480 Design (CC BY 4.0), via allsvgicons.com. Pictograms: Saaf Safar's own set, exported from the prototype. -->
  <svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
${Object.entries(solar.linear).map(([k, v]) => `    <symbol id="i-${k}" viewBox="0 0 24 24">${v}</symbol>`).join("\n")}
${Object.entries(solar.duo).map(([k, v]) => `    <symbol id="d-${k}" viewBox="0 0 24 24">${v}</symbol>`).join("\n")}
${Object.entries(pictos).map(([k, v]) => `    <symbol id="p-${k}" viewBox="0 0 48 48"><g fill="currentColor">${v}</g></symbol>`).join("\n")}
  </svg>`;
const ico = (n) => `<svg class="ss-i" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const pic = (n) => `<svg class="ss-p" viewBox="0 0 48 48" aria-hidden="true"><use href="#p-${n}"/></svg>`;

// ---------- image sizes, read from the webp headers ----------
function size(file) {
  const b = fs.readFileSync(SITE + "/assets/saafsafar/" + file);
  if (file.endsWith(".jpg")) {
    for (let i = 2; i < b.length;) { const m = b[i + 1], len = b.readUInt16BE(i + 2); if (m >= 0xc0 && m <= 0xc3) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)]; i += 2 + len; }
  }
  const kind = b.toString("ascii", 12, 16);
  if (kind === "VP8X") return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
  if (kind === "VP8 ") return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
  if (kind === "VP8L") { const n = b.readUInt32LE(21); return [1 + (n & 0x3fff), 1 + ((n >> 14) & 0x3fff)]; }
  return [2000, 1400];
}
const img = (file, alt, half = true) => { const [w, h2] = size(file); return `<img src="${A}${file}" alt="${e(alt)}" width="${half ? Math.round(w / 2) : w}" height="${half ? Math.round(h2 / 2) : h2}" loading="lazy" decoding="async" />`; };
// Devices are captured with their own frames on a transparent background.
const dev = (file, alt, kind = "ipad") => `<figure class="ss-dev ss-dev--${kind}">${img(file, alt)}</figure>`;
// Screens are presented English first. The Hindi-first copy (file-hi.webp) rides along as a small
// preview that opens full size in the gallery.
const hiFile = (file) => file.replace(/\.webp$/, "-hi.webp");
const peek = (file, alt) => `<figure class="ss-hi-peek">${img(hiFile(file), alt + ", Hindi first")}<figcaption><span class="ss-hi" lang="hi">हिंदी</span>As attendants see it</figcaption></figure>`;
const devHi = (file, alt, kind = "ipad") => `<div class="ss-dev-pair ss-dev-pair--${kind}">${dev(file, alt, kind)}${peek(file, alt)}</div>`;
const cap = (t) => `<p class="ss-cap">${t}</p>`;

// ---------- layout helpers (as in the Easy CMS case study) ----------
// Each phase is a line, as on a transit map; each section head is the sign for its stop.
const LINE = { Empathise: "empathise", Define: "define", Ideate: "ideate", Prototype: "prototype", Test: "test" };
const arrow = (dir = "right") => `<svg class="ss-arrow ss-arrow--${dir}" viewBox="0 0 48 48" aria-hidden="true"><use href="#p-arrow"/></svg>`;
const head2 = (id, phase, title, intro) => `
        <div class="plate-head ss-head ss-line--${LINE[phase]}" id="${id}">
          <div class="ss-sign" aria-hidden="true">
            <span class="ss-sign-line">${arrow()}${e(phase)}</span>
            <span class="ss-sign-stop">Stop <b>${id.slice(2)}</b></span>
          </div>
          <h2 class="display section-title">${e(title)}</h2>
          ${intro ? `<div class="section-intro"><p>${e(intro)}</p></div>` : ""}
        </div>`;
const step = (n, label, title, text, why, shot, extra = "") => `
          <div class="ss-step reveal">
            <div class="ss-step-text">
              <p class="ss-step-n"><b>${n}</b>${e(label)}</p>
              <h3>${e(title)}</h3>
              <p>${e(text)}</p>
              ${why.length ? `<ul class="ss-why">${why.map((w) => `<li>${ico("CircleCheck")}<span>${e(w)}</span></li>`).join("")}</ul>` : ""}
              ${extra}
            </div>
            <div class="ss-step-shot">${shot}</div>
          </div>`;
const callout = (tone, icon, text) => `<p class="ss-callout ss-callout--${tone}">${ico(icon)}<span>${e(text)}</span></p>`;
const fig = (inner, caption, cls = "") => `<figure class="ss-ig${cls ? " " + cls : ""} reveal">${inner}${caption ? `<figcaption>${caption}</figcaption>` : ""}</figure>`;
const scale = (label, n, note) => `<div class="ss-scale"><span class="ss-scale-k">${e(label)}</span><span class="ss-dots" role="img" aria-label="${n} out of 5">${[1, 2, 3, 4, 5].map((i) => `<i${i <= n ? ' class="on"' : ""}></i>`).join("")}</span><span class="ss-scale-n">${e(note)}</span></div>`;

// ---------- design system: foundations, then the real components ----------
const compImg = (file, alt) => { const [w, h2] = size(file); return `<img src="${A}${file}" alt="${e(alt)}" width="${Math.round(w / 2)}" height="${Math.round(h2 / 2)}" loading="lazy" decoding="async" />`; };
// Components with words come in both language orders, side by side; they stack when the tile is narrow.
const comp = (file, name, rule, alt, span) => {
  const both = fs.existsSync(SITE + "/assets/saafsafar/" + hiFile(file));
  const stage = both
    ? `<div class="ss-comp-stage ss-comp-langs">
              <figure><span class="ss-comp-lang">English first</span>${compImg(file, alt + ", English first")}</figure>
              <figure><span class="ss-comp-lang"><span class="ss-hi" lang="hi">हिंदी</span>Hindi first</span>${compImg(hiFile(file), alt + ", Hindi first")}</figure>
            </div>`
    : `<div class="ss-comp-stage">${compImg(file, alt)}</div>`;
  return `<figure class="ss-tile ss-span-${span} ss-comp${both ? " ss-comp--pair" : ""}">
            <figcaption class="ss-tile-k">${e(name)}</figcaption>
            ${stage}
            <p class="ss-tile-note">${e(rule)}</p>
          </figure>`;
};
const designSystem = () => `
        <div class="ss-bento reveal">
          <section class="ss-tile ss-span-12" aria-label="Colour palette">
            <p class="ss-tile-k">Colour · one job per colour, and never colour alone</p>
            <div class="ss-swatches">
              <div class="ss-sw ss-sw--wide" style="background:#101114;box-shadow:inset 0 0 0 1px #2f343c"><b>Carbon</b><span>#101114 · control screens</span></div>
              <div class="ss-sw ss-sw--dark-ink" style="background:#eef0f2;color:#101114"><b>Mist</b><span>#EEF0F2 · the cart, in glare</span></div>
              <div class="ss-sw" style="background:#000;color:#fde934"><b>Gate sign</b><span>#FDE934 on black · landmarks only</span></div>
              <div class="ss-sw" style="background:#2547e8"><b>Electric</b><span>#2547E8 · actions, being handled</span></div>
              <div class="ss-sw" style="background:#e5302a"><b>Go now</b><span>#E5302A · with a bolt and a pulse</span></div>
              <div class="ss-sw ss-sw--dark-ink" style="background:#ff9419;color:#000"><b>Soon</b><span>#FF9419 · with a clock</span></div>
              <div class="ss-sw" style="background:#5f31c4"><b>Violet</b><span>#5F31C4 · forecast</span></div>
              <div class="ss-sw ss-sw--dark-ink" style="background:#c6f04a;color:#101114"><b>Lime</b><span>#C6F04A · done, all clear</span></div>
              <div class="ss-sw ss-sw--wide" style="background:#55606d"><b>Steel</b><span>#55606D · quiet text and lines</span></div>
            </div>
          </section>

          <figure class="ss-tile ss-span-5 ss-mark"><figcaption class="ss-tile-k">Logo</figcaption><img src="${A}logo.svg" alt="The Saaf Safar logo: a black S drawn like a route, with a small sparkle, on a gate-sign yellow tile" width="96" height="96" /><p class="ss-tile-note">An S that is also a route, on the yellow of a gate sign.</p></figure>
          ${comp("k-gates.webp", "Gate sign", "The sign workers already read every shift: number first, pictogram beside it.", "Gate signs in four sizes: 14 with the gents figure and an arrow, 14 ladies, 17, 11 and 16", 7)}

          <section class="ss-tile ss-span-7 ss-row2" aria-label="Type">
            <p class="ss-tile-k">Type · Inter Tight, Noto Sans Devanagari, JetBrains Mono</p>
            <div class="ss-type">
              <div class="ss-type-row"><small>Gate 104</small><span style="font-size:3.4rem;font-weight:800;letter-spacing:-0.03em;line-height:1">14</span></div>
              <div class="ss-type-row"><small>Hindi 34</small><span class="ss-hi" style="font-size:2rem;font-weight:800">अभी जाएँ</span></div>
              <div class="ss-type-row"><small>English 17</small><span style="font-size:1.06rem;font-weight:600;color:var(--ink-dim)">Go now · under the Hindi, smaller</span></div>
              <div class="ss-type-row"><small>Counts 30</small><span style="font-size:1.9rem;font-weight:900;letter-spacing:-0.02em">×4</span></div>
              <div class="ss-type-row"><small>Data 13</small><span style="font-family:var(--ss-mono);font-size:0.85rem">16:42 · 1:42 left · 7.9 ppm</span></div>
            </div>
          </section>
          <section class="ss-tile ss-span-5" aria-label="Pictograms">
            <p class="ss-tile-k">Pictograms · solid, signage-style, on a 48 grid</p>
            <div class="ss-icons">${["binFull", "tissue", "towel", "soap", "floor", "odour", "liner", "chem", "gents", "ladies", "store", "walk", "cart", "radio", "speaker", "now"].map((n) => `<span>${pic(n)}</span>`).join("")}</div>
          </section>

          <section class="ss-tile ss-span-5" aria-label="Motion">
            <p class="ss-tile-k">Motion · only Go now moves</p>
            <div class="ss-pulse" aria-hidden="true"><i></i><span>${pic("now")}</span></div>
            <p class="ss-tile-note">A slow pulse on Go now, so urgency reads in peripheral vision and for colour-blind workers. With reduced motion it simply stays red.</p>
          </section>
          <section class="ss-tile ss-span-7" aria-label="Shape and touch">
            <p class="ss-tile-k">Shape and touch · for gloved hands</p>
            <div class="ss-shape">
              <span style="border-radius:10px"><b>10</b>chips</span>
              <span style="border-radius:16px"><b>16</b>tiles</span>
              <span style="border-radius:22px"><b>22</b>buttons</span>
              <span style="border-radius:30px"><b>30</b>cards</span>
            </div>
            <p class="ss-tile-note"><b>60 pt</b> minimum for main actions, above Apple's 44 pt, because workers wear gloves.</p>
          </section>

          <p class="ss-bento-k ss-span-12">Components · cropped from the working prototype at real size</p>
          ${comp("k-offer.webp", "Task card", "One task at a time: urgency, the gate sign, jobs in pictures with counts, what to fetch, and three big answers.", "The Go now task card: Gents near gate 14, empty the bin, clean toilets, tissue ×4, stop at the store first for tissue, with Listen, I'm going and Can't go", 12)}
          ${comp("k-urgency.webp", "Urgency", "Colour, icon and word together, in three sizes; the airport’s language first.", "Urgency pills: Go now with a bolt, Soon with a clock, In a while with an hourglass, in Hindi and English", 6)}
          ${comp("k-jobs.webp", "Job tiles", "Picture first, then both languages in the airport’s order, the count where it matters.", "Job tiles for empty the bin, refill tissue ×4 and mop the floor", 6)}
          ${comp("k-stock.webp", "On my cart", "Counts, not percentages. Blue: needed for this task. Red: not enough.", "The On my cart panel with tissue short by 2, liners and cleaner needed", 12)}
          ${comp("k-cleaning.webp", "Cleaning", "Each job fills as it is done; the sensor confirms, nobody taps done.", "The cleaning card with jobs filling in and a note that the sensor confirms it", 12)}
          ${comp("k-signin.webp", "Sign in by photo", "Carts change hands between shifts: tap your face, no passwords.", "Four drawn crew portraits for the evening shift, Imran on cart B3 highlighted", 12)}
          ${comp("k-radio.webp", "Radio prompt", "Only when a Go now task has sat for 5 minutes: who to call, how far.", "The red radio prompt: nobody took W-14G in 5 min, call Sanjay on cart B1, with a Called button", 6)}
          ${comp("k-queue.webp", "Queue rows", "State bar, gate sign, jobs, age and who has it, in one line.", "Queue rows for washrooms near gates 14 and 11 with their status", 6)}
          ${comp("k-notif.webp", "Lock-screen alert", "Time Sensitive only for Go now; answer without unlocking.", "A Time Sensitive notification on a lock screen with the gate sign, jobs, I'm going and Can't go", 6)}
          ${comp("k-watch.webp", "Watch and wrist taps", "A distinct tap per urgency; gate number and one button.", "A watch face with Go now, gate 14 and an I'm going button, beside the wrist-tap patterns", 6)}
          ${comp("k-chips.webp", "Zone chips and crew", "Counts that matter to a supervisor, and what each cart is doing.", "Zone chips for Go now, Soon, being handled and free carts, with four crew cards", 12)}
          ${comp("k-faces.webp", "Four-face rating", "The passengers' check on the sensors, at the door.", "Four big rating buttons from very clean to dirty, in English and Hindi", 6)}
          ${comp("k-kpi.webp", "Ops tiles", "One number each, with what it means underneath.", "Three tiles: Go now waiting, alert to arrival median, passengers rating it clean", 6)}
        </div>`;

// ---------- page ----------
const HERO = [
  ["mock-angled.jpg", "An angled monitor in a control room showing the Saaf Safar terminal dashboard: three zone cards, the departures pier with aircraft at boarding gates, and departures against alerts", "angled"],
  ["mock-desk.jpg", "Someone at a desk reading the weekly data story, One week at Delhi T3, with its four headline numbers", "desk"],
  ["mock-phone.jpg", "A hand holding a phone with a Time Sensitive Saaf Safar alert: Go now, gents near gate 14, empty the bin, refill tissue, with I'm going", "phone"],
  ["mock-appicon.jpg", "Close-up of a phone's home screen with the Saaf Safar app icon, a black route-shaped S on gate-sign yellow, with a red badge showing 1", "icon"],
];

const JOURNEY = [
  ["Empathise", "#s-01", "Most of the delay is before anyone knows", "Context, hierarchy, stakeholders, proto-personas, a research plan"],
  ["Define", "#s-06", "Pictures first, Hindi first, gloves on", "The incident, eight principles"],
  ["Ideate", "#s-08", "One task, seven touchpoints", "Brainstorm, blueprint, lifecycle, escalation"],
  ["Prototype", "#s-12", "A working terminal, not a mock-up", "A live simulation and six touchpoints"],
  ["Test", "#s-20", "Comprehension before screens", "Targets, three rounds, what is next"],
];

const main = `<main id="top">
    <section class="section case-head" id="ss-top">
      <div class="wrap">
        <a class="case-back" href="../index.html#work"><span aria-hidden="true">&larr;</span> All projects</a>

        <!-- Hero: every mockup composed into one scene with the title, before the case study begins. -->
        <div class="ss-hero reveal">
          <div class="ss-hero-glow" aria-hidden="true"></div>
          <div class="ss-hero-sign" aria-hidden="true">
            <span class="ss-hs-cell ss-hs-way">${arrow("left")}Way out</span>
            <span class="ss-hs-cell ss-hs-name"><svg class="ss-hs-picto" viewBox="0 0 48 48"><use href="#p-washroom"/></svg>Saaf Safar <span lang="hi">साफ़ सफ़र</span></span>
            <span class="ss-hs-cell ss-hs-gate">Gates 1&ndash;29${arrow()}</span>
          </div>
          <div class="ss-hero-text">
            <div class="ss-hero-titles">
              <p class="eyebrow">Service design &middot; Inclusive UI &middot; Data visualization</p>
              <h1 class="display case-title"><img class="ss-hero-logo" src="${A}logo.svg" alt="" width="40" height="40" />Saaf Safar</h1>
            </div>
            <div class="ss-hero-copy">
            <p class="case-sub">Airport washrooms that call for help: sensors tell the cleaning crew where to go, in pictures and spoken Hindi</p>
            <ul class="ss-hero-facts">
              <li>${ico("Users")}<span><b>For</b> housekeeping crews and their supervisors</span></li>
              <li>${ico("MapPin")}<span><b>Modelled on</b> Delhi T3 departures</span></li>
              <li>${ico("Code")}<span><b>Built</b> a working prototype on a simulated week</span></li>
            </ul>
            <div class="ss-hero-cta">
              <a class="ss-hero-btn" href="#s-12">Try the prototype ${ico("ArrowRight")}</a>
              <a class="ss-hero-link" href="#ss-journey-h">Read the journey</a>
            </div>
            </div>
          </div>
          <div class="ss-collage" role="group" aria-label="Saaf Safar mockups. Select one to see it full size.">
            ${HERO.map(([file, alt, cls]) => { const [w, h2] = size(file); return `<figure class="ss-col ss-col--${cls}"><img src="${A}${file}" alt="${e(alt)}" width="${w}" height="${h2}" decoding="async" /></figure>`; }).join("\n            ")}
          </div>
        </div>

        <div class="case-brief reveal" data-delay="3">
          <div class="case-brief-row">
            <h2 class="case-brief-key">Objective</h2>
            <div class="case-brief-val">
              <p>Washrooms in a busy terminal are cleaned on a timetable, while passengers arrive in waves tied to flight banks. Empty tissue dispensers and full bins go unnoticed until a passenger complains or the next round comes by. Off-the-shelf sensors can already report fill levels, supplies, footfall and odour. What is missing is the human layer. Saaf Safar turns those readings into one clear instruction for a worker with mixed literacy, and a live picture for the people who manage them.</p>
            </div>
          </div>
          <div class="case-brief-row">
            <h2 class="case-brief-key">Outcomes</h2>
            <div class="case-brief-val">
              <ul class="case-outcomes">
                <li>Cart iPad in pictures</li>
                <li>Spoken Hindi</li>
                <li>Phone and watch alerts</li>
                <li>Zone dashboard with escalation</li>
                <li>Terminal view and handover</li>
                <li>Ops-centre layer</li>
                <li>Data story and notebook</li>
                <li>Door display</li>
                <li>Pictogram set</li>
              </ul>
            </div>
          </div>
        </div>

        <dl class="case-meta reveal" data-delay="4">
          <div><dt>Role</dt><dd>Research planning, service and interaction design, information visualization, front-end prototype</dd></div>
          <div><dt>Context</dt><dd>Delhi T3 departures, run by DIAL (GMR); the layout and data are illustrative, built from public sources</dd></div>
          <div><dt>Status</dt><dd>Concept &middot; research planned &middot; working prototype built on simulated data, not deployed</dd></div>
          <div><dt>Tools</dt><dd>React, Vite and TypeScript, D3, Observable Framework and Plot</dd></div>
        </dl>
      </div>
    </section>

    <section class="section case-plates">
      <div class="wrap">

        <!-- The journey as a metro line: one line colour per phase, a lettered station for each. -->
        <nav class="ss-metro reveal" aria-labelledby="ss-journey-h">
          <div class="ss-metro-head">
            <h2 class="ss-metro-title" id="ss-journey-h">The design and decision journey</h2>
            <p class="ss-metro-tools">React, Vite, TypeScript &middot; D3 &middot; Observable</p>
          </div>
          <ol class="ss-metro-line">
            ${JOURNEY.map(([phase, href, decision, what]) => `<li class="ss-stop ss-line--${LINE[phase]}">
              <a href="${href}">
                <span class="ss-stop-dot" aria-hidden="true">${e(phase[0])}</span>
                <span class="ss-stop-phase">${e(phase)}</span>
                <span class="ss-stop-decision">${e(decision)}</span>
                <span class="ss-stop-what">${e(what)}</span>
              </a>
            </li>`).join("")}
          </ol>
          <p class="ss-metro-loop">${ico("RotateCcw")} Field results replace every estimate before the design is final.</p>
        </nav>
${head2("s-01", "Empathise", "The problem", "Rounds run on the clock; passengers arrive with the flights. The washroom that needs someone now is rarely the one on the timetable.")}
        <div class="ss-split reveal">
          ${fig(ig.shiftDay(friByHour), `Departures per hour on a simulated ${weekday(h.binDay.day)}, against three fixed 8-hour shifts. A two-hourly round cannot follow these banks.`)}
          <dl class="ss-platforms">
            <div class="ss-plat ss-plat--way"><dt>78M</dt><dd>passengers through Delhi in 2025, the world’s <b>11th busiest</b> airport</dd></div>
            <div class="ss-plat"><dt>214k</dt><dd>passengers a day on average (our calculation)</dd></div>
            <div class="ss-plat ss-plat--navy"><dt>3</dt><dd>shifts a day, and a handover at each one where open problems can be lost</dd></div>
            <div class="ss-plat ss-plat--red"><dt>0</dt><dd>washroom layers on the control centre’s wall today, beside 50,000+ sensor points</dd></div>
          </dl>
        </div>
${head2("s-02", "Empathise", "What the public record shows", "No airport access, so the context comes from public sources first. Each fact changes a design decision.")}
        <ol class="ss-findings reveal">
          ${[
            ["78M passengers a year at Delhi", "Delhi is the hardest case; if it works there, it scales down", "Business Today", "https://www.businesstoday.in/india/story/delhi-igi-airport-handled-78-million-passengers-in-2025-beats-seoul-paris-and-los-angeles-550229-2026-08-20"],
            ["20.4M at Delhi against 7.1M at Hyderabad in a quarter", "Configure, don’t redesign", "GMR Q1 FY27", "https://nsearchives.nseindia.com/corporate/GMRINFRA_12082026194953_Press_Release.pdf"],
            ["T3’s control centre: 3,200 cameras, 50,000+ sensor points", "A washroom layer, not another screen", "HCL Infosystems", "https://hclinfosystems.in/?p=3046"],
            ["Hyderabad runs a predictive operations centre on 40+ IoT parameters", "Plug into it, don’t sit beside it", "Indian Infrastructure", "https://indianinfrastructure.com/2024/12/12/hyderabad-airport-launches-ai-powered-digital-twin-platform-with-apoc/"],
            ["400+ housekeeping staff in shifts, under terminal operations", "Contractor crews, terminal ops in charge", "GMR Group", "https://gmrgroup.in/blog/covid-19-gmr-airports-undertake-massive-sanitization.aspx"],
            ["Washroom cleanliness is rated in ACI’s passenger survey", "Report in ACI’s language", "Adda247", "https://currentaffairs.adda247.com/delhi-international-airport-among-cleanest-in-asia-pacific-says-aci/"],
            ["117 restrooms already sensed at an Indian airport", "The sensors are proven; the worker side is not described", "Milesight", "https://www.milesight.com/iot/success-stories/iot-smart-washroom-india-airport"],
            ["Low literacy is not one group", "Pictures first, words second", "CHI 2009", "https://www.dgp.toronto.edu/public_user/ravin/papers/chi2009_literacy.pdf"],
          ].map(([a, b, srcName, href]) => `<li><span class="ss-f-a">${e(a)}</span><span class="ss-f-arrow" aria-hidden="true"></span><span class="ss-f-b">${e(b)}</span><a class="ss-f-src" href="${href}" target="_blank" rel="noopener">${e(srcName)}<span class="sr-only"> (opens a source)</span></a></li>`).join("")}
        </ol>
${head2("s-03", "Empathise", "Who it touches", "Two organisations, five levels, three shifts. Each level gets only what it needs to act.")}
        <div class="ss-split ss-split--org reveal">
          ${fig(ig.hierarchy(), "The housekeeping hierarchy, a typical model from public tenders and job listings, to be confirmed in interviews. Delhi does not publish it.", "ss-ig--flush")}
          ${fig(ig.stakeholders(), "Stakeholder map: who uses it every shift, who works with it, and who it serves or answers to.", "ss-ig--flush")}
        </div>
        <div class="ss-personas reveal" aria-label="Proto-personas">
          <p class="ss-personas-k">Proto-personas · assumptions the fieldwork will test</p>
          ${[
            ["The cart attendant", "Attendant", "Know which washroom needs me, and what to bring, without reading English.", [["Reads English", 1, "a little"], ["Reads Hindi", 3, "slowly"], ["Hands free", 1, "gloves on"], ["Phone of own", 4, "most have one"]]],
            ["The zone supervisor", "Supervisor", "Stop walking rounds just to find problems; step in only when a task stalls.", [["On the move", 5, "all shift"], ["Radio", 5, "always on"], ["Time at a screen", 2, "glances"], ["Paperwork", 4, "checklists"]]],
            ["The shift manager", "Manager", "Hand over without losing what started late in my shift.", [["Terminal-wide view", 1, "today: none"], ["Reports", 4, "monthly"], ["Handover", 2, "verbal"], ["Data comfort", 4, "spreadsheets"]]],
          ].map(([name, role, goal, traits]) => `<article class="ss-persona">
            <p class="ss-persona-role">${e(role)}</p>
            <h3>${e(name)}</h3>
            <p class="ss-persona-goal">${e(goal)}</p>
            ${traits.map(([l, n, note]) => scale(l, n, note)).join("")}
          </article>`).join("")}
        </div>
${head2("s-04", "Empathise", "The research plan", "Planned, not yet run. Without airport access, the fieldwork uses campus and hospital housekeeping teams as a proxy.")}
        <div class="ss-plan reveal">
          <div class="ss-bubbles" role="img" aria-label="Participants per method: 3 shift shadowings, 6 attendant interviews, 5 or more timed incidents, 10 or more pictogram testers">
            ${[["3", "shifts shadowed", "across 2 sites", 0.55], ["6", "attendant interviews", "Hindi or English", 0.75], ["5+", "incidents timed", "to replace estimates", 0.55], ["10+", "pictogram testers", "ISO 9186 style", 1]].map(([n, l, s2, sc]) => `<div class="ss-bubble" style="--s:${sc}"><b>${n}</b><span>${e(l)}</span><small>${e(s2)}</small></div>`).join("")}
          </div>
          <ol class="ss-tasks">
            <li>${pic("clock")}<b>How do attendants learn</b><span>a washroom needs them, and how long it takes?</span></li>
            <li>${pic("walk")}<b>Where does the time go</b><span>noticing, telling, fetching, walking, cleaning</span></li>
            <li>${pic("tissue")}<b>Which pictograms</b><span>are recognised without words?</span></li>
          </ol>
          <ul class="ss-hyps" aria-label="Hypotheses to test">
            ${[["Unnoticed", "Eye", "Most delay is before anyone knows"], ["Two trips", "Routing", "Refills are missing on arrival, so a store trip"], ["Radio", "Phone", "Supervisors find problems by walking"], ["Handover", "History", "Late problems fall through at shift change"], ["Habit", "Archive", "Stores restock by habit, not use"], ["Words", "Languages", "English labels slow people down"]].map(([kk, icon, hy]) => `<li>${ico(icon)}<span><b>${e(kk)}</b>${e(hy)}</span><em>to test</em></li>`).join("")}
          </ul>
          <p class="ss-kit-link"><a href="../assets/saafsafar/research-kit.html" target="_blank" rel="noopener">${ico("FileText")} Open the research kit: interview guide, observation sheet, incident timing log, consent script and pictogram test cards</a></p>
        </div>
${head2("s-06", "Define", "Where the time goes", "One incident, a washroom near Gate 14 running out of tissue in the evening bank. Today, most of the hour passes before anyone knows.")}
        ${fig(ig.incident(h.phases), "Estimates typed for the brief, beside the simulated week’s median. The timing log in research replaces the estimates.", "ss-ig--incident")}
${head2("s-07", "Define", "Principles", "Apple’s Human Interface Guidelines, then further wherever they assume a reader. The test for every screen: can a worker who reads Hindi slowly act on it in under five seconds?")}
        <!-- Contrast cards: every pairing is light against dark, as signage must be. -->
        <ul class="ss-vcards reveal">
          ${[
            ["tissue", "Pictures", "Pictures first, words second", "Every task and supply has a pictogram; Hindi and English sit under it as support."],
            ["speaker", "Heard", "Every task can be heard", "A speaker button reads the instruction in Hindi, loud enough over cart wheels."],
            ["now", "Urgency", "Urgency by colour and shape", "Go now is red with its own bolt and a pulse, for colour-blind eyes and glare."],
            ["cart", "Gloves", "Targets for gloved hands", "Main actions are full width and 60 pt tall, above Apple’s 44 pt minimum."],
            ["gents", "Landmarks", "Counts and landmarks, not data", "Tissue ×4 with a roll, not 16%. Near Gate 14 with the yellow sign workers know."],
            ["people", "Faces", "Your face is your login", "Carts change hands between shifts; sign in once by tapping your own photo."],
            ["noLocation", "Consent", "Consent for personal devices", "Phone alerts are opt-in, never track location, and stop when the shift ends."],
            ["globe", "Configure", "Configure, don’t redesign", "Zones, thresholds and languages are settings per airport, from Delhi to Bidar."],
          ].map(([icon, word, t, d], i) => `<li class="ss-vcard ss-vcard--${i + 1}">
            <div class="ss-vcard-top"><span class="ss-vcard-word">${e(word)}</span>${pic(icon)}${arrow("up")}</div>
            <div class="ss-vcard-band"><b>${e(t)}</b><span>${e(d)}</span></div>
          </li>`).join("")}
        </ul>
${head2("s-08", "Ideate", "Brainstorm", "Six directions from one idea. Filled ideas are in the prototype; dashed ones are parked.")}
        <div class="ss-scroll reveal">${fig(ig.mindmap(), "", "ss-ig--flush ss-ig--mind")}</div>
        <p class="ss-legend reveal"><span class="ss-lg-on"></span>In the prototype <span class="ss-lg-off"></span>Parked</p>
${head2("s-09", "Ideate", "One task, across the service", "The same alert is an instruction for the worker and a live state for everyone above them.")}
        <div class="ss-scroll reveal">${fig(ig.blueprint(), "Service blueprint. Above the red line is what people see; below it, what the system and the stores do.", "ss-ig--flush")}</div>
${head2("s-10", "Ideate", "Lifecycle and escalation", "A task moves on by itself when nobody answers. The supervisor is the last step, not the first.")}
        <div class="ss-split reveal">
          ${fig(ig.lifecycle(), "", "ss-ig--flush")}
          ${ig.ladder()}
        </div>
${head2("s-11", "Ideate", "Seven touchpoints, one task model", "Cart app and zone dashboard first; the door display last and optional.")}
        <div class="ss-touch reveal">
          ${[
            ["cart", "Cart iPad", "Attendant", "One task in pictures, what the cart has, I’m going or Can’t go"],
            ["phone", "Phone, opt-in", "Attendant", "Accept from the lock screen; Time Sensitive for Go now only"],
            ["watch", "Watch", "Attendant", "A distinct tap per urgency, the gate number, one button"],
            ["radio", "Zone iPad", "Supervisor", "Live map, queue, who is going where, the radio prompt"],
            ["clock", "Terminal web", "Shift manager", "All zones against the departure banks, automatic handover"],
            ["eye", "Ops wall and reports", "AOCC, contractor, DIAL", "A washroom layer and the weekly data story"],
            ["washroom", "Door display", "Passengers", "Cleaned 12 min ago, and a four-face rating"],
          ].map(([icon, t, who, job], i) => `<div class="ss-tp-card ss-tp-card--${i + 1}"><span class="ss-tp-row">${arrow("up")}${pic(icon)}</span><small>${e(who)}</small><span class="ss-tp-job">${e(job)}</span><b>${e(t)}</b></div>`).join("")}
        </div>
${head2("s-12", "Prototype", "Try the prototype", "The whole terminal runs live on this page: one simulation drives every screen. Press Trigger incident, then switch roles to follow it.")}
        <div class="ss-live reveal">
          <div class="ss-live-bar" role="group" aria-label="Open the prototype as">
            ${[["attendant", "Attendant", "Smartphone"], ["supervisor", "Zone supervisor", "Phone"], ["manager", "Shift manager", "Monitor"], ["ops", "Ops and DIAL", "Graph"], ["passenger", "Passengers", "Users"]].map(([r, l, icon], i) => `<button type="button" class="ss-live-role" data-role="${r}" aria-pressed="${i ? "false" : "true"}">${ico(icon)}${e(l)}</button>`).join("")}
            <a class="ss-live-open" href="../prototypes/saaf-safar/index.html?lang=en#/attendant" target="_blank" rel="noopener">${ico("ExternalLink")}Open full screen<span class="sr-only"> (new tab)</span></a>
          </div>
          <figure class="ss-browser ss-live-frame">
            <div class="ss-browser-bar" aria-hidden="true"><i></i><i></i><i></i><span>saafsafar · delhi-t3</span></div>
            <iframe src="../prototypes/saaf-safar/index.html?embed&amp;lang=en#/attendant" title="Saaf Safar prototype" loading="lazy"></iframe>
          </figure>
          <p class="ss-cap">Runs in your browser on simulated data. The dock controls time: play, 1×, 10× or 60×, drag across the day, or trigger the Gate 14 incident.</p>
        </div>
${head2("s-13", "Prototype", "The cart iPad, step by step", "Imran’s evening shift, Cart B3, Zone B. Light on purpose: terminal glare washes out dark screens.")}
        <p class="ss-lang-note reveal">${ico("Languages")}<span>Shown in English for this page. The cart opens in Hindi, so each screen has a small <span class="ss-hi" lang="hi">हिंदी</span> preview beside it; click it to see it full size.</span></p>
        <div class="ss-steps">
${step(1, "Start of shift", "Tap your photo", "The cart shows the zone’s crew for this shift. No password, no typing; the supervisor still sees who took which task.", ["Faces are drawn; every person is fictional"], devHi("c-signin.webp", "Cart iPad sign-in: tap your photo, with four crew portraits and Imran on cart B3 highlighted"))}
${step(2, "Alert", "Go now, in pictures", "A chime, the Go now pill and the gate sign workers already know. Jobs are pictures with counts; the cart checks its own stock and says to stop at the store only when short.", ["2 minutes to answer before it moves on", "Listen reads it out in Hindi"], devHi("c-offer.webp", "The Go now task on the cart iPad: gents near gate 14, empty the bin, clean toilets, tissue ×4, stop at the store first, with Listen, I'm going and Can't go"), callout("alert", "TriangleAlert", "If nobody answers in 2 minutes the task moves to the next cart; at 5 minutes the supervisor is asked to radio."))}
${step(3, "On the way", "Store, then the washroom", "A strip of the pier with the route in blue: the store first if needed, then the door. While there, it adds anything nearly empty.", ["Fewer trips: refills come with the first one", "It knows when you reach the door"], devHi("c-going.webp", "On the way: a map strip of Zone B with the route from the cart to gate 14 and the steps store, then gents gate 14"))}
${step(4, "Cleaning", "The sensor closes it", "Each job fills as time passes. When the levels reset, the sensor closes the task; nobody has to tap done.", [], devHi("c-cleaning.webp", "Cleaning: job tiles filling in, with the note that the sensor confirms it"))}
${step(5, "Done", "Done, and on to the next", "A short confirmation with the time from alert to clean, then back to all clear.", [], devHi("c-done.webp", "Done: a lime check with the sensor confirmed message and the time from alert to clean"))}
${step(6, "Language", "Hindi first, configurable", "Hindi and English, either one first. Other languages are switched on per airport by the admin: Telugu for Hyderabad, Konkani for Goa, Bahasa for Medan.", ["Pictures, signs and colours stay the same everywhere"], devHi("c-lang.webp", "The language sheet: English selected, Hindi, and greyed languages set per airport"))}
        </div>
${head2("s-14", "Prototype", "Away from the cart", "Optional channels for a worker who has stepped away. Both carry the same task in the same pictures.")}
        <div class="ss-trio reveal">
          <div>${devHi("ch-lock.webp", "Lock screen with a Time Sensitive Saaf Safar alert and I'm going and Can't go buttons", "phone")}${cap("<b>Lock screen.</b> Time Sensitive for Go now only.")}</div>
          <div>${dev("ch-settings.webp", "Dark bento settings: tasks today, when alerts stop, my week as dots, and switches for Go now, Soon, location never shared, nothing outside the shift", "phone")}${cap("<b>Consent.</b> Opt-in, no location, off after the shift.")}</div>
          <div>${devHi("ch-watch.webp", "Watch face: Go now, gate 14, the jobs and an I'm going button, with a countdown ring", "watch")}${cap("<b>Wrist.</b> Three strong taps for Go now.")}</div>
        </div>
${head2("s-15", "Prototype", "The zone supervisor", "A live map and a queue. The supervisor steps in only when a task stalls.")}
        <div class="ss-steps">
${step("5′", "Escalation", "Nobody took it in 5 minutes", "The zone’s first alert of this kind is a red card at the top of the queue: who is nearest, how far, and one button to say the call was made.", ["The map pulses where the problem is", "Detail shows every sensor and the task timeline"], dev("z-radio.webp", "Zone B dashboard: isometric map of the pier with aircraft at gates, a red radio prompt for W-14G, the queue, the crew and the W-14G detail panel"))}
${step("?", "Feedback", "Passengers unhappy, sensors fine", "W-17L has a broken flush from 15:10. No sensor sees it, but the four-face ratings fall, and the dashboard asks for a check in person.", ["The rating is the check on the sensors"], dev("z-check.webp", "Zone dashboard with a check in person card for W-17L and its detail panel showing normal sensors but falling ratings"))}
        </div>
${head2("s-16", "Prototype", "The shift manager", "All three zones against the departure banks. Handover carries open tasks by itself.")}
        <div class="ss-wide reveal">${dev("t-terminal.webp", "Terminal dashboard: three zone cards, the whole pier with carts and aircraft, departures by zone per hour against alerts, and shift handovers with zero lost", "browser")}</div>
${head2("s-17", "Prototype", "The ops centre and the weekly story", "A washroom layer for the control-room wall, and a data story for the contractor and DIAL from the same task log.")}
        <div class="ss-wide reveal">${dev("o-live.webp", "The live washroom layer for the operations control centre: five tiles and the whole pier, with an event feed", "browser")}</div>
        <div class="ss-story reveal">
          <div class="ss-story-tiles">
            <div><b>${h.sla.tasks.toLocaleString("en-IN")}</b><span>tasks raised and closed by sensors in the week</span></div>
            <div><b>${pct(h.sla.now)}</b><span>of Go now tasks reached within 10 minutes</span></div>
            <div><b>${Math.round(h.phases.total)} min</b><span>median from alert to confirmed clean</span></div>
            <div><b>${pct(h.sla.positive)}</b><span>of passenger ratings positive</span></div>
          </div>
          <p class="ss-story-k">Simulated week, Sun 11 to Sat 17 October 2026 · computed when this page was built</p>
        </div>
        <div class="ss-pair reveal">
          <div>${img("o-story-1.webp", `One bin across a busy ${weekday(h.binDay.day)}: fixed two-hour rounds against emptying when the sensor reads 80%`)}${cap(`<b>One bin, one day.</b> Fixed rounds: ${h.binDay.fixed.trips} trips, ${h.binDay.fixed.overflow} min overflowing. At 80%: ${h.binDay.sensor.trips} trips, ${h.binDay.sensor.overflow} min.`)}</div>
          <div>${img("o-story-3.webp", "The week by hour as a dot matrix of response times, with the slowest hour ringed")}${cap(`<b>Slowest hour.</b> ${weekday(h.slowest.day)} ${String(h.slowest.hour).padStart(2, "0")}:00, ${h.slowest.value.toFixed(0)} min, ${h.slowest.handover ? "on a handover" : "not on a handover"}.`)}</div>
          <div>${img("o-story-4.webp", "Tissue used per 100 departing passengers by zone and flight bank")}${cap(`<b>Restock by use.</b> Zone ${top.zone} ${top.bank.toLowerCase()}: ${top.tissuePer100.toFixed(1)} rolls per 100 passengers; Zone ${low.zone} ${low.bank.toLowerCase()}: ${low.tissuePer100.toFixed(1)}.`)}</div>
          <div>${img("o-story-5.webp", "Passenger ratings falling during an unsensed fault, with the check in person marker")}${cap("<b>Passengers notice first.</b> The rating fell while every sensor read normal.")}</div>
        </div>
        <div class="ss-split reveal">
          <div class="ss-nb-text">
            <h3>An Observable notebook behind the thresholds</h3>
            <p>Why empty a bin at 80% and not 70% or 90%? The notebook re-runs one bin across a day as you move the threshold, the response time and the fixed round, and plots every setting as trips against overflow. Its data loaders run the prototype’s own simulation.</p>
            <ul class="ss-why">${["Footfall from the timetable", "The threshold what-if", "Response by hour and handover", "Restocking per 100 passengers"].map((x) => `<li>${ico("CircleCheck")}<span>${e(x)}</span></li>`).join("")}</ul>
          </div>
          <div>${img("n-thresholds.webp", "The Observable notebook page Choosing the alert threshold: sliders, four result tiles and a chart of the bin across Friday")}</div>
        </div>
${head2("s-18", "Prototype", "Passengers at the door", "A small screen beside the washroom: when it was last cleaned, and four faces to say how clean it is now.")}
        <div class="ss-trio reveal">
          <div>${dev("d-door.webp", "Door display for Ladies near gate 17: cleaned 12 min ago, tissue, soap and towels fine, and four rating faces", "door")}${cap("<b>Cleaned 12 min ago.</b> Supplies in plain words.")}</div>
          <div>${dev("d-cleaning.webp", "Door display while cleaning: Cleaning now, and please use gents near gate 17, 165 m", "door")}${cap("<b>Cleaning now.</b> Sends people to the next one.")}</div>
          <div>${dev("d-thanks.webp", "Door display after a Not clean rating: thank you, the cleaning team has been told", "door")}${cap("<b>Thank you.</b> A low rating reaches the zone.")}</div>
        </div>
${head2("s-19", "Prototype", "The design system", "Tokens, type, pictograms and components, shared by every touchpoint.")}
${designSystem()}
${head2("s-20", "Test", "What to measure", "Targets to validate, not results. The simulation’s numbers are hypotheses until the fieldwork replaces them.")}
        <div class="ss-metrics reveal">
          ${[
            ["Trips per task", "1", "today assumed 2: store, then washroom", 100],
            ["Pictogram recognition", "≥ ⅔", "per symbol, without words", 67],
            ["Task success with gloves", "4/5", "attendants in the usability test", 80],
            ["Supervisor rounds", "on stall", "only when a task stalls, not every 1–2 h", 85],
            ["Lost at handover", "0", "open tasks", 100],
            ["Bin overflow", `${h.binDay.sensor.overflow} min`, `per bin-day, against ${h.binDay.fixed.overflow} with fixed rounds (simulated)`, 95],
          ].map(([a, b, c, p]) => `<div class="ss-metric"><small>${e(a)}</small><b>${e(b)}</b><span>${e(c)}</span><i class="ss-meter" style="--p:${p}%" aria-hidden="true"></i></div>`).join("")}
        </div>
        <ol class="ss-rounds reveal">
          <li><b>Round 1</b><span>Pictogram comprehension test, ISO 9186 style · 10+ attendants · redraw anything under two-thirds</span></li>
          <li><b>Round 2</b><span>Cart iPad with gloves · 5 attendants · task success, time and errors</span></li>
          <li><b>Round 3</b><span>Zone dashboard walkthrough · 2–3 supervisors · the escalation and handover</span></li>
        </ol>
${head2("s-21", "Test", "Where it stands, and next", "")}
        <div class="ss-status reveal">
          <div class="ss-status-col ss-status-col--done"><p class="ss-kit-k">${ico("CircleCheck")} Built</p><ul>${["Six touchpoints on one simulation", "Escalation at 2 and 5 minutes", "Store-aware routing", "Automatic shift handover", "Unsensed-fault detection from ratings", "Seven-day history and data story", "Observable notebook", "Hindi and English, spoken Hindi"].map((x) => `<li>${e(x)}</li>`).join("")}</ul></div>
          <div class="ss-status-col"><p class="ss-kit-k">${ico("Hourglass")} Not yet</p><ul>${["Field research", "Real sensors and a backend", "Integration with GMR systems", "A recorded Hindi voice", "Tableau Public story", "Telugu and other languages"].map((x) => `<li>${e(x)}</li>`).join("")}</ul></div>
          <div class="ss-status-col ss-status-col--next"><p class="ss-kit-k">${ico("ArrowRight")} Next</p><p class="ss-next-big">Shadow three shifts, time five incidents, test the pictograms, then put the cart iPad in gloved hands.</p></div>
        </div>

      </div>
    </section>

    <section class="section case-next">
      <div class="wrap">
        <p class="eyebrow">Next project</p>
        <a class="next-project" href="easy-cms.html">
          <div class="next-project-media">
            <img src="../assets/easycms/card.jpg" alt="Easy CMS title card" width="1600" height="1000" loading="lazy" decoding="async" />
          </div>
          <div class="next-project-body">
            <h2 class="display next-project-title">Easy CMS</h2>
            <p class="next-project-desc">
              A simpler way for institute staff to update a heavy-information website, with a true preview and a review before anything goes live.
            </p>
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

const html = head.replace("__SPRITE__", sprite) + main + tail;
fs.writeFileSync(SITE + "/projects/saaf-safar.html", html);
console.log("wrote projects/saaf-safar.html", Math.round(html.length / 1024) + " KB");
