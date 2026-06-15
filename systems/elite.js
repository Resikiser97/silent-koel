// =============================================================
// 精英怪系統 - initEliteOrder / spawnEliteCreature / updateEliteCreature
//              drawEliteCreature / drawEliteArrow
// 支援：標準精英怪 / 三犬（dogElites）/ 三隼（hardElites）
// =============================================================

// 靜音獵隊精英怪顯示資料（名稱/顏色/光環樣式）
import { gameState, ctx } from './gameState.js';
import { MAP_WIDTH, MAP_HEIGHT, VIEW_W, VIEW_H } from './map.js';
import { worldToScreen, wrappedDelta } from './camera.js';
import { ELITE_CONFIG } from '../config/creatures.js';
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
    specterDog:   { label: '幽靈犬',   color: '#3949AB', glowColor: '#5C6BC0', ring: 'pulse'  },
    shadowDog:    { label: '暗影犬',   color: '#212121', glowColor: '#FF7043', ring: 'rotate' },
    venomDog:     { label: '毒霧犬',   color: '#2E7D32', glowColor: '#66BB6A', ring: 'fog'    },
    specterFalcon:{ label: '幽靈隼',   color: '#1A237E', glowColor: '#5C6BC0', ring: 'pulse'  },
    shadowFalcon: { label: '暗影隼',   color: '#212121', glowColor: '#FF7043', ring: 'rotate' },
    venomFalcon:  { label: '毒霧隼',   color: '#1B5E20', glowColor: '#66BB6A', ring: 'fog'    },
};

const _HUNTER_ELITE_STARS = ['★', '★★', '★★★'];

const _HUNTER_ELITE_REWARDS = {
    1: { xp: 200, skillPts: 2, mutPts: 1 },
    2: { xp: 350, skillPts: 3, mutPts: 2 },
    3: { xp: 500, skillPts: 4, mutPts: 3 },
};

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
    const isHardMap = !!(map.features && map.features.hardElites);

    // 困難地圖：固定數值；Easy/Normal 地圖：依地圖 elites 倍率動態計算
    const strengthMult = (!isHardMap && gameState.currentMap && gameState.currentMap.creatureStrength)
        ? (gameState.currentMap.creatureStrength.hostile.hpMultiplier || 1)
        : 1;
    const hp = isHardMap
        ? cfg.hp
        : Math.round(ELITE_CONFIG.base.hp * tier.hpMultiplier * strengthMult);
    const damage = isHardMap
        ? cfg.damage
        : Math.round(ELITE_CONFIG.base.damage * tier.damageMultiplier);
    const speed  = isHardMap
        ? (tier.speed || 3.9)
        : (ELITE_CONFIG.base.speed + tier.speedBonus);

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
        state: 'patrolling',
        poisonResist: 0,
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

    // 出場廣播（含物種顏色）
    const _sColor = eliteType.includes('specter') ? '#6677FF' :
                    eliteType.includes('shadow')  ? '#FF8844' :
                    eliteType.includes('venom')   ? '#44CC77' : 'white';
    gameState.dayNightMessage.text        = '⚠️ 靜音獵隊成員出現：' + meta.label;
    gameState.dayNightMessage.prefixText  = '靜音獵隊成員出現：';
    gameState.dayNightMessage.speciesText = '⚠️ ' + meta.label;
    gameState.dayNightMessage.speciesColor = _sColor;
    gameState.dayNightMessage.timer = Date.now();
    const appearKey = eliteType + 'Appear';
    AudioManager.play(appearKey);
    AudioManager.play('dogAppearFanfare');
}

export function spawnEliteCreature(nightNum) {
    const features = gameState.currentMap && gameState.currentMap.features;

    // 困難地圖：靜音獵隊（隼+犬）
    if (features && features.hardElites) {
        _spawnHunterElite(nightNum, _getHunterEliteType(nightNum));
        return;
    }
    // 普通/簡單地圖：三犬
    if (features && features.dogElites) {
        _spawnHunterElite(nightNum, _getHunterEliteType(nightNum));
        return;
    }

    // 標準精英怪
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

// ── Hunter 精英怪死亡獎勵（不含 addXP，xp 由呼叫端決定時機）
export function _handleHunterEliteKill(elite) {
    const rewards = _HUNTER_ELITE_REWARDS[elite.starTier] || _HUNTER_ELITE_REWARDS[1];
    gameState.skillPoints += rewards.skillPts;
    storageSet(STORAGE_KEYS.SKILL_POINTS, String(gameState.skillPoints));
    gameState.mutationSkillPoints = (gameState.mutationSkillPoints || 0) + rewards.mutPts;
    if (elite.starTier === 3 && Math.random() < 0.1) {
        const extra = 1 + Math.floor(Math.random() * 3);
        gameState.mutationSkillPoints += extra;
    }
    const meta = _HUNTER_ELITE_META[elite.eliteType] || {};
    showFloatingText(elite.x, elite.y - 30,
        '💀 ' + (elite.label || '') + ' 已倒！', meta.glowColor || '#FFD700', 16);
    AudioManager.play(elite.eliteType.includes('Dog') ? 'dogDeath' :
        elite.eliteType === 'specterFalcon' ? 'specterFalconDeath' :
        elite.eliteType === 'shadowFalcon'  ? 'shadowFalconDeath'  : 'venomFalconDeath');
    return rewards.xp;
}

// ── 射程精英怪發射子彈（幽靈隼 / 暗影隼）
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

// ── 毒霧隼發射毒牆三連炮
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

    // 三炮落點：以玩家為中心，垂直於隼→玩家方向的封路牆
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

    // 自身 CD + 500ms 自懲罰；另一技能 +200ms 共用懲罰
    elite._wallCooldown  = now + (cfg.selfCdBonus || 500);
    elite._fangCooldown  = Math.max(elite._fangCooldown || 0, now + (cfg.sharedCdBonus || 200));
    elite._postShotTimer = now + 500;
    AudioManager.play('venomFalconLaunch');
}

// ── 毒霧隼發射毒牙（三根回旋鏢）
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
    // 自身 CD + 500ms 自懲罰；另一技能 +200ms 共用懲罰
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

    // 死亡判斷（HP 被外部傷害清零後由 handleEliteKill 處理，此處僅保險）
    if (elite.isHunterElite) {
        _updateEliteVenomPuddle(elite);
        // venomFalcon puddle 傷害 tick + 過期清理（獨立路徑，不依賴 boss.js desert 區塊）
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

    // 精英怪回血（普通/簡單地圖 eliteRegen 開啟）
    if (gameState.currentMap && gameState.currentMap.features && gameState.currentMap.features.eliteRegen) {
        const tierIdx = elite.tierIndex || 0;
        const regenRate = [0.01, 0.02, 0.03][tierIdx] || 0.01;
        if (now - (elite.regenTimer || 0) >= 5000) {
            elite.regenTimer = now;
            elite.hp = Math.min(elite.maxHp, elite.hp + elite.maxHp * regenRate);
        }
    }

    // 開槍後停頓（射程精英怪）
    if (elite.isHunterElite && elite._postShotTimer && now < elite._postShotTimer) {
        // 漫遊
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

    // ── 犬族（近戰）
    if (cfg.type === 'melee') {
        if (dist <= elite.attackRange) {
            if (now - elite.attackCooldown >= cfg.attackCooldown) {
                applyDamageToPlayer(cfg.damage, elite);
                elite.attackCooldown = now;
                AudioManager.play('dogAttack');
                // 毒霧犬附帶毒效果（poisonStacks 疊加）
                if (elite.eliteType === 'venomDog') {
                    AudioManager.play('venomDogBite');
                    const player = gameState.player;
                    if (!player.poisonStacks) player.poisonStacks = [];
                    player.poisonStacks.push({ dmg: cfg.poisonDps || 8, endTime: now + (cfg.poisonDuration || 3000) });
                }
            }
        } else {
            const angle = Math.atan2(dy, dx);
            moveCreature(elite, elite.x + Math.cos(angle) * _effSpeed(elite), elite.y + Math.sin(angle) * _effSpeed(elite));
        }
        return;
    }

    // ── 隼族（遠程）
    // 已在蓄力中（_aimTarget 存在）時允許跨越 attackRange 完成射擊，避免 falcon 凍結
    if (dist < elite.attackRange || elite._aimTarget) {
        if (elite.eliteType === 'specterFalcon') {
            if (now - elite.attackCooldown >= cfg.attackCooldown) {
                if (!elite._aimTarget && dist < elite.attackRange) {
                    elite._aimTarget = { x: p.x, y: p.y };
                    elite._aimUntil  = now + (cfg.aimDuration || 300);
                    AudioManager.play('specterFalconAim');
                }
            }
            // 蓄力期間每幀追蹤玩家即時位置
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
            // 雙 CD 系統：毒牆 3000+500ms / 毒牙 2500+500ms；同時 ready 毒牆優先
            const wallReady = now - (elite._wallCooldown || 0) >= cfg.attackCooldown;
            const fangReady = now - (elite._fangCooldown || 0) >= (cfg.fangCooldown || 2500);
            if (!elite._wallUsed) {
                if (wallReady) {
                    _fireVenomFalconShot(elite, p);
                    elite._wallUsed = true;
                }
            } else if (wallReady) {
                // 毒牆優先（含兩技同時 ready 的情況）
                _fireVenomFalconShot(elite, p);
            } else if (fangReady) {
                _fireVenomFangShot(elite, p);
            }
        }
    }
    // 幽靈隼蓄力中靜止不動（設計：0.3 秒站立蓄力，不打斷瞄準）
    if (elite.eliteType === 'specterFalcon' && elite._aimTarget) return;
    // 保持射程內，後退保持距離
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
    } else {
        // 標準精英怪
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

    // 光環
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

    // 幽靈隼：瞄準線 + 目標準心（與 Boss 雷射同等視覺強度）
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
        // 目標準心圓 + 十字
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
    // 精英怪在螢幕內：不需箭頭
    if (es.x >= -20 && es.x <= VIEW_W + 20 && es.y >= -20 && es.y <= VIEW_H + 20) return;
    // 精英怪螢幕外：無條件顯示箭頭（移除 Boss off-screen 抑制，玩家需要同時找到兩者）
    const p  = gameState.player;
    const ps = worldToScreen(p.x, p.y);
    const arrowColor = elite.isHunterElite ? (elite.glowColor || '#FFD700') :
                       (elite.diet === 'herbivore' ? '#FFD700' : '#9B59B6');
    drawArrow(ps.x, ps.y, elite.x, elite.y, arrowColor, p.radius);
}
