# Playing Nigiri TD (current build)

## What you’re doing

Conveyor sushi heads toward the trash. You place **animals** on buildable seats next to the belt; they eat plates that roll past. **Lives** drop when plates escape; **money** buys more animals and upgrades. Clear **10 rounds** to finish the campaign, then choose **End Run (Victory)** or **Continue · Infinite** (endless scaling — there is no final wave).

## Flow

**Title** → **Map** → **Difficulty** (Easy / Intermediate / Hard) → **Gameplay** → after round 10, **victory offer** (infinite or end run) → title or retry on game over / victory.

- **Language:** top-right on the title screen toggles **English** / **简体中文** (saved in `localStorage`).
- **How to Play** on the title is optional flavor text plus a tiny belt vignette.
- **Test Mode** (title) is the same as a normal run (all 10 rounds per map, infinite mode, difficulty) except **unlimited money** for placing and upgrading.
- **Crossroads** (+165), **Runway** and **Perimeter** (+200 each) include extra starting money (`startingMoneyBonus` in `data.js`). **Runway** also adds **+$50** on every **campaign** round clear (rounds 1–10 only; not infinite); see `RUNWAY_CAMPAIGN_ROUND_BONUS` in `data.js`.

## Controls

### Mouse / trackpad (desktop)

- **Click** — menus, map cards, difficulty, shop, grid, **Start Wave**, wave **Slower / Pause / Faster**, overlays, mute, round **back** (top-left in map/difficulty/play). With a tower selected: **Targeting** (**Weakest first** / **Furthest first**), **Upgrade**, **Sell**.
- **Keyboard** (gameplay, when not paused on blocking overlays):
  - **Space** — start wave (prep only; not on the post–round-10 offer screen).
  - **P** — pause / resume.
  - **Esc** — cancel place mode, then clear tower selection (or resume from pause).
  - **U** / **S** — upgrade / sell selected tower.
  - **M** — mute.
  - **+** / **=** or numpad **+** — faster game speed during an active wave; **−** or numpad **−** — slower (same steps as the sidebar buttons).
  - **1–9**, **0** — select tower for placement (shop order: **1** Cat … **0** Dragon); press again to cancel. Not used on map/difficulty screens (those use **1–4** / **1–3** there).
- **Map / difficulty screens:** **1–6** quick-pick map (card order), **1–3** difficulty, **Esc** back.

### Touch (iPhone / iPad)

- **Tap** = click. All UI is tap-driven; **no keyboard required**.
- **Drag** on the canvas updates the “cursor” position for hovers (shop highlights, tower range preview, etc.).
- **Mute** is the speaker icon **bottom-left**. **Back** is the **round arrow top-left** on map select, difficulty select, and in-game (hidden on game-over / victory overlays).
- **Portrait vs landscape:** In **portrait** on a typical phone, the gameplay sidebar uses **larger text and buttons** so the shop stays legible. In **landscape**, the same sidebar uses **tighter spacing** so everything still fits the fixed game height; **Start Wave**, **mute**, and **back** stay easy to tap. **Tablets** mostly match the desktop sidebar layout.
- **iOS tip:** Add to Home Screen for a fuller-screen experience. **Unmute** once after a tap so Web Audio can start (browser rule).

## Difficulty (per run)

| Mode           | Effect |
| -------------- | ------ |
| Easy           | Baseline enemy HP and spawn timing. |
| Intermediate   | **+10%** enemy HP. |
| Hard           | **+20%** HP and **10%** faster spawns (shorter interval). |

Global tower and enemy definitions in `ENEMY_DATA` / `TOWER_DATA` are unchanged; only multipliers for that run apply.

## Tower targeting (per tower)

When a tower is selected, **Targeting** chooses how it picks enemies **in range** for attacks (including multi-hit and pierce order):

| Mode | Priority |
| --- | --- |
| **Weakest first** | Lowest **current HP**, then furthest along the belt as a tie-break. |
| **Furthest first** | Furthest along the belt toward the trash (**default**, matches legacy behavior), then lowest HP as a tie-break. |

## Tanuki kill gold

**Tanuki** adds a percentage to kill gold when its bonus applies (tiers **+30% / +45% / +60%** in `TOWER_DATA`). Credit uses **last hit by Tanuki** when that tower got the killing blow; **otherwise** the **closest tower** (Euclidean distance to the sushi when it dies) sets the bonus—so a nearby Tanuki can still apply the bonus without last hit. The floating **+total (+extra …)** text shows when extra gold was added.

## Lives lost when sushi escapes

Each type has a `lifePenalty` in `src/js/data.js` (hearts removed when it reaches the bin):

| Lives | Types |
| ---: | --- |
| 1 | Tamago, Salmon |
| 2 | Squid, Shrimp, Tuna |
| 3 | Mackerel, Hotate |
| 4 | Ikura, Uni |
| 5 | Wagyu |

## Infinite mode (after round 10)

Optional **Continue · Infinite** keeps the same map and towers. Each **infinite round** reuses the **round 10** wave as a template, with scaling from `src/js/data.js` (stacked on your difficulty multipliers):

| Lever | Rule (k = infinite round index, starting at 1) |
| --- | --- |
| Enemy HP | × `1.10^(k−1)` (+10% compound per infinite round) on top of difficulty HP |
| Speed | × `min(2, 1 + (k−1)/19)` — **2×** at **k = 20** (display round **30**), then cap |
| Kill money | × `max(0.1, 0.7 × 0.9^(k−1))` — 70% at first infinite round, then 10% less per round, floor 10% (Tanuki after) |
| Spawn interval | × `max(0.65, 0.985^(k−1))` on top of difficulty spawn mult |
| Extra body | Every **3rd** infinite round (`k % 3 === 0`), **+1** spawn on the largest wave in the template |
| Round-end bonus | `getRoundBonus(10) + 5×(k−1)` for the infinite round just cleared |

The sidebar shows **Round N · ∞** where N continues past 10. **Rounds Survived** on game over counts full waves cleared, including infinite rounds.

## Audio

Starts **muted**. Toggle with the speaker or **M** (keyboard). BGM can run across title, map, difficulty, and gameplay when unmuted.

## Mobile implementation notes (dev)

- Input is **Pointer Events** when available (mouse + touch + pen); older browsers fall back to mouse + touch listeners on the canvas.
- Canvas uses **`touch-action: none`** so drags don’t scroll the page. **`overscroll-behavior: none`** and **`touch-action: manipulation`** on `body` reduce accidental scroll/zoom behavior (see `src/index.html`).
- Layout uses **`visualViewport`** when present so scaling tracks mobile browser chrome.
- Internal resolution stays **960×640**; CSS scales the canvas to fit the screen. **`getViewportState()`** in `src/js/main.js` exposes `landscape`, `touchHandheld`, and `compactSidebar`; gameplay passes that object into `src/js/ui.js` for sidebar metrics, Start Wave geometry, and hit-testing. **`fitCanvas`** uses smaller outer padding in landscape on coarse pointers.
- **Audio** and **back** controls read the viewport in `ui.js` for slightly larger hit targets in **landscape + coarse** mode.

See the root **[README](../README.md)** for run, test, and deploy instructions.
