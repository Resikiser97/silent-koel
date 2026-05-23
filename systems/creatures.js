// =============================================================
// 生物系統 - updateNeutralCreatures / drawNeutralCreatures
//            updateHostileCreatures / drawCorpses / drawHostileCreatures
// =============================================================

// ── 物種固定顏色常數 ──────────────────────────────────────────
const CREATURE_COLORS = {
    moose:      '#8B4513',   // 深棕
    beetle:     '#1ABC9C',   // 青綠
    camel:      '#E8C87A',   // 淺沙白
    lynx:       '#A0826D',   // 灰褐
    croc:       '#6B8E23',   // 橄欖綠
    hyena:      '#8B6914',   // 深咖啡
    // 特殊狀態光暈
    giantized:  '#FF8C00',
    alpha:      '#FFD700',
    killerBase: '#CC2200',
};

// ── 取得物種固定顏色（不跟地形走）────────────────────────────
function _getCreatureColor(creature) {
    return CREATURE_COLORS[creature.speciesId] || '#888888';
}

// ── 特殊狀態光暈（不跟著旋轉，以世界座標繪製）───────────────
function _drawCreatureGlow(ctx, creature, sx, sy) {
    let glowColor  = null;
    let glowRadius = creature.radius + 4;

    if (creature.isAlpha) {
        glowColor  = CREATURE_COLORS.alpha;
        glowRadius = creature.radius + 6;
    } else if (creature.isGiantized) {
        glowColor  = CREATURE_COLORS.giantized;
        glowRadius = creature.radius + 4;
    } else if (creature.isKiller) {
        const lv = creature.killerLevel || 0;
        const t  = Math.min(lv / 10, 1.0);
        const rv = Math.round(204 - t * 102);
        const gv = Math.round(34  - t * 34);
        glowColor  = `rgb(${rv},${gv},0)`;
        glowRadius = creature.radius + 2;
    }

    if (!glowColor) return;

    ctx.save();
    ctx.beginPath();
    ctx.arc(sx, sy, glowRadius, 0, Math.PI * 2);
    ctx.strokeStyle = glowColor;
    ctx.lineWidth   = 3;
    ctx.globalAlpha = 0.8;
    ctx.stroke();
    ctx.restore();
}

// ── 各物種形狀函式（全部以 (0,0) 為中心，頭朝右 +x，尾朝左 -x）──

// 駝鹿（moose）— 橢圓身體 + 兩側橫向鹿角（完整旋轉）
function _drawMoose(ctx, r) {
    // 身體橢圓
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.1, r * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();

    // 鹿角（兩側對稱，往上延伸）
    ctx.strokeStyle = ctx.fillStyle;
    ctx.lineWidth   = r * 0.18;
    ctx.lineCap     = 'round';

    // 左主枝
    ctx.beginPath();
    ctx.moveTo(-r * 0.4, -r * 0.8);
    ctx.lineTo(-r * 0.8, -r * 1.6);
    ctx.stroke();
    // 左分叉
    ctx.beginPath();
    ctx.moveTo(-r * 0.6, -r * 1.2);
    ctx.lineTo(-r * 1.2, -r * 1.4);
    ctx.stroke();

    // 右主枝
    ctx.beginPath();
    ctx.moveTo(r * 0.4, -r * 0.8);
    ctx.lineTo(r * 0.8, -r * 1.6);
    ctx.stroke();
    // 右分叉
    ctx.beginPath();
    ctx.moveTo(r * 0.6, -r * 1.2);
    ctx.lineTo(r * 1.2, -r * 1.4);
    ctx.stroke();
}

// 巨型甲虫（beetle）— 橢圓身體 + 橫向甲殼線 + 前方對稱彎鉤夾鉗（完整旋轉）
function _drawBeetle(ctx, r) {
    // 身體橢圓
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.1, r * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();

    // 甲殼橫中線
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.moveTo(-r * 1.0, 0);
    ctx.lineTo( r * 1.0, 0);
    ctx.stroke();

    // 上夾鉗（彎鉤，前方右側）
    ctx.strokeStyle = CREATURE_COLORS.beetle;
    ctx.lineWidth   = r * 0.18;
    ctx.lineCap     = 'round';
    ctx.beginPath();
    ctx.moveTo(r * 0.8, -r * 0.3);
    ctx.quadraticCurveTo(r * 1.6, -r * 0.3, r * 1.5, r * 0.4);
    ctx.stroke();

    // 下夾鉗（對稱）
    ctx.beginPath();
    ctx.moveTo(r * 0.8,  r * 0.3);
    ctx.quadraticCurveTo(r * 1.6, r * 0.3, r * 1.5, -r * 0.4);
    ctx.stroke();
}

// 鱷魚（croc）— 菱形頭 + 小圓身體 + 長三角尾（完整旋轉）
// 比例：頭1 : 身1 : 尾2.2
function _drawCroc(ctx, r) {
    const unit = r;

    // 尾巴三角（左側，尖端朝左）
    const tailLen  = unit * 2.2;
    const tailBase = unit * 0.55;
    ctx.beginPath();
    ctx.moveTo(-unit * 0.5, -tailBase);
    ctx.lineTo(-unit * 0.5,  tailBase);
    ctx.lineTo(-unit * 0.5 - tailLen, 0);
    ctx.closePath();
    ctx.fill();

    // 身體小圓（中間）
    ctx.beginPath();
    ctx.arc(0, 0, unit * 0.6, 0, Math.PI * 2);
    ctx.fill();

    // 頭部菱形（右側，緊接身體）
    const hx = unit * 0.8;   // 菱形中心 x
    const hw = unit * 0.9;   // 半長（x 方向）
    const hh = unit * 0.45;  // 半寬（y 方向）
    ctx.beginPath();
    ctx.moveTo(hx + hw, 0);
    ctx.lineTo(hx,      -hh);
    ctx.lineTo(hx - hw,  0);
    ctx.lineTo(hx,       hh);
    ctx.closePath();
    ctx.fill();
}

// 駱駝（camel）— 扁橢圓身體 + 兩個駝峰 + 長頸 + 頭部（只左右翻轉）
function _drawCamel(ctx, r) {
    // 身體扁橢圓
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.3, r * 0.75, 0, 0, Math.PI * 2);
    ctx.fill();

    // 駝峰左（半圓，上方偏左）
    ctx.beginPath();
    ctx.arc(-r * 0.4, -r * 0.7, r * 0.35, Math.PI, 0);
    ctx.fill();

    // 駝峰右（半圓，上方偏右）
    ctx.beginPath();
    ctx.arc(r * 0.25, -r * 0.7, r * 0.35, Math.PI, 0);
    ctx.fill();

    // 長頸（右側細長矩形）
    ctx.beginPath();
    ctx.roundRect(r * 1.0, -r * 0.55, r * 0.3, r * 0.7, r * 0.1);
    ctx.fill();

    // 頭部小圓（頸頂）
    ctx.beginPath();
    ctx.arc(r * 1.15, -r * 0.75, r * 0.32, 0, Math.PI * 2);
    ctx.fill();

    // 輪廓描邊（避免跟沙漠混色）
    ctx.strokeStyle = '#8B6914';
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.3, r * 0.75, 0, 0, Math.PI * 2);
    ctx.stroke();
}

// 猞猁（lynx）— 大三角身體 + 圓頭 + 小三角耳 + 彎尾（只左右翻轉）
function _drawLynx(ctx, r) {
    // 身體大三角（尖端朝右=頭方向，底邊朝左）
    ctx.beginPath();
    ctx.moveTo( r * 1.0,  0);
    ctx.lineTo(-r * 0.8, -r * 0.85);
    ctx.lineTo(-r * 0.8,  r * 0.85);
    ctx.closePath();
    ctx.fill();

    // 頭部圓形（三角尖端前方）
    ctx.beginPath();
    ctx.arc(r * 1.45, 0, r * 0.48, 0, Math.PI * 2);
    ctx.fill();

    // 左耳小三角
    ctx.beginPath();
    ctx.moveTo(r * 1.15, -r * 0.38);
    ctx.lineTo(r * 1.05, -r * 0.85);
    ctx.lineTo(r * 1.45, -r * 0.45);
    ctx.closePath();
    ctx.fill();

    // 右耳小三角
    ctx.beginPath();
    ctx.moveTo(r * 1.5,  -r * 0.38);
    ctx.lineTo(r * 1.55, -r * 0.85);
    ctx.lineTo(r * 1.85, -r * 0.35);
    ctx.closePath();
    ctx.fill();

    // 彎尾（左側=移動反方向，往上翹）
    ctx.strokeStyle = CREATURE_COLORS.lynx;
    ctx.lineWidth   = r * 0.22;
    ctx.lineCap     = 'round';
    ctx.beginPath();
    ctx.moveTo(-r * 0.8, 0);
    ctx.quadraticCurveTo(-r * 1.5, r * 0.2, -r * 1.3, -r * 0.75);
    ctx.stroke();
}

// 鬣狗（hyena）— 圓臉 + 兩個圓耳 + 鼻子（永遠朝上，不旋轉）
function _drawHyena(ctx, r) {
    // 臉部圓形
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // 左圓耳
    ctx.beginPath();
    ctx.arc(-r * 0.65, -r * 0.85, r * 0.38, 0, Math.PI * 2);
    ctx.fill();

    // 右圓耳
    ctx.beginPath();
    ctx.arc(r * 0.65, -r * 0.85, r * 0.38, 0, Math.PI * 2);
    ctx.fill();

    // 鼻子小點
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.arc(0, r * 0.2, r * 0.18, 0, Math.PI * 2);
    ctx.fill();
}

// ── 主分派函式（各物種旋轉模式不同）────────────────────────────
// moose / beetle / croc：完整旋轉（跟 _moveAngle）
// camel / lynx：只左右翻轉（cos 正朝右，cos 負朝左）
// hyena：完全不旋轉（永遠朝上）
function drawCreatureShape(ctx, creature, sx, sy) {
    const r     = creature.radius;
    const angle = creature._moveAngle || 0;

    ctx.save();
    ctx.translate(sx, sy);

    switch (creature.speciesId) {

        // ── 完整旋轉 ─────────────────────────────────────────
        case 'moose':
            ctx.rotate(angle);
            ctx.fillStyle = CREATURE_COLORS.moose;
            _drawMoose(ctx, r);
            break;

        case 'beetle':
            ctx.rotate(angle);
            ctx.fillStyle = CREATURE_COLORS.beetle;
            _drawBeetle(ctx, r);
            break;

        case 'croc':
            ctx.rotate(angle);
            ctx.fillStyle = CREATURE_COLORS.croc;
            _drawCroc(ctx, r);
            break;

        // ── 只左右翻轉 ────────────────────────────────────────
        case 'camel': {
            const facingRight = Math.cos(angle) >= 0;
            if (!facingRight) ctx.scale(-1, 1);
            ctx.fillStyle = CREATURE_COLORS.camel;
            _drawCamel(ctx, r);
            break;
        }

        case 'lynx': {
            const facingRight = Math.cos(angle) >= 0;
            if (!facingRight) ctx.scale(-1, 1);
            ctx.fillStyle = CREATURE_COLORS.lynx;
            _drawLynx(ctx, r);
            break;
        }

        // ── 完全不旋轉 ────────────────────────────────────────
        case 'hyena':
            ctx.fillStyle = CREATURE_COLORS.hyena;
            _drawHyena(ctx, r);
            break;

        default:
            ctx.fillStyle = '#888888';
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.fill();
    }

    ctx.restore();

    // 特殊狀態光暈（不跟旋轉，固定在世界座標）
    _drawCreatureGlow(ctx, creature, sx, sy);
    // ⚠️ 測試用：方向指示三角形，確認無誤後移除
    _drawDirectionArrow(ctx, creature, sx, sy);
}

// ── 測試用：方向指示三角形（確認無誤後移除）────────────────────
function _drawDirectionArrow(ctx, creature, sx, sy) {
    const r     = creature.radius;
    const angle = creature._moveAngle || 0;
    const tip   = r + 8;   // 三角形尖端距中心

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.moveTo(tip + 6, 0);   // 尖端（朝前）
    ctx.lineTo(tip,    -4);   // 左翼
    ctx.lineTo(tip,     4);   // 右翼
    ctx.closePath();
    ctx.fillStyle   = '#FFFFFF';
    ctx.globalAlpha = 0.9;
    ctx.fill();

    ctx.restore();
}

// ── 草食性連吃：附近500px是否有同族巨人化 ──
function _hasGiantizedNearby(creature, range) {
    for (const c of gameState.neutralCreatures) {
        if (!c.isGiantized) continue;
        if (c.biome !== creature.biome) continue;
        if (c.speciesId !== creature.speciesId) continue;
        if (wrappedDistance(creature.x, creature.y, c.x, c.y) < range) return true;
    }
    return false;
}

// ── 肉系吃屍體成長（每具+10%基礎值，不累乘）──
function _carnivoreEatCorpse(creature, corpse) {
    creature.corpseEaten++;
    const bonus = creature.corpseEaten * 0.1; // 每吃1具+10%，不累乘

    // 回血5% maxHP
    creature.hp = Math.min(creature.maxHp, creature.hp + creature.maxHp * 0.05);

    // 成長數值（基礎值×bonus，不累乘）
    creature.maxHp   = creature.baseHp     * (1 + bonus);
    creature.hp      = Math.min(creature.maxHp, creature.hp);
    creature.speed   = creature.baseSpeed  * (1 + bonus);
    creature.damage  = creature.baseDamage * (1 + bonus);
    creature.radius  = creature.baseRadius * (1 + bonus);

    if (creature.isKiller) {
        // 殺手化後繼續吃：killerCorpseEaten 計數，再疊加+10%基礎值
        creature.killerLevel = (creature.killerLevel || 0) + 1;
        creature.killerCorpseEaten++;
        const kBonus = creature.killerCorpseEaten * 0.1;
        creature.damage  += creature.baseDamage * kBonus;
        creature.speed   += creature.baseSpeed  * kBonus;
        creature.maxHp   += creature.baseHp     * kBonus;
        creature.hp       = Math.min(creature.maxHp, creature.hp);
        creature.radius  += creature.baseRadius * kBonus;
    } else if (creature.corpseEaten >= 5 &&
               gameState.currentMap && gameState.currentMap.features &&
               gameState.currentMap.features.killer) {
        // 觸發殺手化
        _triggerKiller(creature);
    }

    // 鬣狗：分食系統（吃完屍體時，同具屍體的組員各+1計數）
    if (creature.speciesId === 'hyena') {
        for (const mate of (creature.packMates || [])) {
            if (mate.hp <= 0) continue;
            if (mate.eatTarget === creature.eatTarget) {
                mate.corpseEaten = (mate.corpseEaten || 0) + 1;
                if (mate.isKiller) {
                    mate.killerLevel = (mate.killerLevel || 0) + 1;
                }
                if (!mate.isKiller && mate.corpseEaten >= 5 &&
                    gameState.currentMap && gameState.currentMap.features &&
                    gameState.currentMap.features.killer) {
                    _triggerKiller(mate);
                }
            }
        }
    }
}

// ── 殺手化觸發（吃滿5具）──
function _triggerKiller(creature) {
    creature.isKiller          = true;
    creature.killerLevel       = 0;
    creature.killerCorpseEaten = 0;
    creature.aggroRange       = creature.aggroRange * 2;
    creature.damage           = creature.baseDamage * (1 + 0.5 + 0.1 * creature.corpseEaten);
    creature.speed            = creature.baseSpeed  * (1 + 0.3 + 0.1 * creature.corpseEaten);
    creature.killerRegenTimer = 0;
}

function _triggerGiantization(creature) {
    const prevMaxHp = creature.maxHp || 30;
    const oldLeader = creature.packLeaderRef; // 保存舊隊長引用

    creature.isGiantized      = true;
    creature.damage           = (creature.damage || 0) + 20;
    creature.maxHp            = prevMaxHp * 10;
    creature.hp               = creature.maxHp;
    creature.radius           = creature.radius * 1.5;
    creature.aggroRange       = 400;
    creature.guardianRange    = 1000;
    creature.diet             = 'herbivore';
    creature.canFight         = true;
    creature.fruitsEaten      = 0;
    creature.giantRegenTimer  = 0;
    creature.packLeader       = true;
    creature.packMembers      = [];
    creature.packLeaderRef    = null;
    creature._packJoinTimer   = 0;
    creature._fruitTarget     = null;
    creature._fruitTargetTimer = 0;
    creature._seekingFruit    = false;

    // 若原本在隊伍中，且隊長尚未Alpha → 觸發Alpha升格
    if (oldLeader && oldLeader.hp > 0 && oldLeader.isGiantized && !oldLeader.isAlpha && !gameState.alphaCreature) {
        const idx = oldLeader.packMembers.indexOf(creature);
        if (idx !== -1) oldLeader.packMembers.splice(idx, 1);
        _triggerAlpha(oldLeader);
    }
}

function _triggerAlpha(creature) {
    creature.isAlpha          = true;
    creature.damage           = creature.damage * 2;
    creature.maxHp            = creature.maxHp * 3;
    creature.hp               = creature.maxHp;
    creature.radius           = creature.radius * 1.5;
    creature.aggroRange       = 600;
    creature.guardianRange    = 1500;
    creature.packFollowRange  = 1000;
    creature.giantRegenRate   = 0.02;
    gameState.alphaCreature   = creature;
    showAlphaAnnouncement(creature.name);
}

// ── GuardianRange：巨人/Alpha 保護同族草食性 ──
function _checkGuardianRange(giant) {
    const range = giant.guardianRange || 1000;
    for (const neutral of gameState.neutralCreatures) {
        if (neutral.hp <= 0) continue;
        if (neutral.biome !== giant.biome) continue;
        if (neutral.speciesId !== giant.speciesId) continue;
        if (wrappedDistance(giant.x, giant.y, neutral.x, neutral.y) > range) continue;

        // 檢查這個草食性附近是否有肉食者
        for (const hostile of gameState.hostileCreatures) {
            if (hostile.hp <= 0) continue;
            if (wrappedDistance(neutral.x, neutral.y, hostile.x, hostile.y) < 150) {
                // 立刻把巨人的target設為這個肉食者，進入攻擊狀態
                giant.guardianTarget = hostile;
                giant.state = 'attacking';
                return;
            }
        }
    }
    // 沒有威脅，清除已死亡的 guardianTarget
    if (giant.guardianTarget && giant.guardianTarget.hp <= 0) {
        giant.guardianTarget = null;
    }
}

// ── 隊伍上限動態計算 ──
function _getPackLimit(leader) {
    let limit = 5;
    // 隊伍內每多1隻巨人化（含Alpha）+1上限
    if (leader.packMembers) {
        for (const m of leader.packMembers) {
            if (m.isGiantized || m.isAlpha) limit++;
        }
    }
    if (leader.isGiantized || leader.isAlpha) limit++; // 隊長本身
    return Math.min(limit, 8); // cap最多8隻
}

// ── 巨人化/Alpha 低血量逃跑條件檢查（每秒評估一次）──
function _checkGiantFleeCondition(creature) {
    const hpRatio = creature.hp / creature.maxHp;
    if (hpRatio >= 0.3) return; // 血量足夠，不逃

    // 線性插值計算逃跑機率
    // 血量30% → 60%逃跑機率；血量10% → 80%逃跑機率；10%以下固定80%
    let fleeProbability;
    if (hpRatio <= 0.1) {
        fleeProbability = 0.8;
    } else {
        // 線性插值：hpRatio從0.3到0.1，fleeProbability從0.6到0.8
        fleeProbability = 0.6 + (0.3 - hpRatio) / (0.3 - 0.1) * (0.8 - 0.6);
    }

    // 每秒評估一次（避免每幀觸發）
    const now = Date.now();
    if (now - (creature._fleeCheckTimer || 0) < 1000) return;
    creature._fleeCheckTimer = now;

    if (Math.random() < fleeProbability) {
        creature.state = 'fleeing';
        creature.isFleeing = true;
    }
}

// ── 巨人化/Alpha 逃跑更新（朝最近果子移動，吃到回10% maxHP）──
function _updateGiantFlee(creature) {
    if (!creature.isFleeing) return;

    // 尋找最近果子
    let closest = null, closestDist = Infinity;
    for (const f of gameState.fruits) {
        const d = wrappedDistance(creature.x, creature.y, f.x, f.y);
        if (d < closestDist) { closestDist = d; closest = f; }
    }

    if (closest) {
        const { dx, dy } = wrappedDelta(creature.x, creature.y, closest.x, closest.y);
        creature._moveAngle = Math.atan2(dy, dx);
        moveCreature(creature,
            creature.x + Math.cos(creature._moveAngle) * creature.speed,
            creature.y + Math.sin(creature._moveAngle) * creature.speed);

        // 吃到果子：回復10% maxHP
        if (closestDist < creature.radius + 6) {
            const idx = gameState.fruits.indexOf(closest);
            if (idx !== -1) gameState.fruits.splice(idx, 1);
            creature.hp = Math.min(creature.maxHp, creature.hp + creature.maxHp * 0.1);
        }
    }

    // 血量回到30%以上停止逃跑
    if (creature.hp / creature.maxHp >= 0.3) {
        creature.isFleeing = false;
        creature.state = 'wandering';
    }
}

// ── 取得生物顯示名稱（含殺手等級）──
function _getCreatureDisplayName(creature) {
    if (!creature) return '';
    const baseName = creature.name || creature.speciesId || '未知';
    if (creature.isKiller) {
        return baseName + ' 殺手Lv' + (creature.killerLevel || 0);
    }
    return baseName;
}

// ── 生態區判斷 ──
function _isInHomeBiome(creature) {
    if (!creature.biome) return true;
    return getBiome(creature.x, creature.y) === creature.biome;
}

// ── 尋找最近生態區邊緣點（每2秒更新目標點）──
function _findNearestBiomePoint(biome, x, y) {
    let best = null, bestDist = Infinity;
    for (let i = 0; i < 30; i++) {
        const sx = 50 + Math.random() * (MAP_WIDTH  - 100);
        const sy = 50 + Math.random() * (MAP_HEIGHT - 100);
        if (getBiome(sx, sy) !== biome) continue;
        const d = wrappedDistance(x, y, sx, sy);
        if (d < bestDist) { bestDist = d; best = { x: sx, y: sy }; }
    }
    return best;
}

// ── 肉食者是否應逃離巨人 ──
function _shouldFleeFromGiant(carnivore, giant) {
    if (giant.isAlpha) return true; // Alpha一律逃跑
    return giant.hp > carnivore.hp * 3; // 普通巨人：HP > 食肉者×3 → 逃跑
}

// ── 猞猁生態區加成 ──
function _applyLynxBiomeBonus(lynx) {
    const inForest = _isInHomeBiome(lynx);
    const outSecs = lynx._leftBiomeTime
        ? (Date.now() - lynx._leftBiomeTime) / 1000 : 0;
    const lostBonus = !inForest && outSecs >= 3;
    lynx._biomeSpeedMult = lostBonus ? 1.0 : 1.2;
    if (!lostBonus) {
        lynx._critChance  = 0.5;
        lynx._critMult    = 2.0;
        lynx._critSlowAmt = 0.3;
        lynx._critSlowDur = 3000;
        lynx._critText    = '喵嗚咬死你！';
    } else {
        lynx._critChance  = 0.25;
        lynx._critMult    = 1.5;
        lynx._critSlowAmt = 0.15;
        lynx._critSlowDur = 1500;
        lynx._critText    = '喵嗚咬死你！';
    }
}

// ── 鱷魚生態區加成 ──
function _applyCrocBiomeBonus(croc) {
    const inOcean = _isInHomeBiome(croc);
    const outSecs = croc._leftBiomeTime
        ? (Date.now() - croc._leftBiomeTime) / 1000 : 0;
    const hasBonus = inOcean || outSecs < 3;
    croc._biomeAtkMult    = hasBonus ? 1.2 : 1.0;
    croc._biomeSpeedMult  = hasBonus ? 1.3 : 1.0;
    croc._deathRollChance = hasBonus ? 0.2 : 0.0;
}

// ── 鬣狗組隊掃描（每2秒）──
function _updateHyenaPack(hyena) {
    const now = Date.now();
    if (now - (hyena._packScanTimer || 0) < 2000) return;
    hyena._packScanTimer = now;
    hyena.packMates = [];
    for (const other of gameState.hostileCreatures) {
        if (other === hyena || other.hp <= 0) continue;
        if (other.speciesId !== 'hyena') continue;
        if (other.packGroup !== hyena.packGroup) continue;
        if (other.biome !== hyena.biome) continue;
        if (wrappedDistance(hyena.x, hyena.y, other.x, other.y) > 600) continue;
        hyena.packMates.push(other);
    }
}

// ── 鬣狗組隊加成 ──
function _getHyenaPackBonus(hyena) {
    const count = (hyena.packMates || []).filter(m => m.hp > 0).length;
    return {
        atkMult:   1.0 + count * 0.2,
        speedMult: 1.0 + count * 0.05,
    };
}

// ── 鬣狗生態區 + 組隊合併加成 ──
function _applyHyenaBiomeBonus(hyena) {
    const inDesert = _isInHomeBiome(hyena);
    const outSecs  = hyena._leftBiomeTime
        ? (Date.now() - hyena._leftBiomeTime) / 1000 : 0;
    const lostBonus = !inDesert && outSecs >= 3;
    hyena._biomeSpeedMult = lostBonus ? 0.5 : 1.1;
    hyena._biomeAtkMult   = lostBonus ? 0.5 : 1.0;
    const pack = _getHyenaPackBonus(hyena);
    hyena._finalAtkMult   = hyena._biomeAtkMult   * pack.atkMult;
    hyena._finalSpeedMult = hyena._biomeSpeedMult * pack.speedMult;
}

// ── 鬣狗警報：通知600px內同組成員 ──
function _alertHyenaPack(hyena, target) {
    for (const mate of (hyena.packMates || [])) {
        if (mate.hp <= 0) continue;
        if (wrappedDistance(hyena.x, hyena.y, mate.x, mate.y) > 600) continue;
        if (!mate.target || mate.target.hp <= 0) {
            mate.target     = target;
            mate.state      = 'chasing';
            mate.targetType = (target === gameState.player) ? 'player' : 'neutral';
        }
    }
}

function updateNeutralCreatures() {
    const now = Date.now();
    const p   = gameState.player;
    const herbLv        = p.evolution.herbivore || 0;
    const isCalm        = herbLv >= 2; // Lv2：撞到不逃
    const isFriendly    = herbLv >= 3; // Lv3：完全不逃
    const isSuperFriendly = herbLv >= 4; // Lv4+：中立生物不因玩家靠近中斷休息

    for (const creature of gameState.neutralCreatures) {
        if (creature.hp <= 0) continue;
        if (creature.stunnedUntil && now < creature.stunnedUntil) continue;

        // ── 激進化生物（diet=aggressive）沿用舊邏輯 ──────────────
        if (creature.diet === 'aggressive') {
            const aggroRange = creature.aggroRange || 120;
            let target = null, bestDist = aggroRange;
            const dp = wrappedDistance(creature.x, creature.y, p.x, p.y);
            if (!isSuperFriendly && dp < bestDist) { target = p; bestDist = dp; }
            for (const h of gameState.hostileCreatures) {
                if (h.hp <= 0) continue;
                const d = wrappedDistance(creature.x, creature.y, h.x, h.y);
                if (d < bestDist) { target = h; bestDist = d; }
            }
            if (target) {
                creature.state = 'chasing';
                const { dx, dy } = wrappedDelta(creature.x, creature.y, target.x, target.y);
                const dist = Math.sqrt(dx * dx + dy * dy);
                const atkRange = creature.radius + (target.radius || 10) + 5;
                if (dist <= atkRange) {
                    if (now - (creature.attackCooldown || 0) >= 1000) {
                        creature.attackCooldown = now;
                        if (target === p) { applyDamageToPlayer(creature.damage || 8, creature); }
                        else {
                            target.hp -= creature.damage || 8;
                            if (target.hp <= 0) gameState.corpses.push({ x: target.x, y: target.y, radius: target.radius, spawnTime: now });
                        }
                    }
                } else {
                    creature._moveAngle = Math.atan2(dy, dx);
                    moveCreature(creature, creature.x + Math.cos(Math.atan2(dy, dx)) * creature.speed, creature.y + Math.sin(Math.atan2(dy, dx)) * creature.speed);
                }
            } else {
                creature.state = 'wandering';
                if (!creature.wanderTarget || now - creature.lastWanderTime >= 2000) {
                    creature.wanderTarget = { x: Math.random() * MAP_WIDTH, y: Math.random() * MAP_HEIGHT };
                    creature.lastWanderTime = now;
                }
                if (creature.wanderTarget) {
                    const { dx: wdx, dy: wdy } = wrappedDelta(creature.x, creature.y, creature.wanderTarget.x, creature.wanderTarget.y);
                    if (Math.sqrt(wdx * wdx + wdy * wdy) < 2) { creature.wanderTarget = null; }
                    else { moveCreature(creature, creature.x + Math.cos(Math.atan2(wdy, wdx)) * creature.speed, creature.y + Math.sin(Math.atan2(wdy, wdx)) * creature.speed); }
                }
            }
            continue;
        }

        const distToPlayer = wrappedDistance(creature.x, creature.y, p.x, p.y);
        const touchDist    = creature.radius + p.radius;

        // ── 生態生物三態移動（有 biome 屬性）────────────────────
        if (creature.biome) {
            // ── 巨人化行為（優先處理）────────────────────────────
            if (creature.isGiantized) {
                // 低血量逃跑條件檢查（每秒評估）
                _checkGiantFleeCondition(creature);
                if (creature.isFleeing) {
                    _updateGiantFlee(creature);
                    continue;
                }

                // 每秒回血（Alpha 特殊邏輯，普通巨人化 1%）
                if (creature.isAlpha) {
                    if (now - (creature.giantRegenTimer || 0) >= 1000) {
                        creature.giantRegenTimer = now;
                        if (creature.hp / creature.maxHp >= 0.8) {
                            // 血量≥80%：自身回復1%，剩餘1%平分給GuardianRange內組隊受傷草食性
                            creature.hp = Math.min(creature.maxHp, creature.hp + creature.maxHp * 0.01);
                            const injured = [];
                            const members = creature.packMembers || [];
                            for (const m of members) {
                                if (m.hp <= 0) continue;
                                if (m.hp >= m.maxHp) continue; // 未受傷跳過
                                if (wrappedDistance(creature.x, creature.y, m.x, m.y) > (creature.guardianRange || 1500)) continue;
                                injured.push(m);
                            }
                            if (injured.length > 0) {
                                const totalHeal = creature.maxHp * 0.01;
                                const healPerMember = Math.floor(totalHeal / injured.length);
                                if (healPerMember > 0) {
                                    for (const m of injured) {
                                        m.hp = Math.min(m.maxHp, m.hp + healPerMember);
                                    }
                                }
                            }
                        } else {
                            // 血量<80%：優先自保，只回復自身2%
                            creature.hp = Math.min(creature.maxHp, creature.hp + creature.maxHp * 0.02);
                        }
                    }
                } else {
                    // 普通巨人化：每秒回血1%
                    if (now - (creature.giantRegenTimer || 0) >= 1000) {
                        creature.giantRegenTimer = now;
                        creature.hp = Math.min(creature.maxHp, creature.hp + creature.maxHp * 0.01);
                    }
                }

                // GuardianRange 檢查（可能設定 guardianTarget）
                _checkGuardianRange(creature);

                // 搜尋攻擊目標（guardianTarget 優先 > 敵意生物 > 玩家，草食性Lv4+除外）
                let giantTarget = null, giantTargetDist = creature.aggroRange;
                if (creature.guardianTarget && creature.guardianTarget.hp > 0) {
                    // guardianTarget 優先，忽略 aggroRange 限制
                    giantTarget = creature.guardianTarget;
                } else {
                    creature.guardianTarget = null;
                    const giantHerbLv = p.evolution.herbivore || 0;
                    if (giantHerbLv < 4) {
                        const dp = wrappedDistance(creature.x, creature.y, p.x, p.y);
                        if (dp < giantTargetDist) { giantTarget = p; giantTargetDist = dp; }
                    }
                    for (const h of gameState.hostileCreatures) {
                        if (h.hp <= 0) continue;
                        const d = wrappedDistance(creature.x, creature.y, h.x, h.y);
                        if (d < giantTargetDist) { giantTarget = h; giantTargetDist = d; }
                    }
                }

                if (giantTarget) {
                    creature.state = 'chasing';
                    const { dx: gadx, dy: gady } = wrappedDelta(creature.x, creature.y, giantTarget.x, giantTarget.y);
                    const gaDist    = Math.sqrt(gadx * gadx + gady * gady);
                    const gaAtkRange = creature.radius + (giantTarget.radius || 10) + 5;
                    if (gaDist <= gaAtkRange) {
                        if (now - (creature.attackCooldown || 0) >= 1000) {
                            creature.attackCooldown = now;
                            if (giantTarget === p) {
                                applyDamageToPlayer(creature.damage, creature);
                            } else {
                                giantTarget.hp -= creature.damage;
                                if (giantTarget.hp <= 0) handleKill(giantTarget, true);
                            }
                        }
                    } else {
                        const gaAngle = Math.atan2(gady, gadx);
                        creature._moveAngle = gaAngle;
                        moveCreature(creature, creature.x + Math.cos(gaAngle) * creature.speed,
                                               creature.y + Math.sin(gaAngle) * creature.speed);
                    }
                    continue;
                }
                creature.state = 'wandering';

                // 組隊管理（僅隊長）
                if (creature.packLeader) {
                    const followRange = creature.packFollowRange || 800; // Alpha 為 1000
                    if (now - (creature._packJoinTimer || 0) >= 3000) {
                        creature._packJoinTimer = now;
                        // 清除超出跟隨範圍或死亡的隊員
                        creature.packMembers = creature.packMembers.filter(m => {
                            if (m.hp <= 0) { m.packLeaderRef = null; return false; }
                            const d = wrappedDistance(creature.x, creature.y, m.x, m.y);
                            if (d > followRange) { m.packLeaderRef = null; return false; }
                            return true;
                        });
                        // 招募新隊員（同族同生態，20%機率，上限動態含隊長）
                        const packLimit = _getPackLimit(creature);
                        if (creature.packMembers.length < packLimit - 1) {
                            for (const n of gameState.neutralCreatures) {
                                if (creature.packMembers.length >= packLimit - 1) break;
                                if (n === creature || n.hp <= 0 || n.packLeaderRef || n.isGiantized) continue;
                                if (n.biome !== creature.biome || n.speciesId !== creature.speciesId) continue;
                                const d = wrappedDistance(creature.x, creature.y, n.x, n.y);
                                if (d < followRange && Math.random() < 0.2) {
                                    n.packLeaderRef = creature;
                                    creature.packMembers.push(n);
                                }
                            }
                        }
                    }
                    // 等待隊員：有隊員距離 > 跟隨範圍75% 時暫停移動
                    const waitThreshold = followRange * 0.75;
                    let waitingForMember = false;
                    for (const m of creature.packMembers) {
                        if (m.hp <= 0) continue;
                        if (wrappedDistance(creature.x, creature.y, m.x, m.y) > waitThreshold) { waitingForMember = true; break; }
                    }
                    if (waitingForMember) continue;
                }

                // 帶領隊伍向最近果子移動（每3~5秒切換目標）
                if (!creature._fruitTarget || !gameState.fruits.includes(creature._fruitTarget) ||
                    now >= (creature._fruitTargetTimer || 0)) {
                    creature._fruitTargetTimer = now + 3000 + Math.random() * 2000;
                    // 隊伍滿員（8人）時搜索半徑擴展至 2000px，否則 800px
                    const giantGroupSize = 1 + (creature.packMembers ? creature.packMembers.filter(m => m.hp > 0).length : 0);
                    const fruitSearchRadius = giantGroupSize >= 8 ? 2000 : 800;
                    let gfClosest = null, gfDist = Infinity;
                    for (const f of gameState.fruits) {
                        const d = wrappedDistance(creature.x, creature.y, f.x, f.y);
                        if (d < fruitSearchRadius && d < gfDist) { gfDist = d; gfClosest = f; }
                    }
                    creature._fruitTarget = gfClosest;
                }
                if (creature._fruitTarget) {
                    const { dx: ftdx, dy: ftdy } = wrappedDelta(creature.x, creature.y,
                        creature._fruitTarget.x, creature._fruitTarget.y);
                    creature._moveAngle = Math.atan2(ftdy, ftdx);
                } else {
                    creature._moveAngle = (creature._moveAngle || 0) + (Math.random() - 0.5) * 0.12;
                }
                moveCreature(creature, creature.x + Math.cos(creature._moveAngle) * creature.speed,
                                       creature.y + Math.sin(creature._moveAngle) * creature.speed);
                continue;
            }

            // 玩家碰撞：切換 fighting/fleeing
            if (distToPlayer < touchDist) {
                if (isFriendly) {
                    creature.state = 'wandering'; creature.isResting = false;
                } else if (isCalm) {
                    if (creature.canFight && creature.damage > 0) creature.state = 'fighting';
                } else {
                    creature.state = (creature.canFight && creature.damage > 0) ? 'fighting' : 'fleeing';
                    creature.isResting = false;
                }
            } else if ((creature.state === 'fighting' || creature.state === 'fleeing') && distToPlayer > touchDist + 50) {
                creature.state = 'wandering';
            } else if (isFriendly && (creature.state === 'fighting' || creature.state === 'fleeing')) {
                creature.state = 'wandering';
            }

            if (creature.state === 'fighting') {
                if (now - (creature.lastDamageTime || 0) >= 1000) {
                    applyDamageToPlayer(creature.damage || 3, creature);
                    creature.lastDamageTime = now;
                }
                continue;
            }
            if (creature.state === 'fleeing') {
                const { dx: fdx, dy: fdy } = wrappedDelta(p.x, p.y, creature.x, creature.y);
                creature._moveAngle = Math.atan2(fdy, fdx);
                moveCreature(creature, creature.x + Math.cos(Math.atan2(fdy, fdx)) * creature.speed,
                                       creature.y + Math.sin(Math.atan2(fdy, fdx)) * creature.speed);
                continue;
            }

            // 休息中：偵測中斷條件
            if (creature.isResting) {
                const playerNear = !isSuperFriendly && distToPlayer < 150;
                let hostileNear = false;
                for (const h of gameState.hostileCreatures) {
                    if (h.hp <= 0) continue;
                    if (wrappedDistance(creature.x, creature.y, h.x, h.y) < 150) { hostileNear = true; break; }
                }
                if (playerNear || hostileNear || now >= (creature._restEndTime || 0)) {
                    creature.isResting = false;
                    creature.state = 'wandering';
                } else {
                    creature._moveAngle += (Math.random() - 0.5) * 0.05;
                    moveCreature(creature, creature.x + Math.cos(creature._moveAngle) * (creature._restSpeed || 0),
                                           creature.y + Math.sin(creature._moveAngle) * (creature._restSpeed || 0));
                    continue;
                }
            }

            // 行為切換計時器（5~15 秒）
            if (now >= (creature._nextBehaviorTime || 0)) {
                creature._nextBehaviorTime = now + 5000 + Math.random() * 10000;
                const roll = Math.random();
                if (roll < 0.2) {
                    // 切換為休息（20%，原 30%）
                    creature.isResting = true;
                    creature.state     = 'resting';
                    creature._restEndTime = now + 1500;
                    creature._restSpeed   = creature.speed * Math.random() * 0.3;
                } else if (roll < 0.8) {
                    // 探索果子（60%，原 30%）
                    creature._seekingFruit = true;
                }
                // 剩餘 20% 繼續漫遊（原 40%）
            }

            // 探索最近果子（範圍 800px）
            if (creature._seekingFruit) {
                let closest = null, closestDist = Infinity;
                for (const f of gameState.fruits) {
                    const d = wrappedDistance(creature.x, creature.y, f.x, f.y);
                    if (d < closestDist) { closestDist = d; closest = f; }
                }
                if (closest && closestDist < 800) {
                    const { dx: fdx, dy: fdy } = wrappedDelta(creature.x, creature.y, closest.x, closest.y);
                    creature._moveAngle = Math.atan2(fdy, fdx);
                    if (closestDist < creature.radius + 6) {
                        const idx = gameState.fruits.indexOf(closest);
                        if (idx !== -1) gameState.fruits.splice(idx, 1);
                        creature.fruitsEaten = (creature.fruitsEaten || 0) + 1;
                        creature.hp += 3; creature.maxHp += 3; creature.speed += 0.05;
                        // 吃滿5顆且地圖開啟巨人化特性 → 觸發巨人化（移除舊激進化邏輯）
                        const featureGiant = !!(gameState.currentMap && gameState.currentMap.features &&
                                                gameState.currentMap.features.giantization);
                        if (creature.fruitsEaten >= 5 && featureGiant) {
                            _triggerGiantization(creature);
                        }
                        // 吃到果子後的連吃機率：70%繼續找下一顆
                        // 附近500px有同族巨人化 → 提升到90%
                        let continueChance = 0.7;
                        if (_hasGiantizedNearby(creature, 500)) {
                            continueChance = 0.9;
                        }
                        if (Math.random() < continueChance) {
                            creature._fruitTarget = null; // 清空目標讓他找新的，_seekingFruit保持true
                        } else {
                            creature._seekingFruit = false;
                        }
                    }
                } else {
                    creature._seekingFruit = false;
                }
            }

            // 隊員跟隨隊長（有 packLeaderRef 時）
            if (creature.packLeaderRef) {
                if (creature.packLeaderRef.hp <= 0) {
                    creature.packLeaderRef = null; // 隊長死亡：脫隊
                } else {
                    const leader   = creature.packLeaderRef;
                    const dLeader  = wrappedDistance(creature.x, creature.y, leader.x, leader.y);
                    if (dLeader > 200) { // 超過200px才追隨
                        const { dx: ldx, dy: ldy } = wrappedDelta(creature.x, creature.y, leader.x, leader.y);
                        creature._moveAngle = Math.atan2(ldy, ldx);
                        moveCreature(creature, creature.x + Math.cos(creature._moveAngle) * creature.speed,
                                               creature.y + Math.sin(creature._moveAngle) * creature.speed);
                    }
                    continue;
                }
            }

            // 漫遊：每幀小幅偏移角度（模擬 Perlin Noise 平滑）
            creature._moveAngle = (creature._moveAngle || 0) + (Math.random() - 0.5) * 0.12;
            moveCreature(creature, creature.x + Math.cos(creature._moveAngle) * creature.speed,
                                   creature.y + Math.sin(creature._moveAngle) * creature.speed);
            continue;
        }

        // ── 非生態生物：舊邏輯（向後相容）───────────────────────
        if (distToPlayer < touchDist) {
            if (isFriendly)    { creature.state = 'idle'; }
            else if (isCalm)   { creature.state = creature.canFight ? 'fighting' : 'idle'; }
            else               { creature.state = creature.canFight ? 'fighting' : 'fleeing'; }
        } else if ((creature.state === 'fighting' || creature.state === 'fleeing') && distToPlayer > touchDist + 50) {
            creature.state = 'idle';
        } else if (isFriendly && (creature.state === 'fighting' || creature.state === 'fleeing')) {
            creature.state = 'idle';
        }
        if (creature.state === 'fighting') {
            if (now - creature.lastDamageTime >= 1000) { applyDamageToPlayer(3, creature); creature.lastDamageTime = now; }
            continue;
        }
        if (creature.state === 'fleeing') {
            const { dx: fdx, dy: fdy } = wrappedDelta(p.x, p.y, creature.x, creature.y);
            creature._moveAngle = Math.atan2(fdy, fdx);
            moveCreature(creature, creature.x + Math.cos(Math.atan2(fdy, fdx)) * creature.speed,
                                   creature.y + Math.sin(Math.atan2(fdy, fdx)) * creature.speed);
            continue;
        }
        if (creature.diet === 'herbivore' || creature.diet === 'omnivore') {
            let closestIdx = -1, closestDist = 80;
            for (let i = 0; i < gameState.fruits.length; i++) {
                const d = wrappedDistance(creature.x, creature.y, gameState.fruits[i].x, gameState.fruits[i].y);
                if (d < closestDist) { closestDist = d; closestIdx = i; }
            }
            if (closestIdx !== -1) {
                const fruit = gameState.fruits[closestIdx];
                const { dx: fdx, dy: fdy } = wrappedDelta(creature.x, creature.y, fruit.x, fruit.y);
                creature._moveAngle = Math.atan2(fdy, fdx);
                moveCreature(creature, creature.x + Math.cos(Math.atan2(fdy, fdx)) * creature.speed,
                                       creature.y + Math.sin(Math.atan2(fdy, fdx)) * creature.speed);
                if (closestDist < creature.radius + 6) {
                    gameState.fruits.splice(closestIdx, 1);
                    creature.fruitsEaten = (creature.fruitsEaten || 0) + 1;
                    creature.hp += 3; creature.maxHp = (creature.maxHp || 30) + 3; creature.speed += 0.15;
                    if (creature.fruitsEaten >= 5 && creature.diet !== 'aggressive') {
                        creature.diet = 'aggressive'; creature.damage = 8; creature.aggroRange = 120;
                    }
                }
                continue;
            }
        }
        if (!creature.wanderTarget || now - creature.lastWanderTime >= 3000) {
            creature.wanderTarget = { x: Math.random() * (MAP_WIDTH - 60) + 30, y: Math.random() * (MAP_HEIGHT - 60) + 30 };
            creature.lastWanderTime = now;
            creature.state = 'wandering';
        }
        if (creature.wanderTarget) {
            const { dx: wdx, dy: wdy } = wrappedDelta(creature.x, creature.y, creature.wanderTarget.x, creature.wanderTarget.y);
            const dist = Math.sqrt(wdx * wdx + wdy * wdy);
            if (dist < 2) { creature.wanderTarget = null; creature.state = 'idle'; }
            else { moveCreature(creature, creature.x + Math.cos(Math.atan2(wdy, wdx)) * creature.speed, creature.y + Math.sin(Math.atan2(wdy, wdx)) * creature.speed); }
        }
    }
}

function drawNeutralCreatures() {
    for (const creature of gameState.neutralCreatures) {
        if (creature.hp <= 0) continue;
        const s = worldToScreen(creature.x, creature.y);
        if (s.x < -50 || s.x > VIEW_W + 50 || s.y < -50 || s.y > VIEW_H + 50) continue;

        // ── 使用物種固定顏色 + 獨立體型繪製 ──
        if (creature.speciesId) {
            // 生態生物：固定顏色 + 獨立體型（箭頭在 drawCreatureShape 內呼叫）
            drawCreatureShape(ctx, creature, s.x, s.y);
        } else {
            // 非生態生物（舊邏輯 fallback）：地形染色 + 圓形
            const nBiome = getBiome(creature.x, creature.y);
            let baseC, aggrC, fleeC, fightC;
            if (nBiome === 'ocean') {
                baseC = '#4499CC'; aggrC = '#224488'; fleeC = '#88CCFF'; fightC = '#336699';
            } else if (nBiome === 'desert') {
                baseC = '#CC9944'; aggrC = '#884422'; fleeC = '#FFCC44'; fightC = '#AA6622';
            } else {
                baseC = 'orange'; aggrC = '#CC4400'; fleeC = 'yellow'; fightC = '#CC5500';
            }
            let color = baseC;
            if (creature.isAlpha)                    color = '#FFD700';
            else if (creature.isGiantized)           color = '#FF8800';
            else if (creature.diet === 'aggressive') color = aggrC;
            else if (creature.state === 'fleeing')   color = fleeC;
            else if (creature.state === 'fighting')  color = fightC;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(s.x, s.y, creature.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        // ── 血條（名字在上、血條緊貼本體上緣）──
        const barW = 20, barH = 4;
        const barX = s.x - barW / 2;
        const barY = s.y - creature.radius - 8;
        ctx.fillStyle = '#555';
        ctx.fillRect(barX, barY, barW, barH);
        ctx.fillStyle = '#00CC00';
        ctx.fillRect(barX, barY, barW * (creature.hp / (creature.maxHp || 30)), barH);

        const displayName = creature.isAlpha     ? (creature.name || '') + '（Alpha）'
                          : creature.isGiantized ? (creature.name || '') + '（巨人化）'
                          : (creature.name || '');
        if (displayName) {
            ctx.save();
            ctx.shadowColor = '#000'; ctx.shadowBlur = 3;
            ctx.fillStyle = creature.isAlpha ? '#FFD700' : '#FFFFFF';
            ctx.font = creature.isGiantized ? 'bold 13px Arial' : '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(displayName, s.x, s.y - creature.radius - 10);
            ctx.restore();
        }
    }
}

function updateHostileCreatures() {
    const now = Date.now();
    const p = gameState.player;

    // 清除超過 60 秒的屍體
    gameState.corpses = gameState.corpses.filter(c => now - c.spawnTime < 60000);

    for (const creature of gameState.hostileCreatures) {
        if (creature.hp <= 0) continue;
        if (creature.stunnedUntil && now < creature.stunnedUntil) continue;

        // ── 生態區追蹤 + 鬣狗組隊更新 ──
        if (creature.biome) {
            if (_isInHomeBiome(creature)) {
                creature._leftBiomeTime = null;
            } else {
                if (!creature._leftBiomeTime) creature._leftBiomeTime = now;
            }
            if (creature.speciesId === 'hyena') _updateHyenaPack(creature);
        }

        // ── 殺手化：每5秒回復1% maxHP ──────────────────────────────
        if (creature.isKiller) {
            if (now - (creature.killerRegenTimer || 0) >= 5000) {
                creature.killerRegenTimer = now;
                creature.hp = Math.min(creature.maxHp, creature.hp + creature.maxHp * 0.01);
            }
        }

        // ── 肉系吃屍體（僅普通地圖 hostileEatMeat 開啟）──────────
        const featureEatMeat = !!(gameState.currentMap && gameState.currentMap.features &&
                                  gameState.currentMap.features.hostileEatMeat);
        if (featureEatMeat && creature.diet === 'carnivore') {
            if (creature.state === 'eating') {
                // 吃屍體期間 aggroRange×1.5，有生物進入則中斷
                const tempAggro = (creature.eatBaseAggroRange || creature.aggroRange) * 1.5;
                let interrupted = false;
                if (wrappedDistance(creature.x, creature.y, gameState.player.x, gameState.player.y) < tempAggro) interrupted = true;
                if (!interrupted) {
                    for (const n of gameState.neutralCreatures) {
                        if (n.hp <= 0) continue;
                        if (wrappedDistance(creature.x, creature.y, n.x, n.y) < tempAggro) { interrupted = true; break; }
                    }
                }
                if (interrupted) {
                    // 中斷：進度重置，進入巡邏
                    creature.state = 'patrolling';
                    creature.eatTickTimer = 0;
                    creature.eatTicks = 0;
                    creature.eatTarget = null;
                    // 繼續執行下方追擊邏輯
                } else {
                    // 每0.5秒一tick，6 ticks（3秒）完成一具屍體
                    creature.eatTickTimer = (creature.eatTickTimer || 0) + FIXED_DELTA;
                    while (creature.eatTickTimer >= 500) {
                        creature.eatTickTimer -= 500;
                        creature.eatTicks = (creature.eatTicks || 0) + 1;
                        if (creature.eatTicks >= 6) {
                            // 吃完：移除屍體 + 呼叫成長
                            const corpseIdx = gameState.corpses.indexOf(creature.eatTarget);
                            if (corpseIdx !== -1) gameState.corpses.splice(corpseIdx, 1);
                            if (creature.eatTarget) _carnivoreEatCorpse(creature, creature.eatTarget);
                            creature.state = 'patrolling';
                            creature.eatTickTimer = 0;
                            creature.eatTicks = 0;
                            creature.eatTarget = null;
                            break;
                        }
                    }
                    if (creature.state === 'eating') continue; // 仍在吃，跳過其他邏輯
                }
            } else if (creature.state !== 'chasing') {
                // 漫遊/休息時：偵測60px內的屍體
                let closestCorpse = null, closestCorpseDist = 60;
                for (const corpse of gameState.corpses) {
                    const d = wrappedDistance(creature.x, creature.y, corpse.x, corpse.y);
                    if (d < closestCorpseDist) { closestCorpseDist = d; closestCorpse = corpse; }
                }
                if (closestCorpse) {
                    creature.state = 'eating';
                    creature.eatTarget = closestCorpse;
                    creature.eatTickTimer = 0;
                    creature.eatTicks = 0;
                    creature.eatBaseAggroRange = creature.aggroRange;
                    continue; // 進入吃屍體，跳過其他邏輯
                }
            }
        }

        // 尋找最近目標（玩家 > 中立生物）
        let bestTarget = null;
        let bestDist = Infinity;
        let bestType = null;

        const effectiveAggroRange = Math.max(60, creature.aggroRange - p.aggroRangeReduction);
        const distToPlayer = wrappedDistance(creature.x, creature.y, p.x, p.y);
        if (distToPlayer < effectiveAggroRange) {
            bestTarget = p;
            bestDist = distToPlayer;
            bestType = 'player';
        }

        for (const neutral of gameState.neutralCreatures) {
            if (neutral.hp <= 0) continue;
            const d = wrappedDistance(creature.x, creature.y, neutral.x, neutral.y);
            if (d < effectiveAggroRange && d < bestDist) {
                bestTarget = neutral;
                bestDist = d;
                bestType = 'neutral';
            }
        }

        // 評估是否需要逃離巨人（目標為巨人化/Alpha時）
        if (bestTarget && (bestTarget.isGiantized || bestTarget.isAlpha)) {
            if (_shouldFleeFromGiant(creature, bestTarget)) {
                creature.state          = 'fleeing_giant';
                creature._fleeGiantTimer = now;
                creature.target         = null;
                creature.targetType     = null;
                bestTarget              = null;
            }
        }

        // 狀態切換
        if (bestTarget !== null) {
            creature.state = 'chasing';
            creature.target = bestTarget;
            creature.targetType = bestType;
            // 鬣狗：警報同組出動
            if (creature.speciesId === 'hyena') _alertHyenaPack(creature, bestTarget);
        } else if (creature.state === 'chasing') {
            const t = creature.target;
            const d = t ? wrappedDistance(creature.x, creature.y, t.x, t.y) : Infinity;
            if (!t || t.hp <= 0 || d > effectiveAggroRange + 200) {
                creature.state = 'patrolling';
                creature.target = null;
                creature.targetType = null;
            }
        }

        // ── 逃離巨人狀態 ──
        if (creature.state === 'fleeing_giant') {
            // 往離最近巨人的反方向跑
            let nearestGiant = null, nearestGiantDist = Infinity;
            for (const n of gameState.neutralCreatures) {
                if (!n.isGiantized || n.hp <= 0) continue;
                const d = wrappedDistance(creature.x, creature.y, n.x, n.y);
                if (d < nearestGiantDist) { nearestGiantDist = d; nearestGiant = n; }
            }
            if (nearestGiant) {
                const { dx: fdx, dy: fdy } = wrappedDelta(nearestGiant.x, nearestGiant.y, creature.x, creature.y);
                creature._moveAngle = Math.atan2(fdy, fdx);
                moveCreature(creature, creature.x + Math.cos(creature._moveAngle) * creature.speed,
                                       creature.y + Math.sin(creature._moveAngle) * creature.speed);
            }
            // 3秒後：切換為尋找落單草食性（非巨人化）
            if (now - (creature._fleeGiantTimer || 0) >= 3000) {
                creature.state      = 'patrolling';
                creature._seekingPrey   = true;
                creature._seekNonGiant  = true;
            }
            continue;
        }

        // 追擊與攻擊
        if (creature.state === 'chasing' && creature.target) {
            const t = creature.target;
            const { dx, dy } = wrappedDelta(creature.x, creature.y, t.x, t.y);
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist <= creature.attackRange) {
                if (now - creature.attackCooldown >= 1000) {
                    if (creature.targetType === 'player') {
                        let dmg = creature.damage;
                        if (creature.speciesId === 'lynx') {
                            _applyLynxBiomeBonus(creature);
                            if (Math.random() < (creature._critChance || 0)) {
                                dmg = creature.baseDamage * (creature._critMult || 1.0);
                                showFloatingText(p.x, p.y - 30, creature._critText || '暴擊！', '#FF4400');
                                p._lynxSlowUntil = now + (creature._critSlowDur || 0);
                                p._lynxSlowAmt   = creature._critSlowAmt || 0;
                            }
                        } else if (creature.speciesId === 'croc') {
                            _applyCrocBiomeBonus(creature);
                            dmg = creature.damage * (creature._biomeAtkMult || 1.0);
                            if (Math.random() < (creature._deathRollChance || 0)) {
                                showFloatingText(p.x, p.y - 30, '死亡翻滾！！', '#FF6600');
                                p._stunUntil = now + 1000;
                            }
                        } else if (creature.speciesId === 'hyena') {
                            _applyHyenaBiomeBonus(creature);
                            dmg = creature.damage * (creature._finalAtkMult || 1.0);
                        }
                        applyDamageToPlayer(dmg, creature);
                    } else if (creature.targetType === 'neutral') {
                        creature.target.hp -= creature.damage;
                        if (creature.target.hp <= 0) {
                            const deadNeutral = creature.target;
                            // 清理巨人化/Alpha相關狀態
                            if (deadNeutral.isGiantized) {
                                if (deadNeutral.isAlpha && gameState.alphaCreature === deadNeutral) {
                                    gameState.alphaCreature = null;
                                }
                                if (deadNeutral.packMembers) {
                                    for (const pm of deadNeutral.packMembers) pm.packLeaderRef = null;
                                }
                                if (gameState.topBarTarget === deadNeutral) {
                                    gameState.topBarTarget = null;
                                    gameState.topBarFadeTimer = 0;
                                }
                            }
                            gameState.corpses.push({
                                x: deadNeutral.x, y: deadNeutral.y,
                                radius: deadNeutral.radius, spawnTime: now
                            });
                            // 擊殺後回到巡邏狀態
                            creature.state = 'patrolling';
                            creature.target = null;
                            creature.targetType = null;
                        }
                    }
                    creature.attackCooldown = now;
                }
            } else {
                const angle = Math.atan2(dy, dx);
                creature._moveAngle = angle;
                // 物種移動速度加成（生態區）
                let chaseSpeed = creature.speed;
                if (creature.speciesId === 'lynx') {
                    _applyLynxBiomeBonus(creature);
                    chaseSpeed = creature.speed * (creature._biomeSpeedMult || 1.0);
                } else if (creature.speciesId === 'croc') {
                    _applyCrocBiomeBonus(creature);
                    chaseSpeed = creature.speed * (creature._biomeSpeedMult || 1.0);
                } else if (creature.speciesId === 'hyena') {
                    _applyHyenaBiomeBonus(creature);
                    chaseSpeed = creature.speed * (creature._finalSpeedMult || 1.0);
                }
                moveCreature(creature, creature.x + Math.cos(angle) * chaseSpeed, creature.y + Math.sin(angle) * chaseSpeed);
            }
            continue;
        }

        // ── 生態肉系生物三態移動 ──────────────────────────────────
        if (creature.biome) {
            // 行為切換計時器（5~15 秒）
            if (now >= (creature._nextBehaviorTime || 0)) {
                creature._nextBehaviorTime = now + 5000 + Math.random() * 10000;
                const roll = Math.random();
                if (roll < 0.3) {
                    creature.isResting    = true;
                    creature._restEndTime = now + 1500;
                    creature._restSpeed   = creature.speed * Math.random() * 0.3;
                } else if (roll < 0.6) {
                    creature._seekingPrey = true; // 切換為探索最近草系生物
                }
            }

            // 休息中（有目標時立即中斷）
            if (creature.isResting) {
                if (creature.state === 'chasing' || now >= (creature._restEndTime || 0)) {
                    creature.isResting = false;
                } else {
                    creature._moveAngle = (creature._moveAngle || 0) + (Math.random() - 0.5) * 0.05;
                    moveCreature(creature, creature.x + Math.cos(creature._moveAngle) * (creature._restSpeed || 0),
                                           creature.y + Math.sin(creature._moveAngle) * (creature._restSpeed || 0));
                    continue;
                }
            }

            // 探索最近草系生物（範圍 500px）
            if (creature._seekingPrey) {
                let closest = null, closestDist = Infinity;
                for (const n of gameState.neutralCreatures) {
                    if (n.hp <= 0) continue;
                    // 逃離巨人後尋找獵物：跳過巨人化個體
                    if (creature._seekNonGiant && n.isGiantized) continue;
                    const d = wrappedDistance(creature.x, creature.y, n.x, n.y);
                    if (d < closestDist) { closestDist = d; closest = n; }
                }
                if (closest && closestDist < 500) {
                    const { dx, dy } = wrappedDelta(creature.x, creature.y, closest.x, closest.y);
                    creature._moveAngle = Math.atan2(dy, dx);
                    if (closestDist < creature.radius + closest.radius + 5) {
                        creature._seekingPrey = false;
                        creature._seekNonGiant = false;
                    }
                } else {
                    creature._seekingPrey  = false;
                    creature._seekNonGiant = false;
                }
            }

            // 不在生態區：朝生態區方向回歸（1.3倍速）
            if (!_isInHomeBiome(creature)) {
                if (!creature._leftBiomeTime) creature._leftBiomeTime = now;
                if (!creature._returnTarget || now - (creature._returnTargetTime || 0) > 2000) {
                    creature._returnTarget     = _findNearestBiomePoint(creature.biome, creature.x, creature.y);
                    creature._returnTargetTime = now;
                }
                if (creature._returnTarget) {
                    const { dx: rdx, dy: rdy } = wrappedDelta(creature.x, creature.y, creature._returnTarget.x, creature._returnTarget.y);
                    creature._moveAngle = Math.atan2(rdy, rdx);
                }
                moveCreature(creature, creature.x + Math.cos(creature._moveAngle) * creature.speed * 1.3,
                                       creature.y + Math.sin(creature._moveAngle) * creature.speed * 1.3);
                continue;
            } else {
                // 回到生態區：清除計時
                if (creature._leftBiomeTime) {
                    creature._leftBiomeTime    = null;
                    creature._returnTarget     = null;
                    creature._returnTargetTime = null;
                }
            }

            // 漫遊：每幀小幅偏移角度（模擬 Perlin Noise 平滑）
            creature._moveAngle = (creature._moveAngle || 0) + (Math.random() - 0.5) * 0.12;
            // 物種漫遊速度加成
            let wanderSpeed = creature.speed;
            if (creature.speciesId === 'lynx') {
                _applyLynxBiomeBonus(creature);
                wanderSpeed = creature.speed * (creature._biomeSpeedMult || 1.0);
            } else if (creature.speciesId === 'croc') {
                _applyCrocBiomeBonus(creature);
                wanderSpeed = creature.speed * (creature._biomeSpeedMult || 1.0);
            } else if (creature.speciesId === 'hyena') {
                _applyHyenaBiomeBonus(creature);
                wanderSpeed = creature.speed * (creature._finalSpeedMult || 1.0);
            }
            moveCreature(creature, creature.x + Math.cos(creature._moveAngle) * wanderSpeed,
                                   creature.y + Math.sin(creature._moveAngle) * wanderSpeed);
            continue;
        }

        // ── 非生態生物：舊巡邏邏輯（向後相容）──────────────────
        if (!creature.wanderTarget || now - creature.lastWanderTime >= 2000) {
            creature.wanderTarget = { x: Math.random() * (MAP_WIDTH - 60) + 30, y: Math.random() * (MAP_HEIGHT - 60) + 30 };
            creature.lastWanderTime = now;
        }
        if (creature.wanderTarget) {
            const { dx: wdx, dy: wdy } = wrappedDelta(creature.x, creature.y, creature.wanderTarget.x, creature.wanderTarget.y);
            const dist = Math.sqrt(wdx * wdx + wdy * wdy);
            if (dist < 2) { creature.wanderTarget = null; }
            else { moveCreature(creature, creature.x + Math.cos(Math.atan2(wdy, wdx)) * creature.speed, creature.y + Math.sin(Math.atan2(wdy, wdx)) * creature.speed); }
        }
    }
}

function drawCorpses() {
    for (const corpse of gameState.corpses) {
        const s = worldToScreen(corpse.x, corpse.y);
        if (s.x < -50 || s.x > VIEW_W + 50 || s.y < -50 || s.y > VIEW_H + 50) continue;
        ctx.fillStyle = '#888';
        ctx.beginPath();
        ctx.arc(s.x, s.y, corpse.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawHostileCreatures() {
    for (const creature of gameState.hostileCreatures) {
        if (creature.hp <= 0) continue;
        const s = worldToScreen(creature.x, creature.y);
        if (s.x < -50 || s.x > VIEW_W + 50 || s.y < -50 || s.y > VIEW_H + 50) continue;

        // ── 使用物種固定顏色 + 獨立體型繪製 ──
        if (creature.speciesId) {
            // 生態生物：固定顏色 + 獨立體型（光暈和箭頭在 drawCreatureShape 內呼叫）
            drawCreatureShape(ctx, creature, s.x, s.y);
        } else {
            // 非生態生物（舊邏輯 fallback）：地形染色 + 圓形
            const hBiome    = getBiome(creature.x, creature.y);
            const hNormalC  = hBiome === 'ocean' ? '#CC4466' : (hBiome === 'desert' ? '#CC8800' : 'red');
            const hChasingC = hBiome === 'ocean' ? '#882244' : (hBiome === 'desert' ? '#885500' : '#8B0000');
            ctx.fillStyle   = creature.state === 'chasing' ? hChasingC : hNormalC;
            ctx.beginPath();
            ctx.arc(s.x, s.y, creature.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        // ── 血條 ──
        const barW = 20, barH = 4;
        const barX = s.x - barW / 2;
        const barY = s.y - creature.radius - 8;
        ctx.fillStyle = '#550000';
        ctx.fillRect(barX, barY, barW, barH);
        ctx.fillStyle = '#00CC00';
        ctx.fillRect(barX, barY, barW * (creature.hp / (creature.maxHp || 50)), barH);

        const hostileDisplayName = _getCreatureDisplayName(creature);
        if (hostileDisplayName) {
            ctx.save();
            ctx.shadowColor = '#000'; ctx.shadowBlur = 3;
            ctx.fillStyle   = creature.isKiller ? '#FF8800' : '#FFFFFF';
            ctx.font        = creature.isKiller  ? 'bold 12px Arial' : '12px Arial';
            ctx.textAlign   = 'center';
            ctx.fillText(hostileDisplayName, s.x, s.y - creature.radius - 10);
            ctx.restore();
        }
    }
}
