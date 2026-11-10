// Low to high fidelity, the Paraga Mitra way: one rail per screen, sketch → wireframe(s) → final,
// a red flag where the review found a problem, numbered steps that say what changed.
// Then the heuristics and principles, pinned on the real screens.
const e = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "’");

/* ---------- sketch and wireframe parts ---------- */
const sk = {
  line: (t, w = 70) => `<span class="kqfi-sk-line" style="width:${w}%">${e(t)}</span>`,
  box: (inner, cls = "") => `<span class="kqfi-sk-box${cls ? " " + cls : ""}">${inner}</span>`,
  t: (t) => `<span class="kqfi-sk-t">${e(t)}</span>`,
  big: (t) => `<span class="kqfi-sk-big">${e(t)}</span>`,
  bars: (pattern) => `<span class="kqfi-sk-bars">${pattern.split("").map((c) => `<i class="${c === "-" ? "is-low" : c === "^" ? "is-up" : ""}"></i>`).join("")}</span>`,
  btn: (t) => `<span class="kqfi-sk-btn">${e(t)}</span>`,
  note: (t) => `<span class="kqfi-sk-note">${e(t)}</span>`,
  pill: (t) => `<span class="kqfi-sk-pill">${e(t)}</span>`,
};
const wf = {
  bar: () => `<span class="kqfi-wf-bar"></span>`,
  l: (w, cls = "") => `<i class="kqfi-wf-l${cls ? " " + cls : ""}" style="width:${w}%"></i>`,
  chips: (n) => `<span class="kqfi-wf-chips">${"<i></i>".repeat(n)}</span>`,
  circles: (n) => `<span class="kqfi-wf-circles">${"<i></i>".repeat(n)}</span>`,
  box: (inner, cls = "") => `<span class="kqfi-wf-box${cls ? " " + cls : ""}">${inner}</span>`,
  hist: () => `<span class="kqfi-wf-hist">${"aab--cccccccccccccccc".split("").map((c) => `<i class="${c === "-" ? "is-low" : c === "b" ? "is-mid" : ""}"></i>`).join("")}</span>`,
  gauge: () => `<span class="kqfi-wf-gauge"></span>`,
  pills: (a, b) => `<span class="kqfi-wf-pills"><i class="is-dark">${e(a)}</i>${b ? `<i>${e(b)}</i>` : ""}</span>`,
  link: (a, b) => `<span class="kqfi-wf-pills"><i class="is-dark">${e(a)}</i><b>${e(b)}</b></span>`,
  list: (n) => `<span class="kqfi-wf-list">${"<i></i>".repeat(n)}</span>`,
  cta: (t) => `<span class="kqfi-wf-cta">${e(t)}</span>`,
  flag: (t) => `<span class="kqfi-wf-flag">${e(t)}</span>`,
  alert: () => `<span class="kqfi-wf-alert"></span>`,
  island: (t) => `<span class="kqfi-wf-island">${e(t)}</span>`,
};

/** One step: a phone holding a sketch, a wireframe, or the final capture. */
function step(n, label, body, caption, opts = {}) {
  const phone = opts.img ? `<div class="kqfi-shot">${opts.img}</div>` : `<div class="kqfi-phone${opts.sketch ? " is-sketch" : ""}" aria-hidden="true">${body}</div>`;
  return `<figure class="kqfi-step">${phone}<figcaption><b><i>${n}</i>${e(label)}</b><span>${e(caption)}</span>${opts.changed ? `<em>changed after the review</em>` : ""}</figcaption></figure>`;
}
const arrow = `<span class="kqfi-arrow" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></span>`;
const rail = (title, path, steps) =>
  `<section class="kqfi-rail" aria-label="${e(title)}, ${e(path)}"><header class="kqfi-head"><b>${e(title)}</b><span>${e(path)}</span></header><div class="kqfi-row">${steps.join(arrow)}</div></section>`;

function fidelity(img) {
  const home = rail("The card on Home", "sketch → wireframe v1 → wireframe v2 → final", [
    step(
      1,
      "Sketch",
      sk.line("Hi Arjun", 45) +
        sk.box(sk.t("rent 1 Nov") + sk.big("short ₹1,0__") + sk.bars("aaa--cccccccc"), "is-tall") +
        sk.btn("FIX IT") +
        sk.note("show the cost? or just the fix?"),
      "Paper. What Arjun needs first: is he short, by how much, and one way out.",
      { sketch: true },
    ),
    step(
      2,
      "Wireframe v1",
      wf.bar() + wf.chips(4) + wf.l(55, "is-h") + wf.l(90) + wf.circles(4) + wf.box(wf.l(70) + wf.gauge() + wf.hist() + wf.pills("See 3 ways", "Fix now"), "is-card") + wf.flag("Too much"),
      "Everything at once: a gauge, a 30-day chart, two buttons, four quick actions. One fact, said five ways.",
      { changed: true },
    ),
    step(
      3,
      "Wireframe v2",
      wf.bar() + wf.chips(4) + wf.l(55, "is-h") + wf.l(60) + wf.box(wf.l(85) + wf.l(70) + wf.l(55, "is-soft") + wf.link("Fix now", "Other ways ›"), "is-card") + wf.list(3),
      "One sentence, what the fix does, one button. The chart moved a tap deeper, to the bank’s home.",
    ),
    step(4, "Final", "", "In code: Fix now in Konkan lavender, the other ways as a quiet link.", {
      img: img("gap-home.webp", "Final Home: Konkan, one thing to sort. Rent leaves 1 Nov, ₹1,059 short for 2 days. Move ₹1,500 from your savings pot, no fee. Fix now, Other ways."),
    }),
  ]);

  const compare = rail("Ways to cover rent", "sketch → wireframe → final", [
    step(
      1,
      "Sketch",
      sk.line("Ways to cover rent", 80) + sk.big("₹590 if you do nothing!!") + sk.box(sk.t("○ move from savings")) + sk.box(sk.t("○ pay on the 3rd")) + sk.box(sk.t("○ call someone")) + sk.note("too scary?"),
      "The cost of doing nothing was the headline. It read like a threat.",
      { sketch: true },
    ),
    step(
      2,
      "Wireframe",
      wf.bar() + wf.l(70, "is-h") + wf.box(wf.alert() + wf.l(40, "is-big") + wf.l(80), "is-hero") + wf.l(50, "is-soft") + wf.box(wf.l(75) + wf.l(50, "is-soft"), "is-opt is-on") + wf.box(wf.l(65), "is-opt") + wf.box(wf.l(55), "is-opt") + wf.cta("Review the move") + wf.flag("Fear first"),
      "₹590 as the biggest number on screen, with an alarm icon, then a heading that repeated the title.",
      { changed: true },
    ),
    step(3, "Final", "", "One line for the cost, then the ways out. The no-fee move is picked, and the amount can change.", {
      img: img("gap-compare.webp", "Final Ways to cover rent: you’re ₹1,059 short on 1 Nov; if rent bounces it costs about ₹590. Move ₹1,500 from your savings pot, selected; pay rent on 3 Nov; talk to a person."),
    }),
  ]);

  const live = rail("Rent day, outside the app", "sketch → wireframe → final", [
    step(
      1,
      "Sketch",
      sk.pill("RENT TOMORROW!!") + sk.box(sk.t("Khatiq · 7:00") + sk.t("₹1,059 short, fix now")) + sk.box(sk.t("Khatiq · 9:00") + sk.t("still short!")) + sk.box(sk.t("Khatiq · 9:45") + sk.t("last chance")) + sk.note("amounts on the lock screen??"),
      "First idea: a push alert every few hours. Noisy, and the amount was there for anyone nearby.",
      { sketch: true },
    ),
    step(
      2,
      "Wireframe",
      wf.island("Rent  ·  Short") + wf.l(40, "is-mid") + wf.l(70, "is-clock") + wf.box(wf.l(50, "is-soft") + wf.l(60, "is-redact") + wf.l(40, "is-soft") + wf.cta("Fix now"), "is-lock"),
      "One Live Activity for the day: compact in the Island, one button when it’s needed, amounts hidden.",
    ),
    step(3, "Final", "", "Starts when the autopay is queued, ends when the landlord is paid.", {
      img: img("live-lock.webp", "Final Lock Screen on 1 Nov: Khatiq, rent day. Rent needs a look. Autopay at 10:00. Fix now."),
    }),
  ]);

  return `<div class="kqfi reveal">${home}${compare}${live}</div>`;
}

/* ---------- heuristics and principles, pinned on the screens ---------- */
/** pins: [y%, kind ("H5" heuristic number, or a principle), title, line] */
function pinned(file, alt, title, pins, img) {
  // notes on the left, grouped under two small headers; the screen on the right.
  // A script draws a dotted line from the end of each name to its spot, with a dot at both ends.
  const group = (label, list) =>
    list.length
      ? `<p class="kqan-k">${label}</p><ul class="kqan-list">${list
          .map(([y, , name, line]) => `<li data-y="${y}"><p><b>${e(name)}</b><span>${e(line)}</span></p></li>`)
          .join("")}</ul>`
      : "";
  const principles = pins.filter(([, kind]) => !kind.startsWith("H"));
  const heuristics = pins.filter(([, kind]) => kind.startsWith("H"));
  return `<article class="kqan-card">
    <div class="kqan-text">
      <h4 class="kqan-title">${e(title)}</h4>
      ${group("Design principles", principles)}
      ${group("Heuristics", heuristics)}
    </div>
    <div class="kqan-shot">${img(file, alt)}</div>
    <svg class="kqan-arrows" aria-hidden="true"></svg>
  </article>`;
}

function heuristics(img) {
  const cards = [
    pinned(
      "gap-home.webp",
      "Home annotated: the card's parts and the principle behind each",
      "The card on Home",
      [
        [41.7, "Principle", "Warn early", "Three days before rent leaves, not after it bounces."],
        [46.5, "H2", "Match the real world", "Rent, a date and rupees. No NACH, no mandate."],
        [50.9, "H6", "Recognition over recall", "It says what Fix now will do before you tap."],
        [55.8, "Principle", "One fact, once", "One button for the quick path, a quiet link for choice."],
      ],
      img,
    ),
    pinned(
      "gap-confirm.webp",
      "Confirm, annotated",
      "Confirm the move",
      [
        [19, "H5", "Error prevention", "The question repeats the amount and the direction."],
        [35, "H1", "Visibility of status", "Your new balance and lowest point, before money moves."],
        [56, "Principle", "Say it plainly", "From, to, when, fee. Nothing hidden in fine print."],
        [71.5, "H3", "User control and freedom", "You can move it back at any time."],
      ],
      img,
    ),
    pinned(
      "gap-why.webp",
      "Why you’re seeing this, annotated",
      "Why am I seeing this?",
      [
        [32, "H10", "Help and documentation", "One tap explains the warning in a sentence."],
        [53, "Principle", "Transparency", "Exactly what it looked at to reach the number."],
        [62.6, "Principle", "Privacy by default", "And what it never uses: location, contacts, what you buy."],
        [91, "Principle", "A person is one tap away", "From the card, the sheet and every error."],
      ],
      img,
    ),
    pinned(
      "gap-error.webp",
      "Couldn’t move the money, annotated",
      "When the move fails",
      [
        [24.4, "H9", "Recover from errors", "What happened, and that another way still works."],
        [43.8, "H2", "Match the real world", "Why: a ₹44,200 payment left the pot a moment ago."],
        [53.8, "H3", "User control and freedom", "The no-fee alternative, or a person, right there."],
      ],
      img,
    ),
    pinned(
      "live-lock.webp",
      "Lock Screen Live Activity, annotated",
      "Rent day on the Lock Screen",
      [
        [72, "H1", "Visibility of status", "Rent day, live, without opening the app."],
        [75.7, "Principle", "Privacy by default", "No amount until you choose to show it."],
        [83, "Principle", "One fact, once", "One button, and only while there’s something to fix."],
      ],
      img,
    ),
  ];
  const rows = [
    ["1", "Visibility of system status", "The Live Activity’s steps: queued, debited, paid. A move shows named steps and a time, never a spinner."],
    ["2", "Match between the app and the real world", "“Rent leaves 1 Nov” instead of “NACH mandate”. Rupees in lakh grouping. Bank words, explained."],
    ["3", "User control and freedom", "Move it back to savings. Keep rent on 1 Nov. Talk to a person from any card."],
    ["4", "Consistency and standards", "One button style, one chart language, each colour one meaning, familiar tab bar and lists."],
    ["5", "Error prevention", "Confirm shows the result first. A passkey above ₹25,000. Pay warns if it would leave rent short."],
    ["6", "Recognition rather than recall", "The card says what Fix now does. The next three dates sit on Home."],
    ["7", "Flexibility and efficiency", "Fix now for the quick path, other ways for choice. The watch and Lock Screen act without opening the app."],
    ["8", "Aesthetic and minimalist design", "Each fact once. No gauge, no rings, no decoration on the ending."],
    ["9", "Recognise, diagnose and recover from errors", "“Couldn’t move the money. Another way still works.” A wrong PIN says how many tries are left."],
    ["10", "Help and documentation", "“Why am I seeing this?” on the card. Seth’s answers name their sources."],
  ];
  return `<div class="kqan reveal">${cards.join("")}</div><script>
(function () {
  var n = 0;
  function draw(card) {
    var svg = card.querySelector(".kqan-arrows");
    var img = card.querySelector(".kqan-shot img");
    if (!svg || !img || !img.naturalWidth) return;
    var c = card.getBoundingClientRect();
    var s = img.getBoundingClientRect();
    if (!c.width || !s.width) return;
    var id = card.dataset.ah || (card.dataset.ah = "kqan-ah-" + ++n);
    var out = '<defs><marker id="' + id + '" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>';
    card.querySelectorAll(".kqan-list li").forEach(function (li) {
      var b = li.querySelector("b").getBoundingClientRect();
      var l = li.getBoundingClientRect();
      var sx = b.right - c.left + 10;
      var sy = b.top + b.height / 2 - c.top;
      var ex = s.left - c.left + s.width * 0.085;
      var ey = s.top - c.top + (s.height * parseFloat(li.dataset.y)) / 100;
      var cx = l.right - c.left + 8;
      var mx = (ex - cx) * 0.55;
      out += '<circle cx="' + sx + '" cy="' + sy + '" r="3.5" fill="currentColor"/><circle cx="' + ex + '" cy="' + ey + '" r="3.5" fill="currentColor"/>';
      out += '<path d="M' + sx + "," + sy + " H" + cx + " C" + (cx + mx) + "," + sy + " " + (ex - mx) + "," + ey + " " + ex + "," + ey + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="0.1 6"/>';
    });
    svg.setAttribute("viewBox", "0 0 " + c.width + " " + c.height);
    svg.innerHTML = out;
  }
  function all() { document.querySelectorAll(".kqan-card").forEach(draw); }
  document.querySelectorAll(".kqan-shot img").forEach(function (i) { i.addEventListener("load", all); });
  if ("ResizeObserver" in window) { var ro = new ResizeObserver(all); document.querySelectorAll(".kqan-card").forEach(function (c) { ro.observe(c); }); }
  window.addEventListener("load", all);
  window.addEventListener("resize", all);
  all();
})();
</script>
        <div class="kq-panel kq-table-wrap reveal"><table class="kq-table kqan-table">
          <caption class="sr-only">Nielsen’s usability heuristics and where each shows up in Khatiq</caption>
          <thead><tr><th scope="col">Heuristic</th><th scope="col">Where it shows up in Khatiq</th></tr></thead>
          <tbody>${rows.map(([n, h, w]) => `<tr><td>${e(h)}</td><td>${e(w)}</td></tr>`).join("")}</tbody>
        </table></div>`;
}

module.exports = { fidelity, heuristics };
