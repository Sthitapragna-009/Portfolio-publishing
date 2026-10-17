/* Easy CMS case study: the mockup carousel. Scroll, swipe, arrows, dots or the arrow keys. */
(function () {
  var car = document.querySelector(".ec-carousel");
  if (!car) return;
  var track = car.querySelector(".ec-car-track");
  var slides = Array.prototype.slice.call(track.querySelectorAll(".ec-car-slide"));
  var dots = car.querySelectorAll(".ec-car-dot");
  var count = car.querySelector(".ec-car-count b");
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
  document.querySelectorAll(".ec-head, .ec-col img, .ec-comp img, .ec-browser img, .ec-phone img").forEach(function (el) {
    if (el.classList.contains("ec-head")) { current = el.id; return; }
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
    list = groups[img.dataset.group] || [img];
    box = document.createElement("div");
    box.className = "ec-zoom";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "Screens, full size");
    big = document.createElement("img");
    cap = document.createElement("p");
    cap.className = "ec-zoom-cap";
    count = document.createElement("p");
    count.className = "ec-zoom-count";
    count.setAttribute("aria-live", "polite");
    prev = button("ec-zoom-nav ec-zoom-prev", "Previous screen", CHEV.replace("__D__", "M15 5l-7 7 7 7"));
    next = button("ec-zoom-nav ec-zoom-next", "Next screen", CHEV.replace("__D__", "M9 5l7 7-7 7"));
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
  document.querySelectorAll(".ec-col img, .ec-comp img, .ec-browser img, .ec-phone img").forEach(function (img) {
    img.tabIndex = 0;
    img.setAttribute("role", "button");
    img.setAttribute("aria-haspopup", "dialog");
    img.addEventListener("click", function () { open(img); });
    img.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(img); }
    });
  });
})();

/* The live prototype: each role button starts the demo fresh in that role. Same origin, so the page
   can set the prototype's own saved preferences before reloading it. */
(function () {
  var live = document.querySelector(".ec-live");
  if (!live) return;
  var frame = live.querySelector("iframe");
  var open = live.querySelector(".ec-live-open");
  var base = "../prototypes/easy-cms/index.html";
  var routes = { editor: "#/home", reviewer: "#/review", admin: "#/sites" };
  function seed(role) {
    try {
      var prefs = { lang: "en", theme: "system", contrast: "normal", textsize: 1, motion: "system", helper: true, role: role };
      localStorage.setItem("easycms:prefs:v1", JSON.stringify(prefs));
      if (role === "admin") localStorage.setItem("easycms:data:v2", JSON.stringify({ sites: [], activeSite: null, items: [], people: [] }));
      else localStorage.removeItem("easycms:data:v2");
    } catch (e) { /* storage blocked: the prototype still opens with its defaults */ }
  }
  live.querySelectorAll(".ec-live-role").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var role = btn.dataset.role;
      live.querySelectorAll(".ec-live-role").forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
      open.href = base + routes[role];
      // Unload the running prototype first, so it cannot save its old state over the new start.
      frame.removeAttribute("loading");
      frame.addEventListener("load", function blank() {
        frame.removeEventListener("load", blank);
        seed(role);
        frame.src = base + "?r=" + Date.now() + routes[role];
      });
      frame.src = "about:blank";
    });
  });
})();

