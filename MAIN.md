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
systems/map.js            MAP_WIDTH/HEIGHT/VIEW_W/VIEW_H, TILE_SIZE, NOISE_SCALE, BIOME_COLOR
                          getBiome, getBgColor, generateTerrain, buildTerrainCanvas, drawTerrain
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
systems/combat.js         showFloatingText, applyDamageToPlayer, handleKill, playerAttack
                          updateStatusEffects, updateCorpseEating, drawCorpseEatingBars
systems/organs.js         getOrganLevel, getOrganCumulative, getComboHint, checkComboEffects
                          getOrganSlotsUsed, applyHiddenOrganEffects, applyOrganEffects
                          checkOrganUpgrade, showOrganSelection, drawOrganUI
                          handleEliteKill, showHiddenOrganSelection
systems/evolution.js      checkEvolutionUnlock, applyEvolutionLevelEffect, applyEvolutionEffects
                          applySkillBonuses, saveLastRunOrgans, showSkillTree
                          buildSkillTreeOverlay, upgradeSkill
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

`generateTerrain()` 讀取 `gameState.currentMap.terrain` 參數（noiseScale / forestCenterRadius / forestThreshold / oceanThreshold），`currentMap` 由 `showMapSelect()` 在開始遊戲時寫入。

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
