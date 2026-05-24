// =============================================================
// 繁體中文語言包 (zh-TW) — 預設語言，所有 key 必須在此完整定義
// ✦ 翻譯外包說明：複製整個 lang/ 資料夾中的任一 .js 檔，
//   將檔名改為新語言代碼（例如 ja.js），並在 lang.js 的 LANG_LIST 中新增入口。
//   只需翻譯字串值，不要更動任何 key 名稱或 {token} 佔位符。
// =============================================================

LANG['zh-TW'] = {
    ui: {
        // ── 首頁
        startGame:   '▶ 開始遊戲',
        skillTree:   '🌿 技能樹',
        guide:       '📖 遊戲說明',
        compendium:  '📖 圖鑑',
        leaderboard: '🏆 排行榜',
        settings:    '⚙️ 設定',
        lbSubmitTitle:  '上傳你的分數到排行榜！',
        lbNamePlaceholder: '輸入名字（最多20字）',
        lbSubmitBtn:    '提交',
        lbSkipBtn:      '跳過',
        lbSubmitOk:     '✅ 分數已上傳！',
        lbSubmitFail:   '❌ 上傳失敗，請檢查網路連線',
        lbAnonymous:    '匿名',
        lbTop10Title:  '🏆 排行榜 TOP 10',
        lbLoading:     '讀取中...',
        lbError:       '無法讀取排行榜',
        lbVictory:     '🏆 勝利',
        lbDefeat:      '💀 失敗',
        lbVictoryIcon: '🏆',
        lbDefeatIcon:  '💀',
        lbFullTitle:   '🏆 全球排行榜',
        lbColRank:     '排名',
        lbColVersion:  '版本',
        lbColDate:     '日期',
        lbColName:     '名字',
        lbColTime:     '遊玩時間',
        lbColScore:    '分數',
        lbColLevel:    '等級',
        lbColResult:   '結果',
        lbPrevPage:    '← 上一頁',
        lbNextPage:    '下一頁 →',
        lbPageLabel:   '第 {n} 頁',
        // ── 難度與角色選擇
        selectTitle:     '難度與角色選擇',
        difficultyLabel: '選擇難度',
        characterLabel:  '選擇角色',
        diffEasy:   '🌿 簡單',
        diffNormal: '⚔️ 普通',
        diffHard:   '💀 困難',
        diffHell:   '🔥 地獄',
        charKoel:        '🐦 噪鵑（The Koel）',
        charArcherfish:  '🐟 阿奇爾（Archerfish）',
        charSoon:        '❓ 即將推出',
        btnBack:    '← 返回',
        btnStart:   '開始遊戲 →',
        // ── 設定面板
        settingsTitle: '⚙️ 設定',
        sectionLanguage: '語言設定',
        sectionVolume:   '音量設定',
        sectionKeys:     '按鍵設定',
        sectionOther:    '其他設定',
        sectionDevice:   '裝置模式',
        sectionAccessibility: '輔助功能',
        autoAttack:      '自動攻擊',
        autoAttackHint:  'Z 鍵切換',
        organTooltip:    '器官提示',
        patchNotes:       '📋 更新日誌',
        patchNotesTitle:  '📋 版本更新公告',
        patchAdded:       '✅ 新增',
        patchFixed:       '🔧 修復',
        patchChanged:     '⚙️ 調整',
        patchNoContent:   '（無）',
        deviceAuto:      '自動偵測',
        deviceMobile:    '📱 手機模式',
        deviceDesktop:   '🖥️ 電腦模式',
        orientationTip:  '建議橫向以獲得最佳體驗 🔄',
        volMaster:  '總音量',
        volMusic:   '音樂音量',
        volSfx:     '音效音量',
        on: '開', off: '關',
        keyUp:      '移動上',
        keyDown:    '移動下',
        keyLeft:    '移動左',
        keyRight:   '移動右',
        keyAttack:  '攻擊鍵',
        keyDash:    '特殊技能鍵',
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
        boneMaterialFloat: '+{n} 白骨素',
        venomFloat: '☠ 毒霧',
        dashSkill: '閃現',
        dashCooldownLabel: '冷卻中',
        mutationExchange: '100 技能點 → 10 變異點',
        mutationExchangeHint: '目前技能點：{n}',
        // ── 圖鑑
        compendiumTitle:      '📖 圖鑑',
        compendiumTabGuide:   '遊戲說明',
        compendiumTabOrgans:  '器官圖鑑',
        compendiumTabEvo:     '進化系統',
        compendiumSacHint:    '毒囊透過累積白骨素自動升級，不可選擇也不可繼承',
        compendiumHiddenOrgans: '✨ 隱藏器官',
        compendiumCombos:     '⚡ 組合效果（需各達 Lv3）',
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
        victoryReward: '+500 XP',
        goSkillTree: '前往技能樹',
        backHome: '🏠 回到首頁',
        playAgain: '⚔️ 再來一場',
        btnStartGame: '▶ 開始遊戲',
        warnNoOrganHome: '⚠️ 你還沒選保留器官，確定要回首頁嗎？再按一次確認。',
        // ── 技能樹
        skillTreeTitle: '🌿 技能樹',
        skillPoints: '技能點數',
        resetSkills: '重置技能點',
        confirmResetSkills: '確定要重置所有技能點嗎？',
        maxed: '已滿級',
        upgradeCostN: '升級（費{n}點）',
        skillPtTime:  '⏱ 時間獎勵 +{n}點',
        skillPtLevel: '⬆️ 等級獎勵 +{n}點',
        skillPtElite: '⭐ 精英獎勵 +{n}點',
        skillPtBoss:  '👑 Boss獎勵 +{n}點',
        keepOrgans: '選擇保留器官（最多 {n} 個，下一局繼承）',
        noOrganThisRun: '本局未獲得任何器官',
        keepHiddenOne: '✨ 選擇保留一個隱藏器官（可不選）',
        inheritOrgansHome: '📦 選擇繼承上局器官（最多 {n} 個）',
        inheritHiddenHome: '✨ 選擇繼承一個隱藏器官（可不選）',
        lastRunOrgansTitle: '📦 上局遺留器官',
        noRecord: '尚無記錄',
        // ── Guide
        guideTitle: '遊戲說明',
        guidePage: '第 {0} / {1} 頁',
        guideClose: '關閉',
        guidePrev: '← 上一頁',
        guideNext: '下一頁 →',
        guidePageFmt: '{cur} / {total}',
        // 第1頁 桌機
        guideBasicTitle: '基本操作',
        guideMove: '移動：WASD / 方向鍵',
        guideAttack: '攻擊：空白鍵 / 滑鼠左鍵',
        guideSettings: '設定：Esc / ⚙️ 按鈕',
        guideFruit: '吃果子：走過去自動吃',
        guideGoal: '目標：10分鐘內擊敗最終Boss',
        guideAutoAttack: '⚔️ 自動攻擊：Z 鍵切換（需有攻擊器官）',
        // 第1頁 手機左半
        guideMobileMove: '移動：搖桿',
        guideMobileMove2: '📱 全螢幕任意位置拖動即可移動',
        guideMobileAttack: '攻擊：點擊攻擊區',
        guideMobileAttackZone: '⚔️ 右下角區域為攻擊區，點擊攻擊',
        guideMobileSettings: '設定：⚙️ 按鈕',
        // 第1頁 手機右半
        guideTouchTitle: '觸控操作',
        guideLandscape: '橫向模式',
        guideLandscapeDesc: '左30% 攻擊區／右30% 搖桿區',
        guidePortrait: '直向模式',
        guidePortraitDesc: '上方遊戲畫面／下方左攻擊右搖桿',
        // 第2頁 器官系統
        guideOrganTitle: '器官系統',
        guideOrgan1: '每累積一定 XP 可以選擇一個器官',
        guideOrgan2: '器官分三類：攻擊⚔️、防禦🛡️、靈力🔮',
        guideOrgan3: '器官可以升級到3級，每級佔用一個槽位',
        guideOrgan4: '槽位滿後可以選擇進化路線',
        guideOrgan5: '死亡後可以保留部分器官到下一局',
        guideOrgan6: '擊敗精英怪有機會獲得隱藏器官✨',
        guideOrgan7: '部分器官會增加體型，體型越大攻擊範圍越大',
        // 第3頁 進化系統
        guideEvoTitle: '進化系統',
        guideEvo1: '🌿 草食性：增強HP與體型，高等級中立生物完全友善',
        guideEvo2: '🥩 肉食性：可以吃屍體獲得更多XP，增強攻擊與攻速',
        guideEvo3: '⚖️ 雜食性：需同時擁有草食和肉食才能解鎖，增加速度，可吞噬白骨強化毒囊',
        guideEvo4: '每條路線最高5級',
        guideEvo5: '進化路線每局重置，不會繼承',
        // 第4頁 小地圖說明
        guideMapTitle: '小地圖說明',
        guideMapPlayer: '你的角色',
        guideMapNeutral: '中立生物',
        guideMapHostile: '敵意生物',
        guideMapEliteH: '草食性精英怪',
        guideMapEliteC: '肉食性精英怪',
        guideMapBossBear: '黑熊Boss',
        guideMapBossShark: '大白鯊Boss',
        guideMapBossScorp: '沙漠蠍王Boss',
        guideMapTree: '樹木',
        guideMapFog: '未探索區域，走過才能揭開',
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
                    '🌿 草食性（最高5級）：增強 HP 與體型，中立生物友善',
                    '🥩 肉食性（最高5級）：吃屍體獲得 XP，增強攻擊與攻速',
                    '⚖️ 雜食性（最高5級）：需草食+肉食解鎖，速度+，吞白骨強化毒囊',
                    '☠ 白骨系統：肉食Lv3+ 觸發，屍體→白骨→雜食吞噬→累積白骨素→毒囊升級',
                    '🔁 進化路線每局重置，不會繼承'
                ]
            }
        ]
    },
    organs: {
        crabClaw:      { name: '蟹鉗', levels: [
            '攻擊+5，25%流血（每秒1傷，10秒）',
            '攻擊+2，流血+25%，每秒傷+2',
            '攻擊+3，流血+50%，每秒傷+2'
        ]},
        boxingGloves:  { name: '搏擊拳套', levels: [
            '攻擊+5，攻速+10%',
            '攻擊+2，攻速+15%',
            '攻擊+3，攻速+15%'
        ]},
        poisonStinger: { name: '毒刺', levels: [
            '攻擊時附加中毒每秒2傷持續5秒',
            '每秒傷+1，持續+3秒',
            '每秒傷+2，持續+2秒'
        ]},
        fang:          { name: '獠牙', levels: [
            '攻擊+12，15%暈眩敵人0.5秒',
            '攻擊+2，暈眩+5%',
            '攻擊+3，暈眩+5%，暈眩時間+0.5秒'
        ]},
        longLegs:      { name: '大長腿', levels: [
            '移動速度+1',
            '移動速度+1',
            '移動速度+1'
        ]},
        turtleShell:   { name: '龜殼', levels: [
            '受傷-10%，速度-1',
            '受傷額外-10%（累計-20%），速度-1',
            '受傷額外-10%（累計-30%），速度-1'
        ]},
        thickSkin:     { name: '厚皮', levels: [
            'HP上限+20，當前HP+20',
            'HP上限+30，當前HP+30，體型+20%（半徑+2）',
            'HP上限+50，當前HP+50，體型+20%（半徑+2）'
        ]},
        thornArmor:    { name: '刺甲', levels: [
            '被攻擊時反彈最大HP 5%的傷害',
            '額外反彈最大HP 5%（累計10%）',
            '額外反彈最大HP 5%（累計15%）'
        ]},
        brain:         { name: '大腦', levels: [
            '每5秒100px範圍8傷，拾取範圍+10px',
            '觸發-1秒，範圍+20px，傷害+4，拾取+15px',
            '觸發-1秒，範圍+30px，傷害+8，拾取+15px'
        ]},
        trueEye:       { name: '真視之眼', levels: [
            '暴擊率+10%',
            '暴擊率+5%，暴擊傷害+0.25',
            '暴擊率+10%，暴擊傷害+0.25'
        ]},
        sharpSense:    { name: '靈敏知覺', levels: [
            '偵測1000px範圍內果子，顯示最佳路徑（紅線）',
            '新增追蹤最近屍體（黃線）',
            '新增追蹤最近白骨（白線）'
        ]},
        naturalRegen:  { name: '超自然回復', levels: [
            '每10秒回復1HP',
            '間隔-2秒，回復+1HP，額外回復最大HP 0.5%',
            '間隔-3秒，回復+1HP，額外回復最大HP 0.5%'
        ]},
        mouthOrgan:    { name: '嘴器', levels: [
            '攻擊+4',
            '攻擊+4',
            '攻擊+2，命中使目標移動速度-20%持續2秒'
        ]},
        fishScale:     { name: '魚鱗', levels: [
            '韌性+5%（減少控制時間5%）',
            '韌性+10%（累計15%）',
            '韌性+15%（累計30%）'
        ]},
        sharkLeaf:     { name: '鯊魚嗅葉', levels: [
            '對血量15%以下的敵人傷害+10%',
            '對血量30%以下的敵人傷害+15%',
            '對血量50%以下的敵人傷害+20%'
        ]},
        poisonSac:     { name: '毒囊', levels: [
            'Lv1：攻擊+1，毒傷+1（5秒）',
            'Lv2：攻擊+1，毒傷+1',
            'Lv3：攻擊+2，毒傷+2',
            'Lv4：攻擊+3，毒傷+3',
            'Lv5：攻擊+3，毒傷+3',
            'Lv6：攻擊+4，毒傷+4',
            'Lv7：攻擊+4，毒傷+4',
            'Lv8：攻擊+5，毒傷+5',
            'Lv9：攻擊+5，毒傷+5',
            'Lv10：攻擊+8，毒傷+8'
        ]}
    },
    hidden: {
        strongHeart: { name: '強大的心臟', desc: '移速+0.6，攻擊+5，HP上限+60，體型+20%（半徑+2）' },
        strongLegs:  { name: '強大的大腿', desc: '移速+3，體型+20%（半徑+2）' },
        strongArms:  { name: '強大的手臂', desc: '收集範圍+15px，體型+20%（半徑+2）' },
        strongEye:   { name: '強大的眼睛', desc: '暴擊率+10%，暴擊傷害+0.25，體型+20%（半徑+2）' }
    },
    skills: {
        vitality:            { name: '強壯體魄', desc: '起始 HP +20（每級）' },
        agility:             { name: '敏捷身手', desc: '起始速度 +0.2（每級）' },
        forager:             { name: '採集專家', desc: '果子 XP +3（每級）' },
        hunter:              { name: '獵人本能', desc: '擊殺 XP +10（每級）' },
        tenacity:            { name: '頑強意志', desc: '死亡時 HP 保留 10%（每級，每局一次）' },
        organMemory:         { name: '記憶器官', desc: '死亡保留器官數（預設0個；Lv1=1，Lv2=2，Lv3=3）' },
        luckyReroll:         { name: '幸運重選', desc: '器官選擇時可重新隨機（每級1次）' },
        collectionAddiction: { name: '收集成癮', desc: '收集範圍+10px（果子、屍體和白骨，每級）' },
        terribleFang:        { name: '恐怖之牙', desc: '攻擊+2（每級）；Lv3=開局獠牙Lv1；Lv5=開局獠牙Lv2' }
    },
    evo: {
        herbivore: { name: '草食性', levels: [
            '可吃果子，HP上限+30',
            'HP+10，果子XP+1，撞到不逃跑',
            'HP+15，果子XP+2，被攻擊也不逃跑',
            'HP+20，果子XP+3，體型+10%，中立生物完全友善',
            'HP+25，果子XP+4，體型+20%，中立生物完全友善'
        ]},
        carnivore: { name: '肉食性', levels: [
            '可吃屍體（5XP，3秒），攻擊+2',
            '攻擊+5，屍體8XP，2.5秒',
            '攻擊+9，屍體12XP，2秒，攻速+5%',
            '攻擊+14，屍體15XP，1.5秒，攻速+10%',
            '攻擊+20，屍體20XP，1秒，攻速+15%'
        ]},
        omnivore:  { name: '雜食性', levels: [
            '速度+0.4，獲得毒囊，白骨吞噬1秒，白骨素+1',
            '速度+0.5，白骨吞噬0.5秒，白骨素+1',
            '速度+0.6，立刻吞噬白骨，白骨素+1',
            '速度+0.7，立刻吞噬白骨，白骨素+2',
            '速度+0.8，立刻吞噬白骨，白骨素+3'
        ]}
    },
    combos: {
        comboCrabPoison: '毒傷翻倍（毒刺Lv3且擁有毒囊）',
        comboCrabGloves: '流血傷害翻倍，命中敵人施加回復量-50%（蟹鉗+搏擊拳套各達Lv3）',
        comboShellArmor: '反彈傷害翻倍（龜殼+刺甲各達Lv3）',
        comboBrainEye:   '念力波可觸發暴擊傷害（大腦+真視之眼各達Lv3）',
        comboSkinRegen:  '回復量+1HP，間隔再-1秒（厚皮+超自然回復各達Lv3）',
        comboEyeFang:    '暴擊時附加暈眩效果（真視之眼+獠牙各達Lv3）'
    },
    elite: ['★精英', '★★精英', '★★★精英'],
    boss: {
        forest: { name: '🌿 黑熊',     label: '⚠️🌿黑熊' },
        ocean:  { name: '🌊 大白鯊',   label: '🦈🌊大白鯊' },
        desert: { name: '🏜️ 沙漠蠍王', label: '🦂🏜️蠍王' }
    }
};
