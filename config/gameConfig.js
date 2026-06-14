// =============================================================
// 遊戲基本設定 - GAME_INFO / GAME_TIMING / AUDIO_FILES
// =============================================================

export const GAME_INFO = {
    title:        '只吃不叫的噪鵑',
    subtitle:     'The Silent Koel',
    author:       'Goblinnest',
    version:      'v0.1.22.1',
    SAVE_VERSION: '1.1'
};

export const GAME_TIMING = {
    totalTime:   600,
    phaseCount:  8,
    phaseLength: 75,
    phaseBoundaries: [600, 525, 450, 375, 300, 225, 150, 75, 0]
};

export const CORPSE_EAT_HP        = 3.0;    // 吃屍體回血總量
export const CORPSE_BONE_EAT_TICK = 500;    // 屍體/白骨 tick 間隔 (ms)
export const CORPSE_EXPIRE_MS     = 60000;  // 屍體消失時間 (ms)
export const BONE_EXPIRE_MS       = 180000; // 白骨消失時間 (ms)
export const ARCHER_BULLET_SPEED  = 9;      // 阿奇爾子彈速度

// 靜音獵隊精英怪數值（困難地圖）
export const HARD_ELITE_CONFIG = {
    specterDog:   { hp: 480,  damage: 20, attackCooldown: 1200, radius: 14, type: 'melee' },
    shadowDog:    { hp: 900,  damage: 30, attackCooldown:  900, radius: 14, type: 'melee' },
    venomDog:     { hp: 1500, damage: 45, attackCooldown: 1500, radius: 14, type: 'melee', poisonDps: 8, poisonDuration: 3000 },
    specterFalcon: { hp: 336,  damage: 26, attackCooldown: 3000, radius: 16, type: 'ranged', range:  900, bulletSpeed: 14, maxRange: 1000, aimDuration:  300 },
    shadowFalcon:  { hp: 630,  damage: 39, attackCooldown: 2000, radius: 16, type: 'ranged', range:  600, bulletSpeed: 10, maxRange:  650, aimDuration:    0, pellets: 4, spreadAngle: 60 },
    venomFalcon:   { hp: 1050, damage: 58, attackCooldown: 3000, radius: 16, type: 'ranged', range:  700,
                     poisonDps: 8, puddleRadius: 80, puddleDuration: 4000, maxPuddles: 6,
                     puddleCenterOffset: 150, puddleSideRadius: 200, puddlePoisonDuration: 3000,
                     fangCooldown: 2500, fangSpeed: 14, fangSpreadDeg: 25,
                     fangPoisonDmg: 8, fangPoisonDuration: 3000,
                     selfCdBonus: 500, sharedCdBonus: 200 },
};

export const AUDIO_FILES = {
    attackNormal: ['sounds/Koel_Normal1.mp3', 'sounds/Koel_Normal2.mp3'],
    attackCrit:   'sounds/Koel_Crit1.mp3',
    hurt:         'sounds/Koel_Hurt1.mp3',
    death:        'sounds/Death1.mp3',
    levelUp:      'sounds/Levelup.mp3',
    morningTheme: 'sounds/Morning Theme.mp3',
    bossTheme:     'sounds/Boss Theme.mp3',
    superBossTheme: 'sounds/Super boss.mp3',
    introTheme:     'sounds/Intro Theme.mp3',
    victory:      'sounds/Victory.mp3',
    eatFruit:     'sounds/apple_bite.mp3',
    bossBell:     'sounds/Boss_bell1.mp3',

    // ── 黑色獵人 Boss
    hunterDetect:         'sounds/new/hunter_detect.mp3',
    hunterFootstep:       ['sounds/new/hunter_footstep_1.mp3', 'sounds/new/hunter_footstep_2.mp3'],
    hunterSniperAim:      'sounds/new/hunter_sniper_aim.mp3',
    hunterSniperCharge:   'sounds/new/hunter_sniper_charge.mp3',
    hunterSniperFire:     'sounds/new/hunter_sniper_fire.mp3',
    hunterBulletFly:      'sounds/new/hunter_bullet_fly.mp3',
    hunterBulletHit:      'sounds/new/hunter_bullet_hit_terrain.mp3',
    hunterShotgunPump:    'sounds/new/hunter_shotgun_pump.mp3',
    hunterShotgunFire:    'sounds/new/hunter_shotgun_fire.mp3',
    hunterPelletFly:      ['sounds/new/hunter_pellet_fly_1.mp3', 'sounds/new/hunter_pellet_fly_2.mp3'],
    hunterPhase3Charge:   'sounds/new/hunter_phase3_charge.mp3',
    hunterPhase3Fire:     'sounds/new/hunter_phase3_fire.mp3',
    hunterPhase2Activate: 'sounds/new/hunter_phase2_activate.mp3',
    hunterPhase3Activate: 'sounds/new/hunter_phase3_activate.mp3',
    hunterVoiceIntro:     'sounds/new/hunter_voice_intro.mp3',
    hunterVoiceDeath:     'sounds/new/hunter_voice_death.mp3',
    hunterHurt:           ['sounds/new/hunter_hurt_1.mp3', 'sounds/new/hunter_hurt_2.mp3'],

    // ── 精英怪：三隼
    specterFalconAppear: 'sounds/new/specter_falcon_appear.mp3',
    specterFalconAim:    'sounds/new/specter_falcon_aim.mp3',
    specterFalconFire:   'sounds/new/specter_falcon_fire.mp3',
    specterFalconHurt:   'sounds/new/specter_falcon_hurt.mp3',
    specterFalconDeath:  'sounds/new/specter_falcon_death.mp3',
    shadowFalconAppear:  'sounds/new/shadow_falcon_appear.mp3',
    shadowFalconFire:    'sounds/new/shadow_falcon_fire.mp3',
    shadowFalconHurt:    'sounds/new/shadow_falcon_hurt.mp3',
    shadowFalconDeath:   'sounds/new/shadow_falcon_death.mp3',
    venomFangFly:        'sounds/new/hunter_bullet_fly.mp3',
    venomFalconAppear:   'sounds/new/venom_falcon_appear.mp3',
    venomFalconLaunch:   'sounds/new/venom_falcon_launch.mp3',
    venomFalconLand:     'sounds/new/venom_falcon_land.mp3',
    venomFalconSpread:   'sounds/new/venom_falcon_spread.mp3',
    venomFalconHurt:     'sounds/new/venom_falcon_hurt.mp3',
    venomFalconDeath:    'sounds/new/venom_falcon_death.mp3',

    // ── 精英怪：三犬
    specterDogAppear: 'sounds/new/dog_appear.mp3',
    shadowDogAppear:  'sounds/new/dog_appear.mp3',
    venomDogAppear:   'sounds/new/dog_appear.mp3',
    dogAttack:        ['sounds/new/dog_attack_1.mp3', 'sounds/new/dog_attack_2.mp3'],
    dogHurt:          'sounds/new/dog_hurt_1.mp3',
    dogDeath:         'sounds/new/dog_death.mp3',
    dogAppearFanfare: 'sounds/new/dog_appear_fanfare.mp3',
    venomDogBite:     'sounds/new/venom_dog_bite.mp3',

    // ── 阿奇爾（Archerfish）
    archerAttackNormal:  ['sounds/new/archer_attackNormal_1.mp3', 'sounds/new/archer_attackNormal_2.mp3'],
    archerAttackCrit:    'sounds/new/archer_attackCrit.mp3',
    archerChargeAttack:  'sounds/new/archer_Chargeattack.mp3',
    archerHurt:          ['sounds/new/archer_hurt_1.mp3', 'sounds/new/archer_hurt_2.mp3'],
    archerDeath:         'sounds/new/archer_death.mp3',
};

export const FIXED_FPS   = 60;
export const FIXED_DELTA = 1000 / FIXED_FPS;
