// Khatiq design system as live component specimens: short labels, the components themselves, almost no prose.
// Values mirror the prototype (src/styles/ios.css, src/data/banks.ts).
const e = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "’");

const ICON = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  wallet: '<path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  scan: '<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10"/>',
  rupee: '<path d="M6 3h12M6 8h12M6 13l8.5 8M6 13h3c6.67 0 6.67-10 0-10"/>',
  chart: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-3 3"/>',
  bell: '<path d="M10.27 21a2 2 0 0 0 3.46 0M3.26 15.33A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.67C19.41 13.96 18 12.5 18 8A6 6 0 0 0 6 8c0 4.5-1.41 5.96-2.74 7.33"/>',
  in: '<path d="M17 7 7 17M17 17H7V7"/>',
  out: '<path d="M7 7h10v10M7 17 17 7"/>',
  repeat: '<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
  chev: '<path d="m9 18 6-6-6-6"/>',
  xcircle: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>',
  triangle: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/>',
  check: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
};
const ico = (k, s = 18) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k]}</svg>`;

/** Arc gauge as in the app: 270°, number alone in the ring, label in the opening. */
const gauge = (v, hue, num, label, size = 88) => {
  const r = 30;
  const len = (2 * Math.PI * r * 270) / 360;
  return `<figure class="ds-gauge" style="width:${size}px"><svg viewBox="0 0 76 76" width="${size}" height="${size}" aria-hidden="true">
    <circle cx="38" cy="38" r="${r}" fill="none" stroke="var(--ds-track)" stroke-width="5" stroke-linecap="round" stroke-dasharray="${len.toFixed(1)} 999" transform="rotate(135 38 38)"/>
    <circle cx="38" cy="38" r="${r}" fill="none" stroke="${hue}" stroke-width="5" stroke-linecap="round" stroke-dasharray="${(len * v).toFixed(1)} 999" transform="rotate(135 38 38)"/></svg>
    <b>${num}</b><figcaption>${e(label)}</figcaption></figure>`;
};
const ticks = (left, total, hue, size = 88) => {
  let l = "";
  for (let i = 0; i < total; i++) {
    const a = (i / total) * 2 * Math.PI - Math.PI / 2;
    l += `<line x1="${(32 + 25 * Math.cos(a)).toFixed(1)}" y1="${(32 + 25 * Math.sin(a)).toFixed(1)}" x2="${(32 + 30 * Math.cos(a)).toFixed(1)}" y2="${(32 + 30 * Math.sin(a)).toFixed(1)}" stroke="${i < left ? hue : "var(--ds-track)"}" stroke-width="2.4" stroke-linecap="round"/>`;
  }
  return `<figure class="ds-gauge" style="width:${size}px"><svg viewBox="0 0 64 64" width="${size}" height="${size}" aria-hidden="true">${l}</svg><b>${left}</b><figcaption>days</figcaption></figure>`;
};
const hist = () => {
  const v = [31, 31, 31, -1, -1, 67, 67, 64, 64, 62, 62, 62, 60, 60];
  return `<svg class="ds-hist" viewBox="0 0 140 46" aria-hidden="true"><line x1="0" x2="140" y1="34" y2="34" stroke="var(--ds-track)"/>${v
    .map((n, i) => {
      const x = i * 10 + 2;
      if (n < 0) return `<rect x="${x}" y="36" width="6" height="8" rx="3" fill="#ff8f78"/>`;
      const h = (n / 70) * 30;
      return `<rect x="${x}" y="${34 - h}" width="6" height="${h}" rx="3" fill="${i === 5 ? "#7ee8c2" : i === 0 ? "#f3f3f1" : "#55555a"}"/>`;
    })
    .join("")}</svg>`;
};

/** A notice as in the app: tinted fill, full 1px edge, icon and title. Never a side stripe. */
const notice = (tone, icon, title, text, action) =>
  `<div class="ds-notice is-${tone}">${ico(icon, 19)}<p><b>${e(title)}</b><span>${e(text)}</span>${action ? `<em>${e(action)}</em>` : ""}</p></div>`;

function designSystem(banks) {
  const order = ["northgate", "riverbend", "kesari", "pragati", "nila", "sahyog"];
  const hues = [
    ["#7ee8c2", "Mint", "money in"],
    ["#ff8f78", "Coral", "money out"],
    ["#ffd65a", "Sun", "savings"],
    ["#b8b2ff", "Lavender", "shortcuts, the assistant"],
    ["#84cbff", "Sky", "banks"],
    ["#c8f06e", "Lime", "paying"],
  ];
  return `<div class="ds reveal">
    <section class="ds-tile ds-w6" aria-label="Colour">
      <p class="ds-k">Colour · 60 / 30 / 10</p>
      <div class="ds-6030"><span style="flex:60;background:#000">60 black</span><span style="flex:30;background:#1c1c1e">30 graphite</span><span style="flex:10;background:#4b3fc4">10</span></div>
      <ul class="ds-hues">${hues.map(([c, n, u]) => `<li><i style="background:${c}"></i><b>${n}</b><span>${u}</span></li>`).join("")}</ul>
    </section>

    <section class="ds-tile ds-w6" aria-label="Type">
      <p class="ds-k">Type · one family, the system sans: bold for titles and money, regular for reading</p>
      <div class="ds-type">
        <p><small>Large title 34</small><span class="ds-app" style="font-size:34px;font-weight:700;letter-spacing:-0.02em">Ways to cover rent</span></p>
        <p><small>Balance 46</small><span class="ds-app" style="font-size:44px;font-weight:700;letter-spacing:-0.02em"><span class="ds-sym">₹</span>31,240<span class="ds-dim">.50</span></span></p>
        <p><small>Headline 17</small><span style="font-size:17px;font-weight:600">Rent leaves 1 Nov.</span></p>
        <p><small>Body 17</small><span style="font-size:17px">You’ll be ₹1,059 short for 2 days.</span></p>
        <p><small>Footnote 13</small><span style="font-size:13px;color:var(--ds-dim)">Salary 3 Nov · No fee</span></p>
      </div>
    </section>

    <section class="ds-tile ds-w4" aria-label="Buttons">
      <p class="ds-k">Buttons</p>
      <div class="ds-stack">
        <span class="ds-btn is-primary">Review the move</span>
        <span class="ds-btn">Talk to a person</span>
        <span class="ds-btn is-quiet">Move it back to savings</span>
        <span class="ds-btn is-danger">Stop this autopay</span>
        <span class="ds-row-inline"><span class="ds-pill is-lav">Fix now</span><span class="ds-link">Other ways ${ico("chev", 15)}</span></span>
      </div>
    </section>

    <section class="ds-tile ds-w4" aria-label="Controls">
      <p class="ds-k">Controls</p>
      <div class="ds-stack">
        <span class="ds-seg"><b>Money out</b><span>Money in</span><span>Saved</span></span>
        <span class="ds-row-inline"><span class="ds-switch is-on"><i></i></span><span class="ds-switch"><i></i></span><span class="ds-check">✓</span><span class="ds-radio"></span></span>
        <span class="ds-chips"><b>All money</b><span><i class="ds-mark" style="background:${banks.northgate.palette.brand}">${e(banks.northgate.mark)}</i>${e(banks.northgate.short)}</span><span>+</span></span>
        <span class="ds-search">Name, UPI ID or mobile number</span>
      </div>
    </section>

    <section class="ds-tile ds-w4" aria-label="Navigation">
      <p class="ds-k">Navigation</p>
      <div class="ds-stack">
        <span class="ds-tabbar"><span class="is-on">${ico("home", 19)}<small>Home</small></span><span>${ico("wallet", 19)}<small>Accounts</small></span><span class="ds-scan">${ico("scan", 21)}</span><span>${ico("rupee", 19)}<small>Pay</small></span><span>${ico("chart", 19)}<small>Insights</small></span></span>
        <span class="ds-row-inline"><span class="ds-round">${ico("bell", 18)}<em>2</em></span><span class="ds-round is-avatar">AM</span><span class="ds-round is-back">${ico("chev", 18)}</span></span>
      </div>
    </section>

    <section class="ds-tile ds-w6" aria-label="Lists">
      <p class="ds-k">Inset grouped list</p>
      <ul class="ds-list">
        <li><i class="ds-ring">${ico("out", 15)}</i><span><b>Rent (UPI autopay)</b><small>1 Nov · may fail</small></span><em class="is-out">−₹32,000</em></li>
        <li><i class="ds-ring">${ico("in", 15)}</i><span><b>Salary from Kite Labs</b><small>3 Nov</small></span><em class="is-in">+₹68,500</em></li>
        <li><i class="ds-ring">${ico("repeat", 15)}</i><span><b>Autopays</b><small>4 active</small></span>${ico("chev", 16)}</li>
      </ul>
    </section>

    <section class="ds-tile ds-w6" aria-label="Alert card">
      <p class="ds-k">The alert card</p>
      <div class="ds-card">
        <p class="ds-card-k"><i class="ds-mark" style="background:${banks.northgate.palette.brand}">${e(banks.northgate.mark)}</i>${e(banks.northgate.short)} · one thing to sort</p>
        <div class="ds-card-main"><p>Rent leaves 1 Nov. You’ll be ₹1,059 short for 2 days.</p></div>
        <p class="ds-card-fix">Move ₹1,500 from your savings pot. No fee.</p>
        <span class="ds-row-inline"><span class="ds-pill is-lav">Fix now</span><span class="ds-link">Other ways ${ico("chev", 15)}</span></span>
      </div>
    </section>

    <section class="ds-tile ds-w12" aria-label="States">
      <p class="ds-k">States · an icon and a title every time, never colour alone</p>
      <div class="ds-states">
        <div><small>Error · something failed, and what still works</small>${notice("stop", "xcircle", "No answer from Vindhya", "Nothing was shared. Your other banks still work.")}</div>
        <div><small>Warning · what goes wrong if nothing changes</small>${notice("warn", "triangle", "Rent will be ₹3,059 short", "Rent leaves by autopay on 1 Nov. You can still pay.", "See ways to cover rent")}</div>
        <div><small>Success · what finished</small>${notice("good", "check", "Rent is covered", "₹1,500 moved from your savings pot.")}</div>
        <div><small>Info · a fact that changes what you’d do</small>${notice("info", "info", "Read-only account", "To move money here, use Narmada’s app.")}</div>
      </div>
      <div class="ds-fields">
        <div><small>Field</small><span class="ds-field-in"><i>₹</i>2,000</span><span class="ds-help">From Main account · ₹31,240.50 available</span></div>
        <div><small>Field, error</small><span class="ds-field-in is-error"><i>₹</i>99,999</span><span class="ds-help is-error">${ico("alert", 14)} That’s more than your main account has.</span></div>
        <div><small>PIN, wrong</small><span class="ds-pin">${"<i></i>".repeat(4)}</span><span class="ds-help is-error is-center">Wrong PIN. 2 tries left.</span></div>
      </div>
    </section>

    <section class="ds-tile ds-w12" aria-label="Data">
      <p class="ds-k">Data at a glance</p>
      <div class="ds-data">
        <div class="ds-wide">${hist()}<small>Bars over time · mint money in, coral short</small></div>
        <div class="ds-wide"><span class="ds-cap"><i style="width:67%"></i></span><small>Progress · one colour per kind</small></div>
        <div class="ds-wide"><span class="ds-cap is-steps"><i style="width:33%"></i></span><small>Steps · queued, debited, paid</small></div>
      </div>
    </section>

    <section class="ds-tile ds-w8" aria-label="Bank palettes">
      <p class="ds-k">Each linked bank keeps its own colours</p>
      <ul class="ds-banks">${order
        .map((id) => {
          const b = banks[id];
          const p = b.palette;
          return `<li><span class="ds-field" style="background:radial-gradient(circle at 20% 20%, ${p.aura[1]}, transparent 60%), radial-gradient(circle at 85% 90%, ${p.aura[2]}, transparent 55%), ${p.aura[0]}"><i class="ds-mark is-lg" style="background:${p.brand}">${e(b.mark)}</i></span><b>${e(b.short)}</b><span class="ds-sw"><i style="background:${p.brand}"></i><i style="background:${p.inkDark}"></i><i style="background:${p.tintLight}"></i></span></li>`;
        })
        .join("")}</ul>
    </section>

    <section class="ds-tile ds-w4" aria-label="Watch">
      <p class="ds-k">Watch complications</p>
      <div class="ds-watch">
        <div class="ds-comp-c">${gauge(0.97, "#ff8f78", "97", "RENT", 54)}</div>
        <div class="ds-comp-r"><b>RENT 1 NOV <em>₹1,059 SHORT</em></b>${hist()}</div>
      </div>
    </section>

    <section class="ds-tile ds-w12" aria-label="Space and shape">
      <p class="ds-k">Space and shape</p>
      <div class="ds-tokens">
        <span><i style="width:16px"></i>16 margin</span>
        <span><i style="width:12px"></i>12 tiles</span>
        <span><i style="width:32px"></i>32 sections</span>
        <span><i class="ds-rad" style="border-radius:22px"></i>22 lists</span>
        <span><i class="ds-rad" style="border-radius:26px"></i>26 cards</span>
        <span><i class="ds-rad" style="border-radius:34px"></i>34 sheets</span>
        <span><i class="ds-rad" style="border-radius:999px"></i>Capsule controls</span>
        <span><i class="ds-rad is-target"></i>44 pt targets</span>
        <span><i class="ds-rad is-spring"></i>Springs, 0.3 s</span>
      </div>
    </section>
  </div>`;
}

module.exports = { designSystem };
