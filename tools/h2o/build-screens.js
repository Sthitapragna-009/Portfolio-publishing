// Builds the H2o Connect app screens as HTML, then renders them to the images the
// case study uses. v2 is a full redesign on one small system (below); the content, features
// and numbers are the ones from tools/h2o/app-fix-spec.md.
//
//   node tools/h2o/build-screens.js            writes tools/h2o/screens/index.html (all screens on one board)
//   node tools/h2o/build-screens.js --render   also renders each screen into assets/h2o/
//
// Each screen is 360 x 779 CSS px; rendered at 2x it is 720 x 1558, the size the case study expects.
//
// The system:
// - Two surfaces: the ground and one raised tone. No outlines, no card inside a card.
// - Chalk for text and the main button. Water blue for the tank. Lime only while the motor runs:
//   the motor panel and the Stop inside it. Orange marks low or stale, red marks a leak.
// - Archivo in five sizes: 64 (the one number), 28 (titles), 17, 15 and 13. Sentence case.
// - Four plain tabs. Starting and stopping the motor lives on the motor panel, not in the tab bar.
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
  bell: '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>',
  back: '<path d="m15 18-6-6 6-6"/>',
  next: '<path d="m9 18 6-6-6-6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  close: '<path d="M18 6 6 18M6 6l12 12"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/>',
  wifiOff: '<path d="M12 20h.01M8.5 16.429a5 5 0 0 1 7 0M5 12.859a10 10 0 0 1 5.17-2.69M19 12.859a10 10 0 0 0-2.007-1.523M2 8.82a15 15 0 0 1 4.177-2.643M22 8.82a15 15 0 0 0-11.288-3.764M2 2l20 20"/>',
};
const ic = (n, s = 22, w = 2) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]}</svg>`;
const stopSq = `<svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4" fill="currentColor"/></svg>`;

// ---------- shared pieces ----------
const statusBar = `<div class="sb"><span>9:41</span><svg width="68" height="14" viewBox="0 0 68 14" fill="currentColor" aria-hidden="true"><rect x="0" y="9" width="3.5" height="5" rx="1"/><rect x="5.5" y="6.5" width="3.5" height="7.5" rx="1"/><rect x="11" y="3.5" width="3.5" height="10.5" rx="1"/><rect x="16.5" y="0.5" width="3.5" height="13.5" rx="1"/><path d="M33 3.2c2.6 0 5 1 6.8 2.7l1.3-1.4C38.9 2.4 36 1.2 33 1.2s-5.9 1.2-8.1 3.3l1.3 1.4C28 4.2 30.4 3.2 33 3.2Zm0 4c1.5 0 2.9.6 3.9 1.5l1.4-1.4C36.9 6 35 5.2 33 5.2s-3.9.8-5.3 2.1l1.4 1.4c1-.9 2.4-1.5 3.9-1.5Zm0 4 2.2-2.2c-.6-.5-1.4-.8-2.2-.8s-1.6.3-2.2.8Z"/><rect x="45" y="1" width="20" height="12" rx="3.5" fill="none" stroke="currentColor" stroke-opacity="0.45"/><rect x="47" y="3" width="16" height="8" rx="2"/><rect x="66" y="5" width="1.6" height="4" rx="0.8" fill-opacity="0.45"/></svg></div>`;
const homeBar = `<i class="hi"></i>`;

const TABS = [["home", "droplet", "Home"], ["usage", "bars", "Usage"], ["motor", "gauge", "Motor"], ["modes", "sliders", "Modes"]];
const tabBar = (active) => `<nav class="tb">${TABS.map(([k, i, l]) => `<span class="tb-i${k === active ? " on" : ""}">${ic(i, 24)}<small>${l}</small></span>`).join("")}</nav>${homeBar}`;

// Headers: a title with its context line; a back chevron on pushed screens.
const header = (title, ctx, { back = false, bell = false, tankPicker = false } = {}) => `
  <header class="hd">
    ${back ? `<span class="hd-back">${ic("back", 24)}</span>` : ""}
    <div class="hd-t">
      <div class="h28 sh1" role="heading" aria-level="3">${title}</div>
      ${ctx ? `<p class="ctx">${ctx}${tankPicker ? ic("down", 18) : ""}</p>` : ""}
    </div>
    ${bell ? `<span class="ib dot">${ic("bell", 22)}</span>` : ""}
  </header>`;

// The tank. level and lines are percent; tone: water | low | stale.
const tank = (level, { w = 116, h = 290, tone = "water", lines = true } = {}) => `
  <div class="tank tank--${tone}" style="width:${w}px;height:${h}px">
    <i class="tank-water" style="height:${level}%"></i>
    ${lines ? `<i class="tank-line" style="bottom:90%"></i><i class="tank-line" style="bottom:25%"></i>` : ""}
  </div>`;

const toggle = (on) => `<span class="tg${on ? " on" : ""}"><i></i></span>`;
const seg = (items, sel) => `<div class="seg">${items.map((l) => `<span${l === sel ? ' class="on"' : ""}>${l}</span>`).join("")}</div>`;
const stopPill = (label = "Stop", cls = "") => `<span class="stop${cls ? " " + cls : ""}">${stopSq}${label}</span>`;

// Home's hero: the tank and what it says. stale greys the water and the number.
const hero = ({ stale = false, fresh = "Live · updated 9:41", eta = "Full in 12 min", h = 290 } = {}) => `
  <section class="hero">
    ${tank(78, { tone: stale ? "stale" : "water", h })}
    <div class="read">
      <p class="num${stale ? " dim" : ""}">78<small>%</small></p>
      <p class="lead">1,560 of 2,000 L</p>
      ${eta ? `<p class="sub">${eta}</p>` : ""}
      <p class="meta fresh${stale ? " stale" : ""}"><i></i>${fresh}</p>
    </div>
  </section>`;

// The motor panel: the only lime on the app, there while the motor runs, with Stop inside it.
const motorPanel = `
  <section class="motor">
    <div><p class="lead">Motor running</p><p class="m-sub">Automatic · <span class="timer">04:12</span></p></div>
    ${stopPill()}
  </section>`;

const weekRow = `
  <section class="row">
    <div><p class="sub">This week</p><p class="lead">1,240 L used</p></div>
    <span class="spark">${[34, 52, 22, 64, 40, 100, 30].map((v, i) => `<i${i === 5 ? ' class="on"' : ""} style="height:${Math.max(18, v)}%"></i>`).join("")}</span>
    ${ic("next", 20)}
  </section>`;

const grp = (rows) => `<section class="grp">${rows.map(([t, s, on]) => `<div class="grp-r"><div><p class="lead">${t}</p><p class="sub">${s}</p></div>${toggle(on)}</div>`).join("")}</section>`;

// ---------- the screens ----------
const S = {};

S.f1 = { title: "Home", note: "The tank first, the motor second", body: `
  ${statusBar}
  ${header("Overhead tank", "Home · 2 tanks", { bell: true, tankPicker: true })}
  ${hero()}
  ${motorPanel}
  ${weekRow}
  ${tabBar("home")}` };

// Labels sit beside each handle, at its height, so the drag explains itself.
const RANGE_H = 380;
const handleY = (p) => Math.round(RANGE_H * (1 - p / 100));
S.f2 = { title: "Fill range", note: "Both levels set on the tank", body: `
  ${statusBar}
  ${header("Fill range", "Overhead tank", { back: true })}
  <section class="range" style="height:${RANGE_H}px">
    ${tank(70, { w: 150, h: RANGE_H, lines: false })}
    <span class="hdl" style="top:${handleY(90)}px"><i></i></span>
    <span class="hdl" style="top:${handleY(25)}px"><i></i></span>
    <div class="hl" style="top:${handleY(90) - 24}px"><p class="meta">Stop at</p><p class="lead"><b class="rv">90%</b> · 1,800 L</p></div>
    <div class="hl" style="top:${handleY(25) - 24}px"><p class="meta">Start at</p><p class="lead"><b class="rv">25%</b> · 500 L</p></div>
  </section>
  <p class="sub">The motor will run about 18 minutes each time, roughly twice a day.</p>
  <span class="btn btn-p">Save range</span>
  ${tabBar("home")}` };

S.f3 = { title: "Motor", note: "Running, with Stop in the panel", body: `
  ${statusBar}
  ${header("Motor", "Overhead tank", { back: true })}
  <section class="motor motor--xl">
    <p class="lead">Running · Automatic</p>
    <p class="num timer">04:12</p>
    <p class="m-sub">of about 18 min</p>
    <span class="prog"><i style="width:23%"></i></span>
    ${stopPill("Stop motor", "stop--wide")}
  </section>
  <div class="stats">${[["22", "L/min", "Flow"], ["0.75", "kW", "Power"], ["3", "", "Runs today"]].map(([n, u, k]) => `<div><p class="h28">${n}${u ? `<small> ${u}</small>` : ""}</p><p class="meta">${k}</p></div>`).join("")}</div>
  ${grp([["Dry-run protection", "Cuts power if the sump runs empty", true]])}
  ${tabBar("motor")}` };

S.f4 = { title: "Modes · Automatic", note: "One tap between modes", body: `
  ${statusBar}
  ${header("Modes", "Overhead tank")}
  ${seg(["Automatic", "Manual", "Smart"], "Automatic")}
  <section class="how">
    <p class="lead">Keeps the tank between your two levels.</p>
    <dl>${[["Below 25%", "the motor starts"], ["At 90%", "the motor stops"], ["Sensor quiet", "you get an alert"]].map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join("")}</dl>
  </section>
  ${grp([["Eco mode", "Off-peak only · 4.2 units saved", true], ["Boost", "Fills at the maximum rate", false], ["Quiet hours", "No motor from 9 PM to 1 AM", true]])}
  ${tabBar("modes")}` };

S.f5 = { title: "Low water alert", note: "Warns, offers, never acts in Manual", cls: "alert", body: `
  ${statusBar}
  <header class="hd hd--end"><span class="ib">${ic("close", 24)}</span></header>
  <div class="center">${tank(22, { w: 124, h: 270, tone: "low" })}</div>
  <p class="meta c"><i class="dot dot--low"></i>Manual mode · 6:42 AM</p>
  <div class="h28 sh1 c" role="heading" aria-level="3">Water is low</div>
  <p class="sub c">The overhead tank is at 22%. The motor is off.</p>
  <div class="actions">
    <span class="btn btn-p">Start motor</span>
    <span class="btn btn-s">Remind me in 15 minutes</span>
    <span class="btn-t">Switch to Automatic so this happens on its own</span>
  </div>
  ${homeBar}` };

// Every run says what it cost and what started it (minutes x 0.75 kW x ₹8 a unit).
const RUNS = [
  ["Today, 6:42 AM", "18 min · 720 L · ₹1.80", "Started at 25%", "Auto"],
  ["Yesterday, 7:10 PM", "12 min · 480 L · ₹1.20", "Started from the unit", "Manual"],
  ["Monday, 6:38 AM", "21 min · 840 L · ₹2.10", "Started at 25%", "Auto"],
];
S.f6 = { title: "Usage", note: "A receipt for every run", body: `
  ${statusBar}
  ${header("Usage", "This week")}
  <section class="use">
    <p class="num">1,240<small> L</small></p>
    <p class="sub">and 8.4 units of electricity</p>
  </section>
  <div class="ch">${[44, 62, 30, 72, 50, 96, 40].map((v, i) => `<span${i === 5 ? ' class="on"' : ""}><i style="height:${v}%"></i><b>${"MTWTFSS"[i]}</b></span>`).join("")}</div>
  <p class="lead sec">Recent runs</p>
  <section class="grp">${RUNS.map(([t, a, b, tag]) => `<div class="grp-r run"><div><p class="lead">${t}</p><p class="sub">${a}</p><p class="sub">${b}</p></div><span class="meta">${tag}</span></div>`).join("")}</section>
  ${tabBar("usage")}` };

S.f7 = { title: "Modes · Smart", note: "Every prediction shows its evidence", body: `
  ${statusBar}
  ${header("Modes", "Overhead tank")}
  ${seg(["Automatic", "Manual", "Smart"], "Smart")}
  <section class="pred">
    <p class="sub">You’ll reach 25% at</p>
    <p class="h28 pred-t">4:10 PM tomorrow</p>
    <p class="meta">Learned from 34 days · 92% confident</p>
  </section>
  <section class="plan">
    <p class="meta">Tonight’s plan</p>
    <p class="lead">Fill 01:40 – 02:05</p>
    <p class="sub">Off-peak tariff, after quiet hours</p>
    <p class="meta">Saves 38% on tonight’s fill</p>
    <p class="why">Why this time? ${ic("next", 18)}</p>
  </section>
  ${grp([["Let Smart shift fill times", "Never during your quiet hours", true]])}
  ${tabBar("modes")}` };

// The installed kit has no inlet valve, so the alert offers what it can do.
const leakChart = `<svg viewBox="0 0 300 110" width="100%" aria-hidden="true"><path d="M4 18 H296" style="stroke:var(--ink-3)" stroke-width="2" stroke-dasharray="6 6" fill="none"/><path d="M4 18 C70 20 110 30 160 48 S250 78 296 88" stroke="#ff4d5e" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`;
S.f8 = { title: "Possible leak", note: "Evidence first, then two choices", cls: "alert", body: `
  ${statusBar}
  <header class="hd hd--end"><span class="ib">${ic("close", 24)}</span></header>
  <p class="meta"><i class="dot dot--crit"></i>Smart noticed · 5:04 AM</p>
  <div class="h28 sh1" role="heading" aria-level="3">Possible leak</div>
  <p class="sub">The tank lost 42 L overnight while every tap was closed.</p>
  <section class="chart">
    <div class="chart-w"><span class="lbl lbl--exp">Expected</span>${leakChart}<span class="lbl lbl--act">−42 L</span></div>
    <div class="chart-t"><span>1:00 AM</span><span>5:00 AM</span></div>
  </section>
  <div class="actions">
    <span class="btn btn-p">Pause automatic filling</span>
    <span class="btn btn-s">That was us</span>
    <p class="meta c">Either answer teaches Smart your household’s pattern.</p>
  </div>
  ${homeBar}` };

// The two edge states, as variants of Home.
S.f9 = { title: "Sensor not reporting", note: "Automatic holds off; the unit still protects the motor", body: `
  ${statusBar}
  ${header("Overhead tank", "Home · 2 tanks", { bell: true, tankPicker: true })}
  ${hero({ stale: true, fresh: "Last reading 2 h ago", eta: "", h: 240 })}
  <section class="note">
    <p class="lead">${ic("alert", 20)}Sensor not reporting</p>
    <p class="sub">No reading since 7:40 AM, so Automatic won’t start the motor. The unit’s dry-run and thermal cut-offs still protect it.</p>
    <div class="note-a"><span class="btn btn-p btn-sm">Check sensor</span><span class="btn btn-s btn-sm">Start motor</span></div>
  </section>
  ${tabBar("home")}` };

S.f10 = { title: "No internet", note: "The unit runs on its own; Stop works at home", body: `
  ${statusBar}
  <p class="offline">${ic("wifiOff", 16)}Offline · last update 9:12 AM</p>
  ${header("Overhead tank", "Home · 2 tanks", { bell: true, tankPicker: true })}
  ${hero({ stale: true, fresh: "Last update 9:12 AM", eta: "", h: 200 })}
  <section class="note note--plain">
    <p class="lead">${ic("wifiOff", 20)}No internet</p>
    <p class="sub">Automatic and the safety cut-offs run on the unit. On home Wi‑Fi you can still stop the motor.</p>
  </section>
  ${motorPanel}
  ${tabBar("home")}` };

// Settings, from the tank menu. Appearance follows the phone, or is fixed to dark or light.
const linkRows = (rows) => `<section class="grp">${rows.map(([t, s]) => `<div class="grp-r"><div><p class="lead">${t}</p>${s ? `<p class="sub">${s}</p>` : ""}</div>${ic("next", 20)}</div>`).join("")}</section>`;
const settings = (mode) => `
  ${statusBar}
  ${header("Settings", "Home · 2 tanks", { back: true })}
  <p class="meta grp-h">Appearance</p>
  ${seg(["System", "Dark", "Light"], mode)}
  <p class="sub">System matches your phone’s setting.</p>
  <p class="meta grp-h">Home</p>
  ${linkRows([["Tanks and sensors", "Overhead and sump"], ["Members", "Who can start and stop the motor"], ["Matter link", "Apple Home, Alexa, Google Home"], ["Language and text size", "English · follows your phone"]])}
  ${tabBar("home")}`;
S.f11 = { title: "Settings", note: "Appearance: system, dark or light", body: settings("Dark") };

// ---------- the component sheet (the case study's design system section) ----------
const dsCol = (label, inner, w) => `<div class="ds-c" style="width:${w}px"><div class="ds-x">${inner}</div><p class="meta">${label}</p></div>`;
const DS = [
  dsCol("Tank: water, low, stale", `<div class="ds-row">${tank(78, { w: 40, h: 104, lines: false })}${tank(22, { w: 40, h: 104, tone: "low", lines: false })}${tank(78, { w: 40, h: 104, tone: "stale", lines: false })}</div>`, 150),
  dsCol("Buttons: main, secondary", `<div class="ds-st"><span class="btn btn-p btn-sm">Save range</span><span class="btn btn-s btn-sm">That was us</span></div>`, 180),
  dsCol("Motor panel: only while it runs", motorPanel, 290),
  dsCol("Toggle", `<div class="ds-st ds-st--c">${toggle(true)}${toggle(false)}</div>`, 64),
  dsCol("Modes", seg(["Automatic", "Manual", "Smart"], "Automatic"), 260),
].join("");

// ---------- styles ----------
const css = `
*{box-sizing:border-box;margin:0;padding:0}
html{-webkit-font-smoothing:antialiased}
body{background:#1b1d22;color:#f4f2ec;font-family:Archivo,system-ui,sans-serif;padding:40px;display:flex;flex-wrap:wrap;gap:48px 40px}
.cell{width:360px;display:flex;flex-direction:column;gap:10px}
.cell > p{font:600 14px/1.3 Archivo;color:#f4f2ec}.cell > p small{display:block;font-weight:500;color:#a3a8b0}
body:has(:target){padding:0;background:#0a0b0d;display:block}
body:has(:target) .cell{display:none}
body:has(:target) .cell:has(:target){display:block}
body:has(:target) .cell > p{display:none}
/* Theme tokens. Dark is the default; .light is the light mode from Settings › Appearance.
   Lime, the Stop pill on it and the water blue are the same in both. */
.scr,.ds{--bg:#0a0b0d;--raised:#15171b;--raised-2:#1e2126;--ink:#f4f2ec;--ink-2:#a3a8b0;--ink-3:#80868f;--tank:#15171b;--track:#2a2d33;--knob-off:#a3a8b0;--bar:#111316;--spark:#2b3240;--col:#232a3a;--btn:#f4f2ec;--btn-ink:#0a0b0d;--low-ink:#ffa53d;--crit-ink:#ff6b79;--stale:#3a3f48}
.scr.light{--bg:#f3f2ee;--raised:#ffffff;--raised-2:#e7e5df;--ink:#0a0b0d;--ink-2:#5b616b;--ink-3:#6b717b;--tank:#e4e2dc;--track:#d4d2cc;--knob-off:#ffffff;--bar:#ffffff;--spark:#d3d7df;--col:#d9dee9;--btn:#0a0b0d;--btn-ink:#f4f2ec;--low-ink:#c2410c;--crit-ink:#c81e36;--stale:#b9bcc2}
.scr{position:relative;width:360px;height:779px;overflow:hidden;background:var(--bg);color:var(--ink);padding:0 20px;display:flex;flex-direction:column;gap:20px}
.sb{flex:none;height:50px;margin:0 -6px -20px;display:flex;align-items:center;justify-content:space-between;padding:4px 8px 0 14px;font:600 16px Archivo}
.hi{position:absolute;left:50%;bottom:8px;width:124px;height:5px;margin-left:-62px;border-radius:3px;background:var(--ink)}
/* type: five sizes */
h1,.h28{font:700 28px/1.12 Archivo;letter-spacing:-.02em}
.h28 small{font-size:15px;font-weight:500;letter-spacing:0;color:var(--ink-2)}
.num{font:700 64px/.95 Archivo;letter-spacing:-.045em;font-variant-numeric:tabular-nums}
.num small{font-size:28px;letter-spacing:-.02em;margin-left:2px}
.num.dim{color:var(--ink-3)}
.lead{font:600 17px/1.3 Archivo}
.sub{font:400 15px/1.45 Archivo;color:var(--ink-2)}
.meta{display:flex;align-items:center;gap:7px;font:500 13px/1.3 Archivo;color:var(--ink-2)}
.c{text-align:center;justify-content:center}
.dot{flex:none;width:8px;height:8px;border-radius:50%}
.dot--low{background:#ffa53d}.dot--crit{background:#ff4d5e}
/* header */
.hd{flex:none;display:flex;align-items:flex-start;gap:4px;padding-top:12px}
.hd--end{justify-content:flex-end}
.hd-t{flex:1;min-width:0}
.hd-back,.ib{flex:none;width:44px;height:44px;display:grid;place-items:center;color:var(--ink)}
.hd-back{margin:-6px 0 0 -12px}
.ib{margin:-6px -12px 0 0}
.ib.dot{position:relative;width:44px;height:44px;border-radius:0;background:none}
.ib.dot::after{content:"";position:absolute;top:10px;right:11px;width:8px;height:8px;border-radius:50%;background:var(--ink);box-shadow:0 0 0 2px var(--bg)}
.ctx{display:flex;align-items:center;gap:2px;margin-top:4px;font:500 15px/1.3 Archivo;color:var(--ink-2)}
/* tank */
.tank{position:relative;flex:none;border-radius:28px;overflow:hidden;background:var(--tank)}
.tank-water{position:absolute;left:0;right:0;bottom:0;background:#2f6bff}
.tank--low .tank-water{background:#ffa53d}
.tank--stale .tank-water{background:var(--stale)}
.tank-line{position:absolute;left:0;right:0;height:2px;background:color-mix(in srgb,var(--ink) 40%,transparent)}
/* home */
.hero{flex:none;display:flex;align-items:flex-end;gap:22px;margin-top:4px}
.read{display:flex;flex-direction:column;gap:6px;padding-bottom:4px;min-width:0}
.read .lead{margin-top:6px}
.fresh{margin-top:10px}
.fresh i{flex:none;width:8px;height:8px;border-radius:50%;background:#2f6bff}
.fresh.stale{color:var(--low-ink)}.fresh.stale i{background:#ffa53d}
.motor{flex:none;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 16px 16px 20px;border-radius:24px;background:#cbf848;color:#0a0b0d}
.m-sub{font:500 15px/1.35 Archivo;color:rgba(10,11,13,.66);margin-top:2px;font-variant-numeric:tabular-nums}
.stop{flex:none;display:inline-flex;align-items:center;justify-content:center;gap:9px;height:52px;padding:0 22px;border-radius:26px;background:#0a0b0d;color:#f4f2ec;font:600 17px/1 Archivo}
.stop svg{color:#ff4d5e}
.row{flex:none;display:flex;align-items:center;gap:16px;padding:14px 16px 14px 20px;border-radius:20px;background:var(--raised)}
.row > div{flex:1}
.row > svg{color:var(--ink-3)}
.spark{display:flex;align-items:flex-end;gap:4px;height:30px}
.spark i{width:6px;border-radius:3px;background:var(--spark)}
.spark i.on{background:#2f6bff}
/* tab bar */
.tb{position:absolute;left:0;right:0;bottom:0;height:88px;padding:12px 16px 0;background:var(--bar);display:flex;justify-content:space-around}
.tb-i{display:flex;flex-direction:column;align-items:center;gap:6px;width:72px;color:var(--ink-3)}
.tb-i small{font:500 12px/1 Archivo}
.tb-i.on{color:var(--ink)}
/* buttons */
.btn{flex:none;display:flex;align-items:center;justify-content:center;height:56px;padding:0 20px;border-radius:28px;font:600 17px/1 Archivo}
.btn-sm{height:48px;border-radius:24px;font-size:15px}
.btn-p{background:var(--btn);color:var(--btn-ink)}
.btn-s{background:var(--raised-2);color:var(--ink)}
.btn-t{display:flex;align-items:center;justify-content:center;min-height:44px;font:500 15px/1.35 Archivo;color:var(--ink);text-align:center;text-decoration:underline;text-underline-offset:4px;text-decoration-color:color-mix(in srgb,var(--ink) 45%,transparent)}
/* fill range */
.range{position:relative;flex:none;margin-top:4px}
.hdl{position:absolute;left:0;width:150px;height:0}
.hdl::before{content:"";position:absolute;left:0;right:0;top:-1px;height:2px;background:var(--ink)}
.hdl i{position:absolute;right:-16px;top:-16px;width:32px;height:32px;border-radius:50%;background:var(--ink);box-shadow:0 0 0 5px var(--bg)}
.hdl i::after{content:"";position:absolute;inset:-8px;border-radius:50%}
.hl{position:absolute;left:182px;display:flex;flex-direction:column;gap:4px}
.hl .rv{font:700 28px/1 Archivo;letter-spacing:-.02em}
.hl .lead{display:flex;align-items:baseline;gap:6px;font-weight:500;color:var(--ink-2)}
.hl .lead b{color:var(--ink)}
/* motor */
.motor--xl{flex-direction:column;align-items:stretch;gap:0;padding:20px}
.motor--xl .num{margin:14px 0 4px}
.prog{display:block;height:6px;border-radius:3px;background:rgba(10,11,13,.16);margin:16px 0 20px;overflow:hidden}
.prog i{display:block;height:100%;border-radius:3px;background:#0a0b0d}
.stop--wide{width:100%;height:56px;border-radius:28px}
.stats{flex:none;display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:0 4px}
.stats .meta{margin-top:4px}
.grp{flex:none;display:flex;flex-direction:column;gap:2px;border-radius:20px;overflow:hidden}
.grp-r{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:15px 18px;background:var(--raised)}
.grp-r .sub{font-size:14px;margin-top:2px}
.grp-r > svg{flex:none;color:var(--ink-3)}
.grp-h{margin:4px 0 -12px 4px}
.tg{flex:none;position:relative;width:52px;height:32px;border-radius:16px;background:var(--track)}
.tg i{position:absolute;top:3px;left:3px;width:26px;height:26px;border-radius:50%;background:var(--knob-off);box-shadow:0 1px 2px rgba(0,0,0,.18)}
.tg.on{background:var(--ink)}.tg.on i{left:23px;background:var(--bg)}
/* modes */
.seg{flex:none;display:grid;grid-template-columns:repeat(3,1fr);gap:4px;padding:4px;border-radius:26px;background:var(--raised)}
.seg span{display:flex;align-items:center;justify-content:center;height:44px;border-radius:22px;font:600 15px/1 Archivo;color:var(--ink-2)}
.seg span.on{background:var(--ink);color:var(--bg)}
.how{flex:none;display:flex;flex-direction:column;gap:14px;padding:0 4px}
.how dl{display:flex;flex-direction:column;gap:10px}
.how dl div{display:flex;align-items:baseline;gap:10px}
.how dt{width:112px;font:600 17px/1.3 Archivo}
.how dd{font:400 15px/1.3 Archivo;color:var(--ink-2)}
/* alerts */
.alert{padding-bottom:0}
.center{display:flex;justify-content:center;margin:8px 0 4px}
.alert .sh1{margin-top:-8px}
.actions{position:absolute;left:20px;right:20px;bottom:40px;display:flex;flex-direction:column;gap:10px}
.chart{flex:none;padding:18px 18px 14px;border-radius:20px;background:var(--raised);margin-top:4px}
.chart-w{position:relative;margin-top:18px}
.lbl{position:absolute;right:2px;font:600 13px/1 Archivo}
.lbl--exp{top:-16px;color:var(--ink-2)}
.lbl--act{bottom:-2px;color:var(--crit-ink)}
.chart-t{display:flex;justify-content:space-between;margin-top:12px;font:500 13px/1 Archivo;color:var(--ink-2)}
/* usage */
.use{flex:none;display:flex;flex-direction:column;gap:8px;margin-top:4px}
.ch{flex:none;display:flex;justify-content:space-between;height:96px}
.ch span{width:32px;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:8px}
.ch i{display:block;width:100%;border-radius:8px;background:var(--col)}
.ch span.on i{background:#2f6bff}
.ch b{font:500 13px/1 Archivo;color:var(--ink-3)}.ch span.on b{color:var(--ink)}
.sec{margin-bottom:-8px}
.run{padding:10px 18px}
.run .sub{font-size:14px;line-height:1.35}
/* smart */
.pred{flex:none;display:flex;flex-direction:column;gap:6px;padding:0 4px}
.pred .meta{margin-top:4px}
.plan{flex:none;display:flex;flex-direction:column;gap:6px;padding:18px;border-radius:20px;background:var(--raised)}
.why{display:flex;align-items:center;justify-content:space-between;margin-top:10px;font:600 15px/1 Archivo;color:var(--ink)}
/* edge states */
.note{flex:none;display:flex;flex-direction:column;gap:8px;padding:18px;border-radius:20px;background:var(--raised)}
.note .lead{display:flex;align-items:center;gap:9px}
.note .lead svg{color:#ffa53d}
.note--plain .lead svg{color:var(--ink)}
.note-a{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}
.ds{width:1104px;height:200px;display:flex;align-items:stretch;gap:24px;padding:28px 30px;background:#0a0b0d;color:#f4f2ec}
.ds-c{flex:none;display:flex;flex-direction:column;justify-content:space-between;gap:14px}
.ds-x{flex:1;display:flex;align-items:center}
.ds-x > *{flex:1}
.ds-row{display:flex;gap:10px;flex:none !important}
.ds-st{display:flex;flex-direction:column;gap:8px}.ds-st--c{align-items:flex-start;gap:12px}
.cell--ds{width:1104px}
.offline{flex:none;display:flex;align-items:center;justify-content:center;gap:8px;height:32px;margin:0 -20px -12px;background:var(--raised);font:500 13px/1 Archivo;color:var(--ink-2)}
`;

// ---------- write the board ----------
const ORDER = ["f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "f10"];
// Settings is rendered on its own (the film and the gallery use the ten above), and these
// screens are also rendered in light mode for the case study's dark and light previews.
const EXTRA = ["f11"];
const LIGHT = ["f1", "f3", "f8", "f11"];
const lightBody = (k) => (k === "f11" ? settings("Light") : S[k].body);
// build-h2o.js reuses the screens for the walkthrough film, so the board and the renders
// only happen when this file is run directly.
module.exports = { S, css, ORDER, ICON, LIGHT };
if (require.main === module) {
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<title>H2o Connect · app screens</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&display=swap" rel="stylesheet" />
<style>${css}</style></head>
<body>
<div class="cell cell--ds"><p>Components · ds-components<small>For the design system section</small></p><div class="ds" id="ds">${DS}</div></div>
${[...ORDER, ...EXTRA].map((k) => `<div class="cell"><p>${S[k].title} · screen-${k}<small>${S[k].note}</small></p><div class="scr${S[k].cls ? " " + S[k].cls : ""}" id="${k}">${S[k].body}</div></div>`).join("\n")}
${LIGHT.map((k) => `<div class="cell"><p>${S[k].title} · light · screen-${k}-light<small>Light mode</small></p><div class="scr light${S[k].cls ? " " + S[k].cls : ""}" id="${k}-light">${lightBody(k)}</div></div>`).join("\n")}
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
    [...ORDER, ...EXTRA].forEach((k) => { shot(k, `screen-${k}.jpg`, 2); console.log("  rendered screen-" + k + ".jpg"); });
    LIGHT.forEach((k) => { shot(k + "-light", `screen-${k}-light.jpg`, 2); console.log("  rendered screen-" + k + "-light.jpg"); });
    execFileSync(exe, ["--headless=new", "--disable-gpu", "--hide-scrollbars", `--user-data-dir=${prof}`, "--window-size=1104,200", "--force-device-scale-factor=2", "--virtual-time-budget=4000", `--screenshot=${path.join(SITE, "assets/h2o/ds-components.webp")}`, `${url}#ds`], { stdio: "ignore" });
    console.log("  rendered ds-components.webp");
    // The hero shows three of them at their own sizes.
    [["f1", "cover-home.webp", 789 / 360], ["f7", "cover-smart.webp", 644 / 360], ["f8", "cover-leak.webp", 644 / 360]].forEach(([k, f, s]) => { shot(k, f, s); console.log("  rendered " + f); });
  }
}
