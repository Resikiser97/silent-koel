// =============================================================
// 器官資料定義 - ORGANS / HIDDEN_ORGANS / COMBOS
// ✦ 名稱與描述為中文預設；切換語言時由 lang.js applyLanguage() 覆寫
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
            { desc: 'HP上限+50，體型+20%（半徑+2，攻擊範圍同比例增加）',
              effects: { hpMaxAdd: 50, radiusAdd: 2 } },
            { desc: 'HP上限+50，體型再+20%',
              effects: { hpMaxAdd: 50, radiusAdd: 2 } }
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

const HIDDEN_ORGANS = {
    strongHeart: {
        id: 'strongHeart', name: '強大的心臟', type: 'hidden',
        desc: '移速+0.2，攻擊+5，HP上限+100，體型+20%',
        effects: { speedAdd: 0.2, attackAdd: 5, hpMaxAdd: 100, radiusAdd: 2 }
    },
    strongLegs: {
        id: 'strongLegs', name: '強大的大腿', type: 'hidden',
        desc: '移速+1，體型+20%',
        effects: { speedAdd: 1, radiusAdd: 2 }
    },
    strongArms: {
        id: 'strongArms', name: '強大的手臂', type: 'hidden',
        desc: '收集範圍+15px，體型+20%（攻擊範圍同比例增加）',
        effects: { pickupRangeAdd: 15, radiusAdd: 2 }
    }
};

const COMBOS = [
    { ids: ['crabClaw',   'poisonStinger'], key: 'comboCrabPoison', desc: '流血同時附加劇毒（毒傷x2）' },
    { ids: ['turtleShell','thornArmor'],    key: 'comboShellArmor', desc: '格擋時反傷翻倍' },
    { ids: ['brain',      'trueEye'],       key: 'comboBrainEye',   desc: '念力波有機率觸發暴擊傷害' },
    { ids: ['thickSkin',  'naturalRegen'],  key: 'comboSkinRegen',  desc: '回復量+1HP，回復間隔再-1秒' },
    { ids: ['trueEye',    'fang'],          key: 'comboEyeFang',    desc: '暴擊時附加暈眩效果' }
];
