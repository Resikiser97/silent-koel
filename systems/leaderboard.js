// =============================================================
// 排行榜系統 - 難度狀態管理 / 全屏排行榜面板 / 分數提交彈窗
//
// 模組職責：
//   - _lbDifficulty / _top10Difficulty：模組級難度狀態，兩個面板同步
//   - showLeaderboard()：全屏排行榜面板，支援勝利/失敗切換、難度篩選、分頁
//   - showScoreSubmitPopup()：遊戲結束前彈出名字輸入，提交或跳過後進入結算畫面
//
// 跨模組依賴：
//   - config/supabase.js：fetchVictoryRecords / fetchDefeatRecords / submitScore
//                         fetchAvailableDifficulties
//   - systems/gameState.js：gameState.devModeUsed / gameState.lastDifficulty
//   - lang.js：t() 取得語言字串
//   - systems/ui.js：showStartScreen()（關閉排行榜後返回首頁）
// =============================================================

// ── 排行榜難度狀態（模組級，跨面板同步）
let _lbDifficulty   = 'easy'; // 全屏排行榜目前選擇的難度
let _top10Difficulty = 'easy'; // TOP10 浮窗目前選擇的難度
/** 難度 ID → 語言包 key，例如 'easy' → 'diffEasy' */
function _diffKey(d) { return 'diff' + d.charAt(0).toUpperCase() + d.slice(1); }

function showLeaderboard() {
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
    titleBar.appendChild(titleEl);
    titleBar.appendChild(lbDiffBtn);
    overlay.appendChild(titleBar);

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

    // 依目前 _lbDifficulty 重新從 Supabase 載入資料
    function loadAllRows() {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:20px;color:#aaa;">' + t('lbLoading') + '</td></tr>';
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
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:20px;color:#f66;">' + t('lbError') + '</td></tr>';
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

    // 先取得有資料的難度陣列，確保 _lbDifficulty 有效後再載入
    fetchAvailableDifficulties().then(function(diffs) {
        if (diffs && diffs.length > 0) {
            _availDiffs = diffs;
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
            version_order: Math.floor(parseInt(GAME_INFO.version.replace(/\D/g, '').slice(0, 4))),
            difficulty: gameState.lastDifficulty || 'easy',
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
