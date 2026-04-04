import {
    CANVAS_WIDTH, CANVAS_HEIGHT, COLORS, ENEMY_DATA, MAP_DEFINITIONS, GRID_COLS, GRID_ROWS, MapContext,
    DIFFICULTY_ORDER, DIFFICULTY_PROFILES, getMapById,
} from './data.js';
import { InputManager } from './input.js';
import { GameState } from './game.js';
import { AudioManager } from './audio.js';
import {
    renderGame, renderStartWaveBtn, renderTitleMenuBtn, renderOverlay,
    handleGameClick, renderAudioToggle, getAudioBtnRect, hitTitleMenuBtn,
    hitScreenBackButton, renderScreenBackButton, hitPauseResumeBtn, tryConsumeWaveControlClick,
} from './ui.js';
import {
    drawTower, drawButton, drawNigiri, drawBeltTile,
    drawHeart, drawCoin, drawKitchenDoor, drawGarbageBin,
} from './sprites.js';
import { loadAllSprites } from './sprite-loader.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

/**
 * Landscape: height-limits scale — use standard sidebar density so the shop fits.
 * Portrait phone: compact sidebar + larger type. iPad: shortSide > 540 → desktop sidebar.
 */
function getViewportState() {
    try {
        const vw = window.visualViewport?.width ?? window.innerWidth;
        const vh = window.visualViewport?.height ?? window.innerHeight;
        const shortSide = Math.min(vw, vh);
        const landscape = vw > vh;
        const coarse = window.matchMedia('(pointer: coarse)').matches;
        return {
            landscape,
            touchHandheld: coarse && shortSide <= 900,
            compactSidebar: coarse && shortSide <= 540 && !landscape,
        };
    } catch {
        return { landscape: false, touchHandheld: false, compactSidebar: false };
    }
}

function fitCanvas() {
    const vw = window.visualViewport?.width ?? window.innerWidth;
    const vh = window.visualViewport?.height ?? window.innerHeight;
    const landscape = vw > vh;
    const coarse = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;
    let pad = 16;
    if (coarse) pad = landscape ? 2 : 6;
    const scaleX = (vw - pad) / CANVAS_WIDTH;
    const scaleY = (vh - pad) / CANVAS_HEIGHT;
    const scale = Math.min(scaleX, scaleY, 2);
    canvas.style.width = Math.floor(CANVAS_WIDTH * scale) + 'px';
    canvas.style.height = Math.floor(CANVAS_HEIGHT * scale) + 'px';
}
fitCanvas();
window.addEventListener('resize', fitCanvas);
window.addEventListener('orientationchange', () => requestAnimationFrame(fitCanvas));
if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', fitCanvas);
    window.visualViewport.addEventListener('scroll', fitCanvas);
}

const input = new InputManager(canvas);
const audio = new AudioManager();
const game = new GameState(audio);

let screen = 'title';
let lastTime = performance.now();
let titlePhase = 0;
let pendingTestMode = false;
let pendingMapId = null;
let hoveredMapIdx = -1;
let hoveredDifficultyIdx = -1;

const mapPreviewCache = new Map();

function getMapPreview(mapDef) {
    if (mapPreviewCache.has(mapDef.id)) return mapPreviewCache.get(mapDef.id);
    const mc = new MapContext(mapDef);
    const cells = [];
    for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
            if (mc.isBeltCell(c, r)) {
                cells.push({ x: c, y: r, type: mc.getBeltTileType(c, r) });
            }
        }
    }
    const result = { cells, entry: mc.getEntry(), exit: mc.getExit() };
    mapPreviewCache.set(mapDef.id, result);
    return result;
}

function gameLoop(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    update(dt);
    render();
    input.endFrame();
    requestAnimationFrame(gameLoop);
}

function startBgmIfUnmuted() {
    if (!audio.muted) audio.startBGM();
}

function handleAudioToggleClick(click) {
    const b = getAudioBtnRect();
    if (click.x >= b.x && click.x <= b.x + b.w &&
        click.y >= b.y && click.y <= b.y + b.h) {
        audio._ensureContext();
        audio.toggle();
        startBgmIfUnmuted();
        return true;
    }
    return false;
}

function update(dt) {
    titlePhase += dt;

    if (screen === 'title') {
        const click = input.consumeClick();
        if (click) {
            if (handleAudioToggleClick(click)) return;
            for (let i = 0; i < 3; i++) {
                const b = getMainMenuButtonRect(i);
                if (click.x >= b.x && click.x <= b.x + b.w &&
                    click.y >= b.y && click.y <= b.y + b.h) {
                    audio._ensureContext();
                    audio.playClick();
                    if (i === 0) {
                        pendingTestMode = false;
                        screen = 'mapSelect';
                    } else if (i === 1) {
                        screen = 'howToPlay';
                    } else {
                        pendingTestMode = true;
                        screen = 'mapSelect';
                    }
                    return;
                }
            }
        }
        if (input.wasKeyPressed('m') || input.wasKeyPressed('M')) {
            audio._ensureContext();
            audio.toggle();
            startBgmIfUnmuted();
        }
    } else if (screen === 'howToPlay') {
        const click = input.consumeClick();
        if (click) {
            if (handleAudioToggleClick(click)) return;
            const bb = getHowToPlayBackRect();
            if (click.x >= bb.x && click.x <= bb.x + bb.w &&
                click.y >= bb.y && click.y <= bb.y + bb.h) {
                audio.playClick();
                screen = 'title';
            }
        }
        if (input.wasKeyPressed('Escape')) {
            screen = 'title';
        }
        if (input.wasKeyPressed('m') || input.wasKeyPressed('M')) {
            audio._ensureContext();
            audio.toggle();
            startBgmIfUnmuted();
        }
    } else if (screen === 'mapSelect') {
        hoveredMapIdx = -1;
        const cards = getMapCardRects();
        for (let i = 0; i < cards.length; i++) {
            const c = cards[i];
            if (input.mouseX >= c.x && input.mouseX <= c.x + c.w &&
                input.mouseY >= c.y && input.mouseY <= c.y + c.h) {
                hoveredMapIdx = i;
            }
        }

        const click = input.consumeClick();
        if (click) {
            if (handleAudioToggleClick(click)) return;
            if (hitScreenBackButton(click.x, click.y)) {
                audio.playClick();
                screen = 'title';
                return;
            }
            for (let i = 0; i < cards.length; i++) {
                const c = cards[i];
                if (click.x >= c.x && click.x <= c.x + c.w &&
                    click.y >= c.y && click.y <= c.y + c.h) {
                    audio.playClick();
                    pendingMapId = MAP_DEFINITIONS[i].id;
                    screen = 'difficultySelect';
                    return;
                }
            }
        }

        for (let i = 0; i < MAP_DEFINITIONS.length; i++) {
            if (input.wasKeyPressed(String(i + 1))) {
                pendingMapId = MAP_DEFINITIONS[i].id;
                screen = 'difficultySelect';
                return;
            }
        }
        if (input.wasKeyPressed('Escape')) {
            screen = 'title';
        }
        if (input.wasKeyPressed('m') || input.wasKeyPressed('M')) {
            audio._ensureContext();
            audio.toggle();
            startBgmIfUnmuted();
        }
    } else if (screen === 'difficultySelect') {
        hoveredDifficultyIdx = -1;
        const dRects = getDifficultySelectRects();
        for (let i = 0; i < dRects.length; i++) {
            const c = dRects[i];
            if (input.mouseX >= c.x && input.mouseX <= c.x + c.w &&
                input.mouseY >= c.y && input.mouseY <= c.y + c.h) {
                hoveredDifficultyIdx = i;
            }
        }

        const click = input.consumeClick();
        if (click) {
            if (handleAudioToggleClick(click)) return;
            if (hitScreenBackButton(click.x, click.y)) {
                audio.playClick();
                screen = 'mapSelect';
                pendingMapId = null;
                return;
            }
            for (let i = 0; i < dRects.length; i++) {
                const c = dRects[i];
                if (click.x >= c.x && click.x <= c.x + c.w &&
                    click.y >= c.y && click.y <= c.y + c.h) {
                    audio.playClick();
                    startGameWithMap(pendingMapId, DIFFICULTY_ORDER[i]);
                    pendingMapId = null;
                    return;
                }
            }
        }

        for (let i = 0; i < DIFFICULTY_ORDER.length; i++) {
            if (input.wasKeyPressed(String(i + 1))) {
                startGameWithMap(pendingMapId, DIFFICULTY_ORDER[i]);
                pendingMapId = null;
                return;
            }
        }
        if (input.wasKeyPressed('Escape')) {
            screen = 'mapSelect';
            pendingMapId = null;
        }
        if (input.wasKeyPressed('m') || input.wasKeyPressed('M')) {
            audio._ensureContext();
            audio.toggle();
            startBgmIfUnmuted();
        }
    } else if (screen === 'gameplay') {
        if (!game.paused) {
            game.update(dt * game.getTimeScale());
        }

        const click = input.consumeClick();
        if (click) {
            if (handleAudioToggleClick(click)) return;

            if (game.phase === 'victory_offer') {
                const c = game._continueInfiniteBtn;
                const d = game._declineInfiniteBtn;
                if (c && click.x >= c.x && click.x <= c.x + c.w &&
                    click.y >= c.y && click.y <= c.y + c.h) {
                    audio.playClick();
                    game.enterInfiniteMode();
                    startBgmIfUnmuted();
                } else if (d && click.x >= d.x && click.x <= d.x + d.w &&
                    click.y >= d.y && click.y <= d.y + d.h) {
                    audio.playClick();
                    game.declineInfiniteMode();
                }
            } else if (game.gameOver || game.victory) {
                if (game._retryBtn) {
                    const b = game._retryBtn;
                    if (click.x >= b.x && click.x <= b.x + b.w &&
                        click.y >= b.y && click.y <= b.y + b.h) {
                        audio.playClick();
                        screen = 'title';
                        game.reset();
                        startBgmIfUnmuted();
                    }
                }
            } else if (game.paused) {
                const vpPaused = getViewportState();
                if (hitTitleMenuBtn(click.x, click.y, game)) {
                    audio.playClick();
                    screen = 'title';
                    game.reset();
                    startBgmIfUnmuted();
                } else if (hitPauseResumeBtn(game, click.x, click.y)) {
                    audio.playClick();
                    game.paused = false;
                } else if (tryConsumeWaveControlClick(game, click.x, click.y, vpPaused)) {
                    /* click sound inside handler */
                }
            } else {
                if (hitTitleMenuBtn(click.x, click.y, game)) {
                    audio.playClick();
                    screen = 'title';
                    game.reset();
                    startBgmIfUnmuted();
                } else {
                    handleGameClick(game, click.x, click.y, input, getViewportState());
                }
            }
        }

        if (input.wasKeyPressed('p') || input.wasKeyPressed('P')) {
            if (!game.gameOver && !game.victory && game.phase !== 'victory_offer') {
                game.paused = !game.paused;
            }
        }
        if (input.wasKeyPressed(' ') && !game.paused && game.phase !== 'victory_offer') game.startWave();
        if (input.wasKeyPressed('Escape')) {
            if (game.phase === 'victory_offer') {
                /* ignore — choose with buttons */
            } else if (game.paused) {
                game.paused = false;
            } else if (game.placingTowerId) {
                game.placingTowerId = null;
            } else {
                game.selectedTower = null;
            }
        }
        if (input.wasKeyPressed('u') || input.wasKeyPressed('U')) {
            if (!game.paused && game.selectedTower) game.upgradeTower(game.selectedTower);
        }
        if (input.wasKeyPressed('s') || input.wasKeyPressed('S')) {
            if (!game.paused && game.selectedTower) game.sellTower(game.selectedTower);
        }
        if (input.wasKeyPressed('m') || input.wasKeyPressed('M')) {
            audio._ensureContext();
            audio.toggle();
            startBgmIfUnmuted();
        }
    }
}

function startGameWithMap(mapId, difficultyId = 'easy') {
    game.reset(mapId, pendingTestMode, difficultyId);
    screen = 'gameplay';
    startBgmIfUnmuted();
}

const MAIN_MENU_BTN_W = 168;
const MAIN_MENU_BTN_H = 44;
const MAIN_MENU_BTN_GAP = 52;
const MAIN_MENU_BTN_X = CANVAS_WIDTH / 2 - MAIN_MENU_BTN_W / 2;
const MAIN_MENU_BASE_Y = Math.round(CANVAS_HEIGHT * 0.545);

function getMainMenuButtonRect(i) {
    return {
        x: MAIN_MENU_BTN_X,
        y: MAIN_MENU_BASE_Y + i * MAIN_MENU_BTN_GAP,
        w: MAIN_MENU_BTN_W,
        h: MAIN_MENU_BTN_H,
    };
}

function getHowToPlayBackRect() {
    return { x: CANVAS_WIDTH / 2 - 70, y: CANVAS_HEIGHT - 96, w: 140, h: 42 };
}

function renderHowToPlay() {
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const cx = CANVAS_WIDTH / 2;
    ctx.fillStyle = '#E74C3C';
    ctx.font = `bold 32px 'Arial Rounded MT Bold', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('How to Play', cx, 44);

    const beltY = 108;
    const tile = 42;
    const nTiles = 12;
    const beltW = nTiles * tile;
    const beltX = cx - beltW / 2;
    const beltMidY = beltY + tile / 2;

    drawKitchenDoor(ctx, beltX - 22, beltMidY, tile);
    for (let i = 0; i < nTiles; i++) {
        drawBeltTile(ctx, beltX + i * tile, beltY, tile, 'h');
    }
    drawGarbageBin(ctx, beltX + beltW + 22, beltMidY, tile);

    const t = Date.now() * 0.001;
    const ndSalmon = ENEMY_DATA.find(e => e.id === 'salmon');
    const ndTamago = ENEMY_DATA.find(e => e.id === 'tamago');
    if (ndSalmon) {
        const slide = Math.sin(t * 1.4) * tile * 2.2;
        const bob = Math.sin(t * 3 + 1) * 2.5;
        drawNigiri(ctx, beltX + tile * 4.5 + slide, beltMidY + bob, 40, ndSalmon, 1);
    }
    if (ndTamago) {
        const slide = Math.sin(t * 1.1 + 1.7) * tile * 2.4;
        const bob = Math.sin(t * 3 + 2.5) * 2.5;
        drawNigiri(ctx, beltX + tile * 6.8 + slide, beltMidY + bob, 38, ndTamago, 1);
    }

    const crewY = beltY + tile + 42;
    const wobble = titlePhase * 2;
    drawTower(ctx, 'cat', cx - 118, crewY + Math.sin(wobble) * 3, 54, 'idle');
    drawTower(ctx, 'penguin', cx, crewY + 2 + Math.sin(wobble + 1) * 3, 58, 'idle');
    drawTower(ctx, 'shiba', cx + 118, crewY + Math.sin(wobble + 2) * 3, 54, 'idle');

    const iconY = crewY + 52;
    drawHeart(ctx, cx - 88, iconY, 26);
    drawCoin(ctx, cx + 88, iconY, 24);
    ctx.font = `12px sans-serif`;
    ctx.fillStyle = '#888';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('hearts · cash', cx, iconY);

    ctx.fillStyle = COLORS.textPrimary;
    ctx.font = `bold 18px 'Arial Rounded MT Bold', sans-serif`;
    ctx.textBaseline = 'top';
    ctx.fillText('Sushi rolls toward the bin. Animals along the belt eat what they can.', cx, iconY + 28);
    ctx.font = `15px 'Arial Rounded MT Bold', sans-serif`;
    ctx.fillStyle = '#666';
    ctx.fillText('Pick a map, difficulty, then place animals and start the wave.', cx, iconY + 52);

    const premiseY = iconY + 86;
    const premiseLineH = 23;
    const premiseLines = [
        'Small kaiten setup: belt runs toward the trash at the end.',
        'Put animals next to the belt—they eat plates as they roll past.',
        'Each wave is a little busier. See how far you get.',
    ];
    ctx.font = `15px 'Arial Rounded MT Bold', 'Nunito', sans-serif`;
    ctx.fillStyle = '#5C5348';
    ctx.textBaseline = 'top';
    let py = premiseY;
    for (const pl of premiseLines) {
        ctx.fillText(pl, cx, py);
        py += premiseLineH;
    }

    const bb = getHowToPlayBackRect();
    drawButton(ctx, bb.x, bb.y, bb.w, bb.h, 'Back', '#7F8C8D', true);

    ctx.fillStyle = '#AAA';
    ctx.font = `12px sans-serif`;
    ctx.textBaseline = 'middle';
    ctx.fillText('Esc to return', cx, CANVAS_HEIGHT - 34);
}

function render() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (screen === 'title') {
        renderTitle();
    } else if (screen === 'howToPlay') {
        renderHowToPlay();
    } else if (screen === 'mapSelect') {
        renderMapSelect();
        renderScreenBackButton(ctx, input.mouseX, input.mouseY);
    } else if (screen === 'difficultySelect') {
        renderDifficultySelect();
        renderScreenBackButton(ctx, input.mouseX, input.mouseY);
    } else if (screen === 'gameplay') {
        const vp = getViewportState();
        renderGame(ctx, game, input, vp);
        renderTitleMenuBtn(ctx, game, input.mouseX, input.mouseY);
        renderOverlay(ctx, game);
        renderStartWaveBtn(ctx, game, vp);
    }

    renderAudioToggle(ctx, audio, input.mouseX, input.mouseY);
}

function renderTitle() {
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const cx = CANVAS_WIDTH / 2;
    const beltY = CANVAS_HEIGHT * 0.42;

    const tileSize = 64;
    const numTiles = Math.ceil(CANVAS_WIDTH / tileSize) + 1;
    for (let i = 0; i < numTiles; i++) {
        drawBeltTile(ctx, i * tileSize, beltY, tileSize, 'h');
    }

    const time = Date.now() * 0.001;
    const nigiriIds = ['tamago', 'salmon', 'tuna', 'shrimp'];
    for (let i = 0; i < nigiriIds.length; i++) {
        const nd = ENEMY_DATA.find(e => e.id === nigiriIds[i]);
        if (nd) {
            const nx = ((time * 40 + i * 240) % (CANVAS_WIDTH + 100)) - 50;
            drawNigiri(ctx, nx, beltY + 32, 50, nd, 1.0);
        }
    }

    const catBob = Math.sin(titlePhase * 2) * 4;
    drawTower(ctx, 'cat', cx - 120, beltY - 8 + catBob, 64, 'idle');
    drawTower(ctx, 'shiba', cx + 120, beltY - 8 + Math.sin(titlePhase * 2 + 1) * 4, 64, 'idle');
    drawTower(ctx, 'penguin', cx, beltY - 12 + Math.sin(titlePhase * 2 + 2) * 3, 72, 'idle');

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;
    ctx.fillStyle = '#E74C3C';
    ctx.font = `bold 56px 'Arial Rounded MT Bold', 'Nunito', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Nigiri TD', cx, CANVAS_HEIGHT * 0.18);
    ctx.restore();

    ctx.fillStyle = COLORS.textPrimary;
    ctx.font = `20px 'Arial Rounded MT Bold', sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('Defend the Sushi Counter!', cx, CANVAS_HEIGHT * 0.28);

    const tb = getMainMenuButtonRect(0);
    drawButton(ctx, tb.x, tb.y, tb.w, tb.h, 'New Game', '#E74C3C', true);
    drawButton(ctx, getMainMenuButtonRect(1).x, getMainMenuButtonRect(1).y, tb.w, tb.h, 'How to Play', '#3498DB', true);
    drawButton(ctx, getMainMenuButtonRect(2).x, getMainMenuButtonRect(2).y, tb.w, tb.h, 'Test Mode', '#7F8C8D', true);

    ctx.fillStyle = '#999';
    ctx.font = `14px 'Arial Rounded MT Bold', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('By Pwner Studios', cx, CANVAS_HEIGHT - 20);
}

const CARD_W = 172;
const CARD_H = 210;
const CARD_GAP = 14;

const MAP_SELECT_COLS = 2;

function getMapCardRects() {
    const maps = MAP_DEFINITIONS;
    const n = maps.length;
    const cols = MAP_SELECT_COLS;
    const rows = Math.ceil(n / cols);
    const totalW = cols * CARD_W + (cols - 1) * CARD_GAP;
    const rowGap = CARD_GAP;
    const totalH = rows * CARD_H + (rows - 1) * rowGap;
    const startX = (CANVAS_WIDTH - totalW) / 2;
    const headerBottom = 56;
    const footerTop = CANVAS_HEIGHT - 48;
    const startY = headerBottom + Math.max(12, (footerTop - headerBottom - totalH) / 2);
    const rects = [];
    for (let i = 0; i < n; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        rects.push({
            x: startX + col * (CARD_W + CARD_GAP),
            y: startY + row * (CARD_H + rowGap),
            w: CARD_W,
            h: CARD_H,
        });
    }
    return rects;
}

function renderMapSelect() {
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = '#E74C3C';
    ctx.font = `bold 32px 'Arial Rounded MT Bold', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(pendingTestMode ? 'Select Map (Test Mode)' : 'Select Map', CANVAS_WIDTH / 2, 40);

    const cards = getMapCardRects();
    for (let i = 0; i < MAP_DEFINITIONS.length; i++) {
        renderMapCard(ctx, cards[i], MAP_DEFINITIONS[i], i === hoveredMapIdx, i);
    }

    ctx.fillStyle = '#AAA';
    ctx.font = `12px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`Press 1-${MAP_DEFINITIONS.length} to quick select  |  Esc to go back`, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 30);
}

function renderMapCard(ctx, rect, mapDef, hovered, idx) {
    ctx.fillStyle = hovered ? 'rgba(249,229,71,0.15)' : '#FFFFFF';
    ctx.strokeStyle = hovered ? '#F1C40F' : COLORS.sidebarBorder;
    ctx.lineWidth = hovered ? 2.5 : 1;
    ctx.beginPath();
    ctx.roundRect(rect.x, rect.y, rect.w, rect.h, 10);
    ctx.fill();
    ctx.stroke();

    const preview = getMapPreview(mapDef);
    const cellSize = 14;
    const previewW = GRID_COLS * cellSize;
    const previewH = GRID_ROWS * cellSize;
    const px = rect.x + (rect.w - previewW) / 2;
    const py = rect.y + 8;

    ctx.fillStyle = '#F5F0E0';
    ctx.beginPath();
    ctx.roundRect(px - 2, py - 2, previewW + 4, previewH + 4, 4);
    ctx.fill();

    for (const cell of preview.cells) {
        const cx = px + cell.x * cellSize;
        const cy = py + cell.y * cellSize;
        ctx.fillStyle = COLORS.belt;
        ctx.fillRect(cx, cy, cellSize, cellSize);
        ctx.strokeStyle = COLORS.beltBorder;
        ctx.lineWidth = 0.5;
        ctx.strokeRect(cx, cy, cellSize, cellSize);
    }

    const ex = px + preview.entry.x * cellSize + cellSize / 2;
    const ey = py + preview.entry.y * cellSize + cellSize / 2;
    ctx.fillStyle = '#6D4C41';
    ctx.beginPath();
    ctx.arc(ex, ey, cellSize * 0.4, 0, Math.PI * 2);
    ctx.fill();

    const gx = px + preview.exit.x * cellSize + cellSize / 2;
    const gy = py + preview.exit.y * cellSize + cellSize / 2;
    ctx.fillStyle = '#607D8B';
    ctx.beginPath();
    ctx.arc(gx, gy, cellSize * 0.4, 0, Math.PI * 2);
    ctx.fill();

    const textY = py + previewH + 10;

    ctx.fillStyle = COLORS.textPrimary;
    ctx.font = `bold 13px 'Arial Rounded MT Bold', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(mapDef.name, rect.x + rect.w / 2, textY);

    ctx.fillStyle = '#CCC';
    ctx.font = `10px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`[${idx + 1}]`, rect.x + rect.w / 2, textY + 20);
}

const DIFF_BTN_W = 268;
const DIFF_BTN_H = 54;
const DIFF_BTN_GAP = 14;

function getDifficultySelectRects() {
    const n = DIFFICULTY_ORDER.length;
    const totalH = n * DIFF_BTN_H + (n - 1) * DIFF_BTN_GAP;
    const startY = (CANVAS_HEIGHT - totalH) / 2 + 28;
    const x = (CANVAS_WIDTH - DIFF_BTN_W) / 2;
    return DIFFICULTY_ORDER.map((id, i) => ({
        id,
        x,
        y: startY + i * (DIFF_BTN_H + DIFF_BTN_GAP),
        w: DIFF_BTN_W,
        h: DIFF_BTN_H,
    }));
}

function renderDifficultySelect() {
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const mapDef = getMapById(pendingMapId || 'kaiten');

    ctx.fillStyle = '#E74C3C';
    ctx.font = `bold 28px 'Arial Rounded MT Bold', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Select Difficulty', CANVAS_WIDTH / 2, 38);

    ctx.fillStyle = COLORS.textPrimary;
    ctx.font = `bold 18px 'Arial Rounded MT Bold', sans-serif`;
    ctx.fillText(mapDef.name, CANVAS_WIDTH / 2, 72);

    const rects = getDifficultySelectRects();
    for (let i = 0; i < rects.length; i++) {
        const r = rects[i];
        const prof = DIFFICULTY_PROFILES[DIFFICULTY_ORDER[i]];
        const hovered = i === hoveredDifficultyIdx;
        ctx.fillStyle = hovered ? 'rgba(249,229,71,0.12)' : '#FFFFFF';
        ctx.strokeStyle = hovered ? '#F1C40F' : COLORS.sidebarBorder;
        ctx.lineWidth = hovered ? 2 : 1;
        ctx.beginPath();
        ctx.roundRect(r.x, r.y, r.w, r.h, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = prof.accent;
        ctx.font = `bold 17px 'Arial Rounded MT Bold', sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(prof.label, r.x + 18, r.y + r.h / 2 - 9);

        ctx.fillStyle = '#777';
        ctx.font = `12px sans-serif`;
        ctx.fillText(prof.hint, r.x + 18, r.y + r.h / 2 + 11);

        ctx.fillStyle = '#CCC';
        ctx.font = `11px sans-serif`;
        ctx.textAlign = 'right';
        ctx.fillText(`[${i + 1}]`, r.x + r.w - 14, r.y + r.h / 2);
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = '#AAA';
    ctx.font = `12px sans-serif`;
    ctx.fillText('Press 1–3 to choose  ·  Esc for map list', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 28);
}

loadAllSprites().then(() => {
    requestAnimationFrame(gameLoop);
});
