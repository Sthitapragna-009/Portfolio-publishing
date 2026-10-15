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
  // The art is read back out of its <pre> into a grid of [character, class]
  // and redrawn each frame: pollen floats up from the flower in a second
  // <pre> on top, and moving over the flower shakes more of it loose. Where
  // the cursor passes, a faint ripple runs out: inside the art it lifts each
  // character it crosses by one step; behind the rest of the header it prints
  // a ring of very small dots, out to the left edge. A few little bees work
  // the small flowers in the grass, in the same layer as the pollen.
  document.querySelectorAll("[data-scene]").forEach((art) => {
    const pre = art.querySelector(".pg-ascii:not(.pg-dust)");
    const layer = art.querySelector(".pg-dust");
    const head = art.closest(".pg-head");
    const canvas = head && head.querySelector(".pg-halftone");
    const ctx = canvas && canvas.getContext("2d");
    const S = JSON.parse(art.dataset.scene);
    const { cols: COLS, rows: ROWS } = S;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rand = Math.random;

    // Read the art back: text nodes carry the characters, spans the class.
    const base = Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => [" ", ""]));
    let rr = 0, cc = 0;
    const walk = (node, cls) => {
      for (const n of node.childNodes) {
        if (n.nodeType === 3) {
          for (const ch of n.data) {
            if (ch === "\n") { rr++; cc = 0; continue; }
            if (rr < ROWS && cc < COLS) base[rr][cc] = [ch, cls];
            cc++;
          }
        } else if (n.nodeType === 1) walk(n, (n.getAttribute("class") || "").replace(/\s*\bsq\b/, ""));
      }
    };
    walk(pre, "");

    // ---- Pollen, in cells of the art ----
    const parts = [];
    let ptr = null;
    const emit = (x, y, burst) => {
      if (parts.length >= 220) return;
      const a = rand() * Math.PI * 2;
      const sp = burst ? 0.2 + rand() * 0.5 : 0.04 + rand() * 0.1;
      parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.6 - (burst ? 0.12 : 0.05), life: 0, max: 140 + rand() * 170, ph: rand() * Math.PI * 2 });
    };
    const stepPollen = () => {
      if (rand() < 0.4) emit(S.anthers[0] + (rand() - 0.5) * 10, S.anthers[1] + (rand() - 0.5) * 3);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.vx += Math.sin(p.ph + p.life * 0.045 + p.y * 0.12) * 0.006 + 0.0012;
        p.vy += Math.cos(p.ph * 1.7 + p.life * 0.037 + p.x * 0.09) * 0.005 - 0.0018;
        if (ptr && p.life > 30) {
          const dx = p.x - ptr.cx, dy = (p.y - ptr.cy) * S.rowH, d = Math.hypot(dx, dy) || 1;
          if (d < 6) { const push = ((6 - d) / 6) * 0.06; p.vx += (dx / d) * push; p.vy += ((dy / d) * push) / S.rowH; }
        }
        p.vx *= 0.975; p.vy *= 0.975;
        p.x += p.vx; p.y += p.vy; p.life += 1;
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
    const stepBees = () => {
      for (const b of bees) {
        if (--b.stay < 0) { b.home = Math.floor(rand() * spots.length); b.stay = 160 + rand() * 320; }
        b.t += 0.07;
        const [hx, hy] = spots[b.home];
        const tx = hx + Math.sin(b.t) * 4, ty = hy - 3.5 + Math.sin(b.t * 2) * 1.2;
        b.vx += (tx - b.x) * 0.012; b.vy += (ty - b.y) * 0.012;
        if (ptr) {
          const dx = b.x - ptr.cx, dy = (b.y - ptr.cy) * S.rowH, d = Math.hypot(dx, dy) || 1;
          if (d < 9) { b.vx += (dx / d) * 0.12; b.vy += (dy / d) * 0.07; }
        }
        b.vx *= 0.9; b.vy *= 0.9;
        b.x += b.vx; b.y += b.vy;
        if (b.vx > 0.06) b.dir = 1; else if (b.vx < -0.06) b.dir = -1;
      }
    };
    let flap = 0;
    const drawPollen = () => {
      const g = Array.from({ length: ROWS }, () => new Array(COLS).fill(" "));
      const cls = Array.from({ length: ROWS }, () => new Array(COLS).fill(""));
      for (const p of parts) {
        const c = Math.round(p.x), r = Math.round(p.y);
        if (r < 0 || r >= ROWS || c < 0 || c >= COLS) continue;
        const t = p.life / p.max;
        const tw = Math.sin(p.ph * 3 + p.life * 0.4);
        g[r][c] = t < 0.06 || t > 0.86 ? "." : tw > 0.8 ? "*" : tw > 0.2 ? "+" : "·";
      }
      // A bee is two rows: a wing that flaps, over a striped body and a head.
      flap += 1;
      for (const b of bees) {
        const c = Math.round(b.x), r = Math.round(b.y);
        const cells = [[r - 1, c, flap % 2 ? "^" : "-", "bw"], [r, c, "8", "by"], [r, c + b.dir, b.dir > 0 ? ">" : "<", "bk"]];
        for (const [y, x, ch, k] of cells) if (y >= 0 && y < ROWS && x >= 0 && x < COLS) { g[y][x] = ch; cls[y][x] = k; }
      }
      layer.innerHTML = g.map((row, y) => {
        let line = "", run = "", k = null;
        for (let x = 0; x < COLS; x++) {
          const c = row[x] === " " ? null : cls[y][x];
          if (c !== k) { line += k ? `<span class="${k}">${run}</span>` : run; run = ""; k = c; }
          run += row[x] === "<" ? "&lt;" : row[x];
        }
        line += k ? `<span class="${k}">${run}</span>` : run;
        return line.replace(/\s+$/, "");
      }).join("\n");
    };

    for (let i = 0; i < 200; i++) { stepPollen(); stepBees(); }
    drawPollen();

    // ---- The meadow, carried on to the left edge of the header: a strip of
    // the same faint grass and small flowers, cell for cell with the art and
    // on the same ground line (tools/parag/ascii-scene.js), as wide as the
    // gap. Seeded, so it grows the same each time. ----
    const meadow = head && document.createElement("pre");
    const growMeadow = () => {
      if (!meadow) return;
      // Layout offsets, not screen boxes: the art slides in on reveal.
      let px = 0, py = 0;
      for (let el = pre; el && el !== head; el = el.offsetParent) { px += el.offsetLeft; py += el.offsetTop; }
      const cw = pre.offsetWidth / COLS, ch = pre.offsetHeight / ROWS;
      const n = Math.floor(px / cw);
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
      meadow.style.left = `${px - n * cw}px`;
      meadow.style.top = `${py + (ROWS - TOP) * ch}px`;
      meadow.style.width = `${n * cw}px`;
      meadow.style.lineHeight = `${ch}px`;
    };
    if (meadow) {
      meadow.className = "pg-ascii pg-meadow";
      meadow.setAttribute("aria-hidden", "true");
      head.appendChild(meadow);
      growMeadow();
      if ("ResizeObserver" in window) {
        let wait = 0;
        new ResizeObserver(() => { clearTimeout(wait); wait = setTimeout(growMeadow, 120); }).observe(head);
      }
    }

    if (reduced) return;

    // ---- Ripples, in header pixels; the art reads them in its own cells ----
    const ripples = [];
    const SPEED = 9, LIFE = 150;
    let artBox = { x: 0, y: 0, w: 1, h: 1 };
    const within = (el) => {
      let x = 0, y = 0;
      for (let n = el; n && n !== head; n = n.offsetParent) { x += n.offsetLeft; y += n.offsetTop; }
      return { x, y };
    };

    // The faint ring behind the header: a 45 degree lattice of tiny dots.
    let CW = 0, CH = 0, DPR = 1, LX = null, LY = null, LM = 0;
    const DOT = 4;
    const fitCanvas = () => {
      if (!ctx) return;
      const rect = head.getBoundingClientRect();
      CW = Math.round(rect.width); CH = Math.round(rect.height);
      DPR = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(CW * DPR); canvas.height = Math.round(CH * DPR);
      const at = within(pre);
      artBox = { x: at.x, y: at.y, w: pre.offsetWidth || 1, h: pre.offsetHeight || 1 };
      const pts = [];
      const c = Math.SQRT1_2 * DOT, n = Math.ceil(Math.hypot(CW, CH) / DOT) + 2;
      for (let i = -n; i <= n; i++) for (let j = -n; j <= n; j++) {
        const x = (i - j) * c, y = (i + j) * c;
        if (x < 0 || y < 0 || x > CW || y > CH) continue;
        // The art prints its own ripple in the cells that hold a character;
        // everywhere else, blank cells inside the art included, gets dots.
        const ac = Math.floor(((x - artBox.x) / artBox.w) * COLS), ar = Math.floor(((y - artBox.y) / artBox.h) * ROWS);
        if (ar >= 0 && ar < ROWS && ac >= 0 && ac < COLS && base[ar][ac][0] !== " ") continue;
        pts.push(x, y);
      }
      LM = pts.length / 2;
      LX = new Float32Array(LM); LY = new Float32Array(LM);
      for (let k = 0; k < LM; k++) { LX[k] = pts[2 * k]; LY[k] = pts[2 * k + 1]; }
    };
    fitCanvas();
    if ("ResizeObserver" in window && head) {
      let pending = 0;
      new ResizeObserver(() => { clearTimeout(pending); pending = setTimeout(fitCanvas, 120); }).observe(head);
    }
    const ringAt = (r, x, y) => {
      const dist = Math.hypot(x - r.x, y - r.y), off = dist - r.age * SPEED;
      if (off > 120 || off < -120) return 0;
      return Math.max(0, Math.exp(-((off / 48) ** 2)) * Math.cos((off / 24) * Math.PI * 2)) * (1 - r.age / LIFE) / (1 + dist / 700);
    };
    const drawRings = () => {
      if (!ctx) return;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, CW, CH);
      if (!ripples.length) return;
      const light = document.documentElement.dataset.theme === "light";
      const path = new Path2D();
      for (let k = 0; k < LM; k++) {
        let d = 0;
        for (const r of ripples) d = Math.max(d, ringAt(r, LX[k], LY[k]));
        if (d < 0.08) continue;
        const rad = DOT * 0.5 * Math.sqrt(d * 0.22);
        path.moveTo(LX[k] + rad, LY[k]);
        path.arc(LX[k], LY[k], rad, 0, Math.PI * 2);
      }
      ctx.fillStyle = light ? "rgba(29, 26, 20, 0.45)" : "rgba(236, 233, 225, 0.4)";
      ctx.fill(path);
    };

    // ---- Redrawing the art ----
    const LIFT = { ".": ":", "·": ":", ":": "-", "-": "=", "=": "+", "+": "*", "*": "#", "#": "%", "%": "@" };
    const SQUARES = "■□▪▫";
    const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    const draw = (frame) => {
      const cw = artBox.w / COLS, ch = artBox.h / ROWS;
      const rip = ripples.map((r) => ({ x: (r.x - artBox.x) / cw, y: (r.y - artBox.y) / ch, R: (r.age * SPEED) / cw, f: 1 - r.age / LIFE }));
      let html = "";
      for (let y = 0; y < ROWS; y++) {
        let line = "", run = "", runCls = null;
        const flush = () => {
          if (!run) return;
          line += runCls ? `<span class="${runCls}">${esc(run)}</span>` : esc(run);
          run = "";
        };
        for (let x = 0; x < COLS; x++) {
          let [chr, cls] = base[y][x];
          if (chr !== " ") {
            for (const r of rip) {
              const d = Math.hypot(x - r.x, (y - r.y) * S.rowH);
              if (Math.abs(d - r.R) < 1 && r.f > 0.15) { chr = LIFT[chr] || chr; cls += " rp"; break; }
            }
          }
          // Debris squares blink here, since redrawing would restart a CSS one.
          if (/\bg\b/.test(cls)) {
            cls = cls.replace(/\s*\bg\b/, "");
            if ((frame / 16 + (y * COLS + x) * 0.37) % 4.2 > 3.3) cls += " off";
          }
          if (SQUARES.includes(chr)) {
            flush(); runCls = null;
            line += `<span class="${cls} sq">${chr}</span>`;
            continue;
          }
          const k = chr === " " ? null : cls;
          if (k !== runCls) { flush(); runCls = k; }
          run += chr;
        }
        flush();
        html += line.replace(/\s+$/, "") + "\n";
      }
      pre.innerHTML = html.replace(/\n+$/, "");
    };

    // ---- The cursor ----
    let lastRip = 0, lastAt = null;
    (head || art).addEventListener("pointermove", (e) => {
      const hr = (head || art).getBoundingClientRect();
      const x = e.clientX - hr.left, y = e.clientY - hr.top;
      const cw = artBox.w / COLS, ch = artBox.h / ROWS;
      ptr = { cx: (x - artBox.x) / cw, cy: (y - artBox.y) / ch };
      const now = performance.now();
      if (!lastAt || (now - lastRip > 420 && Math.hypot(x - lastAt.x, y - lastAt.y) > 60)) {
        ripples.push({ x, y, age: 0 });
        if (ripples.length > 3) ripples.shift();
        lastRip = now; lastAt = { x, y };
      }
      const [fx, fy] = S.flower.at;
      if (Math.hypot(ptr.cx - fx, (ptr.cy - fy) * S.rowH) < S.flower.r) {
        for (let i = 0; i < 3; i++) emit(ptr.cx + (rand() - 0.5) * 6, ptr.cy + (rand() - 0.5) * 3, true);
        if (rand() < 0.6) emit(S.anthers[0] + (rand() - 0.5) * 8, S.anthers[1], true);
      }
      run();
    });
    (head || art).addEventListener("pointerleave", () => { ptr = null; });

    // ---- The loop, about 16 frames a second, only while on screen ----
    let frame = 0, last = 0, raf = 0, visible = true;
    const FRAME = 1000 / 16;
    const tick = (now) => {
      raf = 0;
      if (!visible || document.hidden) return;
      if (now - last >= FRAME) {
        last = now; frame += 1;
        stepPollen(); stepBees();
        for (let i = ripples.length - 1; i >= 0; i--) if (++ripples[i].age > LIFE) ripples.splice(i, 1);
        draw(frame); drawPollen(); drawRings();
      }
      raf = requestAnimationFrame(tick);
    };
    const run = () => { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(tick); };
    if ("IntersectionObserver" in window) new IntersectionObserver(([e]) => { visible = e.isIntersecting; run(); }).observe(art);
    document.addEventListener("visibilitychange", run);
    run();
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
