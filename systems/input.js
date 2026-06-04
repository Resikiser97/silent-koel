// =============================================================
// 輸入系統 - 全域 handler refs / handleKeyDown / handleKeyUp
// =============================================================
import { gameState } from './gameState.js';
import { MAP_WIDTH, MAP_HEIGHT } from './map.js';
import { AudioManager } from './audio.js';
import { playerAttack } from './combat.js';
import { playerDash, _getArcherShootDir } from './player.js';
import { saveSettings, toggleDevMode, showSettings, hideSettings } from './ui.js';
import { _chatExpanded, _collapseChat } from './chat.js';

export let _settingsKeyHandler = null;
export let _settingsMouseHandler = null;
export let _rebindBlink = null;
export let _rebindTimeout = null;

export function handleKeyDown(e) {
    if (e.key === 'Escape') {
        if (typeof _chatExpanded !== 'undefined' && _chatExpanded) {
            if (typeof _collapseChat === 'function') _collapseChat();
            return;
        }
        if (gameState.settingsOpen) { hideSettings(); } else if (!gameState.gameOver) { showSettings(); }
        return;
    }
    if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
    if (gameState._rebindTarget) { e.preventDefault(); return; }

    const key = e.key.toLowerCase();
    const sk = gameState.settings.keys;
    const moveKeys = [sk.up, sk.down, sk.left, sk.right, 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'];
    if (moveKeys.includes(key)) {
        gameState.keys[key] = true;
        e.preventDefault();
    }

    const attackKey = sk.attack;
    if (key === attackKey || e.key === ' ') {
        e.preventDefault();
        if (!gameState.organSelectionActive && !gameState.settingsOpen) {
            const p = gameState.player;
            // 阿奇爾手動模式：按下開始蓄力
            if (p.isRanged && !gameState.settings.autoAttack && !p.chargeHolding) {
                p.chargeHolding  = true;
                p.chargeHoldTime = 0;
                p.chargeConsumed = 0;
            } else {
                playerAttack();
            }
        }
    }
    if (key === 'z') {
        if (!gameState.organSelectionActive && !gameState.settingsOpen &&
            !gameState.skillTreeOpen && !gameState.gameOver && !gameState.victory) {
            gameState.settings.autoAttack = !gameState.settings.autoAttack;
            saveSettings();
        }
    }
    if (key === (gameState.settings.keys.dash || 'f')) {
        if (!gameState.organSelectionActive && !gameState.settingsOpen &&
            !gameState.skillTreeOpen && !gameState.gameOver && !gameState.victory &&
            !gameState.mutationPanelOpen && !gameState.tutorialOpen) {
            playerDash();
        }
    }
    gameState.devInput = (gameState.devInput + e.key).slice(-8);
    if (gameState.devInput === '77777778') toggleDevMode();
}

export function handleKeyUp(e) {
    const key = e.key.toLowerCase();
    const sk = gameState.settings.keys;
    const moveKeys = [sk.up, sk.down, sk.left, sk.right, 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'];
    if (moveKeys.includes(key)) gameState.keys[key] = false;

    // 阿奇爾手動蓄力：放開攻擊鍵時發射
    const attackKey = sk.attack;
    if (key === attackKey || e.key === ' ') {
        const p = gameState.player;
        if (p && p.isRanged && !gameState.settings.autoAttack && p.chargeHolding) {
            p.chargeHolding = false;
            // 按住時間 < 500ms（快速點擊）→ 消耗1格普通攻擊
            if (p.chargeConsumed === 0 && p.reloadCharges > 0) {
                p.reloadCharges--;
                p.reloadTimer   = 0;
                p.chargeConsumed = 1;
            }
            // 發射蓄力子彈
            if (p.chargeConsumed > 0) {
                const dir = _getArcherShootDir();
                if (dir) {
                    const dmg = Math.max(1, Math.round(p.attack * p.chargeConsumed));
                    gameState.projectiles.push({
                        x: p.x, y: p.y,
                        vx: dir.dx * 9, vy: dir.dy * 9,
                        damage: dmg,
                        maxRange: p.attackRange * 1.2,
                        distTraveled: 0,
                        radius: 5,
                        ownerId: 'player',
                        hasCrit: false,
                    });
                    p.attackVisual = Date.now();
                    AudioManager.play('attackNormal');
                }
            }
            p.chargeConsumed = 0;
        }
    }
}

// ── 阿奇爾滑鼠世界座標追蹤（在 initializeGame 內的 mousemove listener 呼叫此函式）
export function _updateMouseWorld(clientX, clientY) {
    const canvasEl = document.getElementById('gameCanvas');
    if (!canvasEl) return;
    const rect   = canvasEl.getBoundingClientRect();
    const scaleX = canvasEl.width  / rect.width;
    const scaleY = canvasEl.height / rect.height;
    const sx = (clientX - rect.left) * scaleX;
    const sy = (clientY - rect.top)  * scaleY;
    gameState.mouseWorld = {
        x: ((sx + gameState.camera.x) % MAP_WIDTH  + MAP_WIDTH)  % MAP_WIDTH,
        y: ((sy + gameState.camera.y) % MAP_HEIGHT + MAP_HEIGHT) % MAP_HEIGHT,
    };
    // 同步保存 canvas 螢幕座標：攻擊時用當下玩家位置重新計算方向，不受 camera 位移影響
    gameState.mouseScreen = { sx, sy };
}
