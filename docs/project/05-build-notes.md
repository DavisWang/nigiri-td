# Build Notes — Sprite v2 (Face-Only Towers + Larger Nigiri)

## Header

- Project: Nigiri TD
- Artifact: Build notes
- Status: `ready_for_review`
- Source: Work order NTD-003
- Owner: Game Developer

## Run

```
cd src && python3 -m http.server 3002
# Open http://localhost:3002
```

## What Changed

### `src/js/sprites.js` — Full rewrite of drawing functions

**Tower sprites (10 animals) — face-only v2:**
- Removed all body, limb, and tail drawing code from every `draw<Animal>` function
- Each animal is now a large circular face with species-specific features:
  - `r = size * 0.38` base face radius (vs old `size * 0.5 * 0.4 = size * 0.2`)
  - Face fills ~52–56px diameter at grid rendering size (vs ~28–36px v1)
  - Vertical offset `fcy = cy + r * 0.15` for eared animals centers the face+ears within the cell
- Species identification through head features only:
  - Cat: pointed ears + inner ear color + whiskers
  - Tanuki: rounded ears + dark eye mask patches
  - Penguin: no ears, dark blue with white face area + orange beak
  - Fox: tall pointed ears (taller than cat) + white inner ear
  - Monkey: round side ears with peach inner
  - Owl: ear tufts + cream facial disc circles + beak
  - Octopus: dome shape + tentacle fringe + magenta top knob
  - Shiba: triangular ears + white face pattern + black nose
  - Bear: round ears with lighter inner + oval nose
  - Dragon: three horn spikes + gold chin + fire effect on attack
- Attack state: all animals show V-shaped squint eyes (stroked lines) + open mouth. Dragon adds flame trapezoid below chin.

**Helper functions updated:**
- `kawaiiEyes`: larger eye radius (`size * 0.13` vs `0.11`), V-shaped attack eyes instead of simple bars
- `kawaiiMouth`: slightly larger mouth arc, adjusted vertical position
- `blush`: slightly larger blush marks, adjusted position for face-only proportions

**`drawNigiri` — larger scale:**
- Internal scale changed from `size * 0.45` to `size * 0.7`
- Plate width grows from ~29px to ~45px at game resolution
- HP bar position adjusted to `cy - s * 0.5` (from `cy - s * 0.55`) to keep within cell bounds
- Rice grain dots slightly larger (1.5px vs 1px radius)
- Ikura dots slightly larger (`s * 0.045` vs `s * 0.04`)
- All relative proportions (plate, rice, topping, marbling, crack, tier rim) preserved

**Unchanged exports:**
- `drawHeart`, `drawCoin`, `drawButton`, `drawGarbageBin`, `drawKitchenDoor`, `drawSeatIndicator`, `drawTierStars`, `drawSpeakerIcon` — identical to v1

### `src/js/ui.js` — Two call-site size changes

- Line 105: Tower grid rendering `CELL_SIZE * 0.9` → `CELL_SIZE * 0.95` (57.6px → 60.8px)
- Line 161: Placement preview `CELL_SIZE * 0.9` → `CELL_SIZE * 0.95`
- Shop icon size (36px) and selected info size (40px) unchanged — face-only naturally looks better at small sizes

### No changes to other files

- `main.js` — title screen tower sizes (64, 64, 72) and nigiri size (50) unchanged
- `data.js` — no constant changes
- `entities.js` — no changes
- `game.js` — no changes
- `effects.js` — no changes
- `input.js` — no changes
- `audio.js` — no changes
- `index.html` — no changes

## Architecture Notes

- Face-only design uses consistent structure across all 10 animals: `r = size * 0.38` for face radius, `fcy = cy + r * offset` for vertical centering, `fs = r * 2` passed to helper functions
- Nigiri internal scale increase is purely multiplicative — all relative proportions preserved, so the design language (plate → rice → topping) scales uniformly
- No new modules, no new dependencies, no new exports

## Known Compromises

- Monkey and Tanuki are both brown-toned. Distinguished by: Tanuki has dark eye mask patches + rounded top ears; Monkey has round side ears + peach face area
- Octopus tentacle fringe is subtle at grid size — the top knob and pink color are the primary identifiers
- Dragon flame only shows during attack state, which lasts 300ms per attack cycle

## Screenshot Evidence

- `docs/project/screenshot-title.png` — title screen with face-only towers (Cat, Penguin, Shiba) and larger nigiri on belt
- `docs/project/screenshot-towers-placed.png` — gameplay with Cat and Tanuki placed on grid
- `docs/project/screenshot-enemies-visible.png` — round 1 enemies (Tamago) traveling the belt at larger scale
- `docs/project/screenshot-enemies-late.png` — enemies further along the belt path, clearly visible
- `docs/project/screenshot-wave-action.png` — wave in progress with towers attacking
- `docs/project/screenshot-wave-combat.png` — combat gameplay

## Next Owner

- Play Tester
