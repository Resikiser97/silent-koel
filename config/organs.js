// =============================================================
// 器官資料定義 - ORGANS / HIDDEN_ORGANS / COMBOS
// ✦ 名稱與描述為中文預設；切換語言時由 lang.js applyLanguage() 覆寫
// =============================================================

const ORGANS = {
    // ── 攻擊類
    crabClaw: {
        id: 'crabClaw', name: '蟹鉗', type: 'attack', maxLevel: 3,
        levels: [
            { desc: '攻擊+5，25%流血（每秒1傷，10秒）',
              effects: { attackAdd: 5, bleedChance: 0.25, bleedDmg: 1, bleedDur: 10000 } },
            { desc: '攻擊+2，流血+25%，每秒傷+2',
              effects: { attackAdd: 2, bleedChance: 0.25, bleedDmg: 2 } },
            { desc: '攻擊+3，流血+50%，每秒傷+2',
              effects: { attackAdd: 3, bleedChance: 0.50, bleedDmg: 2 } }
        ]
    },
    boxingGloves: {
        id: 'boxingGloves', name: '搏擊拳套', type: 'attack', maxLevel: 3,
        levels: [
            { desc: '攻擊+5，攻速+10%',
              effects: { attackAdd: 5, attackSpeedBonus: 0.10 } },
            { desc: '攻擊+2，攻速+15%',
              effects: { attackAdd: 2, attackSpeedBonus: 0.15 } },
            { desc: '攻擊+3，攻速+15%',
              effects: { attackAdd: 3, attackSpeedBonus: 0.15 } }
        ]
    },
    poisonStinger: {
        id: 'poisonStinger', name: '毒刺', type: 'attack', maxLevel: 3,
        levels: [
            { desc: '攻擊時附加中毒每秒2傷持續5秒',
              effects: { poisonDmg: 2, poisonDur: 5000 } },
            { desc: '每秒傷+1，持續+3秒',
              effects: { poisonDmg: 1, poisonDur: 3000 } },
            { desc: '每秒傷+2，持續+2秒',
              effects: { poisonDmg: 2, poisonDur: 2000 } }
        ]
    },
    fang: {
        id: 'fang', name: '獠牙', type: 'attack', maxLevel: 3,
        levels: [
            { desc: '攻擊+12，15%暈眩敵人0.5秒',
              effects: { attackAdd: 12, stunChance: 0.15, stunDurAdd: 500 } },
            { desc: '攻擊+2，暈眩+5%',
              effects: { attackAdd: 2, stunChance: 0.05 } },
            { desc: '攻擊+3，暈眩+5%，暈眩時間+0.5秒',
              effects: { attackAdd: 3, stunChance: 0.05, stunDurAdd: 500 } }
        ]
    },

    // ── 防禦類
    longLegs: {
        id: 'longLegs', name: '大長腿', type: 'defense', maxLevel: 3,
        levels: [
            { desc: '移動速度+1', effects: { speedAdd: 1 } },
            { desc: '移動速度+1', effects: { speedAdd: 1 } },
            { desc: '移動速度+1', effects: { speedAdd: 1 } }
        ]
    },
    turtleShell: {
        id: 'turtleShell', name: '龜殼', type: 'defense', maxLevel: 3,
        levels: [
            { desc: '受傷-10%，速度-1',
              effects: { damageReductionAdd: 0.10, speedAdd: -1 } },
            { desc: '受傷額外-10%，速度-1',
              effects: { damageReductionAdd: 0.10, speedAdd: -1 } },
            { desc: '受傷額外-10%，速度-1',
              effects: { damageReductionAdd: 0.10, speedAdd: -1 } }
        ]
    },
    thickSkin: {
        id: 'thickSkin', name: '厚皮', type: 'defense', maxLevel: 3,
        levels: [
            { desc: 'HP上限+20，當前HP+20',
              effects: { hpMaxAdd: 20 } },
            { desc: 'HP上限+30，當前HP+30，體型+20%',
              effects: { hpMaxAdd: 30, radiusAdd: 2 } },
            { desc: 'HP上限+50，當前HP+50，體型+20%',
              effects: { hpMaxAdd: 50, radiusAdd: 2 } }
        ]
    },
    thornArmor: {
        id: 'thornArmor', name: '刺甲', type: 'defense', maxLevel: 3,
        levels: [
            { desc: '被攻擊時反彈最大HP 5%的傷害',
              effects: { thornDamageAdd: 0.05 } },
            { desc: '額外反彈最大HP 5%（累計10%）',
              effects: { thornDamageAdd: 0.05 } },
            { desc: '額外反彈最大HP 5%（累計15%）',
              effects: { thornDamageAdd: 0.05 } }
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
            { desc: '暴擊率+10%',
              effects: { critChanceAdd: 0.10 } },
            { desc: '暴擊率+5%，暴擊傷害+0.25',
              effects: { critChanceAdd: 0.05, critMultiplierAdd: 0.25 } },
            { desc: '暴擊率+10%，暴擊傷害+0.25',
              effects: { critChanceAdd: 0.10, critMultiplierAdd: 0.25 } }
        ]
    },
    sharpSense: {
        id: 'sharpSense', name: '靈敏知覺', type: 'spirit', maxLevel: 3,
        levels: [
            { desc: '偵測1000px範圍內果子，顯示最佳路徑（紅線）',
              effects: { perceptionRangeAdd: 1000 } },
            { desc: '新增追蹤最近屍體（黃線）',
              effects: {} },
            { desc: '新增追蹤最近白骨（白線）',
              effects: {} }
        ]
    },
    naturalRegen: {
        id: 'naturalRegen', name: '超自然回復', type: 'spirit', maxLevel: 3,
        levels: [
            { desc: '每10秒回復1HP',
              effects: { regenHpAdd: 1, regenIntervalDelta: 0 } },
            { desc: '間隔-2秒，回復+1HP，額外回復最大HP 0.5%',
              effects: { regenHpAdd: 1, regenIntervalDelta: -2000, regenHpMaxPercent: 0.005 } },
            { desc: '間隔-3秒，回復+1HP，額外回復最大HP 0.5%',
              effects: { regenHpAdd: 1, regenIntervalDelta: -3000, regenHpMaxPercent: 0.005 } }
        ]
    },

    // ── 阿奇爾專屬／新器官
    mouthOrgan: {
        id: 'mouthOrgan', name: '嘴器', type: 'attack', maxLevel: 3,
        levels: [
            { desc: '攻擊+4',
              effects: { attackAdd: 4 } },
            { desc: '攻擊+4',
              effects: { attackAdd: 4 } },
            { desc: '攻擊+2，命中使目標移動速度-20%持續2秒',
              effects: { attackAdd: 2, onHitSlow: { amount: 0.2, duration: 2000 } } }
        ]
    },
    fishScale: {
        id: 'fishScale', name: '魚鱗', type: 'defense', maxLevel: 3,
        levels: [
            { desc: '韌性+5%（減少控制時間5%）',
              effects: { tenacityAdd: 0.05 } },
            { desc: '韌性+10%（累計15%）',
              effects: { tenacityAdd: 0.10 } },
            { desc: '韌性+15%（累計30%）',
              effects: { tenacityAdd: 0.15 } }
        ]
    },
    sharkLeaf: {
        id: 'sharkLeaf', name: '鯊魚嗅葉', type: 'spirit', maxLevel: 3,
        levels: [
            { desc: '對血量15%以下的敵人傷害+10%',
              effects: { executeBonus: { threshold: 0.15, bonus: 0.10 } } },
            { desc: '對血量30%以下的敵人傷害+15%',
              effects: { executeBonus: { threshold: 0.30, bonus: 0.15 } } },
            { desc: '對血量50%以下的敵人傷害+20%',
              effects: { executeBonus: { threshold: 0.50, bonus: 0.20 } } }
        ]
    },

    // ── 特殊器官（不出現在技能池，不可繼承）
    poisonSac: {
        id: 'poisonSac', name: '毒囊', type: 'special', maxLevel: 10,
        noSelection: true, noInherit: true,
        // 各等級對應的白骨素累計門檻
        thresholds: [5, 10, 20, 40, 60, 100, 120, 140, 160, 200],
        levels: [
            { desc: '攻擊+1，毒傷+1（基礎5秒）',        effects: { attackAdd: 1, poisonSacDmg: 1, poisonSacDur: 5000 } },
            { desc: '攻擊+1，毒傷+1',                   effects: { attackAdd: 1, poisonSacDmg: 1 } },
            { desc: '攻擊+2，毒傷+2',                   effects: { attackAdd: 2, poisonSacDmg: 2 } },
            { desc: '攻擊+3，毒傷+3',                   effects: { attackAdd: 3, poisonSacDmg: 3 } },
            { desc: '攻擊+3，毒傷+3',                   effects: { attackAdd: 3, poisonSacDmg: 3 } },
            { desc: '攻擊+4，毒傷+4',                   effects: { attackAdd: 4, poisonSacDmg: 4 } },
            { desc: '攻擊+4，毒傷+4',                   effects: { attackAdd: 4, poisonSacDmg: 4 } },
            { desc: '攻擊+5，毒傷+5',                   effects: { attackAdd: 5, poisonSacDmg: 5 } },
            { desc: '攻擊+5，毒傷+5',                   effects: { attackAdd: 5, poisonSacDmg: 5 } },
            { desc: '攻擊+8，毒傷+8',                   effects: { attackAdd: 8, poisonSacDmg: 8 } }
        ]
    }
};

const HIDDEN_ORGANS = {
    strongHeart: {
        id: 'strongHeart', name: '強大的心臟', type: 'hidden',
        desc: '移速+0.6，攻擊+5，HP上限+60，體型+20%',
        effects: { speedAdd: 0.6, attackAdd: 5, hpMaxAdd: 60, radiusAdd: 2 }
    },
    strongLegs: {
        id: 'strongLegs', name: '強大的大腿', type: 'hidden',
        desc: '移速+3，體型+20%',
        effects: { speedAdd: 3, radiusAdd: 2 }
    },
    strongArms: {
        id: 'strongArms', name: '強大的手臂', type: 'hidden',
        desc: '收集範圍+15px，體型+20%（攻擊範圍同比例增加）',
        effects: { pickupRangeAdd: 15, radiusAdd: 2 }
    },
    strongEye: {
        id: 'strongEye', name: '強大的眼睛', type: 'hidden',
        desc: '暴擊率+10%，暴擊傷害+0.25，體型+20%',
        effects: { critChanceAdd: 0.10, critMultiplierAdd: 0.25, radiusAdd: 2 }
    }
};

const COMBOS = [
    { ids: ['poisonStinger', 'poisonSac'],             key: 'comboCrabPoison', desc: '毒傷翻倍（毒刺Lv3且擁有毒囊）' },
    { ids: ['crabClaw',      'boxingGloves'],          key: 'comboCrabGloves', desc: '流血傷害翻倍，命中敵人施加回復量-50%（蟹鉗+搏擊拳套各達Lv3）' },
    { ids: ['turtleShell',   'thornArmor'],            key: 'comboShellArmor', desc: '反彈時傷害翻倍（各達Lv3）' },
    { ids: ['brain',         'trueEye'],               key: 'comboBrainEye',   desc: '念力波可沿用暴擊率和暴擊傷害（各達Lv3）' },
    { ids: ['thickSkin',     'naturalRegen'],          key: 'comboSkinRegen',  desc: '回復量+1HP，回復間隔再-1秒（各達Lv3）' },
    { ids: ['trueEye',       'fang'],                  key: 'comboEyeFang',    desc: '暴擊時附加暈眩效果（各達Lv3）' }
];
