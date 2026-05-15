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
        wanderTarget: null, lastWanderTime: Date.now(),
        label: tier.label, color: tier.color, xp: tier.xp,
        diet: Math.random() < 0.5 ? 'herbivore' : 'carnivore'
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
    if (elite.state === 'chasing') {
        if (dist <= elite.attackRange) {
            if (now - elite.attackCooldown >= 1200) {
                applyDamageToPlayer(elite.damage, elite);
                elite.attackCooldown = now;
            }
        } else {
            const angle = Math.atan2(dy, dx);
            moveCreature(elite, elite.x + Math.cos(angle) * elite.speed, elite.y + Math.sin(angle) * elite.speed);
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
                moveCreature(elite, elite.x + Math.cos(angle) * elite.speed, elite.y + Math.sin(angle) * elite.speed);
            }
        }
    }
}

function drawEliteCreature() {
    const elite = gameState.eliteCreature;
    if (!elite || elite.hp <= 0) return;
    const s = worldToScreen(elite.x, elite.y);
    if (s.x < -50 || s.x > VIEW_W + 50 || s.y < -50 || s.y > VIEW_H + 50) return;
    ctx.save();
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 14;
    ctx.fillStyle = elite.color;
    ctx.beginPath();
    ctx.arc(s.x, s.y, elite.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(elite.label, s.x, s.y - elite.radius - 12);
    ctx.restore();
    const bW = 46, bH = 5;
    const bX = s.x - bW / 2;
    const bY = s.y - elite.radius - 24;
    ctx.fillStyle = '#330033';
    ctx.fillRect(bX, bY, bW, bH);
    ctx.fillStyle = '#CC44FF';
    ctx.fillRect(bX, bY, bW * (elite.hp / elite.maxHp), bH);
}

function drawEliteArrow() {
    const elite = gameState.eliteCreature;
    if (!elite || elite.hp <= 0) return;
    const es = worldToScreen(elite.x, elite.y);
    if (es.x >= -20 && es.x <= VIEW_W + 20 && es.y >= -20 && es.y <= VIEW_H + 20) return;
    const p = gameState.player;
    const ps = worldToScreen(p.x, p.y);
    const { dx: adx, dy: ady } = wrappedDelta(p.x, p.y, elite.x, elite.y);
    const angle = Math.atan2(ady, adx);
    const arrowDist = 50 + Math.max(0, p.radius - 10);
    const ax = ps.x + Math.cos(angle) * arrowDist;
    const ay = ps.y + Math.sin(angle) * arrowDist;
    const alpha = Math.floor(Date.now() / 500) % 2 === 0 ? 0.6 : 1.0;
    const color = elite.diet === 'herbivore' ? '#FFD700' : '#9B59B6';
    const cx = Math.cos(angle), cy = Math.sin(angle);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(ax - cx * 10 - cy * 3, ay - cy * 10 + cx * 3);
    ctx.lineTo(ax - cx * 10 + cy * 3, ay - cy * 10 - cx * 3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}
