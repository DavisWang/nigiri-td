# Review Verdict — Sprite v2 (Face-Only Towers + Larger Nigiri)

## Header

- Reviewer: Play Tester
- Artifact reviewed: Sprite v2 build (NTD-003)
- Date: 2026-04-01
- Verdict: `approved`

## Blocking Findings

None.

## Non-Blocking Findings

- Game over and victory overlay rendering was not screenshot-tested. These overlays use `drawButton` and canvas text only — no tower or nigiri sprites. The overlay code (`renderOverlay` in `ui.js`) was not modified. Low regression risk.
- Selected tower info panel renders the tower face at 40px (`drawTower` at size 40, `ui.js` line 339). Not directly screenshot-verified, but shop icons at 36px render correctly, so 40px will work at least as well.
- Keyboard shortcuts (U, S, Escape, M) were not exercised in automation. `input.js` was not modified. Low regression risk.
- The second Cat tower in combat screenshots shows a pinkish background tint — this is from the Cat still being selected in the shop placement mode (existing behavior, not a regression).

## Session Coverage

- Startup path covered: yes — page loads, title screen renders, no console errors
- Title, menu, and transition path covered: yes — title → New Game → gameplay prep → wave → round end → prep for round 2
- First-session gameplay minutes covered: yes — tower placement, wave start, combat, money earning, round progression all verified
- Retry, fail, or recovery path covered: no — game over and victory overlays not tested (unmodified code paths)

## Navigation And State Flow

- Title screen → gameplay: correct. New Game click transitions to prep phase.
- Prep → wave: correct. Space key starts wave, enemies spawn on belt.
- Wave → prep: correct. Round 1 clears, transitions to Round 2 prep with correct wave preview ("x6 x4").
- Round counter increments correctly (1/10 → 2/10).
- Money updates correctly: $200 start → $150 after Cat → $100 after 2nd Cat → $140 after kills → $200 after round bonus.

## UI And Visual Sanity

- **No clipping**: Tower faces stay within 64×64 cell boundaries at all rendered sizes (36px shop, 60.8px grid, 64/72px title screen). No sprite extends beyond cell edges.
- **No overlap**: Tower faces do not overlap adjacent cells, belt, or each other.
- **Readable shop icons**: All 10 tower faces distinguishable at 36px in the sidebar shop. Cat (orange, ears), Tanuki (brown, dark patches), Penguin (blue/white), Fox (orange-red, tall ears), Monkey (brown, side ears), Owl (brown, tufts), Octopus (pink, dome), Shiba (gold, ears), Bear (dark brown), Dragon (green) — all identifiable.
- **Larger nigiri**: Tamago plates clearly visible on the belt at the new scale (~45px wide vs ~29px v1). Plate, rice, and topping layers all visible.
- **Placement preview**: Ghost tower renders as semi-transparent face-only at correct size with range circle.
- **Selection highlight**: Yellow cell highlight renders behind selected tower correctly.
- **HUD elements**: Life hearts, money, round counter, wave preview — all render correctly (unmodified code).
- **Audio toggle**: Speaker icon visible in bottom-left corner (unmodified).

## Playability And Balance Sanity

- Tower placement works correctly with face-only sprites. Placement mode highlights valid cells green, shows ghost preview, deducts money on placement.
- Towers attack enemies within range — verified by money increasing from kill rewards.
- Economy functions correctly: Cat costs $50, two placed = $100 spent from $200. Kill rewards and round bonus reflected in money display.
- The face-only design does not affect gameplay balance in any way — tower stats, ranges, and attack speeds are unchanged (verified in `data.js` and `entities.js`, both unmodified).

## Baseline And Regression Check

**Expected preserved behavior:**
- All gameplay mechanics (tower stats, economy, rounds, map) — **preserved** (data.js, entities.js, game.js unmodified)
- All audio (BGM, 14 SFX, toggle, localStorage) — **preserved** (audio.js unmodified)
- All input handling (mouse, keyboard, M key) — **preserved** (input.js unmodified)
- Screen transitions — **preserved** (main.js unmodified)
- Canvas layout (960×640, 640 game area, 320 sidebar) — **preserved** (data.js constants unmodified)

**Regressions found:** None.

**Code change surface:**
- `sprites.js`: All 10 `draw<Animal>` functions rewritten (face-only), helper functions updated, `drawNigiri` scale increased. Non-tower drawing functions (`drawHeart`, `drawCoin`, `drawButton`, `drawGarbageBin`, `drawKitchenDoor`, `drawSeatIndicator`, `drawTierStars`, `drawSpeakerIcon`) unchanged.
- `ui.js`: Two call-site size changes (lines 105 and 161, `CELL_SIZE * 0.9` → `CELL_SIZE * 0.95`). No logic changes.

## Evidence

- `docs/project/screenshot-title.png` — Title screen with face-only towers and larger nigiri
- `docs/project/screenshot-gameplay-prep.png` — Prep phase view
- `docs/project/screenshot-towers-placed.png` — Cat and Tanuki faces on grid
- `docs/project/screenshot-enemies-visible.png` — Tamago enemies on belt (no towers, larger plate scale)
- `docs/project/screenshot-enemies-late.png` — Enemies further along belt path
- `docs/project/test-selected-tower.png` — Selected tower with highlight and range circle
- `docs/project/test-placement-preview.png` — Placement ghost preview at new size
- `docs/project/test-combat-attack.png` — Combat with attack state visible
- `docs/project/test-round-end.png` — Round 2 prep after round 1 completion
- Automated console error check: 0 errors across all test scenarios

## Required Changes

None.

## Next Owner

- Mock Player
