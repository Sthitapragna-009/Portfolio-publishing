// The dedicated Khatiq prototype page (projects/khatiq-prototype.html): only the app, scaled to
// fit the window and centred. No site header, footer or side panel; one small way back.
function protoPage() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Khatiq prototype | Sthitapragna Kollepara</title>
  <meta name="description" content="Try the Khatiq prototype: a money app for India that warns you three days before a payment bounces." />
  <link rel="icon" href="../favicon.svg" type="image/svg+xml" />
  <style>
    html, body { margin: 0; height: 100%; background: #000; overflow: hidden; }
    .stage { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; }
    .frame { position: relative; overflow: hidden; }
    .frame iframe { position: absolute; top: 0; left: 0; border: 0; transform-origin: 0 0; background: transparent; }
    .back {
      position: fixed; top: 14px; left: 16px; z-index: 2;
      font: 500 14px/1 -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
      color: #a3a3a0; text-decoration: none; padding: 10px 12px; border-radius: 10px;
    }
    .back:hover, .back:focus-visible { color: #fff; background: #1c1c1e; outline: none; }
  </style>
</head>
<body>
  <a class="back" href="cash-flow-gap.html"><span aria-hidden="true">&larr;</span> Case study</a>
  <main class="stage">
    <div class="frame" id="frame">
      <iframe id="app" src="../prototypes/cash-flow-gap/index.html?embed" title="Khatiq prototype"></iframe>
    </div>
  </main>
  <script>
    (function () {
      var frame = document.getElementById("frame");
      var app = document.getElementById("app");
      var W = 402 + 96, H = 874 + 96; // the phone plus the space the embed leaves around it
      function fit() {
        var s = Math.min(1, (window.innerWidth - 16) / W, (window.innerHeight - 16) / H);
        app.style.width = W + "px";
        app.style.height = H + "px";
        app.style.transform = "scale(" + s + ")";
        frame.style.width = Math.round(W * s) + "px";
        frame.style.height = Math.round(H * s) + "px";
      }
      window.addEventListener("resize", fit);
      fit();
    })();
  </script>
</body>
</html>
`;
}

module.exports = { protoPage };
