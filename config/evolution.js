// =============================================================
// 進化路線與技能資料 - EVOLUTION_PATHS / SKILLS
// ✦ 名稱與描述為中文預設；切換語言時由 lang.js applyLanguage() 覆寫
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

const SKILLS = {
    vitality:            { id: 'vitality',            name: '強壯體魄', maxLevel: 3, desc: '起始 HP +20（每級）' },
    agility:             { id: 'agility',             name: '敏捷身手', maxLevel: 3, desc: '起始速度 +0.2（每級）' },
    forager:             { id: 'forager',             name: '採集專家', maxLevel: 3, desc: '果子 XP +3（每級）' },
    hunter:              { id: 'hunter',              name: '獵人本能', maxLevel: 3, desc: '擊殺 XP +10（每級）' },
    tenacity:            { id: 'tenacity',            name: '頑強意志', maxLevel: 3, desc: '死亡時 HP 保留 10%（每級，每局一次）' },
    organMemory:         { id: 'organMemory',         name: '記憶器官', maxLevel: 3, desc: '死亡保留器官數 +1（預設1個；Lv1=2個，Lv2=3個，Lv3=4個）' },
    luckyReroll:         { id: 'luckyReroll',         name: '幸運重選', maxLevel: 3, desc: '器官選擇時可重新隨機（每級1次）' },
    collectionAddiction: { id: 'collectionAddiction', name: '收集成癮', maxLevel: 3, desc: '收集範圍+10px（果子和屍體，每級）' },
    terribleFang:        { id: 'terribleFang',        name: '恐怖之牙', maxLevel: 5, desc: '攻擊+2（每級）；Lv5開局獲得獠牙Lv1' }
};
