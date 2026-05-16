// =============================================================
// 簡單難度地圖配置
// =============================================================

const EASY_MAP = {
    name:   '簡單',
    nameEn: 'Easy',

    // Noise 地形參數
    terrain: {
        noiseScale:          0.003,
        forestCenterRadius:  600,  // 中心森林保護區半徑（px）
        forestThreshold:     0.2,
        oceanThreshold:     -0.2,
        minBiomeTiles:       250,
        requiredBiomes:      ['forest', 'ocean', 'desert'],
    },

    // 生物強度倍率
    creatureStrength: {
        neutral: { hpMultiplier: 1.0, speedMultiplier: 1.0, damageMultiplier: 1.0 },
        hostile: { hpMultiplier: 1.0, speedMultiplier: 1.0, damageMultiplier: 1.0 },
    },

    // 精英怪配置（每個夜晚）
    elites: [
        { night: 1, hpMultiplier:   5, speedBonus: 0.3, damageMultiplier: 1.5 },
        { night: 2, hpMultiplier: 7.5, speedBonus: 0.5, damageMultiplier: 1.8 },
        { night: 3, hpMultiplier:  10, speedBonus: 0.7, damageMultiplier: 2.0 },
    ],

    // Boss 配置（待定，先預留結構）
    bosses: [
        { biome: 'forest', name: '黑熊',   hp: 500, speed: 1.0, damage: 15 },
        { biome: 'ocean',  name: '大白鯊', hp: 600, speed: 1.3, damage: 18 },
        { biome: 'desert', name: '沙漠蠍王', hp: 550, speed: 1.2, damage: 20 },
    ],

    // 生物技能（預留，之後填入）
    creatureAbilities: {
        neutral: [],
        hostile: [],
    },
};
