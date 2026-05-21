// =============================================================
// UI 系統 - Tooltip / drawGame / updateUI / drawTreasures
//           Settings / updateTimer / Dev Mode
//           showGuide / hideGuide / showStartScreen
// =============================================================

// ── 小地圖全域變數
let _minimapTerrainCanvas  = null;
let _minimapTerrainSeed    = -1;
let _minimapCanvas         = null;
let _minimapCtx            = null;
let _sunmoonCanvas         = null;
let _sunmoonCtx            = null;
let _minimapFogCanvas      = null;
let _minimapFogCtx         = null;
let _minimapFogImageData   = null;
let _minimapFogRenderCanvas = null;
let _minimapFogRenderCtx    = null;
let _fogCloudCanvas         = null;

// ── Tooltip 全域變數
let _organHitRegions = [];
const _ttEl = document.getElementById('game-tooltip');
document.addEventListener('mousemove', function(e) {
    if (_ttEl && _ttEl.style.display !== 'none') _moveTooltip(e.clientX, e.clientY);
});

function showTooltip(data, cx, cy) {
    if (!_ttEl) return;
    let html = '<div class="tt-name">' + _escH(data.name || '');
    if (data.level != null) {
        html += ' <span style="font-weight:normal;font-size:12px;color:#aaa;">Lv.' + data.level + (data.maxLevel ? '/' + data.maxLevel : '') + '</span>';
    }
    html += '</div>';
    if (data.isHidden) html += '<div class="tt-hidden">' + t('hiddenOrganTag') + '</div>';
    html += '<div class="tt-desc">' + _escH(data.desc || '') + '</div>';
    if (data.combo) html += '<div class="tt-combo">' + t('comboHintLabel') + _escH(data.combo) + '</div>';
    _ttEl.innerHTML = html;
    _ttEl.style.display = 'block';
    _moveTooltip(cx, cy);
}

function hideTooltip() {
    if (_ttEl) _ttEl.style.display = 'none';
}

function _moveTooltip(cx, cy) {
    if (!_ttEl) return;
    const tw = _ttEl.offsetWidth || 250;
    const th = _ttEl.offsetHeight || 80;
    let tx = cx + 14;
    let ty = cy + 14;
    if (tx + tw > window.innerWidth  - 10) tx = cx - tw - 14;
    if (ty + th > window.innerHeight - 10) ty = cy - th - 14;
    _ttEl.style.left = tx + 'px';
    _ttEl.style.top  = ty + 'px';
}

function _escH(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

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
           gameState.skillTreeOpen || gameState.gameOver || gameState.victory;
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
                    showTooltip(hit.data, touch.clientX, touch.clientY);
                    setTimeout(hideTooltip, 500);
                    continue;
                }
            }

            const x = touch.clientX, y = touch.clientY;

            // 攻擊區
            if (_attackZone(x, y)) {
                handled = true;
                playerAttack();
                if (gameState.orientation === 'landscape') {
                    _atkFeedbackTime = Date.now();
                    _atkFeedbackX = x;
                    _atkFeedbackY = y;
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
        if (_joyTouchId === null) return;
        for (const touch of e.changedTouches) {
            if (touch.identifier !== _joyTouchId) continue;
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
    };

    const onEnd = (e) => {
        for (const touch of e.changedTouches) {
            if (touch.identifier !== _joyTouchId) continue;
            _joyActive  = false;
            _joyTouchId = null;
            gameState.mobileInput = { dx: 0, dy: 0 };
            _renderMobileOverlay();
        }
    };

    document.addEventListener('touchstart',  onStart, { passive: false });
    document.addEventListener('touchmove',   onMove,  { passive: false });
    document.addEventListener('touchend',    onEnd,   { passive: false });
    document.addEventListener('touchcancel', onEnd,   { passive: false });
    _joyDocListeners = { onStart, onMove, onEnd };
}

function _detachJoystickListeners() {
    if (!_joyDocListeners) return;
    const { onStart, onMove, onEnd } = _joyDocListeners;
    document.removeEventListener('touchstart',  onStart, { passive: false });
    document.removeEventListener('touchmove',   onMove,  { passive: false });
    document.removeEventListener('touchend',    onEnd,   { passive: false });
    document.removeEventListener('touchcancel', onEnd,   { passive: false });
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

// =============================================================
// 小地圖系統
// =============================================================

function _buildFogCloudTexture() {
    const size = 300;
    const tc   = document.createElement('canvas');
    tc.width   = tc.height = size;
    const tctx = tc.getContext('2d');
    let seed = 73856;
    const rng = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967295; };
    for (let i = 0; i < 70; i++) {
        const x = rng() * size;
        const y = rng() * size;
        const r = 15 + rng() * 60;
        const v = Math.floor(190 + rng() * 65);
        const a = 0.25 + rng() * 0.65;
        const g = tctx.createRadialGradient(x, y, r * 0.1, x, y, r);
        g.addColorStop(0,   'rgba(' + v + ',' + v + ',' + v + ',' + a.toFixed(2) + ')');
        g.addColorStop(0.5, 'rgba(255,255,255,' + (a * 0.4).toFixed(2) + ')');
        g.addColorStop(1,   'rgba(255,255,255,0)');
        tctx.fillStyle = g;
        tctx.beginPath();
        tctx.arc(x, y, r, 0, Math.PI * 2);
        tctx.fill();
    }
    return tc;
}

function updateMinimapFog() {
    if (!gameState.fogMap) return;
    const COLS = MAP_WIDTH  / TILE_SIZE; // 400
    const ROWS = MAP_HEIGHT / TILE_SIZE; // 400
    const cam  = gameState.camera;
    const gx0  = Math.floor(cam.x / TILE_SIZE);
    const gy0  = Math.floor(cam.y / TILE_SIZE);
    const gxW  = Math.ceil(VIEW_W / TILE_SIZE) + 1; // 81
    const gyW  = Math.ceil(VIEW_H / TILE_SIZE) + 1; // 46
    for (let dy = 0; dy < gyW; dy++) {
        for (let dx = 0; dx < gxW; dx++) {
            const gx = ((gx0 + dx) % COLS + COLS) % COLS;
            const gy = ((gy0 + dy) % ROWS + ROWS) % ROWS;
            gameState.fogMap[gy][gx] = false;
        }
    }
}

function _mmSize() { return gameState.isMobile ? 200 : 300; }

function _drawMinimapFog(mctx) {
    if (!gameState.fogMap) return;
    if (!_minimapFogCanvas) {
        _minimapFogCanvas        = document.createElement('canvas');
        _minimapFogCanvas.width  = 400;
        _minimapFogCanvas.height = 400;
        _minimapFogCtx           = _minimapFogCanvas.getContext('2d');
        _minimapFogImageData     = _minimapFogCtx.createImageData(400, 400);
    }
    const MARGIN = 15;
    const mm     = _mmSize();
    const RC     = mm + MARGIN * 2;
    if (!_minimapFogRenderCanvas || _minimapFogRenderCanvas.width !== RC) {
        _minimapFogRenderCanvas        = document.createElement('canvas');
        _minimapFogRenderCanvas.width  = RC;
        _minimapFogRenderCanvas.height = RC;
        _minimapFogRenderCtx           = _minimapFogRenderCanvas.getContext('2d');
    }
    if (!_fogCloudCanvas) _fogCloudCanvas = _buildFogCloudTexture();

    // 寫入硬邊迷霧像素（白天白色 / 夜晚黑色）
    const d      = _minimapFogImageData.data;
    const fogMap = gameState.fogMap;
    const v      = gameState.isNight ? 0 : 255;
    for (let gy = 0; gy < 400; gy++) {
        const row = fogMap[gy];
        for (let gx = 0; gx < 400; gx++) {
            const i = (gy * 400 + gx) * 4;
            if (row[gx]) { d[i] = v; d[i + 1] = v; d[i + 2] = v; d[i + 3] = 255; }
            else          { d[i + 3] = 0; }
        }
    }
    _minimapFogCtx.putImageData(_minimapFogImageData, 0, 0);

    // 渲染到 330×330 暫存畫布，使 blur kernel 在可視邊緣（距邊 15px）有足夠霧像素可採樣
    const rc = _minimapFogRenderCtx;
    rc.clearRect(0, 0, RC, RC);
    rc.filter = 'blur(8px)';
    rc.drawImage(_minimapFogCanvas, 0, 0, 400, 400, 0, 0, RC, RC);
    rc.filter = 'none';

    // 白天：用 source-atop 把雲霧材質貼在迷霧形狀內
    if (!gameState.isNight) {
        rc.globalCompositeOperation = 'source-atop';
        rc.drawImage(_fogCloudCanvas, 0, 0, 300, 300, 0, 0, RC, RC);
        rc.globalCompositeOperation = 'source-over';
    }

    // 只取中央 mm×mm，兩側各 15px 的邊緣失真區不顯示
    mctx.drawImage(_minimapFogRenderCanvas, MARGIN, MARGIN, mm, mm, 0, 0, mm, mm);
}

function _buildMinimapTerrainCanvas() {
    const mc   = document.createElement('canvas');
    mc.width   = 400;
    mc.height  = 400;
    const mctx = mc.getContext('2d');
    const cols = MAP_WIDTH  / TILE_SIZE;
    const rows = MAP_HEIGHT / TILE_SIZE;
    for (let gy = 0; gy < rows; gy++) {
        for (let gx = 0; gx < cols; gx++) {
            mctx.fillStyle = BIOME_COLOR[gameState.terrainMap[gy][gx]] || '#549954';
            mctx.fillRect(gx, gy, 1, 1);
        }
    }
    _minimapTerrainCanvas = mc;
    _minimapTerrainSeed   = gameState.mapSeed;
}

function _drawMinimapEntities(mctx) {
    if (!gameState.fogMap) return;
    const scale = _mmSize() / MAP_WIDTH;
    const COLS  = MAP_WIDTH  / TILE_SIZE;
    const ROWS  = MAP_HEIGHT / TILE_SIZE;

    const toMM = (wx, wy) => ({
        x: ((wx % MAP_WIDTH  + MAP_WIDTH)  % MAP_WIDTH)  * scale,
        y: ((wy % MAP_HEIGHT + MAP_HEIGHT) % MAP_HEIGHT) * scale
    });

    const isRevealed = (wx, wy) => {
        const gx = Math.floor(((wx % MAP_WIDTH  + MAP_WIDTH)  % MAP_WIDTH)  / TILE_SIZE);
        const gy = Math.floor(((wy % MAP_HEIGHT + MAP_HEIGHT) % MAP_HEIGHT) / TILE_SIZE);
        if (gy < 0 || gy >= ROWS || gx < 0 || gx >= COLS) return false;
        return !gameState.fogMap[gy][gx];
    };

    // 中立生物（橘色）
    mctx.fillStyle = '#FFA040';
    for (const c of gameState.neutralCreatures) {
        if (c.hp <= 0 || !isRevealed(c.x, c.y)) continue;
        const m = toMM(c.x, c.y);
        mctx.beginPath(); mctx.arc(m.x, m.y, 1.5, 0, Math.PI * 2); mctx.fill();
    }

    // 敵意生物（紅色）
    mctx.fillStyle = '#FF4040';
    for (const c of gameState.hostileCreatures) {
        if (c.hp <= 0 || !isRevealed(c.x, c.y)) continue;
        const m = toMM(c.x, c.y);
        mctx.beginPath(); mctx.arc(m.x, m.y, 1.5, 0, Math.PI * 2); mctx.fill();
    }

    // 精英怪（金色，較大）
    if (gameState.eliteCreature && gameState.eliteCreature.hp > 0 && isRevealed(gameState.eliteCreature.x, gameState.eliteCreature.y)) {
        const m = toMM(gameState.eliteCreature.x, gameState.eliteCreature.y);
        mctx.fillStyle = '#FFD700';
        mctx.beginPath(); mctx.arc(m.x, m.y, 3, 0, Math.PI * 2); mctx.fill();
    }

    // Boss（深紅帶描邊）
    if (gameState.boss && gameState.boss.hp > 0 && isRevealed(gameState.boss.x, gameState.boss.y)) {
        const m = toMM(gameState.boss.x, gameState.boss.y);
        mctx.fillStyle = '#CC0000';
        mctx.strokeStyle = '#FF6600'; mctx.lineWidth = 1.5;
        mctx.beginPath(); mctx.arc(m.x, m.y, 4, 0, Math.PI * 2);
        mctx.fill(); mctx.stroke();
        mctx.lineWidth = 1;
    }

    // 玩家（白/綠交替閃爍，帶黑色描邊）
    const pm   = toMM(gameState.player.x, gameState.player.y);
    const blink = Math.floor(Date.now() / 500) % 2 === 0;
    mctx.fillStyle   = blink ? '#FFFFFF' : '#00FF88';
    mctx.strokeStyle = 'rgba(0,0,0,0.8)'; mctx.lineWidth = 1.5;
    mctx.beginPath(); mctx.arc(pm.x, pm.y, 3.5, 0, Math.PI * 2);
    mctx.fill(); mctx.stroke();
    mctx.lineWidth = 1;
}

function drawMinimap() {
    if (!_minimapCanvas) {
        _minimapCanvas = document.getElementById('minimapCanvas');
        if (!_minimapCanvas) return;
        _minimapCtx = _minimapCanvas.getContext('2d');
    }
    const mm = _mmSize();
    if (_minimapCanvas.width !== mm) {
        _minimapCanvas.width  = mm;
        _minimapCanvas.height = mm;
    }
    if (!gameState.terrainMap) {
        _minimapCtx.fillStyle = '#222';
        _minimapCtx.fillRect(0, 0, mm, mm);
    } else {
        if (!_minimapTerrainCanvas || _minimapTerrainSeed !== gameState.mapSeed) {
            _buildMinimapTerrainCanvas();
        }
        _minimapCtx.imageSmoothingEnabled = false;
        _minimapCtx.drawImage(_minimapTerrainCanvas, 0, 0, 400, 400, 0, 0, mm, mm);
        _drawMinimapFog(_minimapCtx);
        _drawMinimapEntities(_minimapCtx);
    }
    _drawSunMoonIndicator();
}

function _drawSunMoonIndicator() {
    if (!_sunmoonCanvas) {
        _sunmoonCanvas = document.getElementById('sunmoonCanvas');
        if (!_sunmoonCanvas) return;
        _sunmoonCtx = _sunmoonCanvas.getContext('2d');
    }
    const mctx = _sunmoonCtx;
    const W = 24, H = 24;
    mctx.clearRect(0, 0, W, H);

    const timeElapsed   = Math.max(0, 600 - gameState.timeRemaining);
    const phaseIndex    = Math.min(7, Math.floor(timeElapsed / 75));
    const phaseProgress = (timeElapsed % 75) / 75;
    const isDay         = phaseIndex % 2 === 0;
    const progress      = phaseProgress;

    const icx = W / 2, icy = H / 2;
    const sR  = 11;

    const sunColor   = '#FFB300';
    const moonColor  = '#1a3060';
    const frontColor = isDay ? sunColor : moonColor;
    const backColor  = isDay ? moonColor : sunColor;

    // 裁切到球體範圍
    mctx.save();
    mctx.beginPath();
    mctx.arc(icx, icy, sR, 0, Math.PI * 2);
    mctx.clip();

    // 後半球
    mctx.fillStyle = backColor;
    mctx.beginPath();
    mctx.arc(icx, icy, sR, 0, Math.PI * 2);
    mctx.fill();

    // 前半球（橢圓邊界）
    const ex    = Math.cos(progress * Math.PI) * sR;
    const absEx = Math.abs(ex);
    mctx.fillStyle = frontColor;
    mctx.beginPath();
    mctx.arc(icx, icy, sR, -Math.PI / 2, Math.PI / 2, true);
    if (absEx > 0.5) {
        if (ex >= 0) {
            mctx.ellipse(icx, icy, absEx, sR, 0, Math.PI / 2, -Math.PI / 2, true);
        } else {
            mctx.ellipse(icx, icy, absEx, sR, 0, Math.PI / 2, -Math.PI / 2, false);
        }
    } else {
        mctx.lineTo(icx, icy - sR);
    }
    mctx.fill();

    mctx.restore();
}

// =============================================================
// 繪製系統
// =============================================================

function showAlphaAnnouncement(name) {
    const el = document.createElement('div');
    el.style.cssText = [
        'position:absolute', 'top:0', 'left:0', 'width:100%', 'height:100%',
        'display:flex', 'align-items:center', 'justify-content:center',
        'pointer-events:none', 'z-index:9999', 'opacity:1', 'transition:opacity 0.5s'
    ].join(';');
    el.innerHTML =
        '<div style="font-size:48px;font-weight:bold;color:#FFD700;' +
        'text-shadow:0 0 20px #FF8800,2px 2px 4px #000;text-align:center;">' +
        '⚠️ Alpha ' + (name || '') +
        '<br><span style="font-size:32px">誕生了！</span></div>';
    document.getElementById('ui-overlay').appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; }, 2500);
    setTimeout(() => el.remove(), 3000);
}

function drawTopBarUI() {
    const now = Date.now();
    const p   = gameState.player;
    const target = gameState.topBarTarget;
    if (!target) return;

    // 目標死亡或超出2000px → 啟動淡出計時
    const tgtDead = target.hp <= 0;
    const tgtFar  = wrappedDistance(p.x, p.y, target.x, target.y) > 2000;
    if (tgtDead || tgtFar) {
        if (!gameState.topBarFadeTimer) gameState.topBarFadeTimer = now;
    } else {
        gameState.topBarFadeTimer = 0;
    }

    // 計算透明度（0.5秒淡出）
    let alpha = 1;
    if (gameState.topBarFadeTimer) {
        const elapsed = now - gameState.topBarFadeTimer;
        if (elapsed >= 500) {
            gameState.topBarTarget    = null;
            gameState.topBarFadeTimer = 0;
            return;
        }
        alpha = 1 - elapsed / 500;
    }

    // 決定顯示名稱與血條顏色
    let displayName = target.name || '目標';
    let barColor    = '#AA22CC'; // 預設：精英紫色
    if (target === gameState.boss) {
        displayName = target.name || 'Boss';
        barColor    = '#CC2200';
    } else if (target === gameState.eliteCreature) {
        displayName = '★★ 精英 ' + (target.name || '');
        barColor    = '#AA22CC';
    } else if (target.isAlpha) {
        displayName = (target.name || '') + '（Alpha）';
        barColor    = '#FFD700';
    } else if (target.isGiantized) {
        displayName = (target.name || '') + '（巨人化）';
        barColor    = '#FF8800';
    }

    // 繪製 UI（頂部中央，寬400，高50）
    const barW = 400, barH = 50;
    const x = (VIEW_W - barW) / 2, y = 10;

    ctx.save();
    ctx.globalAlpha = alpha;

    // 半透明背景框
    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    if (ctx.roundRect) {
        ctx.beginPath(); ctx.roundRect(x, y, barW, barH, 6); ctx.fill();
    } else {
        ctx.fillRect(x, y, barW, barH);
    }

    // 目標名稱
    ctx.fillStyle = target.isAlpha ? '#FFD700' : '#FFFFFF';
    ctx.font = 'bold 13px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(displayName, x + barW / 2, y + 5);

    // 血條底色
    const hpBarX = x + 10, hpBarY = y + 24, hpBarW = barW - 20, hpBarH = 10;
    ctx.fillStyle = '#333';
    ctx.fillRect(hpBarX, hpBarY, hpBarW, hpBarH);

    // 血條（彩色）
    const hpRatio = Math.max(0, Math.min(1, target.hp / (target.maxHp || 100)));
    ctx.fillStyle = barColor;
    ctx.fillRect(hpBarX, hpBarY, hpBarW * hpRatio, hpBarH);

    // HP 數值
    ctx.fillStyle = '#CCC';
    ctx.font = '11px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(
        Math.max(0, Math.ceil(target.hp)) + ' / ' + (target.maxHp || 100),
        x + barW / 2, y + 37
    );

    ctx.restore();
}

function drawGame() {
    // 1. 貼上地形預渲染底圖（離屏 Canvas），夜晚遮罩在 drawTerrain 內疊加
    drawTerrain();

    // 2. 繪製環境 (樹木)
    gameState.trees.forEach(tree => {
        const s = worldToScreen(tree.x, tree.y);
        if (s.x < -tree.radius - 50 || s.x > VIEW_W + tree.radius + 50 ||
            s.y < -tree.radius - 50 || s.y > VIEW_H + tree.radius + 50) return;
        ctx.fillStyle = tree.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, tree.radius, 0, Math.PI * 2);
        ctx.fill();
        // 開發者模式：顯示附近果子數 / 最大上限
        if (gameState.devMode) {
            const maxN = tree.isLarge ? 5 : 3;
            ctx.save();
            ctx.font = '9px Arial';
            ctx.fillStyle = '#FFD700';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(tree.fruitCount + '/' + maxN, s.x, s.y + tree.radius + 2);
            ctx.restore();
        }
    });

    // 3. 繪製果子
    gameState.fruits.forEach(fruit => {
        const s = worldToScreen(fruit.x, fruit.y);
        if (s.x < -50 || s.x > VIEW_W + 50 || s.y < -50 || s.y > VIEW_H + 50) return;
        ctx.fillStyle = fruit.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, fruit.radius, 0, Math.PI * 2);
        ctx.fill();
    });

    // 4. 繪製寶物
    drawTreasures();

    // 5. 繪製屍體（在生物之下）
    drawCorpses();
    drawCorpseEatingBars();

    // 5b. 繪製白骨
    drawBones();

    // 5. 繪製中立生物
    drawNeutralCreatures();

    // 6. 繪製敵意生物
    drawHostileCreatures();

    // 7. 繪製 Boss
    if (gameState.boss && gameState.boss.hp > 0) {
        const boss = gameState.boss;
        const bs = worldToScreen(boss.x, boss.y);
        if (bs.x >= -50 && bs.x <= VIEW_W + 50 && bs.y >= -50 && bs.y <= VIEW_H + 50) {
            const flicker = Math.sin(Date.now() * 0.006) * 0.4 + 0.7;
            ctx.save();
            ctx.shadowColor = boss.glowColor || '#8B4513';
            ctx.shadowBlur = 10 + flicker * 12;
            ctx.globalAlpha = 0.85 + flicker * 0.15;
            ctx.fillStyle = boss.state === 'chasing' ? (boss.colorChasing || '#2A0D00') : (boss.color || '#3B1E08');
            ctx.beginPath();
            ctx.arc(bs.x, bs.y, boss.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            ctx.save();
            ctx.shadowColor = '#000000'; ctx.shadowBlur = 4;
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(boss.name || boss.label || 'Boss', bs.x, bs.y - boss.radius - 32);
            ctx.restore();
            const bBarW = 50, bBarH = 6;
            const bBarX = bs.x - bBarW / 2;
            const bBarY = bs.y - boss.radius - 24;
            ctx.fillStyle = '#550000';
            ctx.fillRect(bBarX, bBarY, bBarW, bBarH);
            ctx.fillStyle = '#FF4400';
            ctx.fillRect(bBarX, bBarY, bBarW * (boss.hp / boss.maxHp), bBarH);
        }
    }

    // 7b. 繪製精英怪
    drawEliteCreature();

    // 8. 攻擊範圍視覺圓圈（0.2 秒淡出）
    const p = gameState.player;
    const ps = worldToScreen(p.x, p.y);
    if (p.attackVisual > 0 && Date.now() - p.attackVisual < 200) {
        const alpha = 1 - (Date.now() - p.attackVisual) / 200;
        ctx.strokeStyle = 'rgba(255,255,255,' + alpha.toFixed(2) + ')';
        ctx.fillStyle   = 'rgba(255,255,255,' + (alpha * 0.12).toFixed(2) + ')';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ps.x, ps.y, p.attackRange, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.lineWidth = 1;
    }

    // 9. 繪製玩家角色 (噪鵑)
    if (gameState.isNight) {
        ctx.fillStyle = 'rgba(0,255,136,0.9)';
        ctx.beginPath();
        ctx.arc(ps.x, ps.y, p.radius + 3, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(ps.x, ps.y, p.radius, 0, Math.PI * 2);
    ctx.fill();

    drawEliteArrow();
    drawBossArrow();

    // 9b. 大腦衝能條（玩家正下方）
    if (p.brainActive) {
        const barW = p.radius * 2;
        const barH = 4;
        const barX = ps.x - barW / 2;
        const barY = ps.y + p.radius + 8;
        const prog = Math.min(1, (Date.now() - p.brainTimer) / p.brainInterval);
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(barX, barY, barW, barH);
        ctx.fillStyle = '#4488FF';
        ctx.fillRect(barX, barY, barW * prog, barH);
    }

    // 9c. 大腦衝擊波視覺效果（向外擴散圓形波紋）
    const now_sw = Date.now();
    for (let i = gameState.brainShockwaves.length - 1; i >= 0; i--) {
        const sw = gameState.brainShockwaves[i];
        const elapsed = now_sw - sw.startTime;
        const duration = 600;
        if (elapsed >= duration) { gameState.brainShockwaves.splice(i, 1); continue; }
        const progress = elapsed / duration;
        const swS = worldToScreen(sw.x, sw.y);
        const swR = sw.range * progress;
        const alpha = (1 - progress) * 0.6;
        ctx.save();
        ctx.strokeStyle = 'rgba(68,136,255,' + alpha.toFixed(2) + ')';
        ctx.lineWidth = 3 * (1 - progress) + 1;
        ctx.beginPath();
        ctx.arc(swS.x, swS.y, swR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    // 9d. 靈敏知覺路徑
    const sharpSenseLv = (p.organs.find(o => o.id === 'sharpSense') || {}).level || 0;
    // Lv1+：紅線（果子最佳路徑）
    if (p.perceptionRange > 0 && gameState.fruits.length > 0) {
        const path = findBestPerceptionPath(p, gameState.fruits, p.perceptionRange);
        if (path) {
            const endS = worldToScreen(path.endpoint.x, path.endpoint.y);
            const clampedEnd = {
                x: Math.max(5, Math.min(VIEW_W - 5, endS.x)),
                y: Math.max(5, Math.min(VIEW_H - 5, endS.y))
            };
            ctx.save();
            ctx.globalAlpha = 0.55;
            ctx.strokeStyle = '#FF4444';
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 4]);
            ctx.beginPath();
            ctx.moveTo(ps.x, ps.y);
            ctx.lineTo(clampedEnd.x, clampedEnd.y);
            ctx.stroke();
            ctx.setLineDash([]);
            const blink = Math.sin(Date.now() * 0.002 * Math.PI * 2) > 0;
            if (blink) {
                ctx.fillStyle = '#FF4444';
                path.fruits.forEach(f => {
                    const fs = worldToScreen(f.x, f.y);
                    ctx.beginPath();
                    ctx.arc(fs.x, fs.y, 5, 0, Math.PI * 2);
                    ctx.fill();
                });
            }
            ctx.restore();
        }
    }
    // Lv2+：黃線（最近屍體）
    if (sharpSenseLv >= 2 && gameState.corpses && gameState.corpses.length > 0) {
        let nearestCorpse = null, nearestDist = Infinity;
        for (const c of gameState.corpses) {
            const d = wrappedDistance(p.x, p.y, c.x, c.y);
            if (d < nearestDist) { nearestDist = d; nearestCorpse = c; }
        }
        if (nearestCorpse) {
            const endS = worldToScreen(nearestCorpse.x, nearestCorpse.y);
            const clampedEnd = {
                x: Math.max(5, Math.min(VIEW_W - 5, endS.x)),
                y: Math.max(5, Math.min(VIEW_H - 5, endS.y))
            };
            ctx.save();
            ctx.globalAlpha = 0.5;
            ctx.strokeStyle = '#FFDD44';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(ps.x, ps.y);
            ctx.lineTo(clampedEnd.x, clampedEnd.y);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
        }
    }
    // Lv3+：白線（最近白骨）
    if (sharpSenseLv >= 3 && gameState.bones && gameState.bones.length > 0) {
        let nearestBone = null, nearestDist2 = Infinity;
        for (const b of gameState.bones) {
            const d = wrappedDistance(p.x, p.y, b.x, b.y);
            if (d < nearestDist2) { nearestDist2 = d; nearestBone = b; }
        }
        if (nearestBone) {
            const endS = worldToScreen(nearestBone.x, nearestBone.y);
            const clampedEnd = {
                x: Math.max(5, Math.min(VIEW_W - 5, endS.x)),
                y: Math.max(5, Math.min(VIEW_H - 5, endS.y))
            };
            ctx.save();
            ctx.globalAlpha = 0.5;
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(ps.x, ps.y);
            ctx.lineTo(clampedEnd.x, clampedEnd.y);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
        }
    }

    // 9. 繪製器官清單（左下角）
    drawOrganUI();

    // 版本資訊（左下角最底部，與器官框不重疊）
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('© ' + GAME_INFO.author, 6, VIEW_H - 20);
    ctx.fillText(GAME_INFO.version, 6, VIEW_H - 5);
    ctx.restore();

    // 10. 繪製升級提示文字（畫面中央偏上，2 秒淡出）
    const lvMsg = gameState.levelUpMessage;
    if (lvMsg.text && Date.now() - lvMsg.timer < 2000) {
        const lvAlpha = Math.max(0, 1 - (Date.now() - lvMsg.timer) / 2000);
        ctx.save();
        ctx.globalAlpha = lvAlpha;
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(lvMsg.text, VIEW_W / 2, VIEW_H / 2 - 60);
        ctx.restore();
    }

    // 11. 繪製日夜切換提示文字（畫面中央，2 秒淡出）
    const msg = gameState.dayNightMessage;
    if (msg.text && Date.now() - msg.timer < 2000) {
        const alpha = Math.max(0, 1 - (Date.now() - msg.timer) / 2000);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = 'white';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(msg.text, VIEW_W / 2, VIEW_H / 2);
        ctx.restore();
    }

    // 12. 電腦版自動攻擊指示器（畫面正中央，透明度 0.25）
    if (!gameState.isMobile && gameState.settings.autoAttack &&
        gameState.gameStarted && !gameState.gameOver && !gameState.victory) {
        ctx.save();
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = 'white';
        ctx.font = '100px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚔️ 自動', VIEW_W / 2, VIEW_H / 2);
        ctx.restore();
    }

    // 13. 繪製小地圖
    drawMinimap();

    // 14. 手機疊加層每幀刷新（支援攻擊回饋淡出動畫）
    if (gameState.isMobile) _renderMobileOverlay();

    // 15. 上方血條UI（精英/Boss/巨人化/Alpha）
    drawTopBarUI();
}

function _heartPath(ctx, x, y, size) {
    const w = size, h = size;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.5, y + h * 0.9);
    ctx.bezierCurveTo(x + w * 0.1, y + h * 0.6, x, y + h * 0.3, x + w * 0.25, y + h * 0.15);
    ctx.bezierCurveTo(x + w * 0.35, y, x + w * 0.5, y + h * 0.18, x + w * 0.5, y + h * 0.3);
    ctx.bezierCurveTo(x + w * 0.5, y + h * 0.18, x + w * 0.65, y, x + w * 0.75, y + h * 0.15);
    ctx.bezierCurveTo(x + w, y + h * 0.3, x + w * 0.9, y + h * 0.6, x + w * 0.5, y + h * 0.9);
    ctx.closePath();
}

function _drawHpHearts(canvas) {
    if (!canvas) return;
    const hp     = Math.round(gameState.stats.hpCurrent);
    const hpMax  = gameState.stats.hpMax;
    const total  = Math.ceil(hpMax / 20);
    const HEART  = 24, GAP = 4, COLS = 10, STEP = 28;
    const cols   = Math.min(total, COLS);
    const rows   = Math.ceil(total / COLS);
    canvas.width  = cols * STEP - GAP;
    canvas.height = rows * STEP - GAP;
    const hctx = canvas.getContext('2d');
    hctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < total; i++) {
        const col  = i % COLS;
        const row  = Math.floor(i / COLS);
        const hx   = col * STEP;
        const hy   = row * STEP;
        const fill = Math.max(0, Math.min(1, (hp - i * 20) / 20));
        _heartPath(hctx, hx, hy, HEART);
        hctx.fillStyle = 'rgba(0,0,0,0.5)';
        hctx.fill();
        if (fill > 0) {
            hctx.save();
            hctx.beginPath();
            hctx.rect(hx, hy, HEART * fill, HEART);
            hctx.clip();
            _heartPath(hctx, hx, hy, HEART);
            hctx.fillStyle = '#EE2222';
            hctx.fill();
            hctx.restore();
        }
    }
}

function _initTopLeftUI() {
    const tl = document.getElementById('top-left');
    if (!tl || tl.dataset.built) return;
    tl.dataset.built = '1';
    tl.innerHTML = '';

    const wrap = document.createElement('div');
    wrap.style.cssText = 'background:rgba(0,0,0,0.6);border-radius:6px;padding:6px 8px;display:inline-flex;flex-direction:column;';

    // 第一行：⚙️ + 🐦 + XP 區
    const row1 = document.createElement('div');
    row1.style.cssText = 'display:flex;align-items:center;gap:6px;margin-bottom:5px;';

    const settingsBtn = document.createElement('button');
    settingsBtn.textContent = '⚙️';
    settingsBtn.style.cssText = 'background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.3);color:white;border-radius:4px;font-size:16px;padding:2px 6px;cursor:pointer;pointer-events:all;line-height:1;flex-shrink:0;';
    settingsBtn.addEventListener('click', function() { showSettings(); });

    const icon = document.createElement('span');
    icon.textContent = '🐦';
    icon.style.cssText = 'font-size:28px;line-height:1;flex-shrink:0;';

    const xpWrap = document.createElement('div');
    xpWrap.style.cssText = 'flex:1;min-width:0;';

    const xpText = document.createElement('div');
    xpText.id = 'tl-xp-text';
    xpText.style.cssText = 'font-size:13px;color:white;text-shadow:1px 1px 2px #000;margin-bottom:2px;white-space:nowrap;';

    const xpBarOuter = document.createElement('div');
    xpBarOuter.style.cssText = 'width:100%;height:6px;background:#333;border-radius:3px;';
    const xpBarInner = document.createElement('div');
    xpBarInner.id = 'tl-xp-bar';
    xpBarInner.style.cssText = 'width:0%;height:100%;background:#00CC00;border-radius:3px;';
    xpBarOuter.appendChild(xpBarInner);

    xpWrap.appendChild(xpText);
    xpWrap.appendChild(xpBarOuter);
    row1.appendChild(settingsBtn);
    row1.appendChild(icon);
    row1.appendChild(xpWrap);

    // 第二行：心形血條
    const heartsCanvas = document.createElement('canvas');
    heartsCanvas.id = 'hp-hearts-canvas';
    heartsCanvas.style.display = 'block';

    wrap.appendChild(row1);
    wrap.appendChild(heartsCanvas);
    tl.appendChild(wrap);
}

function updateUI() {
    _initTopLeftUI();

    const p           = gameState.player;
    const lvThreshold = 100 + (p.level - 1) * 50;
    const barPct      = Math.min(1, p.levelXP / lvThreshold);

    const xpText = document.getElementById('tl-xp-text');
    if (xpText) xpText.textContent = 'Lv.' + p.level + '  XP: ' + p.levelXP + '/' + lvThreshold;

    const xpBar = document.getElementById('tl-xp-bar');
    if (xpBar) xpBar.style.width = Math.round(barPct * 100) + '%';

    _drawHpHearts(document.getElementById('hp-hearts-canvas'));

    const mmBiomeEl = document.getElementById('minimap-biome');
    const mmTimeEl  = document.getElementById('minimap-time');
    if (mmBiomeEl) {
        const biomeIcons = { forest: t('biomeForest'), ocean: t('biomeOcean'), desert: t('biomeDesert') };
        mmBiomeEl.innerText = biomeIcons[getBiome(gameState.player.x, gameState.player.y)] || '';
    }
    if (mmTimeEl) mmTimeEl.innerText = gameState.stats.timeStatus;
    const mmPlaytimeEl = document.getElementById('minimap-playtime');
    if (mmPlaytimeEl) {
        const rpt = (gameState.realPlayTime || 0) +
            (gameState._playTimerStart ? Date.now() - gameState._playTimerStart : 0);
        const rpm = String(Math.floor(rpt / 60000)).padStart(2, '0');
        const rps = String(Math.floor((rpt % 60000) / 1000)).padStart(2, '0');
        mmPlaytimeEl.innerText = '⏱ ' + rpm + ':' + rps;
    }

    if (gameState.devMode) {
        document.getElementById('dev-stat-fruits').textContent = t('devFruits') + '：' + gameState.fruits.length;
        document.getElementById('dev-stat-neutral').textContent = t('devNeutral') + '：' + gameState.neutralCreatures.filter(c => c.hp > 0).length + ' / 50';
        document.getElementById('dev-stat-hostile').textContent = t('devHostile') + '：' + gameState.hostileCreatures.filter(c => c.hp > 0).length + ' / 35';
    }
}

function drawTreasures() {
    for (const t of gameState.treasures) {
        const s = worldToScreen(t.x, t.y);
        if (s.x < -50 || s.x > VIEW_W + 50 || s.y < -50 || s.y > VIEW_H + 50) continue;
        ctx.fillStyle = 'gold';
        ctx.beginPath();
        ctx.arc(s.x, s.y, t.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#CC8800';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.lineWidth = 1;
    }
}

// =============================================================
// 音效與設定系統
// =============================================================

function loadSettings() {
    try {
        const saved = localStorage.getItem('gameSettings');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.volume) Object.assign(gameState.settings.volume, parsed.volume);
            if (parsed.keys)   Object.assign(gameState.settings.keys,   parsed.keys);
            if (parsed.language && LANG[parsed.language]) {
                gameState.settings.language = parsed.language;
                gameState.language = parsed.language;
            }
            if (parsed.deviceMode !== undefined) {
                gameState.settings.deviceMode = parsed.deviceMode;
            }
            if (parsed.autoAttack !== undefined) {
                gameState.settings.autoAttack = parsed.autoAttack;
            }
        }
    } catch(e) {}
    applyLanguage(gameState.language);
    applyDeviceMode();
}

// 切換語言：寫入 settings、重新套用 LANG 資料表、即時刷新開啟中的介面
function switchLanguage(lang) {
    if (!LANG[lang]) return;
    if (gameState.language === lang) return;
    gameState.language = lang;
    gameState.settings.language = lang;
    applyLanguage(lang);
    saveSettings();

    const settingsOpen = !!document.getElementById('settings-overlay');
    const homeOpen     = !!document.getElementById('start-screen');
    const guideOpen    = !!document.getElementById('guide-overlay');
    const treeOpen     = !!document.getElementById('skill-tree-overlay');
    const guidePage    = guideOpen ? parseInt(document.getElementById('guide-overlay').dataset.page || '0', 10) : 0;
    const treeCause    = treeOpen ? document.getElementById('skill-tree-overlay').dataset.cause || null : null;
    const treeFromHome = !!_skillTreeFromHome;

    // 先把所有 overlay 拆掉，順序按 z 由下到上
    if (homeOpen)     { const e = document.getElementById('start-screen');       if (e) e.remove(); }
    if (treeOpen)     { const e = document.getElementById('skill-tree-overlay'); if (e) e.remove(); gameState.skillTreeOpen = false; }
    if (guideOpen)    { hideGuide(); }
    if (settingsOpen) { hideSettings(); }

    // 再依底→頂重建
    if (homeOpen)     showStartScreen();
    if (treeOpen)     buildSkillTreeOverlay(treeCause, treeFromHome);
    if (guideOpen)    showGuide(guidePage);
    if (settingsOpen) showSettings(homeOpen);
}

function saveSettings() {
    localStorage.setItem('gameSettings', JSON.stringify(gameState.settings));
}

function _keyDisplay(k) {
    if (k === ' ') return 'Space';
    if (k === 'mouseleft') return t('mouseLeft');
    return k.length === 1 ? k.toUpperCase() : k.charAt(0).toUpperCase() + k.slice(1);
}

function _buildSettingsSection(title) {
    const sec = document.createElement('div');
    sec.style.cssText = 'border:1px solid #333;border-radius:6px;padding:12px 16px;margin-bottom:14px;';
    const h = document.createElement('div');
    h.style.cssText = 'font-size:14px;font-weight:bold;color:#FFD700;margin-bottom:10px;';
    h.textContent = title;
    sec.appendChild(h);
    return sec;
}

function showSettings(fromHome) {
    applyDeviceMode();
    if (document.getElementById('settings-overlay')) return;
    gameState.settingsOpen = true;

    const overlay = document.createElement('div');
    overlay.id = 'settings-overlay';
    const sZIdx = fromHome ? 210 : 150;
    overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.78);display:flex;align-items:center;justify-content:center;z-index:' + sZIdx + ';pointer-events:all;';

    const panel = document.createElement('div');
    panel.style.cssText = 'background:#1c1c1c;border:1px solid #444;border-radius:10px;padding:24px 28px;width:90%;max-width:500px;max-height:85vh;overflow-y:auto;color:white;font-family:Arial,sans-serif;box-sizing:border-box;';

    const titleEl = document.createElement('div');
    titleEl.style.cssText = 'font-size:22px;font-weight:bold;text-align:center;margin-bottom:18px;';
    titleEl.textContent = t('settingsTitle');
    panel.appendChild(titleEl);

    // ─── 語言設定 ───
    const langSec = _buildSettingsSection(t('sectionLanguage'));
    const langRow = document.createElement('div');
    langRow.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;';
    LANG_LIST.forEach(({ code, label }) => {
        const btn = document.createElement('button');
        const isCur = (gameState.language === code);
        btn.style.cssText = 'flex:1;min-width:120px;padding:8px 12px;cursor:pointer;border-radius:4px;font-size:14px;' +
            (isCur
                ? 'background:#2a5a2a;color:#FFD700;border:1px solid #FFD700;font-weight:bold;'
                : 'background:#2a2a2a;color:white;border:1px solid #555;');
        btn.textContent = label;
        btn.onclick = () => { if (!isCur) switchLanguage(code); };
        langRow.appendChild(btn);
    });
    langSec.appendChild(langRow);
    panel.appendChild(langSec);

    // ─── 音量設定 ───
    const volSec = _buildSettingsSection(t('sectionVolume'));
    [{ label: t('volMaster'), vk: 'master', ok: 'masterOn' },
     { label: t('volMusic'),  vk: 'music',  ok: 'musicOn'  },
     { label: t('volSfx'),    vk: 'sfx',    ok: 'sfxOn'    }].forEach(({ label, vk, ok }) => {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:10px;';
        const tog = document.createElement('button');
        tog.style.cssText = 'width:42px;height:22px;border-radius:11px;cursor:pointer;font-size:11px;border:none;flex-shrink:0;';
        const refreshTog = () => {
            const on = gameState.settings.volume[ok];
            tog.textContent = on ? t('on') : t('off');
            tog.style.background = on ? '#2a8a2a' : '#555';
        };
        refreshTog();
        tog.onclick = () => { gameState.settings.volume[ok] = !gameState.settings.volume[ok]; refreshTog(); AudioManager.refreshMusicVolume(); saveSettings(); };
        row.appendChild(tog);
        const lbl = document.createElement('div');
        lbl.style.cssText = 'min-width:68px;font-size:13px;'; lbl.textContent = label;
        row.appendChild(lbl);
        const slider = document.createElement('input');
        slider.type = 'range'; slider.min = 0; slider.max = 100; slider.step = 10;
        slider.value = gameState.settings.volume[vk];
        slider.style.cssText = 'flex:1;cursor:pointer;';
        const valLbl = document.createElement('div');
        valLbl.style.cssText = 'min-width:36px;text-align:right;font-size:13px;';
        valLbl.textContent = slider.value + '%';
        slider.oninput = () => { gameState.settings.volume[vk] = parseInt(slider.value); valLbl.textContent = slider.value + '%'; AudioManager.refreshMusicVolume(); saveSettings(); };
        row.appendChild(slider); row.appendChild(valLbl);
        volSec.appendChild(row);
    });
    panel.appendChild(volSec);

    // ─── 按鍵設定 ───
    const keySec = _buildSettingsSection(t('sectionKeys'));
    const keyDefs = [
        { label: t('keyUp'),     sk: 'up',     fallback: '↑ ArrowUp'    },
        { label: t('keyDown'),   sk: 'down',   fallback: '↓ ArrowDown'  },
        { label: t('keyLeft'),   sk: 'left',   fallback: '← ArrowLeft'  },
        { label: t('keyRight'),  sk: 'right',  fallback: '→ ArrowRight' },
        { label: t('keyAttack'), sk: 'attack', fallback: t('mouseLeft') }
    ];
    const rebindBtns = {};

    const _cancelRebind = () => {
        if (_rebindBlink)   { clearInterval(_rebindBlink);  _rebindBlink   = null; }
        if (_rebindTimeout) { clearTimeout(_rebindTimeout); _rebindTimeout = null; }
        const tgt = gameState._rebindTarget;
        if (tgt && rebindBtns[tgt]) {
            const def = keyDefs.find(x => x.sk === tgt);
            rebindBtns[tgt].textContent = _keyDisplay(gameState.settings.keys[tgt]) + '  /  ' + (def ? def.fallback : '');
            rebindBtns[tgt].style.cssText = rebindBtns[tgt]._baseStyle;
        }
        gameState._rebindTarget = null;
    };

    const _finishRebind = (sk, newKey) => {
        if (_rebindBlink)   { clearInterval(_rebindBlink);  _rebindBlink   = null; }
        if (_rebindTimeout) { clearTimeout(_rebindTimeout); _rebindTimeout = null; }
        gameState.settings.keys[sk] = newKey;
        gameState._rebindTarget = null;
        if (rebindBtns[sk]) {
            const def = keyDefs.find(x => x.sk === sk);
            rebindBtns[sk].textContent = _keyDisplay(newKey) + '  /  ' + (def ? def.fallback : '');
            rebindBtns[sk].style.cssText = rebindBtns[sk]._baseStyle;
        }
        AudioManager.play('eatFruit');
        saveSettings();
    };

    const _startRebind = (sk) => {
        if (gameState._rebindTarget) _cancelRebind();
        gameState._rebindTarget = sk;
        const btn = rebindBtns[sk];
        if (!btn) return;
        btn.textContent = t('pressNewKey');
        btn.style.cssText = btn._baseStyle + 'border-color:#FFD700;color:#FFD700;';
        let blinkOn = true;
        _rebindBlink = setInterval(() => {
            if (!gameState._rebindTarget) { clearInterval(_rebindBlink); _rebindBlink = null; return; }
            blinkOn = !blinkOn;
            try { btn.style.color = blinkOn ? '#FFD700' : '#888'; } catch(e) {}
        }, 350);
        _rebindTimeout = setTimeout(() => {
            if (gameState._rebindTarget === sk) _cancelRebind();
            _rebindTimeout = null;
        }, 5000);
    };

    // Keydown handler（capture 優先，攔截所有按鍵）
    _settingsKeyHandler = (e) => {
        if (!gameState._rebindTarget) return;
        e.preventDefault(); e.stopPropagation();
        if (e.key === 'Escape') { _cancelRebind(); return; }
        _finishRebind(gameState._rebindTarget, e.key.toLowerCase());
    };
    document.addEventListener('keydown', _settingsKeyHandler, true);

    // Mousedown handler（capture，任意左鍵點擊可綁定滑鼠左鍵）
    _settingsMouseHandler = (e) => {
        if (!gameState._rebindTarget) return;
        if (e.button !== 0) return;
        if (rebindBtns[gameState._rebindTarget] && e.target === rebindBtns[gameState._rebindTarget]) return;
        e.stopPropagation();
        _finishRebind(gameState._rebindTarget, 'mouseleft');
    };
    document.addEventListener('mousedown', _settingsMouseHandler, true);

    keyDefs.forEach(({ label, sk, fallback }) => {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:8px;';
        const lbl = document.createElement('div');
        lbl.style.cssText = 'min-width:68px;font-size:13px;'; lbl.textContent = label;
        row.appendChild(lbl);
        const btn = document.createElement('button');
        btn._baseStyle = 'flex:1;padding:6px 10px;cursor:pointer;background:#2a2a2a;color:white;border:1px solid #666;border-radius:4px;font-size:13px;text-align:left;';
        btn.style.cssText = btn._baseStyle;
        btn.textContent = _keyDisplay(gameState.settings.keys[sk]) + '  /  ' + fallback;
        btn.onclick = (e) => {
            e.stopPropagation();
            if (gameState._rebindTarget === sk) { _cancelRebind(); return; }
            _startRebind(sk);
        };
        rebindBtns[sk] = btn;
        row.appendChild(btn);
        keySec.appendChild(row);
    });
    keySec.style.cssText = keySec.style.cssText + 'width:65%;box-sizing:border-box;margin-bottom:0;flex-shrink:0;';

    // ─── 輔助功能 ───
    const accSec = _buildSettingsSection(t('sectionAccessibility'));
    accSec.style.cssText = accSec.style.cssText + 'flex:1;box-sizing:border-box;margin-bottom:0;';

    const aaRow = document.createElement('div');
    aaRow.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:10px;';
    const aaTog = document.createElement('button');
    aaTog.style.cssText = 'width:42px;height:22px;border-radius:11px;cursor:pointer;font-size:11px;border:none;flex-shrink:0;';
    const refreshAaTog = () => {
        const on = gameState.settings.autoAttack;
        aaTog.textContent = on ? t('on') : t('off');
        aaTog.style.background = on ? '#2a8a2a' : '#555';
    };
    refreshAaTog();
    aaTog.onclick = () => { gameState.settings.autoAttack = !gameState.settings.autoAttack; refreshAaTog(); saveSettings(); };
    const aaLbl = document.createElement('div');
    aaLbl.style.cssText = 'font-size:13px;';
    aaLbl.textContent = t('autoAttack');
    aaRow.appendChild(aaTog);
    aaRow.appendChild(aaLbl);
    accSec.appendChild(aaRow);
    if (!gameState.isMobile) {
        const aaHint = document.createElement('div');
        aaHint.style.cssText = 'font-size:11px;color:#888;margin-top:2px;';
        aaHint.textContent = t('autoAttackHint');
        accSec.appendChild(aaHint);
    }

    const keyAccWrapper = document.createElement('div');
    keyAccWrapper.style.cssText = 'display:flex;flex-direction:row;gap:8px;margin-bottom:14px;';
    keyAccWrapper.appendChild(keySec);
    keyAccWrapper.appendChild(accSec);
    panel.appendChild(keyAccWrapper);

    // ─── 裝置模式 ───
    const deviceSec = _buildSettingsSection(t('sectionDevice'));
    const deviceRow = document.createElement('div');
    deviceRow.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;';
    const deviceModes = [
        { label: t('deviceAuto'),    value: null       },
        { label: t('deviceMobile'),  value: 'mobile'   },
        { label: t('deviceDesktop'), value: 'desktop'  }
    ];
    const deviceBtns = [];
    const _deviceBtnStyle = (sel) => 'flex:1;min-width:90px;padding:8px 10px;cursor:pointer;border-radius:4px;font-size:13px;' +
        (sel ? 'background:#2a5a2a;color:#FFD700;border:1px solid #FFD700;font-weight:bold;' : 'background:#2a2a2a;color:white;border:1px solid #555;');
    deviceModes.forEach(({ label, value }) => {
        const btn = document.createElement('button');
        btn.style.cssText = _deviceBtnStyle(gameState.settings.deviceMode === value);
        btn.textContent = label;
        btn.onclick = () => {
            gameState.settings.deviceMode = value;
            applyDeviceMode();
            saveSettings();
            deviceBtns.forEach((b, i) => { b.style.cssText = _deviceBtnStyle(deviceModes[i].value === value); });
        };
        deviceBtns.push(btn);
        deviceRow.appendChild(btn);
    });
    deviceSec.appendChild(deviceRow);
    panel.appendChild(deviceSec);

    // ─── 其他設定 ───
    const otherSec = _buildSettingsSection(t('sectionOther'));
    const restartBtn = document.createElement('button');
    restartBtn.style.cssText = 'width:100%;padding:8px;cursor:pointer;border:1px solid #884444;background:rgba(136,0,0,0.3);color:white;border-radius:4px;font-size:13px;margin-bottom:8px;';
    restartBtn.textContent = t('restartGame');
    restartBtn.onclick = () => {
        if (!confirm(t('confirmRestart'))) return;
        saveLastRunOrgans();
        localStorage.setItem('skillPoints', String(gameState.skillPoints));
        window.location.reload();
    };
    otherSec.appendChild(restartBtn);
    const resetBtn = document.createElement('button');
    resetBtn.style.cssText = 'width:100%;padding:8px;cursor:pointer;border:1px solid #555;background:rgba(80,80,80,0.3);color:white;border-radius:4px;font-size:13px;';
    resetBtn.textContent = t('resetDefault');
    resetBtn.onclick = () => {
        if (!confirm(t('confirmResetSettings'))) return;
        const keepLang = gameState.settings.language;
        gameState.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
        gameState.settings.language = keepLang;
        saveSettings(); AudioManager.refreshMusicVolume();
        applyDeviceMode();
        hideSettings(); showSettings();
    };
    otherSec.appendChild(resetBtn);
    panel.appendChild(otherSec);

    // ─── 底部按鈕 ───
    const saveBtn = document.createElement('button');
    saveBtn.style.cssText = 'width:100%;margin-top:14px;padding:10px;cursor:pointer;border:1px solid #4a8a4a;background:#2a5a2a;color:white;border-radius:4px;font-size:15px;';
    saveBtn.textContent = fromHome ? t('close') : t('saveAndBack');
    saveBtn.onclick = () => { saveSettings(); hideSettings(); };
    panel.appendChild(saveBtn);

    overlay.appendChild(panel);
    document.getElementById('game-container').appendChild(overlay);
}

function hideSettings() {
    if (_settingsKeyHandler)   { document.removeEventListener('keydown',   _settingsKeyHandler,   true); _settingsKeyHandler   = null; }
    if (_settingsMouseHandler) { document.removeEventListener('mousedown', _settingsMouseHandler, true); _settingsMouseHandler = null; }
    if (_rebindBlink)   { clearInterval(_rebindBlink);  _rebindBlink   = null; }
    if (_rebindTimeout) { clearTimeout(_rebindTimeout); _rebindTimeout = null; }
    gameState._rebindTarget = null;
    const overlay = document.getElementById('settings-overlay');
    if (overlay) overlay.remove();
    gameState.settingsOpen = false;
    gameState.lastTimeTick = Date.now();
}

// =============================================================
// 計時器
// =============================================================

function updateTimer() {
    const now = Date.now();
    if (gameState.lastTimeTick === 0) { gameState.lastTimeTick = now; return; }
    const elapsed = (now - gameState.lastTimeTick) / 1000;
    gameState.lastTimeTick = now;
    gameState.timeRemaining = Math.max(0, gameState.timeRemaining - elapsed);
    const total = Math.ceil(gameState.timeRemaining);
    const m = Math.floor(total / 60).toString().padStart(2, '0');
    const s = (total % 60).toString().padStart(2, '0');
    gameState.stats.timeStatus = m + ':' + s;
    if (gameState.timeRemaining <= 80 && !gameState.bossSpawned && !gameState.bossBellPlayed) {
        gameState.bossBellPlayed = true;
        AudioManager.play('bossBell');
    }
    if (gameState.timeRemaining <= 0) showSkillTree('timeout');
}

// =============================================================
// 開發者模式 (Developer Mode)
// =============================================================

function toggleDevMode() {
    gameState.devMode = !gameState.devMode;
    if (gameState.devMode) gameState.devModeUsed = true;
    document.getElementById('dev-panel').style.display    = gameState.devMode ? 'block' : 'none';
    document.getElementById('dev-indicator').style.display = gameState.devMode ? 'block' : 'none';
}

function devAddXP() {
    addXP(50);
}

function devAddHP() {
    gameState.stats.hpCurrent = Math.min(gameState.stats.hpMax, gameState.stats.hpCurrent + 20);
}

function devFullHP() {
    gameState.stats.hpCurrent = gameState.stats.hpMax;
}

function devSpawnFruits() {
    for (let i = 0; i < 5; i++) spawnFruit();
}

function devKillHostiles() {
    const now = Date.now();
    for (const c of gameState.hostileCreatures) {
        if (c.hp > 0) {
            c.hp = 0;
            gameState.corpses.push({ x: c.x, y: c.y, radius: c.radius, spawnTime: now });
        }
    }
}

function devSpawnNeutral() {
    const p = gameState.player;
    const angle = Math.random() * Math.PI * 2;
    const dist = 60 + Math.random() * 40;
    const bonus = gameState.creatureStrengthMultiplier;
    gameState.neutralCreatures.push({
        x: Math.max(14, Math.min(MAP_WIDTH  - 14, p.x + Math.cos(angle) * dist)),
        y: Math.max(14, Math.min(MAP_HEIGHT - 14, p.y + Math.sin(angle) * dist)),
        radius: 12, hp: 30 + bonus * 10, maxHp: 30 + bonus * 10,
        speed: 0.8 + bonus * 0.1, damage: 3 + bonus,
        diet: Math.random() < 0.5 ? 'herbivore' : 'omnivore',
        state: 'wandering', fleeRange: 100, fightBackRange: 40,
        canFight: Math.random() < 0.5, attackCooldown: 0,
        wanderTarget: null, lastWanderTime: Date.now()
    });
}

function devSpawnHostile() {
    const p = gameState.player;
    const angle = Math.random() * Math.PI * 2;
    const dist = 100 + Math.random() * 50;
    const bonus = gameState.creatureStrengthMultiplier;
    const roll = Math.random();
    const diet = roll < 0.8 ? 'carnivore' : (roll < 0.9 ? 'herbivore' : 'omnivore');
    gameState.hostileCreatures.push({
        x: Math.max(10, Math.min(MAP_WIDTH  - 10, p.x + Math.cos(angle) * dist)),
        y: Math.max(10, Math.min(MAP_HEIGHT - 10, p.y + Math.sin(angle) * dist)),
        radius: 10, hp: 50 + bonus * 10, maxHp: 50 + bonus * 10,
        speed: Math.min(2.5, 1.2 + bonus * 0.1), damage: Math.min(20, 5 + bonus),
        attackCooldown: 0, diet, state: 'patrolling',
        aggroRange: 150, attackRange: 20,
        wanderTarget: null, lastWanderTime: Date.now(),
        target: null, targetType: null
    });
}

function devFastForward() {
    gameState.timeRemaining = Math.max(0, gameState.timeRemaining - 300);
    gameState.lastTimeTick = Date.now();
}

function devRewind() {
    gameState.timeRemaining = Math.min(600, gameState.timeRemaining + 300);
    gameState.lastTimeTick = Date.now();
}

function devToggleDayNight() {
    // 將 timeRemaining 跳到下一個時段起點，讓 updateDayNightCycle 自動觸發切換
    const nextIdx = (getDayNightPhaseIndex() + 1) % 8;
    gameState.timeRemaining = Math.max(0, 600 - nextIdx * 75 - 1);
    gameState.lastTimeTick = Date.now();
}

// =============================================================
// 遊戲說明 (Guide)
// =============================================================

let _guideKeyHandler = null;

function showGuide(startPage) {
    applyDeviceMode();
    if (document.getElementById('guide-overlay')) return;
    const TOTAL = 4;
    let cur = Math.min(Math.max(0, startPage || 0), TOTAL - 1);

    const overlay = document.createElement('div');
    overlay.id = 'guide-overlay';
    overlay.dataset.page = String(cur);
    overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.82);display:flex;align-items:center;justify-content:center;z-index:215;pointer-events:all;color:white;font-family:Arial,sans-serif;';

    const panel = document.createElement('div');
    panel.style.cssText = 'background:#1c1c1c;border:1px solid #555;border-radius:10px;padding:22px 26px;width:92%;max-width:580px;max-height:88vh;overflow-y:auto;box-sizing:border-box;';

    const titleBar = document.createElement('div');
    titleBar.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;';
    const headerTitle = document.createElement('div');
    headerTitle.style.cssText = 'font-size:20px;font-weight:bold;color:#FFD700;';
    const pageLbl = document.createElement('div');
    pageLbl.style.cssText = 'font-size:13px;color:#999;';
    titleBar.appendChild(headerTitle);
    titleBar.appendChild(pageLbl);
    panel.appendChild(titleBar);

    const content = document.createElement('div');
    content.style.cssText = 'font-size:14px;line-height:1.8;background:rgba(255,255,255,0.04);border:1px solid #333;border-radius:6px;padding:16px 20px;margin-bottom:16px;';
    panel.appendChild(content);

    const navRow = document.createElement('div');
    navRow.style.cssText = 'display:flex;gap:10px;align-items:center;justify-content:space-between;';
    const prevBtn = document.createElement('button');
    prevBtn.style.cssText = 'padding:8px 14px;font-size:13px;background:#2a2a2a;color:white;border:1px solid #555;border-radius:4px;cursor:pointer;min-width:96px;';
    const closeBtn = document.createElement('button');
    closeBtn.style.cssText = 'padding:8px 20px;font-size:13px;background:#2a5a2a;color:white;border:1px solid #4a8a4a;border-radius:4px;cursor:pointer;';
    const nextBtn = document.createElement('button');
    nextBtn.style.cssText = prevBtn.style.cssText;
    navRow.appendChild(prevBtn);
    navRow.appendChild(closeBtn);
    navRow.appendChild(nextBtn);
    panel.appendChild(navRow);

    function _ln(text) {
        return '<div style="margin-bottom:6px;">' + _escH(text) + '</div>';
    }
    function _sec(text) {
        return '<div style="font-size:16px;font-weight:bold;color:#FFD700;margin-bottom:10px;">' + _escH(text) + '</div>';
    }
    function _dot(color, key, extraStyle) {
        const ds = 'width:12px;height:12px;border-radius:50%;background:' + color + ';flex-shrink:0;' + (extraStyle || '');
        return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:7px;">'
            + '<div style="' + ds + '"></div>'
            + '<span>' + _escH(t(key)) + '</span></div>';
    }

    function buildPage0() {
        if (_effectiveMobile()) {
            const left = '<div style="flex:1;padding-right:12px;border-right:1px solid #444;">'
                + _sec(t('guideBasicTitle'))
                + _ln(t('guideMobileMove2'))
                + _ln(t('guideMobileAttackZone'))
                + _ln(t('guideMobileSettings'))
                + _ln(t('guideFruit'))
                + _ln(t('guideGoal'))
                + _ln(t('guideAutoAttack'))
                + '</div>';
            // 手機示意圖：直向比例（高25% 寬50% 攻擊區）
            const _isZhTW = gameState.language === 'zh-TW';
            const lblMove = _isZhTW ? '移動區' : 'Move';
            const lblAtk  = _isZhTW ? '攻擊區' : 'Attack';
            const mobileDiagram =
                '<svg xmlns="http://www.w3.org/2000/svg" width="110" height="160" style="display:block;margin:0 auto 10px;">'
                // 手機外框
                + '<rect x="5" y="5" width="100" height="150" rx="10" ry="10" fill="#1a1a2e" stroke="#555" stroke-width="1.5"/>'
                // 移動區（全螢幕淡藍色）
                + '<rect x="8" y="8" width="94" height="144" rx="7" ry="7" fill="rgba(50,100,200,0.25)"/>'
                + '<text x="55" y="60" text-anchor="middle" font-size="9" fill="rgba(100,160,255,0.85)">' + _escH(lblMove) + '</text>'
                // 攻擊區（右下角：右50% × 下25%）
                + '<rect x="57" y="116" width="45" height="36" rx="4" ry="4" fill="rgba(200,60,60,0.45)" stroke="rgba(255,100,100,0.55)" stroke-width="1"/>'
                + '<text x="79" y="131" text-anchor="middle" font-size="11" fill="white">⚔️</text>'
                + '<text x="79" y="146" text-anchor="middle" font-size="7" fill="rgba(255,200,200,0.9)">' + _escH(lblAtk) + '</text>'
                + '</svg>';
            const right = '<div style="flex:1;padding-left:12px;overflow:hidden;">'
                + _sec(t('guideTouchTitle'))
                + mobileDiagram
                + '<div style="font-size:11px;color:#bbb;margin-top:4px;">' + _escH(t('guidePortraitDesc')) + '</div>'
                + '</div>';
            return '<div style="display:flex;gap:0;">' + left + right + '</div>';
        }
        return _sec(t('guideBasicTitle'))
            + _ln(t('guideMove'))
            + _ln(t('guideAttack'))
            + _ln(t('guideSettings'))
            + _ln(t('guideFruit'))
            + _ln(t('guideGoal'))
            + _ln(t('guideAutoAttack'));
    }

    function buildPage1() {
        return _sec(t('guideOrganTitle'))
            + _ln(t('guideOrgan1')) + _ln(t('guideOrgan2')) + _ln(t('guideOrgan3'))
            + _ln(t('guideOrgan4')) + _ln(t('guideOrgan5')) + _ln(t('guideOrgan6'))
            + _ln(t('guideOrgan7'));
    }

    function buildPage2() {
        return _sec(t('guideEvoTitle'))
            + _ln(t('guideEvo1')) + _ln(t('guideEvo2')) + _ln(t('guideEvo3'))
            + _ln(t('guideEvo4')) + _ln(t('guideEvo5'));
    }

    function buildPage3() {
        return _sec(t('guideMapTitle'))
            + _dot('#000000', 'guideMapPlayer', 'border:1px solid #888;animation:dotBlink 1.5s ease-in-out infinite;')
            + _dot('#FFA500', 'guideMapNeutral')
            + _dot('#FF0000', 'guideMapHostile')
            + _dot('#FFD700', 'guideMapEliteH', 'animation:dotBlink 1.5s ease-in-out infinite;')
            + _dot('#9B59B6', 'guideMapEliteC', 'animation:dotBlink 1.5s ease-in-out infinite;')
            + _dot('#8B4513', 'guideMapBossBear', 'color:#8B4513;animation:dotGlow 2s ease-in-out infinite;')
            + _dot('#1a3a5c', 'guideMapBossShark', 'color:#1a3a5c;animation:dotGlow 2s ease-in-out infinite;')
            + _dot('#8B6914', 'guideMapBossScorp', 'color:#8B6914;animation:dotGlow 2s ease-in-out infinite;')
            + _dot('#2d5a1b', 'guideMapTree')
            + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:7px;">'
            + '<div style="width:12px;height:12px;border-radius:2px;background:rgba(255,255,255,0.3);flex-shrink:0;"></div>'
            + '<span>' + _escH(t('guideMapFog')) + '</span></div>';
    }

    function render() {
        headerTitle.textContent = t('guideTitle');
        pageLbl.textContent = t('guidePage', {'0': cur + 1, '1': TOTAL});
        prevBtn.textContent = t('guidePrev');
        nextBtn.textContent = t('guideNext');
        closeBtn.textContent = t('guideClose');
        prevBtn.disabled = (cur === 0);
        nextBtn.disabled = (cur === TOTAL - 1);
        prevBtn.style.opacity = prevBtn.disabled ? '0.35' : '1';
        nextBtn.style.opacity = nextBtn.disabled ? '0.35' : '1';
        overlay.dataset.page = String(cur);
        if (cur === 0) content.innerHTML = buildPage0();
        else if (cur === 1) content.innerHTML = buildPage1();
        else if (cur === 2) content.innerHTML = buildPage2();
        else content.innerHTML = buildPage3();
    }

    prevBtn.onclick = () => { if (cur > 0) { cur--; render(); } };
    nextBtn.onclick = () => { if (cur < TOTAL - 1) { cur++; render(); } };
    closeBtn.onclick = hideGuide;

    _guideKeyHandler = function(e) {
        if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
        if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
            if (cur < TOTAL - 1) { cur++; render(); }
        } else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
            if (cur > 0) { cur--; render(); }
        }
    };
    document.addEventListener('keydown', _guideKeyHandler);

    overlay.appendChild(panel);
    document.getElementById('game-container').appendChild(overlay);
    render();
}

function hideGuide() {
    const el = document.getElementById('guide-overlay');
    if (el) el.remove();
    if (_guideKeyHandler) {
        document.removeEventListener('keydown', _guideKeyHandler);
        _guideKeyHandler = null;
    }
}

// =============================================================
// 圖鑑系統 (Compendium)
// =============================================================

let _compendiumPaused = false;

function getOrganDisplayName(id) {
    if (ORGANS[id]) return ORGANS[id].name;
    if (HIDDEN_ORGANS[id]) return HIDDEN_ORGANS[id].name;
    return id;
}

function showCompendium(startTab) {
    applyDeviceMode();
    if (document.getElementById('compendium-overlay')) return;

    // 遊戲中開啟時暫停
    if (gameState.gameStarted && !gameState.gameOver && !gameState.victory) {
        _compendiumPaused = true;
        gameState.organSelectionActive = true; // 借用暫停機制
    } else {
        _compendiumPaused = false;
    }

    const tabs = ['guide', 'organs', 'evo'];
    const tabNames = { guide: t('compendiumTabGuide'), organs: t('compendiumTabOrgans'), evo: t('compendiumTabEvo') };
    let curTab = tabs.includes(startTab) ? startTab : 'guide';
    let curPage = 0;

    const overlay = document.createElement('div');
    overlay.id = 'compendium-overlay';
    overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.88);display:flex;align-items:center;justify-content:center;z-index:215;pointer-events:all;color:white;font-family:Arial,sans-serif;';

    const panel = document.createElement('div');
    panel.style.cssText = 'background:#1c1c1c;border:1px solid #555;border-radius:10px;padding:18px 22px;width:92%;max-width:640px;max-height:90vh;display:flex;flex-direction:column;box-sizing:border-box;';

    // ── 標題列
    const titleBar = document.createElement('div');
    titleBar.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-shrink:0;';
    const headerTitle = document.createElement('div');
    headerTitle.style.cssText = 'font-size:20px;font-weight:bold;color:#FFD700;';
    headerTitle.textContent = t('compendiumTitle');
    titleBar.appendChild(headerTitle);
    panel.appendChild(titleBar);

    // ── 書本樣式內容區
    const content = document.createElement('div');
    content.style.cssText = 'font-size:13px;line-height:1.7;background:rgba(255,255,255,0.04);border:1px solid #333;border-radius:6px;padding:14px 16px;flex:1;overflow-y:auto;min-height:0;';
    panel.appendChild(content);

    // ── Tab 列
    const tabRow = document.createElement('div');
    tabRow.style.cssText = 'display:flex;gap:6px;margin-top:10px;flex-shrink:0;';
    const tabBtns = {};
    tabs.forEach(tab => {
        const btn = document.createElement('button');
        btn.style.cssText = 'flex:1;padding:7px 4px;font-size:12px;border-radius:4px 4px 0 0;cursor:pointer;border:1px solid #555;';
        btn.textContent = tabNames[tab];
        btn.onclick = () => { curTab = tab; curPage = 0; render(); };
        tabBtns[tab] = btn;
        tabRow.appendChild(btn);
    });
    panel.appendChild(tabRow);

    // ── 底部列：分頁 + 關閉
    const navRow = document.createElement('div');
    navRow.style.cssText = 'display:flex;gap:8px;align-items:center;justify-content:space-between;margin-top:8px;flex-shrink:0;';
    const prevBtn = document.createElement('button');
    prevBtn.style.cssText = 'padding:7px 12px;font-size:12px;background:#2a2a2a;color:white;border:1px solid #555;border-radius:4px;cursor:pointer;min-width:80px;';
    prevBtn.textContent = t('guidePrev');
    const pageLbl = document.createElement('div');
    pageLbl.style.cssText = 'font-size:12px;color:#aaa;';
    const nextBtn = document.createElement('button');
    nextBtn.style.cssText = prevBtn.style.cssText;
    nextBtn.textContent = t('guideNext');
    const closeBtn = document.createElement('button');
    closeBtn.style.cssText = 'padding:7px 16px;font-size:12px;background:#2a5a2a;color:white;border:1px solid #4a8a4a;border-radius:4px;cursor:pointer;';
    closeBtn.textContent = t('close');
    navRow.appendChild(prevBtn);
    navRow.appendChild(pageLbl);
    navRow.appendChild(nextBtn);
    navRow.appendChild(closeBtn);
    panel.appendChild(navRow);

    function _esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
    function _h2(t) { return '<div style="font-size:15px;font-weight:bold;color:#FFD700;margin:10px 0 6px;">' + _esc(t) + '</div>'; }
    function _p(t)  { return '<div style="margin-bottom:5px;">' + _esc(t) + '</div>'; }

    function getPages() {
        if (curTab === 'guide') {
            return buildGuidePages();
        } else if (curTab === 'organs') {
            return buildOrganPages();
        } else {
            return buildEvoPages();
        }
    }

    function buildGuidePages() {
        const pages = [];
        // 操作說明（原 showGuide 的四頁內容精簡為文字版）
        pages.push(
            _h2(t('guideBasicTitle')) +
            _p(t('guideMove')) + _p(t('guideAttack')) + _p(t('guideSettings')) +
            _p(t('guideFruit')) + _p(t('guideGoal')) + _p(t('guideAutoAttack'))
        );
        pages.push(
            _h2(t('guideOrganTitle')) +
            _p(t('guideOrgan1')) + _p(t('guideOrgan2')) + _p(t('guideOrgan3')) +
            _p(t('guideOrgan4')) + _p(t('guideOrgan5')) + _p(t('guideOrgan6')) + _p(t('guideOrgan7'))
        );
        pages.push(
            _h2(t('guideEvoTitle')) +
            _p(t('guideEvo1')) + _p(t('guideEvo2')) + _p(t('guideEvo3')) +
            _p(t('guideEvo4')) + _p(t('guideEvo5'))
        );
        return pages;
    }

    function buildOrganPages() {
        const pages = [];
        const typeColor = { attack: '#FF9999', defense: '#88CCFF', spirit: '#CC99FF', special: '#AAAAFF' };
        // 普通器官每頁3個
        const allOrgans = Object.values(ORGANS).filter(o => !o.noSelection);
        for (let i = 0; i < allOrgans.length; i += 3) {
            const chunk = allOrgans.slice(i, i + 3);
            let html = '';
            chunk.forEach(org => {
                const c = typeColor[org.type] || '#FFD700';
                html += '<div style="margin-bottom:12px;border-left:3px solid ' + c + ';padding-left:8px;">';
                html += '<div style="font-weight:bold;color:' + c + ';font-size:14px;">' + _esc(org.name) + '</div>';
                org.levels.forEach((lv, idx) => {
                    html += '<div style="color:#ccc;font-size:11px;margin-top:2px;"><span style="color:#aaa;">Lv' + (idx+1) + ':</span> ' + _esc(lv.desc) + '</div>';
                });
                html += '</div>';
            });
            // 特殊器官：毒囊
            if (i === 0) {
                const sac = ORGANS.poisonSac;
                const sacLang = (LANG[gameState.language] || LANG['zh-TW']).organs.poisonSac;
                html += '<div style="margin-bottom:12px;border-left:3px solid #AAAAFF;padding-left:8px;">';
                html += '<div style="font-weight:bold;color:#AAAAFF;font-size:14px;">☠ ' + _esc(sac.name) + ' <span style="font-size:10px;color:#888;">（雜食性Lv1獲得，自動升級）</span></div>';
                html += '<div style="color:#aaa;font-size:11px;margin-top:3px;">' + t('compendiumSacHint') + '</div>';
                html += '<div style="margin-top:5px;">';
                sac.levels.forEach((lv, idx) => {
                    const desc = sacLang ? sacLang.levels[idx] : lv.desc;
                    const threshold = sac.thresholds[idx];
                    html += '<div style="font-size:11px;color:#ccc;line-height:1.6;">'
                        + '<span style="color:#AAAAFF;margin-right:4px;">Lv' + (idx + 1) + '</span>'
                        + '<span style="color:#777;margin-right:6px;">[白骨素≥' + threshold + ']</span>'
                        + _esc(desc || lv.desc)
                        + '</div>';
                });
                html += '</div>';
                html += '</div>';
            }
            pages.push(html);
        }
        // 隱藏器官頁
        let hiddenHtml = _h2(t('compendiumHiddenOrgans'));
        Object.values(HIDDEN_ORGANS).forEach(h => {
            hiddenHtml += '<div style="margin-bottom:10px;border-left:3px solid #FFD700;padding-left:8px;">';
            hiddenHtml += '<div style="font-weight:bold;color:#FFD700;">✨ ' + _esc(h.name) + '</div>';
            hiddenHtml += '<div style="color:#ccc;font-size:11px;margin-top:2px;">' + _esc(h.desc) + '</div>';
            hiddenHtml += '</div>';
        });
        // 組合效果頁
        hiddenHtml += _h2(t('compendiumCombos'));
        COMBOS.forEach(combo => {
            hiddenHtml += '<div style="margin-bottom:8px;">';
            hiddenHtml += '<div style="color:#FFD700;font-size:12px;">' + _esc(combo.ids.map(id => getOrganDisplayName(id)).join(' + ')) + '</div>';
            hiddenHtml += '<div style="color:#ccc;font-size:11px;">' + _esc(combo.desc) + '</div>';
            hiddenHtml += '</div>';
        });
        pages.push(hiddenHtml);
        return pages;
    }

    function buildEvoPages() {
        const pages = [];
        Object.values(EVOLUTION_PATHS).forEach(path => {
            let html = _h2(path.icon + ' ' + path.name + '  (最高Lv' + path.maxLevel + ')');
            path.levels.forEach((lv, i) => {
                html += '<div style="margin-bottom:6px;"><span style="color:#FFD700;">Lv' + (i+1) + ':</span> <span style="color:#ccc;font-size:12px;">' + _esc(lv.desc) + '</span></div>';
            });
            pages.push(html);
        });
        return pages;
    }

    function render() {
        // 更新 Tab 按鈕樣式
        tabs.forEach(tab => {
            tabBtns[tab].style.background = tab === curTab ? '#2a5a2a' : 'rgba(40,40,40,0.8)';
            tabBtns[tab].style.borderColor = tab === curTab ? '#4a8a4a' : '#555';
            tabBtns[tab].style.color = 'white';
        });
        const pages = getPages();
        const total = pages.length;
        curPage = Math.max(0, Math.min(curPage, total - 1));
        content.innerHTML = pages[curPage] || '';
        content.scrollTop = 0;
        pageLbl.textContent = t('guidePage', {'0': curPage + 1, '1': total});
        prevBtn.disabled = curPage === 0;
        nextBtn.disabled = curPage >= total - 1;
        prevBtn.style.opacity = prevBtn.disabled ? '0.35' : '1';
        nextBtn.style.opacity = nextBtn.disabled ? '0.35' : '1';
    }

    function closeCompendium() {
        overlay.remove();
        if (_compendiumPaused) {
            gameState.organSelectionActive = false;
            gameState.lastTimeTick = Date.now();
            _compendiumPaused = false;
        }
        if (_compKeyHandler) {
            document.removeEventListener('keydown', _compKeyHandler);
            _compKeyHandler = null;
        }
    }

    prevBtn.onclick = () => { if (curPage > 0) { curPage--; render(); } };
    nextBtn.onclick = () => { const pages = getPages(); if (curPage < pages.length - 1) { curPage++; render(); } };
    closeBtn.onclick = closeCompendium;
    overlay.addEventListener('click', e => { if (e.target === overlay) closeCompendium(); });

    let _compKeyHandler = null;
    _compKeyHandler = function(e) {
        if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
        if (e.key === 'Escape') { closeCompendium(); return; }
        const pages = getPages();
        if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
            if (curPage < pages.length - 1) { curPage++; render(); }
        } else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
            if (curPage > 0) { curPage--; render(); }
        }
    };
    document.addEventListener('keydown', _compKeyHandler);

    overlay.appendChild(panel);
    document.getElementById('game-container').appendChild(overlay);
    render();
}

// =============================================================
// 開始畫面
// =============================================================

function showMapSelect() {
    applyDeviceMode();
    const prev = document.getElementById('start-screen');
    if (prev) prev.remove();

    const overlay = document.createElement('div');
    overlay.id = 'map-select';
    overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:#0d1a0d;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:200;pointer-events:all;color:white;font-family:Arial,sans-serif;';

    const titleEl = document.createElement('div');
    titleEl.style.cssText = 'font-size:22px;font-weight:bold;margin-bottom:32px;letter-spacing:1px;color:#ccc;';
    titleEl.textContent = t('selectTitle');
    overlay.appendChild(titleEl);

    const row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:48px;align-items:flex-start;';

    const btnBase   = 'display:block;width:200px;margin-bottom:8px;padding:11px 14px;border-radius:4px;font-size:15px;font-family:Arial,sans-serif;text-align:left;';
    const btnActive = btnBase + 'background:rgba(60,120,60,0.6);border:2px solid #FFD700;color:white;cursor:pointer;';
    const btnNormal = btnBase + 'background:rgba(40,60,40,0.4);border:1px solid #4a7a4a;color:white;cursor:pointer;';
    const btnLocked = btnBase + 'background:rgba(30,30,30,0.3);border:1px solid #444;color:#555;cursor:default;';

    // ── 難度選擇
    const diffSection = document.createElement('div');
    diffSection.style.cssText = 'display:flex;flex-direction:column;align-items:center;';
    const diffLabel = document.createElement('div');
    diffLabel.style.cssText = 'font-size:13px;color:#aaa;margin-bottom:10px;letter-spacing:1px;';
    diffLabel.textContent = t('difficultyLabel');
    diffSection.appendChild(diffLabel);

    let selectedDiff = 'easy';
    const diffs = [
        { id: 'easy',   key: 'diffEasy',   map: typeof EASY_MAP   !== 'undefined' ? EASY_MAP   : null, locked: false },
        { id: 'normal', key: 'diffNormal', map: typeof NORMAL_MAP !== 'undefined' ? NORMAL_MAP : null, locked: false },
        { id: 'hard',   key: 'diffHard',   map: null, locked: true },
        { id: 'hell',   key: 'diffHell',   map: null, locked: true },
    ];
    const diffBtnEls = {};

    function refreshDiffBtns() {
        for (const d of diffs) {
            diffBtnEls[d.id].style.cssText = d.locked ? btnLocked : (d.id === selectedDiff ? btnActive : btnNormal);
        }
    }

    for (const d of diffs) {
        const btn = document.createElement('button');
        btn.textContent = t(d.key) + (d.locked ? '  🔒' : '');
        btn.style.cssText = d.locked ? btnLocked : (d.id === selectedDiff ? btnActive : btnNormal);
        if (!d.locked) { btn.onclick = () => { selectedDiff = d.id; refreshDiffBtns(); }; }
        diffBtnEls[d.id] = btn;
        diffSection.appendChild(btn);
    }
    row.appendChild(diffSection);

    // ── 角色選擇
    const charSection = document.createElement('div');
    charSection.style.cssText = 'display:flex;flex-direction:column;align-items:center;';
    const charLabel = document.createElement('div');
    charLabel.style.cssText = 'font-size:13px;color:#aaa;margin-bottom:10px;letter-spacing:1px;';
    charLabel.textContent = t('characterLabel');
    charSection.appendChild(charLabel);

    let selectedChar = 'koel';
    const chars = [
        { id: 'koel', key: 'charKoel', locked: false },
        { id: 'soon', key: 'charSoon', locked: true  },
    ];
    const charBtnEls = {};

    function refreshCharBtns() {
        for (const c of chars) {
            charBtnEls[c.id].style.cssText = c.locked ? btnLocked : (c.id === selectedChar ? btnActive : btnNormal);
        }
    }

    for (const c of chars) {
        const btn = document.createElement('button');
        btn.textContent = t(c.key) + (c.locked ? '  🔒' : '');
        btn.style.cssText = c.locked ? btnLocked : (c.id === selectedChar ? btnActive : btnNormal);
        if (!c.locked) { btn.onclick = () => { selectedChar = c.id; refreshCharBtns(); }; }
        charBtnEls[c.id] = btn;
        charSection.appendChild(btn);
    }
    row.appendChild(charSection);
    overlay.appendChild(row);

    // ── 底部按鈕
    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:16px;margin-top:36px;';

    const backBtn = document.createElement('button');
    backBtn.style.cssText = 'font-size:16px;padding:10px 28px;cursor:pointer;border-radius:4px;background:rgba(50,50,50,0.5);border:1px solid #666;color:#ccc;pointer-events:all;font-family:Arial,sans-serif;';
    backBtn.textContent = t('btnBack');
    backBtn.onclick = () => { overlay.remove(); showStartScreen(); };
    btnRow.appendChild(backBtn);

    const startBtn = document.createElement('button');
    startBtn.style.cssText = 'font-size:16px;padding:10px 28px;cursor:pointer;border-radius:4px;background:#2a5a2a;border:2px solid #FFD700;color:white;font-weight:bold;pointer-events:all;font-family:Arial,sans-serif;';
    startBtn.textContent = t('btnStart');
    startBtn.onclick = () => {
        const selDiff = diffs.find(d => d.id === selectedDiff);
        gameState.currentMap = (selDiff && selDiff.map) ? selDiff.map : (typeof EASY_MAP !== 'undefined' ? EASY_MAP : null);
        gameState.lastDifficulty = selectedDiff;
        overlay.remove();
        let hasOrgans = false;
        try {
            const so = localStorage.getItem('savedOrgans');
            hasOrgans = !!so && JSON.parse(so).length > 0;
        } catch(e) {}
        if (hasOrgans) {
            initializeGame();
        } else {
            buildSkillTreeOverlay(null, false, true);
        }
    };
    btnRow.appendChild(startBtn);
    overlay.appendChild(btnRow);

    document.getElementById('game-container').appendChild(overlay);
}

function showStartScreen() {
    applyDeviceMode();
    if (sessionStorage.getItem('autostart')) {
        sessionStorage.removeItem('autostart');
        initializeGame();
        return;
    }
    const overlay = document.createElement('div');
    overlay.id = 'start-screen';
    overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:#0d1a0d;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:200;pointer-events:all;color:white;font-family:Arial,sans-serif;';

    const titleEl = document.createElement('div');
    titleEl.style.cssText = 'font-size:40px;font-weight:bold;margin-bottom:10px;letter-spacing:2px;';
    titleEl.textContent = GAME_INFO.title;
    overlay.appendChild(titleEl);

    const subtitleEl = document.createElement('div');
    subtitleEl.style.cssText = 'font-size:16px;color:#aaa;letter-spacing:5px;margin-bottom:40px;';
    subtitleEl.textContent = GAME_INFO.subtitle;
    overlay.appendChild(subtitleEl);

    const menuBtnStyle = 'font-size:18px;padding:10px 0;cursor:pointer;pointer-events:all;border-radius:4px;color:white;width:220px;margin-bottom:12px;';

    const startBtn = document.createElement('button');
    startBtn.style.cssText = menuBtnStyle + 'background:#2a5a2a;border:1px solid #4a8a4a;';
    startBtn.textContent = t('startGame');
    startBtn.onclick = () => showMapSelect();
    overlay.appendChild(startBtn);

    const skillBtn = document.createElement('button');
    skillBtn.style.cssText = menuBtnStyle + 'background:rgba(60,100,60,0.3);border:1px solid #4a7a4a;';
    skillBtn.textContent = t('skillTree');
    skillBtn.onclick = () => buildSkillTreeOverlay(null, true);
    overlay.appendChild(skillBtn);

    const guideBtn = document.createElement('button');
    guideBtn.style.cssText = menuBtnStyle + 'background:rgba(90,80,40,0.3);border:1px solid #8a7a4a;';
    guideBtn.textContent = t('compendium');
    guideBtn.onclick = () => showCompendium('guide');
    overlay.appendChild(guideBtn);

    const lbMenuBtn = document.createElement('button');
    lbMenuBtn.style.cssText = menuBtnStyle + 'background:rgba(80,60,10,0.3);border:1px solid #8a7a2a;';
    lbMenuBtn.textContent = t('leaderboard');
    lbMenuBtn.onclick = () => showLeaderboard();
    overlay.appendChild(lbMenuBtn);

    const settingsBtn = document.createElement('button');
    settingsBtn.style.cssText = menuBtnStyle + 'background:rgba(50,50,90,0.3);border:1px solid #4a4a8a;';
    settingsBtn.textContent = t('settings');
    settingsBtn.onclick = () => showSettings(true);
    overlay.appendChild(settingsBtn);

    const footerEl = document.createElement('div');
    footerEl.style.cssText = 'position:absolute;bottom:16px;font-size:12px;color:#555;';
    footerEl.textContent = '© 2026 ' + GAME_INFO.author + '  |  ' + GAME_INFO.version;
    overlay.appendChild(footerEl);

    const top10Panel = document.createElement('div');
    top10Panel.id = 'top10-panel';
    const _top10Transform = gameState.isMobile
        ? 'scale(0.55)'
        : 'translateY(-50%)';
    const _top10TransformOrigin = gameState.isMobile ? 'top right' : 'right center';
    const _top10Top = gameState.isMobile ? '16px' : '50%';
    top10Panel.style.cssText = 'position:absolute;right:16px;top:' + _top10Top + ';transform:' + _top10Transform + ';transform-origin:' + _top10TransformOrigin + ';width:220px;background:rgba(0,0,0,0.75);border-radius:8px;padding:12px;color:white;font-family:Arial,sans-serif;font-size:13px;pointer-events:none;';
    const top10Title = document.createElement('div');
    top10Title.style.cssText = 'color:#FFD700;font-weight:bold;margin-bottom:8px;text-align:center;font-size:14px;';
    top10Title.textContent = t('lbTop10Title');
    top10Panel.appendChild(top10Title);
    const top10List = document.createElement('div');
    top10List.id = 'top10-list';
    top10List.innerHTML = t('lbLoading');
    top10Panel.appendChild(top10List);
    overlay.appendChild(top10Panel);

    fetchTop10().then(rows => {
        if (!rows || rows.length === 0) { top10List.textContent = t('lbError'); return; }
        top10List.innerHTML = '';
        rows.forEach((row, i) => {
            const rank = i + 1;
            const name = row.name.length > 20 ? row.name.slice(0, 20) + '…' : row.name;
            const mm = String(Math.floor(row.play_time / 60)).padStart(2, '0');
            const ss = String(row.play_time % 60).padStart(2, '0');
            const timeStr = mm + ':' + ss;
            const result = row.is_victory ? t('lbVictoryIcon') : t('lbDefeatIcon');
            const rankIcon = getRankIcon(rank);
            const row_el = document.createElement('div');
            row_el.style.cssText = 'display:flex;align-items:center;gap:6px;margin-bottom:5px;';
            row_el.innerHTML = '<span style="min-width:28px;text-align:center;">' + rankIcon + '</span>' +
                '<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + name + '</span>' +
                '<span style="color:#aaa;">' + timeStr + '</span>' +
                '<span>' + result + '</span>';
            top10List.appendChild(row_el);
        });
    }).catch(() => { top10List.textContent = t('lbError'); });

    const bookBtn = document.createElement('div');
    bookBtn.id = 'story-book-btn';
    bookBtn.style.cssText = `
        position: absolute;
        top: 20px;
        left: 20px;
        width: 64px;
        height: 64px;
        background: rgba(255, 220, 130, 0.12);
        border: 2px solid rgba(255, 220, 130, 0.45);
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        pointer-events: all;
        transition: all 0.2s ease;
        z-index: 201;
    `;
    bookBtn.innerHTML = '<div style="font-size:28px;line-height:1;">📖</div><div style="font-size:11px;color:#FFF5DC;letter-spacing:1px;margin-top:3px;">故事</div>';
    bookBtn.onmouseenter = () => {
        bookBtn.style.background = 'rgba(255, 220, 130, 0.28)';
        bookBtn.style.transform = 'scale(1.08)';
        bookBtn.style.borderColor = 'rgba(255, 220, 130, 0.8)';
    };
    bookBtn.onmouseleave = () => {
        bookBtn.style.background = 'rgba(255, 220, 130, 0.12)';
        bookBtn.style.transform = 'scale(1)';
        bookBtn.style.borderColor = 'rgba(255, 220, 130, 0.45)';
    };
    bookBtn.onclick = () => showGuideStory();
    overlay.appendChild(bookBtn);

    document.getElementById('game-container').appendChild(overlay);
}

function showGuideStory() {
    applyDeviceMode();
    if (document.getElementById('guide-story-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'guide-story-overlay';
    overlay.style.cssText = `
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background: rgba(0,0,0,0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 250;
        pointer-events: all;
        font-family: Georgia, serif;
    `;

    const book = document.createElement('div');
    book.style.cssText = `
        background: #f5ead8;
        border-radius: 16px;
        width: 90%;
        max-width: 660px;
        max-height: 88vh;
        padding: 0;
        box-sizing: border-box;
        box-shadow: 0 8px 48px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(160,120,60,0.25);
        position: relative;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border-left: 8px solid rgba(130,80,20,0.45);
    `;

    // ── 插畫區（上半部）
    const illustrationArea = document.createElement('div');
    illustrationArea.style.cssText = `
        width: 100%;
        height: 260px;
        overflow: hidden;
        flex-shrink: 0;
        border-radius: 8px 8px 0 0;
        background: #0a0f08;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    // ── 文字區（下半部）
    const textArea = document.createElement('div');
    textArea.style.cssText = `
        padding: 20px 32px 12px;
        flex: 1;
        overflow-y: auto;
        min-height: 0;
    `;

    const chapterHeader = document.createElement('div');
    chapterHeader.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:12px;';
    const chapterIcon = document.createElement('div');
    chapterIcon.style.cssText = 'font-size:26px;line-height:1;flex-shrink:0;';
    const chapterTitle = document.createElement('div');
    chapterTitle.style.cssText = 'font-size:20px;font-weight:bold;color:#4a2808;letter-spacing:1px;';
    chapterHeader.appendChild(chapterIcon);
    chapterHeader.appendChild(chapterTitle);

    const storyText = document.createElement('div');
    storyText.style.cssText = `
        font-size: 13.5px;
        line-height: 1.85;
        color: #3a2208;
        white-space: pre-wrap;
        word-break: break-word;
        font-family: Georgia, serif;
    `;

    if (_effectiveMobile && _effectiveMobile()) {
        book.style.maxWidth = '98%';
        illustrationArea.style.height = '200px';
        textArea.style.padding = '14px 20px 8px';
        storyText.style.fontSize = '12.5px';
    }

    textArea.appendChild(chapterHeader);
    textArea.appendChild(storyText);

    // ── 分隔線 + 底部導航
    const divider = document.createElement('div');
    divider.style.cssText = 'width:100%;height:1px;background:linear-gradient(90deg,transparent,rgba(130,80,20,0.25),transparent);margin:0;flex-shrink:0;';

    const navArea = document.createElement('div');
    navArea.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:12px 28px 16px;flex-shrink:0;';

    const prevBtn = document.createElement('button');
    prevBtn.innerHTML = '&#9664;';
    prevBtn.style.cssText = `
        width:38px;height:38px;border-radius:50%;
        border:2px solid rgba(130,80,20,0.35);
        background:rgba(255,220,130,0.15);
        color:#5a3010;font-size:13px;cursor:pointer;
        transition:all 0.2s;pointer-events:all;
    `;

    const dots = document.createElement('div');
    dots.style.cssText = 'display:flex;gap:7px;align-items:center;';

    const nextBtn = document.createElement('button');
    nextBtn.style.cssText = `
        padding:9px 18px;border-radius:18px;
        border:2px solid rgba(130,80,20,0.4);
        background:rgba(255,220,130,0.22);
        color:#4a2808;font-size:13px;font-weight:bold;
        cursor:pointer;transition:all 0.2s;
        font-family:Georgia,serif;pointer-events:all;
    `;

    navArea.appendChild(prevBtn);
    navArea.appendChild(dots);
    navArea.appendChild(nextBtn);

    // ── 關閉按鈕
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = `
        position:absolute;top:12px;right:14px;
        background:rgba(0,0,0,0.45);border:none;
        font-size:16px;color:rgba(255,255,255,0.6);
        cursor:pointer;padding:4px 8px;border-radius:4px;
        transition:color 0.2s;z-index:5;pointer-events:all;
        font-family:Arial,sans-serif;
    `;
    closeBtn.onmouseenter = () => closeBtn.style.color = 'rgba(255,255,255,0.95)';
    closeBtn.onmouseleave = () => closeBtn.style.color = 'rgba(255,255,255,0.6)';
    closeBtn.onclick = () => overlay.remove();

    book.appendChild(closeBtn);
    book.appendChild(illustrationArea);
    book.appendChild(textArea);
    book.appendChild(divider);
    book.appendChild(navArea);
    overlay.appendChild(book);
    document.getElementById('game-container').appendChild(overlay);

    const PAGES = _getGuideStoryPages();
    let currentPage = 0;

    function renderPage(idx) {
        const page = PAGES[idx];

        // 插畫切換（淡出 → 替換 → 淡入）
        illustrationArea.style.transition = 'opacity 0.3s ease';
        illustrationArea.style.opacity = '0';
        setTimeout(() => {
            illustrationArea.innerHTML = page.svgIllustration;
            illustrationArea.style.opacity = '1';
        }, 300);

        // 標題
        chapterIcon.textContent = page.icon;
        chapterTitle.textContent = page.title;

        // 文字淡入
        storyText.style.transition = 'opacity 0.3s ease';
        storyText.style.opacity = '0';
        setTimeout(() => {
            storyText.textContent = page.content;
            storyText.style.opacity = '1';
        }, 200);

        textArea.scrollTop = 0;

        // 進度點
        dots.innerHTML = '';
        for (let i = 0; i < PAGES.length; i++) {
            const dot = document.createElement('div');
            dot.style.cssText = `
                width:${i === idx ? '20px' : '8px'};
                height:8px;border-radius:4px;
                background:${i === idx ? '#7a4a10' : 'rgba(122,74,16,0.28)'};
                transition:all 0.3s ease;
            `;
            dots.appendChild(dot);
        }

        // 按鈕狀態
        prevBtn.style.opacity = idx === 0 ? '0.3' : '1';
        prevBtn.style.cursor = idx === 0 ? 'not-allowed' : 'pointer';

        if (idx === PAGES.length - 1) {
            nextBtn.textContent = '⚔️  開始冒險';
            nextBtn.style.background = 'rgba(80,160,40,0.25)';
            nextBtn.style.borderColor = 'rgba(60,130,20,0.5)';
            nextBtn.style.color = '#2a5008';
        } else {
            nextBtn.textContent = '下一頁 ▶';
            nextBtn.style.background = 'rgba(255,220,130,0.22)';
            nextBtn.style.borderColor = 'rgba(130,80,20,0.4)';
            nextBtn.style.color = '#4a2808';
        }
    }

    prevBtn.onclick = () => { if (currentPage > 0) { currentPage--; renderPage(currentPage); } };
    nextBtn.onclick = () => {
        if (currentPage < PAGES.length - 1) {
            currentPage++;
            renderPage(currentPage);
        } else {
            overlay.remove();
            localStorage.setItem('hasPlayedBefore', 'true');
            const startScreen = document.getElementById('start-screen');
            if (startScreen) startScreen.remove();
            initializeGame();
        }
    };

    renderPage(0);
}

function _getGuideStoryPages() {
    const svgStyle = `<style>
@keyframes _blink{0%,90%,100%{opacity:1}95%{opacity:.1}}
@keyframes _drift{0%{transform:translateX(0)}100%{transform:translateX(18px)}}
@keyframes _rpulse{0%,100%{opacity:.6}50%{opacity:1}}
@keyframes _twinkle{0%,100%{opacity:.3}50%{opacity:.9}}
@keyframes _gflash{0%,100%{opacity:0}8%,12%{opacity:1}}
@keyframes _ppulse{0%,100%{opacity:.5}50%{opacity:1}}
@keyframes _vglow{0%,100%{opacity:.2}50%{opacity:.55}}
@keyframes _fdrip{0%,60%{opacity:0}65%{opacity:.9}80%{transform:translateY(0)}100%{transform:translateY(8px);opacity:0}}
@keyframes _breath{0%,100%{transform:scaleX(1)}50%{transform:scaleX(1.03)}}
@keyframes _bfloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
@keyframes _sway{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}}
@keyframes _fall{0%{transform:translateY(0) rotate(0deg);opacity:.8}100%{transform:translateY(12px) rotate(15deg);opacity:0}}
@keyframes _warmP{0%,100%{opacity:.15}50%{opacity:.3}}
@keyframes _hbob{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
@keyframes _emerge{0%{opacity:.15}100%{opacity:.75}}
@keyframes _eglow{0%,100%{opacity:.6}50%{opacity:1}}
@keyframes _wripple{0%{transform:scaleX(1)}50%{transform:scaleX(1.04)}100%{transform:scaleX(1)}}
@keyframes _tsway{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(8deg)}}
</style>`;

    return [
        {
            icon: '🌑',
            title: '第一章 — 破曉',
            svgIllustration: svgStyle + `<svg width="100%" viewBox="0 0 520 200" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
<rect x="0" y="0" width="520" height="180" fill="#0a1208"/>
<ellipse cx="90" cy="95" rx="70" ry="52" fill="#111f0e"/>
<ellipse cx="95" cy="88" rx="50" ry="36" fill="#162a12"/>
<polygon points="30,180 80,180 55,145" fill="#0e1a0c"/>
<polygon points="60,180 110,180 85,148" fill="#0e1a0c"/>
<polygon points="100,180 145,180 122,150" fill="#0e1a0c"/>
<polygon points="135,180 175,180 155,152" fill="#0e1a0c"/>
<polygon points="320,180 370,180 345,138" fill="#0c1a0a"/>
<polygon points="360,180 410,180 385,140" fill="#0c1a0a"/>
<polygon points="400,180 450,180 425,142" fill="#0c1a0a"/>
<polygon points="440,180 490,180 465,145" fill="#0c1a0a"/>
<g style="animation:_drift 8s ease-in-out infinite alternate">
  <ellipse cx="250" cy="88" rx="52" ry="26" fill="#0d1f1a"/>
  <ellipse cx="250" cy="82" rx="44" ry="21" fill="#152a20"/>
  <path d="M198 82 Q210 65 230 67 Q220 80 205 85Z" fill="#0d1f1a"/>
  <path d="M295 70 Q310 60 325 65 Q315 75 298 77Z" fill="#0d1f1a"/>
  <path d="M240 102 Q250 112 265 109 Q260 102 248 100Z" fill="#0d1f1a"/>
  <path d="M225 94 Q215 102 210 100 Q215 94 225 92Z" fill="#1a3030"/>
  <path d="M225 94 Q222 98 218 97" stroke="#7fd967" stroke-width="1.2" fill="none"/>
  <ellipse style="animation:_blink 4s ease-in-out infinite" cx="220" cy="81" rx="4.5" ry="4" fill="#cc2200" opacity="0.9"/>
  <ellipse cx="220" cy="81" rx="1.8" ry="1.6" fill="#1a0000"/>
</g>
<circle style="animation:_twinkle 2.1s ease-in-out infinite" cx="400" cy="28" r="1.2" fill="#c8e8a0"/>
<circle style="animation:_twinkle 3.3s ease-in-out infinite .7s" cx="440" cy="16" r="1" fill="#c8e8a0"/>
<circle style="animation:_twinkle 1.8s ease-in-out infinite 1.2s" cx="470" cy="36" r="1.4" fill="#c8e8a0"/>
<circle style="animation:_twinkle 2.5s ease-in-out infinite .4s" cx="350" cy="20" r="0.9" fill="#c8e8a0"/>
<circle style="animation:_twinkle 2.8s ease-in-out infinite .9s" cx="490" cy="24" r="1.1" fill="#c8e8a0"/>
<g style="animation:_gflash 5s ease-in-out infinite 2s">
  <circle cx="488" cy="55" r="6" fill="#ffee88" opacity=".9"/>
  <circle cx="488" cy="55" r="10" fill="#ffaa22" opacity=".4"/>
  <line x1="488" y1="48" x2="488" y2="42" stroke="#ffee88" stroke-width="1.5" opacity=".7"/>
  <line x1="481" y1="51" x2="475" y2="47" stroke="#ffee88" stroke-width="1.5" opacity=".7"/>
  <line x1="495" y1="51" x2="501" y2="47" stroke="#ffee88" stroke-width="1.5" opacity=".7"/>
</g>
<text x="260" y="188" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="#4a7a38" opacity=".7">遠方傳來槍聲。你孤身一人。</text>
</svg>`,
            content: `你睜開了眼睛。

紅色的眼眸在黑暗中閃爍。
你的身體比任何野生噪鹃都龐大，
蘋果綠色的喙，已經長出了獠牙。

你不知道自己從哪裡來。
你只記得——
一對大嘴烏鸦，用牠們的智慧把你撫養長大。

牠們教你計算、教你躲藏、教你思考。
但那是很久以前的事了。

遠方傳來槍聲。

現在，你孤身一人。
養父母已經死了——被人類獵人的毒箭。

牠們最後說的話還在迴盪：
「用腦子去活。用腦子去贏。」

這片森林很陌生。
你不知道哪裡有食物，
你只知道——
獵人還在追殺你，還有三天三夜。

你必須活下去。`
        },
        {
            icon: '🐦‍⬛',
            title: '第二章 — 孤兒',
            svgIllustration: svgStyle + `<svg width="100%" viewBox="0 0 520 200" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
<rect x="0" y="0" width="520" height="180" fill="#1a1005"/>
<ellipse style="animation:_warmP 3s ease-in-out infinite" cx="260" cy="150" rx="160" ry="45" fill="#c8640a" opacity=".2"/>
<ellipse cx="260" cy="150" rx="78" ry="20" fill="#2a1a06"/>
<path d="M185 150 Q200 124 230 122 Q260 119 290 122 Q320 124 335 150Z" fill="#3a2508"/>
<path d="M205 148 L215 140 L220 147" stroke="#4a3010" stroke-width="1.5" fill="none"/>
<path d="M295 148 L305 140 L310 147" stroke="#4a3010" stroke-width="1.5" fill="none"/>
<path d="M240 147 L248 139 L256 147" stroke="#4a3010" stroke-width="1.5" fill="none"/>
<path d="M270 147 L278 139 L286 147" stroke="#4a3010" stroke-width="1.5" fill="none"/>
<ellipse cx="260" cy="142" rx="20" ry="7" fill="#c87820" opacity=".5"/>
<g style="animation:_hbob 2.5s ease-in-out infinite;transform-origin:195px 88px">
  <ellipse cx="195" cy="92" rx="26" ry="18" fill="#1a2018"/>
  <ellipse cx="195" cy="85" rx="20" ry="14" fill="#222820"/>
  <path d="M175 82 Q180 69 192 71 Q185 80 178 84Z" fill="#1a2018"/>
  <path d="M205 73 Q215 65 220 69 Q212 75 206 77Z" fill="#1a2018"/>
  <path d="M190 96 Q195 104 205 102 Q200 96 192 94Z" fill="#1a2018"/>
  <path d="M173 93 Q165 97 163 94 Q167 90 174 91Z" fill="#222820"/>
  <path d="M173 93 Q170 96 166 95" stroke="#555" stroke-width="1" fill="none"/>
  <circle cx="170" cy="84" r="3" fill="#1a1a1a"/>
  <circle cx="169" cy="83.5" r="1" fill="#555" opacity=".7"/>
</g>
<g style="animation:_hbob 2.5s ease-in-out infinite .8s;transform-origin:325px 85px">
  <ellipse cx="325" cy="89" rx="24" ry="17" fill="#1a2018"/>
  <ellipse cx="325" cy="83" rx="18" ry="13" fill="#222820"/>
  <path d="M348 81 Q353 69 342 70 Q348 79 350 83Z" fill="#1a2018"/>
  <path d="M316 72 Q308 65 304 70 Q311 76 314 77Z" fill="#1a2018"/>
  <path d="M318 97 Q315 105 306 103 Q309 97 316 95Z" fill="#1a2018"/>
  <path d="M348 89 Q356 93 357 90 Q353 86 347 88Z" fill="#222820"/>
  <circle cx="350" cy="81" r="3" fill="#1a1a1a"/>
</g>
<g style="animation:_hbob 2s ease-in-out infinite .5s;transform-origin:260px 115px">
  <ellipse cx="260" cy="122" rx="14" ry="10" fill="#152a20"/>
  <ellipse cx="260" cy="117" rx="10" ry="8" fill="#1d3828"/>
  <path d="M250 115 Q253 108 258 109 Q255 114 252 117Z" fill="#152a20"/>
  <path d="M263 107 Q268 102 271 105 Q267 109 264 111Z" fill="#152a20"/>
  <path d="M253 124 Q258 130 265 128 Q262 123 255 122Z" fill="#152a20"/>
  <path d="M250 118 Q245 121 243 119 Q246 116 251 117Z" fill="#1a3228"/>
  <path d="M250 118 Q247 120 244 119" stroke="#7fd967" stroke-width="1" fill="none"/>
  <circle cx="247" cy="114" r="2.5" fill="#cc2200" opacity=".85"/>
</g>
<path style="animation:_fall 3s ease-in infinite" d="M230 65 Q228 70 232 73 Q230 75 228 71Z" fill="#333" opacity=".6"/>
<path style="animation:_fall 3s ease-in infinite 1.4s" d="M290 60 Q288 65 292 68 Q290 70 288 66Z" fill="#333" opacity=".5"/>
<text x="260" y="188" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="#8a6030" opacity=".8">牠們咬著你，叼進了自己的巢。</text>
</svg>`,
            content: `你很小很小的時候，
人類帶著槍聲進入了那片樹林。

你掉進了樹洞裡，發不出聲音。
就在你以為自己要死在黑暗中的時候——

一對黑色的翅膀遮住了樹洞的光。

那兩隻大嘴烏鸦沒有猶豫，
叼著你，把你帶進了自己的巢。

🧮 牠們用算術教你躲避危險：
  三個獵人進木屋，只有兩個出來——
  那麼裡面還藏著一個。
  數字，就是活著的方法。

🔧 牠們用工具教你生存：
  野生噪鹃只用嘴吃現成的果子。
  但你學會了用爪子配合，用腦子創造方法。

後來，一根毒箭穿過了牠們的身體。

在最後一聲淒厲的叫聲中，
養父說：
「孩子，不要像野生噪鹃那樣愚蠢地送死……
  用你的腦子去活下去。用腦子去贏。」

你咬著牠們的羽毛，感受到體溫漸漸消散。
那一刻，你發誓：
要用牠們教你的智慧，活著走出這片森林。`
        },
        {
            icon: '☠️',
            title: '第三章 — 蛻變',
            svgIllustration: svgStyle + `<svg width="100%" viewBox="0 0 520 200" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
<rect x="0" y="0" width="520" height="180" fill="#0c0a15"/>
<ellipse style="animation:_vglow 2s ease-in-out infinite" cx="180" cy="95" rx="75" ry="52" fill="#6030c0" opacity=".2"/>
<g style="animation:_breath 3s ease-in-out infinite;transform-origin:180px 95px">
  <ellipse cx="180" cy="98" rx="55" ry="30" fill="#0d1a18"/>
  <ellipse cx="178" cy="90" rx="42" ry="25" fill="#152a22"/>
  <path d="M138 88 Q148 70 165 72 Q155 85 142 90Z" fill="#0d1a18"/>
  <path d="M215 73 Q228 63 236 68 Q225 77 218 80Z" fill="#0d1a18"/>
  <path d="M172 120 Q180 132 196 129 Q190 120 175 118Z" fill="#0d1a18"/>
  <path d="M138 102 Q125 109 122 106 Q127 100 139 101Z" fill="#1a2e26"/>
  <path d="M138 102 Q133 106 127 105" stroke="#7fd967" stroke-width="1.2" fill="none"/>
  <circle cx="132" cy="90" r="5" fill="#cc2200"/>
  <circle cx="131" cy="89" r="2" fill="#1a0000"/>
</g>
<ellipse style="animation:_vglow 2s ease-in-out infinite" cx="165" cy="114" rx="18" ry="10" fill="#8040e0" opacity=".4"/>
<ellipse cx="165" cy="114" rx="12" ry="7" fill="#5020a0" opacity=".8"/>
<ellipse cx="165" cy="114" rx="7" ry="4" fill="#9060e8" opacity=".9"/>
<circle style="animation:_ppulse 2s ease-in-out infinite" cx="165" cy="114" r="7" fill="none" stroke="#b080ff" stroke-width="1" opacity=".7"/>
<path d="M148 100 Q145 107 148 112 Q152 118 158 114" stroke="#9060c8" stroke-width="1" fill="none" opacity=".6"/>
<path d="M124 105 Q116 112 114 110 Q118 104 125 105" fill="#1a3030" opacity=".8"/>
<circle style="animation:_fdrip 3.5s ease-in infinite" cx="120" cy="118" r="2" fill="#b080ff"/>
<circle style="animation:_fdrip 3.5s ease-in infinite 1.8s" cx="115" cy="121" r="1.5" fill="#9060c8"/>
<g style="animation:_bfloat 2.5s ease-in-out infinite">
  <rect x="310" y="118" width="58" height="7" rx="3.5" fill="#c8c0a8" opacity=".85"/>
  <circle cx="310" cy="121" r="6.5" fill="#d8d0b8" opacity=".85"/>
  <circle cx="368" cy="121" r="6.5" fill="#d8d0b8" opacity=".85"/>
</g>
<g style="animation:_bfloat 2.5s ease-in-out infinite 1.2s">
  <rect x="335" y="142" width="40" height="6" rx="3" fill="#c0b89a" opacity=".7"/>
  <circle cx="335" cy="145" r="5" fill="#d0c8aa" opacity=".7"/>
  <circle cx="375" cy="145" r="5" fill="#d0c8aa" opacity=".7"/>
</g>
<path d="M205 118 Q240 118 290 124" stroke="#9060c8" stroke-width=".8" fill="none" stroke-dasharray="3 4" opacity=".5"/>
<circle cx="420" cy="35" r="1.2" fill="#a080d0" opacity=".5"/>
<circle cx="455" cy="22" r="1" fill="#a080d0" opacity=".4"/>
<circle cx="480" cy="44" r="1.1" fill="#a080d0" opacity=".6"/>
<text x="260" y="188" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="#9060c8" opacity=".8">白骨素不是詛咒。是生存的證明。</text>
</svg>`,
            content: `每一口果子，是為了活著。
每一次進化，是為了更強壯。

但有一種力量，不是你選擇的——

那是白骨。

你咬下去，感到了噁心。
那不是養父母教你的食物，
那是腐肉，是死亡的味道。

每一次吞下白骨，
你的肌肉在增長，
你的獠牙在發出微弱的紫光，
你的毒囊在進化。

這不是你選擇的。
這是你的身體，在黑暗環境下的自然反應。

你看著自己的爪子——
牠們已經是獵手的爪子了。
怪物的爪子。

但這個怪物，會活著。
有時候，活著本身，
就需要變成你害怕的樣子。`
        },
        {
            icon: '⚔️',
            title: '第四章 — 試煉',
            svgIllustration: svgStyle + `<svg width="100%" viewBox="0 0 520 200" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
<defs>
  <radialGradient id="_bg" cx="50%" cy="50%"><stop offset="0%" stop-color="#141810"/><stop offset="100%" stop-color="#060806"/></radialGradient>
  <radialGradient id="_bg1" cx="50%" cy="50%"><stop offset="0%" stop-color="#5a3010" stop-opacity=".45"/><stop offset="100%" stop-color="#5a3010" stop-opacity="0"/></radialGradient>
  <radialGradient id="_bg2" cx="50%" cy="50%"><stop offset="0%" stop-color="#103858" stop-opacity=".45"/><stop offset="100%" stop-color="#103858" stop-opacity="0"/></radialGradient>
  <radialGradient id="_bg3" cx="50%" cy="50%"><stop offset="0%" stop-color="#3a1050" stop-opacity=".45"/><stop offset="100%" stop-color="#3a1050" stop-opacity="0"/></radialGradient>
</defs>
<rect x="0" y="0" width="520" height="180" fill="url(#_bg)"/>
<ellipse cx="85" cy="100" rx="65" ry="52" fill="url(#_bg1)"/>
<ellipse cx="260" cy="128" rx="78" ry="38" fill="url(#_bg2)"/>
<ellipse cx="435" cy="95" rx="65" ry="52" fill="url(#_bg3)"/>
<g style="animation:_emerge 3s ease-out forwards">
  <ellipse cx="85" cy="108" rx="40" ry="26" fill="#2a1808"/>
  <ellipse cx="85" cy="94" rx="27" ry="23" fill="#301c0a"/>
  <ellipse cx="69" cy="79" rx="9" ry="9" fill="#2a1808"/>
  <ellipse cx="102" cy="79" rx="9" ry="9" fill="#2a1808"/>
  <ellipse cx="56" cy="122" rx="9" ry="14" fill="#2a1808"/>
  <ellipse cx="114" cy="122" rx="9" ry="14" fill="#2a1808"/>
  <ellipse cx="68" cy="140" rx="8" ry="12" fill="#2a1808"/>
  <ellipse cx="102" cy="140" rx="8" ry="12" fill="#2a1808"/>
  <circle style="animation:_eglow 2s ease-in-out infinite" cx="77" cy="91" r="3.5" fill="#cc4400"/>
  <circle style="animation:_eglow 2s ease-in-out infinite .3s" cx="94" cy="91" r="3.5" fill="#cc4400"/>
  <circle cx="77" cy="91" r="1.5" fill="#1a0000"/>
  <circle cx="94" cy="91" r="1.5" fill="#1a0000"/>
</g>
<text x="85" y="165" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="#8a4820" opacity=".85">🐻 黑熊</text>
<g style="animation:_emerge 3s ease-out forwards .5s;opacity:.15">
  <g style="animation:_wripple 2s ease-in-out infinite;transform-origin:260px 132px">
    <ellipse cx="260" cy="132" rx="72" ry="10" fill="#0a2038" opacity=".9"/>
  </g>
  <path d="M215 128 Q240 94 260 91 Q280 94 305 128Z" fill="#1a3050"/>
  <path d="M255 91 Q260 76 265 91Z" fill="#1a3050"/>
  <g style="animation:_tsway 1.5s ease-in-out infinite;transform-origin:305px 128px">
    <path d="M305 128 Q320 116 330 123 Q325 132 305 132Z" fill="#162840"/>
  </g>
  <circle style="animation:_eglow 2.4s ease-in-out infinite .6s" cx="238" cy="112" r="3" fill="#88ccff"/>
  <circle cx="238" cy="112" r="1.3" fill="#001830"/>
</g>
<text x="260" y="165" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="#3870a8" opacity=".85">🦈 大白鯊</text>
<g style="animation:_emerge 3s ease-out forwards 1s;opacity:.15">
  <ellipse cx="435" cy="108" rx="22" ry="13" fill="#1a0828"/>
  <ellipse cx="435" cy="100" rx="16" ry="11" fill="#22103a"/>
  <ellipse cx="435" cy="96" rx="12" ry="8" fill="#2a1445"/>
  <path d="M413 108 Q408 100 404 104 Q406 110 413 110Z" fill="#1a0828"/>
  <path d="M457 108 Q462 100 466 104 Q464 110 457 110Z" fill="#1a0828"/>
  <path d="M418 112 Q410 120 406 118 Q408 112 418 110Z" fill="#1a0828"/>
  <path d="M452 112 Q460 120 464 118 Q462 112 452 110Z" fill="#1a0828"/>
  <path d="M435 94 Q445 80 455 70 Q452 80 458 88 Q448 85 435 94Z" fill="#22103a"/>
  <ellipse cx="458" cy="70" rx="4" ry="3" fill="#9030c0" opacity=".9"/>
  <circle style="animation:_eglow 1.8s ease-in-out infinite 1s" cx="428" cy="94" r="2.8" fill="#cc00ff"/>
  <circle style="animation:_eglow 1.8s ease-in-out infinite 1.4s" cx="442" cy="94" r="2.8" fill="#cc00ff"/>
  <circle cx="428" cy="94" r="1.2" fill="#1a0020"/>
  <circle cx="442" cy="94" r="1.2" fill="#1a0020"/>
</g>
<text x="435" y="165" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="#8830b0" opacity=".85">🦂 沙漠蠍王</text>
<text x="260" y="14" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="#506040" opacity=".6">三個威脅，從黑暗中浮現</text>
<text x="260" y="188" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="#506040" opacity=".65">用腦子去贏。</text>
</svg>`,
            content: `這片廣東的森林，隱藏著三個威脅。

🐻  北方密林 — 黑熊
  體型最龐大的陸生獵食者。
  眼睛不好，但嗅覺敏銳。
  用毒與智謀，你有機會讓牠自取滅亡。

🦈  南方水澤 — 大白鯊
  潛伏水中的幽靈，代表無處可逃的恐懼。
  利用牠對水的依賴——
  離開了水，牠就什麼都不是。

🦂  西方荒地 — 沙漠蠍王
  比你更毒的毒液，比你更快的速度。
  但速度和力量，從來不是唯一的答案。

養父母曾說：
「與其和敵人硬碰硬，不如讓敵人自相殘殺。」

————

吃果子，是在儲存生存的力量。
選擇器官，是在決定進化的方向。
擊敗 Boss，是在掌控一片區域的生態。

每一次勝利，都是朝著復仇更近一步。

現在，輪到你改寫這片森林。

「用腦子去贏。」`
        }
    ];
}

function showLeaderboard() {
    applyDeviceMode();
    let currentPage = 1;
    const PAGE_SIZE = 20;
    let allRows = [];

    const overlay = document.createElement('div');
    overlay.id = 'leaderboard-overlay';
    overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);display:flex;flex-direction:column;align-items:center;z-index:500;color:white;font-family:Arial,sans-serif;overflow:hidden;';

    const titleEl = document.createElement('div');
    titleEl.style.cssText = 'font-size:22px;font-weight:bold;color:#FFD700;margin:20px 0 12px;';
    titleEl.textContent = t('lbFullTitle');
    overlay.appendChild(titleEl);

    const tableWrap = document.createElement('div');
    tableWrap.style.cssText = 'width:90%;max-width:860px;overflow-y:auto;flex:1;';
    overlay.appendChild(tableWrap);

    const table = document.createElement('table');
    table.style.cssText = 'width:100%;border-collapse:collapse;font-size:13px;';
    tableWrap.appendChild(table);

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const cols = ['lbColRank','lbColVersion','lbColDate','lbColName','lbColTime','lbColScore','lbColLevel','lbColResult'];
    cols.forEach(key => {
        const th = document.createElement('th');
        th.style.cssText = 'padding:6px 8px;border-bottom:1px solid #444;color:#FFD700;text-align:left;position:sticky;top:0;background:#111;';
        th.textContent = t(key);
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    tbody.id = 'lb-tbody';
    table.appendChild(tbody);

    const pagingBar = document.createElement('div');
    pagingBar.style.cssText = 'display:flex;align-items:center;gap:16px;padding:12px 12px max(20px, env(safe-area-inset-bottom)) 12px;font-size:14px;flex-shrink:0;';
    const prevBtn = document.createElement('button');
    prevBtn.style.cssText = 'background:rgba(255,255,255,0.1);border:1px solid #666;color:white;padding:6px 14px;border-radius:4px;cursor:pointer;font-size:13px;';
    prevBtn.textContent = t('lbPrevPage');
    const pageLabel = document.createElement('span');
    pageLabel.style.cssText = 'color:#aaa;';
    const nextBtn = document.createElement('button');
    nextBtn.style.cssText = 'background:rgba(255,255,255,0.1);border:1px solid #666;color:white;padding:6px 14px;border-radius:4px;cursor:pointer;font-size:13px;';
    nextBtn.textContent = t('lbNextPage');
    pagingBar.appendChild(prevBtn);
    pagingBar.appendChild(pageLabel);
    pagingBar.appendChild(nextBtn);

    const closeBtn = document.createElement('button');
    closeBtn.style.cssText = 'background:rgba(180,0,0,0.4);border:1px solid #aa4444;color:white;padding:6px 20px;border-radius:4px;cursor:pointer;font-size:13px;margin-left:20px;pointer-events:all;';
    closeBtn.textContent = t('close');
    pagingBar.appendChild(closeBtn);
    overlay.appendChild(pagingBar);

    const rowColors = ['rgba(255,215,0,0.12)', 'rgba(192,192,192,0.12)', 'rgba(205,127,50,0.12)'];

    function loadPage(page) {
        tbody.innerHTML = '';
        if (allRows.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:20px;color:#aaa;">' + t('lbError') + '</td></tr>';
            return;
        }
        const start = (page - 1) * PAGE_SIZE;
        const slice = allRows.slice(start, start + PAGE_SIZE);
        slice.forEach((row, i) => {
            const rank = start + i + 1;
            const mm = String(Math.floor(row.play_time / 60)).padStart(2, '0');
            const ss = String(row.play_time % 60).padStart(2, '0');
            const dateStr = row.created_at ? row.created_at.slice(0, 10) : '—';
            const result = row.is_victory ? t('lbVictory') : t('lbDefeat');
            const rankIcon = getRankIcon(rank);
            const tr = document.createElement('tr');
            if (rank <= 3) tr.style.cssText = 'background:' + rowColors[rank - 1] + ';';
            const cells = [rankIcon, row.version || '—', dateStr,
                row.name.length > 20 ? row.name.slice(0, 20) + '…' : row.name,
                mm + ':' + ss, row.score, row.level, result];
            cells.forEach(val => {
                const td = document.createElement('td');
                td.style.cssText = 'padding:6px 8px;border-bottom:1px solid #222;';
                td.innerHTML = String(val);
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        currentPage = page;
        const totalPages = Math.ceil(allRows.length / PAGE_SIZE);
        pageLabel.textContent = t('lbPageLabel').replace('{n}', page);
        prevBtn.disabled = page <= 1;
        prevBtn.style.opacity = page <= 1 ? '0.4' : '1';
        nextBtn.disabled = page >= totalPages;
        nextBtn.style.opacity = page >= totalPages ? '0.4' : '1';
    }

    prevBtn.onclick = () => { if (currentPage > 1) loadPage(currentPage - 1); };
    nextBtn.onclick = () => { if (!nextBtn.disabled) loadPage(currentPage + 1); };

    function closeLb() {
        overlay.remove();
        document.removeEventListener('keydown', lbKeyHandler);
    }
    closeBtn.onclick = closeLb;
    overlay.addEventListener('click', e => { if (e.target === overlay) closeLb(); });

    function lbKeyHandler(e) {
        if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
            e.stopPropagation();
            if (currentPage > 1) loadPage(currentPage - 1);
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
            e.stopPropagation();
            if (!nextBtn.disabled) loadPage(currentPage + 1);
        } else if (e.key === 'Escape') {
            closeLb();
        }
    }
    document.addEventListener('keydown', lbKeyHandler);

    const _lbGc = document.getElementById('game-container');
    const _lbMatch = (_lbGc ? _lbGc.style.transform : '').match(/scale\(([^)]+)\)/);
    const _lbScale = _lbMatch ? parseFloat(_lbMatch[1]) : 1;
    const _lbMaxH = _lbScale > 0 ? Math.floor(window.innerHeight / _lbScale) : 900;
    if (_lbMaxH < 900) overlay.style.height = _lbMaxH + 'px';

    _lbGc.appendChild(overlay);
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:20px;color:#aaa;">' + t('lbLoading') + '</td></tr>';
    fetchVictoryRecords().then(function(victoryRows) {
        const vRows = victoryRows || [];
        const defeatLimit = Math.max(0, 100 - vRows.length);
        if (defeatLimit > 0) {
            return fetchDefeatRecords(defeatLimit).then(function(defeatRows) {
                allRows = vRows.concat(defeatRows || []);
            });
        }
        allRows = vRows;
    }).then(function() {
        loadPage(1);
    }).catch(function() {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:20px;color:#f66;">' + t('lbError') + '</td></tr>';
    });
}

function showScoreSubmitPopup(isVictory, bossKillTime, onDone) {
    const popup = document.createElement('div');
    popup.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:150;color:white;font-family:Arial,sans-serif;';

    const box = document.createElement('div');
    box.style.cssText = 'background:#1a1a2e;border:1px solid #444;border-radius:8px;padding:28px 32px;min-width:300px;max-width:400px;text-align:center;';

    const title = document.createElement('div');
    title.style.cssText = 'font-size:18px;font-weight:bold;margin-bottom:16px;color:#FFD700;';
    title.textContent = t('lbSubmitTitle');
    box.appendChild(title);

    const input = document.createElement('input');
    input.type = 'text';
    input.maxLength = 20;
    input.placeholder = t('lbNamePlaceholder');
    input.style.cssText = 'width:100%;padding:8px 10px;font-size:15px;border-radius:4px;border:1px solid #666;background:#2a2a3e;color:white;box-sizing:border-box;margin-bottom:14px;';
    box.appendChild(input);

    const statusMsg = document.createElement('div');
    statusMsg.style.cssText = 'font-size:13px;min-height:18px;margin-bottom:10px;';
    box.appendChild(statusMsg);

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:10px;justify-content:center;';

    const submitBtn = document.createElement('button');
    submitBtn.textContent = t('lbSubmitBtn');
    submitBtn.style.cssText = 'padding:8px 20px;background:#2a5a2a;border:1px solid #4a8a4a;color:white;border-radius:4px;cursor:pointer;font-size:14px;';

    const skipBtn = document.createElement('button');
    skipBtn.textContent = t('lbSkipBtn');
    skipBtn.style.cssText = 'padding:8px 20px;background:rgba(80,80,80,0.4);border:1px solid #666;color:white;border-radius:4px;cursor:pointer;font-size:14px;';

    btnRow.appendChild(submitBtn);
    btnRow.appendChild(skipBtn);
    box.appendChild(btnRow);
    popup.appendChild(box);

    function closePopup() {
        popup.remove();
        onDone();
    }

    submitBtn.onclick = () => {
        const name = input.value.trim() || t('lbAnonymous');
        submitBtn.disabled = true;
        skipBtn.disabled = true;
        const data = {
            name: name,
            score: Math.floor(gameState.stats.xpCurrent),
            level: Math.floor(gameState.player.level),
            play_time: Math.floor(gameState.realPlayTime / 1000),
            is_victory: isVictory,
            boss_kill_time: bossKillTime !== null && bossKillTime !== undefined ? Math.floor(bossKillTime) : null,
            version: GAME_INFO.version,
            version_order: Math.floor(parseInt(GAME_INFO.version.replace(/\D/g, '').slice(0, 4)))
        };
        submitScore(data).then(() => {
            statusMsg.textContent = t('lbSubmitOk');
            statusMsg.style.color = '#6f6';
            setTimeout(closePopup, 1200);
        }).catch(() => {
            statusMsg.textContent = t('lbSubmitFail');
            statusMsg.style.color = '#f66';
            submitBtn.disabled = false;
            skipBtn.disabled = false;
        });
    };

    skipBtn.onclick = closePopup;

    document.getElementById('game-container').appendChild(popup);
    setTimeout(() => input.focus(), 50);
}
