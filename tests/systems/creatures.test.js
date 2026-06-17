import { describe, it, expect, vi, beforeAll } from 'vitest';

vi.mock('../../systems/gameState.js', () => ({
    gameState: { cameraZoom: 1, isMobile: false, player: { x: 100, y: 100, radius: 20, lastMoveDir: { dx: 1, dy: 0 } } },
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

let gameState, _effSpeed, _shouldFleeFromGiant, _getHyenaPackBonus, _hyenaWheelPosition;

beforeAll(async () => {
    ({ gameState } = await import('../../systems/gameState.js'));
    const mod = await import('../../systems/creatures.js');
    _effSpeed = mod._effSpeed;
    _shouldFleeFromGiant = mod._shouldFleeFromGiant;
    _getHyenaPackBonus = mod._getHyenaPackBonus;
    _hyenaWheelPosition = mod._hyenaWheelPosition;
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
