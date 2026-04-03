# Balance pass 2 — harder curve (for review / approval)

**Context:** Pass 1 is live in `src/js/data.js` (see [`balance-levers-mandate-proposal.md` §7](./balance-levers-mandate-proposal.md)). If the game still feels too easy, this pass stacks **additional** pressure. **Do not apply all tiers at once**—pick **Package 1** and optionally **one** of 2A / 2B / 2C below.

**Mandate (unchanged):** Full life clears remain *possible* with strong play; sloppy economy / placement should leak.

---

## Baseline today (after pass 1)

| Lever | Value |
|--------|--------|
| `STARTING_MONEY` | 158 |
| `STARTING_LIFE` | 15 |
| `SELL_REFUND_RATE` | 0.58 |
| `getRoundBonus(n)` | `30 + n * 7` (n = round just finished, 1–10) |
| `BASE_BELT_SPEED` | 60 |
| Enemies | Standard+ buffed HP; reduced kill `money`; ikura/uni/wagyu `lifePenalty` 5/5/6 |
| Maps | Tighter `spawnInterval` + selective wave `count` bumps (per pass 1) |

---

## Package 1 — **Tempo + bodies** (recommended first)

**Only** changes to `KAITEN_ROUNDS` and each map’s `rounds[]`: **shorter `spawnInterval`** and a few **+1 counts** on rounds that still feel soft.

**Rule of thumb:** multiply each round’s `spawnInterval` by **0.90–0.94** (round to **nearest 10 ms**), with a **floor of 620 ms** on the very hardest round per map so spawns don’t become a single blob.

### 1A — Kaiten (`KAITEN_ROUNDS`)

| Round | Current ms | Proposed ms (×0.92) |
|-------|------------|----------------------|
| 1 | 1850 | **1700** |
| 2 | 1700 | **1560** |
| 3 | 1500 | **1380** |
| 4 | 1380 | **1270** |
| 5 | 1280 | **1180** |
| 6 | 1180 | **1090** |
| 7 | 1100 | **1010** |
| 8 | 1000 | **920** |
| 9 | 920 | **850** |
| 10 | 820 | **750** |

**Optional +1 body (pick any two rounds, not all):** e.g. R4 +1 `shrimp`; R6 +1 `mackerel`—only if interval pass alone isn’t enough.

### 1B — Fork

Apply **−60 ms** to every round vs current fork table (cap R10 at **660** if you want a floor).

| Round | Current | Proposed |
|-------|---------|----------|
| 1 | 1650 | **1590** |
| 2 | 1525 | **1465** |
| … | … | **current − 60** |
| 10 | 720 | **660** |

**Optional:** R1 add **+1 `tamago`** (forces two-branch buy sooner).

### 1C — Spiral

Apply **×0.92** to **all** spiral intervals (R1–3 included this time—short path should stay spiky).

Examples: R1 **1600→1470**, R3 **1200→1100**, R10 **720→660**.

**Optional:** R2 +1 `squid` (cheap volume on early curve).

### 1D — Cross

Apply **−50 ms** to **R1–6** and **−40 ms** to **R7–10** vs current (keeps early Cross harsh without flattening R10 into noise).

| Round | Current | Proposed |
|-------|---------|----------|
| 1 | 1400 | **1350** |
| 2 | 1200 | **1150** |
| … | … | **−50 through R6** |
| 7 | 980 | **940** |
| 8 | 900 | **860** |
| 9 | 835 | **795** |
| 10 | 745 | **705** |

**Optional:** R8 +1 `mackerel` (stack pressure through center).

---

## Package 2A — **Economy squeeze** (pick if money still feels loose)

| Lever | Current | Proposed |
|--------|---------|----------|
| `STARTING_MONEY` | 158 | **125–135** (recommend **130**) |
| `getRoundBonus(n)` | `30 + 7n` | **`22 + 5n`** → first clear +27, tenth +72 |
| `SELL_REFUND_RATE` | 0.58 | **0.52** |

**Do not** combine 2A with 2B in the same playtest without a reason—both reduce player power.

---

## Package 2B — **Stakes** (pick if leaks don’t hurt enough)

| Lever | Current | Proposed |
|--------|---------|----------|
| `STARTING_LIFE` | 15 | **12** |
| `lifePenalty` (Standard tier: squid, shrimp, tuna) | 2 | **3** *(optional; makes mid-game leaks costly)* |

**Alternative (softer than +1 on three types):** only raise **tuna** `lifePenalty` 2→3.

---

## Package 2C — **Enemy durability & income** (global DPS check)

Second **HP** bump on **Standard+ only** (~**+8%** on current pass-1 values), e.g.:

| id | Pass-1 HP | Pass-2 HP (example) |
|----|-----------|----------------------|
| squid | 55 | **59** |
| shrimp | 72 | **78** |
| tuna | 94 | **101** |
| mackerel | 121 | **131** |
| scallop | 154 | **166** |
| ikura | 198 | **214** |
| uni | 264 | **285** |
| wagyu | 385 | **416** |

**Kill money:** subtract **1** again on `squid` through `wagyu` (commons unchanged).

**Commons:** leave `tamago` / `salmon` HP and money as-is so R1–2 don’t feel punitive.

---

## Package 3 — **Belt speed** (optional; hits Spiral hardest)

| Lever | Current | Proposed |
|--------|---------|----------|
| `BASE_BELT_SPEED` | 60 | **66** (+10%) |

**Risk:** Less time in range everywhere; if Spiral becomes unfair, revert this before nerfing towers.

---

## Package 4 — **Premium tower tax** (optional last resort)

Small **cost** increases on the most spike-y opens (only tier-1 `cost` shown; scale tier 2/3 by +10–25 each if you want consistency):

| Tower | Current T1 cost | Proposed |
|-------|-----------------|----------|
| Bear | 200 | **225** |
| Dragon | 300 | **330** |
| Octopus | 150 | **165** |

Leaves **Cat / Tanuki / Penguin** as the honest early game.

---

## Recommended approval paths

| You approve | Action |
|-------------|--------|
| **“Package 1 only”** | Edit only `KAITEN_ROUNDS` + `MAP_DEFINITIONS[].rounds` intervals (and optional +1 counts you tick). |
| **“1 + 2A”** | Package 1 + economy table. |
| **“1 + 2B”** | Package 1 + life / optional standard penalty. |
| **“1 + 2C”** | Package 1 + enemy HP/money. |
| **“Full stack”** | 1 + 2A + 2C, then add 2B or 3 only if still easy. |

---

## Quick playtest after pass 2

- **Skilled:** still **0 leaks** on Kaiten R8–10? If not, ease **R9–10 interval** by +40–60 ms only.  
- **Wasteful:** leaks by **R4–5** on Fork or Cross? If not, add **Package 2A** or **2C**.

---

When you approve a package (or a custom subset), say which rows to apply and we mirror into `data.js` and update §7 in `balance-levers-mandate-proposal.md` or add a “Pass 2 implemented” note here.

---

## Playtest-driven tweaks (applied in `data.js`)

- **Kaiten:** Tighter `spawnInterval` (~×0.92 vs prior pass-1 curve); R4 +1 `shrimp`; R6 `mackerel` 5→6 (addressed “too easy”).
- **Spiral:** Rounds **1–6 unchanged**; **R7–10** faster spawns + heavier waves (addressed late snowball).
- **Fork / Cross:** Unchanged pending playtests.
