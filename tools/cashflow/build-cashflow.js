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
    '<meta name="description" content="Khatiq: a money app for India that warns you three days before a payment bounces and shows calm ways to fix it. Journey map, emotional design, an AI assistant that says when it’s sure, not sure, or can’t help, Account Aggregator linking, per-bank palettes and a working prototype."',
  )
  .replace("&display=swap\" rel=\"stylesheet\" />", "&family=Epilogue:wght@400;500;600;700;800&family=Caveat:wght@500;700&family=Noto+Sans:wght@400;500;600&family=Noto+Sans+Devanagari:wght@400;500;600&family=Noto+Serif:wght@400;500&display=swap\" rel=\"stylesheet\" />")
  .replace('<link rel="stylesheet" href="../styles.css" />', '<link rel="stylesheet" href="../styles.css" />\n  <link rel="stylesheet" href="../assets/cashflow/cashflow.css" />\n  <link rel="stylesheet" href="../assets/cashflow/khatiq.css" />\n  <link rel="stylesheet" href="../assets/cashflow/ds.css" />\n  <link rel="stylesheet" href="../assets/cashflow/tl.css" />');
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
/** Screen library: one labelled, sideways-scrolling row per flow. */
const library = (groups) =>
  groups
    .map(
      ([title, kind, items]) => `<section class="kq-lib-group" aria-label="${e(title)}">
          <h4 class="kq-lib-h">${e(title)} <span>${items.length}</span></h4>
          <div class="kq-lib-row is-${kind}">
            ${items.map(([file, cap]) => `<figure class="kq-lib-item">${img(file + ".webp", title + ": " + cap)}<figcaption>${e(cap)}</figcaption></figure>`).join("")}
          </div>
        </section>`,
    )
    .join("")

const one = (file, alt) => `<figure class="cf-phone cf-phone--one">${img(file, alt)}</figure>`;
const fig = (inner, caption, cls = "") => `<figure class="cf-ig${cls ? " " + cls : ""} reveal">${inner}${caption ? `<figcaption>${caption}</figcaption>` : ""}</figure>`;

// ---------- design system ----------
const BANK_ORDER = ["northgate", "riverbend", "kesari", "pragati", "nila", "sahyog"];
const HUES = [
  ["Mint", "#7ee8c2", "done, money in, safe"],
  ["Coral", "#ff8f78", "money out, the cost of doing nothing"],
  ["Sunflower", "#ffd65a", "savings and goals"],
  ["Lavender", "#b8b2ff", "people and the assistant"],
  ["Sky", "#84cbff", "linked banks, data and trust"],
  ["Lime", "#c8f06e", "paying someone"],
];
const designSystem = () => `
        <div class="cf-bento reveal">
          <section class="cf-tile cf-span-12" aria-label="Bank palettes">
            <p class="cf-tile-k">Every bank brings its own palette · button, ink, tint, colour field and the assistant’s glow</p>
            <div class="cf-banks">
              ${BANK_ORDER.map((id) => {
                const b = banks[id];
                const p = b.palette;
                return `<div class="cf-bank">
                <div class="cf-bank-field" style="background:${p.aura[0]};--a:${p.aura[1]};--b:${p.aura[2]};--c:${p.aura[3]}"><span class="cf-bank-mark" style="background:${p.brand}">${e(b.mark)}</span></div>
                <b>${e(b.name)}</b><span>${e(b.kind)}</span>
                <div class="cf-bank-chips"><i style="background:${p.brand}" title="Button ${p.brand}"></i><i style="background:${p.inkDark}" title="Ink on dark ${p.inkDark}"></i><i style="background:${p.tintLight}" title="Tint ${p.tintLight}"></i><i style="background:${p.glow}" title="Assistant glow ${p.glow}"></i></div>
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
const ds = require("./ds.js");
const sk = require("./sketches.js");
const pp = require("./proto-page.js");
const tl = require("./tl.js");
const fl = require("./flow.js");
const fi = require("./fidelity.js");

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
            <p class="kq-label">Banking concept · iPhone, iPad, Apple Watch · 1 week, solo</p>
            <h1 class="kq-name">Khatiq</h1>
            <p class="kq-hook">Know before it bounces.</p>
            <p class="kq-desc">Khatiq is a money app for India. It reads your salary, bills and accounts across banks, and tells you three days ahead when a payment is about to bounce. Then it shows calm ways to fix it: move money from savings, pay on salary day, or talk to a person.</p>
            <p class="kq-desc kq-audience">For people who can afford their bills, but get caught when rent leaves on the 1st and salary lands on the 3rd.</p>
            <p class="kq-origin">From <i>khata</i> (खाता), Hindi for an account ledger.</p>
            <p class="kq-links">
              <a class="kq-link is-primary" href="khatiq-prototype.html">Try the prototype <span aria-hidden="true">→</span></a>
              <a class="kq-link" href="#s-overview">Read the case study <span aria-hidden="true">↓</span></a>
            </p>
          </div>
          ${photo("mk-hand.webp", "A hand holding an iPhone showing Khatiq’s home: good morning, Arjun; one thing needs you before 1 Nov; ₹88,720.50 across Konkan and Narmada; a card saying rent leaves 1 Nov and you’ll be ₹1,059 short for 2 days", "kq-hero-photo")}
        </div>
        <dl class="kq-meta reveal">
          <div><dt>Role</dt><dd>Solo: research plan, UX, UI, prototype</dd></div>
          <div><dt>Timeline</dt><dd>1 week</dd></div>
          <div><dt>Built with</dt><dd>Claude Code: React, TypeScript, Motion</dd></div>
          <div><dt>Principles</dt><dd>Warn early. Say it plainly. A person is one tap away.</dd></div>
          <div class="kq-meta-wide"><dt>Platform</dt><dd>Apple-first concept. A launch in India would be Android-first; the design system carries over. Most iPhones in India are bought on EMI, so this audience is already living with autopays.</dd></div>
        </dl>
      </div>
    </section>

    <section class="section case-plates kq-story">
      <div class="wrap">

        ${chapter("s-overview", "01", "Overview", "The gap, in one picture", "Arjun has ₹31,241 today. Rent of ₹32,000 leaves by autopay on 1 Nov; his salary lands on the 3rd. For two days he’s ₹1,058 short, and if the autopay bounces, bank charges and a late fee follow.")}
        <figure class="kq-panel kq-chart reveal">${st.gapChart()}<figcaption>The prototype’s own 14-day projection. The two short days drop below the line; salary day is mint.</figcaption></figure>
        ${sub("Who it’s for", "Khatiq starts with one group: salaried people aged 22–35 in Indian cities, paid on a fixed date, with money in two or more banks and three or more autopays (rent, EMIs, SIPs, card dues). They can afford their bills. The dates just don’t line up.")}
        <div class="kq-panel kq-table-wrap reveal"><table class="kq-table">
          <thead><tr><th scope="col">Who</th><th scope="col">Why the gap hurts</th><th scope="col">In this version</th></tr></thead>
          <tbody>
            <tr class="is-us"><td>Salaried tenants</td><td>Debits on the 1st, salary on the 3rd, money across banks</td><td>Designed for</td></tr>
            <tr><td>Freelancers and gig workers</td><td>Pay lands late or in pieces</td><td>Next, after interviews</td></tr>
            <tr><td>Small business owners</td><td>Fixed supplier and loan debits, uneven income</td><td>Concept screens only</td></tr>
            <tr><td>One person managing a household’s money</td><td>Many debits, one person’s worry</td><td>Open research question</td></tr>
          </tbody>
        </table></div>
        <p class="kq-cap reveal">Defined by behaviour, not age or city: fixed debits, a fixed pay date, more than one bank.</p>
        <p class="kq-constraints reveal"><b>Not only rent</b> The same gap shows up for EMIs, credit-card dues, SIPs and freelance pay that lands late. Rent is the clearest example, so the prototype starts there.</p>
        <ul class="kq-made reveal">
          <li style="--tile:#1d1840;--tile-ink:#ffffff"><span class="kq-made-n">01</span><b>A home for all your money</b><span>One line says whether you’re okay, across every bank you use.</span></li>
          <li style="--tile:#4b3fc4;--tile-ink:#ffffff"><span class="kq-made-n">02</span><b>One calm card, 3 days early</b><span>The amount, the days, and three ways out with their costs.</span></li>
          <li style="--tile:#c9c3ff;--tile-ink:#1d1747"><span class="kq-made-n">03</span><b>The same moment everywhere</b><span>iPhone, both screens of iPhone Duo, iPad and Apple Watch.</span></li>
        </ul>

        ${chapter("s-challenge", "02", "Challenge", "Rent leaves before salary lands", "Banking apps show what already happened. The warning arrives as an SMS after the bounce, in words like NACH and mandate. People are left to do the maths themselves.")}
        <figure class="kq-panel kq-loop-wrap reveal">${pr.loop()}<figcaption>Today’s loop, every month the dates don’t line up.</figcaption></figure>
        <div class="reveal">${st.beforeAfter(img("alert-card.webp", "The real card from the Khatiq app: Konkan, one thing to sort. Rent leaves 1 Nov. You’ll be ₹1,059 short for 2 days. A 30-day chart with two short days, and See 3 ways to fix it"))}</div>
        ${sub("What already exists", "People already get warnings before an autopay. They say a payment is coming, not whether you can cover it.")}
        <div class="kq-panel kq-table-wrap reveal"><table class="kq-table">
          <thead><tr><th scope="col">Signal</th><th scope="col">When it arrives</th><th scope="col">What you learn</th></tr></thead>
          <tbody>
            <tr><td>Pre-debit notice for a card or UPI autopay</td><td>About a day before</td><td>A payment is coming. Not whether your balance covers it.</td></tr>
            <tr><td>Low-balance alert</td><td>When the balance drops below a set amount</td><td>Your balance is low. Not which bill is at risk, or that salary lands in two days.</td></tr>
            <tr><td>Bounce SMS</td><td>After the payment fails</td><td>That it already failed.</td></tr>
            <tr class="is-us"><td>Khatiq</td><td>Three days before</td><td>How short, for how long, and three ways out with their costs.</td></tr>
          </tbody>
        </table></div>
        ${sub("Why now", "India’s rails can finally see the whole picture. 338 million accounts are linked through the Account Aggregator, and RBI is making aggregators interoperable by 31 December 2026. UPI e-mandates passed 1.8 billion a month at the top ten banks in July 2026. The data to warn early exists. Nobody yet joins salary dates to debit dates.")}
        <p class="kq-cap reveal">Sources: <a href="https://www.freepressjournal.in/business/rbi-to-make-account-aggregators-interoperable-allow-cas-bank-deposits" target="_blank" rel="noopener">Free Press Journal<span class="sr-only"> (new tab)</span></a> · <a href="https://inc42.com/buzz/npci-to-let-users-port-upi-autopay-mandates-across-apps-report/" target="_blank" rel="noopener">Inc42<span class="sr-only"> (new tab)</span></a>.</p>
        ${sub("What people need from that moment", "Written as jobs to be done. Interviews in India come first in the research plan.")}
        <ol class="kq-jobs reveal">
          <li><span>Main job</span><p>Tell me early if I won’t be okay this month.</p></li>
          <li><span>Emotional job</span><p>Help me feel in control, not judged or alarmed.</p></li>
          <li><span>Related job</span><p>Show me this is really my bank, and that a person is reachable.</p></li>
        </ol>
        ${sub("What the numbers say", "")}
        <div class="kq-statgrp reveal"><p class="kqan-k">In India</p>${st.stats([
          ["80%+", "of salaried employees ran out of salary before month-end; 34% before mid-month", "coral"],
          ["40%+", "borrowed from friends or family to cover the gap", "sun"],
          ["20 million", "UPI AutoPay mandates are revoked every month because the balance falls short", "sky"],
          ["₹500", "is a typical fixed NACH bounce charge, plus penal interest", "lavender"],
        ])}<p class="kq-cap">EY–Refyne, 3,010 respondents, 2021, via <a href="https://businesstoday.in/latest/economy/story/80-employees-find-wallets-empty-before-payday-finds-ey-refyne-study-312493-2021-11-17" target="_blank" rel="noopener">Business Today<span class="sr-only"> (new tab)</span></a> and <a href="https://outlookindia.com/business/business-news-covid-19-led-to-financial-crisis-among-81-of-indian-employees-report-news-401566" target="_blank" rel="noopener">Outlook India<span class="sr-only"> (new tab)</span></a> · <a href="https://www.business-standard.com/amp/finance/news/upi-autopay-revocations-hit-20-mn-monthly-over-low-customer-balances-125090700500_1.html" target="_blank" rel="noopener">Business Standard<span class="sr-only"> (new tab)</span></a>, Sep 2025 · <a href="https://www.bajajfinserv.in/how-to-update-nach-mandate-bank-account-change" target="_blank" rel="noopener">Bajaj Finserv<span class="sr-only"> (new tab)</span></a>.</p></div>
        <div class="kq-statgrp reveal"><p class="kqan-k">On trust, globally</p>${st.stats([
          ["14%", "fully trust AI with money advice; 72% want a human involved", "lavender"],
          ["55%", "who ignored a real fraud alert thought it was a scam", "coral"],
        ])}<p class="kq-cap">Addition Wealth (US) · fraud study summary.</p></div>
        <p class="kq-constraints reveal"><b>Designed for</b> UPI autopay, NACH bounce charges, the Account Aggregator, money across every bank you use, rupees in lakh grouping, Hindi and English.</p>

        <p class="kq-insight reveal">The warning already exists. What’s missing is the maths, and a way out.</p>

        ${chapter("s-process", "03", "Process", "Seven days, five decisions", "I mapped the journey, set the emotion each moment needs, brainstormed the ways out, then built and rebuilt the app until every screen said one thing.")}
        <figure class="kq-panel reveal">${tl.projectTimeline("03/")}</figure>
        <figure class="kq-panel reveal">${tl.journeyMap("03/")}<figcaption>Two moments of truth: the SMS from the bank, and how it ends.</figcaption></figure>
        ${sub("Who we’ll test with (assumptions, not findings)", "")}
        <ul class="kq-made kq-personas reveal">
          <li style="--tile:#1d1840;--tile-ink:#ffffff"><span class="kq-made-n">Salaried</span><b>Arjun, 27, Bengaluru</b><span>Rent on the 1st, salary on the 3rd, phone on EMI. <i>“Tell me before, not after.”</i></span></li>
          <li style="--tile:#4b3fc4;--tile-ink:#ffffff"><span class="kq-made-n">Freelance</span><b>Meera, 31, Pune</b><span>Illustrator. One client pays 45 days late; her SIP and card due don’t wait. <i>“Tell me which bill is at risk if this invoice slips.”</i></span></li>
          <li style="--tile:#c9c3ff;--tile-ink:#1d1747"><span class="kq-made-n">Shop owner · later</span><b>Rakesh, 44, Lucknow</b><span>Pharmacy. Supplier debits and a shop-loan EMI; Hindi-first, Android. <i>“Will I cover Friday’s supplier debit?”</i></span></li>
        </ul>
        ${sub("Emotional design: the right feeling at the right moment", "In banking, emotional design isn’t delight. It’s confidence when things are fine, reassurance and control when they aren’t, trust when money moves, and progress after.")}
        <figure class="kq-panel kq-ec-wrap reveal">${st.emotionCurve()}<figcaption>A design intention, to be tested. Framework: <a href="https://www.theuxda.com/blog/emotionally-intelligent-ux-power-next-gen-digital-banking">UXDA, emotionally intelligent UX in digital banking</a>.</figcaption></figure>
        ${sub("Brainstorm", "One idea, six directions. Filled ideas are in the prototype; dashed ones were parked or rejected.")}
        <figure class="kq-panel kq-mm-wrap reveal">${pr.mindMap()}</figure>
        <figure class="kq-panel reveal">${fl.iaStructure("03/")}<figcaption>Five tabs for what you do every week. Settings sit behind the avatar, and help is one tap from any card.</figcaption></figure>
        <figure class="kq-panel reveal">${fl.rentFlow("03/")}<figcaption>Every way out ends somewhere calm, and a failed move points straight back to the others.</figcaption></figure>
        ${sub("From sketch to screen", "Each screen went from a paper sketch to a grey wireframe to the final screen in code. Three of them, with what changed at each step and why.")}
        ${fi.fidelity(img)}
        ${sub("The decisions that shaped it", "")}
        <div class="reveal">${pr.timeline([
          ["Day 3", "Square, dense components", "Rounded, quiet components", "Sharp cards and heavy lines felt cold for a money worry. Soft shapes and fewer lines felt calmer."],
          ["Day 3", "One bank’s home", "A home for all your money", "Most people use two or three banks. The warning belongs above any one of them."],
          ["Day 4", "A red “may bounce” banner", "One calm sentence, three ways out", "Say what happens and by how much, then how to fix it."],
          ["Day 5", "Two buttons side by side", "One button, one quiet link", "Fix now does the no-fee move. The other ways are a tap away."],
          ["Day 6", "Bright colour everywhere", "Black canvas, colour with a job", "Mint for money in, coral for short, lavender for the one action. Colour stays under 10% of any screen."],
          ["After review", "An assistant named Seth", "Ask Khatiq", "Seth reads as a moneylender to many Hindi and Gujarati speakers, and as a Western name elsewhere. The assistant became part of Khatiq itself. A name test with speakers across regions is in the research plan."],
        ])}</div>
        ${sub("A review before anyone tests it", "Heuristic evaluation, an information-architecture check and a design critique. Eight findings, each fixed. Four of them:")}
        <ul class="kq-fixes reveal">
          <li><b>Home said too much</b><span>49 bits of text and five ways to say one fact. Now one sentence and one action.</span></li>
          <li><b>Charts repeated each other</b><span>A gauge, bars and rings for one number. Now bars only, and each colour means one thing.</span></li>
          <li><b>Confirm hid the result</b><span>It repeated the amount. Now it shows the new balance and your lowest point before salary.</span></li>
          <li><b>Profile was a tab</b><span>Rarely used, always visible. It moved to the avatar; Scan took the centre of the tab bar.</span></li>
        </ul>
        ${sub("Heuristics and principles, on the screen", "The project’s design principles and Nielsen’s usability heuristics, connected to the parts of the screen where they do their work.")}
        ${fi.heuristics(img)}

        ${chapter("s-solution", "04", "Solution", "Three days early, three taps to fix", "One calm card on the home screen with one action, the other ways a tap away with their costs, a confirm that shows the result, and an ending that looks forward.")}
        ${photo("mk-sofa.webp", "Someone on a sofa holding an iPhone with Konkan’s home in Khatiq: main account ₹31,240.50 and the gap card, ₹1,059 short for 2 days", "kq-photo--wide")}
        <ol class="kq-flow reveal">
          <li><span class="kq-flow-n">1</span><b>See it</b>${img("gap-home.webp", "Home: Konkan, one thing to sort. Rent leaves 1 Nov, ₹1,059 short for 2 days. Move ₹1,500 from your savings pot, no fee: Fix now, or other ways")}</li>
          <li><span class="kq-flow-n">2</span><b>Choose</b>${img("gap-compare.webp", "Ways to cover rent: what doing nothing costs, then three ways out with their costs")}</li>
          <li><span class="kq-flow-n">3</span><b>Confirm</b>${img("gap-confirm.webp", "Confirm: after this move, ₹32,740.50, and your lowest point before salary becomes ₹442")}</li>
          <li><span class="kq-flow-n">4</span><b>Done</b>${img("gap-done.webp", "Rent is covered. Next date to watch, 3 Nov. You sorted this 3 days before it was due.")}</li>
        </ol>

        ${sub("Try it yourself", "The whole app runs here. Tap Fix now and follow it to the end, or open Profile, Cash-flow cards to see rent day on the Lock Screen.", "kq-try")}
        <div class="cf-live reveal">
          <iframe src="../prototypes/cash-flow-gap/index.html?embed" title="Khatiq prototype" loading="lazy"></iframe>
          <p class="kq-cap">Invented data. <a href="../prototypes/cash-flow-gap/index.html" target="_blank" rel="noopener">Open with all controls<span class="sr-only"> (new tab)</span></a>: four lenses, two banks, light and dark, iPhone Duo, iPad and Apple Watch.</p>
        </div>
        <p class="kq-proto-cta reveal"><a class="kq-btn" href="khatiq-prototype.html">Open the prototype in its own page <span aria-hidden="true">→</span></a></p>

        ${sub("The same moment, wherever you look", "Each screen gets its own layout: on a folding phone the card sits beside its options, on iPad two panes, and on the watch only the number and one action.")}
        <div class="kq-duo3d-head reveal">
          <h3 class="kq-duo3d-title">Interactive iPhone Duo prototype</h3>
          <p class="kq-duo3d-ghost">Designing for foldables</p>
        </div>
        <div class="kq-duo3d reveal">
          <iframe data-src="../prototypes/khatiq-duo/index.html" title="Khatiq on iPhone Duo, in 3D: drag to fold, or pick a pose"></iframe>
        </div>
        <script>
          /* The 3D viewer is about 4 MB. Start it once the page is idle, or as soon as it is within two screens,
             whichever comes first, so it is usually ready by the time someone scrolls to it. The viewer stops
             drawing while it is off screen. With Data Saver on, it waits until it is close. */
          (() => {
            const frame = document.querySelector(".kq-duo3d iframe");
            if (!frame) return;
            let started = false;
            const start = () => {
              if (started) return;
              started = true;
              frame.src = frame.dataset.src;
            };
            const saveData = navigator.connection && navigator.connection.saveData;
            if (!saveData) {
              const idle = () => ("requestIdleCallback" in window ? requestIdleCallback(start, { timeout: 4000 }) : setTimeout(start, 2500));
              if (document.readyState === "complete") idle();
              else addEventListener("load", idle, { once: true });
            }
            if ("IntersectionObserver" in window) {
              const near = new IntersectionObserver((entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                  start();
                  near.disconnect();
                }
              }, { rootMargin: "200% 0px" });
              near.observe(frame);
            } else start();
          })();
        </script>
        <p class="kq-cap kq-credit reveal">Drag the slider to fold it, drag the phone to turn it, or pick a pose. 3D model: Apple, iPhone Duo. Viewer adapted from akashtdev’s iphone-duo-animation (MIT).</p>
        <div class="cf-eco kq-eco-strip reveal">
          <figure>${img("bz-watch-face.webp", "Apple Watch face: rent 1 Nov, ₹1,059 short, a 14-day chart and three rings")}<figcaption>Watch: on the face</figcaption></figure>
          <figure>${img("bz-watch-confirm.webp", "Confirm ₹1,500 on Apple Watch, double tap to confirm")}<figcaption>Watch: Double Tap confirms</figcaption></figure>
          <figure class="is-wide">${img("bz-ipad.webp", "iPad Air in landscape: the tab bar on top, the all-money home on the left and Ways to cover rent on the right")}<figcaption>iPad: split view</figcaption></figure>
        </div>
        <p class="kq-cap kq-credit reveal">Credits: Apple, Apple Watch and iPad</p>

        ${sub("Rent day, outside the app", "On 1 Nov the autopay becomes a Live Activity. It starts when the autopay is queued and ends when the landlord is paid. Amounts stay hidden on the Lock Screen unless you turn them on.")}
        ${phones([
          ["live-lock.webp", "Lock Screen on 1 Nov at 7:30: Khatiq, rent day. Rent needs a look. Autopay at 10:00. One button, Fix now", "Lock Screen, amounts hidden"],
          ["live-island.webp", "Home Screen with the Dynamic Island showing a house glyph and Short", "Dynamic Island"],
          ["live-expanded.webp", "The Dynamic Island expanded: rent, ₹1,059 short, ₹32,000 leaves at 10:00, and Fix now", "Touch and hold"],
          ["live-lock-paid.webp", "Lock Screen after 10:02: rent paid, ₹32,000 to Prakash Rao, every step done", "Paid, then it ends"],
        ])}

        ${sub("Data you can read at a glance", "One chart language: bars. Mint is money in, coral is a shortfall, and each bank keeps its own colour. Every chart has a sentence that says what it means.")}
        ${phones([
          ["gap-bank.webp", "The bank home: 30 days of balance as bars, two short days below the line", "30 days, two short"],
          ["ins-insights.webp", "Insights: six months of spending with October picked out and a dashed average", "One month picked out"],
          ["ins-goals.webp", "Savings goals: one bar per goal, all in one colour, with the closest goal named", "One bar per goal"],
          ["acc-linked.webp", "Accounts across three banks, each in its own colours", "Banks in their colours"],
        ])}

        ${sub("What makes it trustworthy", "Money is about trust, so the warning explains itself, a person is always one tap away, and you decide what each bank shares.")}
        ${phones([
          ["gap-why.webp", "Why am I seeing this? What we looked at and what we never use", "Why you’re seeing it"],
          ["gap-handoff.webp", "A person will take it from here, and sees what you saw", "A person, one tap away"],
          ["link-consent.webp", "Share Malabar data? What, how far back, how often, until when, and why", "Consent you control"],
          ["gap-error.webp", "Couldn’t move the money; another way still works", "Errors with a way out"],
        ])}

        ${sub("Every screen", "Everything the story above skips, grouped by flow.")}
        <div class="kq-lib reveal">${library([
          ["Onboarding", "phone", [["onb-welcome", "Welcome to Khatiq"], ["onb-bank", "Where does your salary land?"], ["onb-phone", "Your mobile number"], ["onb-otp", "Enter the code"], ["onb-pin", "Set an app PIN"], ["onb-notify", "Turn on notifications"]]],
          ["The gap, step by step", "phone", [["gap-stepup", "A passkey for a large move"], ["gap-waiting", "Moving, with named steps"], ["gap-covered", "Home after: rent is covered"], ["gap-jargon", "Bank words, rewritten"]]],
          ["Accounts and activity", "phone", [["acc-all", "Accounts by bank"], ["acc-detail", "Main account"], ["acc-nila", "A linked, read-only account"], ["act-list", "Activity with filters"], ["act-txn", "One payment"]]],
          ["Pay", "phone", [["pay-hub", "Pay"], ["pay-scan", "Scan a QR"], ["pay-amount", "Enter an amount"], ["pay-pin", "UPI PIN"], ["pay-done", "Paid"], ["pay-rent", "The rent autopay"]]],
          ["Linking another bank", "phone", [["link-pick", "Pick a bank"], ["link-otp", "Approve the consent"], ["link-search", "Finding accounts"], ["link-found", "Choose accounts"], ["link-done", "Linked"], ["link-failed", "When a bank doesn’t answer"], ["link-consents", "Linked banks and consents"]]],
          ["Rent day Live Activity", "phone", [["live-lock", "Lock Screen, amounts hidden"], ["live-island", "Dynamic Island, compact"], ["live-expanded", "Expanded, short"], ["live-expanded-ok", "Expanded, on track"], ["live-lock-paid", "Paid, amounts shown"]]],
          ["Ask Khatiq, the assistant", "phone", [["ai-optin", "Off until you turn it on"], ["ai-chat", "Answers marked Sure, Not sure, Can’t do"], ["ai-sheet", "What each face means"], ["ai-home", "Ask Khatiq on the bank home"]]],
          ["Profile and settings", "phone", [["pro-profile", "Profile"], ["pro-inbox", "Notifications"], ["pro-cards", "Cash-flow card settings"], ["pro-security", "PIN and fingerprint"]]],
          ["For a small business", "phone", [["biz-home", "Cash position, three weeks"], ["biz-approve", "Approve a move"]]],
          ["Light mode and another bank", "phone", [["theme-light", "Light mode"], ["theme-light-ins", "Insights, light"], ["theme-deccan", "In Deccan’s colours"], ["theme-deccan-acc", "Deccan accounts"]]],
          ["Folding phone and iPad", "wide", [["duo-outer-home", "Closed: home"], ["duo-outer-compare", "Closed: ways to cover rent"], ["duo-inner-accounts", "Open: accounts beside an account"], ["duo-inner-activity", "Open: activity beside a payment"], ["duo-book-home", "Folded like a book"], ["ipad-accounts", "iPad: accounts"], ["ipad-bank", "iPad: the bank home"]]],
          ["Apple Watch", "watch", [["watch-face", "The face"], ["watch-aod", "Always On hides amounts"], ["watch-stack", "Smart Stack"], ["watch-live", "Rent day Live Activity"], ["watch-alert", "The alert"], ["watch-confirm", "Confirm"], ["watch-done", "Done"]]],
        ])}</div>

        ${sub("The design system", "Drawn from the prototype’s own tokens, so the page can’t drift from the app.")}
        ${ds.designSystem(banks)}

        ${chapter("s-impact", "05", "Impact", "What it has to prove", "Nothing has been tested yet. These are the bars it must clear with 8 to 10 people, written down now so they can’t drift.")}
        <div class="kq-panel reveal">${st.targets([
          [8, 10, "Get it in 5 seconds", "Restate the situation and next step", "mint"],
          [8, 10, "Fix it in 60 seconds", "Cover a gap, unaided", "mint"],
          [7, 10, "Trust it enough to act", "And say where the data came from", "mint"],
          [9, 10, "Find a person in 10 seconds", "Talk to a person, from the card", "mint"],
          [7, 10, "Feel calm after", "One question, five words", "mint"],
        ])}</div>
        ${sub("How it gets tested", "")}
        <ol class="kq-reflect kq-plan reveal">
          <li><b>Interviews</b><span>10 people (6 salaried, 4 freelancers) about the last time a payment bounced.</span></li>
          <li><b>Two-week SMS diary</b><span>Real bank alerts, and which ones get ignored.</span></li>
          <li><b>Name and word test</b><span>20+ people across Hindi, English and South Indian languages, covering <i>Khatiq</i>, the assistant’s name, and words like “short” and “bounce”.</span></li>
          <li><b>Usability test</b><span>Two rounds of five, scored against the targets above.</span></li>
        </ol>
        

        ${chapter("s-reflection", "06", "Reflection", "What I’d keep, and what’s next", "")}
        <ol class="kq-reflect reveal">
          <li><b>Calm is mostly copy</b><span>The biggest changes were words. “May bounce” became “you’ll be ₹1,059 short”, and the fix moved into the same card.</span></li>
          <li><b>Less on home, more on the one thing</b><span>Cutting home from 49 bits of text to a handful made the alert the obvious next step.</span></li>
          <li><b>Design the wrist first</b><span>Apple Watch forced the shortest version of every message, and that version improved the phone.</span></li>
          <li><b>Next</b><span>The name and word test, then ten interviews in India, then the card in front of ten people against the targets above. What the research changes will go on this page.</span></li>
        </ol>

        <p class="kq-credits">Credits: Apple, iPhone Duo (including the 3D model), Apple Watch and iPad. 3D viewer adapted from akashtdev’s iphone-duo-animation (MIT). Mockup Cloud (iPhone on the sofa). akoya (iPhone in hand). App screens, diagrams and the prototype are my own; every bank and person in them is invented.</p>
      </div>
    </section>
  </main>

`;
const out = head + main + tail;
fs.writeFileSync(SITE + "/projects/cash-flow-gap.html", out);
console.log("wrote projects/cash-flow-gap.html", Math.round(out.length / 1024) + " KB");
fs.writeFileSync(SITE + "/projects/khatiq-prototype.html", pp.protoPage());
console.log("wrote projects/khatiq-prototype.html");
