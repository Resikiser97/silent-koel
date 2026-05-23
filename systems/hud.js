// =============================================================
// HUD 系統 - 遊戲畫面渲染 / HUD 更新 / 小地圖 / 上方血條
//
// 模組職責：
//   - drawGame()：每幀主渲染函式，依序繪製地形/生物/玩家/特效/HUD
//   - updateUI()：每幀更新 DOM HUD（HP條/XP條/時間/日夜狀態）
//   - drawTopBarUI()：玩家附近有精英/Boss/巨人化/Alpha時顯示上方血條
//   - drawMinimap()：右上角小地圖，含霧、生物點、日月圖示
//   - drawTreasures()：繪製地圖上的寶物
//
// 繪製順序（drawGame 內部）：
//   1. 地形（drawTerrain）
//   2. 樹木
//   3. 寶物（drawTreasures）
//   4. 屍體（drawCorpses）
//   5. 中立生物（drawNeutralCreatures）
//   6. 敵意生物（drawHostileCreatures）
//   7. 教學木樁（7c，tutorialStump）
//   8. 精英（drawEliteCreature）
//   9. Boss
//   10. 玩家
//   11. 浮動文字
//   12. 器官 UI（drawOrganUI）
//   13. 上方血條（drawTopBarUI）
//   14. 小地圖（drawMinimap）
//   15. 手機疊加層（_renderMobileOverlay）
//
// 跨模組依賴：
//   - systems/gameState.js：gameState 全域狀態
//   - systems/camera.js：worldToScreen()
//   - systems/map.js：drawTerrain()
//   - systems/combat.js：drawCorpses() / drawBones()
//   - systems/mobile.js：_renderMobileOverlay()
//   - systems/organs.js：drawOrganUI()
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

    // Alpha 怪（金色閃爍 + α 文字）
    if (gameState.alphaCreature && gameState.alphaCreature.hp > 0 && isRevealed(gameState.alphaCreature.x, gameState.alphaCreature.y)) {
        const m = toMM(gameState.alphaCreature.x, gameState.alphaCreature.y);
        const pulse = Math.sin(Date.now() / 300) > 0;
        mctx.fillStyle = pulse ? '#FFD700' : '#FFA500';
        mctx.beginPath(); mctx.arc(m.x, m.y, 4, 0, Math.PI * 2); mctx.fill();
        mctx.fillStyle = '#FFD700';
        mctx.font = 'bold 8px Arial';
        mctx.textBaseline = 'alphabetic';
        mctx.fillText('α', m.x + 3, m.y - 3);
        mctx.font = '10px Arial';
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
    let displayName = _getCreatureDisplayName(target) || '目標';
    let barColor    = '#AA22CC'; // 預設：精英紫色
    if (target === gameState.boss) {
        displayName = target.name || 'Boss';
        barColor    = '#CC2200';
    } else if (target === gameState.eliteCreature) {
        displayName = '★★ 精英 ' + (target.name || '');
        barColor    = '#AA22CC';
    } else if (target.isAlpha) {
        displayName = _getCreatureDisplayName(target) + '（Alpha）';
        barColor    = '#FFD700';
    } else if (target.isGiantized) {
        displayName = _getCreatureDisplayName(target) + '（巨人化）';
        barColor    = '#FF8800';
    } else if (target.isKiller) {
        barColor    = '#FF8800'; // 殺手化橙色血條
    }

    // 繪製 UI（頂部中央，寬400，高50）
    const barW = 400, barH = 50;
    const x = (VIEW_W - barW) / 2;

    // 動態偵測左上角 UI 高度，換算為 Canvas 邏輯座標
    let topBarY = 10;
    const tlEl = document.getElementById('top-left');
    if (tlEl) {
        const gc = document.getElementById('game-container');
        const scaleMatch = gc ? gc.style.transform.match(/scale\(([^)]+)\)/) : null;
        const scale = scaleMatch ? parseFloat(scaleMatch[1]) : 1;
        topBarY = (tlEl.offsetHeight / scale) + 8;
    }

    ctx.save();
    ctx.globalAlpha = alpha;

    // 半透明背景框
    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    if (ctx.roundRect) {
        ctx.beginPath(); ctx.roundRect(x, topBarY, barW, barH, 6); ctx.fill();
    } else {
        ctx.fillRect(x, topBarY, barW, barH);
    }

    // 目標名稱
    ctx.fillStyle = target.isAlpha ? '#FFD700' : '#FFFFFF';
    ctx.font = 'bold 13px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(displayName, x + barW / 2, topBarY + 5);

    // 血條底色
    const hpBarX = x + 10, hpBarY = topBarY + 24, hpBarW = barW - 20, hpBarH = 10;
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
        x + barW / 2, topBarY + 37
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

    // 7. 繪製 Boss（純 Canvas 幾何形狀，見 systems/boss.js drawBoss）
    drawBoss();

    // 7b. 繪製精英怪
    drawEliteCreature();

    // 7c. 繪製教學木樁（若存在且 hp > 0）
    if (gameState.tutorialStump && gameState.tutorialStump.hp > 0) {
        const st  = gameState.tutorialStump;
        const ss  = worldToScreen(st.x, st.y);
        if (ss.x >= -80 && ss.x <= VIEW_W + 80 && ss.y >= -80 && ss.y <= VIEW_H + 80) {
            // 棕色圓形本體（帶光暈）
            ctx.save();
            ctx.shadowColor = 'rgba(139,69,19,0.9)';
            ctx.shadowBlur  = 14;
            ctx.fillStyle   = st.color;
            ctx.beginPath();
            ctx.arc(ss.x, ss.y, st.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            // 名稱標籤
            ctx.save();
            ctx.shadowColor = '#000'; ctx.shadowBlur = 3;
            ctx.fillStyle   = '#FFFFFF';
            ctx.font        = '12px Arial';
            ctx.textAlign   = 'center';
            ctx.fillText(st.name, ss.x, ss.y - st.radius - 10);
            ctx.restore();
            // 血條
            const _bW = 36, _bH = 5;
            const _bX = ss.x - _bW / 2;
            const _bY = ss.y - st.radius - 22;
            ctx.fillStyle = '#3A1A00';
            ctx.fillRect(_bX, _bY, _bW, _bH);
            ctx.fillStyle = '#CC5500';
            ctx.fillRect(_bX, _bY, _bW * (st.hp / st.maxHp), _bH);
        }
    }

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

    // 9e. 沙暴螢幕外圈遮罩（蠍王血量<40%觸發，所有世界物件後、UI前）
    _drawSandStormOverlay();

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

    // 第三行：變異器官圖標（⚗️ Lv.X + 紅點）
    const mutRow = document.createElement('div');
    mutRow.id = 'mutation-icon-row';
    mutRow.style.cssText = [
        'display:flex', 'align-items:center', 'gap:5px',
        'margin-top:5px', 'cursor:pointer', 'pointer-events:all',
        'padding:2px 4px', 'border-radius:4px',
        'transition:background 0.15s', 'position:relative'
    ].join(';');
    mutRow.title = '⚗️ 變異器官（點擊升級）';
    mutRow.addEventListener('mouseenter', () => {
        mutRow.style.background = 'rgba(255,215,0,0.12)';
    });
    mutRow.addEventListener('mouseleave', () => {
        mutRow.style.background = '';
    });
    mutRow.addEventListener('click', () => {
        if (typeof showMutationPanel === 'function') showMutationPanel();
    });

    const mutIcon = document.createElement('span');
    mutIcon.style.cssText = 'font-size:15px;line-height:1;flex-shrink:0;';
    mutIcon.textContent = '⚗️';

    const mutLvText = document.createElement('span');
    mutLvText.id = 'mutation-level-text';
    mutLvText.style.cssText = 'font-size:12px;color:#FFD700;text-shadow:1px 1px 2px #000;';
    mutLvText.textContent = 'Lv.0';

    const mutRedDot = document.createElement('span');
    mutRedDot.id = 'mutation-red-dot';
    mutRedDot.style.cssText = [
        'width:8px', 'height:8px', 'border-radius:50%',
        'background:#FF3300', 'display:none',
        'flex-shrink:0'
    ].join(';');

    mutRow.appendChild(mutIcon);
    mutRow.appendChild(mutLvText);
    mutRow.appendChild(mutRedDot);

    wrap.appendChild(row1);
    wrap.appendChild(heartsCanvas);
    wrap.appendChild(mutRow);
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

    // ── 更新變異器官圖標（等級與紅點）
    const mutData = gameState.mutationData;
    if (mutData) {
        const mutLvEl = document.getElementById('mutation-level-text');
        if (mutLvEl) {
            const totalLv = (mutData.levels.fang || 0) + (mutData.levels.tail || 0) +
                            (mutData.levels.wing || 0) + (mutData.levels.eye  || 0);
            mutLvEl.textContent = '變異器官 ⚗️ Lv.' + totalLv;
        }
        const mutDotEl = document.getElementById('mutation-red-dot');
        if (mutDotEl) {
            mutDotEl.style.display = mutData.hasNewPoints ? 'inline-block' : 'none';
        }
        // 可升級時脈動動畫
        const mutRowEl = document.getElementById('mutation-icon-row');
        if (mutRowEl) {
            if (mutData.hasNewPoints) {
                mutRowEl.classList.add('mutation-pulse');
            } else {
                mutRowEl.classList.remove('mutation-pulse');
            }
        }
    }

    // 小地圖難度標籤（八）
    const diffEl = document.getElementById('minimap-difficulty');
    if (diffEl) {
        diffEl.textContent = gameState.currentMap
            ? (gameState.currentMap.name === '普通' ? '⚔️ 普通' : '🌿 簡單')
            : '🌿 簡單';
    }
    console.log && false; // [v0.47.0] 七+八+十: HUD 更新完成
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
