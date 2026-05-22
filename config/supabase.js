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

// 取得排行榜中有資料的難度陣列（去重後排序）
async function fetchAvailableDifficulties() {
    const rows = await supabaseQuery('leaderboard', 'GET', null, '?select=difficulty&order=difficulty.asc');
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
