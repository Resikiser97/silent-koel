// =============================================================
// 戰鬥系統 - showFloatingText / applyDamageToPlayer / handleKill
//            playerAttack / updateStatusEffects
//            updateCorpseEating / drawCorpseEatingBars
// =============================================================

function showFloatingText(wx, wy, text, color, fontSize) {
    const s = worldToScreen(wx, wy);
    if (s.x < -30 || s.x > VIEW_W + 30 || s.y < -30 || s.y > VIEW_H + 30) return;
    const el = document.createElement('div');
    const fz = fontSize || 16;
    el.style.cssText = 'position:absolute;pointer-events:none;font-size:' + fz + 'px;font-weight:bold;animation:fadeOutUp 0.8s forwards;text-shadow:1px 1px 2px black;';
    el.style.left = (s.x - 20) + 'px';
    el.style.top  = (s.y - 10) + 'px';
    el.style.color = color || 'white';
    el.innerText = text;
    document.getElementById('ui-overlay').appendChild(el);
    setTimeout(() => el.remove(), 800);
}

function applyDamageToPlayer(rawDamage, attacker) {
    const p = gameState.player;
    const final = Math.max(1, Math.round(rawDamage * (1 - p.damageReduction)));
    gameState.stats.hpCurrent = Math.max(0, gameState.stats.hpCurrent - final);
    AudioManager.play('hurt');
    if (p.thornDamage > 0 && attacker && attacker.hp > 0) {
        const thornMult = p.comboShellArmor ? 2 : 1; // 龜殼+刺甲組合：反傷翻倍
        let thornTotal = Math.round(final * p.thornDamage * thornMult);
        if (p.thornPlayerAtkReflect) thornTotal += Math.round(p.attack * 0.05);
        attacker.hp -= thornTotal;
        if (attacker.hp <= 0) {
            if (attacker === gameState.boss) {
                showVictory();
            } else if (attacker === gameState.eliteCreature) {
                handleEliteKill(attacker);
            } else {
                const isHostile = gameState.hostileCreatures.includes(attacker);
                handleKill(attacker, isHostile);
            }
        }
    }
    if (gameState.stats.hpCurrent <= 0) {
        const tenacityLevel = gameState.playerSkills.tenacity || 0;
        if (tenacityLevel > 0 && !p.tenacityUsed) {
            // 頑強意志：每局觸發一次，保留 10%×等級的 HP
            gameState.stats.hpCurrent = Math.max(1, Math.ceil(gameState.stats.hpMax * 0.1 * tenacityLevel));
            p.tenacityUsed = true;
            showFloatingText(p.x, p.y - 40, t('tenacityFloat'), '#FF8800');
            return;
        }
        showSkillTree();
    }
}

function handleKill(c, isHostile) {
    const p = gameState.player;
    gameState.corpses.push({ x: c.x, y: c.y, radius: c.radius, spawnTime: Date.now() });
    const baseXP = isHostile ? Math.min(80, 30 + Math.round(((c.maxHp || 50) / 50) * 50)) : 20;
    const xp = baseXP + (gameState.playerSkills.hunter || 0) * 10;
    addXP(xp);
    showXPPopup(p.x, p.y, xp);
}

function playerAttack() {
    const p = gameState.player;
    const now = Date.now();
    const cooldownMs = Math.round(1000 / p.attackSpeed);
    if (now - p.attackTimer < cooldownMs) return;
    p.attackTimer = now;

    if (p.attack <= 0) {
        showFloatingText(p.x, p.y - 30, t('noAttackOrgan'), '#FF8800');
        return;
    }

    p.attackVisual = now;

    const targets = [
        ...gameState.hostileCreatures.map(c => ({ c, hostile: true, isBoss: false, isElite: false })),
        ...gameState.neutralCreatures.map(c => ({ c, hostile: false, isBoss: false, isElite: false })),
        ...(gameState.boss && gameState.boss.hp > 0 ? [{ c: gameState.boss, hostile: true, isBoss: true, isElite: false }] : []),
        ...(gameState.eliteCreature && gameState.eliteCreature.hp > 0 ? [{ c: gameState.eliteCreature, hostile: true, isBoss: false, isElite: true }] : [])
    ];

    let anyHit = false, anyCrit = false, bossDied = false;

    for (const { c, hostile, isBoss, isElite } of targets) {
        if (c.hp <= 0) continue;
        if (wrappedDistance(p.x, p.y, c.x, c.y) > p.attackRange) continue;

        let dmg = p.attack;
        let isCrit = false;
        if (p.critChance > 0 && Math.random() < p.critChance) {
            dmg = Math.round(dmg * p.critMultiplier);
            isCrit = true;
        }
        anyHit = true;
        if (isCrit) anyCrit = true;

        c.hp -= dmg;
        showFloatingText(c.x, c.y - 15, (isCrit ? '⚡' : '') + dmg, isCrit ? '#FFD700' : '#FF4444');

        // 蟹鉗：等級化流血
        const crabLv = getOrganLevel('crabClaw');
        if (crabLv > 0) {
            const bleedChance = getOrganCumulative('crabClaw', 'bleedChance');
            if (Math.random() < bleedChance) {
                const baseDmg = getOrganCumulative('crabClaw', 'bleedDmg');
                c.bleedEndTime = now + getOrganCumulative('crabClaw', 'bleedDur');
                c.bleedDmg = p.comboCrabPoison ? baseDmg * 2 : baseDmg;
                c.lastBleedTick = now;
            }
        }

        // 毒刺：等級化中毒
        const poisonLv = getOrganLevel('poisonStinger');
        if (poisonLv > 0) {
            const basePoisonDmg = getOrganCumulative('poisonStinger', 'poisonDmg');
            c.poisonEndTime = now + getOrganCumulative('poisonStinger', 'poisonDur');
            c.poisonDmg = p.comboCrabPoison ? basePoisonDmg * 2 : basePoisonDmg;
            c.lastPoisonTick = now;
        }

        // 獠牙：等級化暈眩；真視之眼+獠牙組合：暴擊也觸發暈眩
        const fangLv = getOrganLevel('fang');
        if (fangLv > 0) {
            const stunChance = getOrganCumulative('fang', 'stunChance');
            if (Math.random() < stunChance || (p.comboEyeFang && isCrit)) {
                c.stunnedUntil = now + ORGANS.fang.levels[0].effects.stunDur;
            }
        }

        if (!hostile && !isElite) {
            c.state = c.canFight ? 'fighting' : 'fleeing';
        }

        if (c.hp <= 0) {
            if (isBoss) { bossDied = true; continue; }
            if (isElite) { handleEliteKill(c); continue; }
            handleKill(c, hostile);
        }
    }

    if (anyHit) AudioManager.play(anyCrit ? 'attackCrit' : 'attackNormal');
    if (bossDied) showVictory();
}

function updateStatusEffects() {
    const now = Date.now();
    const eliteArr = (gameState.eliteCreature && gameState.eliteCreature.hp > 0) ? [gameState.eliteCreature] : [];
    for (const c of [...gameState.hostileCreatures, ...gameState.neutralCreatures, ...eliteArr]) {
        if (c.hp <= 0) continue;
        const isElite = c === gameState.eliteCreature;
        const isHostile = gameState.hostileCreatures.includes(c);

        if (c.bleedEndTime && now < c.bleedEndTime && now - (c.lastBleedTick || 0) >= 1000) {
            const bleedAmt = c.bleedDmg || 1;
            const hpBefore = c.hp;
            c.hp -= bleedAmt;
            c.lastBleedTick = now;
            showFloatingText(c.x, c.y - 18, t('bleedFloat', { n: bleedAmt }), '#880000', 11);
            if (hpBefore > 0 && c.hp <= 0) {
                if (isElite) handleEliteKill(c);
                else handleKill(c, isHostile);
            }
        }

        if (c.poisonEndTime && now < c.poisonEndTime && now - (c.lastPoisonTick || 0) >= 1000) {
            const poisonAmt = c.poisonDmg || 2;
            const hpBefore = c.hp;
            c.hp -= poisonAmt;
            c.lastPoisonTick = now;
            showFloatingText(c.x, c.y - 18, t('poisonFloat', { n: poisonAmt }), '#8800CC', 11);
            if (hpBefore > 0 && c.hp <= 0) {
                if (isElite) handleEliteKill(c);
                else handleKill(c, isHostile);
            }
        }
    }
}

function updateCorpseEating() {
    const p = gameState.player;
    const ev = p.evolution;
    if (ev.carnivore === 0) return;

    const lvData = EVOLUTION_PATHS.carnivore.levels[ev.carnivore - 1];
    const totalTime = lvData.eatTime;
    const baseXP    = EVOLUTION_PATHS.carnivore.levels[0].eatXP;
    const bonusXP   = ev.omnivore > 0 ? EVOLUTION_PATHS.omnivore.levels[ev.omnivore - 1].corpseXPBonus : 0;
    const totalXP   = baseXP + bonusXP;
    const totalHp   = 3.0;
    const tickInterval = 500;
    const numTicks     = totalTime / tickInterval;
    const xpPerTick    = totalXP / numTicks;
    const hpPerTick    = totalHp / numTicks;
    const now = Date.now();

    for (let i = gameState.corpses.length - 1; i >= 0; i--) {
        const corpse = gameState.corpses[i];
        const inRange = wrappedDistance(p.x, p.y, corpse.x, corpse.y) < p.radius + (corpse.radius || 8) + 5 + p.pickupRange;

        if (inRange) {
            if (!corpse.lastEatTick) corpse.lastEatTick = now;
            if (corpse.eatProgress == null) corpse.eatProgress = 0;
            if (corpse.xpBuffer == null) corpse.xpBuffer = 0;

            if (now - corpse.lastEatTick >= tickInterval) {
                corpse.lastEatTick = now;
                corpse.eatProgress = Math.min(1, corpse.eatProgress + 1 / numTicks);
                corpse.xpBuffer += xpPerTick;

                const giveXP = corpse.eatProgress >= 1
                    ? Math.round(corpse.xpBuffer)
                    : Math.floor(corpse.xpBuffer);
                if (giveXP > 0) {
                    corpse.xpBuffer -= giveXP;
                    addXP(giveXP);
                    showFloatingText(corpse.x, corpse.y - 15, '+' + giveXP + ' XP', '#00CC44');
                }

                gameState.stats.hpCurrent = Math.min(gameState.stats.hpMax, gameState.stats.hpCurrent + hpPerTick);
                showFloatingText(corpse.x, corpse.y - 28, '+' + hpPerTick.toFixed(1) + ' HP', '#FF88AA');

                if (corpse.eatProgress >= 1) {
                    if (ev.omnivore >= 3 && Math.random() < 0.1) {
                        gameState.stats.hpCurrent = Math.min(gameState.stats.hpMax, gameState.stats.hpCurrent + 5);
                        showFloatingText(p.x, p.y - 50, t('fullText'), '#00FF88');
                    }
                    gameState.corpses.splice(i, 1);
                }
            }
        } else {
            corpse.lastEatTick = null;
        }
    }
}

function drawCorpseEatingBars() {
    for (const corpse of gameState.corpses) {
        if (corpse.eatProgress == null || corpse.eatProgress <= 0) continue;
        const s = worldToScreen(corpse.x, corpse.y);
        if (s.x < -50 || s.x > VIEW_W + 50 || s.y < -50 || s.y > VIEW_H + 50) continue;
        const prog = corpse.eatProgress;
        const barW = 30, barH = 4;
        const barX = s.x - barW / 2;
        const barY = s.y - (corpse.radius || 8) - 10;
        ctx.fillStyle = '#222';
        ctx.fillRect(barX, barY, barW, barH);
        const r = Math.round(255 - 127 * prog);
        const g = Math.round(165 - 165 * prog);
        ctx.fillStyle = 'rgb(' + r + ',' + g + ',0)';
        ctx.fillRect(barX, barY, barW * (1 - prog), barH);
    }
}
