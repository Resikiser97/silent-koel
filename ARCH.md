## v0.1.25.0

# ARCH — 架構說明（代碼優先文件）

> 此文件描述遊戲實際運作，以代碼為準。發現描述與代碼不符時，修正本文件。
> 基準：v0.1.11.0 代碼掃描

---

## 1. 專案概述

純 HTML5 Canvas 2D 生存遊戲「只叫不吃的噪鵑」，無框架，使用 ES Modules（ESM）組織代碼，單一入口 `main.js`。

---

## 2. 模組清單

### 根目錄
| 檔案 | 職責 |
|------|------|
| `index.html` | HTML 結構、CSS、唯一 `<script type="module" src="./main.js">` |
| `main.js` | ESM 入口：gameLoop、initializeGame、startGameWithLoading、startGame event listener；re-export pausePlayTimer/resumePlayTimer |
| `lang.js` | LANG 字典、applyLanguage()、t() 翻譯函式 |
| `vite.config.js` | Vite 打包設定，輸出 `dist/` 與單一入口 bundle |

### scripts/
| 檔案 | 職責 |
|------|------|
| `copy-sounds.js` | `npm run build` 後複製 `sounds/` 到 `dist/sounds/` |
| `pack-itch.js` | 將 `dist/` 打包為 `silent-koel-itch.zip` 供 itch.io 上傳 |

### config/
| 檔案 | 職責 |
|------|------|
| `gameConfig.js` | GAME_INFO（版本號）、GAME_TIMING、AUDIO_FILES、FIXED_DELTA |
| `characters.js` | CHARACTERS 角色定義常數 |
| `organs.js` | ORGANS（15種）、HIDDEN_ORGANS（4種）、COMBOS、poisonSac |
| `creatures.js` | CREATURE_CONFIG、ELITE_CONFIG、BOSS_CONFIG |
| `evolution.js` | EVOLUTION_PATHS（各路線 Lv1~5）、SKILLS（9種）、COMBOS（5種） |
| `patchnotes.js` | PATCH_NOTES 陣列，最新版本置頂 |
| `supabase.js` | Supabase API（排行榜、雲端存檔） |
| `compendium_data.js` | COMPENDIUM_DATA 圖鑑資料 |
| `achievements.js` | ACHIEVEMENTS 陣列（36 個成就定義，v0.1.22.0；16 個新增 condition 欄位，v0.1.24.4） |
| `combatConfig.js` | COMBAT_CONFIG（攻擊間隔公式基底，v0.1.24.4） |
| `mutationConfig.js` | MUTATION_CONFIG（技能點換變異點常數，v0.1.25.0） |
| `attributes.js` | ATTRIBUTES 陣列（5 個屬性純資料，Attribute Design v1，v0.1.22.0） |
| `playerStatsFormula.js` | `calcPlayerStats(charId, skills, organs, hiddenOrgans, mutationLevels)` → 10 屬性快照；純資料模組，不依賴任何 systems/，只 import characters.js / organs.js / evolution.js；詳見 docs/PLAYER_STATS_FORMULA.md（v0.1.23.1） |

### lang/
| 檔案 | 職責 |
|------|------|
| `zh-TW.js` | 繁體中文語言包 |
| `en.js` | 英文語言包（fallback） |

### storage/
| 檔案 | 職責 |
|------|------|
| `index.js` | localStorage key 常數、動態 key 產生器、字串/JSON 讀寫 helper |

### stats/
| 檔案 | 職責 |
|------|------|
| `index.js` | sessionStats 統一讀寫入口：reset/get/increment/max 統計 |

### systems/
| 檔案 | 職責 |
|------|------|
| `gameState.js` | DEFAULT_SETTINGS、gameState 物件、canvas/ctx export |
| `gameFlow.js` | pausePlayTimer / resumePlayTimer；Stage F 批次 1 從 main.js 抽出，供 boss/organs/evolution/tutorial 使用 |
| `map.js` | 地形生成、biome 系統、drawTerrain |
| `utils.js` | 繪製工具：drawArrow、drawHealthBar、drawNameTag、drawGlowEffect、spawnLootCircle |
| `audio.js` | AudioManager、initAudio、preloadAllSfxBuffers |
| `camera.js` | worldToScreen、updateCamera、wrappedDistance、wrappedDelta |
| `input.js` | handleKeyDown、handleKeyUp、_updateMouseWorld |
| `spawning.js` | 生物/果子/樹木生成邏輯、moveCreature |
| `player.js` | 玩家移動、碰撞、攻擊（含阿奇爾射水）、Boss 死亡事件 dispatch |
| `feedback.js` | showFloatingText（Canvas 浮動文字）、showXPPopup（從 combat.js / player.js 抽出，v0.1.20.0） |
| `reward.js` | addXP、checkLevelUp（升級 dispatch CustomEvent('levelUp')）（從 player.js 抽出，v0.1.20.1） |
| `loot.js` | _spawnBone（push 白骨到 gameState.bones）（從 combat.js 抽出，v0.1.20.1） |
| `damage.js` | applyDamageToPlayer、handleKill、handleGiantKill（從 combat.js 抽出，v0.1.21.0） |
| `combat.js` | playerAttack、updateStatusEffects、白骨系統、毒傷疊加（poisonStacks）（傷害/擊殺服務已移至 damage.js） |
| `organs.js` | 器官選擇、handleEliteKill、applyOrganEffects |
| `evolution.js` | 技能樹、進化效果、buildSkillTreeOverlay |
| `mutation.js` | 變異系統（跨局永久保留） |
| `creatures.js` | updateNeutralCreatures、updateHostileCreatures、Alpha/巨人系統 |
| `elite.js` | spawnEliteCreature、updateEliteCreature、毒霧隼雙技能系統 |
| `boss.js` | spawnBoss、updateBoss、黑色獵人多管血條 |
| `daynight.js` | getDayNightPhaseIndex、updateDayNightCycle |
| `hud.js` | drawGame 主渲染、updateUI、小地圖、Boss 血條 UI |
| `ui.js` | 面板系統、showSettings、showCompendium、showPatchNotes |
| `tutorial.js` | 新手教學、spawnTutorialStump |
| `chat.js` | 聊天室、帳號登入、Realtime、GM 指令（username 小寫正規化 + GOBLINNEST 過濾，v0.1.22.0） |
| `achievements.js` | 成就系統讀寫入口：unlockAchievement / isUnlocked / getUnlockedAchievements / getActiveTitle / setActiveTitle（v0.1.22.0） |
| `achievementTriggers.js` | Phase D 成就觸發接入：`initAchievementTriggers()` 監聽 20+ 個 CustomEvent（gameVictory / levelUp / killCountUpdated 等），呼叫 unlockAchievement(id)；架構原則：不 import 任何 SCC 模組（v0.1.23.0） |
| `achievementBonus.js` | 成就永久加成：`getAchievementBonusTotals(unlockedIds)` / `applyAchievementStatBonuses()`；純資料聚合 + runtime 套用，不依賴 SCC 模組（v0.1.25.0） |
| `leaderboard.js` | 排行榜面板、分數提交 |
| `mobile.js` | 裝置偵測、搖桿、攻擊區、觸控疊加層 |

### map/
| 檔案 | 職責 |
|------|------|
| `easymap.js` | EASY_MAP 配置 |
| `normalmap.js` | NORMAL_MAP 配置 |
| `hardmap.js` | HARD_MAP 配置 |

### tests/
| 檔案 | 職責 |
|------|------|
| `tests/config/creatures.test.js` | 生物 config 測試 |
| `tests/config/gameConfig.test.js` | GAME_INFO / GAME_TIMING 等核心 config 測試 |
| `tests/config/organs.test.js` | 器官 config 測試 |
| `tests/helpers/mockCanvas.js` | 測試用 canvas mock |
| `tests/helpers/mockGameState.js` | 測試用 gameState mock |
| `tests/helpers/mockStorage.js` | 測試用 localStorage mock |
| `tests/performance/perf-baseline.test.js` | 效能 baseline 測試 |
| `tests/stats/stats.test.js` | stats/index.js sessionStats 測試 |
| `tests/storage/storage.test.js` | storage/index.js localStorage helper 測試 |
| `tests/systems/camera.test.js` | camera 系統測試 |
| `tests/systems/hud-font.test.js` | HUD 字體與顯示測試 |
| `tests/systems/map.test.js` | map 系統測試 |
| `tests/systems/daynight.test.js` | daynight.js 純函式測試（getDayNightPhaseIndex） |
| `tests/systems/creatures.test.js` | creatures.js 純函式測試（_effSpeed、_shouldFleeFromGiant、_getHyenaPackBonus、_hyenaWheelPosition） |
| `tests/systems/audio.test.js` | audio.js 純函式測試（_mobileFadeScale、_playSfxBuffer） |
| `tests/systems/damage.test.js` | damage/combat 回歸測試（handleKill、CustomEvent dispatch、玩家受傷、ranged callback） |

---

## 3. ESM 結構

### 入口
```
index.html
  └─ <script type="module" src="./main.js">
       └─ main.js  ← 所有系統的頂層 import 點
```

### main.js 主要 import 鏈
```
main.js
  ├─ config/gameConfig.js
  ├─ config/characters.js, organs.js, evolution.js, patchnotes.js, compendium_data.js
  ├─ lang.js → lang/zh-TW.js, lang/en.js
  ├─ map/easymap.js, normalmap.js, hardmap.js
  ├─ systems/gameState.js
  ├─ systems/gameFlow.js
  ├─ systems/map.js
  ├─ systems/utils.js
  ├─ systems/audio.js
  ├─ systems/camera.js
  ├─ systems/input.js
  ├─ systems/spawning.js
  ├─ systems/player.js  ─┐
  ├─ systems/feedback.js
  ├─ systems/reward.js
  ├─ systems/loot.js
  ├─ systems/combat.js  ─┤← 循環依賴叢（見第 6 節）
  ├─ systems/organs.js  ─┘
  ├─ systems/evolution.js
  ├─ systems/mutation.js
  ├─ systems/creatures.js
  ├─ systems/elite.js
  ├─ systems/boss.js
  ├─ systems/daynight.js
  ├─ systems/hud.js
  ├─ systems/ui.js
  ├─ systems/tutorial.js
  ├─ systems/chat.js
  ├─ systems/achievements.js
  ├─ systems/achievementTriggers.js
  ├─ systems/leaderboard.js
  └─ systems/mobile.js
```

---

## 4. gameState 頂層結構

定義於 `systems/gameState.js`，以 `export const gameState = { ... }` 匯出。

| 欄位 | 類型 | 用途 |
|------|------|------|
| `canvasWidth / canvasHeight` | number | 邏輯解析度（桌機 1600×900） |
| `player` | object | 玩家完整狀態（位置、器官、進化、技能、阿奇爾專用欄位等） |
| `trees / fruits / treasures` | array | 地圖物件 |
| `neutralCreatures / hostileCreatures / corpses / bones` | array | 生物 |
| `projectiles` | array | 子彈（阿奇爾射水） |
| `floatTexts` | array | Canvas 批次浮動文字 |
| `brainShockwaves` | array | 腦器官衝擊波 |
| `stats` | object | hpMax / hpCurrent / xpCurrent / timeStatus / dayCycle |
| `keys` | object | WASD 鍵盤狀態 |
| `boss / bossSpawned / bossBellPlayed` | mixed | Boss 狀態 |
| `eliteCreature / eliteOrder / eliteJustKilled` | mixed | 精英怪狀態 |
| `alphaCreature` | object\|null | 當前 Alpha 生物 |
| `camera` | object | 鏡頭世界座標 {x, y} |
| `isNight / currentPhaseIndex` | boolean / number | 日夜週期 |
| `timeRemaining / lastTimeTick` | number | 倒計時（秒） |
| `gameOver / victory / gameStarted` | boolean | 遊戲流程狀態 |
| `isMobile / orientation / forceMode` | mixed | 裝置狀態 |
| `mobileInput` | object | 搖桿方向向量 {dx, dy} |
| `mutationData / mutationSkills / mutationSkillPoints` | mixed | 變異系統（跨局永久） |
| `skillPoints / playerSkills` | mixed | 技能樹 |
| `organSelectionActive / pendingOrganSelections` | boolean / number | 器官選擇狀態 |
| `spawnTimers` | object | 各 biome 生物補充計時器 |
| `settingsOpen / skillTreeOpen / mutationPanelOpen / tutorialOpen` | boolean | UI 面板狀態 |
| `realPlayTime / _playTimerStart / _playTimerPaused` | mixed | 實際遊戲時間計時 |
| `selectedCharacter` | string | 當前角色 ID |
| `cameraZoom` | number | 視野縮放（手機自動調整，桌機固定 1.0） |
| `settings` | object | 使用者設定（複製自 DEFAULT_SETTINGS） |
| `mouseWorld / mouseScreen` | object | 滑鼠世界 / 螢幕座標 |
| `dashEffect` | object\|null | 閃現特效狀態 |
| `mapSeed / terrainMap / fogMap / currentMap` | mixed | 地圖資料 |

---

## 5. 主要系統運作

### Day/Night（daynight.js）
- 每局倒計時 600 秒（`gameState.timeRemaining`）
- `getDayNightPhaseIndex(timeRemaining)` 依剩餘時間決定當前階段（純函式，參數注入）
- `updateDayNightCycle()` 每幀呼叫，觸發 `applyNightTransition / applyDayTransition`

### Elite 系統（elite.js）
- `initEliteOrder()` 開局從 config 決定精英怪出場順序
- `spawnEliteCreature()` 依難度生成對應精英怪
- 毒霧隼雙技能（v0.1.11.0）：毒牆（3000+500ms CD）、毒牙回旋（2500+500ms CD），同時 ready 時毒牆優先
- `_updateEliteVenomPuddle()` 管理毒霧落地 puddle

### Combat 系統（combat.js）
- `playerAttack()` 統一玩家攻擊入口
- `applyDamageToPlayer()` 處理所有對玩家傷害
- `poisonStacks` 毒傷疊加：每層獨立計時，每秒獨立顯示浮動文字，新毒不覆蓋舊毒（v0.1.11.0）
- 白骨系統：`updateBoneEating` / `_addBoneMaterial` / `_spawnBone`
- `showFloatingText()` 推入 `gameState.floatTexts`，由 `hud.js` 批次繪製

### Audio（audio.js）
- `AudioManager` 管理音樂/音效播放
- `preloadAllSfxBuffers()` 啟動時預載全部音效
- `stopIntroTheme() / playIntroTheme()` 首頁背景音樂

### HUD（hud.js）
- `drawGame()` 每幀主渲染（先 canvas 世界，後 HTML overlay）
- `updateUI()` 更新 HTML div overlay
- Boss 血條 UI 重寫（v0.1.11.0）：`drawTopBarUI()` 管理 topBarTarget / topBarFadeTimer
- `drawMinimap()` + `updateMinimapFog()` 小地圖與霧效

### Creature 系統（creatures.js）
- `updateNeutralCreatures()` 三態移動（biome 生物 / 非 biome 舊邏輯），含 Alpha 繼承掃描
- `updateHostileCreatures()` 敵對生物 AI
- 巨人/Alpha（v0.1.10.0）：無隊伍獨立巨人相遇升格 Alpha，每 3 秒掃描
- 鬣狗車輪戰（v0.1.11.0）：三國武將名稱池 + 車輪戰 AI

---

## 6. 已知架構問題

### 循環依賴（Stage F 處理中）

基於 v0.1.20.1 全域 import 重掃（排除 `dist/`、`node_modules/`、`tests/`），上次 1 個 18 檔案大型 SCC 已縮小為 1 個 12 檔案 SCC：

`systems/boss.js`, `systems/chat.js`, `systems/combat.js`, `systems/creatures.js`, `systems/daynight.js`, `systems/elite.js`, `systems/evolution.js`, `systems/leaderboard.js`, `systems/mobile.js`, `systems/organs.js`, `systems/player.js`, `systems/ui.js`

`main.js`、`systems/hud.js`、`systems/input.js`、`systems/mutation.js`、`systems/tutorial.js`、`systems/utils.js` 已不在大型 SCC 內。新建低層模組 `systems/gameFlow.js`、`systems/feedback.js`、`systems/reward.js`、`systems/loot.js` 均未進入任何循環。

#### Stage F 已解除循環

| 編號 | 原循環 | 狀態 |
|------|--------|------|
| #1 | `main.js` ↔ `systems/boss.js` | ✅ 已解除 v0.1.19.0 |
| #2 | `main.js` ↔ `systems/evolution.js` | ✅ 已解除 v0.1.19.0 |
| #3 | `main.js` ↔ `systems/organs.js` | ✅ 已解除 v0.1.19.0 |
| #4 | `main.js` ↔ `systems/tutorial.js` | ✅ 已解除 v0.1.19.0 |
| #5 | `main.js` ↔ `systems/ui.js` | ✅ 已解除 v0.1.19.0 |
| #13 | `systems/combat.js` ↔ `systems/mutation.js` | ✅ 已解除 v0.1.20.0（feedback 側拆出） |
| #14 | `systems/combat.js` ↔ `systems/utils.js` | ✅ 已解除 v0.1.20.1（_spawnBone 改由 loot.js 提供） |
| #11 | `systems/boss.js` ↔ `systems/combat.js` | ✅ 已解除 v0.1.21.0（damage.js 抽出 + bossKilled 事件化） |
| #6 | `systems/combat.js` ↔ `systems/player.js` | ✅ 已解除 v0.1.21.0（damage.js 抽出 + callback injection） |

#### 仍存在或部分存在循環

| 編號 | 原循環 | v0.1.20.1 狀態 | 說明 |
|------|--------|----------------|------|
| #6 | `systems/combat.js` ↔ `systems/player.js` | ✅ 完全解除 v0.1.21.0 | `applyDamageToPlayer`/`handleKill`/`handleGiantKill` 移至 `damage.js`；`_archerAttack` 改 callback injection，直接雙向 import 全消除。 |
| #7 | `systems/organs.js` ↔ `systems/player.js` | ⚠️ 部分仍存在 | `addXP` 側已拆出；`player.js` 仍 import `organs.js`，且兩者仍在同一 SCC，需處理器官效果與玩家狀態耦合。 |
| #8 | `systems/combat.js` ↔ `systems/organs.js` | ⚠️ 部分仍存在 | `organs.js` 已不直接 import `combat.js`，但兩者仍可透過 SCC 互相抵達；戰鬥與器官規則仍耦合。 |
| #9 | `systems/combat.js` ↔ `systems/evolution.js` | ⚠️ 部分仍存在 | 直接雙向 import 已解除，但仍在同一 SCC，透過 boss/organs/ui 等路徑互相抵達。 |
| #10 | `systems/evolution.js` ↔ `systems/organs.js` | ❌ 仍存在 | 兩者仍直接雙向 import，是批次 3 的核心目標之一。 |
| #11 | `systems/boss.js` ↔ `systems/combat.js` | ✅ 完全解除 v0.1.21.0 | `applyDamageToPlayer` 移至 `damage.js`（boss 改 import damage.js）；combat→boss `handleBossKill` 改 dispatch `bossKilled` 事件。 |
| #12 | `systems/boss.js` ↔ `systems/player.js` | ⚠️ 部分仍存在 | 直接雙向 import 已解除，但仍在同一 SCC，透過 combat/mobile/organs 等路徑互相抵達。 |
| #15 | `systems/mobile.js` ↔ `systems/player.js` | ❌ 仍存在 | 仍直接雙向 import，屬低嚴重度輸入/玩家耦合。 |
| #16 | `systems/mobile.js` ↔ `systems/ui.js` | ❌ 仍存在 | 仍直接雙向 import，屬低嚴重度裝置/UI 耦合。 |
| #17 | `systems/evolution.js` ↔ `systems/ui.js` | ❌ 仍存在 | 仍直接雙向 import，技能樹 overlay 與 UI builder 耦合。 |

#### 新模組依賴確認

| 模組 | import 清單 | 循環狀態 |
|------|-------------|----------|
| `systems/gameFlow.js` | `systems/gameState.js` | 無新循環 ✅ |
| `systems/feedback.js` | `systems/camera.js`, `systems/gameState.js`, `systems/map.js` | 無新循環 ✅ |
| `systems/reward.js` | `lang.js`, `systems/audio.js`, `systems/gameState.js` | 無新循環 ✅ |
| `systems/loot.js` | `systems/gameState.js` | 無新循環 ✅ |
| `systems/damage.js` | `systems/gameState.js`, `systems/audio.js`, `systems/feedback.js`, `systems/reward.js`, `stats/index.js`, `systems/utils.js`, `lang.js`, `systems/mutation.js` | 無新循環 ✅（v0.1.21.1 移除 organs.js import，改 dispatch eliteKilled 事件） |

**批次 1 已完成（v0.1.19.0）**：解除 #1~#5，`main.js` 反向依賴全部消失。  
**批次 2 已完成（v0.1.20.0~v0.1.20.1）**：完全解除 #13、#14；#6 等部分解除。  
**批次 3a 已完成（v0.1.21.0）**：完全解除 #11（boss ↔ combat）、#6（combat ↔ player），新建 `damage.js`，bossKilled 事件化，_archerAttack callback 注入。  
**批次 3b / 3c 待處理**：#10（evolution ↔ organs）、#17（evolution ↔ ui）、#15（mobile ↔ player）、#16（mobile ↔ ui）。

### 不一致模式
- `hud.js` 同時負責 Canvas 渲染（`drawGame`）和 HTML overlay 更新（`updateUI`），職責混合

### Dead code（已清理 v0.1.13.0）
- `systems/combat.js`：`addMutationPoints` stub 已移除，改為正式呼叫 mutation.js
- `systems/hud.js`：`console.log && false` dead code 已移除
- `systems/creatures.js`：`_drawDirectionArrow()` 測試函式已移除

*最後更新：v0.1.25.0，成就 Bonus 系統實作；新增 systems/achievementBonus.js、config/mutationConfig.js*
