// Builds projects/easy-cms.html, the Easy CMS case study.
// Shell (nav, footer, theme toggle) is lifted from paraga-mitra.html so the two pages stay in step.
// Screens: assets/easycms/*.webp and the mockups (mock-*.jpg), made by tools/easycms/capture.js.
// Diagrams: tools/easycms/infographics.js. Live prototype: prototypes/easy-cms (npm run build:portfolio
// in "Actual Portfolio/CMS builder"). Icons: Solar (480 Design, CC BY 4.0) via allsvgicons.com.
// Edit this file, not the HTML.
const fs = require("fs");
const path = require("path");
const ig = require("./infographics.js");
const SITE = path.resolve(__dirname, "../..");
const A = "../assets/easycms/";
const src = fs.readFileSync(SITE + "/projects/paraga-mitra.html", "utf8");
const solar = JSON.parse(fs.readFileSync(__dirname + "/solar.json", "utf8"));
// The assistant's faces come from the prototype's own drawing code, so the page can never drift from the app.
const { faceSvg } = require(path.resolve(SITE, "../CMS builder/src/components/assistantFace.ts"));
// [mood, name, when it appears in the prototype]
const MOODS_CS = [
  ["idle", "Ready", "Waiting in the top bar"],
  ["happy", "Hello", "Greets you; nothing waiting"],
  ["thinking", "Thinking", "A short beat before each answer"],
  ["listening", "Listening", "Asks for your message"],
  ["smart", "Smart", "Explains how, or what fails GIGW"],
  ["idea", "Bright idea", "Drafted a notice from your text"],
  ["celebrating", "Celebrating", "Nothing to fix"],
  ["surprised", "Surprised", "Something leaves the site this week"],
  ["sweaty", "Sweaty", "Something was sent back to you"],
  ["sorry", "Sorry", "Could not find it in your text"],
];

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
  .replace('<link rel="stylesheet" href="../styles.css" />', '<link rel="stylesheet" href="../styles.css" />\n  <link rel="stylesheet" href="../assets/easycms/easycms.css" />\n  <link rel="stylesheet" href="../assets/easycms/easycms-v2.css" />');
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
// Section head: the title on the left, the phase as ghost text on the right (no pill, no new typeface).
const head2 = (id, phase, title, intro) => `
        <div class="plate-head ec-head" id="${id}">
          <h2 class="display section-title">${e(title)}</h2>
          <p class="ghost ec-ghost" aria-hidden="true">${e(phase)}</p>
          ${intro ? `<div class="section-intro"><p>${e(intro)}</p></div>` : ""}
        </div>`;
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
const fig = (inner, caption, cls = "") => `<figure class="ec-ig${cls ? " " + cls : ""} reveal">${inner}${caption ? `<figcaption>${caption}</figcaption>` : ""}</figure>`;
// A 1-5 scale drawn as dots, for proto-persona traits.
const scale = (label, n, note) => `<div class="ec-scale"><span class="ec-scale-k">${e(label)}</span><span class="ec-dots" role="img" aria-label="${n} out of 5">${[1, 2, 3, 4, 5].map((i) => `<i${i <= n ? ' class="on"' : ""}></i>`).join("")}</span><span class="ec-scale-n">${e(note)}</span></div>`;

// ---------- design system: the real components ----------
// Every image is cropped from the running prototype by capture.js (group "kit"): from #/kit for loose
// components, and from live screens for stateful ones. Shown at their real size, never larger.
const comp = (file, name, rule, alt, cls = "") => {
  const [w, h] = size(file);
  return `<figure class="ec-comp${cls ? " " + cls : ""}"><div class="ec-comp-img"><img src="${A}${file}" alt="${e(alt)}" width="${w / 2}" height="${h / 2}" loading="lazy" decoding="async" /></div><figcaption><b>${e(name)}</b> ${e(rule)}</figcaption></figure>`;
};
const components = () => `
        <div class="ec-comps reveal" aria-label="Components">
          <p class="ec-kit-k">Components · cropped from the working prototype, at real size</p>
          ${comp("k-buttons.webp", "Buttons", "44 px tall, and the label names the result. One primary per screen; amber only when the AI acts.", "Buttons: Send to the Coordinator for checking (primary), Check before sending (secondary), Save draft (ghost), Make Hindi version (amber AI), Use an example message (quiet), Discard draft (danger), a row of small buttons, a disabled Send and an icon-only arrow", "ec-comp--full")}
          ${comp("k-actionbar.webp", "Action bar", "Pinned under the form: saved state, undo and history on the left, the next step on the right.", "The editor's action bar: Saved, undo, history, Save draft, Check before sending and Send to the Coordinator for checking", "ec-comp--full")}
          <div class="ec-comp-pair">
            ${comp("k-status.webp", "Status chips", "A word, a colour and an icon together, so status never depends on colour alone.", "Status chips in two sizes: Draft, Waiting for review, Sent back, Approved, Live and Expired")}
            ${comp("k-tabs.webp", "Tabs and badges", "Counts read as badges: blue for a total, orange when you are needed, outlined at zero.", "Tabs with count badges, All 17, Drafts 1, Sent back 1 in orange, Waiting for review 1, Expiring soon 2 in orange and Expired 0 outlined; language and preview-size toggles; orange navigation badges")}
          </div>
          <div class="ec-comp-flow">
            ${comp("k-field-ai.webp", "Filled by the helper", "Dashed amber until a person presses Looks right.", "A title field filled by the helper with a dashed amber border and Looks right and Clear buttons")}
            ${comp("k-field-hindi.webp", "Machine-translated Hindi", "Labelled until someone has read it.", "The Hindi title field with a machine-translated title, labelled as such, and an I checked it button")}
            ${comp("k-field-note.webp", "Note from the reviewer", "The note sits on the field it is about.", "A date field with the Coordinator's note above it explaining the correct last date")}
            ${comp("k-file.webp", "File field", "Drop or choose. A picture also needs a description.", "The attachment field showing a PDF with Replace and Remove buttons")}
            ${comp("k-controls.webp", "Settings controls", "A switch for on and off, a stepper for text size, a slider for contrast.", "Light and dark switches, Reduce movement and Helper switches, a text-size stepper with minus and plus, and a contrast slider set to More")}
            ${comp("k-helper.webp", "Helper card", "Paste a message; it fills the form and says what it could not find.", "The helper card with a pasted call for applications and the result: fields filled by the helper, each marked")}
            ${comp("k-check.webp", "Check before sending", "Plain words, each with a Go there link to the field.", "The check panel listing what to confirm before sending, each with Go there")}
            ${comp("k-assistant.webp", "Assistant", "Its own amber. Each reply shows the face it was said in, after a short thinking beat.", "The assistant button and suggestion chips, a question bubble, a thinking face with typing dots, and a surprised face with a reply listing an item that leaves the site soon")}
            ${comp("k-dialog.webp", "Dialog", "The only blocking surface, and the only place with a scrim.", "A dialog: Send with these notes? listing a machine-translated Hindi title, with Fix them first and Send anyway")}
            ${comp("k-toast.webp", "Toast", "Says what happened, in the person's terms.", "A dark toast confirming the update was sent to the Coordinator")}
            ${comp("k-people.webp", "People and empty states", "Initials only where a photo would be; an empty state says what will appear.", "Three initial avatars and an empty state reading Nothing is waiting for you")}
            ${comp("k-health.webp", "Website health", "GIGW checks as a short to-do list, each with a count and Fix.", "The website health panel with counts for missing Hindi versions, scanned PDFs and stale pages, each with Fix")}
            ${comp("k-rail.webp", "Navigation rail", "Midnight Surge, one white active pill, an orange badge for what came back.", "The navigation rail: Easy CMS logo, the website being updated, Home active, My updates with an orange badge, Website, Files, Team and Settings", "ec-comp--narrow")}
          </div>
          ${comp("k-tasks.webp", "Task cards", "The most used job leads in Futurewave; the rest are named in the users' own words.", "Home task cards: Post an announcement or circular as the large blue lead card, then Add an event, Add a workshop, Change people details and Change page text", "ec-comp--full")}
          ${comp("k-table.webp", "Updates table", "Status, Hindi version, owner and last change on every row.", "The My updates table with tabs and rows showing status chips, Hindi version and last changed", "ec-comp--full")}
        </div>`;

// ---------- page ----------
// Hero collage: [file, width, height, alt, position class]
const HERO = [
  ["mock-angled.jpg", 1472, 1962, "An angled monitor showing the Easy CMS home: Namaste, Ashish, five task cards with Post an announcement first, and the counts of drafts, waiting and live items", "angled"],
  ["mock-desk.jpg", 2400, 1800, "Someone at a desk working in Easy CMS: the editor with a helper-filled announcement on the left and the live preview of the centre's Announcements page on the right", "desk"],
  ["mock-phone.jpg", 1600, 1600, "A hand holding a phone with the reviewer's screen: a round table notice waiting for review, with Send back with a note and Approve and publish", "phone"],
  ["mock-appicon.jpg", 1600, 1600, "Close-up of a phone's home screen with the Easy CMS app icon, a frosted tile and a pencil over a tilted blue tile, with an orange badge showing 2", "icon"],
];

const JOURNEY = [
  ["Empathise", "#s-01", "Read a live site before asking anyone", "Audit, stakeholders, proto-personas, a research plan"],
  ["Define", "#s-05", "Low digital literacy, not low literacy", "Other teams’ findings, eight principles"],
  ["Ideate", "#s-07", "Nothing goes public without a person", "Brainstorm, roles, workflow, helper limits"],
  ["Prototype", "#s-11", "Build it working, not just drawn", "A live prototype, setup, editor, review, system"],
  ["Test", "#s-20", "Same tasks, Chakra against Easy CMS", "Targets, two rounds, what is next"],
];

const main = `<main id="top">
    <section class="section case-head" id="ec-top">
      <div class="wrap">
        <a class="case-back" href="../index.html#work"><span aria-hidden="true">&larr;</span> All projects</a>

        <!-- Hero: every mockup composed into one scene with the title, before the case study begins. -->
        <div class="ec-hero reveal">
          <div class="ec-hero-glow" aria-hidden="true"></div>
          <div class="ec-hero-text">
            <div class="ec-hero-titles">
              <p class="eyebrow">Product design &middot; Enterprise workflow &middot; Inclusive UI</p>
              <h1 class="display case-title"><img class="ec-hero-logo" src="${A}logo.svg" alt="" width="40" height="40" />Easy CMS</h1>
            </div>
            <div class="ec-hero-copy">
            <p class="case-sub">A simpler way to update a heavy-information website, for institute staff who never learned HTML</p>
            <ul class="ec-hero-facts">
              <li>${ico("Users")}<span><b>For</b> admin staff at IIT Roorkee</span></li>
              <li>${ico("Globe")}<span><b>Demo</b> AMRUT Centre website</span></li>
              <li>${ico("Code")}<span><b>Built</b> a working prototype</span></li>
            </ul>
            <div class="ec-hero-cta">
              <a class="ec-hero-btn" href="#s-11">Try the prototype ${ico("ArrowRight")}</a>
              <a class="ec-hero-link" href="#ec-journey-h">Read the journey</a>
            </div>
            </div>
          </div>
          <div class="ec-collage" role="group" aria-label="Easy CMS mockups. Select one to see it full size.">
            ${HERO.map(([f, w, h, alt, cls]) => `<figure class="ec-col ec-col--${cls}"><img src="${A}${f}" alt="${e(alt)}" width="${w}" height="${h}" decoding="async" /></figure>`).join("\n            ")}
            <span class="ec-float ec-float--ai" aria-hidden="true"><img src="${A}assistant.svg" alt="" width="22" height="22" />Helper filled 5 fields</span>
            <span class="ec-float ec-float--alert" aria-hidden="true"><i></i>Last date soon</span>
            <span class="ec-float ec-float--live" aria-hidden="true"><b>Live</b>Approved by the Coordinator</span>
          </div>
        </div>

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

        <nav class="ec-journey reveal" aria-labelledby="ec-journey-h">
          <div class="ec-journey-head">
            <h2 class="ec-journey-title" id="ec-journey-h">The design and decision journey</h2>
            <p class="ec-journey-tools">FigJam &middot; Figma &middot; React, Vite, TypeScript &middot; Motion</p>
          </div>
          <ol class="ec-journey-line">
            ${JOURNEY.map(([phase, href, decision, what], i) => `<li>
              <a href="${href}">
                <span class="ec-j-node" aria-hidden="true">${i + 1}</span>
                <span class="ec-j-phase">${e(phase)}</span>
                <span class="ec-j-decision">${e(decision)}</span>
                <span class="ec-j-what">${e(what)}</span>
              </a>
            </li>`).join("")}
          </ol>
          <p class="ec-journey-loop">${ico("RotateCcw")} Test results go back to Define before anything ships.</p>
        </nav>
${head2("s-01", "Empathise", "The problem", "Chakra accepts only HTML. I have done this job myself and could not hand it over: every update came back to one desk.")}
        <div class="ec-split reveal">
          ${fig(ig.problemLoop(), "Today’s loop, from a message to a fix. The mistake is found by a reader, after it is public.")}
          <dl class="ec-bignums">
            <div><dt>1</dt><dd>format Chakra accepts in content fields: <b>HTML</b></dd></div>
            <div><dt>5</dt><dd>kinds of update make up most of the work</dd></div>
            <div><dt>88</dt><dd>mandatory guidelines in <b>GIGW 3.0</b></dd></div>
            <div><dt>0</dt><dd>previews or reviews before an update is live</dd></div>
          </dl>
        </div>
${head2("s-02", "Empathise", "What a live site shows", "Before any interview, I mapped the public menu of one centre’s website. The slips hand-written HTML invites are visible from outside.")}
        <div class="ec-split ec-split--wide reveal">
          <div class="ec-scroll">${fig(ig.sitemap(), "", "ec-ig--flush")}</div>
          <div class="ec-flags">
            <p class="ec-flags-k"><span class="ec-dot-org" aria-hidden="true"></span>Seen on the live site</p>
            <div class="ec-flag-item"><b>Labels and links out of step</b><code class="ec-url">About Us → …/<mark>About MoHUA.html</mark><br>About IITR → …/<mark>About CUPCB.html</mark></code></div>
            <div class="ec-flag-item"><b>Spaces inside web addresses</b><code class="ec-url">…/Capacity Building<mark>&nbsp;</mark>/Faculty<mark>&nbsp;</mark>.html</code></div>
            <div class="ec-flag-item ec-flag-item--idea"><b>Most pages are lists</b><span>Announcements, lectures, workshops and people repeat the same shapes: they can be forms and cards, not free HTML.</span></div>
          </div>
        </div>
${head2("s-03", "Empathise", "Who it touches", "From the people who press the buttons to the rules every government site must follow.")}
        <div class="ec-scroll ec-scroll--narrow">${fig(ig.stakeholders(), "Stakeholder map. Editors and reviewers use it every week; the Computer Centre, faculty and a new hand-over editor work with it; students, applicants and city officials read it; GIGW, MoHUA, NIC and the Hindi Cell set the rules.", "ec-ig--center")}</div>
        <div class="ec-personas reveal" aria-label="Proto-personas">
          <p class="ec-personas-k">Proto-personas · assumptions the interviews will test</p>
          ${[
            ["The office assistant", "Editor", "Post today’s circular before the office closes, without calling anyone.", [["Word, email, WhatsApp", 5, "fluent"], ["HTML", 0, "none"], ["Updates", 4, "most days"], ["Device", 2, "office PC"]]],
            ["The faculty coordinator", "Reviewer", "See it as readers will, then approve or say what to fix in one line.", [["Time to check", 1, "between classes"], ["On a phone", 5, "mostly"], ["Updates", 2, "checks, never writes"], ["Patience for tools", 1, "very little"]]],
            ["The new hand-over editor", "Editor, first week", "Finish a real update in the first session, and remember how in three weeks.", [["Training", 0, "none"], ["Confidence", 1, "low"], ["Updates", 1, "now and then"], ["Memorability", 5, "what matters"]]],
          ].map(([name, role, goal, traits]) => `<article class="ec-persona">
            <p class="ec-persona-role">${e(role)}</p>
            <h3>${e(name)}</h3>
            <p class="ec-persona-goal">${e(goal)}</p>
            ${traits.map(([l, n, note]) => scale(l, n, note)).join("")}
          </article>`).join("")}
        </div>
${head2("s-04", "Empathise", "The research plan", "Planned, not yet run: watch five or six admin staff do real updates in Chakra, then test Easy CMS on the same three tasks.")}
        <div class="ec-plan reveal">
          <div class="ec-bubbles" role="img" aria-label="Participants per method: 2 to 3 stakeholder talks, 5 to 6 contextual inquiries, 2 to 3 reviewer interviews, and a 3-task Chakra baseline">
            ${[["3", "stakeholder talks", "Computer Centre, HoDs", 0.55], ["6", "contextual inquiries", "editors at their desks", 1], ["3", "reviewer interviews", "how they check today", 0.55], ["3", "baseline tasks", "timed in Chakra", 0.55]].map(([n, l, s2, sc]) => `<div class="ec-bubble" style="--s:${sc}"><b>${n}</b><span>${e(l)}</span><small>${e(s2)}</small></div>`).join("")}
          </div>
          <ol class="ec-tasks">
            <li>${duo("FileText")}<b>Post a circular</b><span>with a PDF</span></li>
            <li>${duo("Presentation")}<b>Add a workshop</b><span>date, venue, poster, link</span></li>
            <li>${duo("UserRound")}<b>Change a faculty profile</b><span>designation and photo</span></li>
          </ol>
          <ul class="ec-hyps" aria-label="Hypotheses to test">
            ${[["Notebook", "Book", "Staff keep cheat sheets of HTML"], ["Paste", "TextSq", "Pasting from Word breaks pages"], ["Too late", "Eye", "Readers find the errors"], ["Off-tool", "Chat", "Review happens on WhatsApp"], ["Stale", "Archive", "Old notices never come down"], ["Jargon", "Languages", "English-only words cause hesitation"]].map(([kk, icon, h]) => `<li>${ico(icon)}<span><b>${e(kk)}</b>${e(h)}</span><em>to test</em></li>`).join("")}
          </ul>
        </div>
${head2("s-05", "Define", "What other teams found", "The problem is common across government and university sites. Tools solve hosting and compliance; nobody solved the editing.")}
        <ol class="ec-findings reveal">
          ${[
            ["Updates wait in an IT queue", "Owners publish, with review", "DoT", "https://dot.gov.in/sites/default/files/2014%2007%2003%20Minutes%20of%20DOT%20Website%20Meeting.pdf?download=1"],
            ["No owner, so pages go stale", "Owner and date on every page", "EasyContent", "https://easycontent.io/resources/managing-multi-department-content-on-government-websites/"],
            ["Hard tools, untrained teams", "Teaching is the product", "Ad Hoc", "https://cdn.adhoc.team/website-modernization"],
            ["GIGW asks for creator help", "Checks inside the editor", "GIGW 3.0", "https://guidelines.india.gov.in/?p=10063"],
            ["S3WaaS solves hosting", "Be the editing layer", "NIC", "https://egovernance.vikaspedia.in/viewcontent/e-governance/digital-india/s3waas-for-government-department-websites?lgn=en"],
            ["Draft ≠ live is the top pain", "Preview is the real page", "Drupal", "https://groups.drupal.org/node/277458"],
            ["Infrequent editors forget", "Design for memorability", "Leicester", "https://ucm.le.ac.uk/?p=162"],
            ["Literacy is not one group", "Low digital literacy, not low literacy", "CHI 2009", "https://www.dgp.toronto.edu/public_user/ravin/papers/chi2009_literacy.pdf"],
          ].map(([a, b, srcName, href]) => `<li><span class="ec-f-a">${e(a)}</span><span class="ec-f-arrow" aria-hidden="true"></span><span class="ec-f-b">${e(b)}</span><a class="ec-f-src" href="${href}" target="_blank" rel="noopener">${e(srcName)}<span class="sr-only"> (opens a source)</span></a></li>`).join("")}
        </ol>
${head2("s-06", "Define", "Principles", "Apple’s design principles, turned into rules for a nervous, infrequent editor.")}
        ${fig(ig.wheel(), "", "ec-ig--center ec-ig--wheel")}
${head2("s-07", "Ideate", "Brainstorm", "Six directions from one idea. Filled ideas are in the prototype; dashed ones are parked for later.")}
        <div class="ec-scroll reveal">${fig(ig.mindmap(), "", "ec-ig--flush ec-ig--mind")}</div>
        <p class="ec-legend reveal"><span class="ec-lg-on"></span>In the prototype <span class="ec-lg-off"></span>Parked</p>
${head2("s-08", "Ideate", "Roles and places", "Editors see six places, one level deep. Reviewers and the Computer Centre each see only their one job.")}
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
${head2("s-09", "Ideate", "The publishing workflow", "Every update shows its state in words, colour and an icon. Only a reviewer’s approval makes it public.")}
        <div class="ec-flow reveal" aria-label="Publishing workflow">
          <div class="ec-state">${chip("draft", "PencilLine", "Draft")}<b>The editor works</b><span>Saves as they type.</span></div>
          <div class="ec-state">${chip("review", "Hourglass", "Waiting for review")}<b>Sent for checking</b><span>The form locks.</span></div>
          <div class="ec-state">${chip("returned", "Undo2", "Sent back")}<b>One-line note</b><span>Beside the field it is about.</span></div>
          <div class="ec-state">${chip("live", "CircleCheck", "Live")}<b>Approved, published</b><span>Owner and date in the footer.</span></div>
          <div class="ec-state">${chip("expired", "Archive", "Expired")}<b>Leaves on its date</b><span>Archives itself.</span></div>
          <div class="ec-loop" aria-hidden="true"><span>fix and send again</span></div>
        </div>
${head2("s-10", "Ideate", "An AI helper, with limits", "It removes typing and checking. It never publishes and never invents a fact.")}
        <div class="ec-gate reveal">
          <ol class="ec-gate-flow">
            <li class="ec-g ec-g--in">${duo("Chat")}<b>Rough text</b><span>email, WhatsApp, circular</span></li>
            <li class="ec-g ec-g--ai">${duo("Sparkles")}<b>Helper suggests</b><span>fields, Hindi, alt text, checks</span></li>
            <li class="ec-g ec-g--gate">${duo("ShieldCheck")}<b>A person confirms</b><span>each marked field</span></li>
            <li class="ec-g ec-g--out">${duo("CircleCheck")}<b>Reviewer approves</b><span>then it is public</span></li>
          </ol>
          <ul class="ec-never" aria-label="What the helper never does">
            ${["Publish on its own", "Invent a date, name or link", "Leave a filled field unmarked", "Read staff records or other pages", "Stay on when switched off"].map((x) => `<li>${e(x)}</li>`).join("")}
          </ul>
        </div>
${head2("s-11", "Prototype", "Try the prototype", "The working prototype, live on this page. Switch roles, post an update, approve it, then open the website to see it published.")}
        <div class="ec-live reveal">
          <div class="ec-live-bar" role="group" aria-label="Start the prototype as">
            ${[["editor", "Editor", "PenLine"], ["reviewer", "Reviewer", "ClipboardCheck"], ["admin", "Computer Centre, new installation", "ShieldCheck"]].map(([r, l, icon], i) => `<button type="button" class="ec-live-role" data-role="${r}"${i ? "" : ' aria-pressed="true"'}${i ? ' aria-pressed="false"' : ""}>${ico(icon)}${e(l)}</button>`).join("")}
            <a class="ec-live-open" href="../prototypes/easy-cms/index.html#/home" target="_blank" rel="noopener">${ico("ExternalLink")}Open full screen<span class="sr-only"> (new tab)</span></a>
          </div>
          <figure class="ec-browser ec-live-frame">
            <div class="ec-browser-bar" aria-hidden="true"><i></i><i></i><i></i><span>easycms.iitr.ac.in</span></div>
            <iframe src="../prototypes/easy-cms/index.html#/home" title="Easy CMS prototype" loading="lazy"></iframe>
          </figure>
          <p class="ec-cap">Runs in your browser with sample content. Changes stay on this device; switching role starts the demo again.</p>
        </div>
${head2("s-12", "Prototype", "Setting up a website", "On a new installation, no department or centre is registered. The Computer Centre creates the first website in four short steps.")}
        <div class="ec-steps">
${step(1, "Computer Centre", "Nothing registered yet", "The first screen says what is missing and what happens next. Only the Computer Centre sees it.", ["One action on the page", "Editors and reviewers see “not set up yet”"], browser("d-admin-empty.webp", "Easy CMS first-run screen for the Computer Centre: No department or centre has a website here yet, with a Create a new website button and three steps"))}
        </div>
        <div class="ec-wiz reveal" data-gallery="setup">
          <figure>${browser("d-wiz-1-address.webp", "Wizard step 1: unit type, full name, short name, Hindi name and a web address that is cleaned automatically")}${cap("<b>1 · Whose website.</b> Spaces and capitals are cleaned so links never break.")}</figure>
          <figure>${browser("d-wiz-2.webp", "Wizard step 2: tiles for Announcements, Events and lectures, Workshops and training, People and About us, with one switched off")}${cap("<b>2 · Pages.</b> Labels follow the unit: a centre gets Announcements.")}</figure>
          <figure>${browser("d-wiz-3.webp", "Wizard step 3: editor and reviewer names and emails")}${cap("<b>3 · People.</b> One editor and one reviewer to begin.")}</figure>
          <figure>${browser("d-wiz-4.webp", "Wizard step 4: a summary beside a live preview of the new, still empty website")}${cap("<b>4 · Check and create.</b> A first look at the empty site.")}</figure>
        </div>
        <div class="ec-pair reveal" style="margin-top:1.5rem">
          <div>${browser("d-admin-sites.webp", "The Websites list after creation, with the new Centre for Transportation Systems card waiting for its first update")}${cap("The new site waits for its first update.")}</div>
          <div>${browser("d-people.webp", "People screen: who can update which parts of each website, with section toggles per person")}${cap("Access per website and per section. No content here.")}</div>
        </div>
${head2("s-13", "Prototype", "The editor, step by step", "Posting an announcement from a message that arrived on WhatsApp.")}
        <div class="ec-steps">
${step(1, "Home", "What do you want to update?", "Five task cards in the users’ own words, the most used first. Anything sent back waits on the right.", ["Status in words, colour and icon", "Website health from GIGW checks"], browser("d-home.webp", "Editor home: greeting, five task cards with Post an announcement first, a Needs your attention panel with a sent-back item, counts and website health"))}
${step(2, "Helper", "Paste the message", "Most updates already exist as an email or a WhatsApp forward. The editor pastes it instead of retyping.", [], browser("d-editor-paste.webp", "Editor with the Have the message already panel open and an example call for applications pasted in"), callout("ai", "Sparkles", "The helper only copies dates, names and links from the text. It never invents them and never posts anything."))}
${step(3, "Helper", "Every filled field is marked", "Each filled field gets a dashed amber outline and a Looks right button. The preview beside it is the real page.", ["Amber means suggested, not settled", "One click to confirm or clear"], browser("d-editor-filled.webp", "Editor after the helper filled the form: dashed amber fields with Looks right buttons, and the live preview of the centre's Announcements page with the new item highlighted"))}
${step(4, "Check", "It will not send unconfirmed work", "Sending runs the check first. Must-fix items block it; notes like a missing Hindi title can be sent anyway.", ["Plain words, no blame", "Go there jumps to the field"], browser("d-editor-check.webp", "The check panel listing five things to fix: each field the helper filled still needs a person to confirm it"), callout("alert", "TriangleAlert", "Must-fix items block sending. The reviewer sees the same notes."))}
${step(5, "Hindi", "Make Hindi version", "One press drafts the Hindi title. It stays labelled Machine translated until a person ticks I checked it.", ["GIGW asks for both languages", "The label travels to the reviewer"], browser("d-editor-hindi.webp", "The Title in Hindi field with a machine-drafted translation and a Machine translated, check before publishing label"))}
${step(6, "Send", "Send to the Coordinator for checking", "The button names the person. A short dialog lists any notes.", [], browser("d-editor-send-dialog.webp", "Send with these notes dialog listing one note about the machine-translated Hindi title, with Fix them first and Send anyway"))}
${step(7, "My updates", "Where everything stands", "Drafts, sent back, waiting, live and expiring soon. Search by any word in the title.", ["Hindi version shown per row", "Owner and last change on every item"], browser("d-updates-review.webp", "My updates board filtered to Waiting for review, showing the new call for applications and a round table notice"))}
        </div>
${head2("s-14", "Prototype", "Review, mostly on a phone", "What changed, the notes the editor saw, and the page as readers will see it. One tap approves; one line sends it back.")}
        <div class="ec-trio reveal" data-gallery="review">
          <div>${phone("p-review.webp", "Reviewer on a phone: a round table notice waiting for review, with Send back with a note and Approve and publish")}${cap("<b>Decide.</b> Two big buttons.")}</div>
          <div>${phone("p-review-preview.webp", "Reviewer on a phone looking at the phone preview of the announcement")}${cap("<b>Preview.</b> The real page.")}</div>
          <div>${phone("p-site.webp", "The centre's Announcements page on a phone after approval")}${cap("<b>Published.</b> Live at once.")}</div>
        </div>
        <div class="ec-pair reveal" style="margin-top:1.5rem">
          <div>${browser("d-review-detail.webp", "Reviewer desktop view: a What changed panel with the old and new values, beside the preview")}${cap("<b>What changed.</b> Old struck through, new highlighted.")}</div>
          <div>${browser("d-returned-field.webp", "The editor's form with the reviewer's note shown beside the removal date field it refers to")}${cap("<b>Sent back.</b> The note lands beside its field.")}</div>
        </div>
${head2("s-15", "Prototype", "The preview is the real page", "Preview and public site are drawn by the same components from the same data. The centre’s site was redesigned too: blue, purple accents, orange only for alerts.")}
        <div class="ec-mix reveal">
          <div>${browser("d-site-home.webp", "The AMRUT Centre home page: floating menu, a blue hero with a Next up lecture card and an orange Last date soon workshop card, an at-a-glance band with counts, and announcement, event and workshop panels", "iitr.ac.in/centres/amrut-centre-urban-planning", "ec-site")}</div>
          <div>${phone("p-editor-preview.webp", "Editor on a phone switched to the Preview tab, showing the new announcement highlighted on the centre's site")}${cap("Form and preview are two tabs on a phone.")}</div>
        </div>
${head2("s-16", "Prototype", "Help and an assistant, in the same place", "Both sit top right on every screen. Help shows where things are; the assistant answers from the website itself.")}
        <div class="ec-steps">
${step("?", "Help", "Show me, not tell me", "Asked “how do I add a poster?”, help answers in steps and outlines the Poster field.", ["Same place on every screen", "Answers point at real controls"], browser("d-help.webp", "Help panel open beside an event form, answering how to add a poster, with the Poster field outlined on the page"))}
${step("AI", "Assistant", "An assistant that reads before it speaks", "It wears glasses because its job is to read carefully: what was sent back, what leaves the site this week, what fails a GIGW check. Paste a message and it drafts a notice, then hands it to the form for a person to confirm.", ["Answers come from the website’s own data", "Drafts open in the form, never straight to review", "Amber, like every other suggestion"], browser("d-assistant.webp", "The Easy CMS assistant panel open over the home page: an amber face with round glasses, a reply listing what was sent back and the open drafts, and a notice drafted from a pasted message with an Open it in the notice form button"), callout("ai", "ShieldCheck", "It only suggests. A person checks every field, and the Coordinator approves before anything goes live."))}
        </div>
${fig(`<ul class="ec-moods">${MOODS_CS.map(([m, name, when], i) => `<li>${faceSvg(m, "cm" + i, 72)}<b>${e(name)}</b><span>${e(when)}</span></li>`).join("")}</ul>`, "<b>Moods.</b> Like a cartoon, only the eyes, the brows and one small extra change, so it is always the same character. Each reply carries the face it was said in; the header shows the latest.", "ec-moods-fig")}
${head2("s-17", "Prototype", "Accessibility and GIGW", "The interface aims for WCAG 2.1 AA; what it publishes is GIGW-ready by default.")}
        <div class="ec-pair reveal">
          <div>${browser("d-home-hi.webp", "The editor home in Hindi")}${cap("<b>हिन्दी.</b> The whole interface, help included.")}</div>
          <div>${browser("d-home-dark.webp", "The editor home in dark mode, deep navy rather than black")}${cap("<b>Dark.</b> Deep navy; status colours keep their meaning.")}</div>
        </div>
        <ul class="ec-checks reveal" aria-label="Accessibility and GIGW checks">
          ${[["Image", "Picture descriptions required"], ["Languages", "Hindi status on every item"], ["CalendarClock", "Removal dates, auto archive"], ["FileWarning", "Scanned PDFs flagged"], ["Paperclip", "Vague and broken links flagged"], ["UserRound", "Owner and date on every page"], ["Keyboard", "Keyboard throughout"], ["Eye", "High contrast and dark"], ["TextSq", "Text size that reflows"], ["Smartphone", "44 px touch targets"], ["RotateCcw", "Reduced motion"], ["Palette", "Never colour alone"]].map(([icon, l]) => `<li>${ico(solar.linear[icon] ? icon : "CircleCheck")}<span>${e(l)}</span></li>`).join("")}
        </ul>
${head2("s-18", "Prototype", "The design system", "Tokens, type, icons and components, shared by the editor and, locked, by every website it publishes.")}
        <div class="ec-swatches reveal" aria-label="Colour palette">
          <div class="ec-sw ec-sw--wide" style="background:#0056ff"><b>Royal Blue</b><span>#0056FF · actions, focus</span></div>
          <div class="ec-sw" style="background:#2277ff;color:#000"><b>Azure</b><span>#2277FF · hover, links</span></div>
          <div class="ec-sw ec-sw--dark-ink" style="background:#e3e7fc"><b>Soft Lavender</b><span>#E3E7FC · tints</span></div>
          <div class="ec-sw" style="background:#4737ff"><b>Vivid Blue</b><span>#4737FF · waiting for review</span></div>
          <div class="ec-sw ec-sw--dark-ink" style="background:#ddf5ea;color:#0d4a31"><b>Mint</b><span>#DDF5EA · live</span></div>
          <div class="ec-sw ec-sw--dark-ink" style="background:linear-gradient(135deg,#ffd84d,#ffb020);color:#2a1800"><b>Sunlit Amber</b><span>#FFC233 · the helper and assistant</span></div>
          <div class="ec-sw" style="background:#f75c03;color:#1d0a00"><b>Vivid Orange</b><span>#F75C03 · alerts only</span></div>
          <div class="ec-sw ec-sw--wide" style="background:linear-gradient(160deg,#020a2b,#001a6e 58%,#0046e0 135%)"><b>Midnight Surge</b><span>rail, panels of attention</span></div>
          <div class="ec-sw ec-sw--wide ec-sw--pill" style="background:linear-gradient(90deg,#0056ff 0%,#2277ff 55%,#8db4ff 100%)"><b>Futurewave</b><span>the one lead card</span></div>
        </div>
        <div class="ec-marks reveal" aria-label="Identity">
          <figure><img src="${A}logo.svg" alt="The Easy CMS logo: a frosted tile with a white pencil over a tilted blue tile, and a small amber spark" width="96" height="96" /><figcaption><b>Logo</b> A frosted page over a tilted one: an edit about to land.</figcaption></figure>
          <figure><img src="${A}app-icon.svg" alt="The Easy CMS app icon: the two tiles on a Royal Blue squircle" width="96" height="96" /><figcaption><b>App icon</b> The same tiles on Royal Blue for the home screen.</figcaption></figure>
          <figure><img src="${A}assistant.svg" alt="The assistant's face: an amber squircle wearing round glasses, with glowing eyes behind dark lenses" width="96" height="96" /><figcaption><b>Assistant</b> Glasses because it reads before it answers.</figcaption></figure>
        </div>
        <div class="ec-ds reveal">
          <div class="ec-ds-type">
            <p class="ec-kit-k">Type</p>
            <div class="ec-type">
              <div class="ec-type-row"><small>Display 48</small><span style="font-size:2.6rem;font-weight:750;letter-spacing:-0.035em;line-height:1.05">Namaste, Ashish</span></div>
              <div class="ec-type-row"><small>Heading 36</small><span style="font-size:2.1rem;font-weight:750;letter-spacing:-0.025em;line-height:1.1">My updates</span></div>
              <div class="ec-type-row"><small>Title 26</small><span style="font-size:1.6rem;font-weight:700;letter-spacing:-0.02em">Post an announcement</span></div>
              <div class="ec-type-row"><small>Body 17</small><span style="font-size:1.06rem;line-height:1.5">17 px at 1.5 line height, in rem, so text size scales the layout.</span></div>
              <div class="ec-type-row"><small>Small 13</small><span style="font-size:0.81rem;line-height:1.45">Hints under each field: Say what it is in a few words.</span></div>
              <div class="ec-type-row"><small>Hindi</small><span class="ec-hi" style="font-size:1.25rem;font-weight:600">आज आप क्या अपडेट करना चाहते हैं?</span></div>
            </div>
          </div>
          <div class="ec-ds-icons">
            <p class="ec-kit-k">Icons · Solar, duotone for tiles, linear for controls</p>
            <div class="ec-icons">${["Megaphone", "CalendarDays", "Presentation", "UserRound", "FileText", "Sparkles", "Languages", "ShieldCheck"].map((n) => `<span class="duo">${duo(n)}</span>`).join("")}${["House", "ListChecks", "Globe", "Paperclip", "Users", "Settings", "Send", "Undo2", "History", "Eye", "ClipboardCheck", "LifeBuoy", "CircleCheck", "Hourglass", "Archive", "TriangleAlert"].map((n) => `<span>${ico(n)}</span>`).join("")}</div>
          </div>
          <div class="ec-ds-motion">
            <p class="ec-kit-k">Motion</p>
            <svg viewBox="0 0 240 90" aria-hidden="true" class="ec-spring-svg"><path d="M8 82 C 60 82, 70 12, 120 10 S 200 10, 232 10" fill="none" class="spring-on" stroke-width="3" stroke-linecap="round"/><path d="M8 82 C 50 82, 60 -2, 105 6 S 150 24, 175 12 S 215 8, 232 10" fill="none" class="spring-off" stroke-width="2" stroke-dasharray="4 5" stroke-linecap="round"/></svg>
            <p class="ec-ds-note"><b>Springs that settle, never bounce.</b> Solid: the critically damped spring, 0.4 s for panels. Dashed: the bounce it avoids.</p>
          </div>
        </div>
${components()}
${head2("s-19", "Test", "What to measure", "Before and after: the same three tasks, the same kind of users, Chakra against Easy CMS. Targets to validate, not results.")}
        <div class="ec-metrics reveal">
          ${[
            ["Task success", "9/10", "tasks done unaided", 90],
            ["Time on task", "½", "of the Chakra time", 50],
            ["Errors reaching live", "≈ 0", "after the pre-review check", 4],
            ["Help requests", "≤ 1", "per session", 20],
            ["Ease", "80+", "SUS score", 80],
            ["Memorability", "=", "same success after two weeks", 90],
            ["Handover", "100%", "new editors finish a first update", 100],
          ].map(([a, b, c, pct]) => `<div class="ec-metric"><small>${e(a)}</small><b>${e(b)}</b><span>${e(c)}</span><i class="ec-meter" style="--p:${pct}%" aria-hidden="true"></i></div>`).join("")}
        </div>
        <ol class="ec-rounds reveal">
          <li><b>Round 1</b><span>Figma flows · 3 editors · fix the words and field order</span></li>
          <li><b>Round 2</b><span>Coded prototype · 5 editors and 2 reviewers · against the Chakra baseline</span></li>
        </ol>
${head2("s-20", "Test", "Where it stands, and next", "")}
        <div class="ec-status reveal">
          <div class="ec-status-col ec-status-col--done"><p class="ec-kit-k">${ico("CircleCheck")} Built</p><ul>${["Five content types", "Live preview, computer and phone", "Review loop with notes", "Version history", "Helper: fill, translate, check, describe", "Hindi and English", "Website setup and access", "Size, contrast, dark, motion"].map((x) => `<li>${e(x)}</li>`).join("")}</ul></div>
          <div class="ec-status-col"><p class="ec-kit-k">${ico("Hourglass")} Not yet</p><ul>${["Real file storage", "Real translation and model calls", "Block and template library", "Photo crop with focal point", "Single sign-on", "Chakra integration"].map((x) => `<li>${e(x)}</li>`).join("")}</ul></div>
          <div class="ec-status-col ec-status-col--next"><p class="ec-kit-k">${ico("ArrowRight")} Next</p><p class="ec-next-big">Run the Chakra baseline, test twice, then pilot with one centre.</p></div>
        </div>

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
