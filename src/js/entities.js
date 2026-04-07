import {
    CELL_SIZE, GRID_OFFSET_X, GRID_OFFSET_Y,
    BASE_BELT_SPEED, ENEMY_DATA, TOWER_DATA,
    cellToPixel, getTotalCost, getSellValue, getUpgradeCost,
} from './data.js';

/** Per-tower target priority for `_findTargets`. */
export const TARGET_MODE_FURTHEST = 'furthest';
export const TARGET_MODE_WEAKEST = 'weakest';

export class Enemy {
    constructor(typeId, mapPath, hpMult = 1, speedMult = 1, moneyMult = 1) {
        const data = ENEMY_DATA.find(e => e.id === typeId);
        this.data = data;
        this.id = typeId;
        this.mapPath = mapPath;
        const h = data.hp * hpMult;
        this.maxHp = h;
        this.hp = h;
        this.speed = data.speed * speedMult;
        this.money = Math.max(1, Math.round(data.money * moneyMult));
        this.lifePenalty = data.lifePenalty;
        this.distance = 0;
        this.alive = true;
        this.exited = false;
        this.slowTimer = 0;
        this.slowPct = 0;
        this.stunTimer = 0;
        this.burnTimer = 0;
        this.burnDps = 0;
        /** Last tower that dealt direct damage (for Tanuki last-hit bonus priority). */
        this.lastHitTower = null;
        this.x = 0;
        this.y = 0;
        this._updatePosition();
    }

    _updatePosition() {
        const path = this.mapPath;
        const idx = Math.floor(this.distance);
        const t = this.distance - idx;
        if (idx >= path.length - 1) {
            const last = path[path.length - 1];
            const pos = cellToPixel(last.x, last.y);
            this.x = pos.x;
            this.y = pos.y;
            return;
        }
        const a = path[idx];
        const b = path[idx + 1];
        const pa = cellToPixel(a.x, a.y);
        const pb = cellToPixel(b.x, b.y);
        this.x = pa.x + (pb.x - pa.x) * t;
        this.y = pa.y + (pb.y - pa.y) * t;
    }

    update(dt) {
        if (!this.alive || this.exited) return;

        if (this.stunTimer > 0) {
            this.stunTimer -= dt * 1000;
            this._updatePosition();
            return;
        }

        if (this.burnTimer > 0) {
            this.burnTimer -= dt * 1000;
            this.hp -= this.burnDps * dt;
            if (this.hp <= 0) {
                this.hp = 0;
                this.alive = false;
                return;
            }
        }

        if (this.slowTimer > 0) {
            this.slowTimer -= dt * 1000;
        }

        const effectiveSpeed = this.stunTimer > 0 ? 0 :
            this.speed * (this.slowTimer > 0 ? (1 - this.slowPct) : 1);

        const moveAmount = (BASE_BELT_SPEED / CELL_SIZE) * effectiveSpeed * dt;
        this.distance += moveAmount;

        if (this.distance >= this.mapPath.length - 1) {
            this.distance = this.mapPath.length - 1;
            this.exited = true;
        }

        this._updatePosition();
    }

    /**
     * @param {Tower | null} [attackerTower]
     */
    takeDamage(amount, attackerTower = null) {
        if (attackerTower) this.lastHitTower = attackerTower;
        this.hp -= amount;
        if (this.hp <= 0) {
            this.hp = 0;
            this.alive = false;
        }
    }

    applySlow(pct, duration) {
        if (pct > this.slowPct || this.slowTimer <= 0) {
            this.slowPct = pct;
            this.slowTimer = duration;
        }
    }

    applyStun(duration) {
        this.stunTimer = Math.max(this.stunTimer, duration);
    }

    /** @param {Tower | null} [attackerTower] burn kill credits this tower */
    applyBurn(dps, duration, attackerTower = null) {
        if (attackerTower) this.lastHitTower = attackerTower;
        this.burnDps = dps;
        this.burnTimer = duration;
    }

    getHpRatio() {
        return this.hp / this.maxHp;
    }
}

export class Tower {
    constructor(typeId, col, row) {
        this.typeData = TOWER_DATA.find(t => t.id === typeId);
        this.id = typeId;
        this.col = col;
        this.row = row;
        this.tier = 0;
        this.attackTimer = 0;
        this.attackAnimTimer = 0;
        this.idlePhase = Math.random() * Math.PI * 2;
        const pos = cellToPixel(col, row);
        this.x = pos.x;
        this.y = pos.y;
        /** `'weakest'` = lowest current HP first; `'furthest'` = highest path `distance` (nearest bin) first. */
        this.targetMode = TARGET_MODE_FURTHEST;
    }

    get stats() { return this.typeData.tiers[this.tier]; }

    getBuffedStats(towers) {
        let speedMult = 1.0;
        let damageMult = 1.0;
        for (const t of towers) {
            if (t === this) continue;
            if (t.id !== 'shiba') continue;
            const dx = Math.abs(t.col - this.col);
            const dy = Math.abs(t.row - this.row);
            if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
                const sp = t.stats.special;
                if (sp && sp.type === 'aura') {
                    speedMult *= (1 - sp.speedBuff);
                    if (sp.damageBuff) damageMult += sp.damageBuff;
                }
            }
        }
        return {
            damage: Math.round(this.stats.damage * damageMult),
            range: this.stats.range,
            speed: Math.round(this.stats.speed * speedMult),
            special: this.stats.special,
        };
    }

    canUpgrade() { return this.tier < 2; }
    getUpgradeCost() { return getUpgradeCost(this.typeData, this.tier); }
    getTotalCost() { return getTotalCost(this.typeData, this.tier); }
    getSellValue() { return getSellValue(this.typeData, this.tier); }
    upgrade() { if (this.canUpgrade()) this.tier++; }

    update(dt, enemies, towers, effects, audio) {
        this.attackTimer -= dt * 1000;
        if (this.attackAnimTimer > 0) this.attackAnimTimer -= dt * 1000;

        if (this.attackTimer <= 0) {
            const buffed = this.getBuffedStats(towers);
            const targets = this._findTargets(enemies, buffed);

            if (targets.length > 0) {
                this.attackTimer = buffed.speed;
                this.attackAnimTimer = 300;

                if (audio) {
                    const sp = buffed.special;
                    if (sp && sp.type === 'aoe') audio.playFire();
                    else if (sp && sp.type === 'multiTarget') audio.playMulti();
                    else if (this.id === 'fox' || this.id === 'monkey' || this.id === 'owl') audio.playThrow();
                    else audio.playChomp();
                }

                for (const target of targets) {
                    let dmg = buffed.damage;
                    const sp = buffed.special;

                    if (sp && sp.type === 'crit' && Math.random() < sp.chance) {
                        dmg = Math.round(dmg * sp.mult);
                        effects.addFloatingText(target.x, target.y - 20, `${dmg}!`, '#FF5722', 18);
                    }

                    if (sp && sp.type === 'doubleBite' && Math.random() < sp.chance) {
                        dmg *= 2;
                    }

                    target.takeDamage(dmg, this);
                    effects.addFloatingText(target.x, target.y - 15, `-${dmg}`, '#FFFFFF');

                    if (sp) {
                        if (sp.type === 'slow') target.applySlow(sp.pct, sp.dur);
                        if (sp.type === 'stun' && Math.random() < sp.chance) target.applyStun(sp.dur);
                        if (sp.type === 'aoe' && sp.burn && !target.alive) {
                        } else if (sp.type === 'aoe' && sp.burn) {
                            target.applyBurn(sp.burn.dps, sp.burn.dur, this);
                        }
                    }

                    if (sp && sp.type === 'aoe') {
                        for (const e of enemies) {
                            if (e === target || !e.alive || e.exited) continue;
                            const d = Math.hypot(e.x - target.x, e.y - target.y) / CELL_SIZE;
                            if (d <= sp.radius) {
                                e.takeDamage(dmg, this);
                                effects.addFloatingText(e.x, e.y - 15, `-${dmg}`, '#FF9800');
                                if (sp.burn) e.applyBurn(sp.burn.dps, sp.burn.dur, this);
                            }
                        }
                    }

                    if (sp && sp.type === 'stun' && sp.splash) {
                        for (const e of enemies) {
                            if (e === target || !e.alive || e.exited) continue;
                            const d = Math.hypot(e.x - target.x, e.y - target.y) / CELL_SIZE;
                            if (d <= sp.splash) {
                                e.takeDamage(Math.round(dmg * 0.5), this);
                            }
                        }
                    }

                    if (sp && sp.type === 'multiTarget' && sp.slow) {
                        target.applySlow(sp.slow.pct, sp.slow.dur);
                    }
                }
            }
        }
    }

    _findTargets(enemies, buffed) {
        const rangePx = buffed.range * CELL_SIZE;
        const sp = buffed.special;
        const maxTargets = (sp && sp.type === 'multiTarget') ? sp.count :
            (sp && sp.type === 'pierce') ? sp.count : 1;

        const inRange = enemies
            .filter(e => e.alive && !e.exited)
            .filter(e => Math.hypot(e.x - this.x, e.y - this.y) <= rangePx);

        if (this.targetMode === TARGET_MODE_WEAKEST) {
            inRange.sort((a, b) => (a.hp - b.hp) || (b.distance - a.distance));
        } else {
            inRange.sort((a, b) => (b.distance - a.distance) || (a.hp - b.hp));
        }

        return inRange.slice(0, maxTargets);
    }

    getState() {
        return this.attackAnimTimer > 0 ? 'attack' : 'idle';
    }
}

export class EnemySpawner {
    constructor(queue, interval, pathProvider, hpMult = 1, speedMult = 1, moneyMult = 1) {
        this.queue = [...queue];
        this.interval = interval;
        this.pathProvider = pathProvider;
        this.hpMult = hpMult;
        this.speedMult = speedMult;
        this.moneyMult = moneyMult;
        this.timer = 0;
        this.done = false;
    }

    update(dt) {
        if (this.done) return null;
        this.timer -= dt * 1000;
        if (this.timer <= 0 && this.queue.length > 0) {
            this.timer = this.interval;
            const id = this.queue.shift();
            if (this.queue.length === 0) this.done = true;
            return new Enemy(id, this.pathProvider(), this.hpMult, this.speedMult, this.moneyMult);
        }
        return null;
    }
}
