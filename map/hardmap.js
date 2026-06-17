// =============================================================
// 困難難度地圖配置 — 靜音獵隊更新
// =============================================================

export const HARD_MAP = {
    name:       '困難',
    nameEn:     'Hard',
    difficulty: 'hard',

    terrain: {
        noiseScale:          0.003,
        forestCenterRadius:  300,
        forestThreshold:     0.2,
        oceanThreshold:     -0.2,
        minBiomeTiles:       250,
        requiredBiomes:      ['forest', 'ocean', 'desert'],
    },

    creatureStrength: {
        neutral: { hpMultiplier: 2.5, speedMultiplier: 2.0, damageMultiplier: 2.5 },
        hostile: { hpMultiplier: 2.5, speedMultiplier: 2.0, damageMultiplier: 2.5 },
    },

    removeHostileCap: true,
    aggroRangeOverride: 600,

    elites: [
        { night: 1, hpMultiplier:  7, speedBonus: 0.5, damageMultiplier: 2.0 },
        { night: 2, hpMultiplier: 14, speedBonus: 1.0, damageMultiplier: 3.0 },
        { night: 3, hpMultiplier: 21, speedBonus: 2.0, damageMultiplier: 4.0 },
    ],

    bosses: [
        { biome: 'forest', name: '🌿 黑熊',     hp: 3750, speed: 11.7, damage:  75, radius: 33, attackRange: 40 },
        { biome: 'ocean',  name: '🌊 大白鯊',   hp: 4500, speed: 15.2, damage:  90, radius: 40, attackRange: 47 },
        { biome: 'desert', name: '🏜️ 沙漠蠍王', hp: 4125, speed: 14.0, damage: 100, radius: 37, attackRange: 43 },
        { biome: 'hunter', name: '🎯 黑色獵人', hp: 800, speed: 4.0, damage: 45, radius: 22, attackRange: 1500 },
    ],

    features: {
        giantization:   true,
        killer:         true,
        eliteRegen:     false,
        bossRegen:      false,
        hostileEatMeat: true,
        hardElites:     true,
        hunterBoss:     true,
        dogElites:      false,
    },

    creatureAbilities: {
        neutral: [],
        hostile: [],
    },
};
