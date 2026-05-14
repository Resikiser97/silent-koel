// =============================================================
// lang.js — 遊戲多語系字典與工具函式
// =============================================================
// ✦ 翻譯外包說明（給新語言譯者）：
//   1. 複製 zh-TW 區塊，把 key 替換為新語言代碼 (例如 "ja"、"ko")，
//      連同所有 nested 結構整段複製，只翻內容字串值。
//   2. 在 LANG_LIST 加入新語言代碼與顯示名稱。
//   3. 不要新增 / 刪除 / 改名任何 key，否則該欄會 fallback 回 zh-TW。
//   4. 替換時保留所有 {token} 預留欄位（例如 {n}、{lv}、{boss}），
//      程式會用實際數值取代它們。
//   5. 新遊戲內容（器官 / 技能 / 進化 / Boss / Guide 頁面…）上線時，
//      必須在每個語言區塊同步補上對應翻譯，否則該語言會顯示 zh-TW 原文。
//   6. 不要修改本檔最底部的 LANG_LIST / applyLanguage / _langPack / t —
//      那些是程式邏輯，由開發者維護。
// =============================================================

const LANG_LIST = [
    { code: 'zh-TW', label: '繁體中文' },
    { code: 'en',    label: 'English' }
];

const LANG = {
    // =================================================================
    // 繁體中文 (zh-TW) — 預設語言，所有 key 必須在此完整定義
    // =================================================================
    "zh-TW": {
        ui: {
            // ── 首頁
            startGame: '▶ 開始遊戲',
            skillTree: '🌿 技能樹',
            guide:     '📖 遊戲說明',
            settings:  '⚙️ 設定',
            // ── 設定面板
            settingsTitle: '⚙️ 設定',
            sectionLanguage: '語言設定',
            sectionVolume:   '音量設定',
            sectionKeys:     '按鍵設定',
            sectionOther:    '其他設定',
            volMaster:  '總音量',
            volMusic:   '音樂音量',
            volSfx:     '音效音量',
            on: '開', off: '關',
            keyUp:      '移動上',
            keyDown:    '移動下',
            keyLeft:    '移動左',
            keyRight:   '移動右',
            keyAttack:  '攻擊鍵',
            mouseLeft:  '滑鼠左鍵',
            pressNewKey: '請按下新按鍵...',
            restartGame: '重啟遊戲',
            resetDefault: '恢復原廠設定',
            confirmRestart: '確定重啟？本局進度將消失，不給予技能點（除非已擊殺精英怪）',
            confirmResetSettings: '確定要恢復所有音量和按鍵設定為預設值？',
            saveAndBack: '儲存並返回',
            close: '關閉',
            // ── HUD / 狀態列
            timeLabel: '時間',
            dayCycleFormat: '現在是「{phase}」',
            phaseDay: '白天',
            phaseNight: '夜晚',
            biomeForest: '🌲 森林',
            biomeOcean: '🌊 海洋',
            biomeDesert: '🏜️ 沙漠',
            devMode: '🛠️ 開發者模式',
            devFruits: '🍎 果子總數',
            devNeutral: '🟠 中立生物',
            devHostile: '🔴 敵意生物',
            slotLabel: '槽位',
            organLabel: '器官',
            canEvolve: ' ✨可進化',
            inheritedSuffix: '（繼承）',
            // ── 升級 / 進化 / 死亡 / 勝利
            chooseOrgan:    '✦ 選擇器官或升級 ✦',
            chooseEvo:      '✦ 選擇進化路線 ✦',
            comboHintLabel: '⚡ 組合效果：',
            comboLabel:     '⚡ 組合效果',
            hiddenOrganTag: '✨ 隱藏器官',
            hiddenOrganDrop: '✨ 隱藏器官掉落！',
            hiddenOrganPickOne: '選擇1個獲得（隱藏器官不佔普通槽位）',
            hiddenOrganClickOne: '點擊獲得（隱藏器官不佔普通槽位）',
            rerollBtn: '🎲 重新隨機（剩餘 {n} 次）',
            levelUpFloat: '⬆️ 升級！Lv.{lv}',
            xpPopupPrefix: '+',
            xpPopupSuffix: ' XP',
            fullText: '飽食！HP+5',
            tenacityFloat: '頑強意志！',
            noAttackOrgan: '沒有攻擊器官！',
            bleedFloat: '血 -{n}',
            poisonFloat: '毒 -{n}',
            // ── 日夜 / Boss / 精英
            nightCome: '🌙 夜晚來臨',
            morningCome: '☀️ 黎明到來',
            morningEliteGone: '☀️ 黎明到來，精英怪撤退了',
            morningEliteKilled: '☀️ 精英已滅！黎明提前到來！',
            eliteAppeared: '🌟 精英怪出現了！',
            bossAppeared: '⚠️ 強大的{name}出現了！',
            // ── 死亡 / 時間耗盡
            gameOverTitle: '遊戲結束',
            timeUp: '時間耗盡！',
            finalXP: '最終 XP：{xp}',
            restart: '重新開始',
            youDied: '💀 你死了',
            timeoutTitle: '⏰ 時間耗盡',
            // ── 勝利
            victoryTitle: '🏆 勝利！',
            victoryDesc: '{boss}已被消滅！',
            victoryReward: '+500 XP，獲得 1 個技能點',
            goSkillTree: '前往技能樹',
            backHome: '🏠 回到首頁',
            playAgain: '⚔️ 再來一場',
            // ── 技能樹
            skillTreeTitle: '🌿 技能樹',
            skillPoints: '技能點數',
            resetSkills: '重置技能點',
            confirmResetSkills: '確定要重置所有技能點嗎？',
            maxed: '已滿級',
            upgradeCost1: '升級（費1點）',
            keepOrgans: '選擇保留器官（最多 {n} 個，下一局繼承）',
            noOrganThisRun: '本局未獲得任何器官',
            keepHiddenOne: '✨ 選擇保留一個隱藏器官（可不選）',
            inheritOrgansHome: '📦 選擇繼承上局器官（最多 {n} 個）',
            inheritHiddenHome: '✨ 選擇繼承一個隱藏器官（可不選）',
            lastRunOrgansTitle: '📦 上局遺留器官',
            noRecord: '尚無記錄',
            // ── Guide
            guideTitle: '📖 遊戲說明',
            guidePrev: '◀',
            guideNext: '▶',
            guidePageFmt: '{cur} / {total}',
            guidePages: [
                {
                    title: '基本操作',
                    lines: [
                        '🎮 移動：WASD 或方向鍵',
                        '⚔️ 攻擊：空白鍵或滑鼠左鍵',
                        '⚙️ 設定：Esc',
                        '🍎 吃果子：走過去自動吃',
                        '🎯 目標：在 10 分鐘內擊敗最終 Boss'
                    ]
                },
                {
                    title: '器官系統',
                    lines: [
                        '⭐ 每累積一定 XP 可以選擇一個器官',
                        '⚔️ 攻擊類　🛡️ 防禦類　🔮 靈力類',
                        '📈 器官可以升級到 3 級，每級佔用一個槽位',
                        '✨ 槽位滿後可以選擇進化路線',
                        '💀 死亡後可以保留部分器官到下一局',
                        '🌟 擊敗精英怪有機會獲得隱藏器官 ✨'
                    ]
                },
                {
                    title: '進化系統',
                    lines: [
                        '🌿 草食性：增強 HP，中立生物不會逃跑',
                        '🥩 肉食性：可以吃屍體獲得更多 XP，增強攻擊',
                        '⚖️ 雜食性：需同時擁有草食和肉食才能解鎖，增加移動速度',
                        '📈 每條路線最高 3 級',
                        '🔁 進化路線每局重置，不會繼承'
                    ]
                }
            ]
        },
        organs: {
            crabClaw:      { name: '蟹鉗', levels: [
                '攻擊+8，15%流血（每秒1傷，3秒）',
                '攻擊+2，流血+5%，每秒傷+1，持續+1秒',
                '攻擊+3，流血+10%，每秒傷+1，持續+1秒'
            ]},
            boxingGloves:  { name: '搏擊拳套', levels: [
                '攻擊+5，攻速+30%',
                '攻擊+2，攻速+5%',
                '攻擊+3，攻速+5%'
            ]},
            poisonStinger: { name: '毒刺', levels: [
                '攻擊+1，攻擊時附加中毒每秒2傷持續5秒',
                '每秒傷+1，持續+1秒',
                '每秒傷+2，持續+1秒'
            ]},
            fang:          { name: '獠牙', levels: [
                '攻擊+12，15%暈眩敵人1秒',
                '攻擊+2，暈眩+2%',
                '攻擊+3，暈眩+3%'
            ]},
            longLegs:      { name: '大長腿', levels: [
                '移動速度+0.5',
                '移動速度+0.5',
                '移動速度+0.5'
            ]},
            turtleShell:   { name: '龜殼', levels: [
                '受傷-30%，速度-0.2',
                '受傷額外-3%，速度回復+0.1',
                '受傷額外-7%，速度回復+0.1'
            ]},
            thickSkin:     { name: '厚皮', levels: [
                'HP上限+50，當前HP+50',
                'HP上限+50，體型+20%（半徑+2，攻擊範圍同比例增加）',
                'HP上限+50，體型再+20%'
            ]},
            thornArmor:    { name: '刺甲', levels: [
                '被攻擊時反傷10%',
                '反傷+5%',
                '反傷+5%，額外反彈玩家攻擊力5%的傷害'
            ]},
            brain:         { name: '大腦', levels: [
                '每5秒100px範圍8傷，拾取範圍+10px',
                '觸發-1秒，範圍+20px，傷害+4，拾取+15px',
                '觸發-1秒，範圍+30px，傷害+8，拾取+15px'
            ]},
            trueEye:       { name: '真視之眼', levels: [
                '暴擊率+10%，暴擊傷害x1.5',
                '暴擊率+5%，暴擊傷害+0.25',
                '暴擊率+10%，暴擊傷害+0.25'
            ]},
            sharpSense:    { name: '靈敏知覺', levels: [
                '敵意生物偵測範圍-30px',
                '偵測範圍再-20px',
                '偵測範圍再-20px'
            ]},
            naturalRegen:  { name: '超自然回復', levels: [
                '每10秒回復1HP',
                '間隔-2秒，回復+1HP',
                '間隔-3秒，回復+1HP'
            ]}
        },
        hidden: {
            strongHeart: { name: '強大的心臟', desc: '移速+0.2，攻擊+5，HP上限+100，體型+20%' },
            strongLegs:  { name: '強大的大腿', desc: '移速+1，體型+20%' },
            strongArms:  { name: '強大的手臂', desc: '收集範圍+15px，體型+20%（攻擊範圍同比例增加）' }
        },
        skills: {
            vitality:            { name: '強壯體魄', desc: '起始 HP +20（每級）' },
            agility:             { name: '敏捷身手', desc: '起始速度 +0.2（每級）' },
            forager:             { name: '採集專家', desc: '果子 XP +3（每級）' },
            hunter:              { name: '獵人本能', desc: '擊殺 XP +10（每級）' },
            tenacity:            { name: '頑強意志', desc: '死亡時 HP 保留 10%（每級，每局一次）' },
            organMemory:         { name: '記憶器官', desc: '死亡保留器官數 +1（預設1個；Lv1=2個，Lv2=3個，Lv3=4個）' },
            luckyReroll:         { name: '幸運重選', desc: '器官選擇時可重新隨機（每級1次）' },
            collectionAddiction: { name: '收集成癮', desc: '收集範圍+10px（果子和屍體，每級）' },
            terribleFang:        { name: '恐怖之牙', desc: '攻擊+2（每級）；Lv5開局獲得獠牙Lv1' }
        },
        evo: {
            herbivore: { name: '草食性', levels: [
                '可吃果子，HP上限+30',
                '100px內中立生物不逃跑，HP+40，果子XP+2',
                '150px內中立生物完全友善，HP+50，果子XP+3'
            ]},
            carnivore: { name: '肉食性', levels: [
                '可吃屍體（20XP，3秒），攻擊+5',
                '屍體35XP，2.5秒，攻擊+5',
                '屍體50XP，2秒，攻擊+5'
            ]},
            omnivore:  { name: '雜食性', levels: [
                '果子XP+2，屍體XP+5，速度+0.3',
                '果子XP+3，屍體XP+10，速度+0.3',
                '果子XP+4，屍體XP+15，速度+0.4，10%機率吃東西回血5'
            ]}
        },
        combos: {
            comboCrabPoison: '流血同時附加劇毒（毒傷x2）',
            comboShellArmor: '格擋時反傷翻倍',
            comboBrainEye:   '念力波有機率觸發暴擊傷害',
            comboSkinRegen:  '回復量+1HP，回復間隔再-1秒',
            comboEyeFang:    '暴擊時附加暈眩效果'
        },
        elite: ['★精英', '★★精英', '★★★精英'],
        boss: {
            forest: { name: '黑熊',     label: '⚠️黑熊' },
            ocean:  { name: '大白鯊',   label: '🦈大白鯊' },
            desert: { name: '沙漠蠍王', label: '🦂蠍王' }
        }
    },

    // =================================================================
    // English (en)
    // =================================================================
    "en": {
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
    }
};

// =============================================================
// 程式邏輯（譯者請勿修改下方內容）
// _langPack / applyLanguage / t：把 LANG 對應語言寫回 ORGANS/SKILLS/…，
// 並提供 t(key, params?) 給 UI 文字查找。
// =============================================================
function _langPack(lang) {
    return LANG[lang] || LANG['zh-TW'];
}

function applyLanguage(lang) {
    const pack = _langPack(lang);
    // ── 一般器官
    if (pack.organs) Object.keys(ORGANS).forEach(id => {
        const tr = pack.organs[id]; if (!tr) return;
        if (tr.name) ORGANS[id].name = tr.name;
        if (tr.levels) tr.levels.forEach((d, i) => { if (ORGANS[id].levels[i]) ORGANS[id].levels[i].desc = d; });
    });
    // ── 隱藏器官
    if (pack.hidden) Object.keys(HIDDEN_ORGANS).forEach(id => {
        const tr = pack.hidden[id]; if (!tr) return;
        if (tr.name) HIDDEN_ORGANS[id].name = tr.name;
        if (tr.desc) HIDDEN_ORGANS[id].desc = tr.desc;
    });
    // ── 技能
    if (pack.skills) Object.keys(SKILLS).forEach(id => {
        const tr = pack.skills[id]; if (!tr) return;
        if (tr.name) SKILLS[id].name = tr.name;
        if (tr.desc) SKILLS[id].desc = tr.desc;
    });
    // ── 進化路線
    if (pack.evo) Object.keys(EVOLUTION_PATHS).forEach(id => {
        const tr = pack.evo[id]; if (!tr) return;
        if (tr.name) EVOLUTION_PATHS[id].name = tr.name;
        if (tr.levels) tr.levels.forEach((d, i) => { if (EVOLUTION_PATHS[id].levels[i]) EVOLUTION_PATHS[id].levels[i].desc = d; });
    });
    // ── 組合：寫回 COMBOS[i].desc
    if (pack.combos) COMBOS.forEach(c => { if (pack.combos[c.key]) c.desc = pack.combos[c.key]; });
    // ── 精英怪標籤
    if (pack.elite) ELITE_CONFIG.nights.forEach((n, i) => { if (pack.elite[i]) n.label = pack.elite[i]; });
    // ── Boss
    if (pack.boss) Object.keys(BOSS_CONFIG).forEach(id => {
        const tr = pack.boss[id]; if (!tr) return;
        if (tr.name) BOSS_CONFIG[id].name = tr.name;
        if (tr.label) BOSS_CONFIG[id].label = tr.label;
    });
}

// t(key, params?) — 取得當前語言的 ui 字串，支援 {token} 替換
function t(key, params) {
    const lang = (typeof gameState !== 'undefined' && gameState.language) ? gameState.language : 'zh-TW';
    const pack = _langPack(lang);
    let s = (pack.ui && pack.ui[key] != null) ? pack.ui[key] : (LANG['zh-TW'].ui[key] || key);
    if (params && typeof s === 'string') {
        Object.keys(params).forEach(k => { s = s.split('{' + k + '}').join(params[k]); });
    }
    return s;
}
