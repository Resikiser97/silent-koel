// =============================================================
// 進化路線與技能資料 - EVOLUTION_PATHS / SKILLS
// ✦ 名稱與描述為中文預設；切換語言時由 lang.js applyLanguage() 覆寫
// =============================================================

const EVOLUTION_PATHS = {
    herbivore: {
        id: 'herbivore', name: '草食性', icon: '🌿', maxLevel: 5,
        levels: [
            { level: 1, hpMaxAdd: 30, fruitXPBonus: 0, desc: '可吃果子，HP上限+30' },
            { level: 2, hpMaxAdd: 10, fruitXPBonus: 1, desc: 'HP+10，果子XP+1，撞到不逃跑' },
            { level: 3, hpMaxAdd: 15, fruitXPBonus: 2, desc: 'HP+15，果子XP+2，被攻擊也不逃跑' },
            { level: 4, hpMaxAdd: 20, fruitXPBonus: 3, radiusPercent: 0.10, friendly: true, desc: 'HP+20，果子XP+3，體型+10%，中立生物完全友善' },
            { level: 5, hpMaxAdd: 25, fruitXPBonus: 4, radiusPercent: 0.20, friendly: true, desc: 'HP+25，果子XP+4，體型+20%，中立生物完全友善' }
        ]
    },
    carnivore: {
        id: 'carnivore', name: '肉食性', icon: '🥩', maxLevel: 5,
        levels: [
            { level: 1, attackAdd: 2, eatXP: 20, eatTime: 3000, desc: '可吃屍體（20XP，3秒），攻擊+2' },
            { level: 2, attackAdd: 4, eatXP: 20, eatTime: 2500, desc: '屍體累計40XP，2.5秒，攻擊+4' },
            { level: 3, attackAdd: 6, eatXP: 20, eatTime: 2000, attackSpeedBonusAdd: 0.05, desc: '屍體累計60XP，2秒，攻擊+6，攻速+5%' },
            { level: 4, attackAdd: 8, eatXP: 20, eatTime: 1500, attackSpeedBonusAdd: 0.10, desc: '屍體累計80XP，1.5秒，攻擊+8，攻速累計+15%' },
            { level: 5, attackAdd: 10, eatXP: 20, eatTime: 1000, attackSpeedBonusAdd: 0.15, desc: '屍體累計100XP，1秒，攻擊+10，攻速累計+30%' }
        ]
    },
    omnivore: {
        id: 'omnivore', name: '雜食性', icon: '⚖️', maxLevel: 5,
        levels: [
            { level: 1, speedBonus: 0.4, boneEatTime: 1000, boneMaterialAdd: 1, desc: '速度+0.4，獲得毒囊，白骨吞噬1秒，白骨素+1' },
            { level: 2, speedBonus: 0.5, boneEatTime: 500,  boneMaterialAdd: 1, desc: '速度+0.5，白骨吞噬0.5秒，白骨素+1' },
            { level: 3, speedBonus: 0.6, boneEatTime: 0,    boneMaterialAdd: 1, desc: '速度+0.6，立刻吞噬白骨，白骨素+1' },
            { level: 4, speedBonus: 0.7, boneEatTime: 0,    boneMaterialAdd: 2, desc: '速度+0.7，立刻吞噬白骨，白骨素+2' },
            { level: 5, speedBonus: 0.8, boneEatTime: 0,    boneMaterialAdd: 3, desc: '速度+0.8，立刻吞噬白骨，白骨素+3' }
        ]
    }
};

const SKILLS = {
    vitality:            { id: 'vitality',            name: '強壯體魄', maxLevel: 3, desc: '起始 HP +20（每級）' },
    agility:             { id: 'agility',             name: '敏捷身手', maxLevel: 3, desc: '起始速度 +0.2（每級）' },
    forager:             { id: 'forager',             name: '採集專家', maxLevel: 3, desc: '果子 XP +3（每級）' },
    hunter:              { id: 'hunter',              name: '獵人本能', maxLevel: 3, desc: '擊殺 XP +10（每級）' },
    tenacity:            { id: 'tenacity',            name: '頑強意志', maxLevel: 3, desc: '死亡時 HP 保留 10%（每級，每局一次）' },
    organMemory:         { id: 'organMemory',         name: '記憶器官', maxLevel: 3, desc: '死亡保留器官數（預設0個；Lv1=1，Lv2=2，Lv3=3）' },
    luckyReroll:         { id: 'luckyReroll',         name: '幸運重選', maxLevel: 3, desc: '器官選擇時可重新隨機（每級1次）' },
    collectionAddiction: { id: 'collectionAddiction', name: '收集成癮', maxLevel: 3, desc: '收集範圍+10px（果子、屍體和白骨，每級）' },
    terribleFang:        { id: 'terribleFang',        name: '恐怖之牙', maxLevel: 5, desc: '攻擊+2（每級）；Lv3=開局獠牙Lv1；Lv5=開局獠牙Lv2' }
};
