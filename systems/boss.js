// =============================================================
// 首領系統 - spawnBoss / updateBoss / showVictory / drawBossArrow
// =============================================================

function spawnBoss() {
    const playerBiome = getBiome(gameState.player.x, gameState.player.y);
    const baseCfg = BOSS_CONFIG[playerBiome] || BOSS_CONFIG.forest;
    // 若當前地圖有地圖專屬 Boss 設定，合併覆蓋（速度/HP/傷害/半徑/名稱）
    const mapBossArr = gameState.currentMap && gameState.currentMap.bosses;
    const mapBossCfg = mapBossArr ? mapBossArr.find(b => b.biome === playerBiome) : null;
    const cfg = mapBossCfg ? Object.assign({}, baseCfg, mapBossCfg) : baseCfg;
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

    // ── 通用回血：每 3 秒回復最大HP的 2%（普通地圖才啟動）
    if (gameState.currentMap && gameState.currentMap.features && gameState.currentMap.features.bossRegen) {
        if (now - (boss.regenTimer || 0) >= 3000) {
            boss.regenTimer = now;
            const regenAmt = boss.maxHp * 0.02;
            // 若玩家有蟹鉗+拳套組合，降低回血量 50%
            const actualRegen = p.comboCrabGloves && (boss.healReduction || 0) > 0
                ? regenAmt * (1 - boss.healReduction) : regenAmt;
            boss.hp = Math.min(boss.maxHp, boss.hp + actualRegen);
        }
    }

    // ── 黑熊 (<40% 狂暴)
    if (boss.name && boss.name.includes('黑熊')) {
        if (!boss._enraged && boss.hp / boss.maxHp < 0.4) {
            boss._enraged = true;
            boss.speed *= 1.5;
            boss.damage = Math.round(boss.damage * 1.3);
            boss._enrageGlow = true;
            showFloatingText(boss.x, boss.y - 40, '🐻 狂暴！', '#ff4400', 20);
        }
    }

    // ── 大白鯊 衝刺攻擊
    if (boss.name && boss.name.includes('鯊')) {
        if (boss._chargeState === 'charging') {
            // 衝刺移動
            boss.x = ((boss.x + boss._chargeVx + MAP_WIDTH)  % MAP_WIDTH);
            boss.y = ((boss.y + boss._chargeVy + MAP_HEIGHT) % MAP_HEIGHT);
            const toPlayer = wrappedDistance(boss.x, boss.y, p.x, p.y);
            if (toPlayer < boss.attackRange + 10) {
                applyDamageToPlayer(Math.round(boss.damage * 1.5), boss);
                boss.attackCooldown = now;
            }
            if (now - (boss._chargeStartTime || 0) > 800) {
                boss._chargeState = 'cooldown';
                boss._chargeTimer = now;
            }
            return; // 衝刺中跳過普通邏輯
        } else if (boss._chargeState === 'warning') {
            // 警告階段：0.6秒後開始衝刺
            if (now - (boss._chargeWarningStart || 0) > 600) {
                boss._chargeState = 'charging';
                boss._chargeStartTime = now;
                const angle = Math.atan2(
                    boss._chargeTarget.y - boss.y,
                    boss._chargeTarget.x - boss.x
                );
                const chargeSpeed = boss.speed * 4;
                boss._chargeVx = Math.cos(angle) * chargeSpeed;
                boss._chargeVy = Math.sin(angle) * chargeSpeed;
            }
            return;
        } else if (boss._chargeState === 'cooldown') {
            if (now - (boss._chargeTimer || 0) > 1500) boss._chargeState = null;
        } else {
            // 觸發衝刺
            if (!boss._chargeTimer) boss._chargeTimer = now;
            if (now - boss._chargeTimer > 4000 && dist < 500) {
                boss._chargeState = 'warning';
                boss._chargeWarningStart = now;
                boss._chargeTarget = { x: p.x, y: p.y };
            }
        }
    }

    // ── 沙漠蠍王：毒霧 + 沙暴
    if (boss.name && boss.name.includes('蠍')) {
        // 毒霧：每5秒在玩家周圍釋放
        if (!boss._venomTimer) boss._venomTimer = now;
        if (now - boss._venomTimer > 5000 && dist < 300) {
            boss._venomTimer = now;
            // 對玩家施加持續毒傷（模擬：直接傷害 + 顯示文字）
            p._scorpionVenomEnd = now + 4000;
            p._scorpionVenomDmg = Math.round(boss.damage * 0.3);
            p._scorpionVenomTick = now;
            showFloatingText(p.x, p.y - 30, t('venomFloat') || '☠ 毒霧', '#aa00cc', 16);
        }
        // 毒傷 tick
        if (p._scorpionVenomEnd && now < p._scorpionVenomEnd) {
            if (now - (p._scorpionVenomTick || 0) >= 1000) {
                p._scorpionVenomTick = now;
                applyDamageToPlayer(p._scorpionVenomDmg || 5, boss);
            }
        }
        // 沙暴：血量<40%時觸發一次
        if (!boss._sandstormTriggered && boss.hp / boss.maxHp < 0.4) {
            boss._sandstormTriggered = true;
            boss._sandstormActive = true;
            boss._sandstormEndTime = now + 6000;
            showFloatingText(boss.x, boss.y - 40, '🌪 沙暴！', '#cc8800', 20);
        }
        if (boss._sandstormActive && now > (boss._sandstormEndTime || 0)) {
            boss._sandstormActive = false;
        }
        // 沙暴期間：玩家移速 -40%（用 flag，由 updatePlayerMovement 檢查）
        p._inSandstorm = boss._sandstormActive || false;
    } else {
        p._inSandstorm = false;
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
    console.log && false; // [v0.47.0] 六：Boss 機制改版完成
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
    if (gameState.sessionSkillPoints) gameState.sessionSkillPoints.boss = 3;
    gameState.skillPoints += 3 + timeBonus + levelBonus;
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
        const spLines = [t('skillPtBoss', { n: 3 })];
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
