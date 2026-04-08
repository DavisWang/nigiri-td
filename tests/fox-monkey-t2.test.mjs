/**
 * Fox / Monkey tier-2+ specials (data contract).
 * Run: node tests/fox-monkey-t2.test.mjs
 */

import assert from 'node:assert/strict';
import { TOWER_DATA } from '../src/js/data.js';

const fox = TOWER_DATA.find((t) => t.id === 'fox');
const monkey = TOWER_DATA.find((t) => t.id === 'monkey');

assert.ok(fox && monkey);

assert.equal(fox.tiers[0].special, null, 'Fox T1 no special');
assert.deepEqual(fox.tiers[1].special, { type: 'multiTarget', count: 2 }, 'Fox T2 multiTarget 2');
assert.deepEqual(fox.tiers[2].special, { type: 'multiTarget', count: 3 }, 'Fox T3 multiTarget 3');

assert.equal(monkey.tiers[0].special, null, 'Monkey T1 no special');
assert.deepEqual(monkey.tiers[1].special, { type: 'slow', pct: 0.14, dur: 900 }, 'Monkey T2 light slow');
assert.deepEqual(monkey.tiers[2].special, { type: 'slow', pct: 0.27, dur: 1000 }, 'Monkey T3 slow');

for (const t of TOWER_DATA) {
    for (let ti = 0; ti < t.tiers.length; ti++) {
        const sp = t.tiers[ti].special;
        assert.notEqual(sp?.type, 'pierce', `${t.id} tier ${ti}: pierce type removed — use multiTarget`);
    }
}

console.log('Fox / Monkey T2+ data: ok');
