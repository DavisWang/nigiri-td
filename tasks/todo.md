# Multi-map status

## Shipped maps (4)

Map select offers **Kaiten Corner** (classic snake), **The Fork** (branching), **The Spiral** (compact single path), and **The Crossroads** (+ intersection). Each map has **10 rounds** in `src/js/data.js` (see `docs/project/10-round-difficulty-proposal.md` for layout-specific difficulty notes).

**Removed:** Belt Switch (dynamic path that shortened after round 3). All `type: 'dynamic'` engine support, `switchAtRound`, deactivated-belt UI, and related tests were deleted with that map.

## Reference — approved layouts (design preview)

| # | Name | Type | Notes |
|---|------|------|-------|
| 1 | The Fork | branching | Two routes, random per enemy |
| 3 | The Spiral | single | Short path |
| 4 | The Crossroads | cross | Center visited twice |
| — | Kaiten Corner | single | Default snake |

See `src/map-preview.html` for Fork / Spiral / Cross diagrams (Kaiten matches the classic path in `data.js`).

## Verification

- `npm test` — path wiring, belt orientation, sidebar layout
- Manual: map select → each map → full round loop

## Review

- [x] Belt Switch map and dynamic-path code removed
- [ ] Re-run manual pass on all four maps after further changes
