/* =========================================================
   KSP — Portfolio interactions
   ========================================================= */

(function () {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

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

  /* ---------- Animated stat counters ---------- */
  const counters = document.querySelectorAll("[data-count]");

  const runCount = (el) => {
    const target = Number(el.dataset.count) || 0;

    if (reduced) {
      el.textContent = String(target);
      return;
    }

    const duration = 1400;
    const start = performance.now();

    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      // easeOutExpo
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  if (!("IntersectionObserver" in window)) {
    counters.forEach(runCount);
  } else {
    const countObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          runCount(entry.target);
          countObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.6 }
    );

    counters.forEach((el) => countObserver.observe(el));
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

  /* ---------- Interactive dot field ---------- */
  const field = document.getElementById("dotField");

  if (field && field.getContext) {
    const ctx = field.getContext("2d");

    const SPACING = 34;      // grid pitch in CSS px
    const BASE_R = 1.1;      // resting dot radius
    const BASE_A = 0.15;     // resting opacity
    const REACH = 155;       // cursor influence radius
    const MAX_SCALE = 2.6;   // radius multiplier at the cursor
    const PUSH = 11;         // how far dots shove outward

    let dots = [];
    let w = 0;
    let h = 0;
    let frame = null;
    const pointer = { x: -9999, y: -9999, active: false };

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = field.clientWidth;
      h = field.clientHeight;
      if (!w || !h) return;

      field.width = Math.round(w * dpr);
      field.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      dots = [];
      const cols = Math.ceil(w / SPACING) + 1;
      const rows = Math.ceil(h / SPACING) + 1;
      const offX = (w - (cols - 1) * SPACING) / 2;
      const offY = (h - (rows - 1) * SPACING) / 2;

      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          dots.push({ x: offX + c * SPACING, y: offY + r * SPACING, s: 0 });
        }
      }
    };

    const paint = () => {
      ctx.clearRect(0, 0, w, h);
      let settling = false;

      for (let i = 0; i < dots.length; i += 1) {
        const d = dots[i];
        let target = 0;
        let dx = 0;
        let dy = 0;
        let dist = 0;

        if (pointer.active) {
          dx = d.x - pointer.x;
          dy = d.y - pointer.y;
          dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < REACH) target = 1 - dist / REACH;
        }

        d.s += (target - d.s) * 0.14;
        if (Math.abs(target - d.s) > 0.002) settling = true;

        const e = d.s * d.s; // square the falloff so the halo stays tight
        let px = d.x;
        let py = d.y;

        if (e > 0.001 && dist > 0) {
          px += (dx / dist) * e * PUSH;
          py += (dy / dist) * e * PUSH;
        }

        // Grey at rest, brand orange under the cursor.
        const cr = Math.round(150 + e * 82);
        const cg = Math.round(150 - e * 65);
        const cb = Math.round(150 - e * 130);

        ctx.fillStyle = "rgba(" + cr + "," + cg + "," + cb + "," + (BASE_A + e * 0.7) + ")";
        ctx.beginPath();
        ctx.arc(px, py, BASE_R * (1 + e * (MAX_SCALE - 1)), 0, Math.PI * 2);
        ctx.fill();
      }

      frame = settling ? requestAnimationFrame(paint) : null;
    };

    const nudge = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    build();
    paint();

    if (!reduced) {
      window.addEventListener("pointermove", (event) => {
        // Coarse pointers fire this on tap only, which would strand the halo.
        if (event.pointerType === "touch") return;
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        pointer.active = true;
        nudge();
      }, { passive: true });

      window.addEventListener("pointerleave", () => {
        pointer.active = false;
        nudge();
      }, { passive: true });

      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          pointer.active = false;
          nudge();
        }
      });
    }

    let resizeTimer;
    const rebuild = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        build();
        paint();
      }, 120);
    };

    window.addEventListener("resize", rebuild);

    // A plain resize listener misses the case where the canvas has no size on
    // first layout (hidden tab, deferred paint) and never fires afterwards, so
    // the grid would stay empty. Observing the box itself catches that.
    if ("ResizeObserver" in window) {
      new ResizeObserver(rebuild).observe(field);
    }
  }

})();
