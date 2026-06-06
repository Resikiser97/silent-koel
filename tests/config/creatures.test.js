import { describe, it, expect } from 'vitest';
import { CREATURE_CONFIG, BIOME_CREATURES, ELITE_CONFIG, BOSS_CONFIG } from '../../config/creatures.js';

describe('CREATURE_CONFIG', () => {
    it('should have hostile settings', () => {
        expect(CREATURE_CONFIG).toHaveProperty('hostile');
        expect(CREATURE_CONFIG.hostile).toHaveProperty('maxSpeed');
        expect(CREATURE_CONFIG.hostile).toHaveProperty('maxDamage');
    });
    it('hostile maxSpeed and maxDamage should be positive numbers', () => {
        expect(CREATURE_CONFIG.hostile.maxSpeed).toBeGreaterThan(0);
        expect(CREATURE_CONFIG.hostile.maxDamage).toBeGreaterThan(0);
    });
});

describe('BIOME_CREATURES', () => {
    const biomes = ['forest', 'ocean', 'desert'];
    it('should have all three biomes', () => {
        for (const biome of biomes) {
            expect(BIOME_CREATURES).toHaveProperty(biome);
        }
    });
    it('every biome should have herbivore and carnivore', () => {
        for (const biome of biomes) {
            expect(BIOME_CREATURES[biome]).toHaveProperty('herbivore');
            expect(BIOME_CREATURES[biome]).toHaveProperty('carnivore');
        }
    });
    it('every creature entry should have id, name, nameEn', () => {
        for (const biome of biomes) {
            for (const diet of ['herbivore', 'carnivore']) {
                const c = BIOME_CREATURES[biome][diet];
                expect(c, `${biome}.${diet} missing id`).toHaveProperty('id');
                expect(c, `${biome}.${diet} missing name`).toHaveProperty('name');
                expect(c, `${biome}.${diet} missing nameEn`).toHaveProperty('nameEn');
            }
        }
    });
});

describe('ELITE_CONFIG', () => {
    it('should have base stats', () => {
        expect(ELITE_CONFIG.base).toHaveProperty('hp');
        expect(ELITE_CONFIG.base).toHaveProperty('speed');
        expect(ELITE_CONFIG.base).toHaveProperty('damage');
    });
    it('should have 3 night entries', () => {
        expect(Array.isArray(ELITE_CONFIG.nights)).toBe(true);
        expect(ELITE_CONFIG.nights.length).toBe(3);
    });
    it('every night entry should have hpMult, speed, damage, xp', () => {
        for (const night of ELITE_CONFIG.nights) {
            expect(night).toHaveProperty('hpMult');
            expect(night).toHaveProperty('speed');
            expect(night).toHaveProperty('damage');
            expect(night).toHaveProperty('xp');
        }
    });
});

describe('BOSS_CONFIG', () => {
    const biomes = ['forest', 'ocean', 'desert'];
    it('should have all three biome bosses', () => {
        for (const biome of biomes) {
            expect(BOSS_CONFIG).toHaveProperty(biome);
        }
    });
    it('every boss should have hp, speed, damage, radius', () => {
        for (const biome of biomes) {
            const boss = BOSS_CONFIG[biome];
            expect(boss, `${biome} boss missing hp`).toHaveProperty('hp');
            expect(boss, `${biome} boss missing speed`).toHaveProperty('speed');
            expect(boss, `${biome} boss missing damage`).toHaveProperty('damage');
            expect(boss, `${biome} boss missing radius`).toHaveProperty('radius');
        }
    });
});
