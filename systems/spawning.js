// =============================================================
// 生成系統 - spawnFruitFromTree / spawnFruit / moveCreature
//            spawnBiomeCreatures / spawnTreasure
//            spawnCreatureAtEdgeBiome / updateCreatureSpawning
//            _randomPointInBiome / _makeHerbCreature / _makeCarnCreature
// （generateTrees 已移至 systems/map.js）
// =============================================================
import { gameState } from './gameState.js';
import { MAP_WIDTH, MAP_HEIGHT, getBiome } from './map.js';
import { BIOME_CREATURES } from '../config/creatures.js';

export function spawnFruitFromTree(tree) {
    for (let attempts = 0; attempts < 20; attempts++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = tree.radius + 5 + Math.random() * 20;
        const x = tree.x + Math.cos(angle) * dist;
        const y = tree.y + Math.sin(angle) * dist;
        if (x < 10 || x > MAP_WIDTH - 10 || y < 10 || y > MAP_HEIGHT - 10) continue;
        let tooClose = false;
        for (const fruit of gameState.fruits) {
            const dx = x - fruit.x, dy = y - fruit.y;
            if (dx * dx + dy * dy < 400) { tooClose = true; break; }
        }
        if (tooClose) continue;
        const fb = getBiome(x, y);
        const fc = fb === 'ocean' ? '#0088FF' : (fb === 'desert' ? '#FF8800' : 'red');
        const fruit = { x, y, radius: 6, color: fc };
        gameState.fruits.push(fruit);
        return fruit;
    }
    return null;
}

export function spawnFruit() {
    if (gameState.trees.length === 0) return null;
    const tree = gameState.trees[Math.floor(Math.random() * gameState.trees.length)];
    return spawnFruitFromTree(tree);
}

// ── 在指定生態區內隨機找一個有效座標（最多200次嘗試）
function _randomPointInBiome(biome) {
    for (let i = 0; i < 200; i++) {
        const x = 50 + Math.random() * (MAP_WIDTH  - 100);
        const y = 50 + Math.random() * (MAP_HEIGHT - 100);
        if (getBiome(x, y) === biome) return { x, y };
    }
    // fallback：找不到指定生態區時返回隨機座標
    return { x: 50 + Math.random() * (MAP_WIDTH - 100), y: 50 + Math.random() * (MAP_HEIGHT - 100) };
}

// ── 建立草系生物（herbivore）
function _makeHerbCreature(x, y, biome, spec, strength) {
    const str = (strength && strength.neutral) || { hpMultiplier: 1, speedMultiplier: 1, damageMultiplier: 1 };
    const canFight = Math.random() < 0.5;
    const now = Date.now();
    return {
        x, y, biome,
        speciesId: spec.id,
        name: spec.name,
        radius: 8,
        hp:    Math.round(30 * str.hpMultiplier),
        maxHp: Math.round(30 * str.hpMultiplier),
        baseHp: 30,
        speed:     2.4 * str.speedMultiplier,
        baseSpeed: 2.4,
        damage:     canFight ? Math.round(3 * str.damageMultiplier) : 0,
        baseDamage: canFight ? 3 : 0,
        diet: 'herbivore',
        canFight,
        state: 'wandering',
        wanderTarget: null,
        lastWanderTime: now,
        restTimer: 0,
        isResting: false,
        _restEndTime: 0,
        _restSpeed: 0,
        fruitsEaten: 0,
        lastDamageTime: 0,
        attackCooldown: 0,
        _moveAngle: Math.random() * Math.PI * 2,
        _nextBehaviorTime: now + 5000 + Math.random() * 10000,
        _seekingFruit: false,
    };
}

// ── 建立肉系生物（carnivore）
function _makeCarnCreature(x, y, biome, spec, strength, mapConfig) {
    const str       = (strength && strength.hostile) || { hpMultiplier: 1, speedMultiplier: 1, damageMultiplier: 1 };
    const removeCap = !!(mapConfig && mapConfig.removeHostileCap);
    const aggroRange = (mapConfig && mapConfig.aggroRangeOverride) ? mapConfig.aggroRangeOverride : 150;
    const now = Date.now();
    const nightNum  = Math.floor((gameState.currentPhaseIndex + 1) / 2);
    const hpDmgMult = Math.pow(1.2, nightNum);
    const speedMult = Math.pow(1.1, nightNum);
    let speed  = 3.6 * str.speedMultiplier * speedMult;
    let damage = Math.round(5 * str.damageMultiplier * hpDmgMult);
    if (!removeCap) {
        speed  = Math.min(7.5, speed);
        damage = Math.min(20,  damage);
    }
    const hp = Math.round(50 * str.hpMultiplier * hpDmgMult);
    return {
        x, y, biome,
        speciesId: spec.id,
        name: spec.name,
        radius: 10,
        hp,
        maxHp: hp,
        baseHp: 50,
        speed,
        baseSpeed: 3.6,
        damage,
        baseDamage: 5,
        baseRadius: 10,
        diet: 'carnivore',
        canFight: true,
        state: 'patrolling',
        aggroRange,
        attackRange: 20,
        attackCooldown: 0,
        wanderTarget: null,
        lastWanderTime: now,
        restTimer: 0,
        isResting: false,
        _restEndTime: 0,
        _restSpeed: 0,
        corpseEaten: 0,
        target: null,
        targetType: null,
        _moveAngle: Math.random() * Math.PI * 2,
        _nextBehaviorTime: now + 5000 + Math.random() * 10000,
        _seekingPrey: false,
        // 鬣狗：初始化組隊資料（packGroup 1~3，同組共享仇恨）
        ...(spec.id === 'hyena' ? { packGroup: Math.ceil(Math.random() * 2), packMates: [], packName: null } : {}),
    };
}

// ── 初始生成：按生態區各生成草系10隻、肉系8隻
export function spawnBiomeCreatures() {
    gameState.neutralCreatures = [];
    gameState.hostileCreatures = [];
    gameState.spawnProtectUntil = Date.now() + 3000; // 出生後 3 秒內中心附近不生肉食怪
    const map      = gameState.currentMap;
    const strength = map ? map.creatureStrength : null;
    const centerProtectR = (map && map.terrain && map.terrain.forestCenterRadius) || 400;

    for (const biome of ['forest', 'ocean', 'desert']) {
        const herbSpec = BIOME_CREATURES[biome].herbivore;
        const carnSpec = BIOME_CREATURES[biome].carnivore;
        for (let i = 0; i < 10; i++) {
            const { x, y } = _randomPointInBiome(biome);
            gameState.neutralCreatures.push(_makeHerbCreature(x, y, biome, herbSpec, strength));
        }
        for (let i = 0; i < 8; i++) {
            const { x, y } = _randomPointInBiome(biome);
            const dx = x - 4000, dy = y - 4000;
            if (Math.sqrt(dx * dx + dy * dy) < centerProtectR) continue;
            gameState.hostileCreatures.push(_makeCarnCreature(x, y, biome, carnSpec, strength, map));
        }
    }
    console.log('--- 生態生物生成完成：草系' + gameState.neutralCreatures.length + '隻、肉系' + gameState.hostileCreatures.length + '隻 ---');
}

export function moveCreature(entity, newX, newY) {
    entity.x = ((newX % MAP_WIDTH)  + MAP_WIDTH)  % MAP_WIDTH;
    entity.y = ((newY % MAP_HEIGHT) + MAP_HEIGHT) % MAP_HEIGHT;
}

export function spawnTreasure() {
    gameState.treasures.push({
        x: Math.random() * (MAP_WIDTH  - 60) + 30,
        y: Math.random() * (MAP_HEIGHT - 60) + 30,
        radius: 8
    });
}

// ── 補充生成：在指定生態區生成一隻草系或肉系生物
export function spawnCreatureAtEdgeBiome(biome, type) {
    const map      = gameState.currentMap;
    const strength = map ? map.creatureStrength : null;
    const { x, y } = _randomPointInBiome(biome);
    if (type === 'herb') {
        const spec = BIOME_CREATURES[biome].herbivore;
        gameState.neutralCreatures.push(_makeHerbCreature(x, y, biome, spec, strength));
    } else {
        const spec = BIOME_CREATURES[biome].carnivore;
        gameState.hostileCreatures.push(_makeCarnCreature(x, y, biome, spec, strength, map));
    }
}

export function updateCreatureSpawning() {
    const now     = Date.now();
    const elapsed = 600 - gameState.timeRemaining;
    gameState.creatureStrengthMultiplier = Math.floor(elapsed / 150);

    const HERB_INTERVAL = 30000; // 草系正常間隔 30s
    const CARN_INTERVAL = 45000; // 肉系正常間隔 45s

    for (const biome of ['forest', 'ocean', 'desert']) {
        // ── 草系補充
        const herbKey   = biome + '_herb';
        const herbAlive = gameState.neutralCreatures.filter(c => c.hp > 0 && c.biome === biome).length;
        const herbTimer = herbAlive < 3 ? HERB_INTERVAL * 0.3 : HERB_INTERVAL; // 少於3隻加速70%
        if (herbAlive < 20 && now - (gameState.spawnTimers[herbKey] || 0) >= herbTimer) {
            spawnCreatureAtEdgeBiome(biome, 'herb');
            gameState.spawnTimers[herbKey] = now;
        }

        // ── 肉系補充
        const carnKey   = biome + '_carn';
        const carnAlive = gameState.hostileCreatures.filter(c => c.hp > 0 && c.biome === biome).length;
        const carnTimer = carnAlive < 3 ? CARN_INTERVAL * 0.3 : CARN_INTERVAL; // 少於3隻加速70%
        if (now < (gameState.spawnProtectUntil || 0)) continue; // 出生保護期間不補充肉食怪
        if (carnAlive < 15 && now - (gameState.spawnTimers[carnKey] || 0) >= carnTimer) {
            spawnCreatureAtEdgeBiome(biome, 'carn');
            gameState.spawnTimers[carnKey] = now;
        }
    }
}
