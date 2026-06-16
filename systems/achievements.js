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
import { CHARACTERS } from '../config/characters.js';
import { calcPlayerStats } from '../config/playerStatsFormula.js';
import { t } from '../lang.js';

const ACTIVE_TITLE_KEY = 'activeTitle';

export function unlockAchievement(id) {
    const data = storageGetJSON(STORAGE_KEYS.ACHIEVEMENTS) || {};
    if (data[id]) return; // idempotent：已解鎖不覆蓋
    data[id] = { unlockedAt: new Date().toISOString() };
    storageSetJSON(STORAGE_KEYS.ACHIEVEMENTS, data);
    // 完全體：所有非 hidden 成就全部解鎖時自動觸發
    if (id !== 'all_achievements') {
        const nonHidden = ACHIEVEMENTS.filter(a => a.category !== 'hidden');
        if (nonHidden.every(a => data[a.id])) {
            data['all_achievements'] = { unlockedAt: new Date().toISOString() };
            storageSetJSON(STORAGE_KEYS.ACHIEVEMENTS, data);
        }
    }
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
    if (firstPlayDate) {
        const _days = Math.floor((Date.now() - new Date(firstPlayDate)) / 86400000);
        if (_days >= 30) unlockAchievement('veteran_days');
    }
    const total = ACHIEVEMENTS.length;

    let currentPage = 0;
    let selectedIdx = null; // null = 顯示屬性面板；數字 = 顯示成就詳情

    // 角色切換（屬性面板用）
    const charIds      = Object.keys(CHARACTERS);
    const _lastCharId  = storageGet(STORAGE_KEYS.LAST_CHARACTER);
    let   statsCharIdx = Math.max(0, charIds.indexOf(_lastCharId));

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
        countEl.textContent = t('achievementCountFmt', { unlocked: unlockedCount, total });

        // 稱號按鈕標籤
        const activeTitle = getActiveTitle();
        titleBtn.textContent = activeTitle
            ? '[' + activeTitle + '] ▾'
            : t('achievementTitleActive') + ' ▾';

        // 確保 selectedIdx 在當前頁（null 時維持 currentPage 不動）
        if (selectedIdx !== null) {
            currentPage = Math.floor(selectedIdx / PAGE_SIZE);
            currentPage = Math.max(0, Math.min(currentPage, totalPages - 1));
        }

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
                nameEl2.textContent = t('achievementHidden');
            } else {
                nameEl2.textContent = a.name;
                nameEl2.style.color = '#444';
            }

            cell.appendChild(iconEl);
            cell.appendChild(nameEl2);
            cell.onclick = () => { selectedIdx = (selectedIdx === i) ? null : i; _render(); };
            cell.onmouseenter = () => { if (i !== selectedIdx) cell.style.borderColor = '#888'; };
            cell.onmouseleave = () => { if (i !== selectedIdx) cell.style.borderColor = isUnlockedA ? '#555' : '#333'; };
            grid.appendChild(cell);
        }

        // 分頁
        pageLbl.textContent = t('achievementPageFmt', { cur: currentPage + 1, total: totalPages });
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
        // ── Header：📊 當前屬性 + 角色切換 ──────────────────────
        const hdr = document.createElement('div');
        hdr.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;';

        const hdrTitle = document.createElement('span');
        hdrTitle.style.cssText = 'font-size:13px;font-weight:bold;color:#88CCFF;';
        hdrTitle.textContent = '📊 ' + t('statPanelTitle');

        const switcher = document.createElement('div');
        switcher.style.cssText = 'display:flex;align-items:center;gap:3px;';

        const prevBtn = document.createElement('button');
        prevBtn.textContent = '←';
        prevBtn.style.cssText = 'padding:1px 6px;cursor:pointer;border:1px solid #555;background:#2a2a2a;color:white;border-radius:3px;font-size:11px;';

        const charNameEl = document.createElement('span');
        charNameEl.style.cssText = 'min-width:36px;text-align:center;color:#FFD700;font-size:11px;';

        const nextBtn = document.createElement('button');
        nextBtn.textContent = '→';
        nextBtn.style.cssText = prevBtn.style.cssText;

        switcher.appendChild(prevBtn);
        switcher.appendChild(charNameEl);
        switcher.appendChild(nextBtn);
        hdr.appendChild(hdrTitle);
        hdr.appendChild(switcher);
        col.appendChild(hdr);

        // ── 佈局區塊 ──────────────────────────────────────────
        const statsArea = document.createElement('div');
        col.appendChild(statsArea);

        const sep1 = document.createElement('div');
        sep1.style.cssText = 'border-top:1px solid #2a2a2a;margin:5px 0;';
        col.appendChild(sep1);

        const xpArea = document.createElement('div');
        col.appendChild(xpArea);

        const sep2 = document.createElement('div');
        sep2.style.cssText = 'border-top:1px solid #2a2a2a;margin:5px 0;';
        col.appendChild(sep2);

        const achBonusEl = document.createElement('div');
        achBonusEl.id = 'ach-bonus-summary';
        achBonusEl.style.cssText = 'font-size:10px;color:#888;margin-bottom:5px;line-height:1.5;';
        col.appendChild(achBonusEl);

        const footerEl = document.createElement('div');
        footerEl.style.cssText = 'font-size:10px;color:#aaa;';
        col.appendChild(footerEl);

        // ── Row builder ───────────────────────────────────────
        function makeRow(container, label, valueStr, breakdown) {
            const row = document.createElement('div');
            row.style.cssText = 'display:flex;align-items:baseline;gap:4px;margin-bottom:2px;font-size:11px;line-height:1.5;';

            const lbl = document.createElement('span');
            lbl.style.cssText = 'min-width:52px;color:#bbb;flex-shrink:0;';
            lbl.textContent = label;

            const val = document.createElement('span');
            val.style.cssText = 'min-width:38px;color:white;font-weight:bold;text-align:right;flex-shrink:0;';
            val.textContent = valueStr;

            const brk = document.createElement('span');
            brk.style.cssText = 'color:#666;font-size:10px;flex:1;padding-left:4px;';
            brk.textContent = breakdown;

            row.appendChild(lbl);
            row.appendChild(val);
            row.appendChild(brk);
            container.appendChild(row);
        }

        // 拼裝 breakdown 字串：過濾空字串，追加突變倍率
        function brkStr(parts, mutMult) {
            const txt = parts.filter(Boolean).join(' + ');
            return txt + (mutMult && mutMult !== 1 ? ' ×' + mutMult.toFixed(2) + t('statMutation') : '');
        }

        // ── 重繪屬性（每次切換角色時呼叫）────────────────────
        function renderStats() {
            const charId = charIds[statsCharIdx];
            charNameEl.textContent = CHARACTERS[charId].name;
            statsArea.innerHTML = '';
            xpArea.innerHTML    = '';

            const skills            = storageGetJSON(STORAGE_KEYS.PLAYER_SKILLS)       || {};
            const organs            = storageGetJSON(STORAGE_KEYS.SAVED_ORGANS)       || {};
            const hiddenOrgans      = storageGetJSON(STORAGE_KEYS.SAVED_HIDDEN_ORGANS) || {};
            const mutData           = storageGetJSON(STORAGE_KEYS.MUTATION_DATA)      || {};
            const mutLevels         = mutData.levels || {};
            const unlockedAch       = storageGetJSON(STORAGE_KEYS.ACHIEVEMENTS) || {};
            const st = calcPlayerStats(charId, skills, organs, hiddenOrgans, mutLevels, unlockedAch);

            // 攻擊
            makeRow(statsArea, t('statAtk'), String(st.attack.final),
                brkStr([
                    t('statBase') + st.attack.base,
                    st.attack.skillAdd ? t('statSkill') + st.attack.skillAdd : '',
                    st.attack.organAdd ? t('statOrgan') + st.attack.organAdd : '',
                ], st.attack.mutMultiplier));

            // 血量上限
            makeRow(statsArea, t('statHp'), String(st.hpMax.final),
                brkStr([
                    t('statBase') + st.hpMax.base,
                    st.hpMax.skillAdd ? t('statSkill') + st.hpMax.skillAdd : '',
                    st.hpMax.organAdd ? t('statOrgan') + st.hpMax.organAdd : '',
                ], st.hpMax.mutMultiplier));

            // 速度
            makeRow(statsArea, t('statSpeed'), String(st.speed.final),
                brkStr([
                    t('statBase') + st.speed.base,
                    st.speed.skillAdd ? t('statSkill') + st.speed.skillAdd.toFixed(1) : '',
                    st.speed.organAdd ? t('statOrgan') + st.speed.organAdd : '',
                ], st.speed.mutMultiplier));

            // 體型
            makeRow(statsArea, t('statSize'), String(st.radius.final),
                brkStr([
                    t('statBase') + st.radius.base,
                    st.radius.organAdd ? t('statOrgan') + st.radius.organAdd : '',
                ]));

            // 攻擊範圍
            makeRow(statsArea, t('statRange'), String(st.attackRange.final),
                brkStr([
                    t('statBase') + st.attackRange.base,
                    st.attackRange.organAdd ? t('statOrgan') + st.attackRange.organAdd : '',
                ]));

            // 韌性（只有器官加成 > 0 時顯示）
            if (st.tenacity.final > 0) {
                makeRow(statsArea, t('statTenacity'),
                    st.tenacity.final.toFixed(2) + 's',
                    t('statOrgan') + st.tenacity.organAdd.toFixed(2));
            }

            // 暴擊率
            makeRow(statsArea, t('statCritChance'),
                (st.critChance.final * 100).toFixed(0) + '%',
                brkStr([
                    t('statBase') + (st.critChance.base * 100).toFixed(0) + '%',
                    st.critChance.organAdd ? t('statOrgan') + (st.critChance.organAdd * 100).toFixed(0) + '%' : '',
                ]));

            // 暴擊傷害
            makeRow(statsArea, t('statCritDamage'),
                '×' + st.critMult.final.toFixed(2),
                brkStr([
                    t('statBaseMul') + st.critMult.base.toFixed(2),
                    st.critMult.organAdd ? t('statOrgan') + st.critMult.organAdd.toFixed(2) : '',
                ]));

            // 採集 XP
            makeRow(xpArea, t('statFruitXp'),
                '+' + st.fruitXP.final + t('unitPerFruit'),
                brkStr([
                    t('statBasePlus') + st.fruitXP.base,
                    st.fruitXP.skillAdd ? t('statSkill') + st.fruitXP.skillAdd : '',
                ], st.fruitXP.mutMultiplier));

            // 獵人 XP
            makeRow(xpArea, t('statKillXpBonus'),
                '+' + st.killXP.final + t('unitPerKill'),
                brkStr([
                    t('statBasePlus') + st.killXP.base + t('statKillXpBaseNote'),
                    st.killXP.skillAdd ? t('statSkill') + st.killXP.skillAdd : '',
                ], st.killXP.mutMultiplier));

            // 成就加成摘要
            const _bonusSummary = document.getElementById('ach-bonus-summary');
            if (_bonusSummary) {
                const _parts = [];
                if (st.attack.achAdd)    _parts.push('攻擊 +' + st.attack.achAdd);
                if (st.attack.achPercent) _parts.push('攻擊 +' + (st.attack.achPercent * 100).toFixed(0) + '%');
                if (st.hpMax.achAdd)     _parts.push('HP +' + st.hpMax.achAdd);
                if (st.hpMax.achPercent) _parts.push('HP +' + (st.hpMax.achPercent * 100).toFixed(0) + '%');
                if (st.speed.achAdd)     _parts.push('速度 +' + st.speed.achAdd);
                if (st.speed.achPercent) _parts.push('速度 +' + (st.speed.achPercent * 100).toFixed(0) + '%');
                if (st.attackRange.achPercent) _parts.push('攻擊範圍 +' + (st.attackRange.achPercent * 100).toFixed(0) + '%');
                if (st.radius.achPercent) _parts.push('體型 +' + (st.radius.achPercent * 100).toFixed(0) + '%');
                if (st.critChance.achAdd) _parts.push('暴擊 +' + (st.critChance.achAdd * 100).toFixed(0) + '%');
                if (st.fruitXP.achAdd)   _parts.push('採果XP +' + st.fruitXP.achAdd);
                if (st.fruitXP.achPercent) _parts.push('採果XP +' + (st.fruitXP.achPercent * 100).toFixed(0) + '%');
                if (st.killXP.achPercent) _parts.push('擊殺XP +' + (st.killXP.achPercent * 100).toFixed(0) + '%');
                if (st.corpseXP && st.corpseXP.achPercent) _parts.push('屍體XP +' + (st.corpseXP.achPercent * 100).toFixed(0) + '%');
                _bonusSummary.textContent = _parts.length
                    ? '成就加成：' + _parts.join('、')
                    : '成就加成：尚未解鎖';
            }

            // 底部：遊玩天數 + 成就進度
            const daysAgo = firstPlayDate
                ? Math.floor((Date.now() - new Date(firstPlayDate)) / 86400000)
                : null;
            footerEl.textContent =
                (daysAgo !== null ? t('achievementDaysFmt', { n: daysAgo }) + '　　' : '') +
                t('achievementProgressFmt', { unlocked: unlockedCount, total });
        }

        prevBtn.onclick = () => {
            statsCharIdx = (statsCharIdx - 1 + charIds.length) % charIds.length;
            renderStats();
        };
        nextBtn.onclick = () => {
            statsCharIdx = (statsCharIdx + 1) % charIds.length;
            renderStats();
        };
        renderStats();
    }

    function _renderRightDetail(col, a, unlockedEntry, isHidden) {
        const nameEl = document.createElement('div');
        nameEl.style.cssText = 'font-size:16px;font-weight:bold;color:#FFD700;margin-bottom:8px;';
        nameEl.textContent = (isHidden && !unlockedEntry) ? t('achievementHidden') : a.name;
        col.appendChild(nameEl);

        if (a.title) {
            const titleTagEl = document.createElement('div');
            titleTagEl.style.cssText = 'font-size:12px;color:#88CCFF;margin-bottom:8px;';
            titleTagEl.textContent = t('achievementDetailTitle') + '[' + a.title + ']';
            col.appendChild(titleTagEl);
        }

        const howToLabel = document.createElement('div');
        howToLabel.style.cssText = 'font-size:11px;color:#888;margin-bottom:3px;';
        howToLabel.textContent = t('achievementHowTo') + '：';
        col.appendChild(howToLabel);

        const howTo = document.createElement('div');
        howTo.style.cssText = 'color:#ddd;margin-bottom:12px;';
        howTo.textContent = (isHidden && !unlockedEntry) ? t('achievementHidden') : a.description;
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
