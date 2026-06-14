// =============================================================
// 掉落系統 - _spawnBone
// =============================================================
import { gameState } from './gameState.js';

export function _spawnBone(x, y, radius) {
    gameState.bones.push({ x, y, radius: Math.max(4, (radius || 8) * 0.6), spawnTime: Date.now(), eatProgress: 0, lastEatTick: null });
}
