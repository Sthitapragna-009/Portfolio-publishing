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

/* Easy CMS case study: click any screen to see it full size. Esc or click to close. */
(function () {
  var shots = document.querySelectorAll(".ec-browser img, .ec-phone img");
  if (!shots.length) return;
  var last = null;

  function close(box) {
    box.classList.remove("on");
    setTimeout(function () { box.remove(); }, 200);
    document.removeEventListener("keydown", onKey);
    if (last) last.focus();
  }
  function onKey(e) {
    var box = document.querySelector(".ec-zoom");
    if (e.key === "Escape" && box) close(box);
  }
  function open(img) {
    last = img;
    var box = document.createElement("div");
    box.className = "ec-zoom";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", img.alt || "Screen");
    var big = document.createElement("img");
    big.src = img.currentSrc || img.src;
    big.alt = img.alt;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("aria-label", "Close");
    btn.textContent = "×";
    box.appendChild(big);
    box.appendChild(btn);
    box.addEventListener("click", function () { close(box); });
    document.body.appendChild(box);
    requestAnimationFrame(function () { box.classList.add("on"); });
    btn.focus();
    document.addEventListener("keydown", onKey);
  }
  shots.forEach(function (img) {
    img.tabIndex = 0;
    img.setAttribute("role", "button");
    img.addEventListener("click", function () { open(img); });
    img.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(img); }
    });
  });
})();
