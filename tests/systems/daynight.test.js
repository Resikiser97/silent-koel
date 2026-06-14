import { describe, it, expect, vi, beforeAll } from 'vitest';

// mock 掉有 DOM/audio/canvas 依賴的模組
vi.mock('../../systems/audio.js', () => ({
    AudioManager: { playMusic: vi.fn(), stopMusic: vi.fn() },
}));
vi.mock('../../systems/elite.js', () => ({
    spawnEliteCreature: vi.fn(),
}));
vi.mock('../../systems/boss.js', () => ({
    spawnBoss: vi.fn(),
}));
vi.mock('../../systems/gameState.js', () => ({
    gameState: { timeRemaining: 600, currentPhaseIndex: 0, isNight: false },
}));
vi.mock('../../lang.js', () => ({
    t: (k) => k,
}));

let getDayNightPhaseIndex;

beforeAll(async () => {
    const mod = await import('../../systems/daynight.js');
    getDayNightPhaseIndex = mod.getDayNightPhaseIndex;
});

describe('getDayNightPhaseIndex', () => {
    it('回傳值類型是 number', () => {
        expect(typeof getDayNightPhaseIndex(600)).toBe('number');
    });

    it('timeRemaining=600（起點）→ phase 0（白天）', () => {
        expect(getDayNightPhaseIndex(600)).toBe(0);
    });

    it('timeRemaining=525（第 1 段結束前 1 秒）→ phase 0', () => {
        // elapsed = 75, floor(75/75) = 1 → 剛好進入 phase 1
        // elapsed = 74 → phase 0
        expect(getDayNightPhaseIndex(526)).toBe(0);
    });

    it('timeRemaining=525（elapsed=75）→ phase 1（第一個夜晚）', () => {
        expect(getDayNightPhaseIndex(525)).toBe(1);
    });

    it('timeRemaining=0（遊戲結束）→ phase 7（最後階段）', () => {
        expect(getDayNightPhaseIndex(0)).toBe(7);
    });

    it('timeRemaining=1（接近結束）→ phase 7', () => {
        expect(getDayNightPhaseIndex(1)).toBe(7);
    });

    it('各 phase 臨界點驗證（每 75 秒一段）', () => {
        // elapsed = n*75 → phase n（最大 7）
        const cases = [
            [600, 0],   // elapsed 0
            [525, 1],   // elapsed 75
            [450, 2],   // elapsed 150
            [375, 3],   // elapsed 225
            [300, 4],   // elapsed 300
            [225, 5],   // elapsed 375
            [150, 6],   // elapsed 450
            [75, 7],    // elapsed 525
            [0, 7],     // elapsed 600，上限 7
        ];
        for (const [t, expected] of cases) {
            expect(getDayNightPhaseIndex(t), `timeRemaining=${t}`).toBe(expected);
        }
    });

    it('timeRemaining 超過 600 時不回傳負值 phase', () => {
        // 600 - 700 = -100 → max(0, -100) = 0 → phase 0
        expect(getDayNightPhaseIndex(700)).toBe(0);
    });
});
