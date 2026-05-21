// =============================================================
// 玩家系統 - updatePlayerMovement / checkFruitCollision
//            updateTreeFruitProduction / showXPPopup
//            checkTreasureCollision / updatePassiveOrgans
//            checkXPMilestone / addXP / checkLevelUp
// =============================================================

function updatePlayerMovement() {
    const p = gameState.player;
    const sk = gameState.settings.keys;
    let dx = 0, dy = 0;
    if (gameState.keys[sk.up]   || gameState.keys['arrowup'])    dy -= p.speed;
    if (gameState.keys[sk.down] || gameState.keys['arrowdown'])  dy += p.speed;
    if (gameState.keys[sk.left] || gameState.keys['arrowleft'])  dx -= p.speed;
    if (gameState.keys[sk.right]|| gameState.keys['arrowright']) dx += p.speed;
    const mi = gameState.mobileInput;
    if (mi.dx !== 0 || mi.dy !== 0) {
        dx += mi.dx * p.speed;
        dy += mi.dy * p.speed;
    }
    if (dx === 0 && dy === 0) return;
    p.x = ((p.x + dx) % MAP_WIDTH  + MAP_WIDTH)  % MAP_WIDTH;
    p.y = ((p.y + dy) % MAP_HEIGHT + MAP_HEIGHT) % MAP_HEIGHT;
}

function checkFruitCollision() {
    const p = gameState.player;
    const bodyScale = p.radius / 10;
    const collisionRadius = (p.radius + 6 + p.pickupRange) * bodyScale;

    for (let i = gameState.fruits.length - 1; i >= 0; i--) {
        const fruit = gameState.fruits[i];
        if (wrappedDistance(p.x, p.y, fruit.x, fruit.y) < collisionRadius) {
            const ev = p.evolution;
            // 草食性fruitXPBonus：Lv2以上累計
            let herbBonus = 0;
            for (let h = 1; h < ev.herbivore; h++) {
                herbBonus += EVOLUTION_PATHS.herbivore.levels[h].fruitXPBonus || 0;
            }
            const fruitXP = 5 + (gameState.playerSkills.forager || 0) * 3 + herbBonus;
            addXP(fruitXP);
            AudioManager.play('eatFruit');
            gameState.fruits.splice(i, 1);
            showXPPopup(p.x, p.y, fruitXP);
            return true;
        }
    }
    return false;
}

function updateTreeFruitProduction(deltaTime) {
    for (const tree of gameState.trees) {
        const range     = tree.isLarge ? 80 : 60;
        const maxNearby = tree.isLarge ?  5 :  3;
        let nearby = 0;
        for (const fruit of gameState.fruits) {
            const dx = fruit.x - tree.x, dy = fruit.y - tree.y;
            if (dx * dx + dy * dy < range * range) nearby++;
        }
        tree.fruitCount = nearby;
        if (nearby >= maxNearby) continue;
        tree.fruitTimer += deltaTime;
        const interval = nearby === 0 ? 9000 : (nearby === 1 ? 19500 : 30000);
        if (tree.fruitTimer >= interval) {
            tree.fruitTimer = 0;
            spawnFruitFromTree(tree);
        }
    }
}

function showXPPopup(wx, wy, amount) {
    const s = worldToScreen(wx, wy);
    if (s.x < -30 || s.x > VIEW_W + 30 || s.y < -30 || s.y > VIEW_H + 30) return;
    const popup = document.createElement('div');
    popup.id = 'xp-popup';
    popup.innerText = `+${amount} XP`;
    popup.style.left = `${s.x - 15}px`;
    popup.style.top = `${s.y - 20}px`;
    document.getElementById('ui-overlay').appendChild(popup);
    setTimeout(() => { popup.remove(); }, 1000);
}

function checkTreasureCollision() {
    const p = gameState.player;
    for (let i = gameState.treasures.length - 1; i >= 0; i--) {
        const t = gameState.treasures[i];
        if (wrappedDistance(p.x, p.y, t.x, t.y) < p.radius + t.radius) {
            addXP(50);
            showXPPopup(p.x, p.y, 50);
            gameState.treasures.splice(i, 1);
        }
    }
}

function updatePassiveOrgans() {
    const now = Date.now();
    const p = gameState.player;

    // 大腦：念力波（等級化範圍/間隔/傷害）
    if (p.brainActive && now - p.brainTimer >= p.brainInterval) {
        p.brainTimer = now;
        // 衝擊波視覺效果
        gameState.brainShockwaves.push({ x: p.x, y: p.y, range: p.brainRange, startTime: now });
        for (const c of gameState.hostileCreatures) {
            if (c.hp <= 0) continue;
            if (wrappedDistance(p.x, p.y, c.x, c.y) <= p.brainRange) {
                let dmg = p.brainDmg;
                let isCrit = false;
                // 大腦+真視之眼組合：念力波可暴擊
                if (p.comboBrainEye && p.critChance > 0 && Math.random() < p.critChance) {
                    dmg = Math.round(dmg * p.critMultiplier);
                    isCrit = true;
                }
                c.hp -= dmg;
                showFloatingText(c.x, c.y - 15, (isCrit ? '⚡' : '') + dmg, isCrit ? '#FFD700' : '#FFAAAA');
                if (c.hp <= 0) {
                    handleKill(c, true);
                }
            }
        }
    }

    // 超自然回復
    if (p.naturalRegenHp > 0) {
        if (!p.naturalRegenTimer) p.naturalRegenTimer = now;
        let interval = p.naturalRegenInterval;
        if (p.comboSkinRegen) interval = Math.max(1000, interval - 1000);
        if (now - p.naturalRegenTimer >= interval) {
            p.naturalRegenTimer = now;
            const flatAmt = p.naturalRegenHp + (p.comboSkinRegen ? 1 : 0);
            const percentAmt = Math.round(gameState.stats.hpMax * (p.naturalRegenHpMaxPercent || 0));
            const amt = flatAmt + percentAmt;
            gameState.stats.hpCurrent = Math.min(gameState.stats.hpMax, gameState.stats.hpCurrent + amt);
            showFloatingText(p.x, p.y - 30, '+' + amt + ' HP', '#00FF88');
        }
    }
}

function checkXPMilestone() {
    if (gameState.organSelectionActive) return;
    if (gameState.stats.xpCurrent >= gameState.xpThreshold) {
        showOrganSelection();
    }
}

function addXP(amount) {
    gameState.stats.xpCurrent += amount;
    gameState.player.levelXP += amount;
    checkLevelUp();
}

function checkLevelUp() {
    const p = gameState.player;
    const threshold = 100 + (p.level - 1) * 50;
    if (p.levelXP >= threshold) {
        p.levelXP = 0;
        p.level++;
        gameState.levelUpMessage = { text: t('levelUpFloat', { lv: p.level }), timer: Date.now() };
        AudioManager.play('levelUp');
        showOrganSelection();
    }
}

// =============================================================
// 靈敏知覺算法 - 找出果子最多的高效率直線路徑
// =============================================================

function findBestPerceptionPath(player, fruits, detectionRange) {
    if (!fruits || fruits.length === 0) return null;

    // 篩選範圍內的果子
    const nearby = fruits.filter(f => wrappedDistance(player.x, player.y, f.x, f.y) <= detectionRange);
    if (nearby.length === 0) return null;

    const tolerance = 5 * Math.PI / 180; // 左右各5度

    let bestEfficiency = Infinity;
    let bestAngle = 0;
    let bestFruits = [];
    let bestEndpoint = null;

    // 以每顆果子的方向為候選角度
    const candidateAngles = nearby.map(f => {
        const d = wrappedDelta(player.x, player.y, f.x, f.y);
        return Math.atan2(d.dy, d.dx);
    });

    for (const angle of candidateAngles) {
        // 滑動窗口：容差內的果子
        const windowFruits = nearby.filter(f => {
            const d = wrappedDelta(player.x, player.y, f.x, f.y);
            const fAngle = Math.atan2(d.dy, d.dx);
            let diff = Math.abs(fAngle - angle);
            if (diff > Math.PI) diff = 2 * Math.PI - diff;
            return diff <= tolerance;
        });
        if (windowFruits.length === 0) continue;

        // 按距離排序
        windowFruits.sort((a, b) =>
            wrappedDistance(player.x, player.y, a.x, a.y) -
            wrappedDistance(player.x, player.y, b.x, b.y)
        );

        const farthest = windowFruits[windowFruits.length - 1];
        const farthestDist = wrappedDistance(player.x, player.y, farthest.x, farthest.y);
        const efficiency = farthestDist / windowFruits.length; // 值越低越好

        if (efficiency < bestEfficiency) {
            bestEfficiency = efficiency;
            bestAngle = angle;
            bestFruits = windowFruits;
            bestEndpoint = farthest;
        }
    }

    if (!bestEndpoint) return null;
    return { endpoint: bestEndpoint, fruits: bestFruits, angle: bestAngle };
}
