/* H2o Connect walkthrough film.
   A product film of the real app: the ten screens run live inside the phone
   (from the <template data-app>, in a shadow root), headlines animate in beside
   it and details lift out as callouts. Every frame is computed from the clock
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
  const handleAt = (pct) => { const [x] = pos(rangeTank); return [x, pos(rangeTank)[1] - rangeTank.offsetHeight / 2 + rangeTank.offsetHeight * (1 - pct / 100)]; };

  // The finger: a touch marker, like a screen recording. Built from measured targets.
  const TAPS = [10.2, 14.85, 16.6, 19.6, 25.2, 27.3, 29.6, 35.6, 42.9, 47.3];
  const HOLDS = [[11.05, 12.2], [12.5, 13.6]];
  let fx, pressEls;
  const build = () => {
    const P = (el) => pos(el);
    const tankF1 = P($(".tank-card .tank", f1));
    const back = P($(".top .circ", f2));
    const motorTab = P($(".tb-i:nth-child(3) b", f1));
    const stopBtn = P($(".stop--wide", f3));
    const banner = [180, 90];
    const link = P($(".link", scr.f5));
    const smart = P($(".seg span:nth-child(4)", f4));
    const usageTab = P($(".tb-i:nth-child(2) b", f7));
    const pause = P($(".actions .lime-btn", f8));
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
      [14.85, $(".top .circ", f2)], [16.6, $(".tb-i:nth-child(3) b", f1)], [19.6, $(".stop--wide", f3)],
      [27.3, $(".link", scr.f5)], [29.6, $(".seg span:nth-child(4)", f4)], [35.6, $(".tb-i:nth-child(2) b", f7)],
      [47.3, $(".actions .lime-btn", f8)],
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
    [0, [-26, 8, 0.9, 0.25, 1.5]],
    [0.2, [-16, 5, 1, 0, 0], 1.6, out5],
    [4.0, [-9, 3, 1, 0, 0], 1.2, io],
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
    [57.0, [0, 0, 0.94, 0, 0], 1.2, io],
  ]);

  // Headlines and callouts
  const BEATS = [[0, 4], [4, 9.5], [9.5, 16], [16, 23.5], [23.5, 28.5], [28.5, 35], [35, 41.5], [41.5, 50], [50, 57], [57, 999]];
  const CALL = [[5.0, 8.9], [12.4, 15.6], [20.2, 23.2], [31.0, 34.8], [37.4, 41.0], [45.4, 49.6]];
  const beats = qa(".mg-beat").map((el) => ({ el, k: el.querySelector(".mg-k"), p: el.querySelector(".mg-p"), w: [...el.querySelectorAll(".mg-w > span")] }));
  const calls = qa(".mg-co").map((el) => ({ el, line: el.querySelector(".mg-co-line") }));

  // Sounds, by moment
  const SFX = [
    [0.3, "grow"], [3.75, "tick"], [10.2, "tap"], [10.35, "grow"], [12.2, "tick"], [13.6, "tick"], [14.85, "tap"], [15.0, "shrink"],
    [16.6, "tap"], [19.6, "tap"], [24.0, "alert"], [25.2, "tap"], [25.35, "grow"], [27.3, "tap"], [29.6, "tap"], [35.6, "tap"],
    [41.8, "alert"], [42.9, "tap"], [43.05, "grow"], [47.3, "tap"], [47.45, "shrink"], [47.65, "done"], [57.0, "grow"],
  ];
  const CH = [0, 9.5, 16, 23.5, 28.5, 35, 41.5, 50];
  const TOTAL = 62;
  const REST = [8.8, 13.9, 22.8, 27.0, 34.5, 40.8, 46.5, 61.5];

  // Elements
  const vEl = q(".mg-vis"), phone = q(".mg-phone"), screenEl = q(".mg-screen"), panel = q(".mg-panel");
  const splash = $(".spl"), splImg = $(".spl img");
  const touch = $(".tch"), tDot = $(".tch i"), tRing = $(".tch b");
  const nbs = { low: $('.nb[data-k="low"]'), leak: $('.nb[data-k="leak"]') }, toast = $(".tst");
  const homeParts = [".top", ".tank-card", ".motor", ".week", ".tb"].map((s) => $(s, f1));
  const h1Water = $(".tank-water", f1), h1Big = $(".big", f1).firstChild, h1Sub = $(".sub", f1), h1Timer = $(".motor .timer", f1);
  const r2 = { stop: [$(".tank-h--stop", f2), $$(".tank-line", f2)[0], $(".range-v > div:nth-child(1) .rv", f2)], start: [$(".tank-h--start", f2), $$(".tank-line", f2)[1], $(".range-v > div:nth-child(2) .rv", f2)] };
  const run = $(".run", f3), runMk = $(".mk", run), runTimer = $(".timer--xl", f3), runSub = $(".msub", run), runProg = $(".prog", f3), runBar = $(".prog i", f3);
  const stopBtn = $(".stop--wide", f3), stopHTML = stopBtn.innerHTML, fillTab = $(".tb-fill", f3);
  const segK4 = $(".seg-k", f4), segSpans4 = $$(".seg span", f4), segK7 = $(".seg-k", f7);
  const predT = $(".pred-t", f7), planTag = $(".plan .ltag", f7);
  const bars = $$(".ch i", f6).map((el) => [el, parseFloat(el.style.height)]);
  const useN = $$(".use-n", f6).map((el) => el.firstChild), runRows = $$(".runrow", f6);
  const chartSvg = $(".chart-w svg", f8), delta = $(".delta", f8), lbls = $$(".lbl", f8), actions = $(".actions", f8);
  const banner9 = $(".banner", f9), offBar = $(".offline", f10);
  const clock = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const STOP_T = 19.75;

  let cqw = 4, tall = false;
  const measure = () => {
    cqw = vEl.clientWidth / 100 || 4;
    tall = vEl.clientHeight > vEl.clientWidth * 0.8;
    app.style.setProperty("--k", (screenEl.clientWidth / 360).toFixed(5));
  };
  const fade = (el, o, dy = 0, unit = "px", extra = "") => {
    el.style.visibility = o > 0.002 ? "visible" : "hidden";
    el.style.opacity = o.toFixed(3);
    el.style.transform = `translateY(${dy.toFixed(2)}${unit})${extra}`;
  };

  const frame = (t) => {
    // Panel and camera
    const pIn = win(t, 0.05, 1.0, out5), pEnd = win(t, 57.0, 0.9, out5);
    panel.style.transform = tall ? `scaleY(${(0.68 * pIn + 0.32 * pEnd).toFixed(4)})` : `scaleX(${(0.5 * pIn + 0.5 * pEnd).toFixed(4)})`;
    const [ry, rx, s0, x0, y0] = cam(t);
    const s = tall ? 1 + (s0 - 1) * 0.6 : s0, pw = phone.offsetWidth;
    phone.style.transform = `translate(-50%, -50%) translate(${(x0 * pw).toFixed(1)}px, ${(y0 * pw).toFixed(1)}px) perspective(${(pw * 6).toFixed(0)}px) rotateY(${ry.toFixed(2)}deg) rotateX(${rx.toFixed(2)}deg) scale(${s.toFixed(4)})`;

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
    homeParts.forEach((el, i) => { const p = win(t, 2.3 + i * 0.07, 0.6, out5); el.style.opacity = p.toFixed(3); el.style.transform = `translateY(${((1 - p) * 26).toFixed(1)}px)`; });
    const lv = win(t, 2.45, 1.3, io);
    h1Water.style.height = (78 * lv).toFixed(2) + "%";
    h1Big.nodeValue = String(Math.round(78 * lv));
    h1Sub.textContent = `${L(1560 * lv)} of 2,000 L`;
    const secs = 252 + Math.max(0, Math.min(t, STOP_T) - 2.5);
    h1Timer.textContent = clock(252 + Math.max(0, t - 2.5));

    // Fill range
    for (const k of ["stop", "start"]) {
      const [a, d, v0, v1] = DRAG[k], v = mix(v0, v1, win(t, a, d, io)), [h, line, rv] = r2[k];
      h.style.bottom = line.style.bottom = v.toFixed(2) + "%";
      rv.firstChild.nodeValue = Math.round(v) + "%";
      rv.lastChild.textContent = `${L(v * 20)} L`;
    }

    // Motor: the timer and the bar run until Stop; then the card says what changed
    runTimer.textContent = clock(secs);
    runBar.style.width = ((secs / 1080) * 100).toFixed(2) + "%";
    const st = win(t, STOP_T, 0.35);
    run.style.background = rgb(mix([203, 248, 72], [19, 21, 25], st));
    run.style.color = rgb(mix([13, 14, 17], [244, 246, 250], st));
    run.style.boxShadow = st > 0.5 ? "inset 0 0 0 1px rgba(255,255,255,.08)" : "none";
    runMk.lastChild.nodeValue = t < STOP_T ? "RUNNING · AUTOMATIC" : "STOPPED · MANUAL";
    runSub.textContent = t < STOP_T ? "of about 18 min" : "Manual until you switch back";
    runSub.style.color = t < STOP_T ? "" : "#99a1ae";
    runProg.style.opacity = (1 - 0.7 * st).toFixed(3);
    const swapped = t >= STOP_T + 0.1;
    if (swapped !== stopBtn.classList.contains("btn")) {
      stopBtn.className = swapped ? "btn lime-btn" : "stop stop--wide";
      stopBtn.innerHTML = swapped ? "Start motor" : stopHTML;
    }
    stopBtn.style.opacity = (1 - Math.max(0, 1 - Math.abs(t - (STOP_T + 0.1)) / 0.1)).toFixed(3);
    fillTab.classList.toggle("off", t < STOP_T);
    fillTab.querySelector("small").textContent = t < STOP_T ? "Filling" : "Fill now";

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
    planTag.style.transform = `scale(${(0.6 + 0.4 * pt).toFixed(3)})`;
    planTag.style.opacity = clamp(pt * 1.5).toFixed(3);

    // Usage: bars grow, totals count, the runs arrive
    bars.forEach(([el, h], i) => { el.style.height = (h * win(t, 35.9 + i * 0.05, 0.55, out5)).toFixed(1) + "%"; });
    const un = win(t, 35.9, 1.0, out);
    useN[0].nodeValue = L(1240 * un) + " ";
    useN[1].nodeValue = (8.4 * un).toFixed(1) + " ";
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
