import { describe, it, expect, beforeEach, vi } from 'vitest';

// vi.mock 會被 hoisted，所以 mockGameState 必須用 vi.hoisted 宣告
const mockGameState = vi.hoisted(() => ({ sessionStats: null }));
vi.mock('../../systems/gameState.js', () => ({ gameState: mockGameState }));

import {
    DEFAULT_SESSION_STATS,
    resetSessionStats,
    getSessionStats,
    incrementStat,
    updateStatMax
} from '../../stats/index.js';

describe('stats/index.js', () => {
    beforeEach(() => {
        mockGameState.sessionStats = null;
    });

    it('DEFAULT_SESSION_STATS has all 5 keys, all zero', () => {
        expect(DEFAULT_SESSION_STATS).toEqual({
            giantKills: 0,
            killerKills: 0,
            killerMaxLevel: 0,
            fruitsEaten: 0,
            normalKills: 0
        });
    });

    it('resetSessionStats() sets gameState.sessionStats to default values', () => {
        mockGameState.sessionStats = { giantKills: 3 };

        resetSessionStats();

        expect(mockGameState.sessionStats).toEqual(DEFAULT_SESSION_STATS);
        expect(mockGameState.sessionStats).not.toBe(DEFAULT_SESSION_STATS);
    });

    it('getSessionStats() returns sessionStats when it exists', () => {
        const existingStats = { ...DEFAULT_SESSION_STATS, fruitsEaten: 7 };
        mockGameState.sessionStats = existingStats;

        expect(getSessionStats()).toBe(existingStats);
    });

    it('getSessionStats() returns default when sessionStats is null', () => {
        mockGameState.sessionStats = null;

        const stats = getSessionStats();

        expect(stats).toEqual(DEFAULT_SESSION_STATS);
        expect(stats).not.toBe(DEFAULT_SESSION_STATS);
    });

    it('incrementStat() increments by 1 by default', () => {
        resetSessionStats();

        incrementStat('fruitsEaten');

        expect(mockGameState.sessionStats.fruitsEaten).toBe(1);
    });

    it('incrementStat() increments by custom amount', () => {
        resetSessionStats();

        incrementStat('normalKills', 5);

        expect(mockGameState.sessionStats.normalKills).toBe(5);
    });

    it('incrementStat() initializes from 0 if key missing', () => {
        mockGameState.sessionStats = {};

        incrementStat('giantKills');

        expect(mockGameState.sessionStats.giantKills).toBe(1);
    });

    it('updateStatMax() updates when new value is greater', () => {
        mockGameState.sessionStats = { ...DEFAULT_SESSION_STATS, killerMaxLevel: 2 };

        updateStatMax('killerMaxLevel', 5);

        expect(mockGameState.sessionStats.killerMaxLevel).toBe(5);
    });

    it('updateStatMax() does NOT update when new value is smaller or equal', () => {
        mockGameState.sessionStats = { ...DEFAULT_SESSION_STATS, killerMaxLevel: 5 };

        updateStatMax('killerMaxLevel', 4);
        expect(mockGameState.sessionStats.killerMaxLevel).toBe(5);

        updateStatMax('killerMaxLevel', 5);
        expect(mockGameState.sessionStats.killerMaxLevel).toBe(5);
    });
});
