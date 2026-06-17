import { describe, it, expect, vi } from 'vitest';

vi.mock('../../systems/gameState.js', () => ({
    gameState: { cameraZoom: 1, player: { radius: 10 }, venomPuddles: [] },
    ctx: null,
}));
vi.mock('../../systems/map.js', () => ({
    MAP_WIDTH: 6000,
    MAP_HEIGHT: 6000,
    VIEW_W: 1600,
    VIEW_H: 900,
}));
vi.mock('../../systems/camera.js', () => ({
    worldToScreen: vi.fn(() => ({ x: 0, y: 0 })),
    wrappedDistance: vi.fn((x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1)),
    wrappedDelta: vi.fn((x1, y1, x2, y2) => ({ dx: x2 - x1, dy: y2 - y1 })),
}));
vi.mock('../../systems/audio.js', () => ({
    AudioManager: { play: vi.fn() },
}));
vi.mock('../../systems/spawning.js', () => ({
    moveCreature: vi.fn(),
}));
vi.mock('../../systems/damage.js', () => ({
    applyDamageToPlayer: vi.fn(),
}));
vi.mock('../../systems/feedback.js', () => ({
    showFloatingText: vi.fn(),
}));
vi.mock('../../systems/reward.js', () => ({
    addXP: vi.fn(),
}));
vi.mock('../../systems/organs.js', () => ({
    showHiddenOrganSelection: vi.fn(),
}));
vi.mock('../../systems/mutation.js', () => ({
    addMutationPoints: vi.fn(),
}));
vi.mock('../../systems/creatures.js', () => ({
    _effSpeed: vi.fn((entity) => entity.speed || 0),
}));
vi.mock('../../lang.js', () => ({
    t: (key) => key,
}));

import { _eliteDogMeleeRange } from '../../systems/elite.js';

describe('_eliteDogMeleeRange', () => {
    it('uses radius + max(attackRange, target radius) + rangeBuffer', () => {
        const dog = { radius: 14, attackRange: 28 };
        const target = { radius: 10 };

        expect(_eliteDogMeleeRange(dog, target)).toBe(50);
    });

    it('uses target radius when the target is larger than dog attackRange', () => {
        const dog = { radius: 14, attackRange: 28 };
        const target = { radius: 40 };

        expect(_eliteDogMeleeRange(dog, target)).toBe(62);
    });
});
