/**
 * Shiba aura: Manhattan range by tier, single-source buff (no stacking), buffed damage ceil.
 * Run: node tests/shiba-aura.test.mjs
 */

import assert from 'node:assert/strict';
import {
    Tower,
    shibaAuraManhattanLimit,
    shibaAuraApplies,
    pickBestShibaAuraSource,
} from '../src/js/entities.js';

function shiba(col, row, tier) {
    const t = new Tower('shiba', col, row);
    t.tier = tier;
    return t;
}

function cat(col, row) {
    return new Tower('cat', col, row);
}

assert.equal(shibaAuraManhattanLimit(0), 1, 'T1 manhattan cap 1');
assert.equal(shibaAuraManhattanLimit(1), 2, 'T2 manhattan cap 2');
assert.equal(shibaAuraManhattanLimit(2), 2, 'T3 manhattan cap 2');

const s0 = shiba(2, 2, 0);
const cOrtho = cat(3, 2);
const cDiag = cat(3, 3);
const cTwo = cat(4, 2);
assert.ok(shibaAuraApplies(cOrtho, s0), 'T1: orthogonal neighbor in range');
assert.ok(!shibaAuraApplies(cDiag, s0), 'T1: diagonal manhattan 2 out of range');
assert.ok(!shibaAuraApplies(cTwo, s0), 'T1: manhattan 2 out of range');

const s2 = shiba(2, 2, 1);
assert.ok(shibaAuraApplies(cTwo, s2), 'T2: manhattan 2 in range');
assert.ok(shibaAuraApplies(cDiag, s2), 'T2: diagonal manhattan 2 in range');

const catCenter = cat(2, 2);
const low = shiba(1, 2, 0);
const high = shiba(3, 2, 2);
const towers = [catCenter, low, high];
const best = pickBestShibaAuraSource(catCenter, towers);
assert.strictEqual(best, high, 'strongest speedBuff Shiba wins when both in range');

const tieA = shiba(1, 2, 0);
const tieB = shiba(2, 1, 0);
const catMid = cat(2, 2);
const tieTowers = [catMid, tieA, tieB];
const bestTie = pickBestShibaAuraSource(catMid, tieTowers);
assert.strictEqual(bestTie, tieA, 'same speedBuff: lower col wins');

const buffed = catMid.getBuffedStats(tieTowers);
assert.equal(buffed.speed, Math.round(500 * 0.85), 'only one Shiba speed factor (T1 0.15)');

const catForDmg = cat(1, 1);
const t3 = shiba(1, 0, 2);
const solo = [catForDmg, t3];
const b2 = catForDmg.getBuffedStats(solo);
assert.equal(b2.damage, Math.ceil(5 * 1.09 - 1e-9), 'T3 damageBuff: ceil(5 * 1.09) = 6');

console.log('Shiba aura:\n  ok — Manhattan limits, pickBest, single buff, ceil damage\n');
