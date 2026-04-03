# Balance levers & parameters — mandate-aligned proposal

**Mandate (testable):** A skilled player can finish **every round with full life (0 leaks)** on each map, but only if they **spend and place efficiently** (good seats, upgrades at the right chokepoints, minimal bad sells). Inefficient play should produce **occasional leaks** by mid-game and **risk game-over** by late game—not “lose 15 life every wave,” but **visible failure** when money is wasted.

This doc lists **exact code levers** (file + symbol), **what to tune per map vs globally**, and **concrete parameter bands** for your review. Nothing here is forced into the build until you approve.

---

## 1. Lever inventory (where the numbers live)

### 1.1 Global economy & life — `src/js/data.js`

| Lever | Symbol / location | Current | Role in mandate |
|--------|-------------------|---------|-----------------|
| Starting gold | `STARTING_MONEY` | `200` | Lower → first buy and R1–2 placement matter more; mistakes harder to paper over with breadth. **Band to try:** `140–170`. |
| Starting life | `STARTING_LIFE` | `20` | Lower → each leak hurts more (tighter to mandate: “full life if good, pain if bad”). **Band:** `12–16` *if* waves are tuned so 0-leak is still realistic. |
| Round clear bonus | `getRoundBonus(roundNum)` → `50 + roundNum * 10` | R1 end +60 … R10 end +150 | Reduces “free income” unrelated to kills. **Band:** `25 + roundNum * 6` (~+31 … +85) or cap linear term. |
| Sell refund | `SELL_REFUND_RATE` | `0.65` | Lower → bad placement is costlier; **Band:** `0.55–0.60`. |

**Interaction:** Cutting **bonus** + **starting money** together is harsher than either alone—tune in **one global knob per playtest pass** after wave passes.

---

### 1.2 Global enemy table — `ENEMY_DATA` in `data.js`

Each row: `{ id, hp, speed, money, lifePenalty, … }`.

| Lever | Role in mandate | Notes |
|--------|-----------------|--------|
| `hp` (per id) | More HP → needs upgrades / better towers; **same for all maps** unless you add per-map multipliers (not in engine today). | Prefer **small uniform %** (+8–15% on Standard+) vs big jumps on one tier. |
| `speed` | Faster belt → less time in range; strongest on **Spiral** / short segments. | **Band:** +0.05–0.10 on tiers you want scarier on short path (risky globally). |
| `money` | Lower kill gold → efficiency mandate stronger. | **Band:** −10–20% on `money` for Standard+ only (keep early commons forgiving). |
| `lifePenalty` | Higher → leaks sting; aligns “don’t leak” with stakes. | **Band:** +1 on `lifePenalty` for **Deluxe/Boss only** (ikura/uni/wagyu), or raise all non-commons by +1 if life pool is lowered. |

**Recommendation order:** (1) `lifePenalty` on high tiers + lower `STARTING_LIFE`, or (2) `hp` +5–10% on mid tiers, **before** touching tower stats.

---

### 1.3 Global towers — `TOWER_DATA` in `data.js`

Per tower: `tiers[].{ cost, damage, range, speed, special }` (`speed` = ms between attacks).

| Lever | Role | Risk |
|--------|------|------|
| `cost` | Delays power spikes | High blast radius; changes shop feel |
| `damage` / `speed` | Effective DPS | Small changes (~5–10%) move all maps |
| `range` | Which seats are “good” | Map-specific feel (Cross center, Fork split) |

**Recommendation:** Treat as **last resort** after rounds + economy + enemy table.

---

### 1.4 Belt pace — `BASE_BELT_SPEED` in `data.js`

| Current | Effect if raised |
|---------|-------------------|
| `60` | Everyone moves faster → **Spiral** and **Cross** legs feel harder first; Kaiten has more cells but same global clock. **Band:** +5–12 if you want one global “pressure” knob (playtest carefully). |

---

### 1.5 Per-map rounds (primary layout-specific tool) — `MAP_DEFINITIONS[].rounds`

Each element:

```js
{ round: N, waves: [ { id: 'tamago', count: 8 }, … ], spawnInterval: 2000 }
```

| Field | Mandate effect |
|--------|----------------|
| `waves[].id` | Which **HP / speed / leak cost** profile (from `ENEMY_DATA`). |
| `waves[].count` | Total DPS check; **Fork** needs enough bodies that **both** branches see pressure. |
| `spawnInterval` | Time between spawns (ms); lower → overlapping enemies → punishes **slow DPS** and **wrong seats**. |

**Shuffle:** `buildSpawnQueue` randomizes order within the round—player can’t rely on fixed spawn sequence; tuning assumes **average** pressure.

---

## 2. How each map should stress “efficient play” (design → levers)

### 2.1 Kaiten Corner (`kaiten` — `KAITEN_ROUNDS`)

**Layout stress:** Long path, **many seats**, clear **row chokes**. Efficiency = **which rows get upgrades**, not whether you can find *a* seat.

**Primary levers (this map only):**

1. **`spawnInterval` curve** — Tighten **R4–R10** by **8–15%** (multiply current ms by **0.85–0.92**). Example: R10 `900` → **760–820**. Keeps R1–3 teachable.
2. **`waves` count** — Add **+1** to **one** mid-tier wave on **R3, R5, R7** (e.g. +1 `salmon` or +1 `squid`) so **breadth** without maxing boss count early.
3. **Avoid** huge HP spikes here first—geometry already gives time to shoot.

**Concrete first pass (example numbers for approval):**

| Round | Current interval | Proposed interval (example) |
|-------|------------------|-----------------------------|
| 1–3 | 2000, 1800, 1600 | 1850, 1700, 1500 |
| 4–7 | 1500–1200 | 1380, 1280, 1180, 1100 |
| 8–10 | 1100, 1000, 900 | 1000, 920, 820 |

---

### 2.2 The Fork (`fork` — `MAP_DEFINITIONS[1].rounds`)

**Layout stress:** **Random branch** per enemy → any tower covers **&lt;100%** of the wave. Efficiency = **two early anchors** + **merge DPS** (shared_end) + **when** to upgrade each side.

**Primary levers (this map only):**

1. **Total spawn count vs Kaiten** — For the **same round index**, Fork should carry **~8–18% more total enemies** *or* **~75–150 ms tighter** `spawnInterval` than Kaiten (not both full strength at once).
2. **R1–3** — Add **+1–2 commons** total per round *or* drop interval **50–100 ms** vs current fork rows to force **two-sided** spend (cats on both branches).
3. **R9–10** — Already dense; prefer **interval** cuts (**800 → 740–780**, **850 → 780–820**) before adding more `wagyu`.

**Concrete first pass (example):**

- R1: `spawnInterval` **1800 → 1650** *or* `tamago`/`salmon` +1 combined.
- R4–8: each interval **−50 to −100 ms** vs today’s fork table.
- R9–10: **−40 to −80 ms** vs current **850 / 800**.

**Do not rely on** asymmetric per-branch waves until the engine supports it—use **volume + tempo** only.

---

### 2.3 The Spiral (`spiral`)

**Layout stress:** **Short path** (~20 cells), **fewer seats** → less **time in range** and faster stacking on corners. Efficiency = **inner-loop seats**, **slow**, **burst DPS**, **timely upgrades** on the curve—not spreading like Kaiten.

**Primary levers (this map only):**

1. **`spawnInterval`** — This is the **main** knob; **−10–18%** on **R5–10** vs current spiral (e.g. R10 **800 → 680–720**) hits mandate without bloating enemy count on a short belt.
2. **`waves` counts** — Add **+1** only on **mid-tier** lines (`tuna`, `mackerel`, `scallop`), **not** a fourth boss wave, unless interval is relaxed +100ms on that round.
3. **Global `speed` buff on enemies** hits Spiral hardest—optional **later** if intervals alone aren’t enough.

**Concrete first pass (example):** multiply spiral **R4–10** intervals by **0.88–0.92** (round to nearest 10 ms).

---

### 2.4 The Crossroads (`cross`)

**Layout stress:** Cell **(4,4)** twice → **AOE / multi-target / center premium**. Efficiency = **investing** in center or adjacent seats vs greedy corners that miss the second pass.

**Primary levers (this map only):**

1. **Volume through the cross** — Slightly **more** `scallop` / `mackerel` / `tuna` counts on **R3–7** (+1 per round on **one** wave, rotating which wave) so **stacking** punishes weak center.
2. **`spawnInterval`** on **R7, R9, R10** — **−50–100 ms** vs current (**1050→980**, **900→820–850**, **800→740–760**) before touching R1–2 (already harsh).
3. **Late game** — R10 can stay **aligned with Kaiten R10 composition**; difficulty comes from **geometry**, so **tempo** > extra `wagyu`.

**Concrete first pass (example):**

- R3: +1 `mackerel` or +1 `scallop`.
- R5: +1 `ikura` (interval +0 or +50ms if too spiky).
- R7–10: interval reductions as above, playtest R7 first (stack round).

---

## 3. Global package to lock “efficiency matters” (optional second pass)

Apply **after** per-map interval/count passes if mandate still not met:

| Step | Lever | Suggested action |
|------|--------|------------------|
| A | `getRoundBonus` | Replace with `30 + roundNum * 7` (tune) |
| B | `STARTING_MONEY` | `200 → 150–165` |
| C | `SELL_REFUND_RATE` | `0.65 → 0.58` |
| D | `STARTING_LIFE` | `20 → 14–16` and raise `lifePenalty` on **wagyu** only +1 **or** leave life and only raise penalties on Deluxe/Boss |

**Rule:** One of **A/B/C** per week of tuning, not all three at once.

---

## 4. Playtest protocol (accept / reject mandate)

For each map, two runs:

| Run | Intent | Pass criterion for mandate |
|-----|--------|----------------------------|
| **S** (skilled) | Strong seats, upgrade chokes, minimal sells | **0 leaks** all 10 rounds |
| **W** (wasteful) | Random seats, delay upgrades, buy expensive towers early without coverage | **First leak** by R4–6; **3+ leaks** or loss by R8–10 on at least one map |

If **S** leaks often → **ease** (slightly looser interval or −1 count on spike round).  
If **W** still clears full life → **tighten** (economy or interval or small HP).

---

## 5. Implementation order (recommended)

1. **Per-map `spawnInterval` scalars** (Kaiten R4–10, Fork all, Spiral R4–10, Cross R7–10) using bands in §2.  
2. **Per-map selective `count` +1** on mid tiers where §2 calls it out.  
3. **`getRoundBonus` + `STARTING_MONEY`** (one step).  
4. **`lifePenalty` / `STARTING_LIFE`** if leaks don’t hurt enough for run **W**.  
5. **`ENEMY_DATA.hp`** small uniform bump.  
6. **`TOWER_DATA`** only if maps diverge too much or game feels unfair.

---

## 6. Out of scope (needs new code)

- Per-map `startingMoney` / `roundBonusMultiplier` (would let Cross stay harsh without nerfing Kaiten tutorial feel).  
- Per-map enemy HP multipliers.  
- Non-random fork weights (e.g. 60/40 branch split).

If you want any of these, say so and we can spec minimal engine changes.

---

**Your review:** Approve §2 per-map bands, §3 global package, or mark which rows to drop/adjust—then we can translate approved rows into exact `data.js` edits.

---

## 7. Implemented (sync with `src/js/data.js`)

Applied in code per §2 + §3 + §1.2:

- **Globals:** `STARTING_MONEY` 158, `STARTING_LIFE` 15, `SELL_REFUND_RATE` 0.58, `getRoundBonus` → `30 + roundNum * 7`.
- **Enemies:** ~10% HP on Standard+; kill `money` ~−12–16% on Standard+; `lifePenalty` +1 on ikura/uni/wagyu.
- **Kaiten:** Intervals per §2.1 table; R3 +1 squid; R5 +1 tuna; R7 +1 tuna.
- **Fork:** R1 1650ms; R2–8 −75ms each from prior fork table; R9 780ms, R10 720ms.
- **Spiral:** R4–10 intervals ×0.9 (rounded to 10ms); mid-tier +1 counts on R4–10 waves per §2.3.
- **Cross:** R3 +1 mackerel; R4 +1 scallop; R5 +1 ikura & 920ms; R6 +1 ikura; R7 +1 tuna & 980ms; R8–10 tighter intervals per §2.4.

No change to `BASE_BELT_SPEED` or `TOWER_DATA` (per doc ordering).

**Still too easy?** See the review-only **[Balance pass 2 proposal](./balance-pass-2-proposal.md)** (tempo, economy, enemies, optional belt/tower knobs—approve a package before implementing).

**Playtest follow-up (partial):** Kaiten intervals tightened again (~×0.92 vs prior Kaiten table) + R4 +1 shrimp, R6 mackerel 5→6. Spiral R1–6 unchanged; R7–10 faster + more bodies (see `balance-pass-2-proposal.md` § Playtest-driven tweaks). Fork/Cross unchanged.
