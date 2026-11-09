// Story diagrams for the Cash-Flow Gap case study: the gap itself, the emotion curve,
// the decision log, the targets and the headline numbers. Plain SVG and HTML, themed by cashflow.css.
const e = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "’");
const inr = (n) => (n < 0 ? "−" : "") + "₹" + Math.abs(Math.round(n)).toLocaleString("en-IN");

/* The prototype's own projection (scenario.ts): 14 days from 29 Oct. */
const DAYS = [
  ["29 Oct", 31241, "Today"],
  ["30 Oct", 30942, ""],
  ["31 Oct", 30942, ""],
  ["1 Nov", -1058, "Rent ₹32,000 leaves"],
  ["2 Nov", -1058, ""],
  ["3 Nov", 67442, "Salary ₹68,500 lands"],
  ["4 Nov", 67442, ""],
  ["5 Nov", 63992, ""],
  ["6 Nov", 63992, ""],
  ["7 Nov", 61592, ""],
  ["8 Nov", 61592, ""],
  ["9 Nov", 61592, ""],
  ["10 Nov", 60412, ""],
  ["11 Nov", 60412, ""],
];

/** The gap in one picture: 14 days of balance as bars; the two short days drop below the line. */
function gapChart() {
  const W = 1120;
  const H = 570;
  const top = 130;
  const zero = 390;
  const left = 70;
  const step = (W - left - 30) / DAYS.length;
  const bw = step * 0.62;
  const max = 70000;
  const bars = DAYS.map(([d, v], i) => {
    const x = left + i * step + (step - bw) / 2;
    const neg = v < 0;
    const h = neg ? 44 : Math.max(6, ((zero - top) * v) / max);
    const y = neg ? zero + 4 : zero - h;
    const cls = neg ? "is-short" : i === 5 ? "is-pay" : i === 0 ? "is-today" : "";
    return `<rect class="cf-gc-bar ${cls}" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="${(bw / 2.6).toFixed(1)}" />
      <text class="cf-gc-day" x="${(x + bw / 2).toFixed(1)}" y="${H - 18}">${e(d.split(" ")[0])}</text>`;
  }).join("");
  const xAt = (i) => left + i * step + step / 2;
  const guides = DAYS.map((_, i) => left + i * step)
    .concat([left + DAYS.length * step])
    .map((x) => `<line class="cf-gc-guide" x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="${top - 30}" y2="${H - 40}" />`)
    .join("");
  return `<svg class="cf-gc" viewBox="0 0 ${W} ${H}" role="img" aria-label="Balance over the next 14 days. ₹31,241 today. Rent of ₹32,000 leaves on 1 November, so the account is ₹1,058 short on 1 and 2 November. Salary of ₹68,500 lands on 3 November and the balance recovers to about ₹67,000.">
    <rect class="cf-gc-band" x="${(xAt(3) - step / 2).toFixed(1)}" y="${top - 20}" width="${(step * 2).toFixed(1)}" height="${zero - top + 140}" rx="18" />
    ${guides}
    <line class="cf-gc-zero" x1="${left - 10}" x2="${W - 20}" y1="${zero + 2}" y2="${zero + 2}" />
    <text class="cf-gc-axis" x="${left - 18}" y="${zero + 7}" text-anchor="end">₹0</text>
    <text class="cf-gc-axis" x="${left - 18}" y="${top + 6}" text-anchor="end">₹70k</text>
    ${bars}
    <g class="cf-gc-note is-today"><text x="${xAt(0)}" y="${zero - (zero - top) * (31241 / max) - 16}">₹31,241 today</text></g>
    <g class="cf-gc-note is-short"><text x="${(xAt(3) + step / 2).toFixed(1)}" y="${zero + 90}">₹1,058 short</text><text class="cf-gc-sub" x="${(xAt(3) + step / 2).toFixed(1)}" y="${zero + 112}">for 2 days</text></g>
    <g class="cf-gc-note is-pay"><text x="${xAt(5) - step * 0.2}" y="${top - 62}" text-anchor="start">Salary lands</text><text class="cf-gc-sub" x="${xAt(5) - step * 0.2}" y="${top - 40}" text-anchor="start">+₹68,500 on 3 Nov</text></g>
    <text class="cf-gc-month" x="${left}" y="${H - 2}">Oct</text>
    <text class="cf-gc-month" x="${xAt(3) - step / 2}" y="${H - 2}">Nov</text>
  </svg>`;
}

/** Headline numbers on filled tiles. */
function stats(items) {
  return `<ul class="cf-stats">${items
    .map(([n, label, hue]) => `<li style="--tile:var(--hue-${hue})"><b>${e(n)}</b><span>${e(label)}</span></li>`)
    .join("")}</ul>`;
}

/** How the moment should feel, against how it feels today (a design intention, not a measurement). */
function emotionCurve() {
  const pts = [
    ["Opening the app", "Confidence", 80],
    ["A gap appears", "Reassurance", 62],
    ["Choosing a fix", "Control", 74],
    ["Moving money", "Trust", 78],
    ["Covered", "Progress", 92],
  ];
  const today = [70, 70, 16, 10, 30];
  const todayLabels = ["Nothing to see", "Nothing to see", "Autopay bounces", "SMS: NACH return charges", "A late fee"];
  const W = 1120;
  const H = 380;
  const x0 = 90;
  const dx = (W - x0 - 90) / (pts.length - 1);
  const y = (v) => 320 - v * 2.7;
  const path = (vals) => vals.map((v, i) => `${i ? "L" : "M"}${(x0 + i * dx).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const smooth = (vals) => {
    let d = `M${x0},${y(vals[0])}`;
    for (let i = 1; i < vals.length; i++) {
      const xa = x0 + (i - 1) * dx;
      const xb = x0 + i * dx;
      d += ` C${(xa + dx / 2).toFixed(1)},${y(vals[i - 1]).toFixed(1)} ${(xb - dx / 2).toFixed(1)},${y(vals[i]).toFixed(1)} ${xb.toFixed(1)},${y(vals[i]).toFixed(1)}`;
    }
    return d;
  };
  const hues = ["mint", "sky", "lavender", "sun", "mint"];
  return `<svg class="cf-ec" viewBox="0 0 ${W} ${H}" role="img" aria-label="How the five moments should feel with Khatiq: confidence opening the app, reassurance when a gap appears, control choosing a fix, trust moving money, progress once covered. Today the same days dip to stress when the autopay bounces and an SMS about NACH return charges arrives.">
    <text class="cf-ec-k" x="10" y="${y(100) + 4}">Calm</text>
    <text class="cf-ec-k" x="10" y="${y(0) + 4}">Stress</text>
    ${pts.map((_, i) => `<line class="cf-ec-guide" x1="${x0 + i * dx}" x2="${x0 + i * dx}" y1="${y(100) - 30}" y2="${H - 30}" />`).join("")}
    <path class="cf-ec-today" d="${smooth(today)}" />
    <path class="cf-ec-fill" d="${smooth(pts.map((p) => p[2]))} L${x0 + 4 * dx},${y(0)} L${x0},${y(0)} Z" />
    <path class="cf-ec-line" d="${smooth(pts.map((p) => p[2]))}" />
    ${pts
      .map(([m, emo, v], i) => {
        const x = x0 + i * dx;
        return `<g><circle class="cf-ec-dot" style="--dot:var(--hue-${hues[i]})" cx="${x}" cy="${y(v)}" r="11" />
        <rect class="cf-ec-tag" x="${x - (emo.length * 9.4 + 28) / 2}" y="${y(v) - 54}" width="${emo.length * 9.4 + 28}" height="34" rx="12" />
        <text class="cf-ec-emo" x="${x}" y="${y(v) - 31.5}">${e(emo)}</text>
        <text class="cf-ec-m" x="${x}" y="${H - 6}">${e(m)}</text>
        ${today[i] < 40 ? `<text class="cf-ec-t" x="${x}" y="${y(today[i]) + 30}">${e(todayLabels[i])}</text>` : ""}</g>`;
      })
      .join("")}
  </svg>
  <p class="cf-ec-legend"><span class="is-now"></span>With Khatiq, as designed <span class="is-today"></span>Today, an SMS after the bounce</p>`;
}

/** Decisions as before → after, each on its own filled tile. */
function decisions(rows) {
  return `<ol class="cf-dl">${rows
    .map(
      ([was, now, why, hue], i) => `<li style="--tile:var(--hue-${hue})">
      <span class="cf-dl-n">${String(i + 1).padStart(2, "0")}</span>
      <p class="cf-dl-was"><s>${e(was)}</s></p>
      <p class="cf-dl-now">${e(now)}</p>
      <p class="cf-dl-why">${e(why)}</p>
    </li>`,
    )
    .join("")}</ol>`;
}

/** Targets as rings: how many of ten people must succeed. */
function targets(rows) {
  const r = 46;
  const c = 2 * Math.PI * r;
  return `<ul class="cf-targets">${rows
    .map(
      ([n, of, label, how, hue]) => `<li style="--ring:var(--hue-${hue})">
      <svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="${r}" class="cf-tg-track" /><circle cx="60" cy="60" r="${r}" class="cf-tg-fill" stroke-dasharray="${((c * n) / of).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 60 60)" /><text x="60" y="58" class="cf-tg-n">${n}/${of}</text><text x="60" y="78" class="cf-tg-of">people</text></svg>
      <b>${e(label)}</b><span>${e(how)}</span>
    </li>`,
    )
    .join("")}</ul>`;
}

/** Today's SMS against the real card from the app, side by side. Plain sentences, no bullet lists. */
function beforeAfter(cardImg) {
  return `<div class="cf-ba">
    <figure class="cf-ba-col is-before">
      <div class="cf-sms"><span class="cf-sms-from">AD-DCBANK · 1 Nov, 7:02 am</span><p>Dear Customer, NACH mandate debit of INR 32,000.00 returned unpaid due to insufficient funds. Return charges of INR 500 + GST applicable. -DCB</p></div>
      <figcaption><b>Today.</b> It arrives after the payment has already failed, in bank words, with nowhere to go next.</figcaption>
    </figure>
    <figure class="cf-ba-col is-after">
      <div class="cf-ba-shot">${cardImg}</div>
      <figcaption><b>With Khatiq.</b> Three days earlier, one sentence, and a way out you can tap.</figcaption>
    </figure>
  </div>`;
}

module.exports = { gapChart, stats, emotionCurve, decisions, targets, beforeAfter, inr };
