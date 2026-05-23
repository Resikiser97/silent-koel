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
        const partners = combo.ids.filter(id => id !== organId);
        if (partners.every(id => gameState.player.organs.some(o => o.id === id))) return combo.desc;
    }
    return null;
}

function checkComboEffects() {
    const p = gameState.player;
    const hasLv3 = id => {
        const o = p.organs.find(o => o.id === id);
        return o && (o.level || 1) >= 3;
    };
    const hasOrgan = id => p.organs.some(o => o.id === id);

    for (const combo of COMBOS) {
        if (combo.key === 'comboCrabPoison') {
            // 毒刺 Lv3 且擁有毒囊（不要求毒囊達 Lv3）
            p.comboCrabPoison = hasLv3('poisonStinger') && hasOrgan('poisonSac');
        } else {
            p[combo.key] = combo.ids.every(id => hasLv3(id));
        }
    }
}

function getOrganSlotsUsed() {
    return gameState.player.organs
        .filter(o => !ORGANS[o.id] || !ORGANS[o.id].noSelection)
        .reduce((sum, o) => sum + (o.level || 1), 0);
}

function applyHiddenOrganEffects(organ) {
    const p = gameState.player;
    const fx = organ.effects || (HIDDEN_ORGANS[organ.id] || {}).effects || {};
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
    if (fx.pickupRangeAdd)     p.pickupRange += fx.pickupRangeAdd;
    if (fx.critChanceAdd)      p.critChance += fx.critChanceAdd;
    if (fx.critMultiplierAdd)  p.critMultiplier += fx.critMultiplierAdd;
}

function applyOrganEffects(organ) {
    const p = gameState.player;
    const def = ORGANS[organ.id];
    if (!def) return;
    // poisonSac Lv0 無效果
    if (organ.id === 'poisonSac' && (organ.level || 0) === 0) return;
    const lv = def.levels[(organ.level || 1) - 1];
    if (!lv) return;
    const fx = lv.effects;

    if (fx.attackAdd)              p.attack += fx.attackAdd;
    if (fx.attackSpeedBonus)       p.attackSpeedBonus = (p.attackSpeedBonus || 0) + fx.attackSpeedBonus;
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
    if (fx.critChanceAdd)          p.critChance += fx.critChanceAdd;
    if (fx.critMultiplierAdd)      p.critMultiplier += fx.critMultiplierAdd;
    if (fx.brainActivate) { p.brainActive = true; p.brainTimer = Date.now(); }
    if (fx.brainIntervalDelta)     p.brainInterval = Math.max(1000, p.brainInterval + fx.brainIntervalDelta);
    if (fx.brainRangeDelta)        p.brainRange += fx.brainRangeDelta;
    if (fx.brainDmgDelta)          p.brainDmg += fx.brainDmgDelta;
    if (fx.pickupRangeAdd)         p.pickupRange += fx.pickupRangeAdd;
    if (fx.attackRangeAdd)         p.attackRange += fx.attackRangeAdd;
    if (fx.regenHpAdd)             p.naturalRegenHp += fx.regenHpAdd;
    if (fx.regenIntervalDelta)     p.naturalRegenInterval = Math.max(2000, p.naturalRegenInterval + fx.regenIntervalDelta);
    if (fx.regenHpMaxPercent)      p.naturalRegenHpMaxPercent += fx.regenHpMaxPercent;
    if (fx.perceptionRangeAdd)     p.perceptionRange += fx.perceptionRangeAdd;
    // 毒囊特有欄位：不影響 player stats，combat.js 直接讀 getOrganCumulative

    checkComboEffects();

    // 刷新變異倍率（只更新 player 上的 mutationXxxBonus，不直接改 stats）
    // 實際一次性 Final 值乘算由 applyAllMutationBonuses() 在遊戲初始化末尾完成
    if (typeof applyMutationEffects === 'function') applyMutationEffects();
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
    // 戰鬥教學：第一教學完成、戰鬥教學尚未完成 → 鎖定只能選攻擊器官
    if (localStorage.getItem('tutorialCompleted') && !localStorage.getItem('tutorialCombatDone')) {
        gameState.tutorialOrganPhase = true;
    }
    const p = gameState.player;
    gameState.organSelectionActive = true;

    const organSlotsUsed = getOrganSlotsUsed();
    const slotsFull = organSlotsUsed >= p.organSlots;
    const typeColor = { attack: '#FF9999', defense: '#88CCFF', spirit: '#CC99FF', special: '#CC99FF' };

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
            .filter(o => ORGANS[o.id] && !ORGANS[o.id].noSelection && o.level < ORGANS[o.id].maxLevel)
            .forEach(o => opts.push({ type: 'upgrade', def: ORGANS[o.id], existingOrgan: o }));
        const equippedIds = p.organs.map(o => o.id);
        Object.values(ORGANS)
            .filter(def => !def.noSelection && !equippedIds.includes(def.id))
            .sort(() => Math.random() - 0.5)
            .forEach(def => opts.push({ type: 'new', def }));
        opts.sort(() => Math.random() - 0.5);
        opts.splice(3);
        // 新手保護：Lv1~3 且完全沒有攻擊器官時，強制至少1個攻擊選項
        if (p.level <= 3 && !p.organs.some(o => ORGANS[o.id] && ORGANS[o.id].type === 'attack')) {
            if (!opts.some(opt => opt.def.type === 'attack')) {
                const eIds = p.organs.map(o => o.id);
                const atkPool = Object.values(ORGANS).filter(def => def.type === 'attack' && !def.noSelection && !eIds.includes(def.id));
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

        // ── 教學器官階段：找出第一個攻擊器官的索引
        const _tutAtkIdx = gameState.tutorialOrganPhase
            ? organOptions.findIndex(o => o.def && o.def.type === 'attack')
            : -1;
        // 若在教學模式下卻無攻擊器官選項，自動取消鎖定（安全保護）
        if (gameState.tutorialOrganPhase && _tutAtkIdx < 0) {
            gameState.tutorialOrganPhase = false;
        }
        // 注入閃爍動畫 CSS（只注入一次）
        if (_tutAtkIdx >= 0 && !document.getElementById('tut-organ-style')) {
            const _st = document.createElement('style');
            _st.id = 'tut-organ-style';
            _st.textContent = '@keyframes tutOrganGlow{0%,100%{box-shadow:0 0 8px #FFD700,0 0 16px rgba(255,215,0,0.4);}50%{box-shadow:0 0 22px #FFD700,0 0 44px rgba(255,215,0,0.7);}}';
            document.head.appendChild(_st);
        }

        organOptions.forEach((opt, _tutIdx) => {
            const { def, type, existingOrgan } = opt;
            const color = typeColor[def.type] || '#FFD700';
            const isUpgrade = type === 'upgrade';
            const targetLevel = isUpgrade ? existingOrgan.level + 1 : 1;
            const lvDesc = def.levels[targetLevel - 1].desc;
            const comboHint = getComboHint(def.id);

            // 教學狀態：第一張攻擊器官 = 高亮；其他 = 灰暗禁用
            const _isAtkHighlight = _tutAtkIdx >= 0 && _tutIdx === _tutAtkIdx;
            const _isDisabled     = _tutAtkIdx >= 0 && _tutIdx !== _tutAtkIdx;

            const btn = document.createElement('div');
            if (_isAtkHighlight) {
                btn.style.cssText = 'background:rgba(255,215,0,0.12);border:2px solid #FFD700;color:white;padding:12px 20px;margin:5px;cursor:pointer;border-radius:6px;width:380px;text-align:center;animation:tutOrganGlow 1.2s ease-in-out infinite;';
            } else if (_isDisabled) {
                btn.style.cssText = 'background:rgba(255,255,255,0.08);border:1px solid #555;color:white;padding:12px 20px;margin:5px;border-radius:6px;width:380px;text-align:center;opacity:0.4;pointer-events:none;cursor:default;';
            } else {
                btn.style.cssText = 'background:rgba(255,255,255,0.08);border:1px solid ' + (isUpgrade ? '#FFAA44' : '#666') + ';color:white;padding:12px 20px;margin:5px;cursor:pointer;border-radius:6px;width:380px;text-align:center;';
            }
            btn.innerHTML =
                '<div style="color:' + color + ';font-weight:bold;font-size:15px;">' +
                    def.name + (isUpgrade ? ' Lv.' + existingOrgan.level + ' → Lv.' + targetLevel : ' Lv.1') +
                '</div>' +
                '<div style="font-size:11px;color:#ccc;margin-top:4px;">' + lvDesc + '</div>' +
                (comboHint ? '<div style="font-size:10px;color:#FFD700;margin-top:5px;">' + t('comboHintLabel') + comboHint + '</div>' : '') +
                (_isAtkHighlight ? '<div style="font-size:12px;color:#FFD700;margin-top:8px;">👆 選擇你的第一個攻擊器官！</div>' : '');
            if (!_isDisabled) {
                btn.onmouseenter = (e) => {
                    btn.style.background = _isAtkHighlight ? 'rgba(255,215,0,0.22)' : 'rgba(255,255,255,0.2)';
                    showTooltip({ name: def.name, level: targetLevel, maxLevel: def.maxLevel, desc: def.levels[targetLevel - 1].desc, combo: comboHint }, e.clientX, e.clientY);
                };
                btn.onmouseleave = () => {
                    btn.style.background = _isAtkHighlight ? 'rgba(255,215,0,0.12)' : 'rgba(255,255,255,0.08)';
                    hideTooltip();
                };
                btn.onclick = () => {
                    if (isUpgrade) {
                        existingOrgan.level = targetLevel;
                        existingOrgan.desc = def.levels[targetLevel - 1].desc;
                    } else {
                        p.organs.push({ id: def.id, name: def.name, type: def.type, level: 1, desc: def.levels[0].desc });
                    }
                    applyOrganEffects(isUpgrade ? existingOrgan : p.organs[p.organs.length - 1]);
                    const _wasTutOrgan = _isAtkHighlight;
                    if (_wasTutOrgan) gameState.tutorialOrganPhase = false;
                    closeOverlay();
                    if (_wasTutOrgan) spawnTutorialStump();
                };
            }
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

        if (!slotsFull && (gameState.playerSkills.luckyReroll || 0) > 0 && !gameState.tutorialOrganPhase) {
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
    // 普通器官（不包含 poisonSac）+ 毒囊單行
    const normalOrgans = organs.filter(o => o.id !== 'poisonSac');
    const sacOrgan = organs.find(o => o.id === 'poisonSac');
    const hiddenRows = hiddenOrgans.length > 0 ? hiddenOrgans.length + 1 : 0;
    const sacRow = sacOrgan ? 1 : 0;
    const organsBoxH = (1 + normalOrgans.length + hiddenRows + sacRow) * lineH + padY * 2;

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
    normalOrgans.forEach((organ, i) => {
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
    // 毒囊行
    if (sacOrgan) {
        const sacDef = ORGANS.poisonSac;
        const sacLv = sacOrgan.level || 0;
        const nextThreshold = sacLv < sacDef.maxLevel ? sacDef.thresholds[sacLv] : null;
        const sacDesc = sacLv === 0 ? '沒什麼囊用' : (sacDef.levels[sacLv - 1].desc || '');
        const nextInfo = nextThreshold ? '  下一級: ' + nextThreshold + '白骨素' : '  已滿級';
        _organHitRegions.push({
            x: _hrX, y: boxY + padY + (normalOrgans.length + 1) * lineH, w: _hrW, h: lineH,
            data: {
                name: sacOrgan.name,
                level: sacLv,
                maxLevel: sacDef.maxLevel,
                desc: sacDesc + nextInfo,
                organId: 'poisonSac'
            }
        });
    }
    if (hiddenOrgans.length > 0) {
        const sepBase = normalOrgans.length + 1 + sacRow;
        hiddenOrgans.forEach((organ, j) => {
            // hit region 對齊繪製位置：文字繪製在 (sepBase+2+j)*lineH - 4，
            // 與普通器官相同規律，hit region 放在文字行的前一格（+1 而非 +2）
            _organHitRegions.push({
                x: _hrX, y: boxY + padY + (sepBase + 1 + j) * lineH, w: _hrW, h: lineH,
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

    const typeColor = { attack: '#FF9999', defense: '#88CCFF', spirit: '#CC99FF', special: '#AAAAFF' };
    normalOrgans.forEach((organ, i) => {
        ctx.fillStyle = typeColor[organ.type] || '#FFD700';
        const label = '▸ ' + organ.name + ' Lv.' + (organ.level || 1) + (organ.inherited ? t('inheritedSuffix') : '');
        ctx.fillText(label, padX, boxY + padY + (i + 2) * lineH - 4);
    });

    // 毒囊特殊顯示：毒囊 Lv3（24/40）
    if (sacOrgan) {
        const sacLv = sacOrgan.level || 0;
        const sacDef = ORGANS.poisonSac;
        const nextThreshold = sacLv < sacDef.maxLevel ? sacDef.thresholds[sacLv] : null;
        const bm = p.boneMaterial || 0;
        ctx.fillStyle = '#AAAAFF';
        let sacLabel = '☠ ' + sacOrgan.name + ' Lv' + sacLv;
        if (nextThreshold) sacLabel += '（' + bm + '/' + nextThreshold + '）';
        else sacLabel += '（MAX）';
        ctx.fillText(sacLabel, padX, boxY + padY + (normalOrgans.length + 2) * lineH - 4);
    }

    if (hiddenOrgans.length > 0) {
        const sepBase = normalOrgans.length + 1 + sacRow;
        // sepBase+1 行為分隔行（畫中線），器官名稱從 sepBase+2 開始
        ctx.fillStyle = 'rgba(255,215,0,0.5)';
        ctx.fillRect(padX - 2, boxY + padY + (sepBase + 1) * lineH - Math.floor(lineH / 2), 160, 1);
        hiddenOrgans.forEach((organ, i) => {
            ctx.fillStyle = '#FFD700';
            ctx.fillText('✨ ' + organ.name, padX, boxY + padY + (sepBase + 2 + i) * lineH - 4);
        });
    }

    // 圖鑑按鈕（📖）：器官框右側
    _drawCompendiumBtn(padX - 4 + 164 + 4, boxY);
}

function _drawCompendiumBtn(bx, by) {
    const btnW = 24, btnH = 24;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(bx, by, btnW, btnH);
    ctx.fillStyle = '#FFD700';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📖', bx + btnW / 2, by + btnH / 2);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    // 登記點擊區域
    _compendiumBtnRegion = { x: bx, y: by, w: btnW, h: btnH };
}

let _compendiumBtnRegion = null;

function handleEliteKill(elite) {
    pausePlayTimer();
    const xp = elite.xp;

    // 精英怪死亡掉落：1個1倍屍體 + 4具白骨（圓形散落）
    spawnLootCircle(elite.x, elite.y, [
        { type: 'corpse', data: { multiplier: 1 } },
        { type: 'bone', data: {} },
        { type: 'bone', data: {} },
        { type: 'bone', data: {} },
        { type: 'bone', data: {} },
    ]);

    gameState.eliteCreature = null;
    gameState.eliteJustKilled = true;
    if (!gameState.gameOver) {
        const ownedIds = (gameState.player.hiddenOrgans || []).map(h => h.id);
        const drops = Object.values(HIDDEN_ORGANS).filter(h => !ownedIds.includes(h.id) && Math.random() < 0.5);
        if (drops.length > 0) showHiddenOrganSelection(drops);
    }
    addXP(xp);
    showXPPopup(gameState.player.x, gameState.player.y, xp);
    const nightIndex = Math.floor(gameState.currentPhaseIndex / 2);
    const eliteSkillPts = [1, 1, 2][nightIndex] || 1;
    gameState.skillPoints += eliteSkillPts;
    if (!gameState.sessionSkillPoints) gameState.sessionSkillPoints = { elite: 0, boss: 0 };
    gameState.sessionSkillPoints.elite += eliteSkillPts;
    localStorage.setItem('skillPoints', String(gameState.skillPoints));
    const nextDayTime = 600 - (gameState.currentPhaseIndex + 1) * 75;
    gameState.timeRemaining = nextDayTime;
    updateDayNightCycle();
    gameState.dayNightMessage.text = t('morningEliteKilled');
    gameState.dayNightMessage.timer = Date.now();
    resumePlayTimer();
}

function showHiddenOrganSelection(drops) {
    if (gameState.gameOver || drops.length === 0) return;
    gameState.organSelectionActive = true;

    const closeOverlay = () => {
        hideTooltip();
        const el = document.getElementById('hidden-organ-overlay');
        if (el) el.remove();
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
