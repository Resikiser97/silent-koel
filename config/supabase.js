const SUPABASE_URL = 'https://wrcblrcihzsuwivowxbw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_OXb03F0LNFzkJnMfgmd-uw_c2T3t4Rk';

async function supabaseQuery(table, method, body = null, params = '') {
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

async function submitScore(data) {
    // 確保趣味統計欄位存在（九）
    if (data.giant_kills === undefined) data.giant_kills = (gameState && gameState.sessionStats) ? (gameState.sessionStats.giantKills || 0) : 0;
    if (data.killer_kills === undefined) data.killer_kills = (gameState && gameState.sessionStats) ? (gameState.sessionStats.killerKills || 0) : 0;
    if (data.killer_max_level === undefined) data.killer_max_level = (gameState && gameState.sessionStats) ? (gameState.sessionStats.killerMaxLevel || 0) : 0;
    return supabaseQuery('leaderboard', 'POST', data);
}

async function fetchVictoryRecords(difficulty) {
    const diffFilter = difficulty ? '&difficulty=eq.' + difficulty : '';
    return supabaseQuery(
        'leaderboard', 'GET', null,
        '?select=*&is_victory=eq.true' + diffFilter + '&order=version_order.desc,play_time.asc,boss_kill_time.asc&limit=100'
    );
}

async function fetchDefeatRecords(limit, difficulty) {
    const diffFilter = difficulty ? '&difficulty=eq.' + difficulty : '';
    return supabaseQuery(
        'leaderboard', 'GET', null,
        '?select=*&is_victory=eq.false' + diffFilter + '&order=version_order.desc,play_time.desc,score.desc&limit=' + limit
    );
}

async function fetchTop10(difficulty) {
    const diffFilter = difficulty ? '&difficulty=eq.' + difficulty : '';
    return supabaseQuery(
        'leaderboard', 'GET', null,
        '?select=name,score,play_time,is_victory,version_order' + diffFilter + '&order=version_order.desc,is_victory.desc,play_time.asc,boss_kill_time.asc&limit=10'
    );
}

// ── 趣味排行榜（九）：各類特殊統計
// 最速通關（勝利，play_time 最短）
async function fetchFunSpeedVictory(difficulty) {
    const diffFilter = difficulty ? '&difficulty=eq.' + difficulty : '';
    return supabaseQuery(
        'leaderboard', 'GET', null,
        '?select=name,play_time,version,created_at' + diffFilter + '&is_victory=eq.true&play_time=not.is.null&order=play_time.asc&limit=10'
    );
}
// 最速死亡（失敗，play_time 最短）
async function fetchFunSpeedDeath(difficulty) {
    const diffFilter = difficulty ? '&difficulty=eq.' + difficulty : '';
    return supabaseQuery(
        'leaderboard', 'GET', null,
        '?select=name,play_time,score,version,created_at' + diffFilter + '&is_victory=eq.false&order=play_time.asc&limit=10'
    );
}
// 巨人獵人（giant_kills 最多）
async function fetchFunGiantKills(difficulty) {
    const diffFilter = difficulty ? '&difficulty=eq.' + difficulty : '';
    return supabaseQuery(
        'leaderboard', 'GET', null,
        '?select=name,giant_kills,version,created_at' + diffFilter + '&giant_kills=gt.0&order=giant_kills.desc&limit=10'
    );
}
// 殺手獵人（killer_kills 最多）
async function fetchFunKillerKills(difficulty) {
    const diffFilter = difficulty ? '&difficulty=eq.' + difficulty : '';
    return supabaseQuery(
        'leaderboard', 'GET', null,
        '?select=name,killer_kills,version,created_at' + diffFilter + '&killer_kills=gt.0&order=killer_kills.desc&limit=10'
    );
}
// 殺手克星（killer_max_level 最高）
async function fetchFunKillerMaxLevel(difficulty) {
    const diffFilter = difficulty ? '&difficulty=eq.' + difficulty : '';
    return supabaseQuery(
        'leaderboard', 'GET', null,
        '?select=name,killer_max_level,version,created_at' + diffFilter + '&killer_max_level=gt.0&order=killer_max_level.desc&limit=10'
    );
}
// 最快擊殺 Boss（boss_kill_time 最短，只有勝利記錄才有此欄位）
async function fetchFunBossKillSpeed(difficulty) {
    const diffFilter = difficulty ? '&difficulty=eq.' + difficulty : '';
    return supabaseQuery(
        'leaderboard', 'GET', null,
        '?select=name,boss_kill_time,version,created_at' + diffFilter +
        '&is_victory=eq.true&boss_kill_time=not.is.null&order=boss_kill_time.asc&limit=10'
    );
}

// 最高等級 TOP10
async function fetchFunMaxLevel(difficulty) {
    const diffFilter = difficulty ? '&difficulty=eq.' + difficulty : '';
    return supabaseQuery(
        'leaderboard', 'GET', null,
        '?select=name,level,version,created_at' + diffFilter +
        '&level=not.is.null&order=level.desc&limit=10'
    );
}

// 取得排行榜中有資料的難度陣列（去重後排序）
async function fetchAvailableDifficulties() {
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
