// =============================================================
// 日夜循環系統 - getDayNightPhaseIndex / applyNightTransition
//               applyDayTransition / updateDayNightCycle
// =============================================================

import { gameState } from './gameState.js';
import { AudioManager } from './audio.js';
import { spawnEliteCreature } from './elite.js';
import { spawnBoss } from './boss.js';
import { t } from '../lang.js';

export function getDayNightPhaseIndex() {
    // 每 75 秒一個時段，共 8 段；偶數=白天，奇數=夜晚
    return Math.min(7, Math.floor(Math.max(0, 600 - gameState.timeRemaining) / 75));
}

export function applyNightTransition() {
    gameState.stats.dayCycle = t('phaseNight');
    gameState.isNight = true;
    gameState.dayNightMessage.text = t('nightCome');
    gameState.dayNightMessage.timer = Date.now();
    for (const c of gameState.hostileCreatures) {
        if (c.hp > 0) { c.speed += 0.2; c.damage += 2; }
    }
    const nightNum = (gameState.currentPhaseIndex + 1) / 2;
    if (nightNum >= 1 && nightNum <= 3 && !gameState.eliteCreature) {
        spawnEliteCreature(nightNum);
        AudioManager.playMusic('bossTheme');
    } else {
        AudioManager.playMusic('morningTheme');
    }
}

export function applyDayTransition() {
    gameState.stats.dayCycle = t('phaseDay');
    gameState.isNight = false;
    if (gameState.eliteCreature && gameState.eliteCreature.hp > 0) {
        gameState.eliteCreature = null;
        gameState.topBarTarget    = null;
        gameState.topBarFadeTimer = 0;
        gameState.dayNightMessage.text = t('morningEliteGone');
    } else {
        gameState.dayNightMessage.text = t('morningCome');
    }
    gameState.dayNightMessage.timer = Date.now();
    for (const c of gameState.hostileCreatures) {
        if (c.hp > 0) { c.speed = Math.max(0.1, c.speed - 0.2); c.damage = Math.max(1, c.damage - 2); }
    }
    AudioManager.playMusic('morningTheme');
}

export function updateDayNightCycle() {
    const phaseIndex = getDayNightPhaseIndex();
    if (phaseIndex === gameState.currentPhaseIndex) return;
    gameState.currentPhaseIndex = phaseIndex;
    if (phaseIndex % 2 === 1) {
        applyNightTransition();
    } else {
        applyDayTransition();
    }
    if (phaseIndex === 7 && !gameState.bossSpawned) spawnBoss();
}
