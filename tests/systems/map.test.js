import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

function createCanvasContext() {
    return {
        fillStyle: '',
        imageSmoothingEnabled: false,
        fillRect: vi.fn(),
        drawImage: vi.fn(),
    };
}

function mockDocument() {
    const mainCtx = createCanvasContext();
    const terrainCtx = createCanvasContext();
    const mainCanvas = {
        width: 1600,
        height: 900,
        getContext: vi.fn(() => mainCtx),
    };
    const createdCanvases = [];
    vi.stubGlobal('document', {
        getElementById: vi.fn(() => mainCanvas),
        createElement: vi.fn(() => {
            const canvas = {
                width: 0,
                height: 0,
                getContext: vi.fn(() => terrainCtx),
            };
            createdCanvases.push(canvas);
            return canvas;
        }),
    });
    return { mainCtx, terrainCtx, mainCanvas, createdCanvases };
}

function makeTerrain(fill = 'forest') {
    return Array.from({ length: 400 }, () => Array.from({ length: 400 }, () => fill));
}

async function loadMap() {
    vi.resetModules();
    const mocks = mockDocument();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const map = await import('../../systems/map.js');
    const { gameState } = await import('../../systems/gameState.js');
    map.setViewSize(1600, 900);
    gameState.player = { ...gameState.player, x: 4000, y: 4000 };
    gameState.camera = { x: 0, y: 0 };
    gameState.cameraZoom = 1.0;
    gameState.isNight = false;
    gameState.terrainMap = null;
    gameState.currentMap = null;
    gameState.mapSeed = 1;
    return { map, gameState, ...mocks };
}

describe('map setViewSize', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it('updates exported view size values', async () => {
        const { map } = await loadMap();
        map.setViewSize(320, 240);
        expect(map.VIEW_W).toBe(320);
        expect(map.VIEW_H).toBe(240);
    });

    it('accepts zero boundary values', async () => {
        const { map } = await loadMap();
        map.setViewSize(0, 0);
        expect(map.VIEW_W).toBe(0);
        expect(map.VIEW_H).toBe(0);
    });
});

describe('map getBiome', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it('falls back to forest near map center', async () => {
        const { map } = await loadMap();
        expect(map.getBiome(4000, 4000)).toBe('forest');
    });

    it('clamps negative coordinates when terrainMap exists', async () => {
        const { map, gameState } = await loadMap();
        gameState.terrainMap = makeTerrain('desert');
        gameState.terrainMap[0][0] = 'ocean';
        expect(map.getBiome(-20, -20)).toBe('ocean');
    });
});

describe('map getBgColor', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it('returns day forest color for player in forest', async () => {
        const { map, gameState } = await loadMap();
        gameState.player.x = 4000;
        gameState.player.y = 4000;
        gameState.isNight = false;
        expect(map.getBgColor()).toBe('rgb(84,153,84)');
    });

    it('returns night desert color for player in desert', async () => {
        const { map, gameState } = await loadMap();
        gameState.player.x = 1000;
        gameState.player.y = 1000;
        gameState.isNight = true;
        expect(map.getBgColor()).toBe('rgb(92,61,10)');
    });
});

describe('map labelBiomeRegions', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it('labels separate biome regions', async () => {
        const { map } = await loadMap();
        const terrain = [
            ['forest', 'forest', 'forest'],
            ['forest', 'ocean', 'forest'],
            ['forest', 'forest', 'forest'],
        ];
        const result = map.labelBiomeRegions(terrain, 3, 3);
        expect(result.regions.length).toBe(2);
        expect(result.regions.map(r => r.size).sort((a, b) => a - b)).toEqual([1, 8]);
    });

    it('labels a single region when all cells match', async () => {
        const { map } = await loadMap();
        const terrain = [
            ['forest', 'forest'],
            ['forest', 'forest'],
        ];
        const result = map.labelBiomeRegions(terrain, 2, 2);
        expect(result.regions.length).toBe(1);
        expect(result.regions[0].size).toBe(4);
    });
});

describe('map mergeSmallRegions', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it('merges a small island into neighboring biome', async () => {
        const { map } = await loadMap();
        const terrain = [
            ['forest', 'forest', 'forest'],
            ['forest', 'ocean', 'forest'],
            ['forest', 'forest', 'forest'],
        ];
        map.mergeSmallRegions(terrain, 3, 3, 2);
        expect(terrain.flat().every(cell => cell === 'forest')).toBe(true);
    });

    it('leaves regions unchanged when minTiles is one', async () => {
        const { map } = await loadMap();
        const terrain = [
            ['forest', 'forest', 'forest'],
            ['forest', 'ocean', 'forest'],
            ['forest', 'forest', 'forest'],
        ];
        map.mergeSmallRegions(terrain, 3, 3, 1);
        expect(terrain[1][1]).toBe('ocean');
    });
});

describe('map ensureRequiredBiomes', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it('returns true when all required biomes exist', async () => {
        const { map } = await loadMap();
        const terrain = [
            ['forest', 'ocean'],
            ['desert', 'forest'],
        ];
        expect(map.ensureRequiredBiomes(terrain, 2, 2, ['forest', 'ocean'])).toBe(true);
    });

    it('returns false when a required biome is missing', async () => {
        const { map } = await loadMap();
        const terrain = [
            ['forest', 'forest'],
            ['forest', 'forest'],
        ];
        expect(map.ensureRequiredBiomes(terrain, 2, 2, ['ocean'])).toBe(false);
    });
});

describe('map generateTerrain', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it('creates a 400 by 400 terrain map', async () => {
        const { map, gameState } = await loadMap();
        gameState.currentMap = { terrain: { minBiomeTiles: 0, requiredBiomes: [] } };
        map.generateTerrain();
        expect(gameState.terrainMap.length).toBe(400);
        expect(gameState.terrainMap[0].length).toBe(400);
    });

    it('handles a zero map seed boundary', async () => {
        const { map, gameState } = await loadMap();
        gameState.mapSeed = 0;
        gameState.currentMap = { terrain: { minBiomeTiles: 0, requiredBiomes: [] } };
        map.generateTerrain();
        expect(gameState.terrainMap).not.toBeNull();
    });
});

describe('map buildTerrainCanvas', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it('creates an offscreen terrain canvas', async () => {
        const { map, gameState, createdCanvases, terrainCtx } = await loadMap();
        gameState.terrainMap = makeTerrain('forest');
        map.buildTerrainCanvas();
        expect(createdCanvases[0].width).toBe(8000);
        expect(createdCanvases[0].height).toBe(8000);
        expect(terrainCtx.fillRect).toHaveBeenCalled();
    });

    it('falls back to forest color for unknown biome cells', async () => {
        const { map, gameState, terrainCtx } = await loadMap();
        gameState.terrainMap = makeTerrain('unknown');
        map.buildTerrainCanvas();
        expect(terrainCtx.fillStyle).toBe('rgba(255,255,255,0.3)');
        expect(terrainCtx.fillRect).toHaveBeenCalled();
    });
});

describe('map drawTerrain', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it('fills background when terrain canvas is not built', async () => {
        const { map, mainCtx } = await loadMap();
        map.drawTerrain();
        expect(mainCtx.fillRect).toHaveBeenCalledWith(0, 0, 1600, 900);
    });

    it('draws the terrain canvas after it is built', async () => {
        const { map, gameState, mainCtx } = await loadMap();
        gameState.terrainMap = makeTerrain('forest');
        map.buildTerrainCanvas();
        map.drawTerrain();
        expect(mainCtx.drawImage).toHaveBeenCalled();
    });
});

describe('map generateTrees', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it('generates the requested number of trees', async () => {
        const { map, gameState } = await loadMap();
        map.generateTrees(3);
        expect(gameState.trees.length).toBe(3);
        expect(gameState.trees[0]).toHaveProperty('x');
        expect(gameState.trees[0]).toHaveProperty('radius');
    });

    it('handles zero tree count', async () => {
        const { map, gameState } = await loadMap();
        map.generateTrees(0);
        expect(gameState.trees).toEqual([]);
    });
});
