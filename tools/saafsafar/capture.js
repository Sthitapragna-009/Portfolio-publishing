/* Captures the Saaf Safar prototype for projects/saaf-safar.html.
   Drives headless Edge (or Chrome) over the DevTools protocol; no dependencies.

   1. Start the prototype:  (in "Actual Portfolio/Airport Sanitation  dashboard")  npm run dev  -> http://localhost:5210
      It must be the dev server: scenes are set up through window.__store, which only exists in dev.
   2. Optional, for the notebook group:  (in that folder) cd notebook && npm run dev  -> http://127.0.0.1:5211
   3. Run:  node tools/saafsafar/capture.js          (all groups)
            node tools/saafsafar/capture.js cart     (one group: cart, channels, zone, terminal, ops, door, kit, shell, mock, notebook, cover)
   Output: assets/saafsafar/*.webp (devices keep their rounded corners on a transparent background). */

const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const APP = process.env.SAAFSAFAR_URL || 'http://localhost:5210/';
const NOTEBOOK = process.env.NOTEBOOK_URL || 'http://127.0.0.1:5211/';
const PORTFOLIO = process.env.PORTFOLIO_URL || 'http://localhost:5190/';
const OUT = path.join(__dirname, '..', '..', 'assets', 'saafsafar');
const ONLY = process.argv[2];
const PORT = 9334;
const BROWSERS = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
];
// Kit blocks whose words follow the airport's language order.
const KIT_HI = ['urgency', 'offer', 'jobs', 'cleaning', 'stock', 'signin', 'notif', 'watch'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* Injected into every evaluation. `S` is the app's store; `day` is today's midnight in sim minutes. */
const HELPERS = `
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const S = window.__store;
  const day = S ? S.sim.t - (S.sim.t % 1440) : 0;
  const click = (text) => {
    const el = [...document.querySelectorAll('button, a')].find((b) => b.textContent.trim().includes(text) || b.getAttribute('aria-label') === text);
    if (el) el.click();
    return !!el;
  };
  const stepUntil = (pred, max = 30, dt = 0.1) => { for (let i = 0; i < max / dt && !pred(); i++) S.sim.step(dt); S.emit(); };
  const at = (h, m = 0) => { if (S.playing) S.toggle(); S.seek(day + h * 60 + m); };
`;

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const exe = BROWSERS.find((b) => fs.existsSync(b));
  if (!exe) throw new Error('No Edge or Chrome found');
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'saafsafar-cap-'));
  const proc = spawn(exe, [
    '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
    '--hide-scrollbars', '--no-first-run', '--no-default-browser-check', '--force-color-profile=srgb', 'about:blank',
  ], { stdio: 'ignore' });

  let targets = [];
  for (let i = 0; i < 50; i++) {
    try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json(); if (targets.length) break; } catch { /* starting */ }
    await sleep(200);
  }
  const page = targets.find((t) => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r, { once: true }));
  let id = 0;
  const pending = new Map();
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  });
  const send = (method, params = {}) => new Promise((res, rej) => {
    const i = ++id;
    pending.set(i, (m) => (m.error ? rej(new Error(`${method}: ${m.error.message}`)) : res(m.result)));
    ws.send(JSON.stringify({ id: i, method, params }));
  });
  const js = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: `(async () => { ${HELPERS}; ${expr} })()`, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) {
      const { data } = await send('Page.captureScreenshot', { format: 'webp', quality: 70 });
      fs.writeFileSync(path.join(OUT, '_debug.webp'), Buffer.from(data, 'base64'));
      throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    }
    return r.result.value;
  };
  await send('Page.enable');
  await send('Runtime.enable');

  async function viewport({ w, h, dpr = 2, transparent = false }) {
    await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: dpr, mobile: false });
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await send('Emulation.setDefaultBackgroundColorOverride', transparent ? { color: { r: 0, g: 0, b: 0, a: 0 } } : {});
  }

  /** A fresh app on a route. Devices are shot on a transparent stage so their rounded frames stay clean. */
  async function open(route, { transparent = true, url = APP } = {}) {
    await send('Page.navigate', { url: 'about:blank' });
    await sleep(250);
    await send('Page.navigate', { url: `${url}?r=${Date.now()}#/${route}` });
    await sleep(1500);
    await js('await document.fonts.ready; await wait(300);');
    if (transparent) {
      await js(`const st = document.createElement('style'); st.textContent = 'html, body, #root, .app, .stage, .stage-fit { background: transparent !important; }'; document.head.appendChild(st);`);
    }
  }

  async function save(name, data) {
    fs.writeFileSync(path.join(OUT, `${name}.webp`), Buffer.from(data, 'base64'));
    console.log('  saved', name);
  }

  /** One element, tight. */
  async function crop(name, sel, { pad = 0, nth = 0, maxH = 0 } = {}) {
    await js('await wait(350);');
    const r = await js(`const el = document.querySelectorAll(${JSON.stringify(sel)})[${nth}]; if (!el) return null;
      el.scrollIntoView({ block: 'center' }); await wait(300); const b = el.getBoundingClientRect();
      return { x: b.left + scrollX, y: b.top + scrollY, w: b.width, h: b.height };`);
    if (!r) { console.log('  MISSING', name, sel); return; }
    const h = maxH ? Math.min(maxH, r.h) : r.h;
    const clip = { x: Math.max(0, r.x - pad), y: Math.max(0, r.y - pad), width: r.w + pad * 2, height: h + pad * 2, scale: 1 };
    const { data } = await send('Page.captureScreenshot', { format: 'webp', quality: 92, clip, captureBeyondViewport: true });
    await save(name, data);
  }

  async function shot(name) {
    await js('await wait(300);');
    const { data } = await send('Page.captureScreenshot', { format: 'webp', quality: 90 });
    await save(name, data);
  }

  // Big enough that every device renders at its real size (the stage never scales up).
  const stage = { w: 1900, h: 1280, dpr: 2, transparent: true };
  const run = (group) => !ONLY || ONLY === group;
  await viewport(stage);

  // Worker-facing screens are presented English first; the Hindi-first copies (-hi) sit beside them as previews.
  const LANGS = [['en', ''], ['hi', '-hi']];

  if (run('cart')) for (const [lang, sfx] of LANGS) {
    console.log('cart iPad', lang);
    await open('attendant');
    await js(`at(16, 18); S.setLang('${lang}'); S.setRole("attendant"); S.emit();`);
    await crop('c-signin' + sfx, '.ipad');
    await js(`S.sim.signIn('B3', S.sim.personOf('B3').id);
      stepUntil(() => S.sim.cart('B3').state === 'idle' && !S.sim.cart('B3').offerId, 20, 0.25);
      S.sim.cart('B3').stock.tissue = 2;
      S.trigger(); stepUntil(() => !!S.sim.cart('B3').offerId, 10); S.sim.step(0.3); S.emit();`);
    await crop('c-offer' + sfx, '.ipad');
    await js(`const c = S.sim.cart('B3'); S.sim.respond(c.offerId, 'B3', 'accept'); S.sim.step(0.6); S.emit();`);
    await crop('c-going' + sfx, '.ipad');
    await js(`stepUntil(() => S.sim.cart('B3').state === 'cleaning', 20); S.sim.step(2.2); S.emit();`);
    await crop('c-cleaning' + sfx, '.ipad');
    await js(`stepUntil(() => S.sim.cart('B3').state === 'idle', 20); S.sim.step(0.2); S.emit();`);
    await crop('c-done' + sfx, '.ipad');
    await js(`S.sim.step(1.5); S.emit(); click('Language'); await wait(400);`);
    await crop('c-lang' + sfx, '.ipad');
  }

  if (run('channels')) for (const [lang, sfx] of LANGS) {
    console.log('phone and watch', lang);
    await open('channels');
    await js(`at(16, 18); S.setLang('${lang}'); S.setRole('channels');
      stepUntil(() => S.sim.cart('B3').state === 'idle' && !S.sim.cart('B3').offerId, 20, 0.25);
      S.trigger(); stepUntil(() => !!S.sim.cart('B3').offerId, 10); S.sim.step(0.35); S.emit();`);
    await crop('ch-lock' + sfx, '.phone', { nth: 0 });
    await crop('ch-watch' + sfx, '.watch');
    if (sfx) continue;
    await crop('ch-settings', '.phone', { nth: 1 });
    await crop('ch-haptics', '.haptics');
    await crop('ch-stage', '.ch-stage');
  }

  if (run('zone')) {
    console.log('zone supervisor');
    await open('supervisor');
    await js(`at(16, 18); S.setRole('supervisor'); S.trigger(); for (let i = 0; i < 53; i++) S.sim.step(0.1); S.emit();`);
    await crop('z-radio', '.ipad');
    await js(`click('Called'); S.sim.step(1.5); S.emit(); await wait(300);`);
    await crop('z-called', '.ipad');
    // W-17L's flush breaks at 15:10 and no sensor sees it: step until the ratings raise a check in person.
    const found = await js(`at(15, 10); S.setRole('supervisor'); const u = S.sim.unit('W17L');
      for (let i = 0; i < 300; i++) { S.sim.step(1); if (u.checkAt !== null && !S.sim.openTaskFor('W17L')) break; }
      S.emit(); await wait(400); click('View'); await wait(300); return u.checkAt !== null && !S.sim.openTaskFor('W17L');`);
    if (!found) console.log('  WARNING: W-17L never reached the check state');
    await crop('z-check', '.ipad');
  }

  if (run('terminal')) {
    console.log('shift manager');
    await open('manager');
    await js(`at(21, 38); S.setRole('manager'); S.emit();`);
    await crop('t-terminal', '.browser');
    await js(`at(22, 6); S.setRole('manager'); S.emit();`);
    await crop('t-handover', '.ho-card');
  }

  if (run('ops')) {
    console.log('ops centre and data story');
    await open('ops');
    await js(`at(17, 32); S.setRole('ops'); S.emit(); await wait(2500);`); // the history takes a moment to build
    await crop('o-story', '.browser');
    for (let i = 0; i < 5; i++) await crop(`o-story-${i + 1}`, '.st-sec', { nth: i });
    await crop('o-story-tiles', '.st-hero');
    await js(`click('Live washroom layer'); await wait(500);`);
    await crop('o-live', '.browser');
  }

  if (run('door')) {
    console.log('door display');
    await open('passenger');
    await js(`at(17, 34); S.setRole('passenger'); S.emit();`);
    await crop('d-door', '.door');
    await js(`click('Not clean'); await wait(300);`);
    await crop('d-thanks', '.door');
    await js(`at(17, 34); S.setRole('passenger'); const t = S.trigger();
      stepUntil(() => t.state === 'cleaning', 25); S.sim.step(0.5); S.emit(); await wait(200);
      const u = S.sim.unit(t.unitId); click(u.code); await wait(300);`);
    await crop('d-cleaning', '.door');
  }

  if (run('kit')) {
    console.log('kit: components');
    await viewport({ w: 1900, h: 1280, dpr: 2 });
    // #/kit/en is English first; the blocks whose words change are shot again Hindi first (-hi)
    await open('kit/en', { transparent: false });
    const keys = await js(`return [...document.querySelectorAll('[data-kit]')].map((s) => s.dataset.kit);`);
    // the component itself, not the sheet's padding around it
    for (const k of keys) await crop(`k-${k}`, `[data-kit="${k}"] > *`);
    await open('kit', { transparent: false });
    for (const k of KIT_HI) await crop(`k-${k}-hi`, `[data-kit="${k}"] > *`);
    await viewport(stage);
  }

  if (run('shell')) {
    console.log('the whole prototype');
    await viewport({ w: 1600, h: 1000, dpr: 2 });
    await open('attendant', { transparent: false });
    await js(`at(16, 18); S.setLang('en'); S.setRole('attendant'); S.sim.signIn('B3', S.sim.personOf('B3').id);
      stepUntil(() => S.sim.cart('B3').state === 'idle' && !S.sim.cart('B3').offerId, 20, 0.25);
      S.trigger(); stepUntil(() => !!S.sim.cart('B3').offerId, 10); S.sim.step(0.3); S.emit();`);
    await shot('s-shell');
    await viewport(stage);
  }

  if (run('mock')) {
    // Screens for the mockup photos: 16:9 for the monitors, the phone screen at its own size.
    console.log('mockup screens');
    await viewport({ w: 1600, h: 900, dpr: 2 });
    await open('manager', { transparent: false });
    await js(`at(18, 40); S.setRole('manager'); S.emit(); document.querySelector('.app').style.cssText = '';`);
    await crop('m-terminal', '.browser-view');
    await open('ops', { transparent: false });
    await js(`at(18, 40); S.setRole('ops'); S.emit(); await wait(2500);`);
    await crop('m-story', '.browser-view');
    await viewport(stage);
    await open('channels', { transparent: false });
    await js(`at(16, 18); S.setLang('en'); S.setRole('channels');
      stepUntil(() => S.sim.cart('B3').state === 'idle' && !S.sim.cart('B3').offerId, 20, 0.25);
      S.trigger(); stepUntil(() => !!S.sim.cart('B3').offerId, 10); S.sim.step(0.35); S.emit();`);
    await crop('m-phone', '.phone-screen', { nth: 0 });

    for (const [m, w, h] of [['angled', 736, 981], ['desk', 1200, 900], ['phone', 800, 800]]) {
      await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 2, mobile: false });
      await send('Page.navigate', { url: `${PORTFOLIO}tools/saafsafar/mockups/compose.html?m=${m}&r=${Date.now()}` });
      for (let i = 0; i < 40; i++) { await sleep(250); if (await js('return document.body.dataset.ready === "1";')) break; }
      await sleep(400);
      const { data } = await send('Page.captureScreenshot', { format: 'jpeg', quality: 88 });
      fs.writeFileSync(path.join(OUT, `mock-${m}.jpg`), Buffer.from(data, 'base64'));
      console.log('  saved', `mock-${m}.jpg`);
    }
    await viewport(stage);
  }

  if (run('notebook')) {
    console.log('Observable notebook');
    await viewport({ w: 1280, h: 900, dpr: 2 });
    await send('Page.navigate', { url: `${NOTEBOOK}thresholds` });
    await sleep(9000); // data loaders run the simulation on first request
    await js('await document.fonts.ready; await wait(800);');
    await js(`document.querySelector('#observablehq-toc')?.remove(); document.querySelector('#observablehq-sidebar-toggle')?.remove(); await wait(300);`);
    await crop('n-thresholds', '#observablehq-main', { maxH: 980 });
    await viewport(stage);
  }

  if (run('cover')) {
    console.log('cover card');
    await send('Emulation.setDeviceMetricsOverride', { width: 1600, height: 1000, deviceScaleFactor: 1, mobile: false });
    await send('Emulation.setDefaultBackgroundColorOverride', {});
    await send('Page.navigate', { url: `${PORTFOLIO}tools/saafsafar/cover.html?r=${Date.now()}` });
    await sleep(1500);
    await js('await document.fonts.ready; await wait(400);');
    const { data } = await send('Page.captureScreenshot', { format: 'jpeg', quality: 88 });
    fs.writeFileSync(path.join(OUT, 'card.jpg'), Buffer.from(data, 'base64'));
    console.log('  saved card.jpg');
    await send('Emulation.setDeviceMetricsOverride', { width: 1600, height: 1600, deviceScaleFactor: 1, mobile: false });
    await send('Page.navigate', { url: `${PORTFOLIO}tools/saafsafar/mockups/appicon.html?r=${Date.now()}` });
    await sleep(1200);
    const icon = await send('Page.captureScreenshot', { format: 'jpeg', quality: 88 });
    fs.writeFileSync(path.join(OUT, 'mock-appicon.jpg'), Buffer.from(icon.data, 'base64'));
    console.log('  saved mock-appicon.jpg');
  }

  ws.close();
  proc.kill();
  console.log('done ->', OUT);
}

main().catch((e) => { console.error(e); process.exit(1); });
