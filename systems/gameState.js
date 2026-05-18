// =============================================================
// 遊戲狀態 - DEFAULT_SETTINGS / gameState / Canvas / MAP 常數
// =============================================================

const DEFAULT_SETTINGS = {
    language: 'zh-TW',
    volume: { master: 80, music: 70, sfx: 80, masterOn: true, musicOn: true, sfxOn: true },
    keys:   { up: 'w', down: 's', left: 'a', right: 'd', attack: ' ' },
    deviceMode: null
};

const gameState = {
    canvasWidth: 1600,
    canvasHeight: 900,

    player: {
        x: 4000, y: 4000, radius: 10, speed: 4.5, color: 'black',
        organs: [], hiddenOrgans: [], organSlots: 5, organSlotsUsed: 0, nextEvolutionAt: 5, rerollsRemaining: 0,
        attack: 0, attackSpeed: 1.0, attackRange: 50,
        critChance: 0, critMultiplier: 1.0,
        damageReduction: 0, thornDamage: 0, thornPlayerAtkReflect: false,
        brainActive: false, brainTimer: 0, brainInterval: 5000, brainRange: 100, brainDmg: 8,
        pickupRange: 0, aggroRangeReduction: 0,
        naturalRegenHp: 0, naturalRegenInterval: 10000, naturalRegenTimer: 0,
        comboCrabPoison: false, comboShellArmor: false, comboBrainEye: false,
        comboSkinRegen: false, comboEyeFang: false,
        attackTimer: 0, attackVisual: 0,
        level: 1, levelXP: 0, tenacityUsed: false,
        evolution: { herbivore: 1, carnivore: 0, omnivore: 0, active: 'herbivore' }
    },

    trees: [],
    fruits: [],
    neutralCreatures: [],
    hostileCreatures: [],
    corpses: [],

    stats: {
        hpMax: 50,
        hpCurrent: 50,
        xpCurrent: 0,
        timeStatus: "20:00",
        dayCycle: "白天"
    },

    keys: {
        w: false, a: false, s: false, d: false
    },
    xpThreshold: 100,
    organSelectionActive: false,
    pendingOrganSelections: 0,
    treasures: [],
    devInput: '',
    devMode: false,
    devModeUsed: false,
    timeRemaining: 600,
    lastTimeTick: 0,
    gameOver: false,
    spawnTimers: { neutral: 0, hostile: 0 },
    creatureStrengthMultiplier: 0,
    isNight: false,
    currentPhaseIndex: 0,
    dayNightMessage: { text: '', timer: 0 },
    levelUpMessage: { text: '', timer: 0 },
    skillPoints: 0,
    playerSkills: { vitality: 0, agility: 0, forager: 0, hunter: 0, tenacity: 0, organMemory: 0, luckyReroll: 0, collectionAddiction: 0, terribleFang: 0 },
    mapSeed: 0,
    terrainMap: null,
    fogMap: null,
    currentMap: null,
    boss: null,
    bossSpawned: false,
    bossBellPlayed: false,
    eliteCreature: null,
    eliteJustKilled: false,
    camera: { x: 3200, y: 3550 },
    lastLoopTime: 0,
    settingsOpen: false,
    skillTreeOpen: false,
    victory: false,
    _rebindTarget: null,
    language: 'zh-TW',
    isMobile: false,
    forceMode: null,
    orientation: 'landscape',
    mobileInput: { dx: 0, dy: 0 },
    gameStarted: false,
    lastDifficulty: 'easy',
    playAgainWarned: false,
    homeWarned: false,
    settings: JSON.parse(JSON.stringify(DEFAULT_SETTINGS))
};

// =============================================================
// 畫布
// =============================================================
const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');
