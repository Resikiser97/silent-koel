// =============================================================
// UI 系統 - showTooltip / hideTooltip / showAlphaAnnouncement
//           loadSettings / saveSettings / switchLanguage
//           showSettings / hideSettings / updateTimer
//           toggleDevMode / devAddXP / devAddHP / devFullHP
//           devSpawnFruits / devKillHostiles / devSpawnNeutral / devSpawnHostile
//           devFastForward / devRewind / devToggleDayNight
//           showGuide / hideGuide / showGuideStory
//           getOrganDisplayName / buildEvoLevelDesc / showCompendium
//           showMapSelect / showStartScreen / showPatchNotes / checkPatchNotesPopup
// （drawGame / updateUI / drawTopBarUI / drawMinimap / drawTreasures 已移至 systems/hud.js）
// =============================================================

// _lbDifficulty / _top10Difficulty / _diffKey() 已移至 systems/leaderboard.js

// drawGame() / updateUI() / drawTopBarUI() / drawMinimap() / drawTreasures() 已移至 systems/hud.js

// ── Tooltip 全域變數
import { gameState, DEFAULT_SETTINGS } from './gameState.js';
import { GAME_INFO } from '../config/gameConfig.js';
import { CHARACTERS, CHARACTERS_COMING_SOON } from '../config/characters.js';
import { ORGANS, HIDDEN_ORGANS, COMBOS } from '../config/organs.js';
import { EVOLUTION_PATHS, SKILLS } from '../config/evolution.js';
import { PATCH_NOTES } from '../config/patchnotes.js';
import { EASY_MAP } from '../map/easymap.js';
import { NORMAL_MAP } from '../map/normalmap.js';
import { HARD_MAP } from '../map/hardmap.js';
import { COMPENDIUM_DATA } from '../config/compendium_data.js';
import { LANG, LANG_LIST, t, applyLanguage } from '../lang.js';
import { AudioManager, playIntroTheme } from './audio.js';
import { applyDeviceMode, _effectiveMobile } from './mobile.js';
import { addXP } from './player.js';
import { spawnFruit } from './spawning.js';
import { getDayNightPhaseIndex } from './daynight.js';
import { buildSkillTreeOverlay, showSkillTree, saveLastRunOrgans, _skillTreeFromHome } from './evolution.js';
import { buildChatUI, initChat, showChat, hideChat, _esc } from './chat.js';
import { showLeaderboard, _diffKey } from './leaderboard.js';
import { fetchTop10 } from '../config/supabase.js';
import { initializeGame } from '../main.js';
import { getRankIcon } from './utils.js';
import { MAP_WIDTH, MAP_HEIGHT } from './map.js';
import { _updateCameraZoom } from './camera.js';
import {
    STORAGE_KEYS,
    storageGet,
    storageSet,
    storageRemove,
    storageGetJSON,
    storageSetJSON
} from '../storage/index.js';

let _organHitRegions = [];
let _settingsKeyHandler = null;
let _settingsMouseHandler = null;
let _rebindBlink = null;
let _rebindTimeout = null;
let _lbDifficulty = 'easy';
let _top10Difficulty = 'easy';
// ── 小地圖大小：記住上次非零值（用於 ON/OFF 切換）
let _lastMinimapSize = 10;
const _ttEl = document.getElementById('game-tooltip');
document.addEventListener('mousemove', function(e) {
    if (_ttEl && _ttEl.style.display !== 'none') _moveTooltip(e.clientX, e.clientY);
});

export function showTooltip(data, cx, cy) {
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

export function hideTooltip() {
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

// detectMobile() / getOrientation() / applyDeviceMode() 已移至 systems/mobile.js
// _attachJoystickListeners() / _renderMobileOverlay() / _getAttackBtnPos() 已移至 systems/mobile.js



// =============================================================
// 繪製系統
// =============================================================

export function showAlphaAnnouncement(name) {
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

// drawGame() / updateUI() / drawTopBarUI() / drawMinimap() / drawTreasures() 已移至 systems/hud.js


// =============================================================
// 音效與設定系統
// =============================================================

export function loadSettings() {
    try {
        const parsed = storageGetJSON(STORAGE_KEYS.GAME_SETTINGS);
        if (parsed) {
            // volume 深度合併，確保子欄位不被 DEFAULT_SETTINGS 整個覆蓋
            if (parsed.volume && typeof parsed.volume === 'object') {
                gameState.settings.volume = Object.assign({}, DEFAULT_SETTINGS.volume, parsed.volume);
            }
            AudioManager.loadVolume(gameState.settings.volume);
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
            if (parsed.showOrganTooltip !== undefined) {
                gameState.settings.showOrganTooltip = parsed.showOrganTooltip;
            }
            if (parsed.alwaysCenter !== undefined) {
                gameState.settings.alwaysCenter = parsed.alwaysCenter;
            }
            if (parsed.minimapFade !== undefined) {
                gameState.settings.minimapFade = parsed.minimapFade;
            }
            if (parsed.fontBoldLarge !== undefined) {
                gameState.settings.fontBoldLarge = parsed.fontBoldLarge;
            } else if (parsed.fontLarge !== undefined || parsed.fontBold !== undefined) {
                // 舊版 fontLarge/fontBold 遷移至 fontBoldLarge
                gameState.settings.fontBoldLarge = !!(parsed.fontLarge || parsed.fontBold);
            }
            // minimapSize（0=關閉，1~10）：版本更新不重置
            if (parsed.minimapSize !== undefined) {
                gameState.settings.minimapSize = parsed.minimapSize;
            }
            // cameraMode：版本更新不重置
            if (parsed.cameraMode !== undefined) {
                gameState.settings.cameraMode = parsed.cameraMode;
            }
            // cameraZoomLevel：先嘗試從 localStorage 讀取
            if (parsed.cameraZoomLevel !== undefined) {
                gameState.settings.cameraZoomLevel = parsed.cameraZoomLevel;
            }
            // 若 localStorage 沒有此欄位，會在 applyDeviceMode() 後補設（見下方）
        }
    } catch(e) {}
    applyLanguage(gameState.language);
    applyDeviceMode(); // 此後 gameState.isMobile 才正確

    // cameraZoomLevel 未存過時，依平台設預設值（需在 applyDeviceMode 之後判斷）
    const _rawParsed = storageGetJSON(STORAGE_KEYS.GAME_SETTINGS) || {};
    if (_rawParsed.cameraZoomLevel === undefined) {
        gameState.settings.cameraZoomLevel = gameState.isMobile ? 10 : 6;
    }

    // 視野預設值強制更新（v0.0.66.3 一次性覆蓋，對齊新公式預設值）
    const _ZOOM_RESET_VERSION = 'v0.0.66.3';
    if (storageGet(STORAGE_KEYS.ZOOM_RESET_VERSION) !== _ZOOM_RESET_VERSION) {
        gameState.settings.cameraZoomLevel = gameState.isMobile ? 10 : 6;
        storageSet(STORAGE_KEYS.ZOOM_RESET_VERSION, _ZOOM_RESET_VERSION);
    }

    saveSettings(); // 確保新版本新增的欄位預設值都寫入 localStorage
}

// 切換語言：寫入 settings、重新套用 LANG 資料表、即時刷新開啟中的介面
export function switchLanguage(lang) {
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
    if (settingsOpen) showSettings();

    // 圖鑑開啟中則即時重繪（compendium 不在上方 close/reopen 流程中）
    const _co = document.getElementById('compendium-overlay');
    if (_co && typeof _co._render === 'function') _co._render();
}

export function saveSettings() {
    // 從 AudioManager 取得最新音量再存入
    const settingsToSave = Object.assign({}, gameState.settings, {
        volume: AudioManager.serializeVolume()
    });
    storageSetJSON(STORAGE_KEYS.GAME_SETTINGS, settingsToSave);
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

export function showSettings() {
    const fromHome = !!document.getElementById('start-screen');
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
        tog.onclick = () => {
            const currentValue = gameState.settings.volume[ok];
            AudioManager.setVolume(ok, !currentValue);
            refreshTog();
            saveSettings();
        };
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
        slider.oninput = () => {
            const newValue = parseInt(slider.value);
            AudioManager.setVolume(vk, newValue);
            valLbl.textContent = slider.value + '%';
            saveSettings();
        };
        row.appendChild(slider); row.appendChild(valLbl);
        volSec.appendChild(row);
    });
    panel.appendChild(volSec);

    // ─── 小地圖大小 ───
    const mmSec = _buildSettingsSection(t('sectionMinimap'));

    // 標題列：左側標籤 + 右側 ON/OFF 開關
    const mmTitleRow = document.createElement('div');
    mmTitleRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;';
    const mmLabel = document.createElement('div');
    mmLabel.style.cssText = 'font-size:13px;color:#ccc;';
    mmLabel.textContent = t('minimapSize');
    mmTitleRow.appendChild(mmLabel);

    const mmOnOffTog = document.createElement('button');
    mmOnOffTog.style.cssText = 'width:42px;height:22px;border-radius:11px;cursor:pointer;font-size:11px;border:none;flex-shrink:0;';
    const _refreshMmTog = () => {
        const on = gameState.settings.minimapSize > 0;
        mmOnOffTog.textContent   = on ? t('on') : t('off');
        mmOnOffTog.style.background = on ? '#2a8a2a' : '#555';
    };
    _refreshMmTog();

    // 10格色塊容器
    const mmBlocksRow = document.createElement('div');
    mmBlocksRow.style.cssText = 'display:flex;gap:3px;margin-top:4px;';

    const _buildMmBlocks = () => {
        mmBlocksRow.innerHTML = '';
        const cur = gameState.settings.minimapSize;
        for (let i = 1; i <= 10; i++) {
            const blk = document.createElement('div');
            blk.style.cssText = [
                'flex:1', 'height:18px', 'border-radius:3px', 'cursor:pointer',
                'background:' + (i <= cur ? '#4a9a4a' : '#333'),
                'border:1px solid ' + (i <= cur ? '#6aba6a' : '#555'),
                'transition:background 0.1s'
            ].join(';');
            blk.title = i + '/10';
            blk.addEventListener('click', () => {
                gameState.settings.minimapSize = i;
                _lastMinimapSize = i;
                saveSettings();
                _refreshMmTog();
                _buildMmBlocks();
                mmBlocksRow.style.display = 'flex';
            });
            mmBlocksRow.appendChild(blk);
        }
        mmBlocksRow.style.display = gameState.settings.minimapSize > 0 ? 'flex' : 'none';
    };
    _buildMmBlocks();

    mmOnOffTog.onclick = () => {
        if (gameState.settings.minimapSize > 0) {
            // 目前 ON → 關閉
            _lastMinimapSize = gameState.settings.minimapSize;
            gameState.settings.minimapSize = 0;
        } else {
            // 目前 OFF → 開啟
            gameState.settings.minimapSize = _lastMinimapSize || 10;
        }
        saveSettings();
        _refreshMmTog();
        _buildMmBlocks();
    };

    mmTitleRow.appendChild(mmOnOffTog);
    mmSec.appendChild(mmTitleRow);
    mmSec.appendChild(mmBlocksRow);
    panel.appendChild(mmSec);

    // ─── 視野模式 ───
    const camSec = _buildSettingsSection(t('sectionCamera'));

    // 標題列：左側標籤 + 右側智能/手動按鈕
    const camTitleRow = document.createElement('div');
    camTitleRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;';
    const camModeLabel = document.createElement('div');
    camModeLabel.style.cssText = 'font-size:13px;color:#ccc;';
    camModeLabel.textContent = t('cameraMode');
    camTitleRow.appendChild(camModeLabel);

    const camModeBtns = document.createElement('div');
    camModeBtns.style.cssText = 'display:flex;gap:4px;';
    const _camBtnStyle = (active) => [
        'padding:2px 10px', 'font-size:12px', 'border-radius:4px', 'cursor:pointer',
        active
            ? 'background:#2a5a8a;color:#7FC8FF;border:1px solid #7FC8FF;font-weight:bold;'
            : 'background:#2a2a2a;color:#aaa;border:1px solid #555;'
    ].join(';');

    const camSmartBtn  = document.createElement('button');
    const camManualBtn = document.createElement('button');
    const _refreshCamBtns = () => {
        const sm = gameState.settings.cameraMode === 'smart';
        camSmartBtn.style.cssText  = _camBtnStyle(sm);
        camManualBtn.style.cssText = _camBtnStyle(!sm);
    };
    camSmartBtn.textContent  = t('cameraSmart');
    camManualBtn.textContent = t('cameraManual');
    camSmartBtn.onclick = () => {
        gameState.settings.cameraMode = 'smart';
        saveSettings(); _refreshCamBtns();
    };
    camManualBtn.onclick = () => {
        gameState.settings.cameraMode = 'manual';
        saveSettings(); _refreshCamBtns();
    };
    _refreshCamBtns();
    camModeBtns.appendChild(camSmartBtn);
    camModeBtns.appendChild(camManualBtn);
    camTitleRow.appendChild(camModeBtns);

    // 10格縮放調整器（永遠顯示）
    const camBlocksRow = document.createElement('div');
    camBlocksRow.style.cssText = 'display:flex;gap:3px;margin-top:4px;';
    const _buildCamBlocks = () => {
        camBlocksRow.innerHTML = '';
        const cur = gameState.settings.cameraZoomLevel;
        for (let i = 1; i <= 10; i++) {
            const blk = document.createElement('div');
            blk.style.cssText = [
                'flex:1', 'height:18px', 'border-radius:3px', 'cursor:pointer',
                'background:' + (i <= cur ? '#2a5a8a' : '#333'),
                'border:1px solid ' + (i <= cur ? '#4a8abc' : '#555'),
                'transition:background 0.1s'
            ].join(';');
            blk.title = i + '/10';
            blk.addEventListener('click', () => {
                gameState.settings.cameraZoomLevel = i;
                saveSettings();
                _buildCamBlocks();
                if (typeof _updateCameraZoom === 'function') _updateCameraZoom();
            });
            camBlocksRow.appendChild(blk);
        }
    };
    _buildCamBlocks();

    camSec.appendChild(camTitleRow);
    camSec.appendChild(camBlocksRow);
    panel.appendChild(camSec);

    // ─── 按鍵設定 ───
    const keySec = _buildSettingsSection(t('sectionKeys'));
    const keyDefs = [
        { label: t('keyUp'),     sk: 'up',     fallback: '↑ ArrowUp'    },
        { label: t('keyDown'),   sk: 'down',   fallback: '↓ ArrowDown'  },
        { label: t('keyLeft'),   sk: 'left',   fallback: '← ArrowLeft'  },
        { label: t('keyRight'),  sk: 'right',  fallback: '→ ArrowRight' },
        { label: t('keyAttack'), sk: 'attack', fallback: t('mouseLeft') },
        { label: t('keyDash'),   sk: 'dash',   fallback: ''             }
    ];
    const rebindBtns = {};

    const _cancelRebind = () => {
        if (_rebindBlink)   { clearInterval(_rebindBlink);  _rebindBlink   = null; }
        if (_rebindTimeout) { clearTimeout(_rebindTimeout); _rebindTimeout = null; }
        const tgt = gameState._rebindTarget;
        if (tgt && rebindBtns[tgt]) {
            const def = keyDefs.find(x => x.sk === tgt);
            const _fb1 = def ? def.fallback : '';
            rebindBtns[tgt].textContent = _keyDisplay(gameState.settings.keys[tgt]) + (_fb1 ? '  /  ' + _fb1 : '');
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
            const _fb2 = def ? def.fallback : '';
            rebindBtns[sk].textContent = _keyDisplay(newKey) + (_fb2 ? '  /  ' + _fb2 : '');
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
        btn.textContent = _keyDisplay(gameState.settings.keys[sk]) + (fallback ? '  /  ' + fallback : '');
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

    // ── 器官提示 toggle（桌機版與手機版均顯示）
    const otRow = document.createElement('div');
    otRow.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:10px;';
    const otTog = document.createElement('button');
    otTog.style.cssText = 'width:42px;height:22px;border-radius:11px;cursor:pointer;font-size:11px;border:none;flex-shrink:0;';
    const refreshOtTog = () => {
        const on = gameState.settings.showOrganTooltip;
        otTog.textContent = on ? t('on') : t('off');
        otTog.style.background = on ? '#2a8a2a' : '#555';
    };
    refreshOtTog();
    otTog.onclick = () => {
        gameState.settings.showOrganTooltip = !gameState.settings.showOrganTooltip;
        refreshOtTog();
        saveSettings();
    };
    const otLbl = document.createElement('div');
    otLbl.style.cssText = 'font-size:13px;';
    otLbl.textContent = t('organTooltip');
    otRow.appendChild(otTog);
    otRow.appendChild(otLbl);
    accSec.appendChild(otRow);

    // ── 新手教學開關（ON = 下一場會出現教學）
    const tutRow = document.createElement('div');
    tutRow.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:10px;';
    const tutTog = document.createElement('button');
    tutTog.style.cssText = 'width:42px;height:22px;border-radius:11px;cursor:pointer;font-size:11px;border:none;flex-shrink:0;';
    const _isTutorialOn = () => !storageGet(STORAGE_KEYS.TUTORIAL_COMPLETED);
    const refreshTutTog = () => {
        const on = _isTutorialOn();
        tutTog.textContent  = on ? t('on') : t('off');
        tutTog.style.background = on ? '#2a8a2a' : '#555';
    };
    refreshTutTog();
    tutTog.onclick = () => {
        if (_isTutorialOn()) {
            // 目前 ON → 關閉（標記已完成，下一場不再顯示）
            storageSet(STORAGE_KEYS.TUTORIAL_COMPLETED, 'true');
        } else {
            // 目前 OFF → 開啟（移除完成標記，下一場會出現教學）
            storageRemove(STORAGE_KEYS.TUTORIAL_COMPLETED);
        }
        refreshTutTog();
    };
    const tutLbl = document.createElement('div');
    tutLbl.style.cssText = 'font-size:13px;';
    tutLbl.textContent = t('tutorialLabel');
    tutRow.appendChild(tutTog);
    tutRow.appendChild(tutLbl);
    accSec.appendChild(tutRow);
    const tutHint = document.createElement('div');
    tutHint.style.cssText = 'font-size:11px;color:#888;margin-top:2px;margin-bottom:4px;';
    tutHint.textContent = t('tutorialHint');
    accSec.appendChild(tutHint);

    // ── 永遠居中 Toggle
    const centerRow = document.createElement('div');
    centerRow.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:10px;';
    const centerTog = document.createElement('button');
    centerTog.style.cssText = 'width:42px;height:22px;border-radius:11px;cursor:pointer;font-size:11px;border:none;flex-shrink:0;';
    const refreshCenterTog = () => {
        const on = gameState.settings.alwaysCenter;
        centerTog.textContent = on ? t('on') : t('off');
        centerTog.style.background = on ? '#2a8a2a' : '#555';
    };
    refreshCenterTog();
    centerTog.onclick = () => {
        gameState.settings.alwaysCenter = !gameState.settings.alwaysCenter;
        refreshCenterTog();
        saveSettings();
    };
    const centerLbl = document.createElement('div');
    centerLbl.style.cssText = 'font-size:13px;';
    centerLbl.textContent = t('alwaysCenter');
    centerRow.appendChild(centerTog);
    centerRow.appendChild(centerLbl);
    accSec.appendChild(centerRow);

    // ── 地圖透明 Toggle
    const mmFadeRow = document.createElement('div');
    mmFadeRow.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:10px;';
    const mmFadeTog = document.createElement('button');
    mmFadeTog.style.cssText = 'width:42px;height:22px;border-radius:11px;cursor:pointer;font-size:11px;border:none;flex-shrink:0;';
    const refreshMmFadeTog = () => {
        const on = gameState.settings.minimapFade;
        mmFadeTog.textContent = on ? t('on') : t('off');
        mmFadeTog.style.background = on ? '#2a8a2a' : '#555';
    };
    refreshMmFadeTog();
    mmFadeTog.onclick = () => {
        gameState.settings.minimapFade = !gameState.settings.minimapFade;
        refreshMmFadeTog();
        saveSettings();
    };
    const mmFadeLbl = document.createElement('div');
    mmFadeLbl.style.cssText = 'font-size:13px;';
    mmFadeLbl.textContent = t('minimapFade');
    mmFadeRow.appendChild(mmFadeTog);
    mmFadeRow.appendChild(mmFadeLbl);
    accSec.appendChild(mmFadeRow);

    // ── 字大又粗 Toggle
    const fontBoldLargeRow = document.createElement('div');
    fontBoldLargeRow.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:10px;';
    const fontBoldLargeTog = document.createElement('button');
    fontBoldLargeTog.style.cssText = 'width:42px;height:22px;border-radius:11px;cursor:pointer;font-size:11px;border:none;flex-shrink:0;';
    const refreshFontBoldLargeTog = () => {
        const on = gameState.settings.fontBoldLarge;
        fontBoldLargeTog.textContent = on ? t('on') : t('off');
        fontBoldLargeTog.style.background = on ? '#2a8a2a' : '#555';
    };
    refreshFontBoldLargeTog();
    fontBoldLargeTog.onclick = () => {
        gameState.settings.fontBoldLarge = !gameState.settings.fontBoldLarge;
        refreshFontBoldLargeTog();
        saveSettings();
    };
    const fontBoldLargeLbl = document.createElement('div');
    fontBoldLargeLbl.style.cssText = 'font-size:13px;';
    fontBoldLargeLbl.textContent = t('fontBoldLarge');
    fontBoldLargeRow.appendChild(fontBoldLargeTog);
    fontBoldLargeRow.appendChild(fontBoldLargeLbl);
    accSec.appendChild(fontBoldLargeRow);

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
        storageSet(STORAGE_KEYS.SKILL_POINTS, String(gameState.skillPoints));
        saveSettings(); // 重啟前確保設定已存入 localStorage
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
        AudioManager.loadVolume(DEFAULT_SETTINGS.volume);
        saveSettings();
        applyDeviceMode();
        hideSettings(); showSettings();
    };
    otherSec.appendChild(resetBtn);
    panel.appendChild(otherSec);

    // ─── 底部按鈕 ───
    const saveBtn = document.createElement('button');
    saveBtn.style.cssText = 'width:100%;margin-top:14px;padding:10px;cursor:pointer;border:1px solid #4a8a4a;background:#2a5a2a;color:white;border-radius:4px;font-size:15px;';
    saveBtn.textContent = t('saveAndBack');
    saveBtn.onclick = () => { saveSettings(); hideSettings(); };
    panel.appendChild(saveBtn);

    overlay.appendChild(panel);
    document.getElementById('game-container').appendChild(overlay);
}

export function hideSettings() {
    if (_settingsKeyHandler)   { document.removeEventListener('keydown',   _settingsKeyHandler,   true); _settingsKeyHandler   = null; }
    if (_settingsMouseHandler) { document.removeEventListener('mousedown', _settingsMouseHandler, true); _settingsMouseHandler = null; }
    if (_rebindBlink)   { clearInterval(_rebindBlink);  _rebindBlink   = null; }
    if (_rebindTimeout) { clearTimeout(_rebindTimeout); _rebindTimeout = null; }
    gameState._rebindTarget = null;
    saveSettings(); // 關閉設定時自動存入 localStorage
    const overlay = document.getElementById('settings-overlay');
    if (overlay) overlay.remove();
    gameState.settingsOpen = false;
    gameState.lastTimeTick = Date.now();
    if (document.getElementById('start-screen') && typeof showChat === 'function') showChat();
}

// =============================================================
// 計時器
// =============================================================

export function updateTimer() {
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

export function toggleDevMode() {
    gameState.devMode = !gameState.devMode;
    if (gameState.devMode) gameState.devModeUsed = true;
    document.getElementById('dev-panel').style.display    = gameState.devMode ? 'block' : 'none';
    document.getElementById('dev-indicator').style.display = gameState.devMode ? 'block' : 'none';
}

export function devAddXP() {
    addXP(50);
}

export function devAddHP() {
    gameState.stats.hpCurrent = Math.min(gameState.stats.hpMax, gameState.stats.hpCurrent + 20);
}

export function devFullHP() {
    gameState.stats.hpCurrent = gameState.stats.hpMax;
}

export function devSpawnFruits() {
    for (let i = 0; i < 5; i++) spawnFruit();
}

export function devKillHostiles() {
    const now = Date.now();
    for (const c of gameState.hostileCreatures) {
        if (c.hp > 0) {
            c.hp = 0;
            gameState.corpses.push({ x: c.x, y: c.y, radius: c.radius, spawnTime: now });
        }
    }
}

export function devSpawnNeutral() {
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

export function devSpawnHostile() {
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

export function devFastForward() {
    gameState.timeRemaining = Math.max(0, gameState.timeRemaining - 300);
    gameState.lastTimeTick = Date.now();
}

export function devRewind() {
    gameState.timeRemaining = Math.min(600, gameState.timeRemaining + 300);
    gameState.lastTimeTick = Date.now();
}

export function devToggleDayNight() {
    // 將 timeRemaining 跳到下一個時段起點，讓 updateDayNightCycle 自動觸發切換
    const nextIdx = (getDayNightPhaseIndex() + 1) % 8;
    gameState.timeRemaining = Math.max(0, 600 - nextIdx * 75 - 1);
    gameState.lastTimeTick = Date.now();
}

// =============================================================
// 遊戲說明 (Guide)
// =============================================================

let _guideKeyHandler = null;

export function showGuide(startPage) {
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

export function hideGuide() {
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

export function getOrganDisplayName(id) {
    if (ORGANS[id]) return ORGANS[id].name;
    if (HIDDEN_ORGANS[id]) return HIDDEN_ORGANS[id].name;
    return id;
}

// 進化圖鑑：從 EVOLUTION_PATHS 的 effects 動態生成累計描述
// 草食/雜食速度為累計值；肉食攻擊、雜食白骨素為固定值（當級顯示當級）
export function buildEvoLevelDesc(pathId, upToLevel) {
    const path = EVOLUTION_PATHS[pathId];
    if (!path) return '';
    const levels = path.levels.slice(0, upToLevel);

    let totalHp      = 0;
    let totalSpeed   = 0;
    let totalFruitXP = 0;
    let totalRadius  = 0;
    let friendly     = false;
    let boneEatTime  = null;

    for (const lv of levels) {
        if (lv.hpMaxAdd)            totalHp      += lv.hpMaxAdd;
        if (lv.speedBonus)          totalSpeed   += lv.speedBonus;
        if (lv.fruitXPBonus)        totalFruitXP += lv.fruitXPBonus;
        if (lv.radiusPercent)       totalRadius   = lv.radiusPercent; // 取最新值
        if (lv.friendly)            friendly      = true;
        if (lv.boneEatTime != null) boneEatTime   = lv.boneEatTime;
    }

    const parts = [];

    if (pathId === 'herbivore') {
        parts.push('可吃果子');
        if (totalHp > 0)      parts.push('HP上限+' + totalHp);
        if (totalFruitXP > 0) parts.push('果子XP+' + totalFruitXP);
        if (totalRadius > 0)  parts.push('體型+' + Math.round(totalRadius * 100) + '%');
        if (friendly)         parts.push('中立生物完全友善');
        if (upToLevel >= 2)   parts.push('撞到不逃跑');
        if (upToLevel >= 3)   parts.push('被攻擊也不逃跑');
    }

    if (pathId === 'carnivore') {
        // 肉食性各數值為固定值（當級對應固定總攻擊加成），直接取當前等級
        const lv = levels[upToLevel - 1];
        if (!lv) return '';
        parts.push('可吃屍體');
        if (lv.attackAdd)            parts.push('攻擊+' + lv.attackAdd);
        if (lv.eatXP)                parts.push('屍體' + lv.eatXP + 'XP');
        if (lv.eatTime != null)      parts.push(lv.eatTime / 1000 + '秒吞噬');
        if (lv.attackSpeedBonus > 0) parts.push('攻速+' + Math.round(lv.attackSpeedBonus * 100) + '%');
    }

    if (pathId === 'omnivore') {
        // 速度累計，白骨素/白骨吞噬取當級固定值
        const lv = levels[upToLevel - 1];
        if (!lv) return '';
        parts.push('需草食+肉食');
        if (totalSpeed > 0)              parts.push('速度+' + totalSpeed.toFixed(1));
        parts.push('獲得毒囊');
        if (lv.boneEatTime === 0)        parts.push('即時吞噬白骨');
        else if (lv.boneEatTime != null) parts.push('白骨吞噬' + lv.boneEatTime / 1000 + '秒');
        if (lv.boneMaterialAdd)          parts.push('白骨素+' + lv.boneMaterialAdd + '/次');
    }

    return parts.join('，');
}

export function showCompendium(startTab) {
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
    let curGuideEntryId = null;
    let curOrganEntryId = null;
    let curEvoEntryId = null;

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

    // Guide 分頁：從 COMPENDIUM_DATA 動態渲染，桌機版左右雙欄，手機版橫向 Tab + 內容
    function _renderGuide(container) {
        if (typeof COMPENDIUM_DATA === 'undefined') {
            container.innerHTML = '<div style="padding:20px;color:#888;">圖鑑資料未載入</div>';
            return;
        }
        const lang = (gameState.settings && gameState.settings.language) || 'zh-TW';
        container.innerHTML = '';

        // 若尚未選定條目，預設第一個
        if (!curGuideEntryId) {
            curGuideEntryId = COMPENDIUM_DATA.sections[0].entries[0].id;
        }

        // 找出目前條目與分類
        function _findEntry(id) {
            for (var si = 0; si < COMPENDIUM_DATA.sections.length; si++) {
                var sec = COMPENDIUM_DATA.sections[si];
                for (var ei = 0; ei < sec.entries.length; ei++) {
                    if (sec.entries[ei].id === id) return { entry: sec.entries[ei], section: sec };
                }
            }
            return null;
        }

        var found = _findEntry(curGuideEntryId);
        if (!found) {
            curGuideEntryId = COMPENDIUM_DATA.sections[0].entries[0].id;
            found = _findEntry(curGuideEntryId);
        }

        if (gameState.isMobile) {
            // ── 手機版：上方橫向 Tab 列 + 下方內容區
            container.style.cssText = 'display:flex;flex-direction:column;flex:1;overflow:hidden;';

            var tabStrip = document.createElement('div');
            tabStrip.style.cssText = 'display:flex;overflow-x:auto;flex-shrink:0;border-bottom:1px solid #333;scrollbar-width:none;-ms-overflow-style:none;padding:0 4px;';

            var flatIdx = 0, selectedFlatIdx = 0;
            COMPENDIUM_DATA.sections.forEach(function (section) {
                section.entries.forEach(function (entry, ei) {
                    var isSelected = entry.id === curGuideEntryId;
                    if (isSelected) selectedFlatIdx = flatIdx;
                    var isFirst = ei === 0;
                    var sLabel = section.label[lang] || section.label['zh-TW'];
                    var eLabel = entry.title[lang] || entry.title['zh-TW'];
                    var label  = isFirst ? (sLabel + '｜' + eLabel) : eLabel;
                    var tab = document.createElement('div');
                    tab.style.cssText = 'padding:6px 10px;white-space:nowrap;cursor:pointer;font-size:11px;flex-shrink:0;' +
                        'border-bottom:' + (isSelected ? '2px' : '1px') + ' solid ' + (isSelected ? section.color : 'transparent') + ';' +
                        'color:' + (isSelected ? section.color : '#aaa') + ';' +
                        'font-weight:' + (isSelected ? 'bold' : 'normal') + ';';
                    tab.textContent = label;
                    (function (eid) {
                        tab.onclick = function () { curGuideEntryId = eid; _renderGuide(container); };
                    })(entry.id);
                    tabStrip.appendChild(tab);
                    flatIdx++;
                });
            });
            container.appendChild(tabStrip);

            // 捲動選中 Tab 至可見範圍
            setTimeout(function () {
                var tabEl = tabStrip.children[selectedFlatIdx];
                if (tabEl) tabEl.scrollIntoView({ block: 'nearest', inline: 'center' });
            }, 0);

            // 內容區
            var contentArea = document.createElement('div');
            contentArea.style.cssText = 'flex:1;overflow-y:auto;padding:10px 12px;';
            if (found) {
                var badge = document.createElement('div');
                badge.style.cssText = 'display:inline-block;font-size:10px;color:' + found.section.color + ';border:1px solid ' + found.section.color + ';border-radius:3px;padding:1px 6px;margin-bottom:5px;';
                badge.textContent = found.section.label[lang] || found.section.label['zh-TW'];
                contentArea.appendChild(badge);

                var mTitle = document.createElement('div');
                mTitle.style.cssText = 'font-size:14px;font-weight:bold;color:#FFD700;margin-bottom:6px;';
                mTitle.textContent = found.entry.title[lang] || found.entry.title['zh-TW'];
                contentArea.appendChild(mTitle);

                var mBody = document.createElement('div');
                mBody.style.cssText = 'font-size:12px;color:#ccc;line-height:1.8;white-space:pre-wrap;';
                mBody.textContent = found.entry.content[lang] || found.entry.content['zh-TW'];
                contentArea.appendChild(mBody);
            }
            container.appendChild(contentArea);

        } else {
            // ── 桌機版：左欄目錄（160px）+ 右欄內容
            container.style.cssText = 'display:flex;flex-direction:row;flex:1;overflow:hidden;';

            var sidebar = document.createElement('div');
            sidebar.style.cssText = 'width:160px;flex-shrink:0;overflow-y:auto;border-right:1px solid #333;padding:4px 0;';

            COMPENDIUM_DATA.sections.forEach(function (section) {
                var secH = document.createElement('div');
                secH.style.cssText = 'font-size:10px;font-weight:bold;color:' + section.color + ';' +
                    'padding:6px 8px 2px 8px;border-left:3px solid ' + section.color + ';' +
                    'margin:8px 0 2px 0;letter-spacing:0.3px;text-transform:uppercase;';
                secH.textContent = section.label[lang] || section.label['zh-TW'];
                sidebar.appendChild(secH);

                section.entries.forEach(function (entry) {
                    var isSel = entry.id === curGuideEntryId;
                    var item = document.createElement('div');
                    item.style.cssText = 'padding:5px 8px 5px 10px;cursor:pointer;font-size:12px;line-height:1.4;' +
                        'color:' + (isSel ? '#fff' : '#bbb') + ';' +
                        'background:' + (isSel ? 'rgba(255,255,255,0.08)' : 'transparent') + ';' +
                        'border-left:2px solid ' + (isSel ? section.color : 'transparent') + ';';
                    item.textContent = entry.title[lang] || entry.title['zh-TW'];
                    (function (eid) {
                        item.onclick = function () { curGuideEntryId = eid; _renderGuide(container); };
                    })(entry.id);
                    sidebar.appendChild(item);
                });
            });
            container.appendChild(sidebar);

            var rightPane = document.createElement('div');
            rightPane.style.cssText = 'flex:1;overflow-y:auto;padding:14px 18px;';

            if (found) {
                var dBadge = document.createElement('div');
                dBadge.style.cssText = 'display:inline-block;font-size:10px;color:' + found.section.color + ';border:1px solid ' + found.section.color + ';border-radius:3px;padding:1px 6px;margin-bottom:8px;';
                dBadge.textContent = found.section.label[lang] || found.section.label['zh-TW'];
                rightPane.appendChild(dBadge);

                var dTitle = document.createElement('div');
                dTitle.style.cssText = 'font-size:16px;font-weight:bold;color:#FFD700;margin-bottom:10px;';
                dTitle.textContent = found.entry.title[lang] || found.entry.title['zh-TW'];
                rightPane.appendChild(dTitle);

                var dBody = document.createElement('div');
                dBody.style.cssText = 'font-size:13px;color:#ccc;line-height:1.8;white-space:pre-wrap;';
                dBody.textContent = found.entry.content[lang] || found.entry.content['zh-TW'];
                rightPane.appendChild(dBody);
            }
            container.appendChild(rightPane);
        }
    }

    // Organs 分頁：從 ORGANS/HIDDEN_ORGANS/COMBOS 動態渲染，桌機版左右雙欄，手機版橫向 Tab + 內容
    function _renderOrgans(container) {
        container.innerHTML = '';
        var typeColor = { attack: '#FF9999', defense: '#88CCFF', spirit: '#CC99FF' };
        var organSections = [
            {
                id: 'attack', label: '⚔️ 攻擊', color: '#FF9999',
                entries: Object.values(ORGANS).filter(function(o) { return o.type === 'attack'; })
                    .map(function(o) { return { id: 'organ_' + o.id, data: o, type: 'organ' }; })
            },
            {
                id: 'defense', label: '🛡️ 防禦', color: '#88CCFF',
                entries: Object.values(ORGANS).filter(function(o) { return o.type === 'defense'; })
                    .map(function(o) { return { id: 'organ_' + o.id, data: o, type: 'organ' }; })
            },
            {
                id: 'spirit', label: '🔮 靈力', color: '#CC99FF',
                entries: Object.values(ORGANS).filter(function(o) { return o.type === 'spirit'; })
                    .map(function(o) { return { id: 'organ_' + o.id, data: o, type: 'organ' }; })
            },
            {
                id: 'special', label: '特殊器官', color: '#AAAAFF',
                entries: [{ id: 'organ_poisonSac', data: ORGANS.poisonSac, type: 'poisonSac' }]
            },
            {
                id: 'hidden', label: '✨ 隱藏器官', color: '#FFD700',
                entries: Object.values(HIDDEN_ORGANS).map(function(h) { return { id: 'hidden_' + h.id, data: h, type: 'hidden' }; })
            },
            {
                id: 'combo', label: '⚡ 組合效果', color: '#88FF88',
                entries: COMBOS.map(function(c) { return { id: 'combo_' + c.key, data: c, type: 'combo' }; })
            }
        ];

        if (!curOrganEntryId) curOrganEntryId = organSections[0].entries[0].id;

        var foundEntry = null, foundSection = null;
        for (var si = 0; si < organSections.length; si++) {
            for (var ei = 0; ei < organSections[si].entries.length; ei++) {
                if (organSections[si].entries[ei].id === curOrganEntryId) {
                    foundEntry = organSections[si].entries[ei];
                    foundSection = organSections[si];
                }
            }
        }
        if (!foundEntry) {
            curOrganEntryId = organSections[0].entries[0].id;
            foundEntry = organSections[0].entries[0];
            foundSection = organSections[0];
        }

        function _entryLabel(entry) {
            if (entry.type === 'organ' || entry.type === 'poisonSac') return entry.data.name;
            if (entry.type === 'hidden') return entry.data.name;
            return entry.data.ids.map(function(id) { return getOrganDisplayName(id); }).join('+');
        }

        function _buildOrganContent(pane, entry, section) {
            var badge = document.createElement('div');
            badge.style.cssText = 'display:inline-block;font-size:10px;color:' + section.color + ';border:1px solid ' + section.color + ';border-radius:3px;padding:1px 6px;margin-bottom:8px;';
            badge.textContent = section.label;
            pane.appendChild(badge);

            if (entry.type === 'organ') {
                var org = entry.data;
                var c = typeColor[org.type] || section.color;
                var t1 = document.createElement('div');
                t1.style.cssText = 'font-size:16px;font-weight:bold;color:' + c + ';margin-bottom:10px;';
                t1.textContent = org.name;
                pane.appendChild(t1);
                org.levels.forEach(function(lv, idx) {
                    var d = document.createElement('div');
                    d.style.cssText = 'margin-bottom:6px;';
                    d.innerHTML = '<span style="color:#FFD700;">Lv' + (idx+1) + ':</span> <span style="color:#ccc;font-size:12px;">' + _esc(lv.desc) + '</span>';
                    pane.appendChild(d);
                });
            } else if (entry.type === 'poisonSac') {
                var sac = entry.data;
                var t2 = document.createElement('div');
                t2.style.cssText = 'font-size:16px;font-weight:bold;color:#AAAAFF;margin-bottom:6px;';
                t2.textContent = '☠ ' + sac.name;
                pane.appendChild(t2);
                var note = document.createElement('div');
                note.style.cssText = 'font-size:12px;color:#aaa;margin-bottom:10px;';
                note.textContent = '無法主動選擇，透過累積白骨素自動升級';
                pane.appendChild(note);
                sac.levels.forEach(function(lv, idx) {
                    var d = document.createElement('div');
                    d.style.cssText = 'font-size:12px;color:#ccc;line-height:1.6;margin-bottom:2px;';
                    d.innerHTML = '<span style="color:#AAAAFF;margin-right:4px;">Lv' + (idx+1) + '</span>' +
                        '<span style="color:#777;margin-right:6px;">[白骨素≥' + sac.thresholds[idx] + ']</span>' +
                        _esc(lv.desc);
                    pane.appendChild(d);
                });
            } else if (entry.type === 'hidden') {
                var h = entry.data;
                var t3 = document.createElement('div');
                t3.style.cssText = 'font-size:16px;font-weight:bold;color:#FFD700;margin-bottom:6px;';
                t3.textContent = '✨ ' + h.name;
                pane.appendChild(t3);
                var hn = document.createElement('div');
                hn.style.cssText = 'font-size:12px;color:#aaa;margin-bottom:8px;';
                hn.textContent = '擊敗精英怪有機率獲得';
                pane.appendChild(hn);
                var hd = document.createElement('div');
                hd.style.cssText = 'font-size:13px;color:#ccc;';
                hd.textContent = h.desc;
                pane.appendChild(hd);
            } else if (entry.type === 'combo') {
                var combo = entry.data;
                var t4 = document.createElement('div');
                t4.style.cssText = 'font-size:15px;font-weight:bold;color:#88FF88;margin-bottom:8px;';
                t4.textContent = combo.ids.map(function(id) { return getOrganDisplayName(id); }).join(' + ');
                pane.appendChild(t4);
                var cd = document.createElement('div');
                cd.style.cssText = 'font-size:13px;color:#ccc;';
                cd.textContent = combo.desc;
                pane.appendChild(cd);
            }
        }

        if (gameState.isMobile) {
            container.style.cssText = 'display:flex;flex-direction:column;flex:1;overflow:hidden;';
            var tabStrip = document.createElement('div');
            tabStrip.style.cssText = 'display:flex;overflow-x:auto;flex-shrink:0;border-bottom:1px solid #333;scrollbar-width:none;-ms-overflow-style:none;padding:0 4px;';
            var flatIdx = 0, selIdx = 0;
            organSections.forEach(function(sec) {
                sec.entries.forEach(function(entry, ei) {
                    var isSel = entry.id === curOrganEntryId;
                    if (isSel) selIdx = flatIdx;
                    var label = (ei === 0 ? (sec.label + '｜') : '') + _entryLabel(entry);
                    var tab = document.createElement('div');
                    tab.style.cssText = 'padding:6px 10px;white-space:nowrap;cursor:pointer;font-size:11px;flex-shrink:0;' +
                        'border-bottom:' + (isSel ? '2px' : '1px') + ' solid ' + (isSel ? sec.color : 'transparent') + ';' +
                        'color:' + (isSel ? sec.color : '#aaa') + ';font-weight:' + (isSel ? 'bold' : 'normal') + ';';
                    tab.textContent = label;
                    (function(eid) { tab.onclick = function() { curOrganEntryId = eid; _renderOrgans(container); }; })(entry.id);
                    tabStrip.appendChild(tab);
                    flatIdx++;
                });
            });
            container.appendChild(tabStrip);
            setTimeout(function() { var el = tabStrip.children[selIdx]; if (el) el.scrollIntoView({ block: 'nearest', inline: 'center' }); }, 0);
            var ca = document.createElement('div');
            ca.style.cssText = 'flex:1;overflow-y:auto;padding:10px 12px;';
            _buildOrganContent(ca, foundEntry, foundSection);
            container.appendChild(ca);
        } else {
            container.style.cssText = 'display:flex;flex-direction:row;flex:1;overflow:hidden;';
            var sidebar = document.createElement('div');
            sidebar.style.cssText = 'width:160px;flex-shrink:0;overflow-y:auto;border-right:1px solid #333;padding:4px 0;';
            organSections.forEach(function(sec) {
                var sh = document.createElement('div');
                sh.style.cssText = 'font-size:10px;font-weight:bold;color:' + sec.color + ';padding:6px 8px 2px 8px;border-left:3px solid ' + sec.color + ';margin:8px 0 2px 0;letter-spacing:0.3px;text-transform:uppercase;';
                sh.textContent = sec.label;
                sidebar.appendChild(sh);
                sec.entries.forEach(function(entry) {
                    var isSel = entry.id === curOrganEntryId;
                    var item = document.createElement('div');
                    item.style.cssText = 'padding:5px 8px 5px 10px;cursor:pointer;font-size:12px;line-height:1.4;' +
                        'color:' + (isSel ? '#fff' : '#bbb') + ';background:' + (isSel ? 'rgba(255,255,255,0.08)' : 'transparent') + ';' +
                        'border-left:2px solid ' + (isSel ? sec.color : 'transparent') + ';';
                    item.textContent = _entryLabel(entry);
                    (function(eid) { item.onclick = function() { curOrganEntryId = eid; _renderOrgans(container); }; })(entry.id);
                    sidebar.appendChild(item);
                });
            });
            container.appendChild(sidebar);
            var rp = document.createElement('div');
            rp.style.cssText = 'flex:1;overflow-y:auto;padding:14px 18px;';
            _buildOrganContent(rp, foundEntry, foundSection);
            container.appendChild(rp);
        }
    }

    // Evo 分頁：從 EVOLUTION_PATHS/SKILLS 動態渲染，桌機版左右雙欄，手機版橫向 Tab + 內容
    function _renderEvo(container) {
        container.innerHTML = '';
        var pathColors = { herbivore: '#88cc88', carnivore: '#FF9999', omnivore: '#CCAAFF' };
        var skillColor = '#FFD700';
        var evoSections = [
            {
                id: 'paths', label: '進化路線', color: '#88cc88',
                entries: Object.values(EVOLUTION_PATHS).map(function(p) {
                    return { id: 'path_' + p.id, data: p, type: 'path', color: pathColors[p.id] || '#88cc88' };
                })
            },
            {
                id: 'skills', label: '技能樹', color: skillColor,
                entries: Object.values(SKILLS).map(function(s) {
                    return { id: 'skill_' + s.id, data: s, type: 'skill', color: skillColor };
                })
            }
        ];

        if (!curEvoEntryId) curEvoEntryId = evoSections[0].entries[0].id;

        var foundEntry = null, foundSection = null;
        for (var si = 0; si < evoSections.length; si++) {
            for (var ei = 0; ei < evoSections[si].entries.length; ei++) {
                if (evoSections[si].entries[ei].id === curEvoEntryId) {
                    foundEntry = evoSections[si].entries[ei];
                    foundSection = evoSections[si];
                }
            }
        }
        if (!foundEntry) {
            curEvoEntryId = evoSections[0].entries[0].id;
            foundEntry = evoSections[0].entries[0];
            foundSection = evoSections[0];
        }

        function _buildEvoContent(pane, entry) {
            if (!entry) return;
            if (entry.type === 'path') {
                var path = entry.data;
                var c = pathColors[path.id] || '#88cc88';
                var unlockMap = { herbivore: '初始解鎖，無前置條件', carnivore: '無前置條件', omnivore: '需草食性 Lv1 + 肉食性 Lv1' };
                var t1 = document.createElement('div');
                t1.style.cssText = 'font-size:16px;font-weight:bold;color:' + c + ';margin-bottom:6px;';
                t1.textContent = path.icon + ' ' + path.name + '（最高 Lv' + path.maxLevel + '）';
                pane.appendChild(t1);
                if (unlockMap[path.id]) {
                    var ul = document.createElement('div');
                    ul.style.cssText = 'font-size:12px;color:#aaa;margin-bottom:10px;';
                    ul.textContent = '解鎖條件：' + unlockMap[path.id];
                    pane.appendChild(ul);
                }
                for (var i = 1; i <= path.maxLevel; i++) {
                    var d = document.createElement('div');
                    d.style.cssText = 'margin-bottom:6px;';
                    d.innerHTML = '<span style="color:#FFD700;">Lv' + i + ':</span> <span style="color:#ccc;font-size:12px;">' + _esc(buildEvoLevelDesc(path.id, i)) + '</span>';
                    pane.appendChild(d);
                }
            } else if (entry.type === 'skill') {
                var skill = entry.data;
                var t2 = document.createElement('div');
                t2.style.cssText = 'font-size:16px;font-weight:bold;color:#FFD700;margin-bottom:8px;';
                t2.textContent = skill.name;
                pane.appendChild(t2);
                var desc = document.createElement('div');
                desc.style.cssText = 'font-size:13px;color:#ccc;margin-bottom:10px;';
                desc.textContent = skill.desc;
                pane.appendChild(desc);
                for (var i = 1; i <= skill.maxLevel; i++) {
                    var lv = document.createElement('div');
                    lv.style.cssText = 'font-size:12px;color:#aaa;margin-bottom:3px;';
                    lv.innerHTML = '<span style="color:#FFD700;">Lv' + i + '</span><span style="color:#666;margin:0 6px;">費用 ' + i + ' 點</span>';
                    pane.appendChild(lv);
                }
                var hint = document.createElement('div');
                hint.style.cssText = 'font-size:11px;color:#888;margin-top:10px;border-top:1px solid #333;padding-top:8px;';
                hint.textContent = '擊殺精英怪、Boss、遊戲時長皆可獲得技能點，技能跨局繼承';
                pane.appendChild(hint);
            }
        }

        if (gameState.isMobile) {
            container.style.cssText = 'display:flex;flex-direction:column;flex:1;overflow:hidden;';
            var tabStrip = document.createElement('div');
            tabStrip.style.cssText = 'display:flex;overflow-x:auto;flex-shrink:0;border-bottom:1px solid #333;scrollbar-width:none;-ms-overflow-style:none;padding:0 4px;';
            var flatIdx = 0, selIdx = 0;
            evoSections.forEach(function(sec) {
                sec.entries.forEach(function(entry, ei) {
                    var isSel = entry.id === curEvoEntryId;
                    if (isSel) selIdx = flatIdx;
                    var eLabel = entry.type === 'path' ? (entry.data.icon + ' ' + entry.data.name) : entry.data.name;
                    var label = (sec.id === 'skills' && ei === 0) ? ('技能樹｜' + eLabel) : eLabel;
                    var tabColor = entry.color;
                    var tab = document.createElement('div');
                    tab.style.cssText = 'padding:6px 10px;white-space:nowrap;cursor:pointer;font-size:11px;flex-shrink:0;' +
                        'border-bottom:' + (isSel ? '2px' : '1px') + ' solid ' + (isSel ? tabColor : 'transparent') + ';' +
                        'color:' + (isSel ? tabColor : '#aaa') + ';font-weight:' + (isSel ? 'bold' : 'normal') + ';';
                    tab.textContent = label;
                    (function(eid) { tab.onclick = function() { curEvoEntryId = eid; _renderEvo(container); }; })(entry.id);
                    tabStrip.appendChild(tab);
                    flatIdx++;
                });
            });
            container.appendChild(tabStrip);
            setTimeout(function() { var el = tabStrip.children[selIdx]; if (el) el.scrollIntoView({ block: 'nearest', inline: 'center' }); }, 0);
            var ca = document.createElement('div');
            ca.style.cssText = 'flex:1;overflow-y:auto;padding:10px 12px;';
            _buildEvoContent(ca, foundEntry);
            container.appendChild(ca);
        } else {
            container.style.cssText = 'display:flex;flex-direction:row;flex:1;overflow:hidden;';
            var sidebar = document.createElement('div');
            sidebar.style.cssText = 'width:160px;flex-shrink:0;overflow-y:auto;border-right:1px solid #333;padding:4px 0;';
            evoSections.forEach(function(sec) {
                var sh = document.createElement('div');
                sh.style.cssText = 'font-size:10px;font-weight:bold;color:' + sec.color + ';padding:6px 8px 2px 8px;border-left:3px solid ' + sec.color + ';margin:8px 0 2px 0;letter-spacing:0.3px;text-transform:uppercase;';
                sh.textContent = sec.label;
                sidebar.appendChild(sh);
                sec.entries.forEach(function(entry) {
                    var isSel = entry.id === curEvoEntryId;
                    var eLabel = entry.type === 'path' ? (entry.data.icon + ' ' + entry.data.name) : entry.data.name;
                    var item = document.createElement('div');
                    item.style.cssText = 'padding:5px 8px 5px 10px;cursor:pointer;font-size:12px;line-height:1.4;' +
                        'color:' + (isSel ? '#fff' : '#bbb') + ';background:' + (isSel ? 'rgba(255,255,255,0.08)' : 'transparent') + ';' +
                        'border-left:2px solid ' + (isSel ? entry.color : 'transparent') + ';';
                    item.textContent = eLabel;
                    (function(eid) { item.onclick = function() { curEvoEntryId = eid; _renderEvo(container); }; })(entry.id);
                    sidebar.appendChild(item);
                });
            });
            container.appendChild(sidebar);
            var rp = document.createElement('div');
            rp.style.cssText = 'flex:1;overflow-y:auto;padding:14px 18px;';
            _buildEvoContent(rp, foundEntry);
            container.appendChild(rp);
        }
    }

    function render() {
        // 更新 Tab 按鈕樣式
        tabs.forEach(tab => {
            tabBtns[tab].style.background = tab === curTab ? '#2a5a2a' : 'rgba(40,40,40,0.8)';
            tabBtns[tab].style.borderColor = tab === curTab ? '#4a8a4a' : '#555';
            tabBtns[tab].style.color = 'white';
        });

        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
        pageLbl.style.display = 'none';
        content.style.cssText = 'display:flex;flex:1;background:rgba(255,255,255,0.04);border:1px solid #333;border-radius:6px;overflow:hidden;min-height:0;padding:0;';
        if (curTab === 'guide') _renderGuide(content);
        else if (curTab === 'organs') _renderOrgans(content);
        else _renderEvo(content);
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
        if (document.getElementById('start-screen') && typeof showChat === 'function') showChat();
    }

    prevBtn.onclick = () => {};
    nextBtn.onclick = () => {};
    closeBtn.onclick = closeCompendium;
    overlay.addEventListener('click', e => { if (e.target === overlay) closeCompendium(); });

    let _compKeyHandler = null;
    _compKeyHandler = function(e) {
        if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
        if (e.key === 'Escape') { closeCompendium(); return; }
    };
    document.addEventListener('keydown', _compKeyHandler);

    overlay._render = render;
    overlay.appendChild(panel);
    document.getElementById('game-container').appendChild(overlay);
    render();
}

// =============================================================
// 開始畫面
// =============================================================

export function showMapSelect() {
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
        { id: 'hard',   key: 'diffHard',   map: typeof HARD_MAP !== 'undefined' ? HARD_MAP : null, locked: false },
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

    // ── 角色選擇（從 CHARACTERS 設定檔動態建立）
    const charSection = document.createElement('div');
    charSection.style.cssText = 'display:flex;flex-direction:column;align-items:center;';
    const charLabel = document.createElement('div');
    charLabel.style.cssText = 'font-size:13px;color:#aaa;margin-bottom:10px;letter-spacing:1px;';
    charLabel.textContent = t('characterLabel');
    charSection.appendChild(charLabel);

    let selectedChar = 'koel';
    // 從 CHARACTERS 物件建立解鎖角色列表，末尾附加鎖定佔位
    const chars = [];
    if (typeof CHARACTERS !== 'undefined') {
        for (const cid of Object.keys(CHARACTERS)) {
            const c = CHARACTERS[cid];
            const charKey = 'char' + cid.charAt(0).toUpperCase() + cid.slice(1);
            chars.push({ id: cid, label: t(charKey), locked: !c.unlocked });
        }
    } else {
        chars.push({ id: 'koel', label: t('charKoel'), locked: false });
    }
    // 加入即將推出佔位（CHARACTERS_COMING_SOON）
    if (typeof CHARACTERS_COMING_SOON !== 'undefined') {
        for (const cs of CHARACTERS_COMING_SOON) {
            chars.push({ id: cs.id, label: cs.icon + ' ' + cs.name, locked: true });
        }
    } else {
        chars.push({ id: 'soon', label: t('charSoon'), locked: true });
    }
    const charBtnEls = {};

    function refreshCharBtns() {
        for (const c of chars) {
            charBtnEls[c.id].style.cssText = c.locked ? btnLocked : (c.id === selectedChar ? btnActive : btnNormal);
        }
    }

    for (const c of chars) {
        const btn = document.createElement('button');
        btn.textContent = c.label + (c.locked ? '  🔒' : '');
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
        storageSet(STORAGE_KEYS.LAST_DIFFICULTY, selectedDiff); // B1: 儲存難度供重整頁面後恢復
        // 儲存角色選擇
        gameState.selectedCharacter = selectedChar;
        storageSet(STORAGE_KEYS.LAST_CHARACTER, selectedChar);
        overlay.remove();
        let hasOrgans = false;
        try {
            const so = storageGetJSON(STORAGE_KEYS.SAVED_ORGANS);
            hasOrgans = !!so && so.length > 0;
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

export function showStartScreen() {
    applyDeviceMode();
    if (sessionStorage.getItem('autostart')) {
        sessionStorage.removeItem('autostart');
        // 恢復上一場難度與地圖
        const lastDiff = storageGet(STORAGE_KEYS.LAST_DIFFICULTY) || 'easy';
        const _diffMapTable = { easy: EASY_MAP, normal: NORMAL_MAP, hard: HARD_MAP };
        gameState.currentMap        = _diffMapTable[lastDiff] || EASY_MAP;
        gameState.lastDifficulty    = lastDiff;
        gameState.selectedCharacter = storageGet(STORAGE_KEYS.LAST_CHARACTER) || 'koel';
        initializeGame();
        return;
    }
    const overlay = document.createElement('div');
    overlay.id = 'start-screen';
    overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:#0d1a0d;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:200;pointer-events:all;color:white;font-family:Arial,sans-serif;';

    const titleContainer = document.createElement('div');
    titleContainer.style.cssText = 'position:relative;display:inline-block;margin-bottom:10px;';
    const titleEl = document.createElement('div');
    titleEl.style.cssText = 'font-size:40px;font-weight:bold;letter-spacing:2px;';
    titleEl.textContent = GAME_INFO.title;
    titleContainer.appendChild(titleEl);
    overlay.appendChild(titleContainer);

    const subtitleEl = document.createElement('div');
    subtitleEl.style.cssText = 'font-size:16px;color:#aaa;letter-spacing:5px;margin-bottom:40px;';
    subtitleEl.textContent = GAME_INFO.subtitle;
    overlay.appendChild(subtitleEl);

    const menuBtnStyle = 'font-size:18px;padding:10px 0;cursor:pointer;pointer-events:all;border-radius:4px;color:white;width:220px;margin-bottom:12px;transition:all 0.18s ease;';

    function _addMenuHover(btn, normalBg, hoverBg, normalBorder, hoverBorder, shadowRgb) {
        if (gameState.isMobile) {
            btn.addEventListener('touchstart', () => { btn.style.transform = 'scale(0.97)'; });
            btn.addEventListener('touchend',   () => { btn.style.transform = 'scale(1)'; });
        } else {
            btn.onmouseenter = () => {
                btn.style.transform = 'scale(1.06)';
                btn.style.background = hoverBg;
                btn.style.boxShadow = '0 4px 18px rgba(' + shadowRgb + ', 0.45)';
                btn.style.borderColor = hoverBorder;
            };
            btn.onmouseleave = () => {
                btn.style.transform = 'scale(1)';
                btn.style.background = normalBg;
                btn.style.boxShadow = '';
                btn.style.borderColor = normalBorder;
            };
        }
    }

    const startBtn = document.createElement('button');
    startBtn.style.cssText = menuBtnStyle + 'background:#2a5a2a;border:1px solid #4a8a4a;';
    startBtn.textContent = t('startGame');
    startBtn.onclick = () => { hideChat(); showMapSelect(); };
    _addMenuHover(startBtn, '#2a5a2a', '#3a7a3a', '#4a8a4a', '#6aaa6a', '74,170,74');
    overlay.appendChild(startBtn);

    const skillBtn = document.createElement('button');
    skillBtn.style.cssText = menuBtnStyle + 'background:rgba(60,100,60,0.3);border:1px solid #4a7a4a;';
    skillBtn.textContent = t('skillTree');
    skillBtn.onclick = () => { hideChat(); buildSkillTreeOverlay(null, true); };
    _addMenuHover(skillBtn, 'rgba(60,100,60,0.3)', 'rgba(60,100,60,0.6)', '#4a7a4a', '#7aaa7a', '74,170,74');
    overlay.appendChild(skillBtn);

    const guideBtn = document.createElement('button');
    guideBtn.style.cssText = menuBtnStyle + 'background:rgba(90,80,40,0.3);border:1px solid #8a7a4a;';
    guideBtn.textContent = t('compendium');
    guideBtn.onclick = () => { hideChat(); showCompendium('guide'); };
    _addMenuHover(guideBtn, 'rgba(90,80,40,0.3)', 'rgba(130,110,50,0.6)', '#8a7a4a', '#baaa6a', '186,170,74');
    overlay.appendChild(guideBtn);

    const lbMenuBtn = document.createElement('button');
    lbMenuBtn.style.cssText = menuBtnStyle + 'background:rgba(80,60,10,0.3);border:1px solid #8a7a2a;';
    lbMenuBtn.textContent = t('leaderboard');
    lbMenuBtn.onclick = () => { hideChat(); showLeaderboard(); };
    _addMenuHover(lbMenuBtn, 'rgba(80,60,10,0.3)', 'rgba(120,90,15,0.6)', '#8a7a2a', '#baaa4a', '186,170,42');
    overlay.appendChild(lbMenuBtn);

    const settingsBtn = document.createElement('button');
    settingsBtn.style.cssText = menuBtnStyle + 'background:rgba(50,50,90,0.3);border:1px solid #4a4a8a;';
    settingsBtn.textContent = t('settings');
    settingsBtn.onclick = () => { hideChat(); showSettings(); };
    _addMenuHover(settingsBtn, 'rgba(50,50,90,0.3)', 'rgba(70,70,140,0.6)', '#4a4a8a', '#7a7aaa', '100,100,200');
    overlay.appendChild(settingsBtn);

    const footerEl = document.createElement('div');
    footerEl.style.cssText = 'position:absolute;bottom:16px;font-size:12px;color:#555;';
    footerEl.textContent = '© 2026 ' + GAME_INFO.author + '  |  ' + GAME_INFO.version;
    overlay.appendChild(footerEl);

    const top10Panel = document.createElement('div');
    top10Panel.id = 'top10-panel';
    // 手機版縮小至 scale(0.65)；桌機版維持原本的垂直置中
    const _top10PanelTransform = gameState.isMobile
        ? 'scale(0.65)'
        : 'translateY(-50%)';
    const _top10TransformOrigin = gameState.isMobile ? 'top right' : 'right center';
    const _top10Top = gameState.isMobile ? '16px' : '50%';
    top10Panel.style.cssText = 'position:absolute;right:16px;top:' + _top10Top + ';transform:' + _top10PanelTransform + ';transform-origin:' + _top10TransformOrigin + ';width:220px;background:rgba(0,0,0,0.75);border-radius:8px;padding:12px;color:white;font-family:Arial,sans-serif;font-size:13px;pointer-events:none;';

    // 標題列（含難度切換按鈕）
    const top10TitleRow = document.createElement('div');
    top10TitleRow.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:8px;';
    const top10Title = document.createElement('div');
    top10Title.style.cssText = 'color:#FFD700;font-weight:bold;font-size:14px;';
    top10Title.textContent = t('lbTop10Title');
    const top10DiffBtn = document.createElement('button');
    top10DiffBtn.style.cssText = 'background:rgba(255,255,255,0.12);border:1px solid #666;color:#FFD700;padding:2px 7px;border-radius:4px;cursor:pointer;font-size:11px;pointer-events:all;flex-shrink:0;';
    top10DiffBtn.textContent = t(_diffKey(_top10Difficulty));
    top10TitleRow.appendChild(top10Title);
    top10TitleRow.appendChild(top10DiffBtn);
    top10Panel.appendChild(top10TitleRow);

    const top10List = document.createElement('div');
    top10List.id = 'top10-list';
    top10List.innerHTML = t('lbLoading');
    top10Panel.appendChild(top10List);
    overlay.appendChild(top10Panel);

    function loadTop10() {
        top10List.innerHTML = t('lbLoading');
        fetchTop10(_top10Difficulty).then(rows => {
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
                const charKey = 'char' + (row.character || 'koel').charAt(0).toUpperCase() + (row.character || 'koel').slice(1);
                const charLabel = t(charKey);
                const row_el = document.createElement('div');
                row_el.style.cssText = 'display:flex;align-items:flex-start;gap:6px;margin-bottom:5px;';
                row_el.innerHTML = '<span style="min-width:28px;text-align:center;padding-top:2px;">' + rankIcon + '</span>' +
                    '<span style="flex:1;overflow:hidden;min-width:0;">' +
                        '<div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + name + '</div>' +
                        '<div style="font-size:11px;color:#aaa;">' + charLabel + '</div>' +
                    '</span>' +
                    '<span style="color:#aaa;white-space:nowrap;padding-top:2px;">' + timeStr + '</span>' +
                    '<span style="padding-top:2px;">' + result + '</span>';
                top10List.appendChild(row_el);
            });
        }).catch(() => { top10List.textContent = t('lbError'); });
    }

    // 難度切換：取得有資料的難度後循環，與全屏排行榜同步
    top10DiffBtn.onclick = () => {
        const availDiffs = ['easy', 'normal', 'hard'];
        const idx = availDiffs.indexOf(_top10Difficulty);
        _top10Difficulty = availDiffs[(idx + 1) % availDiffs.length];
        _lbDifficulty = _top10Difficulty;
        top10DiffBtn.textContent = t(_diffKey(_top10Difficulty));
        loadTop10();
    };

    loadTop10();

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
    bookBtn.onclick = () => { hideChat(); showGuideStory(); };

    // ── 更新日誌按鈕（在故事書按鈕下方）
    const patchBtn = document.createElement('div');
    patchBtn.id = 'patch-notes-btn';
    patchBtn.style.cssText = `
        position: absolute;
        top: 96px;
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
    patchBtn.innerHTML = '<div style="font-size:28px;line-height:1;">📋</div><div style="font-size:11px;color:#FFF5DC;letter-spacing:1px;margin-top:3px;">更新</div>';
    // B12: 未讀版本時顯示紅點
    if (typeof PATCH_NOTES !== 'undefined' && PATCH_NOTES.length > 0) {
        const lastSeen = storageGet(STORAGE_KEYS.LAST_SEEN_PATCH_VERSION) || '';
        if (lastSeen !== PATCH_NOTES[0].version) {
            const redDot = document.createElement('div');
            redDot.id = 'patch-red-dot';
            redDot.style.cssText = 'position:absolute;top:6px;right:8px;width:10px;height:10px;background:#ff3333;border-radius:50%;border:1.5px solid #fff;';
            patchBtn.style.position = 'absolute'; // already set
            patchBtn.appendChild(redDot);
        }
    }
    patchBtn.onmouseenter = () => {
        patchBtn.style.background = 'rgba(255, 220, 130, 0.28)';
        patchBtn.style.transform = 'scale(1.08)';
        patchBtn.style.borderColor = 'rgba(255, 220, 130, 0.8)';
    };
    patchBtn.onmouseleave = () => {
        patchBtn.style.background = 'rgba(255, 220, 130, 0.12)';
        patchBtn.style.transform = 'scale(1)';
        patchBtn.style.borderColor = 'rgba(255, 220, 130, 0.45)';
    };
    patchBtn.onclick = () => { hideChat(); showPatchNotes(); };
    overlay.appendChild(bookBtn);
    overlay.appendChild(patchBtn);

    // ── 首頁公告標籤（右上角旋轉印章）
    if (!document.getElementById('_badge-style')) {
        const s = document.createElement('style');
        s.id = '_badge-style';
        s.textContent = '@keyframes _badgePulse{0%,100%{transform:scale(1) rotate(8deg)}50%{transform:scale(1.12) rotate(8deg)}}#announce-badge{animation:_badgePulse 1.8s ease-in-out infinite}';
        document.head.appendChild(s);
    }
    const announceBadge = document.createElement('div');
    announceBadge.id = 'announce-badge';
    announceBadge.style.cssText = 'position:absolute;top:-18px;right:-120px;width:100px;height:64px;display:flex;align-items:center;justify-content:center;flex-direction:column;background:rgba(180,20,20,0.15);border:2px solid rgba(220,40,40,0.7);border-radius:6px;pointer-events:none;z-index:210;';
    const badgeLines = ['巨人覺醒！', '獵人入侵！'];
    let _badgeLine = 0;
    const badgeText = document.createElement('div');
    badgeText.style.cssText = 'font-size:15px;font-weight:bold;color:#FF3333;text-align:center;line-height:1.4;text-shadow:0 0 8px rgba(255,50,50,0.6);letter-spacing:1px;transition:opacity 0.3s ease;';
    badgeText.textContent = badgeLines[0];
    announceBadge.appendChild(badgeText);
    const _badgeInterval = setInterval(() => {
        const badge = document.getElementById('announce-badge');
        if (!badge) { clearInterval(_badgeInterval); return; }
        _badgeLine = (_badgeLine + 1) % badgeLines.length;
        badgeText.style.opacity = '0';
        setTimeout(() => { badgeText.textContent = badgeLines[_badgeLine]; badgeText.style.opacity = '1'; }, 300);
    }, 2500);
    titleContainer.appendChild(announceBadge);

    document.getElementById('game-container').appendChild(overlay);
    checkPatchNotesPopup();

    // 聊天室：建立 UI（只建一次），顯示面板並連線
    if (typeof buildChatUI === 'function') buildChatUI();
    if (typeof showChat === 'function') showChat();
    if (typeof initChat === 'function') initChat();

    // 首頁背景音樂
    if (typeof playIntroTheme === 'function') playIntroTheme();
}

// =============================================================
// Splash 畫面（開發者品牌）
// =============================================================

export function showSplashScreen() {
    const splash = document.createElement('div');
    splash.id = 'splash-screen';
    splash.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;z-index:9999;cursor:pointer;transition:opacity 0.8s ease;user-select:none;';

    const title = document.createElement('div');
    title.textContent = 'GOBLIN NEST';
    title.style.cssText = "font-family:Georgia,'Times New Roman',serif;font-size:clamp(28px,6vw,52px);font-weight:bold;letter-spacing:8px;color:#D4A017;text-shadow:2px 2px 0px #7a5500,4px 4px 0px #5a3e00,6px 6px 8px rgba(0,0,0,0.9);opacity:0;transform:translateY(6px);transition:opacity 1.2s ease,transform 1.2s ease;";

    const sub = document.createElement('div');
    sub.textContent = 'PRESENTS';
    sub.style.cssText = "font-family:Georgia,serif;font-size:clamp(10px,2vw,14px);letter-spacing:6px;color:rgba(212,160,23,0.6);opacity:0;transition:opacity 1.4s ease 0.3s;";

    const hint = document.createElement('div');
    hint.textContent = '點擊任意處繼續';
    hint.style.cssText = 'position:absolute;bottom:36px;font-size:12px;color:rgba(255,255,255,0.25);letter-spacing:2px;animation:_splashHint 2s ease-in-out infinite;';

    if (!document.getElementById('_splash-style')) {
        const s = document.createElement('style');
        s.id = '_splash-style';
        s.textContent = '@keyframes _splashHint{0%,100%{opacity:.25}50%{opacity:.6}}';
        document.head.appendChild(s);
    }

    splash.appendChild(title);
    splash.appendChild(sub);
    splash.appendChild(hint);
    document.body.appendChild(splash);

    requestAnimationFrame(() => {
        setTimeout(() => {
            title.style.opacity = '1';
            title.style.transform = 'translateY(0)';
            sub.style.opacity = '1';
        }, 100);
    });

    splash.addEventListener('click', () => {
        if (typeof playIntroTheme === 'function') playIntroTheme();
        splash.style.opacity = '0';
        setTimeout(() => { splash.remove(); showStartScreen(); }, 800);
    }, { once: true });
}

// =============================================================
// 版本更新公告系統
// =============================================================

export function showPatchNotes() {
    applyDeviceMode();
    if (document.getElementById('patch-notes-overlay')) return;

    const lastSeen = storageGet(STORAGE_KEYS.LAST_SEEN_PATCH_VERSION) || '';
    // 不立即標記已讀，改為追蹤本次已讀的版本 Tab
    const readInSession = new Set();

    const overlay = document.createElement('div');
    overlay.id = 'patch-notes-overlay';
    overlay.style.cssText = [
        'position:absolute', 'top:0', 'left:0', 'width:100%', 'height:100%',
        'background:rgba(0,0,0,0.88)', 'display:flex', 'align-items:center',
        'justify-content:center', 'z-index:210', 'pointer-events:all',
        'font-family:Arial,sans-serif'
    ].join(';');

    const panel = document.createElement('div');
    panel.style.cssText = [
        'background:#131f13', 'border:1px solid #3a5a3a', 'border-radius:10px',
        'width:92%', 'max-width:620px', 'max-height:85vh',
        'display:flex', 'flex-direction:column', 'overflow:hidden',
        'box-shadow:0 8px 40px rgba(0,0,0,0.7)'
    ].join(';');

    // ── 標題列
    const titleBar = document.createElement('div');
    titleBar.style.cssText = [
        'display:flex', 'align-items:center', 'justify-content:space-between',
        'padding:14px 20px', 'border-bottom:1px solid #2a4a2a',
        'flex-shrink:0'
    ].join(';');
    const titleText = document.createElement('div');
    titleText.style.cssText = 'font-size:18px;font-weight:bold;color:#FFD700;';
    titleText.textContent = t('patchNotesTitle');
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = [
        'background:transparent', 'border:1px solid #555', 'color:#aaa',
        'border-radius:4px', 'width:28px', 'height:28px', 'cursor:pointer',
        'font-size:14px', 'pointer-events:all', 'flex-shrink:0'
    ].join(';');
    closeBtn.onclick = () => {
        overlay.remove();
        if (document.getElementById('start-screen') && typeof showChat === 'function') showChat();
    };
    titleBar.appendChild(titleText);
    titleBar.appendChild(closeBtn);
    panel.appendChild(titleBar);

    // ── 主體：Tab 列 + 內容區
    const body = document.createElement('div');
    body.style.cssText = 'display:flex;flex:1;min-height:0;';

    // Tab 列（左側垂直）
    const tabCol = document.createElement('div');
    tabCol.style.cssText = [
        'width:170px', 'flex-shrink:0', 'overflow-y:auto',
        'border-right:1px solid #2a4a2a', 'padding:8px 0'
    ].join(';');

    // 當所有未讀 Tab 都被點開後，消除紅點並更新 lastSeenPatchVersion
    function _checkAllRead() {
        if (_unreadNotes.length === 0) return;
        const allRead = _unreadNotes.every(n => readInSession.has(n.version));
        if (allRead) {
            if (notes.length > 0) {
                storageSet(STORAGE_KEYS.LAST_SEEN_PATCH_VERSION, notes[0].version);
            }
            const _rd = document.getElementById('patch-red-dot');
            if (_rd) _rd.remove();
            tabCol.querySelectorAll('.pn-tab-dot').forEach(d => d.remove());
        }
    }

    // 內容區（右側）
    const contentArea = document.createElement('div');
    contentArea.style.cssText = [
        'flex:1', 'overflow-y:auto', 'padding:16px 20px',
        'color:white', 'font-size:14px', 'line-height:1.7'
    ].join(';');

    const notes = (typeof PATCH_NOTES !== 'undefined') ? PATCH_NOTES : [];
    let activeIdx = 0;

    // 計算未讀版本列表（比 lastSeen 更新的版本）
    const _lastSeenIdx = notes.findIndex(n => n.version === lastSeen);
    const _unreadNotes  = _lastSeenIdx === -1 ? notes.slice() : notes.slice(0, _lastSeenIdx);

    function renderContent(idx) {
        activeIdx = idx;
        const note = notes[idx];
        contentArea.innerHTML = '';
        if (!note) return;

        // 版本標題
        const vh = document.createElement('div');
        vh.style.cssText = 'font-size:17px;font-weight:bold;color:#FFD700;margin-bottom:4px;';
        vh.textContent = note.version;
        contentArea.appendChild(vh);

        const dateEl = document.createElement('div');
        dateEl.style.cssText = 'font-size:12px;color:#666;margin-bottom:16px;';
        dateEl.textContent = note.date;
        contentArea.appendChild(dateEl);

        const sections = [
            { key: 'added',   label: t('patchAdded'),   color: '#6fca6f', items: note.added   },
            { key: 'fixed',   label: t('patchFixed'),   color: '#6ab0e8', items: note.fixed   },
            { key: 'changed', label: t('patchChanged'), color: '#e8c46a', items: note.changed },
        ];

        sections.forEach(sec => {
            if (!sec.items || sec.items.length === 0) return;
            const secTitle = document.createElement('div');
            secTitle.style.cssText = 'font-size:13px;font-weight:bold;margin-bottom:6px;margin-top:12px;color:' + sec.color + ';';
            secTitle.textContent = sec.label;
            contentArea.appendChild(secTitle);

            sec.items.forEach(item => {
                const li = document.createElement('div');
                li.style.cssText = 'font-size:13px;color:#ccc;margin-bottom:5px;padding-left:12px;position:relative;';
                li.innerHTML = '<span style="position:absolute;left:0;color:' + sec.color + ';">•</span>' + item;
                contentArea.appendChild(li);
            });
        });

        // 更新 tab 高亮
        Array.from(tabCol.children).forEach((btn, i) => {
            btn.style.background = i === idx ? 'rgba(255,215,0,0.1)' : 'transparent';
            btn.style.borderLeft = i === idx ? '3px solid #FFD700' : '3px solid transparent';
            btn.style.color = i === idx ? '#FFD700' : '#aaa';
        });
    }

    notes.forEach((note, idx) => {
        const isUnread = note.version !== lastSeen &&
            notes.indexOf(note) < notes.findIndex(n => n.version === lastSeen) ||
            lastSeen === '';
        // 判斷是否為未讀（比 lastSeen 更新的版本）
        const lastSeenIdx = notes.findIndex(n => n.version === lastSeen);
        const unread = lastSeenIdx === -1 ? true : idx < lastSeenIdx;

        const tab = document.createElement('div');
        tab.style.cssText = [
            'padding:10px 14px', 'cursor:pointer', 'font-size:12px',
            'border-left:3px solid transparent', 'color:#aaa',
            'transition:all 0.15s', 'line-height:1.4',
            'pointer-events:all'
        ].join(';');

        const tabDate = document.createElement('div');
        tabDate.style.cssText = 'font-size:11px;color:#555;margin-top:2px;';
        tabDate.textContent = note.date;

        const tabVer = document.createElement('div');
        tabVer.style.cssText = 'display:flex;align-items:center;gap:5px;';
        tabVer.textContent = note.version;

        if (unread) {
            const dot = document.createElement('span');
            dot.className = 'pn-tab-dot';
            dot.style.cssText = [
                'width:7px', 'height:7px', 'border-radius:50%',
                'background:#FF4444', 'display:inline-block', 'flex-shrink:0'
            ].join(';');
            tabVer.appendChild(dot);
            tab.style.background = 'rgba(255,68,68,0.06)';
        }

        tab.appendChild(tabVer);
        tab.appendChild(tabDate);
        tab.onclick = () => {
            readInSession.add(note.version);
            _checkAllRead();
            renderContent(idx);
        };
        tabCol.appendChild(tab);
    });

    body.appendChild(tabCol);
    body.appendChild(contentArea);
    panel.appendChild(body);
    overlay.appendChild(panel);
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    document.getElementById('game-container').appendChild(overlay);

    // 預設顯示第一個（最新版本），並將第一個版本標記為已讀
    if (notes.length > 0) {
        readInSession.add(notes[0].version);
        _checkAllRead();
        renderContent(0);
    }
}

export function checkPatchNotesPopup() {
    // 新玩家不彈出
    if (!storageGet(STORAGE_KEYS.HAS_PLAYED_BEFORE)) return;
    if (typeof PATCH_NOTES === 'undefined' || PATCH_NOTES.length === 0) return;
    const lastSeen = storageGet(STORAGE_KEYS.LAST_SEEN_PATCH_VERSION) || '';
    if (lastSeen === PATCH_NOTES[0].version) return;
    // 有未讀版本，自動彈出
    setTimeout(() => showPatchNotes(), 400);
}

export function showGuideStory() {
    applyDeviceMode();
    if (document.getElementById('guide-story-overlay')) return;
    const chapter2Unlocked = storageGet(STORAGE_KEYS.CHAPTER2_UNLOCKED) === 'true';

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
    closeBtn.onclick = () => {
        overlay.remove();
        if (document.getElementById('start-screen') && typeof showChat === 'function') showChat();
    };

    book.appendChild(closeBtn);
    book.appendChild(illustrationArea);
    book.appendChild(textArea);
    book.appendChild(divider);
    book.appendChild(navArea);
    overlay.appendChild(book);
    document.getElementById('game-container').appendChild(overlay);

    const ALL_PAGES = _getGuideStoryPages();
    const PAGES = chapter2Unlocked ? ALL_PAGES : ALL_PAGES.slice(0, 4);
    let currentPage = 0;

    // ── 章節導航列
    const chapterNav = document.createElement('div');
    chapterNav.style.cssText = 'display:flex;gap:8px;padding:8px 16px;border-bottom:1px solid rgba(130,80,20,0.18);flex-shrink:0;';
    const ch1Tab = document.createElement('button');
    ch1Tab.textContent = '第一章';
    ch1Tab.style.cssText = 'padding:4px 12px;border-radius:12px;border:1px solid rgba(130,80,20,0.4);background:rgba(255,220,130,0.22);color:#4a2808;font-size:12px;cursor:pointer;font-family:Georgia,serif;';
    ch1Tab.onclick = () => { currentPage = 0; renderPage(0); };
    chapterNav.appendChild(ch1Tab);
    const ch2Tab = document.createElement('button');
    ch2Tab.style.cssText = 'padding:4px 12px;border-radius:12px;border:1px solid ' +
        (chapter2Unlocked ? 'rgba(130,80,20,0.4)' : 'rgba(100,100,100,0.3)') +
        ';background:' + (chapter2Unlocked ? 'rgba(255,220,130,0.22)' : 'rgba(80,80,80,0.15)') +
        ';color:' + (chapter2Unlocked ? '#4a2808' : '#888') + ';font-size:12px;cursor:pointer;font-family:Georgia,serif;';
    ch2Tab.textContent = chapter2Unlocked ? '第二章' : '第二章 🔒';
    ch2Tab.onclick = () => {
        if (!chapter2Unlocked) { alert('通關普通難度後解鎖'); return; }
        currentPage = 4; renderPage(4);
    };
    chapterNav.appendChild(ch2Tab);
    book.insertBefore(chapterNav, illustrationArea);

    function renderPage(idx) {
        const page = PAGES[idx];

        // 插畫切換（淡出 → 替換 → 淡入）
        illustrationArea.style.transition = 'opacity 0.3s ease';
        illustrationArea.style.opacity = '0';
        setTimeout(() => {
            if (page.customRender) {
                illustrationArea.innerHTML = '';
                page.customRender(illustrationArea);
            } else {
                illustrationArea.innerHTML = page.svgIllustration;
            }
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

        // 進度點（只顯示當前章節的頁數）
        dots.innerHTML = '';
        const chStart = idx < 4 ? 0 : 4;
        const chEnd   = idx < 4 ? Math.min(4, PAGES.length) : PAGES.length;
        for (let i = chStart; i < chEnd; i++) {
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
            nextBtn.textContent = t('btnStartAdventure');
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
            storageSet(STORAGE_KEYS.HAS_PLAYED_BEFORE, 'true');
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
        },

        // ── 第二章（需通關普通難度解鎖）
        {
            icon: '🥾',
            title: '第三章 — 獵人的足跡',
            svgIllustration: svgStyle + `<svg width="100%" viewBox="0 0 520 200" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
<rect x="0" y="0" width="520" height="200" fill="#060d06"/>
<polygon points="0,200 80,200 0,120" fill="#0a1a0a"/>
<polygon points="40,200 130,200 40,105" fill="#0c1e0c"/>
<polygon points="100,200 200,200 100,110" fill="#091508"/>
<polygon points="380,200 470,200 380,108" fill="#091508"/>
<polygon points="440,200 520,200 520,130" fill="#0a1a0a"/>
<g style="animation:_drift 12s ease-in-out infinite alternate" opacity="0.7">
  <ellipse cx="260" cy="90" rx="90" ry="35" fill="#0d1f0d"/>
  <ellipse cx="260" cy="82" rx="70" ry="25" fill="#122512"/>
</g>
<ellipse cx="260" cy="185" rx="22" ry="6" fill="#1a1a10"/>
<path d="M244 185 Q252 168 256 175 Q258 178 260 178 Q262 178 264 175 Q268 168 276 185Z" fill="#2a2a18"/>
<ellipse cx="244" cy="187" rx="10" ry="4" fill="#3a3020" opacity="0.9"/>
<ellipse cx="276" cy="187" rx="10" ry="4" fill="#3a3020" opacity="0.9"/>
<g opacity="0.35" style="animation:_emerge 4s ease-out forwards 1s">
  <ellipse cx="180" cy="130" rx="18" ry="32" fill="#1a2a18"/>
  <ellipse cx="180" cy="112" rx="10" ry="12" fill="#1a2a18"/>
  <ellipse cx="173" cy="108" rx="5" ry="8" fill="#151f14"/>
  <ellipse cx="187" cy="108" rx="5" ry="8" fill="#151f14"/>
</g>
<circle cx="350" cy="55" r="1" fill="#c8e0a0" opacity="0.4"/>
<circle cx="400" cy="30" r="0.8" fill="#c8e0a0" opacity="0.3"/>
<circle cx="460" cy="48" r="1.2" fill="#c8e0a0" opacity="0.5"/>
<text x="260" y="196" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="#4a6a38" opacity="0.7">不是野獸的腳印。是靴子。</text>
</svg>`,
            content: `三個王都倒下了。

森林安靜了片刻——
但那種安靜，不像是和平。
更像是……有什麼東西在屏住呼吸。

你的紅眼在黑暗中掃視四方。
某個角落，留著一個腳印。
不是野獸的。

是靴子。`
        },
        {
            icon: '🔫',
            title: '第三章 — 獵人的足跡',
            svgIllustration: svgStyle + `<svg width="100%" viewBox="0 0 520 200" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
<rect x="0" y="0" width="520" height="200" fill="#080808"/>
<g style="animation:_drift 15s ease-in-out infinite alternate" opacity="0.4">
  <ellipse cx="400" cy="60" rx="100" ry="40" fill="#2a1a08"/>
</g>
<g style="animation:_bfloat 3s ease-in-out infinite">
  <ellipse cx="180" cy="145" rx="12" ry="5" fill="#c8a040" opacity="0.9"/>
  <rect x="130" y="138" width="100" height="14" rx="4" fill="#b89030" opacity="0.85"/>
  <ellipse cx="130" cy="145" rx="12" ry="5" fill="#c8a040" opacity="0.9"/>
</g>
<g style="animation:_bfloat 3s ease-in-out infinite 1.1s">
  <ellipse cx="310" cy="160" rx="10" ry="4" fill="#c0982a" opacity="0.8"/>
  <rect x="264" y="154" width="92" height="12" rx="4" fill="#a88020" opacity="0.75"/>
  <ellipse cx="264" cy="160" rx="10" ry="4" fill="#c0982a" opacity="0.8"/>
</g>
<g style="animation:_bfloat 3s ease-in-out infinite 0.6s">
  <ellipse cx="390" cy="148" rx="9" ry="3.5" fill="#c8a040" opacity="0.7"/>
  <rect x="347" y="143" width="86" height="11" rx="3.5" fill="#b08828" opacity="0.7"/>
  <ellipse cx="347" cy="148" rx="9" ry="3.5" fill="#c8a040" opacity="0.7"/>
</g>
<ellipse cx="420" cy="55" rx="55" ry="18" fill="#1a1a10" opacity="0.6"/>
<ellipse cx="430" cy="46" rx="40" ry="12" fill="#2a2a18" opacity="0.7"/>
<ellipse cx="450" cy="38" rx="25" ry="8" fill="#3a3a20" opacity="0.5"/>
<text x="260" y="196" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="#886040" opacity="0.75">他們只是在等你——暴露自己的位置。</text>
</svg>`,
            content: `你想起養父說過的話：
「三個獵人進木屋，只有兩個出來。
裡面還藏著一個。」

你以為消滅了王，就能掌控這片土地。
但淨音軍從未停止計算。
他們只是在等你——
暴露自己的位置。`
        },
        {
            icon: '🎯',
            title: '第三章 — 獵人的足跡',
            svgIllustration: svgStyle + `<svg width="100%" viewBox="0 0 520 200" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
<rect x="0" y="0" width="520" height="200" fill="#030303"/>
<path d="M195 10 Q260 0 325 10 L340 200 L180 200Z" fill="#080808"/>
<path d="M210 15 Q260 6 310 15 L322 200 L198 200Z" fill="#0c0c0c"/>
<ellipse style="animation:_rpulse 3s ease-in-out infinite" cx="247" cy="75" r="3.5" fill="#cc2222" opacity="0.9"/>
<ellipse style="animation:_rpulse 3s ease-in-out infinite 0.4s" cx="273" cy="75" r="3.5" fill="#cc2222" opacity="0.9"/>
<ellipse cx="247" cy="75" r="1.5" fill="#000"/>
<ellipse cx="273" cy="75" r="1.5" fill="#000"/>
<text x="260" y="196" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="#662222" opacity="0.8">你的名字，已經在他們的名單上了。</text>
</svg>`,
            content: `靜音獵隊。

他們不像普通獵人那樣大聲喧嘩。
沒有叫喊，沒有腳步聲。
只有一顆子彈，和它飛行的聲音。

你的名字，已經在他們的名單上了。`
        },
        {
            icon: '⏳',
            title: '靜音獵隊正在逼近……',
            svgIllustration: null,
            customRender: (illustrationArea) => {
                illustrationArea.style.background = '#0a0a0a';
                illustrationArea.style.display = 'flex';
                illustrationArea.style.flexDirection = 'column';
                illustrationArea.style.alignItems = 'center';
                illustrationArea.style.justifyContent = 'center';
                illustrationArea.style.gap = '16px';

                const comingSoonText = '靜音獵隊正在逼近……';
                const textEl = document.createElement('div');
                textEl.style.cssText = 'font-size:20px;color:#CC2222;font-family:Georgia,serif;letter-spacing:3px;opacity:0;transition:opacity 0.08s ease;';
                illustrationArea.appendChild(textEl);

                const cursor = document.createElement('span');
                cursor.textContent = '|';
                cursor.style.cssText = 'color:#CC2222;animation:_cursorBlink 0.8s infinite;';

                if (!document.getElementById('_cursor-style')) {
                    const style = document.createElement('style');
                    style.id = '_cursor-style';
                    style.textContent = '@keyframes _cursorBlink{0%,100%{opacity:1}50%{opacity:0}}';
                    document.head.appendChild(style);
                }

                let i = 0;
                const interval = setInterval(() => {
                    if (i < comingSoonText.length) {
                        textEl.textContent = comingSoonText.slice(0, i + 1);
                        textEl.appendChild(cursor);
                        textEl.style.opacity = '1';
                        i++;
                    } else {
                        clearInterval(interval);
                    }
                }, 80);

                const subText = document.createElement('div');
                subText.style.cssText = 'font-size:13px;color:#666;letter-spacing:2px;margin-top:8px;font-family:Georgia,serif;';
                subText.textContent = '— 下一章 即將到來 —';
                setTimeout(() => { illustrationArea.appendChild(subText); }, comingSoonText.length * 80 + 400);
            },
            content: ''
        }
    ];
}

// showLeaderboard() 已移至 systems/leaderboard.js
// showScoreSubmitPopup() 已移至 systems/leaderboard.js

export function buildEndGameOverlay(options) {
    const overlay = document.createElement('div');
    overlay.id = options.id;
    overlay.style.cssText = options.overlayStyle;

    const title = document.createElement('div');
    title.style.cssText = options.titleStyle;
    title.textContent = options.titleText;
    overlay.appendChild(title);

    (options.content || []).forEach(section => {
        const el = document.createElement('div');
        el.style.cssText = section.style;
        if (section.html !== undefined) {
            el.innerHTML = section.html;
        } else {
            el.textContent = section.text || '';
        }
        overlay.appendChild(el);
    });

    if (options.primaryButton) {
        const primary = document.createElement('button');
        primary.style.cssText = options.primaryButton.style;
        primary.textContent = options.primaryButton.text;
        primary.onclick = options.primaryButton.onClick;
        overlay.appendChild(primary);
    }

    const btnRow = document.createElement('div');
    btnRow.style.cssText = options.buttonRowStyle;
    const warnEl = document.createElement('div');
    warnEl.style.cssText = options.warningStyle;
    btnRow.appendChild(warnEl);

    const rowInner = document.createElement('div');
    rowInner.style.cssText = options.buttonInnerStyle;
    (options.secondaryButtons || []).forEach(buttonDef => {
        const btn = document.createElement('button');
        btn.style.cssText = buttonDef.style;
        btn.textContent = buttonDef.text;
        if (buttonDef.warningText) {
            let warned = false;
            btn.onclick = () => {
                if (!warned) {
                    warned = true;
                    warnEl.textContent = buttonDef.warningText;
                    warnEl.style.display = 'block';
                    return;
                }
                buttonDef.onClick();
            };
        } else {
            btn.onclick = buttonDef.onClick;
        }
        rowInner.appendChild(btn);
    });
    btnRow.appendChild(rowInner);
    overlay.appendChild(btnRow);

    if (options.footerText) {
        const footer = document.createElement('div');
        footer.style.cssText = options.footerStyle;
        footer.textContent = options.footerText;
        overlay.appendChild(footer);
    }

    if (options.devWarningText) {
        const devWarn = document.createElement('div');
        devWarn.style.cssText = options.devWarningStyle;
        devWarn.textContent = options.devWarningText;
        overlay.appendChild(devWarn);
    }

    return overlay;
}
