/**
 * Test mode uses the same campaign + infinite flow as a normal run; only money is unlimited.
 * Run: node tests/test-mode.test.mjs
 */

import { GameState } from '../src/js/game.js';
import { getMapById } from '../src/js/data.js';

let passed = 0;
let failed = 0;

function assert(cond, msg) {
    if (cond) passed++;
    else {
        failed++;
        console.error(`  FAIL: ${msg}`);
    }
}

function freshGame(testMode, mapId = 'kaiten', difficultyId = 'hard') {
    const g = new GameState(null);
    g.reset(mapId, testMode, difficultyId);
    return g;
}

// --- Same round ladder as normal (not a shortened test ladder) ---
for (const testMode of [false, true]) {
    const g = freshGame(testMode);
    const def = getMapById('kaiten');
    assert(g._roundData === def.rounds, `testMode=${testMode}: _roundData is map rounds ref`);
    assert(g._roundData.length === 10, `testMode=${testMode}: 10 campaign rounds`);
}

// --- Unlimited money only in test mode ---
{
    const normal = freshGame(false);
    const test = freshGame(true);
    assert(normal.money < 10000, 'normal run does not start with 99999');
    assert(test.money === 99999, 'test mode starts with 99999');
}

// --- After clearing round 10: victory offer (same as normal), not instant win ---
for (const testMode of [false, true]) {
    const g = freshGame(testMode);
    g.round = 9;
    g.phase = 'wave';
    g._endRound();
    assert(g.round === 10, `testMode=${testMode}: round becomes 10`);
    assert(g.phase === 'victory_offer', `testMode=${testMode}: phase is victory_offer`);
    assert(!g.victory, `testMode=${testMode}: not instant victory`);
}

// --- Fork map uses same shared rounds ---
{
    const g = freshGame(true, 'fork');
    assert(g._roundData.length === 10, 'fork has 10 campaign rounds in test mode');
}

console.log(`test-mode: ${passed} passed${failed ? `, ${failed} failed` : ''}`);
process.exit(failed ? 1 : 0);
