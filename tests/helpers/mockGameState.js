export function createMockGameState(overrides = {}) {
    return {
        player: {
            x: 2000, y: 2000,
            hp: 100, maxHp: 100,
            organs: [],
            skills: {},
            ...( overrides.player || {})
        },
        camera: {
            x: 2000, y: 2000,
            ...( overrides.camera || {})
        },
        settings: {
            volume: { master: 1, music: 0.7, sfx: 1 },
            keys: {},
            ...( overrides.settings || {})
        },
        creatures: [],
        fruits: [],
        isRunning: false,
        ...overrides
    };
}
