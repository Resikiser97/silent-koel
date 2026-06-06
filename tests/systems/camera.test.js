import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

function mockDocument() {
    const ctx = {
        fillStyle: '',
        fillRect: vi.fn(),
        drawImage: vi.fn(),
        getContext: vi.fn(),
    };
    const canvas = {
        width: 1600,
        height: 900,
        getContext: vi.fn(() => ctx),
    };
    vi.stubGlobal('document', {
        getElementById: vi.fn(() => canvas),
        createElement: vi.fn(() => canvas),
    });
    return { ctx, canvas };
}

async function loadCamera() {
    vi.resetModules();
    mockDocument();
    const camera = await import('../../systems/camera.js');
    const { gameState } = await import('../../systems/gameState.js');
    const map = await import('../../systems/map.js');
    map.setViewSize(1600, 900);
    gameState.camera = { x: 0, y: 0 };
    gameState.player = { ...gameState.player, x: 0, y: 0, radius: 10 };
    gameState.settings = { ...gameState.settings, alwaysCenter: false, cameraMode: 'smart', cameraZoomLevel: 10 };
    gameState.isMobile = false;
    gameState.cameraZoom = 1.0;
    return { camera, gameState };
}

describe('camera wrappedDistance', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('calculates normal distance', async () => {
        const { camera } = await loadCamera();
        expect(camera.wrappedDistance(0, 0, 3, 4)).toBe(5);
    });

    it('uses wrapped distance across map boundary', async () => {
        const { camera } = await loadCamera();
        expect(camera.wrappedDistance(7900, 100, 100, 100)).toBe(200);
    });
});

describe('camera wrappedDelta', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('calculates normal delta', async () => {
        const { camera } = await loadCamera();
        expect(camera.wrappedDelta(10, 20, 30, 50)).toMatchObject({ dx: 20, dy: 30 });
    });

    it('wraps negative boundary delta', async () => {
        const { camera } = await loadCamera();
        expect(camera.wrappedDelta(100, 100, 7900, 100)).toMatchObject({ dx: -200, dy: 0 });
    });
});

describe('camera worldToScreen', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('converts world coordinates relative to camera', async () => {
        const { camera, gameState } = await loadCamera();
        gameState.camera = { x: 100, y: 200 };
        expect(camera.worldToScreen(150, 260)).toMatchObject({ x: 50, y: 60 });
    });

    it('wraps screen position across map boundary', async () => {
        const { camera, gameState } = await loadCamera();
        gameState.camera = { x: 7900, y: 100 };
        expect(camera.worldToScreen(100, 100)).toMatchObject({ x: 200, y: 0 });
    });
});

describe('camera _updateCameraZoom', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('sets manual desktop zoom from cameraZoomLevel', async () => {
        const { camera, gameState } = await loadCamera();
        gameState.settings.cameraMode = 'manual';
        gameState.settings.cameraZoomLevel = 5;
        camera._updateCameraZoom();
        expect(gameState.cameraZoom).toBeCloseTo(1.0);
    });

    it('reduces smart zoom for large player radius', async () => {
        const { camera, gameState } = await loadCamera();
        gameState.settings.cameraMode = 'smart';
        gameState.settings.cameraZoomLevel = 10;
        gameState.player.radius = 24;
        camera._updateCameraZoom();
        expect(gameState.cameraZoom).toBeCloseTo(0.7);
    });
});

describe('camera updateCamera', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('moves camera toward player outside margin', async () => {
        const { camera, gameState } = await loadCamera();
        gameState.camera = { x: 0, y: 0 };
        gameState.player.x = 1300;
        gameState.player.y = 450;
        camera.updateCamera();
        expect(gameState.camera.x).toBeCloseTo(27);
        expect(gameState.camera.y).toBe(0);
    });

    it('wraps camera when movement goes negative', async () => {
        const { camera, gameState } = await loadCamera();
        gameState.camera = { x: 0, y: 0 };
        gameState.player.x = 100;
        gameState.player.y = 100;
        camera.updateCamera();
        expect(gameState.camera.x).toBeCloseTo(7943);
        expect(gameState.camera.y).toBeCloseTo(7974.5);
    });
});
