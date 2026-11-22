/* Records the Bills and autopays folder fan as a short looping clip for the case study.
   Drives the real prototype with a pointer: a slow swipe through the folders (the open folder's rows
   swap as each one comes forward), a flick back to Rent, then a tap that closes and reopens it so the
   papers rise and the rows pop out. Frames come from the DevTools screencast with their own timestamps,
   so the clip keeps real timing.

   1. Start the prototype: (in "Actual Portfolio/fintech app") npm run dev -> http://localhost:5181
   2. Run: node tools/cashflow/record-fan.js
   Output: assets/cashflow/bills-fan.mp4, bills-fan.webm, bills-fan-poster.webp */

const { spawn, execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const APP = process.env.CASHFLOW_URL || 'http://localhost:5181/';
const OUT = path.join(__dirname, '..', '..', 'assets', 'cashflow');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'fan-'));
const PORT = 9420 + Math.floor(Math.random() * 40);
const exe = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe'].find((b) => fs.existsSync(b));
const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const DPR = 2; // headless screencasts come out in layout px unless the browser itself is forced to 2x

(async () => {
  const proc = spawn(exe, ['--headless=new', `--force-device-scale-factor=${DPR}`, `--remote-debugging-port=${PORT}`, `--user-data-dir=${TMP}`, '--hide-scrollbars', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  let t = [];
  for (let i = 0; i < 60 && !t.length; i++) {
    try { t = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json(); } catch {}
    await sleep(200);
  }
  const ws = new WebSocket(t.find((x) => x.type === 'page').webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r, { once: true }));
  let id = 0;
  const pending = new Map();
  const frames = [];
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    if (m.method === 'Page.screencastFrame') {
      frames.push({ t: m.params.metadata.timestamp, data: m.params.data });
      ws.send(JSON.stringify({ id: ++id, method: 'Page.screencastFrameAck', params: { sessionId: m.params.sessionId } }));
    }
  });
  const send = (method, params = {}) => new Promise((res, rej) => {
    const i = ++id;
    pending.set(i, (m) => (m.error ? rej(new Error(`${method}: ${m.error.message}`)) : res(m.result)));
    ws.send(JSON.stringify({ id: i, method, params }));
  });
  const js = async (x) => (await send('Runtime.evaluate', { expression: `(async () => { ${x} })()`, awaitPromise: true, returnByValue: true })).result.value;

  await send('Page.enable');
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  await send('Emulation.setDeviceMetricsOverride', { width: 700, height: 980, deviceScaleFactor: DPR, mobile: false });
  await send('Page.navigate', { url: `${APP}?r=${Date.now()}` });
  await sleep(1500);
  const box = await js(`await document.fonts.ready; for (let i = 0; i < 40 && !window.__store; i++) await new Promise(r => setTimeout(r, 100));
    window.__store.d({ type: 'set', patch: { why: false, history: ['pay', 'bills'], sel: { folder: 'rent' } } });
    await new Promise(r => setTimeout(r, 1200));
    const s = document.createElement('style'); s.textContent = '.rail { visibility: hidden } .phone { box-shadow: none !important }'; document.head.appendChild(s); await new Promise(r => setTimeout(r, 400));
    const p = document.querySelector('.phone').getBoundingClientRect(); const f = document.querySelector('.bills-fan').getBoundingClientRect();
    return { px: p.left, py: p.top, pw: p.width, ph: p.height, fx: f.left, fy: f.top, fw: f.width, fh: f.height };`);

  const y = box.fy + 160;
  const cx = box.fx + box.fw / 2;
  const U = 1; // drag distances are in app px
  const mouse = (type, x, buttons = 1) => send('Input.dispatchMouseEvent', { type, x, y, button: type === 'mouseMoved' && !buttons ? 'none' : 'left', buttons, clickCount: type === 'mouseMoved' ? 0 : 1 });
  /** A drag from x0 to x1 over ms, with an ease so it reads like a thumb. */
  const drag = async (x0, x1, ms, hold = 0) => {
    await mouse('mousePressed', x0);
    const steps = Math.round(ms / 16);
    for (let i = 1; i <= steps; i++) {
      const k = i / steps;
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      await mouse('mouseMoved', x0 + (x1 - x0) * e);
      await sleep(16);
    }
    if (hold) await sleep(hold);
    await mouse('mouseReleased', x1);
  };
  const flick = async (x0, x1) => {
    await mouse('mousePressed', x0);
    for (let i = 1; i <= 6; i++) { await mouse('mouseMoved', x0 + ((x1 - x0) * i) / 6); await sleep(12); }
    await mouse('mouseReleased', x1);
  };
  const tap = async (x) => { await mouse('mousePressed', x); await sleep(70); await mouse('mouseReleased', x); };

  await send('Page.startScreencast', { format: 'jpeg', quality: 92, everyNthFrame: 1 });
  await sleep(900);
  // a slow swipe left through three folders, a beat on each so its rows pop in
  await drag(cx + 60 * U, cx - 20 * U, 420, 60); await sleep(700);
  await drag(cx + 60 * U, cx - 20 * U, 420, 60); await sleep(700);
  await drag(cx + 60 * U, cx - 20 * U, 420, 60); await sleep(900);
  // a flick back: momentum carries it to Rent, with a small settle
  await flick(cx - 80 * U, cx + 150 * U); await sleep(1100);
  // tap Rent: it closes, then opens again so the papers rise and the rows rise in one after another
  await tap(cx); await sleep(700);
  await tap(cx); await sleep(1700);
  await send('Page.stopScreencast');
  await sleep(200);
  ws.close();
  proc.kill();

  // write frames with their real durations, crop to the phone, encode
  const dir = path.join(TMP, 'f');
  fs.mkdirSync(dir);
  const list = [];
  frames.forEach((f, i) => {
    const file = path.join(dir, `${String(i).padStart(4, '0')}.jpg`);
    fs.writeFileSync(file, Buffer.from(f.data, 'base64'));
    const dur = i < frames.length - 1 ? frames[i + 1].t - f.t : 0.5;
    list.push(`file '${file.replace(/\\/g, '/')}'`, `duration ${Math.max(0.001, dur).toFixed(4)}`);
  });
  list.push(`file '${path.join(dir, `${String(frames.length - 1).padStart(4, '0')}.jpg`).replace(/\\/g, '/')}'`);
  fs.writeFileSync(path.join(TMP, 'list.txt'), list.join('\n'));
  // crop the phone in frame px (the whole screen, so the open folder's rows show)
  const crop = `crop=${Math.round(box.pw * DPR)}:${Math.round(box.ph * DPR)}:${Math.round(box.px * DPR)}:${Math.round(box.py * DPR)}`;
  const vf = `${crop},scale=720:-2:flags=lanczos,fps=30`;
  const ff = (args) => execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(TMP, 'list.txt'), ...args], { stdio: 'inherit' });
  ff(['-vf', vf, '-an', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '24', '-preset', 'slow', '-movflags', '+faststart', path.join(OUT, 'bills-fan.mp4')]);
  ff(['-vf', vf, '-an', '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '36', '-row-mt', '1', path.join(OUT, 'bills-fan.webm')]);
  execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-i', path.join(dir, '0000.jpg'), '-vf', crop + ',scale=720:-2:flags=lanczos', '-quality', '88', path.join(OUT, 'bills-fan-poster.webp')], { stdio: 'inherit' });
  const span = frames.length ? frames[frames.length - 1].t - frames[0].t : 0;
  console.log(`frames ${frames.length}, ${span.toFixed(1)} s ->`, ['bills-fan.mp4', 'bills-fan.webm', 'bills-fan-poster.webp'].map((f) => `${f} ${Math.round(fs.statSync(path.join(OUT, f)).size / 1024)} KB`).join(', '));
})().catch((e) => { console.error(e); process.exit(1); });
