# H2o Connect app: fix spec

> **Status: built for the phone screens.** `tools/h2o/build-screens.js` rebuilds all ten phone screens in HTML with fixes 1–12 and renders them into `assets/h2o/`. The originals are backed up outside the repo. **Not built yet:**
> - the device photos (watch, HomeView, Echo Show, Nest Hub), which still carry the old Stop styles and icon (parts of fixes 10 and 11)
> - the Dynamic Island recording
> - fix 13 (Telugu and Android)

Thirteen fixes:

- **1–7:** the highest-impact fixes to the eight existing screens.
- **8–13:** from the full critique (`app-critique.md`). These add two new screens, align the other devices, and cover Telugu and Android.

All of them stay inside what the app already is:

- Stop stays in the motor card on Home and full width on the Motor screen.
- The lime "running" card stays.
- Every existing number stays as it is.

Each fix names the rule it serves (Nielsen heuristic H1–H10, a UX law, or one of the product's four principles).

**Export at the same file names and sizes** (`assets/h2o/screen-f1.jpg` … `screen-f8.jpg`, 720 × 1558) and the case study, film and lightbox pick them up without code changes. The hero copies need the same edits:

- `cover-home.webp` (789 × 1707), from Home
- `cover-smart.webp` (644 × 1393), from Smart
- `cover-leak.webp` (644 × 1393), from the leak alert

**New files** from fixes 9 and 13:

| File | Size | Status |
|---|---|---|
| `screen-f9.jpg` (Sensor not reporting) | 720 × 1558 | Needed |
| `screen-f10.jpg` (No internet) | 720 × 1558 | Needed |
| `screen-android-home.jpg` | 720 × 1558 | Optional |
| `screen-android-notif.jpg` | 720 × 1558 | Optional |
| A Telugu version of f5, e.g. `screen-f5-te.jpg` | 720 × 1558 | Optional |

**Device images** to re-export at their current sizes for fixes 10 and 11:
- `dev-aw-1.jpg`
- `dev-homeview.jpg`
- `dev-echo.jpg`
- `dev-nest.jpg`

---

## The seven fixes

### 1. Labels under the tab icons (H6, Jakob's Law)
**Screens:** every screen with the bottom bar (f1, f2, f3, f4, f6, f7)

| Icon | Label |
|---|---|
| Drop | Home |
| Bars | Usage |
| Gauge | Motor |
| Sliders | Modes |
| Bolt | Fill now |

- Labels are 12/16 Medium: white when active, `#99A1AE` when not. Keep the 48 px targets.

### 2. A word on the Stop button (H6, accessibility)
**Screen:** f1 Home

- The round black button on the lime card is a bare square icon. Add the word **Stop** under the icon, or make it a pill reading "■ Stop".
- Keep its 56 px size and the no-confirmation rule.

### 3. Fill now while the tank is already filling (H1)
**Screens:** f1 Home and f3 Motor (any screen where the motor is running)

- While the motor runs, show the fifth bar button in its disabled state (40% opacity), with its label reading **Filling**.
- It comes back as **Fill now** when the motor stops.

### 4. One word per thing (H4)
| Screen | Now | Change to |
|---|---|---|
| f4, f7 title | Automation | **Modes** (matches the tab and the case study) |
| f7 segmented control | Auto | **Automatic** (matches f4) |
| f5 primary button | Turn on motor now | **Start motor** (matches the watch and the island) |

### 5. Receipts on every run (principle 2, "every action leaves a receipt")
**Screen:** f6 Usage

The run rows keep their times, minutes and litres, and gain the cost and what started the run. Cost here is minutes × 0.75 kW × ₹8 a unit.

| Row | Line 1 | Line 2 |
|---|---|---|
| 1 | Today, 6:42 AM | 18 min · 720 L · ₹1.80 · Started at 25% |
| 2 | Yesterday, 7:10 PM | 12 min · 480 L · ₹1.20 · Started from the unit |
| 3 | Monday, 6:38 AM | 21 min · 840 L · ₹2.10 · Started at 25% |

The AUTO / MANUAL tags stay as they are.

### 6. The leak alert offers only what the kit can do (H5, H3)
**Screen:** f8 Possible leak

| Element | Now | Change to |
|---|---|---|
| Primary | Close the inlet valve | **With a valve:** keep. **Without one (today's installs):** "Pause automatic filling" |
| Secondary | That was us — ignore it | **That was us** |
| After the primary | Toast "Inlet valve closed" | Add undo: "Inlet valve closed · Reopen", or "Automatic filling paused · Resume" |

Export the no-valve version as `screen-f8.jpg`. That's the one that matches the 100 installed homes.

### 7. Quiet hours and Smart's plan agree (H4)
**Screens:** f4 and f7. Copy only; Smart's plan times stay.

- **The conflict:** Quiet hours say "No motor between 11 PM and 6 AM", but Smart's plan fills at 01:40 "inside quiet hours".
- **f4, Quiet hours row:** "No motor between **9 PM and 1 AM**".
- **f7, Tonight's plan:** "Off-peak tariff · **after quiet hours**".
- **f7, Smart toggle note:** "**Never during** your quiet hours".

---

## Fixes 8–13, from the full critique

### 8. Show how fresh the reading is (H1, critique #1, major)
**Screens:** f1 Home. The same line also goes on the HomeView and Echo Show screens if you re-export them.

| State | Under "1,560 of 2,000 L" | Tank |
|---|---|---|
| Fresh (reading under 5 min old) | "● Live · updated 9:41" in 13 px muted `#99A1AE`, with a small blue dot | As now |
| Stale (5 min or more) | "Last reading 9:12 · 29 min ago" in 13 px orange `#FFA53D` | Fill desaturated to grey, so the number can't be mistaken for live |

- This is the product's promise ("proves what it just did") made visible.
- It costs one line of text.

### 9. Two new screens: Sensor silent and No internet (H9, critique #29)

These states are claimed in the case study but have no screens yet. Both are variants of Home, so reuse its layout.

**f9 · Sensor not reporting** (new file `screen-f9.jpg`, 720 × 1558)

| Element | Content |
|---|---|
| Tank | Grey fill at the last known level; "Last reading 7:40 AM · 2 h ago" under it |
| Banner, replacing the motor card (orange `#FFA53D` edge, dark card) | **Sensor not reporting.** "The tank sensor hasn't sent a reading since 7:40 AM. Automatic won't start the motor until it's back." |
| Primary | **Check the sensor** (opens a 3-step checklist: power, Wi‑Fi, lid) |
| Secondary | **Start motor** ("The unit's dry run and thermal cut-offs still protect it.") |
| Bottom bar | As fix 1 |

**f10 · No internet** (new file `screen-f10.jpg`, 720 × 1558)

| Element | Content |
|---|---|
| Top of Home | Thin muted bar: "Offline · last update 9:12 AM" |
| Tank | Last known level, greyed as in fix 8 |
| Banner (neutral dark card) | **No internet.** "The unit keeps running on its own: Automatic and the safety cut-offs don't need it. On home Wi‑Fi you can still stop the motor." |
| Motor card | Stop stays active (it works over home Wi‑Fi); other controls show disabled |

**Why:** both screens answer the persona's fear that automatic things break when nobody's watching. They also show the "safety on the device, control on the phone, memory in the cloud" architecture working.

### 10. One Stop style on every surface (H4, critique #14)

Use the style the Motor screen and the Dynamic Island already share:

| Part | Value |
|---|---|
| Fill | Dark red `#2A1416` |
| Border | 2 px `#FF4D5E` |
| Label | `#FF4D5E`, Semibold, with a square stop icon before the word **Stop** |
| Size | 56 px minimum height; no confirmation |

| Surface | Now | Change to |
|---|---|---|
| Phone Home, motor card | Black circle with a square | Circle in the Stop style, with "Stop" under it (this also does fix 2) |
| Phone Motor | Stop style | Keep |
| Dynamic Island | Stop style | Keep |
| Apple Watch (`dev-aw-1.jpg`) | Solid red pill, dark label | Stop style |
| Apple HomeView (`dev-homeview.jpg`) | Solid red "Stop pump" | Stop style, label "Stop" |
| Echo Show (`dev-echo.jpg`) | "Stop pump" | Stop style, label "Stop" |
| Nest Hub (`dev-nest.jpg`) | Lime "Pump" toggle | A **Stop** button while running and a lime **Start motor** button when off. A toggle hides which way it will act. |

### 11. One app identity (H4, critique #15)

| Thing | Rule |
|---|---|
| Icon | The blue squircle with the house and the drop (`app-icon.svg`) everywhere, including the small mark top-left on phone Home and in the HomeView header. Today these are a lime drop in a circle. |
| Name | **H2o Connect**. "H2o" only where the platform truncates it (watch app title). |
| Lime | Stays the motor's colour, never the brand mark |

The Dynamic Island recording shows a lime "H2o" icon on the iPhone home screen. Leave it until the prototype is re-recorded.

### 12. Contrast and touch size (accessibility, critique #31, #32)

| Element | Now | Change to |
|---|---|---|
| Small blue labels, e.g. "STOP FILLING" on f2 | Water `#2F6BFF` (4.4:1, "large only" in your palette) | `#8FB0FF` for text under 18 px; keep `#2F6BFF` for the tank fill and large numbers |
| Hints and helper lines, e.g. "Drag either handle on the tank." (f2) and "Ignoring teaches Smart…" (f8) | Faint `#626A77` (3.6:1) | Muted `#99A1AE` (7.6:1) |
| Fill-range handles (f2) | About 26 px | 48 px touch area; the visible dot can stay smaller |

### 13. Where it's actually used: Telugu and Android (strategy, critique §6)

The ~100 installs are in Andhra Pradesh and Telangana, and most phones there run Android.

**Language**
- **Settings, Language:** English, Telugu (తెలుగు), with Hindi later. Show each language in its own script.
- **Design for longer text.** Telugu strings run longer and taller, so let buttons and titles wrap to two lines, give text at least 1.5 line height, and don't put labels in fixed-width pills.
- **Translations** come from a native speaker, not machine translation. Test Home, the low-water alert and the leak alert in Telugu first.
- **Optional portfolio frame:** a Telugu version of the low-water alert (f5).

**Android** (two optional new frames)
- **Android Home** (`screen-android-home.jpg`): the same content in an Android frame. The bottom navigation bar shows labels by default. No in-app back on tab roots; the system back gesture handles it.
- **Ongoing notification during a fill** (`screen-android-notif.jpg`), the Android equivalent of the Live Activity: "Overhead tank · Filling · 78% · 12 min left", with a progress bar and two actions, **Stop** and **Open**. It shows on the lock screen.

---

## Left out on purpose (and what that means for the page)

These were in the long spec and are dropped at your request:

| Not changing | What to watch on the page |
|---|---|
| Lime on the running card, toggles and chips | Principle 3 ("colour means something") now reads as **"lime is the motor: its state and its controls"**. I'll reword it on the page to match. |
| The numbers (flow 22 vs 40 L/min, 8.4 units, "about 18 minutes", "4.2 units saved") | They don't fully agree with each other. The page doesn't quote them in a way a reader can cross-check, but avoid adding new figures that depend on them. |
| Back arrows on Motor and Modes | Minor platform-convention issue (Jakob's Law); nothing on the page depends on it. |
| 14 px body text, all-caps labels | The Status section says "200% text size without breaking". That's still a target, not a claim about these images. |
| MAX / MIN labels, Boost wording, Eco wording | No page copy depends on them. |

## What I'll change on the page after you re-export

- **Story 1 and product captions:** receipts now show ₹ and what started each run.
- **Story 3 (leak):** mention the no-valve action and its undo.
- **Principle 3 and the design system intro:** "lime is the motor: its state and its controls".
- **Appendix, structure map:** "History" → "Usage", to match the tab.
- **Product gallery:** add f9 (Sensor not reporting) and f10 (No internet), with captions on what the unit keeps doing on its own.
- **Story 1, "after":** mention the "Live · updated" line, since proof includes how fresh the proof is.
- **Status, "not done yet":** drop items that the new screens cover; if you make the Telugu or Android frames, add "Telugu and Android" as designed.
- **Beyond the phone:** captions say Stop looks the same on every surface.
- **Hero:** if the Home mark changes to the blue icon, re-export `cover-home.webp` too.
