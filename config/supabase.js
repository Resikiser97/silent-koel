// =============================================================
// config/supabase.js — Supabase 連線設定與排行榜 REST API 封裝
// =============================================================
//
// 【對外公開函式】（其他檔案可直接呼叫）
//   supabaseQuery(table, method, body, params) — 通用 Supabase REST 請求
//   submitScore(data) — 提交一筆分數紀錄到 leaderboard 資料表
//   fetchVictoryRecords(difficulty) — 拉取勝利排行（勝利、遊玩時間最短）
//   fetchDefeatRecords(limit, difficulty) — 拉取失敗排行（遊玩時間最長）
//   fetchTop10(difficulty) — 拉取首頁 TOP10 摘要
//   fetchFunSpeedVictory(difficulty) — 趣味榜：最速通關
//   fetchFunSpeedDeath(difficulty) — 趣味榜：最速死亡
//   fetchFunGiantKills(difficulty) — 趣味榜：巨人獵人（giant_kills 最多）
//   fetchFunKillerKills(difficulty) — 趣味榜：殺手獵人（killer_kills 最多）
//   fetchFunKillerMaxLevel(difficulty) — 趣味榜：殺手克星（killer_max_level 最高）
//   fetchFunBossKillSpeed(difficulty) — 趣味榜：最快擊殺 Boss
//   fetchFunMaxLevel(difficulty) — 趣味榜：最高等級 TOP10
//   fetchFunHunterKill(difficulty) — 趣味榜：最快擊殺黑色獵人（困難地圖）
//   fetchFunFruitsEaten(difficulty) — 趣味榜：最佳果王（fruits_eaten 最多）
//   fetchFunNormalKills(difficulty) — 趣味榜：最強獵戶（normal_kills 最多）
//   fetchAvailableDifficulties() — 取得排行榜中有資料的難度陣列
//
// 【依賴的跨檔案函式】（修改時注意這些來自外部）
//   gameState  ← 來自 systems/gameState.js（submitScore 讀取 sessionStats）
//
// 【重要規則／陷阱】
//   ⚠️ SUPABASE_KEY 為 publishable key（anon），可安全公開於前端
//   ⚠️ submitScore 的趣味統計欄位若未傳入會自動從 gameState.sessionStats 補填
// =============================================================

export const SUPABASE_URL = 'https://wrcblrcihzsuwivowxbw.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_OXb03F0LNFzkJnMfgmd-uw_c2T3t4Rk';

export async function supabaseQuery(table, method, body = null, params = '') {
    const url = `${SUPABASE_URL}/rest/v1/${table}${params}`;
    const headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': method === 'POST' ? 'return=minimal' : 'return=representation'
    };
    console.log('[Supabase] 提交URL：', url);
    if (body) console.log('[Supabase] 提交資料：', JSON.stringify(body));
    try {
        const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : null });
        if (!res.ok) {
            const errText = await res.text();
            console.log('[Supabase] 錯誤詳情：', errText);
            throw new Error(errText);
        }
        return method === 'POST' ? null : await res.json();
    } catch (e) {
        console.log('[Supabase] 錯誤詳情：', e.message);
        throw e;
    }
}

export async function submitScore(data) {
    // 確保趣味統計欄位存在（九）
    if (data.giant_kills === undefined) data.giant_kills = (gameState && gameState.sessionStats) ? (gameState.sessionStats.giantKills || 0) : 0;
    if (data.killer_kills === undefined) data.killer_kills = (gameState && gameState.sessionStats) ? (gameState.sessionStats.killerKills || 0) : 0;
    if (data.killer_max_level === undefined) data.killer_max_level = (gameState && gameState.sessionStats) ? (gameState.sessionStats.killerMaxLevel || 0) : 0;
    if (data.fruits_eaten === undefined) data.fruits_eaten = (gameState && gameState.sessionStats) ? (gameState.sessionStats.fruitsEaten || 0) : 0;
    if (data.normal_kills === undefined) data.normal_kills = (gameState && gameState.sessionStats) ? (gameState.sessionStats.normalKills || 0) : 0;
    return supabaseQuery('leaderboard', 'POST', data);
}

export async function fetchVictoryRecords(difficulty) {
    const diffFilter = difficulty ? '&difficulty=eq.' + difficulty : '';
    return supabaseQuery(
        'leaderboard', 'GET', null,
        '?select=*&is_victory=eq.true' + diffFilter + '&order=version_order.desc,play_time.asc,boss_kill_time.asc&limit=100'
    );
}

export async function fetchDefeatRecords(limit, difficulty) {
    const diffFilter = difficulty ? '&difficulty=eq.' + difficulty : '';
    return supabaseQuery(
        'leaderboard', 'GET', null,
        '?select=*&is_victory=eq.false' + diffFilter + '&order=version_order.desc,play_time.desc,score.desc&limit=' + limit
    );
}

export async function fetchTop10(difficulty) {
    const diffFilter = difficulty ? '&difficulty=eq.' + difficulty : '';
    return supabaseQuery(
        'leaderboard', 'GET', null,
        '?select=name,score,play_time,is_victory,version_order,character' + diffFilter + '&order=version_order.desc,is_victory.desc,play_time.asc,boss_kill_time.asc&limit=10'
    );
}

// ── 趣味排行榜（九）：各類特殊統計
// 最速通關（勝利，play_time 最短）
export async function fetchFunSpeedVictory(difficulty) {
    const diffFilter = difficulty ? '&difficulty=eq.' + difficulty : '';
    return supabaseQuery(
        'leaderboard', 'GET', null,
        '?select=name,play_time,version,created_at,character' + diffFilter + '&is_victory=eq.true&play_time=not.is.null&order=play_time.asc&limit=10'
    );
}
// 最速死亡（失敗，play_time 最短）
export async function fetchFunSpeedDeath(difficulty) {
    const diffFilter = difficulty ? '&difficulty=eq.' + difficulty : '';
    return supabaseQuery(
        'leaderboard', 'GET', null,
        '?select=name,play_time,score,version,created_at,character' + diffFilter + '&is_victory=eq.false&order=play_time.asc&limit=10'
    );
}
// 巨人獵人（giant_kills 最多）
export async function fetchFunGiantKills(difficulty) {
    const diffFilter = difficulty ? '&difficulty=eq.' + difficulty : '';
    return supabaseQuery(
        'leaderboard', 'GET', null,
        '?select=name,giant_kills,version,created_at,character' + diffFilter + '&giant_kills=gt.0&order=giant_kills.desc&limit=10'
    );
}
// 殺手獵人（killer_kills 最多）
export async function fetchFunKillerKills(difficulty) {
    const diffFilter = difficulty ? '&difficulty=eq.' + difficulty : '';
    return supabaseQuery(
        'leaderboard', 'GET', null,
        '?select=name,killer_kills,version,created_at,character' + diffFilter + '&killer_kills=gt.0&order=killer_kills.desc&limit=10'
    );
}
// 殺手克星（killer_max_level 最高）
export async function fetchFunKillerMaxLevel(difficulty) {
    const diffFilter = difficulty ? '&difficulty=eq.' + difficulty : '';
    return supabaseQuery(
        'leaderboard', 'GET', null,
        '?select=name,killer_max_level,version,created_at,character' + diffFilter + '&killer_max_level=gt.0&order=killer_max_level.desc&limit=10'
    );
}
// 最快擊殺 Boss（boss_kill_time 最短，只有勝利記錄才有此欄位）
export async function fetchFunBossKillSpeed(difficulty) {
    const diffFilter = difficulty ? '&difficulty=eq.' + difficulty : '';
    return supabaseQuery(
        'leaderboard', 'GET', null,
        '?select=name,boss_kill_time,version,created_at,character' + diffFilter +
        '&is_victory=eq.true&boss_kill_time=not.is.null&order=boss_kill_time.asc&limit=10'
    );
}

// 最高等級 TOP10
export async function fetchFunMaxLevel(difficulty) {
    const diffFilter = difficulty ? '&difficulty=eq.' + difficulty : '';
    return supabaseQuery(
        'leaderboard', 'GET', null,
        '?select=name,level,version,created_at,character' + diffFilter +
        '&level=not.is.null&order=level.desc&limit=10'
    );
}

// 最快擊殺黑色獵人（困難地圖，boss_kill_time 最短）
export async function fetchFunHunterKill(difficulty) {
    return supabaseQuery(
        'leaderboard', 'GET', null,
        '?select=name,boss_kill_time,version,created_at,character&difficulty=eq.hard&boss_kill_time=not.is.null&order=boss_kill_time.asc&limit=10'
    );
}
// 最佳果王（fruits_eaten 最多）
export async function fetchFunFruitsEaten(difficulty) {
    const diffFilter = difficulty ? '&difficulty=eq.' + difficulty : '';
    return supabaseQuery(
        'leaderboard', 'GET', null,
        '?select=name,fruits_eaten,version,created_at,character' + diffFilter +
        '&fruits_eaten=gt.0&order=fruits_eaten.desc&limit=10'
    );
}
// 最強獵戶（normal_kills 最多）
export async function fetchFunNormalKills(difficulty) {
    const diffFilter = difficulty ? '&difficulty=eq.' + difficulty : '';
    return supabaseQuery(
        'leaderboard', 'GET', null,
        '?select=name,normal_kills,version,created_at,character' + diffFilter +
        '&normal_kills=gt.0&order=normal_kills.desc&limit=10'
    );
}

// 取得排行榜中有資料的難度陣列（去重後排序）
export async function fetchAvailableDifficulties() {
    const rows = await supabaseQuery('leaderboard', 'GET', null, '?select=difficulty&order=difficulty.asc&limit=1000');
    if (!rows || rows.length === 0) return [];
    const seen = new Set();
    const result = [];
    for (const r of rows) {
        if (r.difficulty && !seen.has(r.difficulty)) {
            seen.add(r.difficulty);
            result.push(r.difficulty);
        }
    }
    return result;
}
