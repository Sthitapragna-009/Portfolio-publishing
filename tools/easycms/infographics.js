// SVG infographics for the Easy CMS case study. Each function returns markup; colours come from
// classes styled in assets/easycms/easycms.css, so every diagram follows the light and dark themes.
// Geometry is computed here, so labels and content stay in one place.

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "’");
const rad = (deg) => (deg * Math.PI) / 180;
// Angle 0 = top, clockwise.
const pol = (cx, cy, r, deg) => [cx + r * Math.sin(rad(deg)), cy - r * Math.cos(rad(deg))];
const f = (n) => Math.round(n * 10) / 10;
const use = (id, x, y, s, cls = "") => `<use href="#${id}" x="${f(x - s / 2)}" y="${f(y - s / 2)}" width="${s}" height="${s}"${cls ? ` class="${cls}"` : ""}/>`;

/* Text that sits outside a ring: anchored away from the centre so it never crosses the ring. */
function outsideLabel(x, y, cx, lines, cls, size, lh = 1.25) {
  const anchor = Math.abs(x - cx) < 30 ? "middle" : x > cx ? "start" : "end";
  return `<text x="${f(x)}" y="${f(y)}" text-anchor="${anchor}" class="${cls}" font-size="${size}">${lines
    .map((l, i) => `<tspan x="${f(x)}" dy="${i ? size * lh : 0}">${esc(l)}</tspan>`).join("")}</text>`;
}

/* ---------------------------------------------------------------------------------------------
   1. Today's update loop: six steps around one person. */
function problemLoop() {
  const W = 640, cx = 320, cy = 320, R = 214;
  const steps = [
    ["Chat", ["A message arrives", "on WhatsApp or email"]],
    ["Code", ["One person rewrites", "it as HTML"]],
    ["Globe", ["It goes live at once,", "with no preview"]],
    ["Eye", ["A reader spots", "the mistake"], "alert"],
    ["Phone2", ["A phone call", "asks for a fix"]],
    ["PencilLine", ["The same person", "fixes it again"]],
  ];
  let out = `<svg class="ig ig-loop" viewBox="-170 0 ${W + 340} ${W}" role="img" aria-labelledby="ig-loop-t">
  <title id="ig-loop-t">Today's update loop: a message arrives, one person rewrites it as HTML, it goes live with no preview, a reader spots the mistake, a phone call asks for a fix, and the same person fixes it again.</title>
  <circle cx="${cx}" cy="${cy}" r="${R}" class="ln ln-dash" fill="none"/>`;
  // arrowheads half-way between nodes, pointing clockwise
  steps.forEach((_, i) => {
    const a = i * 60 + 30;
    const [x, y] = pol(cx, cy, R, a);
    out += `<g transform="translate(${f(x)} ${f(y)}) rotate(${a})"><path d="M-7 -6 L4 0 L-7 6" class="arrow" fill="none"/></g>`;
  });
  steps.forEach(([icon, lines, tone], i) => {
    const a = i * 60;
    const [x, y] = pol(cx, cy, R, a);
    out += `<circle cx="${f(x)}" cy="${f(y)}" r="34" class="${tone === "alert" ? "node-alert" : i === 0 ? "node-acc" : "node"}"/>`;
    out += use(`i-${icon}`, x, y, 28, tone === "alert" || i === 0 ? "ico-on" : "ico");
    const [lx, ly] = pol(cx, cy, R + 56, a);
    out += outsideLabel(lx, ly - (a === 0 ? 14 : a === 180 ? -6 : 8), cx, lines, tone === "alert" ? "t-org" : "t-ink", 17);
  });
  out += `<text x="${cx}" y="${cy - 6}" text-anchor="middle" class="t-ink t-big" font-size="44">1 person</text>
  <text x="${cx}" y="${cy + 26}" text-anchor="middle" class="t-dim" font-size="18">for every update</text></svg>`;
  return out;
}

/* ---------------------------------------------------------------------------------------------
   2. The centre's live menu as a radial map: 6 groups, 32 pages, slips marked in orange. */
const SITEMAP = [
  ["About Us", ["About IITR", "About DAP", "About MoHUA", "Partners & MoUs", "About CUPCB", "Themes"], { "About IITR": "opens About CUPCB.html" }, "opens About MoHUA.html"],
  ["Projects", ["Action research", "Consultancy", "Punjab GIS master plan", "Upcoming", "Completed"]],
  ["Events", ["Workshops & training", "Student engagement", "Symposiums", "Special lectures", "Round tables"]],
  ["Announcements", ["Newsletter", "Stakeholder engagement", "News", "Staff", "Interns", "Advisory"]],
  ["People", ["Faculty", "Non-teaching staff", "Research staff"], { Faculty: "file name: Faculty .html" }],
  ["Repository", ["Infrastructure", "Proceedings", "Minutes", "Documented cases", "Photo gallery", "Related links", "Funding support"]],
];
function sitemap() {
  const W = 1000, cx = 500, cy = 500, Rg = 205, Rl = 330;
  const total = SITEMAP.reduce((n, g) => n + g[1].length, 0);
  const gap = 4; // degrees between groups
  const per = (360 - gap * SITEMAP.length) / total;
  let a0 = -per * SITEMAP[0][1].length / 2; // centre the first group on the top
  let lines = "", nodes = "", labels = "";
  SITEMAP.forEach(([name, leaves, flags = {}, groupFlag]) => {
    const span = per * leaves.length;
    const mid = a0 + span / 2;
    const [gx, gy] = pol(cx, cy, Rg, mid);
    const [cxl, cyl] = pol(cx, cy, 92, mid);
    lines += `<line x1="${f(cxl)}" y1="${f(cyl)}" x2="${f(gx)}" y2="${f(gy)}" class="ln"/>`;
    leaves.forEach((leaf, i) => {
      const a = a0 + per * (i + 0.5);
      const [lx, ly] = pol(cx, cy, Rl, a);
      const flag = flags[leaf];
      lines += `<path d="M${f(gx)} ${f(gy)} Q${f(pol(cx, cy, (Rg + Rl) / 2, a)[0])} ${f(pol(cx, cy, (Rg + Rl) / 2, a)[1])} ${f(lx)} ${f(ly)}" class="ln${flag ? " ln-org" : ""}" fill="none"/>`;
      nodes += `<circle cx="${f(lx)}" cy="${f(ly)}" r="${flag ? 8 : 5.5}" class="${flag ? "dot-org" : "dot"}"/>`;
      // radial label, flipped on the left half so it always reads left to right
      const norm = ((a % 360) + 360) % 360;
      const left = norm > 180;
      const [tx, ty] = pol(cx, cy, Rl + 16, a);
      const rot = left ? norm + 90 : norm - 90;
      labels += `<text x="${f(tx)}" y="${f(ty)}" transform="rotate(${f(rot)} ${f(tx)} ${f(ty)})" text-anchor="${left ? "end" : "start"}" dominant-baseline="middle" font-size="17" class="${flag ? "t-org t-b" : "t-dim"}">${esc(leaf)}</text>`;
    });
    nodes += `<circle cx="${f(gx)}" cy="${f(gy)}" r="46" class="${groupFlag ? "node-alert-ring" : "node-acc"}"/>
      <text x="${f(gx)}" y="${f(gy - 4)}" text-anchor="middle" font-size="15.5" class="t-on t-b">${esc(name.length > 11 ? name.slice(0, 8) + "…" : name)}</text>
      <text x="${f(gx)}" y="${f(gy + 16)}" text-anchor="middle" font-size="14" class="t-on-dim">${leaves.length} pages</text>`;
    if (groupFlag) {
      const [fx, fy] = pol(cx, cy, Rg - 70, mid);
      labels += `<text x="${f(fx)}" y="${f(fy)}" text-anchor="middle" font-size="15" class="t-org t-b">${esc(groupFlag)}</text>`;
    }
    a0 += span + gap;
  });
  return `<svg class="ig ig-sitemap" viewBox="-90 -90 1180 1180" role="img" aria-labelledby="ig-map-t">
  <title id="ig-map-t">The centre's live menu: six groups and ${total} pages. Orange marks slips seen on the live site: the About Us menu opens About MoHUA.html, About IITR opens About CUPCB.html, and the Faculty page's file name contains a space.</title>
  ${lines}<circle cx="${cx}" cy="${cy}" r="92" class="node-hub"/>
  <text x="${cx}" y="${cy - 8}" text-anchor="middle" font-size="22" class="t-on t-b">ACUPCB</text>
  <text x="${cx}" y="${cy + 18}" text-anchor="middle" font-size="16" class="t-on-dim">website menu</text>
  ${nodes}${labels}</svg>`;
}

/* ---------------------------------------------------------------------------------------------
   3. Stakeholder map: who touches a website update, from the centre outwards. */
function stakeholders() {
  const W = 1000, cx = 500, cy = 500;
  const rings = [
    { r: 120, name: "Use it every week", cls: "node-acc", items: [["Editor", "office staff", 250], ["Reviewer", "coordinator or HoD", 70]] },
    { r: 230, name: "Work with it", cls: "node-vio", items: [["Computer Centre", "gives access", 95], ["New editor", "takes the duty over", 155], ["Faculty", "own the content", 215], ["Centre office", "sends the circulars", 310]] },
    { r: 340, name: "Read it", cls: "node-ink", items: [["Students", "", 45], ["Applicants", "jobs, internships", 125], ["City officials", "ULB trainees", 160], ["Researchers", "and peers", 220], ["The public", "", 275], ["Partners", "MoUs, institutes", 325]] },
    { r: 440, name: "Set the rules", cls: "node-faint", items: [["GIGW 3.0", "88 guidelines", 0], ["MoHUA", "AMRUT 2.0", 72], ["NIC S3WaaS", "government sites", 144], ["Hindi Cell", "both languages", 216], ["IMG, IITR", "site templates", 288]] },
  ];
  let out = `<svg class="ig ig-stake" viewBox="0 0 ${W} ${W}" role="img" aria-labelledby="ig-stake-t">
  <title id="ig-stake-t">Stakeholder map. At the centre, a website update. Inner ring, using it every week: the editor and the reviewer. Next, working with it: the Computer Centre, a new editor, faculty and the centre office. Then reading it: students, applicants, city officials, researchers, the public and partners. Outer ring, setting the rules: GIGW 3.0, MoHUA, NIC S3WaaS, the Hindi Cell and IMG.</title>`;
  rings.slice().reverse().forEach((ring, i) => {
    out += `<circle cx="${cx}" cy="${cy}" r="${ring.r}" class="${i % 2 ? "ring-b" : "ring-a"}"/>`;
  });
  rings.forEach((ring) => {
    out += `<text x="${cx}" y="${cy - ring.r + 22}" text-anchor="middle" font-size="14" class="t-faint t-caps">${esc(ring.name)}</text>`;
  });
  out += `<circle cx="${cx}" cy="${cy}" r="62" class="node-hub"/>
  <text x="${cx}" y="${cy - 4}" text-anchor="middle" font-size="18" class="t-on t-b">A website</text>
  <text x="${cx}" y="${cy + 18}" text-anchor="middle" font-size="18" class="t-on t-b">update</text>`;
  rings.forEach((ring, ri) => {
    ring.items.forEach(([name, sub, a]) => {
      const [x, y] = pol(cx, cy, ring.r, a);
      const big = ri === 0;
      out += `<circle cx="${f(x)}" cy="${f(y)}" r="${big ? 15 : 10}" class="${ring.cls}"/>`;
      const [lx, ly] = pol(cx, cy, ring.r + (big ? 30 : 22), a);
      const anchor = Math.abs(lx - cx) < 40 ? "middle" : lx > cx ? "start" : "end";
      const dy = Math.abs(lx - cx) < 40 ? (ly < cy ? -10 : 18) : 0;
      out += `<text x="${f(lx)}" y="${f(ly + dy)}" text-anchor="${anchor}" font-size="${big ? 21 : 17}" class="t-ink t-b">${esc(name)}</text>`;
      if (sub) out += `<text x="${f(lx)}" y="${f(ly + dy + (big ? 21 : 18))}" text-anchor="${anchor}" font-size="${big ? 16 : 14}" class="t-dim">${esc(sub)}</text>`;
    });
  });
  return out + `</svg>`;
}

/* ---------------------------------------------------------------------------------------------
   4. Principle wheel: eight of Apple's principles around the feeling they add up to. */
const PRINCIPLES = [
  ["Purpose", "Five jobs, done perfectly"],
  ["Familiarity", "Forms and files they know"],
  ["Simplicity", "One task, plain verbs"],
  ["Forgiveness", "Nothing public without a person"],
  ["Responsibility", "Helper suggests, person decides"],
  ["Flexibility", "Hindi, text size, contrast, phone"],
  ["Craft", "Calm, nothing jumps"],
  ["Delight", "I did it, and it is right"],
];
function wheel() {
  const W = 1000, cx = 500, cy = 500, r0 = 150, r1 = 300;
  const n = PRINCIPLES.length, step = 360 / n;
  let out = `<svg class="ig ig-wheel" viewBox="-60 0 1120 1000" role="img" aria-labelledby="ig-wheel-t">
  <title id="ig-wheel-t">Design principles around one feeling, calm confidence: ${PRINCIPLES.map(([a, b]) => `${a}, ${b}`).join("; ")}.</title>`;
  PRINCIPLES.forEach(([name, rule], i) => {
    const a1 = i * step - step / 2 + 1.2, a2 = (i + 1) * step - step / 2 - 1.2;
    const [x1, y1] = pol(cx, cy, r1, a1), [x2, y2] = pol(cx, cy, r1, a2);
    const [x3, y3] = pol(cx, cy, r0, a2), [x4, y4] = pol(cx, cy, r0, a1);
    out += `<path d="M${f(x1)} ${f(y1)} A${r1} ${r1} 0 0 1 ${f(x2)} ${f(y2)} L${f(x3)} ${f(y3)} A${r0} ${r0} 0 0 0 ${f(x4)} ${f(y4)} Z" class="${i % 2 ? "seg-b" : "seg-a"}"/>`;
    const a = i * step;
    const [nx, ny] = pol(cx, cy, (r0 + r1) / 2, a);
    out += `<text x="${f(nx)}" y="${f(ny - 6)}" text-anchor="middle" font-size="15" class="t-on-dim t-mono">0${i + 1}</text>
      <text x="${f(nx)}" y="${f(ny + 16)}" text-anchor="middle" font-size="${name.length > 12 ? 17 : 20}" class="t-on t-b">${esc(name)}</text>`;
    const [lx, ly] = pol(cx, cy, r1 + 34, a);
    const words = rule.split(" ");
    const half = Math.ceil(words.length / 2);
    const lines = words.length > 3 ? [words.slice(0, half).join(" "), words.slice(half).join(" ")] : [rule];
    out += outsideLabel(lx, ly + (a === 0 ? -22 : a === 180 ? 10 : -4), cx, lines, "t-ink", 19);
  });
  out += `<circle cx="${cx}" cy="${cy}" r="${r0 - 14}" class="node-hub"/>
  <text x="${cx}" y="${cy - 8}" text-anchor="middle" font-size="27" class="t-on t-b">Calm</text>
  <text x="${cx}" y="${cy + 24}" text-anchor="middle" font-size="27" class="t-on t-b">confidence</text></svg>`;
  return out;
}

/* ---------------------------------------------------------------------------------------------
   5. Brainstorm mind map: six directions from one idea. Filled = in the prototype, dashed = parked. */
const MIND = [
  ["Input", 300, [["Paste a message", 1], ["Attach like WhatsApp", 1], ["Speak it", 0], ["Scan a printed circular", 0]]],
  ["Trust", 0, [["True preview", 1], ["Review before live", 1], ["Version history", 1], ["Autosave", 1]]],
  ["Language", 60, [["Hindi interface", 1], ["Machine-translated label", 1], ["Plain verbs", 1]]],
  ["Rules", 120, [["GIGW checks", 1], ["Picture descriptions", 1], ["Removal dates", 1], ["Free page builder", 0]]],
  ["Handover", 180, [["Show me help", 1], ["Guided first task", 1], ["Video tutorials", 0]]],
  ["Admin", 240, [["Website setup wizard", 1], ["Access per section", 1], ["Theme editor", 0]]],
];
function mindmap() {
  const W = 1240, H = 860, cx = 620, cy = 430;
  let links = "", nodes = "";
  MIND.forEach(([name, a, leaves]) => {
    const [bx, by] = [cx + 300 * Math.sin(rad(a)), cy - 235 * Math.cos(rad(a))];
    links += `<path d="M${cx} ${cy} C${f(cx + (bx - cx) * 0.5)} ${cy} ${f(cx + (bx - cx) * 0.5)} ${f(by)} ${f(bx)} ${f(by)}" class="ln-strong" fill="none"/>`;
    const right = bx >= cx - 5;
    const vertical = Math.abs(bx - cx) < 10;
    nodes += `<rect x="${f(bx - 62)}" y="${f(by - 22)}" width="124" height="44" rx="22" class="node-acc"/>
      <text x="${f(bx)}" y="${f(by + 6)}" text-anchor="middle" font-size="18" class="t-on t-b">${esc(name)}</text>`;
    leaves.forEach(([leaf, chosen], i) => {
      const n = leaves.length;
      let lx, ly, toRight;
      if (vertical) {
        // Top and bottom branches split their ideas to both sides, rows growing away from the centre.
        toRight = i % 2 === 1;
        const row = Math.floor(i / 2);
        lx = bx + (toRight ? 1 : -1) * 120;
        ly = by + (a === 0 ? -1 : 1) * row * 50;
      } else {
        toRight = right;
        lx = bx + (right ? 1 : -1) * 120;
        ly = by + (i - (n - 1) / 2) * 50;
      }
      const w = leaf.length * 9.4 + 30;
      const x0 = toRight ? lx : lx - w;
      const ax = toRight ? x0 : x0 + w;
      const sx = bx + (toRight ? 62 : -62);
      links += `<path d="M${f(sx)} ${f(by)} C${f((sx + ax) / 2)} ${f(by)} ${f((sx + ax) / 2)} ${f(ly)} ${f(ax)} ${f(ly)}" class="ln" fill="none"/>`;
      nodes += `<rect x="${f(x0)}" y="${f(ly - 18)}" width="${f(w)}" height="36" rx="18" class="${chosen ? "pill-on" : "pill-off"}"/>
        <text x="${f(x0 + w / 2)}" y="${f(ly + 6)}" text-anchor="middle" font-size="16" class="${chosen ? "t-ink" : "t-faint"}">${esc(leaf)}</text>`;
    });
  });
  return `<svg class="ig ig-mind" viewBox="-50 105 ${W + 100} 650" role="img" aria-labelledby="ig-mind-t">
  <title id="ig-mind-t">Brainstorm around one idea, updating feels like filling a form. ${MIND.map(([n, , l]) => `${n}: ${l.map(([x, c]) => x + (c ? "" : " (parked)")).join(", ")}`).join(". ")}.</title>
  ${links}<rect x="${cx - 150}" y="${cy - 46}" width="300" height="92" rx="46" class="node-hub"/>
  <text x="${cx}" y="${cy - 6}" text-anchor="middle" font-size="21" class="t-on t-b">Updating feels like</text>
  <text x="${cx}" y="${cy + 22}" text-anchor="middle" font-size="21" class="t-on t-b">filling a form</text>
  ${nodes}</svg>`;
}

module.exports = { problemLoop, sitemap, stakeholders, wheel, mindmap, SITEMAP, PRINCIPLES, MIND };
