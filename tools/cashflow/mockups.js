/* Photo mockups for the Cash-Flow Gap case study.
   Renders app screens at native scale from the running prototype (same set-up as capture.js),
   then maps each onto the screen of a supplied photo with a perspective transform.

   1. Start the prototype: (in "Actual Portfolio/fintech app") npm run dev -> http://localhost:5181
   2. Run: node tools/cashflow/mockups.js
   Photos: assets/cashflow/photos/*.webp (supplied by the author). Output: assets/cashflow/mk-*.webp */

const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const APP = process.env.CASHFLOW_URL || 'http://localhost:5181/';
const ROOT = path.join(__dirname, '..', '..');
const PHOTOS = path.join(ROOT, 'assets', 'cashflow', 'photos');
const OUT = path.join(ROOT, 'assets', 'cashflow');
const PORT = 9380 + Math.floor(Math.random() * 40);
const exe = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe'].find((b) => fs.existsSync(b));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const HELPERS = `
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const st = () => window.__store;
  const set = (patch) => st().d({ type: 'set', patch });
  const go = (stack, patch = {}) => st().d({ type: 'set', patch: { ...patch, why: false, history: stack } });
`;


/* Each mockup: photo, then one or more screens. A screen: the scene, an optional CSS override for the
   device, an optional crop of the rendered screen [x, y, w, h] in CSS px, the target quad in photo px
   (TL, TR, BR, BL), the corner radius in CSS px, and a light adjustment so the screen sits in the photo. */
const MOCKUPS = [
  {
    name: 'mk-hand',
    photo: 'iphone-hand.webp',
    screens: [{ setup: "go(['home'])", quad: [[375, 386], [685, 370], [856, 1031], [535, 1050]], radius: 54, light: 0.9 }],
  },
  {
    name: 'mk-sofa',
    photo: 'iphone-sofa.webp',
    screens: [{ setup: "go(['home','bank'])", quad: [[316, 204], [485, 172], [636, 524], [466, 573]], radius: 54, light: 0.86 }],
  },
  {
    name: 'mk-duo-trio',
    photo: 'duo-trio.webp',
    screens: [
      {
        // the inner display held upright: 669 x 951 pt, controls in the trailing rail
        setup: "set({ device: 'duo-outer' }); go(['home'])",
        css: '.phone.dev-duo-outer { --phone-w: 669px !important; --phone-h: 951px !important; width: 669px !important; height: 951px !important; }',
        quad: [[638, 132], [1356, 132], [1356, 1150], [638, 1150]],
        radius: 40,
        light: 1,
      },
    ],
  },
  {
    name: 'mk-duo-open',
    photo: 'duo-open.webp',
    screens: [
      // the inner display open flat in landscape: home beside Ways to cover rent, rail on the right
      { setup: "set({ device: 'duo-inner', pose: 'flat' }); go(['home'], { option: 'savings' })", quad: [[235, 391], [1178, 204], [1395, 885], [456, 1158]], radius: 40, light: 0.97 },
    ],
    occlude: [
      // right thumb, resting on the Messages icon
      [[1287, 621], [1305, 615], [1322, 609], [1345, 602], [1375, 596], [1400, 587], [1460, 570], [1460, 760], [1345, 740], [1337, 712], [1327, 705], [1312, 695], [1297, 680], [1285, 660], [1281, 648], [1282, 635]],
      // left palm over the bottom-left corner
      [[200, 900], [330, 940], [376, 980], [420, 1026], [458, 1070], [483, 1103], [504, 1143], [521, 1184], [537, 1239], [200, 1260]],
    ],
  },
  {
    name: 'mk-duo-hands',
    photo: 'duo-hands.webp',
    screens: [
      // book pose: left half and right half of the inner display, each on its own plane
      { setup: "set({ device: 'duo-inner', pose: 'book' }); go(['home'], { option: 'savings' })", crop: [0, 0, 475.5, 669], quad: [[180, 9], [487, 40], [487, 479], [180, 502]], radius: [34, 0, 0, 34], light: 1 },
      { setup: "set({ device: 'duo-inner', pose: 'book' }); go(['home'], { option: 'savings' })", crop: [475.5, 0, 475.5, 669], quad: [[487, 40], [788, 11], [788, 504], [487, 479]], radius: [0, 34, 34, 0], light: 1 },
    ],
    // The hands sit in front of the screen: the photo's own pixels go back on top inside these outlines (traced from the photo).
    occlude: [
      // left thumb and palm
      [[120, 130], [175, 130], [176, 412], [180, 430], [186, 450], [193, 470], [200, 490], [208, 508], [120, 508]],
      // right thumb and palm
      [[792, 130], [792, 430], [786, 450], [778, 475], [768, 492], [759, 510], [860, 510], [860, 130]],
    ],
  },
];

/** CSS matrix3d that maps the rectangle (0,0)-(w,h) onto the quad. */
function quadMatrix(w, h, q) {
  const src = [[0, 0], [w, 0], [w, h], [0, h]];
  const A = [];
  const B = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i];
    const [u, v] = q[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
    B.push(u);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
    B.push(v);
  }
  // Gaussian elimination
  for (let c = 0; c < 8; c++) {
    let p = c;
    for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    [A[c], A[p]] = [A[p], A[c]];
    [B[c], B[p]] = [B[p], B[c]];
    for (let r = 0; r < 8; r++) {
      if (r === c) continue;
      const f = A[r][c] / A[c][c];
      for (let k = c; k < 8; k++) A[r][k] -= f * A[c][k];
      B[r] -= f * B[c];
    }
  }
  const [a, b, c, d, e, f, g, hh] = B.map((v, i) => v / A[i][i]);
  return `matrix3d(${[a, d, 0, g, b, e, 0, hh, 0, 0, 1, 0, c, f, 0, 1].join(',')})`;
}

async function main() {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cashflow-mk-'));
  const proc = spawn(exe, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--hide-scrollbars', '--no-first-run', '--force-color-profile=srgb', 'about:blank'], { stdio: 'ignore' });
  let targets = [];
  for (let i = 0; i < 60; i++) {
    try {
      targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      if (targets.find((t) => t.type === 'page')) break;
    } catch {
      /* starting */
    }
    await sleep(200);
  }
  const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
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
    const r = await send('Runtime.evaluate', { expression: `(async () => { ${HELPERS}; ${expr} })()`, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  };
  await send('Page.enable');
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });

  /** Renders one app screen at 3x and returns it as a PNG data URL plus its CSS size. */
  async function screen({ setup, css = '', crop }) {
    await send('Emulation.setDeviceMetricsOverride', { width: 1500, height: 1100, deviceScaleFactor: 3, mobile: false });
    await send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
    await send('Page.navigate', { url: 'about:blank' });
    await sleep(150);
    await send('Page.navigate', { url: `${APP}?r=${Date.now()}` });
    await sleep(1400);
    await js(`await document.fonts.ready; for (let i = 0; i < 40 && !window.__store; i++) await wait(100);
      ${setup}; await wait(1100);
      const s = document.createElement('style'); s.textContent = ${JSON.stringify('.rail { visibility: hidden; } .phone { box-shadow: none !important; border-radius: 0 !important; } .phone .home-indicator { opacity: .9 } ' + css)}; document.head.appendChild(s); await wait(300);`);
    const r = await js(`const b = document.querySelector('.phone').getBoundingClientRect(); return { x: b.left + scrollX, y: b.top + scrollY, w: b.width, h: b.height };`);
    const [cx, cy, cw, ch] = crop || [0, 0, r.w, r.h];
    const shot = await send('Page.captureScreenshot', { format: 'png', clip: { x: r.x + cx, y: r.y + cy, width: cw, height: ch, scale: 1 }, captureBeyondViewport: true });
    return { data: `data:image/png;base64,${shot.data}`, w: cw, h: ch };
  }

  for (const mk of MOCKUPS) {
    const shots = [];
    for (const s of mk.screens) shots.push({ ...s, ...(await screen(s)) });
    const photo = fs.readFileSync(path.join(PHOTOS, mk.photo)).toString('base64');
    // compose: the photo at native size, each screen transformed onto its quad
    await send('Emulation.setDefaultBackgroundColorOverride', {});
    await send('Page.navigate', { url: 'about:blank' });
    await sleep(200);
    const dims = await js(`const im = new Image(); im.src = 'data:image/webp;base64,${photo}'; await im.decode(); return { w: im.width, h: im.height };`);
    await send('Emulation.setDeviceMetricsOverride', { width: dims.w, height: dims.h, deviceScaleFactor: 1, mobile: false });
    const layers = shots
      .map((s) => {
        const rad = Array.isArray(s.radius) ? s.radius.map((v) => v + 'px').join(' ') : s.radius + 'px';
        return `<div class="scr" style="width:${s.w}px;height:${s.h}px;border-radius:${rad};transform:${quadMatrix(s.w, s.h, s.quad)};filter:brightness(${s.light})"><img src="${s.data}"><i></i></div>`;
      })
      .join('');
    await js(`document.open(); document.write(${JSON.stringify(`<!doctype html><style>
      html,body{margin:0;background:#000}
      .stage{position:relative;width:${dims.w}px;height:${dims.h}px;overflow:hidden}
      .stage>img{display:block}
      .scr{position:absolute;left:0;top:0;transform-origin:0 0;overflow:hidden}
      .scr img{display:block;width:100%;height:100%}
      .scr i{position:absolute;inset:0;background:linear-gradient(125deg,rgb(255 255 255/.07),rgb(255 255 255/0) 38%,rgb(0 0 0/0) 70%,rgb(0 0 0/.12))}
    .stage>img.occ{position:absolute;inset:0}
    </style><div class="stage"><img src="data:image/webp;base64,${photo}">${layers}${(mk.occlude || []).map((p) => `<img class="occ" src="data:image/webp;base64,${photo}" style="clip-path:polygon(${p.map(([x, y]) => x + 'px ' + y + 'px').join(',')})">`).join('')}</div>`)}); document.close();
      await Promise.all([...document.images].map((i) => i.decode())); await wait(300);`);
    const { data } = await send('Page.captureScreenshot', { format: 'webp', quality: 90, clip: { x: 0, y: 0, width: dims.w, height: dims.h, scale: 1 } });
    fs.writeFileSync(path.join(OUT, `${mk.name}.webp`), Buffer.from(data, 'base64'));
    console.log('  saved', mk.name);
  }
  ws.close();
  proc.kill();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
