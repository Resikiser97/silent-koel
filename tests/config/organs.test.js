import { describe, it, expect } from 'vitest';
import { ORGANS, HIDDEN_ORGANS } from '../../config/organs.js';

describe('ORGANS', () => {
    it('should be an object', () => {
        expect(typeof ORGANS).toBe('object');
        expect(ORGANS).not.toBeNull();
    });
    it('every organ should have id, name, type, maxLevel', () => {
        for (const organ of Object.values(ORGANS)) {
            expect(organ).toHaveProperty('id');
            expect(organ).toHaveProperty('name');
            expect(organ).toHaveProperty('type');
            expect(organ).toHaveProperty('maxLevel');
        }
    });
    it('organ ids should match their keys', () => {
        for (const [key, organ] of Object.entries(ORGANS)) {
            expect(organ.id).toBe(key);
        }
    });
    it('every organ should have at least one level', () => {
        for (const organ of Object.values(ORGANS)) {
            expect(Array.isArray(organ.levels)).toBe(true);
            expect(organ.levels.length).toBeGreaterThan(0);
        }
    });
});

describe('HIDDEN_ORGANS', () => {
    it('should be an object', () => {
        expect(typeof HIDDEN_ORGANS).toBe('object');
        expect(HIDDEN_ORGANS).not.toBeNull();
    });
    it('every hidden organ should have id, name, type, effects', () => {
        for (const organ of Object.values(HIDDEN_ORGANS)) {
            expect(organ).toHaveProperty('id');
            expect(organ).toHaveProperty('name');
            expect(organ).toHaveProperty('type');
            expect(organ).toHaveProperty('effects');
        }
    });
    it('hidden organ ids should match their keys', () => {
        for (const [key, organ] of Object.entries(HIDDEN_ORGANS)) {
            expect(organ.id).toBe(key);
        }
    });
});
