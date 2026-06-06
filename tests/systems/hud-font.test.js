import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockGameState = vi.hoisted(() => ({
    settings: {
        fontBoldLarge: false
    }
}));

vi.mock('../../systems/gameState.js', () => ({
    gameState: mockGameState,
    ctx: {},
    canvas: {}
}));

vi.mock('../../systems/map.js', () => ({
    VIEW_W: 1600,
    VIEW_H: 900,
    MAP_WIDTH: 4000,
    MAP_HEIGHT: 4000,
    TILE_SIZE: 10,
    BIOME_COLOR: {},
    getBiome: vi.fn(() => 'forest'),
    drawTerrain: vi.fn()
}));

vi.mock('../../systems/camera.js', () => ({
    worldToScreen: vi.fn((x, y) => ({ x, y })),
    wrappedDistance: vi.fn(() => 0)
}));

vi.mock('../../systems/creatures.js', () => ({
    drawCorpses: vi.fn(),
    drawNeutralCreatures: vi.fn(),
    drawHostileCreatures: vi.fn(),
    _getCreatureDisplayName: vi.fn()
}));

vi.mock('../../systems/combat.js', () => ({
    drawCorpseEatingBars: vi.fn(),
    drawBones: vi.fn(),
    showFloatingText: vi.fn()
}));

vi.mock('../../systems/organs.js', () => ({
    drawOrganUI: vi.fn()
}));

vi.mock('../../systems/mobile.js', () => ({
    _renderMobileOverlay: vi.fn()
}));

vi.mock('../../systems/elite.js', () => ({
    drawEliteCreature: vi.fn(),
    drawEliteArrow: vi.fn()
}));

vi.mock('../../systems/boss.js', () => ({
    drawBoss: vi.fn(),
    drawBossArrow: vi.fn(),
    _drawSandStormOverlay: vi.fn()
}));

vi.mock('../../systems/player.js', () => ({
    _findArcherAutoTarget: vi.fn(),
    findBestPerceptionPath: vi.fn()
}));

vi.mock('../../systems/ui.js', () => ({
    showSettings: vi.fn()
}));

vi.mock('../../systems/mutation.js', () => ({
    showMutationPanel: vi.fn()
}));

vi.mock('../../lang.js', () => ({
    t: vi.fn(key => key)
}));

import { getGameFont } from '../../systems/utils.js';

function parseFontSize(font) {
    const match = font.match(/(\d+)px/);
    return match ? Number(match[1]) : 0;
}

describe('systems/hud.js getGameFont()', () => {
    beforeEach(() => {
        mockGameState.settings.fontBoldLarge = false;
    });

    it('always returns bold font string regardless of fontBoldLarge setting', () => {
        mockGameState.settings.fontBoldLarge = false;
        expect(getGameFont(12, false)).toContain('bold');

        mockGameState.settings.fontBoldLarge = true;
        expect(getGameFont(12, false)).toContain('bold');
    });

    it('returns larger size than base size', () => {
        const font = getGameFont(12, false);

        expect(parseFontSize(font)).toBeGreaterThan(12);
    });

    it('with size 12 returns at least 14px bold', () => {
        const font = getGameFont(12, false);

        expect(font).toContain('bold');
        expect(parseFontSize(font)).toBeGreaterThanOrEqual(14);
    });

    it('with size 16 returns at least 18px bold', () => {
        const font = getGameFont(16, false);

        expect(font).toContain('bold');
        expect(parseFontSize(font)).toBeGreaterThanOrEqual(18);
    });
});
