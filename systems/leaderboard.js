// =============================================================
// 排行榜系統 - 難度狀態管理 / 全屏排行榜面板 / 分數提交彈窗
//
// 模組職責：
//   - _lbDifficulty / _top10Difficulty：模組級難度狀態，兩個面板同步
//   - showLeaderboard()：全屏排行榜面板，支援勝利/失敗切換、難度篩選、分頁
//   - showScoreSubmitPopup()：遊戲結束前彈出名字輸入，提交或跳過後進入結算畫面
//   - showFunLeaderboard()：趣味排行榜面板（各類特殊統計）
//
// 跨模組依賴：
//   - config/supabase.js：fetchVictoryRecords / fetchDefeatRecords / submitScore
//                         fetchAvailableDifficulties
//   - systems/gameState.js：gameState.devModeUsed / gameState.lastDifficulty
//   - lang.js：t() 取得語言字串
//   - systems/ui.js：showStartScreen()（關閉排行榜後返回首頁）
// =============================================================

// ── 排行榜難度狀態（模組級，跨面板同步）
import { gameState } from './gameState.js';
import { GAME_INFO } from '../config/gameConfig.js';
import {
    submitScore,
    fetchVictoryRecords,
    fetchDefeatRecords,
    fetchTop10,
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
    fetchAvailableDifficulties
} from '../config/supabase.js';
import { applyDeviceMode } from './mobile.js';
import { showChat } from './chat.js';
import { t } from '../lang.js';
import { getRankIcon } from './utils.js';

export let _lbDifficulty   = 'easy'; // 全屏排行榜目前選擇的難度
export let _top10Difficulty = 'easy'; // TOP10 浮窗目前選擇的難度
/** 難度 ID → 語言包 key，例如 'easy' → 'diffEasy' */
export function _diffKey(d) { return 'diff' + d.charAt(0).toUpperCase() + d.slice(1); }

export function showLeaderboard() {
    applyDeviceMode();
    let currentPage = 1;
    const PAGE_SIZE = 20;
    let allRows = [];
    let _availDiffs = ['easy']; // 有資料的難度陣列

    const overlay = document.createElement('div');
    overlay.id = 'leaderboard-overlay';
    overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);display:flex;flex-direction:column;align-items:center;z-index:500;color:white;font-family:Arial,sans-serif;overflow:hidden;';

    // 標題列（含難度切換按鈕）
    const titleBar = document.createElement('div');
    titleBar.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:12px;margin:20px 0 12px;flex-shrink:0;';
    const titleEl = document.createElement('div');
    titleEl.style.cssText = 'font-size:22px;font-weight:bold;color:#FFD700;';
    titleEl.textContent = t('lbFullTitle');
    const lbDiffBtn = document.createElement('button');
    lbDiffBtn.style.cssText = 'background:rgba(255,255,255,0.1);border:1px solid #666;color:white;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:13px;pointer-events:all;';
    lbDiffBtn.textContent = t(_diffKey(_lbDifficulty));
    // 趣味排行榜切換按鈕（九）
    const funLbBtn = document.createElement('button');
    funLbBtn.style.cssText = 'background:rgba(255,180,0,0.15);border:1px solid #aa8822;color:#FFD700;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:13px;pointer-events:all;margin-left:6px;';
    funLbBtn.textContent = '🎲 種類';
    titleBar.appendChild(titleEl);
    titleBar.appendChild(lbDiffBtn);
    titleBar.appendChild(funLbBtn);
    overlay.appendChild(titleBar);

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
            tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:20px;color:#aaa;">' + t('lbError') + '</td></tr>';
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
        currentPage = page;
        const totalPages = Math.ceil(allRows.length / PAGE_SIZE);
        pageLabel.textContent = t('lbPageLabel').replace('{n}', page);
        prevBtn.disabled = page <= 1;
        prevBtn.style.opacity = page <= 1 ? '0.4' : '1';
        nextBtn.disabled = page >= totalPages;
        nextBtn.style.opacity = page >= totalPages ? '0.4' : '1';
    }

    // 依目前 _lbDifficulty 重新從 Supabase 載入資料
    function loadAllRows() {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:20px;color:#aaa;">' + t('lbLoading') + '</td></tr>';
        allRows = [];
        currentPage = 1;
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
            loadPage(1);
        }).catch(function() {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:20px;color:#f66;">' + t('lbError') + '</td></tr>';
        });
    }

    // 難度切換按鈕：循環切換，並與 TOP10 浮窗同步
    lbDiffBtn.onclick = () => {
        const idx = _availDiffs.indexOf(_lbDifficulty);
        _lbDifficulty = _availDiffs[(idx + 1) % _availDiffs.length];
        _top10Difficulty = _lbDifficulty;
        lbDiffBtn.textContent = t(_diffKey(_lbDifficulty));
        loadAllRows();
    };

    // 趣味排行榜按鈕（九）
    funLbBtn.onclick = () => {
        closeLb();
        showFunLeaderboard(_lbDifficulty);
    };

    prevBtn.onclick = () => { if (currentPage > 1) loadPage(currentPage - 1); };
    nextBtn.onclick = () => { if (!nextBtn.disabled) loadPage(currentPage + 1); };

    function closeLb() {
        overlay.remove();
        document.removeEventListener('keydown', lbKeyHandler);
        if (document.getElementById('start-screen') && typeof showChat === 'function') showChat();
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

    // 先取得有資料的難度陣列，確保 _lbDifficulty 有效後再載入
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
        loadAllRows();
    }).catch(function() {
        _availDiffs = ['easy'];
        loadAllRows();
    });
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
            myValue:  gameState.sessionStats ? (gameState.sessionStats.giantKills || 0) : 0,
            ascending: false,  // 越大越好
        },
        {
            label:    '🔪 殺手獵人榜',
            fetchFn:  () => fetchFunKillerKills(difficulty),
            colName:  'killer_kills',
            myValue:  gameState.sessionStats ? (gameState.sessionStats.killerKills || 0) : 0,
            ascending: false,
        },
        {
            label:    '⭐ 殺手克星榜',
            fetchFn:  () => fetchFunKillerMaxLevel(difficulty),
            colName:  'killer_max_level',
            myValue:  gameState.sessionStats ? (gameState.sessionStats.killerMaxLevel || 0) : 0,
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
            myValue:  gameState.sessionStats ? (gameState.sessionStats.fruitsEaten || 0) : 0,
            ascending: false,
        },
        {
            label:    '🏹 最強獵戶',
            fetchFn:  () => fetchFunNormalKills(difficulty),
            colName:  'normal_kills',
            myValue:  gameState.sessionStats ? (gameState.sessionStats.normalKills || 0) : 0,
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
