// =============================================================
// 首領系統 - spawnBoss / updateBoss / showVictory / drawBossArrow
// =============================================================

function spawnBoss() {
    const playerBiome = getBiome(gameState.player.x, gameState.player.y);
    const cfg = BOSS_CONFIG[playerBiome] || BOSS_CONFIG.forest;
    let bx, by;
    if (cfg.spawnX !== null) {
        bx = cfg.spawnX;
        by = cfg.spawnY;
    } else {
        // 森林 Boss：地圖邊緣隨機生成
        const r = cfg.radius;
        const edge = Math.floor(Math.random() * 4);
        if (edge === 0)      { bx = Math.random() * MAP_WIDTH;  by = r; }
        else if (edge === 1) { bx = Math.random() * MAP_WIDTH;  by = MAP_HEIGHT - r; }
        else if (edge === 2) { bx = r;             by = Math.random() * MAP_HEIGHT; }
        else                 { bx = MAP_WIDTH - r; by = Math.random() * MAP_HEIGHT; }
    }
    gameState.boss = {
        x: bx, y: by,
        radius: cfg.radius, hp: cfg.hp, maxHp: cfg.hp,
        speed: cfg.speed, damage: cfg.damage,
        aggroRange: cfg.aggroRange, attackRange: cfg.attackRange,
        attackCooldown: 0, state: 'patrolling',
        wanderTarget: null, lastWanderTime: Date.now(),
        name: cfg.name, label: cfg.label,
        color: cfg.color, colorChasing: cfg.colorChasing,
        glowColor: cfg.glowColor
    };
    gameState.bossSpawned = true;
    gameState.bossSpawnTime = Date.now();
    gameState.dayNightMessage.text = t('bossAppeared', { name: cfg.name });
    gameState.dayNightMessage.timer = Date.now();
    AudioManager.playMusic('bossTheme');
}

function updateBoss() {
    const boss = gameState.boss;
    if (!boss || boss.hp <= 0) return;
    const now = Date.now();
    const p = gameState.player;
    if (boss.stunnedUntil && now < boss.stunnedUntil) return;
    const { dx, dy } = wrappedDelta(boss.x, boss.y, p.x, p.y);
    const dist = Math.sqrt(dx * dx + dy * dy);
    // Boss回血（普通地圖 bossRegen 開啟）
    if (gameState.currentMap && gameState.currentMap.features && gameState.currentMap.features.bossRegen) {
        if (now - (boss.regenTimer || 0) >= 10000) {
            boss.regenTimer = now;
            boss.hp = Math.min(boss.maxHp, boss.hp + boss.maxHp * 0.10);
        }
    }

    if (dist < boss.aggroRange) {
        boss.state = 'chasing';
    } else if (boss.state === 'chasing' && dist > boss.aggroRange + 150) {
        boss.state = 'patrolling';
    }
    if (boss.state === 'chasing') {
        if (dist <= boss.attackRange) {
            if (now - boss.attackCooldown >= 1500) {
                applyDamageToPlayer(boss.damage, boss);
                boss.attackCooldown = now;
            }
        } else {
            const angle = Math.atan2(dy, dx);
            moveCreature(boss, boss.x + Math.cos(angle) * boss.speed, boss.y + Math.sin(angle) * boss.speed);
        }
    } else {
        if (!boss.wanderTarget || now - boss.lastWanderTime >= 3000) {
            boss.wanderTarget = { x: Math.random() * MAP_WIDTH, y: Math.random() * MAP_HEIGHT };
            boss.lastWanderTime = now;
        }
        if (boss.wanderTarget) {
            const { dx: wx, dy: wy } = wrappedDelta(boss.x, boss.y, boss.wanderTarget.x, boss.wanderTarget.y);
            const wDist = Math.sqrt(wx * wx + wy * wy);
            if (wDist < 2) { boss.wanderTarget = null; }
            else {
                const angle = Math.atan2(wy, wx);
                moveCreature(boss, boss.x + Math.cos(angle) * boss.speed, boss.y + Math.sin(angle) * boss.speed);
            }
        }
    }
}

function showVictory() {
    if (gameState.gameOver) return;
    pausePlayTimer();
    gameState.topBarTarget = null;
    gameState.topBarFadeTimer = 0;
    gameState.gameOver = true;
    gameState.victory = true;
    AudioManager.stopMusic();
    AudioManager.play('victory');
    addXP(500);
    saveLastRunOrgans();
    const timeBonus = Math.floor((600 - gameState.timeRemaining) / 180);
    const levelBonus = Math.floor(gameState.player.level / 6);
    const eliteBonus = (gameState.sessionSkillPoints && gameState.sessionSkillPoints.elite) || 0;
    if (gameState.sessionSkillPoints) gameState.sessionSkillPoints.boss = 5;
    gameState.skillPoints += 5 + timeBonus + levelBonus;
    localStorage.setItem('playerSkills', JSON.stringify(gameState.playerSkills));
    localStorage.setItem('skillPoints', String(gameState.skillPoints));
    localStorage.removeItem('savedOrgans');
    localStorage.removeItem('savedHiddenOrgans');
    const bossKillTime = gameState.bossSpawnTime ? Math.floor((Date.now() - gameState.bossSpawnTime) / 1000) : null;
    const doShowVictory = () => {
        const overlay = document.createElement('div');
        overlay.id = 'victory-overlay';
        overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.82);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:100;pointer-events:all;color:white;';
        const title = document.createElement('div');
        title.style.cssText = 'font-size:52px;margin-bottom:16px;';
        title.textContent = t('victoryTitle');
        overlay.appendChild(title);
        const desc1 = document.createElement('div');
        desc1.style.cssText = 'font-size:22px;margin-bottom:8px;';
        const bossName = gameState.boss && gameState.boss.name ? gameState.boss.name : (BOSS_CONFIG.forest.name);
        desc1.textContent = t('victoryDesc', { boss: bossName });
        overlay.appendChild(desc1);
        const desc2 = document.createElement('div');
        desc2.style.cssText = 'font-size:18px;margin-bottom:10px;color:#FFD700;';
        desc2.textContent = t('victoryReward');
        overlay.appendChild(desc2);
        const spSection = document.createElement('div');
        spSection.style.cssText = 'font-size:14px;color:#aaa;margin-bottom:20px;text-align:center;line-height:1.8;';
        const spLines = [t('skillPtBoss', { n: 5 })];
        if (eliteBonus > 0)  spLines.push(t('skillPtElite', { n: eliteBonus }));
        if (timeBonus > 0)   spLines.push(t('skillPtTime',  { n: timeBonus }));
        if (levelBonus > 0)  spLines.push(t('skillPtLevel', { n: levelBonus }));
        spSection.innerHTML = spLines.join('<br>');
        overlay.appendChild(spSection);
        const btnTree = document.createElement('button');
        btnTree.style.cssText = 'font-size:20px;padding:10px 28px;cursor:pointer;pointer-events:all;margin-bottom:12px;border:2px solid #FFD700;background:rgba(255,215,0,0.15);color:white;border-radius:5px;font-weight:bold;';
        btnTree.textContent = t('goSkillTree');
        btnTree.onclick = () => { overlay.remove(); buildSkillTreeOverlay(null, false, false, 'postGame'); };
        overlay.appendChild(btnTree);
        const vBtnRow = document.createElement('div');
        vBtnRow.style.cssText = 'display:flex;gap:12px;pointer-events:all;flex-wrap:wrap;justify-content:center;flex-direction:column;align-items:center;';
        const vWarnEl = document.createElement('div');
        vWarnEl.style.cssText = 'display:none;font-size:13px;color:#f80;text-align:center;';
        vBtnRow.appendChild(vWarnEl);
        const vRowInner = document.createElement('div');
        vRowInner.style.cssText = 'display:flex;gap:12px;flex-wrap:wrap;justify-content:center;';
        const vHomeBtn = document.createElement('button');
        vHomeBtn.style.cssText = 'font-size:16px;padding:8px 20px;cursor:pointer;border:1px solid #aaa;background:rgba(255,255,255,0.1);color:white;border-radius:5px;';
        vHomeBtn.textContent = t('backHome');
        let vHomeWarned = false;
        vHomeBtn.onclick = () => {
            if (!vHomeWarned) {
                vHomeWarned = true;
                vWarnEl.textContent = t('warnNoOrganHome');
                vWarnEl.style.display = 'block';
                return;
            }
            location.reload();
        };
        vRowInner.appendChild(vHomeBtn);
        const vPlayAgainBtn = document.createElement('button');
        vPlayAgainBtn.style.cssText = 'font-size:16px;padding:8px 20px;cursor:pointer;border:1px solid #FFD700;background:rgba(255,215,0,0.15);color:white;border-radius:5px;';
        vPlayAgainBtn.textContent = t('playAgain');
        vPlayAgainBtn.onclick = () => { overlay.remove(); buildSkillTreeOverlay(null, false, false, 'forceStart'); };
        vRowInner.appendChild(vPlayAgainBtn);
        vBtnRow.appendChild(vRowInner);
        overlay.appendChild(vBtnRow);
        const vFooter = document.createElement('div');
        vFooter.style.cssText = 'font-size:12px;color:#555;margin-top:20px;';
        vFooter.textContent = '© ' + GAME_INFO.author + ' | ' + GAME_INFO.version;
        overlay.appendChild(vFooter);
        if (gameState.devModeUsed) {
            const devWarn = document.createElement('div');
            devWarn.style.cssText = 'font-size:12px;color:#f80;margin-top:12px;';
            devWarn.textContent = '⚠️ 本局使用了開發者模式，分數不計入排行榜';
            overlay.appendChild(devWarn);
        }
        document.getElementById('game-container').appendChild(overlay);
    };
    if (gameState.devModeUsed) {
        doShowVictory();
    } else {
        showScoreSubmitPopup(true, bossKillTime, doShowVictory);
    }
}

function drawBossArrow() {
    const boss = gameState.boss;
    if (!boss || boss.hp <= 0) return;
    const bs = worldToScreen(boss.x, boss.y);
    if (bs.x >= -20 && bs.x <= VIEW_W + 20 && bs.y >= -20 && bs.y <= VIEW_H + 20) return;
    const p = gameState.player;
    const ps = worldToScreen(p.x, p.y);
    drawArrow(ps.x, ps.y, boss.x, boss.y, boss.glowColor || '#8B4513', p.radius);
}
