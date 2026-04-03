import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS, ENEMY_DATA, MAP_DEFINITIONS, GRID_COLS, GRID_ROWS, MapContext } from './data.js';
import { InputManager } from './input.js';
import { GameState } from './game.js';
import { AudioManager } from './audio.js';
import {
    renderGame, renderStartWaveBtn, renderOverlay,
    handleGameClick, renderAudioToggle, getAudioBtnRect,
} from './ui.js';
import { drawTower, drawButton, drawNigiri, drawBeltTile, drawDifficultyStars } from './sprites.js';
import { loadAllSprites } from './sprite-loader.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

function fitCanvas() {
    const pad = 16;
    const scaleX = (window.innerWidth - pad) / CANVAS_WIDTH;
    const scaleY = (window.innerHeight - pad) / CANVAS_HEIGHT;
    const scale = Math.min(scaleX, scaleY, 2);
    canvas.style.width = Math.floor(CANVAS_WIDTH * scale) + 'px';
    canvas.style.height = Math.floor(CANVAS_HEIGHT * scale) + 'px';
}
fitCanvas();
window.addEventListener('resize', fitCanvas);

const input = new InputManager(canvas);
const audio = new AudioManager();
const game = new GameState(audio);

let screen = 'title';
let lastTime = performance.now();
let titlePhase = 0;
let pendingTestMode = false;
let hoveredMapIdx = -1;

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
            const btnX = CANVAS_WIDTH / 2 - 80;
            const btnY = CANVAS_HEIGHT * 0.6;
            if (click.x >= btnX && click.x <= btnX + 160 && click.y >= btnY && click.y <= btnY + 44) {
                audio._ensureContext();
                audio.playClick();
                pendingTestMode = false;
                screen = 'mapSelect';
            }
            const testBtnY = CANVAS_HEIGHT * 0.6 + 56;
            if (click.x >= btnX && click.x <= btnX + 160 && click.y >= testBtnY && click.y <= testBtnY + 44) {
                audio._ensureContext();
                audio.playClick();
                pendingTestMode = true;
                screen = 'mapSelect';
            }
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
            for (let i = 0; i < cards.length; i++) {
                const c = cards[i];
                if (click.x >= c.x && click.x <= c.x + c.w &&
                    click.y >= c.y && click.y <= c.y + c.h) {
                    audio.playClick();
                    startGameWithMap(MAP_DEFINITIONS[i].id);
                    return;
                }
            }
        }

        for (let i = 0; i < MAP_DEFINITIONS.length; i++) {
            if (input.wasKeyPressed(String(i + 1))) {
                startGameWithMap(MAP_DEFINITIONS[i].id);
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
    } else if (screen === 'gameplay') {
        game.update(dt);

        const click = input.consumeClick();
        if (click) {
            if (handleAudioToggleClick(click)) return;

            if (game.gameOver || game.victory) {
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
            } else {
                handleGameClick(game, click.x, click.y, input);
            }
        }

        if (input.wasKeyPressed(' ')) game.startWave();
        if (input.wasKeyPressed('Escape')) {
            if (game.placingTowerId) game.placingTowerId = null;
            else game.selectedTower = null;
        }
        if (input.wasKeyPressed('u') || input.wasKeyPressed('U')) {
            if (game.selectedTower) game.upgradeTower(game.selectedTower);
        }
        if (input.wasKeyPressed('s') || input.wasKeyPressed('S')) {
            if (game.selectedTower) game.sellTower(game.selectedTower);
        }
        if (input.wasKeyPressed('m') || input.wasKeyPressed('M')) {
            audio._ensureContext();
            audio.toggle();
            startBgmIfUnmuted();
        }
    }
}

function startGameWithMap(mapId) {
    game.reset(mapId, pendingTestMode);
    screen = 'gameplay';
    startBgmIfUnmuted();
}

function render() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (screen === 'title') {
        renderTitle();
    } else if (screen === 'mapSelect') {
        renderMapSelect();
    } else if (screen === 'gameplay') {
        renderGame(ctx, game, input);
        renderStartWaveBtn(ctx, game);
        renderOverlay(ctx, game);
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

    drawButton(ctx, cx - 80, CANVAS_HEIGHT * 0.6, 160, 44, 'New Game', '#E74C3C', true);
    drawButton(ctx, cx - 80, CANVAS_HEIGHT * 0.6 + 56, 160, 44, 'Test Mode', '#7F8C8D', true);

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

    drawDifficultyStars(ctx, rect.x + rect.w / 2 - 30, textY + 18, mapDef.difficulty, 5, 7);

    ctx.fillStyle = '#999';
    ctx.font = `italic 10px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(mapDef.subtitle, rect.x + rect.w / 2, textY + 32);

    ctx.fillStyle = '#CCC';
    ctx.font = `10px sans-serif`;
    ctx.fillText(`[${idx + 1}]`, rect.x + rect.w / 2, textY + 46);
}

loadAllSprites().then(() => {
    requestAnimationFrame(gameLoop);
});
