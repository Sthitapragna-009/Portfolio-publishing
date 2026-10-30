// Builds the H2o Connect app screens as HTML, then renders them to the images the
// case study uses. The screens follow tools/h2o/app-fix-spec.md (fixes 1 to 12).
//
//   node tools/h2o/build-screens.js            writes tools/h2o/screens/index.html (all screens on one board)
//   node tools/h2o/build-screens.js --render   also renders each screen into assets/h2o/
//
// Each screen is 360 x 779 CSS px; rendered at 2x it is 720 x 1558, the size the case study expects.
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const SITE = path.resolve(__dirname, "../..");
const OUT = path.join(__dirname, "screens");
const ICON = "../../../assets/h2o/app-icon.svg";

// ---------- icons (Lucide, 24 px grid) ----------
const P = {
  droplet: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
  bars: '<path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/>',
  gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
  sliders: '<path d="M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3M14 2v4M8 10v4M16 18v4"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  bell: '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  back: '<path d="m15 18-6-6 6-6"/>',
  next: '<path d="m9 18 6-6-6-6"/>',
  close: '<path d="M18 6 6 18M6 6l12 12"/>',
  plus: '<path d="M5 12h14M12 5v14"/>',
  sparkle: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/>',
  wifiOff: '<path d="M12 20h.01M8.5 16.429a5 5 0 0 1 7 0M5 12.859a10 10 0 0 1 5.17-2.69M19 12.859a10 10 0 0 0-2.007-1.523M2 8.82a15 15 0 0 1 4.177-2.643M22 8.82a15 15 0 0 0-11.288-3.764M2 2l20 20"/>',
};
const ic = (n, s = 20, w = 2) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]}</svg>`;
const stopSq = (s = 14) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3" fill="currentColor"/></svg>`;

// ---------- shared pieces ----------
const statusBar = `<div class="sb"><span>9:41</span><span class="sb-r"><svg width="68" height="14" viewBox="0 0 68 14" fill="#f4f6fa" aria-hidden="true"><rect x="0" y="9" width="3.5" height="5" rx="1"/><rect x="5.5" y="6.5" width="3.5" height="7.5" rx="1"/><rect x="11" y="3.5" width="3.5" height="10.5" rx="1"/><rect x="16.5" y="0.5" width="3.5" height="13.5" rx="1"/><path d="M33 3.2c2.6 0 5 1 6.8 2.7l1.3-1.4C38.9 2.4 36 1.2 33 1.2s-5.9 1.2-8.1 3.3l1.3 1.4C28 4.2 30.4 3.2 33 3.2Zm0 4c1.5 0 2.9.6 3.9 1.5l1.4-1.4C36.9 6 35 5.2 33 5.2s-3.9.8-5.3 2.1l1.4 1.4c1-.9 2.4-1.5 3.9-1.5Zm0 4 2.2-2.2c-.6-.5-1.4-.8-2.2-.8s-1.6.3-2.2.8Z"/><rect x="45" y="1" width="20" height="12" rx="3.5" fill="none" stroke="#f4f6fa" stroke-opacity="0.45"/><rect x="47" y="3" width="16" height="8" rx="2"/><rect x="66" y="5" width="1.6" height="4" rx="0.8" fill-opacity="0.45"/></svg></span></div>`;
const homeBar = `<i class="hi"></i>`;
const circ = (inner, cls = "") => `<span class="circ${cls ? " " + cls : ""}">${inner}</span>`;
const back = circ(ic("back"));

// Fix 1: labels under the tab icons. Fix 3: the fifth button reads "Filling" and dims while the motor runs.
const TABS = [["home", "droplet", "Home"], ["usage", "bars", "Usage"], ["motor", "gauge", "Motor"], ["modes", "sliders", "Modes"]];
const tabBar = (active, running) => `<nav class="tb">${TABS.map(([k, i, l]) => `<span class="tb-i${k === active ? " on" : ""}"><b>${ic(i, 20)}</b><small>${l}</small></span>`).join("")}<span class="tb-i tb-fill${running ? " off" : ""}"><b>${ic("zap", 20)}</b><small>${running ? "Filling" : "Fill now"}</small></span></nav>`;

// Fix 10: one Stop style everywhere (dark red fill, red border, red label with a square).
const stopPill = (label = "Stop", cls = "") => `<span class="stop${cls ? " " + cls : ""}">${stopSq()}${label}</span>`;

// The tank. level and the two lines are percent; tone: water | low | stale.
const tank = (level, { h = 190, w = 92, tone = "water", labels = true, handles = false } = {}) => `
  <div class="tank tank--${tone}" style="width:${w}px;height:${h}px">
    <i class="tank-water" style="height:${level}%"></i>
    <i class="tank-line" style="bottom:90%"></i><i class="tank-line" style="bottom:25%"></i>
    ${labels ? `<em style="bottom:calc(90% - 22px)">MAX</em><em style="bottom:calc(25% - 22px)">MIN</em>` : ""}
    ${handles ? `<b class="tank-h tank-h--stop" style="bottom:90%"></b><b class="tank-h tank-h--start" style="bottom:25%"></b>` : ""}
  </div>`;

const toggle = (on) => `<span class="tg${on ? " on" : ""}"><i></i></span>`;
const seg = (sel) => `<div class="seg">${[["Automatic", ""], ["Manual", ""], ["Smart", ic("sparkle", 14)]].map(([l, i]) => `<span${l === sel ? ' class="on"' : ""}>${i}${l}</span>`).join("")}</div>`;
const weekBars = (vals, hi) => `<div class="wk">${vals.map((v, i) => `<i${i === hi ? ' class="hi-b"' : ""} style="height:${v}%"></i>`).join("")}</div>`;

// Top of Home. Fix 11: the blue app icon replaces the lime drop.
const homeTop = `<div class="top"><img class="appmark" src="${ICON}" alt="" width="40" height="40" /><span class="top-r">${circ(ic("bell", 19), "dot")}${circ(ic("menu", 19))}</span></div>`;
const chips = `<div class="chips"><span class="chip on"><i></i>Overhead</span><span class="chip"><i class="lime"></i>Sump</span><span class="chip sq">${ic("plus", 16)}</span></div>`;

// Fix 8: how fresh the reading is.
const fresh = (stale, text) => `<p class="fresh${stale ? " stale" : ""}"><i></i>${text}</p>`;

const tankCard = ({ tone = "water", pct = "78", stale = false, freshText = "Live · updated 9:41", status = true, h = 190 } = {}) => `
  <section class="card tank-card">
    ${chips}
    <div class="tank-row">
      ${tank(78, { tone, h })}
      <div class="tank-num">
        <p class="big${stale ? " dim" : ""}">${pct}<small>%</small></p>
        <p class="sub">1,560 of 2,000 L</p>
        ${fresh(stale, freshText)}
        ${status ? `<span class="pill-blue"><i></i>Filling · 12 min left</span>` : ""}
      </div>
    </div>
  </section>`;

// Fixes 2 and 10: the lime motor card keeps its look; Stop is a labelled pill in the one Stop style.
const motorCard = `
  <section class="card lime motor">
    <div>
      <p class="mk"><i></i>Motor running · Automatic</p>
      <p class="timer">04:12</p>
      <p class="msub">0.75 kW · 4.2 units saved this week</p>
    </div>
    ${stopPill()}
  </section>`;

const weekCard = `
  <section class="card week">
    <div class="week-h"><div><p class="mk mk--muted"><i></i>This week</p><p class="wk-n">1,240 <small>L</small></p></div>${circ(ic("next", 18), "sm")}</div>
    ${weekBars([34, 52, 22, 64, 40, 100, 30], 5)}
  </section>`;

// ---------- the screens ----------
const S = {};

S.f1 = { title: "Home", note: "Fixes 1, 2, 3, 8, 10, 11", body: `
  ${statusBar}${homeTop}
  ${tankCard()}
  ${motorCard}
  ${weekCard}
  ${tabBar("home", true)}${homeBar}` };

S.f2 = { title: "Fill range", note: "Fixes 1, 12", body: `
  ${statusBar}<div class="top">${back}</div>
  <h1>Fill range</h1><p class="h-sub">Overhead tank</p>
  <section class="card range">
    ${tank(70, { h: 232, labels: false, handles: true })}
    <div class="range-v">
      <div><p class="k k--blue">STOP FILLING</p><p class="rv">90%<small>1,800 L</small></p></div>
      <div><p class="k k--low">START FILLING</p><p class="rv">25%<small>500 L</small></p><p class="hint">Drag either handle on the tank.</p></div>
    </div>
  </section>
  <section class="card">
    <h2>What this means</h2>
    <p class="body">The motor runs about 18 minutes each time, roughly twice a day. A narrower range keeps the tank fuller but runs the motor more often.</p>
  </section>
  <span class="btn lime-btn">Save range</span>
  ${tabBar("home", false)}${homeBar}` };

S.f3 = { title: "Motor", note: "Fixes 1, 3, 10", body: `
  ${statusBar}<div class="top">${back}</div>
  <h1>Motor</h1><p class="h-sub">Overhead tank</p>
  <section class="card lime run">
    <p class="mk"><i></i>RUNNING · AUTOMATIC</p>
    <p class="timer timer--xl">04:12</p>
    <p class="msub">of about 18 min</p>
    <span class="prog"><i style="width:23%"></i></span>
  </section>
  <div class="stats">${[["FLOW", "22", "L/min"], ["POWER", "0.75", "kW"], ["TODAY", "3", "runs"]].map(([k, n, u]) => `<section class="card st"><p class="k">${k}</p><p class="st-n">${n} <small>${u}</small></p></section>`).join("")}</div>
  <section class="card row"><div><h2>Dry-run protection</h2><p class="body sm">Cuts power if the sump runs empty</p></div>${toggle(true)}</section>
  ${stopPill("Stop motor", "stop--wide")}
  ${tabBar("motor", true)}${homeBar}` };

S.f4 = { title: "Modes · Automatic", note: "Fixes 1, 4, 7", body: `
  ${statusBar}<div class="top">${back}</div>
  <h1>Modes</h1>
  ${seg("Automatic")}
  <section class="card how">
    <p class="k k--lime">HOW AUTOMATIC WORKS</p>
    <ul>${[["Drops to 25%", "motor starts itself"], ["Reaches 90%", "motor cuts off itself"], ["Sensor goes quiet", "you get an alert"]].map(([a, b]) => `<li><b>${a}</b><span>${b}</span></li>`).join("")}</ul>
  </section>
  <section class="card row"><div><h2>Eco mode</h2><p class="body sm">Runs only in off-peak hours · 4.2 units saved</p></div>${toggle(true)}</section>
  <section class="card row"><div><h2 class="dim">Boost</h2><p class="body sm">Fills at maximum rate</p></div>${toggle(false)}</section>
  <section class="card row"><div><h2>Quiet hours</h2><p class="body sm">No motor between 9 PM and 1 AM</p></div>${toggle(true)}</section>
  ${tabBar("modes", false)}${homeBar}` };

S.f5 = { title: "Low water alert", note: "Fix 4", cls: "alert alert--low", body: `
  ${statusBar}<div class="top top--end">${circ(ic("close"))}</div>
  <span class="tag tag--low"><i></i>MANUAL MODE · 6:42 AM</span>
  <div class="center">${tank(22, { h: 212, w: 96, tone: "low" })}</div>
  <h1 class="c">Water is low</h1>
  <p class="body c">Overhead tank is at 22%. The motor is off.</p>
  <div class="actions">
    <span class="btn lime-btn">Start motor</span>
    <span class="btn dark-btn">Remind me in 15 minutes</span>
    <span class="link">Switch to Automatic so this happens on its own</span>
  </div>
  ${homeBar}` };

// Fix 5: every run says what it cost and what started it (minutes x 0.75 kW x ₹8 a unit).
const RUNS = [
  ["Today, 6:42 AM", "18 min · 720 L · ₹1.80", "Started at 25%", "AUTO"],
  ["Yesterday, 7:10 PM", "12 min · 480 L · ₹1.20", "Started from the unit", "MANUAL"],
  ["Monday, 6:38 AM", "21 min · 840 L · ₹2.10", "Started at 25%", "AUTO"],
];
S.f6 = { title: "Usage", note: "Fixes 1, 5", body: `
  ${statusBar}
  <h1 class="h1-top">Usage</h1>
  <div class="chips chips--range"><span class="chip on">Week</span><span class="chip">Month</span><span class="chip">Year</span></div>
  <section class="card use">
    <div class="use-h"><div><p class="k">WATER USED</p><p class="use-n">1,240 <small class="blue">L</small></p></div><div class="r"><p class="k">ELECTRICITY</p><p class="use-n">8.4 <small class="lime-t">units</small></p></div></div>
    <div class="ch">${[44, 62, 30, 72, 50, 96, 40].map((v, i) => `<span${i === 5 ? ' class="on"' : ""}><i style="height:${v}%"></i></span>`).join("")}</div>
    <div class="ch-l">${["M", "T", "W", "T", "F", "S", "S"].map((d, i) => `<span${i === 5 ? ' class="on"' : ""}>${d}</span>`).join("")}</div>
  </section>
  <p class="k sec">RECENT MOTOR RUNS</p>
  ${RUNS.map(([t, a, b, tag]) => `<section class="card runrow"><div><h3>${t}</h3><p class="body sm">${a}</p><p class="body sm">${b}</p></div><span class="rt rt--${tag === "AUTO" ? "auto" : "man"}">${tag}</span></section>`).join("")}
  ${tabBar("usage", false)}${homeBar}` };

S.f7 = { title: "Modes · Smart", note: "Fixes 1, 4, 7", body: `
  ${statusBar}<div class="top">${back}</div>
  <h1>Modes</h1>
  ${seg("Smart")}
  <section class="card pred">
    <p class="k k--lime">${ic("sparkle", 13)} PREDICTION</p>
    <p class="body">You’ll reach 25% at</p>
    <p class="pred-t">4:10 PM tomorrow</p>
    <span class="ltag">LEARNED FROM 34 DAYS · 92% CONFIDENT</span>
  </section>
  <section class="card plan">
    <p class="k">TONIGHT’S PLAN</p>
    <div class="plan-r"><div><h2>Fill 01:40 – 02:05</h2><p class="body sm">Off-peak tariff · after quiet hours</p></div><span class="ltag">SAVES 38%</span></div>
    <p class="why">Why this time? ${ic("next", 16)}</p>
  </section>
  <section class="card row"><div><h2>Let Smart shift fill times</h2><p class="body sm">Never during your quiet hours</p></div>${toggle(true)}</section>
  ${tabBar("modes", false)}${homeBar}` };

// Fix 6: the installed kit has no inlet valve, so the alert offers what it can do.
const leakChart = `<svg viewBox="0 0 300 120" width="100%" aria-hidden="true"><path d="M4 22 H296" stroke="#626a77" stroke-width="2" stroke-dasharray="7 6" fill="none"/><path d="M4 22 C70 24 110 34 160 52 S250 82 296 92" stroke="#ff4d5e" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`;
S.f8 = { title: "Possible leak", note: "Fixes 6, 12", cls: "alert alert--crit", body: `
  ${statusBar}<div class="top top--end">${circ(ic("close"))}</div>
  <span class="tag tag--crit">${ic("sparkle", 13)}SMART NOTICED · 5:04 AM</span>
  <h1 class="c">Possible leak</h1>
  <p class="body c">The tank lost 42 L overnight while every tap was closed.</p>
  <section class="card chart">
    <p class="k">WHAT SMART SAW</p>
    <div class="chart-w"><span class="lbl lbl--exp">Expected</span>${leakChart}<span class="lbl lbl--act">Actual</span><span class="delta">−42 L</span></div>
    <div class="chart-t"><span>1:00 AM</span><span>5:00 AM</span></div>
  </section>
  <div class="actions">
    <span class="btn lime-btn">Pause automatic filling</span>
    <span class="btn dark-btn">That was us</span>
    <p class="hint c">Ignoring teaches Smart your household’s pattern</p>
  </div>
  ${homeBar}` };

// Fix 9: the two edge states, as variants of Home.
S.f9 = { title: "Sensor not reporting", note: "Fixes 8, 9", body: `
  ${statusBar}${homeTop}
  ${tankCard({ tone: "stale", stale: true, freshText: "Last reading 2 h ago", status: false, h: 160 })}
  <section class="card banner banner--low">
    <p class="ban-h">${ic("alert", 18)}Sensor not reporting</p>
    <p class="body sm">The tank sensor hasn’t sent a reading since 7:40 AM. Automatic won’t start the motor until it’s back.</p>
    <div class="ban-a"><span class="btn lime-btn sm">Check sensor</span><span class="btn dark-btn sm">Start motor</span></div>
    <p class="hint">The unit’s dry run and thermal cut-offs still protect the motor.</p>
  </section>
  ${tabBar("home", false)}${homeBar}` };

S.f10 = { title: "No internet", note: "Fixes 8, 9", body: `
  ${statusBar}
  <p class="offline">${ic("wifiOff", 14)}Offline · last update 9:12 AM</p>
  ${homeTop}
  ${tankCard({ tone: "stale", stale: true, freshText: "Last update 9:12 AM", status: false, h: 140 })}
  <section class="card banner">
    <p class="ban-h">${ic("wifiOff", 18)}No internet</p>
    <p class="body sm">The unit runs on its own: Automatic and the safety cut-offs don’t need internet. On home Wi‑Fi, Stop still works.</p>
  </section>
  ${motorCard}
  ${tabBar("home", true)}${homeBar}` };

// ---------- styles ----------
const css = `
*{box-sizing:border-box;margin:0;padding:0}
html{-webkit-font-smoothing:antialiased}
body{background:#1b1d22;color:#f4f6fa;font-family:Archivo,system-ui,sans-serif;padding:40px;display:flex;flex-wrap:wrap;gap:48px 40px}
.cell{width:360px;display:flex;flex-direction:column;gap:10px}
.cell > p{font:600 14px/1.3 Archivo;color:#f4f6fa}.cell > p small{display:block;font-weight:500;color:#99a1ae}
body:has(.scr:target){padding:0;background:#09090b;display:block}
body:has(.scr:target) .cell{display:none}
body:has(.scr:target) .cell:has(.scr:target){display:block}
body:has(.scr:target) .cell > p{display:none}
.scr{position:relative;width:360px;height:779px;overflow:hidden;background:#09090b;padding:0 18px;display:flex;flex-direction:column;gap:10px}
.alert--low{background:radial-gradient(90% 50% at 50% 36%,rgba(255,165,61,.16),transparent 70%),#09090b}
.alert--crit{background:radial-gradient(90% 40% at 50% 20%,rgba(255,77,94,.14),transparent 70%),#09090b}
.sb{flex:none;height:50px;margin:0 -4px -10px;display:flex;align-items:center;justify-content:space-between;padding:4px 8px 0 14px;font:600 16px Archivo}
.hi{position:absolute;left:50%;bottom:8px;width:124px;height:5px;margin-left:-62px;border-radius:3px;background:#f4f6fa}
.top{flex:none;display:flex;align-items:center;justify-content:space-between;height:52px}
.top--end{justify-content:flex-end}
.top-r{display:flex;gap:8px}
.appmark{width:40px;height:40px;border-radius:11px}
.circ{position:relative;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:#15171c;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08);color:#f4f6fa}
.circ.sm{width:34px;height:34px}
.circ.dot::after{content:"";position:absolute;top:9px;right:9px;width:7px;height:7px;border-radius:50%;background:#f4f6fa;box-shadow:0 0 0 2px #15171c}
h1{font:700 27px/1.15 Archivo;letter-spacing:-.02em}
.h1-top{margin-top:10px}
.h-sub{font:400 15px/1.3 Archivo;color:#99a1ae;margin-top:-6px}
h2{font:600 17px/1.3 Archivo}
h3{font:600 17px/1.3 Archivo}
.dim{color:#99a1ae}
.c{text-align:center}
.body{font:400 15px/1.45 Archivo;color:#99a1ae}
.body.sm{font-size:14px;line-height:1.4}
.k{font:600 12px/1.2 Archivo;letter-spacing:.03em;color:#99a1ae;display:flex;align-items:center;gap:6px}
.k--lime{color:#cbf848}.k--blue{color:#8fb0ff}.k--low{color:#ffa53d}
.card{flex:none;background:#131519;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08);border-radius:18px;padding:15px}
.row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 15px}
.row h2{margin-bottom:2px}
.lime{background:#cbf848;box-shadow:none;color:#0d0e11}
.mk{font:500 14px/1.2 Archivo;display:flex;align-items:center;gap:7px}
.mk i{width:7px;height:7px;border-radius:50%;background:#0d0e11}
.mk--muted{color:#99a1ae}.mk--muted i{background:#626a77}
/* tank */
.tank{position:relative;flex:none;border-radius:24px;overflow:hidden;background:#1d2a4d}
.tank-water{position:absolute;left:0;right:0;bottom:0;background:linear-gradient(#5b8bff,#1f47c8)}
.tank-line{position:absolute;left:0;right:0;height:2px;background:#f4f6fa;opacity:.9}
.tank em{position:absolute;left:12px;font:600 10px/1 Archivo;font-style:normal;letter-spacing:.06em;color:#f4f6fa}
.tank--low{background:linear-gradient(#232630 20%,#7a5230 85%);box-shadow:inset 0 0 0 2px rgba(255,165,61,.55)}
.tank--stale{background:#20232a}.tank--stale .tank-water{background:linear-gradient(#5a606b,#3a3f48)}.tank--stale .tank-line{opacity:.45}
.tank-h{position:absolute;left:50%;width:24px;height:24px;margin:0 0 -12px -12px;border-radius:50%;background:#0d0e11;border:4px solid}
.tank-h::after{content:"";position:absolute;inset:-16px;border-radius:50%}
.tank-h--stop{border-color:#2f6bff}.tank-h--start{border-color:#ffa53d}
/* home */
.chips{display:flex;gap:8px;margin-bottom:14px}
.chip{display:inline-flex;align-items:center;gap:7px;height:30px;padding:0 14px;border-radius:15px;background:#1d2026;font:500 14px/1 Archivo;color:#99a1ae}
.chip i{width:7px;height:7px;border-radius:50%;background:#0d0e11}
.chip i.lime{background:#cbf848}
.chip.on{background:#f4f6fa;color:#0d0e11}
.chip.sq{width:30px;padding:0;justify-content:center}
.chips--range{margin:2px 0 4px}
.chips--range .chip{height:34px;padding:0 16px;border-radius:17px}
.tank-row{display:flex;gap:18px;align-items:center}
.tank-num{display:flex;flex-direction:column;gap:6px;min-width:0}
.big{font:700 60px/.95 Archivo;letter-spacing:-.04em}.big small{font-size:28px;margin-left:4px;letter-spacing:0}
.big.dim{color:#99a1ae}
.sub{font:400 16px/1.2 Archivo;color:#99a1ae}
.fresh{display:flex;align-items:center;gap:6px;font:500 13px/1.25 Archivo;color:#99a1ae}
.fresh i{flex:none;width:6px;height:6px;border-radius:50%;background:#2f6bff}
.fresh.stale{color:#ffa53d}.fresh.stale i{background:#ffa53d}
.pill-blue{align-self:flex-start;margin-top:4px;display:inline-flex;align-items:center;gap:7px;height:32px;padding:0 13px;border-radius:16px;background:#14203f;box-shadow:inset 0 0 0 1.5px #2f6bff;font:500 14px/1 Archivo;color:#f4f6fa}
.pill-blue i{width:7px;height:7px;border-radius:50%;background:#cbf848}
.motor{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:15px 15px 14px 17px}
.timer{font:700 40px/1.05 Archivo;letter-spacing:-.03em;margin:6px 0 4px}
.timer--xl{font-size:60px;margin:8px 0 2px}
.msub{font:400 13px/1.3 Archivo;color:rgba(13,14,17,.62)}
.stop{flex:none;display:inline-flex;align-items:center;justify-content:center;gap:8px;height:56px;padding:0 20px;border-radius:28px;background:#2a1416;box-shadow:inset 0 0 0 2px #ff4d5e;color:#ff4d5e;font:600 17px/1 Archivo}
.stop--wide{width:100%}
.week-h{display:flex;justify-content:space-between;align-items:flex-start}
.wk-n{font:700 32px/1.1 Archivo;letter-spacing:-.03em;margin-top:6px}.wk-n small{font-size:18px;color:#99a1ae;font-weight:600}
.wk{display:flex;align-items:flex-end;justify-content:space-between;height:30px;margin-top:10px}
.wk i{width:24px;min-height:9px;border-radius:7px;background:#2a2d34}
.wk i.hi-b{background:#2f6bff}
/* tab bar */
.tb{position:absolute;left:16px;right:16px;bottom:24px;display:flex;justify-content:space-between}
.tb-i{display:flex;flex-direction:column;align-items:center;gap:6px;width:58px}
.tb-i b{width:50px;height:50px;border-radius:50%;display:grid;place-items:center;background:#15171c;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08);color:#99a1ae}
.tb-i small{font:500 12px/1 Archivo;color:#99a1ae}
.tb-i.on b{background:#f4f6fa;color:#0d0e11;box-shadow:none}.tb-i.on small{color:#f4f6fa}
.tb-fill b{background:#cbf848;color:#0d0e11;box-shadow:none}.tb-fill small{color:#f4f6fa}
.tb-fill.off{opacity:.4}
/* fill range */
.range{display:flex;gap:20px;align-items:stretch}
.range-v{display:flex;flex-direction:column;justify-content:space-between;padding:4px 0}
.rv{font:700 40px/1.1 Archivo;letter-spacing:-.03em;margin-top:4px;display:flex;align-items:baseline;gap:10px}
.rv small{font:500 15px/1 Archivo;color:#99a1ae;letter-spacing:0}
.hint{font:400 13px/1.4 Archivo;color:#99a1ae;margin-top:8px}
.card h2 + .body{margin-top:6px}
.btn{flex:none;display:flex;align-items:center;justify-content:center;height:56px;border-radius:28px;font:600 17px/1 Archivo}
.btn.sm{height:48px;font-size:15px;padding:0 16px}
.lime-btn{background:#cbf848;color:#0d0e11}
.dark-btn{background:#1d2026;color:#f4f6fa}
.link{display:flex;align-items:center;justify-content:center;height:48px;font:500 15px/1.3 Archivo;color:#cbf848;text-align:center}
/* motor */
.run{padding:17px}
.prog{display:block;height:8px;border-radius:4px;background:rgba(13,14,17,.16);margin-top:14px;overflow:hidden}
.prog i{display:block;height:100%;border-radius:4px;background:#0d0e11}
.stats{flex:none;display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.st{padding:13px}
.st-n{font:600 20px/1.2 Archivo;margin-top:8px}.st-n small{font-size:12px;color:#99a1ae;font-weight:500}
.tg{flex:none;width:52px;height:30px;border-radius:15px;background:#2a2d34;position:relative}
.tg i{position:absolute;top:3px;left:3px;width:24px;height:24px;border-radius:50%;background:#f4f6fa}
.tg.on{background:#cbf848}.tg.on i{left:25px;background:#0d0e11}
/* modes */
.seg{flex:none;display:grid;grid-template-columns:repeat(3,1fr);gap:4px;padding:4px;border-radius:26px;background:#131519;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08)}
.seg span{display:flex;align-items:center;justify-content:center;gap:5px;height:44px;border-radius:22px;font:600 16px/1 Archivo;color:#99a1ae}
.seg span.on{background:#cbf848;color:#0d0e11}
.how ul{list-style:none;display:flex;flex-direction:column;gap:9px;margin-top:11px}
.how li{display:flex;align-items:baseline;gap:8px}
.how li::before{content:"";flex:none;width:7px;height:7px;border-radius:50%;background:#cbf848;transform:translateY(-2px)}
.how b{font:600 17px/1.2 Archivo}.how span{font:400 14px/1.2 Archivo;color:#99a1ae}
/* alerts */
.tag{align-self:center;display:inline-flex;align-items:center;gap:7px;height:32px;padding:0 15px;border-radius:16px;font:600 13px/1 Archivo;letter-spacing:.02em}
.tag i{width:7px;height:7px;border-radius:50%;background:currentColor}
.tag--low{color:#ffa53d;background:rgba(255,165,61,.12);box-shadow:inset 0 0 0 1.5px rgba(255,165,61,.5)}
.tag--crit{color:#ff6b79;background:rgba(255,77,94,.12);box-shadow:inset 0 0 0 1.5px rgba(255,77,94,.5)}
.center{display:flex;justify-content:center;margin:14px 0 8px}
.alert h1{margin-top:6px}
.alert--crit h1{margin-top:14px}
.actions{position:absolute;left:18px;right:18px;bottom:44px;display:flex;flex-direction:column;gap:10px}
.chart{margin-top:10px;padding:16px}
.chart-w{position:relative;margin-top:14px}
.lbl{position:absolute;font:500 12px/1 Archivo}
.lbl--exp{right:4px;top:-2px;color:#99a1ae}
.lbl--act{right:4px;bottom:-8px;color:#ff6b79}
.delta{position:absolute;left:44%;top:52%;padding:5px 10px;border-radius:12px;background:#3a1a1e;font:600 12px/1 Archivo;color:#f4f6fa}
.chart-t{display:flex;justify-content:space-between;margin-top:14px;font:500 12px/1 Archivo;color:#99a1ae}
/* usage */
.use{padding:16px}
.use-h{display:flex;justify-content:space-between}.use-h .r{text-align:right}.use-h .r .k{justify-content:flex-end}
.use-n{font:700 30px/1.1 Archivo;letter-spacing:-.03em;margin-top:6px}.use-n small{font-size:20px}
.blue{color:#5b8bff}.lime-t{color:#cbf848}
.ch{display:flex;justify-content:space-between;height:78px;margin-top:12px}
.ch span{width:30px;border-radius:9px;background:#1d2026;display:flex;align-items:flex-end;overflow:hidden}
.ch i{display:block;width:100%;border-radius:9px;background:#2848b4}
.ch span.on i{background:#5b8bff}
.ch-l{display:flex;justify-content:space-between;margin-top:8px}
.ch-l span{width:30px;text-align:center;font:500 12px/1 Archivo;color:#99a1ae}.ch-l span.on{color:#f4f6fa}
.sec{margin:6px 0 -2px}
.runrow{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 15px}
.runrow h3{font-size:16px;margin-bottom:3px}
.rt{flex:none;padding:6px 10px;border-radius:12px;font:600 12px/1 Archivo;letter-spacing:.03em}
.rt--auto{background:rgba(203,248,72,.14);color:#cbf848}.rt--man{background:rgba(255,165,61,.14);color:#ffa53d}
/* smart */
.pred{box-shadow:inset 0 0 0 1.5px rgba(203,248,72,.45);padding:16px}
.pred .body{margin-top:12px;font-size:15px}
.pred-t{font:700 33px/1.1 Archivo;letter-spacing:-.03em;margin:2px 0 12px}
.ltag{display:inline-flex;align-items:center;height:28px;padding:0 11px;border-radius:14px;background:rgba(203,248,72,.12);color:#cbf848;font:600 11px/1 Archivo;letter-spacing:.04em}
.plan{padding:16px}
.plan-r{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:10px}
.plan-r h2{font-size:19px}
.why{display:flex;justify-content:space-between;align-items:center;margin-top:14px;padding-top:12px;box-shadow:inset 0 1px 0 rgba(255,255,255,.08);font:500 15px/1 Archivo;color:#cbf848}
/* edge states */
.banner{padding:16px;display:flex;flex-direction:column;gap:8px}
.banner--low{box-shadow:inset 0 0 0 1.5px rgba(255,165,61,.45)}
.ban-h{display:flex;align-items:center;gap:8px;font:600 17px/1.2 Archivo}
.banner--low .ban-h svg{color:#ffa53d}
.ban-a{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:4px}
.banner .hint{margin-top:0}
.offline{flex:none;display:flex;align-items:center;justify-content:center;gap:7px;height:28px;margin:4px -18px -6px;background:#1d2026;font:500 13px/1 Archivo;color:#99a1ae}
`;

// ---------- write the board ----------
const ORDER = ["f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "f10"];
// build-h2o.js reuses the screens for the walkthrough film, so the board and the renders
// only happen when this file is run directly.
module.exports = { S, css, ORDER, ICON };
if (require.main === module) {
  const html = `<!doctype html>
  <html lang="en"><head><meta charset="utf-8" />
  <title>H2o Connect · app screens</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>${css}</style></head>
  <body>
  ${ORDER.map((k) => `<div class="cell"><p>${S[k].title} · screen-${k}<small>${S[k].note}</small></p><div class="scr${S[k].cls ? " " + S[k].cls : ""}" id="${k}">${S[k].body}</div></div>`).join("\n")}
  </body></html>`;
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, "index.html"), html);
  console.log("wrote", path.relative(SITE, path.join(OUT, "index.html")), "with", ORDER.length, "screens");

  // ---------- render ----------
  if (process.argv.includes("--render")) {
    const browsers = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"];
    const exe = browsers.find((b) => fs.existsSync(b));
    if (!exe) throw new Error("No Chrome or Edge found to render with");
    const prof = path.join(require("os").tmpdir(), "h2o-screens-profile");
    const url = "file:///" + path.join(OUT, "index.html").replace(/\\/g, "/");
    const shot = (id, file, scale) => execFileSync(exe, ["--headless=new", "--disable-gpu", "--hide-scrollbars", `--user-data-dir=${prof}`,
      "--window-size=360,779", `--force-device-scale-factor=${scale}`, "--virtual-time-budget=4000", `--screenshot=${path.join(SITE, "assets/h2o", file)}`, `${url}#${id}`], { stdio: "ignore" });
    ORDER.forEach((k) => { shot(k, `screen-${k}.jpg`, 2); console.log("  rendered screen-" + k + ".jpg"); });
    // The hero shows three of them at their own sizes.
    [["f1", "cover-home.webp", 789 / 360], ["f7", "cover-smart.webp", 644 / 360], ["f8", "cover-leak.webp", 644 / 360]].forEach(([k, f, s]) => { shot(k, f, s); console.log("  rendered " + f); });
  }
}
