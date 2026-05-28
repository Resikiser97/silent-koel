// =============================================================
// 聊天室系統 - Supabase Realtime 即時聊天
// 依賴：SUPABASE_URL, SUPABASE_KEY (config/supabase.js)
//       GAME_INFO (config/gameConfig.js)
//       supabaseQuery (config/supabase.js) ← REST 備用
//       gameState (systems/gameState.js)
//
// 注意：使用 Supabase Realtime 需在 Supabase Dashboard：
//   1. 啟用 chat_messages 表的 Realtime
//   2. 設定 RLS 允許 anon 的 SELECT / INSERT
//   3. GM UPDATE（pin）/ DELETE（24hr 清理）需額外 RLS policy
// =============================================================

// ─────────────────────────────────────────────
// SHA-256 工具（帳號密碼雜湊用）
// ─────────────────────────────────────────────
async function _sha256(str) {
    const buf = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(str)
    );
    return Array.from(new Uint8Array(buf))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// ─────────────────────────────────────────────
// Supabase JS Client（Realtime 用）
// 由 index.html 載入 @supabase/supabase-js@2 CDN（UMD）
// ─────────────────────────────────────────────
let _sbClient = null;
(function() {
    try {
        if (window.supabase && typeof window.supabase.createClient === 'function') {
            _sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
                realtime: { params: { eventsPerSecond: 5 } }
            });
        }
    } catch(e) {
        console.warn('[Chat] Supabase JS Client 初始化失敗，改用 polling：', e);
    }
})();

// ─────────────────────────────────────────────
// 狀態變數
// ─────────────────────────────────────────────
let _chatChannel       = null;   // Supabase Realtime channel
let _chatPollTimer     = null;   // polling fallback 計時器
let _chatIdleTimer     = null;   // 閒置自動斷線計時器
let _chatMessages      = [];     // 目前顯示的訊息（最多 50 筆）
let _pinnedMessage     = null;   // 置頂訊息 { ...msg, pinUntil }
let _chatLastFetchTime = null;   // polling 用：上次拉取時間

const CHAT_IDLE_MS = 60 * 60 * 1000; // 1 小時閒置斷線
const CHAT_POLL_MS = 8000;            // polling 間隔（ms）

// ─────────────────────────────────────────────
// localStorage 聊天室帳號設定
// ─────────────────────────────────────────────

function loadChatSettings() {
    try {
        const raw = localStorage.getItem('chatSettings');
        const d   = raw ? JSON.parse(raw) : {};
        return {
            playerName: d.playerName || '',
            isGM:       d.isGM       || false,
            title:      d.title      || '',
            loggedIn:   d.loggedIn   || false
        };
    } catch(e) {
        return { playerName: '', isGM: false, title: '', loggedIn: false };
    }
}

function saveChatSettings(obj) {
    localStorage.setItem('chatSettings', JSON.stringify(obj));
}

// ─────────────────────────────────────────────
// 帳號系統核心函式
// ─────────────────────────────────────────────

function _calcProgressScore(data) {
    try {
        const mut   = data.mutationData
            ? JSON.parse(typeof data.mutationData === 'string'
                ? data.mutationData : JSON.stringify(data.mutationData))
            : {};
        const total = mut.totalPointsEarned || 0;
        const sp    = data.skillPoints ? parseInt(data.skillPoints) : 0;
        return total + sp;
    } catch(e) { return 0; }
}

function _collectLocalData() {
    const keys = [
        'playerSkills', 'skillPoints', 'savedOrgans',
        'savedHiddenOrgans', 'lastRunOrgans', 'gameSettings',
        'mutationData', 'SAVE_VERSION'
    ];
    const obj = {};
    keys.forEach(k => {
        const v = localStorage.getItem(k);
        if (v !== null) obj[k] = v;
    });
    return obj;
}

function _applyRemoteData(gameData) {
    if (!gameData) return;
    Object.entries(gameData).forEach(([k, v]) => {
        if (k === 'SAVE_VERSION') return; // 不覆蓋本地版本號
        localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
    });
}

async function chatLogin(username, password) {
    if (!username || !password) return { ok: false, msg: '請輸入名字和密碼' };
    const hash = await _sha256(password);

    // 查詢帳號
    let user = null;
    let connErr = false;
    try {
        if (_sbClient) {
            const { data, error } = await _sbClient
                .from('chat_users')
                .select('*')
                .eq('username', username)
                .maybeSingle();
            if (error) connErr = true;
            else user = data || null;
        } else {
            const data = await supabaseQuery(
                'chat_users', 'GET', null,
                '?select=*&username=eq.' + encodeURIComponent(username) + '&limit=1'
            );
            user = (Array.isArray(data) && data.length > 0) ? data[0] : null;
        }
    } catch(e) { connErr = true; }

    if (connErr) return { ok: false, msg: '連線失敗，請稍後再試' };

    if (!user) {
        // 帳號不存在 → 自動註冊
        const localData = _collectLocalData();
        try {
            if (_sbClient) {
                const { error: insertErr } = await _sbClient
                    .from('chat_users')
                    .insert({ username, password: hash, is_gm: false, game_data: localData });
                if (insertErr) return { ok: false, msg: '註冊失敗，請稍後再試' };
            } else {
                await supabaseQuery('chat_users', 'POST', {
                    username, password: hash, is_gm: false, game_data: localData
                });
            }
        } catch(e) { return { ok: false, msg: '註冊失敗，請稍後再試' }; }
        saveChatSettings({ playerName: username, isGM: false, loggedIn: true });
        return { ok: true, msg: '✅ 註冊成功並登入', isGM: false };
    }

    // 帳號存在 → 驗證密碼
    if (user.password !== hash) return { ok: false, msg: '❌ 密碼錯誤' };

    // 登入成功 → 比較進度分數
    const localScore  = _calcProgressScore(_collectLocalData());
    const remoteScore = _calcProgressScore(user.game_data || {});
    let syncMsg = '';

    if (remoteScore > localScore) {
        _applyRemoteData(user.game_data);
        syncMsg = '☁️ 雲端資料較新，已同步至本地';
    } else if (localScore > remoteScore) {
        try {
            if (_sbClient) {
                await _sbClient.from('chat_users')
                    .update({ game_data: _collectLocalData() })
                    .eq('username', username);
            } else {
                await supabaseQuery('chat_users', 'PATCH',
                    { game_data: _collectLocalData() },
                    '?username=eq.' + encodeURIComponent(username)
                );
            }
        } catch(e) {}
        syncMsg = '💾 本地資料較新，已上傳至雲端';
    } else {
        syncMsg = '✅ 資料已是最新';
    }

    saveChatSettings({ playerName: username, isGM: user.is_gm, title: user.title || '', loggedIn: true });
    return { ok: true, msg: syncMsg, isGM: user.is_gm };
}

async function chatSaveProgress() {
    const settings = loadChatSettings();
    if (!settings.loggedIn || !settings.playerName) return { ok: false, msg: '請先登入' };
    const localData = _collectLocalData();
    try {
        if (_sbClient) {
            const { error } = await _sbClient.from('chat_users')
                .update({ game_data: localData })
                .eq('username', settings.playerName);
            if (error) return { ok: false, msg: '保存失敗，請稍後再試' };
        } else {
            await supabaseQuery('chat_users', 'PATCH',
                { game_data: localData },
                '?username=eq.' + encodeURIComponent(settings.playerName)
            );
        }
    } catch(e) { return { ok: false, msg: '保存失敗，請稍後再試' }; }
    return { ok: true, msg: '✅ 進度已雲端保存' };
}

async function chatSyncData() {
    const settings = loadChatSettings();
    if (!settings.loggedIn || !settings.playerName) return { ok: false, msg: '請先登入' };

    let remoteData = null;
    try {
        if (_sbClient) {
            const { data } = await _sbClient.from('chat_users')
                .select('game_data')
                .eq('username', settings.playerName)
                .maybeSingle();
            remoteData = data?.game_data || null;
        } else {
            const data = await supabaseQuery('chat_users', 'GET', null,
                '?select=game_data&username=eq.' + encodeURIComponent(settings.playerName) + '&limit=1'
            );
            remoteData = (Array.isArray(data) && data.length > 0) ? (data[0].game_data || null) : null;
        }
    } catch(e) { return { ok: false, msg: '連線失敗，請稍後再試' }; }

    const localScore  = _calcProgressScore(_collectLocalData());
    const remoteScore = _calcProgressScore(remoteData || {});

    if (remoteScore > localScore) {
        _applyRemoteData(remoteData);
        return { ok: true, msg: '☁️ 雲端資料較新，已同步至本地' };
    } else if (localScore > remoteScore) {
        try {
            if (_sbClient) {
                await _sbClient.from('chat_users')
                    .update({ game_data: _collectLocalData() })
                    .eq('username', settings.playerName);
            } else {
                await supabaseQuery('chat_users', 'PATCH',
                    { game_data: _collectLocalData() },
                    '?username=eq.' + encodeURIComponent(settings.playerName)
                );
            }
        } catch(e) {}
        return { ok: true, msg: '💾 本地資料較新，已上傳至雲端' };
    }
    return { ok: true, msg: '✅ 資料已是最新' };
}

function chatLogout() {
    const keys = [
        'playerSkills', 'skillPoints', 'savedOrgans',
        'savedHiddenOrgans', 'lastRunOrgans', 'gameSettings',
        'mutationData', 'chatSettings', 'SAVE_VERSION'
    ];
    keys.forEach(k => localStorage.removeItem(k));
    saveChatSettings({ playerName: '', isGM: false, loggedIn: false });
}

// ─────────────────────────────────────────────
// Supabase 聊天室核心函式
// ─────────────────────────────────────────────

async function initChat() {
    // 先確保斷線（重入時重新建立乾淨連線）
    disconnectChat();

    // 清除 24 小時前的訊息
    await _deleteOldMessages();

    // 讀取最近 50 筆訊息
    try {
        if (_sbClient) {
            const { data } = await _sbClient
                .from('chat_messages')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);
            _chatMessages = ((data || []).reverse());
        } else {
            const data = await supabaseQuery(
                'chat_messages', 'GET', null,
                '?select=*&order=created_at.desc&limit=50'
            );
            _chatMessages = (Array.isArray(data) ? data : []).reverse();
        }
    } catch(e) {
        _chatMessages = [];
    }

    // 從歷史訊息找置頂
    const pinned = _chatMessages.find(m => m.is_pinned);
    if (pinned) _pinnedMessage = { ...pinned, pinUntil: null };

    _subscribeChat();
    _resetIdleTimer();
    renderChat();
}

async function _deleteOldMessages() {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    try {
        if (_sbClient) {
            await _sbClient
                .from('chat_messages')
                .delete()
                .eq('is_pinned', false)
                .lt('created_at', cutoff);
        } else {
            await supabaseQuery(
                'chat_messages', 'DELETE', null,
                '?is_pinned=eq.false&created_at=lt.' + encodeURIComponent(cutoff)
            );
        }
    } catch(e) {}
}

function _subscribeChat() {
    if (_sbClient) {
        // ── Realtime 模式
        if (_chatChannel) return;
        _chatChannel = _sbClient
            .channel('chat_room')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'chat_messages' },
                (payload) => {
                    _chatMessages.push(payload.new);
                    if (_chatMessages.length > 50) _chatMessages.shift();
                    renderChat();
                    _resetIdleTimer();
                }
            )
            .subscribe();
    } else {
        // ── Polling 備用
        if (_chatPollTimer) return;
        _chatLastFetchTime = new Date().toISOString();
        _chatPollTimer = setInterval(_pollNewMessages, CHAT_POLL_MS);
    }
}

async function _pollNewMessages() {
    const since = _chatLastFetchTime || new Date(Date.now() - 60000).toISOString();
    _chatLastFetchTime = new Date().toISOString();
    try {
        const data = await supabaseQuery(
            'chat_messages', 'GET', null,
            '?select=*&created_at=gt.' + encodeURIComponent(since) +
            '&order=created_at.asc&limit=20'
        );
        if (Array.isArray(data) && data.length > 0) {
            for (const msg of data) {
                _chatMessages.push(msg);
                if (_chatMessages.length > 50) _chatMessages.shift();
            }
            renderChat();
        }
    } catch(e) {}
}

function disconnectChat() {
    if (_chatChannel && _sbClient) {
        try { _sbClient.removeChannel(_chatChannel); } catch(e) {}
        _chatChannel = null;
    }
    if (_chatPollTimer) {
        clearInterval(_chatPollTimer);
        _chatPollTimer = null;
    }
    clearTimeout(_chatIdleTimer);
    _chatIdleTimer = null;
}

function _resetIdleTimer() {
    clearTimeout(_chatIdleTimer);
    _chatIdleTimer = setTimeout(disconnectChat, CHAT_IDLE_MS);
}

async function sendChatMessage(content) {
    if (!content || !content.trim()) return;
    const settings = loadChatSettings();

    // 若已斷線則重新連線
    if (!_chatChannel && !_chatPollTimer) _subscribeChat();
    _resetIdleTimer();

    // 計算變異等級
    let mutLevel = 0;
    try {
        const md = JSON.parse(localStorage.getItem('mutationData') || '{}');
        const lv = md.levels || {};
        mutLevel = (lv.fang || 0) + (lv.tail || 0) + (lv.wing || 0) + (lv.eye || 0);
    } catch(e) {}

    // /pin 指令（GM 限定）
    if (settings.isGM && content.trim().startsWith('/pin')) {
        await _handlePinCommand(content.trim());
        return;
    }

    const displayName = settings.playerName.trim() || '匿名者';
    const titlePart   = settings.title ? '|' + settings.title : '';
    const fullName    = 'lv' + mutLevel + '|' + displayName + titlePart;

    const row = {
        player_name: fullName,
        content:     content.trim(),
        version:     (typeof GAME_INFO !== 'undefined') ? GAME_INFO.version : '?',
        is_gm:       settings.isGM,
        is_pinned:   false
    };

    try {
        if (_sbClient) {
            await _sbClient.from('chat_messages').insert(row);
        } else {
            await supabaseQuery('chat_messages', 'POST', row);
        }
    } catch(e) {
        console.warn('[Chat] 發送失敗：', e);
    }
}

async function _handlePinCommand(cmd) {
    // /pin 1H → 置頂自己最新一條 GM 訊息 1 小時
    const match = cmd.match(/^\/pin\s+(\d+)H$/i);
    if (!match) return;
    const hours       = parseInt(match[1]);
    const settings    = loadChatSettings();
    const displayName = settings.playerName.trim() || '匿名者';

    // 找自己最新一條 GM 訊息
    const myMsg = [..._chatMessages].reverse().find(m => {
        const parts = (m.player_name || '').split('|');
        return parts.length >= 2 && parts[1] === displayName && m.is_gm;
    });
    if (!myMsg) return;

    const pinUntil = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
    try {
        if (_sbClient) {
            await _sbClient
                .from('chat_messages')
                .update({ is_pinned: true })
                .eq('id', myMsg.id);
        } else {
            await supabaseQuery(
                'chat_messages', 'PATCH',
                { is_pinned: true },
                '?id=eq.' + myMsg.id
            );
        }
    } catch(e) {}

    _pinnedMessage = { ...myMsg, pinUntil };
    // 在本地陣列也更新
    const idx = _chatMessages.findIndex(m => m.id === myMsg.id);
    if (idx >= 0) _chatMessages[idx] = { ..._chatMessages[idx], is_pinned: true };
    renderChat();
}

async function verifyGM(code) {
    try {
        let found = false;
        if (_sbClient) {
            const { data, error } = await _sbClient
                .from('gm_codes')
                .select('code')
                .eq('code', code)
                .single();
            found = !!(data && !error);
        } else {
            const data = await supabaseQuery(
                'gm_codes', 'GET', null,
                '?select=code&code=eq.' + encodeURIComponent(code) + '&limit=1'
            );
            found = Array.isArray(data) && data.length > 0;
        }

        if (found) {
            const s = loadChatSettings();
            s.isGM       = true;
            s.gmVerified = true;
            saveChatSettings(s);
            return true;
        }
    } catch(e) {}
    return false;
}

// ─────────────────────────────────────────────
// 階段 3：聊天室 UI
// ─────────────────────────────────────────────

function showChat() {
    ['chat-history-panel', 'chat-input-panel', 'chat-scroll-btn',
     'chat-panel'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = '';
    });
}

function hideChat() {
    ['chat-history-panel', 'chat-input-panel', 'chat-scroll-btn',
     'chat-settings-panel', 'chat-panel'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

// 渲染設定面板內容（依登入狀態切換，可重複呼叫）
function _renderChatSettingsPanel(panel) {
    panel.innerHTML = '';
    const cs = loadChatSettings();

    // 關閉按鈕（右上角）
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = [
        'position:absolute', 'top:6px', 'right:8px',
        'background:transparent', 'border:none',
        'color:white', 'font-size:16px', 'cursor:pointer',
        'padding:0', 'line-height:1'
    ].join(';');
    closeBtn.onclick = () => {
        const sp = document.getElementById('chat-settings-panel');
        if (sp) sp.style.display = 'none';
    };
    panel.appendChild(closeBtn);

    const _inputStyle = [
        'width:100%', 'background:rgba(255,255,255,0.08)',
        'border:1px solid #555', 'border-radius:3px',
        'color:white', 'padding:4px 6px', 'font-size:12px',
        'box-sizing:border-box', 'margin-bottom:6px',
        'outline:none', 'font-family:Arial,sans-serif'
    ].join(';');
    const _btnStyle = (bg, border) => [
        'width:100%', 'padding:6px',
        'background:' + bg, 'border:1px solid ' + border,
        'color:white', 'border-radius:4px', 'cursor:pointer',
        'font-size:12px', 'margin-bottom:5px', 'font-family:Arial,sans-serif'
    ].join(';');

    const msgDiv = document.createElement('div');
    msgDiv.style.cssText = 'font-size:11px;min-height:14px;margin-bottom:6px;text-align:center;';

    if (!cs.loggedIn) {
        // ── 未登入：名字 + 密碼 + 登入/註冊 + Reset 密碼
        const nameLabel = document.createElement('div');
        nameLabel.style.cssText = 'color:#aaa;margin-bottom:2px;font-size:11px;';
        nameLabel.textContent = '名字：';

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.placeholder = '帳號名稱';
        nameInput.maxLength = 20;
        nameInput.style.cssText = _inputStyle;
        nameInput.addEventListener('keydown', e => e.stopPropagation());
        nameInput.addEventListener('keyup',   e => e.stopPropagation());

        const pwLabel = document.createElement('div');
        pwLabel.style.cssText = 'color:#aaa;margin-bottom:2px;font-size:11px;';
        pwLabel.textContent = '密碼：';

        const pwInput = document.createElement('input');
        pwInput.type = 'password';
        pwInput.placeholder = '密碼';
        pwInput.maxLength = 40;
        pwInput.style.cssText = _inputStyle;
        pwInput.addEventListener('keydown', e => e.stopPropagation());
        pwInput.addEventListener('keyup',   e => e.stopPropagation());

        const loginBtn = document.createElement('button');
        loginBtn.textContent = '登入 / 註冊';
        loginBtn.style.cssText = _btnStyle('#2a5a2a', '#4a8a4a');

        const resetBtn = document.createElement('button');
        resetBtn.textContent = 'Reset 密碼';
        resetBtn.style.cssText = _btnStyle('rgba(70,70,70,0.5)', '#555');

        loginBtn.onclick = async () => {
            msgDiv.style.color = '#aaa';
            msgDiv.textContent = '處理中...';
            const result = await chatLogin(nameInput.value.trim(), pwInput.value);
            msgDiv.style.color = result.ok ? '#6f6' : '#f66';
            msgDiv.textContent = result.msg;
            if (result.ok) {
                setTimeout(() => _renderChatSettingsPanel(panel), 1200);
            }
        };

        pwInput.addEventListener('keydown', e => {
            e.stopPropagation();
            if (e.key === 'Enter') loginBtn.click();
        });

        resetBtn.onclick = () => {
            msgDiv.style.color = '#aaa';
            msgDiv.textContent = '如需重設密碼，請聯絡開發者 Kiser。';
        };

        panel.appendChild(nameLabel);
        panel.appendChild(nameInput);
        panel.appendChild(pwLabel);
        panel.appendChild(pwInput);
        panel.appendChild(msgDiv);
        panel.appendChild(loginBtn);
        panel.appendChild(resetBtn);

    } else {
        // ── 已登入：顯示帳號 + 功能按鈕
        const userRow = document.createElement('div');
        userRow.style.cssText = 'color:#FFD700;font-size:13px;font-weight:bold;margin-bottom:10px;text-align:center;';
        userRow.textContent = '👤 ' + cs.playerName;
        if (cs.isGM) {
            const gmTag = document.createElement('span');
            gmTag.style.cssText = 'display:block;font-size:10px;color:#FFD700;opacity:0.8;font-weight:normal;';
            gmTag.textContent = '【GM】';
            userRow.appendChild(gmTag);
        }

        const saveBtn = document.createElement('button');
        saveBtn.textContent = '保存進度';
        saveBtn.style.cssText = _btnStyle('#1a3d6a', '#4a6a9a');

        const syncBtn = document.createElement('button');
        syncBtn.textContent = '同步資料';
        syncBtn.style.cssText = _btnStyle('rgba(60,60,20,0.7)', '#7a7a3a');

        const logoutBtn = document.createElement('button');
        logoutBtn.textContent = '登出';
        logoutBtn.style.cssText = _btnStyle('rgba(120,30,30,0.7)', '#8a3a3a');

        saveBtn.onclick = async () => {
            msgDiv.style.color = '#aaa';
            msgDiv.textContent = '保存中...';
            const r = await chatSaveProgress();
            msgDiv.style.color = r.ok ? '#6f6' : '#f66';
            msgDiv.textContent = r.msg;
        };

        syncBtn.onclick = async () => {
            msgDiv.style.color = '#aaa';
            msgDiv.textContent = '同步中...';
            const r = await chatSyncData();
            msgDiv.style.color = r.ok ? '#6f6' : '#f66';
            msgDiv.textContent = r.msg;
        };

        logoutBtn.onclick = () => {
            // 確認彈窗（inline）
            panel.innerHTML = '';
            const warn = document.createElement('div');
            warn.style.cssText = 'color:#f88;font-size:11px;margin-bottom:10px;line-height:1.5;text-align:center;';
            warn.textContent = '確定登出？這將清除本地所有遊戲進度資料。';
            const confirmBtn = document.createElement('button');
            confirmBtn.textContent = '確定登出';
            confirmBtn.style.cssText = _btnStyle('rgba(150,30,30,0.8)', '#aa3a3a');
            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = '取消';
            cancelBtn.style.cssText = _btnStyle('rgba(60,60,60,0.6)', '#555');
            confirmBtn.onclick = () => { chatLogout(); _renderChatSettingsPanel(panel); };
            cancelBtn.onclick  = () => _renderChatSettingsPanel(panel);
            panel.appendChild(warn);
            panel.appendChild(confirmBtn);
            panel.appendChild(cancelBtn);
        };

        panel.appendChild(userRow);
        panel.appendChild(msgDiv);
        panel.appendChild(saveBtn);
        panel.appendChild(syncBtn);
        panel.appendChild(logoutBtn);
    }
}

function buildChatUI() {
    // 清除舊結構（重建時清理）
    ['chat-panel', 'chat-history-panel', 'chat-input-panel'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.remove();
    });

    const isMob = (typeof gameState !== 'undefined') && gameState.isMobile;

    if (isMob) {
        // ════════════════════════════════════════
        // 手機版：歷史區 + 輸入列 分離獨立定位
        // ════════════════════════════════════════

        // ── 歷史訊息區
        const historyPanel = document.createElement('div');
        historyPanel.id = 'chat-history-panel';
        historyPanel.style.cssText = [
            'position:fixed', 'bottom:23vh', 'left:5%', 'right:5%',
            'height:18vh', 'z-index:201',
            'background:rgba(0,0,0,0.70)',
            'border:1px solid rgba(255,255,255,0.15)',
            'border-radius:8px',
            'overflow-y:scroll', 'overflow-x:hidden',
            'box-sizing:border-box', 'padding:4px 8px',
            'color:white', 'font-family:Arial,sans-serif', 'font-size:12px',
            '-webkit-overflow-scrolling:touch'
        ].join(';');

        // ── 齒輪按鈕（sticky 釘在頂部靠右）
        const gearBtn = document.createElement('button');
        gearBtn.id = 'chat-settings-btn';
        gearBtn.textContent = '⚙️';
        gearBtn.style.cssText = [
            'position:sticky', 'top:0', 'float:right',
            'background:transparent', 'border:none', 'color:white',
            'font-size:14px', 'cursor:pointer',
            'z-index:202', 'pointer-events:all'
        ].join(';');

        // ── 置頂訊息（sticky 頂部）
        const pinnedDiv = document.createElement('div');
        pinnedDiv.id = 'chat-pinned';
        pinnedDiv.style.cssText = [
            'display:none', 'position:sticky', 'top:0',
            'background:rgba(255,215,0,0.15)',
            'border-bottom:1px solid rgba(255,215,0,0.3)',
            'font-size:11px', 'padding:3px 8px', 'z-index:1'
        ].join(';');

        historyPanel.appendChild(gearBtn);
        historyPanel.appendChild(pinnedDiv);

        // ── 往下按鈕（fixed，貼在歷史區右下角）
        const scrollBtn = document.createElement('div');
        scrollBtn.id = 'chat-scroll-btn';
        scrollBtn.textContent = '↓';
        scrollBtn.style.cssText = [
            'display:none', 'position:fixed', 'bottom:23vh', 'right:calc(5% + 8px)',
            'width:28px', 'height:28px',
            'background:rgba(255,255,255,0.15)',
            'border:1px solid rgba(255,255,255,0.3)',
            'border-radius:50%', 'cursor:pointer',
            'font-size:14px', 'color:white',
            'text-align:center', 'line-height:28px',
            'z-index:202', 'user-select:none'
        ].join(';');

        // ── 輸入列
        const inputPanel = document.createElement('div');
        inputPanel.id = 'chat-input-panel';
        inputPanel.style.cssText = [
            'position:fixed', 'bottom:5vh', 'left:5%', 'right:5%',
            'height:5vh', 'min-height:36px',
            'display:flex', 'align-items:center', 'gap:4px',
            'background:rgba(0,0,0,0.70)',
            'border:1px solid rgba(255,255,255,0.15)',
            'border-radius:8px',
            'padding:0 6px', 'box-sizing:border-box',
            'z-index:201'
        ].join(';');

        const input = document.createElement('input');
        input.id = 'chat-input';
        input.type = 'text';
        input.placeholder = '輸入訊息...';
        input.maxLength = 200;
        input.style.cssText = [
            'flex:1', 'height:28px',
            'background:rgba(255,255,255,0.08)',
            'border:1px solid rgba(255,255,255,0.2)',
            'border-radius:4px', 'color:white', 'font-size:12px',
            'padding:3px 6px', 'outline:none', 'font-family:Arial,sans-serif'
        ].join(';');

        const sendBtn = document.createElement('button');
        sendBtn.id = 'chat-send-btn';
        sendBtn.textContent = '↩';
        sendBtn.style.cssText = [
            'width:36px', 'height:28px', 'flex-shrink:0',
            'background:rgba(60,120,60,0.6)',
            'border:1px solid #4a8a4a', 'color:white',
            'border-radius:4px', 'cursor:pointer', 'font-size:14px'
        ].join(';');

        inputPanel.appendChild(input);
        inputPanel.appendChild(sendBtn);

        // ── 設定面板（掛在 body）
        let settingsPanel = document.getElementById('chat-settings-panel');
        if (!settingsPanel) {
            settingsPanel = document.createElement('div');
            settingsPanel.id = 'chat-settings-panel';
            settingsPanel.style.cssText = [
                'display:none', 'position:fixed',
                'background:#1c1c1c', 'border:1px solid #444', 'border-radius:6px',
                'padding:10px 12px', 'width:210px', 'z-index:9999', 'font-size:12px'
            ].join(';');
            _renderChatSettingsPanel(settingsPanel);
            document.body.appendChild(settingsPanel);
        }

        // 齒輪：位置跟著 #chat-history-panel 右上角
        gearBtn.onclick = (e) => {
            e.stopPropagation();
            const sp = document.getElementById('chat-settings-panel');
            if (!sp) return;
            if (sp.style.display !== 'none') { sp.style.display = 'none'; return; }
            const hp   = document.getElementById('chat-history-panel');
            const rect = hp.getBoundingClientRect();
            sp.style.right  = (window.innerWidth - rect.right) + 'px';
            sp.style.bottom = (window.innerHeight - rect.top + 4) + 'px';
            sp.style.top    = 'auto';
            sp.style.left   = 'auto';
            sp.style.display = 'block';
        };

        // 發送訊息
        const _doSend = () => {
            const inp = document.getElementById('chat-input');
            if (!inp || !inp.value.trim()) return;
            sendChatMessage(inp.value);
            inp.value = '';
            _resetIdleTimer();
        };
        sendBtn.onclick = _doSend;

        input.addEventListener('keydown', (e) => {
            e.stopPropagation();
            if (e.key === 'Enter') { e.preventDefault(); _doSend(); }
        });
        input.addEventListener('keyup',    (e) => e.stopPropagation());
        input.addEventListener('keypress', (e) => e.stopPropagation());

        // 捲動偵測
        historyPanel.addEventListener('scroll', () => {
            const atBottom = historyPanel.scrollTop + historyPanel.clientHeight >= historyPanel.scrollHeight - 60;
            scrollBtn.style.display = atBottom ? 'none' : 'block';
        });
        scrollBtn.addEventListener('click', () => {
            historyPanel.scrollTop = historyPanel.scrollHeight;
            scrollBtn.style.display = 'none';
        });

        document.body.appendChild(historyPanel);
        document.body.appendChild(scrollBtn);
        document.body.appendChild(inputPanel);

    } else {
        // ════════════════════════════════════════
        // 桌機版：結構不動
        // ════════════════════════════════════════

        const panel = document.createElement('div');
        panel.id = 'chat-panel';
        panel.style.cssText = [
            'position:fixed', 'left:10px', 'bottom:10px',
            'width:320px', 'height:220px', 'z-index:201',
            'display:flex', 'flex-direction:column',
            'background:rgba(0,0,0,0.70)',
            'border:1px solid rgba(255,255,255,0.15)',
            'border-radius:8px',
            'color:white', 'font-family:Arial,sans-serif', 'font-size:12px',
            'box-sizing:border-box', 'overflow:hidden', 'pointer-events:all'
        ].join(';');

        const pinnedDiv = document.createElement('div');
        pinnedDiv.id = 'chat-pinned';
        pinnedDiv.style.cssText = [
            'display:none', 'padding:4px 28px 4px 8px',
            'background:rgba(255,215,0,0.15)',
            'border-bottom:1px solid rgba(255,215,0,0.3)',
            'font-size:11px', 'flex-shrink:0', 'word-break:break-all', 'line-height:1.4'
        ].join(';');

        const gearBtn = document.createElement('button');
        gearBtn.id = 'chat-settings-btn';
        gearBtn.textContent = '⚙️';
        gearBtn.style.cssText = [
            'position:absolute', 'top:6px', 'right:6px',
            'background:transparent', 'border:none', 'color:white',
            'font-size:14px', 'cursor:pointer', 'pointer-events:all',
            'padding:0', 'line-height:1', 'z-index:202'
        ].join(';');

        const msgDiv = document.createElement('div');
        msgDiv.id = 'chat-messages';
        msgDiv.style.cssText = [
            'flex:1', 'overflow-y:scroll', 'overflow-x:hidden', 'min-height:0',
            'padding:4px 8px',
            'scrollbar-width:thin',
            'scrollbar-color:rgba(255,255,255,0.3) transparent'
        ].join(';');

        const inputRow = document.createElement('div');
        inputRow.id = 'chat-input-row';
        inputRow.style.cssText = [
            'display:flex', 'align-items:center', 'gap:4px',
            'padding:4px 6px', 'width:100%',
            'border-top:1px solid rgba(255,255,255,0.1)',
            'flex-shrink:0', 'box-sizing:border-box'
        ].join(';');

        const input = document.createElement('input');
        input.id = 'chat-input';
        input.type = 'text';
        input.placeholder = '輸入訊息...';
        input.maxLength = 200;
        input.style.cssText = [
            'flex:1', 'background:rgba(255,255,255,0.08)',
            'border:1px solid rgba(255,255,255,0.2)',
            'border-radius:4px', 'color:white', 'font-size:12px',
            'padding:3px 6px', 'outline:none', 'font-family:Arial,sans-serif'
        ].join(';');

        const sendBtn = document.createElement('button');
        sendBtn.id = 'chat-send-btn';
        sendBtn.textContent = '↩';
        sendBtn.style.cssText = [
            'width:36px', 'height:26px',
            'background:rgba(60,120,60,0.6)',
            'border:1px solid #4a8a4a', 'color:white',
            'border-radius:4px', 'cursor:pointer', 'font-size:14px', 'flex-shrink:0'
        ].join(';');

        inputRow.appendChild(input);
        inputRow.appendChild(sendBtn);

        const settingsPanel = document.createElement('div');
        settingsPanel.id = 'chat-settings-panel';
        settingsPanel.style.cssText = [
            'display:none', 'position:fixed',
            'background:#1c1c1c', 'border:1px solid #444', 'border-radius:6px',
            'padding:10px 12px', 'width:210px', 'z-index:9999', 'font-size:12px'
        ].join(';');
        _renderChatSettingsPanel(settingsPanel);

        gearBtn.onclick = (e) => {
            e.stopPropagation();
            const sp = document.getElementById('chat-settings-panel');
            if (!sp) return;
            if (sp.style.display !== 'none') { sp.style.display = 'none'; return; }
            const panelRect = document.getElementById('chat-panel').getBoundingClientRect();
            sp.style.left   = (panelRect.right - 216) + 'px';
            sp.style.bottom = (window.innerHeight - panelRect.top + 4) + 'px';
            sp.style.display = 'block';
        };

        const _doSend = () => {
            const inp = document.getElementById('chat-input');
            if (!inp || !inp.value.trim()) return;
            sendChatMessage(inp.value);
            inp.value = '';
            _resetIdleTimer();
        };
        sendBtn.onclick = _doSend;

        input.addEventListener('keydown', (e) => {
            e.stopPropagation();
            if (e.key === 'Enter') { e.preventDefault(); _doSend(); }
        });
        input.addEventListener('keyup',    (e) => e.stopPropagation());
        input.addEventListener('keypress', (e) => e.stopPropagation());

        const scrollBtn = document.createElement('div');
        scrollBtn.id = 'chat-scroll-btn';
        scrollBtn.textContent = '↓';
        scrollBtn.style.cssText = [
            'display:none', 'position:absolute', 'bottom:48px', 'right:8px',
            'width:28px', 'height:28px',
            'background:rgba(255,255,255,0.15)',
            'border:1px solid rgba(255,255,255,0.3)',
            'border-radius:50%', 'cursor:pointer',
            'font-size:14px', 'color:white',
            'text-align:center', 'line-height:28px',
            'z-index:10', 'user-select:none'
        ].join(';');

        panel.appendChild(pinnedDiv);
        panel.appendChild(gearBtn);
        panel.appendChild(msgDiv);
        panel.appendChild(scrollBtn);
        panel.appendChild(inputRow);
        document.body.appendChild(settingsPanel);
        document.body.appendChild(panel);

        msgDiv.addEventListener('scroll', () => {
            const atBottom = msgDiv.scrollTop + msgDiv.clientHeight >= msgDiv.scrollHeight - 10;
            scrollBtn.style.display = atBottom ? 'none' : 'block';
        });
        scrollBtn.addEventListener('click', () => {
            msgDiv.scrollTop = msgDiv.scrollHeight;
            scrollBtn.style.display = 'none';
        });
    }
}

function _isAtBottom() {
    const el = document.getElementById('chat-history-panel') || document.getElementById('chat-messages');
    if (!el) return true;
    return el.scrollTop + el.clientHeight >= el.scrollHeight - 60;
}

function _formatChatTime(isoStr) {
    if (!isoStr) return '';
    const diff = Date.now() - new Date(isoStr).getTime();
    const sec  = Math.floor(diff / 1000);
    const min  = Math.floor(sec / 60);
    const hr   = Math.floor(min / 60);
    if (sec < 60)  return '剛剛';
    if (min < 60)  return min + '分鐘前';
    if (hr  < 24)  return hr  + '小時前';
    const d = new Date(isoStr);
    return '昨天 ' + d.getHours().toString().padStart(2, '0') + ':' +
           d.getMinutes().toString().padStart(2, '0');
}

function renderChat() {
    const scrollBtn  = document.getElementById('chat-scroll-btn');
    const pinnedDiv  = document.getElementById('chat-pinned');
    const pinnedMsg  = _chatMessages.find(m => m.is_pinned);
    const nonPinned  = _chatMessages.filter(m => !m.is_pinned);

    // ── 置頂區（共用）
    if (pinnedMsg && pinnedDiv) {
        const { lvTag, gmLabel, titleHtml, nameHtml } = _parseName(pinnedMsg);
        pinnedDiv.innerHTML =
            '📌 <span style="color:rgba(255,255,255,0.5);font-size:10px;">[' + _formatChatTime(pinnedMsg.created_at) +
            '][' + _esc(pinnedMsg.version || '') +
            '][' + _esc(lvTag) + ']</span> ' +
            gmLabel + titleHtml + nameHtml + '：' + _esc(pinnedMsg.content);
        pinnedDiv.style.display = 'block';
    } else if (pinnedDiv) {
        pinnedDiv.style.display = 'none';
    }

    const hp = document.getElementById('chat-history-panel');
    if (hp) {
        // ── 手機版：訊息直接 append 為 <p> 到 #chat-history-panel
        const wasAtBottom = hp.scrollTop + hp.clientHeight >= hp.scrollHeight - 60;
        Array.from(hp.querySelectorAll('p')).forEach(el => el.remove());
        for (const msg of nonPinned) {
            const { lvTag, gmLabel, titleHtml, nameHtml } = _parseName(msg);
            const p = document.createElement('p');
            p.style.cssText = 'margin:2px 0;line-height:1.4;word-break:break-all;';
            p.innerHTML =
                '<span style="color:rgba(255,255,255,0.5);font-size:10px;">[' + _formatChatTime(msg.created_at) +
                '][' + _esc(msg.version || '') +
                '][' + _esc(lvTag) + ']</span> ' +
                gmLabel + titleHtml + nameHtml + '：' + _esc(msg.content);
            hp.appendChild(p);
        }
        if (wasAtBottom) {
            hp.scrollTop = hp.scrollHeight;
            if (scrollBtn) scrollBtn.style.display = 'none';
        } else {
            if (scrollBtn) scrollBtn.style.display = 'block';
        }
        return;
    }

    // ── 桌機版：訊息 append 到 #chat-messages
    const msgDiv = document.getElementById('chat-messages');
    if (!msgDiv) return;
    const wasAtBottom = _isAtBottom();
    msgDiv.innerHTML = '';
    for (const msg of nonPinned) {
        const { lvTag, gmLabel, titleHtml, nameHtml } = _parseName(msg);
        const line = document.createElement('div');
        line.style.cssText = 'margin-bottom:2px;word-break:break-all;line-height:1.4;';
        line.innerHTML =
            '<span style="color:rgba(255,255,255,0.5);font-size:10px;">[' + _formatChatTime(msg.created_at) +
            '][' + _esc(msg.version || '') +
            '][' + _esc(lvTag) + ']</span> ' +
            gmLabel + titleHtml + nameHtml + '：' + _esc(msg.content);
        msgDiv.appendChild(line);
    }
    if (wasAtBottom) {
        msgDiv.scrollTop = msgDiv.scrollHeight;
        if (scrollBtn) scrollBtn.style.display = 'none';
    } else {
        if (scrollBtn) scrollBtn.style.display = 'block';
    }
}

// 解析 player_name（格式：lv30|Kiser 或 lv30|Kiser|先驅者）
function _parseName(msg) {
    const parts     = (msg.player_name || '').split('|');
    const lvTag     = parts[0] || '';
    const name      = (parts.length >= 2 ? parts[1] : parts[0]) || '匿名者';
    const titleStr  = parts[2] || '';
    const gmLabel   = msg.is_gm
        ? '<span style="color:#FFD700;font-weight:bold;">【GM】</span>'
        : '';
    const titleHtml = titleStr
        ? '<span style="color:#88CCFF;">[' + _esc(titleStr) + ']</span>'
        : '';
    const nameHtml  = msg.is_gm
        ? '<span style="color:#FFD700;">' + _esc(name) + '</span>'
        : _esc(name);
    return { lvTag, name, titleStr, gmLabel, titleHtml, nameHtml };
}

function _esc(s) {
    return String(s || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
