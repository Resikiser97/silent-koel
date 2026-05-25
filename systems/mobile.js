// =============================================================
// 手機觸控系統 - 裝置偵測 / 縮放 / 搖桿 / 攻擊區 / 觸控疊加層
//
// 模組職責：
//   - detectMobile() / getOrientation()：裝置與方向偵測
//   - applyDeviceMode()：依裝置套用 canvas 縮放（MOBILE_GAME_SCALE = 0.6）
//   - _attachJoystickListeners()：手機觸控事件綁定（搖桿 + 攻擊區）
//   - _renderMobileOverlay()：每幀繪製手機觸控層（攻擊回饋動畫、搖桿視覺）
//   - _getAttackBtnPos()：回傳攻擊區矩形中心座標
//
// 重要規則：
//   - MOBILE_GAME_SCALE = 0.6，不要寫死數值，統一在此修改
//   - 自動攻擊開啟時整個螢幕都是移動區，攻擊區不再偵測 tap
//   - onStart handler 用 elementFromPoint 偵測非 canvas 元素時直接 continue
//
// 跨模組依賴：
//   - systems/gameState.js：gameState.isMobile / gameState.orientation
//   - systems/combat.js：playerAttack()
//   - main.js：isGamePaused()
// =============================================================

// =============================================================
// 裝置偵測與方向控制
// =============================================================

let _orientationBarDismissed = false;

function detectMobile() {
    return ('ontouchstart' in window) || window.innerWidth <= 768;
}

function getOrientation() {
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
}

function _effectiveMobile() {
    if (gameState.forceMode === 'mobile')  return true;
    if (gameState.forceMode === 'desktop') return false;
    return detectMobile();
}

function _setViewSize(w, h) {
    if (VIEW_W === w && VIEW_H === h) return;
    VIEW_W = w; VIEW_H = h;
    const gc = document.getElementById('gameCanvas');
    const co = document.getElementById('game-container');
    if (gc) { gc.width = w; gc.height = h; }
    if (co) { co.style.width = w + 'px'; co.style.height = h + 'px'; }
}

const MOBILE_GAME_SCALE = 0.6;

function _applyMobileScale() {
    const container = document.getElementById('game-container');
    if (!container) return;

    if (!gameState.isMobile) {
        _setViewSize(1600, 900);
        container.style.transform       = '';
        container.style.transformOrigin = '';
        container.style.position        = '';
        container.style.left            = '';
        container.style.top             = '';
        document.body.style.display  = '';
        document.body.style.height   = '';
        document.body.style.width    = '';
        document.body.style.overflow = '';
        return;
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    document.body.style.display  = 'block';
    document.body.style.width    = vw + 'px';
    document.body.style.height   = vh + 'px';
    document.body.style.overflow = 'hidden';

    let logicW, logicH, scale;
    if (gameState.orientation === 'landscape') {
        logicW = Math.round(1600 * MOBILE_GAME_SCALE);
        logicH = Math.round(900  * MOBILE_GAME_SCALE);
        scale  = vw / logicW;
    } else {
        logicW = Math.round(900  * MOBILE_GAME_SCALE);
        logicH = Math.round(1600 * MOBILE_GAME_SCALE);
        scale  = vw / logicW;
    }
    _setViewSize(logicW, logicH);
    container.style.position        = 'absolute';
    container.style.left            = '0px';
    container.style.top             = '0px';
    container.style.transformOrigin = 'top left';
    container.style.transform       = 'scale(' + scale + ')';
}

function applyDeviceMode() {
    gameState.forceMode  = gameState.settings.deviceMode !== undefined ? gameState.settings.deviceMode : null;
    gameState.isMobile   = _effectiveMobile();
    gameState.orientation = getOrientation();
    _applyMobileScale();
    _updateJoystickCanvas();
    _updateOrientationBar();
}

function _updateOrientationBar() {
    // 直向模式已支援，不再提示旋轉
    const bar = document.getElementById('orientation-bar');
    if (bar) bar.remove();
}

(function _initOrientationWatcher() {
    function onOrientationChange() {
        const newOri = getOrientation();
        if (newOri === 'landscape') _orientationBarDismissed = false;
        gameState.orientation = newOri;
        gameState.isMobile    = _effectiveMobile();
        _applyMobileScale();
        _updateJoystickCanvas();
        _updateOrientationBar();
    }
    window.addEventListener('resize', onOrientationChange);
    window.addEventListener('orientationchange', onOrientationChange);
}());

// =============================================================
// 虛擬搖桿 + 攻擊區域系統
// =============================================================

let _joyActive  = false;
let _joyTouchId = null;
let _joyBaseX   = 0;
let _joyBaseY   = 0;
let _joyKnobX   = 0;
let _joyKnobY   = 0;
const JOY_OUTER  = 60;
const JOY_INNER  = 25;
const ATK_RADIUS = 40;

let _atkFeedbackTime = 0;
let _atkFeedbackX    = 0;
let _atkFeedbackY    = 0;

// 阿奇爾手機方向滑動追蹤（攻擊區觸碰時記錄滑動起點→終點，放開時發射）
let _archerDirTouchId = null;
let _archerDirStartX  = 0;
let _archerDirStartY  = 0;
let _archerDirCurX    = 0;
let _archerDirCurY    = 0;

// 近戰蓄力攻擊追蹤（touchstart 即開始計時，touchend 依蓄力時間發動普通或蓄力攻擊）
let _mobileAtkTouchId = null;

function _joyZone(x, y) {
    return !_attackZone(x, y);
}

function _getAttackBtnPos() {
    const vw = window.innerWidth, vh = window.innerHeight;
    if (gameState.orientation === 'landscape') {
        return { x: vw * 0.875, y: vh * 0.75 };
    }
    return { x: vw * 0.75, y: vh * 0.875 };
}

function _attackZone(x, y) {
    if (gameState.settings.autoAttack) return false;
    const vw = window.innerWidth, vh = window.innerHeight;
    if (gameState.orientation === 'landscape') {
        return x >= vw * 0.75 && y >= vh * 0.5;
    }
    return x >= vw * 0.5 && y >= vh * 0.75;
}

// 閃現區：攻擊區正上方，尺寸縮小為攻擊區的 50%（中心點對齊）
function _dashZone(x, y) {
    const vw = window.innerWidth, vh = window.innerHeight;
    if (gameState.orientation === 'landscape') {
        const atkW = vw * 0.25, atkH = vh * 0.5;
        const dashW = atkW * 0.5, dashH = atkH * 0.5;
        const centerX = vw * 0.875;
        const centerY = vh * 0.75 - atkH;   // = vh * 0.25
        return x >= centerX - dashW / 2 && x <= centerX + dashW / 2
            && y >= centerY - dashH / 2 && y <= centerY + dashH / 2;
    }
    // 直向
    const atkW = vw * 0.5, atkH = vh * 0.25;
    const dashW = atkW * 0.5, dashH = atkH * 0.5;
    const centerX = vw * 0.75;
    const centerY = vh * 0.875 - atkH;      // = vh * 0.625
    return x >= centerX - dashW / 2 && x <= centerX + dashW / 2
        && y >= centerY - dashH / 2 && y <= centerY + dashH / 2;
}

function _renderMobileOverlay() {
    const jc = document.getElementById('joystick-canvas');
    if (!jc) return;
    const jctx = jc.getContext('2d');
    jctx.clearRect(0, 0, jc.width, jc.height);
    const vw = window.innerWidth, vh = window.innerHeight;
    const autoAtk = gameState.settings.autoAttack;

    if (gameState.orientation === 'landscape') {
        // ── 攻擊區圖示（自動攻擊：⚔️ 自動 32px；一般：⚔️ 60px）
        const atkCX = vw * 0.875, atkCY = vh * 0.75;
        jctx.save();
        jctx.globalAlpha = 0.25;
        jctx.textAlign = 'center';
        jctx.textBaseline = 'middle';
        jctx.fillStyle = 'white';
        if (autoAtk) {
            jctx.globalAlpha = 0.2;
            jctx.font = '32px Arial';
            jctx.fillText('⚔️ 自動', atkCX, atkCY);
        } else {
            jctx.globalAlpha = 0.2;
            jctx.font = '60px Arial';
            jctx.fillText('⚔️', atkCX, atkCY);
        }
        jctx.restore();

        // ── 攻擊點擊回饋（0.3 秒淡出 ⚔️，自動攻擊時不顯示）
        if (!autoAtk && _atkFeedbackTime > 0 && Date.now() - _atkFeedbackTime < 300) {
            const alpha = (1 - (Date.now() - _atkFeedbackTime) / 300) * 0.85;
            jctx.save();
            jctx.globalAlpha = alpha;
            jctx.font = '50px Arial';
            jctx.textAlign = 'center';
            jctx.textBaseline = 'middle';
            jctx.fillText('⚔️', _atkFeedbackX, _atkFeedbackY);
            jctx.restore();
        }

        // ── 橫向：閃現按鈕（攻擊區正上方，縮小為攻擊區 50%）
        {
            const atkW = vw * 0.25, atkH = vh * 0.5;
            const dashW = atkW * 0.5, dashH = atkH * 0.5;
            const dashCX = vw * 0.875;
            const dashCY = vh * 0.75 - atkH;  // = vh * 0.25
            const dashL  = dashCX - dashW / 2;
            const dashT  = dashCY - dashH / 2;
            const dashCD = gameState.player.dashCooldown || 0;
            jctx.save();
            jctx.textAlign = 'center';
            jctx.textBaseline = 'middle';
            jctx.fillStyle = 'white';
            if (dashCD <= 0) {
                jctx.globalAlpha = 0.15;
                jctx.font = '40px Arial';
                jctx.fillText('💨', dashCX, dashCY);
            } else {
                jctx.globalAlpha = 0.08;
                jctx.font = '40px Arial';
                jctx.fillText('💨', dashCX, dashCY);
                const prog = dashCD / 15000;
                jctx.globalAlpha = 0.55;
                jctx.fillStyle = 'rgba(100,100,100,0.55)';
                jctx.fillRect(dashL, dashT, dashW, dashH * prog);
                jctx.globalAlpha = 0.7;
                jctx.fillStyle = 'white';
                jctx.font = '20px Arial';
                jctx.fillText(Math.ceil(dashCD / 1000) + 's', dashCX, dashCY);
            }
            jctx.restore();
        }

        // ── 動態搖桿（啟用時）
        if (_joyActive) {
            jctx.beginPath();
            jctx.arc(_joyBaseX, _joyBaseY, JOY_OUTER, 0, Math.PI * 2);
            jctx.strokeStyle = 'rgba(255,255,255,0.45)';
            jctx.lineWidth = 3;
            jctx.stroke();
            jctx.beginPath();
            jctx.arc(_joyKnobX, _joyKnobY, JOY_INNER, 0, Math.PI * 2);
            jctx.fillStyle = 'rgba(255,255,255,0.55)';
            jctx.fill();
        }
    } else {
        // ── 直向：攻擊區圖示
        const atkCX = vw * 0.75, atkCY = vh * 0.875;
        jctx.save();
        jctx.globalAlpha = 0.25;
        jctx.textAlign = 'center';
        jctx.textBaseline = 'middle';
        jctx.fillStyle = 'white';
        if (autoAtk) {
            jctx.globalAlpha = 0.2;
            jctx.font = '32px Arial';
            jctx.fillText('⚔️ 自動', atkCX, atkCY);
        } else {
            jctx.globalAlpha = 0.2;
            jctx.font = '60px Arial';
            jctx.fillText('⚔️', atkCX, atkCY);
        }
        jctx.restore();

        // ── 直向：閃現按鈕（攻擊區正上方，縮小為攻擊區 50%）
        {
            const atkW = vw * 0.5, atkH = vh * 0.25;
            const dashW = atkW * 0.5, dashH = atkH * 0.5;
            const dashCX = vw * 0.75;
            const dashCY = vh * 0.875 - atkH;  // = vh * 0.625
            const dashL  = dashCX - dashW / 2;
            const dashT  = dashCY - dashH / 2;
            const dashCD = gameState.player.dashCooldown || 0;
            jctx.save();
            jctx.textAlign = 'center';
            jctx.textBaseline = 'middle';
            jctx.fillStyle = 'white';
            if (dashCD <= 0) {
                jctx.globalAlpha = 0.15;
                jctx.font = '40px Arial';
                jctx.fillText('💨', dashCX, dashCY);
            } else {
                jctx.globalAlpha = 0.08;
                jctx.font = '40px Arial';
                jctx.fillText('💨', dashCX, dashCY);
                const prog = dashCD / 15000;
                jctx.globalAlpha = 0.55;
                jctx.fillStyle = 'rgba(100,100,100,0.55)';
                jctx.fillRect(dashL, dashT, dashW, dashH * prog);
                jctx.globalAlpha = 0.7;
                jctx.fillStyle = 'white';
                jctx.font = '20px Arial';
                jctx.fillText(Math.ceil(dashCD / 1000) + 's', dashCX, dashCY);
            }
            jctx.restore();
        }

        // ── 直向：搖桿（動態位置）
        if (_joyActive) {
            jctx.beginPath();
            jctx.arc(_joyBaseX, _joyBaseY, JOY_OUTER, 0, Math.PI * 2);
            jctx.strokeStyle = 'rgba(255,255,255,0.4)';
            jctx.lineWidth = 3;
            jctx.stroke();
            jctx.beginPath();
            jctx.arc(_joyKnobX, _joyKnobY, JOY_INNER, 0, Math.PI * 2);
            jctx.fillStyle = 'rgba(255,255,255,0.55)';
            jctx.fill();
        }
    }
}

let _joyDocListeners = null;

function _joyPaused() {
    return !gameState.gameStarted ||
           gameState.organSelectionActive || gameState.settingsOpen ||
           gameState.skillTreeOpen || gameState.gameOver || gameState.victory ||
           gameState.mutationPanelOpen;
}

function _attachJoystickListeners() {
    if (_joyDocListeners) return;

    const onStart = (e) => {
        if (_joyPaused()) return;
        let handled = false;
        for (const touch of e.changedTouches) {
            const topEl = document.elementFromPoint(touch.clientX, touch.clientY);
            if (topEl && topEl.id !== 'gameCanvas' && topEl.id !== 'joystick-canvas') continue;

            // 器官 tooltip（gameCanvas 觸碰需先換算 canvas 座標）
            if (topEl && topEl.id === 'gameCanvas' && _organHitRegions.length) {
                const rect = topEl.getBoundingClientRect();
                const canvasX = (touch.clientX - rect.left) / rect.width  * topEl.width;
                const canvasY = (touch.clientY - rect.top)  / rect.height * topEl.height;
                const hit = _organHitRegions.find(
                    r => canvasX >= r.x && canvasX <= r.x + r.w && canvasY >= r.y && canvasY <= r.y + r.h
                );
                if (hit) {
                    if (gameState.settings.showOrganTooltip) {
                        showTooltip(hit.data, touch.clientX, touch.clientY);
                        setTimeout(hideTooltip, 500);
                    }
                    // 不論 tooltip 開關狀態，都繼續往下執行搖桿啟動邏輯
                    // （移除 continue，避免器官區域成為移動死區）
                }
            }

            const x = touch.clientX, y = touch.clientY;

            // 閃現區（優先於攻擊區）
            if (_dashZone(x, y)) {
                handled = true;
                playerDash();
                continue;
            }

            // 攻擊區
            if (_attackZone(x, y)) {
                handled = true;
                if (gameState.player.isRanged && _archerDirTouchId === null) {
                    // 阿奇爾：記錄起始座標，等放開後計算方向並發射
                    _archerDirTouchId = touch.identifier;
                    _archerDirStartX  = x;
                    _archerDirStartY  = y;
                    _archerDirCurX    = x;
                    _archerDirCurY    = y;
                } else if (!gameState.player.isRanged && _mobileAtkTouchId === null) {
                    // 近戰（噪鵑）：touchstart 立即開始蓄力計時
                    _mobileAtkTouchId = touch.identifier;
                    gameState._mobileChargeStart = Date.now();
                    gameState._mobileCharging    = true;
                }
                continue;
            }

            // 搖桿區
            if (_joyTouchId !== null) continue;
            if (!_joyZone(x, y)) continue;
            handled = true;
            _joyActive  = true;
            _joyTouchId = touch.identifier;
            _joyBaseX = x; _joyBaseY = y;
            _joyKnobX = x; _joyKnobY = y;
            gameState.mobileInput = { dx: 0, dy: 0 };
            _renderMobileOverlay();
        }
        if (handled) e.preventDefault();
    };

    const onMove = (e) => {
        for (const touch of e.changedTouches) {
            // 搖桿移動
            if (touch.identifier === _joyTouchId) {
                e.preventDefault();
                const ddx  = touch.clientX - _joyBaseX;
                const ddy  = touch.clientY - _joyBaseY;
                const dist = Math.sqrt(ddx * ddx + ddy * ddy);
                const clamp  = Math.min(dist, JOY_OUTER);
                const factor = dist > 0 ? clamp / dist : 0;
                _joyKnobX = _joyBaseX + ddx * factor;
                _joyKnobY = _joyBaseY + ddy * factor;
                const spd = clamp / JOY_OUTER;
                gameState.mobileInput = {
                    dx: dist > 0 ? (ddx / dist) * spd : 0,
                    dy: dist > 0 ? (ddy / dist) * spd : 0
                };
                _renderMobileOverlay();
            }
            // 阿奇爾方向追蹤：更新當前位置
            if (touch.identifier === _archerDirTouchId) {
                e.preventDefault();
                _archerDirCurX = touch.clientX;
                _archerDirCurY = touch.clientY;
            }
        }
    };

    const onEnd = (e) => {
        for (const touch of e.changedTouches) {
            // 搖桿放開
            if (touch.identifier === _joyTouchId) {
                _joyActive  = false;
                _joyTouchId = null;
                gameState.mobileInput = { dx: 0, dy: 0 };
                _renderMobileOverlay();
            }
            // 近戰蓄力攻擊放開：依蓄力時間發動普通或蓄力攻擊
            if (touch.identifier === _mobileAtkTouchId) {
                _mobileAtkTouchId = null;
                if (gameState._mobileCharging) {
                    const chargeTime = Date.now() - (gameState._mobileChargeStart || Date.now());
                    gameState._mobileCharging    = false;
                    gameState._mobileChargeStart = null;
                    // 蓄力時間 >= 500ms 視為蓄力攻擊，否則普通攻擊
                    if (chargeTime >= 500) {
                        gameState._mobileChargeAttack = true;
                    }
                    playerAttack();
                    gameState._mobileChargeAttack = false;
                    if (gameState.orientation === 'landscape') {
                        _atkFeedbackTime = Date.now();
                        _atkFeedbackX = touch.clientX;
                        _atkFeedbackY = touch.clientY;
                    }
                }
            }
            // 阿奇爾攻擊區放開：計算方向並發射
            if (touch.identifier === _archerDirTouchId) {
                _archerDirTouchId = null;
                const ddx = _archerDirCurX - _archerDirStartX;
                const ddy = _archerDirCurY - _archerDirStartY;
                const len = Math.sqrt(ddx * ddx + ddy * ddy);
                const p   = gameState.player;
                if (p && p.isRanged && p.reloadCharges > 0) {
                    p.reloadCharges--;
                    p.reloadTimer = 0;
                    // 有滑動方向（> 8px）→ 往滑動方向發射；否則往 lastMoveDir 發射
                    let dx, dy;
                    if (len > 8) {
                        dx = ddx / len;
                        dy = ddy / len;
                    } else {
                        const ld = p.lastMoveDir || { dx: 0, dy: -1 };
                        const ll = Math.sqrt(ld.dx * ld.dx + ld.dy * ld.dy) || 1;
                        dx = ld.dx / ll;
                        dy = ld.dy / ll;
                    }
                    const dmg = Math.max(1, Math.round(p.attack));
                    gameState.projectiles.push({
                        x: p.x, y: p.y,
                        vx: dx * 9, vy: dy * 9,
                        damage: dmg,
                        maxRange: p.attackRange * 1.2,
                        distTraveled: 0,
                        radius: 5,
                        ownerId: 'player',
                        hasCrit: false,
                    });
                    p.attackVisual = Date.now();
                    AudioManager.play('attackNormal');
                    // 橫向模式攻擊回饋動畫
                    if (gameState.orientation === 'landscape') {
                        _atkFeedbackTime = Date.now();
                        _atkFeedbackX    = _archerDirStartX;
                        _atkFeedbackY    = _archerDirStartY;
                    }
                }
            }
        }
    };

    const onCancel = (e) => {
        for (const touch of e.changedTouches) {
            // 近戰蓄力重置
            if (touch.identifier === _mobileAtkTouchId) {
                _mobileAtkTouchId            = null;
                gameState._mobileCharging    = false;
                gameState._mobileChargeStart = null;
                gameState._mobileChargeAttack = false;
            }
        }
        onEnd(e);
    };

    document.addEventListener('touchstart',  onStart,   { passive: false });
    document.addEventListener('touchmove',   onMove,    { passive: false });
    document.addEventListener('touchend',    onEnd,     { passive: false });
    document.addEventListener('touchcancel', onCancel,  { passive: false });
    _joyDocListeners = { onStart, onMove, onEnd, onCancel };
}

function _detachJoystickListeners() {
    if (!_joyDocListeners) return;
    const { onStart, onMove, onEnd, onCancel } = _joyDocListeners;
    document.removeEventListener('touchstart',  onStart,  { passive: false });
    document.removeEventListener('touchmove',   onMove,   { passive: false });
    document.removeEventListener('touchend',    onEnd,    { passive: false });
    document.removeEventListener('touchcancel', onCancel, { passive: false });
    _joyDocListeners = null;
}

function _updateJoystickCanvas() {
    const jc = document.getElementById('joystick-canvas');
    if (!jc) return;
    if (gameState.isMobile) {
        jc.style.display       = 'block';
        jc.style.pointerEvents = 'none';
        jc.width  = window.innerWidth;
        jc.height = window.innerHeight;
        _attachJoystickListeners();
        _renderMobileOverlay();
    } else {
        jc.style.display = 'none';
        _joyActive  = false;
        _joyTouchId = null;
        gameState.mobileInput = { dx: 0, dy: 0 };
        _detachJoystickListeners();
    }
}
