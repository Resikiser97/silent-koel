// =============================================================
// 主程式入口 - isGamePaused / gameLoop / initializeGame
// =============================================================

const FIXED_FPS = 60;
const FIXED_DELTA = 1000 / FIXED_FPS;
let accumulator = 0;
let lastTimestamp = 0;

function isGamePaused() {
    return gameState.organSelectionActive || gameState.settingsOpen || gameState.skillTreeOpen || gameState.gameOver || gameState.victory;
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
    updateMinimapFog();
}

function gameLoop(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const elapsed = Math.min(timestamp - lastTimestamp, 100); // 最大100ms防止跳幀
    lastTimestamp = timestamp;
    accumulator += elapsed;

    while (accumulator >= FIXED_DELTA) {
        if (!isGamePaused()) {
            updateGameLogic();
        }
        accumulator -= FIXED_DELTA;
    }

    drawGame();
    updateUI();
    requestAnimationFrame(gameLoop);
}

function initializeGame() {
    gameState.gameStarted = true;
    gameState.playAgainWarned = false;
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

    // 4. 生成中立生物
    spawnNeutralCreatures();

    // 5. 生成敵意生物與初始化屍體、寶物陣列
    gameState.corpses = [];
    gameState.treasures = [];
    spawnHostileCreatures();

    // 6. 設定事件監聽器
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('click', function() {
        if (!gameState.organSelectionActive && !gameState.settingsOpen) playerAttack();
    });
    canvas.addEventListener('mousemove', function(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const mx = (e.clientX - rect.left) * scaleX;
        const my = (e.clientY - rect.top)  * scaleY;
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

    // 9. 初始化計時狀態
    gameState.devModeUsed = false;
    gameState.lastTimeTick = Date.now();
    gameState.spawnTimers.neutral = Date.now();
    gameState.spawnTimers.hostile = Date.now();

    // 10. 初始化音效系統並播放背景音樂
    initAudio();

    updateUI();

    console.log("--- 初始化完成，啟動遊戲循環 ---");

    // 11. 開始遊戲主循環
    requestAnimationFrame(gameLoop);
}

window.onload = showStartScreen;
