// Builds projects/cash-flow-gap.html, the Cash-Flow Gap case study. Same pipeline as Easy CMS
// and Saaf Safar: the shell is lifted from paraga-mitra.html; screens are real captures
// (tools/cashflow/capture.js); diagrams come from tools/cashflow/infographics.js; bank palettes
// and figures are read from the prototype's own data, so the page cannot drift from the app.
// Edit this file, not the HTML. Live prototype: prototypes/cash-flow-gap
// (npm run build:portfolio in "Actual Portfolio/fintech app").
const fs = require("fs");
const path = require("path");
const ig = require("./infographics.js");
const SITE = path.resolve(__dirname, "../..");
const APP = path.resolve(SITE, "../fintech app");
const A = "../assets/cashflow/";
const src = fs.readFileSync(SITE + "/projects/paraga-mitra.html", "utf8");

// ---------- data from the prototype itself ----------
const { banks } = require(APP + "/src/data/banks.ts");
// scenario.ts imports without extensions (Vite style), which Node can't resolve; the one figure needed is mirrored here.
const member = { bounceCharge: 590 };
const inr = (n) => "₹" + n.toLocaleString("en-IN");

// Text escape. Straight apostrophes become typographic ones.
const e = (s) => String(s).replace(/&(?![a-z#0-9]+;)/gi, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "’");

// ---------- shell ----------
let head = src.slice(0, src.indexOf("<main"));
const spriteStart = head.indexOf("  <!-- Icon set:");
const spriteEnd = head.indexOf("</svg>", spriteStart) + "</svg>".length;
head = head.slice(0, spriteStart) + head.slice(spriteEnd);
head = head
  .replace('data-page="parag"', 'data-page="cashflow"')
  .replace(/<title>[^<]*<\/title>/, "<title>Khatiq — Know before it bounces | Sthitapragna Kollepara</title>")
  .replace(
    /<meta name="description" content="[^"]*"/,
    '<meta name="description" content="Khatiq: a money app for India that warns you three days before a payment bounces and shows calm ways to fix it. Journey map, emotional design, an AI assistant called Seth with ten emotions, Account Aggregator linking, per-bank palettes and a working prototype."',
  )
  .replace("&display=swap\" rel=\"stylesheet\" />", "&family=Epilogue:wght@400;500;600;700;800&family=Noto+Sans:wght@400;500;600&family=Noto+Sans+Devanagari:wght@400;500;600&family=Noto+Serif:wght@400;500&display=swap\" rel=\"stylesheet\" />")
  .replace('<link rel="stylesheet" href="../styles.css" />', '<link rel="stylesheet" href="../styles.css" />\n  <link rel="stylesheet" href="../assets/cashflow/cashflow.css" />\n  <link rel="stylesheet" href="../assets/cashflow/khatiq.css" />');
let tail = src.slice(src.indexOf("  <!-- ===================== LIGHTBOX"));
tail = tail.replace('  <script src="../assets/parag/parag.js"></script>\n', "");

// ---------- image helpers ----------
function size(file) {
  const p = SITE + "/assets/cashflow/" + file;
  if (!fs.existsSync(p)) return [860, 1720];
  const b = fs.readFileSync(p);
  const kind = b.toString("ascii", 12, 16);
  if (kind === "VP8X") return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
  if (kind === "VP8 ") return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
  if (kind === "VP8L") {
    const n = b.readUInt32LE(21);
    return [1 + (n & 0x3fff), 1 + ((n >> 14) & 0x3fff)];
  }
  return [860, 1720];
}
const img = (file, alt) => {
  const [w, h] = size(file);
  return `<img src="${A}${file}" alt="${e(alt)}" width="${Math.round(w / 2)}" height="${Math.round(h / 2)}" loading="lazy" decoding="async" />`;
};
/** A strip of phones that opens in the site's lightbox. */
const phones = (items, cls = "") => `
        <div class="shots cf-phones ${cls} reveal" data-shots style="--cols: ${items.length <= 6 ? items.length : Math.ceil(items.length / 2)}">
          <div class="shots-track">
            ${items.map(([file, alt, cap]) => `<figure class="shot-card cf-phone">${img(file, alt)}${cap ? `<figcaption>${e(cap)}</figcaption>` : ""}</figure>`).join("\n            ")}
          </div>
        </div>`;

// ---------- layout helpers ----------
const head2 = (id, phase, title, intro) => `
        <div class="plate-head cf-head" id="${id}">
          <h2 class="display section-title" data-phase="${e(phase)}">${e(title)}</h2>
          ${intro ? `<div class="section-intro"><p>${e(intro)}</p></div>` : ""}
        </div>`;
const step = (n, label, title, text, why, shot) => `
          <div class="cf-step reveal">
            <div class="cf-step-text">
              <p class="cf-step-n"><b>${n}</b>${e(label)}</p>
              <h3>${e(title)}</h3>
              <p>${e(text)}</p>
              ${why.length ? `<ul class="cf-why">${why.map((w) => `<li><span class="cf-tick" aria-hidden="true"></span><span>${e(w)}</span></li>`).join("")}</ul>` : ""}
            </div>
            <div class="cf-step-shot">${shot}</div>
          </div>`;
const one = (file, alt) => `<figure class="cf-phone cf-phone--one">${img(file, alt)}</figure>`;
const fig = (inner, caption, cls = "") => `<figure class="cf-ig${cls ? " " + cls : ""} reveal">${inner}${caption ? `<figcaption>${caption}</figcaption>` : ""}</figure>`;

// ---------- design system ----------
const BANK_ORDER = ["riverbend", "northgate", "kesari", "pragati", "nila", "sahyog"];
const HUES = [
  ["Mint", "#7ee8c2", "done, money in, safe"],
  ["Coral", "#ff8f78", "money out, the cost of doing nothing"],
  ["Sunflower", "#ffd65a", "savings and goals"],
  ["Lavender", "#b8b2ff", "people and Seth"],
  ["Sky", "#84cbff", "linked banks, data and trust"],
  ["Lime", "#c8f06e", "paying someone"],
];
const designSystem = () => `
        <div class="cf-bento reveal">
          <section class="cf-tile cf-span-12" aria-label="Bank palettes">
            <p class="cf-tile-k">Every bank brings its own palette · button, ink, tint, colour field and Seth’s glow</p>
            <div class="cf-banks">
              ${BANK_ORDER.map((id) => {
                const b = banks[id];
                const p = b.palette;
                return `<div class="cf-bank">
                <div class="cf-bank-field" style="background:${p.aura[0]};--a:${p.aura[1]};--b:${p.aura[2]};--c:${p.aura[3]}"><span class="cf-bank-mark" style="background:${p.brand}">${e(b.mark)}</span></div>
                <b>${e(b.name)}</b><span>${e(b.kind)}</span>
                <div class="cf-bank-chips"><i style="background:${p.brand}" title="Button ${p.brand}"></i><i style="background:${p.inkDark}" title="Ink on dark ${p.inkDark}"></i><i style="background:${p.tintLight}" title="Tint ${p.tintLight}"></i><i style="background:${p.glow}" title="Seth glow ${p.glow}"></i></div>
                <code>${p.brand}</code>
              </div>`;
              }).join("")}
            </div>
            <p class="cf-tile-note">Palettes live in data, not CSS: a bank linked through the Account Aggregator arrives with its colours. Every button fill passes 4.5:1 with white text.</p>
          </section>

          <section class="cf-tile cf-span-7" aria-label="Type">
            <p class="cf-tile-k">Type · the system font: SF Pro and New York on Apple devices, Noto Sans and Noto Serif everywhere else</p>
            <div class="cf-type">
              <div class="cf-type-row"><small>Large title 34</small><span class="cf-serif" style="font-size:2.6rem;line-height:1.1">Know early.</span></div>
              <div class="cf-type-row"><small>Balance 46</small><span class="cf-serif" style="font-size:2.6rem;line-height:1.1"><span class="cf-sym">₹</span>31,240<span class="cf-dim">.50</span></span></div>
              <div class="cf-type-row"><small>Title 28</small><span class="cf-serif" style="font-size:1.75rem">Ways to cover rent</span></div>
              <div class="cf-type-row"><small>Body 17</small><span style="font-size:1.06rem">Your account will be a little short.</span></div>
              <div class="cf-type-row"><small>Footnote 13</small><span style="font-size:0.81rem">3 Nov · salary arrives</span></div>
            </div>
            <p class="cf-tile-note">iOS’s scale: Large Title 34, Title 28, Headline and Body 17, Subheadline 15, Footnote 13, with tracking that tightens as size grows. Apple’s fonts are never shipped in the web build, since their licence covers apps on Apple platforms; on iPhone the system draws them. The ₹ sits smaller with its own space, paise are dimmed, and Noto Sans Devanagari sets Hindi in the same family.</p>
          </section>
          <section class="cf-tile cf-span-5" aria-label="Bright accents">
            <p class="cf-tile-k">Colour · 60-30-10, the Watch black way</p>
            <div class="cf-hues">${HUES.map(([n, hex, use]) => `<div class="cf-hue"><i style="background:${hex}"></i><b>${n}</b><span>${e(use)}</span></div>`).join("")}</div>
            <p class="cf-tile-note">60 black canvas, 30 graphite surfaces, 10 colour: the bank’s tint on the one action, and these six hues only inside data marks and their labels. Measured from every capture: colour at or under 10% on 49 of 54 screens; the five over it are the covered, welcome and linked moments, and the multi-bank account lists.</p>
          </section>

          <section class="cf-tile cf-span-6" aria-label="Grid and spacing">
            <p class="cf-tile-k">Layout · iPhone margins, rounded shapes</p>
            <div class="cf-grid-demo"><span style="width:16px">16</span><span style="width:12px">12</span><span style="width:32px">32</span></div>
            <p class="cf-tile-note">16 pt layout margin, 12 between related tiles, 32 between sections. Cards round at 26, inset lists at 22, controls are capsules, sheets 34, continuous corners where the browser supports them. Every target is 44 pt or more.</p>
          </section>
          <section class="cf-tile cf-span-6" aria-label="Motion">
            <p class="cf-tile-k">Motion and material · Liquid Glass on the controls only</p>
            <p class="cf-tile-big">Springs, 0.3 s</p>
            <p class="cf-tile-note">Critically damped springs answer on press, never on release. Glass sits on the functional layer only: the floating tab bar, back buttons and sheets, never on content and never glass on glass. Reduce Transparency turns it solid; Reduce Motion turns movement into fades.</p>
          </section>
        </div>`;

// ---------- page ----------
const st = require("./story.js");
const pr = require("./process.js");

const chapter = (id, n, kicker, title, intro) => `
        <header class="kq-ch reveal" id="${id}">
          <p class="kq-ch-k"><span>${n}</span>${e(kicker)}</p>
          <h2 class="kq-ch-title">${e(title)}</h2>
          ${intro ? `<p class="kq-ch-intro">${e(intro)}</p>` : ""}
        </header>`;
const sub = (title, intro, id = "") => `
        <div class="kq-sub reveal"${id ? ` id="${id}"` : ""}>
          <h3>${e(title)}</h3>
          ${intro ? `<p>${e(intro)}</p>` : ""}
        </div>`;
const photo = (file, alt, cls = "") => `<figure class="kq-photo ${cls} reveal">${img(file, alt)}</figure>`;
const CHAPTERS = [
  ["s-overview", "Overview"],
  ["s-challenge", "Challenge"],
  ["s-process", "Process"],
  ["s-solution", "Solution"],
  ["s-impact", "Impact"],
  ["s-reflection", "Reflection"],
];

const main = `<main id="top">
    <section class="section case-head kq-top" id="cf-top">
      <div class="wrap">
        <a class="case-back" href="../index.html#work"><span aria-hidden="true">&larr;</span> All projects</a>
        <div class="kq-hero reveal">
          <div class="kq-hero-text">
            <p class="kq-label">Banking concept · iOS, iPadOS, watchOS · 1 week, solo</p>
            <h1 class="kq-name">Khatiq</h1>
            <p class="kq-hook">Know before it bounces.</p>
            <p class="kq-desc">Khatiq is a money app for India. It reads your salary, bills and accounts across banks, and tells you three days ahead when a payment is about to bounce. Then it shows calm ways to fix it: move money from savings, pay on salary day, or talk to a person.</p>
            <p class="kq-origin">From <i>khata</i> (खाता), Hindi for an account ledger.</p>
            <p class="kq-links">
              <a class="kq-link is-primary" href="#kq-try">Try the prototype <span aria-hidden="true">→</span></a>
              <a class="kq-link" href="#s-overview">Read the case study <span aria-hidden="true">↓</span></a>
            </p>
          </div>
          ${photo("mk-hand.webp", "A hand holding an iPhone showing Khatiq’s home: good morning, Arjun; one thing needs you before 1 Nov; ₹88,720.50 across Deccan and Narmada; a card saying rent leaves 1 Nov and you’ll be ₹1,059 short for 2 days", "kq-hero-photo")}
        </div>
        <dl class="kq-meta reveal">
          <div><dt>Role</dt><dd>Solo: research plan, UX, UI, prototype</dd></div>
          <div><dt>Timeline</dt><dd>1 week</dd></div>
          <div><dt>Platforms</dt><dd>iPhone, iPhone Duo, iPad, Apple Watch</dd></div>
          <div><dt>Status</dt><dd>Concept, not user-tested yet</dd></div>
          <div><dt>Built with</dt><dd>React, TypeScript, Motion, Apple HIG</dd></div>
        </dl>
        <nav class="kq-toc reveal" aria-label="Chapters">
          <ol>${CHAPTERS.map(([id, t], i) => `<li><a href="#${id}"><span>0${i + 1}</span>${t}</a></li>`).join("")}</ol>
        </nav>
      </div>
    </section>

    <section class="section case-plates kq-story">
      <div class="wrap">

        ${chapter("s-overview", "01", "Overview", "The gap, in one picture", "Arjun has ₹31,241 today. Rent of ₹32,000 leaves by autopay on 1 Nov; his salary lands on the 3rd. For two days he’s ₹1,058 short, and the bank charges ₹590 when rent bounces.")}
        <figure class="kq-panel kq-chart reveal">${st.gapChart()}<figcaption>The prototype’s own 14-day projection. The two short days drop below the line; salary day is mint.</figcaption></figure>
        <ul class="kq-made reveal">
          <li style="--tile:var(--hue-mint)"><span class="kq-made-n">01</span><b>A home for all your money</b><span>One line says whether you’re okay, across every bank you use.</span></li>
          <li style="--tile:var(--hue-sun)"><span class="kq-made-n">02</span><b>One calm card, 3 days early</b><span>The amount, the days, and three ways out with their costs.</span></li>
          <li style="--tile:var(--hue-coral)"><span class="kq-made-n">03</span><b>The same moment everywhere</b><span>iPhone, both screens of iPhone Duo, iPad and Apple Watch.</span></li>
        </ul>

        ${chapter("s-challenge", "02", "Challenge", "Rent leaves before salary lands", "Banking apps show what already happened. The warning arrives as an SMS after the bounce, in words like NACH and mandate. People are left to do the maths themselves.")}
        <figure class="kq-panel kq-loop-wrap reveal">${pr.loop()}<figcaption>Today’s loop, every month the dates don’t line up.</figcaption></figure>
        <div class="reveal">${st.beforeAfter()}</div>
        ${sub("What people need from that moment", "Written as jobs to be done. Interviews in India come first in the research plan.")}
        <ol class="kq-jobs reveal">
          <li><span>Main job</span><p>Tell me early if I won’t be okay this month.</p></li>
          <li><span>Emotional job</span><p>Help me feel in control, not judged or alarmed.</p></li>
          <li><span>Related job</span><p>Show me this is really my bank, and that a person is reachable.</p></li>
        </ol>
        ${sub("What published surveys suggest", "Directional only: mostly US and UK, several run by vendors.")}
        <div class="reveal">${st.stats([
          ["14%", "fully trust AI with money advice; 72% want a human involved", "lavender"],
          ["84%", "accept extra security steps if they stop fraud", "sky"],
          ["55%", "who ignored a real fraud alert thought it was a scam", "coral"],
          ["1 in 2", "say jargon stops them growing their money", "sun"],
        ])}<p class="kq-cap">Addition Wealth (US) · Experian 2026 · fraud study summary · Zopa (UK).</p></div>
        <p class="kq-constraints reveal"><b>Designed for</b> UPI autopay, NACH bounce charges, the Account Aggregator, any bank as a white label, rupees in lakh grouping, Hindi and English.</p>

        ${chapter("s-process", "03", "Process", "Seven days, five decisions", "I mapped the journey, set the emotion each moment needs, brainstormed the ways out, then built and rebuilt the app until every screen said one thing.")}
        ${fig(ig.journeyMap(), "Arjun, Bengaluru. Two moments of truth: the SMS from the bank, and how it ends.", "cf-ig--wide kq-panel")}
        ${sub("Emotional design: the right feeling at the right moment", "In banking, emotional design isn’t delight. It’s confidence when things are fine, reassurance and control when they aren’t, trust when money moves, and progress after.")}
        <figure class="kq-panel kq-ec-wrap reveal">${st.emotionCurve()}<figcaption>A design intention, to be tested. Framework: <a href="https://www.theuxda.com/blog/emotionally-intelligent-ux-power-next-gen-digital-banking">UXDA, emotionally intelligent UX in digital banking</a>.</figcaption></figure>
        ${sub("Brainstorm", "One idea, six directions. Filled ideas are in the prototype; dashed ones were parked or rejected.")}
        <figure class="kq-panel kq-mm-wrap reveal">${pr.mindMap()}</figure>
        ${sub("The decisions that shaped it", "")}
        <div class="reveal">${pr.timeline([
          ["Day 2", "IBM Carbon components", "Apple’s HIG and Liquid Glass", "Carbon’s square cards felt cold for a money worry. iOS’s rounded, quiet patterns fit."],
          ["Day 3", "One bank’s home", "A home for all your money", "Most people use two or three banks. The warning belongs above any one of them."],
          ["Day 4", "A red “may bounce” banner", "One calm sentence, three ways out", "Say what happens and by how much, then how to fix it."],
          ["Day 5", "A big white button", "A small link", "The card informs. The action is there when you want it."],
          ["Day 6", "Bright colour everywhere", "Black canvas, colour only in data", "Apple Watch’s 60-30-10: colour stays under 10%, so it means something."],
        ])}</div>
        ${sub("A review before anyone tests it", "Heuristic evaluation, an information-architecture check and a design critique. Eight findings, each fixed. Four of them:")}
        <ul class="kq-fixes reveal">
          <li><b>Home said too much</b><span>49 bits of text and four ways to say one fact. Now one sentence, one gauge, one link.</span></li>
          <li><b>The gauge felt cramped</b><span>Number and label fought the ring. Now the number sits alone; the label rests in the opening.</span></li>
          <li><b>Confirm hid the result</b><span>It repeated the amount. Now it shows the new balance and your lowest point before salary.</span></li>
          <li><b>Profile was a tab</b><span>Rarely used, always visible. It moved to the avatar; Scan took the centre of the tab bar.</span></li>
        </ul>

        ${chapter("s-solution", "04", "Solution", "Three days early, three taps to fix", "One calm card on the home screen, three ways out with their costs, a confirm that shows the result, and an ending that looks forward.")}
        ${photo("mk-sofa.webp", "Someone on a sofa holding an iPhone with Deccan’s home in Khatiq: main account ₹31,240.50 and the gap card, ₹1,059 short for 2 days", "kq-photo--wide")}
        <ol class="kq-flow reveal">
          <li><span class="kq-flow-n">1</span><b>See it</b>${img("gap-home.webp", "Home: one thing needs you before 1 Nov, with the gap card")}</li>
          <li><span class="kq-flow-n">2</span><b>Choose</b>${img("gap-compare.webp", "Ways to cover rent: ₹590 if you do nothing, then three ways with their costs")}</li>
          <li><span class="kq-flow-n">3</span><b>Confirm</b>${img("gap-confirm.webp", "Confirm: after this move, ₹32,740.50, 100% of rent covered")}</li>
          <li><span class="kq-flow-n">4</span><b>Done</b>${img("gap-done.webp", "Rent is covered. Next date to watch, 3 Nov. You sorted this 3 days before it was due.")}</li>
        </ol>

        ${sub("Try it yourself", "The whole app runs here. Tap See 3 ways to fix it and follow it to the end.", "kq-try")}
        <div class="cf-live reveal">
          <iframe src="../prototypes/cash-flow-gap/index.html?embed" title="Khatiq prototype" loading="lazy"></iframe>
          <p class="kq-cap">Invented data. <a href="../prototypes/cash-flow-gap/index.html" target="_blank" rel="noopener">Open with all controls<span class="sr-only"> (new tab)</span></a>: four lenses, two banks, light and dark, iPhone Duo, iPad and Apple Watch.</p>
        </div>

        ${sub("The same moment on every Apple device", "Built from Apple’s guidance for each: a trailing rail on iPhone Duo, a split view on iPad, complications on Apple Watch.")}
        ${photo("mk-duo-open.webp", "iPhone Duo held open in two hands: the all-money home beside Ways to cover rent, with the tab bar in the rail", "kq-photo--wide")}
        <div class="cf-eco cf-eco-wide reveal">
          <figure>${img("mk-duo-trio.webp", "iPhone Duo open and upright between two other iPhone Duo phones, showing the all-money home")}<figcaption>iPhone Duo, open and upright</figcaption></figure>
          <figure>${img("bz-ipad.webp", "iPad Air in landscape: the tab bar on top, the all-money home on the left and Ways to cover rent on the right")}<figcaption>iPad: tab bar on top, split view below</figcaption></figure>
        </div>
        <div class="cf-eco cf-eco-watch reveal">
          <figure>${img("bz-watch-face.webp", "Apple Watch face: rent 1 Nov, ₹1,059 short, a 14-day chart and three rings")}<figcaption>On the face</figcaption></figure>
          <figure>${img("bz-watch-aod.webp", "Always On: amounts hidden")}<figcaption>Always On hides amounts</figcaption></figure>
          <figure>${img("bz-watch-alert.webp", "₹1,059 short for 2 days, Move ₹1,500 or Later")}<figcaption>One fact, one action</figcaption></figure>
          <figure>${img("bz-watch-confirm.webp", "Confirm ₹1,500, double tap to confirm")}<figcaption>Double Tap confirms</figcaption></figure>
          <figure>${img("bz-watch-done.webp", "Rent covered, next: salary 3 Nov")}<figcaption>Covered</figcaption></figure>
        </div>

        ${sub("Data, the way Apple Watch shows it", "Colour lives inside the marks: a histogram for the month, a gauge for rent, rings for goals, bars with one month picked out.")}
        ${phones([
          ["gap-bank.webp", "The bank home: a 30-day histogram with two short days below the line and an arc gauge, 97% of rent", "Histogram and gauge"],
          ["ins-insights.webp", "Insights: six months of spending with October in coral and a dashed average", "One month picked out"],
          ["ins-goals.webp", "Savings goals as rings, one per goal", "Rings"],
          ["acc-linked.webp", "Accounts across three banks, each in its own colours", "Banks in their colours"],
        ])}

        ${sub("Around the moment, a whole bank", "Onboarding, accounts across banks, UPI, insights, Seth the assistant, and linking banks through the Account Aggregator.")}
        ${phones([
          ["onb-welcome.webp", "Welcome to Khatiq: Know early. Act calmly.", "Welcome"],
          ["pay-hub.webp", "Pay: people, bills and autopays", "Pay"],
          ["ai-chat.webp", "Seth answers marked Sure, Not sure and Can’t do this", "Seth"],
          ["link-consent.webp", "Share Malabar data with Deccan? What, how long, how often, why", "Consent"],
          ["link-done.webp", "Malabar is linked, in its own colours", "Linked"],
          ["gap-why.webp", "Why am I seeing this? What we looked at and what we never use", "Why"],
          ["gap-handoff.webp", "A person will take it from here", "A person"],
          ["pro-profile.webp", "Profile, behind the avatar", "Profile"],
        ])}

        ${sub("The design system", "Read from the prototype’s own tokens, so the page can’t drift from the app.")}
        ${designSystem()}

        ${chapter("s-impact", "05", "Impact", "What it has to prove", "Nothing has been tested yet. These are the bars it must clear with 8 to 10 people, written down now so they can’t drift.")}
        <div class="kq-panel reveal">${st.targets([
          [8, 10, "Get it in 5 seconds", "Restate the situation and next step", "mint"],
          [8, 10, "Fix it in 60 seconds", "Cover a gap, unaided", "mint"],
          [7, 10, "Trust it enough to act", "And say where the data came from", "mint"],
          [9, 10, "Find a person in 10 seconds", "Talk to a person, from the card", "mint"],
          [7, 10, "Feel calm after", "One question, five words", "mint"],
        ])}</div>
        ${sub("What exists today", "")}
        <div class="reveal">${st.stats([
          ["64", "screens in a working prototype", "mint"],
          ["4", "Apple devices, each to its guidelines", "sky"],
          ["57 of 64", "screens inside the 10% colour budget", "sun"],
          ["0", "people tested so far. That’s next.", "coral"],
        ])}</div>

        ${chapter("s-reflection", "06", "Reflection", "What I’d keep, and what’s next", "")}
        <ol class="kq-reflect reveal">
          <li><b>Calm is mostly copy</b><span>The biggest changes were words. “May bounce” became “you’ll be ₹1,059 short”, and the fix moved into the same card.</span></li>
          <li><b>Less on home, more on the one thing</b><span>Cutting home from 49 bits of text to a handful made the alert the obvious next step.</span></li>
          <li><b>Design the wrist first</b><span>Apple Watch forced the shortest version of every message, and that version improved the phone.</span></li>
          <li><b>Next</b><span>Five to eight interviews in India, then the card in front of 8 to 10 people against the targets above.</span></li>
        </ol>

        <p class="kq-credits">Image credits: iPhone Duo photographs (upright trio), Apple. iPhone mockups: Mockup Cloud (on the sofa), akoya (in hand). Open iPhone Duo in hands: source to be added. Device frames: Apple Design Resources. App screens, diagrams and the prototype are my own; every bank and person in them is invented.</p>
      </div>
    </section>
  </main>

`;
const out = head + main + tail;
fs.writeFileSync(SITE + "/projects/cash-flow-gap.html", out);
console.log("wrote projects/cash-flow-gap.html", Math.round(out.length / 1024) + " KB");
