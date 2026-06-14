// =============================================================
// 生物系統 - drawCreatureShape
//            updateNeutralCreatures / drawNeutralCreatures
//            updateHostileCreatures / drawCorpses / drawHostileCreatures
// =============================================================

// ── 隊伍名稱池 ──────────────────────────────────────────────
import { gameState, ctx } from './gameState.js';
import { MAP_WIDTH, MAP_HEIGHT, VIEW_W, VIEW_H, getBiome } from './map.js';
import { worldToScreen, wrappedDistance, wrappedDelta } from './camera.js';
import { FIXED_DELTA } from '../config/gameConfig.js';
import { moveCreature } from './spawning.js';
import { applyDamageToPlayer, handleKill, showFloatingText } from './combat.js';
import { applyTenacity, getGameFont } from './utils.js';
import { showAlphaAnnouncement } from './ui.js';
import { t } from '../lang.js';

const _PACK_NAMES = [
    'SK-Tea','T-One','Fanatic','CloudNein','NaBee','Phase','Gee2','100Teas','TXM','Senn',
    'Noisy','D-Rex','Zen.G','BurgerLG','WeeboG','NuJeans','AE-Spa','THRICE','Ivy',
    'LES SERAPH','MamaMooMoo','DarkPink','Itz-G','Stacy','I-Lit','HypeUp'
];
export let _usedPackNames = [];

export function resetPackNames() { _usedPackNames = []; }

// ── 鬣狗隊伍名稱池（三國武將）──────────────────────────────
const _HYENA_PACK_NAMES = [
    '曹操','劉備','關羽','張飛','趙雲','諸葛亮','孫權','周瑜',
    '呂布','黃忠','馬超','司馬懿','夏侯惇','典韋','魏延','姜維',
    '陸遜','甘寧','太史慈','張遼'
];
export let _usedHyenaPackNames = [];
export let _hyenaPackNameMap = {};

export function resetHyenaPackNames() {
    _usedHyenaPackNames = [];
    _hyenaPackNameMap = {};
}

const HYENA_PACK_MERGE_RANGE = 300;
const HYENA_PACK_KEEP_RANGE = 800;
const HYENA_PACK_LEAVE_GRACE = 3000;
const HYENA_PACK_LIMIT = 20;
const HYENA_ATTACK_TURN_CD = 600;
const CREATURE_NAME_FONT_SIZE = 12;
const CREATURE_TEAM_FONT_SIZE = 6;

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

function _drawCenteredCreatureText(text, x, y, font, fillStyle, lineWidth) {
    ctx.save();
    if (ctx.setTransform) ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.font = font;
    ctx.fillStyle = fillStyle;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.direction = 'ltr';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(0,0,0,0.85)';
    ctx.lineWidth = lineWidth;
    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
    ctx.restore();
}

// ── 嘴器減速：取生物有效速度（被減速中則乘以 _slowMult）────────
export function _effSpeed(c, now = Date.now()) {
    return (c._slowUntil && now < c._slowUntil) ? c.speed * (c._slowMult || 1.0) : c.speed;
}

// ── 特殊狀態光暈（不跟著旋轉，以世界座標繪製）───────────────
function _drawCreatureGlow(ctx, creature, sx, sy) {
    const zoom = gameState.cameraZoom || 1;
    let glowColor  = null;
    let glowRadius = creature.radius * zoom + 4;

    if (creature.isAlpha) {
        glowColor  = CREATURE_COLORS.alpha;
        glowRadius = creature.radius * zoom + 6;
    } else if (creature.isGiantized) {
        glowColor  = CREATURE_COLORS.giantized;
        glowRadius = creature.radius * zoom + 4;
    } else if (creature.isKiller) {
        const lv = creature.killerLevel || 0;
        const t  = Math.min(lv / 10, 1.0);
        const rv = Math.round(204 - t * 102);
        const gv = Math.round(34  - t * 34);
        glowColor  = `rgb(${rv},${gv},0)`;
        glowRadius = creature.radius * zoom + 2;
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

// 駝鹿（moose）— 橢圓身體 + 頭部圓 + 鹿角從頭部往 ±y 兩側展開（完整旋轉）
// 旋轉後：移動方向兩側各一組鹿角，正確左右對稱
function _drawMoose(ctx, r) {
    // 身體橢圓
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.1, r * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();

    // 頭部小圓（前方 +x）
    ctx.beginPath();
    ctx.arc(r * 1.3, 0, r * 0.42, 0, Math.PI * 2);
    ctx.fill();

    // 鹿角（從頭部往 ±y 兩側展開，旋轉後變成移動方向的兩側）
    ctx.strokeStyle = ctx.fillStyle;
    ctx.lineWidth   = r * 0.18;
    ctx.lineCap     = 'round';

    // ── 上側鹿角（-y 方向）──
    ctx.beginPath();
    ctx.moveTo(r * 1.3,  0);
    ctx.lineTo(r * 1.3, -r * 1.1);   // 主枝
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(r * 1.3, -r * 0.55);
    ctx.lineTo(r * 1.85, -r * 0.9);  // 往後分叉
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(r * 1.3, -r * 0.55);
    ctx.lineTo(r * 0.75, -r * 0.9);  // 往前分叉
    ctx.stroke();

    // ── 下側鹿角（+y 方向，鏡像對稱）──
    ctx.beginPath();
    ctx.moveTo(r * 1.3,  0);
    ctx.lineTo(r * 1.3,  r * 1.1);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(r * 1.3,  r * 0.55);
    ctx.lineTo(r * 1.85, r * 0.9);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(r * 1.3,  r * 0.55);
    ctx.lineTo(r * 0.75, r * 0.9);
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

// 猞猁（lynx）— 正立貓形：圓頭 + 三角耳 + 三角身體 + 彎尾（只左右翻轉）
// 頭在上（-y），身體往下（+y），尾巴預設往右翹，scale(-1,1) 後自動翻左
function _drawLynx(ctx, r) {
    // 身體：圓潤三角（正立，底邊在下）
    ctx.beginPath();
    ctx.moveTo(0,        -r * 0.35);   // 頂點（頸部）
    ctx.lineTo(-r * 0.9,  r * 1.05);  // 左下腳
    ctx.lineTo( r * 0.9,  r * 1.05);  // 右下腳
    ctx.closePath();
    ctx.fill();

    // 頭部圓形（上方）
    ctx.beginPath();
    ctx.arc(0, -r * 0.85, r * 0.52, 0, Math.PI * 2);
    ctx.fill();

    // 左耳三角
    ctx.beginPath();
    ctx.moveTo(-r * 0.52, -r * 1.28);
    ctx.lineTo(-r * 0.68, -r * 1.75);
    ctx.lineTo(-r * 0.1,  -r * 1.35);
    ctx.closePath();
    ctx.fill();

    // 右耳三角
    ctx.beginPath();
    ctx.moveTo( r * 0.52, -r * 1.28);
    ctx.lineTo( r * 0.68, -r * 1.75);
    ctx.lineTo( r * 0.1,  -r * 1.35);
    ctx.closePath();
    ctx.fill();

    // 彎尾（左側 -x，預設尾在後方；scale(-1,1) 後自動換到右側）
    ctx.strokeStyle = CREATURE_COLORS.lynx;
    ctx.lineWidth   = r * 0.22;
    ctx.lineCap     = 'round';
    ctx.beginPath();
    ctx.moveTo(-r * 0.8, r * 0.75);
    ctx.quadraticCurveTo(-r * 1.55, r * 0.25, -r * 1.3, -r * 0.55);
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
export function drawCreatureShape(ctx, creature, sx, sy) {
    const r     = creature.radius * (gameState.cameraZoom || 1);
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

/**
 * ═══════════════════════════════════════════════════════
 * 肉食怪數值成長公式（v0.1.16.x 統一版）
 * ═══════════════════════════════════════════════════════
 *
 * 【第一層】生成時計算，只算一次，存入 scaledBase：
 *   scaledBaseHp     = baseHp     × hpMultiplier     × pow(1.2, nightNum)
 *   scaledBaseDamage = baseDamage × damageMultiplier × pow(1.2, nightNum)
 *   scaledBaseSpeed  = baseSpeed  × speedMultiplier  × pow(1.1, nightNum)
 *   → 儲存在 creature.scaledBaseHp / scaledBaseDamage / scaledBaseSpeed
 *
 * 【第二層】動態成長，每次吃屍體後重算：
 *   corpseMult = 1 + corpseEaten × 0.1
 *
 * 【第三層】殺手化額外 HP bonus（isKiller 後永久生效）：
 *   killerHpBonus = isKiller ? 0.5 : 0
 *
 * 【最終公式】（所有時間點統一使用）：
 *   maxHp  = scaledBaseHp     × (corpseMult + killerHpBonus)
 *   damage = scaledBaseDamage × corpseMult
 *   speed  = scaledBaseSpeed  × corpseMult
 *   radius = baseRadius       × corpseMult
 *
 * 【驗算 — 困難模式 Night 0，scaledBaseHp = 125】：
 *   0 屍        → HP 125
 *   4 屍        → HP 175
 *   5 屍（殺手）→ HP 250   (125 × 2.0)
 *   6 屍（殺手後）→ HP 262.5 (125 × 2.1)
 *
 * 【禁止事項】：
 *   - 不得在 _triggerKiller() 直接賦值 maxHp / damage / speed
 *   - 不得讓 killerCorpseEaten 參與數值成長計算
 *   - 不得在任何地方用 baseHp × hpMultiplier 重算（只有生成時才算）
 * ═══════════════════════════════════════════════════════
 */
function _carnivoreEatCorpse(creature, corpse) {
    creature.corpseEaten++;

    // 先觸發殺手化，使 isKiller 在本次統一公式中即刻生效
    if (!creature.isKiller &&
        creature.corpseEaten >= 5 &&
        gameState.currentMap && gameState.currentMap.features &&
        gameState.currentMap.features.killer) {
        _triggerKiller(creature);
    }

    // 【統一公式】
    const corpseMult    = 1 + creature.corpseEaten * 0.1;
    const killerHpBonus = creature.isKiller ? 0.5 : 0;

    creature.maxHp  = (creature.scaledBaseHp     || creature.baseHp)     * (corpseMult + killerHpBonus);
    creature.damage = (creature.scaledBaseDamage || creature.baseDamage) * corpseMult;
    creature.speed  = (creature.scaledBaseSpeed  || creature.baseSpeed)  * corpseMult;
    creature.radius = creature.baseRadius * corpseMult;
    creature.hp     = Math.min(creature.hp + creature.maxHp * 0.05, creature.maxHp);

    // killerCorpseEaten 計數追蹤（不參與數值計算）
    if (creature.isKiller) {
        creature.killerCorpseEaten++;
        creature.killerLevel = (creature.killerLevel || 0) + 1;
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
// maxHp / damage / speed 由 _carnivoreEatCorpse 統一公式重算，此處不覆蓋
function _triggerKiller(creature) {
    creature.isKiller          = true;
    creature.killerLevel       = 0;
    creature.killerCorpseEaten = 0;
    creature.aggroRange        = creature.aggroRange * 2;
    creature.killerRegenTimer  = 0;
}

function _triggerGiantization(creature) {
    const prevMaxHp = creature.maxHp || 30;

    creature.isGiantized      = true;
    creature.damage           = (creature.damage || 0) + 20;
    creature.maxHp            = prevMaxHp * 10;
    creature.hp               = creature.maxHp;
    creature.radius           = creature.radius * 1.5;
    creature.aggroRange       = 400;
    creature.guardianRange    = 500;
    creature.diet             = 'herbivore';
    creature.canFight         = true;
    creature.fruitsEaten      = 0;
    creature.giantRegenTimer  = 0;
    creature.packLeaderRef    = null;
    creature._fruitTarget     = null;
    creature._fruitTargetTimer = 0;
    creature._seekingFruit    = false;
}

function _triggerAlpha(creature) {
    creature.isAlpha          = true;
    creature.damage           = creature.damage * 2;
    creature.maxHp            = creature.maxHp * 3;
    creature.hp               = creature.maxHp;
    creature.radius           = creature.radius * 1.5;
    creature.aggroRange       = 600;
    creature.guardianRange    = 1500;
    creature.packFollowRange  = 1500;
    creature.giantRegenRate   = 0.02;
    gameState.alphaCreature   = creature;
    showAlphaAnnouncement(creature.name);
}

// ── GuardianRange：巨人/Alpha 保護同族草食性 ──
function _checkGuardianRange(giant) {
    const now = Date.now();
    if (now - (giant._guardianCheckTimer || 0) < 200) return;
    giant._guardianCheckTimer = now;
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
                // 殺手在巨人 guardianRange 以外時，不觸發保護（悄悄獵殺機制）
                if (hostile.isKiller && wrappedDistance(giant.x, giant.y, hostile.x, hostile.y) > (giant.guardianRange || 500)) {
                    continue;
                }
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
            creature.x + Math.cos(creature._moveAngle) * _effSpeed(creature),
            creature.y + Math.sin(creature._moveAngle) * _effSpeed(creature));

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
export function _getCreatureDisplayName(creature) {
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
export function _shouldFleeFromGiant(creature, target) {
    // 殺手化：使用獨立戰術邏輯，此函式直接返回 false
    if (creature.isKiller) return false;
    // 非殺手：Alpha 一律逃，普通巨人 HP > 肉食者 HP × 3 才逃
    if (target.isAlpha) return true;
    return target.hp > creature.hp * 3;
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
        lynx._critText    = t('lynxCritText');
    } else {
        lynx._critChance  = 0.25;
        lynx._critMult    = 1.5;
        lynx._critSlowAmt = 0.15;
        lynx._critSlowDur = 1500;
        lynx._critText    = t('lynxCritText');
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
function _updateHyenaPackLegacy(hyena) {
    const now = Date.now();
    if (now - (hyena._packScanTimer || 0) < 2000) return;
    hyena._packScanTimer = now;
    // 首次分配隊伍名稱
    if (hyena.packGroup && !_hyenaPackNameMap[hyena.packGroup]) {
        const available = _HYENA_PACK_NAMES.filter(n => !_usedHyenaPackNames.includes(n));
        const pool = available.length > 0 ? available : _HYENA_PACK_NAMES;
        const name = pool[Math.floor(Math.random() * pool.length)];
        _usedHyenaPackNames.push(name);
        _hyenaPackNameMap[hyena.packGroup] = name;
    }
    if (hyena.packGroup) hyena.packName = _hyenaPackNameMap[hyena.packGroup];
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

function _assignHyenaPackName() {
    const available = _HYENA_PACK_NAMES.filter(n => !_usedHyenaPackNames.includes(n));
    const pool = available.length > 0 ? available : _HYENA_PACK_NAMES;
    const name = pool[Math.floor(Math.random() * pool.length)];
    _usedHyenaPackNames.push(name);
    _hyenaPackNameMap[name] = true;
    return name;
}

function _hyenaPackMembers(hyena) {
    if (!hyena.packName) return [hyena];
    return gameState.hostileCreatures.filter(c =>
        c.speciesId === 'hyena' &&
        c.hp > 0 &&
        c.packGroup === hyena.packGroup &&
        c.biome === hyena.biome &&
        c.packName === hyena.packName
    );
}

function _trimHyenaPack(pack) {
    if (pack.length <= HYENA_PACK_LIMIT) return;
    const anchor = pack[0];
    pack.sort((a, b) => wrappedDistance(anchor.x, anchor.y, a.x, a.y) - wrappedDistance(anchor.x, anchor.y, b.x, b.y));
    for (let i = HYENA_PACK_LIMIT; i < pack.length; i++) {
        pack[i].packName = null;
        pack[i].packMates = [];
        pack[i]._attackTurn = false;
        pack[i]._packOutOfRangeSince = null;
        pack[i]._returnToPackTarget = null;
    }
}

function _nearestHyenaPackMate(hyena) {
    if (!hyena.packName) return null;
    let nearest = null;
    let nearestDist = Infinity;
    for (const mate of _hyenaPackMembers(hyena)) {
        if (mate === hyena || mate.hp <= 0) continue;
        const d = wrappedDistance(hyena.x, hyena.y, mate.x, mate.y);
        if (d < nearestDist) {
            nearest = mate;
            nearestDist = d;
        }
    }
    return nearest ? { mate: nearest, dist: nearestDist } : null;
}

// 鬣狗組隊掃描：出生只帶 packGroup，實際碰面才合併成隊
function _updateHyenaPack(hyena) {
    if (!hyena.packGroup) return;

    let closeMate = null;
    for (const other of gameState.hostileCreatures) {
        if (other === hyena || other.hp <= 0) continue;
        if (other.speciesId !== 'hyena') continue;
        if (other.packGroup !== hyena.packGroup) continue;
        if (other.biome !== hyena.biome) continue;
        if (wrappedDistance(hyena.x, hyena.y, other.x, other.y) <= HYENA_PACK_MERGE_RANGE) {
            closeMate = other;
            break;
        }
    }

    if (closeMate) {
        const sharedName = hyena.packName || closeMate.packName || _assignHyenaPackName();
        const mergePack = gameState.hostileCreatures.filter(c =>
            c.speciesId === 'hyena' &&
            c.hp > 0 &&
            c.packGroup === hyena.packGroup &&
            c.biome === hyena.biome &&
            (c === hyena || c === closeMate || c.packName === hyena.packName || c.packName === closeMate.packName)
        );
        _trimHyenaPack(mergePack);
        for (const member of mergePack.slice(0, HYENA_PACK_LIMIT)) member.packName = sharedName;
    }

    if (!hyena.packName) {
        hyena.packMates = [];
        hyena._packOutOfRangeSince = null;
        hyena._returnToPackTarget = null;
        return;
    }

    const samePack = _hyenaPackMembers(hyena);
    const nearestMate = _nearestHyenaPackMate(hyena);
    const hasNearbyMate = nearestMate && nearestMate.dist <= HYENA_PACK_KEEP_RANGE;
    if (!hasNearbyMate) {
        hyena.packMates = [];
        hyena._returnToPackTarget = nearestMate ? nearestMate.mate : null;
        if (!hyena._packOutOfRangeSince) hyena._packOutOfRangeSince = Date.now();
        if (Date.now() - hyena._packOutOfRangeSince >= HYENA_PACK_LEAVE_GRACE) {
            hyena.packName = null;
            hyena._attackTurn = false;
            hyena._packOutOfRangeSince = null;
            hyena._returnToPackTarget = null;
        }
        return;
    }

    hyena._packOutOfRangeSince = null;
    hyena._returnToPackTarget = null;
    _trimHyenaPack(samePack);
    hyena.packMates = _hyenaPackMembers(hyena).filter(m =>
        m !== hyena && wrappedDistance(hyena.x, hyena.y, m.x, m.y) <= HYENA_PACK_KEEP_RANGE
    );
}

function _moveHyenaTowardPack(hyena, now) {
    if (hyena.speciesId !== 'hyena' || !hyena.packName || !hyena._returnToPackTarget) return false;
    const target = hyena._returnToPackTarget;
    if (target.hp <= 0 || target.packName !== hyena.packName || target.packGroup !== hyena.packGroup) {
        hyena._returnToPackTarget = null;
        return false;
    }

    const { dx, dy } = wrappedDelta(hyena.x, hyena.y, target.x, target.y);
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= HYENA_PACK_KEEP_RANGE) {
        hyena._packOutOfRangeSince = null;
        hyena._returnToPackTarget = null;
        return false;
    }

    const angle = Math.atan2(dy, dx);
    hyena._moveAngle = angle;
    _applyHyenaBiomeBonus(hyena);
    let speed = hyena.speed * (hyena._finalSpeedMult || 1.0);
    if (hyena._slowUntil && now < hyena._slowUntil) speed *= (hyena._slowMult || 1.0);
    moveCreature(hyena, hyena.x + Math.cos(angle) * speed, hyena.y + Math.sin(angle) * speed);
    return true;
}

// ── 鬣狗組隊加成 ──
export function _getHyenaPackBonus(hyena) {
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
    const members = gameState.hostileCreatures.filter(c =>
        c !== hyena &&
        c.speciesId === 'hyena' &&
        c.hp > 0 &&
        c.packGroup === hyena.packGroup &&
        c.biome === hyena.biome &&
        wrappedDistance(hyena.x, hyena.y, c.x, c.y) <= HYENA_PACK_KEEP_RANGE
    );
    for (const mate of members) {
        if (mate.hp <= 0) continue;
        if (!mate.target || mate.target.hp <= 0) {
            mate.target     = target;
            mate.state      = 'chasing';
            mate.targetType = (target === gameState.player) ? 'player' : 'neutral';
        }
    }
}

function _getHyenaAttackPack(hyena) {
    if (!hyena.packName) return [hyena];
    return _hyenaPackMembers(hyena)
        .filter(m => wrappedDistance(hyena.x, hyena.y, m.x, m.y) <= HYENA_PACK_KEEP_RANGE)
        .slice(0, HYENA_PACK_LIMIT);
}

function _syncHyenaAttackTurn(hyena, pack, now) {
    if (pack.length <= 1) {
        hyena._attackTurn = true;
        hyena._attackState = 'attacking';
        return hyena;
    }
    let attacker = pack.find(m => m._attackTurn);
    if (attacker && attacker.hp > 0 && attacker._attackState === 'retreating' && now < (attacker._attackTurnUntil || 0)) {
        return attacker;
    }
    if (!attacker || attacker.hp <= 0 || attacker._attackState !== 'attacking' || now >= (attacker._attackTurnUntil || 0)) {
        const lastIndex = pack.indexOf(attacker);
        const nextIndex = lastIndex >= 0 ? (lastIndex + 1) % pack.length : 0;
        attacker = pack[nextIndex];
        for (const member of pack) {
            member._attackTurn = member === attacker;
            member._attackState = member === attacker ? 'attacking' : 'waiting';
        }
        attacker._attackTurnUntil = now + HYENA_ATTACK_TURN_CD;
    }
    return attacker;
}

export function _hyenaWheelPosition(hyena, pack, target, now = Date.now()) {
    const index = Math.max(0, pack.indexOf(hyena));
    const spacing = hyena.radius * 2 + 15;
    const orbit = Math.max(target.radius + hyena.attackRange + spacing, spacing * pack.length / Math.PI);
    const angle = (Math.PI * 2 / Math.max(1, pack.length)) * index + (now / ((hyena.hyenaAttackInterval || 1000) * 0.9));
    return {
        x: target.x + Math.cos(angle) * orbit,
        y: target.y + Math.sin(angle) * orbit,
    };
}

export function updateNeutralCreatures() {
    const now = Date.now();

    // C. Alpha 死後繼承（combat.js 透過 _pendingAlphaInherit 旗標通知）
    if (gameState._pendingAlphaInherit) {
        gameState._pendingAlphaInherit = false;
        let nextAlpha = null, nextAlphaHp = -1;
        for (const n of gameState.neutralCreatures) {
            if (n.hp <= 0 || !n.isGiantized || !n.packLeader) continue;
            if (!n.packMembers || n.packMembers.filter(m => m.hp > 0).length < 1) continue;
            if (n.hp > nextAlphaHp) { nextAlphaHp = n.hp; nextAlpha = n; }
        }
        if (nextAlpha) _triggerAlpha(nextAlpha);
    }

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
                    moveCreature(creature, creature.x + Math.cos(Math.atan2(dy, dx)) * _effSpeed(creature), creature.y + Math.sin(Math.atan2(dy, dx)) * _effSpeed(creature));
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
                    else { moveCreature(creature, creature.x + Math.cos(Math.atan2(wdy, wdx)) * _effSpeed(creature), creature.y + Math.sin(Math.atan2(wdy, wdx)) * _effSpeed(creature)); }
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

                // 卡住偵測：連續1秒位移 < 0.5 → 強制切回漫遊並設新方向
                {
                    const prevX = creature._lastX !== undefined ? creature._lastX : creature.x;
                    const prevY = creature._lastY !== undefined ? creature._lastY : creature.y;
                    const moved = Math.abs(creature.x - prevX) + Math.abs(creature.y - prevY);
                    creature._lastX = creature.x;
                    creature._lastY = creature.y;
                    if (moved < 0.5) {
                        creature._stuckTimer = (creature._stuckTimer || 0) + FIXED_DELTA;
                    } else {
                        creature._stuckTimer = 0;
                    }
                    if (creature._stuckTimer >= 1000) {
                        creature._stuckTimer = 0;
                        creature.state = 'wandering';
                        creature._fruitTarget = null;
                        creature._seekingFruit = false;
                        creature._moveAngle = Math.random() * Math.PI * 2;
                    }
                }

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

                // B. 兩隻無隊伍獨立巨人相遇 → 升 Alpha（每3秒掃描）
                if (!creature.packLeader && !creature.packLeaderRef && !creature.isAlpha && !gameState.alphaCreature) {
                    if (now - (creature._alphaCheckTimer || 0) >= 3000) {
                        creature._alphaCheckTimer = now;
                        for (const other of gameState.neutralCreatures) {
                            if (other === creature || other.hp <= 0) continue;
                            if (!other.isGiantized || other.packLeader || other.packLeaderRef || other.isAlpha) continue;
                            if (other.speciesId !== creature.speciesId || other.biome !== creature.biome) continue;
                            if (wrappedDistance(creature.x, creature.y, other.x, other.y) <= 300) {
                                const leader = creature.hp >= other.hp ? creature : other;
                                const member  = creature.hp >= other.hp ? other : creature;
                                const _pnAvail = _PACK_NAMES.filter(n => !_usedPackNames.includes(n));
                                const _pnPool  = _pnAvail.length > 0 ? _pnAvail : _PACK_NAMES;
                                leader.packName    = _pnPool[Math.floor(Math.random() * _pnPool.length)];
                                _usedPackNames.push(leader.packName);
                                leader.packLeader  = true;
                                leader.packMembers = [member];
                                leader._packJoinTimer = 0;
                                member.packLeaderRef  = leader;
                                member.packName       = leader.packName;
                                _triggerAlpha(leader);
                                break;
                            }
                        }
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
                    const dp = wrappedDistance(creature.x, creature.y, p.x, p.y);
                    if (dp < giantTargetDist) { giantTarget = p; giantTargetDist = dp; }
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
                        moveCreature(creature, creature.x + Math.cos(gaAngle) * _effSpeed(creature),
                                               creature.y + Math.sin(gaAngle) * _effSpeed(creature));
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
                                if (n.diet !== 'herbivore' || creature.diet !== 'herbivore') continue;
                                const d = wrappedDistance(creature.x, creature.y, n.x, n.y);
                                if (d < followRange && Math.random() < 0.2) {
                                    n.packLeaderRef = creature;
                                    n._packOffsetX = (Math.random() - 0.5) * 160;
                                    n._packOffsetY = (Math.random() - 0.5) * 160;
                                    n.packName = creature.packName;
                                    creature.packMembers.push(n);
                                }
                            }
                        }
                    }
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
                    const ftDist = wrappedDistance(creature.x, creature.y,
                        creature._fruitTarget.x, creature._fruitTarget.y);
                    if (ftDist < creature.radius + 6) {
                        const idx = gameState.fruits.indexOf(creature._fruitTarget);
                        if (idx !== -1) gameState.fruits.splice(idx, 1);
                        creature._fruitTarget = null;
                        creature._fruitTargetTimer = 0;
                    } else {
                        const { dx: ftdx, dy: ftdy } = wrappedDelta(creature.x, creature.y,
                            creature._fruitTarget.x, creature._fruitTarget.y);
                        creature._moveAngle = Math.atan2(ftdy, ftdx);
                    }
                } else {
                    creature._moveAngle = (creature._moveAngle || 0) + (Math.random() - 0.5) * 0.12;
                }
                moveCreature(creature, creature.x + Math.cos(creature._moveAngle) * _effSpeed(creature),
                                       creature.y + Math.sin(creature._moveAngle) * _effSpeed(creature));
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
                moveCreature(creature, creature.x + Math.cos(Math.atan2(fdy, fdx)) * _effSpeed(creature),
                                       creature.y + Math.sin(Math.atan2(fdy, fdx)) * _effSpeed(creature));
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
                    creature._seekingFruitStart = now; // F: 超時保護起始時間
                }
                // 剩餘 20% 繼續漫遊（原 40%）
            }

            // 探索最近果子（範圍 800px）
            if (creature._seekingFruit) {
                // F. 5秒超時強制退出
                if (now - (creature._seekingFruitStart || 0) > 5000) {
                    creature._seekingFruit = false;
                } else {
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
                            const featureGiant = !!(gameState.currentMap && gameState.currentMap.features &&
                                                    gameState.currentMap.features.giantization);
                            if (creature.fruitsEaten >= 5 && featureGiant) {
                                _triggerGiantization(creature);
                            }
                            // E. hp > maxHp * 0.5 → 立刻停止找果子
                            if (creature.hp > creature.maxHp * 0.5) {
                                creature._seekingFruit = false;
                            } else {
                                let continueChance = 0.7;
                                if (_hasGiantizedNearby(creature, 500)) continueChance = 0.9;
                                if (Math.random() >= continueChance) creature._seekingFruit = false;
                            }
                        }
                    } else {
                        creature._seekingFruit = false;
                    }
                }
            }

            // 隊員跟隨隊長（有 packLeaderRef 時）
            if (creature.packLeaderRef) {
                if (creature.packLeaderRef.hp <= 0) {
                    creature.packLeaderRef = null; // 隊長死亡：脫隊
                } else {
                    const leader = creature.packLeaderRef;
                    const dLeader = wrappedDistance(creature.x, creature.y, leader.x, leader.y);
                    const followThreshold = (leader.packFollowRange || 800) * 0.75;
                    if (dLeader > followThreshold) {
                        const targetX = leader.x + (creature._packOffsetX || 0);
                        const targetY = leader.y + (creature._packOffsetY || 0);
                        const { dx: ldx, dy: ldy } = wrappedDelta(creature.x, creature.y, targetX, targetY);
                        creature._moveAngle = Math.atan2(ldy, ldx);
                        moveCreature(creature, creature.x + Math.cos(creature._moveAngle) * _effSpeed(creature),
                                               creature.y + Math.sin(creature._moveAngle) * _effSpeed(creature));
                        continue;
                    }
                    // 在閾值以內：fall through 到下方漫遊邏輯，實現自由漫遊
                }
            }

            // 漫遊：每幀小幅偏移角度（模擬 Perlin Noise 平滑）
            creature._moveAngle = (creature._moveAngle || 0) + (Math.random() - 0.5) * 0.12;
            moveCreature(creature, creature.x + Math.cos(creature._moveAngle) * _effSpeed(creature),
                                   creature.y + Math.sin(creature._moveAngle) * _effSpeed(creature));
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
            moveCreature(creature, creature.x + Math.cos(Math.atan2(fdy, fdx)) * _effSpeed(creature),
                                   creature.y + Math.sin(Math.atan2(fdy, fdx)) * _effSpeed(creature));
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
                moveCreature(creature, creature.x + Math.cos(Math.atan2(fdy, fdx)) * _effSpeed(creature),
                                       creature.y + Math.sin(Math.atan2(fdy, fdx)) * _effSpeed(creature));
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
            else { moveCreature(creature, creature.x + Math.cos(Math.atan2(wdy, wdx)) * _effSpeed(creature), creature.y + Math.sin(Math.atan2(wdy, wdx)) * _effSpeed(creature)); }
        }
    }

    // G. 不同隊伍巨人間安全距離（施加推開力）
    for (const gc of gameState.neutralCreatures) {
        if (gc.hp <= 0 || !gc.isGiantized) continue;
        for (const go of gameState.neutralCreatures) {
            if (go === gc || go.hp <= 0 || !go.isGiantized) continue;
            const samePack = (gc.packLeader && go.packLeaderRef === gc) ||
                             (go.packLeader && gc.packLeaderRef === go) ||
                             (gc.packLeaderRef && gc.packLeaderRef === go.packLeaderRef);
            if (samePack) continue;
            const safeDist = gc.radius + go.radius + 20;
            const d = wrappedDistance(gc.x, gc.y, go.x, go.y);
            if (d > 0 && d < safeDist) {
                const { dx, dy } = wrappedDelta(go.x, go.y, gc.x, gc.y);
                const len = Math.sqrt(dx * dx + dy * dy) || 1;
                moveCreature(gc, gc.x + dx / len * 2, gc.y + dy / len * 2);
            }
        }
    }
}

export function drawNeutralCreatures() {
    const greekMode = !!(gameState.settings && gameState.settings.fontBoldLarge);
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
            ctx.arc(s.x, s.y, creature.radius * (gameState.cameraZoom || 1), 0, Math.PI * 2);
            ctx.fill();
        }

        // ── 血條（名字在上、血條緊貼本體上緣）──
        const barW = 20, barH = 4;
        const barX = s.x - barW / 2;
        const barY = s.y - creature.radius * (gameState.cameraZoom || 1) - 8;
        ctx.fillStyle = '#555';
        ctx.fillRect(barX, barY, barW, barH);
        ctx.fillStyle = '#00CC00';
        ctx.fillRect(barX, barY, barW * (creature.hp / (creature.maxHp || 30)), barH);

        if (!greekMode) {
            const displayName = creature.isAlpha     ? (creature.name || '') + '（Alpha）'
                              : creature.isGiantized ? (creature.name || '') + '（巨人化）'
                              : (creature.name || '');
            if (displayName) {
                _drawCenteredCreatureText(
                    displayName,
                    s.x,
                    s.y - creature.radius * (gameState.cameraZoom || 1) - 10,
                    creature.isGiantized ? getGameFont(CREATURE_NAME_FONT_SIZE + 1, true) : getGameFont(CREATURE_NAME_FONT_SIZE, false),
                    creature.isAlpha ? '#FFD700' : '#FFFFFF',
                    3.5
                );
            }
            if (creature.packName) {
                const leader = creature.packLeader ? creature : creature.packLeaderRef;
                const memberCount = leader
                    ? 1 + (leader.packMembers ? leader.packMembers.filter(m => m.hp > 0).length : 0)
                    : 1;
                const packLimit = leader ? _getPackLimit(leader) : 5;
                _drawCenteredCreatureText(
                    creature.packName + '(' + memberCount + '/' + packLimit + ')',
                    s.x,
                    s.y + creature.radius * (gameState.cameraZoom || 1) + 14,
                    getGameFont(CREATURE_TEAM_FONT_SIZE, false),
                    'rgba(255,230,150,0.85)',
                    3
                );
            }
        }

        // ── Dev 疊加層 ──
        const _cr = creature.radius * (gameState.cameraZoom || 1);
        const _ny = s.y - _cr - 10;
        if (gameState.devShowHP) {
            const hpPct = creature.hp / (creature.maxHp || 30);
            const hpColor = hpPct > 0.6 ? '#00FF88' : hpPct > 0.3 ? '#FFD700' : '#FF4444';
            ctx.save();
            ctx.font = '20px Arial';
            ctx.textAlign = 'right';
            ctx.fillStyle = hpColor;
            ctx.fillText(Math.ceil(creature.hp) + ' / ' + (creature.maxHp || 30), s.x - _cr - 6, s.y + 6);
            ctx.restore();
        }
        if (gameState.devShowAI) {
            let aiLabel = '[' + (creature.state || '?') + ']';
            if (creature.isGiantized || creature.isAlpha) {
                aiLabel += creature.packLeader ? '[Leader]' : creature.packLeaderRef ? '[Member]' : '';
            }
            const dn = creature.isAlpha ? (creature.name || '') + '（Alpha）'
                     : creature.isGiantized ? (creature.name || '') + '（巨人化）'
                     : (creature.name || '');
            ctx.save();
            ctx.font = getGameFont(CREATURE_NAME_FONT_SIZE, false);
            const nw = ctx.measureText(dn).width / 2;
            ctx.font = '20px Arial';
            ctx.fillStyle = 'rgba(200, 200, 255, 0.85)';
            ctx.textAlign = 'left';
            ctx.fillText(aiLabel, s.x + nw + 8, _ny);
            ctx.restore();
        }
    }
}

export function updateHostileCreatures() {
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
            if (creature.speciesId === 'hyena' && creature.hyenaAttackInterval == null) {
                creature.hyenaAttackInterval = Math.round(1000 / ((gameState.currentMap?.creatureStrength?.hostile?.speedMultiplier) || 1));
            }
        }

        // ── 殺手化：每5秒回復1% maxHP ──────────────────────────────
        if (creature.isKiller) {
            if (now - (creature.killerRegenTimer || 0) >= 5000) {
                creature.killerRegenTimer = now;
                creature.hp = Math.min(creature.maxHp, creature.hp + creature.maxHp * 0.01);
            }
        }

        // ── 肉系吃屍體（僅普通地圖 hostileEatMeat 開啟）──────────
        if (creature.speciesId === 'hyena' && _moveHyenaTowardPack(creature, now)) continue;

        const featureEatMeat = !!(gameState.currentMap && gameState.currentMap.features &&
                                  gameState.currentMap.features.hostileEatMeat);
        if (featureEatMeat && creature.diet === 'carnivore') {
            if (creature.state === 'eating') {
                // 吃屍體期間 aggroRange×0.5，讓生物能順利進食觸發殺手化
                const tempAggro = (creature.eatBaseAggroRange || creature.aggroRange) * 0.5;
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

        // 殺手化特殊戰術：攻擊巨人，血量低且巨人血量高時撤退轉移目標
        if (creature.isKiller && bestTarget && (bestTarget.isGiantized || bestTarget.isAlpha)) {
            const killerHpRatio = creature.hp / creature.maxHp;
            const giantHpRatio  = bestTarget.hp / bestTarget.maxHp;
            const shouldRetreat = killerHpRatio < 0.7 && giantHpRatio > 0.7;

            if (shouldRetreat) {
                // 尋找落單非巨人化草食性作為替代目標
                let altTarget = null;
                let altDist   = Infinity;
                for (const n of gameState.neutralCreatures) {
                    if (n.hp <= 0 || n.isGiantized || n.isAlpha) continue;
                    const d = wrappedDistance(creature.x, creature.y, n.x, n.y);
                    if (d < creature.aggroRange && d < altDist) {
                        altTarget = n;
                        altDist   = d;
                    }
                }
                if (altTarget) {
                    bestTarget          = altTarget;
                    creature.state      = 'chasing';
                    creature.target     = altTarget;
                    creature.targetType = 'neutral';
                } else {
                    creature.state           = 'fleeing_giant';
                    creature._fleeGiantTimer = now;
                    creature.target          = null;
                    creature.targetType      = null;
                    bestTarget               = null;
                }
            }
            // 血量條件不符時（殺手狀態良好）：正常攻擊巨人，繼續往下執行
        }

        // 非殺手的巨人迴避判斷（原有邏輯）
        if (!creature.isKiller && bestTarget && (bestTarget.isGiantized || bestTarget.isAlpha)) {
            if (_shouldFleeFromGiant(creature, bestTarget)) {
                creature.state           = 'fleeing_giant';
                creature._fleeGiantTimer = now;
                creature.target          = null;
                creature.targetType      = null;
                bestTarget               = null;
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
                moveCreature(creature, creature.x + Math.cos(creature._moveAngle) * _effSpeed(creature),
                                       creature.y + Math.sin(creature._moveAngle) * _effSpeed(creature));
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

            if (creature.speciesId === 'hyena' && creature.targetType === 'player') {
                const pack = _getHyenaAttackPack(creature);
                const attacker = _syncHyenaAttackTurn(creature, pack, now);
                if (creature !== attacker || creature._attackState === 'retreating') {
                    const wheelPos = _hyenaWheelPosition(creature, pack, t);
                    const { dx: wdx, dy: wdy } = wrappedDelta(creature.x, creature.y, wheelPos.x, wheelPos.y);
                    const wheelDist = Math.sqrt(wdx * wdx + wdy * wdy);
                    _applyHyenaBiomeBonus(creature);
                    let wheelSpeed = creature.speed * (creature._finalSpeedMult || 1.0);
                    if (creature._slowUntil && now < creature._slowUntil) wheelSpeed *= (creature._slowMult || 1.0);
                    if (wheelDist > 60) {
                        creature._moveAngle = Math.atan2(wdy, wdx);
                    } else {
                        const toHyenaAngle = Math.atan2(creature.y - t.y, creature.x - t.x);
                        creature._moveAngle = toHyenaAngle + Math.PI / 2;
                    }
                    moveCreature(creature, creature.x + Math.cos(creature._moveAngle) * wheelSpeed, creature.y + Math.sin(creature._moveAngle) * wheelSpeed);
                    continue;
                }
            }

            if (dist <= creature.attackRange) {
                if (now - creature.attackCooldown >= (creature.hyenaAttackInterval || 1000)) {
                    if (creature.targetType === 'player') {
                        let dmg = creature.damage;
                        if (creature.speciesId === 'lynx') {
                            _applyLynxBiomeBonus(creature);
                            if (Math.random() < (creature._critChance || 0)) {
                                dmg = creature.baseDamage * (creature._critMult || 1.0);
                                showFloatingText(p.x, p.y - 30, creature._critText || '暴擊！', '#FF4400');
                                // 猞猁暴擊緩速：韌性縮短持續時間
                                p._lynxSlowUntil = now + applyTenacity(creature._critSlowDur || 0, p);
                                p._lynxSlowAmt   = creature._critSlowAmt || 0;
                            }
                        } else if (creature.speciesId === 'croc') {
                            _applyCrocBiomeBonus(creature);
                            dmg = creature.damage * (creature._biomeAtkMult || 1.0);
                            if (Math.random() < (creature._deathRollChance || 0)) {
                                showFloatingText(p.x, p.y - 30, '死亡翻滾！！', '#FF6600');
                                // 鱷魚死亡翻滾：韌性縮短硬控時間
                                p._stunUntil = now + applyTenacity(1000, p);
                            }
                        } else if (creature.speciesId === 'hyena') {
                            _applyHyenaBiomeBonus(creature);
                            dmg = creature.damage * (creature._finalAtkMult || 1.0);
                        }
                        applyDamageToPlayer(dmg, creature);
                        if (creature.speciesId === 'hyena') {
                            creature._attackState = 'retreating';
                            creature._attackTurnUntil = now + HYENA_ATTACK_TURN_CD;
                        }
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
                // 嘴器減速
                if (creature._slowUntil && now < creature._slowUntil) chaseSpeed *= (creature._slowMult || 1.0);
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
                moveCreature(creature, creature.x + Math.cos(creature._moveAngle) * _effSpeed(creature) * 1.3,
                                       creature.y + Math.sin(creature._moveAngle) * _effSpeed(creature) * 1.3);
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
            // 嘴器減速
            if (creature._slowUntil && now < creature._slowUntil) wanderSpeed *= (creature._slowMult || 1.0);
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
            else { moveCreature(creature, creature.x + Math.cos(Math.atan2(wdy, wdx)) * _effSpeed(creature), creature.y + Math.sin(Math.atan2(wdy, wdx)) * _effSpeed(creature)); }
        }
    }
}

export function drawCorpses() {
    for (const corpse of gameState.corpses) {
        const s = worldToScreen(corpse.x, corpse.y);
        if (s.x < -50 || s.x > VIEW_W + 50 || s.y < -50 || s.y > VIEW_H + 50) continue;
        ctx.fillStyle = '#888';
        ctx.beginPath();
        ctx.arc(s.x, s.y, corpse.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

export function drawHostileCreatures() {
    const greekMode = !!(gameState.settings && gameState.settings.fontBoldLarge);
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
            ctx.arc(s.x, s.y, creature.radius * (gameState.cameraZoom || 1), 0, Math.PI * 2);
            ctx.fill();
        }

        // ── 血條 ──
        const barW = 20, barH = 4;
        const barX = s.x - barW / 2;
        const barY = s.y - creature.radius * (gameState.cameraZoom || 1) - 8;
        ctx.fillStyle = '#550000';
        ctx.fillRect(barX, barY, barW, barH);
        ctx.fillStyle = '#00CC00';
        ctx.fillRect(barX, barY, barW * (creature.hp / (creature.maxHp || 50)), barH);

        if (!greekMode) {
            const hostileDisplayName = _getCreatureDisplayName(creature);
            if (hostileDisplayName) {
                _drawCenteredCreatureText(
                    hostileDisplayName,
                    s.x,
                    s.y - creature.radius * (gameState.cameraZoom || 1) - 10,
                    creature.isKiller ? getGameFont(CREATURE_NAME_FONT_SIZE, true) : getGameFont(CREATURE_NAME_FONT_SIZE, false),
                    creature.isKiller ? '#FF8800' : '#FFFFFF',
                    3.5
                );
            }
            // ── 鬣狗隊名標籤 ──
            if (creature.speciesId === 'hyena' && creature.packName) {
                const packCount = gameState.hostileCreatures.filter(
                    c => c.speciesId === 'hyena' && c.packGroup === creature.packGroup && c.packName === creature.packName && c.hp > 0
                ).length;
                _drawCenteredCreatureText(
                    creature.packName + '(' + Math.min(packCount, HYENA_PACK_LIMIT) + '/' + HYENA_PACK_LIMIT + ')',
                    s.x,
                    s.y + creature.radius * (gameState.cameraZoom || 1) + 14,
                    getGameFont(CREATURE_TEAM_FONT_SIZE, false),
                    'rgba(255, 200, 100, 0.85)',
                    3
                );
            }
        }

        // ── Dev 疊加層 ──
        const _hr = creature.radius * (gameState.cameraZoom || 1);
        const _hny = s.y - _hr - 10;
        if (gameState.devShowHP) {
            const hpPct = creature.hp / (creature.maxHp || 50);
            const hpColor = hpPct > 0.6 ? '#00FF88' : hpPct > 0.3 ? '#FFD700' : '#FF4444';
            ctx.save();
            ctx.font = '20px Arial';
            ctx.textAlign = 'right';
            ctx.fillStyle = hpColor;
            ctx.fillText(Math.ceil(creature.hp) + ' / ' + (creature.maxHp || 50), s.x - _hr - 6, s.y + 6);
            ctx.restore();
        }
        if (gameState.devShowAI) {
            let aiLabel = '[' + (creature.state || '?') + ']';
            if (creature.speciesId === 'hyena' && creature._attackState) aiLabel += '[' + creature._attackState + ']';
            const hn = _getCreatureDisplayName(creature) || '';
            ctx.save();
            ctx.font = getGameFont(CREATURE_NAME_FONT_SIZE, false);
            const hnw = ctx.measureText(hn).width / 2;
            ctx.font = '20px Arial';
            ctx.fillStyle = 'rgba(200, 200, 255, 0.85)';
            ctx.textAlign = 'left';
            ctx.fillText(aiLabel, s.x + hnw + 8, _hny);
            ctx.restore();
        }
    }
}
