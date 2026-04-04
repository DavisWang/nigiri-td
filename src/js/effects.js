import { uiFont } from './i18n.js';

export class EffectManager {
    constructor() {
        this.effects = [];
    }

    addFloatingText(x, y, text, color, size = 14) {
        this.effects.push({
            type: 'float',
            x, y, text, color, size,
            life: 800,
            maxLife: 800,
            vy: -30,
        });
    }

    addBurst(x, y, color, count = 8) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
            const speed = 40 + Math.random() * 40;
            this.effects.push({
                type: 'particle',
                x, y, color,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 400 + Math.random() * 200,
                maxLife: 600,
                size: 3 + Math.random() * 3,
            });
        }
    }

    addWastePuff(x, y) {
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 * i) / 6;
            const speed = 20 + Math.random() * 20;
            this.effects.push({
                type: 'particle',
                x, y, color: '#90A4AE',
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 15,
                life: 500,
                maxLife: 500,
                size: 4 + Math.random() * 4,
            });
        }
    }

    addPlaceBounce(x, y) {
        this.effects.push({
            type: 'ring',
            x, y,
            radius: 5,
            maxRadius: 30,
            life: 300,
            maxLife: 300,
            color: 'rgba(168, 230, 207, 0.6)',
        });
    }

    addBanner(text, duration = 1500) {
        this.effects.push({
            type: 'banner',
            text,
            life: duration,
            maxLife: duration,
            y: -40,
        });
    }

    update(dt) {
        for (const e of this.effects) {
            e.life -= dt * 1000;
            if (e.type === 'float') {
                e.y += e.vy * dt;
            } else if (e.type === 'particle') {
                e.x += e.vx * dt;
                e.y += e.vy * dt;
                e.vy += 60 * dt;
            } else if (e.type === 'ring') {
                const p = 1 - e.life / e.maxLife;
                e.radius = 5 + p * e.maxRadius;
            } else if (e.type === 'banner') {
                const p = 1 - e.life / e.maxLife;
                if (p < 0.15) {
                    e.y = -40 + (40 + 30) * (p / 0.15);
                } else if (p > 0.85) {
                    e.y = 30 - 70 * ((p - 0.85) / 0.15);
                } else {
                    e.y = 30;
                }
            }
        }
        this.effects = this.effects.filter(e => e.life > 0);
    }

    render(ctx, canvasWidth) {
        for (const e of this.effects) {
            const alpha = Math.max(0, e.life / e.maxLife);
            ctx.globalAlpha = alpha;

            if (e.type === 'float') {
                ctx.font = uiFont(`bold ${e.size}px 'Arial Rounded MT Bold', sans-serif`);
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 2.5;
                ctx.strokeText(e.text, e.x, e.y);
                ctx.fillStyle = e.color;
                ctx.fillText(e.text, e.x, e.y);
            } else if (e.type === 'particle') {
                ctx.fillStyle = e.color;
                ctx.beginPath();
                ctx.arc(e.x, e.y, e.size * alpha, 0, Math.PI * 2);
                ctx.fill();
            } else if (e.type === 'ring') {
                ctx.strokeStyle = e.color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
                ctx.stroke();
            } else if (e.type === 'banner') {
                const w = canvasWidth || 640;
                ctx.fillStyle = 'rgba(0,0,0,0.6)';
                ctx.fillRect(0, e.y - 5, w, 40);
                ctx.fillStyle = '#FFFFFF';
                ctx.font = uiFont(`bold 24px 'Arial Rounded MT Bold', sans-serif`);
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(e.text, w / 2, e.y + 15);
            }

            ctx.globalAlpha = 1.0;
        }
    }
}
