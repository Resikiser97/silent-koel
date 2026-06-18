export const STORAGE_KEYS = {
    HAS_PLAYED_BEFORE:       'hasPlayedBefore',
    LAST_DIFFICULTY:         'lastDifficulty',
    LAST_CHARACTER:          'lastCharacter',
    SAVE_VERSION:            'saveVersion',
    PLAYER_SKILLS:           'playerSkills',
    SKILL_POINTS:            'skillPoints',
    SAVED_ORGANS:            'savedOrgans',
    SAVED_HIDDEN_ORGANS:     'savedHiddenOrgans',
    LAST_RUN_ORGANS:         'lastRunOrgans',
    GAME_SETTINGS:           'gameSettings',
    MUTATION_DATA:           'mutationData',
    MUTATION_SKILLS:         'mutationSkills',
    TUTORIAL_COMPLETED:      'tutorialCompleted',
    TUTORIAL_COMBAT_DONE:    'tutorialCombatDone',
    ZOOM_RESET_VERSION:      'zoomResetVersion',
    LAST_SEEN_PATCH_VERSION: 'lastSeenPatchVersion',
    CHAPTER2_UNLOCKED:       'chapter2Unlocked',
    HUNTER_SLAYER_UNLOCKED:  'hunterSlayerUnlocked', // 已寫入但未讀取，保留備用
    CHAT_POSITION:           'chatPosition',
    CHAT_SETTINGS:           'chatSettings',
    CHAT_DEFAULT_CHANNEL:    'chatDefaultChannel',
    ACHIEVEMENTS:            'achievements',
    READ_ACHIEVEMENTS:       'readAchievements',
    READ_PATCH_NOTES:        'readPatchNotes',
    FIRST_PLAY_DATE:         'firstPlayDate',
    WIN_STREAK:              'winStreak',
    KILL_TOTAL:              'killTotal',
    KILL_KILLER_TOTAL:       'killKillerTotal',
    KILL_GIANT_TOTAL:        'killGiantTotal',
    // 動態 key（用函式產生）
    // CLEAR_COUNT_DIFF:     由 storageKey.clearCountDiff(diff) 產生
    // CLEAR_COUNT_CHAR:     由 storageKey.clearCountChar(charId) 產生
    // KILL_COUNT_BOSS:      由 storageKey.killCountBoss(bossType) 產生
};

// 動態 key 產生函式
export const storageKey = {
    clearCountDiff: (diff) => 'clearCount_' + diff,
    clearCountChar: (charId) => 'clearCount_char_' + charId,
    killCountBoss:  (bossType) => 'killCount_' + bossType,
};

// 讀取字串
export function storageGet(key) {
    try { return localStorage.getItem(key); }
    catch(e) { console.warn('[storage] getItem failed:', key, e); return null; }
}

// 寫入字串
export function storageSet(key, value) {
    try { localStorage.setItem(key, value); }
    catch(e) { console.warn('[storage] setItem failed:', key, e); }
}

// 刪除
export function storageRemove(key) {
    try { localStorage.removeItem(key); }
    catch(e) { console.warn('[storage] removeItem failed:', key, e); }
}

// 讀取 JSON（失敗回傳 null）
export function storageGetJSON(key) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    } catch(e) {
        console.warn('[storage] getJSON failed:', key, e);
        return null;
    }
}

// 寫入 JSON
export function storageSetJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch(e) { console.warn('[storage] setJSON failed:', key, e); }
}

// 批次刪除（傳入 key 陣列）
export function storageRemoveMany(keys) {
    for (const key of keys) storageRemove(key);
}

// 讀取 settings（從 localStorage，失敗回傳 null）
export function getSettings() {
    return storageGetJSON(STORAGE_KEYS.GAME_SETTINGS);
}

// 儲存 settings（存入 localStorage）
export function saveSettingsToStorage(settings) {
    storageSetJSON(STORAGE_KEYS.GAME_SETTINGS, settings);
}
