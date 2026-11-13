/* Captures the Pathang rider prototype for projects/pathang-mobility.html.
   Drives headless Edge (or Chrome) over the DevTools protocol; no dependencies.

   1. Start the prototype:  (in "After IIT Roorkee/Pathang Mobility")  npm run dev -- --port 3007
   2. Run:  node tools/pathang/capture.js          (everything)
            node tools/pathang/capture.js p-       (scenes whose name starts with "p-")
            node tools/pathang/capture.js bz       (the Apple-bezel product shots only)
            node tools/pathang/capture.js sheets   (contact sheets only, from files already captured)
   Output: assets/pathang/v2/*.webp. Each scene is one device at its real point size, 3x for
   iPhone and 2x for the rest, with its own rounded corners on a transparent background.
   Every scene is a URL the prototype understands, so any of them can be opened by hand. */

const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const APP = process.env.PATHANG_URL || 'http://localhost:3007/';
const OUT = path.join(__dirname, '..', '..', 'assets', 'pathang', 'v2');
const RES = path.join(__dirname, '..', '..', '..', 'Apple design resources');
const ONLY = process.argv[2];
const PORT = 9337;
const BROWSERS = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// name, query, device scale
const P = (name, q) => [name, 'device=iphone&' + q, 3];
const W = (name, q) => [name, 'device=watch&' + q, 3];
const SCENES = [
  P('p-welcome', 'stage=welcome'),
  P('p-brief-1', 'stage=brief&step=0'),
  P('p-brief-2', 'stage=brief&step=1'),
  P('p-brief-3', 'stage=brief&step=2'),
  P('p-permission', 'stage=permission'),
  P('p-home', 'stage=home'),
  P('p-search', 'stage=search'),
  P('p-choose', 'stage=choose'),
  P('p-matching', 'stage=matching'),
  P('p-enroute', 'stage=enroute&t=0.45'),
  P('p-arrived', 'stage=arrived'),
  P('p-riding', 'stage=riding&t=0.42'),
  P('p-stopped', 'stage=stopped&t=0.5'),
  P('p-complete', 'stage=complete&rating=5'),
  P('p-nopods', 'stage=home&edge=nopods'),
  P('p-lowwallet', 'stage=choose&edge=lowwallet'),
  P('p-delayed', 'stage=enroute&edge=delayed&t=0.4'),
  P('p-late', 'stage=arrived&edge=late'),
  W('w-face', 'stage=home'),
  W('w-enroute', 'stage=enroute&t=0.45'),
  W('w-delayed', 'stage=enroute&edge=delayed&t=0.4'),
  W('w-arrived', 'stage=arrived'),
  W('w-late', 'stage=arrived&edge=late'),
  W('w-riding', 'stage=riding&t=0.42'),
  W('w-stopped', 'stage=stopped&t=0.5'),
  W('w-complete', 'stage=complete'),
  ['l-widgets', 'device=outside&stage=home', 3],
  ['l-enroute', 'device=outside&stage=enroute&t=0.45', 3],
  ['l-arrived', 'device=outside&stage=arrived', 3],
  ['l-riding', 'device=outside&stage=riding&t=0.42', 3],
  ['l-complete', 'device=outside&stage=complete', 3],
  ['h-widgets', 'device=outside&view=home&stage=home', 3],
  ['h-island', 'device=outside&view=home&stage=riding&t=0.42', 3],
  ['h-island-x', 'device=outside&view=home&stage=enroute&t=0.45&x=1', 3],
  ['i-plan', 'device=ipad&stage=home', 2],
  ['i-riding', 'device=ipad&stage=riding&t=0.42', 2],
  ['d-enroute', 'device=pod&stage=enroute&t=0.45', 2],
  ['d-arrived', 'device=pod&stage=arrived', 2],
  ['d-riding', 'device=pod&stage=riding&t=0.42', 2],
  ['d-complete', 'device=pod&stage=complete', 2],
];

// name, query, bezel file, screen rect inside the bezel [x, y, w, h], device scale, output scale, corner radius
const IPHONE = ['iPhone 18 bezels/png/iPhone 18 Pro - Black - Portrait.png', [72, 69, 1206, 2622], 3, 0.5, 170];
const IPAD = ['iPad Air M4 bezels/png/iPad Air 11_ (M4) - Space Gray - Landscape.png', [130, 130, 2360, 1640], 2, 0.46, 40];
const WATCH = ['Apple Watch Series 11 bezels/png/Apple Watch S11 - 46mm - Aluminum Jet Black + Sport Band Black.png', [72, 192, 416, 496], 2, 0.75, 76];
const BEZELS = [
  ['bz-phone-home', 'device=iphone&stage=home', ...IPHONE],
  ['bz-phone-choose', 'device=iphone&stage=choose', ...IPHONE],
  ['bz-phone-enroute', 'device=iphone&stage=enroute&t=0.45', ...IPHONE],
  ['bz-phone-arrived', 'device=iphone&stage=arrived', ...IPHONE],
  ['bz-phone-riding', 'device=iphone&stage=riding&t=0.42', ...IPHONE],
  ['bz-phone-lock', 'device=outside&stage=arrived', ...IPHONE],
  ['bz-watch-face', 'device=watch&stage=home', ...WATCH],
  ['bz-watch-arrived', 'device=watch&stage=arrived', ...WATCH],
  ['bz-watch-riding', 'device=watch&stage=riding&t=0.42', ...WATCH],
  ['bz-ipad-plan', 'device=ipad&stage=home', ...IPAD],
  ['bz-ipad-riding', 'device=ipad&stage=riding&t=0.42', ...IPAD],
];

// Contact sheets, for reviewing a whole flow at once: name, scene prefix or list, height of each tile
const SHEETS = [
  ['sheet-first', ['p-welcome', 'p-brief-1', 'p-brief-2', 'p-brief-3', 'p-permission'], 760],
  ['sheet-book', ['p-home', 'p-search', 'p-choose', 'p-matching'], 760],
  ['sheet-ride', ['p-enroute', 'p-arrived', 'p-riding', 'p-stopped', 'p-complete'], 760],
  ['sheet-edges', ['p-nopods', 'p-lowwallet', 'p-delayed', 'p-late'], 760],
  ['sheet-watch', ['w-face', 'w-enroute', 'w-arrived', 'w-riding', 'w-stopped', 'w-complete', 'w-delayed', 'w-late'], 372],
  ['sheet-outside', ['l-widgets', 'l-enroute', 'l-arrived', 'l-riding', 'h-widgets', 'h-island', 'h-island-x'], 620],
  ['sheet-big', ['i-plan', 'i-riding'], 520],
  ['sheet-pod', ['d-enroute', 'd-arrived', 'd-riding', 'd-complete'], 300],
];

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const exe = BROWSERS.find((b) => fs.existsSync(b));
  if (!exe) throw new Error('No Edge or Chrome found');
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'pathang-cap-'));
  const proc = spawn(exe, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--hide-scrollbars', '--no-first-run', '--no-default-browser-check', '--force-color-profile=srgb', 'about:blank'], { stdio: 'ignore' });

  let targets = [];
  for (let i = 0; i < 50; i++) {
    try {
      targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      if (targets.length) break;
    } catch {
      /* starting */
    }
    await sleep(200);
  }
  const page = targets.find((t) => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r, { once: true }));
  let id = 0;
  const pending = new Map();
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m);
      pending.delete(m.id);
    }
  });
  const send = (method, params = {}) =>
    new Promise((res, rej) => {
      const i = ++id;
      pending.set(i, (m) => (m.error ? rej(new Error(`${method}: ${m.error.message}`)) : res(m.result)));
      ws.send(JSON.stringify({ id: i, method, params }));
    });
  const js = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: `(async () => { const wait = (ms) => new Promise((r) => setTimeout(r, ms)); ${expr} })()`, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  };
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });

  const open = async (query, dsf, extraCss = '') => {
    await send('Emulation.setDeviceMetricsOverride', { width: 1400, height: 1000, deviceScaleFactor: dsf, mobile: false });
    await send('Page.navigate', { url: `${APP}?bare=1&${query}` });
    for (let i = 0; i < 80; i++) {
      await sleep(150);
      if (await js("return !!document.querySelector('.pm-bare[data-ready]')").catch(() => false)) break;
    }
    await js(
      "await document.fonts.ready; const s = document.createElement('style'); s.textContent = 'html, body { background: transparent !important; } nextjs-portal { display: none !important; } " +
        extraCss +
        "'; document.head.appendChild(s); await wait(350);",
    );
    return js("const b = document.querySelector('.pm-bare > *').getBoundingClientRect(); return { x: b.left + scrollX, y: b.top + scrollY, w: b.width, h: b.height };");
  };

  const want = (name) => !ONLY || name.startsWith(ONLY);

  if (ONLY !== 'bz' && ONLY !== 'sheets') {
    for (const [name, query, dsf] of SCENES) {
      if (!want(name)) continue;
      const r = await open(query, dsf);
      const { data } = await send('Page.captureScreenshot', { format: 'webp', quality: 92, clip: { x: r.x, y: r.y, width: r.w, height: r.h, scale: 1 }, captureBeyondViewport: true });
      fs.writeFileSync(path.join(OUT, name + '.webp'), Buffer.from(data, 'base64'));
      console.log('  saved', name);
    }
  }

  // Product shots: the screen at native scale, composited under Apple's own bezel PNGs.
  if (!ONLY || ONLY === 'bz' || ONLY.startsWith('bz-')) {
    for (const [name, query, bezel, [sx, sy, sw, sh], dsf, outScale, rad] of BEZELS) {
      if (ONLY && ONLY !== 'bz' && !name.startsWith(ONLY)) continue;
      const bezelPath = path.join(RES, bezel);
      if (!fs.existsSync(bezelPath)) {
        console.log('  NO BEZEL', bezel);
        continue;
      }
      // The bezel art carries the corners, the Island and the home indicator.
      const r = await open(query, dsf, '.pm-phone, .pm-watch, .pm-pad { border-radius: 0 !important; } .pm-island, .pm-homebar { visibility: hidden; }');
      const shot = await send('Page.captureScreenshot', { format: 'png', clip: { x: r.x, y: r.y, width: r.w, height: r.h, scale: 1 }, captureBeyondViewport: true });
      const bz = fs.readFileSync(bezelPath).toString('base64');
      const out = await js(
        "const load = (src) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = src; });" +
          "const [sc, bz] = await Promise.all([load('data:image/png;base64," + shot.data + "'), load('data:image/png;base64," + bz + "')]);" +
          'const c = document.createElement("canvas"); c.width = Math.round(bz.width * ' + outScale + '); c.height = Math.round(bz.height * ' + outScale + ');' +
          'const x = c.getContext("2d"); x.imageSmoothingQuality = "high"; x.scale(' + outScale + ', ' + outScale + ');' +
          'x.save(); x.beginPath(); x.roundRect(' + sx + ', ' + sy + ', ' + sw + ', ' + sh + ', ' + rad + '); x.clip(); x.drawImage(sc, ' + sx + ', ' + sy + ', ' + sw + ', ' + sh + '); x.restore(); x.drawImage(bz, 0, 0);' +
          'return c.toDataURL("image/webp", 0.9).split(",")[1];',
      );
      fs.writeFileSync(path.join(OUT, name + '.webp'), Buffer.from(out, 'base64'));
      console.log('  saved', name);
    }
  }

  // Contact sheets on the case study's dark ground, labelled, for review.
  if (!ONLY || ONLY === 'sheets') {
    await send('Page.navigate', { url: 'about:blank' });
    await sleep(300);
    for (const [name, list, tile] of SHEETS) {
      const imgs = list.filter((n) => fs.existsSync(path.join(OUT, n + '.webp'))).map((n) => [n, fs.readFileSync(path.join(OUT, n + '.webp')).toString('base64')]);
      if (!imgs.length) continue;
      const out = await js(
        'const items = ' + JSON.stringify(imgs) + '; const T = ' + tile + ';' +
          "const load = (src) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = src; });" +
          "const ims = await Promise.all(items.map(([, b]) => load('data:image/webp;base64,' + b)));" +
          'const ws = ims.map((i) => Math.round(i.width * T / i.height)); const gap = 28, pad = 32;' +
          'const c = document.createElement("canvas"); c.width = ws.reduce((a, b) => a + b, 0) + gap * (ims.length - 1) + pad * 2; c.height = T + pad * 2 + 30;' +
          'const x = c.getContext("2d"); x.fillStyle = "#0d0d0f"; x.fillRect(0, 0, c.width, c.height); x.imageSmoothingQuality = "high"; let px = pad;' +
          'ims.forEach((im, k) => { x.drawImage(im, px, pad, ws[k], T); x.fillStyle = "#9a9aa2"; x.font = "16px sans-serif"; x.fillText(items[k][0], px, pad + T + 24); px += ws[k] + gap; });' +
          'return c.toDataURL("image/jpeg", 0.86).split(",")[1];',
      );
      fs.writeFileSync(path.join(OUT, name + '.jpg'), Buffer.from(out, 'base64'));
      console.log('  saved', name);
    }
  }

  // The case-study hero: three phones and the Watch side by side, nothing overlapping.
  if (!ONLY || ONLY === 'hero') {
    await send('Page.navigate', { url: 'about:blank' });
    await sleep(300);
    const names = ['bz-phone-home', 'bz-phone-enroute', 'bz-watch-arrived', 'bz-phone-riding'];
    const imgs = names.map((n) => fs.readFileSync(path.join(OUT, n + '.webp')).toString('base64'));
    const out = await js(
      'const items = ' + JSON.stringify(imgs) + ';' +
        "const load = (src) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = src; });" +
        "const ims = await Promise.all(items.map((b) => load('data:image/webp;base64,' + b)));" +
        'const W = 1600, H = 900, c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d");' +
        'x.fillStyle = "#0b0b0c"; x.fillRect(0, 0, W, H); const g = x.createRadialGradient(W * 0.5, H * 0.62, 0, W * 0.5, H * 0.62, W * 0.55); g.addColorStop(0, "rgba(250,110,38,0.22)"); g.addColorStop(1, "rgba(250,110,38,0)"); x.fillStyle = g; x.fillRect(0, 0, W, H);' +
        'const hs = [760, 760, 430, 760]; const ws = ims.map((im, k) => im.width * hs[k] / im.height); const gap = (W - ws.reduce((a, b) => a + b, 0)) / (ims.length + 1); let px = gap; x.imageSmoothingQuality = "high";' +
        'ims.forEach((im, k) => { x.drawImage(im, px, (H - hs[k]) / 2, ws[k], hs[k]); px += ws[k] + gap; });' +
        'return c.toDataURL("image/jpeg", 0.88).split(",")[1];',
    );
    fs.writeFileSync(path.join(OUT, 'hero.jpg'), Buffer.from(out, 'base64'));
    console.log('  saved hero');
  }

  ws.close();
  proc.kill();
  console.log('done ->', OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
