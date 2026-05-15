// =============================================================
// 進化與技能系統 - checkEvolutionUnlock / applyEvolutionLevelEffect
//                 applyEvolutionEffects / applySkillBonuses
//                 saveLastRunOrgans / showSkillTree
//                 buildSkillTreeOverlay / upgradeSkill
// =============================================================

function checkEvolutionUnlock() {
    const ev = gameState.player.evolution;
    const opts = [];
    if (ev.herbivore < 3) opts.push({ type: 'herbivore', nextLevel: ev.herbivore + 1 });
    if (ev.herbivore >= 1 && ev.carnivore < 3) opts.push({ type: 'carnivore', nextLevel: ev.carnivore + 1 });
    const omnNext = ev.omnivore + 1;
    if (omnNext <= 3 && ev.herbivore >= omnNext && ev.carnivore >= omnNext) {
        opts.push({ type: 'omnivore', nextLevel: omnNext });
    }
    return opts;
}

function applyEvolutionLevelEffect(type, newLevel) {
    const p = gameState.player;
    const lvData = EVOLUTION_PATHS[type].levels[newLevel - 1];
    if (type === 'herbivore') {
        gameState.stats.hpMax += lvData.hpBonus;
        gameState.stats.hpCurrent = Math.min(gameState.stats.hpMax, gameState.stats.hpCurrent + lvData.hpBonus);
    } else if (type === 'carnivore') {
        p.attack += lvData.attackBonus;
    } else if (type === 'omnivore') {
        p.speed += lvData.speedBonus;
    }
    p.organSlots += 3;
    p.evolution[type] = newLevel;
    if (p.evolution.omnivore > 0) p.evolution.active = 'omnivore';
    else if (p.evolution.carnivore > 0) p.evolution.active = 'carnivore';
    else p.evolution.active = 'herbivore';
}

function applyEvolutionEffects() {
    const ev = gameState.player.evolution;
    const p = gameState.player;
    for (let i = 0; i < ev.herbivore; i++) gameState.stats.hpMax += EVOLUTION_PATHS.herbivore.levels[i].hpBonus;
    for (let i = 0; i < ev.carnivore; i++) p.attack += EVOLUTION_PATHS.carnivore.levels[i].attackBonus;
    for (let i = 0; i < ev.omnivore;  i++) p.speed  += EVOLUTION_PATHS.omnivore.levels[i].speedBonus;
    gameState.stats.hpCurrent = gameState.stats.hpMax;
    if (ev.omnivore > 0) ev.active = 'omnivore';
    else if (ev.carnivore > 0) ev.active = 'carnivore';
    else ev.active = 'herbivore';
}

function applySkillBonuses() {
    const sk = gameState.playerSkills;
    const p = gameState.player;
    const hpBonus = (sk.vitality || 0) * 20;
    gameState.stats.hpMax += hpBonus;
    gameState.stats.hpCurrent = gameState.stats.hpMax;
    p.speed += (sk.agility || 0) * 0.2;
    p.rerollsRemaining = sk.luckyReroll || 0;
    p.pickupRange += (sk.collectionAddiction || 0) * 10;
    p.attack += (sk.terribleFang || 0) * 2;
    // 恐怖之牙 Lv5：開局獲得獠牙 Lv1
    if ((sk.terribleFang || 0) >= 5 && !p.organs.find(o => o.id === 'fang')) {
        const fangOrgan = { id: 'fang', name: '獠牙', type: 'attack', level: 1, desc: ORGANS.fang.levels[0].desc };
        p.organs.push(fangOrgan);
        applyOrganEffects(fangOrgan);
    }
    // 記憶器官：載入玩家死亡時手動選擇保留的器官（只用一次）
    const savedOrgans = localStorage.getItem('savedOrgans');
    if (savedOrgans) {
        try {
            const organs = JSON.parse(savedOrgans);
            organs.forEach(organ => {
                if (p.organs.find(o => o.id === organ.id)) return;
                const o = Object.assign({}, organ, { inherited: true, level: organ.level || 1 });
                p.organs.push(o);
                applyOrganEffects(o);
            });
        } catch(e) {}
        localStorage.removeItem('savedOrgans');
    }
    // 隱藏器官繼承
    const savedHiddenOrgans = localStorage.getItem('savedHiddenOrgans');
    if (savedHiddenOrgans) {
        try {
            const hOrgans = JSON.parse(savedHiddenOrgans);
            hOrgans.forEach(organ => {
                if (p.hiddenOrgans.find(h => h.id === organ.id)) return;
                p.hiddenOrgans.push(Object.assign({}, organ));
                applyHiddenOrganEffects(organ);
            });
        } catch(e) {}
        localStorage.removeItem('savedHiddenOrgans');
    }
}

function saveLastRunOrgans() {
    const p = gameState.player;
    const data = {
        organs: (p.organs || []).map(o => ({ id: o.id, name: o.name, type: o.type, level: o.level || 1, desc: o.desc })),
        hiddenOrgans: (p.hiddenOrgans || []).map(h => ({ id: h.id, name: h.name, desc: h.desc }))
    };
    localStorage.setItem('lastRunOrgans', JSON.stringify(data));
}

function showSkillTree(cause) {
    if (gameState.gameOver) return;
    gameState.gameOver = true;
    gameState.skillTreeOpen = true;
    AudioManager.play('death');
    AudioManager.stopMusic();
    saveLastRunOrgans();
    gameState.skillPoints += 1;
    localStorage.setItem('playerSkills', JSON.stringify(gameState.playerSkills));
    localStorage.setItem('skillPoints', String(gameState.skillPoints));
    localStorage.removeItem('savedOrgans');
    localStorage.removeItem('savedHiddenOrgans');
    buildSkillTreeOverlay(cause);
}

function buildSkillTreeOverlay(cause, fromHome) {
    _skillTreeFromHome = !!fromHome;
    if (fromHome) {
        try {
            const ss = localStorage.getItem('playerSkills');
            if (ss) gameState.playerSkills = JSON.parse(ss);
            const sp = localStorage.getItem('skillPoints');
            if (sp) gameState.skillPoints = Math.max(0, parseInt(sp, 10) || 0);
        } catch(e) {}
    }
    const existing = document.getElementById('skill-tree-overlay');
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.id = 'skill-tree-overlay';
    overlay.dataset.cause = cause == null ? '' : String(cause);
    const zIdx = fromHome ? 210 : 150;
    overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.88);overflow-y:scroll;display:flex;flex-direction:column;align-items:center;padding:20px 0 30px;z-index:' + zIdx + ';pointer-events:all;color:white;font-family:Arial,sans-serif;box-sizing:border-box;';
    overlay.addEventListener('wheel', e => { e.stopPropagation(); }, { passive: true });

    const title = document.createElement('div');
    title.style.cssText = 'font-size:32px;margin-bottom:14px;flex-shrink:0;';
    title.textContent = fromHome ? t('skillTreeTitle') : (cause === 'timeout' ? t('timeoutTitle') : t('youDied'));
    overlay.appendChild(title);

    const organsToKeep = 1 + (gameState.playerSkills.organMemory || 0);
    const playerOrgans = gameState.player.organs;
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
                localStorage.setItem('savedOrgans', JSON.stringify(
                    selectedOrgans.map(o => ({ id: o.id, name: o.name, type: o.type, level: 1,
                        desc: ORGANS[o.id] ? ORGANS[o.id].levels[0].desc : o.desc }))
                ));
            };
            cardMap.push(card);
            organGrid.appendChild(card);
        });
        organSection.appendChild(organGrid);
    }
    if (!fromHome) overlay.appendChild(organSection);

    const hiddenOrgans = gameState.player.hiddenOrgans || [];
    if (!fromHome && hiddenOrgans.length > 0) {
        const hiddenSection = document.createElement('div');
        hiddenSection.style.cssText = 'background:rgba(255,215,0,0.06);border:1px solid #887700;border-radius:8px;padding:12px 16px;margin-bottom:16px;max-width:660px;width:90%;box-sizing:border-box;';
        const hiddenTitle = document.createElement('div');
        hiddenTitle.style.cssText = 'font-size:14px;color:#FFD700;margin-bottom:8px;';
        hiddenTitle.textContent = t('keepHiddenOne');
        hiddenSection.appendChild(hiddenTitle);
        const hiddenGrid = document.createElement('div');
        hiddenGrid.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;';
        let selectedHiddenOrgan = null;
        const hiddenCardMap = [];
        hiddenOrgans.forEach((organ, idx) => {
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
                if (selectedHiddenOrgan && selectedHiddenOrgan.id === organ.id) {
                    selectedHiddenOrgan = null;
                    card.style.borderColor = '#887700';
                    card.style.background = 'rgba(255,215,0,0.08)';
                    localStorage.removeItem('savedHiddenOrgans');
                } else {
                    if (selectedHiddenOrgan) {
                        const prevIdx = hiddenOrgans.findIndex(o => o.id === selectedHiddenOrgan.id);
                        if (prevIdx >= 0 && hiddenCardMap[prevIdx]) {
                            hiddenCardMap[prevIdx].style.borderColor = '#887700';
                            hiddenCardMap[prevIdx].style.background = 'rgba(255,215,0,0.08)';
                        }
                    }
                    selectedHiddenOrgan = organ;
                    card.style.borderColor = '#FFD700';
                    card.style.background = 'rgba(255,215,0,0.22)';
                    localStorage.setItem('savedHiddenOrgans', JSON.stringify([{ id: organ.id, name: organ.name, type: organ.type, desc: organ.desc }]));
                }
            };
            hiddenCardMap.push(card);
            hiddenGrid.appendChild(card);
        });
        hiddenSection.appendChild(hiddenGrid);
        overlay.appendChild(hiddenSection);
    }

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
        localStorage.setItem('playerSkills', JSON.stringify(gameState.playerSkills));
        localStorage.setItem('skillPoints', String(gameState.skillPoints));
        buildSkillTreeOverlay(null, _skillTreeFromHome);
    };
    ptsRow.appendChild(resetBtn);
    overlay.appendChild(ptsRow);

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
        const canUp = !maxed && gameState.skillPoints > 0;
        btn.style.cssText = 'padding:5px 0;font-size:12px;width:100%;border-radius:3px;background:transparent;cursor:' + (canUp ? 'pointer' : 'default') + ';border:1px solid ' + (maxed || !canUp ? '#555' : '#FFD700') + ';color:' + (maxed || !canUp ? '#555' : 'white') + ';';
        btn.textContent = maxed ? t('maxed') : t('upgradeCost1');
        btn.disabled = !canUp;
        btn.onclick = () => upgradeSkill(skill.id);
        card.appendChild(btn);
        grid.appendChild(card);
    });
    overlay.appendChild(grid);

    const _lrRaw = localStorage.getItem('lastRunOrgans');
    let _lrData = null;
    try { if (_lrRaw) _lrData = JSON.parse(_lrRaw); } catch(e) {}

    if (fromHome) {
        const inheritSec = document.createElement('div');
        inheritSec.style.cssText = 'background:rgba(255,215,0,0.06);border:1px solid #665500;border-radius:8px;padding:12px 16px;margin-bottom:16px;max-width:660px;width:90%;box-sizing:border-box;';
        const homeOrgansToKeep = 1 + (gameState.playerSkills.organMemory || 0);
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
                            localStorage.setItem('savedOrgans', JSON.stringify(homeSelOrgans.map(o => ({ id: o.id, name: o.name, type: o.type, level: 1, desc: ORGANS[o.id] ? ORGANS[o.id].levels[0].desc : o.desc }))));
                        } else {
                            localStorage.removeItem('savedOrgans');
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
                hTitle.textContent = t('inheritHiddenHome');
                inheritSec.appendChild(hTitle);
                const homeHidGrid = document.createElement('div');
                homeHidGrid.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;';
                let homeSelHidden = null;
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
                        if (homeSelHidden && homeSelHidden.id === organ.id) {
                            homeSelHidden = null;
                            card.style.borderColor = '#887700';
                            card.style.background = 'rgba(255,215,0,0.08)';
                            localStorage.removeItem('savedHiddenOrgans');
                        } else {
                            if (homeSelHidden) {
                                const pi = _lrHidden.findIndex(o => o.id === homeSelHidden.id);
                                if (pi >= 0 && homeHidCardMap[pi]) { homeHidCardMap[pi].style.borderColor = '#887700'; homeHidCardMap[pi].style.background = 'rgba(255,215,0,0.08)'; }
                            }
                            homeSelHidden = organ;
                            card.style.borderColor = '#FFD700';
                            card.style.background = 'rgba(255,215,0,0.22)';
                            localStorage.setItem('savedHiddenOrgans', JSON.stringify([{ id: organ.id, name: organ.name, type: organ.type, desc: organ.desc }]));
                        }
                    };
                    homeHidCardMap.push(card);
                    homeHidGrid.appendChild(card);
                });
                inheritSec.appendChild(homeHidGrid);
            }
        }
        overlay.appendChild(inheritSec);
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
        overlay.appendChild(lastRunSec);
    }

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:12px;margin-bottom:16px;';
    if (fromHome) {
        const closeBtn = document.createElement('button');
        closeBtn.style.cssText = 'font-size:16px;padding:10px 24px;cursor:pointer;border:1px solid #aaa;background:rgba(255,255,255,0.1);color:white;border-radius:5px;';
        closeBtn.textContent = t('close');
        closeBtn.onclick = () => { hideTooltip(); overlay.remove(); };
        btnRow.appendChild(closeBtn);
    } else {
        const homeBtn = document.createElement('button');
        homeBtn.style.cssText = 'font-size:16px;padding:10px 24px;cursor:pointer;border:1px solid #aaa;background:rgba(255,255,255,0.1);color:white;border-radius:5px;';
        homeBtn.textContent = t('backHome');
        homeBtn.onclick = () => location.reload();
        btnRow.appendChild(homeBtn);
        const playAgainBtn = document.createElement('button');
        playAgainBtn.style.cssText = 'font-size:16px;padding:10px 24px;cursor:pointer;border:1px solid #FFD700;background:rgba(255,215,0,0.15);color:white;border-radius:5px;';
        playAgainBtn.textContent = t('playAgain');
        playAgainBtn.onclick = () => { sessionStorage.setItem('autostart', '1'); location.reload(); };
        btnRow.appendChild(playAgainBtn);
    }
    overlay.appendChild(btnRow);
    (fromHome ? document.getElementById('game-container') : document.getElementById('ui-overlay')).appendChild(overlay);
}

function upgradeSkill(id) {
    if (gameState.skillPoints <= 0) return;
    const skill = SKILLS[id];
    if (!skill) return;
    const current = gameState.playerSkills[id] || 0;
    if (current >= skill.maxLevel) return;
    gameState.playerSkills[id] = current + 1;
    gameState.skillPoints--;
    localStorage.setItem('playerSkills', JSON.stringify(gameState.playerSkills));
    localStorage.setItem('skillPoints', String(gameState.skillPoints));
    buildSkillTreeOverlay(null, _skillTreeFromHome);
}
