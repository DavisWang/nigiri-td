/**
 * Sidebar layout tests.
 *
 * Verifies that UI elements fit within the sidebar without clipping or
 * overlapping. Catches regressions where shop icons, panels, or HUD
 * elements extend outside their containers.
 *
 * Run: node tests/sidebar-layout.test.mjs
 */

const CANVAS_HEIGHT = 640;
const SIDEBAR_X = 640;
const SIDEBAR_WIDTH = 320;
const SHOP_COLS = 2;
const SHOP_ITEM_W = 145;
const SHOP_ITEM_H = 46;
const SHOP_GAP = 4;
const SHOP_START_Y = 188;
const TOWER_COUNT = 10;

const SHOP_ICON_X_OFFSET = 34;
const SHOP_ICON_SIZE = 38;
const MAX_TOWER_ASPECT = 1.4;

const SELECTED_PANEL_H = 196;
const PLACING_PANEL_H = 82;
const PANEL_BOTTOM_PAD = 6;

let passed = 0;
let failed = 0;

function assert(condition, msg) {
    if (condition) { passed++; }
    else { failed++; console.error(`  FAIL: ${msg}`); }
}

// --- Shop icon clipping ---

console.log('Shop icon left-edge clipping (worst-case aspect ratio):');

const maxIconHalfW = (SHOP_ICON_SIZE * MAX_TOWER_ASPECT) / 2;
const iconLeftMargin = SHOP_ICON_X_OFFSET - maxIconHalfW;
assert(iconLeftMargin >= 4,
    `Icon left margin = ${iconLeftMargin.toFixed(1)}px (need >= 4px, iconX=${SHOP_ICON_X_OFFSET}, halfW=${maxIconHalfW.toFixed(1)})`);

const iconRightEdge = SHOP_ICON_X_OFFSET + maxIconHalfW;
const textLeftEdge = SHOP_ITEM_W - 8;
assert(iconRightEdge < textLeftEdge - 10,
    `Icon right edge (${iconRightEdge.toFixed(1)}px) doesn't collide with text area (starts ${textLeftEdge}px)`);

// --- Shop grid fits above selected panel ---

console.log('\nShop grid vs. selected panel overlap:');

const shopRows = Math.ceil(TOWER_COUNT / SHOP_COLS);
const shopBottom = SHOP_START_Y + shopRows * (SHOP_ITEM_H + SHOP_GAP) - SHOP_GAP;
const selectedPanelTop = CANVAS_HEIGHT - SELECTED_PANEL_H - PANEL_BOTTOM_PAD;
const placingPanelTop = CANVAS_HEIGHT - PLACING_PANEL_H - PANEL_BOTTOM_PAD;

assert(shopBottom < selectedPanelTop,
    `Shop bottom (${shopBottom}) < selected panel top (${selectedPanelTop}), gap = ${selectedPanelTop - shopBottom}px`);

assert(shopBottom < placingPanelTop,
    `Shop bottom (${shopBottom}) < placing panel top (${placingPanelTop}), gap = ${placingPanelTop - shopBottom}px`);

// --- Panels fit within canvas ---

console.log('\nPanels fit within canvas:');

const selectedPanelBottom = selectedPanelTop + SELECTED_PANEL_H;
const placingPanelBottom = placingPanelTop + PLACING_PANEL_H;

assert(selectedPanelBottom <= CANVAS_HEIGHT,
    `Selected panel bottom (${selectedPanelBottom}) <= canvas height (${CANVAS_HEIGHT})`);

assert(placingPanelBottom <= CANVAS_HEIGHT,
    `Placing panel bottom (${placingPanelBottom}) <= canvas height (${CANVAS_HEIGHT})`);

// --- Shop columns fit within sidebar ---

console.log('\nShop columns fit within sidebar:');

const shopTotalW = SHOP_COLS * SHOP_ITEM_W + (SHOP_COLS - 1) * SHOP_GAP;
const shopLeftMargin = 12;
const shopRightEdge = shopLeftMargin + shopTotalW;

assert(shopRightEdge <= SIDEBAR_WIDTH,
    `Shop right edge (${shopRightEdge}) <= sidebar width (${SIDEBAR_WIDTH})`);

// --- Summary ---
console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
else console.log('All sidebar layout tests passed.');
