// =============================================================
// systems/chat.js — 首頁聊天室系統（Supabase Realtime 即時聊天 + 帳號管理）
// v0.1.28.0
// =============================================================
//
// 【對外公開函式】（其他檔案可直接呼叫）
//   buildChatUI() — 建立聊天室 DOM（只建一次，重複呼叫無效）
//   initChat() — 連線 Supabase Realtime 頻道並開始接收訊息
//   showChat() — 顯示聊天室面板（收合狀態）
//   hideChat() — 隱藏聊天室面板
//   loadChatSettings() — 從 localStorage 讀取聊天帳號設定（登入狀態等）
//   saveChatSettings(obj) — 將帳號設定寫回 localStorage
//   chatLogout() — 登出並清除本地登入狀態
//   disconnectChat() — 斷開 Supabase Realtime 連線
//   renderChat() — 重新渲染聊天訊息列表（含頻道過濾、三格置頂）
//   isVipPlayer(msg) — 判斷訊息是否來自 VIP 玩家
//   chatSaveProgress() — 將目前遊戲進度儲存到 Supabase 雲端（已登入才執行）
//   openChatLogin() — 強制開啟聊天室登入流程（供成就 Overlay 稱號功能呼叫）
//   syncTitleToServer(title) — 將已選稱號同步至 Supabase chat_users.title（已登入才執行）
//
// 【DB 結構（v0.1.28.0 起）】
//   chat_messages 表：
//   - channel        (text)        ：'global' / 'zh' / 'en'，前端依此欄位過濾
//   - pin_slot       (integer)     ：NULL=未置頂；1/2/3=顯示中；4+=排隊等待
//   - pin_expires_at (timestamptz) ：NULL=永久；有值=到期 ISO 時間（伺服器為唯一真實來源）
//   - is_pinned 已移除（以 pin_slot 取代）
//
// 【GM 指令格式】
//   /pin <slot> <duration>  例：/pin 2 1H  /pin 1 6H  /pin 3 -（永久）
//   /unpin <slot>           例：/unpin 2
//   slot=1/2/3，duration=<N>H 或 - (永久)；GM 專屬，settings.isGM 才生效
//   排隊補位時 pin_expires_at 隨訊息物件自動帶過來，無需重算
//
// 【依賴的跨檔案函式】（修改時注意這些來自外部）
//   SUPABASE_URL, SUPABASE_KEY  ← 來自 config/supabase.js
//   supabaseQuery()             ← 來自 config/supabase.js（REST 備用路徑）
//   GAME_INFO                   ← 來自 config/gameConfig.js
//   gameState                   ← 來自 systems/gameState.js
//
// 【重要規則／陷阱】
//   ⚠️ 使用 Supabase Realtime 需啟用 chat_messages 表的 INSERT+UPDATE Realtime，
//      RLS 允許 anon SELECT / INSERT；GM UPDATE(pin_slot/pin_expires_at) / DELETE 需額外 policy
//   ⚠️ Polling 模式下 pin_slot/pin_expires_at UPDATE 不會即時反映，需重整頁面才同步
//   ⚠️ 密碼以 SHA-256 雜湊儲存，絕不明文上傳；帳號一旦建立無法自行重設密碼
//   ⚠️ _chatExpanded 狀態由 systems/input.js 的 ESC 鍵處理讀取，不可隨意重命名
// =============================================================

import { SUPABASE_URL, SUPABASE_KEY, supabaseQuery } from '../config/supabase.js';
import { GAME_INFO } from '../config/gameConfig.js';
import { gameState } from './gameState.js';
import {
    STORAGE_KEYS,
    storageGet,
    storageSet,
    storageRemove,
    storageGetJSON,
    storageSetJSON
} from '../storage/index.js';
import { _letterboxScale } from './mobile.js';

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
let _chatMessages      = [];     // 全頻道訊息（最多 50 筆），render 時依 channel 過濾
let _pinnedSlots       = [null, null, null]; // 置頂格 slot 1/2/3 當前訊息（含 pin_expires_at 欄位）
let _chatLastFetchTime = null;   // polling 用：上次拉取時間

let _currentChannel  = 'global'; // 展開面板目前查看的頻道分頁
let _defaultChannel  = 'global'; // 玩家設定的預設頻道（存 localStorage）

const CHAT_IDLE_MS = 60 * 60 * 1000; // 1 小時閒置斷線
const CHAT_POLL_MS = 8000;            // polling 間隔（ms）

// 拖拽狀態（供 _makeDraggable 與 gearBtn.onclick 共用）
const _chatDragState = { wasDragging: false };

export let _chatExpanded = false;  // 收合/展開狀態

// ─────────────────────────────────────────────
// 聊天室位置 localStorage 讀寫
// ─────────────────────────────────────────────

function _saveChatPosition(pos) {
    try { storageSetJSON(STORAGE_KEYS.CHAT_POSITION, pos); } catch(e) {}
}

function _loadChatPosition() {
    try {
        return storageGetJSON(STORAGE_KEYS.CHAT_POSITION);
    } catch(e) { return null; }
}

// ─────────────────────────────────────────────
// localStorage 聊天室帳號設定
// ─────────────────────────────────────────────

export function loadChatSettings() {
    try {
        const d = storageGetJSON(STORAGE_KEYS.CHAT_SETTINGS) || {};
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

export function saveChatSettings(obj) {
    storageSetJSON(STORAGE_KEYS.CHAT_SETTINGS, obj);
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
        return total * 10.01 + sp;
    } catch(e) { return 0; }
}

function _validateUsername(name) {
    if (!name || name.length < 1 || name.length > 20) {
        return { valid: false, reason: '名稱不能超過 20 個字符' };
    }
    if (!/^[a-zA-Z0-9]+$/.test(name)) {
        return { valid: false, reason: '名稱只能包含英文字母和數字' };
    }
    const normalized = name.toLowerCase().replace(/0/g, 'o').replace(/1/g, 'i').replace(/l/g, 'i');
    if (normalized.includes('goblinnest')) {
        return { valid: false, reason: '此名稱不可使用' };
    }
    return { valid: true, reason: null };
}

function _collectLocalData() {
    const keys = [
        STORAGE_KEYS.PLAYER_SKILLS,
        STORAGE_KEYS.SKILL_POINTS,
        STORAGE_KEYS.SAVED_ORGANS,
        STORAGE_KEYS.SAVED_HIDDEN_ORGANS,
        STORAGE_KEYS.LAST_RUN_ORGANS,
        STORAGE_KEYS.GAME_SETTINGS,
        STORAGE_KEYS.MUTATION_DATA,
        STORAGE_KEYS.SAVE_VERSION,
        STORAGE_KEYS.ACHIEVEMENTS,
        STORAGE_KEYS.FIRST_PLAY_DATE,
    ];
    const obj = {};
    keys.forEach(k => {
        const v = storageGet(k);
        if (v !== null) obj[k] = v;
    });
    return obj;
}

function _applyRemoteData(gameData) {
    if (!gameData) return;
    Object.entries(gameData).forEach(([k, v]) => {
        if (k === STORAGE_KEYS.SAVE_VERSION) return; // 不覆蓋本地版本號
        storageSet(k, v);
    });
}

async function chatLogin(username, password) {
    if (!username || !password) return { ok: false, msg: '請輸入名字和密碼' };
    const lowerName = username.toLowerCase();
    const hash = await _sha256(password);

    // 查詢帳號
    let user = null;
    let connErr = false;
    try {
        if (_sbClient) {
            const { data, error } = await _sbClient
                .from('chat_users')
                .select('*')
                .eq('username', lowerName)
                .maybeSingle();
            if (error) connErr = true;
            else user = data || null;
        } else {
            const data = await supabaseQuery(
                'chat_users', 'GET', null,
                '?select=*&username=eq.' + encodeURIComponent(lowerName) + '&limit=1'
            );
            user = (Array.isArray(data) && data.length > 0) ? data[0] : null;
        }
    } catch(e) { connErr = true; }

    if (connErr) return { ok: false, msg: '連線失敗，請稍後再試' };

    if (!user) {
        // 帳號不存在 → 驗證後自動註冊
        const validation = _validateUsername(lowerName);
        if (!validation.valid) return { ok: false, msg: validation.reason };
        const localData = _collectLocalData();
        try {
            if (_sbClient) {
                const { error: insertErr } = await _sbClient
                    .from('chat_users')
                    .insert({ username: lowerName, password: hash, is_gm: false, game_data: localData });
                if (insertErr) return { ok: false, msg: '註冊失敗，請稍後再試' };
            } else {
                await supabaseQuery('chat_users', 'POST', {
                    username: lowerName, password: hash, is_gm: false, game_data: localData
                });
            }
        } catch(e) { return { ok: false, msg: '註冊失敗，請稍後再試' }; }
        saveChatSettings({ playerName: lowerName, isGM: false, loggedIn: true });
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
    if (user.is_pioneer) window.dispatchEvent(new CustomEvent('pioneerConfirmed'));
    return { ok: true, msg: syncMsg, isGM: user.is_gm };
}

export async function chatSaveProgress() {
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

export function chatLogout() {
    const keys = [
        STORAGE_KEYS.PLAYER_SKILLS,
        STORAGE_KEYS.SKILL_POINTS,
        STORAGE_KEYS.SAVED_ORGANS,
        STORAGE_KEYS.SAVED_HIDDEN_ORGANS,
        STORAGE_KEYS.LAST_RUN_ORGANS,
        STORAGE_KEYS.GAME_SETTINGS,
        STORAGE_KEYS.MUTATION_DATA,
        STORAGE_KEYS.CHAT_SETTINGS,
        STORAGE_KEYS.SAVE_VERSION
    ];
    keys.forEach(k => storageRemove(k));
    saveChatSettings({ playerName: '', isGM: false, loggedIn: false });
}

// ─────────────────────────────────────────────
// Supabase 聊天室核心函式
// ─────────────────────────────────────────────

export async function initChat() {
    // 讀取預設頻道（buildChatUI 可能已設好，這裡再確認一次）
    const saved = storageGet(STORAGE_KEYS.CHAT_DEFAULT_CHANNEL);
    if (saved) { _defaultChannel = saved; _currentChannel = saved; }

    // 先確保斷線（重入時重新建立乾淨連線）
    disconnectChat();

    // 清除 24 小時前的訊息
    await _deleteOldMessages();

    // 讀取最近 50 筆訊息（含所有頻道）
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

    // 從歷史訊息解析置頂格（pin_slot 1/2/3；到期時間從各訊息的 pin_expires_at 讀取）
    _pinnedSlots = [null, null, null];
    for (const m of _chatMessages) {
        if (m.pin_slot >= 1 && m.pin_slot <= 3) {
            _pinnedSlots[m.pin_slot - 1] = m;
        }
    }

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
                .is('pin_slot', null)
                .lt('created_at', cutoff);
        } else {
            await supabaseQuery(
                'chat_messages', 'DELETE', null,
                '?pin_slot=is.null&created_at=lt.' + encodeURIComponent(cutoff)
            );
        }
    } catch(e) {}
}

// 從 _chatMessages 重建 _pinnedSlots（收到 UPDATE 時呼叫）
function _refreshPinnedSlots() {
    _pinnedSlots = [null, null, null];
    for (const m of _chatMessages) {
        if (m.pin_slot >= 1 && m.pin_slot <= 3) {
            _pinnedSlots[m.pin_slot - 1] = m;
        }
    }
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
            .on('postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'chat_messages' },
                (payload) => {
                    const updated = payload.new;
                    const idx = _chatMessages.findIndex(m => m.id === updated.id);
                    if (idx >= 0) _chatMessages[idx] = updated;
                    else _chatMessages.push(updated);
                    _refreshPinnedSlots();
                    renderChat();
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

export function disconnectChat() {
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
        const md = storageGetJSON(STORAGE_KEYS.MUTATION_DATA) || {};
        const lv = md.levels || {};
        mutLevel = (lv.fang || 0) + (lv.tail || 0) + (lv.wing || 0) + (lv.eye || 0);
    } catch(e) {}

    // /pin 指令（GM 限定）
    if (settings.isGM && content.trim().startsWith('/pin')) {
        await _handlePinCommand(content.trim());
        return;
    }
    // /unpin 取消置頂（GM 限定）
    if (settings.isGM && content.trim().toLowerCase().startsWith('/unpin')) {
        await _handleUnpinCommand(content.trim());
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
        channel:     _currentChannel
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
    // 格式：/pin <slot> <duration>  例：/pin 2 1H  或  /pin 1 -
    const match = cmd.match(/^\/pin\s+([123])\s+(\d+H|-)$/i);
    if (!match) return;
    const requestedSlot = parseInt(match[1]);
    const durationStr   = match[2].toUpperCase();

    const settings    = loadChatSettings();
    const displayName = settings.playerName.trim() || '匿名者';

    // 找自己最新一條尚未置頂的 GM 訊息
    const myMsg = [..._chatMessages].reverse().find(m => {
        const parts = (m.player_name || '').split('|');
        return parts.length >= 2 && parts[1] === displayName && m.is_gm && !m.pin_slot;
    });
    if (!myMsg) return;

    // 決定實際使用的 slot
    let actualSlot = null;
    if (!_pinnedSlots[requestedSlot - 1]) {
        actualSlot = requestedSlot;
    } else {
        // 找下一個空格（1→2→3）
        for (let i = 1; i <= 3; i++) {
            if (!_pinnedSlots[i - 1]) { actualSlot = i; break; }
        }
        if (!actualSlot) {
            // 1/2/3 全滿 → 排隊區（pin_slot 4, 5, 6...）
            const maxSlot = _chatMessages.reduce((mx, m) => {
                return (m.pin_slot && m.pin_slot >= 4) ? Math.max(mx, m.pin_slot) : mx;
            }, 3);
            actualSlot = maxSlot + 1;
        }
    }

    // 計算到期 ISO 字串，寫入 DB（"-" = 永久不過期 → null）
    const pinExpiresAt = durationStr === '-'
        ? null
        : new Date(Date.now() + parseInt(durationStr) * 3600000).toISOString();

    try {
        if (_sbClient) {
            await _sbClient.from('chat_messages')
                .update({ pin_slot: actualSlot, pin_expires_at: pinExpiresAt })
                .eq('id', myMsg.id);
        } else {
            await supabaseQuery('chat_messages', 'PATCH',
                { pin_slot: actualSlot, pin_expires_at: pinExpiresAt },
                '?id=eq.' + myMsg.id);
        }
    } catch(e) {}

    // 更新本地快取（到期時間跟著訊息物件走，不需獨立陣列）
    const idx = _chatMessages.findIndex(m => m.id === myMsg.id);
    if (idx >= 0) _chatMessages[idx] = { ..._chatMessages[idx], pin_slot: actualSlot, pin_expires_at: pinExpiresAt };
    if (actualSlot <= 3) {
        _pinnedSlots[actualSlot - 1] = _chatMessages[idx >= 0 ? idx : _chatMessages.length - 1];
    }
    renderChat();
}

async function _handleUnpinCommand(cmd) {
    // 格式：/unpin <slot>  例：/unpin 2
    const match = cmd.match(/^\/unpin\s+([123])$/i);
    if (!match) return;
    const slot   = parseInt(match[1]);
    const pinned = _pinnedSlots[slot - 1];
    if (!pinned) return;

    // 清除此格的置頂
    try {
        if (_sbClient) {
            await _sbClient.from('chat_messages').update({ pin_slot: null }).eq('id', pinned.id);
        } else {
            await supabaseQuery('chat_messages', 'PATCH', { pin_slot: null }, '?id=eq.' + pinned.id);
        }
    } catch(e) {}

    const pinnedIdx = _chatMessages.findIndex(m => m.id === pinned.id);
    if (pinnedIdx >= 0) _chatMessages[pinnedIdx] = { ..._chatMessages[pinnedIdx], pin_slot: null };
    _pinnedSlots[slot - 1] = null;

    // 從排隊區補位（FIFO：pin_slot 最小的那筆最先加入）
    const queued = _chatMessages
        .filter(m => m.pin_slot >= 4)
        .sort((a, b) => a.pin_slot - b.pin_slot)[0];

    if (queued) {
        try {
            if (_sbClient) {
                await _sbClient.from('chat_messages').update({ pin_slot: slot }).eq('id', queued.id);
            } else {
                await supabaseQuery('chat_messages', 'PATCH', { pin_slot: slot }, '?id=eq.' + queued.id);
            }
        } catch(e) {}
        const qIdx = _chatMessages.findIndex(m => m.id === queued.id);
        if (qIdx >= 0) _chatMessages[qIdx] = { ..._chatMessages[qIdx], pin_slot: slot };
        _pinnedSlots[slot - 1] = _chatMessages[qIdx >= 0 ? qIdx : 0];
    }
    renderChat();
}

// GM 客端偵測到某 slot 到期時，自動清除並從排隊區補位
async function _promoteQueueToSlot(slot) {
    const pinned = _pinnedSlots[slot - 1];
    if (pinned) {
        try {
            if (_sbClient) {
                await _sbClient.from('chat_messages').update({ pin_slot: null }).eq('id', pinned.id);
            } else {
                await supabaseQuery('chat_messages', 'PATCH', { pin_slot: null }, '?id=eq.' + pinned.id);
            }
        } catch(e) {}
        const idx = _chatMessages.findIndex(m => m.id === pinned.id);
        if (idx >= 0) _chatMessages[idx] = { ..._chatMessages[idx], pin_slot: null };
    }
    _pinnedSlots[slot - 1] = null;

    const queued = _chatMessages
        .filter(m => m.pin_slot >= 4)
        .sort((a, b) => a.pin_slot - b.pin_slot)[0];

    if (queued) {
        try {
            if (_sbClient) {
                // 僅更新 pin_slot；pin_expires_at 已在 /pin 時寫入，跟著訊息自動帶過來
                await _sbClient.from('chat_messages').update({ pin_slot: slot }).eq('id', queued.id);
            } else {
                await supabaseQuery('chat_messages', 'PATCH', { pin_slot: slot }, '?id=eq.' + queued.id);
            }
        } catch(e) {}
        const qIdx = _chatMessages.findIndex(m => m.id === queued.id);
        if (qIdx >= 0) _chatMessages[qIdx] = { ..._chatMessages[qIdx], pin_slot: slot };
        _pinnedSlots[slot - 1] = _chatMessages[qIdx >= 0 ? qIdx : 0];
    }
    renderChat();
}

// 設定預設頻道並存 localStorage，同步更新 ⭐ 高亮
function _setDefaultChannel(channel) {
    _defaultChannel = channel;
    storageSet(STORAGE_KEYS.CHAT_DEFAULT_CHANNEL, channel);
    ['global', 'zh', 'en'].forEach(ch => {
        const star = document.getElementById('chat-tab-star-' + ch);
        if (star) star.style.opacity = ch === channel ? '1' : '0.35';
    });
}

// 切換目前查看的頻道分頁，更新 Tab 高亮後重渲染
function _switchChannel(channel) {
    _currentChannel = channel;
    ['global', 'zh', 'en'].forEach(ch => {
        const tab = document.getElementById('chat-tab-' + ch);
        if (tab) {
            tab.style.background    = ch === channel ? 'rgba(255,255,255,0.12)' : 'transparent';
            tab.style.borderBottom  = ch === channel ? '2px solid rgba(255,255,255,0.6)' : '2px solid transparent';
            tab.style.color         = ch === channel ? 'white' : 'rgba(255,255,255,0.55)';
        }
    });
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

export function showChat() {
    const collapsed = document.getElementById('chat-collapsed-panel');
    const fakeInput = document.getElementById('chat-fake-input');
    if (collapsed) collapsed.style.display = '';
    if (fakeInput)  fakeInput.style.display  = '';
}

export function hideChat() {
    ['chat-collapsed-panel', 'chat-fake-input',
     'chat-expanded-panel', 'chat-overlay-backdrop',
     'chat-settings-panel'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

function _makeDraggable(handle, panels) {
    let isDragging = false;
    let startX = 0, startY = 0;
    let startPositions = [];

    const onStart = (clientX, clientY) => {
        isDragging = false;
        startX = clientX;
        startY = clientY;
        startPositions = panels.map(p => ({
            left:   parseFloat(p.style.left)   || p.offsetLeft,
            bottom: parseFloat(p.style.bottom) || (900 - p.offsetTop - p.offsetHeight)
        }));
    };

    const onMove = (clientX, clientY) => {
        const dx = clientX - startX;
        const dy = clientY - startY;
        if (!isDragging && Math.abs(dx) + Math.abs(dy) > 5) isDragging = true;
        if (!isDragging) return;

        const scale = _letterboxScale || 1;
        panels.forEach((p, i) => {
            let newLeft   = startPositions[i].left   + dx / scale;
            let newBottom = startPositions[i].bottom - dy / scale;
            newLeft   = Math.max(0, Math.min(newLeft,   1600 - p.offsetWidth));
            newBottom = Math.max(0, Math.min(newBottom, 900  - p.offsetHeight));
            p.style.left   = newLeft + 'px';
            p.style.right  = 'auto';
            p.style.bottom = newBottom + 'px';
        });
    };

    const onEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        _chatDragState.wasDragging = true;
        const pos = {};
        panels.forEach(p => { pos[p.id] = { left: p.style.left, bottom: p.style.bottom }; });
        _saveChatPosition(pos);
    };

    // 桌機版 mouse 事件
    handle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        onStart(e.clientX, e.clientY);
        const onMoveG = (e) => onMove(e.clientX, e.clientY);
        const onEndG  = () => { onEnd(); document.removeEventListener('mousemove', onMoveG); document.removeEventListener('mouseup', onEndG); };
        document.addEventListener('mousemove', onMoveG);
        document.addEventListener('mouseup',   onEndG);
    });

    // 手機版 touch 事件
    handle.addEventListener('touchstart', (e) => {
        const t = e.touches[0]; onStart(t.clientX, t.clientY);
    }, { passive: true });

    handle.addEventListener('touchmove', (e) => {
        const t = e.touches[0]; onMove(t.clientX, t.clientY);
        if (isDragging) e.preventDefault();
    }, { passive: false });

    handle.addEventListener('touchend', onEnd);
}

// ─────────────────────────────────────────────
// 視窗調整時重新夾住邊界
// ─────────────────────────────────────────────
window.addEventListener('resize', () => {
    ['chat-collapsed-panel', 'chat-fake-input']
        .map(id => document.getElementById(id))
        .filter(Boolean)
        .forEach(p => {
            let left   = Math.max(0, Math.min(parseFloat(p.style.left)   || 0, 1600 - p.offsetWidth));
            let bottom = Math.max(0, Math.min(parseFloat(p.style.bottom) || 0, 900  - p.offsetHeight));
            p.style.left   = left   + 'px';
            p.style.bottom = bottom + 'px';
        });
});

// ─────────────────────────────────────────────
// 收合/展開狀態切換
// ─────────────────────────────────────────────

function _expandChat() {
    _chatExpanded = true;
    // 展開時回到預設頻道分頁（但不強制改 _currentChannel 若已與 defaultChannel 一致）
    if (_currentChannel !== _defaultChannel) {
        _currentChannel = _defaultChannel;
        _switchChannel(_currentChannel);
    }
    const collapsed = document.getElementById('chat-collapsed-panel');
    const fakeInput = document.getElementById('chat-fake-input');
    const expanded  = document.getElementById('chat-expanded-panel');
    const backdrop  = document.getElementById('chat-overlay-backdrop');
    if (collapsed) collapsed.style.display = 'none';
    if (fakeInput)  fakeInput.style.display  = 'none';
    if (expanded)  expanded.style.display  = 'flex';
    if (backdrop)  backdrop.style.display  = 'block';
    const msgs = document.getElementById('chat-expanded-messages');
    if (msgs) setTimeout(() => { msgs.scrollTop = msgs.scrollHeight; }, 50);
    const inp = document.getElementById('chat-input');
    if (inp) setTimeout(() => inp.focus(), 80);
}

export function _collapseChat() {
    _chatExpanded = false;
    const collapsed = document.getElementById('chat-collapsed-panel');
    const fakeInput = document.getElementById('chat-fake-input');
    const expanded  = document.getElementById('chat-expanded-panel');
    const backdrop  = document.getElementById('chat-overlay-backdrop');
    if (expanded)  expanded.style.display  = 'none';
    if (backdrop)  backdrop.style.display  = 'none';
    if (collapsed) collapsed.style.display = '';
    if (fakeInput)  fakeInput.style.display  = '';
    const sp = document.getElementById('chat-settings-panel');
    if (sp) sp.style.display = 'none';
}

function _onViewportResize() {
    if (!_chatExpanded) return;
    const vv = window.visualViewport;
    if (!vv) return;
    const scale = _letterboxScale || 1;
    const keyboardH = (window.innerHeight - (vv.height + (vv.offsetTop || 0))) / scale;
    const ep = document.getElementById('chat-expanded-panel');
    if (ep) ep.style.bottom = Math.max(0, keyboardH) + 'px';
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

export function buildChatUI() {
    const gc = document.getElementById('game-container');

    // 清除所有舊元素
    ['chat-collapsed-panel', 'chat-fake-input', 'chat-expanded-panel',
     'chat-overlay-backdrop', 'chat-settings-panel',
     'chat-panel', 'chat-history-panel', 'chat-input-panel'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.remove();
    });
    _chatExpanded = false;

    // 讀取預設頻道初始化狀態
    const savedCh = storageGet(STORAGE_KEYS.CHAT_DEFAULT_CHANNEL);
    if (savedCh) { _defaultChannel = savedCh; _currentChannel = savedCh; }

    const isMob = (typeof gameState !== 'undefined') && gameState.isMobile;

    // ════════════════════════════════════════════════════════
    // 設定面板（body 層，收合/展開共用）
    // ════════════════════════════════════════════════════════
    const settingsPanel = document.createElement('div');
    settingsPanel.id = 'chat-settings-panel';
    settingsPanel.style.cssText = [
        'display:none', 'position:absolute',
        'background:#1c1c1c', 'border:1px solid #444', 'border-radius:6px',
        'padding:10px 12px', 'width:210px', 'z-index:9999', 'font-size:12px',
        'font-family:Arial,sans-serif', 'color:white'
    ].join(';');
    _renderChatSettingsPanel(settingsPanel);
    gc.appendChild(settingsPanel);

    // 齒輪按鈕共用點擊邏輯
    const _openSettings = (e, refEl) => {
        if (_chatDragState.wasDragging) { _chatDragState.wasDragging = false; return; }
        e.stopPropagation();
        const sp = document.getElementById('chat-settings-panel');
        if (!sp) return;
        if (sp.style.display !== 'none') { sp.style.display = 'none'; return; }
        _renderChatSettingsPanel(sp);
        const spW  = 214;
        const spLeft = refEl.offsetLeft;
        sp.style.left   = Math.max(4, Math.min(spLeft, 1600 - spW - 4)) + 'px';
        sp.style.bottom = (900 - refEl.offsetTop + 4) + 'px';
        sp.style.top    = 'auto';
        sp.style.right  = 'auto';
        sp.style.display = 'block';
    };

    // ════════════════════════════════════════════════════════
    // 遮罩（點擊收合，z-index 8999）
    // ════════════════════════════════════════════════════════
    const backdrop = document.createElement('div');
    backdrop.id = 'chat-overlay-backdrop';
    backdrop.style.cssText = [
        'display:none', 'position:absolute',
        'top:0', 'left:0', 'right:0', 'bottom:0',
        'z-index:8999', 'background:transparent'
    ].join(';');
    backdrop.addEventListener('click', () => _collapseChat());
    gc.appendChild(backdrop);

    // ════════════════════════════════════════════════════════
    // 收合面板（訊息預覽）
    // ════════════════════════════════════════════════════════
    const collapsedPanel = document.createElement('div');
    collapsedPanel.id = 'chat-collapsed-panel';
    collapsedPanel.style.cssText = isMob ? [
        'position:absolute', 'left:80px', 'right:80px',
        'bottom:89px',
        'max-height:120px',
        'z-index:9000',
        'background:rgba(0,0,0,0.60)',
        'border:1px solid rgba(255,255,255,0.12)',
        'border-radius:8px 8px 0 0',
        'overflow:hidden',
        'color:white', 'font-family:Arial,sans-serif', 'font-size:11px',
        'box-sizing:border-box', 'padding:4px 28px 4px 8px',
        'pointer-events:all'
    ].join(';') : [
        'position:absolute', 'left:10px', 'bottom:44px',
        'width:320px', 'max-height:160px',
        'z-index:9000',
        'background:rgba(0,0,0,0.60)',
        'border:1px solid rgba(255,255,255,0.12)',
        'border-radius:8px 8px 0 0',
        'overflow:hidden',
        'color:white', 'font-family:Arial,sans-serif', 'font-size:11px',
        'box-sizing:border-box', 'padding:4px 28px 4px 8px',
        'pointer-events:all'
    ].join(';');

    // 齒輪按鈕（右上角，兼拖拽 handle）
    const gearBtn = document.createElement('button');
    gearBtn.id = 'chat-gear-btn';
    gearBtn.textContent = '⚙️';
    gearBtn.style.cssText = [
        'position:absolute', 'top:4px', 'right:6px',
        'background:transparent', 'border:none', 'color:white',
        'font-size:14px', 'cursor:pointer', 'pointer-events:all',
        'padding:0', 'line-height:1', 'z-index:9001'
    ].join(';');
    gearBtn.onclick = (e) => _openSettings(e, collapsedPanel);
    collapsedPanel.appendChild(gearBtn);

    // 三格置頂預覽（slot 1/2/3）
    for (let i = 1; i <= 3; i++) {
        const cp = document.createElement('div');
        cp.id = 'chat-collapsed-pin-' + i;
        cp.style.cssText = [
            'display:none',
            'padding:1px 0 2px',
            'border-bottom:1px solid rgba(255,215,0,0.3)',
            'color:rgba(255,215,0,0.85)', 'font-size:10px',
            'white-space:nowrap', 'overflow:hidden', 'text-overflow:ellipsis',
            'margin-bottom:2px'
        ].join(';');
        collapsedPanel.appendChild(cp);
    }

    // 預覽訊息容器
    const previewMessages = document.createElement('div');
    previewMessages.id = 'chat-preview-messages';
    previewMessages.style.cssText = 'overflow:hidden;';
    collapsedPanel.appendChild(previewMessages);

    // 點擊預覽區展開（非齒輪）
    collapsedPanel.addEventListener('click', (e) => {
        if (e.target === gearBtn || gearBtn.contains(e.target)) return;
        _expandChat();
    });
    gc.appendChild(collapsedPanel);

    // ════════════════════════════════════════════════════════
    // 假輸入列（點擊展開）
    // ════════════════════════════════════════════════════════
    const fakeInput = document.createElement('div');
    fakeInput.id = 'chat-fake-input';
    fakeInput.style.cssText = isMob ? [
        'position:absolute', 'left:80px', 'right:80px', 'bottom:45px',
        'height:36px', 'z-index:9000',
        'background:rgba(0,0,0,0.70)',
        'border:1px solid rgba(255,255,255,0.15)',
        'border-radius:0 0 8px 8px',
        'display:flex', 'align-items:center',
        'padding:0 10px', 'box-sizing:border-box',
        'cursor:text', 'pointer-events:all'
    ].join(';') : [
        'position:absolute', 'left:10px', 'bottom:10px',
        'width:320px', 'height:36px', 'z-index:9000',
        'background:rgba(0,0,0,0.70)',
        'border:1px solid rgba(255,255,255,0.15)',
        'border-radius:0 0 8px 8px',
        'display:flex', 'align-items:center',
        'padding:0 10px', 'box-sizing:border-box',
        'cursor:text', 'pointer-events:all'
    ].join(';');
    const fakePlaceholder = document.createElement('span');
    fakePlaceholder.style.cssText = 'color:rgba(255,255,255,0.35);font-size:12px;font-family:Arial,sans-serif;user-select:none;';
    fakePlaceholder.textContent = '點此輸入訊息...';
    fakeInput.appendChild(fakePlaceholder);
    fakeInput.addEventListener('click', () => _expandChat());
    gc.appendChild(fakeInput);

    // ════════════════════════════════════════════════════════
    // 展開面板（完整聊天室）
    // ════════════════════════════════════════════════════════
    const expandedPanel = document.createElement('div');
    expandedPanel.id = 'chat-expanded-panel';
    expandedPanel.style.cssText = isMob ? [
        'display:none', 'position:absolute', 'left:0', 'bottom:0',
        'width:1600px', 'height:495px', 'z-index:9001',
        'background:rgba(15,15,15,0.97)',
        'border-radius:12px 12px 0 0',
        'border:1px solid rgba(255,255,255,0.15)', 'border-bottom:none',
        'flex-direction:column',
        'color:white', 'font-family:Arial,sans-serif', 'font-size:12px',
        'box-sizing:border-box', 'overflow:hidden'
    ].join(';') : [
        'display:none', 'position:absolute', 'left:10px', 'bottom:10px',
        'width:360px', 'height:480px', 'z-index:9001',
        'background:rgba(15,15,15,0.97)',
        'border-radius:8px',
        'border:1px solid rgba(255,255,255,0.15)',
        'flex-direction:column',
        'color:white', 'font-family:Arial,sans-serif', 'font-size:12px',
        'box-sizing:border-box', 'overflow:hidden'
    ].join(';');

    // 標題列
    const titleBar = document.createElement('div');
    titleBar.style.cssText = [
        'display:flex', 'align-items:center', 'justify-content:space-between',
        'padding:6px 10px', 'flex-shrink:0',
        'border-bottom:1px solid rgba(255,255,255,0.1)',
        'background:rgba(255,255,255,0.05)'
    ].join(';');
    const titleText = document.createElement('span');
    titleText.style.cssText = 'font-size:13px;font-weight:bold;color:white;';
    titleText.textContent = '💬 聊天室';
    const titleRight = document.createElement('div');
    titleRight.style.cssText = 'display:flex;gap:8px;align-items:center;';
    const expandedGear = document.createElement('button');
    expandedGear.id = 'chat-expanded-gear';
    expandedGear.textContent = '⚙️';
    expandedGear.style.cssText = 'background:transparent;border:none;color:white;font-size:14px;cursor:pointer;padding:0;line-height:1;';
    expandedGear.onclick = (e) => _openSettings(e, expandedPanel);
    const closeBtn = document.createElement('button');
    closeBtn.id = 'chat-close-btn';
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = 'background:transparent;border:none;color:#aaa;font-size:14px;cursor:pointer;padding:0;line-height:1;';
    closeBtn.addEventListener('click', () => _collapseChat());
    titleRight.appendChild(expandedGear);
    titleRight.appendChild(closeBtn);
    titleBar.appendChild(titleText);
    titleBar.appendChild(titleRight);

    // 頻道分頁列
    const channelTabs = document.createElement('div');
    channelTabs.id = 'chat-channel-tabs';
    channelTabs.style.cssText = [
        'display:flex', 'align-items:stretch', 'flex-shrink:0',
        'border-bottom:1px solid rgba(255,255,255,0.1)',
        'background:rgba(0,0,0,0.25)'
    ].join(';');
    const _tabDefs = [
        { ch: 'global', label: '全服' },
        { ch: 'zh',     label: '中文' },
        { ch: 'en',     label: 'Eng'  },
    ];
    _tabDefs.forEach(({ ch, label }) => {
        const tab = document.createElement('div');
        tab.id = 'chat-tab-' + ch;
        tab.style.cssText = [
            'display:flex', 'align-items:center', 'gap:3px',
            'padding:5px 10px', 'cursor:pointer', 'font-size:12px',
            'user-select:none', 'flex:1', 'justify-content:center',
            'border-bottom:2px solid transparent',
            'transition:background 0.1s',
            ch === _currentChannel
                ? 'background:rgba(255,255,255,0.12);border-bottom:2px solid rgba(255,255,255,0.6);color:white;'
                : 'background:transparent;color:rgba(255,255,255,0.55);'
        ].join(';');

        const starBtn = document.createElement('span');
        starBtn.id = 'chat-tab-star-' + ch;
        starBtn.textContent = '⭐';
        starBtn.title = '設為預設頻道';
        starBtn.style.cssText = 'font-size:11px;opacity:' + (ch === _defaultChannel ? '1' : '0.35') + ';cursor:pointer;flex-shrink:0;';
        starBtn.addEventListener('click', (e) => { e.stopPropagation(); _setDefaultChannel(ch); });

        const labelSpan = document.createElement('span');
        labelSpan.textContent = label;

        tab.appendChild(starBtn);
        tab.appendChild(labelSpan);
        tab.addEventListener('click', () => _switchChannel(ch));
        channelTabs.appendChild(tab);
    });

    // chat-expanded-pin-1/2/3 會在下方 appendChild 序列中依序建立並插入

    // 訊息區
    const expandedMessages = document.createElement('div');
    expandedMessages.id = 'chat-expanded-messages';
    expandedMessages.style.cssText = [
        'flex:1', 'overflow-y:scroll', 'overflow-x:hidden', 'min-height:0',
        'padding:6px 8px',
        'scrollbar-width:thin',
        'scrollbar-color:rgba(255,255,255,0.3) transparent'
    ].join(';');

    // 往下按鈕
    const scrollBtn = document.createElement('div');
    scrollBtn.id = 'chat-expanded-scroll-btn';
    scrollBtn.textContent = '↓';
    scrollBtn.style.cssText = [
        'display:none', 'position:absolute', 'bottom:48px', 'right:10px',
        'width:28px', 'height:28px',
        'background:rgba(255,255,255,0.15)',
        'border:1px solid rgba(255,255,255,0.3)',
        'border-radius:50%', 'cursor:pointer',
        'font-size:14px', 'color:white',
        'text-align:center', 'line-height:28px',
        'z-index:10', 'user-select:none'
    ].join(';');

    // 輸入列
    const inputRow = document.createElement('div');
    inputRow.style.cssText = [
        'display:flex', 'align-items:center', 'gap:4px',
        'padding:4px 6px', 'border-top:1px solid rgba(255,255,255,0.1)',
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
    // 顏色選擇面板（輸入框上方，預設隱藏）
    const colorPanel = document.createElement('div');
    colorPanel.id = 'chat-color-panel';
    colorPanel.style.cssText = [
        'display:none', 'align-items:center', 'gap:6px',
        'padding:5px 8px', 'background:#1a1a2e',
        'border-top:1px solid rgba(255,255,255,0.12)',
        'border-left:1px solid rgba(255,255,255,0.12)',
        'border-right:1px solid rgba(255,255,255,0.12)',
        'border-radius:6px 6px 0 0', 'flex-shrink:0', 'box-sizing:border-box'
    ].join(';');
    const _colorDefs = [
        { label: '紅字', tag: 'red',   bg: '#993333' },
        { label: '藍字', tag: 'blue',  bg: '#336699' },
        { label: '綠字', tag: 'green', bg: '#337744' },
        { label: '深紅字', tag: 'crim', bg: '#7a1a1a' },
    ];
    _colorDefs.forEach(({ label, tag, bg }) => {
        const cb = document.createElement('button');
        cb.textContent = label;
        cb.style.cssText = 'padding:3px 8px;background:' + bg + ';color:white;border:none;border-radius:3px;cursor:pointer;font-size:12px;flex-shrink:0;';
        cb.onclick = (e) => {
            e.stopPropagation();
            const inp2 = document.getElementById('chat-input');
            if (!inp2) return;
            const open = '[c=' + tag + ']';
            const close = '[/c]';
            const st = inp2.selectionStart;
            const en = inp2.selectionEnd;
            inp2.value = inp2.value.slice(0, st) + open + inp2.value.slice(st, en) + close + inp2.value.slice(en);
            const cur = st + open.length + (en - st);
            inp2.setSelectionRange(cur, cur);
            inp2.focus();
        };
        colorPanel.appendChild(cb);
    });

    // 🎨 按鈕
    const colorBtn = document.createElement('button');
    colorBtn.id = 'chat-color-btn';
    colorBtn.textContent = '🎨';
    colorBtn.title = '插入顏色標籤';
    colorBtn.style.cssText = [
        'width:28px', 'height:26px',
        'background:rgba(60,60,110,0.6)',
        'border:1px solid rgba(255,255,255,0.2)', 'color:white',
        'border-radius:4px', 'cursor:pointer', 'font-size:13px', 'flex-shrink:0'
    ].join(';');
    let _colorPanelOpen = false;
    const _toggleColorPanel = (e) => {
        e.stopPropagation();
        _colorPanelOpen = !_colorPanelOpen;
        colorPanel.style.display = _colorPanelOpen ? 'flex' : 'none';
    };
    colorBtn.addEventListener('click', _toggleColorPanel);
    document.addEventListener('click', (e) => {
        if (_colorPanelOpen && !colorPanel.contains(e.target) && e.target !== colorBtn) {
            _colorPanelOpen = false;
            colorPanel.style.display = 'none';
        }
    });

    inputRow.appendChild(input);
    inputRow.appendChild(colorBtn);
    inputRow.appendChild(sendBtn);

    // 捲動偵測
    expandedMessages.addEventListener('scroll', () => {
        const atBottom = expandedMessages.scrollTop + expandedMessages.clientHeight >= expandedMessages.scrollHeight - 10;
        scrollBtn.style.display = atBottom ? 'none' : 'block';
    });
    scrollBtn.addEventListener('click', () => {
        expandedMessages.scrollTop = expandedMessages.scrollHeight;
        scrollBtn.style.display = 'none';
    });

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
        if (e.key === 'Enter')  { e.preventDefault(); _doSend(); }
        if (e.key === 'Escape') { e.preventDefault(); _collapseChat(); }
    });
    input.addEventListener('keyup',    (e) => e.stopPropagation());
    input.addEventListener('keypress', (e) => e.stopPropagation());

    expandedPanel.appendChild(titleBar);
    expandedPanel.appendChild(channelTabs);
    // 三格置頂列（slot 1/2/3，全頻道共用）
    const _expandedPinStyle = [
        'display:none', 'padding:3px 8px', 'flex-shrink:0',
        'background:rgba(255,215,0,0.08)',
        'border-bottom:1px solid rgba(255,215,0,0.25)',
        'font-size:11px', 'word-break:break-all', 'line-height:1.4'
    ].join(';');
    for (let _pi = 1; _pi <= 3; _pi++) {
        const _ep = document.createElement('div');
        _ep.id = 'chat-expanded-pin-' + _pi;
        _ep.style.cssText = _expandedPinStyle;
        expandedPanel.appendChild(_ep);
    }
    expandedPanel.appendChild(expandedMessages);
    expandedPanel.appendChild(scrollBtn);
    expandedPanel.appendChild(colorPanel);
    expandedPanel.appendChild(inputRow);
    gc.appendChild(expandedPanel);

    // 拖拽（桌機版，以 gearBtn 為 handle，移動 collapsedPanel + fakeInput）
    if (!isMob) {
        _makeDraggable(gearBtn, [collapsedPanel, fakeInput]);
        const _savedPos = _loadChatPosition();
        if (_savedPos) {
            if (_savedPos['chat-collapsed-panel']) {
                collapsedPanel.style.left   = _savedPos['chat-collapsed-panel'].left;
                collapsedPanel.style.bottom = _savedPos['chat-collapsed-panel'].bottom;
                collapsedPanel.style.right  = 'auto';
            }
            if (_savedPos['chat-fake-input']) {
                fakeInput.style.left   = _savedPos['chat-fake-input'].left;
                fakeInput.style.bottom = _savedPos['chat-fake-input'].bottom;
                fakeInput.style.right  = 'auto';
            }
        }
    }

    // 手機版：visualViewport 鍵盤高度偵測
    if (isMob && window.visualViewport) {
        window.visualViewport.removeEventListener('resize', _onViewportResize);
        window.visualViewport.addEventListener('resize', _onViewportResize);
    }

    renderChat();
}

function _isAtBottom() {
    const el = document.getElementById('chat-expanded-messages');
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

function _buildMsgHTML(msg) {
    const { lvTagHtml, gmLabel, titleHtml, nameHtml } = _parseName(msg);
    return '<div style="margin-bottom:2px;word-break:break-all;line-height:1.4;">' +
        '<span style="color:rgba(255,255,255,0.5);font-size:10px;margin-right:0px;">[' +
        _formatChatTime(msg.created_at) + ']</span>' +
        lvTagHtml +
        gmLabel + titleHtml + nameHtml + '：' +
        (msg.is_gm ? '<span style="color:#FFD700;">' + _parseColorTags(_esc(msg.content)) + '</span>' : _parseColorTags(_esc(msg.content), isVipPlayer(msg))) +
        '</div>';
}

function _buildMsgText(msg) {
    const parts = (msg.player_name || '').split('|');
    const name  = (parts.length >= 2 ? parts[1] : parts[0]) || '匿名者';
    return name + '：' + (msg.content || '');
}

export function renderChat() {
    // ── 到期檢查（從 DB 欄位 pin_expires_at 判斷，GM 客端負責補位）
    const settings = loadChatSettings();
    for (let _i = 0; _i < 3; _i++) {
        const _slot = _pinnedSlots[_i];
        if (_slot && _slot.pin_expires_at &&
            new Date(_slot.pin_expires_at).getTime() < Date.now()) {
            if (settings.isGM) {
                _promoteQueueToSlot(_i + 1).catch(() => {});
            } else {
                _pinnedSlots[_i] = null;
            }
        }
    }

    // ── 置頂格（收合版，slot 1/2/3 各一行）
    for (let _i = 1; _i <= 3; _i++) {
        const msg = _pinnedSlots[_i - 1];
        const el  = document.getElementById('chat-collapsed-pin-' + _i);
        if (el) {
            if (msg) {
                el.textContent   = '📌' + _i + ' ' + _buildMsgText(msg);
                el.style.display = 'block';
            } else {
                el.style.display = 'none';
            }
        }
    }

    // ── 置頂格（展開版，slot 1/2/3 各一行）
    for (let _i = 1; _i <= 3; _i++) {
        const msg = _pinnedSlots[_i - 1];
        const el  = document.getElementById('chat-expanded-pin-' + _i);
        if (el) {
            if (msg) {
                const { lvTagHtml, gmLabel, titleHtml, nameHtml } = _parseName(msg);
                el.innerHTML =
                    '📌<span style="font-size:10px;opacity:0.6;">' + _i + '</span> ' +
                    '<span style="color:rgba(255,255,255,0.5);font-size:10px;">[' +
                    _formatChatTime(msg.created_at) + ']</span>' +
                    lvTagHtml + gmLabel + titleHtml + nameHtml + '：' +
                    (msg.is_gm
                        ? '<span style="color:#FFD700;">' + _parseColorTags(_esc(msg.content)) + '</span>'
                        : _parseColorTags(_esc(msg.content), isVipPlayer(msg)));
                el.style.display = 'block';
            } else {
                el.style.display = 'none';
            }
        }
    }

    // 非置頂、非排隊中的訊息（pin_slot 為 null 或 0）
    const nonPinned = _chatMessages.filter(m => !m.pin_slot);

    // ── 預覽訊息（收合版，最近 7 筆，只顯示預設頻道）
    const previewMessages = document.getElementById('chat-preview-messages');
    if (previewMessages) {
        const recent = nonPinned
            .filter(m => (m.channel || 'global') === _defaultChannel)
            .slice(-7);
        previewMessages.innerHTML = recent.map(msg => {
            const { gmLabel, nameHtml } = _parseName(msg);
            return '<div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.4;margin:1px 0;">' +
                gmLabel + nameHtml + '：' + _esc(msg.content) + '</div>';
        }).join('');
    }

    // ── 展開版訊息（依當前分頁頻道過濾）
    const expandedMessages = document.getElementById('chat-expanded-messages');
    if (!expandedMessages) return;
    const scrollBtn   = document.getElementById('chat-expanded-scroll-btn');
    const wasAtBottom = _isAtBottom();
    const filtered = nonPinned.filter(m => (m.channel || 'global') === _currentChannel);
    expandedMessages.innerHTML = filtered.map(_buildMsgHTML).join('');
    if (wasAtBottom) {
        expandedMessages.scrollTop = expandedMessages.scrollHeight;
        if (scrollBtn) scrollBtn.style.display = 'none';
    } else {
        if (scrollBtn) scrollBtn.style.display = 'block';
    }
}

// 根據變異等級數字回傳對應顏色 CSS 字串（inline style 用）
function _lvColor(lvNum) {
    if (lvNum >= 400) return 'background:linear-gradient(90deg,#ff0000,#ff7700,#ffff00,#00ff00,#0099ff,#aa00ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;';
    if (lvNum >= 350) return 'color:#FF8C00;';
    if (lvNum >= 300) return 'color:#FF3333;';
    if (lvNum >= 250) return 'color:#FFD700;';
    if (lvNum >= 200) return 'color:#FF69B4;';
    if (lvNum >= 150) return 'color:#CC44FF;';
    if (lvNum >= 100) return 'color:#4488FF;';
    if (lvNum >=  50) return 'color:#44CC44;';
    return 'color:rgba(255,255,255,0.7);';
}

// 解析 player_name（格式：lv30|Kiser 或 lv30|Kiser|先驅者）
function _parseName(msg) {
    const parts     = (msg.player_name || '').split('|');
    const lvTag     = parts[0] || '';
    const name      = (parts.length >= 2 ? parts[1] : parts[0]) || '匿名者';
    const titleStr  = parts[2] || '';
    const lvNum     = parseInt((lvTag || '').replace(/\D/g, '')) || 0;
    const lvTagHtml = '<span style="' + _lvColor(lvNum) + 'font-size:13px;font-weight:bold;margin-right:0px;">' + _esc(lvTag) + '</span>';
    const gmLabel   = msg.is_gm
        ? '<span style="color:#4B9CD3;font-weight:bold;margin-right:0px;">【GM】</span>'
        : '';
    const titleHtml = titleStr
        ? '<span style="color:#88CCFF;margin-right:5px;">[' + _esc(titleStr) + ']</span>'
        : '';
    const nameHtml  = msg.is_gm
        ? '<span style="color:#FFD700;">' + _esc(name) + '</span>'
        : _esc(name);
    return { lvTag, lvTagHtml, lvNum, name, titleStr, gmLabel, titleHtml, nameHtml, isGm: msg.is_gm };
}

export function _esc(s) {
    return String(s || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// 解析彩色字標籤 [c=red]文字[/c]
// 支援顏色：red, green, blue（一般玩家）
// 先驅者玩家未來可支援任意 CSS 顏色（TODO）
// 傳入的 content 已經過 _esc() 處理，為 HTML 安全字串
const _COLOR_MAP = {
    red:   '#FF4444',
    green: '#44FF44',
    blue:  '#4488FF',
    crim:  '#C62828',
};

function _parseColorTags(escapedContent, isVIP) {
    const allowedColors = isVIP
        ? null  // null = 允許任意顏色（VIP 未來實作）
        : ['red', 'green', 'blue', 'crim'];

    return escapedContent.replace(
        /\[c=([^\]]+)\](.*?)\[\/c\]/gi,
        function(match, color, text) {
            if (allowedColors && !allowedColors.includes(color.toLowerCase())) {
                return text;
            }
            const resolved = _COLOR_MAP[color.toLowerCase()];
            const safeColor = resolved
                ? resolved
                : (/^[a-zA-Z]+$/.test(color) || /^#[0-9a-fA-F]{3,6}$/.test(color) ? color : 'white');
            return '<span style="color:' + safeColor + ';">' + text + '</span>';
        }
    );
}

// TODO: 先驅者判斷函式 — 交接點
// 實作時在此填入判斷邏輯（例如查 chat_users.is_pioneer 欄位或 titleStr === '先驅者'）
// 目前暫時回傳 false（所有玩家使用一般顏色限制）
export function isVipPlayer(msg) {
    // TODO: 先驅者系統實作點
    return false;
}

// 開啟聊天室登入面板（成就稱號 UI 未登入時呼叫）
export function openChatLogin() {
    const sp = document.getElementById('chat-settings-panel');
    if (!sp) return;
    _renderChatSettingsPanel(sp);
    sp.style.left   = '20px';
    sp.style.bottom = '80px';
    sp.style.top    = 'auto';
    sp.style.right  = 'auto';
    sp.style.display = 'block';
}

// 將稱號同步至 Supabase chat_users 資料表
export async function syncTitleToServer(title) {
    const settings = loadChatSettings();
    if (!settings.loggedIn || !settings.playerName) return;
    saveChatSettings({ ...settings, title: title || '' });
    try {
        if (_sbClient) {
            await _sbClient.from('chat_users')
                .update({ title: title || '' })
                .eq('username', settings.playerName.toLowerCase());
        } else {
            await supabaseQuery('chat_users', 'PATCH',
                { title: title || '' },
                '?username=eq.' + encodeURIComponent(settings.playerName.toLowerCase())
            );
        }
    } catch(e) {}
}
