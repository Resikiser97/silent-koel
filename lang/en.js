// =============================================================
// English language pack (en)
// ✦ To add a new language: copy this file, rename it (e.g. ja.js),
//   translate only the string values, then add an entry to
//   LANG_LIST in lang.js. Never rename keys or remove {tokens}.
// =============================================================

LANG['en'] = {
    ui: {
        startGame: '▶ Start Game',
        skillTree: '🌿 Skill Tree',
        guide:     '📖 Guide',
        settings:  '⚙️ Settings',
        settingsTitle: '⚙️ Settings',
        sectionLanguage: 'Language',
        sectionVolume:   'Audio',
        sectionKeys:     'Key Bindings',
        sectionOther:    'Other',
        volMaster:  'Master',
        volMusic:   'Music',
        volSfx:     'SFX',
        on: 'On', off: 'Off',
        keyUp:      'Move Up',
        keyDown:    'Move Down',
        keyLeft:    'Move Left',
        keyRight:   'Move Right',
        keyAttack:  'Attack',
        mouseLeft:  'Left Click',
        pressNewKey: 'Press a new key...',
        restartGame: 'Restart Game',
        resetDefault: 'Reset to Defaults',
        confirmRestart: 'Restart now? Run progress will be lost. No skill points awarded unless an Elite has been killed.',
        confirmResetSettings: 'Reset all audio and key bindings to defaults?',
        saveAndBack: 'Save & Back',
        close: 'Close',
        timeLabel: 'Time',
        dayCycleFormat: 'It is now {phase}',
        phaseDay: 'Day',
        phaseNight: 'Night',
        biomeForest: '🌲 Forest',
        biomeOcean: '🌊 Ocean',
        biomeDesert: '🏜️ Desert',
        devMode: '🛠️ Dev Mode',
        devFruits: '🍎 Fruits',
        devNeutral: '🟠 Neutral',
        devHostile: '🔴 Hostile',
        slotLabel: 'Slots',
        organLabel: 'Organs',
        canEvolve: ' ✨Can Evolve',
        inheritedSuffix: ' (inherited)',
        chooseOrgan:    '✦ Choose an Organ or Upgrade ✦',
        chooseEvo:      '✦ Choose an Evolution Path ✦',
        comboHintLabel: '⚡ Combo: ',
        comboLabel:     '⚡ Combo',
        hiddenOrganTag: '✨ Hidden Organ',
        hiddenOrganDrop: '✨ A Hidden Organ has dropped!',
        hiddenOrganPickOne: 'Pick 1 (Hidden organs do not use normal slots)',
        hiddenOrganClickOne: 'Click to claim (Hidden organs do not use normal slots)',
        rerollBtn: '🎲 Reroll ({n} left)',
        levelUpFloat: '⬆️ Level Up! Lv.{lv}',
        xpPopupPrefix: '+',
        xpPopupSuffix: ' XP',
        fullText: 'Sated! HP+5',
        tenacityFloat: 'Tenacity!',
        noAttackOrgan: 'No attack organ!',
        bleedFloat: 'Bleed -{n}',
        poisonFloat: 'Poison -{n}',
        nightCome: '🌙 Night falls',
        morningCome: '☀️ Dawn arrives',
        morningEliteGone: '☀️ Dawn arrives, the Elite retreats',
        morningEliteKilled: '☀️ Elite slain! Dawn comes early!',
        eliteAppeared: '🌟 An Elite has appeared!',
        bossAppeared: '⚠️ The mighty {name} appears!',
        gameOverTitle: 'Game Over',
        timeUp: 'Time is up!',
        finalXP: 'Final XP: {xp}',
        restart: 'Restart',
        youDied: '💀 You Died',
        timeoutTitle: '⏰ Time Up',
        victoryTitle: '🏆 Victory!',
        victoryDesc: '{boss} has been slain!',
        victoryReward: '+500 XP, gained 1 skill point',
        goSkillTree: 'Go to Skill Tree',
        backHome: '🏠 Back to Home',
        playAgain: '⚔️ Play Again',
        skillTreeTitle: '🌿 Skill Tree',
        skillPoints: 'Skill Points',
        resetSkills: 'Reset Skill Points',
        confirmResetSkills: 'Reset all skill points?',
        maxed: 'Maxed',
        upgradeCost1: 'Upgrade (1 pt)',
        keepOrgans: 'Choose organs to keep (max {n}, inherited next run)',
        noOrganThisRun: 'No organs gained this run',
        keepHiddenOne: '✨ Keep one hidden organ (optional)',
        inheritOrgansHome: '📦 Choose organs to inherit (max {n})',
        inheritHiddenHome: '✨ Choose one hidden organ to inherit (optional)',
        lastRunOrgansTitle: '📦 Organs from last run',
        noRecord: 'No record yet',
        guideTitle: '📖 Guide',
        guidePrev: '◀',
        guideNext: '▶',
        guidePageFmt: '{cur} / {total}',
        guidePages: [
            {
                title: 'Basic Controls',
                lines: [
                    '🎮 Move: WASD or Arrow Keys',
                    '⚔️ Attack: Space or Left Click',
                    '⚙️ Settings: Esc',
                    '🍎 Eat Fruit: walk over it to auto-eat',
                    '🎯 Goal: defeat the final Boss within 10 minutes'
                ]
            },
            {
                title: 'Organ System',
                lines: [
                    '⭐ Gain enough XP to choose an organ',
                    '⚔️ Attack    🛡️ Defense    🔮 Spirit',
                    '📈 Organs upgrade up to Lv.3, each level uses a slot',
                    '✨ When slots are full you can choose an evolution path',
                    '💀 After death you can keep some organs for the next run',
                    '🌟 Defeat Elites for a chance at Hidden Organs ✨'
                ]
            },
            {
                title: 'Evolution System',
                lines: [
                    '🌿 Herbivore: more HP, neutral creatures stop fleeing',
                    '🥩 Carnivore: eat corpses for bonus XP, more attack',
                    '⚖️ Omnivore: needs both Herbivore and Carnivore to unlock, gains speed',
                    '📈 Each path goes up to Lv.3',
                    '🔁 Evolution paths reset every run and are not inherited'
                ]
            }
        ]
    },
    organs: {
        crabClaw:      { name: 'Crab Claw', levels: [
            'Atk +8, 15% Bleed (1 dmg/s for 3s)',
            'Atk +2, Bleed +5%, +1 dmg/s, +1s duration',
            'Atk +3, Bleed +10%, +1 dmg/s, +1s duration'
        ]},
        boxingGloves:  { name: 'Boxing Gloves', levels: [
            'Atk +5, Attack Speed +30%',
            'Atk +2, Attack Speed +5%',
            'Atk +3, Attack Speed +5%'
        ]},
        poisonStinger: { name: 'Poison Stinger', levels: [
            'Atk +1, attacks poison: 2 dmg/s for 5s',
            '+1 dmg/s, +1s duration',
            '+2 dmg/s, +1s duration'
        ]},
        fang:          { name: 'Fang', levels: [
            'Atk +12, 15% chance to stun for 1s',
            'Atk +2, Stun chance +2%',
            'Atk +3, Stun chance +3%'
        ]},
        longLegs:      { name: 'Long Legs', levels: [
            'Move Speed +0.5',
            'Move Speed +0.5',
            'Move Speed +0.5'
        ]},
        turtleShell:   { name: 'Turtle Shell', levels: [
            'Damage Taken -30%, Speed -0.2',
            'Extra DR -3%, recover Speed +0.1',
            'Extra DR -7%, recover Speed +0.1'
        ]},
        thickSkin:     { name: 'Thick Skin', levels: [
            'Max HP +50, current HP +50',
            'Max HP +50, Size +20% (radius +2, attack range scales)',
            'Max HP +50, Size +20% more'
        ]},
        thornArmor:    { name: 'Thorn Armor', levels: [
            'Reflect 10% damage when hit',
            'Reflect +5%',
            'Reflect +5%, plus 5% of your attack as bonus reflect'
        ]},
        brain:         { name: 'Brain', levels: [
            'Every 5s: 8 dmg in 100px radius, Pickup +10px',
            'Cooldown -1s, range +20px, dmg +4, pickup +15px',
            'Cooldown -1s, range +30px, dmg +8, pickup +15px'
        ]},
        trueEye:       { name: 'True Eye', levels: [
            'Crit +10%, Crit Damage x1.5',
            'Crit +5%, Crit Damage +0.25',
            'Crit +10%, Crit Damage +0.25'
        ]},
        sharpSense:    { name: 'Sharp Sense', levels: [
            'Hostile detection range -30px',
            'Detection range -20px more',
            'Detection range -20px more'
        ]},
        naturalRegen:  { name: 'Natural Regen', levels: [
            'Recover 1 HP every 10s',
            'Interval -2s, HP +1',
            'Interval -3s, HP +1'
        ]}
    },
    hidden: {
        strongHeart: { name: 'Mighty Heart', desc: 'Speed +0.2, Atk +5, Max HP +100, Size +20%' },
        strongLegs:  { name: 'Mighty Legs',  desc: 'Speed +1, Size +20%' },
        strongArms:  { name: 'Mighty Arms',  desc: 'Pickup +15px, Size +20% (attack range scales)' }
    },
    skills: {
        vitality:            { name: 'Vitality',            desc: 'Starting HP +20 (per level)' },
        agility:             { name: 'Agility',             desc: 'Starting Speed +0.2 (per level)' },
        forager:             { name: 'Forager',             desc: 'Fruit XP +3 (per level)' },
        hunter:              { name: "Hunter's Instinct",   desc: 'Kill XP +10 (per level)' },
        tenacity:            { name: 'Tenacity',            desc: 'Keep 10% HP on death (per level, once per run)' },
        organMemory:         { name: 'Organ Memory',        desc: 'Keep +1 organ on death (default 1; Lv1=2, Lv2=3, Lv3=4)' },
        luckyReroll:         { name: 'Lucky Reroll',        desc: 'Reroll an organ choice (once per level)' },
        collectionAddiction: { name: 'Collection Addict',   desc: 'Pickup range +10px (fruit and corpses, per level)' },
        terribleFang:        { name: 'Terrible Fang',       desc: 'Attack +2 (per level); Lv5 starts run with Fang Lv1' }
    },
    evo: {
        herbivore: { name: 'Herbivore', levels: [
            'Can eat fruit, Max HP +30',
            'Neutrals within 100px stop fleeing, HP +40, Fruit XP +2',
            'Neutrals within 150px become fully friendly, HP +50, Fruit XP +3'
        ]},
        carnivore: { name: 'Carnivore', levels: [
            'Can eat corpses (20 XP, 3s), Atk +5',
            'Corpse 35 XP, 2.5s, Atk +5',
            'Corpse 50 XP, 2s, Atk +5'
        ]},
        omnivore:  { name: 'Omnivore', levels: [
            'Fruit XP +2, Corpse XP +5, Speed +0.3',
            'Fruit XP +3, Corpse XP +10, Speed +0.3',
            'Fruit XP +4, Corpse XP +15, Speed +0.4, 10% chance to recover 5 HP when eating'
        ]}
    },
    combos: {
        comboCrabPoison: 'Bleed also inflicts Poison (poison dmg x2)',
        comboShellArmor: 'Reflect damage doubles on block',
        comboBrainEye:   'Psy-wave can roll for critical damage',
        comboSkinRegen:  'Recovery +1 HP, interval -1s additional',
        comboEyeFang:    'Crits also apply Stun'
    },
    elite: ['★Elite', '★★Elite', '★★★Elite'],
    boss: {
        forest: { name: 'Black Bear',           label: '⚠️ Black Bear' },
        ocean:  { name: 'Great White Shark',    label: '🦈 Great White' },
        desert: { name: 'Desert Scorpion King', label: '🦂 Scorpion King' }
    }
};
