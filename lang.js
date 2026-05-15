// =============================================================
// lang.js — 多語系容器與工具函式
// =============================================================
// ✦ 翻譯外包說明（給新語言譯者）：
//   1. 複製 lang/ 資料夾中的 en.js，重新命名為新語言代碼（例如 ja.js）。
//   2. 在下方 LANG_LIST 加入新語言的 code 與顯示名稱。
//   3. 在 index.html 的 <script> 區塊加入 <script src="lang/ja.js"></script>。
//   4. 只翻譯字串值，不要更動任何 key 名稱或 {token} 佔位符。
//   5. 新遊戲內容（器官 / 技能 / 進化 / Boss / Guide）上線時，
//      必須在每個語言包同步補上對應翻譯，否則會 fallback 顯示 zh-TW 原文。
//   6. 不要修改本檔的 applyLanguage / _langPack / t — 那些是程式邏輯。
// =============================================================

const LANG_LIST = [
    { code: 'zh-TW', label: '繁體中文' },
    { code: 'en',    label: 'English' }
];

// 語言資料容器：各語言包（lang/zh-TW.js、lang/en.js 等）會在此填入對應資料
const LANG = {};

// =============================================================
// 程式邏輯（譯者請勿修改下方內容）
// =============================================================

function _langPack(lang) {
    return LANG[lang] || LANG['zh-TW'];
}

function applyLanguage(lang) {
    const pack = _langPack(lang);
    // ── 一般器官
    if (pack.organs) Object.keys(ORGANS).forEach(id => {
        const tr = pack.organs[id]; if (!tr) return;
        if (tr.name) ORGANS[id].name = tr.name;
        if (tr.levels) tr.levels.forEach((d, i) => { if (ORGANS[id].levels[i]) ORGANS[id].levels[i].desc = d; });
    });
    // ── 隱藏器官
    if (pack.hidden) Object.keys(HIDDEN_ORGANS).forEach(id => {
        const tr = pack.hidden[id]; if (!tr) return;
        if (tr.name) HIDDEN_ORGANS[id].name = tr.name;
        if (tr.desc) HIDDEN_ORGANS[id].desc = tr.desc;
    });
    // ── 技能
    if (pack.skills) Object.keys(SKILLS).forEach(id => {
        const tr = pack.skills[id]; if (!tr) return;
        if (tr.name) SKILLS[id].name = tr.name;
        if (tr.desc) SKILLS[id].desc = tr.desc;
    });
    // ── 進化路線
    if (pack.evo) Object.keys(EVOLUTION_PATHS).forEach(id => {
        const tr = pack.evo[id]; if (!tr) return;
        if (tr.name) EVOLUTION_PATHS[id].name = tr.name;
        if (tr.levels) tr.levels.forEach((d, i) => { if (EVOLUTION_PATHS[id].levels[i]) EVOLUTION_PATHS[id].levels[i].desc = d; });
    });
    // ── 組合效果
    if (pack.combos) COMBOS.forEach(c => { if (pack.combos[c.key]) c.desc = pack.combos[c.key]; });
    // ── 精英怪標籤
    if (pack.elite) ELITE_CONFIG.nights.forEach((n, i) => { if (pack.elite[i]) n.label = pack.elite[i]; });
    // ── Boss
    if (pack.boss) Object.keys(BOSS_CONFIG).forEach(id => {
        const tr = pack.boss[id]; if (!tr) return;
        if (tr.name) BOSS_CONFIG[id].name = tr.name;
        if (tr.label) BOSS_CONFIG[id].label = tr.label;
    });
}

// t(key, params?) — 取得當前語言的 ui 字串，支援 {token} 替換
function t(key, params) {
    const lang = (typeof gameState !== 'undefined' && gameState.language) ? gameState.language : 'zh-TW';
    const pack = _langPack(lang);
    let s = (pack.ui && pack.ui[key] != null) ? pack.ui[key] : (LANG['zh-TW'].ui[key] || key);
    if (params && typeof s === 'string') {
        Object.keys(params).forEach(k => { s = s.split('{' + k + '}').join(params[k]); });
    }
    return s;
}
