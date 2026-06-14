import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../config/gameConfig.js', () => ({
    AUDIO_FILES: { introTheme: 'intro.mp3' },
    GAME_TIMING: {},
}));
vi.mock('../../systems/gameState.js', () => ({
    gameState: { isMobile: false },
}));
vi.mock('../../storage/index.js', () => ({
    saveSettingsToStorage: vi.fn(),
}));

let AudioManager;

beforeEach(async () => {
    vi.resetModules();
    const mod = await import('../../systems/audio.js');
    AudioManager = mod.AudioManager;
});

// ── _mobileFadeScale ──────────────────────────────────────────

describe('AudioManager._mobileFadeScale', () => {
    it('isMobile = false → 回傳 1', () => {
        AudioManager._mobileMasterFadeEndMs = 1300;
        AudioManager._mobileMasterFadeStartMs = 1000;
        expect(AudioManager._mobileFadeScale(1150, false)).toBe(1);
    });

    it('isMobile = true，_mobileMasterFadeEndMs 未設定 → 回傳 1', () => {
        AudioManager._mobileMasterFadeEndMs = undefined;
        expect(AudioManager._mobileFadeScale(1000, true)).toBe(1);
    });

    it('isMobile = true，now = _mobileMasterFadeStartMs（fade 前）→ 回傳 0', () => {
        AudioManager._mobileMasterFadeStartMs = 1000;
        AudioManager._mobileMasterFadeEndMs = 1300;
        expect(AudioManager._mobileFadeScale(1000, true)).toBe(0);
    });

    it('isMobile = true，now = 1150，start=1000 end=1300 → 回傳 0.5', () => {
        AudioManager._mobileMasterFadeStartMs = 1000;
        AudioManager._mobileMasterFadeEndMs = 1300;
        expect(AudioManager._mobileFadeScale(1150, true)).toBeCloseTo(0.5, 5);
    });

    it('isMobile = true，fade 結束後（now >= end）→ 回傳 1', () => {
        AudioManager._mobileMasterFadeStartMs = 1000;
        AudioManager._mobileMasterFadeEndMs = 1300;
        expect(AudioManager._mobileFadeScale(1300, true)).toBe(1);
        expect(AudioManager._mobileFadeScale(1500, true)).toBe(1);
    });
});

// ── _playSfxBuffer ────────────────────────────────────────────

describe('AudioManager._playSfxBuffer', () => {
    let sourceMock, gainMock, origGetContext, origGetSfxGain, origUnlocked, origSfxBuffers;

    beforeEach(() => {
        sourceMock = { buffer: null, connect: vi.fn(), start: vi.fn() };
        gainMock = {};

        origGetContext = AudioManager.getContext;
        origGetSfxGain = AudioManager.getSfxGain;
        origUnlocked = AudioManager._unlocked;
        origSfxBuffers = AudioManager._sfxBuffers;

        AudioManager._unlocked = true;
        AudioManager.getContext = () => ({ createBufferSource: () => sourceMock });
        AudioManager.getSfxGain = () => gainMock;
        AudioManager._sfxBuffers = { test: ['a', 'b', 'c'] };
    });

    afterEach(() => {
        AudioManager.getContext = origGetContext;
        AudioManager.getSfxGain = origGetSfxGain;
        AudioManager._unlocked = origUnlocked;
        AudioManager._sfxBuffers = origSfxBuffers;
    });

    it('random = () => 0 → source.buffer 被設為 "a"，回傳 true', () => {
        const result = AudioManager._playSfxBuffer('test', () => 0);
        expect(sourceMock.buffer).toBe('a');
        expect(result).toBe(true);
    });

    it('random = () => 0.999 → source.buffer 被設為 "c"，回傳 true', () => {
        const result = AudioManager._playSfxBuffer('test', () => 0.999);
        expect(sourceMock.buffer).toBe('c');
        expect(result).toBe(true);
    });
});
