# Canonical Game Spec — Nigiri TD

## Header

- Project: Nigiri TD
- Artifact: Canonical game spec
- Status: `ready_for_review`
- Source: Work order NTD-001
- Owner: Game Designer

---

## Core Fantasy

You run a conveyor-belt sushi restaurant where the sushi is trying to escape. Seat hungry animals at the counter to eat every plate before it reaches the garbage bin at the end of the belt.

## Core Loop

1. **Prep phase** — the round has not started. Player reviews the upcoming wave preview (nigiri types and counts), places or upgrades towers, sells unwanted towers.
2. **Wave phase** — nigiri plates spawn at the entry and travel the conveyor belt toward the exit. Towers in range automatically attack (eat) passing plates.
3. **Resolution** — when all plates in the wave are eaten or have exited: award money for eaten plates, deduct life for escaped plates, grant round bonus, show round-end summary.
4. **Progression** — if life > 0 and rounds remain, return to prep phase. If life ≤ 0, trigger game over. If all 10 campaign rounds are cleared, show a **victory offer** (continue infinite or end run).

## Win and Loss Conditions

- **Campaign complete**: Clear all **10** rounds with life > 0. The player then chooses **End Run (Victory)** or **Continue · Infinite**.
- **Victory (end run)**: Confirms the 10-round clear; show stats and **Back to Title** (same overlay style as before).
- **Infinite mode**: No final win — waves keep coming with per-round scaling (HP, speed, kill money, spawn density, occasional +1 spawn, round bonus). Implementation: `phase === 'victory_offer'`, `infiniteMode`, helpers in `src/js/data.js` (`getInfiniteHpMult`, `buildInfiniteRoundData`, etc.).
- **Lose**: Life reaches 0 at any point during a wave.
- **Game over screen**: Show rounds survived (includes completed infinite rounds), total nigiri eaten, and **Try Again** → title.

## Controls

- **Mouse click** on tower shop item → select tower for placement.
- **Mouse click** on valid grid cell → place selected tower.
- **Mouse click** on placed tower → select it, show info panel (stats, upgrade button, sell button).
- **Upgrade button** or **U key** → upgrade selected tower (if affordable and not max tier).
- **Sell button** or **S key** → sell selected tower.
- **Start Wave button** or **Space** → begin the next wave.
- **Escape** → deselect current selection.
- Hover effects: highlight valid placement cells when a tower is selected; show range circle when hovering a placed tower.

## Screens

### Title Screen

- Centered game logo/title: "Nigiri TD"
- "New Game" button — opens **map select**; choosing a map starts round 1 on that layout
- Footer text: "By Pwner Studios"
- All text canvas-drawn

### Gameplay Screen

- **Left panel (game area)**: Grid map, conveyor belt, placed towers, nigiri plates, animations
- **Right sidebar**: Current life (hearts or bar), current money, round counter ("Round 3/10"), tower shop list (icon + name + cost), selected tower info panel (stats, upgrade cost, sell value)
- **Top bar** (within game area or above): Wave preview showing incoming nigiri types before the wave starts, Start Wave button
- **Game over overlay**: Drawn on canvas over the game area
- **Victory offer overlay**: After round 10 — short copy, **Continue · Infinite**, **End Run (Victory)**.
- **Victory overlay**: Drawn on canvas when the player ends the run after clearing 10 rounds.
- **Game over overlay**: Unchanged.

---

## Maps

Playable layouts (see `MAP_DEFINITIONS` in `src/js/data.js`): **Kaiten Corner** (classic serpentine belt), **The Fork** (random branch per enemy), **The Spiral** (short single path), **The Crossroads** (self-crossing path, center cell twice). There is **no** mid-run path swap; a former “Belt Switch” dynamic map was removed from the game.

### Map 1: "Kaiten Corner"

- Grid: 8 columns × 10 rows
- The conveyor belt enters at the top-left and exits at the bottom-right
- The belt snakes horizontally across the grid with 4 turns, creating 5 horizontal passes
- Cells occupied by the belt are not buildable
- Cells adjacent to the belt (sharing an edge) are valid tower seats
- Cells not adjacent to the belt are not buildable
- The entry cell shows a kitchen door sprite; the exit cell shows a garbage bin sprite

**Path layout** (conceptual — E = entry, G = garbage, → ← ↓ = belt direction, · = buildable seat):

```
Row 0:  E → → → → → → ↓
Row 1:  ·   ·   ·   ·   ·   ·   · ↓
Row 2:  ↓ ← ← ← ← ← ← ·
Row 3:  ↓   ·   ·   ·   ·   ·   ·   ·
Row 4:  · → → → → → → ↓
Row 5:  ·   ·   ·   ·   ·   ·   · ↓
Row 6:  ↓ ← ← ← ← ← ← ·
Row 7:  ↓   ·   ·   ·   ·   ·   ·   ·
Row 8:  · → → → → → → ↓
Row 9:  ·   ·   ·   ·   ·   ·   · G
```

The exact cell coordinates will be defined at implementation. The key constraints are:
- 5 horizontal passes with alternating direction
- Enough path length for meaningful tower interactions
- Plenty of adjacent seats for tower placement variety
- Supports strategic chokepoint and coverage decisions

### Extensibility

Maps are defined as data objects containing: grid dimensions, belt path (ordered list of cells), entry/exit positions, and a background theme name. Adding a map means adding a new data object — no code changes to the engine.

---

## Towers (Animals)

All towers are 1×1 for v1. Each has 3 tiers (base + 2 upgrades). Upgrade cost is the incremental cost to reach the next tier. Sell refund = 65% of total invested money.

Range is measured in tiles from tower center. Attack speed is the interval between attacks in milliseconds.

### Tower Roster

#### 1. Cat (Neko)
Fast, cheap generalist. Good early game.

| Stat | Tier 1 | Tier 2 (+50) | Tier 3 (+75) |
| --- | --- | --- | --- |
| Cost (total) | 50 | 100 | 175 |
| Damage | 5 | 8 | 12 |
| Range | 1.5 | 1.5 | 2.0 |
| Speed (ms) | 500 | 400 | 350 |
| Special | — | — | 15% double-bite |

#### 2. Tanuki (Raccoon Dog)
Economy tower. Earns bonus money from kills.

| Stat | Tier 1 | Tier 2 (+75) | Tier 3 (+100) |
| --- | --- | --- | --- |
| Cost (total) | 75 | 150 | 250 |
| Damage | 7 | 10 | 14 |
| Range | 2.0 | 2.0 | 2.5 |
| Speed (ms) | 800 | 700 | 600 |
| Special | +25% kill money | +40% kill money | +60% kill money |

#### 3. Penguin
Crowd control. Slows nigiri passing through range.

| Stat | Tier 1 | Tier 2 (+80) | Tier 3 (+100) |
| --- | --- | --- | --- |
| Cost (total) | 80 | 160 | 260 |
| Damage | 3 | 5 | 8 |
| Range | 2.0 | 2.5 | 3.0 |
| Speed (ms) | 700 | 600 | 500 |
| Special | 25% slow 1s | 35% slow 1.5s | 50% slow 2s |

#### 4. Fox (Kitsune)
Precision striker. High single-target damage at range.

| Stat | Tier 1 | Tier 2 (+100) | Tier 3 (+125) |
| --- | --- | --- | --- |
| Cost (total) | 100 | 200 | 325 |
| Damage | 10 | 16 | 22 |
| Range | 2.5 | 3.0 | 3.5 |
| Speed (ms) | 900 | 800 | 700 |
| Special | — | — | Piercing (hits 2) |

#### 5. Monkey (Saru)
Ranged attacker. Throws food at nigiri from a distance.

| Stat | Tier 1 | Tier 2 (+100) | Tier 3 (+125) |
| --- | --- | --- | --- |
| Cost (total) | 100 | 200 | 325 |
| Damage | 12 | 18 | 26 |
| Range | 3.0 | 3.0 | 3.5 |
| Speed (ms) | 1000 | 850 | 700 |
| Special | — | — | 20% banana slow (30% for 1s) |

#### 6. Owl (Fukurou)
Sniper. Longest base range of any tower.

| Stat | Tier 1 | Tier 2 (+100) | Tier 3 (+150) |
| --- | --- | --- | --- |
| Cost (total) | 120 | 220 | 370 |
| Damage | 8 | 13 | 18 |
| Range | 4.0 | 4.5 | 5.0 |
| Speed (ms) | 1200 | 1000 | 900 |
| Special | — | — | 15% crit (2× damage) |

#### 7. Octopus (Tako)
Multi-target. Attacks several nigiri simultaneously.

| Stat | Tier 1 | Tier 2 (+100) | Tier 3 (+175) |
| --- | --- | --- | --- |
| Cost (total) | 150 | 250 | 425 |
| Damage | 6 | 9 | 13 |
| Range | 2.0 | 2.5 | 2.5 |
| Speed (ms) | 800 | 700 | 600 |
| Special | Hits 3 targets | Hits 4 targets | Hits 5 + ink slow (15% for 1s) |

#### 8. Shiba Inu
Support. Buffs **other** towers’ attack speed (and T3: damage) within **Manhattan** distance: **≤ 1** at T1, **≤ 2** at T2/T3. **Only one** Shiba aura applies per tower (strongest `speedBuff`, then tier, then grid tie-break). Buffed damage uses **ceiling** after the damage multiplier. In-game: selecting a Shiba shows the aura footprint on the grid.

| Stat | Tier 1 | Tier 2 (+100) | Tier 3 (+150) |
| --- | --- | --- | --- |
| Cost (total) | 125 | 225 | 375 |
| Damage | 4 | 5 | 9 |
| Range | 2.0 | 2.0 | 2.5 |
| Speed (ms) | 1000 | 990 | 880 |
| Special | +15% nearby atk speed | +18% nearby atk speed | +27% nearby atk speed, +9% nearby dmg |

#### 9. Bear (Kuma)
Heavy hitter. Slow but devastating single bites.

| Stat | Tier 1 | Tier 2 (+150) | Tier 3 (+200) |
| --- | --- | --- | --- |
| Cost (total) | 200 | 350 | 550 |
| Damage | 25 | 38 | 55 |
| Range | 1.5 | 2.0 | 2.0 |
| Speed (ms) | 1500 | 1300 | 1100 |
| Special | 10% stun 0.5s | 15% stun 0.7s | 20% stun 1s + splash (1 tile) |

#### 10. Dragon (Ryu)
Area damage dealer. Most expensive, strongest late-game tower.

| Stat | Tier 1 | Tier 2 (+200) | Tier 3 (+300) |
| --- | --- | --- | --- |
| Cost (total) | 300 | 500 | 800 |
| Damage | 20 | 32 | 48 |
| Range | 3.0 | 3.0 | 3.5 |
| Speed (ms) | 2000 | 1700 | 1500 |
| Special | AoE 1 tile radius | AoE 1.5 tile radius | AoE 2 tile radius + burn (5 dmg/s for 2s) |

---

## Enemies (Nigiri Plates)

HP determines how much eating is needed to consume the plate. Speed is a multiplier on base belt speed (1.0× = normal). Money is awarded when the plate is fully eaten. Life penalty is deducted when the plate escapes.

| # | Name | HP | Speed | Money | Life Penalty | Tier |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Tamago (Egg) | 10 | 1.0× | 5 | 1 | Common |
| 2 | Kappa Maki (Cucumber Roll) | 15 | 1.1× | 6 | 1 | Common |
| 3 | Inari (Tofu Pocket) | 20 | 0.9× | 7 | 1 | Common |
| 4 | Edamame Nigiri | 25 | 1.2× | 8 | 1 | Common |
| 5 | Salmon (Sake) | 35 | 1.0× | 10 | 2 | Standard |
| 6 | Tuna (Maguro) | 40 | 1.0× | 11 | 2 | Standard |
| 7 | Shrimp (Ebi) | 45 | 1.1× | 12 | 2 | Standard |
| 8 | Squid (Ika) | 50 | 0.8× | 13 | 2 | Standard |
| 9 | Mackerel (Saba) | 55 | 1.2× | 14 | 2 | Standard |
| 10 | Yellowtail (Hamachi) | 65 | 1.0× | 16 | 3 | Premium |
| 11 | Eel (Unagi) | 75 | 0.9× | 18 | 3 | Premium |
| 12 | Scallop (Hotate) | 85 | 1.0× | 20 | 3 | Premium |
| 13 | Salmon Roe (Ikura) | 100 | 1.1× | 22 | 3 | Premium |
| 14 | Sweet Shrimp (Amaebi) | 110 | 0.8× | 24 | 3 | Deluxe |
| 15 | Sea Urchin (Uni) | 130 | 0.9× | 27 | 4 | Deluxe |
| 16 | Red Snapper (Tai) | 150 | 1.0× | 30 | 4 | Deluxe |
| 17 | Abalone (Awabi) | 180 | 0.7× | 35 | 4 | Luxury |
| 18 | Fatty Tuna (Chutoro) | 220 | 0.9× | 40 | 5 | Luxury |
| 19 | Wagyu Beef | 280 | 0.8× | 50 | 5 | Luxury |
| 20 | Otoro Supreme | 400 | 0.6× | 75 | 6 | Boss |

### Nigiri Behavior

- Plates spawn at the entry cell and follow the conveyor path toward the exit.
- Each plate has an HP bar drawn above it (only visible when damaged).
- When HP reaches 0, the plate disappears with an "eaten" effect and awards money.
- When a plate reaches the exit, it disappears into the garbage bin with a waste effect and deducts life.
- Plates do not attack towers.
- Plates with active slow effects show a visual indicator (blue tint or snowflake).
- Stunned plates stop moving and flash briefly.

---

## Economy

| Parameter | Value |
| --- | --- |
| Starting money | 200 |
| Round-end bonus | 50 + (round_number × 10) |
| Sell refund rate | 65% of total invested |
| Kill rewards | Per-nigiri values in the enemy table |

### Economy Notes

- Tanuki towers increase kill money by their bonus percentage (applied to the killed nigiri's base reward).
- The round-end bonus is granted after all plates are resolved, regardless of how many escaped.
- Selling a Tier 3 tower refunds 65% of (base cost + tier 2 upgrade cost + tier 3 upgrade cost).

---

## Life System

| Parameter | Value |
| --- | --- |
| Starting life | 20 |
| Game over threshold | 0 |
| Life penalty | Per-nigiri values in the enemy table |

Life cannot go below 0. Life cannot be regained (no healing in v1).

---

## Rounds

Base belt speed: 60 pixels/second (≈ 1 tile per second at 64px tiles). Spawn interval is time between consecutive plate spawns within a wave.

| Round | Composition | Spawn Interval | Total HP | Notes |
| --- | --- | --- | --- | --- |
| 1 | 8× Tamago | 2000ms | 80 | Tutorial — only basic enemies |
| 2 | 6× Tamago, 4× Kappa Maki | 1800ms | 120 | Introduces speed variation |
| 3 | 5× Kappa Maki, 4× Inari, 3× Edamame | 1600ms | 230 | Introduces slow and fast enemies |
| 4 | 4× Salmon, 4× Tuna, 3× Edamame | 1500ms | 375 | Standard tier arrives |
| 5 | 6× Shrimp, 4× Squid, 4× Mackerel | 1400ms | 690 | Pressure — mixed speeds |
| 6 | 4× Yellowtail, 3× Eel, 4× Salmon, 2× Scallop | 1300ms | 755 | Premium tier intro |
| 7 | 3× Scallop, 3× Ikura, 4× Amaebi, 4× Hamachi | 1200ms | 1255 | Heavy HP wave |
| 8 | 4× Uni, 3× Tai, 6× Tuna, 2× Abalone | 1100ms | 1370 | Deluxe + filler mix |
| 9 | 3× Abalone, 3× Chutoro, 4× Uni, 2× Wagyu | 1000ms | 1880 | Luxury tier |
| 10 | 2× Otoro Supreme, 3× Wagyu, 4× Chutoro, 6× Tai | 900ms | 2620 | Boss round |

### Round Behavior

- Before each round, a wave preview shows the nigiri types and counts.
- The wave does not start until the player presses Start Wave (or Space).
- During the wave, tower placement and selling are still allowed.
- Between-round time is unlimited (player-controlled prep phase).

---

## Tower Mechanics Detail

### Targeting

Towers target the nigiri closest to the exit ("first" targeting). This is the default and only targeting mode for v1.

### Attack

When a tower's attack timer fires:
1. Find the first valid target within range.
2. Show an attack animation (eating motion / projectile).
3. Apply damage to the target.
4. Apply any special effects (slow, stun, bonus money, etc.).

Multi-target towers (Octopus) repeat steps 1–4 for each target up to their target count, prioritizing closest-to-exit first.

### AoE

Area towers (Dragon, Bear Tier 3) deal full damage to the primary target and full damage to all other enemies within the AoE radius centered on the primary target.

### Slow and Stun

- **Slow**: Reduces the plate's speed multiplier by the slow percentage for the duration. Multiple slows do not stack — only the strongest active slow applies.
- **Stun**: Plate stops moving entirely for the duration. Stun overwrites slow for its duration. Multiple stuns do not extend duration.

### Support Buff (Shiba Inu)

- The aura is recalculated whenever towers move (place, sell, upgrade). Range is **Manhattan** from the Shiba (T1: 1, T2/T3: 2).
- **At most one** Shiba affects a given tower: pick the aura with the largest **`speedBuff`**, then higher **tier**, then stable grid order.
- T3 **damageBuff** applies only from that same winning Shiba; final damage is **`ceil(base × mult)`**.

---

## UI Behavior

### Tower Shop (Sidebar)

- Lists all 10 towers with icon, name, and cost.
- Towers the player cannot afford are grayed out.
- Clicking a tower enters placement mode: valid cells highlight green, invalid cells highlight red.
- Clicking a valid cell places the tower and deducts cost.
- Clicking an invalid cell or pressing Escape cancels placement.

### Selected Tower Info (Sidebar)

- Clicking a placed tower shows its info panel in the sidebar: name, current tier, stats, range circle overlay on the grid.
- Upgrade button shows next tier cost. Disabled if max tier or insufficient funds.
- Sell button shows refund amount.

### HUD Elements

- Life display: row of heart icons or a bar with numeric value.
- Money display: coin icon + numeric value.
- Round counter: "Round N / 10".
- Wave preview: strip of nigiri icons with counts before the wave starts.

### Visual Feedback

- Damage numbers float briefly above hit nigiri.
- Eaten plates pop with a small particle burst.
- Escaped plates show a sad "wasted" puff at the garbage bin.
- Tower range circle shown on hover and selection.
- Valid placement cells glow green during placement mode.
- Upgrade/sell confirmation is instant (no confirmation dialog for v1).

---

## Scope Boundaries

### Core (must ship in v1)

- Complete game loop: title → prep → wave → resolution → win/lose
- All 10 tower types with 3 upgrade tiers each
- All 20 nigiri types
- 10 rounds with designed compositions
- Economy (earn, spend, sell)
- Life system with game over
- Canvas-only rendering with drawn sprites
- Mouse input for all interactions
- Keyboard shortcuts (Space, U, S, Escape)

### Out of Scope for v1

- Multiple maps (architecture supports it, content is single map)
- Music and sound effects
- Save/load
- Difficulty modes
- Tower larger than 1×1 footprint
- Player-modifiable belt paths
- Life regeneration
- Speed controls (fast-forward, pause)
- Touch/mobile input
- Tooltips or tutorial overlays beyond wave preview

### Future Considerations (not commitments)

- Additional maps with different belt layouts
- Sound effects and music
- Speed controls (1×, 2×, pause)
- Tower skins or seasonal variants
- Endless/survival mode after round 10
- Save/load with localStorage
- Tower footprint > 1×1 for Bear and Dragon
- Achievement system

---

## Open Questions

None — all ambiguities from the brief have been resolved by assumptions recorded in the work order. None materially change the core game identity.

---

## Next Owner

- Visual/Interaction Designer (for visual direction brief)
- Game Developer (for implementation planning — may begin after visual direction)
- Play Tester (for acceptance design awareness)
