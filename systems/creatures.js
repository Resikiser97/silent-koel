// =============================================================
// 生物系統 - updateNeutralCreatures / drawNeutralCreatures
//            updateHostileCreatures / drawCorpses / drawHostileCreatures
// =============================================================

// ── 肉系吃屍體成長（每具+10%基礎值，不累乘）──
function _carnivoreEatCorpse(creature, corpse) {
    creature.corpseEaten++;
    const bonus = creature.corpseEaten * 0.1; // 每吃1具+10%，不累乘

    // 回血5% maxHP
    creature.hp = Math.min(creature.maxHp, creature.hp + creature.maxHp * 0.05);

    // 成長數值（基礎值×bonus，不累乘）
    creature.maxHp   = creature.baseHp     * (1 + bonus);
    creature.hp      = Math.min(creature.maxHp, creature.hp);
    creature.speed   = creature.baseSpeed  * (1 + bonus);
    creature.damage  = creature.baseDamage * (1 + bonus);
    creature.radius  = creature.baseRadius * (1 + bonus);

    if (creature.isKiller) {
        // 殺手化後繼續吃：killerCorpseEaten 計數，再疊加+10%基礎值
        creature.killerCorpseEaten++;
        const kBonus = creature.killerCorpseEaten * 0.1;
        creature.damage  += creature.baseDamage * kBonus;
        creature.speed   += creature.baseSpeed  * kBonus;
        creature.maxHp   += creature.baseHp     * kBonus;
        creature.hp       = Math.min(creature.maxHp, creature.hp);
        creature.radius  += creature.baseRadius * kBonus;
    } else if (creature.corpseEaten >= 5 &&
               gameState.currentMap && gameState.currentMap.features &&
               gameState.currentMap.features.killer) {
        // 觸發殺手化
        _triggerKiller(creature);
    }
}

// ── 殺手化觸發（吃滿5具）──
function _triggerKiller(creature) {
    creature.isKiller         = true;
    creature.killerCorpseEaten = 0;
    creature.aggroRange       = creature.aggroRange * 2;
    creature.damage           = creature.baseDamage * (1 + 0.5 + 0.1 * creature.corpseEaten);
    creature.speed            = creature.baseSpeed  * (1 + 0.3 + 0.1 * creature.corpseEaten);
    creature.killerRegenTimer = 0;
}

function _triggerGiantization(creature) {
    const prevMaxHp = creature.maxHp || 30;
    const oldLeader = creature.packLeaderRef; // 保存舊隊長引用

    creature.isGiantized      = true;
    creature.damage           = (creature.damage || 0) + 20;
    creature.maxHp            = prevMaxHp * 10;
    creature.hp               = creature.maxHp;
    creature.radius           = creature.radius * 1.5;
    creature.aggroRange       = 150;
    creature.diet             = 'herbivore';
    creature.canFight         = true;
    creature.fruitsEaten      = 0;
    creature.giantRegenTimer  = 0;
    creature.packLeader       = true;
    creature.packMembers      = [];
    creature.packLeaderRef    = null;
    creature._packJoinTimer   = 0;
    creature._fruitTarget     = null;
    creature._fruitTargetTimer = 0;
    creature._seekingFruit    = false;

    // 若原本在隊伍中，且隊長尚未Alpha → 觸發Alpha升格
    if (oldLeader && oldLeader.hp > 0 && oldLeader.isGiantized && !oldLeader.isAlpha && !gameState.alphaCreature) {
        const idx = oldLeader.packMembers.indexOf(creature);
        if (idx !== -1) oldLeader.packMembers.splice(idx, 1);
        _triggerAlpha(oldLeader);
    }
}

function _triggerAlpha(creature) {
    creature.isAlpha          = true;
    creature.damage           = creature.damage * 2;
    creature.maxHp            = creature.maxHp * 3;
    creature.hp               = creature.maxHp;
    creature.radius           = creature.radius * 1.5;
    creature.aggroRange       = 300;
    creature.packFollowRange  = 1000;
    creature.giantRegenRate   = 0.02;
    gameState.alphaCreature   = creature;
    showAlphaAnnouncement(creature.name);
}

function updateNeutralCreatures() {
    const now = Date.now();
    const p   = gameState.player;
    const herbLv        = p.evolution.herbivore || 0;
    const isCalm        = herbLv >= 2; // Lv2：撞到不逃
    const isFriendly    = herbLv >= 3; // Lv3：完全不逃
    const isSuperFriendly = herbLv >= 4; // Lv4+：中立生物不因玩家靠近中斷休息

    for (const creature of gameState.neutralCreatures) {
        if (creature.hp <= 0) continue;
        if (creature.stunnedUntil && now < creature.stunnedUntil) continue;

        // ── 激進化生物（diet=aggressive）沿用舊邏輯 ──────────────
        if (creature.diet === 'aggressive') {
            const aggroRange = creature.aggroRange || 120;
            let target = null, bestDist = aggroRange;
            const dp = wrappedDistance(creature.x, creature.y, p.x, p.y);
            if (!isSuperFriendly && dp < bestDist) { target = p; bestDist = dp; }
            for (const h of gameState.hostileCreatures) {
                if (h.hp <= 0) continue;
                const d = wrappedDistance(creature.x, creature.y, h.x, h.y);
                if (d < bestDist) { target = h; bestDist = d; }
            }
            if (target) {
                creature.state = 'chasing';
                const { dx, dy } = wrappedDelta(creature.x, creature.y, target.x, target.y);
                const dist = Math.sqrt(dx * dx + dy * dy);
                const atkRange = creature.radius + (target.radius || 10) + 5;
                if (dist <= atkRange) {
                    if (now - (creature.attackCooldown || 0) >= 1000) {
                        creature.attackCooldown = now;
                        if (target === p) { applyDamageToPlayer(creature.damage || 8, creature); }
                        else {
                            target.hp -= creature.damage || 8;
                            if (target.hp <= 0) gameState.corpses.push({ x: target.x, y: target.y, radius: target.radius, spawnTime: now });
                        }
                    }
                } else {
                    moveCreature(creature, creature.x + Math.cos(Math.atan2(dy, dx)) * creature.speed, creature.y + Math.sin(Math.atan2(dy, dx)) * creature.speed);
                }
            } else {
                creature.state = 'wandering';
                if (!creature.wanderTarget || now - creature.lastWanderTime >= 2000) {
                    creature.wanderTarget = { x: Math.random() * MAP_WIDTH, y: Math.random() * MAP_HEIGHT };
                    creature.lastWanderTime = now;
                }
                if (creature.wanderTarget) {
                    const { dx: wdx, dy: wdy } = wrappedDelta(creature.x, creature.y, creature.wanderTarget.x, creature.wanderTarget.y);
                    if (Math.sqrt(wdx * wdx + wdy * wdy) < 2) { creature.wanderTarget = null; }
                    else { moveCreature(creature, creature.x + Math.cos(Math.atan2(wdy, wdx)) * creature.speed, creature.y + Math.sin(Math.atan2(wdy, wdx)) * creature.speed); }
                }
            }
            continue;
        }

        const distToPlayer = wrappedDistance(creature.x, creature.y, p.x, p.y);
        const touchDist    = creature.radius + p.radius;

        // ── 生態生物三態移動（有 biome 屬性）────────────────────
        if (creature.biome) {
            // ── 巨人化行為（優先處理）────────────────────────────
            if (creature.isGiantized) {
                // 每秒回血（Alpha 2%，普通巨人化 1%）
                const regenRate = creature.isAlpha ? (creature.giantRegenRate || 0.02) : 0.01;
                if (now - (creature.giantRegenTimer || 0) >= 1000) {
                    creature.giantRegenTimer = now;
                    creature.hp = Math.min(creature.maxHp, creature.hp + creature.maxHp * regenRate);
                }

                // 搜尋攻擊目標（敵意生物 / 玩家，草食性Lv4+除外）
                let giantTarget = null, giantTargetDist = creature.aggroRange;
                const giantHerbLv = p.evolution.herbivore || 0;
                if (giantHerbLv < 4) {
                    const dp = wrappedDistance(creature.x, creature.y, p.x, p.y);
                    if (dp < giantTargetDist) { giantTarget = p; giantTargetDist = dp; }
                }
                for (const h of gameState.hostileCreatures) {
                    if (h.hp <= 0) continue;
                    const d = wrappedDistance(creature.x, creature.y, h.x, h.y);
                    if (d < giantTargetDist) { giantTarget = h; giantTargetDist = d; }
                }

                if (giantTarget) {
                    creature.state = 'chasing';
                    const { dx: gadx, dy: gady } = wrappedDelta(creature.x, creature.y, giantTarget.x, giantTarget.y);
                    const gaDist    = Math.sqrt(gadx * gadx + gady * gady);
                    const gaAtkRange = creature.radius + (giantTarget.radius || 10) + 5;
                    if (gaDist <= gaAtkRange) {
                        if (now - (creature.attackCooldown || 0) >= 1000) {
                            creature.attackCooldown = now;
                            if (giantTarget === p) {
                                applyDamageToPlayer(creature.damage, creature);
                            } else {
                                giantTarget.hp -= creature.damage;
                                if (giantTarget.hp <= 0) handleKill(giantTarget, true);
                            }
                        }
                    } else {
                        const gaAngle = Math.atan2(gady, gadx);
                        moveCreature(creature, creature.x + Math.cos(gaAngle) * creature.speed,
                                               creature.y + Math.sin(gaAngle) * creature.speed);
                    }
                    continue;
                }
                creature.state = 'wandering';

                // 組隊管理（僅隊長）
                if (creature.packLeader) {
                    const followRange = creature.packFollowRange || 800; // Alpha 為 1000
                    if (now - (creature._packJoinTimer || 0) >= 3000) {
                        creature._packJoinTimer = now;
                        // 清除超出跟隨範圍或死亡的隊員
                        creature.packMembers = creature.packMembers.filter(m => {
                            if (m.hp <= 0) { m.packLeaderRef = null; return false; }
                            const d = wrappedDistance(creature.x, creature.y, m.x, m.y);
                            if (d > followRange) { m.packLeaderRef = null; return false; }
                            return true;
                        });
                        // 招募新隊員（同族同生態，20%機率，上限5隻含隊長）
                        if (creature.packMembers.length < 4) {
                            for (const n of gameState.neutralCreatures) {
                                if (creature.packMembers.length >= 4) break;
                                if (n === creature || n.hp <= 0 || n.packLeaderRef || n.isGiantized) continue;
                                if (n.biome !== creature.biome || n.speciesId !== creature.speciesId) continue;
                                const d = wrappedDistance(creature.x, creature.y, n.x, n.y);
                                if (d < followRange && Math.random() < 0.2) {
                                    n.packLeaderRef = creature;
                                    creature.packMembers.push(n);
                                }
                            }
                        }
                    }
                    // 等待隊員：有隊員距離 > 跟隨範圍75% 時暫停移動
                    const waitThreshold = followRange * 0.75;
                    let waitingForMember = false;
                    for (const m of creature.packMembers) {
                        if (m.hp <= 0) continue;
                        if (wrappedDistance(creature.x, creature.y, m.x, m.y) > waitThreshold) { waitingForMember = true; break; }
                    }
                    if (waitingForMember) continue;
                }

                // 帶領隊伍向最近果子移動（每3~5秒切換目標）
                if (!creature._fruitTarget || !gameState.fruits.includes(creature._fruitTarget) ||
                    now >= (creature._fruitTargetTimer || 0)) {
                    creature._fruitTargetTimer = now + 3000 + Math.random() * 2000;
                    let gfClosest = null, gfDist = Infinity;
                    for (const f of gameState.fruits) {
                        const d = wrappedDistance(creature.x, creature.y, f.x, f.y);
                        if (d < gfDist) { gfDist = d; gfClosest = f; }
                    }
                    creature._fruitTarget = gfClosest;
                }
                if (creature._fruitTarget) {
                    const { dx: ftdx, dy: ftdy } = wrappedDelta(creature.x, creature.y,
                        creature._fruitTarget.x, creature._fruitTarget.y);
                    creature._moveAngle = Math.atan2(ftdy, ftdx);
                } else {
                    creature._moveAngle = (creature._moveAngle || 0) + (Math.random() - 0.5) * 0.12;
                }
                moveCreature(creature, creature.x + Math.cos(creature._moveAngle) * creature.speed,
                                       creature.y + Math.sin(creature._moveAngle) * creature.speed);
                continue;
            }

            // 玩家碰撞：切換 fighting/fleeing
            if (distToPlayer < touchDist) {
                if (isFriendly) {
                    creature.state = 'wandering'; creature.isResting = false;
                } else if (isCalm) {
                    if (creature.canFight && creature.damage > 0) creature.state = 'fighting';
                } else {
                    creature.state = (creature.canFight && creature.damage > 0) ? 'fighting' : 'fleeing';
                    creature.isResting = false;
                }
            } else if ((creature.state === 'fighting' || creature.state === 'fleeing') && distToPlayer > touchDist + 50) {
                creature.state = 'wandering';
            } else if (isFriendly && (creature.state === 'fighting' || creature.state === 'fleeing')) {
                creature.state = 'wandering';
            }

            if (creature.state === 'fighting') {
                if (now - (creature.lastDamageTime || 0) >= 1000) {
                    applyDamageToPlayer(creature.damage || 3, creature);
                    creature.lastDamageTime = now;
                }
                continue;
            }
            if (creature.state === 'fleeing') {
                const { dx: fdx, dy: fdy } = wrappedDelta(p.x, p.y, creature.x, creature.y);
                moveCreature(creature, creature.x + Math.cos(Math.atan2(fdy, fdx)) * creature.speed,
                                       creature.y + Math.sin(Math.atan2(fdy, fdx)) * creature.speed);
                continue;
            }

            // 休息中：偵測中斷條件
            if (creature.isResting) {
                const playerNear = !isSuperFriendly && distToPlayer < 150;
                let hostileNear = false;
                for (const h of gameState.hostileCreatures) {
                    if (h.hp <= 0) continue;
                    if (wrappedDistance(creature.x, creature.y, h.x, h.y) < 150) { hostileNear = true; break; }
                }
                if (playerNear || hostileNear || now >= (creature._restEndTime || 0)) {
                    creature.isResting = false;
                    creature.state = 'wandering';
                } else {
                    creature._moveAngle += (Math.random() - 0.5) * 0.05;
                    moveCreature(creature, creature.x + Math.cos(creature._moveAngle) * (creature._restSpeed || 0),
                                           creature.y + Math.sin(creature._moveAngle) * (creature._restSpeed || 0));
                    continue;
                }
            }

            // 行為切換計時器（5~15 秒）
            if (now >= (creature._nextBehaviorTime || 0)) {
                creature._nextBehaviorTime = now + 5000 + Math.random() * 10000;
                const roll = Math.random();
                if (roll < 0.3) {
                    // 切換為休息（1.5 秒，速度 0~30%）
                    creature.isResting = true;
                    creature.state     = 'resting';
                    creature._restEndTime = now + 1500;
                    creature._restSpeed   = creature.speed * Math.random() * 0.3;
                } else if (roll < 0.6) {
                    creature._seekingFruit = true; // 切換為探索最近果子
                }
            }

            // 探索最近果子（範圍 400px）
            if (creature._seekingFruit) {
                let closest = null, closestDist = Infinity;
                for (const f of gameState.fruits) {
                    const d = wrappedDistance(creature.x, creature.y, f.x, f.y);
                    if (d < closestDist) { closestDist = d; closest = f; }
                }
                if (closest && closestDist < 400) {
                    const { dx: fdx, dy: fdy } = wrappedDelta(creature.x, creature.y, closest.x, closest.y);
                    creature._moveAngle = Math.atan2(fdy, fdx);
                    if (closestDist < creature.radius + 6) {
                        const idx = gameState.fruits.indexOf(closest);
                        if (idx !== -1) gameState.fruits.splice(idx, 1);
                        creature.fruitsEaten = (creature.fruitsEaten || 0) + 1;
                        creature.hp += 3; creature.maxHp += 3; creature.speed += 0.05;
                        // 吃滿5顆且地圖開啟巨人化特性 → 觸發巨人化（移除舊激進化邏輯）
                        const featureGiant = !!(gameState.currentMap && gameState.currentMap.features &&
                                                gameState.currentMap.features.giantization);
                        if (creature.fruitsEaten >= 5 && featureGiant) {
                            _triggerGiantization(creature);
                        }
                        creature._seekingFruit = false;
                    }
                } else {
                    creature._seekingFruit = false;
                }
            }

            // 隊員跟隨隊長（有 packLeaderRef 時）
            if (creature.packLeaderRef) {
                if (creature.packLeaderRef.hp <= 0) {
                    creature.packLeaderRef = null; // 隊長死亡：脫隊
                } else {
                    const leader   = creature.packLeaderRef;
                    const dLeader  = wrappedDistance(creature.x, creature.y, leader.x, leader.y);
                    if (dLeader > 200) { // 超過200px才追隨
                        const { dx: ldx, dy: ldy } = wrappedDelta(creature.x, creature.y, leader.x, leader.y);
                        creature._moveAngle = Math.atan2(ldy, ldx);
                        moveCreature(creature, creature.x + Math.cos(creature._moveAngle) * creature.speed,
                                               creature.y + Math.sin(creature._moveAngle) * creature.speed);
                    }
                    continue;
                }
            }

            // 漫遊：每幀小幅偏移角度（模擬 Perlin Noise 平滑）
            creature._moveAngle = (creature._moveAngle || 0) + (Math.random() - 0.5) * 0.12;
            moveCreature(creature, creature.x + Math.cos(creature._moveAngle) * creature.speed,
                                   creature.y + Math.sin(creature._moveAngle) * creature.speed);
            continue;
        }

        // ── 非生態生物：舊邏輯（向後相容）───────────────────────
        if (distToPlayer < touchDist) {
            if (isFriendly)    { creature.state = 'idle'; }
            else if (isCalm)   { creature.state = creature.canFight ? 'fighting' : 'idle'; }
            else               { creature.state = creature.canFight ? 'fighting' : 'fleeing'; }
        } else if ((creature.state === 'fighting' || creature.state === 'fleeing') && distToPlayer > touchDist + 50) {
            creature.state = 'idle';
        } else if (isFriendly && (creature.state === 'fighting' || creature.state === 'fleeing')) {
            creature.state = 'idle';
        }
        if (creature.state === 'fighting') {
            if (now - creature.lastDamageTime >= 1000) { applyDamageToPlayer(3, creature); creature.lastDamageTime = now; }
            continue;
        }
        if (creature.state === 'fleeing') {
            const { dx: fdx, dy: fdy } = wrappedDelta(p.x, p.y, creature.x, creature.y);
            moveCreature(creature, creature.x + Math.cos(Math.atan2(fdy, fdx)) * creature.speed,
                                   creature.y + Math.sin(Math.atan2(fdy, fdx)) * creature.speed);
            continue;
        }
        if (creature.diet === 'herbivore' || creature.diet === 'omnivore') {
            let closestIdx = -1, closestDist = 80;
            for (let i = 0; i < gameState.fruits.length; i++) {
                const d = wrappedDistance(creature.x, creature.y, gameState.fruits[i].x, gameState.fruits[i].y);
                if (d < closestDist) { closestDist = d; closestIdx = i; }
            }
            if (closestIdx !== -1) {
                const fruit = gameState.fruits[closestIdx];
                const { dx: fdx, dy: fdy } = wrappedDelta(creature.x, creature.y, fruit.x, fruit.y);
                moveCreature(creature, creature.x + Math.cos(Math.atan2(fdy, fdx)) * creature.speed,
                                       creature.y + Math.sin(Math.atan2(fdy, fdx)) * creature.speed);
                if (closestDist < creature.radius + 6) {
                    gameState.fruits.splice(closestIdx, 1);
                    creature.fruitsEaten = (creature.fruitsEaten || 0) + 1;
                    creature.hp += 3; creature.maxHp = (creature.maxHp || 30) + 3; creature.speed += 0.15;
                    if (creature.fruitsEaten >= 5 && creature.diet !== 'aggressive') {
                        creature.diet = 'aggressive'; creature.damage = 8; creature.aggroRange = 120;
                    }
                }
                continue;
            }
        }
        if (!creature.wanderTarget || now - creature.lastWanderTime >= 3000) {
            creature.wanderTarget = { x: Math.random() * (MAP_WIDTH - 60) + 30, y: Math.random() * (MAP_HEIGHT - 60) + 30 };
            creature.lastWanderTime = now;
            creature.state = 'wandering';
        }
        if (creature.wanderTarget) {
            const { dx: wdx, dy: wdy } = wrappedDelta(creature.x, creature.y, creature.wanderTarget.x, creature.wanderTarget.y);
            const dist = Math.sqrt(wdx * wdx + wdy * wdy);
            if (dist < 2) { creature.wanderTarget = null; creature.state = 'idle'; }
            else { moveCreature(creature, creature.x + Math.cos(Math.atan2(wdy, wdx)) * creature.speed, creature.y + Math.sin(Math.atan2(wdy, wdx)) * creature.speed); }
        }
    }
}

function drawNeutralCreatures() {
    for (const creature of gameState.neutralCreatures) {
        if (creature.hp <= 0) continue;
        const s = worldToScreen(creature.x, creature.y);
        if (s.x < -50 || s.x > VIEW_W + 50 || s.y < -50 || s.y > VIEW_H + 50) continue;

        const nBiome = getBiome(creature.x, creature.y);
        let baseC, aggrC, fleeC, fightC;
        if (nBiome === 'ocean') {
            baseC = '#4499CC'; aggrC = '#224488'; fleeC = '#88CCFF'; fightC = '#336699';
        } else if (nBiome === 'desert') {
            baseC = '#CC9944'; aggrC = '#884422'; fleeC = '#FFCC44'; fightC = '#AA6622';
        } else {
            baseC = 'orange'; aggrC = '#CC4400'; fleeC = 'yellow'; fightC = '#CC5500';
        }
        let color = baseC;
        if (creature.isAlpha)                    color = '#FFD700'; // Alpha：金色
        else if (creature.isGiantized)           color = '#FF8800'; // 巨人化：橙色
        else if (creature.diet === 'aggressive') color = aggrC;
        else if (creature.state === 'fleeing')   color = fleeC;
        else if (creature.state === 'fighting')  color = fightC;

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, creature.radius, 0, Math.PI * 2);
        ctx.fill();

        const barW = 20, barH = 4;
        const barX = s.x - barW / 2;
        const barY = s.y - creature.radius - 8;
        ctx.fillStyle = '#555';
        ctx.fillRect(barX, barY, barW, barH);
        ctx.fillStyle = '#00CC00';
        ctx.fillRect(barX, barY, barW * (creature.hp / (creature.maxHp || 30)), barH);
        const displayName = creature.isAlpha     ? (creature.name || '') + '（Alpha）'
                          : creature.isGiantized ? (creature.name || '') + '（巨人化）'
                          : (creature.name || '');
        if (displayName) {
            ctx.save();
            ctx.shadowColor = '#000'; ctx.shadowBlur = 3;
            ctx.fillStyle = creature.isAlpha ? '#FFD700' : '#FFFFFF';
            ctx.font = creature.isGiantized ? 'bold 13px Arial' : '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(displayName, s.x, s.y - creature.radius - 10);
            ctx.restore();
        }
    }
}

function updateHostileCreatures() {
    const now = Date.now();
    const p = gameState.player;

    // 清除超過 60 秒的屍體
    gameState.corpses = gameState.corpses.filter(c => now - c.spawnTime < 60000);

    for (const creature of gameState.hostileCreatures) {
        if (creature.hp <= 0) continue;
        if (creature.stunnedUntil && now < creature.stunnedUntil) continue;

        // ── 殺手化：每5秒回復1% maxHP ──────────────────────────────
        if (creature.isKiller) {
            if (now - (creature.killerRegenTimer || 0) >= 5000) {
                creature.killerRegenTimer = now;
                creature.hp = Math.min(creature.maxHp, creature.hp + creature.maxHp * 0.01);
            }
        }

        // ── 肉系吃屍體（僅普通地圖 hostileEatMeat 開啟）──────────
        const featureEatMeat = !!(gameState.currentMap && gameState.currentMap.features &&
                                  gameState.currentMap.features.hostileEatMeat);
        if (featureEatMeat && creature.diet === 'carnivore') {
            if (creature.state === 'eating') {
                // 吃屍體期間 aggroRange×1.5，有生物進入則中斷
                const tempAggro = (creature.eatBaseAggroRange || creature.aggroRange) * 1.5;
                let interrupted = false;
                if (wrappedDistance(creature.x, creature.y, gameState.player.x, gameState.player.y) < tempAggro) interrupted = true;
                if (!interrupted) {
                    for (const n of gameState.neutralCreatures) {
                        if (n.hp <= 0) continue;
                        if (wrappedDistance(creature.x, creature.y, n.x, n.y) < tempAggro) { interrupted = true; break; }
                    }
                }
                if (interrupted) {
                    // 中斷：進度重置，進入巡邏
                    creature.state = 'patrolling';
                    creature.eatTickTimer = 0;
                    creature.eatTicks = 0;
                    creature.eatTarget = null;
                    // 繼續執行下方追擊邏輯
                } else {
                    // 每0.5秒一tick，6 ticks（3秒）完成一具屍體
                    creature.eatTickTimer = (creature.eatTickTimer || 0) + FIXED_DELTA;
                    while (creature.eatTickTimer >= 500) {
                        creature.eatTickTimer -= 500;
                        creature.eatTicks = (creature.eatTicks || 0) + 1;
                        if (creature.eatTicks >= 6) {
                            // 吃完：移除屍體 + 呼叫成長
                            const corpseIdx = gameState.corpses.indexOf(creature.eatTarget);
                            if (corpseIdx !== -1) gameState.corpses.splice(corpseIdx, 1);
                            if (creature.eatTarget) _carnivoreEatCorpse(creature, creature.eatTarget);
                            creature.state = 'patrolling';
                            creature.eatTickTimer = 0;
                            creature.eatTicks = 0;
                            creature.eatTarget = null;
                            break;
                        }
                    }
                    if (creature.state === 'eating') continue; // 仍在吃，跳過其他邏輯
                }
            } else if (creature.state !== 'chasing') {
                // 漫遊/休息時：偵測60px內的屍體
                let closestCorpse = null, closestCorpseDist = 60;
                for (const corpse of gameState.corpses) {
                    const d = wrappedDistance(creature.x, creature.y, corpse.x, corpse.y);
                    if (d < closestCorpseDist) { closestCorpseDist = d; closestCorpse = corpse; }
                }
                if (closestCorpse) {
                    creature.state = 'eating';
                    creature.eatTarget = closestCorpse;
                    creature.eatTickTimer = 0;
                    creature.eatTicks = 0;
                    creature.eatBaseAggroRange = creature.aggroRange;
                    continue; // 進入吃屍體，跳過其他邏輯
                }
            }
        }

        // 尋找最近目標（玩家 > 中立生物）
        let bestTarget = null;
        let bestDist = Infinity;
        let bestType = null;

        const effectiveAggroRange = Math.max(60, creature.aggroRange - p.aggroRangeReduction);
        const distToPlayer = wrappedDistance(creature.x, creature.y, p.x, p.y);
        if (distToPlayer < effectiveAggroRange) {
            bestTarget = p;
            bestDist = distToPlayer;
            bestType = 'player';
        }

        for (const neutral of gameState.neutralCreatures) {
            if (neutral.hp <= 0) continue;
            const d = wrappedDistance(creature.x, creature.y, neutral.x, neutral.y);
            if (d < effectiveAggroRange && d < bestDist) {
                bestTarget = neutral;
                bestDist = d;
                bestType = 'neutral';
            }
        }

        // 狀態切換
        if (bestTarget !== null) {
            creature.state = 'chasing';
            creature.target = bestTarget;
            creature.targetType = bestType;
        } else if (creature.state === 'chasing') {
            const t = creature.target;
            const d = t ? wrappedDistance(creature.x, creature.y, t.x, t.y) : Infinity;
            if (!t || t.hp <= 0 || d > effectiveAggroRange + 200) {
                creature.state = 'patrolling';
                creature.target = null;
                creature.targetType = null;
            }
        }

        // 追擊與攻擊
        if (creature.state === 'chasing' && creature.target) {
            const t = creature.target;
            const { dx, dy } = wrappedDelta(creature.x, creature.y, t.x, t.y);
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist <= creature.attackRange) {
                if (now - creature.attackCooldown >= 1000) {
                    if (creature.targetType === 'player') {
                        applyDamageToPlayer(creature.damage, creature);
                    } else if (creature.targetType === 'neutral') {
                        creature.target.hp -= creature.damage;
                        if (creature.target.hp <= 0) {
                            const deadNeutral = creature.target;
                            // 清理巨人化/Alpha相關狀態
                            if (deadNeutral.isGiantized) {
                                if (deadNeutral.isAlpha && gameState.alphaCreature === deadNeutral) {
                                    gameState.alphaCreature = null;
                                }
                                if (deadNeutral.packMembers) {
                                    for (const pm of deadNeutral.packMembers) pm.packLeaderRef = null;
                                }
                                if (gameState.topBarTarget === deadNeutral) {
                                    gameState.topBarTarget = null;
                                    gameState.topBarFadeTimer = 0;
                                }
                            }
                            gameState.corpses.push({
                                x: deadNeutral.x, y: deadNeutral.y,
                                radius: deadNeutral.radius, spawnTime: now
                            });
                            // 擊殺後回到巡邏狀態
                            creature.state = 'patrolling';
                            creature.target = null;
                            creature.targetType = null;
                        }
                    }
                    creature.attackCooldown = now;
                }
            } else {
                const angle = Math.atan2(dy, dx);
                moveCreature(creature, creature.x + Math.cos(angle) * creature.speed, creature.y + Math.sin(angle) * creature.speed);
            }
            continue;
        }

        // ── 生態肉系生物三態移動 ──────────────────────────────────
        if (creature.biome) {
            // 行為切換計時器（5~15 秒）
            if (now >= (creature._nextBehaviorTime || 0)) {
                creature._nextBehaviorTime = now + 5000 + Math.random() * 10000;
                const roll = Math.random();
                if (roll < 0.3) {
                    creature.isResting    = true;
                    creature._restEndTime = now + 1500;
                    creature._restSpeed   = creature.speed * Math.random() * 0.3;
                } else if (roll < 0.6) {
                    creature._seekingPrey = true; // 切換為探索最近草系生物
                }
            }

            // 休息中（有目標時立即中斷）
            if (creature.isResting) {
                if (creature.state === 'chasing' || now >= (creature._restEndTime || 0)) {
                    creature.isResting = false;
                } else {
                    creature._moveAngle = (creature._moveAngle || 0) + (Math.random() - 0.5) * 0.05;
                    moveCreature(creature, creature.x + Math.cos(creature._moveAngle) * (creature._restSpeed || 0),
                                           creature.y + Math.sin(creature._moveAngle) * (creature._restSpeed || 0));
                    continue;
                }
            }

            // 探索最近草系生物（範圍 500px）
            if (creature._seekingPrey) {
                let closest = null, closestDist = Infinity;
                for (const n of gameState.neutralCreatures) {
                    if (n.hp <= 0) continue;
                    const d = wrappedDistance(creature.x, creature.y, n.x, n.y);
                    if (d < closestDist) { closestDist = d; closest = n; }
                }
                if (closest && closestDist < 500) {
                    const { dx, dy } = wrappedDelta(creature.x, creature.y, closest.x, closest.y);
                    creature._moveAngle = Math.atan2(dy, dx);
                    if (closestDist < creature.radius + closest.radius + 5) creature._seekingPrey = false;
                } else {
                    creature._seekingPrey = false;
                }
            }

            // 漫遊：每幀小幅偏移角度（模擬 Perlin Noise 平滑）
            creature._moveAngle = (creature._moveAngle || 0) + (Math.random() - 0.5) * 0.12;
            moveCreature(creature, creature.x + Math.cos(creature._moveAngle) * creature.speed,
                                   creature.y + Math.sin(creature._moveAngle) * creature.speed);
            continue;
        }

        // ── 非生態生物：舊巡邏邏輯（向後相容）──────────────────
        if (!creature.wanderTarget || now - creature.lastWanderTime >= 2000) {
            creature.wanderTarget = { x: Math.random() * (MAP_WIDTH - 60) + 30, y: Math.random() * (MAP_HEIGHT - 60) + 30 };
            creature.lastWanderTime = now;
        }
        if (creature.wanderTarget) {
            const { dx: wdx, dy: wdy } = wrappedDelta(creature.x, creature.y, creature.wanderTarget.x, creature.wanderTarget.y);
            const dist = Math.sqrt(wdx * wdx + wdy * wdy);
            if (dist < 2) { creature.wanderTarget = null; }
            else { moveCreature(creature, creature.x + Math.cos(Math.atan2(wdy, wdx)) * creature.speed, creature.y + Math.sin(Math.atan2(wdy, wdx)) * creature.speed); }
        }
    }
}

function drawCorpses() {
    for (const corpse of gameState.corpses) {
        const s = worldToScreen(corpse.x, corpse.y);
        if (s.x < -50 || s.x > VIEW_W + 50 || s.y < -50 || s.y > VIEW_H + 50) continue;
        ctx.fillStyle = '#888';
        ctx.beginPath();
        ctx.arc(s.x, s.y, corpse.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawHostileCreatures() {
    for (const creature of gameState.hostileCreatures) {
        if (creature.hp <= 0) continue;
        const s = worldToScreen(creature.x, creature.y);
        if (s.x < -50 || s.x > VIEW_W + 50 || s.y < -50 || s.y > VIEW_H + 50) continue;

        const hBiome = getBiome(creature.x, creature.y);
        const hNormalC  = hBiome === 'ocean' ? '#CC4466' : (hBiome === 'desert' ? '#CC8800' : 'red');
        const hChasingC = hBiome === 'ocean' ? '#882244' : (hBiome === 'desert' ? '#885500' : '#8B0000');
        ctx.fillStyle = creature.state === 'chasing' ? hChasingC : hNormalC;
        ctx.beginPath();
        ctx.arc(s.x, s.y, creature.radius, 0, Math.PI * 2);
        ctx.fill();

        const barW = 20, barH = 4;
        const barX = s.x - barW / 2;
        const barY = s.y - creature.radius - 8;
        ctx.fillStyle = '#550000';
        ctx.fillRect(barX, barY, barW, barH);
        ctx.fillStyle = '#00CC00';
        ctx.fillRect(barX, barY, barW * (creature.hp / (creature.maxHp || 50)), barH);
        if (creature.name) {
            ctx.save();
            ctx.shadowColor = '#000'; ctx.shadowBlur = 3;
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(creature.name, s.x, s.y - creature.radius - 10);
            ctx.restore();
        }
    }
}
