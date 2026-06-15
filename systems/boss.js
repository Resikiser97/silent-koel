// =============================================================
// 首領系統 - spawnBoss / updateBoss / showVictory / handleBossKill
//            drawBoss / drawBossShape / drawBossArrow
// =============================================================

// ── Boss 顏色常數 ─────────────────────────────────────────────
import { gameState, ctx } from './gameState.js';
import { MAP_WIDTH, MAP_HEIGHT, VIEW_W, VIEW_H, getBiome } from './map.js';
import { worldToScreen, wrappedDistance, wrappedDelta } from './camera.js';
import { GAME_INFO, GAME_TIMING } from '../config/gameConfig.js';
import { BOSS_CONFIG, BOSS_BAR_COLORS, BOSS_BAR_NEXT_COLORS } from '../config/creatures.js';
import { AudioManager } from './audio.js';
import { moveCreature } from './spawning.js';
import { applyDamageToPlayer } from './damage.js';
import { showFloatingText } from './feedback.js';
import { _effSpeed } from './creatures.js';
import { addXP } from './reward.js';
import { buildSkillTreeOverlay, saveLastRunOrgans } from './evolution.js';
import { saveSettings, buildEndGameOverlay } from './ui.js';
import { showScoreSubmitPopup } from './leaderboard.js';
import { loadChatSettings, chatSaveProgress } from './chat.js';
import { pausePlayTimer } from './gameFlow.js';
import { t } from '../lang.js';
import { drawArrow } from './utils.js';
import {
    STORAGE_KEYS,
    storageKey,
    storageGet,
    storageSet,
    storageRemove,
    storageSetJSON
} from '../storage/index.js';

const BOSS_COLORS = {
    bear: {
        body:  '#2a1808',
        head:  '#301c0a',
        limbs: '#7a3d0c',   // 明顯淺於 body，確保手臂可見
        eye:   '#cc4400',
        pupil: '#1a0000',
    },
    shark: {
        body:  '#1a3050',
        fin:   '#162840',
        tail:  '#162840',
        eye:   '#88ccff',
        pupil: '#001830',
    },
    scorp: {
        body:    '#1a0828',
        bodyMid: '#22103a',
        bodyTop: '#2a1445',
        claw:    '#1a0828',
        tail:    '#22103a',
        stinger: '#9030c0',
        eye:     '#cc00ff',
        pupil:   '#1a0020',
    },
    hunter: {
        hat:         '#3E2723',
        hatBrim:     '#4E342E',
        hatBand:     '#FFD700',
        gun:         '#212121',
        gunDetail:   '#424242',
        phase1Glow:  '#1565C0',
        phase2GlowA: '#B0BEC5',
        phase2GlowB: '#FF7043',
        phase3Glow:  '#FF1744',
        phase3White: '#FFFFFF',
    },
};

// ── Boss 主繪製分派 ───────────────────────────────────────────
export function drawBossShape(ctx, boss, sx, sy) {
    ctx.save();
    ctx.translate(sx, sy);
    const r = boss.radius * (gameState.cameraZoom || 1);
    const t = Date.now();
    if      (boss.biome === 'forest') _drawBear(ctx, r, t, boss);
    else if (boss.biome === 'ocean')  _drawShark(ctx, r, t, boss);
    else if (boss.biome === 'desert') _drawScorp(ctx, r, t, boss);
    else if (boss.biome === 'hunter') _drawHunter(ctx, r, t, boss);
    ctx.restore();
}

// ── 黑熊（forest）──────────────────────────────────────────────
// 手臂三狀態：閒置垂下 / 追擊高舉（延伸至身體外側） / 攻擊橫掃＋爪痕特效
// ⚠️ 身體橢圓 rx=r*1.2 非常寬，手臂若顏色相同會被蓋住 → limbs 使用明顯較淺的棕色
function _drawBear(ctx, r, t, boss) {
    const C = BOSS_COLORS.bear;
    const isChasing = boss && boss.state === 'chasing';
    const speedMult = isChasing ? 1.9 : 1.0;
    const period    = 450 / speedMult;

    // 踏步動畫（腿）
    const stompL = Math.sin(t / period);
    const stompR = Math.sin(t / period + Math.PI);
    const scaleL = 1.0 + stompL * 0.38;
    const scaleR = 1.0 + stompR * 0.38;
    const offL   = stompL * r * 0.09;
    const offR   = stompR * r * 0.09;

    // 攻擊偵測（450ms 視窗）
    const sinceAtk = boss ? Math.max(0, t - (boss.attackCooldown || 0)) : 99999;
    const isAtk    = sinceAtk < 450 && boss && boss.attackCooldown > 0;
    const atkPhase = isAtk ? Math.sin(sinceAtk / 450 * Math.PI) : 0;
    const isCrit   = !!(boss && boss.lastAttackCrit);
    const atkLeg   = (boss && boss.lastAttackLeg) || 'left';
    // atkLeg==='left'：左腳踩地 → 右臂(side=+1)攻擊，軌跡呈 "/"
    // atkLeg==='right'：右腳踩地 → 左臂(side=-1)攻擊，軌跡呈 "\"

    // ── 手臂橢圓參數 ──
    // armLen=r*0.55，橢圓頂端對齊肩膀（seamless），底端延伸至 2*armLen 下方
    // 追擊時 angle=±1.2（≈69°），使臂中心落在身體橢圓外側 → 清晰可見
    const armLen = r * 0.55;

    const getArm = (side, phase) => {
        const isAtkArm = isAtk && (isCrit || ((atkLeg === 'left') === (side > 0)));
        if (isAtkArm) {
            // 從高舉位大幅橫掃：肩膀向對側推移 + 角度翻轉
            return {
                sx:    side * r * (0.70 - phase * 0.90),
                sy:    -r * 0.45 + phase * r * 0.75,
                angle: side * (1.20 - phase * 3.00)
            };
        } else if (isChasing) {
            // 雙臂高舉外展（angle=1.2rad ≈ 69°），臂中心落在身體外側
            return { sx: side * r * 0.70, sy: -r * 0.45, angle: side * 1.20 };
        } else {
            // 閒置：手臂垂至身體下外側
            return { sx: side * r * 0.80, sy: r * 0.45, angle: side * 0.10 };
        }
    };

    const drawArm = (side, phase, alpha) => {
        const { sx, sy, angle } = getArm(side, phase);
        ctx.globalAlpha = alpha;
        ctx.fillStyle   = C.limbs;
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.ellipse(0, armLen, r * 0.22, armLen, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };

    // ── 後腿（先畫，被身體蓋住根部）──
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = C.limbs;
    ctx.beginPath();
    ctx.ellipse(-r * 0.52, r * 0.68 + offL, r * 0.27, r * 0.55 * scaleL, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse( r * 0.52, r * 0.68 + offR, r * 0.27, r * 0.55 * scaleR, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── 身體主橢圓 ──
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = C.body;
    ctx.beginPath();
    ctx.ellipse(0, r * 0.2, r * 1.2, r * 0.75, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── 前臂殘影（攻擊時）──
    if (isAtk) {
        const tPhases = [Math.max(0, atkPhase - 0.35), Math.max(0, atkPhase - 0.18)];
        const tAlphas = [0.10, 0.22];
        for (let ti = 0; ti < 2; ti++) {
            if (isCrit || atkLeg === 'right') drawArm(-1, tPhases[ti], tAlphas[ti]);
            if (isCrit || atkLeg === 'left')  drawArm( 1, tPhases[ti], tAlphas[ti]);
        }
    }

    // ── 前臂主體 ──
    drawArm(-1, atkPhase, 1.0);
    drawArm( 1, atkPhase, 1.0);
    ctx.globalAlpha = 1.0;

    // ── 爪痕特效（繪於身體之上、頭部之下，確保攻擊清晰可見）──
    // 普攻：深紅 3 條"/"或"\"斜線；暴擊：橙紅 6 條呈"X"
    if (isAtk && atkPhase > 0.05) {
        ctx.save();
        ctx.globalAlpha = Math.sin(sinceAtk / 450 * Math.PI) * 0.90;
        ctx.strokeStyle = isCrit ? '#ff8800' : '#dd2200';
        ctx.lineWidth   = r * 0.12;
        ctx.lineCap     = 'round';
        const clawSides = isCrit ? [1, -1] : [atkLeg === 'left' ? 1 : -1];
        for (const side of clawSides) {
            for (let ci = -1; ci <= 1; ci++) {
                const ox = ci * r * 0.13;             // 三條爪痕水平間距
                const cx1 = side * r * 0.50 + ox;    // 起點（上方）
                const cy1 = -r * 0.35;
                const cx2 = -side * r * 0.28 + ox;   // 終點（下斜對側）
                const cy2 = r * 0.48;
                ctx.beginPath();
                ctx.moveTo(cx1, cy1);
                ctx.lineTo(cx1 + (cx2 - cx1) * atkPhase, cy1 + (cy2 - cy1) * atkPhase);
                ctx.stroke();
            }
        }
        ctx.restore();
    }

    // ── 頭部 ──
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = C.head;
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.6, r * 0.75, r * 0.65, 0, 0, Math.PI * 2);
    ctx.fill();

    // 耳朵
    ctx.fillStyle = C.body;
    ctx.beginPath();
    ctx.arc(-r * 0.5, -r * 1.15, r * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc( r * 0.5, -r * 1.15, r * 0.28, 0, Math.PI * 2);
    ctx.fill();

    // ── 眼睛（脈動發光）──
    const glowPulse = 0.7 + Math.sin(t / 700) * 0.3;
    ctx.globalAlpha = glowPulse;
    ctx.fillStyle = C.eye;
    ctx.beginPath();
    ctx.arc(-r * 0.28, -r * 0.65, r * 0.13, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc( r * 0.28, -r * 0.65, r * 0.13, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    ctx.fillStyle = C.pupil;
    ctx.beginPath();
    ctx.arc(-r * 0.28, -r * 0.65, r * 0.06, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc( r * 0.28, -r * 0.65, r * 0.06, 0, Math.PI * 2);
    ctx.fill();
}

// ── 大白鯊（ocean）─────────────────────────────────────────────
function _drawShark(ctx, r, t, boss) {
    const C = BOSS_COLORS.shark;
    // 移動速度連動：追擊時尾鰭加速擺動
    const speedMult = (boss && boss.state === 'chasing') ? 1.9 : 1.0;
    const period    = 550 / speedMult;
    const tailSwing = Math.sin(t / period) * 0.5;

    // 面向玩家：玩家在左側則水平翻轉，讓頭永遠朝向目標
    // 原始繪圖頭在右（+x），尾在左（-x），翻轉後頭在左
    const facingLeft = gameState.player && gameState.player.x < (boss ? boss.x : 0);
    if (facingLeft) ctx.scale(-1, 1);

    // 尾巴（左側，先畫）
    ctx.save();
    ctx.translate(-r * 1.3, 0);
    ctx.rotate(tailSwing);
    ctx.fillStyle = C.tail;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-r * 0.6, -r * 0.45);
    ctx.lineTo(-r * 0.6,  r * 0.45);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 身體扁橢圓
    ctx.fillStyle = C.body;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.4, r * 0.65, 0, 0, Math.PI * 2);
    ctx.fill();

    // 背鰭（上方三角）
    ctx.fillStyle = C.fin;
    ctx.beginPath();
    ctx.moveTo(-r * 0.15, -r * 0.6);
    ctx.lineTo( r * 0.35, -r * 1.35);
    ctx.lineTo( r * 0.6,  -r * 0.6);
    ctx.closePath();
    ctx.fill();

    // 胸鰭（下方兩側）
    ctx.fillStyle = C.fin;
    ctx.beginPath();
    ctx.moveTo(-r * 0.3,  r * 0.5);
    ctx.lineTo(-r * 0.7,  r * 1.0);
    ctx.lineTo( r * 0.1,  r * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo( r * 0.3,  r * 0.5);
    ctx.lineTo( r * 0.5,  r * 1.0);
    ctx.lineTo( r * 0.7,  r * 0.55);
    ctx.closePath();
    ctx.fill();

    // 眼睛（脈動）
    const glowPulse = 0.6 + Math.sin(t / 1200) * 0.4;
    ctx.globalAlpha = glowPulse;
    ctx.fillStyle = C.eye;
    ctx.beginPath();
    ctx.arc(r * 0.55, -r * 0.1, r * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    ctx.fillStyle = C.pupil;
    ctx.beginPath();
    ctx.arc(r * 0.55, -r * 0.1, r * 0.05, 0, Math.PI * 2);
    ctx.fill();
}

// ── 沙漠蠍王（desert）──────────────────────────────────────────
// 身體橢圓：rx=0.85r, ry=0.5r，腳根必須在橢圓內才能被身體蓋住
// 腳根計算：點(x,y)在橢圓內 ⟺ (x/0.85r)²+(y/0.5r)² < 1
function _drawScorp(ctx, r, t, boss) {
    const C = BOSS_COLORS.scorp;
    // 移動速度連動
    const speedMult  = (boss && boss.state === 'chasing') ? 1.9 : 1.0;
    const legPeriod  = 260 / speedMult;
    const tailPeriod = 800;

    // ── 三對步行腳（三腳步法 Tripod Gait）──
    // 群 A（左後[2]、右中[4]、左前[0]）與群 B（右後[5]、左中[1]、右前[3]）交替
    // 群 B 相位差 +π（半週期），組內後腿先出，每腳差 10%（step = 0.1×2π）
    const step = Math.PI * 0.2;
    const legPhases = [
        step * 2,           // 0: 左前 — 群A，第三出
        Math.PI + step,     // 1: 左中 — 群B，第二出
        0,                  // 2: 左後 — 群A，第一出（最先）
        Math.PI + step * 2, // 3: 右前 — 群B，第三出
        step,               // 4: 右中 — 群A，第二出
        Math.PI,            // 5: 右後 — 群B，第一出
    ];

    // 腳根（在橢圓內，被身體蓋住）與靜止末端位置
    const legRoots = [
        { x: -r * 0.74, y: -r * 0.18, ex: -r * 1.45, ey: -r * 0.55 }, // 左前
        { x: -r * 0.82, y:  r * 0.02, ex: -r * 1.58, ey:  r * 0.12 }, // 左中
        { x: -r * 0.70, y:  r * 0.22, ex: -r * 1.35, ey:  r * 0.55 }, // 左後
        { x:  r * 0.74, y: -r * 0.18, ex:  r * 1.45, ey: -r * 0.55 }, // 右前
        { x:  r * 0.82, y:  r * 0.02, ex:  r * 1.58, ey:  r * 0.12 }, // 右中
        { x:  r * 0.70, y:  r * 0.22, ex:  r * 1.35, ey:  r * 0.55 }, // 右後
    ];

    // 腳動畫：末端 y 偏移（抬腳時末端向上移，非旋轉）
    ctx.lineCap = 'round';
    for (let i = 0; i < 6; i++) {
        const { x, y, ex, ey } = legRoots[i];
        const swing = Math.sin(t / legPeriod + legPhases[i]);
        // swing > 0 = 抬腳（細線）；swing <= 0 = 落地支撐（粗線）
        const ey_anim = ey - swing * r * 0.3;
        ctx.strokeStyle = C.claw;
        ctx.lineWidth   = swing > 0 ? r * 0.09 : r * 0.14;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(ex, ey_anim);
        ctx.stroke();
    }

    // ── 前大夾鉗（靜止待機，攻擊時向內夾）──
    // 根部 (±0.3r, -0.3r)：(0.3/0.85)²+(0.3/0.5)² ≈ 0.48 < 1 ✓
    // 攻擊檢測：boss.attackCooldown 記錄最後攻擊時刻（Date.now()）
    const sinceAtk = boss ? Math.max(0, Date.now() - (boss.attackCooldown || 0)) : 99999;
    const atkPhase = (sinceAtk < 700 && boss && boss.attackCooldown > 0)
        ? Math.sin(sinceAtk / 700 * Math.PI) : 0;
    const snapAngle = atkPhase * 0.65;   // 最大約 37°，向內夾

    ctx.lineCap = 'round';
    for (const side of [-1, 1]) {
        ctx.save();
        ctx.translate(side * r * 0.3, -r * 0.3);
        ctx.rotate(snapAngle * -side);   // 兩夾均向中線夾
        // 主臂
        ctx.strokeStyle = C.claw;
        ctx.lineWidth = r * 0.2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(side * r * 0.55, -r * 0.55);
        ctx.stroke();
        // 上夾
        ctx.lineWidth = r * 0.13;
        ctx.beginPath();
        ctx.moveTo(side * r * 0.55, -r * 0.55);
        ctx.lineTo(side * r * 0.82, -r * 0.78);
        ctx.stroke();
        // 下夾
        ctx.beginPath();
        ctx.moveTo(side * r * 0.55, -r * 0.55);
        ctx.lineTo(side * r * 0.82, -r * 0.35);
        ctx.stroke();
        ctx.restore();
    }

    // ── 身體（三層橢圓，蓋住腳根關節）──
    ctx.fillStyle = C.body;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.85, r * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = C.bodyMid;
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.1, r * 0.65, r * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = C.bodyTop;
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.18, r * 0.48, r * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── 尾巴（往上彎，輕微搖擺，從身體後部伸出）──
    const tailSwing = Math.sin(t / tailPeriod) * 0.15;
    ctx.save();
    ctx.translate(0, r * 0.1);
    ctx.rotate(tailSwing);
    ctx.strokeStyle = C.tail;
    ctx.lineWidth   = r * 0.22;
    ctx.lineCap     = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(r * 0.6, -r * 1.1, r * 0.25, -r * 1.85);
    ctx.stroke();
    // 毒針尖
    ctx.fillStyle = C.stinger;
    ctx.beginPath();
    ctx.ellipse(r * 0.25, -r * 1.97, r * 0.14, r * 0.1, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // ── 眼睛（紫色脈動）──
    const glowPulse = 0.65 + Math.sin(t / 900) * 0.35;
    ctx.globalAlpha = glowPulse;
    ctx.fillStyle = C.eye;
    ctx.beginPath();
    ctx.arc(-r * 0.2, -r * 0.2, r * 0.11, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc( r * 0.2, -r * 0.2, r * 0.11, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    ctx.fillStyle = C.pupil;
    ctx.beginPath();
    ctx.arc(-r * 0.2, -r * 0.2, r * 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc( r * 0.2, -r * 0.2, r * 0.05, 0, Math.PI * 2);
    ctx.fill();
}

// ── 黑色獵人（hunter）──────────────────────────────────────────────
function _drawHunter(ctx, r, t, boss) {
    const C = BOSS_COLORS.hunter;
    const bars = boss.barsRemaining || 1;
    const facingRight = !boss.lastMoveDir || boss.lastMoveDir.dx >= 0;

    // 形態邊框光環
    ctx.save();
    if (bars >= 4) {
        ctx.strokeStyle = C.phase1Glow;
        ctx.lineWidth   = 3;
        ctx.shadowColor = C.phase1Glow;
        ctx.shadowBlur  = 10;
        ctx.globalAlpha = 0.8;
    } else if (bars >= 2) {
        const alt = Math.sin(t / 200) > 0;
        ctx.strokeStyle = alt ? C.phase2GlowA : C.phase2GlowB;
        ctx.lineWidth   = 3;
        ctx.shadowColor = alt ? C.phase2GlowA : C.phase2GlowB;
        ctx.shadowBlur  = 12;
        ctx.globalAlpha = 0.85;
    } else {
        const pulse = Math.sin(t / 200) * 0.3 + 0.7;
        ctx.strokeStyle = C.phase3Glow;
        ctx.lineWidth   = 4;
        ctx.shadowColor = C.phase3White;
        ctx.shadowBlur  = 20;
        ctx.globalAlpha = pulse;
    }
    ctx.beginPath();
    ctx.arc(0, 0, r + 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 身體圓形
    ctx.fillStyle = '#212121';
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // 牛仔帽帽沿
    ctx.fillStyle = C.hatBrim;
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.9, r * 0.7, r * 0.13, 0, 0, Math.PI * 2);
    ctx.fill();
    // 帽頂
    ctx.fillStyle = C.hat;
    ctx.beginPath();
    ctx.roundRect
        ? ctx.roundRect(-r * 0.4, -r * 1.4, r * 0.8, r * 0.5, r * 0.1)
        : ctx.rect(-r * 0.4, -r * 1.4, r * 0.8, r * 0.5);
    ctx.fill();
    // 帽帶（金色線條）
    ctx.strokeStyle = C.hatBand;
    ctx.lineWidth   = r * 0.07;
    ctx.beginPath();
    ctx.moveTo(-r * 0.4, -r * 0.95);
    ctx.lineTo( r * 0.4, -r * 0.95);
    ctx.stroke();

    // 槍（跟隨方向）
    const gunSign = facingRight ? 1 : -1;
    ctx.save();
    ctx.rotate(gunSign * 0.3);
    ctx.fillStyle = C.gun;
    ctx.beginPath();
    ctx.rect(gunSign * r * 0.1, r * 0.05, gunSign * r * 1.6, r * 0.16);
    ctx.fill();
    ctx.fillStyle = C.gunDetail;
    ctx.beginPath();
    ctx.rect(gunSign * r * 0.1, r * 0.12, gunSign * r * 0.4, r * 0.09);
    ctx.fill();
    ctx.restore();

    // 瞄準線已由 _drawHunterAimingWarning 在 cull 前統一處理
}

// ── 大白鯊衝刺警告箭頭 ───────────────────────────────────────────
// warning=黃色閃爍，charging=紅色；寬度=Boss直徑
// 長度 = speed×4×0.8×60（實際衝刺距離，世界px轉螢幕px）
// _chargeArrow = { angle, dist, fromX, fromY }：warning開始瞬間鎖定
function _drawSharkChargeArrow(boss) {
    if (!boss._chargeArrow) return;
    const isWarning  = boss._chargeState === 'warning';
    const isCharging = boss._chargeState === 'charging';
    if (!isWarning && !isCharging) return;

    const { angle, dist, fromX, fromY } = boss._chargeArrow;
    const fromS  = worldToScreen(fromX, fromY);
    const fromSx = fromS.x;
    const fromSy = fromS.y;
    const toWorldX  = fromX + Math.cos(angle) * dist;
    const toWorldY  = fromY + Math.sin(angle) * dist;
    const toS  = worldToScreen(toWorldX, toWorldY);
    const toSx = toS.x;
    const toSy = toS.y;
    const screenLen = Math.sqrt((toSx - fromSx) ** 2 + (toSy - fromSy) ** 2);
    if (screenLen < 1) return;

    const arrowW  = boss.radius * 2;
    const bodyLen = Math.max(0, screenLen - arrowW * 0.6);
    const color   = isWarning ? 'rgba(255, 220, 0, 0.75)' : 'rgba(255, 50, 50, 0.75)';

    ctx.save();
    ctx.translate(fromSx, fromSy);
    ctx.rotate(angle);

    // 箭身長方形
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.rect(0, -arrowW / 2, bodyLen, arrowW);
    ctx.fill();

    // 箭頭三角
    ctx.beginPath();
    ctx.moveTo(screenLen, 0);
    ctx.lineTo(bodyLen,  -arrowW * 0.8);
    ctx.lineTo(bodyLen,   arrowW * 0.8);
    ctx.closePath();
    ctx.fill();

    // 警告時加閃爍邊框
    if (isWarning) {
        const pulse = 0.5 + Math.sin(Date.now() / 80) * 0.5;
        ctx.strokeStyle = `rgba(255, 255, 0, ${pulse.toFixed(2)})`;
        ctx.lineWidth   = 2;
        ctx.beginPath();
        ctx.rect(0, -arrowW / 2, bodyLen, arrowW);
        ctx.stroke();
    }

    ctx.restore();
}

// ── 蠍王毒霧特效（警告光圈 + 定點毒霧圓） ────────────────────────
// 警告：600ms黃色虛線圓圈（鎖定玩家位置）
// 毒霧：radius 150px，持續4000ms，淡入300ms / 淡出500ms
function _drawVenomEffects(boss) {
    // 1. 警告光圈（黃色虛線，閃爍）
    if (boss._venomWarning) {
        const s = worldToScreen(boss._venomWarning.x, boss._venomWarning.y);
        const pulse = 0.5 + Math.sin(Date.now() / 80) * 0.5;
        ctx.save();
        ctx.setLineDash([8, 6]);
        ctx.strokeStyle = `rgba(255, 220, 0, ${pulse.toFixed(2)})`;
        ctx.lineWidth   = 2;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 150, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
    }

    // 2. 定點毒霧圓圈（綠色半透明，淡入淡出）
    if (gameState.venomPuddles) {
        for (const puddle of gameState.venomPuddles) {
            const elapsed = Date.now() - puddle.startTime;
            let alpha;
            if (elapsed < 300)                        alpha = (elapsed / 300) * 0.45;
            else if (elapsed > puddle.duration - 500) alpha = ((puddle.duration - elapsed) / 500) * 0.45;
            else                                      alpha = 0.45;

            const s = worldToScreen(puddle.x, puddle.y);
            ctx.save();
            ctx.beginPath();
            ctx.arc(s.x, s.y, puddle.radius, 0, Math.PI * 2);
            ctx.fillStyle   = `rgba(80, 200, 80, ${alpha.toFixed(3)})`;
            ctx.fill();
            ctx.strokeStyle = `rgba(40, 160, 40, ${Math.min(1, alpha * 1.5).toFixed(3)})`;
            ctx.lineWidth   = 3;
            ctx.stroke();
            ctx.restore();
        }
    }
}

// ── 蠍王沙暴螢幕外圈遮罩 ─────────────────────────────────────────
// radialGradient：中央透明，外圈沙色 alpha=0.3，淡入淡出各500ms
// 由 hud.js drawGame() 在所有世界物件後、UI前呼叫
export function _drawSandStormOverlay() {
    const boss = gameState.boss;
    if (!boss || !boss._sandStormVisual) return;

    // 玩家不在沙漠生態區時不顯示遮罩（可跑出沙漠躲避）
    if (getBiome(gameState.player.x, gameState.player.y) !== 'desert') return;

    const elapsed  = Date.now() - boss._sandStormVisual.startTime;
    const duration = boss._sandStormVisual.duration;
    if (elapsed > duration) {
        boss._sandStormVisual = null;
        return;
    }

    let alpha;
    if (elapsed < 500)                alpha = (elapsed / 500) * 0.3;
    else if (elapsed > duration - 500) alpha = ((duration - elapsed) / 500) * 0.3;
    else                               alpha = 0.3;

    const W = VIEW_W, H = VIEW_H;
    const grad = ctx.createRadialGradient(
        W / 2, H / 2, Math.min(W, H) * 0.35,
        W / 2, H / 2, Math.max(W, H) * 0.75
    );
    grad.addColorStop(0,   `rgba(194, 154, 82, 0)`);
    grad.addColorStop(0.6, `rgba(194, 154, 82, ${(alpha * 0.5).toFixed(3)})`);
    grad.addColorStop(1.0, `rgba(194, 154, 82, ${alpha.toFixed(3)})`);

    ctx.save();
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
}

// ── 黑色獵人瞄準警告（cull 前呼叫，Boss 在螢幕外時玩家也能看到鎖定提示）
function _drawHunterAimingWarning(boss) {
    if (!boss._aimTarget) return;
    const bs  = worldToScreen(boss.x, boss.y);
    const bsx = bs.x;
    const bsy = bs.y;
    const ts  = worldToScreen(boss._aimTarget.x, boss._aimTarget.y);
    const tsx = ts.x;
    const tsy = ts.y;
    // 紅色虛線：Boss → 目標（Boss off-screen 時線從螢幕邊緣射向玩家）
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 50, 50, 0.75)';
    ctx.lineWidth   = 2;
    ctx.setLineDash([8, 4]);
    ctx.shadowColor = '#FF0000';
    ctx.shadowBlur  = 8;
    ctx.beginPath();
    ctx.moveTo(bsx, bsy);
    ctx.lineTo(tsx, tsy);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    // 玩家頭上脈動準心（鎖定指示）
    const pulse = Math.abs(Math.sin(Date.now() / 80));
    ctx.save();
    ctx.strokeStyle = `rgba(255, 30, 30, ${(pulse * 0.7 + 0.3).toFixed(2)})`;
    ctx.lineWidth   = 2.5;
    ctx.shadowColor = '#FF0000';
    ctx.shadowBlur  = 14;
    ctx.beginPath();
    ctx.arc(tsx, tsy, 22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(tsx - 14, tsy);  ctx.lineTo(tsx + 14, tsy);
    ctx.moveTo(tsx, tsy - 14);  ctx.lineTo(tsx, tsy + 14);
    ctx.stroke();
    ctx.restore();
    // 第三形態：5 條橘色散射預警線（從 Boss 方向射出）
    if (boss._phase === 3) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255,150,0,0.55)';
        ctx.lineWidth   = 1.5;
        for (let i = 0; i < 5; i++) {
            const a = Math.random() * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(bsx, bsy);
            ctx.lineTo(bsx + Math.cos(a) * 220, bsy + Math.sin(a) * 220);
            ctx.stroke();
        }
        ctx.restore();
    }
}

// ── drawBoss（每幀由 hud.js 呼叫）──────────────────────────────
export function drawBoss() {
    const boss = gameState.boss;
    if (!boss || boss.hp <= 0) return;

    // 黑色獵人瞄準線在 cull 前繪製（Boss off-screen 時也要給玩家視覺警告）
    if (boss.biome === 'hunter' && boss.state === 'aiming' && boss._aimTarget) {
        _drawHunterAimingWarning(boss);
    }

    const s = worldToScreen(boss.x, boss.y);
    if (s.x < -100 || s.x > VIEW_W + 100 || s.y < -100 || s.y > VIEW_H + 100) return;

    const r       = boss.radius * (gameState.cameraZoom || 1);
    const flicker = Math.sin(Date.now() * 0.006) * 0.4 + 0.7;

    // 光暈環（保留原本的閃爍感）
    ctx.save();
    ctx.shadowColor = boss.glowColor || '#8B4513';
    ctx.shadowBlur  = 10 + flicker * 12;
    ctx.globalAlpha = 0.55 + flicker * 0.35;
    ctx.strokeStyle = boss.glowColor || '#8B4513';
    ctx.lineWidth   = 4;
    ctx.beginPath();
    ctx.arc(s.x, s.y, r + 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 衝刺警告箭頭（大白鯊，在形狀前繪製以免被遮蓋）
    if (boss.biome === 'ocean') _drawSharkChargeArrow(boss);

    // Boss 形狀（純 Canvas）
    drawBossShape(ctx, boss, s.x, s.y);

    // 毒霧特效（蠍王：警告光圈 + 定點毒霧圓，在形狀後繪製）
    if (boss.biome === 'desert') _drawVenomEffects(boss);

    // 名字標籤
    ctx.save();
    ctx.shadowColor = '#000000';
    ctx.shadowBlur  = 4;
    ctx.fillStyle   = '#FFFFFF';
    ctx.font        = 'bold 12px Arial';
    ctx.textAlign   = 'center';
    ctx.fillText(boss.name || boss.label || 'Boss', s.x, s.y - r - 32);
    ctx.restore();

    if (gameState.devShowHP) {
        const hpPct = boss.hp / boss.maxHp;
        const hpColor = hpPct > 0.6 ? '#00FF88' : hpPct > 0.3 ? '#FFD700' : '#FF4444';
        ctx.save();
        ctx.font = '20px Arial';
        ctx.textAlign = 'right';
        ctx.fillStyle = hpColor;
        ctx.fillText(Math.ceil(boss.hp) + ' / ' + boss.maxHp, s.x - r - 6, s.y + 6);
        ctx.restore();
    }
    if (gameState.devShowAI) {
        const aiLabel = '[' + (boss.state || '?') + ']';
        ctx.save();
        ctx.font = 'bold 12px Arial';
        const bnw = ctx.measureText(boss.name || boss.label || 'Boss').width / 2;
        ctx.font = '20px Arial';
        ctx.fillStyle = 'rgba(200, 200, 255, 0.85)';
        ctx.textAlign = 'left';
        ctx.fillText(aiLabel, s.x + bnw + 8, s.y - r - 32);
        ctx.restore();
    }

    // 血條
    const bBarW = 50, bBarH = 6;
    const bBarX = s.x - bBarW / 2;
    const bBarY = s.y - r - 24;
    ctx.fillStyle = '#550000';
    ctx.fillRect(bBarX, bBarY, bBarW, bBarH);
    if (boss.biome === 'hunter') {
        const barColors = BOSS_BAR_COLORS.hunter;
        const remaining = boss.barsRemaining || 1;
        const currentColor = barColors[remaining] || '#FF1744';
        const nextBarColors = BOSS_BAR_NEXT_COLORS.hunter;
        const nextColor = nextBarColors[remaining];
        const hpRatio = Math.max(0, Math.min(1, boss.hp / boss.maxHp));

        ctx.fillStyle = '#222';
        ctx.fillRect(bBarX, bBarY, bBarW, bBarH);
        if (remaining === 1) {
            ctx.save();
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#FF1744';
            ctx.globalAlpha = 0.85;
            ctx.fillStyle = currentColor;
            ctx.fillRect(bBarX, bBarY, bBarW * hpRatio, bBarH);
            ctx.restore();
        } else {
            ctx.globalAlpha = 0.85;
            ctx.fillStyle = currentColor;
            ctx.fillRect(bBarX, bBarY, bBarW * hpRatio, bBarH);
            ctx.globalAlpha = 1;
        }
        if (nextColor) {
            ctx.globalAlpha = 0.2;
            ctx.fillStyle = nextColor;
            ctx.fillRect(bBarX + bBarW * hpRatio, bBarY, bBarW * (1 - hpRatio), bBarH);
            ctx.globalAlpha = 1;
        }
        ctx.save();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 8px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 3;
        ctx.fillText(Math.ceil(boss.hp) + ' / ' + (boss.maxHp || 1), bBarX + bBarW / 2, bBarY + bBarH / 2);
        if (remaining > 1) {
            ctx.textAlign = 'left';
            ctx.fillText('x' + remaining, bBarX + bBarW + 4, bBarY + bBarH / 2);
        }
        ctx.restore();
    } else {
        const bodyBarColor = BOSS_BAR_COLORS[boss.biome]?.[1] || '#FF4400';
        ctx.fillStyle = bodyBarColor;
        ctx.fillRect(bBarX, bBarY, bBarW * (boss.hp / boss.maxHp), bBarH);
    }

    // Debuff 圖示（血條下方）
    _drawBossDebuffIcons(boss, bBarX, bBarY, bBarW);
}

// Boss 血條下方 Debuff 圖示（毒/流血/減速/暈眩）
function _drawBossDebuffIcons(boss, barX, barY, barW) {
    const now      = Date.now();
    const iconSize = 12;
    const iconGap  = 2;
    const iconY    = barY + 8; // 血條下方 2px

    const debuffs = [
        { color: '#FF4444', label: '血', endTime: boss.bleedEndTime,   startTime: boss._bleedStartTime  },
        { color: '#4488FF', label: '緩', endTime: boss._slowUntil,     startTime: boss._slowStartTime   },
        { color: '#FFE533', label: '暈', endTime: boss.stunnedUntil,   startTime: boss._stunStartTime   },
    ];

    const active = debuffs.filter(d => d.endTime && now < d.endTime);
    if (boss.poisonStacks && boss.poisonStacks.some(s => s.expiryTime > now)) {
        const _maxExpiry = Math.max(...boss.poisonStacks.filter(s => s.expiryTime > now).map(s => s.expiryTime));
        active.unshift({ color: '#33FF66', label: '毒', endTime: _maxExpiry, startTime: null });
    }
    if (active.length === 0) return;

    let ix = barX + 8;

    ctx.save();
    ctx.textAlign = 'center';

    for (const d of active) {
        // 背景方塊
        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.fillRect(ix, iconY, iconSize, iconSize);
        // 彩色邊框
        ctx.strokeStyle = d.color;
        ctx.lineWidth   = 1.5;
        ctx.strokeRect(ix, iconY, iconSize, iconSize);
        // 標籤
        ctx.fillStyle = d.color;
        ctx.font      = 'bold 7px Arial';
        ctx.fillText(d.label, ix + iconSize / 2, iconY + iconSize - 2);
        // 逆時針進度弧（剩餘比例）
        const total   = d.endTime - (d.startTime || (d.endTime - 5000));
        const remain  = d.endTime - now;
        const progress = Math.max(0, Math.min(1, remain / total));
        const cx = ix + iconSize / 2;
        const cy = iconY + iconSize / 2;
        const arcR = iconSize / 2 - 1.5;
        ctx.beginPath();
        ctx.strokeStyle = d.color;
        ctx.lineWidth   = 1.5;
        ctx.arc(cx, cy, arcR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
        ctx.stroke();

        ix += iconSize + iconGap;
    }
    ctx.restore();
}

export function spawnBoss() {
    // 困難地圖：直接生成黑色獵人
    const features = gameState.currentMap && gameState.currentMap.features;
    if (features && features.hunterBoss) {
        _spawnHunterBoss();
        return;
    }

    const playerBiome = getBiome(gameState.player.x, gameState.player.y);
    const baseCfg = BOSS_CONFIG[playerBiome] || BOSS_CONFIG.forest;
    // 若當前地圖有地圖專屬 Boss 設定，合併覆蓋（速度/HP/傷害/半徑/名稱）
    const mapBossArr = gameState.currentMap && gameState.currentMap.bosses;
    const mapBossCfg = mapBossArr ? mapBossArr.find(b => b.biome === playerBiome) : null;
    const cfg = mapBossCfg ? Object.assign({}, baseCfg, mapBossCfg) : baseCfg;
    let bx, by;
    if (cfg.spawnX !== null) {
        bx = cfg.spawnX;
        by = cfg.spawnY;
    } else {
        // 森林 Boss：地圖邊緣隨機生成
        const r = cfg.radius;
        const edge = Math.floor(Math.random() * 4);
        if (edge === 0)      { bx = Math.random() * MAP_WIDTH;  by = r; }
        else if (edge === 1) { bx = Math.random() * MAP_WIDTH;  by = MAP_HEIGHT - r; }
        else if (edge === 2) { bx = r;             by = Math.random() * MAP_HEIGHT; }
        else                 { bx = MAP_WIDTH - r; by = Math.random() * MAP_HEIGHT; }
    }
    gameState.boss = {
        x: bx, y: by,
        radius: cfg.radius, hp: cfg.hp, maxHp: cfg.hp,
        speed: cfg.speed, damage: cfg.damage,
        aggroRange: cfg.aggroRange, attackRange: cfg.attackRange,
        attackCooldown: 0, state: 'patrolling',
        lastAttackCrit: false,   // 熊：上一擊是否暴擊
        lastAttackLeg:  'left',  // 熊：攻擊時哪腳在地（'left'|'right'）
        _chargeArrow:   null,    // 鯊：衝刺箭頭 { angle, dist, fromX, fromY }
        wanderTarget: null, lastWanderTime: Date.now(),
        name: cfg.name, label: cfg.label,
        color: cfg.color, colorChasing: cfg.colorChasing,
        glowColor: cfg.glowColor,
        biome: playerBiome,
        poisonResist: cfg.poisonResist || 0
    };
    gameState.bossSpawned = true;
    gameState.bossSpawnTime = Date.now();
    gameState.dayNightMessage.text        = t('bossAppeared', { name: cfg.name });
    gameState.dayNightMessage.prefixText  = null;
    gameState.dayNightMessage.speciesText = null;
    gameState.dayNightMessage.speciesColor = null;
    gameState.dayNightMessage.timer = Date.now();
    AudioManager.playMusic('bossTheme');
}

// ── 黑色獵人台詞常數 ──────────────────────────────────────────────
const HUNTER_DIALOGUE = {
    intro:  '...鎖定目標。',
    phase1: ['風速正常。', '移動速度...已記錄。', '有趣的移動模式。', '預測路徑...完成。', '還差得遠。'],
    phase2Entry: '...換彈。繼續。',
    phase2: ['開始讓我有點感興趣了。', '距離太近了嗎？這才剛開始。', '不錯的反應速度。', '你讓我想起了某個獵物...牠也跑得很快。'],
    phase3Entry: '...沒想到能讓我走到這一步。好。真的好。',
    phase3: ['跑啊！', '這才對！這才叫做狩獵！', '讓我看看你還有多少！', '哈——！'],
    death:  '...了不起。不過下一位...不會像我這樣手下留情。',
};

function _showHunterDialogue(text, duration) {
    duration = duration || 3000;
    const prev = document.getElementById('hunter-dialogue');
    if (prev) prev.remove();
    const el = document.createElement('div');
    el.id = 'hunter-dialogue';
    el.style.cssText = 'position:absolute;bottom:30%;left:50%;transform:translateX(-50%);' +
        'background:rgba(0,0,0,0.78);color:#fff;' +
        'padding:8px 16px;border-radius:6px;font-size:15px;font-family:Arial,sans-serif;' +
        'border-left:3px solid #1565C0;z-index:60;pointer-events:none;max-width:80%;text-align:center;';
    el.textContent = '🎯 「' + text + '」';
    const gc = document.getElementById('game-container');
    if (gc) gc.appendChild(el);
    setTimeout(() => {
        el.style.transition = 'opacity 0.5s';
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 500);
    }, duration);
}

function _spawnHunterBoss() {
    const cfg = BOSS_CONFIG.hunter;
    const r = cfg.radius;
    const edge = Math.floor(Math.random() * 4);
    let bx, by;
    if (edge === 0)      { bx = Math.random() * MAP_WIDTH;  by = r; }
    else if (edge === 1) { bx = Math.random() * MAP_WIDTH;  by = MAP_HEIGHT - r; }
    else if (edge === 2) { bx = r;             by = Math.random() * MAP_HEIGHT; }
    else                 { bx = MAP_WIDTH - r; by = Math.random() * MAP_HEIGHT; }

    gameState.boss = {
        x: bx, y: by,
        radius: cfg.radius,
        hp: cfg.maxHpPerBar, maxHp: cfg.maxHpPerBar, maxHpPerBar: cfg.maxHpPerBar,
        speed: cfg.phase1Speed, damage: cfg.sniperDamage,
        aggroRange: cfg.aggroRange, attackRange: cfg.attackRange,
        attackCooldown: 0, state: 'patrolling',
        name: cfg.name, label: cfg.label,
        color: cfg.color, colorChasing: cfg.color, glowColor: cfg.glowColor,
        biome: 'hunter',
        poisonResist: cfg.poisonResist,
        // Hunter 專屬
        barsRemaining: cfg.totalBars,
        _phase: 1,
        _postShotTimer: 0,
        _dialogueTimer: 0,
        _dialogueInterval: 5000 + Math.random() * 5000,
        _phaseTransitionUntil: 0,
        _aimTarget: null,
        _aimUntil: 0,
        _strafeAngle: Math.random() * Math.PI * 2,
        lastMoveDir: { dx: 1, dy: 0 },
        wanderTarget: null, lastWanderTime: Date.now(),
    };
    gameState.bossSpawned   = true;
    gameState.bossSpawnTime = Date.now();
    gameState.dayNightMessage.text        = t('bossAppeared', { name: cfg.name });
    gameState.dayNightMessage.prefixText  = null;
    gameState.dayNightMessage.speciesText = null;
    gameState.dayNightMessage.speciesColor = null;
    gameState.dayNightMessage.timer = Date.now();
    AudioManager.playMusic('superBossTheme');
    AudioManager.play('hunterVoiceIntro');
    setTimeout(() => _showHunterDialogue(HUNTER_DIALOGUE.intro, 3000), 1000);
}

function _triggerHunterPhaseCheck(boss) {
    const bars = boss.barsRemaining;
    const cfg  = BOSS_CONFIG.hunter;
    if (bars === 3) {
        boss._phase = 2;
        boss.speed  = cfg.phase2Speed;
        boss._phaseTransitionUntil = Date.now() + 800;
        boss.state  = 'phaseTransition';
        AudioManager.play('hunterPhase2Activate');
        _showHunterDialogue(HUNTER_DIALOGUE.phase2Entry, 3500);
        boss._dialogueInterval = 5000 + Math.random() * 5000;
    } else if (bars === 1) {
        boss._phase = 3;
        boss.speed  = cfg.phase3Speed;
        boss._phaseTransitionUntil = Date.now() + 1200;
        boss.state  = 'phaseTransition';
        AudioManager.play('hunterPhase3Activate');
        _showHunterDialogue(HUNTER_DIALOGUE.phase3Entry, 4000);
        boss._dialogueInterval = 4000 + Math.random() * 3000;
        // 全畫面紅色閃光（疊加 canvas）
        gameState._hunterPhase3Flash = Date.now();
    }
}

export function handleBossKill(boss) {
    if (!boss) { showVictory(); return; }
    if (boss.biome === 'hunter') {
        boss.barsRemaining--;
        if (boss.barsRemaining <= 0) {
            // 黑色獵人真正死亡
            _recordBossKill('hunter');
            addXP(1000);
            gameState.skillPoints += 5;
            storageSet(STORAGE_KEYS.SKILL_POINTS, String(gameState.skillPoints));
            gameState.mutationSkillPoints = (gameState.mutationSkillPoints || 0) + 5;
            storageSet(STORAGE_KEYS.HUNTER_SLAYER_UNLOCKED, 'true');
            _showHunterDialogue(HUNTER_DIALOGUE.death, 5000);
            AudioManager.play('hunterVoiceDeath');
            showFloatingText(boss.x, boss.y - 60, '🎯 獵人已倒！', '#FF4444', 22);
            // 困難地圖通關記錄
            const diffKey = storageKey.clearCountDiff('hard');
            storageSet(diffKey, (parseInt(storageGet(diffKey) || '0') + 1).toString());
            const charKey = storageKey.clearCountChar(gameState.selectedCharacter || 'koel');
            storageSet(charKey, (parseInt(storageGet(charKey) || '0') + 1).toString());
            setTimeout(() => showVictory(), 2000);
        } else {
            boss.hp    = boss.maxHpPerBar;
            boss.maxHp = boss.maxHpPerBar;
            _triggerHunterPhaseCheck(boss);
            addXP(300);
            gameState.mutationSkillPoints = (gameState.mutationSkillPoints || 0) + 1;
            // 每管擊破加30秒；上限夾在 phase 7 天花板，防止 phaseIndex 退回觸發日夜切換
            const _phase7Ceiling = GAME_TIMING.totalTime - 7 * GAME_TIMING.phaseLength;
            gameState.timeRemaining = Math.min(gameState.timeRemaining + 30, _phase7Ceiling);
            showFloatingText(boss.x, boss.y - 40, '💠 血管擊破！+300XP  +30秒', '#4FC3F7', 16);
        }
        return;
    }
    showVictory();
}

function _updateHunterBoss(boss, p, now) {
    const cfg = BOSS_CONFIG.hunter;
    const { dx, dy } = wrappedDelta(boss.x, boss.y, p.x, p.y);
    const dist = Math.sqrt(dx * dx + dy * dy);

    // 形態切換停頓
    if (boss.state === 'phaseTransition') {
        if (now < boss._phaseTransitionUntil) return;
        boss.state = 'chasing';
    }

    // 開槍後停頓
    if (now < boss._postShotTimer) return;

    // 台詞計時
    if (now - boss._dialogueTimer > boss._dialogueInterval) {
        boss._dialogueTimer    = now;
        boss._dialogueInterval = 5000 + Math.random() * 5000;
        const pool = boss._phase === 3 ? HUNTER_DIALOGUE.phase3 :
                     boss._phase === 2 ? HUNTER_DIALOGUE.phase2 : HUNTER_DIALOGUE.phase1;
        _showHunterDialogue(pool[Math.floor(Math.random() * pool.length)], 2500);
    }

    // 腳步音效（低頻）
    if (!boss._footstepTimer || now - boss._footstepTimer > 600) {
        boss._footstepTimer = now;
        if (boss.state === 'chasing' || boss.state === 'strafing') AudioManager.play('hunterFootstep');
    }

    // 形態 1：Sniper — 維持 1200~1500px，繞圈移動
    if (boss._phase === 1) {
        const triggerRange = 1800;
        // 不覆蓋戰鬥中間狀態（aiming 蓄力中）
        if (boss.state !== 'aiming' && dist < boss.aggroRange) boss.state = 'chasing';
        if (boss.state === 'chasing' || boss.state === 'strafing' || boss.state === 'aiming') {
            // 蓄力瞄準
            if (dist < triggerRange && now - boss.attackCooldown > cfg.phase1AttackInterval) {
                if (!boss._aimTarget) {
                    boss._aimTarget = { x: p.x, y: p.y };
                    boss._aimUntil  = now + cfg.phase1AimDuration;
                    boss.state      = 'aiming';
                    AudioManager.play('hunterSniperAim');
                }
            }
            if (boss.state === 'aiming') {
                boss._aimTarget = { x: p.x, y: p.y };
                if (now >= boss._aimUntil) {
                    _fireHunterSniper(boss, p);
                    boss.state      = 'strafing';
                    boss._aimTarget = null;
                }
                return;
            }
            // 繞圈保持距離 1200~1500
            boss._strafeAngle = (boss._strafeAngle || 0) + 0.012;
            const idealDist = 1350;
            const tdx = p.x + Math.cos(boss._strafeAngle) * idealDist - boss.x;
            const tdy = p.y + Math.sin(boss._strafeAngle) * idealDist - boss.y;
            const tlen = Math.sqrt(tdx * tdx + tdy * tdy) || 1;
            const mvx = tdx / tlen * boss.speed;
            const mvy = tdy / tlen * boss.speed;
            boss.lastMoveDir = { dx: mvx > 0 ? 1 : -1, dy: 0 };
            moveCreature(boss, boss.x + mvx, boss.y + mvy);
        }
        return;
    }

    // 形態 2：Shotgun — 衝近 600px，快速往返
    if (boss._phase === 2) {
        // 不覆蓋戰鬥中間狀態（pumping 泵管中）
        if (boss.state !== 'pumping' && dist < boss.aggroRange) boss.state = 'chasing';
        if (boss.state === 'chasing') {
            if (dist < 1000 && now - boss.attackCooldown > cfg.phase2AttackInterval) {
                boss._pumpUntil = now + cfg.phase2PumpDuration;
                boss.state = 'pumping';
                AudioManager.play('hunterShotgunPump');
            }
        }
        if (boss.state === 'pumping') {
            if (now >= boss._pumpUntil) {
                _fireHunterShotgun(boss, p);
                boss.state = 'chasing';
            }
            return;
        }
        const angle = Math.atan2(dy, dx);
        const targetDist = dist < 400 ? -1 : 1;
        const spd = boss.speed * targetDist;
        const mvx = Math.cos(angle) * spd;
        const mvy = Math.sin(angle) * spd;
        boss.lastMoveDir = { dx: mvx > 0 ? 1 : -1, dy: 0 };
        moveCreature(boss, boss.x + mvx, boss.y + mvy);
        return;
    }

    // 形態 3：融合 — 先退到 1200px 發狙擊+散彈，再衝近 400px
    if (boss._phase === 3) {
        // 不覆蓋戰鬥中間狀態（aiming 蓄力中）
        if (boss.state !== 'aiming' && dist < boss.aggroRange) boss.state = 'chasing';
        if (boss.state === 'chasing' || boss.state === 'strafing' || boss.state === 'aiming') {
            if (dist < 1500 && now - boss.attackCooldown > cfg.phase3AttackInterval) {
                if (!boss._aimTarget) {
                    boss._aimTarget = { x: p.x, y: p.y };
                    boss._aimUntil  = now + cfg.phase3AimDuration;
                    boss.state      = 'aiming';
                    AudioManager.play('hunterSniperAim');
                    AudioManager.play('hunterPhase3Charge');
                }
            }
            if (boss.state === 'aiming') {
                boss._aimTarget = { x: p.x, y: p.y };
                if (now >= boss._aimUntil) {
                    _fireHunterSniper(boss, p);
                    _fireHunterShotgun(boss, p, 5);
                    boss.state      = 'strafing';
                    boss._aimTarget = null;
                }
                return;
            }
            const angle = Math.atan2(dy, dx);
            const idealDist = dist > 1200 ? 800 : 400;
            const targetDir = dist > idealDist ? 1 : (dist < idealDist - 100 ? -1 : 0);
            const mvx = Math.cos(angle) * boss.speed * targetDir;
            const mvy = Math.sin(angle) * boss.speed * targetDir;
            if (targetDir !== 0) {
                boss.lastMoveDir = { dx: mvx > 0 ? 1 : -1, dy: 0 };
                moveCreature(boss, boss.x + mvx, boss.y + mvy);
            }
        }
    }
}

function _fireHunterSniper(boss, p) {
    const cfg   = BOSS_CONFIG.hunter;
    const angle = Math.atan2(p.y - boss.y, p.x - boss.x);
    gameState.projectiles.push({
        x: boss.x, y: boss.y,
        vx: Math.cos(angle) * 18, vy: Math.sin(angle) * 18,
        speed: 18, damage: cfg.sniperDamage,
        maxRange: 3000, distTraveled: 0,
        radius: 5, owner: 'hunter', type: 'sniper',
    });
    boss.attackCooldown = Date.now();
    boss._postShotTimer = Date.now() + cfg.postShotPause;
    AudioManager.play('hunterSniperFire');
    AudioManager.play('hunterBulletFly');
}

function _fireHunterShotgun(boss, p, pelletCount) {
    const cfg   = BOSS_CONFIG.hunter;
    pelletCount = pelletCount || 6;
    const baseAngle = Math.atan2(p.y - boss.y, p.x - boss.x);
    for (let i = 0; i < pelletCount; i++) {
        const spread = (Math.random() * 80 - 40) * Math.PI / 180;
        const angle  = baseAngle + spread;
        gameState.projectiles.push({
            x: boss.x, y: boss.y,
            vx: Math.cos(angle) * 12, vy: Math.sin(angle) * 12,
            speed: 12, damage: cfg.shotgunDamage,
            maxRange: 900, distTraveled: 0,
            radius: 4, owner: 'hunter', type: 'shotgun_pellet',
        });
    }
    boss.attackCooldown = Date.now();
    boss._postShotTimer = Date.now() + cfg.postShotPause;
    AudioManager.play('hunterShotgunFire');
    AudioManager.play('hunterPelletFly');
}

export function updateBoss() {
    const boss = gameState.boss;
    if (!boss || boss.hp <= 0) return;
    const now = Date.now();
    const p = gameState.player;

    // 黑色獵人：由獨立函式處理
    if (boss.biome === 'hunter') {
        if (boss.stunnedUntil && now < boss.stunnedUntil) return;
        _updateHunterBoss(boss, p, now);
        return;
    }

    if (boss.stunnedUntil && now < boss.stunnedUntil) return;
    const { dx, dy } = wrappedDelta(boss.x, boss.y, p.x, p.y);
    const dist = Math.sqrt(dx * dx + dy * dy);

    // ── 通用回血：每 3 秒回復最大HP的 2%（普通地圖才啟動）
    if (gameState.currentMap && gameState.currentMap.features && gameState.currentMap.features.bossRegen) {
        if (now - (boss.regenTimer || 0) >= 3000) {
            boss.regenTimer = now;
            const regenAmt = boss.maxHp * 0.02;
            // 若玩家有蟹鉗+拳套組合，降低回血量 50%
            const actualRegen = p.comboCrabGloves && (boss.healReduction || 0) > 0
                ? regenAmt * (1 - boss.healReduction) : regenAmt;
            boss.hp = Math.min(boss.maxHp, boss.hp + actualRegen);
        }
    }

    // ── 黑熊 (<40% 狂暴)
    if (boss.biome === 'forest') {
        if (!boss._enraged && boss.hp / boss.maxHp < 0.4) {
            boss._enraged = true;
            boss.speed *= 1.5;
            boss.damage = Math.round(boss.damage * 1.3);
            boss._enrageGlow = true;
            showFloatingText(boss.x, boss.y - 40, '🐻 狂暴！', '#ff4400', 20);
        }
    }

    // ── 大白鯊 衝刺攻擊
    if (boss.biome === 'ocean') {
        if (boss._chargeState === 'charging') {
            // 衝刺移動
            boss.x = ((boss.x + boss._chargeVx + MAP_WIDTH)  % MAP_WIDTH);
            boss.y = ((boss.y + boss._chargeVy + MAP_HEIGHT) % MAP_HEIGHT);
            const toPlayer = wrappedDistance(boss.x, boss.y, p.x, p.y);
            if (toPlayer < boss.attackRange + 10) {
                applyDamageToPlayer(Math.round(boss.damage * 1.5), boss);
                boss.attackCooldown = now;
            }
            if (now - (boss._chargeStartTime || 0) > 800) {
                boss._chargeState = 'cooldown';
                boss._chargeTimer = now;
                boss._chargeArrow = null;  // 衝刺結束，清除箭頭
            }
            return; // 衝刺中跳過普通邏輯
        } else if (boss._chargeState === 'warning') {
            // 警告階段：0.6秒後開始衝刺
            if (now - (boss._chargeWarningStart || 0) > 600) {
                boss._chargeState = 'charging';
                boss._chargeStartTime = now;
                const angle = Math.atan2(
                    boss._chargeTarget.y - boss.y,
                    boss._chargeTarget.x - boss.x
                );
                const chargeSpeed = _effSpeed(boss) * 4;
                boss._chargeVx = Math.cos(angle) * chargeSpeed;
                boss._chargeVy = Math.sin(angle) * chargeSpeed;
            }
            return;
        } else if (boss._chargeState === 'cooldown') {
            if (now - (boss._chargeTimer || 0) > 1500) boss._chargeState = null;
        } else {
            // 觸發衝刺
            if (!boss._chargeTimer) boss._chargeTimer = now;
            if (now - boss._chargeTimer > 4000 && dist < 500) {
                boss._chargeState = 'warning';
                boss._chargeWarningStart = now;
                boss._chargeTarget = { x: p.x, y: p.y };
                // 鎖定箭頭：方向+實際衝刺距離（speed×4×0.8s×60fps）
                const _cAngle = Math.atan2(p.y - boss.y, p.x - boss.x);
                const _cDist  = boss.speed * 4 * 0.8 * 60;
                boss._chargeArrow = { angle: _cAngle, dist: _cDist, fromX: boss.x, fromY: boss.y };
            }
        }
    }

    // ── 沙漠蠍王：毒霧 + 沙暴
    if (boss.biome === 'desert') {
        // 毒液投擲：每5秒鎖定玩家位置，不限距離
        if (!boss._venomTimer) boss._venomTimer = now;
        if (now - boss._venomTimer > 5000) {
            boss._venomTimer = now;
            boss._venomWarning = { x: p.x, y: p.y, startTime: now, duration: 600 };
        }
        // 警告600ms後在鎖定位置生成定點毒霧
        if (boss._venomWarning && now - boss._venomWarning.startTime >= boss._venomWarning.duration) {
            if (!gameState.venomPuddles) gameState.venomPuddles = [];
            gameState.venomPuddles.push({
                x:         boss._venomWarning.x,
                y:         boss._venomWarning.y,
                radius:    150,
                startTime: now,
                duration:  4000,
                dmgPerSec: Math.round(boss.damage * 0.3),
                lastTick:  now,
            });
            boss._venomWarning = null;
        }
        // 毒霧傷害 tick（玩家跑出 radius 停止受傷）
        if (gameState.venomPuddles) {
            for (let _vi = gameState.venomPuddles.length - 1; _vi >= 0; _vi--) {
                const puddle = gameState.venomPuddles[_vi];
                if (now - puddle.startTime >= puddle.duration) {
                    if (puddle.owner === 'venomFalcon') {
                        const _elite = gameState.eliteCreature;
                        if (_elite && _elite._venomPuddleCount > 0) _elite._venomPuddleCount--;
                    }
                    gameState.venomPuddles.splice(_vi, 1);
                    continue;
                }
                if (now - puddle.lastTick >= 1000) {
                    puddle.lastTick = now;
                    if (wrappedDistance(puddle.x, puddle.y, p.x, p.y) < puddle.radius) {
                        applyDamageToPlayer(puddle.dmgPerSec, boss);
                        showFloatingText(p.x, p.y - 30, t('venomFloat') || '☠ 毒霧', '#aa00cc', 16);
                    }
                }
            }
        }
        // 沙暴：血量<40%時觸發一次
        if (!boss._sandstormTriggered && boss.hp / boss.maxHp < 0.4) {
            boss._sandstormTriggered = true;
            boss._sandstormActive = true;
            boss._sandstormEndTime = now + 6000;
            // 沙暴螢幕外圈遮罩（淡入淡出各500ms，持續6秒）
            boss._sandStormVisual = { startTime: now, duration: 6000 };
            showFloatingText(boss.x, boss.y - 40, '🌪 沙暴！', '#cc8800', 20);
        }
        if (boss._sandstormActive && now > (boss._sandstormEndTime || 0)) {
            boss._sandstormActive = false;
        }
        // 沙暴期間：玩家移速 -40%，但只在沙漠生態區內才生效（離開沙漠立即解除）
        p._inSandstorm = (boss._sandstormActive || false) && getBiome(p.x, p.y) === 'desert';
    } else {
        p._inSandstorm = false;
    }

    if (dist < boss.aggroRange) {
        boss.state = 'chasing';
    } else if (boss.state === 'chasing' && dist > boss.aggroRange + 150) {
        boss.state = 'patrolling';
    }
    if (boss.state === 'chasing') {
        if (dist <= boss.attackRange) {
            if (now - boss.attackCooldown >= 1500) {
                let dmg = boss.damage;
                let isCrit = false;
                // 黑熊有 25% 暴擊，傷害 ×1.5，觸發雙臂 X 攻擊動畫
                if (boss.biome === 'forest' && Math.random() < 0.25) {
                    dmg = Math.round(dmg * 1.5);
                    isCrit = true;
                }
                applyDamageToPlayer(dmg, boss);
                boss.attackCooldown = now;
                if (boss.biome === 'forest') {
                    boss.lastAttackCrit = isCrit;
                    // 暴擊命中玩家時顯示橙色浮動文字
                    if (isCrit) showFloatingText(p.x, p.y - 40, 'X熊爪！', '#ff8800', 18);
                    // 記錄哪腳踩地（追擊速度下的踏步相位）
                    const atkPeriod = 450 / 1.9;
                    boss.lastAttackLeg = Math.sin(now / atkPeriod) > 0 ? 'left' : 'right';
                }
            }
        } else {
            const angle = Math.atan2(dy, dx);
            moveCreature(boss, boss.x + Math.cos(angle) * _effSpeed(boss), boss.y + Math.sin(angle) * _effSpeed(boss));
        }
    } else {
        if (!boss.wanderTarget || now - boss.lastWanderTime >= 3000) {
            boss.wanderTarget = { x: Math.random() * MAP_WIDTH, y: Math.random() * MAP_HEIGHT };
            boss.lastWanderTime = now;
        }
        if (boss.wanderTarget) {
            const { dx: wx, dy: wy } = wrappedDelta(boss.x, boss.y, boss.wanderTarget.x, boss.wanderTarget.y);
            const wDist = Math.sqrt(wx * wx + wy * wy);
            if (wDist < 2) { boss.wanderTarget = null; }
            else {
                const angle = Math.atan2(wy, wx);
                moveCreature(boss, boss.x + Math.cos(angle) * _effSpeed(boss), boss.y + Math.sin(angle) * _effSpeed(boss));
            }
        }
    }
    console.log && false; // [v0.47.0] 六：Boss 機制改版完成
}

function _recordClearStats() {
    const diff   = gameState.lastDifficulty || 'easy';
    const charId = gameState.selectedCharacter || 'koel';
    const diffKey = storageKey.clearCountDiff(diff);
    storageSet(diffKey, (parseInt(storageGet(diffKey) || '0') + 1).toString());
    const charKey = storageKey.clearCountChar(charId);
    storageSet(charKey, (parseInt(storageGet(charKey) || '0') + 1).toString());
}

function _recordBossKill(bossType) {
    const key = storageKey.killCountBoss(bossType);
    storageSet(key, (parseInt(storageGet(key) || '0') + 1).toString());
}

export function showVictory() {
    if (gameState.gameOver) return;
    saveSettings();
    pausePlayTimer();
    gameState.topBarTarget = null;
    gameState.topBarFadeTimer = 0;
    gameState.gameOver = true;
    gameState.victory = true;
    AudioManager.stopMusic();
    AudioManager.play('victory');
    addXP(500);
    // F19：普通難度通關 → 解鎖第二章劇情
    if (gameState.lastDifficulty === 'normal') {
        storageSet(STORAGE_KEYS.CHAPTER2_UNLOCKED, 'true');
    }
    // F20：記錄 Boss 擊殺次數
    if (gameState.boss) {
        const biomeTypeMap = { forest: 'bear', ocean: 'shark', desert: 'scorpion' };
        const bossType = biomeTypeMap[gameState.boss.biome];
        if (bossType) _recordBossKill(bossType);
    }
    // F20：記錄通關統計
    _recordClearStats();
    saveLastRunOrgans();
    const timeBonus = Math.floor((600 - gameState.timeRemaining) / 180);
    const levelBonus = Math.floor(gameState.player.level / 6);
    const eliteBonus = (gameState.sessionSkillPoints && gameState.sessionSkillPoints.elite) || 0;
    if (gameState.sessionSkillPoints) gameState.sessionSkillPoints.boss = 3;
    gameState.skillPoints += 3 + timeBonus + levelBonus;
    storageSetJSON(STORAGE_KEYS.PLAYER_SKILLS, gameState.playerSkills);
    storageSet(STORAGE_KEYS.SKILL_POINTS, String(gameState.skillPoints));
    storageRemove(STORAGE_KEYS.SAVED_ORGANS);
    storageRemove(STORAGE_KEYS.SAVED_HIDDEN_ORGANS);
    const bossKillTime = gameState.bossSpawnTime ? Math.floor((Date.now() - gameState.bossSpawnTime) / 1000) : null;
    const _bossTypeForEvent = gameState.boss
        ? ({ forest: 'bear', ocean: 'shark', desert: 'scorpion', hunter: 'hunter' }[gameState.boss.biome] || null)
        : null;
    window.dispatchEvent(new CustomEvent('gameVictory', { detail: {
        difficulty: gameState.lastDifficulty,
        playTime: Math.floor(gameState.realPlayTime / 1000),
        bossKillTime,
        character: gameState.selectedCharacter,
        bossType: _bossTypeForEvent,
        tookDamage: gameState.tookDamageThisRun || false,
        regenedThisRun: gameState.regenedThisRun || false,
    } }));
    const doShowVictory = () => {
        const bossName = gameState.boss && gameState.boss.name ? gameState.boss.name : (BOSS_CONFIG.forest.name);
        const spLines = [t('skillPtBoss', { n: 3 })];
        if (eliteBonus > 0)  spLines.push(t('skillPtElite', { n: eliteBonus }));
        if (timeBonus > 0)   spLines.push(t('skillPtTime',  { n: timeBonus }));
        if (levelBonus > 0)  spLines.push(t('skillPtLevel', { n: levelBonus }));
        const overlay = buildEndGameOverlay({
            id: 'victory-overlay',
            overlayStyle: 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.82);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:100;pointer-events:all;color:white;',
            titleStyle: 'font-size:52px;margin-bottom:16px;',
            titleText: t('victoryTitle'),
            content: [
                {
                    style: 'font-size:22px;margin-bottom:8px;',
                    text: t('victoryDesc', { boss: bossName })
                },
                {
                    style: 'font-size:18px;margin-bottom:10px;color:#FFD700;',
                    text: t('victoryReward')
                },
                {
                    style: 'font-size:14px;color:#aaa;margin-bottom:20px;text-align:center;line-height:1.8;',
                    html: spLines.join('<br>')
                }
            ],
            primaryButton: {
                style: 'font-size:20px;padding:10px 28px;cursor:pointer;pointer-events:all;margin-bottom:12px;border:2px solid #FFD700;background:rgba(255,215,0,0.15);color:white;border-radius:5px;font-weight:bold;',
                text: t('goSkillTree'),
                onClick: () => { overlay.remove(); buildSkillTreeOverlay(null, false, false, 'postGame'); }
            },
            buttonRowStyle: 'display:flex;gap:12px;pointer-events:all;flex-wrap:wrap;justify-content:center;flex-direction:column;align-items:center;',
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
                    onClick: () => { overlay.remove(); buildSkillTreeOverlay(null, false, false, 'forceStart'); }
                }
            ],
            footerStyle: 'font-size:12px;color:#555;margin-top:20px;',
            footerText: '© ' + GAME_INFO.author + ' | ' + GAME_INFO.version,
            devWarningStyle: 'font-size:12px;color:#f80;margin-top:12px;',
            devWarningText: gameState.devModeUsed ? t('devModeWarning') : null
        });
        document.getElementById('game-container').appendChild(overlay);
    };
    // 自動雲端保存進度（已登入才執行）
    if (typeof loadChatSettings === 'function' && typeof chatSaveProgress === 'function') {
        const _cs = loadChatSettings();
        if (_cs.loggedIn) {
            chatSaveProgress().then(result => {
                if (result.ok) {
                    const tip = document.createElement('div');
                    tip.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);' +
                        'background:rgba(0,0,0,0.8);color:#fff;padding:8px 18px;border-radius:8px;' +
                        'font-size:14px;z-index:9999;pointer-events:none;';
                    tip.textContent = result.msg;
                    document.body.appendChild(tip);
                    setTimeout(() => tip.remove(), 2000);
                }
            });
        }
    }

    if (gameState.devModeUsed) {
        doShowVictory();
    } else {
        showScoreSubmitPopup(true, bossKillTime, doShowVictory);
    }
}

export function drawBossArrow() {
    const boss = gameState.boss;
    if (!boss || boss.hp <= 0) return;
    const bs = worldToScreen(boss.x, boss.y);
    if (bs.x >= -20 && bs.x <= VIEW_W + 20 && bs.y >= -20 && bs.y <= VIEW_H + 20) return;
    const p = gameState.player;
    const ps = worldToScreen(p.x, p.y);
    drawArrow(ps.x, ps.y, boss.x, boss.y, boss.glowColor || '#8B4513', p.radius);
}
