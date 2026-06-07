// =============================================================
// 變異器官系統 - initMutationData / saveMutationData
//               addMutationPoints / getMutationUpgradeCost
//               upgradeMutation / applyMutationEffects
//               applyAllMutationBonuses / checkMutationCompensation
//               showMutationPanel
//               initMutationSkills / _saveMutationSkills / _syncMutationSkillPoints
// =============================================================

import { gameState } from './gameState.js';
import { showFloatingText } from './combat.js';
import { t } from '../lang.js';
import {
    STORAGE_KEYS,
    storageGet,
    storageSet,
    storageRemove,
    storageGetJSON,
    storageSetJSON
} from '../storage/index.js';

export const DEFAULT_MUTATION_DATA = {
    levels: { fang: 0, tail: 0, wing: 0, eye: 0 },
    points: 0,                  // 當前可用變異點
    totalPointsEarned: 0,       // 歷史總獲得（用於補償計算）
    compensationVersion: '0',   // 已執行補償的版本號
    skillPointsCompensated: 0,  // 已收到的技能點補償（記錄用）
    hasNewPoints: false,        // 觸發紅點提示
};

// ── 補償版本控制（改為 '1' 觸發第一次補償，以此類推）
export const MUTATION_COMPENSATION_VERSION = '0';

export const MUTATION_COMPENSATION_CONFIG = {
    '1': {
        description: '封測平衡調整補償',
        mutationPointsRate: 0.10,   // 返還 totalPointsEarned 的 10%
        skillPointsRate:    0.10,   // 返還技能點 10%
    },
    // 之後版本在這裡新增
};

// =============================================================
// 初始化與儲存
// =============================================================

export function initMutationData() {
    try {
        const raw = storageGetJSON(STORAGE_KEYS.MUTATION_DATA);
        if (raw) {
            gameState.mutationData = raw;
            // 確保所有欄位都存在（舊存檔相容）
            gameState.mutationData = Object.assign({}, DEFAULT_MUTATION_DATA, gameState.mutationData);
            // 確保 levels 子欄位完整
            gameState.mutationData.levels = Object.assign(
                { fang: 0, tail: 0, wing: 0, eye: 0 },
                gameState.mutationData.levels || {}
            );
        } else {
            gameState.mutationData = Object.assign({}, DEFAULT_MUTATION_DATA, {
                levels: { fang: 0, tail: 0, wing: 0, eye: 0 }
            });
        }
    } catch(e) {
        gameState.mutationData = Object.assign({}, DEFAULT_MUTATION_DATA, {
            levels: { fang: 0, tail: 0, wing: 0, eye: 0 }
        });
    }
    applyMutationEffects();       // 設定初始倍率
    checkMutationCompensation();  // 執行補償（若需要）
    initMutationSkills();         // 載入變異技能樹資料
}

export function saveMutationData() {
    try {
        storageSetJSON(STORAGE_KEYS.MUTATION_DATA, gameState.mutationData);
    } catch(e) {
        console.error('[Mutation] Failed to save mutation data:', e);
    }
}

// =============================================================
// 變異點獲得
// =============================================================

// ESM note: duplicated with systems/combat.js by design; do not merge during Stage 2.
export function addMutationPoints(amount) {
    if (!gameState.mutationData) return;
    gameState.mutationData.points += amount;
    gameState.mutationData.totalPointsEarned += amount;
    gameState.mutationData.hasNewPoints = true;  // 觸發紅點提示
    saveMutationData();
    // 顯示浮動文字
    const p = gameState.player;
    if (p && typeof showFloatingText === 'function') {
        showFloatingText(p.x, p.y - 50, '✦ +' + amount + ' 變異點', '#FFD700');
    }
}

// =============================================================
// 升級費用計算
// =============================================================

export function getMutationUpgradeCost(currentLevel) {
    // 每5級+1費，起始1費
    // Lv0→1: 1點, Lv5→6: 2點, Lv10→11: 3點
    return Math.floor(currentLevel / 5) + 1;
}

// =============================================================
// 升級變異器官
// =============================================================

export function upgradeMutation(organId) {
    const data = gameState.mutationData;
    const p    = gameState.player;
    if (!data || !p) return;

    const currentLv = data.levels[organId] || 0;
    const cost = getMutationUpgradeCost(currentLv);
    if (data.points < cost) return;

    // 記錄舊倍率（用於計算 delta）
    const oldAttackBonus = p.mutationAttackBonus || 1;
    const oldHpBonus     = p.mutationHpBonus     || 1;
    const oldSpeedBonus  = p.mutationSpeedBonus  || 1;

    // 扣點 & 升級
    data.points -= cost;
    data.levels[organId] = currentLv + 1;
    saveMutationData();

    // 刷新倍率
    applyMutationEffects();

    // 即時套用增量（僅套用差值，避免複利）
    if (organId === 'fang' && oldAttackBonus > 0) {
        p.attack = Math.round(p.attack * (p.mutationAttackBonus / oldAttackBonus));
    }
    if (organId === 'tail' && oldHpBonus > 0) {
        const ratio = p.mutationHpBonus / oldHpBonus;
        gameState.stats.hpMax     = Math.round(gameState.stats.hpMax     * ratio);
        gameState.stats.hpCurrent = Math.min(gameState.stats.hpMax,
                                     Math.round(gameState.stats.hpCurrent * ratio));
    }
    if (organId === 'wing' && oldSpeedBonus > 0) {
        p.speed = p.speed * (p.mutationSpeedBonus / oldSpeedBonus);
    }
    // XP 倍率由 addXP() 動態讀取 mutationXpBonus，無需即時調整
    _syncMutationSkillPoints();
    _saveMutationSkills();
}

// =============================================================
// 倍率計算（只寫入 player，不直接改 stats）
// =============================================================

export function applyMutationEffects() {
    const p    = gameState.player;
    const data = gameState.mutationData;
    if (!data || !p) return;
    p.mutationAttackBonus = 1 + (data.levels.fang || 0) * 0.01;  // 每級+1%攻擊
    p.mutationHpBonus     = 1 + (data.levels.tail || 0) * 0.01;  // 每級+1%HP
    p.mutationSpeedBonus  = 1 + (data.levels.wing || 0) * 0.01;  // 每級+1%速度
    p.mutationXpBonus     = 1 + (data.levels.eye  || 0) * 0.01;  // 每級+1%XP倍數
}

// =============================================================
// 遊戲初始化時一次性套用（在所有器官效果之後呼叫一次）
// =============================================================

export function applyAllMutationBonuses() {
    const p    = gameState.player;
    const data = gameState.mutationData;
    if (!data || !p) return;
    applyMutationEffects(); // 確保倍率是最新的
    const ab = p.mutationAttackBonus || 1;
    const hb = p.mutationHpBonus     || 1;
    const sb = p.mutationSpeedBonus  || 1;
    if (ab !== 1) p.attack = Math.round(p.attack * ab);
    if (hb !== 1) {
        gameState.stats.hpMax     = Math.round(gameState.stats.hpMax     * hb);
        gameState.stats.hpCurrent = Math.min(gameState.stats.hpMax,
                                     Math.round(gameState.stats.hpCurrent * hb));
    }
    if (sb !== 1) p.speed = p.speed * sb;
}

// =============================================================
// 補償機制
// =============================================================

export function checkMutationCompensation() {
    const data = gameState.mutationData;
    if (!data) return;
    if (data.compensationVersion === MUTATION_COMPENSATION_VERSION) return;

    const currentVer = parseInt(data.compensationVersion) || 0;
    const targetVer  = parseInt(MUTATION_COMPENSATION_VERSION) || 0;

    for (let v = currentVer + 1; v <= targetVer; v++) {
        const config = MUTATION_COMPENSATION_CONFIG[String(v)];
        if (!config) continue;

        // 返還變異點
        const mutPoints = Math.floor(data.totalPointsEarned * config.mutationPointsRate);
        if (mutPoints > 0) {
            data.points            += mutPoints;
            data.totalPointsEarned += mutPoints;
        }

        // 返還技能點
        const totalSkillPts = gameState.playerSkills
            ? Object.values(gameState.playerSkills).reduce((a, b) => a + b, 0)
            : 0;
        const skillPts = Math.floor(totalSkillPts * config.skillPointsRate);
        if (skillPts > 0) {
            const current = parseInt(storageGet(STORAGE_KEYS.SKILL_POINTS)) || 0;
            storageSet(STORAGE_KEYS.SKILL_POINTS, String(current + skillPts));
            data.skillPointsCompensated = (data.skillPointsCompensated || 0) + skillPts;
        }
    }

    data.compensationVersion = MUTATION_COMPENSATION_VERSION;
    saveMutationData();
    console.log('[Mutation] Compensation applied to version', MUTATION_COMPENSATION_VERSION);
}

// =============================================================
// 升級面板 UI
// =============================================================

export function showMutationPanel() {
    if (document.getElementById('mutation-panel')) return;
    const data = gameState.mutationData;
    if (!data) return;

    gameState.mutationPanelOpen = true;

    // 清除紅點
    data.hasNewPoints = false;
    saveMutationData();
    const redDot = document.getElementById('mutation-red-dot');
    if (redDot) redDot.style.display = 'none';

    // ── 背景遮罩
    const overlay = document.createElement('div');
    overlay.id = 'mutation-panel';
    overlay.style.cssText = [
        'position:absolute', 'top:0', 'left:0', 'width:100%', 'height:100%',
        'background:rgba(0,0,0,0.78)', 'display:flex', 'align-items:center',
        'justify-content:center', 'z-index:120', 'pointer-events:all'
    ].join(';');

    // ── 面板本體
    const panel = document.createElement('div');
    panel.style.cssText = [
        'background:#1a1a2e', 'border:2px solid #FFD700', 'border-radius:12px',
        'padding:22px 26px', 'width:92%', 'max-width:460px',
        'color:white', 'font-family:Arial,sans-serif',
        'max-height:88vh', 'overflow-y:auto', 'box-sizing:border-box'
    ].join(';');

    // 標題
    const title = document.createElement('div');
    title.style.cssText = 'font-size:20px;font-weight:bold;text-align:center;margin-bottom:8px;color:#FFD700;';
    title.textContent = t('mutationPanelTitle');
    panel.appendChild(title);

    // 可用變異點
    const pointsEl = document.createElement('div');
    pointsEl.style.cssText = 'text-align:center;font-size:13px;color:#aaa;margin-bottom:16px;';
    pointsEl.textContent = t('mutationPointsLabel', { n: data.points });
    panel.appendChild(pointsEl);

    // 計算當前實際倍率（確保最新值）
    applyMutationEffects();
    const p = gameState.player;

    // 動態生成四個器官描述
    const fangLv    = data.levels.fang || 0;
    const fangBonus = Math.round(((p.mutationAttackBonus || 1) - 1) * 100);
    const fangDesc  = fangLv === 0
        ? '尚未解鎖，升級後生效（每級 +1% 攻擊力）'
        : `攻擊力 +${fangBonus}%（Lv.${fangLv}，每級 +1%）`;

    const tailLv    = data.levels.tail || 0;
    const tailBonus = Math.round(((p.mutationHpBonus || 1) - 1) * 100);
    const tailDesc  = tailLv === 0
        ? '尚未解鎖，升級後生效（每級 +1% HP上限）'
        : `HP上限 +${tailBonus}%（Lv.${tailLv}，每級 +1%）`;

    const wingLv    = data.levels.wing || 0;
    const wingBonus = Math.round(((p.mutationSpeedBonus || 1) - 1) * 100);
    const wingDesc  = wingLv === 0
        ? '尚未解鎖，升級後生效（每級 +1% 移動速度）'
        : `移動速度 +${wingBonus}%（Lv.${wingLv}，每級 +1%）`;

    const eyeLv    = data.levels.eye || 0;
    const eyeBonus = Math.round(((p.mutationXpBonus || 1) - 1) * 100);
    const eyeDesc  = eyeLv === 0
        ? '尚未解鎖，升級後生效（每級 +1% XP獲得）'
        : `XP獲得 +${eyeBonus}%（Lv.${eyeLv}，每級 +1%）`;

    // ── 四個器官列表
    const MUTATION_ORGANS = [
        { id: 'fang', icon: '🦷', name: '變異-憤怒的獠牙', desc: () => fangDesc },
        { id: 'tail', icon: '🐾', name: '變異-懦弱的尾巴', desc: () => tailDesc },
        { id: 'wing', icon: '🪶', name: '變異-勇敢的翅膀', desc: () => wingDesc },
        { id: 'eye',  icon: '👁️', name: '變異-好奇的眼睛', desc: () => eyeDesc  },
    ];

    MUTATION_ORGANS.forEach(org => {
        const lv       = data.levels[org.id] || 0;
        const cost     = getMutationUpgradeCost(lv);
        const canAfford = data.points >= cost;

        const row = document.createElement('div');
        row.style.cssText = [
            'display:flex', 'align-items:center', 'gap:10px',
            'padding:10px 0', 'border-bottom:1px solid #2a2a4a'
        ].join(';');

        const iconEl = document.createElement('span');
        iconEl.style.cssText = 'font-size:22px;flex-shrink:0;width:30px;text-align:center;';
        iconEl.textContent = org.icon;
        row.appendChild(iconEl);

        const info = document.createElement('div');
        info.style.cssText = 'flex:1;min-width:0;';
        const nameEl = document.createElement('div');
        nameEl.style.cssText = 'font-size:13px;font-weight:bold;color:#FFD700;';
        nameEl.textContent = org.name + '  Lv.' + lv;
        const descEl = document.createElement('div');
        descEl.style.cssText = 'font-size:11px;color:#aaa;margin-top:2px;';
        descEl.textContent = org.desc();
        info.appendChild(nameEl);
        info.appendChild(descEl);
        row.appendChild(info);

        const btn = document.createElement('button');
        btn.style.cssText = [
            'font-size:12px', 'padding:6px 10px', 'border-radius:4px',
            'flex-shrink:0', 'white-space:nowrap',
            canAfford
                ? 'background:rgba(255,215,0,0.15);border:1px solid #FFD700;color:#FFD700;cursor:pointer;'
                : 'background:#1a1a1a;border:1px solid #333;color:#555;cursor:default;'
        ].join(';');
        btn.textContent = t('mutationUpgradeBtn', { n: cost });
        if (canAfford) {
            btn.onclick = () => {
                upgradeMutation(org.id);
                overlay.remove();
                gameState.mutationPanelOpen = false;
                showMutationPanel(); // 重新開啟（刷新顯示）
            };
        }
        row.appendChild(btn);
        panel.appendChild(row);
    });

    // 技能點兌換變異點（十一）
    const exchangeHint = document.createElement('div');
    exchangeHint.style.cssText = 'font-size:12px;color:#aaa;text-align:center;margin-top:12px;';
    exchangeHint.textContent = t('mutationExchangeHint', { n: gameState.skillPoints || 0 });
    panel.appendChild(exchangeHint);

    const exchangeBtn = document.createElement('button');
    exchangeBtn.style.cssText = [
        'display:block', 'width:100%', 'margin-top:6px',
        'font-size:13px', 'padding:7px', 'cursor:pointer',
        'border:1px solid #8a6a2a', 'background:rgba(180,120,20,0.2)',
        'color:#FFD700', 'border-radius:6px'
    ].join(';');
    exchangeBtn.textContent = t('mutationExchange') || '100 技能點 → 10 變異點';
    const canExchange = (gameState.skillPoints || 0) >= 100;
    exchangeBtn.disabled = !canExchange;
    exchangeBtn.style.opacity = canExchange ? '1' : '0.5';
    if (canExchange) {
        exchangeBtn.onclick = () => {
            if ((gameState.skillPoints || 0) < 100) return;
            gameState.skillPoints -= 100;
            gameState.mutationData.points += 10;
            gameState.mutationData.totalPointsEarned = (gameState.mutationData.totalPointsEarned || 0) + 10;
            storageSet(STORAGE_KEYS.SKILL_POINTS, String(gameState.skillPoints));
            saveMutationData();
            overlay.remove();
            gameState.mutationPanelOpen = false;
            showMutationPanel();
        };
    }
    panel.appendChild(exchangeBtn);

    // 關閉按鈕
    const closeBtn = document.createElement('button');
    closeBtn.style.cssText = [
        'display:block', 'width:100%', 'margin-top:10px',
        'font-size:14px', 'padding:8px', 'cursor:pointer',
        'border:1px solid #555', 'background:rgba(255,255,255,0.08)',
        'color:white', 'border-radius:6px'
    ].join(';');
    closeBtn.textContent = '關閉';
    closeBtn.onclick = () => {
        overlay.remove();
        gameState.mutationPanelOpen = false;
    };
    panel.appendChild(closeBtn);

    overlay.appendChild(panel);
    document.getElementById('game-container').appendChild(overlay);
    console.log('[v0.47.0] 十一：變異商店兌換按鈕已加入');
}

// =============================================================
// 變異技能樹 — 資料管理
// =============================================================

export const DEFAULT_MUTATION_SKILLS = {
    version: '1.0',
    skills: {
        recallOrgan: { level: 0, maxLevel: 3 }
    },
    _points: 0
};

export function initMutationSkills() {
    try {
        const saved = storageGetJSON(STORAGE_KEYS.MUTATION_SKILLS);
        if (saved) {
            if (saved.version !== DEFAULT_MUTATION_SKILLS.version) {
                gameState.mutationSkills = JSON.parse(JSON.stringify(DEFAULT_MUTATION_SKILLS));
            } else {
                gameState.mutationSkills = saved;
                gameState.mutationSkills.skills = Object.assign(
                    JSON.parse(JSON.stringify(DEFAULT_MUTATION_SKILLS.skills)),
                    gameState.mutationSkills.skills || {}
                );
                // 還原已存的點數快照，避免重算導致點數異常
                if (typeof saved._points === 'number' && saved._points >= 0) {
                    gameState.mutationSkillPoints = saved._points;
                    gameState.mutationSkills._points = saved._points;
                }
            }
        } else {
            gameState.mutationSkills = JSON.parse(JSON.stringify(DEFAULT_MUTATION_SKILLS));
        }
    } catch(e) {
        gameState.mutationSkills = JSON.parse(JSON.stringify(DEFAULT_MUTATION_SKILLS));
    }
    _syncMutationSkillPoints();
}

export function _saveMutationSkills() {
    try {
        const toSave = Object.assign({}, gameState.mutationSkills, { _points: gameState.mutationSkillPoints });
        storageSetJSON(STORAGE_KEYS.MUTATION_SKILLS, toSave);
    } catch(e) {}
}

// 依當前變異器官總等計算可用技能點（每 50 總等 +1，扣除已花費）
export function _syncMutationSkillPoints() {
    const data = gameState.mutationData;
    if (!data || !data.levels || !gameState.mutationSkills) {
        gameState.mutationSkillPoints = 0;
        return;
    }
    const totalLevel = Object.values(data.levels).reduce((a, b) => a + (b || 0), 0);
    const earned = Math.floor(totalLevel / 50);
    const skills = gameState.mutationSkills.skills || {};
    let spent = 0;
    for (const sk of Object.values(skills)) {
        const lv = sk.level || 0;
        spent += lv * (lv + 1) / 2;  // cost = 1+2+...+lv
    }
    const calculated = earned - spent;
    if (calculated < 0) {
        return;
    }
    const savedPoints = (typeof gameState.mutationSkills._points === 'number' && gameState.mutationSkills._points >= 0)
        ? gameState.mutationSkills._points : 0;
    gameState.mutationSkillPoints = Math.max(calculated, savedPoints);
}
