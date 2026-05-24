// =============================================================
// 遊戲狀態 - DEFAULT_SETTINGS / gameState / Canvas / MAP 常數
// =============================================================

const DEFAULT_SETTINGS = {
    language: 'zh-TW',
    volume: { master: 80, music: 70, sfx: 80, masterOn: true, musicOn: true, sfxOn: true },
    keys:   { up: 'w', down: 's', left: 'a', right: 'd', attack: ' ' },
    deviceMode: null,
    autoAttack: false,
    showOrganTooltip: true,  // 手機版器官提示開關（桌機版不使用）
};

const gameState = {
    canvasWidth: 1600,
    canvasHeight: 900,

    player: {
        x: 4000, y: 4000, radius: 10, speed: 4.5, color: 'black',
        organs: [], hiddenOrgans: [], organSlots: 5, organSlotsUsed: 0, nextEvolutionAt: 5, rerollsRemaining: 0,
        attack: 0, attackSpeed: 1.0, attackSpeedBonus: 0, attackRange: 50,
        critChance: 0, critMultiplier: 1.5,
        damageReduction: 0, thornDamage: 0, thornPlayerAtkReflect: false,
        brainActive: false, brainTimer: 0, brainInterval: 5000, brainRange: 100, brainDmg: 8,
        pickupRange: 0, aggroRangeReduction: 0, perceptionRange: 0,
        naturalRegenHp: 0, naturalRegenHpMaxPercent: 0, naturalRegenInterval: 10000, naturalRegenTimer: 0,
        comboCrabPoison: false, comboCrabGloves: false, comboShellArmor: false, comboBrainEye: false,
        comboSkinRegen: false, comboEyeFang: false,
        attackTimer: 0, attackVisual: 0,
        boneMaterial: 0,
        level: 1, levelXP: 0, tenacityUsed: false,
        evolution: { herbivore: 1, carnivore: 0, omnivore: 0, active: 'herbivore' },
        dashCooldown: 0,
        dashInvincible: false,
        dashInvincibleEnd: 0,
        lastMoveDir: { dx: 0, dy: -1 }
    },

    trees: [],
    fruits: [],
    neutralCreatures: [],
    hostileCreatures: [],
    corpses: [],
    bones: [],
    brainShockwaves: [],

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
    spawnTimers: {
        forest_herb: 0, forest_carn: 0,
        ocean_herb:  0, ocean_carn:  0,
        desert_herb: 0, desert_carn: 0,
    },
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
    sessionStats: { giantKills: 0, killerKills: 0, killerMaxLevel: 0 },
    sessionSkillPoints: { elite: 0, boss: 0 },
    eliteCreature: null,
    eliteJustKilled: false,
    alphaCreature: null,
    topBarTarget: null,
    topBarFadeTimer: 0,
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
    realPlayTime: 0,
    _playTimerStart: null,
    _playTimerPaused: false,
    mutationData: null,         // 由 initMutationData() 初始化（跨局永久保存）
    mutationPanelOpen: false,   // 變異面板是否開啟
    tutorialOpen: false,        // 新手教學是否開啟（暫停遊戲邏輯）
    tutorialOrganPhase: false,  // 戰鬥教學：器官鎖定中（只能選攻擊器官）
    tutorialCombatActive: false,// 戰鬥教學：木樁存活中
    tutorialStump: null,        // 教學木樁物件
    settings: JSON.parse(JSON.stringify(DEFAULT_SETTINGS))
};

// =============================================================
// 畫布
// =============================================================
const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');
