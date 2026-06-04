// =============================================================
// 遊戲基本設定 - GAME_INFO / GAME_TIMING / AUDIO_FILES
// =============================================================

const GAME_INFO = {
    title:        '只吃不叫的噪鵑',
    subtitle:     'The Silent Koel',
    author:       'Goblinnest',
    version:      'v0.1.3.0',
    SAVE_VERSION: '1.1'
};

const GAME_TIMING = {
    totalTime:   600,
    phaseCount:  8,
    phaseLength: 75,
    phaseBoundaries: [600, 525, 450, 375, 300, 225, 150, 75, 0]
};

const CORPSE_EAT_HP        = 3.0;    // 吃屍體回血總量
const CORPSE_BONE_EAT_TICK = 500;    // 屍體/白骨 tick 間隔 (ms)
const CORPSE_EXPIRE_MS     = 60000;  // 屍體消失時間 (ms)
const BONE_EXPIRE_MS       = 180000; // 白骨消失時間 (ms)
const ARCHER_BULLET_SPEED  = 9;      // 阿奇爾子彈速度

// 靜音獵隊精英怪數值（困難地圖）
const HARD_ELITE_CONFIG = {
    specterDog:   { hp: 480,  damage: 20, attackCooldown: 1200, radius: 14, type: 'melee' },
    shadowDog:    { hp: 900,  damage: 30, attackCooldown:  900, radius: 14, type: 'melee' },
    venomDog:     { hp: 1500, damage: 45, attackCooldown: 1500, radius: 14, type: 'melee', poisonDps: 8, poisonDuration: 3000 },
    specterFalcon: { hp: 336,  damage: 26, attackCooldown: 3000, radius: 16, type: 'ranged', range:  900, bulletSpeed: 14, maxRange: 1000, aimDuration:  300 },
    shadowFalcon:  { hp: 630,  damage: 39, attackCooldown: 2000, radius: 16, type: 'ranged', range:  600, bulletSpeed: 10, maxRange:  650, aimDuration:    0, pellets: 4, spreadAngle: 60 },
    venomFalcon:   { hp: 1050, damage: 58, attackCooldown: 4000, radius: 16, type: 'ranged', range:  700, poisonDps: 8, puddleRadius: 80, puddleDuration: 6000, maxPuddles: 3 },
};

const AUDIO_FILES = {
    attackNormal: ['Sound MP3/Koel_Normal1.mp3', 'Sound MP3/Koel_Normal2.mp3'],
    attackCrit:   'Sound MP3/Koel_Crit1.mp3',
    hurt:         'Sound MP3/Koel_Hurt1.mp3',
    death:        'Sound MP3/Death1.mp3',
    levelUp:      'Sound MP3/Levelup.mp3',
    morningTheme: 'Sound MP3/Morning Theme.mp3',
    bossTheme:     'Sound MP3/Boss Theme.mp3',
    superBossTheme: 'Sound MP3/Super boss.mp3',
    introTheme:     'Sound MP3/Intro Theme.mp3',
    victory:      'Sound MP3/Victory.mp3',
    eatFruit:     'Sound MP3/apple_bite.mp3',
    bossBell:     'Sound MP3/Boss_bell1.mp3',

    // ── 黑色獵人 Boss
    hunterDetect:         'Sound MP3/New sound/hunter_detect.mp3',
    hunterFootstep:       ['Sound MP3/New sound/hunter_footstep_1.mp3', 'Sound MP3/New sound/hunter_footstep_2.mp3'],
    hunterSniperAim:      'Sound MP3/New sound/hunter_sniper_aim.mp3',
    hunterSniperCharge:   'Sound MP3/New sound/hunter_sniper_charge.mp3',
    hunterSniperFire:     'Sound MP3/New sound/hunter_sniper_fire.mp3',
    hunterBulletFly:      'Sound MP3/New sound/hunter_bullet_fly.mp3',
    hunterBulletHit:      'Sound MP3/New sound/hunter_bullet_hit_terrain.mp3',
    hunterShotgunPump:    'Sound MP3/New sound/hunter_shotgun_pump.mp3',
    hunterShotgunFire:    'Sound MP3/New sound/hunter_shotgun_fire.mp3',
    hunterPelletFly:      ['Sound MP3/New sound/hunter_pellet_fly_1.mp3', 'Sound MP3/New sound/hunter_pellet_fly_2.mp3'],
    hunterPhase3Charge:   'Sound MP3/New sound/hunter_phase3_charge.mp3',
    hunterPhase3Fire:     'Sound MP3/New sound/hunter_phase3_fire.mp3',
    hunterPhase2Activate: 'Sound MP3/New sound/hunter_phase2_activate.mp3',
    hunterPhase3Activate: 'Sound MP3/New sound/hunter_phase3_activate.mp3',
    hunterVoiceIntro:     'Sound MP3/New sound/hunter_voice_intro.mp3',
    hunterVoiceDeath:     'Sound MP3/New sound/hunter_voice_death.mp3',
    hunterHurt:           ['Sound MP3/New sound/hunter_hurt_1.mp3', 'Sound MP3/New sound/hunter_hurt_2.mp3'],

    // ── 精英怪：三隼
    specterFalconAppear: 'Sound MP3/New sound/specter_falcon_appear.mp3',
    specterFalconAim:    'Sound MP3/New sound/specter_falcon_aim.mp3',
    specterFalconFire:   'Sound MP3/New sound/specter_falcon_fire.mp3',
    specterFalconHurt:   'Sound MP3/New sound/specter_falcon_hurt.mp3',
    specterFalconDeath:  'Sound MP3/New sound/specter_falcon_death.mp3',
    shadowFalconAppear:  'Sound MP3/New sound/shadow_falcon_appear.mp3',
    shadowFalconFire:    'Sound MP3/New sound/shadow_falcon_fire.mp3',
    shadowFalconHurt:    'Sound MP3/New sound/shadow_falcon_hurt.mp3',
    shadowFalconDeath:   'Sound MP3/New sound/shadow_falcon_death.mp3',
    venomFalconAppear:   'Sound MP3/New sound/venom_falcon_appear.mp3',
    venomFalconLaunch:   'Sound MP3/New sound/venom_falcon_launch.mp3',
    venomFalconLand:     'Sound MP3/New sound/venom_falcon_land.mp3',
    venomFalconSpread:   'Sound MP3/New sound/venom_falcon_spread.mp3',
    venomFalconHurt:     'Sound MP3/New sound/venom_falcon_hurt.mp3',
    venomFalconDeath:    'Sound MP3/New sound/venom_falcon_death.mp3',

    // ── 精英怪：三犬
    specterDogAppear: 'Sound MP3/New sound/dog_appear.mp3',
    shadowDogAppear:  'Sound MP3/New sound/dog_appear.mp3',
    venomDogAppear:   'Sound MP3/New sound/dog_appear.mp3',
    dogAttack:        ['Sound MP3/New sound/dog_attack_1.mp3', 'Sound MP3/New sound/dog_attack_2.mp3'],
    dogHurt:          'Sound MP3/New sound/dog_hurt_1.mp3',
    dogDeath:         'Sound MP3/New sound/dog_death.mp3',
    dogAppearFanfare: 'Sound MP3/New sound/dog_appear_fanfare.mp3',
    venomDogBite:     'Sound MP3/New sound/venom_dog_bite.mp3',

    // ── 阿奇爾（Archerfish）
    archerAttackNormal:  ['Sound MP3/New sound/archer_attackNormal_1.mp3', 'Sound MP3/New sound/archer_attackNormal_2.mp3'],
    archerAttackCrit:    'Sound MP3/New sound/archer_attackCrit.mp3',
    archerChargeAttack:  'Sound MP3/New sound/archer_Chargeattack.mp3',
    archerHurt:          ['Sound MP3/New sound/archer_hurt_1.mp3', 'Sound MP3/New sound/archer_hurt_2.mp3'],
    archerDeath:         'Sound MP3/New sound/archer_death.mp3',
};
