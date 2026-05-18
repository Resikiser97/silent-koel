// =============================================================
// 日夜循環系統 - getDayNightPhaseIndex / applyNightTransition
//               applyDayTransition / updateDayNightCycle / showGameOver
// =============================================================

function getDayNightPhaseIndex() {
    // 每 75 秒一個時段，共 8 段；偶數=白天，奇數=夜晚
    return Math.min(7, Math.floor(Math.max(0, 600 - gameState.timeRemaining) / 75));
}

function applyNightTransition() {
    gameState.stats.dayCycle = t('phaseNight');
    gameState.isNight = true;
    gameState.dayNightMessage.text = t('nightCome');
    gameState.dayNightMessage.timer = Date.now();
    for (const c of gameState.hostileCreatures) {
        if (c.hp > 0) { c.speed += 0.2; c.damage += 2; }
    }
    const nightNum = (gameState.currentPhaseIndex + 1) / 2;
    if (nightNum >= 1 && nightNum <= 3 && !gameState.eliteCreature) {
        spawnEliteCreature(nightNum);
        AudioManager.playMusic('bossTheme');
    } else {
        AudioManager.playMusic('morningTheme');
    }
}

function applyDayTransition() {
    gameState.stats.dayCycle = t('phaseDay');
    gameState.isNight = false;
    if (gameState.eliteCreature && gameState.eliteCreature.hp > 0) {
        gameState.eliteCreature = null;
        gameState.dayNightMessage.text = t('morningEliteGone');
    } else {
        gameState.dayNightMessage.text = t('morningCome');
    }
    gameState.dayNightMessage.timer = Date.now();
    for (const c of gameState.hostileCreatures) {
        if (c.hp > 0) { c.speed = Math.max(0.1, c.speed - 0.2); c.damage = Math.max(1, c.damage - 2); }
    }
    AudioManager.playMusic('morningTheme');
}

function updateDayNightCycle() {
    const phaseIndex = getDayNightPhaseIndex();
    if (phaseIndex === gameState.currentPhaseIndex) return;
    gameState.currentPhaseIndex = phaseIndex;
    if (phaseIndex % 2 === 1) {
        applyNightTransition();
    } else {
        applyDayTransition();
    }
    if (phaseIndex === 7 && !gameState.bossSpawned) spawnBoss();
}

function showGameOver() {
    gameState.gameOver = true;
    showScoreSubmitPopup(false, null, () => {
        let overlay = document.getElementById('game-over-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'game-over-overlay';
            overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.75);display:flex;flex-direction:column;align-items:center;justify-content:center;color:white;font-size:32px;z-index:100;pointer-events:all;';
            overlay.innerHTML = '<div style="font-size:48px;margin-bottom:16px;">' + t('gameOverTitle') + '</div>' +
                '<div style="font-size:20px;margin-bottom:8px;">' + t('timeUp') + '</div>' +
                '<div style="font-size:18px;margin-bottom:24px;">' + t('finalXP', { xp: gameState.stats.xpCurrent }) + '</div>' +
                '<button onclick="location.reload()" style="font-size:20px;padding:10px 28px;cursor:pointer;pointer-events:all;">' + t('restart') + '</button>' +
                '<div style="font-size:12px;color:#555;margin-top:20px;">© ' + GAME_INFO.author + ' | ' + GAME_INFO.version + '</div>';
            document.getElementById('game-container').appendChild(overlay);
        }
    });
}
