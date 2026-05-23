// =============================================================
// 首領系統 - spawnBoss / updateBoss / showVictory / drawBossArrow
// =============================================================

// ── Boss 顏色常數 ─────────────────────────────────────────────
const BOSS_COLORS = {
    bear: {
        body:  '#2a1808',
        head:  '#301c0a',
        limbs: '#2a1808',
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
};

// ── Boss 主繪製分派 ───────────────────────────────────────────
function drawBossShape(ctx, boss, sx, sy) {
    ctx.save();
    ctx.translate(sx, sy);
    const r = boss.radius;
    const t = Date.now();
    if      (boss.biome === 'forest') _drawBear(ctx, r, t, boss);
    else if (boss.biome === 'ocean')  _drawShark(ctx, r, t, boss);
    else if (boss.biome === 'desert') _drawScorp(ctx, r, t, boss);
    ctx.restore();
}

// ── 黑熊（forest）──────────────────────────────────────────────
function _drawBear(ctx, r, t, boss) {
    const C = BOSS_COLORS.bear;
    const speedMult = (boss && boss.state === 'chasing') ? 1.9 : 1.0;
    const period    = 450 / speedMult;

    // 踏步動畫：sin > 0 踩下（放大+往下位移），sin < 0 抬起（縮小）
    // 左右腿相位差 π → 一腳踩下另一腳抬起
    const stompL = Math.sin(t / period);
    const stompR = Math.sin(t / period + Math.PI);
    const scaleL = 1.0 + stompL * 0.38;   // 0.62 ~ 1.38
    const scaleR = 1.0 + stompR * 0.38;
    const offL   = stompL * r * 0.09;     // 踩下時輕微往下偏
    const offR   = stompR * r * 0.09;

    // ── 後腿（先畫，被身體蓋住根部）──
    ctx.fillStyle = C.limbs;
    ctx.beginPath();
    ctx.ellipse(-r * 0.52, r * 0.68 + offL, r * 0.27, r * 0.55 * scaleL, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = C.limbs;
    ctx.beginPath();
    ctx.ellipse( r * 0.52, r * 0.68 + offR, r * 0.27, r * 0.55 * scaleR, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── 身體主橢圓 ──
    ctx.fillStyle = C.body;
    ctx.beginPath();
    ctx.ellipse(0, r * 0.2, r * 1.2, r * 0.75, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── 前臂（固定，不動）──
    ctx.fillStyle = C.limbs;
    ctx.save();
    ctx.translate(-r * 0.7, r * 0.1);
    ctx.rotate(0.15);
    ctx.beginPath();
    ctx.ellipse(0, r * 0.48, r * 0.24, r * 0.48, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(r * 0.7, r * 0.1);
    ctx.rotate(-0.15);
    ctx.fillStyle = C.limbs;
    ctx.beginPath();
    ctx.ellipse(0, r * 0.48, r * 0.24, r * 0.48, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // ── 頭部 ──
    ctx.fillStyle = C.head;
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.6, r * 0.75, r * 0.65, 0, 0, Math.PI * 2);
    ctx.fill();

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

// ── drawBoss（每幀由 hud.js 呼叫）──────────────────────────────
function drawBoss() {
    const boss = gameState.boss;
    if (!boss || boss.hp <= 0) return;

    const s = worldToScreen(boss.x, boss.y);
    if (s.x < -100 || s.x > VIEW_W + 100 || s.y < -100 || s.y > VIEW_H + 100) return;

    const r       = boss.radius;
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

    // Boss 形狀（純 Canvas）
    drawBossShape(ctx, boss, s.x, s.y);

    // 名字標籤
    ctx.save();
    ctx.shadowColor = '#000000';
    ctx.shadowBlur  = 4;
    ctx.fillStyle   = '#FFFFFF';
    ctx.font        = 'bold 12px Arial';
    ctx.textAlign   = 'center';
    ctx.fillText(boss.name || boss.label || 'Boss', s.x, s.y - r - 32);
    ctx.restore();

    // 血條
    const bBarW = 50, bBarH = 6;
    const bBarX = s.x - bBarW / 2;
    const bBarY = s.y - r - 24;
    ctx.fillStyle = '#550000';
    ctx.fillRect(bBarX, bBarY, bBarW, bBarH);
    ctx.fillStyle = '#FF4400';
    ctx.fillRect(bBarX, bBarY, bBarW * (boss.hp / boss.maxHp), bBarH);
}

function spawnBoss() {
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
        wanderTarget: null, lastWanderTime: Date.now(),
        name: cfg.name, label: cfg.label,
        color: cfg.color, colorChasing: cfg.colorChasing,
        glowColor: cfg.glowColor,
        biome: playerBiome
    };
    gameState.bossSpawned = true;
    gameState.bossSpawnTime = Date.now();
    gameState.dayNightMessage.text = t('bossAppeared', { name: cfg.name });
    gameState.dayNightMessage.timer = Date.now();
    AudioManager.playMusic('bossTheme');
}

function updateBoss() {
    const boss = gameState.boss;
    if (!boss || boss.hp <= 0) return;
    const now = Date.now();
    const p = gameState.player;
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
    if (boss.name && boss.name.includes('黑熊')) {
        if (!boss._enraged && boss.hp / boss.maxHp < 0.4) {
            boss._enraged = true;
            boss.speed *= 1.5;
            boss.damage = Math.round(boss.damage * 1.3);
            boss._enrageGlow = true;
            showFloatingText(boss.x, boss.y - 40, '🐻 狂暴！', '#ff4400', 20);
        }
    }

    // ── 大白鯊 衝刺攻擊
    if (boss.name && boss.name.includes('鯊')) {
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
                const chargeSpeed = boss.speed * 4;
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
            }
        }
    }

    // ── 沙漠蠍王：毒霧 + 沙暴
    if (boss.name && boss.name.includes('蠍')) {
        // 毒霧：每5秒在玩家周圍釋放
        if (!boss._venomTimer) boss._venomTimer = now;
        if (now - boss._venomTimer > 5000 && dist < 300) {
            boss._venomTimer = now;
            // 對玩家施加持續毒傷（模擬：直接傷害 + 顯示文字）
            p._scorpionVenomEnd = now + 4000;
            p._scorpionVenomDmg = Math.round(boss.damage * 0.3);
            p._scorpionVenomTick = now;
            showFloatingText(p.x, p.y - 30, t('venomFloat') || '☠ 毒霧', '#aa00cc', 16);
        }
        // 毒傷 tick
        if (p._scorpionVenomEnd && now < p._scorpionVenomEnd) {
            if (now - (p._scorpionVenomTick || 0) >= 1000) {
                p._scorpionVenomTick = now;
                applyDamageToPlayer(p._scorpionVenomDmg || 5, boss);
            }
        }
        // 沙暴：血量<40%時觸發一次
        if (!boss._sandstormTriggered && boss.hp / boss.maxHp < 0.4) {
            boss._sandstormTriggered = true;
            boss._sandstormActive = true;
            boss._sandstormEndTime = now + 6000;
            showFloatingText(boss.x, boss.y - 40, '🌪 沙暴！', '#cc8800', 20);
        }
        if (boss._sandstormActive && now > (boss._sandstormEndTime || 0)) {
            boss._sandstormActive = false;
        }
        // 沙暴期間：玩家移速 -40%（用 flag，由 updatePlayerMovement 檢查）
        p._inSandstorm = boss._sandstormActive || false;
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
                applyDamageToPlayer(boss.damage, boss);
                boss.attackCooldown = now;
            }
        } else {
            const angle = Math.atan2(dy, dx);
            moveCreature(boss, boss.x + Math.cos(angle) * boss.speed, boss.y + Math.sin(angle) * boss.speed);
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
                moveCreature(boss, boss.x + Math.cos(angle) * boss.speed, boss.y + Math.sin(angle) * boss.speed);
            }
        }
    }
    console.log && false; // [v0.47.0] 六：Boss 機制改版完成
}

function showVictory() {
    if (gameState.gameOver) return;
    pausePlayTimer();
    gameState.topBarTarget = null;
    gameState.topBarFadeTimer = 0;
    gameState.gameOver = true;
    gameState.victory = true;
    AudioManager.stopMusic();
    AudioManager.play('victory');
    addXP(500);
    saveLastRunOrgans();
    const timeBonus = Math.floor((600 - gameState.timeRemaining) / 180);
    const levelBonus = Math.floor(gameState.player.level / 6);
    const eliteBonus = (gameState.sessionSkillPoints && gameState.sessionSkillPoints.elite) || 0;
    if (gameState.sessionSkillPoints) gameState.sessionSkillPoints.boss = 3;
    gameState.skillPoints += 3 + timeBonus + levelBonus;
    localStorage.setItem('playerSkills', JSON.stringify(gameState.playerSkills));
    localStorage.setItem('skillPoints', String(gameState.skillPoints));
    localStorage.removeItem('savedOrgans');
    localStorage.removeItem('savedHiddenOrgans');
    const bossKillTime = gameState.bossSpawnTime ? Math.floor((Date.now() - gameState.bossSpawnTime) / 1000) : null;
    const doShowVictory = () => {
        const overlay = document.createElement('div');
        overlay.id = 'victory-overlay';
        overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.82);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:100;pointer-events:all;color:white;';
        const title = document.createElement('div');
        title.style.cssText = 'font-size:52px;margin-bottom:16px;';
        title.textContent = t('victoryTitle');
        overlay.appendChild(title);
        const desc1 = document.createElement('div');
        desc1.style.cssText = 'font-size:22px;margin-bottom:8px;';
        const bossName = gameState.boss && gameState.boss.name ? gameState.boss.name : (BOSS_CONFIG.forest.name);
        desc1.textContent = t('victoryDesc', { boss: bossName });
        overlay.appendChild(desc1);
        const desc2 = document.createElement('div');
        desc2.style.cssText = 'font-size:18px;margin-bottom:10px;color:#FFD700;';
        desc2.textContent = t('victoryReward');
        overlay.appendChild(desc2);
        const spSection = document.createElement('div');
        spSection.style.cssText = 'font-size:14px;color:#aaa;margin-bottom:20px;text-align:center;line-height:1.8;';
        const spLines = [t('skillPtBoss', { n: 3 })];
        if (eliteBonus > 0)  spLines.push(t('skillPtElite', { n: eliteBonus }));
        if (timeBonus > 0)   spLines.push(t('skillPtTime',  { n: timeBonus }));
        if (levelBonus > 0)  spLines.push(t('skillPtLevel', { n: levelBonus }));
        spSection.innerHTML = spLines.join('<br>');
        overlay.appendChild(spSection);
        const btnTree = document.createElement('button');
        btnTree.style.cssText = 'font-size:20px;padding:10px 28px;cursor:pointer;pointer-events:all;margin-bottom:12px;border:2px solid #FFD700;background:rgba(255,215,0,0.15);color:white;border-radius:5px;font-weight:bold;';
        btnTree.textContent = t('goSkillTree');
        btnTree.onclick = () => { overlay.remove(); buildSkillTreeOverlay(null, false, false, 'postGame'); };
        overlay.appendChild(btnTree);
        const vBtnRow = document.createElement('div');
        vBtnRow.style.cssText = 'display:flex;gap:12px;pointer-events:all;flex-wrap:wrap;justify-content:center;flex-direction:column;align-items:center;';
        const vWarnEl = document.createElement('div');
        vWarnEl.style.cssText = 'display:none;font-size:13px;color:#f80;text-align:center;';
        vBtnRow.appendChild(vWarnEl);
        const vRowInner = document.createElement('div');
        vRowInner.style.cssText = 'display:flex;gap:12px;flex-wrap:wrap;justify-content:center;';
        const vHomeBtn = document.createElement('button');
        vHomeBtn.style.cssText = 'font-size:16px;padding:8px 20px;cursor:pointer;border:1px solid #aaa;background:rgba(255,255,255,0.1);color:white;border-radius:5px;';
        vHomeBtn.textContent = t('backHome');
        let vHomeWarned = false;
        vHomeBtn.onclick = () => {
            if (!vHomeWarned) {
                vHomeWarned = true;
                vWarnEl.textContent = t('warnNoOrganHome');
                vWarnEl.style.display = 'block';
                return;
            }
            location.reload();
        };
        vRowInner.appendChild(vHomeBtn);
        const vPlayAgainBtn = document.createElement('button');
        vPlayAgainBtn.style.cssText = 'font-size:16px;padding:8px 20px;cursor:pointer;border:1px solid #FFD700;background:rgba(255,215,0,0.15);color:white;border-radius:5px;';
        vPlayAgainBtn.textContent = t('playAgain');
        vPlayAgainBtn.onclick = () => { overlay.remove(); buildSkillTreeOverlay(null, false, false, 'forceStart'); };
        vRowInner.appendChild(vPlayAgainBtn);
        vBtnRow.appendChild(vRowInner);
        overlay.appendChild(vBtnRow);
        const vFooter = document.createElement('div');
        vFooter.style.cssText = 'font-size:12px;color:#555;margin-top:20px;';
        vFooter.textContent = '© ' + GAME_INFO.author + ' | ' + GAME_INFO.version;
        overlay.appendChild(vFooter);
        if (gameState.devModeUsed) {
            const devWarn = document.createElement('div');
            devWarn.style.cssText = 'font-size:12px;color:#f80;margin-top:12px;';
            devWarn.textContent = '⚠️ 本局使用了開發者模式，分數不計入排行榜';
            overlay.appendChild(devWarn);
        }
        document.getElementById('game-container').appendChild(overlay);
    };
    if (gameState.devModeUsed) {
        doShowVictory();
    } else {
        showScoreSubmitPopup(true, bossKillTime, doShowVictory);
    }
}

function drawBossArrow() {
    const boss = gameState.boss;
    if (!boss || boss.hp <= 0) return;
    const bs = worldToScreen(boss.x, boss.y);
    if (bs.x >= -20 && bs.x <= VIEW_W + 20 && bs.y >= -20 && bs.y <= VIEW_H + 20) return;
    const p = gameState.player;
    const ps = worldToScreen(p.x, p.y);
    drawArrow(ps.x, ps.y, boss.x, boss.y, boss.glowColor || '#8B4513', p.radius);
}
