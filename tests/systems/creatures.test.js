import { describe, it, expect, vi, beforeAll } from 'vitest';

vi.mock('../../systems/gameState.js', () => ({
    gameState: {
        cameraZoom: 1,
        isMobile: false,
        hostileCreatures: [],
        player: { x: 100, y: 100, radius: 20, lastMoveDir: { dx: 1, dy: 0 } },
    },
    ctx: null,
}));
vi.mock('../../systems/map.js', () => ({
    MAP_WIDTH: 6000, MAP_HEIGHT: 6000, VIEW_W: 1600, VIEW_H: 900,
    getBiome: vi.fn(() => null),
}));
vi.mock('../../systems/camera.js', () => ({
    worldToScreen: vi.fn(() => ({ x: 0, y: 0 })),
    wrappedDistance: vi.fn((x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1)),
    wrappedDelta: vi.fn((x1, y1, x2, y2) => ({ dx: x2 - x1, dy: y2 - y1 })),
}));
vi.mock('../../config/gameConfig.js', () => ({
    FIXED_DELTA: 1000 / 60,
}));
vi.mock('../../systems/spawning.js', () => ({
    moveCreature: vi.fn(),
}));
vi.mock('../../systems/damage.js', () => ({
    applyDamageToPlayer: vi.fn(),
    handleKill: vi.fn(),
}));
vi.mock('../../systems/utils.js', () => ({
    applyTenacity: vi.fn(),
    getGameFont: vi.fn(() => '16px sans-serif'),
}));
vi.mock('../../systems/ui.js', () => ({
    showAlphaAnnouncement: vi.fn(),
}));
vi.mock('../../lang.js', () => ({
    t: (k) => k,
}));

let gameState, _effSpeed, _shouldFleeFromGiant, _getHyenaPackBonus, _hyenaWheelPosition, _selectHyenaSurroundAttackers, _getHyenaLocalPackCount, notifyCreatureHitByPlayer;

beforeAll(async () => {
    ({ gameState } = await import('../../systems/gameState.js'));
    const mod = await import('../../systems/creatures.js');
    _effSpeed = mod._effSpeed;
    _shouldFleeFromGiant = mod._shouldFleeFromGiant;
    _getHyenaPackBonus = mod._getHyenaPackBonus;
    _hyenaWheelPosition = mod._hyenaWheelPosition;
    _selectHyenaSurroundAttackers = mod._selectHyenaSurroundAttackers;
    _getHyenaLocalPackCount = mod._getHyenaLocalPackCount;
    notifyCreatureHitByPlayer = mod.notifyCreatureHitByPlayer;
});

// ── _effSpeed ─────────────────────────────────────────────────

describe('_effSpeed', () => {
    it('無減速：回傳 c.speed', () => {
        const c = { speed: 3.5 };
        expect(_effSpeed(c, 1000)).toBe(3.5);
    });

    it('減速中（now < _slowUntil）：回傳 speed * _slowMult', () => {
        const c = { speed: 4, _slowUntil: 2000, _slowMult: 0.5 };
        expect(_effSpeed(c, 1000)).toBe(2);
    });

    it('減速過期（now >= _slowUntil）：回傳 c.speed', () => {
        const c = { speed: 4, _slowUntil: 500, _slowMult: 0.5 };
        expect(_effSpeed(c, 1000)).toBe(4);
    });
});

// ── _shouldFleeFromGiant ──────────────────────────────────────

describe('_shouldFleeFromGiant', () => {
    it('isKiller = true → 回傳 false（殺手不逃）', () => {
        const creature = { isKiller: true, hp: 10 };
        const target = { isAlpha: true, hp: 999 };
        expect(_shouldFleeFromGiant(creature, target)).toBe(false);
    });

    it('非殺手遇 Alpha → 回傳 true', () => {
        const creature = { isKiller: false, hp: 100 };
        const target = { isAlpha: true, hp: 1 };
        expect(_shouldFleeFromGiant(creature, target)).toBe(true);
    });

    it('target.hp = 301, creature.hp = 100 → true；target.hp = 300 → false（邊界 >）', () => {
        const creature = { isKiller: false, hp: 100 };
        expect(_shouldFleeFromGiant(creature, { isAlpha: false, hp: 301 })).toBe(true);
        expect(_shouldFleeFromGiant(creature, { isAlpha: false, hp: 300 })).toBe(false);
    });
});

// ── _getHyenaPackBonus ────────────────────────────────────────

describe('_getHyenaPackBonus', () => {
    it('無 packMates → { atkMult: 1.0, speedMult: 1.0 }', () => {
        expect(_getHyenaPackBonus({})).toEqual({ atkMult: 1.0, speedMult: 1.0 });
    });

    it('4 隻隊友中存活 2 隻 → { atkMult: 1.4, speedMult: 1.1 }', () => {
        const hyena = { packMates: [{ hp: 10 }, { hp: 0 }, { hp: -5 }, { hp: 3 }] };
        expect(_getHyenaPackBonus(hyena)).toEqual({ atkMult: 1.4, speedMult: 1.1 });
    });
});

// ── _hyenaWheelPosition ───────────────────────────────────────

describe('_hyenaWheelPosition', () => {
    it('固定 now=0，pack 2 隻：兩隻鬣狗位置不同，且都在距 target 約 85 的 orbit 上', () => {
        const hyenaA = { radius: 10, attackRange: 30, hyenaAttackInterval: 1000 };
        const hyenaB = { radius: 10, attackRange: 30, hyenaAttackInterval: 1000 };
        const pack = [hyenaA, hyenaB];
        const target = { x: 100, y: 100, radius: 20 };

        const posA = _hyenaWheelPosition(hyenaA, pack, target, 0);
        const posB = _hyenaWheelPosition(hyenaB, pack, target, 0);

        // 兩隻位置不同
        expect(posA.x).not.toBeCloseTo(posB.x, 1);

        // 都在 orbit ≈ 85 的圓上
        const distA = Math.hypot(posA.x - target.x, posA.y - target.y);
        const distB = Math.hypot(posB.x - target.x, posB.y - target.y);
        expect(distA).toBeCloseTo(85, 0);
        expect(distB).toBeCloseTo(85, 0);
    });

    it('pack 4+ 包圍時選最近外圈角度，不用 pack index 強制換到遠端', () => {
        const hyenaA = { x: 100, y: 220, radius: 10, attackRange: 30, hyenaAttackInterval: 1000 };
        const hyenaB = { x: 100, y: -20, radius: 10, attackRange: 30, hyenaAttackInterval: 1000 };
        const pack = [
            hyenaA,
            hyenaB,
            { x: 220, y: 100, radius: 10, attackRange: 30, hyenaAttackInterval: 1000 },
            { x: -20, y: 100, radius: 10, attackRange: 30, hyenaAttackInterval: 1000 },
        ];
        gameState.player.x = 100;
        gameState.player.y = 100;
        gameState.player.radius = 20;
        gameState.player.lastMoveDir = { dx: 1, dy: 0 };

        const posA = _hyenaWheelPosition(hyenaA, pack, gameState.player, 0);
        const posB = _hyenaWheelPosition(hyenaB, pack, gameState.player, 0);

        expect(posA.y).toBeGreaterThan(gameState.player.y);
        expect(posB.y).toBeLessThan(gameState.player.y);
    });
});

describe('_selectHyenaSurroundAttackers', () => {
    it('pack 4+ selects two attackers and prefers nearby hyenas over perfect-but-far formation spots', () => {
        gameState.player.x = 100;
        gameState.player.y = 100;
        gameState.player.radius = 10;
        gameState.player.lastMoveDir = { dx: 1, dy: 0 };

        const nearA = { x: 120, y: 100, radius: 10, attackRange: 20, hp: 50, maxHp: 50 };
        const nearB = { x: 100, y: 125, radius: 10, attackRange: 20, hp: 50, maxHp: 50 };
        const farRear = { x: -60, y: 100, radius: 10, attackRange: 20, hp: 50, maxHp: 50 };
        const farSide = { x: 100, y: -80, radius: 10, attackRange: 20, hp: 50, maxHp: 50 };
        const attackers = _selectHyenaSurroundAttackers([nearA, nearB, farRear, farSide], gameState.player, 1000);

        expect(attackers).toHaveLength(2);
        expect(attackers).toContain(nearA);
        expect(attackers).toContain(nearB);
    });

    it('keeps a hyena that already started melee flow committed as an attacker', () => {
        gameState.player.x = 100;
        gameState.player.y = 100;
        gameState.player.radius = 10;

        const committed = {
            x: 200, y: 100, radius: 10, attackRange: 20,
            hp: 50, maxHp: 50,
            _attackTurn: true,
            _attackState: 'attacking',
            _meleeState: 'preparing',
            _attackCommitUntil: 0,
        };
        const nearA = { x: 115, y: 100, radius: 10, attackRange: 20, hp: 50, maxHp: 50 };
        const nearB = { x: 100, y: 120, radius: 10, attackRange: 20, hp: 50, maxHp: 50 };
        const farSide = { x: 100, y: -80, radius: 10, attackRange: 20, hp: 50, maxHp: 50 };
        const attackers = _selectHyenaSurroundAttackers([committed, nearA, nearB, farSide], gameState.player, 1000);

        expect(attackers).toHaveLength(2);
        expect(attackers).toContain(committed);
    });
});

describe('_getHyenaLocalPackCount', () => {
    it('does not count same-name hyenas that are outside the local pack range', () => {
        const nearA = { x: 0, y: 0, speciesId: 'hyena', hp: 50, packGroup: 1, biome: 'desert', packName: 'Pack' };
        const nearB = { x: 200, y: 0, speciesId: 'hyena', hp: 50, packGroup: 1, biome: 'desert', packName: 'Pack' };
        const far = { x: 2000, y: 0, speciesId: 'hyena', hp: 50, packGroup: 1, biome: 'desert', packName: 'Pack' };
        gameState.hostileCreatures = [nearA, nearB, far];

        expect(_getHyenaLocalPackCount(nearA)).toBe(2);
        expect(_getHyenaLocalPackCount(far)).toBe(1);
    });

    it('counts chained nearby packmates as one local pack', () => {
        const a = { x: 0, y: 0, speciesId: 'hyena', hp: 50, packGroup: 1, biome: 'desert', packName: 'Pack' };
        const b = { x: 700, y: 0, speciesId: 'hyena', hp: 50, packGroup: 1, biome: 'desert', packName: 'Pack' };
        const c = { x: 1400, y: 0, speciesId: 'hyena', hp: 50, packGroup: 1, biome: 'desert', packName: 'Pack' };
        gameState.hostileCreatures = [a, b, c];

        expect(_getHyenaLocalPackCount(a)).toBe(3);
    });
});

describe('notifyCreatureHitByPlayer', () => {
    it('forces giantized creatures to target the player for a short aggro window', () => {
        const giant = {
            hp: 100,
            isGiantized: true,
            guardianTarget: { hp: 100 },
            isFleeing: true,
            _seekingFruit: true,
            _fruitTarget: { x: 1, y: 1 },
        };

        notifyCreatureHitByPlayer(giant, 1000);

        expect(giant._playerAggroUntil).toBe(6000);
        expect(giant.guardianTarget).toBe(null);
        expect(giant.isFleeing).toBe(false);
        expect(giant.state).toBe('chasing');
        expect(giant.target).toBe(gameState.player);
        expect(giant.targetType).toBe('player');
    });

    it('sets local hyena pack focus to the player when one member is hit', () => {
        const a = { x: 0, y: 0, speciesId: 'hyena', hp: 50, maxHp: 50, packGroup: 1, biome: 'desert', packName: 'Pack' };
        const b = { x: 100, y: 0, speciesId: 'hyena', hp: 50, maxHp: 50, packGroup: 1, biome: 'desert', packName: 'Pack' };
        const far = { x: 2000, y: 0, speciesId: 'hyena', hp: 50, maxHp: 50, packGroup: 1, biome: 'desert', packName: 'Pack' };
        gameState.hostileCreatures = [a, b, far];

        notifyCreatureHitByPlayer(a, 2000);

        expect(a._hyenaPackFocusTarget).toBe(gameState.player);
        expect(b._hyenaPackFocusTarget).toBe(gameState.player);
        expect(far._hyenaPackFocusTarget).toBeUndefined();
        expect(a.targetType).toBe('player');
        expect(b.targetType).toBe('player');
    });
});
