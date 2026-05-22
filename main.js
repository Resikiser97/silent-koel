// =============================================================
// 主程式入口 - isGamePaused / gameLoop / initializeGame
// =============================================================

const FIXED_FPS = 60;
const FIXED_DELTA = 1000 / FIXED_FPS;
let accumulator = 0;
let lastTimestamp = 0;
let _wasPaused = false;

function pausePlayTimer() {
    if (gameState._playTimerStart !== null) {
        gameState.realPlayTime += Date.now() - gameState._playTimerStart;
        gameState._playTimerStart = null;
    }
    gameState._playTimerPaused = true;
}

function resumePlayTimer() {
    gameState._playTimerStart = Date.now();
    gameState._playTimerPaused = false;
}

function isGamePaused() {
    return gameState.organSelectionActive || gameState.settingsOpen || gameState.skillTreeOpen ||
           gameState.gameOver || gameState.victory || gameState.mutationPanelOpen ||
           gameState.tutorialOpen;
}

function updateGameLogic() {
    updateTimer();
    updateDayNightCycle();
    updateCreatureSpawning();
    updatePlayerMovement();
    updateCamera();
    checkFruitCollision();
    updateTreeFruitProduction(FIXED_DELTA);
    updateNeutralCreatures();
    updateHostileCreatures();
    if (gameState.boss && gameState.boss.hp > 0) updateBoss();
    if (gameState.eliteCreature && gameState.eliteCreature.hp > 0) updateEliteCreature();
    updatePassiveOrgans();
    updateStatusEffects();
    checkTreasureCollision();
    updateCorpseEating();
    updateBoneEating();
    updateMinimapFog();

    if (gameState.settings.autoAttack &&
        !_joyPaused() &&
        gameState.player.organs.some(o => ORGANS[o.id] && ORGANS[o.id].type === 'attack')) {
        playerAttack();
    }
}

function gameLoop(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const elapsed = Math.min(timestamp - lastTimestamp, 100); // 最大100ms防止跳幀
    lastTimestamp = timestamp;
    accumulator += elapsed;

    const paused = isGamePaused();
    if (paused && !_wasPaused) pausePlayTimer();
    else if (!paused && _wasPaused) resumePlayTimer();
    _wasPaused = paused;

    while (accumulator >= FIXED_DELTA) {
        if (!paused) {
            updateGameLogic();
        }
        accumulator -= FIXED_DELTA;
    }

    drawGame();
    updateUI();
    requestAnimationFrame(gameLoop);
}

function initializeGame() {
    localStorage.setItem('hasPlayedBefore', 'true');

    // ── 完整重置遊戲狀態（確保「再來一場」直接呼叫時不殘留舊資料）──
    gameState.gameOver            = false;
    gameState.skillTreeOpen       = false;
    gameState.victory             = false;
    gameState.organSelectionActive = false;
    gameState.pendingOrganSelections = 0;
    gameState.keys                = {};
    gameState.mobileInput         = { dx: 0, dy: 0 };
    gameState.eliteCreature       = null;
    gameState.alphaCreature       = null;
    gameState.topBarTarget        = null;
    gameState.topBarFadeTimer     = 0;
    gameState.boss                = null;
    gameState.bossSpawned         = false;
    gameState.bossBellPlayed      = false;
    gameState.eliteJustKilled     = false;
    gameState.isNight             = false;
    gameState.currentPhaseIndex   = 0;
    gameState.timeRemaining       = 600;
    gameState.creatureStrengthMultiplier = 0;
    gameState.realPlayTime        = 0;
    gameState._playTimerStart     = null;
    gameState._playTimerPaused    = false;
    gameState.dayNightMessage     = { text: '', timer: 0 };
    gameState.levelUpMessage      = { text: '', timer: 0 };
    gameState.sessionSkillPoints  = { elite: 0, boss: 0 };
    gameState.neutralCreatures    = [];
    gameState.hostileCreatures    = [];
    gameState.camera              = { x: 3200, y: 3550 };
    gameState.xpThreshold        = 100;
    // 重置玩家到基礎狀態（保留 player.x/y 會在 spawn 時覆蓋）
    Object.assign(gameState.player, {
        x: 4000, y: 4000, radius: 10, speed: 4.5, color: 'black',
        organs: [], hiddenOrgans: [], organSlots: 5, organSlotsUsed: 0, nextEvolutionAt: 5, rerollsRemaining: 0,
        attack: 0, attackSpeed: 1.0, attackRange: 50,
        critChance: 0, critMultiplier: 1.5,
        damageReduction: 0, thornDamage: 0, thornPlayerAtkReflect: false,
        brainActive: false, brainTimer: 0, brainInterval: 5000, brainRange: 100, brainDmg: 8,
        pickupRange: 0, aggroRangeReduction: 0, perceptionRange: 0,
        naturalRegenHp: 0, naturalRegenHpMaxPercent: 0, naturalRegenInterval: 10000, naturalRegenTimer: 0,
        comboCrabPoison: false, comboShellArmor: false, comboBrainEye: false,
        comboSkinRegen: false, comboEyeFang: false, comboCrabGloves: false,
        attackTimer: 0, attackVisual: 0,
        boneMaterial: 0,
        level: 1, levelXP: 0, tenacityUsed: false,
        evolution: { herbivore: 1, carnivore: 0, omnivore: 0, active: 'herbivore' }
    });
    gameState.stats = { hpMax: 50, hpCurrent: 50, xpCurrent: 0, timeStatus: '20:00', dayCycle: '白天' };

    gameState.mutationPanelOpen    = false;
    gameState.tutorialOpen         = false;
    gameState.tutorialOrganPhase   = false;
    gameState.tutorialCombatActive = false;
    gameState.tutorialStump        = null;
    // mutationData 不重置（跨局永久保存，由 window.onload 的 initMutationData 管理）

    gameState.gameStarted = true;
    console.log("--- 遊戲初始化開始 ---");

    // 1. 設定地圖種子並生成 Noise 地形
    gameState.mapSeed = Math.random() * 65536;
    generateTerrain();

    // 1b. 初始化迷霧地圖（400×400，全部遮蓋）
    const _fogCols = MAP_WIDTH  / TILE_SIZE;
    const _fogRows = MAP_HEIGHT / TILE_SIZE;
    gameState.fogMap = Array.from({length: _fogRows}, () => new Array(_fogCols).fill(true));

    // 2. 生成環境
    generateTrees(150);

    // 3. 初始化果子：從各棵樹分散生成共 80 顆
    gameState.fruits = [];
    const shuffledTrees = gameState.trees.slice().sort(() => Math.random() - 0.5);
    for (const tree of shuffledTrees) {
        if (gameState.fruits.length >= 80) break;
        spawnFruitFromTree(tree);
    }

    // 4+5. 生成生態生物（草系＋肉系）並初始化屍體、骨骼、寶物陣列
    gameState.corpses = [];
    gameState.bones   = [];
    gameState.treasures = [];
    spawnBiomeCreatures();

    // 6. 設定事件監聽器
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('click', function(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const mx = (e.clientX - rect.left) * scaleX;
        const my = (e.clientY - rect.top)  * scaleY;
        // 圖鑑按鈕點擊
        if (_compendiumBtnRegion &&
            mx >= _compendiumBtnRegion.x && mx <= _compendiumBtnRegion.x + _compendiumBtnRegion.w &&
            my >= _compendiumBtnRegion.y && my <= _compendiumBtnRegion.y + _compendiumBtnRegion.h) {
            showCompendium('organs');
            return;
        }
        if (!gameState.organSelectionActive && !gameState.settingsOpen) playerAttack();
    });
    canvas.addEventListener('mousemove', function(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const mx = (e.clientX - rect.left) * scaleX;
        const my = (e.clientY - rect.top)  * scaleY;
        // 器官提示開關關閉時，直接隱藏並返回
        if (!gameState.settings.showOrganTooltip) { hideTooltip(); return; }
        for (const r of _organHitRegions) {
            if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
                const d = Object.assign({}, r.data);
                if (d.organId) d.combo = getComboHint(d.organId);
                showTooltip(d, e.clientX, e.clientY);
                return;
            }
        }
        hideTooltip();
    });
    canvas.addEventListener('mouseleave', hideTooltip);

    // 存檔版本檢查：版本不一致時清除所有存檔
    const SAVE_KEYS = ['playerSkills', 'skillPoints', 'savedOrgans', 'savedHiddenOrgans'];
    const storedSaveVer = localStorage.getItem('saveVersion');
    if (storedSaveVer !== GAME_INFO.SAVE_VERSION) {
        SAVE_KEYS.forEach(k => localStorage.removeItem(k));
        localStorage.setItem('saveVersion', GAME_INFO.SAVE_VERSION);
        console.log('--- 存檔版本不一致，已清除所有存檔（' + storedSaveVer + ' → ' + GAME_INFO.SAVE_VERSION + '）---');
    }

    // 7. 載入設定（音量、按鍵）
    loadSettings();

    // 8. 載入技能與進化資料並套用起始加成
    try {
        const savedSkills = localStorage.getItem('playerSkills');
        if (savedSkills) gameState.playerSkills = JSON.parse(savedSkills);
        const savedPoints = localStorage.getItem('skillPoints');
        if (savedPoints) gameState.skillPoints = Math.max(0, parseInt(savedPoints, 10) || 0);
    } catch(e) {}
    applySkillBonuses();
    applyEvolutionEffects();
    applyAllMutationBonuses(); // 套用變異器官 Final 值加成（一次性，在所有器官效果之後）

    // 9. 初始化計時狀態
    gameState.devModeUsed = false;
    gameState.lastTimeTick = Date.now();
    gameState.spawnTimers.neutral = Date.now();
    gameState.spawnTimers.hostile = Date.now();

    // 10. 初始化音效系統並播放背景音樂
    initAudio();

    updateUI();

    console.log("--- 初始化完成，啟動遊戲循環 ---");

    // 11. 啟動真實遊玩時間計時並開始遊戲主循環
    resumePlayTimer();
    requestAnimationFrame(gameLoop);

    // 12. 新手教學：首次遊玩自動觸發
    if (!localStorage.getItem('tutorialCompleted')) {
        showTutorial();
    }
}

window.onload = () => {
    // 先載入變異資料（獨立於遊戲存檔版本）
    initMutationData();

    if (sessionStorage.getItem('autostart')) {
        sessionStorage.removeItem('autostart');
        initializeGame();
        return;
    }
    if (!localStorage.getItem('hasPlayedBefore')) {
        showStartScreen();
        setTimeout(() => showGuideStory(), 300);
    } else {
        showStartScreen();
    }
};
