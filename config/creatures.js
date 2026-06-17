// =============================================================
// 生物數值設定 - CREATURE_CONFIG / ELITE_CONFIG / BOSS_CONFIG
// ✦ 名稱與標籤為中文預設；切換語言時由 lang.js applyLanguage() 覆寫
// =============================================================

export const CREATURE_CONFIG = {
    hostile: {
        maxSpeed:  7.5,
        maxDamage: 20,
    },
    spawnInterval: {
        neutral: 30000,
        hostile: 45000,
    }
};

export const CREATURE_AI_CONFIG = {
    separation: {
        herbivoreMinDistRatio: 0.5,
        hostileMinDistRatio: 1.0,
        mixedMinDistRatio: 0.75,
        hyenaMinDistRatio: 1.1,
        giantMinDistRatio: 1.05,
        pushStrength: 1.4,
        giantPushStrength: 2.0,
    },
    meleeAttack: {
        default: { windupMs: 150, activeMs: 100, recoveryMs: 1150 },
        hyena: { windupMs: 100, activeMs: 100, recoveryMs: 1300 },
        giant: { windupMs: 350, activeMs: 150, recoveryMs: 1000 },
        alpha: { windupMs: 200, activeMs: 150, recoveryMs: 1150 },
        herbivore: { windupMs: 300, activeMs: 200, recoveryMs: 1000 },
        aggressive: { windupMs: 150, activeMs: 100, recoveryMs: 1150 },
        eliteDog: {
            specterDog: { windupMs: 180, activeMs: 100, recoveryMs: 920 },
            shadowDog: { windupMs: 120, activeMs: 90, recoveryMs: 690 },
            venomDog: { windupMs: 260, activeMs: 120, recoveryMs: 1120 },
        },
        cooldownMs: 1000,
        rangeBuffer: 8,
        windupMoveMult: 0.8,
        hitGraceBuffer: 10,
        strikeFlashMs: 90,
    },
    hyena: {
        packMergeRange: 300,
        packKeepRange: 800,
        packLeaveGraceMs: 3000,
        packLimit: 20,
        attackTurnCooldownMs: 600,
        surroundMinSize: 4,
        lowHpRatio: 0.3,
        probeOrbit: 85,
        surroundOrbit: 95,
        surroundArcDeg: 240,
    },
    alpha: {
        regroupCheckMs: 1000,
        regroupHpRatio: 0.35,
        regroupRange: 1200,
        regroupMoveMult: 0.75,
    },
};

export const ELITE_CONFIG = {
    base: { hp: 50, speed: 1.0, damage: 8, poisonResist: 0.2 },
    nights: [
        { hpMult: 5,   speed: 3.9, damage: 12, xp: 150, label: '★精英',   color: '#5B0EA6' },
        { hpMult: 7.5, speed: 4.5, damage: 15, xp: 225, label: '★★精英',  color: '#8B0000' },
        { hpMult: 10,  speed: 5.1, damage: 18, xp: 300, label: '★★★精英', color: '#1A0A00' }
    ]
};

// =============================================================
// 生態生物種類（v0.36.0）
// 每個生態區各有一種草系（herbivore）和一種肉系（carnivore）
// =============================================================
export const BIOME_CREATURES = {
    forest: {
        herbivore: { id: 'moose',  name: '🌿 駝鹿',     nameEn: '🌿 Moose'         },
        carnivore: { id: 'lynx',   name: '🌿 猞猁',     nameEn: '🌿 Lynx'          },
    },
    ocean: {
        herbivore: { id: 'beetle', name: '🌊 巨型甲虫', nameEn: '🌊 Giant Beetle'  },
        carnivore: { id: 'croc',   name: '🌊 鱷魚',     nameEn: '🌊 Crocodile'     },
    },
    desert: {
        herbivore: { id: 'camel',  name: '🏜️ 駱駝',    nameEn: '🏜️ Camel'         },
        carnivore: { id: 'hyena',  name: '🏜️ 鬣狗',    nameEn: '🏜️ Hyena'         },
    },
};

export const BOSS_CONFIG = {
    forest: {
        name: '🌿 黑熊',    label: '⚠️🌿黑熊',
        radius: 25, hp: 500,  speed: 3.0, damage: 15, aggroRange: 99999, attackRange: 30,
        color: '#3B1E08', colorChasing: '#2A0D00', glowColor: '#8B4513',
        spawnX: null, spawnY: null,
        poisonResist: 0.3
    },
    ocean: {
        name: '🌊 大白鯊',  label: '🦈🌊大白鯊',
        radius: 30, hp: 600,  speed: 3.9, damage: 18, aggroRange: 99999, attackRange: 35,
        color: '#003388', colorChasing: '#001A44', glowColor: '#1a3a5c',
        spawnX: 6500, spawnY: 6500,
        poisonResist: 0.3
    },
    desert: {
        name: '🏜️ 沙漠蠍王', label: '🦂🏜️蠍王',
        radius: 28, hp: 550,  speed: 3.6, damage: 20, aggroRange: 99999, attackRange: 32,
        color: '#8B7355', colorChasing: '#5C4A2A', glowColor: '#8B6914',
        spawnX: 2000, spawnY: 2000,
        poisonResist: 0.5
    },
    hunter: {
        name: '🎯 黑色獵人', label: '🎯 黑色獵人',
        radius: 22,
        aggroRange: 8000,
        attackRange: 1500,
        color: '#212121', colorChasing: '#212121', glowColor: '#1565C0',
        spawnX: null, spawnY: null,
        poisonResist: 0.5,
        // 5 管血條制
        maxHpPerBar: 800,
        totalBars: 5,
        // 各形態速度
        phase1Speed: 4.0,
        phase2Speed: 7.0,
        phase3Speed: 9.0,
        // 攻擊數值
        sniperDamage: 45,
        shotgunDamage: 15,
        // 攻擊間隔
        phase1AttackInterval: 3500,
        phase2AttackInterval: 2000,
        phase3AttackInterval: 2000,
        // 開槍後停頓
        postShotPause: 300,
        // 蓄力時間
        phase1AimDuration: 300,
        phase2PumpDuration: 400,
        phase3AimDuration: 500,
    }
};

// ── Boss 血條顏色常數（hunter 多管血條，其他 biome 預留預設紅色）
export const BOSS_BAR_COLORS = {
    hunter: { 5: '#4FC3F7', 4: '#1976D2', 3: '#FF9800', 2: '#E64A19', 1: '#FF1744' },
};
export const BOSS_BAR_NEXT_COLORS = {
    hunter: { 5: '#1976D2', 4: '#FF9800', 3: '#E64A19', 2: '#FF1744', 1: null },
};

// ── 巨人 / Alpha 系統數值 ──
export const GIANT_CONFIG = {
    xp: { base: 100, alpha: 300 },
    loot: {
        giant: [
            { type: 'corpse', data: { multiplier: 2 } },
            { type: 'bone',   data: {} },
        ],
        alpha: [
            { type: 'corpse', data: { multiplier: 2 } },
            { type: 'corpse', data: { multiplier: 2 } },
            { type: 'bone',   data: {} },
            { type: 'bone',   data: {} },
            { type: 'bone',   data: {} },
        ],
    },
    mutation: {
        normal: { giant: 1, alpha: 2 },
        hard:   { giant: 3, alpha: 5 },
    },
    alphaBonus: { chance: 0.2, min: 2, range: 5 },
};

// ── 殺手化系統數值 ──
export const KILLER_CONFIG = {
    xp: { base: 100, perLevel: 5 },
    loot: [
        { type: 'corpse', data: { multiplier: 1 } },
        { type: 'corpse', data: { multiplier: 1 } },
    ],
    mutation: { normal: 1, hard: 2 },
    extraMutation: { chanceDivisor: 100, min: 1 },
};
