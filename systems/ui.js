// =============================================================
// UI 系統 - Tooltip / drawGame / updateUI / drawTreasures
//           Settings / updateTimer / Dev Mode
//           showGuide / hideGuide / showStartScreen
// =============================================================

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
}

function updateUI() {
    const p = gameState.player;
    const lvThreshold = 100 + (p.level - 1) * 50;
    const barPct = Math.min(1, p.levelXP / lvThreshold);
    document.getElementById('top-left').innerHTML =
        '<div class="status-line">HP: ' + Math.round(gameState.stats.hpCurrent) + '/' + gameState.stats.hpMax + '</div>' +
        '<div class="status-line">Lv.' + p.level + '  XP: ' + p.levelXP + '/' + lvThreshold + '</div>' +
        '<div style="width:120px;height:6px;background:#333;border-radius:3px;margin-top:2px;">' +
        '<div style="width:' + Math.round(barPct * 100) + '%;height:100%;background:#00CC00;border-radius:3px;"></div>' +
        '</div>';

    // 右上角：時間、日夜狀態、地形
    document.getElementById('time-display').innerText = t('timeLabel') + ': ' + gameState.stats.timeStatus;
    const dayEl = document.getElementById('day-display');
    const phaseLabel = gameState.isNight ? t('phaseNight') : t('phaseDay');
    dayEl.innerText = t('dayCycleFormat', { phase: phaseLabel });
    dayEl.style.color = gameState.isNight ? 'orange' : '';
    const biomeIcons = { forest: t('biomeForest'), ocean: t('biomeOcean'), desert: t('biomeDesert') };
    const biomeEl = document.getElementById('biome-display');
    if (biomeEl) biomeEl.innerText = biomeIcons[getBiome(gameState.player.x, gameState.player.y)] || '';

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
        }
    } catch(e) {}
    applyLanguage(gameState.language);
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
    startBtn.onclick = () => { overlay.remove(); initializeGame(); };
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
