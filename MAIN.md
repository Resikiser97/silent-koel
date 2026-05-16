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
systems/utils.js          drawArrow, drawHealthBar, drawNameTag, drawGlowEffect
systems/audio.js          AudioManager, initAudio
systems/camera.js         wrappedDistance, wrappedDelta, worldToScreen, updateCamera, getBiome, getBgColor
systems/input.js          handleKeyDown, handleKeyUp（含設定介面按鍵 handler refs）
systems/spawning.js       generateTrees, spawnFruitFromTree, spawnFruit, spawnNeutralCreatures
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
systems/elite.js          spawnEliteCreature, updateEliteCreature, drawEliteCreature, drawEliteArrow
systems/boss.js           spawnBoss, updateBoss, showVictory, drawBossArrow
systems/daynight.js       getDayNightPhaseIndex, applyNightTransition, applyDayTransition
                          updateDayNightCycle, showGameOver
systems/ui.js             showTooltip, hideTooltip, drawGame, updateUI, drawTreasures
                          loadSettings, switchLanguage, saveSettings, showSettings, hideSettings
                          updateTimer, toggleDevMode, dev* 函式
                          showGuide, hideGuide, showStartScreen

main.js                   isGamePaused, gameLoop, initializeGame, window.onload
```

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
