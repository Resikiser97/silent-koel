// =============================================================
// config/attributes.js — 屬性模組化資料（純資料，v1）
// 設計格式見 docs/MODULAR_ATTRIBUTE_DESIGN.md
// =============================================================

export const ATTRIBUTES = [
    // ── venom ────────────────────────────────────────────────
    {
        id: 'venom',
        displayName: '毒霧',
        category: 'element',
        tags: ['poison', 'area-control'],
        appliesTo: {
            creatureKinds: ['elite', 'boss'],
            combatRoles: ['melee', 'ranged'],
            phases: ['any'],
        },
        statModifiers: {
            hpMultiplier: 1,
            damageMultiplier: 1,
            speedMultiplier: 1,
            flatDamageAdd: 0,
            poisonResistAdd: 0,
        },
        abilities: [
            {
                id: 'venom_on_hit',
                appliesTo: ['melee'],
                trigger: 'onHit',
                effect: 'applyPoison',
                params: { dps: 8, durationMs: 3000 },
            },
            {
                id: 'venom_fang',
                appliesTo: ['ranged'],
                trigger: 'attack',
                effect: 'fireProjectile',
                params: { projectileType: 'venomFang' },
            },
            {
                id: 'venom_puddle',
                appliesTo: ['ranged', 'boss'],
                trigger: 'attack',
                effect: 'spawnPuddle',
                params: { radius: 80, durationMs: 4000, maxActive: 6 },
            },
        ],
        visualProfile: {
            color: '#1B5E20',
            glowColor: '#66BB6A',
            ring: 'fog',
        },
        audioProfile: {
            appear: null,
            attack: null,
            hit: null,
            death: null,
        },
        notes: 'v1 設計資料；runtime 實作位置待 v0.2.x 決定。',
    },

    // ── specter ──────────────────────────────────────────────
    {
        id: 'specter',
        displayName: '幽靈',
        category: 'element',
        tags: ['ranged', 'precision'],
        appliesTo: {
            creatureKinds: ['elite'],
            combatRoles: ['melee', 'ranged'],
            phases: ['any'],
        },
        statModifiers: {
            hpMultiplier: 1,
            damageMultiplier: 1,
            speedMultiplier: 1,
            flatDamageAdd: 0,
            poisonResistAdd: 0,
        },
        abilities: [
            {
                id: 'specter_sniper',
                appliesTo: ['ranged'],
                trigger: 'attack',
                effect: 'fireProjectile',
                params: {
                    pattern: 'single',
                    projectileSpeed: 14,
                    maxRange: 1000,
                    aimDurationMs: 300,
                },
            },
        ],
        visualProfile: {
            color: '#243B80',
            glowColor: '#6677FF',
            ring: 'pulse',
        },
        audioProfile: {
            appear: null,
            attack: null,
            hit: null,
            death: null,
        },
        notes: 'v1 設計資料；runtime 實作位置待 v0.2.x 決定。',
    },

    // ── shadow ───────────────────────────────────────────────
    {
        id: 'shadow',
        displayName: '暗影',
        category: 'element',
        tags: ['burst', 'spread-shot'],
        appliesTo: {
            creatureKinds: ['elite'],
            combatRoles: ['melee', 'ranged'],
            phases: ['any'],
        },
        statModifiers: {
            hpMultiplier: 1,
            damageMultiplier: 1,
            speedMultiplier: 1,
            flatDamageAdd: 0,
            poisonResistAdd: 0,
        },
        abilities: [
            {
                id: 'shadow_fast_melee',
                appliesTo: ['melee'],
                trigger: 'attack',
                effect: 'modifyStats',
                params: { attackCooldownMultiplier: 0.8 },
            },
            {
                id: 'shadow_shotgun',
                appliesTo: ['ranged'],
                trigger: 'attack',
                effect: 'fireProjectilePattern',
                params: {
                    pattern: 'spread',
                    pellets: 4,
                    spreadAngle: 60,
                    projectileSpeed: 10,
                    maxRange: 650,
                },
            },
        ],
        visualProfile: {
            color: '#212121',
            glowColor: '#FF7043',
            ring: 'rotate',
        },
        audioProfile: {
            appear: null,
            attack: null,
            hit: null,
            death: null,
        },
        notes: 'v1 設計資料；runtime 實作位置待 v0.2.x 決定。',
    },

    // ── sniper ───────────────────────────────────────────────
    {
        id: 'sniper',
        displayName: '狙擊槍',
        category: 'weapon',
        tags: ['ranged', 'precision', 'warning-line'],
        appliesTo: {
            creatureKinds: ['boss'],
            combatRoles: ['ranged'],
            phases: ['phase1', 'phase3'],
        },
        statModifiers: {
            hpMultiplier: 1,
            damageMultiplier: 1,
            speedMultiplier: 1,
            flatDamageAdd: 0,
            poisonResistAdd: 0,
        },
        abilities: [
            {
                id: 'sniper_shot',
                appliesTo: ['boss'],
                trigger: 'attack',
                effect: 'fireProjectile',
                params: {
                    pattern: 'single',
                    projectileSpeed: 18,
                    aimDurationMs: null,
                },
            },
        ],
        visualProfile: {
            warning: 'aimLine',
        },
        audioProfile: {
            appear: null,
            attack: null,
            hit: null,
            death: null,
        },
        notes: 'v1 設計資料；黑色獵人 Phase 1 / Phase 3 使用。',
    },

    // ── shotgun ──────────────────────────────────────────────
    {
        id: 'shotgun',
        displayName: '霰彈槍',
        category: 'weapon',
        tags: ['ranged', 'spread-shot', 'close-pressure'],
        appliesTo: {
            creatureKinds: ['boss'],
            combatRoles: ['ranged'],
            phases: ['phase2', 'phase3'],
        },
        statModifiers: {
            hpMultiplier: 1,
            damageMultiplier: 1,
            speedMultiplier: 1,
            flatDamageAdd: 0,
            poisonResistAdd: 0,
        },
        abilities: [
            {
                id: 'shotgun_spread',
                appliesTo: ['boss'],
                trigger: 'attack',
                effect: 'fireProjectilePattern',
                params: {
                    pattern: 'spread',
                    pellets: null,
                    spreadAngle: null,
                    projectileSpeed: 12,
                },
            },
        ],
        visualProfile: {},
        audioProfile: {
            appear: null,
            attack: null,
            hit: null,
            death: null,
        },
        notes: 'v1 設計資料；黑色獵人 Phase 2 / Phase 3 使用。',
    },
];
