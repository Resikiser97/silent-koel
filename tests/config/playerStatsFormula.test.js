// tests/config/playerStatsFormula.test.js
import { describe, it, expect } from 'vitest';
import { calcPlayerStats } from '../../config/playerStatsFormula.js';
import { CHARACTERS } from '../../config/characters.js';

// ── 既有測試（保留）──────────────────────────────────────────

describe('calcPlayerStats — 基礎', () => {
    it('koel 無任何技能器官：血量 = 130（基礎100 + herbivore Lv1 +30）', () => {
        const result = calcPlayerStats('koel', {}, {}, {}, {});
        expect(result.hpMax.final).toBe(130);
    });

    it('koel terribleFang Lv3：攻擊 skillAdd 包含 fang Lv1 bonus（從 config 推導）', () => {
        const result = calcPlayerStats('koel', { terribleFang: 3 }, {}, {}, {});
        // terribleFang*2(6) + fang.levels[0].attackAdd(12) = 18
        expect(result.attack.skillAdd).toBe(18);
        expect(result.attack.final).toBe(18);
    });

    it('archerfish 無技能器官：攻擊包含 mouthOrgan Lv3(+10) + carnivore Lv1(+2)', () => {
        const result = calcPlayerStats('archerfish', {}, {}, {}, {});
        expect(result.attack.organAdd).toBe(12); // 10 + 2
        expect(result.attack.final).toBe(12);
    });

    it('mutationLevels.tail = 100 → 血量上限乘以 2.0', () => {
        const result = calcPlayerStats('koel', {}, {}, {}, { tail: 100 });
        expect(result.hpMax.final).toBe(260);       // (100 + 30) × 2.0
        expect(result.hpMax.mutMultiplier).toBe(2.0);
    });

    it('mutationLevels.eye = 50 → fruitXP 和 killXP 都乘以 1.5', () => {
        const result = calcPlayerStats('koel', {}, {}, {}, { eye: 50 });
        expect(result.fruitXP.mutMultiplier).toBe(1.5);
        expect(result.fruitXP.final).toBe(7.5);    // (5 + 0) × 1.5
        expect(result.killXP.final).toBe(15);       // (10 + 0) × 1.5
    });

    it('所有 10 個屬性 key 都存在且各有 final 欄位', () => {
        const result = calcPlayerStats('koel', {}, {}, {}, {});
        const keys = [
            'attack', 'hpMax', 'speed', 'radius', 'attackRange',
            'tenacity', 'critChance', 'critMult', 'fruitXP', 'killXP',
        ];
        for (const key of keys) {
            expect(result, `key="${key}" 不存在`).toHaveProperty(key);
            expect(result[key], `result.${key}.final 不存在`).toHaveProperty('final');
        }
    });
});

// ── Fix 1：radiusAdd 逐級套用 ──────────────────────────────

describe('calcPlayerStats — Fix 1 radiusAdd 逐級套用', () => {
    it('thickSkin Lv3（radiusAdd 在 Lv2+Lv3）：逐級計算 attackRange 連動', () => {
        // koel base: r=10, ar=50
        // Lv1: radiusAdd=0 → skip
        // Lv2: radiusAdd=2, rangeIncrease=Math.round(2/10*50)=10 → r=12, ar=60
        // Lv3: radiusAdd=2, rangeIncrease=Math.round(2/12*60)=10 → r=14, ar=70
        const result = calcPlayerStats('koel', {}, { thickSkin: 3 }, {}, {});
        expect(result.radius.final).toBe(14);
        expect(result.attackRange.final).toBe(70);
    });

    it('無 radiusAdd 器官：radius / attackRange 等於基礎值', () => {
        const result = calcPlayerStats('koel', {}, { crabClaw: 3 }, {}, {});
        expect(result.radius.final).toBe(10);
        expect(result.attackRange.final).toBe(50);
        expect(result.radius.organAdd).toBe(0);
    });
});

// ── Fix 2：startOrgan vs savedOrgan 同 ID 規則 ──────────────

describe('calcPlayerStats — Fix 2 startOrgan 優先', () => {
    it('archerfish savedOrgan mouthOrgan Lv2 被 startOrgan Lv3 覆蓋（savedOrgan 跳過）', () => {
        // savedOrgans 有 mouthOrgan:2，但 startOrgan 有 mouthOrgan:3
        // → 應使用 startOrgan Lv3（累計 +10），而非 savedOrgan Lv2（累計 +8）
        const withSaved    = calcPlayerStats('archerfish', {}, { mouthOrgan: 2 }, {}, {});
        const withoutSaved = calcPlayerStats('archerfish', {}, {},             {}, {});
        expect(withSaved.attack.organAdd).toBe(withoutSaved.attack.organAdd); // 12 = 12
        expect(withSaved.attack.final).toBe(12);
    });

    it('koel 無 startOrgan：savedOrgan 正常套用', () => {
        // koel 無 startOrgans，fang:2 應正常計算
        const result = calcPlayerStats('koel', {}, { fang: 2 }, {}, {});
        // fang Lv1(+12) + Lv2(+2) = 14
        expect(result.attack.organAdd).toBe(14);
    });
});

// ── Fix 4：array 格式輸入 ────────────────────────────────────

describe('calcPlayerStats — Fix 4 Array 格式 organs', () => {
    it('organs 傳入 array 格式與 object 格式結果相同', () => {
        const objResult = calcPlayerStats('koel', {}, { fang: 2 }, {}, {});
        const arrResult = calcPlayerStats('koel', {}, [{ id: 'fang', level: 2 }], {}, {});
        expect(arrResult.attack.final).toBe(objResult.attack.final);
        expect(arrResult.attack.organAdd).toBe(objResult.attack.organAdd);
    });

    it('hiddenOrgans 傳入 array 格式與 object 格式結果相同', () => {
        const objResult = calcPlayerStats('koel', {}, {}, { strongHeart: true }, {});
        const arrResult = calcPlayerStats('koel', {}, {}, [{ id: 'strongHeart' }], {});
        expect(arrResult.attack.final).toBe(objResult.attack.final);
        expect(arrResult.hpMax.final).toBe(objResult.hpMax.final);
    });
});

// ── Fix 6：null 防護 ─────────────────────────────────────────

describe('calcPlayerStats — Fix 6 null 防護', () => {
    it('mutationLevels 為 null：不 throw，所有 mutMultiplier 為 1', () => {
        const result = calcPlayerStats('koel', {}, {}, {}, null);
        expect(result.attack.mutMultiplier).toBe(1);
        expect(result.hpMax.mutMultiplier).toBe(1);
        expect(result.speed.mutMultiplier).toBe(1);
        expect(result.fruitXP.mutMultiplier).toBe(1);
        expect(result.killXP.mutMultiplier).toBe(1);
    });

    it('organs / hiddenOrgans 為 null：不 throw，等同空物件', () => {
        const result = calcPlayerStats('koel', null, null, null, null);
        expect(result.hpMax.final).toBe(130);   // herbivore +30 來自 startEvo，不受器官影響
        expect(result.attack.final).toBe(0);
    });
});

// ── tenacity clamp ───────────────────────────────────────────

describe('calcPlayerStats — tenacity', () => {
    it('fishScale Lv3：tenacityAdd = 0.30（未超上限）', () => {
        const result = calcPlayerStats('koel', {}, { fishScale: 3 }, {}, {});
        expect(result.tenacity.organAdd).toBeCloseTo(0.30, 10);
        expect(result.tenacity.final).toBeCloseTo(0.30, 10);
    });
});

// ── Fix A：herbivore 逐級累加 / carnivore 只取最高級 ─────────

describe('calcPlayerStats — Fix A startEvoEffect 分支', () => {
    it('herbivore Lv2 累加：hpMaxAdd = Lv1(30) + Lv2(10) = 40，非只取 Lv2(10)', () => {
        // 暫時將 koel startEvolution 升到 Lv2
        const original = CHARACTERS.koel.startEvolution;
        CHARACTERS.koel.startEvolution = { type: 'herbivore', level: 2 };
        try {
            const result = calcPlayerStats('koel', {}, {}, {}, {});
            expect(result.hpMax.organAdd).toBe(40);   // 30 + 10 累加
            expect(result.hpMax.final).toBe(140);     // 100 + 40
        } finally {
            CHARACTERS.koel.startEvolution = original;
        }
    });
});

// ── Fix C：savedOrgans 已有 fang 也避免雙算 ─────────────────

describe('calcPlayerStats — Fix C savedOrgans fang 不雙算', () => {
    it('savedOrgans 有 fang Lv1 且 terribleFang Lv3：skillAdd 只有 tfSkillAdd，無額外 fangBonus', () => {
        // savedOrgans fang:1 → combinedOrganMap 有 fang → terribleFangBonus = 0
        // organAdd = fang Lv1 = 12
        const result = calcPlayerStats('koel', { terribleFang: 3 }, { fang: 1 }, {}, {});
        expect(result.attack.skillAdd).toBe(6);   // terribleFang*2，無 fangBonus
        expect(result.attack.organAdd).toBe(12);  // fang Lv1 via savedOrgan
        expect(result.attack.final).toBe(18);     // 6 + 12
    });
});

// ── Fix D：omnivore startEvolution speedBonus 加算 ──────────

describe('calcPlayerStats — Fix D omnivore speedBonus', () => {
    it('omnivore Lv2 cumulative speedBonus：speed.evoAdd = 0.4 + 0.5 = 0.9', () => {
        const original = CHARACTERS.koel.startEvolution;
        CHARACTERS.koel.startEvolution = { type: 'omnivore', level: 2 };
        try {
            const result = calcPlayerStats('koel', {}, {}, {}, {});
            // omnivore Lv1=0.4 + Lv2=0.5 = 0.9（累加）
            expect(result.speed.evoAdd).toBeCloseTo(0.9, 10);
            // koel base speed=4.5，無技能器官
            expect(result.speed.final).toBeCloseTo(5.4, 2);
        } finally {
            CHARACTERS.koel.startEvolution = original;
        }
    });
});

// ── Fix B：terribleFang fang bonus 避免雙算 ─────────────────

describe('calcPlayerStats — Fix B terribleFang 不雙算', () => {
    it('startOrgans 已有 fang 時 terribleFang Lv3 不再加 fangBonus', () => {
        // 暫時讓 koel startOrgans 包含 fang Lv1
        const original = CHARACTERS.koel.startOrgans;
        CHARACTERS.koel.startOrgans = [{ id: 'fang', level: 1 }];
        try {
            // startOrgan fang Lv1 → atkOrganAdd += 12
            // terribleFang Lv3 → tfSkillAdd=6, terribleFangBonus=0（fang 已在 startOrgans）
            const result = calcPlayerStats('koel', { terribleFang: 3 }, {}, {}, {});
            expect(result.attack.skillAdd).toBe(6);   // 只有 tfSkillAdd，無 fangBonus
            expect(result.attack.organAdd).toBe(12);  // fang Lv1 via startOrgan
            expect(result.attack.final).toBe(18);     // 6 + 12
        } finally {
            CHARACTERS.koel.startOrgans = original;
        }
    });
});
