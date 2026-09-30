/* =========================================================
   KSP — Portfolio interactions
   ========================================================= */

(function () {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Theme ---------- */
  const themeToggle = document.getElementById("themeToggle");
  const root = document.documentElement;

  let switchTimer = null;
  const SWITCH_MS = 500;

  const applyTheme = (name, animate) => {
    const eased = Boolean(animate) && !reduced;

    if (eased) {
      root.classList.add("theme-switching");
      clearTimeout(switchTimer);
      switchTimer = setTimeout(() => {
        root.classList.remove("theme-switching");
      }, SWITCH_MS);
    }

    root.dataset.theme = name;
    if (themeToggle) {
      themeToggle.setAttribute("aria-checked", String(name === "light"));
      // The label names the destination, not the current state.
      themeToggle.querySelector(".sr-only").textContent =
        name === "light" ? "Dark theme" : "Light theme";
    }
    // Anything painting outside CSS (the canvas) re-reads its colours here.
    document.dispatchEvent(new CustomEvent("themechange", {
      detail: { animate: eased, duration: SWITCH_MS }
    }));
  };

  // The inline head script already picked the starting theme; sync the button.
  applyTheme(root.dataset.theme === "dark" ? "dark" : "light", false);

  if (themeToggle) {
    const setTheme = (name) => {
      applyTheme(name, true);
      try {
        localStorage.setItem("theme", name);
      } catch (e) {
        /* private mode: the choice just won't survive a reload */
      }
    };

    themeToggle.addEventListener("click", () => {
      // A drag ends in a click; that click must not undo the drag.
      if (themeToggle.dataset.justDragged === "true") {
        delete themeToggle.dataset.justDragged;
        return;
      }
      setTheme(root.dataset.theme === "light" ? "dark" : "light");
    });

    /* ---- Drag the knob ---- */

    const rail = themeToggle.querySelector(".theme-toggle-rail");
    const knob = themeToggle.querySelector(".theme-toggle-knob");

    if (rail && knob && window.PointerEvent) {
      let startX = 0;
      let startSeat = 0;
      let travel = 0;
      let moved = 0;
      let dragging = false;

      // The rail is a different length at each breakpoint, so the distance the
      // knob can cover is measured rather than assumed. offsetLeft is the
      // knob's inset, and the same gap is left at the far end.
      const measure = () => Math.max(
        0,
        rail.clientWidth - knob.offsetWidth - knob.offsetLeft * 2
      );

      const seatNow = () => (root.dataset.theme === "light" ? 0 : measure());

      /* Pointers fire faster than the screen refreshes, so the position is
         recorded on every event but written once a frame. Writing on each
         event costs a style recalc per event and makes the drag feel gritty. */
      let pendingAt = 0;
      let frame = null;

      const flush = () => {
        frame = null;
        knob.style.setProperty("--drag", pendingAt + "px");
      };

      const onMove = (event) => {
        if (!dragging) return;
        const dx = event.clientX - startX;
        moved = Math.max(moved, Math.abs(dx));
        pendingAt = Math.min(travel, Math.max(0, startSeat + dx));
        if (frame === null) frame = requestAnimationFrame(flush);
      };

      let settleTimer = null;

      const endSettle = () => {
        clearTimeout(settleTimer);
        themeToggle.removeAttribute("data-settling");
        knob.style.removeProperty("--drag");
      };

      const onUp = (event) => {
        if (!dragging) return;
        dragging = false;
        if (frame !== null) { cancelAnimationFrame(frame); frame = null; }
        try { rail.releasePointerCapture(event.pointerId); } catch (e) {}

        const dx = event.clientX - startX;
        const at = Math.min(travel, Math.max(0, startSeat + dx));

        // Past the midpoint picks the far end; short of it, the knob falls
        // back to where it started.
        const wantLight = travel === 0 ? root.dataset.theme !== "light" : at < travel / 2;
        const next = wantLight ? "light" : "dark";
        const target = wantLight ? 0 : travel;

        // Anything more than a few pixels was a drag, not a tap, so the click
        // that follows is suppressed.
        if (moved > 4) themeToggle.dataset.justDragged = "true";

        // Hand over from dragging to settling in one go, starting from exactly
        // where the finger left off.
        knob.style.setProperty("--drag", at + "px");
        themeToggle.dataset.settling = "true";
        themeToggle.removeAttribute("data-dragging");

        if (next !== root.dataset.theme) setTheme(next);

        if (Math.abs(target - at) < 0.5 || reduced) {
          endSettle();
        } else {
          // A frame at the start value first, or the browser coalesces both
          // writes and there is nothing to interpolate between.
          requestAnimationFrame(() => {
            knob.style.setProperty("--drag", target + "px");
          });
          clearTimeout(settleTimer);
          settleTimer = setTimeout(endSettle, 520);
        }
      };

      knob.addEventListener("transitionend", (event) => {
        if (event.propertyName === "transform" && themeToggle.dataset.settling === "true") endSettle();
      });

      rail.addEventListener("pointerdown", (event) => {
        // Left button or touch only.
        if (event.button !== undefined && event.button !== 0) return;
        travel = measure();
        startX = event.clientX;
        startSeat = seatNow();
        moved = 0;
        dragging = true;
        themeToggle.dataset.dragging = "true";
        knob.style.setProperty("--drag", startSeat + "px");
        try { rail.setPointerCapture(event.pointerId); } catch (e) {}
      });

      rail.addEventListener("pointermove", onMove);
      rail.addEventListener("pointerup", onUp);
      rail.addEventListener("pointercancel", onUp);
    }
  }


  /* ---------- Sticky nav state ---------- */
  const nav = document.getElementById("nav");
  const setStuck = () => {
    if (nav) nav.classList.toggle("is-stuck", window.scrollY > 24);
  };
  setStuck();
  window.addEventListener("scroll", setStuck, { passive: true });

  /* ---------- Mobile menu ---------- */
  const toggle = document.getElementById("navToggle");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    nav.querySelectorAll(".nav-links a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Rotating headline word ---------- */
  const wordList = document.getElementById("heroWords");

  if (wordList) {
    const items = [...wordList.querySelectorAll(".hero-word-item")];
    const HOLD = 2400; // dwell between words
    const ROLL = 1200; // must match the transition on .hero-word-item

    if (items.length > 1) {
      let index = 0;
      let timer;

      const advance = () => {
        const current = items[index];
        index = (index + 1) % items.length;
        const next = items[index];

        current.classList.remove("is-active");
        current.classList.add("is-leaving");
        next.classList.add("is-active");

        // Once it has rolled out of view, drop it back below the window with
        // the transition suppressed for a frame, ready for its next turn.
        setTimeout(() => {
          current.classList.add("no-anim");
          current.classList.remove("is-leaving");
          void current.offsetHeight; // flush the reflow before re-enabling
          current.classList.remove("no-anim");
        }, ROLL + 60);
      };

      const start = () => {
        clearInterval(timer);
        timer = setInterval(advance, HOLD);
      };
      const stop = () => clearInterval(timer);

      start();

      // Don't animate offscreen or in a hidden tab.
      document.addEventListener("visibilitychange", () => {
        document.hidden ? stop() : start();
      });

      if ("IntersectionObserver" in window) {
        new IntersectionObserver(
          (entries) => entries.forEach((e) => (e.isIntersecting ? start() : stop())),
          { threshold: 0 }
        ).observe(wordList);
      }
    }
  }

  /* ---------- Scroll reveal ---------- */
  const revealables = document.querySelectorAll(".reveal");

  if (reduced || !("IntersectionObserver" in window)) {
    revealables.forEach((el) => el.classList.add("in"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    revealables.forEach((el) => revealObserver.observe(el));
  }

  /* ---------- Capabilities accordion ---------- */
  const capList = document.getElementById("capList");

  if (capList) {
    const caps = [...capList.querySelectorAll(".cap")];

    const setOpen = (cap, open) => {
      const panel = cap.querySelector(".cap-panel");
      const trigger = cap.querySelector(".cap-trigger");
      cap.dataset.open = String(open);
      trigger.setAttribute("aria-expanded", String(open));
      // Fall back to "none" if the panel measures 0 (e.g. zero-width viewport),
      // so an opened panel is never stuck closed.
      const h = open ? panel.scrollHeight : 0;
      panel.style.maxHeight = open ? (h > 0 ? h + "px" : "none") : "0px";
    };

    // Apply the initial state declared in the markup.
    caps.forEach((cap) => setOpen(cap, cap.dataset.open === "true"));

    capList.addEventListener("click", (event) => {
      const trigger = event.target.closest(".cap-trigger");
      if (!trigger) return;

      const cap = trigger.closest(".cap");
      const willOpen = cap.dataset.open !== "true";

      caps.forEach((item) => setOpen(item, false));
      if (willOpen) setOpen(cap, true);
    });

    // Keep the open panel correctly sized when the text reflows.
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        // A zero-width viewport (tab hidden, window minimised) measures as 0.
        // Recomputing from that would silently collapse an open panel.
        if (!window.innerWidth) return;

        caps.forEach((cap) => {
          if (cap.dataset.open !== "true") return;
          const panel = cap.querySelector(".cap-panel");
          panel.style.maxHeight = "none";
          const h = panel.scrollHeight;
          panel.style.maxHeight = h > 0 ? h + "px" : "none";
        });
      }, 150);
    });
  }

  /* ---------- Seamless marquee ---------- */
  // The track is duplicated in markup; nothing to do unless it is
  // narrower than the viewport, in which case clone until it fills.
  document.querySelectorAll(".marquee").forEach((marquee) => {
    const track = marquee.querySelector(".marquee-track");
    if (!track) return;

    let guard = 0;
    while (track.scrollWidth < window.innerWidth && guard < 4) {
      marquee.querySelectorAll(".marquee-track").forEach((t) => {
        marquee.appendChild(t.cloneNode(true));
      });
      guard += 1;
    }
  });

  /* ---------- Hero photo carousel (small screens only) ---------- */
  const heroBand = document.querySelector(".hero-band");

  if (heroBand) {
    const panels = [...heroBand.querySelectorAll(".hero-panel")];
    const small = window.matchMedia("(max-width: 860px)");
    const HOLD = 5000; // dwell before the next photo breathes in

    let shown = 0;
    let cycle = null;

    const reveal = (i) => {
      panels.forEach((panel, n) => panel.classList.toggle("is-showing", n === i));
    };

    const advancePhoto = () => {
      shown = (shown + 1) % panels.length;
      reveal(shown);
    };

    const beginCycle = () => {
      clearInterval(cycle);
      cycle = null;
      // Reduced motion still gets a photo, just no cycling between them.
      if (!reduced && panels.length > 1) cycle = setInterval(advancePhoto, HOLD);
    };

    const enterCarousel = () => {
      heroBand.classList.add("is-carousel");
      shown = 0;
      reveal(0);
      beginCycle();
    };

    const exitCarousel = () => {
      clearInterval(cycle);
      cycle = null;
      heroBand.classList.remove("is-carousel");
      // Both panels sit side by side again, so no one photo is "showing".
      panels.forEach((panel) => panel.classList.remove("is-showing"));
    };

    const syncCarousel = () => {
      if (small.matches) {
        if (!heroBand.classList.contains("is-carousel")) enterCarousel();
      } else if (heroBand.classList.contains("is-carousel")) {
        exitCarousel();
      }
    };

    syncCarousel();

    if (small.addEventListener) small.addEventListener("change", syncCarousel);
    else small.addListener(syncCarousel); // Safari < 14

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        clearInterval(cycle);
        cycle = null;
      } else if (heroBand.classList.contains("is-carousel")) {
        beginCycle();
      }
    });
  }


  /* ---------- Colour options carousel ---------- */
  // Only present on case-study pages that have one; a no-op everywhere else.
  const track = document.getElementById("colourTrack");

  if (track) {
    const slides = Array.from(track.querySelectorAll(".swatch-slide"));
    const dots = Array.from(document.querySelectorAll(".swatch-dot"));
    const navs = Array.from(document.querySelectorAll(".swatch-nav"));
    const AUTO_MS = 4000;
    let auto = null;
    let ticking = false;

    // Index of whichever slide currently sits nearest the left edge.
    const currentIndex = () => {
      let best = 0;
      let bestGap = Infinity;
      slides.forEach((slide, i) => {
        const gap = Math.abs(slide.offsetLeft - track.scrollLeft);
        if (gap < bestGap) { bestGap = gap; best = i; }
      });
      return best;
    };

    const goTo = (i) => {
      const clamped = Math.max(0, Math.min(slides.length - 1, i));
      track.scrollTo({
        left: slides[clamped].offsetLeft,
        behavior: reduced ? "auto" : "smooth"
      });
    };

    const sync = () => {
      const i = currentIndex();
      dots.forEach((d, n) => d.classList.toggle("is-active", n === i));
      // Buttons disable at the ends rather than wrapping, so the scroll
      // position and the controls can never disagree.
      const atStart = track.scrollLeft <= 2;
      const atEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
      navs.forEach((b) => {
        const dir = Number(b.dataset.dir);
        b.disabled = dir < 0 ? atStart : atEnd;
      });
    };

    const stopAuto = () => { clearInterval(auto); auto = null; };
    const startAuto = () => {
      if (reduced || auto || slides.length < 2) return;
      auto = setInterval(() => {
        const atEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
        goTo(atEnd ? 0 : currentIndex() + 1);
      }, AUTO_MS);
    };

    track.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { sync(); ticking = false; });
    }, { passive: true });

    navs.forEach((b) => {
      b.addEventListener("click", () => {
        stopAuto();
        goTo(currentIndex() + Number(b.dataset.dir));
        startAuto();
      });
    });

    dots.forEach((d) => {
      d.addEventListener("click", () => {
        stopAuto();
        goTo(Number(d.dataset.index));
        startAuto();
      });
    });

    // Auto-advance is a convenience, never something that fights the reader.
    const shell = track.closest(".swatch-carousel") || track.parentElement;
    ["pointerenter", "focusin", "touchstart"].forEach((evt) =>
      shell.addEventListener(evt, stopAuto, { passive: true })
    );
    ["pointerleave", "focusout"].forEach((evt) =>
      shell.addEventListener(evt, startAuto)
    );
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopAuto(); else startAuto();
    });

    window.addEventListener("resize", sync);
    sync();
    startAuto();
  }

  /* ---------- Ambient dot field ---------- */
  const field = document.getElementById("dotField");

  if (field && field.getContext) {
    const ctx = field.getContext("2d");

    const SPACING = 22;   // grid pitch in CSS px
    const BANDS = 10;     // quantisation steps, see the batching note below
    const A_MIN = 0.045;  // dimmest dot
    const A_MAX = 0.30;   // brightest dot
    const R_MIN = 0.85;
    const R_MAX = 1.55;

    let xs = [];
    let ys = [];
    // Column / row index per dot, so the wave can be read from tables.
    let ci = [];
    let ri = [];
    let cols = 0;
    let rows = 0;
    let colT = null;
    let rowT = null;
    let diagT = null;
    let offX = 0;
    let offY = 0;
    let dotR = 255;
    let dotG = 255;
    let dotB = 255;
    let dotScale = 1;
    // Colour fade state, used when the theme changes under us.
    let fadeFrom = null;
    let fadeTo = null;
    let fadeStart = 0;
    let fadeMs = 500;

    const targetDotColour = () => {
      const cs = getComputedStyle(document.documentElement);
      const parts = (cs.getPropertyValue("--dot-rgb") || "255,255,255")
        .split(",")
        .map((n) => parseFloat(n) || 0);
      return {
        r: parts[0],
        g: parts[1],
        b: parts[2],
        s: parseFloat(cs.getPropertyValue("--dot-strength")) || 1
      };
    };

    const setDotColour = (c) => {
      dotR = c.r; dotG = c.g; dotB = c.b; dotScale = c.s;
    };

    const readDotColour = () => setDotColour(targetDotColour());

    // Advanced from draw(), so the fade rides the frames already being drawn.
    const stepFade = () => {
      if (!fadeTo) return;
      const p = Math.min((performance.now() - fadeStart) / fadeMs, 1);
      const e = p * p * (3 - 2 * p); // smoothstep, to match the CSS easing
      dotR = fadeFrom.r + (fadeTo.r - fadeFrom.r) * e;
      dotG = fadeFrom.g + (fadeTo.g - fadeFrom.g) * e;
      dotB = fadeFrom.b + (fadeTo.b - fadeFrom.b) * e;
      dotScale = fadeFrom.s + (fadeTo.s - fadeFrom.s) * e;
      if (p >= 1) { fadeTo = null; fadeFrom = null; }
    };
    let w = 0;
    let h = 0;
    let frame = null;
    let started = 0;
    let elapsed = 0; // wave time banked while paused, so it resumes in place

    // Dots are drawn thousands at a time, so rather than setting fillStyle per
    // dot the wave value is quantised into a few bands. Radius and alpha both
    // derive from that one value, so a band fixes both and every dot in it can
    // go into a single path with one fill.
    const buckets = [];
    for (let b = 0; b < BANDS; b += 1) buckets.push([]);

    const build = () => {
      readDotColour();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = field.clientWidth;
      h = field.clientHeight;
      if (!w || !h) return;

      field.width = Math.round(w * dpr);
      field.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      xs = [];
      ys = [];
      ci = [];
      ri = [];
      cols = Math.ceil(w / SPACING) + 1;
      rows = Math.ceil(h / SPACING) + 1;
      offX = (w - (cols - 1) * SPACING) / 2;
      offY = (h - (rows - 1) * SPACING) / 2;

      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          xs.push(offX + c * SPACING);
          ys.push(offY + r * SPACING);
          ci.push(c);
          ri.push(r);
        }
      }

      // The three waves are functions of x, of y, and of (x + y). On a regular
      // grid each of those takes only a handful of distinct values, so they can
      // be tabulated once per frame instead of evaluated per dot.
      colT = new Float64Array(cols);
      rowT = new Float64Array(rows);
      diagT = new Float64Array(cols + rows);
    };

    const draw = (t) => {
      if (!colT) return;

      stepFade();

      ctx.clearRect(0, 0, w, h);

      for (let b = 0; b < BANDS; b += 1) buckets[b].length = 0;

      // Three slow, non-harmonic waves so the field never visibly repeats.
      // Tabulated per column / row / diagonal — a few hundred sin() calls a
      // frame instead of three per dot.
      for (let c = 0; c < cols; c += 1) {
        colT[c] = Math.sin((offX + c * SPACING) * 0.011 + t * 0.55);
      }
      for (let r = 0; r < rows; r += 1) {
        rowT[r] = Math.sin((offY + r * SPACING) * 0.014 - t * 0.4);
      }
      for (let d = 0, n = cols + rows; d < n; d += 1) {
        diagT[d] = Math.sin((offX + offY + d * SPACING) * 0.007 + t * 0.28);
      }

      for (let i = 0; i < xs.length; i += 1) {
        const c = ci[i];
        const r = ri[i];
        const wave = colT[c] + rowT[r] + diagT[c + r];

        let band = Math.round(((wave / 3) * 0.5 + 0.5) * (BANDS - 1));
        if (band < 0) band = 0;
        else if (band > BANDS - 1) band = BANDS - 1;

        buckets[band].push(i);
      }

      for (let b = 0; b < BANDS; b += 1) {
        const list = buckets[b];
        if (!list.length) continue;

        const k = b / (BANDS - 1);
        const alpha = (A_MIN + k * (A_MAX - A_MIN)) * dotScale;
        ctx.fillStyle = "rgba(" + Math.round(dotR) + "," + Math.round(dotG) +
          "," + Math.round(dotB) + "," + alpha.toFixed(3) + ")";
        const radius = R_MIN + k * (R_MAX - R_MIN);

        ctx.beginPath();
        for (let j = 0; j < list.length; j += 1) {
          const i = list[j];
          ctx.moveTo(xs[i] + radius, ys[i]);
          ctx.arc(xs[i], ys[i], radius, 0, Math.PI * 2);
        }
        ctx.fill();
      }

    };

    const loop = (now) => {
      draw((now - started) / 1000);
      frame = requestAnimationFrame(loop);
    };

    const run = () => {
      if (frame || reduced) return;
      started = performance.now() - elapsed * 1000;
      frame = requestAnimationFrame(loop);
    };

    const halt = () => {
      if (!frame) return;
      elapsed = (performance.now() - started) / 1000;
      cancelAnimationFrame(frame);
      frame = null;
    };

    build();
    // Render once up front so the field is present on the first paint rather
    // than a frame later, and so it still shows if rAF never runs.
    draw(0);
    run();

    // Re-read the palette when the theme flips; redraw immediately so the
    // field doesn't hold the old colour until the next frame.
    document.addEventListener("themechange", (event) => {
      const wantsFade = event.detail && event.detail.animate;
      const to = targetDotColour();

      // No fade possible without a running loop (reduced motion, hidden tab),
      // so land on the new colour immediately in that case.
      if (!wantsFade || reduced || !frame) {
        setDotColour(to);
        fadeTo = null;
        draw(frame ? (performance.now() - started) / 1000 : elapsed);
        return;
      }

      fadeFrom = { r: dotR, g: dotG, b: dotB, s: dotScale };
      fadeTo = to;
      fadeMs = (event.detail && event.detail.duration) || 500;
      fadeStart = performance.now();
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) halt();
      else run();
    });

    let resizeTimer;
    const rebuild = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        build();
        draw(frame ? (performance.now() - started) / 1000 : elapsed);
      }, 120);
    };

    window.addEventListener("resize", rebuild);

    // A plain resize listener misses the case where the canvas has no size on
    // first layout and never fires afterwards, leaving the grid empty.
    if ("ResizeObserver" in window) {
      new ResizeObserver(rebuild).observe(field);
    }
  }

  /* ---------- Photography reels ---------- */

  /* Every row should travel at the same speed whatever it holds, so the
     duration comes from the row's real width rather than a fixed number --
     adding photographs makes a row longer, not faster. The width is only
     final once the images have their intrinsic size, so this reruns on load
     and on resize. */
  const reels = [...document.querySelectorAll("[data-reel]")];

  if (reels.length) {
    const PX_PER_SECOND = 46;

    const pace = () => {
      reels.forEach((track) => {
        const group = track.firstElementChild;
        if (!group) return;
        const width = group.getBoundingClientRect().width;
        if (!width) return;
        track.style.setProperty("--dur", (width / PX_PER_SECOND).toFixed(2) + "s");
      });
    };

    pace();
    window.addEventListener("load", pace);

    let paceTimer;
    window.addEventListener("resize", () => {
      clearTimeout(paceTimer);
      paceTimer = setTimeout(pace, 150);
    });
  }

  /* ---------- Photograph lightbox ---------- */

  const lightbox = document.getElementById("lightbox");

  if (lightbox) {
    const stage = lightbox.querySelector(".lightbox-stage img");
    const counter = lightbox.querySelector(".lightbox-counter");
    const caption = lightbox.querySelector(".lightbox-caption");
    const playBtn = lightbox.querySelector("[data-lightbox-play]");
    const playLabel = playBtn.querySelector("[data-play-label]");
    const iconPlay = playBtn.querySelector("[data-icon-play]");
    const iconPause = playBtn.querySelector("[data-icon-pause]");

    const SLIDE_MS = 3200;

    let items = [];      // { src, alt } for the gallery currently open
    let index = 0;
    let timer = null;
    let lastFocus = null;
    let idleTimer = null;

    /* The slideshow is a wallpaper show rather than a viewer: it takes the
       whole screen the way a video player does, and shows nothing but the
       photograph until the mouse moves. */
    const goFullscreen = () => {
      const req = lightbox.requestFullscreen || lightbox.webkitRequestFullscreen;
      // Rejects when the document is not allowed to go fullscreen (an embed
      // without the permission, say). The panel already covers the viewport,
      // so the show still runs -- it just is not true fullscreen.
      if (req) { try { Promise.resolve(req.call(lightbox)).catch(() => {}); } catch (e) {} }
    };

    const leaveFullscreen = () => {
      const el = document.fullscreenElement || document.webkitFullscreenElement;
      if (!el) return;
      const exit = document.exitFullscreen || document.webkitExitFullscreen;
      if (exit) { try { Promise.resolve(exit.call(document)).catch(() => {}); } catch (e) {} }
    };

    const showControls = () => {
      lightbox.classList.add("show-controls");
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => lightbox.classList.remove("show-controls"), 2200);
    };

    /* A reel renders its photographs twice so the loop can be seamless, so the
       gallery is built from the first group only and a click on a duplicate
       maps back onto it by position. */
    const galleryOf = (root) => {
      const group = root.querySelector(".reel-group") || root;
      return [...group.querySelectorAll("img")].map((img) => ({
        src: img.currentSrc || img.src,
        alt: img.getAttribute("alt") || ""
      }));
    };

    const render = () => {
      const item = items[index];
      if (!item) return;
      stage.classList.add("is-swapping");
      const next = new Image();
      next.onload = next.onerror = () => {
        stage.src = item.src;
        stage.alt = item.alt;
        stage.classList.remove("is-swapping");
      };
      next.src = item.src;
      counter.textContent = (index + 1) + " / " + items.length;
      if (caption) caption.textContent = item.alt;
    };

    const go = (step) => {
      if (!items.length) return;
      index = (index + step + items.length) % items.length;
      render();
    };

    const setPlaying = (on) => {
      clearInterval(timer);
      timer = on ? setInterval(() => go(1), SLIDE_MS) : null;
      // Starting a show switches the panel into wallpaper mode; pausing keeps
      // it there so the frame stays full-bleed while you look at it.
      if (on && !lightbox.classList.contains("is-slideshow")) {
        lightbox.classList.add("is-slideshow");
        goFullscreen();
        showControls();
      }
      playBtn.classList.toggle("lightbox-btn--playing", on);
      playBtn.setAttribute("aria-pressed", String(on));
      playLabel.textContent = on ? "Pause" : "Slideshow";
      iconPlay.hidden = on;
      iconPause.hidden = !on;
    };

    const open = (list, at, autoplay) => {
      if (!list.length) return;
      items = list;
      index = Math.max(0, Math.min(at, list.length - 1));
      lastFocus = document.activeElement;
      lightbox.hidden = false;
      document.body.classList.add("is-locked");
      render();
      // One frame before the class, or the opacity transition has nothing to
      // move from and the panel snaps in.
      requestAnimationFrame(() => lightbox.classList.add("is-open"));
      setPlaying(Boolean(autoplay));
      lightbox.querySelector(".lightbox-close").focus();
    };

    const close = () => {
      setPlaying(false);
      clearTimeout(idleTimer);
      leaveFullscreen();
      lightbox.classList.remove("is-slideshow", "show-controls");
      lightbox.classList.remove("is-open");
      document.body.classList.remove("is-locked");
      const done = () => {
        lightbox.hidden = true;
        lightbox.removeEventListener("transitionend", done);
      };
      lightbox.addEventListener("transitionend", done);
      // transitionend never fires when the transition is off (reduced motion).
      setTimeout(done, 400);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };

    /* Click a frame in any reel. */
    document.querySelectorAll("[data-reel]").forEach((track) => {
      const list = galleryOf(track);
      track.addEventListener("click", (event) => {
        const shot = event.target.closest(".shot");
        if (!shot || !track.contains(shot)) return;
        const group = shot.parentElement;
        const at = [...group.children].indexOf(shot);
        open(list, at, false);
      });
    });

    /* The slideshow button under a reel. */
    document.querySelectorAll("[data-reel-play]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const reel = btn.closest(".reel");
        const track = reel && reel.querySelector("[data-reel]");
        if (track) open(galleryOf(track), 0, true);
      });
    });

    /* The collection grid. */
    const pool = document.querySelector("[data-pool]");

    if (pool) {
      const list = [...pool.querySelectorAll("img")].map((img) => ({
        // The grid shows thumbnails; the lightbox should load the full frame.
        src: img.dataset.full || img.currentSrc || img.src,
        alt: img.getAttribute("alt") || ""
      }));
      pool.addEventListener("click", (event) => {
        const item = event.target.closest(".pool-item");
        if (!item) return;
        open(list, [...pool.children].indexOf(item), false);
      });
      const poolPlay = document.querySelector("[data-pool-play]");
      if (poolPlay) poolPlay.addEventListener("click", () => open(list, 0, true));
    }

    lightbox.querySelector(".lightbox-close").addEventListener("click", close);
    /* In the viewer a chevron means "I am steering now", so the show stops.
       In a wallpaper show it just skips, and the clock restarts so the new
       frame gets its full time. */
    const step = (dir) => {
      if (lightbox.classList.contains("is-slideshow")) {
        if (timer) { clearInterval(timer); timer = setInterval(() => go(1), SLIDE_MS); }
        showControls();
      } else {
        setPlaying(false);
      }
      go(dir);
    };

    lightbox.querySelector(".lightbox-nav--prev").addEventListener("click", () => step(-1));
    lightbox.querySelector(".lightbox-nav--next").addEventListener("click", () => step(1));

    /* Controls surface on movement, then fade back out. */
    lightbox.addEventListener("mousemove", () => {
      if (lightbox.classList.contains("is-slideshow")) showControls();
    });

    /* Leaving fullscreen by Escape or F11 should end the show, not strand the
       panel in wallpaper mode. */
    ["fullscreenchange", "webkitfullscreenchange"].forEach((evt) => {
      document.addEventListener(evt, () => {
        const el = document.fullscreenElement || document.webkitFullscreenElement;
        if (!el && lightbox.classList.contains("is-slideshow") && !lightbox.hidden) close();
      });
    });
    playBtn.addEventListener("click", () => setPlaying(!timer));

    /* Clicking the backdrop closes; clicking the photograph or the chrome
       must not. */
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox || event.target.classList.contains("lightbox-stage")) close();
    });

    document.addEventListener("keydown", (event) => {
      if (lightbox.hidden) return;
      if (event.key === "Escape") { close(); return; }
      if (event.key === "ArrowLeft") step(-1);
      if (event.key === "ArrowRight") step(1);
      if (event.key === " " || event.code === "Space") {
        event.preventDefault();
        setPlaying(!timer);
      }
    });
  }

})();
