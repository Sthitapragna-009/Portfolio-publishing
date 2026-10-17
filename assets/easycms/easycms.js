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
