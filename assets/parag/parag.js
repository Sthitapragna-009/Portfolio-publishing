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
