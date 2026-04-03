# Existing Project Intake — Nigiri TD (Sprite v2)

## Header

- Project: Nigiri TD
- Owner: Producer
- Date: 2026-04-01
- Requested outcome: v2 pass on tower and enemy sprites — face-only animal designs, larger sprite sizes within cells
- Active platform profile: Browser-first (`docs/contracts/platforms/browser-first.md`)

## Current Playable State

Nigiri TD is a fully playable, approved browser-based tower defense game with a complete audio layer added in the last cycle. The game loop works end-to-end: title screen → prep phase → wave phase → round resolution → win/loss → return to title. It ships 10 tower types with 3 upgrade tiers each, 20 nigiri types, 10 rounds on one map ("Kaiten Corner"), a working economy, life system, canvas-only kawaii sprites, and 14 procedural SFX + 1 BGM loop via Web Audio API.

**Current sprite problem**: Tower and enemy sprites are too small relative to their 64×64 grid cells. Tower drawing functions use `const s = size * 0.5` internally, and towers are rendered at `CELL_SIZE * 0.9` (57.6px), yielding an effective head radius of ~11px. At that size, kawaii details (eyes, mouth, blush, whiskers, ears) are barely readable. Full-body animal sprites (head + body + limbs) compress every feature into roughly 28×36 pixels of active drawing area. Enemies use `const s = size * 0.45` (28.8px effective), making topping details ~16px wide.

## Docs Reviewed

| Doc | Path | Notes |
| --- | --- | --- |
| Game spec | `docs/project/02-game-spec.md` | Core mechanics unchanged; tower/enemy data untouched |
| Visual direction | `docs/project/03-visual-direction.md` | States animals should fit ~48×48 in 64×64 cell; current code draws much smaller than that |
| v2 audio work order | `docs/project/01-work-order.md` (NTD-002) | Audio cycle — no sprite changes |
| Build notes (audio) | `docs/project/05-build-notes.md` | Audio build — sprite code untouched |
| Future directions | `docs/project/09-future-directions.md` | No sprite-related items listed; this is a new user request |

## Code Areas Reviewed

| Module | Path | Relevance to Requested Change |
| --- | --- | --- |
| `sprites.js` | `src/js/sprites.js` | **Primary target** — all 10 `draw<Animal>` functions, `drawNigiri`, shared helpers (`kawaiiEyes`, `kawaiiMouth`, `blush`). Every tower function uses `const s = size * 0.5` and draws head + body + ears + details. |
| `ui.js` | `src/js/ui.js` | Renders towers at `CELL_SIZE * 0.9` (line 105), enemies at `CELL_SIZE` (line 97). Shop icons at size `36` (line 308). Selected tower info at size `40` (line 339). Placement preview at `CELL_SIZE * 0.9` (line 161). |
| `main.js` | `src/js/main.js` | Title screen renders towers at sizes 64, 64, 72 and nigiri at size 50 (lines 169–176). |
| `data.js` | `src/js/data.js` | `CELL_SIZE = 64`. No sprite sizing constants — sizes are passed at call sites. |
| `entities.js` | `src/js/entities.js` | No sprite code; uses `CELL_SIZE` only for movement/range math. |
| `effects.js` | `src/js/effects.js` | Particles and floating text — no sprite dependency. |

## Current Run And Test Commands

- Run: `cd src && python3 -m http.server 3000`, then open http://localhost:3000
- Test: Manual browser testing + Playwright automation (Playwright installed as project dependency)

## Known Bugs And Quality Gaps

- Sprites are the identified quality gap — too small, details lost at game resolution
- Visual direction brief specifies ~48×48 animal sprites; code draws effectively ~28×36
- No known gameplay bugs related to this change

## Artifact Status

| Artifact | Status | Notes |
| --- | --- | --- |
| `00-existing-project-intake.md` | `refresh_required` | This document replaces the audio-cycle intake |
| `01-work-order.md` (NTD-002) | `out_of_scope` | Audio work order — historical record for that cycle |
| `02-game-spec.md` | `reusable` | Core mechanics unchanged; sprite sizes are a rendering concern not a game design concern |
| `03-visual-direction.md` | `refresh_required` | Sprite design approach changes from full-body to face-only; sizing rules change. Targeted update only — layout, palette, typography, interaction feedback all remain valid. |
| `04-implementation-plan.md` | `refresh_required` | Needs targeted update for sprite code changes |
| `05-build-notes.md` | `refresh_required` | New build notes after sprite implementation |
| `06-test-verdict.md` | `refresh_required` | New test covering visual quality + regression |
| `07-mock-player-memo.md` | `refresh_required` | New feel assessment with updated sprites |
| `08-release-summary.md` | `out_of_scope` | Audio-cycle release decision — historical record |
| `09-future-directions.md` | `reusable` | Still valid; sprite improvements can be noted in new release summary |

## Recommended Loop Scope

**Artifacts to refresh:**
- Work order (new, scoped to sprite v2)
- Visual direction (targeted update — sprite design section only)
- Implementation plan (targeted update — sprite code changes only)
- Build notes (new, after sprite implementation)
- Play Tester verdict (new, focused on visual quality + regression)
- Mock Player memo (new, assessing visual feel)
- Release/backlog summary (new)

**Areas to leave untouched:**
- Game spec (02) — no mechanic changes
- All gameplay logic (tower stats, enemy stats, economy, rounds, map)
- Audio system (`audio.js` and all audio trigger wiring)
- Input handling system
- Screen transition logic
- Canvas layout (960×640, 640 game area, 320 sidebar)
- Grid constants (`CELL_SIZE`, `GRID_COLS`, `GRID_ROWS`, offsets)

**Regression risks:**
- Larger sprites may overlap with HP bars, floating damage text, or range circles
- Shop icons at size 36 and selected info at size 40 will need face-only variants too, or the proportions will look wrong
- Title screen decorative sprites use custom sizes (50, 64, 72) — need to work at those sizes too
- Placement ghost preview must stay readable at the new size
- Idle bob animation (1.5px vertical) should still look natural with larger sprites

## Next Owner

- Producer (write the work order)
