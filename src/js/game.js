import {
    STARTING_MONEY, STARTING_LIFE, TEST_ROUND_DATA, TOWER_DATA, ENEMY_DATA,
    GRID_COLS, GRID_ROWS,
    getTotalCost, getSellValue, getUpgradeCost, getRoundBonus, buildSpawnQueue,
    MapContext, getMapById,
} from './data.js';
import { Tower, EnemySpawner } from './entities.js';
import { EffectManager } from './effects.js';

export class GameState {
    constructor(audio) {
        this.audio = audio || null;
        this.reset();
    }

    reset(mapId = 'kaiten', testMode = false) {
        this.testMode = testMode;
        this.mapId = mapId;
        this.mapCtx = new MapContext(getMapById(mapId));
        this.money = testMode ? 99999 : STARTING_MONEY;
        this.life = STARTING_LIFE;
        this.maxLife = STARTING_LIFE;
        this.round = 0;
        this.phase = 'prep';
        this.towers = [];
        this.enemies = [];
        this.effects = new EffectManager();
        this.spawner = null;
        this.selectedTower = null;
        this.placingTowerId = null;
        this.gameOver = false;
        this.victory = false;
        this.towerGrid = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(null));
        this.totalEaten = 0;
        this.totalEarned = 0;
        this.roundEaten = 0;
        this.roundEarned = 0;
        this._roundData = testMode ? TEST_ROUND_DATA : this.mapCtx.def.rounds;
    }

    canPlaceTower(col, row) {
        if (!this.mapCtx.isBuildable(col, row)) return false;
        return this.towerGrid[row][col] === null;
    }

    /** Enough money for a new copy of this tower (tier 1 cost). */
    canAffordTowerBase(typeId) {
        if (this.testMode) return true;
        const data = TOWER_DATA.find(t => t.id === typeId);
        return !!(data && this.money >= data.tiers[0].cost);
    }

    placeTower(typeId, col, row) {
        const data = TOWER_DATA.find(t => t.id === typeId);
        if (!data) return false;
        const cost = data.tiers[0].cost;
        if (!this.testMode && this.money < cost) return false;
        if (!this.canPlaceTower(col, row)) return false;

        if (!this.testMode) this.money -= cost;
        const tower = new Tower(typeId, col, row);
        this.towers.push(tower);
        this.towerGrid[row][col] = tower;
        this.effects.addPlaceBounce(tower.x, tower.y);
        if (this.audio) this.audio.playPlace();
        return true;
    }

    sellTower(tower) {
        const refund = tower.getSellValue();
        this.money += refund;
        this.towerGrid[tower.row][tower.col] = null;
        this.towers = this.towers.filter(t => t !== tower);
        if (this.selectedTower === tower) this.selectedTower = null;
        this.effects.addFloatingText(tower.x, tower.y - 10, `+${refund}`, '#F1C40F');
        if (this.audio) this.audio.playSell();
    }

    upgradeTower(tower) {
        if (!tower.canUpgrade()) return false;
        const cost = tower.getUpgradeCost();
        if (!this.testMode && this.money < cost) return false;
        if (!this.testMode) this.money -= cost;
        tower.upgrade();
        this.effects.addFloatingText(tower.x, tower.y - 10, 'UP!', '#4CAF50', 16);
        if (this.audio) this.audio.playUpgrade();
        return true;
    }

    startWave() {
        if (this.phase !== 'prep') return;
        if (this.round >= this._roundData.length) return;

        const roundData = this._roundData[this.round];
        const queue = buildSpawnQueue(roundData);
        const pathProvider = () => this.mapCtx.getEnemyPath();
        this.spawner = new EnemySpawner(queue, roundData.spawnInterval, pathProvider);
        this.phase = 'wave';
        this.roundEaten = 0;
        this.roundEarned = 0;
        this.effects.addBanner(`Round ${this.round + 1}`);
        if (this.audio) this.audio.playWaveStart();
    }

    update(dt) {
        this.effects.update(dt);

        if (this.phase !== 'wave') return;

        if (this.spawner) {
            const newEnemy = this.spawner.update(dt);
            if (newEnemy) {
                this.enemies.push(newEnemy);
            }
        }

        for (const tower of this.towers) {
            tower.update(dt, this.enemies, this.towers, this.effects, this.audio);
        }

        for (const enemy of this.enemies) {
            enemy.update(dt);
        }

        const toRemove = [];
        for (const enemy of this.enemies) {
            if (!enemy.alive && !enemy.exited) {
                let reward = enemy.money;
                const killer = this._findKiller(enemy);
                if (killer) {
                    const sp = killer.stats.special;
                    if (sp && sp.type === 'bonusMoney') {
                        reward = Math.round(reward * (1 + sp.mult));
                    }
                }
                this.money += reward;
                this.totalEarned += reward;
                this.roundEarned += reward;
                this.totalEaten++;
                this.roundEaten++;
                this.effects.addFloatingText(enemy.x, enemy.y - 20, `+${reward}`, '#F1C40F');
                this.effects.addBurst(enemy.x, enemy.y, enemy.data.color);
                if (this.audio) this.audio.playPop();
                toRemove.push(enemy);
            } else if (enemy.exited) {
                this.life -= enemy.lifePenalty;
                if (this.life < 0) this.life = 0;
                this.effects.addWastePuff(enemy.x, enemy.y);
                this.effects.addFloatingText(enemy.x, enemy.y - 20, `-${enemy.lifePenalty} \u2665`, '#E74C3C', 16);
                if (this.audio) this.audio.playWaste();
                toRemove.push(enemy);

                if (this.life <= 0) {
                    this.gameOver = true;
                    this.phase = 'over';
                    if (this.audio) { this.audio.stopBGM(); this.audio.playGameOver(); }
                    return;
                }
            }
        }

        this.enemies = this.enemies.filter(e => !toRemove.includes(e));

        if (this.spawner && this.spawner.done && this.enemies.length === 0) {
            this._endRound();
        }
    }

    _findKiller(enemy) {
        let closest = null;
        let minDist = Infinity;
        for (const t of this.towers) {
            const d = Math.hypot(t.x - enemy.x, t.y - enemy.y);
            if (d < minDist) { minDist = d; closest = t; }
        }
        return closest;
    }

    _endRound() {
        const bonus = getRoundBonus(this.round + 1);
        this.money += bonus;
        this.totalEarned += bonus;
        this.round++;

        for (const tower of this.towers) {
            tower.attackAnimTimer = 0;
        }

        this.effects.addBanner(`Round Complete! +${bonus} bonus`);

        if (this.round >= this._roundData.length) {
            this.victory = true;
            this.phase = 'victory';
            if (this.audio) { this.audio.stopBGM(); this.audio.playVictory(); }
        } else {
            this.phase = 'prep';
            if (this.audio) this.audio.playRoundComplete();
        }
    }

    getWavePreview() {
        if (this.round >= this._roundData.length) return [];
        const rd = this._roundData[this.round];
        return rd.waves.map(w => {
            const ed = ENEMY_DATA.find(e => e.id === w.id);
            return { data: ed, count: w.count };
        });
    }

    getTowerAtCell(col, row) {
        if (row < 0 || row >= GRID_ROWS || col < 0 || col >= GRID_COLS) return null;
        return this.towerGrid[row][col];
    }
}
