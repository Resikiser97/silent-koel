// =============================================================
// 主程式入口 - isGamePaused / updateGameLogic / gameLoop
//             initializeGame / startGameWithLoading
//             pausePlayTimer / resumePlayTimer 由 gameFlow.js re-export
// =============================================================

import { GAME_INFO } from './config/gameConfig.js';
import './lang/zh-TW.js';
import './lang/en.js';
import { CHARACTERS } from './config/characters.js';
import { ORGANS } from './config/organs.js';
import { EASY_MAP } from './map/easymap.js';
import { NORMAL_MAP } from './map/normalmap.js';
import { HARD_MAP } from './map/hardmap.js';
import { gameState, canvas } from './systems/gameState.js';
import { MAP_WIDTH, MAP_HEIGHT, TILE_SIZE, generateTerrain, generateTrees } from './systems/map.js';
import { updateCamera, _updateCameraZoom } from './systems/camera.js';
import { handleKeyDown, handleKeyUp, _updateMouseWorld } from './systems/input.js';
import { initAudio, stopIntroTheme, AudioManager } from './systems/audio.js';
import { _joyPaused } from './systems/mobile.js';
import { spawnBiomeCreatures, spawnFruitFromTree, updateCreatureSpawning } from './systems/spawning.js';
import { updatePlayerMovement, checkFruitCollision, updateTreeFruitProduction, checkTreasureCollision, updatePassiveOrgans, updateProjectiles, _getArcherShootDir, _archerAttack } from './systems/player.js';
import { updateStatusEffects, updateCorpseEating, updateBoneEating, playerAttack, setRangedAttackCallback } from './systems/combat.js';
import { applyOrganEffects, getComboHint, _organHitRegions, _compendiumBtnRegion, showOrganSelection } from './systems/organs.js';
import { applyEvolutionEffects, applySkillBonuses, loadSavedOrgans, showSkillTree } from './systems/evolution.js';
import { initMutationData, applyAllMutationBonuses } from './systems/mutation.js';
import { resetPackNames, resetHyenaPackNames, updateNeutralCreatures, updateHostileCreatures } from './systems/creatures.js';
import { initEliteOrder, updateEliteCreature } from './systems/elite.js';
import { updateBoss, handleBossKill } from './systems/boss.js';
import { updateDayNightCycle } from './systems/daynight.js';
import { updateMinimapFog, drawGame, updateUI } from './systems/hud.js';
import {
    loadSettings,
    updateTimer,
    showCompendium,
    showSplashScreen,
    showGuideStory,
    showTooltip,
    hideTooltip,
    devAddXP,
    devAddHP,
    devFullHP,
    devSpawnFruits,
    devKillHostiles,
    devSpawnNeutral,
    devSpawnHostile,
    devFastForward,
    devRewind,
    devToggleDayNight,
    devToggleHP,
    devToggleAI
} from './systems/ui.js';
import { showTutorial } from './systems/tutorial.js';
import { disconnectChat, hideChat } from './systems/chat.js';
import { resetSessionStats } from './stats/index.js';
import {
    STORAGE_KEYS,
    storageGet,
    storageSet,
    storageRemove,
    storageGetJSON,
    storageSetJSON
} from './storage/index.js';

const FIXED_FPS = 60;
const FIXED_DELTA = 1000 / FIXED_FPS;
let accumulator = 0;
let lastTimestamp = 0;
let _wasPaused = false;
let _loadingStartPromise = null;

window.devAddXP = devAddXP;
window.devAddHP = devAddHP;
window.devFullHP = devFullHP;
window.devSpawnFruits = devSpawnFruits;
window.devKillHostiles = devKillHostiles;
window.devSpawnNeutral = devSpawnNeutral;
window.devSpawnHostile = devSpawnHostile;
window.devFastForward = devFastForward;
window.devRewind = devRewind;
window.devToggleDayNight = devToggleDayNight;
window.devToggleHP = devToggleHP;
window.devToggleAI = devToggleAI;

import { pausePlayTimer, resumePlayTimer } from './systems/gameFlow.js';
export { pausePlayTimer, resumePlayTimer };

export function isGamePaused() {
    return gameState.organSelectionActive || gameState.settingsOpen || gameState.skillTreeOpen ||
           gameState.gameOver || gameState.victory || gameState.mutationPanelOpen ||
           gameState.tutorialOpen;
}

export function updateGameLogic() {
    const _t0 = gameState.devMode ? performance.now() : 0;

    updateTimer();
    updateDayNightCycle();
    updateCreatureSpawning();
    updatePlayerMovement();
    updateCamera();
    _updateCameraZoom();  // 視野縮放（智能/手動模式，依 cameraZoomLevel 計算）
    const _t1 = gameState.devMode ? performance.now() : 0;

    checkFruitCollision();
    const _t2 = gameState.devMode ? performance.now() : 0;

    updateTreeFruitProduction(FIXED_DELTA);
    const _t3 = gameState.devMode ? performance.now() : 0;

    updateNeutralCreatures();
    const _t4 = gameState.devMode ? performance.now() : 0;

    updateHostileCreatures();
    const _t5 = gameState.devMode ? performance.now() : 0;

    if (gameState.boss && gameState.boss.hp > 0) updateBoss();
    if (gameState.eliteCreature && gameState.eliteCreature.hp > 0) updateEliteCreature();
    updatePassiveOrgans();
    updateStatusEffects();
    checkTreasureCollision();
    updateCorpseEating();
    updateBoneEating();
    updateProjectiles();   // 阿奇爾子彈飛行 + 碰撞偵測
    updateMinimapFog();
    const _t6 = gameState.devMode ? performance.now() : 0;

    if (gameState.settings.autoAttack &&
        !_joyPaused() &&
        // 遠程角色（阿奇爾）不依賴器官型別判斷，直接允許自動攻擊
        // 近戰角色仍須裝備至少一個 attack 型器官才觸發
        (gameState.player.isRanged ||
         gameState.player.organs.some(o => ORGANS[o.id] && ORGANS[o.id].type === 'attack'))) {
        playerAttack();
    }

    if (gameState.devMode) {
        const _t7 = performance.now();
        const total = _t7 - _t0;
        if (total > 8) {
            console.log('[PERF] updateGameLogic ' + total.toFixed(1) + 'ms', {
                player:   (_t1-_t0).toFixed(1),
                fruit:    (_t2-_t1).toFixed(1),
                tree:     (_t3-_t2).toFixed(1),
                neutral:  (_t4-_t3).toFixed(1),
                hostile:  (_t5-_t4).toFixed(1),
                combat:   (_t6-_t5).toFixed(1),
                other:    (_t7-_t6).toFixed(1),
            });
        }
    }
}

export function gameLoop(timestamp) {
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

    if (gameState.devMode) {
        const td0 = performance.now();
        drawGame();
        const td1 = performance.now();
        const drawMs = td1 - td0;
        if (drawMs > 8) {
            console.log('[PERF] drawGame ' + drawMs.toFixed(1) + 'ms');
        }
        const tu0 = performance.now();
        updateUI();
        const tu1 = performance.now();
        const uiMs = tu1 - tu0;
        if (uiMs > 4) {
            console.log('[PERF] updateUI ' + uiMs.toFixed(1) + 'ms');
        }
    } else {
        drawGame();
        updateUI();
    }
    requestAnimationFrame(gameLoop);
}

function _createLoadingScreen() {
    const container = document.getElementById('game-container');
    if (!container) return null;
    const old = document.getElementById('loading-screen');
    if (old) old.remove();

    const el = document.createElement('div');
    el.id = 'loading-screen';
    el.style.cssText = [
        'position:absolute', 'top:0', 'left:0', 'width:100%', 'height:100%',
        'z-index:999', 'background:#000', 'color:#fff', 'pointer-events:all',
        'font-family:Arial,sans-serif', 'opacity:1', 'transition:opacity 0.4s'
    ].join(';');

    const title = document.createElement('div');
    title.textContent = '載入中...';
    title.style.cssText = [
        'position:absolute', 'top:50%', 'left:50%', 'transform:translate(-50%,-50%)',
        'font-size:24px', 'color:#fff'
    ].join(';');
    el.appendChild(title);

    const barOuter = document.createElement('div');
    barOuter.style.cssText = [
        'position:absolute', 'top:80%', 'left:10%', 'width:80%', 'height:6px',
        'background:#333', 'border-radius:3px', 'overflow:hidden'
    ].join(';');
    const barFill = document.createElement('div');
    barFill.style.cssText = 'width:0%;height:100%;background:#00CC44;border-radius:3px;';
    barOuter.appendChild(barFill);
    el.appendChild(barOuter);

    const percent = document.createElement('div');
    percent.textContent = '0%';
    percent.style.cssText = [
        'position:absolute', 'top:calc(80% + 14px)', 'left:0', 'width:100%',
        'text-align:center', 'font-size:14px', 'color:#00CC44'
    ].join(';');
    el.appendChild(percent);

    const version = document.createElement('div');
    version.textContent = GAME_INFO.version;
    version.style.cssText = 'position:absolute;left:12px;bottom:10px;font-size:12px;color:#888;';
    el.appendChild(version);

    const author = document.createElement('div');
    author.textContent = 'Goblinnest';
    author.style.cssText = 'position:absolute;right:12px;bottom:10px;font-size:12px;color:#888;';
    el.appendChild(author);

    container.appendChild(el);
    return { el, barFill, percent };
}

function _fadeOutLoadingScreen(loading) {
    if (!loading || !loading.el) return Promise.resolve();
    return new Promise(resolve => {
        const el = loading.el;
        const done = () => {
            el.removeEventListener('transitionend', done);
            el.remove();
            resolve();
        };
        el.addEventListener('transitionend', done);
        requestAnimationFrame(() => { el.style.opacity = '0'; });
        setTimeout(done, 500);
    });
}

export async function startGameWithLoading() {
    if (_loadingStartPromise) return _loadingStartPromise;
    _loadingStartPromise = (async () => {
        const loading = _createLoadingScreen();
        const updateProgress = (completed, total) => {
            const pct = total > 0 ? Math.round((completed / total) * 100) : 100;
            if (loading && loading.barFill) loading.barFill.style.width = pct + '%';
            if (loading && loading.percent) loading.percent.textContent = pct + '%';
        };

        updateProgress(0, 1);
        await AudioManager.preloadAllSfxBuffers(updateProgress);
        updateProgress(1, 1);
        await _fadeOutLoadingScreen(loading);
        initializeGame();
    })().finally(() => {
        _loadingStartPromise = null;
    });
    return _loadingStartPromise;
}

// =============================================================
// 角色初始屬性套用
// 在 Object.assign 重置玩家後、applySkillBonuses 前呼叫。
// 設定角色基礎值；startEvolution 只寫入等級（applyEvolutionEffects 由步驟8統一套用）。
// startOrgans 立即套用效果，確保在後續加成前生效。
// =============================================================
function _applyCharacterStats() {
    const charId = gameState.selectedCharacter || 'koel';
    const char   = (typeof CHARACTERS !== 'undefined' && CHARACTERS[charId])
        ? CHARACTERS[charId] : null;
    if (!char) return;

    const p = gameState.player;
    const s = gameState.stats;

    // ── 基礎數值（覆蓋 Object.assign 預設，技能/進化加成將疊加其上）
    s.hpMax          = char.stats.hp;
    s.hpCurrent      = char.stats.hp;
    p.speed          = char.stats.speed;
    p.radius         = char.stats.radius;
    p.attackRange    = char.stats.attackRange;
    p.critChance     = char.stats.critChance;
    p.critMultiplier = char.stats.critMult;
    p.pickupRange    = char.stats.pickupRange;
    p.attackTimer    = 0;
    p.isRanged       = char.isRanged || false;

    // ── 起始器官：推入並逐級套用累計效果（同 evolution.js 的 fang 處理邏輯）
    if (char.startOrgans && char.startOrgans.length > 0) {
        for (const o of char.startOrgans) {
            if (!p.organs.find(eo => eo.id === o.id)) {
                const def = (typeof ORGANS !== 'undefined') ? ORGANS[o.id] : null;
                const organObj = {
                    id:    o.id,
                    name:  def ? def.name : o.id,
                    type:  def ? def.type : 'attack',
                    level: 1,
                    desc:  (def && def.levels[0]) ? def.levels[0].desc : ''
                };
                p.organs.push(organObj);
                // 逐級套用：Lv1→Lv2→…→目標等級，確保累計效果完整
                for (let lv = 1; lv <= o.level; lv++) {
                    organObj.level = lv;
                    organObj.desc  = (def && def.levels[lv - 1]) ? def.levels[lv - 1].desc : '';
                    applyOrganEffects(organObj);
                }
            }
        }
    }

    // ── 起始進化：若指定，重置所有進化等級後套用；applyEvolutionEffects 將在步驟8讀取
    if (char.startEvolution) {
        p.evolution.herbivore = 0;
        p.evolution.carnivore = 0;
        p.evolution.omnivore  = 0;
        p.evolution[char.startEvolution.type] = char.startEvolution.level;
    }
    // 無 startEvolution 的角色（koel）維持 Object.assign 預設（herbivore:1）

    console.log('[角色系統] 套用角色：' + char.name + '（' + charId + '），HP=' + s.hpMax + '，Speed=' + p.speed);
}

export function initializeGame() {
    if (typeof resetUICache === 'function') resetUICache();
    if (typeof resetPerceptionCache === 'function') resetPerceptionCache();
    if (typeof resetTreeProductionTimer === 'function') resetTreeProductionTimer();
    if (typeof resetFogFrameCount === 'function') resetFogFrameCount();
    gameState.floatTexts = [];
    storageSet(STORAGE_KEYS.HAS_PLAYED_BEFORE, 'true');

    // 清除首頁公告標籤
    const _badge = document.getElementById('announce-badge');
    if (_badge) _badge.remove();
    // 停止首頁背景音樂
    if (typeof stopIntroTheme === 'function') stopIntroTheme();

    // 離開首頁時斷開聊天室並隱藏面板
    if (typeof disconnectChat === 'function') disconnectChat();
    if (typeof hideChat === 'function') hideChat();

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
    gameState.fruits              = [];
    gameState.corpses             = [];
    gameState.bones               = [];
    gameState.treasures           = [];
    gameState.brainShockwaves     = [];
    gameState.venomPuddles        = [];   // 蠍王定點毒霧陣列
    gameState.projectiles         = [];   // 阿奇爾子彈陣列
    gameState._mobileCharging     = false;
    gameState._mobileChargeStart  = null;
    gameState._mobileChargeAttack = false;
    gameState.neutralCreatures    = [];
    gameState.hostileCreatures    = [];
    gameState.camera              = { x: 3200, y: 3550 };
    gameState.xpThreshold        = 100;
    // 重置玩家到基礎狀態（保留 player.x/y 會在 spawn 時覆蓋）
    Object.assign(gameState.player, {
        x: 4000, y: 4000, radius: 10, speed: 4.5, color: 'black',
        organs: [], hiddenOrgans: [], organSlots: 5, organSlotsUsed: 0, nextEvolutionAt: 5, rerollsRemaining: 0,
        attack: 0, attackSpeed: 1.0, attackSpeedBonus: 0, attackRange: 50,
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
        evolution: { herbivore: 1, carnivore: 0, omnivore: 0, active: 'herbivore' },
        tenacity: 0,
        dashCooldown: 0,
        dashInvincible: false,
        dashInvincibleEnd: 0,
        lastMoveDir: { dx: 0, dy: -1 },
        poisonStacks: [],
        poisonLastTick: 0,
    });
    gameState.cameraZoom = 1.0;
    gameState.stats = { hpMax: 50, hpCurrent: 50, xpCurrent: 0, timeStatus: '20:00', dayCycle: '白天' };
    resetSessionStats();

    // ── 套用角色初始屬性（覆蓋上方 Object.assign / stats 預設值，在技能/進化加成前設定基礎值）
    _applyCharacterStats();

    // B1: 再來一局保留難度 — 若 currentMap 為 null（頁面重整後），從 localStorage 恢復
    if (!gameState.currentMap) {
        const savedDiff = storageGet(STORAGE_KEYS.LAST_DIFFICULTY) || 'easy';
        gameState.lastDifficulty = savedDiff;
        if (savedDiff === 'hard' && typeof HARD_MAP !== 'undefined') {
            gameState.currentMap = HARD_MAP;
        } else if (savedDiff === 'normal' && typeof NORMAL_MAP !== 'undefined') {
            gameState.currentMap = NORMAL_MAP;
        } else {
            gameState.currentMap = typeof EASY_MAP !== 'undefined' ? EASY_MAP : null;
        }
        console.log('[v0.47.0 B1] currentMap restored:', gameState.currentMap ? gameState.currentMap.name : 'null');
    }
    gameState.mapSeed = Math.random() * 65536;
    if (typeof initEliteOrder === 'function') initEliteOrder();

    gameState.spawnProtectUntil    = 0;
    if (typeof resetPackNames === 'function') resetPackNames();
    resetHyenaPackNames();
    gameState.mutationPanelOpen    = false;
    gameState.tutorialOpen         = false;
    gameState.tutorialOrganPhase   = false;
    gameState.tutorialCombatActive = false;
    gameState.tutorialStump        = null;
    if (typeof resetTutorial === 'function') resetTutorial();
    gameState.dashEffect           = null;
    // mutationData 不重置（跨局永久保存，由 window.onload 的 initMutationData 管理）

    gameState.gameStarted = true;
    console.log("--- 遊戲初始化開始 ---");
    console.log('[v0.47.0] B1+B8+二+三+四+五+六+七+八+九+十+十一+十二 全部套用');

    // 1. 使用已設定的地圖種子生成 Noise 地形
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
        // 阿奇爾手動模式：由 mousedown/mouseup 蓄力發射，click 事件不重複觸發
        if (gameState.player.isRanged && !gameState.settings.autoAttack) return;
        if (!gameState.organSelectionActive && !gameState.settingsOpen) playerAttack();
    });

    // 阿奇爾左鍵蓄力：mousedown 開始蓄力，mouseup 放開發射
    canvas.addEventListener('mousedown', function(e) {
        if (e.button !== 0) return;
        if (gameState.organSelectionActive || gameState.settingsOpen) return;
        const p = gameState.player;
        if (p.isRanged && !gameState.settings.autoAttack && !p.chargeHolding) {
            p.chargeHolding  = true;
            p.chargeHoldTime = 0;
            p.chargeConsumed = 0;
        }
    });
    canvas.addEventListener('mouseup', function(e) {
        if (e.button !== 0) return;
        const p = gameState.player;
        if (!p.isRanged || gameState.settings.autoAttack || !p.chargeHolding) return;
        p.chargeHolding = false;
        // 快速點擊（尚未累積格數）→ 消耗 1 格
        if (p.chargeConsumed === 0 && p.reloadCharges > 0) {
            p.reloadCharges--;
            p.reloadTimer   = 0;
            p.chargeConsumed = 1;
        }
        if (p.chargeConsumed > 0) {
            const dir = _getArcherShootDir();
            if (dir) {
                const dmg = Math.max(1, Math.round(p.attack * p.chargeConsumed));
                gameState.projectiles.push({
                    x: p.x, y: p.y,
                    vx: dir.dx * 9, vy: dir.dy * 9,
                    damage:       dmg,
                    maxRange:     p.attackRange * 1.2,
                    distTraveled: 0,
                    radius:       5,
                    ownerId:      'player',
                    hasCrit:      false,
                });
                p.attackVisual = Date.now();
                if (gameState.selectedCharacter === 'archerfish') {
                    const chargeLevel = p.chargeConsumed || 0;
                    const archerKey = chargeLevel >= 3 ? 'archerAttackCrit' : 'archerAttackNormal';
                    AudioManager.play(archerKey);
                } else {
                    AudioManager.play('attackNormal');
                }
            }
        }
        p.chargeConsumed = 0;
    });
    canvas.addEventListener('mousemove', function(e) {
        // 阿奇爾瞄準：更新滑鼠世界座標
        _updateMouseWorld(e.clientX, e.clientY);

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
    const SAVE_KEYS = [
        STORAGE_KEYS.PLAYER_SKILLS,
        STORAGE_KEYS.SKILL_POINTS,
        STORAGE_KEYS.SAVED_ORGANS,
        STORAGE_KEYS.SAVED_HIDDEN_ORGANS
    ];
    const storedSaveVer = storageGet(STORAGE_KEYS.SAVE_VERSION);
    if (storedSaveVer !== GAME_INFO.SAVE_VERSION) {
        SAVE_KEYS.forEach(k => storageRemove(k));
        storageSet(STORAGE_KEYS.SAVE_VERSION, GAME_INFO.SAVE_VERSION);
        console.log('--- 存檔版本不一致，已清除所有存檔（' + storedSaveVer + ' → ' + GAME_INFO.SAVE_VERSION + '）---');
    }

    // 7. 載入設定（音量、按鍵）
    loadSettings();

    // 8. 載入技能與進化資料並套用起始加成
    try {
        const savedSkills = storageGetJSON(STORAGE_KEYS.PLAYER_SKILLS);
        if (savedSkills) gameState.playerSkills = savedSkills;
        const savedPoints = storageGet(STORAGE_KEYS.SKILL_POINTS);
        if (savedPoints) gameState.skillPoints = Math.max(0, parseInt(savedPoints, 10) || 0);
    } catch(e) {}

    // ← 確保器官效果在技能加成之前套用，不依賴技能樹面板開啟
    loadSavedOrgans();

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
    if (!storageGet(STORAGE_KEYS.TUTORIAL_COMPLETED)) {
        showTutorial();
    }
}

window.onload = () => {
    // 注入阿奇爾遠程攻擊 callback，解除 combat.js ↔ player.js 直接 import
    setRangedAttackCallback(_archerAttack);

    window.addEventListener('startGame', () => {
        startGameWithLoading();
    });

    window.addEventListener('showSkillTree', (e) => {
        showSkillTree(e.detail?.mode || 'postGame');
    });

    window.addEventListener('levelUp', () => {
        showOrganSelection();
    });

    window.addEventListener('bossKilled', () => {
        handleBossKill(gameState.boss);
    });

    // ── 禁止 #game-container 內右鍵選單（補強 CSS user-select）
    const _gameContainer = document.getElementById('game-container');
    if (_gameContainer) {
        _gameContainer.addEventListener('contextmenu', e => e.preventDefault());
    }

    // ── 手機返回鍵 / 左滑返回攔截（全程維持同一個 history entry）
    history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', () => {
        history.pushState(null, '', window.location.href);
    });

    // 頁面載入時立即讀取已存設定（確保首頁音量/語言與 localStorage 一致）
    if (typeof loadSettings === 'function') loadSettings();

    // 先載入變異資料（獨立於遊戲存檔版本）
    initMutationData();

    if (sessionStorage.getItem('autostart')) {
        sessionStorage.removeItem('autostart');
        gameState.selectedCharacter = storageGet(STORAGE_KEYS.LAST_CHARACTER) || 'koel';
        startGameWithLoading();
        return;
    }
    if (!storageGet(STORAGE_KEYS.HAS_PLAYED_BEFORE)) {
        showSplashScreen();
        setTimeout(() => showGuideStory(), 300);
    } else {
        showSplashScreen();
    }
};
