# Lessons Learned

## Belt Corner Arc Orientation (CRITICAL — failed 3 times)

**Pattern:** When rendering conveyor belt corner tiles, the arc center and roller orientation gets confused repeatedly.

**The correct configuration is:**
- **Straight tiles (H/V):** Roller lines are PERPENDICULAR to flow direction.
  - Horizontal belt → vertical roller lines
  - Vertical belt → horizontal roller lines
- **Corner tiles:** Arc center at the INNER corner of the turn (where the belt path curves), NOT the outer corner where rails meet. This creates flow-parallel curve lines.
  - `corner-lb` (left+bottom open): inner corner = bottom-left → center `(x, y+size)`, arc `1.5π → 2π`
  - `corner-lt` (left+top open): inner corner = top-left → center `(x, y)`, arc `0 → 0.5π`
  - `corner-rb` (right+bottom open): inner corner = bottom-right → center `(x+size, y+size)`, arc `π → 1.5π`
  - `corner-rt` (right+top open): inner corner = top-right → center `(x+size, y)`, arc `0.5π → π`

**Why it keeps breaking:** The terms "inner" and "outer" are ambiguous when thinking about corners. The INNER corner is where the belt's center-line turns — it's the corner on the SAME side as the open edges. The OUTER corner is where the two rails meet — it's the corner on the side with closed/rail edges.

**Rule:** If you ever touch belt corner rendering, run the belt orientation test (`tests/belt-orientation.test.mjs`) and verify visually that corner arcs curve TOWARD the open edges, not toward the rails.

## Belt Animation Direction Must Match Travel Direction

**Pattern:** The roller line animation scrolls in a fixed direction (positive offset) regardless of which way the belt actually travels. On rows where the belt goes right→left, the rollers visually scroll left→right, which looks wrong.

**Root cause:** `drawBeltTile` used `(time * 25) % spacing` as the animation offset for all tiles. This always moves rollers rightward (for H) or downward (for V). But the serpentine belt path alternates: row 0 goes right, row 2 goes left, row 4 goes right, etc.

**The fix:**
- `getBeltFlowDir(col, row)` returns `+1` (right/down) or `-1` (left/up) based on the NEXT cell in `MAP_PATH`.
- For the last cell, direction is computed from the PREVIOUS cell (from→current, not current→next) to avoid inverting.
- `drawBeltTile` accepts a `flowDir` parameter and uses `((time * 25 * flowDir) % spacing + spacing) % spacing` to animate in the correct direction. The double-modulo handles negative values from JS's `%` operator.

**Rule:** Any belt animation must respect flow direction. Never hardcode a single animation offset for all belt tiles. Run `tests/belt-orientation.test.mjs` which now includes flow direction assertions for every row.

## Shop Icon Clipping in Tower Buttons (failed 2 times)

**Pattern:** Tower sprites in the shop buttons get clipped against the button's left edge because the icon center is too close to the edge.

**Root cause:** `drawTower` scales sprites by aspect ratio. Wide sprites (monkey ears, dragon wings) have `drawW = size * aspect` which can exceed `2 * iconX_offset`, causing the left side to clip against the button boundary.

**The correct configuration is:**
- `iconX = x + 34` (34px from left edge of button)
- `iconSize = 38` (fits within 46px shop item height)
- At worst-case aspect ratio ~1.4: `halfW = 38 * 1.4 / 2 = 26.6px`, so left edge = `34 - 26.6 = 7.4px` inside the button. Safe.

**Rule:** When changing shop icon position or size, run `tests/sidebar-layout.test.mjs` which validates the icon fits within the button at worst-case aspect ratios. Never set `iconX` below 30 or `iconSize` above 40 for 145px-wide shop items.

## Enemy movement must use the active map path (not Kaiten globals)

**Pattern:** After adding multi-map support, nigiri still visually followed the classic Kaiten snake while the belt art showed the new layout.

**Root cause:** Enemy movement used a module-level path (e.g. `MAP_PATH` / `KAITEN_PATH`) or a stale closure, instead of `MapContext.getEnemyPath()` at spawn time. Rendering correctly switched to `game.mapCtx`, so the bug looked like “sprites ignore the new conveyor.”

**The correct wiring:**
- `GameState.reset(mapId)` builds `this.mapCtx = new MapContext(getMapById(mapId))`.
- `startWave()` sets `pathProvider = () => this.mapCtx.getEnemyPath()` and passes it to `EnemySpawner`.
- Each `new Enemy(id, this.pathProvider())` stores that array on `enemy.mapPath`; `_updatePosition()` must read only `this.mapPath`, never an imported global path.

**Rule:** When changing map or path logic, run `npm test` (includes `tests/enemy-path.test.mjs`). Do not use `MAP_PATH` for runtime enemy movement on non-Kaiten maps; keep `MAP_PATH` only as a backward-compatible export aligned with the Kaiten definition.

## Map select: prefer more columns than rows on a short canvas

**Pattern:** With six maps, a **2×3** card grid (two columns) needs three rows; card height × rows exceeds the vertical band between the title and footer on `CANVAS_HEIGHT` 640, so cards overflow.

**Rule:** Use **`MAP_SELECT_COLS = 3`** (3×2) unless canvas height or card sizes change. Keep `tests/map-select-layout.test.mjs` in sync with `getMapCardRects()` in `main.js`. Details: `tests/lessons.md`.
