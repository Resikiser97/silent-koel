import { describe, it, expect } from 'vitest';
import { ATTRIBUTES } from '../../config/attributes.js';

describe('ATTRIBUTES 資料完整性', () => {
    it('共 5 個 attribute', () => {
        expect(ATTRIBUTES).toHaveLength(5);
    });

    it('每個 attribute 的 id 不重複', () => {
        const ids = ATTRIBUTES.map(a => a.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('所有必填欄位存在', () => {
        for (const a of ATTRIBUTES) {
            expect(typeof a.id).toBe('string');
            expect(typeof a.displayName).toBe('string');
            expect(typeof a.category).toBe('string');
            expect(Array.isArray(a.tags)).toBe(true);
            expect(a.appliesTo).toBeDefined();
            expect(a.statModifiers).toBeDefined();
            expect(Array.isArray(a.abilities)).toBe(true);
        }
    });

    it('appliesTo.creatureKinds 不為空陣列', () => {
        for (const a of ATTRIBUTES) {
            expect(Array.isArray(a.appliesTo.creatureKinds)).toBe(true);
            expect(a.appliesTo.creatureKinds.length).toBeGreaterThan(0);
        }
    });

    it('appliesTo.combatRoles 不為空陣列', () => {
        for (const a of ATTRIBUTES) {
            expect(Array.isArray(a.appliesTo.combatRoles)).toBe(true);
            expect(a.appliesTo.combatRoles.length).toBeGreaterThan(0);
        }
    });

    it('每個 ability 的 id 全域不重複（跨 attribute）', () => {
        const abilityIds = ATTRIBUTES.flatMap(a => a.abilities.map(ab => ab.id));
        expect(new Set(abilityIds).size).toBe(abilityIds.length);
    });

    it('每個 attribute 內部 ability id 不重複', () => {
        for (const a of ATTRIBUTES) {
            const ids = a.abilities.map(ab => ab.id);
            expect(new Set(ids).size).toBe(ids.length);
        }
    });
});
