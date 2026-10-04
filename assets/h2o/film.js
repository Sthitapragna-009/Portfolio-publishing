/* H2o Connect walkthrough film.
   A fixed timeline of state changes. Each step edits a plain state object and
   render() applies the whole state to the DOM, so seeking is just replaying
   the steps up to that moment with transitions switched off. Touch markers,
   ripples and caption fades are effects that only run during playback. */
(() => {
  const root = document.querySelector("[data-film]");
  if (!root) return;
  const q = (s) => root.querySelector(s);
  const qa = (s) => [...root.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const CAPS = [
    ["Launch", "One tap from the home screen", "H2o Connect opens straight to the tank. No dashboard to decode and no menu to find."],
    ["The app", "Home", "Everything the family needs in one card: the level in percent and litres, what the motor is doing, and how long until the tank is full."],
    ["The app", "Fill range", "Two levels, set once. The motor starts at 25% and stops at 90%, shown in litres too, because nobody thinks about a tank in percentages."],
    ["The app", "Motor", "“Running” is confirmed by current draw, not by the relay being on. Stop is a large target and never asks twice."],
    ["The app", "Low water alert", "In Manual mode the app warns but never acts. It offers the action and leaves the choice with you."],
    ["The app", "Automation", "Automatic, Manual and Smart are equals. Switching takes one tap, and the active mode is always named."],
    ["The app", "Smart mode", "Every prediction shows its confidence and evidence. Tonight’s fill moves to off-peak hours, inside the family’s quiet hours."],
    ["The app", "Usage", "The first honest answer to “what does this cost?”. Litres and electricity side by side, tied to each motor run."],
    ["The app", "Smart insight", "The only screen that interrupts. The evidence comes first: 42 litres lost overnight while every tap was closed."],
    ["The app", "One tap to act", "Close the inlet valve, or say “that was us” and Smart learns the household’s pattern. Both choices carry equal weight."],
    ["Hardware", "Sensor, unit, app", "A sonar sensor on the lid reads the level without touching the water. The display unit by the motor switch runs the pump, and the app mirrors it live."],
    ["Hardware", "Built to save power", "Zero-contact sensing eliminates corrosion. Automated motor scheduling is estimated to cut energy bills by 20 to 40% for large facilities."],
    ["Wearables", "Alerts on the wrist", "The low water alert reaches Apple Watch and Galaxy Watch with the action attached, so the fix is one tap away."],
    ["Wearables", "Start and stop from the watch", "Start the motor from the wrist and watch the tank fill. Stop is always the biggest thing on the screen."],
    ["Smart home", "Every screen in the house", "The same tank on Echo Show, Nest Hub and a HomePod with a screen. One Matter certification covers them all."],
    ["Smart home", "Amazon Echo Show", "“Alexa, how full is the tank?” The answer and the Stop button share one glanceable card."],
    ["Smart home", "Google Nest Hub", "The tank sits beside the rest of the home controls, with today’s runs, the cost and a suggested off-peak routine."],
    ["Smart home", "HomePod with a screen", "Designed for Apple’s rumoured home display: “Hey Siri, stop the pump.” Concept device render: 9to5Mac."],
    ["H2o Connect", "One tank. Every screen in the home.", "A product by Dwaj‑Tech. Research, system, hardware and app, designed end to end."],
  ];
  const CH = [0, 3.8, 35, 44.5, 53];
  const TOTAL = 66.5;

  const init = () => ({ scene: "launch", scr: {}, launch: "", ios: true, press: false, banner: "", toast: false, fill: false, stats: false, aw: "aw4", gw: "g1", active: "", cap: 0 });

  // Effects
  const vis = q(".mo-vis");
  const tapEl = q(".mo-tap");
  const vtapEl = q(".mo-vtap");
  const pulse = (el) => el.animate(
    [
      { opacity: 0, transform: "translate(-50%, -50%) scale(1.35)" },
      { opacity: 1, transform: "translate(-50%, -50%) scale(0.85)", offset: 0.35 },
      { opacity: 0, transform: "translate(-50%, -50%) scale(1)" },
    ],
    { duration: 720, easing: "ease-out" }
  );
  const tap = (x, y) => () => { tapEl.style.left = x + "%"; tapEl.style.top = y + "%"; pulse(tapEl); };
  const vtap = (sel) => () => {
    const h = q(sel).getBoundingClientRect(), v = vis.getBoundingClientRect();
    vtapEl.style.left = ((h.left - v.left) / v.width) * 100 + "%";
    vtapEl.style.top = ((h.top - v.top) / v.height) * 100 + "%";
    pulse(vtapEl);
  };
  const ripple = () => qa(".mo-ripple").forEach((el, i) => el.animate(
    [{ opacity: 0.7, transform: "translate(-50%, -50%) scale(0.4)" }, { opacity: 0, transform: "translate(-50%, -50%) scale(2.6)" }],
    { duration: 1400, delay: i * 350, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" }
  ));

  // Timeline
  const T = [];
  const at = (t, s, fx) => T.push({ t, s, fx });
  // Launch
  at(1.5, (s) => { s.press = true; }, tap(61.5, 37.6));
  at(1.7, (s) => { s.launch = "on"; });
  at(1.78, (s) => { s.launch = "open"; s.press = false; });
  at(3.3, (s) => { s.scr.f1 = "on"; });
  at(3.8, (s) => { s.launch = ""; s.ios = false; s.scene = "app"; s.cap = 1; });
  // Home to fill range and back
  at(6.4, null, tap(24.6, 34.7));
  at(6.65, (s) => { s.scr.f2 = "on"; s.scr.f1 = "under"; s.cap = 2; });
  at(9.3, null, tap(50, 78.2));
  at(9.55, (s) => { s.scr.f2 = ""; s.scr.f1 = "on"; });
  // Motor tab
  at(10.9, null, tap(49.9, 88.1));
  at(11.1, (s) => { s.scr.f3 = "on"; s.cap = 3; });
  at(11.7, (s) => { s.scr.f1 = ""; });
  // Low water alert, then switch to Automatic
  at(13.6, (s) => { s.banner = "low"; s.cap = 4; });
  at(15.0, null, tap(50, 10.5));
  at(15.2, (s) => { s.banner = ""; s.scr.f5 = "on"; });
  at(18.1, null, tap(50, 83.9));
  at(18.35, (s) => { s.scr.f5 = ""; s.scr.f4 = "on"; s.cap = 5; });
  at(18.9, (s) => { s.scr.f3 = ""; });
  // Smart mode
  at(21.3, null, tap(78.5, 23.3));
  at(21.5, (s) => { s.scr.f7 = "on"; s.cap = 6; });
  at(22.1, (s) => { s.scr.f4 = ""; });
  // Usage tab
  at(24.6, null, tap(32.9, 88.1));
  at(24.8, (s) => { s.scr.f6 = "on"; s.cap = 7; });
  at(25.4, (s) => { s.scr.f7 = ""; });
  // Leak insight
  at(27.3, (s) => { s.banner = "leak"; s.cap = 8; });
  at(28.6, null, tap(50, 10.5));
  at(28.8, (s) => { s.banner = ""; s.scr.f8 = "on"; });
  at(31.6, null, tap(50, 59.3));
  at(31.8, (s) => { s.toast = true; s.cap = 9; });
  at(33.3, (s) => { s.scr.f8 = ""; });
  at(34.2, (s) => { s.toast = false; });
  // Hardware
  at(35, (s) => { s.scene = "hw"; s.scr.f1 = "on"; s.scr.f6 = ""; s.cap = 10; });
  at(35.9, (s) => { s.fill = true; });
  at(39.6, (s) => { s.stats = true; s.cap = 11; });
  // Wearables
  at(44.5, (s) => { s.scene = "watch"; s.stats = false; s.cap = 12; });
  at(45.6, (s) => { s.aw = "aw2"; s.gw = "g2"; s.scr.f5 = "on"; }, ripple);
  at(47.8, null, vtap(".mo-hot"));
  at(48.0, (s) => { s.aw = "aw1"; s.gw = "g1"; s.scr.f5 = ""; s.cap = 13; });
  // Smart home
  at(53, (s) => { s.scene = "home"; s.cap = 14; });
  at(54.6, (s) => { s.active = "echo"; s.cap = 15; });
  at(57, (s) => { s.active = "nest"; s.cap = 16; });
  at(59.4, (s) => { s.active = "homepod"; s.cap = 17; });
  // End card
  at(62, (s) => { s.scene = "end"; s.active = ""; s.cap = 18; });
  T.sort((a, b) => a.t - b.t);

  // Render
  const scrEls = qa(".mo-scr");
  const launch = q(".mo-launch");
  const ios = q(".mo-ios");
  const icon = q(".mo-icon");
  const banners = qa(".mo-banner");
  const toast = q(".mo-toast");
  const watchImgs = qa("[data-w]");
  const cap = q(".mo-cap");
  const capK = q(".mo-cap-k"), capT = q(".mo-cap-t"), capP = q(".mo-cap-p");
  let st = init(), shownCap = 0, capTimer = 0;

  const setCap = (i, live) => {
    shownCap = i;
    clearTimeout(capTimer);
    const write = () => {
      [capK.textContent, capT.textContent, capP.textContent] = CAPS[i];
      cap.classList.remove("is-swap");
    };
    if (!live) return write();
    cap.classList.add("is-swap");
    capTimer = setTimeout(write, 230);
  };

  const render = (live) => {
    root.dataset.scene = st.scene;
    root.dataset.active = st.active;
    scrEls.forEach((el) => {
      const v = st.scr[el.dataset.k] || "";
      el.classList.toggle("is-on", v === "on");
      el.classList.toggle("is-under", v === "under");
    });
    launch.dataset.s = st.launch;
    ios.classList.toggle("is-off", !st.ios);
    icon.classList.toggle("is-press", st.press);
    banners.forEach((b) => b.classList.toggle("is-on", b.dataset.k === st.banner));
    toast.classList.toggle("is-on", st.toast);
    root.classList.toggle("is-fill", st.fill);
    root.classList.toggle("is-stats", st.stats);
    watchImgs.forEach((img) => img.classList.toggle("is-on", img.dataset.w === st.aw || img.dataset.w === st.gw));
    if (st.cap !== shownCap) setCap(st.cap, live);
  };

  // Progress bar
  const chEls = qa(".mo-ch");
  let t = 0, idx = 0, playing = false, last = 0, raf = 0, userPaused = false;
  const bar = () => chEls.forEach((el, i) => {
    const a = CH[i], b = CH[i + 1] ?? TOTAL;
    el.style.setProperty("--p", Math.max(0, Math.min(1, (t - a) / (b - a))).toFixed(4));
    el.classList.toggle("is-now", t >= a && t < b);
  });

  const seek = (x) => {
    t = x; idx = 0; st = init();
    while (idx < T.length && T[idx].t <= x) { if (T[idx].s) T[idx].s(st); idx++; }
    root.classList.add("is-instant");
    render(false);
    void root.offsetWidth;
    root.classList.remove("is-instant");
    bar();
  };

  const tick = (now) => {
    if (!playing) return;
    t += Math.min((now - last) / 1000, 0.1);
    last = now;
    while (idx < T.length && T[idx].t <= t) {
      const step = T[idx++];
      if (step.s) { step.s(st); render(true); }
      if (step.fx) step.fx();
    }
    if (t >= TOTAL) seek(0);
    bar();
    raf = requestAnimationFrame(tick);
  };

  const playBtn = q(".mo-play");
  const play = () => {
    if (playing) return;
    playing = true;
    root.classList.add("is-playing");
    root.classList.remove("is-paused");
    playBtn.setAttribute("aria-label", "Pause walkthrough");
    last = performance.now();
    raf = requestAnimationFrame(tick);
  };
  const pause = () => {
    playing = false;
    cancelAnimationFrame(raf);
    root.classList.remove("is-playing");
    root.classList.add("is-paused");
    playBtn.setAttribute("aria-label", "Play walkthrough");
  };

  playBtn.addEventListener("click", () => {
    if (playing) { userPaused = true; pause(); }
    else { userPaused = false; play(); }
  });
  chEls.forEach((el, i) => el.addEventListener("click", () => {
    seek(CH[i]);
    userPaused = false;
    play();
  }));

  seek(0);
  pause();  // Autoplay while the film is on screen, unless the visitor paused it or prefers less motion.
  new IntersectionObserver(([en]) => {
    if (en.isIntersecting && !userPaused && !reduce) play();
    else if (!en.isIntersecting) pause();
  }, { threshold: 0.45 }).observe(vis);
})();
