// =============================================================
// 生物數值設定 - CREATURE_CONFIG / ELITE_CONFIG / BOSS_CONFIG
// ✦ 名稱與標籤為中文預設；切換語言時由 lang.js applyLanguage() 覆寫
// =============================================================

const CREATURE_CONFIG = {
    hostile: {
        maxSpeed:  7.5,
        maxDamage: 20,
    },
    spawnInterval: {
        neutral: 30000,
        hostile: 45000,
    }
};

const ELITE_CONFIG = {
    base: { hp: 50, speed: 1.0, damage: 8 },
    nights: [
        { hpMult: 5,   speed: 3.9, damage: 12, xp: 150, label: '★精英',   color: '#5B0EA6' },
        { hpMult: 7.5, speed: 4.5, damage: 15, xp: 225, label: '★★精英',  color: '#8B0000' },
        { hpMult: 10,  speed: 5.1, damage: 18, xp: 300, label: '★★★精英', color: '#1A0A00' }
    ]
};

// =============================================================
// 生態生物種類（v0.36.0）
// 每個生態區各有一種草系（herbivore）和一種肉系（carnivore）
// =============================================================
const BIOME_CREATURES = {
    forest: {
        herbivore: { id: 'moose',  name: '駝鹿',     nameEn: 'Moose'         },
        carnivore: { id: 'lynx',   name: '猞猁',     nameEn: 'Lynx'          },
    },
    ocean: {
        herbivore: { id: 'beetle', name: '巨型甲虫', nameEn: 'Giant Beetle'  },
        carnivore: { id: 'croc',   name: '鱷魚',     nameEn: 'Crocodile'     },
    },
    desert: {
        herbivore: { id: 'camel',  name: '駱駝',     nameEn: 'Camel'         },
        carnivore: { id: 'hyena',  name: '鬣狗',     nameEn: 'Hyena'         },
    },
};

const BOSS_CONFIG = {
    forest: {
        name: '黑熊',    label: '⚠️黑熊',
        radius: 25, hp: 500,  speed: 3.0, damage: 15, aggroRange: 99999, attackRange: 30,
        color: '#3B1E08', colorChasing: '#2A0D00', glowColor: '#8B4513',
        spawnX: null, spawnY: null
    },
    ocean: {
        name: '大白鯊',  label: '🦈大白鯊',
        radius: 30, hp: 600,  speed: 3.9, damage: 18, aggroRange: 99999, attackRange: 35,
        color: '#003388', colorChasing: '#001A44', glowColor: '#1a3a5c',
        spawnX: 6500, spawnY: 6500
    },
    desert: {
        name: '沙漠蠍王', label: '🦂蠍王',
        radius: 28, hp: 550,  speed: 3.6, damage: 20, aggroRange: 99999, attackRange: 32,
        color: '#8B7355', colorChasing: '#5C4A2A', glowColor: '#8B6914',
        spawnX: 2000, spawnY: 2000
    }
};
