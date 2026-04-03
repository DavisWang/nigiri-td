import {
    CANVAS_WIDTH, CANVAS_HEIGHT, GAME_AREA_WIDTH, SIDEBAR_X, SIDEBAR_WIDTH,
    CELL_SIZE, GRID_COLS, GRID_ROWS, GRID_OFFSET_X, GRID_OFFSET_Y,
    COLORS, TOWER_DATA,
    cellToPixel, pixelToCell,
    getTotalCost, getDifficultyProfile,
} from './data.js';
import {
    drawTower, drawNigiri, drawHeart, drawCoin, drawButton, drawRoundBackButton,
    drawGarbageBin, drawKitchenDoor, drawSeatIndicator, drawBeltTile,
    drawTierStars, drawSpeakerIcon,
} from './sprites.js';

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
            shopStartY: 196,
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
            panelSelectedH: 160,
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
        shopStartY: 178,
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
        panelSelectedH: 176,
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
    ctx.font = m.fontMapName;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(game.mapCtx.def.name, x, m.mapY);
    const diff = getDifficultyProfile(game.difficultyId);
    ctx.font = m.fontDiff;
    ctx.fillStyle = diff.accent;
    ctx.textAlign = 'right';
    ctx.fillText(diff.label, SIDEBAR_X + SIDEBAR_WIDTH - 12, m.mapY);
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
    ctx.font = m.fontMoney;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const moneyStr = `${game.money}`;
    ctx.fillText(moneyStr, startX + 28, rowY);
    const moneyEndX = startX + 28 + ctx.measureText(moneyStr).width;

    const heartCount = Math.min(game.maxLife, 10);
    const heartsPerIcon = game.maxLife / heartCount;
    const heartSize = m.heartR;
    let heartSpacing = m.heartSpacingMax;

    ctx.font = m.fontLife;
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
    ctx.font = m.fontLife;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(lifeStr, rightX, rowY);
    ctx.textAlign = 'left';
}

function renderRoundInfo(ctx, game, m) {
    const x = SIDEBAR_X + SIDEBAR_WIDTH / 2;
    const y = m.roundY;

    ctx.fillStyle = COLORS.textPrimary;
    ctx.font = m.fontRound;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const totalRounds = game._roundData.length;
    ctx.fillText(`Round ${Math.min(game.round + 1, totalRounds)} / ${totalRounds}`, x, y);
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
    ctx.font = m.fontWaveLabel;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Incoming:', startX, y);

    let px = startX;
    const py = m.waveRowY;
    for (const item of preview) {
        drawNigiri(ctx, px + 10, py, nr, item.data, 1.0);

        ctx.fillStyle = COLORS.textPrimary;
        ctx.font = m.fontWaveCount;
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
    ctx.font = m.fontShopTitle;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Tower Shop', startX, sy - 15);

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
        ctx.font = m.fontTowerName;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        const nameY = shopItemH >= 50 ? y + 9 : y + 8;
        ctx.fillText(td.name, x + shopItemW - 8, nameY);

        ctx.fillStyle = affordable ? '#4CAF50' : COLORS.textAccent;
        ctx.font = m.fontTowerCost;
        ctx.textAlign = 'right';
        const costY = shopItemH >= 50 ? y + 28 : y + 26;
        ctx.fillText(`$${td.tiers[0].cost}`, x + shopItemW - 8, costY);

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

function renderSelectedInfo(ctx, game, m) {
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
    let cy = y + pad;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, 46, panelH, [8, 0, 0, 8]);
    ctx.clip();
    drawTower(ctx, tower.id, x + 24, cy + 14, 36, 'idle');
    ctx.restore();

    ctx.fillStyle = COLORS.textPrimary;
    ctx.font = m.fontSelTitle;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(tower.typeData.name, x + 50, cy);
    drawTierStars(ctx, x + 50, cy + 16, tower.tier);
    cy += 30;

    const buffed = tower.getBuffedStats(game.towers);
    ctx.font = m.fontSelStat;
    ctx.fillStyle = '#555';
    ctx.fillText(`DMG ${buffed.damage}`, x + pad, cy);
    ctx.fillText(`RNG ${buffed.range}`, x + pad + 68, cy);
    ctx.fillText(`SPD ${buffed.speed}ms`, x + pad + 136, cy);
    cy += 16;

    const specialText = formatSpecial(buffed.special);
    if (specialText) {
        ctx.font = m.fontSelSpecial;
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

        ctx.font = m.fontSelNext;
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
            ctx.font = m.fontSelHint;
            ctx.fillText(`\u2192 ${nextSpecial}`, x + pad + 32, cy);
        }
    } else {
        ctx.font = m.fontSelNext;
        ctx.fillStyle = '#999';
        ctx.fillText('Fully upgraded', x + pad, cy);
    }
    cy += 16;

    const btnW = (w - 10) / 2;
    if (tower.canUpgrade()) {
        const cost = tower.getUpgradeCost();
        const canAfford = game.money >= cost || game.testMode;
        game._upgradeBtn = drawButton(ctx, x + 2, cy, btnW, btnH, `Upgrade $${cost}`, '#4CAF50', canAfford);
    } else {
        game._upgradeBtn = drawButton(ctx, x + 2, cy, btnW, btnH, 'MAX', '#9E9E9E', false);
    }
    const sellVal = tower.getSellValue();
    game._sellBtn = drawButton(ctx, x + 6 + btnW, cy, btnW, btnH, `Sell $${sellVal}`, '#F44336', true);
    cy += btnH + 8;

    ctx.font = m.fontSelHint;
    ctx.fillStyle = '#AAA';
    ctx.textAlign = 'center';
    ctx.fillText('[U] Upgrade  [S] Sell  [Esc] Deselect', SIDEBAR_X + SIDEBAR_WIDTH / 2, cy);
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
    ctx.font = m.fontPlaceTitle;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(td.name, x + 50, y + pad);

    ctx.font = m.fontPlaceDesc;
    ctx.fillStyle = '#999';
    ctx.fillText(td.description, x + 50, y + pad + 16);

    ctx.font = m.fontPlaceStat;
    ctx.fillStyle = '#555';
    ctx.fillText(`DMG ${base.damage}`, x + pad, y + pad + 36);
    ctx.fillText(`RNG ${base.range}`, x + pad + 68, y + pad + 36);
    ctx.fillText(`SPD ${base.speed}ms`, x + pad + 136, y + pad + 36);

    const specialText = formatSpecial(base.special);
    if (specialText) {
        ctx.font = m.fontPlaceSpecial;
        ctx.fillStyle = '#9C27B0';
        ctx.fillText(specialText, x + pad, y + pad + 52);
    }

    if (showNeedFunds) {
        ctx.font = m.fontPlaceNeed;
        ctx.fillStyle = COLORS.textAccent;
        ctx.textAlign = 'left';
        ctx.fillText(`Need $${base.cost} to place (preview)`, x + pad, y + panelH - 14);
    }
}

export function getStartWaveBtn(game, vp) {
    if (game.phase !== 'prep') return null;
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
    if (game.gameOver || game.victory) return null;
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
    if (game.phase !== 'prep') return;
    const btn = getStartWaveBtn(game, vp);
    const label = vp.touchHandheld ? 'Start Wave' : 'Start Wave [Space]';
    drawButton(ctx, btn.x, btn.y, btn.w, btn.h, label, '#E74C3C', true);
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
