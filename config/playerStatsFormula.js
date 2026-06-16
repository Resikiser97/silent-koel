// =============================================================
// 玩家屬性公式 — calcPlayerStats
// 純資料模組，不 import 任何 systems/
// 依賴：config/characters.js, config/organs.js, config/evolution.js, config/xpConfig.js, config/achievements.js
// =============================================================
//
// 【對外公開函式】
//   calcPlayerStats(charId, skills, organs, hiddenOrgans, mutationLevels, unlockedAchievements)
//     → { attack, attackSpeed, hpMax, speed, radius, attackRange, tenacity,
//         critChance, critMult, fruitXP, killXP, corpseXP }
//
// 【參數格式】
//   charId               : string — CHARACTERS key（'koel' | 'archerfish' …）
//   skills               : { vitality, agility, forager, hunter, terribleFang, … } 各欄位為等級數字
//   organs               : { [organId]: level } 或 [{id, level}]（runtime array 或 localStorage object 皆可）
//   hiddenOrgans         : { [organId]: any } 或 [{id, …}]（存在即套用，無等級）
//   mutationLevels       : { fang, tail, wing, eye }  缺省 0；可傳 null
//   unlockedAchievements : object｜null — 已解鎖成就 map（{ [id]: { unlockedAt } }）；傳入後面板顯示值與 runtime 成就加成同步（v0.1.25.0）
//
// 【計算規則】
//   - startOrgans（CHARACTERS config）永遠套用；savedOrgans 若有相同 ID 則跳過（Fix 2）
//   - radiusAdd 逐級套用，每級用當下 radius / attackRange 計算 rangeIncrease（Fix 1）
//   - carnivore startEvolution 只取最高那一級；herbivore/omnivore 逐級累加（Fix A）
//   - terribleFang fangBonus 從 ORGANS.fang.levels 推導，不寫死數值（Fix 7）
//   - terribleFang fangBonus 在 fang 已於 combinedOrganMap 中時跳過（Fix B/C）
//   - speed 加算 startEvolution.speedBonus（omnivore 起始角色）（Fix D）
//   - organs / hiddenOrgans 支援 array 或 object 格式（Fix 4）
//   - mutationLevels 傳 null 不 throw（Fix 6）
//   - corpseXP 預設用肉食性 Lv1 演示，對齊 Player Stats 首頁展示用途
// =============================================================

import { CHARACTERS }                from './characters.js';
import { ORGANS, HIDDEN_ORGANS }     from './organs.js';
import { EVOLUTION_PATHS }           from './evolution.js';
import { XP_CONFIG }                 from './xpConfig.js';
import { ACHIEVEMENTS }              from './achievements.js';

// ── 私有輔助函式 ─────────────────────────────────────────────

// 統一 organs 格式：array ([{id, level}]) 或 object ({id: level}) → object（Fix 4）
function _normalizeOrgans(raw) {
    if (!raw) return {};
    if (Array.isArray(raw)) {
        const obj = {};
        raw.forEach(o => { if (o && o.id) obj[o.id] = o.level ?? 1; });
        return obj;
    }
    return raw;
}

// 統一 hiddenOrgans 格式：array ([{id, …}]) 或 object ({id: any}) → object（Fix 4）
function _normalizeHiddenOrgans(raw) {
    if (!raw) return {};
    if (Array.isArray(raw)) {
        const obj = {};
        raw.forEach(o => { if (o && o.id) obj[o.id] = true; });
        return obj;
    }
    return raw;
}

// 累加 organ 從 Lv1 到 level 的指定 effect key（每升一級累加該級數值）
function _levelSum(organDef, level, key) {
    let n = 0;
    for (let i = 0; i < level && i < organDef.levels.length; i++) {
        n += organDef.levels[i].effects[key] || 0;
    }
    return n;
}

// Fix 7：從 ORGANS.fang.levels 推導 terribleFang 給予的 fang 攻擊加成
function _fangOrganBonus(fangLevel) {
    if (!ORGANS.fang || fangLevel <= 0) return 0;
    let total = 0;
    for (let i = 0; i < fangLevel && i < ORGANS.fang.levels.length; i++) {
        total += ORGANS.fang.levels[i].effects?.attackAdd ?? 0;
    }
    return total;
}

// Fix A：startEvolution 依 type 分支
//   carnivore：固定值覆蓋，只取最高那一級（runtime applyEvolutionEffects 單 if 行為）
//   herbivore / omnivore 及其他：逐級累加（runtime applyEvolutionEffects loop 行為）
function _startEvoEffect(char, key) {
    if (!char.startEvolution) return 0;
    const { type, level } = char.startEvolution;
    const path = EVOLUTION_PATHS[type];
    if (!path || level < 1 || level > path.levels.length) return 0;

    if (type === 'carnivore') {
        return path.levels[level - 1][key] || 0;
    }

    let n = 0;
    for (let i = 0; i < level && i < path.levels.length; i++) {
        n += path.levels[i][key] || 0;
    }
    return n;
}

function _corpseXpForCarnivoreLevel(level) {
    const path = EVOLUTION_PATHS.carnivore;
    if (!path || level <= 0) return 0;
    let n = 0;
    for (let i = 0; i < level && i < path.levels.length; i++) {
        n += path.levels[i].eatXP || 0;
    }
    return n;
}

// 加總 organMap（object 格式）所有 organ 的累積 effect，以及 hiddenMap 的平面 effect
function _sumEffects(organMap, hiddenMap, key) {
    let n = 0;
    for (const [id, level] of Object.entries(organMap)) {
        const def = ORGANS[id];
        if (def) n += _levelSum(def, level, key);
    }
    for (const id of Object.keys(hiddenMap)) {
        const def = HIDDEN_ORGANS[id];
        if (def && def.effects) n += def.effects[key] || 0;
    }
    return n;
}

// Fix 1：逐級套用 radiusAdd（每升一級用當下的 r 計算 rangeIncrease，符合 runtime organs.js）
function _applyRadiusLevels(organDef, level, state) {
    for (let i = 0; i < level && i < organDef.levels.length; i++) {
        const radAdd = organDef.levels[i].effects.radiusAdd || 0;
        if (!radAdd) continue;
        state.ar += Math.round(radAdd / Math.max(state.r, 1) * state.ar);
        state.r  += radAdd;
    }
}

// 聚合已解鎖成就 bonus（與 systems/achievementBonus.js 保持一致）
function _sumAchievementBonuses(unlockedIds) {
    const t = {
        attackAdd: 0, hpMaxAdd: 0, speedAdd: 0, critChanceAdd: 0, organSlotsAdd: 0,
        attackPercent: 0, hpMaxPercent: 0, speedPercent: 0,
        attackRangePercent: 0, radiusPercent: 0,
        attackSpeedBonus: 0, specialCdReduction: 0,
        fruitXpPercent: 0, fruitXpAdd: 0, killXpPercent: 0, corpseXpPercent: 0,
    };
    const unlockedSet = new Set(unlockedIds || []);
    for (const ach of ACHIEVEMENTS) {
        if (!unlockedSet.has(ach.id)) continue;
        const b = ach.bonus;
        if (!b || b.special) continue;
        if (b.allStatsPercent !== undefined) {
            t.attackPercent += b.allStatsPercent;
            t.hpMaxPercent  += b.allStatsPercent;
            t.speedPercent  += b.allStatsPercent;
            continue;
        }
        for (const [key, val] of Object.entries(b)) {
            if (key in t) t[key] += val;
        }
    }
    return t;
}

// ── 公開函式 ─────────────────────────────────────────────────

export function calcPlayerStats(
    charId,
    skills              = {},
    organs              = {},
    hiddenOrgans        = {},
    mutationLevels      = {},
    unlockedAchievements = null
) {
    const char = CHARACTERS[charId];
    if (!char) throw new Error('[playerStatsFormula] Unknown charId: ' + charId);

    // 正規化輸入：防禦 null，支援 array 格式（Fix 4, Fix 6）
    const sk        = skills         || {};
    const mut       = mutationLevels || {};
    const orgMap    = _normalizeOrgans(organs);
    const hiddenMap = _normalizeHiddenOrgans(hiddenOrgans);

    // Fix 2：startOrgans 永遠套用；savedOrgans 若有相同 ID 則跳過
    const startOrganMap = {};
    for (const { id, level } of (char.startOrgans || [])) {
        startOrganMap[id] = level;
    }
    const startOrganIds = new Set(Object.keys(startOrganMap));

    // savedOrgans 中排除已在 startOrgans 的 ID
    const savedOrganMap = {};
    for (const [id, level] of Object.entries(orgMap)) {
        if (!startOrganIds.has(id)) savedOrganMap[id] = level;
    }

    // 合併計算用 map（startOrgans 優先，savedOrgans 補充）
    const combinedOrganMap = { ...startOrganMap, ...savedOrganMap };

    // ── 攻擊 ──────────────────────────────────────────────────
    const atkBase     = 0;  // runtime 以 0 為基底，char.stats.attack 未套用
    const tfLv        = sk.terribleFang || 0;
    const tfSkillAdd  = tfLv * 2;
    const fangBonusLv = tfLv >= 5 ? 2 : tfLv >= 3 ? 1 : 0;
    // Fix B/C：fang 已在 startOrgans 或 savedOrgans（combinedOrganMap）時均不補加，避免雙算
    const terribleFangBonus = (fangBonusLv > 0 && !('fang' in combinedOrganMap))
        ? _fangOrganBonus(fangBonusLv)
        : 0;
    const atkOrganAdd = _sumEffects(combinedOrganMap, hiddenMap, 'attackAdd');
    const atkEvoAdd   = _startEvoEffect(char, 'attackAdd'); // Fix A：carnivore 只取最高級
    const atkMut      = 1 + (mut.fang || 0) * 0.01;
    // 不在此乘 mutation：等成就 flat+percent 套用後才統一乘（對齊 runtime 順序）
    const atkPreMut   = atkBase + tfSkillAdd + terribleFangBonus + atkOrganAdd + atkEvoAdd;

    const atkSpdBaseMs   = char.stats.attackSpeed || 1000;
    const atkSpdBase     = 0;
    const atkSpdOrganAdd = _sumEffects(combinedOrganMap, hiddenMap, 'attackSpeedBonus');
    const atkSpdEvoAdd   = _startEvoEffect(char, 'attackSpeedBonus');
    const atkSpdPreAch   = atkSpdBase + atkSpdOrganAdd + atkSpdEvoAdd;

    // ── 血量上限 ───────────────────────────────────────────────
    const hpBase     = char.stats.hp;
    const hpSkillAdd = (sk.vitality || 0) * 20;
    const hpStartEvo = _startEvoEffect(char, 'hpMaxAdd');    // koel herbivore Lv1 = +30
    const hpOrganAdd = _sumEffects(combinedOrganMap, hiddenMap, 'hpMaxAdd');
    const hpMut      = 1 + (mut.tail || 0) * 0.01;
    const hpPreMut   = hpBase + hpSkillAdd + hpStartEvo + hpOrganAdd;

    // ── 速度 ──────────────────────────────────────────────────
    const spdBase     = char.stats.speed;
    const spdSkillAdd = (sk.agility || 0) * 0.6;
    const spdOrganAdd = _sumEffects(combinedOrganMap, hiddenMap, 'speedAdd');
    const spdEvoAdd   = _startEvoEffect(char, 'speedBonus'); // Fix D：omnivore startEvolution 速度加成
    const spdMut      = 1 + (mut.wing || 0) * 0.01;
    const spdPreMut   = spdBase + spdSkillAdd + spdOrganAdd + spdEvoAdd;

    // ── 體型 + 攻擊範圍（Fix 1：逐級套用 radiusAdd）──────────
    const rState = { r: char.stats.radius, ar: char.stats.attackRange };
    const rBase  = rState.r;
    const arBase = rState.ar;

    for (const [id, level] of Object.entries(combinedOrganMap)) {
        const def = ORGANS[id];
        if (def) _applyRadiusLevels(def, level, rState);
    }
    for (const id of Object.keys(hiddenMap)) {
        const def = HIDDEN_ORGANS[id];
        if (def && def.effects && def.effects.radiusAdd) {
            const radAdd = def.effects.radiusAdd;
            rState.ar += Math.round(radAdd / Math.max(rState.r, 1) * rState.ar);
            rState.r  += radAdd;
        }
    }

    // ── 韌性 ──────────────────────────────────────────────────
    const tenOrganAdd = _sumEffects(combinedOrganMap, {}, 'tenacityAdd'); // hiddenOrgans 無韌性
    const tenFinal    = Math.min(1, tenOrganAdd);

    // ── 暴擊率 ────────────────────────────────────────────────
    const ccBase     = char.stats.critChance;
    const ccOrganAdd = _sumEffects(combinedOrganMap, hiddenMap, 'critChanceAdd');
    const ccFinal    = parseFloat((ccBase + ccOrganAdd).toFixed(2));

    // ── 暴擊傷害 ──────────────────────────────────────────────
    const cmBase     = char.stats.critMult;
    const cmOrganAdd = _sumEffects(combinedOrganMap, hiddenMap, 'critMultiplierAdd');
    const cmFinal    = parseFloat((cmBase + cmOrganAdd).toFixed(2));

    // ── 採集 XP ───────────────────────────────────────────────
    const xpMut      = 1 + (mut.eye || 0) * 0.01;
    const fruitBase  = XP_CONFIG.fruit.base;
    const fruitSkill = (sk.forager || 0) * XP_CONFIG.fruit.foragerPerLevel;
    // herbivore Lv1 fruitXPBonus = 0（Lv2 才開始加），carnivore 無 fruitXPBonus
    const fruitEvo   = _startEvoEffect(char, 'fruitXPBonus');
    const fruitFinal = parseFloat(((fruitBase + fruitSkill + fruitEvo) * xpMut).toFixed(2));

    // ── 獵人 XP ───────────────────────────────────────────────
    const killBase  = XP_CONFIG.kill.minCreatureBaseXP;
    const killSkill = (sk.hunter || 0) * XP_CONFIG.kill.hunterPerLevel;
    const killFinal = parseFloat(((killBase + killSkill) * xpMut).toFixed(2));

    // ── 成就加成（flat add → percent，與 applyAchievementStatBonuses 一致）
    const ach = _sumAchievementBonuses(
        unlockedAchievements ? Object.keys(unlockedAchievements) : []
    );
    // flat add（mutation 倍率最後才套，對齊 runtime：evo → ach → mut）
    let achAtkFinal    = atkPreMut   + ach.attackAdd;
    let achAtkSpdFinal = atkSpdPreAch + ach.attackSpeedBonus;
    let achHpFinal     = hpPreMut    + ach.hpMaxAdd;
    let achSpdFinal    = spdPreMut   + ach.speedAdd;
    let achCcFinal     = ccFinal     + ach.critChanceAdd;
    let achRFinal      = rState.r;
    let achArFinal     = rState.ar;
    // percent（套用在 flat add 後當下值）
    if (ach.attackPercent)      achAtkFinal  += Math.round(achAtkFinal  * ach.attackPercent);
    if (ach.hpMaxPercent)       achHpFinal   += Math.round(achHpFinal   * ach.hpMaxPercent);
    if (ach.speedPercent)       achSpdFinal   = parseFloat((achSpdFinal * (1 + ach.speedPercent)).toFixed(2));
    if (ach.attackRangePercent) achArFinal   += Math.round(achArFinal   * ach.attackRangePercent);
    if (ach.radiusPercent) {
        const _radd = Math.round(achRFinal * ach.radiusPercent);
        achArFinal  = Math.max(10, achArFinal + Math.round(_radd / Math.max(achRFinal, 1) * achArFinal));
        achRFinal   = Math.max(5,  achRFinal  + _radd);
    }
    // 最後套 mutation 倍率（對齊 runtime 順序：evo → ach → mut）
    achAtkFinal = Math.round(achAtkFinal * atkMut);
    achHpFinal  = Math.round(achHpFinal  * hpMut);
    achSpdFinal = parseFloat((achSpdFinal * spdMut).toFixed(2));
    // XP bonus（用於面板顯示）
    const corpseBase = _corpseXpForCarnivoreLevel(1);
    const achFruitFinal  = parseFloat(((fruitBase + ach.fruitXpAdd + fruitSkill + fruitEvo) * (1 + ach.fruitXpPercent) * xpMut).toFixed(2));
    const achKillFinal   = parseFloat(((killBase  + killSkill) * (1 + ach.killXpPercent) * xpMut).toFixed(2));
    const achCorpseFinal = parseFloat((corpseBase * (1 + ach.corpseXpPercent) * xpMut).toFixed(2));

    return {
        attack: {
            final: achAtkFinal, base: atkBase,
            skillAdd: tfSkillAdd + terribleFangBonus,
            organAdd: atkOrganAdd + atkEvoAdd,
            mutMultiplier: atkMut,
            achAdd: ach.attackAdd, achPercent: ach.attackPercent,
        },
        attackSpeed: {
            final: parseFloat(achAtkSpdFinal.toFixed(2)),
            intervalMs: Math.round(atkSpdBaseMs / (1 + achAtkSpdFinal)),
            baseIntervalMs: atkSpdBaseMs,
            base: atkSpdBase,
            organAdd: parseFloat((atkSpdOrganAdd + atkSpdEvoAdd).toFixed(2)),
            achAdd: ach.attackSpeedBonus,
        },
        hpMax: {
            final: achHpFinal, base: hpBase,
            skillAdd: hpSkillAdd,
            organAdd: hpOrganAdd + hpStartEvo,  // 包含 startEvolution HP 加成
            mutMultiplier: hpMut,
            achAdd: ach.hpMaxAdd, achPercent: ach.hpMaxPercent,
        },
        speed: {
            final: achSpdFinal, base: spdBase,
            skillAdd: spdSkillAdd,
            organAdd: spdOrganAdd,
            evoAdd: spdEvoAdd,
            mutMultiplier: spdMut,
            achAdd: ach.speedAdd, achPercent: ach.speedPercent,
        },
        radius: {
            final: achRFinal, base: rBase, organAdd: rState.r - rBase,
            achPercent: ach.radiusPercent,
        },
        attackRange: {
            final: achArFinal, base: arBase, organAdd: rState.ar - arBase,
            achPercent: ach.attackRangePercent,
        },
        tenacity: {
            final: tenFinal, base: 0, organAdd: tenOrganAdd,
        },
        critChance: {
            final: achCcFinal, base: ccBase, organAdd: ccOrganAdd,
            achAdd: ach.critChanceAdd,
        },
        critMult: {
            final: cmFinal, base: cmBase, organAdd: cmOrganAdd,
        },
        fruitXP: {
            final: achFruitFinal, base: fruitBase,
            skillAdd: fruitSkill, mutMultiplier: xpMut,
            achAdd: ach.fruitXpAdd, achPercent: ach.fruitXpPercent,
        },
        killXP: {
            final: achKillFinal, base: killBase,
            skillAdd: killSkill, mutMultiplier: xpMut,
            achPercent: ach.killXpPercent,
        },
        corpseXP: {
            final: achCorpseFinal, base: corpseBase,
            evoLevel: 1, mutMultiplier: xpMut,
            achPercent: ach.corpseXpPercent,
        },
    };
}
