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
        specialSkillConfig: {
            dashDistMultiplier: 50,
            dashDistMax:        500,
            dashCD:             15000,
            dashInvincible:     500,
            dashEffectDuration: 150,
        },
        sfx: {
            hurt:          'hurt',
            attackNormal:  'attackNormal',
            attackCrit:    'attackCrit',
        },
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
        specialSkill:   'archerfishDash',  // F技：衝刺
        isRanged:       true,              // 遠程攻擊標記
        specialSkillConfig: {
            dashSpeedAdd:         { water: 5, land: 3 },
            dashDuration:         3000,
            dashCD:               15000,
            dashStunDuration:     500,
            chargeMax:            3,
            chargeInterval:       1000,
            chargeConsumeInterval:500,
        },
        projectile: {
            radius:           5,
            rangeMultiplier:  1.2,
            minShootDistance: 5,
        },
        waterSpeedMultiplier: 1.5,
        sfx: {
            hurt:          'archerHurt',
            attackNormal:  'archerAttackNormal',
            attackCrit:    'archerAttackCrit',
        },
    },
};

// 即將推出的角色佔位
export const CHARACTERS_COMING_SOON = [
    { id: 'unknown1', name: '？', nameEn: '?', icon: '❓', locked: true },
];
