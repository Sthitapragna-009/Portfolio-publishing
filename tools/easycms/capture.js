/* Captures the Easy CMS prototype screens used on projects/easy-cms.html.
   Drives headless Edge (or Chrome) over the DevTools protocol; no dependencies.

   1. Start the prototype:  (in "Actual Portfolio/CMS builder")  npm run dev   -> http://localhost:5200
   2. Run:                  node tools/easycms/capture.js            (all scenes)
                            node tools/easycms/capture.js admin      (only scenes whose group matches)
   Output: assets/easycms/*.webp  */

const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const APP = process.env.EASYCMS_URL || 'http://localhost:5200/';
const OUT = path.join(__dirname, '..', '..', 'assets', 'easycms');
const ONLY = process.argv[2];
const PORT = 9333;
const BROWSERS = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* Injected into every evaluation */
const HELPERS = `
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const click = (text) => {
    const el = [...document.querySelectorAll('button, a, [role=menuitem]')].find((b) => b.textContent.trim() === text);
    if (el) el.click();
    return !!el;
  };
  const setVal = (el, v) => {
    if (typeof el === 'string') el = document.querySelector(el);
    const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  };
`;

const EMPTY_DATA = JSON.stringify({ sites: [], activeSite: null, items: [], people: [] });

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const exe = BROWSERS.find((b) => fs.existsSync(b));
  if (!exe) throw new Error('No Edge or Chrome found');
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'easycms-cap-'));
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

  async function viewport({ w, h, dpr, mobile = false, dark = false }) {
    await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: dpr, mobile });
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: dark ? 'dark' : 'light' }, { name: 'prefers-reduced-motion', value: 'reduce' }] });
  }

  /** Fresh demo state with the given prefs, then open a route.
      Storage is written from a non-app page on the same origin, so a still-running app
      can never write its old prefs back over the new ones. */
  async function open(route, prefs = {}, { empty = false } = {}) {
    await send('Page.navigate', { url: `${APP}@vite/client` });
    await sleep(400);
    const p = JSON.stringify(Object.assign({ lang: 'en', theme: 'system', contrast: 'normal', textsize: 1, motion: 'reduce', helper: true, role: 'editor' }, prefs));
    await js(`localStorage.clear(); localStorage.setItem('easycms:prefs:v1', ${JSON.stringify(p)}); ${empty ? `localStorage.setItem('easycms:data:v2', ${JSON.stringify(EMPTY_DATA)});` : ''}`);
    // A new query string forces a full load, so the app starts with these prefs and this route.
    await send('Page.navigate', { url: `${APP}?r=${Date.now()}#/${route}` });
    await sleep(1300);
    await js('await document.fonts.ready; await wait(300);');
  }

  async function shot(name, { full = false } = {}) {
    await js('await wait(250);');
    const params = { format: 'webp', quality: 90, captureBeyondViewport: full };
    if (full) {
      const { w, h } = await js('return { w: document.documentElement.clientWidth, h: document.documentElement.scrollHeight };');
      params.clip = { x: 0, y: 0, width: w, height: h, scale: 1 };
    }
    const { data } = await send('Page.captureScreenshot', params);
    fs.writeFileSync(path.join(OUT, `${name}.webp`), Buffer.from(data, 'base64'));
    console.log('  saved', name);
  }

  const desktop = { w: 1440, h: 900, dpr: 2 };
  const phone = { w: 390, h: 844, dpr: 3, mobile: true };
  const run = (group) => !ONLY || ONLY === group;

  await viewport(desktop);

  if (run('admin')) {
    console.log('admin: first run, wizard, websites');
    await open('sites', { role: 'admin' }, { empty: true });
    await shot('d-admin-empty');
    await js(`click('Create a new website'); await wait(800);
      setVal('#w-name', 'Centre for Transportation Systems'); await wait(100);
      setVal('#w-short', 'CTRANS'); await wait(100);
      setVal('#w-namehi', 'परिवहन प्रणाली केंद्र'); await wait(300);`);
    await shot('d-wiz-1');
    await js(`setVal('#w-slug', 'Centre for Transportation Systems '); await wait(400);`);
    await shot('d-wiz-1-address');
    await js(`click('Next'); await wait(700); [...document.querySelectorAll('.sec-tile')][4].click(); await wait(300);`);
    await shot('d-wiz-2');
    await js(`click('Next'); await wait(700);
      setVal('#w-editor-n', 'Meena Joshi'); setVal('#w-editor-e', 'office.ctrans@example.edu');
      setVal('#w-reviewer-n', 'Prof. S. Iyer'); setVal('#w-reviewer-e', 'coordinator.ctrans@example.edu'); await wait(300);`);
    await shot('d-wiz-3');
    await js(`click('Next'); await wait(1200);`);
    await shot('d-wiz-4');
    await js(`click('Create website'); await wait(1200);`);
    await shot('d-admin-sites');
    await open('sites', { role: 'admin' });
    await shot('d-admin-sites-amrut');
    await open('home', {}, { empty: true });
    await shot('d-nosite');
    await open('people', { role: 'admin' });
    await shot('d-people');
  }

  if (run('editor')) {
    console.log('editor flow');
    await open('home');
    await shot('d-home');
    await open('new/notice');
    await js(`click('Paste a message'); await wait(500); click('Use an example message'); await wait(300);`);
    await shot('d-editor-paste');
    await js(`click('Fill the form'); await wait(1200); document.querySelector('[data-help="title"]').scrollIntoView({ block: 'center' }); window.scrollBy(0, 120); await wait(400);`);
    await shot('d-editor-filled');
    await js(`click('Check before sending'); await wait(900); document.querySelector('[data-help="check-results"]').scrollIntoView({ block: 'start' }); window.scrollBy(0, -110); await wait(400);`);
    await shot('d-editor-check');
    await js(`for (let i = 0; i < 6; i++) { if (!click('Looks right')) break; await wait(150); }
      click('Use a sample file'); await wait(250); click('Make Hindi version'); await wait(500);
      document.querySelector('[data-help="titleHi"]').scrollIntoView({ block: 'center' }); await wait(400);`);
    await shot('d-editor-hindi');
    await js(`click('Send to the Coordinator for checking'); await wait(700);`);
    await shot('d-editor-send-dialog');
    await js(`click('Send anyway'); await wait(1200);`);
    await shot('d-updates-review');
    await open('edit/n-fellows');
    await shot('d-returned');
    await js(`click('Go to the part to fix'); await wait(1400);`);
    await shot('d-returned-field');
    await open('edit/e-viksit');
    await js(`document.querySelector('.help-btn').click(); await wait(600);
      const input = document.getElementById('help-q'); setVal(input, 'how do I add a poster?'); input.form.requestSubmit(); await wait(400);
      document.querySelector('.help-answer button')?.click(); await wait(1400);`);
    await shot('d-help');
    await open('website');
    await shot('d-website');
    await open('settings');
    await shot('d-settings');
    await open('home', { lang: 'hi' });
    await shot('d-home-hi');
  }

  if (run('review')) {
    console.log('review flow: edit a live item, send, reviewer sees the change');
    await open('edit/n-associate');
    await js(`const exp = document.getElementById('f-expiry'); setVal(exp, exp.value.replace(/-(\\d\\d)$/, (m, d) => '-' + String(Math.min(28, +d + 7)).padStart(2, '0')));
      setVal('#f-body', 'One position on the GIS-based master plan project. The last date has been extended by a week. Eligibility, pay and how to apply are in the attached advertisement.');
      await wait(1200); click('Send to the Coordinator for checking'); await wait(600); click('Send anyway'); await wait(1000);
      localStorage.setItem('easycms:prefs:v1', JSON.stringify(Object.assign(JSON.parse(localStorage.getItem('easycms:prefs:v1')), { role: 'reviewer' })));`);
    await send('Page.navigate', { url: `${APP}?r=${Date.now()}#/review` });
    await sleep(1400);
    await shot('d-review-queue');
    await js(`location.hash = '#/review/n-associate'; await wait(1300);`);
    await shot('d-review-detail');
    await js(`click('Send back with a note'); await wait(500); click('Please attach the signed PDF.'); await wait(300);`);
    await shot('d-review-sendback');
    await js(`click('Cancel'); await wait(300); click('Approve and publish'); await wait(900); location.hash = '#/site/notices'; await wait(1300);`);
    await shot('d-site-notices');
    await open('site');
    await js(`document.querySelector('.back-to-cms')?.remove();`);
    await shot('d-site-home', { full: true });
  }

  if (run('dark')) {
    await viewport({ ...desktop, dark: true });
    await open('home', { theme: 'dark' });
    await shot('d-home-dark');
    await open('edit/n-fellows', { theme: 'dark' });
    await shot('d-editor-dark');
    await open('sites', { theme: 'dark', role: 'admin' }, { empty: true });
    await shot('d-admin-empty-dark');
    await viewport(desktop);
  }

  if (run('phone')) {
    console.log('phone');
    await viewport(phone);
    await open('home');
    await shot('p-home');
    await open('home', { lang: 'hi' });
    await shot('p-home-hi');
    await open('new/notice');
    await js(`click('Paste a message'); await wait(400); click('Use an example message'); await wait(200); click('Fill the form'); await wait(1200); document.querySelector('[data-help="title"]').scrollIntoView({ block: 'start' }); window.scrollBy(0, -80); await wait(300);`);
    await shot('p-editor');
    await js(`document.querySelectorAll('.pane-switch .seg-btn')[1].click(); await wait(900); window.scrollTo(0, 0); await wait(300);`);
    await shot('p-editor-preview');
    await open('review/n-roundtable', { role: 'reviewer' });
    await shot('p-review');
    await js(`window.scrollTo(0, document.querySelector('.review-preview').offsetTop - 70); await wait(500);`);
    await shot('p-review-preview');
    await open('site/notices');
    await shot('p-site');
    await open('sites', { role: 'admin' }, { empty: true });
    await shot('p-admin-empty');
  }

  if (run('cover')) {
    console.log('cover card');
    await send('Emulation.setDeviceMetricsOverride', { width: 1600, height: 1000, deviceScaleFactor: 1, mobile: false });
    await send('Page.navigate', { url: 'file:///' + path.join(__dirname, 'cover.html').split(path.sep).join('/') });
    await sleep(1500);
    await js('await document.fonts.ready; await wait(400);');
    const { data } = await send('Page.captureScreenshot', { format: 'jpeg', quality: 88 });
    fs.writeFileSync(path.join(OUT, 'card.jpg'), Buffer.from(data, 'base64'));
    console.log('  saved card.jpg');
  }

  ws.close();
  proc.kill();
  console.log('done ->', OUT);
}

main().catch((e) => { console.error(e); process.exit(1); });
