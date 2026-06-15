// =============================================================
// 角色設定 — CHARACTERS / CHARACTERS_COMING_SOON
// 載入位置：config/organs.js 之後，systems/gameState.js 之前
// =============================================================

export const CHARACTERS = {
    koel: {
        id:          'koel',
        name:        '噪鵑',
        nameEn:      'The Koel',
        icon:        '🐦',
        color:       '#e83060',
        unlocked:    true,
        stats: {
            hp:           100,
            attack:       0,
            speed:        4.5,    // 已含 ×3.0 歷史倍率
            radius:       10,
            attackRange:  50,
            critChance:   0,
            critMult:     1.5,
            pickupRange:  0,
            attackSpeed:  1000,
        },
        startOrgans:    [],
        startEvolution: { type: 'herbivore', level: 1 },
        specialSkill:   'dash',   // F技：閃現
    },
    archerfish: {
        id:          'archerfish',
        name:        '阿奇爾',
        nameEn:      'Archerfish',
        icon:        '🐟',
        color:       '#4FC3F7',   // 神仙魚藍
        unlocked:    true,
        stats: {
            hp:           60,
            attack:       0,
            speed:        2.0,    // 陸地速度（水中自動+50%）
            radius:       10,
            attackRange:  120,    // 遠程射擊範圍
            critChance:   0,
            critMult:     1.25,
            pickupRange:  0,
            attackSpeed:  1500,
        },
        startOrgans:    [{ id: 'mouthOrgan', level: 3 }],
        startEvolution: { type: 'carnivore', level: 1 },
        specialSkill:   'archerfishDash',  // F技：衝刺（待實裝）
        isRanged:       true,              // 遠程攻擊標記（待實裝）
    },
};

// 即將推出的角色佔位
export const CHARACTERS_COMING_SOON = [
    { id: 'unknown1', name: '？', nameEn: '?', icon: '❓', locked: true },
];
