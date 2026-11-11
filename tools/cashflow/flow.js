// Information architecture as flow charts, in the case study's timeline style:
// black rounded nodes, outlined ends and decisions, ink connectors, dashed spines, grey labels.
//   iaStructure: onboarding → tab bar → five tabs and the avatar → their screens → help from any card
//   rentFlow:    the rent task, from the card on Home to done, with its decisions and the way back
const { head } = require("./tl.js");
const e = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "’");

const marker = (id) => `<defs>
    <marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="kqf-head" /></marker>
  </defs>`;

/** A node: black by default; 'line' is outlined, 'error' outlined and dashed. */
function node(x, y, w, h, title, sub = "", kind = "") {
  const cx = x + w / 2;
  const ty = sub ? y + h / 2 - 3 : y + h / 2 + 5;
  return `<g class="kqf-node${kind ? " is-" + kind : ""}">
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" />
      <text class="kqf-t" x="${cx}" y="${ty}">${e(title)}</text>
      ${sub ? `<text class="kqf-s" x="${cx}" y="${ty + 18}">${e(sub)}</text>` : ""}
    </g>`;
}
function diamond(cx, cy, hw, hh, label) {
  return `<g class="kqf-node is-decision"><path d="M${cx},${cy - hh} L${cx + hw},${cy} L${cx},${cy + hh} L${cx - hw},${cy} Z" /><text class="kqf-t" x="${cx}" y="${cy + 5}">${e(label)}</text></g>`;
}
const wire = (d, id, cls = "") => `<path class="kqf-wire${cls ? " " + cls : ""}" d="${d}" marker-end="url(#${id})" />`;
const note = (x, y, t, anchor = "middle") => `<text class="kqf-note" x="${x}" y="${y}" text-anchor="${anchor}">${e(t)}</text>`;

/* ---------- 1. structure ---------- */
function iaStructure(num) {
  // A sitemap: every screen is a box. Onboarding → tab bar → five tabs and the avatar → their screens,
  // joined by a spine and elbow connectors. The rent fix is filled in lavender.
  const id = "kqf-a1";
  const W = 1120;
  const T = [
    ["Home", "Tab", ["All your money", "A bank’s home", "Ways to cover rent", "Confirm", "Moving, then done", "Bank words, explained", "Notifications"]],
    ["Accounts", "Tab", ["Accounts by bank", "An account", "Activity", "One payment", "Link a bank"]],
    ["Scan", "Centre button", ["Scan a QR", "Amount", "UPI PIN", "Paid"]],
    ["Pay", "Tab", ["People and bills", "Autopays", "The rent autopay"]],
    ["Insights", "Tab", ["Six months", "Worth a look", "Where it went", "Goals"]],
    ["Profile", "Avatar, top right", ["Cash-flow cards", "Autopays", "Banks and consents", "PIN and fingerprint", "Language", "Talk to a person"]],
  ];
  const RENT = new Set(["Ways to cover rent", "Confirm", "Moving, then done"]);
  const cx = (i) => 90 + i * 188;
  const tabTop = 224;
  const boxW = 150;
  const boxH = 34;
  const step = 46;
  const first = 318;
  const rows = Math.max(...T.map((t) => t[2].length));
  const barY = first + rows * step + 26;
  let s = marker(id);
  // onboarding → tab bar
  s += node(410, 10, 300, 52, "Onboarding");
  s += note(560, 86, "Welcome · salary bank · mobile number · code · app PIN · notifications");
  s += wire(`M560,96 V124`, id);
  s += node(430, 128, 260, 48, "Tab bar and avatar", "", "line");
  s += `<path class="kqf-wire" d="M560,176 V200 M${cx(0)},200 H${cx(5)}" />`;
  T.forEach(([name, kind, items], i) => {
    const x = cx(i);
    s += wire(`M${x},200 V${tabTop - 2}`, id);
    s += node(x - 80, tabTop, 160, 52, name, kind);

    // the spine runs down the left of the column; each screen hangs off it with an elbow
    const sx = x - 74;
    const bx = x - 62;
    const lastMid = first + (items.length - 1) * step + boxH / 2;
    s += `<path class="kqf-wire" d="M${x},${tabTop + 52} V${tabTop + 66} H${sx} V${lastMid}" />`;
    items.forEach((t, k) => {
      const y = first + k * step;
      const on = i === 0 && RENT.has(t);
      s += wire(`M${sx},${y + boxH / 2} H${bx - 2}`, id);
      s += `<g class="kqf-leafbox${on ? " is-on" : ""}"><rect x="${bx}" y="${y}" width="${boxW}" height="${boxH}" rx="10" /><text x="${bx + boxW / 2}" y="${y + boxH / 2 + 4.5}">${e(t)}</text></g>`;
    });
    // each column also reaches the help bar at the bottom
    s += `<path class="kqf-spine" d="M${x + 96},${tabTop + 66} V${barY}" />`;
  });
  s += node(10, barY, W - 20, 50, "", "", "bar");
  s += `<text class="kqf-bar-t" x="34" y="${barY + 31}">From any card</text><text class="kqf-bar-s" x="${W - 34}" y="${barY + 31}">Why am I seeing this? · Ask Khatiq · Talk to a person</text>`;
  s += `<g class="kqf-key"><rect class="kqf-key-on" x="10" y="${barY + 72}" width="22" height="14" rx="4" /><text class="kqf-note" x="42" y="${barY + 84}" text-anchor="start">The rent fix: three taps from Home</text></g>`;
  return `<div class="kqt kqt--flow">${head("Where everything lives", "Information architecture", num)}<div class="kqt-scroll"><svg class="kqf" viewBox="0 0 ${W} ${barY + 100}" style="--min:900px" role="img" aria-label="Information architecture as a sitemap. Onboarding (welcome, salary bank, mobile number, code, app PIN, notifications) leads to the tab bar and avatar. Home: all your money, a bank's home, ways to cover rent, confirm, moving then done, bank words explained, notifications. Accounts: accounts by bank, an account, activity, one payment, link a bank. Scan, the centre button: scan a QR, amount, UPI PIN, paid. Pay: people and bills, autopays, the rent autopay. Insights: six months, worth a look, where it went, goals. Profile, from the avatar: cash-flow cards, autopays, banks and consents, PIN and fingerprint, language, talk to a person. From any card: why am I seeing this, Ask Khatiq, talk to a person. The rent fix, ways to cover rent, confirm, moving then done, is three taps from Home.">${s}</svg></div></div>`;
}


/* ---------- 2. the rent task ---------- */
function rentFlow(num) {
  const id = "kqf-a2";
  const W = 1120;
  const w = 140;
  const h = 56;
  const r1 = 170; // main row centre
  const r2 = 300;
  const r3 = 410;
  const y = (c) => c - h / 2;
  let s = marker(id);
  // main row
  s += node(10, y(r1), w, h, "Card on Home", "3 days before");
  s += wire(`M150,${r1} H198`, id);
  s += node(200, y(r1), w, h, "Ways to cover rent", "Every cost shown");
  s += wire(`M340,${r1} H346`, id);
  s += diamond(410, r1, 62, 42, "Which way?");
  s += wire(`M472,${r1} H488`, id);
  s += node(490, y(r1), w, h, "Move ₹1,500", "from savings pot");
  s += wire(`M630,${r1} H678`, id);
  s += node(680, y(r1), w, h, "Confirm", "New balance shown");
  s += wire(`M820,${r1} H834`, id);
  s += diamond(880, r1, 44, 38, "Moved?");
  s += wire(`M924,${r1} H958`, id);
  s += note(940, r1 - 10, "Yes");
  s += node(960, y(r1), w, h, "Rent is covered", "Next date to watch", "line");
  // other ways out
  s += `<path class="kqf-wire" d="M410,${r1 + 42} V${r3}" />`;
  s += wire(`M410,${r2} H488`, id);
  s += wire(`M410,${r3} H488`, id);
  s += node(490, y(r2), w, h, "Pay rent on 3 Nov", "No fee");
  s += wire(`M630,${r2} H678`, id);
  s += node(680, y(r2), w, h, "Review the date", "Still on time");
  s += wire(`M820,${r2} H1030 V${r1 + h / 2 + 2}`, id);
  s += node(490, y(r3), w, h, "Talk to a person", "About 3 minutes");
  s += wire(`M630,${r3} H678`, id);
  s += node(680, y(r3), w, h, "A person helps", "Sees this card", "line");
  // the error, and the way back
  s += wire(`M880,${r1 - 38} V50 H958`, id);
  s += note(892, 104, "No", "start");
  s += node(960, 22, w, h, "Couldn’t move", "Another way works", "error");
  s += wire(`M1030,22 V8 H270 V${y(r1) - 2}`, id, "is-back");
  s += note(650, 26, "Try another way");
  // the shortcut
  s += wire(`M80,${y(r1)} V104 H750 V${y(r1) - 2}`, id, "is-short");
  s += note(430, 96, "Fix now, the card's one button: straight to confirm");
  return `<div class="kqt kqt--flow">${head("The rent task, start to end", "Task flow", num)}<div class="kqt-scroll"><svg class="kqf" viewBox="0 0 ${W} 450" style="--min:900px" role="img" aria-label="Task flow for rent. The card on Home appears 3 days before. It leads to ways to cover rent, with every cost shown, and a choice. Move ₹1,500 from the savings pot, then confirm with the new balance shown; if it moved, rent is covered and you see the next date to watch; if it didn't, couldn't move, another way works, and you go back to the ways to cover rent. Pay rent on 3 Nov, no fee, then review the date, which also ends with rent covered. Talk to a person, about 3 minutes, and a person helps, seeing this card. Fix now on the card goes straight to confirm.">${s}</svg></div></div>`;
}

module.exports = { iaStructure, rentFlow };
