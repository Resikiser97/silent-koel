// =============================================================
// 遊戲狀態 - DEFAULT_SETTINGS / gameState / Canvas / MAP 常數
// =============================================================

export const DEFAULT_SETTINGS = {
    language: 'zh-TW',
    volume: { master: 80, music: 70, sfx: 80, masterOn: true, musicOn: true, sfxOn: true },
    keys:   { up: 'w', down: 's', left: 'a', right: 'd', attack: ' ', dash: 'f' },
    deviceMode: null,
    autoAttack: false,
    showOrganTooltip: true,  // 手機版器官提示開關（桌機版不使用）
    alwaysCenter: false,     // 角色永遠固定於畫面正中央（預設關閉）
    minimapFade: false,      // 移動時小地圖漸漸淡化（預設關閉）
    minimapSize: 8,          // 小地圖大小（0=關閉，1~10格）
    fontBoldLarge: false,    // 字大又粗（canvas 字型 +7px + bold）
    cameraMode: 'smart',     // 視野模式：'smart'（智能）/ 'manual'（手動）
    cameraZoomLevel: 10,     // 視野縮放刻度（1~10，決定 baseZoom）
};

export const gameState = {
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
        tenacity: 0,          // 韌性（0~1），由魚鱗器官疊加；減少玩家被控制的持續時間
        dashCooldown: 0,
        dashInvincible: false,
        dashInvincibleEnd: 0,
        lastMoveDir: { dx: 0, dy: -1 },
        // ── 阿奇爾專用欄位
        reloadCharges:    0,      // 當前充能格數（0~3）
        reloadTimer:      0,      // 距離下次充能的計時（ms）
        chargeHolding:    false,  // 是否正在蓄力（手動模式按住中）
        chargeHoldTime:   0,      // 已按住的時間（ms）
        chargeConsumed:   0,      // 本次蓄力已消耗的格數
        archerDashActive: false,  // F技衝刺是否生效中
        archerDashEnd:    0,      // F技結束時間戳
        archerDashSpeed:  0,      // F技附加速度
        isRanged:         false,  // 遠程攻擊旗標（由 _applyCharacterStats 設定）
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
    devShowHP: false,
    devShowAI: false,
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
    dayNightMessage: { text: '', timer: 0, prefixText: null, speciesText: null, speciesColor: null },
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
    sessionStats: { giantKills: 0, killerKills: 0, killerMaxLevel: 0, fruitsEaten: 0, normalKills: 0 },
    sessionSkillPoints: { elite: 0, boss: 0 },
    eliteCreature: null,
    eliteJustKilled: false,
    eliteOrder: [],
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
    mutationSkillPoints: 0,     // 可用變異技能點（每 50 總變異等級 +1）
    mutationSkills: null,       // 由 initMutationSkills() 初始化（跨局永久保存）
    tutorialOpen: false,        // 新手教學是否開啟（暫停遊戲邏輯）
    tutorialOrganPhase: false,  // 戰鬥教學：器官鎖定中（只能選攻擊器官）
    tutorialCombatActive: false,// 戰鬥教學：木樁存活中
    tutorialStump: null,        // 教學木樁物件
    spawnProtectUntil: 0,       // 出生保護：此時間戳前不補充生成肉食怪
    dashEffect: null,           // 閃現特效狀態（{ ax,ay,bx,by,startTime,duration }）
    projectiles:  [],           // 子彈陣列（阿奇爾射水）
    floatTexts:   [],           // Canvas 批次浮動文字陣列
    mouseWorld:   { x: 0, y: 0 }, // 滑鼠世界座標（保留相容性，勿刪）
    mouseScreen:  { sx: 0, sy: 0 }, // 滑鼠 canvas 螢幕座標（攻擊方向計算用，不受玩家移動影響）
    cameraZoom: 1.0,           // 手機視野縮放（體型增加時自動縮小；桌機固定1.0）
    selectedCharacter: 'koel', // 當前選擇的角色 ID（由 showMapSelect 寫入，initializeGame 套用）
    settings: JSON.parse(JSON.stringify(DEFAULT_SETTINGS))
};

// =============================================================
// 畫布
// =============================================================
export const canvas = document.getElementById('gameCanvas');
export const ctx    = canvas.getContext('2d');
