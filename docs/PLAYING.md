# Playing Nigiri TD (current build)

## What you’re doing

Conveyor sushi heads toward the trash. You place **animals** on buildable seats next to the belt; they eat plates that roll past. **Lives** drop when plates escape; **money** buys more animals and upgrades. Clear **10 rounds** to win.

## Flow

**Title** → **Map** → **Difficulty** (Easy / Intermediate / Hard) → **Gameplay** → title or retry on game over / victory.

- **How to Play** on the title is optional flavor text plus a tiny belt vignette.
- **Test Mode** (title) starts map select with lots of cash for experimenting.
- **Crossroads** map includes extra starting money (see `startingMoneyBonus` in `data.js`).

## Controls

### Mouse / trackpad (desktop)

- **Click** — menus, map cards, difficulty, shop, grid, **Start Wave**, overlays, mute, round **back** (top-left in map/difficulty/play).
- **Keyboard** (optional): **Space** start wave, **Esc** deselect / back on menus, **U** / **S** upgrade / sell selected tower, **M** mute, **1–4** map quick-pick, **1–3** difficulty quick-pick.

### Touch (iPhone / iPad)

- **Tap** = click. All UI is tap-driven; **no keyboard required**.
- **Drag** on the canvas updates the “cursor” position for hovers (shop highlights, tower range preview, etc.).
- **Mute** is the speaker icon **bottom-left**. **Back** is the **round arrow top-left** on map select, difficulty select, and in-game (hidden on game-over / victory overlays).
- **iOS tip:** Add to Home Screen for a fuller-screen experience. **Unmute** once after a tap so Web Audio can start (browser rule).

## Difficulty (per run)

| Mode           | Effect |
| -------------- | ------ |
| Easy           | Baseline enemy HP and spawn timing. |
| Intermediate   | **+25%** enemy HP. |
| Hard           | **+25%** HP and **10%** faster spawns (shorter interval). |

Global tower and enemy definitions in `ENEMY_DATA` / `TOWER_DATA` are unchanged; only multipliers for that run apply.

## Audio

Starts **muted**. Toggle with the speaker or **M** (keyboard). BGM can run across title, map, difficulty, and gameplay when unmuted.

## Mobile implementation notes (dev)

- Input is **Pointer Events** when available (mouse + touch + pen); older browsers fall back to mouse + touch listeners on the canvas.
- Canvas uses **`touch-action: none`** so drags don’t scroll the page.
- Layout uses **`visualViewport`** when present so scaling tracks mobile browser chrome.
- Internal resolution stays **960×640**; CSS scales the canvas to fit the screen.

See the root **[README](../README.md)** for run, test, and deploy instructions.
