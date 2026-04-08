/**
 * Map select screen layout tests.
 *
 * Constants and formulas must stay in sync with getMapCardRects() in src/js/main.js.
 * Run: node tests/map-select-layout.test.mjs
 */

import assert from 'node:assert/strict';
import { CANVAS_WIDTH, CANVAS_HEIGHT, MAP_DEFINITIONS } from '../src/js/data.js';

// --- Keep in sync with main.js (getMapCardRects) ---
const CARD_W = 172;
const CARD_H = 210;
const CARD_GAP = 14;
const MAP_SELECT_COLS = 3;
const HEADER_BOTTOM = 56;
const FOOTER_TOP = CANVAS_HEIGHT - 48;

function mapSelectGridMetrics(mapCount) {
    const cols = MAP_SELECT_COLS;
    const rows = Math.ceil(mapCount / cols);
    const totalW = cols * CARD_W + (cols - 1) * CARD_GAP;
    const rowGap = CARD_GAP;
    const totalH = rows * CARD_H + (rows - 1) * rowGap;
    const startX = (CANVAS_WIDTH - totalW) / 2;
    const startY = HEADER_BOTTOM + Math.max(12, (FOOTER_TOP - HEADER_BOTTOM - totalH) / 2);
    return { cols, rows, totalW, totalH, startX, startY };
}

const n = MAP_DEFINITIONS.length;
const m = mapSelectGridMetrics(n);

assert.equal(MAP_SELECT_COLS, 3, 'expect 3 columns × 2 rows for six maps');
assert.equal(m.rows, 2, `with ${n} maps and 3 cols, expect 2 rows, got ${m.rows}`);

assert.ok(m.totalW <= CANVAS_WIDTH,
    `map grid width ${m.totalW} must fit canvas ${CANVAS_WIDTH}`);
assert.ok(m.startX >= 0 && m.startX + m.totalW <= CANVAS_WIDTH,
    `grid horizontal span [${m.startX}, ${m.startX + m.totalW}] within [0, ${CANVAS_WIDTH}]`);

const availH = FOOTER_TOP - HEADER_BOTTOM;
assert.ok(m.totalH <= availH,
    `map grid height ${m.totalH} must fit title/footer band (${availH}px), else overflow`);

const gridBottom = m.startY + m.totalH;
assert.ok(gridBottom <= FOOTER_TOP,
    `grid bottom ${gridBottom} <= footer band top ${FOOTER_TOP}`);

for (let i = 0; i < n; i++) {
    const col = i % MAP_SELECT_COLS;
    const row = Math.floor(i / MAP_SELECT_COLS);
    const x = m.startX + col * (CARD_W + CARD_GAP);
    const y = m.startY + row * (CARD_H + CARD_GAP);
    assert.ok(x >= 0 && x + CARD_W <= CANVAS_WIDTH, `card ${i} x-bounds`);
    assert.ok(y >= HEADER_BOTTOM && y + CARD_H <= CANVAS_HEIGHT, `card ${i} y-bounds`);
}

console.log('Map select layout:');
console.log(`  ${m.cols} cols × ${m.rows} rows, grid ${m.totalW}×${m.totalH}px, top-left (${m.startX}, ${m.startY})`);
console.log('  ok — map select grid fits canvas (no overflow)\n');
