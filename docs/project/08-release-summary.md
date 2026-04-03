# Release Summary — Sprite v2 (NTD-003)

## Header

- Project: Nigiri TD
- Artifact: Release/backlog summary
- Status: `approved`
- Owner: Producer
- Date: 2026-04-01

## Release Decision

**Approved.**

### Evidence Basis

**Play Tester verdict: `approved`**
- 0 console errors across all automated test scenarios
- State flow verified: title → gameplay → wave → round end → next round prep
- No clipping, overflow, or visual defects found
- All 10 tower faces readable at 36px (shop), 40px (info panel), and 60.8px (grid)
- Nigiri plates larger and clearly visible on belt
- No regressions: all gameplay mechanics, audio, input, and screen transitions preserved
- Only unmodified code paths skipped in testing (game over/victory overlays, keyboard shortcuts) — low risk

**Mock Player verdict: `safe to approve`**
- Clear visual quality improvement — animals now read as actual characters
- Tower shop browsing experience improved — faces identifiable without text labels
- Larger placement preview makes placing towers more satisfying
- No gameplay impact from the visual change
- Minor polish notes (octopus readability, monkey/tanuki differentiation) — advisory, not blocking

## Delta From Previous Release

| Area | Before (post-audio v1) | After (sprite v2) |
| --- | --- | --- |
| Tower sprites | Full-body kawaii animals at ~28×36px effective | Face-only at ~46×52px effective |
| Tower grid size | `CELL_SIZE * 0.9` (57.6px) | `CELL_SIZE * 0.95` (60.8px) |
| Nigiri scale | `size * 0.45` (~29px plate) | `size * 0.7` (~45px plate) |
| Attack eyes | Horizontal bar | V-shaped squint lines |
| Attack mouth | Small half-circle | Larger open mouth with tongue |
| Dragon attack | Fire cone from mouth | Fire + inner glow trapezoids |
| Helper functions | Smaller proportions | Adjusted for face-only scale |

## Files Changed

| File | Change |
| --- | --- |
| `src/js/sprites.js` | Full rewrite of 10 draw functions + helpers + nigiri scale |
| `src/js/ui.js` | 2 lines: tower render size 0.9 → 0.95 |

## Files Unchanged (preserved)

`data.js`, `entities.js`, `game.js`, `main.js`, `input.js`, `audio.js`, `effects.js`, `index.html`

## Backlog

### P0 (from this cycle)

None — no blockers.

### P1 (from evaluator feedback)

1. Octopus readability: add outline/shadow to make tentacle fringe more visible (Mock Player)
2. Monkey/Tanuki differentiation: increase color contrast or feature prominence (Mock Player)

### P2 (future considerations from evaluator feedback)

3. Tier-specific face variants: visual upgrades on tier 2/3 (crown, sparkle, expression change) (Mock Player)
4. Attack lean animation: face translates toward target during attack (Mock Player)

### Pre-existing backlog (from previous cycles)

5. Longer BGM loop (16s → 30s)
6. Louder waste SFX
7. Title screen ambient audio
8. Speed controls (1×/2×/3×)
9. Tower stat preview on hover
10. Wave preview labels

## Next Owner

- User (task complete)
