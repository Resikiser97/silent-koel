// =============================================================
// 遊戲流程控制 - pausePlayTimer / resumePlayTimer
// 從 main.js 抽出，供 boss / organs / evolution / tutorial 使用
// 避免這些模組反向 import 頂層入口 main.js
// =============================================================

import { gameState } from './gameState.js';

export function pausePlayTimer() {
    if (gameState._playTimerStart !== null) {
        gameState.realPlayTime += Date.now() - gameState._playTimerStart;
        gameState._playTimerStart = null;
    }
    gameState._playTimerPaused = true;
}

export function resumePlayTimer() {
    gameState._playTimerStart = Date.now();
    gameState._playTimerPaused = false;
}
