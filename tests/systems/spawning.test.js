import { describe, it, expect, vi, beforeAll } from 'vitest';

vi.mock('../../systems/gameState.js', () => ({
    gameState: {
        fruits: [],
        trees: [],
        neutralCreatures: [],
        hostileCreatures: [],
        currentPhaseIndex: 0,
        currentMap: null,
        spawnProtectUntil: 0,
        timeRemaining: 600,
        creatureStrengthMultiplier: 0,
        spawnTimers: {},
    },
}));
vi.mock('../../systems/map.js', () => ({
    MAP_WIDTH: 8000,
    MAP_HEIGHT: 8000,
    getBiome: vi.fn(() => 'forest'),
}));
vi.mock('../../config/creatures.js', () => ({
    BIOME_CREATURES: {
        forest: { herbivore: { id: 'deer', name: '鹿' }, carnivore: { id: 'wolf', name: '狼' } },
        ocean:  { herbivore: { id: 'fish', name: '魚' }, carnivore: { id: 'shark', name: '鯊' } },
        desert: { herbivore: { id: 'hare', name: '兔' }, carnivore: { id: 'lion', name: '獅' } },
    },
}));

let moveCreature;

beforeAll(async () => {
    const mod = await import('../../systems/spawning.js');
    moveCreature = mod.moveCreature;
});

describe('moveCreature — bounds wrap', () => {
    const bounds = { width: 100, height: 200 };

    it('正常座標不變', () => {
        const e = {};
        moveCreature(e, 50, 100, bounds);
        expect(e.x).toBe(50);
        expect(e.y).toBe(100);
    });

    it('負座標正確 wrap 回 [0, width/height)', () => {
        const e = {};
        moveCreature(e, -10, -30, bounds);
        expect(e.x).toBe(90);   // (-10 % 100 + 100) % 100 = 90
        expect(e.y).toBe(170);  // (-30 % 200 + 200) % 200 = 170
    });

    it('超出右邊界正確 wrap', () => {
        const e = {};
        moveCreature(e, 110, 250, bounds);
        expect(e.x).toBe(10);   // 110 % 100 = 10
        expect(e.y).toBe(50);   // 250 % 200 = 50
    });

    it('剛好等於邊界值 wrap 到 0', () => {
        const e = {};
        moveCreature(e, 100, 200, bounds);
        expect(e.x).toBe(0);
        expect(e.y).toBe(0);
    });

    it('不傳 bounds 時使用預設地圖尺寸（8000×8000）', () => {
        const e = {};
        moveCreature(e, 8001, 0);
        expect(e.x).toBe(1);
        expect(e.y).toBe(0);
    });
});
