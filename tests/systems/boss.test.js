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
    getBiome: vi.fn(() => 'forest'),
}));
vi.mock('../../systems/camera.js', () => ({
    worldToScreen: vi.fn(() => ({ x: 0, y: 0 })),
    wrappedDistance: vi.fn((x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1)),
    wrappedDelta: vi.fn((x1, y1, x2, y2) => ({ dx: x2 - x1, dy: y2 - y1 })),
}));
vi.mock('../../systems/audio.js', () => ({
    AudioManager: { play: vi.fn(), playMusic: vi.fn() },
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
vi.mock('../../systems/creatures.js', () => ({
    _effSpeed: vi.fn((entity) => entity.speed || 0),
}));
vi.mock('../../systems/reward.js', () => ({
    addXP: vi.fn(),
}));
vi.mock('../../systems/evolution.js', () => ({
    buildSkillTreeOverlay: vi.fn(),
    saveLastRunOrgans: vi.fn(),
}));
vi.mock('../../systems/ui.js', () => ({
    saveSettings: vi.fn(),
    buildEndGameOverlay: vi.fn(),
}));
vi.mock('../../systems/leaderboard.js', () => ({
    showScoreSubmitPopup: vi.fn(),
}));
vi.mock('../../systems/chat.js', () => ({
    loadChatSettings: vi.fn(),
    chatSaveProgress: vi.fn(),
}));
vi.mock('../../systems/gameFlow.js', () => ({
    pausePlayTimer: vi.fn(),
}));
vi.mock('../../lang.js', () => ({
    t: (key) => key,
}));
vi.mock('../../storage/index.js', () => ({
    STORAGE_KEYS: {},
    storageKey: {
        clearCountDiff: vi.fn((diff) => `clear:${diff}`),
        clearCountChar: vi.fn((charId) => `char:${charId}`),
    },
    storageGet: vi.fn(() => '0'),
    storageSet: vi.fn(),
    storageRemove: vi.fn(),
    storageSetJSON: vi.fn(),
}));

import { BOSS_CONFIG } from '../../config/creatures.js';
import { _bossMeleeProfile, _bossMeleeRange, _sharkChargeDistance } from '../../systems/boss.js';

describe('boss melee timing', () => {
    it('uses configured windup, active, and recovery windows for the three biome bosses', () => {
        expect(BOSS_CONFIG.forest.melee).toMatchObject({ windupMs: 120, activeMs: 220, recoveryMs: 980 });
        expect(BOSS_CONFIG.ocean.melee).toMatchObject({ windupMs: 120, activeMs: 220, recoveryMs: 860 });
        expect(BOSS_CONFIG.desert.melee).toMatchObject({ windupMs: 100, activeMs: 250, recoveryMs: 1000 });
    });

    it('reduces black bear recovery by 500ms while enraged', () => {
        const profile = _bossMeleeProfile({ biome: 'forest', _enraged: true });

        expect(profile.recoveryMs).toBe(480);
    });
});

describe('_bossMeleeRange', () => {
    it('uses radius + max(attackRange, target radius) + rangeBuffer', () => {
        const boss = { biome: 'forest', radius: 25, attackRange: 30 };
        const target = { radius: 10 };

        expect(_bossMeleeRange(boss, target)).toBe(63);
    });

    it('uses target radius when target is larger than attackRange', () => {
        const boss = { biome: 'forest', radius: 25, attackRange: 30 };
        const target = { radius: 50 };

        expect(_bossMeleeRange(boss, target)).toBe(83);
    });
});

describe('_sharkChargeDistance', () => {
    it('caps charge distance at 1000px', () => {
        const boss = { biome: 'ocean', speed: 40 };

        expect(_sharkChargeDistance(boss)).toBe(1000);
    });
});
