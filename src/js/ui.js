import {
    CANVAS_WIDTH, CANVAS_HEIGHT, GAME_AREA_WIDTH, SIDEBAR_X, SIDEBAR_WIDTH,
    CELL_SIZE, GRID_COLS, GRID_ROWS, GRID_OFFSET_X, GRID_OFFSET_Y,
    COLORS, TOWER_DATA,
    cellToPixel, pixelToCell,
    getTotalCost,
} from './data.js';
import {
    drawTower, drawNigiri, drawHeart, drawCoin, drawButton,
    drawGarbageBin, drawKitchenDoor, drawSeatIndicator, drawBeltTile,
    drawTierStars, drawSpeakerIcon, drawDifficultyStars,
} from './sprites.js';

const SHOP_COLS = 2;
const SHOP_ITEM_W = 145;
const SHOP_ITEM_H = 46;
const SHOP_GAP = 4;
const SHOP_START_Y = 196;

export function renderGame(ctx, game, input) {
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, GAME_AREA_WIDTH, CANVAS_HEIGHT);

    renderGrid(ctx, game, input);
    renderEnemies(ctx, game);
    renderTowers(ctx, game);
    renderSelectedOverlay(ctx, game);
    renderPlacementPreview(ctx, game, input);
    game.effects.render(ctx, GAME_AREA_WIDTH);
    renderSidebar(ctx, game, input);
}

function renderGrid(ctx, game, input) {
    const mc = game.mapCtx;
    for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
            const x = GRID_OFFSET_X + col * CELL_SIZE;
            const y = GRID_OFFSET_Y + row * CELL_SIZE;

            if (mc.isBeltCell(col, row)) {
                const tileType = mc.getBeltTileType(col, row);
                const flowDir = mc.getBeltFlowDir(col, row);
                drawBeltTile(ctx, x, y, CELL_SIZE, tileType, flowDir);
            } else {
                ctx.strokeStyle = COLORS.gridLine;
                ctx.lineWidth = 0.5;
                ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);

                if (mc.isBuildable(col, row) && !game.towerGrid[row][col]) {
                    const { x: cx, y: cy } = cellToPixel(col, row);
                    drawSeatIndicator(ctx, cx, cy, CELL_SIZE);
                }
            }
        }
    }

    const entry = mc.getEntry();
    const exit = mc.getExit();
    const ep = cellToPixel(entry.x, entry.y);
    const xp = cellToPixel(exit.x, exit.y);
    drawKitchenDoor(ctx, ep.x, ep.y, CELL_SIZE);
    drawGarbageBin(ctx, xp.x, xp.y, CELL_SIZE);
}

function renderEnemies(ctx, game) {
    const sorted = [...game.enemies].sort((a, b) => a.distance - b.distance);
    for (const enemy of sorted) {
        if (!enemy.alive && !enemy.exited) continue;

        const bobOffset = Math.sin(Date.now() * 0.004 + enemy.distance) * 1.5;

        ctx.save();
        if (enemy.stunTimer > 0) {
            ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.02) * 0.3;
        } else if (enemy.slowTimer > 0) {
            ctx.globalAlpha = 0.9;
            ctx.shadowColor = COLORS.slowTint;
            ctx.shadowBlur = 8;
        }

        drawNigiri(ctx, enemy.x, enemy.y + bobOffset, CELL_SIZE, enemy.data, enemy.getHpRatio());
        ctx.restore();
    }
}

function renderTowers(ctx, game) {
    for (const tower of game.towers) {
        const idleBob = Math.sin(Date.now() * 0.003 + tower.idlePhase) * 1.5;
        drawTower(ctx, tower.id, tower.x, tower.y + idleBob, CELL_SIZE * 1.1, tower.getState());
    }
}

function renderSelectedOverlay(ctx, game) {
    if (!game.selectedTower) return;
    const tower = game.selectedTower;
    const x = GRID_OFFSET_X + tower.col * CELL_SIZE;
    const y = GRID_OFFSET_Y + tower.row * CELL_SIZE;

    ctx.fillStyle = COLORS.selectedHighlight;
    ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);

    const buffed = tower.getBuffedStats(game.towers);
    const rangePx = buffed.range * CELL_SIZE;
    ctx.fillStyle = 'rgba(93, 173, 226, 0.12)';
    ctx.beginPath();
    ctx.arc(tower.x, tower.y, rangePx, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(52, 152, 219, 0.6)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
}

function renderPlacementPreview(ctx, game, input) {
    if (!game.placingTowerId) return;
    if (input.mouseX >= GAME_AREA_WIDTH) return;

    const cell = pixelToCell(input.mouseX, input.mouseY);
    if (cell.col < 0 || cell.col >= GRID_COLS || cell.row < 0 || cell.row >= GRID_ROWS) return;

    const towerData = TOWER_DATA.find(t => t.id === game.placingTowerId);
    const canAfford = game.canAffordTowerBase(game.placingTowerId);
    const cellOk = game.canPlaceTower(cell.col, cell.row);
    const canPlace = cellOk && canAfford;

    for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
            if (!game.mapCtx.isBuildable(col, row)) continue;
            if (game.towerGrid[row][col]) continue;
            const x = GRID_OFFSET_X + col * CELL_SIZE;
            const y = GRID_OFFSET_Y + row * CELL_SIZE;
            ctx.fillStyle = COLORS.validPlace;
            ctx.globalAlpha = 0.3;
            ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
            ctx.globalAlpha = 1.0;
        }
    }

    const x = GRID_OFFSET_X + cell.col * CELL_SIZE;
    const y = GRID_OFFSET_Y + cell.row * CELL_SIZE;
    ctx.fillStyle = canPlace ? COLORS.validPlace : COLORS.invalidPlace;
    ctx.globalAlpha = 0.5;
    ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
    ctx.globalAlpha = 1.0;

    if (cellOk && towerData) {
        const { x: cx, y: cy } = cellToPixel(cell.col, cell.row);
        ctx.globalAlpha = canAfford ? 0.5 : 0.28;
        drawTower(ctx, game.placingTowerId, cx, cy, CELL_SIZE * 1.1, 'idle');
        ctx.globalAlpha = 1.0;

        const rangePx = towerData.tiers[0].range * CELL_SIZE;
        ctx.fillStyle = canAfford ? 'rgba(93, 173, 226, 0.1)' : 'rgba(231, 76, 60, 0.08)';
        ctx.beginPath();
        ctx.arc(cx, cy, rangePx, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = canAfford ? 'rgba(52, 152, 219, 0.5)' : 'rgba(231, 76, 60, 0.35)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}

function renderSidebar(ctx, game, input) {
    ctx.fillStyle = COLORS.sidebarBg;
    ctx.fillRect(SIDEBAR_X, 0, SIDEBAR_WIDTH, CANVAS_HEIGHT);
    ctx.strokeStyle = COLORS.sidebarBorder;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(SIDEBAR_X, 0);
    ctx.lineTo(SIDEBAR_X, CANVAS_HEIGHT);
    ctx.stroke();

    renderMapInfo(ctx, game);
    renderHUD(ctx, game);
    renderRoundInfo(ctx, game);
    renderWavePreview(ctx, game);
    renderTowerShop(ctx, game, input);
    renderSelectedInfo(ctx, game);
    renderPlacingInfo(ctx, game);
}

function renderMapInfo(ctx, game) {
    const x = SIDEBAR_X + 12;
    ctx.fillStyle = COLORS.textPrimary;
    ctx.font = `bold 13px 'Arial Rounded MT Bold', sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(game.mapCtx.def.name, x, 10);
    drawDifficultyStars(ctx, x, 22, game.mapCtx.def.difficulty, 5, 8);
}

function renderHUD(ctx, game) {
    const startX = SIDEBAR_X + 12;
    const y = 36;

    const heartCount = Math.min(game.maxLife, 10);
    const heartsPerIcon = game.maxLife / heartCount;
    for (let i = 0; i < heartCount; i++) {
        const lifeForHeart = (i + 1) * heartsPerIcon;
        const active = game.life >= lifeForHeart - heartsPerIcon;
        ctx.globalAlpha = active ? 1.0 : 0.2;
        if (active && game.life <= 5) {
            const pulse = Math.sin(Date.now() * 0.008) * 0.2 + 0.8;
            ctx.globalAlpha = pulse;
        }
        drawHeart(ctx, startX + i * 26, y, 24);
    }
    ctx.globalAlpha = 1.0;

    ctx.fillStyle = COLORS.life;
    ctx.font = `bold 16px 'Arial Rounded MT Bold', sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${game.life}`, startX + heartCount * 26 + 5, y);

    const moneyY = y + 24;
    drawCoin(ctx, startX + 10, moneyY, 22);
    ctx.fillStyle = COLORS.money;
    ctx.font = `bold 18px 'Arial Rounded MT Bold', sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(`${game.money}`, startX + 28, moneyY);
}

function renderRoundInfo(ctx, game) {
    const x = SIDEBAR_X + SIDEBAR_WIDTH / 2;
    const y = 82;

    ctx.fillStyle = COLORS.textPrimary;
    ctx.font = `bold 16px 'Arial Rounded MT Bold', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const totalRounds = game._roundData.length;
    ctx.fillText(`Round ${Math.min(game.round + 1, totalRounds)} / ${totalRounds}`, x, y);
}

function renderWavePreview(ctx, game) {
    if (game.phase !== 'prep') return;
    const preview = game.getWavePreview();
    if (preview.length === 0) return;

    const startX = SIDEBAR_X + 12;
    const y = 102;

    ctx.fillStyle = COLORS.textPrimary;
    ctx.font = `12px 'Arial Rounded MT Bold', sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Incoming:', startX, y);

    let px = startX;
    const py = y + 18;
    for (const item of preview) {
        drawNigiri(ctx, px + 10, py, 30, item.data, 1.0);

        ctx.fillStyle = COLORS.textPrimary;
        ctx.font = `11px sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`×${item.count}`, px + 24, py);
        px += 52;
        if (px > SIDEBAR_X + SIDEBAR_WIDTH - 40) {
            px = startX;
        }
    }
}

function renderTowerShop(ctx, game, input) {
    const startX = SIDEBAR_X + 12;

    ctx.fillStyle = COLORS.textPrimary;
    ctx.font = `bold 13px 'Arial Rounded MT Bold', sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Tower Shop', startX, SHOP_START_Y - 15);

    ctx.strokeStyle = COLORS.sidebarBorder;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(startX, SHOP_START_Y - 5);
    ctx.lineTo(SIDEBAR_X + SIDEBAR_WIDTH - 12, SHOP_START_Y - 5);
    ctx.stroke();

    for (let i = 0; i < TOWER_DATA.length; i++) {
        const td = TOWER_DATA[i];
        const col = i % SHOP_COLS;
        const row = Math.floor(i / SHOP_COLS);
        const x = startX + col * (SHOP_ITEM_W + SHOP_GAP);
        const y = SHOP_START_Y + row * (SHOP_ITEM_H + SHOP_GAP);
        const affordable = game.testMode || game.money >= td.tiers[0].cost;
        const isSelected = game.placingTowerId === td.id;
        const showBright = affordable || isSelected;

        ctx.fillStyle = isSelected ? 'rgba(249, 229, 71, 0.3)' :
            affordable ? '#FFFFFF' : '#F0F0F0';
        ctx.strokeStyle = isSelected ? COLORS.money : COLORS.sidebarBorder;
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.beginPath();
        ctx.roundRect(x, y, SHOP_ITEM_W, SHOP_ITEM_H, 6);
        ctx.fill();
        ctx.stroke();

        ctx.globalAlpha = showBright ? 1.0 : 0.48;

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x, y, SHOP_ITEM_W, SHOP_ITEM_H, 6);
        ctx.clip();
        const iconX = x + 34;
        const iconY = y + SHOP_ITEM_H / 2;
        drawTower(ctx, td.id, iconX, iconY, 38, 'idle');
        ctx.restore();

        ctx.globalAlpha = showBright ? 1.0 : 0.48;
        ctx.fillStyle = COLORS.textPrimary;
        ctx.font = `bold 12px 'Arial Rounded MT Bold', sans-serif`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText(td.name, x + SHOP_ITEM_W - 8, y + 8);

        ctx.fillStyle = affordable ? '#4CAF50' : COLORS.textAccent;
        ctx.font = `bold 11px sans-serif`;
        ctx.textAlign = 'right';
        ctx.fillText(`$${td.tiers[0].cost}`, x + SHOP_ITEM_W - 8, y + 26);

        ctx.globalAlpha = 1.0;
    }
}

function formatSpecial(special) {
    if (!special) return null;
    switch (special.type) {
        case 'doubleBite': return `${Math.round(special.chance * 100)}% double-bite`;
        case 'bonusMoney': return `+${Math.round(special.mult * 100)}% kill money`;
        case 'slow': return `${Math.round(special.pct * 100)}% slow ${special.dur / 1000}s`;
        case 'pierce': return `Pierce \u00d7${special.count}`;
        case 'crit': return `${Math.round(special.chance * 100)}% crit (\u00d7${special.mult} dmg)`;
        case 'multiTarget': {
            let t = `Hits ${special.count} targets`;
            if (special.slow) t += ` + ${Math.round(special.slow.pct * 100)}% slow`;
            return t;
        }
        case 'aura': {
            let t = `+${Math.round(special.speedBuff * 100)}% adj speed`;
            if (special.damageBuff) t += `, +${Math.round(special.damageBuff * 100)}% adj dmg`;
            return t;
        }
        case 'stun': {
            let t = `${Math.round(special.chance * 100)}% stun ${special.dur / 1000}s`;
            if (special.splash) t += ' + splash';
            return t;
        }
        case 'aoe': {
            let t = `AoE ${special.radius} tile`;
            if (special.burn) t += ` + burn ${special.burn.dps}/s`;
            return t;
        }
        default: return null;
    }
}

function renderSelectedInfo(ctx, game) {
    if (!game.selectedTower) return;
    const tower = game.selectedTower;
    const x = SIDEBAR_X + 12;
    const w = SIDEBAR_WIDTH - 24;
    const panelH = 160;
    const y = CANVAS_HEIGHT - panelH - 6;

    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = COLORS.sidebarBorder;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, w, panelH, 8);
    ctx.fill();
    ctx.stroke();

    const pad = 8;
    let cy = y + pad;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, 46, panelH, [8, 0, 0, 8]);
    ctx.clip();
    drawTower(ctx, tower.id, x + 24, cy + 14, 36, 'idle');
    ctx.restore();

    ctx.fillStyle = COLORS.textPrimary;
    ctx.font = `bold 14px 'Arial Rounded MT Bold', sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(tower.typeData.name, x + 50, cy);
    drawTierStars(ctx, x + 50, cy + 16, tower.tier);
    cy += 30;

    const buffed = tower.getBuffedStats(game.towers);
    ctx.font = `bold 12px sans-serif`;
    ctx.fillStyle = '#555';
    ctx.fillText(`DMG ${buffed.damage}`, x + pad, cy);
    ctx.fillText(`RNG ${buffed.range}`, x + pad + 68, cy);
    ctx.fillText(`SPD ${buffed.speed}ms`, x + pad + 136, cy);
    cy += 16;

    const specialText = formatSpecial(buffed.special);
    if (specialText) {
        ctx.font = `bold 11px sans-serif`;
        ctx.fillStyle = '#9C27B0';
        ctx.fillText(specialText, x + pad, cy);
    }
    cy += 14;

    if (tower.canUpgrade()) {
        const next = tower.typeData.tiers[tower.tier + 1];
        const curr = tower.stats;
        const dmgDiff = next.damage - curr.damage;
        const rngDiff = +(next.range - curr.range).toFixed(1);
        const spdDiff = next.speed - curr.speed;

        ctx.font = `11px sans-serif`;
        let dx = x + pad;
        ctx.fillStyle = '#AAA';
        ctx.fillText('Next:', dx, cy);
        dx += 32;
        if (dmgDiff !== 0) {
            ctx.fillStyle = dmgDiff > 0 ? '#4CAF50' : '#E74C3C';
            const label = `DMG ${dmgDiff > 0 ? '+' : ''}${dmgDiff}`;
            ctx.fillText(label, dx, cy);
            dx += ctx.measureText(label).width + 6;
        }
        if (rngDiff !== 0) {
            ctx.fillStyle = rngDiff > 0 ? '#4CAF50' : '#E74C3C';
            const label = `RNG ${rngDiff > 0 ? '+' : ''}${rngDiff}`;
            ctx.fillText(label, dx, cy);
            dx += ctx.measureText(label).width + 6;
        }
        if (spdDiff !== 0) {
            ctx.fillStyle = spdDiff < 0 ? '#4CAF50' : '#E74C3C';
            ctx.fillText(`SPD ${spdDiff}`, dx, cy);
        }
        cy += 14;
        const nextSpecial = formatSpecial(next.special);
        const currSpecial = formatSpecial(curr.special);
        if (nextSpecial && nextSpecial !== currSpecial) {
            ctx.fillStyle = '#9C27B0';
            ctx.font = `10px sans-serif`;
            ctx.fillText(`\u2192 ${nextSpecial}`, x + pad + 32, cy);
        }
    } else {
        ctx.font = `11px sans-serif`;
        ctx.fillStyle = '#999';
        ctx.fillText('Fully upgraded', x + pad, cy);
    }
    cy += 16;

    const btnW = (w - 10) / 2;
    if (tower.canUpgrade()) {
        const cost = tower.getUpgradeCost();
        const canAfford = game.money >= cost || game.testMode;
        game._upgradeBtn = drawButton(ctx, x + 2, cy, btnW, 30, `Upgrade $${cost}`, '#4CAF50', canAfford);
    } else {
        game._upgradeBtn = drawButton(ctx, x + 2, cy, btnW, 30, 'MAX', '#9E9E9E', false);
    }
    const sellVal = tower.getSellValue();
    game._sellBtn = drawButton(ctx, x + 6 + btnW, cy, btnW, 30, `Sell $${sellVal}`, '#F44336', true);
    cy += 38;

    ctx.font = `10px sans-serif`;
    ctx.fillStyle = '#AAA';
    ctx.textAlign = 'center';
    ctx.fillText('[U] Upgrade  [S] Sell  [Esc] Deselect', SIDEBAR_X + SIDEBAR_WIDTH / 2, cy);
}

function renderPlacingInfo(ctx, game) {
    if (!game.placingTowerId || game.selectedTower) return;

    const td = TOWER_DATA.find(t => t.id === game.placingTowerId);
    if (!td) return;

    const base = td.tiers[0];
    const showNeedFunds = !game.testMode && game.money < base.cost;
    const panelH = showNeedFunds ? 96 : 82;
    const y = CANVAS_HEIGHT - panelH - 6;
    const x = SIDEBAR_X + 12;
    const w = SIDEBAR_WIDTH - 24;
    const pad = 8;

    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = COLORS.sidebarBorder;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, w, panelH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, 46, panelH, [8, 0, 0, 8]);
    ctx.clip();
    drawTower(ctx, td.id, x + 24, y + 20, 36, 'idle');
    ctx.restore();

    ctx.fillStyle = COLORS.textPrimary;
    ctx.font = `bold 14px 'Arial Rounded MT Bold', sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(td.name, x + 50, y + pad);

    ctx.font = `italic 10px sans-serif`;
    ctx.fillStyle = '#999';
    ctx.fillText(td.description, x + 50, y + pad + 16);

    ctx.font = `bold 12px sans-serif`;
    ctx.fillStyle = '#555';
    ctx.fillText(`DMG ${base.damage}`, x + pad, y + pad + 36);
    ctx.fillText(`RNG ${base.range}`, x + pad + 68, y + pad + 36);
    ctx.fillText(`SPD ${base.speed}ms`, x + pad + 136, y + pad + 36);

    const specialText = formatSpecial(base.special);
    if (specialText) {
        ctx.font = `bold 11px sans-serif`;
        ctx.fillStyle = '#9C27B0';
        ctx.fillText(specialText, x + pad, y + pad + 52);
    }

    if (showNeedFunds) {
        ctx.font = `bold 10px sans-serif`;
        ctx.fillStyle = COLORS.textAccent;
        ctx.textAlign = 'left';
        ctx.fillText(`Need $${base.cost} to place (preview)`, x + pad, y + panelH - 14);
    }
}

export function getStartWaveBtn(game) {
    if (game.phase !== 'prep') return null;
    return {
        x: SIDEBAR_X + 12,
        y: 138,
        w: SIDEBAR_WIDTH - 24,
        h: 32,
    };
}

export function renderStartWaveBtn(ctx, game) {
    if (game.phase !== 'prep') return;
    const btn = getStartWaveBtn(game);
    drawButton(ctx, btn.x, btn.y, btn.w, btn.h, 'Start Wave [Space]', '#E74C3C', true);
}

export function handleGameClick(game, clickX, clickY, input) {
    if (clickX < GAME_AREA_WIDTH) {
        const cell = pixelToCell(clickX, clickY);

        if (game.placingTowerId) {
            if (game.canPlaceTower(cell.col, cell.row)) {
                const placed = game.placeTower(game.placingTowerId, cell.col, cell.row);
                if (placed) {
                    const td = TOWER_DATA.find(t => t.id === game.placingTowerId);
                    if (td && !game.testMode && game.money < td.tiers[0].cost) {
                        game.placingTowerId = null;
                    }
                }
            } else {
                game.placingTowerId = null;
            }
            return;
        }

        const tower = game.getTowerAtCell(cell.col, cell.row);
        if (tower) {
            game.selectedTower = tower;
        } else {
            game.selectedTower = null;
        }
        return;
    }

    const swBtn = getStartWaveBtn(game);
    if (swBtn && hitTest(clickX, clickY, swBtn)) {
        if (game.audio) game.audio.playClick();
        game.startWave();
        return;
    }

    if (game.selectedTower && game._upgradeBtn) {
        if (hitTest(clickX, clickY, game._upgradeBtn)) {
            game.upgradeTower(game.selectedTower);
            return;
        }
    }

    if (game.selectedTower && game._sellBtn) {
        if (hitTest(clickX, clickY, game._sellBtn)) {
            game.sellTower(game.selectedTower);
            return;
        }
    }

    for (let i = 0; i < TOWER_DATA.length; i++) {
        const td = TOWER_DATA[i];
        const col = i % SHOP_COLS;
        const row = Math.floor(i / SHOP_COLS);
        const sx = SIDEBAR_X + 12 + col * (SHOP_ITEM_W + SHOP_GAP);
        const sy = SHOP_START_Y + row * (SHOP_ITEM_H + SHOP_GAP);

        if (hitTest(clickX, clickY, { x: sx, y: sy, w: SHOP_ITEM_W, h: SHOP_ITEM_H })) {
            if (game.audio) game.audio.playClick();
            if (game.placingTowerId === td.id) {
                game.placingTowerId = null;
            } else {
                game.placingTowerId = td.id;
                game.selectedTower = null;
            }
            return;
        }
    }
}

function hitTest(px, py, rect) {
    return px >= rect.x && px <= rect.x + rect.w && py >= rect.y && py <= rect.y + rect.h;
}

const AUDIO_BTN = { x: 8, y: CANVAS_HEIGHT - 32, w: 32, h: 32 };

export function getAudioBtnRect() { return AUDIO_BTN; }

export function renderAudioToggle(ctx, audio, mouseX, mouseY) {
    const b = AUDIO_BTN;
    const hover = mouseX >= b.x && mouseX <= b.x + b.w &&
                  mouseY >= b.y && mouseY <= b.y + b.h;
    drawSpeakerIcon(ctx, b.x + b.w / 2, b.y + b.h / 2, 24, audio.muted, hover);
}

export function renderOverlay(ctx, game) {
    if (game.gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.fillStyle = '#E74C3C';
        ctx.font = `bold 48px 'Arial Rounded MT Bold', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.strokeText('Game Over', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);
        ctx.fillText('Game Over', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = `18px 'Arial Rounded MT Bold', sans-serif`;
        ctx.fillText(`Rounds Survived: ${game.round}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        ctx.fillText(`Nigiri Eaten: ${game.totalEaten}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);

        game._retryBtn = drawButton(ctx,
            CANVAS_WIDTH / 2 - 70, CANVAS_HEIGHT / 2 + 65,
            140, 40, 'Try Again', '#E74C3C', true);
    }

    if (game.victory) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        const time = Date.now() * 0.002;
        for (let i = 0; i < 20; i++) {
            const cx = (Math.sin(time + i * 1.3) * 0.5 + 0.5) * CANVAS_WIDTH;
            const cy = (Math.cos(time + i * 0.9) * 0.5 + 0.5) * CANVAS_HEIGHT;
            const colors = ['#F1C40F', '#E74C3C', '#3498DB', '#2ECC71', '#9B59B6'];
            ctx.fillStyle = colors[i % colors.length];
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.arc(cx, cy, 4 + Math.sin(time * 2 + i) * 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1.0;

        ctx.fillStyle = '#F1C40F';
        ctx.font = `bold 48px 'Arial Rounded MT Bold', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.strokeText('Victory!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);
        ctx.fillText('Victory!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = `18px 'Arial Rounded MT Bold', sans-serif`;
        ctx.fillText(`Nigiri Eaten: ${game.totalEaten}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        ctx.fillText(`Total Earned: $${game.totalEarned}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
        ctx.fillText(`Life Remaining: ${game.life}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);

        game._retryBtn = drawButton(ctx,
            CANVAS_WIDTH / 2 - 80, CANVAS_HEIGHT / 2 + 90,
            160, 40, 'Back to Title', '#4CAF50', true);
    }
}
