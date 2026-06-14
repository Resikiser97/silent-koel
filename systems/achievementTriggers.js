// =============================================================
// 成就觸發接入 - initAchievementTriggers
// 監聽遊戲事件並呼叫 unlockAchievement(id)
// 架構原則：不 import 任何 SCC 模組，只依賴 achievements.js / storage
// =============================================================
import { unlockAchievement } from './achievements.js';
import { STORAGE_KEYS, storageGet, storageSet, storageGetJSON } from '../storage/index.js';
import { SKILLS } from '../config/evolution.js';
import { ORGANS } from '../config/organs.js';

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
        if (clearCount >= 10)  unlockAchievement('clear_10');
        if (clearCount >= 100) unlockAchievement('clear_100');

        // 速通（5分30秒 = 330秒）
        if (typeof d.playTime === 'number' && d.playTime <= 330) unlockAchievement('speed_clear');

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
            if (hCount >= 5) unlockAchievement('hunter_slayer');
        }

        // 速殺 Boss（60秒）
        if (typeof d.bossKillTime === 'number' && d.bossKillTime <= 60) unlockAchievement('speed_kill_boss');

        // 角色通關次數
        const char = d.character;
        if (char) {
            const charClearKey = 'clearCount_char_' + char;
            const charCount = parseInt(storageGet(charClearKey)) || 0;
            if (char === 'koel'       && charCount >= 50) unlockAchievement('koel_50');
            if (char === 'archerfish' && charCount >= 50) unlockAchievement('archer_50');
        }

        // 連勝
        const streak = (parseInt(storageGet(STORAGE_KEYS.WIN_STREAK)) || 0) + 1;
        storageSet(STORAGE_KEYS.WIN_STREAK, String(streak));
        if (streak >= 5) unlockAchievement('win_streak_5');
    });

    // 升等
    window.addEventListener('levelUp', (e) => {
        if (e.detail && e.detail.level >= 50) unlockAchievement('level_50');
    });

    // 累積擊殺
    window.addEventListener('killCountUpdated', (e) => {
        const d = e.detail || {};
        if (d.type === 'normal' && d.total >= 10000) unlockAchievement('kill_10000');
        if (d.type === 'killer' && d.total >= 100)   unlockAchievement('kill_100_killer');
        if (d.type === 'giant'  && d.total >= 100)   unlockAchievement('kill_100_giant');
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
        if (e.detail && e.detail.level >= 5) unlockAchievement('evo_5star');
    });

    // 變異等級
    window.addEventListener('mutationLevelChanged', (e) => {
        const total = e.detail && e.detail.total;
        if (total >= 100) unlockAchievement('mutation_100');
        if (total >= 500) unlockAchievement('mutation_500');
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
        if (e.detail && e.detail.total >= 500) unlockAchievement('bone_500');
    });

    // 果實（單局）
    window.addEventListener('fruitCollected', (e) => {
        if (e.detail && e.detail.total >= 2000) unlockAchievement('fruit_2000');
    });

    // 先驅者
    window.addEventListener('pioneerConfirmed', () => {
        unlockAchievement('pioneer');
    });

    // 深夜鳥（凌晨0~4點 GMT+8）
    window.addEventListener('gameStarted', () => {
        const hour = new Date(new Date().toLocaleString('en', { timeZone: 'Asia/Taipei' })).getHours();
        if (hour >= 0 && hour < 4) unlockAchievement('night_owl');
    });
}
