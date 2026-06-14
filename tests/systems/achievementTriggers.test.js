import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mocks = vi.hoisted(() => {
    const storage = {};
    return {
        unlockAchievement: vi.fn(),
        storageGet: vi.fn((key) => storage[key] ?? null),
        storageSet: vi.fn((key, val) => { storage[key] = val; }),
        storageGetJSON: vi.fn(() => ({})),
        SKILLS: {
            vitality:   { id: 'vitality',   maxLevel: 3 },
            agility:    { id: 'agility',     maxLevel: 3 },
            forager:    { id: 'forager',     maxLevel: 3 },
            hunter:     { id: 'hunter',      maxLevel: 3 },
            tenacity:   { id: 'tenacity',    maxLevel: 3 },
        },
        ORGANS: {
            crabClaw:       { id: 'crabClaw' },
            boxingGloves:   { id: 'boxingGloves' },
        },
        storage,
    };
});

vi.mock('../../systems/achievements.js', () => ({
    unlockAchievement: mocks.unlockAchievement,
}));
vi.mock('../../storage/index.js', () => ({
    STORAGE_KEYS: {
        WIN_STREAK:        'winStreak',
        KILL_TOTAL:        'killTotal',
        KILL_KILLER_TOTAL: 'killKillerTotal',
        KILL_GIANT_TOTAL:  'killGiantTotal',
    },
    storageGet:     mocks.storageGet,
    storageSet:     mocks.storageSet,
    storageGetJSON: mocks.storageGetJSON,
}));
vi.mock('../../config/evolution.js', () => ({ SKILLS: mocks.SKILLS }));
vi.mock('../../config/organs.js', () => ({ ORGANS: mocks.ORGANS }));

function fireEvent(type, detail) {
    globalThis.window.dispatchEvent(new CustomEvent(type, { detail }));
}

let initAchievementTriggers;

const _listeners = {};

function _setupWindowMock() {
    if (!globalThis.CustomEvent) {
        globalThis.CustomEvent = class CustomEvent extends Event {
            constructor(type, params = {}) { super(type, params); this.detail = params.detail; }
        };
    }
    globalThis.window = {
        addEventListener: (type, fn) => {
            if (!_listeners[type]) _listeners[type] = [];
            _listeners[type].push(fn);
        },
        dispatchEvent: (event) => {
            (_listeners[event.type] || []).forEach(fn => fn(event));
            return true;
        },
    };
}

beforeEach(async () => {
    vi.clearAllMocks();
    Object.keys(mocks.storage).forEach(k => delete mocks.storage[k]);
    Object.keys(_listeners).forEach(k => delete _listeners[k]);
    _setupWindowMock();
    ({ initAchievementTriggers } = await import('../../systems/achievementTriggers.js'));
    initAchievementTriggers();
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('initAchievementTriggers', () => {
    it('不拋錯', () => {
        expect(() => initAchievementTriggers()).not.toThrow();
    });
});

describe('gameVictory', () => {
    it('觸發 first_clear', () => {
        fireEvent('gameVictory', { difficulty: 'easy', playTime: 500, bossKillTime: 120, character: 'koel', bossType: 'bear', tookDamage: true, regenedThisRun: true });
        expect(mocks.unlockAchievement).toHaveBeenCalledWith('first_clear');
    });

    it('tookDamage=false 觸發 no_damage_clear', () => {
        fireEvent('gameVictory', { difficulty: 'easy', playTime: 500, bossKillTime: 120, character: 'koel', bossType: 'bear', tookDamage: false, regenedThisRun: false });
        expect(mocks.unlockAchievement).toHaveBeenCalledWith('no_damage_clear');
    });

    it('playTime=300 觸發 speed_clear', () => {
        fireEvent('gameVictory', { difficulty: 'easy', playTime: 300, bossKillTime: 120, character: 'koel', bossType: null, tookDamage: true, regenedThisRun: false });
        expect(mocks.unlockAchievement).toHaveBeenCalledWith('speed_clear');
    });

    it('playTime=330 觸發 speed_clear（邊界）', () => {
        fireEvent('gameVictory', { difficulty: 'normal', playTime: 330, bossKillTime: 50, character: 'koel', bossType: 'bear', tookDamage: true, regenedThisRun: false });
        expect(mocks.unlockAchievement).toHaveBeenCalledWith('speed_clear');
    });
});

describe('levelUp', () => {
    it('level=50 觸發 level_50', () => {
        fireEvent('levelUp', { level: 50 });
        expect(mocks.unlockAchievement).toHaveBeenCalledWith('level_50');
    });

    it('level=49 不觸發 level_50', () => {
        fireEvent('levelUp', { level: 49 });
        expect(mocks.unlockAchievement).not.toHaveBeenCalledWith('level_50');
    });
});

describe('mutationLevelChanged', () => {
    it('total=100 觸發 mutation_100', () => {
        fireEvent('mutationLevelChanged', { total: 100 });
        expect(mocks.unlockAchievement).toHaveBeenCalledWith('mutation_100');
    });

    it('total=500 觸發 mutation_500', () => {
        fireEvent('mutationLevelChanged', { total: 500 });
        expect(mocks.unlockAchievement).toHaveBeenCalledWith('mutation_500');
    });

    it('total=99 不觸發 mutation_100', () => {
        fireEvent('mutationLevelChanged', { total: 99 });
        expect(mocks.unlockAchievement).not.toHaveBeenCalledWith('mutation_100');
    });
});

describe('killCountUpdated', () => {
    it('normal total=10000 觸發 kill_10000', () => {
        fireEvent('killCountUpdated', { type: 'normal', total: 10000 });
        expect(mocks.unlockAchievement).toHaveBeenCalledWith('kill_10000');
    });

    it('normal total=9999 不觸發 kill_10000', () => {
        fireEvent('killCountUpdated', { type: 'normal', total: 9999 });
        expect(mocks.unlockAchievement).not.toHaveBeenCalledWith('kill_10000');
    });
});

describe('win_streak', () => {
    it('連勝累積到5觸發 win_streak_5', () => {
        mocks.storageGet.mockImplementation((key) => {
            if (key === 'winStreak') return '4';
            return null;
        });
        fireEvent('gameVictory', { difficulty: 'easy', playTime: 500, bossKillTime: null, character: 'koel', bossType: null, tookDamage: true, regenedThisRun: false });
        expect(mocks.unlockAchievement).toHaveBeenCalledWith('win_streak_5');
    });

    it('死亡後 showSkillTree 重置 WIN_STREAK 為 0', () => {
        fireEvent('showSkillTree', { mode: 'postGame' });
        expect(mocks.storageSet).toHaveBeenCalledWith('winStreak', '0');
    });
});
