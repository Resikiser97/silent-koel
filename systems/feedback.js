// =============================================================
// 回饋顯示 - showFloatingText / showXPPopup
// =============================================================
import { gameState } from './gameState.js';
import { VIEW_W, VIEW_H } from './map.js';
import { worldToScreen } from './camera.js';

export function showFloatingText(wx, wy, text, color, fontSize, noMerge = false) {
    const s = worldToScreen(wx, wy);
    if (s.x < -30 || s.x > VIEW_W + 30 || s.y < -30 || s.y > VIEW_H + 30) return;

    // 手機模式上限 12，桌機上限 20
    const maxTexts = gameState.isMobile ? 12 : 20;
    if (gameState.floatTexts.length >= maxTexts) return;

    // 同幀同位置同類型合併（50px 範圍內、100ms 內、同顏色）
    const now = Date.now();
    if (!noMerge) {
        const existing = gameState.floatTexts.find(ft =>
            !ft.noMerge &&
            ft.color === color &&
            Math.abs(ft.wx - wx) < 50 &&
            Math.abs(ft.wy - wy) < 50 &&
            now - ft.startTime < 100
        );
        if (existing) {
            // 嘗試數字合併（如果兩個都是純數字或帶+/-符號的數字）
            const existingNum = parseFloat(existing.text);
            const newNum = parseFloat(text);
            if (!isNaN(existingNum) && !isNaN(newNum)) {
                const combined = existingNum + newNum;
                existing.text = (combined > 0 ? '+' : '') + Math.round(combined);
            }
            // 非數字就跳過（不顯示重複）
            return;
        }
    }

    gameState.floatTexts.push({
        wx, wy,
        screenX: s.x,
        screenY: s.y,
        text: String(text),
        color: color || 'white',
        fontSize: fontSize || 16,
        noMerge,
        startTime: now,
        duration: 1200,
    });
}

export function showXPPopup(wx, wy, amount) {
    if (!amount || amount <= 0) return;
    showFloatingText(wx, wy, '+' + amount, '#FFD700', 13);
}
