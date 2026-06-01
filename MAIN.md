## v0.0.67.1

# The Silent Koel — 模組架構說明

## 載入順序（index.html `<body>` 末端）

```
config/gameConfig.js      GAME_INFO, GAME_TIMING, AUDIO_FILES
config/organs.js          ORGANS, HIDDEN_ORGANS, COMBOS
config/creatures.js       CREATURE_CONFIG, ELITE_CONFIG, BOSS_CONFIG
config/evolution.js       EVOLUTION_PATHS, SKILLS
config/patchnotes.js      PATCH_NOTES
config/compendium_data.js COMPENDIUM_DATA（四大圖鑑分類，需在 map/normalmap.js 之後載入）
config/characters.js      CHARACTERS（角色定義常數，v0.56.0）

lang.js                   LANG_LIST, LANG={}, _langPack(), applyLanguage(), t()
lang/zh-TW.js             LANG['zh-TW']
lang/en.js                LANG['en']

systems/gameState.js      DEFAULT_SETTINGS, gameState, canvas, ctx, MAP 常數
systems/map.js            MAP_WIDTH/HEIGHT/VIEW_W/VIEW_H, TILE_SIZE, NOISE_SCALE, MAP_RULES
                          BIOME_COLOR
                          getBiome, getBgColor
                          labelBiomeRegions, mergeSmallRegions, ensureRequiredBiomes
                          generateTerrain, buildTerrainCanvas, drawTerrain
                          generateTrees
systems/utils.js          drawArrow, drawHealthBar, drawNameTag, drawGlowEffect
                          applyTenacity（韌性縮短CC時間，v0.56.0）
                          getGameFont（canvas 字型輔助，依 fontLarge/fontBold 設定動態生成，v0.0.66.1）
                          spawnLootCircle
systems/audio.js          AudioManager, initAudio
systems/camera.js         wrappedDistance, wrappedDelta, worldToScreen, updateCamera
                          _updateCameraZoom（視野縮放，重構自 _updateMobileCameraZoom，v0.58.0）
                          updateCamera：alwaysCenter 設定為 true 時 edgeThreshold=0.5，角色永遠居中（v0.57.5）
systems/input.js          handleKeyDown, handleKeyUp（含設定介面按鍵 handler refs）
systems/spawning.js       spawnFruitFromTree, spawnFruit, moveCreature, spawnTreasure
                          _randomPointInBiome, _makeHerbCreature, _makeCarnCreature
                          spawnBiomeCreatures（開局設 spawnProtectUntil +3s，中心保護區不生肉食怪，v0.0.66.2）
                          spawnCreatureAtEdgeBiome
                          updateCreatureSpawning（spawnProtectUntil 期間跳過肉食補充，v0.0.66.2）
systems/player.js         updatePlayerMovement, checkFruitCollision, updateTreeFruitProduction
                          showXPPopup, checkTreasureCollision, updatePassiveOrgans
                          checkXPMilestone, addXP, checkLevelUp
                          findBestPerceptionPath
                          playerDash（閃現技能：瞬移+無敵+冷卻，v0.53.0）
                          _collectFruit（果子吸收 XP 共用函式，v0.54.0；v0.57.6 加入草食性判斷：ev.herbivore >= 1 才套正常 XP 計算，否則固定 1 XP）
                          updateProjectiles, _checkProjectileHit（子彈系統，v0.56.0；v0.57.5 補入 tutorialStump）
                          _archerAttack, _getArcherShootDir, _findArcherAutoTarget（阿奇爾攻擊，v0.56.0）
systems/tutorial.js       showTutorial（三步驟教學主入口），spawnTutorialStump，handleTutorialStumpKill
                          showTutorialCombatHint，showTutorialCombatComplete
                          （IIFE 模組，掛至 window；v0.43.0 新增，v0.45.0 加入戰鬥教學）
systems/combat.js         showFloatingText, applyDamageToPlayer, handleKill, playerAttack
                          handleGiantKill, handleKillerKill, addMutationPoints（stub）
                          updateStatusEffects, updateCorpseEating, drawCorpseEatingBars
                          updateBoneEating, _addBoneMaterial, _checkPoisonSacUpgrade
                          _spawnBone, drawBones
                          （playerAttack() 將 tutorialStump 加入攻擊目標；v0.45.0）
                          （playerAttack() 含嘴器減速/鯊魚嗅葉傷害加成/Debuff StartTime；v0.56.0）
systems/organs.js         getOrganLevel, getOrganCumulative, getComboHint, checkComboEffects
                          getOrganSlotsUsed, applyHiddenOrganEffects, applyOrganEffects
                          checkOrganUpgrade, showOrganSelection, drawOrganUI
                          handleEliteKill, showHiddenOrganSelection
                          _drawCompendiumBtn（繪製 📖 按鈕，設定 _compendiumBtnRegion）
                          （showOrganSelection() 偵測 tutorialOrganPhase，鎖定第一張攻擊器官；v0.45.0）
systems/mutation.js       initMutationData, saveMutationData, addMutationPoints
                          getMutationUpgradeCost, upgradeMutation
                          applyMutationEffects, applyAllMutationBonuses
                          checkMutationCompensation, showMutationPanel
systems/evolution.js      checkEvolutionUnlock, applyEvolutionLevelEffect, applyEvolutionEffects
                          loadSavedOrgans（獨立函式，v0.57.5；initializeGame() 在 applySkillBonuses() 前呼叫確保器官不丟失；buildSkillTreeOverlay(fromHome) 只讀 skillPoints 不再重複套用）
                          applySkillBonuses, saveLastRunOrgans, showSkillTree
                          buildSkillTreeOverlay, upgradeSkill
                          buildSkillTreeOverlay 模式說明（v0.57.7）：
                            fromHome / forceStart → 讀 localStorage skillPoints/playerSkills + 讀 lastRunOrgans 顯示繼承器官
                            postGame → 讀記憶體 gameState.player.organs（遊戲剛結束，資料仍完整）
                          _grantPoisonSac（雜食性 Lv1 時自動授予毒囊器官）
systems/creatures.js      _PACK_NAMES / _usedPackNames / resetPackNames()（隊伍名稱池，v0.0.66.2）
                          drawCreatureShape（物種形狀主分派，含旋轉/翻轉邏輯）
                          updateNeutralCreatures（三態移動：biome 生物三態 / 非 biome 舊邏輯）
                          drawNeutralCreatures
                          updateHostileCreatures（三態移動 + hostileEatMeat 門控）
                          drawCorpses, drawHostileCreatures
                          _effSpeed（嘴器減速有效速度計算，v0.56.0）
systems/elite.js          spawnEliteCreature, updateEliteCreature, drawEliteCreature
                          （箭頭繪製改用 systems/utils.js 的 drawArrow）
systems/boss.js           spawnBoss, updateBoss, showVictory
                          drawBoss, drawBossArrow
                          drawBossShape, _drawBear, _drawShark, _drawScorp, BOSS_COLORS
                          （箭頭繪製改用 systems/utils.js 的 drawArrow）
                          _drawBossDebuffIcons（血條 Debuff 圖示，v0.56.0）
systems/daynight.js       getDayNightPhaseIndex, applyNightTransition, applyDayTransition
                          updateDayNightCycle, showGameOver
systems/leaderboard.js    _lbDifficulty, _top10Difficulty, _diffKey
                          showLeaderboard, showScoreSubmitPopup
                          showFunLeaderboard（趣味排行榜，v0.47.0；👑 最高等級分類 v0.51.0）
systems/chat.js           _sha256, loadChatSettings, saveChatSettings
                          _calcProgressScore, _collectLocalData, _applyRemoteData
                          chatLogin（查帳/自動註冊/SHA-256/進度比較同步）
                          chatSaveProgress, chatSyncData, chatLogout
                          initChat, disconnectChat, sendChatMessage
                          buildChatUI, _renderChatSettingsPanel, renderChat
                          showChat, hideChat
                          _saveChatPosition, _loadChatPosition, _makeDraggable
                          _handlePinCommand, _handleUnpinCommand（GM 置頂/取消置頂）
                          _lvColor（等級數字 → 顏色 CSS 字串，v0.0.66.0）
                          _parseColorTags（[c=color]文字[/c] 彩色字解析，v0.0.66.0）
                          isVipPlayer（先驅者判斷 TODO 索引，v0.0.66.0，目前回傳 false）
systems/mobile.js         detectMobile, getOrientation, applyDeviceMode
                          _attachJoystickListeners, _renderMobileOverlay, _getAttackBtnPos
                          _dashZone（閃現按鈕矩形範圍判斷，v0.53.0）
systems/hud.js            drawGame, updateUI, drawTopBarUI
                          drawMinimap（含所有 _minimap 變數 + _minimapAlpha/FadeTimer/StopTimer 透明度計時器，v0.0.66.1）, drawTreasures
                          drawProjectiles（子彈繪製）, updateMinimapFog（小地圖霧效更新）
                          _drawArcherfish（夜晚三角光圈 + F技紅色三角框，v0.57.4）
systems/ui.js             showTooltip, hideTooltip, showMapSelect
                          loadSettings, switchLanguage, saveSettings, showSettings, hideSettings
                          updateTimer, toggleDevMode, dev* 函式
                          showGuide, hideGuide, showStartScreen
                          showGuideStory, _getGuideStoryPages
                          showPatchNotes, checkPatchNotesPopup
                          buildEvoLevelDesc（全域，動態生成進化圖鑑描述）
                          showCompendium → _renderGuide / _renderOrgans / _renderEvo（三分頁均為桌機雙欄/手機 Tab 版面，讀 COMPENDIUM_DATA / ORGANS / EVOLUTION_PATHS / SKILLS）

main.js                   pausePlayTimer, resumePlayTimer, isGamePaused
                          updateGameLogic, gameLoop, initializeGame, window.onload
```

## systems/utils.js

所有模組共用的工具函式，在 `gameState.js` 之後、`audio.js` 之前載入。

### 函式列表

- `drawArrow(playerScreenX, playerScreenY, targetWorldX, targetWorldY, color, playerRadius)`
  → 在玩家身上繪製指向目標的箭頭
  → 距離：`playerRadius + 20px`
  → 有閃爍效果（每 0.5 秒透明度 0.6↔1.0）
  → 精英怪和 Boss 同時在螢幕外時只顯示 Boss 箭頭（優先權邏輯在 `drawEliteArrow` 內判斷）
  → 被 `elite.js` 和 `boss.js` 共用

- `drawHealthBar(screenX, screenY, hp, maxHp, width, fillColor, bgColor, height)`
  → 繪製生物血條，`bgColor` 為底色，當前血量用 `fillColor` 顯示

- `drawNameTag(screenX, screenY, name, color, font)`
  → 繪製生物名字標籤，`screenY` 為文字基線位置

- `drawGlowEffect(screenX, screenY, radius, fillColor, glowColor, glowBlur)`
  → 繪製帶光暈的填色圓形，精英怪和 Boss 專用

- `spawnLootCircle(cx, cy, items)`
  → 以圓形平均角度散落掉落物（詳見下方區塊）

---

## Boss 動畫系統（v0.49.0）

### 架構

| Boss | biome | 形狀函式 |
|------|-------|---------|
| 黑熊 | forest | `_drawBear(ctx, r, t, boss)` |
| 大白鯊 | ocean | `_drawShark(ctx, r, t, boss)` |
| 蠍王 | desert | `_drawScorp(ctx, r, t, boss)` |

- 主分派：`drawBossShape(ctx, boss, screenX, screenY)` 由 `drawBoss()` 呼叫
- 顏色常數：`BOSS_COLORS`（`boss.js` 頂部，`bear.limbs = '#7a3d0c'` 比 body 明顯淡，避免同色消失）
- 完整技術細節：`docs/ANIMATION_GUIDE.md`

### 黑熊（forest）— 三態臂部系統

- `boss.lastAttackLeg`（`'left'`/`'right'`）：攻擊瞬間記錄「哪腳在前」→ 決定揮哪手
- `boss.lastAttackCrit`（`boolean`）：是否暴擊（25% 機率，`updateBoss()` 攻擊時設定）
- 三態：**idle**（雙臂垂下）→ **chasing**（高舉蓄力）→ **attack**（揮下，bell-curve `Math.sin(sinceAtk / 450 * Math.PI)`）
- 殘影：相同臂在 `atkPhase - 0.22` / `atkPhase - 0.10` 兩層，alpha 10% / 22%
- 爪痕：普攻 3 條紅線（`#dd2200`），暴擊 6 條橙線（`#ff8800`），畫在 body 表面（不依賴臂位置）

### 大白鯊（ocean）— 面向翻轉

- `ctx.scale(-1, 1)` 條件：`player.x < boss.x`（玩家在左則鯊魚朝左）
- 無需 `_moveAngle`；所有子部件跟著翻轉

### 蠍王（desert）— 三足步態

- 6 條腿分兩組（Group A：左後/右中/左前；Group B：右後/左中/右前），兩組相差半週期（π）
- 組內第 2/3 腿各延遲 `step = Math.PI * 0.2`（10% 週期偏移）
- 端點 y 偏移動畫：`swing = Math.sin(t / legPeriod + legPhase[i])`
  - `swing > 0`（腳離地）：線條較細（`r × 0.09`）
  - `swing ≤ 0`（腳落地）：線條較粗（`r × 0.14`）
- 鉗子夾擊：`atkPhase = Math.sin(sinceAtk / 700 * Math.PI)`，最大 ±0.65 rad（≈ 37°），兩鉗同時向內夾

### spawnBoss() 新增欄位

| 欄位 | 初值 | 說明 |
|------|------|------|
| `lastAttackCrit` | `false` | 黑熊暴擊旗標 |
| `lastAttackLeg` | `'left'` | 黑熊最後攻擊腳（決定揮哪手） |
| `_chargeArrow` | `null` | 大白鯊衝刺箭頭 `{ fromX, fromY, toX, toY }`（warning 瞬間鎖定，cooldown 清除） |

### Boss 技能視覺特效（v0.50.0 / v0.52.0 重設計）

**大白鯊衝刺箭頭**（`_drawSharkChargeArrow(boss)`）
- `boss._chargeArrow = { angle, dist, fromX, fromY }`：warning 瞬間鎖定方向和距離
- `dist = boss.speed × 4 × 0.8 × 60`（實際衝刺距離，世界 px）
- warning=黃色閃爍，charging=紅色；寬度＝`boss.radius × 2`
- 在 `drawBoss()` 的 `drawBossShape` **前**呼叫

**蠍王毒霧（v0.52.0 重設計：定點投擲）**（`_drawVenomEffects(boss)`）
- 每 5 秒觸發，無距離限制
- `boss._venomWarning = { x, y, startTime, duration:600 }`：警告光圈（黃色虛線閃爍圓）
- `gameState.venomPuddles[]`：定點毒霧陣列，每個 `{ x, y, radius:150, startTime, duration:4000, dmgPerSec, lastTick }`
- 玩家跑出 `radius` 停止受傷；`initializeGame()` 初始化為 `[]`
- 在 `drawBossShape` **後**呼叫

**蠍王沙暴**（`_drawSandStormOverlay()`）
- `boss._sandStormVisual { startTime, duration:6000 }`
- 玩家 `getBiome(p.x, p.y) !== 'desert'` 時：`_inSandstorm = false` + 不顯示遮罩
- `_drawSandStormOverlay()` 在 `hud.js` `drawBossArrow()` 後、UI 前呼叫

**黑熊暴擊文字**
- `isCrit === true` 命中時：`showFloatingText(p.x, p.y - 40, 'X熊爪！', '#ff8800', 18)`（顯示在玩家位置）

---

## 生物視覺系統（v0.48.0）

### 旋轉模式

| speciesId | 旋轉模式 |
|---|---|
| moose  | 完整旋轉（跟 `_moveAngle`） |
| beetle | 完整旋轉（跟 `_moveAngle`） |
| croc   | 完整旋轉（跟 `_moveAngle`） |
| camel  | 只左右翻轉（`ctx.scale(-1,1)`，cos 正朝右，cos 負朝左） |
| lynx   | 只左右翻轉（同駱駝） |
| hyena  | 完全不旋轉，永遠朝上 |

- 主分派函式 `drawCreatureShape(ctx, creature, sx, sy)`：以 `ctx.translate(sx,sy)` 定位，各物種依旋轉模式套用 `ctx.rotate(angle)` 或 `ctx.scale(-1,1)`，再呼叫對應私有形狀函式
- 所有形狀以 `(0,0)` 為中心，`angle=0` 時頭朝右（+x），尾朝左（-x）

### 顏色常數 `CREATURE_COLORS`

| 物種 | 顏色碼 | 說明 |
|------|--------|------|
| moose | `#8B4513` | 深棕 |
| beetle | `#1ABC9C` | 青綠 |
| camel | `#E8C87A` | 淺沙白 |
| lynx | `#A0826D` | 灰褐 |
| croc | `#6B8E23` | 橄欖綠 |
| hyena | `#8B6914` | 深咖啡 |
| giantized | `#FF8C00` | 巨人化光暈橙 |
| alpha | `#FFD700` | Alpha 光暈金 |
| killerBase | `#CC2200` | 殺手化光暈深紅 |

### 特殊狀態光暈 `_drawCreatureGlow`

- 在 `ctx.restore()` 之後以世界座標 `(sx, sy)` 繪製，不跟旋轉
- Alpha → 金色光圈（radius+6）
- 巨人化 → 橙色光圈（radius+4）
- 殺手化 → `killerLevel` 越高越深紅（radius+2）

### 繪圖規格文件

- 詳見 `docs/creature_shapes.md`（完整程式碼 + 設計備注）
- 詳見 `docs/ANIMATION_GUIDE.md`（Boss / 生物動畫實作指南：踏步、攻擊、特效、Z 軸順序、未來開發者說明）

---

## 生態生物系統（v0.36.0）

### 生物命名
| 生態區 | 草系             | 肉系           |
|--------|-----------------|----------------|
| 森林   | 駝鹿 (moose)    | 猞猁 (lynx)    |
| 水潭   | 巨型甲虫 (beetle)| 鱷魚 (croc)    |
| 沙漠   | 駱駝 (camel)    | 鬣狗 (hyena)   |

### 生成規則
- 草系和肉系只在對應生態區生成（`_randomPointInBiome` 拒絕採樣）
- 每個物種獨立計算：上限（草系 20 / 肉系 15）、計時器、少於 3 隻間隔 ×0.3（加速 70%）
- 每隻生物帶 `biome` 和 `speciesId` 屬性

### 生物基礎屬性
- **草系**：radius 8、HP 30、speed 2.4、canFight 50%（true 時 damage=3，false 時 damage=0）、diet herbivore
- **肉系**：radius 10、HP 50、speed 3.6、damage 5、diet carnivore

### 三態移動（biome 生物專屬）
- **wandering**：每幀角度小幅偏移（±0.12 rad，模擬 Perlin Noise 平滑）
- **resting**：速度 0~30%，持續 1.5s；玩家（非超友善）或敵意生物靠近 150px 內中斷
- **attacking / fleeing**：玩家互動觸發（與舊邏輯相同）
- 草系每 5~15s 有 20% 機率切換為 resting，60% 機率探索最近果子（800px 內），20% 繼續漫遊（v0.42.0 調整）
- 肉系每 5~15s 有 30% 機率切換為 resting，30% 機率探索最近草系生物（500px 內）

### 簡單地圖限制
- `hostileEatMeat: false`（EASY_MAP 無此 feature）→ 肉系不會吃屍體成長

---

## 普通地圖（NORMAL_MAP）（v0.36.0 / aggroRange 調整 v0.39.0）
- 地形：中心森林保護區半徑 400px（簡單為 600px）
- 生物強度倍率全部 ×1.5
- `aggroRangeOverride: 400`（全局追擊範圍，v0.39.0 由 2000 調整至 400）
- `removeHostileCap: true`（移除速度/傷害上限）
- 精英怪：第1夜 ×5/+0.3/×1.5、第2夜 ×10/+0.7/×2.1、第3夜 ×20/+1.5/×2.9
- Boss：黑熊 HP1500/速9.0/傷30/r33、大白鯊 HP1800/速11.7/傷36/r40、蠍王 HP1650/速10.8/傷40/r37（v0.47.0 速度翻倍）
- 專屬 features：`giantization`、`killer`、`eliteRegen`、`bossRegen`、`hostileEatMeat`

---

## 圓形散落全局函式 spawnLootCircle（v0.35.0）

- **位置**：`systems/utils.js`
- 所有掉落物統一可經過此函式散落，圓形平均角度，距中點 10~25px 隨機
- 單個物品時隨機角度；多個物品時等角均分
- **支援 type**：
  - `'corpse'`：`data = { multiplier }`，radius 按 multiplier 縮放（1倍=8px，>1倍=8×1.5px）
  - `'bone'`：直接呼叫 `_spawnBone(x, y, 8)`
  - `'mutation'`：待 Phase 5 擴充

---

## 毒傷減免系統（v0.35.0）

- **精英怪**：20% 減免
- **Boss 通用**：30% 減免
- **沙漠蠍王**：50% 減免（通用 30% + 專屬 20%）
- 減免在 `updateStatusEffects()` 的毒傷 tick 扣血時計算
- 浮動數字顯示減免後實際扣血值

---

## 肉系吃屍體系統（v0.38.0，僅普通地圖）

### 機制
- 肉系生物（diet='carnivore'）在漫遊/休息/巡邏狀態時，偵測 60px 內屍體進入 `state: 'eating'`
- 每 0.5 秒一 tick（`eatTickTimer` 累計 FIXED_DELTA），6 ticks（3秒）完成一具屍體
- 吃屍體期間 aggroRange×1.5（`eatBaseAggroRange` 記錄進入時的值）；有玩家或中立生物進入臨時 aggroRange → 立刻中斷（進度重置），回到 `patrolling`
- 吃完一具：`_carnivoreEatCorpse(creature, corpse)`，移除屍體，回復 5% maxHP

### 成長（不累乘，基礎值計算）
- 每吃1具：HP/速度/攻擊力/體積各 +10% 基礎值（`corpseEaten` 計數）
- `baseRadius` 在 `_makeCarnCreature` 生成時記錄（與 `baseHp`、`baseSpeed`、`baseDamage` 一起）

---

## 殺手化系統（v0.38.0，僅普通地圖）

### 觸發
- `corpseEaten >= 5` 且 `features.killer === true` 時觸發 `_triggerKiller(creature)`
- `isKiller = true`，`killerCorpseEaten = 0`（殺手化後獨立計數）

### 殺手化數值（基礎值計算，不累乘）
- aggroRange 翻倍
- 攻擊力：`baseDamage * (1 + 0.5 + 0.1 * corpseEaten)`（+50% + 之前10%累計）
- 速度：`baseSpeed * (1 + 0.3 + 0.1 * corpseEaten)`（+30% + 之前10%累計）
- 每 5 秒回復 1% maxHP（`killerRegenTimer` 計時）

### 殺手化後繼續吃屍體
- 每多吃 1 具：damage/speed/maxHp/radius 各再 +10% 基礎值（`killerCorpseEaten` 計數）
- 兩個計數疊加（`corpseEaten + killerCorpseEaten`）

### killerLevel 計數器（v0.46.0）
- 殺手化觸發時：`killerLevel = 0`
- 殺手化後每吃一具屍體：`killerLevel++`
- `_getCreatureDisplayName` 顯示「[物種名] 殺手Lv[N]」（N ≥ 1 時顯示）

### 擊殺獎勵（`handleKillerKill`，`systems/combat.js`）（v0.46.0 更新）
- XP：`100 + killerLevel × 5 + 獵人本能 × 10`
- `spawnLootCircle`：2 份 1 倍屍體（原為 3 份）
- 100% 掉落 1 個變異點；`killerCorpseEaten = N` → N% 機率額外掉 1~N 個
- 殺手本身屍體正常生成

### 死亡路由
- `handleKill(c, isHostile)` 開頭檢查 `c.isKiller`，若是則路由至 `handleKillerKill(c)`

---

## 生態特性系統（v0.46.0，僅普通地圖）

每個生態區肉食性物種各有專屬加成，在生態區內強化、離開生態區3秒後加成消失（鱷魚為立即失去）。

### 猞猁（lynx）— 森林生態區
| 狀態 | 暴擊機率 | 暴擊倍率 | 玩家減速 | 減速持續 | 移動速度 |
|------|----------|----------|----------|----------|----------|
| 在森林 | 50% | ×2 baseDmg | -30% | 3 秒 | ×1.2 |
| 離森林 ≥3s | 25% | ×1.5 baseDmg | -15% | 1.5 秒 | ×1.0 |

- 暴擊觸發：`_applyLynxBiomeBonus` 計算 `_critChance`；命中玩家時隨機判定，命中後設定 `p._lynxSlowUntil`、`p._lynxSlowAmt`
- 玩家被減速期間移動速度乘以 `(1 - lynxSlowAmt)`（`updatePlayerMovement()` 判斷）

### 鱷魚（croc）— 水潭生態區
| 狀態 | 攻擊加成 | 移動速度 | 死亡翻滾機率 |
|------|----------|----------|-------------|
| 在水潭 | ×1.2 | ×1.3 | 20% |
| 離水潭 | ×1.0 | ×1.0 | 0% |

- 死亡翻滾觸發：對玩家施加 1 秒暈眩（`p._stunUntil = now + 1000`），期間 `updatePlayerMovement()` 直接 return
- `_applyCrocBiomeBonus` 同時設定 `_biomeAtkMult`、`_biomeSpeedMult`、`_deathRollChance`

### 鬣狗（hyena）— 沙漠生態區
- 生成時隨機分配 `packGroup`（1~3），同組鬣狗為 `packMates`
- `_updateHyenaPack`：每 2 秒掃描 600px 內同 biome 同 packGroup 存活成員，更新 `packMates` 陣列
- 攻擊加成：每多一隻存活 packMate → 攻擊 +20%，速度 +5%
- `_alertHyenaPack`：鬣狗鎖定目標瞬間，通知 600px 內所有 packMates 切換為 chasing 同一目標

| 狀態 | 基礎攻擊 | 基礎速度 |
|------|----------|----------|
| 在沙漠 | ×1.0 × packBonus | ×1.1 × packBonus |
| 離沙漠 ≥3s | ×0.5 × packBonus | ×0.5 × packBonus |

### 肉食者逃離巨人（`_shouldFleeFromGiant`）
- **殺手化生物**：`_shouldFleeFromGiant` 直接返回 `false`，永遠不迴避巨人
- 目標為 **Alpha**（非殺手）：一律逃跑
- 目標為普通巨人（非殺手）：巨人 HP > 肉食者 HP × 3 → 逃跑
- 逃跑狀態 `fleeing_giant`：往離最近巨人反方向跑 3 秒，之後切換 `_seekingPrey = true`、`_seekNonGiant = true`（只尋找非巨人化草食性）

### 殺手戰術邏輯（v0.51.0，`updateHostileCreatures`）
- 殺手化生物遭遇巨人/Alpha 時進入獨立戰術判斷
- **撤退條件**：自身 HP < 70% 且 巨人 HP > 70%（雙向不利）
  - 若 aggroRange 內有落單非巨人化草食性 → 轉移攻擊目標
  - 否則進入 `fleeing_giant` 暫時撤退
- **正常攻擊**：不滿足撤退條件時（殺手狀態良好）→ 繼續攻擊巨人

### 生態區回歸（biome home-return）
- 每幀偵測 `_isInHomeBiome(creature)`；不在生態區時：`_leftBiomeTime` 開始計時
- 每 2 秒更新一個回歸目標點（`_findNearestBiomePoint` 隨機採樣 30 點）
- 回歸時以 1.3 倍速度移動；回到生態區後清除 `_leftBiomeTime`、`_returnTarget`
- `_leftBiomeTime` 同時作為猞猁/鬣狗生態區加成的失效計時器

---

## 精英/Boss回血（v0.38.0，僅普通地圖）

### 精英怪回血（`features.eliteRegen`）
- `spawnEliteCreature` 記錄 `elite.tierIndex`（0/1/2）
- 第1夜：每 5 秒 +1% maxHP；第2夜：+2%；第3夜：+3%

### Boss回血（`features.bossRegen`）
- 每 3 秒 +2% maxHP（v0.47.0 強化；原為每 10 秒 +10%）

---

## 精英怪死亡掉落（v0.38.0，兩種難度均適用）
- `handleEliteKill` 呼叫 `spawnLootCircle`：1 個 1 倍屍體 + 4 具白骨

---

## 巨人化系統（v0.37.0，僅普通地圖）

### 觸發
- 草系生物 `_seekingFruit` 吃滿5顆果子且 `features.giantization === true`
- 移除舊版激進化（`diet=aggressive`）邏輯，改由巨人化取代

### 巨人化數值（在原本數值基礎上修改）
- 攻擊力 +20，血量 ×10，體積 ×1.5，aggroRange 400（v0.46.0 由 150 調整）
- guardianRange 1000：偵測到 guardianRange 內的組員被敵意生物鎖定時，優先以該敵意生物為攻擊目標（v0.46.0）
- 每秒回復 1% maxHP（`giantRegenTimer` 計時）
- HP ≤ 30% 時：中斷追擊，逃往最近果子方向；每吃1顆果子回復 +10% maxHP（`_updateGiantFlee`）
- 不再吃果子（低血量逃跑除外）

### 組隊（同族同生態限定）
- 巨人化後自動成為隊長（`packLeader = true`）
- 每3秒嘗試招募 800px 內同族草食性，20% 成功率
- 隊伍上限動態計算（v0.46.0）：`base 5 + 隊伍內已巨人化成員數`，上限 8 隻（含隊長）
- 超出 800px 自動掉隊，隊員距離 >600px 時巨人化暫停移動等待
- 隊員超過 200px 時跟隨隊長

### 行為
- 優先攻擊：guardianRange 內威脅組員的敵意生物（最優先）→ aggroRange 內的敵意生物 / 玩家（草食性Lv4+除外）
- 無目標時：每3~5秒選最近果子作為移動目標，帶領隊伍前進

### 擊殺獎勵（`handleGiantKill`，`systems/combat.js`）
- XP：60（+獵人本能加成）
- `spawnLootCircle`：1個2倍屍體 + 1具白骨
- 100% 掉落1個變異點；額外10%機率掉 1~3個

---

## Alpha系統（v0.37.0，僅普通地圖）

### 觸發
- 某巨人化隊長的 `packMembers` 中出現第2隻巨人化時，隊長升格 Alpha
- `gameState.alphaCreature`：全圖只有1隻 Alpha 的引用
- 已有 Alpha 時不再觸發新的

### Alpha數值（巨人化基礎上再計算）
- 攻擊力 ×2，血量 ×3，體積 ×1.5，aggroRange 600（v0.46.0 由 300 調整）
- guardianRange 1500（v0.46.0）
- 跟隨範圍 `packFollowRange: 1000`
- HP 分享回血（v0.46.0）：自身 HP ≥ 80% 時每秒分享 1% maxHP 給 HP 最低的受傷組員；自身 HP < 80% 時每秒自回 2% maxHP（不分享）

### 誕生公告
- `showAlphaAnnouncement(name)`：全屏顯示3秒，2.5秒後淡出
- 文字：「⚠️ Alpha [物種名] 誕生了！」

### 擊殺獎勵
- XP：200（+獵人本能加成）
- `spawnLootCircle`：2個2倍屍體 + 3具白骨
- 100% 掉落1個變異點；額外20%機率掉 1~6個

### Alpha 四條死亡路徑（v0.51.0 確認）
1. **玩家擊殺** → `handleGiantKill(c)` → `if (c.isAlpha && gameState.alphaCreature === c) gameState.alphaCreature = null`
2. **毒傷/流血 tick 死亡** → `updateStatusEffects()` 正確路由至 `handleGiantKill(c)`
3. **`updateNeutralCreatures()` 巨人被敵意生物打死** → `updateHostileCreatures` 中已有完整清理
4. **`updateHostileCreatures()` 肉食者打死中立巨人** → `creature.targetType === 'neutral'` 分支已有 `alphaCreature = null`

---

## 上方血條UI（v0.37.0）

- **函式**：`drawTopBarUI()`，在 `drawGame()` 最末尾呼叫
- **顯示條件**：玩家2000px內存在精英/Boss/巨人化/Alpha
- **追蹤邏輯**：`gameState.topBarTarget` 在 `playerAttack()` 命中特殊目標時設定，毒傷tick不更新
- **淡出**：目標死亡或超出2000px後0.5秒淡出，完成後清空 `topBarTarget`
- **Y 座標**：動態偵測 `#top-left` DOM 元素高度並換算 Canvas 邏輯座標，避免手機版與玩家血條重疊
- **強制清除**：`showVictory()` 呼叫時立即設定 `topBarTarget = null`、`topBarFadeTimer = 0`，確保勝利畫面不殘留血條
- **血條顏色**：精英紫色 `#AA22CC`、Boss深紅 `#CC2200`、巨人化橙色 `#FF8800`、Alpha金色 `#FFD700`
- **gameState 新增欄位**：`alphaCreature`、`topBarTarget`、`topBarFadeTimer`

---

### 繪製順序規範（所有生物統一）

由上到下：名字 → 血條 → 本體（含光暈）
名字和血條間距 4px，血條和本體上緣間距 4px

---

## map/ 資料夾

難度地圖配置資料，各檔案定義一個全域常數（如 `EASY_MAP`），在 `config/evolution.js` 之後、`lang.js` 之前載入。

| 檔案 | 說明 |
|------|------|
| `map.md` | 地圖設計文件，記錄地形規格與新增難度步驟 |
| `easymap.js` | 簡單難度（`EASY_MAP`）：地形參數、生物倍率、精英怪配置、Boss 預留結構 |

`generateTerrain()` 讀取 `gameState.currentMap.terrain` 參數（forestCenterRadius / forestThreshold / oceanThreshold / minBiomeTiles / requiredBiomes），`currentMap` 由 `showMapSelect()` 在開始遊戲時寫入。

地形生成流程：4D Tileable Noise → 保護區強制森林 → `mergeSmallRegions`（同化小於 `minBiomeTiles` 的孤島）→ `ensureRequiredBiomes`（最多 10 次重試，超過則 minBiomeTiles 減半）→ `buildTerrainCanvas`。

全域預設值 `MAP_RULES.MIN_BIOME_TILES = 250`；各地圖可在 `terrain.minBiomeTiles` 覆蓋。

---

## 手機觸控系統（v0.23.0）

### 裝置偵測與縮放

- `detectMobile()` — `ontouchstart in window` 或 `innerWidth <= 768` 視為手機
- `getOrientation()` — `innerHeight > innerWidth` 為豎向，否則橫向
- `applyDeviceMode()` — 同步 `gameState.forceMode/isMobile/orientation`，呼叫 `_applyMobileScale()` + `_updateJoystickCanvas()` + `_updateOrientationBar()`
- `_applyMobileScale()` — 用 `CSS transform: scale()` 縮放 `#game-container`，**不改變內部遊戲座標**
  - 縮放比例由 `MOBILE_GAME_SCALE`（預設 0.6）控制，定義在 `_applyMobileScale()` 上方
  - 橫向：`logicW = round(1600 × MOBILE_GAME_SCALE)`，`logicH = round(900 × MOBILE_GAME_SCALE)`，`scale = vw / logicW`
  - 直向：`logicW = round(900 × MOBILE_GAME_SCALE)`，`logicH = round(1600 × MOBILE_GAME_SCALE)`，`scale = vw / logicW`
  - 調整手機畫面大小只需修改 `MOBILE_GAME_SCALE` 這一個變數，其餘系統（攝影機、生物生成、UI）自動跟著 `VIEW_W/VIEW_H` 更新

### 設定介面「裝置模式」區塊

`showSettings()` 新增三顆切換按鈕：自動偵測 / 📱 手機模式 / 🖥️ 電腦模式。選擇即時套用並存入 `localStorage`（key：`gameSettings.deviceMode`）。

### 方向提示條

豎向手機時在 `#game-container` 頂部插入黃色半透明提示條，有 ✕ 關閉鈕。橫向旋轉後自動隱藏並重置 dismissed 狀態。

### 虛擬搖桿

- **搖桿畫布**：`#joystick-canvas`（`position:fixed`，全螢幕，`pointer-events:none`，純繪圖）
- **事件掛載**：`touchstart/touchmove/touchend` 掛在 `document`，`_joyPaused()` 確保暫停狀態不啟動
- **區域**：橫向 = 右半螢幕；豎向 = 右半 + 螢幕下 40%
- **輸出**：`gameState.mobileInput = { dx, dy }`（範圍 −1~1，位移比例決定速度）
- `updatePlayerMovement()` 讀取 `mobileInput` 並疊加在鍵盤輸入上，電腦版恆為 0

### 攻擊區域

- **橫向**：左半螢幕整區為攻擊區，顯示 ⚔️ 提示（opacity 0.2），tap → `playerAttack()`
- **豎向**：左半下方 40% 中央一個半徑 40px 圓形按鈕，顯示 ⚔️，tap → `playerAttack()`
- 攻擊冷卻沿用 `playerAttack()` 內建邏輯，不另外實作
- 攻擊區與搖桿區不重疊，支援多指同時操作（一手搖桿 + 一手攻擊）

### 關鍵 CSS 注意

- `canvas { background-color }` 已改為 `#gameCanvas { background-color: #549954 }`，避免 `#joystick-canvas` 繼承綠色背景蓋住所有 overlay

---

## 閃現技能系統（v0.53.0）

- **觸發**：桌機 `F` 鍵（`input.js handleKeyDown`）；手機版點擊 `_dashZone()` 矩形區域（攻擊區正上方）
- **函式**：`playerDash()`、`_collectFruit(p, fruit)`（`systems/player.js`）
- **效果**：朝 `lastMoveDir` 方向瞬移 `speed × 50`（最遠 500px），夾在地圖邊界內
- **無敵**：`dashInvincible = true`，持續 500ms（`dashInvincibleEnd = Date.now() + 500`），`applyDamageToPlayer` 開頭返回跳過所有外部傷害
- **冷卻**：`dashCooldown = 15000`（ms），每幀扣 `FIXED_DELTA`（≈16.67ms）
- **方向優先序**：手機搖桿 `mobileInput` > `player.lastMoveDir`（移動時持續更新正規化方向，初始值 `{dx:0, dy:-1}` 朝上）
- **特效**：觸發後在 `gameState.dashEffect` 記錄起終點，`drawGame` 步驟 9f 繪製 150ms 三段特效（金色煙霧/白色光球/流光線）
- **直線果子吸收**：閃現路徑 A→B 直線寬度 = `radius + pickupRange`，路徑上果子全部吸收（複用 `_collectFruit`）
- **按鍵可自訂**：`DEFAULT_SETTINGS.keys.dash = 'f'`；設定介面「特殊技能鍵」欄，`input.js` 讀 `settings.keys.dash`

### player 新增欄位

| 欄位 | 初值 | 說明 |
|------|------|------|
| `dashCooldown` | `0` | 閃現剩餘冷卻毫秒（每幀由 `updatePlayerMovement` 遞減） |
| `dashInvincible` | `false` | 無敵旗標（`applyDamageToPlayer` 開頭判斷） |
| `dashInvincibleEnd` | `0` | 無敵結束時間戳（ms，由 `updatePlayerMovement` 檢查清除） |
| `lastMoveDir` | `{dx:0, dy:-1}` | 最後移動方向（正規化，每幀移動時更新；閃現方向依據） |
| `dashEffect` | `null` | 閃現特效狀態（`{ ax,ay,bx,by,startTime,duration:150 }`，v0.54.0）|

### 桌機版指示器（`hud.js drawGame` 步驟 12b）

- 位置：VIEW_W 右側 50%、VIEW_H 50%~75%（與手機直向閃現區對應）
- 正常：`💨 F`，globalAlpha 0.15，字體 28px
- 冷卻：`💨 F` 暗（0.08）+ 灰色進度條 + 倒數秒數（20px，白色 0.7）

### 手機版按鈕（`mobile.js _renderMobileOverlay`）

- **直向**：右側 50% 寬，底部 50%~75% 高（攻擊區正上方）
- **橫向**：右側 25% 寬，整個上半部（底部 0%~50% 高）
- 正常：`💨` globalAlpha 0.15；冷卻：暗圖示 + 進度條 + 倒數秒數

---

## 新增 gameState 欄位（v0.31.0）

| 欄位 | 位置 | 類型 | 說明 |
|------|------|------|------|
| `player.boneMaterial` | `gameState.player` | `number` | 累積白骨素，達門檻自動升級毒囊 |
| `player.perceptionRange` | `gameState.player` | `number` | 靈敏知覺偵測半徑（px） |
| `player.naturalRegenHpMaxPercent` | `gameState.player` | `number` | 超自然回復每次額外回復的最大HP百分比 |
| `gameState.bones` | `gameState` | `Array` | 白骨物件陣列，`{x, y, radius, spawnTime, eatTimer}` |
| `gameState.brainShockwaves` | `gameState` | `Array` | 大腦衝擊波視覺效果陣列，`{x, y, range, startTime}` |

### 毒囊（poisonSac）設計說明

- `noSelection: true` — 不出現在器官選擇池
- `noInherit: true` — 死後不可繼承
- `thresholds: [5, 10, 20, 40, 60, 100, 120, 140, 160, 200]` — 10 個等級對應的白骨素門檻
- Lv0 為初始無效果狀態（`applyOrganEffects` 遇到 Lv0 直接 return）
- 雜食性 Lv1 時由 `_grantPoisonSac()` 自動推入 player.organs

### 白骨系統流程

1. 屍體 60 秒後或被吃掉 → `_spawnBone(x, y, radius)` 推入 `gameState.bones[]`
2. 白骨在地圖存在 180 秒後自動消失
3. 雜食性玩家靠近白骨 → `updateBoneEating()` 計時（`boneEatTime` 毫秒，Lv3+ 即時）
4. 吞噬完成 → `_addBoneMaterial(boneMaterialAdd)` 累加白骨素
5. `_checkPoisonSacUpgrade(p)` 對照 `thresholds[]` 自動升級毒囊並套用 delta 效果

---

## 技能點獲得方式（v0.32.0 / v0.34.0）

| 來源 | 時機 | 數量 | 位置 |
|------|------|------|------|
| 精英怪擊殺 | 遊戲中（每夜） | 夜晚1=+1、夜晚2=+1、夜晚3=+2（v0.47.0） | `systems/organs.js` `handleEliteKill` |
| Boss擊殺 | 勝利結算前 | +3（v0.47.0，原為+5） | `systems/boss.js` `showVictory` |
| 時間獎勵 | 死亡/勝利結算 | `Math.floor((600 - timeRemaining) / 180)` | `showSkillTree` / `showVictory` |
| 等級獎勵 | 死亡/勝利結算 | `Math.floor(player.level / 6)` | `showSkillTree` / `showVictory` |

### 技能點追蹤（v0.34.0）
- `gameState.sessionSkillPoints = { elite: 0, boss: 0 }` 在每局開始時清零（`initializeGame()` 的狀態重設區塊）
- `handleEliteKill` 累加 `sessionSkillPoints.elite += eliteSkillPts`（公式：`[1,1,2][nightIndex] || 1`，v0.47.0）
- `showVictory` 設定 `sessionSkillPoints.boss = 3`（v0.47.0）
- 結算畫面（`showDeathSettlement` / `doShowVictory`）讀取此值顯示詳細明細

### 技能升級費用（`upgradeSkill`）
升至第 N 級費 N 技能點：Lv1=1點、Lv2=2點、Lv3=3點、Lv4=4點、Lv5=5點。

---

## 組合效果（COMBOS）（v0.34.0 調整）

| key | 觸發條件 | 效果 |
|-----|----------|------|
| `comboCrabPoison` | 毒刺Lv3 + 擁有毒囊（任意等級） | 毒傷翻倍 |
| `comboCrabGloves` | 蟹鉗Lv3 + 搏擊拳套Lv3 | 流血傷害翻倍；命中施加 `healReduction=0.5` |
| `comboShellArmor` | 龜殼Lv3 + 刺甲Lv3 | 反彈傷害翻倍 |
| `comboBrainEye` | 大腦Lv3 + 真視之眼Lv3 | 念力波可觸發暴擊 |
| `comboSkinRegen` | 厚皮Lv3 + 超自然回復Lv3 | 回復+1HP，間隔-1秒 |
| `comboEyeFang` | 真視之眼Lv3 + 獠牙Lv3 | 暴擊附加暈眩 |

`checkComboEffects()` 對 `comboCrabPoison` 採用特殊邏輯（`hasLv3('poisonStinger') && hasOrgan('poisonSac')`），其餘組合統一用 `combo.ids.every(id => hasLv3(id))`。

`healReduction`：`combat.js` `playerAttack()` 在 `comboCrabGloves` 觸發時對命中目標設定 `c.healReduction = 0.5`，作為未來回復機制的前置 debuff。

---

## 變異器官系統（v0.39.0）

### 儲存
- localStorage key：`mutationData`（獨立，不受 SAVE_VERSION 清除）
- 結構：`{ levels:{fang/tail/wing/eye}, points, totalPointsEarned, compensationVersion, skillPointsCompensated, hasNewPoints }`

### 四種變異器官
| organId | 圖標 | 名稱           | 效果（Final值）    |
|---------|------|---------------|------------------|
| fang    | 🦷   | 變異-憤怒的獠牙 | 每級+1%攻擊力     |
| tail    | 🐾   | 變異-懦弱的尾巴 | 每級+1%最大HP     |
| wing    | 🪶   | 變異-勇敢的翅膀 | 每級+1%速度       |
| eye     | 👁️   | 變異-好奇的眼睛 | 每級+1%XP倍數     |

### 升級費用
每5級+1費，起始1費：Lv0→1=1點，Lv5→6=2點，Lv10→11=3點
`getMutationUpgradeCost(currentLevel) = Math.floor(currentLevel/5)+1`

### 效果套用
- `applyAllMutationBonuses()`：遊戲初始化一次性套用（在 `applyEvolutionEffects()` 之後）
- `upgradeMutation(organId)`：mid-game 升級使用 delta 比值（新/舊），避免複利誤算
- XP 加成在 `addXP()` 裡動態套用 `mutationXpBonus`

### 獲得方式
- 擊殺巨人化：100%+1，10%額外1~3
- 擊殺Alpha：100%+1，20%額外1~6
- 擊殺殺手化：100%+1，`killerCorpseEaten=N` → N%機率額外1~N（死亡時結算）

### 補償機制
- `MUTATION_COMPENSATION_VERSION` 控制版本（改為 '1' 觸發第一次補償）
- `MUTATION_COMPENSATION_CONFIG` 設定各版本補償比例（mutationPointsRate / skillPointsRate）
- 執行一次後記錄 `compensationVersion` 避免重複
- 呼叫時機：`initMutationData()` 末尾

### UI
- `_initTopLeftUI()` 第三行：⚗️ Lv.X 圖標 + 紅點（`#mutation-icon-row`），`pointer-events:all`，click → `showMutationPanel()`
- `updateUI()` 每幀更新：`#mutation-level-text` 顯示四個器官等級總和，`#mutation-red-dot` 顯示/隱藏
- `showMutationPanel()`：彈出 z-index 120 面板，遊戲暫停（`mutationPanelOpen=true`）
- `isGamePaused()` 和 `_joyPaused()` 均加入 `mutationPanelOpen` 判斷

### 初始化流程
`window.onload` → `initMutationData()` → `applyMutationEffects()` 設定倍率
`initializeGame()` → `applySkillBonuses()` → `applyEvolutionEffects()` → `applyAllMutationBonuses()` 一次性套用

---

## 新手教學系統（v0.43.0 / v0.44.0 / v0.45.0）

- **檔案**：`systems/tutorial.js`（IIFE 模組，掛至 `window`）
- **載入時機**：index.html 中位於 `combat.js` / `organs.js` 之前（v0.45.0 調整，確保兩者可呼叫教學函式）

### 第一階段：移動教學（v0.43.0）

觸發條件：`initializeGame()` 結束後，若 localStorage 無 `tutorialCompleted`，呼叫 `showTutorial()`。

三步驟流程：

| 步驟 | 狀態 | 內容 |
|------|------|------|
| 1 | 凍結（`tutorialOpen = true`） | 全螢幕暗色遮罩 + 玩家白色光圈脈衝 + 歡迎提示框 |
| 2 | 解凍 | 金色光暈 + 閃爍 ↓ 箭頭標記最近果子；紅色虛線引導線（全程顯示）；XP 增加即進入步驟三 |
| 3 | 凍結 | 遮罩重現；日夜指示器金色邊框閃爍；日夜機制與勝利條件說明；按鈕結束並寫入 `localStorage.tutorialCompleted` |

- `gameState.tutorialOpen`：整合至 `isGamePaused()`，教學期間暫停遊戲邏輯

### 教學設定開關（v0.44.0）

`showSettings()` 輔助功能區塊新增「新手教學」開關：
- 開啟（綠色）= 移除 `tutorialCompleted`，下一場觸發教學
- 關閉（灰色）= 寫入 `tutorialCompleted`，教學不再觸發
- 開關狀態即時反映 localStorage 現況

### 第二階段：戰鬥教學（v0.45.0）

觸發條件：玩家第一次升級時（`showOrganSelection()` 偵測到 `tutorialCompleted` 存在且 `tutorialCombatDone` 不存在）

流程：
1. 器官選擇鎖定第一張攻擊器官（`tutorialOrganPhase = true`），其他卡片灰暗禁用
2. 選完後：`spawnTutorialStump()` 在玩家正前方 150px 生成棕色木樁（HP 30）+ 顯示戰鬥提示框
3. 木樁繪製於 `drawGame()` 7c 步驟；`playerAttack()` 將木樁加入攻擊目標
4. 擊殺木樁 → `handleTutorialStumpKill()`：凍結 0.5 秒 → 顯示「⚔️ 攻擊學會了！」（2 秒消失）→ 寫入 `localStorage.tutorialCombatDone`

**新增 gameState 旗標**（均在 `initializeGame()` 重置）：

| 旗標 | 說明 |
|------|------|
| `tutorialOpen` | 教學凍結中（整合至 `isGamePaused()`） |
| `tutorialOrganPhase` | 器官選擇鎖定模式 |
| `tutorialCombatActive` | 戰鬥教學進行中 |
| `tutorialStump` | 教學木樁物件（null 表示不存在） |

**公開函式（掛至 window）**：
- `showTutorial()` — 第一階段入口
- `spawnTutorialStump()` — 生成教學木樁 + 顯示戰鬥提示框
- `handleTutorialStumpKill()` — 木樁死亡處理（清除 → 凍結 → 完成訊息 → 解凍）

---

## 圖鑑系統（v0.31.0 / v0.47.1 擴充）

- **入口**：首頁「📖 圖鑑」按鈕呼叫 `showCompendium('guide')`；遊戲內右上角 `_drawCompendiumBtn()` 呼叫 `showCompendium('organs')`
- **三分頁**：遊戲說明（guide） / 器官圖鑑（organs） / 進化系統（evo）
- **開啟時暫停**：`organSelectionActive = true`，關閉時恢復

### 遊戲說明分頁（v0.47.1 擴充至 5 頁）

| 頁碼 | 內容 |
|------|------|
| 1 | 基本操作（移動/攻擊/設定/果子/目標/自動攻擊） |
| 2 | 器官系統說明 |
| 3 | 進化系統說明 |
| 4 | **Boss 圖鑑**（`_buildBossPage()`）：動態引用 EASY_MAP/NORMAL_MAP bosses，顯示簡單/普通兩套數值、普通技能說明、通用回血、弱點提示 |
| 5 | **難度介紹**（`_buildDifficultyPage()`）：動態引用地圖 config，顯示生物強度倍率、精英/Boss 獎勵、特殊機制開關 |

### buildEvoLevelDesc(pathId, upToLevel)（v0.47.1）

- **位置**：`systems/ui.js`，全域函式，定義於 `showCompendium()` 之前
- 從 `EVOLUTION_PATHS[pathId].levels` 動態計算，`config/evolution.js` 改數值後自動同步
- **草食性**：HP / 果子XP 累計，體型取最新值，行為說明依等級固定文字（撞到不逃跑/被攻擊不逃跑）
- **肉食性**：攻擊/屍體XP/吞噬時間/攻速 取當級固定值（非累計）
- **雜食性**：速度累計，白骨吞噬時間/白骨素 取當級固定值

---

## 版本更新公告系統（v0.42.0）

- **資料檔**：`config/patchnotes.js`，定義全域常數 `PATCH_NOTES`（陣列），最新版本置頂（index 0）
- **欄位格式**：`{ version, date, added[], fixed[], changed[] }`，沒有內容的欄位可省略
- **`showPatchNotes()`**（`systems/ui.js`）：彈出公告面板（z-index 210），左側垂直 Tab 切換版本，右側顯示分類內容；建立 `readInSession` Set 追蹤已讀 Tab，所有未讀版本都點開後才更新 `lastSeenPatchVersion` 並消除紅點（v0.47.1 修復）
- **`checkPatchNotesPopup()`**（`systems/ui.js`）：在 `showStartScreen()` 末尾呼叫；新玩家（無 `hasPlayedBefore`）跳過；有未讀版本（`lastSeenPatchVersion !== PATCH_NOTES[0].version`）時自動 setTimeout 400ms 彈出
- **未讀標記**：比 `lastSeenPatchVersion` 更新的版本在 Tab 列顯示紅點（`#FF4444`，class `pn-tab-dot`）；首頁按鈕紅點 id `patch-red-dot`
- **首頁按鈕**：`#patch-notes-btn`，位置 `top:96px left:20px`（故事書按鈕正下方），點擊呼叫 `showPatchNotes()`

---

## 排行榜系統（systems/leaderboard.js）

### showScoreSubmitPopup — 趣味榜分類維護規則（v0.47.0 起）

`showScoreSubmitPopup()` 內部的 `funCategories` 陣列定義了所有趣味榜分類的查詢邏輯。
**每次新增趣味榜分類，必須同步在 `funCategories` 陣列新增對應項目**，包含：

| 欄位 | 說明 |
|------|------|
| `label` | 顯示名稱（含 emoji） |
| `fetchFn` | 對應的 fetch 函式（接受 `difficulty` 閉包變數） |
| `colName` | Supabase 欄位名稱 |
| `myValue` | 本局對應的數值（不適用時填 `null`） |
| `ascending` | `true` = 越小越好（時間類）；`false` = 越大越好（數量類） |

### Submit 前名次預覽（v0.54.1）

面板開啟時立即並行查詢（`Promise.all`）：
- **一般榜**（`_fetchGeneralRank()`）：與現有記錄逐筆比對 `play_time`，回傳預計名次；`null` 代表斷線
- **趣味榜**（`_fetchFunRanks()`）：遍歷 `funCategories`，僅顯示排進 TOP3 的分類；查詢失敗靜默跳過
- 結果顯示在輸入框**上方** `rankPreview` 區塊；斷線時顯示紅色連線異常提示

---

## 角色系統（v0.56.0）

### 角色定義
- 位置：`config/characters.js`，`CHARACTERS` 常數
- 欄位：`id, name, nameEn, icon, color, unlocked, stats, startOrgans, startEvolution, specialSkill, isRanged`
- `gameState.selectedCharacter`：當前選擇的角色 id（預設 `'koel'`）；由 `showMapSelect` 寫入，`initializeGame` 套用

### 現有角色
| id | 名稱 | 外觀 | 特色 |
|---|---|---|---|
| koel | 噪鵑 | 紅色圓形 | 現有玩家，F 技閃現 |
| archerfish | 阿奇爾 | 藍色三角形（左右翻轉） | 遠程攻擊，F 技衝刺，水中+50% 速度 |

### 角色選擇 UI
- 時機：難度選擇後、`initializeGame()` 前
- 格子：噪鵑/阿奇爾可選，「？即將推出🔒」不可選
- 樣式：選中黃色邊框，鎖定灰色
- 實作：`systems/ui.js` `showMapSelect()`

---

## 阿奇爾攻擊系統（v0.56.0）

### Reload 充能
- 不攻擊時每 1.0 秒（受攻速影響）+1 格，上限 3 格
- 任何攻擊發出後：計時器重置，消耗 1 格
- `player.reloadCharges`（0~3）、`player.reloadTimer`（ms）

### 子彈系統
- `gameState.projectiles[]`：`{ x, y, vx, vy, damage, maxRange, distTraveled, radius:5, ownerId:'player', hasCrit }`
- 速度 9px/幀，超出 `attackRange × 1.2` 消失
- `updateProjectiles()` 每幀呼叫
- 命中判定：`_checkProjectileHit()`，命中後子彈消失
- 含嘴器減速、鯊魚嗅葉傷害加成、Debuff StartTime 記錄

### 攻擊目標選擇（`_findArcherAutoTarget`）
- P1：移動方向 ±45° 扇形 + 攻擊範圍內 → 最近目標（迎面優先）
- P2：無 P1 目標 → 全場最近目標
- 同時用於視覺鎖定指示（`_drawArcherLockOn`）和實際攻擊，確保一致

### 攻擊模式
- **自動**：P1 → P2 → 空子彈（無目標）
- **手動電腦**：滑鼠方向 + 按住蓄力（最多 3 格），放開發射
- **手動手機**：攻擊區改為方向鈕，拖動決定方向，放手發射

### F 技衝刺（archerfishDash）
- 陸地 +3 速，水中 +5 速，持續 3 秒，冷卻 15 秒
- 衝刺期間撞怪：暈眩 0.5 秒 + 附加攻擊傷害（不重複暈眩）
- `player.archerDashActive` / `archerDashEnd` / `archerDashSpeed`

---

## 韌性屬性（v0.56.0）
- `player.tenacity`（0~1），由魚鱗器官累計提供（Lv1=5%/Lv2=15%/Lv3=30%）
- `applyTenacity(durationMs, target)`：回傳 `durationMs × (1 - target.tenacity)`
- 適用所有控制效果持續時間（暈眩/硬控/減速），**不影響減速幅度**
- 位置：`systems/utils.js`

---

## 視野縮放（v0.58.0，重構自 v0.56.0 手機視野縮放）
- `gameState.cameraZoom`（預設 1.0，桌機與手機均生效）
- `gameState.settings.cameraZoomLevel`（1~10，決定 baseZoom；公式：`baseZoom = level/10 * 0.4 + 0.6`）
- `gameState.settings.cameraMode`（`'smart'` 體型自動縮放 / `'manual'` 固定 baseZoom）
- 智能模式公式：`cameraZoom = max(0.3, baseZoom - increaseRatio * 0.25)`
- `worldToScreen()` / `drawTerrain()`：zoom 條件移除 `isMobile` 限制，統一使用 `cameraZoom`
- `_updateCameraZoom()` 每幀呼叫（`updateGameLogic` 內）

---

## Boss 血條 Debuff 圖示（v0.56.0）
- `_drawBossDebuffIcons(boss, barX, barY, barW)` — 在 `drawBoss()` 血條後呼叫
- 顏色：毒傷 `#33FF66` / 流血 `#FF4444` / 減速 `#4488FF` / 暈眩 `#FFE533`
- 每個圖示：深色背景方塊 + 彩色邊框 + 縮寫標籤 + 逆時針剩餘時間弧
- 需記錄 Debuff 施加時間：`boss._poisonStartTime` / `_bleedStartTime` / `_slowStartTime` / `_stunStartTime`
- **施加 Debuff 時務必同步記錄 StartTime**（combat.js / player.js 所有施加點）

---

## CC 效果開發規範（v0.56.0）

> **每次在程式中新增控制效果（暈眩/減速/硬控），必須確認以下所有位置都有套用：**

| 位置 | 說明 |
|------|------|
| `updateNeutralCreatures` | 中立生物移動路徑 |
| `updateHostileCreatures` | 敵意生物移動路徑 |
| `updateEliteCreature` (`elite.js`) | 精英怪移動路徑 |
| `updateBoss` (`boss.js`) | Boss 移動路徑 |

- 暈眩：各更新函式開頭的 `stunnedUntil` 檢查（4 個位置）
- 減速：各移動呼叫改用 `_effSpeed(c)` 或在 `chaseSpeed`/`wanderSpeed` 後乘以 `_slowMult`
- 新 CC 類型：依上述規範在 4 個位置同步實作

---

## 重要設計注意事項

### handleEliteKill 執行順序（v0.15.2 修復）
`showHiddenOrganSelection()` **必須在** `addXP()` 之前呼叫，否則器官選擇與升級界面會疊層。

### showHiddenOrganSelection closeOverlay 順序（v0.15.3 修復）
`gameState.organSelectionActive = false` **必須在** `showOrganSelection()` 之前設定，
否則選擇隱藏器官後關閉 overlay 時遊戲會短暫恢復。

### 全域函式作用域
本專案**不使用 ES Modules**，所有函式皆為全域作用域，可跨檔案直接呼叫。

### script 標籤位置
所有 `<script src>` 標籤置於 `<body>` **末端**（非 `<head>`），確保 canvas/DOM 已就緒。
