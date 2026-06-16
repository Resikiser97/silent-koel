// =============================================================
// 傷害與擊殺服務 - applyDamageToPlayer / handleKill / handleGiantKill
// （Stage F 3a：從 combat.js 抽出，讓 boss.js / player.js / creatures.js /
//   elite.js 共同依賴此低層模組，解除 boss↔combat / combat↔player 循環）
// 依賴：config/characters.js（sfx config 化，v0.1.24.0）、config/creatures.js（GIANT_CONFIG/KILLER_CONFIG，v0.1.24.2）、config/xpConfig.js（XP_CONFIG，v0.1.24.5）
// =============================================================
import { gameState } from './gameState.js';
import { AudioManager } from './audio.js';
import { showFloatingText, showXPPopup } from './feedback.js';
import { addXP } from './reward.js';
import { incrementStat, updateStatMax } from '../stats/index.js';
import { spawnLootCircle } from './utils.js';
import { t } from '../lang.js';
import { addMutationPoints } from './mutation.js';
import { STORAGE_KEYS, storageGet, storageSet } from '../storage/index.js';
import { CHARACTERS } from '../config/characters.js';
import { GIANT_CONFIG, KILLER_CONFIG } from '../config/creatures.js';
import { XP_CONFIG } from '../config/xpConfig.js';

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
    window.dispatchEvent(new CustomEvent('playerDamaged'));
    const hurtKey = CHARACTERS[gameState.selectedCharacter]?.sfx?.hurt ?? 'hurt';
    AudioManager.play(hurtKey);
    if (p.thornDamage > 0 && attacker && attacker.hp > 0) {
        const thornMult = p.comboShellArmor ? 2 : 1; // 龜殼+刺甲組合：反彈時傷害翻倍
        // 刺甲：反彈最大HP百分比的傷害
        const thornTotal = Math.max(1, Math.round(gameState.stats.hpMax * p.thornDamage * thornMult));
        attacker.hp -= thornTotal;
        if (attacker.hp <= 0) {
            if (attacker === gameState.boss) {
                window.dispatchEvent(new CustomEvent('bossKilled'));
            } else if (attacker === gameState.eliteCreature) {
                window.dispatchEvent(new CustomEvent('eliteKilled', { detail: { killer: attacker } }));
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
        window.dispatchEvent(new CustomEvent('gameOver'));
        window.dispatchEvent(new CustomEvent('showSkillTree', { detail: { mode: 'postGame' } }));
    }
}

export function handleGiantKill(c) {
    const p = gameState.player;
    // XP：巨人化 100，Alpha 300（+獵人本能加成）
    const baseXP = c.isAlpha ? GIANT_CONFIG.xp.alpha : GIANT_CONFIG.xp.base;
    let xp = baseXP + (gameState.playerSkills.hunter || 0) * XP_CONFIG.kill.hunterPerLevel;
    if (p._achKillXpPercent) xp = Math.round(xp * (1 + p._achKillXpPercent));
    const actualXP = addXP(xp);
    showXPPopup(p.x, p.y, actualXP);

    // 掉落道具（圓形散落）
    const items = c.isAlpha ? GIANT_CONFIG.loot.alpha : GIANT_CONFIG.loot.giant;
    spawnLootCircle(c.x, c.y, items);

    // 變異點掉落
    // 普通：普通巨人+1，Alpha+2（20%機率額外+2~6）
    // 困難：普通巨人+3，Alpha+5（20%機率額外+2~6）
    const isHard = !!(gameState.currentMap && gameState.currentMap.difficulty === 'hard');
    if (isHard) {
        addMutationPoints(c.isAlpha ? GIANT_CONFIG.mutation.hard.alpha : GIANT_CONFIG.mutation.hard.giant);
    } else {
        addMutationPoints(c.isAlpha ? GIANT_CONFIG.mutation.normal.alpha : GIANT_CONFIG.mutation.normal.giant);
    }
    if (c.isAlpha && Math.random() < GIANT_CONFIG.alphaBonus.chance) {
        addMutationPoints(GIANT_CONFIG.alphaBonus.min + Math.floor(Math.random() * GIANT_CONFIG.alphaBonus.range));
    }

    // 記錄巨人化擊殺數
    incrementStat('giantKills');
    const _giantTotal = (parseInt(storageGet(STORAGE_KEYS.KILL_GIANT_TOTAL)) || 0) + 1;
    storageSet(STORAGE_KEYS.KILL_GIANT_TOTAL, _giantTotal);
    window.dispatchEvent(new CustomEvent('killCountUpdated', { detail: { type: 'giant', total: _giantTotal } }));

    // 清理隊伍與UI追蹤狀態
    if (c.isAlpha && gameState.alphaCreature === c) {
        gameState.alphaCreature = null;
        gameState._pendingAlphaInherit = true; // 通知 creatures.js 執行繼承掃描
    }
    if (c.packMembers) {
        for (const m of c.packMembers) m.packLeaderRef = null;
        c.packMembers = [];
    }
    if (gameState.topBarTarget === c) { gameState.topBarTarget = null; gameState.topBarFadeTimer = 0; }
}

function handleKillerKill(creature) {
    // 固定100 + 殺手Lv×5 + 獵人本能加成
    const killerLv = creature.killerLevel || 0;
    let baseXP = KILLER_CONFIG.xp.base + killerLv * KILLER_CONFIG.xp.perLevel + (gameState.playerSkills.hunter || 0) * XP_CONFIG.kill.hunterPerLevel;
    const p = gameState.player;
    if (p._achKillXpPercent) baseXP = Math.round(baseXP * (1 + p._achKillXpPercent));
    const actualXP = addXP(baseXP);
    showXPPopup(creature.x, creature.y, actualXP);

    // 圓形散落：2份1倍屍體
    spawnLootCircle(creature.x, creature.y, KILLER_CONFIG.loot);

    // 變異點：普通+1，困難+2
    const isHardMap = !!(gameState.currentMap && gameState.currentMap.difficulty === 'hard');
    addMutationPoints(isHardMap ? KILLER_CONFIG.mutation.hard : KILLER_CONFIG.mutation.normal);
    // 殺手化後每吃1具N%機率額外掉落1~N個（N=killerCorpseEaten）
    const killerEaten = creature.killerCorpseEaten || 0;
    if (killerEaten > 0) {
        const extraChance = killerEaten / KILLER_CONFIG.extraMutation.chanceDivisor;
        if (Math.random() < extraChance) {
            addMutationPoints(Math.floor(Math.random() * killerEaten) + KILLER_CONFIG.extraMutation.min);
        }
    }

    // 記錄殺手化擊殺數與最高等級
    incrementStat('killerKills');
    updateStatMax('killerMaxLevel', creature.killerLevel || 0);
    const _killerTotal = (parseInt(storageGet(STORAGE_KEYS.KILL_KILLER_TOTAL)) || 0) + 1;
    storageSet(STORAGE_KEYS.KILL_KILLER_TOTAL, _killerTotal);
    window.dispatchEvent(new CustomEvent('killCountUpdated', { detail: { type: 'killer', total: _killerTotal } }));

    // 殺手本身屍體
    gameState.corpses.push({ x: creature.x, y: creature.y, radius: creature.radius, spawnTime: Date.now() });
}

export function handleKill(c, isHostile) {
    if (c.isKiller) { handleKillerKill(c); return; }
    const p = gameState.player;
    const now = Date.now();
    const sourceArray = isHostile ? gameState.hostileCreatures : gameState.neutralCreatures;
    const index = sourceArray.indexOf(c);
    if (index !== -1) sourceArray.splice(index, 1);
    gameState.corpses.push({ x: c.x, y: c.y, radius: c.radius, spawnTime: now });
    const h = XP_CONFIG.kill.hostile;
    const baseXP = isHostile
        ? Math.min(h.cap, h.base + Math.round(((c.maxHp || h.defaultHp) / h.hpDivisor) * h.hpScale))
        : XP_CONFIG.kill.minCreatureBaseXP;
    let rawXP = baseXP + (gameState.playerSkills.hunter || 0) * XP_CONFIG.kill.hunterPerLevel;
    if (p._achKillXpPercent) rawXP = Math.round(rawXP * (1 + p._achKillXpPercent));
    const actualXP = addXP(rawXP);
    showXPPopup(p.x, p.y, actualXP);
    if (c.isElite) window.dispatchEvent(new CustomEvent('eliteKilled', { detail: { killer: c } }));
    incrementStat('normalKills');
    const _normalTotal = (parseInt(storageGet(STORAGE_KEYS.KILL_TOTAL)) || 0) + 1;
    storageSet(STORAGE_KEYS.KILL_TOTAL, _normalTotal);
    window.dispatchEvent(new CustomEvent('killCountUpdated', { detail: { type: 'normal', total: _normalTotal } }));
}
