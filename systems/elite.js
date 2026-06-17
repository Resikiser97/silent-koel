// =============================================================
// ç²¾è‹±æ€ªç³»çµ± - initEliteOrder / spawnEliteCreature / updateEliteCreature
//              drawEliteCreature / drawEliteArrow
// æ”¯æ´ï¼šæ¨™æº–ç²¾è‹±æ€ª / ä¸‰çŠ¬ï¼ˆdogElitesï¼‰/ ä¸‰éš¼ï¼ˆhardElitesï¼‰
// =============================================================

// éœéŸ³çµéšŠç²¾è‹±æ€ªé¡¯ç¤ºè³‡æ–™ï¼ˆåç¨±/é¡è‰²/å…‰ç’°æ¨£å¼ï¼‰
import { gameState, ctx } from './gameState.js';
import { MAP_WIDTH, MAP_HEIGHT, VIEW_W, VIEW_H } from './map.js';
import { worldToScreen, wrappedDelta } from './camera.js';
import { CREATURE_AI_CONFIG, ELITE_CONFIG, HUNTER_ELITE_REWARDS, HUNTER_ELITE_POISON_RESIST } from '../config/creatures.js';
import { HARD_ELITE_CONFIG } from '../config/gameConfig.js';
import { AudioManager } from './audio.js';
import { moveCreature } from './spawning.js';
import { applyDamageToPlayer } from './damage.js';
import { showFloatingText } from './feedback.js';
import { _effSpeed } from './creatures.js';
import { drawArrow, drawGlowEffect, drawHealthBar, drawNameTag } from './utils.js';
import { t } from '../lang.js';
import {
    STORAGE_KEYS,
    storageSet
} from '../storage/index.js';

const _HUNTER_ELITE_META = {
    specterDog:   { label: 'å¹½éˆçŠ¬',   color: '#3949AB', glowColor: '#5C6BC0', ring: 'pulse'  },
    shadowDog:    { label: 'æš—å½±çŠ¬',   color: '#212121', glowColor: '#FF7043', ring: 'rotate' },
    venomDog:     { label: 'æ¯’éœ§çŠ¬',   color: '#2E7D32', glowColor: '#66BB6A', ring: 'fog'    },
    specterFalcon:{ label: 'å¹½éˆéš¼',   color: '#1A237E', glowColor: '#5C6BC0', ring: 'pulse'  },
    shadowFalcon: { label: 'æš—å½±éš¼',   color: '#212121', glowColor: '#FF7043', ring: 'rotate' },
    venomFalcon:  { label: 'æ¯’éœ§éš¼',   color: '#1B5E20', glowColor: '#66BB6A', ring: 'fog'    },
};

const _HUNTER_ELITE_STARS = ['â˜…', 'â˜…â˜…', 'â˜…â˜…â˜…'];


function _eliteDogMeleeProfile(elite) {
    const dogProfiles = CREATURE_AI_CONFIG.meleeAttack.eliteDog || {};
    return dogProfiles[elite.eliteType] || CREATURE_AI_CONFIG.meleeAttack.default;
}

function _resetEliteMeleeAttack(elite) {
    elite._meleeState = null;
    elite._meleeTarget = null;
    elite._meleeWindupEnd = 0;
    elite._meleeActiveEnd = 0;
    elite._meleeRecoveryEnd = 0;
    elite._meleeHasHit = false;
    elite._meleeFlashUntil = 0;
}

function _eliteDogMeleeRange(elite, target) {
    const bodyRange = (elite.radius || 8) + (target?.radius || 8) + CREATURE_AI_CONFIG.meleeAttack.rangeBuffer;
    return Math.max(elite.attackRange || 0, bodyRange);
}

function _trackEliteMeleeTargetDuringWindup(elite, target, now) {
    if (elite._meleeState !== 'preparing' || !target) return;
    const { dx, dy } = wrappedDelta(elite.x, elite.y, target.x, target.y);
    const angle = Math.atan2(dy, dx);
    let speed = _effSpeed(elite) * CREATURE_AI_CONFIG.meleeAttack.windupMoveMult;
    if (elite._slowUntil && now < elite._slowUntil) speed *= (elite._slowMult || 1.0);
    moveCreature(elite, elite.x + Math.cos(angle) * speed, elite.y + Math.sin(angle) * speed);
}

function _tryEliteDogMeleeAttack(elite, target, distance, attackRange, now, onHit) {
    const profile = _eliteDogMeleeProfile(elite);
    const hitGraceRange = attackRange + CREATURE_AI_CONFIG.meleeAttack.hitGraceBuffer;

    if (distance > hitGraceRange) {
        if (elite._meleeState === 'preparing' || elite._meleeState === 'striking') {
            _resetEliteMeleeAttack(elite);
        }
        return false;
    }

    if (!elite._meleeState) {
        if (distance > attackRange) return false;
        if (now - (elite.attackCooldown || 0) < (elite.attackCooldownMs || 0)) return true;
        elite._meleeState = 'preparing';
        elite._meleeTarget = target;
        elite._meleeWindupEnd = now + profile.windupMs;
        elite._meleeActiveEnd = elite._meleeWindupEnd + profile.activeMs;
        elite._meleeRecoveryEnd = elite._meleeActiveEnd + profile.recoveryMs;
        elite._meleeHasHit = false;
        elite.attackCooldown = now;
        return true;
    }

    if (elite._meleeState === 'preparing' && now >= elite._meleeWindupEnd) {
        elite._meleeState = 'striking';
    }

    if (elite._meleeState === 'striking') {
        if (now >= elite._meleeActiveEnd) {
            if (!elite._meleeHasHit && target && distance <= hitGraceRange) {
                elite._meleeHasHit = true;
                onHit();
            }
            elite._meleeFlashUntil = now + CREATURE_AI_CONFIG.meleeAttack.strikeFlashMs;
            elite._meleeState = 'recovering';
        }
        return true;
    }

    if (elite._meleeState === 'recovering') {
        if (now >= elite._meleeRecoveryEnd) {
            _resetEliteMeleeAttack(elite);
        }
        return true;
    }

    return true;
}

function _drawEliteMeleeTelegraph(elite, sx, sy) {
    const now = Date.now();
    if (elite._meleeState === 'recovering' && now >= (elite._meleeRecoveryEnd || 0)) {
        _resetEliteMeleeAttack(elite);
    }
    if (!elite._meleeState && !(elite._meleeFlashUntil && now < elite._meleeFlashUntil)) return;
    const zoom = gameState.cameraZoom || 1;
    const r = (elite.radius + 10) * zoom;
    let color = 'rgba(255,80,60,0.75)';
    let lineWidth = 3;
    let scale = 1;

    if (elite._meleeFlashUntil && now < elite._meleeFlashUntil) {
        color = 'rgba(255,255,255,0.95)';
        lineWidth = 5;
        scale = 1.28;
    } else if (elite._meleeState === 'preparing') {
        const total = Math.max(1, elite._meleeWindupEnd - (elite.attackCooldown || 0));
        const left = Math.max(0, elite._meleeWindupEnd - now);
        scale = 0.8 + (1 - left / total) * 0.35;
    } else if (elite._meleeState === 'striking') {
        const total = Math.max(1, elite._meleeActiveEnd - elite._meleeWindupEnd);
        const elapsed = Math.max(0, total - Math.max(0, elite._meleeActiveEnd - now));
        const progress = Math.min(1, elapsed / total);
        color = 'rgba(255,255,255,0.82)';
        lineWidth = 3 + progress * 2;
        scale = 0.9 + progress * 0.3;
    } else if (elite._meleeState === 'recovering') {
        color = 'rgba(180,180,180,0.45)';
        lineWidth = 2;
        scale = 1.0;
    }

    ctx.save();
    ctx.beginPath();
    ctx.arc(sx, sy, r * scale, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    ctx.restore();
}

export function initEliteOrder() {
    const seed = gameState.mapSeed || Math.random() * 65536;

    // Seeded shuffle for type order [specter, shadow, venom]
    const types = ['specter', 'shadow', 'venom'];
    let s = seed;
    function seededRand() {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
    }
    for (let i = types.length - 1; i > 0; i--) {
        const j = Math.floor(seededRand() * (i + 1));
        [types[i], types[j]] = [types[j], types[i]];
    }

    // Determine falcon or dog for hard difficulty
    const isHard = gameState.currentMap &&
                   gameState.currentMap.features &&
                   gameState.currentMap.features.hardElites;

    let usesFalcon = false;
    if (isHard) {
        usesFalcon = seededRand() < 0.5;
    }

    // Build elite order: [night1type, night2type, night3type]
    // Night number determines star level, type order from seed
    if (isHard) {
        gameState.eliteOrder = types.map(type =>
            type + (usesFalcon ? 'Falcon' : 'Dog')
        );
    } else {
        // Easy/Normal: always dog
        gameState.eliteOrder = types.map(type => type + 'Dog');
    }
}

function _getHunterEliteType(nightNum) {
    return gameState.eliteOrder[nightNum - 1] || 'specterDog';
}

function _spawnHunterElite(nightNum, eliteType) {
    const cfg  = HARD_ELITE_CONFIG[eliteType];
    const map  = gameState.currentMap;
    const tier = map.elites[nightNum - 1];
    const meta = _HUNTER_ELITE_META[eliteType];
    const star = _HUNTER_ELITE_STARS[nightNum - 1] || _HUNTER_ELITE_STARS[0];

    // åœ°åœ–é›£åº¦å€çŽ‡ï¼ˆä¸‰é›£åº¦çµ±ä¸€å¥—ç”¨ï¼Œä¸åˆ†å›°é›£/éžå›°é›£ï¼‰
    const strength  = (map && map.creatureStrength && map.creatureStrength.hostile) || {};
    const hpMult     = strength.hpMultiplier    || 1;
    const speedMult  = strength.speedMultiplier || 1;

    // éš¼æ—ï¼ˆFalconï¼‰å¼·åº¦å·®ç•°åŒ–ï¼šHP Ã—0.7ã€å‚·å®³ Ã—1.3ï¼›çŠ¬æ—ç¶­æŒ Ã—1ï¼ˆä¸å½±éŸ¿é€Ÿåº¦ï¼‰
    const speciesHpMult  = eliteType.includes('Falcon') ? 0.7 : 1;
    const speciesDmgMult = eliteType.includes('Falcon') ? 1.3 : 1;

    const hp     = Math.round(ELITE_CONFIG.base.hp * tier.hpMultiplier * hpMult * speciesHpMult);
    const damage = Math.round(ELITE_CONFIG.base.damage * tier.damageMultiplier * speciesDmgMult);
    const speed  = ELITE_CONFIG.base.speed * 3 * speedMult + tier.speedBonus;

    const r = cfg.radius;
    const edge = Math.floor(Math.random() * 4);
    let x, y;
    if (edge === 0)      { x = Math.random() * MAP_WIDTH;  y = r; }
    else if (edge === 1) { x = Math.random() * MAP_WIDTH;  y = MAP_HEIGHT - r; }
    else if (edge === 2) { x = r;             y = Math.random() * MAP_HEIGHT; }
    else                 { x = MAP_WIDTH - r; y = Math.random() * MAP_HEIGHT; }

    gameState.eliteCreature = {
        x, y, radius: cfg.radius,
        hp, maxHp: hp,
        speed,
        damage,
        aggroRange: eliteType === 'specterFalcon' ? 1400 :
                    eliteType === 'shadowFalcon'  ? 900  :
                    eliteType === 'venomFalcon'   ? 1050 : 1000,
        attackRange: cfg.type === 'ranged' ? (cfg.range || 900) : 28,
        attackCooldown: 0,
        attackCooldownMs: cfg.attackCooldown || 1200,
        state: 'patrolling',
        poisonResist: HUNTER_ELITE_POISON_RESIST,
        wanderTarget: null, lastWanderTime: Date.now(),
        label: star + ' ' + meta.label,
        color: meta.color,
        glowColor: meta.glowColor,
        glowRing: meta.ring,
        eliteType,
        isHunterElite: true,
        tierIndex: nightNum - 1,
        starTier: nightNum,
        _postShotTimer: 0,
        _aimTarget: null,
        _aimUntil: 0,
        _ringAngle: 0,
        _venomPuddleCount: 0,
        _venomSalvo: [],
        _wallCooldown: 0,
        _fangCooldown: 0,
        _wallUsed: false,
        diet: 'carnivore',
    };
    gameState.eliteJustKilled = false;

    // å‡ºå ´å»£æ’­ï¼ˆå«ç‰©ç¨®é¡è‰²ï¼‰
    const _sColor = eliteType.includes('specter') ? '#6677FF' :
                    eliteType.includes('shadow')  ? '#FF8844' :
                    eliteType.includes('venom')   ? '#44CC77' : 'white';
    gameState.dayNightMessage.text        = 'âš ï¸ éœéŸ³çµéšŠæˆå“¡å‡ºç¾ï¼š' + meta.label;
    gameState.dayNightMessage.prefixText  = 'éœéŸ³çµéšŠæˆå“¡å‡ºç¾ï¼š';
    gameState.dayNightMessage.speciesText = 'âš ï¸ ' + meta.label;
    gameState.dayNightMessage.speciesColor = _sColor;
    gameState.dayNightMessage.timer = Date.now();
    const appearKey = eliteType + 'Appear';
    AudioManager.play(appearKey);
    AudioManager.play('dogAppearFanfare');
}

export function spawnEliteCreature(nightNum) {
    const features = gameState.currentMap && gameState.currentMap.features;

    // å›°é›£åœ°åœ–ï¼šéœéŸ³çµéšŠï¼ˆéš¼+çŠ¬ï¼‰
    if (features && features.hardElites) {
        _spawnHunterElite(nightNum, _getHunterEliteType(nightNum));
        return;
    }
    // æ™®é€š/ç°¡å–®åœ°åœ–ï¼šä¸‰çŠ¬
    if (features && features.dogElites) {
        _spawnHunterElite(nightNum, _getHunterEliteType(nightNum));
        return;
    }

    // æ¨™æº–ç²¾è‹±æ€ª
    const tierIndex = nightNum - 1;
    const tier = ELITE_CONFIG.nights[tierIndex];
    const hp = Math.round(ELITE_CONFIG.base.hp * tier.hpMult);
    const r = 18;
    const edge = Math.floor(Math.random() * 4);
    let x, y;
    if (edge === 0)      { x = Math.random() * MAP_WIDTH;  y = r; }
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
        tierIndex
    };
    gameState.eliteJustKilled = false;
    gameState.dayNightMessage.text        = t('eliteAppeared');
    gameState.dayNightMessage.prefixText  = null;
    gameState.dayNightMessage.speciesText = null;
    gameState.dayNightMessage.speciesColor = null;
    gameState.dayNightMessage.timer = Date.now();
}

// â”€â”€ Hunter ç²¾è‹±æ€ªæ­»äº¡çŽå‹µï¼ˆä¸å« addXPï¼Œxp ç”±å‘¼å«ç«¯æ±ºå®šæ™‚æ©Ÿï¼‰
export function _handleHunterEliteKill(elite) {
    const difficulty = (gameState.currentMap && gameState.currentMap.difficulty) || 'easy';
    const table   = HUNTER_ELITE_REWARDS[difficulty] || HUNTER_ELITE_REWARDS.easy;
    const rewards = table[elite.starTier] || table[1];
    gameState.skillPoints += rewards.skillPts;
    storageSet(STORAGE_KEYS.SKILL_POINTS, String(gameState.skillPoints));
    gameState.mutationSkillPoints = (gameState.mutationSkillPoints || 0) + rewards.mutPts;
    if (elite.starTier === 3 && Math.random() < 0.1) {
        const extra = 1 + Math.floor(Math.random() * 3);
        gameState.mutationSkillPoints += extra;
    }
    const meta = _HUNTER_ELITE_META[elite.eliteType] || {};
    showFloatingText(elite.x, elite.y - 30,
        'ðŸ’€ ' + (elite.label || '') + ' å·²å€’ï¼', meta.glowColor || '#FFD700', 16);
    AudioManager.play(elite.eliteType.includes('Dog') ? 'dogDeath' :
        elite.eliteType === 'specterFalcon' ? 'specterFalconDeath' :
        elite.eliteType === 'shadowFalcon'  ? 'shadowFalconDeath'  : 'venomFalconDeath');
    return rewards.xp;
}

// â”€â”€ å°„ç¨‹ç²¾è‹±æ€ªç™¼å°„å­å½ˆï¼ˆå¹½éˆéš¼ / æš—å½±éš¼ï¼‰
function _fireEliteFalconProjectile(elite, target, pellets, maxRange, speed) {
    const { dx, dy } = wrappedDelta(elite.x, elite.y, target.x, target.y);
    const baseAngle = Math.atan2(dy, dx);
    pellets = pellets || 1;
    for (let i = 0; i < pellets; i++) {
        const spreadDeg = pellets > 1 ? (Math.random() * 60 - 30) : 0;
        const angle = baseAngle + spreadDeg * Math.PI / 180;
        gameState.projectiles.push({
            x: elite.x, y: elite.y,
            vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
            speed, damage: elite.damage,
            maxRange: maxRange || 1000, distTraveled: 0,
            radius: 5, owner: 'hunter', type: pellets > 1 ? 'shotgun_pellet' : 'sniper',
        });
    }
    elite.attackCooldown  = Date.now();
    elite._postShotTimer  = Date.now() + 300;
}

// â”€â”€ æ¯’éœ§éš¼ç™¼å°„æ¯’ç‰†ä¸‰é€£ç‚®
function _fireVenomFalconShot(elite, p) {
    const cfg = HARD_ELITE_CONFIG.venomFalcon;
    if (elite._venomPuddleCount >= (cfg.maxPuddles || 6)) {
        elite._wallCooldown  = Date.now() + (cfg.selfCdBonus || 500);
        elite._postShotTimer = Date.now() + 500;
        return;
    }
    const now = Date.now();
    const { dx, dy } = wrappedDelta(elite.x, elite.y, p.x, p.y);
    const baseAngle = Math.atan2(dy, dx);
    const offset    = cfg.puddleCenterOffset || 150;
    const sideR     = cfg.puddleSideRadius   || 200;
    const perpAngle = baseAngle + Math.PI / 2;

    // ä¸‰ç‚®è½é»žï¼šä»¥çŽ©å®¶ç‚ºä¸­å¿ƒï¼Œåž‚ç›´æ–¼éš¼â†’çŽ©å®¶æ–¹å‘çš„å°è·¯ç‰†
    const midX  = p.x + Math.cos(baseAngle) * offset;
    const midY  = p.y + Math.sin(baseAngle) * offset;
    const leftX = p.x + Math.cos(perpAngle) * sideR;
    const leftY = p.y + Math.sin(perpAngle) * sideR;
    const rightX= p.x - Math.cos(perpAngle) * sideR;
    const rightY= p.y - Math.sin(perpAngle) * sideR;

    const landAt  = now + 800;
    const firePos = { x: elite.x, y: elite.y };
    if (!elite._venomSalvo) elite._venomSalvo = [];
    elite._venomSalvo.push(
        { fireAt: now, firePos, landAt, landPos: { x: midX,  y: midY  } },
        { fireAt: now, firePos, landAt, landPos: { x: leftX, y: leftY } },
        { fireAt: now, firePos, landAt, landPos: { x: rightX,y: rightY} }
    );

    // è‡ªèº« CD + 500ms è‡ªæ‡²ç½°ï¼›å¦ä¸€æŠ€èƒ½ +200ms å…±ç”¨æ‡²ç½°
    elite._wallCooldown  = now + (cfg.selfCdBonus || 500);
    elite._fangCooldown  = Math.max(elite._fangCooldown || 0, now + (cfg.sharedCdBonus || 200));
    elite._postShotTimer = now + 500;
    AudioManager.play('venomFalconLaunch');
}

// â”€â”€ æ¯’éœ§éš¼ç™¼å°„æ¯’ç‰™ï¼ˆä¸‰æ ¹å›žæ—‹é¢ï¼‰
function _fireVenomFangShot(elite, p) {
    const cfg = HARD_ELITE_CONFIG.venomFalcon;
    const { dx, dy } = wrappedDelta(elite.x, elite.y, p.x, p.y);
    const baseAngle = Math.atan2(dy, dx);
    const spreadRad = (cfg.fangSpreadDeg || 25) * Math.PI / 180;
    const speed     = cfg.fangSpeed || 14;
    const maxDist   = elite.attackRange * 2;
    const angles    = [baseAngle, baseAngle - spreadRad, baseAngle + spreadRad];
    for (const angle of angles) {
        gameState.projectiles.push({
            x: elite.x, y: elite.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            speed, damage: 0,
            maxRange: 99999, distTraveled: 0,
            radius: 6, owner: 'venomFang', type: 'venomFang',
            _returning: false,
            _originX: elite.x, _originY: elite.y,
            _maxDist: maxDist, _distTraveled: 0,
            _poisonDmg: cfg.fangPoisonDmg || 8,
            _poisonDuration: cfg.fangPoisonDuration || 3000,
        });
    }
    const now = Date.now();
    // è‡ªèº« CD + 500ms è‡ªæ‡²ç½°ï¼›å¦ä¸€æŠ€èƒ½ +200ms å…±ç”¨æ‡²ç½°
    elite._fangCooldown  = now + (cfg.selfCdBonus || 500);
    elite._wallCooldown  = Math.max(elite._wallCooldown || 0, now + (cfg.sharedCdBonus || 200));
    elite._postShotTimer = now + 300;
    AudioManager.play('venomFangFly');
}

function _updateEliteVenomPuddle(elite) {
    if (!elite._venomSalvo || elite._venomSalvo.length === 0) return;
    const now = Date.now();
    const cfg = HARD_ELITE_CONFIG.venomFalcon;
    if (!gameState.venomPuddles) gameState.venomPuddles = [];
    for (let si = elite._venomSalvo.length - 1; si >= 0; si--) {
        const shot = elite._venomSalvo[si];
        if (now < shot.landAt) continue;
        if (elite._venomPuddleCount < (cfg.maxPuddles || 6)) {
            gameState.venomPuddles.push({
                x: shot.landPos.x, y: shot.landPos.y,
                radius: cfg.puddleRadius || 80,
                startTime: now,
                duration: cfg.puddleDuration || 4000,
                dmgPerSec: cfg.poisonDps || 8,
                poisonDuration: cfg.puddlePoisonDuration || 3000,
                lastTick: now,
                owner: 'venomFalcon',
            });
            elite._venomPuddleCount++;
            AudioManager.play('venomFalconLand');
            AudioManager.play('venomFalconSpread');
        }
        elite._venomSalvo.splice(si, 1);
    }
}

export function updateEliteCreature() {
    const elite = gameState.eliteCreature;
    if (!elite || elite.hp <= 0) return;
    const now = Date.now();
    const p   = gameState.player;
    if (elite.stunnedUntil && now < elite.stunnedUntil) return;

    // æ­»äº¡åˆ¤æ–·ï¼ˆHP è¢«å¤–éƒ¨å‚·å®³æ¸…é›¶å¾Œç”± handleEliteKill è™•ç†ï¼Œæ­¤è™•åƒ…ä¿éšªï¼‰
    if (elite.isHunterElite) {
        _updateEliteVenomPuddle(elite);
        // venomFalcon puddle å‚·å®³ tick + éŽæœŸæ¸…ç†ï¼ˆç¨ç«‹è·¯å¾‘ï¼Œä¸ä¾è³´ boss.js desert å€å¡Šï¼‰
        if (gameState.venomPuddles) {
            for (let i = gameState.venomPuddles.length - 1; i >= 0; i--) {
                const puddle = gameState.venomPuddles[i];
                if (puddle.owner !== 'venomFalcon') continue;
                if (now >= puddle.startTime + puddle.duration) {
                    gameState.venomPuddles.splice(i, 1);
                    if (elite._venomPuddleCount > 0) elite._venomPuddleCount--;
                    continue;
                }
                if (now - puddle.lastTick >= 1000) {
                    puddle.lastTick = now;
                    const dist2 = Math.sqrt(
                        Math.pow(p.x - puddle.x, 2) +
                        Math.pow(p.y - puddle.y, 2)
                    );
                    if (dist2 < puddle.radius + (p.radius || 10)) {
                        if (!p.poisonStacks) p.poisonStacks = [];
                        p.poisonStacks.push({ dmg: puddle.dmgPerSec || 8, endTime: now + (puddle.poisonDuration || 3000) });
                    }
                }
            }
        }
    }

    const { dx, dy } = wrappedDelta(elite.x, elite.y, p.x, p.y);
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < elite.aggroRange) {
        elite.state = 'chasing';
    } else if (elite.state === 'chasing' && dist > elite.aggroRange + 100) {
        elite.state = 'patrolling';
    }

    // ç²¾è‹±æ€ªå›žè¡€ï¼ˆæ™®é€š/ç°¡å–®åœ°åœ– eliteRegen é–‹å•Ÿï¼‰
    if (gameState.currentMap && gameState.currentMap.features && gameState.currentMap.features.eliteRegen) {
        const tierIdx = elite.tierIndex || 0;
        const regenRate = [0.01, 0.02, 0.03][tierIdx] || 0.01;
        if (now - (elite.regenTimer || 0) >= 5000) {
            elite.regenTimer = now;
            elite.hp = Math.min(elite.maxHp, elite.hp + elite.maxHp * regenRate);
        }
    }

    // é–‹æ§å¾Œåœé “ï¼ˆå°„ç¨‹ç²¾è‹±æ€ªï¼‰
    if (elite.isHunterElite && elite._postShotTimer && now < elite._postShotTimer) {
        // æ¼«éŠ
        if (!elite.wanderTarget || now - elite.lastWanderTime >= 2000) {
            elite.wanderTarget    = { x: Math.random() * MAP_WIDTH, y: Math.random() * MAP_HEIGHT };
            elite.lastWanderTime  = now;
        }
        return;
    }

    if (elite.state === 'chasing') {
        if (elite.isHunterElite) {
            _updateHunterEliteChase(elite, p, now, dist, dx, dy);
        } else {
            if (dist <= elite.attackRange) {
                if (now - elite.attackCooldown >= 1200) {
                    applyDamageToPlayer(elite.damage, elite);
                    elite.attackCooldown = now;
                }
            } else {
                const angle = Math.atan2(dy, dx);
                moveCreature(elite, elite.x + Math.cos(angle) * _effSpeed(elite), elite.y + Math.sin(angle) * _effSpeed(elite));
            }
        }
    } else {
        if (!elite.wanderTarget || now - elite.lastWanderTime >= 2500) {
            elite.wanderTarget    = { x: Math.random() * MAP_WIDTH, y: Math.random() * MAP_HEIGHT };
            elite.lastWanderTime  = now;
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

function _updateHunterEliteChase(elite, p, now, dist, dx, dy) {
    const cfg = HARD_ELITE_CONFIG[elite.eliteType];
    if (!cfg) return;

    // â”€â”€ çŠ¬æ—ï¼ˆè¿‘æˆ°ï¼‰
    if (cfg.type === 'melee') {
        const meleeRange = _eliteDogMeleeRange(elite, p);
        if (dist <= meleeRange) {
            _tryEliteDogMeleeAttack(elite, p, dist, meleeRange, now, () => {
                applyDamageToPlayer(elite.damage, elite);
                AudioManager.play('dogAttack');
                if (elite.eliteType === 'venomDog') {
                    AudioManager.play('venomDogBite');
                    const player = gameState.player;
                    if (!player.poisonStacks) player.poisonStacks = [];
                    player.poisonStacks.push({ dmg: cfg.poisonDps || 8, endTime: now + (cfg.poisonDuration || 3000) });
                }
            });
            _trackEliteMeleeTargetDuringWindup(elite, p, now);
        } else {
            if (_tryEliteDogMeleeAttack(elite, p, dist, meleeRange, now, () => {})) {
                return;
            }
            const angle = Math.atan2(dy, dx);
            moveCreature(elite, elite.x + Math.cos(angle) * _effSpeed(elite), elite.y + Math.sin(angle) * _effSpeed(elite));
        }
        return;
    }

    // â”€â”€ éš¼æ—ï¼ˆé ç¨‹ï¼‰
    // å·²åœ¨è“„åŠ›ä¸­ï¼ˆ_aimTarget å­˜åœ¨ï¼‰æ™‚å…è¨±è·¨è¶Š attackRange å®Œæˆå°„æ“Šï¼Œé¿å… falcon å‡çµ
    if (dist < elite.attackRange || elite._aimTarget) {
        if (elite.eliteType === 'specterFalcon') {
            if (now - elite.attackCooldown >= cfg.attackCooldown) {
                if (!elite._aimTarget && dist < elite.attackRange) {
                    elite._aimTarget = { x: p.x, y: p.y };
                    elite._aimUntil  = now + (cfg.aimDuration || 300);
                    AudioManager.play('specterFalconAim');
                }
            }
            // è“„åŠ›æœŸé–“æ¯å¹€è¿½è¹¤çŽ©å®¶å³æ™‚ä½ç½®
            if (elite._aimTarget && now < elite._aimUntil) {
                elite._aimTarget.x = p.x;
                elite._aimTarget.y = p.y;
            }
            if (elite._aimTarget && now >= elite._aimUntil) {
                _fireEliteFalconProjectile(elite, elite._aimTarget, 1, elite.attackRange * 2, cfg.bulletSpeed || 14);
                AudioManager.play('specterFalconFire');
                elite._aimTarget = null;
                elite.attackCooldown = now;
            }
        } else if (elite.eliteType === 'shadowFalcon') {
            if (now - elite.attackCooldown >= cfg.attackCooldown) {
                _fireEliteFalconProjectile(elite, p, cfg.pellets || 4, cfg.maxRange || 650, cfg.bulletSpeed || 10);
                AudioManager.play('shadowFalconFire');
            }
        } else if (elite.eliteType === 'venomFalcon') {
            // é›™ CD ç³»çµ±ï¼šæ¯’ç‰† 3000+500ms / æ¯’ç‰™ 2500+500msï¼›åŒæ™‚ ready æ¯’ç‰†å„ªå…ˆ
            const wallReady = now - (elite._wallCooldown || 0) >= cfg.attackCooldown;
            const fangReady = now - (elite._fangCooldown || 0) >= (cfg.fangCooldown || 2500);
            if (!elite._wallUsed) {
                if (wallReady) {
                    _fireVenomFalconShot(elite, p);
                    elite._wallUsed = true;
                }
            } else if (wallReady) {
                // æ¯’ç‰†å„ªå…ˆï¼ˆå«å…©æŠ€åŒæ™‚ ready çš„æƒ…æ³ï¼‰
                _fireVenomFalconShot(elite, p);
            } else if (fangReady) {
                _fireVenomFangShot(elite, p);
            }
        }
    }
    // å¹½éˆéš¼è“„åŠ›ä¸­éœæ­¢ä¸å‹•ï¼ˆè¨­è¨ˆï¼š0.3 ç§’ç«™ç«‹è“„åŠ›ï¼Œä¸æ‰“æ–·çž„æº–ï¼‰
    if (elite.eliteType === 'specterFalcon' && elite._aimTarget) return;
    // ä¿æŒå°„ç¨‹å…§ï¼Œå¾Œé€€ä¿æŒè·é›¢
    const angle = Math.atan2(dy, dx);
    if (dist < elite.attackRange * 0.6) {
        moveCreature(elite, elite.x - Math.cos(angle) * _effSpeed(elite) * 0.5, elite.y - Math.sin(angle) * _effSpeed(elite) * 0.5);
    } else if (dist > elite.attackRange) {
        moveCreature(elite, elite.x + Math.cos(angle) * _effSpeed(elite), elite.y + Math.sin(angle) * _effSpeed(elite));
    }
}

export function drawEliteCreature() {
    const elite = gameState.eliteCreature;
    if (!elite || elite.hp <= 0) return;
    const s = worldToScreen(elite.x, elite.y);
    const selx = s.x, sely = s.y;
    if (selx < -50 || selx > VIEW_W + 50 || sely < -50 || sely > VIEW_H + 50) return;

    const r  = elite.radius;
    const t2 = Date.now();

    if (elite.isHunterElite) {
        _drawHunterElite(selx, sely, r, t2, elite);
        if (elite.eliteType && elite.eliteType.includes('Dog')) {
            _drawEliteMeleeTelegraph(elite, selx, sely);
        }
    } else {
        // æ¨™æº–ç²¾è‹±æ€ª
        drawGlowEffect(selx, sely, r, elite.color, '#FFD700', 14);
    }

    const bH = 5, bW = 46;
    const bY = sely - r - 4 - bH;
    const barColor = elite.isHunterElite ? (elite.glowColor || '#CC44FF') : '#CC44FF';
    drawHealthBar(selx, bY, elite.hp, elite.maxHp, bW, barColor, '#330033', bH);
    drawNameTag(selx, bY - 4, elite.label, elite.isHunterElite ? (elite.glowColor || '#FFD700') : '#FFD700', 'bold 11px Arial');

    if (gameState.devShowHP) {
        const hpPct = elite.hp / elite.maxHp;
        const hpColor = hpPct > 0.6 ? '#00FF88' : hpPct > 0.3 ? '#FFD700' : '#FF4444';
        ctx.save();
        ctx.font = '20px Arial';
        ctx.textAlign = 'right';
        ctx.fillStyle = hpColor;
        ctx.fillText(Math.ceil(elite.hp) + ' / ' + elite.maxHp, selx - r - 6, sely + 6);
        ctx.restore();
    }
    if (gameState.devShowAI) {
        const aiLabel = '[' + (elite.state || elite._phase || '?') + ']';
        ctx.save();
        ctx.font = 'bold 11px Arial';
        const enw = ctx.measureText(elite.label || '').width / 2;
        ctx.font = '20px Arial';
        ctx.fillStyle = 'rgba(200, 200, 255, 0.85)';
        ctx.textAlign = 'left';
        ctx.fillText(aiLabel, selx + enw + 8, bY - 4);
        ctx.restore();
    }
}

function _drawHunterElite(sx, sy, r, t2, elite) {
    const color     = elite.color;
    const glowColor = elite.glowColor;
    const ring      = elite.glowRing || 'pulse';

    ctx.save();
    ctx.fillStyle = color;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur  = 10;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // å…‰ç’°
    ctx.save();
    if (ring === 'pulse') {
        const alpha = 0.3 + Math.sin(t2 / 400) * 0.25;
        ctx.strokeStyle = glowColor;
        ctx.globalAlpha = alpha;
        ctx.lineWidth   = 2.5;
        ctx.beginPath();
        ctx.arc(sx, sy, r + 5, 0, Math.PI * 2);
        ctx.stroke();
    } else if (ring === 'rotate') {
        elite._ringAngle = ((elite._ringAngle || 0) + 0.03) % (Math.PI * 2);
        ctx.strokeStyle = glowColor;
        ctx.lineWidth   = 2;
        ctx.setLineDash([6, 4]);
        ctx.lineDashOffset = -elite._ringAngle * 10;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(sx, sy, r + 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
    } else if (ring === 'fog') {
        const fogAlpha = 0.5 - (t2 % 1200) / 2400;
        const fogR     = r + 5 + (t2 % 1200) / 120;
        ctx.strokeStyle = glowColor;
        ctx.globalAlpha = Math.max(0, fogAlpha);
        ctx.lineWidth   = 1.5;
        ctx.beginPath();
        ctx.arc(sx, sy, fogR, 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.restore();

    // å¹½éˆéš¼ï¼šçž„æº–ç·š + ç›®æ¨™æº–å¿ƒï¼ˆèˆ‡ Boss é›·å°„åŒç­‰è¦–è¦ºå¼·åº¦ï¼‰
    if (elite.eliteType === 'specterFalcon' && elite._aimTarget) {
        const ts  = worldToScreen(elite._aimTarget.x, elite._aimTarget.y);
        const tsx = ts.x;
        const tsy = ts.y;
        const pulse = Math.abs(Math.sin(Date.now() / 90));
        ctx.save();
        ctx.strokeStyle = `rgba(255, 80, 80, ${(pulse * 0.45 + 0.45).toFixed(2)})`;
        ctx.lineWidth   = 2;
        ctx.setLineDash([6, 3]);
        ctx.shadowColor = '#FF3333';
        ctx.shadowBlur  = 10;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(tsx, tsy);
        ctx.stroke();
        ctx.setLineDash([]);
        // ç›®æ¨™æº–å¿ƒåœ“ + åå­—
        ctx.strokeStyle = `rgba(255, 60, 60, ${(pulse * 0.55 + 0.35).toFixed(2)})`;
        ctx.lineWidth   = 2;
        ctx.beginPath();
        ctx.arc(tsx, tsy, 16, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(tsx - 10, tsy); ctx.lineTo(tsx + 10, tsy);
        ctx.moveTo(tsx, tsy - 10); ctx.lineTo(tsx, tsy + 10);
        ctx.stroke();
        ctx.restore();
    }
}

export function drawEliteArrow() {
    const elite = gameState.eliteCreature;
    if (!elite || elite.hp <= 0) return;
    const es = worldToScreen(elite.x, elite.y);
    // ç²¾è‹±æ€ªåœ¨èž¢å¹•å…§ï¼šä¸éœ€ç®­é ­
    if (es.x >= -20 && es.x <= VIEW_W + 20 && es.y >= -20 && es.y <= VIEW_H + 20) return;
    // ç²¾è‹±æ€ªèž¢å¹•å¤–ï¼šç„¡æ¢ä»¶é¡¯ç¤ºç®­é ­ï¼ˆç§»é™¤ Boss off-screen æŠ‘åˆ¶ï¼ŒçŽ©å®¶éœ€è¦åŒæ™‚æ‰¾åˆ°å…©è€…ï¼‰
    const p  = gameState.player;
    const ps = worldToScreen(p.x, p.y);
    const arrowColor = elite.isHunterElite ? (elite.glowColor || '#FFD700') :
                       (elite.diet === 'herbivore' ? '#FFD700' : '#9B59B6');
    drawArrow(ps.x, ps.y, elite.x, elite.y, arrowColor, p.radius);
}
