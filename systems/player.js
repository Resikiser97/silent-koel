// =============================================================
// 玩家系統 - updatePlayerMovement / playerDash / checkFruitCollision
//            updateTreeFruitProduction / showXPPopup
//            checkTreasureCollision / updatePassiveOrgans
//            checkXPMilestone / addXP / checkLevelUp
//            updateProjectiles / findBestPerceptionPath
//            _checkProjectileHit（子彈系統）
//            _archerAttack / _getArcherShootDir / _getAllAttackTargets（阿奇爾攻擊）
// =============================================================

// =============================================================
// 子彈系統（阿奇爾 Archerfish 射水）
// =============================================================

function updateProjectiles() {
    const projs = gameState.projectiles;
    const p = gameState.player;
    for (let i = projs.length - 1; i >= 0; i--) {
        const b = projs[i];
        b.x += b.vx;
        b.y += b.vy;
        b.distTraveled += Math.sqrt(b.vx * b.vx + b.vy * b.vy);

        // 超出射程消失
        if (b.distTraveled >= b.maxRange) {
            if (b.owner === 'hunter') AudioManager.play('hunterBulletHit');
            projs.splice(i, 1);
            continue;
        }

        // 地圖包裹
        b.x = ((b.x % MAP_WIDTH)  + MAP_WIDTH)  % MAP_WIDTH;
        b.y = ((b.y % MAP_HEIGHT) + MAP_HEIGHT) % MAP_HEIGHT;

        // 黑色獵人子彈：打玩家
        if (b.owner === 'hunter') {
            if (p && wrappedDistance(b.x, b.y, p.x, p.y) < b.radius + (p.radius || 0)) {
                applyDamageToPlayer(b.damage, gameState.boss);
                AudioManager.play('hunterBulletHit');
                projs.splice(i, 1);
            }
            continue;
        }

        // 命中偵測（阿奇爾子彈打敵人）
        if (_checkProjectileHit(b, i)) continue;
    }
}

function _checkProjectileHit(b, idx) {
    const targets = [
        ...gameState.hostileCreatures,
        ...gameState.neutralCreatures,
        ...(gameState.boss && gameState.boss.hp > 0 ? [gameState.boss] : []),
        ...(gameState.eliteCreature && gameState.eliteCreature.hp > 0 ? [gameState.eliteCreature] : []),
        ...(gameState.tutorialStump && gameState.tutorialStump.hp > 0 ? [gameState.tutorialStump] : []),
    ];

    for (const c of targets) {
        if (c.hp <= 0) continue;
        if (wrappedDistance(b.x, b.y, c.x, c.y) > b.radius + (c.radius || 0)) continue;

        let dmg = b.damage;
        const isCrit = b.hasCrit;

        // 鯊魚葉：對低血量目標處決加成
        const sharkLv = getOrganLevel('sharkLeaf');
        if (sharkLv > 0) {
            const sharkCfg = ORGANS.sharkLeaf.levels[sharkLv - 1].effects.executeBonus;
            const hpRatio  = c.hp / (c.maxHp || c.hp);
            if (hpRatio < sharkCfg.threshold) {
                dmg = Math.round(dmg * (1 + sharkCfg.bonus));
            }
        }

        // 嘴器Lv3：命中施加減速 -20% / 2秒（韌性縮短）
        if (getOrganLevel('mouthOrgan') >= 3) {
            const _nowHit    = Date.now();
            c._slowUntil     = _nowHit + applyTenacity(2000, c);
            c._slowStartTime = _nowHit;
            c._slowMult      = 0.8;
        }

        c.hp -= dmg;
        showFloatingText(c.x, c.y - 15, (isCrit ? '⚡' : '') + dmg,
            isCrit ? '#FFD700' : '#FF4444');

        // 追蹤特殊目標
        if (c.isGiantized || c.isKiller || c === gameState.boss || c === gameState.eliteCreature) {
            gameState.topBarTarget = c;
        }

        // 子彈消失
        gameState.projectiles.splice(idx, 1);

        // 目標死亡路由
        if (c.hp <= 0) {
            if (c === gameState.boss) {
                handleBossKill(c);
            } else if (c === gameState.eliteCreature) {
                handleEliteKill(c);
            } else if (c.isGiantized) {
                handleGiantKill(c);
            } else if (c.isTutorialStump) {
                handleTutorialStumpKill();
            } else {
                const isHostile = gameState.hostileCreatures.includes(c);
                handleKill(c, isHostile);
            }
        }
        return true; // 命中，子彈已消失
    }
    return false;
}

// =============================================================
// 阿奇爾攻擊系統
// =============================================================

function _getAllAttackTargets() {
    return [
        ...gameState.hostileCreatures.filter(c => c.hp > 0),
        ...gameState.neutralCreatures.filter(c => c.hp > 0),
        ...(gameState.boss && gameState.boss.hp > 0 ? [gameState.boss] : []),
        ...(gameState.eliteCreature && gameState.eliteCreature.hp > 0 ? [gameState.eliteCreature] : []),
    ];
}

/**
 * 自動攻擊目標選擇（供 _getArcherShootDir 與 hud.js _drawArcherLockOn 共用）
 *
 * 優先規則：
 *   P1 — 在子彈射程（attackRange×1.2）內，且在移動方向 ±45° 扇形中的最近敵人（迎面敵人）
 *   P2 — 無 P1 目標時：全場最近的敵人
 *
 * @returns {object|null}
 */
function _findArcherAutoTarget() {
    const p    = gameState.player;
    const tgts = _getAllAttackTargets();
    if (tgts.length === 0) return null;

    const bulletRange = p.attackRange * 1.2;
    const moveAngle   = Math.atan2(p.lastMoveDir.dy || 0, p.lastMoveDir.dx || 0);

    // P1：射程內 + ±45° 扇形（迎面優先）
    let best = null, bestDist = Infinity;
    for (const c of tgts) {
        const { dx, dy } = wrappedDelta(p.x, p.y, c.x, c.y);
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > bulletRange) continue;
        const angle = Math.atan2(dy, dx);
        let diff = Math.abs(angle - moveAngle);
        if (diff > Math.PI) diff = Math.PI * 2 - diff;
        if (diff <= Math.PI / 4 && dist < bestDist) { best = c; bestDist = dist; }
    }

    // P2：全場最近
    if (!best) {
        for (const c of tgts) {
            const { dx, dy } = wrappedDelta(p.x, p.y, c.x, c.y);
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < bestDist) { best = c; bestDist = dist; }
        }
    }

    return best;
}

function _getArcherShootDir() {
    const p = gameState.player;

    if (gameState.settings.autoAttack) {
        // 自動模式：使用優先規則（迎面 > 全場最近），每次攻擊前即時查詢
        const best = _findArcherAutoTarget();
        if (best) {
            const { dx, dy } = wrappedDelta(p.x, p.y, best.x, best.y);
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len > 0) return { dx: dx / len, dy: dy / len };
        }
        // 無目標 → 射移動方向
        return { dx: p.lastMoveDir.dx || 0, dy: p.lastMoveDir.dy || -1 };

    } else {
        // 手動模式（電腦）：
        // 使用 mouseScreen（canvas 螢幕座標），攻擊瞬間從玩家螢幕位置算方向
        // 不用 mouseWorld，避免玩家移動後攝影機偏移造成方向陳舊
        const ms = gameState.mouseScreen;
        if (ms) {
            const ps = worldToScreen(p.x, p.y);
            const ddx = ms.sx - ps.x;
            const ddy = ms.sy - ps.y;
            const len = Math.sqrt(ddx * ddx + ddy * ddy);
            if (len > 5) return { dx: ddx / len, dy: ddy / len };
        }
        // fallback：移動方向
        return { dx: p.lastMoveDir.dx || 0, dy: p.lastMoveDir.dy || -1 };
    }
}

function _archerAttack() {
    const p = gameState.player;
    const now = Date.now();

    // 攻速冷卻（基於 attackSpeedBonus）
    const totalBonus     = p.attackSpeedBonus || 0;
    const attackInterval = Math.round(1500 / (1 + totalBonus));
    if (now - p.attackTimer < attackInterval) return;
    p.attackTimer = now;

    if (p.attack <= 0) {
        showFloatingText(p.x, p.y - 30, t('noAttackOrgan'), '#FF8800');
        return;
    }

    // 取得射擊方向
    const dir = _getArcherShootDir();
    if (!dir) return;

    // 消耗充能（最少1格）
    const charges  = Math.max(1, p.reloadCharges);
    const dmgMult  = charges;
    let dmg        = Math.round(p.attack * dmgMult);

    // 暴擊判定
    let isCrit = false;
    if (p.critChance > 0 && Math.random() < p.critChance) {
        dmg    = Math.round(dmg * p.critMultiplier);
        isCrit = true;
    }

    p.reloadCharges = Math.max(0, p.reloadCharges - 1);
    p.reloadTimer   = 0;

    // 建立子彈（單顆，方向由 _getArcherShootDir 決定：P1 正前方敵人 / P2 全場最近敵人）
    const bulletSpeed = ARCHER_BULLET_SPEED;
    gameState.projectiles.push({
        x: p.x, y: p.y,
        vx: dir.dx * bulletSpeed,
        vy: dir.dy * bulletSpeed,
        damage:       dmg,
        maxRange:     p.attackRange * 1.2,
        distTraveled: 0,
        radius:       5,
        ownerId:      'player',
        hasCrit:      isCrit,
    });

    p.attackVisual = now;
    AudioManager.play('attackNormal');
}

// =============================================================
// XP Popup 物件池 — 預建固定數量 DOM 元素重複使用，避免每次 createElement
// =============================================================
const _XP_POOL_SIZE = 10;
let _xpPopupPool = [];
let _xpPoolReady = false;
let _treeProductionTimer = 0;

function _initXpPool() {
    if (_xpPoolReady) return;
    const overlay = document.getElementById('ui-overlay');
    if (!overlay) return;
    for (let i = 0; i < _XP_POOL_SIZE; i++) {
        const el = document.createElement('div');
        el.style.cssText = 'position:absolute;pointer-events:none;display:none;font-size:13px;font-weight:bold;color:#FFD700;text-shadow:0 0 4px #000;transition:opacity 0.8s,transform 0.8s;';
        overlay.appendChild(el);
        _xpPopupPool.push({ el, inUse: false });
    }
    _xpPoolReady = true;
}

// 提取果子吸收邏輯，供 checkFruitCollision 和 playerDash 共用
function _collectFruit(p, fruit) {
    const ev = p.evolution;
    let fruitXP;
    if (ev.herbivore >= 1) {
        // 有草食性 Lv1+：正常計算（基礎5 + forager + 草食bonus）
        let herbBonus = 0;
        for (let h = 1; h < ev.herbivore; h++) {
            herbBonus += EVOLUTION_PATHS.herbivore.levels[h].fruitXPBonus || 0;
        }
        fruitXP = 5 + (gameState.playerSkills.forager || 0) * 3 + herbBonus;
    } else {
        // 無草食性：只得 1 XP（可吃但效益極低，避免刷巨人時靠果子回血）
        fruitXP = 1;
    }
    const actualFruitXP = addXP(fruitXP);
    AudioManager.play('eatFruit');
    showXPPopup(p.x, p.y, actualFruitXP);
    if (gameState.sessionStats) {
        gameState.sessionStats.fruitsEaten = (gameState.sessionStats.fruitsEaten || 0) + 1;
    }
}

function playerDash() {
    const p = gameState.player;
    if (p.dashCooldown > 0) return;
    if (_joyPaused()) return;

    // ── 阿奇爾 F技：加速衝刺（持續 3 秒，陸地+3 水中+5）
    if (p.isRanged) {
        const now = Date.now();
        const inWater = getBiome(p.x, p.y) === 'ocean';
        const dashSpeedAdd = inWater ? 5 : 3;

        p.archerDashActive = true;
        p.archerDashEnd    = now + 3000;
        p.archerDashSpeed  = dashSpeedAdd;
        p.dashCooldown     = 15000;

        const dir = p.lastMoveDir;
        gameState.dashEffect = {
            ax: p.x, ay: p.y,
            bx: p.x + dir.dx * dashSpeedAdd * 60,
            by: p.y + dir.dy * dashSpeedAdd * 60,
            startTime: now, duration: 150
        };
        return;
    }

    // ── 噪鵑閃現：取方向（手機優先 mobileInput，否則用 lastMoveDir）
    const mi = gameState.mobileInput;
    let dirX, dirY;
    if (mi.dx !== 0 || mi.dy !== 0) {
        dirX = mi.dx;
        dirY = mi.dy;
    } else {
        dirX = p.lastMoveDir.dx;
        dirY = p.lastMoveDir.dy;
    }

    const len = Math.sqrt(dirX * dirX + dirY * dirY);
    if (len === 0) return;
    dirX /= len;
    dirY /= len;

    const distance = Math.min(p.speed * 50, 500);
    const prevX = p.x, prevY = p.y;
    const targetX = Math.max(p.radius, Math.min(MAP_WIDTH  - p.radius, p.x + dirX * distance));
    const targetY = Math.max(p.radius, Math.min(MAP_HEIGHT - p.radius, p.y + dirY * distance));

    p.x = targetX;
    p.y = targetY;
    p.dashCooldown      = 15000;
    p.dashInvincible    = true;
    p.dashInvincibleEnd = Date.now() + 500;

    // 閃現特效
    gameState.dashEffect = {
        ax: prevX, ay: prevY,
        bx: targetX, by: targetY,
        startTime: Date.now(),
        duration: 150
    };

    // A→B 直線範圍果子吸收
    const pickupWidth = p.radius + p.pickupRange;
    const lineDx = targetX - prevX;
    const lineDy = targetY - prevY;
    const lineLen = Math.sqrt(lineDx * lineDx + lineDy * lineDy);
    if (lineLen > 0) {
        const nx = lineDx / lineLen;
        const ny = lineDy / lineLen;
        gameState.fruits = gameState.fruits.filter(fruit => {
            const fx = fruit.x - prevX;
            const fy = fruit.y - prevY;
            const proj = fx * nx + fy * ny;
            if (proj < 0 || proj > lineLen) return true;
            const perpX = fx - proj * nx;
            const perpY = fy - proj * ny;
            const perpDist = Math.sqrt(perpX * perpX + perpY * perpY);
            if (perpDist <= pickupWidth) {
                _collectFruit(p, fruit);
                return false;
            }
            return true;
        });
    }
}

function updatePlayerMovement() {
    const p = gameState.player;
    const now = Date.now();

    // 冷卻遞減（使用 Fixed Timestep，每幀 1000/60 ≈ 16.67ms）
    if (p.dashCooldown > 0) p.dashCooldown = Math.max(0, p.dashCooldown - FIXED_DELTA);

    // 無敵時間檢查
    if (p.dashInvincible && now >= p.dashInvincibleEnd) p.dashInvincible = false;

    // 鱷魚死亡翻滾：暈眩期間無法移動
    if (p._stunUntil && now < p._stunUntil) return;

    // ── 阿奇爾 F技衝刺計時與撞怪
    if (p.archerDashActive) {
        if (now >= p.archerDashEnd) {
            p.archerDashActive = false;
            p.archerDashSpeed  = 0;
        } else {
            // 衝刺期間撞怪：附近生物暈眩 0.5 秒並扣血
            const allCreatures = [
                ...gameState.hostileCreatures,
                ...gameState.neutralCreatures,
            ];
            for (const c of allCreatures) {
                if (c.hp <= 0) continue;
                if (wrappedDistance(p.x, p.y, c.x, c.y) > p.radius + (c.radius || 0) + 5) continue;
                if (c._stunUntil && now < c._stunUntil) continue; // 避免重複暈眩
                c._stunUntil = now + 500;
                const dashDmg = Math.max(1, Math.round(p.attack));
                c.hp -= dashDmg;
                showFloatingText(c.x, c.y - 15, dashDmg, '#4FC3F7');
                if (c.hp <= 0) {
                    const isHostile = gameState.hostileCreatures.includes(c);
                    if (c.isGiantized) handleGiantKill(c);
                    else handleKill(c, isHostile);
                }
            }
        }
    }

    // ── 阿奇爾充能計時（每幀遞增）
    if (p.isRanged) {
        const totalBonus     = p.attackSpeedBonus || 0;
        const reloadInterval = Math.round(1000 / (1 + totalBonus));
        p.reloadTimer += FIXED_DELTA;
        if (p.reloadTimer >= reloadInterval && p.reloadCharges < 3) {
            p.reloadCharges++;
            p.reloadTimer = 0;
        }
        // 蓄力手動模式：每 500ms 消耗 1 格（持續按住攻擊鍵時）
        if (p.chargeHolding && !gameState.settings.autoAttack) {
            p.chargeHoldTime += FIXED_DELTA;
            while (p.chargeHoldTime >= 500 && p.reloadCharges > 0 && p.chargeConsumed < 3) {
                p.reloadCharges--;
                p.chargeConsumed++;
                p.chargeHoldTime -= 500;
                p.reloadTimer = 0;
            }
        }
    }

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

    // 猞猁暴擊減速效果
    if (p._lynxSlowUntil && now < p._lynxSlowUntil) {
        const slow = p._lynxSlowAmt || 0;
        dx *= (1 - slow);
        dy *= (1 - slow);
    }

    // 蠍王沙暴減速 -40%（六）
    if (p._inSandstorm) {
        dx *= 0.6;
        dy *= 0.6;
    }

    // ── 阿奇爾水中速度 +50%
    if (p.isRanged) {
        const biome = getBiome(p.x, p.y);
        if (biome === 'ocean') {
            dx *= 1.5;
            dy *= 1.5;
        }
        // F技衝刺附加速度
        if (p.archerDashActive && p.archerDashSpeed > 0) {
            const dlen = Math.sqrt(dx * dx + dy * dy);
            if (dlen > 0) {
                dx += (dx / dlen) * p.archerDashSpeed;
                dy += (dy / dlen) * p.archerDashSpeed;
            } else {
                // 靜止時沿 lastMoveDir 衝刺
                dx += p.lastMoveDir.dx * p.archerDashSpeed;
                dy += p.lastMoveDir.dy * p.archerDashSpeed;
            }
        }
    }

    if (dx === 0 && dy === 0) return;

    // 更新最後移動方向（正規化）
    const moveLen = Math.sqrt(dx * dx + dy * dy);
    if (moveLen > 0) {
        p.lastMoveDir = { dx: dx / moveLen, dy: dy / moveLen };
    }

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
            _collectFruit(p, fruit);
            gameState.fruits.splice(i, 1);
            return true;
        }
    }
    return false;
}

function updateTreeFruitProduction(deltaTime) {
    _treeProductionTimer += FIXED_DELTA;
    if (_treeProductionTimer < 500) return;
    const elapsed = _treeProductionTimer;
    _treeProductionTimer = 0;
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
        tree.fruitTimer += elapsed;
        const interval = nearby === 0 ? 9000 : (nearby === 1 ? 19500 : 30000);
        if (tree.fruitTimer >= interval) {
            tree.fruitTimer = 0;
            spawnFruitFromTree(tree);
        }
    }
}

function showXPPopup(wx, wy, amount) {
    _initXpPool();
    const s = worldToScreen(wx, wy);
    if (s.x < -30 || s.x > VIEW_W + 30 || s.y < -30 || s.y > VIEW_H + 30) return;
    const slot = _xpPopupPool.find(sl => !sl.inUse);
    if (!slot) return; // 池滿時跳過，不建立新元素
    slot.inUse = true;
    const el = slot.el;
    el.textContent = '+' + amount + ' XP';
    el.style.left      = (s.x - 15) + 'px';
    el.style.top       = (s.y - 20) + 'px';
    el.style.textShadow = (gameState.settings && gameState.settings.fontBoldLarge)
        ? '-2px -2px 0 #000,2px -2px 0 #000,-2px 2px 0 #000,2px 2px 0 #000,0 3px 6px rgba(0,0,0,0.9)'
        : '-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000,1px 1px 0 #000,0 2px 3px rgba(0,0,0,0.7)';
    el.style.opacity   = '1';
    el.style.transform = 'translateY(0)';
    el.style.display   = 'block';
    requestAnimationFrame(() => {
        el.style.opacity   = '0';
        el.style.transform = 'translateY(-30px)';
    });
    setTimeout(() => {
        el.style.display = 'none';
        slot.inUse = false;
    }, 900);
}

function checkTreasureCollision() {
    const p = gameState.player;
    for (let i = gameState.treasures.length - 1; i >= 0; i--) {
        const t = gameState.treasures[i];
        if (wrappedDistance(p.x, p.y, t.x, t.y) < p.radius + t.radius) {
            const actualXP = addXP(50);
            showXPPopup(p.x, p.y, actualXP);
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
    const xpMult = (gameState.player.mutationXpBonus || 1);
    const finalAmount = xpMult !== 1 ? Math.round(amount * xpMult) : amount;
    gameState.stats.xpCurrent += finalAmount;
    gameState.player.levelXP  += finalAmount;
    checkLevelUp();
    return finalAmount; // 回傳實際加入的 XP（已乘 mutationXpBonus）
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

function resetTreeProductionTimer() {
    _treeProductionTimer = 0;
}
