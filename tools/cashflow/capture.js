/* Captures the Cash-Flow Gap prototype for projects/cash-flow-gap.html.
   Drives headless Edge (or Chrome) over the DevTools protocol; no dependencies.

   1. Start the prototype:  (in "Actual Portfolio/fintech app")  npm run dev  -> http://localhost:5181
      It must be the dev server: scenes are set up through window.__store, which only exists in dev.
   2. Run:  node tools/cashflow/capture.js            (all scenes)
            node tools/cashflow/capture.js accounts   (scenes whose name starts with "accounts")
            node tools/cashflow/capture.js cover      (the project card; needs the portfolio server on 5190)
   Output: assets/cashflow/*.webp — each phone with its own rounded frame on a transparent background. */

const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const APP = process.env.CASHFLOW_URL || 'http://localhost:5181/';
const PORTFOLIO = process.env.PORTFOLIO_URL || 'http://localhost:5190/';
const OUT = path.join(__dirname, '..', '..', 'assets', 'cashflow');
const ONLY = process.argv[2];
const PORT = 9335;
const BROWSERS = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* Injected into every evaluation: `go` replaces the screen stack, `set` patches state. */
const HELPERS = `
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const st = () => window.__store;
  const set = (patch) => st().d({ type: 'set', patch });
  const go = (stack, patch = {}) => st().d({ type: 'set', patch: { ...patch, why: false, history: stack } });
  const lens = (l) => st().d({ type: 'lens', lens: l });
`;

const KESARI = [
  { id: 'kesari-sb', bank: 'kesari', name: 'Savings account', type: 'Savings account', number: '•• 5512', balance: 8240 },
  { id: 'kesari-fd', bank: 'kesari', name: 'Fixed deposit', type: 'Fixed deposit', number: '•• 5519', balance: 100000 },
];
const NILA = { id: 'nila-sb', bank: 'nila', name: 'Savings account', type: 'Savings account', number: '•• 0937', balance: 12480, updated: 'Updated 2 hours ago' };

/** Each scene: a name, the set-up script, how long to let it settle, and what to crop. */
const SCENES = [
  // onboarding
  ['onb-welcome', `go(['welcome'])`],
  ['onb-bank', `go(['welcome','choose-bank'])`],
  ['onb-phone', `go(['welcome','phone'])`],
  ['onb-otp', `go(['welcome','otp'])`, 1900],
  ['onb-pin', `go(['welcome','set-pin'])`],
  ['onb-notify', `go(['notify'])`],
  // the gap
  ['gap-home', `go(['home'])`],
  ['gap-bank', `go(['home','bank'])`],
  ['gap-why', `go(['home','bank']); await wait(400); set({ why: true })`, 1200],
  ['gap-compare', `go(['home','compare'], { option: 'savings' })`],
  ['gap-confirm', `go(['home','compare','confirm'], { option: 'savings', amount: 1500 })`],
  ['gap-stepup', `go(['home','compare','confirm'], { option: 'savings', amount: 30000 })`],
  ['gap-waiting', `go(['home','compare','confirm','waiting'], { option: 'savings', amount: 1500 })`, 1500],
  ['gap-done', `go(['home','done'], { option: 'savings', amount: 1500 })`, 1600],
  ['gap-covered', `go(['home'], { gap: false, resolved: 'savings', option: null })`],
  ['gap-error', `go(['home','error'], { option: 'savings' })`],
  ['gap-handoff', `go(['home','handoff'], { handoffFrom: 'Cash-flow card' })`],
  ['gap-jargon', `go(['home','jargon'])`],
  // Seth
  ['ai-home', `lens('ai'); await wait(200); go(['home','bank'])`],
  ['ai-optin', `lens('ai'); await wait(200); set({ assistantOn: false, assistantAsked: [] })`, 1400],
  ['ai-chat', `lens('ai'); await wait(200); set({ assistantOn: true, assistantAsked: ['why', 'early', 'send'] })`],
  ['ai-sheet', `lens('ai'); await wait(200); go(['assistant','agent-sheet'])`],
  // accounts and linking
  ['acc-all', `go(['accounts'])`, 1500],
  ['acc-linked', `go(['accounts'], { linked: ${JSON.stringify([NILA, ...KESARI])} })`, 1500],
  ['acc-detail', `go(['accounts','account'], { sel: { account: 'main' } })`],
  ['acc-nila', `go(['accounts','account'], { sel: { account: 'nila-sb' } })`],
  ['link-pick', `go(['accounts','link-bank'])`],
  ['link-consent', `go(['accounts','link-bank','link-consent'], { linkBank: 'kesari', linkPicked: ['kesari-sb','kesari-fd'], linkFail: false })`],
  ['link-otp', `go(['accounts','link-bank','link-consent','link-otp'], { linkBank: 'kesari' })`, 1600],
  ['link-search', `go(['accounts','link-discover'], { linkBank: 'kesari', linkPicked: ['kesari-sb','kesari-fd'], linkFail: false })`, 700],
  ['link-found', `go(['accounts','link-discover'], { linkBank: 'kesari', linkPicked: ['kesari-sb','kesari-fd'], linkFail: false })`, 2400],
  ['link-failed', `go(['accounts','link-discover'], { linkBank: 'sahyog', linkPicked: ['sahyog-sb'], linkFail: true })`, 2400],
  ['link-done', `go(['link-done'], { linkBank: 'kesari', linked: ${JSON.stringify([NILA, ...KESARI])} })`, 1400],
  ['link-consents', `go(['profile','consents'], { linked: ${JSON.stringify([NILA, ...KESARI])} })`],
  // activity and pay
  ['act-list', `go(['accounts','activity'])`, 1500],
  ['act-txn', `go(['accounts','activity','txn'], { sel: { txn: 't1' } })`],
  ['pay-hub', `go(['pay'])`],
  ['pay-scan', `go(['pay','scan'])`],
  ['pay-amount', `go(['pay','pay-amount'], { sel: { payee: 'p1' }, pay: { amount: 0, from: 'main' } })`],
  ['pay-pin', `go(['pay','pay-amount','pay-pin'], { sel: { payee: 'p1' }, pay: { amount: 650, from: 'main' } })`],
  ['pay-done', `go(['pay','pay-done'], { sel: { payee: 'p1' }, pay: { amount: 650, from: 'main' } })`, 1600],
  ['pay-rent', `go(['pay','autopays','autopay'], { sel: { autopay: 'a1' } })`],
  // insights, goals, profile
  ['ins-insights', `go(['insights'])`, 1800],
  ['ins-goals', `go(['home','goals'])`, 900],
  ['pro-profile', `go(['home','profile'])`],
  ['pro-inbox', `go(['home','inbox'])`],
  ['pro-cards', `go(['profile','card-settings'])`],
  ['pro-security', `go(['profile','security'])`],
  // business and partners
  ['biz-home', `lens('business'); await wait(200); set({ bizRole: 'bookkeeper', bizRequest: null })`],
  ['biz-approve', `lens('business'); await wait(200); go(['biz-home','biz-approval'], { bizRole: 'owner', bizOption: 'reserve', bizRequest: { status: 'pending', by: 'bookkeeper' } })`],
  ['dev-compare', `lens('developer'); await wait(200); go(['home','compare'], { option: 'partner' })`],
  // brand and appearance
  ['theme-deccan', `set({ institution: 'riverbend' }); go(['home'])`],
  ['theme-deccan-acc', `set({ institution: 'riverbend' }); go(['accounts'])`, 1500],
  ['theme-light', `set({ appearance: 'light' }); go(['home'])`],
  ['theme-light-ins', `set({ appearance: 'light' }); go(['insights'])`, 1800],
  // iPhone Duo: closed (outer display) and open (inner display, flat and folded like a book)
  ['duo-outer-home', `set({ device: 'duo-outer' }); go(['home'])`],
  ['duo-outer-compare', `set({ device: 'duo-outer' }); go(['home','compare'], { option: 'savings' })`],
  ['duo-outer-accounts', `set({ device: 'duo-outer' }); go(['accounts'])`, 1500],
  ['duo-inner-home', `set({ device: 'duo-inner' }); go(['home'], { option: 'savings' })`],
  ['duo-inner-confirm', `set({ device: 'duo-inner' }); go(['home','confirm'], { option: 'savings', amount: 1500 })`],
  ['duo-inner-accounts', `set({ device: 'duo-inner' }); go(['accounts','account'], { sel: { ...st().s.sel, account: 'main' } })`, 1500],
  ['duo-inner-activity', `set({ device: 'duo-inner' }); go(['activity','txn'])`, 1500],
  ['duo-book-home', `set({ device: 'duo-inner', pose: 'book' }); go(['home'], { option: 'savings' })`],
  // iPad Air 11-inch, landscape: split views
  ['ipad-home', `set({ device: 'ipad' }); go(['home'], { option: 'savings' })`],
  ['ipad-accounts', `set({ device: 'ipad' }); go(['accounts','account'])`],
  ['ipad-bank', `set({ device: 'ipad' }); go(['home','bank'])`],
  // rent day as a Live Activity: Lock Screen, Dynamic Island compact and expanded
  ['live-lock', `go(['lock'])`],
  ['live-lock-paid', `go(['lock'], { livePhase: 'paid', liveAmounts: true })`],
  ['live-island', `go(['away'])`],
  ['live-expanded', `go(['away'], { liveOpen: true })`, 1400],
  ['live-expanded-ok', `go(['away'], { liveOpen: true, livePhase: 'queued' })`, 1400],
  // Apple Watch 46mm
  ...['face', 'aod', 'stack', 'live', 'alert', 'confirm', 'done'].map((w) => [`watch-${w}`, `set({ device: 'watch', watch: '${w}' })`]),
];

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const exe = BROWSERS.find((b) => fs.existsSync(b));
  if (!exe) throw new Error('No Edge or Chrome found');
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cashflow-cap-'));
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
    const r = await send('Runtime.evaluate', { expression: `(async () => { ${HELPERS}; ${expr} })()`, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  };
  await send('Page.enable');
  await send('Runtime.enable');

  // Wide enough that the phone renders at its real size beside the controls; reduced motion so frames are settled.
  await send('Emulation.setDeviceMetricsOverride', { width: 1500, height: 1000, deviceScaleFactor: 2, mobile: false });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });

  async function fresh() {
    await send('Page.navigate', { url: 'about:blank' });
    await sleep(200);
    await send('Page.navigate', { url: `${APP}?r=${Date.now()}` });
    await sleep(1400);
    await js(`await document.fonts.ready; for (let i = 0; i < 40 && !window.__store; i++) await wait(100);
      const s = document.createElement('style'); s.textContent = 'html, body, #root, .app, .stage { background: transparent !important; } .rail { visibility: hidden; }'; document.head.appendChild(s);`);
  }

  async function crop(name, sel = '.phone', pad = 14) {
    const r = await js(`const el = document.querySelector(${JSON.stringify(sel)}); if (!el) return null; const b = el.getBoundingClientRect(); return { x: b.left + scrollX, y: b.top + scrollY, w: b.width, h: b.height };`);
    if (!r) return console.log('  MISSING', name);
    const clip = { x: Math.max(0, r.x - pad), y: Math.max(0, r.y - pad), width: r.w + pad * 2, height: r.h + pad * 2, scale: 1 };
    const { data } = await send('Page.captureScreenshot', { format: 'webp', quality: 92, clip, captureBeyondViewport: true });
    fs.writeFileSync(path.join(OUT, `${name}.webp`), Buffer.from(data, 'base64'));
    console.log('  saved', name);
  }

  for (const [name, setup, settle = 1000] of SCENES) {
    if (ONLY && !name.startsWith(ONLY)) continue;
    await fresh();
    await js(`${setup}; await wait(${settle});`);
    await crop(name);
  }

  // The real alert card, cropped from the app home, for the case study's before/after.
  if (!ONLY || ONLY.startsWith('alert')) {
    await fresh();
    await js("go(['home']); await wait(1000);");
    await crop('alert-card', '.ah-alert', 0);
  }

  // The developer lens: the partner sandbox beside the phone.
  if (!ONLY || ONLY.startsWith('dev')) {
    await fresh();
    await js(`lens('developer'); await wait(900);`);
    await crop('dev-sandbox', '.sandbox', 0);
  }
  // Both banks side by side.
  if (!ONLY || ONLY.startsWith('theme')) {
    await fresh();
    await js(`set({ stage: 'brands' }); await wait(1200);`);
    await crop('theme-brands', '.brands', 24);
  }

  // Product shots: the screen at native scale, composited under Apple's own bezel PNGs
  // (Apple Design Resources, unpacked into 'Actual Portfolio/Apple design resources/*/png').
  if (!ONLY || ONLY.startsWith('bz')) {
    const RES = path.join(__dirname, '..', '..', '..', 'Apple design resources');
    const IPHONE = ['iPhone 18 bezels/png/iPhone 18 Pro - Black - Portrait.png', [72, 69, 1206, 2622], 3, 0.5, 170];
    const IPAD = ['iPad Air M4 bezels/png/iPad Air 11_ (M4) - Space Gray - Landscape.png', [130, 130, 2360, 1640], 2, 0.46, 40];
    const WATCH = ['Apple Watch Series 11 bezels/png/Apple Watch S11 - 46mm - Aluminum Jet Black + Sport Band Black.png', [72, 192, 416, 496], 2, 0.75, 76];
    const BZ = [
      // name, setup, bezel file, screen rect inside the bezel [x, y, w, h], device scale, output scale
      ['bz-iphone', "go(['home'])", ...IPHONE],
      ['bz-iphone-bank', "go(['home','bank'])", ...IPHONE],
      ['bz-duo-outer', "set({ device: 'duo-outer' }); go(['home'])", 'iPhone Duo bezels/png/iPhone Duo - Night Sky - Outer Closed Portrait.png', [88, 80, 1398, 2034], 3, 0.42, 90],
      ['bz-duo-inner', "set({ device: 'duo-inner' }); go(['home'], { option: 'savings' })", 'iPhone Duo bezels/png/iPhone Duo - Night Sky - Inner Open Landscape.png', [120, 120, 2853, 2007], 3, 0.36, 110],
      ['bz-ipad', "set({ device: 'ipad' }); go(['home'], { option: 'savings' })", ...IPAD],
      ['bz-ipad-accounts', "set({ device: 'ipad' }); go(['accounts','account'])", ...IPAD],
      ...['face', 'aod', 'stack', 'alert', 'confirm', 'done'].map((w) => ['bz-watch-' + w, "set({ device: 'watch', watch: '" + w + "' })", ...WATCH]),
    ];
    for (const [name, setup, bezel, [sx, sy, sw, sh], dsf, outScale, rad] of BZ) {
      if (ONLY && ONLY !== 'bz' && !name.startsWith(ONLY)) continue;
      const bezelPath = path.join(RES, bezel);
      if (!fs.existsSync(bezelPath)) {
        console.log('  NO BEZEL', bezel);
        continue;
      }
      await send('Emulation.setDeviceMetricsOverride', { width: 1500, height: 1000, deviceScaleFactor: dsf, mobile: false });
      await fresh();
      await js(
        setup +
          "; await wait(1000); const bzStyle = document.createElement('style'); bzStyle.textContent = '.phone { box-shadow: none !important; border-radius: 0 !important; } .phone .island, .phone .home-indicator { visibility: hidden; }'; document.head.appendChild(bzStyle); await wait(200);",
      );
      const r = await js("const b = document.querySelector('.phone').getBoundingClientRect(); return { x: b.left + scrollX, y: b.top + scrollY, w: b.width, h: b.height };");
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
    await send('Emulation.setDeviceMetricsOverride', { width: 1500, height: 1000, deviceScaleFactor: 2, mobile: false });
  }

  if (ONLY === 'cover') {
    await send('Emulation.setDeviceMetricsOverride', { width: 1600, height: 1000, deviceScaleFactor: 1, mobile: false });
    await send('Emulation.setDefaultBackgroundColorOverride', {});
    await send('Page.navigate', { url: `${PORTFOLIO}tools/cashflow/cover.html?r=${Date.now()}` });
    await sleep(1600);
    await js('await document.fonts.ready; await wait(400);');
    const { data } = await send('Page.captureScreenshot', { format: 'webp', quality: 88 });
    fs.writeFileSync(path.join(OUT, 'card.webp'), Buffer.from(data, 'base64'));
    console.log('  saved card.webp');
  }

  ws.close();
  proc.kill();
  console.log('done ->', OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
