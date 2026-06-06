// =============================================================
// 普通難度地圖配置
// =============================================================

export const NORMAL_MAP = {
    name:   '普通',
    nameEn: 'Normal',

    terrain: {
        noiseScale:          0.003,
        forestCenterRadius:  400,   // 簡單地圖是 600，普通縮小至 400
        forestThreshold:     0.2,
        oceanThreshold:     -0.2,
        minBiomeTiles:       250,
        requiredBiomes:      ['forest', 'ocean', 'desert'],
    },

    // 生物強度倍率（全部 ×1.5）
    creatureStrength: {
        neutral: { hpMultiplier: 1.5, speedMultiplier: 1.5, damageMultiplier: 1.5 },
        hostile: { hpMultiplier: 1.5, speedMultiplier: 1.5, damageMultiplier: 1.5 },
    },

    // 普通地圖移除速度和傷害上限 cap
    removeHostileCap: true,

    // aggroRange 全局提升（400 = 約2.5倍輕鬆模式的150，保持挑戰性但不至於全圖鎖定）
    aggroRangeOverride: 400,

    elites: [
        { night: 1, hpMultiplier:   5, speedBonus: 0.3, damageMultiplier: 1.5 },
        { night: 2, hpMultiplier:  10, speedBonus: 0.7, damageMultiplier: 2.1 },
        { night: 3, hpMultiplier:  20, speedBonus: 1.5, damageMultiplier: 2.9 },
    ],

    bosses: [
        { biome: 'forest', name: '🌿 黑熊',     hp: 1500, speed: 9.0,  damage: 30, radius: 33, attackRange: 40 },
        { biome: 'ocean',  name: '🌊 大白鯊',   hp: 1800, speed: 11.7, damage: 36, radius: 40, attackRange: 47 },
        { biome: 'desert', name: '🏜️ 沙漠蠍王', hp: 1650, speed: 10.8, damage: 40, radius: 37, attackRange: 43 },
    ],

    // 普通地圖專屬系統開關
    features: {
        giantization:   true,   // 巨人化系統（Phase 3）
        killer:         true,   // 殺手化系統（Phase 4）
        eliteRegen:     true,   // 精英回血（Phase 4）
        bossRegen:      true,   // Boss 回血（Phase 4）
        hostileEatMeat: true,   // 肉系吃屍體成長（Phase 4）
        hardElites:     false,  // 三隼不啟用
        dogElites:      true,   // 啟用三犬
        hunterBoss:     false,
    },

    creatureAbilities: {
        neutral: [],
        hostile: [],
    },
};
