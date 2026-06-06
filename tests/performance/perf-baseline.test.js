import { describe, it, expect, vi } from 'vitest';

// 效能基準測試
// 目的：建立數字基準，未來優化後對比用
// 不是要測「快不快」，是要測「有沒有變慢」

const mockGameState = vi.hoisted(() => ({ sessionStats: null }));
vi.mock('../../systems/gameState.js', () => ({ gameState: mockGameState }));

import { resetSessionStats, getSessionStats, incrementStat } from '../../stats/index.js';

describe('Performance Baseline', () => {
    it('incrementStat should complete 10000 calls under 50ms', () => {
        resetSessionStats();
        const start = performance.now();
        for (let i = 0; i < 10000; i++) {
            incrementStat('fruitsEaten');
        }
        const duration = performance.now() - start;
        console.log(`incrementStat x10000: ${duration.toFixed(2)}ms`);
        expect(duration).toBeLessThan(50);
    });

    it('getSessionStats should complete 10000 calls under 20ms', () => {
        resetSessionStats();
        const start = performance.now();
        for (let i = 0; i < 10000; i++) {
            getSessionStats();
        }
        const duration = performance.now() - start;
        console.log(`getSessionStats x10000: ${duration.toFixed(2)}ms`);
        expect(duration).toBeLessThan(20);
    });
});
