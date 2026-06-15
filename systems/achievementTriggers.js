// =============================================================
// 成就觸發接入 - initAchievementTriggers
// 監聽遊戲事件並呼叫 unlockAchievement(id)
// 架構原則：不 import 任何 SCC 模組，只依賴 achievements.js / storage
// 依賴：systems/achievements.js, storage/index.js,
//       config/evolution.js, config/organs.js, config/achievements.js
// =============================================================
import { unlockAchievement } from './achievements.js';
import { STORAGE_KEYS, storageGet, storageSet, storageGetJSON } from '../storage/index.js';
import { SKILLS } from '../config/evolution.js';
import { ORGANS } from '../config/organs.js';
import { ACHIEVEMENTS } from '../config/achievements.js';

function _getThreshold(id, expectedType) {
    const ach = ACHIEVEMENTS.find(a => a.id === id);
    if (!ach?.condition) return null;
    if (ach.condition.type !== expectedType) return null;
    if (typeof ach.condition.threshold !== 'number') return null;
    return ach.condition.threshold;
}

export function initAchievementTriggers() {
    // 教學完成
    window.addEventListener('tutorialCompleted', () => {
        unlockAchievement('tutorial_done');
    });

    // 玩家死亡
    window.addEventListener('showSkillTree', () => {
        unlockAchievement('first_death');
        storageSet(STORAGE_KEYS.WIN_STREAK, '0');
    });

    // 勝利結算
    window.addEventListener('gameVictory', (e) => {
        const d = e.detail || {};
        unlockAchievement('first_clear');

        const diff = d.difficulty;
        if (diff === 'normal') unlockAchievement('clear_normal');
        if (diff === 'hard')   unlockAchievement('clear_hard');
        if (diff === 'hell')   unlockAchievement('clear_hell');

        // 累積通關次數
        const clearKeys = ['easy', 'normal', 'hard', 'hell'].map(k => 'clearCount_' + k);
        const clearCount = clearKeys.reduce((sum, k) => sum + (parseInt(storageGet(k)) || 0), 0);
        const thrClear10  = _getThreshold('clear_10',  'totalClearCount');
        const thrClear100 = _getThreshold('clear_100', 'totalClearCount');
        if (thrClear10  !== null && clearCount >= thrClear10)  unlockAchievement('clear_10');
        if (thrClear100 !== null && clearCount >= thrClear100) unlockAchievement('clear_100');

        // 速通（5分30秒 = 330秒）
        const thrSpeedClear = _getThreshold('speed_clear', 'clearTimeMax');
        if (thrSpeedClear !== null && typeof d.playTime === 'number' && d.playTime <= thrSpeedClear) unlockAchievement('speed_clear');

        // 無傷
        if (!d.tookDamage) unlockAchievement('no_damage_clear');

        // 無回血（困難）
        if (!d.regenedThisRun && diff === 'hard') unlockAchievement('no_regen_clear');

        // Boss 首殺
        const bossType = d.bossType;
        if (bossType === 'bear')     unlockAchievement('kill_black_bear');
        if (bossType === 'scorpion') unlockAchievement('kill_scorpion');
        if (bossType === 'shark')    unlockAchievement('kill_shark');
        if (bossType === 'hunter')   unlockAchievement('kill_hunter');

        // 獵人剋星：困難模式擊殺5次
        if (bossType === 'hunter' && diff === 'hard') {
            const hCount = parseInt(storageGet('killCount_hunter')) || 0;
            const thrHunterSlayer = _getThreshold('hunter_slayer', 'hardHunterKills');
            if (thrHunterSlayer !== null && hCount >= thrHunterSlayer) unlockAchievement('hunter_slayer');
        }

        // 速殺 Boss（60秒）
        const thrSpeedKill = _getThreshold('speed_kill_boss', 'bossKillTimeMax');
        if (thrSpeedKill !== null && typeof d.bossKillTime === 'number' && d.bossKillTime <= thrSpeedKill) unlockAchievement('speed_kill_boss');

        // 角色通關次數
        const char = d.character;
        if (char) {
            const charClearKey = 'clearCount_char_' + char;
            const charCount = parseInt(storageGet(charClearKey)) || 0;
            ACHIEVEMENTS.forEach(ach => {
                const cond = ach.condition;
                if (cond?.type === 'characterClearCount'
                    && cond.characterId === char
                    && typeof cond.threshold === 'number'
                    && charCount >= cond.threshold) {
                    unlockAchievement(ach.id);
                }
            });
        }

        // 連勝
        const streak = (parseInt(storageGet(STORAGE_KEYS.WIN_STREAK)) || 0) + 1;
        storageSet(STORAGE_KEYS.WIN_STREAK, String(streak));
        const thrWinStreak = _getThreshold('win_streak_5', 'winStreak');
        if (thrWinStreak !== null && streak >= thrWinStreak) unlockAchievement('win_streak_5');
    });

    // 升等
    window.addEventListener('levelUp', (e) => {
        const thr = _getThreshold('level_50', 'playerLevel');
        if (e.detail && thr !== null && e.detail.level >= thr) unlockAchievement('level_50');
    });

    // 累積擊殺
    window.addEventListener('killCountUpdated', (e) => {
        const d = e.detail || {};
        const thrKill10k = _getThreshold('kill_10000',      'totalKills');
        const thrKiller  = _getThreshold('kill_100_killer', 'killerKills');
        const thrGiant   = _getThreshold('kill_100_giant',  'giantKills');
        if (d.type === 'normal' && thrKill10k !== null && d.total >= thrKill10k) unlockAchievement('kill_10000');
        if (d.type === 'killer' && thrKiller  !== null && d.total >= thrKiller)  unlockAchievement('kill_100_killer');
        if (d.type === 'giant'  && thrGiant   !== null && d.total >= thrGiant)   unlockAchievement('kill_100_giant');
    });

    // 技能樹全滿
    window.addEventListener('skillUpgraded', (e) => {
        const skills = e.detail && e.detail.skills;
        if (!skills) return;
        const allMax = Object.values(SKILLS).every(s => (skills[s.id] || 0) >= s.maxLevel);
        if (allMax) unlockAchievement('skill_master');
    });

    // 進化
    window.addEventListener('evolutionLevelUp', (e) => {
        const thr = _getThreshold('evo_5star', 'evolutionLevel');
        if (e.detail && thr !== null && e.detail.level >= thr) unlockAchievement('evo_5star');
    });

    // 變異等級
    window.addEventListener('mutationLevelChanged', (e) => {
        const total = e.detail && e.detail.total;
        const thr100 = _getThreshold('mutation_100', 'totalMutationLevel');
        const thr500 = _getThreshold('mutation_500', 'totalMutationLevel');
        if (thr100 !== null && total >= thr100) unlockAchievement('mutation_100');
        if (thr500 !== null && total >= thr500) unlockAchievement('mutation_500');
    });

    // 器官收藏家：所有普通器官（15種）至少 lv1
    window.addEventListener('organUnlocked', (e) => {
        const organs = e.detail && e.detail.organs;
        if (!organs) return;
        const regularIds = Object.keys(ORGANS).filter(k => k !== 'poisonSac');
        const allOwned = regularIds.every(id => organs.some(o => o.id === id && (o.level || 0) >= 1));
        if (allOwned) unlockAchievement('organ_collector');
    });

    // 白骨（單局）
    window.addEventListener('boneMaterialUpdated', (e) => {
        const thr = _getThreshold('bone_500', 'sessionBones');
        if (e.detail && thr !== null && e.detail.total >= thr) unlockAchievement('bone_500');
    });

    // 果實（單局）
    window.addEventListener('fruitCollected', (e) => {
        const thr = _getThreshold('fruit_2000', 'sessionFruits');
        if (e.detail && thr !== null && e.detail.total >= thr) unlockAchievement('fruit_2000');
    });

    // 先驅者
    window.addEventListener('pioneerConfirmed', () => {
        unlockAchievement('pioneer');
    });

    // 深夜鳥（凌晨0~4點 GMT+8）
    window.addEventListener('gameStarted', () => {
        const hour = new Date(new Date().toLocaleString('en', { timeZone: 'Asia/Taipei' })).getHours();
        const thr = _getThreshold('night_owl', 'nightOwlHour');
        if (thr !== null && hour >= 0 && hour < thr) unlockAchievement('night_owl');
    });
}
