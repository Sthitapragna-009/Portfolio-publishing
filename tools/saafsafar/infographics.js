// SVG infographics for the Saaf Safar case study. Each function returns markup; colours come from
// classes in assets/saafsafar/*.css, so every diagram follows the light and dark themes.
// Pictograms are the app's own (symbols #p-<name>, from tools/saafsafar/pictos.json).

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "’");
const f = (n) => Math.round(n * 10) / 10;
const rad = (deg) => (deg * Math.PI) / 180;
const pol = (cx, cy, r, deg) => [cx + r * Math.sin(rad(deg)), cy - r * Math.cos(rad(deg))];
const pic = (name, x, y, s, cls = "ico") => `<use href="#p-${name}" x="${f(x - s / 2)}" y="${f(y - s / 2)}" width="${s}" height="${s}" class="${cls}"/>`;
const lines = (x, y, arr, cls, size, anchor = "start", lh = 1.25) =>
  `<text x="${f(x)}" y="${f(y)}" text-anchor="${anchor}" class="${cls}" font-size="${size}">${arr.map((l, i) => `<tspan x="${f(x)}" dy="${i ? size * lh : 0}">${esc(l)}</tspan>`).join("")}</text>`;

/* 1. One incident, before and after: where the minutes go. Estimates from the brief. */
function incident(sim) {
  const rows = [
    ["Today", "schedule-driven, estimate", [["gap", 34, "Nobody knows yet"], ["tell", 6, "Radio"], ["go", 12, "Store, walk"], ["work", 4, "Refill"]]],
    ["With Saaf Safar", "estimate", [["tell", 3, "Alert, accept"], ["go", 5, "Walk"], ["work", 4, "Refill"]]],
    ["Simulated week", `median of ${sim.n.toLocaleString("en-IN")} tasks`, [["tell", sim.accept, "Offer to accept"], ["go", sim.travel, "Walk, store"], ["work", sim.clean, "Clean"]]],
  ];
  const W = 1000, L = 210, scale = (W - L - 70) / 60, rowH = 54, gap = 40;
  const H = rows.length * (rowH + gap) + 40;
  let out = `<svg class="ig ss-ig-incident" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="ig-inc-t">
  <title id="ig-inc-t">Minutes in one incident. Today, estimated: 34 minutes before anyone knows, 6 for the radio, 12 for the store and walk, 4 to refill, 56 in all. With Saaf Safar, estimated: 3 to alert and accept, 5 to walk, 4 to refill, 12 in all. Simulated week, median: ${Math.round(sim.accept + sim.travel + sim.clean)} minutes.</title>`;
  [0, 15, 30, 45, 60].forEach((m) => {
    const x = L + m * scale;
    out += `<line x1="${f(x)}" x2="${f(x)}" y1="10" y2="${H - 26}" class="ln"/><text x="${f(x)}" y="${H - 6}" text-anchor="middle" class="t-faint t-mono" font-size="14">${m}${m === 60 ? " min" : ""}</text>`;
  });
  rows.forEach(([name, sub, segs], i) => {
    const y = 14 + i * (rowH + gap);
    out += lines(0, y + 24, [name], "t-ink t-b", 20) + lines(0, y + 46, [sub], "t-dim", 14);
    let acc = 0;
    segs.forEach(([k, m, label], j) => {
      const x = L + acc * scale, w = Math.max(2, m * scale - (j < segs.length - 1 ? 3 : 0));
      acc += m;
      out += `<rect x="${f(x)}" y="${y}" width="${f(w)}" height="${rowH}" rx="${j === segs.length - 1 ? 8 : 2}" class="ss-seg ss-seg--${k}"/>`;
      if (w > label.length * 8.4 + 18) out += `<text x="${f(x + 12)}" y="${y + rowH / 2 + 6}" class="ss-seg-t ss-seg-t--${k}" font-size="15">${esc(label)}</text>`;
    });
    out += `<text x="${f(L + acc * scale + 12)}" y="${y + rowH / 2 + 7}" class="t-ink t-b" font-size="20">${Math.round(acc)} min</text>`;
  });
  return out + "</svg>";
}

/* 2. Who runs sanitation at Delhi T3: two organisations, five levels, each with its touchpoint. */
const LEVELS = [
  ["DIAL terminal operations", "Sets the SLA, answers for ACI scores", "Weekly data story · SLA report", "eye", "viz"],
  ["Airport Operations Control Centre", "24/7, about 3,200 cameras and 50,000+ sensor points", "Washroom layer on the wall", "sensor", "dash"],
  ["Facility contractor", "Runs housekeeping under contract", "Staffing by flight bank · stock", "people", "viz"],
  ["Shift manager × 3 shifts", "Owns the terminal for 8 hours", "Terminal dashboard · auto handover", "clock", "dash"],
  ["Zone supervisor", "Walks the zone with a walkie-talkie", "Zone iPad · radio prompt at 5 min", "radio", "dash"],
  ["Housekeeping attendants", "Cart, fixed rounds, mixed literacy", "Cart iPad · phone · watch", "cart", "field"],
];
function hierarchy() {
  const W = 1000, rowH = 76, H = LEVELS.length * rowH + 110;
  let out = `<svg class="ig ss-ig-org" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="ig-org-t">
  <title id="ig-org-t">The housekeeping hierarchy at Delhi T3 and the touchpoint for each level: ${LEVELS.map((l) => `${l[0]}, ${l[2]}`).join("; ")}. Alongside: the store keeper, with a usage-based restock list, and passengers, with the door display.</title>`;
  LEVELS.forEach(([name, what, tp, icon, kind], i) => {
    const y = 10 + i * rowH, x = 30 + i * 34;
    if (i) out += `<path d="M${x - 34 + 26} ${y - rowH + 52} V${y + 26} H${x}" class="ln" fill="none"/>`;
    out += `<circle cx="${x + 26}" cy="${y + 26}" r="26" class="${i === LEVELS.length - 1 ? "node-alert" : i === 4 ? "node-acc" : "node"}"/>`;
    out += pic(icon, x + 26, y + 26, 30, i >= 4 ? "ico-on" : "ico");
    out += lines(x + 66, y + 20, [name], "t-ink t-b", 19) + lines(x + 66, y + 42, [what], "t-dim", 14.5);
    out += `<rect x="640" y="${y + 6}" width="350" height="40" rx="20" class="ss-tp ss-tp--${kind}"/>`;
    out += `<text x="660" y="${y + 32}" class="ss-tp-t ss-tp-t--${kind}" font-size="15">${esc(tp)}</text>`;
  });
  const y = LEVELS.length * rowH + 24;
  out += `<line x1="30" x2="${W - 10}" y1="${y - 8}" y2="${y - 8}" class="ln ln-dash"/>`;
  [["Store keeper", "Usage-based restock list", "store", 30], ["Passengers, about 214,000 a day", "Door display and four-face rating", "washroom", 520]].forEach(([n, tp, icon, x]) => {
    out += `<circle cx="${x + 24}" cy="${y + 36}" r="24" class="node"/>` + pic(icon, x + 24, y + 36, 28);
    out += lines(x + 60, y + 30, [n], "t-ink t-b", 17) + lines(x + 60, y + 52, [tp], "t-dim", 14.5);
  });
  return out + "</svg>";
}

/* 3. Stakeholders as rings: who uses it, who works with it, who it serves, who sets the rules. */
function stakeholders() {
  const W = 900, cx = 450, cy = 400;
  const rings = [
    [120, "Use it every shift", [["Attendant", "cart"], ["Zone supervisor", "radio"]]],
    [235, "Work with it", [["Shift manager", "clock"], ["Store keeper", "store"], ["Contractor", "people"]]],
    [350, "Served or ruled by it", [["Passengers", "washroom"], ["DIAL ops", "eye"], ["AOCC", "sensor"], ["ACI survey", "face1"], ["AAI", "plane"]]],
  ];
  let out = `<svg class="ig ss-ig-rings" viewBox="0 0 ${W} 800" role="img" aria-labelledby="ig-rings-t">
  <title id="ig-rings-t">Stakeholder map. At the centre, people who use it every shift: attendants and zone supervisors. Around them: shift managers, store keepers and the contractor. Outside: passengers, DIAL terminal operations, the operations control centre, the ACI passenger survey and the Airports Authority of India.</title>`;
  [...rings].reverse().forEach(([r], i) => { out += `<circle cx="${cx}" cy="${cy}" r="${r + 40}" class="${i % 2 ? "ring-b" : "ring-a"}"/>`; });
  out += `<circle cx="${cx}" cy="${cy}" r="62" class="node-acc"/>` + pic("washroom", cx, cy - 8, 40, "ico-on") + `<text x="${cx}" y="${cy + 34}" text-anchor="middle" class="t-on t-b" font-size="13">Washroom</text>`;
  rings.forEach(([r, label, people], ri) => {
    out += `<text x="${cx}" y="${cy - r - 46}" text-anchor="middle" class="t-faint t-caps" font-size="12">${esc(label)}</text>`;
    people.forEach(([n, icon], i) => {
      const a = (360 / people.length) * i + (ri === 0 ? 90 : ri === 1 ? 30 : 0) + 18;
      const [x, y] = pol(cx, cy, r, a);
      out += `<circle cx="${f(x)}" cy="${f(y)}" r="27" class="${ri === 0 ? "node-alert" : "node"}"/>` + pic(icon, x, y, 30, ri === 0 ? "ico-on" : "ico");
      out += `<text x="${f(x)}" y="${f(y + 46)}" text-anchor="middle" class="t-ink t-b" font-size="15">${esc(n)}</text>`;
    });
  });
  return out + "</svg>";
}

/* 4. Service blueprint: one task from sensor to SLA report, across five lanes. */
const STAGES = ["Sense", "Decide", "Offer", "Go", "Clean", "Confirm", "Learn"];
const LANES = [
  ["Passenger", ["Uses the washroom", "", "", "", "Sees “Cleaning now”, sent to the next one", "Rates it on the door", "Fewer bad surprises"]],
  ["Attendant", ["", "", "Chime, pictures, spoken Hindi", "I'm going · store first if short", "Jobs ticked as done", "Sensor closes it", "Done count for the shift"]],
  ["Supervisor and manager", ["", "", "Queue shows who has it", "Radio prompt at 5 min if nobody", "Map shows it being cleaned", "", "Handover carries open tasks"]],
  ["Saaf Safar", ["Readings every few minutes", "Thresholds, 20 min forecast", "Nearest free cart, 2 min to answer", "Route, cart stock check", "Timer per job", "Reset confirmed by sensor", "Week story, SLA evidence"]],
  ["Sensors and stores", ["Fill, tissue, soap, odour, wet floor, footfall", "", "", "Store keeper restocks", "", "Levels reset", "Restock by use"]],
];
function blueprint() {
  const L = 170, colW = 118, W = L + STAGES.length * colW + 10, rowH = 108, top = 44;
  const H = top + LANES.length * rowH + 10;
  let out = `<svg class="ig ss-ig-bp" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="ig-bp-t">
  <title id="ig-bp-t">Service blueprint of one task, in seven stages from sense to learn, across passengers, attendants, supervisors and managers, the Saaf Safar system, and sensors and stores.</title>`;
  STAGES.forEach((s, i) => { out += `<text x="${L + i * colW + colW / 2}" y="24" text-anchor="middle" class="t-ink t-b" font-size="15">${esc(s)}</text>`; });
  LANES.forEach(([lane, cells], r) => {
    const y = top + r * rowH;
    if (r === 2 || r === 3) out += `<line x1="0" x2="${W}" y1="${y - 6}" y2="${y - 6}" class="${r === 3 ? "ln-org ss-lov" : "ln ln-dash"}"/>`;
    out += lines(0, y + 30, [lane], `t-b ${r === 3 ? "t-ink" : "t-dim"}`, 14.5);
    cells.forEach((c, i) => {
      if (!c) return;
      const x = L + i * colW + 4;
      out += `<rect x="${x}" y="${y}" width="${colW - 8}" height="${rowH - 14}" rx="10" class="${r === 3 ? "ss-bp-sys" : r === 1 ? "ss-bp-front" : "node"}"/>`;
      const words = c.split(" "), wrapped = [];
      let line = "";
      words.forEach((w) => { if ((line + " " + w).trim().length > 15) { wrapped.push(line.trim()); line = w; } else line += " " + w; });
      wrapped.push(line.trim());
      out += lines(x + 9, y + 20, wrapped.slice(0, 5), r === 3 ? "t-on" : "t-ink", 12.5, "start", 1.22);
    });
  });
  out += `<text x="${W - 6}" y="${top + 3 * rowH - 12}" text-anchor="end" class="t-org t-caps" font-size="10.5">line of visibility</text>`;
  return out + "</svg>";
}

/* 5. Task lifecycle with the escalation loop. */
function lifecycle() {
  const W = 1000, H = 330;
  const N = [
    ["Open", "sensor crosses a line", 70, 110, "sensor", "below"],
    ["Offered", "nearest free cart", 250, 110, "bolt", "above"],
    ["Going", "I'm going", 430, 110, "walk", "above"],
    ["Store", "only if the cart is short", 610, 40, "store", "right"],
    ["Cleaning", "at the door", 610, 180, "odour", "below"],
    ["Closed", "by the sensor, not a tap", 800, 180, "check", "below"],
    ["Radio", "supervisor calls the nearest cart", 250, 270, "radio", "right"],
  ];
  const at = Object.fromEntries(N.map((n) => [n[0], n]));
  const arrow = (a, b, label, curve = 0, cls = "ln-strong") => {
    const [x1, y1] = [at[a][2], at[a][3]], [x2, y2] = [at[b][2], at[b][3]];
    const mx = (x1 + x2) / 2 + curve, my = (y1 + y2) / 2 - Math.abs(curve) * 0.6;
    const d = curve ? `M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}` : `M${x1} ${y1} L${x2} ${y2}`;
    return `<path d="${d}" class="${cls}" fill="none" marker-end="url(#ss-arr)"/>` + (label ? `<text x="${f(mx)}" y="${f(my - 8)}" text-anchor="middle" class="t-dim" font-size="13">${esc(label)}</text>` : "");
  };
  let out = `<svg class="ig ss-ig-life" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="ig-life-t">
  <title id="ig-life-t">Task lifecycle. A sensor crossing a threshold opens a task. It is offered to the nearest free cart. If the cart cannot go or does not answer in 2 minutes, it goes back to open and the next cart. If nobody has taken a Go now task at 5 minutes, the supervisor is asked to call on the radio. Once someone is going, the cart stops at the store only if short, then cleans, and the sensor closes the task.</title>
  <defs><marker id="ss-arr" viewBox="0 0 10 10" refX="6" refY="5" markerUnits="userSpaceOnUse" markerWidth="18" markerHeight="18" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="ss-arr-head"/></marker></defs>`;
  out += arrow("Open", "Offered", "");
  out += arrow("Offered", "Going", "");
  out += arrow("Going", "Store", "", 0);
  out += arrow("Going", "Cleaning", "", 0);
  out += arrow("Store", "Cleaning", "");
  out += arrow("Cleaning", "Closed", "");
  out += `<path d="M250 136 Q160 200 70 136" class="ln-org" fill="none" marker-end="url(#ss-arr)"/><text x="160" y="198" text-anchor="middle" class="t-org" font-size="13">no answer in 2 min</text>`;
  out += `<path d="M70 136 Q90 250 222 270" class="ln-org" fill="none" marker-end="url(#ss-arr)"/><text x="96" y="262" class="t-org" font-size="13">5 min</text>`;
  out += `<path d="M278 270 Q420 260 430 138" class="ln-strong" fill="none" marker-end="url(#ss-arr)"/>`;
  N.forEach(([name, sub, x, y, icon, pos]) => {
    const alert = name === "Radio", done = name === "Closed";
    out += `<circle cx="${x}" cy="${y}" r="27" class="${alert ? "node-alert" : done ? "ss-node-done" : name === "Going" ? "node-acc" : "node"}"/>` + pic(icon, x, y, 28, alert || name === "Going" ? "ico-on" : done ? "ss-ico-done" : "ico");
    if (pos === "right") {
      out += lines(x + 40, y - 2, [name], "t-ink t-b", 16) + lines(x + 40, y + 17, [sub], "t-dim", 13);
    } else {
      const ty = pos === "below" ? y + 50 : y - 50;
      out += `<text x="${x}" y="${ty}" text-anchor="middle" class="t-ink t-b" font-size="16">${esc(name)}</text>`;
      out += `<text x="${x}" y="${ty + 18}" text-anchor="middle" class="t-dim" font-size="13">${esc(sub)}</text>`;
    }
  });
  return out + "</svg>";
}

/* 6. The escalation ladder for a Go now task. */
function ladder() {
  const steps = [
    ["0 min", "Chime, pictures and spoken Hindi on the nearest cart iPad; phone or watch if the attendant has opted in", "bolt", "now"],
    ["2 min", "Not taken: offered to the next nearest cart", "cart", ""],
    ["5 min", "Still not taken: the zone dashboard asks the supervisor to call on the walkie-talkie", "radio", "now"],
    ["Done", "The sensor confirms the reset and closes the task. Nobody taps done.", "check", "ok"],
  ];
  return `<ol class="ss-ladder">${steps.map(([t, text, icon, tone]) => `<li class="ss-rung ss-rung--${tone || "plain"}"><span class="ss-rung-ic"><svg viewBox="0 0 48 48" aria-hidden="true"><use href="#p-${icon}"/></svg></span><b>${esc(t)}</b><span>${esc(text)}</span></li>`).join("")}</ol>`;
}

/* 7. A day at T3: three shifts, the departure banks and the handovers. */
function shiftDay(byHour) {
  const W = 1000, H = 230, L = 20, R = 20, iw = W - L - R, max = Math.max(...byHour);
  const x = (h) => L + (h / 24) * iw;
  let out = `<svg class="ig ss-ig-day" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="ig-day-t">
  <title id="ig-day-t">Departures per hour across a simulated day at the pier, with the morning, evening and night shifts and the handovers at 06:00, 14:00 and 22:00. Peaks come in the morning bank around 07:00 to 08:00 and the long evening bank from about 17:00 to 21:00, with a late-night international wave inside the night shift.</title>`;
  [["Night", 0, 6], ["Morning shift", 6, 14], ["Evening shift", 14, 22], ["Night shift", 22, 24]].forEach(([n, a, b], i) => {
    out += `<rect x="${f(x(a))}" y="160" width="${f(x(b) - x(a) - 2)}" height="34" rx="6" class="${i === 2 ? "ss-shift-on" : "node"}"/>`;
    if (b - a > 3) out += `<text x="${f(x(a) + 12)}" y="182" class="${i === 2 ? "t-on t-b" : "t-dim t-b"}" font-size="14">${esc(n)}</text>`;
  });
  byHour.forEach((v, h) => {
    const bh = (v / max) * 120;
    out += `<rect x="${f(x(h) + 5)}" y="${f(150 - bh)}" width="${f(iw / 24 - 10)}" height="${f(bh)}" rx="4" class="ss-bar"/>`;
  });
  [6, 14, 22].forEach((h) => { out += `<line x1="${f(x(h))}" x2="${f(x(h))}" y1="18" y2="196" class="ss-hand"/><text x="${f(x(h) + 6)}" y="28" class="t-org t-b" font-size="13">handover ${String(h).padStart(2, "0")}:00</text>`; });
  [0, 6, 12, 18, 24].forEach((h) => { out += `<text x="${f(x(h))}" y="${H - 8}" text-anchor="${h === 0 ? "start" : h === 24 ? "end" : "middle"}" class="t-faint t-mono" font-size="13">${String(h % 24).padStart(2, "0")}:00</text>`; });
  return out + "</svg>";
}

/* 8. Brainstorm: one idea, six directions. Filled ideas are in the prototype; dashed ones are parked. */
const MIND = [
  ["Sense", [["Fill, tissue, soap, odour, wet", 1], ["Footfall from the timetable", 1], ["Leak detection", 0]]],
  ["Tell", [["Pictures and spoken Hindi", 1], ["Phone and watch, opt-in", 1], ["Smart glasses", 0]]],
  ["Route", [["Nearest free cart", 1], ["2 min, then the next cart", 1], ["Indoor positioning", 0]]],
  ["Stock", [["Cart checks its own stock", 1], ["Restock per 100 passengers", 1], ["Auto re-order", 0]]],
  ["Prove", [["Sensor closes the task", 1], ["Weekly data story, SLA", 1], ["Live ACI score", 0]]],
  ["Passengers", [["Cleaned 12 min ago", 1], ["Four-face rating", 1], ["Queue length on signage", 0]]],
];
function mindmap() {
  const W = 1000, H = 620, cx = 500, cy = 310;
  let out = `<svg class="ig ss-ig-mind" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="ig-mind-t">
  <title id="ig-mind-t">Brainstorm around one idea, tell the right person right now, in six directions: ${MIND.map(([b, ideas]) => `${b}: ${ideas.map((i) => i[0] + (i[1] ? "" : " (parked)")).join(", ")}`).join("; ")}.</title>`;
  MIND.forEach(([branch, ideas], i) => {
    const a = i * 60 + 30;
    const [bx, by] = pol(cx, cy, 175, a);
    out += `<line x1="${cx}" y1="${cy}" x2="${f(bx)}" y2="${f(by)}" class="ln-strong mm-line mm-${i + 1}"/>`;
    const right = bx > cx;
    ideas.forEach(([idea, on], j) => {
      const iy = by + (j - 1) * 46, ix = right ? bx + 70 : bx - 70;
      out += `<path d="M${f(bx)} ${f(by)} C${f((bx + ix) / 2)} ${f(by)} ${f((bx + ix) / 2)} ${f(iy)} ${f(ix)} ${f(iy)}" class="ln mm-twig mm-${i + 1}" fill="none"/>`;
      const w = idea.length * 7.6 + 26, rx = right ? ix : ix - w;
      out += `<rect x="${f(rx)}" y="${f(iy - 16)}" width="${f(w)}" height="32" rx="16" class="${on ? "pill-on" : "pill-off"}"/>`;
      out += `<text x="${f(rx + 13)}" y="${f(iy + 5)}" class="${on ? "t-ink" : "t-faint"}" font-size="14">${esc(idea)}</text>`;
    });
    out += `<circle cx="${f(bx)}" cy="${f(by)}" r="38" class="node mm-stn mm-${i + 1}"/><text x="${f(bx)}" y="${f(by + 5)}" text-anchor="middle" class="t-ink t-b" font-size="${branch.length > 7 ? 12 : 14}">${esc(branch)}</text>`;
  });
  out += `<circle cx="${cx}" cy="${cy}" r="78" class="node-acc"/>` + lines(cx, cy - 10, ["Tell the right", "person, right now"], "t-on t-b", 16, "middle");
  return out + "</svg>";
}

module.exports = { incident, hierarchy, stakeholders, blueprint, lifecycle, ladder, shiftDay, mindmap, LEVELS };
