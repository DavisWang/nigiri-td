/**
 * Belt roller flow direction at path endpoints.
 *
 * Last path cells had no `next`, so getBeltFlowDir fell back to +1 and vertical
 * exits (e.g. perimeter) animated opposite to the penultimate tile.
 *
 * Run: node tests/belt-flow-dir.test.mjs
 */

import assert from 'node:assert/strict';
import { MapContext, getMapById } from '../src/js/data.js';

function flow(mc, col, row) {
    return mc.getBeltFlowDir(col, row);
}

const perimeter = new MapContext(getMapById('perimeter'));
assert.equal(flow(perimeter, 0, 2), -1, 'perimeter (0,2): vertical toward exit above');
assert.equal(flow(perimeter, 0, 1), -1, 'perimeter exit (0,1): must match incoming from (0,2), not default +1');

const runway = new MapContext(getMapById('runway'));
assert.equal(flow(runway, 6, 5), 1, 'runway penultimate: eastbound');
assert.equal(flow(runway, 7, 5), 1, 'runway exit (7,5): same as incoming from west');

const kaiten = new MapContext(getMapById('kaiten'));
assert.equal(flow(kaiten, 7, 8), 1, 'kaiten (7,8): vertical down toward (7,9)');
assert.equal(flow(kaiten, 7, 9), 1, 'kaiten exit (7,9): vertical down, matches (7,8)→(7,9)');

console.log('Belt flow dir at path tail:\n');
console.log('  ok — last-cell flow uses prev→current (no false default +1)\n');
