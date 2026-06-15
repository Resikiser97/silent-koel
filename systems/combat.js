// =============================================================
// 戰鬥系統 - playerAttack / updateStatusEffects
//            updateCorpseEating / updateBoneEating
//            drawCorpseEatingBars / drawBones
//            setRangedAttackCallback
// （Stage F 3a：applyDamageToPlayer / handleKill / handleGiantKill
//   已搬至 damage.js；boss.js / player.js 直接依賴已解除）
// =============================================================
import { gameState, ctx } from './gameState.js';
import { VIEW_W, VIEW_H } from './map.js';
import { worldToScreen, wrappedDistance } from './camera.js';
import { CORPSE_EAT_HP, CORPSE_BONE_EAT_TICK, CORPSE_EXPIRE_MS, BONE_EXPIRE_MS } from '../config/gameConfig.js';
import { EVOLUTION_PATHS } from '../config/evolution.js';
import { ORGANS } from '../config/organs.js';
import { AudioManager } from './audio.js';
import { applyTenacity } from './utils.js';
import { _spawnBone } from './loot.js';
import { t } from '../lang.js';
import { addXP } from './reward.js';
import { showFloatingText } from './feedback.js';
import { getOrganLevel, getOrganCumulative, handleEliteKill, applyOrganEffects } from './organs.js';
import { handleTutorialStumpKill } from './tutorial.js';
import { applyDamageToPlayer, handleKill, handleGiantKill } from './damage.js';

// 遠程攻擊 callback（由 main.js 在初始化時注入，避免 combat↔player 直接 import）
let _rangedAttackFn = null;
export function setRangedAttackCallback(fn) { _rangedAttackFn = fn; }

export function playerAttack() {
    const p = gameState.player;
    const now = Date.now();

    // 遠程角色（阿奇爾）→ 分派至射水攻擊（callback 由 main.js 注入）
    if (p.isRanged) {
        if (_rangedAttackFn) _rangedAttackFn();
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
        showFloatingText(c.x, c.y - 15, (isCrit ? '⚡' : '') + dmg, isCrit ? '#FFD700' : '#FF4444', 16, true);

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

        /**
         * ═══════════════════════════════════════════
         * 玩家→怪物毒傷疊加系統（v0.1.17.x）
         * ═══════════════════════════════════════════
         *
         * 每次帶毒攻擊命中 → 加入一個獨立 stack：
         *   c.poisonStacks.push({ dmg, expiryTime })
         *
         * 每 tick（每秒）實際毒傷 = 所有活躍 stack 的 dmg 加總
         *
         * 攻擊引爆（On-hit Detonation）：
         *   - 觸發：本次攻擊前目標已有 ≥1 個活躍 stack
         *   - 效果：即時傷害 = 所有活躍 stack 的 dmg 加總（×1 tick）
         *   - 代價：所有活躍 stack 的 expiryTime 各 -1000ms
         *   - 毒繼續計時，stack 不消失（直到自然過期）
         *
         * comboCrabPoison（×2）在 stack 建立時套用，不在 tick 時套用
         * ═══════════════════════════════════════════
         */
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
                if (!c.poisonStacks) c.poisonStacks = [];

                // 引爆：若已有活躍 stack，先引爆
                const activeStacks = c.poisonStacks.filter(s => s.expiryTime > now);
                if (activeStacks.length >= 1) {
                    const burstDmg = activeStacks.reduce((sum, s) => sum + s.dmg, 0);
                    const hpBefore = c.hp;
                    c.hp -= burstDmg;
                    showFloatingText(c.x, c.y - 25, '💥 -' + burstDmg, '#FF6600', 14, true);
                    c.poisonStacks.forEach(s => { s.expiryTime -= 1000; });
                    if (hpBefore > 0 && c.hp <= 0) {
                        if (isBoss) { bossDied = true; }
                        else if (isElite) { handleEliteKill(c); }
                        else if (c.isGiantized) { handleGiantKill(c); }
                        else { handleKill(c, hostile); }
                    }
                }

                // 加入新 stack（僅在目標仍存活時）
                if (c.hp > 0) {
                    c.poisonStacks.push({
                        dmg:        finalPoisonDmg,
                        expiryTime: now + finalPoisonDur,
                    });
                    if (!c.lastPoisonTick) c.lastPoisonTick = now;
                }
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
    if (bossDied) window.dispatchEvent(new CustomEvent('bossKilled'));
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
            showFloatingText(c.x, c.y - 18, t('bleedFloat', { n: bleedAmt }), '#880000', 11, true);
            if (hpBefore > 0 && c.hp <= 0) {
                if (isBoss) window.dispatchEvent(new CustomEvent('bossKilled'));
                else if (isElite) handleEliteKill(c);
                else if (c.isGiantized) handleGiantKill(c);
                else handleKill(c, isHostile);
            }
        }

        // 玩家→怪物毒傷 tick（stack 系統）
        if (c.poisonStacks && c.poisonStacks.length > 0) {
            c.poisonStacks = c.poisonStacks.filter(s => s.expiryTime > now);
            if (c.poisonStacks.length > 0 && now - (c.lastPoisonTick || 0) >= 1000) {
                c.lastPoisonTick += 1000;
                const poisonResist = c.poisonResist || 0;
                const totalDmg = c.poisonStacks.reduce((sum, s) => sum + s.dmg, 0);
                const actualPoison = Math.round(totalDmg * (1 - poisonResist));
                const hpBefore = c.hp;
                c.hp -= actualPoison;
                showFloatingText(c.x, c.y - 18, t('poisonFloat', { n: actualPoison }), '#8800CC', 11, true);
                if (hpBefore > 0 && c.hp <= 0) {
                    if (isBoss) window.dispatchEvent(new CustomEvent('bossKilled'));
                    else if (isElite) handleEliteKill(c);
                    else if (c.isGiantized) handleGiantKill(c);
                    else handleKill(c, isHostile);
                }
            }
        }
    }

    // ── 玩家毒傷 tick（poisonStacks 疊加系統）
    const player = gameState.player;
    if (!player.poisonStacks) player.poisonStacks = [];
    const stacks = player.poisonStacks;
    for (let si = stacks.length - 1; si >= 0; si--) {
        if (now >= stacks[si].endTime) stacks.splice(si, 1);
    }
    if (stacks.length > 0 && now - (player.poisonLastTick || 0) >= 1000) {
        player.poisonLastTick = now;
        for (const stack of stacks) {
            const dmg = Math.round(stack.dmg * (1 - (player.poisonResist || 0)));
            if (dmg > 0) {
                applyDamageToPlayer(dmg, null);
                showFloatingText(player.x, player.y - 18, '-' + dmg, '#33FF66', 11);
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
    window.dispatchEvent(new CustomEvent('boneMaterialUpdated', { detail: { total: p.boneMaterial } }));
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
