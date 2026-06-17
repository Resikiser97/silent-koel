import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockStorage } from '../helpers/mockStorage.js';

// mock localStorage
let mockStorage;
vi.stubGlobal('localStorage', {
    getItem:    (k) => mockStorage.getItem(k),
    setItem:    (k, v) => mockStorage.setItem(k, v),
    removeItem: (k) => mockStorage.removeItem(k),
    clear:      () => mockStorage.clear(),
});

vi.mock('../../systems/gameState.js', () => ({
    gameState: { isMobile: false },
}));

import {
    unlockAchievement,
    isUnlocked,
    getUnlockedAchievements,
    getActiveTitle,
    setActiveTitle,
} from '../../systems/achievements.js';

import { ACHIEVEMENTS } from '../../config/achievements.js';

beforeEach(() => {
    mockStorage = createMockStorage();
});

describe('unlockAchievement', () => {
    it('寫入正確的成就資料', () => {
        unlockAchievement('first_play');
        const data = JSON.parse(mockStorage.getItem('achievements'));
        expect(data['first_play']).toBeDefined();
        expect(typeof data['first_play'].unlockedAt).toBe('string');
    });

    it('重複 unlock 不覆蓋原始日期（idempotent）', () => {
        unlockAchievement('first_play');
        const first = JSON.parse(mockStorage.getItem('achievements'))['first_play'].unlockedAt;
        unlockAchievement('first_play');
        const second = JSON.parse(mockStorage.getItem('achievements'))['first_play'].unlockedAt;
        expect(first).toBe(second);
    });
});

describe('isUnlocked', () => {
    it('未解鎖時回傳 false', () => {
        expect(isUnlocked('first_play')).toBe(false);
    });

    it('解鎖後回傳 true', () => {
        unlockAchievement('first_play');
        expect(isUnlocked('first_play')).toBe(true);
    });
});

describe('getActiveTitle / setActiveTitle', () => {
    it('setActiveTitle 後 getActiveTitle 回傳相同值', () => {
        setActiveTitle('大佬');
        expect(getActiveTitle()).toBe('大佬');
    });

    it('未設定時 getActiveTitle 回傳 null', () => {
        expect(getActiveTitle()).toBeNull();
    });
});

describe('ACHIEVEMENTS 資料完整性', () => {
    it('共 36 個成就', () => {
        expect(ACHIEVEMENTS).toHaveLength(36);
    });

    it('每個成就的 id 不重複', () => {
        const ids = ACHIEVEMENTS.map(a => a.id);
        const unique = new Set(ids);
        expect(unique.size).toBe(ids.length);
    });

    it('每個成就都有必填欄位', () => {
        for (const a of ACHIEVEMENTS) {
            expect(typeof a.id).toBe('string');
            expect(typeof a.name).toBe('string');
            expect(typeof a.description).toBe('string');
            expect(typeof a.category).toBe('string');
            expect('title' in a).toBe(true);
        }
    });

    it('有 title 的成就共 12 個（title 不為 null）', () => {
        const withTitle = ACHIEVEMENTS.filter(a => a.title !== null);
        expect(withTitle).toHaveLength(12);
    });

    it('有 title 的成就 title 值皆為字串', () => {
        const withTitle = ACHIEVEMENTS.filter(a => a.title !== null);
        for (const a of withTitle) {
            expect(typeof a.title).toBe('string');
        }
    });
});
