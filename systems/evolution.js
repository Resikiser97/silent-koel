// =============================================================
// 進化與技能系統 - checkEvolutionUnlock / applyEvolutionLevelEffect
//                 applyEvolutionEffects / loadSavedOrgans / applySkillBonuses
//                 saveLastRunOrgans / showSkillTree
//                 buildSkillTreeOverlay / upgradeSkill
// =============================================================
import { gameState } from './gameState.js';
import { EVOLUTION_PATHS, SKILLS } from '../config/evolution.js';
import { ORGANS, HIDDEN_ORGANS } from '../config/organs.js';
import { GAME_INFO } from '../config/gameConfig.js';
import { t } from '../lang.js';
import { addXP } from './player.js';
import { applyOrganEffects, applyHiddenOrganEffects, showOrganSelection, showHiddenOrganSelection, getOrganSlotsUsed } from './organs.js';
import { showFloatingText } from './combat.js';
import { applyMutationEffects, saveMutationData, getMutationUpgradeCost, upgradeMutation, initMutationSkills, _syncMutationSkillPoints, _saveMutationSkills } from './mutation.js';
import { showTooltip, hideTooltip, buildEndGameOverlay } from './ui.js';
import { pausePlayTimer, resumePlayTimer } from '../main.js';
import { showScoreSubmitPopup } from './leaderboard.js';
import { AudioManager } from './audio.js';
import { saveSettings } from './ui.js';
import { applyDeviceMode } from './mobile.js';
import { startGameWithLoading } from '../main.js';
import { showChat } from './chat.js';
import {
    STORAGE_KEYS,
    storageGet,
    storageSet,
    storageRemove,
    storageGetJSON,
    storageSetJSON
} from '../storage/index.js';

// 模組內部狀態：記錄技能樹是否從首頁開啟
// 僅供 evolution.js 內部使用，不對外暴露
let _skillTreeFromHome = false;
let _skillTreeMode     = null;

export function checkEvolutionUnlock() {
    const ev = gameState.player.evolution;
    const opts = [];
    if (ev.herbivore < EVOLUTION_PATHS.herbivore.maxLevel) {
        opts.push({ type: 'herbivore', nextLevel: ev.herbivore + 1 });
    }
    if (ev.carnivore < EVOLUTION_PATHS.carnivore.maxLevel) {
        opts.push({ type: 'carnivore', nextLevel: ev.carnivore + 1 });
    }
    // 雜食性解鎖條件：草食性>=1 且 肉食性>=1；Lv2~5 無額外條件
    if (ev.herbivore >= 1 && ev.carnivore >= 1 && ev.omnivore < EVOLUTION_PATHS.omnivore.maxLevel) {
        opts.push({ type: 'omnivore', nextLevel: ev.omnivore + 1 });
    }
    return opts;
}

export function applyEvolutionLevelEffect(type, newLevel) {
    const p = gameState.player;
    const lvData = EVOLUTION_PATHS[type].levels[newLevel - 1];
    if (type === 'herbivore') {
        gameState.stats.hpMax += lvData.hpMaxAdd;
        gameState.stats.hpCurrent = Math.min(gameState.stats.hpMax, gameState.stats.hpCurrent + lvData.hpMaxAdd);
        if (lvData.radiusPercent) {
            const add = Math.round(p.radius * lvData.radiusPercent);
            const rangeIncrease = Math.round(add / Math.max(p.radius, 1) * p.attackRange);
            p.radius = Math.max(5, p.radius + add);
            p.attackRange = Math.max(10, p.attackRange + rangeIncrease);
        }
        if (lvData.giantDamageReduction !== undefined) {
            p.giantDamageReduction = lvData.giantDamageReduction;
        }
    } else if (type === 'carnivore') {
        // 固定值覆蓋：先扣掉上一級的值，再加新的值
        const prevLv = newLevel - 1;
        if (prevLv > 0) {
            const prevData = EVOLUTION_PATHS.carnivore.levels[prevLv - 1];
            p.attack -= prevData.attackAdd;
            if (prevData.attackSpeedBonus) {
                p.attackSpeedBonus = (p.attackSpeedBonus || 0) - prevData.attackSpeedBonus;
            }
        }
        p.attack += lvData.attackAdd;
        if (lvData.attackSpeedBonus) {
            p.attackSpeedBonus = (p.attackSpeedBonus || 0) + lvData.attackSpeedBonus;
        }
    } else if (type === 'omnivore') {
        p.speed += lvData.speedBonus;
        // Lv1：給予毒囊
        if (newLevel === 1) {
            _grantPoisonSac(p);
        }
    }
    p.organSlots += 3;
    p.evolution[type] = newLevel;
    if (p.evolution.omnivore > 0) p.evolution.active = 'omnivore';
    else if (p.evolution.carnivore > 0) p.evolution.active = 'carnivore';
    else p.evolution.active = 'herbivore';
}

function _grantPoisonSac(p) {
    if (p.organs.find(o => o.id === 'poisonSac')) return;
    p.organs.push({ id: 'poisonSac', name: ORGANS.poisonSac.name, type: 'special', level: 0, desc: '沒什麼囊用' });
}

export function applyEvolutionEffects() {
    const ev = gameState.player.evolution;
    const p = gameState.player;
    for (let i = 0; i < ev.herbivore; i++) {
        const lv = EVOLUTION_PATHS.herbivore.levels[i];
        gameState.stats.hpMax += lv.hpMaxAdd;
        if (lv.radiusPercent) {
            const add = Math.round(p.radius * lv.radiusPercent);
            const rangeIncrease = Math.round(add / Math.max(p.radius, 1) * p.attackRange);
            p.radius = Math.max(5, p.radius + add);
            p.attackRange = Math.max(10, p.attackRange + rangeIncrease);
        }
        if (lv.giantDamageReduction !== undefined) {
            p.giantDamageReduction = lv.giantDamageReduction;
        }
    }
    // 肉食性為固定值：只套用最高等級的數值（非累加）
    if (ev.carnivore > 0) {
        const lv = EVOLUTION_PATHS.carnivore.levels[ev.carnivore - 1];
        p.attack += lv.attackAdd;
        if (lv.attackSpeedBonus) p.attackSpeedBonus = (p.attackSpeedBonus || 0) + lv.attackSpeedBonus;
    }
    for (let i = 0; i < ev.omnivore; i++) {
        p.speed += EVOLUTION_PATHS.omnivore.levels[i].speedBonus;
    }
    // 若雜食性>=1，確保擁有毒囊
    if (ev.omnivore >= 1) _grantPoisonSac(p);
    gameState.stats.hpCurrent = gameState.stats.hpMax;
    if (ev.omnivore > 0) ev.active = 'omnivore';
    else if (ev.carnivore > 0) ev.active = 'carnivore';
    else ev.active = 'herbivore';
}

function _setFangLevel(targetLv) {
    const p = gameState.player;
    const existing = p.organs.find(o => o.id === 'fang');
    if (existing) {
        const startLv = (existing.level || 1) + 1;
        if (targetLv <= (existing.level || 1)) return;
        for (let lv = startLv; lv <= targetLv; lv++) {
            existing.level = lv;
            applyOrganEffects(existing);
        }
    } else {
        const fangOrgan = { id: 'fang', name: ORGANS.fang.name, type: 'attack', level: 1 };
        p.organs.push(fangOrgan);
        for (let lv = 1; lv <= targetLv; lv++) {
            fangOrgan.level = lv;
            applyOrganEffects(fangOrgan);
        }
    }
}

// 獨立函式：從 localStorage 載入已儲存的器官並套用效果
// 供 initializeGame() 與 buildSkillTreeOverlay(fromHome) 共用
// initializeGame() 在 applySkillBonuses() 之前呼叫，確保器官不因跳過技能樹而丟失
// buildSkillTreeOverlay(fromHome) 路徑只讀取 skillPoints，不再重複呼叫此函式
export function loadSavedOrgans() {
    const p = gameState.player;
    try {
        const organs = storageGetJSON(STORAGE_KEYS.SAVED_ORGANS);
        if (organs) {
            p.organs = p.organs || [];
            organs.forEach(organ => {
                if (p.organs.find(o => o.id === organ.id)) return;
                p.organs.push(Object.assign({}, organ));
                applyOrganEffects(organ);
            });
        }
    } catch(e) {}
    try {
        const hiddenOrgans = storageGetJSON(STORAGE_KEYS.SAVED_HIDDEN_ORGANS);
        if (hiddenOrgans) {
            p.hiddenOrgans = p.hiddenOrgans || [];
            hiddenOrgans.forEach(organ => {
                if (p.hiddenOrgans.find(h => h.id === organ.id)) return;
                p.hiddenOrgans.push(Object.assign({}, organ));
                applyHiddenOrganEffects(organ);
            });
        }
    } catch(e) {}
}

export function applySkillBonuses() {
    const sk = gameState.playerSkills;
    const p = gameState.player;
    const hpBonus = (sk.vitality || 0) * 20;
    gameState.stats.hpMax += hpBonus;
    gameState.stats.hpCurrent = gameState.stats.hpMax;
    p.speed += (sk.agility || 0) * 0.6;
    p.rerollsRemaining = sk.luckyReroll || 0;
    p.pickupRange += (sk.collectionAddiction || 0) * 10;
    p.attack += (sk.terribleFang || 0) * 2;
    // 恐怖之牙 Lv3：開局獠牙Lv1；Lv5：開局獠牙Lv2
    const terribleFangLv = sk.terribleFang || 0;
    if (terribleFangLv >= 5) {
        _setFangLevel(2);
    } else if (terribleFangLv >= 3) {
        _setFangLevel(1);
    }
    // 注意：器官載入已移至獨立函式 loadSavedOrgans()，由 initializeGame() 在此函式之前呼叫
}

export function saveLastRunOrgans() {
    const p = gameState.player;
    const data = {
        organs: (p.organs || []).map(o => ({ id: o.id, name: o.name, type: o.type, level: o.level || 1, desc: o.desc })),
        hiddenOrgans: (p.hiddenOrgans || []).map(h => ({ id: h.id, name: h.name, desc: h.desc }))
    };
    storageSetJSON(STORAGE_KEYS.LAST_RUN_ORGANS, data);
}

export function showSkillTree(cause) {
    if (gameState.gameOver) return;
    saveSettings();
    if (!gameState.mutationSkills) initMutationSkills();
    pausePlayTimer();
    gameState.gameOver = true;
    gameState.skillTreeOpen = true;
    const deathKey = gameState.selectedCharacter === 'archerfish'
        ? 'archerDeath' : 'death';
    AudioManager.play(deathKey);
    AudioManager.stopMusic();
    saveLastRunOrgans();
    const timeBonus = Math.floor((600 - gameState.timeRemaining) / 180);
    const levelBonus = Math.floor(gameState.player.level / 6);
    const eliteBonus = (gameState.sessionSkillPoints && gameState.sessionSkillPoints.elite) || 0;
    gameState.skillPoints += timeBonus + levelBonus;
    storageSetJSON(STORAGE_KEYS.PLAYER_SKILLS, gameState.playerSkills);
    storageSet(STORAGE_KEYS.SKILL_POINTS, String(gameState.skillPoints));
    storageRemove(STORAGE_KEYS.SAVED_ORGANS);
    storageRemove(STORAGE_KEYS.SAVED_HIDDEN_ORGANS);
    const showDeathSettlement = () => {
        const spLines = [];
        if (eliteBonus > 0) spLines.push(t('skillPtElite', { n: eliteBonus }));
        if (timeBonus > 0)  spLines.push(t('skillPtTime',  { n: timeBonus }));
        if (levelBonus > 0) spLines.push(t('skillPtLevel', { n: levelBonus }));
        const overlay = buildEndGameOverlay({
            id: 'death-settlement-overlay',
            overlayStyle: 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.82);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:100;pointer-events:all;color:white;font-family:Arial,sans-serif;',
            titleStyle: 'font-size:52px;margin-bottom:16px;',
            titleText: cause === 'timeout' ? t('timeoutTitle') : t('youDied'),
            content: [
                {
                    style: 'font-size:18px;margin-bottom:10px;color:#FFD700;',
                    text: t('finalXP', { xp: gameState.stats.xpCurrent })
                },
                ...(spLines.length > 0 ? [{
                    style: 'font-size:14px;color:#aaa;margin-bottom:16px;text-align:center;line-height:1.8;',
                    html: spLines.join('<br>')
                }] : [])
            ],
            primaryButton: {
                style: 'font-size:20px;padding:10px 28px;cursor:pointer;pointer-events:all;margin-bottom:12px;border:2px solid #FFD700;background:rgba(255,215,0,0.15);color:white;border-radius:5px;font-weight:bold;',
                text: t('goSkillTree'),
                onClick: () => { overlay.remove(); buildSkillTreeOverlay(cause, false, false, 'postGame'); }
            },
            buttonRowStyle: 'display:flex;gap:12px;flex-wrap:wrap;justify-content:center;flex-direction:column;align-items:center;',
            warningStyle: 'display:none;font-size:13px;color:#f80;text-align:center;',
            buttonInnerStyle: 'display:flex;gap:12px;flex-wrap:wrap;justify-content:center;',
            secondaryButtons: [
                {
                    style: 'font-size:16px;padding:8px 20px;cursor:pointer;border:1px solid #aaa;background:rgba(255,255,255,0.1);color:white;border-radius:5px;',
                    text: t('backHome'),
                    warningText: t('warnNoOrganHome'),
                    onClick: () => { location.reload(); }
                },
                {
                    style: 'font-size:16px;padding:8px 20px;cursor:pointer;border:1px solid #FFD700;background:rgba(255,215,0,0.15);color:white;border-radius:5px;',
                    text: t('playAgain'),
                    onClick: () => { overlay.remove(); buildSkillTreeOverlay(cause, false, false, 'forceStart'); }
                }
            ],
            footerStyle: 'font-size:12px;color:#555;margin-top:20px;',
            footerText: '© ' + GAME_INFO.author + ' | ' + GAME_INFO.version,
            devWarningStyle: 'font-size:12px;color:#f80;margin-top:12px;',
            devWarningText: gameState.devModeUsed ? t('devModeWarning') : null
        });
        document.getElementById('game-container').appendChild(overlay);
    };
    if (gameState.devModeUsed) {
        showDeathSettlement();
    } else {
        showScoreSubmitPopup(false, null, showDeathSettlement);
    }
}

export function buildSkillTreeOverlay(cause, fromHome, startAfter, mode) {
    const state = _resolveSkillTreeState(cause, fromHome, startAfter, mode);
    if (!state) return;
    const shell = _createSkillTreeShell(state.effectiveMode, state.fromHome, state.cause);
    _buildOrganInheritanceSections(state.effectiveMode, shell.overlay);
    _buildSkillTreeMainContent(state.effectiveMode, shell.overlay, shell.titleEl, shell.switchBtn);
    if (state.fromHome || state.startAfter) {
        document.getElementById('game-container').appendChild(shell.overlay);
    } else {
        document.getElementById('ui-overlay').appendChild(shell.overlay);
    }
}

function _resolveSkillTreeState(cause, fromHome, startAfter, mode) {
    // B8 防呆：玩家或技能資料尚未初始化時直接返回
    if (!gameState.player || !gameState.playerSkills) return;
    if (typeof _syncMutationSkillPoints === 'function') _syncMutationSkillPoints();
    const effectiveMode = (mode != null && mode !== '') ? mode
        : (fromHome ? 'fromHome' : (startAfter ? 'forceStart' : _skillTreeMode));
    _skillTreeMode = effectiveMode;
    _skillTreeFromHome = (effectiveMode === 'fromHome');
    if (effectiveMode === 'fromHome' || effectiveMode === 'forceStart') applyDeviceMode();
    if (fromHome || effectiveMode === 'forceStart') {
        try {
            const ss = storageGetJSON(STORAGE_KEYS.PLAYER_SKILLS);
            if (ss) gameState.playerSkills = ss;
            const sp = storageGet(STORAGE_KEYS.SKILL_POINTS);
            if (sp) gameState.skillPoints = Math.max(0, parseInt(sp, 10) || 0);
            const rawMd = storageGetJSON(STORAGE_KEYS.MUTATION_DATA);
            if (rawMd && gameState.mutationData) Object.assign(gameState.mutationData, rawMd);
            initMutationSkills();
        } catch(e) {}
    }
    if (effectiveMode === 'postGame') {
        initMutationSkills();
    }
    return {
        cause,
        effectiveMode,
        fromHome: effectiveMode === 'fromHome',
        startAfter: effectiveMode === 'forceStart',
    };
}

function _createSkillTreeShell(effectiveMode, fromHome, cause) {
    const existing = document.getElementById('skill-tree-overlay');
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.id = 'skill-tree-overlay';
    overlay.dataset.cause = cause == null ? '' : String(cause);
    const zIdx = fromHome ? 210 : 150;
    overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.88);overflow-y:scroll;display:flex;flex-direction:column;align-items:center;padding:20px 0 30px;z-index:' + zIdx + ';pointer-events:all;color:white;font-family:Arial,sans-serif;box-sizing:border-box;';
    overlay.addEventListener('wheel', e => { e.stopPropagation(); }, { passive: true });

    const headerRow = document.createElement('div');
    headerRow.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:14px;flex-shrink:0;width:90%;max-width:660px;position:relative;';
    const titleEl = document.createElement('div');
    titleEl.style.cssText = 'font-size:32px;';
    titleEl.textContent = (effectiveMode === 'fromHome' || effectiveMode === 'postGame' || effectiveMode === 'forceStart')
        ? t('skillTreeTitle')
        : (cause === 'timeout' ? t('timeoutTitle') : t('youDied'));
    headerRow.appendChild(titleEl);
    const switchBtn = document.createElement('button');
    switchBtn.textContent = '⚗️ ' + t('mutationSkillTreeBtn');
    switchBtn.style.cssText = 'padding:4px 12px;border-radius:6px;font-size:12px;cursor:pointer;border:1px solid rgba(180,100,255,0.5);background:rgba(130,60,180,0.25);color:#CC88FF;transition:all 0.15s ease;white-space:nowrap;flex-shrink:0;';
    headerRow.appendChild(switchBtn);
    overlay.appendChild(headerRow);

    const skillContent = document.createElement('div');
    skillContent.style.cssText = 'display:flex;flex-direction:column;align-items:center;width:100%;';
    overlay._skillContent = skillContent;
    return { overlay, titleEl, switchBtn, skillContent };
}

function _buildOrganInheritanceSections(effectiveMode, overlay) {
    const skillContent = overlay._skillContent;
    const organsToKeep = gameState.playerSkills.organMemory || 0;
    // 過濾掉 noInherit: true 的器官（如毒囊），不顯示在繼承選擇列表中
    const playerOrgans = gameState.player.organs.filter(o => {
        const def = ORGANS[o.id];
        return !def || !def.noInherit;
    });
    const hiddenOrgans = gameState.player.hiddenOrgans || [];
    const selectedOrgans = [];

    const organSection = document.createElement('div');
    organSection.style.cssText = 'background:rgba(255,215,0,0.08);border:1px solid #665500;border-radius:8px;padding:12px 16px;margin-bottom:16px;max-width:660px;width:90%;box-sizing:border-box;';
    const organSectionTitle = document.createElement('div');
    organSectionTitle.style.cssText = 'font-size:15px;color:#FFD700;margin-bottom:10px;';
    organSectionTitle.textContent = t('keepOrgans', { n: organsToKeep });
    organSection.appendChild(organSectionTitle);

    if (playerOrgans.length === 0) {
        const noOrgan = document.createElement('div');
        noOrgan.style.cssText = 'color:#888;font-size:13px;';
        noOrgan.textContent = t('noOrganThisRun');
        organSection.appendChild(noOrgan);
    } else {
        const organGrid = document.createElement('div');
        organGrid.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;';
        const typeColor = { attack: '#FF9999', defense: '#88CCFF', spirit: '#CC99FF' };
        const cardMap = [];
        playerOrgans.forEach((organ, idx) => {
            const card = document.createElement('div');
            card.style.cssText = 'background:rgba(255,255,255,0.07);border:1px solid #555;border-radius:6px;padding:8px 10px;cursor:pointer;width:130px;box-sizing:border-box;text-align:center;transition:border-color 0.15s;';
            card.onmouseenter = (e) => showTooltip({ name: organ.name, level: organ.level || 1, maxLevel: ORGANS[organ.id] ? ORGANS[organ.id].maxLevel : null, desc: ORGANS[organ.id] ? ORGANS[organ.id].levels[0].desc : (organ.desc || '') }, e.clientX, e.clientY);
            card.onmouseleave = hideTooltip;
            const nameEl = document.createElement('div');
            nameEl.style.cssText = 'font-size:12px;font-weight:bold;color:' + (typeColor[organ.type] || '#FFD700') + ';margin-bottom:3px;';
            nameEl.textContent = organ.name + ' Lv.' + (organ.level || 1) + (organ.level > 1 ? '（→Lv.1）' : '');
            card.appendChild(nameEl);
            const descEl = document.createElement('div');
            descEl.style.cssText = 'font-size:10px;color:#aaa;line-height:1.3;';
            descEl.textContent = ORGANS[organ.id] ? ORGANS[organ.id].levels[0].desc : organ.desc;
            card.appendChild(descEl);
            card.onclick = () => {
                const sel = selectedOrgans.indexOf(organ);
                if (sel >= 0) {
                    selectedOrgans.splice(sel, 1);
                    card.style.borderColor = '#555';
                    card.style.background = 'rgba(255,255,255,0.07)';
                } else {
                    if (selectedOrgans.length >= organsToKeep) {
                        const removed = selectedOrgans.shift();
                        const ri = playerOrgans.indexOf(removed);
                        if (ri >= 0 && cardMap[ri]) { cardMap[ri].style.borderColor = '#555'; cardMap[ri].style.background = 'rgba(255,255,255,0.07)'; }
                    }
                    selectedOrgans.push(organ);
                    card.style.borderColor = '#FFD700';
                    card.style.background = 'rgba(255,215,0,0.15)';
                }
                storageSetJSON(
                    STORAGE_KEYS.SAVED_ORGANS,
                    selectedOrgans.map(o => ({ id: o.id, name: o.name, type: o.type, level: 1,
                        desc: ORGANS[o.id] ? ORGANS[o.id].levels[0].desc : o.desc }))
                );
            };
            cardMap.push(card);
            organGrid.appendChild(card);
        });
        organSection.appendChild(organGrid);
    }
    if (effectiveMode === 'postGame' && (playerOrgans.length > 0 || hiddenOrgans.length > 0)) skillContent.appendChild(organSection);

    if (effectiveMode === 'postGame' && hiddenOrgans.length > 0) {
        const hiddenOrganLimit = 1 + ((gameState.mutationSkills && gameState.mutationSkills.skills && gameState.mutationSkills.skills.recallOrgan && gameState.mutationSkills.skills.recallOrgan.level) || 0);
        const hiddenSection = document.createElement('div');
        hiddenSection.style.cssText = 'background:rgba(255,215,0,0.06);border:1px solid #887700;border-radius:8px;padding:12px 16px;margin-bottom:16px;max-width:660px;width:90%;box-sizing:border-box;';
        const hiddenTitle = document.createElement('div');
        hiddenTitle.style.cssText = 'font-size:14px;color:#FFD700;margin-bottom:8px;';
        hiddenTitle.textContent = hiddenOrganLimit > 1
            ? '✨ 選擇保留最多 ' + hiddenOrganLimit + ' 個隱藏器官（可不選）'
            : t('keepHiddenOne');
        hiddenSection.appendChild(hiddenTitle);
        const hiddenGrid = document.createElement('div');
        hiddenGrid.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;';
        const selectedHiddenOrgans = [];
        const hiddenCardMap = [];
        hiddenOrgans.forEach((organ) => {
            const card = document.createElement('div');
            card.style.cssText = 'background:rgba(255,215,0,0.08);border:2px solid #887700;border-radius:6px;padding:8px 10px;width:150px;box-sizing:border-box;text-align:center;cursor:pointer;transition:border-color 0.15s,background 0.15s;';
            card.onmouseenter = (e) => showTooltip({ name: organ.name, desc: (HIDDEN_ORGANS[organ.id] || {}).desc || organ.desc || '', isHidden: true }, e.clientX, e.clientY);
            card.onmouseleave = hideTooltip;
            const nameEl = document.createElement('div');
            nameEl.style.cssText = 'font-size:12px;font-weight:bold;color:#FFD700;margin-bottom:3px;';
            nameEl.textContent = '✨ ' + organ.name;
            card.appendChild(nameEl);
            const descEl = document.createElement('div');
            descEl.style.cssText = 'font-size:10px;color:#ccc;line-height:1.3;';
            descEl.textContent = (HIDDEN_ORGANS[organ.id] || {}).desc || organ.desc || '';
            card.appendChild(descEl);
            card.onclick = () => {
                const idx = selectedHiddenOrgans.findIndex(o => o.id === organ.id);
                if (idx >= 0) {
                    selectedHiddenOrgans.splice(idx, 1);
                    card.style.borderColor = '#887700';
                    card.style.background = 'rgba(255,215,0,0.08)';
                } else {
                    if (selectedHiddenOrgans.length >= hiddenOrganLimit) {
                        const removed = selectedHiddenOrgans.shift();
                        const ri = hiddenOrgans.findIndex(o => o.id === removed.id);
                        if (ri >= 0 && hiddenCardMap[ri]) {
                            hiddenCardMap[ri].style.borderColor = '#887700';
                            hiddenCardMap[ri].style.background = 'rgba(255,215,0,0.08)';
                        }
                    }
                    selectedHiddenOrgans.push(organ);
                    card.style.borderColor = '#FFD700';
                    card.style.background = 'rgba(255,215,0,0.22)';
                }
                if (selectedHiddenOrgans.length > 0) {
                    storageSetJSON(
                        STORAGE_KEYS.SAVED_HIDDEN_ORGANS,
                        selectedHiddenOrgans.map(o => ({ id: o.id, name: o.name, type: o.type, desc: o.desc }))
                    );
                } else {
                    storageRemove(STORAGE_KEYS.SAVED_HIDDEN_ORGANS);
                }
            };
            hiddenCardMap.push(card);
            hiddenGrid.appendChild(card);
        });
        hiddenSection.appendChild(hiddenGrid);
        skillContent.appendChild(hiddenSection);
    }
}

function _buildSkillTreeMainContent(effectiveMode, overlay, titleEl, switchBtn) {
    const skillContent = overlay._skillContent;
    const ptsRow = document.createElement('div');
    ptsRow.style.cssText = 'display:flex;align-items:center;gap:12px;margin-bottom:14px;';
    const pts = document.createElement('div');
    pts.style.cssText = 'font-size:20px;color:#FFD700;';
    pts.textContent = t('skillPoints') + ': ' + gameState.skillPoints;
    ptsRow.appendChild(pts);
    const resetBtn = document.createElement('button');
    resetBtn.style.cssText = 'font-size:13px;padding:5px 14px;cursor:pointer;border:1px solid #AA4444;background:rgba(170,0,0,0.25);color:white;border-radius:4px;';
    resetBtn.textContent = t('resetSkills');
    resetBtn.onclick = () => {
        if (!confirm(t('confirmResetSkills'))) return;
        let spent = 0;
        for (const id in gameState.playerSkills) spent += gameState.playerSkills[id] || 0;
        for (const id in gameState.playerSkills) gameState.playerSkills[id] = 0;
        gameState.skillPoints += spent;
        storageSetJSON(STORAGE_KEYS.PLAYER_SKILLS, gameState.playerSkills);
        storageSet(STORAGE_KEYS.SKILL_POINTS, String(gameState.skillPoints));
        buildSkillTreeOverlay(null, _skillTreeFromHome, false, _skillTreeMode);
    };
    ptsRow.appendChild(resetBtn);
    skillContent.appendChild(ptsRow);

    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:22px;max-width:660px;width:90%;';
    Object.values(SKILLS).forEach(skill => {
        const level = gameState.playerSkills[skill.id] || 0;
        const card = document.createElement('div');
        card.style.cssText = 'background:rgba(255,255,255,0.1);border:1px solid #555;border-radius:6px;padding:10px;text-align:center;';
        card.onmouseenter = (e) => showTooltip({ name: skill.name, level: level, maxLevel: skill.maxLevel, desc: skill.desc }, e.clientX, e.clientY);
        card.onmouseleave = hideTooltip;
        const nameEl = document.createElement('div');
        nameEl.style.cssText = 'font-size:14px;font-weight:bold;margin-bottom:4px;';
        nameEl.textContent = skill.name + '  Lv.' + level + '/' + skill.maxLevel;
        card.appendChild(nameEl);
        const descEl = document.createElement('div');
        descEl.style.cssText = 'font-size:11px;color:#ccc;margin-bottom:8px;min-height:32px;';
        descEl.textContent = skill.desc;
        card.appendChild(descEl);
        const btn = document.createElement('button');
        const maxed = level >= skill.maxLevel;
        const cost = level + 1;
        const canUp = !maxed && gameState.skillPoints >= cost;
        btn.style.cssText = 'padding:5px 0;font-size:12px;width:100%;border-radius:3px;background:transparent;cursor:' + (canUp ? 'pointer' : 'default') + ';border:1px solid ' + (maxed || !canUp ? '#555' : '#FFD700') + ';color:' + (maxed || !canUp ? '#555' : 'white') + ';';
        btn.textContent = maxed ? t('maxed') : t('upgradeCostN', { n: cost });
        btn.disabled = !canUp;
        btn.onclick = () => upgradeSkill(skill.id);
        card.appendChild(btn);
        grid.appendChild(card);
    });
    skillContent.appendChild(grid);

    const _lrData = storageGetJSON(STORAGE_KEYS.LAST_RUN_ORGANS);

    if (effectiveMode === 'fromHome' || effectiveMode === 'forceStart') {
        const inheritSec = document.createElement('div');
        inheritSec.style.cssText = 'background:rgba(255,215,0,0.06);border:1px solid #665500;border-radius:8px;padding:12px 16px;margin-bottom:16px;max-width:660px;width:90%;box-sizing:border-box;';
        const homeOrgansToKeep = gameState.playerSkills.organMemory || 0;
        const inheritTitle = document.createElement('div');
        inheritTitle.style.cssText = 'font-size:15px;color:#FFD700;margin-bottom:10px;';
        inheritTitle.textContent = t('inheritOrgansHome', { n: homeOrgansToKeep });
        inheritSec.appendChild(inheritTitle);
        const _lrOrgans = _lrData ? (_lrData.organs || []) : [];
        const _lrHidden = _lrData ? (_lrData.hiddenOrgans || []) : [];
        if (_lrOrgans.length === 0 && _lrHidden.length === 0) {
            const noneEl = document.createElement('div');
            noneEl.style.cssText = 'font-size:13px;color:#555;';
            noneEl.textContent = t('noRecord');
            inheritSec.appendChild(noneEl);
        } else {
            if (_lrOrgans.length > 0) {
                const homeSelOrgans = [];
                const homeOrganGrid = document.createElement('div');
                homeOrganGrid.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px;';
                const tColor = { attack: '#FF9999', defense: '#88CCFF', spirit: '#CC99FF' };
                const homeCardMap = [];
                _lrOrgans.forEach((organ) => {
                    const card = document.createElement('div');
                    card.style.cssText = 'background:rgba(255,255,255,0.07);border:1px solid #555;border-radius:6px;padding:8px 10px;cursor:pointer;width:130px;box-sizing:border-box;text-align:center;';
                    card.onmouseenter = (e) => showTooltip({ name: organ.name, level: organ.level || 1, maxLevel: ORGANS[organ.id] ? ORGANS[organ.id].maxLevel : null, desc: ORGANS[organ.id] ? ORGANS[organ.id].levels[0].desc : (organ.desc || '') }, e.clientX, e.clientY);
                    card.onmouseleave = hideTooltip;
                    const nEl = document.createElement('div');
                    nEl.style.cssText = 'font-size:12px;font-weight:bold;color:' + (tColor[organ.type] || '#FFD700') + ';margin-bottom:3px;';
                    nEl.textContent = organ.name + ' Lv.' + (organ.level || 1);
                    card.appendChild(nEl);
                    const dEl = document.createElement('div');
                    dEl.style.cssText = 'font-size:10px;color:#aaa;line-height:1.3;';
                    dEl.textContent = organ.desc || '';
                    card.appendChild(dEl);
                    card.onclick = () => {
                        const si = homeSelOrgans.indexOf(organ);
                        if (si >= 0) {
                            homeSelOrgans.splice(si, 1);
                            card.style.borderColor = '#555';
                            card.style.background = 'rgba(255,255,255,0.07)';
                        } else {
                            if (homeSelOrgans.length >= homeOrgansToKeep) {
                                const rm = homeSelOrgans.shift();
                                const ri = _lrOrgans.indexOf(rm);
                                if (ri >= 0 && homeCardMap[ri]) { homeCardMap[ri].style.borderColor = '#555'; homeCardMap[ri].style.background = 'rgba(255,255,255,0.07)'; }
                            }
                            homeSelOrgans.push(organ);
                            card.style.borderColor = '#FFD700';
                            card.style.background = 'rgba(255,215,0,0.15)';
                        }
                        if (homeSelOrgans.length > 0) {
                            storageSetJSON(STORAGE_KEYS.SAVED_ORGANS, homeSelOrgans.map(o => ({ id: o.id, name: o.name, type: o.type, level: 1, desc: ORGANS[o.id] ? ORGANS[o.id].levels[0].desc : o.desc })));
                        } else {
                            storageRemove(STORAGE_KEYS.SAVED_ORGANS);
                        }
                    };
                    homeCardMap.push(card);
                    homeOrganGrid.appendChild(card);
                });
                inheritSec.appendChild(homeOrganGrid);
            }
            if (_lrHidden.length > 0) {
                const hTitle = document.createElement('div');
                hTitle.style.cssText = 'font-size:14px;color:#FFD700;margin-bottom:8px;margin-top:6px;';
                // 讀取回憶器官等級決定繼承上限（與 postGame 路徑一致）
                const homeHiddenLimit = 1 + ((gameState.mutationSkills &&
                    gameState.mutationSkills.skills &&
                    gameState.mutationSkills.skills.recallOrgan &&
                    gameState.mutationSkills.skills.recallOrgan.level) || 0);
                hTitle.textContent = homeHiddenLimit > 1
                    ? '✨ 選擇繼承最多 ' + homeHiddenLimit + ' 個隱藏器官（可不選）'
                    : t('inheritHiddenHome');
                inheritSec.appendChild(hTitle);
                const homeHidGrid = document.createElement('div');
                homeHidGrid.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;';
                const homeSelHiddenArr = [];
                const homeHidCardMap = [];
                _lrHidden.forEach((organ) => {
                    const card = document.createElement('div');
                    card.style.cssText = 'background:rgba(255,215,0,0.08);border:2px solid #887700;border-radius:6px;padding:8px 10px;width:150px;box-sizing:border-box;text-align:center;cursor:pointer;';
                    card.onmouseenter = (e) => showTooltip({ name: organ.name, desc: organ.desc || '', isHidden: true }, e.clientX, e.clientY);
                    card.onmouseleave = hideTooltip;
                    const nEl = document.createElement('div');
                    nEl.style.cssText = 'font-size:12px;font-weight:bold;color:#FFD700;margin-bottom:3px;';
                    nEl.textContent = '✨ ' + organ.name;
                    card.appendChild(nEl);
                    const dEl = document.createElement('div');
                    dEl.style.cssText = 'font-size:10px;color:#ccc;line-height:1.3;';
                    dEl.textContent = organ.desc || '';
                    card.appendChild(dEl);
                    card.onclick = () => {
                        const idx = homeSelHiddenArr.findIndex(o => o.id === organ.id);
                        if (idx >= 0) {
                            // 已選 → 取消選擇
                            homeSelHiddenArr.splice(idx, 1);
                            card.style.borderColor = '#887700';
                            card.style.background = 'rgba(255,215,0,0.08)';
                        } else {
                            // 未選 → 加入，超過上限時踢掉最舊的
                            if (homeSelHiddenArr.length >= homeHiddenLimit) {
                                const removed = homeSelHiddenArr.shift();
                                const ri = _lrHidden.findIndex(o => o.id === removed.id);
                                if (ri >= 0 && homeHidCardMap[ri]) {
                                    homeHidCardMap[ri].style.borderColor = '#887700';
                                    homeHidCardMap[ri].style.background = 'rgba(255,215,0,0.08)';
                                }
                            }
                            homeSelHiddenArr.push(organ);
                            card.style.borderColor = '#FFD700';
                            card.style.background = 'rgba(255,215,0,0.22)';
                        }
                        if (homeSelHiddenArr.length > 0) {
                            storageSetJSON(
                                STORAGE_KEYS.SAVED_HIDDEN_ORGANS,
                                homeSelHiddenArr.map(o => ({ id: o.id, name: o.name, type: o.type, desc: o.desc }))
                            );
                        } else {
                            storageRemove(STORAGE_KEYS.SAVED_HIDDEN_ORGANS);
                        }
                    };
                    homeHidCardMap.push(card);
                    homeHidGrid.appendChild(card);
                });
                inheritSec.appendChild(homeHidGrid);
            }
        }
        skillContent.appendChild(inheritSec);
    } else {
        const lastRunSec = document.createElement('div');
        lastRunSec.style.cssText = 'max-width:660px;width:90%;margin-bottom:18px;border:1px solid #333;border-radius:6px;padding:12px 16px;';
        const lastRunTitle = document.createElement('div');
        lastRunTitle.style.cssText = 'font-size:14px;color:#888;font-weight:bold;margin-bottom:8px;';
        lastRunTitle.textContent = t('lastRunOrgansTitle');
        lastRunSec.appendChild(lastRunTitle);
        const lrItems = _lrData ? [...(_lrData.organs || []), ...(_lrData.hiddenOrgans || [])] : [];
        if (lrItems.length === 0) {
            const noneEl = document.createElement('div');
            noneEl.style.cssText = 'font-size:13px;color:#555;';
            noneEl.textContent = t('noRecord');
            lastRunSec.appendChild(noneEl);
        } else {
            lrItems.forEach(o => {
                const item = document.createElement('div');
                item.style.cssText = 'font-size:13px;color:#999;margin-bottom:4px;';
                item.textContent = (o.level ? 'Lv.' + o.level + ' ' : '✨ ') + o.name + (o.desc ? '　' + o.desc : '');
                lastRunSec.appendChild(item);
            });
        }
        skillContent.appendChild(lastRunSec);
    }

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap;justify-content:center;';
    if (effectiveMode === 'forceStart') {
        const goBtn = document.createElement('button');
        goBtn.style.cssText = 'font-size:16px;padding:10px 28px;cursor:pointer;border:2px solid #FFD700;background:#2a5a2a;color:white;font-weight:bold;border-radius:5px;';
        goBtn.textContent = t('btnStartGame');
        goBtn.onclick = () => { AudioManager.unlock().catch(() => {}); hideTooltip(); overlay.remove(); startGameWithLoading(); };
        btnRow.appendChild(goBtn);
    } else if (effectiveMode === 'fromHome') {
        const closeBtn = document.createElement('button');
        closeBtn.style.cssText = 'font-size:16px;padding:10px 24px;cursor:pointer;border:1px solid #aaa;background:rgba(255,255,255,0.1);color:white;border-radius:5px;';
        closeBtn.textContent = t('close');
        closeBtn.onclick = () => {
            hideTooltip(); overlay.remove();
            if (document.getElementById('start-screen') && typeof showChat === 'function') showChat();
        };
        btnRow.appendChild(closeBtn);
    } else {
        // mode === 'postGame'：從技能樹進入，直接執行，不再有警告
        const homeBtn = document.createElement('button');
        homeBtn.style.cssText = 'font-size:16px;padding:10px 24px;cursor:pointer;border:1px solid #aaa;background:rgba(255,255,255,0.1);color:white;border-radius:5px;';
        homeBtn.textContent = t('backHome');
        homeBtn.onclick = () => { hideTooltip(); overlay.remove(); location.reload(); };
        btnRow.appendChild(homeBtn);

        const playAgainBtn = document.createElement('button');
        playAgainBtn.style.cssText = 'font-size:16px;padding:10px 24px;cursor:pointer;border:1px solid #FFD700;background:rgba(255,215,0,0.15);color:white;border-radius:5px;';
        playAgainBtn.textContent = t('playAgain');
        playAgainBtn.onclick = () => {
            hideTooltip();
            overlay.remove();
            sessionStorage.setItem('autostart', '1');
            location.reload();
        };
        btnRow.appendChild(playAgainBtn);
    }
    skillContent.appendChild(btnRow);

    // ── 組合 overlay = header + skillContent / mutContent（切換）
    overlay.appendChild(skillContent);
    const mutContent = _buildMutationSkillContent(); // 內部已設 display:none
    overlay.appendChild(mutContent);

    // 變異面板專屬關閉按鈕列（與 mutContent 同步顯示/隱藏）
    const mutCloseRow = document.createElement('div');
    mutCloseRow.id = 'mut-close-row';
    mutCloseRow.style.cssText = 'display:none;width:90%;max-width:660px;padding:8px 0 12px 0;justify-content:center;';
    const mutCloseBtn = document.createElement('button');
    mutCloseBtn.textContent = '關閉';
    mutCloseBtn.style.cssText = [
        'font-size:14px', 'padding:8px 40px', 'border-radius:6px',
        'cursor:pointer', 'border:1px solid #555',
        'background:rgba(255,255,255,0.08)', 'color:white',
        'transition:background 0.15s ease',
    ].join(';');
    mutCloseBtn.onmouseenter = () => { mutCloseBtn.style.background = 'rgba(255,255,255,0.16)'; };
    mutCloseBtn.onmouseleave = () => { mutCloseBtn.style.background = 'rgba(255,255,255,0.08)'; };
    mutCloseBtn.onclick = () => {
        if (_skillTreeMode === 'postGame' || _skillTreeMode === 'forceStart') {
            // forceStart 也切回主技能樹，讓玩家從「開始遊戲」按鈕正常進入
            _showingMut = false;
            mutContent.style.display = 'none';
            skillContent.style.display = 'flex';
            titleEl.textContent = t('skillTreeTitle');
            if (switchBtn) switchBtn.textContent = '⚗️ ' + t('mutationSkillTreeBtn');
            mutCloseRow.style.display = 'none';
        } else {
            // fromHome：關閉整個 overlay
            const ov = document.getElementById('skill-tree-overlay');
            if (ov) ov.remove();
            gameState.skillTreeOpen = false;
            if (document.getElementById('start-screen') && typeof showChat === 'function') showChat();
        }
    };
    mutCloseRow.appendChild(mutCloseBtn);
    overlay.appendChild(mutCloseRow);

    let _showingMut = false;
    switchBtn.onclick = () => {
        _showingMut = !_showingMut;
        if (_showingMut) {
            skillContent.style.display = 'none';
            mutContent.style.display = 'flex';
            mutCloseRow.style.display = 'flex';
            _syncMutationSkillPoints();
            _refreshMutContentLeft(mutContent);
            _refreshMutContentRight(mutContent);
            titleEl.textContent = '⚗️ ' + t('mutationSkillTree');
            switchBtn.textContent = t('skillTreeTitle');
        } else {
            skillContent.style.display = 'flex';
            mutContent.style.display = 'none';
            mutCloseRow.style.display = 'none';
            titleEl.textContent = t('skillTreeTitle');
            switchBtn.textContent = '⚗️ ' + t('mutationSkillTreeBtn');
        }
    };

}

export function upgradeSkill(id) {
    const skill = SKILLS[id];
    if (!skill) return;
    const current = gameState.playerSkills[id] || 0;
    if (current >= skill.maxLevel) return;
    const cost = current + 1;
    if (gameState.skillPoints < cost) return;
    gameState.playerSkills[id] = current + 1;
    gameState.skillPoints -= cost;
    storageSetJSON(STORAGE_KEYS.PLAYER_SKILLS, gameState.playerSkills);
    storageSet(STORAGE_KEYS.SKILL_POINTS, String(gameState.skillPoints));
    buildSkillTreeOverlay(null, _skillTreeFromHome, false, _skillTreeMode);
}

// ── 左欄內容建立（可重複呼叫刷新）
function _buildMutLeftColContent(leftCol) {
    leftCol.innerHTML = '';
    const mutData = gameState.mutationData;
    const mutPts  = mutData ? (mutData.points || 0) : 0;

    const ptsHeader = document.createElement('div');
    ptsHeader.style.cssText = 'font-size:13px;color:#FFD700;text-align:center;margin-bottom:10px;font-weight:bold;';
    ptsHeader.textContent = '可用變異點：' + mutPts;
    leftCol.appendChild(ptsHeader);

    const ORGAN_DEFS = [
        { id: 'fang', icon: '🦷', name: '變異-憤怒的獠牙', desc: '每級 +1% 攻擊力' },
        { id: 'tail', icon: '🐾', name: '變異-懦弱的尾巴', desc: '每級 +1% HP上限'  },
        { id: 'wing', icon: '🪶', name: '變異-勇敢的翅膀', desc: '每級 +1% 移動速度' },
        { id: 'eye',  icon: '👁️', name: '變異-好奇的眼睛', desc: '每級 +1% XP獲得'  },
    ];
    ORGAN_DEFS.forEach(def => {
        const lv    = mutData ? (mutData.levels[def.id] || 0) : 0;
        const cost  = getMutationUpgradeCost ? getMutationUpgradeCost(lv) : (lv + 1);
        const canUp = mutPts >= cost;
        const card  = document.createElement('div');
        card.style.cssText = 'background:rgba(255,215,0,0.07);border:1px solid rgba(255,215,0,0.25);border-radius:8px;padding:10px 12px;margin-bottom:10px;';
        const ct = document.createElement('div');
        ct.style.cssText = 'font-size:13px;font-weight:bold;color:#FFD700;margin-bottom:3px;';
        ct.textContent = def.icon + ' ' + def.name + '  Lv.' + lv;
        card.appendChild(ct);
        const cd = document.createElement('div');
        cd.style.cssText = 'font-size:11px;color:#aaa;margin-bottom:6px;';
        cd.textContent = def.desc;
        card.appendChild(cd);
        const cb = document.createElement('button');
        cb.style.cssText = 'padding:3px 12px;font-size:11px;border-radius:4px;border:1px solid ' + (canUp ? '#FFD700' : '#555') + ';background:' + (canUp ? 'rgba(255,215,0,0.15)' : 'transparent') + ';color:' + (canUp ? '#FFD700' : '#555') + ';cursor:' + (canUp ? 'pointer' : 'default') + ';';
        cb.textContent = '升級（費 ' + cost + ' 點）';
        cb.disabled = !canUp;
        cb.onclick = () => {
            if (typeof upgradeMutation === 'function') upgradeMutation(def.id);
            _refreshMutContentLeft(document.getElementById('mut-skill-panel'));
            _refreshMutContentRight(document.getElementById('mut-skill-panel'));
        };
        card.appendChild(cb);
        leftCol.appendChild(card);
    });

    const curSkillPts = gameState.skillPoints || 0;
    const exchangeHint = document.createElement('div');
    exchangeHint.style.cssText = 'font-size:12px;color:#aaa;text-align:center;margin-top:12px;';
    exchangeHint.textContent = '目前技能點：' + curSkillPts;
    leftCol.appendChild(exchangeHint);

    const canExchange = curSkillPts >= 100;
    const exchangeBtn = document.createElement('button');
    exchangeBtn.style.cssText = [
        'display:block', 'width:100%', 'margin-top:6px',
        'font-size:13px', 'padding:7px', 'border-radius:6px',
        'border:1px solid #8a6a2a', 'background:rgba(180,120,20,0.2)',
        'color:#FFD700', 'cursor:' + (canExchange ? 'pointer' : 'default'),
        'opacity:' + (canExchange ? '1' : '0.5'),
    ].join(';');
    exchangeBtn.disabled = !canExchange;
    exchangeBtn.textContent = '100 技能點 → 10 變異點';
    if (canExchange) {
        exchangeBtn.onclick = () => {
            if ((gameState.skillPoints || 0) < 100) return;
            gameState.skillPoints -= 100;
            gameState.mutationData.points += 10;
            gameState.mutationData.totalPointsEarned = (gameState.mutationData.totalPointsEarned || 0) + 10;
            storageSet(STORAGE_KEYS.SKILL_POINTS, String(gameState.skillPoints));
            saveMutationData();
            _refreshMutContentLeft(document.getElementById('mut-skill-panel'));
            _refreshMutContentRight(document.getElementById('mut-skill-panel'));
        };
    }
    leftCol.appendChild(exchangeBtn);
}

function _refreshMutContentLeft(wrap) {
    if (!wrap) return;
    const leftCol = wrap.querySelector('#mut-left-col');
    if (!leftCol) return;
    _buildMutLeftColContent(leftCol);
}

// ── 建立變異面板（左欄：4 變異器官 / 右欄：技能點 + 技能卡）
function _buildMutationSkillContent() {
    const wrap = document.createElement('div');
    wrap.id = 'mut-skill-panel';
    wrap.style.cssText = 'display:none;width:90%;max-width:660px;flex:1;min-height:0;overflow:hidden;';

    // 左欄
    const leftCol = document.createElement('div');
    leftCol.id = 'mut-left-col';
    leftCol.style.cssText = 'flex:1;overflow-y:auto;padding:12px;';
    _buildMutLeftColContent(leftCol);

    const divider = document.createElement('div');
    divider.style.cssText = 'width:1px;background:rgba(180,100,255,0.2);align-self:stretch;margin:0 8px;';

    // 右欄
    const rightCol = document.createElement('div');
    rightCol.id = 'mut-right-col';
    rightCol.style.cssText = 'flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;align-items:center;';
    _buildMutRightCol(rightCol);

    if (gameState.isMobile) {
        wrap.style.flexDirection = 'column';
        leftCol.style.cssText  = 'flex:none;width:100%;overflow-y:auto;padding:12px;border-bottom:1px solid rgba(180,100,255,0.2);';
        divider.style.display  = 'none';
        rightCol.style.cssText = 'flex:none;width:100%;overflow-y:auto;padding:12px;display:flex;flex-direction:column;align-items:center;';
    }

    wrap.appendChild(leftCol);
    wrap.appendChild(divider);
    wrap.appendChild(rightCol);
    return wrap;
}

function _buildMutRightCol(rightCol) {
    rightCol.innerHTML = '';
    const skills = (gameState.mutationSkills && gameState.mutationSkills.skills) || {};
    const pts    = gameState.mutationSkillPoints ?? 0;

    const ptsLabel = document.createElement('div');
    ptsLabel.style.cssText = 'font-size:13px;color:#CC88FF;text-align:center;margin-bottom:12px;font-weight:bold;';
    ptsLabel.textContent = t('mutationSkillPointsLabel', { n: pts });
    rightCol.appendChild(ptsLabel);

    const sk    = skills.recallOrgan || { level: 0, maxLevel: 3 };
    const currentLevel = gameState.mutationSkills?.skills?.recallOrgan?.level ?? 0;
    const lv    = currentLevel;
    const maxLv = sk.maxLevel || 3;
    const cost  = currentLevel + 1;
    const maxed = lv >= maxLv;
    const canUp = !maxed && pts >= cost;

    const card = document.createElement('div');
    card.style.cssText = 'background:rgba(130,60,180,0.12);border:1px solid rgba(180,100,255,0.3);border-radius:8px;padding:14px 18px;width:100%;box-sizing:border-box;';
    const cTitle = document.createElement('div');
    cTitle.style.cssText = 'font-size:14px;font-weight:bold;color:#CC88FF;margin-bottom:4px;';
    cTitle.textContent = t('recallOrganSkillName') + '  Lv.' + lv + '/' + maxLv;
    card.appendChild(cTitle);
    const cDesc = document.createElement('div');
    cDesc.style.cssText = 'font-size:11px;color:#aaa;margin-bottom:4px;';
    cDesc.textContent = t('recallOrganSkillDesc');
    card.appendChild(cDesc);
    const cExtra = document.createElement('div');
    cExtra.style.cssText = 'font-size:11px;color:#CC88FF;margin-bottom:10px;';
    cExtra.textContent = '當前保留上限：' + (1 + lv) + ' 個';
    card.appendChild(cExtra);
    const btn = document.createElement('button');
    btn.style.cssText = 'padding:5px 16px;font-size:12px;border-radius:4px;border:1px solid ' + (maxed ? '#555' : (canUp ? 'rgba(180,100,255,0.6)' : '#555')) + ';background:' + (canUp ? 'rgba(130,60,180,0.35)' : 'transparent') + ';color:' + (maxed || !canUp ? '#555' : '#CC88FF') + ';cursor:' + (canUp ? 'pointer' : 'default') + ';';
    btn.textContent = maxed ? t('mutationSkillMaxed') : t('mutationSkillUpgrade', { n: cost });
    btn.disabled    = !canUp;
    const _doUpgradeRecallOrgan = () => {
        _upgradeMutationSkill('recallOrgan');
        const panel = document.getElementById('mut-skill-panel');
        if (panel) { _refreshMutContentLeft(panel); _refreshMutContentRight(panel); }
    };
    btn.onclick = _doUpgradeRecallOrgan;
    btn.addEventListener('touchstart', (e) => { e.preventDefault(); _doUpgradeRecallOrgan(); }, { passive: false });
    card.appendChild(btn);
    rightCol.appendChild(card);
}

function _refreshMutContentRight(mutContent) {
    const rc = mutContent.querySelector('#mut-right-col');
    if (rc) _buildMutRightCol(rc);
}

function _upgradeMutationSkill(skillId) {
    if (!gameState.mutationSkills || !gameState.mutationSkills.skills) return;
    const skill = gameState.mutationSkills.skills[skillId];
    if (!skill || skill.level >= skill.maxLevel) return;
    const cost = skill.level + 1;
    if (gameState.mutationSkillPoints < cost) return;
    gameState.mutationSkillPoints -= cost;
    skill.level++;
    _saveMutationSkills();
}

