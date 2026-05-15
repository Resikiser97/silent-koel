// =============================================================
// 器官系統 - getOrganLevel / getOrganCumulative / getComboHint
//            checkComboEffects / getOrganSlotsUsed
//            applyHiddenOrganEffects / applyOrganEffects / checkOrganUpgrade
//            showOrganSelection / drawOrganUI
//            handleEliteKill / showHiddenOrganSelection
// =============================================================

function getOrganLevel(id) {
    const o = gameState.player.organs.find(o => o.id === id);
    return o ? o.level : 0;
}

function getOrganCumulative(id, effectKey) {
    const lv = getOrganLevel(id);
    if (!lv || !ORGANS[id]) return 0;
    return ORGANS[id].levels.slice(0, lv).reduce((sum, l) => sum + (l.effects[effectKey] || 0), 0);
}

function getComboHint(organId) {
    for (const combo of COMBOS) {
        if (!combo.ids.includes(organId)) continue;
        const partner = combo.ids.find(id => id !== organId);
        if (gameState.player.organs.some(o => o.id === partner)) return combo.desc;
    }
    return null;
}

function checkComboEffects() {
    const p = gameState.player;
    const has = id => p.organs.some(o => o.id === id);
    for (const combo of COMBOS) {
        p[combo.key] = combo.ids.every(id => has(id));
    }
}

function getOrganSlotsUsed() {
    return gameState.player.organs.reduce((sum, o) => sum + (o.level || 1), 0);
}

function applyHiddenOrganEffects(organ) {
    const p = gameState.player;
    const fx = organ.effects || {};
    if (fx.speedAdd)       p.speed = Math.max(0.3, p.speed + fx.speedAdd);
    if (fx.attackAdd)      p.attack += fx.attackAdd;
    if (fx.hpMaxAdd) {
        gameState.stats.hpMax += fx.hpMaxAdd;
        gameState.stats.hpCurrent = Math.min(gameState.stats.hpMax, gameState.stats.hpCurrent + fx.hpMaxAdd);
    }
    if (fx.radiusAdd) {
        const rangeIncrease = Math.round(fx.radiusAdd / p.radius * p.attackRange);
        p.radius += fx.radiusAdd;
        p.attackRange += rangeIncrease;
    }
    if (fx.pickupRangeAdd) p.pickupRange += fx.pickupRangeAdd;
}

function applyOrganEffects(organ) {
    const p = gameState.player;
    const def = ORGANS[organ.id];
    if (!def) return;
    const lv = def.levels[organ.level - 1];
    if (!lv) return;
    const fx = lv.effects;

    if (fx.attackAdd)              p.attack += fx.attackAdd;
    if (fx.attackSpeedMult)        p.attackSpeed *= fx.attackSpeedMult;
    if (fx.speedAdd)               p.speed = Math.max(0.3, p.speed + fx.speedAdd);
    if (fx.damageReductionAdd)     p.damageReduction = Math.min(0.9, p.damageReduction + fx.damageReductionAdd);
    if (fx.hpMaxAdd) {
        gameState.stats.hpMax += fx.hpMaxAdd;
        gameState.stats.hpCurrent = Math.min(gameState.stats.hpMax, gameState.stats.hpCurrent + fx.hpMaxAdd);
    }
    if (fx.radiusAdd) {
        const rangeIncrease = Math.round(fx.radiusAdd / p.radius * p.attackRange);
        p.radius += fx.radiusAdd;
        p.attackRange += rangeIncrease;
    }
    if (fx.thornDamageAdd)         p.thornDamage += fx.thornDamageAdd;
    if (fx.thornPlayerAtkReflect)  p.thornPlayerAtkReflect = true;
    if (fx.critChanceAdd)          p.critChance += fx.critChanceAdd;
    if (fx.critMultiplierAdd)      p.critMultiplier += fx.critMultiplierAdd;
    if (fx.brainActivate) { p.brainActive = true; p.brainTimer = Date.now(); }
    if (fx.brainIntervalDelta)     p.brainInterval = Math.max(1000, p.brainInterval + fx.brainIntervalDelta);
    if (fx.brainRangeDelta)        p.brainRange += fx.brainRangeDelta;
    if (fx.brainDmgDelta)          p.brainDmg += fx.brainDmgDelta;
    if (fx.pickupRangeAdd)         p.pickupRange += fx.pickupRangeAdd;
    if (fx.attackRangeAdd)         p.attackRange += fx.attackRangeAdd;
    if (fx.aggroRangeReductionAdd) p.aggroRangeReduction += fx.aggroRangeReductionAdd;
    if (fx.regenHpAdd)             p.naturalRegenHp += fx.regenHpAdd;
    if (fx.regenIntervalDelta)     p.naturalRegenInterval = Math.max(2000, p.naturalRegenInterval + fx.regenIntervalDelta);

    checkComboEffects();
}

function checkOrganUpgrade() {
    const p = gameState.player;
    if (p.organs.length >= p.nextEvolutionAt) {
        p.organSlots      += 3;
        p.nextEvolutionAt += 3;
        console.log('進化！器官槽位增加至 ' + p.organSlots);
    }
}

function showOrganSelection() {
    if (gameState.organSelectionActive) {
        gameState.pendingOrganSelections++;
        return;
    }
    const p = gameState.player;
    gameState.organSelectionActive = true;

    const organSlotsUsed = getOrganSlotsUsed();
    const slotsFull = organSlotsUsed >= p.organSlots;
    const typeColor = { attack: '#FF9999', defense: '#88CCFF', spirit: '#CC99FF' };

    const evoOptions = slotsFull ? checkEvolutionUnlock() : [];

    const closeOverlay = () => {
        hideTooltip();
        const el = document.getElementById('organ-selection-overlay');
        if (el) el.remove();
        gameState.organSelectionActive = false;
        gameState.lastTimeTick = Date.now();
        if (gameState.pendingOrganSelections > 0) {
            gameState.pendingOrganSelections--;
            showOrganSelection();
        }
    };

    function generateOrganOptions() {
        const opts = [];
        p.organs
            .filter(o => ORGANS[o.id] && o.level < ORGANS[o.id].maxLevel)
            .forEach(o => opts.push({ type: 'upgrade', def: ORGANS[o.id], existingOrgan: o }));
        const equippedIds = p.organs.map(o => o.id);
        Object.values(ORGANS)
            .filter(def => !equippedIds.includes(def.id))
            .sort(() => Math.random() - 0.5)
            .forEach(def => opts.push({ type: 'new', def }));
        opts.sort(() => Math.random() - 0.5);
        opts.splice(3);
        // 新手保護：Lv1~3 且完全沒有攻擊器官時，強制至少1個攻擊選項
        if (p.level <= 3 && !p.organs.some(o => ORGANS[o.id] && ORGANS[o.id].type === 'attack')) {
            if (!opts.some(opt => opt.def.type === 'attack')) {
                const eIds = p.organs.map(o => o.id);
                const atkPool = Object.values(ORGANS).filter(def => def.type === 'attack' && !eIds.includes(def.id));
                if (atkPool.length > 0) opts[0] = { type: 'new', def: atkPool[Math.floor(Math.random() * atkPool.length)] };
            }
        }
        return opts;
    }

    if (!slotsFull && generateOrganOptions().length === 0 && evoOptions.length === 0) {
        gameState.organSelectionActive = false;
        return;
    }

    const overlay = document.createElement('div');
    overlay.id = 'organ-selection-overlay';
    overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.78);overflow-y:auto;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px 0;z-index:100;pointer-events:all;box-sizing:border-box;';

    const title = document.createElement('div');
    title.style.cssText = 'color:#FFD700;font-size:22px;font-weight:bold;margin-bottom:6px;text-shadow:1px 1px 4px black;';
    title.textContent = slotsFull ? t('chooseEvo') : t('chooseOrgan');
    overlay.appendChild(title);

    const slotInfo = document.createElement('div');
    slotInfo.style.cssText = 'color:#aaa;font-size:13px;margin-bottom:14px;';
    slotInfo.textContent = t('slotLabel') + '：' + organSlotsUsed + ' / ' + p.organSlots;
    overlay.appendChild(slotInfo);

    const optionsContainer = document.createElement('div');
    optionsContainer.style.cssText = 'display:flex;flex-direction:column;align-items:center;width:100%;';
    overlay.appendChild(optionsContainer);

    function renderOptions(organOptions) {
        optionsContainer.innerHTML = '';

        organOptions.forEach(opt => {
            const { def, type, existingOrgan } = opt;
            const color = typeColor[def.type] || '#FFD700';
            const isUpgrade = type === 'upgrade';
            const targetLevel = isUpgrade ? existingOrgan.level + 1 : 1;
            const lvDesc = def.levels[targetLevel - 1].desc;
            const comboHint = getComboHint(def.id);

            const btn = document.createElement('div');
            btn.style.cssText = 'background:rgba(255,255,255,0.08);border:1px solid ' + (isUpgrade ? '#FFAA44' : '#666') + ';color:white;padding:12px 20px;margin:5px;cursor:pointer;border-radius:6px;width:380px;text-align:center;';
            btn.innerHTML =
                '<div style="color:' + color + ';font-weight:bold;font-size:15px;">' +
                    def.name + (isUpgrade ? ' Lv.' + existingOrgan.level + ' → Lv.' + targetLevel : ' Lv.1') +
                '</div>' +
                '<div style="font-size:11px;color:#ccc;margin-top:4px;">' + lvDesc + '</div>' +
                (comboHint ? '<div style="font-size:10px;color:#FFD700;margin-top:5px;">' + t('comboHintLabel') + comboHint + '</div>' : '');
            btn.onmouseenter = (e) => {
                btn.style.background = 'rgba(255,255,255,0.2)';
                showTooltip({ name: def.name, level: targetLevel, maxLevel: def.maxLevel, desc: def.levels[targetLevel - 1].desc, combo: comboHint }, e.clientX, e.clientY);
            };
            btn.onmouseleave = () => { btn.style.background = 'rgba(255,255,255,0.08)'; hideTooltip(); };
            btn.onclick = () => {
                if (isUpgrade) {
                    existingOrgan.level = targetLevel;
                    existingOrgan.desc = def.levels[targetLevel - 1].desc;
                } else {
                    p.organs.push({ id: def.id, name: def.name, type: def.type, level: 1, desc: def.levels[0].desc });
                }
                applyOrganEffects(isUpgrade ? existingOrgan : p.organs[p.organs.length - 1]);
                closeOverlay();
            };
            optionsContainer.appendChild(btn);
        });

        evoOptions.forEach(opt => {
            const path = EVOLUTION_PATHS[opt.type];
            const lvData = path.levels[opt.nextLevel - 1];
            const btn = document.createElement('div');
            btn.style.cssText = 'background:rgba(255,215,0,0.08);border:1px solid #FFD700;color:white;padding:12px 20px;margin:5px;cursor:pointer;border-radius:6px;width:380px;text-align:center;';
            btn.innerHTML = '<strong style="color:#FFD700;font-size:16px;">' + path.icon + ' ' + path.name + ' Lv.' + opt.nextLevel + '</strong><br><span style="font-size:12px;color:#ccc;">' + lvData.desc + '</span>';
            btn.onmouseenter = (e) => {
                btn.style.background = 'rgba(255,215,0,0.2)';
                showTooltip({ name: path.icon + ' ' + path.name, level: opt.nextLevel, maxLevel: path.maxLevel, desc: lvData.desc }, e.clientX, e.clientY);
            };
            btn.onmouseleave = () => { btn.style.background = 'rgba(255,215,0,0.08)'; hideTooltip(); };
            btn.onclick = () => {
                applyEvolutionLevelEffect(opt.type, opt.nextLevel);
                closeOverlay();
            };
            optionsContainer.appendChild(btn);
        });

        if (!slotsFull && (gameState.playerSkills.luckyReroll || 0) > 0) {
            const remaining = gameState.player.rerollsRemaining || 0;
            const canReroll = remaining > 0;
            const rerollBtn = document.createElement('div');
            rerollBtn.style.cssText = 'padding:8px 20px;margin:10px 5px 5px;border-radius:6px;width:380px;text-align:center;font-size:13px;' +
                (canReroll
                    ? 'background:rgba(100,200,255,0.1);border:1px solid #66CCFF;color:#66CCFF;cursor:pointer;'
                    : 'background:rgba(80,80,80,0.1);border:1px solid #555;color:#555;cursor:default;');
            rerollBtn.textContent = t('rerollBtn', { n: remaining });
            if (canReroll) {
                rerollBtn.onmouseenter = () => { rerollBtn.style.background = 'rgba(100,200,255,0.25)'; };
                rerollBtn.onmouseleave = () => { rerollBtn.style.background = 'rgba(100,200,255,0.1)'; };
                rerollBtn.onclick = () => {
                    gameState.player.rerollsRemaining--;
                    renderOptions(generateOrganOptions());
                };
            }
            optionsContainer.appendChild(rerollBtn);
        }
    }

    renderOptions(slotsFull ? [] : generateOrganOptions());
    document.getElementById('game-container').appendChild(overlay);
}

function drawOrganUI() {
    const organs = gameState.player.organs;
    const hiddenOrgans = gameState.player.hiddenOrgans || [];
    const ev = gameState.player.evolution;
    const p = gameState.player;
    const lineH = 18;
    const padX = 10;
    const padY = 8;
    const H = VIEW_H;
    const versionAreaH = 46;

    const organSlotsUsed = getOrganSlotsUsed();

    const evoEntries = Object.entries(EVOLUTION_PATHS)
        .filter(([key]) => (ev[key] || 0) > 0)
        .map(([key, path]) => path.icon + ' ' + path.name + ' Lv.' + ev[key]);

    const evoCnt = evoEntries.length;
    const evoBoxH = evoCnt > 0 ? evoCnt * lineH + padY * 2 : 0;
    const hiddenRows = hiddenOrgans.length > 0 ? hiddenOrgans.length + 1 : 0;
    const organsBoxH = (1 + organs.length + hiddenRows) * lineH + padY * 2;

    const boxBottom = H - versionAreaH;
    const boxY      = boxBottom - organsBoxH;
    const evoBoxY   = boxY - 4 - evoBoxH;

    _organHitRegions = [];
    const _hrX = padX - 4;
    const _hrW = 164;
    if (evoCnt > 0) {
        const _evoKeys = Object.entries(EVOLUTION_PATHS).filter(([key]) => (ev[key] || 0) > 0);
        _evoKeys.forEach(([key, path], i) => {
            const lv = ev[key];
            _organHitRegions.push({
                x: _hrX, y: evoBoxY + padY + i * lineH, w: _hrW, h: lineH,
                data: { name: path.icon + ' ' + path.name, level: lv, maxLevel: path.maxLevel, desc: path.levels[lv - 1].desc }
            });
        });
    }
    organs.forEach((organ, i) => {
        _organHitRegions.push({
            x: _hrX, y: boxY + padY + (i + 1) * lineH, w: _hrW, h: lineH,
            data: {
                name: organ.name,
                level: organ.level || 1,
                maxLevel: ORGANS[organ.id] ? ORGANS[organ.id].maxLevel : null,
                desc: ORGANS[organ.id] ? ORGANS[organ.id].levels[0].desc : (organ.desc || ''),
                organId: organ.id
            }
        });
    });
    if (hiddenOrgans.length > 0) {
        hiddenOrgans.forEach((organ, j) => {
            _organHitRegions.push({
                x: _hrX, y: boxY + padY + (organs.length + 2 + j) * lineH, w: _hrW, h: lineH,
                data: {
                    name: organ.name,
                    desc: HIDDEN_ORGANS[organ.id] ? HIDDEN_ORGANS[organ.id].desc : (organ.desc || ''),
                    isHidden: true
                }
            });
        });
    }

    if (evoCnt > 0) {
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(padX - 4, evoBoxY, 164, evoBoxH);
        ctx.font = '13px Arial';
        ctx.fillStyle = '#88FF88';
        evoEntries.forEach((text, i) => {
            ctx.fillText(text, padX, evoBoxY + padY + (i + 1) * lineH - 4);
        });
    }

    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(padX - 4, boxY, 164, organsBoxH);
    ctx.font = '13px Arial';

    const isFull = organSlotsUsed >= p.organSlots;
    ctx.fillStyle = isFull ? '#FFD700' : '#CCCCCC';
    const slotText = t('organLabel') + '：' + organSlotsUsed + ' / ' + p.organSlots + (isFull ? t('canEvolve') : '');
    ctx.fillText(slotText, padX, boxY + padY + lineH - 4);

    const typeColor = { attack: '#FF9999', defense: '#88CCFF', spirit: '#CC99FF' };
    organs.forEach((organ, i) => {
        ctx.fillStyle = typeColor[organ.type] || '#FFD700';
        const label = '▸ ' + organ.name + ' Lv.' + (organ.level || 1) + (organ.inherited ? t('inheritedSuffix') : '');
        ctx.fillText(label, padX, boxY + padY + (i + 2) * lineH - 4);
    });

    if (hiddenOrgans.length > 0) {
        const sepRow = organs.length + 2;
        ctx.fillStyle = 'rgba(255,215,0,0.5)';
        ctx.fillRect(padX - 2, boxY + padY + sepRow * lineH - 14, 160, 1);
        hiddenOrgans.forEach((organ, i) => {
            ctx.fillStyle = '#FFD700';
            ctx.fillText('✨ ' + organ.name, padX, boxY + padY + (sepRow + i + 1) * lineH - 4);
        });
    }
}

function handleEliteKill(elite) {
    const xp = elite.xp;
    gameState.eliteCreature = null;
    gameState.eliteJustKilled = true;
    // showHiddenOrganSelection 必須在 addXP 之前呼叫，確保 organSelectionActive=true，
    // 避免 addXP 觸發升級選器官時直接疊層。(v0.15.2 修復)
    if (!gameState.gameOver) {
        const ownedIds = (gameState.player.hiddenOrgans || []).map(h => h.id);
        const drops = Object.values(HIDDEN_ORGANS).filter(h => !ownedIds.includes(h.id) && Math.random() < 0.5);
        if (drops.length > 0) showHiddenOrganSelection(drops);
    }
    addXP(xp);
    showXPPopup(gameState.player.x, gameState.player.y, xp);
    gameState.skillPoints += 1;
    localStorage.setItem('skillPoints', String(gameState.skillPoints));
    const nextDayTime = 600 - (gameState.currentPhaseIndex + 1) * 75;
    gameState.timeRemaining = nextDayTime;
    updateDayNightCycle();
    gameState.dayNightMessage.text = t('morningEliteKilled');
    gameState.dayNightMessage.timer = Date.now();
}

function showHiddenOrganSelection(drops) {
    if (gameState.gameOver || drops.length === 0) return;
    gameState.organSelectionActive = true;

    const closeOverlay = () => {
        hideTooltip();
        const el = document.getElementById('hidden-organ-overlay');
        if (el) el.remove();
        // 先釋放 organSelectionActive，再呼叫 showOrganSelection，
        // 否則 showOrganSelection 入口會再次 pending++ 並直接 return，
        // 導致 active=true 但無 overlay 而卡死。(v0.15.3 修復)
        gameState.organSelectionActive = false;
        gameState.lastTimeTick = Date.now();
        if (gameState.pendingOrganSelections > 0) {
            gameState.pendingOrganSelections--;
            showOrganSelection();
        }
    };

    const overlay = document.createElement('div');
    overlay.id = 'hidden-organ-overlay';
    overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.82);overflow-y:auto;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px 0;z-index:110;pointer-events:all;box-sizing:border-box;';

    const title = document.createElement('div');
    title.style.cssText = 'color:#FFD700;font-size:24px;font-weight:bold;margin-bottom:6px;text-shadow:2px 2px 6px black;';
    title.textContent = t('hiddenOrganDrop');
    overlay.appendChild(title);

    const sub = document.createElement('div');
    sub.style.cssText = 'color:#aaa;font-size:13px;margin-bottom:18px;';
    sub.textContent = drops.length > 1 ? t('hiddenOrganPickOne') : t('hiddenOrganClickOne');
    overlay.appendChild(sub);

    drops.forEach(organ => {
        const btn = document.createElement('div');
        btn.style.cssText = 'background:rgba(255,215,0,0.08);border:2px solid #FFD700;color:white;padding:14px 24px;margin:6px;cursor:pointer;border-radius:8px;width:400px;text-align:center;';
        btn.innerHTML = '<div style="color:#FFD700;font-weight:bold;font-size:16px;margin-bottom:5px;">✨ ' + organ.name + '</div>' +
            '<div style="font-size:12px;color:#ddd;">' + organ.desc + '</div>';
        btn.onmouseenter = (e) => {
            btn.style.background = 'rgba(255,215,0,0.22)';
            showTooltip({ name: organ.name, desc: organ.desc || '', isHidden: true }, e.clientX, e.clientY);
        };
        btn.onmouseleave = () => { btn.style.background = 'rgba(255,215,0,0.08)'; hideTooltip(); };
        btn.onclick = () => {
            const p = gameState.player;
            if (!p.hiddenOrgans) p.hiddenOrgans = [];
            p.hiddenOrgans.push(Object.assign({}, organ));
            applyHiddenOrganEffects(organ);
            closeOverlay();
        };
        overlay.appendChild(btn);
    });

    document.getElementById('game-container').appendChild(overlay);
}
