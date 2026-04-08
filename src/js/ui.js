import {
    CANVAS_WIDTH, CANVAS_HEIGHT, GAME_AREA_WIDTH, SIDEBAR_X, SIDEBAR_WIDTH,
    CELL_SIZE, GRID_COLS, GRID_ROWS, GRID_OFFSET_X, GRID_OFFSET_Y,
    COLORS, TOWER_DATA,
    cellToPixel, pixelToCell,
    getTotalCost, getDifficultyProfile,
    GAME_SPEED_LEVELS,
} from './data.js';
import {
    drawTower, drawNigiri, drawHeart, drawCoin, drawButton, drawRoundBackButton,
    drawGarbageBin, drawKitchenDoor, drawSeatIndicator, drawBeltTile,
    drawTierStars, drawSpeakerIcon,
} from './sprites.js';
import {
    uiFont, t, formatSpecialLocalized, mapName, difficultyLabel, towerName, towerDesc,
} from './i18n.js';
import {
    TARGET_MODE_WEAKEST,
    TARGET_MODE_FURTHEST,
    shibaAuraManhattanLimit,
} from './entities.js';

/** Larger type + tap targets on portrait phones (width-limited scale). Landscape/tablet use `compact === false`. */
function getSidebarMetrics(compact) {
    if (!compact) {
        return {
            mapY: 10,
            hudY: 40,
            roundY: 72,
            waveLabelY: 92,
            waveRowY: 110,
            startBtnY: 128,
            startBtnH: 32,
            shopStartY: 188,
            shopCols: 2,
            shopItemW: 145,
            shopItemH: 46,
            shopGap: 4,
            coinR: 22,
            heartR: 20,
            heartSpacingMax: 16,
            nigiriPreviewR: 30,
            previewStepX: 52,
            fontMapName: `bold 13px 'Arial Rounded MT Bold', sans-serif`,
            fontDiff: `bold 11px 'Arial Rounded MT Bold', sans-serif`,
            fontMoney: `bold 18px 'Arial Rounded MT Bold', sans-serif`,
            fontLife: `bold 16px 'Arial Rounded MT Bold', sans-serif`,
            fontRound: `bold 16px 'Arial Rounded MT Bold', sans-serif`,
            fontWaveLabel: `12px 'Arial Rounded MT Bold', sans-serif`,
            fontWaveCount: `11px sans-serif`,
            fontShopTitle: `bold 13px 'Arial Rounded MT Bold', sans-serif`,
            fontTowerName: `bold 12px 'Arial Rounded MT Bold', sans-serif`,
            fontTowerCost: `bold 11px sans-serif`,
            towerIconR: 38,
            panelSelectedH: 196,
            panelPlacingHNeed: 96,
            panelPlacingHOk: 82,
            fontSelTitle: `bold 14px 'Arial Rounded MT Bold', sans-serif`,
            fontSelStat: `bold 12px sans-serif`,
            fontSelSpecial: `bold 11px sans-serif`,
            fontSelNext: `11px sans-serif`,
            fontSelHint: `10px sans-serif`,
            btnRowH: 30,
            fontPlaceTitle: `bold 14px 'Arial Rounded MT Bold', sans-serif`,
            fontPlaceDesc: `italic 10px sans-serif`,
            fontPlaceStat: `bold 12px sans-serif`,
            fontPlaceSpecial: `bold 11px sans-serif`,
            fontPlaceNeed: `bold 10px sans-serif`,
        };
    }
    const innerW = SIDEBAR_WIDTH - 24;
    const shopGap = 5;
    const shopCols = 2;
    const shopItemW = Math.floor((innerW - shopGap) / 2);
    return {
        mapY: 10,
        hudY: 42,
        roundY: 66,
        waveLabelY: 86,
        waveRowY: 102,
        startBtnY: 122,
        startBtnH: 40,
        shopStartY: 150,
        shopCols,
        shopItemW,
        shopItemH: 52,
        shopGap,
        coinR: 26,
        heartR: 22,
        heartSpacingMax: 17,
        nigiriPreviewR: 34,
        previewStepX: 56,
        fontMapName: `bold 15px 'Arial Rounded MT Bold', sans-serif`,
        fontDiff: `bold 12px 'Arial Rounded MT Bold', sans-serif`,
        fontMoney: `bold 21px 'Arial Rounded MT Bold', sans-serif`,
        fontLife: `bold 18px 'Arial Rounded MT Bold', sans-serif`,
        fontRound: `bold 18px 'Arial Rounded MT Bold', sans-serif`,
        fontWaveLabel: `13px 'Arial Rounded MT Bold', sans-serif`,
        fontWaveCount: `12px sans-serif`,
        fontShopTitle: `bold 15px 'Arial Rounded MT Bold', sans-serif`,
        fontTowerName: `bold 14px 'Arial Rounded MT Bold', sans-serif`,
        fontTowerCost: `bold 12px sans-serif`,
        towerIconR: 42,
        panelSelectedH: 204,
        panelPlacingHNeed: 108,
        panelPlacingHOk: 92,
        fontSelTitle: `bold 15px 'Arial Rounded MT Bold', sans-serif`,
        fontSelStat: `bold 13px sans-serif`,
        fontSelSpecial: `bold 12px sans-serif`,
        fontSelNext: `12px sans-serif`,
        fontSelHint: `11px sans-serif`,
        btnRowH: 34,
        fontPlaceTitle: `bold 15px 'Arial Rounded MT Bold', sans-serif`,
        fontPlaceDesc: `italic 11px sans-serif`,
        fontPlaceStat: `bold 13px sans-serif`,
        fontPlaceSpecial: `bold 12px sans-serif`,
        fontPlaceNeed: `bold 11px sans-serif`,
    };
}

export function renderGame(ctx, game, input, vp) {
    const m = getSidebarMetrics(vp.compactSidebar);
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, GAME_AREA_WIDTH, CANVAS_HEIGHT);

    renderGrid(ctx, game, input);
    renderEnemies(ctx, game);
    renderTowers(ctx, game);
    renderSelectedOverlay(ctx, game);
    renderPlacementPreview(ctx, game, input);
    game.effects.render(ctx, GAME_AREA_WIDTH);
    renderSidebar(ctx, game, input, m);
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

function renderShibaAuraCoverage(ctx, tower) {
    const L = shibaAuraManhattanLimit(tower.tier);
    const sc = tower.col;
    const sr = tower.row;

    for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
            const d = Math.abs(col - sc) + Math.abs(row - sr);
            if (d < 1 || d > L) continue;
            const gx = GRID_OFFSET_X + col * CELL_SIZE;
            const gy = GRID_OFFSET_Y + row * CELL_SIZE;
            ctx.fillStyle = 'rgba(255, 176, 96, 0.22)';
            ctx.fillRect(gx, gy, CELL_SIZE, CELL_SIZE);
        }
    }

    function inAura(c, r) {
        if (c < 0 || c >= GRID_COLS || r < 0 || r >= GRID_ROWS) return false;
        const d = Math.abs(c - sc) + Math.abs(r - sr);
        return d >= 1 && d <= L;
    }

    ctx.strokeStyle = 'rgba(200, 120, 40, 0.65)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
            if (!inAura(col, row)) continue;
            const gx = GRID_OFFSET_X + col * CELL_SIZE;
            const gy = GRID_OFFSET_Y + row * CELL_SIZE;
            if (!inAura(col - 1, row)) {
                ctx.moveTo(gx, gy);
                ctx.lineTo(gx, gy + CELL_SIZE);
            }
            if (!inAura(col + 1, row)) {
                ctx.moveTo(gx + CELL_SIZE, gy);
                ctx.lineTo(gx + CELL_SIZE, gy + CELL_SIZE);
            }
            if (!inAura(col, row - 1)) {
                ctx.moveTo(gx, gy);
                ctx.lineTo(gx + CELL_SIZE, gy);
            }
            if (!inAura(col, row + 1)) {
                ctx.moveTo(gx, gy + CELL_SIZE);
                ctx.lineTo(gx + CELL_SIZE, gy + CELL_SIZE);
            }
        }
    }
    ctx.stroke();
    ctx.setLineDash([]);
}

function renderSelectedOverlay(ctx, game) {
    if (!game.selectedTower) return;
    const tower = game.selectedTower;
    const x = GRID_OFFSET_X + tower.col * CELL_SIZE;
    const y = GRID_OFFSET_Y + tower.row * CELL_SIZE;

    if (tower.id === 'shiba') {
        renderShibaAuraCoverage(ctx, tower);
    }

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

function renderSidebar(ctx, game, input, m) {
    ctx.fillStyle = COLORS.sidebarBg;
    ctx.fillRect(SIDEBAR_X, 0, SIDEBAR_WIDTH, CANVAS_HEIGHT);
    ctx.strokeStyle = COLORS.sidebarBorder;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(SIDEBAR_X, 0);
    ctx.lineTo(SIDEBAR_X, CANVAS_HEIGHT);
    ctx.stroke();

    renderMapInfo(ctx, game, m);
    renderHUD(ctx, game, m);
    renderRoundInfo(ctx, game, m);
    renderWavePreview(ctx, game, m);
    renderTowerShop(ctx, game, input, m);
    renderSelectedInfo(ctx, game, m);
    renderPlacingInfo(ctx, game, m);
}

function renderMapInfo(ctx, game, m) {
    const x = SIDEBAR_X + 12;
    ctx.fillStyle = COLORS.textPrimary;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = uiFont(m.fontMapName);
    ctx.fillText(mapName(game.mapCtx.def.id), x, m.mapY);
    const diff = getDifficultyProfile(game.difficultyId);
    ctx.font = uiFont(m.fontDiff);
    ctx.fillStyle = diff.accent;
    ctx.textAlign = 'right';
    ctx.fillText(difficultyLabel(game.difficultyId), SIDEBAR_X + SIDEBAR_WIDTH - 12, m.mapY);
    ctx.textAlign = 'left';
    ctx.fillStyle = COLORS.textPrimary;
}

function renderHUD(ctx, game, m) {
    const startX = SIDEBAR_X + 12;
    const rightX = SIDEBAR_X + SIDEBAR_WIDTH - 12;
    const rowY = m.hudY;
    const minGapMoneyHearts = 10;

    drawCoin(ctx, startX + 10, rowY, m.coinR);
    ctx.fillStyle = COLORS.money;
    ctx.font = uiFont(m.fontMoney);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const moneyStr = `${game.money}`;
    ctx.fillText(moneyStr, startX + 28, rowY);
    const moneyEndX = startX + 28 + ctx.measureText(moneyStr).width;

    const heartCount = Math.min(game.maxLife, 10);
    const heartsPerIcon = game.maxLife / heartCount;
    const heartSize = m.heartR;
    let heartSpacing = m.heartSpacingMax;

    ctx.font = uiFont(m.fontLife);
    const lifeStr = `${game.life}`;
    const lifeW = ctx.measureText(lifeStr).width;
    const padBeforeLife = 8;
    const lastIdx = Math.max(0, heartCount - 1);
    const lastHeartCenter = () => rightX - lifeW - padBeforeLife - 4;

    let firstHeartCenter = lastHeartCenter() - lastIdx * heartSpacing;
    while (lastIdx > 0 && firstHeartCenter - heartSize * 0.45 < moneyEndX + minGapMoneyHearts && heartSpacing > 12) {
        heartSpacing -= 1;
        firstHeartCenter = lastHeartCenter() - lastIdx * heartSpacing;
    }

    for (let i = 0; i < heartCount; i++) {
        const cx = firstHeartCenter + i * heartSpacing;
        const lifeForHeart = (i + 1) * heartsPerIcon;
        const active = game.life >= lifeForHeart - heartsPerIcon;
        ctx.globalAlpha = active ? 1.0 : 0.2;
        if (active && game.life <= 5) {
            const pulse = Math.sin(Date.now() * 0.008) * 0.2 + 0.8;
            ctx.globalAlpha = pulse;
        }
        drawHeart(ctx, cx, rowY, heartSize);
    }
    ctx.globalAlpha = 1.0;

    ctx.fillStyle = COLORS.life;
    ctx.font = uiFont(m.fontLife);
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(lifeStr, rightX, rowY);
    ctx.textAlign = 'left';
}

function renderRoundInfo(ctx, game, m) {
    const x = SIDEBAR_X + SIDEBAR_WIDTH / 2;
    const y = m.roundY;

    ctx.fillStyle = COLORS.textPrimary;
    ctx.font = uiFont(m.fontRound);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const totalRounds = game._roundData.length;
    if (game.infiniteMode && game.round >= totalRounds) {
        ctx.fillText(t('roundSidebarInfinite', { n: 10 + game.infiniteRound }), x, y);
    } else {
        const cur = Math.min(game.round + 1, totalRounds);
        ctx.fillText(`${t('round')} ` + t('roundOf', { cur, total: totalRounds }), x, y);
    }
}

function renderWavePreview(ctx, game, m) {
    if (game.phase !== 'prep') return;
    const preview = game.getWavePreview();
    if (preview.length === 0) return;

    const startX = SIDEBAR_X + 12;
    const y = m.waveLabelY;
    const nr = m.nigiriPreviewR;
    const countOffset = Math.round(nr * 0.8);

    ctx.fillStyle = COLORS.textPrimary;
    ctx.font = uiFont(m.fontWaveLabel);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(t('incoming'), startX, y);

    let px = startX;
    const py = m.waveRowY;
    for (const item of preview) {
        drawNigiri(ctx, px + 10, py, nr, item.data, 1.0);

        ctx.fillStyle = COLORS.textPrimary;
        ctx.font = uiFont(m.fontWaveCount);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`×${item.count}`, px + countOffset, py);
        px += m.previewStepX;
        if (px > SIDEBAR_X + SIDEBAR_WIDTH - 36) {
            px = startX;
        }
    }
}

function renderTowerShop(ctx, game, input, m) {
    const startX = SIDEBAR_X + 12;
    const { shopStartY: sy, shopCols, shopItemW, shopItemH, shopGap } = m;

    ctx.fillStyle = COLORS.textPrimary;
    ctx.font = uiFont(m.fontShopTitle);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(t('towerShop'), startX, sy - 15);

    ctx.strokeStyle = COLORS.sidebarBorder;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(startX, sy - 5);
    ctx.lineTo(SIDEBAR_X + SIDEBAR_WIDTH - 12, sy - 5);
    ctx.stroke();

    for (let i = 0; i < TOWER_DATA.length; i++) {
        const td = TOWER_DATA[i];
        const col = i % shopCols;
        const row = Math.floor(i / shopCols);
        const x = startX + col * (shopItemW + shopGap);
        const y = sy + row * (shopItemH + shopGap);
        const affordable = game.testMode || game.money >= td.tiers[0].cost;
        const isSelected = game.placingTowerId === td.id;
        const showBright = affordable || isSelected;

        ctx.fillStyle = isSelected ? 'rgba(249, 229, 71, 0.3)' :
            affordable ? '#FFFFFF' : '#F0F0F0';
        ctx.strokeStyle = isSelected ? COLORS.money : COLORS.sidebarBorder;
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.beginPath();
        ctx.roundRect(x, y, shopItemW, shopItemH, 6);
        ctx.fill();
        ctx.stroke();

        ctx.globalAlpha = showBright ? 1.0 : 0.48;

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x, y, shopItemW, shopItemH, 6);
        ctx.clip();
        const iconX = x + Math.min(36, Math.floor(shopItemW * 0.22));
        const iconY = y + shopItemH / 2;
        drawTower(ctx, td.id, iconX, iconY, m.towerIconR, 'idle');
        ctx.restore();

        ctx.globalAlpha = showBright ? 1.0 : 0.48;
        ctx.fillStyle = COLORS.textPrimary;
        ctx.font = uiFont(m.fontTowerName);
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        const nameY = shopItemH >= 50 ? y + 9 : y + 8;
        ctx.fillText(towerName(td.id), x + shopItemW - 8, nameY);

        ctx.fillStyle = affordable ? '#4CAF50' : COLORS.textAccent;
        ctx.font = uiFont(m.fontTowerCost);
        ctx.textAlign = 'right';
        const costY = shopItemH >= 50 ? y + 28 : y + 26;
        ctx.fillText(`$${td.tiers[0].cost}`, x + shopItemW - 8, costY);

        ctx.globalAlpha = 1.0;
    }
}

function renderSelectedInfo(ctx, game, m) {
    game._targetWeakestBtn = null;
    game._targetFurthestBtn = null;
    if (!game.selectedTower) return;
    const tower = game.selectedTower;
    const x = SIDEBAR_X + 12;
    const w = SIDEBAR_WIDTH - 24;
    const panelH = m.panelSelectedH;
    const y = CANVAS_HEIGHT - panelH - 6;
    const btnH = m.btnRowH;

    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = COLORS.sidebarBorder;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, w, panelH, 8);
    ctx.fill();
    ctx.stroke();

    const pad = 8;
    const textX = x + 50;
    let cy = y + pad;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, 46, panelH, [8, 0, 0, 8]);
    ctx.clip();
    drawTower(ctx, tower.id, x + 24, cy + 14, 36, 'idle');
    ctx.restore();

    ctx.fillStyle = COLORS.textPrimary;
    ctx.font = uiFont(m.fontSelTitle);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(towerName(tower.id), textX, cy);
    {
        const starGap = 14;
        const starOuterR = 5;
        const maxStars = 3;
        const firstStarCx = x + w - pad - ((maxStars - 1) * starGap + starOuterR);
        drawTierStars(ctx, firstStarCx, y + pad + 8, tower.tier);
    }
    cy += 20;

    const buffed = tower.getBuffedStats(game.towers);
    ctx.font = uiFont(m.fontSelStat);
    ctx.fillStyle = '#555';
    ctx.fillText(`${t('dmg')} ${buffed.damage}`, textX, cy);
    ctx.fillText(`${t('rng')} ${buffed.range}`, textX + 68, cy);
    ctx.fillText(`${t('spd')} ${buffed.speed}ms`, textX + 136, cy);
    cy += 16;

    const specialText = formatSpecialLocalized(buffed.special);
    if (specialText) {
        ctx.font = uiFont(m.fontSelSpecial);
        ctx.fillStyle = '#9C27B0';
        ctx.fillText(specialText, textX, cy);
    }
    cy += 14;

    if (tower.canUpgrade()) {
        const next = tower.typeData.tiers[tower.tier + 1];
        const curr = tower.stats;
        const dmgDiff = next.damage - curr.damage;
        const rngDiff = +(next.range - curr.range).toFixed(1);
        const spdDiff = next.speed - curr.speed;

        ctx.font = uiFont(m.fontSelNext);
        let dx = textX;
        ctx.fillStyle = '#AAA';
        const nextLabel = t('next');
        ctx.fillText(nextLabel, dx, cy);
        dx += ctx.measureText(nextLabel).width + 6;
        if (dmgDiff !== 0) {
            ctx.fillStyle = dmgDiff > 0 ? '#4CAF50' : '#E74C3C';
            const label = `${t('dmg')} ${dmgDiff > 0 ? '+' : ''}${dmgDiff}`;
            ctx.fillText(label, dx, cy);
            dx += ctx.measureText(label).width + 6;
        }
        if (rngDiff !== 0) {
            ctx.fillStyle = rngDiff > 0 ? '#4CAF50' : '#E74C3C';
            const label = `${t('rng')} ${rngDiff > 0 ? '+' : ''}${rngDiff}`;
            ctx.fillText(label, dx, cy);
            dx += ctx.measureText(label).width + 6;
        }
        if (spdDiff !== 0) {
            ctx.fillStyle = spdDiff < 0 ? '#4CAF50' : '#E74C3C';
            ctx.fillText(t('spdDelta', { n: spdDiff }), dx, cy);
        }
        cy += 14;
        const nextSpecial = formatSpecialLocalized(next.special);
        const currSpecial = formatSpecialLocalized(curr.special);
        if (nextSpecial && nextSpecial !== currSpecial) {
            ctx.fillStyle = '#9C27B0';
            ctx.font = uiFont(m.fontSelHint);
            ctx.fillText(`\u2192 ${nextSpecial}`, textX + 32, cy);
        }
    } else {
        ctx.font = uiFont(m.fontSelNext);
        ctx.fillStyle = '#999';
        ctx.fillText(t('fullyUpgraded'), textX, cy);
    }
    cy += 16;

    ctx.font = uiFont(m.fontSelHint);
    ctx.fillStyle = '#888';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(t('targetingLabel'), textX, cy);
    cy += 14;
    const tGap = 6;
    const tBtnW = (w - 8 - tGap) / 2;
    const targetBtnH = Math.max(24, m.btnRowH - 4);
    const tm = tower.targetMode === TARGET_MODE_WEAKEST ? TARGET_MODE_WEAKEST : TARGET_MODE_FURTHEST;
    game._targetWeakestBtn = drawButton(ctx, x + 4, cy, tBtnW, targetBtnH, t('targetWeakest'),
        tm === TARGET_MODE_WEAKEST ? '#3498DB' : '#95A5A6', true);
    game._targetFurthestBtn = drawButton(ctx, x + 4 + tBtnW + tGap, cy, tBtnW, targetBtnH, t('targetFurthest'),
        tm === TARGET_MODE_FURTHEST ? '#3498DB' : '#95A5A6', true);
    cy += targetBtnH + 8;

    const btnW = (w - 10) / 2;
    if (tower.canUpgrade()) {
        const cost = tower.getUpgradeCost();
        const canAfford = game.money >= cost || game.testMode;
        game._upgradeBtn = drawButton(ctx, x + 2, cy, btnW, btnH, t('upgrade', { cost }), '#4CAF50', canAfford);
    } else {
        game._upgradeBtn = drawButton(ctx, x + 2, cy, btnW, btnH, t('max'), '#9E9E9E', false);
    }
    const sellVal = tower.getSellValue();
    game._sellBtn = drawButton(ctx, x + 6 + btnW, cy, btnW, btnH, t('sell', { val: sellVal }), '#F44336', true);
    cy += btnH + 8;

    ctx.font = uiFont(m.fontSelHint);
    ctx.fillStyle = '#AAA';
    ctx.textAlign = 'center';
    ctx.fillText(t('selHints'), SIDEBAR_X + SIDEBAR_WIDTH / 2, cy);
}

function renderPlacingInfo(ctx, game, m) {
    if (!game.placingTowerId || game.selectedTower) return;

    const td = TOWER_DATA.find(t => t.id === game.placingTowerId);
    if (!td) return;

    const base = td.tiers[0];
    const showNeedFunds = !game.testMode && game.money < base.cost;
    const panelH = showNeedFunds ? m.panelPlacingHNeed : m.panelPlacingHOk;
    const y = CANVAS_HEIGHT - panelH - 6;
    const x = SIDEBAR_X + 12;
    const w = SIDEBAR_WIDTH - 24;
    const pad = 8;
    const textX = x + 50;

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
    ctx.font = uiFont(m.fontPlaceTitle);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(towerName(td.id), textX, y + pad);

    ctx.font = uiFont(m.fontPlaceDesc);
    ctx.fillStyle = '#999';
    ctx.fillText(towerDesc(td.id), textX, y + pad + 16);

    ctx.font = uiFont(m.fontPlaceStat);
    ctx.fillStyle = '#555';
    ctx.fillText(`${t('dmg')} ${base.damage}`, textX, y + pad + 36);
    ctx.fillText(`${t('rng')} ${base.range}`, textX + 68, y + pad + 36);
    ctx.fillText(`${t('spd')} ${base.speed}ms`, textX + 136, y + pad + 36);

    const specialText = formatSpecialLocalized(base.special);
    if (specialText) {
        ctx.font = uiFont(m.fontPlaceSpecial);
        ctx.fillStyle = '#9C27B0';
        ctx.fillText(specialText, textX, y + pad + 52);
    }

    if (showNeedFunds) {
        ctx.font = uiFont(m.fontPlaceNeed);
        ctx.fillStyle = COLORS.textAccent;
        ctx.textAlign = 'left';
        ctx.fillText(t('needFunds', { cost: base.cost }), textX, y + panelH - 14);
    }
}

/** Same screen slot: Start Wave (prep) or Pause / Resume (active wave). */
function getSidebarPhaseBtnRect(vp) {
    const m = getSidebarMetrics(vp.compactSidebar);
    let startBtnY = m.startBtnY;
    let startBtnH = m.startBtnH;
    if (vp.touchHandheld && vp.landscape && !vp.compactSidebar) {
        startBtnH = Math.max(startBtnH, 40);
        startBtnY = Math.min(startBtnY, 128);
    }
    return {
        x: SIDEBAR_X + 12,
        y: startBtnY,
        w: SIDEBAR_WIDTH - 24,
        h: startBtnH,
    };
}

export function getStartWaveBtn(game, vp) {
    if (game.phase !== 'prep') return null;
    return getSidebarPhaseBtnRect(vp);
}

const WAVE_CONTROL_GAP = 4;

/** Slower | Pause | Faster in the same slot as Start Wave (active wave only). */
export function getWaveControlRects(game, vp) {
    if (game.phase !== 'wave' || game.gameOver || game.victory || game.phase === 'victory_offer') return null;
    const row = getSidebarPhaseBtnRect(vp);
    const bw = (row.w - 2 * WAVE_CONTROL_GAP) / 3;
    const { x, y, h } = row;
    return {
        row,
        slower: { x, y, w: bw, h },
        pause: { x: x + bw + WAVE_CONTROL_GAP, y, w: bw, h },
        faster: { x: x + 2 * bw + 2 * WAVE_CONTROL_GAP, y, w: bw, h },
    };
}

/** Returns true if click was on a wave control (slower / pause / faster). */
export function tryConsumeWaveControlClick(game, clickX, clickY, vp) {
    const r = getWaveControlRects(game, vp);
    if (!r) return false;
    if (hitTest(clickX, clickY, r.slower)) {
        if (game.speedIndex > 0) {
            game.speedIndex--;
            if (game.audio) game.audio.playClick();
        }
        return true;
    }
    if (hitTest(clickX, clickY, r.faster)) {
        if (game.speedIndex < GAME_SPEED_LEVELS.length - 1) {
            game.speedIndex++;
            if (game.audio) game.audio.playClick();
        }
        return true;
    }
    if (hitTest(clickX, clickY, r.pause)) {
        game.paused = !game.paused;
        if (game.audio) game.audio.playClick();
        return true;
    }
    return false;
}

const SCREEN_BACK_BTN_R = 22;

/** Top-left circular back control (gameplay, map select, difficulty select). */
export function getScreenBackButton() {
    let r = SCREEN_BACK_BTN_R;
    try {
        const vw = window.visualViewport?.width ?? window.innerWidth;
        const vh = window.visualViewport?.height ?? window.innerHeight;
        if (vw > vh && window.matchMedia('(pointer: coarse)').matches) {
            r = 26;
        }
    } catch { /* ignore */ }
    return { cx: 10 + r, cy: 10 + r, r };
}

export function hitScreenBackButton(px, py) {
    const b = getScreenBackButton();
    const dx = px - b.cx;
    const dy = py - b.cy;
    return dx * dx + dy * dy <= b.r * b.r;
}

export function renderScreenBackButton(ctx, mouseX, mouseY) {
    const b = getScreenBackButton();
    drawRoundBackButton(ctx, b.cx, b.cy, b.r, hitScreenBackButton(mouseX, mouseY));
}

/** Gameplay only: hidden during end-game overlays. */
export function getTitleMenuBtn(game) {
    if (game.gameOver || game.victory || game.phase === 'victory_offer') return null;
    return getScreenBackButton();
}

export function hitTitleMenuBtn(px, py, game) {
    if (!getTitleMenuBtn(game)) return false;
    return hitScreenBackButton(px, py);
}

export function renderTitleMenuBtn(ctx, game, mouseX, mouseY) {
    if (!getTitleMenuBtn(game)) return;
    renderScreenBackButton(ctx, mouseX, mouseY);
}

export function renderStartWaveBtn(ctx, game, vp) {
    const prepBtn = getStartWaveBtn(game, vp);
    if (prepBtn) {
        const label = vp.touchHandheld ? t('startWave') : t('startWaveKey');
        drawButton(ctx, prepBtn.x, prepBtn.y, prepBtn.w, prepBtn.h, label, '#E74C3C', true);
        return;
    }
    const wave = getWaveControlRects(game, vp);
    if (wave) {
        const narrow = vp.compactSidebar || vp.touchHandheld || wave.pause.w < 100;
        const slowLabel = narrow ? t('minus') : t('slower');
        const fastLabel = narrow ? t('plus') : t('faster');
        drawButton(ctx, wave.slower.x, wave.slower.y, wave.slower.w, wave.slower.h,
            slowLabel, '#7F8C8D', game.speedIndex > 0);
        const pauseLabel = game.paused
            ? (narrow ? t('resume') : t('resumeKey'))
            : (narrow ? t('pause') : t('pauseKey'));
        const pauseColor = game.paused ? '#3498DB' : '#F39C12';
        drawButton(ctx, wave.pause.x, wave.pause.y, wave.pause.w, wave.pause.h,
            pauseLabel, pauseColor, true);
        drawButton(ctx, wave.faster.x, wave.faster.y, wave.faster.w, wave.faster.h,
            fastLabel, '#7F8C8D', game.speedIndex < GAME_SPEED_LEVELS.length - 1);
    }
}

export function handleGameClick(game, clickX, clickY, input, vp) {
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

    const m = getSidebarMetrics(vp.compactSidebar);
    const swBtn = getStartWaveBtn(game, vp);
    if (swBtn && hitTest(clickX, clickY, swBtn)) {
        if (game.audio) game.audio.playClick();
        game.startWave();
        return;
    }

    if (tryConsumeWaveControlClick(game, clickX, clickY, vp)) {
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

    if (game.selectedTower && game._targetWeakestBtn &&
        hitTest(clickX, clickY, game._targetWeakestBtn)) {
        if (game.audio) game.audio.playClick();
        game.selectedTower.targetMode = TARGET_MODE_WEAKEST;
        return;
    }
    if (game.selectedTower && game._targetFurthestBtn &&
        hitTest(clickX, clickY, game._targetFurthestBtn)) {
        if (game.audio) game.audio.playClick();
        game.selectedTower.targetMode = TARGET_MODE_FURTHEST;
        return;
    }

    for (let i = 0; i < TOWER_DATA.length; i++) {
        const td = TOWER_DATA[i];
        const col = i % m.shopCols;
        const row = Math.floor(i / m.shopCols);
        const sx = SIDEBAR_X + 12 + col * (m.shopItemW + m.shopGap);
        const sy = m.shopStartY + row * (m.shopItemH + m.shopGap);

        if (hitTest(clickX, clickY, { x: sx, y: sy, w: m.shopItemW, h: m.shopItemH })) {
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

export function getAudioBtnRect() {
    try {
        const vw = window.visualViewport?.width ?? window.innerWidth;
        const vh = window.visualViewport?.height ?? window.innerHeight;
        const landscape = vw > vh;
        const coarse = window.matchMedia('(pointer: coarse)').matches;
        const large = coarse && landscape;
        const s = large ? 36 : 32;
        return { x: 8, y: CANVAS_HEIGHT - s, w: s, h: s };
    } catch {
        return { x: 8, y: CANVAS_HEIGHT - 32, w: 32, h: 32 };
    }
}

export function renderAudioToggle(ctx, audio, mouseX, mouseY) {
    const b = getAudioBtnRect();
    const hover = mouseX >= b.x && mouseX <= b.x + b.w &&
                  mouseY >= b.y && mouseY <= b.y + b.h;
    const iconR = b.w >= 36 ? 26 : 24;
    drawSpeakerIcon(ctx, b.x + b.w / 2, b.y + b.h / 2, iconR, audio.muted, hover);
}

export function hitPauseResumeBtn(game, px, py) {
    const b = game._pauseResumeBtn;
    if (!b) return false;
    return px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h;
}

export function renderOverlay(ctx, game) {
    game._pauseResumeBtn = null;
    game._continueInfiniteBtn = null;
    game._declineInfiniteBtn = null;

    if (game.phase === 'victory_offer') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.fillStyle = '#F1C40F';
        ctx.font = uiFont(`bold 36px 'Arial Rounded MT Bold', sans-serif`);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        const v10 = t('victory10');
        ctx.strokeText(v10, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 100);
        ctx.fillText(v10, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 100);

        ctx.fillStyle = '#EEE';
        ctx.font = uiFont(`15px 'Arial Rounded MT Bold', sans-serif`);
        ctx.lineWidth = 1;
        ctx.fillText(t('victoryInfiniteBlurb'), CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 58);
        ctx.fillText(t('victoryHowFar'), CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 34);

        const offerW = 300;
        const offerX = CANVAS_WIDTH / 2 - offerW / 2;
        game._continueInfiniteBtn = drawButton(ctx,
            offerX, CANVAS_HEIGHT / 2 + 8,
            offerW, 44, t('btnContinueInfinite'), '#9B59B6', true);
        game._declineInfiniteBtn = drawButton(ctx,
            offerX, CANVAS_HEIGHT / 2 + 62,
            offerW, 40, t('btnEndVictory'), '#4CAF50', true);
    }

    if (game.gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.fillStyle = '#E74C3C';
        ctx.font = uiFont(`bold 48px 'Arial Rounded MT Bold', sans-serif`);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        const go = t('gameOver');
        ctx.strokeText(go, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);
        ctx.fillText(go, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = uiFont(`18px 'Arial Rounded MT Bold', sans-serif`);
        ctx.fillText(t('roundsSurvived', { n: game.getRoundsSurvived() }), CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        ctx.fillText(t('nigiriEaten', { n: game.totalEaten }), CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);

        game._retryBtn = drawButton(ctx,
            CANVAS_WIDTH / 2 - 75, CANVAS_HEIGHT / 2 + 65,
            150, 40, t('tryAgain'), '#E74C3C', true);
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
        ctx.font = uiFont(`bold 48px 'Arial Rounded MT Bold', sans-serif`);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        const vic = t('victory');
        ctx.strokeText(vic, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);
        ctx.fillText(vic, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = uiFont(`18px 'Arial Rounded MT Bold', sans-serif`);
        ctx.fillText(t('nigiriEaten', { n: game.totalEaten }), CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        ctx.fillText(t('totalEarned', { n: game.totalEarned }), CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
        ctx.fillText(t('lifeRemaining', { n: game.life }), CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);

        game._retryBtn = drawButton(ctx,
            CANVAS_WIDTH / 2 - 90, CANVAS_HEIGHT / 2 + 90,
            180, 40, t('backToTitle'), '#4CAF50', true);
    }

    if (game.paused && !game.gameOver && !game.victory && game.phase !== 'victory_offer') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = uiFont(`bold 44px 'Arial Rounded MT Bold', sans-serif`);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        const pz = t('paused');
        ctx.strokeText(pz, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 28);
        ctx.fillText(pz, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 28);

        ctx.font = uiFont(`16px 'Arial Rounded MT Bold', sans-serif`);
        ctx.lineWidth = 1;
        ctx.fillStyle = '#EEE';
        ctx.fillText(t('pauseResumeHint'), CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 14);

        game._pauseResumeBtn = drawButton(ctx,
            CANVAS_WIDTH / 2 - 80, CANVAS_HEIGHT / 2 + 44,
            160, 40, t('resumeBtn'), '#3498DB', true);
    }
}
