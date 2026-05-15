// =============================================================
// 生物系統 - updateNeutralCreatures / drawNeutralCreatures
//            updateHostileCreatures / drawCorpses / drawHostileCreatures
// =============================================================

function updateNeutralCreatures() {
    const now = Date.now();
    const p = gameState.player;

    for (const creature of gameState.neutralCreatures) {
        if (creature.hp <= 0) continue;
        if (creature.stunnedUntil && now < creature.stunnedUntil) continue;

        // 激進化生物：行為與敵意生物相同
        if (creature.diet === 'aggressive') {
            const aggroRange = creature.aggroRange || 120;
            let target = null;
            let bestDist = aggroRange;
            const dp = wrappedDistance(creature.x, creature.y, p.x, p.y);
            if (dp < bestDist) { target = p; bestDist = dp; }
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
                        if (target === p) {
                            applyDamageToPlayer(creature.damage || 8, creature);
                        } else {
                            target.hp -= creature.damage || 8;
                            if (target.hp <= 0) gameState.corpses.push({ x: target.x, y: target.y, radius: target.radius, spawnTime: now });
                        }
                    }
                } else {
                    const angle = Math.atan2(dy, dx);
                    moveCreature(creature, creature.x + Math.cos(angle) * creature.speed, creature.y + Math.sin(angle) * creature.speed);
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
                    else {
                        const wa = Math.atan2(wdy, wdx);
                        moveCreature(creature, creature.x + Math.cos(wa) * creature.speed, creature.y + Math.sin(wa) * creature.speed);
                    }
                }
            }
            continue;
        }

        const distToPlayer = wrappedDistance(creature.x, creature.y, p.x, p.y);
        const touchDist = creature.radius + p.radius;

        // 草食安撫：Lv2=100px 不逃跑，Lv3=150px 完全友善
        const herbLv = p.evolution.herbivore || 0;
        const isCalm     = herbLv >= 2 && distToPlayer < 100;
        const isFriendly = herbLv >= 3 && distToPlayer < 150;

        // 判斷與玩家碰撞狀態
        if (distToPlayer < touchDist) {
            if (!isFriendly) {
                creature.state = (isCalm && !creature.canFight) ? 'idle' : (creature.canFight ? 'fighting' : 'fleeing');
            }
        } else if ((creature.state === 'fighting' || creature.state === 'fleeing') && distToPlayer > touchDist + 50) {
            creature.state = 'idle';
        } else if (isFriendly && (creature.state === 'fighting' || creature.state === 'fleeing')) {
            creature.state = 'idle';
        } else if (isCalm && creature.state === 'fleeing') {
            creature.state = 'idle';
        }

        // fighting：每秒扣玩家 3HP，生物原地不動
        if (creature.state === 'fighting') {
            if (now - creature.lastDamageTime >= 1000) {
                applyDamageToPlayer(3, creature);
                creature.lastDamageTime = now;
            }
            continue;
        }

        // fleeing：逃離玩家（取環繞最短路徑的反方向）
        if (creature.state === 'fleeing') {
            const { dx: fdx, dy: fdy } = wrappedDelta(p.x, p.y, creature.x, creature.y);
            const fa = Math.atan2(fdy, fdx);
            moveCreature(creature, creature.x + Math.cos(fa) * creature.speed, creature.y + Math.sin(fa) * creature.speed);
            continue;
        }

        // 草食/雜食：吃附近 80px 內的果子
        if (creature.diet === 'herbivore' || creature.diet === 'omnivore') {
            let closestIdx = -1;
            let closestDist = 80;
            for (let i = 0; i < gameState.fruits.length; i++) {
                const fruit = gameState.fruits[i];
                const d = wrappedDistance(creature.x, creature.y, fruit.x, fruit.y);
                if (d < closestDist) { closestDist = d; closestIdx = i; }
            }
            if (closestIdx !== -1) {
                const fruit = gameState.fruits[closestIdx];
                const { dx: fdx, dy: fdy } = wrappedDelta(creature.x, creature.y, fruit.x, fruit.y);
                const fa = Math.atan2(fdy, fdx);
                moveCreature(creature, creature.x + Math.cos(fa) * creature.speed, creature.y + Math.sin(fa) * creature.speed);
                if (closestDist < creature.radius + 6) {
                    gameState.fruits.splice(closestIdx, 1);
                    creature.fruitsEaten = (creature.fruitsEaten || 0) + 1;
                    creature.hp += 3;
                    creature.maxHp = (creature.maxHp || 30) + 3;
                    creature.speed += 0.05;
                    // 超過5顆後變激進
                    if (creature.fruitsEaten >= 5 && creature.diet !== 'aggressive') {
                        creature.diet = 'aggressive';
                        creature.damage = 8;
                        creature.aggroRange = 120;
                    }
                }
                continue;
            }
        }

        // idle/wandering：每 3 秒選新漫遊目標
        if (!creature.wanderTarget || now - creature.lastWanderTime >= 3000) {
            creature.wanderTarget = {
                x: Math.random() * (MAP_WIDTH  - 60) + 30,
                y: Math.random() * (MAP_HEIGHT - 60) + 30
            };
            creature.lastWanderTime = now;
            creature.state = 'wandering';
        }

        if (creature.wanderTarget) {
            const { dx: wdx, dy: wdy } = wrappedDelta(creature.x, creature.y, creature.wanderTarget.x, creature.wanderTarget.y);
            const dist = Math.sqrt(wdx * wdx + wdy * wdy);
            if (dist < 2) {
                creature.wanderTarget = null;
                creature.state = 'idle';
            } else {
                const wa = Math.atan2(wdy, wdx);
                moveCreature(creature, creature.x + Math.cos(wa) * creature.speed, creature.y + Math.sin(wa) * creature.speed);
            }
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
        if (creature.diet === 'aggressive') color = aggrC;
        else if (creature.state === 'fleeing') color = fleeC;
        else if (creature.state === 'fighting') color = fightC;

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

function updateHostileCreatures() {
    const now = Date.now();
    const p = gameState.player;

    // 清除超過 60 秒的屍體
    gameState.corpses = gameState.corpses.filter(c => now - c.spawnTime < 60000);

    for (const creature of gameState.hostileCreatures) {
        if (creature.hp <= 0) continue;
        if (creature.stunnedUntil && now < creature.stunnedUntil) continue;

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
                            gameState.corpses.push({
                                x: creature.target.x, y: creature.target.y,
                                radius: creature.target.radius, spawnTime: now
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

        // carnivore/omnivore 吃附近屍體
        if (creature.diet === 'carnivore' || creature.diet === 'omnivore') {
            let closestIdx = -1;
            let closestDist = creature.aggroRange;
            for (let i = 0; i < gameState.corpses.length; i++) {
                const corpse = gameState.corpses[i];
                const d = wrappedDistance(creature.x, creature.y, corpse.x, corpse.y);
                if (d < closestDist) { closestDist = d; closestIdx = i; }
            }
            if (closestIdx !== -1) {
                const corpse = gameState.corpses[closestIdx];
                if (closestDist < creature.radius + corpse.radius) {
                    creature.speed = Math.min(2.5, Math.round((creature.speed + 0.1) * 10) / 10);
                    creature.damage = Math.min(20, creature.damage + 1);
                    gameState.corpses.splice(closestIdx, 1);
                } else {
                    const { dx: cdx, dy: cdy } = wrappedDelta(creature.x, creature.y, corpse.x, corpse.y);
                    moveCreature(creature, creature.x + Math.cos(Math.atan2(cdy, cdx)) * creature.speed, creature.y + Math.sin(Math.atan2(cdy, cdx)) * creature.speed);
                    continue;
                }
            }
        }

        // patrolling：每 2 秒換漫遊目標
        if (!creature.wanderTarget || now - creature.lastWanderTime >= 2000) {
            creature.wanderTarget = {
                x: Math.random() * (MAP_WIDTH  - 60) + 30,
                y: Math.random() * (MAP_HEIGHT - 60) + 30
            };
            creature.lastWanderTime = now;
        }

        if (creature.wanderTarget) {
            const { dx: wdx, dy: wdy } = wrappedDelta(creature.x, creature.y, creature.wanderTarget.x, creature.wanderTarget.y);
            const dist = Math.sqrt(wdx * wdx + wdy * wdy);
            if (dist < 2) {
                creature.wanderTarget = null;
            } else {
                const wa = Math.atan2(wdy, wdx);
                moveCreature(creature, creature.x + Math.cos(wa) * creature.speed, creature.y + Math.sin(wa) * creature.speed);
            }
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
