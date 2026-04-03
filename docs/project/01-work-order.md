# Work Order — Nigiri TD Sprite v2

## Header

- Project: Nigiri TD
- Work order ID: NTD-003
- Requester: User
- Owner: Producer
- Project mode: Existing project (targeted loop)
- Phase: Brownfield work order
- Active platform profile: Browser-first

## Objective

Redesign tower (animal) sprites to be face-only and increase the rendered size of both tower and enemy sprites relative to their 64×64 grid cells. The current full-body animals compress kawaii details into ~28×36 pixels of active drawing area, losing readability. Face-only designs at larger sizes will make each animal recognizable and cute at game resolution. All existing gameplay, audio, controls, and screen layout must remain unchanged.

## Requested Change

1. **Face-only tower sprites** — Redesign all 10 tower `draw<Animal>` functions to render only the animal's face (head circle, ears/horns/distinctive features, eyes, mouth, blush). No body, no limbs, no tail. The face should fill most of the available draw area.
2. **Larger tower rendering** — Increase the effective tower drawing size on the grid. Towers must not clip beyond their 64×64 cell boundary.
3. **Larger enemy rendering** — Increase the effective nigiri drawing size on the grid. Enemies must not clip beyond their 64×64 cell boundary.
4. **Approval gate** — Output a sprite sheet image showing all v2 tower and enemy sprites at game resolution for user approval before any code changes are made.

## Sprite Design Direction

### Towers (Face-Only)

Each animal face should:
- Fill approximately 52–56px diameter within the 64px cell (leaving 4–6px padding)
- Use the same color palette from `03-visual-direction.md` (primary, accent, eye color per animal)
- Retain kawaii features: large round shiny eyes (~30% of face), simple curved mouth, blush marks
- Use ears, horns, beaks, or other head features as the primary species identifier
- Show `idle` and `attack` state variations (attack = squinty eyes, open mouth)
- Maintain visual consistency with each other — same eye style, same proportioning rules

### Enemies (Nigiri)

Each nigiri plate should:
- Scale up from `size * 0.45` to approximately `size * 0.7` effective plate size
- Maintain the existing design language: oval plate → rice bed → topping → tier-color rim
- HP bar, crack effect, and marbling details should scale proportionally
- Stay within the 64px cell boundary including the HP bar above

### Rendering Call Sites

| Call site | Current size | Proposed size |
| --- | --- | --- |
| Tower on grid (`ui.js` line 105) | `CELL_SIZE * 0.9` (57.6px) | `CELL_SIZE * 0.95` (60.8px) |
| Enemy on grid (`ui.js` line 97) | `CELL_SIZE` (64px) | `CELL_SIZE` (64px, no change — internal scale increases) |
| Tower shop icon (`ui.js` line 308) | `36` | `36` (face-only looks better at small sizes) |
| Selected tower info (`ui.js` line 339) | `40` | `40` (face-only looks better at small sizes) |
| Title screen towers (`main.js` lines 174–176) | `64`, `64`, `72` | No change — face-only naturally fills these |
| Title screen nigiri (`main.js` line 169) | `50` | `50` (internal scale increase applies) |
| Placement preview (`ui.js` line 161) | `CELL_SIZE * 0.9` | `CELL_SIZE * 0.95` |

## Existing Behavior To Preserve

- All gameplay mechanics (tower stats, enemy stats, economy, rounds, map, life)
- All audio (BGM, 14 SFX, toggle, localStorage)
- All input handling (mouse, keyboard shortcuts, M key)
- Screen transitions (title → gameplay → game over/victory → title)
- Canvas-only rendering rule
- Idle bob animation on towers (1.5px sine wave)
- Enemy bob animation (1.5px sine wave)
- Attack animation state switching (idle ↔ attack)
- HP bar positioning relative to enemy sprite
- Floating damage text positioning
- Range circle rendering
- Placement preview ghost rendering
- Tower selection highlight
- Slow/stun visual effects on enemies

## In Scope

- Rewrite all 10 `draw<Animal>` functions in `sprites.js` to face-only design
- Increase internal scale factor in `drawNigiri` from `size * 0.45` to `size * 0.7`
- Increase tower grid rendering size from `CELL_SIZE * 0.9` to `CELL_SIZE * 0.95`
- Update shared helper functions (`kawaiiEyes`, `kawaiiMouth`, `blush`) if proportions need adjusting
- Update placement preview rendering size to match
- Generate a sprite sheet image for approval before code changes

## Out Of Scope

- Changes to any game mechanic, tower stat, enemy stat, or economy value
- Changes to CELL_SIZE, grid dimensions, or canvas layout
- Changes to audio system
- New tower types or enemy types
- Sprite sheet asset files (sprites remain canvas-drawn procedurally)
- Sidebar layout changes beyond what naturally flows from the sprite redesign
- Title screen layout changes

## Inputs

- This work order
- Existing-project intake (`00-existing-project-intake.md`)
- Visual direction brief (`03-visual-direction.md`) for palette and style rules
- Current `sprites.js` source for existing drawing code
- Current `ui.js` source for call-site sizing

## Artifact Status Inputs

| Artifact | Status | Notes |
| --- | --- | --- |
| `02-game-spec.md` | `reusable` | Core mechanics unchanged |
| `03-visual-direction.md` | `refresh_required` | Sprite design section needs update from full-body to face-only |
| `04-implementation-plan.md` | `refresh_required` | Needs sprite code change plan |
| `05-build-notes.md` | `refresh_required` | New build notes after implementation |
| `06-test-verdict.md` | `refresh_required` | New test covering visual quality + regression |
| `07-mock-player-memo.md` | `refresh_required` | New feel assessment with updated sprites |

## Required Outputs

- Sprite sheet image showing all 10 face-only tower sprites and representative nigiri sprites at game resolution (for user approval)
- Updated `draw<Animal>` functions in `sprites.js` (after approval)
- Updated `drawNigiri` internal scale (after approval)
- Updated call-site sizes in `ui.js` (after approval)
- Build notes for the sprite work
- Play Tester verdict covering visual quality and regression
- Mock Player memo assessing visual feel

## Constraints

- Sprites must not clip beyond 64×64 cell boundaries
- Face-only design — no body, no limbs
- Same color palette as `03-visual-direction.md`
- Canvas 2D primitives only (arcs, curves, fills, strokes)
- Each animal must be visually distinct and recognizably "that animal" with kawaii features
- Attack state must be distinguishable from idle state
- Sprites must look good at all used sizes: 36px (shop), 40px (info), ~60px (grid), 50–72px (title screen)

## Escalation Boundary

**Owner (Visual/Interaction Designer + Game Developer) may decide alone:**
- Exact proportions within the face (eye size, ear height, cheek position)
- Specific canvas drawing commands and path shapes
- Minor color adjustments within the established palette
- HP bar offset adjustments for larger nigiri

**Escalate to Producer/User if:**
- Face-only design cannot make an animal recognizable (species identification fails)
- The larger size creates visual overlap with adjacent cells despite the constraint
- Nigiri HP bar or damage text positioning breaks with the new sizes
- The style feels materially different from the kawaii direction (tone change)

## Done When

- Sprite sheet is generated and approved by the user
- All 10 tower sprites are face-only and render at the new size
- All nigiri sprites render at the new internal scale
- Each animal is visually distinct and recognizable at 36px, 40px, and 60px
- Sprites do not clip beyond cell boundaries
- Attack and idle states are visually distinct
- No regressions in gameplay, audio, controls, or performance
- Play Tester and Mock Player have reviewed the visual update

## Next Owner

- Visual/Interaction Designer (generate sprite sheet for approval)
