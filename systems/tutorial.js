// =============================================================
// 新手教學系統 - showTutorial / 三步驟教學流程
//               spawnTutorialStump / showTutorialCombatHint
//               handleTutorialStumpKill / showTutorialCombatComplete
// 觸發時機：initializeGame() 結束後，若 localStorage 無 tutorialCompleted
// =============================================================
import { gameState, canvas } from './gameState.js';
import { VIEW_W } from './map.js';
import { worldToScreen, wrappedDistance } from './camera.js';
import { pausePlayTimer, resumePlayTimer } from './gameFlow.js';
import {
    STORAGE_KEYS,
    storageGet,
    storageSet,
    storageRemove,
    storageGetJSON,
    storageSetJSON
} from '../storage/index.js';

    // ── 教學內部狀態
    let _step         = 0;       // 0=未啟動 1=步驟一(凍結) 2=步驟二(解凍) 3=步驟三(凍結)
    let _overlay      = null;    // 全螢幕遮罩 div
    let _hlCanvas     = null;    // 教學專用繪圖 canvas（光圈 / 箭頭 / 引導線）
    let _hlCtx        = null;
    let _dialog       = null;    // 目前顯示的提示框 div
    let _raf          = null;    // requestAnimationFrame handle
    let _targetFruit  = null;    // 步驟二目標果子
    let _xpStart      = 0;       // 步驟二開始時的 XP 基準
    let _xpTimer      = null;    // XP 監聽 interval
    let _dnHighlight  = null;    // 步驟三高亮的 DOM 元素
    let _dnFlashTimer = null;    // 步驟三閃爍 setTimeout handle（可清除）

    // ──────────────────────────────────────────────────────────
    // 公開入口
    // ──────────────────────────────────────────────────────────
    function showTutorial() {
        _clearDnFlash();
        _step = 1;
        _startStep1();
    }

    // ══════════════════════════════════════════════════════════
    // 步驟一：凍結 + 歡迎介面
    // ══════════════════════════════════════════════════════════
    function _startStep1() {
        // 1a. 凍結遊戲
        gameState.tutorialOpen = true;
        pausePlayTimer();

        // 1b. 全螢幕暗色遮罩
        _overlay = _el('div', {
            position: 'absolute', top: '0', left: '0',
            width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.75)',
            zIndex: '500',
            pointerEvents: 'none',
        });
        _gc().appendChild(_overlay);

        // 1c. 教學用 canvas（玩家光圈）
        _createHlCanvas();

        // 1d. 動畫：玩家白色光圈（步驟一為靜止畫面，單次繪製 + 小幅脈衝）
        _raf = requestAnimationFrame(_step1Loop);

        // 1e. 歡迎提示框（正中央偏上）
        _dialog = _makeDialog1();
        _gc().appendChild(_dialog);
    }

    function _step1Loop(ts) {
        if (_step !== 1) return;
        _drawPlayerHalo(ts);
        _raf = requestAnimationFrame(_step1Loop);
    }

    function _drawPlayerHalo(ts) {
        if (!_hlCtx) return;
        const vw = _hlCanvas.width;
        const vh = _hlCanvas.height;
        _hlCtx.clearRect(0, 0, vw, vh);

        const ps = worldToScreen(gameState.player.x, gameState.player.y);
        const px = ps.x, py = ps.y;
        const pulse = (Math.sin(ts * 0.003) + 1) / 2;  // 0~1

        // 外層柔光暈
        const outerR = gameState.player.radius + 30 + pulse * 10;
        const g1 = _hlCtx.createRadialGradient(px, py, gameState.player.radius, px, py, outerR);
        g1.addColorStop(0,   `rgba(255,255,255,${0.6 + pulse * 0.3})`);
        g1.addColorStop(0.5, `rgba(255,255,255,${0.25 + pulse * 0.1})`);
        g1.addColorStop(1,   'rgba(255,255,255,0)');
        _hlCtx.beginPath();
        _hlCtx.arc(px, py, outerR, 0, Math.PI * 2);
        _hlCtx.fillStyle = g1;
        _hlCtx.fill();

        // 清晰白邊圓圈
        _hlCtx.save();
        _hlCtx.strokeStyle = `rgba(255,255,255,${0.7 + pulse * 0.3})`;
        _hlCtx.lineWidth = 2.5;
        _hlCtx.beginPath();
        _hlCtx.arc(px, py, gameState.player.radius + 6, 0, Math.PI * 2);
        _hlCtx.stroke();
        _hlCtx.restore();
    }

    function _makeDialog1() {
        const dlg = _dialogBox({
            top: '40%', left: '50%',
            transform: 'translate(-50%, -50%)',
            minWidth: '320px',
        });
        dlg.innerHTML = `
            <div style="font-size:21px;font-weight:bold;color:#FFD700;margin-bottom:10px;line-height:1.4;">
                🐦 你是噪鵑——一隻剛出生的小黑鳥
            </div>
            <div style="font-size:15px;color:#ccc;margin-bottom:22px;">
                這片森林是你的起點
            </div>
        `;
        dlg.appendChild(_btn('我準備好了 →', _endStep1));
        return dlg;
    }

    function _endStep1() {
        if (_raf) { cancelAnimationFrame(_raf); _raf = null; }
        _startStep2();
    }

    // ══════════════════════════════════════════════════════════
    // 步驟二：解凍 + 引導玩家吃果子
    // ══════════════════════════════════════════════════════════
    function _startStep2() {
        _step = 2;

        // 2a. 解凍遊戲
        gameState.tutorialOpen = false;
        resumePlayTimer();

        // 2b. 遮罩改透明（遊戲可運作）
        if (_overlay) _overlay.style.background = 'transparent';

        // 2c. 移除步驟一提示框
        _removeDialog();

        // 2d. 找最近的果子
        _targetFruit = _findNearestFruit();

        // 2e. 步驟二提示框（左上 / 手機版上方置中）
        _dialog = _makeDialog2();
        _gc().appendChild(_dialog);

        // 2f. 記錄基準 XP
        _xpStart = gameState.stats.xpCurrent;

        // 2g. 動畫主循環（果子光暈 + 箭頭 + 引導線，全程顯示）
        _raf = requestAnimationFrame(_step2Loop);

        // 2h. XP 監聽（每 200ms）
        _xpTimer = setInterval(_checkXP, 200);
    }

    function _makeDialog2() {
        const isMobile = gameState.isMobile;
        const dlg = _el('div', {
            position: 'absolute',
            background: 'rgba(20,20,20,0.92)',
            color: 'white',
            borderRadius: '12px',
            padding: '14px 18px',
            fontFamily: 'Arial, sans-serif',
            fontSize: '15px',
            lineHeight: '1.7',
            zIndex: '502',
            pointerEvents: 'none',
            boxShadow: '0 0 18px rgba(255,200,0,0.4)',
            border: '1px solid rgba(255,200,0,0.45)',
            maxWidth: '210px',
            textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
        });

        if (isMobile) {
            // 手機版：上方置中，避開搖桿和攻擊區
            Object.assign(dlg.style, {
                top: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
            });
        } else {
            // 桌機版：左上角
            Object.assign(dlg.style, {
                top: '80px',
                left: '16px',
            });
        }

        dlg.innerHTML = `
            <div style="font-size:16px;font-weight:bold;color:#FFD700;margin-bottom:6px;">🍎 走向發光的果子</div>
            <div>果子 = 經驗值 = 成長</div>
            <div>靠近就能自動吸收</div>
        `;
        return dlg;
    }

    function _step2Loop(ts) {
        if (_step !== 2) return;

        // 若目標果子被吃掉，換一顆
        if (_targetFruit && !gameState.fruits.includes(_targetFruit)) {
            _targetFruit = _findNearestFruit();
        }

        const ctx = _hlCtx;
        const vw  = _hlCanvas.width;
        const vh  = _hlCanvas.height;
        ctx.clearRect(0, 0, vw, vh);

        if (_targetFruit) {
            const fs   = worldToScreen(_targetFruit.x, _targetFruit.y);
            const fx   = fs.x, fy = fs.y;
            const pulse = (Math.sin(ts * 0.004) + 1) / 2;  // 0~1

            // ── 金色光暈脈衝
            const pulseR = 18 + pulse * 14;
            const g = ctx.createRadialGradient(fx, fy, 0, fx, fy, pulseR);
            g.addColorStop(0,   `rgba(255,215,0,${0.65 + pulse * 0.3})`);
            g.addColorStop(0.5, `rgba(255,180,0,${0.3  + pulse * 0.2})`);
            g.addColorStop(1,   'rgba(255,150,0,0)');
            ctx.beginPath();
            ctx.arc(fx, fy, pulseR, 0, Math.PI * 2);
            ctx.fillStyle = g;
            ctx.fill();

            // ── 閃爍向下箭頭 ↓
            const arrowY  = fy - 22 - pulse * 4;
            const alpha   = 0.55 + pulse * 0.45;
            ctx.save();
            ctx.globalAlpha  = alpha;
            ctx.fillStyle    = '#FFD700';
            ctx.font         = 'bold 22px Arial';
            ctx.textAlign    = 'center';
            ctx.textBaseline = 'bottom';
            ctx.shadowColor  = '#FFD700';
            ctx.shadowBlur   = 10;
            ctx.fillText('↓', fx, arrowY);
            ctx.restore();

            // ── 紅色虛線引導線（玩家 → 果子，全程顯示，終點每幀更新）
            const ps  = worldToScreen(gameState.player.x, gameState.player.y);
            const ppx = ps.x, ppy = ps.y;
            ctx.save();
            ctx.globalAlpha    = 0.75;
            ctx.strokeStyle    = '#FF4444';
            ctx.lineWidth      = 3;
            ctx.setLineDash([8, 6]);
            ctx.lineDashOffset = -(ts * 0.05) % 14;
            ctx.beginPath();
            ctx.moveTo(ppx, ppy);
            ctx.lineTo(fx, fy);
            ctx.stroke();
            ctx.restore();
        }

        _raf = requestAnimationFrame(_step2Loop);
    }

    function _checkXP() {
        if (_step !== 2) return;
        if (gameState.stats.xpCurrent > _xpStart) {
            // 成功！清除計時器
            _clearTimers();
            // 金色閃光 → 進入步驟三
            _goldenFlash(_startStep3);
        }
    }

    function _goldenFlash(callback) {
        const flash = _el('div', {
            position: 'absolute', top: '0', left: '0',
            width: '100%', height: '100%',
            background: 'rgba(255,200,0,0.3)',
            zIndex: '510',
            pointerEvents: 'none',
            opacity: '1',
            transition: 'opacity 0.3s ease',
        });
        _gc().appendChild(flash);
        // 讓瀏覽器完成第一幀再開始淡出
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                flash.style.opacity = '0';
                setTimeout(() => {
                    flash.remove();
                    if (callback) callback();
                }, 320);
            });
        });
    }

    // ══════════════════════════════════════════════════════════
    // 步驟三：再次凍結 + 日夜說明
    // ══════════════════════════════════════════════════════════
    function _startStep3() {
        _step = 3;

        // 停止步驟二動畫
        if (_raf) { cancelAnimationFrame(_raf); _raf = null; }

        // 清除教學 canvas
        if (_hlCtx) _hlCtx.clearRect(0, 0, _hlCanvas.width, _hlCanvas.height);

        // 凍結遊戲
        gameState.tutorialOpen = true;
        pausePlayTimer();

        // 遮罩重新變暗
        if (_overlay) _overlay.style.background = 'rgba(0,0,0,0.75)';

        // 移除步驟二提示框
        _removeDialog();

        // 高亮日夜指示器
        _highlightDayNight();

        // 步驟三提示框（正中央）
        _dialog = _makeDialog3();
        _gc().appendChild(_dialog);
    }

    function _highlightDayNight() {
        // 優先找 sunmoonCanvas（日夜圖示），其次 minimap-info（整個資訊列）
        const target = document.getElementById('sunmoonCanvas') ||
                       document.getElementById('minimap-info');
        if (!target) return;
        _dnHighlight = target;

        let _phase = 0;
        function _flash() {
            if (_step !== 3) {
                _dnFlashTimer = null;
                return;
            }
            _phase++;
            const bright = _phase % 2 === 0;
            target.style.boxShadow    = bright ? '0 0 14px 5px #FFD700' : '0 0 5px 2px rgba(255,215,0,0.5)';
            target.style.outline      = bright ? '2px solid #FFD700'     : '2px solid rgba(255,215,0,0.4)';
            target.style.borderRadius = '4px';
            _dnFlashTimer = setTimeout(_flash, 500);
        }
        _flash();
    }

    function _clearDnFlash() {
        if (_dnFlashTimer) {
            clearTimeout(_dnFlashTimer);
            _dnFlashTimer = null;
        }
        if (_dnHighlight) {
            _dnHighlight.style.boxShadow    = '';
            _dnHighlight.style.outline      = '';
            _dnHighlight.style.borderRadius = '';
            _dnHighlight = null;
        }
    }

    function _makeDialog3() {
        const dlg = _dialogBox({
            top: '50%', left: '50%',
            transform: 'translate(-50%, -58%)',
            minWidth: '320px',
            textAlign: 'center',
            padding: '28px 36px',
        });
        dlg.innerHTML = `
            <div style="font-size:20px;font-weight:bold;color:#FFD700;margin-bottom:12px;">
                🌙 每隔一段時間，夜晚會降臨
            </div>
            <div style="font-size:15px;line-height:1.8;">
                夜晚 = 危險的精英怪出沒<br>
                擊敗牠 → 進入下一個白天
            </div>
            <div style="margin-top:14px;padding-top:14px;
                        border-top:1px solid rgba(255,255,255,0.15);
                        font-weight:bold;color:#FFD700;font-size:16px;">
                撐過四個夜晚
            </div>
            <div style="font-size:15px;line-height:1.8;">
                在第四夜擊敗 Boss，你就贏了
            </div>
        `;
        dlg.appendChild(_btn('明白了，出發！→', _endTutorial));
        return dlg;
    }

    // ══════════════════════════════════════════════════════════
    // 結束教學
    // ══════════════════════════════════════════════════════════
    function _endTutorial() {
        _step = 0;

        // 停止所有計時器 / 動畫
        _clearTimers();
        _clearDnFlash();
        if (_raf) { cancelAnimationFrame(_raf); _raf = null; }

        // 移除所有教學元素
        _removeDialog();
        if (_overlay)   { _overlay.remove();   _overlay   = null; }
        if (_hlCanvas)  { _hlCanvas.remove();   _hlCanvas  = null; _hlCtx = null; }

        // 標記完成
        storageSet(STORAGE_KEYS.TUTORIAL_COMPLETED, 'true');
        gameState.tutorialOpen = false;
        resumePlayTimer();
    }

    // ══════════════════════════════════════════════════════════
    // 工具函式
    // ══════════════════════════════════════════════════════════

    /** 取得 game-container */
    function _gc() {
        return document.getElementById('game-container');
    }

    /** 建立教學用 canvas，覆蓋在遊戲 canvas 正上方 */
    function _createHlCanvas() {
        _hlCanvas = document.createElement('canvas');
        _hlCanvas.width  = canvas.width;   // 與遊戲 canvas 相同
        _hlCanvas.height = canvas.height;
        Object.assign(_hlCanvas.style, {
            position: 'absolute',
            top: '0', left: '0',
            width: '100%', height: '100%',
            zIndex: '501',
            pointerEvents: 'none',
        });
        _gc().appendChild(_hlCanvas);
        _hlCtx = _hlCanvas.getContext('2d');
    }

    /**
     * 建立一個標準對話框 div（可自訂定位樣式）
     * @param {Object} posStyle - position 相關的額外 CSS 屬性
     */
    function _dialogBox(posStyle) {
        return _el('div', Object.assign({
            position: 'absolute',
            background: 'rgba(20,20,20,0.95)',
            color: 'white',
            borderRadius: '16px',
            padding: '28px 36px',
            fontFamily: 'Arial, sans-serif',
            fontSize: '15px',
            lineHeight: '1.7',
            zIndex: '502',
            pointerEvents: 'all',
            boxShadow: '0 0 30px rgba(0,0,0,0.85)',
            border: '1px solid rgba(255,255,255,0.12)',
            textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
        }, posStyle));
    }

    /** 建立黃色確認按鈕 */
    function _btn(text, onClick) {
        const b = document.createElement('button');
        Object.assign(b.style, {
            display: 'block',
            margin: '0 auto',
            marginTop: '18px',
            padding: '10px 28px',
            background: 'rgba(255,200,0,0.88)',
            color: '#222',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontFamily: 'Arial, sans-serif',
        });
        b.textContent = text;
        b.onmouseover = () => { b.style.background = 'rgba(255,225,0,1)'; };
        b.onmouseout  = () => { b.style.background = 'rgba(255,200,0,0.88)'; };
        b.onclick     = onClick;
        return b;
    }

    /** 建立一個 div 並直接 assign style */
    function _el(tag, styles) {
        const e = document.createElement(tag);
        Object.assign(e.style, styles);
        return e;
    }

    /** 移除目前提示框 */
    function _removeDialog() {
        if (_dialog) { _dialog.remove(); _dialog = null; }
    }

    /** 清除步驟二的 interval 計時器 */
    function _clearTimers() {
        if (_xpTimer) { clearInterval(_xpTimer); _xpTimer = null; }
    }

    /** 找到距離玩家最近的果子 */
    function _findNearestFruit() {
        if (!gameState.fruits || gameState.fruits.length === 0) return null;
        const px = gameState.player.x;
        const py = gameState.player.y;
        let nearest = null, minDist = Infinity;
        for (const f of gameState.fruits) {
            const d = wrappedDistance(px, py, f.x, f.y);
            if (d < minDist) { minDist = d; nearest = f; }
        }
        return nearest;
    }

    // ══════════════════════════════════════════════════════════
    // 第二階段：戰鬥教學（Combat Tutorial）
    // ══════════════════════════════════════════════════════════

    let _combatHintEl = null;  // 戰鬥提示框的 DOM 元素

    /** 生成教學木樁，並顯示戰鬥提示框 */
    function spawnTutorialStump() {
        const p = gameState.player;
        gameState.tutorialStump = {
            x: p.x,
            y: p.y - 150,
            hp: 30,
            maxHp: 30,
            radius: 18,
            speed: 0,
            damage: 0,
            color: '#8B4513',
            name: '木樁',
            isTutorialStump: true,
        };
        gameState.tutorialCombatActive = true;
        showTutorialCombatHint();
    }

    /** 戰鬥教學提示框（左上角 / 手機版上方置中） */
    function showTutorialCombatHint() {
        // 若舊的提示框存在，先移除
        if (_combatHintEl) { _combatHintEl.remove(); _combatHintEl = null; }
        const old = document.getElementById('tutorial-combat-hint');
        if (old) old.remove();

        const isMobile  = gameState.isMobile;
        const atkKey    = (gameState.settings && gameState.settings.keys && gameState.settings.keys.attack) || ' ';
        const atkKeyStr = atkKey === ' ' ? '空白鍵' : `「${atkKey}」`;
        const atkDesc   = isMobile ? '點擊右下角 ⚔️ 攻擊' : `按下 ${atkKeyStr} 攻擊`;

        const hint = _el('div', {
            position: 'absolute',
            background: 'rgba(20,20,20,0.92)',
            color: 'white',
            borderRadius: '12px',
            padding: '14px 18px',
            fontFamily: 'Arial, sans-serif',
            fontSize: '15px',
            lineHeight: '1.7',
            zIndex: '502',
            pointerEvents: 'none',
            boxShadow: '0 0 18px rgba(255,100,80,0.4)',
            border: '1px solid rgba(255,120,100,0.45)',
            maxWidth: '220px',
            textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
        });
        hint.id = 'tutorial-combat-hint';

        if (isMobile) {
            Object.assign(hint.style, { top: '10px', left: '50%', transform: 'translateX(-50%)' });
        } else {
            Object.assign(hint.style, { top: '80px', left: '16px' });
        }

        hint.innerHTML = `
            <div style="font-size:16px;font-weight:bold;color:#FF9977;margin-bottom:6px;">⚔️ 前方有一根木樁</div>
            <div>靠近並攻擊它！</div>
            <div style="font-size:12px;color:#aaa;margin-top:4px;">${atkDesc}</div>
        `;
        _gc().appendChild(hint);
        _combatHintEl = hint;
    }

    /** 木樁被打死後的處理 */
    function handleTutorialStumpKill() {
        // 1. 移除木樁
        gameState.tutorialStump       = null;
        gameState.tutorialCombatActive = false;

        // 2. 移除戰鬥提示框
        if (_combatHintEl) { _combatHintEl.remove(); _combatHintEl = null; }
        const hintEl = document.getElementById('tutorial-combat-hint');
        if (hintEl) hintEl.remove();

        // 3. 短暫凍結畫面（0.5 秒）
        gameState.tutorialOpen = true;
        pausePlayTimer();

        setTimeout(() => {
            // 4. 顯示完成訊息（玩家頭頂附近）
            showTutorialCombatComplete();

            // 5. 2 秒後自動消失，結束戰鬥教學
            setTimeout(() => {
                const el = document.getElementById('tutorial-combat-complete');
                if (el) el.remove();
                storageSet(STORAGE_KEYS.TUTORIAL_COMBAT_DONE, 'true');
                gameState.tutorialOpen = false;
                resumePlayTimer();
            }, 2000);
        }, 500);
    }

    /** 完成訊息（玩家正上方，無按鈕，2 秒自動消失） */
    function showTutorialCombatComplete() {
        const old = document.getElementById('tutorial-combat-complete');
        if (old) old.remove();

        // 以玩家當前螢幕座標定位
        const ps  = worldToScreen(gameState.player.x, gameState.player.y);
        const BOX_W = 200;
        const left  = Math.max(8, Math.min(ps.x - BOX_W / 2, (VIEW_W || canvas.width) - BOX_W - 8));
        const top   = Math.max(8, ps.y - 110);

        const el = _el('div', {
            position:   'absolute',
            left:       left + 'px',
            top:        top  + 'px',
            width:      BOX_W + 'px',
            background: 'rgba(20,20,20,0.92)',
            color:      'white',
            borderRadius: '12px',
            padding:    '14px 18px',
            fontFamily: 'Arial, sans-serif',
            fontSize:   '15px',
            lineHeight: '1.7',
            zIndex:     '502',
            pointerEvents: 'none',
            textAlign:  'center',
            boxShadow:  '0 0 20px rgba(255,200,0,0.5)',
            border:     '1px solid rgba(255,215,0,0.5)',
            textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
        });
        el.id = 'tutorial-combat-complete';
        el.innerHTML = `
            <div style="font-size:17px;font-weight:bold;color:#FFD700;margin-bottom:8px;">⚔️ 攻擊學會了！</div>
            <div style="font-size:14px;color:#ccc;">現在去獵殺敵人<br>收集更多器官</div>
        `;
        _gc().appendChild(el);
    }

function resetTutorial() {
    _step = 0;
    _clearDnFlash();
    _clearTimers();
    if (_raf) { cancelAnimationFrame(_raf); _raf = null; }
}

export { showTutorial, spawnTutorialStump, handleTutorialStumpKill, resetTutorial };
