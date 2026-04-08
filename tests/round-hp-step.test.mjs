/**
 * Round ladder: total baseline HP must grow by at least ROUND_HP_STEP_MULTS[r-2] (R1→R2 … R9→R10).
 * Waves must only use enemy tiers within ±1 of round number (tier 1 = tamago … tier 10 = wagyu).
 * Primary type for round R is ENEMY_STRENGTH_IDS[R-1] and must account for >= 45% of total HP
 * (matches scripts/generate-balanced-rounds.mjs PRIMARY_HP_FRAC).
 *
 * Run: node tests/round-hp-step.test.mjs
 */

import {
    MAP_DEFINITIONS,
    ENEMY_DATA,
    ROUND_HP_STEP_MULTS,
    ENEMY_STRENGTH_IDS,
} from '../src/js/data.js';

const PRIMARY_HP_FRAC = 0.45;
const hpById = Object.fromEntries(ENEMY_DATA.map((e) => [e.id, e.hp]));
const tierById = Object.fromEntries(ENEMY_DATA.map((e, i) => [e.id, i]));

function roundTotalHp(roundDef) {
    return roundDef.waves.reduce((s, w) => s + hpById[w.id] * w.count, 0);
}

function primaryHpForRound(roundDef, r) {
    const primaryId = ENEMY_STRENGTH_IDS[r - 1];
    let p = 0;
    for (const w of roundDef.waves) {
        if (w.id === primaryId) p += hpById[w.id] * w.count;
    }
    return p;
}

let passed = 0;
let failed = 0;

function assert(cond, msg) {
    if (cond) passed++;
    else {
        failed++;
        console.error(`  FAIL: ${msg}`);
    }
}

for (const map of MAP_DEFINITIONS) {
    console.log(`\n${map.name} (${map.id}):`);
    let prev = 0;
    for (const rd of map.rounds) {
        const r = rd.round;
        const total = roundTotalHp(rd);
        const lo = Math.max(0, r - 2);
        const hi = Math.min(9, r);

        if (r === 1) {
            prev = total;
            console.log(`  R1 total HP = ${total}`);
        } else {
            const stepMult = ROUND_HP_STEP_MULTS[r - 2];
            const minNeed = Math.ceil(prev * stepMult - 1e-9);
            const ratio = total / prev;
            assert(
                total >= minNeed,
                `R${r} total ${total} < ceil(${stepMult}×R${r - 1}) = ${minNeed} (ratio ${ratio.toFixed(3)})`,
            );
            assert(
                ratio + 1e-9 >= stepMult,
                `R${r} ratio ${ratio.toFixed(3)} < ${stepMult}`,
            );
            prev = total;
        }

        for (const w of rd.waves) {
            const ti = tierById[w.id];
            assert(
                ti >= lo && ti <= hi,
                `R${r} wave ${w.id} tier ${ti + 1} outside [${lo + 1}, ${hi + 1}]`,
            );
        }

        const pHp = primaryHpForRound(rd, r);
        assert(
            pHp / total >= PRIMARY_HP_FRAC - 1e-9,
            `R${r} primary HP share ${((pHp / total) * 100).toFixed(1)}% < ${PRIMARY_HP_FRAC * 100}%`,
        );
    }
}

console.log(`\n${passed} assertions passed, ${failed} failed`);
if (failed > 0) process.exit(1);
console.log('All round HP / tier / primary-share tests passed.');
