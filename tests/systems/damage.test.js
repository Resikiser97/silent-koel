import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mocks = vi.hoisted(() => {
    const gameState = {
        player: {},
        playerSkills: {},
        stats: {},
        neutralCreatures: [],
        hostileCreatures: [],
        corpses: [],
        floatTexts: [],
        boss: null,
        bossSpawned: false,
        eliteCreature: null,
        selectedCharacter: 'koel',
    };
    const showFloatingText = vi.fn();

    return {
        gameState,
        audioPlay: vi.fn(),
        addXP: vi.fn((amount) => amount),
        showFloatingText,
        showXPPopup: vi.fn((x, y, amount) => {
            showFloatingText(x, y, `+${amount}`, '#FFD700', 13);
        }),
        incrementStat: vi.fn(),
        updateStatMax: vi.fn(),
        spawnLootCircle: vi.fn(),
        addMutationPoints: vi.fn(),
        wrappedDistance: vi.fn(() => 0),
        applyTenacity: vi.fn((value) => value),
        getOrganLevel: vi.fn(() => 0),
        getOrganCumulative: vi.fn(() => 0),
        handleEliteKill: vi.fn(),
        applyOrganEffects: vi.fn(),
        handleTutorialStumpKill: vi.fn(),
    };
});

vi.mock('../../systems/gameState.js', () => ({
    gameState: mocks.gameState,
    ctx: null,
}));
vi.mock('../../systems/audio.js', () => ({
    AudioManager: { play: mocks.audioPlay },
}));
vi.mock('../../systems/feedback.js', () => ({
    showFloatingText: mocks.showFloatingText,
    showXPPopup: mocks.showXPPopup,
}));
vi.mock('../../systems/reward.js', () => ({
    addXP: mocks.addXP,
}));
vi.mock('../../stats/index.js', () => ({
    incrementStat: mocks.incrementStat,
    updateStatMax: mocks.updateStatMax,
}));
vi.mock('../../systems/utils.js', () => ({
    applyTenacity: mocks.applyTenacity,
    spawnLootCircle: mocks.spawnLootCircle,
}));
vi.mock('../../lang.js', () => ({
    t: (key) => key,
}));
vi.mock('../../systems/mutation.js', () => ({
    addMutationPoints: mocks.addMutationPoints,
}));
vi.mock('../../systems/map.js', () => ({
    VIEW_W: 1600,
    VIEW_H: 900,
}));
vi.mock('../../systems/camera.js', () => ({
    wrappedDistance: mocks.wrappedDistance,
    worldToScreen: vi.fn((x, y) => ({ x, y })),
}));
vi.mock('../../config/gameConfig.js', () => ({
    CORPSE_EAT_HP: 10,
    CORPSE_BONE_EAT_TICK: 500,
    CORPSE_EXPIRE_MS: 60000,
    BONE_EXPIRE_MS: 180000,
}));
vi.mock('../../config/evolution.js', () => ({
    EVOLUTION_PATHS: {
        carnivore: { levels: [] },
        omnivore: { levels: [] },
    },
}));
vi.mock('../../config/organs.js', () => ({
    ORGANS: {},
}));
vi.mock('../../systems/loot.js', () => ({
    _spawnBone: vi.fn(),
}));
vi.mock('../../systems/organs.js', () => ({
    getOrganLevel: mocks.getOrganLevel,
    getOrganCumulative: mocks.getOrganCumulative,
    handleEliteKill: mocks.handleEliteKill,
    applyOrganEffects: mocks.applyOrganEffects,
}));
vi.mock('../../systems/tutorial.js', () => ({
    handleTutorialStumpKill: mocks.handleTutorialStumpKill,
}));

function resetGameState(overrides = {}) {
    Object.assign(mocks.gameState, {
        player: {
            x: 100,
            y: 100,
            radius: 10,
            hp: 100,
            maxHp: 100,
            damageReduction: 0,
            thornDamage: 0,
            organs: [],
            evolution: { herbivore: 0, carnivore: 0, omnivore: 0 },
            attack: 50,
            attackRange: 80,
            attackSpeedBonus: 0,
            attackTimer: -Infinity,
            critChance: 0,
            critMultiplier: 2,
            mutationXpBonus: 0,
        },
        playerSkills: {},
        stats: { hpCurrent: 100, hpMax: 100 },
        neutralCreatures: [],
        hostileCreatures: [],
        corpses: [],
        floatTexts: [],
        boss: null,
        bossSpawned: false,
        eliteCreature: null,
        tutorialStump: null,
        selectedCharacter: 'koel',
        _chargeAttack: false,
        _mobileChargeAttack: false,
        topBarTarget: null,
        gameOver: false,
        ...overrides,
    });
}

let handleKill;
let applyDamageToPlayer;
let playerAttack;
let setRangedAttackCallback;

beforeEach(async () => {
    vi.clearAllMocks();
    resetGameState();
    if (!globalThis.window) {
        globalThis.window = {
            dispatchEvent: () => true,
        };
    }
    if (!globalThis.CustomEvent) {
        globalThis.CustomEvent = class CustomEvent extends Event {
            constructor(type, params = {}) {
                super(type, params);
                this.detail = params.detail;
            }
        };
    }

    ({ handleKill, applyDamageToPlayer } = await import('../../systems/damage.js'));
    ({ playerAttack, setRangedAttackCallback } = await import('../../systems/combat.js'));
    setRangedAttackCallback(null);
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('handleKill', () => {
    it('擊殺敵對生物會給正數 XP 並顯示浮動文字', () => {
        const creature = { x: 10, y: 20, radius: 8, hp: 0, maxHp: 100 };
        mocks.gameState.hostileCreatures.push(creature);

        handleKill(creature, true);

        expect(mocks.addXP).toHaveBeenCalledWith(expect.any(Number));
        expect(mocks.addXP.mock.calls[0][0]).toBeGreaterThan(0);
        expect(mocks.showFloatingText).toHaveBeenCalled();
    });

    it('擊殺中立生物會給 20 XP', () => {
        const creature = { x: 10, y: 20, radius: 8, hp: 0, maxHp: 50 };
        mocks.gameState.neutralCreatures.push(creature);

        handleKill(creature, false);

        expect(mocks.addXP).toHaveBeenCalledWith(20);
    });

    it('擊殺後會從 hostileCreatures 移除並加入 corpses', () => {
        const creature = { x: 10, y: 20, radius: 8, hp: 0, maxHp: 50 };
        mocks.gameState.hostileCreatures.push(creature);

        handleKill(creature, true);

        expect(mocks.gameState.hostileCreatures).not.toContain(creature);
        expect(mocks.gameState.corpses).toHaveLength(1);
        expect(mocks.gameState.corpses[0]).toMatchObject({ x: 10, y: 20, radius: 8 });
    });

    it('擊殺精英怪會 dispatch eliteKilled 並帶上 killer', () => {
        const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
        const creature = { x: 10, y: 20, radius: 8, hp: 0, maxHp: 50, isElite: true };
        mocks.gameState.hostileCreatures.push(creature);

        handleKill(creature, true);

        expect(dispatchSpy).toHaveBeenCalled();
        const event = dispatchSpy.mock.calls.find(([e]) => e.type === 'eliteKilled')?.[0];
        expect(event).toBeTruthy();
        expect(event.detail.killer).toBe(creature);
    });
});

describe('playerAttack bossKilled dispatch', () => {
    it('命中 Boss 且 Boss hp <= 0 時 dispatch bossKilled', () => {
        const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
        mocks.gameState.boss = { x: 100, y: 100, radius: 20, hp: 30, maxHp: 100 };
        mocks.gameState.bossSpawned = true;

        playerAttack();

        const event = dispatchSpy.mock.calls.find(([e]) => e.type === 'bossKilled')?.[0];
        expect(event).toBeTruthy();
    });
});

describe('applyDamageToPlayer', () => {
    it('玩家 hp 100，受傷 20 後變 80', () => {
        applyDamageToPlayer(20, null);

        expect(mocks.gameState.stats.hpCurrent).toBe(80);
    });

    it('玩家 hp 10，受傷 20 後不低於 0', () => {
        resetGameState({ stats: { hpCurrent: 10, hpMax: 100 } });

        applyDamageToPlayer(20, null);

        expect(mocks.gameState.stats.hpCurrent).toBe(0);
    });

    it('玩家有 tenacity 時，致死傷害會觸發堅毅並保留 HP', () => {
        resetGameState({
            player: {
                ...mocks.gameState.player,
                tenacityUsed: false,
            },
            playerSkills: { tenacity: 2 },
            stats: { hpCurrent: 10, hpMax: 100 },
        });

        applyDamageToPlayer(20, null);

        expect(mocks.gameState.stats.hpCurrent).toBe(20);
        expect(mocks.gameState.player.tenacityUsed).toBe(true);
    });

    it('玩家死亡且無 tenacity 時 dispatch showSkillTree', () => {
        const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
        resetGameState({
            playerSkills: { tenacity: 0 },
            stats: { hpCurrent: 1, hpMax: 100 },
            gameOver: false,
        });

        applyDamageToPlayer(20, null);

        const event = dispatchSpy.mock.calls.find(([e]) => e.type === 'showSkillTree')?.[0];
        expect(event).toBeTruthy();
    });
});

describe('setRangedAttackCallback', () => {
    it('玩家 isRanged=true 時會呼叫注入的 callback 一次', () => {
        const callback = vi.fn();
        mocks.gameState.player.isRanged = true;
        setRangedAttackCallback(callback);

        playerAttack();

        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('未注入 callback 時，playerAttack 不報錯', () => {
        mocks.gameState.player.isRanged = true;
        setRangedAttackCallback(null);

        expect(() => playerAttack()).not.toThrow();
    });
});
