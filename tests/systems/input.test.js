import { describe, it, expect, vi, beforeAll } from 'vitest';

vi.mock('../../systems/gameState.js', () => ({
    gameState: {
        camera: { x: 0, y: 0 },
        mouseWorld: null,
        mouseScreen: null,
        settingsOpen: false,
        gameOver: false,
        _rebindTarget: null,
        settings: { keys: { up: 'w', down: 's', left: 'a', right: 'd', attack: 'j', dash: 'f' }, autoAttack: false },
        keys: {},
        organSelectionActive: false,
        skillTreeOpen: false,
        victory: false,
        mutationPanelOpen: false,
        tutorialOpen: false,
        devInput: '',
        projectiles: [],
        player: { isRanged: false, chargeHolding: false, chargeConsumed: 0, reloadCharges: 3 },
    },
}));
vi.mock('../../systems/map.js', () => ({
    MAP_WIDTH: 8000,
    MAP_HEIGHT: 8000,
}));
vi.mock('../../systems/audio.js', () => ({
    AudioManager: { play: vi.fn() },
}));
vi.mock('../../systems/combat.js', () => ({
    playerAttack: vi.fn(),
}));
vi.mock('../../systems/player.js', () => ({
    playerDash: vi.fn(),
    _getArcherShootDir: vi.fn(),
}));
vi.mock('../../systems/ui.js', () => ({
    saveSettings: vi.fn(),
    toggleDevMode: vi.fn(),
    showSettings: vi.fn(),
    hideSettings: vi.fn(),
}));
vi.mock('../../systems/chat.js', () => ({
    _chatExpanded: false,
    _collapseChat: vi.fn(),
}));

let _calcMouseWorld;

beforeAll(async () => {
    const mod = await import('../../systems/input.js');
    _calcMouseWorld = mod._calcMouseWorld;
});

describe('_calcMouseWorld', () => {
    const rect       = { left: 100, top: 50, width: 800, height: 450 };
    const canvasSize = { width: 800, height: 450 };
    const camera     = { x: 2000, y: 2000 };
    const bounds     = { width: 8000, height: 8000 };

    it('正常座標轉換（canvas 中心點）', () => {
        // client (500, 275) → screen (400, 225) → world (2400, 2225)
        const result = _calcMouseWorld(500, 275, rect, canvasSize, camera, bounds);
        expect(result.screenX).toBe(400);
        expect(result.screenY).toBe(225);
        expect(result.worldX).toBe(2400);
        expect(result.worldY).toBe(2225);
    });

    it('world 座標超出右邊界時正確 wrap 回 [0, width)', () => {
        // screen (7500, 100) + camera (2000, 2000) = (9500, 2100) → wrap x: 9500 % 8000 = 1500
        const result = _calcMouseWorld(7600, 150, rect, canvasSize, camera, bounds);
        expect(result.worldX).toBe(1500);
        expect(result.worldY).toBe(2100);
    });

    it('world 座標為負時正確 wrap', () => {
        // camera.x = 100，client.x = 100 → screenX = 0 → worldX = (0+100)%8000 = 100
        // 負值 case：camera.x = 0，screenX = 0 → worldX = 0（不負）
        // 讓 screen 為 0，camera 為 0，world 也是 0
        const r2 = _calcMouseWorld(100, 50, rect, canvasSize, { x: 0, y: 0 }, bounds);
        expect(r2.worldX).toBe(0);
        expect(r2.worldY).toBe(0);
    });

    it('負 world（camera 讓座標變負）正確 wrap', () => {
        // screenX = 0, camera.x = -500 → worldX = (-500 % 8000 + 8000) % 8000 = 7500
        const result = _calcMouseWorld(100, 50, rect, canvasSize, { x: -500, y: -300 }, bounds);
        expect(result.worldX).toBe(7500);
        expect(result.worldY).toBe(7700);
    });
});
