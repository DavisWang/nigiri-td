import { CELL_SIZE, TIER_COLORS, COLORS } from './data.js';
import { getSprite } from './sprite-loader.js';
import { uiFont } from './i18n.js';

export function drawTower(ctx, towerId, cx, cy, size, state) {
    const key = `${towerId}-${state === 'attack' ? 'attack' : 'idle'}`;
    const img = getSprite(key);
    if (img) {
        const iw = img.naturalWidth || img.width;
        const ih = img.naturalHeight || img.height;
        const aspect = iw / ih;
        const drawH = size;
        const drawW = size * aspect;
        ctx.drawImage(img, cx - drawW * 0.5, cy - drawH * 0.5, drawW, drawH);
    }
}

export function drawNigiri(ctx, cx, cy, size, enemyData, hpRatio) {
    const key = `nigiri-${enemyData.id}`;
    const img = getSprite(key);
    if (img) {
        const s = size * 0.85;
        const half = s * 0.5;
        ctx.drawImage(img, cx - half, cy - half * 0.8, s, s * 0.8);
    }

    if (hpRatio < 1.0) {
        const barW = size * 0.56;
        const barH = 4;
        const barX = cx - barW / 2;
        const barY = cy - size * 0.38;
        ctx.fillStyle = '#333';
        ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
        const r = Math.floor(255 * (1 - hpRatio));
        const g = Math.floor(255 * hpRatio);
        ctx.fillStyle = `rgb(${r},${g},0)`;
        ctx.fillRect(barX, barY, barW * hpRatio, barH);
    }

    if (hpRatio <= 0.25) {
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - size * 0.1, cy - size * 0.15);
        ctx.lineTo(cx + size * 0.07, cy + size * 0.07);
        ctx.stroke();
    }
}

export function drawHeart(ctx, x, y, size) {
    const s = size * 0.55;
    const r = s * 0.5;
    const lcy = y - s * 0.1;
    const lx = x - s * 0.3;
    const rx = x + s * 0.3;
    const tip = y + s * 0.42;

    ctx.fillStyle = '#C0392B';
    ctx.beginPath();
    ctx.arc(lx, lcy, r + 1.5, Math.PI, 0);
    ctx.arc(rx, lcy, r + 1.5, Math.PI, 0);
    ctx.lineTo(x, tip + 2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = COLORS.life;
    ctx.beginPath();
    ctx.arc(lx, lcy, r, Math.PI, 0);
    ctx.arc(rx, lcy, r, Math.PI, 0);
    ctx.lineTo(x, tip);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.ellipse(lx, lcy - r * 0.3, r * 0.3, r * 0.25, -0.4, 0, Math.PI * 2);
    ctx.fill();
}

export function drawCoin(ctx, x, y, size) {
    ctx.fillStyle = COLORS.money;
    ctx.strokeStyle = '#D4AC0D';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#B7950B';
    ctx.font = `bold ${size * 0.45}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', x, y + 1);
}

/** Circular control with a left-pointing chevron (e.g. back to title). */
export function drawRoundBackButton(ctx, cx, cy, r, hover) {
    const fill = hover ? '#95A5A6' : '#7F8C8D';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.18)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const s = r * 0.38;
    ctx.beginPath();
    ctx.moveTo(cx + s * 0.2, cy - s);
    ctx.lineTo(cx - s * 0.55, cy);
    ctx.lineTo(cx + s * 0.2, cy + s);
    ctx.stroke();
}

export function drawButton(ctx, x, y, w, h, text, color, enabled = true) {
    const radius = 8;
    ctx.globalAlpha = enabled ? 1.0 : 0.5;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.fill();

    ctx.fillStyle = enabled ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h / 2, [radius, radius, 0, 0]);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = uiFont(`bold 16px 'Arial Rounded MT Bold', 'Nunito', sans-serif`);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + w / 2, y + h / 2 + 1);
    ctx.globalAlpha = 1.0;

    return { x, y, w, h };
}

export function drawGarbageBin(ctx, cx, cy, size) {
    const s = size * 0.5;

    ctx.fillStyle = '#607D8B';
    ctx.beginPath();
    ctx.roundRect(cx - s * 0.45, cy - s * 0.15, s * 0.9, s * 0.75, [0, 0, 5, 5]);
    ctx.fill();

    ctx.fillStyle = '#78909C';
    ctx.beginPath();
    ctx.roundRect(cx - s * 0.4, cy - s * 0.1, s * 0.8, s * 0.65, [0, 0, 4, 4]);
    ctx.fill();

    ctx.fillStyle = '#455A64';
    ctx.beginPath();
    ctx.roundRect(cx - s * 0.5, cy - s * 0.35, s * 1.0, s * 0.22, [3, 3, 0, 0]);
    ctx.fill();

    ctx.fillStyle = '#37474F';
    ctx.beginPath();
    ctx.roundRect(cx - s * 0.14, cy - s * 0.52, s * 0.28, s * 0.2, 3);
    ctx.fill();

    ctx.strokeStyle = '#455A64';
    ctx.lineWidth = 1.5;
    for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(cx + i * s * 0.22, cy - s * 0.08);
        ctx.lineTo(cx + i * s * 0.22, cy + s * 0.5);
        ctx.stroke();
    }
}

export function drawKitchenDoor(ctx, cx, cy, size) {
    const s = size * 0.5;

    ctx.fillStyle = '#6D4C41';
    ctx.beginPath();
    ctx.roundRect(cx - s * 0.6, cy - s * 0.6, s * 1.2, s * 1.1, [6, 6, 0, 0]);
    ctx.fill();

    ctx.fillStyle = '#8D6E63';
    ctx.beginPath();
    ctx.roundRect(cx - s * 0.52, cy - s * 0.5, s * 1.04, s * 0.95, [4, 4, 0, 0]);
    ctx.fill();

    const curtainW = s * 0.42;
    const curtainH = s * 0.7;
    ctx.fillStyle = '#FFF8E7';
    ctx.beginPath();
    ctx.roundRect(cx - curtainW - s * 0.03, cy - s * 0.4, curtainW, curtainH, [0, 0, 4, 4]);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(cx + s * 0.03, cy - s * 0.4, curtainW, curtainH, [0, 0, 4, 4]);
    ctx.fill();

    ctx.fillStyle = '#C0392B';
    ctx.fillRect(cx - curtainW - s * 0.03, cy - s * 0.4, curtainW, 3);
    ctx.fillRect(cx + s * 0.03, cy - s * 0.4, curtainW, 3);

    ctx.fillStyle = '#5D4037';
    ctx.font = `bold ${s * 0.28}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('厨', cx, cy - s * 0.05);
}

export function drawSeatIndicator(ctx, cx, cy, size) {
    const s = size * 0.38;
    ctx.globalAlpha = 0.28;

    ctx.fillStyle = '#5D4037';
    const legDist = s * 0.9;
    for (const [dx, dy] of [[-1,-1],[1,-1],[-1,1],[1,1]]) {
        ctx.beginPath();
        ctx.arc(cx + dx * legDist, cy + dy * legDist, s * 0.13, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.fillStyle = '#8D6E63';
    ctx.beginPath();
    ctx.arc(cx, cy, s * 1.05, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, s * 0.95, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#C0392B';
    ctx.beginPath();
    ctx.arc(cx, cy, s * 0.82, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,200,200,0.25)';
    ctx.beginPath();
    ctx.ellipse(cx - s * 0.18, cy - s * 0.18, s * 0.35, s * 0.28, -0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1.0;
}

export function drawBeltTile(ctx, x, y, size, tileType, flowDir = 1) {
    const rail = 3;

    ctx.fillStyle = COLORS.belt;
    ctx.fillRect(x, y, size, size);

    const open = { top: false, right: false, bottom: false, left: false };
    switch (tileType) {
        case 'h': open.left = open.right = true; break;
        case 'v': open.top = open.bottom = true; break;
        case 'corner-lb': open.left = open.bottom = true; break;
        case 'corner-lt': open.left = open.top = true; break;
        case 'corner-rb': open.right = open.bottom = true; break;
        case 'corner-rt': open.right = open.top = true; break;
        case 't-top': open.left = open.right = open.top = true; break;
        case 't-bottom': open.left = open.right = open.bottom = true; break;
        case 't-left': open.top = open.bottom = open.left = true; break;
        case 't-right': open.top = open.bottom = open.right = true; break;
        case 'cross': open.top = open.bottom = open.left = open.right = true; break;
    }

    ctx.fillStyle = COLORS.beltBorder;
    if (!open.top) ctx.fillRect(x, y, size, rail);
    if (!open.bottom) ctx.fillRect(x, y + size - rail, size, rail);
    if (!open.left) ctx.fillRect(x, y, rail, size);
    if (!open.right) ctx.fillRect(x + size - rail, y, rail, size);

    if (!open.top && !open.right) {
        ctx.beginPath();
        ctx.arc(x + size, y, rail + 1, Math.PI * 0.5, Math.PI);
        ctx.lineTo(x + size - rail, y);
        ctx.lineTo(x + size, y + rail);
        ctx.fill();
    }
    if (!open.top && !open.left) {
        ctx.beginPath();
        ctx.arc(x, y, rail + 1, 0, Math.PI * 0.5);
        ctx.lineTo(x, y + rail);
        ctx.lineTo(x + rail, y);
        ctx.fill();
    }
    if (!open.bottom && !open.right) {
        ctx.beginPath();
        ctx.arc(x + size, y + size, rail + 1, Math.PI, Math.PI * 1.5);
        ctx.lineTo(x + size, y + size - rail);
        ctx.lineTo(x + size - rail, y + size);
        ctx.fill();
    }
    if (!open.bottom && !open.left) {
        ctx.beginPath();
        ctx.arc(x, y + size, rail + 1, Math.PI * 1.5, Math.PI * 2);
        ctx.lineTo(x + rail, y + size);
        ctx.lineTo(x, y + size - rail);
        ctx.fill();
    }

    const time = Date.now() * 0.001;
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;

    if (tileType === 'h') {
        const spacing = 10;
        const animOffset = ((time * 25 * flowDir) % spacing + spacing) % spacing;
        for (let i = -1; i <= size / spacing + 1; i++) {
            const rx = x + i * spacing + animOffset;
            if (rx <= x + 1 || rx >= x + size - 1) continue;
            ctx.beginPath();
            ctx.moveTo(rx, y + rail + 2);
            ctx.lineTo(rx, y + size - rail - 2);
            ctx.stroke();
        }
    } else if (tileType === 'v') {
        const spacing = 10;
        const animOffset = ((time * 25 * flowDir) % spacing + spacing) % spacing;
        for (let i = -1; i <= size / spacing + 1; i++) {
            const ry = y + i * spacing + animOffset;
            if (ry <= y + 1 || ry >= y + size - 1) continue;
            ctx.beginPath();
            ctx.moveTo(x + rail + 2, ry);
            ctx.lineTo(x + size - rail - 2, ry);
            ctx.stroke();
        }
    } else if (tileType.startsWith('t-') || tileType === 'cross') {
        ctx.strokeStyle = 'rgba(255,255,255,0.09)';
        const spacing = 10;
        const animOffset = ((time * 25) % spacing + spacing) % spacing;
        for (let i = -1; i <= size / spacing + 1; i++) {
            const rx = x + i * spacing + animOffset;
            if (rx > x + rail + 1 && rx < x + size - rail - 1) {
                ctx.beginPath();
                ctx.moveTo(rx, y + rail + 2);
                ctx.lineTo(rx, y + size - rail - 2);
                ctx.stroke();
            }
            const ry = y + i * spacing + animOffset;
            if (ry > y + rail + 1 && ry < y + size - rail - 1) {
                ctx.beginPath();
                ctx.moveTo(x + rail + 2, ry);
                ctx.lineTo(x + size - rail - 2, ry);
                ctx.stroke();
            }
        }
    } else {
        let arcCx, arcCy, startAngle, endAngle;
        switch (tileType) {
            case 'corner-lb': arcCx = x; arcCy = y + size; startAngle = Math.PI * 1.5; endAngle = Math.PI * 2; break;
            case 'corner-lt': arcCx = x; arcCy = y; startAngle = 0; endAngle = Math.PI * 0.5; break;
            case 'corner-rb': arcCx = x + size; arcCy = y + size; startAngle = Math.PI; endAngle = Math.PI * 1.5; break;
            case 'corner-rt': arcCx = x + size; arcCy = y; startAngle = Math.PI * 0.5; endAngle = Math.PI; break;
        }
        ctx.strokeStyle = 'rgba(255,255,255,0.09)';
        const spacing = 10;
        for (let r = spacing; r < size + spacing; r += spacing) {
            ctx.beginPath();
            ctx.arc(arcCx, arcCy, r, startAngle, endAngle);
            ctx.stroke();
        }
    }
}

export function drawTierStars(ctx, x, y, tier, maxTier = 3) {
    const starSize = 10;
    const gap = 14;
    for (let i = 0; i < maxTier; i++) {
        const sx = x + i * gap;
        ctx.fillStyle = i <= tier ? COLORS.money : '#CCCCCC';
        drawStar(ctx, sx, y, starSize * 0.5, starSize * 0.25, 5);
    }
}

function drawStar(ctx, cx, cy, outerR, innerR, points) {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = (i * Math.PI) / points - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
}

export function drawSpeakerIcon(ctx, cx, cy, size, muted, hover) {
    const s = size * 0.5;
    ctx.globalAlpha = hover ? 0.7 : 0.45;

    ctx.fillStyle = '#888';
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.3, cy - s * 0.25);
    ctx.lineTo(cx - s * 0.05, cy - s * 0.25);
    ctx.lineTo(cx + s * 0.3, cy - s * 0.6);
    ctx.lineTo(cx + s * 0.3, cy + s * 0.6);
    ctx.lineTo(cx - s * 0.05, cy + s * 0.25);
    ctx.lineTo(cx - s * 0.3, cy + s * 0.25);
    ctx.closePath();
    ctx.fill();

    if (!muted) {
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx + s * 0.35, cy, s * 0.3, -0.6, 0.6);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx + s * 0.35, cy, s * 0.5, -0.5, 0.5);
        ctx.stroke();
    } else {
        ctx.strokeStyle = '#C0392B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx + s * 0.2, cy - s * 0.35);
        ctx.lineTo(cx + s * 0.65, cy + s * 0.35);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + s * 0.65, cy - s * 0.35);
        ctx.lineTo(cx + s * 0.2, cy + s * 0.35);
        ctx.stroke();
    }

    ctx.globalAlpha = 1.0;
}
