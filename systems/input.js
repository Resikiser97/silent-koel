// =============================================================
// 輸入系統 - 全域 handler refs / handleKeyDown / handleKeyUp
// =============================================================

// 設定介面全域 handler 引用（供 hideSettings 清理用）
let _settingsKeyHandler   = null;
let _settingsMouseHandler = null;
let _rebindBlink          = null;
let _rebindTimeout        = null;
let _skillTreeFromHome    = false;

function handleKeyDown(e) {
    if (e.key === 'Escape') {
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
    if (key === sk.attack || e.key === ' ') {
        e.preventDefault();
        if (!gameState.organSelectionActive && !gameState.settingsOpen) playerAttack();
    }
    gameState.devInput = (gameState.devInput + e.key).slice(-8);
    if (gameState.devInput === '77777778') toggleDevMode();
}

function handleKeyUp(e) {
    const key = e.key.toLowerCase();
    const sk = gameState.settings.keys;
    const moveKeys = [sk.up, sk.down, sk.left, sk.right, 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'];
    if (moveKeys.includes(key)) gameState.keys[key] = false;
}
