# The Silent Koel — 模組架構說明

## 載入順序（index.html `<body>` 末端）

```
config/gameConfig.js      GAME_INFO, GAME_TIMING, AUDIO_FILES
config/organs.js          ORGANS, HIDDEN_ORGANS, COMBOS
config/creatures.js       CREATURE_CONFIG, ELITE_CONFIG, BOSS_CONFIG
config/evolution.js       EVOLUTION_PATHS, SKILLS

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
systems/audio.js          AudioManager, initAudio
systems/camera.js         wrappedDistance, wrappedDelta, worldToScreen, updateCamera
systems/input.js          handleKeyDown, handleKeyUp（含設定介面按鍵 handler refs）
systems/spawning.js       spawnFruitFromTree, spawnFruit, spawnNeutralCreatures
                          moveCreature, spawnHostileCreatures, spawnTreasure
                          spawnCreatureAtEdge, updateCreatureSpawning
systems/player.js         updatePlayerMovement, checkFruitCollision, updateTreeFruitProduction
                          showXPPopup, checkTreasureCollision, updatePassiveOrgans
                          checkXPMilestone, addXP, checkLevelUp
                          findBestPerceptionPath
systems/combat.js         showFloatingText, applyDamageToPlayer, handleKill, playerAttack
                          updateStatusEffects, updateCorpseEating, drawCorpseEatingBars
                          updateBoneEating, _addBoneMaterial, _checkPoisonSacUpgrade
                          _spawnBone, drawBones
systems/organs.js         getOrganLevel, getOrganCumulative, getComboHint, checkComboEffects
                          getOrganSlotsUsed, applyHiddenOrganEffects, applyOrganEffects
                          checkOrganUpgrade, showOrganSelection, drawOrganUI
                          handleEliteKill, showHiddenOrganSelection
                          _drawCompendiumBtn（繪製 📖 按鈕，設定 _compendiumBtnRegion）
systems/evolution.js      checkEvolutionUnlock, applyEvolutionLevelEffect, applyEvolutionEffects
                          applySkillBonuses, saveLastRunOrgans, showSkillTree
                          buildSkillTreeOverlay, upgradeSkill
                          _grantPoisonSac（雜食性 Lv1 時自動授予毒囊器官）
systems/creatures.js      updateNeutralCreatures, drawNeutralCreatures
                          updateHostileCreatures, drawCorpses, drawHostileCreatures
systems/elite.js          spawnEliteCreature, updateEliteCreature, drawEliteCreature
                          （箭頭繪製改用 systems/utils.js 的 drawArrow）
systems/boss.js           spawnBoss, updateBoss, showVictory
                          （箭頭繪製改用 systems/utils.js 的 drawArrow）
systems/daynight.js       getDayNightPhaseIndex, applyNightTransition, applyDayTransition
                          updateDayNightCycle, showGameOver
systems/ui.js             showTooltip, hideTooltip, drawGame, updateUI, drawTreasures
                          showMapSelect
                          loadSettings, switchLanguage, saveSettings, showSettings, hideSettings
                          updateTimer, toggleDevMode, dev* 函式
                          showGuide, hideGuide, showStartScreen
                          showCompendium（三分頁圖鑑：遊戲說明/器官/進化，暫停遊戲）
                          detectMobile, getOrientation, applyDeviceMode, _applyMobileScale
                          _updateOrientationBar, _updateJoystickCanvas, _renderMobileOverlay
                          _attachJoystickListeners, _detachJoystickListeners

main.js                   isGamePaused, gameLoop, initializeGame, window.onload
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
  - 縮放比例由 `MOBILE_GAME_SCALE`（預設 0.7）控制，定義在 `_applyMobileScale()` 上方
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
