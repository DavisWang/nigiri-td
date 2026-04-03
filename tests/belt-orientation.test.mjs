/**
 * Belt tile orientation tests.
 *
 * Verifies belt tile type classification and that corner arc parameters
 * use the INNER corner for each turn type.
 *
 * Run: node tests/belt-orientation.test.mjs
 */

const MAP_PATH = [
    {x:0,y:0},{x:1,y:0},{x:2,y:0},{x:3,y:0},{x:4,y:0},{x:5,y:0},{x:6,y:0},{x:7,y:0},
    {x:7,y:1},
    {x:7,y:2},{x:6,y:2},{x:5,y:2},{x:4,y:2},{x:3,y:2},{x:2,y:2},{x:1,y:2},{x:0,y:2},
    {x:0,y:3},
    {x:0,y:4},{x:1,y:4},{x:2,y:4},{x:3,y:4},{x:4,y:4},{x:5,y:4},{x:6,y:4},{x:7,y:4},
    {x:7,y:5},
    {x:7,y:6},{x:6,y:6},{x:5,y:6},{x:4,y:6},{x:3,y:6},{x:2,y:6},{x:1,y:6},{x:0,y:6},
    {x:0,y:7},
    {x:0,y:8},{x:1,y:8},{x:2,y:8},{x:3,y:8},{x:4,y:8},{x:5,y:8},{x:6,y:8},{x:7,y:8},
    {x:7,y:9},
];

function buildBeltTileTypes() {
    const types = {};
    for (let i = 0; i < MAP_PATH.length; i++) {
        const p = MAP_PATH[i];
        const prev = i > 0 ? MAP_PATH[i - 1] : null;
        const next = i < MAP_PATH.length - 1 ? MAP_PATH[i + 1] : null;
        const dirs = new Set();
        if (prev) {
            if (prev.x < p.x) dirs.add('left');
            if (prev.x > p.x) dirs.add('right');
            if (prev.y < p.y) dirs.add('top');
            if (prev.y > p.y) dirs.add('bottom');
        }
        if (next) {
            if (next.x < p.x) dirs.add('left');
            if (next.x > p.x) dirs.add('right');
            if (next.y < p.y) dirs.add('top');
            if (next.y > p.y) dirs.add('bottom');
        }
        let type = 'h';
        if (dirs.has('left') && dirs.has('right')) type = 'h';
        else if (dirs.has('top') && dirs.has('bottom')) type = 'v';
        else if (dirs.has('left') && dirs.has('bottom')) type = 'corner-lb';
        else if (dirs.has('left') && dirs.has('top')) type = 'corner-lt';
        else if (dirs.has('right') && dirs.has('bottom')) type = 'corner-rb';
        else if (dirs.has('right') && dirs.has('top')) type = 'corner-rt';
        else if (dirs.size === 1) type = (dirs.has('left') || dirs.has('right')) ? 'h' : 'v';
        types[`${p.x},${p.y}`] = type;
    }
    return types;
}

const beltTileTypes = buildBeltTileTypes();
function getBeltTileType(col, row) {
    return beltTileTypes[`${col},${row}`] || null;
}

let passed = 0;
let failed = 0;

function assert(condition, msg) {
    if (condition) { passed++; }
    else { failed++; console.error(`  FAIL: ${msg}`); }
}

// --- Belt tile type classification ---

console.log('Belt tile type classification:');

assert(getBeltTileType(0, 0) === 'h', '{0,0} should be h (start)');
assert(getBeltTileType(3, 0) === 'h', '{3,0} should be h (mid row 0)');
assert(getBeltTileType(7, 0) === 'corner-lb', '{7,0} should be corner-lb (left+bottom)');
assert(getBeltTileType(7, 1) === 'v', '{7,1} should be v');
assert(getBeltTileType(7, 2) === 'corner-lt', '{7,2} should be corner-lt (left+top)');
assert(getBeltTileType(4, 2) === 'h', '{4,2} should be h (mid row 2)');
assert(getBeltTileType(0, 2) === 'corner-rb', '{0,2} should be corner-rb (right+bottom)');
assert(getBeltTileType(0, 3) === 'v', '{0,3} should be v');
assert(getBeltTileType(0, 4) === 'corner-rt', '{0,4} should be corner-rt (right+top)');
assert(getBeltTileType(7, 9) === 'v', '{7,9} should be v (end)');
assert(getBeltTileType(1, 1) === null, '{1,1} should be null (not on belt)');

// --- Corner arc INNER corner rule ---
// The arc center MUST be at the inner corner of the turn.
// Inner corner = the corner touching BOTH open edges.
//
// CORRECT (inner):                    WRONG (outer):
//   corner-lb → (x, y+size)            corner-lb → (x+size, y)
//   corner-lt → (x, y)                 corner-lt → (x+size, y+size)
//   corner-rb → (x+size, y+size)       corner-rb → (x, y)
//   corner-rt → (x+size, y)            corner-rt → (x, y+size)

console.log('\nCorner arc inner-corner rule:');

const SIZE = 64;
const CORNERS = {
    'corner-lb': { inner: [0, SIZE],      angles: [Math.PI * 1.5, Math.PI * 2], open: ['left', 'bottom'] },
    'corner-lt': { inner: [0, 0],          angles: [0, Math.PI * 0.5],           open: ['left', 'top'] },
    'corner-rb': { inner: [SIZE, SIZE],    angles: [Math.PI, Math.PI * 1.5],     open: ['right', 'bottom'] },
    'corner-rt': { inner: [SIZE, 0],       angles: [Math.PI * 0.5, Math.PI],     open: ['right', 'top'] },
};

for (const [type, spec] of Object.entries(CORNERS)) {
    const [icx, icy] = spec.inner;
    const [startA, endA] = spec.angles;

    assert(endA > startA, `${type}: arc end (${endA.toFixed(2)}) > start (${startA.toFixed(2)})`);

    const atLeft = icx === 0;
    const atRight = icx === SIZE;
    const atTop = icy === 0;
    const atBottom = icy === SIZE;

    for (const edge of spec.open) {
        if (edge === 'left') assert(atLeft, `${type}: inner corner touches left edge`);
        if (edge === 'right') assert(atRight, `${type}: inner corner touches right edge`);
        if (edge === 'top') assert(atTop, `${type}: inner corner touches top edge`);
        if (edge === 'bottom') assert(atBottom, `${type}: inner corner touches bottom edge`);
    }

    // Verify a mid-radius arc point lands inside the cell (not outside)
    const midAngle = (startA + endA) / 2;
    const r = SIZE * 0.5;
    const px = icx + r * Math.cos(midAngle);
    const py = icy + r * Math.sin(midAngle);
    assert(px >= 0 && px <= SIZE && py >= 0 && py <= SIZE,
        `${type}: mid-arc point (${px.toFixed(1)}, ${py.toFixed(1)}) is inside cell`);
}

// --- Flow direction (animation must match travel direction) ---
// Row 0 travels right (+1), row 2 travels left (-1), etc.
// Vertical connectors always travel down (+1).

console.log('\nFlow direction matches travel:');

function buildFlowDirs() {
    const dirs = {};
    for (let i = 0; i < MAP_PATH.length; i++) {
        const p = MAP_PATH[i];
        const key = `${p.x},${p.y}`;
        if (i < MAP_PATH.length - 1) {
            const next = MAP_PATH[i + 1];
            dirs[key] = next.x !== p.x ? (next.x > p.x ? 1 : -1) : (next.y > p.y ? 1 : -1);
        } else {
            const prev = MAP_PATH[i - 1];
            dirs[key] = p.x !== prev.x ? (p.x > prev.x ? 1 : -1) : (p.y > prev.y ? 1 : -1);
        }
    }
    return dirs;
}

const flowDirs = buildFlowDirs();
function getFlowDir(col, row) { return flowDirs[`${col},${row}`] || 1; }

// Row 0: left→right = +1
assert(getFlowDir(0, 0) === 1, '{0,0} flows right (+1)');
assert(getFlowDir(3, 0) === 1, '{3,0} flows right (+1)');

// Row 2: right→left = -1
assert(getFlowDir(7, 2) === -1, '{7,2} flows left (-1)');
assert(getFlowDir(4, 2) === -1, '{4,2} flows left (-1)');
assert(getFlowDir(0, 2) === 1, '{0,2} corner, next cell is {0,3} (down), so flows +1');

// Vertical connectors: always down = +1
assert(getFlowDir(7, 1) === 1, '{7,1} flows down (+1)');
assert(getFlowDir(0, 3) === 1, '{0,3} flows down (+1)');

// Row 4: left→right = +1
assert(getFlowDir(1, 4) === 1, '{1,4} flows right (+1)');

// Row 6: right→left = -1
assert(getFlowDir(5, 6) === -1, '{5,6} flows left (-1)');

// Row 8: left→right = +1
assert(getFlowDir(3, 8) === 1, '{3,8} flows right (+1)');

// End cell: last cell uses prev direction
assert(getFlowDir(7, 9) === 1, '{7,9} end cell flows down (+1, from prev)');

// --- Summary ---
console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
else console.log('All belt orientation tests passed.');
