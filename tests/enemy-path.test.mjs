/**
 * Enemy conveyor path regression tests.
 *
 * Ensures spawned nigiri use the active map's path from MapContext / pathProvider,
 * not a stale or global Kaiten-only path.
 *
 * Run: node tests/enemy-path.test.mjs
 * (npm test — requires package.json "type": "module")
 */

import assert from 'node:assert/strict';
import { GameState } from '../src/js/game.js';
import { MAP_PATH } from '../src/js/data.js';

let passed = 0;
let failed = 0;

function check(name, fn) {
    try {
        fn();
        passed++;
        console.log(`  ok — ${name}`);
    } catch (e) {
        failed++;
        console.error(`  FAIL — ${name}`);
        console.error(e);
    }
}

function lastCell(path) {
    return path[path.length - 1];
}

function spawnFirstEnemy(mapId) {
    const game = new GameState(null);
    game.reset(mapId, true);
    game.startWave();
    game.update(0.02);
    assert.equal(game.enemies.length, 1, 'expected one enemy after first spawner tick');
    return game;
}

check('spiral: enemy path is not legacy MAP_PATH reference', () => {
    const game = spawnFirstEnemy('spiral');
    const p = game.enemies[0].mapPath;
    assert.notStrictEqual(p, MAP_PATH);
    assert.equal(p[6].x, 5);
    assert.equal(p[6].y, 1);
    assert.deepEqual(lastCell(p), { x: 4, y: 3 });
});

check('cross: enemy path ends at cross map exit (not Kaiten)', () => {
    const game = spawnFirstEnemy('cross');
    const p = game.enemies[0].mapPath;
    assert.notStrictEqual(p, MAP_PATH);
    assert.deepEqual(lastCell(p), { x: 0, y: 9 });
});

check('kaiten: enemy path matches exported MAP_PATH (same geometry)', () => {
    const game = spawnFirstEnemy('kaiten');
    const p = game.enemies[0].mapPath;
    assert.strictEqual(p, MAP_PATH);
    assert.deepEqual(lastCell(p), { x: 7, y: 9 });
    assert.equal(p[6].x, 6);
    assert.equal(p[6].y, 0);
});

check('fork: enemy uses branch A or B (not a third path)', () => {
    const game = spawnFirstEnemy('fork');
    const p = game.enemies[0].mapPath;
    assert.notStrictEqual(p, MAP_PATH);
    const at4 = p[4];
    const okA = at4.x === 4 && at4.y === 0;
    const okB = at4.x === 3 && at4.y === 1;
    assert.ok(okA || okB, `fork branch at index 4 expected (4,0) or (3,1), got (${at4.x},${at4.y})`);
    assert.deepEqual(lastCell(p), { x: 7, y: 9 });
});

console.log('\nEnemy path / map wiring:\n');
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
console.log('All enemy path tests passed.\n');
