## v0.1.13.1

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
| `main.js` | ESM 入口：gameLoop、initializeGame、pausePlayTimer/resumePlayTimer |
| `lang.js` | LANG 字典、applyLanguage()、t() 翻譯函式 |

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

### lang/
| 檔案 | 職責 |
|------|------|
| `zh-TW.js` | 繁體中文語言包 |
| `en.js` | 英文語言包（fallback） |

### systems/
| 檔案 | 職責 |
|------|------|
| `gameState.js` | DEFAULT_SETTINGS、gameState 物件、canvas/ctx export |
| `map.js` | 地形生成、biome 系統、drawTerrain |
| `utils.js` | 繪製工具：drawArrow、drawHealthBar、drawNameTag、drawGlowEffect、spawnLootCircle |
| `audio.js` | AudioManager、initAudio、preloadAllSfxBuffers |
| `camera.js` | worldToScreen、updateCamera、wrappedDistance、wrappedDelta |
| `input.js` | handleKeyDown、handleKeyUp、_updateMouseWorld |
| `spawning.js` | 生物/果子/樹木生成邏輯、moveCreature |
| `player.js` | 玩家移動、碰撞、XP、addXP、攻擊（含阿奇爾射水） |
| `combat.js` | playerAttack、applyDamageToPlayer、handleKill、浮動文字、白骨系統、毒傷疊加（poisonStacks） |
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
| `chat.js` | 聊天室、帳號登入、Realtime、GM 指令 |
| `leaderboard.js` | 排行榜面板、分數提交 |
| `mobile.js` | 裝置偵測、搖桿、攻擊區、觸控疊加層 |

### map/
| 檔案 | 職責 |
|------|------|
| `easymap.js` | EASY_MAP 配置 |
| `normalmap.js` | NORMAL_MAP 配置 |
| `hardmap.js` | HARD_MAP 配置 |

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
  ├─ systems/map.js
  ├─ systems/utils.js
  ├─ systems/audio.js
  ├─ systems/camera.js
  ├─ systems/input.js
  ├─ systems/spawning.js
  ├─ systems/player.js  ─┐
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
- `getDayNightPhaseIndex()` 依剩餘時間決定當前階段（phases 定義在 config）
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

### 循環依賴（待 Stage F 處理）

以下為確認存在的循環依賴，JavaScript ESM 允許執行但有初始化順序風險：

```
player.js  ──imports──▶  combat.js
   ▲                         │
   └─────────imports──────────┘
   (applyDamageToPlayer,       (addXP, showXPPopup,
    handleKill, showFloatingText) _archerAttack)

player.js  ──imports──▶  organs.js
   ▲                         │
   └─────────imports──────────┘
   (handleEliteKill,           (addXP, showXPPopup)
    applyOrganEffects)

organs.js  ──imports──▶  main.js
   (resumePlayTimer,           ← main.js 是整個 import 樹頂層
    pausePlayTimer)             嚴重循環，是最需要解決的項目
```

**影響範圍**：player ↔ combat ↔ organs ↔ main 形成一個大循環叢。  
**處理計畫**：Stage F — 將共用函式抽離至獨立模組，打破循環。

### 不一致模式
- `hud.js` 同時負責 Canvas 渲染（`drawGame`）和 HTML overlay 更新（`updateUI`），職責混合
- `combat.js` 的 `showFloatingText` 與 canvas batch 系統耦合，需要 hud.js 才能完整運作

### Dead code（已清理 v0.1.13.0）
- `systems/combat.js`：`addMutationPoints` stub 已移除，改為正式呼叫 mutation.js
- `systems/hud.js`：`console.log && false` dead code 已移除
- `systems/creatures.js`：`_drawDirectionArrow()` 測試函式已移除

*最後更新：v0.1.11.0，由 CC 代碼掃描產出*
