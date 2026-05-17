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

    let logicW, scale;
    if (gameState.orientation === 'landscape') {
        logicW = 1600;
        scale  = vw / 1600;
    } else {
        // 直向：1000×900 邏輯解析度，縮放填滿螢幕寬度
        logicW = 1000;
        scale  = vw / 1000;
    }
    _setViewSize(logicW, 900);
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

function _joyZone(x, y) {
    const vw = window.innerWidth, vh = window.innerHeight;
    if (gameState.orientation === 'landscape') return x > vw * 0.7 && y > vh * 0.2 && y < vh * 0.8;
    return x > vw / 2 && y > vh * 0.6;
}

function _getAttackBtnPos() {
    const vw = window.innerWidth, vh = window.innerHeight;
    return { x: vw / 4, y: vh * 0.6 + (vh * 0.4) / 2 };
}

function _attackZone(x, y) {
    const vw = window.innerWidth, vh = window.innerHeight;
    if (gameState.orientation === 'landscape') return x < vw * 0.3 && y > vh * 0.2 && y < vh * 0.8;
    const btn = _getAttackBtnPos();
    const dx = x - btn.x, dy = y - btn.y;
    return Math.sqrt(dx * dx + dy * dy) < ATK_RADIUS + 10;
}

function _renderMobileOverlay() {
    const jc = document.getElementById('joystick-canvas');
    if (!jc) return;
    const jctx = jc.getContext('2d');
    jctx.clearRect(0, 0, jc.width, jc.height);
    const vw = window.innerWidth, vh = window.innerHeight;

    if (gameState.orientation === 'landscape') {
        // ── 攻擊區提示：左側 30% × 垂直 20%~80% 中央
        jctx.save();
        jctx.globalAlpha = 0.2;
        jctx.font = '60px Arial';
        jctx.textAlign = 'center';
        jctx.textBaseline = 'middle';
        jctx.fillStyle = 'white';
        jctx.fillText('⚔️', vw * 0.15, vh * 0.5);
        jctx.restore();

        // ── 搖桿區：固定底環（右側 30% 中央，常駐顯示）
        const joyCx = vw * 0.85, joyCy = vh * 0.5;
        jctx.beginPath();
        jctx.arc(joyCx, joyCy, JOY_OUTER, 0, Math.PI * 2);
        jctx.strokeStyle = 'rgba(255,255,255,0.2)';
        jctx.lineWidth = 2;
        jctx.stroke();

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
        // ── 直向：攻擊圓形按鈕
        const btn = _getAttackBtnPos();
        jctx.save();
        jctx.beginPath();
        jctx.arc(btn.x, btn.y, ATK_RADIUS, 0, Math.PI * 2);
        jctx.fillStyle = 'rgba(255,255,255,0.18)';
        jctx.fill();
        jctx.strokeStyle = 'rgba(255,255,255,0.45)';
        jctx.lineWidth = 2;
        jctx.stroke();
        jctx.font = '26px Arial';
        jctx.textAlign = 'center';
        jctx.textBaseline = 'middle';
        jctx.fillStyle = 'white';
        jctx.fillText('⚔️', btn.x, btn.y);
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
    return gameState.organSelectionActive || gameState.settingsOpen ||
           gameState.skillTreeOpen || gameState.gameOver || gameState.victory;
}

function _attachJoystickListeners() {
    if (_joyDocListeners) return;

    const onStart = (e) => {
        if (_joyPaused()) return;
        let handled = false;
        for (const touch of e.changedTouches) {
            const x = touch.clientX, y = touch.clientY;

            // 攻擊區
            if (_attackZone(x, y)) {
                handled = true;
                playerAttack();
                continue;
            }

            // 搖桿區
            if (_joyTouchId !== null) continue;
            if (!_joyZone(x, y)) continue;
            handled = true;
            _joyActive  = true;
            _joyTouchId = touch.identifier;
            if (gameState.orientation === 'landscape') {
                _joyBaseX = window.innerWidth * 0.85;
                _joyBaseY = window.innerHeight * 0.5;
            } else {
                _joyBaseX = x; _joyBaseY = y;
            }
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

    // 12. 繪製小地圖
    drawMinimap();
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
    panel.appendChild(keySec);

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

function showGuide(startPage) {
    if (document.getElementById('guide-overlay')) return;
    const pages = LANG[gameState.language]?.ui?.guidePages || LANG['zh-TW'].ui.guidePages;
    let cur = Math.min(Math.max(0, startPage || 0), pages.length - 1);

    const overlay = document.createElement('div');
    overlay.id = 'guide-overlay';
    overlay.dataset.page = String(cur);
    overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.82);display:flex;align-items:center;justify-content:center;z-index:215;pointer-events:all;color:white;font-family:Arial,sans-serif;';

    const panel = document.createElement('div');
    panel.style.cssText = 'background:#1c1c1c;border:1px solid #555;border-radius:10px;padding:24px 28px;width:90%;max-width:520px;max-height:85vh;overflow-y:auto;box-sizing:border-box;text-align:center;';

    const titleBar = document.createElement('div');
    titleBar.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;';
    const pageLbl = document.createElement('div');
    pageLbl.style.cssText = 'font-size:13px;color:#999;';
    const headerTitle = document.createElement('div');
    headerTitle.style.cssText = 'font-size:22px;font-weight:bold;color:#FFD700;';
    const spacer = document.createElement('div');
    spacer.style.cssText = 'min-width:60px;';
    titleBar.appendChild(spacer); titleBar.appendChild(headerTitle); titleBar.appendChild(pageLbl);
    panel.appendChild(titleBar);

    const subTitle = document.createElement('div');
    subTitle.style.cssText = 'font-size:14px;color:#aaa;margin-bottom:14px;';
    panel.appendChild(subTitle);

    // 內容
    const content = document.createElement('div');
    content.style.cssText = 'text-align:left;font-size:15px;line-height:1.9;background:rgba(255,255,255,0.04);border:1px solid #333;border-radius:6px;padding:18px 22px;margin-bottom:18px;';
    panel.appendChild(content);

    // 導覽
    const navRow = document.createElement('div');
    navRow.style.cssText = 'display:flex;gap:10px;align-items:center;justify-content:space-between;';
    const prevBtn = document.createElement('button');
    prevBtn.style.cssText = 'padding:8px 18px;font-size:18px;background:#2a2a2a;color:white;border:1px solid #555;border-radius:4px;cursor:pointer;';
    const nextBtn = document.createElement('button');
    nextBtn.style.cssText = prevBtn.style.cssText;
    navRow.appendChild(prevBtn);
    const closeBtn = document.createElement('button');
    closeBtn.style.cssText = 'padding:8px 24px;font-size:14px;background:#2a5a2a;color:white;border:1px solid #4a8a4a;border-radius:4px;cursor:pointer;';
    navRow.appendChild(closeBtn);
    navRow.appendChild(nextBtn);
    panel.appendChild(navRow);

    function render() {
        const allPages = LANG[gameState.language]?.ui?.guidePages || LANG['zh-TW'].ui.guidePages;
        const p = allPages[cur];
        headerTitle.textContent = t('guideTitle');
        pageLbl.textContent = t('guidePageFmt', { cur: cur + 1, total: allPages.length });
        subTitle.textContent = p.title;
        content.innerHTML = p.lines.map(l => '<div style="margin-bottom:6px;">' + l.replace(/&/g,'&amp;').replace(/</g,'&lt;') + '</div>').join('');
        prevBtn.textContent = t('guidePrev');
        nextBtn.textContent = t('guideNext');
        closeBtn.textContent = t('close');
        prevBtn.disabled = (cur === 0);
        nextBtn.disabled = (cur === allPages.length - 1);
        prevBtn.style.opacity = prevBtn.disabled ? '0.35' : '1';
        nextBtn.style.opacity = nextBtn.disabled ? '0.35' : '1';
        overlay.dataset.page = String(cur);
    }
    prevBtn.onclick = () => { if (cur > 0) { cur--; render(); } };
    nextBtn.onclick = () => {
        const allPages = LANG[gameState.language]?.ui?.guidePages || LANG['zh-TW'].ui.guidePages;
        if (cur < allPages.length - 1) { cur++; render(); }
    };
    closeBtn.onclick = hideGuide;

    overlay.appendChild(panel);
    document.getElementById('game-container').appendChild(overlay);
    render();
}

function hideGuide() {
    const el = document.getElementById('guide-overlay');
    if (el) el.remove();
}

// =============================================================
// 開始畫面
// =============================================================

function showMapSelect() {
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
        { id: 'easy',   key: 'diffEasy',   map: typeof EASY_MAP !== 'undefined' ? EASY_MAP : null, locked: false },
        { id: 'normal', key: 'diffNormal',  map: null, locked: true },
        { id: 'hard',   key: 'diffHard',    map: null, locked: true },
        { id: 'hell',   key: 'diffHell',    map: null, locked: true },
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
        overlay.remove();
        initializeGame();
    };
    btnRow.appendChild(startBtn);
    overlay.appendChild(btnRow);

    document.getElementById('game-container').appendChild(overlay);
}

function showStartScreen() {
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
    guideBtn.textContent = t('guide');
    guideBtn.onclick = () => showGuide(0);
    overlay.appendChild(guideBtn);

    const settingsBtn = document.createElement('button');
    settingsBtn.style.cssText = menuBtnStyle + 'background:rgba(50,50,90,0.3);border:1px solid #4a4a8a;';
    settingsBtn.textContent = t('settings');
    settingsBtn.onclick = () => showSettings(true);
    overlay.appendChild(settingsBtn);

    const footerEl = document.createElement('div');
    footerEl.style.cssText = 'position:absolute;bottom:16px;font-size:12px;color:#555;';
    footerEl.textContent = '© 2026 ' + GAME_INFO.author + '  |  ' + GAME_INFO.version;
    overlay.appendChild(footerEl);

    document.getElementById('game-container').appendChild(overlay);
}
