import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockStorage } from '../helpers/mockStorage.js';

describe('mockStorage helper', () => {
    let storage;

    beforeEach(() => {
        storage = createMockStorage();
    });

    it('getItem returns null for missing key', () => {
        expect(storage.getItem('missing')).toBeNull();
    });

    it('setItem and getItem round-trip', () => {
        storage.setItem('key1', 'hello');
        expect(storage.getItem('key1')).toBe('hello');
    });

    it('setItem stores as string', () => {
        storage.setItem('num', 42);
        expect(storage.getItem('num')).toBe('42');
    });

    it('removeItem deletes a key', () => {
        storage.setItem('key2', 'value');
        storage.removeItem('key2');
        expect(storage.getItem('key2')).toBeNull();
    });

    it('clear removes all keys', () => {
        storage.setItem('a', '1');
        storage.setItem('b', '2');
        storage.clear();
        expect(storage.getItem('a')).toBeNull();
        expect(storage.getItem('b')).toBeNull();
    });
});
