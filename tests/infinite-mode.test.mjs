/**
 * Infinite mode: scaler functions and wave template (see src/js/data.js).
 * Run: node tests/infinite-mode.test.mjs
 */

import {
    MAP_DEFINITIONS,
    INFINITE_TEMPLATE_ROUND_INDEX,
    getInfiniteHpMult,
    getInfiniteSpeedMult,
    getInfiniteMoneyMult,
    getInfiniteSpawnIntervalMult,
    getInfiniteRoundBonus,
    getRoundBonus,
    buildInfiniteRoundData,
} from '../src/js/data.js';

let passed = 0;
let failed = 0;

function assert(cond, msg) {
    if (cond) passed++;
    else {
        failed++;
        console.error(`  FAIL: ${msg}`);
    }
}

function approx(a, b, eps = 1e-9) {
    return Math.abs(a - b) <= eps;
}

// --- Scalers (agreed design) ---
assert(approx(getInfiniteHpMult(1), 1), 'HP k=1 is 1');
assert(approx(getInfiniteHpMult(2), 1.1), 'HP k=2 is 1.1');
assert(approx(getInfiniteHpMult(5), 1.1 ** 4), 'HP k=5 is 1.1^4');

assert(approx(getInfiniteSpeedMult(1), 1), 'Speed k=1 is 1');
assert(approx(getInfiniteSpeedMult(2), 1 + 1 / 19), 'Speed k=2 is 1 + 1/19');
assert(approx(getInfiniteSpeedMult(20), 2), 'Speed k=20 is 2×');
assert(approx(getInfiniteSpeedMult(999), 2), 'Speed caps at 2×');

assert(approx(getInfiniteMoneyMult(1), 0.5), 'Money k=1 is 0.5× start');
assert(approx(getInfiniteMoneyMult(2), 0.5 * 0.85), 'Money k=2 is 0.5×0.85');
assert(getInfiniteMoneyMult(500) === 0.05, 'Money floors at 0.05');

assert(approx(getInfiniteSpawnIntervalMult(1), 1), 'Spawn k=1 is 1');
assert(approx(getInfiniteSpawnIntervalMult(2), 0.985), 'Spawn k=2 is 0.985');
assert(getInfiniteSpawnIntervalMult(5000) === 0.65, 'Spawn interval mult floors at 0.65');

assert(
    getInfiniteRoundBonus(1) === getRoundBonus(10),
    'Infinite bonus k=1 matches base R10 bonus',
);
assert(
    getInfiniteRoundBonus(4) === getRoundBonus(10) + 15,
    'Infinite bonus k=4 adds +15 over k=1',
);

// --- Template: round 10 composition (shared across maps) ---
const rounds = MAP_DEFINITIONS[0].rounds;
const r10 = rounds[INFINITE_TEMPLATE_ROUND_INDEX];
assert(!!r10, 'Template round exists');

function waveCounts(rd) {
    const m = {};
    for (const w of rd.waves) m[w.id] = (m[w.id] || 0) + w.count;
    return m;
}

const base = buildInfiniteRoundData(rounds, 1);
assert(
    JSON.stringify(waveCounts(base)) === JSON.stringify(waveCounts(r10)),
    'k=1 infinite wave matches R10 counts',
);

const bump = buildInfiniteRoundData(rounds, 3);
const baseW = r10.waves.find((w) => w.count === Math.max(...r10.waves.map((x) => x.count)));
assert(!!baseW, 'R10 has a max-count wave');
const bumpedWave = bump.waves.find((w) => w.id === baseW.id);
assert(
    bumpedWave && bumpedWave.count === baseW.count + 1,
    'k=3 adds +1 to largest wave (wagyu line)',
);

// Short round tables: use last round as template
const shortRounds = rounds.slice(0, 3);
const shortInf = buildInfiniteRoundData(shortRounds, 1);
assert(
    shortInf.waves.length === shortRounds[2].waves.length,
    'Short table uses last round as template',
);

console.log(`\n${passed} assertions passed, ${failed} failed`);
if (failed > 0) process.exit(1);
console.log('All infinite-mode tests passed.');
