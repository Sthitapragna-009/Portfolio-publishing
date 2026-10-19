/* Saaf Safar case study: the mockup carousel, the screen gallery and the live prototype. */
(function () {
  var car = document.querySelector(".ss-carousel");
  if (!car) return;
  var track = car.querySelector(".ss-car-track");
  var slides = Array.prototype.slice.call(track.querySelectorAll(".ss-car-slide"));
  var dots = car.querySelectorAll(".ss-car-dot");
  var count = car.querySelector(".ss-car-count b");
  var prev = car.querySelector('[data-dir="-1"]');
  var next = car.querySelector('[data-dir="1"]');
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var current = 0;

  function go(i) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    var left = slides[i].offsetLeft - track.offsetLeft;
    track.scrollTo({ left: left, behavior: reduced ? "auto" : "smooth" });
  }
  function sync() {
    // The current slide is the one whose left edge is nearest the track's left edge;
    // at the end of the track, the last slide.
    var x = track.scrollLeft;
    var best = 0, dist = Infinity;
    slides.forEach(function (s, i) {
      var d = Math.abs(s.offsetLeft - track.offsetLeft - x);
      if (d < dist) { dist = d; best = i; }
    });
    if (x + track.clientWidth >= track.scrollWidth - 4) best = slides.length - 1;
    current = best;
    dots.forEach(function (d, i) { if (i === best) d.setAttribute("aria-current", "true"); else d.removeAttribute("aria-current"); });
    count.textContent = String(best + 1).padStart(2, "0");
    prev.disabled = x <= 2;
    next.disabled = x + track.clientWidth >= track.scrollWidth - 4;
  }
  var raf = 0;
  track.addEventListener("scroll", function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(sync); }, { passive: true });
  window.addEventListener("resize", sync);
  prev.addEventListener("click", function () { go(current - 1); });
  next.addEventListener("click", function () { go(current + 1); });
  dots.forEach(function (d, i) { d.addEventListener("click", function () { go(i); }); });
  track.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { e.preventDefault(); go(current + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(current - 1); }
  });
  sync();
})();

/* Screens open full size in a gallery for their section: chevrons, arrow keys, Esc to close. */
(function () {
  // Group every screen under the section head that comes before it, in document order.
  var groups = {};
  var current = "top";
  document.querySelectorAll(".ss-head, .ss-col img, .ss-comp img, .ss-browser img, .ss-phone img, .ss-dev img, .ss-hi-peek img").forEach(function (el) {
    if (el.classList.contains("ss-head")) { current = el.id; return; }
    (groups[current] = groups[current] || []).push(el);
    el.dataset.group = current;
  });

  var box = null, list = [], index = 0, opener = null;
  var big, cap, count, prev, next;

  function show(i) {
    index = (i + list.length) % list.length;
    var img = list[index];
    big.src = img.currentSrc || img.src;
    big.alt = img.alt;
    cap.textContent = img.alt;
    count.textContent = (index + 1) + " / " + list.length;
    var many = list.length > 1;
    prev.hidden = next.hidden = count.hidden = !many;
  }
  function close() {
    if (!box) return;
    var b = box;
    box = null;
    b.classList.remove("on");
    setTimeout(function () { b.remove(); }, 200);
    document.removeEventListener("keydown", onKey);
    if (opener) opener.focus();
  }
  function onKey(e) {
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight" && list.length > 1) { e.preventDefault(); show(index + 1); }
    if (e.key === "ArrowLeft" && list.length > 1) { e.preventDefault(); show(index - 1); }
  }
  var CHEV = '<svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true" focusable="false"><path d="__D__" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function button(cls, label, text) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = cls;
    b.setAttribute("aria-label", label);
    if (text.charAt(0) === "<") b.innerHTML = text; else b.textContent = text;
    return b;
  }
  function open(img) {
    opener = img;
    // Only images that are showing: the design system carries a light and a dark copy of each component.
    list = (groups[img.dataset.group] || [img]).filter(function (i) { return i.offsetParent !== null; });
    box = document.createElement("div");
    box.className = "ss-zoom";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "Screens, full size");
    big = document.createElement("img");
    cap = document.createElement("p");
    cap.className = "ss-zoom-cap";
    count = document.createElement("p");
    count.className = "ss-zoom-count";
    count.setAttribute("aria-live", "polite");
    prev = button("ss-zoom-nav ss-zoom-prev", "Previous screen", CHEV.replace("__D__", "M15 5l-7 7 7 7"));
    next = button("ss-zoom-nav ss-zoom-next", "Next screen", CHEV.replace("__D__", "M9 5l7 7-7 7"));
    var shut = button("", "Close", "×");
    [cap, big, prev, next, count, shut].forEach(function (n) { box.appendChild(n); });
    prev.addEventListener("click", function (e) { e.stopPropagation(); show(index - 1); });
    next.addEventListener("click", function (e) { e.stopPropagation(); show(index + 1); });
    big.addEventListener("click", function (e) { e.stopPropagation(); if (list.length > 1) show(index + 1); });
    shut.addEventListener("click", function (e) { e.stopPropagation(); close(); });
    box.addEventListener("click", close);
    document.body.appendChild(box);
    show(list.indexOf(img));
    requestAnimationFrame(function () { if (box) box.classList.add("on"); });
    (list.length > 1 ? next : shut).focus();
    document.addEventListener("keydown", onKey);
  }
  document.querySelectorAll(".ss-col img, .ss-comp img, .ss-browser img, .ss-phone img, .ss-dev img, .ss-hi-peek img").forEach(function (img) {
    img.tabIndex = 0;
    img.setAttribute("role", "button");
    img.setAttribute("aria-haspopup", "dialog");
    img.addEventListener("click", function () { open(img); });
    img.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(img); }
    });
  });
})();

/* The live prototype: each role button opens that touchpoint. Roles are plain links (#/attendant ...),
   and ?embed hides the prototype's own side caption, since this page explains it. */
(function () {
  var live = document.querySelector(".ss-live");
  if (!live) return;
  var frame = live.querySelector("iframe");
  var open = live.querySelector(".ss-live-open");
  var base = "../prototypes/saaf-safar/index.html";
  var buttons = live.querySelectorAll(".ss-live-role");
  var mark = function (role) {
    buttons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.role === role)); });
    open.href = base + "?lang=en#/" + role;
  };
  // The prototype's own window, when the page can reach it (same origin, already loaded).
  var app = function () {
    try { var w = frame.contentWindow; return w && w.document.getElementById("root") ? w : null; } catch (err) { return null; }
  };
  // Switching role only changes the hash, so the running simulation (and a triggered
  // incident) carries on; reloading the frame would restart the day.
  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var role = btn.dataset.role, w = app();
      mark(role);
      if (w) { w.location.hash = "#/" + role; return; }
      frame.removeAttribute("loading");
      frame.src = base + "?embed&lang=en#/" + role;
    });
  });
  // Keep the buttons in step with the prototype's own role tabs.
  frame.addEventListener("load", function () {
    var w = app();
    if (!w) return;
    w.addEventListener("hashchange", function () {
      var role = w.location.hash.replace(/^#\/?/, "").split(/[/?]/)[0];
      if (role) mark(role);
    });
  });
})();
