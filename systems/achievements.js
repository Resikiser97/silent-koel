// =============================================================
// systems/achievements.js — 成就系統讀寫入口
// =============================================================
//
// 【對外公開函式】
//   unlockAchievement(id)     — 寫入 localStorage，idempotent
//   isUnlocked(id)            — 回傳 boolean
//   getUnlockedAchievements() — 回傳 { [id]: { unlockedAt } }
//   getActiveTitle()          — 讀取目前啟用稱號
//   setActiveTitle(title)     — 寫入目前啟用稱號
//
// 【依賴】
//   storage/index.js（只依賴此層，不 import 任何 systems/ 模組）
//   config/achievements.js
// =============================================================

import { STORAGE_KEYS, storageGet, storageSet, storageGetJSON, storageSetJSON } from '../storage/index.js';

const ACTIVE_TITLE_KEY = 'activeTitle';

export function unlockAchievement(id) {
    const data = storageGetJSON(STORAGE_KEYS.ACHIEVEMENTS) || {};
    if (data[id]) return; // idempotent：已解鎖不覆蓋
    data[id] = { unlockedAt: new Date().toISOString() };
    storageSetJSON(STORAGE_KEYS.ACHIEVEMENTS, data);
}

export function isUnlocked(id) {
    const data = storageGetJSON(STORAGE_KEYS.ACHIEVEMENTS) || {};
    return Boolean(data[id]);
}

export function getUnlockedAchievements() {
    return storageGetJSON(STORAGE_KEYS.ACHIEVEMENTS) || {};
}

export function getActiveTitle() {
    return storageGet(ACTIVE_TITLE_KEY);
}

export function setActiveTitle(title) {
    storageSet(ACTIVE_TITLE_KEY, title);
}
