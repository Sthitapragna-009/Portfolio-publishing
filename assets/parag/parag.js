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
      const n = Math.floor(AX / CW);
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
      if (!ctx) return;
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
