# 10-Round Campaign & Difficulty by Map

**Status:** Fork, Spiral, and Cross are extended to **10 rounds** in `src/js/data.js`. Kaiten was already 10. Below is the **design intent** for harder, layout-aware play—tune after your playtest approval.

**Exact levers & numeric bands** for the “full life only if efficient” mandate: see [`balance-levers-mandate-proposal.md`](./balance-levers-mandate-proposal.md).

---

## Shared principles

- **Pressure knobs:** `waves` (tier + count), `spawnInterval` (ms between spawns). No code changes required for iteration.
- **Target feel:** skilled builds clear with **0 leaks**; mistakes cost life; money tight enough that **seat choice + upgrade timing** matter each round.
- **Next global passes (not applied yet):** lower `getRoundBonus`, `STARTING_MONEY`, and/or raise `lifePenalty` / lower `STARTING_LIFE` if waves alone are not enough.

---

## Kaiten Corner (classic snake, ★)

**Layout:** Long path (~45 cells), many seats, clear choke rows (horizontal passes).

**How difficulty should manifest**

- **Rounds 1–4:** Teach the snake—spread towers along passes; weak enemies but **volume** forces coverage.
- **R5–7:** Mixed tiers; player must **upgrade key choke** cells or leak on the long straight segments.
- **R8–10:** High HP + bosses; **spawnInterval** bottom ~900ms—tests whether DPS is stacked on the right rows.

**Concrete levers (current data)**

- Already the reference curve (`KAITEN_ROUNDS`). To harden without touching other maps: reduce early `spawnInterval` by 100–150ms, or add 1–2 commons to R3–5.

---

## The Fork (branching, ★★)

**Layout:** Shared entry → **two routes** (random per enemy) → merge → shared exit. Effective DPS is **split**; seats sit on **either** branch or merge.

**How difficulty should manifest**

- **Branch tax:** Same *total* enemy count as Kaiten feels **harder** because ~half the wave ignores any tower that only covers one branch.
- **R1–4:** Force **two early anchors** (one per side) or accept leaks; salmon/squid mix rewards cheap cats on both sides.
- **R5–8:** Merge point (shared_end) is a **secondary choke**—good for splash/slow; waves mix tanky lines to punish “all-in one branch.”
- **R9–10 (new):** Mirror Kaiten late-game **density** (`ikura`/`uni`/`mackerel` stacks) with **800–850ms** interval—player must have **both** branches covered **and** merge DPS.

**What we added (data)**

- **R9:** `ikura×4`, `uni×3`, `mackerel×5`, 850ms  
- **R10:** `wagyu×2`, `uni×4`, `scallop×4`, `ikura×3`, 800ms (extra wave vs Kaiten R10 to offset 2× `wagyu`; one fewer `wagyu` than Kaiten pure finale because fork is already positioning-hard)

---

## The Spiral (compact, ★★★)

**Layout:** **~20 cells** path—very short time from spawn to exit; **fewer seats** (~22); enemies stack quickly on tight corners.

**How difficulty should manifest**

- **Speed of threat:** No long “firing window”; **slow**, **AOE**, and **high single-target** on the **inner curve** matter more than on Kaiten.
- **R1–6 (unchanged start):** Already opens on **Standard** tier (squid/shrimp)—spiral is never a “tutorial” map.
- **R7–10 (new):** Step up **without** matching Kaiten’s raw count 1:1—spiral would become impossible. Instead: **staggered elites** + **fourth wave** on R9–10 so total spawn count stays plausible on a short belt.
  - **R7:** `scallop×4`, `ikura×3`, `tuna×4`, 1050ms  
  - **R8:** `ikura×4`, `uni×3`, `mackerel×4`, 950ms  
  - **R9:** `uni×3`, `wagyu×2`, `ikura×4`, `scallop×3`, 900ms  
  - **R10:** `wagyu×3`, `uni×3`, `ikura×4`, `mackerel×3`, 800ms  

**Iteration hint:** If R10 is too brutal, drop one `wagyu` or raise interval +100ms before nerfing towers globally.

---

## The Crossroads (double pass, ★★★★)

**Layout:** Path crosses **(4,4)** twice; one tower there hits **four segments** in one loop—optimal for **AOE / octopus / dragon** value.

**How difficulty should manifest**

- **Reward center control:** Waves with **dense mid-tier blocks** (scallop/mackerel) **stack** at the cross if DPS is low—punishes ignoring the intersection.
- **R1–6:** Already starts hard (tuna/mackerel R1); escalates to `wagyu×3` by R6.
- **R7–10 (new):** Emphasize **volume through the cross** + late elites:
  - **R7:** `scallop×4`, `ikura×3`, `tuna×5` (long horizontal legs + cross traffic)  
  - **R8:** Same shape as Kaiten R8: `ikura×4`, `uni×3`, `mackerel×5`  
  - **R9:** `uni×4`, `wagyu×2`, `scallop×4`, `ikura×3`  
  - **R10:** **Matches Kaiten R10** (`wagyu×3`, `uni×4`, `ikura×5`, 800ms)—cross is the “master” map; endgame should feel like the full Kaiten finale **if** the player exploited the + junction.

---

## Approval checklist

- [ ] Play Fork R9–10: leaks unless both branches defended?  
- [ ] Play Spiral R8–10: winnable with smart inner-curve build, not just Kaiten copy-paste?  
- [ ] Play Cross R10: center investment pays off; skipping it hurts?  
- [ ] If still too easy globally, apply economy / life changes (see shared principles).
