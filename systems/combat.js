// =============================================================
// 戰鬥系統 - showFloatingText / applyDamageToPlayer / handleKill
//            handleGiantKill / handleKillerKill / addMutationPoints
//            playerAttack / updateStatusEffects
//            updateCorpseEating / updateBoneEating
//            drawCorpseEatingBars / drawBones
// =============================================================
import { gameState, ctx } from './gameState.js';
import { VIEW_W, VIEW_H } from './map.js';
import { worldToScreen, wrappedDistance } from './camera.js';
import { CORPSE_EAT_HP, CORPSE_BONE_EAT_TICK, CORPSE_EXPIRE_MS, BONE_EXPIRE_MS } from '../config/gameConfig.js';
import { EVOLUTION_PATHS } from '../config/evolution.js';
import { ORGANS } from '../config/organs.js';
import { AudioManager } from './audio.js';
import { getGameFont, spawnLootCircle, applyTenacity } from './utils.js';
import { t } from '../lang.js';
import { addXP, showXPPopup } from './player.js';
import { getOrganLevel, getOrganCumulative, handleEliteKill, applyOrganEffects } from './organs.js';
import { handleBossKill } from './boss.js';
import { showSkillTree } from './evolution.js';
import { _archerAttack } from './player.js';
import { handleTutorialStumpKill } from './tutorial.js';

export function showFloatingText(wx, wy, text, color, fontSize) {
    const s = worldToScreen(wx, wy);
    if (s.x < -30 || s.x > VIEW_W + 30 || s.y < -30 || s.y > VIEW_H + 30) return;

    // 手機模式上限 12，桌機上限 20
    const maxTexts = gameState.isMobile ? 12 : 20;
    if (gameState.floatTexts.length >= maxTexts) return;

    // 同幀同位置同類型合併（50px 範圍內、100ms 內、同顏色）
    const now = Date.now();
    const existing = gameState.floatTexts.find(ft =>
        ft.color === color &&
        Math.abs(ft.wx - wx) < 50 &&
        Math.abs(ft.wy - wy) < 50 &&
        now - ft.startTime < 100
    );
    if (existing) {
        // 嘗試數字合併（如果兩個都是純數字或帶+/-符號的數字）
        const existingNum = parseFloat(existing.text);
        const newNum = parseFloat(text);
        if (!isNaN(existingNum) && !isNaN(newNum)) {
            const combined = existingNum + newNum;
            existing.text = (combined > 0 ? '+' : '') + Math.round(combined);
        }
        // 非數字就跳過（不顯示重複）
        return;
    }

    gameState.floatTexts.push({
        wx, wy,
        screenX: s.x,
        screenY: s.y,
        text: String(text),
        color: color || 'white',
        fontSize: fontSize || 16,
        startTime: now,
        duration: 700,    // 比原本 800ms 短一點，手機感覺更快
    });
}

export function applyDamageToPlayer(rawDamage, attacker) {
    const p = gameState.player;
    // 閃現無敵期間豁免所有外部傷害（毒傷tick/刺甲反傷不走此函式，不受影響）
    if (p.dashInvincible) return;
    // 巨人/Alpha 傷害減免（草食性 Lv4/Lv5 效果）
    if (attacker && (attacker.isGiantized || attacker.isAlpha)) {
        const reduction = p.giantDamageReduction || 0;
        if (reduction > 0) rawDamage = Math.round(rawDamage * (1 - reduction));
    }
    const final = Math.max(1, Math.round(rawDamage * (1 - p.damageReduction)));
    gameState.stats.hpCurrent = Math.max(0, gameState.stats.hpCurrent - final);
    const isArcher = gameState.selectedCharacter === 'archerfish';
    const hurtKey = isArcher ? 'archerHurt' : 'hurt';
    AudioManager.play(hurtKey);
    if (p.thornDamage > 0 && attacker && attacker.hp > 0) {
        const thornMult = p.comboShellArmor ? 2 : 1; // 龜殼+刺甲組合：反彈時傷害翻倍
        // 刺甲：反彈最大HP百分比的傷害
        const thornTotal = Math.max(1, Math.round(gameState.stats.hpMax * p.thornDamage * thornMult));
        attacker.hp -= thornTotal;
        if (attacker.hp <= 0) {
            if (attacker === gameState.boss) {
                handleBossKill(attacker);
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

// DUPLICATE - 待 Stage 3 清理
// ESM note: duplicated with systems/mutation.js by design; do not merge during Stage 2.
function addMutationPoints(amount) {
    // TODO: Phase 5 實作
    console.log('[Mutation] +' + amount + ' points (pending Phase 5)');
}

export function handleGiantKill(c) {
    const p = gameState.player;
    // XP：巨人化 100，Alpha 300（+獵人本能加成）
    const baseXP = c.isAlpha ? 300 : 100;
    const xp = baseXP + (gameState.playerSkills.hunter || 0) * 10;
    const actualXP = addXP(xp);
    showXPPopup(p.x, p.y, actualXP);

    // 掉落道具（圓形散落）
    const items = c.isAlpha
        ? [{ type: 'corpse', data: { multiplier: 2 } },
           { type: 'corpse', data: { multiplier: 2 } },
           { type: 'bone',   data: {} },
           { type: 'bone',   data: {} },
           { type: 'bone',   data: {} }]
        : [{ type: 'corpse', data: { multiplier: 2 } },
           { type: 'bone',   data: {} }];
    spawnLootCircle(c.x, c.y, items);

    // 變異點掉落
    // 普通巨人：100% +1
    // Alpha：100% +2；20% 機率額外 +2~6
    addMutationPoints(c.isAlpha ? 2 : 1);
    if (c.isAlpha && Math.random() < 0.2) {
        addMutationPoints(2 + Math.floor(Math.random() * 5));
    }

    // 記錄巨人化擊殺數
    if (gameState.sessionStats) gameState.sessionStats.giantKills = (gameState.sessionStats.giantKills || 0) + 1;

    // 清理隊伍與UI追蹤狀態
    if (c.isAlpha && gameState.alphaCreature === c) gameState.alphaCreature = null;
    if (c.packMembers) {
        for (const m of c.packMembers) m.packLeaderRef = null;
        c.packMembers = [];
    }
    if (gameState.topBarTarget === c) { gameState.topBarTarget = null; gameState.topBarFadeTimer = 0; }
}

function handleKillerKill(creature) {
    // 固定100 + 殺手Lv×5 + 獵人本能加成
    const killerLv = creature.killerLevel || 0;
    const baseXP = 100 + killerLv * 5 + (gameState.playerSkills.hunter || 0) * 10;
    const actualXP = addXP(baseXP);
    showXPPopup(creature.x, creature.y, actualXP);

    // 圓形散落：2份1倍屍體
    spawnLootCircle(creature.x, creature.y, [
        { type: 'corpse', data: { multiplier: 1 } },
        { type: 'corpse', data: { multiplier: 1 } },
    ]);

    // 變異點：100%掉落1個
    addMutationPoints(1);
    // 殺手化後每吃1具N%機率額外掉落1~N個（N=killerCorpseEaten）
    const killerEaten = creature.killerCorpseEaten || 0;
    if (killerEaten > 0) {
        const extraChance = killerEaten / 100;
        if (Math.random() < extraChance) {
            addMutationPoints(Math.floor(Math.random() * killerEaten) + 1);
        }
    }

    // 記錄殺手化擊殺數與最高等級
    if (gameState.sessionStats) {
        gameState.sessionStats.killerKills = (gameState.sessionStats.killerKills || 0) + 1;
        if ((creature.killerLevel || 0) > (gameState.sessionStats.killerMaxLevel || 0)) {
            gameState.sessionStats.killerMaxLevel = creature.killerLevel || 0;
        }
    }

    // 殺手本身屍體
    gameState.corpses.push({ x: creature.x, y: creature.y, radius: creature.radius, spawnTime: Date.now() });
}

export function handleKill(c, isHostile) {
    if (c.isKiller) { handleKillerKill(c); return; }
    const p = gameState.player;
    const now = Date.now();
    gameState.corpses.push({ x: c.x, y: c.y, radius: c.radius, spawnTime: now });
    const baseXP = isHostile ? Math.min(80, 30 + Math.round((c.maxHp || 50) / 50 * 10)) : 20;
    const rawXP = baseXP + (gameState.playerSkills.hunter || 0) * 10;
    const actualXP = addXP(rawXP);
    showXPPopup(p.x, p.y, actualXP);
    if (gameState.sessionStats) {
        gameState.sessionStats.normalKills = (gameState.sessionStats.normalKills || 0) + 1;
    }
}

export function playerAttack() {
    const p = gameState.player;
    const now = Date.now();

    // 遠程角色（阿奇爾）→ 分派至射水攻擊
    if (p.isRanged) {
        _archerAttack();
        return;
    }

    // 鱷魚死亡翻滾硬控：無法攻擊
    if (p._stunUntil && now < p._stunUntil) return;
    // 攻速：加法公式 interval = 1000ms / (1 + totalBonus)
    const totalBonus = (p.attackSpeedBonus || 0);
    const attackInterval = Math.round(1000 / (1 + totalBonus));
    if (now - p.attackTimer < attackInterval) return;
    p.attackTimer = now;

    const hasPoison = getOrganLevel('poisonStinger') > 0 ||
                      (p.organs.find(o => o.id === 'poisonSac') && p.organs.find(o => o.id === 'poisonSac').level > 0);
    if (p.attack <= 0 && !hasPoison) {
        showFloatingText(p.x, p.y - 30, t('noAttackOrgan'), '#FF8800');
        return;
    }

    p.attackVisual = now;

    // 手機蓄力攻擊判斷（原有蓄力邏輯不變，只是觸發來源改為旗標）
    const isChargeAttack = gameState._chargeAttack || gameState._mobileChargeAttack;

    const targets = [
        ...gameState.hostileCreatures.map(c => ({ c, hostile: true, isBoss: false, isElite: false })),
        ...gameState.neutralCreatures.map(c => ({ c, hostile: false, isBoss: false, isElite: false })),
        ...(gameState.boss && gameState.boss.hp > 0 ? [{ c: gameState.boss, hostile: true, isBoss: true, isElite: false }] : []),
        ...(gameState.eliteCreature && gameState.eliteCreature.hp > 0 ? [{ c: gameState.eliteCreature, hostile: true, isBoss: false, isElite: true }] : []),
        ...(gameState.tutorialStump && gameState.tutorialStump.hp > 0
            ? [{ c: gameState.tutorialStump, hostile: true, isBoss: false, isElite: false }]
            : [])
    ];

    let anyHit = false, anyCrit = false, bossDied = false;
    const herbLv = p.evolution.herbivore || 0;

    for (const { c, hostile, isBoss, isElite } of targets) {
        if (c.hp <= 0) continue;
        // Hitbox：怪物半徑計入一半，讓大型敵人更容易被命中
        if (wrappedDistance(p.x, p.y, c.x, c.y) >= p.attackRange + (c.radius || 0) * 0.5) continue;

        let dmg = p.attack;
        // 蓄力攻擊：傷害 ×2（近戰手機持按 ≥500ms 觸發）
        if (isChargeAttack) dmg = Math.round(dmg * 2);
        let isCrit = false;
        if (p.critChance > 0 && Math.random() < p.critChance) {
            dmg = Math.round(dmg * p.critMultiplier);
            isCrit = true;
        }
        anyHit = true;
        if (isCrit) anyCrit = true;

        // 鯊魚葉：對低血量目標處決加成
        const sharkLv = getOrganLevel('sharkLeaf');
        if (sharkLv > 0) {
            const sharkCfg = ORGANS.sharkLeaf.levels[sharkLv - 1].effects.executeBonus;
            const hpRatio  = c.hp / (c.maxHp || c.hp);
            if (hpRatio < sharkCfg.threshold) {
                dmg = Math.round(dmg * (1 + sharkCfg.bonus));
            }
        }

        // 追蹤特殊目標（精英/Boss/巨人化/Alpha/殺手化），毒傷tick不更新此值
        if (isElite || isBoss || c.isGiantized || c.isKiller) gameState.topBarTarget = c;

        c.hp -= dmg;
        showFloatingText(c.x, c.y - 15, (isCrit ? '⚡' : '') + dmg, isCrit ? '#FFD700' : '#FF4444');

        // 嘴器Lv3：命中施加減速 -20% / 2秒（韌性縮短）
        if (getOrganLevel('mouthOrgan') >= 3) {
            c._slowUntil     = now + applyTenacity(2000, c);
            c._slowStartTime = now;
            c._slowMult      = 0.8;
        }

        // 蟹鉗：等級化流血
        const crabLv = getOrganLevel('crabClaw');
        if (crabLv > 0) {
            const bleedChance = getOrganCumulative('crabClaw', 'bleedChance');
            if (Math.random() < bleedChance) {
                const baseDmg = getOrganCumulative('crabClaw', 'bleedDmg');
                c.bleedEndTime    = now + getOrganCumulative('crabClaw', 'bleedDur');
                c._bleedStartTime = now;
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
                c.poisonEndTime    = now + finalPoisonDur;
                c._poisonStartTime = now;
                c.poisonDmg        = finalPoisonDmg;
                if (!wasAlreadyPoisoned) c.lastPoisonTick = now;
            }
        }

        // 獠牙：等級化暈眩；真視之眼+獠牙組合：暴擊也觸發暈眩
        const fangLv = getOrganLevel('fang');
        if (fangLv > 0) {
            const stunChance = getOrganCumulative('fang', 'stunChance');
            if (Math.random() < stunChance || (p.comboEyeFang && isCrit)) {
                const stunDur      = getOrganCumulative('fang', 'stunDurAdd');
                c.stunnedUntil     = now + (stunDur || 500);
                c._stunStartTime   = now;
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
            if (c.isGiantized) { handleGiantKill(c); continue; }
            if (c.isTutorialStump) { handleTutorialStumpKill(); continue; }
            handleKill(c, hostile);
        }
    }

    if (anyHit) {
        const isArcher = gameState.selectedCharacter === 'archerfish';
        const critKey   = isArcher ? 'archerAttackCrit'   : 'attackCrit';
        const normalKey = isArcher ? 'archerAttackNormal' : 'attackNormal';
        AudioManager.play(anyCrit ? critKey : normalKey);
    }
    if (bossDied) handleBossKill(gameState.boss);
}

export function updateStatusEffects() {
    const now = Date.now();
    const eliteArr = (gameState.eliteCreature && gameState.eliteCreature.hp > 0) ? [gameState.eliteCreature] : [];
    const bossArr  = (gameState.boss && gameState.boss.hp > 0) ? [gameState.boss] : [];
    for (const c of [...gameState.hostileCreatures, ...gameState.neutralCreatures, ...eliteArr, ...bossArr]) {
        if (c.hp <= 0) continue;
        const isElite  = c === gameState.eliteCreature;
        const isBoss   = c === gameState.boss;
        const isHostile = gameState.hostileCreatures.includes(c);

        if (c.bleedEndTime && now < c.bleedEndTime && now - (c.lastBleedTick || 0) >= 1000) {
            const bleedAmt = c.bleedDmg || 1;
            const hpBefore = c.hp;
            c.hp -= bleedAmt;
            c.lastBleedTick = now;
            showFloatingText(c.x, c.y - 18, t('bleedFloat', { n: bleedAmt }), '#880000', 11);
            if (hpBefore > 0 && c.hp <= 0) {
                if (isBoss) handleBossKill(c);
                else if (isElite) handleEliteKill(c);
                else if (c.isGiantized) handleGiantKill(c);
                else handleKill(c, isHostile);
            }
        }

        if (c.poisonEndTime && now < c.poisonEndTime && now - c.lastPoisonTick >= 1000) {
            const poisonAmt = c.poisonDmg || 2;
            const poisonResist = c.poisonResist || 0;
            const actualPoison = Math.round(poisonAmt * (1 - poisonResist));
            const hpBefore = c.hp;
            c.hp -= actualPoison;
            c.lastPoisonTick += 1000;
            showFloatingText(c.x, c.y - 18, t('poisonFloat', { n: actualPoison }), '#8800CC', 11);
            if (hpBefore > 0 && c.hp <= 0) {
                if (isBoss) handleBossKill(c);
                else if (isElite) handleEliteKill(c);
                else if (c.isGiantized) handleGiantKill(c);
                else handleKill(c, isHostile);
            }
        }
    }

    // ── 玩家毒傷 tick（毒霧犬咬中後）
    const player = gameState.player;
    if (player.poisonEndTime && now < player.poisonEndTime &&
        now - (player.lastPoisonTick || 0) >= 1000) {
        const dmg = Math.round((player.poisonDmg || 0) * (1 - (player.poisonResist || 0)));
        if (dmg > 0) {
            player.lastPoisonTick += 1000;
            applyDamageToPlayer(dmg, null);
            showFloatingText(player.x, player.y - 18, t('poisonFloat', { n: dmg }), '#8800CC', 11);
        }
    }
    if (player.poisonEndTime && now >= player.poisonEndTime) {
        player.poisonEndTime = 0;
        player.poisonDmg = 0;
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

export function _spawnBone(x, y, radius) {
    gameState.bones.push({ x, y, radius: Math.max(4, (radius || 8) * 0.6), spawnTime: Date.now(), eatProgress: 0, lastEatTick: null });
}

export function updateCorpseEating() {
    const p = gameState.player;
    const ev = p.evolution;
    if (ev.carnivore === 0) return;

    const lvData = EVOLUTION_PATHS.carnivore.levels[ev.carnivore - 1];
    const totalTime = lvData.eatTime;
    const totalXP = _getTotalCorpseXP();
    const totalHp = CORPSE_EAT_HP;
    const tickInterval = CORPSE_BONE_EAT_TICK;
    const numTicks = Math.max(1, totalTime / tickInterval);
    const xpPerTick = totalXP / numTicks;
    const hpPerTick = totalHp / numTicks;
    const now = Date.now();

    for (let i = gameState.corpses.length - 1; i >= 0; i--) {
        const corpse = gameState.corpses[i];

        // 屍體60秒到期未被吃 → 轉換為白骨
        if (now - corpse.spawnTime >= CORPSE_EXPIRE_MS) {
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
                    const actualCorpseXP = addXP(giveXP);
                    showFloatingText(corpse.x, corpse.y - 15, '+' + actualCorpseXP + ' XP', '#00CC44');
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

export function updateBoneEating() {
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
        if (now - bone.spawnTime >= BONE_EXPIRE_MS) {
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
            showFloatingText(bone.x, bone.y - 15, t('boneMaterialFloat', { n: boneMaterialAdd }), '#CCCCFF', 11);
            gameState.bones.splice(i, 1);
        } else {
            // 分段吞噬
            const tickInterval = CORPSE_BONE_EAT_TICK;
            const numTicks = Math.max(1, boneEatTime / tickInterval);
            if (!bone.lastEatTick) bone.lastEatTick = now;
            if (bone.eatProgress == null) bone.eatProgress = 0;

            if (now - bone.lastEatTick >= tickInterval) {
                bone.lastEatTick = now;
                bone.eatProgress = Math.min(1, bone.eatProgress + 1 / numTicks);
                if (bone.eatProgress >= 1) {
                    _addBoneMaterial(boneMaterialAdd);
                    showFloatingText(bone.x, bone.y - 15, t('boneMaterialFloat', { n: boneMaterialAdd }), '#CCCCFF', 11);
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
        showFloatingText(p.x, p.y - 50, t('poisonSacLevelUp', { lv: sacOrgan.level }), '#AA88FF');
        // 繼續檢查是否可再升
        _checkPoisonSacUpgrade(p);
    }
}

export function drawCorpseEatingBars() {
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

export function drawBones() {
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
