// =============================================================
// 獎勵系統 - addXP / checkLevelUp
// =============================================================
import { gameState } from './gameState.js';
import { AudioManager } from './audio.js';
import { t } from '../lang.js';

export function addXP(amount) {
    const xpMult = (gameState.player.mutationXpBonus || 1);
    const finalAmount = xpMult !== 1 ? Math.round(amount * xpMult) : amount;
    gameState.stats.xpCurrent += finalAmount;
    gameState.player.levelXP  += finalAmount;
    checkLevelUp();
    return finalAmount; // 回傳實際加入的 XP（已乘 mutationXpBonus）
}

function checkLevelUp() {
    const p = gameState.player;
    const threshold = 100 + (p.level - 1) * 50;
    if (p.levelXP >= threshold) {
        p.levelXP = 0;
        p.level++;
        gameState.levelUpMessage = { text: t('levelUpFloat', { lv: p.level }), timer: Date.now() };
        AudioManager.play('levelUp');
        window.dispatchEvent(new CustomEvent('levelUp', {
            detail: { level: gameState.player.level }
        }));
    }
}
