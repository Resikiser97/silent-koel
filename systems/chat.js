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
            loggedIn:   d.loggedIn   || false
        };
    } catch(e) {
        return { playerName: '', isGM: false, loggedIn: false };
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

    saveChatSettings({ playerName: username, isGM: user.is_gm, loggedIn: true });
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
    const fullName    = 'lv' + mutLevel + '|' + displayName;

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

// 渲染設定面板內容（依登入狀態切換，可重複呼叫）
function _renderChatSettingsPanel(panel) {
    panel.innerHTML = '';
    const cs = loadChatSettings();

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
    if (document.getElementById('chat-panel')) return; // 已建立，不重複

    const isMob = (typeof gameState !== 'undefined') && gameState.isMobile;
    const panel = document.createElement('div');
    panel.id = 'chat-panel';

    if (isMob) {
        panel.style.cssText = [
            'position:absolute', 'bottom:0', 'left:5%', 'right:5%',
            'height:25vh', 'z-index:201',
            'display:flex', 'flex-direction:column',
            'background:rgba(0,0,0,0.70)',
            'border:1px solid rgba(255,255,255,0.15)',
            'border-radius:8px 8px 0 0',
            'color:white', 'font-family:Arial,sans-serif', 'font-size:12px',
            'box-sizing:border-box', 'overflow:hidden', 'pointer-events:all'
        ].join(';');
    } else {
        panel.style.cssText = [
            'position:absolute', 'left:10px', 'bottom:10px',
            'width:320px', 'height:220px', 'z-index:201',
            'display:flex', 'flex-direction:column',
            'background:rgba(0,0,0,0.70)',
            'border:1px solid rgba(255,255,255,0.15)',
            'border-radius:8px',
            'color:white', 'font-family:Arial,sans-serif', 'font-size:12px',
            'box-sizing:border-box', 'overflow:hidden', 'pointer-events:all'
        ].join(';');
    }

    // ── 置頂訊息區
    const pinnedDiv = document.createElement('div');
    pinnedDiv.id = 'chat-pinned';
    pinnedDiv.style.cssText = [
        'display:none', 'padding:4px 28px 4px 8px',
        'background:rgba(255,215,0,0.15)',
        'border-bottom:1px solid rgba(255,215,0,0.3)',
        'font-size:11px', 'flex-shrink:0', 'word-break:break-all', 'line-height:1.4'
    ].join(';');

    // ── ⚙️ 齒輪按鈕（右上角）
    const gearBtn = document.createElement('button');
    gearBtn.id = 'chat-settings-btn';
    gearBtn.textContent = '⚙️';
    gearBtn.style.cssText = [
        'position:absolute', 'top:6px', 'right:6px',
        'background:transparent', 'border:none', 'color:white',
        'font-size:14px', 'cursor:pointer', 'pointer-events:all',
        'padding:0', 'line-height:1', 'z-index:202'
    ].join(';');

    // ── 訊息列表
    const msgDiv = document.createElement('div');
    msgDiv.id = 'chat-messages';
    msgDiv.style.cssText = 'flex:1;overflow-y:auto;padding:4px 8px;';

    // ── 輸入列
    const inputRow = document.createElement('div');
    inputRow.id = 'chat-input-row';
    inputRow.style.cssText = [
        'display:flex', 'align-items:center', 'gap:4px',
        'padding:4px 6px',
        'border-top:1px solid rgba(255,255,255,0.1)',
        'flex-shrink:0'
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

    // ── 設定面板（預設隱藏，內容由 _renderChatSettingsPanel 動態產生）
    const settingsPanel = document.createElement('div');
    settingsPanel.id = 'chat-settings-panel';
    settingsPanel.style.cssText = [
        'display:none', 'position:absolute', 'bottom:38px', 'right:6px',
        'background:#1c1c1c', 'border:1px solid #444', 'border-radius:6px',
        'padding:10px 12px', 'width:210px', 'z-index:203', 'font-size:12px'
    ].join(';');
    _renderChatSettingsPanel(settingsPanel);

    // 齒輪：切換設定面板
    gearBtn.onclick = (e) => {
        e.stopPropagation();
        const sp = document.getElementById('chat-settings-panel');
        if (sp) sp.style.display = (sp.style.display === 'none') ? 'block' : 'none';
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

    // Enter 發送，阻止遊戲鍵盤事件
    input.addEventListener('keydown', (e) => {
        e.stopPropagation();
        if (e.key === 'Enter') { e.preventDefault(); _doSend(); }
    });
    input.addEventListener('keyup',    (e) => e.stopPropagation());
    input.addEventListener('keypress', (e) => e.stopPropagation());

    // 組合結構
    panel.appendChild(pinnedDiv);
    panel.appendChild(gearBtn);
    panel.appendChild(msgDiv);
    panel.appendChild(inputRow);
    panel.appendChild(settingsPanel);

    document.getElementById('game-container').appendChild(panel);

    // 手機版：延後檢查是否與首頁按鈕重疊，必要時縮小高度
    if (isMob) {
        setTimeout(() => _adjustMobileChatHeight(panel), 60);
    }
}

function _adjustMobileChatHeight(panel) {
    const startScreen = document.getElementById('start-screen');
    if (!startScreen) return;
    // 找所有主選單按鈕的最低 bottom
    const buttons = startScreen.querySelectorAll('button');
    let lowestBottom = 0;
    buttons.forEach(btn => {
        const r = btn.getBoundingClientRect();
        if (r.bottom > lowestBottom) lowestBottom = r.bottom;
    });
    // 依序縮減直到不重疊
    const tryHeights = ['25vh', '20vh', '15vh', '10vh'];
    for (const h of tryHeights) {
        panel.style.height = h;
        const r = panel.getBoundingClientRect();
        if (r.top >= lowestBottom) break;
    }
}

function renderChat() {
    const msgDiv    = document.getElementById('chat-messages');
    const pinnedDiv = document.getElementById('chat-pinned');
    if (!msgDiv) return;

    // ── 置頂區
    const pinnedMsg = _chatMessages.find(m => m.is_pinned);
    if (pinnedMsg && pinnedDiv) {
        const { lvTag, name, gmLabel, nameHtml } = _parseName(pinnedMsg);
        pinnedDiv.innerHTML =
            '📌 <span style="color:#888;font-size:10px;">[' + _esc(pinnedMsg.version || '') +
            '][' + _esc(lvTag) + ']</span> ' +
            gmLabel + nameHtml + '：' + _esc(pinnedMsg.content);
        pinnedDiv.style.display = 'block';
    } else if (pinnedDiv) {
        pinnedDiv.style.display = 'none';
    }

    // ── 一般訊息
    msgDiv.innerHTML = '';
    const nonPinned = _chatMessages.filter(m => !m.is_pinned);
    for (const msg of nonPinned) {
        const { lvTag, gmLabel, nameHtml } = _parseName(msg);
        const line = document.createElement('div');
        line.style.cssText = 'margin-bottom:2px;word-break:break-all;line-height:1.4;';
        line.innerHTML =
            '<span style="color:#666;font-size:10px;">[' + _esc(msg.version || '') +
            '][' + _esc(lvTag) + ']</span> ' +
            gmLabel + nameHtml + '：' + _esc(msg.content);
        msgDiv.appendChild(line);
    }

    // 捲到最新訊息
    msgDiv.scrollTop = msgDiv.scrollHeight;
}

// 解析 player_name（格式：lv30|Kiser）
function _parseName(msg) {
    const parts  = (msg.player_name || '').split('|');
    const lvTag  = parts[0] || '';
    const name   = (parts.length >= 2 ? parts[1] : parts[0]) || '匿名者';
    const gmLabel = msg.is_gm
        ? '<span style="color:#FFD700;font-weight:bold;">【GM】</span>'
        : '';
    const nameHtml = msg.is_gm
        ? '<span style="color:#FFD700;">' + _esc(name) + '</span>'
        : _esc(name);
    return { lvTag, name, gmLabel, nameHtml };
}

function _esc(s) {
    return String(s || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
