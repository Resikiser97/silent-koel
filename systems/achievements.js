// =============================================================
// systems/achievements.js — 成就系統讀寫入口
// =============================================================
//
// 【對外公開函式】
//   unlockAchievement(id)     — 寫入 localStorage，idempotent
//   isUnlocked(id)            — 回傳 boolean
//   getUnlockedAchievements() — 回傳 { [id]: { unlockedAt } }
//   getActiveTitle()          — 讀取目前啟用稱號
//   setActiveTitle(title)     — 寫入目前啟用稱號
//   showAchievements(opts)    — 顯示成就 overlay（opts: { onTitleSync, onShowLogin }）
//
// 【依賴】
//   storage/index.js（只依賴此層，不 import 任何 systems/ 模組）
//   config/achievements.js
//   lang.js（t()）
// =============================================================

import { STORAGE_KEYS, storageGet, storageSet, storageGetJSON, storageSetJSON } from '../storage/index.js';
import { ACHIEVEMENTS } from '../config/achievements.js';
import { t } from '../lang.js';

const ACTIVE_TITLE_KEY = 'activeTitle';

export function unlockAchievement(id) {
    const data = storageGetJSON(STORAGE_KEYS.ACHIEVEMENTS) || {};
    if (data[id]) return; // idempotent：已解鎖不覆蓋
    data[id] = { unlockedAt: new Date().toISOString() };
    storageSetJSON(STORAGE_KEYS.ACHIEVEMENTS, data);
}

export function isUnlocked(id) {
    const data = storageGetJSON(STORAGE_KEYS.ACHIEVEMENTS) || {};
    return Boolean(data[id]);
}

export function getUnlockedAchievements() {
    return storageGetJSON(STORAGE_KEYS.ACHIEVEMENTS) || {};
}

export function getActiveTitle() {
    return storageGet(ACTIVE_TITLE_KEY);
}

export function setActiveTitle(title) {
    storageSet(ACTIVE_TITLE_KEY, title);
}

// =============================================================
// 成就 Overlay UI
// =============================================================

const PAGE_SIZE = 9;

function _fmtDate(isoStr) {
    if (!isoStr) return '—';
    try {
        const d = new Date(isoStr);
        return d.getFullYear() + '-' +
            String(d.getMonth() + 1).padStart(2, '0') + '-' +
            String(d.getDate()).padStart(2, '0');
    } catch(e) { return '—'; }
}

function _daysSince(isoStr) {
    if (!isoStr) return '—';
    try {
        const start = new Date(isoStr);
        const now   = new Date();
        const diff  = Math.floor((now - start) / 86400000);
        return diff + ' ' + t('achievementDaysPlayed');
    } catch(e) { return '—'; }
}

/**
 * showAchievements(opts)
 * opts.onTitleSync(title|null)  — 同步稱號至伺服器（由 ui.js 提供）
 * opts.onShowLogin()            — 開啟聊天室登入（由 ui.js 提供）
 * opts.isLoggedIn               — boolean，是否已登入
 */
export function showAchievements(opts = {}) {
    if (document.getElementById('achievement-overlay')) return;
    const { onTitleSync, onShowLogin, isLoggedIn } = opts;

    const unlocked = getUnlockedAchievements();
    const firstPlayDate = storageGet('firstPlayDate');
    const total = ACHIEVEMENTS.length;

    let currentPage = 0;
    let selectedIdx = null; // index in ACHIEVEMENTS

    // 預設選中第一個已解鎖成就
    const firstUnlockedIdx = ACHIEVEMENTS.findIndex(a => unlocked[a.id]);
    selectedIdx = firstUnlockedIdx >= 0 ? firstUnlockedIdx : 0;

    const overlay = document.createElement('div');
    overlay.id = 'achievement-overlay';
    overlay.style.cssText = [
        'position:absolute', 'top:0', 'left:0', 'width:100%', 'height:100%',
        'background:rgba(0,0,0,0.82)', 'display:flex', 'align-items:center',
        'justify-content:center', 'z-index:220', 'pointer-events:all',
        'color:white', 'font-family:Arial,sans-serif'
    ].join(';');

    const panel = document.createElement('div');
    panel.style.cssText = [
        'background:#1c1c1c', 'border:1px solid #555', 'border-radius:10px',
        'padding:18px 20px', 'width:92%', 'max-width:640px',
        'max-height:88vh', 'overflow-y:auto', 'box-sizing:border-box'
    ].join(';');

    // ── Header ──────────────────────────────────────────────
    const headerRow = document.createElement('div');
    headerRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;position:relative;';

    const titleEl = document.createElement('div');
    titleEl.style.cssText = 'font-size:20px;font-weight:bold;color:#FFD700;';

    const countEl = document.createElement('span');
    countEl.style.cssText = 'font-size:13px;font-weight:normal;color:#aaa;margin-left:8px;';

    const titleBtnRow = document.createElement('div');
    titleBtnRow.style.cssText = 'display:flex;align-items:center;gap:8px;';

    const titleBtn = document.createElement('button');
    titleBtn.style.cssText = 'padding:4px 12px;border-radius:6px;font-size:12px;cursor:pointer;border:1px solid rgba(136,204,255,0.5);background:rgba(60,130,180,0.25);color:#88CCFF;transition:all 0.15s ease;white-space:nowrap;';

    const closeBtn = document.createElement('button');
    closeBtn.style.cssText = 'padding:4px 10px;border-radius:6px;font-size:13px;cursor:pointer;border:1px solid #555;background:rgba(80,80,80,0.3);color:#ccc;';
    closeBtn.textContent = '✕';
    closeBtn.onclick = () => overlay.remove();

    titleBtnRow.appendChild(titleBtn);
    titleBtnRow.appendChild(closeBtn);

    const leftTitle = document.createElement('div');
    leftTitle.style.cssText = 'display:flex;align-items:baseline;gap:4px;';
    leftTitle.appendChild(titleEl);
    leftTitle.appendChild(countEl);

    headerRow.appendChild(leftTitle);
    headerRow.appendChild(titleBtnRow);
    panel.appendChild(headerRow);

    // ── Body（左格子 + 右說明）───────────────────────────────
    const body = document.createElement('div');
    body.style.cssText = 'display:flex;gap:12px;align-items:flex-start;';

    // 左側格子區
    const leftCol = document.createElement('div');
    leftCol.style.cssText = 'flex-shrink:0;width:210px;';

    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:8px;';
    leftCol.appendChild(grid);

    // 分頁控制列
    const pageRow = document.createElement('div');
    pageRow.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:10px;margin-top:6px;';
    const prevPageBtn = document.createElement('button');
    prevPageBtn.textContent = '◀';
    prevPageBtn.style.cssText = 'padding:2px 8px;cursor:pointer;border:1px solid #555;background:#2a2a2a;color:white;border-radius:4px;';
    const pageLbl = document.createElement('span');
    pageLbl.style.cssText = 'font-size:12px;color:#aaa;';
    const nextPageBtn = document.createElement('button');
    nextPageBtn.textContent = '▶';
    nextPageBtn.style.cssText = prevPageBtn.style.cssText;

    pageRow.appendChild(prevPageBtn);
    pageRow.appendChild(pageLbl);
    pageRow.appendChild(nextPageBtn);
    leftCol.appendChild(pageRow);

    // 右側說明欄
    const rightCol = document.createElement('div');
    rightCol.style.cssText = 'flex:1;background:rgba(255,255,255,0.04);border:1px solid #333;border-radius:6px;padding:14px 16px;min-height:220px;box-sizing:border-box;font-size:13px;line-height:1.7;';

    body.appendChild(leftCol);
    body.appendChild(rightCol);
    panel.appendChild(body);

    overlay.appendChild(panel);
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    document.getElementById('game-container').appendChild(overlay);

    // ── 稱號選擇 pop-up ──────────────────────────────────────
    let _titlePopup = null;

    function _closeTitlePopup() {
        if (_titlePopup) { _titlePopup.remove(); _titlePopup = null; }
    }

    function _buildTitlePopup() {
        _closeTitlePopup();
        const popup = document.createElement('div');
        popup.style.cssText = [
            'position:absolute', 'top:44px', 'right:32px',
            'background:#1c1c1c', 'border:1px solid #444', 'border-radius:8px',
            'padding:10px 14px', 'min-width:200px', 'max-width:280px',
            'z-index:230', 'font-size:13px', 'color:white',
            'box-shadow:0 4px 16px rgba(0,0,0,0.6)'
        ].join(';');

        if (!isLoggedIn) {
            // 未登入提示
            const msg = document.createElement('div');
            msg.style.cssText = 'margin-bottom:10px;color:#ccc;';
            msg.textContent = t('achievementLoginRequired');
            popup.appendChild(msg);
            const loginBtn = document.createElement('button');
            loginBtn.style.cssText = 'width:100%;padding:6px;cursor:pointer;border:1px solid #4a8a4a;background:#2a5a2a;color:white;border-radius:4px;';
            loginBtn.textContent = t('achievementGoLogin');
            loginBtn.onclick = () => {
                _closeTitlePopup();
                overlay.remove();
                if (typeof onShowLogin === 'function') onShowLogin();
            };
            popup.appendChild(loginBtn);
        } else {
            // 已解鎖稱號列表
            const titledAchievements = ACHIEVEMENTS.filter(a => a.title && unlocked[a.id]);
            if (titledAchievements.length === 0) {
                const empty = document.createElement('div');
                empty.style.cssText = 'color:#888;';
                empty.textContent = t('achievementNoTitle');
                popup.appendChild(empty);
            } else {
                const activeTitle = getActiveTitle();
                titledAchievements.forEach(a => {
                    const item = document.createElement('div');
                    const isActive = activeTitle === a.title;
                    item.style.cssText = [
                        'display:flex', 'align-items:center', 'justify-content:space-between',
                        'padding:6px 8px', 'border-radius:4px', 'cursor:pointer', 'margin-bottom:4px',
                        'border:1px solid ' + (isActive ? 'rgba(136,204,255,0.6)' : 'transparent'),
                        'background:' + (isActive ? 'rgba(60,130,180,0.2)' : 'transparent'),
                        'transition:background 0.15s'
                    ].join(';');

                    const nameEl = document.createElement('span');
                    nameEl.innerHTML = '<span style="color:#88CCFF;">[' + a.title + ']</span>'
                        + '<span style="color:#888;font-size:11px;margin-left:4px;">'
                        + t('achievementTitleFrom') + a.name + '</span>';

                    const checkEl = document.createElement('span');
                    checkEl.style.cssText = 'color:#4aCC4a;font-size:14px;margin-left:6px;flex-shrink:0;';
                    checkEl.textContent = isActive ? '✓' : '';

                    item.appendChild(nameEl);
                    item.appendChild(checkEl);
                    item.onmouseenter = () => { if (!isActive) item.style.background = 'rgba(255,255,255,0.06)'; };
                    item.onmouseleave = () => { if (!isActive) item.style.background = 'transparent'; };
                    item.onclick = () => {
                        if (isActive) {
                            setActiveTitle(null);
                            if (typeof onTitleSync === 'function') onTitleSync(null);
                        } else {
                            setActiveTitle(a.title);
                            if (typeof onTitleSync === 'function') onTitleSync(a.title);
                        }
                        _closeTitlePopup();
                        _render(); // 重繪以更新稱號按鈕狀態
                    };
                    popup.appendChild(item);
                });
            }
        }

        // 點擊 overlay panel 以外關閉
        const closeOnOut = (e) => {
            if (!popup.contains(e.target) && e.target !== titleBtn) {
                _closeTitlePopup();
                document.removeEventListener('click', closeOnOut, true);
            }
        };
        setTimeout(() => document.addEventListener('click', closeOnOut, true), 0);

        panel.style.position = 'relative';
        panel.appendChild(popup);
        _titlePopup = popup;
    }

    titleBtn.onclick = () => {
        if (_titlePopup) { _closeTitlePopup(); return; }
        _buildTitlePopup();
    };

    // ── 渲染函式 ─────────────────────────────────────────────
    function _render() {
        const unlockedCount = Object.keys(unlocked).length;
        const totalPages = Math.ceil(total / PAGE_SIZE);

        titleEl.textContent = t('achievementTitle');
        countEl.textContent = '(' + unlockedCount + ' / ' + total + ')';

        // 稱號按鈕標籤
        const activeTitle = getActiveTitle();
        titleBtn.textContent = activeTitle
            ? '[' + activeTitle + '] ▾'
            : t('achievementTitleActive') + ' ▾';

        // 確保 selectedIdx 在當前頁
        currentPage = Math.floor(selectedIdx / PAGE_SIZE);
        currentPage = Math.max(0, Math.min(currentPage, totalPages - 1));

        // 格子
        grid.innerHTML = '';
        const start = currentPage * PAGE_SIZE;
        const end = Math.min(start + PAGE_SIZE, total);
        for (let i = start; i < end; i++) {
            const a = ACHIEVEMENTS[i];
            const isUnlockedA = !!unlocked[a.id];
            const isSelected = (i === selectedIdx);
            const isHidden = (a.category === 'hidden');

            const cell = document.createElement('div');
            cell.style.cssText = [
                'display:flex', 'flex-direction:column', 'align-items:center', 'justify-content:center',
                'width:62px', 'height:62px', 'border-radius:8px', 'cursor:pointer',
                'border:2px solid ' + (isSelected ? '#FFD700' : (isUnlockedA ? '#555' : '#333')),
                'background:' + (isUnlockedA ? 'rgba(255,215,0,0.08)' : 'rgba(40,40,40,0.8)'),
                'transition:all 0.15s', 'user-select:none'
            ].join(';');

            const iconEl = document.createElement('div');
            iconEl.style.cssText = 'font-size:24px;line-height:1;';
            if (isUnlockedA) {
                iconEl.textContent = '🏆';
            } else {
                iconEl.textContent = '？';
                iconEl.style.cssText += 'color:#555;font-weight:bold;font-size:20px;';
            }

            const nameEl2 = document.createElement('div');
            nameEl2.style.cssText = 'font-size:9px;color:' + (isUnlockedA ? '#FFD700' : '#555') + ';text-align:center;line-height:1.2;margin-top:3px;max-width:58px;overflow:hidden;';
            if (isUnlockedA) {
                nameEl2.textContent = a.name;
            } else if (isHidden) {
                nameEl2.textContent = '???';
            } else {
                nameEl2.textContent = a.name;
                nameEl2.style.color = '#444';
            }

            cell.appendChild(iconEl);
            cell.appendChild(nameEl2);
            cell.onclick = () => { selectedIdx = i; _render(); };
            cell.onmouseenter = () => { if (i !== selectedIdx) cell.style.borderColor = '#888'; };
            cell.onmouseleave = () => { if (i !== selectedIdx) cell.style.borderColor = isUnlockedA ? '#555' : '#333'; };
            grid.appendChild(cell);
        }

        // 分頁
        pageLbl.textContent = currentPage + 1 + ' / ' + totalPages;
        prevPageBtn.disabled = currentPage === 0;
        nextPageBtn.disabled = currentPage === totalPages - 1;
        prevPageBtn.style.opacity = prevPageBtn.disabled ? '0.35' : '1';
        nextPageBtn.style.opacity = nextPageBtn.disabled ? '0.35' : '1';

        // 右側說明
        rightCol.innerHTML = '';
        if (selectedIdx === null || selectedIdx < 0) {
            // 無選中時顯示總覽
            _renderRightDefault(rightCol, unlockedCount, total, firstPlayDate);
        } else {
            const sel = ACHIEVEMENTS[selectedIdx];
            const selUnlocked = unlocked[sel.id];
            const isHiddenSel = (sel.category === 'hidden');
            _renderRightDetail(rightCol, sel, selUnlocked, isHiddenSel);
        }
    }

    function _renderRightDefault(col, unlockedCount, total, firstPlayDate) {
        const prog = document.createElement('div');
        prog.style.cssText = 'font-size:15px;font-weight:bold;color:#FFD700;margin-bottom:10px;';
        prog.textContent = t('achievementProgress') + ': ' + unlockedCount + ' / ' + total;
        col.appendChild(prog);

        const days = document.createElement('div');
        days.style.cssText = 'color:#aaa;';
        days.textContent = _daysSince(firstPlayDate);
        col.appendChild(days);
    }

    function _renderRightDetail(col, a, unlockedEntry, isHidden) {
        const nameEl = document.createElement('div');
        nameEl.style.cssText = 'font-size:16px;font-weight:bold;color:#FFD700;margin-bottom:8px;';
        nameEl.textContent = (isHidden && !unlockedEntry) ? '???' : a.name;
        col.appendChild(nameEl);

        if (a.title) {
            const titleTagEl = document.createElement('div');
            titleTagEl.style.cssText = 'font-size:12px;color:#88CCFF;margin-bottom:8px;';
            titleTagEl.textContent = '稱號：[' + a.title + ']';
            col.appendChild(titleTagEl);
        }

        const howToLabel = document.createElement('div');
        howToLabel.style.cssText = 'font-size:11px;color:#888;margin-bottom:3px;';
        howToLabel.textContent = t('achievementHowTo') + '：';
        col.appendChild(howToLabel);

        const howTo = document.createElement('div');
        howTo.style.cssText = 'color:#ddd;margin-bottom:12px;';
        howTo.textContent = (isHidden && !unlockedEntry) ? '???' : a.description;
        col.appendChild(howTo);

        const dateLabel = document.createElement('div');
        dateLabel.style.cssText = 'font-size:11px;color:#888;margin-bottom:3px;';
        dateLabel.textContent = t('achievementUnlocked') + '：';
        col.appendChild(dateLabel);

        const dateVal = document.createElement('div');
        dateVal.style.cssText = 'color:' + (unlockedEntry ? '#4aCC4a' : '#555') + ';';
        dateVal.textContent = unlockedEntry ? _fmtDate(unlockedEntry.unlockedAt) : '—';
        col.appendChild(dateVal);
    }

    prevPageBtn.onclick = () => {
        if (currentPage > 0) {
            currentPage--;
            selectedIdx = currentPage * PAGE_SIZE;
            _render();
        }
    };
    nextPageBtn.onclick = () => {
        const totalPages = Math.ceil(total / PAGE_SIZE);
        if (currentPage < totalPages - 1) {
            currentPage++;
            selectedIdx = currentPage * PAGE_SIZE;
            _render();
        }
    };

    _render();
}
