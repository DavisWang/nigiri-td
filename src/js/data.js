export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 640;
export const GAME_AREA_WIDTH = 640;
export const SIDEBAR_X = 640;
export const SIDEBAR_WIDTH = 320;
export const CELL_SIZE = 64;
export const GRID_COLS = 8;
export const GRID_ROWS = 10;
export const GRID_OFFSET_X = 64;
export const GRID_OFFSET_Y = 0;

export const STARTING_MONEY = 158;
export const STARTING_LIFE = 15;
export const SELL_REFUND_RATE = 0.58;
export const BASE_BELT_SPEED = 60;

export const COLORS = {
    bg: '#FFF8E7',
    belt: '#B0A89A',
    beltBorder: '#6B5B4F',
    gridLine: '#E8DCC8',
    sidebarBg: '#FDF6EC',
    sidebarBorder: '#D4C4A8',
    textPrimary: '#3A3A3A',
    textAccent: '#C0392B',
    money: '#F1C40F',
    life: '#E74C3C',
    validPlace: '#A8E6CF',
    invalidPlace: '#FFB3B3',
    rangeCircle: 'rgba(93, 173, 226, 0.2)',
    selectedHighlight: 'rgba(249, 229, 71, 0.4)',
    slowTint: '#AED6F1',
    stunFlash: '#F7DC6F',
};

export const TIER_COLORS = {
    Common: '#FFFFFF',
    Standard: '#85C1E9',
    Premium: '#BB8FCE',
    Deluxe: '#F4D03F',
    Luxury: '#E8A0BF',
    Boss: '#E74C3C',
};

export const TOWER_DATA = [
    { id: 'cat', name: 'Cat', emoji: '🐱', description: 'Quick and cheap. Great early-game pick.', primary: '#F5A623', accent: '#FFF3E0', eyeColor: '#4CAF50', tiers: [{ cost: 50, damage: 5, range: 1.5, speed: 500, special: null },{ cost: 50, damage: 7, range: 1.5, speed: 440, special: null },{ cost: 75, damage: 11, range: 2.0, speed: 385, special: { type: 'doubleBite', chance: 0.15 } }] },
    { id: 'tanuki', name: 'Tanuki', emoji: '🦝', description: 'Earns bonus money from every kill.', primary: '#8D6E63', accent: '#D7CCC8', eyeColor: '#4E342E', tiers: [{ cost: 75, damage: 7, range: 2.0, speed: 800, special: { type: 'bonusMoney', mult: 0.25 } },{ cost: 75, damage: 9, range: 2.0, speed: 770, special: { type: 'bonusMoney', mult: 0.36 } },{ cost: 100, damage: 13, range: 2.5, speed: 660, special: { type: 'bonusMoney', mult: 0.54 } }] },
    { id: 'penguin', name: 'Penguin', emoji: '🐧', description: 'Slows enemies with each icy attack.', primary: '#1A237E', accent: '#FFFFFF', eyeColor: '#212121', tiers: [{ cost: 80, damage: 3, range: 2.0, speed: 700, special: { type: 'slow', pct: 0.25, dur: 1000 } },{ cost: 80, damage: 5, range: 2.5, speed: 660, special: { type: 'slow', pct: 0.32, dur: 1500 } },{ cost: 100, damage: 7, range: 3.0, speed: 550, special: { type: 'slow', pct: 0.45, dur: 2000 } }] },
    { id: 'fox', name: 'Fox', emoji: '🦊', description: 'Long-range precision. Pierces at tier 3.', primary: '#E64A19', accent: '#FFF8E1', eyeColor: '#FF8F00', tiers: [{ cost: 100, damage: 10, range: 2.5, speed: 900, special: null },{ cost: 100, damage: 14, range: 3.0, speed: 880, special: null },{ cost: 125, damage: 20, range: 3.5, speed: 770, special: { type: 'pierce', count: 2 } }] },
    { id: 'monkey', name: 'Monkey', emoji: '🐒', description: 'Ranged hurler. Gains slow at tier 3.', primary: '#A1887F', accent: '#FFCCBC', eyeColor: '#5D4037', tiers: [{ cost: 100, damage: 12, range: 3.0, speed: 1000, special: null },{ cost: 100, damage: 16, range: 3.0, speed: 935, special: null },{ cost: 125, damage: 23, range: 3.5, speed: 770, special: { type: 'slow', pct: 0.27, dur: 1000 } }] },
    { id: 'owl', name: 'Owl', emoji: '🦉', description: 'Extreme range. Gains crits at tier 3.', primary: '#8D6E63', accent: '#EFEBE9', eyeColor: '#FFC107', tiers: [{ cost: 120, damage: 8, range: 4.0, speed: 1200, special: null },{ cost: 100, damage: 12, range: 4.5, speed: 1100, special: null },{ cost: 150, damage: 16, range: 5.0, speed: 990, special: { type: 'crit', chance: 0.15, mult: 1.8 } }] },
    { id: 'octopus', name: 'Octopus', emoji: '🐙', description: 'Hits multiple targets simultaneously.', primary: '#F48FB1', accent: '#FCE4EC', eyeColor: '#212121', tiers: [{ cost: 150, damage: 6, range: 2.0, speed: 800, special: { type: 'multiTarget', count: 3 } },{ cost: 100, damage: 8, range: 2.5, speed: 770, special: { type: 'multiTarget', count: 4 } },{ cost: 175, damage: 12, range: 2.5, speed: 660, special: { type: 'multiTarget', count: 5, slow: { pct: 0.14, dur: 1000 } } }] },
    { id: 'shiba', name: 'Shiba Inu', emoji: '🐕', description: 'Buffs adjacent towers\u2019 attack speed.', primary: '#FFB74D', accent: '#FFF8E1', eyeColor: '#4E342E', tiers: [{ cost: 125, damage: 4, range: 2.0, speed: 1000, special: { type: 'aura', speedBuff: 0.15 } },{ cost: 100, damage: 5, range: 2.0, speed: 990, special: { type: 'aura', speedBuff: 0.18 } },{ cost: 150, damage: 9, range: 2.5, speed: 880, special: { type: 'aura', speedBuff: 0.27, damageBuff: 0.09 } }] },
    { id: 'bear', name: 'Bear', emoji: '🐻', description: 'Massive damage with a chance to stun.', primary: '#5D4037', accent: '#D7CCC8', eyeColor: '#212121', tiers: [{ cost: 200, damage: 25, range: 1.5, speed: 1500, special: { type: 'stun', chance: 0.10, dur: 500 } },{ cost: 150, damage: 34, range: 2.0, speed: 1430, special: { type: 'stun', chance: 0.135, dur: 700 } },{ cost: 200, damage: 50, range: 2.0, speed: 1210, special: { type: 'stun', chance: 0.18, dur: 1000, splash: 1.0 } }] },
    { id: 'dragon', name: 'Dragon', emoji: '🐉', description: 'Area damage. Burns everything nearby.', primary: '#66BB6A', accent: '#FFF176', eyeColor: '#F44336', tiers: [{ cost: 300, damage: 20, range: 3.0, speed: 2000, special: { type: 'aoe', radius: 1.0 } },{ cost: 200, damage: 29, range: 3.0, speed: 1870, special: { type: 'aoe', radius: 1.5 } },{ cost: 300, damage: 43, range: 3.5, speed: 1650, special: { type: 'aoe', radius: 2.0, burn: { dps: 4.5, dur: 2000 } } }] },
];

export const ENEMY_DATA = [
    { id: 'tamago', name: 'Tamago', hp: 15, speed: 1.0, money: 5, lifePenalty: 1, tier: 'Common', color: '#FFD54F' },
    { id: 'salmon', name: 'Salmon', hp: 30, speed: 1.0, money: 8, lifePenalty: 1, tier: 'Common', color: '#FF8A65' },
    { id: 'squid', name: 'Squid', hp: 55, speed: 0.8, money: 9, lifePenalty: 2, tier: 'Standard', color: '#ECEFF1' },
    { id: 'shrimp', name: 'Shrimp', hp: 72, speed: 1.1, money: 10, lifePenalty: 2, tier: 'Standard', color: '#FFAB91' },
    { id: 'tuna', name: 'Tuna', hp: 94, speed: 1.0, money: 13, lifePenalty: 2, tier: 'Standard', color: '#EF5350' },
    { id: 'mackerel', name: 'Mackerel', hp: 121, speed: 1.2, money: 16, lifePenalty: 3, tier: 'Premium', color: '#90A4AE' },
    { id: 'scallop', name: 'Hotate', hp: 154, speed: 1.0, money: 19, lifePenalty: 3, tier: 'Premium', color: '#FFF9C4' },
    { id: 'ikura', name: 'Ikura', hp: 198, speed: 1.1, money: 24, lifePenalty: 5, tier: 'Deluxe', color: '#FF7043' },
    { id: 'uni', name: 'Uni', hp: 264, speed: 0.9, money: 30, lifePenalty: 5, tier: 'Deluxe', color: '#FFB300' },
    { id: 'wagyu', name: 'Wagyu', hp: 385, speed: 0.8, money: 42, lifePenalty: 6, tier: 'Boss', color: '#EF5350' },
];

function e(id, count) { return { id, count }; }

const KAITEN_PATH = [
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

const KAITEN_ROUNDS = [
    { round: 1, waves: [e('tamago', 8)], spawnInterval: 1700 },
    { round: 2, waves: [e('tamago', 5), e('salmon', 4)], spawnInterval: 1560 },
    { round: 3, waves: [e('salmon', 5), e('squid', 5)], spawnInterval: 1380 },
    { round: 4, waves: [e('squid', 4), e('shrimp', 5), e('tuna', 3)], spawnInterval: 1270 },
    { round: 5, waves: [e('shrimp', 5), e('tuna', 5), e('mackerel', 3)], spawnInterval: 1180 },
    { round: 6, waves: [e('mackerel', 6), e('scallop', 3), e('salmon', 4)], spawnInterval: 1090 },
    { round: 7, waves: [e('scallop', 4), e('ikura', 3), e('tuna', 6)], spawnInterval: 1010 },
    { round: 8, waves: [e('ikura', 4), e('uni', 3), e('mackerel', 5)], spawnInterval: 920 },
    { round: 9, waves: [e('uni', 4), e('wagyu', 2), e('scallop', 4)], spawnInterval: 850 },
    { round: 10, waves: [e('wagyu', 3), e('uni', 4), e('ikura', 5)], spawnInterval: 750 },
];

export const MAP_DEFINITIONS = [
    {
        id: 'kaiten', name: 'Kaiten Corner', subtitle: 'The Classic Snake', difficulty: 1,
        type: 'single',
        path: KAITEN_PATH,
        rounds: KAITEN_ROUNDS,
    },
    {
        id: 'fork', name: 'The Fork', subtitle: 'Branching Paths', difficulty: 2,
        type: 'branching',
        shared_start: [{x:0,y:0},{x:1,y:0},{x:2,y:0},{x:3,y:0}],
        branchA: [{x:4,y:0},{x:5,y:0},{x:6,y:0},{x:7,y:0},{x:7,y:1},{x:7,y:2},{x:7,y:3},{x:7,y:4},{x:6,y:4},{x:5,y:4},{x:4,y:4}],
        branchB: [{x:3,y:1},{x:3,y:2},{x:2,y:2},{x:1,y:2},{x:0,y:2},{x:0,y:3},{x:0,y:4},{x:1,y:4},{x:2,y:4},{x:3,y:4},{x:4,y:4}],
        shared_end: [{x:4,y:5},{x:4,y:6},{x:4,y:7},{x:5,y:7},{x:6,y:7},{x:7,y:7},{x:7,y:8},{x:7,y:9}],
        rounds: [
            { round: 1, waves: [e('tamago', 6), e('salmon', 4)], spawnInterval: 1650 },
            { round: 2, waves: [e('salmon', 5), e('squid', 4)], spawnInterval: 1525 },
            { round: 3, waves: [e('squid', 4), e('shrimp', 3), e('tuna', 3)], spawnInterval: 1325 },
            { round: 4, waves: [e('shrimp', 5), e('tuna', 4), e('mackerel', 3)], spawnInterval: 1225 },
            { round: 5, waves: [e('mackerel', 4), e('scallop', 3), e('salmon', 4)], spawnInterval: 1125 },
            { round: 6, waves: [e('scallop', 4), e('ikura', 3), e('tuna', 4)], spawnInterval: 1025 },
            { round: 7, waves: [e('ikura', 3), e('uni', 3), e('mackerel', 4)], spawnInterval: 925 },
            { round: 8, waves: [e('wagyu', 2), e('uni', 3), e('ikura', 4)], spawnInterval: 825 },
            { round: 9, waves: [e('ikura', 4), e('uni', 3), e('mackerel', 5)], spawnInterval: 780 },
            { round: 10, waves: [e('wagyu', 2), e('uni', 4), e('scallop', 4), e('ikura', 3)], spawnInterval: 720 },
        ],
    },
    {
        id: 'spiral', name: 'The Spiral', subtitle: 'Compact Whirlpool', difficulty: 3,
        type: 'single',
        path: [
            {x:0,y:0},{x:1,y:0},{x:2,y:0},{x:3,y:0},{x:4,y:0},{x:5,y:0},
            {x:5,y:1},{x:5,y:2},{x:5,y:3},{x:5,y:4},{x:5,y:5},
            {x:4,y:5},{x:3,y:5},{x:2,y:5},
            {x:2,y:4},{x:2,y:3},{x:2,y:2},
            {x:3,y:2},{x:4,y:2},
            {x:4,y:3},
        ],
        rounds: [
            { round: 1, waves: [e('squid', 4), e('shrimp', 4)], spawnInterval: 1600 },
            { round: 2, waves: [e('tuna', 4), e('mackerel', 3), e('squid', 3)], spawnInterval: 1400 },
            { round: 3, waves: [e('mackerel', 4), e('scallop', 3), e('shrimp', 3)], spawnInterval: 1200 },
            { round: 4, waves: [e('scallop', 3), e('ikura', 3), e('tuna', 5)], spawnInterval: 990 },
            { round: 5, waves: [e('uni', 3), e('ikura', 3), e('mackerel', 4)], spawnInterval: 900 },
            { round: 6, waves: [e('wagyu', 2), e('uni', 3), e('scallop', 5)], spawnInterval: 810 },
            { round: 7, waves: [e('scallop', 5), e('ikura', 3), e('tuna', 6)], spawnInterval: 870 },
            { round: 8, waves: [e('ikura', 4), e('uni', 3), e('mackerel', 6)], spawnInterval: 780 },
            { round: 9, waves: [e('uni', 3), e('wagyu', 2), e('ikura', 5), e('scallop', 4)], spawnInterval: 720 },
            { round: 10, waves: [e('wagyu', 3), e('uni', 3), e('ikura', 5), e('mackerel', 5)], spawnInterval: 640 },
        ],
    },
    {
        id: 'cross', name: 'The Crossroads', subtitle: 'Intersection', difficulty: 4,
        type: 'cross',
        path: [
            {x:0,y:0},{x:1,y:0},{x:2,y:0},{x:3,y:0},{x:4,y:0},
            {x:4,y:1},{x:4,y:2},{x:4,y:3},
            {x:4,y:4},
            {x:5,y:4},{x:6,y:4},{x:7,y:4},
            {x:7,y:5},{x:7,y:6},{x:7,y:7},{x:7,y:8},{x:7,y:9},
            {x:6,y:9},{x:5,y:9},{x:4,y:9},
            {x:4,y:8},{x:4,y:7},{x:4,y:6},{x:4,y:5},
            {x:4,y:4},
            {x:3,y:4},{x:2,y:4},{x:1,y:4},{x:0,y:4},
            {x:0,y:5},{x:0,y:6},{x:0,y:7},{x:0,y:8},{x:0,y:9},
        ],
        crossCell: {x:4,y:4},
        rounds: [
            { round: 1, waves: [e('tuna', 4), e('mackerel', 3), e('shrimp', 3)], spawnInterval: 1400 },
            { round: 2, waves: [e('mackerel', 4), e('scallop', 3), e('squid', 3)], spawnInterval: 1200 },
            { round: 3, waves: [e('scallop', 3), e('ikura', 3), e('mackerel', 5)], spawnInterval: 1100 },
            { round: 4, waves: [e('ikura', 4), e('uni', 3), e('scallop', 4)], spawnInterval: 1000 },
            { round: 5, waves: [e('uni', 3), e('wagyu', 2), e('ikura', 5)], spawnInterval: 920 },
            { round: 6, waves: [e('wagyu', 3), e('uni', 4), e('ikura', 4)], spawnInterval: 800 },
            { round: 7, waves: [e('scallop', 4), e('ikura', 3), e('tuna', 6)], spawnInterval: 980 },
            { round: 8, waves: [e('ikura', 4), e('uni', 3), e('mackerel', 5)], spawnInterval: 900 },
            { round: 9, waves: [e('uni', 4), e('wagyu', 2), e('scallop', 4), e('ikura', 3)], spawnInterval: 835 },
            { round: 10, waves: [e('wagyu', 3), e('uni', 4), e('ikura', 5)], spawnInterval: 745 },
        ],
    },
];

export function getMapById(id) {
    return MAP_DEFINITIONS.find(m => m.id === id) || MAP_DEFINITIONS[0];
}

export class MapContext {
    constructor(mapDef) {
        this.def = mapDef;
        this._buildAllPaths();
        this._recompute();
    }

    _buildAllPaths() {
        const d = this.def;
        if (d.type === 'branching') {
            this._pathA = [...d.shared_start, ...d.branchA, ...d.shared_end];
            this._pathB = [...d.shared_start, ...d.branchB, ...d.shared_end];
            this._allPathArrays = [this._pathA, this._pathB];
        } else {
            this._allPathArrays = [d.path];
        }
    }

    _recompute() {
        this._beltSet = new Set();
        for (const path of this._allPathArrays) {
            for (const p of path) this._beltSet.add(`${p.x},${p.y}`);
        }

        const dirSets = {};
        for (const path of this._allPathArrays) {
            for (let i = 0; i < path.length; i++) {
                const p = path[i];
                const key = `${p.x},${p.y}`;
                if (!dirSets[key]) dirSets[key] = new Set();
                const prev = i > 0 ? path[i - 1] : null;
                const next = i < path.length - 1 ? path[i + 1] : null;
                if (prev) {
                    if (prev.x < p.x) dirSets[key].add('left');
                    if (prev.x > p.x) dirSets[key].add('right');
                    if (prev.y < p.y) dirSets[key].add('top');
                    if (prev.y > p.y) dirSets[key].add('bottom');
                }
                if (next) {
                    if (next.x < p.x) dirSets[key].add('left');
                    if (next.x > p.x) dirSets[key].add('right');
                    if (next.y < p.y) dirSets[key].add('top');
                    if (next.y > p.y) dirSets[key].add('bottom');
                }
            }
        }

        this._flowDirs = {};
        for (const path of this._allPathArrays) {
            for (let i = 0; i < path.length; i++) {
                const p = path[i];
                const key = `${p.x},${p.y}`;
                const next = i < path.length - 1 ? path[i + 1] : null;
                if (next && !this._flowDirs[key]) {
                    this._flowDirs[key] = next.x !== p.x ? (next.x > p.x ? 1 : -1) : (next.y > p.y ? 1 : -1);
                }
            }
        }

        this._tileTypes = {};
        for (const [key, dirs] of Object.entries(dirSets)) {
            this._tileTypes[key] = this._resolveTileType(dirs);
        }
    }

    _resolveTileType(dirs) {
        if (dirs.size >= 4) return 'cross';
        if (dirs.size === 3) {
            if (!dirs.has('top')) return 't-bottom';
            if (!dirs.has('bottom')) return 't-top';
            if (!dirs.has('left')) return 't-right';
            return 't-left';
        }
        if (dirs.has('left') && dirs.has('right')) return 'h';
        if (dirs.has('top') && dirs.has('bottom')) return 'v';
        if (dirs.has('left') && dirs.has('bottom')) return 'corner-lb';
        if (dirs.has('left') && dirs.has('top')) return 'corner-lt';
        if (dirs.has('right') && dirs.has('bottom')) return 'corner-rb';
        if (dirs.has('right') && dirs.has('top')) return 'corner-rt';
        if (dirs.size === 1) return (dirs.has('left') || dirs.has('right')) ? 'h' : 'v';
        return 'h';
    }

    getEnemyPath() {
        const d = this.def;
        if (d.type === 'branching') {
            return Math.random() < 0.5 ? this._pathA : this._pathB;
        }
        return d.path;
    }

    isBeltCell(col, row) { return this._beltSet.has(`${col},${row}`); }

    isBuildable(col, row) {
        if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) return false;
        if (this.isBeltCell(col, row)) return false;
        for (const [dx, dy] of [[0,-1],[0,1],[-1,0],[1,0]]) {
            if (this.isBeltCell(col + dx, row + dy)) return true;
        }
        return false;
    }

    getBeltTileType(col, row) { return this._tileTypes[`${col},${row}`] || null; }
    getBeltFlowDir(col, row) { return this._flowDirs[`${col},${row}`] || 1; }

    getEntry() {
        const d = this.def;
        if (d.type === 'branching') return d.shared_start[0];
        return d.path[0];
    }

    getExit() {
        const d = this.def;
        if (d.type === 'branching') return d.shared_end[d.shared_end.length - 1];
        return d.path[d.path.length - 1];
    }
}

// Backward-compatible exports
export const MAP_PATH = KAITEN_PATH;
export const ROUND_DATA = KAITEN_ROUNDS;
export const TEST_ROUND_DATA = [
    { round: 1, waves: [e('tamago', 3), e('salmon', 3), e('squid', 3), e('shrimp', 3)], spawnInterval: 1200 },
    { round: 2, waves: [e('tuna', 3), e('mackerel', 3), e('scallop', 3), e('ikura', 3)], spawnInterval: 1200 },
    { round: 3, waves: [e('uni', 3), e('wagyu', 3), e('tamago', 2), e('salmon', 2), e('squid', 2), e('shrimp', 2), e('tuna', 2), e('mackerel', 2), e('scallop', 2), e('ikura', 2)], spawnInterval: 1000 },
];

const _defaultCtx = new MapContext(MAP_DEFINITIONS[0]);
export function isBeltCell(col, row) { return _defaultCtx.isBeltCell(col, row); }
export function isBuildable(col, row) { return _defaultCtx.isBuildable(col, row); }
export function getBeltTileType(col, row) { return _defaultCtx.getBeltTileType(col, row); }
export function getBeltFlowDir(col, row) { return _defaultCtx.getBeltFlowDir(col, row); }

export function cellToPixel(col, row) {
    return { x: GRID_OFFSET_X + col * CELL_SIZE + CELL_SIZE / 2, y: GRID_OFFSET_Y + row * CELL_SIZE + CELL_SIZE / 2 };
}

export function pixelToCell(px, py) {
    return { col: Math.floor((px - GRID_OFFSET_X) / CELL_SIZE), row: Math.floor((py - GRID_OFFSET_Y) / CELL_SIZE) };
}

export function getTotalCost(towerData, tier) {
    let total = 0;
    for (let i = 0; i <= tier; i++) total += towerData.tiers[i].cost;
    return total;
}

export function getSellValue(towerData, tier) { return Math.floor(getTotalCost(towerData, tier) * SELL_REFUND_RATE); }
export function getUpgradeCost(towerData, tier) { return tier >= 2 ? null : towerData.tiers[tier + 1].cost; }
export function getRoundBonus(roundNum) { return 30 + roundNum * 7; }

export function buildSpawnQueue(roundData) {
    const queue = [];
    for (const w of roundData.waves) {
        for (let i = 0; i < w.count; i++) queue.push(w.id);
    }
    for (let i = queue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [queue[i], queue[j]] = [queue[j], queue[i]];
    }
    return queue;
}
