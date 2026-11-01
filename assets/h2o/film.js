/* H2o Connect walkthrough film.
   A product film of the real app: the ten screens run live inside the phone
   (from the <template data-app>, in a shadow root), headlines animate in beside
   it and details lift out as callouts. The stage is water that follows the
   story, big figures count up behind the phone, Home comes apart in 3D once,
   and the ten screens close on a turning arc. Every frame is computed from the clock
   by frame(t), so seeking, the chapter bar and reduced motion are all just
   "draw this moment". App positions are in the app's own 360 x 779 px.
   Sounds are CC0 (Kenney, Interface Sounds; see sfx/CREDITS.txt) and play
   only after the visitor turns them on. */
(() => {
  const root = document.querySelector("[data-film]");
  const tpl = root && root.querySelector("template[data-app]");
  if (!root || !tpl) return;
  const q = (s) => root.querySelector(s);
  const qa = (s) => [...root.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Easing
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const spr = (p) => (p >= 1 ? 1 : 1 - Math.exp(-7 * p) * Math.cos(4.5 * p));
  const io = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
  const out = (p) => 1 - Math.pow(1 - p, 3);
  const out5 = (p) => 1 - Math.pow(1 - p, 5);
  const inq = (p) => p * p;
  const mix = (a, b, k) => (Array.isArray(a) ? a.map((v, i) => v + (b[i] - v) * k) : a + (b - a) * k);
  const win = (t, a, d, ez = out) => ez(clamp((t - a) / d));
  // A track is a list of [time, value, duration, easing]; each key eases from wherever the
  // keys before it left the value, so overlapping keys stay continuous.
  const track = (keys) => (t) => {
    let v = keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [kt, kv, d = 0.6, ez = out] = keys[i];
      if (t < kt) break;
      v = mix(v, kv, ez(clamp((t - kt) / d)));
    }
    return v;
  };
  const L = (n) => Math.round(n).toLocaleString("en-IN");
  const rgb = (a) => `rgb(${a.map((v) => Math.round(v)).join(",")})`;

  // ---- The app, inside the phone
  const host = q(".mg-app");
  const sh = host.attachShadow({ mode: "open" });
  sh.append(tpl.content.cloneNode(true));
  const $ = (s, r = sh) => r.querySelector(s);
  const $$ = (s, r = sh) => [...r.querySelectorAll(s)];
  const app = $(".app");
  const scr = Object.fromEntries($$(".scr").map((el) => [el.dataset.k, el]));
  for (const s of $$(".seg")) { const k = document.createElement("i"); k.className = "seg-k"; s.prepend(k); }
  const f1 = scr.f1, f2 = scr.f2, f3 = scr.f3, f4 = scr.f4, f6 = scr.f6, f7 = scr.f7, f8 = scr.f8, f9 = scr.f9, f10 = scr.f10;

  // Navigation: [time, from, to, kind]. push/pop slide sideways, sheet comes up from the
  // bottom, tab and fade cross-fade, under brings a screen in beneath a closing sheet.
  const NAV = [
    [2.2, null, "f1", "open"],
    [10.35, "f1", "f2", "push"],
    [15.0, "f2", "f1", "pop"],
    [16.75, "f1", "f3", "tab"],
    [25.35, "f3", "f5", "sheet"],
    [27.45, "f5", "f4", "fade"],
    [27.45, "f3", null, "hide"],
    [29.8, "f4", "f7", "tab"],
    [35.75, "f7", "f6", "tab"],
    [43.05, "f6", "f8", "sheet"],
    [47.45, "f8", "f1", "under"],
    [47.45, "f6", null, "hide"],
    [51.0, "f1", "f9", "fade"],
    [53.8, "f9", "f10", "fade"],
  ];
  const K = {}, Z = {};
  for (const k in scr) { K[k] = { x: [[0, 0]], y: [[0, 0]], s: [[0, 1]], o: [[0, 0]], dim: [[0, 0]] }; Z[k] = [[0, 0]]; }
  const key = (k, p, t, v, d = 0.001, ez = out) => K[k][p].push([t, v, d, ez]);
  for (const [t, a, b, kind] of NAV) {
    if (b) Z[b].push([t, kind === "under" ? -1 : t]);
    if (kind === "open") { key(b, "s", t - 0.002, 1.08); key(b, "o", t, 1, 0.3); key(b, "s", t, 1, 0.7, out5); }
    if (kind === "push") {
      key(b, "x", t - 0.002, 100); key(b, "o", t - 0.001, 1); key(b, "x", t, 0, 0.5, out5);
      key(a, "x", t, -30, 0.5, out5); key(a, "dim", t, 0.5, 0.5); key(a, "o", t + 0.5, 0);
    }
    if (kind === "pop") {
      key(b, "o", t - 0.001, 1); key(b, "x", t, 0, 0.5, out5); key(b, "dim", t, 0, 0.5);
      key(a, "x", t, 100, 0.5, out5); key(a, "o", t + 0.5, 0);
    }
    if (kind === "tab" || kind === "fade") {
      const d = kind === "tab" ? 0.22 : 0.4;
      key(b, "x", t - 0.002, 0); key(b, "y", t - 0.002, 0); key(b, "s", t - 0.002, kind === "fade" ? 0.97 : 1);
      key(b, "o", t, 1, d); key(b, "s", t, 1, d + 0.2, out5); key(a, "o", t + d, 0);
    }
    if (kind === "sheet") {
      key(b, "y", t - 0.002, 100); key(b, "o", t - 0.001, 1); key(b, "y", t, 0, 0.5, out5);
      key(a, "s", t, 0.94, 0.5, out5); key(a, "dim", t, 0.5, 0.5);
    }
    if (kind === "under") {
      for (const [p, v] of [["x", 0], ["y", 0], ["s", 0.94], ["dim", 0.5]]) key(b, p, t - 0.002, v);
      key(b, "o", t - 0.001, 1); key(b, "s", t, 1, 0.55, out5); key(b, "dim", t, 0, 0.5);
      key(a, "y", t, 100, 0.42, inq); key(a, "o", t + 0.42, 0);
    }
    if (kind === "hide") key(a, "o", t, 0);
  }
  const SCR = Object.entries(K).map(([k, p]) => {
    for (const n in p) p[n].sort((m, n2) => m[0] - n2[0]);
    return [scr[k], Object.fromEntries(Object.entries(p).map(([n, keys]) => [n, track(keys)])), Z[k]];
  });

  // Where things are in the app, measured from layout (transforms don't count).
  const pos = (el) => {
    let x = el.offsetWidth / 2, y = el.offsetHeight / 2, n = el;
    while (n && n !== app) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
    return [x, y];
  };
  // Fill range handles (illustrative start positions, dragged to the real 90% and 25%)
  const DRAG = { stop: [11.2, 0.9, 80, 90], start: [12.6, 0.9, 35, 25] };
  const rangeTank = $(".range .tank", f2);
  // The handle's knob sits on the tank's right edge.
  const handleAt = (pct) => { const [x, y] = pos(rangeTank); return [x + rangeTank.offsetWidth / 2, y - rangeTank.offsetHeight / 2 + rangeTank.offsetHeight * (1 - pct / 100)]; };

  // The finger: a touch marker, like a screen recording. Built from measured targets.
  const TAPS = [10.2, 14.85, 16.6, 19.6, 25.2, 27.3, 29.6, 35.6, 42.9, 47.3];
  const HOLDS = [[11.05, 12.2], [12.5, 13.6]];
  let fx, pressEls;
  const build = () => {
    const P = (el) => pos(el);
    const tankF1 = P($(".hero .tank", f1));
    const back = P($(".hd-back", f2));
    const motorTab = P($(".tb-i:nth-child(3)", f1));
    const stopBtn = P($(".stop--wide", f3));
    const banner = [180, 90];
    const link = P($(".btn-t", scr.f5));
    const smart = P($(".seg span:nth-child(4)", f4));
    const usageTab = P($(".tb-i:nth-child(2)", f7));
    const pause = P($(".actions .btn-p", f8));
    fx = track([
      [0, [300, 830]],
      [9.6, [292, 720], 0.01], [9.75, tankF1, 0.45, out5],
      [10.6, handleAt(80), 0.5, io], [DRAG.stop[0], handleAt(90), DRAG.stop[1], io],
      [12.25, handleAt(35), 0.3, io], [DRAG.start[0], handleAt(25), DRAG.start[1], io],
      [14.2, back, 0.55, io], [15.9, motorTab, 0.55, io], [18.9, stopBtn, 0.6, io],
      [24.6, banner, 0.5, io], [26.6, link, 0.55, io], [28.9, smart, 0.55, io],
      [35.0, usageTab, 0.5, io], [42.3, banner, 0.5, io], [46.6, pause, 0.6, io],
      [47.8, [320, 860], 0.5, io],
    ]);
    pressEls = [
      [14.85, $(".hd-back", f2)], [16.6, $(".tb-i:nth-child(3)", f1)], [19.6, $(".stop--wide", f3)],
      [27.3, $(".btn-t", scr.f5)], [29.6, $(".seg span:nth-child(4)", f4)], [35.6, $(".tb-i:nth-child(2)", f7)],
      [47.3, $(".actions .btn-p", f8)],
    ];
  };
  // The finger shows only around the moments it touches the screen.
  const fo = track([[0, 0], ...[[9.6, 15.2], [15.75, 17.0], [18.75, 20.3], [24.4, 25.6], [26.4, 27.7], [28.7, 30.0], [34.85, 36.0], [42.1, 43.3], [46.4, 47.8]].flatMap(([a, b]) => [[a, 1, 0.25], [b, 0, 0.3]])]);
  const press = (t) => {
    let p = 0;
    for (const tp of TAPS) p = Math.max(p, 1 - clamp(Math.abs(t - tp) / 0.12));
    for (const [a, b] of HOLDS) p = Math.max(p, clamp((t - a) / 0.1) * (1 - clamp((t - b) / 0.1)));
    return p;
  };
  const ripple = (t) => { for (const tp of TAPS) if (t >= tp && t < tp + 0.5) return (t - tp) / 0.5; return -1; };

  // The camera moves the phone: [rotateY, rotateX, scale, x, y], x and y in phone widths.
  const cam = track([
    [0, [-26, 8, 0.9, 0.25, 2.4]],
    [1.0, [-16, 5, 1, 0, 0], 1.7, out5],
    [4.0, [-9, 3, 1, 0, 0], 1.2, io],
    // Home comes apart: the phone swings round while its cards lift off the screen.
    [6.0, [-36, 22, 0.9, -0.12, 0.08], 0.9, io],
    [8.35, [-7, 2.5, 1, 0, 0], 0.8, io],
    [9.6, [-4, 2, 1, 0, 0], 0.8, io],
    [10.9, [-2, 1, 1.32, -0.1, 0.25], 0.9, io],
    [14.4, [-6, 2, 1, 0, 0], 0.8, io],
    [18.3, [-3, 1, 1.26, -0.08, -0.36], 0.9, io],
    [21.6, [-8, 3, 1, 0, 0], 0.8, io],
    [25.5, [-12, 4, 1, 0, 0], 0.9, io],
    [28.6, [-5, 2, 1, 0, 0], 0.8, io],
    [30.3, [-3, 1, 1.3, -0.08, 0.3], 0.9, io],
    [33.6, [-6, 2, 1, 0, 0], 0.8, io],
    [36.2, [-12, 4, 1.04, 0, 0], 1.0, io],
    [38.0, [-4, 1, 1.28, -0.08, -0.25], 1.0, io],
    [40.8, [-8, 3, 1, 0, 0], 0.8, io],
    [43.3, [-3, 1, 1.3, -0.08, 0.12], 0.9, io],
    [46.3, [-3, 1, 1.22, -0.08, -0.38], 0.8, io],
    [47.4, [-10, 3, 1, 0, 0], 0.8, io],
    [50.4, [-14, 4, 1, 0, 0], 1.0, io],
    // The phone shrinks to the centre and hands over to the wall of screens.
    [57.0, [0, 0, 0.48, -0.975, 0.15], 0.9, io],
  ]);

  // The water: the stage is the tank. Level is a share of the stage height; it fills with
  // the app's tank, goes still at Stop, drains for the low-water alert, refills in Automatic,
  // drops at the leak, turns grey while the sensor is silent and floods the stage at the end.
  const water = track([[0, 0.12], [0.95, 0.42, 1.8, out5], [24.0, 0.13, 1.5, io], [28.6, 0.42, 2.4, io], [41.9, 0.35, 2.0, io], [48.0, 0.42, 1.5, io], [57.2, 0.3, 1.0, io], [62.6, 1.12, 1.1, io]]);
  const wAmp = track([[0, 1.1], [19.75, 0.12, 0.8], [23.5, 1.1, 1.2, io]]);
  const wGrey = track([[0, 0], [51.0, 1, 1.0, io], [57.2, 0, 1.0, io]]);
  const DROP_T = 0.95;
  // Big figures behind the phone: [from, to, prefix, value, decimals, suffix]. The first counts with the tank.
  const NUMS = [[2.4, 9.4, "", 78, 0, "%"], [9.7, 15.9, "", 90, 0, "%"], [16.2, 23.3, "", 200, 0, "ms"], [23.8, 28.3, "", 22, 0, "%"], [28.8, 34.8, "", 92, 0, "%"], [35.3, 41.3, "₹", 1.8, 2, ""], [41.9, 49.8, "−", 42, 0, "L"], [50.3, 56.7, "", 2, 0, "h"]];
  // The finale: all ten screens on an arc that turns, then the water covers them.
  const spin = track([[0, 34], [57.6, -30, 4.9, io]]);
  const LIFT = [0.12, 0.34, 0.5, 0.34, 0.16];

  // Headlines and callouts
  const BEATS = [[0, 4], [4, 9.5], [9.5, 16], [16, 23.5], [23.5, 28.5], [28.5, 35], [35, 41.5], [41.5, 50], [50, 57], [57.3, 62.6], [63.2, 999]];
  const CALL = [[5.0, 8.9], [12.4, 15.6], [20.2, 23.2], [31.0, 34.8], [37.4, 41.0], [45.4, 49.6]];
  const beats = qa(".mg-beat").map((el) => ({ el, k: el.querySelector(".mg-k"), p: el.querySelector(".mg-p"), w: [...el.querySelectorAll(".mg-w > span")] }));
  const calls = qa(".mg-co").map((el) => ({ el, line: el.querySelector(".mg-co-line") }));

  // Sounds, by moment
  const SFX = [
    [DROP_T, "tick"], [3.75, "tick"], [6.05, "grow"], [8.3, "shrink"], [10.2, "tap"], [10.35, "grow"], [12.2, "tick"], [13.6, "tick"], [14.85, "tap"], [15.0, "shrink"],
    [16.6, "tap"], [19.6, "tap"], [24.0, "alert"], [25.2, "tap"], [25.35, "grow"], [27.3, "tap"], [29.6, "tap"], [35.6, "tap"],
    [41.8, "alert"], [42.9, "tap"], [43.05, "grow"], [47.3, "tap"], [47.45, "shrink"], [47.65, "done"], [57.3, "grow"], [62.6, "grow"],
  ];
  const CH = [0, 9.5, 16, 23.5, 28.5, 35, 41.5, 50, 57];
  const TOTAL = 70;
  const REST = [5.5, 13.9, 22.8, 27.0, 34.5, 40.8, 46.5, 55.5, 61.0];

  // Elements
  const vEl = q(".mg-vis"), phone = q(".mg-phone"), screenEl = q(".mg-screen");
  const waterEl = q(".mg-water"), waveB = q(".mg-wave--b"), waveF = q(".mg-wave--f"), dropEl = q(".mg-drop"), rip = q(".mg-rip");
  const nums = qa(".mg-num"), wall = q(".mg-wall"), cards = qa(".mg-card");
  const splash = $(".spl"), splImg = $(".spl img");
  const touch = $(".tch"), tDot = $(".tch i"), tRing = $(".tch b");
  const nbs = { low: $('.nb[data-k="low"]'), leak: $('.nb[data-k="leak"]') }, toast = $(".tst");
  const homeParts = [".hd", ".hero", ".motor", ".row", ".tb"].map((s) => $(s, f1));
  const h1Water = $(".tank-water", f1), h1Big = $(".num", f1).firstChild, h1Sub = $(".read .lead", f1), h1Timer = $(".motor .timer", f1);
  const hdls = $$(".hdl", f2), hls = $$(".hl", f2);
  const r2 = { stop: [hdls[0], hls[0]], start: [hdls[1], hls[1]] };
  const run = $(".motor--xl", f3), runMk = $(".motor--xl > .lead", f3), runTimer = $(".motor--xl .timer", f3), runSub = $(".motor--xl .m-sub", f3), runProg = $(".prog", f3), runBar = $(".prog i", f3);
  const stopBtn = $(".stop--wide", f3), stopHTML = stopBtn.innerHTML;
  const segK4 = $(".seg-k", f4), segSpans4 = $$(".seg span", f4), segK7 = $(".seg-k", f7);
  const predT = $(".pred-t", f7), planTag = $(".plan", f7);
  const bars = $$(".ch i", f6).map((el) => [el, parseFloat(el.style.height)]);
  const useN = $(".use .num", f6).firstChild, useSub = $(".use .sub", f6), runRows = $$(".grp-r.run", f6);
  const chartSvg = $(".chart-w svg", f8), delta = $(".lbl--act", f8), lbls = $$(".lbl--exp", f8), actions = $(".actions", f8);
  const banner9 = $(".note", f9), offBar = $(".offline", f10);
  const clock = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const STOP_T = 19.75;

  let cqw = 4, tall = false, H = 56.25, scrRad = 0, in3d = false;
  const measure = () => {
    cqw = vEl.clientWidth / 100 || 4;
    tall = vEl.clientHeight > vEl.clientWidth * 0.8;
    H = (vEl.clientHeight / vEl.clientWidth) * 100 || 56.25;
    waterEl.setAttribute("viewBox", `0 0 100 ${H.toFixed(2)}`);
    const k = screenEl.clientWidth / 360;
    app.style.setProperty("--k", k.toFixed(5));
    scrRad = parseFloat(getComputedStyle(screenEl).borderTopLeftRadius) / (k || 1);
  };
  // The water's surface: two waves, plus the ring the drop sends out when it lands (x in cqw).
  const wave = (lvl, amp, ph, t, dropX) => {
    const y0 = H * (1 - lvl), since = t - DROP_T;
    let d = `M0 ${(H + 1).toFixed(2)}`;
    for (let i = 0; i <= 40; i++) {
      const x = i * 2.5;
      let y = y0 + amp * (0.6 * Math.sin(x * 0.085 + t * 1.5 + ph) + 0.4 * Math.sin(x * 0.2 - t * 1.05 + ph * 1.7));
      if (since > 0 && since < 3) { const r = Math.abs(x - dropX); y += 2.4 * Math.exp(-since * 1.6) * Math.exp(-r * 0.03) * Math.cos((r - since * 38) * 0.32); }
      d += `L${x} ${y.toFixed(2)}`;
    }
    return d + `L100 ${(H + 1).toFixed(2)}Z`;
  };
  const fade = (el, o, dy = 0, unit = "px", extra = "") => {
    el.style.visibility = o > 0.002 ? "visible" : "hidden";
    el.style.opacity = o.toFixed(3);
    el.style.transform = `translateY(${dy.toFixed(2)}${unit})${extra}`;
  };

  const frame = (t) => {
    // The water, and the drop that starts it
    const dropX = tall ? 50 : 73, lvl = water(t), amp = wAmp(t), g = wGrey(t);
    waveB.setAttribute("d", wave(lvl + 0.018, amp * 1.25, 2.1, t, dropX));
    waveF.setAttribute("d", wave(lvl, amp, 0, t, dropX));
    waveB.style.fill = rgb(mix([30, 72, 205], [62, 67, 77], g));
    waveF.style.fill = rgb(mix([0, 47, 167], [44, 48, 56], g));
    const fall = clamp((t - 0.25) / (DROP_T - 0.25)), surf = H * (1 - 0.12);
    dropEl.style.visibility = t >= 0.25 && t < DROP_T ? "visible" : "hidden";
    dropEl.style.transform = `translate(${dropX}cqw, ${(-8 + (surf + 6) * inq(fall)).toFixed(2)}cqw) translate(-50%, -100%) scaleY(${(1 + 0.25 * inq(fall)).toFixed(3)})`;
    const rp0 = clamp((t - DROP_T) / 0.8);
    rip.style.visibility = rp0 > 0 && rp0 < 1 ? "visible" : "hidden";
    rip.style.opacity = (1 - rp0).toFixed(3);
    rip.style.transform = `translate(${dropX}cqw, ${(H * (1 - lvl)).toFixed(2)}cqw) translate(-50%, -50%) scale(${(0.2 + 1.6 * out(rp0)).toFixed(3)})`;

    // Camera
    const [ry, rx, s0, x0, y0] = cam(t);
    const s = tall ? 1 + (s0 - 1) * 0.6 : s0, pw = phone.offsetWidth, px = tall && t > 56.9 ? 0 : x0, py = tall && Math.abs(y0) < 1 ? y0 * 0.4 : y0;
    phone.style.transform = `translate(-50%, -50%) translate(${(px * pw).toFixed(1)}px, ${(py * pw).toFixed(1)}px) perspective(${(pw * 6).toFixed(0)}px) rotateY(${ry.toFixed(2)}deg) rotateX(${rx.toFixed(2)}deg) scale(${s.toFixed(4)})`;
    const po = 1 - win(t, 57.45, 0.45);
    phone.style.opacity = po < 1 ? po.toFixed(3) : "";
    phone.style.visibility = po > 0.002 ? "visible" : "hidden";

    // Big figures behind the phone, drifting against the camera
    const lv = win(t, 2.45, 1.3, io);
    nums.forEach((el, i) => {
      const [a, b, pre, v, dp, suf] = NUMS[i];
      const on = t >= a && t < b;
      el.style.visibility = on ? "visible" : "hidden";
      if (!on) return;
      const pin = win(t, a, 0.8, out5), pout = win(t, b - 0.4, 0.4, inq), c = i === 0 ? lv : win(t, a + 0.1, 1.0, out);
      const txt = pre + (v * c).toFixed(dp) + suf;
      if (el.textContent !== txt) el.textContent = txt;
      el.style.opacity = (pin * (1 - pout)).toFixed(3);
      // Longer figures are set smaller, so none of them reaches the headline.
      const fit = Math.min(1, 3.4 / (pre + v.toFixed(dp) + suf).length);
      el.style.transform = `translate(-50%, -50%) translateX(${((1 - pin) * 9 - pout * 9 + ry * 0.22).toFixed(2)}cqw) scale(${((0.9 + 0.1 * pin) * fit).toFixed(3)})`;
    });

    // The finale wall
    const wallOn = t > 57.2 && t < 63.4;
    wall.style.visibility = wallOn ? "visible" : "hidden";
    if (wallOn) {
      const R = (tall ? 72 : 44) * cqw, wo = 1 - win(t, 62.55, 0.6, inq);
      // Opacity stays on the cards: on the wall it would flatten the 3D.
      wall.style.transform = `perspective(${(120 * cqw).toFixed(0)}px) translateZ(${(-R).toFixed(1)}px) translateY(${(-(1 - wo) * 6 * cqw).toFixed(1)}px) rotateX(${(-7).toFixed(1)}deg) rotateY(${spin(t).toFixed(2)}deg)`;
      cards.forEach((el, i) => {
        const p = win(t, 57.3 + i * 0.07, 0.9, out5);
        el.style.opacity = (p * wo).toFixed(3);
        el.style.transform = `translate(-50%, -50%) rotateY(${((i - 4.5) * 15).toFixed(1)}deg) translateZ(${(R - (1 - p) * R * 2.2).toFixed(1)}px)`;
      });
    }

    // Screens
    for (const [el, p, z] of SCR) {
      const o = p.o(t);
      el.style.visibility = o > 0.001 ? "visible" : "hidden";
      if (o <= 0.001) continue;
      let zi = 0; for (const [zt, zv] of z) if (zt <= t) zi = zv;
      el.style.zIndex = String(Math.round(zi * 10) + 100);
      el.style.opacity = o.toFixed(3);
      el.style.transform = `translate(${p.x(t).toFixed(2)}%, ${p.y(t).toFixed(2)}%) scale(${p.s(t).toFixed(4)})`;
      el.style.setProperty("--dim", p.dim(t).toFixed(3));
    }
    const sp = win(t, 2.2, 0.4);
    fade(splash, 1 - sp);
    splImg.style.transform = `scale(${(1 + 0.3 * win(t, 2.15, 0.45, inq)).toFixed(3)})`;

    // Home: the cards arrive, the tank fills, the timer runs
    // The exploded view needs a 3D chain from the phone down to the cards, unclipped.
    const ex = win(t, 6.05, 0.8, out5) * (1 - win(t, 8.25, 0.65, io));
    if ((ex > 0.001) !== in3d) {
      in3d = ex > 0.001;
      for (const el of [phone, screenEl, host, app, f1]) el.style.transformStyle = in3d ? "preserve-3d" : "";
      for (const el of [screenEl, host, app, f1]) el.style.overflow = in3d ? "visible" : "";
      f1.style.borderRadius = in3d ? scrRad.toFixed(1) + "px" : "";
      screenEl.style.background = in3d ? "transparent" : "";
    }
    homeParts.forEach((el, i) => {
      const p = win(t, 2.3 + i * 0.07, 0.6, out5);
      el.style.opacity = p.toFixed(3);
      el.style.transform = `translateY(${((1 - p) * 26).toFixed(1)}px)` + (in3d ? ` translateZ(${(ex * pw * LIFT[i]).toFixed(1)}px)` : "");
      el.style.boxShadow = in3d && (i === 2 || i === 3) ? `0 ${(ex * 24).toFixed(1)}px ${(ex * 48).toFixed(1)}px rgba(0,0,0,${(0.55 * ex).toFixed(2)})` : "";
    });
    h1Water.style.height = (78 * lv).toFixed(2) + "%";
    h1Big.nodeValue = String(Math.round(78 * lv));
    h1Sub.textContent = `${L(1560 * lv)} of 2,000 L`;
    const secs = 252 + Math.max(0, Math.min(t, STOP_T) - 2.5);
    h1Timer.textContent = clock(252 + Math.max(0, t - 2.5));

    // Fill range
    for (const k of ["stop", "start"]) {
      const [a, d, v0, v1] = DRAG[k], v = mix(v0, v1, win(t, a, d, io)), [h, hl] = r2[k];
      const y = rangeTank.offsetHeight * (1 - v / 100), b = hl.querySelector(".rv");
      h.style.top = y.toFixed(1) + "px";
      hl.style.top = (y - 24).toFixed(1) + "px";
      b.textContent = Math.round(v) + "%";
      b.nextSibling.nodeValue = ` · ${L(v * 20)} L`;
    }

    // Motor: the timer and the bar run until Stop; then the panel says what changed
    runTimer.textContent = clock(secs);
    runBar.style.width = ((secs / 1080) * 100).toFixed(2) + "%";
    const st = win(t, STOP_T, 0.35);
    run.style.background = rgb(mix([203, 248, 72], [21, 23, 27], st));
    run.style.color = rgb(mix([10, 11, 13], [244, 242, 236], st));
    runMk.textContent = t < STOP_T ? "Running · Automatic" : "Stopped · Manual";
    runSub.textContent = t < STOP_T ? "of about 18 min" : "Manual until you switch back";
    runSub.style.color = t < STOP_T ? "" : "#a3a8b0";
    runProg.style.opacity = (1 - 0.7 * st).toFixed(3);
    const swapped = t >= STOP_T + 0.1;
    if (swapped !== stopBtn.classList.contains("btn")) {
      stopBtn.className = swapped ? "btn btn-p" : "stop stop--wide";
      stopBtn.innerHTML = swapped ? "Start motor" : stopHTML;
    }
    stopBtn.style.opacity = (1 - Math.max(0, 1 - Math.abs(t - (STOP_T + 0.1)) / 0.1)).toFixed(3);

    // Notifications and the toast
    for (const [k, a, b] of [["low", 24.0, 25.3], ["leak", 41.8, 42.95]]) {
      const i = win(t, a, 0.6, spr), o = win(t, b, 0.3, inq);
      fade(nbs[k], i * (1 - o), (1 - i) * -130 - o * 60, "%");
    }
    const ti = win(t, 47.65, 0.6, spr), to = win(t, 50.4, 0.3, inq);
    fade(toast, ti * (1 - to), (1 - ti) * -40 - to * 20, "px", " translateX(-50%)");
    toast.style.transform = `translateX(-50%) translateY(${((1 - ti) * -40 - to * 20).toFixed(2)}px) scale(${(0.9 + 0.1 * ti).toFixed(3)})`;

    // Modes: the selection slides to Smart, then the plan
    const sw = win(t, 29.62, 0.36, io);
    segK4.style.setProperty("--i", (2 * sw).toFixed(3));
    segSpans4.forEach((el, i) => el.classList.toggle("on", Math.round(2 * sw) === i));
    segK7.style.setProperty("--i", "2");
    predT.style.clipPath = `inset(0 ${(100 * (1 - win(t, 30.05, 0.7, io))).toFixed(1)}% 0 0)`;
    const pt = win(t, 30.7, 0.5, spr);
    planTag.style.transform = `translateY(${((1 - pt) * 16).toFixed(1)}px)`;
    planTag.style.opacity = clamp(pt * 1.5).toFixed(3);

    // Usage: bars grow, totals count, the runs arrive
    bars.forEach(([el, h], i) => { el.style.height = (h * win(t, 35.9 + i * 0.05, 0.55, out5)).toFixed(1) + "%"; });
    const un = win(t, 35.9, 1.0, out);
    useN.nodeValue = L(1240 * un);
    useSub.textContent = `and ${(8.4 * un).toFixed(1)} units of electricity`;
    runRows.forEach((el, i) => { const p = win(t, 36.3 + i * 0.08, 0.5, out5); el.style.opacity = p.toFixed(3); el.style.transform = `translateY(${((1 - p) * 18).toFixed(1)}px)`; });

    // Leak: the chart draws, the loss is marked, then the choices
    chartSvg.style.clipPath = `inset(0 ${(100 * (1 - win(t, 43.6, 1.2, io))).toFixed(1)}% 0 0)`;
    lbls.forEach((el) => { el.style.opacity = win(t, 44.4, 0.4).toFixed(3); });
    const dp = win(t, 44.8, 0.5, spr);
    delta.style.opacity = clamp(dp * 1.5).toFixed(3);
    delta.style.transform = `scale(${(0.5 + 0.5 * dp).toFixed(3)})`;
    const ap = win(t, 45.1, 0.6, out5);
    actions.style.opacity = ap.toFixed(3);
    actions.style.transform = `translateY(${((1 - ap) * 40).toFixed(1)}px)`;

    // Failsafes
    const bp = win(t, 51.25, 0.6, out5);
    banner9.style.opacity = bp.toFixed(3);
    banner9.style.transform = `translateY(${((1 - bp) * 24).toFixed(1)}px)`;
    offBar.style.transform = `translateY(${((1 - win(t, 53.95, 0.5, out5)) * -36).toFixed(1)}px)`;

    // Finger and the press it makes
    const [x, y] = fx(t), pr = press(t), rp = ripple(t);
    touch.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    touch.style.opacity = (fo(t) * (0.55 + 0.45 * pr)).toFixed(3);
    tDot.style.transform = `scale(${(1 - 0.15 * pr).toFixed(3)})`;
    tRing.style.opacity = rp < 0 ? "0" : ((1 - rp) * 0.8).toFixed(3);
    tRing.style.transform = `scale(${rp < 0 ? 1 : (1 + 1.2 * out(rp)).toFixed(3)})`;
    for (const [tp, el] of pressEls) {
      const d = Math.abs(t - tp);
      el.style.transform = d < 0.2 ? `scale(${(1 - 0.05 * (1 - d / 0.2)).toFixed(3)})` : "";
    }

    // Headlines: words rise in, then leave upward
    beats.forEach(({ el, k, p, w }, i) => {
      const [a, b] = BEATS[i];
      const on = t >= a - 0.01 && t < b;
      el.style.visibility = on ? "visible" : "hidden";
      if (!on) return;
      const ex = (j) => win(t, b - 0.4 + j * 0.02, 0.32, inq);
      w.forEach((s2, j) => {
        const pin = win(t, a + 0.12 + j * 0.05, 0.65, out5);
        s2.style.transform = `translateY(${((1 - pin) * 110 - ex(j) * 110).toFixed(1)}%)`;
      });
      const kin = win(t, a + 0.02, 0.5, out5);
      fade(k, kin * (1 - ex(0)), (1 - kin) * 0.8 * cqw);
      const pin = win(t, a + 0.5, 0.6, out5);
      fade(p, pin * (1 - ex(0)), (1 - pin) * 1.2 * cqw);
    });
    calls.forEach(({ el, line }, i) => {
      const [a, b] = CALL[i], pin = win(t, a, 0.7, out5), pout = win(t, b - 0.3, 0.3, inq);
      el.style.visibility = t >= a && t < b && !tall ? "visible" : "hidden";
      el.style.opacity = (pin * (1 - pout)).toFixed(3);
      el.style.transform = `translateX(${((1 - pin) * 7).toFixed(2)}cqw) scale(${(0.94 + 0.06 * pin).toFixed(3)})`;
      el.style.filter = pin < 0.98 ? `blur(${((1 - pin) * 0.6 * cqw).toFixed(2)}px)` : "none";
      line.style.transform = `scaleX(${win(t, a + 0.25, 0.6, out5).toFixed(3)})`;
    });
  };

  // Sound: loaded the first time the visitor turns it on.
  const SRC = { tap: "click", tick: "tick", grow: "grow", shrink: "shrink", done: "done", alert: "alert" };
  const base = (document.currentScript?.src || "").replace(/film\.js.*$/, "sfx/");
  const sndBtn = q(".mo-snd");
  let sound = false, bank = null;
  const load = () => {
    if (bank) return;
    bank = Object.fromEntries(Object.entries(SRC).map(([k, f]) => { const a = new Audio(base + f + ".wav"); a.preload = "auto"; return [k, a]; }));
  };
  const play1 = (k) => { if (!sound || !bank) return; const a = bank[k].cloneNode(); a.volume = k === "tap" || k === "tick" ? 0.45 : 0.3; a.play().catch(() => {}); };
  sndBtn.addEventListener("click", () => {
    sound = !sound;
    if (sound) load();
    sndBtn.setAttribute("aria-pressed", String(sound));
    sndBtn.setAttribute("aria-label", sound ? "Turn sound off" : "Turn sound on");
  });

  // Playback
  const chEls = qa(".mo-ch");
  let t = 0, playing = false, last = 0, raf = 0, userPaused = false;
  const bar = () => chEls.forEach((el, i) => {
    const a = CH[i], b = CH[i + 1] ?? TOTAL;
    el.style.setProperty("--p", clamp((t - a) / (b - a)).toFixed(4));
    el.classList.toggle("is-now", t >= a && t < b);
  });
  const seek = (x) => { t = x; frame(t); bar(); };
  const tick = (now) => {
    if (!playing) return;
    const prev = t;
    t += Math.min((now - last) / 1000, 0.1);
    last = now;
    for (const [te, k] of SFX) if (te > prev && te <= t) play1(k);
    if (t >= TOTAL) t = 0;
    frame(t);
    bar();
    raf = requestAnimationFrame(tick);
  };
  const playBtn = q(".mo-play");
  const play = () => {
    if (playing) return;
    playing = true;
    root.classList.add("is-playing");
    playBtn.setAttribute("aria-label", "Pause walkthrough");
    last = performance.now();
    raf = requestAnimationFrame(tick);
  };
  const pause = () => {
    playing = false;
    cancelAnimationFrame(raf);
    root.classList.remove("is-playing");
    playBtn.setAttribute("aria-label", "Play walkthrough");
  };
  playBtn.addEventListener("click", () => {
    if (playing) { userPaused = true; pause(); }
    else { userPaused = false; play(); }
  });
  chEls.forEach((el, i) => el.addEventListener("click", () => {
    if (reduce) { pause(); seek(REST[i]); return; }
    seek(CH[i]);
    userPaused = false;
    play();
  }));

  measure();
  build();
  new ResizeObserver(() => { measure(); frame(t); }).observe(vEl);
  // Fonts change the app's layout, so measure the finger's targets again once they load.
  document.fonts?.ready.then(() => { build(); frame(t); });
  seek(reduce ? REST[0] : 0);
  // Autoplay while the film is on screen, unless the visitor paused it or prefers less motion.
  new IntersectionObserver(([en]) => {
    // The finale's screens stay hidden until the end, so lazy loading would never fetch them.
    if (en.isIntersecting) for (const img of wall.querySelectorAll("img")) img.loading = "eager";
    if (en.isIntersecting && !userPaused && !reduce) play();
    else if (!en.isIntersecting) pause();
  }, { threshold: 0.45 }).observe(vEl);
})();

/* Dynamic Island demo video: plays while it is on screen, unless the visitor
   paused it or prefers less motion; the button pauses and resumes it. */
(() => {
  const video = document.querySelector("[data-island-video]");
  const btn = document.querySelector("[data-island-toggle]");
  if (!video || !btn) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let userPaused = reduce;
  const label = btn.querySelector("span");
  const sync = () => {
    const paused = video.paused;
    btn.setAttribute("aria-pressed", String(paused));
    label.textContent = paused ? "Play" : "Pause";
  };
  video.addEventListener("play", sync);
  video.addEventListener("pause", sync);
  btn.addEventListener("click", () => {
    if (video.paused) { userPaused = false; video.play().catch(() => {}); }
    else { userPaused = true; video.pause(); }
  });
  new IntersectionObserver(([en]) => {
    if (en.isIntersecting && !userPaused) video.play().catch(() => {});
    else if (!en.isIntersecting) video.pause();
  }, { threshold: 0.2 }).observe(video);
  sync();
})();
