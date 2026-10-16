// Paraga Mitra case study: field photos, mockups, the phone carousel, the
// fitted dashboard and the two-app prototype.
(() => {
  // ---------- Field photos ----------
  // A slot whose photo hasn't been added yet shows a labelled empty state
  // instead of a broken image.
  document.querySelectorAll(".pg-field img").forEach((img) => {
    const markEmpty = () => img.closest(".pg-field").classList.add("is-empty");
    if (img.complete && img.naturalWidth === 0) markEmpty();
    else img.addEventListener("error", markEmpty);
  });

  // ---------- The header scene: ASCII bee and blossom ----------
  // The art is static text; only its debris squares blink, in CSS. What
  // moves is drawn on a canvas laid over it, so it glides between cells
  // instead of jumping: pollen floating up from the flower (moving over the
  // flower shakes more loose) and a few little bees working the small
  // flowers. Behind the whole header a second canvas prints a single soft
  // ripple where the cursor passes, out to the left edge, and the meadow is
  // carried on past the art to the left edge too.
  document.querySelectorAll("[data-scene]").forEach((art) => {
    const pre = art.querySelector(".pg-ascii");
    const dust = art.querySelector(".pg-dust");
    const head = art.closest(".pg-head");
    if (!pre || !dust || !head) return;
    const dctx = dust.getContext("2d");
    const canvas = head.querySelector(".pg-halftone");
    const ctx = canvas && canvas.getContext("2d");
    const S = JSON.parse(art.dataset.scene);
    const { cols: COLS, rows: ROWS } = S;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rand = Math.random;

    // Which cells of the art hold a character: the ripple leaves those alone.
    const filled = Array.from({ length: ROWS }, () => new Uint8Array(COLS));
    {
      let r = 0, c = 0;
      for (const ch of pre.textContent) {
        if (ch === "\n") { r++; c = 0; continue; }
        if (r < ROWS && c < COLS && ch !== " ") filled[r][c] = 1;
        c++;
      }
    }

    // ---- Layout, from offsets rather than screen boxes, since the art
    // slides in on reveal. Colours and font come from the page. ----
    let AX = 0, AY = 0, AW = 1, AH = 1, CW = 1, CH = 1, HW = 0, HH = 0, DPR = 1;
    let INK = "#000", YEL = "#f6c10e", FONT = "10px monospace";
    // Each glyph is drawn once into its own little canvas, then stamped:
    // far cheaper than setting text every frame.
    let glyphs = new Map();
    const glyph = (ch, colour) => {
      const key = ch + colour;
      let g = glyphs.get(key);
      if (!g) {
        g = document.createElement("canvas");
        g.width = Math.max(1, Math.ceil(CW * 2 * DPR)); g.height = Math.max(1, Math.ceil(CH * DPR));
        const c = g.getContext("2d");
        c.scale(DPR, DPR);
        c.font = FONT; c.textAlign = "center"; c.textBaseline = "middle"; c.fillStyle = colour;
        c.fillText(ch, CW, CH / 2);
        glyphs.set(key, g);
      }
      return g;
    };
    const stamp = (ch, colour, x, y) => dctx.drawImage(glyph(ch, colour), x - CW, y - CH / 2, CW * 2, CH);
    const readColours = () => {
      const cs = getComputedStyle(pre);
      INK = cs.color;
      YEL = cs.getPropertyValue("--pg-bee-y").trim() || YEL;
      glyphs = new Map();
    };
    const measure = () => {
      AX = 0; AY = 0;
      for (let el = pre; el && el !== head; el = el.offsetParent) { AX += el.offsetLeft; AY += el.offsetTop; }
      AW = pre.offsetWidth || 1; AH = pre.offsetHeight || 1;
      CW = AW / COLS; CH = AH / ROWS;
      HW = head.clientWidth; HH = head.clientHeight;
      DPR = Math.min(2, window.devicePixelRatio || 1);
      const cs = getComputedStyle(pre);
      FONT = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      dust.width = Math.round(AW * DPR); dust.height = Math.round(AH * DPR);
      readColours();
    };

    // ---- Pollen, in cells of the art. Steps are scaled by k, the time
    // since the last frame in sixteenths of a second. ----
    const parts = [];
    let ptr = null;
    const emit = (x, y, burst) => {
      if (parts.length >= 220) return;
      const a = rand() * Math.PI * 2;
      const sp = burst ? 0.2 + rand() * 0.5 : 0.04 + rand() * 0.1;
      parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.6 - (burst ? 0.12 : 0.05), life: 0, max: 140 + rand() * 170, ph: rand() * Math.PI * 2 });
    };
    const stepPollen = (k) => {
      if (rand() < 0.4 * k) emit(S.anthers[0] + (rand() - 0.5) * 10, S.anthers[1] + (rand() - 0.5) * 3);
      const damp = Math.pow(0.975, k);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.vx += (Math.sin(p.ph + p.life * 0.045 + p.y * 0.12) * 0.006 + 0.0012) * k;
        p.vy += (Math.cos(p.ph * 1.7 + p.life * 0.037 + p.x * 0.09) * 0.005 - 0.0018) * k;
        if (ptr && p.life > 30) {
          const dx = p.x - ptr.cx, dy = (p.y - ptr.cy) * S.rowH, d = Math.hypot(dx, dy) || 1;
          if (d < 6) { const push = ((6 - d) / 6) * 0.06 * k; p.vx += (dx / d) * push; p.vy += ((dy / d) * push) / S.rowH; }
        }
        p.vx *= damp; p.vy *= damp;
        p.x += p.vx * k; p.y += p.vy * k; p.life += k;
        if (p.life > p.max || p.x < 0 || p.x >= COLS || p.y < 0 || p.y >= ROWS) parts.splice(i, 1);
      }
    };

    // ---- Little bees: each hovers a figure of eight over one flower, then
    // now and then flies off to another. They shy away from the cursor. ----
    const spots = [...(S.blooms || []), S.anthers];
    const bees = Array.from({ length: spots.length > 1 ? 4 : 0 }, (_, i) => {
      const home = (i * 3 + 1) % spots.length;
      return { home, x: spots[home][0], y: spots[home][1] - 3, vx: 0, vy: 0, t: rand() * 6.3, dir: 1, stay: 80 + rand() * 260 };
    });
    const stepBees = (k) => {
      const damp = Math.pow(0.9, k);
      for (const b of bees) {
        b.stay -= k;
        if (b.stay < 0) { b.home = Math.floor(rand() * spots.length); b.stay = 160 + rand() * 320; }
        b.t += 0.07 * k;
        const [hx, hy] = spots[b.home];
        const tx = hx + Math.sin(b.t) * 4, ty = hy - 3.5 + Math.sin(b.t * 2) * 1.2;
        b.vx += (tx - b.x) * 0.012 * k; b.vy += (ty - b.y) * 0.012 * k;
        if (ptr) {
          const dx = b.x - ptr.cx, dy = (b.y - ptr.cy) * S.rowH, d = Math.hypot(dx, dy) || 1;
          if (d < 9) { b.vx += (dx / d) * 0.12 * k; b.vy += (dy / d) * 0.07 * k; }
        }
        b.vx *= damp; b.vy *= damp;
        b.x += b.vx * k; b.y += b.vy * k;
        if (b.vx > 0.06) b.dir = 1; else if (b.vx < -0.06) b.dir = -1;
      }
    };

    // Pollen fades in and out; a bee is a wing that flaps over a striped
    // body and a head that turns the way it flies.
    const drawDust = (now) => {
      dctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      dctx.clearRect(0, 0, AW, AH);
      for (const p of parts) {
        const t = p.life / p.max;
        const tw = Math.sin(p.ph * 3 + p.life * 0.4);
        dctx.globalAlpha = Math.max(0, Math.min(1, t / 0.08, (1 - t) / 0.16));
        stamp(tw > 0.8 ? "*" : tw > 0.2 ? "+" : "·", YEL, (p.x + 0.5) * CW, (p.y + 0.5) * CH);
      }
      dctx.globalAlpha = 1;
      const up = Math.floor(now / 90) % 2 === 0;
      for (const b of bees) {
        const x = (b.x + 0.5) * CW, y = (b.y + 0.5) * CH;
        dctx.globalAlpha = 0.55;
        stamp(up ? "^" : "-", INK, x, y - CH);
        dctx.globalAlpha = 1;
        stamp(b.dir > 0 ? ">" : "<", INK, x + b.dir * CW, y);
        stamp("8", YEL, x, y);
      }
    };

    // ---- The meadow, carried on to the left edge of the header: a strip of
    // the same faint grass and small flowers, cell for cell with the art and
    // on the same ground line (tools/parag/ascii-scene.js), as wide as the
    // gap. Seeded, so it grows the same each time. ----
    const meadow = document.createElement("pre");
    meadow.className = "pg-ascii pg-meadow";
    meadow.setAttribute("aria-hidden", "true");
    head.appendChild(meadow);
    const growMeadow = () => {
      const n = pre.offsetWidth ? Math.floor(AX / CW) : 0;
      if (n < 1) { meadow.hidden = true; return; }
      const TOP = 14;
      let seed = 7;
      const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
      // Columns run from -n to -1, so the ground's wave carries on from column 0.
      const ground = (c) => ROWS - 2 + Math.round(Math.sin(c * 0.09 + 1.3) * 0.9);
      const g = Array.from({ length: TOP }, () => new Array(n).fill(null));
      const put = (r, c, ch, k) => {
        const y = r - (ROWS - TOP), x = c + n;
        if (y >= 0 && y < TOP && x >= 0 && x < n && !g[y][x]) g[y][x] = [ch, k];
      };
      const SPRITES = [[" o ", "o@o", " o "], [" * ", "*@*", " ' "], ["(@)"], [".o.", "(@)", "'o'"]];
      for (let c = -6 - Math.floor(rnd() * 8); c > -n + 1; c -= 14 + Math.floor(rnd() * 12)) {
        const sp = SPRITES[Math.floor(rnd() * SPRITES.length)], h = sp.length, w = sp[0].length;
        const r = ground(c) - 4 - Math.floor(rnd() * 6);
        sp.forEach((line, i) => [...line].forEach((s, j) => { if (s !== " ") put(r - (h >> 1) + i, c - (w >> 1) + j, s, s === "@" ? "ym" : "m"); }));
        const leaf = 2 + Math.floor(rnd() * 3), side = rnd() < 0.5 ? -1 : 1;
        for (let y = r - (h >> 1) + h; y <= ground(c); y++) {
          put(y, c, "|", "m");
          if (y === r + leaf) put(y, c + side, side < 0 ? "\\" : "/", "m");
        }
      }
      for (let c = -n; c < 0; c++) {
        if (rnd() > 0.32) continue;
        const h = 1 + Math.floor(rnd() * 3), lean = rnd() * 2 - 1;
        for (let k = 0; k < h; k++) {
          const s = k === h - 1 && h > 1 ? (lean > 0 ? "'" : ",") : lean > 0.35 ? "/" : lean < -0.35 ? "\\" : "|";
          put(ground(c) - k, c + Math.round(lean * k * 0.45), s, "m");
        }
        if (rnd() < 0.5) put(ground(c) + 1, c, ".", "m");
      }
      meadow.innerHTML = g.map((row) => {
        let line = "", run = "", k = null;
        for (const cell of row) {
          const c = cell ? cell[1] : null, s = cell ? cell[0] : " ";
          if (c !== k) { line += k ? `<span class="${k}">${run}</span>` : run; run = ""; k = c; }
          run += s;
        }
        line += k ? `<span class="${k}">${run}</span>` : run;
        return line.replace(/\s+$/, "");
      }).join("\n");
      meadow.hidden = false;
      meadow.style.left = `${AX - n * CW}px`;
      meadow.style.top = `${AY + (ROWS - TOP) * CH}px`;
      meadow.style.width = `${n * CW}px`;
      meadow.style.lineHeight = `${CH}px`;
    };

    // ---- The ripple, in header pixels: one soft ring of tiny dots on a
    // 45 degree lattice. The dots are kept in square buckets, so each frame
    // only visits the buckets the ring is passing through. ----
    const DOT = 8, BUCKET = 48, BAND = 56, SPEED = 0.2, LIFE = 5200;
    const ripples = [];
    let buckets = [], NBX = 0, NBY = 0, ringsShown = false;
    const fitRings = () => {
      // A header not laid out yet (a background tab) has no size; the
      // ResizeObserver calls again once it has one.
      if (!ctx || !HW || !HH) { buckets = []; NBX = NBY = 0; return; }
      canvas.width = Math.round(HW * DPR); canvas.height = Math.round(HH * DPR);
      ringsShown = false;
      NBX = Math.ceil(HW / BUCKET); NBY = Math.ceil(HH / BUCKET);
      const lists = Array.from({ length: NBX * NBY }, () => []);
      const step = Math.SQRT1_2 * DOT;
      for (let ry = 0; ry * step <= HH; ry++) {
        for (let rx = ry & 1; rx * step <= HW; rx += 2) {
          const x = rx * step, y = ry * step;
          const ac = Math.floor((x - AX) / CW), ar = Math.floor((y - AY) / CH);
          if (ar >= 0 && ar < ROWS && ac >= 0 && ac < COLS && filled[ar][ac]) continue;
          lists[Math.min(NBY - 1, Math.floor(y / BUCKET)) * NBX + Math.min(NBX - 1, Math.floor(x / BUCKET))].push(x, y);
        }
      }
      buckets = lists.map((l) => Float32Array.from(l));
    };
    const drawRings = (now) => {
      if (!ctx || (!ripples.length && !ringsShown)) return;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, HW, HH);
      ringsShown = ripples.length > 0;
      if (!ringsShown) return;
      ctx.fillStyle = INK;
      ctx.globalAlpha = 0.32;
      ctx.beginPath();
      for (const r of ripples) {
        const age = now - r.t0, R = age * SPEED, fade = Math.pow(1 - age / LIFE, 1.5);
        for (let by = 0; by < NBY; by++) {
          const y0 = by * BUCKET, y1 = y0 + BUCKET;
          const ny = Math.max(y0 - r.y, 0, r.y - y1), fy = Math.max(Math.abs(r.y - y0), Math.abs(r.y - y1));
          for (let bx = 0; bx < NBX; bx++) {
            const x0 = bx * BUCKET, x1 = x0 + BUCKET;
            const nx = Math.max(x0 - r.x, 0, r.x - x1), fx = Math.max(Math.abs(r.x - x0), Math.abs(r.x - x1));
            if (Math.hypot(nx, ny) > R + BAND || Math.hypot(fx, fy) < R - BAND) continue;
            const pts = buckets[by * NBX + bx];
            for (let i = 0; i < pts.length; i += 2) {
              const d = Math.hypot(pts[i] - r.x, pts[i + 1] - r.y), off = d - R;
              if (off < -BAND || off > BAND) continue;
              const w = Math.exp(-((off / 22) ** 2)) * fade / (1 + d / 900);
              if (w < 0.06) continue;
              const s = 2 * Math.sqrt(w);
              ctx.rect(pts[i] - s / 2, pts[i + 1] - s / 2, s, s);
            }
          }
        }
      }
      ctx.fill();
      ctx.globalAlpha = 1;
    };

    const fit = () => { measure(); fitRings(); growMeadow(); drawDust(performance.now()); };
    for (let i = 0; i < 200; i++) { stepPollen(1); stepBees(1); }
    fit();
    if ("ResizeObserver" in window) {
      let wait = 0;
      new ResizeObserver(() => { clearTimeout(wait); wait = setTimeout(fit, 120); }).observe(head);
    }
    new MutationObserver(() => { readColours(); drawDust(performance.now()); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    if (reduced) return;

    // ---- The cursor: at most one ripple every few seconds, and only after
    // the cursor has really moved. Over the flower it shakes pollen loose. ----
    let lastRipple = -Infinity, lastAt = null;
    head.addEventListener("pointermove", (e) => {
      const hr = head.getBoundingClientRect();
      const x = e.clientX - hr.left, y = e.clientY - hr.top;
      ptr = { cx: (x - AX) / CW - 0.5, cy: (y - AY) / CH - 0.5 };
      const now = performance.now();
      if (now - lastRipple > 3000 && (!lastAt || Math.hypot(x - lastAt.x, y - lastAt.y) > 140)) {
        ripples.push({ x, y, t0: now });
        if (ripples.length > 2) ripples.shift();
        lastRipple = now; lastAt = { x, y };
      }
      const [fx, fy] = S.flower.at;
      if (Math.hypot(ptr.cx - fx, (ptr.cy - fy) * S.rowH) < S.flower.r && rand() < 0.5) {
        emit(ptr.cx + (rand() - 0.5) * 6, ptr.cy + (rand() - 0.5) * 3, true);
        if (rand() < 0.5) emit(S.anthers[0] + (rand() - 0.5) * 8, S.anthers[1], true);
      }
      start();
    }, { passive: true });
    head.addEventListener("pointerleave", () => { ptr = null; });

    // ---- The loop: every display frame, only while the header is on screen. ----
    let raf = 0, last = 0, visible = true;
    const tick = (now) => {
      raf = 0;
      if (!visible || document.hidden) { last = 0; return; }
      const k = last ? Math.min(4, (now - last) / (1000 / 16)) : 1;
      last = now;
      stepPollen(k); stepBees(k);
      for (let i = ripples.length - 1; i >= 0; i--) if (now - ripples[i].t0 > LIFE) ripples.splice(i, 1);
      drawDust(now); drawRings(now);
      raf = requestAnimationFrame(tick);
    };
    const start = () => { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(tick); };
    if ("IntersectionObserver" in window) new IntersectionObserver(([e]) => { visible = e.isIntersecting; start(); }).observe(head);
    document.addEventListener("visibilitychange", start);
    start();
  });

  // ---------- Mockups ----------
  // Live screens are cloned onto product photos and mapped to the glass with
  // a homography. Each figure carries the photo width it was measured on, the
  // screen size in CSS pixels, and the glass corners (top-left, top-right,
  // bottom-right, bottom-left), found by fitting a line to each screen edge
  // and intersecting them. data-crop="top height" trims the photo.

  // Solves A x = b by Gaussian elimination with partial pivoting.
  const solve = (A, b) => {
    const n = b.length;
    const M = A.map((row, i) => [...row, b[i]]);
    for (let c = 0; c < n; c++) {
      let p = c;
      for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
      [M[c], M[p]] = [M[p], M[c]];
      for (let r = 0; r < n; r++) {
        if (r === c) continue;
        const f = M[r][c] / M[c][c];
        for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
      }
    }
    return M.map((row, i) => row[n] / row[i]);
  };

  // The CSS matrix3d that sends the w x h box onto the four points.
  const homography = (w, h, quad) => {
    const src = [[0, 0], [w, 0], [w, h], [0, h]];
    const A = [], b = [];
    src.forEach(([x, y], i) => {
      const [u, v] = quad[i];
      A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u);
      A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v);
    });
    const [a, bb, c, d, e, f, g, hh] = solve(A, b);
    return `matrix3d(${a},${d},0,${g},${bb},${e},0,${hh},0,0,1,0,${c},${f},0,1)`;
  };

  // A copy of a live screen that is safe to show twice: no ids, no flow
  // links, nothing to tab to.
  const cloneScreen = (selector) => {
    const source = document.querySelector(selector);
    if (!source) return null;
    const copy = source.cloneNode(true);
    copy.removeAttribute("id");
    copy.hidden = false;
    copy.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
    copy.querySelectorAll("[data-go], [data-go-role]").forEach((el) => {
      el.removeAttribute("data-go");
      el.removeAttribute("data-go-role");
    });
    copy.querySelectorAll("button, a").forEach((el) => (el.tabIndex = -1));
    return copy;
  };

  document.querySelectorAll("[data-mock]").forEach((fig) => {
    const img = fig.querySelector("img");
    const screen = fig.querySelector("[data-mock-screen]");
    const glass = screen.querySelector(".pg-mock-glass");
    const srcW = Number(fig.dataset.srcW);
    const [w, h] = fig.dataset.screen.split("x").map(Number);
    const quad = JSON.parse(fig.dataset.quad);
    screen.style.width = w + "px";
    screen.style.height = h + "px";

    if (fig.dataset.crop) {
      const [top, height] = fig.dataset.crop.split(" ").map(Number);
      fig.style.aspectRatio = `${srcW} / ${height}`;
      fig.querySelector(".pg-mock-inner").style.marginTop = `${(-top / srcW) * 100}%`;
    }
    if (fig.dataset.fill) {
      const copy = cloneScreen(fig.dataset.fill);
      if (copy) glass.replaceChildren(copy);
    }

    const place = () => {
      const k = img.clientWidth / srcW;
      if (!k) return;
      screen.style.transform = homography(w, h, quad.map(([x, y]) => [x * k, y * k]));
      screen.classList.add("is-ready");
    };
    if (img.complete) place(); else img.addEventListener("load", place);
    if ("ResizeObserver" in window) new ResizeObserver(place).observe(img);
    else window.addEventListener("resize", place);
  });

  // ---------- Phone carousel ----------
  // Cross-fades the screens on the phone. Pauses on hover, on focus, when off
  // screen, and for anyone who prefers reduced motion; the pause button holds it.
  document.querySelectorAll("[data-car]").forEach((car) => {
    const fig = document.querySelector(car.dataset.car);
    if (!fig) return;
    const glass = fig.querySelector(".pg-mock-glass");
    const slides = [...car.querySelectorAll(".pg-car-slides li")];
    const dots = [...car.querySelectorAll(".pg-car-dots button")];
    const playBtn = car.querySelector("[data-car-play]");
    const DUR = 4200;
    car.style.setProperty("--dur", DUR + "ms");

    const clones = slides.map((li) => cloneScreen(li.dataset.src)).filter(Boolean);
    glass.replaceChildren(...clones);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let i = 0, timer = 0, held = reduced, hovering = false, visible = true;

    const schedule = () => {
      clearTimeout(timer);
      car.classList.remove("is-playing");
      if (held || hovering || !visible) return;
      void car.offsetWidth; // restarts the progress bar
      car.classList.add("is-playing");
      timer = setTimeout(() => go(i + 1), DUR);
    };
    const go = (n) => {
      i = (n + slides.length) % slides.length;
      clones.forEach((c, k) => c.classList.toggle("is-on", k === i));
      slides.forEach((s, k) => s.classList.toggle("is-on", k === i));
      dots.forEach((d, k) => d.setAttribute("aria-current", String(k === i)));
      schedule();
    };
    const setHeld = (v) => {
      held = v;
      playBtn.setAttribute("aria-pressed", String(v));
      playBtn.setAttribute("aria-label", v ? "Play the carousel" : "Pause the carousel");
      playBtn.querySelector("[data-icon-pause]").hidden = v;
      playBtn.querySelector("[data-icon-play]").hidden = !v;
      schedule();
    };

    dots.forEach((d, k) => d.addEventListener("click", () => go(k)));
    car.querySelector("[data-car-prev]").addEventListener("click", () => go(i - 1));
    car.querySelector("[data-car-next]").addEventListener("click", () => go(i + 1));
    playBtn.addEventListener("click", () => setHeld(!held));
    [fig, car].forEach((el) => {
      el.addEventListener("mouseenter", () => { hovering = true; schedule(); });
      el.addEventListener("mouseleave", () => { hovering = false; schedule(); });
    });
    car.addEventListener("focusin", () => { hovering = true; schedule(); });
    car.addEventListener("focusout", () => { hovering = false; schedule(); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; schedule(); }, { threshold: 0.3 }).observe(fig);
    }

    setHeld(held);
    go(0);
  });

  // ---------- Fit-to-width boards ----------
  // The dashboard is drawn at the tablet's size and scaled to its panel, down
  // to a floor; below that the panel scrolls sideways instead.
  document.querySelectorAll("[data-fit]").forEach((box) => {
    const board = box.firstElementChild;
    const [w, h] = box.dataset.fit.split("x").map(Number);
    const holder = box.parentElement;
    const fit = () => {
      const s = Math.max(holder.clientWidth / w, 0.6);
      box.style.width = w * s + "px";
      box.style.height = h * s + "px";
      board.style.transform = `scale(${s})`;
    };
    fit();
    if ("ResizeObserver" in window) new ResizeObserver(fit).observe(holder);
    else window.addEventListener("resize", fit);
  });

  // ---------- Tabs ----------
  // Shared by the screen rails and the AI phone: click or arrow keys, one
  // panel shown at a time. Without the script every panel stays visible.
  const tabset = (tabs, onPick) => {
    const pick = (t, focus) => {
      tabs.forEach((x) => {
        const on = x === t;
        x.setAttribute("aria-selected", String(on));
        x.tabIndex = on ? 0 : -1;
      });
      if (focus) t.focus();
      onPick(t);
    };
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => pick(t));
      t.addEventListener("keydown", (e) => {
        const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!step) return;
        e.preventDefault();
        pick(tabs[(i + step + tabs.length) % tabs.length], true);
      });
    });
    pick(tabs.find((t) => t.getAttribute("aria-selected") === "true") || tabs[0]);
  };

  document.querySelectorAll("[data-rails]").forEach((box) => {
    const tabs = [...box.querySelectorAll('[role="tab"]')];
    tabset(tabs, (t) => {
      box.querySelectorAll(".pg-rail-panel").forEach((p) => {
        p.hidden = p.id !== t.getAttribute("aria-controls");
        if (!p.hidden) p.querySelector(".pg-rail").scrollLeft = 0;
      });
    });
  });

  // ---------- The AI phone ----------
  const lab = document.querySelector("[data-lab]");
  if (lab) {
    const reducedLab = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    tabset([...lab.querySelectorAll("[data-lab-tab]")], (t) => {
      const k = t.dataset.labTab;
      lab.querySelectorAll("[data-lab-pane]").forEach((p) => { p.hidden = p.dataset.labPane !== k; });
      lab.querySelectorAll("[data-lab-note]").forEach((n) => { n.hidden = n.dataset.labNote !== k; });
    });

    // ---- Place boxes ----
    // Boxes follow the finger 1:1 from where they were grabbed. "Suggest
    // spots" works out the best five spots outside the danger zones, then each
    // box springs there from wherever it is (critically damped, so no bounce,
    // and a box grabbed mid-flight simply stops and follows the finger).
    const plan = lab.querySelector("[data-plan]");
    if (plan) {
      const svg = plan.querySelector("[data-plan-map]");
      const gBoxes = svg.querySelector("[data-plan-boxes]");
      const gReach = svg.querySelector("[data-plan-reach]");
      const pane = plan.closest(".ap-lab-pane");
      const read = pane.querySelector(".ap-plan-read");
      const out = {
        cover: pane.querySelector("[data-plan-cover]"),
        bar: pane.querySelector("[data-plan-bar]"),
        state: pane.querySelector("[data-plan-state]"),
        msg: pane.querySelector("[data-plan-msg]"),
      };
      const NS = "http://www.w3.org/2000/svg";
      const FIELD = [[104, 76], [248, 66], [258, 196], [96, 204]];
      const SPRAY = { x: 262, y: 30, r: 92 };
      const ROAD_Y = 194;
      const REACH = 42, MAX = 5;
      const START = [[140, 112], [226, 98]];

      const inside = (x, y) => {
        let hit = false;
        for (let i = 0, j = FIELD.length - 1; i < FIELD.length; j = i++) {
          const [xi, yi] = FIELD[i], [xj, yj] = FIELD[j];
          if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
        }
        return hit;
      };
      const danger = (x, y) => (Math.hypot(x - SPRAY.x, y - SPRAY.y) < SPRAY.r ? "spray" : y > ROAD_Y ? "road" : null);

      // Points across the field, for measuring how much of it is covered.
      const samples = [];
      for (let y = 60; y < 210; y += 6) for (let x = 90; x < 262; x += 6) if (inside(x, y)) samples.push([x, y]);
      const coverOf = (pts) => {
        let n = 0;
        for (const [sx, sy] of samples) if (pts.some(([x, y]) => (x - sx) ** 2 + (y - sy) ** 2 < REACH * REACH)) n++;
        return n / samples.length;
      };
      // The suggestion: greedy, one box at a time, each where it adds the
      // most new cover, never in a danger zone or hard against the edge.
      const suggest = () => {
        const cands = [];
        for (let y = 70; y < 206; y += 4) for (let x = 96; x < 260; x += 4) {
          if (inside(x, y) && !danger(x, y) && !danger(x + 8, y - 8) && inside(x + 8, y) && inside(x - 8, y) && inside(x, y + 8) && inside(x, y - 8)) cands.push([x, y]);
        }
        const picked = [], covered = new Uint8Array(samples.length);
        for (let k = 0; k < MAX; k++) {
          let best = null, bestGain = -1;
          for (const c of cands) {
            let gain = 0;
            for (let s = 0; s < samples.length; s++) {
              if (!covered[s] && (c[0] - samples[s][0]) ** 2 + (c[1] - samples[s][1]) ** 2 < REACH * REACH) gain++;
            }
            if (gain > bestGain) { bestGain = gain; best = c; }
          }
          picked.push(best);
          samples.forEach(([sx, sy], s) => { if ((best[0] - sx) ** 2 + (best[1] - sy) ** 2 < REACH * REACH) covered[s] = 1; });
        }
        return picked;
      };

      const el = (tag, attrs) => {
        const n = document.createElementNS(NS, tag);
        for (const k in attrs) n.setAttribute(k, attrs[k]);
        return n;
      };
      let boxes = [];
      let suggested = false;
      const make = (x, y) => {
        const g = el("g", { class: "ap-plan-box", tabindex: "0", role: "button" });
        g.append(
          el("circle", { class: "bx-ring", r: "14" }),
          el("rect", { class: "bx-body", x: "-9", y: "-8", width: "18", height: "16", rx: "4" }),
          el("path", { class: "bx-line", d: "M-5-2.5h10M-5 2.5h10" }),
        );
        const warn = el("g", { class: "bx-warn", transform: "translate(9 -9)" });
        warn.append(el("circle", { r: "5.5", fill: "#0d0d0e" }), el("path", { d: "M0-2.6v2.8M0 2.4v.1", stroke: "#fff", "stroke-width": "1.7", "stroke-linecap": "round" }));
        g.append(warn);
        const ring = el("circle", { r: String(REACH) });
        gReach.append(ring);
        gBoxes.append(g);
        const b = { x, y, vx: 0, vy: 0, tx: null, ty: null, g, ring, out: false };
        boxes.push(b);
        bind(b);
        return b;
      };
      const remove = (b) => {
        b.g.remove(); b.ring.remove();
        boxes = boxes.filter((x) => x !== b);
      };
      const paint = () => {
        boxes.forEach((b, i) => {
          b.g.setAttribute("transform", `translate(${b.x.toFixed(1)} ${b.y.toFixed(1)})`);
          b.ring.setAttribute("cx", b.x.toFixed(1));
          b.ring.setAttribute("cy", b.y.toFixed(1));
          const bad = !!danger(b.x, b.y);
          b.g.classList.toggle("is-bad", bad);
          b.ring.classList.toggle("is-bad", bad);
          b.g.style.opacity = b.out ? "0.45" : "";
          b.ring.style.opacity = b.out ? "0" : "";
          const where = danger(b.x, b.y);
          b.g.setAttribute("aria-label", `Box ${i + 1}${where === "spray" ? ", in the spray zone" : where === "road" ? ", too close to the road" : ""}. Drag, or use the arrow keys. Delete removes it.`);
        });
        gReach.classList.add("ap-plan-reach");
      };
      const report = () => {
        const good = boxes.filter((b) => !b.out && !danger(b.x, b.y));
        const bad = boxes.findIndex((b) => !b.out && danger(b.x, b.y));
        const pc = Math.round(coverOf(good.map((b) => [b.x, b.y])) * 100);
        out.cover.textContent = pc + "%";
        out.bar.style.setProperty("--v", pc + "%");
        out.state.textContent = `${boxes.length} of ${MAX} placed`;
        out.state.className = "ap-badge" + (bad >= 0 ? " ap-badge--warn" : boxes.length === MAX && pc >= 85 ? " ap-badge--ok" : "");
        read.classList.toggle("is-bad", bad >= 0);
        const held = boxes.find((b) => b.out);
        let msg;
        if (held) msg = "Let go here to take this box away.";
        else if (bad >= 0) msg = danger(boxes[bad].x, boxes[bad].y) === "spray"
          ? `Box ${bad + 1} is in the spray zone. Drag it out of the red, or let Mitra suggest.`
          : `Box ${bad + 1} is too close to the road. Dust and drift reach it there.`;
        else if (suggested && boxes.length === MAX) msg = `Mitra's five spots reach ${pc}% of the field, none in danger. The beekeeper can still move any of them.`;
        else if (boxes.length < MAX) msg = `Tap inside the field to add box ${boxes.length + 1}.`;
        else if (pc < 85) msg = "Spread the boxes out to reach more of the field.";
        else msg = `Good: ${pc}% of the field, and every box is safe.`;
        out.msg.textContent = msg;
      };

      // ---- Springs ----
      const RESPONSE = 0.4;
      const W = (2 * Math.PI) / RESPONSE;
      let raf = 0, last = 0;
      const step = (now) => {
        const dt = Math.min(0.032, (now - last) / 1000 || 0.016);
        last = now;
        let moving = false;
        for (const b of boxes) {
          if (b.tx === null) continue;
          for (const [p, v, t] of [["x", "vx", "tx"], ["y", "vy", "ty"]]) {
            const a = -W * W * (b[p] - b[t]) - 2 * W * b[v];
            b[v] += a * dt;
            b[p] += b[v] * dt;
          }
          if (Math.hypot(b.x - b.tx, b.y - b.ty) < 0.15 && Math.hypot(b.vx, b.vy) < 0.5) { b.x = b.tx; b.y = b.ty; b.tx = b.ty = null; b.vx = b.vy = 0; }
          else moving = true;
        }
        paint(); report();
        raf = moving ? requestAnimationFrame(step) : 0;
      };
      // Restart the loop on every request, so one frame that never came
      // (a tab in the background) cannot leave it stuck.
      const animate = () => { cancelAnimationFrame(raf); last = performance.now(); raf = requestAnimationFrame(step); };
      const send = (b, x, y) => {
        if (reducedLab) { b.x = x; b.y = y; b.tx = b.ty = null; return; }
        b.tx = x; b.ty = y;
      };

      // ---- Pointer ----
      const toMap = (e) => {
        const m = svg.getScreenCTM();
        if (!m) return [0, 0];
        const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
        return [p.x, p.y];
      };
      let drag = null, dragEnded = 0;
      function bind(b) {
        b.g.addEventListener("pointerdown", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const [x, y] = toMap(e);
          // Grabbing a box mid-flight stops it where it is, then it follows.
          b.tx = b.ty = null; b.vx = b.vy = 0;
          drag = { b, dx: b.x - x, dy: b.y - y, sx: x, sy: y, moved: false, home: [b.x, b.y] };
          b.g.classList.add("is-held");
          gBoxes.append(b.g);
          svg.setPointerCapture(e.pointerId);
        });
        b.g.addEventListener("keydown", (e) => {
          const d = e.shiftKey ? 12 : 4;
          const mv = { ArrowLeft: [-d, 0], ArrowRight: [d, 0], ArrowUp: [0, -d], ArrowDown: [0, d] }[e.key];
          if (mv) {
            e.preventDefault();
            const nx = b.x + mv[0], ny = b.y + mv[1];
            if (inside(nx, ny)) { b.x = nx; b.y = ny; suggested = false; paint(); report(); }
          } else if (e.key === "Delete" || e.key === "Backspace") {
            e.preventDefault();
            const i = boxes.indexOf(b);
            remove(b); paint(); report();
            (boxes[i] || boxes[i - 1] || svg).focus?.();
          }
        });
      }
      svg.addEventListener("pointermove", (e) => {
        if (!drag) return;
        const [x, y] = toMap(e);
        if (!drag.moved && Math.hypot(x - drag.sx, y - drag.sy) < 2) return;
        drag.moved = true;
        const b = drag.b;
        b.x = Math.max(4, Math.min(296, x + drag.dx));
        b.y = Math.max(4, Math.min(246, y + drag.dy));
        b.out = !inside(b.x, b.y);
        suggested = false;
        paint(); report();
      });
      const end = () => {
        if (!drag) return;
        const b = drag.b;
        b.g.classList.remove("is-held");
        if (b.out) remove(b);
        if (drag.moved) dragEnded = performance.now();
        drag = null;
        paint(); report();
      };
      svg.addEventListener("pointerup", end);
      svg.addEventListener("pointercancel", end);
      // A tap on the field itself adds a box there.
      svg.addEventListener("click", (e) => {
        // The release after a drag is not a tap.
        if (e.target.closest(".ap-plan-box") || performance.now() - dragEnded < 300) return;
        const [x, y] = toMap(e);
        if (!inside(x, y)) { out.msg.textContent = "Boxes go inside your field, the outlined shape."; return; }
        if (boxes.length >= MAX) { out.msg.textContent = `All ${MAX} boxes are placed. Drag one to move it.`; return; }
        make(x, y);
        suggested = false;
        paint(); report();
      });

      pane.querySelector("[data-plan-ai]").addEventListener("click", () => {
        const spots = suggest();
        // Each spot goes to the nearest box still free; a missing box
        // appears on its spot.
        const free = [...boxes];
        while (boxes.length > MAX) remove(boxes[boxes.length - 1]);
        spots.forEach(([x, y]) => {
          let k = -1, best = Infinity;
          free.forEach((b, i) => { const d = Math.hypot(b.x - x, b.y - y); if (d < best) { best = d; k = i; } });
          if (k >= 0) send(free.splice(k, 1)[0], x, y);
          else make(x, y);
        });
        suggested = true;
        paint(); report();
        animate();
      });
      pane.querySelector("[data-plan-reset]").addEventListener("click", () => {
        [...boxes].forEach(remove);
        START.forEach(([x, y]) => make(x, y));
        suggested = false;
        paint(); report();
      });

      START.forEach(([x, y]) => make(x, y));
      paint(); report();
    }

    // ---- Ask Mitra ----
    // Three questions it can answer from the booking, each with its source
    // and how sure it is. A fourth, asked by voice, it can't: it says so and
    // offers the agent, which is the rule below 60%.
    const log = lab.querySelector("[data-ask-log]");
    if (log) {
      const pane = log.closest(".ap-lab-pane");
      const chips = [...pane.querySelectorAll("[data-ask]")];
      const mic = pane.querySelector("[data-ask-mic]");
      const hint = pane.querySelector("[data-ask-hint]");
      const QA = [
        { a: "Gurnam&rsquo;s truck reaches your field on 16 Dec, before sunrise. That is two days before the flowers open.", hi: "गुरनाम का ट्रक 16 दिसंबर को सुबह से पहले पहुँचेगा।", src: "Booking PR-2291 &middot; truck plan", sure: 92 },
        { a: "Better not. The bees work your field until 25 Jan. If you must, log it here first: Gurnam gets 24 hours to close the boxes, and spray after 6 pm.", hi: "बेहतर है नहीं। पहले यहाँ बताएँ, शाम 6 बजे के बाद छिड़कें।", src: "Spray rules &middot; your booking", sure: 88 },
        { a: "Five, for 1.6 ha of mustard: about three a hectare. That is what you booked.", hi: "पाँच बक्से, 1.6 हेक्टेयर सरसों के लिए।", src: "Crop guide &middot; ICAR", sure: 95 },
      ];
      const UNSURE = { q: "पिछले साल से ज़्यादा फ़सल होगी?", en: "Will I get more than last year?", a: "I can&rsquo;t say that from your records. Shall I ask Pooja, your agent, to call you?", hi: "यह मैं आपके रिकॉर्ड से नहीं बता सकता। पूजा को फ़ोन करने को कहूँ?", src: "Not in your records", sure: 40 };
      let busy = false, asked = 0;
      const scroll = () => pane.scrollTo({ top: pane.scrollHeight, behavior: reducedLab ? "auto" : "smooth" });
      const bubble = (html, me) => {
        const b = document.createElement("div");
        b.className = "ap-bubble" + (me ? " ap-bubble--me" : "");
        b.innerHTML = html;
        log.append(b);
        scroll();
        return b;
      };
      const answer = (q, en, r) => {
        busy = true;
        chips.forEach((c) => (c.disabled = true));
        bubble(`<p class="ap-t" style="font-size:13px">${q}</p><span class="ap-hi">${en}</span>`, true);
        const wait = bubble('<span class="ap-typing" aria-label="Mitra is answering"><i></i><i></i><i></i></span>');
        setTimeout(() => {
          const low = r.sure < 60;
          wait.innerHTML = `<p class="ap-t" style="font-size:13px">${r.a}</p><span class="ap-hi">${r.hi}</span>`
            + `<span class="ap-src"><svg><use href="#i-list"/></svg>${r.src}</span>`
            + `<div class="ap-conf"><span>Sure</span><i><b style="--v:${r.sure}%"></b></i><span>${r.sure}%</span></div>`
            + (low ? '<button class="ap-pill ap-pill--dark" type="button" style="min-height:42px;font-size:12.5px"><svg><use href="#i-call"/></svg><span>Call Pooja</span></button>' : "");
          scroll();
          busy = false;
          asked++;
          chips.forEach((c) => (c.disabled = c.dataset.used === "1"));
          hint.textContent = asked >= 4 ? "Every answer names where it came from" : "Tap a question, or the microphone";
        }, reducedLab ? 200 : 900);
      };
      chips.forEach((c) => c.addEventListener("click", () => {
        if (busy || c.dataset.used === "1") return;
        c.dataset.used = "1";
        const [q, en] = [c.firstChild.textContent.trim(), c.querySelector("small").textContent];
        answer(q, en, QA[Number(c.dataset.ask)]);
      }));
      mic.addEventListener("click", () => {
        if (busy) return;
        busy = true;
        mic.classList.add("is-on");
        hint.textContent = "Listening…";
        setTimeout(() => {
          mic.classList.remove("is-on");
          busy = false;
          const next = chips.find((c) => c.dataset.used !== "1");
          if (next) next.click();
          else answer(UNSURE.q, UNSURE.en, UNSURE);
        }, reducedLab ? 200 : 1200);
      });
    }

    // ---- Hive check ----
    const frame = lab.querySelector("[data-check-frame]");
    if (frame) {
      const pane = frame.closest(".ap-lab-pane");
      const go = pane.querySelector("[data-check-go]");
      const label = go.querySelector("span");
      const num = pane.querySelector("[data-check-num]");
      const badge = pane.querySelector("[data-check-badge]");
      const conf = pane.querySelector("[data-check-conf]");
      const pcOut = pane.querySelector("[data-check-pc]");
      const msg = pane.querySelector("[data-check-msg]");
      let stage = 0;
      const countTo = (to) => {
        if (reducedLab) { num.innerHTML = `${to}%<small>comb covered</small>`; return; }
        const t0 = performance.now();
        const tick = (now) => {
          const k = Math.min(1, (now - t0) / 600), e = 1 - (1 - k) ** 3;
          num.innerHTML = `${Math.round(to * e)}%<small>comb covered</small>`;
          if (k < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      };
      go.addEventListener("click", () => {
        if (stage === 0) {
          stage = -1;
          go.disabled = true;
          label.textContent = "Checking…";
          frame.classList.remove("is-done");
          frame.classList.add("is-scanning");
          setTimeout(() => {
            frame.classList.remove("is-scanning");
            frame.classList.add("is-done");
            countTo(72);
            badge.textContent = "Strong";
            badge.className = "ap-badge ap-badge--ok";
            conf.style.setProperty("--v", "84%");
            pcOut.textContent = "84%";
            msg.textContent = "The booking agreed 60% or more. A person still has to say yes.";
            go.disabled = false;
            label.textContent = "Agent confirms";
            go.classList.add("ap-pill--dark");
            stage = 1;
          }, reducedLab ? 150 : 1300);
        } else if (stage === 1) {
          badge.textContent = "Confirmed by Pooja";
          msg.textContent = "First 50% released to Gurnam by UPI.";
          label.textContent = "Check another frame";
          go.classList.remove("ap-pill--dark");
          stage = 2;
        } else if (stage === 2) {
          frame.classList.remove("is-done");
          num.innerHTML = "&ndash;";
          badge.textContent = "Not checked";
          badge.className = "ap-badge";
          conf.style.setProperty("--v", "0%");
          pcOut.innerHTML = "&ndash;";
          msg.textContent = "Point at one frame from the middle of the box.";
          label.textContent = "Check this frame";
          stage = 0;
        }
      });
    }
  }

  // ---------- Prototype ----------
  const proto = document.querySelector("[data-proto]");
  if (!proto) return;

  const STEPS = 5;
  const LABEL = { farmer: "Farmer app", beekeeper: "Beekeeper app" };
  const screens = [...proto.querySelectorAll(".ap")];
  const tabs = [...proto.querySelectorAll("[data-role-tab]")];
  const lists = [...proto.querySelectorAll("[data-role-list]")];
  const stepButtons = [...proto.querySelectorAll(".pg-steps button")];
  const prev = proto.querySelector("[data-proto-prev]");
  const next = proto.querySelector("[data-proto-next]");
  const count = proto.querySelector("[data-proto-count]");

  let role = "farmer";
  let step = 1;

  function show(nextRole, nextStep) {
    role = nextRole;
    step = Math.min(Math.max(nextStep, 1), STEPS);

    screens.forEach((s) => {
      const on = s.dataset.role === role && Number(s.dataset.step) === step;
      s.hidden = !on;
      if (on) s.querySelector(".ap-body").scrollTop = 0;
    });
    tabs.forEach((t) => {
      const on = t.dataset.roleTab === role;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
    });
    lists.forEach((l) => { l.hidden = l.dataset.roleList !== role; });
    stepButtons.forEach((b) => {
      const on = b.dataset.role === role && Number(b.dataset.step) === step;
      if (on) b.setAttribute("aria-current", "step");
      else b.removeAttribute("aria-current");
    });

    prev.disabled = step === 1;
    next.disabled = step === STEPS;
    count.textContent = `${LABEL[role]} · screen ${step} of ${STEPS}`;
  }

  tabs.forEach((t, i) => {
    t.addEventListener("click", () => show(t.dataset.roleTab, 1));
    t.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const other = tabs[(i + 1) % tabs.length];
      other.focus();
      show(other.dataset.roleTab, 1);
    });
  });

  stepButtons.forEach((b) => {
    b.addEventListener("click", () => show(b.dataset.role, Number(b.dataset.step)));
  });

  prev.addEventListener("click", () => show(role, step - 1));
  next.addEventListener("click", () => show(role, step + 1));

  // In-screen buttons move through the flow; data-go-role crosses to the
  // other app, so the farmer's spray log lands on the beekeeper's alert.
  proto.addEventListener("click", (e) => {
    const go = e.target.closest("[data-go]");
    if (!go || !proto.contains(go)) return;
    show(go.dataset.goRole || role, Number(go.dataset.go));
  });

  show(role, step);
})();
