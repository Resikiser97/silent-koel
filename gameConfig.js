// =============================================================
// 遊戲配置文件 - 手動修改數值請改這裡
// =============================================================

// 生物基礎設定
const CREATURE_CONFIG = {
    hostile: {
        maxSpeed:  2.5,  // 敵意生物速度上限
        maxDamage: 20,   // 敵意生物傷害上限
    },
    spawnInterval: {
        neutral: 30000,  // 中立生物補充間隔（毫秒）
        hostile: 45000,  // 敵意生物補充間隔（毫秒）
    }
};

// =============================================================
// 器官資料定義（含升級，每級效果為增量）
// =============================================================
const ORGANS = {
    // ── 攻擊類
    crabClaw: {
        id: 'crabClaw', name: '蟹鉗', type: 'attack', maxLevel: 3,
        levels: [
            { desc: '攻擊+8，15%流血（每秒1傷，3秒）',
              effects: { attackAdd: 8, bleedChance: 0.15, bleedDmg: 1, bleedDur: 3000 } },
            { desc: '攻擊+2，流血+5%，每秒傷+1，持續+1秒',
              effects: { attackAdd: 2, bleedChance: 0.05, bleedDmg: 1, bleedDur: 1000 } },
            { desc: '攻擊+3，流血+10%，每秒傷+1，持續+1秒',
              effects: { attackAdd: 3, bleedChance: 0.10, bleedDmg: 1, bleedDur: 1000 } }
        ]
    },
    boxingGloves: {
        id: 'boxingGloves', name: '搏擊拳套', type: 'attack', maxLevel: 3,
        levels: [
            { desc: '攻擊+5，攻速+30%',
              effects: { attackAdd: 5, attackSpeedMult: 1.3 } },
            { desc: '攻擊+2，攻速+5%',
              effects: { attackAdd: 2, attackSpeedMult: 1.05 } },
            { desc: '攻擊+3，攻速+5%',
              effects: { attackAdd: 3, attackSpeedMult: 1.05 } }
        ]
    },
    poisonStinger: {
        id: 'poisonStinger', name: '毒刺', type: 'attack', maxLevel: 3,
        levels: [
            { desc: '攻擊+1，攻擊時附加中毒每秒2傷持續5秒',
              effects: { attackAdd: 1, poisonDmg: 2, poisonDur: 5000 } },
            { desc: '每秒傷+1，持續+1秒',
              effects: { poisonDmg: 1, poisonDur: 1000 } },
            { desc: '每秒傷+2，持續+1秒',
              effects: { poisonDmg: 2, poisonDur: 1000 } }
        ]
    },
    fang: {
        id: 'fang', name: '獠牙', type: 'attack', maxLevel: 3,
        levels: [
            { desc: '攻擊+12，15%暈眩敵人1秒',
              effects: { attackAdd: 12, stunChance: 0.15, stunDur: 1000 } },
            { desc: '攻擊+2，暈眩+2%',
              effects: { attackAdd: 2, stunChance: 0.02 } },
            { desc: '攻擊+3，暈眩+3%',
              effects: { attackAdd: 3, stunChance: 0.03 } }
        ]
    },

    // ── 防禦類
    longLegs: {
        id: 'longLegs', name: '大長腿', type: 'defense', maxLevel: 3,
        levels: [
            { desc: '移動速度+0.5', effects: { speedAdd: 0.5 } },
            { desc: '移動速度+0.5', effects: { speedAdd: 0.5 } },
            { desc: '移動速度+0.5', effects: { speedAdd: 0.5 } }
        ]
    },
    turtleShell: {
        id: 'turtleShell', name: '龜殼', type: 'defense', maxLevel: 3,
        levels: [
            { desc: '受傷-30%，速度-0.2',
              effects: { damageReductionAdd: 0.30, speedAdd: -0.2 } },
            { desc: '受傷額外-3%，速度回復+0.1',
              effects: { damageReductionAdd: 0.03, speedAdd: 0.1 } },
            { desc: '受傷額外-7%，速度回復+0.1',
              effects: { damageReductionAdd: 0.07, speedAdd: 0.1 } }
        ]
    },
    thickSkin: {
        id: 'thickSkin', name: '厚皮', type: 'defense', maxLevel: 3,
        levels: [
            { desc: 'HP上限+50，當前HP+50',
              effects: { hpMaxAdd: 50 } },
            { desc: 'HP上限+50，體型+20%（半徑和攻擊範圍+10%）',
              effects: { hpMaxAdd: 50, radiusAdd: 1 } },
            { desc: 'HP上限+50，體型再+20%',
              effects: { hpMaxAdd: 50, radiusAdd: 1 } }
        ]
    },
    thornArmor: {
        id: 'thornArmor', name: '刺甲', type: 'defense', maxLevel: 3,
        levels: [
            { desc: '被攻擊時反傷10%',
              effects: { thornDamageAdd: 0.10 } },
            { desc: '反傷+5%',
              effects: { thornDamageAdd: 0.05 } },
            { desc: '反傷+5%，額外反彈玩家攻擊力5%的傷害',
              effects: { thornDamageAdd: 0.05, thornPlayerAtkReflect: true } }
        ]
    },

    // ── 靈力類
    brain: {
        id: 'brain', name: '大腦', type: 'spirit', maxLevel: 3,
        levels: [
            { desc: '每5秒100px範圍8傷，拾取範圍+10px',
              effects: { brainActivate: true, pickupRangeAdd: 10 } },
            { desc: '觸發-1秒，範圍+20px，傷害+4，拾取+15px',
              effects: { brainIntervalDelta: -1000, brainRangeDelta: 20, brainDmgDelta: 4, pickupRangeAdd: 15 } },
            { desc: '觸發-1秒，範圍+30px，傷害+8，拾取+15px',
              effects: { brainIntervalDelta: -1000, brainRangeDelta: 30, brainDmgDelta: 8, pickupRangeAdd: 15 } }
        ]
    },
    trueEye: {
        id: 'trueEye', name: '真視之眼', type: 'spirit', maxLevel: 3,
        levels: [
            { desc: '暴擊率+10%，暴擊傷害x1.5',
              effects: { critChanceAdd: 0.10, critMultiplierAdd: 0.5 } },
            { desc: '暴擊率+5%，暴擊傷害+0.25',
              effects: { critChanceAdd: 0.05, critMultiplierAdd: 0.25 } },
            { desc: '暴擊率+10%，暴擊傷害+0.25',
              effects: { critChanceAdd: 0.10, critMultiplierAdd: 0.25 } }
        ]
    },
    sharpSense: {
        id: 'sharpSense', name: '靈敏知覺', type: 'spirit', maxLevel: 3,
        levels: [
            { desc: '敵意生物偵測範圍-30px',
              effects: { aggroRangeReductionAdd: 30 } },
            { desc: '偵測範圍再-20px',
              effects: { aggroRangeReductionAdd: 20 } },
            { desc: '偵測範圍再-20px',
              effects: { aggroRangeReductionAdd: 20 } }
        ]
    },
    naturalRegen: {
        id: 'naturalRegen', name: '超自然回復', type: 'spirit', maxLevel: 3,
        levels: [
            { desc: '每10秒回復1HP',
              effects: { regenHpAdd: 1, regenIntervalDelta: 0 } },
            { desc: '間隔-2秒，回復+1HP',
              effects: { regenHpAdd: 1, regenIntervalDelta: -2000 } },
            { desc: '間隔-3秒，回復+1HP',
              effects: { regenHpAdd: 1, regenIntervalDelta: -3000 } }
        ]
    }
};

// =============================================================
// 組合效果定義
// =============================================================
const COMBOS = [
    { ids: ['crabClaw',   'poisonStinger'], key: 'comboCrabPoison', desc: '流血同時附加劇毒（毒傷x2）' },
    { ids: ['turtleShell','thornArmor'],    key: 'comboShellArmor', desc: '格擋時反傷翻倍' },
    { ids: ['brain',      'trueEye'],       key: 'comboBrainEye',   desc: '念力波有機率觸發暴擊傷害' },
    { ids: ['thickSkin',  'naturalRegen'],  key: 'comboSkinRegen',  desc: '回復量+1HP，回復間隔再-1秒' },
    { ids: ['trueEye',    'fang'],          key: 'comboEyeFang',    desc: '暴擊時附加暈眩效果' }
];

// =============================================================
// 技能資料定義
// =============================================================
const SKILLS = {
    vitality:            { id: 'vitality',            name: '強壯體魄', maxLevel: 3, desc: '起始 HP +20（每級）' },
    agility:             { id: 'agility',             name: '敏捷身手', maxLevel: 3, desc: '起始速度 +0.2（每級）' },
    forager:             { id: 'forager',             name: '採集專家', maxLevel: 3, desc: '果子 XP +3（每級）' },
    hunter:              { id: 'hunter',              name: '獵人本能', maxLevel: 3, desc: '擊殺 XP +10（每級）' },
    tenacity:            { id: 'tenacity',            name: '頑強意志', maxLevel: 3, desc: '死亡時 HP 保留 10%（每級，每局一次）' },
    organMemory:         { id: 'organMemory',         name: '記憶器官', maxLevel: 3, desc: '死亡保留器官數 +1（預設1個，最多3個）' },
    luckyReroll:         { id: 'luckyReroll',         name: '幸運重選', maxLevel: 3, desc: '器官選擇時可重新隨機（每級1次）' },
    collectionAddiction: { id: 'collectionAddiction', name: '收集成癮', maxLevel: 3, desc: '收集範圍+10px（果子和屍體，每級）' },
    terribleFang:        { id: 'terribleFang',        name: '恐怖之牙', maxLevel: 5, desc: '攻擊+2（每級）；Lv5開局獲得獠牙Lv1' }
};

// =============================================================
// 隱藏器官資料定義（只能透過擊敗精英怪獲得，不可升級，不佔普通槽位）
// =============================================================
const HIDDEN_ORGANS = {
    strongHeart: {
        id: 'strongHeart', name: '強大的心臟', type: 'hidden',
        desc: '移速+0.2，攻擊+5，HP上限+100，體型+20%，攻擊範圍+10%',
        effects: { speedAdd: 0.2, attackAdd: 5, hpMaxAdd: 100, radiusAdd: 2, attackRangeAdd: 5 }
    },
    strongLegs: {
        id: 'strongLegs', name: '強大的大腿', type: 'hidden',
        desc: '移速+1，體型+20%',
        effects: { speedAdd: 1, radiusAdd: 2 }
    },
    strongArms: {
        id: 'strongArms', name: '強大的手臂', type: 'hidden',
        desc: '收集範圍+15px，攻擊範圍+10%，體型+20%',
        effects: { pickupRangeAdd: 15, attackRangeAdd: 5, radiusAdd: 2 }
    }
};

// =============================================================
// 進化路線資料定義（hpBonus/attackBonus/speedBonus 為各級增量；
//   fruitXPBonus/corpseXPBonus/eatXP 為各等級的最終數值）
// =============================================================
const EVOLUTION_PATHS = {
    herbivore: {
        id: 'herbivore', name: '草食性', icon: '🌿', maxLevel: 3,
        levels: [
            { level: 1, hpBonus: 30, fruitXPBonus: 0, desc: '可吃果子，HP上限+30' },
            { level: 2, hpBonus: 40, fruitXPBonus: 2, desc: '100px內中立生物不逃跑，HP+40，果子XP+2' },
            { level: 3, hpBonus: 50, fruitXPBonus: 3, desc: '150px內中立生物完全友善，HP+50，果子XP+3' }
        ]
    },
    carnivore: {
        id: 'carnivore', name: '肉食性', icon: '🥩', maxLevel: 3,
        levels: [
            { level: 1, attackBonus: 5, eatXP: 20, eatTime: 3000, desc: '可吃屍體（20XP，3秒），攻擊+5' },
            { level: 2, attackBonus: 5, eatXP: 35, eatTime: 2500, desc: '屍體35XP，2.5秒，攻擊+5' },
            { level: 3, attackBonus: 5, eatXP: 50, eatTime: 2000, desc: '屍體50XP，2秒，攻擊+5' }
        ]
    },
    omnivore: {
        id: 'omnivore', name: '雜食性', icon: '⚖️', maxLevel: 3,
        levels: [
            { level: 1, speedBonus: 0.3, fruitXPBonus: 2, corpseXPBonus: 5,  desc: '果子XP+2，屍體XP+5，速度+0.3' },
            { level: 2, speedBonus: 0.3, fruitXPBonus: 3, corpseXPBonus: 10, desc: '果子XP+3，屍體XP+10，速度+0.3' },
            { level: 3, speedBonus: 0.4, fruitXPBonus: 4, corpseXPBonus: 15, desc: '果子XP+4，屍體XP+15，速度+0.4，10%機率吃東西回血5' }
        ]
    }
};

// =============================================================
// 精英怪數值定義
// =============================================================
const ELITE_CONFIG = {
    base: { hp: 50, speed: 1.0, damage: 8 },
    nights: [
        { hpMult: 5,   speed: 1.3, damage: 12, xp: 150, label: '★精英',   color: '#5B0EA6' },
        { hpMult: 7.5, speed: 1.5, damage: 15, xp: 225, label: '★★精英',  color: '#8B0000' },
        { hpMult: 10,  speed: 1.7, damage: 18, xp: 300, label: '★★★精英', color: '#1A0A00' }
    ]
};

// =============================================================
// Boss 數值定義（各地形 Boss）
// =============================================================
const BOSS_CONFIG = {
    forest: {
        name: '黑熊',    label: '⚠️黑熊',
        radius: 25, hp: 500,  speed: 1.0, damage: 15, aggroRange: 200, attackRange: 30,
        color: '#3B1E08', colorChasing: '#2A0D00',
        spawnX: null, spawnY: null  // null = 地圖邊緣隨機生成
    },
    ocean: {
        name: '大白鯊',  label: '🦈大白鯊',
        radius: 30, hp: 600,  speed: 1.3, damage: 18, aggroRange: 220, attackRange: 35,
        color: '#003388', colorChasing: '#001A44',
        spawnX: 6500, spawnY: 6500
    },
    desert: {
        name: '沙漠蠍王', label: '🦂蠍王',
        radius: 28, hp: 550,  speed: 1.2, damage: 20, aggroRange: 210, attackRange: 32,
        color: '#8B7355', colorChasing: '#5C4A2A',
        spawnX: 2000, spawnY: 2000
    }
};

// =============================================================
// 遊戲基本資訊
// =============================================================
// 遊戲時間與日夜循環設定
// =============================================================
const GAME_TIMING = {
    totalTime:   600,  // 遊戲總時間（秒）= 10 分鐘
    phaseCount:  8,    // 時段數量
    phaseLength: 75,   // 每個時段長度（秒）= 1 分 15 秒
    // 各時段剩餘時間邊界（秒）：0=白天 1=夜1 2=白 3=夜2 4=白 5=夜3 6=白 7=Boss夜
    phaseBoundaries: [600, 525, 450, 375, 300, 225, 150, 75, 0]
};

// =============================================================
const GAME_INFO = {
    title:    '只吃不叫的噪鵑',
    subtitle: 'The Silent Koel',
    author:   'Goblinnest',
    version:  'v0.13.0'
};
