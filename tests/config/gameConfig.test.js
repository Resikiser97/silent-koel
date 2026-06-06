import { describe, it, expect } from 'vitest';
import { GAME_INFO } from '../../config/gameConfig.js';

describe('GAME_INFO', () => {
    it('should have a version string', () => {
        expect(typeof GAME_INFO.version).toBe('string');
    });

    it('version should match format vX.Y.Z or vX.Y.Z.W', () => {
        expect(GAME_INFO.version).toMatch(/^v\d+\.\d+\.\d+/);
    });

    it('should have a title', () => {
        expect(typeof GAME_INFO.title).toBe('string');
        expect(GAME_INFO.title.length).toBeGreaterThan(0);
    });
});
