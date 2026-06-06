// stats/index.js
// sessionStats 統一讀寫入口
// Stage C - MODULAR_PLAN_V2.md

import { gameState } from '../systems/gameState.js';

export const DEFAULT_SESSION_STATS = {
    giantKills: 0,
    killerKills: 0,
    killerMaxLevel: 0,
    fruitsEaten: 0,
    normalKills: 0,
};

export function resetSessionStats() {
    gameState.sessionStats = { ...DEFAULT_SESSION_STATS };
}

export function getSessionStats() {
    return gameState.sessionStats || { ...DEFAULT_SESSION_STATS };
}

export function incrementStat(key, amount = 1) {
    if (!gameState.sessionStats) resetSessionStats();
    gameState.sessionStats[key] = (gameState.sessionStats[key] || 0) + amount;
}

export function updateStatMax(key, value) {
    if (!gameState.sessionStats) resetSessionStats();
    if (value > (gameState.sessionStats[key] || 0)) {
        gameState.sessionStats[key] = value;
    }
}
