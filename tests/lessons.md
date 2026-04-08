# Test-related lessons (Nigiri TD)

Patterns to remember when changing UI layout so `npm test` and manual checks stay meaningful.

## Map select grid vs canvas height

- **Symptom:** Map cards clip at the bottom or overlap the footer hint on the map-select screen.
- **Cause:** `MAP_SELECT_COLS = 2` yields **three rows** for six maps. With `CARD_H = 210` and `CARD_GAP = 14`, total grid height is **658px**, but the layout only reserves **~536px** between the title band and the footer (`headerBottom` 56 → `footerTop` `CANVAS_HEIGHT - 48`).
- **Fix:** Prefer **3 columns × 2 rows** (`MAP_SELECT_COLS = 3`) so total height is **434px**, which fits the band.
- **Guard:** Run `node tests/map-select-layout.test.mjs` (included in `npm test`). If you add maps or change card size, update **both** `src/js/main.js` and `tests/map-select-layout.test.mjs` constants in lockstep.

## General rule

When adding maps or resizing map cards, re-check **width** (≤ `CANVAS_WIDTH`) and **height** (≤ `FOOTER_TOP - HEADER_BOTTOM`) using the same formulas as `getMapCardRects()`.

## Belt roller direction on the last path cell

- **Symptom:** Exit tile rollers animate opposite to the tile before it (obvious on **perimeter** where exit `(0,1)` follows `(0,2)` vertically).
- **Cause:** `MapContext._recompute` only set `_flowDirs` when a segment had a **`next`** cell. The final cell had no `next`, so `getBeltFlowDir` used **`|| 1`**, which is wrong for upward or leftward arrivals.
- **Fix:** If there is no `next` but there is **`prev`**, set flow from **`prev → p`** (same convention as travel into that cell). Run `tests/belt-flow-dir.test.mjs`.

## Shiba aura rules

- **Manhattan** range: T1 cap **1**, T2/T3 cap **2** (`shibaAuraManhattanLimit`). Logic lives in `entities.js` with `pickBestShibaAuraSource` (no multi-Shiba stacking on one tower).
- **Guard:** Run `tests/shiba-aura.test.mjs`. Tie-break tests need Shibas actually **in range** of the recipient (T1 cannot reach Manhattan 2).
