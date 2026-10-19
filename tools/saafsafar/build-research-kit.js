// Builds assets/saafsafar/research-kit.html: the printable fieldwork kit linked from the case study.
// Pictogram test cards use the app's own pictograms (pictos.json). Edit this file, not the HTML.
// Hindi is a working draft: have a native speaker check it with one attendant before fieldwork.
const fs = require("fs");
const path = require("path");
const SITE = path.resolve(__dirname, "../..");
const pictos = JSON.parse(fs.readFileSync(__dirname + "/pictos.json", "utf8"));
const e = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const pic = (n, s = 96) => `<svg viewBox="0 0 48 48" width="${s}" height="${s}" aria-hidden="true"><g fill="currentColor">${pictos[n]}</g></svg>`;
const bi = (en, hi) => `<span class="bi"><span class="en">${e(en)}</span><span class="hi">${e(hi)}</span></span>`;
const lines = (n) => `<div class="write">${"<i></i>".repeat(n)}</div>`;

// [pictogram, the meaning we intend, the Hindi we would say, what counts as correct]
const CARDS = [
  ["binFull", "Bin is full, empty it", "कूड़ादान भरा है, खाली करें", "Any answer about emptying or a full bin"],
  ["tissue", "Refill toilet tissue", "टिशू भरें", "Tissue, toilet roll, paper"],
  ["towel", "Refill paper towels", "तौलिया भरें", "Hand towel, paper for hands"],
  ["soap", "Refill soap", "साबुन भरें", "Soap, liquid soap, handwash"],
  ["floor", "Floor is wet, mop it", "फ़र्श गीला है, पोंछें", "Wet floor, slippery, mop"],
  ["odour", "Clean the toilets", "शौचालय साफ़ करें", "Clean toilet, wash the WC"],
  ["liner", "Bin liner (bag)", "कूड़े की थैली", "Bag for the bin"],
  ["chem", "Cleaning liquid", "सफ़ाई का घोल", "Spray, cleaner, phenyl"],
  ["store", "Go to the store first", "पहले स्टोर जाएँ", "Store, stock room, supplies"],
  ["walk", "I'm going", "जा रहा हूँ", "Going, walk there"],
  ["now", "Go now, urgent", "अभी जाएँ, ज़रूरी", "Urgent, quickly, now"],
  ["clock", "Soon, not urgent yet", "जल्दी, अभी ज़रूरी नहीं", "Soon, in a while, time"],
  ["speaker", "Listen: read it aloud", "सुनें", "Sound, listen, speak"],
  ["gents", "Gents washroom", "पुरुष शौचालय", "Men, gents"],
  ["ladies", "Ladies washroom", "महिला शौचालय", "Women, ladies"],
  ["radio", "Supervisor will call on radio", "सुपरवाइज़र रेडियो पर बुलाएँगे", "Walkie-talkie, radio, call"],
];

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Saaf Safar research kit</title>
<link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;600;700;800;900&family=Noto+Sans+Devanagari:wght@500;600;700&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet" />
<style>
  /* Printable fieldwork kit. A4, one section per page when printed. */
  :root { --ink: #101114; --dim: #55606d; --line: #cdd2d8; --paper: #ffffff; --wash: #eef0f2; --sign: #fde934; --now: #e5302a; --act: #2547e8; }
  * { box-sizing: border-box; }
  html { background: #e2e5e9; }
  body { margin: 0; font: 15px/1.5 "Inter Tight", system-ui, sans-serif; color: var(--ink); }
  .hi { font-family: "Noto Sans Devanagari", "Inter Tight", sans-serif; }
  .mono { font-family: "JetBrains Mono", ui-monospace, monospace; }
  .sheet { width: 210mm; min-height: 297mm; margin: 12mm auto; padding: 16mm 16mm 14mm; background: var(--paper); box-shadow: 0 10px 40px -20px rgba(0,0,0,.4); position: relative; }
  .run { position: absolute; left: 16mm; right: 16mm; bottom: 8mm; display: flex; justify-content: space-between; font: 500 10px/1 "JetBrains Mono", monospace; color: var(--dim); }
  h1 { font-size: 40px; font-weight: 900; letter-spacing: -.03em; line-height: 1; margin: 0 0 6px; }
  h2 { font-size: 24px; font-weight: 800; letter-spacing: -.02em; margin: 0 0 4px; }
  h3 { font-size: 15px; font-weight: 700; margin: 18px 0 6px; }
  p { margin: 0 0 10px; }
  .k { font: 500 11px/1.3 "JetBrains Mono", monospace; letter-spacing: .06em; text-transform: uppercase; color: var(--dim); margin: 0 0 8px; }
  .lead { color: var(--dim); max-width: 150mm; }
  .tag { display: inline-flex; align-items: center; gap: 8px; padding: 4px 12px; border-radius: 999px; background: #000; color: var(--sign); font-weight: 700; font-size: 12px; }
  .bi { display: grid; gap: 1px; }
  .bi .hi { font-size: 1.05em; font-weight: 600; }
  .bi .en { color: var(--dim); font-size: .92em; }
  .note { padding: 10px 12px; border-radius: 10px; background: var(--wash); font-size: 13px; color: var(--dim); }
  .toc { list-style: none; margin: 18px 0 0; padding: 0; display: grid; gap: 8px; }
  .toc li { display: grid; grid-template-columns: 34px 1fr auto; gap: 10px; align-items: baseline; padding: 10px 0; border-top: 1px solid var(--line); }
  .toc b { font-size: 16px; }
  .toc span { color: var(--dim); font-size: 13px; }
  ol.q { margin: 0; padding: 0; list-style: none; counter-reset: q; display: grid; gap: 10px; }
  ol.q > li { counter-increment: q; display: grid; grid-template-columns: 26px 1fr; gap: 8px; }
  ol.q > li::before { content: counter(q); font: 600 12px/22px "JetBrains Mono", monospace; text-align: center; width: 22px; height: 22px; border-radius: 50%; background: var(--wash); }
  .probe { grid-column: 2; color: var(--dim); font-size: 12.5px; margin: 2px 0 0; }
  .block { display: grid; grid-template-columns: 22mm 1fr; gap: 10px; padding: 12px 0; border-top: 2px solid var(--ink); }
  .block > .mono { font-size: 12px; color: var(--dim); }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { border: 1px solid var(--line); padding: 6px 7px; vertical-align: top; text-align: left; }
  th { background: var(--wash); font-weight: 700; font-size: 11px; }
  td.blank { height: 13mm; }
  .write { display: grid; gap: 9mm; margin-top: 6px; }
  .write i { display: block; border-bottom: 1px solid var(--line); }
  .cards { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6mm; }
  .card { border: 1.5px solid var(--ink); border-radius: 14px; padding: 10px 12px; display: grid; grid-template-columns: 30mm minmax(0, 1fr); gap: 10px; align-items: center; break-inside: avoid; min-width: 0; }
  .card .sym { display: grid; place-items: center; height: 30mm; border-radius: 10px; background: var(--wash); }
  .card .num { font: 600 11px/1 "JetBrains Mono", monospace; color: var(--dim); }
  .card .rate { display: flex; flex-wrap: wrap; gap: 4px; font-size: 10.5px; color: var(--dim); margin-top: 6px; }
  .card .rate span { border: 1px solid var(--line); border-radius: 6px; padding: 2px 6px; }
  .key { display: grid; grid-template-columns: 22px 1fr 1fr 1fr; gap: 6px 10px; align-items: center; font-size: 12px; }
  .key svg { color: var(--ink); }
  .check { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px 16px; list-style: none; padding: 0; margin: 0; font-size: 13px; }
  .check li::before { content: "☐ "; }
  @media print {
    html { background: none; }
    .sheet { margin: 0; box-shadow: none; page-break-after: always; }
    .noprint { display: none; }
  }
  @media (max-width: 860px) { .sheet { width: auto; min-height: 0; margin: 0 0 12px; padding: 24px 18px 40px; } .cards { grid-template-columns: 1fr; } }
</style>
</head>
<body>

<section class="sheet">
  <p class="k">Saaf Safar · साफ़ सफ़र · fieldwork kit · draft for review</p>
  <h1>Research kit</h1>
  <p class="lead">For shadowing and interviewing housekeeping teams on campus and in one hospital, as a stand-in for airport crews. Everything a participant hears or reads is in Hindi and English. Print on A4; one section per page.</p>
  <span class="tag">Planned, not yet run</span>
  <ol class="toc">
    <li><span class="mono">01</span><b>Consent script</b><span>read aloud, verbal consent</span></li>
    <li><span class="mono">02</span><b>Attendant interview guide</b><span>about 50 minutes</span></li>
    <li><span class="mono">03</span><b>Supervisor interview guide</b><span>about 40 minutes</span></li>
    <li><span class="mono">04</span><b>Shift observation sheet</b><span>one per shift shadowed</span></li>
    <li><span class="mono">05</span><b>Incident timing log</b><span>at least five incidents</span></li>
    <li><span class="mono">06</span><b>Pictogram test cards</b><span>ISO 9186 style, 10+ attendants</span></li>
    <li><span class="mono">07</span><b>Pictogram answer key and scoring</b><span>keep, redraw or drop</span></li>
  </ol>
  <h3>Research questions</h3>
  <ol class="q">
    <li>How do attendants learn that a washroom needs them, and how long does that take?</li>
    <li>Where does the time go in one incident: noticing, telling, fetching supplies, walking, cleaning?</li>
    <li>What do attendants carry, read and use on shift: phones, radios, paper, signs?</li>
    <li>Which pictograms do attendants recognise without words?</li>
    <li>What does a supervisor check, sign and report, and what gets lost at shift handover?</li>
  </ol>
  <h3>Ethics</h3>
  <p class="note">Verbal consent in the participant's language. No names or faces in any write-up without written permission. Observe work without slowing it: step back whenever a task is urgent. Participants can stop at any time and still keep the thank-you gift.</p>
  <div class="run"><span>Saaf Safar research kit</span><span>00 · contents</span></div>
</section>

<section class="sheet">
  <p class="k">01 · read aloud before anything else</p>
  <h2>Consent script</h2>
  <p class="lead">Read in the participant's preferred language. Pause after each part and ask if it is clear.</p>
  ${[
    ["Namaste. My name is ___. I am a design student. I am studying how cleaning work is planned, so that tools can be made easier for the people who do it.", "नमस्ते। मेरा नाम ___ है। मैं डिज़ाइन का छात्र/छात्रा हूँ। मैं समझना चाहता/चाहती हूँ कि सफ़ाई का काम कैसे तय होता है, ताकि यह काम करने वालों के लिए औज़ार आसान बनाए जा सकें।"],
    ["I would like to talk with you for about 45 minutes and, if you agree, watch part of your shift. I will not slow down your work.", "मैं आपसे लगभग 45 मिनट बात करना चाहूँगा/चाहूँगी, और अगर आप मानें तो आपकी पाली का कुछ हिस्सा देखना चाहूँगा/चाहूँगी। मैं आपका काम धीमा नहीं करूँगा/करूँगी।"],
    ["There are no right or wrong answers. I am not checking your work, and nothing you say goes to your supervisor or employer with your name.", "कोई जवाब सही या गलत नहीं है। मैं आपके काम की जाँच नहीं कर रहा/रही, और आपकी कही कोई बात आपके नाम के साथ आपके सुपरवाइज़र या मालिक तक नहीं जाएगी।"],
    ["I will take notes. I will not take photos of your face. If I want to record audio, I will ask first.", "मैं नोट्स लिखूँगा/लिखूँगी। मैं आपके चेहरे की फ़ोटो नहीं लूँगा/लूँगी। अगर आवाज़ रिकॉर्ड करनी हो तो पहले पूछूँगा/पूछूँगी।"],
    ["You can stop at any time, or skip any question, without giving a reason.", "आप कभी भी रुक सकते हैं, या कोई भी सवाल छोड़ सकते हैं, बिना कोई कारण बताए।"],
    ["Is it all right if we begin?", "क्या हम शुरू कर सकते हैं?"],
  ].map(([en, hi], i) => `<div class="block"><span class="mono">${String(i + 1).padStart(2, "0")}</span>${bi(en, hi)}</div>`).join("")}
  <table style="margin-top:14px"><tr><th>Participant code</th><th>Site</th><th>Date</th><th>Language</th><th>Consent given</th><th>Audio allowed</th></tr><tr><td class="blank"></td><td></td><td></td><td></td><td>☐ yes</td><td>☐ yes ☐ no</td></tr></table>
  <div class="run"><span>Saaf Safar research kit</span><span>01 · consent</span></div>
</section>

<section class="sheet">
  <p class="k">02 · about 50 minutes · Hindi or English</p>
  <h2>Attendant interview guide</h2>
  <p class="lead">Ask the Hindi as written; the English is for the researcher. Follow the person's story more than the order of the questions.</p>
  <div class="block"><span class="mono">5 min</span><div><b>Warm-up</b><ol class="q">
    <li>${bi("How long have you done this work? Where did you work before?", "आप यह काम कितने समय से कर रहे हैं? पहले कहाँ काम करते थे?")}</li>
    <li>${bi("Which shift do you usually work?", "आप आमतौर पर कौन सी पाली में काम करते हैं?")}</li></ol></div></div>
  <div class="block"><span class="mono">10 min</span><div><b>Today's work</b><ol class="q">
    <li>${bi("How do you know which washroom to clean next?", "आपको कैसे पता चलता है कि अगला कौन सा शौचालय साफ़ करना है?")}<p class="probe">Probe: a fixed round, a list, the supervisor, passengers, your own judgement?</p></li>
    <li>${bi("What do you keep on your cart? What runs out first?", "आप अपनी गाड़ी में क्या रखते हैं? सबसे पहले क्या खत्म होता है?")}</li>
    <li>${bi("Do you carry a phone or radio on shift? What do you use it for?", "क्या पाली में आपके पास फ़ोन या रेडियो रहता है? उसका इस्तेमाल किसलिए करते हैं?")}</li></ol></div></div>
  <div class="block"><span class="mono">20 min</span><div><b>One recent incident, step by step</b><ol class="q">
    <li>${bi("Think of the last time a washroom ran out of something or a bin overflowed. Tell me what happened, from the start.", "पिछली बार याद कीजिए जब किसी शौचालय में कुछ खत्म हो गया था या कूड़ादान भर गया था। शुरू से बताइए क्या हुआ।")}<p class="probe">Probe each step for time: who noticed, how you heard, what you fetched, how far you walked.</p></li>
    <li>${bi("Did you have to go back to the store? How often does that happen?", "क्या आपको वापस स्टोर जाना पड़ा? ऐसा कितनी बार होता है?")}</li>
    <li>${bi("What happens when something goes wrong near the end of your shift?", "जब पाली खत्म होने के समय कुछ गड़बड़ होती है तो क्या होता है?")}</li></ol></div></div>
  <div class="block"><span class="mono">10 min</span><div><b>Reaction to pictures</b><ol class="q">
    <li>${bi("I will show you some pictures. Tell me what each one means to you. There is no wrong answer.", "मैं आपको कुछ तस्वीरें दिखाऊँगा/दिखाऊँगी। बताइए हर एक का आपके लिए क्या मतलब है। कोई जवाब गलत नहीं है।")}<p class="probe">Use the pictogram test cards (section 06). Do not name or hint at the meaning.</p></li></ol></div></div>
  <div class="block"><span class="mono">5 min</span><div><b>Wrap-up</b><ol class="q">
    <li>${bi("If you could change one thing about how this work is planned, what would it be?", "अगर आप इस काम की योजना में एक चीज़ बदल सकते, तो वह क्या होती?")}</li></ol></div></div>
  <div class="run"><span>Saaf Safar research kit</span><span>02 · attendant guide</span></div>
</section>

<section class="sheet">
  <p class="k">03 · about 40 minutes</p>
  <h2>Supervisor interview guide</h2>
  <ol class="q" style="margin-top:12px">
    <li>${bi("Walk me through how you check your zone during a shift.", "बताइए आप पाली के दौरान अपने ज़ोन की जाँच कैसे करते हैं।")}<p class="probe">How often do you walk a round only to find problems?</p></li>
    <li>${bi("How do you hear about a problem, and how do you get someone there?", "आपको किसी समस्या का पता कैसे चलता है, और आप किसी को वहाँ कैसे भेजते हैं?")}<p class="probe">Radio, phone, passing by, a complaint? How long does it take?</p></li>
    <li>${bi("What do you sign or fill in during the shift? Who reads it?", "पाली के दौरान आप क्या साइन करते या भरते हैं? उसे कौन पढ़ता है?")}</li>
    <li>${bi("What happens at handover to the next shift? What gets lost?", "अगली पाली को काम सौंपते समय क्या होता है? क्या छूट जाता है?")}</li>
    <li>${bi("When are you busiest? Does the crew size change with it?", "आप सबसे ज़्यादा व्यस्त कब होते हैं? क्या उसके हिसाब से टीम बदलती है?")}</li>
    <li>${bi("If a screen showed every washroom's state live, what would you want first? What would worry you?", "अगर एक स्क्रीन पर हर शौचालय की हालत लाइव दिखे, तो आप सबसे पहले क्या देखना चाहेंगे? किस बात की चिंता होगी?")}<p class="probe">Listen for surveillance worries: data about washrooms, not about people.</p></li>
  </ol>
  <h3>Bring back</h3>
  <ul class="check"><li>A blank copy of any checklist they sign</li><li>Their zone's rough layout, drawn together</li><li>Shift times and crew size per shift</li><li>Where the store is and how far</li></ul>
  <div class="run"><span>Saaf Safar research kit</span><span>03 · supervisor guide</span></div>
</section>

<section class="sheet">
  <p class="k">04 · one sheet per shift shadowed</p>
  <h2>Shift observation sheet</h2>
  <table style="margin:10px 0 12px"><tr><th>Site</th><th>Zone</th><th>Shift</th><th>Participant code</th><th>Observer</th></tr><tr><td class="blank"></td><td></td><td></td><td></td><td></td></tr></table>
  <table>
    <tr><th style="width:16mm">Time</th><th>Where</th><th>What the attendant does</th><th>Tools used (cart, phone, radio, paper)</th><th>Who started it (round, supervisor, passenger, self)</th><th>Notes, quotes</th></tr>
    ${'<tr><td class="blank"></td><td></td><td></td><td></td><td></td><td></td></tr>'.repeat(12)}
  </table>
  <h3>At the end of the shift</h3>
  <ul class="check"><li>Number of rounds walked</li><li>Trips back to the store</li><li>Times a passenger raised a problem</li><li>What was handed over, and how</li></ul>
  <div class="run"><span>Saaf Safar research kit</span><span>04 · observation</span></div>
</section>

<section class="sheet">
  <p class="k">05 · at least five real incidents · replaces the estimates</p>
  <h2>Incident timing log</h2>
  <p class="lead">Write the clock time at each moment. Leave a cell empty if you did not see it; never guess. These times replace the case study's estimates of 34 minutes before anyone knows, 6 for the radio, 12 for the store and walk, and 4 to refill.</p>
  <table>
    <tr><th>#</th><th>What ran out or overflowed</th><th>Started (best estimate)</th><th>First noticed by whom</th><th>Attendant told how</th><th>Left for store</th><th>Arrived at washroom</th><th>Done</th></tr>
    ${[1, 2, 3, 4, 5, 6, 7, 8].map((n) => `<tr><td>${n}</td><td class="blank"></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>`).join("")}
  </table>
  <div class="run"><span>Saaf Safar research kit</span><span>05 · incident timing</span></div>
</section>

<section class="sheet">
  <p class="k">06 · ISO 9186 style · cut along the borders · show one at a time</p>
  <h2>Pictogram test cards</h2>
  <p class="lead">Show the card with the number away from the participant. Ask: “What does this picture mean to you?” and «यह तस्वीर आपके लिए क्या मतलब रखती है?». Write the answer word for word. Do not hint.</p>
  <div class="cards">
    ${CARDS.map(([n], i) => `<div class="card"><div class="sym">${pic(n, 104)}</div><div><span class="num">Card ${String(i + 1).padStart(2, "0")}</span>${lines(3)}<div class="rate"><span>✓ correct</span><span>~ partly</span><span>✗ wrong</span><span>? no answer</span></div></div></div>`).join("")}
  </div>
  <div class="run"><span>Saaf Safar research kit</span><span>06 · pictogram cards</span></div>
</section>

<section class="sheet">
  <p class="k">07 · for the researcher only · never show this page</p>
  <h2>Answer key and scoring</h2>
  <div class="key" style="margin:12px 0 14px">
    <b></b><b>Intended meaning</b><b class="hi">कहा जाए</b><b>Counts as correct</b>
    ${CARDS.map(([n, en, hi, ok]) => `${pic(n, 22)}<span>${e(en)}</span><span class="hi">${e(hi)}</span><span style="color:var(--dim)">${e(ok)}</span>`).join("")}
  </div>
  <h3>Decide per pictogram</h3>
  <table>
    <tr><th>Correct, out of all answers</th><th>Decision</th></tr>
    <tr><td>Two-thirds or more</td><td>Keep</td></tr>
    <tr><td>Between one-third and two-thirds</td><td>Redraw, then test again with new participants</td></tr>
    <tr><td>Under one-third</td><td>Drop the metaphor; try a different one</td></tr>
  </table>
  <p class="note" style="margin-top:12px">The two-thirds bar follows the case study's target, close to the 67% criterion commonly applied to public information symbols under ISO 9186; safety signs are held to a higher bar. Treat this as a design pass, not certification.</p>
  <div class="run"><span>Saaf Safar research kit</span><span>07 · answer key</span></div>
</section>

</body>
</html>
`;
fs.writeFileSync(SITE + "/assets/saafsafar/research-kit.html", html);
console.log("wrote assets/saafsafar/research-kit.html", Math.round(html.length / 1024) + " KB");
