// =============================================================
// 生成系統 - generateTrees / spawnFruitFromTree / spawnFruit
//            spawnNeutralCreatures / moveCreature
//            spawnHostileCreatures / spawnTreasure
//            spawnCreatureAtEdge / updateCreatureSpawning
// =============================================================

function generateTrees(count) {
    const trees = [];
    for (let i = 0; i < count; i++) {
        const x = Math.floor(Math.random() * (MAP_WIDTH  - 100)) + 50;
        const y = Math.floor(Math.random() * (MAP_HEIGHT - 100)) + 50;
        const isLarge = Math.random() < 0.4;
        const radius = isLarge
            ? Math.floor(Math.random() * 11 + 25)
            : Math.floor(Math.random() *  9 + 12);
        const biome = getBiome(x, y);
        const treeColor = biome === 'ocean' ? '#005599' : (biome === 'desert' ? '#7B6B00' : 'darkgreen');
        const treeSize = isLarge ? 'large' : 'small';
        trees.push({ x, y, radius, color: treeColor, isLarge, treeSize, fruitCount: 0, fruitTimer: 0 });
    }
    gameState.trees = trees;
    console.log("--- 初始化完成：共生成 " + gameState.trees.length + " 棵樹木（大/小各佔約4/6）---");
}

function spawnFruitFromTree(tree) {
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

function spawnFruit() {
    if (gameState.trees.length === 0) return null;
    const tree = gameState.trees[Math.floor(Math.random() * gameState.trees.length)];
    return spawnFruitFromTree(tree);
}

function spawnNeutralCreatures() {
    gameState.neutralCreatures = [];
    const GRID = 5, BLOCK = 1600; // 5x5 格，每格 1600px
    for (let gx = 0; gx < GRID; gx++) {
        for (let gy = 0; gy < GRID; gy++) {
            for (let k = 0; k < 2; k++) { // 每格 2 隻，共 50 隻
                const x = gx * BLOCK + 50 + Math.random() * (BLOCK - 100);
                const y = gy * BLOCK + 50 + Math.random() * (BLOCK - 100);
                const diet = Math.random() < 0.5 ? 'herbivore' : 'omnivore';
                const canFight = Math.random() < 0.5;
                gameState.neutralCreatures.push({
                    x, y, radius: 8, hp: 30, maxHp: 30, speed: 0.8,
                    diet, canFight, state: 'idle',
                    wanderTarget: null, lastWanderTime: Date.now(), lastDamageTime: 0
                });
            }
        }
    }
    console.log("--- 中立生物生成完成：" + gameState.neutralCreatures.length + " 隻（5x5 格，每格2隻）---");
}

function moveCreature(entity, newX, newY) {
    entity.x = ((newX % MAP_WIDTH)  + MAP_WIDTH)  % MAP_WIDTH;
    entity.y = ((newY % MAP_HEIGHT) + MAP_HEIGHT) % MAP_HEIGHT;
}

function spawnHostileCreatures() {
    gameState.hostileCreatures = [];
    const GRID = 5, BLOCK = 1600; // 5x5 格，每格 1600px
    const bonus = gameState.creatureStrengthMultiplier;
    for (let gx = 0; gx < GRID; gx++) {
        for (let gy = 0; gy < GRID; gy++) { // 每格 1 隻，共 25 隻
            const x = gx * BLOCK + 50 + Math.random() * (BLOCK - 100);
            const y = gy * BLOCK + 50 + Math.random() * (BLOCK - 100);
            const roll = Math.random();
            const diet = roll < 0.8 ? 'carnivore' : (roll < 0.9 ? 'herbivore' : 'omnivore');
            gameState.hostileCreatures.push({
                x, y, radius: 10, hp: 50 + bonus * 10, maxHp: 50 + bonus * 10,
                speed: Math.min(2.5, 1.2 + bonus * 0.1),
                damage: Math.min(20, 5 + bonus), attackCooldown: 0, diet,
                state: 'patrolling', aggroRange: 150, attackRange: 20,
                wanderTarget: null, lastWanderTime: Date.now(),
                target: null, targetType: null
            });
        }
    }
    console.log("--- 敵意生物生成完成：" + gameState.hostileCreatures.length + " 隻（5x5 格，每格1隻）---");
}

function spawnTreasure() {
    gameState.treasures.push({
        x: Math.random() * (MAP_WIDTH  - 60) + 30,
        y: Math.random() * (MAP_HEIGHT - 60) + 30,
        radius: 8
    });
}

function spawnCreatureAtEdge(type) {
    const GRID = 5, BLOCK = 1600; // 5x5 格，每格 1600px，座標範圍 0–8000
    const bonus = gameState.creatureStrengthMultiplier;

    // 統計各格存活數量
    const alive = (type === 'neutral'
        ? gameState.neutralCreatures
        : gameState.hostileCreatures).filter(c => c.hp > 0);
    const counts = new Array(25).fill(0);
    for (const c of alive) {
        const gi = Math.min(4, Math.floor(c.x / BLOCK)) + Math.min(4, Math.floor(c.y / BLOCK)) * GRID;
        counts[gi]++;
    }
    // 加權隨機：存活越少的格子越容易被選到
    const weights = counts.map(n => 1 / (n + 1));
    const total = weights.reduce((s, w) => s + w, 0);
    let r = Math.random() * total, block = 0;
    for (let i = 0; i < 25; i++) { r -= weights[i]; if (r <= 0) { block = i; break; } }
    const gx = block % GRID;
    const gy = Math.floor(block / GRID);
    const x = gx * BLOCK + 50 + Math.random() * (BLOCK - 100);
    const y = gy * BLOCK + 50 + Math.random() * (BLOCK - 100);

    if (type === 'neutral') {
        gameState.neutralCreatures.push({
            x, y, radius: 12, hp: 30 + bonus * 10, maxHp: 30 + bonus * 10,
            speed: 0.8 + bonus * 0.1, damage: 3 + bonus,
            diet: Math.random() < 0.5 ? 'herbivore' : 'omnivore',
            state: 'wandering', fleeRange: 100, fightBackRange: 40,
            canFight: Math.random() < 0.5, attackCooldown: 0,
            wanderTarget: null, lastWanderTime: Date.now()
        });
    } else {
        const roll = Math.random();
        const diet = roll < 0.8 ? 'carnivore' : (roll < 0.9 ? 'herbivore' : 'omnivore');
        const nightSpd = gameState.isNight ? 0.2 : 0;
        const nightDmg = gameState.isNight ? 2 : 0;
        gameState.hostileCreatures.push({
            x, y, radius: 10, hp: 50 + bonus * 10, maxHp: 50 + bonus * 10,
            speed: Math.min(2.5, 1.2 + bonus * 0.1 + nightSpd),
            damage: Math.min(20, 5 + bonus + nightDmg),
            attackCooldown: 0, diet, state: 'patrolling',
            aggroRange: 150, attackRange: 20,
            wanderTarget: null, lastWanderTime: Date.now(),
            target: null, targetType: null
        });
    }
}

function updateCreatureSpawning() {
    const now = Date.now();
    const elapsed = (600 - gameState.timeRemaining);
    gameState.creatureStrengthMultiplier = Math.floor(elapsed / 150);

    const aliveNeutral = gameState.neutralCreatures.filter(c => c.hp > 0).length;
    const neutralSpawnInterval = aliveNeutral === 0 ? 9000 : 30000;
    if (aliveNeutral < 50 && now - gameState.spawnTimers.neutral >= neutralSpawnInterval) {
        spawnCreatureAtEdge('neutral');
        gameState.spawnTimers.neutral = now;
    }

    const maxHostile = 35;
    const aliveHostile = gameState.hostileCreatures.filter(c => c.hp > 0).length;
    const hostileSpawnInterval = (aliveHostile === 0 || gameState.fruits.length === 0) ? 13500 : 45000;
    if (aliveHostile < maxHostile && now - gameState.spawnTimers.hostile >= hostileSpawnInterval) {
        spawnCreatureAtEdge('hostile');
        gameState.spawnTimers.hostile = now;
    }
}
