// =============================================================
// English language pack (en)
// ✦ To add a new language: copy this file, rename it (e.g. ja.js),
//   translate only the string values, then add an entry to
//   LANG_LIST in lang.js. Never rename keys or remove {tokens}.
// =============================================================

LANG['en'] = {
    ui: {
        startGame:   '▶ Start Game',
        skillTree:   '🌿 Skill Tree',
        guide:       '📖 Guide',
        compendium:  '📖 Compendium',
        leaderboard: '🏆 Leaderboard',
        settings:    '⚙️ Settings',
        lbSubmitTitle:  'Upload your score to the leaderboard!',
        lbNamePlaceholder: 'Enter name (max 20 chars)',
        lbSubmitBtn:    'Submit',
        lbSkipBtn:      'Skip',
        lbSubmitOk:     '✅ Score uploaded!',
        lbSubmitFail:   '❌ Upload failed, check your connection',
        lbAnonymous:    'Anonymous',
        lbTop10Title:  '🏆 Leaderboard TOP 10',
        lbLoading:     'Loading...',
        lbError:       'Failed to load leaderboard',
        lbVictory:     '🏆 Victory',
        lbDefeat:      '💀 Defeat',
        lbVictoryIcon: '🏆',
        lbDefeatIcon:  '💀',
        lbFullTitle:   '🏆 Global Leaderboard',
        lbColRank:     'Rank',
        lbColVersion:  'Version',
        lbColDate:     'Date',
        lbColName:     'Name',
        lbColCharacter: 'Character',
        lbColTime:     'Time',
        lbColScore:    'Score',
        lbColLevel:    'Level',
        lbColResult:   'Result',
        lbPrevPage:    '← Prev',
        lbNextPage:    'Next →',
        lbPageLabel:   'Page {n}',
        // ── Difficulty & Character Selection
        selectTitle:     'Difficulty & Character',
        difficultyLabel: 'Difficulty',
        characterLabel:  'Character',
        diffEasy:   '🌿 Easy',
        diffNormal: '⚔️ Normal',
        diffHard:   '💀 Hard',
        diffHell:   '🔥 Hell',
        charKoel:        '🐦 Koel',
        charArcherfish:  '🐟 Archerfish',
        charSoon:        '❓ Coming Soon',
        btnBack:    '← Back',
        btnStart:   'Start Game →',
        settingsTitle: '⚙️ Settings',
        sectionLanguage: 'Language',
        sectionVolume:   'Audio',
        sectionKeys:     'Key Bindings',
        sectionOther:    'Other',
        sectionDevice:   'Device Mode',
        sectionAccessibility: 'Accessibility',
        autoAttack:      'Auto Attack',
        autoAttackHint:  'Z key to toggle',
        organTooltip:    'Organ Tooltip',
        alwaysCenter:     'Always Center',
        alwaysCenterHint: 'Player is always centered on screen',
        patchNotes:       '📋 Patch Notes',
        patchNotesTitle:  '📋 Version Update Notes',
        patchAdded:       '✅ Added',
        patchFixed:       '🔧 Fixed',
        patchChanged:     '⚙️ Changed',
        patchNoContent:   '(none)',
        deviceAuto:      'Auto Detect',
        deviceMobile:    '📱 Mobile',
        deviceDesktop:   '🖥️ Desktop',
        orientationTip:  'Rotate to landscape for best experience 🔄',
        volMaster:  'Master',
        volMusic:   'Music',
        volSfx:     'SFX',
        on: 'On', off: 'Off',
        keyUp:      'Move Up',
        keyDown:    'Move Down',
        keyLeft:    'Move Left',
        keyRight:   'Move Right',
        keyAttack:  'Attack',
        keyDash:    'Special Skill',
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
        boneMaterialFloat: '+{n} Bone Material',
        venomFloat: '☠ Venom Cloud',
        dashSkill: 'Blink',
        dashCooldownLabel: 'Cooldown',
        mutationExchange: '100 Skill Pts → 10 Mutation Pts',
        mutationExchangeHint: 'Current skill points: {n}',
        // ── Compendium
        compendiumTitle:      '📖 Compendium',
        compendiumTabGuide:   'Guide',
        compendiumTabOrgans:  'Organs',
        compendiumTabEvo:     'Evolution',
        compendiumSacHint:    'Poison Sac auto-upgrades by accumulating Bone Material — cannot be selected or inherited',
        compendiumHiddenOrgans: '✨ Hidden Organs',
        compendiumCombos:     '⚡ Combo Effects (each organ must reach Lv3)',
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
        victoryReward: '+500 XP',
        goSkillTree: 'Go to Skill Tree',
        backHome: '🏠 Back to Home',
        playAgain: '⚔️ Play Again',
        btnStartGame: '▶ Start Game',
        warnNoOrganHome: '⚠️ No organs selected. Press again to confirm and return home.',
        skillTreeTitle: '🌿 Skill Tree',
        skillPoints: 'Skill Points',
        resetSkills: 'Reset Skill Points',
        confirmResetSkills: 'Reset all skill points?',
        maxed: 'Maxed',
        upgradeCostN: 'Upgrade ({n} pt)',
        skillPtTime:  '⏱ Time Bonus +{n} pts',
        skillPtLevel: '⬆️ Level Bonus +{n} pts',
        skillPtElite: '⭐ Elite Bonus +{n} pts',
        skillPtBoss:  '👑 Boss Bonus +{n} pts',
        keepOrgans: 'Choose organs to keep (max {n}, inherited next run)',
        noOrganThisRun: 'No organs gained this run',
        keepHiddenOne: '✨ Keep one hidden organ (optional)',
        inheritOrgansHome: '📦 Choose organs to inherit (max {n})',
        inheritHiddenHome: '✨ Choose one hidden organ to inherit (optional)',
        lastRunOrgansTitle: '📦 Organs from last run',
        noRecord: 'No record yet',
        guideTitle: 'Game Guide',
        guidePage: 'Page {0} / {1}',
        guideClose: 'Close',
        guidePrev: '← Previous',
        guideNext: 'Next →',
        guidePageFmt: '{cur} / {total}',
        // Page 1 Desktop
        guideBasicTitle: 'Basic Controls',
        guideMove: 'Move: WASD / Arrow Keys',
        guideAttack: 'Attack: Space / Left Click',
        guideSettings: 'Settings: Esc / ⚙️ Button',
        guideFruit: 'Eat Fruit: Walk over to collect',
        guideGoal: 'Goal: Defeat the final Boss within 10 minutes',
        guideAutoAttack: '⚔️ Auto Attack: Z key to toggle (requires attack organ)',
        // Page 1 Mobile left
        guideMobileMove: 'Move: Joystick',
        guideMobileMove2: '📱 Drag anywhere on screen to move',
        guideMobileAttack: 'Attack: Tap attack zone',
        guideMobileAttackZone: '⚔️ Bottom-right area is the attack zone',
        guideMobileSettings: 'Settings: ⚙️ Button',
        // Page 1 Mobile right
        guideTouchTitle: 'Touch Controls',
        guideLandscape: 'Landscape Mode',
        guideLandscapeDesc: 'Left 30% Attack Zone / Right 30% Joystick',
        guidePortrait: 'Portrait Mode',
        guidePortraitDesc: 'Top game screen / Bottom left attack right joystick',
        // Page 2 Organ System
        guideOrganTitle: 'Organ System',
        guideOrgan1: 'Gain XP to choose a new organ',
        guideOrgan2: 'Three types: Attack ⚔️, Defense 🛡️, Spirit 🔮',
        guideOrgan3: 'Organs upgrade to Lv.3, each level uses one slot',
        guideOrgan4: 'When slots are full, choose an evolution path',
        guideOrgan5: 'Keep some organs after death',
        guideOrgan6: 'Defeat elite creatures for hidden organs ✨',
        guideOrgan7: 'Some organs increase body size, larger size means larger attack range',
        // Page 3 Evolution System
        guideEvoTitle: 'Evolution System',
        guideEvo1: '🌿 Herbivore: Boosts HP and size, high-level neutrals become fully friendly',
        guideEvo2: '🥩 Carnivore: Eat corpses for more XP, boosts attack and attack speed',
        guideEvo3: '⚖️ Omnivore: Needs Herbivore + Carnivore, boosts speed, devour bones to power up Poison Sac',
        guideEvo4: 'Each path upgrades to Lv.5',
        guideEvo5: 'Evolution resets each run and is not inherited',
        // Page 4 Minimap Guide
        guideMapTitle: 'Minimap Guide',
        guideMapPlayer: 'Your character',
        guideMapNeutral: 'Neutral creature',
        guideMapHostile: 'Hostile creature',
        guideMapEliteH: 'Herbivore elite',
        guideMapEliteC: 'Carnivore elite',
        guideMapBossBear: 'Black Bear Boss',
        guideMapBossShark: 'Great White Shark Boss',
        guideMapBossScorp: 'Desert Scorpion King Boss',
        guideMapTree: 'Tree',
        guideMapFog: 'Unexplored area, walk through to reveal',
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
                    '🌿 Herbivore (max Lv5): more HP & size, neutrals become fully friendly',
                    '🥩 Carnivore (max Lv5): eat corpses for bonus XP, attack & attack speed',
                    '⚖️ Omnivore (max Lv5): needs Herb+Carn, gains speed, devour bones for Poison Sac',
                    '☠ Bone System: corpses → bones → Omnivore devours → Bone Material → Poison Sac levels up',
                    '🔁 Evolution paths reset every run and are not inherited'
                ]
            }
        ]
    },
    organs: {
        crabClaw:      { name: 'Crab Claw', levels: [
            'Atk +5, 25% Bleed (1 dmg/s for 10s)',
            'Atk +2, Bleed +25%, +2 dmg/s',
            'Atk +3, Bleed +50%, +2 dmg/s'
        ]},
        boxingGloves:  { name: 'Boxing Gloves', levels: [
            'Atk +5, Attack Speed +10%',
            'Atk +2, Attack Speed +15%',
            'Atk +3, Attack Speed +15%'
        ]},
        poisonStinger: { name: 'Poison Stinger', levels: [
            'Attacks inflict Poison: 2 dmg/s for 5s',
            '+1 dmg/s, +3s duration',
            '+2 dmg/s, +2s duration'
        ]},
        fang:          { name: 'Fang', levels: [
            'Atk +12, 15% chance to stun for 0.5s',
            'Atk +2, Stun chance +5%',
            'Atk +3, Stun chance +5%, Stun duration +0.5s'
        ]},
        longLegs:      { name: 'Long Legs', levels: [
            'Move Speed +1',
            'Move Speed +1',
            'Move Speed +1'
        ]},
        turtleShell:   { name: 'Turtle Shell', levels: [
            'Damage Taken -10%, Speed -1',
            'Extra DR -10% (total -20%), Speed -1',
            'Extra DR -10% (total -30%), Speed -1'
        ]},
        thickSkin:     { name: 'Thick Skin', levels: [
            'Max HP +20, current HP +20',
            'Max HP +30, current HP +30, Size +20% (radius +2)',
            'Max HP +50, current HP +50, Size +20% (radius +2)'
        ]},
        thornArmor:    { name: 'Thorn Armor', levels: [
            'Reflect 5% of Max HP as damage when hit',
            'Extra 5% of Max HP reflected (total 10%)',
            'Extra 5% of Max HP reflected (total 15%)'
        ]},
        brain:         { name: 'Brain', levels: [
            'Every 5s: 8 dmg in 100px radius, Pickup +10px',
            'Cooldown -1s, range +20px, dmg +4, pickup +15px',
            'Cooldown -1s, range +30px, dmg +8, pickup +15px'
        ]},
        trueEye:       { name: 'True Eye', levels: [
            'Crit chance +10%',
            'Crit chance +5%, Crit damage +0.25',
            'Crit chance +10%, Crit damage +0.25'
        ]},
        sharpSense:    { name: 'Sharp Sense', levels: [
            'Detect fruits within 1000px, show best path (red line)',
            'Add: track nearest corpse (yellow line)',
            'Add: track nearest bone (white line)'
        ]},
        naturalRegen:  { name: 'Natural Regen', levels: [
            'Recover 1 HP every 10s',
            'Interval -2s, +1 HP, +0.5% Max HP healed',
            'Interval -3s, +1 HP, +0.5% Max HP healed'
        ]},
        mouthOrgan:    { name: 'Mouth Organ', levels: [
            'Atk +4',
            'Atk +4',
            'Atk +2, hit slows target -20% speed for 2s'
        ]},
        fishScale:     { name: 'Fish Scale', levels: [
            'Tenacity +5% (CC duration -5%)',
            'Tenacity +10% (total 15%)',
            'Tenacity +15% (total 30%)'
        ]},
        sharkLeaf:     { name: 'Shark Sensory Leaf', levels: [
            'Damage +10% vs targets below 15% HP',
            'Damage +15% vs targets below 30% HP',
            'Damage +20% vs targets below 50% HP'
        ]},
        poisonSac:     { name: 'Poison Sac', levels: [
            'Lv1: Atk +1, Poison +1 dmg/s (5s)',
            'Lv2: Atk +1, Poison +1 dmg/s',
            'Lv3: Atk +2, Poison +2 dmg/s',
            'Lv4: Atk +3, Poison +3 dmg/s',
            'Lv5: Atk +3, Poison +3 dmg/s',
            'Lv6: Atk +4, Poison +4 dmg/s',
            'Lv7: Atk +4, Poison +4 dmg/s',
            'Lv8: Atk +5, Poison +5 dmg/s',
            'Lv9: Atk +5, Poison +5 dmg/s',
            'Lv10: Atk +8, Poison +8 dmg/s'
        ]}
    },
    hidden: {
        strongHeart: { name: 'Mighty Heart', desc: 'Speed +0.6, Atk +5, Max HP +60, Size +20% (radius +2)' },
        strongLegs:  { name: 'Mighty Legs',  desc: 'Speed +3, Size +20% (radius +2)' },
        strongArms:  { name: 'Mighty Arms',  desc: 'Pickup +15px, Size +20% (radius +2)' },
        strongEye:   { name: 'Mighty Eye',   desc: 'Crit chance +10%, Crit damage +0.25, Size +20% (radius +2)' }
    },
    skills: {
        vitality:            { name: 'Vitality',            desc: 'Starting HP +20 (per level)' },
        agility:             { name: 'Agility',             desc: 'Starting Speed +0.2 (per level)' },
        forager:             { name: 'Forager',             desc: 'Fruit XP +3 (per level)' },
        hunter:              { name: "Hunter's Instinct",   desc: 'Kill XP +10 (per level)' },
        tenacity:            { name: 'Tenacity',            desc: 'Keep 10% HP on death (per level, once per run)' },
        organMemory:         { name: 'Organ Memory',        desc: 'Organs kept on death (default 0; Lv1=1, Lv2=2, Lv3=3)' },
        luckyReroll:         { name: 'Lucky Reroll',        desc: 'Reroll an organ choice (once per level)' },
        collectionAddiction: { name: 'Collection Addict',   desc: 'Pickup range +10px (fruit, corpses and bones, per level)' },
        terribleFang:        { name: 'Terrible Fang',       desc: 'Attack +2 (per level); Lv3: start with Fang Lv1; Lv5: start with Fang Lv2' }
    },
    evo: {
        herbivore: { name: 'Herbivore', levels: [
            'Can eat fruit, Max HP +30',
            'HP +10, Fruit XP +1, neutrals stop fleeing on bump',
            'HP +15, Fruit XP +2, neutrals don\'t flee even when attacked',
            'HP +20, Fruit XP +3, Size +10%, neutrals fully friendly',
            'HP +25, Fruit XP +4, Size +20%, neutrals fully friendly'
        ]},
        carnivore: { name: 'Carnivore', levels: [
            'Can eat corpses (5 XP, 3s), Atk +2',
            'Atk +5, Corpse 8 XP, 2.5s',
            'Atk +9, Corpse 12 XP, 2s, Atk Speed +5%',
            'Atk +14, Corpse 15 XP, 1.5s, Atk Speed +10%',
            'Atk +20, Corpse 20 XP, 1s, Atk Speed +15%'
        ]},
        omnivore:  { name: 'Omnivore', levels: [
            'Speed +0.4, gain Poison Sac, devour bones in 1s, +1 Bone Material',
            'Speed +0.5, devour bones in 0.5s, +1 Bone Material',
            'Speed +0.6, instant bone devour, +1 Bone Material',
            'Speed +0.7, instant bone devour, +2 Bone Material',
            'Speed +0.8, instant bone devour, +3 Bone Material'
        ]}
    },
    combos: {
        comboCrabPoison: 'Poison dmg x2 (Stinger at Lv3 + any Poison Sac)',
        comboCrabGloves: 'Bleed dmg x2, attacks apply -50% healing (Crab Claw + Boxing Gloves each at Lv3)',
        comboShellArmor: 'Reflect damage doubled (Turtle Shell + Thorn Armor each at Lv3)',
        comboBrainEye:   'Psy-wave can crit (Brain + True Eye each at Lv3)',
        comboSkinRegen:  'Regen +1 HP, interval -1s more (Thick Skin + Natural Regen each at Lv3)',
        comboEyeFang:    'Crits also stun (True Eye + Fang each at Lv3)'
    },
    elite: ['★Elite', '★★Elite', '★★★Elite'],
    boss: {
        forest: { name: '🌿 Black Bear',           label: '⚠️🌿 Black Bear' },
        ocean:  { name: '🌊 Great White Shark',    label: '🦈🌊 Great White' },
        desert: { name: '🏜️ Desert Scorpion King', label: '🦂🏜️ Scorpion King' }
    }
};
