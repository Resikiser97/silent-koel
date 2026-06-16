// =============================================================
// 成就加成 - getAchievementBonusTotals / applyAchievementStatBonuses
//
// 套用順序（在 applyEvolutionEffects 之後、applyAllMutationBonuses 之前呼叫）：
//   1. flat add（attackAdd / hpMaxAdd / speedAdd / critChanceAdd / organSlotsAdd）
//   2. percent（attackPercent / hpMaxPercent / speedPercent / attackRangePercent / radiusPercent）
//      同類型多個百分比先相加再一次性套用，套用對象是 flat add 後的當下值
//   XP bonus 存在 p._ach* 欄位，由各 XP 呼叫點讀取
// =============================================================
import { gameState } from './gameState.js';
import { ACHIEVEMENTS } from '../config/achievements.js';
import { STORAGE_KEYS, storageGetJSON } from '../storage/index.js';

// 聚合所有已解鎖成就的 bonus，回傳加總物件
export function getAchievementBonusTotals(unlockedIds) {
    const totals = {
        attackAdd: 0, hpMaxAdd: 0, speedAdd: 0, critChanceAdd: 0, organSlotsAdd: 0,
        attackPercent: 0, hpMaxPercent: 0, speedPercent: 0,
        attackRangePercent: 0, radiusPercent: 0,
        attackSpeedBonus: 0, specialCdReduction: 0,
        fruitXpPercent: 0, fruitXpAdd: 0, killXpPercent: 0, corpseXpPercent: 0,
        mutationExchangeDiscountPercent: 0,
    };
    const unlockedSet = new Set(unlockedIds);
    for (const ach of ACHIEVEMENTS) {
        if (!unlockedSet.has(ach.id)) continue;
        const b = ach.bonus;
        if (!b) continue;
        if (b.special) continue; // evo_5star：無數值加成，由 main.js 特殊處理

        // pioneer：allStatsPercent 只展開為三項 percent
        if (b.allStatsPercent !== undefined) {
            totals.attackPercent += b.allStatsPercent;
            totals.hpMaxPercent  += b.allStatsPercent;
            totals.speedPercent  += b.allStatsPercent;
            continue;
        }

        for (const [key, val] of Object.entries(b)) {
            if (key in totals) totals[key] += val;
        }
    }
    return totals;
}

export function applyAchievementStatBonuses() {
    const unlocked = storageGetJSON(STORAGE_KEYS.ACHIEVEMENTS) || {};
    const t = getAchievementBonusTotals(Object.keys(unlocked));

    const p = gameState.player;
    const s = gameState.stats;

    // ── 1. flat add
    p.attack     += t.attackAdd;
    s.hpMax      += t.hpMaxAdd;
    s.hpCurrent   = Math.min(s.hpMax, s.hpCurrent + t.hpMaxAdd);
    p.speed      += t.speedAdd;
    p.critChance += t.critChanceAdd;
    p.organSlots += t.organSlotsAdd;
    p.attackSpeedBonus = (p.attackSpeedBonus || 0) + t.attackSpeedBonus;
    if (t.specialCdReduction > 0) {
        p._achSpecialCdReduction = (p._achSpecialCdReduction || 0) + t.specialCdReduction;
    }

    // ── 2. percent（套用在 flat add 之後當下值）
    if (t.attackPercent) {
        p.attack += Math.round(p.attack * t.attackPercent);
    }
    if (t.hpMaxPercent) {
        const add = Math.round(s.hpMax * t.hpMaxPercent);
        s.hpMax    += add;
        s.hpCurrent = Math.min(s.hpMax, s.hpCurrent + add);
    }
    if (t.speedPercent) {
        p.speed = parseFloat((p.speed * (1 + t.speedPercent)).toFixed(2));
    }
    if (t.attackRangePercent) {
        p.attackRange += Math.round(p.attackRange * t.attackRangePercent);
    }
    if (t.radiusPercent) {
        const add = Math.round(p.radius * t.radiusPercent);
        const rangeIncrease = Math.round(add / Math.max(p.radius, 1) * p.attackRange);
        p.radius      = Math.max(5, p.radius + add);
        p.attackRange = Math.max(10, p.attackRange + rangeIncrease);
    }

    // ── XP bonus（存在 player 欄位，由 XP 呼叫點讀取）
    p._achFruitXpPercent  = t.fruitXpPercent;
    p._achFruitXpAdd      = t.fruitXpAdd;
    p._achKillXpPercent   = t.killXpPercent;
    p._achCorpseXpPercent = t.corpseXpPercent;

    // ── mutation exchange discount（由 mutation panel 讀取）
    p._achMutationExchangeDiscount = t.mutationExchangeDiscountPercent;
}
