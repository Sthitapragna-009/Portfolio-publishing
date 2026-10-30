# H2o Connect: critique of the whole app

**What was reviewed:**
- The eight phone screens (`screen-f1` to `f8`).
- Apple Watch (4 screens) and Galaxy Watch (2).
- Echo Show, Nest Hub and Apple HomeView.
- The Dynamic Island.

**Lenses:**
- `ux-heuristics`: Nielsen H1–H10, the Laws of UX, data display, accessibility.
- `design-critique`: severity scale 0–4, posture, excise, the Krug checks.
- `ux-strategy`: jobs to be done, the four forces, HEART, the responsibility check.
- `ux-writing`: microcopy.
- `anti-slop`: the S1–S15 checklist.
- `design-taste-frontend`: its app-screen rules.
- `ui-ux-pro-max`: its priority table.

**Limits:**
- `ui-ux-pro-max`'s search script and `design-taste-frontend`'s reference files and scripts are not installed on this machine. Only their written rules were used, as the skills allow.
- Everything here is judged from static exports. Motion, timing and real response times weren't testable, except the island recording.

**Context** (critique step 1):
- **User:** the household's "pump keeper", plus everyone else at home.
- **Use:** seconds at a time, a few times a day, often while doing something else.
- **Place:** today the kit runs in about 100 homes in Visakhapatnam, Narsapuram and Hyderabad.

---

## 1. The verdict

The product thinking is strong and the visual hierarchy works. The tank comes first, evidence comes before questions, Stop never asks twice, and the hardware switch wins. **What lets it down is consistency and logic, not looks.**

- The rules for quiet hours, Eco and Smart contradict each other.
- The numbers don't add up across screens.
- Stop looks different on every surface.
- The main navigation has no labels.
- One alert offers an action the installed kit can't perform.

A polished surface hides these problems (the aesthetic-usability effect). A careful reviewer will find them.

**Score:** 34 issues. 4 major (severity 3), 17 moderate (2), 13 minor (1). Nothing catastrophic (4).

---

## 2. What works (keep all of this)

| Strength | Why it works |
|---|---|
| Home opens on the tank: 78%, litres and status, and the tank is the only blue thing | Visual hierarchy, Von Restorff, posture (a transient app: answer in one glance) |
| The leak alert shows the evidence chart before asking anything | H9, H1, trust |
| Fill range explains the consequence ("What this means") | Tesler's Law: the app does the maths, not the user |
| Smart shows its confidence and offers "Why this time?" | H10, honest automation |
| Stop has no confirmation; Manual on the unit overrides the app | H3 emergency exit, Fitts's Law, hardware as the final fallback |
| Low water in Manual mode warns but never acts, and offers "Remind me in 15 minutes" | User control, respects the chosen mode |
| Local units: litres, rupees, "units" for kWh | H2, the audience's own words |
| The same words on the watch, displays and island ("Water is low", "Start motor") | H4 across devices (mostly) |
| Plain microcopy: "Cuts power if the sump runs empty" | ux-writing: purposeful, concise |

**Five-second test on Home:** what is this (the tank), how full (78%) and what is it doing (filling) all pass. "What can I do?" fails: the main action, Stop, is an unlabelled icon.

---

## 3. Heuristic scorecard

Severity: 1 minor, 2 moderate, 3 major.

### H1 Visibility of system status
| # | Issue | Where | Sev | Fix |
|---|---|---|---|---|
| 1 | **No sign of how fresh the reading is.** If the sensor goes silent, Home still shows 78% with full confidence. In a product whose promise is proof, a stale number is the worst failure. | f1, all surfaces | 3 | A small "Live · updated 9:41" line; when stale, grey the tank and say "Last reading 2 h ago" |
| 2 | "Fill now" stays visible and active while the tank is already filling | f1, f3 | 2 | Disabled "Filling" while the motor runs |
| 3 | The timer is elapsed time on the phone ("04:12 of about 18 min") but time left in the island ("04:03 left") | f1, f3, island | 2 | Pick one: time left everywhere (the question people ask) |
| 4 | Run history has no cost or cause, though principle 2 promises receipts | f6 | 2 | "18 min · 720 L · ₹1.80 · Started at 25%" |

### H2 Match between system and the real world
| # | Issue | Where | Sev | Fix |
|---|---|---|---|---|
| 5 | "Sensor goes quiet" is vague | f4 | 1 | "Sensor stops reporting" |
| 6 | MAX / MIN on the tank don't say what they do | f1, f5 | 1 | "Stops 90%" / "Starts 25%" |
| 7 | Boost "fills at maximum rate", but a fixed-speed 0.75 kW pump has no faster rate | f4 | 2 | "Fill to 100% once" |
| 8 | "Ignoring teaches Smart…": does closing with × count as ignoring, or only "That was us"? | f8 | 1 | "Tap That was us and Smart treats this as normal" |

### H3 User control and freedom
| # | Issue | Where | Sev | Fix |
|---|---|---|---|---|
| 9 | No undo after closing the inlet valve; the toast just says "Inlet valve closed" | f8, film | 2 | "Inlet valve closed · Reopen" |
| 10 | Fill range has Save but no reset, and leaving with unsaved changes isn't handled | f2 | 1 | "Reset to 25% and 90%"; confirm when leaving with changes |
| 11 | **The leak alert's main action needs an inlet valve that is "Planned"**, so in the ~100 installed homes it can't work | f8, watch alert | 3 | Without a valve: "Pause automatic filling" |

### H4 Consistency and standards
| # | Issue | Where | Sev | Fix |
|---|---|---|---|---|
| 12 | "Automatic" (f4) vs "Auto" (f7, island) | f4, f7, island | 2 | "Automatic" on the phone; "Auto" only where space forces it |
| 13 | The screen is called "Automation", the structure map says "Modes", and "History" is really "Usage" | f4, f7, IA | 2 | One glossary: Home, Usage, Motor, Modes |
| 14 | Five Stop styles (below) | All surfaces | 2 | One Stop style: red fill, dark label, square icon |
| 15 | Three app identities (below) | All surfaces | 2 | One icon and one name: the blue house-and-drop icon, "H2o Connect" |
| 16 | Motor and Modes are tabs but show back arrows | f3, f4, f7 | 1 | No back arrow on tab roots |
| 17 | "Turn on motor now" (phone), "Start motor" (watch), "Start" (Galaxy) | f5, watches | 1 | "Start motor" everywhere it fits |
| 18 | Lime means action, "running", selected and Auto all at once; orange means both "low" and "Manual" | f1, f3, f4, f6, f7 | 2 | Either lime = actions only, or state the rule as "lime is the motor"; keep orange for low |
| 19 | The numbers disagree with each other (below) | f1–f7, Nest Hub | 2 | One data set (20 L/min, 65 min a fill, ₹ per run). You chose to keep the current numbers for now. |

**The five Stop styles:**
- A black circle on the lime card (phone Home)
- A red outline on dark red (phone Motor, island)
- A solid red pill with a dark label (Apple Watch)
- A solid red "Stop pump" button (HomeView)
- A lime toggle labelled "Pump" (Nest Hub)

**The three app identities:**
- A blue squircle with a house and a drop, named "H2o Connect" (design system, iOS home screen)
- A lime squircle with a drop, named "H2o" (in the island recording)
- A lime circle with a drop (phone Home, HomeView)

**The numbers that disagree:**
- Flow is 22 L/min on Motor, 40 L/min in Usage, and 20 L/min as implied by Home.
- Fill range says a fill takes about 18 minutes; a 25%→90% fill actually takes about 65 at that rate.
- 8.4 units of electricity for 1,240 L; that much water needs about 0.8.
- "4.2 units saved" by Eco, but Eco moves runs in time and saves rupees, not units.
- Nest Hub's "3 runs · ₹6.30" matches nothing on the phone.

### H5 Error prevention
| # | Issue | Where | Sev | Fix |
|---|---|---|---|---|
| 20 | **Quiet hours (no motor 11 PM–6 AM), Eco (only off-peak, which is at night) and Smart (fills 01:40 "inside quiet hours") contradict each other.** With all three on, either the tank never fills or quiet hours are broken. | f4, f7, HomeView, Nest | 3 | One rule set: quiet hours are never broken, and Smart plans outside them |
| 21 | Eco plus Automatic: the screen never says what happens when the tank reaches 25% at peak time | f4 | 2 | "Below 10% it fills straight away" |

### H6 Recognition rather than recall
| # | Issue | Where | Sev | Fix |
|---|---|---|---|---|
| 22 | **The tab bar is five icons with no labels.** A gauge for Motor and sliders for Modes aren't universal symbols, and the persona Suresh (62) is the accessibility test. | f1–f4, f6, f7 | 3 | Labels under the icons |
| 23 | The Stop on Home is a bare square icon | f1 | 2 | The word "Stop" |
| 24 | Settings sit behind a hamburger menu while a tab bar exists, so there are two navigation systems | f1 | 1 | A gear icon, or Settings as a row in a profile sheet |

### H7 Flexibility and efficiency
| # | Issue | Where | Sev | Fix |
|---|---|---|---|---|
| 25 | No home-screen widget or Android ongoing notification is shown; the quick path (the island) exists only on iPhone, and only while filling | — | 1 | A widget, and an Android persistent notification with Stop |

### H8 Aesthetic and minimalist design
| # | Issue | Where | Sev | Fix |
|---|---|---|---|---|
| 26 | Pills around static metadata: Filling, Manual mode, Smart noticed, Learned from 34 days, Saves 38%, AUTO/MANUAL, −42 L | Most screens | 1 | Plain text; keep pills for things you can tap |
| 27 | Decorative coloured glows behind the alert screens | f5, f8 | 1 | Flat background; the pill and the tank carry the colour |
| 28 | The motor card mixes status with an unrelated saving ("4.2 units saved this week") | f1 | 1 | Keep the card to the run; put savings in Usage |

### H9 Recognise, diagnose and recover from errors
| # | Issue | Where | Sev | Fix |
|---|---|---|---|---|
| 29 | Eleven edge states are claimed, but only two (low water, leak) exist as screens. There's no screen for no internet, a silent sensor, a power cut mid-fill or motor overheating. | — | 2 | Design and show at least "Sensor silent" and "No internet" |

### H10 Help and documentation
| # | Issue | Where | Sev | Fix |
|---|---|---|---|---|
| 30 | Smart's first 30 days aren't designed. The prediction needs 34 days of data, so what does a new home see? | f7 | 1 | "Smart is learning: 12 of 30 days" with Automatic in charge meanwhile |

### Accessibility (ux-heuristics §6, ui-ux-pro-max priority 1–2)
| # | Issue | Where | Sev | Fix |
|---|---|---|---|---|
| 31 | Small text in Water blue (`#2F6BFF`, 4.4:1, "large only" by your own palette) and in faint grey (`#626A77`, 3.6:1) | f2 labels and hint, f8 helper | 2 | Use `#8FB0FF` for small blue text, and muted `#99A1AE` for hints |
| 32 | Fill-range handles are about 26 px | f2 | 2 | 48 px touch area |
| 33 | 14 px body text and 12 px all-caps labels for an audience that includes older users | All | 2 | 16 px body, 13 px labels in sentence case |
| 34 | The usage chart has no values; the selected day is shown by colour alone | f6 | 1 | A value label on the selected bar ("Sat · 820 L") |

### Summary

| Heuristic | Issues | Major |
|---|---|---|
| H1 Visibility | 4 | 1 |
| H2 Real world | 4 | 0 |
| H3 Control | 3 | 1 |
| H4 Consistency | 8 | 0 |
| H5 Error prevention | 2 | 1 |
| H6 Recognition | 3 | 1 |
| H7 Flexibility | 1 | 0 |
| H8 Minimalism | 3 | 0 |
| H9 Errors | 1 | 0 |
| H10 Help | 1 | 0 |
| Accessibility | 4 | 0 |
| **Total** | **34** | **4** |

Consistency (H4) has the most issues; trust and safety hold all four major ones.

---

## 4. Laws of UX

| Law | Verdict | Evidence |
|---|---|---|
| Fitts's Law | Mixed | Stop is 56 px with no confirmation (good). Fill-range handles about 26 px (bad). Fill now sits at the thumb's natural end of the bar (good). |
| Hick's Law | Pass | 4 tabs plus 1 action; the leak alert offers two choices; there are three modes. |
| Miller's Law | Pass | Home is three cards; Motor has three stats. |
| Jakob's Law | Fail | Unlabelled tabs, a hamburger alongside a tab bar, and back arrows on tab roots all break iOS and Android conventions. |
| Von Restorff | Mixed | The tank is the only blue thing (good). But two lime objects on Home, the running card and Fill now, compete for the eye. |
| Doherty Threshold | Pass on paper | Relay under 200 ms, 160 ms state change; not measured. |
| Tesler's Law | Mixed | Fill range does the maths (good). Eco, quiet hours and Smart push rule-solving onto the user (bad). |
| Goal-gradient | Mixed | Motor has a progress bar; Home has none, and its timer counts up. |
| Peak-end rule | Gap | The island has "Tank full · Stopped at 90%", but the phone has no "fill complete" moment or receipt card. |
| Proximity, common region | Pass | Card grouping is clear; Stop sits next to the timer it acts on. |
| Aesthetic-usability effect | Risk | The polish makes the logic conflicts (#20) and number mismatches (#19) easy to miss. |

## 5. Interaction design (design-critique)

- **Posture.** The phone app is transient (glance, act, leave), and its big numbers and few controls suit that. The hardware is daemonic (runs unseen, surfaces only on problems), which is right. The mismatch: the app has no daemonic surface on Android (no ongoing notification), and the market is mostly Android (see §6).
- **Excise** (steps that don't move the task forward).
  - Stopping the motor: on iPhone, island then Stop is 2 taps (good). Inside the app, Stop on Home is 1 tap. Elsewhere it's switch to Home, then tap Stop: 2 taps (acceptable).
  - Changing fill levels: Modes → (no link) → Home tank → Fill range. The Automatic card shows the levels but doesn't link to where you change them.
- **Krug "goodwill" check.** Nothing is hidden or upsold. One drain: the leak alert offering a valve the home doesn't have.

## 6. Strategy (ux-strategy)

- **Main job:** "Keep water in the tank without having to watch it."
  - Emotional job: "feel sure it won't overflow or run dry, and not be blamed".
  - Social job: "share the chore fairly at home".
  The product serves all three, and the hardware switch handles the emotional job well.
- **Four forces** (what pushes people to switch, and what holds them back):
  - Push: overflow, dry runs, climbing to check.
  - Pull: proof and remote Stop.
  - Anxiety: "automation fails when nobody's watching". Answered by receipts and the manual switch.
  - Habit: "the switch is downstairs". Answered by keeping that switch in charge.
  This is the strongest part of the work.
- **North Star.** Today's target ("fewer app opens") is a good counter-metric but a weak North Star. Suggested: **"automatic fills completed with no manual check or override, per home per week"**, with manual overrides per week as the trust signal.
- **Responsibility check, access.** This is the biggest gap, and it isn't a pixel issue:
  - **Language.** Hindi was left out on purpose, but the installs are in Andhra Pradesh and Telangana. **Telugu** (plus English) is the language that matters, especially for older pump keepers and house help.
  - **Platform.** The phone app, the Live Activity and the Apple Watch are iPhone-first. Most phones in these homes will be Android. The Galaxy Watch screens exist, but no Android phone UI or ongoing notification does.
  - **Low-end phones and patchy internet.** The design needs a clear "No internet" state, and a statement that the unit's own buttons work regardless.

## 7. UX writing (ux-writing)

| Now | Better | Rule |
|---|---|---|
| Turn on motor now | Start motor | Verb + object; same words on every surface |
| That was us — ignore it | That was us | Short label, no dash; the helper line explains the effect |
| Sensor goes quiet | Sensor stops reporting | Plain, specific |
| LEARNED FROM 34 DAYS · 92% CONFIDENT | Learned from 34 days · 92% sure | All-caps only up to 3 words |
| HOW AUTOMATIC WORKS | How Automatic works | Sentence case |
| MANUAL MODE · 6:42 AM (on a low-water alert) | Low water · 6:42 AM | The label names the event, not the mode |
| Overhead tank is at 22%. The motor is off. | Overhead tank is at 22%. The motor is off because you're in Manual. | Say why |
| Fills at maximum rate | Fill to 100% once | True to the hardware |
| Runs only in off-peak hours · 4.2 units saved | Fills only off-peak. Saved ₹7 this week. | Correct unit (rupees) |
| Ignoring teaches Smart your household's pattern | Smart will treat this as normal next time | Clear cause and effect |

**Already good:** "Remind me in 15 minutes", "Switch to Automatic so this happens on its own", "Why this time?", "Cuts power if the sump runs empty", "What this means".

## 8. Visual craft (anti-slop, design-taste app rules)

| Check | Result |
|---|---|
| S1–S5 (rainbow buttons, purple-to-orange gradients, glass, frosted bars, blobs) | **None.** Clean. |
| S6 glow | Coloured radial glows behind the low-water and leak screens. Minor. |
| S8 pills on static text | Widespread (see #26). Minor. |
| S13 over-rounded | 28 px cards, round tab buttons, pill segments and round icon buttons: almost everything is fully round. It's a deliberate style, so document it as a choice; otherwise it reads as default. |
| Taste rule: no gradients | The tank fill and the Saturday bar use single-hue gradients. Allowed, but the chart one adds nothing. |
| Taste rule: icons in tinted shapes | Each tab icon sits in a grey circle. With labels added the circles become redundant. |
| Taste rule: data that adds up | **Fails** (see #19). The skill's strongest app-screen rule: invented numbers that don't reconcile are the giveaway of a mock. |
| Style consistency (ui-ux-pro-max priority 4) | One dark style, SVG icons, no emoji (good); three app identities (bad). |

---

## 9. Top 5, in order

1. **Make the rules agree (#20, #21).** Quiet hours, Eco and Smart must never contradict each other. This is the only issue that could leave a household without water.
2. **Show that the reading is fresh (#1, #29).** "Live · updated 9:41", plus designed "Sensor silent" and "No internet" states. That is the proof the whole product promises.
3. **Offer only what the kit can do (#11, #9).** The no-valve leak action, and undo on everything automatic.
4. **Label the navigation and Stop, and make Stop one style everywhere (#22, #23, #14).**
5. **Plan for where it's actually used (§6).** Telugu, Android with a persistent notification, and one app identity (#15).

The short fix spec (`app-fix-spec.md`) covers parts of 1, 3 and 4. It does **not** yet cover:
- the freshness indicator (#1)
- the edge-state screens (#29)
- the one Stop style (#14)
- the app identity (#15)
- contrast (#31) and handle size (#32)
- Telugu and Android (§6)
