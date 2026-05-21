// =============================================================
// 戰鬥系統 - showFloatingText / applyDamageToPlayer / handleKill
//            playerAttack / updateStatusEffects
//            updateCorpseEating / drawCorpseEatingBars
//            updateBones / drawBones
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
        const thornMult = p.comboShellArmor ? 2 : 1; // 龜殼+刺甲組合：反彈時傷害翻倍
        // 刺甲：反彈最大HP百分比的傷害
        const thornTotal = Math.max(1, Math.round(gameState.stats.hpMax * p.thornDamage * thornMult));
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
    const now = Date.now();
    gameState.corpses.push({ x: c.x, y: c.y, radius: c.radius, spawnTime: now });
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

    const hasPoison = getOrganLevel('poisonStinger') > 0 ||
                      (p.organs.find(o => o.id === 'poisonSac') && p.organs.find(o => o.id === 'poisonSac').level > 0);
    if (p.attack <= 0 && !hasPoison) {
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
    const herbLv = p.evolution.herbivore || 0;

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
                // 蟹鉗+搏擊拳套組合：流血傷害翻倍
                c.bleedDmg = p.comboCrabGloves ? baseDmg * 2 : baseDmg;
                c.lastBleedTick = now;
            }
        }
        // 蟹鉗+搏擊拳套組合：命中施加回復量-50% Debuff（供未來有回復的Boss使用）
        if (p.comboCrabGloves) {
            c.healReduction = 0.5;
        }

        // 毒刺 + 毒囊：合併計算
        const stingerLv = getOrganLevel('poisonStinger');
        const sacOrgan = p.organs.find(o => o.id === 'poisonSac');
        const sacLv = sacOrgan ? (sacOrgan.level || 0) : 0;
        if (stingerLv > 0 || sacLv > 0) {
            const stingerDmg = getOrganCumulative('poisonStinger', 'poisonDmg');
            const stingerDur = getOrganCumulative('poisonStinger', 'poisonDur');
            const sacDmg = sacLv > 0 ? getOrganCumulative('poisonSac', 'poisonSacDmg') : 0;
            const sacDur = sacLv > 0 ? 5000 : 0;
            let finalPoisonDmg = stingerDmg + sacDmg;
            const finalPoisonDur = Math.max(stingerDur, sacDur);
            if (p.comboCrabPoison) finalPoisonDmg *= 2;
            if (finalPoisonDmg > 0 && finalPoisonDur > 0) {
                const wasAlreadyPoisoned = c.poisonEndTime && now < c.poisonEndTime;
                c.poisonEndTime = now + finalPoisonDur;
                c.poisonDmg = finalPoisonDmg;
                if (!wasAlreadyPoisoned) c.lastPoisonTick = now;
            }
        }

        // 獠牙：等級化暈眩；真視之眼+獠牙組合：暴擊也觸發暈眩
        const fangLv = getOrganLevel('fang');
        if (fangLv > 0) {
            const stunChance = getOrganCumulative('fang', 'stunChance');
            if (Math.random() < stunChance || (p.comboEyeFang && isCrit)) {
                const stunDur = getOrganCumulative('fang', 'stunDurAdd');
                c.stunnedUntil = now + (stunDur || 500);
            }
        }

        if (!hostile && !isElite) {
            // 草食性Lv3+：被攻擊不逃跑
            if (herbLv < 3) {
                c.state = c.canFight ? 'fighting' : 'fleeing';
            }
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

        if (c.poisonEndTime && now < c.poisonEndTime && now - c.lastPoisonTick >= 1000) {
            const poisonAmt = c.poisonDmg || 2;
            const hpBefore = c.hp;
            c.hp -= poisonAmt;
            c.lastPoisonTick += 1000;
            showFloatingText(c.x, c.y - 18, t('poisonFloat', { n: poisonAmt }), '#8800CC', 11);
            if (hpBefore > 0 && c.hp <= 0) {
                if (isElite) handleEliteKill(c);
                else handleKill(c, isHostile);
            }
        }
    }
}

function _getTotalCorpseXP() {
    const ev = gameState.player.evolution;
    if (ev.carnivore <= 0) return 0;
    let total = 0;
    for (let i = 0; i < ev.carnivore; i++) {
        total += EVOLUTION_PATHS.carnivore.levels[i].eatXP;
    }
    return total;
}

function _spawnBone(x, y, radius) {
    gameState.bones.push({ x, y, radius: Math.max(4, (radius || 8) * 0.6), spawnTime: Date.now(), eatProgress: 0, lastEatTick: null });
}

function updateCorpseEating() {
    const p = gameState.player;
    const ev = p.evolution;
    if (ev.carnivore === 0) return;

    const lvData = EVOLUTION_PATHS.carnivore.levels[ev.carnivore - 1];
    const totalTime = lvData.eatTime;
    const totalXP = _getTotalCorpseXP();
    const totalHp = 3.0;
    const tickInterval = 500;
    const numTicks = Math.max(1, totalTime / tickInterval);
    const xpPerTick = totalXP / numTicks;
    const hpPerTick = totalHp / numTicks;
    const now = Date.now();

    for (let i = gameState.corpses.length - 1; i >= 0; i--) {
        const corpse = gameState.corpses[i];

        // 屍體60秒到期未被吃 → 轉換為白骨
        if (now - corpse.spawnTime >= 60000) {
            _spawnBone(corpse.x, corpse.y, corpse.radius);
            gameState.corpses.splice(i, 1);
            continue;
        }

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
                    // 屍體吃完 → 生成白骨
                    _spawnBone(corpse.x, corpse.y, corpse.radius);
                    gameState.corpses.splice(i, 1);
                }
            }
        } else {
            corpse.lastEatTick = null;
        }
    }
}

function updateBoneEating() {
    const p = gameState.player;
    const ev = p.evolution;
    if (ev.omnivore <= 0) return;

    const omniLv = ev.omnivore;
    const omniData = EVOLUTION_PATHS.omnivore.levels[omniLv - 1];
    const boneEatTime = omniData.boneEatTime || 0;
    const boneMaterialAdd = omniData.boneMaterialAdd || 1;
    const now = Date.now();

    for (let i = gameState.bones.length - 1; i >= 0; i--) {
        const bone = gameState.bones[i];

        // 白骨180秒後消失
        if (now - bone.spawnTime >= 180000) {
            gameState.bones.splice(i, 1);
            continue;
        }

        const inRange = wrappedDistance(p.x, p.y, bone.x, bone.y) < p.radius + (bone.radius || 5) + 5 + p.pickupRange;
        if (!inRange) {
            bone.lastEatTick = null;
            continue;
        }

        if (boneEatTime === 0) {
            // 立刻吞噬
            _addBoneMaterial(boneMaterialAdd);
            showFloatingText(bone.x, bone.y - 15, '+' + boneMaterialAdd + ' 白骨素', '#CCCCFF', 11);
            gameState.bones.splice(i, 1);
        } else {
            // 分段吞噬
            const tickInterval = 500;
            const numTicks = Math.max(1, boneEatTime / tickInterval);
            if (!bone.lastEatTick) bone.lastEatTick = now;
            if (bone.eatProgress == null) bone.eatProgress = 0;

            if (now - bone.lastEatTick >= tickInterval) {
                bone.lastEatTick = now;
                bone.eatProgress = Math.min(1, bone.eatProgress + 1 / numTicks);
                if (bone.eatProgress >= 1) {
                    _addBoneMaterial(boneMaterialAdd);
                    showFloatingText(bone.x, bone.y - 15, '+' + boneMaterialAdd + ' 白骨素', '#CCCCFF', 11);
                    gameState.bones.splice(i, 1);
                }
            }
        }
    }
}

function _addBoneMaterial(amount) {
    const p = gameState.player;
    p.boneMaterial = (p.boneMaterial || 0) + amount;
    // 檢查毒囊升級
    _checkPoisonSacUpgrade(p);
}

function _checkPoisonSacUpgrade(p) {
    const sacOrgan = p.organs.find(o => o.id === 'poisonSac');
    if (!sacOrgan) return;
    const thresholds = ORGANS.poisonSac.thresholds;
    const currentLv = sacOrgan.level || 0;
    const maxLv = ORGANS.poisonSac.maxLevel;
    if (currentLv >= maxLv) return;
    const nextThreshold = thresholds[currentLv]; // index = currentLv (0→Lv1需要thresholds[0]=5)
    if (p.boneMaterial >= nextThreshold) {
        sacOrgan.level = currentLv + 1;
        sacOrgan.desc = ORGANS.poisonSac.levels[currentLv].desc;
        applyOrganEffects(sacOrgan); // 套用增量效果
        showFloatingText(p.x, p.y - 50, '✨ 毒囊升級 Lv' + sacOrgan.level + '！', '#AA88FF');
        // 繼續檢查是否可再升
        _checkPoisonSacUpgrade(p);
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

function drawBones() {
    const now = Date.now();
    for (const bone of gameState.bones) {
        const s = worldToScreen(bone.x, bone.y);
        if (s.x < -50 || s.x > VIEW_W + 50 || s.y < -50 || s.y > VIEW_H + 50) continue;
        const r = bone.radius || 5;
        // 白骨素：白色半透明骨頭圓圈
        ctx.save();
        ctx.globalAlpha = 0.7 + 0.3 * Math.sin(now * 0.002);
        ctx.fillStyle = '#EEEECC';
        ctx.strokeStyle = '#AAAAAA';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // 骨頭吞噬進度條
        if (bone.eatProgress > 0) {
            const barW = r * 2, barH = 3;
            const barX = s.x - barW / 2;
            const barY = s.y - r - 7;
            ctx.globalAlpha = 0.85;
            ctx.fillStyle = '#333';
            ctx.fillRect(barX, barY, barW, barH);
            ctx.fillStyle = '#AADDFF';
            ctx.fillRect(barX, barY, barW * bone.eatProgress, barH);
        }
        ctx.restore();
    }
}
