# Future Directions — Nigiri TD (Post-Sprite v2)

## Current State

Nigiri TD now has face-only kawaii tower sprites filling ~52-56px of their 64px cells (up from ~28-36px full-body sprites), and nigiri plates scaled to ~45px (up from ~29px). All 10 animals are identifiable by head features alone (ears, eye masks, beaks, horns). The game ships with procedural audio (14 SFX + 1 BGM) and a complete 10-round gameplay loop.

## Quick Wins

| Idea | Why It Matters | Likely Owner |
| --- | --- | --- |
| Octopus outline/shadow | Tentacle fringe is subtle; a 1px darker stroke improves readability | Game Developer |
| Monkey/Tanuki color differentiation | Both brown-toned; increasing contrast reduces shop confusion | Game Developer |
| Longer BGM loop (30s) | Current 16s loop becomes noticeable after a few rounds | Game Developer |
| Louder waste SFX | Life-loss moments need to punch through combat noise | Game Developer |
| Speed controls (1×/2×/3×) | #1 pacing friction from v1 — TD veterans expect this | Game Developer |
| Tower stat preview on hover | Removes blind buying in the tower shop | Game Developer |

## Bigger Bets

| Idea | Why It Matters | Risk |
| --- | --- | --- |
| Tier-specific face variants | Upgrades feel more rewarding with crown/sparkle/expression change | Low — per-tier branch in draw functions |
| Attack lean animation | Face translates toward target, adding life to combat | Low — 5px translate in render call |
| Per-tower sound variation | Each animal with unique chomp pitch adds personality | Low — frequency table per tower ID |
| Separate music/SFX toggles | Power users want independent control | Low — two gain nodes already exist |
| Dynamic BGM layers | Intensity shifts between prep and wave phases | Medium — scheduling complexity |
| Targeting mode toggle | First/Last/Strongest adds strategy | Low — logic + small UI change |
| More maps | Additional belt layouts via `MAP_DEFINITIONS` | Low — content-first |
| Mid-run path change | e.g. gate opens, shortcut activates (removed “Belt Switch” map) | Medium — needs dynamic path state + UI again |
| Endless/survival mode | Post-round-10 content for replay depth | Medium — wave scaling, balance |

## Deferred Questions

- Should tier 2/3 upgrades change the face expression or add accessories?
- Would animated ear/tentacle/horn idle motion add enough cuteness to justify the complexity?
- Should boss enemies (Otoro Supreme) have a unique spawn animation or face on the plate?
- Would a "tower preview" mode that shows all 10 faces at full size improve the shop experience?

## Signals To Watch

- Do players notice the larger sprites immediately, or does it feel "expected"?
- Does the face-only design reduce the "cute factor" for players who liked the full-body look?
- Are Monkey and Tanuki confused in practice, or is the text label sufficient?
- Does the octopus read as an octopus or just "pink circle"?
