// =============================================================
// 排行榜系統 - 難度狀態管理 / 全屏排行榜面板 / 分數提交彈窗 / 名人堂
//
// 模組職責：
//   - _lbDifficulty / _top10Difficulty：模組級難度狀態，兩個面板同步
//   - upsertHallOfFame()：登入玩家提交分數後寫入 hall_of_fame（名人堂鏡像）
//   - showLeaderboard()：全屏排行榜面板（Top100 可捲動 + 名人堂 Tab）
//   - showScoreSubmitPopup()：遊戲結束前彈出名字輸入，提交或跳過後進入結算畫面
//   - showFunLeaderboard()：趣味排行榜面板（各類特殊統計）
//
// 跨模組依賴：
//   - config/supabase.js：submitScore / supabaseUpsert / fetchVictoryRecords 等
//   - storage/index.js：storageGet / storageGetJSON / STORAGE_KEYS / storageKey
//   - systems/gameState.js：gameState.devModeUsed / gameState.lastDifficulty
//   - systems/chat.js：loadChatSettings()（登入狀態）
//   - lang.js：t() 取得語言字串
// =============================================================

// ── 排行榜難度狀態（模組級，跨面板同步）
import { gameState } from './gameState.js';
import { getSessionStats } from '../stats/index.js';
import { GAME_INFO } from '../config/gameConfig.js';
import {
    submitScore, supabaseUpsert,
    fetchVictoryRecords,
    fetchDefeatRecords,
    fetchFunSpeedVictory,
    fetchFunSpeedDeath,
    fetchFunGiantKills,
    fetchFunKillerKills,
    fetchFunKillerMaxLevel,
    fetchFunBossKillSpeed,
    fetchFunMaxLevel,
    fetchFunHunterKill,
    fetchFunFruitsEaten,
    fetchFunNormalKills,
    fetchFunBoneCount,
    fetchAvailableDifficulties,
    fetchHallOfFameShowcase,
    fetchHallOfFameTop10,
    fetchHallOfFameMyRank
} from '../config/supabase.js';
import {
    storageGet, storageGetJSON,
    STORAGE_KEYS, storageKey
} from '../storage/index.js';
import { applyDeviceMode } from './mobile.js';
import { showChat, loadChatSettings } from './chat.js';
import { t } from '../lang.js';
import { getRankIcon } from './utils.js';

// ── 名人堂 upsert（提交排行榜後呼叫，僅登入玩家）
async function upsertHallOfFame() {
    const settings = loadChatSettings();
    if (!settings.loggedIn || !settings.playerName) return;

    const winsEasy       = parseInt(storageGet(storageKey.clearCountDiff('easy')))       || 0;
    const winsNormal     = parseInt(storageGet(storageKey.clearCountDiff('normal')))     || 0;
    const winsHard       = parseInt(storageGet(storageKey.clearCountDiff('hard')))       || 0;
    const winsKoel       = parseInt(storageGet(storageKey.clearCountChar('koel')))       || 0;
    const winsArcherfish = parseInt(storageGet(storageKey.clearCountChar('archerfish'))) || 0;

    const mutData  = storageGetJSON(STORAGE_KEYS.MUTATION_DATA);
    const mutLevel = mutData
        ? Object.values(mutData.levels || {}).reduce((a, b) => a + (b || 0), 0)
        : 0;

    const payload = {
        username:           settings.playerName,
        max_mutation_level: mutLevel,
        wins_easy:          winsEasy,
        wins_normal:        winsNormal,
        wins_hard:          winsHard,
        wins_koel:          winsKoel,
        wins_archerfish:    winsArcherfish,
        last_version:       GAME_INFO.version,
    };

    await supabaseUpsert('hall_of_fame', payload, 'username');
}

export let _lbDifficulty   = 'easy'; // 全屏排行榜目前選擇的難度
export let _top10Difficulty = 'easy'; // TOP10 浮窗目前選擇的難度
/** 難度 ID → 語言包 key，例如 'easy' → 'diffEasy' */
export function _diffKey(d) { return 'diff' + d.charAt(0).toUpperCase() + d.slice(1); }

export function showLeaderboard() {
    applyDeviceMode();
    let allRows = [];
    let _availDiffs = ['easy'];
    let currentView = 'hof'; // 'leaderboard' | 'fun' | 'hof'

    const overlay = document.createElement('div');
    overlay.id = 'leaderboard-overlay';
    overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);display:flex;flex-direction:column;align-items:center;z-index:500;color:white;font-family:Arial,sans-serif;overflow:hidden;';

    // 標題列
    const titleBar = document.createElement('div');
    titleBar.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:12px;margin:20px 0 12px;flex-shrink:0;flex-wrap:wrap;';
    const titleEl = document.createElement('div');
    titleEl.style.cssText = 'font-size:22px;font-weight:bold;color:#FFD700;';
    titleEl.textContent = t('lbFullTitle');
    const lbDiffBtn = document.createElement('button');
    lbDiffBtn.style.cssText = 'background:rgba(255,255,255,0.1);border:1px solid #666;color:white;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:13px;pointer-events:all;';
    lbDiffBtn.textContent = t(_diffKey(_lbDifficulty));
    const funLbBtn = document.createElement('button');
    funLbBtn.style.cssText = 'background:rgba(255,180,0,0.15);border:1px solid #aa8822;color:#FFD700;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:13px;pointer-events:all;';
    funLbBtn.textContent = '🎲 種類';
    const hofBtn = document.createElement('button');
    hofBtn.style.cssText = 'background:rgba(255,180,0,0.15);border:1px solid #aa8822;color:#FFD700;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:13px;pointer-events:all;';
    hofBtn.textContent = '🏛️ 名人堂';
    titleBar.appendChild(titleEl);
    titleBar.appendChild(lbDiffBtn);
    titleBar.appendChild(funLbBtn);
    titleBar.appendChild(hofBtn);
    overlay.appendChild(titleBar);

    // ── 一般排行榜 Section
    const tableWrap = document.createElement('div');
    tableWrap.style.cssText = 'width:90%;max-width:860px;overflow-y:auto;flex:1;';
    overlay.appendChild(tableWrap);

    const table = document.createElement('table');
    table.style.cssText = 'width:100%;border-collapse:collapse;font-size:13px;';
    tableWrap.appendChild(table);

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const cols = ['lbColRank','lbColVersion','lbColDate','lbColName','lbColCharacter','lbColTime','lbColScore','lbColLevel','lbColResult'];
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

    // ── 名人堂 Section（預設隱藏）
    const hofSection = document.createElement('div');
    hofSection.style.cssText = 'display:none;width:90%;max-width:860px;overflow-y:auto;flex:1;flex-direction:column;';
    overlay.appendChild(hofSection);

    // 名人堂：Showcase 2×3 格
    const showcaseGrid = document.createElement('div');
    showcaseGrid.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:16px 0;flex-shrink:0;';
    hofSection.appendChild(showcaseGrid);

    // 名人堂：Top10 展開區
    const hofDetail = document.createElement('div');
    hofDetail.style.cssText = 'border-top:1px solid #333;padding:12px 0;flex:1;overflow-y:auto;';
    hofSection.appendChild(hofDetail);

    // ── 趣味排行榜 Section（嵌入，預設隱藏）
    const funSection = document.createElement('div');
    funSection.style.cssText = 'display:none;width:90%;max-width:860px;flex:1;flex-direction:column;overflow:hidden;';
    overlay.appendChild(funSection);

    const funCatRow = document.createElement('div');
    funCatRow.style.cssText = 'display:flex;gap:8px;margin:8px 0;flex-wrap:wrap;justify-content:center;flex-shrink:0;';
    funSection.appendChild(funCatRow);

    const funTableWrap = document.createElement('div');
    funTableWrap.style.cssText = 'overflow-y:auto;flex:1;';
    funSection.appendChild(funTableWrap);
    const funTable = document.createElement('table');
    funTable.style.cssText = 'width:100%;border-collapse:collapse;font-size:13px;';
    funTableWrap.appendChild(funTable);
    const funThead = document.createElement('thead');
    const funHeaderRow = document.createElement('tr');
    let _funValColTh;
    ['排名','名字','角色','數值','版本','日期'].forEach((h, i) => {
        const th = document.createElement('th');
        th.style.cssText = 'padding:6px 8px;border-bottom:1px solid #444;color:#FFD700;text-align:left;position:sticky;top:0;background:#111;';
        th.textContent = h;
        funHeaderRow.appendChild(th);
        if (i === 3) _funValColTh = th;
    });
    funThead.appendChild(funHeaderRow);
    funTable.appendChild(funThead);
    const funTbody = document.createElement('tbody');
    funTable.appendChild(funTbody);

    // 趣味榜類別定義（使用 _lbDifficulty 閉包，切換難度時 fetchFn 自動跟新）
    const FUN_CATS = [
        { key: 'speed',    label: '🏃 最速通關',    fetchFn: () => fetchFunSpeedVictory(_lbDifficulty),   colName: 'play_time',        colLabel: '時間(秒)',   format: v => v + 's' },
        { key: 'death',    label: '💀 最速死亡',    fetchFn: () => fetchFunSpeedDeath(_lbDifficulty),     colName: 'play_time',        colLabel: '時間(秒)',   format: v => v + 's' },
        { key: 'giant',    label: '👾 巨人獵人',    fetchFn: () => fetchFunGiantKills(_lbDifficulty),     colName: 'giant_kills',      colLabel: '巨人擊殺',   format: v => String(v) },
        { key: 'killer',   label: '🔪 殺手獵人',    fetchFn: () => fetchFunKillerKills(_lbDifficulty),    colName: 'killer_kills',     colLabel: '殺手擊殺',   format: v => String(v) },
        { key: 'kmaxlv',   label: '⭐ 殺手克星',    fetchFn: () => fetchFunKillerMaxLevel(_lbDifficulty), colName: 'killer_max_level', colLabel: '最高殺手Lv', format: v => 'Lv.' + v },
        { key: 'bosskill', label: '⚔️ 最快Boss',   fetchFn: () => fetchFunBossKillSpeed(_lbDifficulty),  colName: 'boss_kill_time',   colLabel: 'Boss(秒)',   format: v => v + 's' },
        { key: 'maxlevel', label: '👑 最高等級',    fetchFn: () => fetchFunMaxLevel(_lbDifficulty),       colName: 'level',            colLabel: '等級',       format: v => 'Lv.' + v },
        { key: 'fruits',   label: '🍎 最佳果王',    fetchFn: () => fetchFunFruitsEaten(_lbDifficulty),    colName: 'fruits_eaten',     colLabel: '果子數',     format: v => String(v) },
        { key: 'normkill', label: '🏹 最強獵戶',    fetchFn: () => fetchFunNormalKills(_lbDifficulty),    colName: 'normal_kills',     colLabel: '擊殺數',     format: v => String(v) },
        { key: 'bone',     label: '🦴 白骨精',      fetchFn: () => fetchFunBoneCount(_lbDifficulty),      colName: 'bone_count',       colLabel: '白骨素',     format: v => String(v) },
    ];
    let currentFunCat = FUN_CATS[0];
    const funCatBtns = {};

    FUN_CATS.forEach(cat => {
        const b = document.createElement('button');
        b.style.cssText = 'background:rgba(255,255,255,0.08);border:1px solid #555;color:white;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px;pointer-events:all;';
        b.textContent = cat.label;
        b.onclick = () => {
            currentFunCat = cat;
            Object.values(funCatBtns).forEach(x => { x.style.background = 'rgba(255,255,255,0.08)'; x.style.borderColor = '#555'; });
            b.style.background = 'rgba(255,215,0,0.18)'; b.style.borderColor = '#FFD700';
            loadFunRows();
        };
        funCatRow.appendChild(b);
        funCatBtns[cat.key] = b;
    });

    function loadFunRows() {
        funTbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;color:#aaa;">讀取中...</td></tr>';
        if (_funValColTh) _funValColTh.textContent = currentFunCat.colLabel;
        currentFunCat.fetchFn().then(rows => {
            funTbody.innerHTML = '';
            if (!rows || rows.length === 0) {
                funTbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;color:#aaa;">暫無記錄</td></tr>';
                return;
            }
            rows.forEach((row, i) => {
                const rank = i + 1;
                const tr = document.createElement('tr');
                if (rank <= 3) tr.style.background = rowColors[rank - 1];
                const dateStr = row.created_at ? row.created_at.slice(0, 10) : '—';
                const nameStr = row.name ? (row.name.length > 16 ? row.name.slice(0, 16) + '…' : row.name) : '—';
                const funCharKey = 'char' + (row.character || 'koel').charAt(0).toUpperCase() + (row.character || 'koel').slice(1);
                const valStr = currentFunCat.format(row[currentFunCat.colName]);
                [getRankIcon(rank), nameStr, t(funCharKey), valStr, row.version || '—', dateStr].forEach(v => {
                    const td = document.createElement('td');
                    td.style.cssText = 'padding:6px 8px;border-bottom:1px solid #222;';
                    td.innerHTML = String(v);
                    tr.appendChild(td);
                });
                funTbody.appendChild(tr);
            });
        }).catch(() => {
            funTbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;color:#f66;">載入失敗</td></tr>';
        });
    }

    // 底部關閉按鈕列
    const bottomBar = document.createElement('div');
    bottomBar.style.cssText = 'display:flex;align-items:center;justify-content:center;padding:12px 12px max(20px, env(safe-area-inset-bottom)) 12px;flex-shrink:0;';
    const closeBtn = document.createElement('button');
    closeBtn.style.cssText = 'background:rgba(180,0,0,0.4);border:1px solid #aa4444;color:white;padding:6px 20px;border-radius:4px;cursor:pointer;font-size:13px;pointer-events:all;';
    closeBtn.textContent = t('close');
    bottomBar.appendChild(closeBtn);
    overlay.appendChild(bottomBar);

    const rowColors = ['rgba(255,215,0,0.12)', 'rgba(192,192,192,0.12)', 'rgba(205,127,50,0.12)'];

    // 一般榜：渲染所有筆數（Top 100，無翻頁）
    function renderAllRows() {
        tbody.innerHTML = '';
        if (allRows.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:20px;color:#aaa;">' + t('lbError') + '</td></tr>';
            return;
        }
        allRows.forEach((row, i) => {
            const rank = i + 1;
            const mm = String(Math.floor(row.play_time / 60)).padStart(2, '0');
            const ss = String(row.play_time % 60).padStart(2, '0');
            const dateStr = row.created_at ? row.created_at.slice(0, 10) : '—';
            const result = row.is_victory ? t('lbVictory') : t('lbDefeat');
            const rankIcon = getRankIcon(rank);
            const tr = document.createElement('tr');
            if (rank <= 3) tr.style.cssText = 'background:' + rowColors[rank - 1] + ';';
            const cells = [rankIcon, row.version || '—', dateStr,
                row.name.length > 20 ? row.name.slice(0, 20) + '…' : row.name,
                t('char' + (row.character || 'koel').charAt(0).toUpperCase() + (row.character || 'koel').slice(1)),
                mm + ':' + ss, row.score, row.level, result];
            cells.forEach(val => {
                const td = document.createElement('td');
                td.style.cssText = 'padding:6px 8px;border-bottom:1px solid #222;';
                td.innerHTML = String(val);
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
    }

    // 依目前 _lbDifficulty 從 Supabase 載入，最多 100 筆
    function loadAllRows() {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:20px;color:#aaa;">' + t('lbLoading') + '</td></tr>';
        allRows = [];
        fetchVictoryRecords(_lbDifficulty).then(function(victoryRows) {
            const vRows = victoryRows || [];
            const defeatLimit = Math.max(0, 100 - vRows.length);
            if (defeatLimit > 0) {
                return fetchDefeatRecords(defeatLimit, _lbDifficulty).then(function(defeatRows) {
                    allRows = vRows.concat(defeatRows || []);
                });
            }
            allRows = vRows;
        }).then(function() {
            renderAllRows();
        }).catch(function() {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:20px;color:#f66;">' + t('lbError') + '</td></tr>';
        });
    }

    // ── 名人堂 UI
    const HOF_CATS = [
        { col: 'wins_hard',          emoji: '💀', label: '困難通關',   fmt: v => v + ' 次' },
        { col: 'max_mutation_level', emoji: '🧬', label: '變異等級',   fmt: v => 'Lv.' + v },
        { col: 'wins_normal',        emoji: '⚔️',  label: '普通通關',  fmt: v => v + ' 次' },
        { col: 'wins_easy',          emoji: '🌿', label: '簡單通關',   fmt: v => v + ' 次' },
        { col: 'wins_koel',          emoji: '🐦', label: '噪鵑通關',   fmt: v => v + ' 次' },
        { col: 'wins_archerfish',    emoji: '🐟', label: '阿奇爾通關', fmt: v => v + ' 次' },
    ];
    let activeCat = null;

    function renderHofDetail(cat, rows, myRankInfo) {
        hofDetail.innerHTML = '';
        const catTitle = document.createElement('div');
        catTitle.style.cssText = 'font-size:15px;font-weight:bold;color:#FFD700;margin-bottom:10px;';
        catTitle.textContent = cat.emoji + ' ' + cat.label + ' Top 10';
        hofDetail.appendChild(catTitle);

        const dtTable = document.createElement('table');
        dtTable.style.cssText = 'width:100%;border-collapse:collapse;font-size:13px;';
        const dttbody = document.createElement('tbody');
        if (!rows || rows.length === 0) {
            dttbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:12px;color:#aaa;">暫無記錄</td></tr>';
        } else {
            rows.forEach((r, i) => {
                const rank = i + 1;
                const tr = document.createElement('tr');
                if (rank <= 3) tr.style.background = rowColors[rank - 1];
                const dateStr = r.updated_at ? r.updated_at.slice(0, 10) : '—';
                const valStr = cat.fmt(r[cat.col] != null ? r[cat.col] : 0);
                [getRankIcon(rank), r.username || '—', valStr, r.last_version || '—', dateStr].forEach(v => {
                    const td = document.createElement('td');
                    td.style.cssText = 'padding:5px 8px;border-bottom:1px solid #222;';
                    td.innerHTML = String(v);
                    tr.appendChild(td);
                });
                dttbody.appendChild(tr);
            });
        }
        dtTable.appendChild(dttbody);
        hofDetail.appendChild(dtTable);

        const cs = loadChatSettings();
        if (cs.loggedIn && cs.playerName) {
            const myRow = document.createElement('div');
            myRow.style.cssText = 'margin-top:10px;padding:6px 8px;background:rgba(255,215,0,0.08);border:1px solid rgba(255,215,0,0.3);border-radius:4px;font-size:13px;';
            if (myRankInfo) {
                myRow.textContent = '你的排名：#' + myRankInfo.rank + '（' + cat.fmt(myRankInfo.value) + '）';
            } else {
                myRow.textContent = '你尚未上榜';
                myRow.style.color = '#888';
            }
            hofDetail.appendChild(myRow);
        } else {
            const loginHint = document.createElement('div');
            loginHint.style.cssText = 'margin-top:10px;font-size:12px;color:#888;';
            loginHint.textContent = '登入後查看你的排名';
            hofDetail.appendChild(loginHint);
        }
    }

    function loadHofDetail(cat) {
        hofDetail.innerHTML = '<div style="padding:16px;color:#aaa;text-align:center;">讀取中...</div>';
        const cs = loadChatSettings();
        const needMyRank = cs.loggedIn && cs.playerName;
        Promise.all([
            fetchHallOfFameTop10(cat.col),
            needMyRank ? fetchHallOfFameMyRank(cs.playerName, cat.col) : Promise.resolve(null),
        ]).then(([rows, myRankInfo]) => {
            renderHofDetail(cat, rows, myRankInfo);
        }).catch(() => {
            hofDetail.innerHTML = '<div style="padding:16px;color:#f66;text-align:center;">載入失敗</div>';
        });
    }

    function renderShowcaseCard(cat, row) {
        const card = document.createElement('div');
        card.style.cssText = 'background:rgba(255,255,255,0.05);border:1px solid #444;border-radius:8px;padding:12px;text-align:center;cursor:pointer;';
        card.dataset.category = cat.col;

        const emojiEl = document.createElement('div');
        emojiEl.style.cssText = 'font-size:24px;margin-bottom:4px;';
        emojiEl.textContent = cat.emoji;

        const labelEl = document.createElement('div');
        labelEl.style.cssText = 'font-size:11px;color:#aaa;margin-bottom:4px;';
        labelEl.textContent = cat.label;

        const titleEl2 = document.createElement('div');
        titleEl2.style.cssText = 'font-size:10px;color:#888;min-height:14px;margin-bottom:2px;';

        const nameEl = document.createElement('div');
        nameEl.style.cssText = 'font-size:14px;font-weight:bold;color:#FFD700;margin-bottom:2px;';
        nameEl.textContent = row ? (row.username || '—') : '—';

        const valueEl = document.createElement('div');
        valueEl.style.cssText = 'font-size:13px;color:#ccc;';
        valueEl.textContent = row ? cat.fmt(row[cat.col] != null ? row[cat.col] : 0) : '—';

        card.appendChild(emojiEl);
        card.appendChild(labelEl);
        card.appendChild(titleEl2);
        card.appendChild(nameEl);
        card.appendChild(valueEl);

        card.onmouseenter = () => { card.style.borderColor = '#FFD700'; };
        card.onmouseleave = () => { card.style.borderColor = (activeCat === cat) ? '#FFD700' : '#444'; };
        card.onclick = () => {
            activeCat = cat;
            Array.from(showcaseGrid.children).forEach(c => { c.style.borderColor = '#444'; });
            card.style.borderColor = '#FFD700';
            loadHofDetail(cat);
        };
        return card;
    }

    function loadHofShowcase() {
        showcaseGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:16px;color:#aaa;">讀取中...</div>';
        hofDetail.innerHTML = '';
        fetchHallOfFameShowcase().then(showcase => {
            showcaseGrid.innerHTML = '';
            HOF_CATS.forEach(cat => {
                showcaseGrid.appendChild(renderShowcaseCard(cat, showcase[cat.col]));
            });
        }).catch(() => {
            showcaseGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:16px;color:#f66;">載入失敗</div>';
        });
    }

    // ── 統一 view 切換（leaderboard / fun / hof）
    function _updateBtnHighlights() {
        lbDiffBtn.style.background = 'rgba(255,255,255,0.1)';
        lbDiffBtn.style.borderColor = '#666';
        funLbBtn.style.background = 'rgba(255,180,0,0.15)';
        funLbBtn.style.borderColor = '#aa8822';
        hofBtn.style.background = 'rgba(255,180,0,0.15)';
        hofBtn.style.borderColor = '#aa8822';
        if (currentView === 'leaderboard') {
            lbDiffBtn.style.background = 'rgba(255,255,255,0.25)';
            lbDiffBtn.style.borderColor = '#aaa';
        } else if (currentView === 'fun') {
            funLbBtn.style.background = 'rgba(255,215,0,0.3)';
            funLbBtn.style.borderColor = '#FFD700';
            lbDiffBtn.style.background = 'rgba(255,255,255,0.25)';
            lbDiffBtn.style.borderColor = '#aaa';
        } else if (currentView === 'hof') {
            hofBtn.style.background = 'rgba(255,215,0,0.3)';
            hofBtn.style.borderColor = '#FFD700';
        }
    }

    function switchTo(view) {
        currentView = view;
        tableWrap.style.display = 'none';
        funSection.style.display = 'none';
        hofSection.style.display = 'none';
        if (view === 'leaderboard') {
            tableWrap.style.display = '';
            loadAllRows();
        } else if (view === 'fun') {
            funSection.style.display = 'flex';
            // 預設選中第一個類別（若尚未選）
            const activeKey = currentFunCat ? currentFunCat.key : FUN_CATS[0].key;
            Object.values(funCatBtns).forEach(x => { x.style.background = 'rgba(255,255,255,0.08)'; x.style.borderColor = '#555'; });
            if (funCatBtns[activeKey]) { funCatBtns[activeKey].style.background = 'rgba(255,215,0,0.18)'; funCatBtns[activeKey].style.borderColor = '#FFD700'; }
            loadFunRows();
        } else if (view === 'hof') {
            hofSection.style.display = 'flex';
            loadHofShowcase();
        }
        _updateBtnHighlights();
    }

    // 難度按鈕：依目前 view 決定行為
    lbDiffBtn.onclick = () => {
        const idx = _availDiffs.indexOf(_lbDifficulty);
        _lbDifficulty = _availDiffs[(idx + 1) % _availDiffs.length];
        _top10Difficulty = _lbDifficulty;
        lbDiffBtn.textContent = t(_diffKey(_lbDifficulty));
        if (currentView === 'leaderboard') loadAllRows();
        else if (currentView === 'fun') loadFunRows();
        else if (currentView === 'hof') switchTo('leaderboard');
    };

    // 種類按鈕：leaderboard ↔ fun，hof → fun
    funLbBtn.onclick = () => {
        if (currentView === 'fun') switchTo('leaderboard');
        else switchTo('fun');
    };

    // 名人堂按鈕：非 hof → hof，hof → leaderboard
    hofBtn.onclick = () => {
        if (currentView === 'hof') switchTo('leaderboard');
        else switchTo('hof');
    };

    function closeLb() {
        overlay.remove();
        document.removeEventListener('keydown', lbKeyHandler);
        if (document.getElementById('start-screen') && typeof showChat === 'function') showChat();
    }
    closeBtn.onclick = closeLb;
    overlay.addEventListener('click', e => { if (e.target === overlay) closeLb(); });

    function lbKeyHandler(e) {
        if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
        if (e.key === 'Escape') closeLb();
    }
    document.addEventListener('keydown', lbKeyHandler);

    const _lbGc = document.getElementById('game-container');
    const _lbMatch = (_lbGc ? _lbGc.style.transform : '').match(/scale\(([^)]+)\)/);
    const _lbScale = _lbMatch ? parseFloat(_lbMatch[1]) : 1;
    const _lbMaxH = _lbScale > 0 ? Math.floor(window.innerHeight / _lbScale) : 900;
    if (_lbMaxH < 900) overlay.style.height = _lbMaxH + 'px';

    _lbGc.appendChild(overlay);

    fetchAvailableDifficulties().then(function(diffs) {
        if (diffs && diffs.length > 0) {
            const _diffOrder = ['easy', 'normal', 'hard'];
            _availDiffs = _diffOrder.filter(d => diffs.includes(d));
            diffs.forEach(d => { if (!_availDiffs.includes(d)) _availDiffs.push(d); });
        } else {
            _availDiffs = ['easy'];
        }
        if (!_availDiffs.includes(_lbDifficulty)) {
            _lbDifficulty = _availDiffs[0];
            _top10Difficulty = _lbDifficulty;
            lbDiffBtn.textContent = t(_diffKey(_lbDifficulty));
        }
        if (currentView === 'leaderboard') loadAllRows();
    }).catch(function() {
        _availDiffs = ['easy'];
        if (currentView === 'leaderboard') loadAllRows();
    });

    switchTo('hof');
}

export function showScoreSubmitPopup(isVictory, bossKillTime, onDone) {
    const popup = document.createElement('div');
    popup.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:150;color:white;font-family:Arial,sans-serif;';

    const box = document.createElement('div');
    box.style.cssText = 'background:#1a1a2e;border:1px solid #444;border-radius:8px;padding:28px 32px;min-width:300px;max-width:400px;text-align:center;';

    const title = document.createElement('div');
    title.style.cssText = 'font-size:18px;font-weight:bold;margin-bottom:16px;color:#FFD700;';
    title.textContent = t('lbSubmitTitle');
    box.appendChild(title);

    const rankPreview = document.createElement('div');
    rankPreview.style.cssText = [
        'background:rgba(255,215,0,0.08)',
        'border:1px solid rgba(255,215,0,0.3)',
        'border-radius:6px',
        'padding:10px 14px',
        'margin-bottom:14px',
        'font-size:13px',
        'line-height:1.8',
        'color:#ddd',
        'text-align:left',
        'min-height:48px'
    ].join(';');
    rankPreview.textContent = '⏳ 計算中...';
    box.appendChild(rankPreview);

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

    const difficulty = gameState.lastDifficulty || 'easy';

    // ⚠️ 每次新增趣味榜分類都必須在此同步新增對應查詢項目
    const funCategories = [
        {
            label:    '🏃 通關速度榜',
            fetchFn:  () => fetchFunSpeedVictory(difficulty),
            colName:  'play_time',
            myValue:  isVictory ? Math.floor(gameState.realPlayTime / 1000) : null,
            ascending: true,   // 越小越好
        },
        {
            label:    '💀 最速死亡榜',
            fetchFn:  () => fetchFunSpeedDeath(difficulty),
            colName:  'play_time',
            myValue:  !isVictory ? Math.floor(gameState.realPlayTime / 1000) : null,
            ascending: true,
        },
        {
            label:    '👾 巨人獵人榜',
            fetchFn:  () => fetchFunGiantKills(difficulty),
            colName:  'giant_kills',
            myValue:  getSessionStats().giantKills || 0,
            ascending: false,  // 越大越好
        },
        {
            label:    '🔪 殺手獵人榜',
            fetchFn:  () => fetchFunKillerKills(difficulty),
            colName:  'killer_kills',
            myValue:  getSessionStats().killerKills || 0,
            ascending: false,
        },
        {
            label:    '⭐ 殺手克星榜',
            fetchFn:  () => fetchFunKillerMaxLevel(difficulty),
            colName:  'killer_max_level',
            myValue:  getSessionStats().killerMaxLevel || 0,
            ascending: false,
        },
        {
            label:    '⚔️ 最快擊殺Boss榜',
            fetchFn:  () => fetchFunBossKillSpeed(difficulty),
            colName:  'boss_kill_time',
            myValue:  (isVictory && bossKillTime != null) ? Math.floor(bossKillTime) : null,
            ascending: true,
        },
        {
            label:    '👑 最高等級榜',
            fetchFn:  () => fetchFunMaxLevel(difficulty),
            colName:  'level',
            myValue:  gameState.player ? (gameState.player.level || 1) : 1,
            ascending: false,
        },
        {
            label:    '🎯 獵人終結者',
            fetchFn:  () => fetchFunHunterKill(difficulty),
            colName:  'boss_kill_time',
            myValue:  (isVictory && bossKillTime != null && difficulty === 'hard') ? Math.floor(bossKillTime) : null,
            ascending: true,
        },
        {
            label:    '🍎 最佳果王',
            fetchFn:  () => fetchFunFruitsEaten(difficulty),
            colName:  'fruits_eaten',
            myValue:  getSessionStats().fruitsEaten || 0,
            ascending: false,
        },
        {
            label:    '🏹 最強獵戶',
            fetchFn:  () => fetchFunNormalKills(difficulty),
            colName:  'normal_kills',
            myValue:  getSessionStats().normalKills || 0,
            ascending: false,
        },
        {
            label:    '🦴 白骨精',
            fetchFn:  () => fetchFunBoneCount(difficulty),
            colName:  'bone_count',
            myValue:  gameState.player ? (gameState.player.boneMaterial || 0) : 0,
            ascending: false,
        },
    ];

    // 計算本局成績在一般榜的排名
    async function _fetchGeneralRank() {
        try {
            let records;
            if (isVictory) {
                records = await fetchVictoryRecords(difficulty);
            } else {
                records = await fetchDefeatRecords(200, difficulty);
            }
            if (!records || records.length === 0) return 1;

            const myTime = Math.floor(gameState.realPlayTime / 1000);

            // 勝利：play_time 越短越好
            // 失敗：play_time 越長越好（存活越久）
            let rank = 1;
            for (const r of records) {
                if (isVictory) {
                    if (r.play_time < myTime) rank++;
                } else {
                    if (r.play_time > myTime) rank++;
                }
            }
            return rank;
        } catch (e) {
            return null; // null 代表斷線
        }
    }

    // 檢查每個趣味榜分類，回傳命中的結果陣列
    async function _fetchFunRanks() {
        const hits = [];
        for (const cat of funCategories) {
            // myValue 為 null 代表本局不適用此分類
            if (cat.myValue === null) continue;
            // 數值為 0 且是越大越好的榜，不值得顯示
            if (!cat.ascending && cat.myValue === 0) continue;

            try {
                const records = await cat.fetchFn();
                if (!records || records.length === 0) {
                    hits.push({ label: cat.label, rank: 1 });
                    continue;
                }

                let rank = 1;
                for (const r of records) {
                    const rv = r[cat.colName];
                    if (rv == null) continue;
                    if (cat.ascending) {
                        if (rv < cat.myValue) rank++;
                    } else {
                        if (rv > cat.myValue) rank++;
                    }
                }

                // 只顯示 TOP3 命中的
                if (rank <= 3) {
                    hits.push({ label: cat.label, rank });
                }
            } catch (e) {
                // 單個趣味榜查詢失敗靜默跳過，不影響其他榜
            }
        }
        return hits;
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
            version_order: (function() {
                const parts = GAME_INFO.version.replace('v', '').split('.');
                if (parts.length <= 3) return 0;  // 三碼舊格式（v0.65.0），視為賽季 0
                return parseInt(parts[1]) || 0;   // 四碼新格式，正常取第二段 x
            })(),
            difficulty: gameState.lastDifficulty || 'easy',
            character: gameState.selectedCharacter || 'koel',
            bone_count: gameState.player ? (gameState.player.boneMaterial || 0) : 0,
        };
        submitScore(data).then(() => {
            statusMsg.textContent = t('lbSubmitOk');
            statusMsg.style.color = '#6f6';
            upsertHallOfFame().catch(() => {});
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

    // 面板開啟後立刻查詢所有名次
    (async () => {
        try {
            // 並行查詢：一般榜 + 所有趣味榜
            const [generalRank, funHits] = await Promise.all([
                _fetchGeneralRank(),
                _fetchFunRanks(),
            ]);

            // 建立顯示內容
            const lines = [];

            if (generalRank === null) {
                // 斷線
                rankPreview.style.borderColor = 'rgba(255,100,100,0.5)';
                rankPreview.style.background  = 'rgba(255,50,50,0.08)';
                rankPreview.innerHTML = '❌ 無法連線排行榜，仍可提交分數';
                return;
            }

            // 一般榜名次
            const resultLabel = isVictory ? '🏆 通關' : '💀 死亡';
            lines.push(`${resultLabel} 一般榜預計第 <strong style="color:#FFD700">${generalRank}</strong> 名`);

            // 趣味榜命中項目
            for (const hit of funHits) {
                const medal = hit.rank === 1 ? '🥇' : hit.rank === 2 ? '🥈' : '🥉';
                lines.push(`${medal} ${hit.label} 第 <strong style="color:#FFD700">${hit.rank}</strong> 名！`);
            }

            if (lines.length > 0) {
                rankPreview.style.borderColor = 'rgba(255,215,0,0.5)';
                rankPreview.style.background  = 'rgba(255,215,0,0.06)';
                rankPreview.innerHTML = lines.join('<br>');
            } else {
                rankPreview.textContent = '本局未進入任何榜單 TOP3';
                rankPreview.style.color = '#888';
            }

        } catch (e) {
            rankPreview.style.borderColor = 'rgba(255,100,100,0.5)';
            rankPreview.style.background  = 'rgba(255,50,50,0.08)';
            rankPreview.innerHTML = '❌ 網路連線異常，仍可提交分數';
        }
    })();

    setTimeout(() => input.focus(), 50);
}

// =============================================================
// 趣味排行榜（九）
// =============================================================
export function showFunLeaderboard(difficulty) {
    applyDeviceMode();
    difficulty = difficulty || 'easy';
    const overlay = document.createElement('div');
    overlay.id = 'fun-lb-overlay';
    overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.88);display:flex;flex-direction:column;align-items:center;z-index:500;color:white;font-family:Arial,sans-serif;overflow:hidden;';

    // 標題
    const titleBar = document.createElement('div');
    titleBar.style.cssText = 'display:flex;align-items:center;gap:12px;margin:20px 0 12px;flex-shrink:0;';
    const titleEl = document.createElement('div');
    titleEl.style.cssText = 'font-size:20px;font-weight:bold;color:#FFD700;';
    titleEl.textContent = '🎲 趣味排行榜';
    titleBar.appendChild(titleEl);
    overlay.appendChild(titleBar);

    // 類別按鈕列
    const categories = [
        { key: 'speed',   label: '🏃 最速通關', fetchFn: () => fetchFunSpeedVictory(difficulty), colName: 'play_time', colLabel: '遊玩時間(秒)', format: v => String(v) + 's' },
        { key: 'death',   label: '💀 最速死亡', fetchFn: () => fetchFunSpeedDeath(difficulty),  colName: 'play_time',      colLabel: '遊玩時間(秒)', format: v => String(v) + 's' },
        { key: 'giant',   label: '👾 巨人獵人', fetchFn: () => fetchFunGiantKills(difficulty),  colName: 'giant_kills',    colLabel: '巨人擊殺', format: v => String(v) },
        { key: 'killer',  label: '🔪 殺手獵人', fetchFn: () => fetchFunKillerKills(difficulty), colName: 'killer_kills',   colLabel: '殺手擊殺', format: v => String(v) },
        { key: 'kmaxlv',  label: '⭐ 殺手克星', fetchFn: () => fetchFunKillerMaxLevel(difficulty), colName: 'killer_max_level', colLabel: '最高殺手Lv', format: v => 'Lv.' + v },
        { key: 'bosskill', label: '⚔️ 最快擊殺Boss', fetchFn: () => fetchFunBossKillSpeed(difficulty), colName: 'boss_kill_time', colLabel: 'Boss擊殺(秒)', format: v => String(v) + 's' },
        { key: 'maxlevel', label: '👑 最高等級', fetchFn: () => fetchFunMaxLevel(difficulty),
          colName: 'level', colLabel: '等級', format: v => 'Lv.' + String(v) },
        { key: 'fruits',  label: '🍎 最佳果王',  fetchFn: () => fetchFunFruitsEaten(difficulty),
          colName: 'fruits_eaten', colLabel: '果子數', format: v => String(v) },
        { key: 'normkill', label: '🏹 最強獵戶', fetchFn: () => fetchFunNormalKills(difficulty),
          colName: 'normal_kills', colLabel: '擊殺數', format: v => String(v) },
        { key: 'bone',     label: '🦴 白骨精',   fetchFn: () => fetchFunBoneCount(difficulty),
          colName: 'bone_count',   colLabel: '白骨素', format: v => String(v) },
    ];
    let currentCat = categories[0];

    const catRow = document.createElement('div');
    catRow.style.cssText = 'display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;justify-content:center;flex-shrink:0;';
    const catBtns = {};
    categories.forEach(cat => {
        const b = document.createElement('button');
        b.style.cssText = 'background:rgba(255,255,255,0.08);border:1px solid #555;color:white;padding:5px 12px;border-radius:4px;cursor:pointer;font-size:12px;pointer-events:all;';
        b.textContent = cat.label;
        b.onclick = () => {
            currentCat = cat;
            Object.values(catBtns).forEach(x => { x.style.background = 'rgba(255,255,255,0.08)'; x.style.borderColor = '#555'; });
            b.style.background = 'rgba(255,215,0,0.18)'; b.style.borderColor = '#FFD700';
            loadFunRows();
        };
        catRow.appendChild(b);
        catBtns[cat.key] = b;
    });
    overlay.appendChild(catRow);

    const tableWrap = document.createElement('div');
    tableWrap.style.cssText = 'width:90%;max-width:600px;overflow-y:auto;flex:1;';
    overlay.appendChild(tableWrap);
    const table = document.createElement('table');
    table.style.cssText = 'width:100%;border-collapse:collapse;font-size:13px;';
    tableWrap.appendChild(table);
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['排名','名字','角色','數值','版本','日期'].forEach(h => {
        const th = document.createElement('th');
        th.style.cssText = 'padding:6px 8px;border-bottom:1px solid #444;color:#FFD700;text-align:left;position:sticky;top:0;background:#111;';
        th.textContent = h;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    tbody.id = 'fun-lb-tbody';
    table.appendChild(tbody);

    function loadFunRows() {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;color:#aaa;">讀取中...</td></tr>';
        // update value column header（角色欄在 cells[2]，數值欄在 cells[3]）
        headerRow.cells[3].textContent = currentCat.colLabel;
        currentCat.fetchFn().then(rows => {
            tbody.innerHTML = '';
            if (!rows || rows.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;color:#aaa;">暫無記錄</td></tr>';
                return;
            }
            rows.forEach((row, i) => {
                const rank = i + 1;
                const tr = document.createElement('tr');
                if (rank <= 3) tr.style.background = ['rgba(255,215,0,0.12)', 'rgba(192,192,192,0.12)', 'rgba(205,127,50,0.12)'][rank - 1];
                const dateStr = row.created_at ? row.created_at.slice(0, 10) : '—';
                const nameStr = row.name ? (row.name.length > 16 ? row.name.slice(0, 16) + '…' : row.name) : '—';
                const funCharKey = 'char' + (row.character || 'koel').charAt(0).toUpperCase() + (row.character || 'koel').slice(1);
                const charStr = t(funCharKey);
                const valStr = currentCat.format(row[currentCat.colName]);
                [getRankIcon(rank), nameStr, charStr, valStr, row.version || '—', dateStr].forEach(v => {
                    const td = document.createElement('td');
                    td.style.cssText = 'padding:6px 8px;border-bottom:1px solid #222;';
                    td.innerHTML = String(v);
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            });
        }).catch(() => {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;color:#f66;">載入失敗</td></tr>';
        });
    }

    // 關閉+返回按鈕
    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:12px;padding:12px;flex-shrink:0;';
    const backBtn = document.createElement('button');
    backBtn.style.cssText = 'background:rgba(255,255,255,0.1);border:1px solid #666;color:white;padding:6px 20px;border-radius:4px;cursor:pointer;font-size:13px;';
    backBtn.textContent = '← 一般排行';
    backBtn.onclick = () => { overlay.remove(); showLeaderboard(); };
    const closeBtn2 = document.createElement('button');
    closeBtn2.style.cssText = 'background:rgba(180,0,0,0.4);border:1px solid #aa4444;color:white;padding:6px 20px;border-radius:4px;cursor:pointer;font-size:13px;';
    closeBtn2.textContent = t('close') || '關閉';
    closeBtn2.onclick = () => overlay.remove();
    btnRow.appendChild(backBtn);
    btnRow.appendChild(closeBtn2);
    overlay.appendChild(btnRow);

    document.getElementById('game-container').appendChild(overlay);

    // 預設選中第一類
    catBtns[categories[0].key].click();
    console.log('[v0.47.0] 九：趣味排行榜已開啟');
}
