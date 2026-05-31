// =============================================================
// 精英怪系統 - spawnEliteCreature / updateEliteCreature
//              drawEliteCreature / drawEliteArrow
// =============================================================

function spawnEliteCreature(nightNum) {
    const tierIndex = nightNum - 1;
    const tier = ELITE_CONFIG.nights[tierIndex];
    const hp = Math.round(ELITE_CONFIG.base.hp * tier.hpMult);
    const r = 18;
    const edge = Math.floor(Math.random() * 4);
    let x, y;
    if (edge === 0) { x = Math.random() * MAP_WIDTH;  y = r; }
    else if (edge === 1) { x = Math.random() * MAP_WIDTH;  y = MAP_HEIGHT - r; }
    else if (edge === 2) { x = r;             y = Math.random() * MAP_HEIGHT; }
    else                 { x = MAP_WIDTH - r; y = Math.random() * MAP_HEIGHT; }
    gameState.eliteCreature = {
        x, y, radius: 18, hp, maxHp: hp,
        speed: tier.speed, damage: tier.damage,
        aggroRange: 1000, attackRange: 28,
        attackCooldown: 0, state: 'patrolling',
        poisonResist: ELITE_CONFIG.base.poisonResist || 0,
        wanderTarget: null, lastWanderTime: Date.now(),
        label: tier.label, color: tier.color, xp: tier.xp,
        diet: Math.random() < 0.5 ? 'herbivore' : 'carnivore',
        tierIndex  // 第1/2/3夜 → 0/1/2，供 eliteRegen 使用
    };
    gameState.eliteJustKilled = false;
    gameState.dayNightMessage.text = t('eliteAppeared');
    gameState.dayNightMessage.timer = Date.now();
}

function updateEliteCreature() {
    const elite = gameState.eliteCreature;
    if (!elite || elite.hp <= 0) return;
    const now = Date.now();
    const p = gameState.player;
    if (elite.stunnedUntil && now < elite.stunnedUntil) return;
    const { dx, dy } = wrappedDelta(elite.x, elite.y, p.x, p.y);
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < elite.aggroRange) {
        elite.state = 'chasing';
    } else if (elite.state === 'chasing' && dist > elite.aggroRange + 100) {
        elite.state = 'patrolling';
    }
    // 精英怪回血（普通地圖 eliteRegen 開啟）
    if (gameState.currentMap && gameState.currentMap.features && gameState.currentMap.features.eliteRegen) {
        const tierIdx = elite.tierIndex || 0;
        const regenRate = [0.01, 0.02, 0.03][tierIdx] || 0.01; // 第1/2/3夜 1%/2%/3%
        if (now - (elite.regenTimer || 0) >= 5000) {
            elite.regenTimer = now;
            elite.hp = Math.min(elite.maxHp, elite.hp + elite.maxHp * regenRate);
        }
    }

    if (elite.state === 'chasing') {
        if (dist <= elite.attackRange) {
            if (now - elite.attackCooldown >= 1200) {
                applyDamageToPlayer(elite.damage, elite);
                elite.attackCooldown = now;
            }
        } else {
            const angle = Math.atan2(dy, dx);
            moveCreature(elite, elite.x + Math.cos(angle) * _effSpeed(elite), elite.y + Math.sin(angle) * _effSpeed(elite));
        }
    } else {
        if (!elite.wanderTarget || now - elite.lastWanderTime >= 2500) {
            elite.wanderTarget = { x: Math.random() * MAP_WIDTH, y: Math.random() * MAP_HEIGHT };
            elite.lastWanderTime = now;
        }
        if (elite.wanderTarget) {
            const { dx: wx, dy: wy } = wrappedDelta(elite.x, elite.y, elite.wanderTarget.x, elite.wanderTarget.y);
            const wDist = Math.sqrt(wx * wx + wy * wy);
            if (wDist < 2) { elite.wanderTarget = null; }
            else {
                const angle = Math.atan2(wy, wx);
                moveCreature(elite, elite.x + Math.cos(angle) * _effSpeed(elite), elite.y + Math.sin(angle) * _effSpeed(elite));
            }
        }
    }
}

function drawEliteCreature() {
    const elite = gameState.eliteCreature;
    if (!elite || elite.hp <= 0) return;
    const s = worldToScreen(elite.x, elite.y);
    if (s.x < -50 || s.x > VIEW_W + 50 || s.y < -50 || s.y > VIEW_H + 50) return;
    // 繪製順序（由下至上）：本體 → 血條 → 名字，各層間距 4px
    drawGlowEffect(s.x, s.y, elite.radius, elite.color, '#FFD700', 14);
    const bH = 5, bW = 46;
    const bY = s.y - elite.radius - 4 - bH;
    drawHealthBar(s.x, bY, elite.hp, elite.maxHp, bW, '#CC44FF', '#330033', bH);
    drawNameTag(s.x, bY - 4, elite.label, '#FFD700', 'bold 11px Arial');
}

function drawEliteArrow() {
    const elite = gameState.eliteCreature;
    if (!elite || elite.hp <= 0) return;
    const es = worldToScreen(elite.x, elite.y);
    if (es.x >= -20 && es.x <= VIEW_W + 20 && es.y >= -20 && es.y <= VIEW_H + 20) return;
    // Boss 也在螢幕外時只顯示 Boss 箭頭
    if (gameState.boss && gameState.boss.hp > 0) {
        const bs = worldToScreen(gameState.boss.x, gameState.boss.y);
        if (bs.x < -20 || bs.x > VIEW_W + 20 || bs.y < -20 || bs.y > VIEW_H + 20) return;
    }
    const p = gameState.player;
    const ps = worldToScreen(p.x, p.y);
    const color = elite.diet === 'herbivore' ? '#FFD700' : '#9B59B6';
    drawArrow(ps.x, ps.y, elite.x, elite.y, color, p.radius);
}
