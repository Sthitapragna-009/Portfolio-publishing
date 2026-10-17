// Builds projects/easy-cms.html, the Easy CMS case study.
// Shell (nav, footer, theme toggle) is lifted from paraga-mitra.html so the two pages stay in step.
// Screens come from assets/easycms/*.webp, made by tools/easycms/capture.js from the running prototype.
// Icons: Solar (480 Design, CC BY 4.0) via allsvgicons.com, stored in tools/easycms/solar.json.
// Edit this file, not the HTML.
const fs = require("fs");
const path = require("path");
const SITE = path.resolve(__dirname, "../..");
const A = "../assets/easycms/";
const src = fs.readFileSync(SITE + "/projects/paraga-mitra.html", "utf8");
const solar = JSON.parse(fs.readFileSync(__dirname + "/solar.json", "utf8"));

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
  .replace('data-page="parag"', 'data-page="easycms"')
  .replace(/<title>[^<]*<\/title>/, "<title>Easy CMS — Website updates without code | Sthitapragna Kollepara</title>")
  .replace(/<meta name="description" content="[^"]*"/, '<meta name="description" content="Easy CMS: a simpler way for IIT Roorkee admin staff to update a department or centre website without HTML. Guided forms, a true preview, review before publishing, Hindi and English, GIGW checks and an AI helper with guardrails. Research plan, design and a working prototype."')
  .replace("family=Noto+Sans+Devanagari:wght@500;600;700&display=swap", "family=Noto+Sans+Devanagari:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap")
  .replace('<link rel="stylesheet" href="../styles.css" />', '<link rel="stylesheet" href="../styles.css" />\n  <link rel="stylesheet" href="../assets/easycms/easycms.css" />');
let tail = src.slice(src.indexOf("  <!-- ===================== LIGHTBOX"));
tail = tail.replace('<script src="../assets/parag/parag.js"></script>', '<script src="../assets/easycms/easycms.js"></script>');

// ---------- icons ----------
const sprite = `  <!-- Icons: Solar by 480 Design (CC BY 4.0), via allsvgicons.com. Linear for detail, bold duotone for tiles. -->
  <svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
${Object.entries(solar.linear).map(([k, v]) => `    <symbol id="i-${k}" viewBox="0 0 24 24">${v}</symbol>`).join("\n")}
${Object.entries(solar.duo).map(([k, v]) => `    <symbol id="d-${k}" viewBox="0 0 24 24">${v}</symbol>`).join("\n")}
  </svg>`;
const ico = (n) => `<svg class="ec-i" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const duo = (n) => `<svg class="ec-i" aria-hidden="true"><use href="#d-${n}"/></svg>`;
const ib = (n, d = true) => `<span class="ec-ib">${d ? duo(n) : ico(n)}</span>`;

// ---------- image sizes, read from the webp headers ----------
function size(file) {
  const b = fs.readFileSync(SITE + "/assets/easycms/" + file);
  const kind = b.toString("ascii", 12, 16);
  if (kind === "VP8X") return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
  if (kind === "VP8 ") return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
  if (kind === "VP8L") { const n = b.readUInt32LE(21); return [1 + (n & 0x3fff), 1 + ((n >> 14) & 0x3fff)]; }
  return [2880, 1800];
}
const img = (file, alt) => { const [w, h] = size(file); return `<img src="${A}${file}" alt="${e(alt)}" width="${w}" height="${h}" loading="lazy" decoding="async" />`; };
const browser = (file, alt, url = "easycms.iitr.ac.in", cls = "") => `<figure class="ec-browser${cls ? " " + cls : ""}"><div class="ec-browser-bar" aria-hidden="true"><i></i><i></i><i></i><span>${e(url)}</span></div>${img(file, alt)}</figure>`;
const phone = (file, alt) => `<figure class="ec-phone">${img(file, alt)}</figure>`;
const cap = (t) => `<p class="ec-cap">${t}</p>`;

// ---------- layout helpers ----------
const head2 = (id, phase, title, intro) => `
        <div class="plate-head" id="${id}">
          <h2 class="display section-title" data-phase="${phase}">${e(title)}</h2>
          <div class="section-intro">${[].concat(intro).map((p) => `<p>${e(p)}</p>`).join("")}</div>
        </div>`;
const bx = (panels, cls = "") => `\n        <div class="bx${cls ? " " + cls : ""} reveal">${panels.join("")}</div>`;
const p = (w, inner, { tone = "", wt, wm, h } = {}) =>
  `<div class="p${tone ? " p--" + tone : ""}" style="--w:${w}${wt ? `;--wt:${wt}` : ""}${wm ? `;--wm:${wm}` : ""}${h ? `;--h:${h}` : ""}">${inner}</div>`;
const k = (t) => `<p class="p-k">${e(t)}</p>`;
const t = (s) => `<h3 class="p-t">${e(s)}</h3>`;
const s = (x) => `<p class="p-s">${e(x)}</p>`;
const pills = (items) => `<ul class="p-pills">${items.map((i) => `<li>${e(i)}</li>`).join("")}</ul>`;
const step = (n, label, title, text, why, shot, extra = "") => `
          <div class="ec-step reveal">
            <div class="ec-step-text">
              <p class="ec-step-n"><b>${n}</b>${e(label)}</p>
              <h3>${e(title)}</h3>
              <p>${e(text)}</p>
              ${why.length ? `<ul class="ec-why">${why.map((w) => `<li>${ico("CircleCheck")}<span>${e(w)}</span></li>`).join("")}</ul>` : ""}
              ${extra}
            </div>
            <div class="ec-step-shot">${shot}</div>
          </div>`;
const callout = (tone, icon, text) => `<p class="ec-callout ec-callout--${tone}">${ico(icon)}<span>${e(text)}</span></p>`;
const chip = (tone, icon, text) => `<span class="ec-chip ec-chip--${tone}">${ico(icon)}${e(text)}</span>`;

// ---------- page ----------
const main = `<main id="top">
    <section class="section case-head" id="ec-top">
      <div class="wrap">
        <a class="case-back" href="../index.html#work"><span aria-hidden="true">&larr;</span> All projects</a>
        <p class="eyebrow reveal">Product design &middot; Enterprise workflow &middot; Inclusive UI</p>
        <h1 class="display case-title reveal" data-delay="1">Easy CMS</h1>
        <p class="case-sub reveal" data-delay="2">A simpler way to update a heavy-information website, for institute staff who never learned HTML</p>

        <div class="case-brief reveal" data-delay="3">
          <div class="case-brief-row">
            <h2 class="case-brief-key">Objective</h2>
            <div class="case-brief-val">
              <p>At IIT Roorkee, every notice, event and faculty change on a department or centre website goes through Chakra, a CMS that accepts only HTML. The people who own those updates are admin staff, not coders. Easy CMS lets them post a correct, accessible, bilingual update by filling a familiar form, and lets a faculty reviewer approve it from a true preview before anything goes public.</p>
            </div>
          </div>
          <div class="case-brief-row">
            <h2 class="case-brief-key">Outcomes</h2>
            <div class="case-brief-val">
              <ul class="case-outcomes">
                <li>Guided editor</li>
                <li>True live preview</li>
                <li>Review and approval loop</li>
                <li>AI helper with guardrails</li>
                <li>Hindi and English UI</li>
                <li>GIGW 3.0 checks</li>
                <li>Website setup for the Computer Centre</li>
                <li>Design system</li>
              </ul>
            </div>
          </div>
        </div>

        <dl class="case-meta reveal" data-delay="4">
          <div><dt>Role</dt><dd>Research planning, product and interaction design, visual design, front-end prototype</dd></div>
          <div><dt>Context</dt><dd>IIT Roorkee department and centre websites; the demo runs the AMRUT Centre of Urban Planning for Capacity Building</dd></div>
          <div><dt>Status</dt><dd>Concept &middot; research planned &middot; working prototype built, not deployed</dd></div>
          <div><dt>Tools</dt><dd>Figma, React, Vite and TypeScript, Motion, Solar icons</dd></div>
        </dl>
      </div>
    </section>

    <section class="section case-plates">
      <div class="wrap">

        <figure class="plate ec-cover reveal">
          <img src="${A}card.jpg" alt="Easy CMS title board: the editor with a helper-filled announcement and its live preview, a phone showing the reviewer's approval screen, and chips reading Helper filled 5 fields and Last date soon" width="1600" height="1000" decoding="async" />
        </figure>

        <div class="pg-process reveal" aria-label="How the project ran">
          <div class="pg-process-head">
            <p class="pg-process-k">How the project ran</p>
            <p class="pg-process-tools"><span>Tools</span>FigJam &middot; Figma &middot; React, Vite, TypeScript &middot; Motion</p>
          </div>
          <ol class="pg-process-steps">
            <li data-phase="empathise"><a href="#s-01"><span class="pg-ph-n">1</span><b>Empathise</b><small>First-hand problem, an audit of a live site, the people, the research plan</small><em>4 sections</em></a></li>
            <li data-phase="define"><a href="#s-05"><span class="pg-ph-n">2</span><b>Define</b><small>Secondary research, insights to principles</small><em>2 sections</em></a></li>
            <li data-phase="ideate"><a href="#s-07"><span class="pg-ph-n">3</span><b>Ideate</b><small>Roles and places, the publishing workflow, an AI helper with limits</small><em>3 sections</em></a></li>
            <li data-phase="prototype"><a href="#s-10"><span class="pg-ph-n">4</span><b>Prototype</b><small>Website setup, the editor step by step, review on a phone, preview, help, accessibility, the system</small><em>7 sections</em></a></li>
            <li data-phase="test"><a href="#s-17"><span class="pg-ph-n">5</span><b>Test</b><small>What to measure against Chakra, and what comes next</small><em>2 sections</em></a></li>
          </ol>
          <p class="pg-process-loop">The prototype came first on purpose: a working demo to test with real staff, and to put in front of the Computer Centre.</p>
        </div>
${head2("s-01", "Empathise", "The problem", ["Chakra, the institute’s custom CMS, accepts only HTML in its content fields. So a one-line circular needs someone who can write markup.", "I have done this job myself, and I could not hand it over: the skill stayed with one person because the tool could not be taught quickly."])}
${bx([
  p(7, `<div class="ec-figs">
      <div class="ec-fig"><b>1</b><span>format Chakra accepts in content fields: HTML</span><span class="ec-src">Computer Centre portal</span></div>
      <div class="ec-fig"><b>5</b><span>kinds of update make up most of the work: notices, events, workshop links, faculty details, page text</span><span class="ec-src">From the brief</span></div>
      <div class="ec-fig"><b>88</b><span>mandatory guidelines in GIGW 3.0 for Indian government websites</span><span class="ec-src">GIGW 3.0</span></div>
    </div>`, { wt: 12 }),
  p(5, `${ib("ShieldCheck")}${k("first-hand")}${t("The website duty never leaves one desk")}${s("When I tried to hand the work to an admin colleague, every update still came back to me: a stray tag broke a table, a PDF link pointed to the wrong file, and nobody could see the result before it went live.")}`, { tone: "blue", wt: 12 }),
  p(4, `${ib("Code", false)}${t("Written in HTML")}${s("Staff who write fluent English in Word and email freeze at angle brackets.")}`, { wt: 6, wm: 12 }),
  p(4, `${ib("Eye", false)}${t("Checked after it is live")}${s("Mistakes are found by readers, then fixed by phone call.")}`, { wt: 6, wm: 12 }),
  p(4, `${ib("Users", false)}${t("Reviewed outside the tool")}${s("Faculty check screenshots on WhatsApp; the tool has no review step.")}`, { wt: 12 }),
])}
${head2("s-02", "Empathise", "What a live site shows", ["Before any interview, I read the public pages of one centre’s website, the AMRUT Centre of Urban Planning for Capacity Building. Small slips that hand-written HTML invites are visible from outside."])}
${bx([
  p(6, `${k("menu label versus page it opens")}<code class="ec-url">About Us → …/<mark>About MoHUA.html</mark><br>About IITR → …/<mark>About CUPCB.html</mark></code><span class="ec-flag">Labels and links out of step</span>${s("Two menu items open pages named for something else. Nobody notices until a reader does.")}`, { wt: 12 }),
  p(6, `${k("folder and file names")}<code class="ec-url">/Centres/AMRUT Centre of Urban Planning for Capacity Building<mark>&nbsp;</mark>/<br>/Faculty<mark>&nbsp;</mark>.html</code><span class="ec-flag">Spaces inside web addresses</span>${s("A trailing space in the folder and in a file name. Links work by luck and break when copied.")}`, { wt: 12 }),
  p(8, `${k("one centre, six menu groups, about 35 pages")}<ul class="ec-menu">
      <li><b>About Us</b><small>About IITR, DAP, MoHUA, CUPCB, partners and MoUs, themes</small></li>
      <li><b>Projects</b><small>Action research, consultancy, the Punjab GIS master plan, upcoming, completed</small></li>
      <li><b>Events</b><small>Workshops and training, symposiums, special lectures, round tables</small></li>
      <li><b>Announcements</b><small>Newsletter, stakeholder engagement, news, work with us</small></li>
      <li><b>People</b><small>Faculty, non-teaching staff, research staff</small></li>
      <li><b>Repository</b><small>Proceedings, minutes, documented cases, gallery, funding</small></li>
    </ul>`, { wt: 12 }),
  p(4, `${ib("Lightbulb")}${k("what this means")}${t("Most of these pages are lists")}${s("Announcements, lectures, workshops and people repeat the same shapes. They can be forms and cards, not free HTML.")}`, { tone: "violet", wt: 12 }),
])}
${head2("s-03", "Empathise", "Who it is for", ["Three roles, each with one job. The users have low digital literacy and low confidence, not low literacy: they read and write well, but code, jargon and the fear of breaking a public page slow them down."])}
${bx([
  p(4, `<div class="ec-person"><div class="ec-person-top"><span class="ec-avatar">SR</span><div>${t("The office assistant")}${s("Editor · admin staff")}</div></div><p class="ec-goal">Post today’s circular before the office closes, without calling anyone.</p><ul class="ec-tags"><li>Word, email, WhatsApp</li><li>Types in English</li><li>Prefers help in Hindi</li></ul></div>`, { tone: "paper", wt: 12 }),
  p(4, `<div class="ec-person"><div class="ec-person-top"><span class="ec-avatar">AM</span><div>${t("The faculty coordinator")}${s("Reviewer · HoD or centre coordinator")}</div></div><p class="ec-goal">See the update as readers will, then approve it or say what to fix in one line.</p><ul class="ec-tags"><li>Checks between classes</li><li>On a phone</li><li>Wants one tap to approve</li></ul></div>`, { tone: "violet", wt: 12 }),
  p(4, `<div class="ec-person"><div class="ec-person-top"><span class="ec-avatar">DK</span><div>${t("The new hand-over editor")}${s("Editor · first week on the job")}</div></div><p class="ec-goal">Finish a real update in the first session, and still remember how three weeks later.</p><ul class="ec-tags"><li>Never trained</li><li>Infrequent use</li><li>Memorability matters</li></ul></div>`, { tone: "lav", wt: 12 }),
  p(12, `${k("and one more role")}<div class="p-split"><div>${t("The Computer Centre, as access admin")}${s("Registers each department or centre website, grants and removes editor and reviewer access, and never touches content.")}</div><div>${pills(["A simple people list", "Create a website in minutes", "No involvement in content"])}</div></div>`, { tone: "flat" }),
])}
${head2("s-04", "Empathise", "The research plan", ["Watch five or six admin staff do real updates in Chakra, measure a baseline, then test Easy CMS against the same three tasks. This research is planned, not yet run; the hypotheses below are what it sets out to confirm or reject."])}
${bx([
  p(5, `${k("methods")}<ul class="ec-why">
      <li>${ico("Users")}<span>2 to 3 stakeholder talks: Computer Centre, HoDs</span></li>
      <li>${ico("Eye")}<span>5 to 6 contextual inquiries at editors’ desks, thinking aloud</span></li>
      <li>${ico("Stopwatch")}<span>Chakra baseline: three tasks, timed, with errors and help requests</span></li>
      <li>${ico("Smartphone")}<span>2 to 3 reviewer interviews: how and where they check</span></li>
      <li>${ico("Folder")}<span>Artefacts, with consent: cheat sheets, review messages</span></li>
    </ul>`, { wt: 12 }),
  p(7, `${k("the three baseline tasks")}<ol class="ec-why">
      <li>${ico("FileText")}<span><b>Post a circular</b> with a PDF attachment</span></li>
      <li>${ico("Presentation")}<span><b>Add a workshop</b> with date, venue, poster and registration link</span></li>
      <li>${ico("UserRound")}<span><b>Change a faculty member’s</b> designation and photo</span></li>
    </ol>${s("Measured per task: time, errors, help requests and a one-question ease rating; SUS at the end of the session.")}`, { tone: "blue", wt: 12 }),
  p(12, `<div class="ec-table-wrap"><table class="ec-table">
      <thead><tr><th>Hypothesis</th><th>What would confirm it</th><th>Status</th></tr></thead>
      <tbody>
        <tr><td>Staff keep personal cheat sheets of HTML or old pages to copy from</td><td>Notebooks, text files, saved emails at their desk</td><td><span class="ec-pill ec-pill--plan">to test</span></td></tr>
        <tr><td>Content pasted from Word or email breaks formatting</td><td>Stray tags, broken tables, wrong fonts on live pages</td><td><span class="ec-pill ec-pill--plan">to test</span></td></tr>
        <tr><td>Errors are found by readers after publishing</td><td>Corrections requested by phone or WhatsApp after a notice goes live</td><td><span class="ec-pill ec-pill--plan">to test</span></td></tr>
        <tr><td>Faculty review happens outside the tool</td><td>Review messages with screenshots or printouts</td><td><span class="ec-pill ec-pill--plan">to test</span></td></tr>
        <tr><td>Old notices are rarely removed, so pages go stale</td><td>Expired events and past deadlines still listed</td><td><span class="ec-pill ec-pill--plan">to test</span></td></tr>
        <tr><td>An English-only, jargon-heavy interface adds hesitation</td><td>Staff asking what a field or button means</td><td><span class="ec-pill ec-pill--plan">to test</span></td></tr>
      </tbody></table></div>`, { tone: "flat" }),
])}
${head2("s-05", "Define", "What other teams found", ["Secondary research shows the problem is common across government and university sites. Existing tools solve hosting and compliance, not the editing experience."])}
${bx([
  p(12, `<div class="ec-table-wrap"><table class="ec-table">
      <thead><tr><th>Finding</th><th>What it means for Easy CMS</th><th>Source</th></tr></thead>
      <tbody>
        <tr><td>Updates go through an IT division and content goes stale</td><td>Owners publish directly, with review</td><td><a href="https://dot.gov.in/sites/default/files/2014%2007%2003%20Minutes%20of%20DOT%20Website%20Meeting.pdf?download=1" target="_blank" rel="noopener">DoT minutes</a></td></tr>
        <tr><td>Unclear page ownership keeps outdated information live</td><td>Owner and last-updated date on every page; nudge stale ones</td><td><a href="https://easycontent.io/resources/managing-multi-department-content-on-government-websites/" target="_blank" rel="noopener">EasyContent</a></td></tr>
        <tr><td>Hard tools and untrained teams cause outdated sites</td><td>Ease of use and built-in teaching are the product</td><td><a href="https://cdn.adhoc.team/website-modernization" target="_blank" rel="noopener">Ad Hoc</a></td></tr>
        <tr><td>GIGW 3.0 asks for tools that help creators make accessible content</td><td>Checks in the editor and a health view</td><td><a href="https://guidelines.india.gov.in/?p=10063" target="_blank" rel="noopener">GIGW 3.0</a></td></tr>
        <tr><td>NIC’s S3WaaS generates compliant sites from templates</td><td>Be the editing layer people use daily, not a hosting rival</td><td><a href="https://egovernance.vikaspedia.in/viewcontent/e-governance/digital-india/s3waas-for-government-department-websites?lgn=en" target="_blank" rel="noopener">S3WaaS</a></td></tr>
        <tr><td>The gap between draft, preview and live is editors’ biggest pain</td><td>The preview must be the real page</td><td><a href="https://groups.drupal.org/node/277458" target="_blank" rel="noopener">Drupal focus group</a></td></tr>
        <tr><td>Infrequent editors need the tool to be easy to come back to</td><td>Design for memorability, not just learnability</td><td><a href="https://ucm.le.ac.uk/?p=162" target="_blank" rel="noopener">University of Leicester</a></td></tr>
        <tr><td>Treating all low-literacy users as one group is risky</td><td>Design for semiliterate to fluent readers</td><td><a href="https://www.dgp.toronto.edu/public_user/ravin/papers/chi2009_literacy.pdf" target="_blank" rel="noopener">CHI 2009</a></td></tr>
      </tbody></table></div>`, { tone: "flat" }),
])}
${head2("s-06", "Define", "Principles", ["Apple’s design principles, turned into rules for a nervous, infrequent editor."])}
        <div class="ec-rules reveal">
          ${[
            ["Purpose", "Do five jobs perfectly: notice, event, workshop link, faculty details, page text. Everything else sits a level deeper."],
            ["Familiarity", "Feel like a form and a document they know: Word-like text, WhatsApp-like attach, a calendar for dates. No HTML, slug or taxonomy."],
            ["Simplicity", "One task per screen. Plain verbs on buttons: Post notice, Send to the Coordinator for checking."],
            ["Forgiveness", "Autosave, undo and version history. Nothing is public until a person approves it. Confirm only what cannot be undone."],
            ["Responsibility", "The helper suggests, the person decides. Dates, names and numbers are only extracted, never invented."],
            ["Flexibility", "Hindi and English, text size, high contrast, dark mode, reduced motion; office PC and the reviewer’s phone."],
            ["Craft", "Feedback on press, a calm layout, springs that settle without bounce, nothing that jumps."],
            ["Delight", "The feeling to aim for is calm confidence: I did it myself, and it is correct."],
          ].map(([a, b], i) => `<div class="ec-rule"><span class="ec-n">0${i + 1}</span><b>${e(a)}</b><span>${e(b)}</span></div>`).join("")}
        </div>
${head2("s-07", "Ideate", "Roles and places", ["Editors see six places, one level deep. Reviewers and the Computer Centre each see only their one job."])}
        <div class="ec-ia reveal">
          <div class="ec-ia-col ec-ia-col--editor">
            <p class="ec-ia-role">${ico("PenLine")} Editor</p>
            <p>Office staff who write updates</p>
            <ul class="ec-ia-list">
              <li>${ico("House")}Home<small>What do you want to update?</small></li>
              <li>${ico("ListChecks")}My updates<small>Drafts, sent back, live</small></li>
              <li>${ico("Globe")}Website<small>Pages, owners, freshness</small></li>
              <li>${ico("Paperclip")}Files<small>PDFs and pictures</small></li>
              <li>${ico("Users")}Team<small>Hand the duty over</small></li>
              <li>${ico("Settings")}Settings<small>Language, size, contrast</small></li>
            </ul>
          </div>
          <div class="ec-ia-col">
            <p class="ec-ia-role">${ico("ClipboardCheck")} Reviewer</p>
            <p>HoD or centre coordinator, mostly on a phone</p>
            <ul class="ec-ia-list">
              <li>${ico("ClipboardCheck")}To check<small>Approve, or send back</small></li>
              <li>${ico("Globe")}Website<small>See it as readers do</small></li>
            </ul>
          </div>
          <div class="ec-ia-col">
            <p class="ec-ia-role">${ico("ShieldCheck")} Computer Centre</p>
            <p>Access admin, never edits content</p>
            <ul class="ec-ia-list">
              <li>${ico("Globe")}Websites<small>Register and set up</small></li>
              <li>${ico("ShieldCheck")}People<small>Who updates which parts</small></li>
            </ul>
          </div>
        </div>
${head2("s-08", "Ideate", "The publishing workflow", ["Every update moves through visible states, in words, colour and an icon. Only a reviewer’s approval makes it public, and editing something live never touches what readers see until the change is approved too."])}
        <div class="ec-flow reveal" aria-label="Publishing workflow">
          <div class="ec-state">${chip("draft", "PencilLine", "Draft")}<b>The editor works</b><span>Saves as they type. Only they can see it.</span></div>
          <div class="ec-state">${chip("review", "Hourglass", "Waiting for review")}<b>Sent for checking</b><span>The form locks so the reviewer sees exactly what was sent.</span></div>
          <div class="ec-state">${chip("returned", "Undo2", "Sent back")}<b>One-line note</b><span>The note sits beside the field it is about.</span></div>
          <div class="ec-state">${chip("live", "CircleCheck", "Live")}<b>Approved, published</b><span>Readers see it, with owner and date in the footer.</span></div>
          <div class="ec-state">${chip("expired", "Archive", "Expired")}<b>Leaves on its date</b><span>Notices and workshops archive themselves.</span></div>
          <div class="ec-loop" aria-hidden="true"><span>fix and send again</span></div>
        </div>
${head2("s-09", "Ideate", "An AI helper, with limits", ["The helper removes typing and checking work. Every suggestion waits for a person; it never publishes and never invents a fact."])}
${bx([
  p(7, `${k("what it does")}<dl class="ec-dl">
      <div><dt>Fill from rough text</dt><dd>Paste an email, a WhatsApp message or a circular’s text; it fills title, dates, category, venue and link.</dd></div>
      <div><dt>Make Hindi version</dt><dd>Drafts the Hindi title, labelled Machine translated until a person checks it. The reviewer sees the label too.</dd></div>
      <div><dt>Check before sending</dt><dd>Missing or past dates, broken links, possible duplicates, scanned PDFs, missing Hindi.</dd></div>
      <div><dt>Describe a picture</dt><dd>Suggests alt text for posters and photos, marked until confirmed.</dd></div>
      <div><dt>Ask for help</dt><dd>Answers in Hindi or English, then highlights the control on screen.</dd></div>
    </dl>`, { tone: "violet", wt: 12 }),
  p(5, `${k("what it never does")}<ul class="ec-never">
      <li>Publish, or send for review, by itself</li>
      <li>Invent a date, a name, a number or a link</li>
      <li>Leave a filled field unmarked: each waits for “Looks right”</li>
      <li>Read staff records or other pages; only the update being edited</li>
      <li>Stay on if a department switches it off</li>
    </ul>`, { tone: "paper", wt: 12 }),
])}
${head2("s-10", "Prototype", "Setting up a website", ["On a new installation, no department or centre is registered. The Computer Centre sees one clear job: create the first website. Four short steps, and the editor and reviewer are invited."])}
        <div class="ec-steps">
${step(1, "Computer Centre", "Nothing registered yet", "The first screen says what is missing and what happens next, in three steps. Only the Computer Centre can see it.", ["One action on the page", "Editors and reviewers see a plain “not set up yet” screen instead"], browser("d-admin-empty.webp", "Easy CMS first-run screen for the Computer Centre: No department or centre has a website here yet, with a Create a new website button and three steps: name it, choose pages, invite people"))}
        </div>
        <div class="ec-wiz reveal">
          <figure>${browser("d-wiz-1-address.webp", "Wizard step 1: unit type, full name, short name, Hindi name and a web address that is cleaned automatically")}${cap("<b>1 · Whose website.</b> The address is made from the name; spaces and capitals are cleaned so links never break.")}</figure>
          <figure>${browser("d-wiz-2.webp", "Wizard step 2: tiles for Announcements, Events and lectures, Workshops and training, People and About us, with one switched off")}${cap("<b>2 · Pages.</b> Start with what the unit already publishes. Labels follow the unit: a centre gets Announcements.")}</figure>
          <figure>${browser("d-wiz-3.webp", "Wizard step 3: editor and reviewer names and emails")}${cap("<b>3 · People.</b> One editor and one reviewer to begin; the reviewer is the coordinator or the HoD.")}</figure>
          <figure>${browser("d-wiz-4.webp", "Wizard step 4: a summary beside a live preview of the new, still empty website")}${cap("<b>4 · Check and create.</b> A first look at the empty site, built from the same components readers will see.")}</figure>
        </div>
        <div class="ec-pair reveal" style="margin-top:2rem">
          <div>${browser("d-admin-sites.webp", "The Websites list after creation, with the new Centre for Transportation Systems card waiting for its first update")}${cap("The new site waits for its first update. Invitations went to its editor and reviewer.")}</div>
          <div>${browser("d-people.webp", "People screen: who can update which parts of each website, with section toggles per person")}${cap("People: access per website and per section, one tap each. No content here.")}</div>
        </div>
${head2("s-11", "Prototype", "The editor, step by step", ["The core flow: posting an announcement from a message that arrived on WhatsApp. Every screen here is from the working prototype."])}
        <div class="ec-steps">
${step(1, "Home", "What do you want to update?", "Five large task cards in the users’ own words, the most used one first. Anything sent back waits on the right with the reviewer’s note.", ["Status in words, colour and icon", "Website health from GIGW checks"], browser("d-home.webp", "Editor home: greeting, five task cards with Post an announcement first, a Needs your attention panel with a sent-back item, counts and website health"))}
${step(2, "Helper", "Paste the message", "Most updates already exist as an email or a WhatsApp forward. The editor pastes it instead of retyping.", [], browser("d-editor-paste.webp", "Editor with the Have the message already panel open and an example call for applications pasted in"), callout("ai", "Sparkles", "The helper only copies dates, names and links from the text. It never invents them and never posts anything."))}
${step(3, "Helper", "Every filled field is marked", "Title, category, dates and description fill in, each with a dashed violet outline and a Looks right button. The preview on the right is the real page, updating as they type.", ["Violet means suggested, not settled", "One click to confirm or clear"], browser("d-editor-filled.webp", "Editor after the helper filled the form: dashed violet fields with Looks right buttons, and the live preview of the centre's Announcements page with the new item highlighted"))}
${step(4, "Check", "It will not send unconfirmed work", "Pressing send runs the check first. Anything that would mislead readers must be fixed; notes like a missing Hindi title can be sent anyway.", ["Plain words, no blame", "Go there jumps to the field"], browser("d-editor-check.webp", "The check panel listing five things to fix: each field the helper filled still needs a person to confirm it"), callout("alert", "TriangleAlert", "Must-fix items block sending. Notes do not; the reviewer sees the same notes."))}
${step(5, "Hindi", "Make Hindi version", "One press drafts the Hindi title. It stays labelled Machine translated until a person ticks I checked it.", ["GIGW asks for both languages", "The label follows the update to the reviewer"], browser("d-editor-hindi.webp", "The Title in Hindi field with a machine-drafted translation and a Machine translated, check before publishing label"))}
${step(6, "Send", "Send to the Coordinator for checking", "The button names the person. A short dialog lists any notes, then the update goes to the review queue.", [], browser("d-editor-send-dialog.webp", "Send with these notes dialog listing one note about the machine-translated Hindi title, with Fix them first and Send anyway"))}
${step(7, "My updates", "Where everything stands", "Tabs for drafts, sent back, waiting, live and expiring soon. Search by any word in the title.", ["Hindi version shown per row", "Owner and last change on every item"], browser("d-updates-review.webp", "My updates board filtered to Waiting for review, showing the new call for applications and a round table notice"))}
        </div>
${head2("s-12", "Prototype", "Review, mostly on a phone", ["Reviewers check between classes. They see what changed from the live version, the notes the editor saw, and the page as readers will see it. One tap approves; one line sends it back."])}
        <div class="ec-trio reveal">
          <div>${phone("p-review.webp", "Reviewer queue on a phone: one announcement waiting, with a Check button and recently checked items below")}${cap("<b>Queue.</b> Only what needs a decision.")}</div>
          <div>${phone("p-review-preview.webp", "Reviewer on a phone looking at the phone preview of the announcement, with Send back with a note and Approve and publish buttons fixed at the bottom")}${cap("<b>Decide.</b> The real page, then two big buttons.")}</div>
          <div>${phone("p-site.webp", "The centre's Announcements page on a phone after approval")}${cap("<b>Published.</b> Live on the site at once.")}</div>
        </div>
        <div class="ec-pair reveal" style="margin-top:2rem">
          <div>${browser("d-review-detail.webp", "Reviewer desktop view: a What changed panel with the old and new removal dates and description, beside the preview")}${cap("<b>What changed.</b> Old value struck through, new value highlighted, for an edit to a live notice.")}</div>
          <div>${browser("d-returned-field.webp", "The editor's form with the reviewer's note shown beside the removal date field it refers to")}${cap("<b>Sent back.</b> The note lands beside the field it is about, not in an email thread.")}</div>
        </div>
${head2("s-13", "Prototype", "The preview is the real page", ["The preview and the public site are rendered by the same components from the same data, so what the reviewer approves is exactly what readers get. The centre’s site itself was redesigned in the same blue, with orange only for alerts."])}
        <div class="ec-mix reveal">
          <div>${browser("d-site-home.webp", "The AMRUT Centre home page: floating menu, a blue hero with a Next up lecture card and an orange Last date soon workshop card, an at-a-glance band with counts, and announcement, event and workshop panels", "iitr.ac.in/centres/amrut-centre-urban-planning", "ec-site")}${cap("Readers’ view: floating menu, hero with the next lecture and the closest deadline, at-a-glance counts, then the lists editors fill.")}</div>
          <div>${phone("p-editor-preview.webp", "Editor on a phone switched to the Preview tab, showing the new announcement highlighted on the centre's site")}${cap("On a phone, form and preview are two tabs.")}</div>
        </div>
${head2("s-14", "Prototype", "Help in the same place", ["One Help button, always top right. Each screen lists its steps with Show me, which scrolls to the control and outlines it. Questions can be typed in Hindi or English."])}
        <div class="ec-steps">
${step("?", "Help", "Show me, not tell me", "Asked “how do I add a poster?”, help answers in steps and outlines the Poster field on the form.", ["Same place on every screen", "Answers point at real controls"], browser("d-help.webp", "Help panel open beside an event form, answering how to add a poster, with the Poster field outlined on the page"))}
        </div>
${head2("s-15", "Prototype", "Accessibility and GIGW", ["Accessibility works on two sides: the interface itself (WCAG 2.1 AA as the target), and the content it publishes, which is GIGW-ready by default."])}
        <div class="ec-pair reveal">
          <div>${browser("d-home-hi.webp", "The editor home in Hindi")}${cap("<b>हिन्दी.</b> The whole interface, help included. Content keeps its own language.")}</div>
          <div>${browser("d-home-dark.webp", "The editor home in dark mode, deep navy rather than black")}${cap("<b>Dark.</b> Deep navy, never pure black; status colours keep their meaning.")}</div>
        </div>
${bx([
  p(5, `${browser("d-settings.webp", "Settings: language, text size, light or dark, contrast, movement and the helper switch")}`, { tone: "flat", wt: 12 }),
  p(7, `${k("built into the content side")}<div class="ec-table-wrap"><table class="ec-table" style="min-width:0">
      <tbody>
        <tr><td>Text alternatives</td><td>Picture description is required, with a suggestion</td></tr>
        <tr><td>Bilingual content</td><td>Hindi status on every row; one press drafts it</td></tr>
        <tr><td>Current, dated content</td><td>Removal dates; items archive themselves; stale pages flagged</td></tr>
        <tr><td>Accessible documents</td><td>Scanned PDFs without a text layer are flagged</td></tr>
        <tr><td>Meaningful links</td><td>“Click here” and broken links flagged before review</td></tr>
        <tr><td>Ownership</td><td>Every page shows its owner and last update</td></tr>
      </tbody></table></div>${pills(["Keyboard throughout", "Labels for screen readers", "44 px targets", "Text size that reflows", "High contrast", "Reduced motion", "Nothing by colour alone"])}`, { wt: 12 }),
])}
${head2("s-16", "Prototype", "The design system", ["Tokens, type, icons and components, shared by the editor and, through locked tokens, by every website it publishes. Editors fill content; they never choose colours."])}
        <div class="ec-swatches reveal" aria-label="Colour palette">
          <div class="ec-sw ec-sw--tall" style="background:#0056ff"><b>Royal Blue</b><span>#0056FF · actions, focus</span></div>
          <div class="ec-sw" style="background:#2277ff"><b>Azure</b><span>#2277FF</span></div>
          <div class="ec-sw ec-sw--dark-ink" style="background:#e3e7fc"><b>Soft Lavender</b><span>#E3E7FC · tints</span></div>
          <div class="ec-sw" style="background:#4737ff"><b>Vivid Blue</b><span>#4737FF · the helper</span></div>
          <div class="ec-sw ec-sw--dark-ink" style="background:#d1cdff"><b>Pale Blue</b><span>#D1CDFF</span></div>
          <div class="ec-sw ec-sw--tall" style="background:#f75c03;color:#1d0a00"><b>Vivid Orange</b><span>#F75C03 · alerts only</span></div>
          <div class="ec-sw ec-sw--wide" style="background:linear-gradient(160deg,#020a2b,#001a6e 58%,#0046e0 135%)"><b>Midnight Surge</b><span>rail, panels of attention</span></div>
          <div class="ec-sw ec-sw--wide" style="background:linear-gradient(135deg,#0056ff,#2277ff 52%,#8db4ff 120%)"><b>Futurewave</b><span>the one lead card</span></div>
        </div>
${bx([
  p(6, `${k("type")}<div class="ec-type">
      <div class="ec-type-row"><small>Display 48</small><span style="font-size:2.6rem;font-weight:750;letter-spacing:-0.035em;line-height:1.05">Namaste, Sunita</span></div>
      <div class="ec-type-row"><small>Title 26</small><span style="font-size:1.6rem;font-weight:700;letter-spacing:-0.02em">Post an announcement</span></div>
      <div class="ec-type-row"><small>Body 17</small><span style="font-size:1.06rem;line-height:1.5">Body text is 17 px with 1.5 line height, in rem so text size scales the layout.</span></div>
      <div class="ec-type-row"><small>Hindi</small><span class="ec-hi" style="font-size:1.25rem;font-weight:600">आज आप क्या अपडेट करना चाहते हैं?</span></div>
    </div>${s("Plus Jakarta Sans for Latin, Noto Sans Devanagari for Hindi.")}`, { wt: 12 }),
  p(6, `${k("icons · Solar, linear for controls, duotone for tiles")}<div class="ec-icons">${["Megaphone", "CalendarDays", "Presentation", "UserRound", "FileText", "Sparkles", "Languages", "ShieldCheck"].map((n) => `<span class="duo">${duo(n)}</span>`).join("")}${["House", "ListChecks", "Globe", "Paperclip", "Users", "Settings", "Send", "Undo2", "History", "Eye", "ClipboardCheck", "LifeBuoy", "CircleCheck", "Hourglass", "Archive", "TriangleAlert"].map((n) => `<span>${ico(n)}</span>`).join("")}</div>${s("One family, one weight. Every icon sits beside a word.")}`, { wt: 12 }),
  p(12, `<div class="ec-kit">
      <div><p class="ec-kit-k">Status, always word, colour and icon</p><div class="ec-kit-row">${chip("draft", "PencilLine", "Draft")}${chip("review", "Hourglass", "Waiting for review")}${chip("returned", "Undo2", "Sent back")}${chip("approved", "CalendarClock", "Approved")}${chip("live", "CircleCheck", "Live")}${chip("expired", "Archive", "Expired")}<span class="ec-badge-o">1</span></div></div>
      <div><p class="ec-kit-k">Buttons, 44 px, plain verbs</p><div class="ec-kit-row"><span class="ec-btn ec-btn--primary">${ico("Send")}Send to the Coordinator for checking</span><span class="ec-btn ec-btn--secondary">${ico("ListChecks")}Check before sending</span><span class="ec-btn ec-btn--quiet">${ico("Languages")}Make Hindi version</span><span class="ec-btn ec-btn--ghost">${ico("Undo2")}Undo</span></div></div>
      <div><p class="ec-kit-k">Field states</p><div class="ec-kit-row" style="align-items:start">
        <div class="ec-field ec-field--focus"><label>Title</label><small>Say what it is in a few words</small><span class="ec-input">Winter internship 2026</span></div>
        <div class="ec-field ec-field--ai"><label>Category</label><small>Readers use this to find it</small><span class="ec-input">Internships</span><em>Filled by the helper · Looks right?</em></div>
        <div class="ec-field ec-field--error"><label>Remove from the website on</label><small>After this date it archives itself</small><span class="ec-input">05-11-2026</span><em>This date has already passed.</em></div>
        <div class="ec-field ec-field--note"><label>Last date to apply</label><small>Shown as Last date soon in the final week</small><em>Note from the Coordinator: it is 15 November.</em><span class="ec-input">15-11-2026</span></div>
      </div></div>
    </div>`, { tone: "paper" }),
  p(5, `${k("motion")}<div class="ec-spring"><svg viewBox="0 0 240 90" aria-hidden="true"><path d="M8 82 C 60 82, 70 12, 120 10 S 200 10, 232 10" fill="none" stroke="#8db0ff" stroke-width="3" stroke-linecap="round"/><path d="M8 82 C 50 82, 60 -2, 105 6 S 150 24, 175 12 S 215 8, 232 10" fill="none" stroke="rgba(247,92,3,0.6)" stroke-width="2" stroke-dasharray="4 5" stroke-linecap="round"/></svg></div>${t("Springs that settle, never bounce")}${s("Solid line: the critically damped spring used everywhere, about 0.4 s for panels and 0.28 s for small changes. Dashed: the bounce it avoids. Sheets leave the way they came; reduced motion becomes a fade.")}`, { wt: 12 }),
  p(7, `${k("tokens")}${pills(["Colour: surfaces, ink, Royal Blue, six status pairs", "Helper: Vivid Blue line and tint", "Attention: orange dot only", "Radius 12 / 16 / 24 / 28", "Space on a 4 px grid, in rem", "Light, dark and high contrast", "Text size 100 / 112.5 / 125 %"])}${s("Every value lives in one tokens file. The websites inherit them locked: editors can show or hide parts of a card, never restyle it.")}`, { tone: "blue", wt: 12 }),
])}
${head2("s-17", "Test", "What to measure", ["The case study’s evidence will be a before-and-after test: the same three tasks, the same kind of users, Chakra against Easy CMS. These are design targets to validate, not results."])}
        <div class="ec-metrics reveal">
          ${[
            ["Task success", "9 in 10", "Three core tasks completed unaided"],
            ["Time on task", "½ of Chakra", "Median, stopwatch per task"],
            ["Errors reaching live", "≈ 0", "Wrong or missing details after the pre-review check"],
            ["Help requests", "≤ 1", "Times the participant asks the moderator, per session"],
            ["Ease", "SUS 80+", "One question per task, SUS at the end"],
            ["Memorability", "Same success", "Repeat one task after two weeks, no refresher"],
            ["Handover", "Every new editor", "A first real update in the first session"],
          ].map(([a, b, c]) => `<div class="ec-metric"><small>${e(a)}</small><b>${e(b)}</b><span>${e(c)}</span></div>`).join("")}
        </div>
${bx([
  p(6, `${ib("Users")}${k("round 1")}${t("Figma flows with 3 editors")}${s("Paper and Figma versions of the notice, event and faculty tasks, to fix the words and the order of fields.")}`, { wt: 12 }),
  p(6, `${ib("Monitor")}${k("round 2")}${t("The coded prototype with 5 editors and 2 reviewers")}${s("Against the Chakra baseline from the research plan, on office PCs and reviewers’ phones.")}`, { tone: "blue", wt: 12 }),
])}
${head2("s-18", "Test", "Where it stands, and next", ["A working prototype with sample content. What it is honest about:"])}
${bx([
  p(4, `${k("built")}${pills(["Five content types", "Live preview, computer and phone", "Review loop with notes", "Version history and restore", "Helper: fill, translate, check, alt text", "Hindi and English", "Website setup and access", "Text size, contrast, dark, motion"])}`, { tone: "lav", wt: 12 }),
  p(4, `${k("not yet")}${pills(["Real file storage", "Real translation and model calls (scripted for the demo)", "Block and template library", "Photo crop with focal point", "Single sign-on", "Chakra integration"])}`, { wt: 12 }),
  p(4, `${k("next")}${t("Run the research, then test")}${s("Chakra baseline with five or six admin staff, Round 1 in Figma, Round 2 on the prototype. Then a pilot with one centre, with the Computer Centre’s blessing.")}`, { tone: "orange", wt: 12 }),
])}

      </div>
    </section>

    <section class="section case-next">
      <div class="wrap">
        <p class="eyebrow">Next project</p>
        <a class="next-project" href="paraga-mitra.html">
          <div class="next-project-media">
            <img src="../assets/parag/card.jpg" alt="Paraga Mitra title card" width="1600" height="1000" loading="lazy" decoding="async" />
          </div>
          <div class="next-project-body">
            <h2 class="display next-project-title">Paraga Mitra</h2>
            <p class="next-project-desc">
              Pollination as a service for India&rsquo;s farmers and migratory beekeepers:
              a service blueprint, the system under it, and both apps.
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
fs.writeFileSync(SITE + "/projects/easy-cms.html", html);
console.log("wrote projects/easy-cms.html", Math.round(html.length / 1024) + " KB");
