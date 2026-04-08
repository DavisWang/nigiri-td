/** @typedef {'en' | 'zh'} Locale */

const STORAGE_KEY = 'nigiri-td-locale';

/** @type {Locale} */
let locale = 'en';

function readStored() {
    try {
        if (typeof localStorage === 'undefined') return 'en';
        const v = localStorage.getItem(STORAGE_KEY);
        if (v === 'zh' || v === 'en') return v;
    } catch { /* ignore */ }
    return 'en';
}

locale = readStored();

function applyDocumentLang() {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = locale === 'zh' ? 'zh-Hans' : 'en';
    const titleEl = document.querySelector('title');
    if (titleEl) {
        titleEl.textContent = locale === 'zh'
            ? '寿司塔防 — Pwner Studios'
            : 'Nigiri TD — By Pwner Studios';
    }
}

applyDocumentLang();

/** @returns {Locale} */
export function getLocale() {
    return locale;
}

/** @param {Locale} l */
export function setLocale(l) {
    locale = l === 'zh' ? 'zh' : 'en';
    try {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, locale);
        }
    } catch { /* ignore */ }
    applyDocumentLang();
}

export function toggleLocale() {
    setLocale(locale === 'en' ? 'zh' : 'en');
}

/**
 * Append CJK-capable fallbacks for canvas text (macOS / Windows).
 * @param {string} cssFont
 */
export function uiFont(cssFont) {
    if (locale !== 'zh') return cssFont;
    return cssFont.replace(/\bsans-serif\s*$/i, "'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', sans-serif");
}

const STR = {
    en: {
        titleGame: 'Nigiri TD',
        titleTagline: 'Defend the Sushi Counter!',
        titleCredit: 'By Pwner Studios',
        btnNewGame: 'New Game',
        btnHowToPlay: 'How to Play',
        btnTestMode: 'Test Mode',
        btnBack: 'Back',
        howToTitle: 'How to Play',
        howToHeartsCash: 'hearts · cash',
        howToLine1: 'Sushi rolls toward the bin. Animals along the belt eat what they can.',
        howToLine2: 'Pick a map, difficulty, then place animals and start the wave.',
        howToPremise1: 'Small kaiten setup: belt runs toward the trash at the end.',
        howToPremise2: 'Put animals next to the belt—they eat plates as they roll past.',
        howToPremise3: 'Each wave is a little busier. See how far you get.',
        escToReturn: 'Esc to return',
        mapSelect: 'Select Map',
        mapSelectTest: 'Select Map (Test Mode)',
        mapSelectHint: 'Press {n} to quick select  |  Esc to go back',
        diffSelectTitle: 'Select Difficulty',
        diffSelectFooter: 'Press 1–3 to choose  ·  Esc for map list',
        incoming: 'Incoming:',
        towerShop: 'Tower Shop',
        round: 'Round',
        roundOf: '{cur} / {total}',
        roundInfinite: '{n} · ∞',
        /** Full line for infinite-mode round counter (sidebar). */
        roundSidebarInfinite: 'Round {n} · ∞',
        dmg: 'DMG',
        rng: 'RNG',
        spd: 'SPD',
        next: 'Next:',
        spdDelta: 'SPD {n}',
        fullyUpgraded: 'Fully upgraded',
        upgrade: 'Upgrade $' + '{cost}',
        max: 'MAX',
        sell: 'Sell $' + '{val}',
        selHints: '[U] Upgrade  [S] Sell  [Esc] Deselect',
        targetingLabel: 'Targeting',
        targetWeakest: 'Weakest first',
        targetFurthest: 'Furthest first',
        needFunds: 'Need $' + '{cost} to place (preview)',
        startWave: 'Start Wave',
        startWaveKey: 'Start Wave [Space]',
        slower: 'Slower',
        faster: 'Faster',
        pause: 'Pause',
        resume: 'Resume',
        pauseKey: 'Pause [P]',
        resumeKey: 'Resume [P]',
        minus: '-',
        plus: '+',
        victory10: 'All 10 rounds cleared!',
        victoryInfiniteBlurb: 'Infinite mode: enemies scale each round. There is no final wave.',
        victoryHowFar: 'How far can you go?',
        btnContinueInfinite: 'Continue · Infinite',
        btnEndVictory: 'End Run (Victory)',
        gameOver: 'Game Over',
        roundsSurvived: 'Rounds Survived: {n}',
        nigiriEaten: 'Nigiri Eaten: {n}',
        tryAgain: 'Try Again',
        victory: 'Victory!',
        totalEarned: 'Total Earned: $' + '{n}',
        lifeRemaining: 'Life Remaining: {n}',
        backToTitle: 'Back to Title',
        paused: 'Paused',
        pauseResumeHint: '[P] or Esc to resume',
        resumeBtn: 'Resume',
        upgradePopup: 'UP!',
        /** Single floating line: total payout includes Tanuki (etc.) bonus */
        killGoldWithBonus: '+{total} (+{extra} bonus)',
        bannerRound: 'Round {n}',
        bannerRoundInf: 'Round {n} · Infinite',
        bannerRoundComplete: 'Round Complete! +{bonus} bonus',
        specDoubleBite: '{pct}% double-bite',
        specBonusMoney: '+{mult}% kill money',
        specSlow: '{pct}% slow {dur}s',
        specPierce: 'Pierce ×{count}',
        specCrit: '{pct}% crit (×{mult} dmg)',
        specMulti: 'Hits {count} targets',
        specMultiSlow: ' + {pct}% slow',
        specAuraSpeed: '+{pct}% adj speed',
        specAuraDmg: ', +{pct}% adj dmg',
        specStun: '{pct}% stun {dur}s',
        specStunSplash: ' + splash',
        specAoe: 'AoE {r} tile',
        specAoeBurn: ' + burn {dps}/s',
    },
    zh: {
        titleGame: '寿司塔防',
        titleTagline: '守住寿司吧台！',
        titleCredit: 'Pwner Studios 出品',
        btnNewGame: '新游戏',
        btnHowToPlay: '游戏说明',
        btnTestMode: '测试模式',
        btnBack: '返回',
        howToTitle: '游戏说明',
        howToHeartsCash: '生命 · 金币',
        howToLine1: '寿司会朝垃圾桶方向移动，轨道旁的伙伴会尽力吃掉经过的盘子。',
        howToLine2: '选择地图与难度，放置伙伴，然后开始一波敌人。',
        howToPremise1: '小型回转台：传送带通向尽头的垃圾桶。',
        howToPremise2: '把伙伴放在传送带旁边，寿司经过时就会被吃掉。',
        howToPremise3: '每一波都会更忙一些，看你能撑多久。',
        escToReturn: 'Esc 返回',
        mapSelect: '选择地图',
        mapSelectTest: '选择地图（测试模式）',
        mapSelectHint: '按 1–{n} 快速选择  |  Esc 返回',
        diffSelectTitle: '选择难度',
        diffSelectFooter: '按 1–3 选择  ·  Esc 返回地图',
        incoming: '下一波：',
        towerShop: '伙伴商店',
        round: '回合',
        roundOf: '{cur} / {total}',
        roundInfinite: '{n} · ∞',
        roundSidebarInfinite: '第 {n} 回合 · ∞',
        dmg: '伤害',
        rng: '射程',
        spd: '攻速',
        next: '下一级：',
        spdDelta: '攻速 {n}',
        fullyUpgraded: '已满级',
        upgrade: '升级 $' + '{cost}',
        max: '满级',
        sell: '出售 $' + '{val}',
        selHints: '[U] 升级  [S] 出售  [Esc] 取消',
        targetingLabel: '攻击目标',
        targetWeakest: '血量最低优先',
        targetFurthest: '最靠前优先',
        needFunds: '需要 $' + '{cost} 才能放置（预览中）',
        startWave: '开始一波',
        startWaveKey: '开始一波 [空格]',
        slower: '减速',
        faster: '加速',
        pause: '暂停',
        resume: '继续',
        pauseKey: '暂停 [P]',
        resumeKey: '继续 [P]',
        minus: '-',
        plus: '+',
        victory10: '10 回合全部通关！',
        victoryInfiniteBlurb: '无尽模式：每回合敌人都会变强，没有最终波次。',
        victoryHowFar: '你能走多远？',
        btnContinueInfinite: '继续 · 无尽模式',
        btnEndVictory: '结束（胜利）',
        gameOver: '游戏结束',
        roundsSurvived: '存活回合：{n}',
        nigiriEaten: '吃掉的寿司：{n}',
        tryAgain: '再试一次',
        victory: '胜利！',
        totalEarned: '累计获得：$' + '{n}',
        lifeRemaining: '剩余生命：{n}',
        backToTitle: '返回标题',
        paused: '已暂停',
        pauseResumeHint: '[P] 或 Esc 继续',
        resumeBtn: '继续',
        upgradePopup: '升！',
        killGoldWithBonus: '+{total}（+{extra} 加成）',
        bannerRound: '第 {n} 回合',
        bannerRoundInf: '第 {n} 回合 · 无尽',
        bannerRoundComplete: '回合完成！+{bonus} 奖励',
        specDoubleBite: '{pct}% 二连击',
        specBonusMoney: '击杀金币 +{mult}%',
        specSlow: '{pct}% 减速 {dur} 秒',
        specPierce: '穿透 ×{count}',
        specCrit: '{pct}% 暴击（×{mult} 伤害）',
        specMulti: '同时命中 {count} 个目标',
        specMultiSlow: ' + {pct}% 减速',
        specAuraSpeed: '相邻攻速 +{pct}%',
        specAuraDmg: '，相邻伤害 +{pct}%',
        specStun: '{pct}% 眩晕 {dur} 秒',
        specStunSplash: ' + 溅射',
        specAoe: '范围 {r} 格',
        specAoeBurn: ' + 灼烧 {dps}/秒',
    },
};

/** @type {Record<string, { name: string, desc: string }>} */
const TOWERS = {
    en: {
        cat: { name: 'Cat', desc: 'Quick and cheap. Great early-game pick.' },
        tanuki: { name: 'Tanuki', desc: 'Earns bonus money from every kill.' },
        penguin: { name: 'Penguin', desc: 'Slows enemies with each icy attack.' },
        fox: { name: 'Fox', desc: 'Long-range precision. Pierces at tier 3.' },
        monkey: { name: 'Monkey', desc: 'Ranged hurler. Gains slow at tier 3.' },
        owl: { name: 'Owl', desc: 'Extreme range. Gains crits at tier 3.' },
        octopus: { name: 'Octopus', desc: 'Hits multiple targets simultaneously.' },
        shiba: { name: 'Shiba Inu', desc: 'Buffs adjacent towers’ attack speed.' },
        bear: { name: 'Bear', desc: 'Massive damage with a chance to stun.' },
        dragon: { name: 'Dragon', desc: 'Area damage. Burns everything nearby.' },
    },
    zh: {
        cat: { name: '猫', desc: '攻速快、花费低，开局好选择。' },
        tanuki: { name: '狸猫', desc: '每次击杀额外获得金币。' },
        penguin: { name: '企鹅', desc: '冰霜攻击附带减速。' },
        fox: { name: '狐狸', desc: '远程精准，三级获得穿透。' },
        monkey: { name: '猴子', desc: '远程投掷，三级附带减速。' },
        owl: { name: '猫头鹰', desc: '极远射程，三级获得暴击。' },
        octopus: { name: '章鱼', desc: '同时攻击多个目标。' },
        shiba: { name: '柴犬', desc: '提升相邻塔的攻速。' },
        bear: { name: '熊', desc: '高伤害，有几率眩晕敌人。' },
        dragon: { name: '龙', desc: '范围伤害，并灼烧周围敌人。' },
    },
};

/** @type {Record<string, string>} */
const MAPS = {
    en: {
        kaiten: 'Kaiten Corner',
        fork: 'The Fork',
        spiral: 'The Spiral',
        cross: 'The Crossroads',
        runway: 'The Runway',
        perimeter: 'The Perimeter',
    },
    zh: {
        kaiten: '回转角落',
        fork: '分叉路口',
        spiral: '螺旋路径',
        cross: '十字路口',
        runway: '直线跑道',
        perimeter: '外环',
    },
};

/** @type {Record<string, { label: string, hint: string }>} */
const DIFF = {
    en: {
        easy: { label: 'Easy', hint: 'Baseline HP & spawn timing' },
        intermediate: { label: 'Intermediate', hint: '+25% enemy HP' },
        hard: { label: 'Hard', hint: '+25% HP · 10% faster spawns' },
    },
    zh: {
        easy: { label: '简单', hint: '标准血量与出怪节奏' },
        intermediate: { label: '进阶', hint: '敌人生命 +25%' },
        hard: { label: '困难', hint: '生命 +25% · 出怪加快 10%' },
    },
};

/**
 * @param {string} key
 * @param {Record<string, string | number>} [params]
 */
export function t(key, params = {}) {
    const table = STR[locale] || STR.en;
    let s = table[key] ?? STR.en[key] ?? key;
    for (const [k, v] of Object.entries(params)) {
        s = s.split(`{${k}}`).join(String(v));
    }
    return s;
}

/** @param {string} towerId */
export function towerName(towerId) {
    const pack = TOWERS[locale] || TOWERS.en;
    return pack[towerId]?.name ?? TOWERS.en[towerId]?.name ?? towerId;
}

/** @param {string} towerId */
export function towerDesc(towerId) {
    const pack = TOWERS[locale] || TOWERS.en;
    return pack[towerId]?.desc ?? TOWERS.en[towerId]?.desc ?? '';
}

/** @param {string} mapId */
export function mapName(mapId) {
    const pack = MAPS[locale] || MAPS.en;
    return pack[mapId] ?? MAPS.en[mapId] ?? mapId;
}

/** @param {string} diffId */
export function difficultyLabel(diffId) {
    const pack = DIFF[locale] || DIFF.en;
    return pack[diffId]?.label ?? DIFF.en[diffId]?.label ?? diffId;
}

/** @param {string} diffId */
export function difficultyHint(diffId) {
    const pack = DIFF[locale] || DIFF.en;
    return pack[diffId]?.hint ?? DIFF.en[diffId]?.hint ?? '';
}

/** Canvas width for layout (matches data.js CANVAS_WIDTH). */
const CANVAS_W = 960;

const TITLE_LANG_BTN = { marginR: 14, marginT: 12, w: 56, h: 34 };

export function getTitleLangButtonRect() {
    return {
        x: CANVAS_W - TITLE_LANG_BTN.w - TITLE_LANG_BTN.marginR,
        y: TITLE_LANG_BTN.marginT,
        w: TITLE_LANG_BTN.w,
        h: TITLE_LANG_BTN.h,
    };
}

export function renderTitleLangButton(ctx, mouseX, mouseY) {
    const r = getTitleLangButtonRect();
    const hover = mouseX >= r.x && mouseX <= r.x + r.w && mouseY >= r.y && mouseY <= r.y + r.h;
    ctx.fillStyle = hover ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.88)';
    ctx.strokeStyle = hover ? '#E74C3C' : '#CCC';
    ctx.lineWidth = hover ? 2 : 1;
    ctx.beginPath();
    ctx.roundRect(r.x, r.y, r.w, r.h, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#333';
    ctx.font = uiFont(`bold 14px 'Arial Rounded MT Bold', sans-serif`);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const label = locale === 'en' ? '中文' : 'EN';
    ctx.fillText(label, r.x + r.w / 2, r.y + r.h / 2 + 1);
    ctx.textAlign = 'left';
}

export function hitTitleLangButton(px, py) {
    const r = getTitleLangButtonRect();
    return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

/** @param {object | null | undefined} special */
export function formatSpecialLocalized(special) {
    if (!special) return null;
    const pct = (x) => Math.round(x * 100);
    switch (special.type) {
        case 'doubleBite':
            return t('specDoubleBite', { pct: pct(special.chance) });
        case 'bonusMoney':
            return t('specBonusMoney', { mult: pct(special.mult) });
        case 'slow':
            return t('specSlow', { pct: pct(special.pct), dur: special.dur / 1000 });
        case 'pierce':
            return t('specPierce', { count: special.count });
        case 'crit':
            return t('specCrit', { pct: pct(special.chance), mult: special.mult });
        case 'multiTarget': {
            let out = t('specMulti', { count: special.count });
            if (special.slow) out += t('specMultiSlow', { pct: pct(special.slow.pct) });
            return out;
        }
        case 'aura': {
            let out = t('specAuraSpeed', { pct: pct(special.speedBuff) });
            if (special.damageBuff) out += t('specAuraDmg', { pct: pct(special.damageBuff) });
            return out;
        }
        case 'stun': {
            let out = t('specStun', { pct: pct(special.chance), dur: special.dur / 1000 });
            if (special.splash) out += t('specStunSplash');
            return out;
        }
        case 'aoe': {
            let out = t('specAoe', { r: special.radius });
            if (special.burn) out += t('specAoeBurn', { dps: special.burn.dps });
            return out;
        }
        default:
            return null;
    }
}
