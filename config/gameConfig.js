// =============================================================
// 遊戲基本設定 - GAME_INFO / GAME_TIMING / AUDIO_FILES
// =============================================================

const GAME_INFO = {
    title:        '只吃不叫的噪鵑',
    subtitle:     'The Silent Koel',
    author:       'Goblinnest',
    version:      'v0.23.0',
    SAVE_VERSION: '1.0'
};

const GAME_TIMING = {
    totalTime:   600,
    phaseCount:  8,
    phaseLength: 75,
    phaseBoundaries: [600, 525, 450, 375, 300, 225, 150, 75, 0]
};

const AUDIO_FILES = {
    attackNormal: ['Sound MP3/Koel_Normal1.mp3', 'Sound MP3/Koel_Normal2.mp3'],
    attackCrit:   'Sound MP3/Koel_Crit1.mp3',
    hurt:         'Sound MP3/Koel_Hurt1.mp3',
    death:        'Sound MP3/Death1.mp3',
    levelUp:      'Sound MP3/Levelup.mp3',
    morningTheme: 'Sound MP3/Morning Theme.mp3',
    bossTheme:    'Sound MP3/Boss Theme.mp3',
    victory:      'Sound MP3/Victory.mp3',
    eatFruit:     'Sound MP3/apple_bite.mp3',
    bossBell:     'Sound MP3/Boss_bell1.mp3'
};
